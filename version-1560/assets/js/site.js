(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
      return;
    }
    callback();
  }

  ready(function () {
    var toggle = document.querySelector('.nav-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (toggle && panel) {
      toggle.addEventListener('click', function () {
        var isOpen = toggle.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', String(isOpen));
        panel.hidden = !isOpen;
      });
    }

    document.querySelectorAll('[data-hero-carousel]').forEach(function (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
      var prev = carousel.querySelector('[data-hero-prev]');
      var next = carousel.querySelector('[data-hero-next]');
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, position) {
          slide.classList.toggle('is-active', position === index);
        });
        dots.forEach(function (dot, position) {
          dot.classList.toggle('is-active', position === index);
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

      dots.forEach(function (dot, position) {
        dot.addEventListener('click', function () {
          show(position);
          start();
        });
      });

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

      carousel.addEventListener('mouseenter', stop);
      carousel.addEventListener('mouseleave', start);
      show(0);
      start();
    });

    document.querySelectorAll('[data-filter-scope]').forEach(function (panel) {
      var scopeId = panel.getAttribute('data-filter-scope');
      var target = document.getElementById(scopeId);
      if (!target) {
        return;
      }
      var input = panel.querySelector('[data-search-input]');
      var chips = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-value]'));
      var emptyState = target.parentElement.querySelector('.empty-state');
      var activeValue = '全部';

      function textFor(card) {
        return [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
      }

      function applyFilter() {
        var query = input ? input.value.trim().toLowerCase() : '';
        var visible = 0;
        Array.prototype.slice.call(target.querySelectorAll('[data-title]')).forEach(function (card) {
          var haystack = textFor(card);
          var matchQuery = !query || haystack.indexOf(query) !== -1;
          var matchChip = activeValue === '全部' || haystack.indexOf(activeValue.toLowerCase()) !== -1;
          var shouldShow = matchQuery && matchChip;
          card.hidden = !shouldShow;
          if (shouldShow) {
            visible += 1;
          }
        });
        if (emptyState) {
          emptyState.hidden = visible !== 0;
        }
      }

      if (input) {
        input.addEventListener('input', applyFilter);
      }

      chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
          activeValue = chip.getAttribute('data-filter-value') || '全部';
          chips.forEach(function (item) {
            item.classList.toggle('is-active', item === chip);
          });
          applyFilter();
        });
      });
    });
  });
})();
