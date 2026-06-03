/* ==========================================================
   CS4GATE - Authentication
   Uses backend auth API for signup/signin/logout.
   ========================================================== */

(function () {
  "use strict";

  const LS_CURRENT = "soaGateCurrentUser";
  const AUTH_STORAGE_KEYS = [
    LS_CURRENT,
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

  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
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

  async function apiPost(action, body) {
    const csrfToken = await getCsrfToken();
    const res = await fetch(`api/auth.php?action=${encodeURIComponent(action)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
      credentials: "same-origin",
      body: JSON.stringify(body)
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(payload.error || "Authentication request failed.");
    return payload;
  }

  function clearAuthStorage() {
    [localStorage, sessionStorage].forEach(store => {
      AUTH_STORAGE_KEYS.forEach(key => {
        try { store.removeItem(key); } catch {}
      });
    });
  }

  function storeFreshUser(user) {
    clearAuthStorage();
    localStorage.setItem(LS_CURRENT, JSON.stringify(user));
  }

  async function loadCaptcha() {
    const label = $("captchaQuestion");
    if (!label) return;
    try {
      const res = await fetch("api/auth.php?action=captcha", { cache: "no-store", credentials: "same-origin" });
      const payload = await res.json();
      label.textContent = `Bot check: ${payload.captcha.question}`;
      $("captchaAnswer").value = "";
    } catch {
      label.textContent = "Bot check";
    }
  }

  function getSafeRedirect() {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect");
    if (!redirect) return "";
    const clean = redirect.trim().replace(/^\/+/, "");
    const [path, query = ""] = clean.split("?", 2);
    const blocked = new Set(["signin.html", "signup.html", "forgot-password.html", "reset-password.html"]);
    if (!/^(?:[a-z0-9_-]+\/)*[a-z0-9_-]+\.html$/i.test(path)) return "";
    if (query && !/^[a-z0-9=&._%+-]*$/i.test(query)) return "";
    if (blocked.has(path.toLowerCase())) return "";
    return clean;
  }

  function isAdmin(user) {
    return String(user?.role || "").toLowerCase() === "admin";
  }

  function isPaid(user) {
    return (user?.plan || "free") === "paid" || isAdmin(user);
  }

  function dashboardFor(user) {
    if (isAdmin(user)) return "admin.html";
    return (user?.plan || "free") === "paid" ? "paid-dashboard.html" : "free.html";
  }

  function redirectFor(user) {
    const fallback = dashboardFor(user);
    if (isAdmin(user)) return fallback;

    const redirect = getSafeRedirect();
    if (!redirect) return fallback;

    const [path] = redirect.split("?", 1);
    const page = path.toLowerCase();
    const paidOnly = new Set(["paid-dashboard.html", "analytics.html", "quiz.html", "mock-test.html"]);

    if (page === "admin.html") return fallback;
    if (paidOnly.has(page) && !isPaid(user)) return "paid.html";

    return redirect;
  }

  function showMessage(message, type = "info") {
    const box = $("authMessage");
    if (!box) return;
    box.className = `auth-message ${type}`;
    box.innerHTML = esc(message);
  }

  function applyAuthQueryMessages() {
    const box = $("authMessage");
    if (!box) return;
    const params = new URLSearchParams(window.location.search);
    const verified = params.get("verified");
    if (verified === "1") {
      showMessage("Email verified. You can sign in now.", "success");
      return;
    }
    if (verified === "0") {
      const reason = (params.get("reason") || "").toLowerCase();
      if (reason === "invalid_or_expired") {
        showMessage("Verification link is invalid or expired. Use Resend Verification Email.", "error");
      } else {
        showMessage("Verification failed. Request a new verification email.", "error");
      }
    }
  }

  function setLoading(form, loading) {
    const btn = form.querySelector("button[type='submit']");
    if (!btn) return;
    btn.disabled = loading;
    btn.dataset.originalText = btn.dataset.originalText || btn.innerHTML;
    btn.innerHTML = loading ? '<i class="fas fa-circle-notch fa-spin"></i> Please wait' : btn.dataset.originalText;
  }

  function setButtonLoading(btn, loading) {
    if (!btn) return;
    btn.disabled = loading;
    btn.dataset.originalText = btn.dataset.originalText || btn.innerHTML;
    btn.innerHTML = loading ? '<i class="fas fa-circle-notch fa-spin"></i> Please wait' : btn.dataset.originalText;
  }

  async function handleSignIn(e) {
    e.preventDefault();
    const form = e.currentTarget;
    setLoading(form, true);
    const email = $("email").value.trim().toLowerCase();
    const password = $("password").value;
    const captchaAnswer = $("captchaAnswer")?.value || "";
    try {
      clearAuthStorage();
      const payload = await apiPost("signin", { email, password, captchaAnswer });
      const user = payload.user;
      storeFreshUser(user);
      showMessage("Signed in successfully. Redirecting...", "success");
      setTimeout(() => { window.location.replace(redirectFor(user)); }, 600);
    } catch (err) {
      showMessage(err.message, "error");
      loadCaptcha();
    } finally {
      setLoading(form, false);
    }
  }

  async function handleSignUp(e) {
    e.preventDefault();
    const form = e.currentTarget;
    setLoading(form, true);

    const name = $("name").value.trim();
    const email = $("email").value.trim().toLowerCase();
    const password = $("password").value;
    const confirm = $("confirmPassword").value;
    const targetYear = $("targetYear").value;
    const captchaAnswer = $("captchaAnswer")?.value || "";
    const plan = "free";

    if (password.length < 6) {
      setLoading(form, false);
      showMessage("Password must be at least 6 characters.", "error");
      return;
    }
    if (password !== confirm) {
      setLoading(form, false);
      showMessage("Passwords do not match.", "error");
      return;
    }

    try {
      const payload = await apiPost("signup", { name, email, password, targetYear, plan, captchaAnswer });
      clearAuthStorage();
      showMessage(payload.message || "Verification email sent. Open your Gmail/email inbox and verify before signing in.", "success");
      form.reset();
      loadCaptcha();
    } catch (err) {
      showMessage(err.message, "error");
      loadCaptcha();
    } finally {
      setLoading(form, false);
    }
  }

  function renderCurrentUser() {
    let user = null;
    try { user = JSON.parse(localStorage.getItem(LS_CURRENT)); } catch {}
    document.querySelectorAll("[data-auth-user]").forEach(el => {
      if (user) {
        el.innerHTML = `<i class="fas fa-user-circle"></i><span>${esc(user.name)}</span>`;
      }
    });
  }

  async function handleForgot(e) {
    e.preventDefault();
    const form = e.currentTarget;
    setLoading(form, true);
    try {
      const payload = await apiPost("forgot", { email: $("email").value.trim().toLowerCase() });
      showMessage(payload.message || "If the email exists, a reset link has been sent.", "success");
    } catch (err) {
      showMessage(err.message, "error");
    } finally {
      setLoading(form, false);
    }
  }

  async function handleResendVerification() {
    const btn = $("resendVerificationBtn");
    const email = $("email")?.value.trim().toLowerCase() || "";
    const captchaAnswer = $("captchaAnswer")?.value || "";
    if (!email) {
      showMessage("Enter your Gmail/email address first.", "error");
      return;
    }
    if (!captchaAnswer) {
      showMessage("Answer the bot check before resending verification.", "error");
      return;
    }
    setButtonLoading(btn, true);
    try {
      const payload = await apiPost("resend_verification", { email, captchaAnswer });
      showMessage(payload.message || "If this account needs verification, a new email has been sent.", "success");
      loadCaptcha();
    } catch (err) {
      showMessage(err.message, "error");
      loadCaptcha();
    } finally {
      setButtonLoading(btn, false);
    }
  }

  async function handleReset(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const password = $("password").value;
    const confirm = $("confirmPassword").value;
    if (password !== confirm) {
      showMessage("Passwords do not match.", "error");
      return;
    }
    const token = new URLSearchParams(window.location.search).get("token") || "";
    setLoading(form, true);
    try {
      const payload = await apiPost("reset", { token, password });
      showMessage(payload.message || "Password updated.", "success");
      setTimeout(() => { window.location.href = "signin.html"; }, 900);
    } catch (err) {
      showMessage(err.message, "error");
    } finally {
      setLoading(form, false);
    }
  }

  function bootBrandLogo() {
    if (window.SOA_BRAND && typeof window.SOA_BRAND.apply === "function") {
      window.SOA_BRAND.apply();
      return;
    }
    if (document.querySelector("script[data-brand-logo='1']")) return;
    const script = document.createElement("script");
    script.src = "brand-logo.js";
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
    const script = document.createElement("script");
    script.src = "design-system.js?v=20260531contrast1";
    script.defer = true;
    script.dataset.designSystem = "1";
    document.head.appendChild(script);
  }

  document.addEventListener("DOMContentLoaded", () => {
    bootDesignSystem();
    bootBrandLogo();
    $("signinForm")?.addEventListener("submit", handleSignIn);
    $("signupForm")?.addEventListener("submit", handleSignUp);
    $("resendVerificationBtn")?.addEventListener("click", handleResendVerification);
    $("forgotForm")?.addEventListener("submit", handleForgot);
    $("resetForm")?.addEventListener("submit", handleReset);
    loadCaptcha();
    renderCurrentUser();
    applyAuthQueryMessages();
  });

  window.SOAAuth = {
    getCurrentUser() {
      try { return JSON.parse(localStorage.getItem(LS_CURRENT)); }
      catch { return null; }
    },
    logout() {
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
  };
})();




