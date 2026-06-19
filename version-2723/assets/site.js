(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function setupMobileMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".mobile-nav");

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
      toggle.textContent = nav.classList.contains("is-open") ? "×" : "☰";
    });
  }

  function setupHeroCarousel() {
    var carousel = document.querySelector(".hero-carousel");

    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
    var prev = carousel.querySelector(".hero-control.prev");
    var next = carousel.querySelector(".hero-control.next");
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (!slides.length) {
      return;
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(active - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(active + 1);
        start();
      });
    }

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);

    show(0);
    start();
  }

  function setupFilters() {
    var filterRoot = document.querySelector("[data-filter-root]");

    if (!filterRoot) {
      return;
    }

    var search = filterRoot.querySelector("[data-search]");
    var year = filterRoot.querySelector("[data-year]");
    var type = filterRoot.querySelector("[data-type]");
    var cards = Array.prototype.slice.call(filterRoot.querySelectorAll(".movie-card"));
    var empty = filterRoot.querySelector(".empty-state");
    var counter = filterRoot.querySelector("[data-count]");

    function normalize(value) {
      return (value || "").toString().trim().toLowerCase();
    }

    function apply() {
      var keyword = normalize(search && search.value);
      var yearValue = normalize(year && year.value);
      var typeValue = normalize(type && type.value);
      var visibleCount = 0;

      cards.forEach(function (card) {
        var title = normalize(card.getAttribute("data-title"));
        var region = normalize(card.getAttribute("data-region"));
        var category = normalize(card.getAttribute("data-category"));
        var cardYear = normalize(card.getAttribute("data-year"));
        var cardType = normalize(card.getAttribute("data-type"));

        var matchesKeyword = !keyword || title.indexOf(keyword) !== -1 || region.indexOf(keyword) !== -1 || category.indexOf(keyword) !== -1 || cardType.indexOf(keyword) !== -1;
        var matchesYear = !yearValue || cardYear === yearValue;
        var matchesType = !typeValue || cardType.indexOf(typeValue) !== -1;

        var show = matchesKeyword && matchesYear && matchesType;
        card.style.display = show ? "" : "none";

        if (show) {
          visibleCount += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visibleCount === 0);
      }

      if (counter) {
        counter.textContent = visibleCount.toString();
      }
    }

    [search, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    apply();
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll(".player"));

    players.forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector(".player-start");
      var message = player.querySelector(".video-message");
      var src = player.getAttribute("data-video-src");

      if (!video || !src) {
        if (message) {
          message.textContent = "当前页面没有可用播放源。";
        }
        return;
      }

      function setMessage(text) {
        if (message) {
          message.textContent = text || "";
        }
      }

      function loadAndPlay() {
        if (!video.dataset.loaded) {
          if (window.Hls && window.Hls.isSupported() && src.indexOf(".m3u8") !== -1) {
            var hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });

            hls.loadSource(src);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.ERROR, function (event, data) {
              if (!data || !data.fatal) {
                return;
              }

              if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                setMessage("网络波动，正在重新加载播放源。");
                hls.startLoad();
              } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                setMessage("媒体解析异常，正在尝试恢复。");
                hls.recoverMediaError();
              } else {
                setMessage("播放源暂时无法打开，请稍后重试。");
                hls.destroy();
              }
            });
          } else {
            video.src = src;
          }

          video.dataset.loaded = "true";
          player.classList.add("is-loaded");
        }

        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            setMessage("浏览器阻止了自动播放，请再次点击播放按钮。");
            player.classList.remove("is-loaded");
          });
        }
      }

      if (button) {
        button.addEventListener("click", loadAndPlay);
      }

      video.addEventListener("click", function () {
        if (video.paused) {
          loadAndPlay();
        } else {
          video.pause();
        }
      });

      video.addEventListener("play", function () {
        player.classList.add("is-loaded");
      });

      video.addEventListener("pause", function () {
        if (video.currentTime === 0 || video.ended) {
          player.classList.remove("is-loaded");
        }
      });
    });
  }

  ready(function () {
    setupMobileMenu();
    setupHeroCarousel();
    setupFilters();
    setupPlayers();
  });
})();
