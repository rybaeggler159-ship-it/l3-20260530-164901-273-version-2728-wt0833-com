(function () {
  function each(list, fn) {
    Array.prototype.forEach.call(list, fn);
  }

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero-carousel]");
    if (!root) {
      return;
    }
    var slides = root.querySelectorAll(".hero-slide");
    var dots = root.querySelectorAll(".hero-dot");
    var index = 0;
    function show(next) {
      index = next;
      each(slides, function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      each(dots, function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }
    each(dots, function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        show((index + 1) % slides.length);
      }, 5200);
    }
  }

  function initImages() {
    each(document.querySelectorAll("img"), function (img) {
      img.addEventListener("error", function () {
        img.classList.add("image-missing");
        img.removeAttribute("src");
      }, { once: true });
    });
  }

  function cardTemplate(item) {
    return [
      '<article class="movie-card">',
      '<a class="poster-wrap" href="' + item.url + '">',
      '<img src="' + item.image + '" alt="' + item.title.replace(/"/g, "&quot;") + '" loading="lazy">',
      '<span class="poster-badge">' + item.year + '</span>',
      '<span class="poster-play">▶</span>',
      '</a>',
      '<div class="movie-card-body">',
      '<h3><a href="' + item.url + '">' + item.title + '</a></h3>',
      '<p>' + item.desc + '</p>',
      '<div class="card-meta"><span>' + item.region + '</span><span>' + item.type + '</span><span>' + item.score + '</span></div>',
      '<div class="tag-row">' + item.tags.slice(0, 3).map(function (tag) { return '<span>' + tag + '</span>'; }).join("") + '</div>',
      '</div>',
      '</article>'
    ].join("");
  }

  function uniqueValues(list, key) {
    var seen = {};
    return list.map(function (item) {
      return item[key];
    }).filter(function (value) {
      if (!value || seen[value]) {
        return false;
      }
      seen[value] = true;
      return true;
    }).sort();
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }
    values.forEach(function (value) {
      var option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function initSearch() {
    var page = document.querySelector("[data-search-page]");
    if (!page || !window.MovieIndex) {
      return;
    }
    var input = page.querySelector("[data-search-input]");
    var year = page.querySelector("[data-year-filter]");
    var region = page.querySelector("[data-region-filter]");
    var type = page.querySelector("[data-type-filter]");
    var result = page.querySelector("[data-search-results]");
    var status = page.querySelector("[data-search-status]");
    var params = new URLSearchParams(window.location.search);
    fillSelect(year, uniqueValues(window.MovieIndex, "year"));
    fillSelect(region, uniqueValues(window.MovieIndex, "region"));
    fillSelect(type, uniqueValues(window.MovieIndex, "type"));
    input.value = params.get("q") || "";
    function render() {
      var q = input.value.trim().toLowerCase();
      var y = year.value;
      var r = region.value;
      var t = type.value;
      var items = window.MovieIndex.filter(function (item) {
        var hay = [item.title, item.desc, item.genre, item.region, item.type, item.tags.join(" ")].join(" ").toLowerCase();
        return (!q || hay.indexOf(q) !== -1) && (!y || item.year === y) && (!r || item.region === r) && (!t || item.type === t);
      }).slice(0, 96);
      result.innerHTML = items.map(cardTemplate).join("");
      status.textContent = items.length ? "搜索结果" : "暂无匹配内容";
      initImages();
    }
    [input, year, region, type].forEach(function (node) {
      node.addEventListener("input", render);
      node.addEventListener("change", render);
    });
    render();
  }

  ready(function () {
    initMenu();
    initHero();
    initImages();
    initSearch();
  });
})();
