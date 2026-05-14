# Sub-subagent Report: ZenBreakout.js (N3)

## Distinctness Justification

Checked the closest-sounding files before writing any code:

- `games/balanceBeam.js` — Gymnast-on-beam balancing game where meditation
  controls sway and attention controls forward step rate; no paddle, no ball,
  no bricks. Not a breakout analogue.
- `examples/bouncingCircles.js` — Ambient animation: ten HSB circles bouncing
  off the canvas edges, EEG just modulates speed/hue. No paddle, no player
  input, no bricks.
- `examples/MultipleBalls.js` — Ambient 3×3 grid of balls whose velocity
  scales with individual EEG bands. No paddle, no player input, no bricks.
- Other paddle/ball candidates scanned by name only: `SplineBounce`,
  `bouncingLine`, `ColourBalls`, `mandala`, `particles`, `AlphaSnake`,
  `BrainDraw` — all are generative/ambient, not brick-breakers.
- `brainGames/games/` — only `__sample.js` (smoke-test stub), so no collision
  inside the new-games folder.

Conclusion: no existing Brainimation game or example is a paddle-ball-brick
Breakout. `ZenBreakout` is distinct.

## File Written

- `/Users/kylemathewson/Brainimation/brainGames/games/ZenBreakout.js` — 15276
  bytes, 519 lines.
- `@order 35` (chosen >= 32 per spec, leaves room for sibling N1/N2/N4).

## EEG Mapping (as implemented)

- **meditation -> paddle width**: smoothed with `BGShared.makeSmoother(30)`
  (~1 s at 30 fps). Each frame the current paddle width eases toward
  `lerp(72, 196, medSmoothed)` with factor 0.12, so the paddle never snaps.
- **beta -> ball speed**: smoothed with `BGShared.makeSmoother(20)`.
  Per-frame target speed is `240 + betaSmoothed * 380 + (wave-1)*10`;
  the ball velocity vector is re-normalised to that magnitude every frame
  while preserving direction. Capped at 820 px/s after paddle bias so
  paddle english can't run away.
- **attention -> trail + crit**: when `attention > 0.65` the ball lays down
  a cyan afterimage (up to 24 samples) and on each brick break there is a
  35% chance of a 2× "CRIT" scored with a flash overlay. Below the
  threshold the trail drains and crits are disabled.

## BGShared helpers used

- `readEEG()` — safe per-frame pull of meditation / beta / attention.
- `makeSmoother(n)` — two instances (30-frame for meditation, 20-frame
  for beta) to slow the paddle/speed response.
- `PALETTE` — all colours sourced from the 90s palette (paddle, ball,
  bricks, flash text).
- `fillVerticalGradient` — shadow -> ink background wash.
- `drawPixelBorder` — framing on the playfield, every brick, the paddle,
  and the right-side "BETA / MED" mini-panel.
- `drawBar` — beta and meditation meters in the right-side panel.
- `drawTopHud` — attention/meditation meters + score strip along the top.
- `drawIntroPanel` — title, blurb, 3-mapping intro with auto-countdown
  then "PRESS SPACE TO START".
- `drawSummaryPanel` — game-over stats (score, wave, lives) + restart hint.
- `drawScanlineOverlay` — rendered last for the CRT vibe.
- `blinker` — pulses the "PRESS SPACE TO LAUNCH" hint while the ball is
  stuck on the paddle.

Nine helpers in active use (spec minimum is three).

## Design acceptance checklist

- [x] Intro → play → over → restart cycle (SPACE advances each transition;
      after game-over, SPACE resets and re-enters a short 6-second intro).
- [x] Uses at least THREE BGShared helpers — nine used.
- [x] Uses at least TWO `eegData` channels — three (meditation, beta,
      attention).
- [x] 90s palette — all colours pulled from `BGShared.PALETTE`.
- [x] Pixel borders on frame and bricks via `drawPixelBorder`.
- [x] NO emojis (text is ASCII-only; grepped before shipping).
- [x] Works with simulator only — `readEEG()` safely defaults to zeros
      when `window.eegData` is missing or partial; no Muse-specific calls.
- [x] `node --check` passes (see below).

Implementation specifics worth calling out:

- Time-based physics: `dt = clamp((millis()-prev)/1000, 0, 0.05)`, ball
  advances by `vx*dt, vy*dt` each frame.
- Brick collision is per-axis reflection: for every brick AABB that
  overlaps the ball's bounding square, the shallower-penetration axis is
  chosen and that velocity component is flipped; the ball is displaced
  out of the brick by the overlap so it doesn't tunnel.
- Paddle collision adds horizontal bias `(hitOffset/halfW) * 220` to
  `vx` and flips `vy` negative.
- LEFT / RIGHT arrows and A / D both move the paddle (no mouse — chose
  keyboard as the single input path to avoid ambiguity and make it
  usable on laptops with trackpads).
- SPACE launches the ball when it's stuck to the paddle.
- Lives (3) persist across waves. Clearing all bricks bumps the wave,
  adds a row every ~3 waves and a column every ~2 waves (capped), and
  nudges base speed by +20 px/s.

## `node --check` result

```
$ node --check /Users/kylemathewson/Brainimation/brainGames/games/ZenBreakout.js
EXIT=0
```

(Empty stdout/stderr; exit status 0.)

## Self-Assessment (Tripartite)

- **Craftsperson says:** The physics is honest — time-based, dt-clamped,
  per-axis overlap resolution, paddle english with a speed cap.
  The EEG mappings obey the spec's numeric ranges to the pixel
  (72..196 for paddle, 240..620 for ball) and are double-smoothed so
  the simulator's jitter doesn't translate into visual twitchiness.
  Nine BGShared helpers are wired in, the intro/play/over flow is
  complete, and the file compiles clean under Node.
- **Skeptic says:** Three risks stand out. (1) I could not actually
  render the game headlessly, so the visual layout (right-side EEG
  panel, top HUD strip, bricks against the playfield frame) is only
  validated by reading the helper sources — a narrow viewport could
  overlap panels. (2) Wave progression adds columns/rows without
  rechecking that the new brick width stays > ball diameter; at very
  wide waves on narrow screens bricks could get thin enough that the
  ball clips awkwardly. (3) The `attention > 0.65` threshold is hard-
  coded from the spec; the grace-buffer helper could make this
  per-player adaptive, but the spec called for a fixed threshold so
  I kept it literal.
- **Mover says:** All acceptance-checklist items pass, `node --check`
  is clean, the file is within the writeable path, distinctness is
  established in writing, and the EEG contract matches the numbers in
  the spec. Shipping. Open items above are flagged for M3 to route
  back if runtime testing surfaces a layout bug.

## Questions for Manager M3

(none)
