/* intro.js : "반 고흐의 하루" 30초 목판화(리노컷) 인트로 필름
   사용법: window.VGIntro.mount(containerEl)
   - 모든 그림은 canvas 코드로 직접 그린다(외부 이미지 없음).
   - 네 가지 잉크(먹, 울트라마린, 크롬 옐로, 종이) + 주홍 한 점(1853 낙관).
   - 판(plate)별로 따로 찍고 1~2px 어긋나게 겹친다. 12fps(on twos)로 찍고 시간은 정밀 시계로 잰다.
   - 시드 난수: 같은 t는 항상 같은 프레임.
   디버그: ?introT=12.5 (그 시점 정지 화면, 소리 없음), ?introOnly=1 (영상만 창 가득) */
(function () {
  'use strict';

  var W = 1280, H = 720, DUR = 30, BT = 60 / 104, HZ = 430;
  var INK = { K: '#141210', B: '#1E3A9E', Y: '#EDB51C', R: '#C8452C', P: '#EFE5CF' };
  var FONT = '"Pretendard Variable", Pretendard, "Noto Sans KR", system-ui, sans-serif';
  var PHRASES = [
    [0.0, 2.4, '안녕, 친구들!'],
    [2.9, 5.2, '화가 빈센트 반 고흐를 만나러 가 볼까요?'],
    [5.9, 9.3, '고흐는 1853년, 네덜란드에서 태어났어요.'],
    [9.8, 13.2, '해바라기, 밀밭, 반짝이는 별밤을 그렸어요.'],
    [13.7, 17.2, '10년 동안 그린 그림이 무려 2,100점이나 된대요!'],
    [17.7, 20.2, '지금 그 그림들은 전 세계 미술관에 있어요.'],
    [20.7, 23.6, '자, 지도를 눌러서 그림을 찾아 떠나 봐요!']
  ];

  /* ---------- 난수 / 보간 ---------- */
  function mb(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  var BOIL = 0, TS = 0, TSTEP = 0;
  function rs(seed) { return mb(Math.imul(seed | 0, 2654435761) ^ 0x9e3779b9); }
  function rb(seed) { return mb(Math.imul((seed | 0) + BOIL * 7919, 2246822519) ^ 0x85ebca6b); }
  function cl(x, a, b) { return x < a ? a : x > b ? b : x; }
  function sat(x) { return cl(x, 0, 1); }
  function lerp(a, b, k) { return a + (b - a) * k; }
  function seg(t, a, b) { return sat((t - a) / (b - a)); }
  function eo(k) { k = sat(k); return 1 - Math.pow(1 - k, 3); }
  function ei(k) { k = sat(k); return k * k * k; }
  function eio(k) { k = sat(k); return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; }
  function back(k) { k = sat(k); var c = 1.9; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); }
  function mk(w, h) { var c = document.createElement('canvas'); c.width = Math.max(1, w | 0); c.height = Math.max(1, h | 0); return c; }

  /* ---------- 판(plate) ---------- */
  var B, Y, R, K, PL = [];
  function cut(c, fn) { c.save(); c.globalCompositeOperation = 'destination-out'; c.fillStyle = '#000'; c.strokeStyle = '#000'; fn(c); c.restore(); }
  function cutAll(fn) { for (var i = 0; i < PL.length; i++) cut(PL[i], fn); }
  function push(x, y, s, rot) { for (var i = 0; i < PL.length; i++) { var c = PL[i]; c.save(); c.translate(x, y); if (rot) c.rotate(rot); if (s != null && s !== 1) c.scale(s, s); } }
  function pop() { for (var i = 0; i < PL.length; i++) PL[i].restore(); }

  /* ---------- 조각칼 획 ---------- */
  // pts: [x0,y0,x1,y1,...] 끝은 뾰족하게 들어가고 날 끝은 뭉툭하게 빠지는 칼자국
  function gouge(c, pts, w, seed, flat) {
    var n = pts.length / 2; if (n < 2) return;
    var r = rb(seed), L = [], Rr = [], i;
    for (i = 0; i < n; i++) {
      var i0 = Math.max(0, i - 1), i1 = Math.min(n - 1, i + 1);
      var dx = pts[i1 * 2] - pts[i0 * 2], dy = pts[i1 * 2 + 1] - pts[i0 * 2 + 1], d = Math.hypot(dx, dy) || 1;
      var nx = -dy / d, ny = dx / d, k = i / (n - 1);
      var hw = flat ? 1 : Math.pow(Math.sin(Math.PI * (0.02 + 0.9 * k)), 0.55) * (0.7 + 0.5 * k);
      hw *= w * 0.5 * (0.78 + r() * 0.44);
      var jx = (r() - 0.5) * 0.7, jy = (r() - 0.5) * 0.7;
      L.push(pts[i * 2] + nx * hw + jx, pts[i * 2 + 1] + ny * hw + jy);
      Rr.push(pts[i * 2] - nx * hw + jx, pts[i * 2 + 1] - ny * hw + jy);
    }
    c.beginPath(); c.moveTo(L[0], L[1]);
    for (i = 1; i < n; i++) c.lineTo(L[i * 2], L[i * 2 + 1]);
    for (i = n - 1; i >= 0; i--) c.lineTo(Rr[i * 2], Rr[i * 2 + 1]);
    c.closePath(); c.fill();
  }
  function sline(c, x1, y1, x2, y2, w, seed, bend, segs, flat) {
    segs = segs || 5; bend = bend || 0;
    var dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d, r = rb(seed + 5), p = [];
    for (var i = 0; i <= segs; i++) {
      var k = i / segs, b = bend * 4 * k * (1 - k) * d, j = (r() - 0.5) * Math.min(2.2, d * 0.03);
      p.push(x1 + dx * k + nx * (b + j), y1 + dy * k + ny * (b + j));
    }
    gouge(c, p, w, seed, flat);
  }
  // 거친 다각형: 변을 잘게 나누고 수직으로 떨린다
  function rpath(c, pts, seed, amp, step) {
    var r = rb(seed), n = pts.length / 2, first = true; step = step || 10; amp = amp == null ? 1.2 : amp;
    c.beginPath();
    for (var i = 0; i < n; i++) {
      var x1 = pts[i * 2], y1 = pts[i * 2 + 1], j = (i + 1) % n, x2 = pts[j * 2], y2 = pts[j * 2 + 1];
      var dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy), m = Math.max(1, Math.round(d / step)), nx = d ? -dy / d : 0, ny = d ? dx / d : 0;
      for (var s = 0; s < m; s++) {
        var k = s / m, o = s === 0 ? 0 : (r() - 0.5) * 2 * amp, X = x1 + dx * k + nx * o, Y_ = y1 + dy * k + ny * o;
        if (first) { c.moveTo(X, Y_); first = false; } else c.lineTo(X, Y_);
      }
    }
    c.closePath();
  }
  function rfill(c, pts, seed, amp, step) { rpath(c, pts, seed, amp, step); c.fill(); }
  function rrect(c, x, y, w, h, seed, amp) { rfill(c, [x, y, x + w, y, x + w, y + h, x, y + h], seed, amp == null ? 1.2 : amp, 9); }
  function rcircPath(c, x, y, rad, seed, amp, ccw) {
    var r = rb(seed), n = cl(Math.round(rad * 0.7), 10, 64); amp = amp == null ? Math.min(1.6, rad * 0.08) : amp;
    for (var i = 0; i < n; i++) {
      var a = (ccw ? -1 : 1) * i / n * Math.PI * 2, rr = rad + (r() - 0.5) * 2 * amp, X = x + Math.cos(a) * rr, Y_ = y + Math.sin(a) * rr;
      if (i) c.lineTo(X, Y_); else c.moveTo(X, Y_);
    }
    c.closePath();
  }
  function rcirc(c, x, y, rad, seed, amp) { c.beginPath(); rcircPath(c, x, y, rad, seed, amp); c.fill(); }
  function rring(c, x, y, r1, r2, seed) { c.beginPath(); rcircPath(c, x, y, r2, seed, 0.8); rcircPath(c, x, y, r1, seed + 1, 0.6, true); c.fill('evenodd'); }
  function arcPts(x, y, rad, a0, a1, n) { var p = []; for (var i = 0; i <= n; i++) { var a = a0 + (a1 - a0) * i / n; p.push(x + Math.cos(a) * rad, y + Math.sin(a) * rad); } return p; }
  // 글자에 칼자국을 낸다
  function carveText(c, x, y, w, h, count, seed, wmax) {
    var r = rs(seed);
    cut(c, function (cc) {
      for (var i = 0; i < count; i++) {
        var sx = x + r() * w, sy = y + r() * h, len = 8 + r() * 30, ww = 1 + r() * (wmax || 2.2);
        sline(cc, sx, sy, sx + len, sy + (r() - 0.5) * 5, ww, seed + i * 3, 0.06, 3);
      }
    });
  }

  /* ---------- 장면 데이터 ---------- */
  function hillY(x) { return HZ - 16 - 12 * Math.sin(x * 0.0062 + 1.3) - 7 * Math.sin(x * 0.019 + 0.4) - 4 * Math.sin(x * 0.051); }
  var SUN = [1050, 205];
  function nightK(t) { return eo(seg(t, 11.54, 12.0)); }
  function flood(t) { return nightK(t) * 2500 - 120; } // v = x + (H - y) * 1.1 < flood 이면 밤
  function vDiag(x, y) { return x + (H - y) * 1.1; }

  // 별 14개(하늘 위치) 와 미술관 도시 14곳
  var STARS = [[300, 92, 15], [452, 52, 11], [566, 138, 16], [712, 64, 12], [850, 150, 18], [930, 52, 10], [1180, 300, 12],
    [655, 300, 10], [395, 248, 12], [300, 330, 9], [820, 300, 12], [1200, 60, 10], [268, 40, 10], [990, 335, 9]];
  var CITIES = [['암스테르담', 4.90, 52.37], ['파리', 2.35, 48.86], ['런던', -0.13, 51.51], ['뉴욕', -73.97, 40.78], ['도쿄', 139.69, 35.69],
    [null, 11.58, 48.14], [null, 8.54, 47.37], [null, -87.62, 41.88], [null, -118.47, 34.08], [null, 37.62, 55.75],
    [null, 30.31, 59.94], [null, -46.65, -23.56], [null, 144.96, -37.82], [null, 132.45, 34.39]];
  var AMS = [4.90, 52.37];
  function proj0(lon, lat) {
    var x = 40 + (lon + 130) * 4.3, y = 96 + (72 - lat) * 4.3;
    var cx = 40 + (AMS[0] + 130) * 4.3, cy = 96 + (72 - AMS[1]) * 4.3, dx = x - cx, dy = y - cy, d = Math.hypot(dx, dy), RR = 180;
    if (d < RR && d > 0) { var u = d / RR, g = 1 - Math.pow(1 - u, 2.6); x = cx + dx / d * g * RR; y = cy + dy / d * g * RR; }
    return [x, y];
  }
  var CITY_XY = CITIES.map(function (c) { return proj0(c[1], c[2]); });
  // 별 -> 도시 짝: x 순서대로 짝지어 선이 덜 엉키게
  var STAR_TO_CITY = (function () {
    var si = STARS.map(function (s, i) { return i; }).sort(function (a, b) { return STARS[a][0] - STARS[b][0]; });
    var ci = CITIES.map(function (c, i) { return i; }).sort(function (a, b) { return CITY_XY[a][0] - CITY_XY[b][0]; });
    var m = []; for (var k = 0; k < si.length; k++) m[si[k]] = ci[k]; return m;
  })();

  var CONT = [
    [-168, 65, -162, 70, -150, 71, -140, 70, -128, 70, -115, 72, -95, 72, -82, 70, -78, 62, -88, 63, -94, 58, -82, 55, -78, 52, -70, 60, -62, 58, -56, 52, -60, 47, -66, 44, -70, 42, -74, 40, -76, 36, -81, 31, -80, 25, -82, 27, -84, 30, -89, 30, -94, 29.5, -97, 27, -97, 22, -95, 18.5, -91, 18.5, -88, 21, -87, 15.5, -83, 15, -83, 10, -79, 9, -77, 8, -82, 8.5, -86, 12, -92, 14.5, -96, 15.7, -105, 20, -106, 23, -110, 24, -112, 29, -114, 31, -117, 32.5, -120, 34.5, -124, 40, -124, 47, -126, 50, -132, 55, -140, 59.5, -147, 61, -153, 59, -158, 57, -164, 55, -157, 58.5, -162, 60, -166, 62],
    [-55, 60, -43, 60, -38, 65, -22, 70, -20, 76, -18, 80, -30, 83, -50, 82, -64, 79, -72, 77, -58, 75, -54, 70, -52, 65],
    [-80, 9, -76, 11, -72, 12, -64, 10.5, -60, 8, -52, 4, -50, 0, -44, -2.5, -38, -4, -35, -6, -35, -9, -39, -15, -40, -22, -44, -23, -48, -26, -49, -29, -53, -34, -57, -35, -58, -38, -62, -39, -65, -42, -64, -46, -68, -50, -69, -53, -74, -53, -75, -48, -73, -43, -73, -37, -71, -30, -70, -20, -71, -17, -76, -14, -78, -10, -81, -6, -80, -2, -80, 1, -78, 3, -77, 7],
    [-9, 37, -9, 43, -2, 43.5, -1.5, 46, -4.5, 48, -1.5, 49, 2, 51, 4.5, 52.5, 8, 54, 8.5, 57, 10.5, 57.5, 10.5, 55, 13, 55, 14, 54, 18, 54.5, 21, 56.5, 24, 59.5, 29, 60, 23, 61, 21.5, 63.5, 25, 65.5, 22, 66, 18, 63, 17, 61, 19, 60, 16.5, 57, 12.5, 56, 10.5, 59, 6, 58, 5, 61, 8, 63.5, 13, 67, 17, 69, 21, 70, 26, 71, 31, 70, 40, 67, 44, 68, 52, 68, 60, 69.5, 68, 71, 75, 73, 82, 73, 90, 75.5, 100, 76.5, 112, 75, 120, 73, 130, 71, 140, 72, 150, 71, 160, 70, 170, 70, 180, 68.5, 180, 65, 177, 62.5, 170, 60, 163, 59.5, 162, 56, 156, 51, 156, 57, 160, 61, 154, 59, 143, 59, 137, 54, 141, 52, 140, 48, 136, 43.5, 132, 43, 129, 41, 129.5, 35, 126.5, 34.5, 126, 37.5, 124.5, 40, 121, 40.5, 122, 37, 119, 35, 121, 32, 122, 30, 120, 26, 116.5, 23, 110, 21, 108, 21.5, 106, 19, 109, 12, 105, 9, 103, 10.5, 100, 13.5, 99, 10, 100.5, 7, 103.5, 1.5, 101, 2.5, 98.5, 8, 98, 16, 94.5, 16, 92, 21, 88.5, 22, 87, 21, 85, 19, 80.5, 15.5, 80, 10, 77.5, 8, 76, 11, 73, 17, 72.5, 21, 70, 22.5, 67, 24.8, 62, 25, 57.5, 25.7, 56.5, 27, 52, 27.8, 50, 30, 48, 30, 48.5, 28, 51, 24.5, 51.5, 24, 56, 26, 56.5, 24, 59.5, 22.5, 57.5, 19, 52, 16, 45, 13, 43, 13, 39, 21, 35, 28, 32.5, 30, 34.5, 31.5, 35, 36, 36, 36.8, 30, 36.5, 27, 37, 26, 40, 23, 40, 24, 38, 22, 36.5, 21, 38.5, 19.5, 41.5, 15.5, 44.5, 13.5, 45.5, 12.5, 44, 14, 42, 16, 41.5, 18.5, 40, 16, 38, 15.7, 40, 12, 42, 10, 44, 6.5, 43, 3, 43, 3.2, 41.8, 0, 39.5, -0.5, 38, -2, 36.8, -5.5, 36],
    [-17, 14.7, -17, 21, -15, 24, -13, 27.5, -10, 29.5, -9.5, 32, -6, 35.8, -2, 35, 3, 36.8, 10, 37.2, 11, 35, 10, 33.8, 15, 32, 20, 31, 20, 32.8, 25, 31.8, 32, 31, 34, 28, 37, 22, 39, 16, 43, 12.5, 51, 12, 51, 10, 48, 5, 41, -1.5, 39.5, -6, 40, -11, 40.5, -15.5, 35, -22, 35, -24.5, 33, -26, 32, -29, 28, -33, 25, -34, 20, -34.8, 18, -32, 17, -29, 15, -26, 12, -18, 13.5, -11, 12, -5, 9, -1, 9.5, 3.5, 6, 4.3, 2, 6.2, -2, 4.8, -7.5, 4.3, -11, 7, -13.5, 9.5, -16.5, 12.5],
    [-5.7, 50.1, -1, 50.7, 1.4, 51.3, 1.7, 52.7, 0, 53.5, -1.5, 55, -2, 56, -1.8, 57.6, -3.5, 58.6, -5, 58.6, -6, 57, -5.5, 56, -4.9, 54.8, -3.2, 54.1, -3, 53.4, -4.6, 52.8, -4.2, 51.6, -5.3, 51.7],
    [-10, 51.6, -6, 52, -6, 54, -7.5, 55.2, -10, 54.2],
    [130, 31.2, 131.5, 33.5, 133.5, 34, 135.2, 33.5, 137, 34.5, 139, 34.8, 140.8, 35.7, 141, 38.5, 142, 40, 141.5, 41.5, 143.2, 42, 145.5, 43.3, 145, 44.2, 142, 45.4, 141.2, 43.3, 140, 42, 140, 40.5, 139.8, 38.5, 138.5, 37.5, 136.8, 37, 136, 36, 133, 35.5, 131, 34.5, 129.8, 33.2],
    [114, -22, 116, -20.5, 122, -17.5, 126, -14, 129.5, -15, 130.5, -12.3, 133, -11.5, 136.5, -12, 136.8, -15.8, 139.5, -17.5, 141.5, -12.5, 142.5, -10.8, 143.5, -14, 145.5, -15, 146.5, -19, 149.5, -22.5, 153, -25, 153.5, -28.5, 152.5, -32.5, 150, -37.3, 146.5, -39, 144, -38.3, 141, -38, 139.5, -36.5, 138, -35, 135.5, -34.8, 134, -32.5, 131, -31.5, 126, -32.2, 123.5, -34, 119.5, -34.4, 115, -34.2, 115.6, -31.5, 114, -26.5, 113.5, -24],
    [95.5, 5.5, 98, 4, 104, -2, 106, -6, 101, -3, 97, 2],
    [109, 1.5, 113, 4, 117, 7, 119, 5, 118, 1, 116, -3.8, 111, -3, 109.5, -1],
    [105.5, -6.5, 111, -6.5, 114.5, -7.5, 108, -7.8],
    [131, -1, 138, -1.5, 144, -3.5, 147.5, -6, 150, -10.5, 143, -9, 141, -9.2, 138, -8, 134.5, -4],
    [44, -25, 47, -25, 50.5, -15.5, 49.5, -12, 44, -17],
    [-24, 64, -22, 66.3, -16, 66.5, -13.5, 65, -18, 63.4],
    [120, 18.5, 122, 18.5, 124, 12.5, 126, 7, 125, 6, 122, 7, 120, 14],
    [-85, 22, -80, 23.2, -74, 20.2, -77.5, 20, -82, 22.5]
  ];

  /* ---------- 하늘 ---------- */
  function drawSky(t) {
    var nf = nightK(t), fl = flood(t);
    if (nf > 0) {
      B.save(); B.beginPath(); B.rect(0, 0, W, HZ + 8); B.clip();
      if (nf >= 1) B.fillRect(0, 0, W, HZ + 8);
      else {
        var xt = fl - (H + 60) * 1.1, xb = fl - (H - HZ - 30) * 1.1;
        rfill(B, [-60, -60, xt, -60, xb, HZ + 30, -60, HZ + 30], 301, 7, 14);
      }
      B.restore();
    }
    if (nf < 1) { // 새벽 하늘의 가는 칼자국
      var r = rs(310);
      for (var i = 0; i < 30; i++) {
        var x = r() * W, y = 24 + r() * 330, len = 40 + r() * 150, w = 1.4 + r() * 1.8, bd = (r() - 0.5) * 0.06;
        if (Math.hypot(x + len / 2 - SUN[0], y - SUN[1]) < 170) continue;
        if (nf > 0 && vDiag(x, y) < fl) continue;
        sline(K, x, y, x + len, y + (r() - 0.5) * 4, w, 320 + i, bd, 6);
      }
    }
  }

  function drawSun(t) {
    var fl = flood(t), x = SUN[0];
    var y = lerp(452, SUN[1], eo(seg(t, 2.95, 4.5)));
    var night = nightK(t) > 0 && vDiag(x, y) < fl;
    var rot = TS * 0.06;
    if (!night) {
      var k = eo(seg(t, 2.95, 3.75));
      if (k > 0) {
        Y.save(); K.save(); Y.beginPath(); Y.rect(0, 0, W, hillY(x) + 4); Y.clip(); K.beginPath(); K.rect(0, 0, W, hillY(x) + 4); K.clip();
        var r = rs(410);
        for (var i = 0; i < 28; i++) {
          var a = rot + i / 28 * Math.PI * 2, lg = i % 4 === 0 ? 1 : i % 2 === 0 ? 0.62 : 0.4, r0 = 76, r1 = r0 + (60 + 120 * lg + r() * 26) * k;
          if (i % 2 === 0) {
            var da = 0.055 + 0.03 * lg;
            rfill(Y, [x + Math.cos(a - da) * r0, y + Math.sin(a - da) * r0, x + Math.cos(a) * r1, y + Math.sin(a) * r1, x + Math.cos(a + da) * r0, y + Math.sin(a + da) * r0], 420 + i, 1, 8);
          } else {
            sline(K, x + Math.cos(a) * (r0 + 4), y + Math.sin(a) * (r0 + 4), x + Math.cos(a) * (r1 - 10), y + Math.sin(a) * (r1 - 10), 3.2, 440 + i, 0.03, 5);
          }
        }
        Y.restore(); K.restore();
      }
      rcirc(Y, x, y, 62, 401, 1.4);
      // 해 안쪽의 동심 칼자국
      K.save(); K.beginPath(); K.rect(0, 0, W, hillY(x) + 2); K.clip();
      gouge(K, arcPts(x, y, 30, rot * 2 + 0.3, rot * 2 + 4.1, 16), 3, 461);
      gouge(K, arcPts(x, y, 47, -rot * 2 + 2.2, -rot * 2 + 7.0, 22), 3.4, 462);
      gouge(K, arcPts(x, y, 14, rot * 3, rot * 3 + 3.2, 8), 2.6, 463);
      K.restore();
    } else {
      // 초승달 + 종이색 달무리
      rcirc(Y, x, y, 46, 470, 1);
      cut(Y, function (c) { rcirc(c, x + 19, y - 12, 41, 471, 1); });
      cut(B, function (c) {
        gouge(c, arcPts(x, y, 66, rot + 0.2, rot + 2.4, 18), 3, 472);
        gouge(c, arcPts(x, y, 70, rot + 3.0, rot + 5.4, 18), 3, 473);
        gouge(c, arcPts(x, y, 92, -rot + 1.0, -rot + 2.9, 18), 2.4, 474);
        gouge(c, arcPts(x, y, 96, -rot + 4.0, -rot + 5.6, 14), 2.4, 475);
      });
      gouge(Y, arcPts(x, y, 80, rot * 1.5 + 0.9, rot * 1.5 + 3.6, 20), 4, 476);
      gouge(Y, arcPts(x, y, 82, rot * 1.5 + 4.2, rot * 1.5 + 6.0, 16), 4, 477);
    }
  }

  // 별밤 소용돌이: 파란 판에 종이색 칼자국과 노란 획
  var VORT = [[540, 190, 95, 1], [770, 140, 72, -1]];
  function flow(x, y) {
    var vx = 1, vy = 0.3 * Math.sin(x * 0.011 + y * 0.02);
    for (var i = 0; i < VORT.length; i++) {
      var v = VORT[i], dx = x - v[0], dy = y - v[1], s = v[2], w = 2.4 * Math.exp(-(dx * dx + dy * dy) / (s * s));
      vx += -dy / s * w * v[3]; vy += dx / s * w * v[3];
    }
    var m = Math.hypot(vx, vy) || 1; return [vx / m, vy / m];
  }
  function drawSwirl(t) {
    if (nightK(t) <= 0) return;
    var fl = flood(t), grow = eo(seg(t, 11.7, 12.8)), spin = (t - 11.6) * 0.22;
    B.save(); Y.save();
    B.beginPath(); B.rect(0, 0, W, HZ - 6); B.clip(); Y.beginPath(); Y.rect(0, 0, W, HZ - 6); Y.clip();
    var r = rs(4242);
    for (var i = 0; i < 170; i++) {
      var x0 = r() * W, y0 = 8 + r() * (HZ - 70), kind = r(), w = 2 + r() * 1.9, steps = 4 + Math.floor(r() * 4), dl = r() * 0.5;
      if (Math.hypot(x0 - SUN[0], y0 - SUN[1]) < 105) continue;
      if (vDiag(x0, y0) > fl - 60) continue;
      if (t < 11.6 + dl + (vDiag(x0, y0) / 2400) * 0.4) continue;
      for (var q = 0; q < VORT.length; q++) {
        var v = VORT[q], dx = x0 - v[0], dy = y0 - v[1], d = Math.hypot(dx, dy);
        if (d < v[2] * 1.6) { var a = Math.atan2(dy, dx) + spin * v[3] * (1 - d / (v[2] * 1.6)); x0 = v[0] + Math.cos(a) * d; y0 = v[1] + Math.sin(a) * d; }
      }
      var pts = [x0, y0], px = x0, py = y0, n = Math.max(2, Math.round(steps * grow));
      for (var s = 0; s < n; s++) { var f = flow(px, py); px += f[0] * 8; py += f[1] * 8; pts.push(px, py); }
      if (kind < 0.66) { cut(B, function (c) { gouge(c, pts, w, 4300 + i); }); }
      else gouge(Y, pts, w * 0.95, 4300 + i);
    }
    // 소용돌이 중심의 나선
    for (q = 0; q < VORT.length; q++) {
      v = VORT[q];
      if (vDiag(v[0], v[1]) > fl) continue;
      for (var j = 0; j < 3; j++) {
        var sp = [], turns = (1.1 + j * 0.25) * Math.PI * 2 * grow, a0 = spin * 2 * v[3] + j * 2.1;
        for (var m = 0; m <= 30; m++) { var u = m / 30, an = a0 + v[3] * u * turns, rad = v[2] * (0.12 + 0.2 * j) + u * v[2] * 0.42; sp.push(v[0] + Math.cos(an) * rad, v[1] + Math.sin(an) * rad * 0.82); }
        if (j === 1) gouge(Y, sp, 4.2, 4600 + q * 10 + j); else cut(B, function (c) { gouge(c, sp, 4.6, 4600 + q * 10 + j); });
      }
    }
    B.restore(); Y.restore();
  }

  function starAt(x, y, r, rot, m, halo, seed) {
    if (halo > 0.05) {
      cut(B, function (c) {
        for (var k = 0; k < 3; k++) gouge(c, arcPts(x, y, r * 1.8, rot * 0.6 + k * 2.1, rot * 0.6 + k * 2.1 + 1.3, 10), 2.4 * halo, seed + k);
      });
    }
    var turns = 2.3 * (1 - m * 0.85);
    if (turns > 0.15) {
      var pts = [], N = 26;
      for (var j = 0; j <= N; j++) { var u = j / N, a = rot + u * turns * Math.PI * 2; var rad = r * (0.55 + 0.75 * u); pts.push(x + Math.cos(a) * rad, y + Math.sin(a) * rad); }
      gouge(Y, pts, Math.max(2, r * 0.24), seed + 7);
    }
    rcirc(Y, x, y, r * 0.5, seed + 9, 0.8);
  }
  function drawSkyStars(t) {
    if (nightK(t) <= 0) return;
    for (var i = 0; i < STARS.length; i++) {
      var s = STARS[i], start = 11.62 + vDiag(s[0], s[1]) / 2400 * 0.45, ig = back(seg(t, start, start + 0.32));
      if (ig <= 0) continue;
      starAt(s[0], s[1], s[2] * ig, TS * 0.7 * (i % 2 ? 1 : -1) + i, 0, 1, 5000 + i * 20);
    }
  }

  /* ---------- 땅 ---------- */
  function drawHills() {
    var p = [];
    for (var x = -10; x <= W + 10; x += 16) p.push(x, hillY(x));
    p.push(W + 10, HZ + 14, -10, HZ + 14);
    rfill(K, p, 501, 1.2, 8);
    var r = rs(510);
    cut(K, function (c) {
      for (var i = 0; i < 34; i++) {
        var x0 = r() * W, y0 = hillY(x0) + 7 + r() * 12, len = 14 + r() * 40;
        sline(c, x0, y0, x0 + len, y0 + (r() - 0.5) * 3, 1.4 + r() * 1.4, 520 + i, 0.05, 4);
      }
    });
  }

  function windEnv(x, y, t) {
    if (t < 9.8 || t > 13.8) return 0;
    var proj = x * 0.86 + (H - y) * 0.51, S = (t - 9.82) * 760 - 120, u = (proj - S) / 120, e = Math.exp(-u * u);
    if (proj < S) { var d = S - proj; e += 0.35 * Math.sin(d / 36) * Math.exp(-d / 380); }
    return e;
  }
  function roadAt(y) { var k = (H + 10 - y) / (H + 10 - HZ - 16); return [lerp(230, 709, k), lerp(170, 9, k)]; }
  function drawField(t) {
    Y.fillRect(0, HZ - 24, W, H - HZ + 30);
    var idle = TS * 1.1;
    for (var i = 0; i < 17; i++) {
      var fr = i / 16, y = HZ + 18 + (H - HZ + 10) * Math.pow(fr, 1.65), sc = 0.32 + fr * 1.7, dx = 12 + fr * 58, r = rs(600 + i);
      for (var x = -20 + r() * dx; x < W + 20; x += dx * (0.8 + r() * 0.4)) {
        var jx = (r() - 0.5) * dx * 0.3, jy = (r() - 0.5) * 6 * sc, bx = x + jx, by = y + jy, n0 = r(), n1 = r();
        var env = windEnv(bx, by, t);
        var lean = -0.14 + (n0 - 0.5) * 0.2 + 0.035 * Math.sin(idle + bx * 0.01) + 0.95 * env;
        var len = (9 + n1 * 4) * sc * (1 + env * 0.25), w = 1.3 + 1.5 * sc;
        bx += env * 7 * sc;
        var tx = bx + Math.sin(lean) * len, ty = by - Math.cos(lean) * len;
        sline(K, bx, by, tx, ty, w, 700 + i * 131 + Math.round(x), 0.12, 4);
        if (sc > 0.9) sline(K, bx + 2, by, bx + 2 + Math.sin(lean + 0.32) * len * 0.82, by - Math.cos(lean + 0.32) * len * 0.82, w * 0.8, 900 + i * 131 + Math.round(x), 0.1, 3);
        if (env > 0.45) {
          var ox = 4 * sc;
          (function (bx, by, tx, ty, w, s2) { cut(Y, function (c) { sline(c, bx + ox, by, tx + ox, ty, w * 0.9, s2, 0.12, 3); }); })(bx, by, tx, ty, w, 1100 + i * 131 + Math.round(x));
        }
      }
    }
  }

  function drawRoad(t) {
    var k = eo(seg(t, 2.95, 3.65)); if (k <= 0) return;
    var yTop = lerp(H + 10, HZ + 16, k), top = roadAt(yTop), bot = roadAt(H + 10);
    var poly = [bot[0] - bot[1], H + 10, top[0] - top[1], yTop, top[0] + top[1], yTop, bot[0] + bot[1], H + 10];
    cut(Y, function (c) { rfill(c, poly, 801, 2, 10); });
    cut(K, function (c) { rfill(c, poly, 801, 2, 10); });
    var n = 16;
    for (var i = 0; i < n; i++) {
      var y0 = lerp(H + 10, yTop, i / n), y1 = lerp(H + 10, yTop, (i + 0.78) / n), a = roadAt(y0), b = roadAt(y1), ww = lerp(4.2, 1.4, i / n);
      sline(K, a[0] - a[1], y0, b[0] - b[1], y1, ww, 810 + i, 0, 3);
      sline(K, a[0] + a[1], y0, b[0] + b[1], y1, ww * 0.9, 840 + i, 0, 3);
      if (i % 2 === 0) {
        sline(K, a[0] - a[1] * 0.35, y0, b[0] - b[1] * 0.35, y1, ww * 0.5, 870 + i, 0, 3);
        sline(K, a[0] + a[1] * 0.4, y0, b[0] + b[1] * 0.4, y1, ww * 0.5, 890 + i, 0, 3);
      }
    }
  }

  /* ---------- 마을 ---------- */
  var HOUSES = [[262, 46, 34, 30], [312, 38, 44, 36], [356, 54, 30, 26], [518, 44, 38, 32], [566, 36, 28, 30], [612, 40, 34, 34], [660, 48, 26, 24]];
  function drawVillage(t) {
    if (t < 5.9) return;
    var rev = eo(seg(t, 5.9, 6.5)), xr = lerp(200, 840, rev), night = nightK(t) > 0;
    K.save(); Y.save();
    [K, Y].forEach(function (c) { rpath(c, [-10, -10, xr, -10, xr - 30, H, -10, H], 1201, 5, 12); c.clip(); });
    var r = rs(1210);
    HOUSES.forEach(function (h, i) {
      var x = h[0], w = h[1], hh = h[2], rh = h[3], base = hillY(x + w / 2) + 10;
      rfill(K, [x, base, x, base - hh, x - 3, base - hh, x + w / 2, base - hh - rh, x + w + 3, base - hh, x + w, base - hh, x + w, base], 1220 + i, 1, 7);
      var wins = [[x + w * 0.22, base - hh * 0.72], [x + w * 0.62, base - hh * 0.72], [x + w * 0.45, base - hh - rh * 0.45]];
      wins.forEach(function (p, j) {
        if (j === 2 && r() < 0.4) return;
        cut(K, function (c) { rrect(c, p[0], p[1], 7, 9, 1250 + i * 4 + j, 0.6); });
        if (night) Y.fillRect(p[0] - 1, p[1] - 1, 9, 11);
      });
    });
    // 교회
    var cx = 425, cb = hillY(cx) + 10;
    rfill(K, [cx - 30, cb, cx - 30, cb - 44, cx + 6, cb - 44, cx + 6, cb], 1300, 1, 7);
    rfill(K, [cx + 4, cb, cx + 4, cb - 76, cx + 14, cb - 150, cx + 24, cb - 76, cx + 24, cb], 1301, 1, 7);
    cut(K, function (c) { rrect(c, cx + 10, cb - 66, 8, 12, 1302, 0.6); rrect(c, cx - 20, cb - 34, 7, 10, 1303, 0.6); rrect(c, cx - 8, cb - 34, 7, 10, 1304, 0.6); });
    if (night) { Y.fillRect(cx + 9, cb - 67, 10, 14); Y.fillRect(cx - 21, cb - 35, 9, 12); }
    sline(K, cx + 14, cb - 150, cx + 14, cb - 170, 2.4, 1305, 0, 3);
    sline(K, cx + 7, cb - 162, cx + 21, cb - 162, 2.2, 1306, 0, 3);
    // 풍차
    var mx = 742, mb_ = hillY(mx) + 8, hub = [mx, mb_ - 84];
    rfill(K, [mx - 22, mb_, mx - 12, mb_ - 78, mx + 12, mb_ - 78, mx + 22, mb_], 1310, 1, 7);
    rfill(K, [mx - 15, mb_ - 76, mx, mb_ - 96, mx + 15, mb_ - 76], 1311, 1, 6);
    cut(K, function (c) { rrect(c, mx - 4, mb_ - 22, 8, 16, 1312, 0.6); rrect(c, mx - 4, mb_ - 56, 7, 9, 1313, 0.6); });
    if (night) Y.fillRect(mx - 5, mb_ - 57, 9, 11);
    var ang = 0.4 + TS * 1.25;
    for (var b = 0; b < 4; b++) {
      var a = ang + b * Math.PI / 2, ca = Math.cos(a), sa = Math.sin(a), L = 64, bw = 13;
      sline(K, hub[0], hub[1], hub[0] + ca * L, hub[1] + sa * L, 3.4, 1320 + b, 0, 4, true);
      var px = -sa, py = ca, p0 = 16, p1 = L;
      var q = [hub[0] + ca * p0, hub[1] + sa * p0, hub[0] + ca * p1, hub[1] + sa * p1, hub[0] + ca * p1 + px * bw, hub[1] + sa * p1 + py * bw, hub[0] + ca * p0 + px * bw, hub[1] + sa * p0 + py * bw];
      rfill(K, q, 1330 + b, 0.6, 6);
      (function (a, ca, sa, px, py) {
        cut(K, function (c) {
          for (var s = 0; s < 4; s++) {
            var d0 = 20 + s * 11.5;
            rfill(c, [hub[0] + ca * d0 + px * 3, hub[1] + sa * d0 + py * 3, hub[0] + ca * (d0 + 8) + px * 3, hub[1] + sa * (d0 + 8) + py * 3,
              hub[0] + ca * (d0 + 8) + px * (bw - 2.5), hub[1] + sa * (d0 + 8) + py * (bw - 2.5), hub[0] + ca * d0 + px * (bw - 2.5), hub[1] + sa * d0 + py * (bw - 2.5)], 1340 + s, 0.3, 5);
          }
        });
      })(a, ca, sa, px, py);
    }
    rcirc(K, hub[0], hub[1], 5, 1350, 0.4);
    K.restore(); Y.restore();
  }

  /* ---------- 사이프러스 ---------- */
  function cypress(cx, by, h, wd, amp, ph, seed, curls) {
    if (h <= 2) return;
    function hw(v) { return wd / 2 * (v < 0.22 ? 0.72 + v * 1.27 : Math.pow(1 - (v - 0.22) / 0.78, 0.85)); }
    function ox(v) { return amp * Math.sin(v * 9 - ph) * v + amp * 0.5 * Math.sin(v * 17 + ph * 1.3) * v * v; }
    var Lp = [], Rp = [], N = 30;
    for (var i = 0; i <= N; i++) {
      var v = i / N, y = by - v * h, o = ox(v), wv = hw(v) * (1 + 0.12 * Math.sin(v * 23 + ph * 0.7 + seed));
      Lp.push(cx + o - wv, y); Rp.unshift(cx + o + wv, y);
    }
    rfill(K, Lp.concat(Rp), seed, 1.6, 7);
    var r = rs(seed + 3), n = curls || 18;
    cut(K, function (c) {
      for (var k = 0; k < n; k++) {
        var v0 = 0.06 + r() * 0.82, side = r() < 0.5 ? -1 : 1, v1 = v0 + 0.07 + r() * 0.07, w = 2 + r() * 2.4;
        var x0 = cx + ox(v0) + side * hw(v0) * (0.25 + r() * 0.5), y0 = by - v0 * h, x1 = cx + ox(v1) + side * hw(v1) * 0.05, y1 = by - v1 * h;
        sline(c, x0, y0, x1, y1, w, seed + 10 + k, -0.25 * side, 5);
      }
    });
  }
  function drawCypressMain(t) {
    var nn = eo(seg(t, 11.54, 12.3));
    cypress(170, HZ + 76, lerp(310, 600, nn), lerp(64, 108, nn), lerp(3, 11, nn), TS * lerp(0.6, 3.2, nn), 1400, Math.round(lerp(16, 30, nn)));
  }

  /* ---------- 화가 ---------- */
  /* ---------- 사람(고흐) ----------
     발바닥이 y=0, 모자 꼭대기가 y=-108. 머리는 키의 약 7분의 1이다.
     오른쪽을 보는 4분의 3 옆모습: 파란 작업복, 검은 바지, 생강색 수염, 밀짚모자.
     팔다리는 관절(어깨, 팔꿈치, 손목 / 엉덩이, 무릎, 발목)을 잇고 굵기가 줄어드는 면으로 칠한다. */
  // J: [x0,y0,x1,y1,...] 관절, Wd: 관절마다 굵기
  function limbPts(J, Wd) {
    var n = J.length / 2, L = [], Rr = [], i;
    for (i = 0; i < n; i++) {
      var i0 = Math.max(0, i - 1), i1 = Math.min(n - 1, i + 1);
      var dx = J[i1 * 2] - J[i0 * 2], dy = J[i1 * 2 + 1] - J[i0 * 2 + 1], d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d, h = Wd[i] / 2;
      L.push(J[i * 2] + nx * h, J[i * 2 + 1] + ny * h);
      Rr.unshift(J[i * 2] - nx * h, J[i * 2 + 1] - ny * h);
    }
    return L.concat(Rr);
  }
  function inkShape(c, pts, seed, lw) { rfill(c, pts, seed, 0.35, 5); K.lineWidth = lw || 1.5; rpath(K, pts, seed, 0.35, 5); K.stroke(); }
  function paperShape(pts, seed, lw) { cutAll(function (c) { rfill(c, pts, seed, 0.3, 5); }); K.lineWidth = lw || 1.3; rpath(K, pts, seed, 0.3, 5); K.stroke(); }
  function paperDot(x, y, r, seed) { cutAll(function (c) { rcirc(c, x, y, r, seed, 0.25); }); K.lineWidth = 1.1; K.beginPath(); rcircPath(K, x, y, r, seed, 0.25); K.stroke(); }
  function leg(J, shoe, seed) {
    rfill(K, limbPts(J, [10, 7.4, 5.4]), seed, 0.35, 5);
    rfill(K, shoe, seed + 1, 0.4, 4);
  }
  function arm(J, seed) {   // 파란 소매, 종이색 손. 노란 판을 긁어내 초록으로 섞이지 않게 한다
    var p = limbPts(J, [7.6, 6.2, 5]);
    cut(Y, function (c) { rfill(c, p, seed, 0.35, 5); });
    // 소매 둘레를 가늘게 파내 같은 파란 옷 위에서도 팔이 떨어져 보이게 한다
    cutAll(function (c) { c.lineWidth = 3.4; rpath(c, p, seed, 0.35, 5); c.stroke(); });
    inkShape(B, p, seed, 1.4);
    var n = J.length;
    paperDot(J[n - 2] + (J[n - 2] - J[n - 4]) * 0.18, J[n - 1] + (J[n - 1] - J[n - 3]) * 0.18, 2.7, seed + 2);
  }
  var COAT = [-10, -85, 6, -86, 11, -82, 13, -70, 14, -56, 16, -43, -13, -42, -12, -58, -12, -74, -12, -82];
  function coat(seed) {
    cutAll(function (c) { rfill(c, COAT, seed, 0.35, 5); });   // 밑에 깔린 들판과 다리를 지우고 칠한다
    inkShape(B, COAT, seed, 1.6);
    cut(B, function (c) { sline(c, -6, -78, -8, -47, 1.7, seed + 1, 0.05, 4); sline(c, 2, -72, 3, -46, 1.4, seed + 2, -0.05, 4); });
    sline(K, 8, -83, 12, -44, 1.3, seed + 3, 0.02, 4);                       // 앞섶
    rcirc(K, 9.6, -74, 1.1, seed + 4, 0.2); rcirc(K, 10.3, -64, 1.1, seed + 5, 0.2); rcirc(K, 11, -54, 1.1, seed + 6, 0.2);
    sline(K, 1, -54, 8, -55, 1.2, seed + 7, 0, 3);                           // 주머니
    paperShape([-1, -88, 5, -88, 5.5, -84, -1.5, -84], seed + 8, 1.1);       // 목
    sline(K, 0, -86, 5, -79, 1.6, seed + 9, 0, 3); sline(K, 8, -86, 5, -79, 1.6, seed + 10, 0, 3); // 깃
  }
  function head(seed, tilt) {
    var hx = 2, hy = -93;
    // 모자 밑으로 보이는 뒷머리
    rfill(Y, [-5, -98, -1, -99, 0, -88, -4, -87, -6, -92], seed, 0.4, 3);
    // 얼굴(종이색)과 코
    cutAll(function (c) { c.beginPath(); c.ellipse(hx, hy, 6.3, 7.6, tilt, 0, Math.PI * 2); c.fill(); });
    paperShape([6.6, -96, 9.4, -90.6, 6.4, -89.8], seed + 1, 1.1);
    K.lineWidth = 1.3; K.beginPath(); K.ellipse(hx, hy, 6.3, 7.6, tilt, -2.2, 1.2); K.stroke();
    // 생강색 수염과 콧수염
    var beard = [-2.5, -91, 0, -88.5, 3.5, -88.6, 6.8, -89.4, 7.6, -86.6, 5.6, -83.6, 1.6, -82.6, -1.8, -84.6, -3.4, -88];
    rfill(Y, beard, seed + 2, 0.4, 3);
    K.lineWidth = 0.9; rpath(K, beard, seed + 2, 0.4, 3); K.stroke();
    sline(K, 0.5, -87.5, 1.5, -84, 0.8, seed + 3, 0, 2); sline(K, 3.2, -87.6, 3.6, -84, 0.8, seed + 4, 0, 2); sline(K, 5.4, -88, 5.2, -85, 0.8, seed + 5, 0, 2);
    // 눈, 눈썹, 귀
    rcirc(K, 4.1, -94.2, 1, seed + 6, 0.15);
    sline(K, 2.6, -96.6, 6, -96.3, 1, seed + 7, 0, 2);
    K.lineWidth = 1.1; K.beginPath(); K.arc(-1.6, -92.4, 1.9, -1.9, 1.9); K.stroke();
    // 밀짚모자: 챙이 머리 위쪽에 얹힌다
    var crown = [-4.6, -99.6, -4, -106, 0.5, -108, 6.5, -108, 9, -105.8, 9.4, -99.6];
    cutAll(function (c) { c.beginPath(); c.ellipse(2.4, -99.4, 15.6, 3.9, -0.06, 0, Math.PI * 2); c.fill(); rfill(c, crown, seed + 8, 0.3, 4); });
    Y.beginPath(); Y.ellipse(2.4, -99.4, 15.6, 3.9, -0.06, 0, Math.PI * 2); Y.fill(); rfill(Y, crown, seed + 8, 0.3, 4);
    K.lineWidth = 1.4; K.beginPath(); K.ellipse(2.4, -99.4, 15.6, 3.9, -0.06, 0, Math.PI * 2); K.stroke();
    rpath(K, crown, seed + 8, 0.3, 4); K.stroke();
    rrect(K, -4.4, -102.4, 13.6, 2.2, seed + 9, 0.3);                        // 모자 띠
    K.lineWidth = 0.8; for (var i = 0; i < 5; i++) { var a = -2.6 + i * 0.55; K.beginPath(); K.moveTo(2.4 + Math.cos(a) * 8, -99.4 + Math.sin(a) * 2); K.lineTo(2.4 + Math.cos(a) * 13.5, -99.4 + Math.sin(a) * 3.4); K.stroke(); }
  }
  function drawFigure(t) {
    if (t < 2.95) return;
    var e = seg(t, 2.95, 5.7), walking = t < 5.7, ph = (TSTEP >> 1) % 2;
    var x = lerp(140, 462, e), y = lerp(790, 594, e), s = lerp(1.4, 0.84, e) * 0.9;
    push(x, y, s);
    if (walking) {
      var bob = ph ? -1 : 0;
      // 등에 진 접은 이젤 다리와 물감 상자(몸 뒤)
      sline(K, -17, -103 + bob, -8, -40, 2.6, 1520, 0, 3);
      sline(K, -12, -105 + bob, -15, -41, 2.4, 1521, 0, 3);
      paperShape([-22, -84 + bob, -10, -85 + bob, -9.5, -63 + bob, -21.5, -62 + bob], 1522, 1.6);
      sline(K, -19, -80 + bob, -12, -80 + bob, 1, 1523, 0, 2);
      // 걸음: 2장(on twos). 앞다리와 반대쪽 팔이 함께 나간다
      if (!ph) {
        leg([-2, -46, -5, -25, -11, -6], [-15, -9, -10, -8, -4, -2, -5, 1, -10, 0, -15, -5], 1500);
        arm([5, -80, 10, -67, 13, -56], 1530);
        leg([2, -46, 6, -25, 9, -4], [5, -6, 12, -6, 17, -2, 16, 1, 5, 1], 1510);
      } else {
        leg([-1, -46, 4, -25, 8, -4], [4, -6, 11, -6, 16, -2, 15, 1, 4, 1], 1501);
        arm([-3, -80, -7, -67, -9, -56], 1531);
        leg([2, -46, -1, -25, -7, -6], [-11, -9, -6, -8, 0, -2, -1, 1, -6, 0, -11, -5], 1511);
      }
      push(0, bob, 1);
      coat(1540);
      sline(K, -10, -80, 4, -85, 1.6, 1524, 0.1, 3);                          // 물감 상자 끈
      if (!ph) arm([1, -80, -4, -66, -7, -54], 1532); else arm([2, -80, 7, -67, 11, -56], 1533);
      head(1560, 0.05);
      pop();
    } else {
      // 세워 둔 이젤과 캔버스(그리던 밀밭과 해)
      sline(K, 50, -98, 38, 0, 3, 1532, 0, 3); sline(K, 50, -98, 62, 0, 3, 1533, 0, 3); sline(K, 51, -94, 52, 2, 2.4, 1534, 0, 3);
      cutAll(function (c) { rrect(c, 30, -100, 40, 32, 1535, 0.6); });
      K.lineWidth = 2.2; rpath(K, [30, -100, 70, -100, 70, -68, 30, -68], 1536, 0.6, 6); K.stroke();
      rcirc(Y, 56, -89, 5.5, 1537, 0.5);
      sline(B, 33, -78, 67, -79, 3.4, 1538, 0.2, 4);
      sline(Y, 34, -74, 66, -75, 2.8, 1539, -0.2, 4);
      sline(K, 27, -67, 73, -67, 2.4, 1541, 0, 3);
      // 다리를 벌리고 선 자세
      leg([-2, -46, -4, -25, -6, -4], [-9, -6, -3, -6, 2, -2, 1, 1, -9, 1], 1502);
      leg([2, -46, 4, -25, 7, -4], [3, -6, 10, -6, 15, -2, 14, 1, 3, 1], 1512);
      coat(1540);
      // 붓을 든 팔(캔버스 쪽으로 뻗고 조금씩 움직인다)
      var by = ph * 3;
      arm([4, -80, 13, -72, 21, -77 + by], 1543);
      sline(K, 23, -78 + by, 29, -84 + by, 1.6, 1544, 0, 2); rcirc(Y, 29.5, -84.5 + by, 1.4, 1545, 0.2);
      // 팔레트를 든 팔
      arm([-3, -80, -6, -66, 1, -61], 1546);
      cutAll(function (c) { c.beginPath(); c.ellipse(-1, -60, 8, 3.4, 0.2, 0, Math.PI * 2); c.fill(); });
      K.lineWidth = 1.3; K.beginPath(); K.ellipse(-1, -60, 8, 3.4, 0.2, 0, Math.PI * 2); K.stroke();
      rcirc(Y, -5, -61, 1.4, 1547, 0.2); rcirc(B, -1.5, -60, 1.4, 1548, 0.2); rcirc(K, 2.5, -58.6, 1.1, 1549, 0.2);
      paperDot(2, -62.5, 2.6, 1550);
      head(1560, 0.05);
    }
    pop();
  }

  /* ---------- 까마귀 ---------- */
  var CROWS = (function () {
    var r = rs(1600), a = [];
    for (var i = 0; i < 66; i++) {
      var x = 250 + r() * 760, y = 470 + r() * 140, rd = roadAt(y);
      if (Math.abs(x - rd[0]) < rd[1] + 14) x = rd[0] + (x < rd[0] ? -1 : 1) * (rd[1] + 20 + r() * 40);
      var proj = x * 0.86 + (H - y) * 0.51;
      a.push({ x: x, y: y, sc: 0.55 + (y - 470) / 140 * 0.55, t0: 9.82 + (proj + 120) / 760 + r() * 0.12, v: 360 + r() * 300, ph: r() * 6, size: 1 + r() * 0.9, lane: (r() - 0.5) * 2 });
    }
    return a;
  })();
  var WUP = [-1.4, -0.85, -0.7, -0.25, -0.15, 0.08, 0, 0.18, 0.15, 0.08, 0.7, -0.25, 1.4, -0.85, 0.62, 0.05, 0.16, 0.28, 0, 0.38, -0.16, 0.28, -0.62, 0.05];
  var WDN = [-1.3, 0.62, -0.62, 0.06, -0.15, -0.06, 0, -0.12, 0.15, -0.06, 0.62, 0.06, 1.3, 0.62, 0.55, 0.28, 0.15, 0.22, 0, 0.3, -0.15, 0.22, -0.55, 0.28];
  function drawCrows(t) {
    if (t > 14.2) return;
    var d = [0.84, -0.54], n = [0.54, 0.84];
    for (var i = 0; i < CROWS.length; i++) {
      var c = CROWS[i];
      if (t < c.t0) {
        var peck = (TSTEP + i * 3) % 9 === 0 ? 2 : 0, u = 9 * c.sc;
        rfill(K, [c.x - u, c.y, c.x - u * 0.6, c.y - u * 0.8, c.x + u * 0.2, c.y - u * 0.95, c.x + u * 0.55, c.y - u * 1.2 + peck, c.x + u * 1.05, c.y - u * 0.95 + peck * 1.2, c.x + u * 0.7, c.y - u * 0.6, c.x + u * 0.6, c.y], 1700 + i, 0.5, 4);
        continue;
      }
      var dt = t - c.t0, along = c.v * dt + 90 * dt * dt, lift = 150 * (1 - Math.exp(-3.2 * dt));
      var x = c.x + d[0] * along + n[0] * Math.sin(dt * 5 + c.ph) * 14 + c.lane * 30 * dt;
      var y = c.y + d[1] * along - lift + n[1] * Math.sin(dt * 5 + c.ph) * 14;
      if (x > W + 60 || y < -60) continue;
      var sz = 11 * c.size * lerp(c.sc, 1.25, sat(dt * 2)), up = (TSTEP + i) % 4 < 2, src = up ? WUP : WDN, p = [];
      var ca = Math.cos(-0.35), sa = Math.sin(-0.35);
      for (var k = 0; k < src.length; k += 2) { var px = src[k] * sz, py = src[k + 1] * sz; p.push(x + px * ca - py * sa, y + px * sa + py * ca); }
      rfill(K, p, 1800 + i, 0.4, 5);
    }
  }

  /* ---------- 해바라기 ---------- */
  var FLOW = [[1012, 560, 40, 0], [1100, 498, 46, 0.08], [1190, 548, 54, 0.16], [1262, 470, 40, 0.24], [928, 618, 34, 0.3]];
  function drawSunflowers(t) {
    if (t < 9.8 || t > 18.5) return;
    FLOW.forEach(function (f, i) {
      var g = back(seg(t, 9.85 + f[3], 10.4 + f[3])); if (g <= 0) return;
      var hx = f[0], hy = lerp(H + 90, f[1], g), Rr = f[2];
      var env = windEnv(hx, hy, t), tn = eio(seg(t, 10.3 + f[3], 11.1 + f[3]));
      var sx = lerp(0.36, 1, tn), rot = lerp(-1.0, -0.12, tn) + env * 0.25 + 0.04 * Math.sin(TS * 1.4 + i);
      sline(K, hx + 14, H + 30, hx, hy, 8, 1900 + i, 0.08, 6);
      var ly = lerp(hy, H, 0.55);
      rfill(K, [hx + 6, ly, hx + 40, ly - 22, hx + 64, ly - 6, hx + 30, ly + 10], 1910 + i, 1.2, 6);
      cut(K, function (c) { sline(c, hx + 10, ly, hx + 56, ly - 8, 1.8, 1915 + i, -0.1, 4); });
      push(hx, hy, null, rot);
      [Y, K, B, R].forEach(function (c) { c.scale(sx, 1); });
      rcirc(Y, 0, 0, Rr * 1.28, 1920 + i, 1);
      rcirc(K, 0, 0, Rr * 1.34, 1925 + i, 1.4);
      cut(K, function (c) {
        for (var p = 0; p < 14; p++) {
          var a = p / 14 * Math.PI * 2 + i, a1 = a - 0.16, a2 = a + 0.16, r0 = Rr * 0.5, r1 = Rr * 1.24;
          rfill(c, [Math.cos(a1) * r0, Math.sin(a1) * r0, Math.cos(a) * r1, Math.sin(a) * r1, Math.cos(a2) * r0, Math.sin(a2) * r0], 1930 + p, 0.6, 5);
        }
      });
      rcirc(K, 0, 0, Rr * 0.5, 1950 + i, 0.8);
      cut(K, function (c) {
        for (var s = 0; s < 22; s++) { var a = s * 2.39996, rr = Math.sqrt(s / 22) * Rr * 0.42; rcirc(c, Math.cos(a) * rr, Math.sin(a) * rr, 1.7, 1960 + s, 0.3); }
      });
      pop();
    });
  }

  /* ---------- 1853 낙관 ---------- */
  function draw1853(t) {
    if (t < 6.35 || t > 10.4) return;
    var k = eo(seg(t, 6.35, 6.5)), s = lerp(1.22, 1, k), out = ei(seg(t, 9.8, 10.35));
    push(660 + out * 900 * 0.84, 168 - out * 900 * 0.54, s * (1 + out * 0.3), -0.02);
    R.font = '900 168px ' + FONT; R.textAlign = 'center'; R.textBaseline = 'middle';
    R.fillText('1853', 0, 8);
    var tw = R.measureText('1853').width;
    R.lineWidth = 7;
    rpath(R, [-tw / 2 - 28, -84, tw / 2 + 28, -84, tw / 2 + 28, 98, -tw / 2 - 28, 98], 2001, 2.2, 10); R.stroke();
    carveText(R, -tw / 2, -60, tw, 130, 46, 2010, 2.4);
    pop();
  }

  /* ---------- 2,100점: 캔버스 행진 ---------- */
  var FR = (function () {
    var r = rs(7001), d = [0.873, -0.488], n = [0.488, 0.873], a = [];
    for (var j = 0; j < 5; j++) for (var k = 0; k < 11; k++) {
      var along = k * 118 - 40 + (j % 2) * 50, perp = (j - 2) * 118;
      var x = 120 + d[0] * along + n[0] * perp, y = 650 + d[1] * along + n[1] * perp;
      var w = 66 + r() * 44, h = w * (r() < 0.5 ? 0.78 : 1.25), rot = (r() - 0.5) * 0.14, type = Math.floor(r() * 6);
      if (x < -80 || x > W + 80 || y < -90 || y > H + 90) continue;
      var st = 13.85 + Math.round((k * 0.27 + j * 0.12) / (BT / 4)) * (BT / 4);
      a.push({ x: x, y: y, w: w, h: h, rot: rot, type: type, st: st, k: k, seed: 7100 + a.length * 13 });
    }
    return a;
  })();
  function mini(f, iw, ih) {
    var x = -iw / 2, y = -ih / 2, s = f.seed;
    PL.forEach(function (c) { c.save(); c.beginPath(); c.rect(x, y, iw, ih); c.clip(); });
    switch (f.type) {
      case 0: // 별밤
        B.fillRect(x, y, iw, ih);
        cut(B, function (c) { gouge(c, [x, y + ih * 0.42, x + iw * 0.3, y + ih * 0.3, x + iw * 0.55, y + ih * 0.45, x + iw, y + ih * 0.35], 3, s + 1); });
        rcirc(Y, x + iw * 0.72, y + ih * 0.22, iw * 0.11, s + 2, 0.6); rcirc(Y, x + iw * 0.4, y + ih * 0.16, iw * 0.06, s + 3, 0.4);
        rfill(K, [x + iw * 0.12, y + ih, x + iw * 0.22, y + ih * 0.2, x + iw * 0.34, y + ih], s + 4, 1, 6);
        rfill(K, [x, y + ih * 0.82, x + iw, y + ih * 0.74, x + iw, y + ih, x, y + ih], s + 5, 1, 6);
        break;
      case 1: // 해바라기
        rcirc(Y, x + iw * 0.5, y + ih * 0.42, iw * 0.3, s + 1, 1);
        rcirc(K, x + iw * 0.5, y + ih * 0.42, iw * 0.12, s + 2, 0.6);
        rfill(K, [x + iw * 0.3, y + ih, x + iw * 0.36, y + ih * 0.78, x + iw * 0.64, y + ih * 0.78, x + iw * 0.7, y + ih], s + 3, 1, 6);
        break;
      case 2: // 밀밭과 까마귀
        B.fillRect(x, y, iw, ih * 0.5); Y.fillRect(x, y + ih * 0.48, iw, ih * 0.52);
        for (var q = 0; q < 3; q++) { var cx = x + iw * (0.25 + q * 0.22), cy = y + ih * (0.2 + (q % 2) * 0.12); gouge(K, [cx - 7, cy - 3, cx, cy + 2, cx + 7, cy - 3], 2.6, s + 5 + q); }
        for (q = 0; q < 5; q++) sline(K, x + iw * (0.1 + q * 0.2), y + ih * 0.95, x + iw * (0.14 + q * 0.2), y + ih * 0.66, 2.2, s + 10 + q, 0.1, 3);
        break;
      case 3: // 밀짚모자 자화상
        B.fillRect(x, y, iw, ih);
        rfill(K, [x + iw * 0.2, y + ih, x + iw * 0.3, y + ih * 0.66, x + iw * 0.7, y + ih * 0.66, x + iw * 0.8, y + ih], s + 1, 1, 6);
        rcirc(K, x + iw * 0.5, y + ih * 0.5, iw * 0.17, s + 2, 0.8);
        Y.beginPath(); Y.ellipse(x + iw * 0.5, y + ih * 0.35, iw * 0.3, ih * 0.06, 0, 0, Math.PI * 2); Y.fill();
        cut(K, function (c) { c.beginPath(); c.ellipse(x + iw * 0.5, y + ih * 0.35, iw * 0.3, ih * 0.07, 0, 0, Math.PI * 2); c.fill(); });
        break;
      case 4: // 노란 집
        B.fillRect(x, y, iw, ih * 0.55);
        rrect(Y, x + iw * 0.2, y + ih * 0.38, iw * 0.42, ih * 0.5, s + 1, 0.8);
        rfill(K, [x + iw * 0.16, y + ih * 0.4, x + iw * 0.41, y + ih * 0.2, x + iw * 0.66, y + ih * 0.4], s + 2, 0.8, 6);
        rrect(K, x + iw * 0.3, y + ih * 0.55, iw * 0.08, ih * 0.1, s + 3, 0.4); rrect(K, x + iw * 0.46, y + ih * 0.55, iw * 0.08, ih * 0.1, s + 4, 0.4);
        break;
      default: // 붓꽃
        for (q = 0; q < 6; q++) sline(B, x + iw * (0.12 + q * 0.15), y + ih, x + iw * (0.1 + q * 0.16), y + ih * 0.45, 3, s + 20 + q, 0.2, 4);
        for (q = 0; q < 4; q++) rcirc(B, x + iw * (0.18 + q * 0.22), y + ih * (0.32 + (q % 2) * 0.1), iw * 0.08, s + 30 + q, 0.6);
        rcirc(Y, x + iw * 0.7, y + ih * 0.2, iw * 0.06, s + 40, 0.4);
    }
    PL.forEach(function (c) { c.restore(); });
  }
  function drainOff(t, k) { return 1900 * ei(seg(t, 17.28 + (10 - k) * 0.018, 17.82 + (10 - k) * 0.018)); }
  function drawFrames(t) {
    if (t < 13.8 || t > 18.2) return;
    var d = [0.873, -0.488];
    FR.forEach(function (f) {
      if (t < f.st) return;
      var s = lerp(1.2, 1, eo(seg(t, f.st, f.st + 0.09))), mv = (t - f.st) * 24 + drainOff(t, f.k);
      var x = f.x + d[0] * mv, y = f.y + d[1] * mv;
      if (x > W + 140 || y < -140) return;
      push(x, y, s, f.rot);
      var w = f.w, h = f.h;
      cutAll(function (c) { rrect(c, -w / 2 - 3, -h / 2 - 3, w + 6, h + 6, f.seed, 1); });
      rrect(K, -w / 2, -h / 2, w, h, f.seed + 1, 1.2);
      cut(K, function (c) { rrect(c, -w / 2 + 7, -h / 2 + 7, w - 14, h - 14, f.seed + 2, 0.9); });
      mini(f, w - 18, h - 18);
      pop();
    });
  }
  function drawCounter(t) {
    if (t < 13.85 || t > 18.0) return;
    var s = lerp(1.15, 1, eo(seg(t, 13.85, 13.97))), off = drainOff(t, 5) * 1.1;
    var v = 2100 * eo(seg(t, 14.0, 16.55)); v = v >= 2099.5 ? 2100 : Math.floor(v / 10) * 10;
    if (t >= 16.55) s *= lerp(1.08, 1, eo(seg(t, 16.55, 16.7)));
    push(640 + 0.873 * off, 330 - 0.488 * off, s);
    cutAll(function (c) { rrect(c, -250, -86, 500, 172, 7501, 1.6); });
    rrect(K, -244, -80, 488, 160, 7502, 1.4);
    cut(K, function (c) { rrect(c, -234, -70, 468, 140, 7503, 1.2); });
    K.font = '900 116px ' + FONT; K.textBaseline = 'middle'; K.textAlign = 'right';
    var wn = K.measureText('2,100').width; K.font = '900 64px ' + FONT; var wu = K.measureText('점').width;
    var x0 = -(wn + 12 + wu) / 2;
    K.font = '900 116px ' + FONT; K.fillText(v.toLocaleString('en-US'), x0 + wn, 6);
    K.font = '900 64px ' + FONT; K.textAlign = 'left'; K.fillText('점', x0 + wn + 12, 22);
    carveText(K, x0, -44, wn + wu + 12, 96, 34, 7510 + (TSTEP % 2), 2);
    sline(Y, -200, 56, 200, 56, 5, 7520, 0.01, 10);
    pop();
  }

  /* ---------- 세계 지도 ---------- */
  var MAPB = null, MAPK = null;
  function buildMap(sc, cw, ch) {
    var keep = BOIL; BOIL = 0;
    MAPB = mk(cw, ch); MAPK = mk(cw, ch);
    var b = MAPB.getContext('2d'), k = MAPK.getContext('2d');
    b.setTransform(sc, 0, 0, sc, 0, 0); k.setTransform(sc, 0, 0, sc, 0, 0);
    b.fillStyle = INK.B; b.fillRect(-4, -4, W + 8, H + 8);
    var r = rs(8801);
    cut(b, function (c) {
      for (var i = 0; i < 300; i++) {
        var x = r() * W, y = r() * H, len = 12 + r() * 26, bd = (r() - 0.5) * 0.4;
        sline(c, x, y, x + len, y + (r() - 0.5) * 3, 1.3 + r() * 1.3, 8810 + i, bd, 4);
      }
    });
    k.fillStyle = INK.K;
    var paths = CONT.map(function (poly) { var p = []; for (var i = 0; i < poly.length; i += 2) { var q = proj0(poly[i], poly[i + 1]); p.push(q[0], q[1]); } return p; });
    paths.forEach(function (p, i) { rfill(k, p, 8900 + i, 1.5, 6); });
    k.save(); k.beginPath(); paths.forEach(function (p, i) { rpath(k, p, 8900 + i, 1.5, 6); }); k.clip();
    cut(k, function (c) {
      var rr = rs(8950), n = 0;
      for (var x0 = -400; x0 < W + 200; x0 += 17) {
        var sx = x0, sy = 80;
        while (sy < 640) {
          var len = 18 + rr() * 34, gap = 8 + rr() * 22, ex = sx + len * 0.5, ey = sy + len * 0.866;
          sline(c, sx, sy, ex, ey, 1.2 + rr() * 0.8, 9000 + (n++), 0.04, 3);
          sx = ex + gap * 0.5; sy = ey + gap * 0.866;
        }
      }
    });
    k.restore();
    BOIL = keep;
  }
  var TILT = 0;
  function tp(x, y) {
    if (TILT <= 0) return [x, y];
    var cy = 360, yy = y - cy, z = -yy * Math.sin(TILT), f = 900 / (900 + z);
    return [640 + (x - 640) * f, cy + yy * Math.cos(TILT) * f + TILT * 70];
  }
  function drawMapImg(c, img, sc) {
    if (TILT <= 0) { c.drawImage(img, 0, 0, W, H); return; }
    var N = 48;
    for (var i = 0; i < N; i++) {
      var y0 = i * H / N, y1 = (i + 1) * H / N, a = tp(0, y0), b = tp(0, y1), m = tp(0, (y0 + y1) / 2), f = (640 - m[0]) / 640;
      c.drawImage(img, 0, Math.floor(y0 * sc), img.width, Math.ceil((y1 - y0) * sc), 640 - 640 * f, a[1], W * f, b[1] - a[1] + 0.8);
    }
  }
  function mapRegionPath(c, s, seed) { rpath(c, [-80, -80, s - (H + 80) * 1.1, -80, s - (-80) * 1.1, H + 80, -80, H + 80], seed, 6, 14); }
  // 지도가 들어올 때는 아래(노란 들판)부터 덮어 올라가 마지막에 파란 밤하늘이 남게 한다. 노란 조각이 끝에 스치지 않는다
  function mapInPath(c, s, seed) { rpath(c, [-80, H + 80 - s + (W + 160) * 0.3, W + 80, H + 80 - s, W + 80, H + 80, -80, H + 80], seed, 6, 14); }
  function sweepVal(t) { return eio(seg(t, 22.2, 23.3)) * 2700 - 160; }
  // 지도 기울기. 지도가 사라진 뒤에도 점은 같은 기울기 위치에서 해로 날아가야 하므로 시간으로만 정한다
  function tiltAt(t) { return t < 17.88 ? 0 : 0.62 * eio(seg(t, 20.77, 21.6)); }
  function drawMap(t, sc) {
    if (t < 17.88 || t >= 23.4) return;
    if (!MAPB) buildMap(sc, Math.round(W * sc), Math.round(H * sc));
    TILT = tiltAt(t);
    var wipe = eo(seg(t, 17.88, 18.4)), s = wipe * 1360 - 20;
    if (wipe < 1) {
      cutAll(function (c) { mapInPath(c, s, 9101); c.fill(); });
      [[B, MAPB], [K, MAPK]].forEach(function (pr) { pr[0].save(); mapInPath(pr[0], s, 9101); pr[0].clip(); drawMapImg(pr[0], pr[1], sc); pr[0].restore(); });
    } else {
      if (TILT > 0) cutAll(function (c) { c.fillRect(-10, -10, W + 20, H + 20); });
      drawMapImg(B, MAPB, sc); drawMapImg(K, MAPK, sc);
      if (TILT > 0) {
        var c0 = tp(0, 0), c1 = tp(W, 0), c2 = tp(W, H), c3 = tp(0, H);
        K.lineWidth = 3; rpath(K, [c0[0], c0[1], c1[0], c1[1], c2[0], c2[1], c3[0], c3[1]], 9110, 1.2, 12); K.stroke();
      }
    }
    // 암스테르담에서 뻗는 칼자국 항로
    var A = tp(CITY_XY[0][0], CITY_XY[0][1]);
    [[1, 19.0], [2, 19.25], [3, 19.5], [4, 19.8]].forEach(function (q, j) {
      var p = eo(seg(t, q[1], q[1] + 0.6)); if (p <= 0) return;
      var P = CITY_XY[q[0]], a0 = CITY_XY[0], dist = Math.hypot(P[0] - a0[0], P[1] - a0[1]);
      var cx = (P[0] + a0[0]) / 2, cy = (P[1] + a0[1]) / 2 - Math.max(14, dist * 0.36), N = 34, pts = [];
      for (var i = 0; i <= N * p; i++) { var u = i / N, x = (1 - u) * (1 - u) * a0[0] + 2 * u * (1 - u) * cx + u * u * P[0], y = (1 - u) * (1 - u) * a0[1] + 2 * u * (1 - u) * cy + u * u * P[1]; var pp = tp(x, y); pts.push(pp[0], pp[1]); }
      cutAll(function (c) { for (var i = 0; i + 7 < pts.length; i += 8) gouge(c, pts.slice(i, i + 8), 3, 9200 + j * 40 + i, true); });
      var hx = pts[pts.length - 2], hy = pts[pts.length - 1];
      if (p < 1) rcirc(Y, hx, hy, 4, 9300 + j, 0.4);
    });
    // 도시 이름
    var LBL = [[0, 0, -22, 'center'], [1, 0, 30, 'center'], [2, -14, 4, 'right'], [3, -14, 6, 'right'], [4, 0, -22, 'center']];
    LBL.forEach(function (l, j) {
      var tm = [18.3, 19.5, 19.75, 20.0, 20.3][j]; if (t < tm) return;
      var P = tp(CITY_XY[l[0]][0], CITY_XY[l[0]][1]);
      cutAll(function (c) { c.font = '800 19px ' + FONT; c.textAlign = l[3]; c.textBaseline = 'middle'; c.fillText(CITIES[l[0]][0], P[0] + l[1], P[1] + l[2]); });
    });
    // 종이로 쓸어 내기
    var sd = sweepVal(t);
    if (t > 22.2) {
      cutAll(function (c) { mapRegionPath(c, sd, 9401); c.fill(); });
      for (var e = 0; e < 4; e++) {
        var o = sd - 14 - e * 11, r = rs(9410 + e);
        for (var sgm = 0; sgm < 7; sgm++) {
          var y0 = -40 + sgm * 115 + r() * 20, y1 = y0 + 60 + r() * 40;
          sline(K, o - (H - y0) * 1.1, y0, o - (H - y1) * 1.1, y1, 4.4 - e, 9420 + e * 10 + sgm, 0.02, 4);
        }
      }
    }
  }

  /* ---------- 별 -> 점 -> 해별 ---------- */
  var SUNSTAR = [1040, 190];
  function drawDots(t) {
    if (t < 17.88) return;
    var sd = sweepVal(t), pulse = t >= 20.77 && t < 23.6 ? ((t - 20.77) / BT) % 1 : -1, keepTilt = TILT;
    TILT = tiltAt(t);
    for (var i = 0; i < STARS.length; i++) {
      var s = STARS[i], ci = STAR_TO_CITY[i], C = CITY_XY[ci], key = ci < 5;
      var p = eio(seg(t, 18.0 + ci * 0.065, 18.85 + ci * 0.065));
      var P = tp(C[0], C[1]), x = lerp(s[0], P[0], p) + Math.sin(p * Math.PI) * 34, y = lerp(s[1], P[1], p);
      var rDot = key ? 8 : 6, rEff = lerp(s[2], rDot * 2, p);
      if (t >= 23.6) {
        var q = eio(seg(t, 23.65 + i * 0.035, 24.55 + i * 0.035));
        if (q >= 1) continue;
        x = lerp(x, SUNSTAR[0], q) - Math.sin(q * Math.PI) * 40; y = lerp(y, SUNSTAR[1], q);
        rEff *= lerp(1, 0.6, q);
      }
      if (p < 1) { starAt(x, y, rEff, TS * 0.7 + i, p, 1 - p, 5000 + i * 20); continue; }
      var swept = t > 22.2 && vDiag(x, y) < sd;
      var rr = rEff / 2;
      if (!swept) cutAll(function (c) { rcirc(c, x, y, rr + 4, 9500 + i, 0.6); });
      else rring(K, x, y, rr + 1.4, rr + 3.6, 9520 + i);
      rcirc(Y, x, y, rr, 9540 + i, 0.5);
      if (pulse >= 0 && t < 23.4) {
        var pr = rr + 5 + pulse * 22, pw = 3 * (1 - pulse) * (1 - seg(t, 22.9, 23.4));   // 지도가 끝나기 전에 물결이 잦아든다
        if (pw > 0.4) { if (!swept) cutAll(function (c) { rring(c, x, y, pr, pr + pw, 9560 + i); }); else rring(K, x, y, pr, pr + pw, 9560 + i); }
      }
    }
    TILT = keepTilt;
    if (t >= 24.2) drawSunStar(t);
  }
  function drawSunStar(t) {
    var g = back(seg(t, 24.2, 24.75)), k = eo(seg(t, 24.6, 25.3)), x = SUNSTAR[0], y = SUNSTAR[1], rot = TS * 0.1;
    if (g <= 0) return;
    for (var i = 0; i < 24; i++) {
      var a = rot + i / 24 * Math.PI * 2, lg = i % 2 === 0 ? 1 : 0.5, r0 = 64 * g, r1 = r0 + (34 + 70 * lg) * k;
      if (k > 0) sline(K, x + Math.cos(a) * r0, y + Math.sin(a) * r0, x + Math.cos(a) * r1, y + Math.sin(a) * r1, i % 2 === 0 ? 4.2 : 2.6, 9600 + i, 0.05, 4);
    }
    var sp = [];
    for (var j = 0; j <= 34; j++) { var u = j / 34, an = -rot * 3 + u * Math.PI * 4.2, rad = 46 * g * (0.4 + 0.6 * u); sp.push(x + Math.cos(an) * rad, y + Math.sin(an) * rad); }
    rcirc(Y, x, y, 50 * g, 9650, 1.2);
    gouge(K, sp, 3.2, 9660);
    rcirc(Y, x, y, 13 * g, 9661, 0.6);
  }

  /* ---------- 빈 거리: 끝 장면 ---------- */
  function drawEnd(t) {
    if (t < 23.4) return;
    var k = eo(seg(t, 23.9, 24.5));
    if (k > 0) {
      K.save(); K.beginPath(); K.rect(0, 0, lerp(-20, W + 20, k), H); K.clip();
      var r = rs(9700);
      for (var i = 0; i < 11; i++) { var x0 = -20 + i * 122 + r() * 30, len = 80 + r() * 70, y0 = 600 + r() * 7; sline(K, x0, y0, x0 + len, y0 + (r() - 0.5) * 3, 2.6 + r() * 2.6, 9710 + i, 0.02, 6); }
      for (i = 0; i < 16; i++) { var x1 = r() * W, y1 = 628 + r() * 80, l1 = 20 + r() * 60; sline(K, x1, y1, x1 + l1, y1 + (r() - 0.5) * 2, 1.2 + r() * 1.2, 9740 + i, 0.02, 4); }
      for (i = 0; i < 14; i++) { var x2 = 260 + r() * 940, y2 = 602; sline(K, x2, y2, x2 + (r() - 0.5) * 8, y2 - 10 - r() * 10, 2.2, 9770 + i, 0.15, 3); }
      K.restore();
    }
    var ch = eo(seg(t, 24.05, 24.7));
    cypress(196, 604, 420 * ch, 92, 3.5, TS * 0.7, 9800, 22);
    if (t >= 25.38) {
      var s = lerp(1.08, 1, eo(seg(t, 25.38, 25.5)));
      push(660, 380, s);
      [Y, K].forEach(function (c) { c.font = '900 98px ' + FONT; c.textAlign = 'center'; c.textBaseline = 'middle'; });
      Y.fillText('반 고흐 그림 지도', 5, 5);
      K.fillText('반 고흐 그림 지도', 0, 0);
      var tw = K.measureText('반 고흐 그림 지도').width;
      carveText(K, -tw / 2, -40, tw, 80, 60, 9900 + (TSTEP % 3), 1.8);
      sline(B, -tw / 2, 62, tw / 2, 62, 6, 9950, 0.01, 12);
      pop();
    }
    if (t >= 26.05) {
      K.font = '700 30px ' + FONT; K.textAlign = 'center'; K.textBaseline = 'middle';
      K.fillText('지도를 눌러 그림을 찾아봐요', 660, 470);
    }
  }

  /* ---------- 시작 라벨 ---------- */
  function drawLabel() {
    push(640, 340, 1);
    cutAll(function (c) { rrect(c, -230, -58, 460, 116, 9990, 1.6); });
    rrect(K, -222, -50, 444, 100, 9991, 1.4);
    cut(K, function (c) { rrect(c, -213, -41, 426, 82, 9992, 1.2); });
    rfill(K, [-176, -24, -176, 24, -136, 0], 9993, 0.8, 6);
    rfill(Y, [-170, -16, -170, 16, -144, 0], 9993, 0.6, 6);
    K.font = '800 40px ' + FONT; K.textAlign = 'left'; K.textBaseline = 'middle';
    K.fillText('영상 보기 · 30초', -112, 2);
    carveText(K, -112, -18, 300, 38, 14, 9995, 1.4);
    pop();
  }

  /* ---------- 장면 합성 ---------- */
  function scene(t, sc, label) {
    if (t < 18.45) {
      drawSky(t); drawSun(t); drawSwirl(t); drawSkyStars(t);
      drawVillage(t); drawHills(); drawField(t); drawRoad(t);
      drawCrows(t); drawFigure(t); drawSunflowers(t); drawCypressMain(t); draw1853(t);
    }
    drawFrames(t); drawCounter(t);
    drawMap(t, sc);
    drawDots(t);
    drawEnd(t);
    if (label) drawLabel();
  }

  /* ---------- 질감 타일 ---------- */
  function valueNoise(n, g, seed) {
    var r = rs(seed), grid = [], i, out = new Float32Array(n * n);
    for (i = 0; i < g * g; i++) grid.push(r());
    for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) {
      var fx = x / n * g, fy = y / n * g, x0 = Math.floor(fx), y0 = Math.floor(fy), tx = fx - x0, ty = fy - y0;
      tx = tx * tx * (3 - 2 * tx); ty = ty * ty * (3 - 2 * ty);
      var a = grid[(y0 % g) * g + x0 % g], b = grid[(y0 % g) * g + (x0 + 1) % g], c = grid[((y0 + 1) % g) * g + x0 % g], d = grid[((y0 + 1) % g) * g + (x0 + 1) % g];
      out[y * n + x] = lerp(lerp(a, b, tx), lerp(c, d, tx), ty);
    }
    return out;
  }
  var GRAIN = null, SPECK = null;
  function buildTiles() {
    if (GRAIN) return;
    var n = 256, r = rs(31337), i;
    GRAIN = mk(n, n); var gc = GRAIN.getContext('2d'), gi = gc.createImageData(n, n), gd = gi.data;
    var v1 = valueNoise(n, 32, 11);
    for (i = 0; i < n * n; i++) {
      var v = r(), o = i * 4;
      if (v < 0.03) { gd[o] = 20; gd[o + 1] = 18; gd[o + 2] = 16; gd[o + 3] = 50 + r() * 70; }
      else if (v > 0.986) { gd[o] = 250; gd[o + 1] = 244; gd[o + 2] = 228; gd[o + 3] = 120 + r() * 90; }
      else { gd[o] = 70; gd[o + 1] = 52; gd[o + 2] = 30; gd[o + 3] = r() * 22 + v1[i] * 14; }
    }
    gc.putImageData(gi, 0, 0);
    SPECK = mk(n, n); var sc_ = SPECK.getContext('2d'), si = sc_.createImageData(n, n), sd = si.data;
    var lo = valueNoise(n, 6, 21), mid = valueNoise(n, 24, 22);
    for (i = 0; i < n * n; i++) {
      var b = lo[i] * 0.6 + mid[i] * 0.4, a = sat((b - 0.52) / 0.4) * 0.42, q = r();
      if (q < 0.045) a = Math.max(a, 0.35 + r() * 0.65);
      sd[i * 4 + 3] = a * 255;
    }
    sc_.putImageData(si, 0, 0);
  }
  function buildPaper(cw, ch, sc) {
    var p = mk(cw, ch), c = p.getContext('2d'), r = rs(99);
    c.fillStyle = INK.P; c.fillRect(0, 0, cw, ch);
    for (var i = 0; i < 240; i++) {
      var x = r() * cw, y = r() * ch, rad = (30 + r() * 170) * sc, dark = r() < 0.55, a = 0.025 + r() * 0.045;
      var g = c.createRadialGradient(x, y, 0, x, y, rad), col = dark ? 'rgba(120,92,52,' : 'rgba(255,251,238,';
      g.addColorStop(0, col + a + ')'); g.addColorStop(1, col + '0)'); c.fillStyle = g; c.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    c.lineWidth = Math.max(0.6, sc * 0.7);
    for (i = 0; i < 2200; i++) {
      var fx = r() * cw, fy = r() * ch, an = r() * Math.PI, l = (3 + r() * 11) * sc;
      c.strokeStyle = 'rgba(110,86,52,' + (0.04 + r() * 0.07) + ')';
      c.beginPath(); c.moveTo(fx, fy); c.lineTo(fx + Math.cos(an) * l, fy + Math.sin(an) * l); c.stroke();
    }
    return p;
  }

  /* ---------- 스타일 ---------- */
  var CSS = '' +
    '.vgi-wrap{position:relative;width:100%;aspect-ratio:16/9;overflow:hidden;background:#EFE5CF;container-type:inline-size;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;font-family:"Pretendard Variable",Pretendard,system-ui,sans-serif}' +
    '.vgi-wrap canvas{position:absolute;inset:0;width:100%;height:100%;display:block}' +
    '.vgi-sub{position:absolute;left:0;right:0;bottom:6.4%;text-align:center;pointer-events:none}' +
    '.vgi-sub span{display:inline-block;max-width:92%;background:#141210;color:#EFE5CF;font-weight:600;font-size:clamp(13px,2.55cqw,30px);line-height:1.35;padding:.26em .8em .3em;letter-spacing:-.01em;word-break:keep-all;opacity:0;transition:opacity .12s linear}' +
    '.vgi-sub span.on{opacity:1}' +
    '.vgi-ctrls{position:absolute;top:3%;right:2.2%;display:flex;gap:6px;opacity:0;pointer-events:none;transition:opacity .3s}' +
    '.vgi-started .vgi-ctrls{opacity:1;pointer-events:auto}' +
    '.vgi-btn{border:0;margin:0;cursor:pointer;background:#141210;color:#EFE5CF;font:600 clamp(11px,1.45cqw,15px)/1 "Pretendard Variable",Pretendard,system-ui,sans-serif;padding:.55em .8em;letter-spacing:-.01em}' +
    '.vgi-btn:hover,.vgi-btn:focus-visible{background:#1E3A9E;outline:none}' +
    '.vgi-prog{position:absolute;left:0;right:0;bottom:0;height:clamp(2px,.35cqw,4px);background:rgba(20,18,16,.18);pointer-events:none}' +
    '.vgi-prog i{display:block;height:100%;width:0;background:#141210}' +
    '.vgi-end{position:absolute;left:50%;bottom:9.5%;transform:translate(-50%,10px);opacity:0;pointer-events:none;border:0;margin:0;cursor:pointer;background:#141210;color:#EFE5CF;font:700 clamp(14px,2.3cqw,26px)/1 "Pretendard Variable",Pretendard,system-ui,sans-serif;padding:.75em 1.5em;letter-spacing:-.01em;transition:opacity .3s,transform .3s}' +
    '.vgi-end.show{opacity:1;transform:translate(-50%,0);pointer-events:auto}' +
    '.vgi-end:hover,.vgi-end:focus-visible{background:#1E3A9E;outline:none}' +
    '.vgi-overlay{position:absolute;inset:0;border:0;margin:0;padding:0;background:transparent;cursor:pointer}' +
    '.vgi-overlay:focus-visible{outline:3px solid #1E3A9E;outline-offset:-6px}' +
    '.vgi-started .vgi-overlay{display:none}';
  var ONLY_CSS = 'html.vgi-only,html.vgi-only body{overflow:hidden!important;margin:0!important;background:#141210!important}' +
    '.vgi-only-host{position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;max-width:none!important;margin:0!important;padding:0!important;z-index:2147483647!important;background:#141210!important;display:flex!important;align-items:center!important;justify-content:center!important;aspect-ratio:auto!important}' +
    '.vgi-only-host .vgi-wrap{width:min(100vw,177.78vh)!important;flex:none}';
  function injectStyle(only) {
    if (!document.getElementById('vgi-style')) {
      var s = document.createElement('style'); s.id = 'vgi-style'; s.textContent = CSS + (only ? ONLY_CSS : ''); document.head.appendChild(s);
    }
  }

  /* ---------- 음악 (Web Audio 합성) ---------- */
  function mtof(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  function Music(ac, muted) {
    var t0 = ac.currentTime + 0.12, self = this;
    var mute = ac.createGain(), master = ac.createGain(), duck = ac.createGain(), lp = ac.createBiquadFilter(), bus = ac.createGain();
    mute.gain.value = muted ? 0 : 1;
    lp.type = 'lowpass'; lp.Q.value = 0.7;
    bus.connect(lp); lp.connect(duck); duck.connect(master); master.connect(mute); mute.connect(ac.destination);
    master.gain.setValueAtTime(0.0001, t0); master.gain.linearRampToValueAtTime(0.35, t0 + 0.4);
    master.gain.setValueAtTime(0.35, t0 + 28); master.gain.linearRampToValueAtTime(0.0001, t0 + 30);
    lp.frequency.setValueAtTime(14000, t0); lp.frequency.setValueAtTime(14000, t0 + 20.77);
    lp.frequency.exponentialRampToValueAtTime(420, t0 + 22.9); lp.frequency.exponentialRampToValueAtTime(2600, t0 + 24.0);
    duck.gain.setValueAtTime(1, t0);
    PHRASES.forEach(function (p) { if (p[0] < 1.2) p = [1.2, p[1]]; duck.gain.setTargetAtTime(0.5, t0 + p[0] - 0.08, 0.05); duck.gain.setTargetAtTime(1, t0 + p[1] + 0.15, 0.15); });

    var nb = ac.createBuffer(1, ac.sampleRate, ac.sampleRate), nd = nb.getChannelData(0);
    for (var i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    function env(g, T, a, peak, dec) { g.gain.setValueAtTime(0.0001, T); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), T + a); g.gain.exponentialRampToValueAtTime(0.0001, T + a + dec); }
    function osc(type, f, T, dur, peak, dec, dest, det) { var o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.value = f; if (det) o.detune.value = det; env(g, T, 0.004, peak, dec); o.connect(g); g.connect(dest || bus); o.start(T); o.stop(T + dur); return o; }
    function noise(T, type, f, q, v, dec, att) { var s = ac.createBufferSource(), fl = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = nb; fl.type = type; fl.frequency.value = f; fl.Q.value = q; env(g, T, att || 0.002, v, dec); s.connect(fl); fl.connect(g); g.connect(bus); s.start(T, Math.random() * 0.8); s.stop(T + dec + 0.08); }
    function kick(T, v) { var o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(110, T); o.frequency.exponentialRampToValueAtTime(45, T + 0.12); env(g, T, 0.004, 0.9 * v, 0.32); o.connect(g); g.connect(bus); o.start(T); o.stop(T + 0.42); }
    function wood(T, v) { noise(T, 'bandpass', 1750, 5, 0.55 * v, 0.06); osc('sine', 1180, T, 0.12, 0.28 * v, 0.07); osc('sine', 1760, T, 0.1, 0.12 * v, 0.04); }
    function rim(T, v) { noise(T, 'bandpass', 3300, 8, 0.3 * v, 0.03); osc('sine', 2450, T, 0.06, 0.1 * v, 0.03); }
    function shaker(T, v) { noise(T, 'highpass', 6800, 0.7, 0.14 * v, 0.045, 0.008); }
    function marimba(T, m, v) { var f = mtof(m), dec = m < 70 ? 0.7 : 0.5; osc('sine', f, T, dec + 0.1, 0.32 * v, dec); osc('sine', f, T, dec + 0.1, 0.16 * v, dec * 0.9, null, 6); osc('sine', f * 3.98, T, 0.2, 0.08 * v, 0.12); }
    function sub(T, m, dur, v) { var f = mtof(m), o = ac.createOscillator(), o2 = ac.createOscillator(), fl = ac.createBiquadFilter(), g = ac.createGain(); o.type = 'sine'; o2.type = 'triangle'; o.frequency.value = f; o2.frequency.value = f; fl.type = 'lowpass'; fl.frequency.value = 220; var g2 = ac.createGain(); g2.gain.value = 0.3; o.connect(g); o2.connect(g2); g2.connect(g); g.connect(fl); fl.connect(bus); g.gain.setValueAtTime(0.0001, T); g.gain.linearRampToValueAtTime(0.5 * v, T + 0.015); g.gain.setTargetAtTime(0.0001, T + dur, 0.06); o.start(T); o2.start(T); o.stop(T + dur + 0.5); o2.stop(T + dur + 0.5); }
    function pad(T, notes, dur, v) {
      var fl = ac.createBiquadFilter(), g = ac.createGain(); fl.type = 'lowpass'; fl.frequency.value = 900; g.connect(fl); fl.connect(bus);
      g.gain.setValueAtTime(0.0001, T); g.gain.linearRampToValueAtTime(v, T + 0.6); g.gain.setValueAtTime(v, T + dur - 0.2); g.gain.linearRampToValueAtTime(0.0001, T + dur + 0.7);
      notes.forEach(function (m) { [-7, 7].forEach(function (d) { var o = ac.createOscillator(); o.type = 'triangle'; o.frequency.value = mtof(m); o.detune.value = d; o.connect(g); o.start(T); o.stop(T + dur + 0.8); }); });
    }
    var BAR = BT * 4, CH = [[57, 60, 64, 67], [53, 57, 60, 64], [55, 60, 64, 67], [55, 59, 62, 67]], ROOT = [33, 29, 36, 31];
    var MOT = [[69, 0, 72, 76, 0, 74, 72, 0, 67, 0, 69, 72, 0, 76, 74, 0], [72, 0, 76, 79, 0, 76, 74, 72, 69, 0, 67, 0, 69, 72, 0, 0]];
    var EV = [];
    function add(ft, fn) { EV.push([ft, fn]); }
    var b, s;
    for (s = 0; s < 52 * 4; s++) (function (s) {
      var beat = s / 4, g = beat < 17 ? 0.45 : beat < 36 ? 0.85 : beat < 41 ? 0.55 : 0.28, acc = [0.9, 0.35, 0.6, 0.35][s % 4];
      add(beat * BT, function (T) { shaker(T, acc * g); });
    })(s);
    for (b = 0; b < 13; b++) (function (b) { add(b * BAR, function (T) { pad(T, CH[b % 4], BAR, b * 4 >= 41 ? 0.035 : 0.045); }); })(b);
    for (s = 0; s < 52 * 2; s++) (function (s) {
      var beat = s / 2, m = MOT[Math.floor(s / 16) % 2][s % 16]; if (!m) return;
      if (beat < 4) return;
      if (beat < 17) { if (s % 4 !== 0) return; add(beat * BT, function (T) { marimba(T, m, 0.5); }); return; }
      if (beat < 41) { add(beat * BT, function (T) { marimba(T, m, 0.75); }); if (s % 8 === 0 && beat >= 24) add(beat * BT, function (T) { marimba(T, m + 12, 0.25); }); return; }
      if (s % 8 === 0 || s % 16 === 5) add(beat * BT, function (T) { marimba(T, m + (s % 16 === 5 ? 12 : 0), 0.45); });
    })(s);
    for (b = 0; b < 13; b++) (function (b) {
      var bb = b * 4, root = ROOT[b % 4];
      if (bb >= 8 && bb < 16) { add(bb * BT, function (T) { kick(T, 0.5); }); add((bb + 3) * BT, function (T) { rim(T, 0.6); }); add(bb * BT, function (T) { sub(T, root, BAR * 0.9, 0.5); }); }
      if (bb >= 16 && bb < 40) {
        [0, 1.5, 2.5].forEach(function (o, j) { var beat = bb + o; if (beat < 17) return; add(beat * BT, function (T) { kick(T, j === 0 ? 0.95 : 0.7); }); add(beat * BT, function (T) { sub(T, root, j === 2 ? BT * 1.3 : BT * 0.85, 0.9); }); });
        [1, 3].forEach(function (o) { var beat = bb + o; if (beat < 17) return; add(beat * BT, function (T) { wood(T, 0.8); }); });
        [0.75, 2.25, 3.75].forEach(function (o) { var beat = bb + o; if (beat < 17) return; add(beat * BT, function (T) { rim(T, 0.5); }); });
      }
      if (bb >= 40 && bb < 48) add(bb * BT, function (T) { sub(T, root, BAR * 0.9, 0.35); });
    })(b);
    add(17 * BT, function (T) { kick(T, 1); sub(T, 33, BT, 1); });
    add(16.5 * BT, function (T) { wood(T, 0.6); }); add(16.75 * BT, function (T) { wood(T, 0.75); });
    EV.sort(function (a, b) { return a[0] - b[0]; });
    var ptr = 0, timer = 0;
    function pump() { var now = ac.currentTime - t0; while (ptr < EV.length && EV[ptr][0] < now + 0.35) { var e = EV[ptr++]; try { e[1](Math.max(ac.currentTime + 0.005, t0 + e[0])); } catch (err) { } } if (ptr >= EV.length) clearInterval(timer); }
    pump(); timer = setInterval(pump, 50);
    self.t0 = t0;
    self.now = function () { return ac.currentTime - t0; };
    self.setMuted = function (m) { mute.gain.setTargetAtTime(m ? 0 : 1, ac.currentTime, 0.02); };
    self.stop = function () { clearInterval(timer); try { mute.gain.setValueAtTime(0, ac.currentTime); mute.disconnect(); } catch (e) { } };
  }

  /* ---------- 마운트 ---------- */
  function mount(container) {
    var qs = (function () { try { return new URLSearchParams(location.search); } catch (e) { return { get: function () { return null; } }; } })();
    var debugT = qs.get('introT'), only = qs.get('introOnly') === '1';
    debugT = debugT != null && debugT !== '' && !isNaN(+debugT) ? cl(+debugT, 0, DUR) : null;
    injectStyle(only);
    if (only) { document.documentElement.classList.add('vgi-only'); document.body.appendChild(container); container.classList.add('vgi-only-host'); }

    container.innerHTML = '';
    var wrap = document.createElement('div');
    wrap.className = 'vgi-wrap';
    wrap.innerHTML = '<canvas aria-hidden="true"></canvas>' +
      '<div class="vgi-sub" aria-live="polite"><span></span></div>' +
      '<div class="vgi-ctrls"><button class="vgi-btn" data-a="mute" type="button">소리 끄기</button><button class="vgi-btn" data-a="replay" type="button">다시 보기</button></div>' +
      '<div class="vgi-prog"><i></i></div>' +
      '<button class="vgi-end" type="button">지도에서 첫 문제 풀기</button>' +
      '<button class="vgi-overlay" type="button" aria-label="영상 보기, 30초"></button>';
    container.appendChild(wrap);
    var canvas = wrap.querySelector('canvas'), M = canvas.getContext('2d');
    var subEl = wrap.querySelector('.vgi-sub span'), progEl = wrap.querySelector('.vgi-prog i'), endBtn = wrap.querySelector('.vgi-end');
    var overlay = wrap.querySelector('.vgi-overlay'), muteBtn = wrap.querySelector('[data-a="mute"]'), replayBtn = wrap.querySelector('[data-a="replay"]');

    var cw = 0, ch = 0, sc = 1, plates = {}, paper = null, pats = {}, grainPat = null;
    var started = false, ended = false, muted = false, raf = 0, lastStep = -1, dirty = true, curT = debugT != null ? debugT : 0;
    var ac = null, music = null, narr = null, narrTimer = 0, perf0 = 0, subIdx = -2;

    function resize() {
      var r = wrap.getBoundingClientRect(); if (!r.width) return;
      var dpr = window.devicePixelRatio || 1, nw = Math.round(Math.min(r.width * dpr, 2560)), nh = Math.round(nw * 9 / 16);
      if (nw === cw && nh === ch) return;
      cw = nw; ch = nh; sc = cw / W;
      canvas.width = cw; canvas.height = ch;
      buildTiles();
      ['B', 'Y', 'R', 'K'].forEach(function (k) { var c = mk(cw, ch); plates[k] = c; pats[k] = c.getContext('2d').createPattern(SPECK, 'repeat'); });
      grainPat = M.createPattern(GRAIN, 'repeat');
      paper = buildPaper(cw, ch, sc);
      MAPB = MAPK = null;
      dirty = true;
      if (!started) render(curT);
    }

    var MIS = { B: [1.6, 1.1, 0.4, 0.33, 0.3], Y: [-1.4, 1.4, 0.37, 0.29, 1], R: [1.1, -1.2, 0.5, 0.45, 2], K: [0.45, 0.35, 0.7, 0.6, 3] };
    function render(t) {
      if (!cw) return;
      TSTEP = Math.floor(t * 12 + 1e-6); TS = TSTEP / 12; BOIL = TSTEP % 4; TILT = 0;
      var order = ['B', 'Y', 'R', 'K'];
      PL = []; order.forEach(function (k) {
        var c = plates[k].getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1; c.clearRect(0, 0, cw, ch);
        c.setTransform(sc, 0, 0, sc, 0, 0); c.fillStyle = INK[k]; c.strokeStyle = INK[k]; c.lineJoin = 'round'; c.lineCap = 'round'; PL.push(c);
      });
      B = PL[0]; Y = PL[1]; R = PL[2]; K = PL[3];
      scene(TS, sc, !started && debugT == null);
      M.setTransform(1, 0, 0, 1, 0, 0); M.globalCompositeOperation = 'source-over'; M.globalAlpha = 1;
      M.drawImage(paper, 0, 0);
      var rr = rs(TSTEP * 7 + 1), ts = Math.max(1, sc * 1.2);
      order.forEach(function (k, i) {
        var c = PL[i], m = MIS[k], ox = (rr() * 256) | 0, oy = (rr() * 256) | 0;
        c.setTransform(ts, 0, 0, ts, ox, oy); c.globalCompositeOperation = 'destination-out'; c.fillStyle = pats[k];
        c.fillRect(-ox / ts, -oy / ts, cw / ts + 2, ch / ts + 2);
        var mx = (m[0] * Math.sin(TS * m[2] + m[4]) + (rr() - 0.5) * 0.5) * sc, my = (m[1] * Math.cos(TS * m[3] + m[4]) + (rr() - 0.5) * 0.5) * sc;
        M.globalAlpha = k === 'K' ? 0.97 : 0.94;
        M.drawImage(plates[k], mx, my);
      });
      M.globalAlpha = 0.9;
      var gx = (BOIL * 97) % 256, gy = (BOIL * 61) % 256, gs = Math.max(1, sc);
      M.setTransform(gs, 0, 0, gs, gx, gy); M.fillStyle = grainPat; M.fillRect(-gx / gs, -gy / gs, cw / gs + 2, ch / gs + 2);
      M.setTransform(1, 0, 0, 1, 0, 0); M.globalAlpha = 1;
    }

    function updateDom(t) {
      var idx = -1;
      for (var i = 0; i < PHRASES.length; i++) if (t >= PHRASES[i][0] && t < PHRASES[i][1] + 0.35) { idx = i; break; }
      if (idx !== subIdx) { subIdx = idx; if (idx >= 0) { subEl.textContent = PHRASES[idx][2]; subEl.classList.add('on'); } else subEl.classList.remove('on'); }
      progEl.style.width = (sat(t / DUR) * 100).toFixed(2) + '%';
      endBtn.classList.toggle('show', t >= 27.2);
    }

    function now() { return music ? music.now() : (performance.now() - perf0) / 1000; }
    function loop() {
      raf = 0;
      var t = cl(now(), 0, DUR); curT = t;
      var st = Math.floor(t * 12);
      if (st !== lastStep || dirty) { lastStep = st; dirty = false; render(t); }
      updateDom(t);
      if (t >= DUR) { ended = true; render(DUR); return; }
      raf = requestAnimationFrame(loop);
    }

    function stopAudio() {
      clearTimeout(narrTimer);
      if (narr) { try { narr.pause(); narr.currentTime = 0; } catch (e) { } }
      if (music) { music.stop(); music = null; }
    }
    function start() {
      stopAudio();
      started = true; ended = false; wrap.classList.add('vgi-started');
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!ac && AC) { try { ac = new AC(); } catch (e) { ac = null; } }
      if (ac && ac.state === 'suspended' && ac.resume) ac.resume();
      if (!narr) { try { narr = new Audio('narration.mp3'); narr.preload = 'auto'; } catch (e) { narr = null; } }
      if (narr) { // 사용자 제스처 안에서 한 번 재생해 잠금을 푼다
        try { narr.muted = true; var p0 = narr.play(); if (p0 && p0.then) p0.then(function () { narr.pause(); narr.currentTime = 0; narr.muted = muted; }).catch(function () { }); } catch (e) { }
      }
      if (ac) { try { music = new Music(ac, muted); } catch (e) { music = null; } }
      perf0 = performance.now() + 120;
      var delay = music ? (music.t0 + 1.2 - ac.currentTime) * 1000 : 1320;
      narrTimer = setTimeout(function () { if (!narr) return; try { narr.muted = muted; narr.currentTime = 0; var p = narr.play(); if (p && p.catch) p.catch(function () { }); } catch (e) { } }, Math.max(0, delay));
      lastStep = -1; subIdx = -2;
      if (!raf) raf = requestAnimationFrame(loop);
    }

    overlay.addEventListener('click', start);
    replayBtn.addEventListener('click', function () { if (raf) { cancelAnimationFrame(raf); raf = 0; } start(); });
    muteBtn.addEventListener('click', function () {
      muted = !muted; muteBtn.textContent = muted ? '소리 켜기' : '소리 끄기';
      if (music) music.setMuted(muted);
      if (narr) narr.muted = muted;
    });
    endBtn.addEventListener('click', function () {
      var target = document.getElementById('map-section');
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // app.js의 찾기 문제가 이 신호를 받아 첫 문제에 포커스를 둔다
      try { window.dispatchEvent(new CustomEvent('vg:quest')); } catch (err) { /* 오래된 브라우저는 스크롤만 */ }
    });

    if (window.ResizeObserver) new ResizeObserver(function () { resize(); if (started && !ended) dirty = true; else render(curT); }).observe(wrap);
    window.addEventListener('resize', function () { resize(); });
    resize();

    function redrawStatic() { if (!started) { dirty = true; render(curT); if (debugT != null) updateDom(curT); } else dirty = true; }
    if (debugT != null) { wrap.classList.add('vgi-started'); overlay.style.display = 'none'; wrap.querySelector('.vgi-ctrls').style.display = 'none'; updateDom(debugT); }
    if (document.fonts && document.fonts.load) {
      var txt = '반 고흐 그림 지도를 눌러 찾아봐요 영상 보기 30초 1853 2,100점 암스테르담 파리 런던 뉴욕 도쿄 0123456789';
      Promise.all([document.fonts.load('900 100px "Pretendard Variable"', txt), document.fonts.load('700 30px "Pretendard Variable"', txt), document.fonts.load('900 100px "Noto Sans KR"', txt)])
        .then(redrawStatic, redrawStatic);
      if (document.fonts.ready) document.fonts.ready.then(redrawStatic);
    }
  }

  window.VGIntro = { mount: mount };
})();
