(function() {
  const menuButton = document.querySelector(".menu-toggle");
  const mobileNav = document.querySelector(".mobile-nav");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function() {
      mobileNav.classList.toggle("is-open");
    });
  }

  const hero = document.querySelector("[data-hero]");
  if (hero) {
    const slides = Array.from(hero.querySelectorAll(".hero-slide"));
    const dots = Array.from(hero.querySelectorAll(".hero-dot"));
    const next = hero.querySelector(".hero-control.next");
    const prev = hero.querySelector(".hero-control.prev");
    let current = 0;
    let timer = null;

    const show = function(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    };

    const play = function() {
      window.clearInterval(timer);
      timer = window.setInterval(function() {
        show(current + 1);
      }, 5200);
    };

    if (slides.length > 1) {
      next && next.addEventListener("click", function() {
        show(current + 1);
        play();
      });

      prev && prev.addEventListener("click", function() {
        show(current - 1);
        play();
      });

      dots.forEach(function(dot, i) {
        dot.addEventListener("click", function() {
          show(i);
          play();
        });
      });

      play();
    }
  }

  const filterInput = document.querySelector(".filter-input");
  const filterSelect = document.querySelector(".filter-select");
  const cards = Array.from(document.querySelectorAll("[data-filter-card]"));
  const emptyState = document.querySelector(".empty-state");

  const applyFilter = function() {
    if (!cards.length) {
      return;
    }

    const query = filterInput ? filterInput.value.trim().toLowerCase() : "";
    const year = filterSelect ? filterSelect.value : "";
    let visible = 0;

    cards.forEach(function(card) {
      const haystack = [
        card.dataset.title,
        card.dataset.region,
        card.dataset.genre,
        card.dataset.year,
        card.dataset.tags
      ].join(" ").toLowerCase();

      const matchQuery = !query || haystack.includes(query);
      const matchYear = !year || (card.dataset.year || "").includes(year);
      const show = matchQuery && matchYear;

      card.style.display = show ? "" : "none";
      if (show) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.style.display = visible ? "none" : "block";
    }
  };

  if (filterInput) {
    filterInput.addEventListener("input", applyFilter);
  }

  if (filterSelect) {
    filterSelect.addEventListener("change", applyFilter);
  }

  const searchRoot = document.querySelector("[data-search-results]");
  if (searchRoot && window.MOVIES) {
    const params = new URLSearchParams(window.location.search);
    const q = (params.get("q") || "").trim();
    const heading = document.querySelector("[data-search-heading]");
    const input = document.querySelector("[data-search-input]");

    if (input) {
      input.value = q;
    }

    const normalized = q.toLowerCase();
    const results = normalized
      ? window.MOVIES.filter(function(movie) {
          return [
            movie.title,
            movie.oneLine,
            movie.region,
            movie.type,
            movie.genre,
            movie.tags.join(" "),
            movie.year
          ].join(" ").toLowerCase().includes(normalized);
        })
      : window.MOVIES.slice(0, 60);

    if (heading) {
      heading.textContent = q ? "搜索结果" : "精选内容";
    }

    searchRoot.innerHTML = results.map(function(movie) {
      const tags = movie.tags.slice(0, 3).map(function(tag) {
        return "<span>" + escapeHtml(tag) + "</span>";
      }).join("");

      return [
        '<article class="movie-card">',
        '  <a class="poster-link" href="./' + movie.file + '">',
        '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '    <span class="region-badge">' + escapeHtml(movie.region) + '</span>',
        '    <span class="year-badge">' + escapeHtml(movie.year) + '</span>',
        '  </a>',
        '  <div class="movie-card-body">',
        '    <h3><a href="./' + movie.file + '">' + escapeHtml(movie.title) + '</a></h3>',
        '    <p>' + escapeHtml(movie.oneLine) + '</p>',
        '    <div class="meta-row"><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>',
        '    <div class="tag-row">' + tags + '</div>',
        '  </div>',
        '</article>'
      ].join("");
    }).join("");

    if (!results.length) {
      searchRoot.innerHTML = '<div class="empty-state" style="display:block">没有找到匹配内容</div>';
    }
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  window.initMoviePlayer = function(streamUrl) {
    const box = document.querySelector("[data-player]");
    if (!box) {
      return;
    }

    const video = box.querySelector("video");
    const cover = box.querySelector(".player-cover");
    const playButton = box.querySelector(".play-overlay-button");
    let loaded = false;
    let hls = null;

    const attach = function() {
      if (loaded || !video) {
        return;
      }

      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    };

    const start = function() {
      attach();
      box.classList.add("is-playing");
      const promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function() {});
      }
    };

    if (cover) {
      cover.addEventListener("click", start);
    }

    if (playButton) {
      playButton.addEventListener("click", start);
    }

    if (video) {
      video.addEventListener("play", function() {
        box.classList.add("is-playing");
      });

      video.addEventListener("click", function() {
        if (video.paused) {
          start();
        }
      });
    }

    window.addEventListener("pagehide", function() {
      if (hls && hls.destroy) {
        hls.destroy();
      }
    });
  };
})();
