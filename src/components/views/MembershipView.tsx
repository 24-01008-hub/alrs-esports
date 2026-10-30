"use client";

/* ==========================================================================
   ALRS · MembershipView — membership route (ported from views.js membership())
   ========================================================================== */

import { useState } from "react";
import Link from "next/link";
import { useContent, useUI } from "@/components/ui/ui-context";
import { ROUTE_PATH } from "@/lib/data";
import { ico } from "@/lib/icons";
import { price } from "@/lib/format";
import type { Member } from "@/lib/store";
import type { Tier } from "@/lib/types";
import MemberCard from "@/components/MemberCard";
import { CtaBand, Pending, SectionHead } from "./shared";

function TierCard({
  t,
  billing,
  onEnroll,
}: {
  t: Tier;
  billing: "sem" | "year";
  onEnroll: (id: string) => void;
}) {
  const per = billing;
  const amount = t.price[per];
  const isFree = t.price.sem === 0 && t.price.year === 0;
  return (
    <article className={`tier ${t.featured ? "tier--featured" : ""} ${t.invite ? "tier--legend" : ""}`}>
      {t.flag ? <span className="tier__flag">{t.flag}</span> : null}
      <div className="tier__name">{t.name}</div>
      <div className="tier__desc">
        {t.tagline} — {t.desc}
      </div>
      <div className="tier__price">
        <b>{isFree ? "₱0" : price(amount)}</b>
        <span>
          {isFree ? "forever" : "per " + (per === "year" && !t.invite ? "year" : t.invite ? "year" : "semester")}
        </span>
      </div>
      <div className="tier__term">
        {t.invite ? "Nomination required" : isFree ? "Student org access" : "Cancel anytime · VAT included"}
      </div>
      <ul className="tier__list">
        {t.perks.map((p, i) => (
          <li className={p.on ? "" : "off"} key={i}>
            {ico(p.on ? "check" : "x", 15)} <span>{p.t}</span>
          </li>
        ))}
      </ul>
      <button
        className={`btn ${t.featured ? "btn--gold" : t.invite ? "btn--primary" : "btn--ghost"} btn--block`}
        type="button"
        onClick={() => onEnroll(t.id)}
      >
        {t.cta}
      </button>
    </article>
  );
}

export default function MembershipView() {
  const content = useContent();
  const { toast, openEnroll, openSignIn } = useUI();
  const [billing, setBilling] = useState<"sem" | "year">("sem");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const demo: Member = {
    id: "ALRS-SP-2026-4821",
    name: "Preview Member",
    email: "",
    campusId: "",
    course: "",
    year: "",
    tier: "spartan",
    billing: "sem",
    division: "Valorant",
    joined: "",
    valid: new Date(Date.now() + 1.4e10).toISOString(),
    avatar: "P",
    spartanCode: "SPRT-4821",
    games: ["VALORANT", "MOBILE LEGENDS", "PUBG MOBILE"],
  };

  const pickBilling = (m: "sem" | "year") => {
    setBilling(m);
    toast(
      "Pricing updated",
      m === "year" ? "Annual pricing applied — best value." : "Semester pricing applied.",
    );
  };

  return (
    <>
      <section className="phero memb-hero">
        <span className="phero__big" aria-hidden="true">
          JOIN
        </span>
        <div className="container phero__inner">
          <div className="phero__crumb">
            <Link href={ROUTE_PATH.home}>ALRS</Link> <span>/</span> <span className="red">Membership</span>
          </div>
          <span className="eyebrow">Digital Membership</span>
          <div className="split" style={{ alignItems: "center" }}>
            <div>
              <h1 className="reveal">
                One card.
                <br />
                <span className="red">Every privilege.</span>
              </h1>
              <p className="lead reveal">
                Your ALRS membership is a verified digital ID, an ALRS Coins wallet, and a key to every
                sponsor deal we sign. Enrolment takes under two minutes.
              </p>
              <div className="phero__meta reveal">
                <span className="chip chip--red">Instant digital ID</span>
                <span className="chip">ALRS Coins</span>
                <span className="chip chip--gold">No lock-in</span>
              </div>
              <div className="hero__cta reveal">
                <button
                  className="btn btn--primary btn--lg magnetic"
                  type="button"
                  onClick={() => openEnroll("spartan")}
                >
                  Start enrolment {ico("arrow", 17)}
                </button>
                <button className="btn btn--ghost btn--lg" type="button" onClick={openSignIn}>
                  Sign in
                </button>
                <Link className="btn btn--ghost btn--lg" href={ROUTE_PATH.community}>
                  Talk to a Spartan
                </Link>
              </div>
            </div>
            <div className="memb-hero__cardwrap reveal reveal--right">
              <div className="memb-card-frame">
                <iframe
                  src="/alrs-hologram-membership-card.html"
                  title="ALRS Hologram Membership Card"
                  className="memb-card-frame__iframe"
                  loading="eager"
                  allow="autoplay; fullscreen"
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>
              <p className="mono muted" style={{ marginTop: "16px", textAlign: "center" }}>
                Preview — your details appear after enrolment
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead
            eyebrow="Tiers"
            title="Choose your rank"
            desc="Membership tiers, pricing and benefits will be announced by the officer council."
          />

          {content.tiers.length ? (
            <div>
              <div className="billing-toggle" id="billingToggle">
                <button
                  className={billing === "sem" ? "is-active" : ""}
                  type="button"
                  onClick={() => pickBilling("sem")}
                >
                  Semester
                </button>
                <button
                  className={billing === "year" ? "is-active" : ""}
                  type="button"
                  onClick={() => pickBilling("year")}
                >
                  Annual <span className="gold">−17%</span>
                </button>
              </div>
              <div className="grid g-4 stagger" style={{ marginTop: "var(--gap,26px)" }}>
                {content.tiers.map((t) => (
                  <TierCard key={t.id} t={t} billing={billing} onEnroll={openEnroll} />
                ))}
              </div>
            </div>
          ) : (
            <Pending
              title="Membership plans not published yet"
              sub="Tiers, pricing and perks will appear here as soon as the membership structure is announced."
            />
          )}
        </div>
      </section>

      <section className="section section--surface">
        <div className="container">
          <SectionHead
            eyebrow="Compare"
            title="Every perk, side by side"
            desc="No fine print. What you see is what ships to your account."
          />
          {content.compare.rows.length ? (
            <div className="compare-wrap reveal">
              <table className="compare">
                <thead>
                  <tr>
                    <th>Benefit</th>
                    {content.compare.cols.map((c, i) => (
                      <th className={i === 2 ? "col-feat" : ""} key={i}>
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {content.compare.rows.map((r, ri) => (
                    <tr key={ri}>
                      <th scope="row">{r[0]}</th>
                      {r.slice(1).map((v, i) => (
                        <td className={`${v ? "yes" : "no"} ${i === 2 ? "col-feat" : ""}`} key={i}>
                          {v ? "✓" : "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Pending
              title="No comparison published yet"
              sub="A side-by-side of membership tiers will appear here once plans are announced."
            />
          )}
        </div>
      </section>

      {content.perks.length || content.faq.length ? (
        <section className="section">
          <div className="container split" style={{ alignItems: "start" }}>
            {content.perks.length ? (
              <div className="reveal reveal--left">
                <span className="eyebrow">Member perks</span>
                <h2>What the card actually unlocks</h2>
                <p className="lead" style={{ marginTop: "14px" }}>
                  Membership benefits unlock as your tier and activity progress.
                </p>
                <div className="stack" style={{ marginTop: "26px", gap: "14px" }}>
                  {content.perks.map((p, i) => (
                    <div className="perk" key={i}>
                      <span className="perk__ico">{p.ico}</span>
                      <span>
                        <b>{p.t}</b>
                        <span>{p.s}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {content.faq.length ? (
              <div className="reveal reveal--right">
                <span className="eyebrow eyebrow--gold">Questions</span>
                <div className="faq" id="faqList">
                  {content.faq.map((f, i) => {
                    const open = openFaq === i;
                    return (
                      <div className={`faq__item ${open ? "is-open" : ""}`} key={i}>
                        <button
                          className="faq__q"
                          type="button"
                          aria-expanded={open}
                          onClick={() => setOpenFaq(open ? null : i)}
                        >
                          {f.q}
                          <i>+</i>
                        </button>
                        <div className="faq__a" style={{ maxHeight: open ? 260 : 0 }}>
                          <p>{f.a}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      <CtaBand />
    </>
  );
}
