---
name: design
description: Visual design rules for every Gurrulabs page (Pulse, Lull, Cyberpunk Detective, home). Use before designing, mocking up or restyling any page, card, chart or animation on the site, and when briefing a worker on visual work.
---

# Gurrulabs page design

Approved by Unai in GWEB-020 (2026-11-11) on the Pulse pages; applies to every app's pages, Lull included.
Each app keeps its own brand (Pulse: dark, Outfit, mode colours; Lull: its own palette and fonts from the Lull
repo/Lead). These rules decide how the brand is used, not which brand.

## Calm first
- **One thing moves at a time.** Looping previews and illustrations are still frames by default and animate only on
  the hovered or focused element. At most one ambient loop per screen (a hero visual). Phones (no hover) stay still.
  Everything stops under `prefers-reduced-motion`. Owner: "todo a la vez me produce agobio".
- **Animation that plays once is welcome.** Blocks fade up as they scroll in, card grids stagger, diagrams draw
  themselves (lines draw, dots gather, bars grow). Once, never looping. Owner asked for it in GWEB-020.
- **Colour in small doses.** Cards get a soft tint of their colour (`color-mix` ~7-15%) and a hairline border (~14-16%).
  The colour itself goes on small things: icon tile, label, a text link, a chart mark. Filled buttons only for the
  main action (Play badge, Start), never one per card.
- **Still frames must read on their own**: pick the frame that explains the mechanic (bar at the target, lights lit).
- **No sound that isn't the mechanic.** No beeps on Start or on page actions; unlock audio silently.
- Lull: gentler still (slower, fewer loops), and never "cure"/"eliminate" tinnitus wording.

## Cards and lists
- A card shows the thing: a small preview of the real mechanic or real data on top, then title, one line, and a
  coloured text link pinned to the bottom so links align across a row.
- Group by kind with a small uppercase row header and a hairline: guides/articles first (wide cards with a picture),
  then tests/tools (compact, one colour each).
- Anything that looks clickable must do something.

## Content pages (guides, tests)
- Hero: title plus a visual (the playable game, or one animated illustration). Keep the sub to 1-2 sentences.
- Answer boxes: even hairline border + small coloured "Short answer" label. Never a coloured stripe inside a
  rounded box (it bends at the corners).
- Break walls of text: numbered steps instead of a paragraph; findings as cards (mini diagram, big figure in the
  card colour, one sentence, source chip; owner rejected plain rows with a chip); tips as icon cards, FAQ as soft
  cards, numbered source badges, "On this page" rail on desktop (≥1000 px), numbered headings in the page colour.
- Stat tiles only for numbers printed in a cited source, each with its citation under it.
- Every page should have at least one picture or diagram per screen of reading; SEO pages that are only text
  read as thin.

## Charts and diagrams
- Real numbers only, from the page's cited sources. Honest axes: no bars on a truncated axis (use dots/lines).
- "You on the chart" uses a value the visitor measured on the page (a game result), never a typed-in number;
  kept in memory only, nothing stored.
- Schematic diagrams (no study numbers) are fine to explain an idea, labelled "Schematic, not study data".
- The data table stays under the chart (search, screen readers).

## Checks before showing Unai
- Desktop and 390 px; switchers and card rows fit a phone; keyboard focus visible.
- Gold "tbc" tags on any copy you invented; numbers traced to a source.
- Reference implementation: `.lead/designs/T-020/` (mockup, `t020.css`) until GWEB-020 ships, then the same
  classes in `styles.css`.
