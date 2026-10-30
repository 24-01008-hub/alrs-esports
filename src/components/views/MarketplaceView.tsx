"use client";

/* ==========================================================================
   ALRS · MarketplaceView — redeem route (vouchers & perks, ALRS Coins)
   ========================================================================== */

import { useState } from "react";
import Link from "next/link";
import { useContent, useUI } from "@/components/ui/ui-context";
import { useStore } from "@/lib/store";
import { ROUTE_PATH } from "@/lib/data";
import { ico } from "@/lib/icons";
import type { RewardShape, Sponsor } from "@/lib/types";
import { Pending, Phero } from "./shared";

function RewardCard({
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
  const isVoucher = s.shape === "voucher";
  const chip = s.tier === "Principal" ? "chip--gold" : s.tier === "Partner" ? "chip--red" : "";
  return (
    <article
      className={`offer ${isVoucher ? "offer--voucher" : "offer--perk"}`}
      data-sponsor={s.id}
      data-name={s.name.toLowerCase()}
      data-cat={s.cat.toLowerCase()}
    >
      <span className={`offer__kind chip ${isVoucher ? "chip--gold" : "chip--red"}`}>
        {isVoucher ? "Voucher" : "Perk"}
      </span>
      <span className={`offer__tier chip ${chip}`}>{s.tier}</span>
      <div className="offer__logo">{logo ? <img src={logo} alt={`${s.name} logo`} /> : s.mono}</div>
      <div>
        <div className="offer__name">{s.name}</div>
        <div className="offer__cat">{s.cat}</div>
      </div>
      <p className="offer__deal">{s.deal}</p>
      <div className="offer__foot">
        {isVoucher ? <span className="offer__code">{s.code}</span> : <span className="offer__code">ALRS PERK</span>}
        {isRedeemed ? (
          <span className="chip chip--ok">{ico("check", 12)} Claimed</span>
        ) : (
          <button className="offer__btn" type="button" onClick={() => onRedeem(s.id)}>
            {ico("bolt", 13)} Redeem · {s.cost}
          </button>
        )}
      </div>
    </article>
  );
}

export default function MarketplaceView() {
  const content = useContent();
  const { openEnroll, openRedeem } = useUI();
  const store = useStore();
  const [filter, setFilter] = useState("all");
  const [kind, setKind] = useState<"all" | RewardShape>("all");
  const [query, setQuery] = useState("");

  const cats = ["All", ...Array.from(new Set(content.sponsors.map((s) => s.cat)))];
  const q = query.trim().toLowerCase();
  const shown = content.sponsors.filter((s) => {
    const name = s.name.toLowerCase();
    const cat = s.cat.toLowerCase();
    const okCat = filter === "all" || cat.indexOf(filter) !== -1;
    const okKind = kind === "all" || s.shape === kind;
    const okQ = !q || name.indexOf(q) !== -1 || cat.indexOf(q) !== -1;
    return okCat && okKind && okQ;
  });
  const pct = Math.min(100, Math.round(store.points / 8));

  return (
    <>
      <Phero
        crumb="Marketplace"
        title={
          <>
            Redeem vouchers,
            <br />
            <span className="red">collect perks</span>
          </>
        }
        lead="Every partnership ALRS signs is converted into something you can redeem. Spend ALRS Coins on vouchers, discounts and gear — codes unlock instantly."
        meta={
          <>
            <span className="chip chip--gold">
              {content.sponsors.length ? `${content.sponsors.length} redeemable rewards` : "(N/A)"}
            </span>
            <span className="chip">Member-exclusive</span>
          </>
        }
        big="REDEEM"
      />

      <section className="section">
        <div className="container">
          <div className="mkt-top">
            <div className="wallet reveal reveal--left">
              <div className="wallet__top">
                <span className="wallet__label">
                  {store.member ? "ALRS Coin wallet" : "Sample wallet balance"}
                </span>
                <span className="wallet__coin">{ico("coin", 20)}</span>
              </div>
              <div className="wallet__pts">
                <span data-count={store.points} data-dur="1400">
                  0
                </span>
                <small>ALRS</small>
              </div>
              <div className="wallet__sub">
                {store.member ? (
                  <>
                    Signed in as {store.member.name} · {store.member.id}
                  </>
                ) : (
                  "Join ALRS to earn ALRS Coins by attending events, refereeing and competing."
                )}
              </div>
              <div className="wallet__bar">
                <div className="spread mono muted" style={{ marginBottom: "8px" }}>
                  <span>Next tier reward</span>
                  <span>{pct}%</span>
                </div>
                <div className="progress progress--gold">
                  <i style={{ width: `${pct}%` }} />
                </div>
              </div>
              <div className="row" style={{ marginTop: "22px" }}>
                {store.member ? (
                  <Link className="btn btn--gold btn--sm" href={ROUTE_PATH.dashboard}>
                    Open dashboard {ico("arrow", 14)}
                  </Link>
                ) : (
                  <button className="btn btn--gold btn--sm" type="button" onClick={() => openEnroll("spartan")}>
                    Join to start earning
                  </button>
                )}
                <span className="chip chip--gold">
                  {ico("coin", 13)} Balance {store.points} ALRS
                </span>
              </div>
            </div>

            <div
              className="card card--flat reveal reveal--right"
              style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}
            >
              <div className="card__ico">{ico("coin", 22)}</div>
              <h4>How ALRS Coins work</h4>
              <p>
                Check in at events, cast a stream, referee a bracket or refer a friend — ALRS Coins
                land in your wallet instantly. Redeem them here, codes unlock immediately.
              </p>
              <div className="stack" style={{ marginTop: "18px", gap: "9px" }}>
                <div className="qrow">
                  <span>Event check-in</span>
                  <b className="gold">+120 ALRS</b>
                </div>
                <div className="qrow">
                  <span>Casting / coverage</span>
                  <b className="gold">+300 ALRS</b>
                </div>
                <div className="qrow">
                  <span>Referee a bracket</span>
                  <b className="gold">+250 ALRS</b>
                </div>
                <div className="qrow">
                  <span>Referral accepted</span>
                  <b className="gold">+500 ALRS</b>
                </div>
              </div>
            </div>
          </div>

          {content.sponsors.length ? (
            <>
              <div className="filter-bar reveal">
                <div className="mkt-kinds" role="tablist" aria-label="Reward type">
                  {(["all", "voucher", "perk"] as const).map((k) => (
                    <button
                      key={k}
                      type="button"
                      role="tab"
                      aria-selected={kind === k}
                      className={`mk-kind ${kind === k ? "is-active" : ""}`}
                      onClick={() => setKind(k)}
                    >
                      {k === "all" ? "All rewards" : k === "voucher" ? "Vouchers" : "Perks"}
                    </button>
                  ))}
                </div>
                <div className="search-box">
                  {ico("search", 17)}
                  <input
                    type="search"
                    id="mktSearch"
                    placeholder="Search rewards or categories…"
                    aria-label="Search marketplace"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                <div className="tabs" style={{ border: 0, padding: 0, margin: 0 }} id="mktFilters">
                  {cats.map((c) => (
                    <button
                      className={`tab ${filter === c.toLowerCase() ? "is-active" : ""}`}
                      type="button"
                      key={c}
                      data-filter={c.toLowerCase()}
                      onClick={() => setFilter(c.toLowerCase())}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid g-3 stagger" id="mktGrid">
                {shown.map((s) => (
                  <RewardCard
                    key={s.id}
                    s={s}
                    redeemed={store.redeemed}
                    logo={content.uploads.sponsorLogos[s.id]}
                    onRedeem={openRedeem}
                  />
                ))}
              </div>

              {shown.length === 0 ? (
                <div className="empty" id="mktEmpty">
                  <b>No rewards found</b>
                  <p>Try a different search term, reward type or clear the category filter.</p>
                </div>
              ) : null}
            </>
          ) : (
            <Pending
              title="No rewards published yet"
              sub="Vouchers and member perks will be listed here as soon as partnerships are announced."
            />
          )}
        </div>
      </section>
    </>
  );
}