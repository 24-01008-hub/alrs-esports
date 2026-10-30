/* ==========================================================================
   ALRS · effects.js
   1) moving esports background (perspective grid · embers · data streaks)
   2) interactive holographic 3D logo (drag / fling / keys · spins 360°)
   3) scroll reveal · counters · card glow · tilt · magnetic · cursor glow
   ========================================================================== */
(function () {
  'use strict';

  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  /* ================================================================
     1 · MOVING ESPORTS BACKGROUND
     ================================================================ */
  function initBackground() {
    const canvas = document.getElementById('fxCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let W = 0, H = 0, DPR = 1;
    let embers = [], streaks = [], pulses = [];
    let t = 0, running = !REDUCED;

    const rand = (a, b) => a + Math.random() * (b - a);

    function resize() {
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.floor(W * DPR);
      canvas.height = Math.floor(H * DPR);
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      seed();
    }

    function seed() {
      const density = clamp(W / 1400, 0.5, 1.6);
      embers = Array.from({ length: Math.round(70 * density) }, () => ({
        x: rand(0, W),
        y: rand(H * 0.15, H + 40),
        r: rand(0.7, 2.4),
        vy: rand(0.18, 0.85),
        drift: rand(-0.32, 0.32),
        phase: rand(0, Math.PI * 2),
        gold: Math.random() < 0.36,
        life: rand(0, 1)
      }));
      streaks = Array.from({ length: 7 }, () => makeStreak(true));
      pulses = [];
    }

    function makeStreak(init) {
      const fromLeft = Math.random() < 0.5;
      return {
        x: init ? rand(0, W) : (fromLeft ? -140 : W + 140),
        y: rand(H * 0.1, H * 0.78),
        len: rand(90, 260),
        vx: (fromLeft ? 1 : -1) * rand(5.5, 13),
        thick: rand(1, 2.2),
        life: 1,
        decay: rand(0.004, 0.011),
        gold: Math.random() < 0.4
      };
    }

    /* ---------------------------------------------- perspective grid */
    function drawGrid() {
      const horizon = H * 0.60;
      const vpX = W * 0.5;
      const floorH = H - horizon;
      if (floorH <= 0) return;

      ctx.save();

      /* horizon bloom */
      const hb = ctx.createLinearGradient(0, horizon - 90, 0, horizon + 60);
      hb.addColorStop(0, 'rgba(255,33,56,0)');
      hb.addColorStop(0.55, 'rgba(255,33,56,0.14)');
      hb.addColorStop(1, 'rgba(255,33,56,0)');
      ctx.fillStyle = hb;
      ctx.fillRect(0, horizon - 90, W, 150);

      /* horizon line */
      ctx.strokeStyle = 'rgba(255,33,56,0.55)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, horizon + 0.5);
      ctx.lineTo(W, horizon + 0.5);
      ctx.stroke();

      /* radial (vertical) rails */
      const rails = 26;
      const span = W * 2.4;
      for (let i = -rails; i <= rails; i++) {
        const bx = vpX + (i / rails) * span * 0.5;
        const fade = 1 - Math.abs(i) / (rails + 4);
        ctx.strokeStyle = `rgba(255,33,56,${(0.16 * fade).toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(vpX, horizon);
        ctx.lineTo(bx, H);
        ctx.stroke();
      }

      /* travelling cross-rails */
      const rows = 26;
      const offset = (t * 0.0055) % 1;
      for (let i = 0; i < rows; i++) {
        let p = (i + offset) / rows;
        const y = horizon + floorH * Math.pow(p, 3.1);
        if (y <= horizon + 1) continue;
        const a = 0.03 + p * 0.30;
        ctx.strokeStyle = i % 5 === 0
          ? `rgba(53,224,242,${(a * 0.75).toFixed(3)})`
          : `rgba(255,33,56,${a.toFixed(3)})`;
        ctx.lineWidth = i % 5 === 0 ? 1.1 : 1;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      ctx.restore();
    }

    /* ------------------------------------------------------- embers */
    function drawEmbers() {
      for (const e of embers) {
        e.y -= e.vy;
        e.x += e.drift + Math.sin(t * 0.014 + e.phase) * 0.34;
        if (e.y < -20) { e.y = H + rand(10, 80); e.x = rand(0, W); }

        const tw = 0.45 + 0.55 * Math.abs(Math.sin(t * 0.03 + e.phase));
        const col = e.gold ? '255,197,49' : '255,60,84';
        const g = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.r * 6);
        g.addColorStop(0, `rgba(${col},${(0.75 * tw).toFixed(3)})`);
        g.addColorStop(1, `rgba(${col},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r * 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(255,255,255,${(0.65 * tw).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    /* --------------------------------------------- data streaks */
    function drawStreaks() {
      for (let i = 0; i < streaks.length; i++) {
        const s = streaks[i];
        s.x += s.vx;
        s.life -= s.decay;
        if (s.life <= 0 || s.x < -320 || s.x > W + 320) { streaks[i] = makeStreak(false); continue; }

        const dir = Math.sign(s.vx);
        const col = s.gold ? '255,197,49' : '53,224,242';
        const grad = ctx.createLinearGradient(s.x, s.y, s.x - dir * s.len, s.y - s.len * 0.42);
        grad.addColorStop(0, `rgba(${col},${(0.75 * s.life).toFixed(3)})`);
        grad.addColorStop(1, `rgba(${col},0)`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = s.thick;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - dir * s.len, s.y - s.len * 0.42);
        ctx.stroke();

        ctx.fillStyle = `rgba(255,255,255,${(0.9 * s.life).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.thick * 0.9, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    /* ------------------------------------- occasional radar ping */
    function drawPings() {
      if (Math.random() < 0.011 && pulses.length < 4) {
        pulses.push({ x: rand(W * 0.1, W * 0.9), y: rand(H * 0.1, H * 0.7), r: 0, max: rand(90, 210), a: 0.6 });
      }
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.r += 1.7;
        p.a -= 0.009;
        if (p.a <= 0 || p.r > p.max) { pulses.splice(i, 1); continue; }
        ctx.strokeStyle = `rgba(53,224,242,${p.a.toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    function frame() {
      if (!running) return;
      t += 1;
      ctx.clearRect(0, 0, W, H);
      drawGrid();
      drawPings();
      drawEmbers();
      drawStreaks();
      requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) running = false;
      else if (!REDUCED) { running = true; requestAnimationFrame(frame); }
    });
    if (REDUCED) { drawGrid(); return; }
    requestAnimationFrame(frame);
  }

  /* ================================================================
     2 · HOLOGRAPHIC 3D LOGO
     ================================================================ */
  const SHADE_STOPS = [
    { t: 0.00, c: [58, 8, 18] },     // deep crimson (back)
    { t: 0.42, c: [150, 24, 44] },
    { t: 0.76, c: [214, 128, 142] },
    { t: 1.00, c: [238, 241, 248] }  // silver (front)
  ];

  function shadeAt(t) {
    t = clamp(t, 0, 1);
    for (let i = 1; i < SHADE_STOPS.length; i++) {
      const a = SHADE_STOPS[i - 1], b = SHADE_STOPS[i];
      if (t <= b.t) {
        const k = (t - a.t) / (b.t - a.t);
        return `rgb(${Math.round(lerp(a.c[0], b.c[0], k))},${Math.round(lerp(a.c[1], b.c[1], k))},${Math.round(lerp(a.c[2], b.c[2], k))})`;
      }
    }
    return 'rgb(238,241,248)';
  }

  function mountHolo(el) {
    if (el.dataset.mounted === '1') return;
    el.dataset.mounted = '1';

    const depth = parseFloat(el.dataset.depth || '46');
    const layers = parseInt(el.dataset.layers || '24', 10);
    el.style.setProperty('--depth', depth + 'px');
    el.tabIndex = 0;
    el.setAttribute('role', 'img');
    el.setAttribute('aria-label',
      'Interactive 3D Alangilan Red Spartans Esports logo. Drag, use arrow keys or fling to spin it 360 degrees.');

    const motes = Array.from({ length: 9 }, (_, i) => {
      const c = i % 3 === 0 ? '#FFC531' : (i % 3 === 1 ? '#35E0F2' : '#FF2138');
      return `<i class="holo3d__mote" style="--c:${c};--dx:${(Math.random() * 260 - 130).toFixed(0)}px;--rise:${-(140 + Math.random() * 200).toFixed(0)}px;--dur:${(5 + Math.random() * 6).toFixed(1)}s;--delay:${(i * 0.7).toFixed(1)}s"></i>`;
    }).join('');

    const extrusion = Array.from({ length: layers }, (_, k) => {
      const p = k / (layers - 1);               // 0 = back, 1 = front
      const z = -depth * (1 - p);
      return `<span class="holo3d__layer" style="--z:${z.toFixed(2)}px;--c:${shadeAt(p)}"></span>`;
    }).join('');

    el.innerHTML = `
      <span class="holo3d__halo"></span>
      <span class="holo3d__ring"></span>
      <span class="holo3d__ticks"></span>
      <div class="holo3d__stage">
        <div class="holo3d__obj">
          ${extrusion}
          <span class="holo3d__back"></span>
          <span class="holo3d__edge"></span>
          <span class="holo3d__face"></span>
          <span class="holo3d__light"></span>
          <span class="holo3d__fx holo3d__holo"></span>
          <span class="holo3d__fx holo3d__spec"></span>
          <span class="holo3d__fx holo3d__scan"></span>
        </div>
      </div>
      <span class="holo3d__base"></span>
      ${motes}
      <span class="holo3d__spin">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
          <path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 3v6h-6"/>
        </svg>
        Drag · spin 360°
      </span>
      <span class="holo3d__hud"><i></i> ALRS · HOLO-CORE v2 · <b class="holo3d__deg">0°</b></span>`;

    const obj = el.querySelector('.holo3d__obj');
    const degOut = el.querySelector('.holo3d__deg');

    let spin = 0, vel = 0, tilt = -6;
    let dragging = false, lastX = 0, lastY = 0, lastT = 0, moved = 0;
    let raf = 0, prev = performance.now();
    const AUTO = REDUCED ? 0 : 0.055;           // deg / ms idle drift

    function apply() {
      el.style.setProperty('--spin', spin.toFixed(2));
      el.style.setProperty('--tiltX', tilt.toFixed(2) + 'deg');
      if (degOut) degOut.textContent = Math.round(((spin % 360) + 360) % 360) + '°';
    }

    function loop(now) {
      const dt = Math.min(now - prev, 48);
      prev = now;
      if (!dragging) {
        if (Math.abs(vel) > 0.002) {
          spin += vel * dt;
          vel *= Math.pow(0.94, dt / 16.7);
          if (Math.abs(vel) < 0.004) vel = 0;
        } else {
          spin += AUTO * dt;
        }
        tilt = lerp(tilt, -6, 0.03);
      }
      apply();
      raf = requestAnimationFrame(loop);
    }

    /* -------- pointer drag / fling -------- */
    el.addEventListener('pointerdown', (e) => {
      dragging = true; moved = 0;
      lastX = e.clientX; lastY = e.clientY; lastT = performance.now();
      vel = 0;
      el.classList.add('is-dragging');
      el.setPointerCapture && el.setPointerCapture(e.pointerId);
    });

    el.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const now = performance.now();
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      const dt = Math.max(now - lastT, 8);
      moved += Math.abs(dx) + Math.abs(dy);

      spin += dx * 0.42;
      tilt = clamp(tilt - dy * 0.24, -34, 26);
      vel = (dx * 0.42) / dt;                     // deg per ms

      lastX = e.clientX; lastY = e.clientY; lastT = now;
      apply();
      if (moved > 6) e.preventDefault();
    });

    function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      el.classList.remove('is-dragging');
      if (Math.abs(vel) < 0.02) vel = 0;
      if (e && e.pointerId != null && el.releasePointerCapture) {
        try { el.releasePointerCapture(e.pointerId); } catch (_) {}
      }
    }
    el.addEventListener('pointerup', endDrag);
    el.addEventListener('pointercancel', endDrag);
    el.addEventListener('lostpointercapture', endDrag);
    el.addEventListener('dragstart', (e) => e.preventDefault());

    /* -------- keyboard -------- */
    el.addEventListener('keydown', (e) => {
      const k = e.key;
      if (k === 'ArrowLeft')       { spin -= 15; vel = -0.25; }
      else if (k === 'ArrowRight') { spin += 15; vel = 0.25; }
      else if (k === 'ArrowUp')    { tilt = clamp(tilt - 6, -34, 26); }
      else if (k === 'ArrowDown')  { tilt = clamp(tilt + 6, -34, 26); }
      else if (k === 'Home')       { spin = 0; vel = 0; }
      else if (k === ' ' || k === 'Enter') { vel = vel ? 0 : 0.62; }
      else return;
      e.preventDefault();
      apply();
    });

    apply();
    raf = requestAnimationFrame(loop);

    /* pause the loop when off-screen to save battery */
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting && !raf) { prev = performance.now(); raf = requestAnimationFrame(loop); }
          else if (!en.isIntersecting && raf) { cancelAnimationFrame(raf); raf = 0; }
        });
      }, { threshold: 0.02 }).observe(el);
    }
  }

  /* ================================================================
     3 · SCROLL REVEAL / COUNTERS / MICRO-INTERACTIONS
     ================================================================ */
  function initReveal(root) {
    const nodes = (root || document).querySelectorAll('.reveal:not(.is-in), .stagger:not(.is-in)');
    if (!nodes.length) return;
    if (REDUCED || !('IntersectionObserver' in window)) {
      nodes.forEach((n) => n.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    nodes.forEach((n) => io.observe(n));
  }

  function initCounters(root) {
    const nodes = (root || document).querySelectorAll('[data-count]');
    if (!nodes.length) return;

    const run = (el) => {
      const target = parseFloat(el.dataset.count);
      const dur = parseInt(el.dataset.dur || '1500', 10);
      const dec = parseInt(el.dataset.dec || '0', 10);
      const suffix = el.dataset.suffix || '';
      if (REDUCED) { el.textContent = target.toFixed(dec) + suffix; return; }
      const t0 = performance.now();
      const step = (now) => {
        const p = clamp((now - t0) / dur, 0, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (target * eased).toFixed(dec).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    if (!('IntersectionObserver' in window)) { nodes.forEach(run); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { run(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.4 });
    nodes.forEach((n) => io.observe(n));
  }

  function initCardGlow(root) {
    (root || document).addEventListener('pointermove', (e) => {
      const card = e.target.closest && e.target.closest('.card, .sponsor, .tier, .match, .event, .post');
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
      card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
    }, { passive: true });
  }

  function initTilt(root) {
    if (REDUCED) return;
    (root || document).querySelectorAll('.tilt').forEach((el) => {
      let raf = 0;
      el.addEventListener('pointermove', (e) => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = 0;
          const r = el.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;
          el.style.transform = `rotateY(${(px * 14).toFixed(2)}deg) rotateX(${(-py * 14).toFixed(2)}deg)`;
        });
      });
      el.addEventListener('pointerleave', () => {
        el.style.transition = 'transform .6s cubic-bezier(.16,1,.3,1)';
        el.style.transform = '';
        setTimeout(() => { el.style.transition = ''; }, 620);
      });
    });
  }

  function initMagnetic(root) {
    if (REDUCED || !window.matchMedia('(pointer:fine)').matches) return;
    (root || document).querySelectorAll('.magnetic').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.24;
        const y = (e.clientY - r.top - r.height / 2) * 0.34;
        el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  function initCursorGlow() {
    const glow = document.getElementById('cursorGlow');
    if (!glow || REDUCED || !window.matchMedia('(pointer:fine)').matches) return;
    document.body.classList.add('has-pointer');
    let x = window.innerWidth / 2, y = window.innerHeight / 2, cx = x, cy = y;
    window.addEventListener('pointermove', (e) => { x = e.clientX; y = e.clientY; }, { passive: true });
    (function tick() {
      cx = lerp(cx, x, 0.14);
      cy = lerp(cy, y, 0.14);
      glow.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(tick);
    })();
  }

  /* ================================================================ */
  window.ALRSFX = {
    initBackground,
    mountHolo,
    initReveal,
    initCounters,
    initCardGlow,
    initTilt,
    initMagnetic,
    initCursorGlow,
    boot() {
      initBackground();
      initCursorGlow();
      initCardGlow(document);
      document.querySelectorAll('[data-holo]').forEach(mountHolo);
    },
    enhance(root) {
      initReveal(root);
      initCounters(root);
      initTilt(root);
      initMagnetic(root);
      if (root) root.querySelectorAll('[data-holo]').forEach(mountHolo);
    }
  };
})();
