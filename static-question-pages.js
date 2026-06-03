(function () {
  "use strict";

  if (!window.CS4_STATIC_MODE) return;

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function plain(value) {
    const node = document.createElement("div");
    node.innerHTML = String(value || "");
    return (node.textContent || "").replace(/\s+/g, " ").trim();
  }

  function slug(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function thumb(variant, label, title, subtitle) {
    if (typeof window.renderThumbPlaceholder === "function") {
      return window.renderThumbPlaceholder({
        variant,
        subject: label,
        label,
        title,
        subtitle
      });
    }
    return "";
  }

  function questionHref(question) {
    return `${encodeURIComponent(question.id)}-${slug(question.topic || question.chapter || "question")}.html`;
  }

  function courseHref(course) {
    return `course-${slug(course)}.html`;
  }

  function courseQuestionCard(question) {
    return `<a class="course-question-card has-cs4-thumb" href="${questionHref(question)}">
      ${thumb("course-question", question.course, question.chapter || "Practice Set", question.topic || "")}
      <strong>${esc(plain(question.question))}</strong>
      <span>${esc([question.type, question.year, question.section].filter(Boolean).join(" / "))}</span>
    </a>`;
  }

  function renderLibrary(questions) {
    const anchor = document.getElementById("all-questions");
    if (!anchor) return;

    const existing = anchor.nextElementSibling;
    if (existing && existing.classList.contains("static-question-library")) existing.remove();

    const byCourse = new Map();
    questions.forEach(question => {
      if (!byCourse.has(question.course)) byCourse.set(question.course, []);
      byCourse.get(question.course).push(question);
    });

    const section = document.createElement("section");
    section.className = "content-card static-question-library";
    section.innerHTML = byCourse.size
      ? Array.from(byCourse.entries()).map(([course, rows]) => `
          <section class="course-question-page">
            <h2>${esc(course)}</h2>
            <div class="course-question-grid">${rows.map(courseQuestionCard).join("")}</div>
          </section>
        `).join("")
      : `<div class="empty"><h3>No questions available</h3><p>Add questions from the static demo admin panel.</p></div>`;
    anchor.insertAdjacentElement("afterend", section);
  }

  function renderCourse(questions, course) {
    const rows = questions.filter(question => question.course === course);
    const chapters = new Map();
    rows.forEach(question => {
      const chapter = question.chapter || "General";
      if (!chapters.has(chapter)) chapters.set(chapter, []);
      chapters.get(chapter).push(question);
    });
    const topics = new Set(rows.map(question => question.topic).filter(Boolean));

    const heroParagraph = document.querySelector(".content-hero p");
    if (heroParagraph) {
      heroParagraph.textContent = `Practice ${course} GATE CS questions with answers and solutions. Browse ${rows.length} questions across ${chapters.size} chapters and ${topics.size} topics for focused subject-wise revision.`;
    }

    const shortcuts = document.querySelector(".course-shortcut-grid");
    if (shortcuts) {
      shortcuts.innerHTML = `
        <a class="similar-item has-cs4-thumb course-shortcut-card" href="index.html">
          ${thumb("shortcut", "CS4GATE", "All Questions", `${questions.length} total questions`)}
          <strong>All Questions</strong><span>${questions.length} total questions</span>
        </a>
        ${Array.from(chapters.entries()).map(([chapter, chapterRows]) => `
          <a class="similar-item has-cs4-thumb course-shortcut-card" href="#${slug(chapter)}">
            ${thumb("shortcut", course, chapter, `${new Set(chapterRows.map(row => row.topic).filter(Boolean)).size} topics / ${chapterRows.length} questions`)}
            <strong>${esc(chapter)}</strong>
            <span>${new Set(chapterRows.map(row => row.topic).filter(Boolean)).size} topics / ${chapterRows.length} questions</span>
          </a>
        `).join("")}`;
    }

    const summary = document.querySelector(".content-card[id$='-summary']");
    if (summary) {
      summary.innerHTML = `<span class="eyebrow">Subject overview</span>
        ${thumb("subject", "GATE COMPUTER SCIENCE", course, `${chapters.size} chapters`)}
        <h2>${esc(course)} practice map</h2>
        <p>${rows.length} questions are available across ${chapters.size} chapters and ${topics.size} topics.</p>`;

      summary.parentElement.querySelectorAll(".static-course-chapter").forEach(node => node.remove());
      summary.insertAdjacentHTML("afterend", Array.from(chapters.entries()).map(([chapter, chapterRows]) => {
        const byTopic = new Map();
        chapterRows.forEach(question => {
          const topic = question.topic || "General";
          if (!byTopic.has(topic)) byTopic.set(topic, []);
          byTopic.get(topic).push(question);
        });
        return `<section class="content-card static-course-chapter" id="${slug(chapter)}">
          <span class="eyebrow">${esc(course)}</span>
          <h2>${esc(chapter)}</h2>
          ${thumb("chapter", course, chapter, `${byTopic.size} topics`)}
          ${Array.from(byTopic.entries()).map(([topic, topicRows]) => `
            <section class="course-question-page">
              <h3>${esc(topic)}</h3>
              <div class="course-question-grid">${topicRows.map(courseQuestionCard).join("")}</div>
            </section>
          `).join("")}
        </section>`;
      }).join(""));
    }
  }

  async function render() {
    if (window.questionsDataReady) {
      try { await window.questionsDataReady; } catch {}
    }
    const questions = Array.isArray(window.questionsData) ? window.questionsData : [];
    const path = window.location.pathname;
    if (path.endsWith("/questions/index.html") || path.endsWith("/questions/")) {
      renderLibrary(questions);
      return;
    }
    const match = path.match(/\/questions\/course-([^/]+)\.html$/);
    if (!match) return;
    const configured = (window.CS4_STATIC_DATA && window.CS4_STATIC_DATA.courses) || [];
    const course = configured.find(item => item.slug === match[1]);
    renderCourse(questions, course ? course.name : match[1].replace(/-/g, " "));
  }

  render();
  window.addEventListener("questionsDataUpdated", render);
})();
