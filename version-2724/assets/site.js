
(function () {
  const menuBtn = document.querySelector('[data-menu-btn]');
  const mobileNav = document.querySelector('[data-mobile-nav]');
  if (menuBtn && mobileNav) {
    menuBtn.addEventListener('click', () => mobileNav.classList.toggle('show'));
  }

  const heroTrack = document.querySelector('[data-hero-track]');
  if (heroTrack) {
    const slides = Array.from(heroTrack.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
    let index = 0;
    const setActive = (next) => {
      index = (next + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
      dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
    };
    dots.forEach((dot, i) => dot.addEventListener('click', () => setActive(i)));
    setInterval(() => setActive(index + 1), 5000);
  }

  const forms = document.querySelectorAll('[data-search-form]');
  forms.forEach((form) => {
    const input = form.querySelector('[data-search-input]');
    const grid = document.querySelector('[data-filter-grid]');
    if (!input || !grid) return;
    const cards = Array.from(grid.querySelectorAll('.movie-card'));
    const apply = () => {
      const q = input.value.trim().toLowerCase();
      let visible = 0;
      cards.forEach((card) => {
        const text = card.textContent.toLowerCase();
        const show = !q || text.includes(q);
        card.style.display = show ? '' : 'none';
        if (show) visible += 1;
      });
      let empty = grid.querySelector('.search-empty');
      if (!visible) {
        if (!empty) {
          empty = document.createElement('div');
          empty.className = 'search-empty';
          empty.textContent = '没有找到匹配的影片，请尝试其他关键词。';
          grid.parentElement.appendChild(empty);
        }
      } else if (empty) {
        empty.remove();
      }
    };
    form.addEventListener('submit', (e) => { e.preventDefault(); apply(); });
    input.addEventListener('input', apply);
  });

  const video = document.querySelector('[data-player]');
  if (video) {
    const src = video.dataset.src || '';
    const tryNative = () => {
      if (src) video.src = src;
    };
    if (src && src.includes('.m3u8')) {
      if (window.Hls && Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, function (evt, data) {
          if (data && data.fatal) {
            tryNative();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        tryNative();
      } else {
        tryNative();
      }
    } else if (src) {
      tryNative();
    }
  }
})();
