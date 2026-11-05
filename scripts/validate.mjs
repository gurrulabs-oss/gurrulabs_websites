// Validates the generated site against the page registry (scripts/pages.mjs): files, canonical/hreflang (reciprocal), sitemap,
// llms.txt, robots.txt, IndexNow key, unique titles/descriptions, JSON-LD, content-page requirements (sources, dates, internal
// links), internal hrefs, page tracking, Play links, analytics gate, banned claims.
// Run from repo root: node scripts/validate.mjs (exit 1 on any failure). node: built-ins only.
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import assert from 'node:assert/strict';
import { SITE as HOST, LOCALES as DIRS, HREFLANG, PAGES, path, url, fileOf } from './pages.mjs';

const FREE_WORDS = 'free|gratis|gratuit\\w*|grátis|gratuito';
const BANNED = new RegExp(`\\b(cure[sd]?|eliminat\\w*|${FREE_WORDS}|no ads|F1|sin anuncios|sans pub\\w*|sem anúncios)\\b`, 'i');
// Cyberpunk Detective and Lull have a confirmed price (facts.md: free), so "free" is allowed there; the rest still applies
const BANNED_FREE_OK = new RegExp(BANNED.source.replace(`${FREE_WORDS}|`, ''), 'i');
// Lull wording rules (facts.md): never cure / eliminate / treat (outside the disclaimer) / reduce, in any locale
const LULL_BANNED = /\b(?:cur(?:e|es|ed|ar|a)\b|elimin|reduc|reduz|r[ée]du(?:ire|it)|gu[ée]ri|trat|treat|traite)/i;
const BOTS = ['OAI-SearchBot', 'ChatGPT-User', 'GPTBot', 'Claude-SearchBot', 'Claude-User', 'ClaudeBot', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Bingbot'];

const attr = (tag, name) => tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
const tags = (html, re) => html.match(re) || [];
const text = html => html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ');
const unesc = s => s.replace(/&lt;/g, '<').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
const h1Text = html => { const m = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/); return m ? unesc(m[1].replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim() : null; };
// JSON-LD blocks: parsed objects, or { error } when a block does not parse
const ldBlocks = html => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => { try { return JSON.parse(m[1]); } catch (e) { return { error: e.message }; } });
const hrefs = html => [...html.matchAll(/\shref="(\/[^"/][^"]*|\/)"/g)].map(m => m[1]);
const fileOfHref = h => { const p = h.split('#')[0].split('?')[0]; return p.endsWith('/') ? p.slice(1) + 'index.html' : p.slice(1); };
const times = html => [...html.matchAll(/<time datetime="(\d{4}-\d{2}-\d{2})"/g)].map(m => m[1]);

// Self-check of the helpers
assert.equal(attr('<link rel="canonical" href="x">', 'href'), 'x');
assert.equal(text('<p>a<script>free</script>b</p>').includes('free'), false);
assert.ok(BANNED.test('No ads here') && BANNED.test('cures') && !BANNED.test('carefree') && !BANNED.test('freedom'));
assert.ok(!BANNED_FREE_OK.test('Free. Gratis, gratuito') && BANNED_FREE_OK.test('No ads') && BANNED_FREE_OK.test('cure'));
assert.ok(LULL_BANNED.test('It treats') && LULL_BANNED.test('reducir') && LULL_BANNED.test('guérir') && !LULL_BANNED.test('Patterns, not causes. Secure') && !LULL_BANNED.test('bothers you less'));
assert.ok(BANNED.test('Juega gratis') && BANNED.test('appli gratuite') && BANNED.test('jogo grátis') && BANNED.test('test gratuito') && BANNED.test('sin anuncios')
  && BANNED.test('sans publicité') && BANNED.test('sem anúncios') && !BANNED.test('gratitude') && !BANNED.test('anuncios de Pulse'));
assert.equal(h1Text('<h1 class="x">A <em>b</em> &amp; c</h1>'), 'A b & c');
assert.equal(h1Text('<p>no h1</p>'), null);
assert.deepEqual(ldBlocks('<script type="application/ld+json">{"a":"\\u003c"}</script><script type="application/ld+json">{bad</script>').map(b => b.a ?? 'err'), ['<', 'err']);
assert.deepEqual(hrefs('<a href="/en/">x</a><a href="//cdn/x">y</a><a href="https://a/">z</a><a href="#a">w</a><a href="/a.css?v=1#f">v</a>'), ['/en/', '/a.css?v=1#f']);
assert.equal(fileOfHref('/'), 'index.html');
assert.equal(fileOfHref('/en/pulse/#sources'), 'en/pulse/index.html');
assert.equal(fileOfHref('/assets/a.webp?x=1'), 'assets/a.webp');
assert.deepEqual(times('<time datetime="2026-11-05">5 Nov</time><time datetime="bad">'), ['2026-11-05']);

// Every page is tracked (docs/domain.md Measurement): <body data-page="<slug>" data-locale="<dir>"> and /script.js.
function tracked(html, slug, loc) {
  const body = html.match(/<body\b[^>]*>/)?.[0] || '';
  if (attr(body, 'data-page') !== slug) return `<body data-page> should be "${slug}" (names the view event)`;
  if (attr(body, 'data-locale') !== loc) return `<body data-locale> should be "${loc}"`;
  if (!/<script src="\/script\.js"/.test(html)) return 'does not load /script.js (no tracking)';
  return null;
}
const ok = '<body data-page="pulse" data-locale="en"><script src="/script.js" defer></script>';
assert.equal(tracked(ok, 'pulse', 'en'), null);
assert.ok(tracked(ok.replace(' data-page="pulse"', ''), 'pulse', 'en'));
assert.ok(tracked(ok, 'cyberpunk-detective', 'en'));
assert.ok(tracked(ok, 'pulse', 'es'));
assert.ok(tracked(ok.replace(/<script.*/, ''), 'pulse', 'en'));

const errors = [];
const fail = (where, msg) => errors.push(`✗ ${where}: ${msg}`);
const read = f => readFileSync(f, 'utf8');

// Parse every page once: html + its hreflang map
const pages = [];
for (const p of PAGES) for (const loc of DIRS) {
  const file = fileOf(loc, p), own = url(loc, p), shown = path(loc, p);
  if (!existsSync(file)) { fail(shown, `page file ${file} missing`); continue; }
  const html = read(file);
  const alts = Object.fromEntries(tags(html, /<link rel="alternate" hreflang[^>]*>/g).map(t => [attr(t, 'hreflang'), attr(t, 'href')]));
  pages.push({ p, loc, own, shown, html, alts });
}
const byUrl = new Map(pages.map(x => [x.own, x]));

const seen = { title: new Map(), desc: new Map() };
let hrefChecked = 0;
for (const { p, loc, own, shown, html, alts } of pages) {
  const f = msg => fail(shown, msg);
  const canon = tags(html, /<link rel="canonical"[^>]*>/g);
  if (canon.length !== 1 || attr(canon[0], 'href') !== own) f(`canonical should be ${own}`);
  // hreflang: exactly the registry set, every target exists and links back
  const expected = Object.fromEntries([...DIRS.map(l => [HREFLANG[l], url(l, p)]), ['x-default', url('en', p)]]);
  if (JSON.stringify(Object.entries(alts).sort()) !== JSON.stringify(Object.entries(expected).sort())) f(`hreflang set wrong: ${Object.entries(alts).map(e => e.join(' ')).join(', ')}`);
  for (const target of Object.values(alts)) {
    const t = byUrl.get(target);
    if (!t) f(`hreflang points to missing page ${target}`);
    else if (!Object.values(t.alts).includes(own)) f(`hreflang not reciprocal: ${target} does not link back`);
  }
  if (!new RegExp(`<html lang="${HREFLANG[loc]}"`).test(html)) f('wrong <html lang>');
  for (const m of ['<title>', 'name="description"', 'og:title', 'og:description', 'og:url']) if (!html.includes(m)) f(`missing ${m}`);
  const title = html.match(/<title>([\s\S]*?)<\/title>/)?.[1], desc = attr(html.match(/<meta name="description"[^>]*>/)?.[0] || '', 'content');
  for (const [k, v] of [['title', title], ['desc', desc]]) {
    if (v && seen[k].has(v)) f(`duplicate ${k === 'desc' ? 'meta description' : '<title>'} (also ${seen[k].get(v)})`);
    else if (v) seen[k].set(v, shown);
  }
  const untracked = tracked(html, p.dataPage, loc);
  if (untracked) f(untracked);
  for (const a of tags(html, /<a\b[^>]*play\.google\.com[^>]*>/g))
    if (!attr(a, 'data-cta') || !attr(a, 'data-app')) f(`Play link without data-cta/data-app: ${a.slice(0, 120)}`);
  if (/mixpanel/i.test(html)) f('mixpanel referenced in HTML (must live only in script.js behind the gate)');
  const bad = text(html).match(['cyberpunk-detective', 'lull'].includes(p.id) ? BANNED_FREE_OK : BANNED);
  if (bad) f(`banned claim "${bad[0]}"`);

  // Internal hrefs must resolve to a file or page
  for (const h of new Set(hrefs(html))) { hrefChecked++; if (!existsSync(fileOfHref(h))) f(`broken internal link ${h}`); }

  // JSON-LD
  const ld = ldBlocks(html), of = type => ld.find(b => b['@type'] === type);
  // JSON-LD dates of a content page = registry dates = a visible <time datetime>
  const ldDates = (type, o) => { const shownDates = times(html);
    if (o.datePublished !== p.published || !shownDates.includes(o.datePublished)) f(`${type} datePublished ${o.datePublished} must equal registry (${p.published}) and a visible <time datetime>`);
    if (o.dateModified !== p.modified || !shownDates.includes(o.dateModified)) f(`${type} dateModified ${o.dateModified} must equal registry (${p.modified}) and a visible <time datetime>`); };
  const h1 = h1Text(html);
  if (!ld.length) f('no JSON-LD');
  else if (ld.some(b => b.error)) f(`JSON-LD not parseable: ${ld.find(b => b.error).error}`);
  else {
    if (p.type === 'home' && !of('Organization')) f('JSON-LD Organization missing');
    if (p.type === 'app' && !of('MobileApplication')) f('JSON-LD MobileApplication missing');
    if (p.type !== 'home' && !of('BreadcrumbList')) f('JSON-LD BreadcrumbList missing');
    if (p.type === 'test' || p.type === 'challenge') {
      const w = of('WebApplication');
      if (!w) f('JSON-LD WebApplication missing'); else { if (w.name !== h1) f(`JSON-LD name "${w.name}" differs from visible <h1> "${h1}"`); ldDates('WebApplication', w); }
    }
    if (p.type === 'guide') {
      const a = of('Article');
      if (!a) f('JSON-LD Article missing');
      else { if (a.headline !== h1) f(`JSON-LD headline "${a.headline}" differs from visible <h1> "${h1}"`); ldDates('Article', a); }
    }
  }

  // New app pages: FAQPage JSON-LD = visible FAQ, ≥ 3 internal links; Lull: no Play link, sources, wording rules outside the disclaimer
  if (p.type === 'app' && p.id !== 'pulse') {
    const faq = of('FAQPage'), shownFaq = [...html.matchAll(/<details[^>]*><summary>([\s\S]*?)<\/summary><p>([\s\S]*?)<\/p>/g)].map(m => [unesc(m[1]), unesc(m[2])]);
    if (!faq) f('JSON-LD FAQPage missing');
    else if (JSON.stringify(faq.mainEntity.map(q => [q.name, q.acceptedAnswer.text])) !== JSON.stringify(shownFaq)) f('JSON-LD FAQPage differs from the visible FAQ');
    const main = html.match(/<main[\s\S]*?<\/main>/)?.[0] || '';
    const internal = new Set(hrefs(main).map(h => h.split('#')[0]).filter(h => h.endsWith('/') && h !== shown && existsSync(fileOfHref(h))));
    if (internal.size < 3) f(`app page has ${internal.size} internal links to other pages (needs ≥ 3)`);
    if (!times(html).length) f('no visible publish/update date (<time datetime>)');
    if (p.id === 'lull') {
      if (/play\.google\.com/.test(html)) f('Lull is not on Google Play: no Play link allowed');
      if (!/<a class="btn" href="mailto:[^"]*" data-cta="lull_signup" data-app="lull">/.test(html)) f('Lull hero sign-up mailto link missing');
      if (tags(html.match(/<section class="sources"[\s\S]*?<\/section>/)?.[0] || '', /\shref="https:\/\/doi\.org\/[^"]+"/g).length < 2) f('Lull needs its 2 doi.org sources in .sources');
      const w = text(html.replace(/<p class="disc">[\s\S]*?<\/p>/, '')).match(LULL_BANNED);
      if (w) f(`Lull wording rule: "${w[0]}" (only the disclaimer may say treat)`);
    }
  }

  // Content pages: sources, dates, internal links, link to the Pulse page
  if (['test', 'guide', 'challenge'].includes(p.type)) {
    const src = html.match(/<section class="sources"[\s\S]*?<\/section>/)?.[0] || '';
    const n = tags(src, /\shref="https:\/\/[^"]+"/g).length;
    if (n < 3) f(`content page has ${n} source links in .sources (needs ≥ 3)`);
    if (!times(html).length) f('no visible publish/update date (<time datetime>)');
    const main = html.match(/<main[\s\S]*?<\/main>/)?.[0] || '';
    const internal = new Set(hrefs(main).map(h => h.split('#')[0]).filter(h => h.endsWith('/') && h !== shown && existsSync(fileOfHref(h))));
    if (internal.size < 3) f(`content page has ${internal.size} internal links to other pages (needs ≥ 3)`);
    if (!internal.has(`/${loc}/pulse/`)) f(`no link to /${loc}/pulse/`);
  }
}

// sitemap.xml: every page once, nothing else, lastmod = registry modified
const sitemap = read('sitemap.xml');
const entries = [...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(m => ({ loc: m[1].match(/<loc>([^<]*)<\/loc>/)?.[1], lastmod: m[1].match(/<lastmod>([^<]*)<\/lastmod>/)?.[1] }));
const wantMod = new Map(pages.map(x => [x.own, x.p.modified]));
for (const e of entries) {
  if (!wantMod.has(e.loc)) fail('sitemap.xml', `lists ${e.loc} which is not a registry page`);
  else if (e.lastmod !== wantMod.get(e.loc)) fail('sitemap.xml', `${e.loc} lastmod ${e.lastmod} should be ${wantMod.get(e.loc)}`);
}
let inSitemap = 0;
for (const u of wantMod.keys()) { if (entries.filter(e => e.loc === u).length === 1) inSitemap++; else fail('sitemap.xml', `${u} missing or listed twice`); }

// llms.txt: EN URL of every page listed (rule: a page counts when its EN variant is listed); no dead gurrulabs links
const llms = existsSync('llms.txt') ? read('llms.txt') : (fail('llms.txt', 'missing'), '');
let inLlms = 0;
for (const p of PAGES) { if (llms.includes(`](${url('en', p)})`)) inLlms++; else if (llms) fail('llms.txt', `missing ${url('en', p)}`); }
for (const u of new Set(llms.match(new RegExp(`${HOST}[^\\s)]*`, 'g')) || [])) if (!byUrl.has(u)) fail('llms.txt', `links ${u} which does not exist`);

// robots.txt
const robots = read('robots.txt');
for (const b of BOTS) if (!robots.includes(`User-agent: ${b}\n`)) fail('robots.txt', `missing User-agent: ${b}`);
if (!robots.includes(`Sitemap: ${HOST}/sitemap.xml`)) fail('robots.txt', 'no Sitemap line');

// IndexNow key file: <32 hex>.txt at the root, content = name
const keyFiles = readdirSync('.').filter(f => /^[0-9a-f]{32}\.txt$/.test(f));
if (keyFiles.length !== 1 || read(keyFiles[0]).trim() !== keyFiles[0].slice(0, -4)) fail('IndexNow key', `need exactly one <32 hex>.txt at the repo root whose content equals its name (found: ${keyFiles.join(', ') || 'none'})`);

// Analytics gate: one init, after the exact-host check, inside the same function.
const js = read('script.js');
const inits = js.split('mixpanel.init(').length - 1;
const gate = js.indexOf(`location.hostname !== '${HOST.slice(8)}'`);
const fn = js.indexOf('function initMixpanel');
const init = js.indexOf('mixpanel.init(');
if (inits !== 1 || gate < 0 || !(fn < gate && gate < init)) fail('script.js', 'mixpanel.init must appear once, after the exact production-host gate in initMixpanel');

if (errors.length) { console.error(`${errors.join('\n')}\nvalidate: ${errors.length} error${errors.length === 1 ? '' : 's'}`); process.exit(1); }
console.log(`validate: OK (${pages.length} pages, ${DIRS.length} locales, sitemap ${inSitemap}/${PAGES.length * DIRS.length}, llms.txt ${inLlms}/${PAGES.length} EN pages, ${hrefChecked} internal links, all tracked, analytics gate present)`);
