/* EZICARGO · product reviews: ratings, comments and photos from real visitors (shared db). No seeded reviews. */
(function () {
  'use strict';
  var A = window.EZAPP;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = A.esc, ic = A.ic;
  var DB = null, USER = null, ME = null, READY = false, REV = [], NAMES = {}, PHOTOS = {}, CANWRITE = null, CANMOD = false;
  var FILTER = 'all', DRAFT = { r: 0, t: '', imgs: [] };

  function stars(v, size) { var s = ''; for (var i = 1; i <= 5; i++) s += '<svg width="' + (size || 14) + '" height="' + (size || 14) + '" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z" fill="' + (v >= i - .25 ? '#F5A400' : v >= i - .75 ? 'url(#half)' : 'var(--line-2)') + '"/></svg>'; return '<span class="stars" aria-label="' + (Math.round(v * 10) / 10) + ' out of 5">' + s + '</span>'; }
  function summary(pid) { var L = REV.filter(function (r) { return r.p === pid; }), n = L.length, sum = 0, h = [0, 0, 0, 0, 0, 0]; L.forEach(function (r) { sum += r.r; h[r.r]++; }); return { n: n, avg: n ? sum / n : 0, h: h, list: L }; }
  function when(t) { return new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); }

  /* small rating badges on cards and the product header */
  function paintMini() {
    $$('[data-rv-mini]').forEach(function (el) { var s = summary(el.getAttribute('data-rv-mini')); el.innerHTML = s.n ? '★ ' + s.avg.toFixed(1) + ' (' + s.n + ')' : (el.hasAttribute('data-rv-long') ? 'No reviews yet' : 'New'); });
  }
  /* product page section */
  function paintSection() {
    var box = $('[data-rv]'); if (!box) return;
    var pid = box.getAttribute('data-rv'), s = summary(pid);
    if (!DB) { box.innerHTML = head(s) + '<div class="card pad empty"><b>Reviews are shown in the EZICARGO viewer</b><span>Open this page from its EZICARGO link to read and write reviews.</span></div>'; return; }
    if (!READY) { box.innerHTML = head(s) + '<div class="card pad empty"><span class="spin"></span><span>Loading reviews…</span></div>'; return; }
    var list = s.list.filter(function (r) { return FILTER === 'all' ? true : FILTER === 'photo' ? r.n > 0 : r.r === +FILTER; });
    var mine = ME && s.list.filter(function (r) { return r.uid === ME; })[0];
    box.innerHTML = head(s) +
      '<div class="rv-grid"><div class="card pad rv-sum">' + (s.n ? '<b class="rv-avg num">' + s.avg.toFixed(1) + '</b>' + stars(s.avg, 20) + '<span class="sample">' + s.n + ' review' + (s.n > 1 ? 's' : '') + '</span><div class="rv-hist">' + [5, 4, 3, 2, 1].map(function (k) { return '<button type="button" class="rv-hrow" data-rvf="' + k + '"><span>' + k + '★</span><span class="bar" style="height:7px"><i style="width:' + (s.n ? s.h[k] / s.n * 100 : 0) + '%;background:#F5A400"></i></span><span class="num">' + s.h[k] + '</span></button>'; }).join('') + '</div>' : '<b style="font-size:17px">No reviews yet</b><span class="sample">Bought this product? Be the first to rate it and add photos.</span>') + '</div>' +
      '<div class="stack" style="--g:12px;min-width:0">' + form(mine) +
      (s.n ? '<div class="chips">' + [['all', 'All'], ['photo', 'With photos'], ['5', '5★'], ['4', '4★'], ['3', '3★'], ['2', '2★'], ['1', '1★']].map(function (c) { return '<button type="button" class="chip" data-rvf="' + c[0] + '" aria-pressed="' + (FILTER === c[0]) + '">' + c[1] + '</button>'; }).join('') + '</div>' : '') +
      '<div class="rv-list">' + list.map(item).join('') + (s.n && !list.length ? '<span class="sample">No reviews match this filter.</span>' : '') + '</div></div></div>';
    list.forEach(function (r) { if (r.n && !PHOTOS[r.id]) loadPhotos(r.id); });
    resolveNames(list.map(function (r) { return r.uid; }));
  }
  function head(s) { return '<div class="sec-h"><h2>Reviews' + (s.n ? ' <span class="sample" style="font-size:15px">(' + s.n + ')</span>' : '') + '</h2><span class="sample">From EZICARGO customers</span></div>'; }
  function item(r) {
    var ph = PHOTOS[r.id], name = r.anon ? 'EZICARGO customer' : (NAMES[r.uid] || 'EZICARGO customer'), you = r.uid === ME;
    return '<article class="card pad rv-item"><div class="rv-top"><span class="ava" style="width:34px;height:34px;font-size:13px">' + esc((name[0] || 'E').toUpperCase()) + '</span><div style="flex:1;min-width:0"><b>' + esc(name) + (you ? ' <span class="pill">You</span>' : '') + '</b><div class="row" style="gap:6px">' + stars(r.r) + '<span class="sample">' + when(r.at) + (r.ed ? ' · edited' : '') + '</span></div></div>' + (you || CANMOD ? '<button type="button" class="linkbtn" data-rvdel="' + esc(r.id) + '">' + (you ? 'Delete' : 'Remove') + '</button>' : '') + '</div>' +
      (r.t ? '<p class="rv-t">' + esc(r.t) + '</p>' : '') +
      (r.n ? '<div class="rv-ph">' + (ph ? ph.map(function (src, i) { return '<button type="button" class="rv-img" data-rvimg="' + esc(r.id) + ':' + i + '"><img src="' + src + '" alt="Photo from ' + esc(name) + '" loading="lazy"></button>'; }).join('') : Array(r.n + 1).join('<span class="rv-img sk"></span>')) + '</div>' : '') + '</article>';
  }
  function form(mine) {
    if (CANWRITE === false) return '<div class="card pad sample">Only customers with access can post reviews on this page.</div>';
    if (mine && !DRAFT.edit) return '<div class="card pad rv-mine"><span>You rated this ' + stars(mine.r) + '</span><button type="button" class="btn btn-line btn-sm" data-rvedit="1">Edit my review</button></div>';
    var d = DRAFT;
    return '<form class="card pad stack rv-form" id="rv-form" style="--g:10px"><b>' + (mine ? 'Edit your review' : 'Write a review') + '</b><div class="rv-pick" role="radiogroup" aria-label="Your rating">' + [1, 2, 3, 4, 5].map(function (k) { return '<button type="button" role="radio" aria-checked="' + (d.r === k) + '" data-rvstar="' + k + '" aria-label="' + k + ' star' + (k > 1 ? 's' : '') + '">' + '<svg width="30" height="30" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z" fill="' + (d.r >= k ? '#F5A400' : 'var(--line-2)') + '"/></svg></button>'; }).join('') + '<span class="sample">' + ['Tap to rate', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'][d.r] + '</span></div>' +
      '<div class="field"><label for="rv-t">Your comment</label><textarea id="rv-t" maxlength="1200" placeholder="Quality, packing, how it sold in your shop…">' + esc(d.t) + '</textarea></div>' +
      '<div class="rv-up"><label class="btn btn-line btn-sm">' + ic('cam', 16) + ' Add photos<input type="file" id="rv-f" accept="image/*" multiple hidden></label><span class="sample">Up to 3 photos</span>' + d.imgs.map(function (src, i) { return '<span class="rv-thumb"><img src="' + src + '" alt="Your photo ' + (i + 1) + '"><button type="button" data-rvrm="' + i + '" aria-label="Remove photo">×</button></span>'; }).join('') + '</div>' +
      '<div class="fl-err" id="rv-err"></div><div class="row"><button class="btn btn-red" type="submit" id="rv-send">' + (mine ? 'Save review' : 'Post review') + '</button>' + (mine ? '<button type="button" class="btn btn-line" data-rvcancel="1">Cancel</button>' : '') + '</div></form>';
  }
  function loadPhotos(id) { PHOTOS[id] = null; DB.doc('reviewphotos/' + id).get().then(function (s) { var d = s.exists && s.data(); PHOTOS[id] = (d && d.imgs) || []; paintSection(); }).catch(function () { PHOTOS[id] = []; }); }
  function resolveNames(ids) {
    if (!USER || !USER.profiles) return; ids = ids.filter(function (x, i, a) { return x && a.indexOf(x) === i && NAMES[x] === undefined; }); if (!ids.length) return;
    ids.forEach(function (x) { NAMES[x] = ''; });
    Promise.resolve(USER.profiles(ids)).then(function (ps) { var ch = false; ids.forEach(function (x) { var n = ps && ps[x] && ps[x].name; if (n) { NAMES[x] = n; ch = true; } }); if (ch) paintSection(); }).catch(function () {});
  }
  function shrink(file) { return new Promise(function (res, rej) { var fr = new FileReader(); fr.onerror = rej; fr.onload = function () { var img = new Image(); img.onerror = rej; img.onload = function () { var k = Math.min(1, 720 / Math.max(img.width, img.height)), c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); var q = .6, out = c.toDataURL('image/jpeg', q); while (out.length > 75000 && q > .3) { q -= .1; out = c.toDataURL('image/jpeg', q); } res(out); }; img.src = fr.result; }; fr.readAsDataURL(file); }); }

  /* events */
  document.addEventListener('click', function (e) {
    var t;
    if ((t = e.target.closest('[data-rvstar]'))) { DRAFT.r = +t.getAttribute('data-rvstar'); keepText(); paintSection(); return; }
    if ((t = e.target.closest('[data-rvf]'))) { FILTER = t.getAttribute('data-rvf'); keepText(); paintSection(); return; }
    if ((t = e.target.closest('[data-rvrm]'))) { DRAFT.imgs.splice(+t.getAttribute('data-rvrm'), 1); keepText(); paintSection(); return; }
    if (e.target.closest('[data-rvedit]')) { var pid = $('[data-rv]').getAttribute('data-rv'), m = summary(pid).list.filter(function (r) { return r.uid === ME; })[0]; DRAFT = { r: m.r, t: m.t || '', imgs: (PHOTOS[m.id] || []).slice(), edit: true }; paintSection(); return; }
    if (e.target.closest('[data-rvcancel]')) { DRAFT = { r: 0, t: '', imgs: [] }; paintSection(); return; }
    if ((t = e.target.closest('[data-rvdel]'))) { var id = t.getAttribute('data-rvdel'); if (t.getAttribute('data-confirm') !== '1') { t.setAttribute('data-confirm', '1'); t.textContent = 'Tap again to confirm'; return; } Promise.all([DB.doc('reviews/' + id).delete(), DB.doc('reviewphotos/' + id).delete()]).then(function () { A.toast('Review removed', true); }).catch(function () { A.toast('Could not remove the review. Try again.'); }); return; }
    if ((t = e.target.closest('[data-rvimg]'))) { var p = t.getAttribute('data-rvimg').split(':'), src = (PHOTOS[p[0]] || [])[+p[1]]; if (!src) return; var sc = document.createElement('div'); sc.className = 'payov rv-lb'; sc.innerHTML = '<img src="' + src + '" alt="Review photo"><button class="x" aria-label="Close">×</button>'; sc.onclick = function () { sc.remove(); }; document.body.appendChild(sc); }
  });
  function keepText() { var ta = $('#rv-t'); if (ta) DRAFT.t = ta.value; }
  document.addEventListener('change', function (e) {
    if (e.target.id !== 'rv-f') return; keepText();
    var files = Array.prototype.slice.call(e.target.files).slice(0, 3 - DRAFT.imgs.length);
    Promise.all(files.map(shrink)).then(function (imgs) { DRAFT.imgs = DRAFT.imgs.concat(imgs).slice(0, 3); paintSection(); }).catch(function () { A.toast('That file could not be read. Try a JPG or PNG photo.'); });
  });
  document.addEventListener('submit', function (e) {
    if (e.target.id !== 'rv-form') return; e.preventDefault(); keepText();
    var err = $('#rv-err'), pid = $('[data-rv]').getAttribute('data-rv');
    if (!DRAFT.r) { err.textContent = 'Choose a star rating.'; return; }
    if (DRAFT.t.trim().length < 5 && !DRAFT.imgs.length) { err.textContent = 'Write a short comment or add a photo.'; return; }
    if (!ME) { err.textContent = 'Sign in to Claude to post a review.'; return; }
    var id = (ME + '_' + pid).replace(/[^A-Za-z0-9_-]/g, '').slice(0, 150), btn = $('#rv-send'); btn.disabled = true; btn.textContent = 'Posting…';
    var existed = summary(pid).list.some(function (r) { return r.id === id; });
    DB.doc('reviewphotos/' + id).set({ imgs: DRAFT.imgs }).then(function () {
      return DB.doc('reviews/' + id).set({ p: pid, uid: ME, r: DRAFT.r, t: DRAFT.t.trim().slice(0, 1200), n: DRAFT.imgs.length, at: Date.now(), ed: existed, anon: ((A.state().priv || {}).reviewName === 'anon') });
    }).then(function () { PHOTOS[id] = DRAFT.imgs.slice(); DRAFT = { r: 0, t: '', imgs: [] }; A.toast('Thanks! Your review is posted.', true); paintSection(); })
      .catch(function (x) { btn.disabled = false; btn.textContent = 'Post review'; if (x && x.code === 'invalid_argument') { CANWRITE = false; paintSection(); } else err.textContent = 'Could not post right now. Please try again.'; });
  });

  /* Control centre moderation tab content */
  function modList() {
    if (!DB) return '<div class="card pad empty">Reviews are available in the EZICARGO viewer.</div>';
    var L = REV.slice(); resolveNames(L.map(function (r) { return r.uid; }));
    return '<p class="muted ctl-p">Every review customers post. Remove anything abusive, fake or off topic.</p><div class="card table-wrap"><table><thead><tr><th>Product</th><th>Rating</th><th>Comment</th><th>Photos</th><th>Date</th><th></th></tr></thead><tbody>' + (L.length ? L.map(function (r) { var p = A.P(r.p); return '<tr><td><b>' + esc(p ? p.n.split(',')[0] : r.p) + '</b><div class="sample">' + esc(NAMES[r.uid] || 'Customer') + '</div></td><td>' + stars(r.r) + '</td><td style="max-width:320px">' + esc(r.t || '') + '</td><td class="num">' + (r.n || 0) + '</td><td class="sample" style="white-space:nowrap">' + when(r.at) + '</td><td>' + (CANMOD ? '<button class="btn btn-sm btn-line" data-rvdel="' + esc(r.id) + '">Remove</button>' : '<span class="sample">Editors only</span>') + '</td></tr>'; }).join('') : '<tr><td colspan="6" class="sample">No reviews yet.</td></tr>') + '</tbody></table></div>';
  }

  window.EZREV = { summary: summary, mod: modList };
  document.addEventListener('ezi:view', function () { if (A.view() !== 'p') { FILTER = 'all'; DRAFT = { r: 0, t: '', imgs: [] }; } paintMini(); paintSection(); });
  paintMini(); paintSection();

  /* connect */
  var cl = window.claude;
  if (cl && cl.use) {
    Promise.all([Promise.resolve(cl.use('db')).catch(function () { return null; }), Promise.resolve(cl.use('user')).catch(function () { return null; })]).then(function (r) {
      DB = r[0]; USER = r[1];
      if (USER) { Promise.resolve(USER.id && USER.id()).then(function (id) { ME = id || null; paintSection(); }).catch(function () {}); Promise.resolve(USER.canEdit && USER.canEdit()).then(function (v) { CANMOD = !!v; }).catch(function () {}); Promise.resolve(USER.can && USER.can('data.write')).then(function (v) { if (v === false) { CANWRITE = false; paintSection(); } }).catch(function () {}); }
      if (!DB) { paintSection(); return; }
      DB.collection('reviews').orderBy('at', 'desc').limit(1000).onSnapshot(function (snap) {
        REV = snap.docs.map(function (d) { var x = d.data() || {}; return { id: d.id, p: String(x.p || ''), uid: String(x.uid || ''), r: Math.max(1, Math.min(5, Math.round(+x.r || 0))), t: typeof x.t === 'string' ? x.t : '', n: Math.max(0, Math.min(3, +x.n || 0)), at: +x.at || 0, ed: !!x.ed, anon: !!x.anon }; }).filter(function (x) { return x.p && x.r; });
        READY = true; paintMini(); paintSection();
        if (A.view() === 'control' && location.hash === '#control-reviews') A.route();
      }, function () { READY = true; paintSection(); });
    });
  }
})();
