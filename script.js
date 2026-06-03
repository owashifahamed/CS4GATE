/* ==========================================================
   CS4GATE — Main Script
   Sidebar tree, filters, question rendering, theme,
   bookmarks, progress, quiz, scroll-to-top, right panel.
   ========================================================== */

// ================= STATE =================
const selected = {
  course: null,
  chapter: null,
  topic: null,
  section: null,
  year: null,
  bookmarksOnly: false,
  reviewMode: null
};

const QUESTION_PAGE_SIZE = 8;
let currentQuestionPage = 1;

// ================= ELEMENTS =================
const hamburger = document.querySelector(".hamburger");
const sidebar = document.querySelector(".sidebar");
const slider = document.querySelector(".mobile-slider");
const rightPanel = document.querySelector(".right-panel");
const closePanel = document.querySelector(".close-panel");
const overlay = document.getElementById("overlay");

const mobileSearch = document.querySelector(".mobile-search");
const navBar = document.querySelector(".navbar");
const navSearch = document.querySelector(".nav-search");
const searchInput = navSearch ? navSearch.querySelector("input") : null;
const sidebarMenu = document.querySelector(".sidebar-menu");

const isQuestionPage = window.location.pathname.includes("question.html");
const isAssessmentPage = document.body.dataset.assessment === "quiz" || document.body.dataset.assessment === "mock";
const isFreeExperience = document.body.dataset.plan === "free";
const AUTH_USER_KEY = "soaGateCurrentUser";
const AUTH_STORAGE_KEYS = [
  AUTH_USER_KEY,
  "user",
  "currentUser",
  "authUser",
  "role",
  "token",
  "subscription",
  "soaGateLoggedOut",
  "dashboardCache",
  "dashboardUser",
  "userCache",
  "authCache",
  "soaGateUser",
  "soaGateAuthUser",
  "soaGateRole",
  "soaGateToken",
  "soaGateSubscription",
  "soaGateDashboardUser",
  "soaGateUserCache"
];
let verifiedUser = null;
let verifiedUserLoaded = false;

function currentPageName() {
  return window.location.pathname.split("/").pop()?.toLowerCase() || "index.html";
}

function isDashboardPage() {
  const page = currentPageName();
  return page === "free.html" || page === "paid-dashboard.html";
}

function hasActiveFilter() {
  return !!(
    selected.course ||
    selected.chapter ||
    selected.topic ||
    selected.section ||
    selected.year ||
    selected.bookmarksOnly ||
    selected.reviewMode
  );
}

function clearStructuredFilters() {
  selected.course = null;
  selected.chapter = null;
  selected.topic = null;
  selected.section = null;
  selected.year = null;
}

function bootBrandLogo() {
  if (window.SOA_BRAND && typeof window.SOA_BRAND.apply === "function") {
    window.SOA_BRAND.apply();
    return;
  }
  if (document.querySelector("script[data-brand-logo='1']")) return;
  const src = window.location.pathname.includes("/questions/") ? "../brand-logo.js" : "brand-logo.js";
  const script = document.createElement("script");
  script.src = src;
  script.defer = true;
  script.dataset.brandLogo = "1";
  script.onload = () => {
    if (window.SOA_BRAND && typeof window.SOA_BRAND.apply === "function") {
      window.SOA_BRAND.apply();
    }
  };
  document.head.appendChild(script);
}

function bootDesignSystem() {
  if (window.CS4DesignSystem && typeof window.CS4DesignSystem.load === "function") {
    window.CS4DesignSystem.load(false);
    return;
  }
  if (document.querySelector("script[data-design-system='1']")) return;
  const src = window.location.pathname.includes("/questions/")
    ? "../design-system.js?v=20260531contrast1"
    : "design-system.js?v=20260531contrast1";
  const script = document.createElement("script");
  script.src = src;
  script.defer = true;
  script.dataset.designSystem = "1";
  document.head.appendChild(script);
}

// ================= LOCALSTORAGE HELPERS =================
const LS = {
  get(k, fb) { try { return JSON.parse(localStorage.getItem(k)) ?? fb; } catch { return fb; } },
  set(k, v) { localStorage.setItem(k, JSON.stringify(v)); }
};
let csrfTokenPromise = null;

async function getCsrfToken() {
  if (!csrfTokenPromise) {
    csrfTokenPromise = fetch("api/auth.php?action=csrf", {
      cache: "no-store",
      credentials: "same-origin"
    })
      .then(res => res.ok ? res.json() : Promise.reject(new Error("Could not prepare secure request.")))
      .then(payload => payload.csrfToken || "");
  }
  return csrfTokenPromise;
}

function clearAuthStorage() {
  [localStorage, sessionStorage].forEach(store => {
    AUTH_STORAGE_KEYS.forEach(key => {
      try { store.removeItem(key); } catch {}
    });
  });
  verifiedUser = null;
  verifiedUserLoaded = false;
}

function storeFreshAuthUser(user) {
  clearAuthStorage();
  try { localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user)); } catch {}
  verifiedUser = user || null;
  verifiedUserLoaded = true;
}

async function refreshVerifiedUser() {
  verifiedUser = null;
  verifiedUserLoaded = false;
  try {
    const res = await fetch("api/auth.php?action=me&_=" + Date.now(), {
      cache: "no-store",
      credentials: "same-origin"
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok || !payload.user) {
      if (res.status === 401 || res.status === 403 || res.ok) clearAuthStorage();
      verifiedUserLoaded = true;
      return null;
    }
    storeFreshAuthUser(payload.user);
    return payload.user;
  } catch {
    verifiedUserLoaded = true;
    return null;
  }
}

// ================= THEME =================
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  LS.set("theme", theme);
}
function initTheme() {
  let storedTheme = "light";
  try {
    const raw = localStorage.getItem("theme");
    if (raw) {
      try { storedTheme = JSON.parse(raw); }
      catch { storedTheme = raw; }
    }
  } catch {}
  applyTheme(storedTheme === "dark" ? "dark" : "light");
  document.querySelectorAll(".theme-toggle").forEach(el => {
    el.addEventListener("click", () => {
      const cur = document.documentElement.getAttribute("data-theme") || "light";
      applyTheme(cur === "light" ? "dark" : "light");
    });
  });
}

// ================= BOOKMARKS =================
function getBookmarks() { return LS.get("bookmarks", []); }
function isBookmarked(id) { return getBookmarks().includes(id); }
function toggleBookmark(id) {
  const arr = getBookmarks();
  const i = arr.indexOf(id);
  if (i >= 0) arr.splice(i, 1); else arr.push(id);
  LS.set("bookmarks", arr);
  const active = arr.includes(id);
  syncProgress(id, { bookmarked: active, markedRevision: isRevisionMarked(id) });
  return active;
}

// ================= PROGRESS =================
function getProgress() { return LS.get("progress", { attempted: {}, correct: {} }); }
function recordAttempt(id, isCorrect) {
  const p = getProgress();
  p.attempted = p.attempted || {};
  p.correct = p.correct || {};
  p.incorrect = p.incorrect || {};
  p.attempts = p.attempts || {};
  p.daily = p.daily || {};
  p.attempted[id] = true;
  p.attempts[id] = (p.attempts[id] || 0) + 1;
  if (isCorrect) {
    p.correct[id] = true;
    delete p.incorrect[id];
  } else {
    p.incorrect[id] = true;
  }
  const today = new Date().toISOString().slice(0, 10);
  p.daily[today] = (p.daily[today] || 0) + 1;
  LS.set("progress", p);
  syncProgress(id, { isCorrect });
}

function getRevisionList() { return LS.get("revisionList", []); }
function isRevisionMarked(id) { return getRevisionList().includes(id); }
function toggleRevision(id) {
  const arr = getRevisionList();
  const i = arr.indexOf(id);
  if (i >= 0) arr.splice(i, 1); else arr.push(id);
  LS.set("revisionList", arr);
  const active = arr.includes(id);
  syncProgress(id, { bookmarked: isBookmarked(id), markedRevision: active });
  return active;
}

function syncProgress(id, patch) {
  if (!getCurrentUser()) return;
  const question = questionsData.find(q => Number(q.id) === Number(id));
  if (!question) return;
  getCsrfToken()
    .then(csrfToken => fetch("api/progress.php", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
      credentials: "same-origin",
      body: JSON.stringify({ questionId: Number(id), course: question.course, ...patch })
    }))
    .catch(() => {});
}

async function hydrateServerProgress() {
  if (!getCurrentUser()) return false;
  try {
    const res = await fetch("api/progress.php?_=" + Date.now(), {
      cache: "no-store",
      credentials: "same-origin"
    });
    if (!res.ok) return false;
    const payload = await res.json().catch(() => ({}));
    if (!Array.isArray(payload.data)) return false;

    const progress = getProgress();
    progress.attempted = progress.attempted || {};
    progress.correct = progress.correct || {};
    progress.incorrect = progress.incorrect || {};
    progress.attempts = progress.attempts || {};

    const bookmarks = new Set(getBookmarks().map(Number).filter(Boolean));
    const revision = new Set(getRevisionList().map(Number).filter(Boolean));

    payload.data.forEach(row => {
      const id = Number(row.question_id || row.questionId);
      if (!id) return;
      const attempts = Number(row.attempts || 0);
      if (attempts > 0) {
        progress.attempted[id] = true;
        progress.attempts[id] = Math.max(Number(progress.attempts[id] || 0), attempts);
        if (Number(row.is_correct) === 1) {
          progress.correct[id] = true;
          delete progress.incorrect[id];
        } else if (row.is_correct !== null && row.is_correct !== undefined) {
          progress.incorrect[id] = true;
          delete progress.correct[id];
        }
      }
      if (Number(row.bookmarked) === 1) bookmarks.add(id);
      if (Number(row.marked_revision) === 1) revision.add(id);
    });

    LS.set("progress", progress);
    LS.set("bookmarks", [...bookmarks]);
    LS.set("revisionList", [...revision]);
    return true;
  } catch {
    return false;
  }
}

function getDailyGoal() { return LS.get("dailyGoal", 20); }
function setDailyGoal(goal) { LS.set("dailyGoal", Math.max(1, Number(goal) || 20)); }

function getAllQuestions() { return questionsData; }

function loadImportedQuestions() {
  try {
    const imported = JSON.parse(localStorage.getItem("importedQuestions") || "[]");
    if (!Array.isArray(imported)) return;
    const ids = new Set(questionsData.map(q => q.id));
    imported.forEach(q => {
      if (q && q.id != null && !ids.has(q.id)) {
        questionsData.push(q);
        ids.add(q.id);
      }
    });
  } catch {}
}

function inferDifficulty(q) {
  if (q.difficulty) return q.difficulty;
  if (q.type === "MSQ") return "Hard";
  if (q.type === "NAT") return "Medium";
  return Number(q.year) >= 2024 ? "Medium" : "Easy";
}

// ================= NAVBAR / PANELS =================
if (hamburger) {
  hamburger.addEventListener("click", () => {
    if (window.innerWidth <= 900) {
      sidebar.classList.toggle("active");
      overlay.classList.toggle("show", sidebar.classList.contains("active"));
      hamburger.classList.toggle("fa-bars");
      hamburger.classList.toggle("fa-xmark");
      if (rightPanel) rightPanel.classList.remove("active");
    }
  });
}

if (slider) {
  slider.addEventListener("click", () => {
    if (window.innerWidth <= 900 && rightPanel) {
      rightPanel.classList.toggle("active");
      overlay.classList.toggle("show", rightPanel.classList.contains("active"));
      sidebar.classList.remove("active");
      hamburger.classList.remove("fa-xmark");
      hamburger.classList.add("fa-bars");
    }
  });
}

if (closePanel) {
  closePanel.addEventListener("click", () => {
    if (rightPanel) rightPanel.classList.remove("active");
    overlay.classList.remove("show");
  });
}

if (overlay) {
  overlay.addEventListener("click", () => {
    sidebar?.classList.remove("active");
    rightPanel?.classList.remove("active");
    overlay.classList.remove("show");
    if (hamburger) {
      hamburger.classList.remove("fa-xmark");
      hamburger.classList.add("fa-bars");
    }
  });
}

if (mobileSearch && searchInput) {
  mobileSearch.addEventListener("click", () => {
    if (window.innerWidth <= 900) {
      navBar.classList.toggle("search-active");
      mobileSearch.classList.toggle("fa-search");
      mobileSearch.classList.toggle("fa-xmark");
      if (navBar.classList.contains("search-active")) searchInput.focus();
    }
  });
}

// ================= APP UTILITY MODALS =================
function ensureAppModal() {
  let modal = document.getElementById("appUtilityModal");
  if (modal) return modal;
  modal = document.createElement("div");
  modal.id = "appUtilityModal";
  modal.className = "app-modal";
  modal.innerHTML = `
    <div class="app-modal-card">
      <button class="app-modal-close" id="appModalClose" aria-label="Close"><i class="fas fa-times"></i></button>
      <div id="appModalContent"></div>
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener("click", e => {
    if (e.target === modal || e.target.closest("#appModalClose")) closeAppModal();
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeAppModal();
  });
  return modal;
}

function closeAppModal() {
  document.getElementById("appUtilityModal")?.classList.remove("open");
}

function openAppModal(title, icon, body) {
  const modal = ensureAppModal();
  document.getElementById("appModalContent").innerHTML = `
    <div class="panel-title app-modal-title">
      <i class="${icon}"></i>
      <div>
        <h2>${title}</h2>
        <p>CS4GATE practice dashboard</p>
      </div>
    </div>
    ${body}`;
  modal.classList.add("open");
}

function openNotifications() {
  const p = getProgress();
  const attempted = Object.keys(p.attempted || {}).length;
  const bookmarks = getBookmarks().length;
  openAppModal("Notifications", "fas fa-bell", `
    <div class="utility-list">
      <div class="utility-item">
        <i class="fas fa-chart-simple"></i>
        <div><strong>${attempted} questions attempted</strong><span>Your progress is saved on this device.</span></div>
      </div>
      <div class="utility-item">
        <i class="fas fa-star"></i>
        <div><strong>${bookmarks} bookmarked questions</strong><span>Use bookmarks for quick revision.</span></div>
      </div>
      <div class="utility-item">
        <i class="fas fa-layer-group"></i>
        <div><strong>Quiz Studio is ready</strong><span>Create subject, chapter, or topic wise quizzes.</span></div>
      </div>
    </div>`);
}

function openProfile() {
  const user = getCurrentUser();
  if (!user) {
    openAppModal("Profile", "fas fa-user", `
      <div class="utility-empty">
        <h3>You are not signed in</h3>
        <p>Sign in to show your name in the sidebar and keep your local study profile active.</p>
        <div class="assessment-actions">
          <a class="btn btn-primary" href="signin.html"><i class="fas fa-right-to-bracket"></i> Sign In</a>
          <a class="btn btn-outline" href="signup.html"><i class="fas fa-user-plus"></i> Sign Up</a>
        </div>
      </div>`);
    return;
  }
  openAppModal("Profile", "fas fa-user", `
    <div class="profile-card-mini">
      <div class="profile-avatar">${esc(user.name || "A").charAt(0).toUpperCase()}</div>
      <div>
        <h3>${esc(user.name)}</h3>
        <p>${esc(user.email)}</p>
        <span class="q-badge">Target: GATE ${esc(user.targetYear || "2026")}</span>
      </div>
    </div>
    <div class="assessment-actions">
      <a class="btn btn-primary" href="quiz.html"><i class="fas fa-layer-group"></i> Start Quiz</a>
      <button class="btn btn-outline" id="modalLogout"><i class="fas fa-right-from-bracket"></i> Logout</button>
    </div>`);
  document.getElementById("modalLogout")?.addEventListener("click", () => {
    logoutToPublicHome();
  });
}

function logoutToPublicHome() {
  clearAuthStorage();
  try { sessionStorage.setItem("soaGateLoggedOut", "1"); } catch {}
  getCsrfToken().then(csrfToken => fetch("api/auth.php?action=logout", {
    method: "POST",
    headers: { "X-CSRF-Token": csrfToken },
    credentials: "same-origin",
    keepalive: true
  })).finally(() => {
    window.location.replace("index.html");
  });
}

function openSettingsModal() {
  const theme = document.documentElement.getAttribute("data-theme") || "light";
  const paidLinks = hasPaidAccess()
    ? `<a class="utility-item" href="quiz.html">
        <i class="fas fa-layer-group"></i>
        <div><strong>Quiz Studio</strong><span>Configure subject and topic wise practice.</span></div>
      </a>
      <a class="utility-item" href="mock-test.html">
        <i class="fas fa-clipboard-check"></i>
        <div><strong>Mock Test Studio</strong><span>Start an exam-style timed session.</span></div>
      </a>`
    : `<a class="utility-item" href="paid.html">
        <i class="fas fa-crown"></i>
        <div><strong>Upgrade to Paid</strong><span>Unlock Quiz Studio and Mock Test Studio.</span></div>
      </a>`;
  openAppModal("Settings", "fas fa-cog", `
    <div class="utility-list">
      <button class="utility-item utility-button" id="modalThemeToggle">
        <i class="fas fa-circle-half-stroke"></i>
        <div><strong>Theme</strong><span>Current mode: ${esc(theme)}</span></div>
      </button>
      ${paidLinks}
    </div>`);
  document.getElementById("modalThemeToggle")?.addEventListener("click", () => {
    const cur = document.documentElement.getAttribute("data-theme") || "light";
    applyTheme(cur === "light" ? "dark" : "light");
    openSettingsModal();
  });
}

function openAbout() {
  openAppModal("About", "fas fa-info-circle", `
    <div class="utility-empty">
      <h3>CS4GATE CS Practice</h3>
      <p>A static premium practice app for GATE Computer Science preparation with search, filters, bookmarks, quiz studio, mock tests, and local progress tracking.</p>
      <div class="history-grid">
        <div class="history-card"><strong>${questionsData.length}</strong><span>Total questions</span></div>
        <div class="history-card"><strong>${new Set(questionsData.map(q => q.course)).size}</strong><span>Subjects</span></div>
      </div>
    </div>`);
}

function bindUtilityActions() {
  document.querySelectorAll(".desktop-icons .fa-bell").forEach(icon => {
    icon.addEventListener("click", e => {
      e.stopPropagation();
      openNotifications();
    });
  });
  document.querySelectorAll(".desktop-icons .fa-user").forEach(icon => {
    icon.addEventListener("click", e => {
      e.stopPropagation();
      openProfile();
    });
  });
  document.querySelectorAll(".panel-item").forEach(item => {
    item.addEventListener("click", e => {
      if (e.currentTarget.classList.contains("theme-toggle")) return;
      const text = e.currentTarget.textContent.toLowerCase();
      if (text.includes("notification")) openNotifications();
      else if (text.includes("profile")) openProfile();
      else if (text.includes("setting")) openSettingsModal();
      else if (text.includes("about")) window.location.href = "about.html";
      rightPanel?.classList.remove("active");
      overlay?.classList.remove("show");
    });
  });
  document.querySelectorAll('a[href="quiz.html"], a[href="mock-test.html"]').forEach(link => {
    link.addEventListener("click", e => {
      if (hasPaidAccess()) return;
      e.preventDefault();
      openAppModal("Paid Feature", "fas fa-crown", `
        <div class="utility-empty">
          <h3>Quiz and Mock Test are included in Paid</h3>
          <p>Free users get the question bank with ad spaces. Paid users unlock Quiz Studio, Mock Test Studio, and an ad-free dashboard.</p>
          <div class="assessment-actions">
            <a class="btn btn-primary" href="paid.html"><i class="fas fa-crown"></i> View Paid Version</a>
            <a class="btn btn-outline" href="free.html"><i class="fas fa-table-cells-large"></i> Free Dashboard</a>
          </div>
        </div>`);
    });
  });
}

// ================= HELPERS =================
function esc(s) {
  if (s == null) return "";
  return String(s).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function richToPlainText(value) {
  const holder = document.createElement("div");
  holder.innerHTML = value == null ? "" : String(value);
  return (holder.textContent || "").replace(/\s+/g, " ").trim();
}

function renderThumbPlaceholder(options = {}) {
  if (window.SOA_THUMB && typeof window.SOA_THUMB.render === "function") {
    return window.SOA_THUMB.render(options);
  }
  const label = esc((options.label || options.subject || "GATE Computer Science").toUpperCase());
  const title = esc(options.title || options.chapter || options.subject || "Practice");
  const subtitle = esc(options.subtitle || options.topic || "");
  return `
    <div class="cs4-thumb cs4-thumb--${esc(options.variant || "dashboard-question")}" aria-hidden="true">
      <span class="cs4-thumb-label">${label}</span>
      <strong class="cs4-thumb-title">${title}</strong>
      ${subtitle ? `<span class="cs4-thumb-subtitle">${subtitle}</span>` : ""}
      <span class="cs4-thumb-brand">CS4GATE</span>
    </div>`;
}

function questionDataUnavailable() {
  const status = window.questionsDataStatus || {};
  return status.ready === true && status.ok !== true && questionsData.length === 0;
}

function questionDataUnavailableHtml(context = "question data") {
  return `
    <div class="empty data-state" role="status">
      <div class="emoji"><i class="fas fa-triangle-exclamation"></i></div>
      <h3>Question data is temporarily unavailable</h3>
      <p>Unable to load ${esc(context)} right now. Check your connection or retry in a moment.</p>
      <button class="btn btn-primary" type="button" data-retry-question-data>
        <i class="fas fa-rotate-right"></i> Retry
      </button>
    </div>`;
}

function bindQuestionDataRetry(root = document) {
  root.querySelectorAll("[data-retry-question-data]").forEach(button => {
    button.addEventListener("click", () => window.location.reload());
  });
}

function createMenuItem(text, options = {}) {
  const { dropdown = false, type = null, course = null, chapter = null, topic = null, section = null, year = null, icon = null } = options;
  const item = document.createElement("div");
  item.className = "menu-item" + (dropdown ? " dropdown" : "");
  if (type) item.dataset.type = type;
  if (course) item.dataset.course = course;
  if (chapter) item.dataset.chapter = chapter;
  if (topic) item.dataset.topic = topic;
  if (section) item.dataset.section = section;
  if (year) item.dataset.year = year;

  const left = document.createElement("span");
  left.style.display = "flex";
  left.style.alignItems = "center";
  left.style.gap = "8px";
  if (icon) left.innerHTML = `<i class="${icon}"></i> `;
  left.appendChild(document.createTextNode(text));
  item.appendChild(left);

  if (dropdown) {
    const arrow = document.createElement("i");
    arrow.className = "fas fa-chevron-down arrow";
    item.appendChild(arrow);
  }
  return item;
}

function buildModel(data) {
  const model = { courses: {}, years: {} };
  data.forEach(q => {
    model.courses[q.course] = model.courses[q.course] || {};
    model.courses[q.course][q.chapter] = model.courses[q.course][q.chapter] || {};
    model.courses[q.course][q.chapter][q.topic] = model.courses[q.course][q.chapter][q.topic] || new Set();
    model.courses[q.course][q.chapter][q.topic].add(q.section);

    model.years[q.year] = (model.years[q.year] || 0) + 1;
  });
  return model;
}

// ================= BUILD SIDEBAR =================
function buildSidebar(model) {
  if (!sidebarMenu) return;
  sidebarMenu.innerHTML = "";

  // Quick actions
  const home = createMenuItem("Home", { icon: "fas fa-home" });
  home.addEventListener("click", () => {
    const homeHref = getDashboardHomeHref();
    const path = window.location.pathname.toLowerCase();
    const onHomePage = path.endsWith("/" + homeHref.toLowerCase()) || path.endsWith(homeHref.toLowerCase());
    if (onHomePage) {
      clearAllFilters();
      return;
    }
    window.location.href = homeHref;
  });
  sidebarMenu.appendChild(home);

  const bms = createMenuItem(`Bookmarks (${getBookmarks().length})`, { icon: "fas fa-star" });
  bms.dataset.type = "bookmarksOnly";
  sidebarMenu.appendChild(bms);

  const mistakes = createMenuItem("Mistake Review", { icon: "fas fa-triangle-exclamation" });
  mistakes.dataset.type = "reviewMode";
  mistakes.dataset.reviewMode = "mistakes";
  sidebarMenu.appendChild(mistakes);

  const revision = createMenuItem(`Revision (${getRevisionList().length})`, { icon: "fas fa-flag" });
  revision.dataset.type = "reviewMode";
  revision.dataset.reviewMode = "revision";
  sidebarMenu.appendChild(revision);

  if (hasPaidAccess()) {
    const analytics = createMenuItem("Analytics", { icon: "fas fa-chart-line" });
    analytics.dataset.nav = "analytics.html";
    analytics.addEventListener("click", () => { window.location.href = "analytics.html"; });
    sidebarMenu.appendChild(analytics);

    const quizLink = createMenuItem("Quiz", { icon: "fas fa-layer-group" });
    quizLink.dataset.nav = "quiz.html";
    quizLink.addEventListener("click", () => { window.location.href = "quiz.html"; });
    sidebarMenu.appendChild(quizLink);

    const mockLink = createMenuItem("Mock Test", { icon: "fas fa-clipboard-check" });
    mockLink.dataset.nav = "mock-test.html";
    mockLink.addEventListener("click", () => { window.location.href = "mock-test.html"; });
    sidebarMenu.appendChild(mockLink);

    if (hasVerifiedAdminAccess()) {
      const admin = createMenuItem("Admin Import", { icon: "fas fa-file-import" });
      admin.dataset.nav = "admin.html";
      admin.addEventListener("click", () => { window.location.href = "admin.html"; });
      sidebarMenu.appendChild(admin);
    }
  } else {
    const upgrade = createMenuItem("Upgrade to Paid", { icon: "fas fa-crown" });
    upgrade.dataset.nav = "paid.html";
    upgrade.addEventListener("click", () => { window.location.href = "paid.html"; });
    sidebarMenu.appendChild(upgrade);
  }

  const authUser = getCurrentUser();
  if (authUser) {
    const logout = createMenuItem("Logout", { icon: "fas fa-right-from-bracket" });
    logout.addEventListener("click", () => {
      logoutToPublicHome();
    });
    sidebarMenu.appendChild(logout);
  } else {
    const signIn = createMenuItem("Sign In", { icon: "fas fa-right-to-bracket" });
    signIn.dataset.nav = "signin.html";
    signIn.addEventListener("click", () => { window.location.href = "signin.html"; });
    sidebarMenu.appendChild(signIn);

    const signUp = createMenuItem("Sign Up", { icon: "fas fa-user-plus" });
    signUp.dataset.nav = "signup.html";
    signUp.addEventListener("click", () => { window.location.href = "signup.html"; });
    sidebarMenu.appendChild(signUp);
  }

  // Courses dropdown
  const coursesDropdown = createMenuItem("Courses", { dropdown: true, icon: "fas fa-book" });
  sidebarMenu.appendChild(coursesDropdown);

  const coursesSubmenu = document.createElement("div");
  coursesSubmenu.className = "submenu";

  Object.keys(model.courses).sort().forEach(course => {
    const courseItem = createMenuItem(course, { dropdown: true, type: "course", course });
    coursesSubmenu.appendChild(courseItem);

    const chapterSubmenu = document.createElement("div");
    chapterSubmenu.className = "submenu";

    Object.keys(model.courses[course]).sort().forEach(chapter => {
      const chapterItem = createMenuItem(chapter, { dropdown: true, type: "chapter", course, chapter });
      chapterSubmenu.appendChild(chapterItem);

      const topicSubmenu = document.createElement("div");
      topicSubmenu.className = "submenu";

      Object.keys(model.courses[course][chapter]).sort().forEach(topic => {
        const topicItem = createMenuItem(topic, { dropdown: true, type: "topic", course, chapter, topic });
        topicSubmenu.appendChild(topicItem);

        const sectionSubmenu = document.createElement("div");
        sectionSubmenu.className = "submenu";

        Array.from(model.courses[course][chapter][topic]).sort().forEach(section => {
          const sectionItem = createMenuItem(section, { type: "section", course, chapter, topic, section });
          sectionSubmenu.appendChild(sectionItem);
        });
        topicSubmenu.appendChild(sectionSubmenu);
      });
      chapterSubmenu.appendChild(topicSubmenu);
    });
    coursesSubmenu.appendChild(chapterSubmenu);
  });
  sidebarMenu.appendChild(coursesSubmenu);

  // Year dropdown
  const yearsDropdown = createMenuItem("Year", { dropdown: true, icon: "fas fa-calendar" });
  sidebarMenu.appendChild(yearsDropdown);

  const yearsSubmenu = document.createElement("div");
  yearsSubmenu.className = "submenu";
  Object.keys(model.years).sort((a, b) => Number(b) - Number(a)).forEach(year => {
    const yearItem = createMenuItem(`${year} (${model.years[year]})`, { type: "year", year });
    yearsSubmenu.appendChild(yearItem);
  });
  sidebarMenu.appendChild(yearsSubmenu);

  // Contact
  const contact = createMenuItem("Contact", { icon: "fas fa-envelope" });
  contact.dataset.nav = "contact.html";
  contact.addEventListener("click", () => { window.location.href = "contact.html"; });
  sidebarMenu.appendChild(contact);

  setupSidebarInteractions();
  highlightSelectedInSidebar();
}

function highlightSelectedInSidebar() {
  if (!sidebarMenu) return;
  const page = window.location.pathname.split("/").pop() || "index.html";
  sidebarMenu.querySelectorAll(".menu-item").forEach(el => {
    const t = el.dataset.type;
    if (!t) {
      el.classList.toggle("selected", el.dataset.nav === page);
      return;
    }
    let match = false;
    if (t === "bookmarksOnly" && selected.bookmarksOnly) match = true;
    if (t === "reviewMode" && el.dataset.reviewMode === selected.reviewMode) match = true;
    if (t === "year" && el.dataset.year === selected.year) match = true;
    if (t === "course" && el.dataset.course === selected.course && !selected.chapter) match = true;
    if (t === "chapter" && el.dataset.chapter === selected.chapter && !selected.topic) match = true;
    if (t === "topic" && el.dataset.topic === selected.topic && !selected.section) match = true;
    if (t === "section" && el.dataset.section === selected.section) match = true;
    el.classList.toggle("selected", match);
  });
}

// ================= SIDEBAR INTERACTIONS =================
function setupSidebarInteractions() {
  if (!sidebarMenu) return;
  sidebarMenu.onclick = e => {
    const arrow = e.target.closest(".arrow");
    const clickedItem = e.target.closest(".menu-item");
    if (!clickedItem || !sidebarMenu.contains(clickedItem)) return;

    if (clickedItem.classList.contains("dropdown")) {
      e.stopPropagation();
      const item = arrow ? arrow.parentElement : clickedItem;
      const submenu = item.nextElementSibling;
      if (!submenu?.classList.contains("submenu")) return;

      if (item.dataset.type && !isDashboardPage()) {
        handleSelection(item);
        return;
      }

      // Close siblings at the same level
      item.parentElement.querySelectorAll(":scope > .dropdown.active").forEach(sib => {
        if (sib !== item) {
          sib.classList.remove("active");
          if (sib.nextElementSibling) sib.nextElementSibling.style.display = "none";
        }
      });
      item.classList.toggle("active");
      submenu.style.display = submenu.style.display === "block" ? "none" : "block";
      if (item.dataset.type && !arrow) {
        handleSelection(item);
      }
      return;
    }

    const item = clickedItem;
    if (!item.dataset.type) return;
    handleSelection(item);
    closeSidebarMobile();
  };
}

function handleSelection(item) {
  const t = item.dataset.type;
  const c = item.dataset.course || null;
  const ch = item.dataset.chapter || null;
  const tp = item.dataset.topic || null;
  const sc = item.dataset.section || null;
  const yr = item.dataset.year || null;

  if (t === "bookmarksOnly") {
    clearStructuredFilters();
    selected.bookmarksOnly = true;
    selected.reviewMode = null;
  } else if (t === "reviewMode") {
    clearStructuredFilters();
    selected.bookmarksOnly = false;
    selected.reviewMode = item.dataset.reviewMode === "revision" ? "revision" : "mistakes";
  } else if (t === "year") {
    selected.bookmarksOnly = false;
    selected.reviewMode = null;
    selected.course = selected.chapter = selected.topic = selected.section = null;
    selected.year = yr;
  } else if (t === "course") {
    selected.bookmarksOnly = false;
    selected.reviewMode = null;
    selected.course = c;
    selected.chapter = selected.topic = selected.section = null;
  } else if (t === "chapter") {
    selected.bookmarksOnly = false;
    selected.reviewMode = null;
    selected.course = c; selected.chapter = ch;
    selected.topic = selected.section = null;
  } else if (t === "topic") {
    selected.bookmarksOnly = false;
    selected.reviewMode = null;
    selected.course = c; selected.chapter = ch; selected.topic = tp;
    selected.section = null;
  } else if (t === "section") {
    selected.bookmarksOnly = false;
    selected.reviewMode = null;
    selected.course = c; selected.chapter = ch; selected.topic = tp; selected.section = sc;
  }

  if (!isDashboardPage()) {
    goToIndexWithFilters();
    return;
  }

  applyDashboardFilters();
}

function clearAllFilters() {
  Object.assign(selected, { course: null, chapter: null, topic: null, section: null, year: null, bookmarksOnly: false, reviewMode: null });
  if (!isDashboardPage()) {
    window.location.href = getDashboardHomeHref();
    return;
  }
  if (searchInput) searchInput.value = "";
  document.getElementById("searchClearBtn")?.classList.remove("show");
  applyDashboardFilters({ scroll: false });
}

function resetQuestionLimit() {
  currentQuestionPage = 1;
}

function closeSidebarMobile() {
  if (window.innerWidth <= 900) {
    sidebar?.classList.remove("active");
    overlay?.classList.remove("show");
    if (hamburger) {
      hamburger.classList.remove("fa-xmark");
      hamburger.classList.add("fa-bars");
    }
  }
}

function scrollToFilterResults() {
  if (!isDashboardPage()) return;
  const target = document.getElementById("listHeading") || document.getElementById("searchResults");
  target?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function updateDashboardIntroVisibility() {
  if (!isDashboardPage()) return;
  const hide = hasActiveFilter();
  document.body.classList.toggle("dashboard-filter-active", hide);
  document.querySelectorAll(".home-hero, #dashboardOverview, [data-dashboard-home-only]").forEach(el => {
    el.hidden = hide;
    el.setAttribute("aria-hidden", hide ? "true" : "false");
  });
}

function applyDashboardFilters({ scroll = false } = {}) {
  if (!isDashboardPage()) {
    goToIndexWithFilters();
    return;
  }
  resetQuestionLimit();
  showQuestions();
  updateChips();
  highlightSelectedInSidebar();
  updateDashboardIntroVisibility();
  syncDashboardFilterUrl();
  closeSidebarMobile();
  if (scroll) scrollToFilterResults();
}

function getCurrentUser() {
  if (verifiedUser) return verifiedUser;
  if (verifiedUserLoaded) return null;
  try { return JSON.parse(localStorage.getItem(AUTH_USER_KEY)); }
  catch { return null; }
}

function getUserPlan() {
  return getCurrentUser()?.plan || (isFreeExperience ? "free" : document.body.dataset.plan || "free");
}

function hasPaidAccess() {
  return getUserPlan() === "paid" || hasAdminAccess();
}

function hasAdminAccess() {
  return (getCurrentUser()?.role || "").toLowerCase() === "admin";
}

function hasVerifiedAdminAccess() {
  return verifiedUserLoaded && (verifiedUser?.role || "").toLowerCase() === "admin";
}

function getDashboardHomeHref() {
  const path = window.location.pathname.toLowerCase();
  const src = new URLSearchParams(window.location.search).get("src");
  if (path.includes("free.html") || src === "free") return "free.html";
  if (path.includes("paid-dashboard.html") || src === "paid") return "paid-dashboard.html";
  return hasPaidAccess() ? "paid-dashboard.html" : "free.html";
}

function applyContextNavigationLinks() {
  const logoLink = document.querySelector(".logo a");
  if (logoLink) logoLink.setAttribute("href", "index.html");
}

function renderUserShell() {
  const user = getCurrentUser();
  document.querySelectorAll(".sidebar-footer").forEach(footer => {
    footer.innerHTML = user
      ? `<i class="fas fa-user-circle"></i><span>${esc(user.name)} · ${esc((user.plan || "free").toUpperCase())}</span>`
      : `<i class="fas fa-user-circle"></i><span>Welcome, Aspirant</span>`;
  });
}

function filterSearchParams() {
  const params = new URLSearchParams();
  if (selected.course) params.set("course", selected.course);
  if (selected.chapter) params.set("chapter", selected.chapter);
  if (selected.topic) params.set("topic", selected.topic);
  if (selected.section) params.set("section", selected.section);
  if (selected.year) params.set("year", selected.year);
  if (selected.bookmarksOnly) params.set("bookmarks", "1");
  if (selected.reviewMode === "mistakes") params.set("review", "mistakes");
  if (selected.reviewMode === "revision") params.set("revision", "1");
  return params;
}

function syncDashboardFilterUrl() {
  if (!isDashboardPage() || !window.history?.replaceState) return;
  const params = filterSearchParams();
  const qs = params.toString();
  const target = `${currentPageName()}${qs ? `?${qs}` : ""}`;
  const current = `${currentPageName()}${window.location.search || ""}`;
  if (target !== current) {
    window.history.replaceState(null, "", target);
  }
}

function goToIndexWithFilters() {
  const params = filterSearchParams();
  const qs = params.toString();
  const base = getDashboardHomeHref();
  window.location.href = base + (qs ? `?${qs}` : "");
}

// ================= URL FILTER SUPPORT =================
function applyURLFilters() {
  const params = new URLSearchParams(window.location.search);
  selected.course = params.get("course") || null;
  selected.chapter = params.get("chapter") || null;
  selected.topic = params.get("topic") || null;
  selected.section = params.get("section") || null;
  selected.year = params.get("year") || null;
  selected.bookmarksOnly = params.get("bookmarks") === "1";
  selected.reviewMode = null;
  if (params.get("review") === "mistakes") selected.reviewMode = "mistakes";
  if (params.get("revision") === "1") selected.reviewMode = "revision";
  if (selected.reviewMode) selected.bookmarksOnly = false;
}

// ================= FILTER CHIPS =================
function updateChips() {
  const bar = document.getElementById("filterChips");
  if (!bar) return;
  const chips = [];
  const add = (key, label) =>
    chips.push(`<span class="chip">${esc(label)}<button data-remove="${key}" aria-label="remove">×</button></span>`);

  if (selected.course) add("course", selected.course);
  if (selected.chapter) add("chapter", selected.chapter);
  if (selected.topic) add("topic", selected.topic);
  if (selected.section) add("section", selected.section);
  if (selected.year) add("year", "Year " + selected.year);
  if (selected.bookmarksOnly) add("bookmarksOnly", "★ Bookmarks");
  if (selected.reviewMode === "mistakes") add("reviewMode", "Mistake Review");
  if (selected.reviewMode === "revision") add("reviewMode", "Revision");

  if (chips.length) chips.push(`<button class="chip-clear-all" data-clear-all>Clear all</button>`);
  bar.innerHTML = chips.join("");

  bar.querySelectorAll("[data-remove]").forEach(b => {
    b.addEventListener("click", () => {
      const k = b.dataset.remove;
      selected[k] = k === "bookmarksOnly" ? false : null;
      applyDashboardFilters();
    });
  });
  bar.querySelector("[data-clear-all]")?.addEventListener("click", clearAllFilters);
}

// ================= FILTER & RENDER QUESTIONS =================
function getFilteredQuestions() {
  const p = getProgress();
  return questionsData.filter(q => {
    if (selected.year && String(q.year) !== String(selected.year)) return false;
    if (selected.course && q.course !== selected.course) return false;
    if (selected.chapter && q.chapter !== selected.chapter) return false;
    if (selected.topic && q.topic !== selected.topic) return false;
    if (selected.section && q.section !== selected.section) return false;
    if (selected.bookmarksOnly && !isBookmarked(q.id)) return false;
    if (selected.reviewMode === "mistakes" && !(p.incorrect || {})[q.id]) return false;
    if (selected.reviewMode === "revision" && !isRevisionMarked(q.id)) return false;
    return true;
  });
}

function showQuestions() {
  const results = document.getElementById("searchResults");
  if (!results) return;
  if (!isDashboardPage()) {
    results.innerHTML = "";
    return;
  }
  updateDashboardIntroVisibility();

  const heading = document.getElementById("listHeading");
  if (questionDataUnavailable()) {
    if (heading) heading.textContent = "Questions unavailable";
    results.innerHTML = questionDataUnavailableHtml("dashboard questions");
    bindQuestionDataRetry(results);
    return;
  }

  const questions = getFilteredQuestions();
  if (heading) heading.textContent = `Questions (${questions.length})`;
  const totalPages = Math.max(1, Math.ceil(questions.length / QUESTION_PAGE_SIZE));
  if (currentQuestionPage > totalPages) currentQuestionPage = totalPages;
  const start = (currentQuestionPage - 1) * QUESTION_PAGE_SIZE;
  const visibleQuestions = questions.slice(start, start + QUESTION_PAGE_SIZE);

  if (!questions.length) {
    results.innerHTML = `
      <div class="empty">
        <div class="emoji">🔍</div>
        <h3>No questions found</h3>
        <p>Try adjusting your filters or search query.</p>
      </div>`;
    return;
  }

  results.innerHTML = `
    <div class="question-list">
      ${visibleQuestions.map(q => renderCard(q)).join("")}
    </div>
    ${renderPagination(totalPages)}`;

  // Attach card events
  results.querySelectorAll(".card").forEach(card => {
    card.addEventListener("click", e => {
      if (e.target.closest(".bookmark-btn")) return;
      if (e.target.closest(".revision-btn")) return;
      openQuestion(Number(card.dataset.id));
    });
  });
  results.querySelectorAll(".bookmark-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      const id = Number(btn.dataset.id);
      const active = toggleBookmark(id);
      btn.classList.toggle("active", active);
      btn.innerHTML = active ? '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>';
      renderStats();
    });
  });
  results.querySelectorAll(".revision-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      const id = Number(btn.dataset.id);
      const active = toggleRevision(id);
      btn.classList.toggle("active", active);
      btn.innerHTML = active ? '<i class="fas fa-flag"></i>' : '<i class="far fa-flag"></i>';
    });
  });

  results.querySelectorAll("[data-page]").forEach(btn => {
    btn.addEventListener("click", () => {
      const page = btn.dataset.page;
      if (page === "prev") currentQuestionPage--;
      else if (page === "next") currentQuestionPage++;
      else currentQuestionPage = Number(page);
      showQuestions();
      results.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function renderPagination(totalPages) {
  if (totalPages <= 1) return "";
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return `
    <div class="pagination" aria-label="Question pages">
      <button class="page-btn" data-page="prev" ${currentQuestionPage === 1 ? "disabled" : ""}>
        <i class="fas fa-chevron-left"></i>
      </button>
      ${pages.map(page => `
        <button class="page-btn ${page === currentQuestionPage ? "active" : ""}" data-page="${page}">
          ${page}
        </button>`).join("")}
      <button class="page-btn" data-page="next" ${currentQuestionPage === totalPages ? "disabled" : ""}>
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>`;
}

function renderCard(q) {
  const bm = isBookmarked(q.id);
  const rev = isRevisionMarked(q.id);
  const p = getProgress();
  const status = (p.correct || {})[q.id] ? "Correct" : (p.incorrect || {})[q.id] ? "Wrong" : (p.attempted || {})[q.id] ? "Attempted" : "New";
  const difficulty = inferDifficulty(q);
  const questionText = richToPlainText(q.question);
  const thumb = renderThumbPlaceholder({
    variant: "dashboard-question",
    subject: q.course,
    label: q.course,
    title: q.chapter || "Practice Set",
    subtitle: q.topic || ""
  });
  return `
    <div class="card has-cs4-thumb" data-id="${q.id}">
      <div class="card-thumb-wrap">${thumb}</div>
      <div class="card-meta">
        <span class="type-badge ${q.type}">${q.type}</span>
        <span class="difficulty-badge ${difficulty}">${difficulty}</span>
        <span class="status-badge ${status}">${status}</span>
        <span class="q-badge">${esc(q.year)}</span>
        <span class="q-badge">${esc(q.section)}</span>
      </div>
      <div class="card-text">${esc(questionText)}</div>
      <div class="card-footer">
        <span>${esc(q.course)}</span>
        <span class="card-actions">
          <button class="revision-btn ${rev ? "active" : ""}" data-id="${q.id}" aria-label="revision">
            <i class="${rev ? "fas" : "far"} fa-flag"></i>
          </button>
          <button class="bookmark-btn ${bm ? "active" : ""}" data-id="${q.id}" aria-label="bookmark">
            <i class="${bm ? "fas" : "far"} fa-star"></i>
          </button>
        </span>
      </div>
    </div>`;
}

// ================= STATS =================
function renderStats() {
  const wrap = document.getElementById("heroStats");
  if (!wrap) return;
  if (questionDataUnavailable()) {
    wrap.innerHTML = `
      <div class="stat-box"><h2>--</h2><p>Total Questions</p></div>
      <div class="stat-box"><h2>--</h2><p>Attempted</p></div>
      <div class="stat-box"><h2>--</h2><p>Accuracy</p></div>
      <div class="stat-box"><h2>--</h2><p>Daily Goal</p></div>
    `;
    renderDashboardOverview();
    return;
  }
  const p = getProgress();
  const attempted = Object.keys(p.attempted || {}).length;
  const correct = Object.keys(p.correct || {}).length;
  const today = new Date().toISOString().slice(0, 10);
  const daily = (p.daily || {})[today] || 0;
  const goal = getDailyGoal();
  const acc = attempted ? Math.round((correct / attempted) * 100) : 0;
  wrap.innerHTML = `
    <div class="stat-box"><h2>${questionsData.length}</h2><p>Total Questions</p></div>
    <div class="stat-box"><h2>${attempted}</h2><p>Attempted</p></div>
    <div class="stat-box"><h2>${acc}%</h2><p>Accuracy</p></div>
    <div class="stat-box"><h2>${daily}/${goal}</h2><p>Daily Goal</p></div>
  `;
  renderDashboardOverview();
}

function progressIds(group) {
  return Object.keys(group || {}).map(Number).filter(Number.isFinite);
}

function getStudyStreak(daily = {}) {
  let streak = 0;
  const cursor = new Date();
  while (streak < 365) {
    const key = cursor.toISOString().slice(0, 10);
    if (!daily[key]) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function getRecentPractice() {
  const quiz = LS.get("quizHistory", []).map(item => ({ ...item, source: "Quiz" }));
  const mock = LS.get("mockHistory", []).map(item => ({ ...item, source: "Mock Test" }));
  return [...quiz, ...mock]
    .filter(item => item && item.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date))[0] || null;
}

function getSubjectSummary(p) {
  const attempted = p.attempted || {};
  const correct = p.correct || {};
  const incorrect = p.incorrect || {};
  return questionsData.reduce((map, q) => {
    const subject = q.course || "General";
    const item = map[subject] || { subject, total: 0, attempted: 0, correct: 0, wrong: 0 };
    item.total++;
    if (attempted[q.id]) item.attempted++;
    if (correct[q.id]) item.correct++;
    if (incorrect[q.id]) item.wrong++;
    map[subject] = item;
    return map;
  }, {});
}

function getWeakSubject(summary) {
  const attempted = Object.values(summary).filter(item => item.attempted > 0);
  if (!attempted.length) return null;
  return attempted.sort((a, b) => {
    if (b.wrong !== a.wrong) return b.wrong - a.wrong;
    const aAcc = a.attempted ? a.correct / a.attempted : 1;
    const bAcc = b.attempted ? b.correct / b.attempted : 1;
    return aAcc - bAcc;
  })[0];
}

function getRecommendedQuestion(p, weakSubject) {
  const attempted = p.attempted || {};
  const pool = weakSubject
    ? questionsData.filter(q => q.course === weakSubject.subject && !attempted[q.id])
    : questionsData.filter(q => !attempted[q.id]);
  return pool[0] || questionsData.find(q => q && q.id != null) || null;
}

function renderDashboardOverview() {
  const wrap = document.getElementById("dashboardOverview");
  if (!wrap || !isDashboardPage()) return;
  if (hasActiveFilter()) {
    wrap.hidden = true;
    wrap.setAttribute("aria-hidden", "true");
    return;
  }
  wrap.hidden = false;
  wrap.setAttribute("aria-hidden", "false");

  if (questionDataUnavailable()) {
    wrap.innerHTML = `
      <article class="dashboard-card dashboard-card-wide">
        <i class="fas fa-triangle-exclamation"></i>
        <div>
          <strong>Question data unavailable</strong>
          <span>Dashboard practice could not load the question bank.</span>
          <small>Retry after checking the connection or API status.</small>
        </div>
        <button class="dashboard-card-action" type="button" data-retry-question-data>Retry</button>
      </article>`;
    bindQuestionDataRetry(wrap);
    return;
  }

  const p = getProgress();
  const attempted = progressIds(p.attempted);
  const correct = progressIds(p.correct);
  const wrong = progressIds(p.incorrect);
  const bookmarks = getBookmarks();
  const daily = p.daily || {};
  const today = new Date().toISOString().slice(0, 10);
  const todayCount = Number(daily[today] || 0);
  const goal = getDailyGoal();
  const streak = getStudyStreak(daily);
  const recent = getRecentPractice();
  const summary = getSubjectSummary(p);
  const weak = getWeakSubject(summary);
  const recommended = getRecommendedQuestion(p, weak);
  const user = getCurrentUser();
  const plan = getUserPlan();
  const planLabel = hasAdminAccess() ? "Admin access" : `${plan === "paid" ? "Paid" : "Free"} plan`;
  const accuracy = attempted.length ? Math.round((correct.length / attempted.length) * 100) : 0;
  const weakText = weak
    ? `${weak.wrong} wrong, ${weak.correct} correct from ${weak.attempted} attempts`
    : "No weak subject yet. Attempt questions to build this signal.";
  const recentText = recent
    ? `${recent.source}: ${Number(recent.accuracy || 0)}% accuracy, ${Number(recent.correct || 0)}/${Number(recent.total || 0)} correct`
    : todayCount
      ? `${todayCount} question${todayCount === 1 ? "" : "s"} attempted today`
      : "No recent activity yet.";
  const recommendedTitle = recommended
    ? richToPlainText(recommended.question).slice(0, 110)
    : "Questions will appear after import.";
  const recommendedMeta = recommended
    ? `${recommended.course || "Question bank"} / ${recommended.topic || "Practice"}`
    : "No question data available.";

  wrap.innerHTML = `
    <article class="dashboard-card">
      <i class="fas fa-circle-check"></i>
      <div><strong>${attempted.length}</strong><span>Questions solved</span><small>${correct.length} correct, ${wrong.length} for review</small></div>
    </article>
    <article class="dashboard-card">
      <i class="fas fa-bullseye"></i>
      <div><strong>${accuracy}%</strong><span>Accuracy</span><small>${attempted.length ? "Based on attempted questions" : "Start practice to calculate accuracy"}</small></div>
    </article>
    <article class="dashboard-card">
      <i class="fas fa-fire"></i>
      <div><strong>${streak}</strong><span>Day streak</span><small>${todayCount}/${goal} daily goal today</small></div>
    </article>
    <article class="dashboard-card">
      <i class="fas fa-bookmark"></i>
      <div><strong>${bookmarks.length}</strong><span>Bookmarks</span><small>${bookmarks.length ? "Saved for revision" : "Bookmark questions to revise later"}</small></div>
      <a class="dashboard-card-action" href="${esc(getDashboardHomeHref())}?bookmarks=1">Open</a>
    </article>
    <article class="dashboard-card">
      <i class="fas fa-chart-simple"></i>
      <div><strong>${weak ? esc(weak.subject) : "Pending"}</strong><span>Weak subject</span><small>${esc(weakText)}</small></div>
    </article>
    <article class="dashboard-card">
      <i class="fas fa-clock-rotate-left"></i>
      <div><strong>Recent activity</strong><span>${esc(recentText)}</span><small>${recent?.date ? esc(new Date(recent.date).toLocaleDateString()) : "Practice history appears here"}</small></div>
    </article>
    <article class="dashboard-card">
      <i class="fas fa-id-card"></i>
      <div><strong>${esc(planLabel)}</strong><span>Subscription status</span><small>${esc(user?.email || "Signed-in account")}</small></div>
      ${plan === "paid" || hasAdminAccess() ? "" : '<a class="dashboard-card-action" href="paid.html">Upgrade</a>'}
    </article>
    <article class="dashboard-card dashboard-card-wide">
      <i class="fas fa-arrow-right"></i>
      <div><strong>Recommended next practice</strong><span>${esc(recommendedTitle)}</span><small>${esc(recommendedMeta)}</small></div>
      ${recommended ? `<button class="dashboard-card-action" type="button" data-open-question="${Number(recommended.id)}">Open</button>` : ""}
    </article>`;

  wrap.querySelectorAll("[data-open-question]").forEach(button => {
    button.addEventListener("click", () => openQuestion(Number(button.dataset.openQuestion)));
  });
}

// ================= NAVIGATION =================
function openQuestion(id) {
  const q = (searchInput?.value || "").trim();
  const params = new URLSearchParams();
  params.set("id", id);
  if (q) params.set("q", q);

  const page = window.location.pathname.toLowerCase();
  if (page.includes("paid-dashboard.html")) params.set("src", "paid");
  else if (page.includes("free.html")) params.set("src", "free");

  window.location.href = `question.html?${params.toString()}`;
}
window.openQuestion = openQuestion;

function scrollToQuestions() {
  document.getElementById("searchResults")?.scrollIntoView({ behavior: "smooth" });
}
window.scrollToQuestions = scrollToQuestions;

// ================= SCROLL-TO-TOP =================
function initScrollTop() {
  const btn = document.getElementById("scrollTop");
  if (!btn) return;
  window.addEventListener("scroll", () => {
    btn.classList.toggle("show", window.scrollY > 400);
  });
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

// ================= QUIZ =================
const quizState = { questions: [], current: 0, answers: {}, timer: null, secs: 60 };

function startQuiz() {
  const pool = getFilteredQuestions();
  if (pool.length < 1) { alert("No questions available with current filters."); return; }
  quizState.questions = [...pool].sort(() => Math.random() - 0.5).slice(0, Math.min(5, pool.length));
  quizState.current = 0;
  quizState.answers = {};
  document.getElementById("quizModal").classList.add("open");
  renderQuiz();
}
window.startQuiz = startQuiz;

function checkQuizAnswer(q, given) {
  if (given == null || given === "" || (Array.isArray(given) && !given.length)) return false;
  if (q.type === "MSQ") {
    if (!Array.isArray(q.answer)) return false;
    return [...q.answer].sort().join("|") === [...given].sort().join("|");
  }
  if (q.type === "NAT") return String(q.answer).trim() === String(given).trim();
  return q.answer === given;
}

function renderQuiz() {
  const q = quizState.questions[quizState.current];
  const questionText = richToPlainText(q.question);
  const total = quizState.questions.length;
  const card = document.getElementById("quizContent");
  const pct = (quizState.current / total) * 100;

  let optsHtml = "";
  if (q.type === "MCQ") {
    optsHtml = `<ul class="options-list">${(q.options || []).map((o, i) => {
      const sel = quizState.answers[q.id] === o ? "selected" : "";
      return `<li class="option-item ${sel}" data-pick="${esc(o)}">
        <span class="option-marker">${String.fromCharCode(65 + i)}</span>${esc(o)}</li>`;
    }).join("")}</ul>`;
  } else if (q.type === "MSQ") {
    const sel = quizState.answers[q.id] || [];
    optsHtml = `<ul class="options-list">${(q.options || []).map((o, i) => {
      const isSel = sel.includes(o) ? "selected" : "";
      return `<li class="option-item ${isSel}" data-pick-multi="${esc(o)}">
        <span class="option-marker">${String.fromCharCode(65 + i)}</span>${esc(o)}</li>`;
    }).join("")}</ul>`;
  } else {
    optsHtml = `<input type="text" class="nat-input" id="natInput" placeholder="Enter numerical answer" value="${esc(quizState.answers[q.id] || "")}">`;
  }

  card.innerHTML = `
    <div class="quiz-header">
      <h3>Question ${quizState.current + 1} of ${total}</h3>
      <span id="quizTimer" style="font-family:monospace;color:var(--danger);font-weight:700">01:00</span>
    </div>
    <div class="quiz-progress"><div class="quiz-progress-bar" style="width:${pct}%"></div></div>
    <div class="card-meta" style="margin-bottom:10px">
      <span class="type-badge ${q.type}">${q.type}</span>
      <span class="q-badge">${esc(q.year)}</span>
      <span class="q-badge">${esc(q.course)}</span>
    </div>
    <p class="q-question-text">${esc(questionText)}</p>
    ${optsHtml}
    <div class="q-nav">
      <button class="q-nav-btn" id="quizPrev" ${quizState.current === 0 ? "disabled" : ""}>
        <i class="fas fa-arrow-left"></i> Previous
      </button>
      ${quizState.current === total - 1
        ? `<button class="btn btn-primary" id="quizSubmit">Submit Quiz</button>`
        : `<button class="q-nav-btn" id="quizNext">Next <i class="fas fa-arrow-right"></i></button>`}
    </div>`;

  card.querySelectorAll("[data-pick]").forEach(el => {
    el.addEventListener("click", () => { quizState.answers[q.id] = el.dataset.pick; renderQuiz(); });
  });
  card.querySelectorAll("[data-pick-multi]").forEach(el => {
    el.addEventListener("click", () => {
      const arr = quizState.answers[q.id] || [];
      const v = el.dataset.pickMulti;
      const i = arr.indexOf(v);
      if (i >= 0) arr.splice(i, 1); else arr.push(v);
      quizState.answers[q.id] = arr;
      renderQuiz();
    });
  });
  const nat = document.getElementById("natInput");
  if (nat) nat.addEventListener("input", () => quizState.answers[q.id] = nat.value);

  document.getElementById("quizPrev")?.addEventListener("click", () => { quizState.current--; renderQuiz(); });
  document.getElementById("quizNext")?.addEventListener("click", () => { quizState.current++; renderQuiz(); });
  document.getElementById("quizSubmit")?.addEventListener("click", submitQuiz);

  startQuestionTimer();
}

function startQuestionTimer() {
  clearInterval(quizState.timer);
  quizState.secs = 60;
  const t = document.getElementById("quizTimer");
  quizState.timer = setInterval(() => {
    quizState.secs--;
    if (t) t.textContent = `00:${String(Math.max(0, quizState.secs)).padStart(2, "0")}`;
    if (quizState.secs <= 0) {
      clearInterval(quizState.timer);
      if (quizState.current < quizState.questions.length - 1) { quizState.current++; renderQuiz(); }
      else submitQuiz();
    }
  }, 1000);
}

function submitQuiz() {
  clearInterval(quizState.timer);
  let correct = 0;
  quizState.questions.forEach(q => {
    const isC = checkQuizAnswer(q, quizState.answers[q.id]);
    if (isC) correct++;
    recordAttempt(q.id, isC);
  });
  const total = quizState.questions.length;
  const card = document.getElementById("quizContent");
  card.innerHTML = `
    <div class="quiz-result">
      <div class="score">${correct}/${total}</div>
      <h3>Quiz Complete!</h3>
      <p style="color:var(--text-muted);margin:6px 0 18px">Accuracy: ${Math.round((correct/total)*100)}%</p>
      <div class="quiz-review">
        ${quizState.questions.map(q => {
          const given = quizState.answers[q.id];
          const isC = checkQuizAnswer(q, given);
          const questionText = richToPlainText(q.question);
          return `<div class="review-item ${isC ? "correct" : "wrong"}">
            <strong>${isC ? "✓" : "✗"} ${esc(questionText)}</strong>
            <div style="margin-top:6px;font-size:0.85rem;color:var(--text-muted)">
              Your answer: <b>${esc(Array.isArray(given) ? given.join(", ") : (given || "—"))}</b><br>
              Correct: <b>${esc(Array.isArray(q.answer) ? q.answer.join(", ") : (q.answer ?? "—"))}</b><br>
              <em>${esc(q.solution)}</em>
            </div></div>`;
        }).join("")}
      </div>
      <button class="btn btn-primary" id="quizClose" style="margin-top:18px">Close</button>
    </div>`;
  document.getElementById("quizClose").addEventListener("click", () => {
    document.getElementById("quizModal").classList.remove("open");
    renderStats();
    showQuestions();
  });
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", async () => {
  if (window.questionsDataReady) await window.questionsDataReady;
  bootDesignSystem();
  loadImportedQuestions();
  await refreshVerifiedUser();
  await hydrateServerProgress();
  bootBrandLogo();

  initTheme();
  initScrollTop();
  renderUserShell();
  applyContextNavigationLinks();
  bindUtilityActions();

  if (sidebarMenu) {
    const model = buildModel(questionsData);
    buildSidebar(model);
  }

  // Initialize search if present
  if (typeof initializeSearch === "function") initializeSearch();

  // Index page only
  if (document.getElementById("searchResults") && isDashboardPage()) {
    applyURLFilters();
    renderStats();
    showQuestions();
    updateChips();
    highlightSelectedInSidebar();
    updateDashboardIntroVisibility();
  }

  // Quiz button
  document.getElementById("startQuizBtn")?.addEventListener("click", startQuiz);
  document.getElementById("quizModalClose")?.addEventListener("click", () => {
    clearInterval(quizState.timer);
    document.getElementById("quizModal").classList.remove("open");
  });
});

window.addEventListener("questionsDataUpdated", () => {
  loadImportedQuestions();
  if (sidebarMenu) buildSidebar(buildModel(questionsData));
  if (isDashboardPage()) {
    renderStats();
    showQuestions();
    updateChips();
    highlightSelectedInSidebar();
    updateDashboardIntroVisibility();
  }
});

// Expose for question.html
window.SOA = {
  isBookmarked, toggleBookmark, recordAttempt, getProgress, esc,
  isRevisionMarked, toggleRevision, inferDifficulty, getAllQuestions,
  getDailyGoal, setDailyGoal,
  hasPaidAccess, getUserPlan, getDashboardHomeHref,
  isDashboardPage,
  openQuestion
};


