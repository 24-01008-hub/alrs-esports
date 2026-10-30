"use client";

/* ==========================================================================
   ALRS · store.ts — persisted membership / wallet state (localStorage)
   Hydrates after mount via useSyncExternalStore (server snapshot = defaults).
   ========================================================================== */

import { useSyncExternalStore } from "react";
import type { ActivityItem } from "./types";

export interface Member {
  id: string;
  name: string;
  email: string;
  campusId: string;
  course: string;
  year: string;
  tier: string;
  billing: "sem" | "year";
  ign?: string;
  division: string;
  joined: string;
  valid: string;
  avatar: string;
  spartanCode?: string;
  games?: string[];
}

export interface StoreState {
  member: Member | null;
  points: number;
  xp: number;
  redeemed: string[];
  likes: number[];
  badges: string[];
  activity: ActivityItem[];
  enrolledAt: string | null;
}

const KEY = "alrs.member.v1";

function defaults(): StoreState {
  return {
    member: null,
    points: 480,
    xp: 1240,
    redeemed: [],
    likes: [],
    badges: [
      "Founding Shield",
      "Bracket Runner",
      "Cup Winner",
      "Caster Mic",
      "Content Crew",
      "30-Day Streak",
    ],
    activity: [],
    enrolledAt: null,
  };
}

const SERVER_SNAPSHOT: StoreState = defaults();

let state: StoreState = defaults();
const listeners = new Set<() => void>();
let hydrated = false;

function readStorage() {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) state = { ...defaults(), ...(JSON.parse(raw) as Partial<StoreState>) };
  } catch {
    state = defaults();
  }
}

function persist() {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* private mode / quota — state still lives in memory */
  }
}

function emit() {
  listeners.forEach((fn) => fn());
}

function set(patch: Partial<StoreState>) {
  state = { ...state, ...patch };
  persist();
  emit();
  return state;
}

function subscribe(cb: () => void) {
  if (!hydrated && typeof window !== "undefined") {
    hydrated = true;
    readStorage();
  }
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function getSnapshot() {
  return state;
}

function getServerSnapshot() {
  return SERVER_SNAPSHOT;
}

/* --------------------------------------------------------------- hooks --- */

export function useStore(): StoreState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/* ------------------------------------------------------------- derived --- */

export function computeLevel(xp: number) {
  const level = Math.max(1, Math.floor(xp / 2500) + 1);
  const floor = (level - 1) * 2500;
  const pct = Math.min(100, Math.round(((xp - floor) / 2500) * 100));
  return { level, pct, floor, next: floor + 2500, xp };
}

const TIER_PREFIX: Record<string, string> = {
  recruit: "RC",
  spartan: "SP",
  strategos: "ST",
  legend: "LG",
};

const TIER_BONUS: Record<string, number> = {
  recruit: 100,
  spartan: 350,
  strategos: 750,
  legend: 2000,
};

export function tierBonus(tierId: string) {
  return TIER_BONUS[tierId] ?? 100;
}

/* -------------------------------------------------------------- actions --- */

export interface EnrollPayload {
  tier: string;
  billing: "sem" | "year";
  name: string;
  email: string;
  campusId?: string;
  course?: string;
  year?: string;
  ign?: string;
  division?: string;
}

export interface SignInPayload {
  name: string;
  spartanCode: string;
  games: string[];
}

export const store = {
  isMember: () => !!state.member,

  enroll(payload: EnrollPayload): Member {
    const prefix = TIER_PREFIX[payload.tier] ?? "SP";
    const seq = String(Math.floor(Math.random() * 9000) + 1000);
    const now = new Date();
    const member: Member = {
      id: `ALRS-${prefix}-${now.getFullYear()}-${seq}`,
      name: payload.name,
      email: payload.email,
      campusId: payload.campusId || "—",
      course: payload.course || "—",
      year: payload.year || "—",
      tier: payload.tier,
      billing: payload.billing || "sem",
      ign: payload.ign || "",
      division: payload.division || "Open",
      joined: now.toISOString(),
      valid: new Date(
        now.getFullYear(),
        now.getMonth() + (payload.billing === "year" ? 12 : 5),
        now.getDate(),
      ).toISOString(),
      avatar: (payload.name || "S").trim().charAt(0).toUpperCase(),
    };
    const bonus = tierBonus(payload.tier);
    set({
      member,
      enrolledAt: member.joined,
      points: state.points + bonus,
      xp: state.xp + 500,
      activity: [
        {
          ico: "🎖️",
          t: `Enrolled as ${payload.tier}`,
          s: `${now.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })} · ${member.id}`,
          pts: "+500 XP",
        },
        ...state.activity,
      ],
    });
    return member;
  },

  signIn(payload: SignInPayload): Member {
    const existing = state.member;
    const tier = existing?.tier ?? "spartan";
    const prefix = TIER_PREFIX[tier] ?? "SP";
    const seq = String(Math.floor(Math.random() * 9000) + 1000);
    const now = new Date();
    const member: Member = {
      id: `ALRS-${prefix}-${now.getFullYear()}-${seq}`,
      name: payload.name.trim(),
      email: existing?.email ?? "",
      campusId: existing?.campusId ?? "—",
      course: existing?.course ?? "—",
      year: existing?.year ?? "—",
      tier,
      billing: existing?.billing ?? "sem",
      ign: existing?.ign ?? "",
      division: payload.games[0] ?? existing?.division ?? "Open",
      joined: now.toISOString(),
      valid: new Date(
        now.getFullYear(),
        now.getMonth() + 12,
        now.getDate(),
      ).toISOString(),
      avatar: (payload.name || "S").trim().charAt(0).toUpperCase(),
      spartanCode: payload.spartanCode.trim().toUpperCase(),
      games: payload.games,
    };
    set({
      member,
      enrolledAt: state.enrolledAt ?? member.joined,
      xp: state.xp + 25,
      activity: [
        {
          ico: "🔐",
          t: "Signed in",
          s: `${now.toLocaleString("en-PH", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })} · ${member.spartanCode}`,
          pts: "+25 XP",
        },
        ...state.activity,
      ],
    });
    return member;
  },

  updateTier(tier: string, billing?: "sem" | "year") {
    if (!state.member) return null;
    const member: Member = { ...state.member, tier, billing: billing || state.member.billing };
    set({
      member,
      xp: state.xp + 120,
      activity: [
        { ico: "⬆️", t: `Upgraded to ${tier}`, s: "Plan change applied", pts: "+120 XP" },
        ...state.activity,
      ],
    });
    return member;
  },

  signOut() {
    set({ member: null, enrolledAt: null });
  },

  addPoints(n: number, label?: string) {
    set({
      points: Math.max(0, state.points + n),
      activity: label
        ? [
            {
              ico: n >= 0 ? "✅" : "🏷️",
              t: label,
              s: new Date().toLocaleString("en-PH", { month: "short", day: "numeric" }),
              pts: `${n >= 0 ? "+" : ""}${n} ALRS`,
            },
            ...state.activity,
          ]
        : state.activity,
    });
  },

  redeem(sponsor: { id: string; name: string; code: string; cost: number }):
    | { ok: true }
    | { ok: false; reason: "already" | "short" } {
    if (state.redeemed.includes(sponsor.id)) return { ok: false, reason: "already" };
    if (state.points < sponsor.cost) return { ok: false, reason: "short" };
    set({
      points: state.points - sponsor.cost,
      redeemed: [...state.redeemed, sponsor.id],
      xp: state.xp + sponsor.cost,
      activity: [
        {
          ico: "🏷️",
          t: `Redeemed · ${sponsor.name}`,
          s: `Code ${sponsor.code} · −${sponsor.cost} ALRS`,
          pts: `+${sponsor.cost} XP`,
        },
        ...state.activity,
      ],
    });
    return { ok: true };
  },

  toggleLike(i: number) {
    const likes = [...state.likes];
    const at = likes.indexOf(i);
    if (at === -1) likes.push(i);
    else likes.splice(at, 1);
    set({ likes });
    return at === -1;
  },

  addActivity(item: ActivityItem) {
    set({ activity: [item, ...state.activity] });
  },

  reset() {
    state = defaults();
    persist();
    emit();
  },
};
