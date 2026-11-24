// Gurrulabs site: Play referrer, Mixpanel (production host only) and the two browser tests on the Pulse page.
(() => {
  'use strict';
  const PAGE = document.body.dataset.page;      // page slug: home | pulse | cyberpunk-detective ...
  const LOCALE = document.body.dataset.locale;  // en | es | fr | pt

  // ── Mixpanel: public token of the shared "Gurru Labs websites" project, EU host. Production hostname only:
  //    localhost, file:// and any other host (forks, the bare apex before its redirect) must not send events.
  const MIXPANEL_TOKEN = '20a6baa8d266700297f9b0b16efc0a13';
  let tracking = false;
  function initMixpanel() {
    if (location.hostname !== 'www.gurrulabs.com') return;
    (function mixpanelBootstrap(documentRef, mixpanelRef) {
      if (mixpanelRef.__SV) return;
      let script, firstScript, index;
      window.mixpanel = mixpanelRef;
      mixpanelRef._i = [];
      mixpanelRef.init = function init(token, config, name) {
        function setStub(target, method) {
          const parts = method.split('.');
          if (parts.length === 2) { target = target[parts[0]]; method = parts[1]; }
          target[method] = function stubbedMethod() { target.push([method].concat(Array.prototype.slice.call(arguments, 0))); };
        }
        let instance = mixpanelRef;
        if (typeof name !== 'undefined') instance = mixpanelRef[name] = []; else name = 'mixpanel';
        instance.people = instance.people || [];
        instance.toString = function toString(debug) {
          let value = 'mixpanel';
          if (name !== 'mixpanel') value += '.' + name;
          if (!debug) value += ' (stub)';
          return value;
        };
        instance.people.toString = function peopleToString() { return instance.toString(1) + '.people (stub)'; };
        const methods = 'disable time_event track track_pageview track_links track_forms register register_once alias unregister identify name_tag set_config reset people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user'.split(' ');
        for (index = 0; index < methods.length; index += 1) setStub(instance, methods[index]);
        mixpanelRef._i.push([token, config, name]);
      };
      mixpanelRef.__SV = 1.2;
      script = documentRef.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.src = 'https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js';
      firstScript = documentRef.getElementsByTagName('script')[0];
      firstScript.parentNode.insertBefore(script, firstScript);
    })(document, window.mixpanel || []);
    window.mixpanel.init(MIXPANEL_TOKEN, { api_host: 'https://api-eu.mixpanel.com', persistence: 'localStorage' });
    tracking = true;
  }
  // Same acquisition props as Raffy Web on every event: this URL's utm_* ('' when absent) and the AI assistant that referred the visit
  const QS = new URLSearchParams(location.search), UTM = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  const AI = [['chatgpt', 'chatgpt.com', 'chat.openai.com'], ['perplexity', 'perplexity.ai'], ['gemini', 'gemini.google.com'],
    ['copilot', 'copilot.microsoft.com', 'bing.com/chat'], ['claude', 'claude.ai'], ['other', 'you.com', 'phind.com', 'poe.com', 'meta.ai', 'mistral.ai', 'grok.com']];
  const ref = document.referrer.toLowerCase(), ai = ref && AI.find(([, ...hosts]) => hosts.some(h => ref.includes(h)));
  const CTX = { ...Object.fromEntries(UTM.map(k => [k, QS.get(k) || ''])), ai_referral: !!ai, ai_referrer_source: ai ? ai[0] : 'unknown' };
  const track = (event, props) => { if (tracking && window.mixpanel && typeof window.mixpanel.track === 'function') window.mixpanel.track('Gurrulabs Web - ' + event, { ...CTX, ...props }); };

  // ── Play links: clean href in the HTML; the install referrer is added on load and again on press (links created by the test)
  const PLAY_SEL = 'a[href*="play.google.com/store/apps/details"]:not(.sources a)'; // source citations are not install CTAs
  function withPlayReferrer(a) {
    const referrer = new URLSearchParams({
      utm_source: 'gurrulabs_web', utm_medium: 'web', utm_campaign: PAGE,
      utm_content: a.dataset.cta || 'unknown', utm_term: LOCALE,
    });
    UTM.forEach(k => { if (CTX[k]) referrer.set('src_' + k, CTX[k]); }); // the visit's own campaign, as Raffy Web forwards it
    const url = new URL(a.href);
    url.searchParams.set('referrer', referrer.toString());
    a.href = url.toString();
  }
  document.querySelectorAll(PLAY_SEL).forEach(withPlayReferrer);
  document.addEventListener('pointerdown', e => { const a = e.target.closest && e.target.closest(PLAY_SEL); if (a) withPlayReferrer(a); });
  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest(PLAY_SEL);
    if (!a) return;
    withPlayReferrer(a);
    const props = { app: a.dataset.app, cta: a.dataset.cta || 'unknown', locale: LOCALE, page: PAGE };
    if (a.dataset.result) props.result = a.dataset.result; // set on the result sheet's links: "<verdict> <score>"
    track('Download Button Clicked', props);
  });

  // Lull sign-up: a mailto link (no backend). Track the click only; never touch the href.
  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[href^="mailto:"][data-cta]');
    if (a) track('Signup Clicked', { app: a.dataset.app, cta: a.dataset.cta, locale: LOCALE, page: PAGE });
  });

  // Raffy links: pass this visitor's Mixpanel ID so raffyparenting.com keeps the same user (gl_mp_id, read by Raffy Web)
  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[href*="raffyparenting.com"]');
    if (!a || !tracking || typeof window.mixpanel.get_distinct_id !== 'function') return;
    const url = new URL(a.href);
    url.searchParams.set('gl_mp_id', window.mixpanel.get_distinct_id());
    a.href = url.toString();
  });

  // Navigation: language switch, source citations and internal links. All values are English keys or page ids, never
  // translated URLs or visible text, so the same action reads the same in every locale (docs/domain.md Measurement).
  const PAGE_IDS = JSON.parse(document.getElementById('pages')?.textContent || '{}'); // path → page id (generated by build.mjs)
  const zone = a => a.closest('footer') ? 'footer' : a.closest('.g-rail') ? 'rail' : a.closest('nav.bc') ? 'breadcrumb' : a.closest('header') ? 'header'
    : a.closest('#game') ? 'game' : (s => s ? s.id || s.classList[0] || 'section' : 'body')(a.closest('section'));
  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.matches(PLAY_SEL)) return;
    if (a.closest('nav.langs')) {
      const to = a.hreflang.slice(0, 2); // pt-BR → pt
      if (to !== LOCALE) track('Language Changed', { from: LOCALE, to, page: PAGE });
      return;
    }
    const url = new URL(a.href);
    if (a.closest('.sources') && url.protocol.startsWith('http')) track('Source Clicked', { page: PAGE, locale: LOCALE, domain: url.hostname });
    else if (url.host === location.host && url.protocol === location.protocol) {
      const to = url.pathname === location.pathname ? PAGE : PAGE_IDS[url.pathname] || 'unknown';
      track('Internal Link Clicked', { page: PAGE, locale: LOCALE, to, zone: zone(a) });
    }
  });

  initMixpanel();
  // View event named from the slug (pulse → Pulse, cyberpunk-detective → Cyberpunk Detective); naming rule in docs/domain.md
  track(PAGE.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' '), { locale: LOCALE, path: location.pathname, referrer: document.referrer });

  // ── Page behaviour driven by markup (any page, no game needed): scroll reveal, rail, count-up, tries ruler, age chart, mode cards.
  //    Nothing here stores anything: tries and results live in memory until the page reloads.
  const I = JSON.parse(document.getElementById('i18n')?.textContent || '{}');
  const fill = (s, a) => s.replace(/\{(\w)\}/g, (_, k) => typeof a === 'object' ? a[k] : a); // a: value for {a}, or {a, b, n}
  const fmt = s => s.toFixed(2);
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const motion = !matchMedia('(prefers-reduced-motion: reduce)').matches; // off: CSS shows every end state, JS skips every animation
  document.documentElement.classList.add('js'); // CSS hides draw-in diagrams and reveal blocks only when JS can show them again
  const seen = (els, cb, threshold = .15) => { // cb(el) once, when el first scrolls into view
    if (!('IntersectionObserver' in window)) return els.forEach(cb);
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { io.unobserve(e.target); cb(e.target); } }), { threshold });
    els.forEach(el => io.observe(el));
  };

  // Reveal once: blocks fade up, card grids stagger (grids drop .rvk afterwards so hover lifts work). Opt in with data-rv / data-rvk.
  if (motion) {
    const reveal = (els, cls) => els.forEach(el => {
      if (el.getBoundingClientRect().top < innerHeight * .9) return el.classList.add('in'); // already on screen: no flash
      el.classList.add(cls);
      seen([el], t => { t.classList.add('in'); if (cls === 'rvk') setTimeout(() => t.classList.remove('rvk'), 1300); });
    });
    reveal($$('.steps3, .tips3, .facts2, .mcards, .gcards, .tcards, .stats4, .facts4, .choice, [data-rvk]'), 'rvk');
    reveal($$('.prose > h2, .say, .schem, .ruler, .faq, .push, .chart, [data-rv]'), 'rv');
  }
  // Count-up figures (<b class="count" data-to="217.9" data-d="1">217.9</b>) and bars that grow once (.vs [data-w], .chart.pre)
  seen($$('.count, .vs, .chart.pre'), t => {
    if (t.classList.contains('vs')) $$('[data-w]', t).forEach(i => { i.style.width = i.dataset.w + '%'; });
    else if (t.classList.contains('chart')) t.classList.remove('pre');
    else if (motion) { const to = +t.dataset.to, d = +t.dataset.d, t0 = performance.now(), nf = { minimumFractionDigits: d, maximumFractionDigits: d, useGrouping: 'always' }; // 'always': es would print 1469
      const f = now => { const p = Math.min(1, (now - t0) / 1200); t.textContent = (to * (1 - (1 - p) ** 3)).toLocaleString(LOCALE === 'pt' ? 'pt-BR' : LOCALE, nf); if (p < 1) requestAnimationFrame(f); };
      requestAnimationFrame(f); }
  });
  if (!motion) $$('.chart.pre').forEach(c => c.classList.remove('pre'));

  // "On this page" rail: highlight the section being read
  const rail = $$('.g-rail li a');
  if (rail.length && 'IntersectionObserver' in window) {
    const spy = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) rail.forEach(a => a.classList.toggle('on', a.hash === '#' + e.target.id)); }), { rootMargin: '-15% 0px -75% 0px' });
    rail.forEach(a => { const el = document.getElementById(a.hash.slice(1)); if (el) spy.observe(el); });
  }

  // Tries ruler: <figure class="ruler" data-mode="exact|hidden" data-min data-max data-target data-win> with .rscale (zones), .me (stats)
  $$('.ruler[data-mode]').forEach(r => {
    const lo = +r.dataset.min, hi = +r.dataset.max, tg = +r.dataset.target, win = +r.dataset.win, tries = [];
    const pos = v => Math.max(1.5, Math.min(98.5, (v - lo) / (hi - lo) * 100)), scale = $('.rscale', r), me = $('.me', r);
    const kind = t => { const a = Math.abs(Math.round((t - tg) * 100) / 100); return a === 0 ? 'perfect' : a <= win ? 'pass' : 'miss'; };
    const draw = () => {
      const n = tries.length, mean = tries.reduce((a, b) => a + b, 0) / n;
      scale.querySelector('.pts')?.remove();
      scale.insertAdjacentHTML('beforeend', `<div class="pts">${tries.map((t, i) => { const last = i === n - 1;
        return `<span class="dot ${kind(t)}${last ? ' last' : ''}${t < lo ? ' edge lo' : t > hi ? ' edge' : ''}" style="left:${pos(t)}%" title="${fmt(t)} s"></span>${last ? `<span class="you" style="left:${pos(t)}%">${fill(I.r_you, fmt(t))}</span>` : ''}`; }).join('')}</div>`);
      if (!n) { me.innerHTML = `<span class="empty">${I.r_empty}</span>`; return; }
      const sd = n > 1 ? Math.sqrt(tries.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1)) : 0;
      me.innerHTML = `<div class="stats"><span><b>${n}</b> ${n === 1 ? I.r_n1 : I.r_n}</span><span>${I.r_avg} <b>${fmt(mean)} s</b></span>${n > 1 ? `<span>${I.r_sd} <b>${fmt(sd)} s</b></span>` : ''}<span><b>${tries.filter(t => kind(t) !== 'miss').length}</b> ${I.r_hits}</span></div><button type="button">${I.r_clear}</button>`;
    };
    document.addEventListener('pulse:result', e => { if (e.detail.mode === r.dataset.mode) { tries.push(+e.detail.result.split(' ')[1]); draw(); } });
    me.addEventListener('click', e => { if (e.target.closest('button')) { tries.length = 0; draw(); } });
    draw();
  });

  // Age chart: <figure class="chart pre" data-age='[["18–24", mean ms, SD ms], …]' data-all='[mean, SD]'> with an <svg> and a .youbox.
  //    The reaction result of the panel lands on it and the nearest age group is named (numbers come from the page's own table).
  $$('.chart[data-age]').forEach(c => {
    const rows = JSON.parse(c.dataset.age), all = JSON.parse(c.dataset.all || 'null'), svg = $('svg', c), box = $('.youbox', c);
    const data = all ? [...rows, [I.age_all, ...all, 1]] : rows;
    const W = 640, L = 62, R = 20, row = 30, top = 8, H = top + data.length * row + 26, lo = 150, hi = 300;
    const x = v => L + (Math.max(lo, Math.min(hi, v)) - lo) / (hi - lo) * (W - L - R), ms = v => LOCALE === 'en' ? v.toFixed(1) : v.toFixed(1).replace('.', ',');
    const grid = [150, 175, 200, 225, 250, 275, 300].map(v => `<line class="grid" x1="${x(v)}" x2="${x(v)}" y1="${top}" y2="${H - 22}"/><text x="${x(v)}" y="${H - 6}" text-anchor="middle">${v}</text>`).join('');
    const body = data.map(([a, m, s, isAll], i) => { const y = top + i * row + row / 2;
      return `<g class="${isAll ? 'all' : ''}"><text class="lab" x="0" y="${y + 4}">${a}</text><line class="sd" x1="${x(m - s)}" x2="${x(m + s)}" y1="${y}" y2="${y}"/><circle class="mean" cx="${x(m)}" cy="${y}" r="5"><title>${a}: ${ms(m)} ms ± ${ms(s)}</title></circle></g>`; }).join('');
    const draw = v => { svg.innerHTML = grid + body + (v ? `<line class="youl" x1="${x(v)}" x2="${x(v)}" y1="${top - 4}" y2="${H - 22}"/><text class="yout" x="${x(v)}" y="${top - 8}" text-anchor="middle">${fill(I.age_you, v)}</text>` : ''); };
    svg.setAttribute('viewBox', `0 -14 ${W} ${H + 14}`);
    document.addEventListener('pulse:result', e => {
      if (e.detail.mode !== 'reaction') return;
      const s = e.detail.result.split(' ')[1];
      if (s === 'false_start') { box.textContent = I.age_false; return; }
      const v = Math.round(+s * 1000), near = rows.reduce((a, d) => Math.abs(d[1] - v) < Math.abs(a[1] - v) ? d : a);
      draw(v); box.innerHTML = fill(I.age_near, { a: v, g: near[0], m: ms(near[1]) });
    });
    draw();
  });

  // Mode cards: <button data-pick="exact|hidden|interval|react|batak"> loads that mode in the panel and scrolls to it
  $$('[data-pick]').forEach(b => b.addEventListener('click', () => {
    const tab = $(`#game [data-a="tab-${b.dataset.pick}"]`);
    if (!tab) return;
    tab.click(); $('#game').scrollIntoView({ behavior: motion ? 'smooth' : 'auto', block: 'center' });
  }));

  // ── Cyberpunk Detective pages (mini case + riddles): neon signs, the 3 s corner stutter, the floating Download button and the playable case.
  //    Phones (no hover, ≤ 760 px) and prefers-reduced-motion: everything still, signs simply on. The case JSON lives in #case-data; the solution
  //    only ever sits there and in this code, never in the visible HTML.
  if (document.body.classList.contains('mc-page')) {
    const html = document.documentElement, still = !motion || matchMedia('(hover: none), (max-width: 760px)').matches;
    const signs = $$('.nsign');
    if (!still && 'IntersectionObserver' in window) { // signs power on one at a time, in the order they come into view
      html.classList.add('js-neon');
      const queue = []; let busy = false;
      const next = () => { if (busy || !queue.length) return; busy = true; queue.shift().classList.add('lit'); setTimeout(() => { busy = false; next(); }, 1550); };
      const io = new IntersectionObserver(es => { es.forEach(e => { if (e.isIntersecting) { io.unobserve(e.target); queue.push(e.target); } }); setTimeout(next, 350); }, { threshold: .6 });
      signs.forEach(s => io.observe(s));
    } else signs.forEach(s => s.classList.add('lit'));
    // floating "Download now": appears once the header button scrolls away (always on phones, where the header one is hidden)
    const fab = $('.dl-fab'), hb = $('header.top .dl');
    if (fab && hb && 'IntersectionObserver' in window) new IntersectionObserver(es => fab.classList.toggle('on', !es[0].isIntersecting)).observe(hb);
    else if (fab) fab.classList.add('on');
    // the one ambient loop: the magenta corner light stutters every 3 s (2 dips in 0.6 s, under 3 flashes/s)
    const fl = $('.city .flash');
    if (fl && !still) {
      const buzz = () => { if (document.hidden) return; fl.classList.remove('go'); html.classList.remove('buzz'); void fl.offsetWidth; fl.classList.add('go'); html.classList.add('buzz'); };
      setInterval(buzz, 3000); setTimeout(buzz, 800);
    }
    const caseRoot = document.getElementById('case');
    if (caseRoot) cyberCase(caseRoot);
  }

  function cyberCase(root) {
    const C = JSON.parse(document.getElementById('case-data').textContent);
    const $r = s => root.querySelector(s);
    const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const art = n => `/assets/cyberpunk-case-${n}.webp`;
    const P = { lock: 'M6 11h12v9H6zM9 11V8a3 3 0 016 0v3', back: 'M15 5l-7 7 7 7', next: 'M9 5l7 7-7 7', warn: 'M12 8v5M12 16h.01M10.3 4l-7.5 13a2 2 0 001.7 3h15a2 2 0 001.7-3L13.7 4a2 2 0 00-3.4 0z', check: 'M5 12l5 5 9-10' };
    const ico = p => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="${P[p]}"/></svg>`;
    const clue = id => C.clues.find(c => c.id === id), sus = id => C.suspects.find(s => s.id === id);
    const isScene = c => c.source === 'scene';
    const SCENE = C.clues.filter(isScene).map(c => c.id), SLOTS = ['who', 'how', 'why'], SOL = C.deduction.solution;
    const TPL = C.deduction.template.split(/\{(\w+)\}/); // text, slot, text, slot, …
    const stmts = C.suspects.flatMap(s => s.statements.map(x => ({ s, x })));
    const LIES = stmts.filter(r => r.x.brokenBy).map(r => r.x.id), lieOf = id => stmts.find(r => r.x.id === id);
    const fresh = () => ({ s: 'scene', found: [], broken: [], sus: null, si: 0, present: false, filter: 0, sel: null, pop: null, contra: null, msg: '', slot: null, ans: {}, wrong: 0, last: -1, hint: null, shake: false });
    let st = fresh(), started = false, lastKey = '';
    const has = id => st.found.includes(id), caughtN = () => LIES.filter(l => st.broken.includes(l)).length, allCaught = () => caughtN() === LIES.length;
    const tg = (c, cls = '') => `<span class="tg ${cls}">${c.code}</span>`;
    const lab = (t, c = '') => `<p class="cs-lab ${c}">${t}</p>`;
    const eco = key => st.hint === key ? `<p class="cs-eco"><b>ECO</b><span>${esc(C.ecoHints[key])}</span></p>` : '';
    const hintBtn = key => st.hint === key ? '' : `<button class="cs-lnk eco" data-hint="${key}">${I.askEco}</button>`;
    const pt = (s, w, h = w) => `<img class="cs-pt" src="${art(s.id)}" width="${w}" height="${h}" alt="${esc(fill(I.portrait, { a: s.name, b: s.role.toLowerCase() }))}">`;
    const first = s => s.name.split(' ')[0];
    const backBtn = (attr, label) => `<button class="cs-lnk" ${attr}>${ico('back')}${label}</button>`;
    const cta = title => `<div class="cs-cta"><span class="ic"><img src="/assets/cyberpunk-icon.webp" width="256" height="256" alt=""></span><div><b>${title}</b><span>${I.appTagline}</span></div>` +
      `<a class="dl" href="${I.play}" target="_blank" rel="noopener" data-cta="case_end" data-app="cyberpunk_detective"><img src="/assets/cyberpunk-icon.webp" width="256" height="256" alt=""><span><b>${I.download}</b><small><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 2.5v19l17-9.5z"/></svg>${I.free}</small></span></a></div>`;

    function sScene() {
      const n = SCENE.filter(has).length, p = st.pop && clue(st.pop), next = SCENE.find(id => !has(id));
      const hs = SCENE.map(id => { const c = clue(id), f = has(id), x = c.hotspot[0] * 100, side = x > 80 ? ' r' : x < 20 ? ' l' : '';
        return `<button class="cs-hs${f ? ' found' : ''}${id === next && !p ? ' next' : ''}${side}" style="left:${x}%;top:${c.hotspot[1] * 100}%" data-clue="${id}" aria-label="${esc(f ? fill(I.foundAria, { a: c.place, b: c.code }) : I.examine)}"><i></i>${f ? `<span class="cs-hl">${tg(c, 'f')}${esc(c.place)}</span>` : ''}</button>`; }).join('');
      const pop = p ? `<div class="cs-pop" role="dialog" aria-label="${esc(I.clueFound)}"><div class="cs-popc"><p class="cs-lab cy">${tg(p, 'f')}${I.clueFound}</p><h4>${esc(p.title)}</h4><p>${esc(p.text)}</p><small>${fill(I.saved, { a: n, b: SCENE.length })}</small><button class="cs-btn ghost" data-close>${I.keepSearching}</button></div></div>` : '';
      return `<div class="cs-sceneL"><div class="cs-scene"><img src="${art('scene')}" width="1006" height="1564" alt="${esc(I.sceneAlt)}">${hs}${pop}</div>` +
        `<div><div class="cs-h"><h3 tabindex="-1">${I.sceneH}</h3><p>${I.sceneP}</p></div>` +
        `<div class="cs-found"><span class="tgs">${SCENE.map(id => tg(clue(id), has(id) ? 'f' : 'e')).join('')}</span><span>${fill(I.found, { a: n, b: SCENE.length })}</span></div>${eco('scene')}` +
        `<div class="cs-row"><button class="cs-btn" data-go="suspects">${I.toSuspects}</button>${n < SCENE.length ? hintBtn('scene') : ''}</div><p class="cs-note">${I.backAny}</p></div></div>`;
    }
    function sSuspects() {
      if (st.sus) return sTalk();
      const left = LIES.length - caughtN(), all = left === 0;
      return `<div class="cs-h"><h3 tabindex="-1">${I.whoLying}</h3><p>${I.whoLyingP}</p></div><div class="cs-sgrid">` + C.suspects.map(s => { const caught = s.statements.some(x => st.broken.includes(x.id));
        return `<button class="cs-sc${caught ? ' caught' : ''}" data-sus="${s.id}">${pt(s, 240, 300)}${caught ? `<span class="cs-mark">${I.lieMark}</span>` : ''}<b>${esc(s.name)}</b><small>${esc(s.role)}</small><span class="cs-st${caught ? ' mg' : ''}">${caught ? I.lieCaught : fill(I.nStatements, s.statements.length)}</span></button>`; }).join('') + '</div>' +
        `<p class="cs-note" style="margin-top:28px">${all ? I.allCaught : fill(left === 1 ? I.liesLeft1 : I.liesLeft, left)}</p>${eco('suspects')}` +
        `<div class="cs-row">${all ? `<button class="cs-btn" data-go="deduce">${I.solveBtn}</button>` : hintBtn('suspects')}${backBtn('data-go="scene"', I.backLab)}</div>`;
    }
    function sTalk() {
      const s = sus(st.sus), i = Math.min(st.si, s.statements.length - 1), x = s.statements[i], broken = st.broken.includes(x.id);
      const body = broken ? `<p class="cs-said struck"><span>${esc(x.text)}</span></p><div class="cs-reply" style="grid-template-columns:1fr;animation:none"><div><small class="cs-lab mg">${I.lieCaught}</small><p>${esc(x.reply)}</p></div></div>` : `<p class="cs-said">${esc(x.text)}</p>`;
      const found = st.found.map(clue), shown = found.filter(c => st.filter === 0 || (st.filter === 1) === isScene(c)), nS = found.filter(isScene).length;
      const sheet = `<div class="cs-sheet"><p class="cs-sq">${I.whichClue}</p><div class="cs-tabs" role="group" aria-label="${esc(I.filter)}">` +
        [`${I.all} ${found.length}`, `${I.sceneTab} ${nS}`, `${I.testimony} ${found.length - nS}`].map((l, k) => `<button class="${st.filter === k ? 'on' : ''}" data-filter="${k}" aria-pressed="${st.filter === k}">${l}</button>`).join('') + '</div>' +
        `<ul class="cs-pick">${shown.map(c => { const on = st.sel === c.id; return `<li><button class="cs-pk${on ? ' on' : ''}" data-sel="${c.id}" aria-pressed="${on}">${tg(c, on ? 'f' : '')}<span>${esc(c.title)}</span><i aria-hidden="true"></i></button></li>`; }).join('')}</ul>` +
        (st.msg ? `<p class="cs-msg" role="status">${ico('warn')}${esc(st.msg)}</p>` : '') +
        `<div class="cs-row"><button class="cs-btn" data-dopresent${st.sel ? '' : ' disabled'}>${st.sel ? `${I.present} ${tg(clue(st.sel))}` : I.pickClue}</button>${backBtn('data-back', I.allSuspects)}</div></div>`;
      const nav = `<span class="cs-nav"><button class="cs-ib" data-si="${i - 1}"${i > 0 ? '' : ' disabled'} aria-label="${esc(I.prevS)}">${ico('back')}</button><span>${fill(I.stmtN, { a: i + 1, b: s.statements.length })}</span><button class="cs-ib" data-si="${i + 1}"${i < s.statements.length - 1 ? '' : ' disabled'} aria-label="${esc(I.nextS)}">${ico('next')}</button></span>`;
      return `<div class="cs-room">${pt(s, 320, 400)}<div><div class="cs-roomH"><h3 tabindex="-1">${esc(s.name)}</h3>${nav}</div><span class="cs-role">${esc(s.role)}</span>${body}` +
        (broken ? `<div class="cs-row">${backBtn('data-back', I.allSuspects)}</div>` : st.present ? sheet : `<div class="cs-row"><button class="cs-btn" data-present>${I.presentEv}</button>${backBtn('data-back', I.allSuspects)}</div>`) + '</div></div>';
    }
    function sContra() {
      const { s, x } = lieOf(st.contra), c = clue(x.brokenBy), u = clue(x.unlocks);
      return `<div class="cs-contra"><div class="cs-stamp" role="status">${I.stamp}</div>${lab(fill(I.said, first(s)))}<p class="cs-said struck"><span>${esc(x.text)}</span></p>` +
        `<p class="cs-by">${I.brokenBy} ${tg(c, 'f')}${esc(c.title)}</p><div class="cs-reply">${pt(s, 56)}<div><small>${fill(I.nowSays, first(s))}</small><p>${esc(x.reply)}</p></div></div>` +
        `<p class="cs-unl">${tg(u, 'n')}<span>${I.newClue} ${esc(u.title)}</span></p>` +
        `<div class="cs-row">${allCaught() ? `<button class="cs-btn" data-go="deduce">${I.solveBtn}</button><button class="cs-lnk" data-cont>${I.notYet}</button>` : `<button class="cs-btn" data-cont>${I.backSusp}</button>`}</div></div>`;
    }
    function sDeduce() {
      const filled = SLOTS.filter(k => st.ans[k]).length, opt = (k, id) => C.deduction.slots[k].find(o => o.id === id);
      const sent = TPL.map((t, i) => { if (i % 2 === 0) return esc(t); const o = st.ans[t] && opt(t, st.ans[t]);
        return `<button class="cs-slot${o ? ' f' : ''}${st.slot === t ? ' a' : ''}" data-slot="${t}" aria-expanded="${st.slot === t}">${esc(o ? o.text : I[t])}</button>`; }).join('');
      const warn = st.last >= 0 ? `<div class="cs-warn" role="status"><p class="cs-wn">${fill(I.nCorrect, st.last)}</p><p>${I.wrongP}</p><p class="cs-eco"><b>ECO</b><span>${esc(C.ecoHints.solve)}</span></p></div>${st.wrong >= 2 ? cta(I.ctaWrong) : ''}` : '';
      let list = '';
      if (st.slot) list = `<div class="cs-pickh"><span>${I.choose} <b>${I[st.slot]}</b></span><span>${fill(I.nFilled, filled)}</span></div><ul class="cs-opts">` + C.deduction.slots[st.slot].map(o => {
        if (o.needs && !has(o.needs)) { const nc = clue(o.needs); return `<li class="cs-opt lock">${ico('lock')}<span>${isScene(nc) ? I.lockScene : I.lockLie}</span>${tg(nc, 'e')}</li>`; }
        return `<li><button class="cs-opt${st.ans[st.slot] === o.id ? ' on' : ''}" data-pick="${st.slot}:${o.id}">${esc(o.text)}${o.needs ? tg(clue(o.needs), 'f') : ''}</button></li>`; }).join('') + '</ul>';
      return `<div class="cs-h"><h3 tabindex="-1">${esc(C.question)}</h3><p>${I.sentP}</p></div><p class="cs-sent${st.shake ? ' shake' : ''}">${sent}</p>${warn}${list}${st.last < 0 ? eco('solve') : ''}` +
        `<div class="cs-row"><button class="cs-btn" data-solve${filled === 3 ? '' : ' disabled'}>${st.wrong ? I.solveAgain : I.solveBtn}</button>${st.last < 0 ? hintBtn('solve') : ''}${backBtn('data-go="suspects"', I.suspTab)}</div>` +
        (filled < 3 ? `<p class="cs-note">${I.fillAll}</p>` : '');
    }
    function sSolved() {
      const culprit = sus(SOL.who);
      return `<div class="cs-folder"><span class="cs-ftab">${fill(I.caseFile, C.number)}</span><img src="${art('cover')}" width="600" height="750" alt="">` +
        `<div><span class="cs-closed" role="status">${I.closed}</span>${lab(esc(C.title))}<h3 tabindex="-1">${esc(culprit.name)}</h3><p class="cs-lab">${I.culprit}</p><p class="cs-epi">${esc(C.epilogue)}</p>` +
        `<p class="cs-stats"><span><b>${SCENE.filter(has).length}/${SCENE.length}</b>${I.sceneClues}</span><span><b>${caughtN()}/${LIES.length}</b>${I.liesCaught}</span><span><b>${st.wrong}</b>${st.wrong === 1 ? I.wrongTry : I.wrongTries}</span></p></div></div>` +
        `${cta(I.ctaSolved)}<div class="cs-row"><button class="cs-lnk" data-reset>${I.playAgain}</button></div>`;
    }
    const stage = () => ({ scene: sScene, suspects: sSuspects, contra: sContra, deduce: sDeduce, solved: sSolved })[st.s]();

    function diary() {
      const f = st.found.map(clue), lies = caughtN(), nw = st.s === 'contra' && st.contra && lieOf(st.contra).x.unlocks;
      const row = c => `<li class="cs-dr${c.id === nw ? ' is-new' : ''}" tabindex="0">${tg(c, c.id === nw ? 'n' : 'f')}<b>${esc(c.title)}</b><p>${esc(c.text)}</p></li>`;
      const grp = (name, a) => a.length ? `<li class="cs-dg">${name}</li>${a.map(row).join('')}` : '';
      return `<summary><span class="cs-dt">${I.diary}</span><span class="cs-dn">${fill(I.nOfM, { a: f.length, b: C.clues.length })}</span><span class="cs-chev">${ico('next')}</span></summary><div class="cs-dsheet">` +
        `<div class="cs-dhead"><span class="cs-dt">${I.diary}</span><button class="cs-lnk" data-dclose>${I.close}</button></div>` +
        `<div class="cs-rack">${[C.clues.filter(isScene), C.clues.filter(c => !isScene(c))].map(a => `<span class="tgs">${a.map(c => tg(c, c.id === nw ? 'n' : has(c.id) ? 'f' : 'e')).join('')}</span>`).join('')}</div>` +
        `<p class="cs-lies">${I.liesCaught}<span>${LIES.map((_, k) => `<i class="${k < lies ? 'on' : ''}"></i>`).join('')}</span></p>` +
        (f.length ? `<ul class="cs-dl">${grp(I.fromLab, f.filter(isScene))}${grp(I.fromSusp, f.filter(c => !isScene(c)))}</ul>` : `<p class="cs-dempty">${I.dEmpty}</p>`) + '</div>';
    }

    function render() {
      const idx = { scene: 0, suspects: 1, contra: 1, deduce: 2, solved: 3 }[st.s];
      root.classList.add('play');
      $r('.cs-steps').innerHTML = [['scene', I.stepScene], ['suspects', I.stepSuspects], ['deduce', I.stepDeduce]].map((l, i) => {
        const dis = st.s === 'solved' || (l[0] === 'deduce' && !allCaught()), done = i < idx;
        return `<li class="${i === idx ? 'on' : done ? 'done' : ''}"><button data-go="${l[0]}"${dis ? ' disabled' : ''}${i === idx ? ' aria-current="step"' : ''}><b>${done ? ico('check') : i + 1}</b><span>${l[1]}</span></button></li>`; }).join('');
      const sb = $r('.cs-stage'), key = st.s + (st.sus || '');
      sb.innerHTML = stage();
      $r('.cs-diary').innerHTML = diary();
      if (key !== lastKey) { // new screen: replay the entrance, move keyboard/screen-reader focus to its heading
        sb.classList.remove('in'); void sb.offsetWidth; sb.classList.add('in');
        sb.querySelector('h3[tabindex]')?.focus({ preventScroll: true });
        lastKey = key;
      }
      st.shake = false;
      $r('.cs-pop .cs-btn')?.focus({ preventScroll: true });
    }
    function open() { // the case opens: first time from the hero button, again after "Play again"
      if (started) return; started = true;
      track('Game Started', { mode: 'case', page: PAGE, locale: LOCALE });
      const dia = $r('.cs-diary'); if (matchMedia('(max-width: 960px)').matches) dia.removeAttribute('open');
      root.scrollIntoView({ behavior: motion ? 'smooth' : 'auto' });
    }

    addEventListener('keydown', e => { if (e.key === 'Escape' && st.pop) { st.pop = null; render(); } });
    root.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b || b.disabled) return;
      const D = b.dataset;
      if (b.hasAttribute('data-dclose')) { $r('.cs-diary').open = false; return; }
      if (D.go === 'scene' && !started) open();
      if (D.clue) { if (!has(D.clue)) { st.found.push(D.clue); st.pop = D.clue; } }
      else if (b.hasAttribute('data-close')) st.pop = null;
      else if (D.sus) { st.sus = D.sus; st.si = 0; st.present = false; st.msg = ''; }
      else if (b.hasAttribute('data-back')) { st.sus = null; st.present = false; st.msg = ''; }
      else if (D.si) { st.si = +D.si; st.present = false; st.msg = ''; }
      else if (b.hasAttribute('data-present')) { st.present = true; st.sel = null; st.filter = 0; st.msg = ''; }
      else if (D.filter) st.filter = +D.filter;
      else if (D.sel) { st.sel = D.sel; st.msg = ''; }
      else if (b.hasAttribute('data-dopresent')) {
        const x = sus(st.sus).statements[Math.min(st.si, sus(st.sus).statements.length - 1)];
        if (x.brokenBy && st.sel === x.brokenBy) { st.present = false; st.broken.push(x.id); if (!has(x.unlocks)) st.found.push(x.unlocks); st.contra = x.id; st.s = 'contra'; st.hint = null; }
        else { st.msg = C.ecoHints.wrong_evidence; st.sel = null; } // short shake (CSS), nothing is lost
      }
      else if (b.hasAttribute('data-cont')) { st.s = 'suspects'; st.sus = null; }
      else if (D.slot) st.slot = st.slot === D.slot ? null : D.slot;
      else if (D.pick) { const [k, id] = D.pick.split(':'); st.ans[k] = id; st.last = -1; st.slot = SLOTS.find(s => !st.ans[s]) || null; }
      else if (b.hasAttribute('data-solve')) {
        const ok = SLOTS.filter(k => st.ans[k] === SOL[k]).length;
        if (ok === 3) st.s = 'solved'; else { st.wrong++; st.last = ok; st.slot = null; st.shake = true; }
        track('Game Finished', { mode: 'case', result: ok === 3 ? 'solved' : 'wrong', tries: st.wrong + (ok === 3 ? 1 : 0), page: PAGE, locale: LOCALE });
      }
      else if (D.hint) st.hint = D.hint;
      else if (b.hasAttribute('data-reset')) { st = fresh(); started = false; lastKey = ''; render(); open(); return; }
      else if (D.go) { st.s = D.go; st.sus = null; st.present = false; st.hint = null; st.msg = ''; }
      render();
    });
  }

  // ── The tests (Pulse pages)
  const panel = document.getElementById('game');
  if (!panel) return;
  // A finished round: tracked once, and announced to the page (in memory only) so the ruler and the age chart can place it
  const finished = p => { track('Game Finished', p); document.dispatchEvent(new CustomEvent('pulse:result', { detail: p })); };
  const PLAY_PULSE = 'https://play.google.com/store/apps/details?id=com.gurrulabs.pulse';

  const SYM = {
    exact: '<circle cx="12" cy="13" r="7"/><path d="M12 13V9M10 3h4"/>',
    reaction: '<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>',
    hidden: '<path d="M3 12s3-6 9-6 9 6 9 6-3 6-9 6-9-6-9-6z"/><path d="M4 20L20 4"/>',
    interval: '<path d="M5 6v12M19 6v12M5 12h14"/>',
    batak: '<circle cx="7" cy="7" r="2"/><circle cx="17" cy="7" r="2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>',
  };
  const ic = id => `<svg class="i" viewBox="0 0 24 24">${SYM[id]}</svg>`;
  const RING = '<g fill="none" stroke="currentColor" stroke-opacity=".4" stroke-width="1.5"><circle cx="13" cy="13" r="11"/><circle cx="13" cy="13" r="5.5"/></g>';
  const MARK = { perfect: RING + '<circle cx="13" cy="13" r="2.6" fill="currentColor"/>', pass: RING + '<circle cx="16.5" cy="10" r="2.6" fill="currentColor"/>', miss: RING + '<circle cx="21" cy="6" r="2.6" fill="currentColor"/>' };
  const mark = k => `<svg viewBox="0 0 26 26">${MARK[k]}</svg>`;
  const GP = '<svg viewBox="0 0 26 28"><path d="M1 1l13 13L1 27z" fill="#00D7FE"/><path d="M1 1l17 9.5-4 3.5z" fill="#00F076"/><path d="M1 27l17-9.5-4-3.5z" fill="#F63448"/><path d="M18 10.5l6 3.5-6 3.5-4-3.5z" fill="#FFC900"/></svg>';

  // Exact Time watch: a full turn of the ring = the target
  const TARGET = 3, WIN = 0.10, C = 2 * Math.PI * 128;
  const watch = (t, face, v = '', cls = '', tg = TARGET) => `<div class="watch ${cls} ${v ? 'v ' + v : ''}"><div class="ticks"></div><svg class="ring" viewBox="0 0 272 272"><circle class="track" cx="136" cy="136" r="128"/><circle class="prog" cx="136" cy="136" r="128" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - Math.min(t / tg, 1))}"/></svg><div class="face">${face}</div></div>`;
  const readyFace = `<small>${I.stop_at}</small><div class="n tnum">${fmt(TARGET)}<span>s</span></div>`;
  const runFace = t => `<div class="n tnum">${fmt(t)}<span>s</span></div><small class="tnum">${fill(I.of, fmt(TARGET))}</small>`;

  function exactVerdict(t, tg = TARGET) { // also Hidden Clock (target 10 s) and Interval (target = the hidden gap)
    const off = Math.round((t - tg) * 100) / 100, a = Math.abs(off), late = off > 0 ? 1 : 0;
    if (a === 0) return { k: 'perfect', tag: I.perfect, d: I.d_perfect };
    if (a <= WIN) return { k: 'pass', tag: I.pass, d: fill(I.d_pass[late], fmt(a)) };
    return { k: 'miss', tag: late ? I.late : I.early, d: fill(I.d_miss[late], fmt(a - WIN)) };
  }

  // Result sheet. Pass/Perfect: main = "Beat x s in Pulse" (Play). Miss: main = Try again, Play link second.
  function sheet({ k, tag, big, unit = 's', d, meter, labels, more, cta, test, score }) {
    const pos = v => Math.max(2, Math.min(98, (v - meter.min) / (meter.max - meter.min) * 100));
    const zones = meter.zones.map(([a, b, col]) => `<div class="z" style="left:${pos(a)}%;width:${pos(b) - pos(a)}%;background:${col}"></div>`).join('');
    const tgt = meter.target === undefined ? '' : `<div class="t" style="left:${pos(meter.target)}%"></div>`;
    const play = (cls, label) => `<a class="${cls}" href="${PLAY_PULSE}" target="_blank" rel="noopener" data-cta="${test}_result" data-app="pulse" data-result="${k} ${score}">${cls.includes('btn ') ? GP : ''}${label}</a>`;
    const btns = k === 'miss'
      ? `<button class="btn v" data-a="again">${I.again}</button>${play('btn-2', I.train + ' →')}`
      : `${play('btn v', cta)}<button class="btn-2" data-a="again">${I.again}</button>`;
    return `<div class="scrim"></div><div class="sheet ${k}"><div class="grab"></div>
      <span class="vtag">${mark(k)}${tag}</span>
      <p class="big tnum">${big}<span>${unit}</span></p><p class="d tnum">${d}</p>
      <div class="meter">${zones}${tgt}<div class="y" style="left:${pos(meter.value)}%"></div></div>
      <div class="ml tnum"><span>${labels[0]}</span><span>${labels[1]}</span><span>${labels[2]}</span></div>
      <p class="more">${more}</p>${btns}</div>`;
  }
  const Z = { pass: 'color-mix(in srgb, #7EE8C2 35%, transparent)', perfect: 'color-mix(in srgb, #FFD47A 45%, transparent)' };
  const exactSheet = (t, tg = TARGET, test = 'exact', more = I.more, v = exactVerdict(t, tg)) =>
    sheet({ ...v, big: fmt(t), score: fmt(t), test, cta: v.k === 'perfect' ? I.keep : fill(I.beatx, fmt(Math.abs(t - tg))), more,
      meter: { min: tg - 1, max: tg + 1, value: t, target: tg, zones: [[tg - WIN, tg + WIN, Z.pass]] },
      labels: [fmt(Math.max(0, tg - 1)), I.win, fmt(tg + 1)] });

  // Hidden Clock (target 10.00 s; the watch dissolves into a still ghost on Start)
  const HT = 10;
  // Batak (app level 1: 8 lights, 0.90 s per light = 7.20 s to beat; perfect 0.40 s per light = 3.20 s)
  const N = 8, BPASS = N * 0.90, BPERF = N * 0.40;
  const PADS = [[131, 131], ...Array.from({ length: 6 }, (_, i) => { const a = (-90 + 60 * i) * Math.PI / 180; return [Math.round(131 + 122 * Math.cos(a)), Math.round(131 + 122 * Math.sin(a))]; })];
  const board = (lit, hit, v = '') => `<div class="stage ${v ? 'v ' + v : ''}"><div class="col"><div class="bprog"><div class="row tnum"><span>${fill(I.b_of, { a: Math.min(hit, N), b: N })}</span><span>${fill(I.b_within, fmt(BPASS))}</span></div><div class="bar"><i style="width:${hit / N * 100}%"></i></div></div>
    <div class="board">${PADS.map(([x, y], i) => `<button class="pad${i === lit ? ' on' : ''}" style="left:${x}px;top:${y}px" data-pad="${i}" aria-label="${fill(I.b_light, i + 1)}"></button>`).join('')}</div></div></div>`;
  const bVerdict = t => t <= BPERF ? { k: 'perfect', tag: I.perfect, d: fill(I.b_perf, { n: N, a: fmt(t / N) }) }
    : t <= BPASS ? { k: 'pass', tag: I.pass, d: fill(I.b_pass, { n: N, a: fmt(t / N), b: fmt(t - BPERF) }) }
    : { k: 'miss', tag: I.slow, d: fill(I.b_slow, fmt(t - BPASS)) };
  const bSheet = t => sheet({ ...bVerdict(t), big: fmt(t), score: fmt(t), test: 'batak', cta: fill(I.beat, fmt(t)), more: I.more_batak,
    meter: { min: 0, max: 9, value: t, zones: [[0, BPERF, Z.perfect], [BPERF, BPASS, Z.pass]] }, labels: ['0', fill(I.b_meter, { a: fmt(BPERF), b: fmt(BPASS) }), '9.00 s'] });
  const nextPad = prev => { let p; do p = Math.floor(Math.random() * 7); while (p === prev); return p; };

  // Interval: each try picks one of the app's 14 Interval levels (levels_config.json targetMillis); guess on a 0-10 s slider
  const TIMES = [5, 5.5, 3, 6.5, 2.5, 3.5, 1, 4, 1.5, 3.8, 4.6, 0.3, 10, 5.2];
  const istage = (l, r, plate, cls = '') => `<div class="istage ${cls}"><span class="sbar l${l ? ' lit' : ''}"></span><span class="gapl"></span><span class="sbar r${r ? ' lit' : ''}"></span><div class="plate">${plate}</div></div>`;
  const ivVerdict = (g, real) => { const v = exactVerdict(g, real), late = g > real, a = fmt(Math.abs(Math.round((g - real) * 100) / 100));
    return { ...v, tag: v.k === 'miss' ? (late ? I.long : I.short) : v.tag, d: v.k === 'perfect' ? fill(I.i_exact, fmt(real)) : fill(late ? I.i_longd : I.i_shortd, { a: fmt(real), b: a }) }; };

  // Reaction (Pulse level 1: 3 lights, 850-1200 ms between lights, pass < 0.40 s, perfect <= 0.30 s)
  const LIGHTS = 3, GAP = [850, 1200], RPASS = 0.40, RPERF = 0.30;
  const gantry = (lit, v = '') => `<div class="stage ${v ? 'v ' + v : ''}"><div class="col"><div class="gantry">${Array.from({ length: LIGHTS }, (_, i) => `<span class="lamp${i < lit ? ' on' : ''}"></span>`).join('')}</div>`;
  function reactVerdict(t, fs) {
    if (fs) return { k: 'miss', tag: I.false_start, d: I.d_false };
    if (t <= RPERF) return { k: 'perfect', tag: I.perfect, d: fill(I.d_rperf, fmt(RPERF - t)) };
    if (t < RPASS) return { k: 'pass', tag: I.pass, d: fill(I.d_rpass, fmt(t - RPERF)) };
    return { k: 'miss', tag: I.slow, d: fill(I.d_rslow, fmt(t - RPASS)) };
  }
  const reactSheet = (t, fs) => { const v = reactVerdict(t, fs);
    return sheet({ ...v, big: fs ? '–' : fmt(t), unit: fs ? '' : 's', score: fs ? 'false_start' : fmt(t), test: 'reaction', cta: fill(I.beat, fmt(t)), more: fs ? I.more_false : I.more,
      meter: { min: 0, max: 0.6, value: fs ? 0 : t, zones: [[0, RPERF, Z.perfect], [RPERF, RPASS, Z.pass]] },
      labels: ['0', I.rwin, '0.60 s'] }); };

  // Screens of the panel, by state
  const solo = 'solo' in panel.dataset; // data-solo: single-mode page (no tabs); data-mode="react|exact" picks the mode
  // 5 modes as icon pills: the active one widens to show its name. Arrow keys move between tabs.
  const TABS = [['exact', 'exact', 'm-exact', I.t_exact], ['hidden', 'hidden', 'm-hidden', I.t_hidden], ['interval', 'interval', 'm-interval', I.t_interval], ['react', 'reaction', 'm-reaction', I.t_react], ['batak', 'batak', 'm-batak', I.t_batak]];
  const tabs = m => solo ? '' : `<div class="tabs t5" role="tablist" aria-label="${I.t_modes}">${TABS.map(([k, s, c, name]) => `<button role="tab" data-a="tab-${k}" aria-selected="${m === k}" aria-label="${name}" title="${name}" tabindex="${m === k ? 0 : -1}" class="${m === k ? 'on' : ''}" style="--c:var(--${c})">${ic(s)}<span>${name}</span></button>`).join('')}</div>`;
  const S = {
    hiddenReady: () => `<div class="stage">${watch(0, `<small>${I.stop_at}</small><div class="n tnum">${fmt(HT)}<span>s</span></div>`, '', 'dots', HT)}</div><p class="hint">${I.h_hidden}</p><button class="go" data-a="start">${I.start}</button>`,
    hiddenRun: () => `<div class="stage">${watch(0, `<div class="n tnum">0.00<span>s</span></div>`, '', 'dots ghost', HT)}</div><p class="hint">${fill(I.h_hidden_run, fmt(HT))}</p><button class="go" data-a="stop">${I.stop}</button>`,
    hiddenDone: t => `<div class="stage">${watch(t, `<div class="n tnum">${fmt(t)}<span>s</span></div><small class="tnum">${fill(I.of, fmt(HT))}</small>`, exactVerdict(t, HT).k, 'dots reveal', HT)}</div><p class="hint">&nbsp;</p><button class="go">${I.stop}</button>` + exactSheet(t, HT, 'hidden', I.more_hidden),
    batakReady: () => board(-1, 0) + `<div class="tapnote"><button class="go" data-a="start">${I.start}</button></div>`,
    batakRun: (lit, hit) => board(lit, hit) + `<p class="tapnote">${I.b_hit}</p>`,
    batakDone: t => board(-1, N, bVerdict(t).k) + `<div class="tapnote"><div class="total"><div class="n tnum">${fmt(t)}<span>s</span></div><small>${I.b_total}</small></div></div>` + bSheet(t),
    ivReady: () => `<div class="stage">${istage(0, 0, '<div class="n q">?</div>')}</div><p class="hint">${I.i_ready}</p><button class="go iv" data-a="start">${I.start}</button>`,
    ivWait: (l, r, w) => `<div class="stage">${istage(l, r, `<div class="w">${w}</div>`, 'dim')}</div><p class="hint">&nbsp;</p><button class="go iv" disabled>${I.i_listen_btn}</button>`,
    ivAnswer: g => `<div class="stage"><div class="ans"><small>${I.i_prompt}</small><div class="n tnum" id="gv">${fmt(g)}<span>s</span></div>
      <div class="slide-row"><button class="step" data-a="minus" aria-label="${I.i_minus}">−</button><input type="range" min="0" max="10" step="0.01" value="${g}" aria-label="${I.i_guess}"><button class="step" data-a="plus" aria-label="${I.i_plus}">+</button></div>
      <div class="scale tnum"><span>0</span><span>5</span><span>10 s</span></div></div></div><p class="hint">${I.i_hint}</p><button class="go iv" data-a="lock">${I.i_lock}</button>`,
    ivDone: (g, real) => { const v = ivVerdict(g, real);
      return `<div class="stage">${istage(1, 1, `<div class="n tnum">${fmt(real)}<span>s</span></div><small class="tnum">${fill(I.i_said, fmt(g))}</small>`, 'v ' + v.k)}</div><p class="hint">&nbsp;</p><button class="go iv">${I.i_lock}</button>`
        + exactSheet(g, real, 'interval', I.more_interval, v); },
    exactReady: () => tabs('exact') + `<div class="stage">${watch(0, readyFace)}</div><p class="hint">${I.h_exact}</p><button class="go" data-a="start">${I.start}</button>`,
    exactRun: t => tabs('exact') + `<div class="stage">${watch(t, runFace(t))}</div><p class="hint">&nbsp;</p><button class="go" data-a="stop">${I.stop}</button>`,
    exactDone: t => tabs('exact') + `<div class="stage">${watch(t, runFace(t), exactVerdict(t).k)}</div><p class="hint">&nbsp;</p><button class="go">${I.stop}</button>` + exactSheet(t),
    reactReady: () => tabs('react') + gantry(0) + `<div class="rface"><small>${I.h_react}</small></div></div></div><div class="tapnote"><button class="go" data-a="start">${I.start}</button></div>`,
    reactLit: n => tabs('react') + gantry(n) + `<div class="rface"><small>&nbsp;</small></div></div></div><p class="tapnote">${I.wait}</p>`,
    reactDone: (t, fs) => { const k = reactVerdict(t, fs).k;
      return tabs('react') + gantry(0, k) + `<div class="rface">${fs ? `<div class="n">${I.too_soon}</div>` : `<div class="n tnum">${fmt(t)}<span>s</span></div><small>${I.reaction}</small>`}</div></div></div><p class="tapnote">&nbsp;</p>` + reactSheet(t, fs); },
  };

  // Live panel: state machine. Replaces the no-JS fallback that is in the HTML.
  let mode = ['react', 'hidden', 'batak', 'interval'].includes(panel.dataset.mode) ? panel.dataset.mode : 'exact', raf = 0, t0 = 0, timers = [], phase = 'idle';
  const clear = () => { cancelAnimationFrame(raf); timers.forEach(clearTimeout); timers = []; };
  const show = (html, slide) => {
    const hadFocus = panel.contains(document.activeElement);
    if (!solo && !html.startsWith('<div class="tabs')) html = tabs(mode) + html;
    ['reaction', 'hidden', 'batak', 'interval'].forEach(c => panel.classList.toggle(c, c === (mode === 'react' ? 'reaction' : mode))); panel.classList.toggle('slide', !!slide); panel.innerHTML = html;
    if (hadFocus) (panel.querySelector('.sheet .btn') || panel.querySelector('.go[data-a]') || panel.querySelector('.tabs .on'))?.focus(); // keyboard users keep their place
  };
  const ready = () => { clear(); phase = 'idle'; show({ exact: S.exactReady, react: S.reactReady, hidden: S.hiddenReady, batak: S.batakReady, interval: S.ivReady }[mode]()); };
  const exactStart = () => {
    track('Game Started', { mode: 'exact', page: PAGE, locale: LOCALE });
    phase = 'run'; t0 = performance.now(); show(S.exactRun(0));
    const n = panel.querySelector('.n'), prog = panel.querySelector('.prog');
    const tick = () => { const t = (performance.now() - t0) / 1000; n.innerHTML = `${fmt(t)}<span>s</span>`; prog.style.strokeDashoffset = C * (1 - Math.min(t / TARGET, 1)); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
  };
  const exactStop = () => { if (performance.now() - t0 < 300) return; // a double-tap on Start must not stop the clock
    const t = Math.round((performance.now() - t0) / 10) / 100;
    clear(); phase = 'done'; show(S.exactDone(t), true);
    finished({ mode: 'exact', page: PAGE, locale: LOCALE, result: `${exactVerdict(t).k} ${fmt(t)}` }); };
  const later = (ms, f) => timers.push(setTimeout(f, ms));
  const gap = () => GAP[0] + Math.random() * (GAP[1] - GAP[0]);
  const reactStart = () => {
    track('Game Started', { mode: 'reaction', page: PAGE, locale: LOCALE });
    phase = 'lit'; show(S.reactLit(0));
    let at = 400;
    for (let i = 1; i <= LIGHTS; i++) { const n = i; later(at, () => show(S.reactLit(n))); at += gap(); }
    later(at, () => { show(S.reactLit(0)); phase = 'out'; t0 = performance.now(); });
  };
  const reactEnd = fs => { const t = Math.round(performance.now() - t0) / 1000; clear(); phase = 'done'; show(S.reactDone(t, fs), true);
    finished({ mode: 'reaction', page: PAGE, locale: LOCALE, result: `${reactVerdict(t, fs).k} ${fs ? 'false_start' : fmt(t)}` }); };
  // Hidden Clock: Exact Time's stop with a hidden 10 s target
  const hiddenStart = () => { track('Game Started', { mode: 'hidden', page: PAGE, locale: LOCALE }); phase = 'run'; t0 = performance.now(); show(S.hiddenRun()); };
  const hiddenStop = () => { if (performance.now() - t0 < 300) return;
    const t = Math.round((performance.now() - t0) / 10) / 100;
    clear(); phase = 'done'; show(S.hiddenDone(t), true);
    finished({ mode: 'hidden', page: PAGE, locale: LOCALE, result: `${exactVerdict(t, HT).k} ${fmt(t)}` }); };
  // Batak: 8 lights, one random pad each (never the same twice in a row), no clock while playing
  let seq = [], hits = 0;
  const batakStart = () => { track('Game Started', { mode: 'batak', page: PAGE, locale: LOCALE }); hits = 0; seq = [nextPad(-1)]; phase = 'run'; t0 = performance.now(); show(S.batakRun(seq[0], 0)); };
  const padHit = i => {
    if (phase !== 'run' || i !== seq[hits]) return; // only the lit pad counts
    hits++;
    if (hits === N) { const t = Math.round((performance.now() - t0) / 10) / 100; phase = 'done'; show(S.batakDone(t), true);
      finished({ mode: 'batak', page: PAGE, locale: LOCALE, result: `${bVerdict(t).k} ${fmt(t)}` }); return; }
    seq.push(nextPad(i)); show(S.batakRun(seq[hits], hits));
    panel.querySelector(`[data-pad="${i}"]`).classList.add('hit');
  };
  // Interval: flash + beep, hidden gap, flash + beep, then guess
  let real = 5, guess = 5, ac;
  const beep = () => { try { ac = ac || new AudioContext(); const o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = 880; g.gain.setValueAtTime(.15, ac.currentTime); g.gain.exponentialRampToValueAtTime(.001, ac.currentTime + .15); o.connect(g).connect(ac.destination); o.start(); o.stop(ac.currentTime + .16); } catch (e) {} }; // silent if audio is blocked
  const ivStart = () => {
    track('Game Started', { mode: 'interval', page: PAGE, locale: LOCALE });
    real = TIMES[Math.floor(Math.random() * TIMES.length)]; guess = 5; phase = 'listen';
    try { ac = ac || new AudioContext(); if (ac.state === 'suspended') ac.resume(); } catch (e) {} // unlocked silently inside the tap so the two signal beeps are allowed; no beep on Start
    show(S.ivWait(0, 0, I.i_get));
    later(900, () => { beep(); show(S.ivWait(1, 0, I.i_listen)); later(220, () => show(S.ivWait(0, 0, I.i_listen))); });
    later(900 + real * 1000, () => { beep(); show(S.ivWait(0, 1, I.i_listen)); later(400, () => { phase = 'answer'; show(S.ivAnswer(guess)); }); });
  };
  const setGuess = g => { guess = Math.max(0, Math.min(10, Math.round(g * 100) / 100)); const n = panel.querySelector('#gv'), r = panel.querySelector('input[type=range]');
    if (n) n.innerHTML = `${fmt(guess)}<span>s</span>`; if (r && +r.value !== guess) r.value = guess; };
  const lock = () => { if (phase !== 'answer') return; phase = 'done'; show(S.ivDone(guess, real), true);
    finished({ mode: 'interval', page: PAGE, locale: LOCALE, result: `${ivVerdict(guess, real).k} ${fmt(guess)}` }); };
  const tap = () => { if (phase === 'lit') reactEnd(true); else if (phase === 'out') reactEnd(false); };
  panel.addEventListener('pointerdown', e => { if (e.button !== 0) return;
    const p = e.target.closest('[data-pad]');
    if (p && mode === 'batak') padHit(+p.dataset.pad);
    else if (mode === 'react' && !e.target.closest('[data-a],a')) tap(); }); // react: whole panel is the tap target
  panel.addEventListener('input', e => { if (e.target.type === 'range') setGuess(+e.target.value); });
  document.addEventListener('keydown', e => {
    if (e.code !== 'Space') return;
    if (mode === 'react' && (phase === 'lit' || phase === 'out')) { e.preventDefault(); tap(); }
    else if (phase === 'run' && (mode === 'exact' || mode === 'hidden')) { e.preventDefault(); mode === 'exact' ? exactStop() : hiddenStop(); }
  });
  panel.addEventListener('keydown', e => { // tablist: left/right arrows switch mode
    if (!e.target.closest('.tabs') || !['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    const ks = TABS.map(t => t[0]), i = ks.indexOf(mode);
    mode = ks[(i + (e.key === 'ArrowRight' ? 1 : ks.length - 1)) % ks.length]; ready(); panel.querySelector('.tabs .on').focus(); e.preventDefault(); });
  panel.addEventListener('click', e => {
    const a = e.target.closest('[data-a]')?.dataset.a;
    if (a?.startsWith('tab-')) { mode = a.slice(4); ready(); panel.querySelector('.tabs .on')?.focus({ preventScroll: true }); }
    else if (a === 'start') ({ exact: exactStart, react: reactStart, hidden: hiddenStart, batak: batakStart, interval: ivStart }[mode])();
    else if (a === 'stop') mode === 'hidden' ? hiddenStop() : exactStop();
    else if (a === 'minus') setGuess(guess - 0.01);
    else if (a === 'plus') setGuess(guess + 0.01);
    else if (a === 'lock') lock();
    else if (a === 'again') ready();
  });
  ready();
})();
