/* EZICARGO · settings, address book, defaults, naming cargo and shipments */
(function () {
  'use strict';
  var A = window.EZAPP, E = window.EZ;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var ic = A.ic, esc = A.esc, S = function () { return A.state(); };

  /* ---------- defaults ---------- */
  function ensure() {
    var s = S();
    if (/^EZ-\d+$/.test(s.code || '')) s.code = 'MY-A' + s.code.slice(3);
    if (!s.addrs) { var a = s.addr || { name: s.name, phone: '012-345 6789', line: 'No. 12, Jalan Kenari 5, Seksyen 7', city: 'Shah Alam', post: '40000', state: 'Selangor' }; s.addrs = [{ id: 'a1', label: 'Shop', name: a.name, phone: a.phone, line: a.line, city: a.city, post: a.post, state: a.state, dest: 'MY', def: true }]; }
    s.prof = s.prof || { name: 'Aisyah', biz: s.name, email: '', phone: '012-345 6789', lang: 'en' };
    s.prefs = s.prefs || { mode: 'sea', insp: 'std', pay: 'wallet', cargoName: '{contents} · {shop}', shipName: '{date} · {dest}', autoConsol: false, remind: 3, photoArrival: true, removeBoxes: false, fragile: false, notes: '' };
    s.sec = s.sec || { pin: true, bio: true, twofa: 'sms', alerts: true, confirmOver: 5000, dayLimit: 200000, devices: [{ n: 'This browser', where: 'Kuala Lumpur, MY', now: true }, { n: 'EZICARGO app · Android', where: 'Shah Alam, MY', at: Date.now() - 2 * 864e5 }] };
    s.priv = s.priv || { reviewName: 'name', personal: true, marketing: false, partners: false, profilePublic: false };
    s.notif = s.notif || { orders: { push: true, email: true, wa: true }, parcels: { push: true, email: false, wa: true }, pay: { push: true, email: true, wa: false }, deals: { push: true, email: false, wa: false }, promo: { push: false, email: false, wa: false }, quiet: true };
    s.app = s.app || { showBal: true, calm: false, haptic: true };
    s.biz = s.biz || { company: s.name, ssm: '202401012345', sst: '', invoiceEmail: '', team: [{ n: 'Aisyah (you)', role: 'Owner' }] };
    s.shipments = s.shipments || [];
  }
  function defAddr() { ensure(); var s = S(); return s.addrs.filter(function (a) { return a.def; })[0] || s.addrs[0]; }
  function fill(pat, o) { var d = new Date(); return pat.replace('{date}', d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })).replace('{dest}', o.dest || 'Malaysia').replace('{contents}', o.contents || 'Cargo').replace('{shop}', o.shop || S().name).replace('{n}', o.n || '1'); }
  function shipName(dest) { ensure(); var D = E.DEST.filter(function (x) { return x.id === dest; })[0]; return fill(S().prefs.shipName, { dest: D ? D.n : 'Malaysia', n: S().shipments.length + 1 }); }
  function cargoName(contents) { ensure(); return fill(S().prefs.cargoName, { contents: contents }); }
  function applyApp() { ensure(); var s = S(); document.documentElement.classList.toggle('calm', !!s.app.calm); s.hideBal = !s.app.showBal ? true : s.hideBal; }

  /* ---------- rename cargo / shipment ---------- */
  function rename(kind, id) {
    ensure(); var s = S(), obj = kind === 'ship' ? s.shipments.filter(function (x) { return x.id === id; })[0] : s.parcels.filter(function (x) { return x.id === id; })[0];
    var cur = kind === 'ship' ? (obj ? obj.name : '') : (obj ? obj.n : '');
    var sc = document.createElement('div'); sc.className = 'scrim'; var m = document.createElement('div'); m.className = 'modal'; m.setAttribute('role', 'dialog');
    m.innerHTML = '<div class="between"><h3>' + (kind === 'ship' ? 'Name this shipment' : 'Name this cargo') + '</h3><button class="x" aria-label="Close">×</button></div><span class="sample num">' + esc(id) + '</span><div class="field"><label for="rn-v">Name</label><input id="rn-v" value="' + esc(cur) + '" maxlength="60"></div><div class="chips">' + (kind === 'ship' ? [shipName('MY'), 'Raya stock', 'Restock ' + new Date().toLocaleDateString('en-GB', { month: 'short' }), 'Shop opening'] : ['Tumblers for shop', 'Samples', 'Raya stock', 'Keep in warehouse']).map(function (x) { return '<button type="button" class="chip" data-rnq="' + esc(x) + '">' + esc(x) + '</button>'; }).join('') + '</div><button class="btn btn-red" id="rn-save">Save name</button>';
    document.body.appendChild(sc); document.body.appendChild(m); var inp = $('#rn-v', m); inp.focus(); inp.select();
    function close() { sc.remove(); m.remove(); }
    sc.onclick = close; $('.x', m).onclick = close;
    $$('[data-rnq]', m).forEach(function (b) { b.onclick = function () { inp.value = b.getAttribute('data-rnq'); inp.focus(); }; });
    $('#rn-save', m).onclick = function () { var v = inp.value.trim(); if (!v) { inp.focus(); return; } if (kind === 'ship') { if (obj) obj.name = v; s.parcels.forEach(function (x) { if (x.trk === id) x.sname = v; }); } else if (obj) obj.n = v; A.save(); close(); A.route(); A.toast('Named “' + v + '”', true); };
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') $('#rn-save', m).click(); });
  }
  document.addEventListener('click', function (e) { var b = e.target.closest('[data-rename]'); if (!b) return; e.preventDefault(); e.stopPropagation(); var p = b.getAttribute('data-rename').split('|'); rename(p[0], p[1]); }, true);

  /* ---------- settings page ---------- */
  var SECT = [['profile', 'Profile', 'user'], ['addresses', 'Addresses', 'pin'], ['shipping', 'Shipping & naming', 'box'], ['payments', 'Payments', 'wallet'], ['security', 'Security', 'lock'], ['privacy', 'Privacy', 'shield'], ['notifications', 'Notifications', 'bell'], ['app', 'App & display', 'eye'], ['warehouse', 'Warehouse care', 'layers'], ['business', 'Business & team', 'factory'], ['support', 'Help & legal', 'chat']];
  function tog(path, on, label, sub) { return '<label class="set-row"><span><b>' + label + '</b>' + (sub ? '<small>' + sub + '</small>' : '') + '</span><span class="sw"><input type="checkbox" data-set="' + path + '"' + (on ? ' checked' : '') + '><i></i></span></label>'; }
  function sel(path, val, label, opts, sub) { return '<label class="set-row"><span><b>' + label + '</b>' + (sub ? '<small>' + sub + '</small>' : '') + '</span><select data-set="' + path + '">' + opts.map(function (o) { return '<option value="' + o[0] + '"' + (String(o[0]) === String(val) ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select></label>'; }
  function txt(path, val, label, sub, ph) { return '<div class="field set-f"><label>' + label + '</label><input data-set="' + path + '" value="' + esc(val || '') + '" placeholder="' + esc(ph || '') + '">' + (sub ? '<small class="sample">' + sub + '</small>' : '') + '</div>'; }
  function card(title, body, sub) { return '<section class="card pad stack set-card"><div><b class="set-h">' + title + '</b>' + (sub ? '<p class="sample">' + sub + '</p>' : '') + '</div>' + body + '</section>'; }
  var SV = {
    profile: function (s) {
      return card('Your profile', '<div class="set-prof"><span class="ava" style="width:64px;height:64px;font-size:22px">' + esc((s.prof.name || 'A')[0]) + '</span><div><b style="font-size:18px">' + esc(s.prof.biz) + '</b><div class="row" style="gap:6px;margin-top:4px"><span class="pill ink num">' + s.code + '</span><span class="pill good">' + ic('check', 12) + ' Verified business</span><span class="pill gold">Lifetime member</span></div></div></div>' +
        '<div class="f2">' + txt('prof.name', s.prof.name, 'Your name') + txt('prof.biz', s.prof.biz, 'Shop or business name') + txt('prof.phone', s.prof.phone, 'Default phone number', 'Used for deliveries and WhatsApp updates') + txt('prof.email', s.prof.email, 'Email', '', 'you@example.com') + '</div>') +
        card('Verification', '<div class="set-row"><span><b>Identity (eKYC)</b><small>MyKad verified</small></span><span class="pill good">Done</span></div><div class="set-row"><span><b>Business (SSM)</b><small>Needed for large supplier payments and credit</small></span><span class="pill good">Done</span></div><div class="set-row"><span><b>Membership</b><small>RM 150 lifetime · since 12 Mar 2024</small></span><span class="pill gold">Active</span></div>');
    },
    addresses: function (s) {
      return card('Address book', '<div class="addr-list">' + s.addrs.map(function (a) { var D = E.DEST.filter(function (x) { return x.id === a.dest; })[0]; return '<div class="addr-i' + (a.def ? ' def' : '') + '"><div style="flex:1;min-width:0"><b>' + esc(a.label) + (a.def ? ' <span class="pill red">Default</span>' : '') + '</b><span>' + esc(a.name) + ' · ' + esc(a.phone) + '</span><span>' + esc(a.line + ', ' + a.post + ' ' + a.city + ', ' + a.state) + ' · ' + (D ? D.n : '') + '</span></div><div class="row" style="gap:6px">' + (a.def ? '' : '<button class="btn btn-line btn-sm" data-addr-def="' + a.id + '">Make default</button>') + '<button class="btn btn-line btn-sm" data-addr-edit="' + a.id + '">Edit</button>' + (s.addrs.length > 1 ? '<button class="linkbtn" data-addr-del="' + a.id + '">Delete</button>' : '') + '</div></div>'; }).join('') + '</div><button class="btn btn-red" data-addr-edit="new" style="width:max-content">' + ic('plus', 16) + ' Add an address</button>', 'Save your shop, home or warehouse addresses. The default is filled in at checkout and when you ship.');
    },
    shipping: function (s) {
      var p = s.prefs;
      return card('Defaults', sel('prefs.mode', p.mode, 'Default shipping', [['sea', 'Sea LCL · cheapest'], ['air', 'Air express · fastest']]) + sel('prefs.insp', p.insp, 'Default inspection', [['photo', 'Photo check'], ['std', 'Standard quality check'], ['full', 'Full count and quality']]) + tog('prefs.autoConsol', p.autoConsol, 'Combine parcels automatically', 'When you ship several parcels together') + sel('prefs.remind', p.remind, 'Storage reminder', [[1, '1 day before free storage ends'], [3, '3 days before'], [5, '5 days before']])) +
        card('Naming', txt('prefs.cargoName', p.cargoName, 'Default cargo name', 'Use {contents}, {shop} or {date}. Example: ' + esc(cargoName('Scarves'))) + txt('prefs.shipName', p.shipName, 'Default shipment name', 'Use {date}, {dest} or {n}. Example: ' + esc(shipName('MY'))) + '<p class="sample">You can rename any cargo or shipment later from the warehouse or tracking page.</p>', 'Give every cargo and shipment a name you recognise.');
    },
    payments: function (s) {
      return card('Payment defaults', sel('prefs.pay', s.prefs.pay, 'Default payment method', [['wallet', 'EZI Wallet'], ['credit', 'EZI Credit'], ['fpx', 'FPX online banking'], ['duitnow', 'DuitNow QR'], ['card', 'Card']]) + sel('sec.dayLimit', s.sec.dayLimit, 'Daily supplier payment limit', [[20000, 'RM 20,000'], [100000, 'RM 100,000'], [200000, 'RM 200,000'], [500000, 'RM 500,000 (business review)']]) + tog('prefs.escrowSup', s.prefs.escrowSup !== false, 'Hold supplier payments in escrow by default', 'Released after our inspection passes')) +
        card('Saved methods', '<div class="set-row"><span><b>Visa •••• 4242</b><small>Test card · expires 12/28</small></span><button class="linkbtn" data-toast="Card removed (test mode)">Remove</button></div><div class="set-row"><span><b>Maybank2u</b><small>FPX · linked</small></span><button class="linkbtn" data-toast="Bank unlinked (test mode)">Unlink</button></div><button class="btn btn-line btn-sm" data-toast="Adding cards needs the licensed payment partner" style="width:max-content">' + ic('plus', 15) + ' Add a card or bank</button>');
    },
    security: function (s) {
      var x = s.sec;
      return card('Sign-in and payments', tog('sec.pin', x.pin, 'EZI PIN for payments', '6 digits, asked before every payment') + '<div class="set-row"><span><b>Change EZI PIN</b></span><button class="btn btn-line btn-sm" data-toast="A code was sent to your phone (test mode)">Change</button></div>' + tog('sec.bio', x.bio, 'Fingerprint or Face ID', 'In the EZICARGO app') + sel('sec.twofa', x.twofa, 'Two-step verification', [['sms', 'SMS code'], ['app', 'Authenticator app'], ['off', 'Off (not recommended)']]) + sel('sec.confirmOver', x.confirmOver, 'Ask again for payments over', [[1000, 'RM 1,000'], [5000, 'RM 5,000'], [20000, 'RM 20,000']]) + tog('sec.alerts', x.alerts, 'Login alerts', 'Tell me when someone signs in on a new device')) +
        card('Devices', x.devices.map(function (d, i) { return '<div class="set-row"><span><b>' + esc(d.n) + (d.now ? ' <span class="pill good">This device</span>' : '') + '</b><small>' + esc(d.where) + (d.at ? ' · last active ' + new Date(d.at).toLocaleDateString('en-GB') : ' · active now') + '</small></span>' + (d.now ? '' : '<button class="linkbtn" data-dev-out="' + i + '">Sign out</button>') + '</div>'; }).join('')) +
        card('Emergency', '<div class="set-row"><span><b>Freeze my account</b><small>Lost your phone? Stop all payments at once. Contact support to unfreeze.</small></span><button class="btn btn-line btn-sm" data-toast="Account frozen (test mode). Contact support to unfreeze.">Freeze</button></div>');
    },
    privacy: function (s) {
      var p = s.priv;
      return card('Privacy', sel('priv.reviewName', p.reviewName, 'Name on my reviews', [['name', 'Show my name'], ['anon', 'Show “EZICARGO customer”']]) + tog('priv.personal', p.personal, 'Personalised recommendations', 'Use my orders to suggest products and factories') + tog('priv.marketing', p.marketing, 'Promotions and offers', 'By email or WhatsApp') + tog('priv.partners', p.partners, 'Share with logistics partners', 'Only what couriers need to deliver') + tog('priv.profilePublic', p.profilePublic, 'Show my shop to factories', 'Factories can see your shop name when you ask for quotes'), 'We follow Malaysia’s Personal Data Protection Act (PDPA).') +
        card('Your data', '<div class="set-row"><span><b>Download my data</b><small>Orders, parcels, payments and messages as a file</small></span><button class="btn btn-line btn-sm" data-toast="We will email your data within 48 hours (test mode)">Request</button></div><div class="set-row"><span><b>Delete my account</b><small>Closes your wallet after all orders and escrow are settled</small></span><button class="btn btn-line btn-sm" data-toast="Deletion request received. Support will contact you (test mode).">Request</button></div>');
    },
    notifications: function (s) {
      var n = s.notif, rows = [['orders', 'Orders and escrow'], ['parcels', 'Parcels and shipments'], ['pay', 'Payments and wallet'], ['deals', 'Group deals'], ['promo', 'Promotions']];
      return card('What we tell you', '<div class="ntab"><div class="ntab-h"><span></span><b>App</b><b>Email</b><b>WhatsApp</b></div>' + rows.map(function (r) { return '<div class="ntab-r"><span>' + r[1] + '</span>' + ['push', 'email', 'wa'].map(function (c) { return '<label class="sw sm"><input type="checkbox" data-set="notif.' + r[0] + '.' + c + '"' + (n[r[0]][c] ? ' checked' : '') + ' aria-label="' + r[1] + ' ' + c + '"><i></i></label>'; }).join('') + '</div>'; }).join('') + '</div>' + tog('notif.quiet', n.quiet, 'Quiet hours 22:00–08:00', 'Only urgent payment and security alerts'));
    },
    app: function (s) {
      return card('Display', A.themePick() + sel('prof.lang', s.prof.lang, 'Language', [['en', 'English'], ['ms', 'Bahasa Melayu'], ['zh', '中文'], ['ar', 'العربية']], 'Menu, buttons and pages switch at once') + sel('cur', s.cur, 'Show prices in', Object.keys(E.CUR).map(function (k) { return [k, k + ' · ' + E.CUR[k].n]; })) + tog('app.showBal', s.app.showBal, 'Show balance on home', 'Turn off to hide it until you tap the eye') + tog('app.calm', s.app.calm, 'Calm mode', 'Fewer moving effects') + tog('app.haptic', s.app.haptic, 'Vibrate on actions', 'In the EZICARGO app'));
    },
    warehouse: function (s) {
      var p = s.prefs;
      return card('How we handle your cargo', tog('prefs.photoArrival', p.photoArrival, 'Photos on arrival', 'Free for every parcel') + tog('prefs.removeBoxes', p.removeBoxes, 'Remove shoe boxes and retail packaging', 'Saves volume on shipping') + tog('prefs.fragile', p.fragile, 'Treat my parcels as fragile', 'Extra padding and corner guards, RM 2 per carton') + '<div class="field set-f"><label>Standing packing notes</label><textarea data-set="prefs.notes" placeholder="e.g. Keep colours in separate bags. Do not stack over 3 cartons.">' + esc(p.notes || '') + '</textarea></div>', 'Our Guangzhou team follows these for every parcel.');
    },
    business: function (s) {
      var b = s.biz;
      return card('Invoices', '<div class="f2">' + txt('biz.company', b.company, 'Company name on invoices') + txt('biz.ssm', b.ssm, 'SSM number') + txt('biz.sst', b.sst, 'SST number', '', 'Optional') + txt('biz.invoiceEmail', b.invoiceEmail, 'Send invoices to', '', 'accounts@yourshop.com') + '</div>') +
        card('Team', b.team.map(function (t) { return '<div class="set-row"><span><b>' + esc(t.n) + '</b><small>' + t.role + '</small></span></div>'; }).join('') + '<form class="row" id="team-f" style="align-items:flex-end"><div class="field" style="flex:1;min-width:160px"><label for="tm-n">Add a staff member</label><input id="tm-n" placeholder="Name or phone"></div><div class="field"><label for="tm-r">Role</label><select id="tm-r"><option>Can order and ship</option><option>Can pay</option><option>View only</option></select></div><button class="btn btn-line" type="submit">Add</button></form>', 'Let staff order, ship or pay without sharing your password.') +
        card('Referral', '<div class="set-row"><span><b>Your referral code</b><small>Friends get RM 20 off membership. You get 200 EZI Coins.</small></span><span class="pill ink num">AISYAH20</span></div>');
    },
    support: function () {
      return card('Help', '<button class="set-link" data-act="assist">' + ic('chat', 18) + '<span>AI assistant and customer service</span>' + ic('arrow', 16) + '</button><button class="set-link" data-act="tour">' + ic('eye', 18) + '<span>Show me how the app works</span>' + ic('arrow', 16) + '</button><a class="set-link" href="#track">' + ic('pin', 18) + '<span>Track a parcel</span>' + ic('arrow', 16) + '</a>') +
        card('Legal', ['Terms of use', 'Privacy policy (PDPA)', 'Escrow rules', 'Prohibited and restricted items', 'Refund and dispute policy'].map(function (x) { return '<button class="set-link" data-toast="' + x + ' opens here in the live site">' + ic('shield', 18) + '<span>' + x + '</span>' + ic('arrow', 16) + '</button>'; }).join('') + '<p class="sample">EZICARGO RICH SDN. BHD. · 201601014585 (1185516-M) · version 0.5 preview</p>') +
        card('Session', '<button class="btn btn-line" data-toast="Signed out (preview)" style="width:max-content">Sign out</button><button class="btn btn-line btn-sm" data-act="reset" style="width:max-content">Reset sample data</button>');
    }
  };
  function view(arg) {
    ensure(); var s = S(), sec = SECT.some(function (x) { return x[0] === arg; }) ? arg : null, mob = innerWidth < 900;
    var nav = '<nav class="set-nav">' + SECT.map(function (x) { return '<a href="#settings-' + x[0] + '" class="' + (x[0] === (sec || (mob ? '' : 'profile')) ? 'on' : '') + '">' + ic(x[2], 18) + '<span>' + x[1] + '</span>' + ic('arrow', 14) + '</a>'; }).join('') + '</nav>';
    if (mob && !sec) return '<div class="view set"><div class="phead"><div><h1>Settings</h1><p>Everything about your account, in one place.</p></div></div>' + nav + '</div>';
    sec = sec || 'profile';
    return '<div class="view set"><div class="phead"><div>' + (mob ? '<a class="fl-x" href="#settings" style="margin-bottom:10px">' + ic('arrow', 16) + '<span>Settings</span></a>' : '') + '<h1>' + SECT.filter(function (x) { return x[0] === sec; })[0][1] + '</h1></div><span class="sample set-saved" id="set-saved">Changes save automatically</span></div><div class="set-wrap">' + (mob ? '' : nav) + '<div class="set-body stack" style="--g:14px">' + SV[sec](s) + '</div></div></div>';
  }
  function setPath(path, v) { var s = S(), parts = path.split('.'), o = s; for (var i = 0; i < parts.length - 1; i++) { o[parts[i]] = o[parts[i]] || {}; o = o[parts[i]]; } o[parts[parts.length - 1]] = v; }
  var saveT;
  function onSet(e) {
    var t = e.target, path = t.getAttribute && t.getAttribute('data-set'); if (!path) return;
    var v = t.type === 'checkbox' ? t.checked : (/^\d+$/.test(t.value) && t.tagName === 'SELECT' ? +t.value : t.value);
    if (path === 'cur') { S().cur = v; } else setPath(path, v);
    if (path === 'app.showBal') S().hideBal = !v;
    if (path === 'prof.biz') S().name = v;
    applyApp(); clearTimeout(saveT); saveT = setTimeout(function () { A.save(); A.badges(); var sv = $('#set-saved'); if (sv) { sv.textContent = 'Saved ✓'; sv.classList.add('ok'); setTimeout(function () { sv.textContent = 'Changes save automatically'; sv.classList.remove('ok'); }, 1500); } }, 300);
    if (e.type === 'change' && /^prefs\.(cargoName|shipName)$/.test(path) && A.view() === 'settings') setTimeout(function () { if (A.view() === 'settings') A.route(); }, 0);
  }
  document.addEventListener('change', onSet); document.addEventListener('input', function (e) { if (e.target.tagName === 'INPUT' && e.target.type !== 'checkbox' || e.target.tagName === 'TEXTAREA') onSet(e); });
  document.addEventListener('click', function (e) {
    var t;
    if ((t = e.target.closest('[data-toast]'))) { A.toast(t.getAttribute('data-toast'), true); return; }
    if ((t = e.target.closest('[data-addr-def]'))) { S().addrs.forEach(function (a) { a.def = a.id === t.getAttribute('data-addr-def'); }); A.save(); A.route(); A.toast('Default address updated', true); return; }
    if ((t = e.target.closest('[data-addr-del]'))) { var s = S(), id = t.getAttribute('data-addr-del'), was = s.addrs.filter(function (a) { return a.id === id; })[0]; s.addrs = s.addrs.filter(function (a) { return a.id !== id; }); if (was && was.def) s.addrs[0].def = true; A.save(); A.route(); A.toast('Address deleted', true); return; }
    if ((t = e.target.closest('[data-addr-edit]'))) { addrModal(t.getAttribute('data-addr-edit')); return; }
    if ((t = e.target.closest('[data-dev-out]'))) { S().sec.devices.splice(+t.getAttribute('data-dev-out'), 1); A.save(); A.route(); A.toast('Signed out of that device', true); return; }
  });
  document.addEventListener('submit', function (e) { if (e.target.id !== 'team-f') return; e.preventDefault(); var n = $('#tm-n').value.trim(); if (!n) return; S().biz.team.push({ n: n, role: $('#tm-r').value }); A.save(); A.route(); A.toast('Invite sent to ' + n, true); });
  function addrModal(id) {
    ensure(); var s = S(), a = id === 'new' ? { id: 'a' + Date.now(), label: '', name: s.prof.name, phone: s.prof.phone, line: '', city: '', post: '', state: '', dest: 'MY', def: false } : JSON.parse(JSON.stringify(s.addrs.filter(function (x) { return x.id === id; })[0]));
    var sc = document.createElement('div'); sc.className = 'scrim'; var m = document.createElement('div'); m.className = 'modal'; m.setAttribute('role', 'dialog');
    m.innerHTML = '<div class="between"><h3>' + (id === 'new' ? 'New address' : 'Edit address') + '</h3><button class="x" aria-label="Close">×</button></div><form class="stack" id="am-f"><div class="chips">' + ['Shop', 'Home', 'Warehouse', 'Office'].map(function (x) { return '<button type="button" class="chip" data-lb="' + x + '" aria-pressed="' + (a.label === x) + '">' + x + '</button>'; }).join('') + '</div>' +
      '<div class="f2"><div class="field"><label for="am-l">Label</label><input id="am-l" value="' + esc(a.label) + '" required placeholder="e.g. Shop"></div><div class="field"><label for="am-c">Country</label><select id="am-c">' + E.DEST.map(function (x) { return '<option value="' + x.id + '"' + (x.id === a.dest ? ' selected' : '') + '>' + x.n + '</option>'; }).join('') + '</select></div></div>' +
      '<div class="f2"><div class="field"><label for="am-n">Receiver name</label><input id="am-n" value="' + esc(a.name) + '" required></div><div class="field"><label for="am-p">Phone</label><input id="am-p" value="' + esc(a.phone) + '" required></div></div>' +
      '<div class="field"><label for="am-a">Address</label><input id="am-a" value="' + esc(a.line) + '" required></div><div class="f3"><div class="field"><label for="am-ci">City</label><input id="am-ci" value="' + esc(a.city) + '" required></div><div class="field"><label for="am-po">Postcode</label><input id="am-po" value="' + esc(a.post) + '" required></div><div class="field"><label for="am-st">State</label><input id="am-st" value="' + esc(a.state) + '"></div></div>' +
      '<label class="agree"><input type="checkbox" id="am-d"' + (a.def ? ' checked' : '') + '> <span>Make this my default address</span></label><button class="btn btn-red" type="submit">Save address</button></form>';
    document.body.appendChild(sc); document.body.appendChild(m);
    function close() { sc.remove(); m.remove(); }
    sc.onclick = close; $('.x', m).onclick = close;
    $$('[data-lb]', m).forEach(function (b) { b.onclick = function () { $('#am-l').value = b.getAttribute('data-lb'); $$('[data-lb]', m).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); }; });
    $('#am-f', m).onsubmit = function (e) { e.preventDefault(); a.label = $('#am-l').value; a.dest = $('#am-c').value; a.name = $('#am-n').value; a.phone = $('#am-p').value; a.line = $('#am-a').value; a.city = $('#am-ci').value; a.post = $('#am-po').value; a.state = $('#am-st').value; var d = $('#am-d').checked || !s.addrs.length; if (d) s.addrs.forEach(function (x) { x.def = false; }); a.def = d || a.def && $('#am-d').checked; var i = -1; s.addrs.forEach(function (x, k) { if (x.id === a.id) i = k; }); if (i > -1) s.addrs[i] = a; else s.addrs.push(a); if (!s.addrs.some(function (x) { return x.def; })) s.addrs[0].def = true; A.save(); close(); A.route(); A.toast('Address saved', true); };
  }

  window.EZSET = { ensure: ensure, defAddr: defAddr, shipName: shipName, cargoName: cargoName, rename: rename, addrModal: addrModal };
  window.EZVIEWS.settings = view;
  ensure(); applyApp();
  if (/^#settings/.test(location.hash)) A.route();
})();
