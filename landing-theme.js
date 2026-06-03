(function () {
  "use strict";

  const storageKey = "theme";
  const root = document.documentElement;

  function syncSeoUrlMeta() {
    const canonical = document.querySelector('link[rel="canonical"]');
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (!canonical && !ogUrl) return;
    const url = `${window.location.origin}${window.location.pathname}${window.location.search || ""}`;
    if (canonical) canonical.setAttribute("href", url);
    if (ogUrl) ogUrl.setAttribute("content", url);
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

  function readTheme() {
    try {
      return JSON.parse(localStorage.getItem(storageKey)) || "light";
    } catch {
      return localStorage.getItem(storageKey) || "light";
    }
  }

  function saveTheme(theme) {
    localStorage.setItem(storageKey, JSON.stringify(theme));
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    document.querySelectorAll("[data-landing-theme-toggle]").forEach(button => {
      const dark = theme === "dark";
      button.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
      button.innerHTML = dark
        ? '<i class="fas fa-sun"></i><span>Light</span>'
        : '<i class="fas fa-moon"></i><span>Dark</span>';
    });
  }

  function enhanceMobileMenus() {
    document.querySelectorAll(".landing-nav").forEach(nav => {
      if (nav.dataset.mobileEnhanced === "1") return;
      nav.dataset.mobileEnhanced = "1";
      const links = nav.querySelector("nav");
      const logo = nav.querySelector(".auth-logo");
      if (!links || !logo) return;
      links.classList.add("landing-drawer-nav");
      const linksSlot = document.createComment("landing-nav-links-slot");
      nav.insertBefore(linksSlot, links);
      let drawerHost = document.querySelector(".landing-drawer-host");
      if (!drawerHost) {
        drawerHost = document.createElement("div");
        drawerHost.className = "landing-drawer-host";
        document.body.appendChild(drawerHost);
      }
      const courseMenus = links.querySelectorAll(".course-menu");
      const themeButton = links.querySelector("[data-landing-theme-toggle]");
      const signInButton = links.querySelector("a.btn");
      const themePlaceholder = document.createComment("landing-theme-slot");
      if (themeButton) themeButton.before(themePlaceholder);
      if (themeButton) themeButton.classList.add("landing-drawer-theme");
      if (signInButton) signInButton.classList.add("landing-drawer-signin");

      const primaryMenuIconMap = new Map([
        ["courses", "fas fa-graduation-cap"],
        ["practice", "fas fa-book-open"],
        ["quiz", "fas fa-layer-group"],
        ["mock test", "fas fa-clipboard-check"],
        ["about", "fas fa-circle-info"],
        ["pricing", "fas fa-crown"],
        ["sign in", "fas fa-right-to-bracket"]
      ]);

      function normalizeMenuLabel(label) {
        return (label || "").replace(/\s+/g, " ").trim().toLowerCase();
      }

      function getMenuIconClass(label) {
        return primaryMenuIconMap.get(normalizeMenuLabel(label)) || "";
      }

      function createMenuLabelNode(labelText, iconClass) {
        const label = document.createElement("span");
        label.className = "landing-item-label";
        const iconWrap = document.createElement("span");
        iconWrap.className = "landing-item-icon";
        iconWrap.setAttribute("aria-hidden", "true");
        const icon = document.createElement("i");
        icon.className = iconClass;
        iconWrap.appendChild(icon);
        const text = document.createElement("span");
        text.className = "landing-item-text";
        text.textContent = labelText;
        label.append(iconWrap, text);
        return label;
      }

      function iconizePrimaryLink(link) {
        if (!link || link.dataset.menuIconized === "1") return;
        if (link.classList.contains("landing-theme-toggle")) return;
        if (link.closest(".course-menu-panel")) return;
        const labelText = link.textContent.replace(/\s+/g, " ").trim();
        const iconClass = getMenuIconClass(labelText);
        if (!iconClass) return;
        const labelNode = createMenuLabelNode(labelText, iconClass);
        link.textContent = "";
        link.appendChild(labelNode);
        link.dataset.menuIconized = "1";
      }

      courseMenus.forEach(menu => {
        const button = menu.querySelector(".course-menu-btn");
        if (!button) return;
        const text = button.textContent.replace(/\s+/g, " ").trim();
        const iconClass = getMenuIconClass(text) || "fas fa-graduation-cap";
        const labelNode = createMenuLabelNode(text, iconClass);
        const tail = document.createElement("span");
        tail.className = "landing-item-tail";
        tail.setAttribute("aria-hidden", "true");
        const chevron = document.createElement("i");
        chevron.className = "fas fa-chevron-down";
        tail.appendChild(chevron);
        button.textContent = "";
        button.append(labelNode, tail);
      });

      links.querySelectorAll("a").forEach(iconizePrimaryLink);

      function closeCourseMenus() {
        courseMenus.forEach(menu => {
          menu.classList.remove("is-course-open");
          const button = menu.querySelector(".course-menu-btn");
          const tail = button?.querySelector(".landing-item-tail i");
          if (tail) tail.className = "fas fa-chevron-down";
          if (button) button.setAttribute("aria-expanded", "false");
        });
      }

      function syncResponsiveControls() {
        if (!themeButton) return;
        if (window.matchMedia("(max-width: 1100px)").matches) {
          if (themeButton.parentElement !== nav) {
            nav.appendChild(themeButton);
          }
        } else if (themeButton.parentElement !== links) {
          themePlaceholder.parentNode.insertBefore(themeButton, themePlaceholder.nextSibling);
        }
      }

      function syncDrawerPlacement() {
        const mobile = window.matchMedia("(max-width: 1100px)").matches;
        if (mobile) {
          if (links.parentElement !== drawerHost) {
            drawerHost.appendChild(links);
          }
          return;
        }
        if (links.parentElement !== nav) {
          linksSlot.parentNode.insertBefore(links, linksSlot.nextSibling);
        }
      }

      syncResponsiveControls();
      syncDrawerPlacement();
      window.addEventListener("resize", syncResponsiveControls);
      window.addEventListener("resize", syncDrawerPlacement);

      courseMenus.forEach(menu => {
        const button = menu.querySelector(".course-menu-btn");
        if (!button) return;
        button.setAttribute("aria-expanded", "false");
        button.addEventListener("click", event => {
          event.preventDefault();
          event.stopPropagation();
          const willOpen = !menu.classList.contains("is-course-open");
          closeCourseMenus();
          menu.classList.toggle("is-course-open", willOpen);
          button.setAttribute("aria-expanded", String(willOpen));
          const tail = button.querySelector(".landing-item-tail i");
          if (tail) tail.className = willOpen ? "fas fa-chevron-up" : "fas fa-chevron-down";
        });
      });

      const toggle = document.createElement("button");
      toggle.className = "landing-menu-toggle";
      toggle.type = "button";
      toggle.setAttribute("data-landing-menu-toggle", "");
      toggle.setAttribute("aria-label", "Open menu");
      toggle.setAttribute("aria-expanded", "false");
      toggle.innerHTML = '<i class="fas fa-bars"></i>';
      nav.appendChild(toggle);

      function closeNavMenu() {
        nav.classList.remove("is-menu-open");
        links.classList.remove("is-menu-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
        toggle.innerHTML = '<i class="fas fa-bars"></i>';
      }

      function openNavMenu() {
        syncDrawerPlacement();
        nav.classList.add("is-menu-open");
        links.classList.add("is-menu-open");
        toggle.setAttribute("aria-expanded", "true");
        toggle.setAttribute("aria-label", "Close menu");
        toggle.innerHTML = '<i class="fas fa-xmark"></i>';
      }

      function handleToggleTap(event) {
        event.preventDefault();
        event.stopPropagation();
        const open = !nav.classList.contains("is-menu-open");
        if (open) openNavMenu();
        else closeNavMenu();
        if (!open) closeCourseMenus();
      }

      toggle.addEventListener("pointerdown", event => {
        event.stopPropagation();
      });
      toggle.addEventListener("click", handleToggleTap);

      links.addEventListener("click", event => {
        const target = event.target.closest("a,button");
        if (!target) return;
        if (target.classList.contains("course-menu-btn")) return;
        if (target.classList.contains("landing-theme-toggle")) return;
        closeCourseMenus();
        closeNavMenu();
      });

      document.addEventListener("pointerdown", event => {
        if (nav.contains(event.target) || links.contains(event.target)) return;
        closeCourseMenus();
        if (nav.classList.contains("is-menu-open")) closeNavMenu();
      }, true);

      document.addEventListener("keydown", event => {
        if (event.key !== "Escape") return;
        closeCourseMenus();
        closeNavMenu();
      });

      window.addEventListener("resize", () => {
        if (!window.matchMedia("(max-width: 1100px)").matches) {
          closeNavMenu();
          closeCourseMenus();
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    bootDesignSystem();
    bootBrandLogo();
    syncSeoUrlMeta();
    enhanceMobileMenus();
    applyTheme(readTheme());
    document.querySelectorAll("[data-landing-theme-toggle]").forEach(button => {
      button.addEventListener("click", () => {
        const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
        saveTheme(next);
        applyTheme(next);
      });
    });
  });
})();
