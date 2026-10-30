"use client";

/* ==========================================================================
   ALRS · effects.ts
   1) moving esports background (perspective grid · data streaks)
   2) interactive CSS holographic 3D logo (fallback for no-WebGL)
   3) scroll reveal · counters · card glow · tilt · magnetic · cursor glow
   Direct-DOM port of legacy js/effects.js — every call returns a disposer.
   ========================================================================== */

const REDUCED =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type Dispose = () => void;

/* ================================================================
   1 · MOVING ESPORTS BACKGROUND
   ================================================================ */
export function initBackground(): Dispose {
  const el = document.getElementById("fxCanvas");
  if (!el) return () => {};
  const canvas = el as HTMLCanvasElement;
  const ctxOrNull = canvas.getContext("2d", { alpha: true });
  if (!ctxOrNull) return () => {};
  const ctx: CanvasRenderingContext2D = ctxOrNull;

  let W = 0;
  let H = 0;
  let DPR = 1;
  let streaks: {
    x: number; y: number; len: number; vx: number; thick: number;
    life: number; decay: number; gold: boolean;
  }[] = [];
  let t = 0;
  let running = !REDUCED;
  let raf = 0;

  const rand = (a: number, b: number) => a + Math.random() * (b - a);

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.floor(W * DPR);
    canvas.height = Math.floor(H * DPR);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    seed();
  }

  function seed() {
    streaks = Array.from({ length: 5 }, () => makeStreak(true));
  }

  function makeStreak(init: boolean) {
    const fromLeft = Math.random() < 0.5;
    return {
      x: init ? rand(0, W) : fromLeft ? -140 : W + 140,
      y: rand(H * 0.1, H * 0.78),
      len: rand(90, 260),
      vx: (fromLeft ? 1 : -1) * rand(5.5, 13),
      thick: rand(1, 2.2),
      life: 1,
      decay: rand(0.004, 0.011),
      gold: Math.random() < 0.4,
    };
  }

  function drawGrid() {
    const horizon = H * 0.6;
    const vpX = W * 0.5;
    const floorH = H - horizon;
    if (floorH <= 0) return;

    const hb = ctx.createLinearGradient(0, horizon - 90, 0, horizon + 60);
    hb.addColorStop(0, "rgba(255,33,56,0)");
    hb.addColorStop(0.55, "rgba(255,33,56,0.14)");
    hb.addColorStop(1, "rgba(255,33,56,0)");
    ctx.fillStyle = hb;
    ctx.fillRect(0, horizon - 90, W, 150);

    ctx.strokeStyle = "rgba(255,33,56,0.55)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, horizon + 0.5);
    ctx.lineTo(W, horizon + 0.5);
    ctx.stroke();

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

    const rows = 26;
    const offset = (t * 0.0055) % 1;
    for (let i = 0; i < rows; i++) {
      const p = (i + offset) / rows;
      const y = horizon + floorH * Math.pow(p, 3.1);
      if (y <= horizon + 1) continue;
      const a = 0.03 + p * 0.3;
      ctx.strokeStyle =
        i % 5 === 0
          ? `rgba(53,224,242,${(a * 0.75).toFixed(3)})`
          : `rgba(255,33,56,${a.toFixed(3)})`;
      ctx.lineWidth = i % 5 === 0 ? 1.1 : 1;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
  }

  function drawStreaks() {
    for (let i = 0; i < streaks.length; i++) {
      const s = streaks[i];
      s.x += s.vx;
      s.life -= s.decay;
      if (s.life <= 0 || s.x < -320 || s.x > W + 320) {
        streaks[i] = makeStreak(false);
        continue;
      }

      const dir = Math.sign(s.vx);
      const col = s.gold ? "255,197,49" : "53,224,242";
      const grad = ctx.createLinearGradient(s.x, s.y, s.x - dir * s.len, s.y - s.len * 0.42);
      grad.addColorStop(0, `rgba(${col},${(0.75 * s.life).toFixed(3)})`);
      grad.addColorStop(1, `rgba(${col},0)`);
      ctx.strokeStyle = grad;
      ctx.lineWidth = s.thick;
      ctx.lineCap = "round";
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

  function frame() {
    if (!running) return;
    t += 1;
    ctx.clearRect(0, 0, W, H);
    drawGrid();
    drawStreaks();
    raf = requestAnimationFrame(frame);
  }

  resize();
  window.addEventListener("resize", resize, { passive: true });
  const onVisibility = () => {
    if (document.hidden) {
      running = false;
      cancelAnimationFrame(raf);
      raf = 0;
    } else if (!REDUCED) {
      running = true;
      raf = requestAnimationFrame(frame);
    }
  };
  document.addEventListener("visibilitychange", onVisibility);

  if (REDUCED) drawGrid();
  else raf = requestAnimationFrame(frame);

  return () => {
    running = false;
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", resize);
    document.removeEventListener("visibilitychange", onVisibility);
    ctx.clearRect(0, 0, W, H);
  };
}

/* ================================================================
   2 · CSS HOLOGRAPHIC 3D LOGO (fallback when WebGL is unavailable)
   ================================================================ */
const SHADE_STOPS = [
  { t: 0.0, c: [58, 8, 18] },
  { t: 0.42, c: [150, 24, 44] },
  { t: 0.76, c: [214, 128, 142] },
  { t: 1.0, c: [238, 241, 248] },
];

function shadeAt(t: number) {
  t = clamp(t, 0, 1);
  for (let i = 1; i < SHADE_STOPS.length; i++) {
    const a = SHADE_STOPS[i - 1];
    const b = SHADE_STOPS[i];
    if (t <= b.t) {
      const k = (t - a.t) / (b.t - a.t);
      return `rgb(${Math.round(lerp(a.c[0], b.c[0], k))},${Math.round(
        lerp(a.c[1], b.c[1], k),
      )},${Math.round(lerp(a.c[2], b.c[2], k))})`;
    }
  }
  return "rgb(238,241,248)";
}

export function mountHolo(el: HTMLElement) {
  if (el.dataset.mounted === "1") return;
  el.dataset.mounted = "1";

  const depth = parseFloat(el.dataset.depth || "46");
  const layers = parseInt(el.dataset.layers || "24", 10);
  el.style.setProperty("--depth", depth + "px");
  el.tabIndex = 0;
  el.setAttribute("role", "img");
  el.setAttribute(
    "aria-label",
    "Interactive 3D Alangilan Red Spartans Esports logo. Drag, use arrow keys or fling to spin it 360 degrees.",
  );

  const motes = Array.from({ length: 9 }, (_, i) => {
    const c = i % 3 === 0 ? "#FFC531" : i % 3 === 1 ? "#35E0F2" : "#FF2138";
    return `<i class="holo3d__mote" style="--c:${c};--dx:${(Math.random() * 260 - 130).toFixed(
      0,
    )}px;--rise:${-(140 + Math.random() * 200).toFixed(0)}px;--dur:${(
      5 + Math.random() * 6
    ).toFixed(1)}s;--delay:${(i * 0.7).toFixed(1)}s"></i>`;
  }).join("");

  const extrusion = Array.from({ length: layers }, (_, k) => {
    const p = k / (layers - 1);
    const z = -depth * (1 - p);
    return `<span class="holo3d__layer" style="--z:${z.toFixed(2)}px;--c:${shadeAt(p)}"></span>`;
  }).join("");

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

  const degOut = el.querySelector<HTMLElement>(".holo3d__deg");

  let spin = 0;
  let vel = 0;
  let tilt = -6;
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  let lastT = 0;
  let moved = 0;
  let raf = 0;
  let prev = performance.now();
  const AUTO = REDUCED ? 0 : 0.055;

  function apply() {
    el.style.setProperty("--spin", spin.toFixed(2));
    el.style.setProperty("--tiltX", tilt.toFixed(2) + "deg");
    if (degOut) degOut.textContent = Math.round(((spin % 360) + 360) % 360) + "°";
  }

  function loop(now: number) {
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

  const onPointerDown = (e: PointerEvent) => {
    dragging = true;
    moved = 0;
    lastX = e.clientX;
    lastY = e.clientY;
    lastT = performance.now();
    vel = 0;
    el.classList.add("is-dragging");
    el.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!dragging) return;
    const now = performance.now();
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    const dt = Math.max(now - lastT, 8);
    moved += Math.abs(dx) + Math.abs(dy);

    spin += dx * 0.42;
    tilt = clamp(tilt - dy * 0.24, -34, 26);
    vel = (dx * 0.42) / dt;

    lastX = e.clientX;
    lastY = e.clientY;
    lastT = now;
    apply();
    if (moved > 6) e.preventDefault();
  };

  const endDrag = (e?: PointerEvent) => {
    if (!dragging) return;
    dragging = false;
    el.classList.remove("is-dragging");
    if (Math.abs(vel) < 0.02) vel = 0;
    if (e && e.pointerId != null && el.releasePointerCapture) {
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {
        /* pointer already released */
      }
    }
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const k = e.key;
    if (k === "ArrowLeft") {
      spin -= 15;
      vel = -0.25;
    } else if (k === "ArrowRight") {
      spin += 15;
      vel = 0.25;
    } else if (k === "ArrowUp") {
      tilt = clamp(tilt - 6, -34, 26);
    } else if (k === "ArrowDown") {
      tilt = clamp(tilt + 6, -34, 26);
    } else if (k === "Home") {
      spin = 0;
      vel = 0;
    } else if (k === " " || k === "Enter") {
      vel = vel ? 0 : 0.62;
    } else return;
    e.preventDefault();
    apply();
  };

  const onDragStart = (e: Event) => e.preventDefault();

  el.addEventListener("pointerdown", onPointerDown);
  el.addEventListener("pointermove", onPointerMove);
  el.addEventListener("pointerup", endDrag);
  el.addEventListener("pointercancel", endDrag);
  el.addEventListener("lostpointercapture", endDrag);
  el.addEventListener("dragstart", onDragStart);
  el.addEventListener("keydown", onKeyDown);

  apply();
  raf = requestAnimationFrame(loop);

  const io =
    "IntersectionObserver" in window
      ? new IntersectionObserver(
          (entries) => {
            for (const en of entries) {
              if (en.isIntersecting && !raf) {
                prev = performance.now();
                raf = requestAnimationFrame(loop);
              } else if (!en.isIntersecting && raf) {
                cancelAnimationFrame(raf);
                raf = 0;
              }
            }
          },
          { threshold: 0.02 },
        )
      : null;
  io?.observe(el);

  /* no unmount hook here — holo nodes are only removed with their page */
}

/* ================================================================
   3 · SCROLL REVEAL / COUNTERS / MICRO-INTERACTIONS
   ================================================================ */
export function initReveal(root: ParentNode): Dispose {
  const nodes = Array.from(root.querySelectorAll<HTMLElement>(".reveal:not(.is-in), .stagger:not(.is-in)"));
  if (!nodes.length) return () => {};
  // React stamps internal markers on DOM nodes it has hydrated. `.reveal` is a
  // React-owned className, so we must not touch it before hydration, or React
  // reports a server/client attribute mismatch when it reconciles that node.
  const isHydrated = (el: Element): boolean =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Object.keys(el as any).some((k) => k.startsWith("__reactFiber") || k.startsWith("__reactProps"));
  const io =
    REDUCED || !("IntersectionObserver" in window)
      ? null
      : new IntersectionObserver(
          (entries) => {
            for (const en of entries) {
              if (en.isIntersecting) {
                en.target.classList.add("is-in");
                io?.unobserve(en.target);
              }
            }
          },
          { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
        );
  const pending = new Set<HTMLElement>(nodes);
  let raf = 0;
  const step = () => {
    for (const el of Array.from(pending)) {
      if (!isHydrated(el)) continue;
      pending.delete(el);
      if (io) io.observe(el);
      else el.classList.add("is-in");
    }
    if (pending.size) raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
  return () => {
    cancelAnimationFrame(raf);
    io?.disconnect();
  };
}

/**
 * Run `cb` only after the initial React hydration has settled.
 * Mutating React-owned DOM (reveal classes, view transitions) before that
 * triggers "server/client attribute mismatch" warnings. During first load the
 * page is still hydrating when effects fire, so we wait for `load` (with a
 * timeout fallback); on client-side navigation the document is already
 * complete and the callback runs immediately.
 */
export function afterHydration(cb: () => Dispose): Dispose {
  let finished = false;
  let inner: Dispose = () => {};
  let timer = 0;
  const invoke = () => {
    if (finished) return;
    finished = true;
    inner = cb() ?? (() => {});
  };
  const onLoad = () => {
    window.removeEventListener("load", onLoad);
    clearTimeout(timer);
    queueMicrotask(invoke);
  };
  if (document.readyState === "complete") {
    queueMicrotask(invoke);
  } else {
    window.addEventListener("load", onLoad, { once: true });
    timer = window.setTimeout(onLoad, 1000);
  }
  return () => {
    finished = true;
    window.removeEventListener("load", onLoad);
    clearTimeout(timer);
    inner();
  };
}

export function initCounters(root: ParentNode): Dispose {
  const nodes = root.querySelectorAll<HTMLElement>("[data-count]");
  if (!nodes.length) return () => {};

  const run = (el: HTMLElement) => {
    const target = parseFloat(el.dataset.count || "0");
    const dur = parseInt(el.dataset.dur || "1500", 10);
    const dec = parseInt(el.dataset.dec || "0", 10);
    const suffix = el.dataset.suffix || "";
    if (REDUCED) {
      el.textContent = target.toFixed(dec) + suffix;
      return;
    }
    const t0 = performance.now();
    const step = (now: number) => {
      const p = clamp((now - t0) / dur, 0, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent =
        (target * eased)
          .toFixed(dec)
          .replace(/\B(?=(\d{3})+(?!\d))/g, ",") + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if (!("IntersectionObserver" in window)) {
    nodes.forEach(run);
    return () => {};
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const en of entries) {
        if (en.isIntersecting) {
          run(en.target as HTMLElement);
          io.unobserve(en.target);
        }
      }
    },
    { threshold: 0.4 },
  );
  nodes.forEach((n) => io.observe(n));
  return () => io.disconnect();
}

const GLOW_SELECTOR = ".card, .sponsor, .tier, .match, .event, .post";

export function initCardGlow(): Dispose {
  const onMove = (e: PointerEvent) => {
    const target = e.target as HTMLElement | null;
    const card = target?.closest?.(GLOW_SELECTOR) as HTMLElement | null;
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty(
      "--mx",
      (((e.clientX - r.left) / r.width) * 100).toFixed(1) + "%",
    );
    card.style.setProperty(
      "--my",
      (((e.clientY - r.top) / r.height) * 100).toFixed(1) + "%",
    );
  };
  document.addEventListener("pointermove", onMove, { passive: true });
  return () => document.removeEventListener("pointermove", onMove);
}

export function initTilt(root: ParentNode): Dispose {
  if (REDUCED) return () => {};
  const els = root.querySelectorAll<HTMLElement>(".tilt");
  const cleanups: Dispose[] = [];

  els.forEach((el) => {
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `rotateY(${(px * 14).toFixed(2)}deg) rotateX(${(
          -py * 14
        ).toFixed(2)}deg)`;
      });
    };
    const onLeave = () => {
      el.style.transition = "transform .6s cubic-bezier(.16,1,.3,1)";
      el.style.transform = "";
      window.setTimeout(() => {
        el.style.transition = "";
      }, 620);
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    cleanups.push(() => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    });
  });

  return () => cleanups.forEach((fn) => fn());
}

export function initMagnetic(root: ParentNode): Dispose {
  if (REDUCED || !window.matchMedia("(pointer:fine)").matches) return () => {};
  const cleanups: Dispose[] = [];
  root.querySelectorAll<HTMLElement>(".magnetic").forEach((el) => {
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.24;
      const y = (e.clientY - r.top - r.height / 2) * 0.34;
      el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    };
    const onLeave = () => {
      el.style.transform = "";
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    cleanups.push(() => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    });
  });
  return () => cleanups.forEach((fn) => fn());
}

export function initCursorGlow(): Dispose {
  const glow = document.getElementById("cursorGlow");
  if (!glow || REDUCED || !window.matchMedia("(pointer:fine)").matches) return () => {};
  document.body.classList.add("has-pointer");
  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;
  let cx = x;
  let cy = y;
  let raf = 0;

  const onMove = (e: PointerEvent) => {
    x = e.clientX;
    y = e.clientY;
  };
  window.addEventListener("pointermove", onMove, { passive: true });

  const tick = () => {
    cx = lerp(cx, x, 0.14);
    cy = lerp(cy, y, 0.14);
    glow.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(
      1,
    )}px, 0) translate(-50%, -50%)`;
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("pointermove", onMove);
    document.body.classList.remove("has-pointer");
  };
}

/* ------------------------------------------------------------- bundles --- */

/** One-shot enhancer run after each route render. */
export function enhance(root: ParentNode): Dispose {
  const d1 = initReveal(root);
  const d2 = initCounters(root);
  const d3 = initTilt(root);
  const d4 = initMagnetic(root);
  root.querySelectorAll<HTMLElement>("[data-holo]").forEach(mountHolo);
  return () => {
    d1();
    d2();
    d3();
    d4();
  };
}

/** App-lifetime effects (background canvas, cursor glow, card glow). */
export function bootFx(): Dispose {
  const d1 = initBackground();
  const d2 = initCursorGlow();
  const d3 = initCardGlow();
  return () => {
    d1();
    d2();
    d3();
  };
}
