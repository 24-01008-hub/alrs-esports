/* ==========================================================================
   ALRS · views.js — route renderers
   ========================================================================== */
(function () {
  'use strict';

  const esc = UI.ico ? UI.esc : (s) => s;
  const ico = UI.ico;
  const price = UI.price;

  /* ------------------------------------------------------------ helpers */
  const phero = (crumb, title, lead, meta, big) => `
    <section class="phero">
      <span class="phero__big" aria-hidden="true">${esc(big || '')}</span>
      <div class="container phero__inner">
        <div class="phero__crumb">
          <a href="#/home" data-nav>ALRS</a> <span>/</span> <span class="red">${esc(crumb)}</span>
        </div>
        <span class="eyebrow">${esc(crumb)}</span>
        <h1 class="reveal">${title}</h1>
        <p class="lead reveal">${lead}</p>
        ${meta ? `<div class="phero__meta reveal">${meta}</div>` : ''}
      </div>
    </section>`;

  const sectionHead = (eyebrow, title, desc, right) => `
    <div class="section__head">
      <div class="reveal">
        <span class="eyebrow">${eyebrow}</span>
        <h2>${title}</h2>
        ${desc ? `<p>${desc}</p>` : ''}
      </div>
      ${right ? `<div class="reveal reveal--right">${right}</div>` : ''}
    </div>`;

  const ctaBand = () => `
    <section class="cta-band">
      <div class="container cta-band__inner">
        <span class="eyebrow reveal">Enlist</span>
        <h2 class="reveal glitch" data-text="Your jersey is waiting">Your jersey is waiting</h2>
        <p class="lead reveal" style="margin-inline:auto">Membership takes under two minutes. Get your digital Spartan ID, unlock sponsor perks and step into the roster pipeline.</p>
        <div class="row reveal">
          <a class="btn btn--primary btn--lg magnetic" href="#/membership" data-nav>Become a Spartan ${ico('arrow', 17)}</a>
          <a class="btn btn--ghost btn--lg" href="#/roster" data-nav>Meet the roster</a>
        </div>
      </div>
    </section>`;

  const statBlock = (s) => `
    <div class="stat ${s.gold ? 'stat--gold' : ''}">
      <div class="stat__val"><span data-count="${s.val}" data-suffix="${s.suffix || ''}" data-dur="1600">0</span></div>
      <div class="stat__lbl">${s.label}</div>
    </div>`;

  const pending = (title, sub) => `
    <div class="empty reveal">
      <b>${title}</b>
      <p>${sub}</p>
    </div>`;

  /* =====================================================================
     HOME
     ===================================================================== */
  function home() {
    const A = ALRS;
    const nm = A.nextMatch;
    const featuredTiers = A.tiers.filter((t) => ['recruit', 'spartan', 'strategos'].indexOf(t.id) !== -1);

    return `
    <section class="hero">
      <div class="scanline" aria-hidden="true"></div>
      <div class="container hero__inner">
        <div class="hero__grid">
          <div>
            <div class="hero__tags reveal">
              <span class="chip chip--live"><i class="dot"></i> Season 4 · Live</span>
              <span class="chip chip--red">BatStateU · Alangilan</span>
              <span class="chip chip--gold">EST. ${A.brand.founded}</span>
            </div>

            <h1 class="display hero__title reveal">
              <span class="l1 outline">Alangilan</span>
              <span class="l1 fill-red">Red Spartans</span>
              <span class="l1 stroke-red">Esports</span>
            </h1>

            <p class="hero__copy lead reveal">The official student esports organization of Batangas State University — The National Engineering University, Alangilan Campus. Six divisions, one membership, and a digital home built by engineers who happen to compete.</p>

            <div class="hero__cta reveal">
              <a class="btn btn--primary btn--lg magnetic" href="#/membership" data-nav>Join the Spartans ${ico('arrow', 17)}</a>
              <a class="btn btn--ghost btn--lg" href="#/tournaments" data-nav>${ico('play', 15)} Watch the bracket</a>
            </div>

            <div class="hero__stats stagger">
              ${A.stats.length
                ? A.stats.slice(0, 3).map((s) => statBlock(s)).join('')
                : '<span class="chip">Org stats pending — published from uploads/data</span>'}
            </div>
          </div>

          <div class="reveal reveal--scale">
            <div class="holo3d holo3d--lg" data-holo data-depth="52" data-layers="26" aria-label="Alangilan Red Spartans Esports holographic 3D logo"></div>
          </div>
        </div>
      </div>
    </section>

    ${A.marquee.length ? `
    <div class="marquee" aria-hidden="true">
      <div class="marquee__track">
        <span>${A.marquee.join('</span><span>')}</span>
        <span>${A.marquee.join('</span><span>')}</span>
      </div>
    </div>` : ''}

    ${A.stats.length ? `
    <section class="section section--tight">
      <div class="container">
        <div class="statbar stagger">
          ${A.stats.slice(0, 4).map((s) => statBlock(s)).join('')}
        </div>
      </div>
    </section>` : ''}

    <section class="section">
      <div class="container">
        ${sectionHead('Divisions', 'Six squads. One shield.',
          'From tactical shooters to MOBA lanes, every ALRS division runs its own coaching staff, scrim block and tryout pipeline.',
          `<a class="btn btn--ghost" href="#/roster" data-nav>Full roster ${ico('arrow', 15)}</a>`)}

        ${A.teams.length
          ? `<div class="grid g-3 stagger">
          ${A.teams.map((t) => `
              <article class="card" data-tilt-team="${t.id}">
                <span class="card__num">${t.tag}</span>
                <div class="card__ico" style="color:${t.accent}">${ico('gamepad', 22)}</div>
                <span class="chip chip--red" style="margin-bottom:12px">${t.game}</span>
                <h4>${t.name} Division</h4>
                <p>Coached by ${esc(t.coach)}. Season record <strong class="red">${t.record}</strong> · ${t.rank}.</p>
                <div class="row" style="margin-top:18px">
                  <a class="btn btn--link" href="#/roster" data-nav>View squad ${ico('arrow', 14)}</a>
                </div>
              </article>`).join('')}
        </div>`
          : pending('No divisions announced yet',
            'Division rosters and records will appear here as soon as they are published.')}
      </div>
    </section>

    <section class="section section--surface">
      <div class="container">
        ${sectionHead('Next up', 'The match that matters',
          'Live brackets, countdowns and streams — all synced to the ALRS tournament calendar.')}
        ${nm ? `
        <div class="split">
          <div class="reveal reveal--left">
            <div class="match" style="grid-template-columns:auto 1fr;">
              <div class="match__when">
                <b>${new Date(nm.date).getDate()}</b>
                <span>${new Date(nm.date).toLocaleString('en-PH', { month: 'short' }).toUpperCase()}</span>
              </div>
              <div>
                <span class="chip chip--red" style="margin-bottom:12px">${ico('trophy', 12)} ${esc(nm.stage)}</span>
                <div class="match__teams" style="margin-top:10px">
                  <span class="match__team is-us"><span class="seed">${nm.a.seed}</span>${esc(nm.a.name)}</span>
                  <span class="match__vs">VS</span>
                  <span class="match__team"><span class="seed">${nm.b.seed}</span>${esc(nm.b.name)}</span>
                </div>
                <p class="mono muted" style="margin-top:14px">${esc(nm.event)}</p>
              </div>
            </div>
            <p class="mono muted" style="margin-top:16px">${ico('pin', 13)} ${esc(nm.where)}</p>
            <div class="row" style="margin-top:22px">
              <a class="btn btn--primary" href="#/tournaments" data-nav>Match hub ${ico('arrow', 15)}</a>
              <button class="btn btn--ghost" data-toast="Reminder set|We will ping you 30 minutes before go-time.">Set reminder</button>
            </div>
          </div>

          <div class="reveal reveal--right">
            <span class="eyebrow eyebrow--gold">Series starts in</span>
            <div class="countdown" data-countdown="${nm.date}">
              <div class="cd"><b data-cd="d">00</b><span>Days</span></div>
              <div class="cd"><b data-cd="h">00</b><span>Hours</span></div>
              <div class="cd"><b data-cd="m">00</b><span>Mins</span></div>
              <div class="cd"><b data-cd="s">00</b><span>Secs</span></div>
            </div>
            <div class="notice" style="margin-top:24px">
              ${ico('bolt', 17)}
              <span>Members get first-pick seating at the campus viewing deck. Your digital ID is your pass.</span>
            </div>
          </div>
        </div>` : pending('No schedule published yet', 'Upcoming matches, countdowns and streams appear here once the tournament calendar is set.')}
      </div>
    </section>

    <section class="section">
      <div class="container">
        ${sectionHead('Membership', 'Pick your rank',
          'Membership plans and perks will be announced by the officer council.',
          `<a class="btn btn--ghost" href="#/membership" data-nav>All plan details ${ico('arrow', 15)}</a>`)}
        ${A.tiers.length
          ? `<div class="grid g-3 stagger">
          ${featuredTiers.map((t) => tierCard(t)).join('')}
        </div>`
          : pending('Plans not published yet', 'Tiers, pricing and perks will appear here once the membership structure is announced.')}
      </div>
    </section>

    <section class="section section--tight section--surface">
      <div class="container">
        ${sectionHead('Partners', 'Perks from the marketplace',
          'Sponsor deals, when signed, will be listed here and redeemed with Spartan Points.',
          `<a class="btn btn--ghost" href="#/marketplace" data-nav>Open marketplace ${ico('arrow', 15)}</a>`)}
        ${A.sponsors.length
          ? `<div class="grid g-4 stagger">
          ${A.sponsors.slice(0, 4).map((s) => sponsorCard(s, ALRSStore.get().redeemed)).join('')}
        </div>`
          : pending('No partners announced yet', 'Marketplace deals will appear here once partnerships are published.')}
      </div>
    </section>

    ${ctaBand()}`;
  }

  /* =====================================================================
     ABOUT
     ===================================================================== */
  function uploadsChip() {
    if (!window.ALRSUploads || !ALRSUploads.state.ready) return '';
    const src = ALRSUploads.state.sources.filter((s) => s !== 'defaults');
    if (!src.length) return '';
    return `<div class="upload-note reveal"><span class="chip chip--ok">Live data</span>
      <span class="mono muted">uploads/data/${src.filter((s) => s.indexOf('.csv') !== -1).join(', ') || src.join(', ')}</span></div>`;
  }

  function about() {
    const A = ALRS;
    const offs = (function () {
      const map = {};
      (A.officers || []).forEach((o) => {
        const k = o.committee || 'Committee';
        (map[k] = map[k] || []).push(o);
      });
      return {
        list: A.officers || [],
        groups: Object.keys(map).map((k) => ({ name: k, list: map[k] }))
      };
    })();
    const off = offs;
    return `
    ${phero('About', 'Engineers who<br><span class="red">refuse to lose</span>',
      'ALRS is the official student esports organization of the Alangilan Campus. Its complete story, officers and history are published as the season unfolds.',
      `<span class="chip chip--red">EST. ${A.brand.founded}</span>
       <span class="chip">Student-Led</span>
       <span class="chip chip--gold">${A.brand.motto}</span>`, 'ALRS')}

    <section class="section">
      <div class="container split">
        <div class="reveal reveal--left">
          <span class="eyebrow">The Creed</span>
          <div class="mission-panel">
            <blockquote>Competitors are built the same way as engineers — with discipline, iteration and no wasted motion.</blockquote>
            <cite>ALRS Officer Council · AY ${A.brand.founded}—current</cite>
          </div>
          <div class="stack" style="margin-top:26px">
            <p>Every Spartan carries two obligations: perform in the server, and represent BatStateU Alangilan with honour outside of it — academic good standing, community spirit and a record anyone can verify.</p>
            <p>ALRS fields coaches, analysts, casters, content crews and an operations team — all students, all volunteers, all in.</p>
          </div>
        </div>

        <div class="campus reveal reveal--right">
          <div class="campus__art"><span class="campus__sun"></span></div>
          <div class="campus__body">
            <div class="factrow"><span>University</span><b>Batangas State University</b></div>
            <div class="factrow"><span>Campus</span><b>Alangilan · The National Engineering University</b></div>
            <div class="factrow"><span>Founded</span><b>AY ${A.brand.founded}–20</b></div>
            <div class="factrow"><span>Divisions</span><b>To be announced</b></div>
            <div class="factrow"><span>Home base</span><b>To be announced</b></div>
            <div class="factrow"><span>Motto</span><b class="gold">${A.brand.motto} — “${A.brand.mottoEn}”</b></div>
          </div>
        </div>
      </div>
    </section>

    <section class="section section--surface">
      <div class="container">
        ${sectionHead('What we stand for', 'Values we live by', 'Published once the officer council sets the Spartan code.')}
        ${A.values.length
          ? `<div class="grid g-3 stagger">
          ${A.values.map((v, i) => `
            <article class="card">
              <span class="card__num">0${i + 1}</span>
              <div class="card__ico">${v.ico}</div>
              <h4>${v.title}</h4>
              <p>${v.body}</p>
            </article>`).join('')}
        </div>`
          : pending('No values published yet', 'Core values will appear here once agreed by the officer council.')}
      </div>
    </section>

    <section class="section">
      <div class="container">
        ${sectionHead('The council', 'Officers &amp; committees',
          'The serving student officers will be listed here once appointed.')}
        ${off.list.length
          ? `<div class="officergrid stagger">
          ${off.groups.map((g, gi) => `
            <div class="officerboard">
              <div class="officerboard__head">
                <span class="officerboard__num mono">0${gi + 1}</span>
                <b>${esc(g.name)}</b>
                <span class="chip chip--gold">${g.list.length}</span>
              </div>
              ${g.list.map((o) => {
                const ava = (window.ALRSUploads && ALRSUploads.officerPhoto(o.name)) || null;
                const ini = o.name.replace(/"[^"]*"/g, '').trim().split(/\s+/).slice(0, 2)
                  .map((w) => w.charAt(0)).join('').toUpperCase();
                return `
                <div class="officer">
                  <span class="officer__ava">${ava ? `<img src="${ava}" alt="${esc(o.name)}">` : ini}</span>
                  <div class="officer__body">
                    <b>${esc(o.name)}</b>
                    <span class="officer__pos">${esc(o.position)}</span>
                    <div class="officer__meta">
                      ${o.division ? `<span class="chip chip--red">${esc(o.division)}</span>` : ''}
                      ${o.social ? `<span class="chip mono">${esc(o.social)}</span>` : ''}
                      ${o.email ? `<a class="chip" href="mailto:${esc(o.email)}" aria-label="Email ${esc(o.name)}">${ico('external', 12)}</a>` : ''}
                    </div>
                  </div>
                </div>`;
              }).join('')}
            </div>`).join('')}
        </div>`
          : pending('No officers announced yet', 'The officer council and its committees will be listed here once appointed.')}
        ${uploadsChip()}
      </div>
    </section>

    <section class="section section--surface">
      <div class="container">
        ${sectionHead('The road so far', 'Our story', 'The organization’s timeline, from its founding to the present.')}
        ${A.timeline.length
          ? `<div class="timeline reveal">
          ${A.timeline.map((e) => `
            <div class="tl">
              <div class="tl__when">${e.when}</div>
              <div class="tl__title">${e.title}</div>
              <div class="tl__desc">${e.desc}</div>
            </div>`).join('')}
        </div>`
          : pending('Nothing here yet', 'Key moments in the organization’s history will appear here once published.')}
      </div>
    </section>

    ${A.stats.length ? `
    <section class="section section--tight">
      <div class="container">
        <div class="statbar stagger">${A.stats.map((s) => statBlock(s)).join('')}</div>
      </div>
    </section>` : ''}

    ${ctaBand()}`;
  }

  /* =====================================================================
     ROSTER
     ===================================================================== */
  let activeTeam = 'val';

  function roster() {
    const A = ALRS;
    const t = A.teams.find((x) => x.id === activeTeam) || A.teams[0];

    if (!t) {
      return `
    ${phero('Roster', 'Meet the<br><span class="red">Spartans</span>',
      'Division rosters will be published here once announced. Tryouts, when open, are available to all Alangilan students.',
      `<span class="chip">Open tryouts</span>`, 'R.O.S.T.E.R')}

    <section class="section">
      <div class="container">
        ${pending('No rosters published yet', 'Player names, roles, records and stats will appear here as soon as the divisions are announced.')}
      </div>
    </section>

    ${ctaBand()}`;
    }

    return `
    ${phero('Roster', 'Meet the<br><span class="red">Spartans</span>',
      'Every division fields a starting five plus a developmental squad. Tryouts run at the start of each semester — and the door is open to all Alangilan students.',
      `<span class="chip chip--red">${A.teams.length} Divisions</span><span class="chip">Open tryouts</span><span class="chip chip--gold">Coached by officers</span>`, 'R.O.S.T.E.R')}

    <section class="section">
      <div class="container">
        <div class="team-switch reveal" role="tablist">
          ${A.teams.map((x) => `
            <button class="team-btn ${x.id === t.id ? 'is-active' : ''}" role="tab" aria-selected="${x.id === t.id}" data-team="${x.id}">
              <span class="team-btn__ico" style="${x.id === t.id ? 'background:linear-gradient(135deg,var(--red),var(--red-700))' : ''}">${ico('gamepad', 17)}</span>
              <span><b>${x.game}</b><span>${x.name} · ${x.tag}</span></span>
            </button>`).join('')}
        </div>

        <div class="team-hero reveal" id="teamHero">
          <div>
            <span class="eyebrow">${t.tag} division</span>
            <h2 style="margin-top:4px">${t.name}</h2>
            <p class="muted" style="margin-top:8px">Head coach: <strong>${esc(t.coach)}</strong></p>
          </div>
          <div class="team-hero__record">
            <div><b class="red">${t.record.split('–')[0].trim().replace('W', '')}</b><span>Wins</span></div>
            <div><b>${t.record.split('–')[1].trim().replace('L', '')}</b><span>Losses</span></div>
            <div><b class="gold">${t.rank.split(' ')[0]}</b><span>Seed</span></div>
          </div>
        </div>

        <div class="grid g-3 stagger" id="rosterGrid">
          ${t.roster.map((p) => playerCard(p, t)).join('')}
        </div>

        <div class="notice notice--red reveal" style="margin-top:34px">
          ${ico('users', 18)}
          <span><strong>Tryouts for the ${t.game} division</strong> open at the start of next quarter. Recruit-tier members get first-window registration — no experience required.</span>
        </div>
      </div>
    </section>

    ${ctaBand()}`;
  }

  function playerCard(p, t) {
    return `
    <article class="player">
      <div class="player__top" style="--team:${t.accent}">
        <span class="chip chip--red player__badge">${t.tag}</span>
        <span class="player__flag">#${p.no}</span>
        <span class="player__jersey">${p.no}</span>
      </div>
      <div class="player__body">
        <div class="player__ign">${esc(p.ign)}</div>
        <div class="player__real">${esc(p.real)}</div>
        <span class="chip player__role">${esc(p.role)}</span>
        <div class="player__stats">
          <div><b>${p.rating}</b><span>${t.id === 'val' || t.id === 'codm' || t.id === 'pubgm' ? 'Rating' : 'Avg'}</span></div>
          <div><b>${p.hs}</b><span>${p.hs === '—' ? 'KDA' : 'Headshot'}</span></div>
          <div><b>${p.mvp}</b><span>MVPs</span></div>
        </div>
      </div>
    </article>`;
  }

  /* =====================================================================
     TOURNAMENTS
     ===================================================================== */
  function tournaments() {
    const A = ALRS;
    const nm = A.nextMatch;
    const d = nm ? new Date(nm.date) : null;

    return `
    ${phero('Tournaments', 'The competitive<br><span class="red">calendar</span>',
      'Countdowns, brackets, VODs and results — published by the tournament operations team.',
      `<span class="chip">Schedule TBA</span><span class="chip">${A.schedule.length} upcoming</span>`, 'S.0')}

    <section class="section section--tight">
      <div class="container">
        ${nm ? `
        <div class="split">
          <div class="reveal reveal--left">
            <span class="eyebrow">${esc(nm.stage)}</span>
            <h2>${esc(nm.a.name)} <span class="muted">vs</span> ${esc(nm.b.name)}</h2>
            <p class="lead" style="margin-top:14px">${esc(nm.event)} — ${d.toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} at ${d.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' })}.</p>
            <div class="row" style="margin-top:26px">
              <button class="btn btn--primary magnetic" data-toast="Reminder set|See you at the viewing deck.">${ico('calendar', 16)} Add to calendar</button>
              <button class="btn btn--ghost" data-toast="Stream opens 15 min early|We will notify you in-app.">${ico('play', 15)} Watch live</button>
            </div>
          </div>
          <div class="reveal reveal--right">
            <span class="eyebrow eyebrow--gold">Tip-off in</span>
            <div class="countdown" data-countdown="${nm.date}">
              <div class="cd"><b data-cd="d">00</b><span>Days</span></div>
              <div class="cd"><b data-cd="h">00</b><span>Hours</span></div>
              <div class="cd"><b data-cd="m">00</b><span>Mins</span></div>
              <div class="cd"><b data-cd="s">00</b><span>Secs</span></div>
            </div>
          </div>
        </div>` : pending('No match scheduled yet', 'The next ALRS series, countdown and stream details will be posted here once confirmed.')}
      </div>
    </section>

    <section class="section section--surface">
      <div class="container">
        ${sectionHead('Schedule', 'Upcoming series', 'Matches currently announced by the tournament operations team.')}
        ${A.schedule.length
          ? `<div class="grid stagger" style="gap:14px">
          ${A.schedule.map((m) => `
            <div class="match">
              <div class="match__when"><b>${m.d}</b><span>${m.m} · ${m.day}</span></div>
              <div class="match__teams">
                <span class="match__team ${/ALRS/.test(m.a) ? 'is-us' : ''}"><span class="seed">${ico('swords', 14)}</span>${esc(m.a)}</span>
                <span class="match__vs">VS</span>
                <span class="match__team ${/ALRS/.test(m.b) ? 'is-us' : ''}"><span class="seed">${ico('shield', 14)}</span>${esc(m.b)}</span>
              </div>
              <div class="match__meta">
                <span class="chip">${esc(m.tag)}</span>
                <span class="mono muted">${esc(m.ev)} · ${m.time}</span>
              </div>
            </div>`).join('')}
        </div>`
          : pending('No matches scheduled yet', 'Upcoming series will be listed here once announced.')}
      </div>
    </section>

    <section class="section">
      <div class="container">
        ${sectionHead('Bracket', 'Tournament bracket', 'Current tournament brackets, updated as rounds complete.')}
        ${A.bracket.length
          ? `<div class="bracket stagger">
          ${A.bracket.map((col) => `
            <div class="bracket__col">
              <h5>${col.round}</h5>
              ${col.matches.map((m) => `
                <div class="bracket__match">
                  <div class="bracket__side ${m.as > m.bs && m.done ? 'win' : ''}"><span>${esc(m.a)}</span><b>${m.as}</b></div>
                  <div class="bracket__side ${m.bs > m.as && m.done ? 'win' : ''}"><span>${esc(m.b)}</span><b>${m.bs}</b></div>
                </div>`).join('')}
            </div>`).join('')}
        </div>`
          : pending('No brackets published yet', 'Brackets will appear here when a tournament is confirmed.')}
      </div>
    </section>

    <section class="section section--tight section--surface">
      <div class="container">
        ${sectionHead('Results', 'Recent results', 'Results will be posted here after each series.')}
        ${A.results.length
          ? `<div class="grid g-2 stagger">
          ${A.results.map((r) => `
            <div class="match" style="grid-template-columns:1fr auto">
              <div>
                <span class="chip ${r.w ? 'chip--ok' : 'chip--red'}">${r.w ? 'WIN' : 'LOSS'}</span>
                <div class="match__teams" style="margin-top:12px">
                  <span class="match__team ${/ALRS/.test(r.a) ? 'is-us' : ''}">${esc(r.a)}</span>
                  <span class="match__vs">vs</span>
                  <span class="match__team">${esc(r.b)}</span>
                </div>
                <p class="mono muted" style="margin-top:10px">${esc(r.ev)} · ${esc(r.when)}</p>
              </div>
              <div class="match__score">
                <span class="${r.w ? 'win' : 'lose'}">${r.sa}</span>
                <span class="faint">:</span>
                <span class="${r.w ? 'lose' : 'win'}">${r.sb}</span>
              </div>
            </div>`).join('')}
        </div>`
          : pending('No results yet', 'Match results will be posted here after each series.')}
      </div>
    </section>`;
  }

  /* =====================================================================
     MEMBERSHIP
     ===================================================================== */
  let billingMode = 'sem';

  function tierCard(t) {
    const per = billingMode;
    const amount = t.price[per];
    const isFree = t.price.sem === 0 && t.price.year === 0;
    return `
    <article class="tier ${t.featured ? 'tier--featured' : ''} ${t.invite ? 'tier--legend' : ''}">
      ${t.flag ? `<span class="tier__flag">${t.flag}</span>` : ''}
      <div class="tier__name">${t.name}</div>
      <div class="tier__desc">${t.tagline} — ${esc(t.desc)}</div>
      <div class="tier__price">
        <b>${isFree ? '₱0' : price(amount)}</b>
        <span>${isFree ? 'forever' : 'per ' + (per === 'year' && !t.invite ? 'year' : (t.invite ? 'year' : 'semester'))}</span>
      </div>
      <div class="tier__term">${t.invite ? 'Nomination required' : (isFree ? 'Student org access' : 'Cancel anytime · VAT included')}</div>
      <ul class="tier__list">
        ${t.perks.map((p) => `<li class="${p.on ? '' : 'off'}">${ico(p.on ? 'check' : 'x', 15)} <span>${esc(p.t)}</span></li>`).join('')}
      </ul>
      <button class="btn ${t.featured ? 'btn--gold' : (t.invite ? 'btn--primary' : 'btn--ghost')} btn--block" data-enroll="${t.id}">${t.cta}</button>
    </article>`;
  }

  function membership() {
    const A = ALRS;
    const demo = { id: 'ALRS-SP-2026-4821', name: 'Preview Member', tier: 'spartan', division: 'Valorant', valid: new Date(Date.now() + 1.4e10).toISOString() };

    return `
    <section class="phero memb-hero">
      <span class="phero__big" aria-hidden="true">JOIN</span>
      <div class="container phero__inner">
        <div class="phero__crumb"><a href="#/home" data-nav>ALRS</a> <span>/</span> <span class="red">Membership</span></div>
        <span class="eyebrow">Digital Membership</span>
        <div class="split" style="align-items:center">
          <div>
            <h1 class="reveal">One card.<br><span class="red">Every privilege.</span></h1>
            <p class="lead reveal">Your ALRS membership is a verified digital ID, a wallet of Spartan Points, and a key to every sponsor deal we sign. Enrolment takes under two minutes.</p>
            <div class="phero__meta reveal">
              <span class="chip chip--red">Instant digital ID</span>
              <span class="chip">Spartan Points</span>
              <span class="chip chip--gold">No lock-in</span>
            </div>
            <div class="hero__cta reveal">
              <button class="btn btn--primary btn--lg magnetic" data-enroll="spartan">Start enrolment ${ico('arrow', 17)}</button>
              <a class="btn btn--ghost btn--lg" href="#/community" data-nav>Talk to a Spartan</a>
            </div>
          </div>
          <div class="memb-hero__cardwrap reveal reveal--right">
            ${UI.memberCardHTML(demo, { tilt: true, id: 'demoCard' })}
            <p class="mono muted" style="margin-top:16px;text-align:center">Preview · your details appear after enrolment</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        ${sectionHead('Tiers', 'Choose your rank',
          'Membership tiers, pricing and benefits will be announced by the officer council.')}

        ${A.tiers.length
          ? `<div>
        <div class="billing-toggle" id="billingToggle">
            <button class="${billingMode === 'sem' ? 'is-active' : ''}" data-billing="sem">Semester</button>
            <button class="${billingMode === 'year' ? 'is-active' : ''}" data-billing="year">Annual <span class="gold">−17%</span></button>
          </div>
        <div class="grid g-4 stagger" style="margin-top:var(--gap,26px)">
          ${A.tiers.map((t) => tierCard(t)).join('')}
        </div>
        </div>`
          : pending('Membership plans not published yet', 'Tiers, pricing and perks will appear here as soon as the membership structure is announced.')}
      </div>
    </section>

    <section class="section section--surface">
      <div class="container">
        ${sectionHead('Compare', 'Every perk, side by side', 'No fine print. What you see is what ships to your account.')}
        ${A.compare.rows.length
          ? `<div class="compare-wrap reveal">
          <table class="compare">
            <thead>
              <tr><th>Benefit</th>${A.compare.cols.map((c, i) => `<th class="${i === 2 ? 'col-feat' : ''}">${c}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${A.compare.rows.map((r) => `
                <tr>
                  <th scope="row">${r[0]}</th>
                  ${r.slice(1).map((v, i) => `<td class="${v ? 'yes' : 'no'} ${i === 2 ? 'col-feat' : ''}">${v ? '✓' : '—'}</td>`).join('')}
                </tr>`).join('')}
            </tbody>
          </table>
        </div>`
          : pending('No comparison published yet', 'A side-by-side of membership tiers will appear here once plans are announced.')}
      </div>
    </section>

    ${A.perks.length || A.faq.length ? `
    <section class="section">
      <div class="container split" style="align-items:start">
        ${A.perks.length ? `
        <div class="reveal reveal--left">
          <span class="eyebrow">Member perks</span>
          <h2>What the card actually unlocks</h2>
          <p class="lead" style="margin-top:14px">Membership benefits unlock as your tier and activity progress.</p>
          <div class="stack" style="margin-top:26px;gap:14px">
            ${A.perks.map((p) => `
              <div class="perk">
                <span class="perk__ico">${p.ico}</span>
                <span><b>${p.t}</b><span>${p.s}</span></span>
              </div>`).join('')}
          </div>
        </div>` : ''}

        ${A.faq.length ? `
        <div class="reveal reveal--right">
          <span class="eyebrow eyebrow--gold">Questions</span>
          <div class="faq" id="faqList">
            ${A.faq.map((f, i) => `
              <div class="faq__item ${i === 0 ? 'is-open' : ''}">
                <button class="faq__q" aria-expanded="${i === 0}">${esc(f.q)}<i>+</i></button>
                <div class="faq__a" ${i === 0 ? 'style="max-height:260px"' : ''}><p>${esc(f.a)}</p></div>
              </div>`).join('')}
          </div>
        </div>` : ''}
      </div>
    </section>` : ''}

    ${ctaBand()}`;
  }

  /* =====================================================================
     MARKETPLACE
     ===================================================================== */
  function sponsorCard(s, redeemedIds) {
    const ids = Array.isArray(redeemedIds) ? redeemedIds : [];
    const redeemed = ids.indexOf(s.id) !== -1;
    const chip = s.tier === 'Principal' ? 'chip--gold' : (s.tier === 'Partner' ? 'chip--red' : '');
    const logo = window.ALRSUploads ? ALRSUploads.sponsorLogo(s.id) : null;
    return `
    <article class="sponsor" data-sponsor="${s.id}" data-name="${esc(s.name.toLowerCase())}" data-cat="${esc(s.cat.toLowerCase())}">
      <span class="sponsor__tier chip ${chip}">${s.tier}</span>
      <div class="sponsor__logo">${logo ? `<img src="${logo}" alt="${esc(s.name)} logo">` : esc(s.mono)}</div>
      <div>
        <div class="sponsor__name">${esc(s.name)}</div>
        <div class="sponsor__cat">${esc(s.cat)}</div>
      </div>
      <p class="sponsor__deal">${esc(s.deal)}</p>
      <div class="sponsor__foot">
        <span class="sponsor__code">${s.code}</span>
        ${redeemed
          ? `<span class="chip chip--ok">${ico('check', 12)} Claimed</span>`
          : `<button class="btn btn--sm btn--ghost" data-redeem="${s.id}">Redeem · ${s.cost}</button>`}
      </div>
    </article>`;
  }

  function marketplace() {
    const A = ALRS;
    const st = ALRSStore.get();
    const cats = ['All'].concat(Array.from(new Set(A.sponsors.map((s) => s.cat))));

    return `
    ${phero('Marketplace', 'Sponsor perks,<br><span class="red">member pricing</span>',
      'Every partnership ALRS signs is converted into something you can redeem. Spend Spartan Points on real gear, real food and real savings.',
      `<span class="chip chip--gold">${A.sponsors.length ? A.sponsors.length + ' live partners' : 'Partners TBA'}</span><span class="chip">Member-exclusive codes</span>`, 'PERK')}

    <section class="section">
      <div class="container">
        <div class="mkt-top">
          <div class="wallet reveal reveal--left">
            <div class="wallet__label">${st.member ? 'Spartan Points wallet' : 'Sample wallet balance'}</div>
            <div class="wallet__pts"><span data-count="${st.points}" data-dur="1400">0</span><small>PTS</small></div>
            <div class="wallet__sub">${st.member ? `Signed in as ${UI.esc(st.member.name)} · ${st.member.id}` : 'Join ALRS to earn points by attending events, refereeing and competing.'}</div>
            <div class="wallet__bar">
              <div class="spread mono muted" style="margin-bottom:8px"><span>Next tier reward</span><span>${Math.min(100, Math.round(st.points / 8))}%</span></div>
              <div class="progress progress--gold"><i style="width:${Math.min(100, Math.round(st.points / 8))}%"></i></div>
            </div>
            <div class="row" style="margin-top:22px">
              ${st.member
                ? `<a class="btn btn--gold btn--sm" href="#/dashboard" data-nav>Open dashboard ${ico('arrow', 14)}</a>`
                : `<button class="btn btn--gold btn--sm" data-enroll="spartan">Join to start earning</button>`}
              <span class="chip chip--gold">Balance ${st.points} pts</span>
            </div>
          </div>

          <div class="card card--flat reveal reveal--right" style="display:flex;flex-direction:column;justify-content:center">
            <div class="card__ico">${ico('ticket', 22)}</div>
            <h4>How points work</h4>
            <p>Check in at events, cast a stream, referee a bracket or refer a friend — points land in your wallet instantly. Redeem them here, codes unlock immediately.</p>
            <div class="stack" style="margin-top:18px;gap:9px">
              <div class="qrow"><span>Event check-in</span><b class="gold">+120</b></div>
              <div class="qrow"><span>Casting / coverage</span><b class="gold">+300</b></div>
              <div class="qrow"><span>Referee a bracket</span><b class="gold">+250</b></div>
              <div class="qrow"><span>Referral accepted</span><b class="gold">+500</b></div>
            </div>
          </div>
        </div>

        ${A.sponsors.length ? `
        <div class="filter-bar reveal">
          <div class="search-box">
            ${ico('search', 17)}
            <input type="search" id="mktSearch" placeholder="Search partners or categories…" aria-label="Search marketplace" />
          </div>
          <div class="tabs" style="border:0;padding:0;margin:0" id="mktFilters">
            ${cats.map((c, i) => `<button class="tab ${i === 0 ? 'is-active' : ''}" data-filter="${esc(c.toLowerCase())}">${esc(c)}</button>`).join('')}
          </div>
        </div>

        <div class="grid g-3 stagger" id="mktGrid">
          ${A.sponsors.map((s) => sponsorCard(s, st.redeemed)).join('')}
        </div>

        <div class="empty" id="mktEmpty" style="display:none">
          <b>No partners found</b>
          <p>Try a different search term or clear the category filter.</p>
        </div>` : pending('No partner deals published yet', 'The marketplace will list redeemable sponsor deals as soon as partnerships are announced.')}
      </div>
    </section>`;
  }

  /* =====================================================================
     COMMUNITY
     ===================================================================== */
  function community() {
    const A = ALRS;
    const st = ALRSStore.get();

    return `
    ${phero('Community', 'The Spartan<br><span class="red">hub</span>',
      'Announcements, standings, events and the wall of badges — everything the ALRS Discord does, synced to your membership.',
      `<span class="chip chip--live"><i class="dot"></i> ${A.feed.length ? A.feed.length + ' new posts' : 'No posts yet'}</span><span class="chip">${A.events.length ? A.events.length + ' events' : 'No events'}</span><span class="chip chip--gold">Open to all students</span>`, 'HUB')}

    <section class="section">
      <div class="container">
        <div class="comm-grid">
          <div>
            ${sectionHead('Feed', 'From the officer council', '')}
            ${A.feed.length
              ? `<div class="feed stagger" id="feedList">
              ${A.feed.map((p, i) => postCard(p, i, st.likes.indexOf(i) !== -1)).join('')}
            </div>`
              : pending('Nothing posted yet', 'Announcements from the officer council and members will appear here.')}

            <div class="card card--flat reveal" style="margin-top:26px;text-align:center">
              <p class="muted" style="margin-bottom:16px">Members can post directly from their dashboard.</p>
              <button class="btn btn--ghost" data-auth-cta>${ico('plus', 16)} New post</button>
            </div>
          </div>

          <aside>
            <div class="side-card reveal reveal--right">
              <h5>${ico('trophy', 15)} Season leaderboard</h5>
              ${A.leaderboard.length
                ? `<div class="lb">
                <div class="lb__head"><span>#</span><span>Spartan</span><span>XP</span><span>Events</span><span>Tier</span></div>
                ${A.leaderboard.map((r) => `
                  <div class="lb__row">
                    <span class="lb__rank">${r.r}</span>
                    <span class="lb__who">
                      <span class="lb__ava">${r.name.charAt(0)}</span>
                      <span><b>${esc(r.name)}</b><span>${esc(r.div)}</span></span>
                    </span>
                    <span class="lb__xp">${r.xp.toLocaleString()}</span>
                    <span class="lb__num">${r.ev}</span>
                    <span class="chip ${r.tier === 'Strategos' ? 'chip--gold' : (r.tier === 'Spartan' ? 'chip--red' : '')} lb__tag">${r.tier}</span>
                  </div>`).join('')}
              </div>`
                : '<p class="muted" style="padding:14px 0">Standings will appear here once members compete.</p>'}
            </div>

            <div class="side-card reveal reveal--right">
              <h5>${ico('calendar', 15)} Upcoming events</h5>
              <div class="stack" style="gap:11px">
                ${A.events.length
                  ? A.events.map((e) => `
                  <div class="event">
                    <span class="event__date"><b>${e.d}</b><span>${e.m}</span></span>
                    <span class="event__body">
                      <b>${esc(e.title)}</b>
                      <p>${ico('pin', 12)} ${esc(e.where)}</p>
                      <span class="row"><span class="chip">${esc(e.meta)}</span><span class="chip ${e.state === 'open' ? 'chip--ok' : 'chip--gold'}">${esc(e.state)}</span></span>
                    </span>
                  </div>`).join('')
                  : '<p class="muted" style="padding:14px 0">No events scheduled yet — check back soon.</p>'}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>

    ${A.badges.length ? `
    <section class="section section--surface">
      <div class="container">
        ${sectionHead('Achievements', 'The badge wall', 'Badges unlock automatically as you compete, volunteer and contribute. Hover to inspect — locked ones stay grey until earned.')}
        <div class="badgegrid stagger">
          ${A.badges.map((b) => `
            <div class="badge ${b.on ? '' : 'is-locked'}" title="${esc(b.hint)}">
              <span class="badge__ico">${b.ico === ' founding' ? '🛡️' : b.ico}</span>
              <b>${esc(b.name)}</b>
              <span>${b.on ? esc(b.hint) : 'Locked'}</span>
            </div>`).join('')}
        </div>
      </div>
    </section>` : ''}

    ${ctaBand()}`;
  }

  function postCard(p, i, liked) {
    return `
    <article class="post">
      <span class="post__ava ${p.gold ? 'gold' : ''}">${esc(p.ini)}</span>
      <div style="flex:1;min-width:0">
        <div class="post__head">
          <b>${esc(p.who)}</b>
          ${p.gold ? '<span class="chip chip--gold">Official</span>' : '<span class="chip">Member</span>'}
          <span class="mono">${esc(p.time)}</span>
        </div>
        <p class="post__body">${esc(p.body)}</p>
        <div class="post__acts">
          <button class="post__act ${liked ? 'is-on' : ''}" data-like="${i}">${ico('heart', 14)} <span>${p.likes + (liked ? 1 : 0)}</span></button>
          <button class="post__act" data-toast="Threads open in the community hub|Sign in to reply as a Spartan.">${ico('chat', 14)} <span>${p.comments}</span></button>
          <button class="post__act" data-toast="Link copied|Share it with your squad.">${ico('external', 14)} <span>Share</span></button>
        </div>
      </div>
    </article>`;
  }

  /* =====================================================================
     DASHBOARD
     ===================================================================== */
  function dashboard() {
    const st = ALRSStore.get();

    if (!st.member) {
      return `
      ${phero('Dashboard', 'Your Spartan<br><span class="red">dashboard</span>',
        'Sign in with an ALRS membership to see your digital ID, XP progression, badges and wallet in one place.', '', 'ID')}
      <section class="section">
        <div class="container">
          <div class="empty reveal">
            <div class="logo-slot" style="width:96px;margin:0 auto 22px;--mark-shell:#F2F3F7">${ALRS.brand.logo}</div>
            <b>You are not signed in</b>
            <p>Membership is free to start. Enrol in under two minutes and your digital Spartan ID is generated instantly.</p>
            <div class="row" style="justify-content:center">
              <button class="btn btn--primary magnetic" data-enroll="recruit">Enrol for free ${ico('arrow', 16)}</button>
              <a class="btn btn--ghost" href="#/membership" data-nav>See all tiers</a>
            </div>
          </div>
        </div>
      </section>`;
    }

    const m = st.member;
    const lvl = ALRSStore.level();
    const tier = ALRS.tiers.find((t) => t.id === m.tier) || { name: 'Spartan' };
    const activity = st.activity.length ? st.activity : [];

    return `
    ${phero('Dashboard', `Welcome back,<br><span class="red">${UI.esc(m.name.split(' ')[0])}</span>`,
      `Your membership is active through ${new Date(m.valid).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}. Everything below is live and synced to your account.`,
      `<span class="chip chip--red">${tier.name} tier</span><span class="chip">${UI.esc(m.id)}</span><span class="chip chip--gold">${st.points} pts</span>`, 'A.C.T')}

    <section class="section">
      <div class="container dash">
        <div class="dash__side">
          <div class="reveal reveal--left">${UI.memberCardHTML(m, { tilt: true })}</div>

          <div class="dash__panel reveal reveal--left">
            <h5>${ico('id', 15)} Membership</h5>
            <div class="qrow"><span>Tier</span><b class="red">${tier.name}</b></div>
            <div class="qrow"><span>Member ID</span><b class="mono">${UI.esc(m.id)}</b></div>
            <div class="qrow"><span>Course / Year</span><b>${UI.esc(m.course)} · ${UI.esc(m.year)}</b></div>
            <div class="qrow"><span>Division</span><b>${UI.esc(m.division)}</b></div>
            <div class="qrow"><span>Valid until</span><b class="gold">${new Date(m.valid).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}</b></div>
            <div class="row" style="margin-top:18px">
              <a class="btn btn--ghost btn--sm" href="#/membership" data-nav>Change plan</a>
              <button class="btn btn--link" data-signout>Sign out</button>
            </div>
          </div>

          <div class="dash__panel reveal reveal--left">
            <h5>${ico('wallet', 15)} Wallet</h5>
            <div class="qrow"><span>Spartan Points</span><b class="gold">${st.points}</b></div>
            <div class="qrow"><span>Total XP</span><b>${st.xp.toLocaleString()}</b></div>
            <div class="qrow"><span>Deals claimed</span><b>${st.redeemed.length}</b></div>
            <a class="btn btn--gold btn--sm btn--block" href="#/marketplace" data-nav style="margin-top:16px">Spend points ${ico('arrow', 14)}</a>
          </div>
        </div>

        <div class="dash__main stack" style="gap:22px">
          <div class="xpbar reveal">
            <div class="xpbar__top">
              <span class="xpbar__lvl">Level <em>${lvl.level}</em> · ${lvl.pct === 100 ? 'Maxed' : 'Spartan'}</span>
              <span class="mono muted">${st.xp.toLocaleString()} / ${lvl.next.toLocaleString()} XP</span>
            </div>
            <div class="progress"><i style="width:${lvl.pct}%"></i></div>
            <p class="mono muted" style="margin-top:12px">${lvl.pct === 100 ? 'Level cap reached for this season.' : `${(lvl.next - st.xp).toLocaleString()} XP to level ${lvl.level + 1}.`}</p>
          </div>

          ${ALRS.badges.length ? `
          <div class="dash__panel reveal">
            <div class="spread" style="margin-bottom:18px">
              <h5 style="margin:0">${ico('star', 15)} Badge collection</h5>
              <span class="mono muted">${ALRS.badges.filter((b) => b.on || st.badges.indexOf(b.name) !== -1).length} / ${ALRS.badges.length} earned</span>
            </div>
            <div class="badgegrid">
              ${ALRS.badges.map((b) => {
                const on = b.on || st.badges.indexOf(b.name) !== -1;
                return `
                <div class="badge ${on ? '' : 'is-locked'}" title="${esc(b.hint)}">
                  <span class="badge__ico">${b.ico === ' founding' ? '🛡️' : b.ico}</span>
                  <b>${esc(b.name)}</b><span>${on ? 'Earned' : esc(b.hint)}</span>
                </div>`;
              }).join('')}
            </div>
          </div>` : ''}

${activity.length ? `
          <div class="dash__panel reveal">
            <div class="spread" style="margin-bottom:14px">
              <h5 style="margin:0">${ico('bolt', 15)} Recent activity</h5>
              <span class="mono muted">Last ${activity.length} entries</span>
            </div>
            <div>
              ${activity.slice(0, 7).map((a) => `
                <div class="actline">
                  <span class="actline__ico">${a.ico}</span>
                  <span><b>${UI.esc(a.t)}</b><span>${UI.esc(a.s)}</span></span>
                  <span class="pts">${UI.esc(a.pts)}</span>
                </div>`).join('')}
            </div>
          </div>` : ''}

${ALRS.perks.length ? `
          <div class="grid g-3 stagger">
            ${ALRS.perks.slice(0, 3).map((p) => `
              <div class="perk">
                <span class="perk__ico">${p.ico}</span>
                <span><b>${p.t}</b><span>${p.s}</span></span>
              </div>`).join('')}
          </div>` : ''}
        </div>
      </div>
    </section>`;
  }

  window.ALRSViews = {
    home, about, roster, tournaments, membership, marketplace, community, dashboard,
    setTeam(id) { activeTeam = id; },
    setBilling(m) { billingMode = m; },
    getBilling() { return billingMode; },
    sponsorCard, tierCard, phero, sectionHead, ctaBand, statBlock, postCard
  };
})();
