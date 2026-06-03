/* ==========================================================
   CS4GATE — Quiz & Mock Test Pages
   Configurable subject/chapter/topic sessions using local data.
   ========================================================== */

(function () {
  "use strict";

  const page = document.body.dataset.assessment || "quiz";
  const isMock = page === "mock";
  const config = {
    title: isMock ? "Mock Test Studio" : "Quiz Studio",
    storageKey: isMock ? "mockHistory" : "quizHistory",
    defaultCount: isMock ? 15 : 5,
    defaultMinutes: isMock ? 30 : 5,
    maxCount: isMock ? 65 : 20
  };

  const state = {
    questions: [],
    current: 0,
    answers: {},
    remaining: config.defaultMinutes * 60,
    timer: null,
    startedAt: null,
    visited: {},
    marked: {},
    mockPaletteOpen: false,
    sessionConfig: null
  };

  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
  const uniq = arr => [...new Set(arr.filter(Boolean))].sort();
  const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);
  const byId = id => questionsData.find(q => q.id === Number(id));
  const RICH_ALLOWED_TAGS = new Set([
    "h1", "h2", "h3", "h4", "h5", "h6",
    "table", "thead", "tbody", "tfoot", "tr", "th", "td",
    "p", "br", "ul", "ol", "li",
    "strong", "em", "b", "i", "u",
    "code", "pre", "sub", "sup", "hr",
    "div", "span", "img"
  ]);
  const RICH_ALLOWED_ATTRS = {
    table: new Set(["border", "cellpadding", "cellspacing"]),
    th: new Set(["colspan", "rowspan", "scope"]),
    td: new Set(["colspan", "rowspan"]),
    div: new Set(["class"]),
    span: new Set(["class"]),
    img: new Set(["src", "alt", "loading", "width", "height"])
  };

  function questionDataUnavailable() {
    const status = window.questionsDataStatus || {};
    return status.ready === true && status.ok !== true && questionsData.length === 0;
  }

  function renderQuestionDataUnavailable() {
    if (!$("assessmentRoot")) return;
    $("assessmentRoot").innerHTML = `
      <section class="content-card">
        <div class="empty data-state" role="status">
          <div class="emoji"><i class="fas fa-triangle-exclamation"></i></div>
          <h3>Question data is temporarily unavailable</h3>
          <p>${config.title} cannot start until the question bank loads.</p>
          <button class="btn btn-primary" id="retryQuestionData"><i class="fas fa-rotate-right"></i> Retry</button>
        </div>
      </section>`;
    $("retryQuestionData")?.addEventListener("click", () => window.location.reload());
  }

  function currentUser() {
    try { return JSON.parse(localStorage.getItem("soaGateCurrentUser")); }
    catch { return null; }
  }

  function hasPaidAccess() {
    const user = currentUser();
    return !!user && ((user.plan || "free") === "paid" || (user.role || "").toLowerCase() === "admin");
  }

  function getDashboardHomeHref() {
    const src = new URLSearchParams(window.location.search).get("src");
    if (src === "free") return "free.html";
    if (src === "paid") return "paid-dashboard.html";
    return hasPaidAccess() ? "paid-dashboard.html" : "free.html";
  }

  function getHistory() {
    try { return JSON.parse(localStorage.getItem(config.storageKey)) || []; }
    catch { return []; }
  }

  function saveHistory(item) {
    const history = getHistory();
    history.unshift(item);
    localStorage.setItem(config.storageKey, JSON.stringify(history.slice(0, 8)));
  }

  function checkAnswer(q, given) {
    if (given == null || given === "" || (Array.isArray(given) && !given.length)) return false;
    if (q.type === "MSQ") {
      if (!Array.isArray(q.answer)) return false;
      return [...q.answer].sort().join("|") === [...given].sort().join("|");
    }
    if (q.type === "NAT") return String(q.answer ?? "").trim() === String(given).trim();
    return q.answer === given;
  }

  function hasAnswerValue(given) {
    if (Array.isArray(given)) return given.length > 0;
    if (given == null) return false;
    return String(given).trim() !== "";
  }

  function safeQuestionImageSrc(value) {
    let src = String(value || "").trim().replace(/^https?:\/\/[^/]+\//i, "/").replace(/^\.\//, "");
    src = src.replace(/^\/+/, "").replace(/^\.\.\//, "");
    if (!/^uploads\/questions\/[A-Za-z0-9._-]+\.(png|jpe?g|webp|gif)$/i.test(src)) return "";
    return src;
  }

  function sanitizeRichNode(node, doc) {
    if (node.nodeType === Node.TEXT_NODE) return doc.createTextNode(node.textContent || "");
    if (node.nodeType !== Node.ELEMENT_NODE) return doc.createTextNode("");

    const tag = node.tagName.toLowerCase();
    if (!RICH_ALLOWED_TAGS.has(tag)) {
      const fragment = doc.createDocumentFragment();
      [...node.childNodes].forEach(child => fragment.appendChild(sanitizeRichNode(child, doc)));
      return fragment;
    }

    const clean = doc.createElement(tag);
    if (tag === "img") {
      const src = safeQuestionImageSrc(node.getAttribute("src"));
      if (!src) return doc.createTextNode("");
      clean.setAttribute("src", src);
      clean.setAttribute("alt", (node.getAttribute("alt") || "Question image").trim().slice(0, 160));
      const loading = (node.getAttribute("loading") || "lazy").trim().toLowerCase();
      clean.setAttribute("loading", loading === "eager" ? "eager" : "lazy");
      clean.setAttribute("decoding", "async");
      ["width", "height"].forEach(name => {
        const attrValue = (node.getAttribute(name) || "").trim();
        if (/^\d{1,4}$/.test(attrValue)) clean.setAttribute(name, attrValue);
      });
      clean.className = "question-image";
      return clean;
    }

    const attrAllow = RICH_ALLOWED_ATTRS[tag];
    if (attrAllow) {
      [...node.attributes].forEach(attr => {
        const name = attr.name.toLowerCase();
        const attrValue = attr.value.trim();
        if (!attrAllow.has(name)) return;
        if ((name === "colspan" || name === "rowspan") && !/^\d{1,2}$/.test(attrValue)) return;
        if (name === "scope" && !/^(row|col|rowgroup|colgroup)$/i.test(attrValue)) return;
        clean.setAttribute(name, attrValue);
      });
    }

    [...node.childNodes].forEach(child => clean.appendChild(sanitizeRichNode(child, doc)));
    return clean;
  }

  function sanitizeRichHtml(raw) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${raw == null ? "" : String(raw)}</div>`, "text/html");
    const root = doc.body.firstElementChild;
    const cleanRoot = doc.createElement("div");
    if (!root) return "";
    [...root.childNodes].forEach(child => cleanRoot.appendChild(sanitizeRichNode(child, doc)));
    return cleanRoot.innerHTML;
  }

  function renderRichContent(value) {
    return sanitizeRichHtml(value);
  }

  function richTextToPlain(value) {
    const holder = document.createElement("div");
    holder.innerHTML = value == null ? "" : String(value);
    return (holder.textContent || "").replace(/\s+/g, " ").trim();
  }

  function answerToPlain(value) {
    if (Array.isArray(value)) {
      return value.map(item => richTextToPlain(item)).join(", ");
    }
    return richTextToPlain(value);
  }

  function buildMeta() {
    const courses = uniq(questionsData.map(q => q.course));
    const chapters = uniq(questionsData.map(q => q.chapter));
    const topics = uniq(questionsData.map(q => q.topic));
    return { courses, chapters, topics };
  }

  function optionList(values, selected = "") {
    return values.map(v => `<option value="${esc(v)}" ${v === selected ? "selected" : ""}>${esc(v)}</option>`).join("");
  }

  function filteredPool() {
    const scope = $("scopeSelect").value;
    const course = $("courseSelect").value;
    const chapter = $("chapterSelect").value;
    const topic = $("topicSelect").value;
    const type = $("typeSelect").value;
    return questionsData.filter(q => {
      if (scope !== "all" && course && q.course !== course) return false;
      if ((scope === "chapter" || scope === "topic") && chapter && q.chapter !== chapter) return false;
      if (scope === "topic" && topic && q.topic !== topic) return false;
      if (type !== "all" && q.type !== type) return false;
      return true;
    });
  }

  function syncDependentSelects() {
    const scope = $("scopeSelect").value;
    const course = $("courseSelect").value;
    const chapter = $("chapterSelect").value;
    const chapters = uniq(questionsData.filter(q => !course || q.course === course).map(q => q.chapter));
    const activeChapter = chapters.includes(chapter) ? chapter : chapters[0];
    const topics = uniq(questionsData.filter(q =>
      (!course || q.course === course) && (!activeChapter || q.chapter === activeChapter)
    ).map(q => q.topic));

    $("chapterSelect").innerHTML = optionList(chapters, activeChapter);
    $("topicSelect").innerHTML = optionList(topics, topics[0]);
    $("courseField").style.display = scope === "all" ? "none" : "block";
    $("chapterField").style.display = scope === "chapter" || scope === "topic" ? "block" : "none";
    $("topicField").style.display = scope === "topic" ? "block" : "none";
    updatePreview();
  }

  function updatePreview() {
    const pool = filteredPool();
    const count = Math.min(Number($("countInput").value || config.defaultCount), pool.length);
    $("poolCount").textContent = pool.length;
    $("pickedCount").textContent = count;
    $("durationStat").textContent = `${$("durationInput").value}m`;
    $("startAssessment").disabled = pool.length === 0;
  }

  function renderShell() {
    if (!hasPaidAccess()) {
      $("assessmentRoot").innerHTML = `
        <section class="assessment-hero locked-hero">
          <div>
            <span class="eyebrow">Paid feature</span>
            <h1>${config.title} is included in the Paid plan</h1>
            <p>Free users can use the question bank with ads. Upgrade to unlock configurable quizzes, mock tests, timers, and detailed review.</p>
            <div class="assessment-actions">
              <a class="btn btn-primary" href="paid.html"><i class="fas fa-crown"></i> View Paid Version</a>
              <a class="btn btn-outline" href="free.html"><i class="fas fa-table-cells-large"></i> Back to Free Dashboard</a>
            </div>
          </div>
          <div class="assessment-hero-metrics">
            <div><strong>0 ads</strong><span>Paid dashboard</span></div>
            <div><strong>Quiz</strong><span>Unlocked</span></div>
            <div><strong>Mock</strong><span>Unlocked</span></div>
          </div>
        </section>`;
      return;
    }
    const meta = buildMeta();
    const maxCount = Math.min(config.maxCount, questionsData.length);
    $("assessmentRoot").innerHTML = `
      <section class="assessment-hero">
        <div>
          <span class="eyebrow">${isMock ? "Exam simulator" : "Focused practice"}</span>
          <h1>${config.title}</h1>
          <p>${isMock
            ? "Build a timed mock from the full question bank, one subject, one chapter, or a precise topic."
            : "Create a quick adaptive quiz by subject, chapter, topic, and question type."}</p>
        </div>
        <div class="assessment-hero-metrics">
          <div><strong>${questionsData.length}</strong><span>Questions</span></div>
          <div><strong>${meta.courses.length}</strong><span>Subjects</span></div>
          <div><strong>${getHistory().length}</strong><span>Recent</span></div>
        </div>
      </section>

      <section class="assessment-layout">
        <div class="assessment-panel">
          <div class="panel-title">
            <i class="fas fa-sliders"></i>
            <div>
              <h2>Configure ${isMock ? "Mock Test" : "Quiz"}</h2>
              <p>Choose exactly what you want to practice.</p>
            </div>
          </div>

          <div class="assessment-form">
            <label>
              <span>Mode</span>
              <select id="scopeSelect">
                <option value="all">Full syllabus</option>
                <option value="course">Subject wise</option>
                <option value="chapter">Chapter wise</option>
                <option value="topic">Topic wise</option>
              </select>
            </label>
            <label id="courseField">
              <span>Subject</span>
              <select id="courseSelect">${optionList(meta.courses)}</select>
            </label>
            <label id="chapterField">
              <span>Chapter</span>
              <select id="chapterSelect"></select>
            </label>
            <label id="topicField">
              <span>Topic</span>
              <select id="topicSelect"></select>
            </label>
            <label>
              <span>Question Type</span>
              <select id="typeSelect">
                <option value="all">All types</option>
                <option value="MCQ">MCQ only</option>
                <option value="MSQ">MSQ only</option>
                <option value="NAT">NAT only</option>
              </select>
            </label>
            <label>
              <span>Questions</span>
              <input id="countInput" type="number" min="1" max="${maxCount}" value="${Math.min(config.defaultCount, maxCount)}">
            </label>
            <label>
              <span>Duration</span>
              <input id="durationInput" type="number" min="1" max="180" value="${config.defaultMinutes}">
            </label>
            <label>
              <span>Negative Marking</span>
              <select id="negativeSelect">
                <option value="0">Off</option>
                <option value="0.33">-0.33 per wrong</option>
                <option value="1">-1 per wrong</option>
              </select>
            </label>
          </div>

          <div class="assessment-actions">
            <button class="btn btn-primary" id="startAssessment"><i class="fas fa-play"></i> Start ${isMock ? "Mock Test" : "Quiz"}</button>
            <button class="btn btn-outline" id="randomizeAssessment"><i class="fas fa-shuffle"></i> Randomize</button>
          </div>
        </div>

        <aside class="assessment-summary">
          <div class="summary-card">
            <span>Available</span>
            <strong id="poolCount">0</strong>
          </div>
          <div class="summary-card">
            <span>Selected</span>
            <strong id="pickedCount">0</strong>
          </div>
          <div class="summary-card">
            <span>Timer</span>
            <strong id="durationStat">${config.defaultMinutes}m</strong>
          </div>
        </aside>
      </section>

      <section class="assessment-session" id="assessmentSession"></section>
      <section class="history-panel" id="historyPanel"></section>
    `;

    ["scopeSelect", "courseSelect", "chapterSelect", "topicSelect", "typeSelect", "countInput", "durationInput", "negativeSelect"]
      .forEach(id => $(id).addEventListener("change", syncDependentSelects));
    $("countInput").addEventListener("input", updatePreview);
    $("durationInput").addEventListener("input", updatePreview);
    $("startAssessment").addEventListener("click", startAssessment);
    $("randomizeAssessment").addEventListener("click", randomizeConfig);
    syncDependentSelects();
    renderHistory();
  }

  function assessmentSnapshot() {
    if (!$("assessmentRoot")) return { ready: false, hasPaid: hasPaidAccess(), isMock };
    const pool = $("poolCount") ? Number($("poolCount").textContent || 0) : 0;
    return {
      ready: !!$("scopeSelect"),
      hasPaid: hasPaidAccess(),
      isMock,
      scope: $("scopeSelect")?.value || "all",
      course: $("courseSelect")?.value || "",
      chapter: $("chapterSelect")?.value || "",
      topic: $("topicSelect")?.value || "",
      type: $("typeSelect")?.value || "all",
      count: Number($("countInput")?.value || config.defaultCount),
      duration: Number($("durationInput")?.value || config.defaultMinutes),
      negative: Number($("negativeSelect")?.value || 0),
      pool
    };
  }

  function setSelectIfPresent(id, value) {
    const el = $(id);
    if (!el || value == null || value === "") return false;
    const target = String(value).trim().toLowerCase();
    const option = [...el.options].find(opt =>
      opt.value.toLowerCase() === target ||
      opt.textContent.trim().toLowerCase() === target ||
      opt.value.toLowerCase().includes(target) ||
      target.includes(opt.value.toLowerCase())
    );
    if (!option) return false;
    el.value = option.value;
    return true;
  }

  function applyAssessmentPreset(preset = {}) {
    if (!hasPaidAccess() || !$("scopeSelect")) return { applied: false, reason: "locked" };

    const scope = String(preset.scope || "").toLowerCase();
    if (["all", "course", "chapter", "topic"].includes(scope)) $("scopeSelect").value = scope;

    if (preset.course) setSelectIfPresent("courseSelect", preset.course);
    syncDependentSelects();
    if (preset.chapter) setSelectIfPresent("chapterSelect", preset.chapter);
    syncDependentSelects();
    if (preset.topic) setSelectIfPresent("topicSelect", preset.topic);
    syncDependentSelects();

    if (preset.type) {
      const normalizedType = String(preset.type).toUpperCase();
      if (["MCQ", "MSQ", "NAT", "ALL"].includes(normalizedType)) {
        $("typeSelect").value = normalizedType === "ALL" ? "all" : normalizedType;
      }
    }

    if (preset.count) {
      const maxCount = Math.min(config.maxCount, questionsData.length);
      $("countInput").value = String(Math.min(Math.max(1, Number(preset.count) || config.defaultCount), maxCount));
    }
    if (preset.duration) {
      $("durationInput").value = String(Math.min(Math.max(1, Number(preset.duration) || config.defaultMinutes), 180));
    }
    if (preset.negative != null) {
      const neg = String(preset.negative);
      if (["0", "0.33", "1"].includes(neg)) $("negativeSelect").value = neg;
    }

    updatePreview();
    return { applied: true, ...assessmentSnapshot() };
  }

  function applyPresetFromUrl() {
    if (!hasPaidAccess() || !$("scopeSelect")) return;
    const params = new URLSearchParams(window.location.search);
    if (![...params.keys()].length) return;
    const preset = {
      scope: params.get("scope") || "",
      course: params.get("course") || "",
      chapter: params.get("chapter") || "",
      topic: params.get("topic") || "",
      type: params.get("type") || "",
      count: params.get("count") || "",
      duration: params.get("duration") || "",
      negative: params.get("negative")
    };
    const result = applyAssessmentPreset(preset);
    if (result.applied && params.get("autoStart") === "1") {
      startAssessment();
    }
  }

  function randomizeConfig() {
    const courses = buildMeta().courses;
    $("scopeSelect").value = isMock ? "all" : "course";
    $("courseSelect").value = courses[Math.floor(Math.random() * courses.length)];
    $("typeSelect").value = ["all", "MCQ", "MSQ", "NAT"][Math.floor(Math.random() * 4)];
    syncDependentSelects();
  }

  function startAssessment() {
    const pool = filteredPool();
    const count = Math.min(Number($("countInput").value || config.defaultCount), pool.length);
    if (!pool.length) return;
    state.questions = shuffle(pool).slice(0, count);
    state.current = 0;
    state.answers = {};
    state.remaining = Math.max(1, Number($("durationInput").value || config.defaultMinutes)) * 60;
    state.startedAt = Date.now();
    state.visited = {};
    state.marked = {};
    state.mockPaletteOpen = false;
    state.sessionConfig = {
      scope: $("scopeSelect")?.value || "all",
      course: $("courseSelect")?.value || "",
      chapter: $("chapterSelect")?.value || "",
      topic: $("topicSelect")?.value || "",
      type: $("typeSelect")?.value || "all"
    };
    state.questions.forEach(q => {
      state.visited[q.id] = false;
      state.marked[q.id] = false;
    });
    $("assessmentSession").classList.add("active");
    renderQuestion();
    startTimer();
    $("assessmentSession").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function startTimer() {
    clearInterval(state.timer);
    state.timer = setInterval(() => {
      state.remaining--;
      updateTimer();
      if (state.remaining <= 0) finishAssessment();
    }, 1000);
    updateTimer();
  }

  function updateTimer() {
    const m = String(Math.floor(Math.max(0, state.remaining) / 60)).padStart(2, "0");
    const s = String(Math.max(0, state.remaining) % 60).padStart(2, "0");
    document.querySelectorAll("[data-assessment-timer]").forEach(el => {
      el.textContent = `${m}:${s}`;
    });
  }

  function renderQuestion() {
    if (!state.questions.length) return;
    if (isMock) {
      renderMockQuestion();
      return;
    }
    renderStandardQuestion();
  }

  function renderStandardQuestion() {
    const q = state.questions[state.current];
    const given = state.answers[q.id];
    const pct = ((state.current + 1) / state.questions.length) * 100;
    $("assessmentSession").innerHTML = `
      <div class="session-card">
        <div class="session-topbar">
          <div>
            <span class="eyebrow">${isMock ? "Mock question" : "Quiz question"}</span>
            <h2>Question ${state.current + 1} of ${state.questions.length}</h2>
          </div>
          <div class="session-timer"><i class="fas fa-clock"></i> <span id="assessmentTimer" data-assessment-timer></span></div>
        </div>
        <div class="quiz-progress"><div class="quiz-progress-bar" style="width:${pct}%"></div></div>
        <div class="card-meta">
          <span class="type-badge ${q.type}">${q.type}</span>
          <span class="q-badge">${esc(q.course)}</span>
          <span class="q-badge">${esc(q.topic)}</span>
          <span class="q-badge">${esc(q.year)}</span>
        </div>
        <div class="q-question-text rich-content">${renderRichContent(q.question)}</div>
        ${answerInput(q, given)}
        <div class="q-nav">
          <button class="q-nav-btn" id="sessionPrev" ${state.current === 0 ? "disabled" : ""}><i class="fas fa-arrow-left"></i> Previous</button>
          <button class="btn btn-outline" id="clearAnswer"><i class="fas fa-eraser"></i> Clear</button>
          ${state.current === state.questions.length - 1
            ? `<button class="btn btn-primary" id="finishAssessment"><i class="fas fa-check"></i> Submit</button>`
            : `<button class="q-nav-btn" id="sessionNext">Next <i class="fas fa-arrow-right"></i></button>`}
        </div>
      </div>
    `;
    bindAnswer(q);
    $("sessionPrev")?.addEventListener("click", () => { state.current--; renderQuestion(); });
    $("sessionNext")?.addEventListener("click", () => { state.current++; renderQuestion(); });
    $("finishAssessment")?.addEventListener("click", finishAssessment);
    $("clearAnswer").addEventListener("click", () => { delete state.answers[q.id]; renderQuestion(); });
    updateTimer();
  }

  function getMockQuestionStatus(questionId) {
    if (!state.visited[questionId]) return "not-visited";
    const answered = hasAnswerValue(state.answers[questionId]);
    const marked = !!state.marked[questionId];
    if (marked && answered) return "answered-marked";
    if (marked) return "marked";
    if (answered) return "answered";
    return "not-answered";
  }

  function mockStatusLabel(statusKey) {
    const labels = {
      "not-visited": "Not Visited",
      "not-answered": "Not Answered",
      "answered": "Answered",
      "marked": "Marked for Review",
      "answered-marked": "Answered + Marked"
    };
    return labels[statusKey] || "Not Visited";
  }

  function getMockStatusCounts() {
    const counts = {
      "not-visited": 0,
      "not-answered": 0,
      "answered": 0,
      "marked": 0,
      "answered-marked": 0
    };
    state.questions.forEach(q => {
      counts[getMockQuestionStatus(q.id)] += 1;
    });
    return counts;
  }

  function getSessionSubjectLabel() {
    const cfg = state.sessionConfig || {};
    if (cfg.scope === "topic" && cfg.topic) return cfg.topic;
    if (cfg.scope === "chapter" && cfg.chapter) return cfg.chapter;
    if (cfg.scope === "course" && cfg.course) return cfg.course;
    return "Mixed GATE CS";
  }

  function moveQuestion(step) {
    const nextIndex = state.current + step;
    if (nextIndex < 0 || nextIndex >= state.questions.length) return false;
    state.current = nextIndex;
    renderQuestion();
    return true;
  }

  function jumpToQuestion(index) {
    const target = Number(index);
    if (!Number.isFinite(target) || target < 0 || target >= state.questions.length) return;
    state.current = target;
    state.mockPaletteOpen = false;
    renderQuestion();
  }

  function renderMockQuestion() {
    const q = state.questions[state.current];
    const qId = q.id;
    state.visited[qId] = true;
    const given = state.answers[qId];
    const counts = getMockStatusCounts();
    const currentStatus = getMockQuestionStatus(qId);
    const candidate = currentUser()?.name || "Candidate";
    const openClass = state.mockPaletteOpen ? " open" : "";
    const progress = Math.round(((state.current + 1) / state.questions.length) * 100);
    const answeredCount = counts["answered"] + counts["answered-marked"];
    const unattemptedCount = counts["not-visited"] + counts["not-answered"] + counts["marked"];

    $("assessmentSession").innerHTML = `
      <div class="session-card mock-exam-card">
        <div class="mock-exam-header">
          <div class="mock-exam-candidate">
            <div class="mock-avatar"><i class="fas fa-user"></i></div>
            <div class="mock-exam-meta">
              <div><span>Candidate Name</span><strong>${esc(candidate)}</strong></div>
              <div><span>Exam Name</span><strong>GATE CS Mock</strong></div>
              <div><span>Subject</span><strong>${esc(getSessionSubjectLabel())}</strong></div>
            </div>
          </div>
          <div class="mock-exam-timer">
            <span>Remaining Time</span>
            <strong id="assessmentTimer" data-assessment-timer>00:00</strong>
          </div>
          <div class="mock-exam-tools">
            <label for="mockLanguage">Language</label>
            <select id="mockLanguage">
              <option value="english">English</option>
            </select>
            <button type="button" class="mock-palette-toggle" id="mockPaletteToggle" aria-label="Open question palette">
              <i class="fas fa-table-cells"></i>
            </button>
          </div>
        </div>

        <div class="mock-exam-progress">
          <div class="quiz-progress"><div class="quiz-progress-bar" style="width:${progress}%"></div></div>
          <div class="mock-exam-progress-text">Question ${state.current + 1} of ${state.questions.length} (${progress}%)</div>
        </div>

        <div class="mock-exam-layout">
          <section class="mock-question-panel">
            <div class="mock-question-head">
              <h2>Question ${state.current + 1}</h2>
              <span class="mock-status-pill status-${currentStatus}">${mockStatusLabel(currentStatus)}</span>
            </div>
            <div class="card-meta mock-meta">
              <span class="type-badge ${q.type}">${q.type}</span>
              <span class="q-badge">${esc(q.course)}</span>
              <span class="q-badge">${esc(q.topic)}</span>
              <span class="q-badge">${esc(q.year)}</span>
            </div>
            <div class="q-question-text rich-content">${renderRichContent(q.question)}</div>
            ${answerInput(q, given)}

            <div class="mock-actions">
              <div class="mock-actions-row">
                <button class="mock-btn save-next" id="mockSaveNext" ${state.current === state.questions.length - 1 ? "disabled" : ""}>Save &amp; Next</button>
                <button class="mock-btn clear" id="clearAnswer">Clear Response</button>
                <button class="mock-btn save-mark" id="mockSaveMark">Save &amp; Mark for Review</button>
                <button class="mock-btn mark-next" id="mockMarkNext" ${state.current === state.questions.length - 1 ? "disabled" : ""}>Mark for Review &amp; Next</button>
              </div>
              <div class="mock-actions-row secondary">
                <button class="mock-btn prev" id="sessionPrev" ${state.current === 0 ? "disabled" : ""}>Previous</button>
                <button class="mock-btn submit" id="finishAssessment">Submit</button>
              </div>
            </div>
          </section>

          <aside class="mock-palette-panel${openClass}" id="mockPalettePanel">
            <div class="mock-palette-head">
              <h3>Question Palette</h3>
              <button type="button" id="mockClosePalette" class="mock-palette-close" aria-label="Close palette">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="mock-status-legend">
              <div class="legend-item status-not-visited"><span data-status-count="not-visited">${counts["not-visited"]}</span><label>Not Visited</label></div>
              <div class="legend-item status-not-answered"><span data-status-count="not-answered">${counts["not-answered"]}</span><label>Not Answered</label></div>
              <div class="legend-item status-answered"><span data-status-count="answered">${counts["answered"]}</span><label>Answered</label></div>
              <div class="legend-item status-marked"><span data-status-count="marked">${counts["marked"]}</span><label>Marked</label></div>
              <div class="legend-item status-answered-marked"><span data-status-count="answered-marked">${counts["answered-marked"]}</span><label>Ans+Marked</label></div>
            </div>
            <div class="mock-palette-grid">
              ${state.questions.map((item, idx) => {
                const status = getMockQuestionStatus(item.id);
                const activeClass = idx === state.current ? " active" : "";
                return `<button type="button" class="mock-palette-btn status-${status}${activeClass}" data-palette-index="${idx}">${idx + 1}</button>`;
              }).join("")}
            </div>
            <div class="mock-palette-summary">
              <strong id="mockAnsweredCount">Answered: ${answeredCount}</strong>
              <span id="mockPendingCount">Pending: ${unattemptedCount}</span>
            </div>
          </aside>
        </div>
      </div>
      <div class="mock-palette-overlay${openClass}" id="mockPaletteOverlay"></div>
    `;

    bindAnswer(q, { rerender: false });
    $("clearAnswer")?.addEventListener("click", () => {
      delete state.answers[qId];
      renderQuestion();
    });
    $("sessionPrev")?.addEventListener("click", () => moveQuestion(-1));
    $("finishAssessment")?.addEventListener("click", finishAssessment);
    $("mockSaveNext")?.addEventListener("click", () => {
      state.marked[qId] = false;
      moveQuestion(1);
    });
    $("mockSaveMark")?.addEventListener("click", () => {
      state.marked[qId] = true;
      renderQuestion();
    });
    $("mockMarkNext")?.addEventListener("click", () => {
      state.marked[qId] = true;
      moveQuestion(1);
    });
    $("mockPaletteToggle")?.addEventListener("click", () => {
      state.mockPaletteOpen = true;
      renderQuestion();
    });
    $("mockClosePalette")?.addEventListener("click", () => {
      state.mockPaletteOpen = false;
      renderQuestion();
    });
    $("mockPaletteOverlay")?.addEventListener("click", () => {
      state.mockPaletteOpen = false;
      renderQuestion();
    });
    document.querySelectorAll("[data-palette-index]").forEach(button => {
      button.addEventListener("click", () => jumpToQuestion(button.dataset.paletteIndex));
    });
    updateTimer();
  }

  function syncMockLiveStatus(questionId) {
    if (!isMock) return;
    const status = getMockQuestionStatus(questionId);
    const statusClasses = ["status-not-visited", "status-not-answered", "status-answered", "status-marked", "status-answered-marked"];
    const pill = document.querySelector(".mock-status-pill");
    if (pill) {
      pill.classList.remove(...statusClasses);
      pill.classList.add(`status-${status}`);
      pill.textContent = mockStatusLabel(status);
    }
    const paletteButton = document.querySelector(`[data-palette-index="${state.current}"]`);
    if (paletteButton) {
      paletteButton.classList.remove(...statusClasses);
      paletteButton.classList.add(`status-${status}`);
    }
    const counts = getMockStatusCounts();
    Object.entries(counts).forEach(([key, value]) => {
      const el = document.querySelector(`[data-status-count="${key}"]`);
      if (el) el.textContent = value;
    });
    const answered = counts["answered"] + counts["answered-marked"];
    const pending = counts["not-visited"] + counts["not-answered"] + counts["marked"];
    if ($("mockAnsweredCount")) $("mockAnsweredCount").textContent = `Answered: ${answered}`;
    if ($("mockPendingCount")) $("mockPendingCount").textContent = `Pending: ${pending}`;
  }

  function answerInput(q, given) {
    if (q.type === "MCQ") {
      return `<ul class="options-list">${(q.options || []).map((o, i) => `
        <li class="option-item ${given === o ? "selected" : ""}" data-pick-index="${i}">
          <span class="option-marker">${String.fromCharCode(65 + i)}</span><span class="rich-content">${renderRichContent(o)}</span>
        </li>`).join("")}</ul>`;
    }
    if (q.type === "MSQ") {
      const arr = Array.isArray(given) ? given : [];
      return `<ul class="options-list">${(q.options || []).map((o, i) => `
        <li class="option-item ${arr.includes(o) ? "selected" : ""}" data-pick-multi-index="${i}">
          <span class="option-marker">${String.fromCharCode(65 + i)}</span><span class="rich-content">${renderRichContent(o)}</span>
        </li>`).join("")}</ul>`;
    }
    return `<input type="text" class="nat-input" id="sessionNat" placeholder="Enter numerical answer" value="${esc(given || "")}">`;
  }

  function bindAnswer(q, options = {}) {
    const shouldRerender = options.rerender !== false;
    document.querySelectorAll("[data-pick-index]").forEach(el => {
      el.addEventListener("click", () => {
        const index = Number(el.dataset.pickIndex);
        state.answers[q.id] = (q.options || [])[index];
        if (shouldRerender) renderQuestion();
        else el.closest(".options-list")?.querySelectorAll(".option-item").forEach(item => item.classList.remove("selected"));
        el.classList.add("selected");
        if (!shouldRerender) syncMockLiveStatus(q.id);
      });
    });
    document.querySelectorAll("[data-pick-multi-index]").forEach(el => {
      el.addEventListener("click", () => {
        const arr = Array.isArray(state.answers[q.id]) ? [...state.answers[q.id]] : [];
        const index = Number(el.dataset.pickMultiIndex);
        const v = (q.options || [])[index];
        const idx = arr.indexOf(v);
        if (idx >= 0) arr.splice(idx, 1); else arr.push(v);
        state.answers[q.id] = arr;
        if (shouldRerender) renderQuestion();
        else el.classList.toggle("selected");
        if (!shouldRerender) syncMockLiveStatus(q.id);
      });
    });
    $("sessionNat")?.addEventListener("input", e => {
      state.answers[q.id] = e.target.value;
      if (!shouldRerender) {
        const pill = document.querySelector(".mock-status-pill");
        if (pill) {
          const hasValue = hasAnswerValue(e.target.value);
          pill.classList.remove("status-not-answered", "status-answered", "status-marked", "status-answered-marked");
          if (state.marked[q.id]) {
            pill.classList.add(hasValue ? "status-answered-marked" : "status-marked");
            pill.textContent = hasValue ? "Answered + Marked" : "Marked for Review";
          } else {
            pill.classList.add(hasValue ? "status-answered" : "status-not-answered");
            pill.textContent = hasValue ? "Answered" : "Not Answered";
          }
        }
        syncMockLiveStatus(q.id);
      }
    });
  }

  function finishAssessment() {
    clearInterval(state.timer);
    if (!state.questions.length) return;
    let correct = 0, wrong = 0, skipped = 0;
    const subject = {};
    state.questions.forEach(q => {
      const isCorrect = checkAnswer(q, state.answers[q.id]);
      const given = state.answers[q.id];
      subject[q.course] = subject[q.course] || { total: 0, correct: 0, wrong: 0, skipped: 0 };
      subject[q.course].total++;
      if (isCorrect) correct++;
      else if (given == null || given === "" || (Array.isArray(given) && !given.length)) { skipped++; subject[q.course].skipped++; }
      else { wrong++; subject[q.course].wrong++; }
      if (isCorrect) subject[q.course].correct++;
      if (window.SOA) window.SOA.recordAttempt(q.id, isCorrect);
    });
    const total = state.questions.length;
    const negative = Number($("negativeSelect")?.value || 0);
    const score = Math.max(0, correct - wrong * negative);
    const accuracy = Math.round((correct / total) * 100);
    const spent = Math.round((Date.now() - state.startedAt) / 1000);
    saveHistory({ date: new Date().toISOString(), correct, wrong, skipped, total, accuracy, score, spent });
    $("assessmentSession").innerHTML = `
      <div class="session-card result-card">
        <div class="quiz-result">
          <div class="score">${score.toFixed(negative ? 2 : 0)}/${total}</div>
          <h3>${isMock ? "Mock Test Complete" : "Quiz Complete"}</h3>
          <p style="color:var(--text-muted);margin:6px 0 18px">Accuracy: ${accuracy}% • Correct: ${correct} • Wrong: ${wrong} • Skipped: ${skipped} • Time: ${Math.floor(spent / 60)}m ${spent % 60}s</p>
          <div class="history-grid">
            ${Object.entries(subject).map(([name, s]) => `<div class="history-card"><strong>${s.correct}/${s.total}</strong><span>${esc(name)}</span><small>${s.wrong} wrong, ${s.skipped} skipped</small></div>`).join("")}
          </div>
          <div class="quiz-review">
            ${state.questions.map(q => reviewItem(q)).join("")}
          </div>
          <div class="assessment-actions" style="justify-content:center;margin-top:18px">
            <button class="btn btn-primary" id="retryAssessment"><i class="fas fa-rotate-right"></i> New ${isMock ? "Mock" : "Quiz"}</button>
            <button class="btn btn-outline" id="downloadScore"><i class="fas fa-download"></i> Score Card</button>
            <a class="btn btn-outline" href="${getDashboardHomeHref()}"><i class="fas fa-table-cells-large"></i> Question Bank</a>
          </div>
        </div>
      </div>
    `;
    $("retryAssessment").addEventListener("click", () => {
      $("assessmentSession").classList.remove("active");
      $("assessmentSession").innerHTML = "";
      renderHistory();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    $("downloadScore").addEventListener("click", () => {
      const text = `CS4GATE Score Card\nType: ${isMock ? "Mock Test" : "Quiz"}\nScore: ${score.toFixed(2)}/${total}\nAccuracy: ${accuracy}%\nCorrect: ${correct}\nWrong: ${wrong}\nSkipped: ${skipped}\nTime: ${Math.floor(spent / 60)}m ${spent % 60}s`;
      const blob = new Blob([text], { type: "text/plain" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "cs4gate-score-card.txt";
      a.click();
      URL.revokeObjectURL(a.href);
    });
    renderHistory();
  }

  function reviewItem(q) {
    const given = state.answers[q.id];
    const isCorrect = checkAnswer(q, given);
    const src = getDashboardHomeHref().includes("paid-dashboard") ? "paid" : "free";
    const resultLabel = isCorrect ? "Correct" : "Incorrect";
    const yourAnswerText = hasAnswerValue(given) ? answerToPlain(given) : "Not answered";
    const correctAnswerText = answerToPlain(q.answer) || "Not set";
    const solutionHtml = renderRichContent(q.solution);
    return `<div class="review-item ${isCorrect ? "correct" : "wrong"}">
      <strong>${resultLabel}:</strong>
      <div class="rich-content" style="margin-top:6px">${renderRichContent(q.question)}</div>
      <div style="margin-top:6px;font-size:0.85rem;color:var(--text-muted)">
        Your answer: <b>${esc(yourAnswerText)}</b><br>
        Correct: <b>${esc(correctAnswerText)}</b>
      </div>
      ${solutionHtml ? `<div class="rich-content" style="margin-top:8px">${solutionHtml}</div>` : ""}
      <a href="question.html?id=${q.id}&src=${src}" style="display:inline-block;margin-top:8px;color:var(--primary);font-weight:700">Open explanation</a>
    </div>`;
  }

  function renderHistory() {
    const history = getHistory();
    $("historyPanel").innerHTML = `
      <div class="panel-title">
        <i class="fas fa-chart-line"></i>
        <div>
          <h2>Recent ${isMock ? "Mock Tests" : "Quizzes"}</h2>
          <p>Your latest local attempts on this device.</p>
        </div>
      </div>
      ${history.length ? `<div class="history-grid">${history.map(item => `
        <div class="history-card">
          <strong>${item.accuracy}%</strong>
          <span>${item.correct}/${item.total} correct</span>
          <small>${new Date(item.date).toLocaleDateString()}</small>
        </div>`).join("")}</div>` : `<div class="empty compact"><h3>No attempts yet</h3><p>Start a session to see your history here.</p></div>`}
    `;
  }

  document.addEventListener("DOMContentLoaded", async () => {
    if (window.questionsDataReady) await window.questionsDataReady;
    if (questionDataUnavailable()) {
      renderQuestionDataUnavailable();
      return;
    }
    renderShell();
    applyPresetFromUrl();

    window.SOA_ASSESSMENT = {
      isMock,
      hasPaidAccess,
      snapshot: assessmentSnapshot,
      configure: applyAssessmentPreset,
      start(configPreset = null) {
        if (configPreset && typeof configPreset === "object") {
          applyAssessmentPreset(configPreset);
        }
        if (!$("startAssessment") || $("startAssessment").disabled) return false;
        startAssessment();
        return true;
      }
    };
  });
})();


