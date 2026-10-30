"use client";

/* ==========================================================================
   ALRS · CommunityView — community route (ported from views.js community())
   ========================================================================== */

import { useContent, useUI } from "@/components/ui/ui-context";
import { store, useStore } from "@/lib/store";
import { ico } from "@/lib/icons";
import type { FeedPost } from "@/lib/types";
import { CtaBand, Pending, Phero, SectionHead } from "./shared";

function PostCard({
  p,
  i,
  liked,
  onLike,
  onComment,
}: {
  p: FeedPost;
  i: number;
  liked: boolean;
  onLike: (i: number) => void;
  onComment: () => void;
}) {
  return (
    <article className="post">
      <span className={`post__ava ${p.gold ? "gold" : ""}`}>{p.ini}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="post__head">
          <b>{p.who}</b>
          {p.gold ? <span className="chip chip--gold">Official</span> : <span className="chip">Member</span>}
          <span className="mono">{p.time}</span>
        </div>
        <p className="post__body">{p.body}</p>
        <div className="post__acts">
          <button
            className={`post__act ${liked ? "is-on" : ""}`}
            type="button"
            data-like={i}
            onClick={() => onLike(i)}
          >
            {ico("heart", 14)} <span>{p.likes + (liked ? 1 : 0)}</span>
          </button>
          <button className="post__act" type="button" onClick={onComment}>
            {ico("chat", 14)} <span>{p.comments}</span>
          </button>
          <button
            className="post__act"
            type="button"
            onClick={onComment}
          >
            {ico("external", 14)} <span>Share</span>
          </button>
        </div>
      </div>
    </article>
  );
}

export default function CommunityView() {
  const content = useContent();
  const { toast, openEnroll } = useUI();
  const st = useStore();

  return (
    <>
      <Phero
        crumb="Community"
        title={
          <>
            The Spartan
            <br />
            <span className="red">hub</span>
          </>
        }
        lead="Announcements, standings, events and the wall of badges — everything the ALRS Discord does, synced to your membership."
        meta={
          <>
            <span className="chip chip--live">
              <i className="dot" />{" "}
              {content.feed.length ? `${content.feed.length} new posts` : "No posts yet"}
            </span>
            <span className="chip">
              {content.events.length ? `${content.events.length} events` : "No events"}
            </span>
            <span className="chip chip--gold">Open to all students</span>
          </>
        }
        big="HUB"
      />

      {content.sponsors.length ? (
        <section className="section section--tight section--surface">
          <div className="container">
            <SectionHead
              eyebrow="Backed by"
              title="Our partners"
              desc="The sponsors helping fuel the Spartan season."
            />
            <div className="logos stagger">
              {content.sponsors.slice(0, 8).map((s) => (
                <div className="logo" key={s.id} title={s.name}>
                  {content.uploads.sponsorLogos[s.id] ? (
                    <img src={content.uploads.sponsorLogos[s.id]} alt={`${s.name} logo`} />
                  ) : (
                    <span>{s.mono}</span>
                  )}
                  <b>{s.name}</b>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="section">
        <div className="container">
          <div className="comm-grid">
            <div>
              <SectionHead eyebrow="Feed" title="From the officer council" desc="" />
              {content.feed.length ? (
                <div className="feed stagger" id="feedList">
                  {content.feed.map((p, i) => (
                    <PostCard
                      key={i}
                      p={p}
                      i={i}
                      liked={st.likes.indexOf(i) !== -1}
                      onLike={(idx) => store.toggleLike(idx)}
                      onComment={() =>
                        toast("Threads open in the community hub", "Sign in to reply as a Spartan.")
                      }
                    />
                  ))}
                </div>
              ) : (
                <Pending
                  title="Nothing posted yet"
                  sub="Announcements from the officer council and members will appear here."
                />
              )}

              <div className="card card--flat reveal" style={{ marginTop: "26px", textAlign: "center" }}>
                <p className="muted" style={{ marginBottom: "16px" }}>
                  Members can post directly from their dashboard.
                </p>
                <button
                  className="btn btn--ghost"
                  type="button"
                  onClick={() =>
                    st.member
                      ? toast("Compose", "Open your dashboard to publish a new post.")
                      : openEnroll("recruit")
                  }
                >
                  {ico("plus", 16)} New post
                </button>
              </div>
            </div>

            <aside>
              <div className="side-card reveal reveal--right">
                <h5>
                  {ico("trophy", 15)} Season leaderboard
                </h5>
                {content.leaderboard.length ? (
                  <div className="lb">
                    <div className="lb__head">
                      <span>#</span>
                      <span>Spartan</span>
                      <span>XP</span>
                      <span>Events</span>
                      <span>Tier</span>
                    </div>
                    {content.leaderboard.map((r) => (
                      <div className="lb__row" key={r.r}>
                        <span className="lb__rank">{r.r}</span>
                        <span className="lb__who">
                          <span className="lb__ava">{r.name.charAt(0)}</span>
                          <span>
                            <b>{r.name}</b>
                            <span>{r.div}</span>
                          </span>
                        </span>
                        <span className="lb__xp">{r.xp.toLocaleString()}</span>
                        <span className="lb__num">{r.ev}</span>
                        <span
                          className={`chip ${
                            r.tier === "Strategos"
                              ? "chip--gold"
                              : r.tier === "Spartan"
                                ? "chip--red"
                                : ""
                          } lb__tag`}
                        >
                          {r.tier}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="muted" style={{ padding: "14px 0" }}>
                    Standings will appear here once members compete.
                  </p>
                )}
              </div>

              <div className="side-card reveal reveal--right">
                <h5>
                  {ico("calendar", 15)} Upcoming events
                </h5>
                <div className="stack" style={{ gap: "11px" }}>
                  {content.events.length ? (
                    content.events.map((e, i) => (
                      <div className="event" key={i}>
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
                      </div>
                    ))
                  ) : (
                    <p className="muted" style={{ padding: "14px 0" }}>
                      No events scheduled yet — check back soon.
                    </p>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {content.badges.length ? (
        <section className="section section--surface">
          <div className="container">
            <SectionHead
              eyebrow="Achievements"
              title="The badge wall"
              desc="Badges unlock automatically as you compete, volunteer and contribute. Hover to inspect — locked ones stay grey until earned."
            />
            <div className="badgegrid stagger">
              {content.badges.map((b) => (
                <div
                  className={`badge ${b.on ? "" : "is-locked"}`}
                  title={b.hint}
                  key={b.name}
                >
                  <span className="badge__ico">{b.ico === " founding" ? "🛡️" : b.ico}</span>
                  <b>{b.name}</b>
                  <span>{b.on ? b.hint : "Locked"}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <CtaBand />
    </>
  );
}
