(function () {
  'use strict';

  var DATA = window.VG_DATA || null;
  var museums = (DATA && Array.isArray(DATA.museums)) ? DATA.museums : [];
  var life = (DATA && Array.isArray(DATA.life)) ? DATA.life : [];
  var VG_BIRTH = 1853;  // 살던 곳 카드와 크게 보기의 나이 계산에 함께 쓴다

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function placeholderHTML(title) { return '<div class="placeholder"><span>' + esc(title || '그림') + '</span></div>'; }
  // 목록은 작은 그림(500px), 크게 보기는 큰 그림(1280px)을 쓴다
  function sized(url, px) {
    return String(url).replace(/\/(\d+)px-/, '/' + px + 'px-').replace(/([?&]width=)\d+/, '$1' + px);
  }
  function imgHTML(w, eager) {
    if (!w.img) return placeholderHTML(w.titleKo);
    return '<img src="' + esc(sized(w.img, eager ? 1280 : 500)) + '" alt="' + esc(w.titleKo) + '" ' + (eager ? '' : 'loading="lazy" ') +
      'decoding="async" referrerpolicy="no-referrer" data-ph="' + esc(w.titleKo) + '">';
  }
  // 이미지가 안 열리면 제목이 적힌 평평한 칸으로 바꾼다
  document.addEventListener('error', function (e) {
    var t = e.target;
    if (t && t.tagName === 'IMG' && t.hasAttribute('data-ph')) {
      var div = document.createElement('div');
      div.innerHTML = placeholderHTML(t.getAttribute('data-ph'));
      t.replaceWith(div.firstChild);
    }
  }, true);

  // 모든 그림 펼치기
  var allWorks = [];
  museums.forEach(function (m) {
    (m.works || []).forEach(function (w) { allWorks.push({ w: w, m: m }); });
  });
  // 나란히 보기 묶음(정본 versions). 데이터에 없는 작품은 건너뛰고, 두 점이 안 남으면 묶음을 뺀다
  var byId = {};
  allWorks.forEach(function (it) { byId[it.w.id] = it; });
  var GROUPS = ((DATA && DATA.versions) || []).map(function (g) {
    var list = (g.works || []).map(function (id) { return byId[id]; }).filter(Boolean);
    return list.length >= 2 ? { id: g.id, titleKo: g.titleKo, lead: g.lead || '', ask: g.ask || '', list: list } : null;
  }).filter(Boolean);
  function groupsOf(w) {
    return GROUPS.filter(function (g) { return g.list.some(function (it) { return it.w === w; }); });
  }
  // 몇 점이 몇 도시에 있는지는 데이터로 센다
  function groupWhere(g) {
    var cities = [], ms = [];
    g.list.forEach(function (it) {
      if (cities.indexOf(it.m.city) < 0) cities.push(it.m.city);
      if (ms.indexOf(it.m) < 0) ms.push(it.m);
    });
    var n = g.list.length;
    // 고흐가 그린 판 전부가 아니라 이 지도에 있는 것만 센다(개인 소장, 사라진 그림은 빠진다)
    if (ms.length === 1) return '이 지도의 ' + n + '점은 모두 ' + ms[0].city + '의 ' + ms[0].nameKo + '에 있어요.';
    if (cities.length === 1) return '이 지도의 ' + n + '점은 모두 ' + cities[0] + '에 있어요.';
    return '이 지도의 ' + n + '점은 지금 ' + cities.length + '개 도시에 있어요.';
  }
  function museumList(m) { return (m.works || []).map(function (w) { return { w: w, m: m }; }); }
  // 이야기가 있는 그림(큐레이션 32점)을 앞에 둔다. 나머지 순서는 그대로 둔다.
  function storyFirst(list) {
    return list.filter(function (it) { return it.w.featured; }).concat(list.filter(function (it) { return !it.w.featured; }));
  }

  // 숫자 채우기
  Array.prototype.forEach.call(document.querySelectorAll('[data-count]'), function (el) {
    var k = el.getAttribute('data-count');
    if (k === 'museums' && museums.length) el.textContent = museums.length;
    if (k === 'works' && allWorks.length) el.textContent = allWorks.length;
  });

  /* ---------- 주소(딥링크) ---------- */
  function setURL(m, workIdx) {
    if (!window.history || !history.replaceState) return;
    try {
      var u = new URL(location.href);
      u.searchParams.delete('museum'); u.searchParams.delete('work');
      if (m) u.searchParams.set('museum', m.id);
      if (m && workIdx != null && workIdx >= 0) u.searchParams.set('work', workIdx);
      history.replaceState(null, '', u.pathname + u.search + u.hash);
    } catch (err) { /* file:// 등에서는 건너뛴다 */ }
  }

  /* ---------- 소개 영상 ---------- */
  (function () {
    var el = $('intro-frame');
    if (!el) return;
    try {
      if (window.VGIntro && typeof window.VGIntro.mount === 'function') { window.VGIntro.mount(el); return; }
    } catch (err) { console.error(err); }
    el.innerHTML = '<div class="intro-fallback"><div class="big">빈센트 반 고흐</div>' +
      '<a class="textlink" href="#map-section">지도에서 그림 찾기</a></div>';
  })();

  /* ---------- 라이트박스 ---------- */
  var lbList = [], lbIdx = 0, lastFocus = null;
  var lb = $('lightbox');
  function openLightbox(list, idx) {
    if (!list.length) return;
    lbList = list; lbIdx = Math.max(0, Math.min(idx, list.length - 1));
    if (lb.hidden) lastFocus = document.activeElement;  // 나란히 보기에서 넘어올 때는 처음 연 곳을 기억한다
    renderLightbox();
    lb.hidden = false;
    document.body.classList.add('no-scroll');
    $('lb-close').focus();
  }
  function closeLightbox() {
    stopReading();
    lb.hidden = true;
    if (!panelOpen) document.body.classList.remove('no-scroll');
    setURL(panelOpen ? panelMuseum : null);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function renderLightbox() {
    stopReading();
    if (lbMode === 'compare') { var inner = lb.querySelector('.lb-inner'); if (inner) inner.scrollTop = 0; }  // 폰에서 내려 둔 위치를 버린다
    lbMode = 'one'; lb.classList.remove('compare');
    var item = lbList[lbIdx], w = item.w, m = item.m;
    var groups = groupsOf(w);
    var multi = lbList.length > 1;
    $('lb-bar').style.visibility = multi ? '' : 'hidden';
    $('lb-count').textContent = multi ? (lbIdx + 1) + ' / ' + lbList.length : '';
    var look = w.lookFor ? String(w.lookFor).replace(/^그림에서 찾아보기:\s*/, '') : '';
    var place = esc(m.city) + (m.country ? ', ' + esc(m.country) : '');
    $('lb-content').innerHTML =
      '<div class="lb-img">' + imgHTML(w, true) + '</div>' +
      '<div class="lb-text">' +
        '<h3>' + esc(w.titleKo) + '</h3>' +
        (w.titleEn ? '<p class="en">' + esc(w.titleEn) + '</p>' : '') +
        '<p class="tomb">' + (w.year ? esc(w.year) + '년 · ' : '') + esc(kindOf(w)) + '<br>' + esc(m.nameKo) + '<br>' + place + '</p>' +
        (ageText(w) ? '<p class="lb-age">' + esc(ageText(w)) + '</p>' : '') +
        '<div class="lb-actions">' +
          (canRead() ? '<button type="button" class="textlink lb-read" id="lb-read" aria-pressed="false">읽어 줘요</button>' : '') +
          (panelOpen && panelMuseum === m ? '' : '<button type="button" class="textlink lb-map" id="lb-map">지도에서 이 미술관 보기</button>') +
        '</div>' +
        (w.story ? '<p class="story">' + esc(w.story) + '</p>' : '') +
        (look ? '<div class="part"><h4>그림에서 찾아보기</h4><p>' + esc(look) + '</p></div>' : '') +
        (w.fun ? '<div class="part"><h4>알고 있나요?</h4><p>' + esc(w.fun) + '</p></div>' : '') +
        (w.talk ? '<div class="part talk"><h4>같이 이야기해요</h4><p>' + esc(w.talk) + '</p></div>' : '') +
        groups.map(function (g) { return versionsPartHTML(g, w); }).join('') +
        // 어른용 메모는 접어 두고, "읽어 줘요"도 읽지 않는다
        (w.forAdults ? '<details class="part adults"><summary>어른을 위한 메모: 아이가 물으면</summary><p>' + esc(w.forAdults) + '</p></details>' : '') +
        (look ? '' : '<div class="part"><h4>천천히 보고 이야기해요</h4><p>' + LOOK_COMMON + '</p><p>' + esc(lookQuestion(w)) + '</p></div>') +
      '</div>';
    var mapBtn = $('lb-map');
    if (mapBtn) mapBtn.onclick = function () { closeLightbox(); selectMuseum(m, true); };
    Array.prototype.forEach.call($('lb-content').querySelectorAll('.versions'), function (box) {
      var g = GROUPS[+box.getAttribute('data-g')];
      box.onclick = function (e) {
        var t = e.target.closest('.v-thumb');
        if (t) { openLightbox(g.list, +t.getAttribute('data-i')); $('lb-close').focus(); return; }
        if (e.target.closest('.v-open')) openCompare(g);
      };
    });
    var readBtn = $('lb-read');
    if (readBtn) readBtn.onclick = function () {
      if (reading) { stopReading(); return; }
      var parts = [w.titleKo + '.'];
      if (w.story) parts.push(w.story);
      if (look) parts.push('그림에서 찾아보기.', look);
      if (w.fun) parts.push('알고 있나요?', w.fun);
      if (w.talk) parts.push('같이 이야기해요.', w.talk);
      if (!look) parts.push('천천히 보고 이야기해요.', LOOK_COMMON, lookQuestion(w));
      startReading(parts, readBtn);
    };
    setURL(m, (m.works || []).indexOf(w));
  }

  /* ---------- 나란히 보기 ---------- */
  // 같은 라이트박스 안에서 그림 설명 대신 묶음 전체를 한 화면에 펼친다
  var lbMode = 'one';
  function versionsPartHTML(g, w) {
    return '<div class="part versions" data-g="' + GROUPS.indexOf(g) + '">' +
      '<h4>나란히 보기: ' + esc(g.titleKo) + '</h4>' +
      '<p>' + esc(groupWhere(g)) + '</p>' +
      '<div class="v-thumbs">' + g.list.map(function (it, i) {
        var cur = it.w === w;
        return '<button type="button" class="v-thumb" data-i="' + i + '"' + (cur ? ' aria-current="true"' : '') +
          ' aria-label="' + esc(it.m.city + ', ' + it.m.nameKo + (it.w.year ? ', ' + it.w.year + '년' : '') + (cur ? ' (지금 보는 그림)' : '')) + '">' +
          imgHTML(it.w) + '</button>';
      }).join('') + '</div>' +
      '<button type="button" class="textlink v-open">' + g.list.length + '점 나란히 보기</button>' +
    '</div>';
  }
  function openCompare(g) {
    stopReading();
    if (lb.hidden) lastFocus = document.activeElement;
    lbMode = 'compare';
    lb.classList.add('compare');
    $('lb-bar').style.visibility = 'hidden';
    $('lb-count').textContent = '';
    $('lb-content').innerHTML =
      '<div class="cmp">' +
        '<div class="cmp-head">' +
          '<p class="cmp-eyebrow">나란히 보기 · ' + esc(groupWhere(g)) + '</p>' +
          '<h3>' + esc(g.titleKo) + '</h3>' +
          (g.lead ? '<p class="cmp-lead">' + esc(g.lead) + '</p>' : '') +
          (g.ask ? '<p class="cmp-ask"><b>찾아보세요</b>' + esc(g.ask) + '</p>' : '') +
        '</div>' +
        '<div class="cmp-grid' + (g.list.length === 2 ? ' two' : '') + '">' + g.list.map(function (it, i) {
          var w = it.w;
          return '<figure class="cmp-item"><button type="button" class="cmp-img" data-i="' + i + '" aria-label="' + esc(w.titleKo + ', ' + it.m.city) + ' 크게 보기">' +
            imgHTML(w) + '</button>' +
            '<figcaption><b>' + esc(it.m.city) + '</b> ' + esc(it.m.nameKo) + '<br>' +
            [w.year ? esc(w.year) + '년' : '', esc(kindOf(w))].filter(Boolean).join(' · ') + '</figcaption></figure>';
        }).join('') + '</div>' +
        '<p class="cmp-foot">그림을 누르면 크게 볼 수 있어요.</p>' +
      '</div>';
    // 오버레이 안의 지연 로딩은 늦게 떠서, 나란히 놓는 그림은 바로 불러온다
    Array.prototype.forEach.call($('lb-content').querySelectorAll('.cmp-img img'), function (im) { im.loading = 'eager'; });
    $('lb-content').querySelector('.cmp-grid').onclick = function (e) {
      var b = e.target.closest('.cmp-img');
      if (b) { openLightbox(g.list, +b.getAttribute('data-i')); $('lb-close').focus(); }
    };
    lb.hidden = false;
    lb.scrollTop = 0;
    var inner = lb.querySelector('.lb-inner'); if (inner) inner.scrollTop = 0;
    document.body.classList.add('no-scroll');
    $('lb-close').focus();
  }

  /* ---------- 읽어 줘요 (브라우저 내장 음성) ---------- */
  // 크롬은 긴 글을 한 번에 읽히면 15초쯤에서 끊기므로 문장 단위로 나눠 차례로 읽힌다.
  var synth = window.speechSynthesis || null, reading = false, readBtnEl = null;
  function koVoice() {
    if (!synth) return null;
    return synth.getVoices().filter(function (v) { return /^ko/i.test(v.lang); })[0] || null;
  }
  function canRead() {
    if (!synth || !window.SpeechSynthesisUtterance) return false;
    // 음성 목록이 아직 안 불러졌으면 일단 보여 주고, 불러진 뒤 한국어 음성이 없으면 숨긴다
    return !synth.getVoices().length || !!koVoice();
  }
  if (synth && synth.addEventListener) {
    synth.addEventListener('voiceschanged', function () {
      var b = $('lb-read');
      if (b && !canRead()) { stopReading(); b.remove(); }
    });
  }
  function setReadBtn(on) {
    reading = on;
    if (!readBtnEl) return;
    readBtnEl.textContent = on ? '그만 읽기' : '읽어 줘요';
    readBtnEl.setAttribute('aria-pressed', on);
  }
  function stopReading() {
    readToken++;
    if (synth && reading) synth.cancel();
    setReadBtn(false);
    readBtnEl = null;
  }
  var readToken = 0;  // 취소된 지난 읽기의 끝 신호가 새 읽기를 끄지 않게 한다
  function startReading(parts, btn) {
    if (!synth) return;
    synth.cancel();
    var token = ++readToken;
    readBtnEl = btn;
    var voice = koVoice(), chunks = [];
    parts.forEach(function (p) {
      (String(p).match(/[^.?!]+[.?!]*/g) || []).forEach(function (s) { if (s.trim()) chunks.push(s.trim()); });
    });
    function done() { if (token === readToken) setReadBtn(false); }
    chunks.forEach(function (s, i) {
      var u = new SpeechSynthesisUtterance(s);
      u.lang = 'ko-KR'; u.rate = 0.95;
      if (voice) u.voice = voice;
      if (i === chunks.length - 1) u.onend = done;
      u.onerror = done;
      synth.speak(u);
    });
    setReadBtn(true);
  }
  // 이야기가 없는 그림에도 아이가 할 일을 하나 준다. 앞 두 질문은 미술관 교육의 VTS 질문을 고친 것이다.
  // "무슨 일이 일어나나요"는 꽃병, 산 같은 정물과 풍경에서 아이가 막혀 "무엇이 보이나요"로 묻는다.
  var LOOK_COMMON = '이 그림에서 무엇이 보이나요? 어디를 보고 그렇게 생각했나요?';
  var LOOK_EXTRA = [
    '가장 먼저 눈에 들어온 곳은 어디인가요?',
    '이 그림에서 가장 밝은 색을 찾아보세요.',
    '붓자국은 어느 쪽으로 움직이나요? 손가락으로 따라 그려 보세요.',
    '그림 속에 들어간다면 어떤 소리가 들릴까요?',
    '이 그림에 새 제목을 붙인다면 뭐라고 할까요?',
    '그림을 보면 어떤 기분이 드나요?'
  ];
  // 소묘와 판화는 색과 붓자국 대신 선을 보게 한다
  var LOOK_LINE = [
    '가장 먼저 눈에 들어온 곳은 어디인가요?',
    '선이 굵고 진한 곳과 가늘고 연한 곳을 찾아보세요.',
    '고흐는 짧은 선과 점을 많이 그었어요. 어디에서 찾을 수 있나요?',
    '그림 속에 들어간다면 어떤 소리가 들릴까요?',
    '이 그림에 색을 칠한다면 무슨 색을 고를까요?',
    '그림을 보면 어떤 기분이 드나요?'
  ];
  // 그 그림을 그린 해의 고흐 나이. 생일 전후를 가리지 않아 "무렵"으로 쓴다
  function ageText(w) {
    var y = +w.year;
    if (!y || y < VG_BIRTH) return '';
    return '고흐가 ' + (y - VG_BIRTH) + '살 무렵 ' + (w.kind === '판화' ? '만든 판화예요.' : '그린 그림이에요.');
  }
  // 유화가 아닌 작품의 종류. 유화에는 kind가 없다
  function kindOf(w) { return w.kind || '유화'; }
  function lookQuestion(w) {
    var s = String(w.id || w.titleKo || ''), h = 0;
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 9973;
    var pool = (w.kind === '소묘' || w.kind === '판화') ? LOOK_LINE : LOOK_EXTRA;
    return pool[h % pool.length];
  }
  function lbStep(d) { lbIdx = (lbIdx + d + lbList.length) % lbList.length; renderLightbox(); }
  $('lb-close').addEventListener('click', closeLightbox);
  $('lb-prev').addEventListener('click', function () { lbStep(-1); });
  $('lb-next').addEventListener('click', function () { lbStep(1); });

  /* ---------- 그림 카드 ---------- */
  function cardHTML(item, i, showMuseum) {
    var w = item.w;
    var kind = w.kind ? esc(w.kind) : '';  // 카드에는 유화가 아닐 때만 종류를 적는다
    var meta = [w.year ? esc(w.year) : '', kind, showMuseum ? esc(item.m.nameKo) : ''].filter(Boolean).join(' · ');
    if (!showMuseum) meta = [w.year ? esc(w.year) + '년' : '', kind].filter(Boolean).join(' · ');
    if (w.featured) meta += '<span class="has-story">이야기 있음</span>';
    return '<button class="art-card" data-i="' + i + '" aria-label="' + esc(w.titleKo) + ' 크게 보기">' +
      '<div class="art-thumb">' + imgHTML(w) + '</div>' +
      '<div class="t">' + esc(w.titleKo) + '</div>' +
      '<div class="y">' + meta + '</div>' +
      '</button>';
  }
  function bindCards(container, list) {
    container.onclick = function (e) {
      var b = e.target.closest('.art-card');
      if (!b) return;
      openLightbox(list, +b.getAttribute('data-i'));
    };
  }

  /* ---------- 소개 그림 한 점 ---------- */
  (function () {
    var fig = $('who-fig');
    var hit = null;
    allWorks.forEach(function (it) { if (!hit && it.w.id === 'selfportrait-aic') hit = it; });
    allWorks.forEach(function (it) { if (!hit && it.w.img && it.w.titleEn === 'Self-Portrait' && /Chicago/.test(it.m.nameEn || '')) hit = it; });
    allWorks.forEach(function (it) { if (!hit && it.w.img && /^자화상/.test(it.w.titleKo || '')) hit = it; });
    if (!fig || !hit) { if (fig) fig.style.display = 'none'; return; }
    var list = museumList(hit.m), idx = hit.m.works.indexOf(hit.w);
    fig.innerHTML = '<button class="art-card" aria-label="' + esc(hit.w.titleKo) + ' 크게 보기">' + imgHTML(hit.w) + '</button>' +
      '<figcaption>' + esc(hit.w.titleKo) + ', ' + esc(hit.w.year) + '년. ' + esc(hit.m.nameKo) + '</figcaption>';
    fig.querySelector('button').onclick = function () { openLightbox(list, idx); };
  })();

  /* ---------- 미술관 패널 ---------- */
  var panel = $('panel'), backdrop = $('panel-backdrop'), panelOpen = false, panelMuseum = null;
  function openPanel(m) {
    var list = storyFirst(museumList(m));
    $('panel-body').innerHTML =
      '<div class="panel-head">' +
        '<p class="eyebrow">' + esc(m.city) + (m.country ? ', ' + esc(m.country) : '') + ' · 그림 ' + list.length + '점</p>' +
        '<h3>' + esc(m.nameKo) + '</h3>' + (m.nameEn ? '<p class="en">' + esc(m.nameEn) + '</p>' : '') +
      '</div>' +
      (m.intro ? '<p class="panel-intro">' + esc(m.intro) + '</p>' : '') +
      (list.length ? '<div class="art-grid" id="panel-grid">' + list.map(function (it, i) { return cardHTML(it, i, false); }).join('') + '</div>'
        : '<p class="empty-msg">아직 그림 정보가 없어요.</p>');
    var g = $('panel-grid');
    if (g) bindCards(g, list);
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    backdrop.hidden = false;
    panelOpen = true; panelMuseum = m;
    panel.scrollTop = 0;
    setURL(m);
    if (mapApi) mapApi.setActive(m);
    questCheck(m);
    setTimeout(function () { $('panel-close').focus({ preventScroll: true }); }, 50);
  }
  function closePanel() {
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    backdrop.hidden = true;
    panelOpen = false; panelMuseum = null;
    document.body.classList.remove('no-scroll');
    setURL(null);
    if (mapApi) mapApi.setActive(null);
  }
  $('panel-close').addEventListener('click', closePanel);
  backdrop.addEventListener('click', closePanel);

  document.addEventListener('keydown', function (e) {
    if (!lb.hidden) {
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowLeft' && lbMode === 'one') lbStep(-1);
      else if (e.key === 'ArrowRight' && lbMode === 'one') lbStep(1);
      else if (e.key === 'Tab') {
        // 라이트박스 안에서만 포커스가 돈다
        var f = Array.prototype.filter.call(lb.querySelectorAll('button, a[href], [tabindex="0"]'), function (el) {
          return el.offsetParent !== null && getComputedStyle(el).visibility !== 'hidden';
        });
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        else if (!lb.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
      }
      return;
    }
    if (e.key === 'Escape') {
      if (panelOpen) closePanel();
      else hideLifeCard();
    }
  });

  /* ---------- 그림 벽 ---------- */
  (function () {
    var grid = $('all-grid'), filters = $('all-filters');
    if (!allWorks.length) {
      grid.innerHTML = '<p class="empty-msg">그림을 불러오지 못했어요. 잠시 뒤에 다시 열어 주세요.</p>';
      return;
    }
    var ordered = storyFirst(allWorks);
    var STORY = '__story', KIND = '__kind:';
    var KINDS = ['유화', '소묘', '수채화', '판화'];
    var search = $('all-search'), result = $('all-result'), quick = $('all-quick');
    var countries = [];
    museums.forEach(function (m) {
      if (m.country && countries.indexOf(m.country) < 0) countries.push(m.country);
    });
    countries.sort(function (a, b) {
      return allWorks.filter(function (it) { return it.m.country === b; }).length -
        allWorks.filter(function (it) { return it.m.country === a; }).length;
    });
    var current = '전체', query = '';

    // 띄어쓰기와 대소문자를 무시하고 제목, 미술관, 도시, 나라, 그린 곳에서 찾는다
    function norm(s) { return String(s || '').toLowerCase().replace(/\s+/g, ''); }
    function matches(it) {
      if (!query) return true;
      var w = it.w, m = it.m;
      return [w.titleKo, w.titleEn, w.place, kindOf(w), m.nameKo, m.nameEn, m.city, m.country].some(function (s) {
        return norm(s).indexOf(query) >= 0;
      });
    }
    function inTab(it, key) {
      if (key === '전체') return true;
      if (key === STORY) return !!it.w.featured;
      if (key.indexOf(KIND) === 0) return kindOf(it.w) === key.slice(KIND.length);
      return it.m.country === key;
    }
    function tab(label, key, n) {
      return '<button class="tab" data-c="' + esc(key) + '" aria-pressed="' + (current === key) + '">' + esc(label) + '<span class="n">' + n + '</span></button>';
    }
    function renderFilters(found) {
      function n(key) { return found.filter(function (it) { return inTab(it, key); }).length; }
      var keys = countries.filter(function (c) { return c === current || n(c) > 0; });
      var kinds = KINDS.filter(function (k) { return current === KIND + k || n(KIND + k) > 0; });
      filters.innerHTML = [tab('전체', '전체', found.length), tab('이야기 있는 그림', STORY, n(STORY))]
        .concat(kinds.map(function (k) { return tab(k, KIND + k, n(KIND + k)); }))
        .concat(keys.map(function (c) { return tab(c, c, n(c)); })).join('');
    }
    function render() {
      var found = ordered.filter(matches);
      var list = found.filter(function (it) { return inTab(it, current); });
      renderFilters(found);
      grid.innerHTML = list.length
        ? list.map(function (it, i) { return cardHTML(it, i, true); }).join('')
        : '<p class="empty-msg">찾는 그림이 없어요. 다른 이름으로 찾아보세요.</p>';
      bindCards(grid, list);
      if (result) {
        result.textContent = query
          ? (list.length ? '「' + search.value.trim() + '」 그림 ' + list.length + '점을 찾았어요.' : '')
          : '';
      }
      if (quick) {
        Array.prototype.forEach.call(quick.querySelectorAll('button[data-q]'), function (b) {
          b.setAttribute('aria-pressed', norm(b.getAttribute('data-q')) === query);
        });
      }
    }
    filters.addEventListener('click', function (e) {
      var b = e.target.closest('.tab');
      if (!b) return;
      current = b.getAttribute('data-c');
      render();
      var f = filters.querySelector('[data-c="' + current.replace(/"/g, '') + '"]');
      if (f) f.focus();
    });
    if (search) {
      var st;
      search.addEventListener('input', function () {
        clearTimeout(st);
        st = setTimeout(function () { query = norm(search.value); render(); }, 150);
      });
    }
    if (quick) {
      quick.addEventListener('click', function (e) {
        var b = e.target.closest('button[data-q]');
        if (!b || !search) return;
        var q = b.getAttribute('data-q');
        search.value = norm(q) === query ? '' : q;  // 한 번 더 누르면 지운다
        query = norm(search.value);
        current = '전체';
        render();
      });
    }
    render();
  })();

  /* ---------- 그림 모음 위의 나란히 보기 줄 ---------- */
  (function () {
    var box = $('all-pairs'), row = $('pair-row');
    if (!box || !row || !GROUPS.length) return;
    row.innerHTML = GROUPS.map(function (g, i) {
      var shown = g.list.slice(0, 3);
      return '<li><button type="button" class="pair-card" data-g="' + i + '">' +
        '<span class="pair-thumbs n' + shown.length + '">' + shown.map(function (it) { return '<span>' + imgHTML(it.w) + '</span>'; }).join('') + '</span>' +
        '<span class="pair-t">' + esc(g.titleKo) + '</span>' +
        '<span class="pair-n">' + g.list.length + '점</span></button></li>';
    }).join('');
    row.onclick = function (e) {
      var b = e.target.closest('.pair-card');
      if (b) openCompare(GROUPS[+b.getAttribute('data-g')]);
    };
    box.hidden = false;
  })();

  /* ---------- 지도 ---------- */
  var mapEl = $('map'), tip = $('map-tip'), wrap = $('map-wrap'), lifeCard = $('life-card'), legend = $('map-legend');
  var showMuseums = true, showLife = false;
  var zoomTo = function () {}, mapApi = null;

  function hideLifeCard() {
    lifeCard.hidden = true;
    if (mapApi) mapApi.clearLifeActive();
  }

  // 고흐가 살던 곳에서 그린 그림. 그림의 place가 생애 도시 이름과 같으면 묶는다.
  // 몽마르트르는 파리 안, 생폴드모졸 수도원은 생레미에 있는 요양원이라 같은 도시로 본다.
  // 살던 곳 카드의 나이. 그 해 연도에서 태어난 해를 뺀 값(그 해에 맞은 나이)이다. VG_BIRTH는 파일 맨 위에 있다.
  function lifeAgeText(s) {
    var ys = String(s.years || '').split('~').map(Number), a = ys[0], b = ys[1];
    if (!a) return '';
    var x = a - VG_BIRTH;
    if (!b || b === a) return x <= 0 ? '갓 태어난 아기 때 살았어요.' : x + '살 때 이곳으로 왔어요.';
    return x + '살부터 ' + (b - VG_BIRTH) + '살까지 살았어요.';
  }

  // 살던 기간(years) 밖의 연도는 데이터가 어긋난 것으로 보고 뺀다(예: 1885년 그림이 파리로 잡힌 경우).
  var PLACE_ALIAS = { '몽마르트르': '파리', '생폴드모졸 수도원': '생레미드프로방스' };
  function paintedAt(s) {
    var ys = String(s.years || '').split('~').map(Number), from = ys[0], to = ys[1] || ys[0];
    return storyFirst(allWorks.filter(function (it) {
      var p = it.w.place, y = +it.w.year;
      if (!p || (PLACE_ALIAS[p] || p) !== s.placeKo) return false;
      return !y || !from || (y >= from && y <= to);
    }));
  }
  function lifeWorksHTML(list) {
    if (!list.length) return '';
    var ms = [], cs = [];
    list.forEach(function (it) {
      if (ms.indexOf(it.m) < 0) ms.push(it.m);
      if (it.m.country && cs.indexOf(it.m.country) < 0) cs.push(it.m.country);
    });
    var thumbs = [];
    list.forEach(function (it, i) { if (thumbs.length < 3 && it.w.img) thumbs.push(i); });
    return '<div class="lc-works">' +
      '<p class="lc-stat">이 지도에는 여기서 그린 그림이 ' + list.length + '점 있어요. 지금 ' + cs.length + '개 나라, ' + ms.length + '곳 미술관에 있어요.</p>' +
      (thumbs.length ? '<div class="lc-thumbs">' + thumbs.map(function (i) {
        var w = list[i].w;
        return '<button type="button" class="lc-thumb" data-i="' + i + '" aria-label="' + esc(w.titleKo) + ' 크게 보기">' + imgHTML(w) + '</button>';
      }).join('') + '</div>' : '') +
      '<button type="button" class="textlink lc-all">' + list.length + '점 모두 보기</button>' +
    '</div>';
  }
  function bindLifeWorks(list) {
    var box = lifeCard.querySelector('.lc-works');
    if (!box) return;
    box.onclick = function (e) {
      var t = e.target.closest('.lc-thumb');
      if (t) { openLightbox(list, +t.getAttribute('data-i')); return; }
      if (e.target.closest('.lc-all')) openLightbox(list, 0);
    };
  }

  // 미술관 목록 (그림 많은 순)
  (function () {
    var box = $('museum-chips');
    if (!museums.length) { box.innerHTML = '<li class="empty-msg">미술관 정보를 불러오지 못했어요.</li>'; return; }
    var order = museums.map(function (m, i) { return i; }).sort(function (a, b) {
      return ((museums[b].works || []).length - (museums[a].works || []).length) || (a - b);
    });
    box.innerHTML = order.map(function (i) {
      var m = museums[i];
      return '<li><button data-i="' + i + '"><span class="nm">' + esc(m.nameKo) +
        '<span class="ct">' + esc(m.city) + (m.country ? ', ' + esc(m.country) : '') + '</span></span>' +
        '<span class="num" aria-label="그림 ' + (m.works || []).length + '점">' + (m.works || []).length + '</span></button></li>';
    }).join('');
    box.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-i]');
      if (!b) return;
      selectMuseum(museums[+b.getAttribute('data-i')], true);
    });
  })();

  function selectMuseum(m, scrollToMap) {
    if (!m) return;
    if (scrollToMap) {
      var r = wrap.getBoundingClientRect();
      if (r.top < 0 || r.bottom > window.innerHeight) wrap.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    if (!showMuseums) setLayer('museums');
    zoomTo(m.lon, m.lat, 6, null, true);
    openPanel(m);
  }

  function renderLegend() {
    legend.innerHTML = showLife
      ? '<span><i class="k-line"></i>고흐가 살던 곳 (숫자는 순서)</span>'
      : '<span><i class="k-dot"></i>미술관 (숫자는 그림 수)</span>';
  }

  function setLayer(which, noFit) {
    showMuseums = which === 'museums';
    showLife = which === 'life';
    $('toggle-museums').setAttribute('aria-pressed', showMuseums);
    $('toggle-life').setAttribute('aria-pressed', showLife);
    renderLegend();
    if (mapApi) mapApi.applyLayers();
    if (!showLife) hideLifeCard();
    if (showLife && mapApi && !noFit) mapApi.fitLife();  // 연대기에서 올 때는 그 도시로 바로 확대한다
  }
  $('toggle-museums').addEventListener('click', function () { setLayer('museums'); });
  $('toggle-life').addEventListener('click', function () { setLayer('life'); });
  renderLegend();

  function buildMap() {
    if (!window.d3 || !window.topojson || !window.WORLD_TOPO) {
      mapEl.innerHTML = '<p class="empty-msg" style="padding:24px">지도를 불러오지 못했어요. 인터넷이 연결되어 있는지 확인해 주세요.</p>';
      return;
    }
    var d3 = window.d3;
    mapEl.innerHTML = '';
    var W = Math.max(300, mapEl.clientWidth), H = Math.max(300, mapEl.clientHeight);
    var sphere = { type: 'Sphere' };
    var projection = d3.geoNaturalEarth1().fitExtent([[8, 8], [W - 8, H - 8]], sphere);
    var path = d3.geoPath(projection);
    var k = 1;
    var LABEL_K = 6;

    var svg = d3.select(mapEl).append('svg').attr('viewBox', '0 0 ' + W + ' ' + H).attr('role', 'img').attr('aria-label', '반 고흐 그림이 있는 세계 지도');
    svg.append('rect').attr('class', 'sea').attr('width', W).attr('height', H);
    var g = svg.append('g');
    var countries = topojson.feature(window.WORLD_TOPO, window.WORLD_TOPO.objects.countries).features;
    g.append('g').selectAll('path').data(countries).join('path').attr('class', 'country').attr('d', path);

    // 겹치는 점을 화면 픽셀 기준으로 살짝 벌린다 (진짜 위치에는 작은 점과 가는 선을 남긴다)
    function spread(nodes, radius) {
      var sim = d3.forceSimulation(nodes.map(function (d) { return { d: d, x: d.x * k, y: d.y * k, tx: d.x * k, ty: d.y * k }; }))
        .force('x', d3.forceX(function (n) { return n.tx; }).strength(0.7))
        .force('y', d3.forceY(function (n) { return n.ty; }).strength(0.12))
        .force('c', d3.forceCollide(function (n) { return radius(n.d) + 1.5; }).strength(0.9))
        .stop();
      for (var i = 0; i < 90; i++) sim.tick();
      sim.nodes().forEach(function (n) { n.d.dx = n.x - n.tx; n.d.dy = n.y - n.ty; });
    }

    function place(sel, kk) {
      sel.attr('transform', function (d) { return 'translate(' + (d.x + d.dx / kk) + ',' + (d.y + d.dy / kk) + ') scale(' + (1 / kk) + ')'; });
      sel.select('line.leader').attr('x1', function (d) { return -d.dx; }).attr('y1', function (d) { return -d.dy; })
        .style('display', function (d) { return Math.hypot(d.dx, d.dy) > 3 ? null : 'none'; });
      sel.select('circle.anchor').attr('cx', function (d) { return -d.dx; }).attr('cy', function (d) { return -d.dy; })
        .style('display', function (d) { return Math.hypot(d.dx, d.dy) > 3 ? null : 'none'; });
    }

    // 고흐가 살던 곳
    var lifeG = g.append('g').attr('class', 'life-layer');
    var lifePts = life.filter(function (s) { return isFinite(s.lon) && isFinite(s.lat); })
      .map(function (s, i) { var p = projection([s.lon, s.lat]); return { s: s, i: i, x: p[0], y: p[1], dx: 0, dy: 0 }; });
    var lifePath = lifeG.append('path').attr('class', 'life-path');
    var lifePins = lifeG.selectAll('g.life-pin').data(lifePts).join('g').attr('class', 'life-pin')
      .attr('tabindex', 0).attr('role', 'button').attr('aria-label', function (d) { return (d.i + 1) + '번 ' + d.s.placeKo + ', ' + d.s.years; });
    lifePins.append('line').attr('class', 'leader').attr('x2', 0).attr('y2', 0).attr('stroke', '#B23A24');
    lifePins.append('circle').attr('class', 'anchor').attr('r', 2).attr('fill', '#B23A24');
    lifePins.append('circle').attr('class', 'hit').attr('r', 22);
    lifePins.append('circle').attr('class', 'body').attr('r', 9);
    lifePins.append('text').attr('class', 'num').attr('text-anchor', 'middle').attr('dy', '0.36em').text(function (d) { return d.i + 1; });
    var lifeLbl = lifePins.append('text').attr('class', 'lbl').attr('x', 14).attr('dy', '0.35em').text(function (d) { return d.s.placeKo; });
    // 살던 곳 이름표는 차례대로 붙이되, 앞 이름표와 겹치면 숨긴다(헤이그처럼 두 번 산 곳, 네덜란드와 벨기에처럼 붙은 곳)
    function placeLifeLabels() {
      // 핀 동그라미를 먼저 자리로 잡아, 이름표가 다른 핀을 덮지 않게 한다
      var boxes = lifePts.map(function (d) {
        var x = d.x * k + d.dx, y = d.y * k + d.dy;
        return { x0: x - 9, x1: x + 9, y0: y - 9, y1: y + 9, own: d };
      });
      lifeLbl.style('display', function (d) {
        if (k < 3.5) return 'none';
        var x = d.x * k + d.dx, y = d.y * k + d.dy;
        var b = { x0: x + 11, x1: x + 16 + d.s.placeKo.length * 12.5, y0: y - 8, y1: y + 8 };
        var hit = boxes.some(function (o) { return o.own !== d && b.x0 < o.x1 && b.x1 > o.x0 && b.y0 < o.y1 && b.y1 > o.y0; });
        if (hit) return 'none';
        boxes.push(b);
        return null;
      });
    }
    lifePins.on('click', function (e, d) { e.stopPropagation(); showLifeStop(d, this); })
      .on('keydown', function (e, d) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showLifeStop(d, this); } })
      .on('mouseenter', function (e, d) { showTip(e, (d.i + 1) + '. ' + d.s.placeKo + ' (' + d.s.years + ')'); })
      .on('mousemove', function (e) { moveTip(e); })
      .on('mouseleave', hideTip);

    function showLifeStop(d, node) {
      lifePins.classed('active', false);
      d3.select(node).classed('active', true);
      var s = d.s, works = paintedAt(s);
      lifeCard.innerHTML = '<button class="close-text" aria-label="설명 닫기"><span aria-hidden="true">&times;</span></button>' +
        '<p class="lc-meta">' + (d.i + 1) + '번째 · ' + esc(s.country) + ' · ' + esc(s.years) + '</p>' +
        '<h4>' + esc(s.placeKo) + '</h4>' +
        (lifeAgeText(s) ? '<p class="lc-age">' + esc(lifeAgeText(s)) + '</p>' : '') +
        '<p>' + esc(s.story) + '</p>' + lifeWorksHTML(works);
      lifeCard.hidden = false;
      lifeCard.scrollTop = 0;
      lifeCard.querySelector('.close-text').onclick = hideLifeCard;
      bindLifeWorks(works);
      zoomTo(s.lon, s.lat, Math.max(k, 5));
    }

    // 미술관
    var musG = g.append('g').attr('class', 'museum-layer');
    var musPts = museums.filter(function (m) { return isFinite(m.lon) && isFinite(m.lat); })
      .map(function (m) { var p = projection([m.lon, m.lat]); var n = (m.works || []).length; return { m: m, n: n, x: p[0], y: p[1], dx: 0, dy: 0 }; });
    function musR(d) { var q = Math.min(Math.sqrt(d.n), 15); return k < LABEL_K ? 2.5 + q * 0.45 : 3.5 + q * 0.8; }
    var pins = musG.selectAll('g.pin').data(musPts).join('g').attr('class', 'pin')
      .attr('tabindex', 0).attr('role', 'button').attr('aria-label', function (d) { return d.m.nameKo + ', ' + d.m.city + ', 그림 ' + d.n + '점'; });
    pins.append('line').attr('class', 'leader').attr('x2', 0).attr('y2', 0);
    pins.append('circle').attr('class', 'anchor').attr('r', 1.8);
    pins.append('circle').attr('class', 'hit').attr('r', 22);
    var dots = pins.append('circle').attr('class', 'dot');
    var lbl = pins.append('text').attr('dy', '0.35em');
    lbl.append('tspan').text(function (d) { return d.m.nameKo + ' '; });
    lbl.append('tspan').attr('class', 'cnt').text(function (d) { return d.n; });
    pins.on('click', function (e, d) { e.stopPropagation(); hideTip(); selectMuseum(d.m, false); })
      .on('keydown', function (e, d) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectMuseum(d.m, false); } })
      .on('mouseenter', function (e, d) { if (!d.lab) showTip(e, d.m.nameKo + ' · ' + d.m.city + ' · ' + d.n + '점'); })
      .on('mousemove', function (e) { moveTip(e); })
      .on('mouseleave', hideTip)
      .on('focus', function (e, d) { if (!d.lab) { var r = this.getBoundingClientRect(); showTipAt(r.left + r.width / 2, r.top + 10, d.m.nameKo + ' · ' + d.n + '점'); } })
      .on('blur', hideTip);

    // 이름표는 그림이 많은 미술관부터, 서로 겹치지 않을 때만 붙인다
    function placeLabels() {
      var boxes = [];
      musPts.forEach(function (d) { d.lab = false; });
      if (k >= LABEL_K) {
        musPts.slice().sort(function (a, b) { return b.n - a.n; }).forEach(function (d) {
          var r = musR(d), x = d.x * k + d.dx + r + 5, y = d.y * k + d.dy;
          var w = (d.m.nameKo.length + String(d.n).length + 1) * 12.5, b = { x0: x - r * 2 - 6, x1: x + w, y0: y - 9, y1: y + 9 };
          var hit = boxes.some(function (o) { return b.x0 < o.x1 && b.x1 > o.x0 && b.y0 < o.y1 && b.y1 > o.y0; });
          if (!hit) { boxes.push(b); d.lab = true; }
        });
      }
      lbl.style('display', function (d) { return d.lab ? null : 'none'; });
    }

    var lastK = -1;
    function relayout() {
      var kr = Math.round(k * 20) / 20;
      if (kr !== lastK) {
        lastK = kr;
        dots.attr('r', musR);
        lbl.attr('x', function (d) { return musR(d) + 5; });
        spread(musPts, musR);
        placeLabels();
        spread(lifePts, function () { return 9; });
        placeLifeLabels();
        lifePath.attr('d', lifePts.length > 1 ? d3.line().x(function (d) { return d.x + d.dx / k; }).y(function (d) { return d.y + d.dy / k; })(lifePts) : null);
      }
      place(pins, k);
      place(lifePins, k);
      lifePath.attr('d', lifePts.length > 1 ? d3.line().x(function (d) { return d.x + d.dx / k; }).y(function (d) { return d.y + d.dy / k; })(lifePts) : null);
    }

    var zoom = d3.zoom().scaleExtent([1, 14])
      .translateExtent([[-W * .1, -H * .1], [W * 1.1, H * 1.1]])
      .on('zoom', function (e) { k = e.transform.k; g.attr('transform', e.transform); relayout(); hideTip(); });
    svg.call(zoom).on('dblclick.zoom', null);

    function centerX(shift) { return (shift && window.innerWidth > 760) ? Math.max(W * 0.3, (W - 600) / 2) : W / 2; }
    zoomTo = function (lon, lat, scale, dur, shift) {
      var p = projection([lon, lat]);
      if (!p) return;
      var t = d3.zoomIdentity.translate(centerX(shift), H / 2).scale(scale).translate(-p[0], -p[1]);
      if (dur === 0) svg.call(zoom.transform, t);
      else svg.transition().duration(dur == null ? 900 : dur).ease(d3.easeCubicInOut).call(zoom.transform, t);
    };
    var europeK = W < 600 ? 5.5 : 4.4;
    $('zoom-in').onclick = function () { svg.transition().duration(350).call(zoom.scaleBy, 1.6); };
    $('zoom-out').onclick = function () { svg.transition().duration(350).call(zoom.scaleBy, 1 / 1.6); };
    $('zoom-reset').onclick = function () { hideLifeCard(); svg.transition().duration(800).call(zoom.transform, d3.zoomIdentity); };
    $('zoom-europe').onclick = function () { zoomTo(9, 50, europeK); };

    mapApi = {
      applyLayers: function () {
        musG.style('display', showMuseums ? null : 'none');
        lifeG.style('display', showLife ? null : 'none');
      },
      setActive: function (m) { pins.classed('active', function (d) { return d.m === m; }); },
      clearLifeActive: function () { lifePins.classed('active', false); },
      openLife: function (i) {
        var node = lifePins.filter(function (d) { return d.i === i; }).node();
        if (node) showLifeStop(d3.select(node).datum(), node);
      },
      fitLife: function () {
        if (!lifePts.length) return;
        var xs = lifePts.map(function (d) { return d.x; }), ys = lifePts.map(function (d) { return d.y; });
        var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
        var s = Math.min(12, 0.7 / Math.max((x1 - x0) / W, (y1 - y0) / H, 0.01));
        var t = d3.zoomIdentity.translate(W / 2, H / 2).scale(s).translate(-(x0 + x1) / 2, -(y0 + y1) / 2);
        svg.transition().duration(900).call(zoom.transform, t);
      }
    };
    // 찾기 문제의 답이 유럽 밖이면 세계 전체로, 아니면 미술관이 가장 많이 모인 유럽으로 연다
    mapApi.questView = function (dur) {
      if (questWantsWorld()) svg.transition().duration(dur || 0).call(zoom.transform, d3.zoomIdentity);
      else zoomTo(9, 50, europeK, dur || 0);
    };
    mapApi.applyLayers();
    mapApi.questView(0);
    relayout();
    if (panelMuseum) mapApi.setActive(panelMuseum);
  }

  function showTipAt(cx, cy, text) {
    var r = wrap.getBoundingClientRect();
    tip.textContent = text;
    tip.hidden = false;
    var x = Math.min(Math.max(cx - r.left, 90), r.width - 90);
    tip.style.left = x + 'px';
    tip.style.top = Math.max(cy - r.top, 50) + 'px';
  }
  function showTip(e, text) { showTipAt(e.clientX, e.clientY, text); }
  function moveTip(e) { if (!tip.hidden) showTipAt(e.clientX, e.clientY, tip.textContent); }
  function hideTip() { tip.hidden = true; }

  buildMap();
  var lastW = mapEl.clientWidth, rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () {
      if (Math.abs(mapEl.clientWidth - lastW) > 40) { lastW = mapEl.clientWidth; hideLifeCard(); buildMap(); }
    }, 250);
  });

  /* ---------- 연대기 ---------- */
  // 정본 life(살던 곳과 해)만으로 그린다. 막대는 이 지도에 있는 그림 가운데 그 해에 그린 그림 수다.
  (function () {
    var chart = $('tl-chart'), listEl = $('tl-list'), note = $('tl-note');
    if (!chart || !listEl || !life.length) return;
    var Y0 = VG_BIRTH, Y1 = 1890;
    function span(s) {
      var ys = String(s.years || '').split('~').map(Number);
      return { a: ys[0], b: ys[1] || ys[0] };
    }
    var byYear = {}, noYear = 0;
    allWorks.forEach(function (it) {
      var y = +it.w.year;
      if (!y) { noYear++; return; }
      (byYear[y] = byYear[y] || []).push(it);
    });
    var maxN = 0, maxY = 0;
    Object.keys(byYear).forEach(function (y) { if (byYear[y].length > maxN) { maxN = byYear[y].length; maxY = +y; } });

    // 한눈에 보기: 위는 해마다 그림 수, 아래는 살던 곳의 차례
    var tip = document.createElement('div');
    tip.className = 'tl-tip'; tip.hidden = true;
    function draw() {
      var W = Math.max(640, chart.clientWidth), PAD = 24, step = (W - PAD * 2) / (Y1 - Y0 + 1);
      function x(y) { return PAD + (y - Y0 + 0.5) * step; }
      var BASE = 150, BAR_H = 104, LANE = 238, H = 286;
      var bw = Math.min(18, step - 4), out = [];
      out.push('<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" role="img" aria-label="고흐가 살던 곳과 해마다 그린 그림 수">');
      // 화가로 지낸 약 10년(소개 정본: 스물일곱 살 무렵 화가가 되어 약 10년 동안 그렸다)
      out.push('<g class="tl-span"><path d="M' + x(1880) + ' 26 V18 H' + x(Y1) + ' V26"/><text x="' + (x(1880) + x(Y1)) / 2 + '" y="12" text-anchor="middle">화가로 지낸 약 10년</text></g>');
      out.push('<line class="tl-base" x1="' + PAD + '" x2="' + (W - PAD) + '" y1="' + BASE + '" y2="' + BASE + '"/>');
      for (var y = Y0; y <= Y1; y++) {
        var n = (byYear[y] || []).length;
        if (!n) continue;
        var h = Math.max(3, n / maxN * BAR_H), x0 = x(y) - bw / 2, r = Math.min(4, bw / 2, h);
        out.push('<g class="tl-bar" data-y="' + y + '" tabindex="0" role="button" aria-label="' + y + '년, 이 지도의 그림 ' + n + '점 보기">' +
          '<rect class="hit" x="' + (x(y) - step / 2) + '" y="30" width="' + step + '" height="' + (BASE - 30) + '"/>' +
          '<path class="mark" d="M' + x0 + ' ' + BASE + ' V' + (BASE - h + r) + ' Q' + x0 + ' ' + (BASE - h) + ' ' + (x0 + r) + ' ' + (BASE - h) +
          ' H' + (x0 + bw - r) + ' Q' + (x0 + bw) + ' ' + (BASE - h) + ' ' + (x0 + bw) + ' ' + (BASE - h + r) + ' V' + BASE + ' Z"/></g>');
        if (y === maxY) out.push('<text class="tl-val" x="' + x(y) + '" y="' + (BASE - h - 6) + '" text-anchor="middle">' + n + '점</text>');
      }
      // 연도와 나이
      [Y0, 1860, 1870, 1880, Y1].forEach(function (yy) {
        out.push('<text class="tl-year" x="' + x(yy) + '" y="' + (BASE + 20) + '" text-anchor="middle">' + yy + '</text>' +
          '<text class="tl-age" x="' + x(yy) + '" y="' + (BASE + 36) + '" text-anchor="middle">' + (yy - VG_BIRTH) + '살</text>');
      });
      // 살던 곳: 한 해만 있으면 점, 여러 해면 선. 번호는 위아래로 엇갈려 겹치지 않게 한다
      out.push('<line class="tl-lane" x1="' + x(Y0) + '" x2="' + x(Y1) + '" y1="' + LANE + '" y2="' + LANE + '"/>');
      life.forEach(function (s, i) {
        var sp = span(s);
        if (!sp.a) return;
        if (sp.b > sp.a) out.push('<line class="tl-stay" x1="' + x(sp.a) + '" x2="' + x(sp.b) + '" y1="' + LANE + '" y2="' + LANE + '"/>');
        var cy = LANE + (i % 2 ? 22 : -22);
        out.push('<g class="tl-stop" data-i="' + i + '" tabindex="0" role="button" aria-label="' + (i + 1) + '번 ' + esc(s.placeKo) + ', ' + esc(s.years) + '">' +
          '<line x1="' + x(sp.a) + '" x2="' + x(sp.a) + '" y1="' + LANE + '" y2="' + cy + '"/>' +
          '<circle class="dot" cx="' + x(sp.a) + '" cy="' + LANE + '" r="3.5"/>' +
          '<circle class="hit" cx="' + x(sp.a) + '" cy="' + cy + '" r="16"/>' +
          '<circle class="num" cx="' + x(sp.a) + '" cy="' + cy + '" r="9"/>' +
          '<text x="' + x(sp.a) + '" y="' + cy + '" dy="0.36em" text-anchor="middle">' + (i + 1) + '</text></g>');
      });
      out.push('</svg>');
      chart.innerHTML = out.join('');
      chart.appendChild(tip);
      chart.scrollLeft = chart.scrollWidth;  // 폰에서 옆으로 넘길 때는 그림을 그린 마지막 10년부터 보인다
    }
    function showTip(el, text) {
      var r = el.getBoundingClientRect(), c = chart.getBoundingClientRect();
      tip.textContent = text; tip.hidden = false;
      // 차트 상자는 넘치는 부분을 자르므로, 보이는 범위 안으로 툴팁을 밀어 넣는다
      var tw = tip.offsetWidth, th = tip.offsetHeight, m = 4;
      var cx = r.left - c.left + chart.scrollLeft + r.width / 2;
      var lo = chart.scrollLeft + tw / 2 + m, hi = chart.scrollLeft + chart.clientWidth - tw / 2 - m;
      tip.style.left = Math.max(lo, Math.min(hi, cx)) + 'px';
      tip.style.top = Math.max(th + 6 + m, r.top - c.top) + 'px';
    }
    function yearList(y) { return storyFirst(byYear[y] || []); }
    function goStop(i) {
      var li = listEl.querySelector('[data-i="' + i + '"]');
      if (!li) return;
      if (i >= SHOW) setFolded(false);  // 접힌 곳이면 먼저 편다
      li.scrollIntoView({ behavior: 'smooth', block: 'center' });
      li.classList.add('flash');
      setTimeout(function () { li.classList.remove('flash'); }, 1400);
    }
    chart.addEventListener('click', function (e) {
      var b = e.target.closest('.tl-bar'), st = e.target.closest('.tl-stop');
      if (b) openLightbox(yearList(+b.getAttribute('data-y')), 0);
      if (st) goStop(+st.getAttribute('data-i'));
    });
    chart.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var t = e.target.closest('.tl-bar, .tl-stop');
      if (!t) return;
      e.preventDefault(); t.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    function hoverText(t) {
      if (t.classList.contains('tl-bar')) { var y = +t.getAttribute('data-y'); return y + '년 · ' + (y - VG_BIRTH) + '살 무렵 · 그림 ' + (byYear[y] || []).length + '점'; }
      var s = life[+t.getAttribute('data-i')]; return s.placeKo + ' · ' + s.years;
    }
    ['mouseover', 'focusin'].forEach(function (ev) {
      chart.addEventListener(ev, function (e) { var t = e.target.closest('.tl-bar, .tl-stop'); if (t) showTip(t, hoverText(t)); });
    });
    ['mouseleave', 'focusout'].forEach(function (ev) { chart.addEventListener(ev, function () { tip.hidden = true; }); });

    // 차례대로 읽는 목록. 표 대신 이 목록이 차트의 내용을 글로 담는다
    listEl.innerHTML = life.map(function (s, i) {
      var works = paintedAt(s), thumbs = works.filter(function (it) { return it.w.img; }).slice(0, 4);
      return '<li class="tl-item" data-i="' + i + '">' +
        '<div class="tl-when"><span class="tl-n">' + (i + 1) + '</span><b>' + esc(String(s.years).replace('~', '–')) + '</b>' +
          (lifeAgeText(s) ? '<span>' + esc(lifeAgeText(s)) + '</span>' : '') + '</div>' +
        '<div class="tl-what">' +
          '<h3>' + esc(s.placeKo) + '<small>' + esc(s.country) + '</small></h3>' +
          '<p>' + esc(s.story) + '</p>' +
          (thumbs.length ? '<div class="tl-thumbs">' + thumbs.map(function (it) {
            return '<button type="button" class="tl-thumb" data-w="' + works.indexOf(it) + '" aria-label="' + esc(it.w.titleKo) + ' 크게 보기">' + imgHTML(it.w) + '</button>';
          }).join('') + '</div>' : '') +
          '<div class="tl-actions">' +
            (works.length ? '<button type="button" class="textlink tl-all">여기서 그린 그림 ' + works.length + '점 보기</button>' : '') +
            '<button type="button" class="textlink tl-map">지도에서 보기</button>' +
          '</div>' +
        '</div></li>';
    }).join('');
    listEl.addEventListener('click', function (e) {
      var li = e.target.closest('.tl-item');
      if (!li) return;
      var s = life[+li.getAttribute('data-i')], works = paintedAt(s);
      var th = e.target.closest('.tl-thumb');
      if (th) { openLightbox(works, +th.getAttribute('data-w')); return; }
      if (e.target.closest('.tl-all')) { openLightbox(works, 0); return; }
      if (e.target.closest('.tl-map')) {
        setLayer('life', true);
        var r = wrap.getBoundingClientRect(), off = r.top < 0 || r.bottom > window.innerHeight;
        if (off) wrap.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(function () { if (mapApi) mapApi.openLife(+li.getAttribute('data-i')); }, off ? 700 : 0);
      }
    });
    // 폰에서는 목록을 처음 몇 곳만 보이고 접어 둔다. 그래야 그림 모음까지 내려가는 길이 짧다(접기는 CSS가 760px 이하에서만 한다)
    var more = $('tl-more'), SHOW = 3;
    function setFolded(f) {
      listEl.classList.toggle('folded', f);
      if (more) { more.hidden = !f; more.textContent = '나머지 ' + (life.length - SHOW) + '곳 더 보기'; }
    }
    if (more && life.length > SHOW + 1) {
      setFolded(true);
      more.onclick = function () {
        setFolded(false);
        var b = listEl.children[SHOW] && listEl.children[SHOW].querySelector('button');
        if (b) b.focus({ preventScroll: true });
      };
    }
    if (note) note.textContent = '막대는 이 지도에 있는 그림 가운데 그 해에 그린 그림의 수예요. 그린 해를 모르는 ' + noYear + '점은 빠져 있어요. 막대를 누르면 그 해의 그림을 볼 수 있어요.';

    draw();
    var tw = chart.clientWidth, tt;
    window.addEventListener('resize', function () {
      clearTimeout(tt);
      tt = setTimeout(function () { if (Math.abs(chart.clientWidth - tw) > 40) { tw = chart.clientWidth; draw(); } }, 250);
    });
  })();

  /* ---------- 찾기 문제 ---------- */
  // 그림 한 점의 미술관을 지도에서 찾는 문제. 문제와 힌트는 모두 데이터(제목, 나라, 도시, 미술관)로 만든다.
  // 다른 화가로 바꿀 때는 work에 그 화가 그림의 id만 넣으면 된다.
  var QUESTS = [
    { work: 'Q45585' },                                    // 별이 빛나는 밤, 뉴욕 (세계로 넓혀 보기)
    { work: 'Q154469' },                                   // 감자 먹는 사람들, 암스테르담 (유럽 안)
    { work: 'Q11275984', lead: '우리와 가까운 나라에 있어요.' } // 장미, 도쿄
  ].map(function (q) {
    var hit = allWorks.filter(function (it) { return it.w.id === q.work; })[0];
    return hit ? { w: hit.w, m: hit.m, lead: q.lead || '' } : null;
  }).filter(Boolean);
  var qi = 0, qHint = 0, qSolved = false, questBox = $('quest');

  // 받침이 있으면 앞 말, 없으면 뒷말 (은/는, 이에요/예요)
  function josa(word, withB, withoutB) {
    var c = String(word).replace(/[」)\s]+$/, '').slice(-1).charCodeAt(0);
    var has = c >= 0xAC00 && c <= 0xD7A3 && (c - 0xAC00) % 28 !== 0;
    return word + (has ? withB : withoutB);
  }
  function isFar(m) { return m.lon < -25 || m.lon > 45 || m.lat < 34; }
  // 지도가 처음 그려질 때는 QUESTS가 아직 없어서 거짓이 나온다. 문제를 만든 뒤 다시 부른다
  function questWantsWorld() { return !!(QUESTS && qi < QUESTS.length && !qSolved && isFar(QUESTS[qi].m)); }

  function renderQuest() {
    if (!questBox || !QUESTS.length) return;
    questBox.hidden = false;
    if (qi >= QUESTS.length) {
      questBox.innerHTML = '<p class="q-eyebrow">찾기 문제</p>' +
        '<p class="q-ask">' + QUESTS.length + '문제를 모두 풀었어요.</p>' +
        '<p class="q-sub">이제 마음에 드는 그림을 찾아 지도를 마음껏 다녀 보세요.</p>' +
        '<div class="q-actions"><button type="button" class="textlink" data-q="restart">처음부터 다시</button></div>';
      return;
    }
    var q = QUESTS[qi], t = '「' + q.w.titleKo + '」';
    if (qSolved) {
      questBox.innerHTML = '<p class="q-eyebrow">찾기 문제 ' + (qi + 1) + ' / ' + QUESTS.length + '</p>' +
        '<p class="q-ask">맞았어요!</p>' +
        '<p class="q-sub">' + esc(josa(t, '은', '는')) + ' ' + esc(q.m.country) + ' ' + esc(q.m.city) + '의 ' + esc(q.m.nameKo) + '에 있어요.</p>' +
        '<div class="q-actions"><button type="button" class="textlink" data-q="next">' + (qi + 1 < QUESTS.length ? '다음 문제' : '마치기') + '</button></div>';
      return;
    }
    var hints = [];
    if (qHint >= 1) hints.push(esc(q.m.country) + '에 있어요.' + (isFar(q.m) ? ' 「세계 전체 보기」를 누르면 찾기 쉬워요.' : ''));
    if (qHint >= 2) hints.push(esc(q.m.city) + '에 있는 ' + esc(josa(q.m.nameKo, '이에요', '예요')) + '.');
    questBox.innerHTML = '<p class="q-eyebrow">찾기 문제 ' + (qi + 1) + ' / ' + QUESTS.length + '</p>' +
      '<p class="q-ask">' + esc(josa(t, '은', '는')) + ' 어느 미술관에 있을까요?</p>' +
      '<p class="q-sub">' + (q.lead ? esc(q.lead) + ' ' : '') + '지도에서 찾아 눌러 보세요.</p>' +
      hints.map(function (h) { return '<p class="q-hint">' + h + '</p>'; }).join('') +
      '<div class="q-actions">' +
        (qHint < 2 ? '<button type="button" class="textlink" data-q="hint">힌트 보기</button>' : '') +
        '<button type="button" class="textlink" data-q="skip">건너뛰기</button>' +
      '</div>';
  }
  function questCheck(m) {
    if (!questBox || qSolved || qi >= QUESTS.length || QUESTS[qi].m !== m) return;
    qSolved = true;
    renderQuest();
    var list = storyFirst(museumList(m)), w = QUESTS[qi].w, idx = 0;
    list.forEach(function (it, i) { if (it.w === w) idx = i; });
    setTimeout(function () { openLightbox(list, idx); }, 400);  // 찾은 그림을 크게 보여 준다
  }
  if (questBox) {
    questBox.setAttribute('tabindex', '-1');
    questBox.setAttribute('aria-live', 'polite');
    questBox.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-q]');
      if (!b) return;
      var act = b.getAttribute('data-q');
      if (act === 'hint') qHint++;
      if (act === 'skip' || act === 'next') { qi++; qHint = 0; qSolved = false; }
      if (act === 'restart') { qi = 0; qHint = 0; qSolved = false; }
      renderQuest();
      if (act !== 'hint' && mapApi && mapApi.questView && !showLife) mapApi.questView(800);  // 다음 문제에 맞는 배율로
      var nb = questBox.querySelector('button[data-q]');
      if (nb) nb.focus({ preventScroll: true });
    });
    window.addEventListener('vg:quest', function () {
      setTimeout(function () { questBox.focus({ preventScroll: true }); }, 600);
    });
    renderQuest();
    if (mapApi && mapApi.questView) mapApi.questView(0);
  }

  /* ---------- 한국에서 가장 가까운 곳 ---------- */
  // 데이터에 한국 미술관이 없으면, 서울에서 가장 가까운 미술관과 그 나라의 수를 데이터로 계산해 알려 준다
  (function () {
    var box = $('map-near');
    if (!box) return;
    var list = museums.filter(function (m) { return isFinite(m.lat) && isFinite(m.lon); });
    if (!list.length || list.some(function (m) { return m.country === '한국' || m.country === '대한민국'; })) return;
    var SEOUL = { lat: 37.5665, lon: 126.978 };
    function rad(x) { return x * Math.PI / 180; }
    function km(m) {
      var a = Math.pow(Math.sin(rad(m.lat - SEOUL.lat) / 2), 2) +
        Math.cos(rad(SEOUL.lat)) * Math.cos(rad(m.lat)) * Math.pow(Math.sin(rad(m.lon - SEOUL.lon) / 2), 2);
      return 6371 * 2 * Math.asin(Math.sqrt(a));
    }
    var near = list.slice().sort(function (a, b) { return km(a) - km(b); })[0];
    var same = list.filter(function (m) { return m.country === near.country; });
    var works = same.reduce(function (n, m) { return n + (m.works || []).length; }, 0);
    box.innerHTML = '이 지도에는 아직 한국 미술관이 없어요. 서울에서 가장 가까운 곳은 ' +
      esc(near.country) + ' ' + esc(near.city) + '의 ' + esc(josa(near.nameKo, '이에요', '예요')) + '. ' +
      '이 지도에서 ' + esc(near.country) + '에는 ' + same.length + '곳에 그림 ' + works + '점이 있어요. ' +
      '<button type="button" class="textlink" id="map-near-go">' + esc(near.country) + ' 지도에서 보기</button>';
    box.hidden = false;
    $('map-near-go').onclick = function () {
      var lon = same.reduce(function (n, m) { return n + m.lon; }, 0) / same.length;
      var lat = same.reduce(function (n, m) { return n + m.lat; }, 0) / same.length;
      if (!showMuseums) setLayer('museums');
      var r = wrap.getBoundingClientRect(), off = r.top < 0 || r.bottom > window.innerHeight;
      if (off) wrap.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // 스크롤과 확대가 겹치면 확대가 중간에 끊겨서, 스크롤이 끝난 뒤 확대한다. 6배부터 미술관 이름이 보인다(LABEL_K)
      setTimeout(function () { zoomTo(lon, lat, 6.5); }, off ? 600 : 0);  // 딱 6이면 소수점 오차로 이름표 조건에 걸리지 않을 수 있어 6.5로 둔다
    };
  })();

  /* ---------- 딥링크: ?museum=<id>&work=<번호> ---------- */
  (function () {
    var q;
    try { q = new URLSearchParams(location.search); } catch (err) { return; }
    var id = q.get('museum');
    if (!id) return;
    var ALIAS = { vgm: 'Van Gogh Museum', kmm: 'Kröller-Müller', orsay: "Musée d'Orsay", 'ng-london': 'The National Gallery',
      moma: 'MoMA', guggenheim: 'Guggenheim', met: 'Metropolitan', aic: 'Art Institute of Chicago', nga: 'National Gallery of Art',
      'neue-pinakothek': 'Neue Pinakothek', pushkin: 'Pushkin', getty: 'Getty', 'nmwa-tokyo': 'National Museum of Western Art' };
    var m = museums.filter(function (x) { return x.id === id; })[0];
    if (!m && ALIAS[id]) {
      m = museums.filter(function (x) { return (x.nameEn || '') === ALIAS[id]; })[0] ||
        museums.filter(function (x) { return (x.nameEn || '').indexOf(ALIAS[id]) >= 0; })[0];
    }
    if (!m) return;
    var sec = $('map-section');
    if (sec) sec.scrollIntoView({ behavior: 'auto', block: 'start' });
    selectMuseum(m, false);
    var wi = q.get('work');
    if (wi != null && wi !== '' && isFinite(+wi) && (m.works || []).length) {
      openLightbox(museumList(m), Math.max(0, Math.min(+wi, m.works.length - 1)));
    }
  })();
})();
