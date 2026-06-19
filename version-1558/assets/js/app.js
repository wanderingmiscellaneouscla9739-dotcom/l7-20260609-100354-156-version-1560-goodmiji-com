
(function () {
  "use strict";

  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMobileMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }
    var slides = all("[data-hero-slide]", carousel);
    var dots = all("[data-hero-dot]", carousel);
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 6200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var nextIndex = Number(dot.getAttribute("data-hero-dot"));
        show(nextIndex);
        start();
      });
    });

    carousel.addEventListener("mouseenter", function () {
      window.clearInterval(timer);
    });
    carousel.addEventListener("mouseleave", start);
    start();
  }

  function setupFilters() {
    all("[data-movie-grid]").forEach(function (grid) {
      var panel = grid.closest(".section-panel") || document;
      var input = panel.querySelector("[data-filter-input]");
      var select = panel.querySelector("[data-sort-select]");
      var originalCards = all(".movie-card", grid);

      function applyFilter() {
        var query = input ? input.value.trim().toLowerCase() : "";
        all(".movie-card", grid).forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-keywords") || "",
            card.getAttribute("data-year") || ""
          ].join(" ").toLowerCase();
          card.classList.toggle("is-filtered-out", query !== "" && haystack.indexOf(query) === -1);
        });
      }

      function applySort() {
        if (!select) {
          return;
        }
        var mode = select.value;
        var cards = all(".movie-card", grid);
        if (mode === "default") {
          originalCards.forEach(function (card) {
            grid.appendChild(card);
          });
          applyFilter();
          return;
        }
        cards.sort(function (a, b) {
          var yearA = Number(a.getAttribute("data-year") || 0);
          var yearB = Number(b.getAttribute("data-year") || 0);
          var titleA = a.getAttribute("data-title") || "";
          var titleB = b.getAttribute("data-title") || "";
          if (mode === "year-desc") {
            return yearB - yearA || titleA.localeCompare(titleB, "zh-Hans-CN");
          }
          if (mode === "year-asc") {
            return yearA - yearB || titleA.localeCompare(titleB, "zh-Hans-CN");
          }
          return titleA.localeCompare(titleB, "zh-Hans-CN");
        });
        cards.forEach(function (card) {
          grid.appendChild(card);
        });
        applyFilter();
      }

      if (input) {
        input.addEventListener("input", applyFilter);
      }
      if (select) {
        select.addEventListener("change", applySort);
      }
    });
  }

  function setupPlayers() {
    all("[data-player]").forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector("[data-play]");
      var status = player.querySelector("[data-player-status]");
      if (!video || !button) {
        return;
      }
      var src = video.getAttribute("data-src");
      var prepared = false;
      var hlsInstance = null;

      function setStatus(message) {
        if (status) {
          status.textContent = message || "";
        }
      }

      function prepare() {
        if (prepared || !src) {
          return;
        }
        prepared = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(src);
          hlsInstance.attachMedia(video);
        } else {
          video.src = src;
        }
      }

      function play() {
        prepare();
        player.classList.add("player-active");
        video.setAttribute("controls", "controls");
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {
            setStatus("播放暂不可用，请稍后再试");
          });
        }
      }

      button.addEventListener("click", play);
      video.addEventListener("click", function () {
        if (!prepared) {
          play();
        }
      });
      video.addEventListener("playing", function () {
        setStatus("");
      });
      video.addEventListener("error", function () {
        setStatus("播放暂不可用，请稍后再试");
      });
      window.addEventListener("beforeunload", function () {
        if (hlsInstance && hlsInstance.destroy) {
          hlsInstance.destroy();
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMobileMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
