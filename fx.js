/* EZICARGO · life layer: ambient light, press glow, sparks on actions, cargo confetti on success. Transform/opacity only. */
(function () {
  'use strict';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ambient light behind the page */
  var amb = document.createElement('div'); amb.className = 'amb'; amb.setAttribute('aria-hidden', 'true');
  var FL = {"box": "<path d=\"M12 3l8 4.5v9L12 21l-8-4.5v-9z\"/><path d=\"M4 7.5l8 4.5 8-4.5M12 12v9\"/>", "plane": "<path d=\"M2 16l20-8-6 12-3-5-5 3z\"/>", "ship": "<path d=\"M3 17h18l-2 4H5zM6 17V9h12v8M9 9V5h6v4\"/>", "pin": "<path d=\"M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z\"/><circle cx=\"12\" cy=\"9\" r=\"2.5\"/>", "yen": "<path d=\"M7 4l5 7 5-7M12 11v9M8 13h8M8 16.5h8\"/>", "crate": "<rect x=\"3\" y=\"6\" width=\"18\" height=\"13\" rx=\"1\"/><path d=\"M3 10h18M9 6v13M15 6v13\"/>"}, FK = ['box', 'plane', 'ship', 'crate', 'pin', 'yen'];
  amb.innerHTML = '<i class="a1"></i><i class="a2"></i>' + FK.map(function (k, i) { return '<svg class="fl fl' + i + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">' + FL[k] + '</svg>'; }).join('');
  document.body.insertBefore(amb, document.body.firstChild);

  /* press glow on anything tappable */
  var PRESS = '.btn,.chip,.svt,.opt,.wa,.bank,.pick-i,.acct-k a,.kpi,.seg button,.lane-i,.ctl-nav a,.qty button,.hq,.set-row,.set-link';
  document.addEventListener('pointerdown', function (e) {
    if (reduce) return; var el = e.target.closest(PRESS); if (!el || el.disabled) return;
    var r = el.getBoundingClientRect(), z = el.currentCSSZoom || 1, d = Math.max(r.width, r.height) * 2.2 / z, g = document.createElement('span');
    g.className = 'rip'; g.style.width = g.style.height = d + 'px'; g.style.left = ((e.clientX - r.left) / z - d / 2) + 'px'; g.style.top = ((e.clientY - r.top) / z - d / 2) + 'px';
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    if (el.matches('.btn,.chip,.opt,.wa,.bank,.svt,.seg button,.pick-i,.acct-k a,.ctl-nav a,.lane-i,.qty button')) el.classList.add('rip-host'); el.appendChild(g); setTimeout(function () { g.remove(); }, 650);
  }, { passive: true });

  /* sparks on main actions */
  var MAIN = '.btn-red,.wh-btn,.wa-main,[type="submit"],.pbar .btn,[data-act="quick"],[data-act="add"],[data-rvstar]';
  document.addEventListener('click', function (e) {
    if (reduce) return; var el = e.target.closest(MAIN); if (!el || el.disabled) return;
    burst(e.clientX || (el.getBoundingClientRect().left + el.offsetWidth / 2), e.clientY || (el.getBoundingClientRect().top + el.offsetHeight / 2), 9, false);
  });
  function burst(x, y, n, boxes) {
    var cols = ['#D40B0B', '#FF5A4A', '#F5A400', '#FFD27A', '#16181C'];
    for (var i = 0; i < n; i++) {
      var p = document.createElement('i'), a = (Math.PI * 2 * i / n) + Math.random() * .6, dist = (boxes ? 90 : 34) + Math.random() * (boxes ? 90 : 26);
      p.className = boxes ? 'spk box' : 'spk'; p.style.left = x + 'px'; p.style.top = y + 'px'; p.style.background = cols[i % cols.length];
      p.style.setProperty('--dx', Math.cos(a) * dist + 'px'); p.style.setProperty('--dy', Math.sin(a) * dist + (boxes ? 40 : 0) + 'px'); p.style.setProperty('--rt', (Math.random() * 360 - 180) + 'deg');
      document.body.appendChild(p); (function (q) { setTimeout(function () { q.remove(); }, boxes ? 1100 : 650); })(p);
    }
  }
  window.EZFX = { burst: burst };

  /* count up the big numbers when a page opens */
  function countUp(el) {
    var txt = el.textContent, m = txt.match(/^([^0-9]*)([\d,]+(?:\.\d+)?)(.*)$/); if (!m || el.__cu) return; el.__cu = 1;
    var to = parseFloat(m[2].replace(/,/g, '')), dec = (m[2].split('.')[1] || '').length, st = performance.now(), D = 900;
    (function step(t) { var k = Math.min(1, (t - st) / D), v = to * (1 - Math.pow(1 - k, 3)); el.textContent = m[1] + v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + m[3]; if (k < 1) requestAnimationFrame(step); else el.textContent = txt; })(st);
  }
  function life() {
    if (reduce || document.documentElement.classList.contains('calm')) return;
    $$('#app .hh-v, #app .stat b, #app .acct-k b, #app .wh-stats2 b, #app .rv-avg').forEach(countUp);
    $$('#app .hq, #app .svt, #app .pc, #app .deal, #app .hi-t, #app .fcard, #app .opt, #app .set-card, #app .lrow').forEach(function (el, i) { if (el.getBoundingClientRect().top < innerHeight) { el.style.setProperty('--ed', Math.min(i, 14) * 40 + 'ms'); el.classList.add('enter'); } });
  }
  /* phone tables become stacked cards: label each cell */
  function labelTables() { $$('#app table').forEach(function (t) { var h = $$('thead th', t).map(function (x) { return x.textContent.trim(); }); $$('tbody tr', t).forEach(function (tr) { $$('td', tr).forEach(function (td, i) { if (h[i]) td.setAttribute('data-label', h[i]); }); }); }); }
  /* pause decoration while scrolling or when the page is hidden: keeps scrolling smooth */
  var scT, root = document.documentElement;
  addEventListener('scroll', function () { if (!root.classList.contains('scrolling')) root.classList.add('scrolling'); clearTimeout(scT); scT = setTimeout(function () { root.classList.remove('scrolling'); }, 160); }, { passive: true });
  document.addEventListener('visibilitychange', function () { root.classList.toggle('paused', document.hidden); });
  document.addEventListener('ezi:view', labelTables);
  setTimeout(labelTables, 80);
  document.addEventListener('ezi:view', life);
  setTimeout(life, 60);

  /* cargo confetti when something succeeds */
  var toasts = document.querySelector('.toasts');
  if (toasts && 'MutationObserver' in window) new MutationObserver(function (m) {
    if (reduce) return;
    m.forEach(function (x) { Array.prototype.forEach.call(x.addedNodes, function (n) { if (n.classList && n.classList.contains('good')) { var r = n.getBoundingClientRect(); burst(r.left + r.width / 2, r.top, 14, true); } }); });
  }).observe(toasts, { childList: true });

  /* a soft glow when live numbers change */
  var lastBal = null;
  setInterval(function () { var st = window.EZAPP && EZAPP.state(); if (!st) return; if (lastBal !== null && st.wallet !== lastBal) $$('[data-live="bal"]').forEach(function (b) { b.classList.remove('tick-glow'); void b.offsetWidth; b.classList.add('tick-glow'); }); lastBal = st.wallet; }, 700);

  /* cards follow the pointer a little (desktop only) */
  if (!reduce && matchMedia('(hover:hover)').matches) {
    document.addEventListener('pointermove', function (e) {
      var c = e.target.closest('.svt,.pc,.deal,.fcard'); if (!c) return; var r = c.getBoundingClientRect();
      c.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%'); c.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
    }, { passive: true });
  }
})();
