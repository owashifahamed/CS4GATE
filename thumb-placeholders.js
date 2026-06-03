(function () {
  "use strict";

  const BRAND = "CS4GATE";

  function defaultBrand() {
    const fromTheme = document.documentElement.getAttribute("data-cs4-thumb-brand");
    return plain(fromTheme || BRAND);
  }

  function plain(value) {
    return String(value ?? "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function esc(value) {
    return plain(value).replace(/[&<>"']/g, (ch) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[ch]));
  }

  function render(options = {}) {
    const variant = plain(options.variant || "dashboard-question").toLowerCase();
    const label = plain(options.label || options.subject || "GATE Computer Science").toUpperCase();
    const title = plain(options.title || options.chapter || options.subject || "Practice");
    const subtitle = plain(options.subtitle || options.topic || "");
    const brand = plain(options.brand || defaultBrand());

    return `
      <div class="cs4-thumb cs4-thumb--${esc(variant)}" aria-hidden="true">
        <span class="cs4-thumb-label">${esc(label)}</span>
        <strong class="cs4-thumb-title">${esc(title)}</strong>
        ${subtitle ? `<span class="cs4-thumb-subtitle">${esc(subtitle)}</span>` : ""}
        <span class="cs4-thumb-brand">${esc(brand)}</span>
      </div>
    `;
  }

  function injectSubjectGrid(root = document) {
    root.querySelectorAll(".portal-subject-grid a").forEach((card) => {
      if (card.querySelector(".cs4-thumb")) return;
      const subject = plain(card.querySelector("strong")?.textContent || "");
      const subtitle = plain(card.querySelector("span")?.textContent || "");
      const thumbHtml = render({
        variant: "subject",
        label: "GATE Computer Science",
        title: subject || "Computer Science",
        subtitle: subtitle
      });
      card.insertAdjacentHTML("afterbegin", thumbHtml);
      card.classList.add("has-cs4-thumb");
    });
  }

  window.SOA_THUMB = {
    render,
    plain,
    injectSubjectGrid
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => injectSubjectGrid(document));
  } else {
    injectSubjectGrid(document);
  }
})();
