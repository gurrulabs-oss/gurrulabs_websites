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
