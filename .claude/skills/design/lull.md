# Lull pages

Status: **brand facts from the live site; layout not yet approved by Unai.** The first Lull visual ticket must
propose a mockup built on the shared rules in `SKILL.md` and these notes, and record what Unai approves here.

## Brand (from `styles.css` `body.app-lull`, "Vela" dark palette, from the Lull app)
- Background #17121A → #1d1622 with a soft peach glow; surfaces #221B25 / #2C2330; line #3A2F3E.
- Text #F3EAE4 / #CDBFC0 / #A8999D. Accent peach `--accent` #F0B48A, calm lilac `--calm` #C9B6E4,
  ok green `--ok` #A8D5B0, warn pink `--warn` #F28B9B.
- Fonts: Fraunces (serif) for headings, weight 500 or lighter, **never bold**; Atkinson Hyperlegible for body.
- Assets: `assets/lull-*.webp` (app screens); more in the Lull repo (`~/Desktop/Personal/lull`) or from its Lead.

## How Lull differs from Pulse
- **Calmer than any other app.** It is a tinnitus/sleep app: slow motion (≥1.5 s eases), no ambient loop unless
  it is a slow breathing-like glow; no game-style flashes, countdowns or score colours.
- No playable game. Interactive bits, if any, are gentle (e.g. a sound preview the visitor starts themselves,
  never autoplay).
- **Not on Google Play yet:** no install CTA or Play badge; the main action is the sign-up pill/button.
- Wording: never "cure" or "eliminate" tinnitus; health content is educational, no promises. `LULL_BANNED` in
  `validate.mjs` misses cause/therapy phrasing, so check by hand.
- Colour per feature (not per mode): peach for primary, lilac for calm/sleep features, green for "works"/ok.
