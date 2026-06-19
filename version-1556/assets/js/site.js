(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  ready(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobilePanel = document.querySelector(".mobile-panel");

    if (menuButton && mobilePanel) {
      menuButton.addEventListener("click", function () {
        mobilePanel.classList.toggle("open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    var filterInputs = Array.prototype.slice.call(document.querySelectorAll(".page-filter"));
    filterInputs.forEach(function (input) {
      input.addEventListener("input", function () {
        var keyword = normalize(input.value);
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-year"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-region")
          ].join(" "));
          card.style.display = haystack.indexOf(keyword) > -1 ? "" : "none";
        });
      });
    });

    var searchRoot = document.getElementById("searchResults");
    var searchInput = document.getElementById("searchInput");
    if (searchRoot && window.SEARCH_DATA) {
      var params = new URLSearchParams(window.location.search);
      var initial = params.get("q") || "";
      if (searchInput) {
        searchInput.value = initial;
      }
      renderSearch(initial);
    }

    function renderSearch(query) {
      var keyword = normalize(query);
      var results = window.SEARCH_DATA.filter(function (item) {
        if (!keyword) {
          return item.featured;
        }
        return normalize(item.title + " " + item.year + " " + item.genre + " " + item.tags + " " + item.region).indexOf(keyword) > -1;
      }).slice(0, 120);

      if (!results.length) {
        searchRoot.innerHTML = '<div class="empty-state">没有找到匹配的影片，请换一个关键词试试。</div>';
        return;
      }

      searchRoot.innerHTML = '<div class="movie-grid">' + results.map(function (item) {
        return '<article class="movie-card">' +
          '<a class="poster-link" href="' + item.file + '">' +
          '<img src="./' + item.cover + '.jpg" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
          '<span class="poster-shine"></span>' +
          '</a>' +
          '<div class="movie-card-body">' +
          '<div class="meta-row"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span><span>' + escapeHtml(item.year) + '</span></div>' +
          '<h2><a href="' + item.file + '">' + escapeHtml(item.title) + '</a></h2>' +
          '<p>' + escapeHtml(item.oneLine) + '</p>' +
          '<div class="tag-row"><span>' + escapeHtml(item.genre) + '</span></div>' +
          '</div>' +
          '</article>';
      }).join("") + '</div>';
    }

    function escapeHtml(value) {
      return (value || "").toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }
  });
})();
