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
function speak(text) {
  if (!("speechSynthesis" in window) || !text) return null;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = getSpeechLang(getCurrentLang());
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

diagnoseBtn.addEventListener("click", async () => {
  if (!selectedFile) return;

  setDiagnoseState("loading");

  const formData = new FormData();
  formData.append("image", selectedFile);
  formData.append("state", stateSelect.value);
  formData.append("lang", getCurrentLang());

  try {
    const res = await fetch(`${API_BASE}/api/diagnose`, { method: "POST", body: formData });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Something went wrong.");

    if (!data.usable) {
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

function renderDiagnoseResult(data) {
  setDiagnoseState("content");
  const badgeClass = data.isHealthy ? "badge-healthy" : "badge-disease";
  const badgeText = data.isHealthy ? t("rowHealthy") : data.disease;

  diagnoseContent.innerHTML = `
    <h2>${escapeHtml(data.crop)}</h2>
    <div class="row">
      <span class="badge ${badgeClass}">${escapeHtml(badgeText)}</span>
      <span class="badge badge-confidence">${escapeHtml(data.confidence)} ${escapeHtml(t("rowConfidence"))}</span>
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
  diagnoseContent.appendChild(buildListenButton(() => spokenSummary));
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

// ---------- Authentication (Login & Register) ----------
const authModal = document.getElementById("auth-modal");
const openAuthBtn = document.getElementById("open-auth-btn");
const closeAuthBtn = document.getElementById("close-auth-btn");
const userBadge = document.getElementById("user-badge");
const userNameDisplay = document.getElementById("user-name-display");
const userRoleDisplay = document.getElementById("user-role-display");
const logoutBtn = document.getElementById("logout-btn");

const authTabLogin = document.getElementById("auth-tab-login");
const authTabRegister = document.getElementById("auth-tab-register");
const authForm = document.getElementById("auth-form");
const authError = document.getElementById("auth-error");
const authSubmitBtn = document.getElementById("auth-submit-btn");

const groupName = document.getElementById("group-name");
const groupRole = document.getElementById("group-role");
const groupState = document.getElementById("group-state");

let currentAuthMode = "login";
let currentUser = null;

function loadStoredUser() {
  const stored = localStorage.getItem("fieldsense_user");
  if (stored) {
    try {
      currentUser = JSON.parse(stored);
      updateUserUI();
    } catch (e) {
      localStorage.removeItem("fieldsense_user");
    }
  }
}

function updateUserUI() {
  if (currentUser) {
    openAuthBtn.hidden = true;
    userBadge.hidden = false;
    userNameDisplay.textContent = currentUser.name;
    userRoleDisplay.textContent = currentUser.role || "farmer";

    // Auto-fill state fields if user has a registered state
    if (currentUser.state) {
      if (stateSelect && !stateSelect.value) stateSelect.value = currentUser.state;
      if (advStateSelect && !advStateSelect.value) advStateSelect.value = currentUser.state;
    }
  } else {
    openAuthBtn.hidden = false;
    userBadge.hidden = true;
  }
}

function setAuthMode(mode) {
  currentAuthMode = mode;
  authError.hidden = true;

  if (mode === "login") {
    authTabLogin.classList.add("active");
    authTabRegister.classList.remove("active");
    groupName.hidden = true;
    groupRole.hidden = true;
    groupState.hidden = true;
    authSubmitBtn.textContent = t("loginSubmit");
  } else {
    authTabRegister.classList.add("active");
    authTabLogin.classList.remove("active");
    groupName.hidden = false;
    groupRole.hidden = false;
    groupState.hidden = false;
    authSubmitBtn.textContent = t("registerSubmit");
  }
}

openAuthBtn.addEventListener("click", () => {
  setAuthMode("login");
  authModal.hidden = false;
  authModal.setAttribute("aria-hidden", "false");
});

closeAuthBtn.addEventListener("click", () => {
  authModal.hidden = true;
  authModal.setAttribute("aria-hidden", "true");
});

authModal.addEventListener("click", (e) => {
  if (e.target === authModal) {
    authModal.hidden = true;
    authModal.setAttribute("aria-hidden", "true");
  }
});

authTabLogin.addEventListener("click", () => setAuthMode("login"));
authTabRegister.addEventListener("click", () => setAuthMode("register"));

authForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  authError.hidden = true;

  const identifier = document.getElementById("auth-identifier").value;
  const password = document.getElementById("auth-password").value;
  const name = document.getElementById("auth-name").value;
  const role = document.getElementById("auth-role").value;
  const state = document.getElementById("auth-state").value;

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
    authModal.hidden = true;
    authModal.setAttribute("aria-hidden", "true");
    authForm.reset();
  } catch (err) {
    authError.textContent = err.message;
    authError.hidden = false;
  }
});

logoutBtn.addEventListener("click", () => {
  currentUser = null;
  localStorage.removeItem("fieldsense_user");
  localStorage.removeItem("fieldsense_token");
  updateUserUI();
});

loadStoredUser();
