/* ==========================================================================
   ALRS · types.ts — shared content + domain models
   ========================================================================== */

export type RouteId =
  | "home"
  | "about"
  | "roster"
  | "tournaments"
  | "membership"
  | "marketplace"
  | "community"
  | "dashboard";

export interface NavItem {
  id: RouteId;
  label: string;
  hint: string;
}

export interface SocialLink {
  label: string;
  icon: string;
  href: string;
}

export interface Brand {
  name: string;
  short: string;
  uni: string;
  campus: string;
  founded: number;
  motto: string;
  mottoEn: string;
  creed: string;
}

export interface Stat {
  val: number;
  suffix?: string;
  label: string;
  gold?: boolean;
}

export interface ValueItem {
  ico: string;
  title: string;
  body: string;
}

export interface TimelineItem {
  when: string;
  title: string;
  desc: string;
}

export interface Player {
  no: number | string;
  ign: string;
  real: string;
  role: string;
  rating: string;
  hs: string;
  mvp: string | number;
}

export interface Team {
  id: string;
  tag: string;
  game: string;
  name: string;
  coach: string;
  record: string;
  rank: string;
  accent: string;
  roster: Player[];
}

export interface NextMatch {
  date: string;
  stage: string;
  event: string;
  where: string;
  a: { seed: string; name: string };
  b: { seed: string; name: string };
}

export interface ScheduleItem {
  d: string;
  m: string;
  day: string;
  a: string;
  b: string;
  tag: string;
  ev: string;
  time: string;
}

export interface ResultItem {
  w: boolean;
  a: string;
  b: string;
  ev: string;
  when: string;
  sa: number | string;
  sb: number | string;
}

export interface BracketMatch {
  a: string;
  b: string;
  as: number;
  bs: number;
  done: boolean;
}

export interface BracketRound {
  round: string;
  matches: BracketMatch[];
}

export interface TierPerk {
  on: boolean;
  t: string;
}

export interface Tier {
  id: string;
  name: string;
  tagline: string;
  desc: string;
  price: { sem: number; year: number };
  perks: TierPerk[];
  cta: string;
  featured?: boolean;
  invite?: boolean;
  flag?: string;
}

export interface CompareTable {
  cols: string[];
  rows: (string | boolean)[][];
}

export interface FaqItem {
  q: string;
  a: string;
}

export type SponsorTier = "Principal" | "Partner" | "Affiliate";

export type RewardShape = "voucher" | "perk";

export interface Sponsor {
  id: string;
  name: string;
  mono: string;
  cat: string;
  tier: SponsorTier;
  deal: string;
  code: string;
  cost: number;
  shape?: RewardShape;
}

export interface Officer {
  name: string;
  position: string;
  committee: string;
  division: string;
  email: string;
  social: string;
  photo: string;
}

export interface FeedPost {
  ini: string;
  who: string;
  gold?: boolean;
  time: string;
  body: string;
  likes: number;
  comments: number;
}

export interface LeaderRow {
  r: number;
  name: string;
  div: string;
  xp: number;
  ev: number;
  tier: string;
}

export interface EventItem {
  d: string;
  m: string;
  title: string;
  where: string;
  meta: string;
  state: string;
}

export interface Badge {
  name: string;
  ico: string;
  hint: string;
  on?: boolean;
}

export interface Perk {
  ico: string;
  t: string;
  s: string;
}

export interface ActivityItem {
  ico: string;
  t: string;
  s: string;
  pts: string;
}

export interface BillingModes {
  sem: { label: string; mult: number };
  year: { label: string; mult: number };
}

/* ------------------------------------------------------------ uploads --- */

export interface UploadsInfo {
  ready: boolean;
  sources: string[];           // which uploads actually landed ('defaults' when none)
  logo: string | null;         // /uploads/logo/logo.*
  coreLogo: string | null;     // /uploads/logo/logo-core.*
  sponsorLogos: Record<string, string>;
  officerPhotos: Record<string, string>;
  jerseys: string[];
  characters: string[];        // /uploads/characters/* — background hero art
}

/* ------------------------------------------------------------- content --- */

export interface SiteContent {
  brand: Brand;
  nav: NavItem[];
  socials: SocialLink[];

  marquee: string[];
  stats: Stat[];
  values: ValueItem[];
  officers: Officer[];
  timeline: TimelineItem[];

  teams: Team[];

  nextMatch: NextMatch | null;
  schedule: ScheduleItem[];
  results: ResultItem[];
  bracket: BracketRound[];

  billing: BillingModes;
  tiers: Tier[];
  compare: CompareTable;
  faq: FaqItem[];

  sponsors: Sponsor[];

  feed: FeedPost[];
  leaderboard: LeaderRow[];
  events: EventItem[];
  badges: Badge[];
  perks: Perk[];

  uploads: UploadsInfo;
}
