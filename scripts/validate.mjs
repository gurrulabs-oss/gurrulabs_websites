// Validates the generated site: pages per locale, canonical/hreflang, sitemap, page tracking, Play links, analytics gate, banned claims.
// Run from repo root: node scripts/validate.mjs (exit 1 on any failure).
import { readFileSync, existsSync } from 'node:fs';
import assert from 'node:assert/strict';

const HOST = 'https://gurrulabs.pages.dev';
const LOCALES = { en: 'en', es: 'es', fr: 'fr', pt: 'pt-BR' };
const PAGES = ['', 'pulse/'];
const BANNED = /\b(cure[sd]?|eliminat\w*|free|no ads|F1)\b/i;

const attr = (tag, name) => tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
const tags = (html, re) => html.match(re) || [];
const text = html => html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ');

// Self-check of the helpers
assert.equal(attr('<link rel="canonical" href="x">', 'href'), 'x');
assert.equal(text('<p>a<script>free</script>b</p>').includes('free'), false);
assert.ok(BANNED.test('No ads here') && BANNED.test('cures') && !BANNED.test('carefree') && !BANNED.test('freedom'));

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
const fail = (where, msg) => errors.push(`${where}: ${msg}`);

for (const page of PAGES) {
  const expected = Object.entries(LOCALES).map(([dir, hl]) => `${hl} ${HOST}/${dir}/${page}`)
    .concat(`x-default ${HOST}/en/${page}`).sort();
  for (const [dir] of Object.entries(LOCALES)) {
    const file = `${dir}/${page}index.html`;
    if (!existsSync(file)) { fail(file, 'missing'); continue; }
    const html = readFileSync(file, 'utf8');
    const own = `${HOST}/${dir}/${page}`;
    const canon = tags(html, /<link rel="canonical"[^>]*>/g);
    if (canon.length !== 1 || attr(canon[0], 'href') !== own) fail(file, `canonical should be ${own}`);
    const alts = tags(html, /<link rel="alternate" hreflang[^>]*>/g).map(t => `${attr(t, 'hreflang')} ${attr(t, 'href')}`).sort();
    if (JSON.stringify(alts) !== JSON.stringify(expected)) fail(file, `hreflang set wrong: ${alts.join(', ')}`);
    if (!new RegExp(`<html lang="${LOCALES[dir]}"`).test(html)) fail(file, 'wrong <html lang>');
    for (const m of ['<title>', 'name="description"', 'og:title', 'og:description', 'og:url'])
      if (!html.includes(m)) fail(file, `missing ${m}`);
    const untracked = tracked(html, page ? page.slice(0, -1) : 'home', dir);
    if (untracked) fail(file, untracked);
    for (const a of tags(html, /<a\b[^>]*play\.google\.com[^>]*>/g))
      if (!attr(a, 'data-cta') || !attr(a, 'data-app')) fail(file, `Play link without data-cta/data-app: ${a.slice(0, 120)}`);
    if (/mixpanel/i.test(html)) fail(file, 'mixpanel referenced in HTML (must live only in script.js behind the gate)');
    const bad = text(html).match(BANNED);
    if (bad) fail(file, `banned claim "${bad[0]}"`);
  }
}

const sitemap = readFileSync('sitemap.xml', 'utf8');
const locs = tags(sitemap, /<loc>[^<]*<\/loc>/g).map(l => l.slice(5, -6)).sort();
const want = PAGES.flatMap(p => Object.keys(LOCALES).map(d => `${HOST}/${d}/${p}`)).sort();
if (JSON.stringify(locs) !== JSON.stringify(want)) fail('sitemap.xml', `locs ${locs.join(', ')}`);
if (!readFileSync('robots.txt', 'utf8').includes(`Sitemap: ${HOST}/sitemap.xml`)) fail('robots.txt', 'no Sitemap line');

// Analytics gate: one init, after the exact-host check, inside the same function.
const js = readFileSync('script.js', 'utf8');
const inits = js.split('mixpanel.init(').length - 1;
const gate = js.indexOf(`location.hostname !== '${HOST.slice(8)}'`);
const fn = js.indexOf('function initMixpanel');
const init = js.indexOf('mixpanel.init(');
if (inits !== 1 || gate < 0 || !(fn < gate && gate < init)) fail('script.js', 'mixpanel.init must appear once, after the exact production-host gate in initMixpanel');

if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`validate: OK (${PAGES.length * 4} pages, sitemap ${locs.length} URLs, all tracked, analytics gate present)`);
