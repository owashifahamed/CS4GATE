(function () {
  "use strict";

  const STYLE_ID = "cs4-design-settings-style";
  const CACHE_KEY = "cs4DesignSettingsCache:v4";
  const CACHE_TTL_MS = 10 * 60 * 1000;
  const PRESET_KEYS = new Set(["inherit", "royal", "ocean", "emerald", "sunset", "slate"]);
  const PRESET_CORES = {
    royal: { primary: "#2A9CB3", accent: "#6B35C8" },
    ocean: { primary: "#1794C7", accent: "#365DCC" },
    emerald: { primary: "#1D9E88", accent: "#3F7D44" },
    sunset: { primary: "#D46A35", accent: "#8F3BC1" },
    slate: { primary: "#4E7AA8", accent: "#4A5A73" }
  };
  const PAID_GROUP_PAGES = new Set([
    "paid.html",
    "paid-dashboard.html",
    "quiz.html",
    "mock-test.html",
    "analytics.html"
  ]);
  const PRESET_BACKGROUND_GLOW = {
    inherit: {
      lightPrimary: "24%",
      lightAccent: "20%",
      darkPrimary: "32%",
      darkAccent: "28%"
    },
    royal: {
      lightPrimary: "26%",
      lightAccent: "23%",
      darkPrimary: "35%",
      darkAccent: "31%"
    },
    ocean: {
      lightPrimary: "22%",
      lightAccent: "18%",
      darkPrimary: "30%",
      darkAccent: "24%"
    },
    emerald: {
      lightPrimary: "19%",
      lightAccent: "16%",
      darkPrimary: "26%",
      darkAccent: "22%"
    },
    sunset: {
      lightPrimary: "28%",
      lightAccent: "26%",
      darkPrimary: "37%",
      darkAccent: "34%"
    },
    slate: {
      lightPrimary: "18%",
      lightAccent: "14%",
      darkPrimary: "24%",
      darkAccent: "19%"
    }
  };

  function buildApiPath() {
    return window.location.pathname.includes("/questions/")
      ? "../api/design_settings.php"
      : "api/design_settings.php";
  }

  function safeColor(value, fallback) {
    const v = String(value || "").trim().toUpperCase();
    return /^#[0-9A-F]{6}$/.test(v) ? v : fallback;
  }

  function safeInt(value, min, max, fallback) {
    const n = Number.parseInt(String(value ?? ""), 10);
    if (!Number.isFinite(n) || n < min || n > max) return fallback;
    return n;
  }

  function safeCssValue(value, fallback) {
    const v = String(value ?? "").trim();
    if (!v) return fallback;
    if (/[{};]/.test(v)) return fallback;
    return v.slice(0, 220);
  }

  function safeText(value, fallback) {
    const v = String(value ?? "").trim().replace(/\s+/g, " ");
    if (!v) return fallback;
    return v.slice(0, 30);
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
    const clamp = (value) => Math.max(0, Math.min(255, Math.round(Number(value) || 0)));
    return `#${[clamp(r), clamp(g), clamp(b)].map((value) => value.toString(16).padStart(2, "0")).join("").toUpperCase()}`;
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

  function normalizePresetKey(value) {
    const key = String(value ?? "inherit").trim().toLowerCase();
    return PRESET_KEYS.has(key) ? key : "inherit";
  }

  function currentPageName() {
    return String(window.location.pathname || "").split("/").pop()?.toLowerCase() || "index.html";
  }

  function detectPageGroup() {
    const plan = String(document.body?.dataset?.plan || "").toLowerCase();
    if (plan === "free") return "free";
    if (plan === "paid") return "paid";
    const page = currentPageName();
    if (page === "free.html") return "free";
    if (PAID_GROUP_PAGES.has(page)) return "paid";
    return "public";
  }

  function resolveGroupPresetSettings(settings) {
    const baseGlobal = settings.global && typeof settings.global === "object" ? { ...settings.global } : {};
    const light = settings.light && typeof settings.light === "object" ? { ...settings.light } : {};
    const dark = settings.dark && typeof settings.dark === "object" ? { ...settings.dark } : {};
    const pageGroup = detectPageGroup();

    let presetKey = "inherit";
    if (pageGroup === "free") {
      presetKey = normalizePresetKey(baseGlobal.groupPresetFree);
    } else if (pageGroup === "paid") {
      presetKey = normalizePresetKey(baseGlobal.groupPresetPaid);
    } else {
      presetKey = normalizePresetKey(baseGlobal.groupPresetPublic);
    }

    if (presetKey !== "inherit" && PRESET_CORES[presetKey]) {
      const core = PRESET_CORES[presetKey];
      Object.assign(light, generateThemePalette(core.primary, core.accent, "light"));
      Object.assign(dark, generateThemePalette(core.primary, core.accent, "dark"));
    }

    return {
      global: baseGlobal,
      light,
      dark,
      pageGroup,
      presetKey
    };
  }

  function resolveBackgroundGlow(presetKey) {
    const key = PRESET_BACKGROUND_GLOW[presetKey] ? presetKey : "inherit";
    return PRESET_BACKGROUND_GLOW[key];
  }

  function buildThemeCss(selector, theme, mode = "light") {
    const primary = safeColor(theme.primary, "#1FA5AD");
    const accent = safeColor(theme.accent, "#5B2F99");
    const nav = safeColor(theme.nav, "#172B44");
    const nav2 = safeColor(theme.nav2, "#23384A");
    const bg = safeColor(theme.bg, "#F4F8FC");
    const bgElev = safeColor(theme.bgElev, "#FFFFFF");
    const bgSoft = safeColor(theme.bgSoft, "#EDF4FA");
    const text = ensureContrast(safeColor(theme.text, "#1F2A37"), bg, 7.5);
    const textMuted = ensureContrast(safeColor(theme.textMuted, "#5F6D7A"), bg, 4.5);
    const border = safeColor(theme.border, "#B9C8D8");
    const buttonPrimaryBg = safeColor(theme.buttonPrimaryBg, accent);
    const buttonPrimaryText = ensureContrast(safeColor(theme.buttonPrimaryText, readableTextOn(buttonPrimaryBg)), buttonPrimaryBg, 4.5);
    const thumbBaseStart = safeColor(theme.thumbBaseStart, "#15283F");
    const thumbBaseMid = safeColor(theme.thumbBaseMid, "#19314E");
    const thumbBaseEnd = safeColor(theme.thumbBaseEnd, "#1B2E49");
    const thumbGlow = safeColor(theme.thumbGlow, "#7150D9");
    const thumbCorner = safeColor(theme.thumbCorner, "#2AB3C6");
    const thumbLabel = safeColor(theme.thumbLabel, "#D7BCFF");
    const thumbTitle = safeColor(theme.thumbTitle, "#FFFFFF");
    const thumbSubtitle = safeColor(theme.thumbSubtitle, "#DCE8FF");
    const thumbBrand = safeColor(theme.thumbBrand, "#C9DCFF");
    const thumbBorder = safeColor(theme.thumbBorder, accent);

    const shortcutBaseStart = safeColor(theme.shortcutBaseStart, thumbBaseStart);
    const shortcutBaseMid = safeColor(theme.shortcutBaseMid, thumbBaseMid);
    const shortcutBaseEnd = safeColor(theme.shortcutBaseEnd, thumbBaseEnd);
    const shortcutGlow = safeColor(theme.shortcutGlow, thumbGlow);
    const shortcutCorner = safeColor(theme.shortcutCorner, thumbCorner);
    const shortcutLabel = safeColor(theme.shortcutLabel, thumbLabel);
    const shortcutTitle = safeColor(theme.shortcutTitle, thumbTitle);
    const shortcutSubtitle = safeColor(theme.shortcutSubtitle, thumbSubtitle);
    const shortcutBrand = safeColor(theme.shortcutBrand, thumbBrand);
    const shortcutBorder = safeColor(theme.shortcutBorder, thumbBorder);
    const darkMode = mode === "dark";
    const navText = ensureContrast(readableTextOn(nav), nav, 4.5);
    const heroText = ensureContrast(readableTextOn(nav2), nav2, 4.5);
    const heroSubtext = ensureContrast(mixHex(heroText, nav2, darkMode ? 0.22 : 0.34), nav2, 3.6);
    const inputBg = darkMode ? mixHex(bgElev, "#000000", 0.14) : mixHex(bgElev, "#FFFFFF", 0.92);
    const inputText = ensureContrast(text, inputBg, 7);
    const overlayBg = darkMode ? mixHex(bgElev, nav, 0.46) : mixHex(bgElev, "#FFFFFF", 0.68);
    const overlaySoft = darkMode ? mixHex(bgSoft, nav2, 0.44) : mixHex(bgSoft, "#FFFFFF", 0.44);
    const btnSurfaceBg = darkMode ? mixHex(bgElev, accent, 0.24) : mixHex(bgElev, accent, 0.10);
    const btnSurfaceBgHover = darkMode ? mixHex(bgElev, accent, 0.34) : mixHex(bgElev, accent, 0.20);
    const btnSurfaceText = ensureContrast(mixHex(text, accent, darkMode ? 0.12 : 0.18), btnSurfaceBg, 4.5);
    const btnSurfaceBorder = mixHex(border, accent, darkMode ? 0.34 : 0.24);
    const brandCs = ensureContrast(mixHex(primary, navText, darkMode ? 0.34 : 0.28), nav, 3);
    const brandGate = ensureContrast(mixHex(navText, heroText, 0.22), nav, 3);
    const heroStatBg = darkMode ? mixHex(nav2, "#FFFFFF", 0.12) : mixHex(nav2, "#FFFFFF", 0.20);
    const heroStatBorder = mixHex(navText, heroStatBg, darkMode ? 0.68 : 0.62);
    const typeNat = darkMode ? mixHex("#F7CB56", accent, 0.18) : mixHex("#F7CB56", "#FFFFFF", 0.08);
    const typeNatText = ensureContrast(safeColor(theme.typeNatText, readableTextOn(typeNat)), typeNat, 4.5);
    const scrollTrack = darkMode ? mixHex(bg, "#000000", 0.22) : mixHex(bg, "#1D2A3A", 0.06);
    const scrollTrackBorder = mixHex(scrollTrack, darkMode ? "#FFFFFF" : "#1D2A3A", darkMode ? 0.15 : 0.16);
    const scrollThumb = darkMode ? mixHex(primary, "#FFFFFF", 0.24) : mixHex(primary, "#1D2A3A", 0.20);
    const scrollThumbBorder = mixHex(scrollThumb, darkMode ? "#000000" : "#FFFFFF", darkMode ? 0.12 : 0.20);
    const scrollThumbHover = darkMode ? mixHex(primary, "#FFFFFF", 0.38) : mixHex(primary, "#1D2A3A", 0.10);
    const drawerBg = darkMode ? mixHex(nav, "#FFFFFF", 0.08) : mixHex(nav, "#FFFFFF", 0.88);
    const drawerHeadBg = darkMode ? mixHex(nav2, "#FFFFFF", 0.12) : mixHex(nav, "#FFFFFF", 0.84);
    const drawerRowBg = darkMode ? mixHex(nav2, "#FFFFFF", 0.18) : mixHex(nav, "#FFFFFF", 0.93);
    const drawerRowHoverBg = darkMode ? mixHex(primary, nav2, 0.30) : mixHex(primary, "#FFFFFF", 0.84);
    const drawerPanelBg = darkMode ? mixHex(nav2, "#000000", 0.14) : mixHex(nav, "#FFFFFF", 0.88);
    const drawerFooterBg = darkMode ? mixHex(nav, accent, 0.18) : mixHex(accent, "#FFFFFF", 0.87);
    const drawerText = darkMode ? mixHex("#FFFFFF", text, 0.88) : darken(nav, 0.44);
    const drawerMuted = darkMode ? mixHex(drawerText, bgSoft, 0.34) : mixHex(drawerText, "#FFFFFF", 0.28);
    const drawerBorder = darkMode ? mixHex(border, "#FFFFFF", 0.22) : mixHex(border, nav, 0.18);
    const drawerFooterBorder = darkMode ? mixHex(accent, "#FFFFFF", 0.24) : mixHex(accent, "#FFFFFF", 0.46);

    return `${selector}{
  --primary:${primary};
  --accent:${accent};
  --nav:${nav};
  --nav-2:${nav2};
  --sidebar-1:${nav};
  --sidebar-2:${nav2};
  --bg:${bg};
  --bg-elev:${bgElev};
  --bg-soft:${bgSoft};
  --bg-subtle:${bgSoft};
  --text:${text};
  --text-muted:${textMuted};
  --border:${border};
  --input-bg:${inputBg};
  --input-text:${inputText};
  --nav-text:${navText};
  --hero-text:${heroText};
  --hero-subtext:${heroSubtext};
  --brand-cs:${brandCs};
  --brand-gate:${brandGate};
  --hero-stat-bg:${heroStatBg};
  --hero-stat-border:${heroStatBorder};
  --overlay-bg:${overlayBg};
  --overlay-soft:${overlaySoft};
  --scroll-track:${scrollTrack};
  --scroll-track-border:${scrollTrackBorder};
  --scroll-thumb:${scrollThumb};
  --scroll-thumb-border:${scrollThumbBorder};
  --scroll-thumb-hover:${scrollThumbHover};
  --scroll-thumb-solid:${scrollThumbHover};
  --type-nat:${typeNat};
  --type-nat-text:${typeNatText};
  --btn-primary-bg:${buttonPrimaryBg};
  --btn-primary-text:${buttonPrimaryText};
  --btn-surface-bg:${btnSurfaceBg};
  --btn-surface-bg-hover:${btnSurfaceBgHover};
  --btn-surface-text:${btnSurfaceText};
  --btn-surface-border:${btnSurfaceBorder};
  --premium-gradient:${buttonPrimaryBg};
  --thumb-base-start:${thumbBaseStart};
  --thumb-base-mid:${thumbBaseMid};
  --thumb-base-end:${thumbBaseEnd};
  --thumb-glow-color:${thumbGlow};
  --thumb-corner-color:${thumbCorner};
  --thumb-label-color:${thumbLabel};
  --thumb-title-color:${thumbTitle};
  --thumb-subtitle-color:${thumbSubtitle};
  --thumb-brand-color:${thumbBrand};
  --thumb-border-color:${thumbBorder};
  --thumb-shortcut-base-start:${shortcutBaseStart};
  --thumb-shortcut-base-mid:${shortcutBaseMid};
  --thumb-shortcut-base-end:${shortcutBaseEnd};
  --thumb-shortcut-glow-color:${shortcutGlow};
  --thumb-shortcut-corner-color:${shortcutCorner};
  --thumb-shortcut-label-color:${shortcutLabel};
  --thumb-shortcut-title-color:${shortcutTitle};
  --thumb-shortcut-subtitle-color:${shortcutSubtitle};
  --thumb-shortcut-brand-color:${shortcutBrand};
  --thumb-shortcut-border-color:${shortcutBorder};
  --drawer-bg:${drawerBg};
  --drawer-head-bg:${drawerHeadBg};
  --drawer-row-bg:${drawerRowBg};
  --drawer-row-hover-bg:${drawerRowHoverBg};
  --drawer-panel-bg:${drawerPanelBg};
  --drawer-footer-bg:${drawerFooterBg};
  --drawer-text:${drawerText};
  --drawer-muted:${drawerMuted};
  --drawer-border:${drawerBorder};
  --drawer-footer-border:${drawerFooterBorder};
}`;
  }

  function apply(rawSettings) {
    if (!rawSettings || typeof rawSettings !== "object") return;

    const resolved = resolveGroupPresetSettings(rawSettings);
    const global = resolved.global || {};
    const light = resolved.light || {};
    const dark = resolved.dark || {};

    const fontBody = safeCssValue(global.fontBody, '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif');
    const fontHeading = safeCssValue(global.fontHeading, '"Sora", "Inter", "Segoe UI", system-ui, -apple-system, sans-serif');
    const cardRadiusPx = safeInt(global.cardRadiusPx, 4, 24, 8);
    const cardShadow = safeCssValue(global.cardShadow, "rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px");
    const cardShadowHover = safeCssValue(global.cardShadowHover, "rgba(0, 0, 0, 0.24) 0px 3px 8px");
    const thumbDashboardHeight = safeInt(global.thumbDashboardHeight, 88, 180, 102);
    const thumbCourseQuestionHeight = safeInt(global.thumbCourseQuestionHeight, 96, 220, 112);
    const thumbSubjectHeight = safeInt(global.thumbSubjectHeight, 104, 240, 124);
    const thumbChapterHeight = safeInt(global.thumbChapterHeight, 104, 240, 132);
    const thumbBrandText = safeText(global.thumbBrandText, "CS4GATE");
    const bgGlow = resolveBackgroundGlow(resolved.presetKey);

    const css = `:root{
  --font-body:${fontBody};
  --font-heading:${fontHeading};
  --card-radius:${cardRadiusPx}px;
  --radius:${cardRadiusPx}px;
  --card-shadow:${cardShadow};
  --card-shadow-hover:${cardShadowHover};
  --thumb-dashboard-h:${thumbDashboardHeight}px;
  --thumb-course-question-h:${thumbCourseQuestionHeight}px;
  --thumb-subject-h:${thumbSubjectHeight}px;
  --thumb-chapter-h:${thumbChapterHeight}px;
  --bg-glow-primary-light:${bgGlow.lightPrimary};
  --bg-glow-accent-light:${bgGlow.lightAccent};
  --bg-glow-primary-dark:${bgGlow.darkPrimary};
  --bg-glow-accent-dark:${bgGlow.darkAccent};
}
${buildThemeCss('html[data-theme="light"]', light, "light")}
${buildThemeCss('html[data-theme="dark"]', dark, "dark")}
`;

    let styleEl = document.getElementById(STYLE_ID);
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = STYLE_ID;
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = css;
    document.documentElement.setAttribute("data-cs4-thumb-brand", thumbBrandText);
    document.documentElement.setAttribute("data-cs4-page-group", resolved.pageGroup);
    document.documentElement.setAttribute("data-cs4-page-preset", resolved.presetKey);
    document.querySelectorAll(".cs4-thumb-brand").forEach((node) => {
      node.textContent = thumbBrandText;
    });
    window.CS4_DESIGN_SETTINGS = {
      global,
      light,
      dark,
      raw: rawSettings,
      pageGroup: resolved.pageGroup,
      preset: resolved.presetKey
    };
    window.dispatchEvent(new CustomEvent("cs4:design-applied", { detail: window.CS4_DESIGN_SETTINGS }));
  }

  function readCache() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return null;
      if (Date.now() - Number(parsed.savedAt || 0) > CACHE_TTL_MS) return null;
      if (!parsed.settings || typeof parsed.settings !== "object") return null;
      return parsed.settings;
    } catch {
      return null;
    }
  }

  function writeCache(settings) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), settings }));
    } catch {}
  }

  async function load(force = false) {
    if (!force) {
      const cached = readCache();
      if (cached) {
        apply(cached);
      }
    }

    try {
      const res = await fetch(`${buildApiPath()}?v=20260531contrast1`, {
        cache: "no-store",
        credentials: "same-origin"
      });
      if (!res.ok) throw new Error("Design settings unavailable.");
      const payload = await res.json();
      const settings = payload?.settings;
      if (settings && typeof settings === "object") {
        apply(settings);
        writeCache(settings);
      }
    } catch {
      if (!window.CS4_DESIGN_SETTINGS) {
        const cached = readCache();
        if (cached) apply(cached);
      }
    }
  }

  window.CS4DesignSystem = {
    load,
    apply
  };

  load(false);
})();
