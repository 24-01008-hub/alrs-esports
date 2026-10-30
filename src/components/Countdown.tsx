"use client";

/* ==========================================================================
   ALRS · Countdown — live D/H/M/S counter (port of app.js startCountdowns)
   ========================================================================== */

import { useEffect, useState } from "react";

interface Parts {
  d: string;
  h: string;
  m: string;
  s: string;
}

const ZERO: Parts = { d: "00", h: "00", m: "00", s: "00" };

function parts(date: string): Parts {
  const diff = new Date(date).getTime() - Date.now();
  const abs = Math.max(0, diff);
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    d: pad(Math.floor(abs / 864e5)),
    h: pad(Math.floor(abs / 36e5) % 24),
    m: pad(Math.floor(abs / 6e4) % 60),
    s: pad(Math.floor(abs / 1e3) % 60),
  };
}

export default function Countdown({ date }: { date: string }) {
  const [p, setP] = useState<Parts>(ZERO);

  useEffect(() => {
    setP(parts(date));
    const t = setInterval(() => setP(parts(date)), 1000);
    return () => clearInterval(t);
  }, [date]);

  return (
    <div className="countdown" data-countdown={date}>
      <div className="cd">
        <b>{p.d}</b>
        <span>Days</span>
      </div>
      <div className="cd">
        <b>{p.h}</b>
        <span>Hours</span>
      </div>
      <div className="cd">
        <b>{p.m}</b>
        <span>Mins</span>
      </div>
      <div className="cd">
        <b>{p.s}</b>
        <span>Secs</span>
      </div>
    </div>
  );
}
