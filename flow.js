/* EZICARGO · step-by-step flows (checkout, ship, top up, pay supplier, group deals, inspection), account page, tracking */
(function () {
  'use strict';
  var A = window.EZAPP, E = window.EZ;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var ic = A.ic, esc = A.esc, fmt = A.fmt, money = function (v, d) { return A.money(v, d); }, S = function () { return A.state(); };
  function rid(prefix, n) { var s = ''; for (var i = 0; i < (n || 4); i++) s += Math.floor(Math.random() * 10); return prefix + s; }
  function payRef() { var d = new Date(); return 'PAY-' + d.getFullYear() + ('0' + (d.getMonth() + 1)).slice(-2) + ('0' + d.getDate()).slice(-2) + '-' + rid('', 5); }
  function dest(id) { return E.DEST.filter(function (x) { return x.id === id; })[0] || E.DEST[0]; }

  /* ---------- flow definitions ---------- */
  var F = null, BACK = '#home';
  var DEF = {
    checkout: { title: 'Checkout', steps: ['Review', 'Delivery', 'Payment', 'Confirm', 'Done'], pay: ['wallet', 'credit', 'fpx', 'duitnow', 'card'] },
    ship: { title: 'Ship my parcels', steps: ['Parcels', 'Delivery', 'Payment', 'Confirm', 'Done'], pay: ['wallet', 'credit', 'fpx', 'duitnow', 'card'] },
    topup: { title: 'Top up wallet', steps: ['Amount', 'Payment', 'Confirm', 'Done'], pay: ['fpx', 'duitnow', 'card'] },
    paysup: { title: 'Pay a supplier', steps: ['Amount', 'Supplier', 'Payment', 'Confirm', 'Done'], pay: ['wallet', 'fpx'] },
    join: { title: 'Join group deal', steps: ['Pieces', 'Payment', 'Confirm', 'Done'], pay: ['wallet', 'fpx', 'card'] },
    newgroup: { title: 'Start a group deal', steps: ['Product', 'Deal', 'Payment', 'Confirm', 'Done'], pay: ['wallet', 'fpx', 'card'] },
    inspect: { title: 'Order an inspection', steps: ['Inspection', 'Payment', 'Confirm', 'Done'], pay: ['wallet', 'fpx', 'card'] }
  };
  var METHODS = {
    wallet: { n: 'EZI Wallet', ic: 'wallet', sub: function () { return 'Balance ' + money(S().wallet); } },
    credit: { n: 'EZI Credit', ic: 'credit', sub: function () { return 'Available ' + money(S().credit.limit - S().credit.used, 0) + ' · pay after arrival'; } },
    fpx: { n: 'FPX online banking', ic: 'shield', sub: function () { return 'Maybank2u, CIMB, Public Bank and more'; } },
    duitnow: { n: 'DuitNow QR', ic: 'shop', sub: function () { return 'Scan with any Malaysian banking app'; } },
    card: { n: 'Debit or credit card', ic: 'lock', sub: function () { return 'Visa or Mastercard'; } }
  };
  var BANKS = ['Maybank2u', 'CIMB Clicks', 'Public Bank', 'RHB Now', 'Hong Leong Connect', 'Bank Islam', 'AmOnline', 'Bank Rakyat'];

  function start(kind, d) {
    var s = S();
    BACK = location.hash && location.hash !== '#pay' ? location.hash : '#home';
    d = d || {};
    var da = window.EZSET ? EZSET.defAddr() : null, pf = s.prefs || {};
    d.addrId = da ? da.id : 'new'; d.addr = d.addr || JSON.parse(JSON.stringify(da || { name: s.name, phone: '012-345 6789', line: 'No. 12, Jalan Kenari 5, Seksyen 7', city: 'Shah Alam', post: '40000', state: 'Selangor' }));
    d.dest = d.dest || (da && da.dest) || 'MY'; d.mode = d.mode || pf.mode || 'sea'; d.insp = d.insp || pf.insp || 'std';
    d.method = d.pay || (pf.pay && DEF[kind].pay.indexOf(pf.pay) > -1 ? pf.pay : DEF[kind].pay[0]); d.bank = ''; d.agree = false; d.pin = '';
    d.card = { no: '4242 4242 4242 4242', exp: '12/28', cvc: '123', name: s.name };
    if (kind === 'topup') d.amt = d.amt || 5000;
    if (kind === 'join') { var g = A.G(d.g), p = A.P(g.p); d.q = Math.max(p.t[0][0], 100); }
    if (kind === 'newgroup') { d.p = d.p || 'p1'; d.days = 7; d.q = 300; }
    if (kind === 'inspect') { d.type = 'photo'; }
    if (kind === 'ship') { d.insure = false; if (pf.autoConsol && d.ids.length > 1) d.consol = true; d.sname = window.EZSET ? EZSET.shipName(d.dest) : 'Shipment'; }
    if (kind === 'paysup') { d.sup = d.to || 'Alipay · 义乌丝路纺织'; d.acct = ''; d.newsup = /New supplier/.test(d.sup); }
    F = { kind: kind, step: 0, d: d, res: null };
    if (location.hash === '#pay') A.route(); else location.hash = 'pay';
  }

  /* ---------- money for each flow ---------- */
  function lines() {
    var d = F.d, k = F.kind, L = [], t = 0;
    if (k === 'checkout') {
      d.items.forEach(function (it) {
        var p = A.P(it.p);
        if (it.sample) { var c = A.rmOf(p.t[0][1]) + 28; L.push([p.n.split(',')[0] + ' · sample', c]); t += c; return; }
        var x = A.landed(p, it.q, d.dest, d.mode, d.insp); L.push([p.n.split(',')[0] + ' × ' + fmt(it.q, 0), x.goods]); t += x.tot;
        it._x = x;
      });
      var ins = 0, sh = 0, fee = 0; d.items.forEach(function (it) { if (it._x) { ins += it._x.ins; sh += it._x.ship; fee += it._x.fee; } });
      if (sh) L.push(['Shipping · ' + (d.mode === 'air' ? 'air' : 'sea') + ' to ' + dest(d.dest).n, sh]);
      if (ins) L.push(['Inspection', ins]); if (fee) L.push(['Payment fee 0.5%', fee]);
      if (d.items.some(function (x) { return x.sample; })) L.push(['Sample shipping', 0]);
    } else if (k === 'ship') {
      var ps = S().parcels.filter(function (x) { return d.ids.indexOf(x.id) > -1; }), kg = 0, cbm = 0, ctn = 0, val = 0;
      ps.forEach(function (x) { kg += x.kg; cbm += x.dim[0] * x.dim[1] * x.dim[2] / 1e6 * x.ctn; ctn += x.ctn; val += x.val; });
      if (d.consol) cbm *= .78; var D = dest(d.dest), ch = Math.max(kg, cbm * 1e6 / 6000);
      var cost = d.mode === 'air' ? ch * D.air : Math.max(.5, cbm) * D.sea;
      d._m = { kg: kg, cbm: cbm, ctn: ctn, val: val, ch: ch };
      L.push([(d.mode === 'air' ? 'Air express ' : 'Sea LCL ') + '· ' + (d.mode === 'air' ? fmt(ch, 1) + ' kg' : fmt(Math.max(.5, cbm), 3) + ' CBM'), cost]); t += cost;
      if (d.consol) { L.push(['Repack and consolidate · ' + ctn + ' ctn', ctn * 3]); t += ctn * 3; }
      if (d.insure) { L.push(['Insurance 1% of goods value', val * .01]); t += val * .01; }
    } else if (k === 'topup') { L.push(['Top-up to EZI Wallet', d.amt]); t = d.amt; }
    else if (k === 'paysup') { L.push(['Supplier receives ¥' + fmt(d.amt * .995 * E.MYR_CNY, 2), d.amt * .995]); L.push(['Fee 0.5%', d.amt * .005]); t = d.amt; }
    else if (k === 'join') { var g = A.G(d.g), best = g.ladder[g.ladder.length - 1][1], dep = A.rmOf(best * d.q) * .3; L.push(['Deposit 30% · ' + fmt(d.q, 0) + ' pcs at ' + A.cny(best), dep]); t = dep; }
    else if (k === 'newgroup') { var p2 = A.P(d.p), tg = p2.t[p2.t.length - 1], dep2 = A.rmOf(tg[1] * d.q) * .3; L.push(['Your deposit 30% · ' + fmt(d.q, 0) + ' pcs at ' + A.cny(tg[1]), dep2]); t = dep2; }
    else if (k === 'inspect') { var pc = S().parcels.filter(function (x) { return x.id === d.id; })[0], pr = { photo: pc.ctn * 5, video: pc.ctn * 12, count: 8 * Math.max(1, Math.ceil(pc.ctn * 50 / 100)), quality: pc.val * .015 }[d.type]; L.push([{ photo: 'Photo check', video: 'Video check', count: 'Count every piece', quality: 'Quality check' }[d.type] + ' · ' + pc.ctn + ' cartons', pr]); t = pr; }
    if (k !== 'checkout') return { L: L, t: t };
    return { L: L, t: t };
  }

  /* ---------- view ---------- */
  function view() {
    if (!F) return '<div class="view"><div class="card empty"><b>Nothing to pay right now</b><a class="btn btn-red" href="#home">Go to home</a></div></div>';
    var D = DEF[F.kind], last = D.steps.length - 1, done = F.step === last;
    var stepper = '<ol class="fl-steps">' + D.steps.map(function (s, i) { return '<li class="' + (i < F.step ? 'done' : i === F.step ? 'now' : '') + '"><i>' + (i < F.step ? ic('check', 14) : i + 1) + '</i><span>' + s + '</span></li>'; }).join('') + '</ol>';
    var body = STEP[F.kind + ':' + D.steps[F.step]] || STEP[D.steps[F.step]];
    var m = lines();
    var aside = done ? '' : '<aside class="card pad stack fl-sum"><b>Summary</b>' + m.L.map(function (l) { return '<div class="ln"><span class="muted">' + esc(l[0]) + '</span><b class="num">' + money(l[1]) + '</b></div>'; }).join('') + '<div class="ln tot"><span>' + (F.kind === 'topup' ? 'You pay' : 'Total') + '</span><b class="num">' + money(m.t) + '</b></div>' + (F.kind === 'checkout' || F.kind === 'join' || F.kind === 'newgroup' ? '<div class="lock">' + ic('shield', 16) + ' Held in escrow until inspection passes</div>' : '') + '<span class="sample">Test mode. No real money moves.</span></aside>';
    var nextLabel = D.steps[F.step + 1] === 'Done' ? (F.d.method === 'fpx' ? 'Continue to ' + (F.d.bank || 'bank') : F.d.method === 'duitnow' ? 'Show QR code' : 'Pay ' + money(m.t)) : 'Continue';
    return '<div class="view fl"><div class="fl-top"><a href="' + BACK + '" class="fl-x" data-fl="cancel">' + ic('arrow', 18) + '<span>' + (done ? 'Close' : 'Cancel') + '</span></a><h1>' + D.title + '</h1></div>' + stepper +
      '<div class="' + (done ? 'fl-done-wrap' : 'two') + '"><div class="card pad stack fl-body" style="--g:16px">' + body() +
      (done ? '' : '<div class="fl-nav">' + (F.step ? '<button class="btn btn-line" data-fl="back">Back</button>' : '<span></span>') + '<button class="btn btn-red btn-lg" data-fl="next" id="fl-next">' + nextLabel + '</button></div><div class="fl-err" id="fl-err" role="alert"></div>') + '</div>' + aside + '</div></div>';
  }

  /* ---------- steps ---------- */
  function radio(name, val, cur, title, sub, right) { return '<label class="opt' + (val === cur ? ' on' : '') + '"><input type="radio" name="' + name + '" value="' + val + '"' + (val === cur ? ' checked' : '') + ' data-fr="' + name + '"><span class="opt-tx"><b>' + title + '</b>' + (sub ? '<small>' + sub + '</small>' : '') + '</span>' + (right ? '<b class="num">' + right + '</b>' : '') + '</label>'; }
  function addrForm() {
    var a = F.d.addr, book = S().addrs || [];
    var pick = book.length ? '<div class="stack" style="--g:8px"><b>Saved addresses</b>' + book.map(function (x) { return '<label class="opt' + (F.d.addrId === x.id ? ' on' : '') + '"><input type="radio" name="addrpick" value="' + x.id + '"' + (F.d.addrId === x.id ? ' checked' : '') + ' data-addrpick="1"><span class="opt-tx"><b>' + esc(x.label) + (x.def ? ' · default' : '') + '</b><small>' + esc(x.name + ' · ' + x.phone + ' · ' + x.line + ', ' + x.city) + '</small></span></label>'; }).join('') + '<label class="opt' + (F.d.addrId === 'new' ? ' on' : '') + '"><input type="radio" name="addrpick" value="new"' + (F.d.addrId === 'new' ? ' checked' : '') + ' data-addrpick="1"><span class="opt-tx"><b>Use a new address</b><small>Type it below</small></span></label></div>' : '';
    if (F.d.addrId !== 'new' && book.length) return pick;
    return pick + '<div class="stack"><b>Deliver to</b><div class="field"><label for="fa-c">Country</label><select id="fa-c" data-fd="dest">' + E.DEST.map(function (x) { return '<option value="' + x.id + '"' + (x.id === F.d.dest ? ' selected' : '') + '>' + x.n + '</option>'; }).join('') + '</select></div>' +
      '<div class="f2"><div class="field"><label for="fa-n">Receiver name</label><input id="fa-n" data-fa="name" value="' + esc(a.name) + '"></div><div class="field"><label for="fa-p">Phone</label><input id="fa-p" data-fa="phone" value="' + esc(a.phone) + '"></div></div>' +
      '<div class="field"><label for="fa-l">Address</label><input id="fa-l" data-fa="line" value="' + esc(a.line) + '"></div><div class="f3"><div class="field"><label for="fa-ci">City</label><input id="fa-ci" data-fa="city" value="' + esc(a.city) + '"></div><div class="field"><label for="fa-po">Postcode</label><input id="fa-po" data-fa="post" value="' + esc(a.post) + '"></div><div class="field"><label for="fa-st">State</label><input id="fa-st" data-fa="state" value="' + esc(a.state) + '"></div></div><label class="agree"><input type="checkbox" id="save-addr"' + (F.d.saveAddr ? ' checked' : '') + '> <span>Save this address to my address book</span></label></div>';
  }
  function modeOpts(airCost, seaCost) { var D = dest(F.d.dest); return '<div class="stack" style="--g:8px"><b>Shipping</b>' + radio('mode', 'sea', F.d.mode, 'Sea LCL · ' + D.sd + ' days', 'Cheapest for bulk stock', money(seaCost)) + radio('mode', 'air', F.d.mode, 'Air express · ' + D.ad + ' days', 'Fastest, priced by weight', money(airCost)) + '</div>'; }
  function payStep() {
    var d = F.d, m = lines().t, opts = DEF[F.kind].pay.map(function (k) {
      var M = METHODS[k], dis = k === 'credit' && S().credit.limit - S().credit.used < m;
      return '<label class="opt' + (d.method === k ? ' on' : '') + (dis ? ' dis' : '') + '"><input type="radio" name="method" value="' + k + '"' + (d.method === k ? ' checked' : '') + (dis ? ' disabled' : '') + ' data-fr="method"><span class="opt-ic">' + ic(M.ic, 20) + '</span><span class="opt-tx"><b>' + M.n + '</b><small>' + M.sub() + (dis ? ' · not enough' : '') + '</small></span></label>';
    }).join('');
    var extra = '';
    if (d.method === 'wallet') { var after = S().wallet - m; extra = after >= 0 ? '<div class="res"><div class="ln"><span class="muted">Balance now</span><b class="num">' + money(S().wallet) + '</b></div><div class="ln"><span class="muted">After this payment</span><b class="num">' + money(after) + '</b></div></div>' : '<div class="res" style="background:var(--warn-soft)"><b>Your wallet is short by ' + money(-after) + '</b><span class="sample">Top up the difference by FPX, or choose another way to pay.</span><button class="btn btn-ink btn-sm" data-fl="quicktop" data-v="' + Math.ceil(-after) + '" style="width:max-content">Top up ' + money(Math.ceil(-after), 0) + ' by FPX</button></div>'; }
    if (d.method === 'credit') extra = '<div class="res"><div class="ln"><span class="muted">Credit available</span><b class="num">' + money(S().credit.limit - S().credit.used, 0) + '</b></div><div class="ln"><span class="muted">Pay by</span><b>7 days after your goods arrive</b></div></div>';
    if (d.method === 'fpx') extra = '<div class="stack" style="--g:8px"><b>Choose your bank</b><div class="banks">' + BANKS.map(function (b) { return '<button type="button" class="bank' + (d.bank === b ? ' on' : '') + '" data-fl="bank" data-b="' + b + '">' + b + '</button>'; }).join('') + '</div></div>';
    if (d.method === 'duitnow') extra = '<div class="res"><span>You will see a DuitNow QR code on the next step. Scan it with any Malaysian banking or e-wallet app.</span></div>';
    if (d.method === 'card') extra = '<div class="stack"><div class="pill warn" style="width:max-content">Test mode · do not enter a real card</div><div class="field"><label for="cd-n">Card number</label><input id="cd-n" data-fc="no" inputmode="numeric" value="' + esc(d.card.no) + '"></div><div class="f3"><div class="field"><label for="cd-e">Expiry</label><input id="cd-e" data-fc="exp" value="' + esc(d.card.exp) + '"></div><div class="field"><label for="cd-c">CVC</label><input id="cd-c" data-fc="cvc" inputmode="numeric" value="' + esc(d.card.cvc) + '"></div><div class="field"><label for="cd-h">Name on card</label><input id="cd-h" data-fc="name" value="' + esc(d.card.name) + '"></div></div></div>';
    return '<h2 class="fl-h">How do you want to pay?</h2><div class="stack" style="--g:8px">' + opts + '</div>' + extra;
  }
  function confirmStep() {
    var d = F.d, m = lines(), M = METHODS[d.method];
    var auth = d.method === 'wallet' || d.method === 'credit' ? '<div class="field"><label for="pin">Enter your 6-digit EZI PIN</label><input id="pin" class="pin num" inputmode="numeric" maxlength="6" autocomplete="off" placeholder="••••••" value="' + esc(d.pin) + '"><span class="sample">Test mode: any 6 digits.</span></div>' : d.method === 'card' ? '<span class="sample">Your bank will ask for a one-time code on the next screen.</span>' : '';
    return '<h2 class="fl-h">Check and confirm</h2><div class="res">' + m.L.map(function (l) { return '<div class="ln"><span class="muted">' + esc(l[0]) + '</span><b class="num">' + money(l[1]) + '</b></div>'; }).join('') + '<div class="ln tot"><span>Total</span><b class="num">' + money(m.t) + '</b></div></div>' +
      '<div class="ln"><span class="muted">Pay with</span><b>' + M.n + (d.method === 'fpx' && d.bank ? ' · ' + d.bank : '') + (d.method === 'card' ? ' · •••• ' + d.card.no.replace(/\s/g, '').slice(-4) : '') + '</b></div>' +
      (F.kind === 'checkout' || F.kind === 'ship' ? '<div class="ln"><span class="muted">Deliver to</span><b style="max-width:60%">' + esc(d.addr.name + ', ' + d.addr.line + ', ' + d.addr.post + ' ' + d.addr.city + ', ' + dest(d.dest).n) + '</b></div>' : '') +
      auth + '<label class="agree"><input type="checkbox" id="agree"' + (d.agree ? ' checked' : '') + '> <span>I agree to the EZICARGO terms' + (F.kind === 'checkout' || F.kind === 'join' || F.kind === 'newgroup' ? ' and escrow rules: the factory is paid only after inspection passes' : '') + '.</span></label>';
  }
  function doneStep() {
    var r = F.res || {};
    return '<div class="fl-done"><div class="okc"><svg viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="24" fill="none" stroke="currentColor" stroke-width="3"/><path d="M15 27l7 7 15-15" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg></div><h2>' + esc(r.title) + '</h2><p class="muted">' + esc(r.sub) + '</p></div>' +
      '<div class="res">' + (r.rows || []).map(function (x) { return '<div class="ln"><span class="muted">' + esc(x[0]) + '</span><b class="num">' + x[1] + '</b></div>'; }).join('') + '</div>' +
      (r.trk ? '<div class="trk-big"><span>Tracking number</span><b class="num">' + esc(r.trk) + '</b><div class="row"><button class="btn btn-soft btn-sm" data-fl="copy" data-v="' + esc(r.trk) + '">' + ic('copy', 15) + ' Copy</button><a class="btn btn-ink btn-sm" href="#track" data-trk="' + esc(r.trk) + '">' + ic('pin', 15) + ' Track now</a></div></div>' : '') +
      (r.next ? '<div class="stack" style="--g:8px"><b>What happens next</b>' + r.next.map(function (n, i) { return '<div class="row" style="flex-wrap:nowrap;align-items:flex-start"><span class="ava" style="width:26px;height:26px;font-size:12px">' + (i + 1) + '</span><span>' + esc(n) + '</span></div>'; }).join('') + '</div>' : '') +
      '<div class="row">' + (r.btns || []).map(function (b, i) { return '<a class="btn ' + (i ? 'btn-line' : 'btn-red') + '" href="' + b[1] + '"' + (b[2] ? ' data-trk="' + esc(b[2]) + '"' : '') + '>' + b[0] + '</a>'; }).join('') + '</div>';
  }
  var STEP = {
    'checkout:Review': function () { return '<h2 class="fl-h">Review your order</h2>' + F.d.items.map(function (it, i) { var p = A.P(it.p), u = it.sample ? A.rmOf(p.t[0][1]) + 28 : A.rmOf(A.unit(p, it.q)); return '<div class="lrow" style="padding:10px 0"><span class="th">' + A.art(p, it.col) + '</span><div class="mid"><b>' + esc(p.n) + '</b><span class="sample">' + E.FACT[p.f].n + ' · ' + (it.sample ? 'Sample, 1 pc' : fmt(it.q, 0) + ' pcs · ' + A.cny(A.unit(p, it.q)) + ' /pc') + '</span></div><div class="end"><b class="num">' + money(it.sample ? u : u * it.q) + '</b></div></div>'; }).join('') + '<div class="stack" style="--g:8px"><b>Inspection in Guangzhou</b>' + radio('insp', 'photo', F.d.insp, 'Photo check', 'RM 5 per carton') + radio('insp', 'std', F.d.insp, 'Standard quality check', '1.5% of goods · recommended') + radio('insp', 'full', F.d.insp, 'Full count and quality', '3% of goods') + '</div>'; },
    'checkout:Delivery': function () { var a = 0, s = 0; F.d.items.forEach(function (it) { if (it.sample) return; var p = A.P(it.p); a += A.landed(p, it.q, F.d.dest, 'air', F.d.insp).ship; s += A.landed(p, it.q, F.d.dest, 'sea', F.d.insp).ship; }); return '<h2 class="fl-h">Where should we deliver?</h2>' + addrForm() + (a ? modeOpts(a, s) : ''); },
    'ship:Parcels': function () { var ps = S().parcels.filter(function (x) { return F.d.ids.indexOf(x.id) > -1; }); lines(); var m = F.d._m; return '<h2 class="fl-h">Parcels to ship</h2><div class="field"><label for="sh-name">Name this shipment</label><input id="sh-name" data-fd="sname" value="' + esc(F.d.sname || '') + '" maxlength="60"><small class="sample">Default comes from Settings · Shipping & naming</small></div><p class="sample">Only the parcels below will ship. Everything else stays in your bay.</p>' + ps.map(function (x) { return '<div class="lrow" style="padding:10px 0"><span class="box-ic"><svg viewBox="0 0 40 40" aria-hidden="true"><rect x="4" y="10" width="32" height="24" rx="3" fill="#C58B4A"/><path d="M4 17h32M20 10v24" stroke="#8E5F2C" stroke-width="2"/></svg></span><div class="mid"><b>' + esc(x.n) + '</b><span class="sample num">' + x.id + ' · ' + x.ctn + ' ctn · ' + fmt(x.kg, 1) + ' kg</span></div></div>'; }).join('') + '<div class="res"><div class="ln"><span class="muted">Total weight</span><b class="num">' + fmt(m.kg, 1) + ' kg</b></div><div class="ln"><span class="muted">Volume</span><b class="num">' + fmt(m.cbm, 3) + ' CBM</b></div></div><div class="stack" style="--g:8px"><b>Extras</b><label class="opt' + (F.d.consol ? ' on' : '') + '"><input type="checkbox" data-fx2="consol"' + (F.d.consol ? ' checked' : '') + '><span class="opt-tx"><b>Repack and consolidate</b><small>Merge into fewer cartons, about 22% less volume · RM 3 per carton</small></span></label><label class="opt' + (F.d.insure ? ' on' : '') + '"><input type="checkbox" data-fx2="insure"' + (F.d.insure ? ' checked' : '') + '><span class="opt-tx"><b>Shipping insurance</b><small>1% of goods value · covers loss and damage</small></span></label></div>'; },
    'ship:Delivery': function () { var sv = F.d.mode; F.d.mode = 'air'; var a = lines().L[0][1]; F.d.mode = 'sea'; var s = lines().L[0][1]; F.d.mode = sv; return '<h2 class="fl-h">Where should we deliver?</h2>' + addrForm() + modeOpts(a, s); },
    'topup:Amount': function () { return '<h2 class="fl-h">How much do you want to add?</h2><div class="field"><label for="tu">Amount (MYR)</label><input id="tu" class="big-in num" inputmode="decimal" value="' + F.d.amt + '" data-fd="amt"></div><div class="chips">' + [500, 1000, 5000, 20000, 100000].map(function (v) { return '<button type="button" class="chip" data-fl="amt" data-v="' + v + '" aria-pressed="' + (F.d.amt === v) + '">RM ' + fmt(v, 0) + '</button>'; }).join('') + '</div><span class="sample">Balance now ' + money(S().wallet) + '. Large top-ups need a verified business account.</span>'; },
    'paysup:Amount': function () { var d = F.d; return '<h2 class="fl-h">How much do you want to send?</h2><div class="field"><label for="ps-a">You pay (MYR)</label><input id="ps-a" class="big-in num" inputmode="decimal" value="' + d.amt + '" data-fd="amt"></div><div class="res"><span class="sample">Supplier receives</span><b class="num" style="font:900 28px var(--display);color:var(--blue)" id="ps-out">¥' + fmt(d.amt * .995 * E.MYR_CNY, 2) + '</b><div class="ln"><span class="muted">Rate</span><b class="num">1 MYR = ¥' + E.MYR_CNY + '</b></div><div class="ln"><span class="muted">Fee 0.5%</span><b class="num">RM ' + fmt(d.amt * .005, 2) + '</b></div></div><div class="lock">' + ic('lock', 16) + ' Rate locked for 10 minutes</div><label class="opt' + (d.escrow ? ' on' : '') + '"><input type="checkbox" data-fx2="escrow"' + (d.escrow ? ' checked' : '') + '><span class="opt-tx"><b>Hold in escrow</b><small>Release to the supplier only after our inspection passes</small></span></label>'; },
    'paysup:Supplier': function () { var d = F.d, sv = ['Alipay · 义乌丝路纺织', 'WeChat Pay · 深圳壳工坊', 'Bank · 永康钢器有限公司 (ICBC)']; return '<h2 class="fl-h">Who are you paying?</h2><div class="stack" style="--g:8px">' + sv.map(function (x) { return radio('sup', x, d.sup, x, 'Saved supplier'); }).join('') + radio('sup', 'New', d.newsup ? 'New' : d.sup, 'New supplier', 'Add Alipay, WeChat Pay or a Chinese bank account') + '</div>' + (d.newsup || d.sup === 'New' ? '<div class="f2"><div class="field"><label for="ns-n">Supplier name</label><input id="ns-n" data-fd="nsn" value="' + esc(d.nsn || '') + '"></div><div class="field"><label for="ns-a">Alipay ID, WeChat ID or bank account</label><input id="ns-a" data-fd="acct" value="' + esc(d.acct || '') + '"></div></div>' : '') + '<div class="field"><label for="ps-inv">Invoice or order number</label><input id="ps-inv" data-fd="inv" value="' + esc(d.inv || '') + '" placeholder="e.g. 1688 order 239847"></div>'; },
    'join:Pieces': function () { var g = A.G(F.d.g), p = A.P(g.p), best = g.ladder[g.ladder.length - 1][1]; return '<h2 class="fl-h">How many pieces do you want?</h2><div class="lrow" style="padding:0;border:0"><span class="th">' + A.art(p) + '</span><div class="mid"><b>' + esc(p.n) + '</b><span class="sample">' + fmt(g.got, 0) + ' of ' + fmt(g.goal, 0) + ' pcs · ends in <span class="num" data-end="' + g.ends + '">--</span></span></div></div><div class="field"><label for="jq">Your pieces</label><input id="jq" class="big-in num" inputmode="numeric" value="' + F.d.q + '" data-fd="q"></div><div class="res"><div class="ln"><span class="muted">Price if the deal completes</span><b class="num">' + A.cny(best) + ' /pc</b></div><div class="ln"><span class="muted">Deposit now</span><b class="num">30%</b></div><div class="ln"><span class="muted">If the deal fails</span><b>Full refund</b></div></div>'; },
    'newgroup:Product': function () { return '<h2 class="fl-h">Which product?</h2><div class="pick">' + E.PROD.map(function (p) { return '<button type="button" class="pick-i' + (F.d.p === p.id ? ' on' : '') + '" data-fl="pick" data-p="' + p.id + '"><span class="th">' + A.art(p) + '</span><span>' + esc(p.n.split(',')[0]) + '</span></button>'; }).join('') + '</div>'; },
    'newgroup:Deal': function () { var p = A.P(F.d.p), tg = p.t[p.t.length - 1]; return '<h2 class="fl-h">Set up your deal</h2><div class="res"><div class="ln"><span class="muted">Target</span><b class="num">' + fmt(tg[0], 0) + ' pcs</b></div><div class="ln"><span class="muted">Price at target</span><b class="num">' + A.cny(tg[1]) + ' /pc</b></div><div class="ln"><span class="muted">Price today</span><b class="num">' + A.cny(p.t[0][1]) + ' /pc</b></div></div><div class="field"><label for="ng-q">Your own pieces</label><input id="ng-q" class="big-in num" inputmode="numeric" value="' + F.d.q + '" data-fd="q"></div><div class="stack" style="--g:8px"><b>Deadline</b>' + [3, 7, 14].map(function (x) { return radio('days', String(x), String(F.d.days), x + ' days', x === 7 ? 'Recommended' : ''); }).join('') + '</div>'; },
    'inspect:Inspection': function () { var pc = S().parcels.filter(function (x) { return x.id === F.d.id; })[0]; return '<h2 class="fl-h">What should we check in ' + pc.id + '?</h2>' + radio('type', 'photo', F.d.type, 'Photo check', '5–10 photos per carton · RM 5 per carton') + radio('type', 'video', F.d.type, 'Video check', 'Unboxing video · RM 12 per carton') + radio('type', 'count', F.d.type, 'Count every piece', 'RM 8 per 100 pcs') + radio('type', 'quality', F.d.type, 'Quality check', 'Defects, size, colour and function · 1.5% of value'); },
    Payment: payStep, Confirm: confirmStep, Done: doneStep
  };

  /* ---------- validation + execution ---------- */
  function valid() {
    var d = F.d, st = DEF[F.kind].steps[F.step], m = lines().t;
    if (st === 'Delivery') { var a = d.addr; if (!a.name || !a.phone || !a.line || !a.city || !a.post) return 'Fill in the full delivery address.'; }
    if (st === 'Amount' && !(d.amt > 0)) return 'Enter an amount.';
    if (st === 'Pieces' || st === 'Deal') { var p = F.kind === 'join' ? A.P(A.G(d.g).p) : A.P(d.p); if (!(d.q >= p.t[0][0])) return 'Minimum is ' + fmt(p.t[0][0], 0) + ' pieces.'; }
    if (st === 'Supplier' && (d.sup === 'New' || d.newsup) && (!d.nsn || !d.acct)) return 'Add the supplier name and account.';
    if (st === 'Payment') { if (d.method === 'wallet' && S().wallet < m) return 'Your wallet is short. Top up or choose another way to pay.'; if (d.method === 'fpx' && !d.bank) return 'Choose your bank.'; if (d.method === 'credit' && S().credit.limit - S().credit.used < m) return 'Not enough credit.'; if (d.method === 'card' && d.card.no.replace(/\D/g, '').length < 15) return 'Enter the card number.'; }
    if (st === 'Confirm') { if (!d.agree) return 'Tick the box to agree to the terms.'; if ((d.method === 'wallet' || d.method === 'credit') && !/^\d{6}$/.test(d.pin)) return 'Enter your 6-digit PIN.'; }
    return '';
  }
  function next() {
    var err = valid(), el = $('#fl-err'); if (err) { if (el) { el.textContent = err; el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); } return; }
    var steps = DEF[F.kind].steps;
    if (steps[F.step] === 'Confirm') { authorise(); return; }
    F.step++; A.route(); toStep();
  }
  function toStep() { var st = document.querySelector('.fl-steps'); if (!st) return; var r = st.getBoundingClientRect(), hb = (document.querySelector('.hdr') || { getBoundingClientRect: function () { return { bottom: 0 }; } }).getBoundingClientRect().bottom; if (r.top < hb || r.top > innerHeight * .5) window.scrollTo({ top: Math.max(0, r.top + scrollY - hb - 10), behavior: 'smooth' }); }
  function authorise() {
    var d = F.d;
    if (d.method === 'fpx') return overlay('<div class="bankpg"><b>' + esc(d.bank) + '</b><span class="sample">Secure online banking · test mode</span><div class="spin"></div><span>Waiting for your approval…</span></div>', 1600, execute);
    if (d.method === 'duitnow') return overlay('<div class="bankpg"><b>DuitNow QR</b><span class="sample">Scan with your banking app · test mode</span>' + qr() + '<b class="num">' + money(lines().t) + '</b><button class="btn btn-red" data-fl="qrpaid">I have paid</button></div>', 0, null);
    if (d.method === 'card') return overlay('<div class="bankpg"><b>Verify your card</b><span class="sample">Your bank sent a code to your phone · test mode: any 6 digits</span><input id="otp" class="pin num" inputmode="numeric" maxlength="6" placeholder="••••••" aria-label="One-time code"><button class="btn btn-red" data-fl="otp">Verify</button><span class="fl-err" id="otp-err"></span></div>', 0, null);
    overlay('<div class="bankpg"><div class="spin"></div><span>Processing payment…</span></div>', 900, execute);
  }
  function qr() { var c = ''; for (var y = 0; y < 21; y++) for (var x = 0; x < 21; x++) { var fin = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13); var on = fin ? ((x % 20 === 0 || x % 20 === 6 || y % 20 === 0 || y % 20 === 6 || x === 14 || x === 20 || y === 14 || y === 20) || ((x % 14 >= 2 && x % 14 <= 4) && (y % 14 >= 2 && y % 14 <= 4))) : ((x * 7 + y * 13 + x * y) % 3 === 0); if (on) c += '<rect x="' + x + '" y="' + y + '" width="1" height="1"/>'; } return '<svg class="qr" viewBox="-1 -1 23 23" aria-label="DuitNow QR code (sample)"><rect x="-1" y="-1" width="23" height="23" fill="#fff"/><g fill="#16181C">' + c + '</g></svg>'; }
  function overlay(html, ms, then) { closeOverlay(); var o = document.createElement('div'); o.className = 'payov'; o.innerHTML = '<div class="payov-c">' + html + '</div>'; document.body.appendChild(o); if (ms) setTimeout(function () { closeOverlay(); then && then(); }, ms); var f = o.querySelector('input'); if (f) f.focus(); }
  function closeOverlay() { var o = $('.payov'); if (o) o.remove(); }
  function charge(total, label) {
    var s = S(), d = F.d, ref = payRef();
    if (d.method === 'wallet') { s.wallet -= total; A.ledger(label, -total, F.kind === 'checkout' || F.kind === 'join' || F.kind === 'newgroup' || (F.kind === 'paysup' && d.escrow) ? 'escrow' : 'out'); }
    else if (d.method === 'credit') { s.credit.used += total; A.ledger(label + ' · EZI Credit', 0, 'out'); }
    else A.ledger(label + ' · paid by ' + METHODS[d.method].n + (d.bank ? ' (' + d.bank + ')' : ''), 0, 'out');
    return ref;
  }
  function execute() {
    var s = S(), d = F.d, m = lines(), t = m.t, R = { rows: [] }, how = METHODS[d.method].n + (d.bank ? ' · ' + d.bank : '');
    if (F.kind === 'checkout') {
      var ids = [], trk = rid('EZ-S-', 4);
      d.items.forEach(function (it) { var p = A.P(it.p), x = it._x, id = rid('EZO-', 4); ids.push(id); s.orders.push({ id: id, p: p.id, q: it.q, unit: it.sample ? A.rmOf(p.t[0][1]) + 28 : x.u, total: +(it.sample ? A.rmOf(p.t[0][1]) + 28 : x.tot).toFixed(2), step: 0, at: Date.now(), dest: d.dest, mode: d.mode, insp: d.insp, trk: trk, sample: !!it.sample }); });
      var ref = charge(t, 'Escrow · ' + ids.join(', ')); s.escrow += t;
      if (d.fromCart) s.cart = [];
      s.addr = d.addr; if (d.addrId === 'new' && d.saveAddr && s.addrs) s.addrs.push({ id: 'a' + Date.now(), label: d.addr.city || 'New address', name: d.addr.name, phone: d.addr.phone, line: d.addr.line, city: d.addr.city, post: d.addr.post, state: d.addr.state, dest: d.dest, def: false }); A.note('Order ' + ids.join(', ') + ' paid into escrow', 'orders');
      R = { title: 'Payment successful', sub: 'Your money is held in escrow. The factory is paid only after our inspection passes.', trk: trk, rows: [['Order' + (ids.length > 1 ? 's' : ''), ids.join(', ')], ['Paid', money(t)], ['Pay with', esc(how)], ['Payment reference', ref]], next: ['The factory confirms and starts production.', 'Goods arrive at our Guangzhou warehouse and are inspected.', 'We ship to ' + d.addr.city + ' and send you every tracking update.'], btns: [['View order', '#o-' + ids[0]], ['Continue shopping', '#shop-all']] };
    } else if (F.kind === 'ship') {
      var trk2 = rid('EZ-S-', 4), D = dest(d.dest);
      var ref2 = charge(t, 'Shipping · ' + trk2);
      s.shipments = s.shipments || []; s.shipments.unshift({ id: trk2, name: d.sname || 'Shipment', ids: d.ids.slice(), mode: d.mode, dest: d.dest, at: Date.now(), to: d.addr.label || d.addr.city });
      s.parcels.forEach(function (x) { if (d.ids.indexOf(x.id) > -1) { x.st = 'shipped'; x.trk = trk2; x.sname = d.sname; x.progress = .04; x.mode = d.mode === 'air' ? 'Air express' : 'Sea LCL'; x.eta = Date.now() + (d.mode === 'air' ? 6 : 18) * 864e5; } });
      s.addr = d.addr; if (d.addrId === 'new' && d.saveAddr && s.addrs) s.addrs.push({ id: 'a' + Date.now(), label: d.addr.city || 'New address', name: d.addr.name, phone: d.addr.phone, line: d.addr.line, city: d.addr.city, post: d.addr.post, state: d.addr.state, dest: d.dest, def: false }); A.note('Shipment ' + trk2 + ' booked · ' + d.ids.length + ' parcels', 'track');
      R = { title: 'Shipment booked', sub: (d.mode === 'air' ? 'Air express, ' + D.ad : 'Sea LCL, ' + D.sd) + ' days to ' + D.n + '.', trk: trk2, rows: [['Shipment name', esc(d.sname || '—')], ['Parcels', d.ids.join(', ')], ['Paid', money(t)], ['Pay with', esc(how)], ['Reference', ref2]], next: ['We pack and label your parcels today.', (d.mode === 'air' ? 'They fly on the next flight from Guangzhou.' : 'They are loaded on the next sea container.'), 'Customs clearance, then delivery to your door.'], btns: [['Track shipment', '#track', trk2], ['Back to my warehouse', '#ship']] };
    } else if (F.kind === 'topup') {
      var ref3 = payRef(); s.wallet += d.amt; A.ledger('Top-up · ' + how, d.amt, 'in'); A.note('Top-up ' + money(d.amt) + ' received', 'wallet');
      R = { title: 'Top-up received', sub: 'Your wallet is ready to use.', rows: [['Added', money(d.amt)], ['New balance', money(s.wallet)], ['Paid with', esc(how)], ['Reference', ref3]], btns: [['Go to wallet', '#wallet'], ['Shop products', '#shop-all']] };
    } else if (F.kind === 'paysup') {
      var sup = d.sup === 'New' || d.newsup ? d.nsn : d.sup, ref4 = charge(t, 'Supplier payment ¥' + fmt(d.amt * .995 * E.MYR_CNY, 2) + ' · ' + sup + (d.escrow ? ' (escrow)' : '')); if (d.escrow) s.escrow += t;
      A.note('Supplier payment ¥' + fmt(d.amt * .995 * E.MYR_CNY, 2) + (d.escrow ? ' held in escrow' : ' sent'), 'wallet');
      R = { title: d.escrow ? 'Payment held in escrow' : 'Supplier paid', sub: d.escrow ? 'We release it to the supplier after our inspection passes.' : 'The supplier receives the yuan today.', rows: [['Supplier', esc(sup)], ['Supplier receives', '¥' + fmt(d.amt * .995 * E.MYR_CNY, 2)], ['You paid', money(t)], ['Invoice', esc(d.inv || '—')], ['Reference', ref4]], btns: [['Go to wallet', '#wallet'], ['Home', '#home']] };
    } else if (F.kind === 'join') {
      var g = A.G(d.g), ref5 = charge(t, 'Group deposit · ' + A.P(g.p).n.split(',')[0]); s.escrow += t; g.got += d.q; g.shops++; s.joined = s.joined || []; s.joined.push({ g: g.id, q: d.q, dep: t });
      A.note('You joined a group deal with ' + fmt(d.q, 0) + ' pcs', 'me');
      R = { title: 'You joined the deal', sub: 'Deposit held in escrow. If the deal fails, you get it all back.', rows: [['Your pieces', fmt(d.q, 0)], ['Deposit', money(t)], ['Deal progress', fmt(g.got, 0) + ' / ' + fmt(g.goal, 0) + ' pcs'], ['Reference', ref5]], btns: [['See the deal', '#p-' + g.p], ['My account', '#me']] };
    } else if (F.kind === 'newgroup') {
      var p = A.P(d.p), tg = p.t[p.t.length - 1], ng = { id: 'g' + (E.GROUP.length + 1) + rid('', 2), p: p.id, ladder: p.t.slice(1).map(function (x) { return [x[0], x[1]]; }), got: d.q, goal: tg[0], ends: Date.now() + d.days * 864e5, shops: 1, mine: true };
      E.GROUP.unshift(ng); var ref6 = charge(t, 'Group deal deposit · ' + p.n.split(',')[0]); s.escrow += t; s.myGroups = s.myGroups || []; s.myGroups.push({ g: ng.id, p: p.id, q: d.q, goal: tg[0], ends: ng.ends, dep: t });
      A.note('Your group deal for ' + p.n.split(',')[0] + ' is live', 'me');
      R = { title: 'Your group deal is live', sub: 'Other shops can now join. Share it with shops you know.', rows: [['Product', esc(p.n.split(',')[0])], ['Target', fmt(tg[0], 0) + ' pcs at ' + A.cny(tg[1])], ['Your pieces', fmt(d.q, 0)], ['Ends', new Date(ng.ends).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })], ['Reference', ref6]], btns: [['See all deals', '#group'], ['My account', '#me']] };
    } else if (F.kind === 'inspect') {
      var ref7 = charge(t, 'Inspection · ' + d.id); A.note('Inspection requested for ' + d.id, 'ship');
      R = { title: 'Inspection booked', sub: 'You get the report and photos within 24 hours.', rows: [['Parcel', d.id], ['Paid', money(t)], ['Reference', ref7]], btns: [['Back to my warehouse', '#ship']] };
    }
    A.save(); A.badges(); F.res = R; F.step = DEF[F.kind].steps.length - 1; A.route();
    A.toast(R.title, true);
  }

  /* ---------- events ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-fl]'); if (!t) { var tr = e.target.closest('[data-trk]'); if (tr) { TRK = tr.getAttribute('data-trk'); } return; }
    var a = t.getAttribute('data-fl');
    if (a === 'next') next();
    else if (a === 'back') { F.step = Math.max(0, F.step - 1); A.route(); toStep(); }
    else if (a === 'cancel') { var done = F && F.step === DEF[F.kind].steps.length - 1; F = null; if (!done) A.toast('Cancelled. Nothing was charged.'); }
    else if (a === 'bank') { F.d.bank = t.getAttribute('data-b'); A.route(); }
    else if (a === 'amt') { F.d.amt = +t.getAttribute('data-v'); A.route(); }
    else if (a === 'pick') { F.d.p = t.getAttribute('data-p'); var p = A.P(F.d.p); F.d.q = Math.max(p.t[0][0], F.d.q); A.route(); }
    else if (a === 'quicktop') { var v = +t.getAttribute('data-v'); S().wallet += v; A.ledger('Top-up · FPX', v, 'in'); A.save(); A.badges(); A.toast('Top-up ' + money(v) + ' received', true); A.route(); }
    else if (a === 'qrpaid') { closeOverlay(); overlay('<div class="bankpg"><div class="spin"></div><span>Confirming with DuitNow…</span></div>', 1100, execute); }
    else if (a === 'otp') { var o = $('#otp'); if (!/^\d{6}$/.test(o.value)) { $('#otp-err').textContent = 'Enter the 6-digit code.'; return; } closeOverlay(); overlay('<div class="bankpg"><div class="spin"></div><span>Approving with your bank…</span></div>', 1000, execute); }
    else if (a === 'copy') { var val = t.getAttribute('data-v'); try { navigator.clipboard.writeText(val).then(function () { A.toast('Copied ' + val, true); }, function () { A.toast(val); }); } catch (x) { A.toast(val); } }
  });
  function onField(e) {
    if (!F || A.view() !== 'pay') return; var t = e.target, d = F.d;
    if (t.hasAttribute('data-addrpick')) { d.addrId = t.value; if (t.value !== 'new') { var ax = S().addrs.filter(function (x) { return x.id === t.value; })[0]; d.addr = JSON.parse(JSON.stringify(ax)); d.dest = ax.dest || d.dest; } else { d.addr = { name: (S().prof || {}).name || S().name, phone: (S().prof || {}).phone || '', line: '', city: '', post: '', state: '' }; } A.route(); return; }
    if (t.id === 'save-addr') { d.saveAddr = t.checked; return; }
    if (t.hasAttribute('data-fa')) d.addr[t.getAttribute('data-fa')] = t.value;
    else if (t.hasAttribute('data-fc')) d.card[t.getAttribute('data-fc')] = t.value;
    else if (t.hasAttribute('data-fd')) { var k = t.getAttribute('data-fd'); d[k] = /amt|q/.test(k) ? parseFloat(String(t.value).replace(/[^0-9.]/g, '')) || 0 : t.value; if (e.type === 'change' && k === 'dest') A.route(); else refreshSum(); if (k === 'amt' && $('#ps-out')) $('#ps-out').textContent = '¥' + fmt(d.amt * .995 * E.MYR_CNY, 2); }
    else if (t.hasAttribute('data-fr')) { var n = t.getAttribute('data-fr'); if (n === 'sup') { d.sup = t.value; d.newsup = t.value === 'New'; } else if (n === 'days') d.days = +t.value; else d[n] = t.value; A.route(); }
    else if (t.hasAttribute('data-fx2')) { d[t.getAttribute('data-fx2')] = t.checked; A.route(); }
    else if (t.id === 'agree') d.agree = t.checked;
    else if (t.id === 'pin') { t.value = t.value.replace(/\D/g, '').slice(0, 6); d.pin = t.value; }
    if (e.type === 'input' && $('#fl-err')) $('#fl-err').textContent = '';
  }
  function refreshSum() { var box = $('.fl-sum'); if (!box) return; var m = lines(); box.innerHTML = '<b>Summary</b>' + m.L.map(function (l) { return '<div class="ln"><span class="muted">' + esc(l[0]) + '</span><b class="num">' + money(l[1]) + '</b></div>'; }).join('') + '<div class="ln tot"><span>Total</span><b class="num">' + money(m.t) + '</b></div><span class="sample">Test mode. No real money moves.</span>'; var nb = $('#fl-next'); if (nb && /^Pay /.test(nb.textContent)) nb.textContent = 'Pay ' + money(m.t); }
  document.addEventListener('input', onField); document.addEventListener('change', onField);
  document.addEventListener('keydown', function (e) { if (e.key === 'Enter' && A.view() === 'pay' && e.target.tagName === 'INPUT' && e.target.type !== 'checkbox') { e.preventDefault(); if ($('.payov #otp')) $('[data-fl="otp"]').click(); else next(); } });

  /* ---------- account page ---------- */
  function me() {
    var s = S(), a = s.addr || { name: s.name, phone: '012-345 6789', line: 'No. 12, Jalan Kenari 5, Seksyen 7', city: 'Shah Alam', post: '40000', state: 'Selangor' };
    var trks = allTracking();
    var mine = (s.myGroups || []).map(function (x) { var g = A.G(x.g); return g ? '<a class="lrow" href="#p-' + g.p + '" style="text-decoration:none"><span class="th">' + A.art(A.P(g.p)) + '</span><div class="mid"><b>' + esc(A.P(g.p).n.split(',')[0]) + ' <span class="pill red">Started by you</span></b><div class="bar"><i style="width:' + Math.min(100, g.got / g.goal * 100).toFixed(1) + '%"></i></div><span class="sample">' + fmt(g.got, 0) + ' / ' + fmt(g.goal, 0) + ' pcs · ends in <span class="num" data-end="' + g.ends + '">--</span></span></div></a>' : ''; }).join('') +
      (s.joined || []).map(function (x) { var g = A.G(x.g); return g ? '<a class="lrow" href="#p-' + g.p + '" style="text-decoration:none"><span class="th">' + A.art(A.P(g.p)) + '</span><div class="mid"><b>' + esc(A.P(g.p).n.split(',')[0]) + ' <span class="pill">Joined · ' + fmt(x.q, 0) + ' pcs</span></b><div class="bar"><i style="width:' + Math.min(100, g.got / g.goal * 100).toFixed(1) + '%"></i></div><span class="sample">Deposit ' + money(x.dep) + ' in escrow</span></div></a>' : ''; }).join('');
    return '<div class="view"><div class="acc-top card pad"><span class="ava" style="width:64px;height:64px;font-size:22px">AT</span><div style="flex:1;min-width:200px"><h1 style="font-size:26px">' + esc(s.name) + '</h1><div class="row" style="gap:6px;margin-top:6px"><span class="pill ink num">' + s.code + '</span><span class="pill good">' + ic('check', 12) + ' Verified business</span><span class="pill gold">Lifetime member</span></div></div><div class="row"><a class="btn btn-line btn-sm" href="' + 'https://claude.ai/artifact/DywuA2UCygAnmrzqNkFJDx' + '" target="_blank" rel="noopener">Open the app</a><a class="btn btn-red btn-sm" href="#settings">' + ic('layers', 15) + ' Settings</a></div></div>' +
      '<div class="acc-g">' +
      '<section class="card pad stack"><div class="between"><b>Money</b><a href="#wallet" class="sample">Wallet →</a></div><div class="acct-k" style="grid-template-columns:1fr 1fr"><a href="#wallet"><span>Wallet</span><b class="num" data-live="bal">' + money(s.wallet) + '</b></a><a href="#orders"><span>In escrow</span><b class="num">' + money(s.escrow) + '</b></a><a href="#credit"><span>Credit available</span><b class="num">' + money(s.credit.limit - s.credit.used, 0) + '</b></a><a href="#credit"><span>Credit score</span><b class="num">' + s.credit.score + '</b></a></div><div class="row"><button class="btn btn-red btn-sm" data-act="topup">' + ic('plus', 15) + ' Top up</button><a class="btn btn-line btn-sm" href="#wallet">Pay a supplier</a></div></section>' +
      '<section class="card pad stack"><b>China warehouse address</b><div class="addr">广东省广州市白云区太和镇 EZICARGO 国际仓 B2-18<br>收件人: ' + s.code + ' ' + esc(s.name) + '</div><button class="btn btn-soft btn-sm" data-act="copyaddr">' + ic('copy', 15) + ' Copy address</button></section>' +
      '</div>' +
      '<section class="sec card pad stack"><div class="between"><b>My group deals</b><button class="btn btn-red btn-sm" data-act="newgroup">' + ic('plus', 15) + ' Start a group deal</button></div>' + (mine || '<div class="sample">You have not joined or started a group deal yet. Start one and other shops can join to reach factory price.</div>') + '</section>' +
      '<section class="sec card pad stack"><div class="between"><b>My tracking numbers</b><a href="#track" class="sample">Track →</a></div>' + (trks.length ? trks.map(function (x) { return '<a class="lrow trk-row" href="#track" data-trk="' + esc(x.id) + '"><span class="fi">' + ic(x.k === 'order' ? 'lock' : x.k === 'shipment' ? 'truck' : 'box', 18) + '</span><div class="mid"><b class="num">' + esc(x.id) + '</b><span class="sample">' + esc(x.what) + '</span></div><span class="pill ' + x.cls + '">' + esc(x.st) + '</span></a>'; }).join('') : '<div class="sample">No tracking numbers yet.</div>') + '</section>' +
      '<section class="sec acc-links">' + [['#orders', 'lock', 'My orders', s.orders.length + ' orders'], ['#ship', 'box', 'My parcels', s.parcels.length + ' parcels'], ['#credit', 'credit', 'EZI Credit', 'Score ' + s.credit.score], ['#factories', 'factory', 'Factories', 'Verified list']].map(function (x) { return '<a class="svt" href="' + x[0] + '"><span class="svt-ic">' + ic(x[1], 22) + '</span><span class="svt-tx"><b>' + x[2] + '</b><em>' + x[3] + '</em></span><span class="svt-go">' + ic('arrow', 18) + '</span></a>'; }).join('') + '<a class="svt" href="#help" data-act="assist"><span class="svt-ic">' + ic('chat', 22) + '</span><span class="svt-tx"><b>Help and support</b><em>AI assistant, chat and tickets</em></span><span class="svt-go">' + ic('arrow', 18) + '</span></a></section></div>';
  }
  function allTracking() {
    var s = S(), out = [], seen = {};
    s.parcels.forEach(function (x) {
      if (x.st === 'delivered') { out.push({ id: x.trk || x.id, k: 'shipment', what: 'Delivered · ' + x.n, st: 'Delivered', cls: 'good', x: x }); return; }
      if (x.st === 'returning') { out.push({ id: x.id, k: 'shipment', what: 'Return to seller · ' + x.n, st: 'Returning', cls: 'warn', x: x }); return; }
      if (x.st === 'shipped') { var id = x.trk || x.id; if (seen[id]) return; seen[id] = 1; out.push({ id: id, k: 'shipment', what: (x.sname ? x.sname + ' · ' : '') + (x.mode || 'Shipment'), st: 'On the way', cls: 'red', x: x }); }
      else out.push({ id: x.id, k: 'parcel', what: x.n, st: x.st === 'coming' ? 'Coming to warehouse' : 'In warehouse', cls: x.st === 'coming' ? 'blue' : 'good', x: x });
    });
    s.orders.forEach(function (o) { out.push({ id: o.id, k: 'order', what: A.P(o.p).n.split(',')[0] + ' · ' + fmt(o.q, 0) + ' pcs', st: E.ORDER_STEPS[o.step][0], cls: o.step >= 6 ? 'good' : 'red', o: o }); });
    return out;
  }

  /* ---------- track page ---------- */
  var TRK = '';
  function track() {
    var list = allTracking(), cur = TRK || (list.filter(function (x) { return x.k === 'shipment'; })[0] || list[0] || {}).id || '';
    return '<div class="view"><div class="phead"><div><h1>Track</h1><p>Every parcel, shipment and order has a tracking number. Tap one, or type a number.</p></div></div>' +
      '<form class="card pad row" id="trk2" style="align-items:flex-end"><div class="field" style="flex:1 1 240px"><label for="trk-in2">Tracking number</label><input id="trk-in2" class="trk-input num" value="' + esc(cur) + '" autocomplete="off"></div><button class="btn btn-red" type="submit">Track</button></form>' +
      '<div class="chips" style="margin-top:12px">' + list.map(function (x) { return '<button type="button" class="chip num" data-trk2="' + esc(x.id) + '" aria-pressed="' + (x.id === cur) + '">' + esc(x.id) + '</button>'; }).join('') + '</div><div id="trk-out2" style="margin-top:16px">' + result(cur) + '</div></div>';
  }
  function tl(ev) { return '<div class="steps">' + ev.map(function (e, i) { return '<div class="stp ' + (e[2] === 1 ? 'done' : e[2] === 2 ? 'now' : '') + '"><div class="dotc"><span class="dot">' + ic('check', 14) + '</span>' + (i < ev.length - 1 ? '<span class="lnv"></span>' : '') + '</div><div class="tx"><b>' + esc(e[0]) + '</b><span>' + esc(e[1]) + '</span></div></div>'; }).join('') + '</div>'; }
  function day(t) { return new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }); }
  function result(id) {
    id = String(id || '').trim().toUpperCase(); if (!id) return '';
    var s = S(), f = allTracking().filter(function (x) { return x.id.toUpperCase() === id; })[0];
    if (!f) return '<div class="card pad empty"><b>We can’t find ' + esc(id) + '</b><span>Check the number. Parcel numbers start with EZ-P, shipments with EZ-S and orders with EZO.</span></div>';
    var ev, head, pct;
    if (f.k === 'order') { var o = f.o; ev = E.ORDER_STEPS.map(function (x, i) { return [x[0], x[1], i < o.step ? 1 : i === o.step ? 2 : 0]; }); pct = o.step / 6; head = A.P(o.p).n.split(',')[0] + ' · ' + fmt(o.q, 0) + ' pcs' + (o.trk ? ' · shipment ' + o.trk : ''); }
    else if (f.k === 'shipment') { var x = f.x, pr = x.progress || .1, air = /Air/.test(x.mode || ''); pct = pr; head = (x.mode || 'Shipment') + ' · ETA ' + day(x.eta || Date.now() + 5 * 864e5); ev = [['Received at Guangzhou warehouse', 'Weighed and photographed', 1], ['Packed and labelled', 'Ready to leave', 1], [air ? 'Loaded on flight CAN → KUL' : 'Container sealed at Nansha', air ? 'Air express' : 'Sea LCL', pr > .1 ? 1 : 2], [air ? 'In the air' : 'At sea · ' + Math.round(pr * 100) + '% of route', 'On schedule', pr > .1 && pr < .8 ? 2 : pr >= .8 ? 1 : 0], ['Customs clearance', 'Duties included', pr >= .8 ? 2 : 0], ['Out for delivery', 'Courier to your door', 0], ['Delivered', 'Photo and signature', 0]]; }
    else { var p = f.x; pct = p.st === 'coming' ? .1 : .3; head = p.n; ev = [['Declared by you', p.courier || 'Waiting for courier number', 1], ['Arrived at Guangzhou warehouse', p.arr ? day(p.arr) + ' · matched to your code' : 'Waiting for the parcel', p.st === 'coming' ? 2 : 1], ['Weighed and photographed', p.kg ? fmt(p.kg, 1) + ' kg · ' + p.photos + ' photos' : '', p.st === 'coming' ? 0 : 1], ['In storage', p.st === 'stored' ? 'Free for 14 days from arrival' : '', p.st === 'stored' ? 2 : 0], ['Shipped to you', 'Choose air or sea in EZI Ship', 0]]; }
    return '<div class="card pad view"><div class="between"><div><span class="sample">' + (f.k === 'order' ? 'Order' : f.k === 'shipment' ? 'Shipment' : 'Parcel') + '</span><div class="num" style="font:800 22px var(--mono);color:var(--ink)">' + esc(f.id) + '</div>' + (f.k !== 'order' ? '<button class="linkbtn" data-rename="' + (f.k === 'shipment' ? 'ship|' + esc(f.id) : 'parcel|' + esc(f.id)) + '">' + esc(f.k === 'shipment' ? ((f.x && f.x.sname) || 'Name this shipment') : f.x.n) + ' ✎</button>' : '') + '</div><span class="pill ' + f.cls + '">' + esc(f.st) + '</span></div><p class="muted" style="margin:6px 0 12px">' + esc(head) + '</p><div class="bar" style="margin-bottom:16px"><i style="width:' + Math.round(pct * 100) + '%"></i></div>' + tl(ev) + '</div>';
  }
  document.addEventListener('click', function (e) { var c = e.target.closest('[data-trk2]'); if (!c) return; TRK = c.getAttribute('data-trk2'); $('#trk-in2').value = TRK; $$('[data-trk2]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === c)); }); $('#trk-out2').innerHTML = result(TRK); });
  document.addEventListener('submit', function (e) { if (e.target.id !== 'trk2') return; e.preventDefault(); TRK = $('#trk-in2').value; $('#trk-out2').innerHTML = result(TRK); });

  window.EZVIEWS = { pay: view, me: me, track: track };
  window.EZFLOW = { start: start };
  if (/^#(pay|me|track)/.test(location.hash)) A.route();
})();
