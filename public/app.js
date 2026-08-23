const API_BASE = ""; // same-origin; change to your deployed backend URL if hosted separately

// ---------- i18n: apply translations and wire up language selector ----------
function applyTranslations() {
  document.documentElement.lang = getCurrentLang();
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
}

const langSelect = document.getElementById("lang-select");
LANGUAGES.forEach((lang) => {
  const opt = document.createElement("option");
  opt.value = lang.code;
  opt.textContent = lang.label;
  langSelect.appendChild(opt);
});
langSelect.value = getCurrentLang();
langSelect.addEventListener("change", () => {
  setCurrentLang(langSelect.value);
  applyTranslations();
  networkLoaded = false;
});
applyTranslations();

// ---------- Speech helpers (Web Speech API) ----------
let cachedVoices = [];
function loadAvailableVoices() {
  if ("speechSynthesis" in window) {
    cachedVoices = window.speechSynthesis.getVoices() || [];
  }
}
if ("speechSynthesis" in window) {
  loadAvailableVoices();
  window.speechSynthesis.onvoiceschanged = loadAvailableVoices;
}

function findVoiceForLang(langTag) {
  if (!cachedVoices.length) loadAvailableVoices();
  const primaryLang = langTag.split("-")[0].toLowerCase();

  if (primaryLang === "en") {
    return cachedVoices.find((v) => v.lang.toLowerCase().startsWith("en-in") || v.lang.toLowerCase().startsWith("en")) || null;
  }

  const langKeywords = {
    ta: ["ta-in", "ta_in", "tamil", "தமிழ்"],
    hi: ["hi-in", "hi_in", "hindi", "हिन्दी"],
    te: ["te-in", "te_in", "telugu", "తెలుగు"],
    kn: ["kn-in", "kn_in", "kannada", "ಕನ್ನಡ"],
    mr: ["mr-in", "mr_in", "marathi", "மராठी"],
    bn: ["bn-in", "bn_in", "bengali", "bangla", "বাংলা"],
  };

  const keywords = langKeywords[primaryLang] || [primaryLang];

  const candidates = cachedVoices.filter((v) => {
    const l = v.lang.toLowerCase();
    const n = v.name.toLowerCase();
    return l.startsWith(primaryLang) || keywords.some((k) => l.includes(k) || n.includes(k));
  });

  if (candidates.length > 0) {
    // Prioritize authentic native regional voices (Google தமிழ், Microsoft Valluvar, etc.)
    const nativeVoice = candidates.find(
      (v) =>
        v.name.includes("Google") ||
        v.name.includes("Microsoft") ||
        v.name.includes("Natural") ||
        v.localService === true
    );
    return nativeVoice || candidates[0];
  }

  return null;
}

function cleanTextForSpeech(text, lang) {
  if (!text) return "";
  let cleaned = String(text);

  if (lang !== "en") {
    // Only strip English text inside parentheses like "(Tomato)" or "(Early Blight)"
    cleaned = cleaned.replace(/\s*\([A-Za-z0-9\s._\-/\\]+\)/g, "");
    // Do NOT strip isolated English words — crop/disease names are in English by design
  }

  // Remove markdown formatting symbols
  cleaned = cleaned.replace(/[*#_`~]/g, " ").replace(/\s+/g, " ").trim();
  return cleaned;
}

function speak(text) {
  if (!("speechSynthesis" in window) || !text) return null;
  window.speechSynthesis.cancel();

  const currentLang = getCurrentLang();
  const cleanedText = cleanTextForSpeech(text, currentLang);
  if (!cleanedText) return null;

  const utterance = new SpeechSynthesisUtterance(cleanedText);
  const speechLang = getSpeechLang(currentLang);
  utterance.lang = speechLang;

  // Wait for voices to load (some browsers load them asynchronously)
  const trySetVoice = () => {
    if (!cachedVoices.length) loadAvailableVoices();
    const voice = findVoiceForLang(speechLang);
    if (voice) {
      utterance.voice = voice;
    }
  };
  trySetVoice();

  utterance.rate = 0.9;
  utterance.pitch = 1.0;

  // Error handler so speech never silently fails
  utterance.onerror = (e) => {
    console.warn("Speech synthesis error:", e.error, "for lang:", speechLang);
  };

  // Chrome bug workaround: voices sometimes load late
  if (!cachedVoices.length && "speechSynthesis" in window) {
    window.speechSynthesis.onvoiceschanged = () => {
      loadAvailableVoices();
      trySetVoice();
    };
  }

  window.speechSynthesis.speak(utterance);
  return utterance;
}

function startListening(onResult, onEnd) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Voice input isn't supported in this browser. Try Chrome on Android or desktop.");
    return null;
  }
  const recognition = new SpeechRecognition();
  recognition.lang = getSpeechLang(getCurrentLang());
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.onresult = (event) => onResult(event.results[0][0].transcript);
  recognition.onend = () => onEnd && onEnd();
  recognition.onerror = () => onEnd && onEnd();
  recognition.start();
  return recognition;
}

function buildListenButton(getTextFn) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "listen-btn";
  btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7" stroke-linecap="round"/></svg><span>${t("listenBtn")}</span>`;
  btn.addEventListener("click", () => {
    const utterance = speak(getTextFn());
    if (!utterance) return;
    btn.classList.add("speaking");
    utterance.onend = () => btn.classList.remove("speaking");
  });
  return btn;
}

// ---------- Tab switching ----------
const tabButtons = document.querySelectorAll(".tab-btn");
const tabPanels = document.querySelectorAll(".tab-panel");

tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    tabButtons.forEach((b) => { b.classList.remove("active"); b.setAttribute("aria-selected", "false"); });
    tabPanels.forEach((p) => { p.classList.remove("active"); p.hidden = true; });

    btn.classList.add("active");
    btn.setAttribute("aria-selected", "true");
    const panel = document.getElementById(btn.dataset.tab);
    panel.classList.add("active");
    panel.hidden = false;

    if (btn.dataset.tab === "network") loadNetwork();
  });
});

// ---------- Diagnose tab ----------
const leafInput = document.getElementById("leaf-input");
const uploadPlaceholder = document.getElementById("upload-placeholder");
const uploadPreview = document.getElementById("upload-preview");
const diagnoseBtn = document.getElementById("diagnose-btn");
const stateSelect = document.getElementById("state-select");

const diagnoseEmpty = document.getElementById("diagnose-empty");
const diagnoseLoading = document.getElementById("diagnose-loading");
const diagnoseContent = document.getElementById("diagnose-content");

let selectedFile = null;

leafInput.addEventListener("change", () => {
  const file = leafInput.files[0];
  if (!file) return;
  selectedFile = file;
  diagnoseBtn.disabled = false;

  const reader = new FileReader();
  reader.onload = (e) => {
    uploadPreview.src = e.target.result;
    uploadPreview.hidden = false;
    uploadPlaceholder.hidden = true;
  };
  reader.readAsDataURL(file);
});

async function compressImage(file, maxDimension = 1000, quality = 0.85) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name || "leaf.jpg", {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

diagnoseBtn.addEventListener("click", async () => {
  if (!selectedFile) return;

  setDiagnoseState("loading");

  try {
    const fileToUpload = await compressImage(selectedFile, 1000, 0.85);
    const formData = new FormData();
    formData.append("image", fileToUpload);
    formData.append("state", stateSelect.value);
    formData.append("lang", getCurrentLang());

    const res = await fetch(`${API_BASE}/api/diagnose`, { method: "POST", body: formData });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Something went wrong.");

    if (!data.usable && (!data.crop || data.crop === "unclear") && (!data.disease || data.disease === "unclear")) {
      renderDiagnoseError("That doesn't look like a usable leaf photo. Try a clear, well-lit photo of a single leaf.");
      return;
    }

    renderDiagnoseResult(data);
  } catch (err) {
    renderDiagnoseError(err.message);
  }
});

function setDiagnoseState(state) {
  diagnoseEmpty.hidden = state !== "empty";
  diagnoseLoading.hidden = state !== "loading";
  diagnoseContent.hidden = state !== "content";
}

function renderDiagnoseError(message) {
  setDiagnoseState("content");
  diagnoseContent.innerHTML = `<div class="error-box">${escapeHtml(message)}</div>`;
}

function formatConfidence(confidence, lang) {
  const level = String(confidence || "medium").toLowerCase();
  const map = {
    en: { high: "High Confidence", medium: "Medium Confidence", low: "Low Confidence" },
    hi: { high: "उच्च विश्वास", medium: "मध्यम विश्वास", low: "कम विश्वास" },
    ta: { high: "உயர் நம்பிக்கை", medium: "மிதமான நம்பிக்கை", low: "குறைந்த நம்பிக்கை" },
    te: { high: "అధిక నమ్మకం", medium: "మధ్యస్థ నమ్మకం", low: "తక్కువ నమ్మకం" },
    kn: { high: "ಹೆಚ್ಚಿನ ನಂಬಿಕೆ", medium: "ಮಧ್ಯಮ ನಂಬಿಕೆ", low: "ಕಡಿಮೆ ನಂಬಿಕೆ" },
    mr: { high: "उच्च विश्वास", medium: "मध्यम विश्वास", low: "कमी विश्वास" },
    bn: { high: "উচ্চ আত্মবিশ্বাস", medium: "মাঝারি আত্মবিশ্বাস", low: "কম আত্মবিশ্বাস" },
  };
  const langMap = map[lang] || map.en;
  return langMap[level] || langMap.medium;
}

function buildWhatsappShareButton(text) {
  const btn = document.createElement("a");
  btn.target = "_blank";
  btn.rel = "noopener noreferrer";
  btn.className = "whatsapp-share-btn";
  btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg><span>${t("shareWhatsapp") || "Share via WhatsApp"}</span>`;
  btn.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  return btn;
}

function renderDiagnoseResult(data) {
  setDiagnoseState("content");
  const currentLang = getCurrentLang();
  const badgeClass = data.isHealthy ? "badge-healthy" : "badge-disease";
  const badgeText = data.isHealthy ? t("rowHealthy") : data.disease;
  const confidenceBadge = formatConfidence(data.confidence, currentLang);
  const organicSavingsBadge = t("organicSavings") || "🌱 Est. Organic Savings: ₹800/acre";
  const savingsText = data.isHealthy ? "" : `<span class="badge badge-savings">${escapeHtml(organicSavingsBadge)}</span>`;

  diagnoseContent.innerHTML = `
    <h2>${escapeHtml(data.crop)}</h2>
    <div class="row-badges">
      <span class="badge ${badgeClass}">${escapeHtml(badgeText)}</span>
      <span class="badge badge-confidence">${escapeHtml(confidenceBadge)}</span>
      ${savingsText}
    </div>
    <div class="row">
      <div class="row-label">${escapeHtml(t("rowWhatWeSee"))}</div>
      <div class="row-value">${escapeHtml(data.symptoms)}</div>
    </div>
    <div class="row">
      <div class="row-label">${escapeHtml(t("rowWhatToDo"))}</div>
      <div class="row-value">${escapeHtml(data.treatment)}</div>
    </div>
    <div class="row">
      <div class="row-label">${escapeHtml(t("rowPrevent"))}</div>
      <div class="row-value">${escapeHtml(data.prevention)}</div>
    </div>
  `;

  const spokenSummary = [data.crop, badgeText, data.symptoms, data.treatment, data.prevention].filter(Boolean).join(". ");
  const shareText = `🌾 FieldSense Crop Advisory:\nCrop: ${data.crop}\nStatus/Disease: ${badgeText}\nSymptoms: ${data.symptoms}\nRemedy: ${data.treatment}\n\nGet free AI farm advisories: https://fieldsense-ai.onrender.com`;

  const actionContainer = document.createElement("div");
  actionContainer.className = "result-actions";
  actionContainer.appendChild(buildListenButton(() => spokenSummary));
  actionContainer.appendChild(buildWhatsappShareButton(shareText));
  diagnoseContent.appendChild(actionContainer);
}

let deferredPrompt = null;
const pwaInstallBtn = document.getElementById("pwa-install-btn");

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  if (pwaInstallBtn) pwaInstallBtn.hidden = false;
});

if (pwaInstallBtn) {
  pwaInstallBtn.addEventListener("click", async () => {
    if (!deferredPrompt) {
      alert("To install FieldSense:\n\n• Chrome/Edge: Click the ⋮ menu → 'Install App'\n• Safari (iOS): Tap Share → 'Add to Home Screen'\n• Firefox: Use the address bar install icon");
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      pwaInstallBtn.hidden = true;
    }
    deferredPrompt = null;
  });
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

// ---------- Advisory tab ----------
const cropInput = document.getElementById("crop-input");
const soilSelect = document.getElementById("soil-select");
const advStateSelect = document.getElementById("adv-state-select");
const locateBtn = document.getElementById("locate-btn");
const locationStatus = document.getElementById("location-status");
const advisoryBtn = document.getElementById("advisory-btn");

const advisoryEmpty = document.getElementById("advisory-empty");
const advisoryLoading = document.getElementById("advisory-loading");
const advisoryContent = document.getElementById("advisory-content");

let coords = null;

const cropMicBtn = document.getElementById("crop-mic-btn");
let activeRecognition = null;
cropMicBtn.addEventListener("click", () => {
  if (activeRecognition) return; // already listening
  cropMicBtn.classList.add("listening");
  activeRecognition = startListening(
    (transcript) => { cropInput.value = transcript; },
    () => { cropMicBtn.classList.remove("listening"); activeRecognition = null; }
  );
});

locateBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    locationStatus.textContent = t("locationFailed");
    return;
  }
  locationStatus.textContent = t("locationLoading");
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      coords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
      locationStatus.textContent = t("locationShared");
    },
    () => {
      locationStatus.textContent = t("locationFailed");
    }
  );
});

advisoryBtn.addEventListener("click", async () => {
  setAdvisoryState("loading");

  const body = {
    crop: cropInput.value.trim(),
    soilType: soilSelect.value,
    state: advStateSelect.value,
    locationLabel: advStateSelect.value || null,
    lat: coords?.lat,
    lon: coords?.lon,
    lang: getCurrentLang(),
  };

  try {
    const res = await fetch(`${API_BASE}/api/advisory`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Something went wrong.");
    renderAdvisoryResult(data);
  } catch (err) {
    setAdvisoryState("content");
    advisoryContent.innerHTML = `<div class="error-box">${escapeHtml(err.message)}</div>`;
  }
});

function setAdvisoryState(state) {
  advisoryEmpty.hidden = state !== "empty";
  advisoryLoading.hidden = state !== "loading";
  advisoryContent.hidden = state !== "content";
}

function renderAdvisoryResult(data) {
  setAdvisoryState("content");
  advisoryContent.innerHTML = `
    <h2>${escapeHtml(data.headline)}</h2>
    <div class="row">
      <div class="row-label">${escapeHtml(t("rowCropRec"))}</div>
      <div class="row-value">${escapeHtml(data.cropRecommendation)}</div>
    </div>
    <div class="row">
      <div class="row-label">${escapeHtml(data.weatherUsed ? t("rowWeatherLive") : t("rowWeatherGeneral"))}</div>
      <div class="row-value">${escapeHtml(data.weatherNote)}</div>
    </div>
    <div class="row">
      <div class="row-label">${escapeHtml(t("rowSoil"))}</div>
      <div class="row-value">${escapeHtml(data.soilNote)}</div>
    </div>
    <div class="row">
      <div class="row-label">${escapeHtml(t("rowRisk"))}</div>
      <div class="row-value">${escapeHtml(data.riskFlag)}</div>
    </div>
    <div class="row">
      <div class="row-label">${escapeHtml(t("rowSustainability"))}</div>
      <div class="row-value">${escapeHtml(data.sustainabilityTip)}</div>
    </div>
  `;

  const spokenSummary = [data.headline, data.cropRecommendation, data.weatherNote, data.soilNote, data.riskFlag, data.sustainabilityTip].filter(Boolean).join(". ");
  advisoryContent.appendChild(buildListenButton(() => spokenSummary));
}

// ---------- Network tab ----------
const networkLoading = document.getElementById("network-loading");
const networkContent = document.getElementById("network-content");
const statesList = document.getElementById("states-list");
let networkLoaded = false;

async function loadNetwork() {
  if (networkLoaded) return; // simple cache - avoid refetching every tab click
  networkLoading.hidden = false;
  networkContent.hidden = true;

  try {
    const res = await fetch(`${API_BASE}/api/network?lang=${getCurrentLang()}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Could not load network data.");

    networkContent.innerHTML = `
      <div class="row">
        <div class="row-label">${escapeHtml(t("rowSummary"))}</div>
        <div class="row-value">${escapeHtml(data.aiSummary.summary)}</div>
      </div>
      <div class="row">
        <div class="row-label">${escapeHtml(t("rowTopConcern"))}</div>
        <div class="row-value">${escapeHtml(data.aiSummary.topConcern)}</div>
      </div>
      <div class="row">
        <div class="row-label">${escapeHtml(t("rowCooperation"))}</div>
        <div class="row-value">${escapeHtml(data.aiSummary.cooperationSuggestion)}</div>
      </div>
    `;
    networkContent.hidden = false;
    networkLoading.hidden = true;

    if (Object.keys(data.byState).length === 0) {
      statesList.innerHTML = `<p class="states-empty">${escapeHtml(t("statesEmpty"))}</p>`;
    } else {
      statesList.innerHTML = Object.entries(data.byState)
        .map(([state, info]) => `
          <div class="state-row">
            <span class="state-name">${escapeHtml(state)}</span>
            <span class="state-count">${info.diagnoses} ${t("diagnosesUnit")} · ${info.advisories} ${t("advisoriesUnit")}</span>
          </div>
        `).join("");
    }

    networkLoaded = true;
  } catch (err) {
    networkLoading.hidden = true;
    networkContent.hidden = false;
    networkContent.innerHTML = `<div class="error-box">${escapeHtml(err.message)}</div>`;
  }
}

// ---------- Utility ----------
function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  const div = document.createElement("div");
  div.textContent = String(str);
  return div.innerHTML;
}

// ---------- Authentication Landing Entrance Guard ----------
const authLandingScreen = document.getElementById("auth-landing-screen");
const mainAppContainer = document.getElementById("main-app-container");

const userBadge = document.getElementById("user-badge");
const userNameDisplay = document.getElementById("user-name-display");
const userRoleDisplay = document.getElementById("user-role-display");
const logoutBtn = document.getElementById("logout-btn");

const landingTabLogin = document.getElementById("landing-tab-login");
const landingTabRegister = document.getElementById("landing-tab-register");
const landingAuthForm = document.getElementById("landing-auth-form");
const landingAuthError = document.getElementById("landing-auth-error");
const landingAuthSubmitBtn = document.getElementById("landing-auth-submit-btn");

const landingGroupName = document.getElementById("landing-group-name");
const landingGroupRole = document.getElementById("landing-group-role");
const landingGroupState = document.getElementById("landing-group-state");

const landingLangSelect = document.getElementById("landing-lang-select");

// Populate landing page language selector
if (landingLangSelect) {
  LANGUAGES.forEach((lang) => {
    const opt = document.createElement("option");
    opt.value = lang.code;
    opt.textContent = lang.label;
    landingLangSelect.appendChild(opt);
  });
  landingLangSelect.value = getCurrentLang();
  landingLangSelect.addEventListener("change", () => {
    setCurrentLang(landingLangSelect.value);
    if (langSelect) langSelect.value = landingLangSelect.value;
    applyTranslations();
    networkLoaded = false;
  });
}

let currentAuthMode = "login";
let currentUser = null;

function loadStoredUser() {
  const stored = localStorage.getItem("fieldsense_user");
  if (stored) {
    try {
      currentUser = JSON.parse(stored);
    } catch (e) {
      localStorage.removeItem("fieldsense_user");
      currentUser = null;
    }
  }
  updateUserUI();
}

function updateUserUI() {
  if (currentUser) {
    if (authLandingScreen) authLandingScreen.hidden = true;
    if (mainAppContainer) mainAppContainer.hidden = false;

    if (userNameDisplay) userNameDisplay.textContent = currentUser.name;
    if (userRoleDisplay) userRoleDisplay.textContent = currentUser.role || "farmer";

    // Auto-fill state fields if user has a registered state
    if (currentUser.state) {
      if (stateSelect && !stateSelect.value) stateSelect.value = currentUser.state;
      if (advStateSelect && !advStateSelect.value) advStateSelect.value = currentUser.state;
    }
  } else {
    if (authLandingScreen) authLandingScreen.hidden = false;
    if (mainAppContainer) mainAppContainer.hidden = true;
  }
}

function setLandingAuthMode(mode) {
  currentAuthMode = mode;
  if (landingAuthError) landingAuthError.hidden = true;

  if (mode === "login") {
    if (landingTabLogin) landingTabLogin.classList.add("active");
    if (landingTabRegister) landingTabRegister.classList.remove("active");
    if (landingGroupName) landingGroupName.hidden = true;
    if (landingGroupRole) landingGroupRole.hidden = true;
    if (landingGroupState) landingGroupState.hidden = true;
    if (landingAuthSubmitBtn) landingAuthSubmitBtn.textContent = t("loginSubmit");
  } else {
    if (landingTabRegister) landingTabRegister.classList.add("active");
    if (landingTabLogin) landingTabLogin.classList.remove("active");
    if (landingGroupName) landingGroupName.hidden = false;
    if (landingGroupRole) landingGroupRole.hidden = false;
    if (landingGroupState) landingGroupState.hidden = false;
    if (landingAuthSubmitBtn) landingAuthSubmitBtn.textContent = t("registerSubmit");
  }
}

if (landingTabLogin) landingTabLogin.addEventListener("click", () => setLandingAuthMode("login"));
if (landingTabRegister) landingTabRegister.addEventListener("click", () => setLandingAuthMode("register"));

if (landingAuthForm) {
  landingAuthForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (landingAuthError) landingAuthError.hidden = true;

    const identifier = document.getElementById("landing-auth-identifier").value;
    const password = document.getElementById("landing-auth-password").value;
    const name = document.getElementById("landing-auth-name").value;
    const role = document.getElementById("landing-auth-role").value;
    const state = document.getElementById("landing-auth-state").value;

    const endpoint = currentAuthMode === "login" ? "/api/auth/login" : "/api/auth/register";
    const payload = currentAuthMode === "login"
      ? { identifier, password }
      : { name, identifier, password, role, state };

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Authentication failed.");

      currentUser = data.user;
      localStorage.setItem("fieldsense_user", JSON.stringify(currentUser));
      if (data.token) localStorage.setItem("fieldsense_token", data.token);

      updateUserUI();
      landingAuthForm.reset();
    } catch (err) {
      if (landingAuthError) {
        landingAuthError.textContent = err.message;
        landingAuthError.hidden = false;
      }
    }
  });
}
