// ============================================================
// PETALS & RIBBONSS — Premium Builder v3
// INR default · multi-currency · wrap/ribbon · add-ons · occasions
// WhatsApp: 918637505579
// ============================================================

// --- Currency System ---
const CURRENCIES = {
  INR: { symbol: '₹',    rate: 1,      decimals: 0 },
  USD: { symbol: '$',    rate: 0.012,  decimals: 2 },
  EUR: { symbol: '€',    rate: 0.011,  decimals: 2 },
  GBP: { symbol: '£',    rate: 0.0095, decimals: 2 },
  AED: { symbol: 'AED ', rate: 0.044,  decimals: 2 },
  JPY: { symbol: '¥',    rate: 1.78,   decimals: 0 },
};

function detectDefaultCurrency() {
  const lang = navigator.language || '';
  if (lang.startsWith('en-IN') || lang.startsWith('hi')) return 'INR';
  if (lang.startsWith('en-GB'))  return 'GBP';
  if (lang.startsWith('en-US'))  return 'USD';
  if (lang.startsWith('ja'))     return 'JPY';
  if (lang.startsWith('ar-AE'))  return 'AED';
  if (['de','fr','it','es','nl'].some(l => lang.startsWith(l))) return 'EUR';
  return 'INR';
}

let currentCurrency = localStorage.getItem('pp-currency') || detectDefaultCurrency();

function fmt(inrAmount) {
  const c = CURRENCIES[currentCurrency];
  return c.symbol + (inrAmount * c.rate).toFixed(c.decimals);
}

// --- Flower Data (prices in INR — tier-3 India) ---
const flowers = [
  { id: 'roses',    name: 'Roses',         emoji: '🌹', priceINR: 60,  size: 19, bg: '#FFE4E8' },
  { id: 'tulips',   name: 'Tulips',        emoji: '🌷', priceINR: 45,  size: 16, bg: '#FFDAF0' },
  { id: 'sun',      name: 'Sunflowers',    emoji: '🌻', priceINR: 50,  size: 22, bg: '#FFF8C4' },
  { id: 'lilies',   name: 'Lilies',        emoji: '🌸', priceINR: 55,  size: 17, bg: '#FFE0F4' },
  { id: 'baby',     name: "Baby's Breath", emoji: '🤍', priceINR: 20,  size: 11, bg: '#EEEAFF' },
  { id: 'peony',    name: 'Peonies',       emoji: '🩷', priceINR: 80,  size: 21, bg: '#FFD6E2' },
  { id: 'lavender', name: 'Lavender',      emoji: '💜', priceINR: 30,  size: 14, bg: '#EDE0FF' },
];

// --- Wrapping Paper ---
const WRAPS = [
  { id: 'blush',  name: 'Blush Pink',  priceINR: 70, fill: '#F9DEE2', ribbon: '#D4909E' },
  { id: 'white',  name: 'White',       priceINR: 60, fill: '#FEFCF8', ribbon: '#D8D0C8' },
  { id: 'kraft',  name: 'Kraft Paper', priceINR: 50, fill: '#EEDCC0', ribbon: '#9C7848' },
  { id: 'lav',    name: 'Lavender',    priceINR: 70, fill: '#EEE2F8', ribbon: '#A890CC' },
  { id: 'black',  name: 'Black',       priceINR: 80, fill: '#1E1820', ribbon: '#C8A0B8' },
];

// --- Ribbons ---
const RIBBONS = [
  { id: 'pink',  name: 'Pink Satin', priceINR: 40, color: '#E8909E' },
  { id: 'white', name: 'White',      priceINR: 30, color: '#EEE8E0' },
  { id: 'gold',  name: 'Gold',       priceINR: 55, color: '#D4A840' },
  { id: 'black', name: 'Black',      priceINR: 40, color: '#2a2a2a' },
  { id: 'jute',  name: 'Jute',       priceINR: 30, color: '#B09060' },
];

// --- Add-ons ---
const ADDONS = [
  { id: 'card',     name: 'Greeting Card',  emoji: '💌', priceINR: 49  },
  { id: 'choco',    name: 'Chocolates',     emoji: '🍫', priceINR: 99  },
  { id: 'ferrero',  name: 'Ferrero Rocher', emoji: '🎁', priceINR: 199 },
  { id: 'teddy',    name: 'Teddy Bear',     emoji: '🧸', priceINR: 299 },
  { id: 'fairy',    name: 'Fairy Lights',   emoji: '✨', priceINR: 149 },
  { id: 'polaroid', name: 'Polaroid Photo', emoji: '📸', priceINR: 79  },
];

// --- Occasion Presets ---
const OCCASIONS = [
  { id: 'birthday',   label: 'Birthday 🎂',    wrap: 'blush', ribbon: 'pink',  preset: { roses: 3, baby: 2 } },
  { id: 'anniversary',label: 'Anniversary 💕', wrap: 'white', ribbon: 'gold',  preset: { roses: 4, lilies: 2 } },
  { id: 'proposal',   label: 'Proposal 💍',    wrap: 'black', ribbon: 'gold',  preset: { roses: 6, baby: 3 } },
  { id: 'valentine',  label: 'Valentine ❤️',   wrap: 'blush', ribbon: 'pink',  preset: { roses: 5, lavender: 2 } },
  { id: 'mothers',    label: "Mother's Day 🌸", wrap: 'white', ribbon: 'pink', preset: { lilies: 3, peony: 2 } },
  { id: 'graduation', label: 'Graduation 🎓',  wrap: 'lav',   ribbon: 'white', preset: { sun: 3, tulips: 2 } },
];

// --- State ---
const HARD_LIMIT  = 15;
const SOFT_LIMIT  = 10;
const DELIVERY_INR = 80;
const WA_NUMBER   = '918637505579';

const state   = flowers.reduce((a, f) => { a[f.id] = 0; return a; }, {});
let stemsList = [];
let selWrap   = WRAPS[0];
let selRibbon = RIBBONS[0];
let selAddons = new Set();
let selOcc    = null;

// --- DOM refs ---
const flowerList   = document.getElementById('flowerList');
const previewChips = document.getElementById('previewChips');
const visualBouq   = document.getElementById('visualBouquet');
const stemCount    = document.getElementById('stemCount');
const totalPriceEl = document.getElementById('totalPrice');
const softWarning  = document.getElementById('softWarning');
const hardWarning  = document.getElementById('hardWarning');
const requestBtn   = document.getElementById('requestBtn');

// ============================================================
// FIBONACCI SPIRAL
// ============================================================
const PHI = 2.39996323;
function fibPos(n) {
  return Array.from({ length: n }, (_, i) => ({
    x: 140 + 15 * Math.sqrt(i) * Math.cos(i * PHI),
    y: 126 + 15 * Math.sqrt(i) * Math.sin(i * PHI) * 0.82,
  }));
}

// ============================================================
// SVG BOUQUET
// ============================================================
function buildSVG() {
  const n   = stemsList.length;
  const pos = fibPos(n);
  const W   = selWrap;
  const R   = selRibbon;

  let s = `<svg viewBox="0 0 280 310" xmlns="http://www.w3.org/2000/svg"
    style="width:100%;max-width:260px;display:block;margin:0 auto"
    role="img" aria-label="Bouquet preview, ${n} stems">
  <defs>
    <filter id="bsh" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="1.5" stdDeviation="2" flood-opacity="0.15"/>
    </filter>
    <style>
      @keyframes bloomIn{
        0%{opacity:0;transform:scale(.1) rotate(-30deg)}
        65%{opacity:1;transform:scale(1.15) rotate(5deg)}
        100%{opacity:1;transform:scale(1) rotate(0)}
      }
      .bfl{animation:bloomIn .45s cubic-bezier(.34,1.56,.64,1) both}
    </style>
  </defs>`;

  // Stems
  if (n > 0) {
    s += `<g opacity=".38">`;
    pos.forEach(p => { s += `<line x1="${p.x.toFixed(1)}" y1="${p.y.toFixed(1)}" x2="140" y2="231" stroke="#5D8640" stroke-width="1.4"/>`; });
    s += `</g>`;
  }

  // Paper wrap
  const isBlack = W.id === 'black';
  s += `<path d="M 83 196 L 47 308 L 140 296 L 233 308 L 197 196 Z" fill="${W.fill}" stroke="${W.ribbon}" stroke-width="1.2"/>`;
  s += `<path d="M 83 196 Q 140 189 197 196" fill="none" stroke="rgba(255,255,255,${isBlack ? '.06' : '.5'})" stroke-width="2.2"/>`;
  s += `<line x1="91"  y1="210" x2="58"  y2="296" stroke="${W.ribbon}" stroke-width=".5" opacity=".35"/>`;
  s += `<line x1="189" y1="210" x2="222" y2="296" stroke="${W.ribbon}" stroke-width=".5" opacity=".35"/>`;

  // Add-on accents on wrap
  if (selAddons.has('fairy')) s += `<text x="105" y="254" text-anchor="middle" font-size="11" style="user-select:none">✨✨</text>`;
  if (selAddons.has('card'))  s += `<text x="168" y="258" text-anchor="middle" font-size="12" style="user-select:none">💌</text>`;

  // Ribbon bow
  s += `<g transform="translate(140,202)">
    <path d="M -3 3 L -23 39 L -15 42 L 0 7"  fill="${R.color}" opacity=".6"/>
    <path d="M  3 3 L  23 39 L  15 42 L 0 7"  fill="${R.color}" opacity=".6"/>
    <path d="M 0 0 Q -27 -15 -29 -2 Q -31  9 -14 10 Q -5 10 0 0" fill="${R.color}"/>
    <path d="M 0 0 Q  27 -15  29 -2 Q  31  9  14 10 Q  5 10 0 0" fill="${R.color}"/>
    <path d="M -2 -1 Q -15 -9 -17 -3" fill="none" stroke="rgba(255,255,255,.3)" stroke-width="1.5"/>
    <path d="M  2 -1 Q  15 -9  17 -3" fill="none" stroke="rgba(255,255,255,.3)" stroke-width="1.5"/>
    <ellipse cx="0" cy="2.5" rx="5.5" ry="4.5" fill="${R.color}"/>
  </g>`;

  // Flowers (stable UIDs → only new flower animates)
  stemsList.forEach((stem, i) => {
    const f = flowers.find(x => x.id === stem.id);
    const p = pos[i];
    if (!f || !p) return;
    s += `<g class="bfl" transform="translate(${p.x.toFixed(1)},${p.y.toFixed(1)})"
      filter="url(#bsh)" data-uid="${stem.uid}"
      style="transform-origin:${p.x.toFixed(1)}px ${p.y.toFixed(1)}px">
      <circle r="${f.size + 2}" fill="${f.bg}" opacity=".6"/>
      <circle r="${f.size}" fill="${f.bg}" opacity=".95"/>
      <text text-anchor="middle" dominant-baseline="central"
        font-size="${(f.size * 1.22).toFixed(1)}"
        style="user-select:none;pointer-events:none">${f.emoji}</text>
    </g>`;
  });

  // Teddy add-on beside bouquet
  if (selAddons.has('teddy')) s += `<text x="218" y="192" font-size="20" style="user-select:none">🧸</text>`;

  // Empty state
  if (n === 0) {
    s += `<text x="140" y="108" text-anchor="middle" font-size="12" fill="#C0A0A8" font-family="Poppins,sans-serif">Add flowers to see your bouquet ✨</text>`;
    s += `<text x="140" y="148" text-anchor="middle" font-size="40">💐</text>`;
  }

  return s + `</svg>`;
}

// ============================================================
// PRICE HELPERS
// ============================================================
function totalStems() { return stemsList.length; }

function flowerTotalINR() {
  return flowers.reduce((sum, f) => sum + f.priceINR * state[f.id], 0);
}

function grandTotalINR() {
  let t = flowerTotalINR() + selWrap.priceINR + selRibbon.priceINR + DELIVERY_INR;
  selAddons.forEach(id => { const a = ADDONS.find(x => x.id === id); if (a) t += a.priceINR; });
  return t;
}

// ============================================================
// RENDER: FLOWER CONTROLS
// ============================================================
function renderFlowers() {
  flowerList.innerHTML = '';
  flowers.forEach(f => {
    const row = document.createElement('div');
    row.className  = 'flower-row';
    row.dataset.id = f.id;
    row.innerHTML  = `
      <div class="flower-info">
        <div style="font-size:22px;line-height:1">${f.emoji}</div>
        <div>
          <div style="font-weight:700">${f.name}</div>
          <div class="fprice" data-flower-price="${f.id}" style="font-size:12px;color:var(--muted)">${fmt(f.priceINR)} / stem</div>
        </div>
      </div>
      <div class="controls">
        <button class="btn ctrl-minus" style="padding:6px 10px" aria-label="Remove ${f.name}" data-id="${f.id}">−</button>
        <div class="qty" data-qty="${f.id}" style="min-width:24px;text-align:center">${state[f.id]}</div>
        <button class="btn ctrl-plus"  style="padding:6px 10px" aria-label="Add ${f.name}"    data-id="${f.id}">+</button>
      </div>`;
    flowerList.appendChild(row);
  });

  flowerList.addEventListener('click', e => {
    const btn = e.target.closest('button[data-id]');
    if (!btn) return;
    const id = btn.dataset.id;
    if (btn.classList.contains('ctrl-plus')) {
      if (totalStems() < HARD_LIMIT) {
        state[id]++;
        stemsList.push({ id, uid: `${id}-${Date.now()}-${Math.random().toString(36).slice(2)}` });
        flyFlower(btn, flowers.find(f => f.id === id));
        updateAll();
      }
    } else {
      if (state[id] > 0) {
        state[id]--;
        for (let i = stemsList.length - 1; i >= 0; i--) {
          if (stemsList[i].id === id) { stemsList.splice(i, 1); break; }
        }
        updateAll();
      }
    }
  });
}

// ============================================================
// RENDER: OCCASION PRESETS
// ============================================================
function renderOccasions() {
  const el = document.getElementById('occasionWrap');
  if (!el) return;
  el.innerHTML = `<div class="option-label">Occasion Preset</div><div class="occ-tags"></div>`;
  const row = el.querySelector('.occ-tags');
  OCCASIONS.forEach(o => {
    const btn = document.createElement('button');
    btn.className   = 'occ-tag' + (selOcc === o.id ? ' active' : '');
    btn.textContent = o.label;
    btn.addEventListener('click', () => {
      selOcc = (selOcc === o.id) ? null : o.id;
      if (selOcc) {
        selWrap   = WRAPS.find(w => w.id === o.wrap)    || WRAPS[0];
        selRibbon = RIBBONS.find(r => r.id === o.ribbon) || RIBBONS[0];
      }
      renderOccasions(); renderWrapPicker(); renderRibbonPicker(); updateAll();
    });
    row.appendChild(btn);
  });
}

// ============================================================
// RENDER: WRAP PICKER
// ============================================================
function renderWrapPicker() {
  const el = document.getElementById('wrapPickerWrap');
  if (!el) return;
  el.innerHTML = `<div class="option-label">Wrapping Paper</div><div class="swatch-row"></div>`;
  const row = el.querySelector('.swatch-row');
  WRAPS.forEach(w => {
    const btn = document.createElement('button');
    btn.className        = 'swatch-btn' + (selWrap.id === w.id ? ' sel' : '');
    btn.title            = `${w.name} (+${fmt(w.priceINR)})`;
    btn.style.background = w.fill;
    btn.style.border     = `2.5px solid ${selWrap.id === w.id ? w.ribbon : 'transparent'}`;
    btn.style.boxShadow  = selWrap.id === w.id ? `0 0 0 2.5px ${w.ribbon}55` : '0 1px 5px rgba(0,0,0,.12)';
    if (w.id === 'black') btn.innerHTML = `<span style="color:#e0d0d8;font-size:9px;pointer-events:none">■</span>`;
    btn.addEventListener('click', () => { selWrap = w; renderWrapPicker(); updateAll(); });
    row.appendChild(btn);
  });
  const lbl = document.createElement('span');
  lbl.className   = 'swatch-label';
  lbl.textContent = `${selWrap.name}  (+${fmt(selWrap.priceINR)})`;
  row.appendChild(lbl);
}

// ============================================================
// RENDER: RIBBON PICKER
// ============================================================
function renderRibbonPicker() {
  const el = document.getElementById('ribbonPickerWrap');
  if (!el) return;
  el.innerHTML = `<div class="option-label">Ribbon</div><div class="swatch-row"></div>`;
  const row = el.querySelector('.swatch-row');
  RIBBONS.forEach(r => {
    const btn = document.createElement('button');
    btn.className        = 'swatch-btn' + (selRibbon.id === r.id ? ' sel' : '');
    btn.title            = `${r.name} (+${fmt(r.priceINR)})`;
    btn.style.background = r.color;
    btn.style.border     = `2.5px solid ${selRibbon.id === r.id ? 'rgba(0,0,0,.35)' : 'transparent'}`;
    btn.style.boxShadow  = selRibbon.id === r.id ? `0 0 0 2.5px ${r.color}66` : '0 1px 5px rgba(0,0,0,.14)';
    btn.addEventListener('click', () => { selRibbon = r; renderRibbonPicker(); updateAll(); });
    row.appendChild(btn);
  });
  const lbl = document.createElement('span');
  lbl.className   = 'swatch-label';
  lbl.textContent = `${selRibbon.name}  (+${fmt(selRibbon.priceINR)})`;
  row.appendChild(lbl);
}

// ============================================================
// RENDER: ADD-ONS
// ============================================================
function renderAddons() {
  const el = document.getElementById('addonWrap');
  if (!el) return;
  el.innerHTML = `<div class="option-label">Premium Add-ons</div><div class="addon-grid"></div>`;
  const grid = el.querySelector('.addon-grid');
  ADDONS.forEach(a => {
    const lbl = document.createElement('label');
    lbl.className  = 'addon-item' + (selAddons.has(a.id) ? ' selected' : '');
    lbl.innerHTML  = `
      <input type="checkbox" ${selAddons.has(a.id) ? 'checked' : ''}>
      <span class="addon-emoji">${a.emoji}</span>
      <span class="addon-name">${a.name}</span>
      <span class="addon-price">+${fmt(a.priceINR)}</span>`;
    lbl.querySelector('input').addEventListener('change', e => {
      e.target.checked ? selAddons.add(a.id) : selAddons.delete(a.id);
      renderAddons(); updateAll();
    });
    grid.appendChild(lbl);
  });
}

// ============================================================
// RENDER: PRICE BREAKDOWN
// ============================================================
function renderBreakdown() {
  const el = document.getElementById('priceBreakdown');
  if (!el) return;
  if (totalStems() === 0 && selAddons.size === 0) { el.innerHTML = ''; return; }

  let h = `<div class="breakdown-card"><div class="breakdown-title">Price Breakdown</div>`;
  if (totalStems() > 0) {
    h += `<div class="bd-section">Flowers</div>`;
    flowers.forEach(f => {
      if (state[f.id] > 0)
        h += `<div class="bd-row"><span>${f.emoji} ${f.name} ×${state[f.id]}</span><span>${fmt(f.priceINR * state[f.id])}</span></div>`;
    });
  }
  h += `<div class="bd-section">Packaging</div>
    <div class="bd-row"><span>Wrap · ${selWrap.name}</span><span>${fmt(selWrap.priceINR)}</span></div>
    <div class="bd-row"><span>Ribbon · ${selRibbon.name}</span><span>${fmt(selRibbon.priceINR)}</span></div>`;
  if (selAddons.size > 0) {
    h += `<div class="bd-section">Add-ons</div>`;
    selAddons.forEach(id => {
      const a = ADDONS.find(x => x.id === id);
      if (a) h += `<div class="bd-row"><span>${a.emoji} ${a.name}</span><span>${fmt(a.priceINR)}</span></div>`;
    });
  }
  h += `<div class="bd-row"><span>🚚 Delivery</span><span>${fmt(DELIVERY_INR)}</span></div>
    <div class="bd-total"><span>Total</span><span>${fmt(grandTotalINR())}</span></div></div>`;
  el.innerHTML = h;
}

// ============================================================
// RENDER: DELIVERY ESTIMATE
// ============================================================
function renderDelivery() {
  const el = document.getElementById('deliveryBox');
  if (!el) return;
  if (totalStems() === 0) { el.innerHTML = ''; return; }
  const now  = new Date();
  const next = new Date(now);
  next.setDate(next.getDate() + (now.getHours() < 18 ? 1 : 2));
  const fmtD = d => d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  const msg  = now.getHours() < 18
    ? `Order now → Delivered by <strong>${fmtD(next)}</strong>`
    : `Order after 6 PM → Delivered by <strong>${fmtD(next)}</strong>`;
  el.innerHTML = `<div class="delivery-box">🚚 ${msg}</div>`;
}

// ============================================================
// FLYING FLOWER ANIMATION
// ============================================================
function flyFlower(button, flower) {
  const bR = button.getBoundingClientRect();
  const vR = visualBouq.getBoundingClientRect();
  const el = document.createElement('div');
  el.style.cssText = `position:fixed;left:${bR.left + bR.width/2}px;top:${bR.top + bR.height/2}px;
    width:36px;height:36px;border-radius:50%;background:${flower.bg};
    display:flex;align-items:center;justify-content:center;font-size:20px;
    z-index:300;pointer-events:none;transform:translate(-50%,-50%);
    box-shadow:0 4px 12px rgba(0,0,0,.18);transition:none;`;
  el.textContent = flower.emoji;
  document.body.appendChild(el);
  void el.offsetWidth;
  const tx = (vR.left + vR.width/2)  - (bR.left + bR.width/2);
  const ty = (vR.top  + vR.height/2) - (bR.top  + bR.height/2);
  el.style.transition = 'transform 520ms cubic-bezier(.2,.9,.2,1),opacity 440ms ease';
  el.style.transform  = `translate(calc(-50% + ${tx}px),calc(-50% + ${ty}px)) scale(0.4)`;
  el.style.opacity    = '0.85';
  setTimeout(() => { el.style.opacity = '0'; el.style.transform = `translate(calc(-50% + ${tx}px),calc(-50% + ${ty}px)) scale(0.1)`; }, 460);
  setTimeout(() => el.remove(), 950);
}

// ============================================================
// MAIN UPDATE
// ============================================================
function updateAll() {
  flowers.forEach(f => {
    const qEl  = flowerList.querySelector(`[data-qty="${f.id}"]`);
    const plus = flowerList.querySelector(`.ctrl-plus[data-id="${f.id}"]`);
    const min  = flowerList.querySelector(`.ctrl-minus[data-id="${f.id}"]`);
    if (qEl)  qEl.textContent = state[f.id];
    if (plus) plus.disabled   = totalStems() >= HARD_LIMIT;
    if (min)  min.disabled    = state[f.id] === 0;
    const row = flowerList.querySelector(`.flower-row[data-id="${f.id}"]`);
    if (row)  row.classList.toggle('active', state[f.id] > 0);
  });

  previewChips.innerHTML = '';
  flowers.forEach(f => {
    if (!state[f.id]) return;
    const chip = document.createElement('div');
    chip.className = 'chip';
    chip.title     = 'Click to remove one';
    chip.innerHTML = `<span style="font-size:16px">${f.emoji}</span> ${f.name} ×${state[f.id]} <span style="margin-left:6px;opacity:.55">✕</span>`;
    chip.addEventListener('click', () => {
      if (state[f.id] > 0) {
        state[f.id]--;
        for (let i = stemsList.length - 1; i >= 0; i--) {
          if (stemsList[i].id === f.id) { stemsList.splice(i, 1); break; }
        }
        updateAll();
      }
    });
    previewChips.appendChild(chip);
  });

  stemCount.textContent    = totalStems() + ' stems';
  totalPriceEl.textContent = fmt(grandTotalINR());
  visualBouq.innerHTML     = buildSVG();

  softWarning.style.display = (totalStems() >= SOFT_LIMIT && totalStems() < HARD_LIMIT) ? 'block' : 'none';
  hardWarning.style.display = (totalStems() >= HARD_LIMIT) ? 'block' : 'none';

  renderBreakdown();
  renderDelivery();
}

// ============================================================
// CURRENCY SELECTOR
// ============================================================
function initCurrency() {
  const sel = document.getElementById('currencySelect');
  if (!sel) return;
  sel.value = currentCurrency;
  sel.addEventListener('change', () => {
    currentCurrency = sel.value;
    localStorage.setItem('pp-currency', currentCurrency);
    document.querySelectorAll('[data-flower-price]').forEach(el => {
      const f = flowers.find(x => x.id === el.dataset.flowerPrice);
      if (f) el.textContent = fmt(f.priceINR) + ' / stem';
    });
    document.querySelectorAll('[data-shop-price]').forEach(el => {
      el.textContent = 'From ' + fmt(parseInt(el.dataset.shopPrice));
    });
    renderWrapPicker(); renderRibbonPicker(); renderAddons(); renderOccasions(); updateAll();
  });
}

// ============================================================
// WHATSAPP ORDER
// ============================================================
requestBtn.addEventListener('click', () => {
  if (totalStems() === 0) { alert('Please add some flowers first! 🌸'); return; }
  const lines  = flowers.filter(f => state[f.id] > 0).map(f => `${f.emoji} ${f.name} ×${state[f.id]}`).join('\n');
  const addons = [...selAddons].map(id => ADDONS.find(x => x.id === id)?.name).filter(Boolean).join(', ');
  const occ    = selOcc ? OCCASIONS.find(x => x.id === selOcc)?.label : '';
  const msg    = [
    "Hello! I'd like to order a custom bouquet from Petals & Ribbonss 🌸",
    '', lines,
    `\nWrap: ${selWrap.name}\nRibbon: ${selRibbon.name}`,
    addons ? `Add-ons: ${addons}` : '',
    occ    ? `Occasion: ${occ}`   : '',
    `\nTotal (incl. delivery): ${fmt(grandTotalINR())}`,
    '\nName:\nAddress:\nDelivery date:',
  ].filter(Boolean).join('\n');
  window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
});

// ============================================================
// INIT
// ============================================================
renderFlowers();
renderOccasions();
renderWrapPicker();
renderRibbonPicker();
renderAddons();
initCurrency();
updateAll();

// ============================================================
// THEME TOGGLE
// ============================================================
const themeToggle = document.getElementById('themeToggle');
const mediaDark   = window.matchMedia('(prefers-color-scheme: dark)');

function setDataTheme(v) {
  document.documentElement.setAttribute('data-theme', v);
  document.querySelectorAll('.logo-img').forEach(img => {
    img.src = v === 'dark' ? img.dataset.darkSrc : img.dataset.lightSrc;
  });
}
function applyTheme(t) {
  localStorage.setItem('pp-theme', t);
  setDataTheme(t === 'system' ? (mediaDark.matches ? 'dark' : 'light') : t);
  themeToggle.querySelectorAll('button').forEach(b =>
    b.style.opacity = (localStorage.getItem('pp-theme') === b.dataset.theme) ? '1' : '0.6');
}
mediaDark.addEventListener('change', () => {
  if ((localStorage.getItem('pp-theme') || 'system') === 'system')
    setDataTheme(mediaDark.matches ? 'dark' : 'light');
});
(function () {
  const saved = localStorage.getItem('pp-theme') || 'system';
  setDataTheme(saved === 'system' ? (mediaDark.matches ? 'dark' : 'light') : saved);
  themeToggle.querySelectorAll('button').forEach(b =>
    b.style.opacity = (saved === b.dataset.theme) ? '1' : '0.6');
})();
themeToggle.querySelectorAll('button').forEach(b =>
  b.addEventListener('click', () => applyTheme(b.dataset.theme)));

// ============================================================
// MISC
// ============================================================
const io = new IntersectionObserver(entries =>
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } }),
  { threshold: 0.12 }
);
document.querySelectorAll('.fade-in').forEach(el => io.observe(el));
document.getElementById('year').textContent = new Date().getFullYear();

document.getElementById('contactForm').addEventListener('submit', e => {
  e.preventDefault();
  const name = String(e.target.name.value || '').replace(/<[^>]*>/g, '').trim();
  alert(`Thanks ${name || 'friend'}! We'll reach out soon 🌸`);
  e.target.reset();
});

document.querySelectorAll('a[href^="#"]').forEach(a =>
  a.addEventListener('click', ev => {
    const t = a.getAttribute('href');
    if (t.startsWith('#')) { ev.preventDefault(); document.querySelector(t)?.scrollIntoView({ behavior: 'smooth' }); }
  })
);
