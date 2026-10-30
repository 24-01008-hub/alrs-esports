"use client";

/* ==========================================================================
   ALRS · MemberCard — "Hologram Membership Card"
   Glass-shatter startup confined to the card slot, 3D pointer tilt,
   hover-spin and click-to-flip front/back faces. Styling lives in
   app/styles/holocard.css (scoped under `.hcard`). Fonts map to Chakra Petch.
   ========================================================================== */

import { useEffect, useId, useRef, useState } from "react";
import { useContent } from "./ui/ui-context";
import type { Member } from "@/lib/store";
import html2canvas from "html2canvas";

/* Emblem geometry traced from the official ALRS mark (verbatim from the file). */
const P = {
  body: "M70.0 7.0 L86.8 32.0 L85.2 50.0 L82.2 88.0 L57.8 88.0 L54.8 50.0 L53.2 32.0ZM54.0 72.0 L54.5 108.0 L46.5 117.0 L28.0 102.5ZM86.0 72.0 L85.5 108.0 L93.5 117.0 L112.0 102.5ZM56.0 96.5 L84.0 96.5 L90.5 102.0 L89.5 110.5 L50.5 110.5 L49.5 102.0ZM50.0 114.0 L90.0 114.0 L89.5 126.2 L70.5 162.0 L60.0 141.2 L51.2 125.0ZM17.5 105.0 L71.0 166.0 L71.0 175.0 L58.0 176.2 L19.5 126.2ZM122.5 105.0 L69.0 166.0 L69.0 175.0 L82.0 176.2 L120.5 126.2ZM58.0 172.5 L82.0 172.5 L82.5 198.0 L70.0 206.5 L57.5 198.0ZM17.0 132.0 L28.0 146.5 L28.0 173.0 L17.5 151.5ZM32.0 160.5 L51.2 179.5 L52.0 207.5 L38.0 213.2 L32.0 195.5ZM108.0 160.5 L88.8 179.5 L88.0 207.5 L102.0 213.2 L108.0 195.5Z",
  dark: "M70.0 19.8 L81.7 37.3 L80.7 49.9 L78.6 76.5 L61.4 76.5 L59.3 49.9 L58.3 37.3ZM51.5 80.4 L51.9 105.6 L46.3 111.9 L33.3 101.7ZM88.5 80.4 L88.1 105.6 L93.7 111.9 L106.7 101.7ZM26.5 118.4 L63.9 161.1 L63.9 167.4 L54.8 168.3 L27.9 133.3ZM113.5 118.4 L76.1 161.1 L76.1 167.4 L85.2 168.3 L112.1 133.3ZM34.7 169.7 L48.2 183.0 L48.7 202.6 L38.9 206.7 L34.7 194.2ZM105.3 169.7 L91.8 183.0 L91.3 202.6 L101.1 206.7 L105.3 194.2ZM61.6 177.6 L78.4 177.6 L78.8 195.4 L70.0 201.4 L61.2 195.4Z",
  red: "M71.0 116.0 L85.5 115.0 L83.5 131.5 L71.2 160.0ZM87.5 116.0 L90.8 115.5 L89.8 124.5 L87.5 125.5ZM112.2 143.8 L122.5 131.8 L121.5 149.0 L111.5 172.0Z",
};

const DEFAULT_GAMES = [
  "MOBILE LEGENDS",
  "PUBG MOBILE",
  "LEAGUE OF LEGENDS",
  "DOTA 2",
  "VALORANT",
];

/* Jagged broken-glass mesh — a jittered lattice split into triangles that
 * fly apart on the break, confined to the card slot. */
const GLASS_COLS = 4;
const GLASS_ROWS = 3;

const hash = (a: number, b: number) => {
  const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

interface GlassShard {
  pts: number[][];
  ox: number;
  oy: number;
  tx: number;
  ty: number;
  rot: number;
  delay: number;
}

function buildGlass() {
  const points: { x: number; y: number }[][] = [];
  for (let j = 0; j <= GLASS_ROWS; j++) {
    const row: { x: number; y: number }[] = [];
    for (let i = 0; i <= GLASS_COLS; i++) {
      let x = (i / GLASS_COLS) * 100;
      let y = (j / GLASS_ROWS) * 100;
      if (i > 0 && i < GLASS_COLS) x += (hash(i, j) - 0.5) * 16;
      if (j > 0 && j < GLASS_ROWS) y += (hash(i + 7, j + 3) - 0.5) * 16;
      row.push({ x, y });
    }
    points.push(row);
  }

  const shards: GlassShard[] = [];
  const seams: string[] = [];
  const seen = new Set<string>();
  const addSeg = (a: number[], b: number[]) => {
    const key = `${a[0].toFixed(1)},${a[1].toFixed(1)}|${b[0].toFixed(1)},${b[1].toFixed(1)}`;
    const rev = `${b[0].toFixed(1)},${b[1].toFixed(1)}|${a[0].toFixed(1)},${a[1].toFixed(1)}`;
    if (seen.has(key) || seen.has(rev)) return;
    seen.add(key);
    seams.push(key);
  };

  let n = 0;
  for (let j = 0; j < GLASS_ROWS; j++) {
    for (let i = 0; i < GLASS_COLS; i++) {
      const tl = points[j][i];
      const tr = points[j][i + 1];
      const bl = points[j + 1][i];
      const br = points[j + 1][i + 1];
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
          tx: Math.round(((cx - 50) / 50) * 150),
          ty: Math.round(((cy - 50) / 50) * 130 - 12),
          rot: Math.round(hash(9 + n, 3 + n) * 56 - 28),
          delay: (n % 5) * 28,
        });
        n++;
      }
    }
  }
  return { shards, seams };
}

const { shards: GLASS_SHARDS, seams: GLASS_SEAMS } = buildGlass();

function Emblem({ gradId }: { gradId: string }) {
  return (
    <svg viewBox="0 0 140 218" aria-label="ALRS emblem" role="img">
      <path d={P.body} fill={`url(#${gradId})`} fillOpacity={0.75} />
      <path className="hcard__fill" d={P.red} fill="#e0182d" fillOpacity={0.9} />
      <path className="hcard__tr" pathLength={1000} d={P.dark} fill="none" stroke="#9fb3ff" strokeOpacity={0.7} strokeWidth={0.6} />
      <path className="hcard__tr" pathLength={1000} d={P.body} fill="none" stroke="#fff" strokeWidth={1.3} strokeLinejoin="miter" />
      <path className="hcard__tr" pathLength={1000} d={P.red} fill="none" stroke="#ff6b7a" strokeWidth={1} />
    </svg>
  );
}

export default function MemberCard({
  m,
  tilt = false,
  id,
}: {
  m: Member;
  tilt?: boolean;
  id?: string;
}) {
  const content = useContent();
  const gradId = "hcardg" + useId().replace(/:/g, "");

  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const spinRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const t = content.tiers.find((x) => x.id === m.tier) ?? { name: "Spartan" };
  const rank = (t.name || "Spartan").toUpperCase();
  const jd = m.joined ? new Date(m.joined) : null;
  const joinedYear = jd && !isNaN(jd.getTime()) ? String(jd.getFullYear()) : String(new Date().getFullYear());
  const validTs = m.valid ? new Date(m.valid).getTime() : NaN;
  const active = !m.valid || isNaN(validTs) || validTs > Date.now();

  const [breaking, setBreaking] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [runId, setRunId] = useState(0);

  /* glass startup: hold, break, then reveal the card */
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      const t = window.setTimeout(() => {
        setBreaking(true);
        setRevealed(true);
      }, 0);
      return () => window.clearTimeout(t);
    }
    const breakTimer = window.setTimeout(() => setBreaking(true), 650);
    const doneTimer = window.setTimeout(() => setRevealed(true), 1750);
    return () => {
      window.clearTimeout(breakTimer);
      window.clearTimeout(doneTimer);
    };
  }, [runId]);

  const replay = () => {
    setBreaking(false);
    setRevealed(false);
    setRunId((n) => n + 1);
  };

  const downloadPng = async () => {
    if (!cardRef.current || downloading) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      const safeName = m.name.replace(/[^a-zA-Z0-9]/g, "_");
      link.download = `ALRS_Membership_${safeName}_${m.id}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to download card", err);
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    const tiltEl = tiltRef.current;
    const spinEl = spinRef.current;
    const flipEl = flipRef.current;
    if (!root || !stage || !tiltEl || !spinEl || !flipEl) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const faces = Array.from(root.querySelectorAll<HTMLElement>(".hcard__face"));
    let spinning = false;

    const doSpin = () => {
      if (spinning || reduce) return;
      spinning = true;
      spinEl.classList.add("go");
    };
    const onSpinEnd = () => {
      spinEl.classList.remove("go");
      spinning = false;
    };
    const onMove = (e: MouseEvent) => {
      if (!tilt) return;
      const r = stage.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      tiltEl.style.transform = "rotateY(" + px * 22 + "deg) rotateX(" + -py * 18 + "deg)";
      faces.forEach((h) => h.style.setProperty("--sx", 50 - px * 100 + "%"));
    };
    const onLeave = () => {
      tiltEl.style.transform = "";
      faces.forEach((h) => h.style.removeProperty("--sx"));
    };
    const toggleFlip = () => flipEl.classList.toggle("back");
    const onFlipKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleFlip();
      }
    };

    spinEl.addEventListener("animationend", onSpinEnd);
    stage.addEventListener("mouseenter", doSpin);
    stage.addEventListener("mousemove", onMove);
    stage.addEventListener("mouseleave", onLeave);
    flipEl.addEventListener("click", toggleFlip);
    flipEl.addEventListener("keydown", onFlipKey);

    return () => {
      spinEl.removeEventListener("animationend", onSpinEnd);
      stage.removeEventListener("mouseenter", doSpin);
      stage.removeEventListener("mousemove", onMove);
      stage.removeEventListener("mouseleave", onLeave);
      flipEl.removeEventListener("click", toggleFlip);
      flipEl.removeEventListener("keydown", onFlipKey);
    };
  }, [tilt]);

  return (
    <div className="hcard" ref={rootRef} id={id}>
      <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: "absolute" }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#23232b" />
            <stop offset="1" stopColor="#050507" />
          </linearGradient>
        </defs>
      </svg>

      <div className="hcard__scene" ref={cardRef}>
        {!revealed && (
          <div className={`hcard__glass ${breaking ? "is-breaking" : ""}`} aria-hidden="true">
            <div className="hcard__glass__shards">
              {GLASS_SHARDS.map((s, i) => (
                <span
                  key={i}
                  className="hcard__glass__shard"
                  style={
                    {
                      "--tx": `${s.tx}%`,
                      "--ty": `${s.ty}%`,
                      "--rot": `${s.rot}deg`,
                      "--d": `${s.delay}ms`,
                      transformOrigin: `${s.ox}% ${s.oy}%`,
                      clipPath: `polygon(${s.pts.map((p) => `${p[0]}% ${p[1]}%`).join(", ")})`,
                    } as React.CSSProperties
                  }
                />
              ))}
            </div>
            <svg className="hcard__glass__crack" viewBox="0 0 100 100" preserveAspectRatio="none">
              {GLASS_SEAMS.map((seg, i) => {
                const [a, b] = seg.split("|").map((p) => p.split(",").map(Number));
                return <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />;
              })}
            </svg>
            <div className="hcard__glass__flash" />
          </div>
        )}

        <div className={`hcard__stage ${breaking ? "on" : ""}`} ref={stageRef}>
          <div className="hcard__tilt" ref={tiltRef}>
          <div className="hcard__spin" ref={spinRef}>
            <div
              className="hcard__flip"
              ref={flipRef}
              role="button"
              tabIndex={0}
              aria-label="Membership card. Press to flip."
            >
              <div className="hcard__face hcard__face--front">
                <div className="hcard__grid" />
                <div className="hcard__sweep" />
                <div className="hcard__logo">
                  <Emblem gradId={gradId} />
                </div>
                <div className="hcard__pad">
                  <div className="hcard__top">
                    <div className="hcard__org">
                      ALANGILAN <b>RED</b>
                      <br />
                      SPARTANS
                    </div>
                    <div className="hcard__badge">OFFICIAL MEMBER</div>
                  </div>
                  <div className="hcard__mid">
                    <div className="hcard__chip" />
                    <div className="hcard__lbl">MEMBER NAME</div>
                    <div className="hcard__name">{m.name}</div>
                    <div className="hcard__lbl">MEMBERSHIP ID</div>
                    <div className="hcard__id">{m.id}</div>
                    {m.spartanCode ? (
                      <>
                        <div className="hcard__lbl" style={{ marginTop: "6px" }}>
                          SPARTAN CODE
                        </div>
                        <div
                          className="hcard__id"
                          style={{ fontSize: "clamp(10px, 2.4vw, 14px)" }}
                        >
                          {m.spartanCode}
                        </div>
                      </>
                    ) : null}
                    <div className="hcard__row">
                      <div>
                        <span className="hcard__lbl">RANK</span>
                        <br />
                        <span>{rank}</span>
                      </div>
                      <div>
                        <span className="hcard__lbl">JOINED</span>
                        <br />
                        <span>{joinedYear}</span>
                      </div>
                      <div>
                        <span className="hcard__lbl">STATUS</span>
                        <br />
                        <span>{active ? "ACTIVE" : "EXPIRED"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="hcard__foot">ESPORTS ORGANIZATION &nbsp;//&nbsp; ALANGILAN, BATANGAS</div>
                </div>
              </div>

              <div className="hcard__face hcard__face--back">
                <div className="hcard__sweep" />
                <div className="hcard__bpad">
                  <div className="hcard__btitle">
                    ALANGILAN{" "}
                    <span style={{ color: "var(--red)", margin: "0 .5em" }}>RED</span> SPARTANS
                  </div>
                  <div className="hcard__terms">
                    <b>This card certifies active membership</b> in the Alangilan Red Spartans. It is
                    non-transferable and must be shown at official events and scrims.
                    <div className="hcard__lbl" style={{ marginTop: "4%", color: "#7d0a16" }}>
                      GAMES PLAYED
                    </div>
                    <div className="hcard__games">
                      {(m.games && m.games.length ? m.games : DEFAULT_GAMES).map((g) => (
                        <span key={g}>{g}</span>
                      ))}
                    </div>
                  </div>
                  <div className="hcard__bar" />
                  <div className="hcard__logo2">
                    <Emblem gradId={gradId} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
          <div className="hcard__beam" />
        </div>
      </div>
      {revealed && (
        <div className="hcard__meta">
          <span className="hcard__hint">HOVER TO SPIN // CLICK TO FLIP</span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              className="hcard__replay"
              aria-label="Download card as PNG"
              onClick={downloadPng}
              disabled={downloading}
            >
              {downloading ? "DOWNLOADING..." : "DOWNLOAD PNG"}
            </button>
            <button
              type="button"
              className="hcard__replay"
              aria-label="Replay startup sequence"
              onClick={replay}
            >
              REPLAY
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
