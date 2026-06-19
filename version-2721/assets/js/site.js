(function () {
  'use strict';

  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMobileMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');

    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    var previous = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot') || 0));
        start();
      });
    });

    if (previous) {
      previous.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupCatalogFilter() {
    var panel = document.querySelector('[data-filter-panel]');
    var grid = document.querySelector('[data-catalog-grid]');

    if (!panel || !grid) {
      return;
    }

    var textInput = panel.querySelector('[data-filter-text]');
    var selects = selectAll('[data-filter-field]', panel);
    var reset = panel.querySelector('[data-filter-reset]');
    var count = panel.querySelector('[data-result-count]');
    var cards = selectAll('.movie-card', grid);

    function apply() {
      var keyword = normalize(textInput ? textInput.value : '');
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-category')
        ].join(' '));

        var matched = !keyword || haystack.indexOf(keyword) !== -1;

        selects.forEach(function (select) {
          var field = select.getAttribute('data-filter-field');
          var value = normalize(select.value);
          var cardValue = normalize(card.getAttribute('data-' + field));

          if (value && cardValue !== value) {
            matched = false;
          }
        });

        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = String(visible);
      }
    }

    if (textInput) {
      textInput.addEventListener('input', apply);
    }

    selects.forEach(function (select) {
      select.addEventListener('change', apply);
    });

    if (reset) {
      reset.addEventListener('click', function () {
        if (textInput) {
          textInput.value = '';
        }
        selects.forEach(function (select) {
          select.value = '';
        });
        apply();
      });
    }

    apply();
  }

  function setupPlayer() {
    var player = document.querySelector('[data-player]');

    if (!player) {
      return;
    }

    var video = player.querySelector('video[data-m3u8]');
    var button = player.querySelector('[data-player-start]');
    var hlsInstance = null;

    function initializeAndPlay() {
      if (!video) {
        return;
      }

      var source = video.getAttribute('data-m3u8');

      if (!source) {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        if (!hlsInstance) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        }
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        if (video.src !== source) {
          video.src = source;
        }
      } else {
        video.src = source;
      }

      player.classList.add('is-playing');
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          player.classList.remove('is-playing');
        });
      }
    }

    if (button) {
      button.addEventListener('click', initializeAndPlay);
    }

    video.addEventListener('play', function () {
      player.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      if (video.currentTime === 0 || video.ended) {
        player.classList.remove('is-playing');
      }
    });
  }

  function createSearchCard(movie) {
    var tags = (movie.tags || []).slice(0, 4).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '  <a class="movie-poster" href="' + escapeHtml(movie.url) + '" aria-label="观看' + escapeHtml(movie.title) + '">',
      '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="poster-type">' + escapeHtml(movie.type) + '</span>',
      '    <span class="poster-play">▶</span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <div class="movie-meta-line"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.year) + '</span></div>',
      '    <h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p>' + escapeHtml(movie.oneLine || '') + '</p>',
      '    <div class="tag-list">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function setupSearchPage() {
    var resultsRoot = document.querySelector('[data-search-results]');

    if (!resultsRoot || !window.MOVIE_SEARCH_DATA) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = normalize(params.get('q') || '');
    var input = document.querySelector('[data-search-input]');
    var summary = document.querySelector('[data-search-summary]');
    var empty = document.querySelector('[data-search-empty]');

    if (input) {
      input.value = query;
    }

    if (!query) {
      if (summary) {
        summary.textContent = '请输入关键词搜索站内影片。';
      }
      if (empty) {
        empty.hidden = false;
      }
      return;
    }

    var matched = window.MOVIE_SEARCH_DATA.filter(function (movie) {
      var haystack = normalize([
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.category,
        (movie.tags || []).join(' '),
        movie.oneLine
      ].join(' '));
      return haystack.indexOf(query) !== -1;
    }).slice(0, 200);

    if (summary) {
      summary.textContent = '关键词“' + query + '”找到 ' + matched.length + ' 部相关作品。';
    }

    if (matched.length) {
      resultsRoot.innerHTML = matched.map(createSearchCard).join('');
      if (empty) {
        empty.hidden = true;
      }
    } else if (empty) {
      empty.hidden = false;
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHero();
    setupCatalogFilter();
    setupPlayer();
    setupSearchPage();
  });
})();
