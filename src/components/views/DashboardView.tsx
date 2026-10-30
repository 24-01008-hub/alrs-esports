"use client";

/* ==========================================================================
   ALRS · DashboardView — dashboard route (ported from views.js dashboard())
   ========================================================================== */

import Link from "next/link";
import { useContent, useUI } from "@/components/ui/ui-context";
import { computeLevel, store, useStore } from "@/lib/store";
import { ROUTE_PATH } from "@/lib/data";
import { ico } from "@/lib/icons";
import { BrandMark } from "@/lib/brand";
import MemberCard from "@/components/MemberCard";
import { Phero } from "./shared";

export default function DashboardView() {
  const content = useContent();
  const { toast, openEnroll, openSignIn } = useUI();
  const st = useStore();

  if (!st.member) {
    return (
      <>
        <Phero
          crumb="Dashboard"
          title={
            <>
              Your Spartan
              <br />
              <span className="red">dashboard</span>
            </>
          }
          lead="Sign in with an ALRS membership to see your digital ID, XP progression, badges and wallet in one place."
          big="ID"
        />
        <section className="section">
          <div className="container">
            <div className="empty reveal">
              <span
                className="brand__mark"
                style={
                  {
                    width: "96px",
                    margin: "0 auto 22px",
                    ["--mark-shell" as string]: "#F2F3F7",
                  } as React.CSSProperties
                }
              >
                <BrandMark logo={content.uploads.logo} />
              </span>
              <b>You are not signed in</b>
              <p>
                Membership is free to start. Enrol in under two minutes and your digital Spartan ID is
                generated instantly.
              </p>
              <div className="row" style={{ justifyContent: "center" }}>
                <button className="btn btn--primary magnetic" type="button" onClick={openSignIn}>
                  Sign in {ico("arrow", 16)}
                </button>
                <button className="btn btn--ghost" type="button" onClick={() => openEnroll("recruit")}>
                  Enrol for free
                </button>
                <Link className="btn btn--ghost" href={ROUTE_PATH.membership}>
                  See all tiers
                </Link>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  const m = st.member;
  const lvl = computeLevel(st.xp);
  const tier = content.tiers.find((t) => t.id === m.tier) ?? { name: "Spartan" };
  const activity = st.activity;
  const earnedBadges = content.badges.filter((b) => b.on || st.badges.indexOf(b.name) !== -1);

  return (
    <>
      <Phero
        crumb="Dashboard"
        title={
          <>
            Welcome back,
            <br />
            <span className="red">{m.name.split(" ")[0]}</span>
          </>
        }
        lead={`Your membership is active through ${new Date(m.valid).toLocaleDateString("en-PH", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}. Everything below is live and synced to your account.`}
        meta={
          <>
            <span className="chip chip--red">{tier.name} tier</span>
            <span className="chip">{m.id}</span>
            <span className="chip chip--gold">{st.points} ALRS</span>
          </>
        }
        big="A.C.T"
      />

      <section className="section">
        <div className="container dash">
          <div className="dash__side">
            <div className="reveal reveal--left">
              <div className="memb-card-frame" style={{ width: "100%", maxWidth: "460px", margin: "0 auto" }}>
                <iframe
                  src={`/alrs-hologram-membership-card.html?name=${encodeURIComponent(m.name)}&id=${encodeURIComponent(m.id)}&rank=${encodeURIComponent((m.tier || "spartan").toUpperCase())}&join=${encodeURIComponent(m.joined ? new Date(m.joined).getFullYear().toString() : new Date().getFullYear().toString())}`}
                  title="ALRS Hologram Membership Card"
                  className="memb-card-frame__iframe"
                  loading="eager"
                  allow="autoplay; fullscreen"
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>
            </div>

            <div className="dash__panel reveal reveal--left">
              <h5>
                {ico("id", 15)} Membership
              </h5>
              <div className="qrow">
                <span>Tier</span>
                <b className="red">{tier.name}</b>
              </div>
              <div className="qrow">
                <span>Member ID</span>
                <b className="mono">{m.id}</b>
              </div>
              <div className="qrow">
                <span>Course / Year</span>
                <b>
                  {m.course} · {m.year}
                </b>
              </div>
              <div className="qrow">
                <span>Division</span>
                <b>{m.division}</b>
              </div>
              <div className="qrow">
                <span>Valid until</span>
                <b className="gold">
                  {new Date(m.valid).toLocaleDateString("en-PH", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </b>
              </div>
              <div className="row" style={{ marginTop: "18px" }}>
                <Link className="btn btn--ghost btn--sm" href={ROUTE_PATH.membership}>
                  Change plan
                </Link>
                <button
                  className="btn btn--link"
                  type="button"
                  onClick={() => {
                    store.signOut();
                    toast("Signed out", "Your Spartan profile stays saved on this device.");
                  }}
                >
                  Sign out
                </button>
              </div>
            </div>

            <div className="dash__panel reveal reveal--left">
              <h5>
                {ico("wallet", 15)} Wallet
              </h5>
              <div className="qrow">
                <span>ALRS Coins</span>
                <b className="gold">{st.points}</b>
              </div>
              <div className="qrow">
                <span>Total XP</span>
                <b>{st.xp.toLocaleString()}</b>
              </div>
              <div className="qrow">
                <span>Deals claimed</span>
                <b>{st.redeemed.length}</b>
              </div>
              <Link
                className="btn btn--gold btn--sm btn--block"
                href={ROUTE_PATH.marketplace}
                style={{ marginTop: "16px" }}
              >
                Spend coins {ico("arrow", 14)}
              </Link>
            </div>
          </div>

          <div className="dash__main stack" style={{ gap: "22px" }}>
            <div className="xpbar reveal">
              <div className="xpbar__top">
                <span className="xpbar__lvl">
                  Level <em>{lvl.level}</em> · {lvl.pct === 100 ? "Maxed" : "Spartan"}
                </span>
                <span className="mono muted">
                  {st.xp.toLocaleString()} / {lvl.next.toLocaleString()} XP
                </span>
              </div>
              <div className="progress">
                <i style={{ width: `${lvl.pct}%` }} />
              </div>
              <p className="mono muted" style={{ marginTop: "12px" }}>
                {lvl.pct === 100
                  ? "Level cap reached for this season."
                  : `${(lvl.next - st.xp).toLocaleString()} XP to level ${lvl.level + 1}.`}
              </p>
            </div>

            {content.badges.length ? (
              <div className="dash__panel reveal">
                <div className="spread" style={{ marginBottom: "18px" }}>
                  <h5 style={{ margin: 0 }}>
                    {ico("star", 15)} Badge collection
                  </h5>
                  <span className="mono muted">
                    {earnedBadges.length} / {content.badges.length} earned
                  </span>
                </div>
                <div className="badgegrid">
                  {content.badges.map((b) => {
                    const on = b.on || st.badges.indexOf(b.name) !== -1;
                    return (
                      <div className={`badge ${on ? "" : "is-locked"}`} title={b.hint} key={b.name}>
                        <span className="badge__ico">{b.ico === " founding" ? "🛡️" : b.ico}</span>
                        <b>{b.name}</b>
                        <span>{on ? "Earned" : b.hint}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {activity.length ? (
              <div className="dash__panel reveal">
                <div className="spread" style={{ marginBottom: "14px" }}>
                  <h5 style={{ margin: 0 }}>
                    {ico("bolt", 15)} Recent activity
                  </h5>
                  <span className="mono muted">Last {activity.length} entries</span>
                </div>
                <div>
                  {activity.slice(0, 7).map((a, i) => (
                    <div className="actline" key={i}>
                      <span className="actline__ico">{a.ico}</span>
                      <span>
                        <b>{a.t}</b>
                        <span>{a.s}</span>
                      </span>
                      <span className="pts">{a.pts}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {content.perks.length ? (
              <div className="grid g-3 stagger">
                {content.perks.slice(0, 3).map((p, i) => (
                  <div className="perk" key={i}>
                    <span className="perk__ico">{p.ico}</span>
                    <span>
                      <b>{p.t}</b>
                      <span>{p.s}</span>
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}
