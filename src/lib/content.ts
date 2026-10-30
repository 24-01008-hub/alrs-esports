/* ==========================================================================
   ALRS · content.ts (server) — base content + public/uploads/ merge
   ========================================================================== */

import { createBaseContent } from "./data";
import { loadUploads, normalizeSponsors } from "./uploads";
import type { SiteContent } from "./types";

/** Fresh SiteContent on every call — base objects are never mutated. */
export function getContent(): SiteContent {
  const content = createBaseContent();
  const up = loadUploads();

  content.uploads = {
    ready: true,
    sources: up.sources,
    logo: up.logo,
    coreLogo: up.coreLogo ?? up.logo,
    sponsorLogos: up.sponsorLogos,
    officerPhotos: up.officerPhotos,
    jerseys: up.jerseys,
    characters: up.characters,
  };

  /* officers.csv replaces the (empty) base officer list */
  if (up.officers.length) content.officers = up.officers;

  /* Roster teams are auto-derived from the officers' division column */
  if (up.teams.length) content.teams = up.teams;

  /* sponsors.csv replaces the base sponsor list entirely */
  if (up.sponsorRows.length) content.sponsors = normalizeSponsors(up.sponsorRows);

  /* members.csv row count feeds the "Active Spartans" stat */
  if (up.memberCount > 0) {
    const hit = content.stats.filter((s) => /spartan|member/i.test(s.label));
    if (hit.length) {
      hit.forEach((s) => {
        s.val = up.memberCount;
      });
    } else {
      content.stats.unshift({
        val: up.memberCount,
        suffix: "+",
        label: "Active Spartans",
      });
    }
  }

  return content;
}
