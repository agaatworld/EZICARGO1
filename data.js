/* EZICARGO platform · sample catalogue and account data (clearly marked as samples in the UI) */
window.EZ = (function () {
  var MYR_CNY = 1.6437; // mid-market, 29 Sep 2026
  // indicative display rates: 1 MYR = x
  var CUR = {
    MYR: { s: 'RM', r: 1, n: 'Malaysian ringgit' },
    CNY: { s: '¥', r: MYR_CNY, n: 'Chinese yuan' },
    USD: { s: 'US$', r: 0.2352, n: 'US dollar' },
    SGD: { s: 'S$', r: 0.3031, n: 'Singapore dollar' },
    BND: { s: 'B$', r: 0.3031, n: 'Brunei dollar' },
    SAR: { s: 'SAR ', r: 0.8821, n: 'Saudi riyal' },
    AED: { s: 'AED ', r: 0.8638, n: 'UAE dirham' },
    IDR: { s: 'Rp', r: 3812, n: 'Indonesian rupiah' },
    THB: { s: '฿', r: 7.71, n: 'Thai baht' }
  };
  var DEST = [
    { id: 'MY', n: 'Malaysia (West)', air: 18, sea: 650, ad: '5–7', sd: '14–21' },
    { id: 'EM', n: 'Malaysia (East)', air: 22, sea: 820, ad: '6–9', sd: '18–25' },
    { id: 'SG', n: 'Singapore', air: 21, sea: 700, ad: '4–6', sd: '12–18' },
    { id: 'BN', n: 'Brunei', air: 24, sea: 720, ad: '6–9', sd: '18–25' },
    { id: 'SA', n: 'Saudi Arabia', air: 28, sea: 980, ad: '7–10', sd: '28–35' },
    { id: 'AE', n: 'UAE', air: 26, sea: 900, ad: '6–9', sd: '24–30' }
  ];
  var CATS = [
    { id: 'all', n: 'All' }, { id: 'home', n: 'Home & kitchen' }, { id: 'tech', n: 'Phone & tech' }, { id: 'fashion', n: 'Fashion' },
    { id: 'beauty', n: 'Beauty' }, { id: 'bags', n: 'Bags' }, { id: 'toys', n: 'Toys' }, { id: 'lighting', n: 'Lighting' }, { id: 'packaging', n: 'Packaging' }
  ];
  var FACT = {
    f1: { n: 'Yongkang Steelware', city: 'Yongkang, Zhejiang', lv: 'EZI Select', sc: 96, yrs: 12, resp: '2 h', pass: 99.1, ontime: 98, cat: 'home', type: 'OEM · own brand' },
    f2: { n: 'Yiwu Home Goods', city: 'Yiwu, Zhejiang', lv: 'Gold', sc: 91, yrs: 9, resp: '3 h', pass: 97.8, ontime: 96, cat: 'home', type: 'Unbranded · OEM' },
    f3: { n: 'Shenzhen Case Works', city: 'Shenzhen, Guangdong', lv: 'Gold', sc: 90, yrs: 7, resp: '1 h', pass: 97.2, ontime: 97, cat: 'tech', type: 'ODM · unbranded' },
    f4: { n: 'Yiwu Silk Road Textiles', city: 'Yiwu, Zhejiang', lv: 'Gold', sc: 89, yrs: 11, resp: '4 h', pass: 96.9, ontime: 95, cat: 'fashion', type: 'OEM · unbranded' },
    f5: { n: 'Foshan Bright Lighting', city: 'Foshan, Guangdong', lv: 'Silver', sc: 85, yrs: 6, resp: '5 h', pass: 95.4, ontime: 93, cat: 'lighting', type: 'OEM · own brand' },
    f6: { n: 'Guangzhou Glow Cosmetics', city: 'Guangzhou, Guangdong', lv: 'Silver', sc: 84, yrs: 5, resp: '3 h', pass: 95.0, ontime: 94, cat: 'beauty', type: 'OEM · private label' },
    f7: { n: 'Shenzhen Loop Audio', city: 'Shenzhen, Guangdong', lv: 'Gold', sc: 88, yrs: 8, resp: '2 h', pass: 96.1, ontime: 95, cat: 'tech', type: 'ODM · unbranded' },
    f8: { n: 'Jinjiang Stride Footwear', city: 'Jinjiang, Fujian', lv: 'Silver', sc: 82, yrs: 10, resp: '6 h', pass: 94.2, ontime: 92, cat: 'fashion', type: 'Own brand STRIDA' },
    f9: { n: 'Baigou Carry Bags', city: 'Baigou, Hebei', lv: 'Silver', sc: 83, yrs: 7, resp: '4 h', pass: 94.8, ontime: 93, cat: 'bags', type: 'OEM · unbranded' },
    f10: { n: 'Yangzhou Soft Toys', city: 'Yangzhou, Jiangsu', lv: 'Gold', sc: 90, yrs: 14, resp: '3 h', pass: 97.5, ontime: 96, cat: 'toys', type: 'OEM · CE / EN71' },
    f11: { n: 'Xiamen Clear Optics', city: 'Xiamen, Fujian', lv: 'Silver', sc: 81, yrs: 6, resp: '5 h', pass: 93.9, ontime: 91, cat: 'fashion', type: 'Unbranded · OEM' },
    f12: { n: 'Dongguan Pack Print', city: 'Dongguan, Guangdong', lv: 'EZI Select', sc: 95, yrs: 13, resp: '1 h', pass: 99.0, ontime: 99, cat: 'packaging', type: 'Custom print' }
  };
  // tiers: [min qty, CNY per piece]; kg: gross kg per piece; cbm: packed CBM per piece
  var PROD = [
    { id: 'p1', n: 'Double-wall stainless tumbler 900 ml with straw lid', f: 'f1', c: 'home', art: 'tumbler', col: ['#D9C7B8', '#9FB7A8', '#1F2227', '#E7A5A5'], t: [[100, 26], [500, 22], [3000, 19]], kg: .42, cbm: .0028, sold: 18240, rt: 4.9, lead: '12–15 days', tags: ['Food grade 304', 'Logo laser'] },
    { id: 'p2', n: 'Clear magnetic phone case, drop-tested, 14 models', f: 'f3', c: 'tech', art: 'phonecase', col: ['#CFE3F2', '#F2D0DA', '#D9D9DE', '#1F2227'], t: [[200, 4.8], [1000, 3.9], [5000, 3.2]], kg: .05, cbm: .00025, sold: 64100, rt: 4.8, lead: '5–7 days', tags: ['Unbranded', 'Mixed models'] },
    { id: 'p3', n: 'ANC wireless earbuds, 30 h battery, unbranded', f: 'f7', c: 'tech', art: 'earbuds', col: ['#F4F4F6', '#1F2227', '#C9D6E8'], t: [[100, 48], [500, 41], [2000, 36]], kg: .12, cbm: .0006, sold: 9320, rt: 4.7, lead: '10–12 days', tags: ['Battery: sea or special air', 'Private label'] },
    { id: 'p4', n: 'Chiffon scarf 180 × 75 cm, 36 colours', f: 'f4', c: 'fashion', art: 'scarf', col: ['#C9A38A', '#8FA9C8', '#D98E9E', '#7FAE9A'], t: [[100, 7.5], [600, 6.2], [3000, 5.1]], kg: .08, cbm: .0003, sold: 41800, rt: 4.9, lead: '3–5 days', tags: ['Ready stock', 'Mix colours'] },
    { id: 'p5', n: 'Foldable LED desk lamp, 3 colour modes, USB-C', f: 'f5', c: 'lighting', art: 'lamp', col: ['#F4F4F6', '#1F2227', '#C9D6E8'], t: [[50, 39], [300, 33], [1000, 29]], kg: .6, cbm: .004, sold: 7610, rt: 4.7, lead: '8–10 days', tags: ['Own brand', 'Gift box'] },
    { id: 'p6', n: 'STRIDA knit running sneaker, sizes 36–45', f: 'f8', c: 'fashion', art: 'sneaker', col: ['#F4F4F6', '#1F2227', '#D9C7B8', '#9FB7A8'], t: [[60, 58], [300, 49], [1200, 44]], kg: .7, cbm: .006, sold: 5230, rt: 4.6, lead: '15–20 days', tags: ['Factory own brand', 'Size run'] },
    { id: 'p7', n: 'Velvet matte lip tint, private label, 12 shades', f: 'f6', c: 'beauty', art: 'lipstick', col: ['#B3122A', '#C75A5A', '#8A2D3B', '#E08A8A'], t: [[300, 5.2], [2000, 4.1], [10000, 3.4]], kg: .03, cbm: .00012, sold: 88000, rt: 4.8, lead: '20–25 days', tags: ['Your brand', 'MSDS ready'] },
    { id: 'p8', n: 'Water-resistant travel backpack 30 L, laptop sleeve', f: 'f9', c: 'bags', art: 'backpack', col: ['#1F2227', '#5C6B7A', '#9C7A5B', '#7A8C6E'], t: [[50, 45], [300, 38], [1000, 33]], kg: .8, cbm: .008, sold: 6110, rt: 4.7, lead: '10–14 days', tags: ['Unbranded', 'Custom logo'] },
    { id: 'p9', n: 'Soft plush bear 30 cm, EN71 tested', f: 'f10', c: 'toys', art: 'bear', col: ['#C69C72', '#EDE3D6', '#E6B8C4', '#8A6A50'], t: [[100, 12], [500, 9.8], [2000, 8.4]], kg: .25, cbm: .004, sold: 22400, rt: 4.9, lead: '7–10 days', tags: ['EN71 / CE', 'Gift tag'] },
    { id: 'p10', n: 'Granite non-stick frying pan 28 cm, induction', f: 'f1', c: 'home', art: 'pan', col: ['#2A2D33', '#6E5B4E', '#4F6D64'], t: [[100, 35], [500, 29], [2000, 25]], kg: 1.1, cbm: .0065, sold: 12900, rt: 4.8, lead: '12–15 days', tags: ['PFOA free', 'Colour box'] },
    { id: 'p11', n: 'AMOLED smart watch, calls and health tracking', f: 'f7', c: 'tech', art: 'watch', col: ['#1F2227', '#C9CCD2', '#D9B99B', '#8FA9C8'], t: [[50, 89], [300, 76], [1000, 68]], kg: .15, cbm: .0008, sold: 8840, rt: 4.6, lead: '10–12 days', tags: ['Unbranded', 'Battery: special air'] },
    { id: 'p12', n: 'Polarised sunglasses UV400, 8 frame colours', f: 'f11', c: 'fashion', art: 'glasses', col: ['#1F2227', '#9C7A5B', '#C75A5A', '#5C6B7A'], t: [[120, 9.5], [600, 7.8], [3000, 6.6]], kg: .06, cbm: .0004, sold: 30500, rt: 4.7, lead: '5–7 days', tags: ['Unbranded', 'Pouch + cloth'] },
    { id: 'p13', n: 'Stackable storage box set, 3 sizes, clear lid', f: 'f2', c: 'home', art: 'boxes', col: ['#DCE6EA', '#E9DFD3', '#E3E8DA'], t: [[100, 16], [500, 13.5], [2000, 11.8]], kg: .9, cbm: .012, sold: 15700, rt: 4.8, lead: '6–8 days', tags: ['Ready stock', 'Nested packing'] },
    { id: 'p14', n: 'RGB LED strip 5 m with app and remote', f: 'f5', c: 'lighting', art: 'strip', col: ['#1F2227', '#F4F4F6'], t: [[100, 11], [500, 9.2], [3000, 7.9]], kg: .2, cbm: .0009, sold: 27300, rt: 4.6, lead: '5–7 days', tags: ['Unbranded', 'Multi-plug'] },
    { id: 'p15', n: 'Printed kraft mailer box, your logo, 6 sizes', f: 'f12', c: 'packaging', art: 'mailer', col: ['#C9A06C', '#F4F4F6', '#1F2227'], t: [[1000, .9], [5000, .72], [20000, .58]], kg: .05, cbm: .0006, sold: 410000, rt: 4.9, lead: '7–9 days', tags: ['Custom print', 'Flat packed'] },
    { id: 'p16', n: 'Magnetic hijab pins, set of 12 in gift case', f: 'f4', c: 'fashion', art: 'pins', col: ['#D9B99B', '#C9CCD2', '#E08A8A', '#1F2227'], t: [[200, 3.2], [1000, 2.6], [5000, 2.1]], kg: .02, cbm: .0001, sold: 52600, rt: 4.9, lead: '3–5 days', tags: ['Ready stock', 'Gift case'] }
  ];
  var H = 3600e3, D = 24 * H, now = Date.now();
  var GROUP = [
    { id: 'g1', p: 'p1', ladder: [[1000, 22], [3000, 19]], got: 2340, goal: 3000, ends: now + 5 * H + 12 * 60e3, shops: 41 },
    { id: 'g2', p: 'p15', ladder: [[5000, .72], [20000, .58]], got: 16800, goal: 20000, ends: now + 9 * H + 40 * 60e3, shops: 63 },
    { id: 'g3', p: 'p3', ladder: [[500, 41], [2000, 36]], got: 1210, goal: 2000, ends: now + 27 * H, shops: 22 },
    { id: 'g4', p: 'p9', ladder: [[500, 9.8], [2000, 8.4]], got: 780, goal: 2000, ends: now + 2 * D + 4 * H, shops: 17 },
    { id: 'g5', p: 'p16', ladder: [[1000, 2.6], [5000, 2.1]], got: 3900, goal: 5000, ends: now + 14 * H, shops: 58 }
  ];
  var SHOPS = ['Kedai Aisyah, Shah Alam', 'Nur Hijab Store, Kota Bharu', 'GadgetHub, Johor Bahru', 'Mama Home, Ipoh', 'Lumière, Kuching', 'Bayt Home, Jeddah', 'Pack&Go, Penang', 'Zara Mode, Dubai', 'Toko Riang, Brunei', 'Dapur Kita, Melaka', 'SnapCase, Singapore', 'Al Noor Gifts, Riyadh'];
  function acct() {
    return {
      name: 'Aisyah Trading', code: 'MY-A10482', member: true,
      wallet: 12480.5, escrow: 3120,
      credit: { score: 742, limit: 20000, used: 0 },
      cart: [{ p: 'p4', q: 600, col: 1 }, { p: 'p16', q: 1000, col: 0 }],
      parcels: [
        { id: 'EZ-P-20877', n: 'Tumblers · Taobao', ctn: 6, kg: 18.4, dim: [60, 40, 35], val: 1860, from: 'Taobao', st: 'stored', arr: now - 3 * D, photos: 6, insp: 'Photo check passed' },
        { id: 'EZ-P-20891', n: 'Phone cases · 1688', ctn: 2, kg: 4.1, dim: [45, 35, 25], val: 620, from: '1688', st: 'stored', arr: now - 9 * D, photos: 4, insp: '' },
        { id: 'EZ-P-20902', n: 'Scarves · Yiwu market', ctn: 3, kg: 0, dim: [0, 0, 0], val: 940, from: 'Yiwu market', st: 'coming', arr: 0, photos: 0, insp: '', courier: 'SF Express SF1402886631' },
        { id: 'EZ-S-7715', n: 'Sea shipment · 14 cartons', ctn: 14, kg: 212, dim: [0, 0, 0], val: 7800, from: 'Consolidated', st: 'shipped', arr: now - 16 * D, photos: 28, insp: '', progress: .58, mode: 'Sea LCL → Port Klang', eta: now + 9 * D }
      ],
      orders: [
        { id: 'EZO-3021', p: 'p5', q: 300, unit: 33, total: 6022, step: 2, at: now - 6 * D, dest: 'MY', mode: 'sea', insp: 'Standard' }
      ],
      ledger: [
        { t: now - 2 * H, d: 'Escrow hold · EZO-3021 LED desk lamp', a: -3120, k: 'escrow' },
        { t: now - 1 * D, d: 'Top-up · FPX Maybank2u', a: 10000, k: 'in' },
        { t: now - 2 * D, d: 'Shipping · EZ-S-7715 sea LCL', a: -1240.6, k: 'out' },
        { t: now - 4 * D, d: 'Supplier payment ¥8,218 · Alipay', a: -5025.2, k: 'out' },
        { t: now - 6 * D, d: 'Refund · 12 pcs failed inspection', a: 214.8, k: 'in' },
        { t: now - 9 * D, d: 'Membership · lifetime', a: -150, k: 'out' }
      ],
      notes: [
        { t: now - 20 * 60e3, m: 'EZ-P-20877 measured: 6 cartons · 18.4 kg · 6 photos', r: 'ship' },
        { t: now - 3 * H, m: 'Group deal “Stainless tumbler” is 78% full', r: 'group' },
        { t: now - 1 * D, m: 'Top-up RM 10,000 received', r: 'wallet' }
      ]
    };
  }
  var ORDER_STEPS = [
    ['Paid into escrow', 'Money held by EZICARGO, not the factory'],
    ['Factory confirmed', 'Production slot booked'],
    ['In production', 'Factory sends progress photos'],
    ['Arrived at our warehouse', 'Guangzhou · weighed and photographed'],
    ['Inspection passed', 'Count, quality and labels checked'],
    ['Factory paid from escrow', 'Released only after the pass'],
    ['Shipped to you', 'Air or sea, tracked to your door']
  ];
  return { MYR_CNY: MYR_CNY, CUR: CUR, DEST: DEST, CATS: CATS, FACT: FACT, PROD: PROD, GROUP: GROUP, SHOPS: SHOPS, acct: acct, ORDER_STEPS: ORDER_STEPS };
})();

/* Product illustrations: simple drawn SVG, one per product type, tinted by the chosen colour */
window.ART = (function () {
  function wrap(bg, inner) { return '<svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="200" height="200" fill="' + bg + '"/><ellipse cx="100" cy="176" rx="62" ry="8" fill="rgba(0,0,0,.08)"/>' + inner + '</svg>'; }
  var K = {
    tumbler: function (c) { return '<path d="M68 52h64l-8 118a8 8 0 0 1-8 7H84a8 8 0 0 1-8-7z" fill="' + c + '"/><path d="M68 52h64l-1 12H69z" fill="rgba(0,0,0,.12)"/><rect x="62" y="38" width="76" height="16" rx="6" fill="#2A2D33"/><rect x="108" y="14" width="7" height="30" rx="3" fill="#3A3D44" transform="rotate(12 111 30)"/><path d="M132 70c22 0 22 44 0 44" fill="none" stroke="#2A2D33" stroke-width="9" stroke-linecap="round"/><path d="M84 70v90" stroke="rgba(255,255,255,.35)" stroke-width="6" stroke-linecap="round"/>'; },
    phonecase: function (c) { return '<rect x="58" y="22" width="84" height="156" rx="18" fill="' + c + '" stroke="rgba(0,0,0,.18)" stroke-width="2"/><rect x="70" y="34" width="36" height="40" rx="10" fill="rgba(0,0,0,.72)"/><circle cx="80" cy="46" r="6" fill="#444"/><circle cx="96" cy="46" r="6" fill="#444"/><circle cx="80" cy="62" r="6" fill="#444"/><circle cx="100" cy="118" r="26" fill="none" stroke="rgba(0,0,0,.28)" stroke-width="5"/><path d="M66 150l12-60" stroke="rgba(255,255,255,.6)" stroke-width="5" stroke-linecap="round"/>'; },
    earbuds: function (c) { return '<rect x="50" y="92" width="100" height="70" rx="30" fill="' + c + '" stroke="rgba(0,0,0,.14)" stroke-width="2"/><path d="M52 112h96" stroke="rgba(0,0,0,.15)" stroke-width="2"/><circle cx="100" cy="140" r="3" fill="#4FC47E"/><g fill="' + c + '" stroke="rgba(0,0,0,.2)" stroke-width="2"><path d="M70 40a18 18 0 1 1 0 36c-3 0-4 2-4 5v22h-10V58a18 18 0 0 1 14-18z"/><path d="M130 40a18 18 0 1 0 0 36c3 0 4 2 4 5v22h10V58a18 18 0 0 0-14-18z"/></g>'; },
    scarf: function (c) { return '<path d="M40 40c30 10 60-10 90 0s30 20 30 20l-10 110c-30-10-50 10-80 0s-30-10-30-10z" fill="' + c + '"/><path d="M50 60c30 10 60-10 90 0M46 100c30 10 60-10 94 0M44 140c30 10 60-10 96 0" stroke="rgba(255,255,255,.4)" stroke-width="3" fill="none"/><path d="M60 162v14M72 164v14M84 166v12M96 166v12M108 164v12M120 160v14" stroke="' + c + '" stroke-width="3"/>'; },
    lamp: function (c) { return '<ellipse cx="80" cy="170" rx="40" ry="8" fill="' + c + '" stroke="rgba(0,0,0,.2)" stroke-width="2"/><path d="M80 166V100l50-50" stroke="#8A8D93" stroke-width="7" fill="none" stroke-linecap="round"/><rect x="112" y="30" width="62" height="20" rx="8" fill="' + c + '" stroke="rgba(0,0,0,.2)" stroke-width="2" transform="rotate(35 143 40)"/><path d="M128 64l-16 64h64z" fill="#FFE9A8" opacity=".55"/>'; },
    sneaker: function (c) { return '<path d="M26 128c10-28 30-44 50-48l18 14c14 8 30 10 50 12 20 2 32 10 32 26v8H26z" fill="' + c + '" stroke="rgba(0,0,0,.2)" stroke-width="2"/><path d="M24 140h154v12a6 6 0 0 1-6 6H30a6 6 0 0 1-6-6z" fill="#fff" stroke="rgba(0,0,0,.2)" stroke-width="2"/><path d="M82 96l8 10M92 92l8 10M102 90l8 10" stroke="rgba(0,0,0,.35)" stroke-width="3" stroke-linecap="round"/><path d="M30 146h146" stroke="#D40B0B" stroke-width="3"/>'; },
    lipstick: function (c) { return '<rect x="74" y="100" width="52" height="74" rx="6" fill="#2A2D33"/><rect x="78" y="80" width="44" height="24" rx="4" fill="#C9A24A"/><path d="M84 80V42l32-18v56z" fill="' + c + '"/><rect x="132" y="120" width="36" height="54" rx="6" fill="#2A2D33"/><circle cx="54" cy="150" r="22" fill="' + c + '" opacity=".85"/>'; },
    backpack: function (c) { return '<rect x="52" y="44" width="96" height="130" rx="30" fill="' + c + '"/><path d="M78 44c0-24 44-24 44 0" fill="none" stroke="' + c + '" stroke-width="10"/><rect x="66" y="110" width="68" height="52" rx="14" fill="rgba(0,0,0,.2)"/><path d="M70 120h60" stroke="#D0D0D6" stroke-width="3"/><rect x="92" y="70" width="16" height="4" rx="2" fill="rgba(255,255,255,.5)"/>'; },
    bear: function (c) { return '<circle cx="64" cy="52" r="18" fill="' + c + '"/><circle cx="136" cy="52" r="18" fill="' + c + '"/><circle cx="100" cy="76" r="42" fill="' + c + '"/><ellipse cx="100" cy="146" rx="46" ry="34" fill="' + c + '"/><ellipse cx="100" cy="90" rx="16" ry="12" fill="rgba(255,255,255,.55)"/><circle cx="86" cy="70" r="5" fill="#1F2227"/><circle cx="114" cy="70" r="5" fill="#1F2227"/><circle cx="100" cy="86" r="5" fill="#1F2227"/><path d="M80 116h40" stroke="#D40B0B" stroke-width="8" stroke-linecap="round"/>'; },
    pan: function (c) { return '<circle cx="84" cy="110" r="58" fill="' + c + '"/><circle cx="84" cy="110" r="46" fill="rgba(255,255,255,.08)"/><circle cx="84" cy="110" r="46" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="2" stroke-dasharray="2 6"/><rect x="136" y="100" width="56" height="18" rx="9" fill="#1F2227" transform="rotate(-20 136 110)"/>'; },
    watch: function (c) { return '<rect x="80" y="10" width="40" height="180" rx="14" fill="' + c + '"/><rect x="58" y="52" width="84" height="96" rx="24" fill="#1F2227"/><rect x="66" y="60" width="68" height="80" rx="18" fill="#0A0B0D"/><text x="100" y="104" text-anchor="middle" fill="#fff" font-family="monospace" font-size="20" font-weight="700">10:08</text><path d="M78 118h44" stroke="#D40B0B" stroke-width="4" stroke-linecap="round"/>'; },
    glasses: function (c) { return '<path d="M20 86h160" stroke="' + c + '" stroke-width="8" stroke-linecap="round"/><rect x="26" y="84" width="66" height="50" rx="22" fill="#2A2D33" stroke="' + c + '" stroke-width="7"/><rect x="108" y="84" width="66" height="50" rx="22" fill="#2A2D33" stroke="' + c + '" stroke-width="7"/><path d="M40 96l20 20M122 96l20 20" stroke="rgba(255,255,255,.3)" stroke-width="5" stroke-linecap="round"/>'; },
    boxes: function (c) { return '<rect x="36" y="118" width="128" height="54" rx="8" fill="' + c + '" stroke="rgba(0,0,0,.15)" stroke-width="2"/><rect x="50" y="76" width="100" height="44" rx="8" fill="' + c + '" stroke="rgba(0,0,0,.15)" stroke-width="2"/><rect x="64" y="42" width="72" height="36" rx="8" fill="' + c + '" stroke="rgba(0,0,0,.15)" stroke-width="2"/><path d="M36 128h128M50 86h100M64 52h72" stroke="rgba(0,0,0,.18)" stroke-width="3"/>'; },
    strip: function (c) { var d = ''; for (var i = 0; i < 9; i++) { var a = i / 9 * 6.28; d += '<circle cx="' + (100 + Math.cos(a) * 52).toFixed(1) + '" cy="' + (100 + Math.sin(a) * 52).toFixed(1) + '" r="6" fill="' + ['#FF4A4A', '#FFB84A', '#FFEA4A', '#4FC47E', '#4AC7FF', '#6A7BFF', '#C44AFF', '#FF4AB8', '#FF4A4A'][i] + '"><animate attributeName="opacity" values="1;.35;1" dur="1.8s" begin="' + (i * .2) + 's" repeatCount="indefinite"/></circle>'; } return '<circle cx="100" cy="100" r="52" fill="none" stroke="' + c + '" stroke-width="16"/><circle cx="100" cy="100" r="30" fill="#E8E8EC"/>' + d; },
    mailer: function (c) { return '<path d="M30 90l70-26 70 26v70l-70 22-70-22z" fill="' + c + '"/><path d="M30 90l70 22 70-22" fill="none" stroke="rgba(0,0,0,.2)" stroke-width="3"/><path d="M100 112v70" stroke="rgba(0,0,0,.15)" stroke-width="3"/><path d="M30 90l-8-30 78 24" fill="' + c + '" stroke="rgba(0,0,0,.15)" stroke-width="2"/><text x="64" y="146" fill="rgba(0,0,0,.45)" font-family="sans-serif" font-weight="900" font-size="14" transform="skewY(14) translate(0,-16)">YOUR LOGO</text>'; },
    pins: function (c) { var s = ''; for (var i = 0; i < 12; i++) { var x = 46 + (i % 4) * 36, y = 62 + Math.floor(i / 4) * 40; s += '<circle cx="' + x + '" cy="' + y + '" r="12" fill="' + c + '" stroke="rgba(0,0,0,.15)" stroke-width="2"/><circle cx="' + (x - 3) + '" cy="' + (y - 3) + '" r="3" fill="rgba(255,255,255,.6)"/>'; } return '<rect x="24" y="40" width="152" height="130" rx="14" fill="#fff" stroke="rgba(0,0,0,.12)" stroke-width="2"/>' + s; }
  };
  var BG = ['#F3EEEA', '#EEF1F4', '#F4EEF0', '#EEF3EF', '#F2F0EA', '#EFEFF5'];
  return function (p, colIdx, bgIdx) {
    var c = p.col[(colIdx || 0) % p.col.length];
    var bg = BG[(bgIdx == null ? (+p.id.slice(1)) : bgIdx) % BG.length];
    return wrap(bg, K[p.art](c));
  };
})();
