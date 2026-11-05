// The ONE page registry. Imported by build.mjs (renders everything from it) and validate.mjs (checks against it). No side effects.
// To add a page: add an entry here, add its copy in build.mjs (T for home/pulse, CONTENT for content pages), rebuild, validate.
//   id        stable key (also the CONTENT key)
//   app       app folder under /<loc>/ (null = studio home)
//   type      home | app | test | guide | challenge
//   slug      last URL segment per locale (omit for home and the app page itself)
//   published, modified   hand-set 'YYYY-MM-DD'; change `modified` only when the page's text changes (feeds <lastmod>, Article dates)
//   dataPage  <body data-page> slug (names the Mixpanel view event)
//   card      content pages: [icon, Pulse mode colour] of its link card; registry order = card and footer order
//   llms      optional EN one-liner for /llms.txt (facts only). llms.txt lists the EN URL of every page; the validator
//             treats a page as "in llms.txt" when its EN URL is listed (locale roots are listed under Optional).
export const SITE = 'https://gurrulabs.pages.dev';
export const LOCALES = ['en', 'es', 'fr', 'pt'];
export const HREFLANG = { en: 'en', es: 'es', fr: 'fr', pt: 'pt-BR' };

const D = '2026-11-05';
export const PAGES = [
  { id: 'home', app: null, type: 'home', published: D, modified: D, dataPage: 'home',
    llms: 'Studio home: the four apps and where to get each one.' },
  { id: 'pulse', app: 'pulse', type: 'app', published: D, modified: D, dataPage: 'pulse',
    llms: 'Android game with 5 modes: Exact Time, Hidden Clock, Interval, Reaction, Batak. No account, works offline. Includes a browser version of two modes.' },
  { id: 'reaction-test', app: 'pulse', type: 'test', published: D, modified: D, dataPage: 'pulse-reaction-test', card: ['reaction', 'm-reaction'],
    slug: { en: 'reaction-time-test', es: 'test-tiempo-de-reaccion', fr: 'test-temps-de-reaction', pt: 'teste-tempo-de-reacao' },
    llms: 'Browser reaction time test: tap when the lights go out; the result is in seconds (perfect up to 0.30 s, pass under 0.40 s).' },
  { id: '3s-challenge', app: 'pulse', type: 'challenge', published: D, modified: D, dataPage: 'pulse-3s-challenge', card: ['exact', 'm-exact'],
    slug: { en: '3-second-challenge', es: 'reto-3-segundos', fr: 'defi-3-secondes', pt: 'desafio-3-segundos' },
    llms: 'Browser game: stop a stopwatch at exactly 3.00 s (pass window ±0.10 s).' },
  { id: 'age-guide', app: 'pulse', type: 'guide', published: D, modified: D, dataPage: 'pulse-age-guide', card: ['chart', 'm-interval'],
    slug: { en: 'average-reaction-time-by-age', es: 'tiempo-de-reaccion-por-edad', fr: 'temps-de-reaction-par-age', pt: 'tempo-de-reacao-por-idade' },
    llms: 'Guide: average simple reaction time by age group, 18 to 65 (Woods et al. 2015, Table 2), what changes it, with sources.' },
];

// /en/, /en/pulse/, /en/pulse/reaction-time-test/
export const path = (loc, p) => `/${loc}/${p.app ? p.app + '/' : ''}${p.slug ? p.slug[loc] + '/' : ''}`;
export const url = (loc, p) => SITE + path(loc, p);
export const fileOf = (loc, p) => path(loc, p).slice(1) + 'index.html';
