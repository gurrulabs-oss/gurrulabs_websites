# Agent notes — Gurrulabs Websites

Facts learned while working. One line each. Newest at the bottom. Trim via a "Refresh knowledge" ticket.

## Git, hosting, deploy
- `gh` is logged in as `undimonkey` (MonkeyTaps/work side). This repo belongs to `gurrulabs-oss` (owner, 2026-11-04): never create repos or push with `undimonkey`. `origin` = `https://gurrulabs-oss@github.com/gurrulabs-oss/gurrulabs_websites`; the username in the URL makes git use the `gurrulabs-oss` token in the macOS keychain, for this repo only. For `gh` commands use `GH_TOKEN=<that token>` per command; never `gh auth switch`/`login` (changes every project).
- Headless runs: `gh repo create --public` (even with the gurrulabs-oss token) is denied by the auto-mode classifier; the owner creates repos or must explicitly allow it.
- Production is https://www.gurrulabs.com (GitHub Pages from the root of `main`, since 2026-11-10; was Cloudflare `gurrulabs.pages.dev`). Deploy: hub `deploy` block `github-pages`; Merge and deploy pushes, waits for the Pages build, smoke-checks, auto-rolls back. Details `docs/deploy.md`.
- After any merge check `git log origin/main..main` is empty and the changed pages load on www.gurrulabs.com (a ticket once showed "Merged into main" with `main` never pushed); if not, tell Unai.
- GitHub Pages publishes the repo root minus dot-folders and `_config.yml`'s `exclude:`. A new top-level internal file/folder must be added there or it goes live; check `curl -s -o /dev/null -w '%{http_code}' https://www.gurrulabs.com/<path>` → 404.
- `404.html` gives real 404s; without it every path is 200 with the home page. `/foo` and `/foo.html` both serve `foo.html`; link without `.html`. Verify pages by status code, not just "it loads".
- Never delete or rename root verification files: `google48eac797f8133411.html` (Search Console) and `4b17cdc9ad4f7fc753c24b7ffb7504fe.txt` (IndexNow key; Bing/Yandex).
- The Mixpanel gate matches the exact production host `www.gurrulabs.com` (see `script.js`); no previews exist on GitHub Pages.

## Build and content rules
- Pages are generated: edit copy in `scripts/build.mjs` (`CONTENT`, `APP` via `appPage()`), rerun it, then `node scripts/validate.mjs`. Output must stay byte-identical on rerun.
- Rule: any new/changed page follows `docs/seo-strategy.md`, regenerates via `node scripts/build.mjs`, has real checked sources, and passes `node scripts/validate.mjs`; otherwise the ticket is not done.
- Page list lives only in `scripts/pages.mjs` (build + validate import it). URLs are translated slugs; `data-page` (the page's `dataPage`) is the stable English id and gives the view event name in `script.js`.
- Game panel `<div class="game" id="game" data-mode="react|exact|hidden|batak|interval" data-solo>` (JS builds it); its UI strings live in `build.mjs` `T` tables → `#i18n` JSON, not script.js. Batak pads react to `pointerdown`, not click (CDP tests).
- Grid children with fixed width (e.g. the 384px `.game`) need `minmax(0, 1fr)` columns or they overflow at 390 px.
- `script.js` `PLAY_SEL` skips `.sources a`; any Play link outside `.sources` gets UTM + click event. Validator bans free/no ads/F1 (Pulse wording); pages with `listing: true` only ban cure/eliminate/F1.
- Lull: no Android app yet (POC only); its Lead's wording rules forbid "cure"/"eliminate" tinnitus. `LULL_BANNED` in `validate.mjs` misses cause/therapy phrasing: review by hand. Sign-up mailto clicks fire `Gurrulabs Web - Signup Clicked`.
- Mixpanel: event prefix `Gurrulabs Web - `, persistence localStorage; raffyparenting.com links get `gl_mp_id` at click.

## Sources and assets
- Source checks: doi.org/Wiley/APA/ScienceDirect return 403 to plain curl (200 with browser UA); JAMA/Cochrane via doi.org 403 even with UA, so verify through PubMed abstracts: `efetch.fcgi?db=pubmed&id=<pmid>&rettype=abstract&retmode=text` (200). PubMed web returns 203; World Athletics rules PDF 404s on HEAD but 200 on GET (use GET + UA). Verified figures: `.lead/attachments/T-007/sources.md` in the main project folder. World Athletics TR 16.6 (0.100 s) confirmed, 2026 PDF p.108 (render PDF pages with a PDFKit swift script; no poppler).
- Google Play badges: `https://play.google.com/intl/en_us/badges/static/images/badges/<en|es|fr|pt-br>_badge_web_generic.png` (646x250, padding); crop `sips -c 198 594` keeps the rounded border.
- Play listings: details/search pages are fetchable with `curl -sL -A "<desktop Chrome UA>" ...&hl=en_US&gl=US` (200, all hl=). Description in `data-g-id="description"`, screenshots `<img alt="Screenshot image" src="https://play-lh.googleusercontent.com/<id>=...">` (download with `=w1080`). Pulse's live listing differs from the repo listing (live: "Contains ads", 4 modes, no account/offline text).
- Pulse look/rules: `~/AndroidStudioProjects/TimeMaster` `docs/design-system.md`, `docs/tone-of-voice.md`, mockups `.lead/designs/T-007/` (d5 Exact, d8 Reaction, shared/pulse.css); Outfit font `.lead/designs/T-019/img/outfit.ttf`; icon `app/src/main/res/drawable/new_app_logo.png`; old Play shots `.lead/attachments/T-019/before-0N.png`.
- Cyberpunk Detective: case art `~/AndroidStudioProjects/miniaicrimes/app/src/main/res/drawable/` (selene_1 is .jpeg), font `res/font/orbitron_bold.ttf`; no Play shots/listing text in repo.
- Lull (`~/Desktop/Personal/lull`): fonts `app/src/main/res/font/`, latest dark shots `.lead/attachments/T-015/*-after-dark.png`; `T-011/icon-after.png` is a sheet of variants, not an icon.

## Environment and runs
- Local tools: Node v25, Python 3.14, `npx`, `gh`; `wrangler` is NOT installed (use `npx wrangler`).
- `python3 -m http.server <port>` from repo root serves the site. Port 8123 may be taken by a stale Raffy Web server.
- `.lead/attachments/`, `.lead/designs/`, `.lead/scratch/` are gitignored; mockups go in `.lead/designs/T-NNN/`. In worktrees `.lead/scratch` is a symlink to the MAIN project folder (relative paths read main, writes are outside allowed dirs): put scratch files in `/tmp/<ticket>/`.
- Related Leads can only be asked during ticket runs: `node <hub>/scripts/ask-lead.mjs <project-id> "<q>"`, one question at a time per ticket ("already waiting for another Lead"), run sequentially.
- Execute runs: the hub installs `.lead/pending-claude/` into the worktree's `.claude/` without committing. `cp` from other repos, `curl` downloads and headless Chrome worked in execute runs (once `node --check`/Chrome were blocked, so copy real assets at execution or ask the owner).
- Design runs: `node <script>`, `sed`, `cd && …` chains and `cp -R` need approval; plain `cp a b dir/` and `mkdir -p` work; background `python3 -m http.server`, WebSearch, WebFetch of Play and `cp` from other repos need approval/denied. Build mockups by `cp` of real files + Edit/Write; reference app art via absolute `file:///` paths (fonts too); real-page Before shots wait for execution or serve main from the project folder on a 2nd port.
- Headless Chrome: `--headless --virtual-time-budget=3000` (`--headless=new` hung); `file://` screenshot works as a single command (no chained ls); renders ≥~500 px wide, so check 390 px with a file:// HTML wrapping `<iframe style="width:390px;height:3600px">` pointing at localhost, screenshot at `--window-size=390,3600`. Element shots/interaction via CDP (`--remote-debugging-port`, Node's global WebSocket; poll /json, port answers after ~2-5 s): `setDeviceMetricsOverride` 390 mobile, scrollIntoView, `captureScreenshot` clip. Quick game test: click `[data-a=start]`, wait, click `[data-a=stop]`, read `#game` innerText.
- Mixpanel check without network: CDP `Fetch.requestPaused` serving a script.js copy with `let tracking = true` + `addScriptToEvaluateOnNewDocument` setting `window.mixpanel={__SV:1,track:...}` (`__SV` skips the CDN bootstrap) and a window click preventDefault; or a vm self-check with stubbed `window.mixpanel`.
- Image cutting without ImageMagick: swift CoreGraphics + `cwebp`; ICO = PNGs wrapped by a few lines of Node. `sips -c` crops centred, so for header shots use a short `--window-size` height instead.
- WebSearch returns result lists only (no autocomplete/PAA/volumes); keyword picks are from result titles. FR pages address the reader with "tu".
- IndexNow: Bing (and api.indexnow.org) answers 403 `UserForbiddedToAccessSite` for www.gurrulabs.com although the key file is live; Yandex returns 202, so `scripts/indexnow.mjs` posts to yandex.com (C-64, 2026-11-11). Pages deploys were never affected.
