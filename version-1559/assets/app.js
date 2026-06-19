(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  ready(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');
    if (menuButton && mobilePanel) {
      menuButton.addEventListener('click', function () {
        mobilePanel.classList.toggle('open');
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var controls = Array.prototype.slice.call(document.querySelectorAll('[data-hero-control]'));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      controls.forEach(function (control, controlIndex) {
        control.classList.toggle('active', controlIndex === current);
      });
    }

    controls.forEach(function (control) {
      control.addEventListener('click', function () {
        var index = Number(control.getAttribute('data-hero-control')) || 0;
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 6500);
    }

    var searchInput = document.querySelector('.movie-search-input');
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('.filter-button'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var emptyState = document.querySelector('[data-empty-state]');
    var activeFilter = 'all';

    function applyFilter() {
      var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var visible = 0;
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var type = card.getAttribute('data-type') || '';
        var region = card.getAttribute('data-region') || '';
        var genre = card.getAttribute('data-genre') || '';
        var tags = card.getAttribute('data-tags') || '';
        var filterText = [type, region, genre, tags].join(' ');
        var matchedQuery = !query || text.indexOf(query) !== -1;
        var matchedFilter = activeFilter === 'all' || filterText.indexOf(activeFilter) !== -1;
        var matched = matchedQuery && matchedFilter;
        card.classList.toggle('is-hidden', !matched);
        if (matched) {
          visible += 1;
        }
      });
      if (emptyState) {
        emptyState.classList.toggle('show', visible === 0);
      }
    }

    if (searchInput) {
      searchInput.addEventListener('input', applyFilter);
    }

    filterButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeFilter = button.getAttribute('data-filter') || 'all';
        filterButtons.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        applyFilter();
      });
    });
  });
})();
