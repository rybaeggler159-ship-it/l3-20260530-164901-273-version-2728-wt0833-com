(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function setStatus(shell, text, hidden) {
    var status = shell.querySelector("[data-player-status]");
    if (!status) {
      return;
    }
    status.textContent = text || "";
    status.classList.toggle("is-hidden", !!hidden);
  }

  function initPlayer(video) {
    var shell = video.closest(".player-shell");
    var url = video.getAttribute("data-url");
    var playButtons = shell.querySelectorAll("[data-play-button]");
    var muteButton = shell.querySelector("[data-mute-button]");
    var fullButton = shell.querySelector("[data-full-button]");
    if (!shell || !url) {
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        setStatus(shell, "", true);
      });
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          setStatus(shell, "视频加载失败", false);
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      video.addEventListener("loadedmetadata", function () {
        setStatus(shell, "", true);
      }, { once: true });
    } else {
      video.src = url;
      setStatus(shell, "暂时无法播放", false);
    }
    function togglePlay() {
      if (video.paused) {
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {
            setStatus(shell, "播放失败", false);
          });
        }
      } else {
        video.pause();
      }
    }
    function refresh() {
      Array.prototype.forEach.call(playButtons, function (button) {
        button.classList.toggle("is-playing", !video.paused);
        button.textContent = video.paused ? "▶" : "Ⅱ";
      });
    }
    Array.prototype.forEach.call(playButtons, function (button) {
      button.addEventListener("click", togglePlay);
    });
    video.addEventListener("click", togglePlay);
    video.addEventListener("play", refresh);
    video.addEventListener("pause", refresh);
    if (muteButton) {
      muteButton.addEventListener("click", function () {
        video.muted = !video.muted;
        muteButton.textContent = video.muted ? "静" : "声";
      });
    }
    if (fullButton) {
      fullButton.addEventListener("click", function () {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (shell.requestFullscreen) {
          shell.requestFullscreen();
        }
      });
    }
    refresh();
  }

  ready(function () {
    Array.prototype.forEach.call(document.querySelectorAll(".js-hls-player"), initPlayer);
  });
})();
