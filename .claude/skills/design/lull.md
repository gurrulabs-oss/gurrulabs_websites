# Lull pages

Status: **guide look approved by Unai (GWEB-012, 2026-11-24: "me gusta bastante").** Reference mockup:
`.lead/designs/T-012/` (`index.html` = Guide 1, `guide.css` = the `lg-` template). Use it for every Lull page
(guides, app page blocks, tools). Brand facts come from the Lull app/Lead, never invented.

## Brand (from `styles.css` `body.app-lull`, "Vela" dark palette, from the Lull app)
- Background #17121A → #1d1622 with a soft peach glow; surfaces #221B25 / #2C2330; line #3A2F3E.
- Text #F3EAE4 / #CDBFC0 / #A8999D. Accent peach `--accent` #F0B48A, calm lilac `--calm` #C9B6E4,
  ok green `--ok` #A8D5B0, warn pink `--warn` #F28B9B. Dark theme only.
- Fonts: Fraunces (serif) for headings, weight 300-400, **never bold**; Atkinson Hyperlegible for body (17 px, 1.65).
- Assets: `assets/lull-*.webp` (app screens), Lull rings icon (3 concentric peach circles, SVG).

## Direction: "the quiet room"
A reader in bed at night, on a phone, in the dark. One calm reading column (68ch), one thing to touch, the rest quiet.
- **Hero:** big plain light Fraunces title (no eyebrow label, no coloured word), one-line lede, visible dates.
  Under it one **interactive instrument** that explains the page's idea (Guide 1: room-sound dial; others: texture
  picker, day-to-night scrubber, example diary, safe-volume dial). Real `<input type=range>`/buttons, keyboard and
  screen-reader usable (`aria-valuetext`), **no audio**, labelled "Schematic, not study data" / "Example, not real data".
  On load it moves once to the meaningful position.
- **Short answer:** even hairline box, small peach label (no stripe).
- **Data as pictures, not stat cards:** 100-dot grid for prevalence, timeline for routines, one chart with curves on the
  same axes, evidence table with certainty pips (●○○○ GRADE). No 4-stat templates, no same-size icon-card grids.
- **Tips:** hairline-split columns, no boxes. **Red flags:** pink hairline card, two-column list. **FAQ:** open rows,
  plus that turns 135°. **Sources:** hanging serif numerals, `:target` highlight; numbered peach source badges inline.
- **Desktop rail:** "On this page" with a peach marker following reading position, plus a small Play card. Gone on phones.
- **End:** "More for nights with tinnitus" (each sibling guide with its own mini schematic), then the download band.
- **App screens:** always the whole screen inside a phone bezel (dark 7 px frame + hairline + soft lilac glow),
  never cropped through the UI.
- Browser details themed: selection, focus ring (2 px peach), link underlines (peach 60%), scrollbar.

## Download CTA (Lull on Google Play from late Nov 2026)
- Official Google Play badge only (`assets/play-badge-<loc>.webp`), never restyled, natural size on phones.
- Owner (2026-11-24): **download banners carry more colour** than the rest of the page: peach-to-lilac "dusk" gradient
  over deep plum (`#3a2532 → #2a2038 → #231c33` with peach radial at left ~42%, lilac radial top-right ~38%), peach
  hairline border and a soft peach shadow. Applies to the end band, the mid-article row and the rail card. The rest of
  the page stays in small colour doses.
- Placements: mid-article row, desktop rail card, end band ("Try Lull tonight") with the Lull rings and slow breathing
  glow (the page's one ambient loop, 9 s; off on phones and reduced motion).

## Motion
Calm, play-once: the hero moves once (≤2.6 s, `cubic-bezier(.45,0,.55,1)`), dots gather, timeline and chart lines draw
once on scroll (0.9-1.8 s, `cubic-bezier(.22,1,.36,1)`). One ambient loop max (band glow). Phones still except what the
reader drags. `prefers-reduced-motion` and capture mode show final frames.

## Rules
- Calmer than any other app: no game-style flashes, countdowns or score colours.
- Wording: never "cure"/"eliminate"/"treat"/"reduce"/"make it go away" tinnitus; never call Lull's sound a therapy;
  nothing implying a cause; patterns are association only. Health content is educational, no promises.
  `LULL_BANNED` in `validate.mjs` misses cause/therapy phrasing, so check by hand.
- Colour per feature: peach primary, lilac calm/sleep, green "works"/ok, pink warnings.
- CSS classes prefixed `lg-` (the generic `styles.css` classes clash).
