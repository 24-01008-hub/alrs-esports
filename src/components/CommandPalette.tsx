"use client";

/* ==========================================================================
   ALRS · CommandPalette (⌘K) — port of legacy app.js cmdk block
   ========================================================================== */

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useContent, useUI } from "./ui/ui-context";
import { ROUTE_PATH } from "@/lib/data";

interface CmdItem {
  g: string;
  t: string;
  s: string;
  k: string;
  run: () => void;
}

const GROUP_ICON: Record<string, string> = {
  Pages: "▸",
  Teams: "⚔",
  Membership: "★",
  Marketplace: "◆",
  Actions: "◆",
};

export default function CommandPalette() {
  const content = useContent();
  const { cmdOpen, closeCmd, openEnroll } = useUI();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const index = useMemo<CmdItem[]>(() => {
    const items: CmdItem[] = [];
    content.nav.forEach((n) =>
      items.push({
        g: "Pages",
        t: n.label,
        s: n.hint,
        k: `${n.label} ${n.id}`,
        run: () => router.push(ROUTE_PATH[n.id]),
      }),
    );
    content.teams.forEach((x) =>
      items.push({
        g: "Teams",
        t: `${x.game} — ${x.name}`,
        s: `${x.record} · ${x.rank}`,
        k: `${x.game} ${x.name} ${x.tag}`,
        run: () => router.push(`/roster?team=${encodeURIComponent(x.id)}`),
      }),
    );
    content.sponsors.forEach((s) =>
      items.push({
        g: "Marketplace",
        t: s.name,
        s: `${s.cat} · ${s.deal.slice(0, 46)}…`,
        k: `${s.name} ${s.cat}`,
        run: () => router.push("/marketplace"),
      }),
    );
    content.tiers.forEach((t) =>
      items.push({
        g: "Membership",
        t: `${t.name} tier`,
        s: `${t.price.sem === 0 ? "Free" : `₱${t.price.sem}`} · ${t.tagline}`,
        k: `${t.name} tier membership`,
        run: () => openEnroll(t.id),
      }),
    );
    items.push({
      g: "Actions",
      t: "Enrol in ALRS",
      s: "Open the membership wizard",
      k: "join sign up enroll register",
      run: () => openEnroll("spartan"),
    });
    items.push({
      g: "Actions",
      t: "My dashboard",
      s: "Digital ID, XP and wallet",
      k: "dashboard account id wallet xp",
      run: () => router.push("/dashboard"),
    });
    items.push({
      g: "Actions",
      t: "Next tournament",
      s: "Schedule, bracket and results",
      k: "tournament match bracket schedule countdown",
      run: () => router.push("/tournaments"),
    });
    items.push({
      g: "Actions",
      t: "Community feed",
      s: "Posts, events, leaderboard",
      k: "community feed events leaderboard badges",
      run: () => router.push("/community"),
    });
    return items;
  }, [content, router, openEnroll]);

  const visible = useMemo(() => {
    const term = q.trim().toLowerCase();
    return index
      .filter(
        (i) =>
          !term ||
          `${i.t} ${i.s} ${i.k}`.toLowerCase().indexOf(term) !== -1,
      )
      .slice(0, 12);
  }, [index, q]);

  /* reset + focus on open */
  useEffect(() => {
    if (cmdOpen) {
      setQ("");
      setSel(0);
      const t = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [cmdOpen]);

  useEffect(() => {
    setSel(0);
  }, [q]);

  /* keep the highlighted row visible */
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(".cmdk__item.is-sel");
    el?.scrollIntoView({ block: "nearest" });
  }, [sel, visible]);

  const run = () => {
    const item = visible[sel];
    if (!item) return;
    closeCmd();
    setTimeout(() => item.run(), 40);
  };

  const move = (delta: number) => {
    if (!visible.length) return;
    setSel((s) => (s + delta + visible.length) % visible.length);
  };

  if (!cmdOpen) return null;

  return (
    <div className="cmdk is-open" id="cmdk" aria-hidden="false" role="dialog" aria-label="Command palette">
      <div className="cmdk__scrim" onClick={closeCmd} />
      <div className="cmdk__panel">
        <div className="cmdk__input">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={q}
            placeholder="Search pages, teams, perks…"
            autoComplete="off"
            spellCheck={false}
            aria-label="Search commands"
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                move(1);
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                move(-1);
              } else if (e.key === "Enter") {
                e.preventDefault();
                run();
              }
            }}
          />
          <span className="mono kbd">ESC</span>
        </div>

        <div className="cmdk__results" id="cmdResults" ref={listRef}>
          {!visible.length ? (
            <div className="cmdk__empty">
              No matches for “{q}”.
              <br />
              <span className="mono faint">Try “roster”, “perks” or “join”.</span>
            </div>
          ) : (
            visible.map((i, idx) => {
              const newGroup = idx === 0 || visible[idx - 1].g !== i.g;
              return (
                <div key={`${i.g}-${i.t}`}>
                  {newGroup && <div className="cmdk__group">{i.g}</div>}
                  <button
                    type="button"
                    className={`cmdk__item ${idx === sel ? "is-sel" : ""}`}
                    onMouseEnter={() => setSel(idx)}
                    onClick={run}
                  >
                    <span className="ci-icon">{GROUP_ICON[i.g] ?? "◆"}</span>
                    <span>
                      <span className="ci-title">{i.t}</span>
                      <br />
                      <span className="ci-sub">{i.s}</span>
                    </span>
                    <span className="ci-go">↵</span>
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="cmdk__foot">
          <span className="mono">↑↓ navigate</span>
          <span className="mono">↵ open</span>
          <span className="mono">esc close</span>
        </div>
      </div>
    </div>
  );
}
