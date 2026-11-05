# Gurrulabs Websites

Studio website for Gurrulabs (Unai's app studio): a home page with one card per app and one page per app.
Single goal: bring people in from organic search (playable browser hooks, useful pages) and send them to each
app on Google Play. Stage (2026-11-05): hosting live (T-003); home + Pulse page built (T-002).
Launch apps: Pulse, Raffy (card links out to raffyparenting.com), Cyberpunk Detective, Lull (not on Play yet).

## Stack
- Hand-written static HTML/CSS/vanilla JS. No framework, no bundler, no npm dependencies; Node scripts
  (`.mjs`, `node:` built-ins only) only when a page set needs generating or validating.
- Hosting: Cloudflare Pages project `gurrulabs`, production https://gurrulabs.pages.dev, deployed from
  `gurrulabs-oss/gurrulabs_websites` on every push to `main` (setup and clicks: `docs/deploy.md`).
- Analytics: the shared "Gurru Labs websites" Mixpanel project (EU host), events prefixed `Gurrulabs Web - `,
  tracking only on the production hostname. Installs measured via Play UTM referrer; search via Search Console.
- Locales: en, es, fr, pt (pt = Brazilian), with hreflang.

## Commands
- Build: `sh build.sh` copies the site (everything except dot-folders, `docs/`, `CLAUDE.md`, `README.md`) into
  `dist/`, which Cloudflare publishes. Agent files must never go live; add new internal files to its exclude list.
- Generate pages: `node scripts/build.mjs` (all copy lives there; never hand-edit the generated `xx/**/index.html`,
  root `index.html`, `sitemap.xml`, `robots.txt`). Validate: `node scripts/validate.mjs` (must print `validate: OK`).
- Run locally: `python3 -m http.server 8000` from repo root, open `http://localhost:8000/`.

## Layout
One folder per locale with one subfolder per app (`/en/`, `/en/pulse/`), shared `assets/`, `styles.css`, `script.js`
(Play referrer, gated Mixpanel, Pulse browser tests), `sitemap.xml`, `robots.txt`; generator/validator in `scripts/`.
- `docs/` — domain and decisions (index: `docs/README.md`).
- `.lead/` — Lead instructions, notes, tickets (hub board state), designs, attachments.

## Rules
- Every page ships in all 4 locales in the same ticket; natural native copy per locale.
- Every app page pushes to its Play listing; every Play link carries the UTM referrer (see `docs/domain.md`).
- Analytics stay real: no Mixpanel on localhost, `file://` or Cloudflare preview URLs (`<hash>.<project>.pages.dev`);
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
  Deploys go through the hub: Unai presses **Merge and deploy**, the hub pushes `main`, waits for Cloudflare and
  checks the pages, rolling back on failure (`docs/deploy.md`). Set `qa: yes/no` as the run prompt asks.

## Agent infra
- Agents: `worker` (implements one subtask), `reviewer` (reviews branch diff). Skills: `verify`, `ticket`.
- Lead instructions: `.lead/LEAD.md`; learned gotchas: `.lead/agent-notes.md`.
- Raffy Web (`~/AndroidStudioProjects/raffy_webpage`) is the reference site: same stack, SEO scripts, CTA and
  Play-referrer patterns. Reuse its approach before inventing one.

## More context (read only when relevant)
See `docs/README.md` for the index. Do not read docs speculatively.
