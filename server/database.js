import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, "data.json");

function loadDb() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf8");
      const parsed = JSON.parse(raw);
      return {
        users: Array.isArray(parsed.users) ? parsed.users : [],
        networkLog: Array.isArray(parsed.networkLog) ? parsed.networkLog : [],
      };
    }
  } catch (e) {
    console.warn("Could not load data.json, initializing fresh store:", e.message);
  }
  return {
    users: [],
    networkLog: [],
  };
}

const db = loadDb();
export const users = db.users;
export const networkLog = db.networkLog;

export function saveDb() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ users, networkLog }, null, 2), "utf8");
  } catch (e) {
    console.warn("Could not write to data.json (ephemeral storage):", e.message);
  }
}

// Write initial local file if missing
if (!fs.existsSync(DATA_FILE)) {
  saveDb();
}

/**
 * Syncs user registrations to Google Cloud Firestore (NoSQL DBMS) safely
 */
async function syncUserToFirestore(user) {
  const projectId = process.env.FIRESTORE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!projectId || !apiKey) return;

  try {
    const fetchFn = globalThis.fetch;
    if (typeof fetchFn !== "function") return;

    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${user.id}?key=${apiKey}`;
    await fetchFn(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: {
          id: { stringValue: user.id },
          name: { stringValue: user.name || "" },
          identifier: { stringValue: user.identifier || "" },
          role: { stringValue: user.role || "farmer" },
          state: { stringValue: user.state || "" },
          createdAt: { stringValue: new Date().toISOString() },
        },
      }),
    });
  } catch (e) {
    console.warn("Firestore user sync notice:", e.message);
  }
}

/**
 * Syncs crop health telemetry to Google Cloud Firestore (NoSQL DBMS) safely
 */
async function syncTelemetryToFirestore(entry) {
  const projectId = process.env.FIRESTORE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!projectId || !apiKey) return;

  try {
    const fetchFn = globalThis.fetch;
    if (typeof fetchFn !== "function") return;

    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/telemetry?key=${apiKey}`;
    await fetchFn(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: {
          type: { stringValue: entry.type || "diagnosis" },
          crop: { stringValue: entry.crop || "unspecified" },
          disease: { stringValue: entry.disease || "None" },
          isHealthy: { booleanValue: Boolean(entry.isHealthy) },
          state: { stringValue: entry.state || "Unknown" },
          timestamp: { stringValue: entry.timestamp || new Date().toISOString() },
        },
      }),
    });
  } catch (e) {
    console.warn("Firestore telemetry sync notice:", e.message);
  }
}

export function addUser(newUser) {
  users.push(newUser);
  saveDb();
  syncUserToFirestore(newUser).catch(() => {});
  return newUser;
}

export function addTelemetry(entry) {
  networkLog.push(entry);
  saveDb();
  syncTelemetryToFirestore(entry).catch(() => {});
  return entr