/* EZICARGO trade platform · single page app (sample data, test mode payments) */
(function () {
  'use strict';
  var E = window.EZ, ART = window.ART, APP_URL = 'https://claude.ai/artifact/DywuA2UCygAnmrzqNkFJDx';
  var KEY = 'ezi-web3-v1';
  var S = null;
  try { S = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {}
  if (!S || !S.code) S = E.acct();
  S.cur = S.cur || 'MYR';
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }

  /* ---------- helpers ---------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function fmt(v, d) { return Number(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }); }
  function money(rm, d) { var c = E.CUR[S.cur], v = rm * c.r; if (d == null) d = S.cur === 'IDR' ? 0 : 2; return c.s + fmt(v, d); }
  function rmOf(cny) { return cny / E.MYR_CNY; }
  function cny(v) { return '¥' + fmt(v, v < 10 ? 2 : 2); }
  function P(id) { return E.PROD.filter(function (p) { return p.id === id; })[0]; }
  function tierOf(p, q) { var t = p.t[0]; p.t.forEach(function (x) { if (q >= x[0]) t = x; }); return t; }
  function unit(p, q) { return tierOf(p, q)[1]; }
  function ago(t) { var s = (Date.now() - t) / 1000; if (s < 60) return 'just now'; if (s < 3600) return Math.floor(s / 60) + ' min ago'; if (s < 86400) return Math.floor(s / 3600) + ' h ago'; return Math.floor(s / 86400) + ' d ago'; }
  function cd(ms) { if (ms < 0) ms = 0; var s = Math.floor(ms / 1000), d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60), x = s % 60, p = function (n) { return (n < 10 ? '0' : '') + n; }; return (d ? d + 'd ' : '') + p(h) + ':' + p(m) + ':' + p(x); }
  function shortN(n) { return n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'k' : String(n); }
  function art(p, c, b) { return ART(p, c, b); }
  function G(id) { return E.GROUP.filter(function (g) { return g.id === id; })[0]; }
  function groupFor(pid) { return E.GROUP.filter(function (g) { return g.p === pid; })[0]; }
  function airCut() { var now = Date.now(), my = new Date(now + 8 * 3600e3), t = Date.UTC(my.getUTCFullYear(), my.getUTCMonth(), my.getUTCDate(), 18) - 8 * 3600e3; if (t <= now) t += 864e5; return t; }
  function seaCut() { var now = Date.now(), my = new Date(now + 8 * 3600e3), add = (6 - my.getUTCDay() + 7) % 7, t = Date.UTC(my.getUTCFullYear(), my.getUTCMonth(), my.getUTCDate() + add, 12) - 8 * 3600e3; if (t <= now) t += 7 * 864e5; return t; }

  var SP = 'fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"';
  function ic(n, s) { s = s || 22; var d = {
    home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    shop: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    box: '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5l8 4.5 8-4.5M12 12v9"/>',
    wallet: '<rect x="3" y="6" width="18" height="13" rx="3"/><path d="M16 12.5h2M3 10h18"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4.5-6 8-6s7 2 8 6"/>',
    bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 21h4"/>',
    cart: '<path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.8h7.7a2 2 0 0 0 2-1.6L21 8H6"/><circle cx="10" cy="20.5" r="1.3"/><circle cx="17" cy="20.5" r="1.3"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
    factory: '<path d="M3 21V10l5 3V10l5 3V6l8 4v11z"/><path d="M8 17h2M13 17h2"/>',
    group: '<circle cx="9" cy="8" r="3.2"/><circle cx="17" cy="9.5" r="2.5"/><path d="M3 19c.6-3.4 3-5 6-5s5.4 1.6 6 5M15 14.5c2.6-.4 5 1 5.6 4"/>',
    credit: '<path d="M12 3a9 9 0 1 0 9 9"/><path d="M12 7v5l3 3"/><path d="M16 3h5v5"/>',
    pin: '<path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    plane: '<path d="M2 16l20-8-6 12-3-5-5 3z"/>',
    boat: '<path d="M3 17h18l-2 4H5zM6 17V9h12v8M9 9V5h6v4"/>',
    cam: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    scale: '<path d="M5 20h14l-2-10H7z"/><circle cx="12" cy="6" r="2.5"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a1 1 0 0 1 1-1h10"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-4.5"/>',
    swap: '<path d="M4 8h13l-4-4M20 16H7l4 4"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/>',
    layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
    truck: '<path d="M3 6h11v10H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>'
  }[n]; return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" ' + SP + ' aria-hidden="true">' + d + '</svg>'; }
  var SVC = [
    { ic: 'box', n: 'EZI Ship', what: 'Your warehouse in China. We receive, store and ship.', go: '#ship', k: 'ship' },
    { ic: 'factory', n: 'Shop factories', what: 'Buy direct from verified Chinese factories.', go: '#shop-all', k: 'shop' },
    { ic: 'group', n: 'Group Buy', what: 'Join other shops to get factory price.', go: '#group', k: 'group' },
    { ic: 'swap', n: 'Pay supplier', what: 'Send yuan to any Chinese supplier.', go: '#wallet', k: 'pay' },
    { ic: 'shield', n: 'Escrow orders', what: 'Factory paid only after we inspect.', go: '#orders', k: 'escrow' },
    { ic: 'credit', n: 'EZI Credit', what: 'Ship now, pay when goods arrive.', go: '#credit', k: 'credit' },
    { ic: 'pin', n: 'Track', what: 'Every scan from China to your door.', go: '#track', k: 'track' },
    { ic: 'chat', n: 'Help & chat', what: 'AI assistant and customer service.', go: '#help', act: 'assist', k: 'help' }
  ];
  function orbIc(d) { return '<span class="orb-ic"><svg class="orb-ring" viewBox="0 0 64 64" aria-hidden="true"><circle class="orb-trk" cx="32" cy="32" r="29.5"/><circle class="orb-arc" cx="32" cy="32" r="29.5" pathLength="100"/><circle class="orb-dot" cx="6.15" cy="17.8" r="2.8"/></svg><span class="orb-core"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d[2] + '</svg></span></span>'; }
  function svcTile(x, i) { var d = HI[x.k] || HI.ship; return '<a class="orb" href="' + x.go + '"' + (x.act ? ' data-act="' + x.act + '"' : '') + ' title="' + x.what + '" style="--oc:' + d[1] + ';--ob:' + d[0] + ';--i:' + (i || 0) + '"><span class="orb-ic"><svg class="orb-ring" viewBox="0 0 64 64" aria-hidden="true"><circle class="orb-trk" cx="32" cy="32" r="29.5"/><circle class="orb-arc" cx="32" cy="32" r="29.5" pathLength="100"/><circle class="orb-dot" cx="6.15" cy="17.8" r="2.8"/></svg><span class="orb-core"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d[2] + '</svg></span></span><b>' + x.n + '</b></a>'; }
  function servicesSection() { return '<section class="sec band" id="services" data-tour="services"><div class="sec-h"><div><h2>Services</h2><p class="sec-sub">Everything you need to buy, pay and ship from China</p></div></div><div class="orb-grid">' + SVC.map(svcTile).join('') + '</div></section>'; }
  function servicesSheet() {
    closeLayer(); var s = document.createElement('div'); s.className = 'scrim'; s.setAttribute('data-act', 'close'); var d = document.createElement('div'); d.className = 'sheet'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-label', 'Services');
    d.innerHTML = '<div class="between"><h3>Services</h3><button class="x" data-act="close" aria-label="Close">×</button></div><div class="orb-grid">' + SVC.map(svcTile).join('') + '</div>';
    document.body.appendChild(s); document.body.appendChild(d);
  }
  var VT = '<span class="vtick" title="Verified by EZICARGO"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>';
  var LVL = { 'EZI Select': 'red', Gold: 'gold', Silver: '' };

  /* ---------- toasts, modals, drawers ---------- */
  function toast(m, good) { var d = document.createElement('div'); d.className = 'toast' + (good ? ' good' : ''); d.setAttribute('role', 'status'); d.textContent = m; $('.toasts').appendChild(d); setTimeout(function () { d.remove(); }, 3200); }
  function closeLayer() { $$('.scrim,.drawer,.modal,.sheet').forEach(function (x) { x.remove(); }); }
  function modal(html) { closeLayer(); var s = document.createElement('div'); s.className = 'scrim'; s.setAttribute('data-act', 'close'); var m = document.createElement('div'); m.className = 'modal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); m.innerHTML = html; document.body.appendChild(s); document.body.appendChild(m); var f = m.querySelector('input,select,button'); if (f) f.focus(); return m; }
  function drawer(title, body, foot) { closeLayer(); var s = document.createElement('div'); s.className = 'scrim'; s.setAttribute('data-act', 'close'); var d = document.createElement('aside'); d.className = 'drawer'; d.setAttribute('role', 'dialog'); d.innerHTML = '<header><h3>' + title + '</h3><button class="x" data-act="close" aria-label="Close">×</button></header><div class="db">' + body + '</div>' + (foot ? '<footer>' + foot + '</footer>' : ''); document.body.appendChild(s); document.body.appendChild(d); return d; }
  function note(m, r) { S.notes.unshift({ t: Date.now(), m: m, r: r }); if (S.notes.length > 30) S.notes.length = 30; S.unread = (S.unread || 0) + 1; badges(); }
  function ledger(d, a, k) { S.ledger.unshift({ t: Date.now(), d: d, a: a, k: k }); }
  function flyTo(fromEl, p, col) {
    var tgt = $('[data-badge="cart"]'); if (!fromEl || !tgt) return;
    var a = fromEl.getBoundingClientRect(), b = tgt.getBoundingClientRect();
    var f = document.createElement('div'); f.className = 'fly'; f.innerHTML = art(p, col); f.style.left = (a.left + a.width / 2 - 28) + 'px'; f.style.top = (a.top + a.height / 2 - 28) + 'px'; document.body.appendChild(f);
    requestAnimationFrame(function () { requestAnimationFrame(function () { f.style.transform = 'translate(' + (b.left - a.left - a.width / 2 + 20) + 'px,' + (b.top - a.top - a.height / 2 + 10) + 'px) scale(.3)'; f.style.opacity = '.4'; }); });
    setTimeout(function () { f.remove(); var bd = $('[data-badge="cart"] .badge'); if (bd) { bd.classList.remove('bump'); void bd.offsetWidth; bd.classList.add('bump'); } }, 720);
  }
  function countTo(el, from, to, fmtFn) { var st = performance.now(); (function step(t) { var k = Math.min(1, (t - st) / 900); el.textContent = fmtFn(from + (to - from) * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); })(st); }

  /* ---------- shell ---------- */
  function cartCount() { return S.cart.length; }
  function tickerHtml() {
    var items = [
      '<i><span class="ld"></span><b>LIVE</b></i>',
      '<i>1 MYR = <b class="num">¥' + E.MYR_CNY + '</b> <span class="up">▲0.12%</span></i>',
      '<i>Air cut-off Guangzhou <b class="num" data-end="' + airCut() + '">--</b></i>',
      '<i>Sea LCL to Port Klang closes <b class="num" data-end="' + seaCut() + '">--</b></i>',
      '<i>Parcels received today <b class="num" data-live="rx">' + fmt(LIVE.rx, 0) + '</b></i>',
      '<i>Group deals open <b>' + E.GROUP.length + '</b> · closing soonest <b class="num" data-end="' + E.GROUP[0].ends + '">--</b></i>',
      '<i>Escrow protects <b>every</b> factory order</i>',
      '<i>14 days <b>free storage</b> for every parcel</i>'
    ].join('');
    return '<div class="tick" aria-label="Live updates"><div class="tick-in">' + items + items + '</div></div>';
  }
  function header() {
    var curOpts = Object.keys(E.CUR).map(function (k) { return '<option value="' + k + '"' + (k === S.cur ? ' selected' : '') + '>' + k + '</option>'; }).join('');
    return '<div class="wrap"><div class="hdr-row">' +
      '<a class="logo" href="#home" aria-label="EZICARGO home"><img src="assets/ezicargo-mark.png" alt="" width="46" height="35"><span><b>EZICARGO</b><small>TRADE · SHIP · PAY</small></span></a>' +
      '<form class="search" role="search" id="sform"><select id="s-scope" aria-label="Search in"><option value="p">Products</option><option value="f">Factories</option><option value="t">Tracking</option></select><input id="s-q" autocomplete="off" placeholder="Search products" aria-label="Search"><button type="submit" aria-label="Search">' + ic('search', 18) + '</button><div class="sugg" id="sugg" hidden></div></form>' +
      '<div class="hdr-act"><button class="btn btn-soft btn-sm svc-btn" data-act="services" data-tour="svcbtn">' + ic('shop', 18) + ' Services</button><button class="hbtn" data-act="theme" aria-label="Display: light, soft or dark"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor"/></svg></button>' +
      '<a class="wal hide-sm" href="#wallet" aria-label="Wallet">' + ic('wallet', 20) + '<b class="num" data-live="bal">' + money(S.wallet) + '</b></a>' +
      '<button class="hbtn" data-act="notes" data-badge="notes" aria-label="Alerts">' + ic('bell') + '<span class="badge" hidden>0</span></button>' +
      '<a class="hbtn" href="#cart" data-badge="cart" aria-label="Cart">' + ic('cart') + '<span class="badge">' + cartCount() + '</span></a>' +
      '<a class="hbtn hide-sm" href="#me" aria-label="Account">' + ic('user') + '</a></div></div></div>';
  }
  function footer() {
    return '<div class="wrap"><div class="ft-g"><div class="stack" style="--g:10px"><a class="logo" href="#home"><img src="assets/ezicargo-mark.png" alt="" width="46" height="35"><span><b>EZICARGO</b><small>TRADE · SHIP · PAY</small></span></a><p>Buy from verified Chinese factories, pay safely through escrow, and ship through our Guangzhou warehouse to Malaysia, Singapore, Brunei and the Gulf.</p><p class="sample">EZICARGO RICH SDN. BHD. · 201601014585 (1185516-M)</p></div>' +
      '<div><h4>Buy</h4><a href="#shop-all">All products</a><a href="#group">Group deals</a><a href="#factories">Verified factories</a><a href="#me">Request a quote</a></div>' +
      '<div><h4>Ship</h4><a href="#ship">My China address</a><a href="#ship">Declare a parcel</a><a href="#ship">Shipping rates</a><a href="#track">Track</a></div>' +
      '<div><h4>Pay</h4><a href="#wallet">EZI Wallet</a><a href="#wallet">Pay a supplier in ¥</a><a href="#credit">EZI Credit</a><a href="#orders">Escrow orders</a></div>' +
      '<div><h4>Partners</h4><a href="' + APP_URL + '" target="_blank" rel="noopener">Factory portal</a><a href="' + APP_URL + '" target="_blank" rel="noopener">Warehouse app</a><a href="#control">Control centre (staff)</a><a href="#factories">Sell with us</a></div></div>' +
      '<div class="ft-b"><span>© 2016–2026 EZICARGO RICH SDN. BHD. · Preview with sample data. Payments are in test mode.</span><span class="pays"><span>FPX</span><span>DuitNow</span><span>Visa</span><span>Mastercard</span><span>Alipay</span><span>WeChat Pay</span></span></div></div>';
  }
  function tabs() {
    return [['home', 'home', 'Home'], ['shop-all', 'factory', 'Shop'], ['svc', 'shop', 'Services'], ['wallet', 'wallet', 'Wallet'], ['me', 'user', 'Account']].map(function (t) {
      if (t[0] === 'svc') return '<button type="button" class="tab-svc" data-act="services" data-tour="svctab"><span>' + ic('shop') + '</span>Services</button>';
      return '<a href="#' + t[0] + '" data-tab="' + t[0].split('-')[0] + '"' + (t[0] === 'cart' ? ' data-badge="cart"' : '') + '>' + ic(t[1]) + t[2] + (t[0] === 'cart' ? '<span class="badge">' + cartCount() + '</span>' : '') + '</a>';
    }).join('') + '<span class="tab-ind" aria-hidden="true"></span>';
  }
  function moveInd() { var ind = $('.tab-ind'), on = $('.tabs a.on'); if (!ind) return; if (!on) { ind.style.opacity = 0; return; } var r = on.getBoundingClientRect(), pr = on.parentNode.getBoundingClientRect(); ind.style.opacity = 1; ind.style.transform = 'translateX(' + ((r.left - pr.left + r.width / 2) / (ind.currentCSSZoom || 1) - 26) + 'px)'; }
  addEventListener('resize', function () { moveInd(); });
  function badges() {
    $$('[data-badge="cart"] .badge').forEach(function (b) { b.textContent = cartCount(); b.hidden = !cartCount(); });
    $$('[data-badge="notes"] .badge').forEach(function (b) { b.textContent = S.unread || 0; b.hidden = !S.unread; });
    $$('[data-live="bal"]').forEach(function (b) { b.textContent = S.hideBal ? 'RM ••••' : money(S.wallet); });
  }

  /* ---------- reusable cards ---------- */
  function pcard(p) {
    var f = E.FACT[p.f], g = groupFor(p.id), lo = p.t[p.t.length - 1][1];
    return '<a class="pc" href="#p-' + p.id + '"><div class="im">' + art(p) + (g ? '<span class="pill red">' + ic('group', 12) + ' Group deal</span>' : (f.lv === 'EZI Select' ? '<span class="pill ink">EZI Select</span>' : '')) +
      '<button class="qa" type="button" data-act="quick" data-p="' + p.id + '" aria-label="Add ' + esc(p.n) + ' to cart">' + ic('cart', 18) + '</button></div>' +
      '<div class="bd"><span class="nm">' + esc(p.n) + '</span><span class="pr"><b>' + money(rmOf(lo)) + '</b><small>– ' + money(rmOf(p.t[0][1])) + ' /pc</small></span>' +
      '<span class="row" style="gap:6px"><span class="pill">MOQ ' + fmt(p.t[0][0], 0) + '</span><span class="sample">' + shortN(p.sold) + ' sold · <span class="rv-mini" data-rv-mini="' + p.id + '">New</span></span></span>' +
      '<span class="fm">' + VT + '<span>' + esc(f.n) + '</span></span></div></a>';
  }
  function dealCard(g) {
    var p = P(g.p), pct = Math.min(100, g.got / g.goal * 100), cur = 0;
    g.ladder.forEach(function (l, i) { if (g.got >= l[0]) cur = i + 1; });
    var lad = '<span' + '><b>' + cny(p.t[0][1]) + '</b>now</span>' + g.ladder.map(function (l, i) { return '<span class="' + (i < cur ? 'hit' : i === cur ? 'next' : '') + '"><b>' + cny(l[1]) + '</b>at ' + shortN(l[0]) + '</span>'; }).join('');
    return '<a class="card deal" href="#p-' + p.id + '" data-g="' + g.id + '"><div class="im">' + art(p) + '<span class="cdb">' + ic('lock', 13) + '<span data-end="' + g.ends + '">--</span></span></div><div class="bd"><span class="nm">' + esc(p.n) + '</span>' +
      '<div class="between"><span class="sample"><b class="num" style="color:var(--ink)" data-gg="' + g.id + '">' + fmt(g.got, 0) + '</b> / ' + fmt(g.goal, 0) + ' pcs</span><span class="pill red" data-gs="' + g.id + '">' + g.shops + ' shops</span></div>' +
      '<div class="bar"><i data-gb="' + g.id + '" style="width:' + pct.toFixed(1) + '%"></i></div><div class="ladder">' + lad + '</div></div></a>';
  }
  function ring(sc, sz) { var r = 22, c = 2 * Math.PI * r, col = sc >= 90 ? 'var(--good)' : sc >= 80 ? 'var(--blue)' : 'var(--warn)'; return '<span class="ring"><svg viewBox="0 0 52 52"><circle cx="26" cy="26" r="' + r + '" fill="none" stroke="var(--surface-2)" stroke-width="5"/><circle cx="26" cy="26" r="' + r + '" fill="none" stroke="' + col + '" stroke-width="5" stroke-linecap="round" stroke-dasharray="' + (c * sc / 100).toFixed(1) + ' ' + c.toFixed(1) + '"/></svg><b>' + sc + '</b></span>'; }
  function fcard(id) { var f = E.FACT[id]; var n = E.PROD.filter(function (p) { return p.f === id; }).length; return '<a class="card pad fcard" href="#f-' + id + '" style="flex-direction:column;align-items:stretch;gap:12px"><div class="row" style="flex-wrap:nowrap">' + ring(f.sc) + '<div style="min-width:0"><b style="display:flex;gap:6px;align-items:center">' + esc(f.n) + ' ' + VT + '</b><span class="sample">' + f.city + ' · ' + f.yrs + ' yrs</span></div></div><div class="row" style="gap:6px"><span class="pill ' + (LVL[f.lv] || '') + '">' + f.lv + '</span><span class="pill">' + f.type + '</span></div><div class="ln sample"><span>Inspection pass ' + f.pass + '%</span><span>On time ' + f.ontime + '%</span><span>' + n + ' products</span></div></a>'; }

  /* ---------- live simulation state ---------- */
  var LIVE = { rx: 1284, wt: 18.6, insp: 312, out: 46, feed: [] };
  var FEEDK = [
    ['box', 'Parcel received', function () { return 'EZ-P-2' + (1000 + Math.floor(Math.random() * 8999)) + ' · ' + (1 + Math.floor(Math.random() * 8)) + ' cartons · ' + fmt(2 + Math.random() * 40, 1) + ' kg'; }],
    ['cam', 'Photos uploaded', function () { return (4 + Math.floor(Math.random() * 8)) + ' photos · label, open box, goods'; }],
    ['shield', 'Inspection passed', function () { var p = E.PROD[Math.floor(Math.random() * E.PROD.length)]; return p.n.split(',')[0] + ' · ' + fmt(200 + Math.floor(Math.random() * 3000), 0) + ' pcs counted'; }],
    ['layers', 'Consolidated', function () { return (2 + Math.floor(Math.random() * 6)) + ' parcels into 1 · saved ' + (18 + Math.floor(Math.random() * 30)) + '% volume'; }],
    ['plane', 'Loaded on flight', function () { return 'CAN → KUL · ' + fmt(120 + Math.random() * 600, 0) + ' kg'; }],
    ['boat', 'Container sealed', function () { return 'Nansha → ' + ['Port Klang', 'Singapore', 'Jeddah', 'Muara', 'Jebel Ali'][Math.floor(Math.random() * 5)] + ' · 40HQ'; }]
  ];
  for (var i = 0; i < 7; i++) { var k = FEEDK[i % FEEDK.length]; LIVE.feed.push({ k: k, d: k[2](), t: Date.now() - (i + 1) * 97e3 }); }
  function feedItem(f) { return '<li><span class="fi" style="color:var(--' + (f.k[0] === 'shield' ? 'good' : f.k[0] === 'plane' || f.k[0] === 'boat' ? 'blue' : 'red') + ')">' + ic(f.k[0]) + '</span><div><b>' + f.k[1] + '</b><span>' + esc(f.d) + '</span></div><time data-ago="' + f.t + '">' + ago(f.t) + '</time></li>'; }

  /* ---------- views ---------- */
  function slideSvg(kind) {
    if (kind === 'route') return '<svg viewBox="0 0 400 280" aria-hidden="true"><defs><path id="rt1" d="M340 50 C 260 60 180 150 90 220"/><path id="rt2" d="M340 50 C 300 120 220 190 150 250"/></defs><g fill="none" stroke="rgba(255,255,255,.35)" stroke-width="2" stroke-dasharray="5 7"><use href="#rt1"/><use href="#rt2"/></g><circle cx="340" cy="50" r="10" fill="#fff"/><circle cx="340" cy="50" r="18" fill="none" stroke="#fff" opacity=".5"><animate attributeName="r" values="12;28" dur="1.8s" repeatCount="indefinite"/><animate attributeName="opacity" values=".6;0" dur="1.8s" repeatCount="indefinite"/></circle><text x="340" y="28" fill="#fff" font-size="13" font-weight="700" text-anchor="middle" font-family="DM Sans,sans-serif">Guangzhou</text><circle cx="90" cy="220" r="7" fill="#fff"/><text x="90" y="246" fill="#fff" font-size="12" text-anchor="middle" font-family="DM Sans,sans-serif">Port Klang</text><circle cx="150" cy="250" r="7" fill="#fff"/><text x="196" y="268" fill="#fff" font-size="12" text-anchor="middle" font-family="DM Sans,sans-serif">Singapore</text><g><path d="M-12 -4h24l-4 8h-16z" fill="#fff"/><rect x="-8" y="-12" width="7" height="7" fill="#FFD2D2"/><rect x="0" y="-12" width="7" height="7" fill="#fff"/><animateMotion dur="7s" repeatCount="indefinite"><mpath href="#rt1"/></animateMotion></g><g><path d="M0 0l14-5-4 9-2-4-4 2z" fill="#fff" transform="scale(1.6)"/><animateMotion dur="4s" repeatCount="indefinite" rotate="auto"><mpath href="#rt2"/></animateMotion></g></svg>';
    if (kind === 'fx') return '<svg viewBox="0 0 400 280" aria-hidden="true"><rect x="30" y="80" width="140" height="100" rx="18" fill="rgba(255,255,255,.12)" stroke="rgba(255,255,255,.4)"/><text x="100" y="142" fill="#fff" font-size="34" font-weight="900" text-anchor="middle" font-family="Montserrat,sans-serif">RM</text><rect x="230" y="80" width="140" height="100" rx="18" fill="#fff"/><text x="300" y="146" fill="#1E5FA8" font-size="42" font-weight="900" text-anchor="middle" font-family="Montserrat,sans-serif">¥</text><path d="M180 130h40" stroke="#fff" stroke-width="4" stroke-dasharray="6 6" stroke-linecap="round"><animate attributeName="stroke-dashoffset" values="24;0" dur="1s" repeatCount="indefinite"/></path><text x="200" y="220" fill="#fff" font-size="14" text-anchor="middle" font-family="JetBrains Mono,monospace">1 MYR = ¥' + E.MYR_CNY + '</text></svg>';
    var p = P('p1'); return '<div style="width:260px;max-width:100%;border-radius:18px;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,.25);transform:rotate(-3deg)">' + art(p, 1, 0) + '</div>';
  }
  var HI = {
    ship: ['#FFF1DB', '#E08A00', '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" fill="#F5A400" stroke="none"/><path d="M4 7.5l8 4.5 8-4.5M12 12v9" stroke="#fff"/><path d="M8 5.3l8 4.5" stroke="#fff"/>'],
    shop: ['#FDECEC', '#D40B0B', '<path d="M3 21V10l5 3V10l5 3V6l8 4v11z" fill="#D40B0B" stroke="none"/><path d="M8 17h2M13 17h2M17 17h1" stroke="#fff"/>'],
    pay: ['#E8F0FA', '#1E5FA8', '<rect x="3" y="5" width="18" height="14" rx="4" fill="#1E5FA8" stroke="none"/><path d="M9 9l3 3.5L15 9M12 12.5V16M9.5 13.5h5" stroke="#fff"/>'],
    group: ['#E5F4EB', '#138A4A', '<circle cx="9" cy="8" r="3.4" fill="#138A4A" stroke="none"/><circle cx="17" cy="9.5" r="2.6" fill="#4FC47E" stroke="none"/><path d="M2.8 20c.5-3.8 3-5.6 6.2-5.6s5.7 1.8 6.2 5.6z" fill="#138A4A" stroke="none"/><path d="M14.5 14.6c3-.6 5.7.9 6.4 4.9h-4.6" fill="#4FC47E" stroke="none"/>'],
    escrow: ['#F0EBFB', '#6B4FD8', '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" fill="#6B4FD8" stroke="none"/><path d="M8.5 12l2.5 2.5 4.5-4.5" stroke="#fff"/>'],
    track: ['#E3F6F5', '#0F8A83', '<path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z" fill="#0F8A83" stroke="none"/><circle cx="12" cy="9" r="2.6" fill="#fff" stroke="none"/>'],
    credit: ['#FFEEE6', '#D9541E', '<rect x="3" y="6" width="18" height="13" rx="3" fill="#D9541E" stroke="none"/><path d="M3 10h18" stroke="#fff"/><path d="M7 15h4" stroke="#fff"/>'],
    factory: ['#EEF1F4', '#44474F', '<path d="M4 20V9l8-5 8 5v11z" fill="#44474F" stroke="none"/><path d="M9 20v-6h6v6" stroke="#fff"/>'],
    inspect: ['#FDF4DE', '#B8912F', '<circle cx="10.5" cy="10.5" r="6.5" fill="#B8912F" stroke="none"/><path d="M15.5 15.5L20 20" stroke="#B8912F" stroke-width="3"/><path d="M8 10.5l2 2 3.5-3.5" stroke="#fff"/>'],
    calc: ['#EEF1F4', '#16181C', '<rect x="5" y="3" width="14" height="18" rx="3" fill="#16181C" stroke="none"/><rect x="8" y="6" width="8" height="3" rx="1" fill="#fff" stroke="none"/><path d="M8.5 13h.01M12 13h.01M15.5 13h.01M8.5 16.5h.01M12 16.5h.01M15.5 16.5h.01" stroke="#fff" stroke-width="2.4"/>'],
    help: ['#FCE9F1', '#C2327A', '<path d="M4 5h16v11H9l-5 4z" fill="#C2327A" stroke="none"/><path d="M8.5 10.5h.01M12 10.5h.01M15.5 10.5h.01" stroke="#fff" stroke-width="2.4"/>'],
    newgroup: ['#E5F4EB', '#138A4A', '<circle cx="12" cy="12" r="9" fill="#138A4A" stroke="none"/><path d="M12 8v8M8 12h8" stroke="#fff"/>'],
    wallet: ['#FDECEC', '#D40B0B', '<rect x="3" y="6" width="18" height="13" rx="3" fill="#D40B0B" stroke="none"/><path d="M16 12.5h2" stroke="#fff"/>'],
    orders: ['#F0EBFB', '#6B4FD8', '<rect x="5" y="3" width="14" height="18" rx="2" fill="#6B4FD8" stroke="none"/><path d="M9 8h6M9 12h6M9 16h4" stroke="#fff"/>']
  };
  function hic(k) { var d = HI[k]; return '<span class="hic" style="background:' + d[0] + '"><svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d[2] + '</svg></span>'; }
  var SHORT = { ship: ['EZI Ship', '#ship'], shop: ['Shop', '#shop-all'], pay: ['Pay supplier', '#wallet'], group: ['Group buy', '#group'], escrow: ['Escrow', '#orders'], track: ['Track', '#track'], credit: ['EZI Credit', '#credit'], factory: ['Factories', '#factories'], inspect: ['Inspection', '#ship'], calc: ['Rates', '#ship'], help: ['Help & AI', '#help'], newgroup: ['New deal', '#group'], wallet: ['Top up', '#wallet'], orders: ['My orders', '#orders'] };
  function tile(k, extra) { var x = SHORT[k], act = k === 'help' ? ' data-act="assist"' : k === 'newgroup' ? ' data-act="newgroup"' : k === 'wallet' ? ' data-act="topup"' : ''; var d = HI[k]; return '<a class="hq hq-o" href="' + x[1] + '"' + act + ' style="--oc:' + d[1] + ';--ob:' + d[0] + '">' + orbIc(d) + '<span>' + x[0] + '</span>' + (extra || '') + '</a>'; }
  function banners() {
    var g = E.GROUP[0], gp = P(g.p);
    var B = [
      ['bn-red', 'Group deal · ' + g.shops + ' shops in', gp.n.split(' with')[0].split(',')[0], 'Drops to ' + cny(g.ladder[g.ladder.length - 1][1]) + ' at ' + fmt(g.goal, 0) + ' pcs', 'Join now', '#p-' + gp.id, 'deal'],
      ['bn-ink', 'EZI Ship', 'Your own warehouse in Guangzhou', '14 days free storage · photos on arrival', 'Get my address', '#ship', 'ship'],
      ['bn-blue', 'EZI Wallet', 'Pay any Chinese supplier in yuan', '1 MYR = ¥' + E.MYR_CNY + ' · rate locked 10 min', 'Pay supplier', '#wallet', 'fx'],
      ['bn-amber', 'By air', 'Guangzhou → Kuala Lumpur in 5–7 days', 'Next flight closes in <b class="num" data-end="' + airCut() + '">--</b>', 'Calculate', '#ship', 'plane']
    ];
    var art = {
      deal: '<div class="bn-prod">' + ART(gp, 1, 0) + '</div>',
      ship: '<svg viewBox="0 0 200 120" aria-hidden="true"><path d="M20 100V60l20 12V60l20 12V60l20 12V40h14v60z" fill="rgba(255,255,255,.9)"/><rect x="104" y="82" width="26" height="18" rx="2" fill="#F5A400" class="bn-bx b1"/><rect x="134" y="82" width="26" height="18" rx="2" fill="#FF5A4A" class="bn-bx b2"/><rect x="119" y="62" width="26" height="18" rx="2" fill="#C58B4A" class="bn-bx b3"/><path d="M0 100h200" stroke="rgba(255,255,255,.5)" stroke-width="2"/></svg>',
      fx: '<svg viewBox="0 0 200 120" aria-hidden="true"><rect x="16" y="30" width="70" height="56" rx="12" fill="rgba(255,255,255,.18)" stroke="rgba(255,255,255,.6)"/><text x="51" y="66" text-anchor="middle" fill="#fff" font-size="22" font-weight="900" font-family="Montserrat,sans-serif">RM</text><rect x="114" y="30" width="70" height="56" rx="12" fill="#fff"/><text x="149" y="69" text-anchor="middle" fill="#1E5FA8" font-size="28" font-weight="900" font-family="Montserrat,sans-serif">¥</text><path class="bn-arr" d="M90 58h20" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-dasharray="4 5"/></svg>',
      plane: '<svg viewBox="0 0 200 120" aria-hidden="true"><path d="M10 100 C 70 30 130 30 190 50" fill="none" stroke="rgba(22,24,28,.35)" stroke-width="2" stroke-dasharray="5 6"/><g class="bn-pl"><path d="M0 0l30-10-9 20-4-8-9 5z" fill="#16181C"/></g><circle cx="10" cy="100" r="5" fill="#16181C"/><circle cx="190" cy="50" r="5" fill="#D40B0B"/></svg>'
    };
    return '<section class="bn" aria-label="Offers"><div class="bn-track" id="bn-track">' + B.map(function (b) { return '<a class="bn-c ' + b[0] + '" href="' + b[5] + '"><div class="bn-tx"><span class="bn-k">' + b[1] + '</span><b>' + esc(b[2]) + '</b><small>' + b[3] + '</small><span class="bn-go">' + b[4] + ' ' + ic('arrow', 16) + '</span></div><div class="bn-art">' + art[b[6]] + '</div></a>'; }).join('') + '</div><div class="bn-dots">' + B.map(function (_, i) { return '<i class="' + (i ? '' : 'on') + '"></i>'; }).join('') + '</div></section>';
  }
  function recentBlock() {
    var L = S.ledger.slice(0, 3); if (!L.length) return '';
    return '<section class="hsec"><div class="sec-h"><h2>Recent activity</h2><a href="#wallet">See all</a></div><div class="card act-list">' + L.map(function (l) {
      var k = l.k === 'in' ? 'in' : l.k === 'escrow' ? 'esc' : 'out';
      return '<a class="act-r" href="#wallet"><span class="act-ic act-' + k + '">' + ic(k === 'in' ? 'plus' : k === 'esc' ? 'shield' : 'arrow', 16) + '</span><span class="act-m"><b>' + esc(l.d) + '</b><small>' + ago(l.t) + '</small></span><span class="num act-a act-a-' + k + '">' + (S.hideBal ? '••••' : (l.a > 0 ? '+' : '−') + money(Math.abs(l.a))) + '</span></a>';
    }).join('') + '</div></section>';
  }
  function keepBlock() {
    var R = (S.recent || []).map(P).filter(Boolean).slice(0, 8); if (!R.length) return '';
    return '<section class="hsec"><div class="sec-h"><h2>Keep shopping</h2><button class="linkbtn" data-act="clearrecent">Clear</button></div><div class="keep">' + R.map(function (p) { return '<a class="keep-i" href="#p-' + p.id + '"><span class="keep-im">' + art(p) + '</span><b class="num">' + cny(p.t[p.t.length - 1][1]) + '</b></a>'; }).join('') + '</div></section>';
  }
  function homeView() {
    var stored = S.parcels.filter(function (x) { return x.st === 'stored'; }), minD = stored.length ? Math.min.apply(null, stored.map(function (x) { return 14 + (x.extra || 0) - Math.floor((Date.now() - x.arr) / 864e5); })) : 14;
    var active = S.orders.filter(function (o) { return o.step < 6; }).length;
    var gh = +new Date().toLocaleString('en-GB', { hour: '2-digit', hour12: false, timeZone: 'Asia/Kuala_Lumpur' }), hi = gh < 12 ? 'Good morning' : gh < 18 ? 'Good afternoon' : 'Good evening';
    var favs = S.favs || ['orders', 'track', 'inspect', 'newgroup'];
    var bal = S.hideBal ? 'RM ••••' : money(S.wallet);
    return '<div class="view home2">' +
      '<section class="hh" data-tour="acct"><div class="hh-bg" aria-hidden="true"><i></i><i></i><svg viewBox="0 0 400 160" preserveAspectRatio="none"></svg><div class="hh-sky" aria-hidden="true"><div class="sk-plane"><div class="sk-bob"><svg viewBox="-16 -11 32 22"><path d="M14 0 4 -2.2 -1.5 -10 -5 -10 -2.5 -2.2 -9 -2.2 -12 -6 -14.5 -6 -12.5 0 -14.5 6 -12 6 -9 2.2 -2.5 2.2 -5 10 -1.5 10 4 2.2Z" fill="#fff"/></svg><i class="trail"></i></div></div></div><div class="hh-scene" aria-hidden="true"><i class="cl c1"></i><i class="cl c2"></i><i class="cl c3"></i><svg class="sc-wh" viewBox="0 0 80 50"><path d="M4 50V22l36-18 36 18v28z" fill="rgba(255,255,255,.22)"/><rect x="26" y="30" width="28" height="20" fill="rgba(255,255,255,.18)"/><path d="M26 35h28M26 40h28M26 45h28" stroke="rgba(255,255,255,.25)"/></svg><svg class="sc-port" viewBox="0 0 120 50"><path d="M0 50V30h14V18h10v12h12V8h8v22h16V22h12v28z" fill="rgba(255,255,255,.18)"/><path d="M84 50V14h4l22-10v4l-20 9v33z" fill="rgba(255,255,255,.22)"/><path d="M108 8v18" stroke="rgba(255,255,255,.3)" stroke-width="1.5"/></svg><div class="sc-sea"><svg class="wv w1" viewBox="0 0 800 24" preserveAspectRatio="none"><path d="M0 9 Q25 4 50 9 T100 9 Q125 4 150 9 T200 9 Q225 4 250 9 T300 9 Q325 4 350 9 T400 9 Q425 4 450 9 T500 9 Q525 4 550 9 T600 9 Q625 4 650 9 T700 9 Q725 4 750 9 T800 9 V24 H0Z" fill="rgba(255,255,255,.13)"/></svg><svg class="wv w2" viewBox="0 0 800 24" preserveAspectRatio="none"><path d="M0 13 Q25 9 50 13 T100 13 Q125 9 150 13 T200 13 Q225 9 250 13 T300 13 Q325 9 350 13 T400 13 Q425 9 450 13 T500 13 Q525 9 550 13 T600 13 Q625 9 650 13 T700 13 Q725 9 750 13 T800 13 V24 H0Z" fill="rgba(255,255,255,.2)"/><path d="M0 13 Q25 9 50 13 T100 13 Q125 9 150 13 T200 13 Q225 9 250 13 T300 13 Q325 9 350 13 T400 13 Q425 9 450 13 T500 13 Q525 9 550 13 T600 13 Q625 9 650 13 T700 13 Q725 9 750 13 T800 13" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="1.2"/></svg></div><div class="sc-ship"><div class="sc-bob"><svg viewBox="-46 -34 96 50"><path d="M-44 0h92l-10 16h-74z" fill="#16181C"/><path d="M-41 5h86" stroke="#FFD27A" stroke-width="3"/><rect x="-38" y="-11" width="20" height="11" rx="1" fill="#FFD27A"/><rect x="-17" y="-11" width="20" height="11" rx="1" fill="#fff"/><rect x="4" y="-11" width="20" height="11" rx="1" fill="#8FB6E8"/><rect x="-28" y="-22" width="20" height="11" rx="1" fill="#fff"/><rect x="-7" y="-22" width="20" height="11" rx="1" fill="#FFD27A"/><rect x="28" y="-24" width="14" height="24" rx="1.5" fill="#F4F4F6"/><rect x="31" y="-20" width="8" height="3" fill="#1E5FA8"/><rect x="33" y="-31" width="4" height="7" fill="#44474F"/></svg></div></div></div></div>' +
        '<div class="hh-in"><div class="hh-top"><span class="hh-av" aria-hidden="true">' + esc((S.name || 'A').split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase()) + '</span><span class="hh-hi"><small>' + hi + ',</small><b>' + esc(S.name.split(' ')[0]) + '</b></span><a class="hh-gear" href="#settings" aria-label="Settings">' + ic('gear', 19) + '</a></div>' +
        '<div class="hh-acct"><span class="hh-l">EZI Wallet</span><button class="hh-code" data-act="copycode" aria-label="Copy customer code" data-noi18n>' + esc(S.code) + ' ' + ic('copy', 12) + '</button></div>' +
        '<div class="hh-bal"><b class="num hh-v" data-live="bal">' + bal + '</b><button class="hh-eye" data-act="eye" aria-label="' + (S.hideBal ? 'Show' : 'Hide') + ' balance">' + ic('eye', 20) + '</button></div>' +
        '<div class="hh-chips"><a href="#orders">' + ic('shield', 13) + ' Escrow <b class="num">' + (S.hideBal ? '••••' : money(S.escrow, 0)) + '</b></a><a href="#credit">' + ic('credit', 13) + ' Credit <b class="num">' + money(S.credit.limit - S.credit.used, 0) + '</b></a></div>' +
        '<div class="hh-btns"><button class="hh-add" data-act="topup">' + ic('plus', 18) + ' Top up</button><a class="hh-sec" href="#wallet">' + ic('list', 17) + ' History</a></div></div></section>' +
      '<section class="hq-card" aria-label="Main actions">' + ['ship', 'shop', 'pay', 'group'].map(function (k) { return tile(k); }).join('') + '</section>' +
      '<section class="hinfo"><a class="hi-t hi-a" href="#ship"><span class="hi-ic">' + hic('ship') + '</span><span><b>' + stored.length + ' parcels in your bay</b><small>' + (stored.length ? 'Lowest: ' + minD + ' free days left' : 'Send goods to your China address') + '</small></span></a><a class="hi-t hi-b" href="#ship"><span class="hi-ic">' + hic('calc') + '</span><span><b>Next flight <span class="num" data-end="' + airCut() + '">--</span></b><small>' + active + ' active order' + (active === 1 ? '' : 's') + ' · tap to ship</small></span></a></section>' +
      banners() + recentBlock() + keepBlock() +
      '<section class="hsec"><div class="sec-h"><h2>Recommended</h2></div><div class="hq-grid">' + ['escrow', 'track', 'credit', 'factory', 'inspect', 'calc', 'help', 'newgroup'].map(function (k) { return tile(k); }).join('') + '</div></section>' +
      '<section class="hsec"><div class="sec-h"><h2>My shortcuts</h2><button class="linkbtn" data-act="favedit">Edit</button></div><div class="hq-grid">' + favs.map(function (k) { return SHORT[k] ? tile(k) : ''; }).join('') + '</div></section>' +
      '<section class="sec band band-warm"><div class="sec-h"><div><h2>Group deals closing soon</h2><p class="sec-sub">Join other shops before the timer ends and pay factory price</p></div><div class="row"><button class="btn btn-line btn-sm" data-act="newgroup">' + ic('plus', 16) + ' Start a group deal</button><a href="#group">See all</a></div></div><div class="hscroll">' + E.GROUP.map(dealCard).join('') + '</div></section>' +
      '<section class="sec band"><div class="sec-h"><div><h2>Products from verified factories</h2><p class="sec-sub">Checked factories, escrow on every order, full cost shown before you buy</p></div><a href="#shop-all">See all</a></div><div class="chips" id="hchips" style="margin-bottom:12px">' + E.CATS.slice(0, 6).map(function (c, i) { return '<button class="chip" data-act="hcat" data-c="' + c.id + '" aria-pressed="' + !i + '">' + c.n + '</button>'; }).join('') + '</div><div class="pgrid" id="hgrid">' + E.PROD.slice(0, 12).map(pcard).join('') + '</div></section>' +
      '</div>';
  }
  function warehouseLive() {
    var belt = '<svg viewBox="0 0 640 170" aria-hidden="true"><rect x="0" y="118" width="640" height="14" rx="7" fill="#2A2D33"/>' + [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(function (i) { return '<circle cx="' + (20 + i * 40) + '" cy="125" r="4" fill="#44474F"/>'; }).join('') +
      [0, 1, 2, 3].map(function (i) { return '<g><rect x="-26" y="-34" width="52" height="34" rx="4" fill="#C58B4A"/><path d="M-26 -22h52M0 -34v34" stroke="#8E5F2C" stroke-width="3"/><animateTransform attributeName="transform" type="translate" from="-60 118" to="700 118" dur="12s" begin="-' + (i * 3) + 's" repeatCount="indefinite"/></g>'; }).join('') +
      '<g transform="translate(150 20)"><rect x="-4" y="0" width="8" height="70" fill="#8A8D93"/><rect x="-40" y="-6" width="80" height="14" rx="4" fill="#F2F2F5"/><text x="0" y="5" text-anchor="middle" font-size="9" font-weight="700" font-family="JetBrains Mono,monospace" fill="#16181C">SCAN</text><rect x="-30" y="66" width="60" height="3" fill="#FF4A4A"><animate attributeName="opacity" values="1;.2;1" dur=".9s" repeatCount="indefinite"/></rect></g>' +
      '<g transform="translate(320 26)"><rect x="-34" y="0" width="68" height="44" rx="8" fill="#F2F2F5"/><circle cx="0" cy="22" r="13" fill="#16181C"/><circle cx="0" cy="22" r="6" fill="#D40B0B"><animate attributeName="r" values="6;8;6" dur="1.4s" repeatCount="indefinite"/></circle><text x="0" y="-8" text-anchor="middle" font-size="10" fill="#fff" font-family="DM Sans,sans-serif">PHOTO</text></g>' +
      '<g transform="translate(490 30)"><rect x="-40" y="0" width="80" height="30" rx="6" fill="#0B0C0E" stroke="#44474F"/><text x="0" y="20" text-anchor="middle" font-size="15" font-weight="700" fill="#FF4A4A" font-family="JetBrains Mono,monospace" data-live="wt">' + fmt(LIVE.wt, 1) + ' kg</text><text x="0" y="-8" text-anchor="middle" font-size="10" fill="#fff" font-family="DM Sans,sans-serif">WEIGH</text></g></svg>';
    return '<div class="wh"><div class="wh-stage"><div class="between"><b>Receiving line · Baiyun, Guangzhou</b><span class="sample" style="color:rgba(255,255,255,.7)" data-clock="Asia/Shanghai">--:--</span></div>' + belt +
      '<div class="wh-stats"><div><b class="num" data-live="rx">' + fmt(LIVE.rx, 0) + '</b><span>parcels received today</span></div><div><b class="num" data-live="insp">' + LIVE.insp + '</b><span>inspections done</span></div><div><b class="num" data-live="out">' + LIVE.out + '</b><span>shipments departed</span></div><div><b class="num">98.7%</b><span>pass rate this week</span></div></div></div>' +
      '<div class="card pad" style="padding-block:6px"><ul class="feed" id="feed" style="padding:0;margin:0">' + LIVE.feed.map(feedItem).join('') + '</ul></div></div>';
  }
  function quoteWidget(k) {
    return '<div class="stack" data-quote="' + k + '"><div class="f2"><div class="field"><label for="' + k + 'q-d">Ship to</label><select id="' + k + 'q-d">' + E.DEST.map(function (d) { return '<option value="' + d.id + '">' + d.n + '</option>'; }).join('') + '</select></div><div class="field"><label for="' + k + 'q-kg">Total weight (kg)</label><input id="' + k + 'q-kg" type="number" min="0" step="0.1" value="25"></div></div>' +
      '<div class="f3"><div class="field"><label for="' + k + 'q-l">Carton L cm</label><input id="' + k + 'q-l" type="number" value="60"></div><div class="field"><label for="' + k + 'q-w">W cm</label><input id="' + k + 'q-w" type="number" value="40"></div><div class="field"><label for="' + k + 'q-h">H cm</label><input id="' + k + 'q-h" type="number" value="35"></div></div>' +
      '<div class="field"><label for="' + k + 'q-n">Cartons</label><input id="' + k + 'q-n" type="number" min="1" value="2"></div>' +
      '<div class="res"><div class="ln"><span class="muted">Chargeable weight (L×W×H ÷ 6000)</span><b class="num" data-o="ch">–</b></div><div class="ln"><span class="muted">Volume</span><b class="num" data-o="cbm">–</b></div>' +
      '<div class="ln"><span>' + ic('plane', 16) + ' Air express · <span data-o="ad"></span> days</span><b class="num" data-o="air" style="color:var(--red)">–</b></div><div class="ln"><span>' + ic('boat', 16) + ' Sea LCL · <span data-o="sd"></span> days</span><b class="num" data-o="sea">–</b></div></div><span class="sample">Sample rates. Real prices are set by EZICARGO Control.</span></div>';
  }
  function runQuote(root) {
    var k = root.getAttribute('data-quote'), v = function (id) { return +($('#' + k + id).value) || 0; };
    var d = E.DEST.filter(function (x) { return x.id === $('#' + k + 'q-d').value; })[0];
    var cbm = v('q-l') * v('q-w') * v('q-h') / 1e6 * Math.max(1, v('q-n')), ch = Math.max(v('q-kg'), cbm * 1e6 / 6000);
    var o = function (n) { return root.querySelector('[data-o="' + n + '"]'); };
    o('ch').textContent = fmt(ch, 1) + ' kg'; o('cbm').textContent = fmt(cbm, 3) + ' CBM'; o('air').textContent = money(ch * d.air); o('sea').textContent = money(Math.max(.5, cbm) * d.sea); o('ad').textContent = d.ad; o('sd').textContent = d.sd;
  }
  function fxWidget(k) {
    return '<div class="stack" data-fx="' + k + '"><div class="field"><label for="' + k + 'x-a">You pay (MYR)</label><input id="' + k + 'x-a" inputmode="decimal" value="100000"></div><div class="res"><span class="sample">Supplier receives</span><b class="num" style="font:900 30px var(--display);color:var(--blue)" data-o="out">–</b><div class="ln"><span class="muted">Rate</span><b class="num">1 MYR = ¥' + E.MYR_CNY + '</b></div><div class="ln"><span class="muted">Fee 0.5%</span><b class="num" data-o="fee">–</b></div><div class="ln"><span class="muted">Arrives</span><b>Same day · Alipay, WeChat Pay or bank</b></div></div><p class="sample" data-o="big" hidden>Large transfer: verified business account, SSM profile and supplier invoice needed. No upper limit for verified accounts.</p>' + (k === 'h' ? '<a class="btn btn-ink" href="#wallet">Pay a supplier</a>' : '') + '</div>';
  }
  function runFx(root) { var k = root.getAttribute('data-fx'), a = parseFloat(String($('#' + k + 'x-a').value).replace(/[^0-9.]/g, '')) || 0, f = a * .005, o = function (n) { return root.querySelector('[data-o="' + n + '"]'); }; o('out').textContent = '¥' + fmt((a - f) * E.MYR_CNY, 2); o('fee').textContent = 'RM ' + fmt(f, 2); o('big').hidden = a < 50000; }

  function shopView(cat, q) {
    q = (q || '').toLowerCase();
    var list = E.PROD.filter(function (p) { return (cat === 'all' || !cat || p.c === cat) && (!q || (p.n + ' ' + E.FACT[p.f].n).toLowerCase().indexOf(q) > -1); });
    var c = E.CATS.filter(function (x) { return x.id === cat; })[0] || E.CATS[0];
    return '<div class="view"><div class="crumbs"><a href="#home">Home</a> / ' + (q ? 'Search' : c.n) + '</div><div class="phead"><div><h1>' + (q ? 'Results for “' + esc(q) + '”' : c.n === 'All' ? 'All products' : c.n) + '</h1><p>' + list.length + ' products from verified factories. Every order is paid into escrow and inspected in Guangzhou.</p></div>' +
      '<div class="row"><label class="sample" for="sort">Sort</label><select id="sort" class="cur" style="display:block"><option value="pop">Best selling</option><option value="lo">Lowest price</option><option value="moq">Lowest MOQ</option><option value="sc">Factory score</option></select></div></div>' +
      '<div class="chips" style="margin-bottom:16px">' + E.CATS.map(function (x) { return '<a class="chip" style="text-decoration:none" href="#shop-' + x.id + '" aria-pressed="' + (x.id === (cat || 'all') && !q) + '">' + x.n + '</a>'; }).join('') + '</div>' +
      (list.length ? '<div class="pgrid" id="sgrid">' + list.map(pcard).join('') + '</div>' : '<div class="card empty">' + ic('search', 32) + '<b>No products match “' + esc(q) + '”</b><span>Post a buying request and our sourcing team finds verified factories for you.</span><button class="btn btn-red" data-act="rfq">Post a buying request</button></div>') + '</div>';
  }

  var PD = {};
  function productView(id) {
    var p = P(id); if (!p) return shopView('all');
    S.recent = [p.id].concat((S.recent || []).filter(function (x) { return x !== p.id; })).slice(0, 12); save();
    var f = E.FACT[p.f], g = groupFor(p.id);
    PD = { p: p, q: Math.max(p.t[1][0], p.t[0][0]), col: 0, dest: 'MY', mode: 'sea', insp: 'std', sell: Math.round(rmOf(p.t[0][1]) * 3.2) };
    var tiers = p.t.map(function (t, i) { return '<div data-tier="' + i + '"><small>' + fmt(t[0], 0) + (p.t[i + 1] ? '–' + fmt(p.t[i + 1][0] - 1, 0) : '+') + ' pcs</small><b>' + cny(t[1]) + '</b><small data-rm="' + t[1] + '">' + money(rmOf(t[1])) + '</small></div>'; }).join('');
    return '<div class="view"><div class="crumbs"><a href="#home">Home</a> / <a href="#shop-' + p.c + '">' + E.CATS.filter(function (c) { return c.id === p.c; })[0].n + '</a> / ' + esc(p.n.split(',')[0]) + '</div><div class="pd">' +
      '<div class="gal"><div class="main" id="gmain">' + art(p, 0) + '</div><div class="ths">' + p.col.map(function (c, i) { return '<button data-act="col" data-i="' + i + '" aria-pressed="' + !i + '" aria-label="Colour ' + (i + 1) + '">' + art(p, i) + '</button>'; }).join('') + '</div></div>' +
      '<div class="stack" style="--g:16px"><div class="row" style="gap:6px">' + (g ? '<span class="pill red">' + ic('group', 12) + ' Group deal live</span>' : '') + '<span class="pill ' + (LVL[f.lv] || '') + '">' + f.lv + ' factory</span>' + p.tags.map(function (t) { return '<span class="pill">' + t + '</span>'; }).join('') + '</div>' +
        '<h1 style="font-size:clamp(22px,2.4vw,28px);font-weight:800">' + esc(p.n) + '</h1><div class="row sample"><span class="rv-mini" data-rv-mini="' + p.id + '" data-rv-long="1">No reviews yet</span><span>·</span><span>' + fmt(p.sold, 0) + ' pcs sold</span><span>·</span><span>Lead time ' + p.lead + '</span></div>' +
        '<div class="tiers" id="tiers">' + tiers + '</div>' +
        '<div class="stack" style="--g:8px"><b style="font-size:14px">Colour</b><div class="row">' + p.col.map(function (c, i) { return '<button class="swatch" style="background:' + c + '" data-act="col" data-i="' + i + '" aria-pressed="' + !i + '" aria-label="Colour ' + (i + 1) + '"></button>'; }).join('') + '</div></div>' +
        '<div class="stack" style="--g:8px"><b style="font-size:14px">Quantity</b><div class="row"><div class="qty"><button data-act="qm" aria-label="Less">−</button><input id="pq" inputmode="numeric" value="' + PD.q + '" aria-label="Quantity"><button data-act="qp" aria-label="More">+</button></div><span class="sample" id="tierhint"></span></div></div>' +
        (g ? '<div class="card pad stack" style="--g:10px;border-color:var(--red);background:var(--red-tint)"><div class="between"><b>' + ic('group', 16) + ' Group deal · ' + cny(g.ladder[g.ladder.length - 1][1]) + ' at ' + fmt(g.goal, 0) + ' pcs</b><span class="pill ink num" data-end="' + g.ends + '">--</span></div><div class="bar"><i data-gb="' + g.id + '" style="width:' + (g.got / g.goal * 100).toFixed(1) + '%"></i></div><div class="between sample"><span><b class="num" data-gg="' + g.id + '" style="color:var(--ink)">' + fmt(g.got, 0) + '</b> of ' + fmt(g.goal, 0) + ' pcs committed</span><span data-gs="' + g.id + '">' + g.shops + ' shops</span></div><button class="btn btn-red" data-act="join" data-g="' + g.id + '">Join with 30% deposit</button></div>' : '<div class="card pad stack nogroup" style="--g:8px"><b>' + ic('group', 16) + ' No group deal for this product yet</b><span class="sample" style="font-size:13.5px">Start one: other shops join, and when the total reaches ' + fmt(p.t[p.t.length - 1][0], 0) + ' pcs everyone pays ' + cny(p.t[p.t.length - 1][1]) + '.</span><button class="btn btn-line" data-act="newgroup" data-p="' + p.id + '">' + ic('plus', 16) + ' Start a group deal</button></div>') +
        '<div class="card pad stack"><b>Details</b><dl class="spec"><dt>Factory</dt><dd>' + esc(f.n) + '</dd><dt>Location</dt><dd>' + f.city + '</dd><dt>Minimum order</dt><dd>' + fmt(p.t[0][0], 0) + ' pcs</dd><dt>Weight per piece</dt><dd>' + p.kg + ' kg packed</dd><dt>Volume per piece</dt><dd>' + p.cbm + ' CBM</dd><dt>Brand</dt><dd>' + f.type + '. No copies of other brands.</dd><dt>Payment</dt><dd>Escrow. The factory is paid after our inspection passes.</dd></dl></div>' +
        '<div class="card pad stack"><b>How your order moves</b><div class="hsteps">' + E.ORDER_STEPS.map(function (s, i) { return '<div class="' + (i === 0 ? 'now' : '') + '"><i></i>' + s[0] + '</div>'; }).join('') + '</div></div></div>' +
      '<aside class="buybox"><div class="card pad stack" style="--g:12px"><div class="between"><b style="font-size:16px">Landed cost to your shop</b><span class="pill good">' + ic('shield', 12) + ' Escrow</span></div>' +
        '<div class="field"><label for="pd-dest">Deliver to</label><select id="pd-dest">' + E.DEST.map(function (d) { return '<option value="' + d.id + '">' + d.n + '</option>'; }).join('') + '</select></div>' +
        '<div class="seg" role="group" aria-label="Shipping"><button data-act="mode" data-m="sea" aria-pressed="true">' + 'Sea<small data-o="sd"></small></button><button data-act="mode" data-m="air" aria-pressed="false">Air<small data-o="ad"></small></button></div>' +
        '<div class="field"><label for="pd-insp">Inspection</label><select id="pd-insp"><option value="photo">Photo check · RM 5 / carton</option><option value="std" selected>Standard QC · 1.5% of goods</option><option value="full">Full count + QC · 3%</option></select></div>' +
        '<div class="res"><div class="ln"><span class="muted">Goods <span id="o-qx"></span></span><b class="num" id="o-goods"></b></div><div class="ln"><span class="muted">Inspection</span><b class="num" id="o-insp"></b></div><div class="ln"><span class="muted">Shipping <span id="o-sh"></span></span><b class="num" id="o-ship"></b></div><div class="ln"><span class="muted">Payment fee 0.5%</span><b class="num" id="o-fee"></b></div><div class="ln tot"><span>Total</span><b class="num" id="o-tot"></b></div><div class="ln"><span class="muted">Per piece at your door</span><b class="num" id="o-pp" style="font-size:16px"></b></div></div>' +
        '<div class="res" style="background:var(--good-soft)"><div class="ln" style="align-items:center"><label for="pd-sell" style="font-weight:700;font-size:13.5px">Your selling price / pc</label><input id="pd-sell" class="num" inputmode="decimal" value="' + PD.sell + '" style="width:110px;height:36px;border:1px solid var(--line-2);border-radius:8px;text-align:end;padding:0 8px"></div><div class="ln"><span>Profit</span><b class="num" id="o-prof" style="color:var(--good)"></b></div></div>' +
        '<div class="row" style="gap:8px"><button class="btn btn-soft btn-sm" style="flex:1" data-act="sample">Order a sample · ' + money(rmOf(p.t[0][1]) + 28) + '</button><a class="btn btn-line btn-sm" style="flex:1" href="#chat-' + p.f + '-' + p.id + '">' + ic('chat', 16) + ' Chat with factory</a></div></div>' +
        '<a class="card pad fcard" href="#f-' + p.f + '">' + ring(f.sc) + '<div style="min-width:0"><b style="display:flex;gap:6px;align-items:center">' + esc(f.n) + ' ' + VT + '</b><span class="sample">Replies in ' + f.resp + ' · pass rate ' + f.pass + '% · on time ' + f.ontime + '%</span></div></a></aside>' +
    '</div><section class="sec" id="reviews" data-rv="' + p.id + '"></section><div class="pbar" role="region" aria-label="Buy"><a class="pbar-chat" href="#chat-' + p.f + '-' + p.id + '">' + ic('chat', 20) + '<span>Chat</span></a><button class="btn btn-line btn-lg" data-act="opt" data-mode="cart">' + ic('cart', 18) + ' Add to cart</button><button class="btn btn-red btn-lg" data-act="opt" data-mode="buy">Buy now</button></div><section class="sec"><div class="sec-h"><h2>More from verified factories</h2></div><div class="pgrid">' + E.PROD.filter(function (x) { return x.c === p.c && x.id !== p.id; }).concat(E.PROD.filter(function (x) { return x.c !== p.c; })).slice(0, 6).map(pcard).join('') + '</div></section></div>';
  }
  function optSheet(mode) {
    var p = PD.p; closeLayer(); var s = document.createElement('div'); s.className = 'scrim'; s.setAttribute('data-act', 'close'); var d = document.createElement('div'); d.className = 'sheet osheet'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-label', mode === 'cart' ? 'Add to cart' : 'Buy now');
    d.innerHTML = '<div class="os-top"><span class="os-img" id="o-img">' + art(p, PD.col) + '</span><div style="flex:1;min-width:0"><b class="os-price num" id="o-price"></b><div class="sample" id="o-tier"></div></div><button class="x" data-act="close" aria-label="Close">×</button></div>' +
      '<div class="stack" style="--g:8px"><b>Colour</b><div class="row">' + p.col.map(function (c, i) { return '<button class="swatch" style="background:' + c + '" data-act="ocol" data-i="' + i + '" aria-pressed="' + (i === PD.col) + '" aria-label="Colour ' + (i + 1) + '"></button>'; }).join('') + '</div></div>' +
      '<div class="stack" style="--g:8px"><b>Quantity</b><div class="row"><div class="qty"><button data-act="oq" data-d="-1" aria-label="Less">−</button><input id="oq" inputmode="numeric" value="' + PD.q + '" aria-label="Quantity"><button data-act="oq" data-d="1" aria-label="More">+</button></div><span class="sample" id="o-hint"></span></div></div>' +
      (mode === 'buy' ? '<div class="f2"><div class="field"><label for="o-dest">Deliver to</label><select id="o-dest">' + E.DEST.map(function (x) { return '<option value="' + x.id + '"' + (x.id === PD.dest ? ' selected' : '') + '>' + x.n + '</option>'; }).join('') + '</select></div><div class="field"><label>Shipping</label><div class="seg" role="group"><button data-act="omode" data-m="sea" aria-pressed="' + (PD.mode === 'sea') + '">Sea</button><button data-act="omode" data-m="air" aria-pressed="' + (PD.mode === 'air') + '">Air</button></div></div></div>' : '') +
      '<div class="res"><div class="ln"><span class="muted">Goods</span><b class="num" id="o-g"></b></div>' + (mode === 'buy' ? '<div class="ln"><span class="muted">Shipping, inspection, fees</span><b class="num" id="o-x"></b></div>' : '') + '<div class="ln tot"><span>' + (mode === 'buy' ? 'Total to your door' : 'Goods total') + '</span><b class="num" id="o-t"></b></div></div><div class="fl-err" id="o-err"></div>' +
      '<button class="btn btn-red btn-lg btn-block" data-act="odo" data-mode="' + mode + '">' + (mode === 'cart' ? ic('cart', 18) + ' Add to cart' : 'Continue to checkout') + '</button>';
    document.body.appendChild(s); document.body.appendChild(d); d.querySelector('#oq').addEventListener('input', runOpt); var od = d.querySelector('#o-dest'); if (od) od.addEventListener('change', runOpt); runOpt();
  }
  function runOpt() {
    var p = PD.p, q = parseInt(($('#oq') || {}).value, 10) || 0, u = unit(p, q), t = tierOf(p, q), nx = p.t[p.t.indexOf(t) + 1];
    $('#o-price').textContent = cny(u) + ' /pc · ' + money(rmOf(u));
    $('#o-tier').textContent = q < p.t[0][0] ? 'Minimum ' + fmt(p.t[0][0], 0) + ' pcs' : nx ? 'Add ' + fmt(nx[0] - q, 0) + ' pcs for ' + cny(nx[1]) + ' /pc' : 'Best price reached';
    $('#o-hint').textContent = 'MOQ ' + fmt(p.t[0][0], 0);
    $('#o-g').textContent = money(rmOf(u * q)); $('#o-err').textContent = '';
    if ($('#o-x')) { var L = landed(p, Math.max(1, q), $('#o-dest').value, PD.mode, PD.insp); $('#o-x').textContent = money(L.tot - L.goods); $('#o-t').textContent = money(L.tot); } else $('#o-t').textContent = money(rmOf(u * q));
  }
  function setTheme(t) { if (t === 'light') document.documentElement.removeAttribute('data-ezt'); else document.documentElement.setAttribute('data-ezt', t); try { localStorage.setItem('ezi-theme', t); } catch (e) {} }
  function curTheme() { return document.documentElement.getAttribute('data-ezt') || 'light'; }
  function themePick() { return '<div class="theme-pick">' + [['light', 'Light', '#FFFFFF', '#F6F4F4'], ['soft', 'Mist', '#B9C7D8', '#14294A'], ['dark', 'Dark', '#1B1D21', '#121316']].map(function (x) { return '<button type="button" data-act="settheme" data-t="' + x[0] + '" aria-pressed="' + (curTheme() === x[0]) + '"><i style="background:linear-gradient(135deg,' + x[2] + ' 50%,' + x[3] + ' 50%)"></i>' + x[1] + '</button>'; }).join('') + '</div>'; }
  function themeSheet() { modal('<div class="between"><h3>Display</h3><button class="x" data-act="close" aria-label="Close">×</button></div>' + themePick() + '<span class="sample">Mist is an ocean-blue look between light and dark. Saved on this device.</span>'); }
  try { var th0 = localStorage.getItem('ezi-theme'); if (th0 && th0 !== 'light') document.documentElement.setAttribute('data-ezt', th0); } catch (e) {}
  function landed(p, q, dest, mode, insp) {
    var u = unit(p, q), goods = rmOf(u * q), d = E.DEST.filter(function (x) { return x.id === dest; })[0];
    var cbm = p.cbm * q, kg = p.kg * q, ctn = Math.max(1, Math.ceil(cbm / .06));
    var ship = mode === 'air' ? Math.max(kg, cbm * 1e6 / 6000) * d.air : Math.max(.5, cbm) * d.sea;
    var ins = insp === 'photo' ? ctn * 5 : insp === 'full' ? goods * .03 : goods * .015;
    var fee = goods * .005, tot = goods + ship + ins + fee;
    return { u: u, goods: goods, ship: ship, ins: ins, fee: fee, tot: tot, pp: tot / q, cbm: cbm, kg: kg, ctn: ctn, d: d };
  }
  function runProduct() {
    var p = PD.p; if (!p || !$('#pq')) return;
    PD.q = Math.max(1, parseInt($('#pq').value, 10) || 0); PD.dest = $('#pd-dest').value; PD.insp = $('#pd-insp').value; PD.sell = parseFloat($('#pd-sell').value) || 0;
    var L = landed(p, PD.q, PD.dest, PD.mode, PD.insp), ti = p.t.indexOf(tierOf(p, PD.q));
    $$('#tiers [data-tier]').forEach(function (el, i) { el.classList.toggle('on', i === ti); });
    var nx = p.t[ti + 1]; $('#tierhint').textContent = PD.q < p.t[0][0] ? 'Minimum order is ' + fmt(p.t[0][0], 0) + ' pcs' : nx ? 'Add ' + fmt(nx[0] - PD.q, 0) + ' pcs to pay ' + cny(nx[1]) + ' /pc' : 'Best price tier reached';
    $('#o-qx').textContent = fmt(PD.q, 0) + ' × ' + cny(L.u); $('#o-goods').textContent = money(L.goods); $('#o-insp').textContent = money(L.ins); $('#o-sh').textContent = '· ' + fmt(L.cbm, 2) + ' CBM · ' + fmt(L.kg, 0) + ' kg'; $('#o-ship').textContent = money(L.ship); $('#o-fee').textContent = money(L.fee); $('#o-tot').textContent = money(L.tot); $('#o-pp').textContent = money(L.pp);
    $$('[data-o="sd"]').forEach(function (x) { x.textContent = L.d.sd + ' days'; }); $$('[data-o="ad"]').forEach(function (x) { x.textContent = L.d.ad + ' days'; });
    var prof = (PD.sell / E.CUR[S.cur].r - L.pp) * PD.q, marg = PD.sell ? (1 - L.pp / (PD.sell / E.CUR[S.cur].r)) * 100 : 0;
    $('#o-prof').textContent = money(prof, 0) + ' · ' + fmt(marg, 0) + '% margin';
    $('#o-prof').style.color = prof >= 0 ? 'var(--good)' : 'var(--red)';
    var low = PD.q < p.t[0][0]; $$('[data-act="buy"],[data-act="add"]').forEach(function (b) { b.disabled = low; });
  }

  function cartView() {
    if (!S.cart.length) return '<div class="view"><div class="phead"><h1>Cart</h1></div><div class="card empty">' + ic('cart', 36) + '<b>Your cart is empty</b><span>Add products from verified factories. You pay into escrow at checkout.</span><a class="btn btn-red" href="#shop-all">Browse products</a></div></div>';
    var byF = {}; S.cart.forEach(function (c, i) { var p = P(c.p); (byF[p.f] = byF[p.f] || []).push([c, i, p]); });
    var rows = Object.keys(byF).map(function (fid) { var f = E.FACT[fid]; return '<div class="card" style="margin-bottom:12px"><div class="between" style="padding:12px 16px;border-bottom:1px solid var(--line)"><b style="display:flex;gap:6px;align-items:center">' + ic('factory', 18) + esc(f.n) + VT + '</b><span class="pill ' + (LVL[f.lv] || '') + '">' + f.lv + '</span></div>' + byF[fid].map(function (x) { var c = x[0], p = x[2], u = unit(p, c.q), nx = p.t[p.t.indexOf(tierOf(p, c.q)) + 1]; return '<div class="lrow"><a class="th" href="#p-' + p.id + '" aria-label="' + esc(p.n) + '">' + art(p, c.col) + '</a><div class="mid"><b>' + esc(p.n) + '</b><span class="sample">' + cny(u) + ' /pc · ' + money(rmOf(u)) + (nx ? ' · add ' + fmt(nx[0] - c.q, 0) + ' for ' + cny(nx[1]) : ' · best tier') + '</span></div><div class="end"><div class="qty" style="height:38px"><button data-act="cq" data-i="' + x[1] + '" data-d="-1" aria-label="Less">−</button><input class="num" data-cqi="' + x[1] + '" value="' + c.q + '" aria-label="Quantity" style="width:74px"><button data-act="cq" data-i="' + x[1] + '" data-d="1" aria-label="More">+</button></div><b class="num">' + money(rmOf(u * c.q)) + '</b><button class="btn btn-sm" style="height:28px;color:var(--ink-2)" data-act="rm" data-i="' + x[1] + '">Remove</button></div></div>'; }).join('') + '</div>'; }).join('');
    return '<div class="view"><div class="phead"><div><h1>Cart & checkout</h1><p>Money goes into escrow. Each factory is paid only after its goods pass inspection in Guangzhou.</p></div></div><div class="two"><div>' + rows + '</div>' +
      '<aside class="card pad stack" style="position:sticky;top:140px"><b style="font-size:17px">Order summary</b><div class="field"><label for="co-dest">Deliver to</label><select id="co-dest">' + E.DEST.map(function (d) { return '<option value="' + d.id + '">' + d.n + '</option>'; }).join('') + '</select></div>' +
        '<div class="seg" role="group" aria-label="Shipping"><button data-act="comode" data-m="sea" aria-pressed="true">Sea<small id="co-sd"></small></button><button data-act="comode" data-m="air" aria-pressed="false">Air<small id="co-ad"></small></button></div>' +
        '<div class="field"><label for="co-insp">Inspection</label><select id="co-insp"><option value="photo">Photo check</option><option value="std" selected>Standard QC · 1.5%</option><option value="full">Full count + QC · 3%</option></select></div>' +
        '<div class="res" id="co-res"></div><div class="stack" style="--g:8px"><b style="font-size:14px">Pay with</b><div class="seg" role="group"><button data-act="pay" data-m="wallet" aria-pressed="true">EZI Wallet<small data-live="bal">' + money(S.wallet) + '</small></button><button data-act="pay" data-m="credit" aria-pressed="false">EZI Credit<small>Pay on arrival</small></button></div></div>' +
        '<button class="btn btn-red btn-lg btn-block" data-act="checkout">' + ic('lock', 18) + ' Pay into escrow</button><span class="sample">Test mode. No real money moves in this preview.</span></aside></div></div>';
  }
  var CO = { mode: 'sea', pay: 'wallet' };
  function cartTotals() {
    var dest = ($('#co-dest') || {}).value || 'MY', insp = ($('#co-insp') || {}).value || 'std', t = { goods: 0, ship: 0, ins: 0, fee: 0, tot: 0 }, d;
    S.cart.forEach(function (c) { var L = landed(P(c.p), c.q, dest, CO.mode, insp); d = L.d; ['goods', 'ship', 'ins', 'fee', 'tot'].forEach(function (k) { t[k] += L[k]; }); });
    t.d = d; return t;
  }
  function runCart() {
    var r = $('#co-res'); if (!r) return; var t = cartTotals();
    r.innerHTML = '<div class="ln"><span class="muted">Goods (' + S.cart.length + ' items)</span><b class="num">' + money(t.goods) + '</b></div><div class="ln"><span class="muted">Inspection</span><b class="num">' + money(t.ins) + '</b></div><div class="ln"><span class="muted">Shipping</span><b class="num">' + money(t.ship) + '</b></div><div class="ln"><span class="muted">Payment fee</span><b class="num">' + money(t.fee) + '</b></div><div class="ln tot"><span>Total</span><b class="num">' + money(t.tot) + '</b></div>' + (CO.pay === 'wallet' && t.tot > S.wallet ? '<span class="pill warn">Wallet short by ' + money(t.tot - S.wallet) + '. Top up or use credit.</span>' : '');
    if (t.d) { $('#co-sd').textContent = t.d.sd + ' days'; $('#co-ad').textContent = t.d.ad + ' days'; }
  }

  function ordersView() {
    var list = S.orders.slice().reverse();
    return '<div class="view"><div class="phead"><div><h1>My orders</h1><p>Factory orders paid into escrow. Watch each step live.</p></div><a class="btn btn-line" href="#shop-all">Buy more</a></div>' +
      (list.length ? '<div class="card">' + list.map(function (o) { var p = P(o.p); return '<a class="lrow" style="text-decoration:none" href="#o-' + o.id + '"><span class="th">' + art(p) + '</span><div class="mid"><b>' + esc(p.n.split(',')[0]) + '</b><span class="sample">' + o.id + ' · ' + fmt(o.q, 0) + ' pcs · ' + E.FACT[p.f].n + '</span><div class="hsteps" style="margin-top:6px">' + E.ORDER_STEPS.map(function (s, i) { return '<div class="' + (i < o.step ? 'done' : i === o.step ? 'now' : '') + '" style="min-width:40px"><i></i></div>'; }).join('') + '</div></div><div class="end"><span class="pill ' + (o.step >= 6 ? 'good' : 'red') + '" data-ost="' + o.id + '">' + E.ORDER_STEPS[o.step][0] + '</span><b class="num">' + money(o.total) + '</b></div></a>'; }).join('') + '</div>' : '<div class="card empty"><b>No orders yet</b><a class="btn btn-red" href="#shop-all">Browse products</a></div>') + '</div>';
  }
  function orderView(id) {
    var o = S.orders.filter(function (x) { return x.id === id; })[0]; if (!o) return ordersView();
    var p = P(o.p), f = E.FACT[p.f];
    return '<div class="view"><div class="crumbs"><a href="#orders">My orders</a> / ' + o.id + '</div><div class="phead"><div><h1>' + o.id + '</h1><p>' + esc(p.n) + ' · ' + fmt(o.q, 0) + ' pcs</p></div><span class="pill ' + (o.step >= 6 ? 'good' : 'red') + '" data-ost="' + o.id + '">' + E.ORDER_STEPS[o.step][0] + '</span></div>' +
      '<div class="two"><div class="card pad"><div class="steps" id="osteps" data-o="' + o.id + '">' + stepsHtml(o) + '</div><span class="sample">Preview: steps advance automatically to show the flow.</span></div>' +
      '<aside class="stack"><div class="card pad stack"><div class="between"><b>Escrow</b><span class="pill ' + (o.step >= 5 ? 'good' : 'warn') + '" id="esc-st">' + (o.step >= 5 ? 'Released to factory' : 'Held by EZICARGO') + '</span></div><b class="num" style="font:800 28px var(--display)">' + money(o.total) + '</b><span class="sample">The factory is paid only after inspection passes. Failed pieces are refunded to your wallet.</span></div>' +
      '<div class="card pad stack"><div class="lrow" style="padding:0;border:0"><span class="th">' + art(p) + '</span><div class="mid"><b>' + esc(f.n) + '</b><span class="sample">' + cny(o.unit) + ' /pc · ' + (o.mode === 'air' ? 'Air' : 'Sea') + ' to ' + E.DEST.filter(function (d) { return d.id === o.dest; })[0].n + '</span></div></div><button class="btn btn-line btn-sm" data-act="ask" data-f="' + p.f + '">' + ic('chat', 16) + ' Message factory</button></div></aside></div></div>';
  }
  function stepsHtml(o) { return E.ORDER_STEPS.map(function (s, i) { return '<div class="stp ' + (i < o.step || o.step === 6 && i === 6 ? 'done' : i === o.step ? 'now' : '') + '"><div class="dotc"><span class="dot">' + ic('check', 14) + '</span>' + (i < 6 ? '<span class="lnv"></span>' : '') + '</div><div class="tx"><b>' + s[0] + '</b><span>' + s[1] + '</span></div></div>'; }).join(''); }

  function shipView() {
    var stored = S.parcels.filter(function (x) { return x.st === 'stored'; });
    var tkg = stored.reduce(function (a, x) { return a + x.kg; }, 0);
    return '<div class="view"><div class="phead"><div><span class="eyebrow">EZI Ship</span><h1>My China warehouse</h1><p>Buy anywhere in China and send it to your address below. We receive, weigh and photograph every carton, keep it 14 days free, and ship when you choose.</p></div><button class="btn btn-red" data-act="declare">' + ic('plus', 18) + ' Declare a parcel</button></div>' +
      '<div class="statg"><div class="card stat"><span>In warehouse</span><b class="num">' + stored.length + ' parcels</b><small>' + fmt(tkg, 1) + ' kg total</small></div><div class="card stat"><span>On the way to us</span><b class="num">' + S.parcels.filter(function (x) { return x.st === 'coming'; }).length + '</b><small>declared by you</small></div><div class="card stat"><span>Shipped to you</span><b class="num">' + S.parcels.filter(function (x) { return x.st === 'shipped'; }).length + '</b><small>tracked live</small></div><div class="card stat"><span>Next air flight</span><b class="num" data-end="' + airCut() + '">--</b><small>18:00 Malaysia time daily</small></div></div>' +
      '<div class="two" style="margin-top:18px"><div class="stack"><div class="card"><div class="between" style="padding:14px 16px;border-bottom:1px solid var(--line)"><b>Parcels</b><div class="row"><button class="btn btn-line btn-sm" data-act="consol">' + ic('layers', 16) + ' Consolidate</button><button class="btn btn-red btn-sm" data-act="shipsel">' + ic('truck', 16) + ' Ship selected</button></div></div>' + S.parcels.map(parcelRow).join('') + '</div></div>' +
      '<aside class="stack"><div class="card pad stack"><b>Your warehouse address</b><div class="addr" style="font-size:13.5px"><b>Chinese (paste into Taobao / 1688)</b>广东省广州市白云区太和镇 EZICARGO 国际仓 B2-18<br>收件人: ' + S.code + ' ' + esc(S.name) + '<br>电话: 020-XXXX-XXXX</div><button class="btn btn-soft btn-sm" data-act="copyaddr">' + ic('copy', 16) + ' Copy address</button><span class="sample">Always include your code ' + S.code + ' so we match the parcel to you.</span></div>' +
      '<div class="card pad stack"><b>Shipping calculator</b>' + quoteWidget('s') + '</div>' +
      '<div class="card pad stack"><b>Extra services</b>' + [['cam', 'Photo check', 'RM 5 / carton'], ['eye', 'Video check', 'RM 12 / carton'], ['shield', 'Count and quality', '1.5% of goods'], ['layers', 'Repack and consolidate', 'RM 3 / carton'], ['box', 'Storage after 14 days', 'RM 1.20 / carton / day']].map(function (x) { return '<div class="ln"><span style="display:flex;gap:8px;align-items:center">' + ic(x[0], 18) + x[1] + '</span><b>' + x[2] + '</b></div>'; }).join('') + '</div></aside></div><section class="sec"><div class="sec-h"><h2>Live from our Guangzhou warehouse</h2></div>' + warehouseLive() + '</section></div>';
  }
  function parcelRow(x) {
    var st = { stored: ['good', 'In warehouse'], coming: ['blue', 'On the way to us'], shipped: ['red', 'Shipped'] }[x.st];
    var left = x.arr ? 14 - Math.floor((Date.now() - x.arr) / 864e5) : 14;
    var extra = x.st === 'stored' ? '<span class="row" style="gap:6px"><span class="store' + (left < 6 ? ' warn' : '') + '"><i style="width:' + Math.max(0, left / 14 * 100) + '%"></i></span><span class="sample">' + (left > 0 ? left + ' free days left' : 'Storage fee running') + '</span></span>' : x.st === 'coming' ? '<span class="sample">' + esc(x.courier) + '</span>' : '<span class="row" style="gap:6px"><span class="store" style="width:160px"><i style="width:' + (x.progress * 100) + '%;background:var(--red)"></i></span><span class="sample">' + x.mode + ' · ETA ' + new Date(x.eta).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + '</span></span>';
    return '<div class="lrow" data-parcel="' + x.id + '">' + (x.st === 'stored' ? '<input type="checkbox" data-sel="' + x.id + '" aria-label="Select ' + x.id + '">' : '<span style="width:20px"></span>') + '<span class="box-ic"><svg viewBox="0 0 40 40" aria-hidden="true"><rect x="4" y="10" width="32" height="24" rx="3" fill="#C58B4A"/><path d="M4 17h32M20 10v24" stroke="#8E5F2C" stroke-width="2"/><rect x="24" y="22" width="9" height="6" fill="#fff"/></svg></span><div class="mid"><b>' + esc(x.n) + '</b><span class="sample num">' + x.id + ' · ' + x.ctn + ' ctn' + (x.kg ? ' · ' + fmt(x.kg, 1) + ' kg' : '') + (x.photos ? ' · ' + x.photos + ' photos' : '') + '</span>' + extra + (x.insp ? '<span class="pill good" style="width:max-content">' + ic('check', 12) + ' ' + esc(x.insp) + '</span>' : '') + '</div><div class="end"><span class="pill ' + st[0] + '">' + st[1] + '</span>' + (x.st === 'stored' ? '<div class="row" style="gap:6px"><button class="btn btn-line btn-sm" data-act="photos" data-id="' + x.id + '">' + ic('cam', 15) + ' Photos</button><button class="btn btn-line btn-sm" data-act="inspect" data-id="' + x.id + '">Inspect</button></div>' : x.st === 'shipped' ? '<a class="btn btn-line btn-sm" href="#track">Track</a>' : '') + '</div></div>';
  }

  function walletView() {
    return '<div class="view"><div class="phead"><div><span class="eyebrow">EZI Wallet</span><h1>Wallet and supplier payments</h1><p>Top up in ringgit, pay Chinese suppliers in yuan, and hold factory payments in escrow until goods pass inspection.</p></div></div>' +
      '<div class="two"><div class="stack" style="--g:18px"><div class="card pad balcard" style="background:linear-gradient(120deg,#A8080C,#D40B0B);color:#fff;border:0;display:grid;grid-template-columns:1fr auto;gap:14px;align-items:end"><div class="stack" style="--g:4px"><span style="opacity:.8;font-weight:700;font-size:13px">Available balance</span><b class="num" id="wbal" style="font:900 clamp(30px,4vw,42px) var(--display)">' + money(S.wallet) + '</b><span style="opacity:.8;font-size:13px">In escrow ' + money(S.escrow) + ' · ' + S.code + '</span></div><div class="row"><button class="btn btn-ink" data-act="topup">' + ic('plus', 18) + ' Top up</button></div></div>' +
      '<div class="card"><div class="between" style="padding:14px 16px;border-bottom:1px solid var(--line)"><b>Transactions</b><span class="sample">Double-entry ledger · every move recorded</span></div><div class="table-wrap"><table><thead><tr><th>When</th><th>Description</th><th style="text-align:end">Amount</th></tr></thead><tbody id="ltable">' + S.ledger.map(function (l) { return '<tr><td class="sample" style="white-space:nowrap">' + ago(l.t) + '</td><td>' + esc(l.d) + '</td><td class="num ' + (l.k === 'in' ? 'amt-in' : l.k === 'escrow' ? 'amt-esc' : 'amt-out') + '" style="text-align:end;white-space:nowrap">' + (l.a > 0 ? '+' : '−') + money(Math.abs(l.a)) + '</td></tr>'; }).join('') + '</tbody></table></div></div>' +
      '</div>' +
      '<aside class="card pad stack" style="position:sticky;top:140px"><div class="between"><b style="font-size:17px">Pay a supplier in ¥</b><span class="pill blue">Live</span></div>' +
        '<div class="field"><label for="ps-to">Supplier</label><select id="ps-to"><option>Alipay · 义乌丝路纺织</option><option>WeChat Pay · 深圳壳工坊</option><option>Bank · 永康钢器有限公司 (ICBC)</option><option>New supplier…</option></select></div>' + fxWidget('w') +
        '<div class="lock">' + ic('lock', 16) + ' Rate locked for <b class="num" id="lockt">10:00</b></div><div class="field"><label for="ps-inv">Invoice or order number</label><input id="ps-inv" placeholder="e.g. 1688 order 2398…"></div><label class="row sample" style="gap:8px"><input type="checkbox" id="ps-esc" checked style="accent-color:var(--red);width:18px;height:18px"> Hold in escrow until our inspection passes</label><button class="btn btn-red btn-lg btn-block" data-act="paysup">Pay supplier</button><span class="sample">Test mode. Supplier payments run through a licensed payment partner.</span></aside></div></div>';
  }

  function groupView() {
    return '<div class="view"><div class="phead"><div><span class="eyebrow">Group deals</span><h1>Buy together, pay factory price</h1><p>Shops commit pieces before the deadline. When the total reaches a price step, everyone pays the lower price. One production run, one inspection, split delivery to each shop. If the minimum isn’t reached, deposits are refunded in full.</p></div><button class="btn btn-red" data-act="newgroup">' + ic('plus', 18) + ' Start a group deal</button></div><div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(280px,1fr))">' + E.GROUP.map(dealCard).join('') + '</div>' +
      '<section class="sec card pad" style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px" id="ghow">' + [['Join with 30%', 'Your deposit waits in escrow. Change your pieces until the deadline.'], ['Price drops for everyone', 'Each step on the ladder lowers the price for every shop in the deal.'], ['One check, split delivery', 'We inspect the full run once and ship each shop its share.']].map(function (s) { return '<div class="stack" style="--g:6px"><b>' + s[0] + '</b><span class="sample" style="font-size:13.5px">' + s[1] + '</span></div>'; }).join('') + '</section><style>@media (max-width:760px){#ghow{grid-template-columns:1fr!important}}</style></div>';
  }
  function factoriesView(cat) {
    var ids = Object.keys(E.FACT).filter(function (k) { return !cat || cat === 'all' || E.FACT[k].cat === cat; }).sort(function (a, b) { return E.FACT[b].sc - E.FACT[a].sc; });
    return '<div class="view"><div class="phead"><div><span class="eyebrow">EZI Factory</span><h1>Verified factories, scored every day</h1><p>Invite only. We check licences, visit by video, test samples and inspect every order. Scores update daily from pass rate, on-time delivery and buyer ratings. Factories below 75 for 14 days are paused and replaced.</p></div><button class="btn btn-line" data-act="apply">Apply as a factory</button></div>' +
      '<div class="chips" style="margin-bottom:16px">' + E.CATS.slice(0, 9).map(function (c) { return '<button class="chip" data-act="fcat" data-c="' + c.id + '" aria-pressed="' + ((cat || 'all') === c.id) + '">' + c.n + '</button>'; }).join('') + '</div>' +
      '<div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(280px,1fr))">' + ids.map(fcard).join('') + '</div><div class="card pad" style="margin-top:18px;background:var(--red-tint);border-color:var(--red-soft)"><b>No copies of other brands.</b> <span class="sample" style="font-size:14px">Factories sell their own brands, OEM, ODM and unbranded goods. Listings that copy another company’s brand or logo are rejected automatically, because customs seize them.</span></div></div>';
  }
  function factoryView(id) {
    var f = E.FACT[id]; if (!f) return factoriesView();
    var ps = E.PROD.filter(function (p) { return p.f === id; });
    return '<div class="view"><div class="crumbs"><a href="#factories">Factories</a> / ' + esc(f.n) + '</div><div class="card pad" style="display:flex;gap:18px;align-items:center;flex-wrap:wrap">' + ring(f.sc) + '<div style="flex:1;min-width:220px"><h1 style="font-size:26px;display:flex;gap:8px;align-items:center">' + esc(f.n) + ' ' + VT + '</h1><p class="muted">' + f.city + ' · ' + f.yrs + ' years · ' + f.type + '</p></div><div class="row"><button class="btn btn-line" data-act="ask" data-f="' + id + '">' + ic('chat', 18) + ' Message</button><button class="btn btn-red" data-act="rfq">Request a quote</button></div></div>' +
      '<div class="statg" style="margin-top:14px"><div class="card stat"><span>Daily score</span><b class="num">' + f.sc + '</b><small>' + f.lv + '</small></div><div class="card stat"><span>Inspection pass</span><b class="num">' + f.pass + '%</b><small>last 90 days</small></div><div class="card stat"><span>On-time</span><b class="num">' + f.ontime + '%</b><small>ready by agreed date</small></div><div class="card stat"><span>Replies in</span><b class="num">' + f.resp + '</b><small>average</small></div></div>' +
      '<section class="sec"><div class="sec-h"><h2>Products</h2></div><div class="pgrid">' + ps.map(pcard).join('') + '</div></section></div>';
  }
  function creditView() {
    var c = S.credit, pct = (c.score - 300) / 550, r = 80, len = Math.PI * r, avail = c.limit - c.used, band = c.score >= 740 ? 'Very good' : c.score >= 670 ? 'Good' : c.score >= 580 ? 'Fair' : 'Building';
    return '<div class="view"><div class="phead"><div><span class="eyebrow">EZI Credit</span><h1>Ship now. Pay when it lands.</h1><p>Use your credit limit at checkout. Goods stay under EZICARGO control until you pay. Credit is provided with a licensed financing partner.</p></div></div>' +
      '<div class="two-e"><div class="card pad stack" style="align-items:center;text-align:center"><div class="gauge"><svg viewBox="0 0 200 120"><path d="M20 100a80 80 0 0 1 160 0" fill="none" stroke="var(--surface-2)" stroke-width="16" stroke-linecap="round"/><path d="M20 100a80 80 0 0 1 160 0" fill="none" stroke="var(--good)" stroke-width="16" stroke-linecap="round" stroke-dasharray="' + (len * pct).toFixed(1) + ' ' + len.toFixed(1) + '"/></svg><b class="num">' + c.score + '</b><small>' + band + '</small></div>' +
        '<div class="stack" style="width:100%;--g:6px"><div class="ln"><span class="muted">Available</span><b class="num" style="color:var(--good)">' + money(avail, 0) + '</b></div><div class="bar" style="height:8px"><i style="width:' + (c.used / c.limit * 100) + '%;background:var(--ink)"></i></div><div class="ln sample"><span>Used ' + money(c.used, 0) + '</span><span>Limit ' + money(c.limit, 0) + '</span></div></div><button class="btn btn-red btn-block" data-act="credit">Use credit at checkout</button></div>' +
      '<div class="stack" style="--g:18px"><div class="card pad stack"><b>How it works</b>' + [['1', 'Choose EZI Credit at checkout', 'No money leaves your wallet yet.'], ['2', 'We ship your goods', 'They stay under our control on the way.'], ['3', 'Pay within 7 days of arrival', 'Then the goods are released to you.']].map(function (x) { return '<div class="row" style="flex-wrap:nowrap;align-items:flex-start"><span class="ava" style="width:30px;height:30px;font-size:13px">' + x[0] + '</span><div><b style="font-size:14.5px">' + x[1] + '</b><div class="sample">' + x[2] + '</div></div></div>'; }).join('') + '</div>' +
      '<div class="card pad stack"><b>Grow your limit</b><div class="sample" style="font-size:14px">Pay on time, keep trading with EZICARGO, and keep your business details up to date. We review limits every month.</div></div></div></div></div>';
  }
  function controlView() {
    var C = [['Aisyah Trading', 'MY-A10482', 742, 96, 72, 64, 90, 20000, 'Active'], ['GadgetHub JB', 'EZ-10311', 688, 88, 81, 40, 76, 12000, 'Active'], ['Bayt Home Jeddah', 'EZ-11207', 612, 70, 55, 30, 88, 5000, 'Review'], ['Toko Riang', 'EZ-11990', 540, 52, 30, 12, 60, 0, 'Not eligible']];
    return '<div class="view"><div class="card pad" style="background:var(--ink);color:#fff;border:0;margin-bottom:18px"><span class="eyebrow" style="color:#FF7A7A">Control centre · staff only</span><h1 style="font-size:24px;margin-top:4px">Credit scoring</h1><p style="color:rgba(255,255,255,.75);margin-top:6px">Customers see only their score, band and limit. How the score is calculated is visible to EZICARGO staff only. Preview with sample customers.</p></div>' +
      '<div class="statg"><div class="card stat"><span>On-time payments</span><b class="num">40%</b><small>weight</small></div><div class="card stat"><span>Trading volume, 6 months</span><b class="num">25%</b><small>weight</small></div><div class="card stat"><span>Inspection disputes</span><b class="num">20%</b><small>weight</small></div><div class="card stat"><span>Months with us</span><b class="num">15%</b><small>weight</small></div></div>' +
      '<div class="card table-wrap" style="margin-top:18px"><table><thead><tr><th>Customer</th><th>Score</th><th>On time</th><th>Volume</th><th>Tenure</th><th>Disputes</th><th>Limit</th><th>Status</th><th></th></tr></thead><tbody>' + C.map(function (x) { return '<tr><td><b>' + x[0] + '</b><div class="sample">' + x[1] + '</div></td><td class="num"><b>' + x[2] + '</b></td>' + [3, 4, 5, 6].map(function (k) { return '<td><div class="bar" style="height:6px;width:70px"><i style="width:' + x[k] + '%;background:' + (x[k] > 75 ? 'var(--good)' : x[k] > 50 ? 'var(--warn)' : 'var(--red)') + '"></i></div><span class="sample num">' + x[k] + '</span></td>'; }).join('') + '<td class="num">' + money(x[7], 0) + '</td><td><span class="pill ' + (x[8] === 'Active' ? 'good' : x[8] === 'Review' ? 'warn' : '') + '">' + x[8] + '</span></td><td><button class="btn btn-line btn-sm" data-act="ctlimit" data-n="' + esc(x[0]) + '">Set limit</button></td></tr>'; }).join('') + '</tbody></table></div></div>';
  }
  function trackView() {
    return '<div class="view"><div class="phead"><div><h1>Track a parcel or shipment</h1><p>Enter an EZ-P parcel, EZ-S shipment or EZO order number.</p></div></div><form class="card pad row" id="trk" style="align-items:flex-end"><div class="field" style="flex:1 1 240px"><label for="trk-in">Tracking number</label><input id="trk-in" value="EZ-S-7715"></div><button class="btn btn-red" type="submit">Track</button></form><div id="trk-out" style="margin-top:16px"></div></div>';
  }
  function trackResult(id) {
    var EV = [['Arrived Guangzhou warehouse', '12 Sep · matched to declaration', 1], ['Measured and photographed', '12 Sep · 212 kg · 1.84 CBM · 28 photos', 1], ['Consolidated and repacked', '14 Sep · 14 cartons', 1], ['Container sealed at Nansha', '16 Sep · 40HQ', 1], ['At sea · 58% of route', 'On schedule · ETA ' + new Date(Date.now() + 9 * 864e5).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }), 2], ['Customs clearance · Port Klang', 'Duties included', 0], ['Out for delivery', 'Courier to your shop', 0], ['Delivered', 'Photo and signature', 0]];
    return '<div class="card pad view"><div class="between"><b style="font:800 20px var(--display)">' + esc(id) + '</b><span class="pill red"><span class="live-dot"></span> At sea</span></div><div class="bar" style="margin:14px 0"><i style="width:58%"></i></div><div class="steps">' + EV.map(function (e, i) { return '<div class="stp ' + (e[2] === 1 ? 'done' : e[2] === 2 ? 'now' : '') + '"><div class="dotc"><span class="dot">' + ic('check', 14) + '</span>' + (i < EV.length - 1 ? '<span class="lnv"></span>' : '') + '</div><div class="tx"><b>' + e[0] + '</b><span>' + e[1] + '</span></div></div>'; }).join('') + '</div><span class="sample">Sample tracking for this preview.</span></div>';
  }
  function meView() {
    return '<div class="view"><div class="phead"><div><h1>' + esc(S.name) + '</h1><p>' + S.code + ' · Lifetime member since 2024 · Business account (SSM verified)</p></div><a class="btn btn-ink" href="' + APP_URL + '" target="_blank" rel="noopener">Open the EZICARGO app</a></div>' +
      '<div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(240px,1fr))">' + [['#orders', 'lock', 'My orders', S.orders.length + ' escrow orders'], ['#ship', 'box', 'My parcels', S.parcels.length + ' parcels'], ['#wallet', 'wallet', 'Wallet', money(S.wallet)], ['#credit', 'credit', 'EZI Credit', 'Score ' + S.credit.score], ['#group', 'group', 'Group deals', E.GROUP.length + ' open'], ['#factories', 'factory', 'Saved factories', '4 factories']].map(function (x) { return '<a class="tile" href="' + x[0] + '"><span class="ti">' + ic(x[1]) + '</span><span><b>' + x[2] + '</b><small>' + x[3] + '</small></span></a>'; }).join('') + '</div>' +
      '<div class="card pad stack" style="margin-top:18px"><b>Post a buying request</b><span class="sample">Tell us what you need. Our Guangzhou sourcing team shortlists 3–5 verified factories within one working day.</span><button class="btn btn-red" style="width:max-content" data-act="rfq">Post a request</button></div>' +
      '<div class="card pad stack" style="margin-top:18px"><b>Preview data</b><span class="sample">This preview keeps your cart, orders and wallet in this browser only.</span><button class="btn btn-line btn-sm" style="width:max-content" data-act="reset">Reset sample data</button></div></div>';
  }

  /* ---------- router ---------- */
  var VIEW = '';
  var ROUTING = false, LASTHASH = null, KEEPY = null;
  function route() {
    if (ROUTING) { setTimeout(route, 0); return; }
    KEEPY = location.hash === LASTHASH ? window.scrollY : null;
    ROUTING = true; try { route2(); } finally { ROUTING = false; }
  }
  function route2() {
    var h = (location.hash || '#home').slice(1), parts = h.split('-'), v = parts[0], arg = parts.slice(1).join('-'), html;
    if (window.EZVIEWS && EZVIEWS[v]) html = EZVIEWS[v](arg);
    else if (v === 'p') html = productView(arg);
    else if (v === 'shop') html = shopView(arg || 'all', SQ);
    else if (v === 'o') html = orderView(arg);
    else if (v === 'f') html = factoryView(arg);
    else html = ({ cart: cartView, orders: ordersView, ship: shipView, wallet: walletView, group: groupView, factories: factoriesView, credit: creditView, track: trackView, me: meView, control: controlView }[v] || homeView)();
    VIEW = v; if (v !== 'shop') SQ = ''; document.body.setAttribute('data-view', v || 'home');
    $('#app').innerHTML = html;
    $$('.cats a[data-cat]').forEach(function (a) { a.classList.toggle('on', v === 'shop' && a.getAttribute('data-cat') === (arg || 'all') && !SQ); });
    $$('.tabs a').forEach(function (a) { a.classList.toggle('on', a.getAttribute('data-tab') === (v || 'home')); });
    moveInd();
    if (location.hash !== LASTHASH) { window.scrollTo(0, 0); LASTHASH = location.hash; } else if (KEEPY != null) window.scrollTo(0, KEEPY);
    after();
  }
  function after() {
    $$('[data-quote]').forEach(runQuote); $$('[data-fx]').forEach(runFx);
    if (VIEW === 'p') runProduct(); if (VIEW === 'cart') runCart();
    if (VIEW === 'track' && $('#trk-in')) $('#trk-out').innerHTML = trackResult($('#trk-in').value);
    if (VIEW === 'wallet') LOCK = Date.now() + 600e3;
    tick1(); carousel(); bannerInit();
    document.dispatchEvent(new CustomEvent('ezi:view', { detail: VIEW }));
  }
  var SQ = '';

  /* ---------- timers ---------- */
  var LOCK = 0, carT = null, carI = 0;
  function carousel() {
    clearInterval(carT); var c = $('#car'); if (!c) return; carI = 0;
    carT = setInterval(function () { goSlide((carI + 1) % 3); }, 6000);
  }
  var bnT = null;
  function bannerInit() {
    clearInterval(bnT); var tr = $('#bn-track'); if (!tr) return; var dots = $$('.bn-dots i'), n = dots.length;
    function idx() { return Math.round(tr.scrollLeft / tr.clientWidth); }
    tr.addEventListener('scroll', function () { var k = idx(); dots.forEach(function (d, j) { d.classList.toggle('on', j === k); }); }, { passive: true });
    bnT = setInterval(function () { if (!document.body.contains(tr)) return clearInterval(bnT); var k = (idx() + 1) % n; tr.scrollTo({ left: k * tr.clientWidth, behavior: 'smooth' }); }, 5000);
  }
  function goSlide(i) { var c = $('#car'); if (!c) return; carI = i; $$('.slide', c).forEach(function (s, k) { s.classList.toggle('on', k === i); }); $$('.car-dots button', c).forEach(function (b, k) { b.classList.remove('on'); void b.offsetWidth; if (k === i) b.classList.add('on'); }); }
  function tick1() {
    var now = Date.now();
    $$('[data-end]').forEach(function (el) { el.textContent = cd(+el.getAttribute('data-end') - now); });
    $$('[data-endsplit]').forEach(function (el) { var s = Math.max(0, Math.floor((+el.getAttribute('data-endsplit') - now) / 1000)), p = function (n) { return (n < 10 ? '0' : '') + n; }, sp = el.children; sp[0].textContent = p(Math.floor(s / 3600)) + 'h'; sp[1].textContent = p(Math.floor(s % 3600 / 60)) + 'm'; sp[2].textContent = p(s % 60) + 's'; });
    $$('[data-ago]').forEach(function (el) { el.textContent = ago(+el.getAttribute('data-ago')); });
    $$('[data-clock]').forEach(function (el) { try { el.textContent = 'Guangzhou ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: el.getAttribute('data-clock') }); } catch (e) {} });
    var lk = $('#lockt'); if (lk) { var s = Math.max(0, Math.floor((LOCK - now) / 1000)); lk.textContent = Math.floor(s / 60) + ':' + ('0' + s % 60).slice(-2); if (!s) LOCK = now + 600e3; }
  }
  setInterval(tick1, 1000);

  var liveN = 0;
  function liveStep() {
    liveN++;
    // warehouse counters + feed
    LIVE.rx += 1 + Math.floor(Math.random() * 3); LIVE.wt = 2 + Math.random() * 38; if (Math.random() < .5) LIVE.insp++; if (Math.random() < .15) LIVE.out++;
    $$('[data-live="rx"]').forEach(function (e) { e.textContent = fmt(LIVE.rx, 0); }); $$('[data-live="insp"]').forEach(function (e) { e.textContent = LIVE.insp; }); $$('[data-live="out"]').forEach(function (e) { e.textContent = LIVE.out; }); $$('[data-live="wt"]').forEach(function (e) { e.textContent = fmt(LIVE.wt, 1) + ' kg'; });
    var k = FEEDK[Math.floor(Math.random() * FEEDK.length)], f = { k: k, d: k[2](), t: Date.now() }; LIVE.feed.unshift(f); LIVE.feed.length = 8;
    var fe = $('#feed'); if (fe) { fe.insertAdjacentHTML('afterbegin', feedItem(f)); while (fe.children.length > 8) fe.lastChild.remove(); }
    // group deals get new shops
    if (liveN % 2 === 0) {
      var g = E.GROUP[Math.floor(Math.random() * E.GROUP.length)], p = P(g.p), add = Math.max(p.t[0][0] / 2, Math.round(g.goal * (.01 + Math.random() * .03) / 10) * 10);
      if (g.got < g.goal * 1.2) { g.got += add; g.shops++; groupDom(g, true); }
    }
    // your own order and parcels move (demo flow)
    if (liveN % 5 === 0) { S.orders.forEach(function (o) { if (o.step < 6) { o.step++; if (o.step === 5) { S.escrow = Math.max(0, S.escrow - o.total); } note(o.id + ': ' + E.ORDER_STEPS[o.step][0], 'o-' + o.id); orderDom(o); } }); save(); }
    if (liveN === 7) { var c = S.parcels.filter(function (x) { return x.st === 'coming'; })[0]; if (c) { c.st = 'stored'; c.arr = Date.now(); c.kg = +(c.ctn * (3 + Math.random() * 6)).toFixed(1); c.dim = [50, 40, 30]; c.photos = c.ctn * 2; note(c.id + ' arrived: ' + c.ctn + ' cartons · ' + c.kg + ' kg · ' + c.photos + ' photos', 'ship'); toast(c.id + ' arrived at the warehouse', true); save(); if (VIEW === 'ship') route(); } }
  }
  setInterval(liveStep, 4000);
  function groupDom(g, flash) {
    $$('[data-gb="' + g.id + '"]').forEach(function (e) { e.style.width = Math.min(100, g.got / g.goal * 100).toFixed(1) + '%'; });
    $$('[data-gg="' + g.id + '"]').forEach(function (e) { e.textContent = fmt(g.got, 0); if (flash) { e.classList.remove('flash'); void e.offsetWidth; e.classList.add('flash'); } });
    $$('[data-gs="' + g.id + '"]').forEach(function (e) { e.textContent = g.shops + ' shops'; });
  }
  function orderDom(o) {
    $$('[data-ost="' + o.id + '"]').forEach(function (e) { e.textContent = E.ORDER_STEPS[o.step][0]; e.className = 'pill ' + (o.step >= 6 ? 'good' : 'red'); });
    var st = $('#osteps'); if (st && st.getAttribute('data-o') === o.id) { st.innerHTML = stepsHtml(o); var es = $('#esc-st'); if (es) { es.textContent = o.step >= 5 ? 'Released to factory' : 'Held by EZICARGO'; es.className = 'pill ' + (o.step >= 5 ? 'good' : 'warn'); } }
  }
  var popT;
  function popn(g, add) {
    var old = $('.popn'); if (old) old.remove(); var p = P(g.p), shop = E.SHOPS[Math.floor(Math.random() * E.SHOPS.length)];
    var a = document.createElement('a'); a.className = 'popn'; a.href = '#p-' + p.id; a.innerHTML = '<span class="th">' + art(p) + '</span><span><b>' + shop + '</b><span>joined “' + esc(p.n.split(' ').slice(0, 4).join(' ')) + '” · +' + fmt(add, 0) + ' pcs</span></span>';
    document.body.appendChild(a); clearTimeout(popT); popT = setTimeout(function () { a.remove(); }, 5000);
  }

  /* ---------- actions ---------- */
  function addCart(pid, q, col, el) {
    var ex = S.cart.filter(function (c) { return c.p === pid && c.col === col; })[0];
    if (ex) ex.q += q; else S.cart.push({ p: pid, q: q, col: col });
    save(); flyTo(el, P(pid), col); setTimeout(badges, 700); toast('Added ' + fmt(q, 0) + ' pcs to cart', true);
  }
  function placeOrder(items, dest, mode, insp, pay) {
    var t = 0, ids = [];
    items.forEach(function (c) { var p = P(c.p), L = landed(p, c.q, dest, mode, insp), id = 'EZO-' + (3100 + Math.floor(Math.random() * 899)); t += L.tot; S.orders.push({ id: id, p: p.id, q: c.q, unit: L.u, total: +L.tot.toFixed(2), step: 0, at: Date.now(), dest: dest, mode: mode, insp: insp }); ids.push(id); });
    if (pay === 'wallet') { if (t > S.wallet) { toast('Wallet balance is too low. Top up ' + money(t - S.wallet) + ' or pay with credit.'); return null; } S.wallet -= t; }
    else { if (S.credit.used + t > S.credit.limit) { toast('Credit limit is not enough for this order.'); return null; } S.credit.used += t; }
    S.escrow += t; ledger('Escrow hold · ' + ids.join(', '), -t, 'escrow'); note('Paid ' + money(t) + ' into escrow · ' + ids.join(', '), 'orders'); save(); badges(); return ids;
  }
  function topupModal() {
    var m = modal('<div class="between"><h3>Top up wallet</h3><button class="x" data-act="close" aria-label="Close">×</button></div><div class="field"><label for="tu-a">Amount (MYR)</label><input id="tu-a" inputmode="decimal" value="5000"></div><div class="chips">' + [1000, 5000, 20000, 100000].map(function (v) { return '<button class="chip" data-act="tuv" data-v="' + v + '">RM ' + fmt(v, 0) + '</button>'; }).join('') + '</div><div class="seg" role="group" aria-label="Method"><button data-act="tum" aria-pressed="true">FPX<small>Online banking</small></button><button data-act="tum" aria-pressed="false">DuitNow<small>QR</small></button><button data-act="tum" aria-pressed="false">Card<small>Visa · Mastercard</small></button></div><button class="btn btn-red btn-lg" data-act="tudo">Top up</button><span class="sample">Test mode. Real top-ups go through a licensed payment partner.</span>');
  }
  function joinModal(g) {
    var p = P(g.p), q0 = Math.max(p.t[0][0], 100);
    modal('<div class="between"><h3>Join group deal</h3><button class="x" data-act="close" aria-label="Close">×</button></div><div class="lrow" style="padding:0;border:0"><span class="th">' + art(p) + '</span><div class="mid"><b>' + esc(p.n) + '</b><span class="sample">Ends in <span class="num" data-end="' + g.ends + '">--</span></span></div></div><div class="field"><label for="jq">Your pieces</label><input id="jq" inputmode="numeric" value="' + q0 + '"></div><div class="res" id="jres"></div><button class="btn btn-red btn-lg" data-act="jdo" data-g="' + g.id + '">Pay deposit into escrow</button><span class="sample">Full refund if the deal does not reach its first step.</span>');
    var run = function () { var q = parseInt($('#jq').value, 10) || 0, best = g.ladder[g.ladder.length - 1][1], dep = rmOf(best * q) * .3; $('#jres').innerHTML = '<div class="ln"><span class="muted">Price if the deal completes</span><b class="num">' + cny(best) + ' /pc</b></div><div class="ln"><span class="muted">Goods at that price</span><b class="num">' + money(rmOf(best * q)) + '</b></div><div class="ln tot"><span>Deposit now (30%)</span><b class="num">' + money(dep) + '</b></div>'; };
    $('#jq').addEventListener('input', run); run(); tick1();
  }
  function rfqModal() { modal('<div class="between"><h3>Post a buying request</h3><button class="x" data-act="close" aria-label="Close">×</button></div><form class="stack" id="rfqf"><div class="field"><label for="rq-n">What do you need?</label><input id="rq-n" required placeholder="e.g. 2,000 silicone phone stands with my logo"></div><div class="f2"><div class="field"><label for="rq-q">Quantity</label><input id="rq-q" inputmode="numeric" placeholder="2000"></div><div class="field"><label for="rq-b">Target price / pc (RM)</label><input id="rq-b" inputmode="decimal" placeholder="3.50"></div></div><div class="field"><label for="rq-d">Details</label><textarea id="rq-d" placeholder="Material, colours, packaging, deadline"></textarea></div><button class="btn btn-red" type="submit">Send request</button></form>'); }
  function askModal(fid) { var f = E.FACT[fid] || E.FACT.f1; modal('<div class="between"><h3>Message ' + esc(f.n) + '</h3><button class="x" data-act="close" aria-label="Close">×</button></div><span class="sample">Messages are translated automatically between English, Bahasa Malaysia, Arabic and Chinese. Replies in about ' + f.resp + '.</span><div class="chips">' + ['Can you print my logo?', 'What is the lead time for 1,000 pcs?', 'Can I mix colours?', 'Send me a sample'].map(function (q) { return '<button class="chip" data-act="askq">' + q + '</button>'; }).join('') + '</div><form class="stack" id="askf"><div class="field"><label for="ask-m">Your message</label><textarea id="ask-m"></textarea></div><button class="btn btn-red" type="submit">Send</button></form>'); }
  function declareModal() { modal('<div class="between"><h3>Declare a parcel</h3><button class="x" data-act="close" aria-label="Close">×</button></div><form class="stack" id="decf"><div class="field"><label for="dc-n">What is inside?</label><input id="dc-n" required value="Kitchen towels"></div><div class="field"><label for="dc-nm">Cargo name (optional)</label><input id="dc-nm" placeholder="Leave empty to use your default name"></div><div class="f2"><div class="field"><label for="dc-f">Bought from</label><select id="dc-f"><option>Taobao</option><option>1688</option><option>Pinduoduo</option><option>Yiwu market</option><option>Guangzhou market</option><option>EZICARGO factory</option></select></div><div class="field"><label for="dc-c">Cartons</label><input id="dc-c" type="number" min="1" value="2"></div></div><div class="f2"><div class="field"><label for="dc-v">Value (RM)</label><input id="dc-v" inputmode="decimal" value="480"></div><div class="field"><label for="dc-t">Courier tracking</label><input id="dc-t" placeholder="SF / YTO / ZTO number"></div></div><button class="btn btn-red" type="submit">Declare parcel</button></form>'); }

  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-act]'); if (!a) { if (!e.target.closest('.search')) $('#sugg').hidden = true; return; }
    var act = a.getAttribute('data-act');
    if (a.tagName === 'BUTTON' && a.closest('a')) e.preventDefault();
    if (act === 'close') closeLayer();
    else if (act === 'slide') { goSlide(+a.getAttribute('data-i')); carousel(); carI = +a.getAttribute('data-i'); }
    else if (act === 'quick') { var p = P(a.getAttribute('data-p')); addCart(p.id, p.t[0][0], 0, a); }
    else if (act === 'hcat') { var c = a.getAttribute('data-c'); $$('#hchips .chip').forEach(function (b) { b.setAttribute('aria-pressed', String(b === a)); }); $('#hgrid').innerHTML = E.PROD.filter(function (p) { return c === 'all' || p.c === c; }).slice(0, 12).map(pcard).join(''); }
    else if (act === 'fcat') { $('#app').innerHTML = factoriesView(a.getAttribute('data-c')); }
    else if (act === 'col') { PD.col = +a.getAttribute('data-i'); $('#gmain').innerHTML = art(PD.p, PD.col); $$('[data-act="col"]').forEach(function (b) { b.setAttribute('aria-pressed', String(+b.getAttribute('data-i') === PD.col)); }); }
    else if (act === 'qm' || act === 'qp') { var inp = $('#pq'), step = PD.p.t[0][0] >= 1000 ? 500 : PD.p.t[0][0] >= 200 ? 100 : 50; inp.value = Math.max(PD.p.t[0][0], (parseInt(inp.value, 10) || 0) + (act === 'qp' ? step : -step)); runProduct(); }
    else if (act === 'mode') { PD.mode = a.getAttribute('data-m'); $$('[data-act="mode"]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === a)); }); runProduct(); }
    else if (act === 'add') { addCart(PD.p.id, PD.q, PD.col, $('#gmain')); }
    else if (act === 'buy') EZFLOW.start('checkout', { items: [{ p: PD.p.id, q: PD.q, col: PD.col }], dest: PD.dest, mode: PD.mode, insp: PD.insp });
    else if (act === 'sample') EZFLOW.start('checkout', { items: [{ p: PD.p.id, q: 1, col: PD.col, sample: true }], dest: PD.dest, mode: 'air', insp: 'photo' });
    else if (act === 'ask') askModal(a.getAttribute('data-f') || (PD.p && PD.p.f));
    else if (act === 'askq') { $('#ask-m').value = a.textContent; }
    else if (act === 'join') EZFLOW.start('join', { g: a.getAttribute('data-g') });
    else if (act === 'newgroup') EZFLOW.start('newgroup', a.getAttribute('data-p') ? { p: a.getAttribute('data-p') } : {});
    else if (act === 'opt') optSheet(a.getAttribute('data-mode'));
    else if (act === 'oq') { var oi = $('#oq'), st2 = PD.p.t[0][0] >= 1000 ? 500 : PD.p.t[0][0] >= 200 ? 100 : 50; oi.value = Math.max(PD.p.t[0][0], (parseInt(oi.value, 10) || 0) + (+a.getAttribute('data-d')) * st2); runOpt(); }
    else if (act === 'ocol') { PD.col = +a.getAttribute('data-i'); $$('[data-act="ocol"]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === a)); }); $('#o-img').innerHTML = art(PD.p, PD.col); if ($('#gmain')) $('#gmain').innerHTML = art(PD.p, PD.col); }
    else if (act === 'omode') { PD.mode = a.getAttribute('data-m'); $$('[data-act="omode"]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === a)); }); runOpt(); }
    else if (act === 'odo') { var q2 = parseInt($('#oq').value, 10) || 0; if (q2 < PD.p.t[0][0]) { $('#o-err').textContent = 'Minimum order is ' + fmt(PD.p.t[0][0], 0) + ' pcs'; return; } PD.q = q2; if ($('#pq')) { $('#pq').value = q2; runProduct(); } var md = a.getAttribute('data-mode'), odest = $('#o-dest') ? $('#o-dest').value : PD.dest; if (md === 'cart') { var fromEl = $('#gmain') || $('.os-img'); closeLayer(); addCart(PD.p.id, q2, PD.col, fromEl); } else { closeLayer(); EZFLOW.start('checkout', { items: [{ p: PD.p.id, q: q2, col: PD.col }], dest: odest, mode: PD.mode, insp: PD.insp }); } }
    else if (act === 'theme') themeSheet();
    else if (act === 'settheme') { setTheme(a.getAttribute('data-t')); $$('[data-act="settheme"]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === a)); }); }
    else if (act === 'jdo') { var g = G(a.getAttribute('data-g')), q = parseInt($('#jq').value, 10) || 0, dep = rmOf(g.ladder[g.ladder.length - 1][1] * q) * .3; if (q < 1) return; if (dep > S.wallet) { toast('Wallet balance is too low for this deposit.'); return; } S.wallet -= dep; S.escrow += dep; g.got += q; g.shops++; ledger('Group deposit · ' + P(g.p).n.split(',')[0], -dep, 'escrow'); note('You joined a group deal with ' + fmt(q, 0) + ' pcs', 'group'); save(); badges(); closeLayer(); groupDom(g, true); toast('You joined the deal · deposit ' + money(dep) + ' in escrow', true); }
    else if (act === 'cq') { var i = +a.getAttribute('data-i'), c2 = S.cart[i], p2 = P(c2.p), st = p2.t[0][0] >= 1000 ? 500 : 50; c2.q = Math.max(p2.t[0][0], c2.q + (+a.getAttribute('data-d')) * st); save(); route(); }
    else if (act === 'rm') { S.cart.splice(+a.getAttribute('data-i'), 1); save(); badges(); route(); }
    else if (act === 'comode') { CO.mode = a.getAttribute('data-m'); $$('[data-act="comode"]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === a)); }); runCart(); }
    else if (act === 'pay') { CO.pay = a.getAttribute('data-m'); $$('[data-act="pay"]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === a)); }); runCart(); }
    else if (act === 'checkout') EZFLOW.start('checkout', { items: S.cart.map(function (c) { return { p: c.p, q: c.q, col: c.col }; }), fromCart: true, dest: $('#co-dest').value, mode: CO.mode, insp: $('#co-insp').value, pay: CO.pay });
    else if (act === 'topup') EZFLOW.start('topup', {});
    else if (act === 'tuv') { $('#tu-a').value = a.getAttribute('data-v'); }
    else if (act === 'tum') { $$('[data-act="tum"]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === a)); }); }
    else if (act === 'tudo') { var v = parseFloat($('#tu-a').value) || 0; if (v <= 0) return; var from = S.wallet; S.wallet += v; ledger('Top-up · ' + $('[data-act="tum"][aria-pressed="true"]').firstChild.textContent, v, 'in'); save(); closeLayer(); badges(); toast('Top-up received · ' + money(v), true); if (VIEW === 'wallet') { route(); var wb = $('#wbal'); if (wb) countTo(wb, from, S.wallet, function (x) { return money(x); }); } }
    else if (act === 'paysup') { var amt0 = parseFloat(String($('#wx-a').value).replace(/[^0-9.]/g, '')) || 0; if (!amt0) { toast('Enter an amount first'); return; } EZFLOW.start('paysup', { amt: amt0, to: $('#ps-to').value, inv: $('#ps-inv').value, escrow: $('#ps-esc').checked }); }
    else if (act === 'copyaddr') { var txt = '广东省广州市白云区太和镇 EZICARGO 国际仓 B2-18 收件人: ' + S.code; try { navigator.clipboard.writeText(txt).then(function () { toast('Address copied', true); }, function () { toast(txt); }); } catch (x) { toast(txt); } }
    else if (act === 'declare') declareModal();
    else if (act === 'photos') { var pc = S.parcels.filter(function (x) { return x.id === a.getAttribute('data-id'); })[0], up = (window.EZPHOTOS && EZPHOTOS[pc.id]) || []; modal('<div class="between"><h3>' + pc.id + ' · ' + (up.length || pc.photos) + ' photos</h3><button class="x" data-act="close" aria-label="Close">×</button></div><div class="grid" style="grid-template-columns:repeat(3,1fr);gap:8px">' + (up.length ? up.map(function (src) { return '<div style="aspect-ratio:1;border-radius:10px;overflow:hidden"><img src="' + src + '" alt="Warehouse photo" style="width:100%;height:100%;object-fit:cover"></div>'; }).join('') : Array.apply(null, Array(Math.min(6, pc.photos || 0))).map(function (_, i) { return '<div style="aspect-ratio:1;border-radius:10px;overflow:hidden;position:relative">' + art(E.PROD[i % 2 ? 1 : 0], i, i) + '</div>'; }).join('')) + '</div><span class="sample">' + (up.length ? 'Taken by our Guangzhou team.' : 'Sample images. Real photos appear here when the warehouse uploads them.') + '</span>'); }
    else if (act === 'inspect') { EZFLOW.start('inspect', { id: a.getAttribute('data-id') }); }
    else if (act === 'inspect-old') { modal('<div class="between"><h3>Order an inspection</h3><button class="x" data-act="close" aria-label="Close">×</button></div><div class="stack" style="--g:8px">' + [['Photo check', 'RM 5 / carton'], ['Video check', 'RM 12 / carton'], ['Count every piece', 'RM 8 / 100 pcs'], ['Quality check', '1.5% of value']].map(function (x, i) { return '<label class="card pad row" style="padding:12px;justify-content:space-between"><span class="row" style="gap:10px"><input type="radio" name="insp" ' + (i ? '' : 'checked') + ' style="accent-color:var(--red)"> ' + x[0] + '</span><b>' + x[1] + '</b></label>'; }).join('') + '</div><button class="btn btn-red" data-act="inspdo">Request inspection</button>'); }
    else if (act === 'inspdo') { closeLayer(); note('Inspection requested. Report within 24 hours.', 'ship'); toast('Inspection requested · report within 24 h', true); }
    else if (act === 'shipsel' || act === 'consol') { var sel = $$('[data-sel]:checked').map(function (x) { return x.getAttribute('data-sel'); }); if (!sel.length) { toast('Tick the parcels you want to ship first'); return; } EZFLOW.start('ship', { ids: sel, consol: act === 'consol' }); }
    else if (act === 'shipdo') { var sel2 = a.getAttribute('data-ids').split(','), cost = +a.getAttribute('data-cost'); if (cost > S.wallet) { toast('Wallet balance is too low. Top up first.'); return; } S.wallet -= cost; ledger('Shipping · ' + sel2.join(' + '), -cost, 'out'); S.parcels.forEach(function (x) { if (sel2.indexOf(x.id) > -1) { x.st = 'shipped'; x.progress = .03; x.mode = a.getAttribute('data-mode') === 'air' ? 'Air express' : 'Sea LCL'; x.eta = Date.now() + (a.getAttribute('data-mode') === 'air' ? 6 : 18) * 864e5; } }); note('Shipment booked for ' + sel2.length + ' parcels', 'ship'); save(); badges(); closeLayer(); route(); toast('Shipment booked · ' + money(cost), true); }
    else if (act === 'smode') { $$('[data-act="smode"]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === a)); }); var sd = $('[data-act="shipdo"]'); sd.setAttribute('data-mode', a.getAttribute('data-m')); sd.setAttribute('data-cost', a.getAttribute('data-cost')); sd.textContent = 'Pay ' + money(+a.getAttribute('data-cost')) + ' and ship'; }
    else if (act === 'notes') { S.unread = 0; save(); badges(); drawer('Alerts', S.notes.length ? '<ul class="feed" style="padding:0 16px;margin:0;max-height:none">' + S.notes.map(function (n) { return '<li><span class="fi" style="color:var(--red)">' + ic('bell', 18) + '</span><div><b>' + esc(n.m) + '</b><span>' + ago(n.t) + '</span></div><a class="btn btn-line btn-sm" href="#' + n.r + '" data-act="close">View</a></li>'; }).join('') + '</ul>' : '<div class="empty">No alerts yet</div>'); }
    else if (act === 'rfq') rfqModal();
    else if (act === 'apply') { modal('<div class="between"><h3>Apply as a factory</h3><button class="x" data-act="close" aria-label="Close">×</button></div><span class="sample">EZICARGO is invite only. We review your business licence, factory video and samples. Approved factories are scored every day.</span><form class="stack" id="apf"><div class="field"><label for="ap-n">Factory name</label><input id="ap-n" required></div><div class="field"><label for="ap-c">City</label><input id="ap-c" placeholder="e.g. Yiwu"></div><div class="field"><label for="ap-p">Main products</label><input id="ap-p"></div><button class="btn btn-red" type="submit">Send application</button></form>'); }
    else if (act === 'credit') { toast('Choose EZI Credit on the payment step at checkout', true); location.hash = 'cart'; }
    else if (act === 'services') servicesSheet();
    else if (act === 'copycode') { var cv = S.code; try { navigator.clipboard.writeText(cv).then(function () { toast('Customer code ' + cv + ' copied', true); }, function () { toast('Your customer code: ' + cv); }); } catch (e) { toast('Your customer code: ' + cv); } }
    else if (act === 'clearrecent') { S.recent = []; save(); route(); toast('Recently viewed cleared'); }
    else if (act === 'eye') { S.hideBal = !S.hideBal; save(); route(); }
    else if (act === 'favedit') { var cur = S.favs || ['orders', 'track', 'inspect', 'newgroup']; modal('<div class="between"><h3>My shortcuts</h3><button class="x" data-act="close" aria-label="Close">×</button></div><span class="sample">Pick up to 8 shortcuts for your home page.</span><div class="fav-g">' + Object.keys(SHORT).map(function (k) { return '<label class="fav-i"><input type="checkbox" value="' + k + '"' + (cur.indexOf(k) > -1 ? ' checked' : '') + '>' + hic(k) + '<span>' + SHORT[k][0] + '</span></label>'; }).join('') + '</div><button class="btn btn-red" data-act="favsave">Save shortcuts</button>'); }
    else if (act === 'favsave') { S.favs = $$('.fav-i input:checked').map(function (x) { return x.value; }).slice(0, 8); save(); closeLayer(); route(); toast('Shortcuts saved', true); }
    else if (act === 'ctlimit') toast('Limit change for ' + a.getAttribute('data-n') + ' sent for approval', true);
    else if (act === 'reset') { S = E.acct(); S.cur = 'MYR'; if (window.EZSET) EZSET.ensure(); save(); badges(); route(); toast('Sample data reset', true); }
  });
  function shipModal(ids, consol) {
    var ps = S.parcels.filter(function (x) { return ids.indexOf(x.id) > -1; }), kg = 0, cbm = 0, ctn = 0;
    ps.forEach(function (x) { kg += x.kg; cbm += x.dim[0] * x.dim[1] * x.dim[2] / 1e6 * x.ctn; ctn += x.ctn; });
    if (consol) cbm *= .78;
    var d = E.DEST[0], air = Math.max(kg, cbm * 1e6 / 6000) * d.air + (consol ? ctn * 3 : 0), sea = Math.max(.5, cbm) * d.sea + (consol ? ctn * 3 : 0);
    modal('<div class="between"><h3>' + (consol ? 'Consolidate and ship' : 'Ship parcels') + '</h3><button class="x" data-act="close" aria-label="Close">×</button></div><div class="res"><div class="ln"><span class="muted">Parcels</span><b>' + ids.join(', ') + '</b></div><div class="ln"><span class="muted">Weight</span><b class="num">' + fmt(kg, 1) + ' kg</b></div><div class="ln"><span class="muted">Volume' + (consol ? ' after repacking (−22%)' : '') + '</span><b class="num">' + fmt(cbm, 3) + ' CBM</b></div><div class="ln"><span class="muted">Deliver to</span><b>' + d.n + '</b></div></div><div class="seg" role="group"><button data-act="smode" data-m="air" data-cost="' + air.toFixed(2) + '" aria-pressed="true">Air · ' + money(air) + '<small>' + d.ad + ' days</small></button><button data-act="smode" data-m="sea" data-cost="' + sea.toFixed(2) + '" aria-pressed="false">Sea · ' + money(sea) + '<small>' + d.sd + ' days</small></button></div><button class="btn btn-red btn-lg" data-act="shipdo" data-ids="' + ids.join(',') + '" data-mode="air" data-cost="' + air.toFixed(2) + '">Pay ' + money(air) + ' and ship</button>');
  }
  document.addEventListener('input', function (e) {
    var t = e.target;
    if (t.closest('[data-quote]')) runQuote(t.closest('[data-quote]'));
    if (t.closest('[data-fx]')) runFx(t.closest('[data-fx]'));
    if (VIEW === 'p' && (t.id === 'pq' || t.id === 'pd-sell')) runProduct();
    if (t.id === 's-q') suggest();
  });
  document.addEventListener('change', function (e) {
    var t = e.target;
    if (t.closest('[data-quote]')) runQuote(t.closest('[data-quote]'));
    if (VIEW === 'p' && (t.id === 'pd-dest' || t.id === 'pd-insp')) runProduct();
    if (VIEW === 'cart' && /^co-/.test(t.id)) runCart();
    if (t.hasAttribute('data-cqi')) { var c = S.cart[+t.getAttribute('data-cqi')]; c.q = Math.max(P(c.p).t[0][0], parseInt(t.value, 10) || 0); save(); route(); }
    if (t.id === 'cur') { S.cur = t.value; save(); badges(); route(); }
    if (t.id === 'sort') { var g = $('#sgrid'); if (!g) return; var v = t.value, list = $$('.pc', g).map(function (a) { return P(a.getAttribute('href').slice(3)); }); list.sort(function (a, b) { return v === 'lo' ? a.t[a.t.length - 1][1] - b.t[b.t.length - 1][1] : v === 'moq' ? a.t[0][0] - b.t[0][0] : v === 'sc' ? E.FACT[b.f].sc - E.FACT[a.f].sc : b.sold - a.sold; }); g.innerHTML = list.map(pcard).join(''); }
  });
  document.addEventListener('submit', function (e) {
    var f = e.target; e.preventDefault();
    if (f.id === 'sform') { var q = $('#s-q').value.trim(), sc = $('#s-scope').value; $('#sugg').hidden = true; if (sc === 't') { location.hash = 'track'; setTimeout(function () { var ti = $('#trk-in'); if (ti && q) { ti.value = q; $('#trk-out').innerHTML = trackResult(q); } }, 30); return; } if (sc === 'f') { location.hash = 'factories'; return; } SQ = q; if (location.hash === '#shop-all') route(); else location.hash = 'shop-all'; }
    else if (f.id === 'trk') { $('#trk-out').innerHTML = trackResult($('#trk-in').value || 'EZ-S-7715'); }
    else if (f.id === 'rfqf') { closeLayer(); note('Buying request posted: ' + $('#rq-n').value, 'me'); toast('Request sent. Factories reply within one working day.', true); }
    else if (f.id === 'askf') { closeLayer(); toast('Message sent to the factory', true); }
    else if (f.id === 'apf') { closeLayer(); toast('Application received. Our team reviews it within 3 working days.', true); }
    else if (f.id === 'decf') { var id = 'EZ-P-2' + (1000 + Math.floor(Math.random() * 8999)); S.parcels.unshift({ id: id, n: $('#dc-nm').value.trim() || (window.EZSET ? EZSET.cargoName($('#dc-n').value) : $('#dc-n').value), ctn: +$('#dc-c').value || 1, kg: 0, dim: [0, 0, 0], val: +$('#dc-v').value || 0, from: $('#dc-f').value, st: 'coming', arr: 0, photos: 0, insp: '', courier: $('#dc-t').value || 'Tracking number to follow' }); save(); closeLayer(); route(); toast('Parcel ' + id + ' declared. We will tell you when it arrives.', true); }
  });
  function suggest() {
    var q = $('#s-q').value.trim().toLowerCase(), box = $('#sugg');
    if (q.length < 2) { box.hidden = true; return; }
    var m = E.PROD.filter(function (p) { return p.n.toLowerCase().indexOf(q) > -1 || p.c.indexOf(q) > -1; }).slice(0, 6);
    box.innerHTML = m.length ? m.map(function (p) { return '<a href="#p-' + p.id + '"><span class="th">' + art(p) + '</span><span style="min-width:0"><b style="font-size:13.5px;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(p.n) + '</b><span class="sample">from ' + money(rmOf(p.t[p.t.length - 1][1])) + ' · MOQ ' + p.t[0][0] + '</span></span></a>'; }).join('') : '<a href="#me" data-act="rfq">No match. Post a buying request →</a>';
    box.hidden = false;
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeLayer(); $('#sugg').hidden = true; } });
  window.addEventListener('hashchange', function () { closeLayer(); $('#sugg').hidden = true; route(); });

  /* ---------- boot ---------- */
  $('#hdr').innerHTML = header();
  $('#ftr').innerHTML = footer();
  $('#tabs').innerHTML = tabs();
  badges(); route();
  window.EZAPP = { ic: ic, view: function () { return VIEW; }, close: closeLayer, state: function () { return S; }, setState: function (x) { S = x; }, money: money, landed: landed, P: P, G: G, art: art, save: save, badges: badges, ledger: ledger, note: note, toast: toast, cny: cny, rmOf: rmOf, unit: unit, fmt: fmt, esc: esc, route: route, dealCard: dealCard, VT: VT, ring: ring, stepsHtml: stepsHtml, themePick: themePick, openOpt: function (pid, mode) { var p = P(pid); PD = { p: p, q: p.t[0][0], col: 0, dest: (window.EZSET && EZSET.defAddr().dest) || 'MY', mode: (S.prefs && S.prefs.mode) || 'sea', insp: (S.prefs && S.prefs.insp) || 'std', sell: 0 }; optSheet(mode); }, parcelRow: parcelRow, quoteWidget: quoteWidget, runQuote: runQuote, warehouseLive: warehouseLive, flyTo: flyTo, addCart: addCart };
})();
