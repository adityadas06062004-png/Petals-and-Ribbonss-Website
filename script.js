// ============================================================
// PETALS & RIBBONSS — script.js (clean v4)
// ============================================================

// ── Currency ──────────────────────────────────────────────
const CURRENCIES = {
  INR: { symbol: '₹',    rate: 1,      dec: 0 },
  USD: { symbol: '$',    rate: 0.012,  dec: 2 },
  EUR: { symbol: '€',    rate: 0.011,  dec: 2 },
  GBP: { symbol: '£',    rate: 0.0095, dec: 2 },
  AED: { symbol: 'AED ', rate: 0.044,  dec: 2 },
  JPY: { symbol: '¥',    rate: 1.78,   dec: 0 },
};

function detectCurrency() {
  const l = navigator.language || '';
  if (l.startsWith('en-IN') || l.startsWith('hi')) return 'INR';
  if (l.startsWith('en-GB')) return 'GBP';
  if (l.startsWith('en-US')) return 'USD';
  if (l.startsWith('ja'))    return 'JPY';
  if (['de','fr','it','es','nl'].some(x => l.startsWith(x))) return 'EUR';
  return 'INR';
}

let activeCurrency = localStorage.getItem('pp-currency') || detectCurrency();

function fmt(inr) {
  const c = CURRENCIES[activeCurrency];
  return c.symbol + (inr * c.rate).toFixed(c.dec);
}

// ── Data ──────────────────────────────────────────────────
const FLOWERS = [
  { id:'roses',    name:'Roses',         emoji:'🌹', priceINR:60,  size:19, bg:'#FFE4E8' },
  { id:'tulips',   name:'Tulips',        emoji:'🌷', priceINR:45,  size:16, bg:'#FFDAF0' },
  { id:'sun',      name:'Sunflowers',    emoji:'🌻', priceINR:50,  size:22, bg:'#FFF8C4' },
  { id:'lilies',   name:'Lilies',        emoji:'🌸', priceINR:55,  size:17, bg:'#FFE0F4' },
  { id:'baby',     name:"Baby's Breath", emoji:'🤍', priceINR:20,  size:11, bg:'#EEEAFF' },
  { id:'peony',    name:'Peonies',       emoji:'🩷', priceINR:80,  size:21, bg:'#FFD6E2' },
  { id:'lavender', name:'Lavender',      emoji:'💜', priceINR:30,  size:14, bg:'#EDE0FF' },
];

const WRAPS = [
  { id:'blush', name:'Blush Pink',  priceINR:70, fill:'#F9DEE2', stroke:'#D4909E' },
  { id:'white', name:'White',       priceINR:60, fill:'#FEFCF8', stroke:'#D8D0C8' },
  { id:'kraft', name:'Kraft Paper', priceINR:50, fill:'#EEDCC0', stroke:'#9C7848' },
  { id:'lav',   name:'Lavender',    priceINR:70, fill:'#EEE2F8', stroke:'#A890CC' },
  { id:'black', name:'Black',       priceINR:80, fill:'#1E1820', stroke:'#C8A0B8' },
];

const RIBBONS = [
  { id:'pink',  name:'Pink Satin', priceINR:40, color:'#E8909E' },
  { id:'white', name:'White',      priceINR:30, color:'#EEE8E0' },
  { id:'gold',  name:'Gold',       priceINR:55, color:'#D4A840' },
  { id:'black', name:'Black',      priceINR:40, color:'#2a2a2a' },
  { id:'jute',  name:'Jute',       priceINR:30, color:'#B09060' },
];

const ADDONS = [
  { id:'card',     name:'Greeting Card',  emoji:'💌', priceINR:49  },
  { id:'choco',    name:'Chocolates',     emoji:'🍫', priceINR:99  },
  { id:'ferrero',  name:'Ferrero Rocher', emoji:'🎁', priceINR:199 },
  { id:'teddy',    name:'Teddy Bear',     emoji:'🧸', priceINR:299 },
  { id:'fairy',    name:'Fairy Lights',   emoji:'✨', priceINR:149 },
  { id:'polaroid', name:'Polaroid Photo', emoji:'📸', priceINR:79  },
];

const OCCASIONS = [
  { id:'birthday',    label:'Birthday 🎂',     wrap:'blush', ribbon:'pink',  preset:{roses:3,baby:2} },
  { id:'anniversary', label:'Anniversary 💕',  wrap:'white', ribbon:'gold',  preset:{roses:4,lilies:2} },
  { id:'proposal',    label:'Proposal 💍',     wrap:'black', ribbon:'gold',  preset:{roses:6,baby:3} },
  { id:'valentine',   label:'Valentine ❤️',    wrap:'blush', ribbon:'pink',  preset:{roses:5,lavender:2} },
  { id:'mothers',     label:"Mother's Day 🌸", wrap:'white', ribbon:'pink',  preset:{lilies:3,peony:2} },
  { id:'graduation',  label:'Graduation 🎓',   wrap:'lav',   ribbon:'white', preset:{sun:3,tulips:2} },
];

const WA_NUMBER   = '918637505579';
const HARD_LIMIT  = 15;
const SOFT_LIMIT  = 10;
const DELIVERY_INR = 80;

// ── Builder State ──────────────────────────────────────────
const counts  = FLOWERS.reduce((a,f)=>{a[f.id]=0;return a},{});
let stems     = [];   // [{id, uid}]
let selWrap   = WRAPS[0];
let selRibbon = RIBBONS[0];
let selAddons = new Set();
let selOcc    = null;

// ── DOM ────────────────────────────────────────────────────
const flowerList   = document.getElementById('flowerList');
const previewChips = document.getElementById('previewChips');
const visualBouq   = document.getElementById('visualBouquet');
const stemCountEl  = document.getElementById('stemCount');
const totalPriceEl = document.getElementById('totalPrice');
const softWarn     = document.getElementById('softWarning');
const hardWarn     = document.getElementById('hardWarning');
const requestBtn   = document.getElementById('requestBtn');

// ── Fibonacci spiral ───────────────────────────────────────
const PHI = 2.39996323;
function fibPos(n) {
  return Array.from({length:n},(_,i)=>({
    x: 140 + 15*Math.sqrt(i)*Math.cos(i*PHI),
    y: 126 + 15*Math.sqrt(i)*Math.sin(i*PHI)*0.82,
  }));
}

// ── SVG bouquet ────────────────────────────────────────────
function buildSVG() {
  const n = stems.length;
  const pos = fibPos(n);
  const W = selWrap, R = selRibbon;

  let s = `<svg viewBox="0 0 280 310" xmlns="http://www.w3.org/2000/svg"
    style="width:100%;max-width:260px;display:block;margin:0 auto"
    role="img" aria-label="Bouquet preview, ${n} stems">
  <defs>
    <filter id="bsh"><feDropShadow dx="0" dy="1.5" stdDeviation="2" flood-opacity="0.15"/></filter>
    <style>@keyframes bloomIn{0%{opacity:0;transform:scale(.1) rotate(-30deg)}65%{opacity:1;transform:scale(1.15) rotate(5deg)}100%{opacity:1;transform:scale(1) rotate(0)}}.bfl{animation:bloomIn .45s cubic-bezier(.34,1.56,.64,1) both}</style>
  </defs>`;

  if (n>0) {
    s += `<g opacity=".38">`;
    pos.forEach(p=>{ s+=`<line x1="${p.x.toFixed(1)}" y1="${p.y.toFixed(1)}" x2="140" y2="231" stroke="#5D8640" stroke-width="1.4"/>`; });
    s += `</g>`;
  }

  s += `<path d="M 83 196 L 47 308 L 140 296 L 233 308 L 197 196 Z" fill="${W.fill}" stroke="${W.stroke}" stroke-width="1.2"/>`;
  s += `<path d="M 83 196 Q 140 189 197 196" fill="none" stroke="rgba(255,255,255,${W.id==='black'?'.06':'.5'})" stroke-width="2.2"/>`;
  s += `<line x1="91"  y1="210" x2="58"  y2="296" stroke="${W.stroke}" stroke-width=".5" opacity=".35"/>`;
  s += `<line x1="189" y1="210" x2="222" y2="296" stroke="${W.stroke}" stroke-width=".5" opacity=".35"/>`;

  if (selAddons.has('fairy')) s += `<text x="105" y="254" text-anchor="middle" font-size="11" style="user-select:none">✨✨</text>`;
  if (selAddons.has('card'))  s += `<text x="168" y="258" text-anchor="middle" font-size="12" style="user-select:none">💌</text>`;

  s += `<g transform="translate(140,202)">
    <path d="M -3 3 L -23 39 L -15 42 L 0 7"  fill="${R.color}" opacity=".6"/>
    <path d="M  3 3 L  23 39 L  15 42 L 0 7"  fill="${R.color}" opacity=".6"/>
    <path d="M 0 0 Q -27 -15 -29 -2 Q -31  9 -14 10 Q -5 10 0 0" fill="${R.color}"/>
    <path d="M 0 0 Q  27 -15  29 -2 Q  31  9  14 10 Q  5 10 0 0" fill="${R.color}"/>
    <path d="M -2 -1 Q -15 -9 -17 -3" fill="none" stroke="rgba(255,255,255,.3)" stroke-width="1.5"/>
    <path d="M  2 -1 Q  15 -9  17 -3" fill="none" stroke="rgba(255,255,255,.3)" stroke-width="1.5"/>
    <ellipse cx="0" cy="2.5" rx="5.5" ry="4.5" fill="${R.color}"/>
  </g>`;

  stems.forEach((stem,i)=>{
    const f=FLOWERS.find(x=>x.id===stem.id), p=pos[i];
    if(!f||!p) return;
    s+=`<g class="bfl" transform="translate(${p.x.toFixed(1)},${p.y.toFixed(1)})" filter="url(#bsh)" style="transform-origin:${p.x.toFixed(1)}px ${p.y.toFixed(1)}px">
      <circle r="${f.size+2}" fill="${f.bg}" opacity=".6"/>
      <circle r="${f.size}" fill="${f.bg}" opacity=".95"/>
      <text text-anchor="middle" dominant-baseline="central" font-size="${(f.size*1.22).toFixed(1)}" style="user-select:none;pointer-events:none">${f.emoji}</text>
    </g>`;
  });

  if (selAddons.has('teddy')) s+=`<text x="218" y="192" font-size="20" style="user-select:none">🧸</text>`;

  if (n===0) {
    s+=`<text x="140" y="108" text-anchor="middle" font-size="12" fill="#C0A0A8" font-family="Poppins,sans-serif">Add flowers to see your bouquet ✨</text>`;
    s+=`<text x="140" y="148" text-anchor="middle" font-size="40">💐</text>`;
  }

  return s+`</svg>`;
}

// ── Price helpers ──────────────────────────────────────────
function totalStems() { return stems.length; }

function grandTotalINR() {
  let t = FLOWERS.reduce((s,f)=>s+f.priceINR*counts[f.id],0)
        + selWrap.priceINR + selRibbon.priceINR + DELIVERY_INR;
  selAddons.forEach(id=>{ const a=ADDONS.find(x=>x.id===id); if(a) t+=a.priceINR; });
  return t;
}

// ── Render: flowers ────────────────────────────────────────
function renderFlowers() {
  flowerList.innerHTML = '';
  FLOWERS.forEach(f=>{
    const row = document.createElement('div');
    row.className = 'flower-row';
    row.dataset.id = f.id;
    row.innerHTML = `
      <div class="flower-info">
        <div style="font-size:22px">${f.emoji}</div>
        <div>
          <div style="font-weight:700">${f.name}</div>
          <div data-fprice="${f.id}" style="font-size:12px;color:var(--muted)">${fmt(f.priceINR)} / stem</div>
        </div>
      </div>
      <div class="controls">
        <button class="btn cminus" style="padding:6px 10px" data-id="${f.id}" aria-label="Remove ${f.name}">−</button>
        <div class="qty" data-qty="${f.id}" style="min-width:24px;text-align:center">0</div>
        <button class="btn cplus"  style="padding:6px 10px" data-id="${f.id}" aria-label="Add ${f.name}">+</button>
      </div>`;
    flowerList.appendChild(row);
  });

  flowerList.addEventListener('click', e=>{
    const btn = e.target.closest('button[data-id]');
    if (!btn) return;
    const id = btn.dataset.id;
    if (btn.classList.contains('cplus')) {
      if (totalStems()<HARD_LIMIT) {
        counts[id]++;
        stems.push({id, uid:`${id}-${Date.now()}-${Math.random().toString(36).slice(2)}`});
        flyFlower(btn, FLOWERS.find(f=>f.id===id));
        updateAll();
      }
    } else {
      if (counts[id]>0) {
        counts[id]--;
        for(let i=stems.length-1;i>=0;i--){ if(stems[i].id===id){stems.splice(i,1);break;} }
        updateAll();
      }
    }
  });
}

// ── Render: occasions ──────────────────────────────────────
function renderOccasions() {
  const el = document.getElementById('occasionWrap');
  if (!el) return;
  el.innerHTML = `<div class="option-label">Occasion Preset</div><div class="occ-tags"></div>`;
  OCCASIONS.forEach(o=>{
    const btn = document.createElement('button');
    btn.className = 'occ-tag'+(selOcc===o.id?' active':'');
    btn.textContent = o.label;
    btn.addEventListener('click',()=>{
      selOcc = selOcc===o.id ? null : o.id;
      if (selOcc) {
        selWrap   = WRAPS.find(w=>w.id===o.wrap)    || WRAPS[0];
        selRibbon = RIBBONS.find(r=>r.id===o.ribbon) || RIBBONS[0];
      }
      renderOccasions(); renderWrapPicker(); renderRibbonPicker(); updateAll();
    });
    el.querySelector('.occ-tags').appendChild(btn);
  });
}

// ── Render: wrap picker ────────────────────────────────────
function renderWrapPicker() {
  const el = document.getElementById('wrapPickerWrap');
  if (!el) return;
  el.innerHTML = `<div class="option-label">Wrapping Paper</div><div class="swatch-row"></div>`;
  const row = el.querySelector('.swatch-row');
  WRAPS.forEach(w=>{
    const btn = document.createElement('button');
    btn.className = 'swatch-btn'+(selWrap.id===w.id?' sel':'');
    btn.title = `${w.name} (+${fmt(w.priceINR)})`;
    btn.style.background = w.fill;
    btn.style.border = `2.5px solid ${selWrap.id===w.id?w.stroke:'transparent'}`;
    btn.style.boxShadow = selWrap.id===w.id?`0 0 0 2.5px ${w.stroke}55`:'0 1px 5px rgba(0,0,0,.12)';
    if(w.id==='black') btn.innerHTML=`<span style="color:#e0d0d8;font-size:9px;pointer-events:none">■</span>`;
    btn.addEventListener('click',()=>{ selWrap=w; renderWrapPicker(); updateAll(); });
    row.appendChild(btn);
  });
  const lbl = document.createElement('span');
  lbl.className='swatch-label';
  lbl.textContent=`${selWrap.name}  (+${fmt(selWrap.priceINR)})`;
  row.appendChild(lbl);
}

// ── Render: ribbon picker ──────────────────────────────────
function renderRibbonPicker() {
  const el = document.getElementById('ribbonPickerWrap');
  if (!el) return;
  el.innerHTML = `<div class="option-label">Ribbon</div><div class="swatch-row"></div>`;
  const row = el.querySelector('.swatch-row');
  RIBBONS.forEach(r=>{
    const btn = document.createElement('button');
    btn.className = 'swatch-btn'+(selRibbon.id===r.id?' sel':'');
    btn.title = `${r.name} (+${fmt(r.priceINR)})`;
    btn.style.background = r.color;
    btn.style.border = `2.5px solid ${selRibbon.id===r.id?'rgba(0,0,0,.35)':'transparent'}`;
    btn.style.boxShadow = selRibbon.id===r.id?`0 0 0 2.5px ${r.color}66`:'0 1px 5px rgba(0,0,0,.14)';
    btn.addEventListener('click',()=>{ selRibbon=r; renderRibbonPicker(); updateAll(); });
    row.appendChild(btn);
  });
  const lbl=document.createElement('span');
  lbl.className='swatch-label';
  lbl.textContent=`${selRibbon.name}  (+${fmt(selRibbon.priceINR)})`;
  row.appendChild(lbl);
}

// ── Render: add-ons ────────────────────────────────────────
function renderAddons() {
  const el = document.getElementById('addonWrap');
  if (!el) return;
  el.innerHTML=`<div class="option-label">Premium Add-ons</div><div class="addon-grid"></div>`;
  const grid=el.querySelector('.addon-grid');
  ADDONS.forEach(a=>{
    const lbl=document.createElement('label');
    lbl.className='addon-item'+(selAddons.has(a.id)?' selected':'');
    lbl.innerHTML=`<input type="checkbox" ${selAddons.has(a.id)?'checked':''}>
      <span class="addon-emoji">${a.emoji}</span>
      <span class="addon-name">${a.name}</span>
      <span class="addon-price">+${fmt(a.priceINR)}</span>`;
    lbl.querySelector('input').addEventListener('change',e=>{
      e.target.checked ? selAddons.add(a.id) : selAddons.delete(a.id);
      renderAddons(); updateAll();
    });
    grid.appendChild(lbl);
  });
}

// ── Render: price breakdown ────────────────────────────────
function renderBreakdown() {
  const el=document.getElementById('priceBreakdown');
  if (!el) return;
  if (totalStems()===0 && selAddons.size===0) { el.innerHTML=''; return; }
  let h=`<div class="breakdown-card"><div class="breakdown-title">Price Breakdown</div>`;
  if(totalStems()>0){
    h+=`<div class="bd-section">Flowers</div>`;
    FLOWERS.forEach(f=>{ if(counts[f.id]>0) h+=`<div class="bd-row"><span>${f.emoji} ${f.name} ×${counts[f.id]}</span><span>${fmt(f.priceINR*counts[f.id])}</span></div>`; });
  }
  h+=`<div class="bd-section">Packaging</div>
    <div class="bd-row"><span>Wrap · ${selWrap.name}</span><span>${fmt(selWrap.priceINR)}</span></div>
    <div class="bd-row"><span>Ribbon · ${selRibbon.name}</span><span>${fmt(selRibbon.priceINR)}</span></div>`;
  if(selAddons.size>0){
    h+=`<div class="bd-section">Add-ons</div>`;
    selAddons.forEach(id=>{ const a=ADDONS.find(x=>x.id===id); if(a) h+=`<div class="bd-row"><span>${a.emoji} ${a.name}</span><span>${fmt(a.priceINR)}</span></div>`; });
  }
  h+=`<div class="bd-row"><span>🚚 Delivery</span><span>${fmt(DELIVERY_INR)}</span></div>
    <div class="bd-total"><span>Total</span><span>${fmt(grandTotalINR())}</span></div></div>`;
  el.innerHTML=h;
}

// ── Render: delivery estimate ──────────────────────────────
function renderDelivery() {
  const el=document.getElementById('deliveryBox');
  if (!el) return;
  if (totalStems()===0){el.innerHTML='';return;}
  const now=new Date(), next=new Date(now);
  next.setDate(next.getDate()+(now.getHours()<18?1:2));
  const fd=d=>d.toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'});
  el.innerHTML=`<div class="delivery-box">🚚 Order now → Delivered by <strong>${fd(next)}</strong></div>`;
}

// ── Flying flower animation ────────────────────────────────
function flyFlower(btn, flower) {
  const bR=btn.getBoundingClientRect(), vR=visualBouq.getBoundingClientRect();
  const el=document.createElement('div');
  el.style.cssText=`position:fixed;left:${bR.left+bR.width/2}px;top:${bR.top+bR.height/2}px;
    width:36px;height:36px;border-radius:50%;background:${flower.bg};
    display:flex;align-items:center;justify-content:center;font-size:20px;
    z-index:300;pointer-events:none;transform:translate(-50%,-50%);
    box-shadow:0 4px 12px rgba(0,0,0,.18);transition:none;`;
  el.textContent=flower.emoji;
  document.body.appendChild(el);
  void el.offsetWidth;
  const tx=(vR.left+vR.width/2)-(bR.left+bR.width/2);
  const ty=(vR.top+vR.height/2)-(bR.top+bR.height/2);
  el.style.transition='transform 520ms cubic-bezier(.2,.9,.2,1),opacity 440ms ease';
  el.style.transform=`translate(calc(-50% + ${tx}px),calc(-50% + ${ty}px)) scale(0.4)`;
  el.style.opacity='0.85';
  setTimeout(()=>{el.style.opacity='0';el.style.transform=`translate(calc(-50% + ${tx}px),calc(-50% + ${ty}px)) scale(0.1)`;},460);
  setTimeout(()=>el.remove(),950);
}

// ── Main update ────────────────────────────────────────────
function updateAll() {
  FLOWERS.forEach(f=>{
    const q=flowerList.querySelector(`[data-qty="${f.id}"]`);
    const p=flowerList.querySelector(`.cplus[data-id="${f.id}"]`);
    const m=flowerList.querySelector(`.cminus[data-id="${f.id}"]`);
    const r=flowerList.querySelector(`.flower-row[data-id="${f.id}"]`);
    if(q) q.textContent=counts[f.id];
    if(p) p.disabled=totalStems()>=HARD_LIMIT;
    if(m) m.disabled=counts[f.id]===0;
    if(r) r.classList.toggle('active',counts[f.id]>0);
  });

  previewChips.innerHTML='';
  FLOWERS.forEach(f=>{
    if(!counts[f.id]) return;
    const chip=document.createElement('div');
    chip.className='chip';
    chip.innerHTML=`<span style="font-size:16px">${f.emoji}</span> ${f.name} ×${counts[f.id]} <span style="margin-left:6px;opacity:.55">✕</span>`;
    chip.addEventListener('click',()=>{
      if(counts[f.id]>0){
        counts[f.id]--;
        for(let i=stems.length-1;i>=0;i--){if(stems[i].id===f.id){stems.splice(i,1);break;}}
        updateAll();
      }
    });
    previewChips.appendChild(chip);
  });

  stemCountEl.textContent=totalStems()+' stems';
  totalPriceEl.textContent=fmt(grandTotalINR());
  visualBouq.innerHTML=buildSVG();
  softWarn.style.display=(totalStems()>=SOFT_LIMIT&&totalStems()<HARD_LIMIT)?'block':'none';
  hardWarn.style.display=(totalStems()>=HARD_LIMIT)?'block':'none';
  renderBreakdown();
  renderDelivery();
}

// ── Currency selector ──────────────────────────────────────
function initCurrency() {
  const sel=document.getElementById('currencySelect');
  if(!sel) return;
  sel.value=activeCurrency;
  sel.addEventListener('change',()=>{
    activeCurrency=sel.value;
    localStorage.setItem('pp-currency',activeCurrency);
    document.querySelectorAll('[data-fprice]').forEach(el=>{
      const f=FLOWERS.find(x=>x.id===el.dataset.fprice);
      if(f) el.textContent=fmt(f.priceINR)+' / stem';
    });
    document.querySelectorAll('[data-shop-price]').forEach(el=>{
      el.textContent='From '+fmt(parseInt(el.dataset.shopPrice));
    });
    renderWrapPicker(); renderRibbonPicker(); renderAddons(); renderOccasions(); updateAll();
  });
}

// ── WhatsApp order ─────────────────────────────────────────
requestBtn.addEventListener('click',()=>{
  if(totalStems()===0){showToast('Please add some flowers first! 🌸');return;}
  const lines=FLOWERS.filter(f=>counts[f.id]>0).map(f=>`${f.emoji} ${f.name} ×${counts[f.id]}`).join('\n');
  const addons=[...selAddons].map(id=>ADDONS.find(x=>x.id===id)?.name).filter(Boolean).join(', ');
  const occ=selOcc?OCCASIONS.find(x=>x.id===selOcc)?.label:'';
  const msg=[
    "Hello! I'd like to order a custom bouquet from Petals & Ribbonss 🌸",
    '',lines,
    `\nWrap: ${selWrap.name}\nRibbon: ${selRibbon.name}`,
    addons?`Add-ons: ${addons}`:'',
    occ?`Occasion: ${occ}`:'',
    `\nTotal (incl. delivery): ${fmt(grandTotalINR())}`,
    '\nName:\nAddress:\nDelivery date:',
  ].filter(Boolean).join('\n');
  window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank','noopener');
});

// ── Contact form: Formspree + WhatsApp fallback ────────────
document.getElementById('contactForm').addEventListener('submit', async e=>{
  e.preventDefault();
  const form=e.target;
  const submitBtn=document.getElementById('submitBtn');
  const name   =String(form.name.value   ||'').replace(/<[^>]*>/g,'').trim();
  const email  =String(form.email.value  ||'').replace(/<[^>]*>/g,'').trim();
  const phone  =String(form.phone?.value ||'').replace(/<[^>]*>/g,'').trim();
  const message=String(form.message.value||'').replace(/<[^>]*>/g,'').trim();
  const rf=document.getElementById('replyToField');
  if(rf) rf.value=email;

  submitBtn.textContent='Sending…';
  submitBtn.disabled=true;

  try {
    const res=await fetch(form.action,{method:'POST',body:new FormData(form),headers:{'Accept':'application/json'}});
    if(res.ok){
      submitBtn.textContent='✅ Sent!';
      showToast(`Thanks ${name||'friend'}! Aru will get back to you soon 🌸`);
      form.reset();
      setTimeout(()=>{submitBtn.textContent='📧 Send Message';submitBtn.disabled=false;},3000);
    } else { throw new Error('failed'); }
  } catch {
    submitBtn.textContent='📧 Send Message';
    submitBtn.disabled=false;
    const text=[`Hello! Message from website 🌸`,name?`Name: ${name}`:'',phone?`Phone: ${phone}`:'',message?`\n${message}`:''].filter(Boolean).join('\n');
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`, '_blank','noopener');
  }
});

// ── Toast ──────────────────────────────────────────────────
function showToast(msg){
  const t=document.createElement('div');
  t.textContent=msg;
  t.style.cssText=`position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(0);
    background:#1a1a1a;color:#fff;padding:14px 22px;border-radius:12px;
    font-size:14px;font-weight:600;z-index:999;
    box-shadow:0 8px 28px rgba(0,0,0,.28);max-width:90vw;text-align:center;
    transition:opacity .4s;`;
  document.body.appendChild(t);
  setTimeout(()=>{t.style.opacity='0';setTimeout(()=>t.remove(),400);},4000);
}

// ── Theme ──────────────────────────────────────────────────
const themeToggle=document.getElementById('themeToggle');
const mediaDark=window.matchMedia('(prefers-color-scheme: dark)');

function setDataTheme(v){
  document.documentElement.setAttribute('data-theme',v);
  document.querySelectorAll('.logo-img').forEach(img=>{
    img.src=v==='dark'?img.dataset.darkSrc:img.dataset.lightSrc;
  });
}
function applyTheme(t){
  localStorage.setItem('pp-theme',t);
  setDataTheme(t==='system'?(mediaDark.matches?'dark':'light'):t);
  themeToggle.querySelectorAll('button').forEach(b=>
    b.style.opacity=(localStorage.getItem('pp-theme')===b.dataset.theme)?'1':'0.6');
}
mediaDark.addEventListener('change',()=>{
  if((localStorage.getItem('pp-theme')||'system')==='system')
    setDataTheme(mediaDark.matches?'dark':'light');
});
(()=>{
  const saved=localStorage.getItem('pp-theme')||'system';
  setDataTheme(saved==='system'?(mediaDark.matches?'dark':'light'):saved);
  themeToggle.querySelectorAll('button').forEach(b=>b.style.opacity=(saved===b.dataset.theme)?'1':'0.6');
})();
themeToggle.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>applyTheme(b.dataset.theme)));

// ── Init ───────────────────────────────────────────────────
renderFlowers();
renderOccasions();
renderWrapPicker();
renderRibbonPicker();
renderAddons();
initCurrency();
updateAll();

// ── Misc ───────────────────────────────────────────────────
const io=new IntersectionObserver(entries=>
  entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target);}}),
  {threshold:0.12}
);
document.querySelectorAll('.fade-in').forEach(el=>io.observe(el));
document.getElementById('year').textContent=new Date().getFullYear();
document.querySelectorAll('a[href^="#"]').forEach(a=>
  a.addEventListener('click',ev=>{
    const t=a.getAttribute('href');
    if(t.startsWith('#')){ev.preventDefault();document.querySelector(t)?.scrollIntoView({behavior:'smooth'});}
  })
);
