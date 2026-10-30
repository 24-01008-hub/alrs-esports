"use client";

/* ==========================================================================
   ALRS · SignInModal — Spartan sign-in form (IGN, Spartan code, games)
   Each sign-in regenerates the membership card with the details entered.
   ========================================================================== */

import { useState } from "react";
import { useRouter } from "next/navigation";
import ModalShell from "../ui/ModalShell";
import { useUI } from "../ui/ui-context";
import { store, type Member } from "@/lib/store";
import { ico } from "@/lib/icons";
import MemberCard from "../MemberCard";

const GAMES = [
  "VALORANT",
  "MOBILE LEGENDS",
  "PUBG MOBILE",
  "LEAGUE OF LEGENDS",
  "DOTA 2",
];

type Errs = Record<string, boolean>;

export default function SignInModal() {
  const { toast, closeModal, openEnroll } = useUI();
  const router = useRouter();

  const [ign, setIgn] = useState("");
  const [spartanCode, setSpartanCode] = useState("");
  const [games, setGames] = useState<string[]>([]);
  const [errs, setErrs] = useState<Errs>({});
  const [done, setDone] = useState<Member | null>(null);

  const toggleGame = (game: string) => {
    setGames((g) => (g.includes(game) ? g.filter((x) => x !== game) : [...g, game]));
    setErrs((e) => ({ ...e, games: false }));
  };

  const submit = () => {
    const next: Errs = {
      ign: !ign.trim(),
      spartanCode: spartanCode.trim().length < 3,
      games: games.length === 0,
    };
    setErrs(next);
    if (Object.values(next).some(Boolean)) {
      toast("Check the form", "IGN, Spartan code and at least one game are required.", "gold");
      return;
    }
    const member = store.signIn({ name: ign, spartanCode, games });
    toast("Signed in, Spartan", `Card refreshed for ${member.spartanCode}.`, "ok");
    setDone(member);
  };

  const fErr = (key: string, msg: string) =>
    errs[key] ? <span className="field__err">{msg}</span> : null;

  return (
    <ModalShell
      title={done ? "Signed in" : "Spartan sign in"}
      sub={done ? "Your membership card is live" : "Membership access · name, code, games"}
      foot={
        done ? (
          <>
            <button className="btn btn--link" onClick={closeModal}>
              Close
            </button>
            <div className="row">
              <button
                className="btn btn--ghost btn--sm"
                onClick={() => {
                  setDone(null);
                  setIgn("");
                  setSpartanCode("");
                  setGames([]);
                  setErrs({});
                }}
              >
                Sign in again
              </button>
              <button
                className="btn btn--primary btn--sm"
                onClick={() => {
                  closeModal();
                  router.push("/dashboard");
                }}
              >
                Open dashboard {ico("arrow", 14)}
              </button>
            </div>
          </>
        ) : (
          <>
            <button className="btn btn--link" onClick={() => openEnroll("spartan")}>
              New here? Enrol
            </button>
            <button className="btn btn--primary btn--sm" onClick={submit}>
              Sign in {ico("arrow", 14)}
            </button>
          </>
        )
      }
    >
      {done ? (
        <div style={{ textAlign: "center" }}>
          <span className="chip chip--ok" style={{ marginBottom: 18 }}>
            {ico("check", 13)} Welcome back, {done.name.split(" ")[0]}
          </span>
          <p className="muted" style={{ marginBottom: 22 }}>
            Signed in as <strong className="gold">{done.spartanCode}</strong> · ID{" "}
            <strong className="gold">{done.id}</strong>
          </p>
          <div style={{ display: "grid", placeItems: "center" }}>
            <MemberCard m={done} tilt />
          </div>
        </div>
      ) : (
        <>
          <div className="wz-title">Your Spartan details</div>
          <div className="wz-sub">
            These details are printed on your hologram membership card every time you sign in.
          </div>
          <div className="form-grid">
            <div className={`field ${errs.ign ? "has-error" : ""}`}>
              <label>
                IGN <span className="req">*</span>
              </label>
              <input
                className="input"
                name="ign"
                placeholder="Your In-Game Name"
                value={ign}
                onChange={(e) => {
                  setIgn(e.target.value);
                  setErrs((x) => ({ ...x, ign: false }));
                }}
              />
              {fErr("ign", "Please enter your IGN.")}
            </div>
            <div className={`field ${errs.spartanCode ? "has-error" : ""}`}>
              <label>
                Spartan code <span className="req">*</span>
              </label>
              <input
                className="input"
                name="spartanCode"
                placeholder="SPRT-4821"
                maxLength={16}
                value={spartanCode}
                onChange={(e) => {
                  setSpartanCode(e.target.value.toUpperCase());
                  setErrs((x) => ({ ...x, spartanCode: false }));
                }}
              />
              {fErr("spartanCode", "Spartan code must be at least 3 characters.")}
            </div>
          </div>

          <div className={`field ${errs.games ? "has-error" : ""}`} style={{ marginTop: 20 }}>
            <label>
              Games you play <span className="req">*</span>
            </label>
            <div className="radio-cards">
              {GAMES.map((g) => (
                <label className="radio-card" key={g}>
                  <input
                    type="checkbox"
                    checked={games.includes(g)}
                    onChange={() => toggleGame(g)}
                  />
                  <span>
                    {g}
                    <small>{games.includes(g) ? "Selected" : "Tap to select"}</small>
                  </span>
                </label>
              ))}
            </div>
            {fErr("games", "Select at least one game.")}
          </div>

          <div className="notice notice--red" style={{ marginTop: 20 }}>
            {ico("lock", 17)}
            <span>
              Demo sign-in — details stay in this browser (localStorage) and never leave the device.
            </span>
          </div>
        </>
      )}
    </ModalShell>
  );
}
