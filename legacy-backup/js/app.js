/* ==========================================================================
   ALRS · app.js — boot, router, interactions, enrollment wizard, cmd-k
   ========================================================================== */
(function () {
  'use strict';

  const esc = UI.esc, ico = UI.ico;
  const $  = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));

  const ROUTES = ['home', 'about', 'roster', 'tournaments', 'membership', 'marketplace', 'community', 'dashboard'];
  let current = null;
  let countdownTimer = null;

  /* =====================================================================
     BRAND INJECTION
     ===================================================================== */
  function paintBrand() {
    ['brandMark', 'preloaderMark', 'footerMark'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = ALRS.brand.logo;
    });

    const nav = $('#mainNav'), drawer = $('#drawerNav');
    if (nav) {
      nav.innerHTML = ALRS.nav.map((n) =>
        `<a href="#/${n.id}" data-nav data-route="${n.id}">${n.label}</a>`).join('');
    }
    if (drawer) {
      drawer.innerHTML = ALRS.nav.map((n, i) =>
        `<a href="#/${n.id}" data-nav data-route="${n.id}">${n.label}<span>0${i + 1} · ${n.hint}</span></a>`).join('');
    }

    const social = $('#footerSocial');
    if (social) {
      social.innerHTML = ALRS.socials.map((s) =>
        `<a href="${s.href}" data-nav aria-label="${s.label}" title="${s.label}">${s.icon}</a>`).join('');
    }

    const yr = $('#year');
    if (yr) yr.textContent = new Date().getFullYear();
  }

  /* =====================================================================
     ROUTER
     ===================================================================== */
  function parseHash() {
    const h = (location.hash || '').replace(/^#\/?/, '').split('?')[0].trim();
    return ROUTES.indexOf(h) !== -1 ? h : 'home';
  }

  function render(opts) {
    opts = opts || {};
    const route = parseHash();
    const root = $('#view');
    if (!root) return;
    const keepY = opts.keepScroll ? window.scrollY : 0;
    current = route;

    const fn = ALRSViews[route] || ALRSViews.home;
    root.classList.remove('view-enter');
    root.innerHTML = fn();
    void root.offsetWidth;
    root.classList.add('view-enter');

    $$('#mainNav a, #drawerNav a').forEach((a) => {
      a.classList.toggle('is-active', a.dataset.route === route);
    });

    document.title = ({
      home: 'ALRS — Alangilan Red Spartans Esports',
      about: 'About · ALRS Red Spartans',
      roster: 'Roster · ALRS Red Spartans',
      tournaments: 'Tournaments · ALRS Red Spartans',
      membership: 'Membership · ALRS Red Spartans',
      marketplace: 'Sponsor Marketplace · ALRS',
      community: 'Community Hub · ALRS',
      dashboard: 'Member Dashboard · ALRS'
    })[route];

    window.scrollTo({ top: keepY, behavior: 'auto' });
    if (window.ALRSFX) ALRSFX.enhance(root);
    startCountdowns(root);
    syncAuthBtn();

    closeDrawer();
    const h1 = $('h1', root);
    if (h1) h1.setAttribute('tabindex', '-1');
  }

  function go(route) {
    if (parseHash() === route) render();
    else location.hash = '#/' + route;
  }

  /* =====================================================================
     COUNTDOWNS
     ===================================================================== */
  function startCountdowns(root) {
    if (countdownTimer) clearInterval(countdownTimer);
    const nodes = $$('[data-countdown]', root);
    if (!nodes.length) return;

    const tick = () => {
      const now = Date.now();
      nodes.forEach((n) => {
        const diff = new Date(n.dataset.countdown).getTime() - now;
        const abs = Math.max(0, diff);
        const d = Math.floor(abs / 864e5);
        const h = Math.floor(abs / 36e5) % 24;
        const m = Math.floor(abs / 6e4) % 60;
        const s = Math.floor(abs / 1e3) % 60;
        const set = (k, v) => { const el = n.querySelector(`[data-cd="${k}"]`); if (el) el.textContent = String(v).padStart(2, '0'); };
        set('d', d); set('h', h); set('m', m); set('s', s);
        if (diff <= 0 && !n.dataset.done) { n.dataset.done = '1'; }
      });
    };
    tick();
    countdownTimer = setInterval(tick, 1000);
  }

  /* =====================================================================
     DRAWER
     ===================================================================== */
  function openDrawer() {
    const d = $('#drawer'), b = $('#burger');
    if (!d) return;
    d.classList.add('is-open');
    d.setAttribute('aria-hidden', 'false');
    if (b) b.setAttribute('aria-expanded', 'true');
    document.body.classList.add('no-scroll');
  }
  function closeDrawer() {
    const d = $('#drawer'), b = $('#burger');
    if (!d) return;
    d.classList.remove('is-open');
    d.setAttribute('aria-hidden', 'true');
    if (b) b.setAttribute('aria-expanded', 'false');
    if (!$('#modalRoot').classList.contains('is-open')) document.body.classList.remove('no-scroll');
  }

  /* =====================================================================
     COMMAND PALETTE
     ===================================================================== */
  function buildIndex() {
    const items = [];
    ALRS.nav.forEach((n) => items.push({ g: 'Pages', t: n.label, s: n.hint, go: () => go(n.id), k: n.label + ' ' + n.id }));
    ALRS.teams.forEach((x) => items.push({ g: 'Teams', t: x.game + ' — ' + x.name, s: x.record + ' · ' + x.rank, go: () => { ALRSViews.setTeam(x.id); go('roster'); }, k: x.game + ' ' + x.name + ' ' + x.tag }));
    ALRS.sponsors.forEach((s) => items.push({ g: 'Marketplace', t: s.name, s: s.cat + ' · ' + s.deal.slice(0, 46) + '…', go: () => go('marketplace'), k: s.name + ' ' + s.cat }));
    ALRS.tiers.forEach((t) => items.push({ g: 'Membership', t: t.name + ' tier', s: (t.price.sem === 0 ? 'Free' : '₱' + t.price.sem) + ' · ' + t.tagline, go: () => { openEnroll(t.id); }, k: t.name + ' tier membership' }));
    items.push({ g: 'Actions', t: 'Enrol in ALRS', s: 'Open the membership wizard', go: () => openEnroll('spartan'), k: 'join sign up enroll register' });
    items.push({ g: 'Actions', t: 'My dashboard', s: 'Digital ID, XP and wallet', go: () => go('dashboard'), k: 'dashboard account id wallet xp' });
    items.push({ g: 'Actions', t: 'Next tournament', s: 'Schedule, bracket and results', go: () => go('tournaments'), k: 'tournament match bracket schedule countdown' });
    items.push({ g: 'Actions', t: 'Community feed', s: 'Posts, events, leaderboard', go: () => go('community'), k: 'community feed events leaderboard badges' });
    return items;
  }

  let cmdIndex = [], cmdSel = 0, cmdVisible = [];

  function openCmd() {
    const el = $('#cmdk');
    if (!el) return;
    cmdIndex = buildIndex();
    el.classList.add('is-open');
    el.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
    const inp = $('#cmdInput');
    inp.value = '';
    renderCmd('');
    setTimeout(() => inp.focus(), 60);
  }

  function closeCmd() {
    const el = $('#cmdk');
    if (!el) return;
    el.classList.remove('is-open');
    el.setAttribute('aria-hidden', 'true');
    if (!$('#modalRoot').classList.contains('is-open')) document.body.classList.remove('no-scroll');
  }

  function renderCmd(q) {
    const term = q.trim().toLowerCase();
    cmdVisible = cmdIndex.filter((i) => !term || (i.t + ' ' + i.s + ' ' + i.k).toLowerCase().indexOf(term) !== -1).slice(0, 12);
    cmdSel = 0;
    const box = $('#cmdResults');
    if (!cmdVisible.length) {
      box.innerHTML = `<div class="cmdk__empty">No matches for “${esc(q)}”.<br><span class="mono faint">Try “roster”, “perks” or “join”.</span></div>`;
      return;
    }
    let html = '', group = '';
    cmdVisible.forEach((i, idx) => {
      if (i.g !== group) { group = i.g; html += `<div class="cmdk__group">${group}</div>`; }
      html += `<button class="cmdk__item ${idx === 0 ? 'is-sel' : ''}" data-cmd="${idx}">
        <span class="ci-icon">${i.g === 'Pages' ? '▸' : (i.g === 'Teams' ? '⚔' : (i.g === 'Membership' ? '★' : '◆'))}</span>
        <span><span class="ci-title">${esc(i.t)}</span><br><span class="ci-sub">${esc(i.s)}</span></span>
        <span class="ci-go">↵</span>
      </button>`;
    });
    box.innerHTML = html;
  }

  function moveCmd(delta) {
    if (!cmdVisible.length) return;
    cmdSel = (cmdSel + delta + cmdVisible.length) % cmdVisible.length;
    $$('.cmdk__item').forEach((b, i) => b.classList.toggle('is-sel', i === cmdSel));
    const sel = $('.cmdk__item.is-sel');
    if (sel) sel.scrollIntoView({ block: 'nearest' });
  }

  function runCmd() {
    const item = cmdVisible[cmdSel];
    if (!item) return;
    closeCmd();
    setTimeout(item.go, 40);
  }

  /* =====================================================================
     ENROLLMENT WIZARD
     ===================================================================== */
  let wz = { step: 0, tier: 'spartan', billing: 'sem', data: {} };

  const WZ_STEPS = ['Plan', 'Student ID', 'Gaming profile', 'Confirm'];

  function openEnroll(tierId) {
    if (!ALRS.tiers.length) {
      UI.toast('Enrolment is paused', 'Membership tiers and pricing will be announced soon.');
      return;
    }
    const store = ALRSStore;
    const existing = store.get().member;
    wz = {
      step: 0,
      tier: tierId || (existing ? existing.tier : 'spartan'),
      billing: existing ? existing.billing : ALRSViews.getBilling(),
      data: existing ? Object.assign({}, existing) : {}
    };

    const html = `
      <div class="steps" id="wzSteps">${WZ_STEPS.map((s, i) => `<i class="${i === 0 ? 'is-now' : ''}"></i>`).join('')}</div>

      <div class="wz-pane is-active" data-pane="0">
        <div class="wz-title">Pick your rank</div>
        <div class="wz-sub">You can change tiers at any time from your dashboard.</div>
        <div class="radio-cards" id="wzTiers">
          ${ALRS.tiers.map((t) => `
            <label class="radio-card">
              <input type="radio" name="wztier" value="${t.id}" ${t.id === wz.tier ? 'checked' : ''}>
              <span>${t.name}<small>${t.price.sem === 0 ? 'Free' : '₱' + t.price.sem + ' / sem'}</small></span>
            </label>`).join('')}
        </div>
        <div class="divider"></div>
        <label class="check">
          <input type="radio" name="wzbilling" value="sem" ${wz.billing === 'sem' ? 'checked' : ''}>
          <span>Billed per semester</span>
        </label>
        <label class="check" style="margin-top:12px">
          <input type="radio" name="wzbilling" value="year" ${wz.billing === 'year' ? 'checked' : ''}>
          <span>Billed annually <strong class="gold">— save ~17%</strong></span>
        </label>
      </div>

      <div class="wz-pane" data-pane="1">
        <div class="wz-title">Student identification</div>
        <div class="wz-sub">Used to verify your Alangilan enrolment and print your digital ID.</div>
        <div class="form-grid">
          <div class="field"><label>Full name <span class="req">*</span></label>
            <input class="input" name="name" placeholder="Juan Dela Cruz" required>
            <span class="field__err">Please enter your full name.</span></div>
          <div class="field"><label>BatStateU email <span class="req">*</span></label>
            <input class="input" name="email" type="email" placeholder="you@g.batu.edu.ph" required>
            <span class="field__err">Enter a valid email address.</span></div>
          <div class="field"><label>Student ID no. <span class="req">*</span></label>
            <input class="input" name="campusId" placeholder="20-12345" required>
            <span class="field__err">Student ID is required.</span></div>
          <div class="field"><label>Program / Course <span class="req">*</span></label>
            <select class="select" name="course" required>
              <option value="">Select programme</option>
              <option>BS Computer Engineering</option>
              <option>BS Electronics Engineering</option>
              <option>BS Electrical Engineering</option>
              <option>BS Mechanical Engineering</option>
              <option>BS Civil Engineering</option>
              <option>BS Industrial Engineering</option>
              <option>BS Information Technology</option>
              <option>BS Information Systems</option>
              <option>Other</option>
            </select>
            <span class="field__err">Choose your programme.</span></div>
          <div class="field"><label>Year level <span class="req">*</span></label>
            <select class="select" name="year" required>
              <option value="">Select year</option>
              <option>1st Year</option><option>2nd Year</option><option>3rd Year</option>
              <option>4th Year</option><option>5th Year</option><option>Graduate / Alumni</option>
            </select>
            <span class="field__err">Choose your year level.</span></div>
          <div class="field"><label>Division interest</label>
            <select class="select" name="division">
              <option>Open / Undecided</option>
              ${ALRS.teams.map((t) => `<option>${t.game}</option>`).join('')}
            </select></div>
        </div>
      </div>

      <div class="wz-pane" data-pane="2">
        <div class="wz-title">Your gaming profile</div>
        <div class="wz-sub">How officers will reach you for scrims and tryouts. Discord is required.</div>
        <div class="form-grid">
          <div class="field"><label>In-game name</label>
            <input class="input" name="ign" placeholder="e.g. ASHEN" maxlength="18"></div>
          <div class="field"><label>Discord handle <span class="req">*</span></label>
            <input class="input" name="discord" placeholder="spartan#0001" required>
            <span class="field__err">Discord handle is required for team comms.</span></div>
          <div class="field col-2"><label>Main role</label>
            <select class="select" name="role">
              <option>Fragger / Duelist</option><option>IGL / Shotcaller</option>
              <option>Support / Controller</option><option>Sniper / Anchor</option>
              <option>Jungler / Roamer</option><option>Caster / Content</option>
              <option>Analyst / Coach</option><option>Tournament staff</option>
            </select></div>
          <div class="field col-2"><label>Why do you want to join ALRS?</label>
            <textarea class="textarea" name="why" placeholder="A sentence or two is plenty."></textarea></div>
        </div>
      </div>

      <div class="wz-pane" data-pane="3">
        <div class="wz-title">Confirm your membership</div>
        <div class="wz-sub">Your digital Spartan ID is generated the moment you confirm.</div>
        <div id="wzSummary"></div>
        <label class="check" style="margin-top:20px">
          <input type="checkbox" name="agree" required>
          <span>I confirm the details above are correct and agree to the ALRS code of conduct, academic standing requirement and community standards.</span>
        </label>
        <div class="notice notice--red" style="margin-top:18px">
          ${ico('lock', 17)}<span>This is a front-end demo — details are stored only in your browser (localStorage) and never leave this device.</span>
        </div>
      </div>`;

    UI.openModal(html, {
      title: 'Become a Spartan',
      sub: 'Membership enrolment · 4 steps',
      label: 'Membership enrolment',
      foot: `
        <button class="btn btn--ghost btn--sm" id="wzBack" disabled>${ico('arrow', 14)} Back</button>
        <div class="row">
          <span class="mono muted" id="wzCounter">Step 1 of 4</span>
          <button class="btn btn--primary btn--sm" id="wzNext">Continue ${ico('arrow', 14)}</button>
        </div>`
    });

    wireWizard();
  }

  function wireWizard() {
    const root = $('#modalRoot');
    if (!root) return;

    $('#wzBack').addEventListener('click', () => wzGo(wz.step - 1));
    $('#wzNext').addEventListener('click', () => {
      if (wz.step < 3) { if (collectPane()) wzGo(wz.step + 1); }
      else finishEnroll();
    });
    wzGo(0);
  }

  function wzPaneData(i) { return $(`.wz-pane[data-pane="${i}"]`, $('#modalRoot')); }

  function collectPane() {
    const pane = wzPaneData(wz.step);
    if (!pane) return true;
    let ok = true;
    $$('[required]', pane).forEach((f) => {
      const wrap = f.closest('.field');
      let bad = false;
      if (f.type === 'checkbox') bad = !f.checked;
      else if (f.type === 'email') bad = !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.value.trim());
      else bad = !f.value.trim();
      if (wrap) wrap.classList.toggle('has-error', bad);
      else if (f.type === 'checkbox' && bad) { ok = false; UI.toast('Agreement required', 'Please accept the code of conduct to continue.'); }
      if (bad) ok = false;
    });
    if (!ok) UI.toast('Check the form', 'Some required fields still need attention.', 'gold');
    if (ok) $$('input, select, textarea', pane).forEach((f) => { if (f.name) wz.data[f.name] = f.value; });
    return ok;
  }

  function wzGo(step) {
    wz.step = Math.max(0, Math.min(3, step));
    $$('.wz-pane', $('#modalRoot')).forEach((p, i) => p.classList.toggle('is-active', i === wz.step));
    $$('#wzSteps i').forEach((el, i) => {
      el.classList.toggle('is-done', i < wz.step);
      el.classList.toggle('is-now', i === wz.step);
    });
    const back = $('#wzBack'), next = $('#wzNext'), counter = $('#wzCounter');
    if (back) back.disabled = wz.step === 0;
    if (next) next.innerHTML = wz.step === 3 ? `Confirm &amp; generate ID ${ico('check', 14)}` : `Continue ${ico('arrow', 14)}`;
    if (counter) counter.textContent = `Step ${wz.step + 1} of 4`;
    if (wz.step === 3) renderSummary();
  }

  function renderSummary() {
    const box = $('#wzSummary');
    if (!box) return;
    const tier = ALRS.tiers.find((t) => t.id === wz.tier) || { name: 'Spartan', price: { sem: 0, year: 0 } };
    const d = wz.data;
    const amount = tier.price[wz.billing];
    box.innerHTML = `
      <div class="card card--flat">
        <div class="grid g-2" style="gap:0 26px">
          <div class="qrow"><span>Full name</span><b>${esc(d.name || '—')}</b></div>
          <div class="qrow"><span>Email</span><b>${esc(d.email || '—')}</b></div>
          <div class="qrow"><span>Student ID</span><b>${esc(d.campusId || '—')}</b></div>
          <div class="qrow"><span>Programme</span><b>${esc(d.course || '—')}</b></div>
          <div class="qrow"><span>Year level</span><b>${esc(d.year || '—')}</b></div>
          <div class="qrow"><span>Discord</span><b>${esc(d.discord || '—')}</b></div>
          <div class="qrow"><span>In-game name</span><b>${esc(d.ign || 'Unassigned')}</b></div>
          <div class="qrow"><span>Division</span><b>${esc(d.division || 'Open')}</b></div>
        </div>
        <div class="divider"></div>
        <div class="spread">
          <div>
            <span class="mono muted">SELECTED PLAN</span>
            <div style="font-family:var(--font-display);font-size:1.35rem;text-transform:uppercase;margin-top:4px">
              ${tier.name} <span class="muted" style="font-size:.8rem">/ ${wz.billing === 'year' ? 'year' : 'semester'}</span>
            </div>
          </div>
          <div style="text-align:right">
            <span class="mono muted">TOTAL DUE</span>
            <div class="gold" style="font-family:var(--font-display);font-size:1.9rem;margin-top:2px">${amount === 0 ? '₱0' : UI.price(amount)}</div>
          </div>
        </div>
      </div>`;
  }

  function finishEnroll() {
    if (!collectPane()) return;
    const member = ALRSStore.enroll({
      tier: wz.tier,
      billing: wz.billing,
      name: wz.data.name,
      email: wz.data.email,
      campusId: wz.data.campusId,
      course: wz.data.course,
      year: wz.data.year,
      ign: wz.data.ign,
      division: wz.data.division
    });

    const tier = ALRS.tiers.find((t) => t.id === wz.tier) || { name: 'Spartan' };
    const bonus = { recruit: 100, spartan: 350, strategos: 750, legend: 2000 }[wz.tier] || 100;

    const body = $('#modalRoot .modal__body');
    body.innerHTML = `
      <div style="text-align:center">
        <span class="chip chip--ok" style="margin-bottom:18px">${ico('check', 13)} Membership active</span>
        <h3 style="text-transform:uppercase">Welcome to the Spartans, ${esc((member.name || '').split(' ')[0])}</h3>
        <p class="muted" style="margin-top:10px;max-width:46ch;margin-inline:auto">
          Your digital ID <strong class="gold">${esc(member.id)}</strong> is live. You earned <strong class="gold">+${bonus} bonus points</strong> and 500 XP.
        </p>
        <div style="display:grid;place-items:center;margin-top:26px">${UI.memberCardHTML(member, { tilt: true })}</div>
      </div>`;

    const foot = $('#modalRoot .modal__foot');
    if (foot) {
      foot.innerHTML = `
        <button class="btn btn--link" data-close-modal>Close</button>
        <div class="row">
          <button class="btn btn--ghost btn--sm" data-toast="ID saved|Your membership card is ready to share.">Save card</button>
          <a class="btn btn--primary btn--sm" href="#/dashboard" data-nav data-close-modal>Open dashboard ${ico('arrow', 14)}</a>
        </div>`;
    }

    const head = $('#modalRoot h3');
    if (head) head.textContent = 'Enrolment complete';

    UI.toast('Welcome, Spartan', `${tier.name} membership activated.`, 'ok');
    syncAuthBtn();
    if (window.ALRSFX) ALRSFX.enhance($('#modalRoot'));
  }

  /* =====================================================================
     REDEEM FLOW
     ===================================================================== */
  function openRedeem(id) {
    const s = ALRS.sponsors.find((x) => x.id === id);
    if (!s) return;
    const st = ALRSStore.get();

    if (!st.member) {
      UI.openModal(`
        <div class="center">
          <div class="card__ico" style="margin-inline:auto">${ico('lock', 22)}</div>
          <h3 style="text-transform:uppercase;margin-top:16px">Members only</h3>
          <p class="muted" style="margin-top:12px">Sponsor deals are reserved for certified ALRS members. Enrolment takes under two minutes and unlocks every code on this page.</p>
          <div class="row" style="justify-content:center;margin-top:26px">
            <button class="btn btn--primary" data-enroll="spartan">Join to redeem ${ico('arrow', 15)}</button>
            <button class="btn btn--ghost" data-close-modal>Maybe later</button>
          </div>
        </div>`, { size: 'sm', title: 'Sign in required', label: 'Sign in required' });
      return;
    }

    if (st.redeemed.indexOf(s.id) !== -1) {
      UI.openModal(`
        <div class="center">
          <span class="chip chip--ok">${ico('check', 13)} Already claimed</span>
          <h3 style="text-transform:uppercase;margin-top:16px">${esc(s.name)}</h3>
          <div class="sponsor__code" style="display:inline-block;margin-top:18px;font-size:1.05rem">${s.code}</div>
          <p class="muted" style="margin-top:16px">Show this code with your digital ALRS ID at checkout. Claimed on ${new Date().toLocaleDateString('en-PH')}.</p>
          <button class="btn btn--ghost btn--sm" style="margin-top:24px" data-close-modal>Close</button>
        </div>`, { size: 'sm', title: 'Your code', label: 'Redeemed code' });
      return;
    }

    const short = st.points < s.cost;
    UI.openModal(`
      <div class="stack" style="gap:20px">
        <div class="sponsor" style="pointer-events:none">
          <div class="sponsor__logo">${s.mono}</div>
          <div><div class="sponsor__name">${esc(s.name)}</div><div class="sponsor__cat">${esc(s.cat)}</div></div>
          <p class="sponsor__deal">${esc(s.deal)}</p>
        </div>
        <div class="qrow"><span>Your balance</span><b class="gold">${st.points} pts</b></div>
        <div class="qrow"><span>This reward costs</span><b class="${short ? 'red' : ''}">${s.cost} pts</b></div>
        <div class="qrow"><span>Balance after redemption</span><b>${st.points - s.cost} pts</b></div>
        ${short ? `<div class="notice notice--red">${ico('bolt', 17)}<span>You are <strong>${s.cost - st.points} points</strong> short. Attend events, cast a stream or referee a bracket to top up.</span></div>` : ''}
        <div class="row" style="justify-content:flex-end">
          <button class="btn btn--ghost btn--sm" data-close-modal>Cancel</button>
          <button class="btn btn--gold btn--sm" data-do-redeem="${s.id}" ${short ? 'disabled' : ''}>
            ${short ? 'Not enough points' : `Redeem for ${s.cost} pts`}
          </button>
        </div>
      </div>`, { size: 'sm', title: 'Redeem reward', sub: s.code, label: 'Redeem reward' });
  }

  function doRedeem(id) {
    const s = ALRS.sponsors.find((x) => x.id === id);
    if (!s) return;
    const res = ALRSStore.redeem(s);
    if (!res.ok) { UI.toast('Cannot redeem', 'Not enough points or already claimed.', 'gold'); return; }
    UI.closeModal();
    UI.toast('Reward unlocked', `${s.name} · code ${s.code} is now yours.`, 'gold');
    refreshMarketplace();
  }

  function refreshMarketplace() {
    if (current !== 'marketplace') return;
    const st = ALRSStore.get();
    const grid = $('#mktGrid');
    if (!grid) return;
    grid.innerHTML = ALRS.sponsors.map((s) => ALRSViews.sponsorCard(s, st.redeemed)).join('');
    const pts = $('.wallet__pts span');
    if (pts) { pts.textContent = st.points; pts.classList.add('rolling'); setTimeout(() => pts.classList.remove('rolling'), 500); }
    if (window.ALRSFX) ALRSFX.enhance(grid);
    applyMktFilter();
  }

  let mktFilter = 'all', mktQuery = '';

  function applyMktFilter() {
    const grid = $('#mktGrid');
    if (!grid) return;
    let shown = 0;
    $$('.sponsor', grid).forEach((card) => {
      const cat = card.dataset.cat, name = card.dataset.name;
      const okCat = mktFilter === 'all' || cat.indexOf(mktFilter) !== -1;
      const okQ = !mktQuery || name.indexOf(mktQuery) !== -1 || cat.indexOf(mktQuery) !== -1;
      const ok = okCat && okQ;
      card.style.display = ok ? '' : 'none';
      if (ok) shown++;
    });
    const empty = $('#mktEmpty');
    if (empty) empty.style.display = shown ? 'none' : '';
  }

  /* =====================================================================
     AUTH BUTTON
     ===================================================================== */
  function syncAuthBtn() {
    const b = $('#headerAuth');
    if (!b) return;
    const st = ALRSStore.get();
    b.textContent = st.member ? st.member.name.split(' ')[0] + ' · ID' : 'Sign in';
    b.classList.toggle('btn--solid', !!st.member);
    b.classList.toggle('btn--ghost', !st.member);
  }

  /* =====================================================================
     GLOBAL EVENT DELEGATION
     ===================================================================== */
  function onClick(e) {
    const t = e.target;

    const nav = t.closest && t.closest('[data-nav]');
    if (nav) {
      const href = nav.getAttribute('href') || '';
      if (href.indexOf('#/') === 0) {
        e.preventDefault();
        const route = href.slice(2);
        if (nav.hasAttribute('data-close-modal')) UI.closeModal();
        go(route);
      }
      return;
    }

    if (t.closest && t.closest('[data-close-modal]')) { UI.closeModal(); return; }
    if (t.closest && t.closest('[data-close-cmd]'))   { closeCmd(); return; }
    if (t.closest && t.closest('[data-close-drawer]')){ closeDrawer(); return; }

    const toastBtn = t.closest && t.closest('[data-toast]');
    if (toastBtn) {
      const parts = toastBtn.dataset.toast.split('|');
      UI.toast(parts[0], parts[1] || '', 'ok');
      return;
    }

    const enroll = t.closest && t.closest('[data-enroll]');
    if (enroll) { openEnroll(enroll.dataset.enroll); return; }

    const jsEnroll = t.closest && t.closest('.js-enroll');
    if (jsEnroll) { e.preventDefault(); openEnroll('spartan'); return; }

    const redeem = t.closest && t.closest('[data-redeem]');
    if (redeem) { openRedeem(redeem.dataset.redeem); return; }

    const doRed = t.closest && t.closest('[data-do-redeem]');
    if (doRed) { doRedeem(doRed.dataset.doRedeem); return; }

    const team = t.closest && t.closest('[data-team]');
    if (team) {
      ALRSViews.setTeam(team.dataset.team);
      render({ keepScroll: true });
      return;
    }

    const billing = t.closest && t.closest('[data-billing]');
    if (billing) {
      ALRSViews.setBilling(billing.dataset.billing);
      render({ keepScroll: true });
      UI.toast('Pricing updated', billing.dataset.billing === 'year' ? 'Annual pricing applied — best value.' : 'Semester pricing applied.');
      return;
    }

    const like = t.closest && t.closest('[data-like]');
    if (like) {
      const on = ALRSStore.toggleLike(parseInt(like.dataset.like, 10));
      const span = like.querySelector('span');
      const base = ALRS.feed[parseInt(like.dataset.like, 10)].likes;
      if (span) span.textContent = base + (on ? 1 : 0);
      like.classList.toggle('is-on', on);
      return;
    }

    const faq = t.closest && t.closest('.faq__q');
    if (faq) {
      const item = faq.parentElement;
      const open = item.classList.toggle('is-open');
      faq.setAttribute('aria-expanded', String(open));
      const a = item.querySelector('.faq__a');
      a.style.maxHeight = open ? a.scrollHeight + 'px' : '0px';
      return;
    }

    const filter = t.closest && t.closest('[data-filter]');
    if (filter) {
      $$('#mktFilters .tab').forEach((b) => b.classList.remove('is-active'));
      filter.classList.add('is-active');
      mktFilter = filter.dataset.filter;
      applyMktFilter();
      return;
    }

    const cmdItem = t.closest && t.closest('[data-cmd]');
    if (cmdItem) { cmdSel = parseInt(cmdItem.dataset.cmd, 10); runCmd(); return; }

    if (t.closest && t.closest('[data-signout]')) {
      ALRSStore.signOut();
      UI.toast('Signed out', 'Your Spartan ID has been parked.');
      syncAuthBtn();
      render();
      return;
    }

    if (t.closest && t.closest('[data-auth-cta]')) {
      if (ALRSStore.isMember()) go('dashboard');
      else openEnroll('spartan');
      return;
    }

    if (t.id === 'cmdTrigger' || (t.closest && t.closest('#cmdTrigger'))) { openCmd(); return; }
    if (t.id === 'burger' || (t.closest && t.closest('#burger'))) {
      const b = $('#burger');
      b.getAttribute('aria-expanded') === 'true' ? closeDrawer() : openDrawer();
      return;
    }
    if (t.closest && t.closest('#drawerClose')) { closeDrawer(); return; }
  }

  /* =====================================================================
     KEYBOARD
     ===================================================================== */
  function onKey(e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); $('#cmdk').classList.contains('is-open') ? closeCmd() : openCmd(); return; }

    const cmdOpen = $('#cmdk').classList.contains('is-open');
    if (cmdOpen) {
      if (e.key === 'Escape') { closeCmd(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); moveCmd(1); return; }
      if (e.key === 'ArrowUp')   { e.preventDefault(); moveCmd(-1); return; }
      if (e.key === 'Enter')     { e.preventDefault(); runCmd(); return; }
      return;
    }

    if (e.key === 'Escape') {
      if ($('#modalRoot').classList.contains('is-open')) { UI.closeModal(); return; }
      closeDrawer();
    }
  }

  /* =====================================================================
     MISC WIRES
     ===================================================================== */
  function onInput(e) {
    if (e.target.id === 'cmdInput') renderCmd(e.target.value);
    if (e.target.id === 'mktSearch') { mktQuery = e.target.value.trim().toLowerCase(); applyMktFilter(); }
  }

  function onSubmit(e) {
    if (e.target.id === 'newsletterForm') {
      e.preventDefault();
      const input = e.target.querySelector('input');
      const v = input.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { UI.toast('Check your email', 'That address does not look valid.', 'gold'); return; }
      input.value = '';
      UI.toast('Subscribed', 'Spartan Signal is on its way to your inbox.', 'ok');
    }
  }

  function onScroll() {
    const h = $('#siteHeader');
    if (h) h.classList.toggle('is-stuck', window.scrollY > 12);
  }

  /* =====================================================================
     PRELOADER
     ===================================================================== */
  function runPreloader(done) {
    const el = $('#preloader'), fill = $('#preloaderFill'), pct = $('#preloaderPct');
    if (!el) { done(); return; }
    let p = 0;
    const step = () => {
      p += Math.random() * 17 + 6;
      if (p >= 100) p = 100;
      if (fill) fill.style.width = p + '%';
      if (pct) pct.textContent = Math.floor(p) + '%';
      if (p < 100) setTimeout(step, 90 + Math.random() * 110);
      else setTimeout(() => { el.classList.add('is-done'); done(); }, 320);
    };
    step();
  }

  /* =====================================================================
     BOOT
     ===================================================================== */
  function boot() {
    paintBrand();

    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    document.addEventListener('input', onInput);
    document.addEventListener('change', (e) => {
      if (e.target.name === 'wztier') wz.tier = e.target.value;
      if (e.target.name === 'wzbilling') wz.billing = e.target.value;
    });
    document.addEventListener('submit', onSubmit);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('hashchange', render);
    ALRSStore.subscribe(() => { syncAuthBtn(); refreshMarketplace(); });

    onScroll();
    syncAuthBtn();

    /* optional files dropped into /uploads (logo, officers/members/sponsors CSV);
       started now so the uploaded logo can reach the loading screen mid-preloader */
    const uploads = window.ALRSUploads ? ALRSUploads.load() : Promise.resolve();
    if (window.ALRSUploads) {
      ALRSUploads.state.onLate = function () { paintBrand(); render({ keepScroll: true }); };
      uploads.then(function () { paintBrand(); }).catch(function () {});
    }

    runPreloader(() => {
      const start = () => {
        render();
        if (window.ALRSFX) ALRSFX.boot();
        document.body.classList.add('is-ready');
        if (!ALRSStore.isMember() && !localStorage.getItem('alrs.welcomed')) {
          try { localStorage.setItem('alrs.welcomed', '1'); } catch (err) {}
          setTimeout(() => UI.toast('Season 4 is live', 'Enrol now to claim your digital Spartan ID.', 'gold'), 1400);
        }
      };

      uploads.then(function () { paintBrand(); start(); }).catch(start);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
