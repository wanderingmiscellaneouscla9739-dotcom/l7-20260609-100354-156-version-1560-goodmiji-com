(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll(".js-player"));

    players.forEach(function (root) {
      var video = root.querySelector(".movie-video");
      var overlay = root.querySelector(".player-overlay");
      var stage = root.querySelector(".video-stage");
      var hlsInstance = null;
      var initialized = false;

      if (!video) {
        return;
      }

      function hideOverlay() {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
      }

      function attachStream() {
        if (initialized) {
          return;
        }
        initialized = true;

        var stream = video.getAttribute("data-stream");

        if (!stream) {
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else {
          video.src = stream;
        }
      }

      function startPlayback(event) {
        if (event) {
          event.preventDefault();
        }
        attachStream();
        hideOverlay();
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {});
        }
      }

      if (overlay) {
        overlay.addEventListener("click", startPlayback);
      }

      if (stage) {
        stage.addEventListener("click", function (event) {
          if (event.target === video && initialized) {
            return;
          }
          startPlayback(event);
        });
      }

      video.addEventListener("play", hideOverlay);
      video.addEventListener("loadedmetadata", hideOverlay);

      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
    });
  });
})();
