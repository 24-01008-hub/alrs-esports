"use client";

/* ==========================================================================
   ALRS · RedeemModal — sponsor reward redemption (port of app.js redeem flow)
   ========================================================================== */

import ModalShell from "../ui/ModalShell";
import { useContent, useUI } from "../ui/ui-context";
import { store, useStore } from "@/lib/store";
import { ico } from "@/lib/icons";
import { fmtDate } from "@/lib/format";

export default function RedeemModal({ sponsorId }: { sponsorId: string }) {
  const content = useContent();
  const { toast, closeModal, openEnroll } = useUI();
  const st = useStore();
  const s = content.sponsors.find((x) => x.id === sponsorId);
  if (!s) return null;

  /* ---------------------------------------------------- gate: no member */
  if (!st.member) {
    return (
      <ModalShell title="Sign in required">
        <div className="center">
          <div className="card__ico" style={{ marginInline: "auto" }}>
            {ico("lock", 22)}
          </div>
          <h3 style={{ textTransform: "uppercase", marginTop: 16 }}>
            Members only
          </h3>
          <p className="muted" style={{ marginTop: 12 }}>
            Sponsor deals are reserved for certified ALRS members. Enrolment
            takes under two minutes and unlocks every code on this page.
          </p>
          <div className="row" style={{ justifyContent: "center", marginTop: 26 }}>
            <button className="btn btn--primary" onClick={() => openEnroll("spartan")}>
              Join to redeem {ico("arrow", 15)}
            </button>
            <button className="btn btn--ghost" onClick={closeModal}>
              Maybe later
            </button>
          </div>
        </div>
      </ModalShell>
    );
  }

  /* ------------------------------------------------- already redeemed */
  if (st.redeemed.includes(s.id)) {
    return (
      <ModalShell title="Your code">
        <div className="center">
          <span className="chip chip--ok">{ico("check", 13)} Already claimed</span>
          <h3 style={{ textTransform: "uppercase", marginTop: 16 }}>{s.name}</h3>
          <div
            className="sponsor__code"
            style={{ display: "inline-block", marginTop: 18, fontSize: "1.05rem" }}
          >
            {s.code}
          </div>
          <p className="muted" style={{ marginTop: 16 }}>
            Show this code with your digital ALRS ID at checkout. Claimed on{" "}
            {fmtDate(new Date())}.
          </p>
          <button
            className="btn btn--ghost btn--sm"
            style={{ marginTop: 24 }}
            onClick={closeModal}
          >
            Close
          </button>
        </div>
      </ModalShell>
    );
  }

  /* ---------------------------------------------------- confirm redeem */
  const short = st.points < s.cost;

  const doRedeem = () => {
    const res = store.redeem(s);
    if (!res.ok) {
      toast("Cannot redeem", "Not enough ALRS Coins or already claimed.", "gold");
      return;
    }
    closeModal();
    toast("Reward unlocked", `${s.name} · code ${s.code} is now yours.`, "gold");
  };

  return (
    <ModalShell
      title="Redeem reward"
      sub={s.code}
      foot={
        <>
          <button className="btn btn--ghost btn--sm" onClick={closeModal}>
            Cancel
          </button>
          <button
            className="btn btn--gold btn--sm"
            disabled={short}
            onClick={doRedeem}
          >
            {short ? "Not enough ALRS Coins" : `Redeem for ${s.cost} ALRS`}
          </button>
        </>
      }
    >
      <div className="stack" style={{ gap: 20 }}>
        <div className="sponsor" style={{ pointerEvents: "none" }}>
          <div className="sponsor__logo">{s.mono}</div>
          <div>
            <div className="sponsor__name">{s.name}</div>
            <div className="sponsor__cat">{s.cat}</div>
          </div>
          <p className="sponsor__deal">{s.deal}</p>
        </div>
        <div className="qrow">
          <span>Your balance</span>
          <b className="gold">{st.points} ALRS</b>
        </div>
        <div className="qrow">
          <span>This reward costs</span>
          <b className={short ? "red" : ""}>{s.cost} ALRS</b>
        </div>
        <div className="qrow">
          <span>Balance after redemption</span>
          <b>{st.points - s.cost} ALRS</b>
        </div>
        {short && (
          <div className="notice notice--red">
            {ico("bolt", 17)}
            <span>
              You are <strong>{s.cost - st.points} ALRS Coins</strong> short. Attend
              events, cast a stream or referee a bracket to top up.
            </span>
          </div>
        )}
      </div>
    </ModalShell>
  );
}
