<div align="center">
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f5c30,50:2fa860,100:0f5c30&height=220&section=header&text=FieldSense&fontSize=55&fontColor=ffffff&fontAlignY=40&desc=Precision%20Agricultural%20Intelligence%20for%20India's%20Farmers&descAlignY=60&descSize=20&animation=fadeIn&cb=3"/>
</div>

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-v18%2B-0f5c30?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google%20AI-Gemini%203.6%20Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Google Cloud Run](https://img.shields.io/badge/Google%20Cloud-Cloud%20Run-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white)

![Languages](https://img.shields.io/badge/Multilingual-7%20Indian%20Languages-2fa860?style=for-the-badge)
![DPG](https://img.shields.io/badge/Architecture-Digital%20Public%20Good-009688?style=for-the-badge)
![Hackathon](https://img.shields.io/badge/Hackathon-Build%20with%20AI%3A%20Code%20for%20Communities-orange?style=for-the-badge)
![License: MIT](https://img.shields.io/badge/License-MIT-4ecdc4?style=for-the-badge)

<br/>

> ⚡ **Multimodal Vision Diagnosis · Localised Soil & Weather Advisory · 7-Language Voice Engine · Cross-State DPG Telemetry**

</div>

---

## 📌 Overview

**FieldSense** brings precision agricultural intelligence to India's 120M+ smallholder farmers. 
Traditional crop diagnostic services fail smallholders due to cost, geographical isolation, language barriers, and fragmented state advisory networks. FieldSense solves this with an instant, multimodal vision tool powered by **Google Gemini 3.6 Flash**, coupled with real-time weather integration, native 7-language voice accessibility, and an anonymized cross-state **Digital Public Good (DPG)** data layer.

A single photo of a sick leaf gives farmers calibrated disease diagnosis, plain-language organic & chemical treatment options, localized soil guidance, and audio playback in their native mother tongue.

---

## 🌐 Live Prototype & API Specs

* **Local Web Interface**: `http://localhost:8080`
* **Google Cloud Run Target**: Ready for 1-command deployment (`gcloud run deploy`)
* **AI Model Engine**: Google Gemini API (`@google/genai` v1.15.0 using `gemini-3.6-flash`)
* **Database Storage**: Decoupled `server/database.js` managing `server/data.json` (zero cost, zero container build risk)

---

## ✨ Core Features

| Feature | Description |
|---|---|
| 🔐 **Entrance Guard Auth** | First-time users see a full-page Login & Register entrance portal. Main app dashboard remains completely locked until authentication. |
| 🍃 **Multimodal Vision Diagnosis** | Upload a photo of a sick crop leaf. Gemini 3.6 Flash identifies the crop and disease, rates confidence strictly (`high`, `medium`, `low`), and provides 2–4 low-cost treatment steps. |
| 🌤️ **Localized Weather Advisory** | Combines crop selection, soil classification (Alluvial, Black Regur, Red/Yellow, Laterite), and GPS coordinates with OpenWeatherMap live weather to output customized farming guidance. |
| 🌐 **Cross-State DPG Network** | Anonymizes and aggregates real-time diagnosis & advisory telemetry by state, streaming data to Gemini for cross-border disease surveillance and resource-sharing analysis. |
| 🗣️ **7-Language Voice Accessibility** | Supports English, Hindi (हिन्दी), Tamil (தமிழ்), Telugu (తెలుగు), Kannada (ಕನ್ನಡ), Marathi (मराठी), and Bengali (বাংলা) with native Web Speech microphone input and text-to-speech audio playback. |
| 🗄️ **Persistent DBMS Module** | Built-in zero-cost database layer (`server/database.js`) saving users and telemetry to `server/data.json` across server restarts. |

---

## 🎯 Challenge Alignment Matrix

This matrix maps every requirement from the organizers' official challenge statement directly to FieldSense features:

| Organizer Challenge Requirement | FieldSense Implementation & Technology |
|---|---|
| **"Diagnostic tool for crop diseases"** | **01 Diagnose Tab:** Upload leaf photo → Gemini 3.6 Flash Vision identifies crop & disease, rates confidence strictly, and gives 2–4 low-cost treatment steps in plain language. |
| **"Real-time, localised agro-advisories using AI"** | **02 Advisory Tab:** Crop choice + soil classification + GPS coordinates → OpenWeatherMap live weather (temp, humidity, wind) + Gemini text generation produces action-oriented guidance. |
| **"Regenerative crop recommendations based on satellite data, soil health, and weather forecasting"** | **02 Advisory Tab:** Factors in regional soil types (alluvial, black regur, red/yellow, laterite) + live weather forecasts + outputs regenerative farming tips. |
| **"Scalable digital public good enabling Indian states to share agricultural data models"** | **03 Network Tab:** Shared cross-state telemetry dashboard aggregating anonymized crop health data by state, backed by Gemini AI macro pattern summaries. |
| **"Strengthen cooperation on sustainable food production"** | **03 Network Tab:** Gemini AI generates actionable inter-state cooperation recommendations (e.g. cross-border disease surveillance, joint fungicide buffer stocking). |
| **"Multilingual or voice support"** | **Native 7-Language UI + Voice Engine:** Supports English, Hindi, Tamil, Telugu, Kannada, Marathi, and Bengali with Web Speech mic input & text-to-speech playback. |
| **"Mandatory integration of Google AI"** | **Google Gemini 3.6 Flash API (`@google/genai`):** Powers multimodal vision analysis, localized text advisories, and cross-state network summary intelligence. |

---

## 🗂️ Project Structure

```
FieldSense/
├── README.md                       # Main project landing page (this file)
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
    ├── index.js                    # Express API server & Gemini 3.6 Flash proxy
    ├── database.js                 # Decoupled DBMS repository module (loadDb, saveDb, addUser)
    ├── data.json                   # Local persistent database file
    ├── prompts.js                  # Defensive prompt templates for Gemini AI
    ├── .env                        # Active environment variables (GEMINI_API_KEY)
    └── package.json                # Server dependencies (@google/genai, express, cors, multer)
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or newer
- **Google Gemini API Key**: Active key from [Google AI Studio](https://aistudio.google.com/apikey)

### Setup & Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/FieldSense.git
   cd FieldSense/server
   ```

2. **Configure Environment Variables**:
   Create a `.env` file inside the `server/` directory:
   ```env
   GEMINI_API_KEY=AIzaSyYourActualKeyHere
   GEMINI_MODEL=gemini-3.6-flash
   OPENWEATHER_API_KEY=your_optional_openweather_key
   PORT=8080
   ```

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Launch Server**:
   ```bash
   npm start
   ```
   Open **`http://localhost:8080`** in your browser.

---

## ☁️ Google Cloud Run Deployment

FieldSense is fully containerized and production-ready for 1-command deployment to Google Cloud Run:

```bash
gcloud run deploy fieldsense \
  --source . \
  --region asia-south1 \
  --set-env-vars GEMINI_API_KEY=your_gemini_key,GEMINI_MODEL=gemini-3.6-flash \
  --allow-unauthenticated
```

The included `Dockerfile` builds a lightweight Node.js 20 container listening on port `8080`.

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

## 👥 Team & Acknowledgments

| Team Member | GitHub Handle | Role |
|---|---|---|
| **Dharani Dharan M** | [`@dharani25007-code`](https://github.com/dharani25007-code) | Lead Architect & Full-Stack Developer |
| **Joe** | [`@joeflaming777-lgtm`](https://github.com/joeflaming777-lgtm) | AI Vision & Prompt Research |
| **Robinson** | [`@Robinson2007`](https://github.com/Robinson2007) | Product Strategy & DPG Data Modeling |

- **Hackathon**: Build with AI: Code for Communities (Second Edition)
- **Organizers**: Hack2skill × GDG India (Google Developer Groups)
- **Problem Statement**: Track 04 — Agricultural Intelligence

---

<div align="center">
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:2fa860,100:0f5c30&height=120&section=footer&cb=4"/>

**Built with ❤️ by [Dharani Dharan M](https://github.com/dharani25007-code), [Joe](https://github.com/joeflaming777-lgtm), and [Robinson](https://github.com/Robinson2007)**
</div>
