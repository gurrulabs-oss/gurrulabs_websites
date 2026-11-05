# SEO and AI-visibility strategy

Read before adding or changing any page. Goal: every page is found by Google and quoted by AI assistants
(ChatGPT, Gemini, Claude, Perplexity, Copilot), then sends the visitor to Google Play. Model: Raffy Web
(`~/AndroidStudioProjects/raffy_webpage/docs/ai-visibility.md`): useful pages per search intent, deep content with
sources and visible dates, structured data, llms.txt + IndexNow. Decided in T-007 (2026-11-05).

## Rules for every page (the validator enforces the starred ones)
- **One entry point per page**: each page owns one main keyword plus its own secondary searches; no page reuses
  another page's main keyword (Google should never choose between two of our pages). Add the page to the map below.
- **Palette per app**: a content page uses its app's design palette (Pulse: dark Pulse look; Cyberpunk Detective
  and Lull: their own). The home stays the studio look.
- **Direct answer under each heading**: the first sentence after every H2 answers the heading's question.
- \* **Figures next to their source**: every number carries an inline citation to a real, checked source. A figure
  the source does not state as-is is dropped, not softened. Never invent a source.
- \* **Content pages** (test, guide, challenge, comparison): visible "Sources" section with ≥ 3 outbound links,
  visible published/updated date (`<time datetime>`), same dates in JSON-LD, ≥ 3 internal links, link to the app page.
- \* **Static HTML**: all text, tables, FAQ, sources and links are in the HTML; only games need JavaScript.
- \* **Unique `title` and meta description** per page and locale; title ≤ ~60 chars, description ≤ ~155.
- \* **All 4 locales** (en, es, fr, pt-BR), translated slugs, reciprocal hreflang + x-default (en).
- \* **JSON-LD matches what is visible**: Organization (home), MobileApplication (app page), WebApplication
  (playable test), Article with `citation` (guide), BreadcrumbList (every non-home page).
- Health topics (Raffy, Lull, reaction-time norms): educational tone, "not a diagnosis" note, no promises.
  Lull: never "cure"/"eliminate" tinnitus.
- Copy facts about an app only from its Lead or repo (`domain.md`).

## How the discovery files are produced (never edit by hand)
- One page registry: `scripts/pages.mjs` (id, app, type, translated slugs, `published`/`modified`, `dataPage`,
  llms one-liner). Copy and sources live in `scripts/build.mjs` (`CONTENT`).
- `node scripts/build.mjs` writes every page plus `sitemap.xml` (per-page `lastmod` = `modified`, hreflang
  alternates), `robots.txt` (all search and AI bots explicitly allowed, incl. training bots, decided Q3),
  `llms.txt` (llmstxt.org format, facts only, never "recommend X" instructions) and JSON-LD.
- Bump a page's `modified` only when its text changes; that keeps sitemap dates honest and stable between runs.
- IndexNow: key file `<key>.txt` at the root; `.github/workflows/indexnow.yml` waits for the "Cloudflare Pages"
  check after each push to `main`, then `scripts/indexnow.mjs --changed <previous sha>` submits only the pages whose
  HTML changed. Dry run: `node scripts/indexnow.mjs --dry-run`.
- `node scripts/validate.mjs` must print `validate: OK`; it fails on a missing locale, broken hreflang, a page
  missing from sitemap/llms.txt (or a stale entry), duplicate titles, bad JSON-LD, missing sources/date, broken
  internal links, missing bots in robots.txt. A page ticket is not done until it passes.

## Keyword map (one entry point per page)
| Page | Main keyword (en / es / fr / pt) | Secondary | Intent | Does not compete with |
|---|---|---|---|---|
| Pulse app | Pulse app / app Pulse / appli Pulse / app Pulse; "reflex app Android" | timing game, reaction time app Android | wants an app | no "test" or "challenge": those go to the playable pages |
| Reaction test | reaction time test / test de tiempo de reacción / test de temps de réaction / teste de tempo de reação | online reflex test, measure reaction time | wants to play now | no "by age"/"average": that is the guide |
| Age guide | average reaction time by age / tiempo de reacción medio por edad / temps de réaction moyen par âge / tempo de reação médio por idade | normal reaction time, what is a good reaction time | wants to know / compare | no game; links to the test instead |
| 3 s challenge | 3 second challenge / reto de los 3 segundos / défi des 3 secondes / desafio dos 3 segundos | stop the stopwatch at 3 seconds, count seconds without looking | wants a challenge | time sense, not reflexes: no keywords shared with the test |

## Clusters per app (next batches, by priority)
| # | App | Cluster | Page type | Priority | Ticket |
|---|---|---|---|---|---|
| 1 | Pulse | reaction & timing tests (batch 1: test, age guide, 3 s challenge) | playable test, guide | done | GWEB-007 |
| 2 | Pulse | more playable tests: aim/lights wall (Batak), rhythm/interval tapping, "count seconds in your head" | playable test + short guide | high | GWEB-009 |
| 3 | Pulse | "best reaction time / reflex app for Android" | comparison ("best app") with honest criteria | medium | GWEB-010 |
| 4 | Cyberpunk Detective | detective / mystery puzzle games, "solve a case" playable hook | playable mini case, comparison | medium (needs the app page, GWEB-004) | GWEB-011 |
| 5 | Lull | tinnitus and sleep: educational guides (sounds for sleep, habits) | guide with sources | low (not on Play; no install CTA) | GWEB-012 |
| - | Raffy | none here: Raffy's SEO lives on raffyparenting.com; this site only links out | - | - | - |

## AI-presence baseline (run monthly)
Fresh logged-out session per assistant, web search on, no memory. Paste the prompt verbatim; record `Y/N`
mentioned and the cited gurrulabs.pages.dev or Play URL (or `-`). Put the run date above the table.

| # | Prompt | ChatGPT | Gemini | Claude | Perplexity | Copilot |
|---|---|---|---|---|---|---|
| en1 | reaction time test online | | | | | |
| en2 | what is the average reaction time by age | | | | | |
| en3 | 3 second stopwatch challenge | | | | | |
| en4 | best reflex game app for android | | | | | |
| es1 | test de tiempo de reacción | | | | | |
| es2 | tiempo de reacción medio por edad | | | | | |
| es3 | reto de los 3 segundos cronómetro | | | | | |
| fr1 | test de temps de réaction | | | | | |
| pt1 | teste de tempo de reação | | | | | |

## Manual steps (owner, once)
Google Search Console: submit `https://gurrulabs.pages.dev/sitemap.xml`. Bing Webmaster Tools: import the site
from Search Console (covers Copilot). After the first deploy, check the IndexNow GitHub Actions run succeeded.
