# Decisions

Newest at the bottom. One entry: date, decision, why.

- 2026-11-04 · One studio site (Gurrulabs) with one page per app, not one site per app · traffic and trust add up
  on one URL; new apps start with existing authority. Origin: PULSE-023 in the Pulse project.
- 2026-11-04 · Separate repo and hub project (`gurrulabs-web`), related to every other project · the site
  serves several apps; its Lead can ask app Leads for facts (tickets only, not chats).
- 2026-11-04 · Cloudflare Pages on a free `*.pages.dev` subdomain · $0; a paid domain can be added later
  without rebuilding the site. Owner has no Cloudflare/GitHub setup knowledge: the Lead sets it up (T-003).
- 2026-11-04 · Shared Gurru Labs websites Mixpanel project, production hostname only · one place for all
  web metrics; overrides PULSE-023's "no Mixpanel".
- 2026-11-04 · Launch in en/es/fr/pt · same as the apps and Raffy Web; 4x search surface.
- 2026-11-04 · GitHub account `gurrulabs-oss`; nothing ever goes to MonkeyTaps/work accounts · personal project, kept apart
  from the owner's job.
- 2026-11-04 · Same stack as Raffy Web (static, no framework, no npm deps) · proven, zero build, zero cost.
