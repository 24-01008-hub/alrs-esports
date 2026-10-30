"use client";

/* ==========================================================================
   ALRS · HomeView — landing route (ported from views.js home())
   ========================================================================== */

import Link from "next/link";
import { useContent, useUI } from "@/components/ui/ui-context";
import { useStore } from "@/lib/store";
import { ROUTE_PATH } from "@/lib/data";
import { ico } from "@/lib/icons";
import { price } from "@/lib/format";
import type { Sponsor, Tier } from "@/lib/types";
import Countdown from "@/components/Countdown";
import SpartanHologram from "@/components/SpartanHologram";
import { CtaBand, Pending, SectionHead, StatBlock } from "./shared";

function TierCard({ t, onEnroll }: { t: Tier; onEnroll: (id: string) => void }) {
  const amount = t.price.sem;
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
        <span>{isFree ? "forever" : "per " + (t.invite ? "year" : "semester")}</span>
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

function SponsorCard({
  s,
  redeemed,
  logo,
  onRedeem,
}: {
  s: Sponsor;
  redeemed: string[];
  logo: string | undefined;
  onRedeem: (id: string) => void;
}) {
  const isRedeemed = redeemed.indexOf(s.id) !== -1;
  const chip = s.tier === "Principal" ? "chip--gold" : s.tier === "Partner" ? "chip--red" : "";
  return (
    <article
      className="sponsor"
      data-sponsor={s.id}
      data-name={s.name.toLowerCase()}
      data-cat={s.cat.toLowerCase()}
    >
      <span className={`sponsor__tier chip ${chip}`}>{s.tier}</span>
      <div className="sponsor__logo">{logo ? <img src={logo} alt={`${s.name} logo`} /> : s.mono}</div>
      <div>
        <div className="sponsor__name">{s.name}</div>
        <div className="sponsor__cat">{s.cat}</div>
      </div>
      <p className="sponsor__deal">{s.deal}</p>
      <div className="sponsor__foot">
        <span className="sponsor__code">{s.code}</span>
        {isRedeemed ? (
          <span className="chip chip--ok">
            {ico("check", 12)} Claimed
          </span>
        ) : (
          <button className="btn btn--sm btn--ghost" type="button" onClick={() => onRedeem(s.id)}>
            Redeem · {s.cost}
          </button>
        )}
      </div>
    </article>
  );
}

export default function HomeView() {
  const content = useContent();
  const { toast, openEnroll, openRedeem } = useUI();
  const store = useStore();
  const nm = content.nextMatch;
  const featuredTiers = content.tiers.filter((t) => ["recruit", "spartan", "strategos"].indexOf(t.id) !== -1);

  return (
    <>
      <section className="hero">
        <div className="scanline" aria-hidden="true" />
        <div className="container hero__inner">
          <div className="hero__grid">
            <div>
              <div className="hero__tags reveal">
                <span className="chip chip--live">
                  <i className="dot" /> Season 4 · Live
                </span>
                <span className="chip chip--red">BatStateU · Alangilan</span>
                <span className="chip chip--gold">EST. {content.brand.founded}</span>
              </div>

              <h1 className="display hero__title reveal">
                <span className="l1 outline">Alangilan</span>
                <span className="l1 fill-red">Red Spartans</span>
                <span className="l1 stroke-red">Esports</span>
              </h1>

              <p className="hero__copy lead reveal">
                The official student esports organization of Batangas State University — The National
                Engineering University, Alangilan Campus. Six divisions, one membership, and a digital home
                built by engineers who happen to compete.
              </p>

              <div className="hero__cta reveal">
                <Link className="btn btn--primary btn--lg magnetic" href={ROUTE_PATH.membership}>
                  Join the Spartans {ico("arrow", 17)}
                </Link>
                <Link className="btn btn--ghost btn--lg" href={ROUTE_PATH.tournaments}>
                  {ico("play", 15)} Watch the bracket
                </Link>
              </div>

              <div className="hero__stats stagger">
                {content.stats.length ? (
                  content.stats.slice(0, 3).map((s, i) => <StatBlock key={i} s={s} />)
                ) : (
                  <span className="chip">(N/A)</span>
                )}
              </div>
            </div>

            <div className="reveal reveal--scale">
              <SpartanHologram />
            </div>
          </div>
        </div>
      </section>

      {content.marquee.length ? (
        <div className="marquee" aria-hidden="true">
          <div className="marquee__track">
            {content.marquee.map((m, i) => (
              <span key={`a${i}`}>{m}</span>
            ))}
            {content.marquee.map((m, i) => (
              <span key={`b${i}`}>{m}</span>
            ))}
          </div>
        </div>
      ) : null}

      {content.stats.length ? (
        <section className="section section--tight">
          <div className="container">
            <div className="statbar stagger">
              {content.stats.slice(0, 4).map((s, i) => (
                <StatBlock key={i} s={s} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="section">
        <div className="container">
          <SectionHead
            eyebrow="Divisions"
            title="Six squads. One shield."
            desc="From tactical shooters to MOBA lanes, every ALRS division runs its own coaching staff, scrim block and tryout pipeline."
            right={
              <Link className="btn btn--ghost" href={ROUTE_PATH.roster}>
                Full roster {ico("arrow", 15)}
              </Link>
            }
          />

          {content.teams.length ? (
            <div className="grid g-3 stagger">
              {content.teams.map((t) => (
                <article className="card" data-tilt-team={t.id} key={t.id}>
                  <span className="card__num">{t.tag}</span>
                  <div className="card__ico" style={{ color: t.accent }}>
                    {ico("gamepad", 22)}
                  </div>
                  <span className="chip chip--red" style={{ marginBottom: "12px" }}>
                    {t.game}
                  </span>
                  <h4>{t.name} Division</h4>
                  <p>
                    Coached by {t.coach}. Season record <strong className="red">{t.record}</strong> · {t.rank}.
                  </p>
                  <div className="row" style={{ marginTop: "18px" }}>
                    <Link className="btn btn--link" href={ROUTE_PATH.roster}>
                      View squad {ico("arrow", 14)}
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <Pending
              title="No divisions announced yet"
              sub="Division rosters and records will appear here as soon as they are published."
            />
          )}
        </div>
      </section>

      <section className="section section--surface">
        <div className="container">
          <SectionHead
            eyebrow="Next up"
            title="The match that matters"
            desc="Live brackets, countdowns and streams — all synced to the ALRS tournament calendar."
          />
          {nm ? (
            <div className="split">
              <div className="reveal reveal--left">
                <div className="match" style={{ gridTemplateColumns: "auto 1fr" }}>
                  <div className="match__when">
                    <b>{new Date(nm.date).getDate()}</b>
                    <span>{new Date(nm.date).toLocaleString("en-PH", { month: "short" }).toUpperCase()}</span>
                  </div>
                  <div>
                    <span className="chip chip--red" style={{ marginBottom: "12px" }}>
                      {ico("trophy", 12)} {nm.stage}
                    </span>
                    <div className="match__teams" style={{ marginTop: "10px" }}>
                      <span className="match__team is-us">
                        <span className="seed">{nm.a.seed}</span>
                        {nm.a.name}
                      </span>
                      <span className="match__vs">VS</span>
                      <span className="match__team">
                        <span className="seed">{nm.b.seed}</span>
                        {nm.b.name}
                      </span>
                    </div>
                    <p className="mono muted" style={{ marginTop: "14px" }}>
                      {nm.event}
                    </p>
                  </div>
                </div>
                <p className="mono muted" style={{ marginTop: "16px" }}>
                  {ico("pin", 13)} {nm.where}
                </p>
                <div className="row" style={{ marginTop: "22px" }}>
                  <Link className="btn btn--primary" href={ROUTE_PATH.tournaments}>
                    Match hub {ico("arrow", 15)}
                  </Link>
                  <button
                    className="btn btn--ghost"
                    type="button"
                    onClick={() => toast("Reminder set", "We will ping you 30 minutes before go-time.")}
                  >
                    Set reminder
                  </button>
                </div>
              </div>

              <div className="reveal reveal--right">
                <span className="eyebrow eyebrow--gold">Series starts in</span>
                <Countdown date={nm.date} />
                <div className="notice" style={{ marginTop: "24px" }}>
                  {ico("bolt", 17)}
                  <span>Members get first-pick seating at the campus viewing deck. Your digital ID is your pass.</span>
                </div>
              </div>
            </div>
          ) : (
            <Pending
              title="No schedule published yet"
              sub="Upcoming matches, countdowns and streams appear here once the tournament calendar is set."
            />
          )}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead
            eyebrow="Membership"
            title="Pick your rank"
            desc="Membership plans and perks will be announced by the officer council."
            right={
              <Link className="btn btn--ghost" href={ROUTE_PATH.membership}>
                All plan details {ico("arrow", 15)}
              </Link>
            }
          />
          {content.tiers.length ? (
            <div className="grid g-3 stagger">
              {featuredTiers.map((t) => (
                <TierCard key={t.id} t={t} onEnroll={openEnroll} />
              ))}
            </div>
          ) : (
            <Pending
              title="Plans not published yet"
              sub="Tiers, pricing and perks will appear here once the membership structure is announced."
            />
          )}
        </div>
      </section>

      <section className="section section--tight section--surface">
        <div className="container">
          <SectionHead
            eyebrow="Partners"
            title="Perks from the marketplace"
            desc="Sponsor deals, when signed, will be listed here and redeemed with ALRS Coins."
            right={
              <Link className="btn btn--ghost" href={ROUTE_PATH.marketplace}>
                Open marketplace {ico("arrow", 15)}
              </Link>
            }
          />
          {content.sponsors.length ? (
            <div className="grid g-4 stagger">
              {content.sponsors.slice(0, 4).map((s) => (
                <SponsorCard
                  key={s.id}
                  s={s}
                  redeemed={store.redeemed}
                  logo={content.uploads.sponsorLogos[s.id]}
                  onRedeem={openRedeem}
                />
              ))}
            </div>
          ) : (
            <Pending
              title="No partners announced yet"
              sub="Marketplace deals will appear here once partnerships are published."
            />
          )}
        </div>
      </section>

      <CtaBand />
    </>
  );
}
