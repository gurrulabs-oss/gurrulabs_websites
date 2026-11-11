// The ONE page registry. Imported by build.mjs (renders everything from it) and validate.mjs (checks against it). No side effects.
// To add a page: add an entry here, add its copy in build.mjs (T for home/pulse, CONTENT for content pages), rebuild, validate.
//   id        stable key (also the CONTENT key)
//   app       app folder under /<loc>/ (null = studio home)
//   type      home | app | test | guide | challenge
//   slug      last URL segment per locale (omit for home and the app page itself)
//   published, modified   hand-set 'YYYY-MM-DD'; change `modified` only when the page's text changes (feeds <lastmod>, Article dates)
//   dataPage  <body data-page> slug (names the Mixpanel view event)
//   mode      test pages: the game panel's data-mode (default: react for tests, exact for challenges)
//   card      content pages: [icon, Pulse mode colour] of its link card; registry order = card and footer order
//   listing   optional: the page quotes Play listings (price/ads labels), so the validator allows "free"/"no ads" words there
//   llms      optional EN one-liner for /llms.txt (facts only). llms.txt lists the EN URL of every page; the validator
//             treats a page as "in llms.txt" when its EN URL is listed (locale roots are listed under Optional).
export const SITE = 'https://www.gurrulabs.com';
export const LOCALES = ['en', 'es', 'fr', 'pt'];
export const HREFLANG = { en: 'en', es: 'es', fr: 'fr', pt: 'pt-BR' };

const D = '2026-11-05', N = '2026-11-11';
export const PAGES = [
  { id: 'home', app: null, type: 'home', published: D, modified: D, dataPage: 'home',
    llms: 'Studio home: the four apps and where to get each one.' },
  { id: 'pulse', app: 'pulse', type: 'app', published: D, modified: N, dataPage: 'pulse',
    llms: 'Android game with 5 modes: Exact Time, Hidden Clock, Interval, Reaction, Batak. No account, works offline. Includes a browser version of every mode, one page each.' },
  { id: 'cyberpunk-detective', app: 'cyberpunk-detective', type: 'app', published: D, modified: D, dataPage: 'cyberpunk-detective',
    llms: 'Free Android game on Google Play (ads, no in-app purchases, no account) mixing 3 detective cases you solve and 3 audio crime stories you listen to; cases work offline; game text in English, Spanish and French.' },
  { id: 'lull', app: 'lull', type: 'app', published: D, modified: D, dataPage: 'lull',
    llms: 'Coming-soon Android wellness app (not a medical device) with sleep sounds tuned to your pitch and a 15-second daily check-in for people with tinnitus. Not on Google Play yet; email sign-up.' },
  { id: 'reaction-test', app: 'pulse', type: 'test', published: D, modified: N, dataPage: 'pulse-reaction-test', card: ['reaction', 'm-reaction'],
    slug: { en: 'reaction-time-test', es: 'test-tiempo-de-reaccion', fr: 'test-temps-de-reaction', pt: 'teste-tempo-de-reacao' },
    llms: 'Browser reaction time test: tap when the lights go out; the result is in seconds (perfect up to 0.30 s, pass under 0.40 s).' },
  { id: '3s-challenge', app: 'pulse', type: 'challenge', published: D, modified: N, dataPage: 'pulse-3s-challenge', card: ['exact', 'm-exact'],
    slug: { en: '3-second-challenge', es: 'reto-3-segundos', fr: 'defi-3-secondes', pt: 'desafio-3-segundos' },
    llms: 'Browser game: stop a stopwatch at exactly 3.00 s (pass window ±0.10 s).' },
  { id: 'hidden-clock', app: 'pulse', type: 'test', mode: 'hidden', published: N, modified: N, dataPage: 'pulse-hidden-clock', card: ['hidden', 'm-hidden'],
    slug: { en: 'internal-clock-test', es: 'test-de-10-segundos', fr: 'test-des-10-secondes', pt: 'teste-de-10-segundos' },
    llms: 'Browser internal clock test (the 10 second challenge): the clock hides when you press Start, count 10 seconds in your head and stop at 10.00 s (pass window ±0.10 s). Hidden Clock mode of Pulse.' },
  { id: 'interval', app: 'pulse', type: 'test', mode: 'interval', published: N, modified: N, dataPage: 'pulse-interval-test', card: ['interval', 'm-interval'],
    slug: { en: 'time-estimation-test', es: 'test-de-percepcion-del-tiempo', fr: 'test-estimation-du-temps', pt: 'teste-de-percepcao-do-tempo' },
    llms: 'Browser time estimation test: two signals mark a hidden gap of 0.30 to 10 s, you guess it in seconds (pass window ±0.10 s). Interval mode of Pulse.' },
  { id: 'batak', app: 'pulse', type: 'test', mode: 'batak', published: N, modified: N, dataPage: 'pulse-batak-test', card: ['batak', 'm-batak'],
    slug: { en: 'choice-reaction-time-test', es: 'juego-de-reflejos-con-luces', fr: 'jeu-de-reflexes-avec-des-lumieres', pt: 'jogo-de-reflexo-com-luzes' },
    llms: 'Browser choice reaction time test: tap 8 lights on 7 pads in sequence (Perfect up to 3.20 s, pass up to 7.20 s). Batak is the name of this mode in Pulse, not the commercial lights wall.' },
  { id: 'age-guide', app: 'pulse', type: 'guide', published: D, modified: N, dataPage: 'pulse-age-guide', card: ['chart', 'm-reaction'],
    slug: { en: 'average-reaction-time-by-age', es: 'tiempo-de-reaccion-por-edad', fr: 'temps-de-reaction-par-age', pt: 'tempo-de-reacao-por-idade' },
    llms: 'Guide: average simple reaction time by age group, 18 to 65 (Woods et al. 2015, Table 2), what changes it, with sources.' },
  { id: 'best-apps', app: 'pulse', type: 'guide', published: '2026-11-06', modified: '2026-11-06', dataPage: 'pulse-best-apps', listing: true, card: ['list', 'accent'],
    slug: { en: 'best-reaction-time-apps', es: 'mejores-apps-de-reflejos', fr: 'meilleures-applis-temps-de-reaction', pt: 'melhores-apps-de-reflexo' },
    llms: 'Comparison: 5 reaction time apps for Android (Pulse, Reaction training, Reaction Time, Lumosity, Peak) on price, ads, modes, account and offline use, from their Google Play listings checked 2026-11-06. Gurrulabs makes Pulse.' },
];

// /en/, /en/pulse/, /en/pulse/reaction-time-test/
export const path = (loc, p) => `/${loc}/${p.app ? p.app + '/' : ''}${p.slug ? p.slug[loc] + '/' : ''}`;
export const url = (loc, p) => SITE + path(loc, p);
export const fileOf = (loc, p) => path(loc, p).slice(1) + 'index.html';
