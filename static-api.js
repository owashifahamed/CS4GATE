(function () {
  "use strict";

  const DATA = window.CS4_STATIC_DATA || {};
  const STATE_KEY = "cs4gateStaticState:v1";
  const CSRF_TOKEN = "static-demo-csrf-token";
  const originalFetch = window.fetch.bind(window);

  window.CS4_STATIC_MODE = true;

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function initialState() {
    return {
      version: 1,
      questions: clone(DATA.questions || []),
      users: clone(DATA.users || []),
      currentUserId: null,
      progress: {},
      comments: [],
      likes: [],
      notes: [],
      messages: [],
      media: [],
      designSettings: clone(DATA.designSettings || {}),
      captchaAnswer: "5"
    };
  }

  function loadState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STATE_KEY) || "null");
      if (parsed && parsed.version === 1) return parsed;
    } catch {}
    const state = initialState();
    saveState(state);
    return state;
  }

  function saveState(state) {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  }

  function response(payload, status = 200) {
    return Promise.resolve(new Response(JSON.stringify(payload), {
      status,
      headers: { "Content-Type": "application/json; charset=utf-8" }
    }));
  }

  function error(message, status = 422) {
    return response({ error: message }, status);
  }

  function publicUser(user) {
    if (!user) return null;
    return {
      id: Number(user.id),
      name: user.name,
      email: user.email,
      role: user.role || "student",
      plan: user.plan || "free",
      targetYear: user.target_year || user.targetYear || "",
      target_year: user.target_year || user.targetYear || ""
    };
  }

  function currentUser(state) {
    return publicUser(state.users.find(user => Number(user.id) === Number(state.currentUserId)));
  }

  function slugify(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function courseByValue(value) {
    const normalized = String(value || "").trim().toLowerCase();
    return (DATA.courses || []).find(course =>
      course.name.toLowerCase() === normalized ||
      course.slug.toLowerCase() === normalized ||
      course.table.toLowerCase() === normalized
    ) || null;
  }

  function canonicalCourse(value) {
    return courseByValue(value)?.name || String(value || "").trim();
  }

  function stripHtml(value) {
    const holder = document.createElement("div");
    holder.innerHTML = String(value || "");
    return (holder.textContent || "").replace(/\s+/g, " ").trim();
  }

  function nowSql() {
    return new Date().toISOString().slice(0, 19).replace("T", " ");
  }

  function normalizeQuestion(question) {
    return {
      id: Number(question.id),
      course: canonicalCourse(question.course),
      chapter: String(question.chapter || ""),
      topic: String(question.topic || ""),
      section: String(question.section || "All Question"),
      year: String(question.year || ""),
      type: String(question.type || "MCQ"),
      difficulty: question.difficulty || null,
      question: String(question.question || ""),
      options: Array.isArray(question.options) ? clone(question.options) : null,
      answer: clone(question.answer ?? ""),
      theory: String(question.theory || ""),
      solution: String(question.solution || ""),
      updated_at: question.updated_at || nowSql()
    };
  }

  function parseBody(options) {
    if (!options || options.body == null) return {};
    if (typeof options.body === "string") {
      try { return JSON.parse(options.body); } catch { return {}; }
    }
    return options.body;
  }

  function keyFor(userId, questionId, course) {
    return `${userId}:${Number(questionId)}:${canonicalCourse(course)}`;
  }

  function questionsApi(url, options) {
    if ((options.method || "GET").toUpperCase() !== "GET") return error("Method not allowed.", 405);
    const state = loadState();
    const meta = url.searchParams.get("meta") || "";
    if (meta === "courses") return response({ courses: clone(DATA.courses || []) });
    if (meta === "home_stats") {
      const active = new Set(state.questions.map(question => question.course));
      return response({
        questions: { total: state.questions.length },
        subjects: { uploaded: active.size, configured: (DATA.courses || []).length },
        students: { total: state.users.filter(user => String(user.role || "student").toLowerCase() !== "admin").length }
      });
    }

    const filters = {
      course: url.searchParams.get("course") || "",
      chapter: url.searchParams.get("chapter") || "",
      topic: url.searchParams.get("topic") || "",
      section: url.searchParams.get("section") || "",
      year: url.searchParams.get("year") || "",
      type: url.searchParams.get("type") || "",
      q: (url.searchParams.get("q") || "").toLowerCase(),
      id: url.searchParams.get("id")
    };
    const limit = Math.max(1, Math.min(500, Number(url.searchParams.get("limit") || 200)));
    const rows = state.questions.filter(question => {
      if (filters.course && question.course !== canonicalCourse(filters.course)) return false;
      if (filters.chapter && question.chapter !== filters.chapter) return false;
      if (filters.topic && question.topic !== filters.topic) return false;
      if (filters.section && question.section !== filters.section) return false;
      if (filters.year && question.year !== filters.year) return false;
      if (filters.type && question.type !== filters.type) return false;
      if (filters.id && Number(question.id) !== Number(filters.id)) return false;
      if (filters.q) {
        const haystack = [
          question.course, question.chapter, question.topic, question.section,
          question.year, question.type, stripHtml(question.question),
          stripHtml(question.theory), stripHtml(question.solution)
        ].join(" ").toLowerCase();
        if (!haystack.includes(filters.q)) return false;
      }
      return true;
    }).sort((a, b) => Number(a.id) - Number(b.id));
    return response({
      data: clone(rows.slice(0, limit)),
      meta: {
        limit,
        totalFetched: rows.length,
        returned: Math.min(rows.length, limit),
        truncated: rows.length > limit
      }
    });
  }

  function authApi(url, options) {
    const state = loadState();
    const action = url.searchParams.get("action") || "";
    const body = parseBody(options);

    if (action === "csrf") return response({ csrfToken: CSRF_TOKEN });
    if (action === "captcha") {
      state.captchaAnswer = "5";
      saveState(state);
      return response({ captcha: { question: "2 + 3 = ?" } });
    }
    if (action === "me") return response({ user: currentUser(state) });
    if (action === "logout") {
      state.currentUserId = null;
      saveState(state);
      return response({ ok: true });
    }
    if (action === "signin") {
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "");
      if (String(body.captchaAnswer || "").trim() !== state.captchaAnswer) {
        return error("Bot check failed. Please try again.");
      }
      const user = state.users.find(item => item.email.toLowerCase() === email && item.password === password);
      if (!user) return error("Invalid email or password.", 401);
      state.currentUserId = Number(user.id);
      saveState(state);
      return response({ user: publicUser(user) });
    }
    if (action === "signup") {
      const name = String(body.name || "").trim();
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "");
      if (String(body.captchaAnswer || "").trim() !== state.captchaAnswer) {
        return error("Bot check failed. Please try again.");
      }
      if (!name || !email.includes("@")) return error("Name and a valid email are required.");
      if (password.length < 6) return error("Password must be at least 6 characters.");
      if (state.users.some(user => user.email.toLowerCase() === email)) {
        return error("An account with this email already exists.", 409);
      }
      state.users.push({
        id: Math.max(0, ...state.users.map(user => Number(user.id))) + 1,
        name,
        email,
        password,
        role: "student",
        plan: "free",
        target_year: String(body.targetYear || ""),
        email_verified_at: nowSql(),
        created_at: nowSql()
      });
      saveState(state);
      return response({
        ok: true,
        message: "Static demo account created. You can sign in immediately."
      }, 201);
    }
    if (action === "resend_verification") {
      return response({ ok: true, message: "Static demo accounts are already verified." });
    }
    if (action === "forgot") {
      return response({ ok: true, message: "Static demo mode does not send email. Use one of the demo accounts." });
    }
    if (action === "reset") {
      return response({ ok: true, message: "Static demo password reset completed." });
    }
    return error("Unknown auth action.", 404);
  }

  function progressApi(options) {
    const state = loadState();
    const user = currentUser(state);
    if (!user) return error("Sign in required.", 401);
    const method = (options.method || "GET").toUpperCase();
    const userProgress = state.progress[user.id] || {};
    if (method === "GET") return response({ data: Object.values(userProgress) });

    const body = parseBody(options);
    const questionId = Number(body.questionId || 0);
    const course = canonicalCourse(body.course);
    if (!questionId || !course) return error("questionId and course are required.");
    const key = keyFor(user.id, questionId, course);
    const current = userProgress[key] || {
      question_id: questionId,
      course,
      attempts: 0,
      is_correct: null,
      marked_revision: 0,
      bookmarked: 0,
      last_attempted_at: null
    };
    if (Object.prototype.hasOwnProperty.call(body, "isCorrect")) {
      current.attempts += 1;
      current.is_correct = body.isCorrect ? 1 : 0;
      current.last_attempted_at = nowSql();
    }
    if (Object.prototype.hasOwnProperty.call(body, "markedRevision")) current.marked_revision = body.markedRevision ? 1 : 0;
    if (Object.prototype.hasOwnProperty.call(body, "marked_revision")) current.marked_revision = body.marked_revision ? 1 : 0;
    if (Object.prototype.hasOwnProperty.call(body, "bookmarked")) current.bookmarked = body.bookmarked ? 1 : 0;
    userProgress[key] = current;
    state.progress[user.id] = userProgress;
    saveState(state);
    return response({ ok: true });
  }

  function interactionsApi(url, options) {
    const state = loadState();
    const user = currentUser(state);
    const method = (options.method || "GET").toUpperCase();
    if (method === "GET") {
      const questionId = Number(url.searchParams.get("questionId") || 0);
      const course = canonicalCourse(url.searchParams.get("course") || "");
      const comments = state.comments
        .filter(comment => Number(comment.questionId) === questionId && (!course || comment.course === course))
        .filter(comment => comment.status === "approved" || user?.role === "admin")
        .map(comment => ({
          ...comment,
          canDelete: !!user && (user.role === "admin" || Number(user.id) === Number(comment.userId))
        }));
      const likes = state.likes.filter(item => Number(item.questionId) === questionId && (!course || item.course === course));
      const noteKey = user ? keyFor(user.id, questionId, course) : "";
      return response({
        comments,
        likes: { count: likes.length, userLiked: !!user && likes.some(item => Number(item.userId) === Number(user.id)) },
        note: noteKey ? (state.notes.find(item => item.key === noteKey)?.note || "") : "",
        signedIn: !!user
      });
    }
    if (!user) return error("Sign in required.", 401);
    const body = parseBody(options);
    const action = String(body.action || "");
    const questionId = Number(body.questionId || 0);
    const course = canonicalCourse(body.course);
    if (!questionId || !course) return error("questionId and course are required.");

    if (action === "comment") {
      const text = String(body.body || "").trim();
      if (!text) return error("Comment must be between 1 and 2000 characters.");
      const status = user.role === "admin" ? "approved" : "pending";
      state.comments.push({
        id: Math.max(0, ...state.comments.map(comment => Number(comment.id))) + 1,
        userId: user.id,
        questionId,
        course,
        authorName: user.name,
        body: text,
        status,
        createdAt: nowSql()
      });
      saveState(state);
      return response({ ok: true, status }, 201);
    }
    if (action === "like") {
      const liked = body.liked !== false;
      state.likes = state.likes.filter(item => !(Number(item.userId) === Number(user.id) && Number(item.questionId) === questionId && item.course === course));
      if (liked) state.likes.push({ userId: user.id, questionId, course });
      saveState(state);
      const count = state.likes.filter(item => Number(item.questionId) === questionId && item.course === course).length;
      return response({ ok: true, count, userLiked: liked });
    }
    if (action === "note") {
      const noteKey = keyFor(user.id, questionId, course);
      state.notes = state.notes.filter(item => item.key !== noteKey);
      if (String(body.note || "").trim()) state.notes.push({ key: noteKey, note: String(body.note).trim() });
      saveState(state);
      return response({ ok: true });
    }
    if (action === "deleteComment") {
      const commentId = Number(body.commentId || 0);
      state.comments = state.comments.filter(comment => Number(comment.id) !== commentId);
      saveState(state);
      return response({ ok: true });
    }
    return error("Unknown action.", 404);
  }

  function taxonomy(state) {
    const years = {};
    const types = {};
    const courses = (DATA.courses || []).map(course => {
      const rows = state.questions.filter(question => question.course === course.name);
      const groups = new Map();
      rows.forEach(question => {
        years[question.year] = (years[question.year] || 0) + 1;
        types[question.type] = (types[question.type] || 0) + 1;
        const key = [question.chapter, question.topic, question.section, question.year, question.type, question.difficulty || ""].join("|");
        if (!groups.has(key)) {
          groups.set(key, {
            chapter: question.chapter,
            topic: question.topic,
            section: question.section,
            year: question.year,
            type: question.type,
            difficulty: question.difficulty,
            count: 0
          });
        }
        groups.get(key).count += 1;
      });
      return { ...course, course: course.name, count: rows.length, items: Array.from(groups.values()) };
    });
    return { courses, years, types };
  }

  function requireAdmin(state) {
    const user = currentUser(state);
    return user && user.role === "admin" ? user : null;
  }

  function adminDashboardApi(url, options) {
    const state = loadState();
    const admin = requireAdmin(state);
    if (!admin) return error("Admin access required.", 403);
    const action = url.searchParams.get("action") || "summary";
    const method = (options.method || "GET").toUpperCase();

    if (method === "GET") {
      if (action === "summary") {
        const byCourse = (DATA.courses || []).map(course => ({
          course: course.name,
          slug: course.slug,
          category: course.category,
          enabled: course.enabled,
          count: state.questions.filter(question => question.course === course.name).length
        }));
        return response({
          admin,
          questions: { total: state.questions.length, byCourse },
          users: {
            total: state.users.length,
            paid: state.users.filter(user => user.plan === "paid").length,
            free: state.users.filter(user => user.plan === "free").length,
            admins: state.users.filter(user => user.role === "admin").length,
            unverified: 0
          },
          moderation: {
            pendingComments: state.comments.filter(comment => comment.status === "pending").length,
            newMessages: state.messages.filter(message => message.status === "new").length
          },
          engagement: { likes: state.likes.length }
        });
      }
      if (action === "questions") {
        const course = canonicalCourse(url.searchParams.get("course") || "");
        const search = (url.searchParams.get("q") || "").toLowerCase();
        const year = url.searchParams.get("year") || "";
        const type = url.searchParams.get("type") || "";
        const limit = Number(url.searchParams.get("limit") || 100);
        const rows = state.questions.filter(question => {
          if (course && question.course !== course) return false;
          if (year && question.year !== year) return false;
          if (type && question.type !== type) return false;
          if (search) {
            const haystack = [question.id, question.question, question.chapter, question.topic, question.year].join(" ").toLowerCase();
            if (!haystack.includes(search)) return false;
          }
          return true;
        }).slice(0, limit).map(question => ({ ...question, plainQuestion: stripHtml(question.question).slice(0, 180) }));
        return response({ data: clone(rows) });
      }
      if (action === "question") {
        const course = canonicalCourse(url.searchParams.get("course") || "");
        const id = Number(url.searchParams.get("id") || 0);
        const question = state.questions.find(item => Number(item.id) === id && item.course === course);
        return question ? response({ question: clone(question) }) : error("Question not found.", 404);
      }
      if (action === "taxonomy") return response(taxonomy(state));
      if (action === "users") {
        return response({ users: state.users.map(({ password, ...user }) => clone(user)) });
      }
      if (action === "media") return response({ files: clone(state.media) });
      if (action === "design_settings") {
        return response({ settings: clone(state.designSettings), defaults: clone(DATA.designSettings || {}) });
      }
      return error("Unknown admin action.", 404);
    }

    const body = parseBody(options);
    if (action === "preview_question") {
      return response({ preview: clone(body) });
    }
    if (action === "save_question") {
      const question = normalizeQuestion(body);
      if (!question.id || !question.course || !question.chapter || !question.topic || !question.year) {
        return error("Question id, course, chapter, topic, and year are required.");
      }
      const duplicate = state.questions.find(item => Number(item.id) === question.id && item.course !== question.course);
      if (duplicate) return error(`Question id already exists in ${duplicate.course}. Use a globally unique id.`, 409);
      state.questions = state.questions.filter(item => !(Number(item.id) === question.id && item.course === question.course));
      state.questions.push(question);
      saveState(state);
      return response({ ok: true, generated: { questions: state.questions.length } });
    }
    if (action === "delete_question") {
      const id = Number(body.id || 0);
      const course = canonicalCourse(body.course);
      state.questions = state.questions.filter(item => !(Number(item.id) === id && item.course === course));
      saveState(state);
      return response({ ok: true, deleted: true, generated: { questions: state.questions.length } });
    }
    if (action === "update_user") {
      const user = state.users.find(item => Number(item.id) === Number(body.id));
      if (!user) return error("User not found.", 404);
      user.name = String(body.name || user.name);
      user.role = String(body.role || user.role);
      user.plan = String(body.plan || user.plan);
      user.target_year = String(body.targetYear || "");
      saveState(state);
      return response({ ok: true });
    }
    if (action === "publish") return response({ ok: true, generated: { questions: state.questions.length } });
    if (action === "save_design_settings") {
      state.designSettings = clone(body.settings || DATA.designSettings || {});
      saveState(state);
      return response({ ok: true, savedAt: new Date().toISOString(), settings: clone(state.designSettings) });
    }
    if (action === "reset_design_settings") {
      state.designSettings = clone(DATA.designSettings || {});
      saveState(state);
      return response({ ok: true, savedAt: new Date().toISOString(), settings: clone(state.designSettings) });
    }
    if (action === "upload_media") {
      return error("Static demo mode cannot publish uploaded files. Use existing files in uploads/questions.", 501);
    }
    return error("Unknown admin action.", 404);
  }

  function adminImportApi(options) {
    const state = loadState();
    if (!requireAdmin(state)) return error("Admin access required.", 403);
    const items = parseBody(options);
    if (!Array.isArray(items)) return error("Request body must be a JSON array.");
    for (const item of items) {
      const question = normalizeQuestion(item);
      const duplicate = state.questions.find(existing => Number(existing.id) === question.id && existing.course !== question.course);
      if (duplicate) return error(`Question id ${question.id} already exists in ${duplicate.course}.`, 409);
      state.questions = state.questions.filter(existing => !(Number(existing.id) === question.id && existing.course === question.course));
      state.questions.push(question);
    }
    saveState(state);
    return response({ ok: true, count: items.length, generated: { questions: state.questions.length } });
  }

  function moderationApi(options) {
    const state = loadState();
    if (!requireAdmin(state)) return error("Admin access required.", 403);
    const method = (options.method || "GET").toUpperCase();
    if (method === "GET") return response({ comments: clone(state.comments), messages: clone(state.messages) });
    const body = parseBody(options);
    const collection = body.type === "comment" ? state.comments : state.messages;
    const index = collection.findIndex(item => Number(item.id) === Number(body.id));
    if (index < 0) return error("Item not found.", 404);
    if (body.action === "delete") collection.splice(index, 1);
    else collection[index].status = String(body.status || collection[index].status);
    saveState(state);
    return response({ ok: true });
  }

  function contactApi(options) {
    const state = loadState();
    const body = parseBody(options);
    if (!body.name || !String(body.email || "").includes("@") || !body.topic || !body.message) {
      return error("Name, valid email, topic, and message are required.");
    }
    state.messages.push({
      id: Math.max(0, ...state.messages.map(message => Number(message.id))) + 1,
      name: String(body.name),
      email: String(body.email),
      topic: String(body.topic),
      message: String(body.message),
      status: "new",
      created_at: nowSql()
    });
    saveState(state);
    return response({ ok: true, message: "Message received in this browser's static demo storage." }, 201);
  }

  function designSettingsApi() {
    const state = loadState();
    return response({ settings: clone(state.designSettings) });
  }

  function apiEndpoint(url) {
    const match = url.pathname.match(/\/api\/([^/]+\.php)$/i);
    return match ? match[1].toLowerCase() : "";
  }

  window.fetch = function staticFetch(input, options = {}) {
    const rawUrl = typeof input === "string" ? input : input.url;
    const url = new URL(rawUrl, window.location.href);
    const endpoint = apiEndpoint(url);
    if (!endpoint) return originalFetch(input, options);

    if (endpoint === "questions.php") return questionsApi(url, options);
    if (endpoint === "auth.php") return authApi(url, options);
    if (endpoint === "progress.php") return progressApi(options);
    if (endpoint === "interactions.php") return interactionsApi(url, options);
    if (endpoint === "admin_dashboard.php") return adminDashboardApi(url, options);
    if (endpoint === "admin_import.php") return adminImportApi(options);
    if (endpoint === "admin_moderation.php") return moderationApi(options);
    if (endpoint === "contact.php") return contactApi(options);
    if (endpoint === "design_settings.php") return designSettingsApi();
    return error("Static API endpoint not implemented.", 404);
  };

  window.CS4StaticDemo = {
    reset() {
      localStorage.removeItem(STATE_KEY);
      sessionStorage.clear();
      window.location.reload();
    },
    exportState() {
      return clone(loadState());
    }
  };
})();
