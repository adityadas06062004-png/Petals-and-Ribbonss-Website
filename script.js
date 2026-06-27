    // Basic state & data
    const flowers = [
      {id:'roses',    name:'Roses',         emoji:'🌹', price:4,   size:19, bg:'#FFE4E8'},
      {id:'tulips',   name:'Tulips',        emoji:'🌷', price:3,   size:16, bg:'#FFDAF0'},
      {id:'sun',      name:'Sunflowers',    emoji:'🌻', price:3.5, size:22, bg:'#FFF8C4'},
      {id:'lilies',   name:'Lilies',        emoji:'🌸', price:4,   size:17, bg:'#FFE0F4'},
      {id:'baby',     name:"Baby's Breath", emoji:'🤍', price:1.5, size:11, bg:'#EEEAFF'},
      {id:'peony',    name:'Peonies',       emoji:'🩷', price:5,   size:21, bg:'#FFD6E2'},
      {id:'lavender', name:'Lavender',      emoji:'💜', price:2,   size:14, bg:'#EDE0FF'}
    ];

    const softLimit = 10;
    const hardLimit = 15;
    const state = flowers.reduce((acc,f)=>{acc[f.id]=0;return acc},{});

    // Stable insertion-ordered stems list (for fibonacci positioning & React-like keys)
    let stemsList = []; // [{id, uid}]

    // Golden angle for Fibonacci spiral
    const GOLDEN_ANGLE = 2.39996323;

    function getFibPositions(n) {
      return Array.from({length: n}, (_, i) => ({
        x: 140 + 15 * Math.sqrt(i) * Math.cos(i * GOLDEN_ANGLE),
        y: 126 + 15 * Math.sqrt(i) * Math.sin(i * GOLDEN_ANGLE) * 0.82
      }));
    }

    // DOM refs
    const flowerList    = document.getElementById('flowerList');
    const previewChips  = document.getElementById('previewChips');
    const visualBouquet = document.getElementById('visualBouquet');
    const stemCount     = document.getElementById('stemCount');
    const totalPrice    = document.getElementById('totalPrice');
    const softWarning   = document.getElementById('softWarning');
    const hardWarning   = document.getElementById('hardWarning');
    const requestBtn    = document.getElementById('requestBtn');

    // render flower controls
    function renderFlowers(){
      flowerList.innerHTML = '';
      flowers.forEach(f => {
        const row = document.createElement('div');
        row.className = 'flower-row';

        const info = document.createElement('div');
        info.className = 'flower-info';

        const emoji = document.createElement('div');
        emoji.textContent = f.emoji;
        emoji.style.fontSize = '22px';

        const title = document.createElement('div');
        title.innerHTML = `<div style="font-weight:700">${f.name}</div><div style="font-size:13px;color:var(--muted)">$${f.price.toFixed(2)} / stem</div>`;

        info.appendChild(emoji);
        info.appendChild(title);

        const controls = document.createElement('div');
        controls.className = 'controls';

        const minus = document.createElement('button');
        minus.textContent = '−';
        minus.className = 'btn';
        minus.style.padding = '6px 10px';
        minus.setAttribute('aria-label', `Remove one ${f.name}`);

        const qty = document.createElement('div');
        qty.className = 'qty';
        qty.textContent = state[f.id] || 0;
        qty.style.minWidth = '24px';
        qty.style.textAlign = 'center';

        const plus = document.createElement('button');
        plus.textContent = '+';
        plus.className = 'btn';
        plus.style.padding = '6px 10px';
        plus.setAttribute('aria-label', `Add one ${f.name}`);

        minus.addEventListener('click', () => {
          if(state[f.id] > 0){
            state[f.id]--;
            // Remove last occurrence of this flower from stemsList
            for(let i = stemsList.length - 1; i >= 0; i--){
              if(stemsList[i].id === f.id){ stemsList.splice(i, 1); break; }
            }
            updateAll();
          }
        });

        plus.addEventListener('click', () => {
          if(totalStems() < hardLimit){
            state[f.id]++;
            stemsList.push({ id: f.id, uid: f.id + '-' + Date.now() + Math.random().toString(36).slice(2) });
            updateAll();
          } else {
            updateAll();
          }
        });

        controls.appendChild(minus);
        controls.appendChild(qty);
        controls.appendChild(plus);

        row.appendChild(info);
        row.appendChild(controls);
        flowerList.appendChild(row);
      });
    }

    function totalStems(){ return stemsList.length; }
    function calcPrice(){
      return Object.entries(state).reduce((sum, [id, count]) => {
        const f = flowers.find(x => x.id === id);
        return sum + (f.price * count);
      }, 0);
    }

    // Build the SVG bouquet preview
    function buildBouquetSVG(wrap) {
      const n = stemsList.length;
      const pos = getFibPositions(n);
      const W = wrap || { fill: '#F9DEE2', ribbon: '#D4909E' };

      let svg = `<svg viewBox="0 0 280 310" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:260px;display:block;margin:0 auto" role="img" aria-label="Bouquet preview with ${n} stems">`;

      // Animated style
      svg += `<defs>
        <filter id="bshadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="2" flood-opacity="0.15"/>
        </filter>
        <style>
          @keyframes bloomIn {
            0%   { opacity:0; transform:scale(0.1) rotate(-30deg); }
            65%  { opacity:1; transform:scale(1.12) rotate(5deg); }
            100% { opacity:1; transform:scale(1) rotate(0deg); }
          }
          .bfl { animation: bloomIn 0.45s cubic-bezier(.34,1.56,.64,1) both; }
        </style>
      </defs>`;

      // Stems
      svg += `<g opacity="0.38">`;
      pos.forEach(p => {
        svg += `<line x1="${p.x.toFixed(1)}" y1="${p.y.toFixed(1)}" x2="140" y2="231" stroke="#5D8640" stroke-width="1.4"/>`;
      });
      svg += `</g>`;

      // Paper wrap
      svg += `<path d="M 83 196 L 47 308 L 140 296 L 233 308 L 197 196 Z" fill="${W.fill}" stroke="${W.ribbon}" stroke-width="1.2"/>`;
      svg += `<path d="M 83 196 Q 140 189 197 196" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="2.2"/>`;
      svg += `<line x1="91" y1="210" x2="58" y2="296" stroke="${W.ribbon}" stroke-width=".5" opacity=".35"/>`;
      svg += `<line x1="189" y1="210" x2="222" y2="296" stroke="${W.ribbon}" stroke-width=".5" opacity=".35"/>`;

      // Ribbon bow
      svg += `<g transform="translate(140,202)">
        <path d="M -3 3 L -23 39 L -15 42 L 0 7" fill="${W.ribbon}" opacity=".6"/>
        <path d="M 3 3 L 23 39 L 15 42 L 0 7" fill="${W.ribbon}" opacity=".6"/>
        <path d="M 0 0 Q -27 -15 -29 -2 Q -31 9 -14 10 Q -5 10 0 0" fill="${W.ribbon}"/>
        <path d="M 0 0 Q 27 -15 29 -2 Q 31 9 14 10 Q 5 10 0 0" fill="${W.ribbon}"/>
        <path d="M -2 -1 Q -15 -9 -17 -3" fill="none" stroke="rgba(255,255,255,.3)" stroke-width="1.5"/>
        <path d="M 2 -1 Q 15 -9 17 -3" fill="none" stroke="rgba(255,255,255,.3)" stroke-width="1.5"/>
        <ellipse cx="0" cy="2.5" rx="5.5" ry="4.5" fill="${W.ribbon}"/>
      </g>`;

      // Flower nodes (stable UIDs → animations only fire for newly added flowers)
      stemsList.forEach((stem, i) => {
        const f = flowers.find(x => x.id === stem.id);
        const p = pos[i];
        if(!f || !p) return;
        svg += `<g class="bfl" transform="translate(${p.x.toFixed(1)},${p.y.toFixed(1)})"
          filter="url(#bshadow)"
          data-uid="${stem.uid}"
          style="transform-origin:${p.x.toFixed(1)}px ${p.y.toFixed(1)}px">
          <circle r="${f.size + 2}" fill="${f.bg}" opacity=".6"/>
          <circle r="${f.size}" fill="${f.bg}" opacity=".95"/>
          <text text-anchor="middle" dominant-baseline="central" font-size="${(f.size * 1.22).toFixed(1)}"
            style="user-select:none;pointer-events:none">${f.emoji}</text>
        </g>`;
      });

      // Empty state
      if(n === 0){
        svg += `<text x="140" y="108" text-anchor="middle" font-size="12" fill="#C0A0A8" font-family="Poppins,sans-serif">Add flowers to see your bouquet ✨</text>`;
        svg += `<text x="140" y="148" text-anchor="middle" font-size="40">💐</text>`;
      }

      svg += `</svg>`;
      return svg;
    }

    // Wrap colour options
    const wrapOptions = [
      { name: 'Blush',    fill: '#F9DEE2', ribbon: '#D4909E' },
      { name: 'Ivory',    fill: '#FFF8F0', ribbon: '#C8A882' },
      { name: 'Lavender', fill: '#EDE0FF', ribbon: '#9B72CF' },
      { name: 'Mint',     fill: '#E0F7F0', ribbon: '#5BAF91' },
      { name: 'Cream',    fill: '#FFF9E3', ribbon: '#C4A84F' },
    ];
    let currentWrap = wrapOptions[0];
    let currentOccasion = '';

    // Render wrap picker
    function renderWrapPicker(){
      const picker = document.getElementById('wrapPicker');
      if(!picker) return;
      picker.innerHTML = '';
      wrapOptions.forEach((w, i) => {
        const swatch = document.createElement('button');
        swatch.title = w.name;
        swatch.setAttribute('aria-label', w.name + ' wrap');
        swatch.style.cssText = `width:28px;height:28px;border-radius:50%;border:2px solid ${i===0?'#888':'transparent'};background:${w.fill};cursor:pointer;margin:2px;transition:border .2s;`;
        swatch.addEventListener('click', () => {
          currentWrap = w;
          picker.querySelectorAll('button').forEach(b => b.style.border = '2px solid transparent');
          swatch.style.border = '2px solid #888';
          document.getElementById('wrapLabel').textContent = w.name;
          updateAll();
        });
        picker.appendChild(swatch);
      });
    }

    // Render occasion picker
    function renderOccasionPicker(){
      const container = document.getElementById('occasionPicker');
      if(!container) return;
      const occasions = ['Birthday 🎂','Anniversary 💕','Just Because ✨','Graduation 🎓','Thank You 🙏'];
      container.innerHTML = '';
      occasions.forEach(occ => {
        const btn = document.createElement('button');
        btn.textContent = occ;
        btn.style.cssText = 'margin:4px;padding:6px 12px;border-radius:20px;border:1.5px solid var(--accent);background:transparent;color:var(--text);cursor:pointer;font-size:13px;transition:all .2s;';
        btn.addEventListener('click', () => {
          currentOccasion = (currentOccasion === occ) ? '' : occ;
          container.querySelectorAll('button').forEach(b => {
            b.style.background = 'transparent';
            b.style.color = 'var(--text)';
          });
          if(currentOccasion){
            btn.style.background = 'var(--accent)';
            btn.style.color = '#fff';
          }
        });
        container.appendChild(btn);
      });
    }

    function updateAll(){
      // update qty displays
      [...flowerList.children].forEach((row, idx) => {
        const qty    = row.querySelector('.qty');
        const buttons = row.querySelectorAll('button');
        const plus   = buttons[buttons.length - 1];
        qty.textContent = state[flowers[idx].id];
        plus.disabled = totalStems() >= hardLimit;
      });

      // preview chips
      previewChips.innerHTML = '';
      Object.entries(state).forEach(([id, count]) => {
        if(count > 0){
          const f = flowers.find(x => x.id === id);
          const chip = document.createElement('div');
          chip.className = 'chip';
          chip.title = 'Click to remove one';
          chip.innerHTML = `<span style="font-size:16px">${f.emoji}</span> ${f.name} x ${count} <span style="margin-left:8px;opacity:0.7">✕</span>`;
          chip.addEventListener('click', () => {
            if(state[id] > 0){
              state[id]--;
              for(let i = stemsList.length - 1; i >= 0; i--){
                if(stemsList[i].id === id){ stemsList.splice(i, 1); break; }
              }
              updateAll();
            }
          });
          previewChips.appendChild(chip);
        }
      });

      stemCount.textContent = totalStems() + ' stems';
      totalPrice.textContent = '$' + calcPrice().toFixed(2);

      // SVG bouquet preview
      visualBouquet.innerHTML = buildBouquetSVG(currentWrap);

      // warnings
      if(totalStems() >= softLimit && totalStems() < hardLimit){ softWarning.style.display = 'block'; } else { softWarning.style.display = 'none'; }
      if(totalStems() >= hardLimit){ hardWarning.style.display = 'block'; } else { hardWarning.style.display = 'none'; }
    }

    renderFlowers(); renderWrapPicker(); renderOccasionPicker(); updateAll();

    function escapeForText(s){ return String(s).replace(/\n/g,'\n').replace(/%/g,'%25').replace(/</g,'').replace(/>/g,''); }
    const WA_NUMBER = '+918637505579';
    requestBtn.addEventListener('click', () => {
      const itemsArr = Object.entries(state).filter(([,c]) => c > 0).map(([id, count]) => {
        const f = flowers.find(x => x.id === id);
        return `${f.name} x ${count}`;
      });
      if(itemsArr.length === 0){ alert('Please add some flowers first.'); return; }
      const items = itemsArr.join('\n');
      const price = calcPrice().toFixed(2);
      const occasionLine = currentOccasion ? `\nOccasion: ${currentOccasion}` : '';
      const wrapLine = `\nWrap colour: ${currentWrap.name}`;
      const preMsg = `Hello! I'd like to request a custom bouquet:\n${items}${occasionLine}${wrapLine}\n\nEstimated Total: $${price}\n\nMy Name:\nAddress:\nRequested delivery date:`;
      const text = encodeURIComponent(escapeForText(preMsg));
      const wa = `https://wa.me/${WA_NUMBER}?text=${text}`;
      window.open(wa, '_blank', 'noopener');
    });

    // Theme toggle logic — support system preference changes and persistence
    const themeToggle = document.getElementById('themeToggle');
    const root = document.documentElement;
    const mediaDark = window.matchMedia('(prefers-color-scheme: dark)');

    function setDataTheme(value){
      document.documentElement.setAttribute('data-theme', value);
      updateLogos(value);
    }

    function updateLogos(theme){
      document.querySelectorAll('.logo-img').forEach(img => {
        img.src = theme === 'dark' ? img.dataset.darkSrc : img.dataset.lightSrc;
      });
    }

    function applyTheme(t){
      if(t === 'system'){
        localStorage.setItem('pp-theme','system');
        setDataTheme(mediaDark.matches ? 'dark' : 'light');
      } else if(t === 'dark' || t === 'light'){
        localStorage.setItem('pp-theme', t);
        setDataTheme(t);
      }
      highlightToggle();
    }

    function highlightToggle(){
      themeToggle.querySelectorAll('button').forEach(b => {
        b.style.opacity = (localStorage.getItem('pp-theme') === b.dataset.theme || (localStorage.getItem('pp-theme') === 'system' && b.dataset.theme === 'system')) ? '1' : '0.6';
      });
    }

    mediaDark.addEventListener('change', () => {
      if(localStorage.getItem('pp-theme') === 'system' || !localStorage.getItem('pp-theme')){
        setDataTheme(mediaDark.matches ? 'dark' : 'light');
      }
    });

    (function initTheme(){
      const saved = localStorage.getItem('pp-theme') || 'system';
      if(saved === 'system'){
        setDataTheme(mediaDark.matches ? 'dark' : 'light');
      } else {
        setDataTheme(saved);
      }
      highlightToggle();
    })();

    themeToggle.querySelectorAll('button').forEach(btn => btn.addEventListener('click', () => { applyTheme(btn.dataset.theme) }));

    // Smooth reveal on scroll
    const io = new IntersectionObserver((entries) => { entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('visible'); io.unobserve(e.target); } }) }, {threshold: 0.12});
    document.querySelectorAll('.fade-in').forEach(el => io.observe(el));

    // year
    document.getElementById('year').textContent = new Date().getFullYear();

    // Contact form simple handler with client-side sanitization
    function sanitizeInput(s){ return String(s).replace(/<[^>]*>?/gm,'').trim(); }
    document.getElementById('contactForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const form = e.target;
      const name = sanitizeInput(form.name.value || '');
      alert(`Thanks ${name || 'friend'}! Message received (demo).`);
      form.reset();
    });

    // smooth nav
    document.querySelectorAll('a[href^="#"]').forEach(a => { a.addEventListener('click', (ev) => { const href = a.getAttribute('href'); if(href.startsWith('#')){ ev.preventDefault(); document.querySelector(href).scrollIntoView({behavior:'smooth'}); } }); });
