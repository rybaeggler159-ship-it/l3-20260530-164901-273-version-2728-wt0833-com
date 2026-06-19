(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;
    var show = function (next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var filterYear = document.querySelector('[data-filter-year]');
  var filterList = document.querySelector('[data-filter-list]');
  if (filterList && (filterInput || filterYear)) {
    var cards = Array.prototype.slice.call(filterList.querySelectorAll('.movie-card'));
    var applyFilter = function () {
      var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
      var year = filterYear ? filterYear.value : '';
      cards.forEach(function (card) {
        var haystack = [card.dataset.title, card.dataset.genre, card.dataset.region, card.dataset.year].join(' ').toLowerCase();
        var hitText = !keyword || haystack.indexOf(keyword) !== -1;
        var hitYear = !year || card.dataset.year === year;
        card.classList.toggle('hidden-by-filter', !(hitText && hitYear));
      });
    };
    if (filterInput) {
      filterInput.addEventListener('input', applyFilter);
    }
    if (filterYear) {
      filterYear.addEventListener('change', applyFilter);
    }
  }
})();

function initPlayer(source) {
  var video = document.getElementById('movieVideo');
  var overlay = document.getElementById('playOverlay');
  if (!video || !overlay || !source) {
    return;
  }
  var ready = false;
  var hls = null;
  var bind = function () {
    if (ready) {
      return;
    }
    ready = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }
  };
  var start = function () {
    bind();
    overlay.classList.add('is-hidden');
    var action = video.play();
    if (action && action.catch) {
      action.catch(function () {});
    }
  };
  overlay.addEventListener('click', start);
  video.addEventListener('click', function () {
    if (video.paused) {
      start();
    }
  });
  video.addEventListener('play', function () {
    overlay.classList.add('is-hidden');
  });
  video.addEventListener('ended', function () {
    overlay.classList.remove('is-hidden');
  });
}
