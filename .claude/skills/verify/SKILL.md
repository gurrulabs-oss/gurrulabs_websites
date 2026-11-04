---
name: verify
description: Verify changes in Gurrulabs Websites (static site). Use after implementing anything and before writing a ticket Summary.
---

There is no build, test suite or linter yet (as of onboarding, 2026-11-04). When a ticket adds a validator
script (e.g. `npm run validate`), add it here as step 1. Run from the repo root, stopping at the first failure:

1. Serve and probe: `python3 -m http.server 8765` in the background, then `curl -s -o /dev/null -w "%{http_code}" http://localhost:8765/<path>`
   for every page the ticket added or changed, in all 4 locales (en, es, fr, pt). Each must be `200`. Stop the server after.
2. JS syntax, if any `.js`/`.mjs` changed: `node --check <file>` for each.
3. Diff check: `git diff --stat main...HEAD` plus uncommitted diff. Confirm every page change exists in en/es/fr/pt,
   every Play link goes through the referrer helper, and no ticket files (`.lead/tickets/T-*.md`) are staged.
4. Analytics gate: grep the changed JS for `mixpanel`; tracking must sit behind the exact production-hostname check.
   Never load a page in a way that sends events to the real project.
5. Visual check for UI tickets: headless Chrome screenshots at 390px and desktop (see `.lead/agent-notes.md`).
   If Chrome is unavailable, say "not visually verified".

Report: each command, pass/fail, and the relevant excerpt of failing output (≤20 lines).
If a command cannot run here, say so explicitly — never report it as passed.
