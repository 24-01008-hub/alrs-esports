/* ==========================================================================
   ALRS · uploads.ts (server) — reads the optional files staff drop into
   public/uploads/ and merges them over the base content.

   Runs on the server at build/render time (works on Vercel — no runtime
   fetch, no browser file:// restrictions).
   ========================================================================== */

import fs from "node:fs";
import path from "node:path";
import type { Officer, Player, Sponsor, SponsorTier, Team } from "./types";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");
const IMAGE_EXTS = ["png", "svg", "webp", "jpg", "jpeg"];

export interface UploadsData {
  officers: Officer[];
  sponsorRows: Record<string, string>[];
  memberCount: number;
  sources: string[];
  logo: string | null;
  coreLogo: string | null;
  sponsorLogos: Record<string, string>;
  officerPhotos: Record<string, string>;
  jerseys: string[];
  characters: string[];
  teams: Team[];
}

/* ------------------------------------------------------------- helpers --- */

function dirEntries(sub: string): string[] {
  try {
    return fs.readdirSync(path.join(UPLOADS_DIR, sub));
  } catch {
    return [];
  }
}

function readText(rel: string): string | null {
  try {
    return fs.readFileSync(path.join(UPLOADS_DIR, rel), "utf8");
  } catch {
    return null;
  }
}

/** First `<base>.<ext>` that exists in public/uploads/<sub>, matched
 *  case-insensitively. Returns a web path (`/uploads/...`). */
function findImage(sub: string, base: string): string | null {
  const needle = base.toLowerCase();
  for (const file of dirEntries(sub)) {
    const ext = path.extname(file).slice(1).toLowerCase();
    const stem = path.basename(file, path.extname(file)).toLowerCase();
    if (stem === needle && IMAGE_EXTS.includes(ext)) {
      return `/uploads/${sub}/${encodeURIComponent(file)}`;
    }
  }
  return null;
}

/** RFC-4180-ish CSV parser (quotes, escaped quotes, CRLF). */
export function parseCSV(text: string | null): Record<string, string>[] {
  if (!text) return [];
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);

  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          quoted = false;
        }
      } else {
        cell += c;
      }
    } else if (c === '"') {
      quoted = true;
    } else if (c === ",") {
      row.push(cell);
      cell = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      cell = "";
      if (row.some((v) => v.trim() !== "")) rows.push(row);
      row = [];
    } else {
      cell += c;
    }
  }
  row.push(cell);
  if (row.some((v) => v.trim() !== "")) rows.push(row);
  if (rows.length < 2) return [];

  const head = rows
    .shift()!
    .map((h) => h.trim().toLowerCase().replace(/\s+/g, ""));

  return rows
    .map((r) => {
      const o: Record<string, string> = {};
      head.forEach((h, i) => {
        o[h] = (r[i] || "").trim();
      });
      return o;
    })
    .filter((o) => head.some((k) => o[k] !== ""));
}

/* ------------------------------------------------------------- derive teams --- */

const TEAM_FALLBACK_ACCENT = "#ff2138";

/** Known ALRS divisions → roster keys used by jersey labels, CSS accents, etc.
 *  Anything else still becomes a team, just without the branded metadata. */
const DIVISION_META: { match: RegExp; id: string; tag: string; game: string; accent: string }[] = [
  { match: /valorant/i, id: "val", tag: "VAL", game: "VALORANT", accent: "#ff4655" },
  { match: /(mobile legends|mlbb|ml)$/i, id: "ml", tag: "ML", game: "Mobile Legends", accent: "#38b8ff" },
  { match: /(codm|call of duty|co[d]? mobile)/i, id: "codm", tag: "CODM", game: "Call of Duty Mobile", accent: "#d9b13a" },
  { match: /(league of legends|lol)/i, id: "lol", tag: "LOL", game: "League of Legends", accent: "#7c6bff" },
  { match: /(rainbow six|r6)/i, id: "r6", tag: "R6", game: "Rainbow Six Mobile", accent: "#22d3ee" },
  { match: /(pubg mobile|pubgm|pubg)/i, id: "pubgm", tag: "PUBGM", game: "PUBG Mobile", accent: "#f59e0b" },
  { match: /(pok[eé]mon champions|poke)/i, id: "poke", tag: "POKE", game: "Pokémon Champions", accent: "#ff2d55" },
];

/** Auto-builds Roster teams from the officers list: every officer with a
 *  `division` column value becomes a player on that division's team. 100%
 *  derived from public/uploads/data/officers.csv — no fabricated content. */
export function deriveTeams(officers: Officer[]): Team[] {
  const groups = new Map<string, Officer[]>();
  for (const o of officers) {
    const div = (o.division || "").trim();
    if (!div) continue;
    const key = div.toLowerCase();
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(o);
  }

  const teams: Team[] = [];
  for (const members of groups.values()) {
    const first = members[0];
    const key = first.division.toLowerCase();
    const meta = DIVISION_META.find((m) => m.match.test(key));
    const id = (meta?.id ?? key.replace(/[^a-z0-9]+/g, "")) || `div${teams.length + 1}`;

    const roster: Player[] = members.map((o, i) => ({
      no: i + 1,
      ign: (o.social || "").replace(/^@/, "") || o.name.split(" ")[0],
      real: o.name,
      role: o.position,
      rating: "—",
      hs: "—",
      mvp: "—",
    }));

    teams.push({
      id,
      tag: meta?.tag ?? first.division.slice(0, 3).toUpperCase(),
      game: meta?.game ?? first.division,
      name: `${meta?.game ?? first.division} — ALRS Squad`,
      coach: members.find((o) => /coach/i.test(o.position))?.name ?? first.name,
      record: "0W–0L",
      rank: "—",
      accent: meta?.accent ?? TEAM_FALLBACK_ACCENT,
      roster,
    });
  }
  return teams;
}

/* ---------------------------------------------------------------- load --- */

export function loadUploads(): UploadsData {
  const sources: string[] = [];

  const logo = findImage("logo", "logo");
  if (logo) sources.push(`logo${path.extname(decodeURIComponent(logo))}`);

  const coreLogo = findImage("logo", "logo-core");
  if (coreLogo) sources.push(`logo-core${path.extname(decodeURIComponent(coreLogo))}`);

  /* ---------------------------------------------------------- officers */
  const officerRows = parseCSV(readText(path.join("data", "officers.csv")));
  const officers: Officer[] = officerRows.map((o, i) => ({
    name: o.name || `Officer ${i + 1}`,
    position: o.position || "Officer",
    committee: o.committee || "Committee",
    division: o.division || "",
    email: o.email || "",
    social: o.social || "",
    photo: o.photo || "",
  }));
  if (officers.length) sources.push("officers.csv");

  const officerPhotos: Record<string, string> = {};
  for (const o of officers) {
    if (!o.photo) continue;
    const hit = findImage("officers", o.photo.replace(/\.[a-z0-9]+$/i, ""));
    if (hit) officerPhotos[o.name] = hit;
  }

  /* ----------------------------------------------------------- members */
  const memberRows = parseCSV(readText(path.join("data", "members.csv")));
  const memberCount = memberRows.length;
  if (memberCount > 0) sources.push("members.csv");

  /* ---------------------------------------------------------- sponsors */
  const sponsorRows = parseCSV(readText(path.join("data", "sponsors.csv")));
  if (sponsorRows.length) sources.push("sponsors.csv");

  const sponsorLogos: Record<string, string> = {};
  if (sponsorRows.length) {
    for (const s of sponsorRows) {
      const id = (s.id || "").toLowerCase();
      if (!id) continue;
      const hit = findImage("sponsors", id);
      if (hit) sponsorLogos[id] = hit;
    }
  } else {
    /* no CSV — probe the demo sponsor ids documented in the README */
    for (const id of dirEntries("sponsors")) {
      const ext = path.extname(id).slice(1).toLowerCase();
      if (!IMAGE_EXTS.includes(ext)) continue;
      const stem = path.basename(id, path.extname(id)).toLowerCase();
      sponsorLogos[stem] = `/uploads/sponsors/${encodeURIComponent(id)}`;
    }
  }

  if (!sources.length) sources.push("defaults");

  /* ---------------------------------------------------------- jerseys */
  const jerseys = dirEntries("jerseys")
    .filter((f) => IMAGE_EXTS.includes(path.extname(f).slice(1).toLowerCase()))
    .sort((a, b) => a.localeCompare(b))
    .map((f) => `/uploads/jerseys/${encodeURIComponent(f)}`);
  if (jerseys.length) sources.push("jerseys/");

  /* --------------------------------------------------- background art */
  const characters = dirEntries("characters")
    .filter((f) => IMAGE_EXTS.includes(path.extname(f).slice(1).toLowerCase()))
    .sort((a, b) => a.localeCompare(b))
    .map((f) => `/uploads/characters/${encodeURIComponent(f)}`);
  if (characters.length) sources.push("characters/");

  /* ---------------------------------------------------- rosters (derived) */
  /* Teams are auto-derived from officers.csv — an officer with a division
   * column value is a player on that division's roster. Nothing fabricated:
   * no CSV means no teams, exactly like the rest of the content. */
  const teams = deriveTeams(officers);
  if (teams.length) sources.push("teams (from officers.csv)");

  return {
    officers,
    sponsorRows,
    memberCount,
    sources,
    logo,
    coreLogo,
    sponsorLogos,
    officerPhotos,
    jerseys,
    characters,
    teams,
  };
}

/* ------------------------------------------------------------- merging --- */

const TIER_ORDER: SponsorTier[] = ["Principal", "Partner", "Affiliate"];

export function normalizeSponsors(rows: Record<string, string>[]): Sponsor[] {
  return rows.map((s, i) => ({
    id: s.id || `partner${i + 1}`,
    name: s.name || `Partner ${i + 1}`,
    mono: s.mono || (s.name || "P").slice(0, 2).toUpperCase(),
    cat: s.cat || "Partner",
    tier: TIER_ORDER.includes(s.tier as SponsorTier)
      ? (s.tier as SponsorTier)
      : "Affiliate",
    deal: s.deal || "Member perk — ask the officer council for details.",
    code: s.code || "ALRS",
    cost: Math.max(0, parseInt(s.cost, 10) || 50),
    shape: s.shape === "voucher" ? "voucher" : "perk",
  }));
}
