/* ==========================================================================
   ALRS · store.js — persisted membership / wallet state (localStorage)
   ========================================================================== */
(function () {
  'use strict';

  const KEY = 'alrs.member.v1';
  const listeners = new Set();

  const defaults = () => ({
    member: null,          // { id, name, email, campusId, course, year, tier, billing, joined, avatar }
    points: 480,
    xp: 1240,
    redeemed: [],          // sponsor ids
    likes: [],             // feed indexes
    badges: ['Founding Shield', 'Bracket Runner', 'Cup Winner', 'Caster Mic', 'Content Crew', '30-Day Streak'],
    activity: [],
    enrolledAt: null
  });

  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return defaults();
      return Object.assign(defaults(), JSON.parse(raw));
    } catch (e) {
      return defaults();
    }
  }

  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  function emit() { listeners.forEach((fn) => { try { fn(state); } catch (e) {} }); }

  function set(patch) {
    state = Object.assign({}, state, patch);
    persist();
    emit();
    return state;
  }

  const ALRSStore = {
    get: () => state,
    isMember: () => !!state.member,
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },

    /* ------------------------------------------------------ enrollment */
    enroll(payload) {
      const prefix = { recruit: 'RC', spartan: 'SP', strategos: 'ST', legend: 'LG' }[payload.tier] || 'SP';
      const seq = String(Math.floor(Math.random() * 9000) + 1000);
      const now = new Date();
      const member = {
        id: `ALRS-${prefix}-${now.getFullYear()}-${seq}`,
        name: payload.name,
        email: payload.email,
        campusId: payload.campusId || '—',
        course: payload.course || '—',
        year: payload.year || '—',
        tier: payload.tier,
        billing: payload.billing || 'sem',
        ign: payload.ign || '',
        division: payload.division || 'Open',
        joined: now.toISOString(),
        valid: new Date(now.getFullYear(), now.getMonth() + (payload.billing === 'year' ? 12 : 5), now.getDate()).toISOString(),
        avatar: (payload.name || 'S').trim().charAt(0).toUpperCase()
      };
      const bonus = { recruit: 100, spartan: 350, strategos: 750, legend: 2000 }[payload.tier] || 100;
      set({
        member,
        enrolledAt: member.joined,
        points: state.points + bonus,
        xp: state.xp + 500,
        activity: [{
          ico: '🎖️', t: `Enrolled as ${tierName(payload.tier)}`, s: `${now.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })} · ${member.id}`,
          pts: '+500 XP'
        }].concat(state.activity)
      });
      return member;
    },

    updateTier(tier, billing) {
      if (!state.member) return null;
      const member = Object.assign({}, state.member, { tier, billing: billing || state.member.billing });
      set({ member, activity: [{ ico: '⬆️', t: `Upgraded to ${tierName(tier)}`, s: 'Plan change applied', pts: '+120 XP' }].concat(state.activity), xp: state.xp + 120 });
      return member;
    },

    signOut() { set({ member: null, enrolledAt: null }); },

    /* ---------------------------------------------------------- wallet */
    addPoints(n, label) {
      set({
        points: Math.max(0, state.points + n),
        activity: label ? [{ ico: n >= 0 ? '✅' : '🏷️', t: label, s: new Date().toLocaleString('en-PH', { month: 'short', day: 'numeric' }), pts: (n >= 0 ? '+' : '') + n + ' pts' }].concat(state.activity) : state.activity
      });
    },

    redeem(sponsor) {
      if (state.redeemed.indexOf(sponsor.id) !== -1) return { ok: false, reason: 'already' };
      if (state.points < sponsor.cost) return { ok: false, reason: 'short' };
      set({
        points: state.points - sponsor.cost,
        redeemed: state.redeemed.concat([sponsor.id]),
        xp: state.xp + sponsor.cost,
        activity: [{ ico: '🏷️', t: `Redeemed · ${sponsor.name}`, s: `Code ${sponsor.code} · −${sponsor.cost} pts`, pts: `+${sponsor.cost} XP` }].concat(state.activity)
      });
      return { ok: true };
    },

    toggleLike(i) {
      const likes = state.likes.slice();
      const at = likes.indexOf(i);
      if (at === -1) likes.push(i); else likes.splice(at, 1);
      set({ likes });
      return at === -1;
    },

    addActivity(item) { set({ activity: [item].concat(state.activity) }); },

    /* --------------------------------------------------------- derived */
    level() {
      const xp = state.xp;
      const level = Math.max(1, Math.floor(xp / 2500) + 1);
      const floor = (level - 1) * 2500;
      const pct = Math.min(100, Math.round(((xp - floor) / 2500) * 100));
      return { level, pct, floor, next: floor + 2500, xp };
    },

    tierInfo() {
      const t = state.member ? state.member.tier : null;
      return (window.ALRS && ALRS.tiers.find((x) => x.id === t)) || null;
    },

    reset() { state = defaults(); persist(); emit(); }
  };

  function tierName(id) {
    const t = window.ALRS && ALRS.tiers.find((x) => x.id === id);
    return t ? t.name : id;
  }

  window.ALRSStore = ALRSStore;
})();
