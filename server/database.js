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
    users: [
      { id: "usr_1", name: "Dharani Dharan", identifier: "farmer@fieldsense.org", password: "password123", role: "farmer", state: "Tamil Nadu" },
      { id: "usr_2", name: "Dr. K. Anbarasan", identifier: "officer@tnagri.gov.in", password: "password123", role: "officer", state: "Tamil Nadu" },
    ],
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
    console.warn("Could not write to data.json:", e.message);
  }
}

export function addUser(newUser) {
  users.push(newUser);
  saveDb();
  return newUser;
}

export function addTelemetry(entry) {
  networkLog.push(entry);
  saveDb();
  return entry;
}
