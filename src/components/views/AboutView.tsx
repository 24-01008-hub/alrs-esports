"use client";

/* ==========================================================================
   ALRS · AboutView — about route (ported from views.js about())
   ========================================================================== */

import { useState } from "react";
import { useContent } from "@/components/ui/ui-context";
import { ico } from "@/lib/icons";
import { OFFICER_TABS } from "@/lib/data";
import type { Officer, UploadsInfo } from "@/lib/types";
import { CtaBand, Pending, Phero, SectionHead, StatBlock } from "./shared";

function UploadsChip({ uploads }: { uploads: UploadsInfo }) {
  if (!uploads.ready) return null;
  const src = uploads.sources.filter((s) => s !== "defaults");
  if (!src.length) return null;
  const csvs = src.filter((s) => s.indexOf(".csv") !== -1);
  return (
    <div className="upload-note reveal">
      <span className="chip chip--ok">Live data</span>
      <span className="mono muted">uploads/data/{csvs.join(", ") || src.join(", ")}</span>
    </div>
  );
}

export default function AboutView() {
  const content = useContent();

  const offList = content.officers || [];
  const [offTab, setOffTab] = useState(0);

  const keyOf = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "");
  const assignedTab = (o: Officer): string => {
    const c = keyOf(o.committee || "");
    if (!c) return "ALRS Officers";
    const hit = OFFICER_TABS.find((t) => {
      const k = keyOf(t);
      return k.includes(c) || c.includes(k);
    });
    return hit ?? "ALRS Officers";
  };
  const activeTab = OFFICER_TABS[offTab];
  const tabCounts = OFFICER_TABS.map((t) => offList.filter((o) => assignedTab(o) === t).length);
  const shown = offList.filter((o) => assignedTab(o) === activeTab);

  return (
    <>
      <Phero
        crumb="About"
        title={
          <>
            Engineers who
            <br />
            <span className="red">refuse to lose</span>
          </>
        }
        lead="ALRS is the official student esports organization of the Alangilan Campus. Its complete story, officers and history are published as the season unfolds."
        meta={
          <>
            <span className="chip chip--red">EST. {content.brand.founded}</span>
            <span className="chip">Student-Led</span>
            <span className="chip chip--gold">{content.brand.motto}</span>
          </>
        }
        big="ALRS"
      />

      <section className="section">
        <div className="container split">
          <div className="reveal reveal--left">
            <span className="eyebrow">The Creed</span>
            <div className="mission-panel">
              <blockquote>
                Competitors are built the same way as engineers — with discipline, iteration and no wasted
                motion.
              </blockquote>
              <cite>ALRS Officer Council · AY {content.brand.founded}—current</cite>
            </div>
            <div className="stack" style={{ marginTop: "26px" }}>
              <p>
                Every Spartan carries two obligations: perform in the server, and represent BatStateU Alangilan
                with honour outside of it — academic good standing, community spirit and a record anyone can
                verify.
              </p>
              <p>
                ALRS fields coaches, analysts, casters, content crews and an operations team — all students, all
                volunteers, all in.
              </p>
            </div>
          </div>

          <div className="campus reveal reveal--right">
            <div className="campus__art">
              <span className="campus__sun" />
            </div>
            <div className="campus__body">
              <div className="factrow">
                <span>University</span>
                <b>Batangas State University</b>
              </div>
              <div className="factrow">
                <span>Campus</span>
                <b>Alangilan · The National Engineering University</b>
              </div>
              <div className="factrow">
                <span>Founded</span>
                <b>AY {content.brand.founded}–20</b>
              </div>
              <div className="factrow">
                <span>Divisions</span>
                <b>(N/A)</b>
              </div>
              <div className="factrow">
                <span>Home base</span>
                <b>(N/A)</b>
              </div>
              <div className="factrow">
                <span>Motto</span>
                <b className="gold">
                  {content.brand.motto}
                  {content.brand.mottoEn ? <> — “{content.brand.mottoEn}”</> : null}
                </b>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--surface">
        <div className="container">
          <SectionHead
            eyebrow="What we stand for"
            title="Values we live by"
            desc="Published once the officer council sets the Spartan code."
          />
          {content.values.length ? (
            <div className="grid g-3 stagger">
              {content.values.map((v, i) => (
                <article className="card" key={i}>
                  <span className="card__num">0{i + 1}</span>
                  <div className="card__ico">{v.ico}</div>
                  <h4>{v.title}</h4>
                  <p>{v.body}</p>
                </article>
              ))}
            </div>
          ) : (
            <Pending
              title="No values published yet"
              sub="Core values will appear here once agreed by the officer council."
            />
          )}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead
            eyebrow="The council"
            title="Officers & committees"
            desc="Each committee is listed below. Officers are published once appointed by the council."
          />
          <div className="tabs reveal" role="tablist" aria-label="Officer committees">
            {OFFICER_TABS.map((t, i) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={i === offTab}
                className={`tab ${i === offTab ? "is-active" : ""}`}
                onClick={() => setOffTab(i)}
              >
                {t}
                <span className="tab__count">{tabCounts[i]}</span>
              </button>
            ))}
          </div>
          {shown.length ? (
            <div className="officergrid stagger">
              <div className="officerboard" key={activeTab}>
                <div className="officerboard__head">
                  <span className="officerboard__num mono">0{offTab + 1}</span>
                  <b>{activeTab}</b>
                  <span className="chip chip--gold">{shown.length}</span>
                </div>
                {shown.map((o) => {
                  const ava = content.uploads.officerPhotos[o.name] || null;
                  const ini = o.name
                    .replace(/"[^"]*"/g, "")
                    .trim()
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((w) => w.charAt(0))
                    .join("")
                    .toUpperCase();
                  return (
                    <div className="officer" key={o.name}>
                      <span className="officer__ava">{ava ? <img src={ava} alt={o.name} /> : ini}</span>
                      <div className="officer__body">
                        <b>{o.name}</b>
                        <span className="officer__pos">{o.position}</span>
                        <div className="officer__meta">
                          {o.division ? <span className="chip chip--red">{o.division}</span> : null}
                          {o.social ? <span className="chip mono">{o.social}</span> : null}
                          {o.email ? (
                            <a className="chip" href={`mailto:${o.email}`} aria-label={`Email ${o.name}`}>
                              {ico("external", 12)}
                            </a>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <Pending
              title="Nothing appointed yet"
              sub={`No officers have been named under ${activeTab}. Entries will appear here once announced.`}
            />
          )}
          <UploadsChip uploads={content.uploads} />
        </div>
      </section>

      <section className="section section--surface">
        <div className="container">
          <SectionHead
            eyebrow="The road so far"
            title="Our story"
            desc="The organization’s timeline, from its founding to the present."
          />
          {content.timeline.length ? (
            <div className="timeline reveal">
              {content.timeline.map((e, i) => (
                <div className="tl" key={i}>
                  <div className="tl__when">{e.when}</div>
                  <div className="tl__title">{e.title}</div>
                  <div className="tl__desc">{e.desc}</div>
                </div>
              ))}
            </div>
          ) : (
            <Pending
              title="Nothing here yet"
              sub="Key moments in the organization’s history will appear here once published."
            />
          )}
        </div>
      </section>

      {content.stats.length ? (
        <section className="section section--tight">
          <div className="container">
            <div className="statbar stagger">
              {content.stats.map((s, i) => (
                <StatBlock key={i} s={s} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <CtaBand />
    </>
  );
}
