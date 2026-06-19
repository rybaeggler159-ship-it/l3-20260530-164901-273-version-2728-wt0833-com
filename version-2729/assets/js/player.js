(function () {
  window.initMoviePlayer = function (sourceUrl) {
    var video = document.getElementById('movie-video');
    var cover = document.querySelector('[data-player-cover]');
    var startButton = document.querySelector('[data-player-start]');
    if (!video || !sourceUrl) {
      return;
    }

    var hls;

    function attachSource() {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        return;
      }
      video.src = sourceUrl;
    }

    function hideCover() {
      if (cover) {
        cover.classList.add('hidden');
      }
    }

    function showCover() {
      if (cover) {
        cover.classList.remove('hidden');
      }
    }

    function startPlayback() {
      hideCover();
      video.controls = true;
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          showCover();
        });
      }
    }

    attachSource();

    if (startButton) {
      startButton.addEventListener('click', function (event) {
        event.preventDefault();
        startPlayback();
      });
    }

    if (cover) {
      cover.addEventListener('click', function (event) {
        event.preventDefault();
        startPlayback();
      });
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });

    video.addEventListener('play', hideCover);

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
