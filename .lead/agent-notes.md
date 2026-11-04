# Agent notes — Gurrulabs Websites

Facts learned while working. One line each. Newest at the bottom. Trim via a "Refresh knowledge" ticket.

- Onboarding (2026-11-04): repo had only an empty initial commit and `.gitignore`; no remote, no hosting yet.
- Local tools: Node v25, Python 3.14, `npx` and `gh` available; `wrangler` (Cloudflare CLI) is NOT installed (use `npx wrangler`).
- `gh` is logged in as `undimonkey`, but Raffy Web's remote lives under the `gurrulabs-oss` GitHub account: confirm which account owns this repo before creating it.
- `python3 -m http.server <port>` from repo root serves the site (checked 2026-11-04, HTTP 200). Port 8123 may be taken by a stale Raffy Web server.
- Raffy Web's Mixpanel token is in `~/AndroidStudioProjects/raffy_webpage/script.js:131`, hostname gate at `:156`; copy that pattern, with prefix `Gurrulabs Web - `.
- Lull has no Android app yet (POC only); its Lead's wording rules forbid "cure"/"eliminate" tinnitus.
- Cloudflare Pages preview deploys get `<hash>.<project>.pages.dev` URLs: the Mixpanel gate must match the exact production host, not `*.pages.dev`.
- Related Leads can only be asked during ticket runs (`node <hub>/scripts/ask-lead.mjs <project-id> "<q>"`), not in chats.
- `.lead/attachments/`, `.lead/designs/`, `.lead/scratch/` are gitignored; mockups go in `.lead/designs/T-NNN/`.
