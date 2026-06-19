document.addEventListener("DOMContentLoaded", function () {
  setupMobileNavigation();
  setupHeroCarousel();
  setupSearchBoxes();
  setupFilterPanels();
});

function setupMobileNavigation() {
  var button = document.querySelector("[data-mobile-menu-button]");
  var nav = document.querySelector("[data-site-nav]");
  if (!button || !nav) {
    return;
  }

  button.addEventListener("click", function () {
    nav.classList.toggle("is-open");
  });
}

function setupHeroCarousel() {
  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
  if (!slides.length) {
    return;
  }

  var activeIndex = 0;
  var timer = null;

  function showSlide(index) {
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === activeIndex);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === activeIndex);
    });
  }

  function startTimer() {
    stopTimer();
    timer = window.setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5200);
  }

  function stopTimer() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      var targetIndex = Number(dot.getAttribute("data-hero-dot"));
      showSlide(targetIndex);
      startTimer();
    });
  });

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    hero.addEventListener("mouseenter", stopTimer);
    hero.addEventListener("mouseleave", startTimer);
  }

  startTimer();
}

function setupSearchBoxes() {
  var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-site-search]"));
  if (!inputs.length || !window.MOVIE_SEARCH_DATA) {
    return;
  }

  inputs.forEach(function (input) {
    var scope = input.closest("section") || document;
    var results = scope.querySelector("[data-search-results]");
    if (!results) {
      return;
    }

    input.addEventListener("input", function () {
      var query = input.value.trim().toLowerCase();
      if (!query) {
        results.classList.remove("is-open");
        results.innerHTML = "";
        return;
      }

      var matches = window.MOVIE_SEARCH_DATA.filter(function (movie) {
        var haystack = [
          movie.title,
          movie.year,
          movie.region,
          movie.type,
          movie.genre,
          (movie.tags || []).join(" "),
          movie.oneLine
        ].join(" ").toLowerCase();
        return haystack.indexOf(query) !== -1;
      }).sort(function (a, b) {
        return b.weight - a.weight;
      }).slice(0, 24);

      if (!matches.length) {
        results.classList.add("is-open");
        results.innerHTML = '<div class="search-result-item"><strong>没有找到匹配影片</strong><small>请更换关键词继续搜索</small><span></span></div>';
        return;
      }

      results.classList.add("is-open");
      results.innerHTML = matches.map(function (movie) {
        var poster = '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="this.onerror=null; this.replaceWith(document.createElement(\'span\'));">';
        return '<a class="search-result-item" href="' + movie.url + '">' +
          poster +
          '<span><strong>' + escapeHtml(movie.title) + '</strong><small>' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + ' · ' + movie.year + '</small></span>' +
          '<span>进入</span>' +
          '</a>';
      }).join("");
    });
  });
}

function setupFilterPanels() {
  var lists = Array.prototype.slice.call(document.querySelectorAll("[data-filter-list]"));
  lists.forEach(function (list) {
    var container = list.closest(".container") || document;
    var searchInput = container.querySelector("[data-filter-search]");
    var yearSelect = container.querySelector("[data-filter-year]");
    var typeSelect = container.querySelector("[data-filter-type]");
    var empty = container.querySelector("[data-filter-empty]");
    var cards = Array.prototype.slice.call(list.querySelectorAll("[data-filter-card]"));

    function applyFilter() {
      var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
      var year = yearSelect ? yearSelect.value : "";
      var type = typeSelect ? typeSelect.value : "";
      var visibleCount = 0;

      cards.forEach(function (card) {
        var text = [
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-type"),
          card.getAttribute("data-region"),
          card.textContent
        ].join(" ").toLowerCase();
        var isMatch = true;
        if (query && text.indexOf(query) === -1) {
          isMatch = false;
        }
        if (year && card.getAttribute("data-year") !== year) {
          isMatch = false;
        }
        if (type && card.getAttribute("data-type") !== type) {
          isMatch = false;
        }
        card.hidden = !isMatch;
        if (isMatch) {
          visibleCount += 1;
        }
      });

      if (empty) {
        empty.hidden = visibleCount > 0;
      }
    }

    [searchInput, yearSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilter);
        control.addEventListener("change", applyFilter);
      }
    });
  });
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
