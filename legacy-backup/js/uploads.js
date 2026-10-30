/* ==========================================================================
   ALRS · uploads.js — optional files dropped into /uploads override defaults
   Reads: logo, sponsor logos, officers.csv, members.csv, sponsors.csv
   ========================================================================== */
window.ALRSUploads = (function () {
  'use strict';

  const ROOT = 'uploads/';
  const EXTS = ['png', 'svg', 'webp', 'jpg', 'jpeg'];

  const state = {
    ready: false,
    csv: false,          // data/*.csv can be read (http only)
    art: null,           // uploads/logo/logo.* (full render, used for brand/favicon)
    coreArt: null,       // uploads/logo/logo-core.* (shadow-free silhouette for the holo stage)
    sponsorLogos: {},    // sponsor id -> image url
    officers: [],
    officerPhotos: {},   // officer name -> image url
    memberCount: 0,
    sponsors: [],
    sources: []          // which uploads actually landed
  };

  function bust(url) {
    /* file:// pages resolve URLs literally and ignore query strings — no
       HTTP cache exists there, so caching-busting is pointless (and `?...`
       on a file path can fail). Only bust on http(s). */
    if (location.protocol === 'file:') return url;
    return url + (url.indexOf('?') > -1 ? '&' : '?') + 'v=' + Date.now();
  }

  function probeImage(url) {
    return new Promise((resolve) => {
      const img = new Image();
      let done = false;
      const finish = (ok) => { if (!done) { done = true; resolve(ok); } };
      img.onload = () => finish(true);
      img.onerror = () => finish(false);
      setTimeout(() => finish(false), 4000);
      img.src = bust(url);
    });
  }

  /* first extension that exists wins, all probed in parallel */
  function anyImage(dir, base) {
    return Promise.all(EXTS.map((ext) => {
      const url = dir + base + '.' + ext;
      return probeImage(url).then((ok) => (ok ? url : null));
    })).then((hits) => hits.filter(Boolean)[0] || null);
  }

  function readText(url) {
    if (!state.csv) return Promise.resolve(null);
    return fetch(bust(url), { cache: 'no-store' })
      .then((r) => (r && r.ok ? r.text() : null))
      .catch(() => null);
  }

  function parseCSV(text) {
    if (!text) return [];
    if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);

    const rows = [];
    let row = [], cell = '', quoted = false;

    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (quoted) {
        if (c === '"') {
          if (text[i + 1] === '"') { cell += '"'; i++; } else { quoted = false; }
        } else cell += c;
      } else if (c === '"') {
        quoted = true;
      } else if (c === ',') {
        row.push(cell); cell = '';
      } else if (c === '\n' || c === '\r') {
        if (c === '\r' && text[i + 1] === '\n') i++;
        row.push(cell); cell = '';
        if (row.some((v) => v.trim() !== '')) rows.push(row);
        row = [];
      } else cell += c;
    }
    row.push(cell);
    if (row.some((v) => v.trim() !== '')) rows.push(row);
    if (rows.length < 2) return [];

    const head = rows.shift().map((h) => h.trim().toLowerCase().replace(/\s+/g, ''));
    return rows.map((r) => {
      const o = {};
      head.forEach((h, i) => { o[h] = (r[i] || '').trim(); });
      return o;
    }).filter((o) => head.some((k) => o[k] !== ''));
  }

  /* ------------------------------------------------------------- apply --- */
  function applyLogo() {
    const maskSrc = state.coreArt || state.art;
    if (!state.art && !maskSrc) return;
    document.documentElement.classList.add('has-custom-logo');
    /* bust() = fresh URL every load, so no browser cache can ever serve a
       stale copy of the same filename after a logo swap */
    const abs = new URL(bust(maskSrc), document.baseURI).href;
    const mask = 'url("' + encodeURI(abs) + '")';
    document.documentElement.style.setProperty('--helm-mask', mask);
    document.documentElement.style.setProperty('--helm-art', mask);
    ALRS.brand.logo = '<img class="logo-img" src="' + bust(state.art) +
      '" alt="Alangilan Red Spartans Esports logo">';
    ALRS.brand.logoSrc = bust(state.art);

    const fav = document.querySelector('link[rel~="icon"]');
    if (fav) { fav.setAttribute('href', bust(state.art)); fav.setAttribute('type', 'image/' + state.art.split('.').pop()); }
  }

  function applyOfficers() {
    if (!state.officers.length) return;
    ALRS.officers = state.officers.map((o, i) => ({
      name: o.name || 'Officer ' + (i + 1),
      position: o.position || 'Officer',
      committee: o.committee || 'Committee',
      division: o.division || '',
      email: o.email || '',
      social: o.social || '',
      photo: o.photo || ''
    }));
    state.sources.push('officers.csv');
  }

  function applyMembers() {
    if (state.memberCount > 0) {
      const hit = ALRS.stats.filter((s) => /spartan|member/i.test(s.label));
      if (hit.length) hit.forEach((s) => { s.val = state.memberCount; });
      else ALRS.stats.unshift({ val: state.memberCount, suffix: '+', label: 'Active Spartans' });
      state.sources.push('members.csv');
    }
  }

  function applySponsors() {
    if (!state.sponsors.length) return;
    ALRS.sponsors = state.sponsors.map((s, i) => ({
      id: s.id || ('partner' + (i + 1)),
      name: s.name || 'Partner ' + (i + 1),
      mono: s.mono || (s.name || 'P').slice(0, 2).toUpperCase(),
      cat: s.cat || 'Partner',
      tier: ['Principal', 'Partner', 'Affiliate'].indexOf(s.tier) > -1 ? s.tier : 'Affiliate',
      deal: s.deal || 'Member perk — ask the officer council for details.',
      code: s.code || 'ALRS',
      cost: Math.max(0, parseInt(s.cost, 10) || 50)
    }));
    state.sources.push('sponsors.csv');
  }

  /* ---------------------------------------------------------------- load --- */
  function load() {
    if (state.ready) return Promise.resolve(state);

    state.csv = location.protocol !== 'file:';
    const canRead = state.csv;

    const logoP = anyImage(ROOT + 'logo/', 'logo').then((url) => {
      state.art = url;
      if (url) state.sources.push('logo' + url.slice(url.lastIndexOf('.')));
    });

    const coreP = anyImage(ROOT + 'logo/', 'logo-core').then((url) => {
      state.coreArt = url;
      if (url) state.sources.push('logo-core' + url.slice(url.lastIndexOf('.')));
    });

    const officersP = readText(ROOT + 'data/officers.csv').then((t) => {
      state.officers = parseCSV(t);
      if (state.officers.length) {
        return Promise.all(state.officers.map((o) =>
          o.photo
            ? anyImage(ROOT + 'officers/', o.photo.replace(/\.[a-z0-9]+$/i, '')).then((u) => {
                if (u) state.officerPhotos[o.name] = u;
              })
            : null
        ));
      }
      return null;
    });

    const membersP = readText(ROOT + 'data/members.csv').then((t) => {
      state.memberCount = parseCSV(t).length;
    });

    const sponsorsP = readText(ROOT + 'data/sponsors.csv').then((t) => {
      state.sponsors = parseCSV(t);
    });

    const work = Promise.all([logoP, coreP, officersP, membersP, sponsorsP])
      .then(() => {
        applyLogo();
        applyOfficers();
        applyMembers();
        applySponsors();

        return Promise.all(ALRS.sponsors.map((s) =>
          anyImage(ROOT + 'sponsors/', s.id).then((u) => { if (u) state.sponsorLogos[s.id] = u; })
        ));
      })
      .then(() => { state.ready = true; return state; });

    /* if the 3.5s cap wins, finish quietly and let the page refresh itself later */
    let capped = false;
    work.then(() => {
      if (capped && typeof state.onLate === 'function') state.onLate(state);
    }).catch(() => {});

    const cap = new Promise((res) => setTimeout(() => { capped = true; res(state); }, 3500));
    return Promise.race([work, cap]).then((res) => {
      state.ready = true;
      if (canRead && !state.sources.length) state.sources.push('defaults');
      return res;
    });
  }

  return {
    state: state,
    load: load,
    logoSrc: function () { return state.art; },
    sponsorLogo: function (id) { return state.sponsorLogos[id] || null; },
    officerPhoto: function (name) { return state.officerPhotos[name] || null; }
  };
})();
