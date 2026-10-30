"use client";

/* ==========================================================================
   ALRS · TournamentsView — events route (bulletin board + sponsor marketing)
   ========================================================================== */

import { useContent, useUI } from "@/components/ui/ui-context";
import { ico } from "@/lib/icons";
import Countdown from "@/components/Countdown";
import { Pending, Phero, SectionHead } from "./shared";

export default function TournamentsView() {
  const content = useContent();
  const { toast } = useUI();
  const nm = content.nextMatch;
  const d = nm ? new Date(nm.date) : null;

  return (
    <>
      <Phero
        crumb="Events"
        title={
          <>
            The Spartan
            <br />
            <span className="red">event board</span>
          </>
        }
        lead="A bulletin board for the season — events, match days, brackets and every partner marketing activations. Posted by the operations teams as they are announced."
        meta={
          <>
            <span className="chip">
              {content.events.length ? `${content.events.length} events` : "(N/A)"}
            </span>
            {content.schedule.length ? (
              <span className="chip">{content.schedule.length} match days</span>
            ) : (
              <span className="chip">(N/A)</span>
            )}
            {content.sponsors.length ? (
              <span className="chip chip--gold">{content.sponsors.length} partner strategies</span>
            ) : null}
          </>
        }
        big="E.V.E.N.T.S"
      />

      <section className="section">
        <div className="container">
          <SectionHead
            eyebrow="Bulletin"
            title="Open announcements"
            desc="Events that are live right now — watch parties, scrims, tryouts and campus activations."
          />
          {content.events.length ? (
            <div className="bulletin stagger">
              {content.events.map((e, i) => (
                <article className="event" key={i}>
                  <span className="event__date">
                    <b>{e.d}</b>
                    <span>{e.m}</span>
                  </span>
                  <span className="event__body">
                    <b>{e.title}</b>
                    <p>
                      {ico("pin", 12)} {e.where}
                    </p>
                    <span className="row">
                      <span className="chip">{e.meta}</span>
                      <span className={`chip ${e.state === "open" ? "chip--ok" : "chip--gold"}`}>
                        {e.state}
                      </span>
                    </span>
                  </span>
                </article>
              ))}
            </div>
          ) : (
            <Pending
              title="No events yet"
              sub="Events, watch parties and activations will be pinned here once announced."
            />
          )}
        </div>
      </section>

      <section className="section section--tight section--surface">
        <div className="container">
          {nm && d ? (
            <div className="split">
              <div className="reveal reveal--left">
                <span className="eyebrow">{nm.stage}</span>
                <h2>
                  {nm.a.name} <span className="muted">vs</span> {nm.b.name}
                </h2>
                <p className="lead" style={{ marginTop: "14px" }}>
                  {nm.event} —{" "}
                  {d.toLocaleDateString("en-PH", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}{" "}
                  at {d.toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit" })}.
                </p>
                <div className="row" style={{ marginTop: "26px" }}>
                  <button
                    className="btn btn--primary magnetic"
                    type="button"
                    onClick={() => toast("Reminder set", "See you at the viewing deck.")}
                  >
                    {ico("calendar", 16)} Add to calendar
                  </button>
                  <button
                    className="btn btn--ghost"
                    type="button"
                    onClick={() => toast("Stream opens 15 min early", "We will notify you in-app.")}
                  >
                    {ico("play", 15)} Watch live
                  </button>
                </div>
              </div>
              <div className="reveal reveal--right">
                <span className="eyebrow eyebrow--gold">Next series in</span>
                <Countdown date={nm.date} />
              </div>
            </div>
          ) : (
            <Pending
              title="No match scheduled yet"
              sub="The next ALRS series, countdown and stream details will be posted here once confirmed."
            />
          )}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead
            eyebrow="Schedule"
            title="Upcoming series"
            desc="Match days currently announced by the tournament operations team."
          />
          {content.schedule.length ? (
            <div className="grid stagger" style={{ gap: "14px" }}>
              {content.schedule.map((m, i) => (
                <div className="match" key={i}>
                  <div className="match__when">
                    <b>{m.d}</b>
                    <span>
                      {m.m} · {m.day}
                    </span>
                  </div>
                  <div className="match__teams">
                    <span className={`match__team ${/ALRS/.test(m.a) ? "is-us" : ""}`}>
                      <span className="seed">{ico("swords", 14)}</span>
                      {m.a}
                    </span>
                    <span className="match__vs">VS</span>
                    <span className={`match__team ${/ALRS/.test(m.b) ? "is-us" : ""}`}>
                      <span className="seed">{ico("shield", 14)}</span>
                      {m.b}
                    </span>
                  </div>
                  <div className="match__meta">
                    <span className="chip">{m.tag}</span>
                    <span className="mono muted">
                      {m.ev} · {m.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Pending title="No matches scheduled yet" sub="Upcoming series will be listed here once announced." />
          )}
        </div>
      </section>

      <section className="section section--surface">
        <div className="container">
          <SectionHead
            eyebrow="Grow with us"
            title="Sponsor marketing strategies"
            desc="The activations, integrations and campaigns our partners run with ALRS this season."
          />
          {content.sponsors.length ? (
            <div className="stratgrid stagger">
              {content.sponsors.map((s) => (
                <article className={`strat strat--${s.tier.toLowerCase()}`} key={s.id}>
                  <div className="strat__logo">
                    {content.uploads.sponsorLogos[s.id] ? (
                      <img src={content.uploads.sponsorLogos[s.id]} alt={`${s.name} logo`} />
                    ) : (
                      s.mono
                    )}
                  </div>
                  <span className={`strat__tier chip ${s.tier === "Principal" ? "chip--gold" : s.tier === "Partner" ? "chip--red" : ""}`}>
                    {s.tier}
                  </span>
                  <h4>{s.name}</h4>
                  <p className="strat__deal">{s.deal}</p>
                  <p className="strat__note">Marketing strategy to be published by the sponsorship team.</p>
                </article>
              ))}
            </div>
          ) : (
            <Pending
              title="No strategies published yet"
              sub="Partner marketing activations will appear here as they are confirmed."
            />
          )}
        </div>
      </section>

      <section className="section section--tight">
        <div className="container">
          <SectionHead eyebrow="Bracket" title="Tournament bracket" desc="Current tournament brackets, updated as rounds complete." />
          {content.bracket.length ? (
            <div className="bracket stagger">
              {content.bracket.map((col, ci) => (
                <div className="bracket__col" key={ci}>
                  <h5>{col.round}</h5>
                  {col.matches.map((m, mi) => (
                    <div className="bracket__match" key={mi}>
                      <div className={`bracket__side ${m.as > m.bs && m.done ? "win" : ""}`}>
                        <span>{m.a}</span>
                        <b>{m.as}</b>
                      </div>
                      <div className={`bracket__side ${m.bs > m.as && m.done ? "win" : ""}`}>
                        <span>{m.b}</span>
                        <b>{m.bs}</b>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <Pending title="No brackets published yet" sub="Brackets will appear here when a tournament is confirmed." />
          )}
        </div>
      </section>

      <section className="section section--tight section--surface">
        <div className="container">
          <SectionHead eyebrow="Results" title="Recent results" desc="Results will be posted here after each series." />
          {content.results.length ? (
            <div className="grid g-2 stagger">
              {content.results.map((r, i) => (
                <div className="match" style={{ gridTemplateColumns: "1fr auto" }} key={i}>
                  <div>
                    <span className={`chip ${r.w ? "chip--ok" : "chip--red"}`}>
                      {r.w ? "WIN" : "LOSS"}
                    </span>
                    <div className="match__teams" style={{ marginTop: "12px" }}>
                      <span className={`match__team ${/ALRS/.test(r.a) ? "is-us" : ""}`}>{r.a}</span>
                      <span className="match__vs">vs</span>
                      <span className="match__team">{r.b}</span>
                    </div>
                    <p className="mono muted" style={{ marginTop: "10px" }}>
                      {r.ev} · {r.when}
                    </p>
                  </div>
                  <div className="match__score">
                    <span className={r.w ? "win" : "lose"}>{r.sa}</span>
                    <span className="faint">:</span>
                    <span className={r.w ? "lose" : "win"}>{r.sb}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Pending title="No results yet" sub="Match results will be posted here after each series." />
          )}
        </div>
      </section>
    </>
  );
}