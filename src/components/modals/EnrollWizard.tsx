"use client";

/* ==========================================================================
   ALRS · EnrollWizard — 4-step membership modal (port of app.js wizard)
   ========================================================================== */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ModalShell from "../ui/ModalShell";
import { useContent, useUI } from "../ui/ui-context";
import { store, tierBonus, useStore, type Member } from "@/lib/store";
import { price } from "@/lib/format";
import { ico } from "@/lib/icons";
import MemberCard from "../MemberCard";

const WZ_STEPS = ["Plan", "Student ID", "Gaming profile", "Confirm"];

const COURSES = [
  "BS Computer Engineering",
  "BS Electronics Engineering",
  "BS Electrical Engineering",
  "BS Mechanical Engineering",
  "BS Civil Engineering",
  "BS Industrial Engineering",
  "BS Information Technology",
  "BS Information Systems",
  "Other",
];

const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year", "Graduate / Alumni"];

const ROLES = [
  "Fragger / Duelist",
  "IGL / Shotcaller",
  "Support / Controller",
  "Sniper / Anchor",
  "Jungler / Roamer",
  "Caster / Content",
  "Analyst / Coach",
  "Tournament staff",
];

type Data = Record<string, string>;

export default function EnrollWizard({ initialTier }: { initialTier?: string }) {
  const content = useContent();
  const { toast, closeModal } = useUI();
  const router = useRouter();
  const st = useStore();

  const [step, setStep] = useState(0);
  const [tier, setTier] = useState("spartan");
  const [billing, setBilling] = useState<"sem" | "year">("sem");
  const [data, setData] = useState<Data>({});
  const [errs, setErrs] = useState<Data>({});
  const [done, setDone] = useState<Member | null>(null);

  /* prefill from an existing member + guard against empty tiers */
  useEffect(() => {
    if (!content.tiers.length) {
      toast("Enrolment is paused", "Membership tiers and pricing will be announced soon.");
      closeModal();
      return;
    }
    if (done) return;
    const existing = st.member;
    setTier(initialTier || (existing ? existing.tier : "spartan"));
    if (existing) {
      setBilling(existing.billing);
      setData({ ...(existing as unknown as Data) });
    }
  }, [st.member, content.tiers.length, initialTier, done, toast, closeModal]);

  const set = (name: string, value: string) => {
    setData((d) => ({ ...d, [name]: value }));
    setErrs((e) => ({ ...e, [name]: "" }));
  };

  /* --------------------------------------------------------- validation */
  function collect(): boolean {
    const next: Data = {};
    let ok = true;

    if (step === 1) {
      next.name = !data.name?.trim() ? "1" : "";
      next.email = !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((data.email ?? "").trim()) ? "1" : "";
      next.campusId = !data.campusId?.trim() ? "1" : "";
      next.course = !data.course?.trim() ? "1" : "";
      next.year = !data.year?.trim() ? "1" : "";
    } else if (step === 2) {
      next.discord = !data.discord?.trim() ? "1" : "";
    } else if (step === 3 && !data.agree) {
      ok = false;
      toast("Agreement required", "Please accept the code of conduct to continue.");
    }

    if (Object.values(next).some(Boolean)) ok = false;
    setErrs(next);
    if (!ok) toast("Check the form", "Some required fields still need attention.", "gold");
    return ok;
  }

  /* ------------------------------------------------------------ finish */
  function finish() {
    if (!collect()) return;
    const member = store.enroll({
      tier,
      billing,
      name: data.name ?? "",
      email: data.email ?? "",
      campusId: data.campusId,
      course: data.course,
      year: data.year,
      ign: data.ign,
      division: data.division,
    });
    const t = content.tiers.find((x) => x.id === tier);
    toast("Welcome, Spartan", `${t?.name ?? "Spartan"} membership activated.`, "ok");
    setDone(member);
  }

  const next = () => {
    if (done) return;
    if (step < 3) {
      if (collect()) setStep(step + 1);
    } else {
      finish();
    }
  };

  /* ------------------------------------------------------------- view */
  const tierObj = content.tiers.find((t) => t.id === tier);
  const amount = tierObj ? tierObj.price[billing] : 0;

  const fErr = (name: string, msg: string) =>
    errs[name] ? <span className="field__err">{msg}</span> : null;

  return (
    <ModalShell
      title={done ? "Enrolment complete" : "Become a Spartan"}
      sub="Membership enrolment · 4 steps"
      foot={
        done ? (
          <>
            <button className="btn btn--link" onClick={closeModal}>
              Close
            </button>
            <div className="row">
              <button
                className="btn btn--ghost btn--sm"
                onClick={() => toast("ID saved", "Your membership card is ready to share.")}
              >
                Save card
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
            <button
              className="btn btn--ghost btn--sm"
              disabled={step === 0}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
            >
              {ico("arrow", 14)} Back
            </button>
            <div className="row">
              <span className="mono muted">
                Step {step + 1} of {WZ_STEPS.length}
              </span>
              <button className="btn btn--primary btn--sm" onClick={next}>
                {step === 3 ? (
                  <>
                    Confirm &amp; generate ID {ico("check", 14)}
                  </>
                ) : (
                  <>
                    Continue {ico("arrow", 14)}
                  </>
                )}
              </button>
            </div>
          </>
        )
      }
    >
      {done ? (
        <div style={{ textAlign: "center" }}>
          <span className="chip chip--ok" style={{ marginBottom: 18 }}>
            {ico("check", 13)} Membership active
          </span>
          <h3 style={{ textTransform: "uppercase" }}>
            Welcome to the Spartans, {done.name.split(" ")[0]}
          </h3>
          <p className="muted" style={{ marginTop: 10, maxWidth: "46ch", marginInline: "auto" }}>
            Your digital ID <strong className="gold">{done.id}</strong> is live. You
            earned <strong className="gold">+{tierBonus(tier)} bonus ALRS Coins</strong>{" "}
            and 500 XP.
          </p>
          <div style={{ display: "grid", placeItems: "center", marginTop: 26 }}>
            <MemberCard m={done} tilt />
          </div>
        </div>
      ) : (
        <>
          <div className="steps">
            {WZ_STEPS.map((_, i) => (
              <i key={i} className={i < step ? "is-done" : i === step ? "is-now" : ""} />
            ))}
          </div>

          {/* ---------------------------------------------------- pane 0 */}
          <div className={`wz-pane ${step === 0 ? "is-active" : ""}`}>
            <div className="wz-title">Pick your rank</div>
            <div className="wz-sub">
              You can change tiers at any time from your dashboard.
            </div>
            <div className="radio-cards">
              {content.tiers.map((t) => (
                <label className="radio-card" key={t.id}>
                  <input
                    type="radio"
                    name="wztier"
                    value={t.id}
                    checked={tier === t.id}
                    onChange={() => setTier(t.id)}
                  />
                  <span>
                    {t.name}
                    <small>
                      {t.price.sem === 0 ? "Free" : `₱${t.price.sem} / sem`}
                    </small>
                  </span>
                </label>
              ))}
            </div>
            <div className="divider" />
            <label className="check">
              <input
                type="radio"
                name="wzbilling"
                checked={billing === "sem"}
                onChange={() => setBilling("sem")}
              />
              <span>Billed per semester</span>
            </label>
            <label className="check" style={{ marginTop: 12 }}>
              <input
                type="radio"
                name="wzbilling"
                checked={billing === "year"}
                onChange={() => setBilling("year")}
              />
              <span>
                Billed annually <strong className="gold">— save ~17%</strong>
              </span>
            </label>
          </div>

          {/* ---------------------------------------------------- pane 1 */}
          <div className={`wz-pane ${step === 1 ? "is-active" : ""}`}>
            <div className="wz-title">Student identification</div>
            <div className="wz-sub">
              Used to verify your Alangilan enrolment and print your digital ID.
            </div>
            <div className="form-grid">
              <div className={`field ${errs.name ? "has-error" : ""}`}>
                <label>
                  Full name <span className="req">*</span>
                </label>
                <input
                  className="input"
                  name="name"
                  placeholder="Juan Dela Cruz"
                  value={data.name ?? ""}
                  onChange={(e) => set("name", e.target.value)}
                />
                {fErr("name", "Please enter your full name.")}
              </div>
              <div className={`field ${errs.email ? "has-error" : ""}`}>
                <label>
                  BatStateU email <span className="req">*</span>
                </label>
                <input
                  className="input"
                  name="email"
                  type="email"
                  placeholder="you@g.batu.edu.ph"
                  value={data.email ?? ""}
                  onChange={(e) => set("email", e.target.value)}
                />
                {fErr("email", "Enter a valid email address.")}
              </div>
              <div className={`field ${errs.campusId ? "has-error" : ""}`}>
                <label>
                  Student ID no. <span className="req">*</span>
                </label>
                <input
                  className="input"
                  name="campusId"
                  placeholder="20-12345"
                  value={data.campusId ?? ""}
                  onChange={(e) => set("campusId", e.target.value)}
                />
                {fErr("campusId", "Student ID is required.")}
              </div>
              <div className={`field ${errs.course ? "has-error" : ""}`}>
                <label>
                  Program / Course <span className="req">*</span>
                </label>
                <select
                  className="select"
                  name="course"
                  value={data.course ?? ""}
                  onChange={(e) => set("course", e.target.value)}
                >
                  <option value="">Select programme</option>
                  {COURSES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                {fErr("course", "Choose your programme.")}
              </div>
              <div className={`field ${errs.year ? "has-error" : ""}`}>
                <label>
                  Year level <span className="req">*</span>
                </label>
                <select
                  className="select"
                  name="year"
                  value={data.year ?? ""}
                  onChange={(e) => set("year", e.target.value)}
                >
                  <option value="">Select year</option>
                  {YEARS.map((y) => (
                    <option key={y}>{y}</option>
                  ))}
                </select>
                {fErr("year", "Choose your year level.")}
              </div>
              <div className="field">
                <label>Division interest</label>
                <select
                  className="select"
                  name="division"
                  value={data.division ?? "Open / Undecided"}
                  onChange={(e) => set("division", e.target.value)}
                >
                  <option>Open / Undecided</option>
                  {content.teams.map((t) => (
                    <option key={t.id}>{t.game}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ---------------------------------------------------- pane 2 */}
          <div className={`wz-pane ${step === 2 ? "is-active" : ""}`}>
            <div className="wz-title">Your gaming profile</div>
            <div className="wz-sub">
              How officers will reach you for scrims and tryouts. Discord is required.
            </div>
            <div className="form-grid">
              <div className="field">
                <label>In-game name</label>
                <input
                  className="input"
                  name="ign"
                  placeholder="e.g. ASHEN"
                  maxLength={18}
                  value={data.ign ?? ""}
                  onChange={(e) => set("ign", e.target.value)}
                />
              </div>
              <div className={`field ${errs.discord ? "has-error" : ""}`}>
                <label>
                  Discord handle <span className="req">*</span>
                </label>
                <input
                  className="input"
                  name="discord"
                  placeholder="spartan#0001"
                  value={data.discord ?? ""}
                  onChange={(e) => set("discord", e.target.value)}
                />
                {fErr("discord", "Discord handle is required for team comms.")}
              </div>
              <div className="field col-2">
                <label>Main role</label>
                <select
                  className="select"
                  name="role"
                  value={data.role ?? ROLES[0]}
                  onChange={(e) => set("role", e.target.value)}
                >
                  {ROLES.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div className="field col-2">
                <label>Why do you want to join ALRS?</label>
                <textarea
                  className="textarea"
                  name="why"
                  placeholder="A sentence or two is plenty."
                  value={data.why ?? ""}
                  onChange={(e) => set("why", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* ---------------------------------------------------- pane 3 */}
          <div className={`wz-pane ${step === 3 ? "is-active" : ""}`}>
            <div className="wz-title">Confirm your membership</div>
            <div className="wz-sub">
              Your digital Spartan ID is generated the moment you confirm.
            </div>
            <div>
              <div className="card card--flat">
                <div className="grid g-2" style={{ gap: "0 26px" }}>
                  <div className="qrow">
                    <span>Full name</span>
                    <b>{data.name || "—"}</b>
                  </div>
                  <div className="qrow">
                    <span>Email</span>
                    <b>{data.email || "—"}</b>
                  </div>
                  <div className="qrow">
                    <span>Student ID</span>
                    <b>{data.campusId || "—"}</b>
                  </div>
                  <div className="qrow">
                    <span>Programme</span>
                    <b>{data.course || "—"}</b>
                  </div>
                  <div className="qrow">
                    <span>Year level</span>
                    <b>{data.year || "—"}</b>
                  </div>
                  <div className="qrow">
                    <span>Discord</span>
                    <b>{data.discord || "—"}</b>
                  </div>
                  <div className="qrow">
                    <span>In-game name</span>
                    <b>{data.ign || "Unassigned"}</b>
                  </div>
                  <div className="qrow">
                    <span>Division</span>
                    <b>{data.division || "Open"}</b>
                  </div>
                </div>
                <div className="divider" />
                <div className="spread">
                  <div>
                    <span className="mono muted">SELECTED PLAN</span>
                    <div
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "1.35rem",
                        textTransform: "uppercase",
                        marginTop: 4,
                      }}
                    >
                      {tierObj?.name ?? "Spartan"}{" "}
                      <span className="muted" style={{ fontSize: ".8rem" }}>
                        / {billing === "year" ? "year" : "semester"}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span className="mono muted">TOTAL DUE</span>
                    <div
                      className="gold"
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "1.9rem",
                        marginTop: 2,
                      }}
                    >
                      {amount === 0 ? "₱0" : price(amount)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <label className="check" style={{ marginTop: 20 }}>
              <input
                type="checkbox"
                name="agree"
                checked={!!data.agree}
                onChange={(e) => set("agree", e.target.checked ? "on" : "")}
              />
              <span>
                I confirm the details above are correct and agree to the ALRS code
                of conduct, academic standing requirement and community standards.
              </span>
            </label>
            <div className="notice notice--red" style={{ marginTop: 18 }}>
              {ico("lock", 17)}
              <span>
                This is a front-end demo — details are stored only in your browser
                (localStorage) and never leave this device.
              </span>
            </div>
          </div>
        </>
      )}
    </ModalShell>
  );
}
