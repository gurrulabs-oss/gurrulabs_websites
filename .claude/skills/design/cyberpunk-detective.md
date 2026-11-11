# Cyberpunk Detective pages

Status: **brand facts from the live site; layout not yet approved by Unai.** The first visual ticket for these
pages proposes a mockup built on the shared rules in `SKILL.md` and these notes, and records what Unai approves here.

## Brand (from `styles.css` `body.app-cyber`, "CyberpunkNight" theme from the app)
- Background #0A0E12 with a magenta glow and a faint violet 48 px grid; surfaces #0F131A / #1A1F29; line #2A2F45.
- Text #E6F0FF / #B9C6DD / #8995AE. Accent cyan `--accent` #00D4FF, magenta `--mag` #FF2E97, clue yellow
  `--clue` #FFF200, aqua `--aqua` #00FFF0, violet `--violet` #7B00FF.
- Orbitron bold, UPPERCASE for H1, section titles and case names; body stays in the site font.
- Neon edges (aqua → violet gradient), glow on the H1 highlight. Case art in `assets/case-*.webp`; more in
  `~/AndroidStudioProjects/miniaicrimes/app/src/main/res/drawable/` or from its Lead.

## How it differs from Pulse
- A story/mystery game: cards are **cases** with real case art on top (not mechanic previews), a clue-yellow
  kicker, aqua tags.
- Motion can feel more "tech" (scanline, a short glitch on reveal, neon flicker on hover) but the shared rule
  holds: one thing moves at a time, once on reveal, hover for loops, off under reduced motion.
- Steps use the magenta "01/02/03" Orbitron numbers already on the page.
