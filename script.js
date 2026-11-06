// Gurrulabs site: Play referrer, Mixpanel (production host only) and the two browser tests on the Pulse page.
(() => {
  'use strict';
  const PAGE = document.body.dataset.page;      // page slug: home | pulse | cyberpunk-detective ...
  const LOCALE = document.body.dataset.locale;  // en | es | fr | pt

  // ── Mixpanel: public token of the shared "Gurru Labs websites" project, EU host. Production hostname only:
  //    localhost, file:// and Cloudflare preview URLs (<hash>.gurrulabs.pages.dev) must not send events.
  const MIXPANEL_TOKEN = '20a6baa8d266700297f9b0b16efc0a13';
  let tracking = false;
  function initMixpanel() {
    if (location.hostname !== 'gurrulabs.pages.dev') return;
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
  const track = (event, props) => { if (tracking && window.mixpanel && typeof window.mixpanel.track === 'function') window.mixpanel.track('Gurrulabs Web - ' + event, props); };

  // ── Play links: clean href in the HTML; the install referrer is added on load and again on press (links created by the test)
  const PLAY_SEL = 'a[href*="play.google.com/store/apps/details"]:not(.sources a)'; // source citations are not install CTAs
  function withPlayReferrer(a) {
    const referrer = new URLSearchParams({
      utm_source: 'gurrulabs_web', utm_medium: 'web', utm_campaign: PAGE,
      utm_content: a.dataset.cta || 'unknown', utm_term: LOCALE,
    });
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

  // Raffy links: pass this visitor's Mixpanel ID so raffyparenting.com keeps the same user (gl_mp_id, read by Raffy Web)
  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[href*="raffyparenting.com"]');
    if (!a || !tracking || typeof window.mixpanel.get_distinct_id !== 'function') return;
    const url = new URL(a.href);
    url.searchParams.set('gl_mp_id', window.mixpanel.get_distinct_id());
    a.href = url.toString();
  });

  initMixpanel();
  // View event named from the slug (pulse → Pulse, cyberpunk-detective → Cyberpunk Detective); naming rule in docs/domain.md
  track(PAGE.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' '), { locale: LOCALE });

  // ── The tests (Pulse page only)
  const panel = document.getElementById('game');
  if (!panel) return;
  const I = JSON.parse(document.getElementById('i18n').textContent);
  const fill = (s, a) => s.replace('{a}', a);
  const fmt = s => s.toFixed(2);
  const PLAY_PULSE = 'https://play.google.com/store/apps/details?id=com.gurrulabs.pulse';

  const SYM = {
    exact: '<circle cx="12" cy="13" r="7"/><path d="M12 13V9M10 3h4"/>',
    reaction: '<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>',
  };
  const ic = id => `<svg class="i" viewBox="0 0 24 24">${SYM[id]}</svg>`;
  const RING = '<g fill="none" stroke="currentColor" stroke-opacity=".4" stroke-width="1.5"><circle cx="13" cy="13" r="11"/><circle cx="13" cy="13" r="5.5"/></g>';
  const MARK = { perfect: RING + '<circle cx="13" cy="13" r="2.6" fill="currentColor"/>', pass: RING + '<circle cx="16.5" cy="10" r="2.6" fill="currentColor"/>', miss: RING + '<circle cx="21" cy="6" r="2.6" fill="currentColor"/>' };
  const mark = k => `<svg viewBox="0 0 26 26">${MARK[k]}</svg>`;
  const GP = '<svg viewBox="0 0 26 28"><path d="M1 1l13 13L1 27z" fill="#00D7FE"/><path d="M1 1l17 9.5-4 3.5z" fill="#00F076"/><path d="M1 27l17-9.5-4-3.5z" fill="#F63448"/><path d="M18 10.5l6 3.5-6 3.5-4-3.5z" fill="#FFC900"/></svg>';

  // Exact Time watch: a full turn of the ring = the target
  const TARGET = 3, WIN = 0.10, C = 2 * Math.PI * 128;
  const watch = (t, face, v = '') => `<div class="watch ${v ? 'v ' + v : ''}"><div class="ticks"></div><svg class="ring" viewBox="0 0 272 272"><circle class="track" cx="136" cy="136" r="128"/><circle class="prog" cx="136" cy="136" r="128" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - Math.min(t / TARGET, 1))}"/></svg><div class="face">${face}</div></div>`;
  const readyFace = `<small>${I.stop_at}</small><div class="n tnum">${fmt(TARGET)}<span>s</span></div>`;
  const runFace = t => `<div class="n tnum">${fmt(t)}<span>s</span></div><small class="tnum">${fill(I.of, fmt(TARGET))}</small>`;

  function exactVerdict(t) {
    const off = Math.round((t - TARGET) * 100) / 100, a = Math.abs(off), late = off > 0 ? 1 : 0;
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
  const exactSheet = t => { const v = exactVerdict(t);
    return sheet({ ...v, big: fmt(t), score: fmt(t), test: 'exact', cta: v.k === 'perfect' ? I.keep : fill(I.beatx, fmt(Math.abs(t - TARGET))), more: I.more,
      meter: { min: TARGET - 1, max: TARGET + 1, value: t, target: TARGET, zones: [[TARGET - WIN, TARGET + WIN, Z.pass]] },
      labels: [fmt(TARGET - 1), I.win, fmt(TARGET + 1)] }); };

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
  const tabs = mode => solo ? '' : `<div class="tabs" role="tablist"><button data-a="tab-exact" class="${mode === 'exact' ? 'on' : ''}" style="--c:var(--m-exact)">${ic('exact')}${I.t_exact}</button><button data-a="tab-react" class="${mode === 'react' ? 'on' : ''}" style="--c:var(--m-reaction)">${ic('reaction')}${I.t_react}</button></div>`;
  const S = {
    exactReady: () => tabs('exact') + `<div class="stage">${watch(0, readyFace)}</div><p class="hint">${I.h_exact}</p><button class="go" data-a="start">${I.start}</button>`,
    exactRun: t => tabs('exact') + `<div class="stage">${watch(t, runFace(t))}</div><p class="hint">&nbsp;</p><button class="go" data-a="stop">${I.stop}</button>`,
    exactDone: t => tabs('exact') + `<div class="stage">${watch(t, runFace(t), exactVerdict(t).k)}</div><p class="hint">&nbsp;</p><button class="go">${I.stop}</button>` + exactSheet(t),
    reactReady: () => tabs('react') + gantry(0) + `<div class="rface"><small>${I.h_react}</small></div></div></div><div class="tapnote"><button class="go" data-a="start">${I.start}</button></div>`,
    reactLit: n => tabs('react') + gantry(n) + `<div class="rface"><small>&nbsp;</small></div></div></div><p class="tapnote">${I.wait}</p>`,
    reactDone: (t, fs) => { const k = reactVerdict(t, fs).k;
      return tabs('react') + gantry(0, k) + `<div class="rface">${fs ? `<div class="n">${I.too_soon}</div>` : `<div class="n tnum">${fmt(t)}<span>s</span></div><small>${I.reaction}</small>`}</div></div></div><p class="tapnote">&nbsp;</p>` + reactSheet(t, fs); },
  };

  // Live panel: state machine. Replaces the no-JS fallback that is in the HTML.
  let mode = panel.dataset.mode === 'react' ? 'react' : 'exact', raf = 0, t0 = 0, timers = [], phase = 'idle';
  const clear = () => { cancelAnimationFrame(raf); timers.forEach(clearTimeout); timers = []; };
  const show = (html, slide) => {
    const hadFocus = panel.contains(document.activeElement);
    panel.classList.toggle('reaction', mode === 'react'); panel.classList.toggle('slide', !!slide); panel.innerHTML = html;
    if (hadFocus) (panel.querySelector('.sheet .btn') || panel.querySelector('.go[data-a]') || panel.querySelector('.tabs .on'))?.focus(); // keyboard users keep their place
  };
  const ready = () => { clear(); phase = 'idle'; show(mode === 'exact' ? S.exactReady() : S.reactReady()); };
  const exactStart = () => {
    phase = 'run'; t0 = performance.now(); show(S.exactRun(0));
    const n = panel.querySelector('.n'), prog = panel.querySelector('.prog');
    const tick = () => { const t = (performance.now() - t0) / 1000; n.innerHTML = `${fmt(t)}<span>s</span>`; prog.style.strokeDashoffset = C * (1 - Math.min(t / TARGET, 1)); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
  };
  const exactStop = () => { if (performance.now() - t0 < 300) return; // a double-tap on Start must not stop the clock
    clear(); phase = 'done'; show(S.exactDone(Math.round((performance.now() - t0) / 10) / 100), true); };
  const later = (ms, f) => timers.push(setTimeout(f, ms));
  const gap = () => GAP[0] + Math.random() * (GAP[1] - GAP[0]);
  const reactStart = () => {
    phase = 'lit'; show(S.reactLit(0));
    let at = 400;
    for (let i = 1; i <= LIGHTS; i++) { const n = i; later(at, () => show(S.reactLit(n))); at += gap(); }
    later(at, () => { show(S.reactLit(0)); phase = 'out'; t0 = performance.now(); });
  };
  const reactEnd = fs => { const t = Math.round(performance.now() - t0) / 1000; clear(); phase = 'done'; show(S.reactDone(t, fs), true); };
  const tap = () => { if (phase === 'lit') reactEnd(true); else if (phase === 'out') reactEnd(false); };
  panel.addEventListener('pointerdown', e => { if (e.button === 0 && mode === 'react' && !e.target.closest('[data-a],a')) tap(); }); // whole panel is the tap target
  document.addEventListener('keydown', e => {
    if (e.code !== 'Space') return;
    if (mode === 'react' && (phase === 'lit' || phase === 'out')) { e.preventDefault(); tap(); }
    else if (mode === 'exact' && phase === 'run') { e.preventDefault(); exactStop(); }
  });
  panel.addEventListener('click', e => {
    const a = e.target.closest('[data-a]')?.dataset.a;
    if (a === 'tab-exact' || a === 'tab-react') { mode = a === 'tab-exact' ? 'exact' : 'react'; ready(); }
    else if (a === 'start') mode === 'exact' ? exactStart() : reactStart();
    else if (a === 'stop') exactStop();
    else if (a === 'again') ready();
  });
  ready();
})();
