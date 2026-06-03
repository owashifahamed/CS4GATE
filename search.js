/* ==========================================================
   CS4GATE — Advanced Search
   Real-time fuzzy search, suggestions, recent, did-you-mean,
   keyboard navigation, debounce, cache, highlights.
   ========================================================== */

const SEARCH_CONFIG = {
  enableFuzzy: true,
  fuzzyThreshold: 0.7,
  maxSuggestions: 6,
  maxRecent: 5,
  cacheEnabled: true,
  debounceMs: 180,
  maxResults: 60
};

// ============== HELPERS ==============
function normalize(str) { return (str || "").toString().trim().toLowerCase(); }

const SEARCH_STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "can", "for", "from", "has",
  "have", "how", "if", "in", "into", "is", "it", "its", "of", "on", "or", "the",
  "then", "these", "this", "to", "was", "were", "what", "when", "where", "which",
  "with", "without", "your", "given", "find", "following", "enter", "value"
]);

function tokenize(str) {
  return normalizeForSearch(str)
    .split(/\s+/)
    .filter(Boolean)
    .filter(token => token.length > 1 && !SEARCH_STOP_WORDS.has(token));
}

function normalizeForSearch(str) {
  return richToPlainText(str)
    .toLowerCase()
    .replace(/&nbsp;/g, " ")
    .replace(/[₂₃₄₅₆₇₈₉₀₁]/g, c => ({
      "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4",
      "₅": "5", "₆": "6", "₇": "7", "₈": "8", "₉": "9"
    }[c] || c))
    .replace(/[→⇒]/g, " ")
    .replace(/[·×]/g, " ")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshtein(a, b) {
  a = normalize(a); b = normalize(b);
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const m = [];
  for (let i = 0; i <= b.length; i++) { m[i] = [i]; }
  for (let j = 0; j <= a.length; j++) { m[0][j] = j; }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      m[i][j] = b.charAt(i - 1) === a.charAt(j - 1)
        ? m[i - 1][j - 1]
        : Math.min(m[i - 1][j - 1] + 1, m[i][j - 1] + 1, m[i - 1][j] + 1);
    }
  }
  return m[b.length][a.length];
}

function similarity(a, b) {
  a = normalize(a); b = normalize(b);
  if (!a.length && !b.length) return 1;
  return 1 - levenshtein(a, b) / Math.max(a.length, b.length);
}

function escHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function renderThumbPlaceholder(options = {}) {
  if (window.SOA_THUMB && typeof window.SOA_THUMB.render === "function") {
    return window.SOA_THUMB.render(options);
  }
  const label = escHtml(String(options.label || options.subject || "GATE Computer Science").toUpperCase());
  const title = escHtml(options.title || options.chapter || options.subject || "Practice");
  const subtitle = escHtml(options.subtitle || options.topic || "");
  return `
    <div class="cs4-thumb cs4-thumb--${escHtml(options.variant || "dashboard-question")}" aria-hidden="true">
      <span class="cs4-thumb-label">${label}</span>
      <strong class="cs4-thumb-title">${title}</strong>
      ${subtitle ? `<span class="cs4-thumb-subtitle">${subtitle}</span>` : ""}
      <span class="cs4-thumb-brand">CS4GATE</span>
    </div>
  `;
}

function tokenSet(tokens) {
  return new Set(tokens.map(normalize).filter(Boolean));
}

function tokenOverlapScore(queryTokens, targetTokens) {
  if (!queryTokens.length || !targetTokens.length) return 0;
  const target = tokenSet(targetTokens);
  const matched = queryTokens.filter(token => target.has(token)).length;
  return matched / queryTokens.length;
}

function jaccardScore(aTokens, bTokens) {
  const a = tokenSet(aTokens);
  const b = tokenSet(bTokens);
  if (!a.size || !b.size) return 0;
  let intersection = 0;
  a.forEach(token => { if (b.has(token)) intersection++; });
  return intersection / (a.size + b.size - intersection);
}

function compactText(str) {
  return normalizeForSearch(str).replace(/\s+/g, "");
}

function richToPlainText(value) {
  const holder = document.createElement("div");
  holder.innerHTML = value == null ? "" : String(value);
  return (holder.textContent || "").replace(/\s+/g, " ").trim();
}

function isQuestionDataUnavailable() {
  const status = window.questionsDataStatus || {};
  return status.ready === true && status.ok !== true && !(window.questionsData || questionsData || []).length;
}

function renderQuestionDataUnavailable(resultsBox) {
  resultsBox.innerHTML = `<div class="empty data-state" role="status">
    <div class="emoji"><i class="fas fa-triangle-exclamation"></i></div>
    <h3>Question data is temporarily unavailable</h3>
    <p>Search cannot run until the question bank loads.</p>
    <button class="btn btn-primary" type="button" data-retry-question-data><i class="fas fa-rotate-right"></i> Retry</button>
  </div>`;
  resultsBox.querySelector("[data-retry-question-data]")?.addEventListener("click", () => window.location.reload());
}

function highlightText(text, words) {
  if (!text) return "";
  let result = escHtml(text);
  (words || []).forEach(word => {
    if (!word || word.length < 2) return;
    const regex = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    result = result.replace(regex, m => `<mark>${m}</mark>`);
  });
  return result;
}

function getFullText(q) {
  const questionText = richToPlainText(q.question);
  const theoryText = richToPlainText(q.theory);
  const solutionText = richToPlainText(q.solution);
  return normalizeForSearch(`${q.course} ${q.chapter} ${q.topic} ${q.section} ${q.year} ${q.type} ${questionText} ${theoryText} ${solutionText}`);
}

function classifyMatch(score, exactQuestion, closeQuestion) {
  if (exactQuestion || score >= 140) return "Exact match";
  if (closeQuestion || score >= 85) return "Close match";
  return "Related";
}

function scoreQuestion(q, rawQuery) {
  const queryText = normalizeForSearch(rawQuery);
  const queryCompact = compactText(rawQuery);
  const words = tokenize(rawQuery);
  const questionText = normalizeForSearch(q.question);
  const questionCompact = compactText(q.question);
  const fullText = getFullText(q);
  const questionTokens = tokenize(q.question);
  const metadataTokens = tokenize(`${q.course} ${q.chapter} ${q.topic} ${q.section} ${q.year} ${q.type}`);
  const fullTokens = tokenize(fullText);
  let score = 0;

  const exactQuestion = !!queryText && (questionText.includes(queryText) || queryText.includes(questionText));
  if (exactQuestion) score += 180;

  if (queryCompact.length >= 12 && questionCompact.includes(queryCompact)) score += 160;
  if (queryCompact.length >= 18 && queryCompact.includes(questionCompact)) score += 150;

  const questionCoverage = tokenOverlapScore(words, questionTokens);
  const fullCoverage = tokenOverlapScore(words, fullTokens);
  const metadataCoverage = tokenOverlapScore(words, metadataTokens);
  const questionJaccard = jaccardScore(words, questionTokens);

  score += Math.round(questionCoverage * 90);
  score += Math.round(questionJaccard * 80);
  score += Math.round(fullCoverage * 45);
  score += Math.round(metadataCoverage * 35);

  words.forEach(word => {
    if (questionText.includes(word)) score += 9;
    else if (fullText.includes(word)) score += 4;
    if (normalizeForSearch(q.course).includes(word)) score += 18;
    if (normalizeForSearch(q.topic).includes(word)) score += 16;
    if (normalizeForSearch(q.chapter).includes(word)) score += 12;
    if (String(q.year).includes(word)) score += 16;
    if (normalizeForSearch(q.type) === word) score += 12;
  });

  let closeQuestion = false;
  if (SEARCH_CONFIG.enableFuzzy) {
    const queryLength = queryText.length;
    if (queryLength >= 18) {
      const phraseSimilarity = similarity(queryText.slice(0, 220), questionText.slice(0, 220));
      if (phraseSimilarity >= 0.62) {
        score += Math.round(phraseSimilarity * 80);
        closeQuestion = true;
      }
    }
    words.forEach(word => {
      if (word.length < 4) return;
      const maxSim = Math.max(
        ...metadataTokens.map(token => similarity(word, token)),
        ...questionTokens.slice(0, 80).map(token => similarity(word, token))
      );
      if (maxSim >= SEARCH_CONFIG.fuzzyThreshold) score += Math.round(maxSim * 10);
    });
  }

  return {
    q,
    score,
    exactQuestion,
    closeQuestion,
    label: classifyMatch(score, exactQuestion, closeQuestion)
  };
}

// ============== RECENT SEARCHES ==============
function loadRecentSearches() {
  try { return JSON.parse(localStorage.getItem("recentSearches")) || []; }
  catch { return []; }
}
function saveRecentSearch(query) {
  if (!query) return;
  let recent = loadRecentSearches().filter(q => q !== query);
  recent.unshift(query);
  if (recent.length > SEARCH_CONFIG.maxRecent) recent = recent.slice(0, SEARCH_CONFIG.maxRecent);
  localStorage.setItem("recentSearches", JSON.stringify(recent));
}

// ============== CACHE ==============
const searchCache = {};
function getCached(k) { return SEARCH_CONFIG.cacheEnabled ? (searchCache[k] || null) : null; }
function setCached(k, v) { if (SEARCH_CONFIG.cacheEnabled) searchCache[k] = v; }

// ============== SUGGESTIONS ==============
function buildSuggestions(words) {
  const suggestions = [];
  const seen = new Set();
  const qWords = words.map(normalize);

  // Match course/chapter/topic/section names
  questionsData.forEach(q => {
    [["course", q.course], ["chapter", q.chapter], ["topic", q.topic], ["section", q.section]].forEach(([cat, val]) => {
      if (!val) return;
      const v = normalize(val);
      if (qWords.some(w => v.includes(w)) && !seen.has(v)) {
        seen.add(v);
        suggestions.push({ text: val, badge: cat });
      }
    });
  });

  return suggestions.slice(0, SEARCH_CONFIG.maxSuggestions);
}

function renderSuggestions(container, suggestions, recent, popularQuestions, query, onClick, onQuestionClick) {
  let html = `<div class="search-suggestions-inner">`;

  if (recent.length && !query) {
    html += `<div class="suggest-group">
      <div class="suggest-title">Recent</div>
      ${recent.map(r =>
        `<div class="suggest-item" data-value="${escHtml(r)}"><i class="fas fa-clock"></i>${escHtml(r)}</div>`
      ).join("")}
    </div>`;
  }

  if (suggestions.length) {
    html += `<div class="suggest-group">
      <div class="suggest-title">Suggestions</div>
      ${suggestions.map(s =>
        `<div class="suggest-item" data-value="${escHtml(s.text)}">
          <i class="fas fa-search"></i>${escHtml(s.text)}
          <span class="badge-mini">${escHtml(s.badge)}</span>
        </div>`
      ).join("")}
    </div>`;
  }

  if (popularQuestions.length) {
    html += `<div class="suggest-group">
      <div class="suggest-title">Questions</div>
      ${popularQuestions.map(q => {
        const questionText = richToPlainText(q.question);
        return `<div class="suggest-item" data-qid="${q.id}">
          <i class="fas fa-question-circle"></i>${escHtml(questionText.slice(0, 70))}${questionText.length > 70 ? "…" : ""}
          <span class="badge-mini">${escHtml(q.course)}</span>
        </div>`;
      }).join("")}
    </div>`;
  }

  if (!recent.length && !suggestions.length && !popularQuestions.length) {
    html += `<div class="suggest-group"><div class="suggest-item" style="color:var(--text-muted)">No matches</div></div>`;
  }

  html += `</div>`;
  container.innerHTML = html;
  container.style.display = "block";

  container.querySelectorAll(".suggest-item[data-value]").forEach(item => {
    item.addEventListener("mousedown", e => {
      e.preventDefault();
      onClick(item.getAttribute("data-value"));
    });
  });
  container.querySelectorAll(".suggest-item[data-qid]").forEach(item => {
    item.addEventListener("mousedown", e => {
      e.preventDefault();
      onQuestionClick(Number(item.getAttribute("data-qid")));
    });
  });
}

// ============== DID YOU MEAN ==============
function getDidYouMean(query) {
  const qNorm = normalize(query);
  if (qNorm.length < 3) return null;

  const candidates = new Set();
  questionsData.forEach(q => {
    [q.course, q.chapter, q.topic, q.section].forEach(s => {
      normalize(s).split(/\W+/).forEach(w => { if (w.length > 3) candidates.add(w); });
    });
  });

  const qWords = qNorm.split(/\s+/);
  let changed = false;
  const fixed = qWords.map(w => {
    if (w.length < 4) return w;
    let best = null, bestDist = 3;
    candidates.forEach(c => {
      const d = levenshtein(w, c);
      if (d > 0 && d < bestDist) { bestDist = d; best = c; }
    });
    if (best) { changed = true; return best; }
    return w;
  });

  return changed ? fixed.join(" ") : null;
}

// ============== MAIN SEARCH ==============
function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

async function initializeSearch() {
  const input = document.getElementById("searchInput");
  const resultsBox = document.getElementById("searchResults");
  if (!input || !resultsBox) return;
  if (window.questionsDataReady) {
    try { await window.questionsDataReady; } catch {}
  }
  if (isQuestionDataUnavailable()) {
    renderQuestionDataUnavailable(resultsBox);
    return;
  }

  function slugify(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);
  }

  function staticQuestionHref(id) {
    const question = (window.questionsData || []).find(item => Number(item.id) === Number(id));
    if (!question) return "index.html";
    return `${question.id}-${slugify(question.topic || richToPlainText(question.question))}.html`;
  }

  function questionPageHref(id, queryText = "") {
    const inQuestionsFolder = window.location.pathname.includes("/questions/");
    if (window.CS4_STATIC_MODE) {
      const base = inQuestionsFolder ? "../question.html" : "question.html";
      return `${base}?id=${id}` + (queryText ? `&q=${encodeURIComponent(queryText)}` : "");
    }
    if (inQuestionsFolder) {
      return staticQuestionHref(id);
    }
    const base = "question.html";
    return `${base}?id=${id}` + (queryText ? `&q=${encodeURIComponent(queryText)}` : "");
  }

  // Inject suggestion box + clear button
  const wrapper = input.parentElement;
  wrapper.style.position = "relative";

  let clearBtn = document.getElementById("searchClearBtn");
  if (!clearBtn) {
    clearBtn = document.createElement("button");
    clearBtn.id = "searchClearBtn";
    clearBtn.className = "search-clear-btn";
    clearBtn.innerHTML = '<i class="fas fa-times"></i>';
    clearBtn.setAttribute("aria-label", "Clear search");
    wrapper.appendChild(clearBtn);
  }

  let suggestBox = document.getElementById("searchSuggestions");
  if (!suggestBox) {
    suggestBox = document.createElement("div");
    suggestBox.id = "searchSuggestions";
    wrapper.appendChild(suggestBox);
  }

  let activeIdx = -1;
  const isQuestionPage = window.location.pathname.includes("question.html");

  function getActiveItems() { return suggestBox.querySelectorAll(".suggest-item"); }

  function moveHighlight(dir) {
    const items = getActiveItems();
    if (!items.length) return;
    activeIdx += dir;
    if (activeIdx < 0) activeIdx = items.length - 1;
    if (activeIdx >= items.length) activeIdx = 0;
    items.forEach((it, i) => it.classList.toggle("active", i === activeIdx));
  }

  function selectActive() {
    const items = getActiveItems();
    if (!items.length || activeIdx < 0) return null;
    return items[activeIdx];
  }

  function runSearch(query) {
    const raw = (query || "").trim();
    const qNorm = normalize(raw);
    if (isQuestionDataUnavailable()) {
      renderQuestionDataUnavailable(resultsBox);
      return;
    }

    if (!qNorm) {
      // No query — restore default question grid (index page only)
      resultsBox.innerHTML = "";
      if (typeof showQuestions === "function" && !isQuestionPage) showQuestions();
      return;
    }

    const cached = getCached(qNorm);
    if (cached) {
      resultsBox.innerHTML = cached;
      // Cached HTML still needs fresh event binding after each render.
      resultsBox.querySelectorAll(".card[data-search]").forEach(card => {
        card.addEventListener("click", () => {
          const id = Number(card.dataset.id);
          window.location.href = questionPageHref(id, raw);
        });
      });
      resultsBox.querySelectorAll(".did-you-mean").forEach(el => {
        el.addEventListener("click", () => {
          const v = el.dataset.dym;
          input.value = v;
          runSearch(v);
        });
      });
      return;
    }

    const words = tokenize(raw);

    // Score every question
    const ranked = (window.questionsData || questionsData)
      .map(q => scoreQuestion(q, raw))
      .filter(r => {
        if (words.length >= 5) return r.score >= 22;
        if (words.length >= 2) return r.score >= 18;
        return r.score >= 10;
      })
      .sort((a, b) => b.score - a.score || Number(a.q.id) - Number(b.q.id))
      .slice(0, SEARCH_CONFIG.maxResults);

    let html = "";
    if (!ranked.length) {
      const dym = getDidYouMean(raw);
      if (dym) {
        html += `<div class="empty">
          <div class="emoji">🤔</div>
          <h3>No results found</h3>
          <p>Did you mean <span class="did-you-mean" data-dym="${escHtml(dym)}">"${escHtml(dym)}"</span>?</p>
        </div>`;
      } else {
        html += `<div class="empty">
          <div class="emoji">🔍</div>
          <h3>No results found</h3>
          <p>Try different keywords.</p>
        </div>`;
      }
    } else {
      // Group by course • year
      let currentGroup = "";
      const exactCount = ranked.filter(item => item.label === "Exact match").length;
      const closeCount = ranked.filter(item => item.label === "Close match").length;
      const relatedCount = ranked.length - exactCount - closeCount;
      html += `<div class="search-summary">
        <h3 class="section-heading">Search Results (${ranked.length})</h3>
        <p>${exactCount ? `${exactCount} exact` : ""}${exactCount && closeCount ? " · " : ""}${closeCount ? `${closeCount} close` : ""}${(exactCount || closeCount) && relatedCount ? " · " : ""}${relatedCount ? `${relatedCount} related` : ""}</p>
      </div>`;
      ranked.forEach(({ q, label, score }) => {
        const questionText = richToPlainText(q.question);
        const groupKey = `${q.course} • ${q.year}`;
        if (groupKey !== currentGroup) {
          if (currentGroup) html += `</div>`;
          currentGroup = groupKey;
          html += `<div class="search-group-title">${escHtml(groupKey)}</div><div class="question-list">`;
        }
        html += `
          <div class="card has-cs4-thumb" data-id="${q.id}" data-search="1">
            <div class="card-thumb-wrap">${renderThumbPlaceholder({
              variant: "dashboard-question",
              subject: q.course,
              label: q.course,
              title: q.chapter || "Practice Set",
              subtitle: q.topic || ""
            })}</div>
            <div class="card-meta">
              <span class="type-badge ${q.type}">${q.type}</span>
              <span class="q-badge">${escHtml(q.year)}</span>
              <span class="q-badge">${escHtml(q.section)}</span>
              <span class="q-badge">${escHtml(label)}</span>
            </div>
            <div class="card-text">${highlightText(questionText, words)}</div>
            <div class="card-footer">
              <span>${highlightText(`${q.course} / ${q.chapter} / ${q.topic}`, words)}</span>
              <span class="search-score">Score ${Math.round(score)}</span>
            </div>
          </div>`;
      });
      if (currentGroup) html += `</div>`;
    }

    resultsBox.innerHTML = html;
    setCached(qNorm, html);
    saveRecentSearch(raw);

    // Wire up clicks
    resultsBox.querySelectorAll(".card[data-search]").forEach(card => {
      card.addEventListener("click", () => {
        const id = Number(card.dataset.id);
        window.location.href = questionPageHref(id, raw);
      });
    });
    resultsBox.querySelectorAll(".did-you-mean").forEach(el => {
      el.addEventListener("click", () => {
        const v = el.dataset.dym;
        input.value = v;
        runSearch(v);
      });
    });
  }

  const debouncedSearch = debounce(runSearch, SEARCH_CONFIG.debounceMs);

  function refreshSuggestions() {
    const q = input.value.trim();
    const words = tokenize(q);
    const recent = q ? [] : loadRecentSearches();
    const sugg = q ? buildSuggestions(words) : [];
    const popQ = q
      ? questionsData
          .filter(item => words.some(w => getFullText(item).includes(w)))
          .slice(0, 4)
      : [];
    renderSuggestions(suggestBox, sugg, recent, popQ, q,
      v => { input.value = v; suggestBox.style.display = "none"; runSearch(v); },
      id => { window.location.href = questionPageHref(id, q); }
    );
  }

  input.addEventListener("input", () => {
    activeIdx = -1;
    const v = input.value;
    clearBtn.classList.toggle("show", !!v);
    refreshSuggestions();
    debouncedSearch(v);
  });

  input.addEventListener("focus", refreshSuggestions);
  input.addEventListener("blur", () => setTimeout(() => suggestBox.style.display = "none", 180));

  input.addEventListener("keydown", e => {
    if (e.key === "ArrowDown") { e.preventDefault(); moveHighlight(1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); moveHighlight(-1); }
    else if (e.key === "Enter") {
      const item = selectActive();
      if (item) {
        e.preventDefault();
        if (item.dataset.qid) {
          window.location.href = questionPageHref(item.dataset.qid, input.value.trim());
        } else {
          input.value = item.dataset.value;
          suggestBox.style.display = "none";
          runSearch(item.dataset.value);
        }
      } else {
        runSearch(input.value);
        suggestBox.style.display = "none";
      }
    } else if (e.key === "Escape") {
      suggestBox.style.display = "none";
      input.blur();
    }
  });

  clearBtn.addEventListener("click", () => {
    input.value = "";
    clearBtn.classList.remove("show");
    suggestBox.style.display = "none";
    runSearch("");
    input.focus();
  });

  document.addEventListener("click", e => {
    if (!suggestBox.contains(e.target) && e.target !== input && e.target !== clearBtn) {
      suggestBox.style.display = "none";
    }
  });

  window.addEventListener("questionsDataUpdated", () => {
    Object.keys(searchCache).forEach(key => delete searchCache[key]);
    if (input.value.trim()) runSearch(input.value);
  });
  window.addEventListener("questionsDataUnavailable", () => {
    Object.keys(searchCache).forEach(key => delete searchCache[key]);
    renderQuestionDataUnavailable(resultsBox);
  });
}

// Expose
window.initializeSearch = initializeSearch;


