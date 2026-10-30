"use client";

/* ==========================================================================
   ALRS · SpartanHologram — the Three.js spartan helmet hologram
   (ported from spartan_hologram_rings (1).html)

   Extruded helmet plates slam in under HUD rings with bloom and impact
   sparks. No backdrop (transparent stage), rings live in their own static
   group so they never move with the logo, and the logo idle-spins a slow
   360° — drag horizontally to spin it faster, with inertia on release.
   Falls back to the CSS holo logo when WebGL is unavailable.
   ========================================================================== */

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { PLATES } from "@/lib/hologramPlates";

const CAPTION = "ALANGILAN RED SPARTANS";

const IDLE_SPIN = 0.28; // rad/s · slow continuous 360° idle rotation
const DRAG_K = 0.008; // rad per px of horizontal drag
const FRICTION = 0.94; // per-frame inertia decay after release
const LOGO_SCALE = 1.58; // base helmet scale — fills the ring frame
const RIG_SCALE = 1.12; // ring rig scale — fills the stage a bit more
const D2R = Math.PI / 180;

function ease(t: number) {
  return 1 - Math.pow(1 - t, 3);
}
function backOut(t: number) {
  const c = 1.9;
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
}
function clamp(v: number, a: number, b: number) {
  return Math.min(b, Math.max(a, v));
}

function buildShader(gain: number, a: number, b: number, tr = false, scr = 3) {
  return new THREE.ShaderMaterial({
    transparent: tr,
    uniforms: {
      uT: { value: 0 },
      uS: { value: scr },
      uFade: { value: 1 },
      uGain: { value: gain },
      uA: { value: new THREE.Color(a) },
      uB: { value: new THREE.Color(b) },
    },
    vertexShader: `varying vec3 vN,vV,vW;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalMatrix*normal;vV=-mv.xyz;
      vW=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*mv;}`,
    fragmentShader: `varying vec3 vN,vV,vW;uniform float uT,uS,uFade,uGain;uniform vec3 uA,uB;
      void main(){vec3 n=normalize(vN),v=normalize(vV);
      float fr=pow(1.-abs(dot(n,v)),2.5),gy=smoothstep(-1.6,1.6,vW.y);
      float l=.3+.7*max(dot(n,normalize(vec3(-.4,.8,.6))),0.);
      float sc=.86+.14*sin(vW.y*90.-uT*uS),fl=.96+.04*sin(uT*37.)*sin(uT*11.);
      gl_FragColor=vec4(mix(uB,uA,gy)*l*uGain*sc*fl+fr*vec3(1.,.22,.18),uFade);}`,
  });
}

function addPath<T extends THREE.Shape | THREE.Path>(s: T, a: number[]): T {
  for (let k = 0; k < a.length; k += 2) {
    const x = a[k] / 100;
    const y = a[k + 1] / 100;
    if (k) s.lineTo(x, y);
    else s.moveTo(x, y);
  }
  return s;
}

function shapeOf(a: number[], holes?: number[][]) {
  const s = addPath(new THREE.Shape(), a);
  for (const h of holes || []) s.holes.push(addPath(new THREE.Path(), h));
  return s;
}

/* ---------- esports HUD ring material (draw-on arc) ---------- */
function ringMaterial(c: number, seg: number) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: {
      p: { value: 0 },
      a: { value: 1 },
      c: { value: new THREE.Color(c) },
      s: { value: seg },
    },
    vertexShader: `varying vec2 v;void main(){v=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `varying vec2 v;uniform float p,a,s;uniform vec3 c;void main(){float f=atan(v.y,v.x)/6.2832+.5;
      if(f>p)discard;if(s>0.&&fract(f*s)>.78)discard;gl_FragColor=vec4(c*a,a);}`,
  });
}

interface HoloHandle {
  dispose(): void;
}

function mount(host: HTMLElement): HoloHandle {
  THREE.ColorManagement.enabled = false;

  /* Pre-flight WebGL probe. If the browser/GPU cannot hand three.js a real
   * context (hardware acceleration off, remote desktop, software GL only),
   * constructing WebGLRenderer makes three log a console error — and on some
   * stacks it even crashes the tab. Bail out quietly instead: the caller
   * catches this and swaps in the CSS holographic fallback. */
  const probe = document.createElement("canvas");
  const gl2 = probe.getContext("webgl2");
  const gl1 = gl2 || probe.getContext("webgl");
  if (!gl1) throw new Error("WebGL unavailable");
  try {
    gl1.getExtension("WEBGL_lose_context")?.loseContext();
    gl2?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    /* ignore */
  }

  /* first session visit plays the intro at full speed, later visits slow it down */
  let first = true;
  try {
    first = !sessionStorage.getItem("rs2");
    sessionStorage.setItem("rs2", "1");
  } catch {
    first = true;
  }
  const SPEED = first ? 1 : 0.45;
  const TI = 2.55; // moment of impact (s)
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rand = () => Math.random() - 0.5;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0); // no background — stage stays transparent
  host.appendChild(renderer.domElement);

  const disposables: { dispose(): void }[] = [];

  const scene = new THREE.Scene(); // no scene.background by design
  const cam = new THREE.PerspectiveCamera(40, 1, 0.1, 60);

  /* the logo spins on its own; rings live in a separate static group so
     they never move with the logo */
  const logo = new THREE.Group();
  const ringRig = new THREE.Group();
  ringRig.scale.setScalar(RIG_SCALE);
  scene.add(logo);
  scene.add(ringRig);

  const M: Record<string, THREE.ShaderMaterial> = {
    b: buildShader(0.8, 0xff3030, 0xa00008),
    i: buildShader(1, 0xff4545, 0xe00010),
    c: buildShader(1.2, 0xff6060, 0xff1a1a),
    r: buildShader(1.6, 0xff9a9a, 0xff2020),
  };
  Object.values(M).forEach((m) => disposables.push(m));
  const DEP: Record<string, number> = { b: 0.3, i: 0.42, c: 0.52, r: 0.64 };

  const edgeMat = new THREE.LineBasicMaterial({
    color: 0xff5a5a,
    transparent: true,
    opacity: 0,
  });
  disposables.push(edgeMat);

  /* ---------- helmet plates ---------- */
  const groups = PLATES.map((p, idx) => {
    const grp = new THREE.Group();
    for (const key of ["b", "i", "c", "r"]) {
      const loops = key === "b" ? [p.b] : (p[key as "i" | "c" | "r"] ?? []);
      for (const lp of loops) {
        const d = DEP[key];
        const geo = new THREE.ExtrudeGeometry(shapeOf(lp, key === "b" ? p.h : undefined), {
          depth: d,
          bevelEnabled: true,
          bevelThickness: 0.012,
          bevelSize: 0.012,
          bevelSegments: 1,
        });
        geo.translate(0, 0, -d / 2);
        disposables.push(geo);
        grp.add(new THREE.Mesh(geo, M[key]));
        const edges = new THREE.EdgesGeometry(geo, 30);
        disposables.push(edges);
        grp.add(new THREE.LineSegments(edges, edgeMat));
      }
    }
    grp.userData = {
      d: 1.45 + idx * 0.07,
      from: new THREE.Vector3(rand() * 10, rand() * 8, 7 + Math.random() * 5),
      rot: new THREE.Vector3(rand() * 8, rand() * 8, rand() * 8),
    };
    logo.add(grp);
    return grp;
  });

  /* ---------- HUD rings (static group — independent of the logo) ---------- */
  /* the new ring rig: extruded sector arcs + 4 marks + hair circles, all in a
     translucent red palette matching the updated logo reference */
  const RM = [
    buildShader(0.7, 0xff3030, 0x900008, true, 0),
    buildShader(1, 0xff5555, 0xe00010, true, 0),
    buildShader(1.1, 0xff6a6a, 0xff1a1a, true, 0),
    buildShader(1.8, 0xffa0a0, 0xff2020, true, 0),
  ];
  RM.forEach((m) => disposables.push(m));

  const ringEdge = new THREE.LineBasicMaterial({
    color: 0xff6a6a,
    transparent: true,
    opacity: 0,
  });
  disposables.push(ringEdge);

  const ext = (s: THREE.Shape, d: number) => {
    const g = new THREE.ExtrudeGeometry(s, {
      depth: d,
      bevelEnabled: true,
      bevelThickness: 0.015,
      bevelSize: 0.015,
      bevelSegments: 1,
    });
    g.translate(0, 0, -d / 2);
    return g;
  };
  const sector = (r0: number, r1: number, a0: number, a1: number, sk: number) => {
    const s = new THREE.Shape();
    s.moveTo(r1 * Math.cos(a0), r1 * Math.sin(a0));
    s.absarc(0, 0, r1, a0, a1, false);
    s.lineTo(r0 * Math.cos(a1 + sk), r0 * Math.sin(a1 + sk));
    s.absarc(0, 0, r0, a1 + sk, a0 + sk, true);
    return s;
  };

  const ringG: THREE.Group[] = [];
  const RING_SPEC: [number, number, number, number, number, number, number, number][] = [
    [0, 3.1, 3.4, 8, 36, 5, 0.12, 0],
    [1, 2.74, 2.84, 3, 98, 0, 0.08, 90],
    [2, 2.4, 2.58, 4, 66, 8, 0.1, 45],
  ];
  RING_SPEC.forEach(([m, r0, r1, n, sp, sk, d, off], i) => {
    const g = new THREE.Group();
    for (let j = 0; j < n; j++) {
      const a0 = (off + (j * 360) / n) * D2R;
      const geo = ext(sector(r0, r1, a0, a0 + sp * D2R, sk * D2R), d);
      disposables.push(geo);
      const edges = new THREE.EdgesGeometry(geo, 30);
      disposables.push(edges);
      g.add(new THREE.Mesh(geo, RM[m]));
      g.add(new THREE.LineSegments(edges, ringEdge));
    }
    g.position.z = -0.7;
    g.userData = { d: 0.2 + i * 0.25, m: RM[m] };
    ringRig.add(g);
    ringG.push(g);
  });

  const marks = new THREE.Group();
  for (let k = 0; k < 4; k++) {
    const th = (k * Math.PI) / 2;
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.lineTo(-0.13, 0.26);
    s.lineTo(0.13, 0.26);
    const geo = ext(s, 0.08);
    disposables.push(geo);
    const m = new THREE.Mesh(geo, RM[3]);
    m.position.set(3.55 * Math.cos(th), 3.55 * Math.sin(th), 0);
    m.rotation.z = th - Math.PI / 2;
    const ed = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 30), ringEdge);
    disposables.push(ed.geometry);
    ed.position.copy(m.position);
    ed.rotation.z = m.rotation.z;
    marks.add(m, ed);
  }
  marks.position.z = -0.7;
  marks.userData = { d: 0.8, m: RM[3] };
  ringRig.add(marks);
  ringG.push(marks);

  const hairs = (
    [
      [2.9, 2.92, 0, 0.9, 0xff4a4a],
      [2.2, 2.23, 0, 0.9, 0xff7a7a],
      [2.05, 2.08, 48, 0.8, 0xff3a3a],
      [3.45, 3.47, 0, 0.6, 0xff3030],
    ] as [number, number, number, number, number][]
  ).map(([r0, r1, s, a, c]) => {
    const m = new THREE.Mesh(new THREE.RingGeometry(r0, r1, 160, 1), ringMaterial(c, s));
    const mat = m.material as THREE.ShaderMaterial;
    mat.uniforms.p.value = 1;
    m.position.z = -0.7;
    m.userData = { a };
    disposables.push(mat);
    ringRig.add(m);
    return m;
  });

  const tp: number[] = [];
  for (let i = 0; i < 120; i++) {
    const a = (i / 120) * 6.2832;
    const r0 = 3.62;
    const r1 = i % 6 ? 3.7 : 3.82;
    tp.push(Math.cos(a) * r0, Math.sin(a) * r0, 0, Math.cos(a) * r1, Math.sin(a) * r1, 0);
  }
  const tg = new THREE.BufferGeometry();
  tg.setAttribute("position", new THREE.Float32BufferAttribute(tp, 3));
  disposables.push(tg);
  const tickMat = new THREE.LineBasicMaterial({
    color: 0xff2a2a,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
  });
  disposables.push(tickMat);
  const ticks = new THREE.LineSegments(tg, tickMat);
  ticks.position.z = -0.7;
  ringRig.add(ticks);

  const shockMat = ringMaterial(0xff5a5a, 0);
  shockMat.uniforms.p.value = 1;
  disposables.push(shockMat);
  const shock = new THREE.Mesh(new THREE.RingGeometry(0.97, 1, 128), shockMat);
  shock.position.z = -0.3;
  shock.visible = false;
  ringRig.add(shock);

  /* ---------- impact sparks ---------- */
  const N = 180;
  const sparkPos = new Float32Array(N * 3);
  const sparkVel: number[][] = [];
  for (let i = 0; i < N; i++) {
    const a = Math.random() * 6.283;
    const s = 2 + Math.random() * 5;
    sparkVel.push([Math.cos(a) * s, Math.sin(a) * s, rand() * 4]);
  }
  const sg = new THREE.BufferGeometry();
  sg.setAttribute("position", new THREE.BufferAttribute(sparkPos, 3));
  disposables.push(sg);
  const sparkMat = new THREE.PointsMaterial({
    size: 0.07,
    color: 0xff3535,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  disposables.push(sparkMat);
  const sparks = new THREE.Points(sg, sparkMat);
  sparks.visible = false;
  ringRig.add(sparks);

  const comp = new EffectComposer(renderer);
  comp.addPass(new RenderPass(scene, cam));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.8, 0.32, 0.18);
  comp.addPass(bloom);
  disposables.push(bloom);
  /* Bloom's own render-to-screen path forces opaque alpha (known three.js
     issue) which boxes the hologram in a black square. Compositing bloom
     into the read buffer and finishing with a copy pass keeps the canvas
     transparent so the hologram floats over the page. */
  const finalPass = new ShaderPass(
    new THREE.ShaderMaterial({
      uniforms: { tDiffuse: { value: null } },
      vertexShader:
        "varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader:
        "uniform sampler2D tDiffuse; varying vec2 vUv;" +
        "void main() {" +
        "  vec4 c = texture2D(tDiffuse, vUv);" +
        "  vec2 p = vUv * 2.0 - 1.0;" +
        "  float fade = 1.0 - smoothstep(0.84, 0.995, length(p));" +
        "  gl_FragColor = vec4(c.rgb, c.a * fade);" +
        "}",
      transparent: true,
      depthTest: false,
      depthWrite: false,
    }),
  );
  comp.addPass(finalPass);
  disposables.push(finalPass.material);

  let camZ = 11.8;
  const resize = () => {
    const w = Math.max(host.clientWidth, 1);
    const h = Math.max(host.clientHeight, 1);
    renderer.setSize(w, h, false);
    comp.setSize(w, h);
    cam.aspect = w / h;
    camZ = 11.8 / Math.min(1, cam.aspect * 1.1);
    cam.position.set(0, 0, camZ);
    cam.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  resize();

  /* ---------- drag to spin (horizontal) ---------- */
  let dragging = false;
  let lastX = 0;
  let pending = 0; // drag delta accumulated between frames
  let vel = 0; // coasting inertia (per-frame rad)

  const onDown = (e: PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    dragging = true;
    vel = 0;
    pending = 0;
    lastX = e.clientX;
    host.classList.add("is-dragging");
    try {
      host.setPointerCapture(e.pointerId);
    } catch {
      /* capture is best-effort */
    }
  };
  const onMove = (e: PointerEvent) => {
    if (!dragging) return;
    pending += (e.clientX - lastX) * DRAG_K;
    lastX = e.clientX;
  };
  const onUp = (e: PointerEvent) => {
    if (!dragging) return;
    dragging = false;
    host.classList.remove("is-dragging");
    try {
      host.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
  };
  host.addEventListener("pointerdown", onDown);
  host.addEventListener("pointermove", onMove);
  host.addEventListener("pointerup", onUp);
  host.addEventListener("pointercancel", onUp);

  const clock = new THREE.Clock();
  let lastT = 0;
  let visible = true;
  let settled = false;

  const frame = () => {
    const t = clock.getElapsedTime();
    const dt = Math.min(t - lastT || 0.016, 0.05);
    lastT = t;
    const ti = reduced ? 99 : t * SPEED;
    const after = ti - TI;

    for (const m of Object.values(M)) m.uniforms.uT.value = t;

    /* rings: sector arcs + marks expand & fade in once, then lock still.
       hair #3 sweeps counter-rotation; outer ticks turn slowly. */
    const SPN = [0.25, -0.45, 0.7, -0.12];
    ringG.forEach((g, i) => {
      const u = g.userData as { d: number; m: THREE.ShaderMaterial };
      const k = ease(clamp((ti - 0.15 - u.d) / 1.1, 0, 1));
      g.scale.setScalar(0.6 + 0.4 * k);
      u.m.uniforms.uFade.value = k;
      g.rotation.z = SPN[i] * t;
    });
    hairs[2].rotation.z = -0.9 * t;
    ticks.rotation.z = 0.08 * t;
    const k4 = ease(clamp((ti - 0.9) / 1, 0, 1));
    ringEdge.opacity = k4 * 0.8;
    tickMat.opacity = k4 * 0.9;
    hairs.forEach((h) => {
      (h.material.uniforms.a as { value: number }).value =
        (h.userData as { a: number }).a * k4;
    });

    /* helmet slams in */
    for (const gp of groups) {
      const u = gp.userData as { d: number; from: THREE.Vector3; rot: THREE.Vector3 };
      const k = backOut(clamp((ti - u.d) / 0.9, 0, 1));
      const f = 1 - k;
      gp.position.copy(u.from).multiplyScalar(f);
      gp.rotation.set(u.rot.x * f, u.rot.y * f, u.rot.z * f);
    }
    logo.scale.setScalar(
      LOGO_SCALE * (after > 0 ? 1 + 0.1 * Math.exp(-after * 9) * Math.cos(after * 14) : 1),
    );
    edgeMat.opacity = clamp((ti - 2.2) / 0.5, 0, 1) * (0.75 + 0.25 * Math.sin(t * 30) * Math.sin(t * 7));

    /* impact effects */
    const on = after > 0;
    shock.visible = sparks.visible = on;
    if (on) {
      const k = clamp(after / 1.1, 0, 1);
      shock.scale.setScalar(0.5 + ease(k) * 6);
      shockMat.uniforms.a.value = (1 - k) * 1.6;
      const p = sg.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < N; i++) {
        const e = Math.min(after, 1.6);
        p.setXYZ(i, sparkVel[i][0] * e, sparkVel[i][1] * e - 2.2 * e * e, sparkVel[i][2] * e);
      }
      p.needsUpdate = true;
      sparkMat.opacity = Math.max(0, 1 - after / 1.5);
    }
    bloom.strength = 0.8 + (on ? 2.4 * Math.exp(-after * 5) : 0);

    /* idle spin + drag interaction */
    if (dragging) {
      logo.rotation.y += IDLE_SPIN * dt + pending;
      vel = pending;
      pending = 0;
    } else {
      vel *= FRICTION;
      if (Math.abs(vel) < 1e-5) vel = 0;
      logo.rotation.y += IDLE_SPIN * dt + vel;
    }
    logo.position.y = Math.sin(t * 1.2) * 0.08 * clamp(after, 0, 1);

    const sh = on ? Math.exp(-after * 7) * 0.35 : 0;
    cam.position.set(rand() * sh, rand() * sh, camZ);

    comp.render();

    /* reduced motion: snap to the finished pose, render once, stop */
    if (reduced && !settled) {
      settled = true;
      renderer.setAnimationLoop(null);
    }
  };

  const startLoop = () => {
    if (settled) return;
    renderer.setAnimationLoop(frame);
  };
  startLoop();

  /* pause when scrolled out of view */
  let io: IntersectionObserver | null = null;
  if ("IntersectionObserver" in window && !reduced) {
    io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (en.isIntersecting) {
            if (!visible) {
              visible = true;
              startLoop();
            }
          } else if (visible) {
            visible = false;
            renderer.setAnimationLoop(null);
          }
        }
      },
      { threshold: 0.02 },
    );
    io.observe(host);
  }

  return {
    dispose() {
      renderer.setAnimationLoop(null);
      io?.disconnect();
      ro.disconnect();
      host.removeEventListener("pointerdown", onDown);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerup", onUp);
      host.removeEventListener("pointercancel", onUp);
      host.classList.remove("is-dragging");
      for (const d of disposables) {
        try {
          d.dispose();
        } catch {
          /* some three revisions have no-op disposers */
        }
      }
      comp.dispose?.();
      renderer.dispose();
      try {
        renderer.forceContextLoss();
      } catch {
        /* ignore */
      }
      if (renderer.domElement.parentNode === host) {
        host.removeChild(renderer.domElement);
      }
    },
  };
}

export default function SpartanHologram({ className }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let handle: HoloHandle | null = null;
    try {
      handle = mount(host);
    } catch {
      setFailed(true);
      return;
    }
    return () => handle?.dispose();
  }, []);

  if (failed) {
    /* WebGL unavailable → fall back to the CSS holographic logo */
    return (
      <div
        className={`holo3d holo3d--lg ${className ?? ""}`}
        data-holo
        data-depth="52"
        data-layers="26"
        role="img"
        aria-label="Alangilan Red Spartans Esports holographic 3D logo"
      />
    );
  }

  return (
    <div
      ref={hostRef}
      className={`holo-stage ${className ?? ""}`}
      role="img"
      aria-label={`Animated 3D Alangilan Red Spartans hologram — ${CAPTION}`}
    >
      <span className="holo-stage__cap" aria-hidden="true">
        ALANGILAN <b>RED</b> SPARTANS
      </span>
    </div>
  );
}
