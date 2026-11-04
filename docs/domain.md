# Domain

## Purpose
Gurrulabs is Unai's one-person app studio (package prefix `com.gurrulabs.*`, contact gurrulabs@gmail.com).
This site is its acquisition hub: one URL that accumulates search traffic and trust across apps, instead of one
site per app. Each app page exists to send visitors to Google Play. It can also be the Play Console
"developer website".

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
  `referrer=utm_source=gurrulabs_web&utm_medium=web&utm_campaign=<page>&utm_content=<cta location>&utm_term=<locale>`.
  (PULSE-023 proposed `utm_source=pulse_web`; `gurrulabs_web` keeps one source for the whole site; confirm in T-002.)
- Web analytics: shared Mixpanel project "Gurru Labs websites" (EU host `https://api-eu.mixpanel.com`; public token
  in raffy_webpage `script.js:131`). Event prefix `Gurrulabs Web - ` so it never mixes with `Raffy Webpage - `.
  Track only when `location.hostname` is the production host (Raffy gates the same way, `script.js:156`).
- Search: Google Search Console (sitemap submitted once the site is live).

## Copy rules
- 4 locales: en, es, fr, pt (Brazilian Portuguese). Native, not literal translations.
- Reuse each app's store listing texts and screenshots (ask its Lead); never invent features.
- Lull: never "cure" or "eliminate" tinnitus; say "bother you less", "sleep better", "understand your patterns".
- Raffy and Lull touch health: educational tone, no medical promises.
