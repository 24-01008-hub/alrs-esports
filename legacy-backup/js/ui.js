/* ==========================================================================
   ALRS · ui.js — icons, toasts, modal, helpers, procedural QR
   ========================================================================== */
(function () {
  'use strict';

  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  /* ------------------------------------------------------------- icons */
  const P = {
    check: '<path d="m4 12 5.5 5.5L20 7"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.4 8.3-8 9-4.6-.7-8-4-8-9V6z"/>',
    trophy: '<path d="M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v1a4 4 0 0 0 4 4M17 6h3v1a4 4 0 0 1-4 4M9 20h6M12 14v6"/>',
    users: '<path d="M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M22 20v-2a4 4 0 0 0-3-3.9M16.5 3.6a4 4 0 0 1 0 7.4"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    ticket: '<path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1 0 4 2 2 0 0 1-2 2H6a2 2 0 0 1-2-2 2 2 0 0 0 0-4 2 2 0 0 1 0-4"/><path d="M12 7v10"/>',
    star: '<path d="m12 3 2.7 5.6 6.3.9-4.5 4.4 1 6.1-5.5-3-5.5 3 1-6.1L3 9.5l6.3-.9z"/>',
    spark: '<path d="M12 3v6M12 15v6M3 12h6M15 12h6M6.3 6.3l4.2 4.2M13.5 13.5l4.2 4.2M17.7 6.3l-4.2 4.2M10.5 13.5l-4.2 4.2"/>',
    wallet: '<rect x="3" y="6" width="18" height="13" rx="3"/><path d="M3 10h18M16.5 14.5h.01"/>',
    lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    chevron: '<path d="m6 9 6 6 6-6"/>',
    external: '<path d="M14 4h6v6M20 4 10 14M18 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    bolt: '<path d="M13 2 4 14h6l-1 8 9-12h-6z"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.4"/>',
    gamepad: '<rect x="2" y="7" width="20" height="11" rx="5"/><path d="M7 11v3M5.5 12.5h3M15.5 12h.01M18 14h.01"/>',
    heart: '<path d="M12 20s-7-4.4-7-9.3A4.2 4.2 0 0 1 12 7a4.2 4.2 0 0 1 7 3.7C19 15.6 12 20 12 20z"/>',
    chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>',
    id: '<rect x="3" y="5" width="18" height="14" rx="3"/><circle cx="9" cy="11" r="2"/><path d="M5.5 16.5c.7-1.6 2-2.4 3.5-2.4s2.8.8 3.5 2.4M15 10h4M15 13.5h3"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 2"/>',
    pin: '<path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    play: '<path d="M8 5.5 19 12 8 18.5z"/>',
    swords: '<path d="M4 4l7 7M4 4v4l4 4M20 4l-7 7M20 4v4l-4 4M4 20l6-6M20 20l-6-6"/>',
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H20"/>',
    crown: '<path d="M4 18h16M4 18 3 8l5 4 4-6 4 6 5-4-1 10"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-2.6-6.4"/><path d="M21 3v6h-6"/>'
  };

  function ico(name, size, cls) {
    const d = P[name] || P.check;
    return `<svg class="ico ${cls || ''}" width="${size || 18}" height="${size || 18}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  }

  /* ----------------------------------------------------------- toasts */
  function toast(title, msg, kind) {
    const wrap = document.getElementById('toasts');
    if (!wrap) return;
    const el = document.createElement('div');
    el.className = 'toast' + (kind ? ' toast--' + kind : '');
    const glyph = kind === 'ok' ? '✓' : (kind === 'gold' ? '★' : '!');
    el.innerHTML =
      `<span class="toast__icon">${glyph}</span>
       <span class="toast__body"><strong>${esc(title)}</strong><span>${esc(msg || '')}</span></span>`;
    wrap.appendChild(el);
    const kill = () => { el.classList.add('is-out'); setTimeout(() => el.remove(), 320); };
    setTimeout(kill, 4200);
    el.addEventListener('click', kill);
  }

  /* ------------------------------------------------------------ modal */
  let lastFocus = null;

  function openModal(html, opts) {
    opts = opts || {};
    const root = document.getElementById('modalRoot');
    if (!root) return null;
    lastFocus = document.activeElement;
    root.innerHTML =
      `<div class="modal__scrim" data-close-modal></div>
       <div class="modal ${opts.size === 'sm' ? 'modal--sm' : ''}" role="dialog" aria-modal="true" aria-label="${esc(opts.label || 'Dialog')}">
         ${opts.title ? `<div class="modal__head">
            <div><h3>${esc(opts.title)}</h3>${opts.sub ? `<p class="mono muted" style="margin-top:5px">${esc(opts.sub)}</p>` : ''}</div>
            <button class="modal__close" data-close-modal aria-label="Close">✕</button>
          </div>` : ''}
         <div class="modal__body">${html}</div>
         ${opts.foot ? `<div class="modal__foot">${opts.foot}</div>` : ''}
       </div>`;
    root.classList.add('is-open');
    root.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
    const focusable = root.querySelector('input, select, textarea, button:not([data-close-modal])');
    if (focusable) setTimeout(() => focusable.focus(), 90);
    return root;
  }

  function closeModal() {
    const root = document.getElementById('modalRoot');
    if (!root) return;
    root.classList.remove('is-open');
    root.setAttribute('aria-hidden', 'true');
    root.innerHTML = '';
    document.body.classList.remove('no-scroll');
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) {} }
  }

  /* --------------------------------------------------- procedural QR */
  function qrSVG(seed, px) {
    const n = 21;
    let h = 2166136261;
    const str = String(seed || 'ALRS');
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    const rnd = () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 1000) / 1000; };

    const finder = (x, y) =>
      (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);

    let cells = '';
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        if (finder(x, y)) continue;
        if (rnd() > 0.52) cells += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
      }
    }
    const eye = (ox, oy) =>
      `<rect x="${ox}" y="${oy}" width="7" height="7" fill="none" stroke="currentColor" stroke-width="1"/>
       <rect x="${ox + 2}" y="${oy + 2}" width="3" height="3"/>`;

    return `<svg viewBox="0 0 ${n} ${n}" width="${px || 62}" height="${px || 62}" shape-rendering="crispEdges" role="img" aria-label="Membership verification code">
      <rect width="${n}" height="${n}" fill="#fff"/>
      <g fill="#0B0B12">${cells}${eye(0, 0)}${eye(n - 7, 0)}${eye(0, n - 7)}</g>
    </svg>`;
  }

  /* --------------------------------------------------------- helpers */
  function price(n) { return n === 0 ? 'Free' : '₱' + n.toLocaleString('en-PH'); }
  function memberCardHTML(m, opts) {
    opts = opts || {};
    const tiers = (window.ALRS && ALRS.tiers) || [];
    const t = tiers.find((x) => x.id === (m && m.tier)) || { name: 'Recruit' };
    const chipCls = m.tier === 'legend' || m.tier === 'strategos' ? 'tier-gold' : (m.tier === 'spartan' ? 'tier-red' : '');
    const joined = m.joined ? new Date(m.joined) : new Date();
    const valid = m.valid ? new Date(m.valid) : new Date();
    const fmt = (d) => d.toLocaleDateString('en-PH', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase();

    return `
    <div class="mcard ${opts.tilt ? 'tilt' : ''}" id="${opts.id || ''}">
      <span class="mcard__strip"></span>
      <div class="mcard__row">
        <div class="mcard__brand">
          <span class="brand__mark" style="--mark-shell:#fff">${(window.ALRS && ALRS.brand.logo) || ''}</span>
          <span><b>ALRS</b><span>RED SPARTANS ESPORTS</span></span>
        </div>
        <span class="mcard__tierchip ${chipCls}">${esc(t.name)}</span>
      </div>
      <div>
        <div class="mcard__name">${esc(m.name)}</div>
        <div class="mcard__id">${esc(m.id)}</div>
      </div>
      <div class="mcard__foot">
        <div class="mcard__meta">
          CAMPUS&nbsp;<b>BATSTATEU · ALANGILAN</b><br>
          VALID&nbsp;<b>${fmt(valid)}</b><br>
          DIV&nbsp;<b>${esc((m.division || 'OPEN').toUpperCase())}</b>
        </div>
        <span class="mcard__qr">${qrSVG(m.id, 62)}</span>
      </div>
    </div>`;
  }

  function benefitsOf(tierId, perks) {
    return (perks || []).filter((p) => p.on).map((p) => p.t);
  }

  window.UI = { esc, ico, toast, openModal, closeModal, qrSVG, price, memberCardHTML, benefitsOf };
})();
