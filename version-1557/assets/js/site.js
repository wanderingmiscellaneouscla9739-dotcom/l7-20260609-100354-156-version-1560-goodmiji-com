(function () {
  'use strict';

  function closestFormQuery(form) {
    var input = form.querySelector('input[name="q"]');
    return input ? input.value.trim() : '';
  }

  function bindMobileMenu() {
    var button = document.querySelector('[data-mobile-menu-button]');
    var menu = document.querySelector('[data-mobile-menu]');

    if (!button || !menu) {
      return;
    }

    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
      button.setAttribute('aria-expanded', menu.classList.contains('is-open') ? 'true' : 'false');
    });
  }

  function bindSearchForms() {
    document.querySelectorAll('form[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var query = closestFormQuery(form);
        if (!query) {
          event.preventDefault();
        }
      });
    });
  }

  function bindHeroCarousel() {
    var root = document.querySelector('[data-hero-carousel]');

    if (!root) {
      return;
    }

    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));

    if (slides.length <= 1) {
      return;
    }

    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function bindPlayer() {
    var video = document.querySelector('video[data-hls-src]');

    if (!video) {
      return;
    }

    var source = video.getAttribute('data-hls-src');
    var overlay = document.querySelector('[data-play-overlay]');
    var status = document.querySelector('[data-player-status]');
    var hlsInstance = null;
    var isLoaded = false;

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function loadStream() {
      if (isLoaded || !source) {
        return;
      }

      isLoaded = true;
      setStatus('正在连接高清播放源...');

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('播放源已载入，可开始播放。');
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus('当前网络环境暂时无法加载播放源，请稍后重试。');
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        setStatus('播放源已载入，可开始播放。');
      } else {
        setStatus('当前浏览器不支持 m3u8 播放，请使用新版浏览器访问。');
      }
    }

    function startPlay() {
      loadStream();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          setStatus('已绑定播放源，请点击视频控件开始播放。');
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', startPlay);
    }

    video.addEventListener('click', function () {
      if (!isLoaded) {
        startPlay();
      }
    });

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  function getSearchQuery() {
    var params = new URLSearchParams(window.location.search);
    return (params.get('q') || '').trim();
  }

  function renderSearchPage() {
    var root = document.querySelector('[data-search-results]');
    var input = document.querySelector('[data-search-input]');
    var count = document.querySelector('[data-search-count]');

    if (!root || !window.MOVIE_SEARCH_DATA) {
      return;
    }

    var query = getSearchQuery();
    if (input) {
      input.value = query;
    }

    var normalized = query.toLowerCase();
    var results = window.MOVIE_SEARCH_DATA.filter(function (movie) {
      if (!normalized) {
        return true;
      }

      return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine]
        .join(' ')
        .toLowerCase()
        .indexOf(normalized) !== -1;
    }).slice(0, 240);

    if (count) {
      count.textContent = query
        ? '找到 ' + results.length + ' 条与“' + query + '”相关的影片'
        : '输入关键词可搜索全站影片，当前展示前 ' + results.length + ' 条';
    }

    root.innerHTML = results.map(function (movie) {
      return [
        '<a class="movie-card" href="movies/' + movie.file + '">',
        '  <div class="movie-poster">',
        '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '">',
        '    <span class="year-badge">' + escapeHtml(movie.year) + '</span>',
        '    <span class="play-badge">▶</span>',
        '  </div>',
        '  <div class="movie-body">',
        '    <div class="badge-row">',
        '      <span class="badge badge-blue">' + escapeHtml(movie.region) + '</span>',
        '      <span class="badge badge-green">' + escapeHtml(movie.type) + '</span>',
        '    </div>',
        '    <h2 class="movie-title">' + escapeHtml(movie.title) + '</h2>',
        '    <p class="movie-desc">' + escapeHtml(movie.oneLine) + '</p>',
        '    <div class="movie-meta"><span>' + escapeHtml(movie.genre) + '</span></div>',
        '  </div>',
        '</a>'
      ].join('
');
    }).join('
');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  document.addEventListener('DOMContentLoaded', function () {
    bindMobileMenu();
    bindSearchForms();
    bindHeroCarousel();
    bindPlayer();
    renderSearchPage();
  });
})();
