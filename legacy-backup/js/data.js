/* ==========================================================================
   ALRS · data.js — brand assets + all site content
   ========================================================================== */

const HELM_PLUME_D = 'M32 12 A30 30 0 0 1 60.19 31.74 L52.67 34.48 A22 22 0 0 0 32 20 Z';
const HELM_SHELL_D = 'M10 42 A22 22 0 0 1 54 42 V57 L51 63 H44 V51 H35.5 V63 H28.5 V51 H20 V63 H13 L10 57 Z M19 43.6 V49.4 H27.6 V43.6 Z M36.4 43.6 V49.4 H45 V43.6 Z';

const LOGO_SVG = `
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Alangilan Red Spartans helmet mark">
  <path fill="var(--mark-plume, #FF2138)" d="${HELM_PLUME_D}"/>
  <path fill="var(--mark-shell, #F2F3F7)" fill-rule="evenodd" d="${HELM_SHELL_D}"/>
</svg>`;

/* Full horizontal lockup: helmet + wordmark */
const LOGO_LOCKUP_SVG = `
<svg viewBox="0 0 560 132" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Alangilan Red Spartans Esports logo">
  <g transform="translate(6 8) scale(1.72)">
    <path fill="var(--mark-plume, #FF2138)" d="${HELM_PLUME_D}"/>
    <path fill="var(--mark-shell, #F2F3F7)" fill-rule="evenodd" d="${HELM_SHELL_D}"/>
  </g>
  <g font-family="Chakra Petch, Segoe UI, sans-serif">
    <text x="132" y="58" font-size="47" font-weight="700" letter-spacing="4" fill="var(--mark-shell, #F2F3F7)">ALANGILAN</text>
    <text x="132" y="102" font-size="47" font-weight="700" letter-spacing="4" fill="var(--mark-plume, #FF2138)">RED SPARTANS</text>
    <rect x="132" y="114" width="330" height="2" fill="var(--mark-plume, #FF2138)" opacity=".65"/>
    <text x="472" y="120" font-size="17" font-weight="600" letter-spacing="7" fill="var(--mark-shell, #F2F3F7)" opacity=".8">ESPORTS</text>
  </g>
</svg>`;

const ALRS = {
  brand: {
    name: 'Alangilan Red Spartans Esports',
    short: 'ALRS',
    uni: 'Batangas State University',
    campus: 'The National Engineering University · Alangilan Campus',
    founded: 2019,
    motto: 'Molon Labe',
    mottoEn: 'Come and take them',
    creed: 'We do not retreat',
    logo: LOGO_SVG,
    lockup: LOGO_LOCKUP_SVG,
    helmA: HELM_PLUME_D,
    helmB: HELM_SHELL_D
  },

  nav: [
    { id: 'home',         label: 'Home',         hint: 'Landing' },
    { id: 'about',        label: 'About',        hint: 'The org' },
    { id: 'roster',       label: 'Roster',       hint: 'Teams' },
    { id: 'tournaments',  label: 'Tournaments',  hint: 'Schedule' },
    { id: 'membership',   label: 'Membership',   hint: 'Tiers' },
    { id: 'marketplace',  label: 'Marketplace',  hint: 'Sponsors' },
    { id: 'community',    label: 'Community',    hint: 'Hub' },
    { id: 'dashboard',    label: 'Dashboard',    hint: 'Account' }
  ],

  /* Still-empty content. Sections are blank until the staff drops real files
     into uploads/ (see uploads/data/*.csv + uploads/README.md) or edits this
     file. Nothing on the site is fabricated. */

  marquee: [],
  stats: [],

  values: [],

  /* Overridden by uploads/data/officers.csv when present */
  officers: [],

  timeline: [],

  /* ---------------------------------------------------------------- teams */
  teams: [],

  /* ----------------------------------------------------------- tournaments */
  nextMatch: null,

  schedule: [],
  results: [],
  bracket: [],

  /* -------------------------------------------------------------- membership */
  billing: { sem: { label: 'Per Semester', mult: 1 }, year: { label: 'Per Year', mult: 1.7 } },

  tiers: [],
  compare: { cols: [], rows: [] },
  faq: [],

  /* ------------------------------------------------------------- sponsors */
  sponsors: [],

  /* ------------------------------------------------------------- community */
  feed: [],
  leaderboard: [],
  events: [],
  badges: [],
  perks: [],
  activity: [],

  socials: [
    { label:'Facebook', icon:'f',  href:'#/community' },
    { label:'Discord',  icon:'◎',  href:'#/community' },
    { label:'Twitch',   icon:'t',  href:'#/community' },
    { label:'YouTube',  icon:'▶',  href:'#/community' },
    { label:'TikTok',   icon:'♪',  href:'#/community' }
  ]
};

window.ALRS = ALRS;