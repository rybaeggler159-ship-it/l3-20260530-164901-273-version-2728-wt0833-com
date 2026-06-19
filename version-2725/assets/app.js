(function () {
    var mobileButton = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (mobileButton && mobilePanel) {
        mobileButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero-slider]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function showSlide(index) {
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

        function startTimer() {
            stopTimer();
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        function stopTimer() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                startTimer();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                startTimer();
            });
        });

        hero.addEventListener('mouseenter', stopTimer);
        hero.addEventListener('mouseleave', startTimer);
        showSlide(0);
        startTimer();
    }

    var searchForms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]'));

    searchForms.forEach(function (form) {
        var input = form.querySelector('[data-filter-input]');
        var scope = document.querySelector(form.getAttribute('data-filter-scope')) || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
        var empty = document.querySelector(form.getAttribute('data-empty-target'));

        function applyFilter() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = (card.getAttribute('data-search') || '').toLowerCase();
                var match = !keyword || haystack.indexOf(keyword) !== -1;
                card.style.display = match ? '' : 'none';

                if (match) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            applyFilter();
        });

        if (input) {
            input.addEventListener('input', applyFilter);
            var params = new URLSearchParams(window.location.search);
            var q = params.get('q');

            if (q) {
                input.value = q;
                applyFilter();
            }
        }
    });

    var filterGroups = Array.prototype.slice.call(document.querySelectorAll('[data-filter-group]'));

    filterGroups.forEach(function (group) {
        var scope = document.querySelector(group.getAttribute('data-filter-scope')) || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
        var buttons = Array.prototype.slice.call(group.querySelectorAll('[data-filter-value]'));

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                var value = button.getAttribute('data-filter-value');

                buttons.forEach(function (item) {
                    item.classList.toggle('is-active', item === button);
                });

                cards.forEach(function (card) {
                    var category = card.getAttribute('data-category') || '';
                    card.style.display = value === 'all' || category === value ? '' : 'none';
                });
            });
        });
    });
}());

function initVideoPlayer(videoId, overlayId, sourceUrl) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var instance = null;
    var ready = false;

    if (!video || !overlay || !sourceUrl) {
        return;
    }

    function attachSource() {
        if (ready) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = sourceUrl;
            ready = true;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            instance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            instance.loadSource(sourceUrl);
            instance.attachMedia(video);
            ready = true;
            return;
        }

        video.src = sourceUrl;
        ready = true;
    }

    function play() {
        attachSource();
        overlay.classList.add('is-hidden');
        video.setAttribute('controls', 'controls');
        var action = video.play();

        if (action && typeof action.catch === 'function') {
            action.catch(function () {});
        }
    }

    overlay.addEventListener('click', play);

    video.addEventListener('click', function () {
        if (!ready) {
            play();
        }
    });

    window.addEventListener('beforeunload', function () {
        if (instance) {
            instance.destroy();
        }
    });
}
