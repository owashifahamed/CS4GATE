(function () {
  "use strict";

  const root = document.querySelector("[data-public-discussion]");
  if (!root) return;

  const questionId = Number(root.dataset.questionId || 0);
  const course = root.dataset.course || "";
  const apiBase = root.dataset.apiBase || "../api/interactions.php";
  const signinHref = root.dataset.signinHref || "../signin.html";

  const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));

  root.innerHTML = `
    <div class="q-section-title"><i class="fas fa-comments"></i> Public Discussion</div>
    <div class="comments-box">
      <div class="discussion-toolbar">
        <button class="btn btn-outline" id="publicLikeBtn" type="button"><i class="far fa-thumbs-up"></i> Like</button>
        <span id="publicDiscussionStatus" class="discussion-status"></span>
      </div>
      <div id="publicCommentsList" class="comments-list"></div>
      <div class="comment-form">
        <textarea id="publicCommentInput" rows="3" placeholder="Ask a doubt or add a useful correction..."></textarea>
        <button class="btn btn-primary" id="publicCommentBtn" type="button"><i class="fas fa-paper-plane"></i> Add Comment</button>
      </div>
    </div>`;

  const listEl = document.getElementById("publicCommentsList");
  const statusEl = document.getElementById("publicDiscussionStatus");
  const likeBtn = document.getElementById("publicLikeBtn");
  const input = document.getElementById("publicCommentInput");
  const commentBtn = document.getElementById("publicCommentBtn");
  let state = { comments: [], likes: { count: 0, userLiked: false }, signedIn: false };
  let csrfTokenPromise = null;

  function csrfEndpoint() {
    return apiBase.replace(/interactions\.php(?:\?.*)?$/i, "auth.php?action=csrf");
  }

  async function getCsrfToken() {
    if (!csrfTokenPromise) {
      csrfTokenPromise = fetch(csrfEndpoint(), {
        cache: "no-store",
        credentials: "same-origin"
      })
        .then(res => res.ok ? res.json() : Promise.reject(new Error("Could not prepare secure request.")))
        .then(payload => payload.csrfToken || "");
    }
    return csrfTokenPromise;
  }

  function setStatus(message, type = "info") {
    statusEl.innerHTML = message || "";
    statusEl.dataset.type = type;
  }

  function signinMessage() {
    return `Sign in to comment or like. <a href="${esc(signinHref)}">Sign in</a>`;
  }

  function renderLike() {
    const liked = !!state.likes?.userLiked;
    const count = Number(state.likes?.count || 0);
    likeBtn.classList.toggle("active", liked);
    likeBtn.innerHTML = `<i class="${liked ? "fas" : "far"} fa-thumbs-up"></i> ${liked ? "Liked" : "Like"}${count ? ` (${count})` : ""}`;
  }

  function renderComments() {
    const comments = state.comments || [];
    listEl.innerHTML = comments.length ? comments.map(comment => `
      <div class="comment-item">
        <div class="comment-meta">
          <strong>${esc(comment.authorName || "Aspirant")}</strong>
          <span>${esc(comment.createdAt || "")}</span>
          ${comment.status === "pending" ? '<span class="q-badge">Pending</span>' : ""}
        </div>
        <p>${esc(comment.body)}</p>
        ${comment.canDelete ? `<button class="comment-delete" data-comment-id="${comment.id}"><i class="fas fa-trash"></i> Delete</button>` : ""}
      </div>`).join("") : `<div class="empty compact"><h3>No comments yet</h3><p>Start the discussion for this question.</p></div>`;

    listEl.querySelectorAll("[data-comment-id]").forEach(button => {
      button.addEventListener("click", async () => {
        try {
          await postAction({ action: "deleteComment", commentId: Number(button.dataset.commentId) });
          await loadDiscussion();
          setStatus("Comment deleted.", "success");
        } catch (err) {
          setStatus(esc(err.message), "error");
        }
      });
    });
  }

  async function postAction(body) {
    const csrfToken = await getCsrfToken();
    const response = await fetch(apiBase, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
      credentials: "same-origin",
      body: JSON.stringify({ questionId, course, ...body })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "Request failed.");
    return payload;
  }

  async function loadDiscussion() {
    try {
      const response = await fetch(`${apiBase}?questionId=${encodeURIComponent(questionId)}&course=${encodeURIComponent(course)}`, {
        credentials: "same-origin",
        cache: "no-store"
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Discussion unavailable.");
      state = payload;
      renderLike();
      renderComments();
      setStatus(state.signedIn ? "" : signinMessage(), "info");
    } catch (err) {
      renderComments();
      setStatus("Discussion is unavailable right now.", "error");
    }
  }

  likeBtn.addEventListener("click", async () => {
    try {
      const payload = await postAction({ action: "like", liked: !state.likes?.userLiked });
      state.likes = { count: payload.count, userLiked: payload.userLiked };
      renderLike();
      setStatus(payload.userLiked ? "Liked." : "Like removed.", "success");
    } catch (err) {
      setStatus(esc(err.message), "error");
    }
  });

  commentBtn.addEventListener("click", async () => {
    const body = input.value.trim();
    if (!body) return;
    commentBtn.disabled = true;
    try {
      const payload = await postAction({ action: "comment", body });
      input.value = "";
      await loadDiscussion();
      setStatus(payload.status === "pending" ? "Comment sent for moderation." : "Comment posted.", "success");
    } catch (err) {
      setStatus(esc(err.message), "error");
    } finally {
      commentBtn.disabled = false;
    }
  });

  if (!questionId || !course) {
    setStatus("Discussion cannot load for this question.", "error");
    return;
  }
  loadDiscussion();
})();
