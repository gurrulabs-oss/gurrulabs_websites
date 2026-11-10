# Gurrulabs Websites

Studio website for Gurrulabs (Unai's app studio): a home page with one card per app and one page per app.
Single goal: bring people in from organic search (playable browser hooks, useful pages) and send them to each
app on Google Play. Stage (2026-11-05): hosting live (T-003); home + Pulse page built (T-002).
Launch apps: Pulse, Raffy (card links out to raffyparenting.com), Cyberpunk Detective, Lull (not on Play yet).

## Stack
- Hand-written static HTML/CSS/vanilla JS. No framework, no bundler, no npm dependencies; Node scripts
  (`.mjs`, `node:` built-ins only) only when a page set needs generating or validating.
- Hosting: GitHub Pages (like Raffy Web), production https://www.gurrulabs.com (domain at IONOS), published from
  the root of `main` of `gurrulabs-oss/gurrulabs_websites` on every push (`docs/deploy.md`). `_config.yml` keeps
  internal files off the site: add any new top-level internal file to its `exclude:` list.
- Analytics: the shared "Gurru Labs websites" Mixpanel project (EU host), events prefixed `Gurrulabs Web - `,
  tracking only on the production hostname. Installs measured via Play UTM referrer; search via Search Console.
- Locales: en, es, fr, pt (pt = Brazilian), with hreflang.

## Commands
- Build: none. GitHub Pages publishes the repo root; agent files must never go live, so every new top-level
  internal file goes in `_config.yml` `exclude:` (dot-folders are never published).
- Generate pages: `node scripts/build.mjs` (all copy lives there; never hand-edit the generated `xx/**/index.html`,
  root `index.html`, `sitemap.xml`, `robots.txt`, `llms.txt`). Validate: `node scripts/validate.mjs` (must print `validate: OK`).
- Run locally: `python3 -m http.server 8000` from repo root, open `http://localhost:8000/`.

## Layout
One folder per locale with one subfolder per app (`/en/`, `/en/pulse/`), shared `assets/`, `styles.css`, `script.js`
(Play referrer, gated Mixpanel, Pulse browser tests), generated `sitemap.xml`, `robots.txt`, `llms.txt`, IndexNow key
`<key>.txt` (`.github/workflows/indexnow.yml` pings IndexNow after each deploy); generator/validator in `scripts/`.
- `docs/` — domain and decisions (index: `docs/README.md`).
- `.lead/` — Lead instructions, notes, tickets (hub board state), designs, attachments.

## Rules
- Every page ships in all 4 locales in the same ticket; natural native copy per locale.
- SEO: every new or changed page follows `docs/seo-strategy.md` (own keyword, real checked sources, visible date),
  is regenerated with `node scripts/build.mjs` (pages, sitemap, llms.txt, robots, JSON-LD from `scripts/pages.mjs`)
  and passes `node scripts/validate.mjs`; a ticket that touches pages is not done without it.
- Every app page pushes to its Play listing; every Play link carries the UTM referrer (see `docs/domain.md`).
- Every page is tracked: `<body data-page="<slug>" data-locale="<locale>">` and loads `/script.js`, which fires the view
  event `Gurrulabs Web - <Page>`; every Play link has `data-cta` and `data-app`. Naming: `docs/domain.md` Measurement;
  `scripts/validate.mjs` fails an untracked page.
- Analytics stay real: no Mixpanel on localhost, `file://` or any host other than `www.gurrulabs.com`;
  gate on the exact production hostname in code. Never fire test events at the shared project.
- App facts (store texts, screenshots, colours, package ids, claims allowed) come from that app's Lead or repo,
  never invented. In tickets you can ask related Leads (pulse, raffy-app, raffy-web, cyberpunk-detective, lull, ...).
- Lull: never "cure"/"eliminate" tinnitus wording; it is not on Play yet (no install CTA until it is).
- Health/medical claims for any app: educational, no promises.
- Never touch: other projects' repos (read only, or ask their Lead), secrets/tokens other than the public
  Mixpanel token, `.lead/tickets/T-*.md` in commits.
- Personal project: code lives only under the `gurrulabs-oss` GitHub account. Never push to or create repos
  under `undimonkey`, MonkeyTaps or any work account (the `gh` login on this Mac is `undimonkey`).
- Never push, never commit to `main`: a push to `main` deploys to production. Work on the branch you were given.
  Deploys go through the hub: Unai presses **Merge and deploy**, the hub pushes `main`, waits for the GitHub Pages
  build and checks the pages, rolling back on failure (`docs/deploy.md`). Set `qa: yes/no` as the run prompt asks.

## Agent infra
- Agents: `worker` (implements one subtask), `reviewer` (reviews branch diff). Skills: `verify`, `ticket`.
- Lead instructions: `.lead/LEAD.md`; learned gotchas: `.lead/agent-notes.md`.
- Raffy Web (`~/AndroidStudioProjects/raffy_webpage`) is the reference site: same stack, SEO scripts, CTA and
  Play-referrer patterns. Reuse its approach before inventing one.

## More context (read only when relevant)
See `docs/README.md` for the index. Do not read docs speculatively.
