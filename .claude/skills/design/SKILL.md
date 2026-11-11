---
name: design
description: Visual design rules for every Gurrulabs page (Pulse, Lull, Cyberpunk Detective, home). Use before designing, mocking up or restyling any page, card, chart or animation on the site, and when briefing a worker on visual work.
---

# Gurrulabs page design

Approved by Unai in GWEB-020 (2026-11-11) across all the Pulse page types: app page, game panel, guide (age
guide) and test page (internal clock test). Applies to every app's pages, Lull included. Each app keeps its own
brand (Pulse: dark, Outfit, mode colours; Lull: its own palette and fonts from the Lull repo/Lead). These rules
decide how the brand is used, not which brand.

## Calm first (all pages)
- **One thing moves at a time.** Looping previews and illustrations are still frames by default and animate only on
  the hovered or focused element. At most one ambient loop per screen (a hero visual). Phones (no hover) stay still.
  Everything stops under `prefers-reduced-motion`. Owner: "todo a la vez me produce agobio".
- **Animation that plays once is welcome.** Blocks fade up as they scroll in, card grids stagger, diagrams draw
  themselves (lines draw, dots gather, bars grow, numbers count up). Once, never looping.
- **Colour in small doses.** Cards get a soft tint of their colour (`color-mix` ~7-15%) and a hairline border (~14-16%).
  The colour itself goes on small things: icon tile, label, a text link, a chart mark, a big figure. Filled buttons
  only for the main action (Play badge, Start), never one per card. Each item keeps its own colour (Pulse: one per mode).
- **Still frames must read on their own**: pick the frame that explains the mechanic (bar at the target, lights lit).
- **No sound that isn't the mechanic.** No beeps on Start or on page actions; unlock audio silently.
- Lull: gentler still (slower, fewer loops), and never "cure"/"eliminate" tinnitus wording.

## App page (approved: Pulse app page)
1. **Hero:** app icon + name, H1, short sub, Play badge, check chips; the game panel on the right.
2. **Game panel:** every mode the app has, playable. Mode switcher of icon pills where the active one widens to
   show its name, so all modes fit a 390 px phone; arrow keys switch modes; panel tall enough for the biggest mode.
3. **Mode cards:** one card per mode in a row (2 per row on phones): still preview of that mode's mechanic on top
   (animates on hover only), name, one line, "Play ↑" text link in the mode colour. Clicking loads that mode in the
   panel and scrolls to it.
4. **Tests and guides:** a "Guides" row first (wide cards with a picture: real-data mini chart, mini list of what
   is compared), then a "Tests" row (compact cards, icon tile, one colour each, "Play →").
5. Screenshots strip, then the closing Play band.

## Guide page (approved: average reaction time by age)
1. **Hero:** H1 with the key phrase in the page colour, 1-2 line sub, dates and read time; on the right one
   animated illustration of the topic that ends on the headline figure (lights go out → "217.9 ms").
2. Short answer box.
3. **Stat tiles** (4, count up on reveal), each with its citation.
4. **Chart beside a playable test:** the visitor's measured result lands on the chart and the nearest group is
   named. Data table below the chart.
5. **A contrast graphic** for the key insight (age gap vs spread within one age, as two bars on one scale).
6. **Factor cards** (2×2) with an illustration each (bars with lapses, device-delay bars), the sourced fact under it.
7. **Concept diagram** cards (simple vs choice: one light vs four pads).
8. "Is it normal?" educational note, FAQ cards, sources, "On this page" rail.

## Test page (approved: internal clock test)
1. **Hero:** small uppercase kicker in the page colour (secondary keyword), H1 with the key number in the page
   colour, 1-2 line sub, chips, Play badge, dates; the playable game on the right.
2. **Your tries:** the rules as one ruler (miss zones, pass band, gold target mark, three numbers as legend), each
   try landing as a dot plus count, average, spread and hits. In memory only.
3. **How to play:** 3 step cards, each with a still of the screen at that step (0.00 → blurred count → 10.04 Pass).
4. **The science:** Short answer box, then one schematic per idea that shows the study's contrast.
5. **Findings** 2×2 cards. 6. **Tips** as 3 icon cards. 7. App push card, FAQ cards, sources, rail with "Play again".

## Shared blocks
- **Answer box:** even hairline border + small coloured "Short answer" label. Never a coloured stripe inside a
  rounded box (it bends at the corners).
- **Findings cards:** mini diagram on top, big figure in the card colour ("1%", "10–90 s"), one sentence with the
  subject in bold, source chip pinned to the bottom. Owner rejected plain rows with a chip.
- **Steps, tips, FAQ:** steps not paragraphs; tips as icon cards; FAQ as soft cards; numbered source badges.
- **Rail:** "On this page" list + shortcut back to the game, desktop only (≥1000 px); numbered headings in the page colour.
- **Section rows:** small uppercase header with a hairline to group cards by kind.
- Anything that looks clickable must do something.
- At least one picture or diagram per screen of reading; text-only SEO pages read as thin.
- A shorter H1 is fine, but keep every keyword: the one dropped goes in the kicker; the title tag keeps both.

## Charts and diagrams
- Real numbers only, from the page's cited sources. Honest axes: no bars on a truncated axis (use dots/lines).
- "You on the chart" uses a value the visitor measured on the page (a game result), never a typed-in number;
  kept in memory only, nothing stored.
- Schematic diagrams (no study numbers) are fine to explain an idea, labelled "Schematic, not study data"; their
  reveal animation acts out the finding (dots gather, curves widen), not just a fade.
- The data table stays under the chart (search, screen readers).

## Checks before showing Unai
- Desktop and 390 px; switchers and card rows fit a phone; keyboard focus visible.
- Gold "tbc" tags on any copy you invented; numbers traced to a source.
- Reference implementation: `.lead/designs/T-020/` (`app.html` app page, `panel.html` game panel, `age-b.html`
  guide, `guide.html` test page; styles in `t020.css`, behaviour in `mock.js`) until GWEB-020 ships, then the
  same classes in `styles.css`.
