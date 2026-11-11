# Pulse pages

Status: **approved** by Unai in GWEB-020 (2026-11-11) on all Pulse page types. Shared rules in `SKILL.md` apply.

## Brand
- Dark only. Outfit (light 200-300 for big numbers and H1, 500 for labels). Tokens in `styles.css` `:root`.
- One colour per mode, used everywhere that mode appears (cards, tabs, page colour of its test page):
  Exact Time `--m-exact` #8EA2FF, Hidden Clock `--m-hidden` #C49BFF, Interval `--m-interval` #6FD6F2,
  Reaction `--m-reaction` #FF9F8A, Batak `--m-batak` #A8E68A. Results: `--pass`, `--miss`, `--gold` (Perfect/target).
- Motion: lively but calm; reveals ~0.6-1.4 s once; one hero loop max (lights going out, for example).

## App page
1. **Hero:** app icon + name, H1, short sub, Play badge, check chips; the game panel on the right.
2. **Game panel:** every mode playable. Switcher of icon pills; the active one widens to show its name, so all five
   fit a 390 px phone; arrow keys switch modes; panel tall enough for the biggest mode (Batak, Interval).
3. **Mode cards:** one per mode in a row (2 per row on phones): still preview of the mechanic (bar at 3.00, 10.00
   blurring, two pulses, five red lights, Batak pads) animating on hover only; name; one line; "Play ↑" in the
   mode colour. Click loads that mode in the panel and scrolls to it.
4. **Tests and guides:** "Guides" row first (wide cards with a picture: real-data dot line, mini list of compared
   apps), then "Tests" row (compact, icon tile, mode colour, "Play →").
5. Screenshots strip, closing Play band.

## Guide page (example: average reaction time by age)
1. **Hero:** H1 with the key phrase in the page colour, 1-2 line sub, dates and read time; on the right one
   animated illustration that ends on the headline figure (lights go out → "217.9 ms").
2. Short answer box. 3. **Stat tiles** (4, count up), each with its citation.
4. **Chart beside a playable test:** the visitor's result lands on the chart and the nearest group is named;
   data table below.
5. **Contrast graphic** for the key insight (age gap vs spread within one age, two bars on one scale).
6. **Factor cards** 2×2, each with an illustration (sleep lapses as bars, device-delay bars) and the sourced fact.
7. **Concept diagrams** (simple vs choice: one light vs four pads).
8. Educational "Is it normal?" note, FAQ cards, sources, rail.

## Test page (example: internal clock test)
1. **Hero:** uppercase kicker in the page colour (secondary keyword), H1 with the key number in the page colour,
   1-2 line sub, chips, Play badge, dates; the game on the right.
2. **Your tries:** rules as one ruler (miss zones, pass band, gold target, three numbers as legend); each try lands
   as a dot, with count, average, spread and hits. In memory only.
3. **How to play:** 3 step cards with a still of the screen at that step (0.00 → blurred count → 10.04 Pass).
4. **The science:** Short answer, then one schematic per idea (spread widening with the target; counting = same
   centre, tighter tries).
5. **Findings** 2×2 cards ("1%", "10–90 s"…). 6. **Tips** 3 icon cards in different mode colours.
7. App push card, FAQ cards, sources, rail with "Play again".

## Reference
`.lead/designs/T-020/`: `app.html`, `panel.html`, `age-b.html` (guide), `guide.html` (test); styles `t020.css`,
behaviour `mock.js`. After GWEB-020 ships, the same classes live in `styles.css`.
