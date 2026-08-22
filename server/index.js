import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import {
  DIAGNOSE_PROMPT,
  ADVISORY_PROMPT,
  NETWORK_SUMMARY_PROMPT,
} from "./prompts.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed."));
  },
});
const PORT = process.env.PORT || 8080;

// ---------- Multi-Key API Key Pool & Load Balancer ----------
const RAW_KEYS = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY_4,
  process.env.GEMINI_API_KEY_5,
  process.env.GEMINI_API_KEY_6,
  process.env.GEMINI_API_KEY_7,
  process.env.GEMINI_API_KEY_8,
  process.env.GEMINI_API_KEY_9,
  process.env.GEMINI_API_KEY_10,
  ...(process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || "").split(","),
]
  .map((k) => k?.trim())
  .filter(Boolean);
const API_KEYS = RAW_KEYS.length > 0 ? RAW_KEYS : ["placeholder_key_to_prevent_boot_crash"];

if (RAW_KEYS.length === 0) {
  console.warn("WARNING: GEMINI_API_KEY is not set. Add GEMINI_API_KEY or GEMINI_API_KEYS in server/.env.");
} else {
  console.log(`Loaded ${API_KEYS.length} active Gemini API key(s) into the load balancing pool.`);
}

let keyIndex = 0;
function getAIClient() {
  const key = API_KEYS[keyIndex % API_KEYS.length];
  keyIndex = (keyIndex + 1) % API_KEYS.length;
  return new GoogleGenAI({ apiKey: key });
}

const PRIMARY_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";
const FALLBACK_MODELS = [PRIMARY_MODEL, "gemini-2.5-flash", "gemini-1.5-flash"];

async function generateWithFallback(contents, config) {
  let lastError = null;

  // Force JSON output mode — this tells Gemini to constrain decoding to valid JSON
  const jsonConfig = {
    ...config,
    responseMimeType: "application/json",
  };

  // Try across all available API keys in the pool
  for (let keyAttempt = 0; keyAttempt < Math.max(API_KEYS.length, 2); keyAttempt++) {
    const ai = getAIClient();
    for (const modelName of FALLBACK_MODELS) {
      try {
        const res = await ai.models.generateContent({
          model: modelName,
          contents,
          config: jsonConfig,
        });
        return res;
      } catch (err) {
        lastError = err;
        const msg = err.message || "";
        const isRateLimit = err.status === 429 || msg.includes("429") || msg.includes("quota") || msg.includes("EXHAUSTED");

        if (isRateLimit) {
          console.warn(`API Key in pool hit rate limit (429). Rotating to next API key in pool...`);
          break; // Instantly switch to the next API key in the pool!
        }
      }
    }
  }

  throw lastError;
}

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.join(__dirname, "..", "public")));

import { users, networkLog, addUser, addTelemetry } from "./database.js";

function sanitizeUser(user) {
  const { password, ...safe } = user;
  return safe;
}

// Auth endpoints
app.post("/api/auth/register", (req, res) => {
  const { name, identifier, password, role, state } = req.body || {};
  if (!name || !identifier || !password) {
    return res.status(400).json({ error: "Please fill in all required fields (name, email/phone, password)." });
  }

  const existing = users.find((u) => u.identifier.toLowerCase() === identifier.trim().toLowerCase());
  if (existing) {
    return res.status(400).json({ error: "An account with this email or phone number already exists." });
  }

  const newUser = addUser({
    id: `usr_${Date.now()}`,
    name: name.trim(),
    identifier: identifier.trim().toLowerCase(),
    password,
    role: role || "farmer",
    state: state || "",
  });

  res.json({ token: `token_${newUser.id}`, user: sanitizeUser(newUser) });
});

app.post("/api/auth/login", (req, res) => {
  const { identifier, password } = req.body || {};
  if (!identifier || !password) {
    return res.status(400).json({ error: "Please provide email/phone and password." });
  }

  const user = users.find((u) => u.identifier.toLowerCase() === identifier.trim().toLowerCase() && u.password === password);
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials. Check your email/phone and password." });
  }

  res.json({ token: `token_${user.id}`, user: sanitizeUser(user) });
});

function parseJsonResponse(text) {
  if (!text) throw new Error("Empty response from AI model.");

  let raw = String(text).trim();

  // Log first 300 chars of raw response for debugging
  console.log("AI raw response (first 300 chars):", raw.substring(0, 300));

  raw = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "");

  // 1. Try direct parse (works when responseMimeType: "application/json" is active)
  try {
    return JSON.parse(raw);
  } catch (_) {}

  // 2. Balanced brace extraction
  const start = raw.indexOf("{");
  if (start !== -1) {
    let depth = 0;
    let end = -1;
    let inString = false;
    let escape = false;

    for (let i = start; i < raw.length; i++) {
      const char = raw[i];
      if (escape) { escape = false; continue; }
      if (char === "\\") { escape = true; continue; }
      if (char === '"') { inString = !inString; continue; }
      if (!inString) {
        if (char === "{") depth++;
        else if (char === "}") { depth--; if (depth === 0) { end = i; break; } }
      }
    }

    if (end !== -1) {
      const candidate = raw.substring(start, end + 1);
      try { return JSON.parse(candidate); } catch (_) {}
      try { return JSON.parse(candidate.replace(/[\r\n]+/g, " ")); } catch (_) {}
    }
  }

  // 3. Fallback: first { to last }
  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    let candidate = raw.substring(firstBrace, lastBrace + 1).replace(/[\r\n]+/g, " ");
    try { return JSON.parse(candidate); } catch (_) {}
  }

  // 4. Last resort: Gemini returned pure text with no JSON at all.
  //    Wrap it in a minimal valid response so the user still gets something.
  console.warn("WARN: AI returned plain text instead of JSON. Wrapping in fallback structure.");
  return {
    crop: "unclear",
    isHealthy: false,
    disease: "unclear",
    confidence: "low",
    symptoms: raw.substring(0, 500),
    treatment: raw.substring(0, 500),
    prevention: "",
    usable: true,
    // Advisory fields (in case this is an advisory response)
    headline: raw.substring(0, 200),
    cropRecommendation: raw.substring(0, 500),
    weatherNote: "",
    soilNote: "",
    riskFlag: "No immediate risk flagged",
    sustainabilityTip: "",
    // Network fields
    summary: raw.substring(0, 500),
    topConcern: "",
    cooperationSuggestion: "",
  };
}

function hasValidApiKey() {
  return API_KEYS.length > 0 && !API_KEYS[0].includes("placeholder");
}

// ---------- Diagnose tab ----------
app.post("/api/diagnose", upload.single("image"), async (req, res) => {
  try {
    if (!hasValidApiKey()) {
      return res.status(500).json({ error: "Server is missing GEMINI_API_KEY. Add it to server/.env and restart." });
    }
    if (!req.file) return res.status(400).json({ error: "No image uploaded." });

    const base64Image = req.file.buffer.toString("base64");
    const lang = req.body.lang || "en";
    const response = await generateWithFallback(
      [
        {
          role: "user",
          parts: [
            { text: DIAGNOSE_PROMPT(lang) },
            { inlineData: { mimeType: req.file.mimetype, data: base64Image } },
          ],
        },
      ],
      { temperature: 0.1, maxOutputTokens: 1500 }
    );

    const result = parseJsonResponse(response.text);

    // Log into the shared network layer (anonymised - no farmer identity, just crop/disease/location)
    if (result.usable) {
      addTelemetry({
        type: "diagnosis",
        crop: result.crop,
        disease: result.disease,
        isHealthy: result.isHealthy,
        state: req.body.state || "Unknown",
        timestamp: new Date().toISOString(),
      });
    }

    res.json(result);
  } catch (err) {
    console.error("Diagnose error:", err);
    const isRateLimit = err.status === 429 || (err.message && (err.message.includes("429") || err.message.includes("quota") || err.message.includes("EXHAUSTED")));
    const userMsg = isRateLimit
      ? "Gemini API rate limit reached (20 requests/min). Please wait 10 seconds and try again."
      : "Diagnosis failed. Please try again with a clearer photo.";
    res.status(isRateLimit ? 429 : 500).json({ error: userMsg });
  }
});

// ---------- Advisory tab ----------
app.post("/api/advisory", async (req, res) => {
  try {
    if (!hasValidApiKey()) {
      return res.status(500).json({ error: "Server is missing GEMINI_API_KEY. Add it to server/.env and restart." });
    }
    const { crop, soilType, lat, lon, locationLabel, state, lang } = req.body;

    let weatherSummary = null;
    if (lat && lon && process.env.OPENWEATHER_API_KEY) {
      try {
        const wRes = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
        );
        if (wRes.ok) {
          const w = await wRes.json();
          weatherSummary = `${w.weather?.[0]?.description ?? "unknown conditions"}, ${w.main?.temp}°C, humidity ${w.main?.humidity}%, wind ${w.wind?.speed} m/s`;
        }
      } catch (e) {
        console.warn("Weather fetch failed, continuing without it:", e.message);
      }
    }

    const prompt = ADVISORY_PROMPT({
      crop,
      soilType,
      weatherSummary,
      locationLabel: locationLabel || (lat && lon ? `${lat}, ${lon}` : "location not provided"),
      lang: lang || "en",
    });

    const response = await generateWithFallback(
      [{ role: "user", parts: [{ text: prompt }] }],
      { temperature: 0.2, maxOutputTokens: 1200 }
    );

    const result = parseJsonResponse(response.text);
    result.weatherUsed = Boolean(weatherSummary);

    addTelemetry({
      type: "advisory",
      crop: crop || "unspecified",
      state: state || "Unknown",
      riskFlag: result.riskFlag,
      timestamp: new Date().toISOString(),
    });

    res.json(result);
  } catch (err) {
    console.error("Advisory error:", err);
    res.status(500).json({ error: "Could not generate an advisory right now. Please try again." });
  }
});

// ---------- Network tab ----------
app.get("/api/network", async (req, res) => {
  try {
    const lang = req.query.lang || "en";
    const recent = networkLog.slice(-50);

    const byState = {};
    for (const entry of recent) {
      const state = entry.state || "Unknown";
      byState[state] = byState[state] || { diagnoses: 0, diseasesSeen: {}, advisories: 0 };
      if (entry.type === "diagnosis") {
        byState[state].diagnoses += 1;
        if (entry.disease && entry.disease !== "None") {
          byState[state].diseasesSeen[entry.disease] = (byState[state].diseasesSeen[entry.disease] || 0) + 1;
        }
      } else {
        byState[state].advisories += 1;
      }
    }

    let aiSummary = {
      summary: "No network activity logged yet. Submitting real diagnoses and advisories will automatically populate live cross-state telemetry here.",
      topConcern: "No active disease logged",
      cooperationSuggestion: "Run a diagnosis or advisory to start building live agricultural telemetry.",
    };

    if (recent.length > 0 && !hasValidApiKey()) {
      aiSummary = {
        summary: "Server is missing GEMINI_API_KEY, so the AI summary can't be generated right now — showing raw activity by state below instead.",
        topConcern: "Unavailable without an API key",
        cooperationSuggestion: "Unavailable without an API key",
      };
    } else if (recent.length > 0) {
      const prompt = NETWORK_SUMMARY_PROMPT(recent, lang);
      const response = await generateWithFallback(
        [{ role: "user", parts: [{ text: prompt }] }],
        { temperature: 0.2, maxOutputTokens: 500 }
      );
      aiSummary = parseJsonResponse(response.text);
    }

    res.json({ byState, recentCount: recent.length, aiSummary });
  } catch (err) {
    console.error("Network error:", err);
    res.status(500).json({ error: "Could not load network data right now." });
  }
});

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Serve the frontend for any non-API route (keeps this a single deployable unit)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

// Catches multer errors (bad file type, too large) so the client gets a clean
// JSON error instead of an unhandled exception / raw HTML error page.
app.use((err, req, res, next) => {
  if (err) {
    console.error("Request error:", err.message);
    return res.status(400).json({ error: err.message || "Something went wrong with your request." });
  }
  next();
});

app.listen(PORT, () => {
  console.log(`FieldSense server running on port ${PORT}`);
});
