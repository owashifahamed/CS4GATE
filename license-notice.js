/*
 * Copyright (c) 2026 Sk Owashif Ahamed. All rights reserved.
 * Viewing and portfolio use only. Copying, modification, distribution,
 * deployment, or other use requires prior written permission.
 * See LICENSE and NOTICE in the repository root.
 */

(function () {
  const notice = "Copyright (c) 2026 Sk Owashif Ahamed. Viewing and portfolio use only. Unauthorized copying, modification, distribution, or use is prohibited.";

  if (typeof console !== "undefined") {
    console.info(notice);
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (document.querySelector("[data-license-notice]")) {
      return;
    }

    const footerNotice = document.createElement("div");
    footerNotice.setAttribute("data-license-notice", "true");
    footerNotice.textContent = notice;
    footerNotice.style.cssText = [
      "font: 12px/1.4 system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      "color: #64748b",
      "background: #f8fafc",
      "border-top: 1px solid #e2e8f0",
      "padding: 10px 16px",
      "text-align: center"
    ].join(";");

    document.body.appendChild(footerNotice);
  });
})();
