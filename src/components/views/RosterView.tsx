"use client";

/* ==========================================================================
   ALRS · RosterView — roster route (ported from views.js roster())
   ========================================================================== */

import { useState } from "react";
import { useContent } from "@/components/ui/ui-context";
import { ico } from "@/lib/icons";
import type { Player, Team } from "@/lib/types";
import Jersey3D from "@/components/Jersey3D";
import { CtaBand, Pending, Phero, SectionHead } from "./shared";

function PlayerCard({ p, t }: { p: Player; t: Team }) {
  const showRating = ["val", "codm", "pubgm"].indexOf(t.id) !== -1;
  return (
    <article className="player">
      <div className="player__top" style={{ ["--team" as string]: t.accent }}>
        <span className="chip chip--red player__badge">{t.tag}</span>
        <span className="player__flag">#{p.no}</span>
        <span className="player__jersey">{p.no}</span>
      </div>
      <div className="player__body">
        <div className="player__ign">{p.ign}</div>
        <div className="player__real">{p.real}</div>
        <span className="chip player__role">{p.role}</span>
        <div className="player__stats">
          <div>
            <b>{p.rating}</b>
            <span>{showRating ? "Rating" : "Avg"}</span>
          </div>
          <div>
            <b>{p.hs}</b>
            <span>{p.hs === "—" ? "KDA" : "Headshot"}</span>
          </div>
          <div>
            <b>{p.mvp}</b>
            <span>MVPs</span>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function RosterView() {
  const content = useContent();
  const teams = content.teams;
  const [activeTeam, setActiveTeam] = useState(
    () => teams.find((x) => x.id === "val")?.id ?? teams[0]?.id ?? (teams.length ? teams[0].id : ""),
  );
  const t = teams.find((x) => x.id === activeTeam) ?? teams[0];

  const achvSec = (
    <div style={{ marginTop: "64px" }}>
      <SectionHead
        eyebrow="Hall of records"
        title="Spartan achievements"
        desc="Player achievements, records and awards live here. Staff drop them into public/uploads/data later."
      />
      {t ? (
        <div className="achvgrid stagger">
          {t.roster.map((p, i) => (
            <div className={`achv ${i === 0 ? "is-cap" : ""}`} key={`${t.id}-${p.no}`}>
              <div className="achv__head">
                <span className="achv__no">#{p.no}</span>
                <b>{p.ign}</b>
              </div>
              <div className="achv__list">
                <span className="achv__empty">
                  {ico("star", 13)} No achievements yet
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Pending
          title="No achievements yet"
          sub="Team Name · Coach: —"
        />
      )}
    </div>
  );

  const jerseySec = (
    <div style={{ marginTop: "64px" }}>
      <SectionHead
        eyebrow="Kit room"
        title="Team jerseys"
        desc="The current jersey kit for every division. PNGs dropped into public/uploads/jerseys appear here automatically."
      />
      {content.uploads.jerseys.length ? (
        <>
          <div className="jersey-showcase reveal reveal--scale">
            <Jersey3D items={content.uploads.jerseys} />
          </div>
          <div className="jerseywall stagger">
            {content.uploads.jerseys.map((u, i) => (
              <figure className="jersey" key={`${u}-${i}`}>
                <img src={u} alt={`ALRS jersey ${i + 1}`} loading="lazy" />
              </figure>
            ))}
          </div>
        </>
      ) : (
        <Pending
          title="No jerseys uploaded yet"
          sub="Drop jersey PNG files into public/uploads/jerseys and they will be displayed here on the next build."
        />
      )}
    </div>
  );

  if (!t) {
    return (
      <>
        <Phero
          crumb="Roster"
          title={
            <>
              Meet the
              <br />
              <span className="red">Spartans</span>
            </>
          }
          lead="Division rosters will be published here once announced. Tryouts, when open, are available to all Alangilan students."
          meta={<span className="chip">Open tryouts</span>}
          big="R.O.S.T.E.R"
        />

        <section className="section">
          <div className="container">
            <Pending
              title="No rosters published yet"
              sub="Player names, roles, records and stats will appear here as soon as the divisions are announced."
            />
            {achvSec}
            {jerseySec}
          </div>
        </section>

        <CtaBand />
      </>
    );
  }

  const wins = t.record.split("–")[0]?.trim().replace("W", "") ?? "0";
  const losses = t.record.split("–")[1]?.trim().replace("L", "") ?? "0";

  return (
    <>
      <Phero
        crumb="Roster"
        title={
          <>
            Meet the
            <br />
            <span className="red">Spartans</span>
          </>
        }
        lead="Every division fields a starting five plus a developmental squad. Tryouts run at the start of each semester — and the door is open to all Alangilan students."
        meta={
          <>
            <span className="chip chip--red">{teams.length} Divisions</span>
            <span className="chip">Open tryouts</span>
            <span className="chip chip--gold">Coached by officers</span>
          </>
        }
        big="R.O.S.T.E.R"
      />

      <section className="section">
        <div className="container">
          <div className="team-switch reveal" role="tablist">
            {teams.map((x) => (
              <button
                className={`team-btn ${x.id === t.id ? "is-active" : ""}`}
                role="tab"
                aria-selected={x.id === t.id}
                type="button"
                key={x.id}
                data-team={x.id}
                onClick={() => setActiveTeam(x.id)}
              >
                <span
                  className="team-btn__ico"
                  style={
                    x.id === t.id
                      ? { background: "linear-gradient(135deg,var(--red),var(--red-700))" }
                      : undefined
                  }
                >
                  {ico("gamepad", 17)}
                </span>
                <span>
                  <b>{x.game}</b>
                  <span>
                    {x.name} · {x.tag}
                  </span>
                </span>
              </button>
            ))}
          </div>

          <div className="team-hero reveal" id="teamHero">
            <div>
              <span className="eyebrow">{t.tag} division</span>
              <h2 style={{ marginTop: "4px" }}>{t.name}</h2>
              <p className="muted" style={{ marginTop: "8px" }}>
                Head coach: <strong>{t.coach}</strong>
              </p>
            </div>
            <div className="team-hero__record">
              <div>
                <b className="red">{wins}</b>
                <span>Wins</span>
              </div>
              <div>
                <b>{losses}</b>
                <span>Losses</span>
              </div>
              <div>
                <b className="gold">{t.rank.split(" ")[0]}</b>
                <span>Seed</span>
              </div>
            </div>
          </div>

          <div className="grid g-3 stagger" id="rosterGrid">
            {t.roster.map((p, i) => (
              <PlayerCard p={p} t={t} key={`${t.id}-${i}`} />
            ))}
          </div>

          <div className="notice notice--red reveal" style={{ marginTop: "34px" }}>
            {ico("users", 18)}
            <span>
              <strong>Tryouts for the {t.game} division</strong> open at the start of next quarter.
              Recruit-tier members get first-window registration — no experience required.
            </span>
          </div>

          {achvSec}
          {jerseySec}
        </div>
      </section>

      <CtaBand />
    </>
  );
}
