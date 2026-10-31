/* 긴 목록을 일정 개수만 보여 주고 "더 보기"로 늘린다. app.js가 그린 결과를 지켜보며 동작한다.
   - 전체 그림 벽(#all-grid): 48점씩
   - 미술관 목록(#museum-chips): 12곳씩 */
(function () {
  var LISTS = [
    { id: 'all-grid', step: 48, noun: '그림', unit: '점' },
    { id: 'museum-chips', step: 12, noun: '미술관', unit: '곳' }
  ];
  function setup(cfg) {
    var box = document.getElementById(cfg.id);
    if (!box) return;
    var shown = cfg.step, btn = document.createElement('button'), count = document.createElement('span');
    btn.type = 'button'; btn.className = 'wall-more'; count.className = 'wall-count';
    box.insertAdjacentElement('afterend', btn); btn.insertAdjacentElement('afterend', count);
    function apply() {
      var items = box.children, total = items.length;
      for (var i = 0; i < total; i++) {
        var on = i < shown;
        items[i].style.display = on ? '' : 'none';
        // 보이는 그림만 바로 불러온다. 지연 로딩이 높이 0 그림을 건너뛰는 브라우저가 있어서 직접 관리한다.
        var imgs = items[i].getElementsByTagName('img');
        for (var j = 0; j < imgs.length; j++) {
          var im = imgs[j];
          if (on) {
            if (im.getAttribute('data-src')) { im.setAttribute('src', im.getAttribute('data-src')); im.removeAttribute('data-src'); }
            im.loading = 'eager';
          } else if (!im.complete && im.getAttribute('src')) {
            im.setAttribute('data-src', im.getAttribute('src')); im.removeAttribute('src');
          }
        }
      }
      var left = total - Math.min(shown, total);
      btn.style.display = left > 0 ? '' : 'none';
      btn.textContent = cfg.noun + ' ' + Math.min(cfg.step, left) + cfg.unit + ' 더 보기';
      count.textContent = total > cfg.step ? Math.min(shown, total) + ' / ' + total + cfg.unit : '';
    }
    btn.addEventListener('click', function () { shown += cfg.step; apply(); });
    new MutationObserver(function () { shown = cfg.step; apply(); }).observe(box, { childList: true });
    apply();
  }
  function init() { LISTS.forEach(setup); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
