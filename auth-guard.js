(function () {
  "use strict";

  const script = document.currentScript;
  const requirement = script?.dataset.require || "auth";
  const publicTarget = script?.dataset.publicTarget || "index.html";
  const signinTarget = script?.dataset.signinTarget || "signin.html";
  const upgradeTarget = script?.dataset.upgradeTarget || "paid.html";
  const logoutMarker = "soaGateLoggedOut";
  const authStorageKeys = [
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

  document.documentElement.style.visibility = "hidden";

  function clearUser() {
    [localStorage, sessionStorage].forEach(store => {
      authStorageKeys.forEach(key => {
        try { store.removeItem(key); } catch {}
      });
    });
  }

  function storeUser(user) {
    clearUser();
    try { localStorage.setItem("soaGateCurrentUser", JSON.stringify(user)); } catch {}
  }

  function getCachedUser() {
    try { return JSON.parse(localStorage.getItem("soaGateCurrentUser") || "null"); }
    catch { return null; }
  }

  function normalizeLocalPage(target) {
    const clean = String(target || "").trim().replace(/^\/+/, "");
    const [path, query = ""] = clean.split("?", 2);
    if (!/^(?:[a-z0-9_-]+\/)*[a-z0-9_-]+\.html$/i.test(path)) return "";
    if (query && !/^[a-z0-9=&._%+-]*$/i.test(query)) return "";
    return query ? `${path}?${query}` : path;
  }

  function currentPageTarget() {
    const fileName = window.location.pathname.split("/").filter(Boolean).pop() || "index.html";
    return normalizeLocalPage(`${fileName}${window.location.search}`) || "";
  }

  function signinRedirectTarget() {
    const target = currentPageTarget();
    if (!target) return signinTarget;
    const joiner = signinTarget.includes("?") ? "&" : "?";
    return `${signinTarget}${joiner}redirect=${encodeURIComponent(target)}`;
  }

  function consumeLogoutMarker() {
    try {
      if (sessionStorage.getItem(logoutMarker) !== "1") return false;
      sessionStorage.removeItem(logoutMarker);
      return true;
    } catch {}
    return false;
  }

  function dashboardFor(user) {
    if (String(user?.role || "").toLowerCase() === "admin") return "admin.html";
    return (user.plan || "free") === "paid" ? "paid-dashboard.html" : "free.html";
  }

  async function sessionUser() {
    try {
      const res = await fetch("api/auth.php?action=me&_=" + Date.now(), {
        cache: "no-store",
        credentials: "same-origin"
      });
      if (!res.ok) return null;
      const payload = await res.json();
      return payload && payload.user ? payload.user : null;
    } catch {}
    return null;
  }

  function redirect(target) {
    clearUser();
    window.location.replace(target);
  }

  function isAllowed(user) {
    if (!user) return false;
    const role = String(user.role || "").toLowerCase();
    if (requirement === "admin") return role === "admin";
    if (requirement === "paid") return user.plan === "paid" || role === "admin";
    return true;
  }

  function deniedTarget(user) {
    if (requirement === "paid") return upgradeTarget;
    if (requirement === "admin") return dashboardFor(user);
    return publicTarget;
  }

  async function check() {
    document.documentElement.style.visibility = "hidden";
    const user = await sessionUser();
    if (!user) {
      redirect(consumeLogoutMarker() ? publicTarget : signinRedirectTarget());
      return false;
    }
    storeUser(user);
    if (!isAllowed(user)) {
      window.location.replace(deniedTarget(user));
      return false;
    }
    document.documentElement.style.visibility = "";
    return true;
  }

  check();

  window.addEventListener("pageshow", event => {
    const nav = performance.getEntriesByType?.("navigation")?.[0];
    if (event.persisted || nav?.type === "back_forward") check();
  });
})();
