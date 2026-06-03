(function () {
  "use strict";

  const BRAND_LABEL = "CS4GATE";
  const BRAND_HTML = '<span class="brand-wordmark" aria-hidden="true"><span class="brand-wordmark-cs">CS</span><span class="brand-wordmark-4">4</span><span class="brand-wordmark-gate">GATE</span></span>';

  function applyBrandLogo() {
    const anchors = document.querySelectorAll(".logo a, .auth-logo");
    anchors.forEach(anchor => {
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.querySelector(".brand-wordmark")) return;
      anchor.classList.add("brand-logo-link", "brand-wordmark-link");
      anchor.setAttribute("aria-label", BRAND_LABEL);
      anchor.innerHTML = BRAND_HTML;
    });
  }

  window.SOA_BRAND = {
    apply: applyBrandLogo
  };
})();
