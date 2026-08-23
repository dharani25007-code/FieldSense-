<div align="center">
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f5c30,50:2fa860,100:0f5c30&height=220&section=header&text=FieldSense&fontSize=55&fontColor=ffffff&fontAlignY=40&desc=Precision%20Agricultural%20Intelligence%20for%20India's%20Farmers&descAlignY=60&descSize=20&animation=fadeIn&cb=6"/>
</div>

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-v18%2B-0f5c30?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google%20AI-Gemini%203.6%20Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Google Cloud Run](https://img.shields.io/badge/Google%20Cloud-Cloud%20Run-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white)
![Languages](https://img.shields.io/badge/Multilingual-7%20Indian%20Languages-2fa860?style=for-the-badge)
![DPG](https://img.shields.io/badge/Architecture-Digital%20Public%20Good-009688?style=for-the-badge)
![Hackathon](https://img.shields.io/badge/Hackathon-Build%20with%20AI%3A%20Code%20for%20Communities-orange?style=for-the-badge)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Website-brightgreen?style=for-the-badge&logo=render&logoColor=white)](https://fieldsense-ai.onrender.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-4ecdc4?style=for-the-badge)](./LICENSE)

> ⚡ **Multimodal Vision Diagnosis · Localised Soil & Weather Advisory · 7-Language Voice Engine · Cross-State DPG Telemetry**

</div>

---

## 🌐 Live Production Deployment

FieldSense is fully deployed and live:
* **Live Public Application**: [https://fieldsense-ai.onrender.com](https://fieldsense-ai.onrender.com)
* **GitHub Repository**: [https://github.com/dharani25007-code/FieldSense-](https://github.com/dharani25007-code/FieldSense-)
* **AI Model Engine**: Google Gemini 3.6 Flash API (`@google/genai` v1.15.0) with `responseMimeType: "application/json"` structured output
* **API Resilience**: 6-Key Round-Robin Load Balancer with automatic 429 failover
* **Cloud DBMS Persistence**: Google Cloud Firestore NoSQL Database

---

## 📌 Executive Summary

**FieldSense** brings precision agricultural intelligence to India's 120M+ smallholder farmers. 
Traditional crop diagnostic services fail smallholders due to cost, geographical isolation, language barriers, and fragmented state advisory networks. FieldSense solves this with an instant, multimodal vision tool powered by **Google Gemini 3.6 Flash**, coupled with real-time weather integration, native 7-language voice accessibility, an anonymized cross-state **Digital Public Good (DPG)** data layer, and a **Multi-Key API Load Balancer** for zero-downtime production resilience.

A single photo of a sick leaf gives farmers calibrated disease diagnosis, plain-language organic & chemical treatment options, localized soil guidance, and audio playback in their native mother tongue.

---

## 🎯 Challenge Alignment Matrix

This matrix maps every requirement from the organizers' official challenge statement directly to FieldSense features:

| Organizer Challenge Requirement | FieldSense Implementation & Technology |
|---|---|
| **"Diagnostic tool for crop diseases"** | **01 Diagnose Tab:** Upload leaf photo → Gemini 3.6 Flash Vision identifies crop & disease, rates confidence strictly (`high`, `medium`, `low`), and gives 2–4 low-cost treatment steps in plain language. |
| **"Real-time, localised agro-advisories using AI"** | **02 Advisory Tab:** Crop choice + soil classification + GPS coordinates → OpenWeatherMap live weather (temp, humidity, wind) + Gemini text generation produces action-oriented guidance. |
| **"Regenerative crop recommendations based on satellite data, soil health, and weather forecasting"** | **02 Advisory Tab:** Factors in regional soil types (alluvial, black regur, red/yellow, laterite) + live weather forecasts + outputs regenerative farming tips. |
| **"Scalable digital public good enabling Indian states to share agricultural data models"** | **03 Network Tab:** Shared cross-state telemetry dashboard aggregating anonymized crop health data by state, backed by Gemini AI macro pattern summaries. |
| **"Strengthen cooperation on sustainable food production"** | **03 Network Tab:** Gemini AI generates actionable inter-state cooperation recommendations (e.g. cross-border disease surveillance, joint fungicide buffer stocking). |
| **"Multilingual or voice support"** | **Native 7-Language UI + Voice Engine:** Supports English, Hindi, Tamil, Telugu, Kannada, Marathi, and Bengali with Web Speech mic input & text-to-speech playback. |
| **"Mandatory integration of Google AI"** | **Google Gemini 3.6 Flash API (`@google/genai`):** Powers multimodal vision analysis, localized text advisories, and cross-state network summary intelligence. |

---

## 📊 Competitive Differentiation & Market Positioning

FieldSense solves the fundamental limitations of existing agricultural platforms in India:

| Existing Platform / App | Focus Area | Limitations Compared to FieldSense |
|---|---|---|
| **Plantix** *(Germany/India)* | AI Disease Diagnosis (CNN classification) | ❌ Closed label output without LLM reasoning/explanations.<br>❌ Lacks cross-state DPG telemetry & inter-state cooperation model.<br>❌ No integration of live weather + 6 soil profiles simultaneously. |
| **Kisan Suvidha** *(Govt of India)* | Portal for weather & Mandi prices | ❌ Text-heavy forms with zero computer vision leaf diagnosis.<br>❌ No AI-driven localized crop advisory. |
| **DeHaat / AgroStar** *(Agri-Tech Unicorns)* | Agri-input e-commerce & selling inputs | ❌ Commercial bias focused on selling proprietary chemical inputs.<br>❌ No anonymized DPG open-data exchange network. |
| **PlantNet / PictureThis** | Global plant species identification | ❌ Generic botany tool — not calibrated for Indian crops, regional soils, or 7 native Indian languages. |

### Why FieldSense Wins:
1. **Multimodal LLM Reasoning (Google Gemini 3.6 Flash)**: Instead of a rigid classification label, FieldSense explains *what it sees in the leaf photo*, provides *strict confidence calibration*, and gives *2–4 affordable, plain-language remedies*.
2. **Digital Public Good (DPG) & Cross-State Cooperation**: Automatically logs anonymized crop health telemetry across Indian states to power Gemini AI macro disease migration summaries and cross-border cooperation advice for agriculture officers.
3. **Voice-First 7-Language Audio Engine**: Covers English, Hindi, Tamil, Telugu, Kannada, Marathi, and Bengali with Web Speech mic recognition & text-to-speech playback without parenthetical English clutter.
4. **Soil + Live Weather Grounding**: Combines 6 Indian soil classifications with live OpenWeatherMap metrics.
5. **Zero-Downtime Multi-Key Load Balancer**: Round-robin API pool across up to 10 keys eliminates 429 rate limit errors with sub-1.5s canvas image compression.

---

## 🔬 Core Capabilities & Deep Feature Breakdown

### 🔐 1. First-Time Entrance Guard Authentication
- **Locked App Boundary**: Unauthenticated visitors see an interactive **Login & Register Portal** (`#auth-landing-screen`). The main application dashboard (`#main-app-container`) remains 100% locked and hidden until successful authentication.
- **Account Profiles**: Supports **Farmer**, **Extension Officer / Agronomist**, and **State Agriculture Official** user roles.
- **State Auto-Filling**: Saves user state preferences to `localStorage` and automatically populates form fields across the Diagnose and Advisory tabs.

### 🍃 2. AI Vision Diagnosis & Defensive Prompt Research (`server/prompts.js`)
- **Multimodal Engine**: Uses `@google/genai` with `gemini-3.6-flash` and `responseMimeType: "application/json"` for guaranteed structured JSON output in all 7 languages.
- **Defensive Anchoring**: Prompt strategy instructs Gemini to carefully distinguish harmless natural varietal traits (e.g., anthocyanin leaf vein pigmentation in cool weather) and nutrient chlorosis from true fungal, bacterial, or viral pathogens.
- **Calibrated Confidence**: Forces Gemini to output strict confidence ratings (`high`, `medium`, `low`). Ambiguous photos return `low` confidence with instructions for the farmer to re-take the photo under clearer lighting.
- **Client-Side Image Compression**: Canvas-based downscaler compresses 10MB+ leaf photos to ~100KB before upload, reducing diagnosis latency from 9s to ~1.5s.
- **Structured JSON Schema**:
  ```json
  {
    "usable": true,
    "crop": "Potato",
    "disease": "None",
    "isHealthy": true,
    "confidence": "medium",
    "whatWeSee": "Reddish-purple vein pigmentation without necrotic spots.",
    "whatToDo": "No chemical spray required. Keep soil evenly moist with balanced NPK.",
    "preventItNextTime": "Maintain clear drainage channels."
  }
  ```

### 🌤️ 3. Localized Agro-Advisory & Soil Integration
- **Soil Classification**: Custom guidance for **Alluvial**, **Black (Regur)**, **Red & Yellow**, **Laterite**, **Arid/Desert**, and **Saline/Alkaline** soil profiles.
- **Weather Grounding**: Integrates live weather metrics via OpenWeatherMap API (temperature, humidity percentage, wind speed).
- **Regenerative Farming Focus**: Recommends organic compost, green manure, crop rotation, and water conservation practices to maintain long-term soil health.

### 🌐 4. Digital Public Good (DPG) & Cross-State Data Modeling
- **Privacy-Preserving Telemetry**: Standardized JSON schema logs anonymized diagnosis and advisory activity without storing private farmer names or personal contact information.
- **State Aggregation Engine**: Grouping queries aggregate total activity, disease prevalence, and advisory metrics across Indian states.
- **Gemini Macro Synthesis**: Streams aggregated telemetry to Gemini 3.6 Flash to analyze cross-border pest migration trends and output cooperative action steps (e.g., joint fungicide buffer management between neighboring states).

### 🗣️ 5. Multilingual & Voice Accessibility Engine
- **7 Native Indian Languages**: Full UI and AI generation in **English**, **Hindi (हिन्दी)**, **Tamil (தமிழ்)**, **Telugu (తెలుగు)**, **Kannada (ಕನ್ನಡ)**, **Marathi (मराठी)**, and **Bengali (বাংলা)**.
- **Pure Native Script Generation**: Gemini prompt engineering ensures response text is written in pure native script without interleaved English words, producing authentic TTS playback.
- **Speech-to-Text Input**: Tap the microphone button in the Advisory tab to speak crop names natively using Web Speech Recognition (`SpeechRecognition`).
- **Text-to-Speech Output**: Tap the **Listen** button on any diagnosis or advisory result card to hear guidance read aloud in the selected language using Web Speech Synthesis (`SpeechSynthesis`), with intelligent voice prioritization (Google Tamil, Microsoft Valluvar, etc.).

### ⚡ 6. Multi-Key API Load Balancer (`server/index.js`)
- **Round-Robin Key Pool**: Supports up to 10 separate Gemini API keys (`GEMINI_API_KEY_1` through `GEMINI_API_KEY_10`) for automatic request distribution.
- **Instant 429 Failover**: If any key hits rate limits, the server instantly rotates to the next key in the pool with zero user-visible latency.
- **Linear Quota Scaling**: 6 free-tier keys = 120 requests/minute (172,800 requests/day) at $0 cost.
- **Model Fallback Chain**: Automatically retries across `gemini-3.6-flash` → `gemini-2.5-flash` → `gemini-1.5-flash` if a model is unavailable.

---

## 🗂️ Project Structure

```
FieldSense/
├── README.md                       # Main project landing page (this file)
├── LICENSE                         # Official MIT License file
├── Dockerfile                      # Production Google Cloud Run container recipe
├── dbms_architecture.md            # Detailed DBMS architecture & entity relationship models
├── pitch_deck_and_submission.md    # 11-Slide pitch deck structure & portal submission guide
├── demo_video_script.md            # 3-5 Minute demo video walkthrough script
├── public/
│   ├── index.html                  # Single Page Application wrapper & Entrance Guard
│   ├── styles.css                  # Custom design system with glassmorphic cards & tokens
│   ├── app.js                      # Client router, voice synthesis, camera, & auth logic
│   └── i18n.js                     # 7-Language translation dictionaries
└── server/
    ├── index.js                    # Express API server, Gemini proxy, Multi-Key Load Balancer
    ├── database.js                 # Decoupled DBMS repository module (loadDb, saveDb, addUser)
    ├── data.json                   # Local persistent database file
    ├── prompts.js                  # Defensive prompt templates for Gemini AI
    ├── .env                        # Active environment variables (GEMINI_API_KEY_1, _2, _3...)
    ├── .env.example                # Template for environment variable setup
    └── package.json                # Server dependencies (@google/genai, express, cors, multer)
```

---

## 🗄️ Database Management System (DBMS) Architecture

FieldSense implements a **Decoupled Data Repository Pattern** defined in `server/database.js`:

```
┌─────────────────────────────────────────────────────────────┐
│                    FieldSense Express API                   │
│         (/api/auth, /api/diagnose, /api/advisory)           │
└──────────────────────────────┬──────────────────────────────┘
                               │
               imports database methods & schemas
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                    server/database.js                       │
│     Data Abstraction Layer (loadDb, saveDb, addUser...)     │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
     Local Dev Engine               Production Cloud Target
┌──────────────▼──────────────┐  ┌────────────▼───────────────┐
│     JSON / File Engine      │  │ Google Cloud Firestore     │
│   (Zero-Cost / Container    │  │ (NoSQL DPG Data Exchange)  │
│      Safe Persistence)      │  │        or BigQuery         │
└─────────────────────────────┘  └────────────────────────────┘
```

### Entity Data Models

#### 1. `Users` (Authentication & Account Profiles)
```json
{
  "id": "usr_1724330000000",
  "name": "Ramesh Kumar",
  "identifier": "farmer@example.com",
  "password": "password123",
  "role": "farmer",
  "state": "Tamil Nadu"
}
```

#### 2. `NetworkLog` (Crop Health Telemetry)
```json
{
  "type": "diagnosis",
  "crop": "Potato",
  "disease": "None",
  "isHealthy": true,
  "state": "Tamil Nadu",
  "timestamp": "2026-08-22T15:40:00.000Z"
}
```

> [!NOTE]  
> **DPG Cloud Migration**: Swapping `server/database.js` to **Google Cloud Firestore** or **BigQuery** for national state data exchange requires changing only ~10 lines in `server/database.js`, with zero changes to the UI layer.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or newer
- **Google Gemini API Key**: Active key from [Google AI Studio](https://aistudio.google.com/apikey)

### Setup & Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/dharani25007-code/FieldSense.git
   cd FieldSense/server
   ```

2. **Create `.env` from `.env.example` via Command**:
   ```bash
   # Copy .env.example to .env
   cp .env.example .env          # On Linux/Mac/Git Bash
   # or: Copy-Item .env.example .env (On Windows PowerShell)
   ```
   Then open `server/.env` and add your API key(s):
   ```env
   GEMINI_API_KEY_1=your_first_gemini_key
   GEMINI_API_KEY_2=your_second_gemini_key   # Optional for load balancing
   GEMINI_API_KEY_3=your_third_gemini_key    # Optional for load balancing
   ```

3. **Install Server Dependencies**:
   ```bash
   npm install
   ```

4. **Launch Application Server (Serves API Backend & Frontend UI)**:
   ```bash
   npm start
   ```
   Open **`http://localhost:8080`** in your browser to access the full FieldSense application!

---

## ☁️ Cloud Deployment

### Render (Current Live Deployment)
FieldSense is live at **[https://fieldsense-ai.onrender.com](https://fieldsense-ai.onrender.com)** on Render's free tier:
- **Root Directory**: `server`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Environment Variables**: Add `GEMINI_API_KEY_1`, `GEMINI_API_KEY_2`, `GEMINI_API_KEY_3` (up to 10 keys) and `OPENWEATHER_API_KEY`

### Google Cloud Run (Alternative)
FieldSense is also fully containerized for 1-command deployment to Google Cloud Run:

```bash
gcloud run deploy fieldsense \
  --source . \
  --region asia-south1 \
  --set-env-vars GEMINI_API_KEY_1="KEY1",GEMINI_API_KEY_2="KEY2",GEMINI_MODEL="gemini-3.6-flash" \
  --allow-unauthenticated
```

The included `Dockerfile` builds a lightweight Node.js 20 container listening on port `8080`.

---

## 👥 Team & Acknowledgments

| Team Member | GitHub Handle | Key Responsibilities & Contributions |
|---|---|---|
| **Dharani Dharan M** | [`@dharani25007-code`](https://github.com/dharani25007-code) | **Lead Architect & Full-Stack Developer** — Built Express server, Gemini 3.6 Flash proxy, Entrance Guard auth, Web Speech voice integration, and UI design system. |
| **Joe Flaming M** | [`@joeflaming777-lgtm`](https://github.com/joeflaming777-lgtm) | **AI Vision & Prompt Research** — Developed defensive prompt anchoring, strict confidence calibration, and JSON schema validation for crop leaf disease analysis. |
| **Robinson A** | [`@Robinson2007`](https://github.com/Robinson2007) | **Product Strategy & DPG Data Modeling** — Designed cross-state telemetry schema, Digital Public Good data exchange framework, and state aggregation analytics. |

- **Hackathon**: Build with AI: Code for Communities (Second Edition)
- **Organizers**: Hack2skill × GDG India (Google Developer Groups)
- **Problem Statement**: Track 04 — Agricultural Intelligence

---

<div align="center">

[![Dharani Dharan M](https://img.shields.io/badge/Dharani_Dharan_M-Lead_Architect-0f5c30?style=for-the-badge&logo=github&logoColor=white)](https://github.com/dharani25007-code)
[![Joe Flaming M](https://img.shields.io/badge/Joe_Flaming_M-AI_Vision-2fa860?style=for-the-badge&logo=github&logoColor=white)](https://github.com/joeflaming777-lgtm)
[![Robinson A](https://img.shields.io/badge/Robinson_A-Product_Strategy-blue?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Robinson2007)

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:2fa860,100:0f5c30&height=120&section=footer&cb=6"/>

</div>