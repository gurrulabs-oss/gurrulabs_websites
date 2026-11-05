# Deploy (Cloudflare Pages)

Production: https://gurrulabs.pages.dev (Cloudflare Pages project `gurrulabs`, GitHub repo
`gurrulabs-oss/gurrulabs_websites`). Set up in T-003 (2026-11-04/05). Cost $0.

## How it works
- **Merge to `main` = production.** Cloudflare rebuilds on every push to `main` (no build step; it serves the repo root).
- Any other pushed branch gets a preview at `https://<hash>.gurrulabs.pages.dev` (and `<branch>.gurrulabs.pages.dev`).
  Previews never track: the Mixpanel gate matches the exact host `gurrulabs.pages.dev`.
- Lead runs never push; only Unai merges/pushes `main`.

## Clicks for a new site (what was actually done for this one)
1. **GitHub repo** under `gurrulabs-oss` (never `undimonkey`/work accounts): github.com → New repository → public,
   **empty** (no README/licence, or the remote gets a separate history). Headless agents can't create public repos.
2. Locally: `git remote add origin https://gurrulabs-oss@github.com/gurrulabs-oss/<repo>` (the username makes git use
   the `gurrulabs-oss` keychain token), then push `main`. Do this **before** Cloudflare: its "Production branch"
   dropdown stays empty until the repo has a branch.
3. **Cloudflare**: dash.cloudflare.com → Workers & Pages → Create. Cloudflare's default flow creates a **Worker**
   (URL `<name>.<account>.workers.dev`, needs a `wrangler` config) — not what we want. Scroll to the bottom:
   "Looking to deploy Pages? Get started" → Import an existing Git repository → install/authorise the GitHub app on
   `gurrulabs-oss`, this repo only → project name (becomes `<name>.pages.dev`) → framework preset None, build
   command `sh build.sh`, output directory `dist` (never `/`: it publishes CLAUDE.md, docs/ and .lead/) → production branch `main` → Save and Deploy. (A Worker created by mistake:
   delete it under Workers & Pages → the Worker → Settings → Delete.)
4. Check: `curl -sI https://<name>.pages.dev/` → `HTTP/2 200` once `main` has an `index.html`.
5. **Search Console** (Unai's personal Gurrulabs Google account, the Play developer one): search.google.com/search-console
   → Add property → **URL prefix** `https://<name>.pages.dev/` (no own domain, so no DNS option) → HTML file
   method → download `google<id>.html` → commit it unchanged to the repo root → after it's live on `main`, click
   Verify. Keep the file forever (removing it un-verifies).
6. Once `sitemap.xml` is live: Search Console → Sitemaps → submit `sitemap.xml`.
