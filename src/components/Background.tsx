"use client";

/* ==========================================================================
   ALRS · Background — whole-site "glass arena" backdrop.
   Faint honeycomb field · red stadium beams & smoke · floating glass prisms
   and dashboard panels (Valorant / ML-driver style) · HUD ticks, corners,
   scan, glitch, vignette. Theme-aware via CSS vars (onyx default / ivory).
   ========================================================================== */

import { useEffect } from "react";
import { bootFx } from "@/lib/effects";
import { LogoMark } from "@/lib/brand";

/* ----------------------------------------------------------- honeycomb --- */
const HEX_R = 24;
const HEX_H = (Math.sqrt(3) * HEX_R) / 2;
const TILE_W = 3 * HEX_R;
const TILE_H = Math.sqrt(3) * HEX_R;

function hexPoints(cx: number, cy: number): string {
  return [
    [cx + HEX_R, cy],
    [cx + HEX_R / 2, cy + HEX_H],
    [cx - HEX_R / 2, cy + HEX_H],
    [cx - HEX_R, cy],
    [cx - HEX_R / 2, cy - HEX_H],
    [cx + HEX_R / 2, cy - HEX_H],
  ]
    .map((p) => `${p[0].toFixed(2)},${p[1].toFixed(2)}`)
    .join(" ");
}

function Honeycomb() {
  const centers: [number, number][] = [
    [0, 0],
    [TILE_W, 0],
    [0, TILE_H],
    [TILE_W, TILE_H],
    [TILE_W / 2, TILE_H / 2],
  ];
  return (
    <svg className="bg-hex-svg" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <pattern id="alrs-hex" width={TILE_W} height={TILE_H} patternUnits="userSpaceOnUse">
          {centers.map(([cx, cy], i) => (
            <polygon key={i} points={hexPoints(cx, cy)} />
          ))}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#alrs-hex)" />
    </svg>
  );
}

/* ------------------------------------------------------------ prisms ----- */
function ShardShape({ pts, id }: { pts: string; id: string }) {
  const coords = pts
    .trim()
    .split(" ")
    .map((p) => p.split(",").map(Number));
  const [x1, y1] = coords[0];
  const [x2, y2] = coords[1] ?? coords[0];
  return (
    <svg viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="rgba(255,255,255,.26)" />
          <stop offset=".5" stopColor="rgba(255,60,84,.13)" />
          <stop offset="1" stopColor="rgba(255,33,56,.03)" />
        </linearGradient>
      </defs>
      <polygon points={pts} fill={`url(#${id})`} stroke="currentColor" strokeWidth="1.4" strokeLinejoin="miter" />
      <path d={`M ${x1} ${y1} L ${x2} ${y2}`} stroke="rgba(255,255,255,.6)" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

/* Sharp shattered-glass prisms — jagged, acute, crystalline. */
const PRISMS: { pts: string; cls: string }[] = [
  { pts: "38,2 62,2 50,138", cls: "p0" },                    // thin sliver
  { pts: "6,34 34,4 58,28 40,64 62,120 10,84", cls: "p1" },  // jagged crystal
  { pts: "16,70 44,6 60,44 88,16 78,126 30,100", cls: "p2" },// acute shard
  { pts: "4,96 30,10 38,44 70,8 64,128 12,122", cls: "p3" }, // splinter
  { pts: "30,6 46,2 38,132 24,128", cls: "p4" },             // small sliver
  { pts: "10,20 52,2 60,40 84,26 70,116 22,106", cls: "p5" },// crystal
  { pts: "2,58 30,4 20,36 52,2 46,130 8,120", cls: "p6" },   // thorn
  { pts: "34,8 64,6 54,132 42,130", cls: "p7" },             // dart
];

export default function Background() {
  useEffect(() => bootFx(), []);

  return (
    <>
      <div className="bg-layers" aria-hidden="true">
        <div className="bg-stage">
          <div className="bg-stage__honeycomb">
            <Honeycomb />
          </div>

          <div className="bg-stage__smoke">
            <span className="bg-smoke bg-smoke--a" />
            <span className="bg-smoke bg-smoke--b" />
            <span className="bg-smoke bg-smoke--c" />
          </div>

          <div className="bg-stage__beams" />
          <div className="bg-stage__slash" />

          <div className="bg-stage__prisms">
            {PRISMS.map((p, i) => (
              <span className={`bg-prism ${p.cls}`} key={p.cls}>
                <ShardShape pts={p.pts} id={`prism-grad-${i}`} />
              </span>
            ))}
          </div>

          <div className="bg-stage__panels">
            <span className="bg-panel d0" />
            <span className="bg-panel d1" />
            <span className="bg-panel d2" />
            <span className="bg-panel d3" />
          </div>

          <div className="bg-stage__ticks" />
          <div className="bg-stage__helmet">
            <LogoMark />
          </div>
          <span className="bg-stage__scan" />

          <div className="bg-stage__corners">
            <span className="bg-stage__corner bg-stage__corner--tl" />
            <span className="bg-stage__corner bg-stage__corner--tr" />
            <span className="bg-stage__corner bg-stage__corner--bl" />
            <span className="bg-stage__corner bg-stage__corner--br" />
            <span className="bg-stage__badge bg-stage__badge--tl">ALRS · LIVE ARENA</span>
            <span className="bg-stage__badge bg-stage__badge--br">SEASON 04 · BATSTATEU ALANGILAN</span>
          </div>

          <div className="bg-stage__glitch" />
          <div className="bg-stage__vignette" />
        </div>
        <div className="bg-glow bg-glow--a" />
        <div className="bg-glow bg-glow--b" />
        <div className="bg-glow bg-glow--c" />
        <div className="bg-noise" />
      </div>
      <canvas id="fxCanvas" className="fx-canvas" aria-hidden="true" />
      <div className="cursor-glow" id="cursorGlow" aria-hidden="true" />
    </>
  );
}
