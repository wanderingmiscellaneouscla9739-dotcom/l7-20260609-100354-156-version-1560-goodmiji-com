document.addEventListener("DOMContentLoaded", function () {
  var video = document.querySelector("[data-player]");
  var startButton = document.querySelector("[data-player-start]");

  if (!video || !startButton) {
    return;
  }

  var source = video.getAttribute("data-src");
  var hasStarted = false;

  function loadAndPlay() {
    if (!source) {
      startButton.textContent = "暂无可用播放源";
      return;
    }

    if (!hasStarted) {
      hasStarted = true;
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else {
        startButton.textContent = "当前浏览器不支持 m3u8 播放";
        hasStarted = false;
        return;
      }
    }

    startButton.classList.add("is-hidden");
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
        startButton.classList.remove("is-hidden");
      });
    }
  }

  startButton.addEventListener("click", loadAndPlay);
  video.addEventListener("play", function () {
    startButton.classList.add("is-hidden");
  });
  video.addEventListener("pause", function () {
    if (!video.ended) {
      startButton.classList.remove("is-hidden");
    }
  });
});
