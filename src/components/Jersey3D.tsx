"use client";

/* ==========================================================================
   ALRS · Jersey3D — extrudes a jersey PNG into a slow-spinning 3D shirt.
   The uploaded kit image is stacked across depth layers (shaded front→back)
   with a masked specular sheen, so the flat PNG reads as a rendered 3D kit.
   ========================================================================== */

import type { CSSProperties } from "react";

const LAYERS = 10;
const DEPTH = 28;

const LABELS: Record<string, string> = {
  ml: "Mobile Legends",
  mlbb: "Mobile Legends",
  val: "Valorant",
  valorant: "Valorant",
  cod: "Call of Duty",
  codm: "CODM",
  lol: "League of Legends",
  r6: "Rainbow Six",
  pubg: "Battle Royale",
  poke: "Pokemon Champions",
};

function labelFor(src: string) {
  const stem = decodeURIComponent(src.split("/").pop() || "")
    .replace(/\.[a-z0-9]+$/i, "")
    .toLowerCase();
  return LABELS[stem] || stem.replace(/[-_]+/g, " ").toUpperCase() || "ALRS KIT";
}

/* Left / middle / right slots — each kit gets its own position, size,
 * lean and spin tilt so the row reads as three separately-oriented shirts. */
type Slot = { x: number; y: number; scale: number; rz: number; tilt: number; z: number };

function slotsFor(n: number): Slot[] {
  if (n <= 1) return [{ x: 0, y: 0, scale: 1, rz: 0, tilt: -7, z: 2 }];
  if (n === 2)
    return [
      { x: -25, y: 28, scale: .9, rz: -8, tilt: -4, z: 1 },
      { x: 25, y: -16, scale: .96, rz: 8, tilt: -10, z: 2 },
    ];
  return [
    { x: -34, y: 34, scale: .82, rz: -9, tilt: -3, z: 1 },
    { x: 0, y: -22, scale: 1, rz: 0, tilt: -7, z: 3 },
    { x: 34, y: 34, scale: .82, rz: 9, tilt: -11, z: 2 },
  ];
}

export default function Jersey3D({ items }: { items: string[] }) {
  const shown = items.slice(0, 3);
  if (!shown.length) return null;
  const slots = slotsFor(shown.length);

  return (
    <div
      className={`kitrack kitrack--${shown.length}`}
      role="img"
      aria-label="3D render of the Alangilan Red Spartans esports jersey"
    >
      <span className="kitrack__glow" aria-hidden="true" />
      {shown.map((src, i) => {
        const s = slots[i];
        return (
          <figure
            className="jersey3d"
            key={src}
            style={
              {
                "--src": `url("${src}")`,
                "--i": i,
                "--dur": `${20 + i * 3}s`,
                "--x": s.x,
                "--y": `${s.y}px`,
                "--scale": s.scale,
                "--rz": `${s.rz}deg`,
                "--tilt": `${s.tilt}deg`,
                "--zidx": s.z,
              } as CSSProperties
            }
          >
            <div className="jersey3d__stage">
              <div className="jersey3d__obj">
                {Array.from({ length: LAYERS }).map((_, k) => {
                  const p = k / (LAYERS - 1);
                  return (
                    <span
                      key={k}
                      className="jersey3d__layer"
                      style={
                        {
                          "--z": `${(-DEPTH * (1 - p)).toFixed(1)}px`,
                          "--lum": (0.26 + 0.74 * p).toFixed(2),
                        } as CSSProperties
                      }
                    />
                  );
                })}
                <span className="jersey3d__back" />
                <span className="jersey3d__front" />
                <span className="jersey3d__sheen" />
              </div>
            </div>
            <span className="jersey3d__base" aria-hidden="true" />
            <figcaption className="jersey3d__tag">
              <b>ALRS</b> {labelFor(src)}
            </figcaption>
          </figure>
        );
      })}
    </div>
  );
}
