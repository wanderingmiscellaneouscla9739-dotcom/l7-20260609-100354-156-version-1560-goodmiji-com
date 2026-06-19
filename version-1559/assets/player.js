(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  ready(function () {
    var shells = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    shells.forEach(function (shell) {
      var video = shell.querySelector('video');
      var layer = shell.querySelector('[data-play-layer]');
      var buttons = Array.prototype.slice.call(shell.querySelectorAll('[data-play-button]'));
      var stream = shell.getAttribute('data-stream');
      var hlsInstance = null;
      var loaded = false;

      if (!video || !stream) {
        return;
      }

      function bindStream() {
        if (loaded) {
          return;
        }
        loaded = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else {
          video.src = stream;
        }
      }

      function playVideo() {
        bindStream();
        video.controls = true;
        if (layer) {
          layer.classList.add('is-hidden');
        }
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            if (layer) {
              layer.classList.remove('is-hidden');
            }
          });
        }
      }

      buttons.forEach(function (button) {
        button.addEventListener('click', function (event) {
          event.preventDefault();
          event.stopPropagation();
          playVideo();
        });
      });

      if (layer) {
        layer.addEventListener('click', function () {
          playVideo();
        });
      }

      video.addEventListener('click', function () {
        if (!loaded || video.paused) {
          playVideo();
        }
      });

      window.addEventListener('pagehide', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  });
})();
