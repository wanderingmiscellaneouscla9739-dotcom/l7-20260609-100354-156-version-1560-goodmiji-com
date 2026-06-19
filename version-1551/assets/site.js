(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
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
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5000);
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

    show(0);
    start();
  });

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  document.querySelectorAll('[data-local-filter]').forEach(function (input) {
    var target = document.querySelector(input.getAttribute('data-local-filter'));
    var cards = target ? Array.prototype.slice.call(target.querySelectorAll('[data-movie-card]')) : [];
    var empty = document.querySelector(input.getAttribute('data-empty-target'));

    input.addEventListener('input', function () {
      var keyword = normalize(input.value);
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-meta'));
        var matched = !keyword || text.indexOf(keyword) !== -1;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    });
  });

  document.querySelectorAll('[data-global-search]').forEach(function (input) {
    var box = document.querySelector(input.getAttribute('data-global-search'));
    var base = input.getAttribute('data-base-path') || '';
    var list = window.SEARCH_INDEX || [];

    function close() {
      if (box) {
        box.classList.remove('is-open');
        box.innerHTML = '';
      }
    }

    input.addEventListener('input', function () {
      var keyword = normalize(input.value);

      if (!box || keyword.length < 1) {
        close();
        return;
      }

      var hits = list.filter(function (item) {
        return normalize(item.title + ' ' + item.meta).indexOf(keyword) !== -1;
      }).slice(0, 8);

      if (!hits.length) {
        close();
        return;
      }

      box.innerHTML = hits.map(function (item) {
        return '<a href="' + base + item.url + '"><strong>' + item.title + '</strong><span>' + item.meta + '</span></a>';
      }).join('');
      box.classList.add('is-open');
    });

    document.addEventListener('click', function (event) {
      if (event.target !== input && box && !box.contains(event.target)) {
        close();
      }
    });
  });
})();

function initPlayer(options) {
  var shell = document.querySelector(options.shell);
  var video = document.querySelector(options.video);
  var button = document.querySelector(options.button);
  var hlsInstance = null;
  var loaded = false;

  if (!shell || !video || !button || !options.source) {
    return;
  }

  function loadSource() {
    if (loaded) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = options.source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new Hls({ enableWorker: true });
      hlsInstance.loadSource(options.source);
      hlsInstance.attachMedia(video);
    } else {
      video.src = options.source;
    }

    loaded = true;
  }

  function playVideo() {
    loadSource();
    shell.classList.add('is-playing');
    var request = video.play();

    if (request && request.catch) {
      request.catch(function () {
        shell.classList.remove('is-playing');
      });
    }
  }

  button.addEventListener('click', function (event) {
    event.preventDefault();
    event.stopPropagation();
    playVideo();
  });

  shell.addEventListener('click', function (event) {
    if (event.target === button || button.contains(event.target)) {
      return;
    }
    if (!loaded || video.paused) {
      playVideo();
    }
  });

  video.addEventListener('play', function () {
    shell.classList.add('is-playing');
  });

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
