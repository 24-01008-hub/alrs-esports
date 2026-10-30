/* ==========================================================================
   ALRS · format.ts — currency + date helpers
   ========================================================================== */

export function price(n: number): string {
  return n === 0 ? "Free" : "₱" + n.toLocaleString("en-PH");
}

export function fmtDate(iso: string | number | Date, opts?: Intl.DateTimeFormatOptions) {
  return new Date(iso).toLocaleDateString("en-PH", opts);
}

export function fmtDateTime(iso: string | number | Date, opts?: Intl.DateTimeFormatOptions) {
  return new Date(iso).toLocaleString("en-PH", opts);
}

export const LONG_DATE: Intl.DateTimeFormatOptions = {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
};

export const CARD_DATE: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "2-digit",
  year: "numeric",
};

/** Split "W8–L3" style records into wins/losses for the team hero. */
export function recordParts(record: string) {
  const [w, l] = record.split("–");
  return {
    wins: (w || "").trim().replace("W", ""),
    losses: (l || "").trim().replace("L", ""),
  };
}

export function seedOf(rank: string) {
  return (rank || "").split(" ")[0];
}
