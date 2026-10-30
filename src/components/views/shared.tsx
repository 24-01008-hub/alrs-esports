"use client";

/* ==========================================================================
   ALRS · view shared pieces — ported from views.js phero/sectionHead/
   ctaBand/statBlock/pending helpers
   ========================================================================== */

import Link from "next/link";
import { ico } from "@/lib/icons";
import { ROUTE_PATH } from "@/lib/data";
import type { Stat } from "@/lib/types";

export function Phero({
  crumb,
  title,
  lead,
  meta,
  big,
}: {
  crumb: string;
  title: React.ReactNode;
  lead: React.ReactNode;
  meta?: React.ReactNode;
  big?: string;
}) {
  return (
    <section className="phero">
      <span className="phero__big" aria-hidden="true">
        {big ?? ""}
      </span>
      <div className="container phero__inner">
        <div className="phero__crumb">
          <Link href={ROUTE_PATH.home}>ALRS</Link> <span>/</span>{" "}
          <span className="red">{crumb}</span>
        </div>
        <span className="eyebrow">{crumb}</span>
        <h1 className="reveal">{title}</h1>
        <p className="lead reveal">{lead}</p>
        {meta ? <div className="phero__meta reveal">{meta}</div> : null}
      </div>
    </section>
  );
}

export function SectionHead({
  eyebrow,
  title,
  desc,
  right,
}: {
  eyebrow: React.ReactNode;
  title: React.ReactNode;
  desc?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="section__head">
      <div className="reveal">
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        {desc ? <p>{desc}</p> : null}
      </div>
      {right ? <div className="reveal reveal--right">{right}</div> : null}
    </div>
  );
}

export function CtaBand() {
  return (
    <section className="cta-band">
      <div className="container cta-band__inner">
        <span className="eyebrow reveal">Enlist</span>
        <h2 className="reveal glitch" data-text="Your jersey is waiting">
          Your jersey is waiting
        </h2>
        <p className="lead reveal" style={{ marginInline: "auto" }}>
          Membership takes under two minutes. Get your digital Spartan ID, unlock
          sponsor perks and step into the roster pipeline.
        </p>
        <div className="row reveal">
          <Link className="btn btn--primary btn--lg magnetic" href={ROUTE_PATH.membership}>
            Become a Spartan {ico("arrow", 17)}
          </Link>
          <Link className="btn btn--ghost btn--lg" href={ROUTE_PATH.roster}>
            Meet the roster
          </Link>
        </div>
      </div>
    </section>
  );
}

export function StatBlock({ s }: { s: Stat }) {
  return (
    <div className={`stat ${s.gold ? "stat--gold" : ""}`}>
      <div className="stat__val">
        <span data-count={s.val} data-suffix={s.suffix ?? ""} data-dur="1600">
          0
        </span>
      </div>
      <div className="stat__lbl">{s.label}</div>
    </div>
  );
}

export function Pending({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="empty reveal">
      <b>{title}</b>
      <p>{sub}</p>
    </div>
  );
}
