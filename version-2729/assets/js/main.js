(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function setupMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupSiteSearch() {
    document.querySelectorAll('[data-site-search]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        var query = input ? input.value.trim() : '';
        var target = form.getAttribute('data-search-url') || 'search.html';
        if (query) {
          window.location.href = target + '?q=' + encodeURIComponent(query);
        } else {
          window.location.href = target;
        }
      });
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var minis = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-mini]'));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer;

    function setSlide(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
      minis.forEach(function (mini, i) {
        mini.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        setSlide(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        setSlide(i);
        start();
      });
    });

    minis.forEach(function (mini, i) {
      mini.addEventListener('mouseenter', function () {
        setSlide(i);
        start();
      });
    });

    setSlide(0);
    start();
  }

  function setupCatalogFilters() {
    var catalog = document.querySelector('[data-catalog]');
    if (!catalog) {
      return;
    }
    var search = catalog.querySelector('[data-catalog-search]');
    var typeFilter = catalog.querySelector('[data-filter-type]');
    var yearFilter = catalog.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(catalog.querySelectorAll('.movie-card'));
    var empty = catalog.querySelector('[data-filter-empty]');

    function valueOf(el) {
      return el ? el.value.trim().toLowerCase() : '';
    }

    function apply() {
      var keyword = valueOf(search);
      var typeValue = valueOf(typeFilter);
      var yearValue = valueOf(yearFilter);
      var visible = 0;

      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchType = !typeValue || String(card.getAttribute('data-type') || '').toLowerCase() === typeValue;
        var matchYear = !yearValue || String(card.getAttribute('data-year') || '').toLowerCase() === yearValue;
        var show = matchKeyword && matchType && matchYear;
        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    }

    [search, typeFilter, yearFilter].forEach(function (el) {
      if (el) {
        el.addEventListener('input', apply);
        el.addEventListener('change', apply);
      }
    });
  }

  function setupSearchPage() {
    var root = document.querySelector('[data-search-results]');
    if (!root || !window.SEARCH_MOVIES) {
      return;
    }
    var form = document.querySelector('[data-search-page-form]');
    var input = document.querySelector('[data-search-page-input]');
    var status = document.querySelector('[data-search-status]');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (input) {
      input.value = initial;
    }

    function card(movie) {
      return [
        '<article class="movie-card card-grid">',
        '<a class="poster-link" href="' + escapeHtml(movie.url) + '">',
        '<img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '<span class="duration-badge">' + escapeHtml(movie.duration) + '</span>',
        '<span class="play-float">▶</span>',
        '</a>',
        '<div class="card-body">',
        '<div class="card-category">' + escapeHtml(movie.genre) + '</div>',
        '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
        '<p>' + escapeHtml(movie.description) + '</p>',
        '<div class="card-foot"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>评分 ' + escapeHtml(movie.score) + '</span></div>',
        '</div>',
        '</article>'
      ].join('');
    }

    function run(query) {
      var q = String(query || '').trim().toLowerCase();
      var results = window.SEARCH_MOVIES.filter(function (movie) {
        if (!q) {
          return true;
        }
        return [movie.title, movie.description, movie.genre, movie.region, movie.type, movie.year, movie.tags].join(' ').toLowerCase().indexOf(q) !== -1;
      }).slice(0, 120);
      root.innerHTML = results.map(card).join('');
      if (status) {
        status.textContent = q ? '搜索：' + query + '，为你展示相关影片。' : '输入关键词，快速查找影片。';
      }
    }

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        run(input ? input.value : '');
      });
    }
    run(initial);
  }

  ready(function () {
    setupMenu();
    setupSiteSearch();
    setupHero();
    setupCatalogFilters();
    setupSearchPage();
  });
})();
