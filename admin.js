(function () {
  "use strict";

  const API = "api/admin_dashboard.php";
  const MOD_API = "api/admin_moderation.php";
  const AUTH_API = "api/auth.php";
  const AUTH_STORAGE_KEYS = [
    "soaGateCurrentUser",
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
  const requiredImportFields = ["id", "course", "chapter", "topic", "section", "year", "type", "question", "answer", "theory", "solution"];
  const QUESTION_DRAFT_KEY = "cs4gateAdminQuestionDraft:v1";
  const ADMIN_LAST_SECTION_KEY = "cs4gateAdminLastSection:v1";
  let taxonomy = { courses: [], years: {}, types: {} };
  let currentQuestion = null;
  let questionRowsCache = [];
  let draftTimer = null;
  let suppressDraftSave = false;
  let mathJaxPreviewPromise = null;
  let lastPreviewFingerprint = "";
  let designDefaults = null;
  let designLivePreviewTimer = null;
  let editorDirty = false;
  let editorTitleBase = "Question Editor";
  let activeEditorFieldId = "qQuestion";
  const DESIGN_GLOBAL_FIELDS = {
    fontBody: "dsFontBody",
    fontHeading: "dsFontHeading",
    thumbBrandText: "dsThumbBrandText",
    groupPresetPublic: "dsPagePresetPublic",
    groupPresetFree: "dsPagePresetFree",
    groupPresetPaid: "dsPagePresetPaid",
    cardRadiusPx: "dsCardRadiusPx",
    cardShadow: "dsCardShadow",
    cardShadowHover: "dsCardShadowHover",
    thumbDashboardHeight: "dsThumbDashboardHeight",
    thumbCourseQuestionHeight: "dsThumbCourseQuestionHeight",
    thumbSubjectHeight: "dsThumbSubjectHeight",
    thumbChapterHeight: "dsThumbChapterHeight"
  };
  const DESIGN_THEME_FIELDS = {
    primary: "Primary",
    accent: "Accent",
    nav: "Nav",
    nav2: "Nav2",
    bg: "Bg",
    bgElev: "BgElev",
    bgSoft: "BgSoft",
    text: "Text",
    textMuted: "TextMuted",
    border: "Border",
    buttonPrimaryBg: "ButtonPrimaryBg",
    buttonPrimaryText: "ButtonPrimaryText",
    thumbBaseStart: "ThumbBaseStart",
    thumbBaseMid: "ThumbBaseMid",
    thumbBaseEnd: "ThumbBaseEnd",
    thumbGlow: "ThumbGlow",
    thumbCorner: "ThumbCorner",
    thumbLabel: "ThumbLabel",
    thumbTitle: "ThumbTitle",
    thumbSubtitle: "ThumbSubtitle",
    thumbBrand: "ThumbBrand",
    thumbBorder: "ThumbBorder",
    shortcutBaseStart: "ShortcutBaseStart",
    shortcutBaseMid: "ShortcutBaseMid",
    shortcutBaseEnd: "ShortcutBaseEnd",
    shortcutGlow: "ShortcutGlow",
    shortcutCorner: "ShortcutCorner",
    shortcutLabel: "ShortcutLabel",
    shortcutTitle: "ShortcutTitle",
    shortcutSubtitle: "ShortcutSubtitle",
    shortcutBrand: "ShortcutBrand",
    shortcutBorder: "ShortcutBorder"
  };
  const DESIGN_PRESET_CORES = {
    royal: { primary: "#2A9CB3", accent: "#6B35C8" },
    ocean: { primary: "#1794C7", accent: "#365DCC" },
    emerald: { primary: "#1D9E88", accent: "#3F7D44" },
    sunset: { primary: "#D46A35", accent: "#8F3BC1" },
    slate: { primary: "#4E7AA8", accent: "#4A5A73" }
  };
  const DESIGN_PRESET_LABELS = {
    inherit: "Inherit",
    royal: "Royal",
    ocean: "Ocean",
    emerald: "Emerald",
    sunset: "Sunset",
    slate: "Slate"
  };

  const $ = selector => document.querySelector(selector);
  const $$ = selector => Array.from(document.querySelectorAll(selector));
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));
  let csrfTokenPromise = null;

  async function getCsrfToken() {
    if (!csrfTokenPromise) {
      csrfTokenPromise = fetch(`${AUTH_API}?action=csrf`, {
        cache: "no-store",
        credentials: "same-origin"
      })
        .then(res => res.ok ? res.json() : Promise.reject(new Error("Could not prepare secure request.")))
        .then(payload => payload.csrfToken || "");
    }
    return csrfTokenPromise;
  }

  function bootDesignSystem() {
    if (window.CS4DesignSystem && typeof window.CS4DesignSystem.load === "function") {
      window.CS4DesignSystem.load(false);
      return;
    }
    if (document.querySelector("script[data-design-system='1']")) return;
    const script = document.createElement("script");
    script.src = "design-system.js?v=20260531contrast1";
    script.defer = true;
    script.dataset.designSystem = "1";
    document.head.appendChild(script);
  }

  function setMessage(el, type, message) {
    if (!el) return;
    el.className = `auth-message ${type}`;
    el.textContent = message;
  }

  function renderEditorTitle() {
    const title = $("#questionEditorTitle");
    if (!title) return;
    title.textContent = editorDirty ? `${editorTitleBase} (Unsaved)` : editorTitleBase;
  }

  function setEditorTitleBase(text) {
    editorTitleBase = text || "Question Editor";
    renderEditorTitle();
  }

  function setEditorDirty(isDirty) {
    editorDirty = Boolean(isDirty);
    $("#questionForm")?.classList.toggle("is-dirty", editorDirty);
    renderEditorTitle();
  }

  function getActiveEditorTextarea() {
    return document.getElementById(activeEditorFieldId) || document.getElementById("qQuestion");
  }

  function setActiveEditorTab(tabName) {
    const key = String(tabName || "").toLowerCase();
    const targetButton = document.querySelector(`.admin-editor-tab[data-editor-tab="${key}"]`);
    const targetId = targetButton?.dataset.editorTarget || "qQuestion";
    activeEditorFieldId = targetId;

    $$(".admin-editor-tab").forEach(btn => btn.classList.toggle("is-active", btn === targetButton));
    $$(".admin-editor-pane").forEach(pane => pane.classList.toggle("is-active", pane.dataset.editorPane === key));
  }

  function snippetForTemplate(type) {
    switch (type) {
      case "h3":
        return "\n<h3>Section Heading</h3>\n<p>Write details here.</p>\n";
      case "ul":
        return "\n<ul>\n  <li>Point 1</li>\n  <li>Point 2</li>\n</ul>\n";
      case "table":
        return "\n<table>\n  <thead><tr><th>Column 1</th><th>Column 2</th></tr></thead>\n  <tbody><tr><td>Value</td><td>Value</td></tr></tbody>\n</table>\n";
      case "math":
        return "\n\\[\n  \\text{Write equation here}\n\\]\n";
      case "code":
        return "\n<pre><code>// Write code snippet\n</code></pre>\n";
      case "figure":
        return "\n<figure class=\"question-figure\"><img src=\"uploads/questions/example.png\" alt=\"Question image\" loading=\"lazy\"></figure>\n";
      default:
        return "";
    }
  }

  function normalizeHexColor(value, fallback = "#000000") {
    const candidate = String(value ?? "").trim().toUpperCase();
    return /^#[0-9A-F]{6}$/.test(candidate) ? candidate : fallback;
  }

  function hexToRgb(hex) {
    const clean = normalizeHexColor(hex, "#000000").slice(1);
    return {
      r: Number.parseInt(clean.slice(0, 2), 16),
      g: Number.parseInt(clean.slice(2, 4), 16),
      b: Number.parseInt(clean.slice(4, 6), 16)
    };
  }

  function rgbToHex(r, g, b) {
    const clamp = value => Math.max(0, Math.min(255, Math.round(Number(value) || 0)));
    return `#${[clamp(r), clamp(g), clamp(b)].map(value => value.toString(16).padStart(2, "0")).join("").toUpperCase()}`;
  }

  function mixHex(a, b, ratio = 0.5) {
    const t = Math.max(0, Math.min(1, Number(ratio) || 0));
    const ra = hexToRgb(a);
    const rb = hexToRgb(b);
    return rgbToHex(
      ra.r + (rb.r - ra.r) * t,
      ra.g + (rb.g - ra.g) * t,
      ra.b + (rb.b - ra.b) * t
    );
  }

  function darken(hex, amount = 0.2) {
    return mixHex(hex, "#000000", amount);
  }

  function lighten(hex, amount = 0.2) {
    return mixHex(hex, "#FFFFFF", amount);
  }

  function channelToLinear(channel) {
    const value = Math.max(0, Math.min(1, (Number(channel) || 0) / 255));
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  }

  function relativeLuminance(hex) {
    const rgb = hexToRgb(hex);
    const r = channelToLinear(rgb.r);
    const g = channelToLinear(rgb.g);
    const b = channelToLinear(rgb.b);
    return (0.2126 * r) + (0.7152 * g) + (0.0722 * b);
  }

  function contrastRatio(fg, bg) {
    const l1 = relativeLuminance(fg);
    const l2 = relativeLuminance(bg);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  function readableTextOn(bg, lightText = "#F8FBFF", darkText = "#0F172A") {
    return contrastRatio(lightText, bg) >= contrastRatio(darkText, bg) ? lightText : darkText;
  }

  function ensureContrast(fg, bg, minRatio = 4.5) {
    const foreground = normalizeHexColor(fg, "#0F172A");
    const background = normalizeHexColor(bg, "#FFFFFF");
    if (contrastRatio(foreground, background) >= minRatio) return foreground;
    const target = readableTextOn(background);
    for (let i = 1; i <= 14; i += 1) {
      const candidate = mixHex(foreground, target, i / 14);
      if (contrastRatio(candidate, background) >= minRatio) return candidate;
    }
    return target;
  }

  function setFieldValue(id, value) {
    const field = document.getElementById(id);
    if (!field) return;
    field.value = value ?? "";
  }

  function fieldById(id, fallback = "") {
    const field = document.getElementById(id);
    if (!field) return fallback;
    return field.value ?? fallback;
  }

  function applyDesignPreview(settings) {
    if (window.CS4DesignSystem && typeof window.CS4DesignSystem.apply === "function") {
      window.CS4DesignSystem.apply(settings);
      return true;
    }
    return false;
  }

  function fillDesignTheme(prefix, source = {}) {
    Object.entries(DESIGN_THEME_FIELDS).forEach(([key, suffix]) => {
      const id = `ds${prefix}${suffix}`;
      setFieldValue(id, source[key] ?? "");
    });
  }

  function collectDesignTheme(prefix) {
    const out = {};
    Object.entries(DESIGN_THEME_FIELDS).forEach(([key, suffix]) => {
      const id = `ds${prefix}${suffix}`;
      out[key] = normalizeHexColor(fieldById(id, "#000000"), "#000000");
    });
    return out;
  }

  function normalizePresetChoice(value) {
    const key = String(value ?? "inherit").trim().toLowerCase();
    return Object.prototype.hasOwnProperty.call(DESIGN_PRESET_LABELS, key) ? key : "inherit";
  }

  function updateDesignRouteStatus() {
    const routes = [
      { key: "public", label: "Public", fieldId: "dsPagePresetPublic" },
      { key: "free", label: "Free", fieldId: "dsPagePresetFree" },
      { key: "paid", label: "Paid", fieldId: "dsPagePresetPaid" }
    ];
    routes.forEach(route => {
      const preset = normalizePresetChoice(fieldById(route.fieldId, "inherit"));
      const chip = document.querySelector(`[data-route-chip="${route.key}"]`);
      if (!chip) return;
      chip.dataset.preset = preset;
      const text = chip.querySelector(".admin-route-chip-text");
      if (text) text.textContent = `${route.label}: ${DESIGN_PRESET_LABELS[preset]}`;
    });
  }

  function fillDesignForm(settings = {}) {
    const global = settings.global || {};
    Object.entries(DESIGN_GLOBAL_FIELDS).forEach(([key, fieldId]) => {
      setFieldValue(fieldId, global[key] ?? "");
    });
    fillDesignTheme("Light", settings.light || {});
    fillDesignTheme("Dark", settings.dark || {});
    updateDesignRouteStatus();
  }

  function collectDesignForm() {
    const payload = { global: {}, light: {}, dark: {} };
    Object.entries(DESIGN_GLOBAL_FIELDS).forEach(([key, fieldId]) => {
      payload.global[key] = fieldById(fieldId, "");
    });
    payload.global.groupPresetPublic = normalizePresetChoice(payload.global.groupPresetPublic);
    payload.global.groupPresetFree = normalizePresetChoice(payload.global.groupPresetFree);
    payload.global.groupPresetPaid = normalizePresetChoice(payload.global.groupPresetPaid);
    payload.global.cardRadiusPx = Number.parseInt(payload.global.cardRadiusPx || "8", 10) || 8;
    payload.global.thumbDashboardHeight = Number.parseInt(payload.global.thumbDashboardHeight || "102", 10) || 102;
    payload.global.thumbCourseQuestionHeight = Number.parseInt(payload.global.thumbCourseQuestionHeight || "112", 10) || 112;
    payload.global.thumbSubjectHeight = Number.parseInt(payload.global.thumbSubjectHeight || "124", 10) || 124;
    payload.global.thumbChapterHeight = Number.parseInt(payload.global.thumbChapterHeight || "132", 10) || 132;
    payload.light = collectDesignTheme("Light");
    payload.dark = collectDesignTheme("Dark");
    return payload;
  }

  function generateThemePalette(primaryHex, accentHex, mode) {
    const primary = normalizeHexColor(primaryHex, "#1FA5AD");
    const accent = normalizeHexColor(accentHex, "#5B2F99");
    const isDark = mode === "dark";

    if (isDark) {
      const nav = darken(primary, 0.84);
      const nav2 = darken(primary, 0.76);
      const bg = darken(primary, 0.9);
      const bgElev = mixHex(bg, "#FFFFFF", 0.12);
      const bgSoft = mixHex(bg, "#FFFFFF", 0.2);
      const primaryLift = lighten(primary, 0.2);
      const accentLift = lighten(accent, 0.15);
      const text = ensureContrast("#EAF1FB", bg, 8);
      const textMuted = ensureContrast(mixHex(text, bg, 0.35), bg, 4.6);
      const buttonPrimaryBg = lighten(accent, 0.18);
      const buttonPrimaryText = ensureContrast(readableTextOn(buttonPrimaryBg), buttonPrimaryBg, 4.5);
      const thumbBaseMid = darken(primary, 0.7);
      const thumbTitle = ensureContrast("#F4F7FF", thumbBaseMid, 4.8);
      const thumbSubtitle = ensureContrast("#D2DEF6", thumbBaseMid, 3.3);
      const thumbLabel = ensureContrast(mixHex("#FFFFFF", accent, 0.35), thumbBaseMid, 3.2);
      const thumbBrand = ensureContrast("#CDD8EF", thumbBaseMid, 3.2);
      const shortcutBaseMid = lighten(bgSoft, 0.66);
      const shortcutTitle = ensureContrast(darken(bg, 0.22), shortcutBaseMid, 5);
      const shortcutSubtitle = ensureContrast(darken(bg, 0.12), shortcutBaseMid, 4);
      const shortcutLabel = ensureContrast(darken(accent, 0.45), shortcutBaseMid, 3.2);
      const shortcutBrand = ensureContrast(darken(bg, 0.1), shortcutBaseMid, 3.2);
      return {
        primary: primaryLift,
        accent: accentLift,
        nav,
        nav2,
        bg,
        bgElev,
        bgSoft,
        text,
        textMuted,
        border: mixHex(bgElev, "#FFFFFF", 0.2),
        buttonPrimaryBg,
        buttonPrimaryText,
        thumbBaseStart: darken(primary, 0.78),
        thumbBaseMid,
        thumbBaseEnd: darken(primary, 0.74),
        thumbGlow: lighten(accent, 0.22),
        thumbCorner: lighten(primary, 0.16),
        thumbLabel,
        thumbTitle,
        thumbSubtitle,
        thumbBrand,
        thumbBorder: lighten(accent, 0.05),
        shortcutBaseStart: lighten(bgSoft, 0.75),
        shortcutBaseMid,
        shortcutBaseEnd: lighten(bgSoft, 0.58),
        shortcutGlow: lighten(accent, 0.22),
        shortcutCorner: lighten(primary, 0.28),
        shortcutLabel,
        shortcutTitle,
        shortcutSubtitle,
        shortcutBrand,
        shortcutBorder: mixHex(lighten(accent, 0.08), "#FFFFFF", 0.25)
      };
    }

    const nav = darken(primary, 0.74);
    const nav2 = darken(primary, 0.63);
    const bg = lighten(primary, 0.92);
    const bgElev = "#FFFFFF";
    const bgSoft = mixHex(bg, "#FFFFFF", 0.55);
    const text = ensureContrast(darken(nav, 0.42), bg, 8);
    const textMuted = ensureContrast(mixHex(darken(nav, 0.28), "#FFFFFF", 0.35), bg, 4.6);
    const buttonPrimaryText = ensureContrast(readableTextOn(accent), accent, 4.5);
    const thumbBaseMid = darken(primary, 0.69);
    const thumbTitle = ensureContrast("#FFFFFF", thumbBaseMid, 4.8);
    const thumbSubtitle = ensureContrast("#DCE8FF", thumbBaseMid, 3.3);
    const thumbLabel = ensureContrast(mixHex("#FFFFFF", accent, 0.35), thumbBaseMid, 3.2);
    const thumbBrand = ensureContrast("#C9DCFF", thumbBaseMid, 3.2);
    return {
      primary,
      accent,
      nav,
      nav2,
      bg,
      bgElev,
      bgSoft,
      text,
      textMuted,
      border: mixHex(nav, "#FFFFFF", 0.72),
      buttonPrimaryBg: accent,
      buttonPrimaryText,
      thumbBaseStart: darken(primary, 0.78),
      thumbBaseMid,
      thumbBaseEnd: darken(primary, 0.73),
      thumbGlow: lighten(accent, 0.2),
      thumbCorner: lighten(primary, 0.12),
      thumbLabel,
      thumbTitle,
      thumbSubtitle,
      thumbBrand,
      thumbBorder: accent,
      shortcutBaseStart: darken(primary, 0.78),
      shortcutBaseMid: darken(primary, 0.69),
      shortcutBaseEnd: darken(primary, 0.73),
      shortcutGlow: lighten(accent, 0.2),
      shortcutCorner: lighten(primary, 0.12),
      shortcutLabel: mixHex("#FFFFFF", accent, 0.35),
      shortcutTitle: "#FFFFFF",
      shortcutSubtitle: "#DCE8FF",
      shortcutBrand: "#C9DCFF",
      shortcutBorder: accent
    };
  }

  function updateDesignStudioMessage(type, message) {
    setMessage($("#designStudioResult"), type, message);
  }

  function applyDesignScopePatch(patch, scope) {
    const current = collectDesignForm();
    if (scope === "light") {
      current.light = { ...current.light, ...patch.light };
    } else if (scope === "dark") {
      current.dark = { ...current.dark, ...patch.dark };
    } else {
      current.light = { ...current.light, ...patch.light };
      current.dark = { ...current.dark, ...patch.dark };
    }
    if (patch.global) current.global = { ...current.global, ...patch.global };
    fillDesignForm(current);
    applyDesignPreview(current);
  }

  function applyDesignPreset(name) {
    const key = String(name || "").toLowerCase();
    const core = DESIGN_PRESET_CORES[key];
    if (!core) {
      updateDesignStudioMessage("error", "Preset not found.");
      return;
    }
    $$(".admin-design-preset-btn").forEach(btn => btn.classList.toggle("is-active", btn.dataset.designPreset === key));
    const scope = fieldById("designPresetScope", "both");
    const lightPalette = generateThemePalette(core.primary, core.accent, "light");
    const darkPalette = generateThemePalette(core.primary, core.accent, "dark");
    applyDesignScopePatch({ light: lightPalette, dark: darkPalette }, scope);
    updateDesignStudioMessage("success", `Preset "${key}" applied to ${scope} theme.`);
  }

  function autoGeneratePalette() {
    const scope = fieldById("designPresetScope", "both");
    const baseLightPrimary = fieldById("dsLightPrimary", "#1FA5AD");
    const baseLightAccent = fieldById("dsLightAccent", "#5B2F99");
    const baseDarkPrimary = fieldById("dsDarkPrimary", "#4ED1DC");
    const baseDarkAccent = fieldById("dsDarkAccent", "#9D69FF");
    const lightPalette = generateThemePalette(baseLightPrimary, baseLightAccent, "light");
    const darkPalette = generateThemePalette(baseDarkPrimary, baseDarkAccent, "dark");
    applyDesignScopePatch({ light: lightPalette, dark: darkPalette }, scope);
    updateDesignStudioMessage("success", `Auto palette generated for ${scope} theme.`);
  }

  function swapLightDarkThemes() {
    const current = collectDesignForm();
    const swapped = {
      global: { ...current.global },
      light: { ...current.dark },
      dark: { ...current.light }
    };
    fillDesignForm(swapped);
    applyDesignPreview(swapped);
    updateDesignStudioMessage("success", "Light and dark palettes swapped.");
  }

  async function copyDesignJson() {
    const payload = collectDesignForm();
    const json = JSON.stringify(payload, null, 2);
    setFieldValue("designJsonInput", json);
    try {
      await navigator.clipboard.writeText(json);
      updateDesignStudioMessage("success", "Theme JSON copied to clipboard.");
    } catch {
      updateDesignStudioMessage("info", "Theme JSON generated in the textarea. Copy manually if needed.");
    }
  }

  function applyDesignJson() {
    const input = fieldValue("designJsonInput").trim();
    if (!input) {
      updateDesignStudioMessage("error", "Paste theme JSON first.");
      return;
    }
    try {
      const parsed = JSON.parse(input);
      fillDesignForm(parsed);
      applyDesignPreview(collectDesignForm());
      updateDesignStudioMessage("success", "Theme JSON applied locally. Save to publish.");
    } catch (err) {
      updateDesignStudioMessage("error", `Invalid JSON: ${err.message}`);
    }
  }

  function scheduleDesignLivePreview() {
    window.clearTimeout(designLivePreviewTimer);
    designLivePreviewTimer = window.setTimeout(() => {
      const settings = collectDesignForm();
      applyDesignPreview(settings);
      setFieldValue("designJsonInput", JSON.stringify(settings, null, 2));
    }, 180);
  }

  async function loadDesignSettings() {
    const result = $("#designSettingsResult");
    if (!result) return;
    setMessage(result, "info", "Loading current design settings...");
    try {
      const payload = await apiGet("design_settings");
      designDefaults = payload.defaults || null;
      const settings = payload.settings || payload.defaults || {};
      fillDesignForm(settings);
      applyDesignPreview(settings);
      setFieldValue("designJsonInput", JSON.stringify(settings, null, 2));
      setMessage(result, "success", "Design settings loaded. Adjust values, preview, then save.");
      updateDesignStudioMessage("success", "Advanced design studio is synced with current settings.");
    } catch (err) {
      setMessage(result, "error", err.message);
      updateDesignStudioMessage("error", err.message);
    }
  }

  async function previewDesignSettings() {
    const result = $("#designSettingsResult");
    const settings = collectDesignForm();
    if (applyDesignPreview(settings)) {
      setFieldValue("designJsonInput", JSON.stringify(settings, null, 2));
      setMessage(result, "success", "Preview applied locally in this browser. Save to publish site-wide.");
      updateDesignStudioMessage("success", "Preview applied. Review components, then save.");
      return;
    }
    setMessage(result, "error", "Preview loader not ready. Refresh and try again.");
    updateDesignStudioMessage("error", "Preview loader not ready. Refresh and try again.");
  }

  async function saveDesignSettings(event) {
    event.preventDefault();
    const result = $("#designSettingsResult");
    setMessage(result, "info", "Saving design settings...");
    try {
      const payload = await apiPost("save_design_settings", { settings: collectDesignForm() });
      const saved = payload.settings || {};
      fillDesignForm(saved);
      applyDesignPreview(saved);
      setFieldValue("designJsonInput", JSON.stringify(saved, null, 2));
      window.CS4DesignSystem?.load?.(true);
      setMessage(result, "success", `Design settings saved at ${formatDateTime(payload.savedAt || new Date().toISOString())}.`);
      updateDesignStudioMessage("success", "Theme saved and published to live design settings.");
    } catch (err) {
      setMessage(result, "error", err.message);
      updateDesignStudioMessage("error", err.message);
    }
  }

  async function resetDesignSettings() {
    const result = $("#designSettingsResult");
    if (!confirm("Reset design settings to defaults? This applies to all pages.")) return;
    setMessage(result, "info", "Resetting to defaults...");
    try {
      const payload = await apiPost("reset_design_settings", {});
      const settings = payload.settings || designDefaults || {};
      fillDesignForm(settings);
      applyDesignPreview(settings);
      setFieldValue("designJsonInput", JSON.stringify(settings, null, 2));
      window.CS4DesignSystem?.load?.(true);
      setMessage(result, "success", "Design settings reset to defaults.");
      updateDesignStudioMessage("success", "Defaults restored.");
    } catch (err) {
      setMessage(result, "error", err.message);
      updateDesignStudioMessage("error", err.message);
    }
  }

  function richToPlainText(value) {
    const holder = document.createElement("div");
    holder.innerHTML = String(value ?? "");
    return (holder.textContent || holder.innerText || "").replace(/\s+/g, " ").trim();
  }

  function normalizeQuestionText(value) {
    return richToPlainText(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  }

  function formatDateTime(value) {
    try {
      return new Date(value).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
    } catch {
      return "";
    }
  }

  function fieldValue(id) {
    return document.getElementById(id)?.value ?? "";
  }

  function collectQuestionFormRaw() {
    return {
      id: fieldValue("qId"),
      course: fieldValue("qCourse"),
      chapter: fieldValue("qChapter"),
      topic: fieldValue("qTopic"),
      section: fieldValue("qSection"),
      year: fieldValue("qYear"),
      type: fieldValue("qType"),
      difficulty: fieldValue("qDifficulty"),
      question: fieldValue("qQuestion"),
      options: fieldValue("qOptions"),
      answer: fieldValue("qAnswer"),
      theory: fieldValue("qTheory"),
      solution: fieldValue("qSolution")
    };
  }

  function setQuestionFormRaw(data = {}) {
    $("#qId").value = data.id ?? "";
    $("#qCourse").value = data.course ?? ($("#qCourse").options[0]?.value || "");
    $("#qChapter").value = data.chapter ?? "";
    $("#qTopic").value = data.topic ?? "";
    $("#qSection").value = data.section ?? "All Question";
    $("#qYear").value = data.year ?? new Date().getFullYear();
    $("#qType").value = data.type ?? "MCQ";
    $("#qDifficulty").value = data.difficulty ?? "";
    $("#qQuestion").value = data.question ?? "";
    $("#qOptions").value = data.options ?? "";
    $("#qAnswer").value = data.answer ?? "";
    $("#qTheory").value = data.theory ?? "";
    $("#qSolution").value = data.solution ?? "";
  }

  function saveEditorDraftSoon() {
    if (suppressDraftSave) return;
    window.clearTimeout(draftTimer);
    draftTimer = window.setTimeout(saveEditorDraft, 500);
    lastPreviewFingerprint = "";
    setEditorDirty(true);
    $("#questionPreview").hidden = true;
    updateEditorChecks();
  }

  function saveEditorDraft() {
    if (suppressDraftSave) return;
    const payload = { savedAt: new Date().toISOString(), data: collectQuestionFormRaw() };
    try {
      localStorage.setItem(QUESTION_DRAFT_KEY, JSON.stringify(payload));
      updateDraftStatus(payload.savedAt);
    } catch {}
  }

  function readEditorDraft() {
    try {
      return JSON.parse(localStorage.getItem(QUESTION_DRAFT_KEY) || "null");
    } catch {
      return null;
    }
  }

  function updateDraftStatus(savedAt) {
    const status = $("#questionDraftStatus");
    if (!status) return;
    const draft = savedAt ? { savedAt } : readEditorDraft();
    status.textContent = draft?.savedAt
      ? `Last local draft: ${formatDateTime(draft.savedAt)}`
      : "Draft autosave is ready.";
  }

  function restoreEditorDraft() {
    const draft = readEditorDraft();
    if (!draft?.data) {
      setMessage($("#questionSaveResult"), "info", "No local draft found.");
      updateDraftStatus();
      return;
    }
    suppressDraftSave = true;
    setQuestionFormRaw(draft.data);
    suppressDraftSave = false;
    currentQuestion = null;
    setEditorTitleBase("Restored Draft");
    setEditorDirty(true);
    $("#questionPreview").hidden = true;
    setMessage($("#questionSaveResult"), "success", "Local draft restored. Review, preview, then save.");
    updateDraftStatus(draft.savedAt);
    updateEditorChecks();
    setActiveEditorTab("question");
    focusQuestionEditor(true);
  }

  function clearEditorDraft() {
    try { localStorage.removeItem(QUESTION_DRAFT_KEY); } catch {}
    updateDraftStatus();
    updateEditorChecks();
    setMessage($("#questionSaveResult"), "success", "Local draft cleared. Current form content was not deleted.");
  }

  function strictParseOptions(value, type) {
    const trimmed = String(value ?? "").trim();
    if (!trimmed) {
      if (type === "NAT") return null;
      throw new Error("Options JSON is required for MCQ/MSQ questions.");
    }
    let parsed;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      throw new Error("Options JSON must be valid JSON, for example [\"A\", \"B\", \"C\", \"D\"].");
    }
    if (!Array.isArray(parsed) || parsed.length < 2) {
      throw new Error("Options JSON must be an array with at least two options.");
    }
    return parsed;
  }

  function findPossibleDuplicate() {
    const normalized = normalizeQuestionText($("#qQuestion")?.value || "");
    if (!normalized || normalized.length < 24) return null;
    const id = Number($("#qId")?.value || 0);
    const course = $("#qCourse")?.value || "";
    return questionRowsCache.find(row => {
      if (Number(row.id) === id && row.course === course) return false;
      const rowText = normalizeQuestionText(row.plainQuestion || row.question || "");
      return rowText && (rowText === normalized || (rowText.length > 40 && normalized.includes(rowText)) || (normalized.length > 40 && rowText.includes(normalized)));
    }) || null;
  }

  function questionPreviewFingerprint() {
    return JSON.stringify(collectQuestionFormRaw());
  }

  function validateEditor(showMessage = false) {
    const checks = [];
    const requiredIds = ["qId", "qCourse", "qChapter", "qTopic", "qSection", "qYear", "qType", "qQuestion", "qAnswer", "qTheory", "qSolution"];
    const missing = requiredIds.filter(id => !String(fieldValue(id)).trim());
    checks.push({ state: missing.length ? "warn" : "ok", text: missing.length ? `Missing required fields: ${missing.map(id => id.replace(/^q/, "")).join(", ")}` : "Required fields are complete." });
    try {
      strictParseOptions(fieldValue("qOptions"), fieldValue("qType"));
      checks.push({ state: "ok", text: fieldValue("qType") === "NAT" && !fieldValue("qOptions").trim() ? "NAT options can be empty." : "Options JSON is valid." });
    } catch (err) {
      checks.push({ state: fieldValue("qType") === "NAT" ? "warn" : "error", text: err.message });
      if (fieldValue("qType") !== "NAT" && showMessage) throw err;
    }
    const duplicate = findPossibleDuplicate();
    if (duplicate) {
      checks.push({ state: "warn", text: `Possible duplicate: #${duplicate.id} ${duplicate.topic || duplicate.course || ""}` });
    } else {
      checks.push({ state: "ok", text: "No duplicate found in the loaded list." });
    }
    renderEditorChecks(checks);
    if (missing.length && showMessage) throw new Error("Complete all required question fields before saving.");
    return { duplicate };
  }

  function updateEditorChecks() {
    try {
      validateEditor(false);
    } catch {}
  }

  function renderEditorChecks(checks) {
    const panel = $("#questionEditorChecks");
    if (!panel) return;
    panel.innerHTML = checks.map(item => `<div class="${esc(item.state)}"><i class="fas ${item.state === "ok" ? "fa-check-circle" : item.state === "error" ? "fa-circle-exclamation" : "fa-triangle-exclamation"}"></i><span>${esc(item.text)}</span></div>`).join("");
  }

  function insertAtCursor(textarea, text) {
    const start = textarea.selectionStart ?? textarea.value.length;
    const end = textarea.selectionEnd ?? textarea.value.length;
    textarea.value = `${textarea.value.slice(0, start)}${text}${textarea.value.slice(end)}`;
    textarea.focus();
    textarea.setSelectionRange(start + text.length, start + text.length);
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function initMiniEditor() {
    const tabs = $$(".admin-editor-tab");
    if (!tabs.length) return;

    tabs.forEach(btn => {
      btn.addEventListener("click", () => setActiveEditorTab(btn.dataset.editorTab));
    });

    $$(".admin-editor-pane textarea").forEach(area => {
      area.addEventListener("focus", () => {
        const pane = area.closest(".admin-editor-pane");
        if (!pane) return;
        setActiveEditorTab(pane.dataset.editorPane);
      });
    });

    $$("[data-editor-insert-tag]").forEach(btn => {
      btn.addEventListener("click", () => {
        const snippet = snippetForTemplate(btn.dataset.editorInsertTag);
        const target = getActiveEditorTextarea();
        if (!target || !snippet) return;
        insertAtCursor(target, snippet);
        target.focus();
      });
    });

    setActiveEditorTab("question");
  }

  function insertImageSnippet(targetId) {
    const path = fieldValue("imageSnippetPath").trim().replace(/^\/+/, "");
    const alt = fieldValue("imageSnippetAlt").trim() || "Question image";
    if (!/^uploads\/questions\/[a-z0-9._/-]+\.(png|jpe?g|webp)$/i.test(path)) {
      setMessage($("#questionSaveResult"), "error", "Image path must be inside uploads/questions/ and end with jpg, jpeg, png, or webp.");
      return;
    }
    const safeAlt = alt.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    const snippet = `\n<figure class="question-figure"><img src="${path}" alt="${safeAlt}" loading="lazy"></figure>\n`;
    const target = document.getElementById(targetId);
    if (!target) return;
    insertAtCursor(target, snippet);
    setMessage($("#questionSaveResult"), "success", `Image snippet inserted into ${targetId.replace(/^q/, "")}.`);
  }

  function containsMathMarkup(q) {
    return /\\\(|\\\[|\\frac|\\log_|_\\{|\\text\{|\\sum|\\sqrt|\$\$/.test([q.question, q.theory, q.solution].join(" "));
  }

  function loadMathJaxForPreview() {
    if (window.MathJax?.typesetPromise) return Promise.resolve(window.MathJax);
    if (mathJaxPreviewPromise) return mathJaxPreviewPromise;
    window.MathJax = window.MathJax || {
      tex: { inlineMath: [["\\(", "\\)"], ["$", "$"]], displayMath: [["\\[", "\\]"], ["$$", "$$"]] },
      svg: { fontCache: "global" }
    };
    mathJaxPreviewPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector("script[data-admin-mathjax='1']");
      if (existing) {
        existing.addEventListener("load", () => resolve(window.MathJax), { once: true });
        existing.addEventListener("error", reject, { once: true });
        return;
      }
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js";
      script.async = true;
      script.dataset.adminMathjax = "1";
      script.onload = () => resolve(window.MathJax);
      script.onerror = () => reject(new Error("Could not load MathJax preview."));
      document.head.appendChild(script);
    });
    return mathJaxPreviewPromise;
  }

  function typesetPreviewIfNeeded(q) {
    if (!containsMathMarkup(q)) return;
    loadMathJaxForPreview()
      .then(mathJax => mathJax.typesetPromise?.([$("#questionPreview")]))
      .catch(() => {});
  }

  async function apiGet(action, params = {}) {
    const query = new URLSearchParams({ action, _: Date.now(), ...params });
    const res = await fetch(`${API}?${query}`, { cache: "no-store", credentials: "same-origin" });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(payload.error || "Admin request failed.");
    return payload;
  }

  async function apiPost(action, body) {
    const csrfToken = await getCsrfToken();
    const res = await fetch(`${API}?action=${encodeURIComponent(action)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
      credentials: "same-origin",
      body: JSON.stringify(body)
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(payload.error || "Admin update failed.");
    return payload;
  }

  async function moderationRequest(body) {
    const csrfToken = await getCsrfToken();
    const res = await fetch(MOD_API, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
      credentials: "same-origin",
      body: JSON.stringify(body)
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(payload.error || "Moderation update failed.");
    return payload;
  }

  function closeAdminDrawers() {
    $("#adminSidebar")?.classList.remove("active");
    $("#adminRightPanel")?.classList.remove("active");
    $("#adminOverlay")?.classList.remove("active");
  }

  function activateSection(section) {
    const sections = new Set($$(".admin-nav-item").map(el => el.dataset.adminSection).filter(Boolean));
    const target = sections.has(section) ? section : "overview";
    $$(".admin-section").forEach(el => el.classList.toggle("active", el.id === `admin-section-${target}`));
    $$(".admin-nav-item").forEach(el => el.classList.toggle("active", el.dataset.adminSection === target));
    closeAdminDrawers();
    try { localStorage.setItem(ADMIN_LAST_SECTION_KEY, target); } catch {}
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function initShell() {
    const sidebar = $("#adminSidebar");
    const rightPanel = $("#adminRightPanel");
    const overlay = $("#adminOverlay");

    function openSidebar() {
      rightPanel?.classList.remove("active");
      sidebar?.classList.add("active");
      overlay?.classList.add("active");
    }

    function openRightPanel() {
      sidebar?.classList.remove("active");
      rightPanel?.classList.add("active");
      overlay?.classList.add("active");
    }

    $("#adminMenuToggle")?.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      if (sidebar?.classList.contains("active")) {
        closeAdminDrawers();
        return;
      }
      openSidebar();
    });
    $("#adminToolsToggle")?.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      if (rightPanel?.classList.contains("active")) {
        closeAdminDrawers();
        return;
      }
      openRightPanel();
    });
    $("#adminRightClose")?.addEventListener("click", () => closeAdminDrawers());
    overlay?.addEventListener("click", () => closeAdminDrawers());
    $$(".admin-nav-item").forEach(btn => btn.addEventListener("click", () => activateSection(btn.dataset.adminSection)));
    $$("[data-admin-jump]").forEach(btn => btn.addEventListener("click", () => activateSection(btn.dataset.adminJump)));

    const runRefresh = () => refreshAll();
    const runLogout = async () => {
      try {
        const csrfToken = await getCsrfToken();
        await fetch(`${AUTH_API}?action=logout`, {
          method: "POST",
          headers: { "X-CSRF-Token": csrfToken },
          credentials: "same-origin"
        });
      } catch {}
      [localStorage, sessionStorage].forEach(store => {
        AUTH_STORAGE_KEYS.forEach(key => {
          try { store.removeItem(key); } catch {}
        });
      });
      window.location.replace("index.html");
    };
    const runThemeToggle = () => {
      const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem("theme", JSON.stringify(next)); } catch {}
    };

    $("#adminRefresh")?.addEventListener("click", runRefresh);
    $("#adminRefreshPanel")?.addEventListener("click", () => {
      runRefresh();
      closeAdminDrawers();
    });
    $("#adminLogout")?.addEventListener("click", runLogout);
    $("#adminLogoutPanel")?.addEventListener("click", runLogout);
    $("#adminThemeToggle")?.addEventListener("click", runThemeToggle);
    $("#adminThemeTogglePanel")?.addEventListener("click", runThemeToggle);

    try {
      let theme = localStorage.getItem("theme");
      try { theme = JSON.parse(theme); } catch {}
      if (theme === "dark" || theme === "light") document.documentElement.dataset.theme = theme;
    } catch {}

    try {
      const lastSection = localStorage.getItem(ADMIN_LAST_SECTION_KEY);
      if (lastSection) activateSection(lastSection);
    } catch {}
  }

  function metric(icon, label, value, helper) {
    return `<article class="admin-metric-card"><i class="${icon}"></i><strong>${esc(value)}</strong><span>${esc(label)}</span>${helper ? `<small>${esc(helper)}</small>` : ""}</article>`;
  }

  async function loadSummary() {
    const payload = await apiGet("summary");
    $("#adminApiStatus").innerHTML = '<i class="fas fa-circle-check"></i> Online';
    $("#adminName").textContent = payload.admin?.name || "Admin";
    $("#adminEmail").textContent = payload.admin?.email || "Verified access";
    $("#adminMetrics").innerHTML = [
      metric("fas fa-circle-question", "Total questions", payload.questions?.total ?? 0, "Across all courses"),
      metric("fas fa-users", "Users", payload.users?.total ?? 0, `${payload.users?.paid ?? 0} paid, ${payload.users?.free ?? 0} free`),
      metric("fas fa-comments", "Pending comments", payload.moderation?.pendingComments ?? 0, "Needs review"),
      metric("fas fa-envelope", "New messages", payload.moderation?.newMessages ?? 0, "Contact inbox"),
      metric("fas fa-thumbs-up", "Total likes", payload.engagement?.likes ?? 0, "Question engagement"),
      metric("fas fa-user-shield", "Admins", payload.users?.admins ?? 0, `${payload.users?.unverified ?? 0} unverified users`)
    ].join("");
    $("#adminCourseSummary").innerHTML = (payload.questions?.byCourse || []).map(row => `
      <div class="admin-compact-row"><span>${esc(row.course)}</span><strong>${esc(row.count)}</strong></div>
    `).join("") || '<div class="empty compact"><p>No course data found.</p></div>';
  }

  function populateTaxonomyControls() {
    const courseOptions = ['<option value="">All courses</option>']
      .concat((taxonomy.courses || []).map(row => `<option value="${esc(row.course)}">${esc(row.course)}</option>`))
      .join("");
    const editorCourseOptions = (taxonomy.courses || []).map(row => `<option value="${esc(row.course)}">${esc(row.course)}</option>`).join("");
    const yearOptions = ['<option value="">All years</option>']
      .concat(Object.keys(taxonomy.years || {}).map(year => `<option value="${esc(year)}">${esc(year)}</option>`))
      .join("");
    $("#questionCourseFilter").innerHTML = courseOptions;
    $("#qCourse").innerHTML = editorCourseOptions;
    $("#questionYearFilter").innerHTML = yearOptions;
  }

  async function loadTaxonomy() {
    taxonomy = await apiGet("taxonomy");
    populateTaxonomyControls();
    $("#taxonomySummary").innerHTML = (taxonomy.courses || []).map(course => {
      const topics = new Map();
      (course.items || []).forEach(item => {
        const key = `${item.chapter} / ${item.topic}`;
        topics.set(key, (topics.get(key) || 0) + Number(item.count || 0));
      });
      return `<details class="admin-taxonomy-course" open>
        <summary><strong>${esc(course.course)}</strong><span>${esc(course.count)} questions</span></summary>
        <div class="admin-topic-list">
          ${Array.from(topics.entries()).map(([name, count]) => `<div><span>${esc(name)}</span><strong>${esc(count)}</strong></div>`).join("")}
        </div>
      </details>`;
    }).join("") || '<div class="empty compact"><p>No taxonomy data found.</p></div>';
  }

  async function loadQuestions() {
    const tbody = $("#questionRows");
    tbody.innerHTML = '<tr><td colspan="6">Loading questions...</td></tr>';
    const payload = await apiGet("questions", {
      q: $("#questionSearch").value.trim(),
      course: $("#questionCourseFilter").value,
      year: $("#questionYearFilter").value,
      type: $("#questionTypeFilter").value,
      limit: "120"
    });
    const rows = payload.data || [];
    questionRowsCache = rows;
    tbody.innerHTML = rows.length ? rows.map(q => `
      <tr>
        <td data-label="ID">${esc(q.id)}</td>
        <td data-label="Course">${esc(q.course)}</td>
        <td data-label="Topic"><strong>${esc(q.topic)}</strong><small>${esc(q.chapter)} / ${esc(q.year)}</small><span>${esc(q.plainQuestion || "")}</span></td>
        <td data-label="Type">${esc(q.type)}${q.difficulty ? ` / ${esc(q.difficulty)}` : ""}</td>
        <td data-label="Updated">${esc(q.updated_at || "")}</td>
        <td data-label="Action"><button class="btn btn-outline admin-small-btn" data-edit-course="${esc(q.course)}" data-edit-id="${esc(q.id)}">Edit</button></td>
      </tr>
    `).join("") : '<tr><td colspan="6">No questions found.</td></tr>';
    tbody.querySelectorAll("[data-edit-id]").forEach(btn => btn.addEventListener("click", () => loadQuestion(btn.dataset.editCourse, btn.dataset.editId)));
    updateEditorChecks();
  }

  function setQuestionForm(q) {
    suppressDraftSave = true;
    currentQuestion = q || null;
    setEditorTitleBase(q ? `Editing Question #${q.id}` : "New Question");
    $("#qId").value = q?.id ?? "";
    $("#qCourse").value = q?.course ?? ($("#qCourse").options[0]?.value || "");
    $("#qChapter").value = q?.chapter ?? "";
    $("#qTopic").value = q?.topic ?? "";
    $("#qSection").value = q?.section ?? "All Question";
    $("#qYear").value = q?.year ?? new Date().getFullYear();
    $("#qType").value = q?.type ?? "MCQ";
    $("#qDifficulty").value = q?.difficulty ?? "";
    $("#qQuestion").value = q?.question ?? "";
    $("#qOptions").value = q?.options == null ? "" : JSON.stringify(q.options, null, 2);
    $("#qAnswer").value = Array.isArray(q?.answer) || (q?.answer && typeof q.answer === "object")
      ? JSON.stringify(q.answer, null, 2)
      : (q?.answer ?? "");
    $("#qTheory").value = q?.theory ?? "";
    $("#qSolution").value = q?.solution ?? "";
    $("#questionPreview").hidden = true;
    lastPreviewFingerprint = "";
    suppressDraftSave = false;
    setEditorDirty(false);
    setMessage($("#questionSaveResult"), "info", q ? "Loaded. Edit fields, preview, then save." : "Create a new question, preview it, then save and publish.");
    updateDraftStatus();
    updateEditorChecks();
    setActiveEditorTab("question");
  }

  async function loadQuestion(course, id) {
    const payload = await apiGet("question", { course, id });
    setQuestionForm(payload.question);
    activateSection("questions");
    focusQuestionEditor(false);
  }

  function focusQuestionEditor(isNew) {
    const form = $("#questionForm");
    if (!form) return;
    form.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => {
      const target = isNew ? $("#qId") : $("#qQuestion");
      target?.focus({ preventScroll: true });
    }, 180);
  }

  function parseMaybeJson(value, allowEmpty) {
    const trimmed = String(value ?? "").trim();
    if (trimmed === "") return allowEmpty ? null : "";
    if (/^[\[{"]|^-?\d+(?:\.\d+)?$|^(true|false|null)$/i.test(trimmed)) {
      try { return JSON.parse(trimmed); } catch {}
    }
    return trimmed;
  }

  function readQuestionForm() {
    return {
      id: Number($("#qId").value),
      course: $("#qCourse").value,
      chapter: $("#qChapter").value.trim(),
      topic: $("#qTopic").value.trim(),
      section: $("#qSection").value,
      year: $("#qYear").value.trim(),
      type: $("#qType").value,
      difficulty: $("#qDifficulty").value || null,
      question: $("#qQuestion").value,
      options: strictParseOptions($("#qOptions").value, $("#qType").value),
      answer: parseMaybeJson($("#qAnswer").value, false),
      theory: $("#qTheory").value,
      solution: $("#qSolution").value
    };
  }

  function renderQuestionPreview(q) {
    const preview = $("#questionPreview");
    preview.hidden = false;
    preview.innerHTML = `
      <h3>${esc(q.course)} / ${esc(q.topic)}</h3>
      <div class="q-badge-row"><span class="q-badge">${esc(q.type)}</span><span class="q-badge">${esc(q.year)}</span>${q.difficulty ? `<span class="q-badge">${esc(q.difficulty)}</span>` : ""}</div>
      <h4>Question</h4><div class="rich-content">${q.question}</div>
      <h4>Answer</h4><pre>${esc(JSON.stringify(q.answer))}</pre>
      <h4>Theory</h4><div class="rich-content">${q.theory}</div>
      <h4>Solution</h4><div class="rich-content">${q.solution}</div>`;
    typesetPreviewIfNeeded(q);
  }

  async function previewQuestion() {
    const preview = $("#questionPreview");
    preview.hidden = false;
    preview.innerHTML = '<div class="auth-message info">Preparing safe preview...</div>';
    try {
      validateEditor(true);
      const q = readQuestionForm();
      const payload = await apiPost("preview_question", q);
      renderQuestionPreview(payload.preview || q);
      lastPreviewFingerprint = questionPreviewFingerprint();
      setMessage($("#questionSaveResult"), "success", "Preview ready. Now click Save & Publish.");
    } catch (err) {
      preview.innerHTML = `<div class="auth-message error">${esc(err.message)}</div>`;
    }
  }

  function showAllQuestionsAfterSave(savedQuestion) {
    $("#questionSearch").value = String(savedQuestion.id || "");
    $("#questionCourseFilter").value = savedQuestion.course || "";
    $("#questionYearFilter").value = "";
    $("#questionTypeFilter").value = "";
    const listCard = $(".admin-question-list-card");
    listCard?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function saveQuestion(event) {
    event.preventDefault();
    const result = $("#questionSaveResult");
    setMessage(result, "info", "Saving and regenerating public pages...");
    try {
      const validation = validateEditor(true);
      const q = readQuestionForm();
      if (!currentQuestion && lastPreviewFingerprint !== questionPreviewFingerprint()) {
        setMessage(result, "error", "For a new question, click Preview first, then Save & Publish.");
        $("#previewQuestionBtn")?.focus();
        return;
      }
      if (validation.duplicate && !confirm(`Possible duplicate found: #${validation.duplicate.id}. Save this question anyway?`)) {
        setMessage(result, "info", "Save cancelled. Review the possible duplicate first.");
        return;
      }
      const payload = await apiPost("save_question", q);
      try { localStorage.removeItem(QUESTION_DRAFT_KEY); } catch {}
      updateDraftStatus();
      setMessage(result, "success", `Saved. Public pages refreshed: ${payload.generated?.generatedPages ?? 0} pages from ${payload.generated?.questionCount ?? 0} questions.`);
      currentQuestion = { id: q.id, course: q.course };
      setEditorTitleBase(`Editing Question #${q.id}`);
      setEditorDirty(false);
      await Promise.all([loadSummary(), loadTaxonomy()]);
      showAllQuestionsAfterSave(q);
      await loadQuestions();
    } catch (err) {
      setMessage(result, "error", err.message);
    }
  }

  async function deleteQuestion() {
    const q = readQuestionForm();
    if (!q.id || !q.course) {
      setMessage($("#questionSaveResult"), "error", "Load a question before deleting.");
      return;
    }
    if (!confirm(`Delete question #${q.id} from ${q.course}? This also removes related comments, likes, notes, and progress rows.`)) return;
    try {
      const payload = await apiPost("delete_question", { id: q.id, course: q.course });
      setMessage($("#questionSaveResult"), "success", `Deleted. Public pages refreshed: ${payload.generated?.generatedPages ?? 0} pages.`);
      setQuestionForm(null);
      await Promise.all([loadSummary(), loadTaxonomy(), loadQuestions()]);
    } catch (err) {
      setMessage($("#questionSaveResult"), "error", err.message);
    }
  }

  async function importQuestions() {
    const result = $("#importResult");
    try {
      const data = JSON.parse($("#jsonInput").value);
      if (!Array.isArray(data)) throw new Error("JSON must be an array.");
      data.forEach((q, i) => requiredImportFields.forEach(k => {
        if (!(k in q)) throw new Error(`Item ${i + 1} missing ${k}.`);
      }));
      setMessage(result, "info", "Importing and regenerating public pages...");
      const csrfToken = await getCsrfToken();
      const res = await fetch("api/admin_import.php", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
        credentials: "same-origin",
        body: JSON.stringify(data)
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error || "Import failed.");
      setMessage(result, "success", `${payload.count} questions imported. Public pages refreshed: ${payload.generated?.generatedPages ?? 0} pages from ${payload.generated?.questionCount ?? 0} questions.`);
      await Promise.all([loadSummary(), loadTaxonomy(), loadQuestions()]);
    } catch (err) {
      setMessage(result, "error", err.message);
    }
  }

  async function loadUsers() {
    const tbody = $("#userRows");
    tbody.innerHTML = '<tr><td colspan="7">Loading users...</td></tr>';
    const payload = await apiGet("users");
    const users = payload.users || [];
    tbody.innerHTML = users.length ? users.map(user => `
      <tr data-user-id="${esc(user.id)}">
        <td data-label="User"><input class="admin-inline-input" data-user-field="name" value="${esc(user.name)}"></td>
        <td data-label="Email">${esc(user.email)}</td>
        <td data-label="Role"><select data-user-field="role"><option value="student"${user.role === "student" ? " selected" : ""}>student</option><option value="admin"${user.role === "admin" ? " selected" : ""}>admin</option></select></td>
        <td data-label="Plan"><select data-user-field="plan"><option value="free"${user.plan === "free" ? " selected" : ""}>free</option><option value="paid"${user.plan === "paid" ? " selected" : ""}>paid</option></select></td>
        <td data-label="Target"><input class="admin-inline-input" data-user-field="targetYear" value="${esc(user.target_year || "")}"></td>
        <td data-label="Verified">${user.email_verified_at ? "Yes" : "No"}</td>
        <td data-label="Action"><button class="btn btn-outline admin-small-btn" data-save-user="${esc(user.id)}">Save</button></td>
      </tr>
    `).join("") : '<tr><td colspan="7">No users found.</td></tr>';
    tbody.querySelectorAll("[data-save-user]").forEach(btn => btn.addEventListener("click", () => saveUser(btn.closest("tr"))));
  }

  async function saveUser(row) {
    const body = { id: Number(row.dataset.userId) };
    row.querySelectorAll("[data-user-field]").forEach(field => { body[field.dataset.userField] = field.value; });
    try {
      await apiPost("update_user", body);
      btnFlash(row.querySelector("[data-save-user]"), "Saved");
      await loadSummary();
    } catch (err) {
      alert(err.message);
    }
  }

  function btnFlash(btn, text) {
    if (!btn) return;
    const old = btn.textContent;
    btn.textContent = text;
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = old;
      btn.disabled = false;
    }, 1000);
  }

  async function loadModeration() {
    const commentsEl = $("#moderationComments");
    const messagesEl = $("#moderationMessages");
    if (!commentsEl || !messagesEl) return;
    commentsEl.innerHTML = '<div class="auth-message info">Loading comments...</div>';
    messagesEl.innerHTML = '<div class="auth-message info">Loading messages...</div>';
    try {
      const res = await fetch(MOD_API, { credentials: "same-origin", cache: "no-store" });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error || "Could not load moderation data.");
      commentsEl.innerHTML = payload.comments?.length ? payload.comments.map(comment => `
        <article class="moderation-item">
          <div class="comment-meta"><strong>${esc(comment.author_name)}</strong><span>${esc(comment.created_at)}</span><span class="q-badge">${esc(comment.status)}</span></div>
          <p>${esc(comment.body)}</p>
          <small>Question ${esc(comment.question_id)} · ${esc(comment.course)}</small>
          <div class="assessment-actions">
            <button class="btn btn-primary" data-mod-type="comment" data-mod-id="${comment.id}" data-mod-status="approved">Approve</button>
            <button class="btn btn-outline" data-mod-type="comment" data-mod-id="${comment.id}" data-mod-status="rejected">Reject</button>
            <button class="comment-delete" data-mod-type="comment" data-mod-id="${comment.id}" data-mod-action="delete">Delete</button>
          </div>
        </article>`).join("") : '<div class="empty compact"><h3>No comments</h3><p>No discussion comments yet.</p></div>';
      messagesEl.innerHTML = payload.messages?.length ? payload.messages.map(message => `
        <article class="moderation-item">
          <div class="comment-meta"><strong>${esc(message.name)}</strong><span>${esc(message.created_at)}</span><span class="q-badge">${esc(message.status)}</span></div>
          <p><b>${esc(message.topic)}</b> · ${esc(message.email)}</p>
          <p>${esc(message.message)}</p>
          <div class="assessment-actions">
            <button class="btn btn-primary" data-mod-type="message" data-mod-id="${message.id}" data-mod-status="read">Mark Read</button>
            <button class="btn btn-outline" data-mod-type="message" data-mod-id="${message.id}" data-mod-status="archived">Archive</button>
            <button class="comment-delete" data-mod-type="message" data-mod-id="${message.id}" data-mod-action="delete">Delete</button>
          </div>
        </article>`).join("") : '<div class="empty compact"><h3>No messages</h3><p>No contact messages yet.</p></div>';
      $$("[data-mod-type]").forEach(btn => btn.addEventListener("click", async () => {
        if (btn.dataset.modAction === "delete" && !confirm("Delete this item permanently?")) return;
        btn.disabled = true;
        try {
          await moderationRequest({
            type: btn.dataset.modType,
            id: Number(btn.dataset.modId),
            status: btn.dataset.modStatus,
            action: btn.dataset.modAction || "status"
          });
          await Promise.all([loadModeration(), loadSummary()]);
        } catch (err) {
          alert(err.message);
          btn.disabled = false;
        }
      }));
    } catch (err) {
      commentsEl.innerHTML = `<div class="auth-message error">${esc(err.message)}</div>`;
      messagesEl.innerHTML = "";
    }
  }

  async function loadMedia() {
    const payload = await apiGet("media");
    const files = payload.files || [];
    $("#mediaList").innerHTML = files.length ? files.map(file => `
      <article class="admin-media-card">
        <img src="${esc(file.path)}" alt="${esc(file.name)}" loading="lazy">
        <strong>${esc(file.name)}</strong>
        <code>${esc(file.path)}</code>
        <button class="btn btn-outline admin-small-btn" data-copy="${esc(file.path)}">Copy Path</button>
      </article>
    `).join("") : '<div class="empty compact"><p>No uploaded question images yet.</p></div>';
    $$("[data-copy]").forEach(btn => btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        btnFlash(btn, "Copied");
      } catch {
        prompt("Copy this path:", btn.dataset.copy);
      }
    }));
  }

  async function uploadMedia(event) {
    event.preventDefault();
    const result = $("#mediaResult");
    const file = $("#mediaFile").files[0];
    if (!file) return;
    setMessage(result, "info", "Uploading image...");
    const form = new FormData();
    form.append("image", file);
    try {
      const csrfToken = await getCsrfToken();
      const res = await fetch(`${API}?action=upload_media`, {
        method: "POST",
        headers: { "X-CSRF-Token": csrfToken },
        credentials: "same-origin",
        body: form
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error || "Upload failed.");
      setMessage(result, "success", `Uploaded: ${payload.file.path}`);
      $("#mediaUploadForm").reset();
      await loadMedia();
    } catch (err) {
      setMessage(result, "error", err.message);
    }
  }

  async function publish() {
    const result = $("#publishResult");
    setMessage(result, "info", "Regenerating public pages...");
    try {
      const payload = await apiPost("publish", {});
      setMessage(result, "success", `Done. ${payload.generated?.generatedPages ?? 0} pages generated from ${payload.generated?.questionCount ?? 0} questions.`);
      await loadSummary();
    } catch (err) {
      setMessage(result, "error", err.message);
    }
  }

  function bindForms() {
    $("#loadQuestionsBtn")?.addEventListener("click", loadQuestions);
    $("#questionSearch")?.addEventListener("keydown", event => { if (event.key === "Enter") loadQuestions(); });
    $("#newQuestionBtn")?.addEventListener("click", () => {
      setQuestionForm(null);
      activateSection("questions");
      focusQuestionEditor(true);
    });
    $("#questionForm")?.addEventListener("submit", saveQuestion);
    $("#questionForm")?.addEventListener("input", saveEditorDraftSoon);
    $("#questionForm")?.addEventListener("change", saveEditorDraftSoon);
    $("#previewQuestionBtn")?.addEventListener("click", previewQuestion);
    $("#deleteQuestionBtn")?.addEventListener("click", deleteQuestion);
    $("#restoreDraftBtn")?.addEventListener("click", restoreEditorDraft);
    $("#clearDraftBtn")?.addEventListener("click", clearEditorDraft);
    $$("[data-image-target]").forEach(btn => btn.addEventListener("click", () => insertImageSnippet(btn.dataset.imageTarget)));
    $("#importBtn")?.addEventListener("click", importQuestions);
    $("#clearImported")?.addEventListener("click", () => {
      localStorage.removeItem("importedQuestions");
      setMessage($("#importResult"), "success", "Local imported-question cache cleared. MySQL rows are not deleted.");
    });
    $("#mediaUploadForm")?.addEventListener("submit", uploadMedia);
    $("#publishBtn")?.addEventListener("click", publish);
    $("#designSettingsForm")?.addEventListener("submit", saveDesignSettings);
    $("#designPreviewBtn")?.addEventListener("click", previewDesignSettings);
    $("#designResetBtn")?.addEventListener("click", resetDesignSettings);
    $("#designAutoPaletteBtn")?.addEventListener("click", autoGeneratePalette);
    $("#designSwapThemeBtn")?.addEventListener("click", swapLightDarkThemes);
    $("#designCopyJsonBtn")?.addEventListener("click", copyDesignJson);
    $("#designApplyJsonBtn")?.addEventListener("click", applyDesignJson);
    $$(".admin-design-preset-btn[data-design-preset]").forEach(btn => {
      btn.addEventListener("click", () => applyDesignPreset(btn.dataset.designPreset));
    });
    $("#designSettingsForm")?.addEventListener("input", event => {
      if (event.target && event.target.id === "designJsonInput") return;
      scheduleDesignLivePreview();
      updateDesignRouteStatus();
    });
    $("#designSettingsForm")?.addEventListener("change", () => {
      updateDesignRouteStatus();
    });
    initMiniEditor();
  }

  function bindEditorShortcuts() {
    document.addEventListener("keydown", event => {
      const key = String(event.key || "").toLowerCase();
      const hasModifier = event.ctrlKey || event.metaKey;
      if (!hasModifier || event.altKey) return;
      const inQuestionsSection = document.querySelector(".admin-section.active")?.id === "admin-section-questions";
      if (!inQuestionsSection) return;

      if (key === "s" && !event.shiftKey) {
        event.preventDefault();
        $("#questionForm")?.requestSubmit();
        return;
      }
      if (key === "p" && event.shiftKey) {
        event.preventDefault();
        $("#previewQuestionBtn")?.click();
      }
    });
  }

  async function refreshAll() {
    $("#adminApiStatus").innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Loading';
    try {
      await loadSummary();
      await loadTaxonomy();
      await Promise.all([loadQuestions(), loadUsers(), loadModeration(), loadMedia(), loadDesignSettings()]);
    } catch (err) {
      $("#adminApiStatus").innerHTML = '<i class="fas fa-circle-exclamation"></i> Error';
      alert(err.message);
    }
  }

  document.addEventListener("DOMContentLoaded", async () => {
    bootDesignSystem();
    initShell();
    bindForms();
    bindEditorShortcuts();
    setQuestionForm(null);
    await refreshAll();
  });
})();
