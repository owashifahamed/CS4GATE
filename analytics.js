(function () {
  "use strict";

  function questionDataUnavailable() {
    const status = window.questionsDataStatus || {};
    return status.ready === true && status.ok !== true && !(window.questionsData || []).length;
  }

  function renderUnavailable(root) {
    root.innerHTML = `
      <section class="content-hero"><span class="eyebrow">Paid analytics</span><h1>Your preparation report</h1><p>Track accuracy, daily goal, weak subjects, and recent paid practice history.</p></section>
      <section class="content-card">
        <div class="empty data-state" role="status">
          <div class="emoji"><i class="fas fa-triangle-exclamation"></i></div>
          <h3>Question data is temporarily unavailable</h3>
          <p>Analytics cannot calculate subject reports until the question bank loads.</p>
          <button class="btn btn-primary" id="retryQuestionData"><i class="fas fa-rotate-right"></i> Retry</button>
        </div>
      </section>`;
    document.getElementById("retryQuestionData")?.addEventListener("click", () => window.location.reload());
  }

  function renderAnalytics(root) {
    const p = JSON.parse(localStorage.getItem("progress") || '{"attempted":{},"correct":{},"incorrect":{},"daily":{}}');
    const questions = window.SOA ? window.SOA.getAllQuestions() : (window.questionsData || []);
    const attempted = Object.keys(p.attempted || {}).length;
    const correct = Object.keys(p.correct || {}).length;
    const wrong = Object.keys(p.incorrect || {}).length;
    const acc = attempted ? Math.round(correct / attempted * 100) : 0;
    const today = new Date().toISOString().slice(0, 10);
    const goal = window.SOA ? window.SOA.getDailyGoal() : 20;
    const daily = (p.daily || {})[today] || 0;
    const bySubject = {};
    questions.forEach(q => {
      bySubject[q.course] = bySubject[q.course] || { total: 0, attempted: 0, correct: 0, wrong: 0 };
      bySubject[q.course].total++;
      if ((p.attempted || {})[q.id]) bySubject[q.course].attempted++;
      if ((p.correct || {})[q.id]) bySubject[q.course].correct++;
      if ((p.incorrect || {})[q.id]) bySubject[q.course].wrong++;
    });
    const weak = Object.entries(bySubject).sort((a, b) => b[1].wrong - a[1].wrong).slice(0, 5);
    root.innerHTML = `
      <section class="content-hero"><span class="eyebrow">Paid analytics</span><h1>Your preparation report</h1><p>Track accuracy, daily goal, weak subjects, and recent paid practice history.</p></section>
      <section class="analytics-grid">
        <div class="history-card"><strong>${attempted}</strong><span>Attempted</span></div>
        <div class="history-card"><strong>${acc}%</strong><span>Accuracy</span></div>
        <div class="history-card"><strong>${wrong}</strong><span>Mistakes to review</span></div>
        <div class="history-card"><strong>${daily}/${goal}</strong><span>Daily goal</span></div>
      </section>
      <section class="content-card goal-card">
        <h2>Daily Practice Goal</h2>
        <p>Set a target for solved questions per day.</p>
        <input id="goalInput" class="nat-input" type="number" min="1" value="${goal}">
        <button class="btn btn-primary" id="saveGoal"><i class="fas fa-check"></i> Save Goal</button>
      </section>
      <section class="content-grid">
        ${weak.map(([name, s]) => `<article class="content-card"><h2>${name}</h2><p>${s.wrong} wrong, ${s.correct} correct, ${s.attempted}/${s.total} attempted.</p><div class="mini-bar"><span style="width:${s.attempted ? Math.round(s.correct / s.attempted * 100) : 0}%"></span></div></article>`).join("")}
      </section>
      <section class="content-card">
        <h2>Leaderboard Preview</h2>
        <div class="leaderboard">
          <div><strong>1. Top accuracy</strong><span>Practice data</span></div>
          <div><strong>2. Recent performer</strong><span>Local device</span></div>
          <div><strong>3. You</strong><span>${acc}%</span></div>
        </div>
      </section>`;
    document.getElementById("saveGoal")?.addEventListener("click", () => {
      window.SOA?.setDailyGoal(document.getElementById("goalInput").value);
      location.reload();
    });
  }

  document.addEventListener("DOMContentLoaded", async () => {
    const root = document.getElementById("analyticsRoot");
    if (!root) return;
    if (window.questionsDataReady) {
      try { await window.questionsDataReady; } catch {}
    }
    if (questionDataUnavailable()) {
      renderUnavailable(root);
      return;
    }
    renderAnalytics(root);
  });
})();
