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

if (!process.env.GEMINI_API_KEY) {
  console.warn("WARNING: GEMINI_API_KEY is not set. Add GEMINI_API_KEY in server/.env or Render environment variables.");
}

// Fallback placeholder prevents server boot crash if env var is missing during container deployment
const apiKey = process.env.GEMINI_API_KEY || "placeholder_key_to_prevent_boot_crash";
const ai = new GoogleGenAI({ apiKey });
const PRIMARY_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";
const FALLBACK_MODELS = [PRIMARY_MODEL, "gemini-2.5-flash", "gemini-1.5-flash"];

async function generateWithFallback(contents, config) {
  let lastError = null;

  for (let attempt = 0; attempt < 3; attempt++) {
    for (const modelName of FALLBACK_MODELS) {
      try {
        const res = await ai.models.generateContent({
          model: modelName,
          contents,
          config,
        });
        return res;
      } catch (err) {
        lastError = err;
        const msg = err.message || "";
        const isRateLimit = err.status === 429 || msg.includes("429") || msg.includes("quota") || msg.includes("EXHAUSTED");

        if (isRateLimit) {
          console.warn(`Gemini API 429 Rate limit hit on ${modelName} (attempt ${attempt + 1}/3). Retrying in 2.5 seconds...`);
          await new Promise((r) => setTimeout(r, 2500));
          break;
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
  // Defensive extraction: find first '{' and last '}' to handle fences or stray LLM commentary
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    return JSON.parse(text.substring(start, end + 1));
  }
  const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "");
  return JSON.parse(cleaned);
}

// ---------- Diagnose tab ----------
app.post("/api/diagnose", upload.single("image"), async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
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
      { temperature: 0.1, maxOutputTokens: 600 }
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
    if (!process.env.GEMINI_API_KEY) {
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
      { temperature: 0.2, maxOutputTokens: 500 }
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

    if (recent.length > 0 && !process.env.GEMINI_API_KEY) {
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
