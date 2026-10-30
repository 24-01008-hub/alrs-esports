"use client";

/* ==========================================================================
   ALRS · Preloader — boot screen shown once per full page load.
   Ends with a red glass-prism shatter that reveals the site.
   ========================================================================== */

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { useContent, useUI } from "./ui/ui-context";
import { store, useStore } from "@/lib/store";
import { BrandMark } from "@/lib/brand";

/* Jagged broken-mirror mesh — a jittered lattice split into slivers that
 * tile the whole screen, then fly apart on the "break". */
const COLS = 5;
const ROWS = 4;

const hash = (a: number, b: number) => {
  const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

function buildMesh() {
  const P: { x: number; y: number }[][] = [];
  for (let j = 0; j <= ROWS; j++) {
    const row: { x: number; y: number }[] = [];
    for (let i = 0; i <= COLS; i++) {
      let x = (i / COLS) * 100;
      let y = (j / ROWS) * 100;
      if (i > 0 && i < COLS) x += (hash(i, j) - 0.5) * 15;
      if (j > 0 && j < ROWS) y += (hash(i + 7, j + 3) - 0.5) * 15;
      row.push({ x, y });
    }
    P.push(row);
  }

  const shards: { pts: number[][]; tx: number; ty: number; rot: number; delay: number; ox: number; oy: number }[] = [];
  const seams = new Set<string>();
  const addSeg = (a: number[], b: number[]) => {
    const key = `${a[0].toFixed(2)},${a[1].toFixed(2)}|${b[0].toFixed(2)},${b[1].toFixed(2)}`;
    const rev = `${b[0].toFixed(2)},${b[1].toFixed(2)}|${a[0].toFixed(2)},${a[1].toFixed(2)}`;
    if (!seams.has(rev)) seams.add(key);
  };

  let n = 0;
  for (let j = 0; j < ROWS; j++) {
    for (let i = 0; i < COLS; i++) {
      const tl = P[j][i];
      const tr = P[j][i + 1];
      const bl = P[j + 1][i];
      const br = P[j + 1][i + 1];
      const tris = hash(i * 3 + j, i + j * 5) < 0.5
        ? [
            [tl, br, tr],
            [tl, br, bl],
          ]
        : [
            [tl, tr, bl],
            [bl, tr, br],
          ];
      for (const t of tris) {
        const p = t.map((v) => [Number(v.x.toFixed(2)), Number(v.y.toFixed(2))]);
        addSeg(p[0], p[1]);
        addSeg(p[1], p[2]);
        addSeg(p[2], p[0]);
        const cx = (p[0][0] + p[1][0] + p[2][0]) / 3;
        const cy = (p[0][1] + p[1][1] + p[2][1]) / 3;
        shards.push({
          pts: p,
          ox: cx,
          oy: cy,
          tx: Math.round(((cx - 50) / 50) * 180),
          ty: Math.round(((cy - 50) / 50) * 150 - 18),
          rot: Math.round(hash(9 + n, 3 + n) * 46 - 23),
          delay: (n % 6) * 35,
        });
        n++;
      }
    }
  }
  return { shards, seams: [...seams] };
}

const { shards: SHARDS, seams: SEAMS } = buildMesh();

export default function Preloader() {
  const content = useContent();
  const { toast } = useUI();
  useStore(); // subscribe → localStorage hydration before the welcome check
  const [pct, setPct] = useState(0);
  const [breaking, setBreaking] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let p = 0;
    let timer: number;

    const step = () => {
      p = Math.min(100, p + Math.random() * 17 + 6);
      setPct(Math.floor(p));
      if (p < 100) {
        timer = window.setTimeout(step, 90 + Math.random() * 110);
      } else {
        /* hold, then shatter the glass and reveal the site */
        timer = window.setTimeout(() => {
          setBreaking(true);
          document.body.classList.add("is-ready");
          timer = window.setTimeout(() => {
            setDone(true);
            /* first-visit nudge, once per browser */
            window.setTimeout(() => {
              try {
                if (!store.isMember() && !window.localStorage.getItem("alrs.welcomed")) {
                  window.localStorage.setItem("alrs.welcomed", "1");
                  toast("Season 4 is live", "Enrol now to claim your digital Spartan ID.", "gold");
                }
              } catch {
                /* storage blocked — skip the nudge */
              }
            }, 1400);
          }, 1000);
        }, 320);
      }
    };
    step();
    return () => window.clearTimeout(timer);
  }, [toast]);

  return (
    <div
      className={`preloader ${breaking ? "is-breaking" : ""} ${done ? "is-done" : ""}`}
      id="preloader"
      aria-hidden="true"
    >
      <div className="preloader__inner">
        <div className="preloader__mark">
          <BrandMark logo={content.uploads.logo} />
        </div>
        <div className="preloader__bar">
          <i style={{ width: `${pct}%` }} />
        </div>
        <div className="preloader__meta">
          <span className="mono">ALRS.SYS // INITIALIZING</span>
          <span className="mono">{pct}%</span>
        </div>
      </div>

      <div className="preloader__shards">
        {SHARDS.map((s, i) => (
          <span
            key={i}
            className="preloader__shard"
            style={
              {
                "--tx": `${s.tx}%`,
                "--ty": `${s.ty}%`,
                "--rot": `${s.rot}deg`,
                "--d": `${s.delay}ms`,
                "--ox": `${s.ox}%`,
                "--oy": `${s.oy}%`,
                clipPath: `polygon(${s.pts.map((p) => `${p[0]}% ${p[1]}%`).join(", ")})`,
              } as CSSProperties
            }
          />
        ))}
      </div>
      <svg className="preloader__crack" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {SEAMS.map((seg, i) => {
          const [a, b] = seg.split("|").map((p) => p.split(",").map(Number));
          return <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />;
        })}
      </svg>
      <div className="preloader__flash" />
    </div>
  );
}
