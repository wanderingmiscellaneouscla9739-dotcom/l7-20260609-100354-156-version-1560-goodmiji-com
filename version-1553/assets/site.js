(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initMobileMenu() {
    var button = document.querySelector('[data-mobile-menu-button]');
    var menu = document.querySelector('[data-mobile-menu]');

    if (!button || !menu) {
      return;
    }

    button.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  function initHeroSlider() {
    var hero = document.querySelector('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-search-scope]'));

    panels.forEach(function (panel) {
      var queryInput = panel.querySelector('[data-filter-search]');
      var yearSelect = panel.querySelector('[data-filter-year]');
      var regionSelect = panel.querySelector('[data-filter-region]');
      var typeSelect = panel.querySelector('[data-filter-type]');
      var countOutput = panel.querySelector('[data-filter-count]');
      var container = panel.parentElement.querySelector('[data-filter-results]');
      var emptyState = panel.parentElement.querySelector('[data-empty-state]');
      var cards = container ? Array.prototype.slice.call(container.querySelectorAll('[data-movie-card]')) : [];
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get('q');

      if (initialQuery && queryInput) {
        queryInput.value = initialQuery;
      }

      function cardMatches(card) {
        var query = normalize(queryInput && queryInput.value);
        var year = normalize(yearSelect && yearSelect.value);
        var region = normalize(regionSelect && regionSelect.value);
        var type = normalize(typeSelect && typeSelect.value);
        var haystack = normalize([
          card.dataset.title,
          card.dataset.year,
          card.dataset.region,
          card.dataset.type,
          card.dataset.genre,
          card.dataset.tags
        ].join(' '));

        if (query && haystack.indexOf(query) === -1) {
          return false;
        }

        if (year && normalize(card.dataset.year) !== year) {
          return false;
        }

        if (region && normalize(card.dataset.region) !== region) {
          return false;
        }

        if (type && normalize(card.dataset.type) !== type) {
          return false;
        }

        return true;
      }

      function applyFilters() {
        var visible = 0;

        cards.forEach(function (card) {
          var matches = cardMatches(card);
          card.hidden = !matches;

          if (matches) {
            visible += 1;
          }
        });

        if (countOutput) {
          countOutput.textContent = visible + ' 部影片';
        }

        if (emptyState) {
          emptyState.hidden = visible !== 0;
        }
      }

      [queryInput, yearSelect, regionSelect, typeSelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', applyFilters);
          control.addEventListener('change', applyFilters);
        }
      });

      applyFilters();
    });
  }

  function attachHls(video, source) {
    if (!source) {
      return Promise.reject(new Error('Missing media source'));
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return Promise.resolve();
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      video._hlsInstance = hls;
      return Promise.resolve();
    }

    return Promise.reject(new Error('HLS is not supported'));
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    players.forEach(function (player) {
      var video = player.querySelector('video[data-src]');
      var button = player.querySelector('[data-play-button]');
      var prepared = false;

      if (!video || !button) {
        return;
      }

      function play() {
        function startPlayback() {
          var promise = video.play();

          if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {
              button.classList.remove('is-hidden');
            });
          }
        }

        button.classList.add('is-hidden');

        if (!prepared) {
          prepared = true;
          attachHls(video, video.dataset.src).then(startPlayback).catch(function () {
            button.classList.remove('is-hidden');
            button.querySelector('span:last-child').textContent = '当前浏览器无法播放';
          });
        } else {
          startPlayback();
        }
      }

      button.addEventListener('click', play);
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener('pause', function () {
        if (!video.ended) {
          button.classList.remove('is-hidden');
        }
      });
      video.addEventListener('playing', function () {
        button.classList.add('is-hidden');
      });
    });
  }

  ready(function () {
    initMobileMenu();
    initHeroSlider();
    initFilters();
    initPlayers();
  });
}());
