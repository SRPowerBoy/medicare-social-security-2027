(function () {
  "use strict";

  var D = window.SITE_DATA || {};

  // ---- Shared number formatting (used by every page) ----
  var fmt2 = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
  var fmt0 = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  window.Fmt = {
    money: function (n) { return fmt2.format(n); },
    money0: function (n) { return fmt0.format(n); },
    signed: function (n) { return (n > 0 ? "+" : n < 0 ? "−" : "") + fmt2.format(Math.abs(n)); },
    pct: function (n, digits) { return (n * 100).toFixed(digits == null ? 1 : digits) + "%"; }
  };

  // ---- Icons: replace every <i data-lucide="..."> with its Lucide SVG ----
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }

  // ---- Fill any element marked with data-bind from the data file ----
  function lookup(path) {
    return path.split(".").reduce(function (obj, key) {
      return obj == null ? undefined : obj[key];
    }, D);
  }
  document.querySelectorAll("[data-bind]").forEach(function (el) {
    var value = lookup(el.getAttribute("data-bind"));
    if (value == null) return;
    var format = el.getAttribute("data-format");
    if (format === "money") el.textContent = window.Fmt.money(value);
    else if (format === "money0") el.textContent = window.Fmt.money0(value);
    else if (format === "pct") el.textContent = window.Fmt.pct(value);
    else el.textContent = String(value);
  });

  // ---- Reading progress bar on guide pages ----
  var bar = document.querySelector(".progress");
  if (bar) {
    var updateProgress = function () {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      bar.style.width = max > 0 ? (h.scrollTop / max * 100) + "%" : "0";
    };
    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();
  }

  // ---- Table of contents: highlight the section being read ----
  var tocLinks = document.querySelectorAll(".toc a[href^='#']");
  if (tocLinks.length && "IntersectionObserver" in window) {
    var linkFor = {};
    tocLinks.forEach(function (a) { linkFor[a.getAttribute("href").slice(1)] = a; });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        tocLinks.forEach(function (a) { a.classList.remove("active"); a.removeAttribute("aria-current"); });
        var link = linkFor[entry.target.id];
        if (link) { link.classList.add("active"); link.setAttribute("aria-current", "true"); }
      });
    }, { rootMargin: "-20% 0px -70% 0px" });
    Object.keys(linkFor).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) observer.observe(section);
    });
  }

  // ---- Footer year ----
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
