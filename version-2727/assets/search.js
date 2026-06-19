(function () {
  var input = document.querySelector('[data-search-box]');
  var results = document.querySelector('[data-search-results]');
  if (!input || !results || !window.SEARCH_INDEX) {
    return;
  }
  var params = new URLSearchParams(window.location.search);
  var initial = params.get('q') || '';
  input.value = initial;
  var render = function () {
    var query = input.value.trim().toLowerCase();
    var list = window.SEARCH_INDEX.filter(function (item) {
      if (!query) {
        return true;
      }
      var text = [item.title, item.year, item.region, item.genre, item.type, item.one_line, (item.tags || []).join(' ')].join(' ').toLowerCase();
      return text.indexOf(query) !== -1;
    }).slice(0, 120);
    if (!list.length) {
      results.innerHTML = '<div class="detail-block"><h2>暂无匹配结果</h2><p>可以尝试更换影片名、类型、地区或年份继续搜索。</p></div>';
      return;
    }
    results.innerHTML = list.map(function (item) {
      var tags = (item.tags || []).slice(0, 4).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');
      return '<article class="search-card">' +
        '<a href="' + item.url + '"><img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" onerror="this.style.opacity=\'0\'"></a>' +
        '<div><p class="card-meta">' + escapeHtml(item.year) + ' · ' + escapeHtml(item.region) + ' · ' + escapeHtml(item.genre) + '</p>' +
        '<h2><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h2>' +
        '<p>' + escapeHtml(item.one_line) + '</p>' +
        '<div class="tag-row">' + tags + '</div></div>' +
        '</article>';
    }).join('');
  };
  var escapeHtml = function (value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      })[char];
    });
  };
  input.addEventListener('input', render);
  render();
})();
