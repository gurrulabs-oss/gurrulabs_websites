---
name: design
description: Visual design rules for every Gurrulabs page (Pulse, Lull, Cyberpunk Detective, home). Routes to one file per app. Use before designing, mocking up or restyling any page, card, chart or animation on the site, and when briefing a worker on visual work.
---

# Gurrulabs page design: router

Every app has its own look. This file holds only the rules shared by the whole site; **before designing, open the
file for the app you are working on** and follow it. Where an app file and this file disagree, the app file wins.

| Page you are designing | Read |
|---|---|
| Pulse: app page, game panel, guides, tests (`/xx/pulse/**`) | `pulse.md` |
| Lull (`/xx/lull/**`) | `lull.md` |
| Cyberpunk Detective (`/xx/cyberpunk-detective/**`) | `cyberpunk-detective.md` |
| Home / studio page (`/xx/`), and the app tiles on it | `home.md` |
| A new app | none yet: get its brand from its Lead, copy the shape of `pulse.md` into a new `<app>.md` and have Unai approve it in a design step |

Brand facts (colours, fonts, screenshots, claims) always come from the app's own Lead or repo, never invented.

## Shared rules (every app)
Approved by Unai in GWEB-020 (2026-11-11).
- **One thing moves at a time.** Looping previews and illustrations are still frames by default and animate only on
  the hovered or focused element. At most one ambient loop per screen. Phones (no hover) stay still. Everything
  stops under `prefers-reduced-motion`. Owner: "todo a la vez me produce agobio".
- **Animation that plays once is welcome.** Blocks fade up as they scroll in, card grids stagger, diagrams draw
  themselves (lines draw, dots gather, bars grow, numbers count up). Once, never looping. The app file sets how
  much and how fast.
- **Colour in small doses.** Soft tint on cards (`color-mix` ~7-15%), hairline border (~14-16%); the strong colour
  goes on small things (icon tile, label, text link, chart mark, big figure). Filled buttons only for the main action.
- **Still frames must read on their own**: pick the frame that explains the mechanic.
- **No sound that isn't the mechanic**; unlock audio silently.
- **Cards show the thing**: a preview of the real mechanic, real art or real data on top, then title, one line,
  and a coloured text link pinned to the bottom. Group cards by kind under a small uppercase row header with a
  hairline; guides/articles before tests/tools. Anything that looks clickable must do something.
- **Answer boxes:** even hairline border + small coloured "Short answer" label. Never a coloured stripe inside a
  rounded box (it bends at the corners). Today Lull and Cyberpunk Detective `.answer` still use the stripe.
- **No walls of text:** steps not paragraphs; findings as cards (mini diagram, big figure, one sentence, source
  chip); tips as icon cards; FAQ as soft cards; numbered source badges; "On this page" rail on desktop.
- At least one picture or diagram per screen of reading; text-only SEO pages read as thin.
- A shorter H1 is fine, but keep every keyword: the one dropped goes in a kicker above it; the title tag keeps both.
- **Charts:** real numbers from the page's cited sources only; honest axes (no bars on a truncated axis); "you on
  the chart" only from a value measured on the page, kept in memory; schematics labelled "Schematic, not study
  data", with a reveal that acts out the finding; data table stays under the chart.
- **Before showing Unai:** desktop and 390 px, keyboard focus visible, gold "tbc" tags on invented copy, every
  number traced to a source.
