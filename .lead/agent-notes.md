# Agent notes — Gurrulabs Websites

Facts learned while working. One line each. Newest at the bottom. Trim via a "Refresh knowledge" ticket.

- Onboarding (2026-11-04): repo had only an empty initial commit and `.gitignore`; no remote, no hosting yet.
- Local tools: Node v25, Python 3.14, `npx` and `gh` available; `wrangler` (Cloudflare CLI) is NOT installed (use `npx wrangler`).
- `gh` is logged in as `undimonkey` (MonkeyTaps/work side). This repo belongs to `gurrulabs-oss` (owner, 2026-11-04): never create repos or push with `undimonkey`; Done like Raffy Web: `origin` = `https://gurrulabs-oss@github.com/gurrulabs-oss/gurrulabs_websites` (set 2026-11-04, repo not created yet); the username in the URL makes git use the `gurrulabs-oss` token already in the macOS keychain, for this repo only. For `gh` commands use `GH_TOKEN=<that token>` per command; never `gh auth switch`/`login` (changes every project).
- `python3 -m http.server <port>` from repo root serves the site (checked 2026-11-04, HTTP 200). Port 8123 may be taken by a stale Raffy Web server.
- Raffy Web's Mixpanel token is in `~/AndroidStudioProjects/raffy_webpage/script.js:131`, hostname gate at `:156`; copy that pattern, with prefix `Gurrulabs Web - `.
- Lull has no Android app yet (POC only); its Lead's wording rules forbid "cure"/"eliminate" tinnitus.
- Cloudflare Pages preview deploys get `<hash>.<project>.pages.dev` URLs: the Mixpanel gate must match the exact production host, not `*.pages.dev`.
- Related Leads can only be asked during ticket runs (`node <hub>/scripts/ask-lead.mjs <project-id> "<q>"`), not in chats.
- `.lead/attachments/`, `.lead/designs/`, `.lead/scratch/` are gitignored; mockups go in `.lead/designs/T-NNN/`.
- Headless runs can Read other repos (incl. images) but `cp` from them, `node --check` and headless Chrome need approval (blocked); copy real assets at execution or ask the owner.
- Pulse look/rules: TimeMaster `docs/design-system.md`, `docs/tone-of-voice.md`, mockups `.lead/designs/T-007/` (d5 Exact, d8 Reaction, shared/pulse.css); Outfit font at `.lead/designs/T-019/img/outfit.ttf`; icon `app/src/main/res/drawable/new_app_logo.png`; old Play shots `.lead/attachments/T-019/before-0N.png`.
- Headless runs: `gh repo create --public` (even with the gurrulabs-oss GH_TOKEN) is denied by the auto-mode classifier ("Create Public Surface"); the owner creates repos, or must explicitly allow it.
- Production is https://gurrulabs.pages.dev (Cloudflare Pages, Git integration on `main`); before the first merge it returns 404 (repo `main` had no index.html, 2026-11-05).
- Search Console verification file `google48eac797f8133411.html` lives at repo root: never delete or rename it.
- Deploy (2026-11-05): hub `deploy` block `cloudflare-pages`; Merge and deploy pushes, waits for the "Cloudflare Pages" check run, smoke-checks, auto-rolls back. Details `docs/deploy.md`.
- Cloudflare publishes `dist/` from `build.sh` (not the repo root). A new top-level internal file/folder must be added to `build.sh`'s exclude list or it goes live; check with `curl -s -o /dev/null -w '%{http_code}' https://gurrulabs.pages.dev/<path>` → 404.
- `404.html` gives real 404s; without it every path is 200 with the home page. `/foo.html` 308s to `/foo`. Verify pages by status code, not just "it loads".
- T-002 (2026-11-05): `cp` from other repos, `curl` downloads and headless Chrome all worked in an execute run; screenshots/interaction via CDP (`--remote-debugging-port`, Node's global WebSocket) on localhost.
- Pages are generated: edit copy in `scripts/build.mjs`, rerun it, then `node scripts/validate.mjs`. Output must stay byte-identical on rerun.
- Grid children with fixed width (e.g. the 384px `.game`) need `minmax(0, 1fr)` columns or they overflow at 390 px.
- Google Play badges: `https://play.google.com/intl/en_us/badges/static/images/badges/<en|es|fr|pt-br>_badge_web_generic.png` (646x250, padding); crop `sips -c 198 594` keeps the rounded border.
- In execute runs the hub installs `.lead/pending-claude/` into the worktree's `.claude/` without committing (runner.mjs installPendingClaude).
- T-002 (2026-11-05): ticket showed Done/"Merged into main" but `main` was never pushed (origin/main 4 behind), so nothing deployed. After any merge, check `git log origin/main..main` is empty and the changed pages load on gurrulabs.pages.dev; if not, tell Unai.
- Design runs (2026-11-05, T-008): `node <script>`, `sed`/`cd && …` chains and `cp -R` need approval; plain `cp a b dir/` and `mkdir -p` work. Build mockups by `cp` of real files + Edit/Write.
- T-006: view event name derives from `<body data-page>` slug in `script.js`; `scripts/validate.mjs` checks only pages in its `PAGES` array — add new pages there.
- T-008 (2026-11-05): headless Chrome + CDP worked again; quick game test = click [data-a=start], wait, click [data-a=stop], read #game innerText.
- Design runs (2026-11-05, T-007): headless Chrome `--screenshot` of `file://` mockups works without approval; starting `python3 -m http.server` (background) needs approval, so real-page Before shots (absolute `/assets/` paths) wait for execution. Chrome headless renders ≥~500 px wide: check 390 px via the mockup iframes, not `--window-size=390`.
- T-007 rule: any new/changed page follows `docs/seo-strategy.md`, regenerates via `node scripts/build.mjs`, has real checked sources, and passes `node scripts/validate.mjs`; otherwise the ticket is not done.
- T-007: page list lives only in `scripts/pages.mjs` (build + validate import it); copy/sources in `build.mjs` `CONTENT`. URLs are translated slugs; `data-page` is the stable English id.
- T-007: game panel `<div class="game" id="game" data-mode="react|exact" data-solo>` starts in that mode with no tabs.
- T-007 sources: doi.org/Wiley/APA/ScienceDirect return 403 to plain curl (200 with a browser User-Agent); PubMed returns 203; World Athletics rules PDF 404s on HEAD but 200 on GET. Check sources with GET + browser UA. Verified figures: `.lead/attachments/T-007/sources.md` in the main project folder.
- IndexNow key file `4b17cdc9ad4f7fc753c24b7ffb7504fe.txt` at root: never delete/rename (Bing/Yandex verify it).
