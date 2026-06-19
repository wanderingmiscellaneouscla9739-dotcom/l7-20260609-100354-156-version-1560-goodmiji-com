(function () {
  window.initializePlayer = function (url) {
    var video = document.getElementById("videoPlayer");
    var overlay = document.getElementById("playOverlay");
    var attached = false;
    var hlsInstance = null;

    if (!video) {
      return;
    }

    function attachMedia() {
      if (attached) {
        return;
      }
      attached = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true
        });
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
      } else {
        video.src = url;
      }
    }

    function playVideo() {
      attachMedia();
      if (overlay) {
        overlay.classList.add("hidden");
      }
      var request = video.play();
      if (request && request.catch) {
        request.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener("click", playVideo);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      }
    });

    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("hidden");
      }
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
