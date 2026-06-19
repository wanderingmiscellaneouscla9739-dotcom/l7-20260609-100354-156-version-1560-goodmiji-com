import { H as Hls } from './hls-vendor-dru42stk.js';

function selectStream(video) {
  var item = video.querySelector('source');
  return item ? item.getAttribute('src') : '';
}

function attachStream(shell, video) {
  if (shell.dataset.ready === 'true') {
    return;
  }
  var stream = selectStream(video);
  if (!stream) {
    return;
  }
  if (Hls && Hls.isSupported()) {
    var hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });
    hls.loadSource(stream);
    hls.attachMedia(video);
    hls.on(Hls.Events.ERROR, function (_event, data) {
      if (!data || !data.fatal) {
        return;
      }
      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        hls.startLoad();
        return;
      }
      if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        hls.recoverMediaError();
      }
    });
    shell.hlsPlayer = hls;
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = stream;
  } else {
    video.src = stream;
  }
  shell.dataset.ready = 'true';
  shell.classList.add('is-ready');
}

function startPlayback(shell, video) {
  attachStream(shell, video);
  var playPromise = video.play();
  if (playPromise && typeof playPromise.catch === 'function') {
    playPromise.catch(function () {
      shell.classList.remove('is-ready');
    });
  }
}

document.querySelectorAll('[data-player]').forEach(function (shell) {
  var video = shell.querySelector('video');
  var button = shell.querySelector('.play-overlay');
  if (!video) {
    return;
  }
  if (button) {
    button.addEventListener('click', function () {
      startPlayback(shell, video);
    });
  }
  video.addEventListener('click', function () {
    if (video.paused) {
      startPlayback(shell, video);
    }
  });
  video.addEventListener('play', function () {
    shell.classList.add('is-playing');
  });
  video.addEventListener('pause', function () {
    shell.classList.remove('is-playing');
  });
  video.addEventListener('canplay', function () {
    shell.classList.add('is-ready');
  });
});
