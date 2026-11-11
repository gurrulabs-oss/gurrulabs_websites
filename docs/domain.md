# Domain

## Purpose
Gurrulabs is Unai's one-person app studio (package prefix `com.gurrulabs.*`, contact gurrulabs@gmail.com).
This site is its acquisition hub: one URL that accumulates search traffic and trust across apps, instead of one
site per app. Each app page exists to send visitors to Google Play. It can also be the Play Console
"developer website".

## Production URL
https://www.gurrulabs.com (GitHub Pages; `gurrulabs.com` redirects to `www`). Setup: `deploy.md`.

## Apps at launch (decided 2026-11-04)
| App | Package | State | Hub project / repo | Site role |
|---|---|---|---|---|
| Pulse | `com.gurrulabs.pulse` | live on Play | `pulse` · `~/AndroidStudioProjects/TimeMaster` | first full page (`/pulse`), browser mini-tests as hook |
| Raffy | `com.gurrulabs.raffy` | live on Play | `raffy-app`, `raffy-web` | card linking to raffyparenting.com (its own SEO site) |
| Cyberpunk Detective | `com.gurrulabs.miniaicrimes` | live on Play | `cyberpunk-detective` · `~/AndroidStudioProjects/miniaicrimes` | card + page |
| Lull | `com.gurrulabs.lull` (planned) | not on Play: POC only | `lull` · `~/Desktop/Personal/lull` | card "coming soon", no install CTA |

Not on the site: Lumen (personal TV launcher), El Feed, RadarMotor (newsletter), SantaFe, Precios.
Play URL: `https://play.google.com/store/apps/details?id=<package>`.

## Measurement
- Installs: Play links carry an install referrer so Play Console > Acquisition shows web installs. Follow Raffy
  Web's pattern (`script.js` `withPlayReferrer`, adds the referrer at runtime, HTML hrefs stay clean):
  `referrer=utm_source=gurrulabs_web&utm_medium=web&utm_campaign=<page>&utm_content=<cta location>&utm_term=<locale>`,
  plus `src_utm_*` = the visit's own `utm_*` when its URL has them (as Raffy Web).
- Web analytics: shared Mixpanel project "Gurru Labs websites" (EU host `https://api-eu.mixpanel.com`; public token
  in raffy_webpage `script.js:131`). Event prefix `Gurrulabs Web - ` so it never mixes with `Raffy Webpage - `.
  Track only when `location.hostname` is the production host (Raffy gates the same way, `script.js:156`).
- Events (all fired by the shared `script.js`; this list is the naming source of truth). Every event also carries Raffy Web's
  acquisition props: `utm_source|medium|campaign|term|content` from the page URL (`''` when absent), `ai_referral`
  (bool), `ai_referrer_source` (`chatgpt|perplexity|gemini|copilot|claude|other|unknown`, from `document.referrer`).
  - View: `Gurrulabs Web - <Page>`, props `locale`, `path`, `referrer`. `<Page>` comes from the page slug in `<body data-page="<slug>">`:
    words split on `-`, capitalised, joined by a space (`home` → `Home`, `pulse` → `Pulse`,
    `cyberpunk-detective` → `Cyberpunk Detective`). Slug = the page's `dataPage` in `scripts/pages.mjs` (stable English id, e.g. `pulse-reaction-test`,
    even though URLs are translated), `home` for the locale root.
  - `Gurrulabs Web - Download Button Clicked` on any Play link, props `app` (`data-app`), `cta` (`data-cta`),
    `locale`, `page` (slug), `result` (only on test result links, `"<verdict> <score>"`).
  - `Gurrulabs Web - Signup Clicked` on a `mailto:` link with `data-cta` (Lull "email me when it launches"), props `app`, `cta`
    (`lull_signup`, `lull_signup_band`), `locale`, `page`. The href is never changed.
  - `Gurrulabs Web - Internal Link Clicked` on a link to this site (Play links excluded), props `page`, `locale`, `to`
    (target page id from the `<script id="pages">` path → id map that `build.mjs` puts in every head; same-page `#` links =
    `page`; unmapped path = `unknown`), `zone` (`header|breadcrumb|footer|game`, else the enclosing `<section>`'s id or
    first class, e.g. `p-hero`, `blk`, `guides`, or `body`).
  - `Gurrulabs Web - Source Clicked` on an http(s) link inside `.sources`, props `page`, `locale`, `domain` (hostname).
  - `Gurrulabs Web - Language Changed` on a switcher link to another locale, props `from`, `to` (`en|es|fr|pt`), `page`.
  - `Gurrulabs Web - Game Started` on Start, props `mode` (`exact|reaction|hidden|batak|interval`), `page`, `locale`. "Try again" starts a new game.
  - `Gurrulabs Web - Game Finished` when a game ends, same props + `result` (`"<perfect|pass|miss> <score>"`, score in
    seconds or `false_start`; same string as the Play link's `result`). Abandoned = started − finished.
- Event names, prop names and values are English and never localized: pages by id (never the translated URL), locale as
  code, modes/results/zones as English keys, never visible text. Only Mixpanel's automatic `$current_url` is the real URL.
- A new page declares only `<body data-page="<slug>" data-locale="<locale>">`, loads `/script.js` and gives every
  Play link `data-cta` + `data-app`; `scripts/validate.mjs` fails it otherwise. `utm_campaign` = the same slug.
- Search: Google Search Console, URL-prefix property `https://www.gurrulabs.com/` verified by `google48eac797f8133411.html`
  at the repo root (never delete it); sitemap submitted once `sitemap.xml` is live.

## Copy rules
- 4 locales: en, es, fr, pt (Brazilian Portuguese). Native, not literal translations.
- Reuse each app's store listing texts and screenshots (ask its Lead); never invent features.
- Lull: never "cure" or "eliminate" tinnitus; say "bother you less", "sleep better", "understand your patterns".
- Raffy and Lull touch health: educational tone, no medical promises.
