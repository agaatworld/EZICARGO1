/* EZICARGO · light intro, help assistant (AI + customer service), guided page tours, scroll reveals */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var introDone = false, pendingView = null;

  /* ---------- intro: one logo moment, transform/opacity only ---------- */
  function intro() {
    var ss = null; try { ss = sessionStorage.getItem('ezi-skip-intro'); } catch (e) {}
    if (ss || reduce) { introDone = true; return; }
    var ctn = function (x, y, c, c2) { return '<g transform="translate(' + x + ' ' + y + ')"><rect width="20" height="11" rx="1" fill="' + c + '"/><path d="M3 1.5v8M6.5 1.5v8M10 1.5v8M13.5 1.5v8M17 1.5v8" stroke="' + c2 + '" stroke-width="1"/></g>'; };
    var scene =
      '<svg class="i5-sc" viewBox="0 0 360 150" aria-hidden="true">' +
      /* sky route */
      '<path class="i5-route" d="M58 44 C 130 -6 240 -6 318 40" fill="none" stroke="#D40B0B" stroke-width="1.6" stroke-dasharray="3 5" stroke-linecap="round"/>' +
      /* warehouse */
      '<g class="i5-wh"><path d="M6 118V70l34-18 34 18v48z" fill="#2B2E33"/><path d="M2 72l38-22 38 22" fill="none" stroke="#D40B0B" stroke-width="5" stroke-linejoin="round"/>' +
        '<rect x="22" y="84" width="36" height="34" rx="1.5" fill="#44474F"/><path d="M22 90h36M22 96h36M22 102h36M22 108h36M22 114h36" stroke="#5C6068" stroke-width="1.2"/>' +
        '<rect x="28" y="62" width="24" height="10" rx="2" fill="#D40B0B"/><text x="40" y="70" text-anchor="middle" font-family="Montserrat,sans-serif" font-size="7.5" font-weight="900" fill="#fff">EZI</text></g>' +
      /* sea between two quays */
      '<defs><clipPath id="i5clip"><rect x="80" y="116" width="202" height="34"/></clipPath><linearGradient id="i5water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7FA8D6"/><stop offset="1" stop-color="#3E6FA8"/></linearGradient></defs>' +
      '<g class="i5-sea"><rect x="80" y="118" width="202" height="32" fill="url(#i5water)"/>' +
        '<g clip-path="url(#i5clip)"><g class="i5-w1"><path d="M40 121 q10 -4 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 V126 H40z" fill="#B7CFEA"/></g>' +
        '<path d="M100 134h14M150 140h10M196 132h16M238 142h12" stroke="#fff" stroke-opacity=".45" stroke-width="1.4" stroke-linecap="round"/></g>' +
        /* quays */
        '<path d="M0 118h82v32H0z" fill="#8E9298"/><path d="M0 118h82" stroke="#5C6068" stroke-width="2"/><path d="M80 118v32" stroke="#5C6068" stroke-width="2.5"/><rect x="72" y="112" width="5" height="6" rx="1" fill="#2B2E33"/>' +
        '<path d="M280 118h80v32h-80z" fill="#8E9298"/><path d="M280 118h80" stroke="#5C6068" stroke-width="2"/><path d="M282 118v32" stroke="#5C6068" stroke-width="2.5"/><rect x="285" y="112" width="5" height="6" rx="1" fill="#2B2E33"/>' +
        '</g>' +
      /* container ship, already loaded */
      '<g class="i5-ship"><path d="M-40 0h84l-9 14h-67z" fill="#16181C"/><path d="M-37 5h78" stroke="#D40B0B" stroke-width="3"/>' +
        ctn(-34, -11, '#D40B0B', '#A8080C') + ctn(-13, -11, '#1E5FA8', '#154A87') + ctn(-34, -22, '#F5A400', '#C98700') +
        '<rect x="24" y="-22" width="13" height="22" rx="1.5" fill="#E3E6EA" stroke="#16181C" stroke-width="1"/><rect x="27" y="-18" width="7" height="3" fill="#1E5FA8"/></g>' +
      /* shop */
      '<g class="i5-shop"><rect x="292" y="80" width="62" height="38" fill="#fff" stroke="#16181C" stroke-width="2.5"/>' +
        '<path d="M288 80h70l-6 -14h-58z" fill="#D40B0B"/><path d="M295 66v14M305 66v14M315 66v14M325 66v14M335 66v14M345 66v14" stroke="#fff" stroke-width="4" opacity=".55"/>' +
        '<rect x="316" y="94" width="14" height="24" fill="#16181C"/><rect x="298" y="88" width="14" height="12" fill="#DCE6EA"/><rect x="334" y="88" width="14" height="12" fill="#DCE6EA"/></g>' +
      /* plane */
      '<g class="i5-plane"><path d="M14 0 4 -2.2 -1.5 -10 -5 -10 -2.5 -2.2 -9 -2.2 -12 -6 -14.5 -6 -12.5 0 -14.5 6 -12 6 -9 2.2 -2.5 2.2 -5 10 -1.5 10 4 2.2Z" fill="#16181C"/><path d="M-9 0h18" stroke="#D40B0B" stroke-width="1.2"/></g>' +
      /* arrival pin + tick */
      '<g class="i5-pin"><path d="M0 0c-8 0-13-5-13-12a13 13 0 0 1 26 0c0 7-5 12-13 12z" transform="translate(0 -10)" fill="#D40B0B"/><circle cx="0" cy="-22" r="5" fill="#fff"/></g>' +
      '<g class="i5-ok"><circle r="11" fill="#138A4A"/><path d="M-5 0l3.5 3.5L5.5 -4" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>' +
      '</svg>';
    var el = document.createElement('div');
    el.className = 'intro5';
    el.innerHTML = '<div class="i5-c"><div class="i5-mark"><span class="i5-glow"></span><img src="assets/ezicargo-mark.png" alt="" width="104" height="80"></div>' +
      '<div class="i5-word">' + 'EZICARGO'.split('').map(function (c, i) { return '<span style="--i:' + i + '"' + (i < 3 ? ' class="r"' : '') + '>' + c + '</span>'; }).join('') + '</div>' + scene +
      '<div class="i5-tag"><span>Factory</span><i></i><span>Warehouse</span><i></i><span>Sea &amp; air</span><i></i><span>Your shop</span></div></div>';
    document.body.appendChild(el);
    var done = false;
    function finish() { if (done) return; done = true; el.classList.add('out'); setTimeout(function () { el.remove(); introDone = true; if (pendingView) maybeTour(pendingView); }, 480); }
    el.addEventListener('click', finish);
    setTimeout(finish, 2900);
  }

  /* ---------- tours ---------- */
  var TOURS = {
    home: [
      [null, 'Welcome to EZICARGO', 'Buy from Chinese factories, pay safely and ship to your shop. This short guide shows you around.'],
      ['[data-tour="acct"]', 'Your account', 'Your wallet, money held in escrow, parcels in our warehouse and active orders. Tap any box to open it.'],
      ['[data-tour="svcbtn"], [data-tour="svctab"]', 'Services', 'Every EZICARGO service is one tap away here: ship, factories, group buy, pay supplier, escrow, credit and tracking.'],
      ['.hscroll .deal', 'Group deals', 'The bar fills as shops join. At each step, everyone pays the lower price.'],
      ['#hgrid .pc', 'Products', 'Tap a product for price steps and the full cost to your shop.'],
      ['.assist-fab', 'Help is here', 'Ask the AI assistant, talk to customer service, or replay this guide on any page.']
    ],
    shop: [['#app .chips', 'Categories', 'Filter products by type. Every product comes from a factory we verified.'], ['#sort', 'Sort', 'Best selling, lowest price, lowest minimum order or factory score.'], ['.pc', 'Product card', 'Lowest price per piece, minimum order (MOQ) and the verified factory.']],
    p: [['#tiers', 'Price steps', 'Order more, pay less. The red box is the step your quantity is on.'], ['.qty', 'Quantity', 'Use − and + or type a number. The hint shows how many more pieces unlock the next price.'], ['.buybox .res', 'Full cost to your shop', 'Goods, inspection, shipping and fees, and the price per piece at your door.'], ['[data-act="buy"]', 'Buy with escrow', 'Your money waits with EZICARGO. The factory is paid after our inspection passes.']],
    cart: [['#app .two > div', 'Your items', 'Grouped by factory. Change quantities here.'], ['#co-res', 'Total', 'Choose country, air or sea, and inspection. The total updates at once.'], ['[data-act="checkout"]', 'Pay into escrow', 'Pay from your wallet or with EZI Credit.']],
    orders: [['#app .card', 'Your orders', 'Each row shows the steps from escrow to delivery. Tap one for detail.']],
    o: [['#osteps', 'Order steps', 'Green is done, red is happening now.'], ['#esc-st', 'Escrow', 'Your money stays here until inspection passes.']],
    ship: [['.addr', 'Your China address', 'Paste this into Taobao or 1688, or give it to your seller.'], ['[data-act="declare"]', 'Declare a parcel', 'Tell us what is coming so we match it on arrival.'], ['[data-parcel]', 'Your parcels', 'Tick parcels, then ship or combine them. The green bar shows free storage days left.']],
    wallet: [['#wbal', 'Balance', 'Money you can spend. Top up with FPX, DuitNow or card.'], ['#app aside.card', 'Pay a supplier', 'Enter ringgit and see exactly what the supplier gets in yuan.'], ['#ltable', 'Transactions', 'Every top-up, escrow hold, payment and refund.']],
    group: [['.deal', 'A group deal', 'Pieces committed, time left and the price ladder.']],
    factories: [['.fcard', 'Factory score', 'The ring is the daily score. Weak factories are replaced.']],
    credit: [['.gauge', 'Your credit', 'Your score band and available limit. Use it at checkout.']],
    track: [['#trk', 'Track', 'Enter a parcel, shipment or order number.']]
  };
  var T = null;
  function pick(sel) { return $$(sel).filter(visible)[0] || null; }
  function visible(el) { if (!el) return false; var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; }
  function hdrBottom() { var h = $('.hdr'); return h ? Math.max(0, h.getBoundingClientRect().bottom) : 0; }
  function mob() { return innerWidth < 640; }
  function maybeTour(view) {
    if (!introDone) { pendingView = view; return; }
    if (!TOURS[view] || get('ezi-tour-' + view)) return;
    setTimeout(function () { if (window.EZAPP && (EZAPP.view() || 'home') === view && !$('.modal,.drawer,.sheet,.assist')) startTour(view); }, 300);
  }
  function startTour(view) {
    endTour(true);
    var steps = (TOURS[view] || []).filter(function (s) { return !s[0] || !!pick(s[0]); });
    if (!steps.length) return;
    var ov = document.createElement('div'); ov.className = 'tour';
    ov.innerHTML = '<div class="tour-hole"></div><div class="tour-card" role="dialog" aria-live="polite"><div class="tour-top"><span class="tour-n"></span><button type="button" class="tour-skip">Skip</button></div><h4></h4><p></p><div class="tour-nav"><div class="tour-dots"></div><button type="button" class="btn btn-line btn-sm tour-back">Back</button><button type="button" class="btn btn-red btn-sm tour-next">Next</button></div></div>';
    document.body.appendChild(ov); document.documentElement.classList.add('touring');
    T = { view: view, steps: steps, i: 0, el: ov };
    $('.tour-skip', ov).onclick = function () { endTour(); };
    $('.tour-back', ov).onclick = function () { go(T.i - 1); };
    $('.tour-next', ov).onclick = function () { if (T.i >= T.steps.length - 1) endTour(); else go(T.i + 1); };
    go(0);
  }
  function go(i) {
    if (!T) return; T.i = Math.max(0, i);
    var s = T.steps[T.i], ov = T.el, card = $('.tour-card', ov), el = s[0] ? pick(s[0]) : null;
    $('.tour-n', ov).textContent = (T.i + 1) + ' / ' + T.steps.length;
    $('h4', ov).textContent = s[1]; $('p', ov).textContent = s[2];
    $('.tour-dots', ov).innerHTML = T.steps.map(function (_, k) { return '<i class="' + (k === T.i ? 'on' : '') + '"></i>'; }).join('');
    $('.tour-back', ov).hidden = T.i === 0;
    $('.tour-next', ov).textContent = T.i === T.steps.length - 1 ? 'Done' : 'Next';
    T.cur = el && visible(el) ? el : null;
    ov.classList.toggle('center', !T.cur);
    if (!T.cur) { card.style.cssText = ''; return; }
    var fixed = getComputedStyle(T.cur).position === 'fixed';
    if (!fixed) {
      var r = T.cur.getBoundingClientRect(), top0 = hdrBottom() + 12, avail = innerHeight - top0 - (mob() ? 230 : 40);
      var y = r.top + scrollY - top0 - (r.height < avail ? (avail - r.height) / 2 : 0);
      scrollTo(0, Math.max(0, y));
    }
    place();
  }
  function place() {
    if (!T || !T.cur) return;
    var el = T.cur, ov = T.el, card = $('.tour-card', ov), hole = $('.tour-hole', ov), r = el.getBoundingClientRect(), pad = 6, W = innerWidth, H = innerHeight;
    var fixed = getComputedStyle(el).position === 'fixed', topLim = fixed ? 0 : hdrBottom() + 2, botLim = mob() && !fixed ? H - 220 : H - 6;
    var t = Math.max(topLim, r.top - pad), b = Math.min(botLim, r.bottom + pad); if (b - t < 36) b = t + 36;
    hole.style.transform = 'translate3d(' + Math.round(r.left - pad) + 'px,' + Math.round(t) + 'px,0)';
    hole.style.width = Math.round(r.width + pad * 2) + 'px'; hole.style.height = Math.round(b - t) + 'px';
    if (mob()) { card.style.cssText = ''; card.classList.toggle('top', fixed && r.top > H / 2); return; }
    card.classList.remove('top');
    var cw = 330, ch = card.offsetHeight || 170, left = Math.min(W - cw - 16, Math.max(16, r.left)), top = b + 12;
    if (top + ch > H - 12) top = t - ch - 12;
    if (top < topLim + 6) { top = H - ch - 16; left = W - cw - 16; }
    card.style.cssText = 'left:' + Math.round(left) + 'px;top:' + Math.round(top) + 'px;width:' + cw + 'px';
  }
  function endTour(silent) { if (!T) return; if (!silent) set('ezi-tour-' + T.view, '1'); T.el.remove(); T = null; document.documentElement.classList.remove('touring'); }
  var rafP = 0; function replace() { if (!T || rafP) return; rafP = requestAnimationFrame(function () { rafP = 0; place(); }); }
  addEventListener('resize', replace); addEventListener('scroll', replace, { passive: true });
  document.addEventListener('keydown', function (e) { if (!T) return; if (e.key === 'Escape') endTour(); if (e.key === 'ArrowRight') $('.tour-next', T.el).click(); if (e.key === 'ArrowLeft') go(T.i - 1); });
  addEventListener('hashchange', function () { if (T) endTour(true); });

  /* ---------- help assistant ---------- */
  var fab = document.createElement('button'); fab.type = 'button'; fab.className = 'assist-fab'; fab.setAttribute('aria-label', 'Help: AI assistant and customer service');
  fab.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/><path d="M8.5 10.5h.01M12 10.5h.01M15.5 10.5h.01"/></svg><span>Help</span>';
  document.body.appendChild(fab);
  var sampleP = (window.claude && claude.use) ? Promise.resolve(claude.use('sample')).catch(function () { return null; }) : Promise.resolve(null);
  var AI = { turns: [], busy: false, ctl: null }, CS = { chat: [], tickets: [] }, tab = 'ai';
  fab.addEventListener('click', function () { openAssist(); });
  document.addEventListener('click', function (e) { var a = e.target.closest('[data-act="assist"]'); if (a) { e.preventDefault(); if (window.EZAPP) EZAPP.close(); openAssist(); } });
  function openAssist(t) {
    if (t) tab = t; if (T) endTour(true);
    closeAssist();
    var sc = document.createElement('div'); sc.className = 'assist-scrim'; sc.onclick = closeAssist;
    var p = document.createElement('section'); p.className = 'assist'; p.setAttribute('role', 'dialog'); p.setAttribute('aria-label', 'Help');
    p.innerHTML = '<header><img src="assets/ezicargo-mark.png" alt="" width="34" height="26"><div><b>EZICARGO Help</b><span>AI assistant · customer service</span></div><button class="x" type="button" aria-label="Close">×</button></header>' +
      '<div class="seg as-tabs" role="tablist"><button type="button" data-t="ai" aria-pressed="' + (tab === 'ai') + '">AI assistant</button><button type="button" data-t="cs" aria-pressed="' + (tab === 'cs') + '">Customer service</button></div><div class="as-body"></div>' +
      '<button type="button" class="as-guide">Show me how this page works</button>';
    document.body.appendChild(sc); document.body.appendChild(p);
    $('.x', p).onclick = closeAssist;
    $('.as-guide', p).onclick = function () { closeAssist(); startTour((window.EZAPP && EZAPP.view()) || 'home'); };
    $$('.as-tabs button', p).forEach(function (b) { b.onclick = function () { tab = b.getAttribute('data-t'); $$('.as-tabs button', p).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); render(); }; });
    render();
  }
  function closeAssist() { var a = $('.assist'), s = $('.assist-scrim'); if (a) a.remove(); if (s) s.remove(); }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && $('.assist')) closeAssist(); });
  function render() { var b = $('.assist .as-body'); if (!b) return; if (tab === 'ai') renderAI(b); else renderCS(b); }
  var QUICK = ['How much to ship 20 kg to Kuala Lumpur?', 'How does escrow protect me?', 'Find phone cases under RM 3', 'How do I get my China address?', 'Bagaimana cara bayar pembekal?'];
  function md(t) { return esc(t).replace(/\[([^\]]+)\]\((#[a-z0-9-]+)\)/gi, '<a href="$2">$1</a>').replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>'); }
  function renderAI(b) {
    b.innerHTML = '<div class="as-msgs" id="as-msgs">' + '<div class="msg bot">Hi! I am the EZICARGO assistant. Ask me about shipping prices, products, escrow, group deals or paying suppliers. English, Bahasa Malaysia, العربية or 中文.</div>' +
      AI.turns.map(function (t) { return '<div class="msg ' + (t.role === 'user' ? 'me' : 'bot') + '">' + (t.role === 'user' ? esc(t.content) : md(t.content)) + '</div>'; }).join('') + '</div>' +
      (AI.turns.length ? '' : '<div class="as-quick">' + QUICK.map(function (q) { return '<button type="button" class="chip">' + esc(q) + '</button>'; }).join('') + '</div>') +
      '<form class="as-input" id="as-f"><input id="as-q" autocomplete="off" placeholder="Ask anything…" aria-label="Message"><button class="btn btn-red btn-sm" type="submit" id="as-send">Send</button></form><div class="as-note" id="as-note"></div>';
    $$('.as-quick .chip', b).forEach(function (c) { c.onclick = function () { ask(c.textContent); }; });
    $('#as-f', b).onsubmit = function (e) { e.preventDefault(); var v = $('#as-q').value.trim(); if (v) ask(v); };
    var m = $('#as-msgs'); m.scrollTop = m.scrollHeight;
    sampleP.then(function (s) { var n = $('#as-note'); if (n && !s) n.textContent = 'AI is not available in this view, so answers come from our help pages.'; });
  }
  function context() {
    var E = window.EZ, S = window.EZAPP && EZAPP.state ? EZAPP.state() : null;
    var prods = E.PROD.map(function (p) { return p.id + ' | ' + p.n + ' | factory ' + E.FACT[p.f].n + ' | tiers ' + p.t.map(function (t) { return t[0] + '+ pcs ¥' + t[1]; }).join(', ') + ' | RM ' + (p.t[p.t.length - 1][1] / E.MYR_CNY).toFixed(2) + '–' + (p.t[0][1] / E.MYR_CNY).toFixed(2) + ' per pc | ' + p.kg + ' kg, ' + p.cbm + ' CBM per pc'; }).join('\n');
    var rates = E.DEST.map(function (d) { return d.n + ': air RM ' + d.air + '/kg (' + d.ad + ' days), sea RM ' + d.sea + '/CBM, min 0.5 CBM (' + d.sd + ' days)'; }).join('\n');
    var deals = E.GROUP.map(function (g) { var p = E.PROD.filter(function (x) { return x.id === g.p; })[0]; return p.n + ' (#p-' + p.id + '): ' + g.got + '/' + g.goal + ' pcs, best price ¥' + g.ladder[g.ladder.length - 1][1]; }).join('\n');
    var acct = S ? 'Customer: ' + S.name + ' (' + S.code + '). Wallet RM ' + S.wallet.toFixed(2) + ', escrow RM ' + S.escrow.toFixed(2) + '. Parcels: ' + S.parcels.map(function (x) { return x.id + ' ' + x.n + ' ' + x.st; }).join('; ') + '. Orders: ' + S.orders.map(function (o) { return o.id + ' ' + E.ORDER_STEPS[o.step][0]; }).join('; ') + '. Credit available RM ' + (S.credit.limit - S.credit.used).toFixed(0) + '.' : '';
    return 'You are the EZICARGO help assistant inside the EZICARGO website (EZICARGO RICH SDN. BHD., Malaysia). EZICARGO helps small traders buy from verified Chinese factories, pay into escrow, join group buys, pay Chinese suppliers in yuan, use trade credit, and ship from our Guangzhou warehouse to Malaysia, Singapore, Brunei, Saudi Arabia and the UAE.\n' +
      'Rules: reply in the language the customer writes in. Be short and practical, under 120 words. When you mention a page or product, link it as [label](#hash). Pages: #ship (China address, parcels, shipping), #shop-all, #group, #wallet (top up, pay supplier), #orders, #credit, #track, #cart, #factories. Product pages are #p-<id>. Chargeable air weight = the higher of actual kg and L×W×H cm ÷ 6000. Escrow: EZICARGO holds the money and releases it to the factory only after inspection in Guangzhou passes; failed pieces are refunded. Free storage 14 days, then RM 1.20 per carton per day. 1 MYR = ¥1.6437. Payment fee 0.5%. Membership RM 150 lifetime. Never explain how credit scores are calculated; say limits grow with on-time payments and regular trading. All figures are sample preview data and payments are in test mode, so never claim real money moved. For refunds, account changes or complaints, point to the Customer service tab.\n\nShipping rates:\n' + rates + '\n\nProducts:\n' + prods + '\n\nGroup deals:\n' + deals + '\n\n' + acct;
  }
  function localAnswer(q) {
    var s = q.toLowerCase();
    if (/ship|kg|air|sea|hantar|kirim|شحن|运/.test(s)) return 'Air to West Malaysia is **RM 18 per kg** (5–7 days). Sea is **RM 650 per CBM**, minimum 0.5 CBM (14–21 days). 20 kg by air is about **RM 360**. Try the calculator on [EZI Ship](#ship).';
    if (/escrow|protect|safe|selamat|ضمان/.test(s)) return 'Your payment waits with EZICARGO. We inspect the goods in Guangzhou, then release the money to the factory. Failed pieces are refunded to your wallet. See [My orders](#orders).';
    if (/case|phone|telefon/.test(s)) return 'Try the [clear magnetic phone case](#p-p2): from about **RM 1.95 per piece** at 5,000 pcs, minimum 200 pcs.';
    if (/address|alamat|عنوان|地址/.test(s)) return 'Your China address is on [EZI Ship](#ship). Copy it into Taobao or 1688 and always include your customer code.';
    if (/bayar|pay|supplier|pembekal|دفع/.test(s)) return 'Open [EZI Wallet](#wallet), enter the amount in ringgit, choose the supplier (Alipay, WeChat Pay or bank) and pay. The rate is locked for 10 minutes. Fee 0.5%.';
    return 'I can help with shipping prices, products, escrow, group deals and supplier payments. For anything else, open the Customer service tab.';
  }
  function ask(q) {
    if (AI.busy) return; AI.busy = true;
    AI.turns.push({ role: 'user', content: q }); render();
    var m = $('#as-msgs'), bub = document.createElement('div'); bub.className = 'msg bot typing'; bub.innerHTML = '<span class="dots"><i></i><i></i><i></i></span>'; m.appendChild(bub); m.scrollTop = m.scrollHeight;
    var send = $('#as-send'); if (send) send.disabled = true;
    function finish(text) { AI.busy = false; AI.ctl = null; AI.turns.push({ role: 'assistant', content: text }); render(); }
    sampleP.then(function (sample) {
      if (!sample) { setTimeout(function () { finish(localAnswer(q)); }, 450); return; }
      AI.ctl = new AbortController();
      var turns = [{ role: 'user', content: context() + '\n\nReply "OK" if you understand.' }, { role: 'assistant', content: 'OK' }].concat(AI.turns.slice(-10));
      sample(turns, { cache: false, modelTier: 'quick', signal: AI.ctl.signal, onText: function (x) { bub.classList.remove('typing'); bub.innerHTML = md(x.text); var mm = $('#as-msgs'); if (mm) mm.scrollTop = mm.scrollHeight; } })
        .then(function (r) { finish(r.text); })
        .catch(function (e) { var c = e && e.code; finish(c === 'rate_limited' ? 'Many questions at once. Please wait a moment and ask again.' : c === 'not_granted' ? localAnswer(q) + '\n\nAI answers need your permission. You can allow it on your next question.' : (e && e.text) || localAnswer(q)); });
    });
  }
  function renderCS(b) {
    b.innerHTML = '<div class="cs-agent"><span class="ava">EZ</span><div><b>EZICARGO support</b><span class="cs-on"><i></i> Online · replies in about 5 min</span><span class="sample">Every day 9:00–21:00 Malaysia time · English, BM, العربية, 中文</span></div></div>' +
      '<div class="cs-acts"><button type="button" class="btn btn-red btn-sm" id="cs-chat">Chat with an agent</button><button type="button" class="btn btn-line btn-sm" id="cs-tk">Open a ticket</button></div>' +
      '<div id="cs-area"></div>' +
      '<div class="cs-contacts"><div class="ln"><span class="muted">WhatsApp</span><b>[NUMBER]</b></div><div class="ln"><span class="muted">Email</span><b>[EMAIL]</b></div></div>' +
      (CS.tickets.length ? '<div class="cs-tk"><b>My tickets</b>' + CS.tickets.map(function (t) { return '<div class="ln"><span>' + t.id + ' · ' + esc(t.topic) + '</span><span class="pill warn">Open</span></div>'; }).join('') + '</div>' : '');
    $('#cs-chat', b).onclick = csChat; $('#cs-tk', b).onclick = csTicket;
    if (CS.chat.length) csChat();
  }
  function csChat() {
    if (!CS.chat.length) CS.chat.push({ me: false, t: 'Hi, this is Nur from EZICARGO support. How can I help you today?' });
    var a = $('#cs-area'); if (!a) return;
    a.innerHTML = '<div class="as-msgs cs-msgs" id="cs-msgs">' + CS.chat.map(function (m) { return '<div class="msg ' + (m.me ? 'me' : 'bot') + '">' + esc(m.t) + '</div>'; }).join('') + '</div><form class="as-input" id="cs-f"><input id="cs-q" autocomplete="off" placeholder="Type your message" aria-label="Message to support"><button class="btn btn-red btn-sm" type="submit">Send</button></form><div class="as-note">Preview: agent replies are simulated.</div>';
    var mm = $('#cs-msgs'); mm.scrollTop = mm.scrollHeight;
    $('#cs-f').onsubmit = function (e) { e.preventDefault(); var v = $('#cs-q').value.trim(); if (!v) return; CS.chat.push({ me: true, t: v }); csChat(); setTimeout(function () { CS.chat.push({ me: false, t: 'Thanks, I am checking this for you now. If it is about a parcel or order, please share its number (EZ-P… or EZO…).' }); if ($('#cs-msgs')) csChat(); }, 1200); };
  }
  function csTicket() {
    var a = $('#cs-area'); if (!a) return;
    a.innerHTML = '<form class="stack cs-form" id="tk-f"><div class="field"><label for="tk-t">Topic</label><select id="tk-t"><option>Parcel or shipping</option><option>Order or escrow</option><option>Payment or wallet</option><option>Factory or product</option><option>Account</option></select></div><div class="field"><label for="tk-r">Parcel, order or payment number</label><input id="tk-r" placeholder="e.g. EZO-3021"></div><div class="field"><label for="tk-m">What happened?</label><textarea id="tk-m" required></textarea></div><button class="btn btn-red btn-sm" type="submit">Send ticket</button></form>';
    $('#tk-f').onsubmit = function (e) { e.preventDefault(); var id = 'EZT-' + (5000 + Math.floor(Math.random() * 4999)); CS.tickets.unshift({ id: id, topic: $('#tk-t').value }); render(); var n = document.createElement('div'); n.className = 'toast good'; n.textContent = 'Ticket ' + id + ' sent. We reply within 4 working hours.'; var ts = $('.toasts'); if (ts) { ts.appendChild(n); setTimeout(function () { n.remove(); }, 3200); } };
  }

  /* ---------- pause SVG animations off screen ---------- */
  var svgIO = 'IntersectionObserver' in window ? new IntersectionObserver(function (en) { en.forEach(function (x) { try { if (x.isIntersecting) x.target.unpauseAnimations(); else x.target.pauseAnimations(); } catch (e) {} }); }, { rootMargin: '60px' }) : null;
  function watchSvgs() { if (!svgIO) return; $$('#app svg').forEach(function (sv) { if (sv.__w || !sv.querySelector('animate,animateMotion,animateTransform')) return; sv.__w = 1; svgIO.observe(sv); }); }
  var moT; new MutationObserver(function () { clearTimeout(moT); moT = setTimeout(watchSvgs, 150); }).observe(document.getElementById('app'), { childList: true, subtree: true });

  /* ---------- light scroll reveal (sections only) ---------- */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('rv-in'); io.unobserve(x.target); } }); }) : null;
  function reveal() { if (!io || reduce) return; var H = innerHeight; $$('#app .sec').forEach(function (el) { if (el.getBoundingClientRect().top > H) { el.classList.add('rv'); io.observe(el); } }); }

  document.addEventListener('ezi:view', function (e) { watchSvgs(); reveal(); maybeTour(e.detail || 'home'); });
  intro(); watchSvgs(); reveal();
  maybeTour((location.hash.slice(1).split('-')[0]) || 'home');
})();
