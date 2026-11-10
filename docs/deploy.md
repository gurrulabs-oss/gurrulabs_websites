# Deploy (GitHub Pages)

Production: https://www.gurrulabs.com (GitHub Pages of `gurrulabs-oss/gurrulabs_websites`, source `main` `/`,
domain bought at IONOS). Same setup as Raffy Web (`www.raffyparenting.com`). Cost: the domain only.
Until 2026-11-10 the site ran on Cloudflare Pages at `gurrulabs.pages.dev` (build step `build.sh` → `dist/`).

## How it works
- **Merge to `main` = production.** GitHub Pages (classic Jekyll build) publishes the repo root on every push.
  Jekyll never publishes dot-folders (`.lead/`, `.claude/`, `.github/`); `_config.yml` `exclude:` keeps out
  `CLAUDE.md`, `README.md`, `docs/`, `scripts/`. A new top-level internal file must be added there or it goes live.
- `CNAME` (`www.gurrulabs.com`) sets the custom domain; never delete it. `gurrulabs.com` redirects to `www`.
- `404.html` at the root makes unknown URLs return a real 404. Keep it.
- `/foo`, `/foo/` and `/foo.html` all serve; link without `.html`.
- Build status: `gh api repos/gurrulabs-oss/gurrulabs_websites/pages/builds/latest` (`commit`, `status: built`).
- No branch previews: check pages locally before merging.

## Deploying from the board (hub)
- `gurrulabs-web` has a `deploy` block (`kind: github-pages`) in the hub config, like Raffy Web.
- Review → **Merge and deploy**: the hub merges, pushes `main` as `gurrulabs-oss`, waits for that Pages build,
  then loads `/` and every `.html` the merge changed (200 + `<title>` + ≥500 bytes). Fail or 20 min timeout →
  automatic revert + push, ticket back to Review with a Deploy report from the Lead. **Merge without deploying**
  also exists. The hub reads `_config.yml` `exclude:`, so `docs/`/`CLAUDE.md` don't trigger the "internal files
  would become public" warning.
- Lead runs never push; Unai deploys with the hub's Merge and deploy button.

## Domain (IONOS DNS)
IONOS → Domains & SSL → `gurrulabs.com` → DNS. Records (same as raffyparenting.com):
- `A` `@` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` (delete IONOS's default
  `A`/`AAAA` for `@` first, they point at its parking page).
- `CNAME` `www` → `gurrulabs-oss.github.io`.
Then GitHub repo → Settings → Pages: custom domain `www.gurrulabs.com`, wait for the DNS check, tick
**Enforce HTTPS** once the certificate is issued (minutes to an hour).

## Clicks for a new site
1. **GitHub repo** under `gurrulabs-oss` (never `undimonkey`/work accounts): github.com → New repository → public,
   **empty**. Locally `git remote add origin https://gurrulabs-oss@github.com/gurrulabs-oss/<repo>` (the username
   makes git use the `gurrulabs-oss` keychain token), add `_config.yml` with the `exclude:` list, push `main`.
2. Settings → Pages → Deploy from a branch → `main` `/ (root)`; set the custom domain (writes `CNAME`).
3. DNS at the registrar as above; Enforce HTTPS.
4. **Search Console** (Unai's personal Gurrulabs Google account): Add property → **URL prefix**
   `https://www.<domain>/` → HTML file method (`google<id>.html` at the repo root, keep forever) → Verify;
   then Sitemaps → submit `sitemap.xml`.
