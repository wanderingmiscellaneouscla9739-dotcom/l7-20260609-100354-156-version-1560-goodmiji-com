(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function normalize(text) {
    return String(text || "").toLowerCase().trim();
  }

  ready(function () {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".main-nav");

    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        var open = nav.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var index = 0;

      function activate(next) {
        index = next;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === index);
        });
      }

      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          activate(i);
        });
      });

      if (slides.length > 1) {
        window.setInterval(function () {
          activate((index + 1) % slides.length);
        }, 5200);
      }
    }

    var searchInput = document.querySelector("[data-card-search]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));

    if (searchInput && cards.length) {
      searchInput.addEventListener("input", function () {
        var query = normalize(searchInput.value);
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year"),
            card.getAttribute("data-tags")
          ].join(" "));
          card.classList.toggle("is-filtered-out", query && haystack.indexOf(query) === -1);
        });
      });
    }

    var filterGroup = document.querySelector("[data-filter-group]");

    if (filterGroup && cards.length) {
      var buttons = Array.prototype.slice.call(filterGroup.querySelectorAll("[data-filter-button]"));
      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          var value = button.getAttribute("data-filter-button");
          buttons.forEach(function (item) {
            item.classList.toggle("is-active", item === button);
          });
          cards.forEach(function (card) {
            var year = String(card.getAttribute("data-year") || "");
            card.classList.toggle("is-filtered-out", value !== "all" && year !== value);
          });
        });
      });
    }

    var regionFilter = document.querySelector("[data-region-filter]");

    if (regionFilter && cards.length) {
      var regionButtons = Array.prototype.slice.call(regionFilter.querySelectorAll("[data-region-button]"));
      regionButtons.forEach(function (button) {
        button.addEventListener("click", function () {
          var value = button.getAttribute("data-region-button");
          regionButtons.forEach(function (item) {
            item.classList.toggle("is-active", item === button);
          });
          cards.forEach(function (card) {
            var region = String(card.getAttribute("data-region") || "");
            card.classList.toggle("is-filtered-out", value !== "all" && region.indexOf(value) === -1);
          });
        });
      });
    }

    var results = document.getElementById("search-results");
    var title = document.getElementById("search-title");
    var pageInput = document.getElementById("site-search-input");

    if (results && window.SITE_CATALOG) {
      var params = new URLSearchParams(window.location.search);
      var queryText = params.get("q") || "";

      if (pageInput) {
        pageInput.value = queryText;
      }

      function createCard(item) {
        var tags = item.tags.slice(0, 3).map(function (tag) {
          return "<span>" + tag + "</span>";
        }).join("");
        return "<a class=\"movie-card\" href=\"" + item.url + "\">" +
          "<span class=\"poster-shell\">" +
          "<img src=\"" + item.cover + "\" alt=\"" + item.title + "\" loading=\"lazy\">" +
          "<span class=\"poster-shade\"></span>" +
          "<span class=\"score-badge\">" + item.score + "</span>" +
          "</span>" +
          "<span class=\"movie-body\">" +
          "<strong>" + item.title + "</strong>" +
          "<em>" + item.oneLine + "</em>" +
          "<span class=\"movie-meta\">" + item.year + " · " + item.region + " · " + item.type + "</span>" +
          "<span class=\"mini-tags\">" + tags + "</span>" +
          "</span>" +
          "</a>";
      }

      function render() {
        var query = normalize(pageInput ? pageInput.value : queryText);
        var list = window.SITE_CATALOG.filter(function (item) {
          if (!query) {
            return true;
          }
          return normalize([
            item.title,
            item.region,
            item.type,
            item.year,
            item.genre,
            item.tags.join(" "),
            item.oneLine
          ].join(" ")).indexOf(query) !== -1;
        }).slice(0, 240);

        if (title) {
          title.textContent = query ? "搜索结果：" + query : "热门影片";
        }

        results.innerHTML = list.length ? list.map(createCard).join("") : "<p class=\"empty-text\">没有找到相关影片</p>";
      }

      if (pageInput) {
        pageInput.addEventListener("input", render);
      }

      render();
    }
  });
})();
