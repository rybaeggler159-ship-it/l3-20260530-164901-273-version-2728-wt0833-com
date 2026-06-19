document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector("[data-menu-button]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
  var active = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    active = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === active);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === active);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(active + 1);
    }, 5200);
  }

  showSlide(0);

  var query = new URLSearchParams(window.location.search).get("q") || "";
  var firstSearch = document.querySelector("[data-search-input]");

  if (query && firstSearch) {
    firstSearch.value = query;
  }

  Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]")).forEach(function (scope) {
    var input = scope.querySelector("[data-search-input]");
    var type = scope.querySelector("[data-type-filter]");
    var region = scope.querySelector("[data-region-filter]");
    var year = scope.querySelector("[data-year-filter]");
    var sort = scope.querySelector("[data-sort-filter]");
    var grid = scope.nextElementSibling;

    while (grid && !grid.querySelector("[data-movie-card]") && !grid.matches("[data-card-grid]")) {
      grid = grid.nextElementSibling;
    }

    if (!grid) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-movie-card]"));
    var empty = grid.parentElement.querySelector("[data-no-result]");

    function apply() {
      var q = input ? input.value.trim().toLowerCase() : "";
      var typeValue = type ? type.value : "";
      var regionValue = region ? region.value : "";
      var yearValue = year ? year.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var pool = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-tags")
        ].join(" ").toLowerCase();

        var matched = true;

        if (q && pool.indexOf(q) === -1) {
          matched = false;
        }

        if (typeValue && card.getAttribute("data-type") !== typeValue) {
          matched = false;
        }

        if (regionValue && card.getAttribute("data-region") !== regionValue) {
          matched = false;
        }

        if (yearValue && card.getAttribute("data-year") !== yearValue) {
          matched = false;
        }

        card.style.display = matched ? "" : "none";

        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    function sortCards() {
      if (!sort || !sort.value) {
        apply();
        return;
      }

      var sorted = cards.slice().sort(function (a, b) {
        if (sort.value === "year-desc") {
          return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
        }

        if (sort.value === "year-asc") {
          return Number(a.getAttribute("data-year")) - Number(b.getAttribute("data-year"));
        }

        return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-Hans-CN");
      });

      sorted.forEach(function (card) {
        grid.appendChild(card);
      });

      cards = sorted;
      apply();
    }

    [input, type, region, year].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    if (sort) {
      sort.addEventListener("change", sortCards);
    }

    apply();
  });
});
