(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    document.querySelectorAll("[data-hero]").forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var previous = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
        }
      }

      if (previous) {
        previous.addEventListener("click", function () {
          show(index - 1);
          start();
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          start();
        });
      }
      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          show(dotIndex);
          start();
        });
      });
      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      show(0);
      start();
    });
  }

  function setupRails() {
    document.querySelectorAll(".rail-section").forEach(function (section) {
      var rail = section.querySelector("[data-movie-rail]");
      var prev = section.querySelector("[data-rail-prev]");
      var next = section.querySelector("[data-rail-next]");
      if (!rail) {
        return;
      }
      function move(direction) {
        rail.scrollBy({
          left: direction * 420,
          behavior: "smooth"
        });
      }
      if (prev) {
        prev.addEventListener("click", function () {
          move(-1);
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          move(1);
        });
      }
    });
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupFilters() {
    document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
      var section = panel.closest("section") || document;
      var list = section.querySelector("[data-filter-list]") || document;
      var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
      var keyword = panel.querySelector("[data-filter-input]");
      var region = panel.querySelector("[data-filter-region]");
      var type = panel.querySelector("[data-filter-type]");
      var category = panel.querySelector("[data-filter-category]");

      function apply() {
        var q = normalize(keyword && keyword.value);
        var r = normalize(region && region.value);
        var t = normalize(type && type.value);
        var c = normalize(category && category.value);
        cards.forEach(function (card) {
          var haystack = normalize([
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.genre,
            card.dataset.tags
          ].join(" "));
          var match = true;
          if (q && haystack.indexOf(q) === -1) {
            match = false;
          }
          if (r && normalize(card.dataset.region).indexOf(r) === -1) {
            match = false;
          }
          if (t && normalize(card.dataset.type).indexOf(t) === -1) {
            match = false;
          }
          if (c && normalize(card.dataset.tags).indexOf(c) === -1) {
            match = false;
          }
          card.hidden = !match;
        });
      }

      [keyword, region, type, category].forEach(function (input) {
        if (!input) {
          return;
        }
        input.addEventListener("input", apply);
        input.addEventListener("change", apply);
      });

      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");
      if (query && keyword) {
        keyword.value = query;
      }
      apply();
    });
  }

  window.SiteVideo = {
    init: function (videoId, overlayId, source) {
      var video = document.getElementById(videoId);
      var overlay = document.getElementById(overlayId);
      var hlsInstance = null;

      if (!video || !overlay || !source) {
        return;
      }

      function attach() {
        if (video.dataset.ready === "true") {
          return;
        }
        video.dataset.ready = "true";
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else {
          video.src = source;
        }
      }

      function play() {
        attach();
        overlay.classList.add("is-hidden");
        video.setAttribute("controls", "controls");
        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
          attempt.catch(function () {});
        }
      }

      overlay.addEventListener("click", play);
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener("play", function () {
        overlay.classList.add("is-hidden");
      });
      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    }
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupRails();
    setupFilters();
  });
})();
