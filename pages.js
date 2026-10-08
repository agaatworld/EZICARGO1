/* EZICARGO · factory chat page, warehouse page, Control centre (admin) */
(function () {
  'use strict';
  var A = window.EZAPP, E = window.EZ;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var ic = A.ic, esc = A.esc, fmt = A.fmt, money = function (v, d) { return A.money(v, d); }, S = function () { return A.state(); };
  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function ago(t) { var s = (Date.now() - t) / 1000; if (s < 60) return 'just now'; if (s < 3600) return Math.floor(s / 60) + ' min ago'; if (s < 86400) return Math.floor(s / 3600) + ' h ago'; return Math.floor(s / 86400) + ' d ago'; }

  /* =================== factory chat =================== */
  function chat(arg) {
    var parts = (arg || 'f1').split('-'), fid = parts[0], pid = parts[1], f = E.FACT[fid]; if (!f) { fid = 'f1'; f = E.FACT.f1; }
    var p = pid ? A.P(pid) : null, s = S(); s.chats = s.chats || {};
    var th = s.chats[fid] = s.chats[fid] || [{ me: false, t: '您好! Hello from ' + f.n + '. How can we help? We reply in about ' + f.resp + '.', at: Date.now() - 3600e3 }];
    CH = { fid: fid, pid: pid };
    return '<div class="view chatpg"><div class="chat-h card"><a class="fl-x" href="' + (p ? '#p-' + p.id : '#f-' + fid) + '">' + ic('arrow', 18) + '<span>Back</span></a>' + A.ring(f.sc) + '<div style="flex:1;min-width:0"><b class="chat-n">' + esc(f.n) + ' ' + A.VT + '</b><span class="sample">' + f.city + ' · replies in ' + f.resp + ' · <span style="color:var(--good);font-weight:700">● online</span></span></div><a class="btn btn-line btn-sm hide-sm" href="#f-' + fid + '">Factory page</a></div>' +
      (p ? '<a class="card chat-p" href="#p-' + p.id + '"><span class="th">' + A.art(p) + '</span><div style="flex:1;min-width:0"><b>' + esc(p.n) + '</b><span class="sample">From ' + A.cny(p.t[p.t.length - 1][1]) + ' /pc · MOQ ' + fmt(p.t[0][0], 0) + '</span></div><span class="pill">Asking about</span></a>' : '') +
      '<div class="card chat-box"><div class="chat-tr">' + ic('swap', 14) + ' Messages are translated automatically between your language and Chinese.</div><div class="chat-msgs" id="chat-msgs">' + th.map(msgHtml).join('') + '</div>' +
      '<div class="chat-q">' + ['What is the lead time for 1,000 pcs?', 'Can you print my logo?', 'Can I mix colours?', 'Please send a sample', 'Best price for 3,000 pcs?'].map(function (q) { return '<button type="button" class="chip" data-chq="' + esc(q) + '">' + esc(q) + '</button>'; }).join('') + '</div>' +
      '<form class="chat-in" id="chat-f"><label class="chat-att" title="Attach a photo">' + ic('cam', 20) + '<input type="file" accept="image/*" id="chat-file" hidden></label><input id="chat-m" autocomplete="off" placeholder="Write to the factory…" aria-label="Message"><button class="btn btn-red" type="submit">Send</button></form></div>' +
      '<div class="row chat-acts"><button class="btn btn-line btn-sm" data-act="rfq">Request a quote</button>' + (p ? '<a class="btn btn-line btn-sm" href="#p-' + p.id + '">Buy this product</a>' : '') + '<a class="btn btn-line btn-sm" href="#f-' + fid + '">All products</a></div><p class="sample" style="margin-top:8px">Preview: factory replies are simulated.</p></div>';
  }
  var CH = null;
  function msgHtml(m) { return '<div class="cm ' + (m.me ? 'me' : '') + '">' + (m.img ? '<img src="' + m.img + '" alt="Photo you sent">' : '') + (m.t ? '<span>' + esc(m.t) + '</span>' : '') + (m.zh ? '<small class="zh">' + esc(m.zh) + '</small>' : '') + '<time>' + ago(m.at) + '</time></div>'; }
  function reply(q) {
    var f = E.FACT[CH.fid], p = CH.pid ? A.P(CH.pid) : E.PROD.filter(function (x) { return x.f === CH.fid; })[0], s = q.toLowerCase();
    if (/lead|time|days|how long|berapa lama/.test(s)) return ['For ' + (p ? p.n.split(',')[0] : 'this item') + ', production takes ' + (p ? p.lead : '10–15 days') + ' after payment into escrow, then 1 day to your EZICARGO warehouse.', '生产周期约' + (p ? p.lead.replace(' days', '天') : '10-15天')];
    if (/logo|print|brand/.test(s)) return ['Yes, we can add your own logo by laser or print. Minimum ' + (p ? fmt(p.t[0][0], 0) : '300') + ' pcs, free design proof in 24 hours. Please send your logo file.', '可以定制您的LOGO'];
    if (/colou?r|mix|warna/.test(s)) return ['Yes, you can mix colours in one order, at least 50 pcs per colour.', '可以混色，每色50件起'];
    if (/sample|contoh/.test(s)) return ['Sure. The sample costs ' + (p ? A.cny(p.t[0][1]) : '¥20') + ' plus shipping and goes out tomorrow to your EZICARGO address.', '样品明天发出'];
    if (/price|best|harga|3,?000/.test(s)) return [p ? 'At ' + fmt(p.t[p.t.length - 1][0], 0) + ' pcs the price is ' + A.cny(p.t[p.t.length - 1][1]) + ' per piece. For more than that we can offer a little better. Tell us your quantity.' : 'Please tell us the quantity and we will quote.', '大货价格可以再谈'];
    return ['Thank you. Our sales team is checking and will reply in about ' + f.resp + '.', '收到，我们会尽快回复'];
  }
  function sendMsg(t, img) {
    var s = S(), th = s.chats[CH.fid]; th.push({ me: true, t: t, img: img, at: Date.now() }); A.save(); drawMsgs();
    var box = $('#chat-msgs'); var ty = document.createElement('div'); ty.className = 'cm typing'; ty.innerHTML = '<span class="dots"><i></i><i></i><i></i></span>'; box.appendChild(ty); box.scrollTop = box.scrollHeight;
    setTimeout(function () { var r = reply(t || 'photo'); th.push({ me: false, t: r[0], zh: r[1], at: Date.now() }); A.save(); if ($('#chat-msgs')) drawMsgs(); }, 1400);
  }
  function drawMsgs() { var b = $('#chat-msgs'); if (!b) return; b.innerHTML = S().chats[CH.fid].map(msgHtml).join(''); b.scrollTop = b.scrollHeight; }
  document.addEventListener('submit', function (e) { if (e.target.id !== 'chat-f') return; e.preventDefault(); var v = $('#chat-m').value.trim(); if (!v) return; $('#chat-m').value = ''; sendMsg(v); });
  document.addEventListener('click', function (e) { var c = e.target.closest('[data-chq]'); if (c) sendMsg(c.getAttribute('data-chq')); });
  document.addEventListener('change', function (e) { if (e.target.id !== 'chat-file' || !e.target.files[0]) return; var fr = new FileReader(); fr.onload = function () { var img = new Image(); img.onload = function () { var c = document.createElement('canvas'), k = Math.min(1, 480 / Math.max(img.width, img.height)); c.width = img.width * k; c.height = img.height * k; c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); sendMsg('', c.toDataURL('image/jpeg', .7)); }; img.src = fr.result; }; fr.readAsDataURL(e.target.files[0]); e.target.value = ''; });

  /* =================== warehouse page =================== */
  var SEL = {};
  function ship() {
    var s = S(), stored = s.parcels.filter(function (x) { return x.st === 'stored'; }), coming = s.parcels.filter(function (x) { return x.st === 'coming'; }), out = s.parcels.filter(function (x) { return x.st === 'shipped' || x.st === 'returning'; });
    var layout = get('ezi-wh-view') || 'rack';
    Object.keys(SEL).forEach(function (k) { if (!stored.some(function (x) { return x.id === k; })) delete SEL[k]; });
    var minDays = stored.length ? Math.min.apply(null, stored.map(daysLeft)) : 14;
    return '<div class="view whpg">' +
      '<section class="wh-hero"><div class="wh-stripe" aria-hidden="true"></div><div class="wh-hero-in"><div class="stack" style="--g:6px;min-width:0"><span class="wh-tag">BAIYUN WAREHOUSE · GUANGZHOU</span><h1>My warehouse <span class="wh-bay">Bay B2-18</span></h1><p>We receive, weigh and photograph every carton. Free storage for 14 days. Choose what happens next.</p><div class="row"><button class="btn wh-btn" data-act="declare">' + ic('plus', 18) + ' Declare a parcel</button><button class="btn wh-btn-o" data-act="copyaddr">' + ic('copy', 16) + ' Copy China address</button></div></div>' +
      '<div class="wh-stats2"><div><b class="num">' + stored.length + '</b><span>in my bay</span></div><div><b class="num">' + coming.length + '</b><span>arriving</span></div><div><b class="num">' + out.length + '</b><span>outbound</span></div><div><b class="num">' + minDays + 'd</b><span>free days left (lowest)</span></div></div></div></section>' +
      '<div class="wh-bar"><div class="seg" role="group" aria-label="Layout"><button data-wh="rack" aria-pressed="' + (layout === 'rack') + '">' + ic('layers', 16) + ' Rack view</button><button data-wh="list" aria-pressed="' + (layout === 'list') + '">' + ic('shop', 16) + ' List view</button></div><span class="sample">Tap parcels to select them, then choose an action.</span></div>' +
      '<div class="wh-main"><div class="stack" style="--g:14px;min-width:0">' +
        lane('Receiving dock', 'truck', coming, 'coming', 'Parcels you declared, on the way to us') +
        (layout === 'rack' ? rack(stored) : listView(stored)) +
        lane('Outbound', 'plane', out, 'out', 'Shipped to you') +
      '</div>' + whControl(stored) + '</div>' +
      '<section class="sec two-e"><div class="card pad stack"><b>Shipping calculator</b>' + A.quoteWidget('s') + '</div><div class="card pad stack"><b>Services and prices</b>' + [['cam', 'Photo check', 'RM 5 / carton'], ['eye', 'Video check', 'RM 12 / carton'], ['shield', 'Count and quality', '1.5% of goods'], ['layers', 'Repack and consolidate', 'RM 3 / carton'], ['box', 'Storage after 14 days', 'RM 1.20 / carton / day'], ['truck', 'Return to seller in China', 'RM 15 / parcel']].map(function (x) { return '<div class="ln"><span style="display:flex;gap:8px;align-items:center">' + ic(x[0], 18) + x[1] + '</span><b>' + x[2] + '</b></div>'; }).join('') + '</div></section>' +
      '</div>';
  }
  function daysLeft(x) { return x.arr ? 14 + (x.extra || 0) - Math.floor((Date.now() - x.arr) / 864e5) : 14; }
  function lane(title, icn, list, kind, sub) {
    return '<div class="lane lane-' + kind + '"><div class="lane-h">' + ic(icn, 18) + '<b>' + title + '</b><span class="sample">' + sub + '</span></div><div class="lane-row">' + (list.length ? list.map(function (x) { return '<a class="lane-i" href="#track" data-trk="' + esc(x.trk || x.id) + '"><span class="num">' + esc(x.trk || x.id) + '</span><small>' + esc(x.sname || x.n) + '</small>' + (kind === 'out' ? '<span class="lane-bar"><i style="width:' + Math.round((x.progress || .05) * 100) + '%"></i></span>' : '<small>' + esc(x.courier || '') + '</small>') + '</a>'; }).join('') : '<span class="sample">Nothing here right now.</span>') + '</div></div>';
  }
  function boxEl(x) {
    var d = daysLeft(x), w = Math.min(100, 44 + x.ctn * 9), on = !!SEL[x.id];
    return '<button type="button" class="pbox' + (on ? ' on' : '') + (d < 5 ? ' late' : '') + '" data-pbox="' + x.id + '" aria-pressed="' + on + '" style="--w:' + w + 'px" aria-label="' + esc(x.id + ', ' + x.n) + '"><span class="pbox-c"><i></i></span><span class="pbox-t num">' + esc(x.id.replace('EZ-P-', '')) + '</span><span class="pbox-d">' + (d > 0 ? d + 'd free' : 'rent') + '</span>' + (on ? '<span class="pbox-ok">' + ic('check', 14) + '</span>' : '') + '</button>';
  }
  function rack(list) {
    var box = function (lv) { return '<svg viewBox="0 0 48 40" aria-hidden="true"><path d="M6 12l18-8 18 8v20l-18 8-18-8z" fill="#D9A15E"/><path d="M6 12l18 8 18-8M24 20v20" stroke="#9B6A33" stroke-width="1.6" fill="none"/><path d="M15 8l18 8" stroke="#F1CE98" stroke-width="3"/><rect x="11" y="24" width="10" height="6" rx="1" fill="#fff" opacity=".85"/></svg><em>L' + lv + '</em>'; };
    return '<div class="bay"><div class="bay-h"><div><b>Rack B2 · shelf 18</b><span>' + list.length + ' parcel' + (list.length === 1 ? '' : 's') + ' stored</span></div><button class="bay-add" data-act="declare">' + ic('plus', 16) + ' Add parcel</button></div>' +
      '<div class="bay-grid">' + list.map(function (x, i) {
        var d = daysLeft(x), on = !!SEL[x.id], pct = Math.max(4, Math.min(100, d / (14 + (x.extra || 0)) * 100));
        return '<div class="pcell' + (on ? ' on' : '') + (d < 5 ? ' late' : '') + '" data-pbox="' + x.id + '" role="button" tabindex="0" aria-pressed="' + on + '">' +
          '<span class="pc-ck" aria-hidden="true">' + ic('check', 13) + '</span>' +
          '<div class="pc-top"><span class="pc-box">' + box((i % 3) + 1) + '</span><span class="pc-id"><b class="num">' + esc(x.id) + '</b><small>' + esc(x.sname || x.n) + '</small></span></div>' +
          '<div class="pc-meta num">' + x.ctn + ' ctn · ' + fmt(x.kg, 1) + ' kg · ' + x.photos + ' photos</div>' +
          '<div class="pc-free"><span><i style="width:' + pct + '%"></i></span><small>' + (d > 0 ? d + ' free days left' : 'Storage fee running') + '</small></div>' +
          '<div class="pc-acts"><button type="button" data-pk="inspect" data-id="' + x.id + '">' + ic('shield', 15) + '<span>Check</span></button><button type="button" data-act="photos" data-id="' + x.id + '">' + ic('cam', 15) + '<span>Photos</span></button><button type="button" data-rename="parcel|' + x.id + '">' + ic('edit', 15) + '<span>Edit</span></button></div>' +
        '</div>';
      }).join('') + '<button type="button" class="pcell pcell-add" data-act="declare">' + ic('plus', 22) + '<b>Add a parcel</b><small>Tell us what is coming to your China address</small></button></div></div>';
  }
  function listView(list) {
    return '<div class="card">' + (list.length ? list.map(function (x) { var d = daysLeft(x), on = !!SEL[x.id]; return '<button type="button" class="lrow wh-li' + (on ? ' on' : '') + '" data-pbox="' + x.id + '" aria-pressed="' + on + '"><span class="wh-ck">' + (on ? ic('check', 14) : '') + '</span><span class="box-ic"><svg viewBox="0 0 40 40" aria-hidden="true"><rect x="4" y="10" width="32" height="24" rx="3" fill="#C58B4A"/><path d="M4 17h32M20 10v24" stroke="#8E5F2C" stroke-width="2"/></svg></span><span class="mid"><b>' + esc(x.n) + '</b><span class="sample num">' + x.id + ' · ' + x.ctn + ' ctn · ' + fmt(x.kg, 1) + ' kg · ' + x.photos + ' photos</span></span><span class="end"><span class="pill ' + (d < 5 ? 'warn' : 'good') + '">' + (d > 0 ? d + ' free days' : 'Storage fee') + '</span></span></button>'; }).join('') : '<div class="empty">Your bay is empty.</div>') + '</div>';
  }
  function whControl(stored) {
    var ids = Object.keys(SEL), sel = stored.filter(function (x) { return SEL[x.id]; }), kg = 0, ctn = 0; sel.forEach(function (x) { kg += x.kg; ctn += x.ctn; });
    var dis = ids.length ? '' : ' disabled';
    return '<aside class="wh-ctl card"><div class="wh-ctl-h"><b>Control panel</b><button class="linkbtn" data-whall="1">' + (ids.length && ids.length === stored.length ? 'Clear' : 'Select all') + '</button></div>' +
      '<div class="wh-sel">' + (ids.length ? '<b class="num">' + ids.length + ' selected</b><span class="sample">' + ctn + ' cartons · ' + fmt(kg, 1) + ' kg</span>' : '<span class="sample">Select parcels on the rack</span>') + '</div>' +
      '<div class="wh-acts">' +
        '<button class="wa wa-main" data-wa="ship"' + dis + '>' + ic('truck', 20) + '<span><b>Ship now</b><small>Air or sea to your door</small></span></button>' +
        '<button class="wa" data-wa="consol"' + (ids.length > 1 ? '' : ' disabled') + '>' + ic('layers', 20) + '<span><b>Combine and ship</b><small>Repack to save ~22%</small></span></button>' +
        '<button class="wa" data-wa="inspect"' + (ids.length === 1 ? '' : ' disabled') + '>' + ic('shield', 20) + '<span><b>Inspect</b><small>Photo, video, count, quality</small></span></button>' +
        '<button class="wa" data-rename="parcel|' + (ids[0] || '') + '"' + (ids.length === 1 ? '' : ' disabled') + '>' + ic('chat', 20) + '<span><b>Rename cargo</b><small>Give it a name you know</small></span></button>' +
        '<button class="wa" data-wa="photos"' + (ids.length === 1 ? '' : ' disabled') + '>' + ic('cam', 20) + '<span><b>See photos</b><small>Taken on arrival</small></span></button>' +
        '<button class="wa" data-wa="keep"' + dis + '>' + ic('box', 20) + '<span><b>Keep 14 more days</b><small>RM 1.20 / carton / day</small></span></button>' +
        '<button class="wa" data-wa="return"' + dis + '>' + ic('swap', 20) + '<span><b>Return to seller</b><small>Inside China · RM 15</small></span></button>' +
      '</div></aside>';
  }
  document.addEventListener('click', function (e) {
    var pk = e.target.closest('[data-pk]'); if (pk) { EZFLOW.start('inspect', { id: pk.getAttribute('data-id') }); return; }
    if (e.target.closest('.pc-acts')) return;
    var b = e.target.closest('[data-pbox]'); if (b) { var id = b.getAttribute('data-pbox'); if (SEL[id]) delete SEL[id]; else SEL[id] = 1; A.route(); return; }
    var w = e.target.closest('[data-wh]'); if (w) { set('ezi-wh-view', w.getAttribute('data-wh')); A.route(); return; }
    if (e.target.closest('[data-whall]')) { var st = S().parcels.filter(function (x) { return x.st === 'stored'; }); if (Object.keys(SEL).length === st.length) SEL = {}; else st.forEach(function (x) { SEL[x.id] = 1; }); A.route(); return; }
    var a = e.target.closest('[data-wa]'); if (!a || a.disabled) return;
    var ids = Object.keys(SEL), act = a.getAttribute('data-wa');
    if (act === 'ship' || act === 'consol') { SEL = {}; EZFLOW.start('ship', { ids: ids, consol: act === 'consol' }); }
    else if (act === 'inspect') EZFLOW.start('inspect', { id: ids[0] });
    else if (act === 'photos') { var t = document.createElement('button'); t.setAttribute('data-act', 'photos'); t.setAttribute('data-id', ids[0]); t.hidden = true; document.body.appendChild(t); t.click(); t.remove(); }
    else if (act === 'keep') { var s = S(), c = 0; s.parcels.forEach(function (x) { if (SEL[x.id]) { x.extra = (x.extra || 0) + 14; c += x.ctn; } }); A.note('Storage extended 14 days for ' + ids.length + ' parcels', 'ship'); A.save(); A.toast('Kept 14 more days · about ' + money(c * 1.2 * 14) + ' when used', true); SEL = {}; A.route(); }
    else if (act === 'return') { var m = document.createElement('div'); A.close(); openConfirm('Return ' + ids.length + ' parcel' + (ids.length > 1 ? 's' : '') + ' to the seller?', 'We send them back inside China and charge RM 15 per parcel from your wallet. This cannot be undone once the courier collects them.', 'Return to seller', function () { var s = S(), cost = ids.length * 15; s.wallet -= cost; A.ledger('Return to seller · ' + ids.join(', '), -cost, 'out'); s.parcels.forEach(function (x) { if (SEL[x.id]) { x.st = 'returning'; x.mode = 'Return to seller'; x.progress = .1; } }); SEL = {}; A.note('Return to seller booked for ' + ids.join(', '), 'ship'); A.save(); A.badges(); A.route(); A.toast('Return booked · ' + money(cost), true); }); }
  });
  function openConfirm(title, text, btn, fn) {
    var sc = document.createElement('div'); sc.className = 'scrim'; var m = document.createElement('div'); m.className = 'modal'; m.setAttribute('role', 'dialog');
    m.innerHTML = '<h3>' + esc(title) + '</h3><p class="muted">' + esc(text) + '</p><div class="row" style="justify-content:flex-end"><button class="btn btn-line" data-cx="no">Cancel</button><button class="btn btn-red" data-cx="yes">' + esc(btn) + '</button></div>';
    document.body.appendChild(sc); document.body.appendChild(m);
    function close() { sc.remove(); m.remove(); }
    sc.onclick = close; m.querySelector('[data-cx="no"]').onclick = close; m.querySelector('[data-cx="yes"]').onclick = function () { close(); fn(); };
  }

  /* =================== Control centre =================== */
  var OTH = {
    orders: [{ id: 'EZO-2987', c: 'GadgetHub JB', p: 'p3', q: 500, total: 13120, step: 3 }, { id: 'EZO-2991', c: 'Bayt Home Jeddah', p: 'p13', q: 800, total: 7940, step: 4 }, { id: 'EZO-3002', c: 'Nur Hijab Store', p: 'p16', q: 2000, total: 3480, step: 1 }, { id: 'EZO-3010', c: 'Pack&Go Penang', p: 'p15', q: 20000, total: 8260, step: 5 }],
    parcels: [{ id: 'EZ-P-20911', c: 'GadgetHub JB', n: 'Chargers · 1688', ctn: 4, kg: 0, st: 'coming' }, { id: 'EZ-P-20915', c: 'Mama Home Ipoh', n: 'Kitchen set · Taobao', ctn: 2, kg: 14.2, st: 'stored', days: 12 }, { id: 'EZ-P-20840', c: 'Lumière Kuching', n: 'Lamps · Foshan', ctn: 7, kg: 48, st: 'stored', days: 16 }],
    apps: [{ n: 'Ningbo Home Craft', city: 'Ningbo', cat: 'Home & kitchen', st: 'pending' }, { n: 'Shantou Toy Land', city: 'Shantou', cat: 'Toys', st: 'pending' }],
    listings: [{ n: 'Silicone kitchen utensil set, 12 pcs', f: 'f2', st: 'pending', note: '' }, { n: 'Sports shoes with a famous brand logo', f: 'f8', st: 'blocked', note: 'Uses another company’s brand. Blocked automatically.' }, { n: 'Bamboo phone stand, custom logo', f: 'f3', st: 'pending', note: '' }],
    tickets: [{ id: 'EZT-5120', c: 'Aisyah Trading', t: 'Parcel or shipping', m: 'When will EZ-P-20902 arrive?', st: 'open', at: Date.now() - 2 * 3600e3 }, { id: 'EZT-5114', c: 'Bayt Home Jeddah', t: 'Order or escrow', m: '12 boxes have scratches, please check.', st: 'open', at: Date.now() - 5 * 3600e3 }, { id: 'EZT-5099', c: 'Toko Riang', t: 'Account', m: 'How do I get credit?', st: 'closed', at: Date.now() - 30 * 3600e3 }],
    cust: [['Aisyah Trading', 'MY-A10482', 742, 96, 72, 64, 90, 20000, 'Active'], ['GadgetHub JB', 'MY-G10311', 688, 88, 81, 40, 76, 12000, 'Active'], ['Bayt Home Jeddah', 'SA-B11207', 612, 70, 55, 30, 88, 5000, 'Review'], ['Toko Riang', 'BN-T11990', 540, 52, 30, 12, 60, 0, 'Not eligible']],
    fstat: {}, fees: { insp: 1.5, rent: 1.2, fx: 0.5, photo: 5 }
  };
  var CODES = {"GadgetHub JB": "MY-G10311", "Bayt Home Jeddah": "SA-B11207", "Nur Hijab Store": "MY-N10577", "Pack&Go Penang": "MY-P10702", "Mama Home Ipoh": "MY-M10845", "Lumière Kuching": "MY-L10933", "Toko Riang": "BN-T11990", "Aisyah Trading": "MY-A10482"};
  function code(n) { return n === S().name ? S().code : (CODES[n] || '—'); }
  function who(n) { return '<b>' + esc(n) + '</b><div class="sample num">' + code(n) + '</div>'; }
  var TABS = [['overview', 'Overview', 'home'], ['orders', 'Orders & escrow', 'lock'], ['warehouse', 'Warehouse', 'box'], ['factories', 'Factories', 'factory'], ['products', 'Listings', 'shop'], ['groups', 'Group deals', 'group'], ['customers', 'Customers & credit', 'credit'], ['payments', 'Payments', 'wallet'], ['rates', 'Rates & fees', 'swap'], ['reviews', 'Reviews', 'heart'], ['support', 'Support', 'chat']];
  function control(arg) {
    var tab = TABS.some(function (t) { return t[0] === arg; }) ? arg : 'overview';
    return '<div class="view ctl"><div class="ctl-top"><div><span class="eyebrow">Control centre · staff only</span><h1>' + TABS.filter(function (t) { return t[0] === tab; })[0][1] + '</h1></div><div class="row"><label class="ctl-find">' + ic('search', 16) + '<input id="ctl-find" placeholder="Find customer by code or name" aria-label="Find customer by code or name" autocomplete="off"></label><span class="pill red"><span class="live-dot"></span> Live · sample data</span></div></div>' +
      '<div class="ctl-wrap"><nav class="ctl-nav" aria-label="Control sections">' + TABS.map(function (t) { return '<a href="#control-' + t[0] + '" class="' + (t[0] === tab ? 'on' : '') + '">' + ic(t[2], 18) + '<span>' + t[1] + '</span>' + badge(t[0]) + '</a>'; }).join('') + '</nav><div class="ctl-body">' + CT[tab]() + '</div></div></div>';
  }
  function allOrders() { var s = S(); return s.orders.map(function (o) { return { id: o.id, c: s.name, p: o.p, q: o.q, total: o.total, step: o.step, mine: true, o: o }; }).concat(OTH.orders); }
  function allParcels() { var s = S(); return s.parcels.map(function (x) { return { id: x.id, c: s.name, n: x.n, ctn: x.ctn, kg: x.kg, st: x.st, days: x.arr ? Math.floor((Date.now() - x.arr) / 864e5) : 0, x: x }; }).concat(OTH.parcels); }
  function badge(t) {
    var n = 0;
    if (t === 'orders') n = allOrders().filter(function (o) { return o.step === 4; }).length;
    if (t === 'warehouse') n = allParcels().filter(function (p) { return p.st === 'coming'; }).length;
    if (t === 'factories') n = OTH.apps.filter(function (a) { return a.st === 'pending'; }).length;
    if (t === 'products') n = OTH.listings.filter(function (a) { return a.st === 'pending'; }).length;
    if (t === 'support') n = OTH.tickets.filter(function (a) { return a.st === 'open'; }).length;
    return n ? '<em>' + n + '</em>' : '';
  }
  function stat(l, v, s2, href) { return '<a class="card stat ctl-stat" href="' + (href || '#control') + '"><span>' + l + '</span><b class="num">' + v + '</b><small>' + (s2 || '') + '</small></a>'; }
  function spark(vals) { var mx = Math.max.apply(null, vals), w = 100 / vals.length; return '<svg class="spark" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">' + vals.map(function (v, i) { var h = v / mx * 36; return '<rect x="' + (i * w + 1.5) + '" y="' + (40 - h) + '" width="' + (w - 3) + '" height="' + h + '" rx="1.5" fill="' + (i === vals.length - 1 ? 'var(--red)' : 'var(--line-2)') + '"/>'; }).join('') + '</svg>'; }
  function tbl(head, rows) { return '<div class="card table-wrap"><table><thead><tr>' + head.map(function (h) { return '<th>' + h + '</th>'; }).join('') + '</tr></thead><tbody>' + (rows.length ? rows.join('') : '<tr><td colspan="' + head.length + '" class="sample">Nothing here.</td></tr>') + '</tbody></table></div>'; }
  var STEPC = function (st) { return st >= 6 ? 'good' : st === 4 ? 'warn' : 'blue'; };
  var CT = {
    overview: function () {
      var s = S(), os = allOrders(), ps = allParcels(), esc2 = os.filter(function (o) { return o.step < 5; }).reduce(function (a, o) { return a + o.total; }, 0);
      var alerts = [];
      os.filter(function (o) { return o.step === 4; }).forEach(function (o) { alerts.push(['warn', 'Release payment for ' + o.id + ' (' + o.c + '). Inspection passed.', '#control-orders']); });
      ps.filter(function (p) { return p.st === 'coming'; }).forEach(function (p) { alerts.push(['blue', p.id + ' expected today. Receive and measure it.', '#control-warehouse']); });
      ps.filter(function (p) { return p.st === 'stored' && p.days > 14; }).forEach(function (p) { alerts.push(['red', p.id + ' is past free storage (' + p.days + ' days). Rent is running.', '#control-warehouse']); });
      Object.keys(E.FACT).filter(function (k) { return E.FACT[k].sc < 83; }).forEach(function (k) { alerts.push(['red', E.FACT[k].n + ' score ' + E.FACT[k].sc + '. Review or replace.', '#control-factories']); });
      OTH.tickets.filter(function (t) { return t.st === 'open'; }).forEach(function (t) { alerts.push(['warn', 'Ticket ' + t.id + ' from ' + t.c + ' waiting for reply.', '#control-support']); });
      return '<div class="statg">' + stat('Orders value today', money(38420, 0), '+12% vs yesterday', '#control-orders') + stat('Held in escrow', money(esc2, 0), os.filter(function (o) { return o.step < 5; }).length + ' orders', '#control-orders') + stat('Parcels in warehouse', ps.filter(function (p) { return p.st === 'stored'; }).length + 1270, '1,284 received today', '#control-warehouse') + stat('Open tickets', OTH.tickets.filter(function (t) { return t.st === 'open'; }).length, 'reply target 4 h', '#control-support') + '</div>' +
        '<div class="two-e" style="margin-top:14px"><div class="card pad stack"><div class="between"><b>Needs action</b><span class="pill red">' + alerts.length + '</span></div>' + (alerts.length ? alerts.map(function (a) { return '<a class="ctl-al" href="' + a[2] + '"><i class="' + a[0] + '"></i><span>' + esc(a[1]) + '</span>' + ic('arrow', 16) + '</a>'; }).join('') : '<span class="sample">All clear.</span>') + '</div>' +
        '<div class="stack" style="--g:14px"><div class="card pad stack"><div class="between"><b>Orders, last 7 days</b><span class="sample">count</span></div>' + spark([42, 51, 38, 60, 57, 71, 64 + s.orders.length]) + '<div class="ln sample"><span>7 days ago</span><span>Today</span></div></div><div class="card pad stack"><b>Group deals live</b>' + E.GROUP.slice(0, 4).map(function (g) { return '<div class="stack" style="--g:4px"><div class="ln"><span>' + esc(A.P(g.p).n.split(',')[0]) + '</span><b class="num">' + Math.round(g.got / g.goal * 100) + '%</b></div><div class="bar" style="height:6px"><i style="width:' + Math.min(100, g.got / g.goal * 100) + '%"></i></div></div>'; }).join('') + '</div></div></div>' +
        '<div class="card pad stack" style="margin-top:14px"><b>Latest activity</b>' + s.notes.slice(0, 6).map(function (n) { return '<div class="ln"><span>' + esc(n.m) + '</span><span class="sample" style="white-space:nowrap">' + ago(n.t) + '</span></div>'; }).join('') + '</div>';
    },
    orders: function () {
      return '<p class="muted ctl-p">Move orders through their steps. Release escrow only after inspection passes. Refunds go back to the customer wallet.</p>' + tbl(['Order', 'Customer', 'Product', 'Value', 'Step', ''], allOrders().map(function (o) { var p = A.P(o.p); return '<tr><td class="num"><b>' + o.id + '</b></td><td>' + who(o.c) + '</td><td>' + esc(p.n.split(',')[0]) + '<div class="sample">' + fmt(o.q, 0) + ' pcs</div></td><td class="num">' + money(o.total) + '</td><td><span class="pill ' + STEPC(o.step) + '">' + E.ORDER_STEPS[o.step][0] + '</span></td><td class="ctl-a">' + (o.step < 6 ? '<button class="btn btn-sm ' + (o.step === 4 ? 'btn-red' : 'btn-line') + '" data-ca="adv" data-id="' + o.id + '">' + (o.step === 4 ? 'Release escrow' : 'Next step') + '</button>' : '') + (o.step < 5 ? '<button class="btn btn-sm btn-line" data-ca="refund" data-id="' + o.id + '">Refund</button>' : '') + '</td></tr>'; }));
    },
    warehouse: function () {
      return '<p class="muted ctl-p">Receive parcels, enter weight and cartons, and dispatch shipments. Customers see every change at once.</p>' + tbl(['Parcel', 'Customer', 'Contents', 'Cartons', 'Weight', 'Status', ''], allParcels().map(function (p) { return '<tr><td class="num"><b>' + p.id + '</b></td><td>' + who(p.c) + '</td><td>' + esc(p.n) + '</td><td class="num">' + p.ctn + '</td><td class="num">' + (p.kg ? fmt(p.kg, 1) + ' kg' : '—') + '</td><td><span class="pill ' + (p.st === 'coming' ? 'blue' : p.st === 'stored' ? (p.days > 14 ? 'warn' : 'good') : 'red') + '">' + ({ coming: 'Arriving', stored: 'Stored · day ' + p.days, shipped: 'Shipped', returning: 'Returning' }[p.st] || p.st) + '</span></td><td class="ctl-a">' + (p.st === 'coming' ? '<input class="ctl-kg" data-kg="' + p.id + '" inputmode="decimal" placeholder="kg" aria-label="Weight in kg"><button class="btn btn-sm btn-red" data-ca="recv" data-id="' + p.id + '">Receive</button>' : p.st === 'stored' ? '<button class="btn btn-sm btn-line" data-ca="photo" data-id="' + p.id + '">Add photos</button>' : '') + (p.st === 'shipped' && p.x ? '<button class="btn btn-sm btn-line" data-ca="deliver" data-id="' + p.id + '">Mark delivered</button>' : '') + '</td></tr>'; }));
    },
    factories: function () {
      return '<p class="muted ctl-p">Approve new factories, pause weak ones, and watch daily scores. Factories under 75 for 14 days are replaced.</p>' +
        (OTH.apps.some(function (a) { return a.st === 'pending'; }) ? '<div class="card pad stack" style="margin-bottom:14px"><b>New applications</b>' + OTH.apps.map(function (a, i) { return a.st === 'pending' ? '<div class="ln" style="align-items:center"><span><b>' + esc(a.n) + '</b> <span class="sample">' + a.city + ' · ' + a.cat + '</span></span><span class="row"><button class="btn btn-sm btn-red" data-ca="fapp" data-i="' + i + '">Approve</button><button class="btn btn-sm btn-line" data-ca="frej" data-i="' + i + '">Decline</button></span></div>' : ''; }).join('') + '</div>' : '') +
        tbl(['Factory', 'Level', 'Score', 'Pass rate', 'On time', 'Status', ''], Object.keys(E.FACT).map(function (k) { var f = E.FACT[k], st = OTH.fstat[k] || 'Active'; return '<tr><td><b>' + esc(f.n) + '</b><div class="sample">' + f.city + '</div></td><td>' + f.lv + '</td><td class="num"><b style="color:' + (f.sc >= 90 ? 'var(--good)' : f.sc >= 83 ? 'var(--ink)' : 'var(--red)') + '">' + f.sc + '</b></td><td class="num">' + f.pass + '%</td><td class="num">' + f.ontime + '%</td><td><span class="pill ' + (st === 'Active' ? 'good' : 'warn') + '">' + st + '</span></td><td class="ctl-a"><button class="btn btn-sm btn-line" data-ca="fpause" data-id="' + k + '">' + (st === 'Active' ? 'Pause' : 'Resume') + '</button></td></tr>'; }));
    },
    products: function () {
      return '<p class="muted ctl-p">Every listing is checked before it goes live. Listings that copy another brand are blocked.</p>' + tbl(['Listing', 'Factory', 'Status', ''], OTH.listings.map(function (l, i) { return '<tr><td><b>' + esc(l.n) + '</b>' + (l.note ? '<div class="sample" style="color:var(--red)">' + esc(l.note) + '</div>' : '') + '</td><td>' + esc(E.FACT[l.f].n) + '</td><td><span class="pill ' + (l.st === 'live' ? 'good' : l.st === 'pending' ? 'warn' : 'red') + '">' + ({ live: 'Live', pending: 'Waiting review', blocked: 'Blocked', rejected: 'Rejected' }[l.st]) + '</span></td><td class="ctl-a">' + (l.st === 'pending' ? '<button class="btn btn-sm btn-red" data-ca="lok" data-i="' + i + '">Approve</button><button class="btn btn-sm btn-line" data-ca="lno" data-i="' + i + '">Reject</button>' : '') + '</td></tr>'; }).concat(E.PROD.slice(0, 6).map(function (p) { return '<tr><td><b>' + esc(p.n) + '</b></td><td>' + esc(E.FACT[p.f].n) + '</td><td><span class="pill good">Live</span></td><td class="ctl-a"><a class="btn btn-sm btn-line" href="#p-' + p.id + '">View</a></td></tr>'; })));
    },
    groups: function () {
      return '<p class="muted ctl-p">Watch every group deal. Extend a deadline, close a deal that reached its target, or cancel and refund deposits.</p>' + tbl(['Product', 'Progress', 'Shops', 'Ends', ''], E.GROUP.map(function (g) { return '<tr><td><b>' + esc(A.P(g.p).n.split(',')[0]) + '</b>' + (g.mine ? '<div class="sample">Started by a customer</div>' : '') + '</td><td style="min-width:140px"><div class="bar" style="height:6px"><i style="width:' + Math.min(100, g.got / g.goal * 100) + '%"></i></div><span class="sample num">' + fmt(g.got, 0) + ' / ' + fmt(g.goal, 0) + '</span></td><td class="num">' + g.shops + '</td><td class="num" data-end="' + g.ends + '">--</td><td class="ctl-a"><button class="btn btn-sm btn-line" data-ca="gext" data-id="' + g.id + '">+24 h</button><button class="btn btn-sm ' + (g.got >= g.goal ? 'btn-red' : 'btn-line') + '" data-ca="gclose" data-id="' + g.id + '">' + (g.got >= g.goal ? 'Close and order' : 'Cancel and refund') + '</button></td></tr>'; }));
    },
    customers: function () {
      return '<p class="muted ctl-p">Customers see only their score, band and limit. How the score is calculated is visible to staff only.</p><div class="statg" style="margin-bottom:14px">' + [['On-time payments', '40%'], ['Trading volume, 6 months', '25%'], ['Inspection disputes', '20%'], ['Months with us', '15%']].map(function (x) { return '<div class="card stat"><span>' + x[0] + '</span><b class="num">' + x[1] + '</b><small>weight in score</small></div>'; }).join('') + '</div>' +
        tbl(['Customer', 'Score', 'On time', 'Volume', 'Tenure', 'Disputes', 'Limit', 'Status', ''], OTH.cust.map(function (x, i) { if (i === 0) x[7] = S().credit.limit; return '<tr><td><b>' + x[0] + '</b><div class="sample">' + x[1] + '</div></td><td class="num"><b>' + x[2] + '</b></td>' + [3, 4, 5, 6].map(function (k) { return '<td><div class="bar" style="height:6px;width:64px"><i style="width:' + x[k] + '%;background:' + (x[k] > 75 ? 'var(--good)' : x[k] > 50 ? 'var(--warn)' : 'var(--red)') + '"></i></div><span class="sample num">' + x[k] + '</span></td>'; }).join('') + '<td><input class="ctl-kg num" data-lim="' + i + '" value="' + x[7] + '" aria-label="Credit limit"></td><td><span class="pill ' + (x[8] === 'Active' ? 'good' : x[8] === 'Frozen' ? 'red' : 'warn') + '">' + x[8] + '</span></td><td class="ctl-a"><button class="btn btn-sm btn-red" data-ca="lim" data-i="' + i + '">Save limit</button><button class="btn btn-sm btn-line" data-ca="frz" data-i="' + i + '">' + (x[8] === 'Frozen' ? 'Unfreeze' : 'Freeze') + '</button></td></tr>'; }));
    },
    payments: function () {
      var s = S(), inn = 0, out = 0; s.ledger.forEach(function (l) { if (l.a > 0) inn += l.a; else out -= l.a; });
      return '<div class="statg" style="margin-bottom:14px">' + stat('Money in', money(inn, 0), 'top-ups and refunds') + stat('Money out', money(out, 0), 'payments and escrow') + stat('Escrow held', money(s.escrow, 0), 'released after inspection') + stat('FX rate', '¥' + E.MYR_CNY, 'per 1 MYR') + '</div>' + tbl(['When', 'Customer', 'Description', 'Amount'], s.ledger.map(function (l) { return '<tr><td class="sample" style="white-space:nowrap">' + ago(l.t) + '</td><td>' + who(s.name) + '</td><td>' + esc(l.d) + '</td><td class="num ' + (l.k === 'in' ? 'amt-in' : l.k === 'escrow' ? 'amt-esc' : 'amt-out') + '" style="white-space:nowrap">' + (l.a > 0 ? '+' : l.a < 0 ? '−' : '') + money(Math.abs(l.a)) + '</td></tr>'; }));
    },
    rates: function () {
      return '<p class="muted ctl-p">Change shipping rates and fees here. Every price on the website updates straight away.</p>' + tbl(['Destination', 'Air RM / kg', 'Air days', 'Sea RM / CBM', 'Sea days'], E.DEST.map(function (d, i) { return '<tr><td><b>' + d.n + '</b></td><td><input class="ctl-kg num" data-rate="' + i + ':air" value="' + d.air + '" aria-label="Air rate"></td><td class="num">' + d.ad + '</td><td><input class="ctl-kg num" data-rate="' + i + ':sea" value="' + d.sea + '" aria-label="Sea rate"></td><td class="num">' + d.sd + '</td></tr>'; })) +
        '<div class="card pad stack" style="margin-top:14px"><b>Fees</b><div class="f2">' + [['insp', 'Standard inspection %'], ['rent', 'Storage RM / carton / day'], ['fx', 'Payment fee %'], ['photo', 'Photo check RM / carton']].map(function (x) { return '<div class="field"><label for="fee-' + x[0] + '">' + x[1] + '</label><input id="fee-' + x[0] + '" data-fee="' + x[0] + '" value="' + OTH.fees[x[0]] + '" inputmode="decimal"></div>'; }).join('') + '</div><button class="btn btn-red" data-ca="savefees" style="width:max-content">Save fees</button></div>';
    },
    reviews: function () { return window.EZREV ? EZREV.mod() : ''; },
    support: function () {
      return tbl(['Ticket', 'Customer', 'Topic', 'Message', 'Status', ''], OTH.tickets.map(function (t, i) { return '<tr><td class="num"><b>' + t.id + '</b><div class="sample">' + ago(t.at) + '</div></td><td>' + who(t.c) + '</td><td>' + esc(t.t) + '</td><td>' + esc(t.m) + (t.r ? '<div class="sample" style="color:var(--good)">Replied: ' + esc(t.r) + '</div>' : '') + '</td><td><span class="pill ' + (t.st === 'open' ? 'warn' : 'good') + '">' + (t.st === 'open' ? 'Open' : 'Closed') + '</span></td><td class="ctl-a">' + (t.st === 'open' ? '<input class="ctl-rep" data-rep="' + i + '" placeholder="Reply…" aria-label="Reply"><button class="btn btn-sm btn-red" data-ca="reply" data-i="' + i + '">Send</button>' : '') + '</td></tr>'; }));
    }
  };
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-ca]'); if (!b) return;
    var a = b.getAttribute('data-ca'), id = b.getAttribute('data-id'), i = +b.getAttribute('data-i'), s = S();
    function findO() { return allOrders().filter(function (o) { return o.id === id; })[0]; }
    if (a === 'adv') { var o = findO(); if (o.mine) { o.o.step++; if (o.o.step === 5) s.escrow = Math.max(0, s.escrow - o.o.total); A.note(o.id + ': ' + E.ORDER_STEPS[o.o.step][0], 'o-' + o.id); } else { var x = OTH.orders.filter(function (y) { return y.id === id; })[0]; x.step++; } A.toast(id + ' moved to: ' + E.ORDER_STEPS[(o.mine ? o.o.step : findO().step)][0], true); }
    else if (a === 'refund') { var o2 = findO(); if (o2.mine) { s.orders = s.orders.filter(function (x) { return x.id !== id; }); s.wallet += o2.total; s.escrow = Math.max(0, s.escrow - o2.total); A.ledger('Refund · ' + id, o2.total, 'in'); A.note('Order ' + id + ' refunded to your wallet', 'wallet'); } else OTH.orders = OTH.orders.filter(function (x) { return x.id !== id; }); A.toast(id + ' refunded', true); }
    else if (a === 'recv') { var kg = parseFloat(($('[data-kg="' + id + '"]') || {}).value) || 0; if (!kg) { A.toast('Enter the weight first'); return; } var mine = s.parcels.filter(function (x) { return x.id === id; })[0]; if (mine) { mine.st = 'stored'; mine.kg = kg; mine.arr = Date.now(); mine.dim = [50, 40, 30]; mine.photos = mine.ctn * 2; A.note(id + ' arrived: ' + mine.ctn + ' cartons · ' + kg + ' kg', 'ship'); } else { var op = OTH.parcels.filter(function (x) { return x.id === id; })[0]; op.st = 'stored'; op.kg = kg; op.days = 0; } A.toast(id + ' received · ' + kg + ' kg', true); }
    else if (a === 'photo') A.toast('Photos added to ' + id, true);
    else if (a === 'deliver') { var pp = s.parcels.filter(function (x) { return x.id === id; })[0]; if (pp) { pp.progress = 1; pp.st = 'delivered'; A.note(id + ' delivered', 'track'); } A.toast(id + ' delivered', true); }
    else if (a === 'fapp' || a === 'frej') { OTH.apps[i].st = a === 'fapp' ? 'approved' : 'declined'; A.toast(OTH.apps[i].n + (a === 'fapp' ? ' approved' : ' declined'), true); }
    else if (a === 'fpause') { OTH.fstat[id] = (OTH.fstat[id] || 'Active') === 'Active' ? 'Paused' : 'Active'; A.toast(E.FACT[id].n + ' ' + OTH.fstat[id].toLowerCase(), true); }
    else if (a === 'lok' || a === 'lno') { OTH.listings[i].st = a === 'lok' ? 'live' : 'rejected'; A.toast('Listing ' + (a === 'lok' ? 'approved' : 'rejected'), true); }
    else if (a === 'gext') { var g = A.G(id); g.ends += 864e5; A.toast('Deadline extended 24 hours', true); }
    else if (a === 'gclose') { var g2 = A.G(id); E.GROUP.splice(E.GROUP.indexOf(g2), 1); A.toast(g2.got >= g2.goal ? 'Deal closed. Factory order placed.' : 'Deal cancelled. Deposits refunded.', true); }
    else if (a === 'lim') { var v = parseFloat(($('[data-lim="' + i + '"]') || {}).value) || 0; OTH.cust[i][7] = v; if (i === 0) { s.credit.limit = v; A.note('Your EZI Credit limit is now ' + money(v, 0), 'credit'); } A.toast('Limit saved · ' + money(v, 0), true); }
    else if (a === 'frz') { OTH.cust[i][8] = OTH.cust[i][8] === 'Frozen' ? 'Active' : 'Frozen'; A.toast(OTH.cust[i][0] + ' ' + OTH.cust[i][8].toLowerCase(), true); }
    else if (a === 'savefees') { $$('[data-fee]').forEach(function (x) { OTH.fees[x.getAttribute('data-fee')] = parseFloat(x.value) || 0; }); A.toast('Fees saved', true); }
    else if (a === 'reply') { var r = ($('[data-rep="' + i + '"]') || {}).value; if (!r) { A.toast('Write a reply first'); return; } OTH.tickets[i].r = r; OTH.tickets[i].st = 'closed'; A.toast('Reply sent to ' + OTH.tickets[i].c, true); }
    A.save(); A.badges(); A.route();
  });
  document.addEventListener('change', function (e) { var r = e.target.getAttribute && e.target.getAttribute('data-rate'); if (!r) return; var pr = r.split(':'), v = parseFloat(e.target.value); if (v > 0) { E.DEST[+pr[0]][pr[1]] = v; A.toast(E.DEST[+pr[0]].n + ' ' + pr[1] + ' rate is now RM ' + v, true); } });

  document.addEventListener('input', function (e) { if (e.target.id !== 'ctl-find') return; var q = e.target.value.trim().toLowerCase(); $$('.ctl-body tbody tr').forEach(function (tr) { tr.hidden = !!q && tr.textContent.toLowerCase().indexOf(q) === -1; }); $$('.ctl-body .ctl-al').forEach(function (x) { x.hidden = !!q && x.textContent.toLowerCase().indexOf(q) === -1; }); });
  window.EZVIEWS.chat = chat; window.EZVIEWS.ship = ship; window.EZVIEWS.control = control;
  if (/^#(chat|ship|control)/.test(location.hash)) A.route();
})();
