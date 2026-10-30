/* ==========================================================================
   ALRS · data.ts — brand assets + all site content (base layer)

   Content sections start intentionally empty. Staff drop CSVs/images into
   public/uploads/ (see public/uploads/README.md) and the server loader in
   uploads.ts merges them in. Nothing on the site is fabricated.
   ========================================================================== */

import type { SiteContent, RouteId } from "./types";

/** Fixed committee tabs for the About → Officers & Committees board. */
export const OFFICER_TABS = [
  "Executive Committee",
  "ALRS Officers",
  "Publication",
  "Documentation",
  "Marketing",
  "Creative and Talents",
  "Technical",
  "Games Committee",
] as const;

export const NAV: { id: RouteId; label: string; hint: string }[] = [
  { id: "home", label: "Home", hint: "Landing" },
  { id: "about", label: "About", hint: "The org" },
  { id: "roster", label: "Roster", hint: "Teams" },
  { id: "tournaments", label: "Events", hint: "Bulletin board" },
  { id: "membership", label: "Membership", hint: "Tiers" },
  { id: "marketplace", label: "Marketplace", hint: "Redeem" },
  { id: "community", label: "Community", hint: "Hub" },
  { id: "dashboard", label: "Dashboard", hint: "Account" },
];

export const ROUTE_PATH: Record<RouteId, string> = {
  home: "/",
  about: "/about",
  roster: "/roster",
  tournaments: "/tournaments",
  membership: "/membership",
  marketplace: "/marketplace",
  community: "/community",
  dashboard: "/dashboard",
};

export const PATH_ROUTE: Record<string, RouteId> = Object.fromEntries(
  Object.entries(ROUTE_PATH).map(([id, path]) => [path, id as RouteId]),
) as Record<string, RouteId>;

export const SITE_TITLES: Record<RouteId, string> = {
  home: "ALRS — Alangilan Red Spartans Esports",
  about: "About · ALRS Red Spartans",
  roster: "Roster · ALRS Red Spartans",
  tournaments: "Events · ALRS Red Spartans",
  membership: "Membership · ALRS Red Spartans",
  marketplace: "Redeem · ALRS Marketplace",
  community: "Community Hub · ALRS",
  dashboard: "Member Dashboard · ALRS",
};

export function createBaseContent(): SiteContent {
  return {
    brand: {
      name: "Alangilan Red Spartans Esports",
      short: "ALRS",
      uni: "Batangas State University",
      campus: "The National Engineering University · Alangilan Campus",
      founded: 2019,
      motto: "Fueling Victory",
      mottoEn: "",
      creed: "We do not retreat",
    },

    nav: NAV,
    socials: [
      { label: "Facebook", icon: "f", href: "/community" },
      { label: "Discord", icon: "◎", href: "/community" },
      { label: "Twitch", icon: "t", href: "/community" },
      { label: "YouTube", icon: "▶", href: "/community" },
      { label: "TikTok", icon: "♪", href: "/community" },
    ],

    marquee: [],
    stats: [],
    values: [],
    officers: [],
    timeline: [],

    teams: [],

    nextMatch: null,
    schedule: [],
    results: [],
    bracket: [],

    billing: {
      sem: { label: "Per Semester", mult: 1 },
      year: { label: "Per Year", mult: 1.7 },
    },
    tiers: [],
    compare: { cols: [], rows: [] },
    faq: [],

    sponsors: [],

    feed: [],
    leaderboard: [],
    events: [],
    badges: [],
    perks: [],

    uploads: {
      ready: false,
      sources: [],
      logo: null,
      coreLogo: null,
      sponsorLogos: {},
      officerPhotos: {},
      jerseys: [],
      characters: [],
    },
  };
}
