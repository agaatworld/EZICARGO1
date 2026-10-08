/* EZICARGO · step-by-step dialogs for every action that should not finish in one click */
(function () {
  'use strict';
  var A = window.EZAPP, E = window.EZ;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var ic = A.ic, esc = A.esc, fmt = A.fmt, S = function () { return A.state(); };
  var money = function (v, d) { return A.money(v, d); };
  window.EZPHOTOS = window.EZPHOTOS || {};
  function rid(p, n) { var s = ''; for (var i = 0; i < (n || 4); i++) s += Math.floor(Math.random() * 10); return p + s; }

  /* ---------- the wizard ---------- */
  var W = null;
  function open(cfg) {
    close(); W = { cfg: cfg, i: 0, d: cfg.data || {}, done: null };
    var sc = document.createElement('div'); sc.className = 'scrim wz-scrim'; var m = document.createElement('div'); m.className = 'modal wz'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-label', cfg.title);
    document.body.appendChild(sc); document.body.appendChild(m); W.el = m; W.sc = sc; sc.onclick = function () { if (!W.done) return; close(); };
    draw();
  }
  function close() { if (W) { W.el.remove(); W.sc.remove(); } W = null; }
  function draw() {
    var c = W.cfg, st = c.steps, m = W.el;
    if (W.done) {
      var r = W.done;
      m.innerHTML = '<div class="wz-done"><div class="okc ' + (r.bad ? 'bad' : '') + '"><svg viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="24" fill="none" stroke="currentColor" stroke-width="3"/>' + (r.bad ? '<path d="M18 18l16 16M34 18L18 34" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>' : '<path d="M15 27l7 7 15-15" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>') + '</svg></div><h3>' + esc(r.title) + '</h3>' + (r.text ? '<p class="muted">' + esc(r.text) + '</p>' : '') + '</div>' +
        (r.rows ? '<div class="res">' + r.rows.map(function (x) { return '<div class="ln"><span class="muted">' + esc(x[0]) + '</span><b class="num">' + x[1] + '</b></div>'; }).join('') + '</div>' : '') +
        (r.next ? '<div class="stack" style="--g:6px"><b>What happens next</b>' + r.next.map(function (n, i) { return '<div class="row" style="flex-wrap:nowrap;align-items:flex-start"><span class="ava" style="width:24px;height:24px;font-size:11px">' + (i + 1) + '</span><span style="font-size:14px">' + esc(n) + '</span></div>'; }).join('') + '</div>' : '') +
        '<button class="btn btn-red btn-block" data-wz="close">Done</button>';
      if (!r.bad) A.toast(r.title, true);
      $('[data-wz="close"]', m).onclick = function () { close(); if (r.after) r.after(); };
      return;
    }
    var s = st[W.i], last = W.i === st.length - 1;
    m.innerHTML = '<div class="between"><div><span class="wz-n">' + esc(c.title) + (st.length > 1 ? ' · step ' + (W.i + 1) + ' of ' + st.length : '') + '</span><h3>' + esc(s.t) + '</h3></div><button class="x" data-wz="x" aria-label="Cancel">×</button></div>' +
      (st.length > 1 ? '<div class="wz-bar">' + st.map(function (_, k) { return '<i class="' + (k < W.i ? 'done' : k === W.i ? 'on' : '') + '"></i>'; }).join('') + '</div>' : '') +
      '<div class="wz-body stack">' + s.r(W.d) + '</div><div class="fl-err" id="wz-err" role="alert"></div>' +
      '<div class="wz-nav">' + (W.i ? '<button class="btn btn-line" data-wz="back">Back</button>' : '<button class="btn btn-line" data-wz="x">Cancel</button>') + '<button class="btn ' + (last && c.danger ? 'btn-ink' : 'btn-red') + '" data-wz="next">' + esc(last ? (c.confirm || 'Confirm') : 'Continue') + '</button></div>';
    $$('[data-wz="x"]', m).forEach(function (b) { b.onclick = close; });
    var bk = $('[data-wz="back"]', m); if (bk) bk.onclick = function () { collect(); W.i--; draw(); };
    $('[data-wz="next"]', m).onclick = next;
    if (s.init) s.init(m, W.d);
    var f = m.querySelector('.wz-body input:not([type=checkbox]):not([type=radio]):not([type=file]),.wz-body select,.wz-body textarea'); if (f) f.focus();
    m.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type !== 'file') { e.preventDefault(); next(); } });
  }
  function collect() { $$('[data-w]', W.el).forEach(function (x) { W.d[x.getAttribute('data-w')] = x.type === 'checkbox' ? x.checked : x.type === 'radio' ? (x.checked ? x.value : W.d[x.getAttribute('data-w')]) : x.value; }); }
  function next() {
    collect(); var s = W.cfg.steps[W.i], err = s.v ? s.v(W.d) : '';
    if (err) { var e = $('#wz-err', W.el); e.textContent = err; e.classList.remove('shake'); void e.offsetWidth; e.classList.add('shake'); return; }
    if (W.i < W.cfg.steps.length - 1) { W.i++; draw(); return; }
    if (W.cfg.info) { close(); return; }
    var btn = $('[data-wz="next"]', W.el); btn.disabled = true; btn.innerHTML = '<span class="spin" style="width:18px;height:18px;border-width:3px"></span>';
    setTimeout(function () { if (!W) return; W.done = W.cfg.done(W.d) || { title: 'Done' }; A.save(); A.badges(); draw(); }, 650);
  }
  function review(rows) { return '<div class="res">' + rows.map(function (x) { return '<div class="ln"><span class="muted">' + esc(x[0]) + '</span><b>' + esc(x[1]) + '</b></div>'; }).join('') + '</div>'; }
  function f(label, key, val, attrs) { return '<div class="field"><label>' + label + '</label><input data-w="' + key + '" value="' + esc(val == null ? '' : val) + '" ' + (attrs || '') + '></div>'; }
  function ta(label, key, val, ph) { return '<div class="field"><label>' + label + '</label><textarea data-w="' + key + '" placeholder="' + esc(ph || '') + '">' + esc(val || '') + '</textarea></div>'; }
  function radios(key, cur, opts) { return '<div class="stack" style="--g:8px">' + opts.map(function (o) { return '<label class="opt' + (cur === o[0] ? ' on' : '') + '"><input type="radio" name="' + key + '" data-w="' + key + '" value="' + o[0] + '"' + (cur === o[0] ? ' checked' : '') + '><span class="opt-tx"><b>' + o[1] + '</b>' + (o[2] ? '<small>' + o[2] + '</small>' : '') + '</span></label>'; }).join('') + '</div>'; }
  function pinStep(t) { return { t: t || 'Confirm with your EZI PIN', r: function (d) { return '<div class="field"><label>6-digit EZI PIN</label><input class="pin num" data-w="pin" inputmode="numeric" maxlength="6" placeholder="••••••" value="' + esc(d.pin || '') + '"><small class="sample">Test mode: any 6 digits.</small></div>'; }, v: function (d) { return /^\d{6}$/.test(d.pin || '') ? '' : 'Enter your 6-digit PIN.'; } }; }
  function otpStep() { return { t: 'Enter the code we sent', r: function (d) { return '<p class="muted">We sent a 6-digit code by SMS to ' + esc((S().prof || {}).phone || 'your phone') + '.</p><div class="field"><label>One-time code</label><input class="pin num" data-w="otp" inputmode="numeric" maxlength="6" placeholder="••••••"><small class="sample">Test mode: any 6 digits.</small></div>'; }, v: function (d) { return /^\d{6}$/.test(d.otp || '') ? '' : 'Enter the 6-digit code.'; } }; }
  function photoStep(key, label, min) {
    return { t: label || 'Add photos', r: function (d) { var L = d[key] || []; return '<label class="wz-drop">' + ic('cam', 26) + '<b>Tap to add photos</b><small>JPG or PNG · up to 8</small><input type="file" accept="image/*" multiple hidden data-wphoto="' + key + '"></label><div class="wz-ph">' + L.map(function (s, i) { return '<span class="rv-thumb"><img src="' + s + '" alt="Photo ' + (i + 1) + '"><button type="button" data-wprm="' + i + '" aria-label="Remove">×</button></span>'; }).join('') + '</div><span class="sample">' + L.length + ' photo' + (L.length === 1 ? '' : 's') + ' added</span>'; },
      init: function (m, d) {
        var inp = $('[data-wphoto]', m); inp.onchange = function () { var files = Array.prototype.slice.call(inp.files).slice(0, 8 - (d[key] || []).length); Promise.all(files.map(shrink)).then(function (imgs) { d[key] = (d[key] || []).concat(imgs); draw(); }); };
        $$('[data-wprm]', m).forEach(function (b) { b.onclick = function () { d[key].splice(+b.getAttribute('data-wprm'), 1); draw(); }; });
      }, v: function (d) { return (d[key] || []).length >= (min || 1) ? '' : 'Add at least ' + (min || 1) + ' photo.'; } };
  }
  function shrink(file) { return new Promise(function (res, rej) { var fr = new FileReader(); fr.onerror = rej; fr.onload = function () { var img = new Image(); img.onerror = rej; img.onload = function () { var k = Math.min(1, 900 / Math.max(img.width, img.height)), c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', .7)); }; img.src = fr.result; }; fr.readAsDataURL(file); }); }
  /* let the original handler run after the wizard confirms */
  function pass(el) { el.setAttribute('data-wzok', '1'); el.click(); }

  /* ---------- Control centre ---------- */
  function findParcel(id) { var s = S(), p = s.parcels.filter(function (x) { return x.id === id; })[0]; return p; }
  var CTL = {
    photo: function (el) {
      var id = el.getAttribute('data-id');
      open({ title: 'Warehouse photos', confirm: 'Upload photos', steps: [photoStep('imgs', 'Photos of ' + id, 1), { t: 'Check and upload', r: function (d) { return '<div class="wz-ph">' + d.imgs.map(function (s) { return '<span class="rv-thumb"><img src="' + s + '" alt=""></span>'; }).join('') + '</div>' + review([['Parcel', id], ['Photos', String(d.imgs.length)], ['Customer sees them', 'Right away, with an alert']]); } }],
        done: function (d) { EZPHOTOS[id] = (EZPHOTOS[id] || []).concat(d.imgs); var p = findParcel(id); if (p) { p.photos = (p.photos || 0) + d.imgs.length; A.note(d.imgs.length + ' new photos of ' + id, 'ship'); } return { title: 'Photos uploaded', rows: [['Parcel', id], ['Photos', String(d.imgs.length)]], after: A.route }; } });
    },
    recv: function (el) {
      var id = el.getAttribute('data-id'), p = findParcel(id);
      open({ title: 'Receive parcel', confirm: 'Confirm receipt', data: { ctn: p ? p.ctn : 1, kg: '', l: 50, w: 40, h: 30, cond: 'good' }, steps: [
        { t: 'Match the parcel', r: function (d) { return review([['Parcel', id], ['Customer', p ? S().name : 'Customer'], ['Declared', p ? p.n : 'Parcel'], ['Courier', (p && p.courier) || '—']]) + f('Cartons received', 'ctn', d.ctn, 'inputmode="numeric"') + radios('cond', d.cond, [['good', 'Good condition'], ['damaged', 'Damaged outer box', 'We photograph the damage'], ['short', 'Fewer cartons than declared']]); }, v: function (d) { return +d.ctn > 0 ? '' : 'Enter the number of cartons.'; } },
        { t: 'Weigh and measure', r: function (d) { return f('Total weight (kg)', 'kg', d.kg, 'inputmode="decimal" placeholder="e.g. 18.4"') + '<div class="f3">' + f('L cm', 'l', d.l, 'inputmode="numeric"') + f('W cm', 'w', d.w, 'inputmode="numeric"') + f('H cm', 'h', d.h, 'inputmode="numeric"') + '</div>'; }, v: function (d) { return +d.kg > 0 ? '' : 'Enter the weight.'; } },
        photoStep('imgs', 'Arrival photos', 1),
        { t: 'Check and confirm', r: function (d) { var cbm = d.l * d.w * d.h / 1e6 * d.ctn; return review([['Parcel', id], ['Cartons', String(d.ctn)], ['Weight', d.kg + ' kg'], ['Volume', fmt(cbm, 3) + ' CBM'], ['Condition', { good: 'Good', damaged: 'Damaged outer box', short: 'Short cartons' }[d.cond]], ['Photos', String((d.imgs || []).length)]]); } }],
        done: function (d) { var kgi = $('[data-kg="' + id + '"]'); if (kgi) kgi.value = d.kg; if (p) { p.ctn = +d.ctn; p.dim = [+d.l, +d.w, +d.h]; } EZPHOTOS[id] = (d.imgs || []).slice(); pass(el); if (p) { p.photos = (d.imgs || []).length; } return { title: 'Parcel received', text: 'The customer was told and can see the photos now.', rows: [['Parcel', id], ['Weight', d.kg + ' kg']], after: A.route }; } });
    },
    adv: function (el) {
      var id = el.getAttribute('data-id'), release = /Release/.test(el.textContent);
      if (!release) { open({ title: 'Move order', confirm: 'Move to next step', steps: [{ t: 'Move ' + id + ' forward?', r: function () { return '<p class="muted">The customer gets an alert for the new step.</p>'; } }], done: function () { pass(el); return { title: id + ' updated' }; } }); return; }
      open({ title: 'Release escrow', confirm: 'Release payment', danger: true, steps: [
        { t: 'Check the inspection', r: function (d) { return review([['Order', id], ['Inspection', 'Passed · report attached'], ['Pieces accepted', 'All']]) + '<label class="agree"><input type="checkbox" data-w="ok"' + (d.ok ? ' checked' : '') + '> <span>I checked the inspection report and photos.</span></label>'; }, v: function (d) { return d.ok ? '' : 'Tick to confirm you checked the report.'; } },
        pinStep('Approve with your staff PIN')],
        done: function () { pass(el); return { title: 'Payment released to the factory', text: 'The money left escrow and the customer was told.', rows: [['Order', id]] }; } });
    },
    refund: function (el) {
      var id = el.getAttribute('data-id');
      open({ title: 'Refund order', confirm: 'Refund now', danger: true, data: { why: 'failed' }, steps: [
        { t: 'Why refund ' + id + '?', r: function (d) { return radios('why', d.why, [['failed', 'Goods failed inspection'], ['cancel', 'Customer cancelled before production'], ['factory', 'Factory could not deliver'], ['other', 'Other reason']]) + ta('Note to the customer', 'note', d.note, 'Optional'); } },
        { t: 'Confirm the refund', r: function () { return '<p class="muted">The full escrow amount goes back to the customer’s EZI Wallet. This cannot be undone.</p>'; } }, pinStep('Approve with your staff PIN')],
        done: function () { pass(el); return { title: 'Refund sent', text: 'The money is back in the customer’s wallet.', rows: [['Order', id]] }; } });
    },
    fapp: function (el) {
      open({ title: 'Approve factory', confirm: 'Approve factory', data: {}, steps: [
        { t: 'Check the documents', r: function (d) { return ['Business licence checked', 'Video tour of the factory done', 'Sample tested and passed', 'No copies of other brands'].map(function (x, i) { return '<label class="agree"><input type="checkbox" data-w="c' + i + '"' + (d['c' + i] ? ' checked' : '') + '> <span>' + x + '</span></label>'; }).join(''); }, v: function (d) { return d.c0 && d.c1 && d.c2 && d.c3 ? '' : 'Tick every check before approving.'; } },
        { t: 'Starting level', r: function (d) { return radios('lv', d.lv || 'Silver', [['Silver', 'Silver', 'New factories start here'], ['Gold', 'Gold', 'Proven record elsewhere']]); } }],
        done: function () { pass(el); return { title: 'Factory approved', text: 'They can list products now. Every listing is still reviewed.' }; } });
    },
    frej: function (el) { reasonFlow(el, 'Decline factory', 'Decline', ['Documents missing or unclear', 'Failed sample test', 'Sells copies of other brands', 'Other'], 'Application declined'); },
    fpause: function (el) { var paused = /Resume/.test(el.textContent); if (paused) { confirmFlow(el, 'Resume factory', 'Resume', 'Their products go live again.', 'Factory resumed'); return; } reasonFlow(el, 'Pause factory', 'Pause factory', ['Score below 75', 'Late deliveries', 'Failed inspections', 'Customer complaints', 'Other'], 'Factory paused'); },
    lok: function (el) { confirmFlow(el, 'Approve listing', 'Approve and publish', 'The listing goes live for all customers.', 'Listing is live', ['Photos are the real product', 'Price tiers and MOQ are clear', 'No other company’s brand or logo']); },
    lno: function (el) { reasonFlow(el, 'Reject listing', 'Reject', ['Uses another brand or logo', 'Photos not of the real product', 'Wrong or missing prices', 'Prohibited item', 'Other'], 'Listing rejected'); },
    gext: function (el) { confirmFlow(el, 'Extend deadline', 'Extend 24 hours', 'Everyone in the deal gets an alert with the new deadline.', 'Deadline extended'); },
    gclose: function (el) { var ok = /Close/.test(el.textContent); confirmFlow(el, ok ? 'Close deal and order' : 'Cancel deal', ok ? 'Close and place order' : 'Cancel and refund', ok ? 'We place one order with the factory at the reached price.' : 'Every deposit goes back to the shops’ wallets.', ok ? 'Deal closed and ordered' : 'Deal cancelled, deposits refunded', null, !ok); },
    lim: function (el) { var i = +el.getAttribute('data-i'), inp = $('[data-lim="' + i + '"]'), v = inp ? inp.value : ''; open({ title: 'Change credit limit', confirm: 'Save new limit', steps: [{ t: 'New limit ' + money(+v || 0, 0) + '?', r: function () { return '<p class="muted">The customer sees the new limit at once and gets an alert.</p>'; } }, pinStep('Approve with your staff PIN')], done: function () { pass(el); return { title: 'Credit limit updated', rows: [['New limit', money(+v || 0, 0)]] }; } }); },
    frz: function (el) { var un = /Unfreeze/.test(el.textContent); if (un) confirmFlow(el, 'Unfreeze customer', 'Unfreeze', 'They can order and pay again.', 'Customer unfrozen'); else reasonFlow(el, 'Freeze customer', 'Freeze', ['Unpaid credit', 'Suspected fraud', 'Customer asked', 'Other'], 'Customer frozen', true); },
    savefees: function (el) { var ch = $$('[data-fee]').map(function (x) { return [x.previousElementSibling ? x.previousElementSibling.textContent : x.getAttribute('data-fee'), x.value]; }); open({ title: 'Save fees', confirm: 'Save fees', steps: [{ t: 'Check the new fees', r: function () { return review(ch) + '<p class="sample">New fees apply to orders placed from now on.</p>'; } }, pinStep('Approve with your staff PIN')], done: function () { pass(el); return { title: 'Fees saved' }; } }); },
    deliver: function (el) { var id = el.getAttribute('data-id'); open({ title: 'Mark delivered', confirm: 'Confirm delivery', steps: [{ t: 'Who received it?', r: function (d) { return f('Receiver name', 'rcv', d.rcv || '', 'placeholder="Name on delivery"') + f('Delivered on', 'on', new Date().toISOString().slice(0, 10), 'type="date"'); }, v: function (d) { return d.rcv ? '' : 'Enter who received it.'; } }, photoStep('imgs', 'Proof of delivery photo', 1)], done: function (d) { EZPHOTOS[id + ':pod'] = d.imgs; pass(el); return { title: 'Marked as delivered', rows: [['Parcel', id], ['Received by', esc(d.rcv)]] }; } }); }
  };
  function confirmFlow(el, title, btn, text, doneTitle, checks, danger) {
    open({ title: title, confirm: btn, danger: danger, steps: [{ t: title + '?', r: function (d) { return '<p class="muted">' + esc(text) + '</p>' + (checks || []).map(function (x, i) { return '<label class="agree"><input type="checkbox" data-w="k' + i + '"' + (d['k' + i] ? ' checked' : '') + '> <span>' + esc(x) + '</span></label>'; }).join(''); }, v: function (d) { return (checks || []).every(function (_, i) { return d['k' + i]; }) ? '' : 'Tick every check first.'; } }], done: function () { pass(el); return { title: doneTitle }; } });
  }
  function reasonFlow(el, title, btn, reasons, doneTitle, danger) {
    open({ title: title, confirm: btn, danger: danger !== false, data: { why: reasons[0] }, steps: [{ t: 'Choose a reason', r: function (d) { return radios('why', d.why, reasons.map(function (x) { return [x, x]; })) + ta('Message they will see', 'note', d.note, 'Optional'); } }, { t: 'Confirm', r: function (d) { return review([['Action', title], ['Reason', d.why]]); } }], done: function () { pass(el); return { title: doneTitle }; } });
  }

  /* ---------- customer side ---------- */
  function declare() {
    open({ title: 'Declare a parcel', confirm: 'Declare parcel', data: { from: 'Taobao', ctn: 1, val: '', contents: '', name: '', trk: '' }, steps: [
      { t: 'What is coming?', r: function (d) { return f('What is inside?', 'contents', d.contents, 'placeholder="e.g. Kitchen towels"') + f('Cargo name', 'name', d.name, 'placeholder="' + esc(window.EZSET ? EZSET.cargoName('…') : 'Leave empty for default') + '"') + '<div class="field"><label>Bought from</label><select data-w="from">' + ['Taobao', '1688', 'Pinduoduo', 'Yiwu market', 'Guangzhou market', 'EZICARGO factory', 'Other'].map(function (x) { return '<option' + (d.from === x ? ' selected' : '') + '>' + x + '</option>'; }).join('') + '</select></div>'; }, v: function (d) { return d.contents.trim() ? '' : 'Tell us what is inside.'; } },
      { t: 'Cartons and value', r: function (d) { return '<div class="f2">' + f('Cartons', 'ctn', d.ctn, 'inputmode="numeric"') + f('Goods value (RM)', 'val', d.val, 'inputmode="decimal" placeholder="480"') + '</div><p class="sample">Value is used for insurance and customs. Declare it honestly.</p>'; }, v: function (d) { return +d.ctn > 0 && +d.val > 0 ? '' : 'Enter cartons and value.'; } },
      { t: 'Courier tracking', r: function (d) { return f('Courier tracking number', 'trk', d.trk, 'placeholder="SF, YTO, ZTO or JD number"') + '<p class="sample">This helps us match the parcel the moment it arrives. You can add it later.</p>'; } },
      { t: 'Check and declare', r: function (d) { return review([['Contents', d.contents], ['Name', d.name || (window.EZSET ? EZSET.cargoName(d.contents) : d.contents)], ['From', d.from], ['Cartons', String(d.ctn)], ['Value', 'RM ' + d.val], ['Courier', d.trk || 'Later']]) + '<div class="addr" style="margin-top:6px"><b>Send it to</b>广东省广州市白云区太和镇 EZICARGO 国际仓 B2-18 · 收件人 ' + esc(S().code) + '</div>'; } }],
      done: function (d) { var id = rid('EZ-P-2', 4); S().parcels.unshift({ id: id, n: d.name.trim() || (window.EZSET ? EZSET.cargoName(d.contents) : d.contents), ctn: +d.ctn, kg: 0, dim: [0, 0, 0], val: +d.val, from: d.from, st: 'coming', arr: 0, photos: 0, insp: '', courier: d.trk || 'Tracking number to follow' }); A.note('Parcel ' + id + ' declared', 'ship'); return { title: 'Parcel declared', rows: [['Parcel number', id], ['Cartons', String(d.ctn)]], next: ['Send it to your China address with your code ' + S().code + '.', 'We scan, weigh and photograph it when it arrives.', 'You get an alert and it waits 14 days free.'], after: A.route }; } });
  }
  function rfq() {
    open({ title: 'Buying request', confirm: 'Send request', data: { q: '', price: '', dest: 'MY', when: '30' }, steps: [
      { t: 'What do you need?', r: function (d) { return f('Product', 'prod', d.prod, 'placeholder="e.g. Silicone phone stand with my logo"') + ta('Details', 'det', d.det, 'Material, colours, size, packaging'); }, v: function (d) { return (d.prod || '').trim() ? '' : 'Describe the product.'; } },
      { t: 'Quantity and price', r: function (d) { return '<div class="f2">' + f('Quantity', 'q', d.q, 'inputmode="numeric" placeholder="2000"') + f('Target price per piece (RM)', 'price', d.price, 'inputmode="decimal" placeholder="3.50"') + '</div>'; }, v: function (d) { return +d.q > 0 ? '' : 'Enter a quantity.'; } },
      { t: 'Delivery', r: function (d) { return '<div class="field"><label>Deliver to</label><select data-w="dest">' + E.DEST.map(function (x) { return '<option value="' + x.id + '"' + (d.dest === x.id ? ' selected' : '') + '>' + x.n + '</option>'; }).join('') + '</select></div>' + radios('when', d.when, [['14', 'Within 2 weeks'], ['30', 'Within a month'], ['60', 'No rush']]) + photoStep('imgs').r(d).replace('Tap to add photos', 'Add reference photos (optional)'); }, init: function (m, d) { photoStep('imgs').init(m, d); } },
      { t: 'Check and send', r: function (d) { return review([['Product', d.prod], ['Quantity', fmt(+d.q, 0) + ' pcs'], ['Target price', d.price ? 'RM ' + d.price + ' /pc' : 'Best offer'], ['Deliver to', E.DEST.filter(function (x) { return x.id === d.dest; })[0].n], ['Needed', { 14: 'Within 2 weeks', 30: 'Within a month', 60: 'No rush' }[d.when]], ['Photos', String((d.imgs || []).length)]]); } }],
      done: function (d) { var id = rid('RFQ-', 5); A.note('Buying request ' + id + ' sent', 'me'); return { title: 'Request sent', rows: [['Request number', id]], next: ['Our sourcing team in Guangzhou checks it today.', 'You get 3–5 quotes from verified factories within one working day.', 'Compare them and order with escrow.'] }; } });
  }
  function applyFactory() {
    open({ title: 'Apply as a factory', confirm: 'Send application', data: {}, steps: [
      { t: 'Your factory', r: function (d) { return f('Factory name', 'n', d.n) + '<div class="f2">' + f('City', 'city', d.city, 'placeholder="e.g. Yiwu"') + f('Years in business', 'yrs', d.yrs, 'inputmode="numeric"') + '</div>'; }, v: function (d) { return d.n && d.city ? '' : 'Enter the factory name and city.'; } },
      { t: 'What you make', r: function (d) { return f('Main products', 'prod', d.prod) + radios('type', d.type || 'OEM', [['OEM', 'OEM · you make for other brands'], ['ODM', 'ODM · your designs, buyer brands them'], ['Own', 'Your own brand'], ['Unbranded', 'Unbranded goods']]) + '<label class="agree"><input type="checkbox" data-w="nocopy"' + (d.nocopy ? ' checked' : '') + '> <span>We do not make copies of other companies’ brands or logos.</span></label>'; }, v: function (d) { return d.prod && d.nocopy ? '' : 'Add your products and confirm the brand rule.'; } },
      photoStep('docs', 'Business licence and factory photos', 1),
      { t: 'Check and send', r: function (d) { return review([['Factory', d.n], ['City', d.city], ['Products', d.prod], ['Type', d.type || 'OEM'], ['Files', String((d.docs || []).length)]]); } }],
      done: function (d) { return { title: 'Application sent', rows: [['Reference', rid('FAP-', 5)]], next: ['We check your licence within 3 working days.', 'We book a video tour and test a sample.', 'Approved factories start at Silver and are scored daily.'] }; } });
  }
  function keepLonger(el) {
    var st = S().parcels.filter(function (x) { return x.st === 'stored'; }), sel = $$('.pbox.on,.wh-li.on').map(function (b) { return b.getAttribute('data-pbox'); }), ctn = 0;
    st.forEach(function (x) { if (sel.indexOf(x.id) > -1) ctn += x.ctn; });
    open({ title: 'Keep in warehouse', confirm: 'Keep 14 more days', steps: [{ t: 'Keep ' + sel.length + ' parcel' + (sel.length > 1 ? 's' : '') + ' 14 more days?', r: function () { return review([['Parcels', sel.join(', ')], ['Cartons', String(ctn)], ['Rent', 'RM 1.20 per carton per day'], ['Up to', money(ctn * 1.2 * 14)]]) + '<p class="sample">Rent is charged only for days after the free period, when you ship.</p>'; } }], done: function () { pass(el); return { title: 'Storage extended' }; } });
  }
  function resetData(el) { confirmFlow(el, 'Reset sample data', 'Reset', 'Your cart, orders, parcels and wallet go back to the starting sample.', 'Sample data reset', null, true); }
  function removeCart(el) { var i = +el.getAttribute('data-i'), c = S().cart[i], p = A.P(c.p); open({ title: 'Remove from cart', confirm: 'Remove', danger: true, steps: [{ t: 'Remove this item?', r: function () { return review([['Product', p.n.split(',')[0]], ['Quantity', fmt(c.q, 0) + ' pcs']]); } }], done: function () { pass(el); return { title: 'Removed from cart' }; } }); }

  /* ---------- settings actions ---------- */
  var SET = {
    'Change': function () { open({ title: 'Change EZI PIN', confirm: 'Save new PIN', steps: [pinStep('Enter your current PIN'), { t: 'Choose a new PIN', r: function (d) { return '<div class="field"><label>New PIN</label><input class="pin num" data-w="n1" inputmode="numeric" maxlength="6" placeholder="••••••"></div><div class="field"><label>Type it again</label><input class="pin num" data-w="n2" inputmode="numeric" maxlength="6" placeholder="••••••"></div><small class="sample">Avoid your birthday or 123456.</small>'; }, v: function (d) { return !/^\d{6}$/.test(d.n1 || '') ? 'Use 6 digits.' : d.n1 !== d.n2 ? 'The two PINs are different.' : /^(\d)\1{5}$|123456|654321/.test(d.n1) ? 'That PIN is too easy to guess.' : ''; } }, otpStep()], done: function () { return { title: 'PIN changed', text: 'Use your new PIN for the next payment.' }; } }); },
    'Add a card or bank': function () { open({ title: 'Add a payment method', confirm: 'Save', data: { k: 'card' }, steps: [{ t: 'What do you want to add?', r: function (d) { return radios('k', d.k, [['card', 'Debit or credit card', 'Visa or Mastercard'], ['bank', 'Bank for FPX', 'Maybank2u, CIMB, Public Bank and more']]); } }, { t: 'Details', r: function (d) { return d.k === 'card' ? '<div class="pill warn" style="width:max-content">Test mode · do not enter a real card</div>' + f('Card number', 'no', '4242 4242 4242 4242', 'inputmode="numeric"') + '<div class="f2">' + f('Expiry', 'exp', '12/28') + f('Name on card', 'nm', S().name) + '</div>' : '<div class="field"><label>Bank</label><select data-w="bank">' + ['Maybank2u', 'CIMB Clicks', 'Public Bank', 'RHB Now', 'Hong Leong Connect', 'Bank Islam'].map(function (x) { return '<option>' + x + '</option>'; }).join('') + '</select></div>'; } }, otpStep()], done: function (d) { var s = S(); s.methods = s.methods || []; s.methods.push(d.k === 'card' ? { k: 'card', n: 'Visa •••• ' + String(d.no || '4242').replace(/\D/g, '').slice(-4) } : { k: 'bank', n: d.bank || 'Maybank2u' }); return { title: 'Payment method saved', after: A.route }; } }); },
    'Remove': function (el) { var row = el.closest('.set-row'), name = row ? row.querySelector('b').textContent : 'this card'; open({ title: 'Remove card', confirm: 'Remove', danger: true, steps: [{ t: 'Remove ' + name + '?', r: function () { return '<p class="muted">You can add it again at any time.</p>'; } }, pinStep()], done: function () { if (row) row.remove(); return { title: 'Card removed' }; } }); },
    'Unlink': function (el) { var row = el.closest('.set-row'), name = row ? row.querySelector('b').textContent : 'this bank'; open({ title: 'Unlink bank', confirm: 'Unlink', danger: true, steps: [{ t: 'Unlink ' + name + '?', r: function () { return '<p class="muted">You will choose your bank again next time you pay by FPX.</p>'; } }, pinStep()], done: function () { if (row) row.remove(); return { title: 'Bank unlinked' }; } }); },
    'Freeze': function () { open({ title: 'Freeze my account', confirm: 'Freeze account', danger: true, data: { why: 'lost' }, steps: [{ t: 'Why are you freezing it?', r: function (d) { return radios('why', d.why, [['lost', 'I lost my phone'], ['fraud', 'I see payments I did not make'], ['pause', 'I want to pause for a while']]); } }, { t: 'What freezing does', r: function () { return '<ul class="wz-ul"><li>All payments and top-ups stop at once.</li><li>Parcels stay safe in the warehouse. Nothing ships.</li><li>Escrow orders continue and refunds still reach you.</li><li>To unfreeze, contact support with your IC.</li></ul>'; } }, otpStep()], done: function () { S().frozen = true; return { title: 'Account frozen', text: 'No payments can be made. Contact support to unfreeze.' }; } }); },
    'Request': function (el) { var row = el.closest('.set-row'), what = row ? row.querySelector('b').textContent : ''; if (/Delete/.test(what)) deleteAcct(); else downloadData(); },
    'Sign out': function () { open({ title: 'Sign out', confirm: 'Sign out', steps: [{ t: 'Sign out of EZICARGO?', r: function () { return '<p class="muted">You need your phone number and PIN to sign in again.</p>'; } }], done: function () { return { title: 'Signed out', text: 'Preview: you stay on the sample account.' }; } }); }
  };
  function downloadData() { open({ title: 'Download my data', confirm: 'Send request', data: { fmt: 'pdf' }, steps: [{ t: 'What should we include?', r: function (d) { return ['Orders and escrow', 'Parcels and shipments', 'Payments and wallet', 'Messages and reviews', 'Profile and addresses'].map(function (x, i) { return '<label class="agree"><input type="checkbox" data-w="i' + i + '" checked> <span>' + x + '</span></label>'; }).join(''); } }, { t: 'Format', r: function (d) { return radios('fmt', d.fmt, [['pdf', 'PDF · easy to read'], ['csv', 'CSV · for Excel'], ['json', 'JSON · for developers']]); } }, otpStep()], done: function () { return { title: 'Request received', rows: [['Reference', rid('DATA-', 5)]], next: ['We prepare your file within 48 hours.', 'We email a secure link that works for 7 days.'] }; } }); }
  function deleteAcct() {
    var s = S(), blockers = []; if (s.escrow > 0) blockers.push('You have ' + money(s.escrow) + ' in escrow. Wait until those orders finish.'); if (s.wallet > 0) blockers.push('Your wallet has ' + money(s.wallet) + '. Withdraw it to your bank first.'); if (s.parcels.some(function (x) { return x.st === 'stored' || x.st === 'coming'; })) blockers.push('You have parcels in or coming to the warehouse. Ship or return them first.');
    open({ title: 'Delete my account', confirm: blockers.length ? 'Close' : 'Delete account', danger: true, steps: [{ t: blockers.length ? 'Before you can delete' : 'Delete your EZICARGO account?', r: function () { return blockers.length ? '<ul class="wz-ul">' + blockers.map(function (b) { return '<li>' + esc(b) + '</li>'; }).join('') + '</ul><p class="sample">Your membership fee is not refundable.</p>' : '<p class="muted">This closes your wallet and deletes your data after 30 days, as the law allows.</p>'; } }].concat(blockers.length ? [] : [{ t: 'Type DELETE to confirm', r: function (d) { return f('Type DELETE', 'typed', d.typed || '', 'autocomplete="off"'); }, v: function (d) { return (d.typed || '').trim() === 'DELETE' ? '' : 'Type DELETE in capitals.'; } }, otpStep()]), done: function () { return blockers.length ? { title: 'Nothing was deleted', text: 'Finish the steps above first.', bad: true } : { title: 'Deletion requested', text: 'Support will call you before anything is deleted.' }; } });
  }
  var LEGAL = {
    'Terms of use': ['Who can use EZICARGO', 'Businesses and adults in Malaysia, Singapore, Brunei, Saudi Arabia and the UAE. You must give true details and keep your PIN secret.', 'What we do', 'We receive, store, inspect and ship goods, hold escrow payments and pay suppliers for you.', 'Your part', 'Declare goods honestly and never send prohibited items or brand copies.'],
    'Privacy policy (PDPA)': ['What we collect', 'Your name, IC or SSM, phone, addresses, orders, parcels and payments.', 'Why', 'To deliver your goods, pay suppliers, prevent fraud and meet the law.', 'Your rights', 'See, correct or download your data at any time in Settings → Privacy.'],
    'Escrow rules': ['When money is held', 'From your payment until our inspection passes.', 'When it is released', 'After the inspection report is approved, straight to the factory.', 'Refunds', 'Pieces that fail inspection are refunded to your wallet.'],
    'Prohibited and restricted items': ['Never accepted', 'Weapons, drugs, counterfeit or brand-copy goods, flammable liquids and gases.', 'Special handling', 'Batteries ship by sea or special air. Food and medicine need a permit.'],
    'Refund and dispute policy': ['Open a dispute', 'Within 7 days of delivery, from the order page.', 'What we check', 'Inspection photos, factory messages and delivery proof.', 'Outcome', 'A decision within 5 working days. Refunds go to your wallet.']
  };
  function legal(name) { var L = LEGAL[name]; if (!L) return false; var html = ''; for (var i = 0; i < L.length; i += 2) html += '<div class="stack" style="--g:4px"><b>' + esc(L[i]) + '</b><p class="muted" style="font-size:14px">' + esc(L[i + 1]) + '</p></div>'; open({ title: 'Legal', confirm: 'Close', info: true, steps: [{ t: name, r: function () { return html + '<p class="sample">Summary. The full text is part of the live site.</p>'; } }] }); return true; }

  /* ---------- intercept one-click actions ---------- */
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-ca],[data-act],[data-toast],[data-wa],[data-addr-del],[data-dev-out],[data-fl="quicktop"]'); if (!el) return;
    if (el.getAttribute('data-wzok') === '1') { el.removeAttribute('data-wzok'); return; }
    var ca = el.getAttribute('data-ca'), act = el.getAttribute('data-act'), tst = el.getAttribute('data-toast'), wa = el.getAttribute('data-wa');
    var run = null;
    if (ca && CTL[ca]) run = function () { CTL[ca](el); };
    else if (el.getAttribute('data-fl') === 'quicktop') run = function () { var v = +el.getAttribute('data-v'); open({ title: 'Top up the difference', confirm: 'Pay ' + money(v, 0) + ' by FPX', data: { bank: 'Maybank2u' }, steps: [{ t: 'Choose your bank', r: function (d) { return radios('bank', d.bank, ['Maybank2u', 'CIMB Clicks', 'Public Bank', 'RHB Now', 'Hong Leong Connect', 'Bank Islam'].map(function (x) { return [x, x]; })); } }, { t: 'Approve in your bank', r: function (d) { return review([['Top up', money(v, 0)], ['Bank', d.bank], ['Into', 'EZI Wallet']]) + '<p class="sample">Test mode. In the live site your bank page opens here.</p>'; } }], done: function () { pass(el); return { title: 'Wallet topped up', rows: [['Added', money(v, 0)]] }; } }); };
    else if (act === 'declare') run = declare;
    else if (act === 'rfq') run = rfq;
    else if (act === 'apply') run = applyFactory;
    else if (act === 'reset') run = function () { resetData(el); };
    else if (act === 'rm') run = function () { removeCart(el); };
    else if (act === 'quick') run = function () { A.openOpt(el.getAttribute('data-p'), 'cart'); };
    else if (wa === 'keep' && !el.disabled) run = function () { keepLonger(el); };
    else if (el.hasAttribute('data-addr-del')) run = function () { confirmFlow(el, 'Delete address', 'Delete', 'This address is removed from your address book.', 'Address deleted', null, true); };
    else if (el.hasAttribute('data-dev-out')) run = function () { confirmFlow(el, 'Sign out device', 'Sign out', 'That device must sign in again with your phone number and PIN.', 'Device signed out'); };
    else if (tst !== null && tst !== undefined) { var label = el.textContent.trim(); if (legal(label.replace(/\s+/g, ' '))) { e.preventDefault(); e.stopImmediatePropagation(); return; } var key = Object.keys(SET).filter(function (k) { return label.indexOf(k) === 0; })[0]; if (key) run = function () { SET[key](el); }; }
    if (!run) return;
    e.preventDefault(); e.stopImmediatePropagation(); run();
  }, true);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && W && !W.done) close(); });

  window.EZWIZ = { open: open };
})();
