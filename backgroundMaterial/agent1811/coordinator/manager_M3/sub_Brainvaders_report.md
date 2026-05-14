# Sub-subagent Report: Brainvaders.js (N2)

## Distinctness Justification

Skimmed the four closest-looking shooter-style games in `/games/`:

- **archeryShooter.js** — Single-bow aim game; attention drives reticle steadiness, meditation drives draw power; one arrow at a time over a 10-shot session. Not a grid/wave invader.
- **bballShooter.js** — Single-ball arc shot at a moving hoop; attention-driven aim drift + auto-release on held focus; time-limited shootaround. Not a grid/wave invader.
- **GolfShooter.js** — Driving-range distance-maximization game; attention=power, meditation=arc consistency; one ball per shot, 10 shots total. Not a grid/wave invader.
- **soccerPenalty.js** — Penalty shoot-out vs. a moving keeper; reticle aim + theta kick trigger + beta keeper speed; one ball per shot. Not a grid/wave invader.

Skimmed file headers of the listed `/examples/` (AlphaSnake, BrainDraw, ColourBalls, MultipleBalls, SplineBounce, bandOrbitz, bouncingCircles, bouncingLine, mandala, particles, piWedges, waveAnimation, waves, brainBeats, brainSynth): all are visualization/music demos — snakes, particles, wedges, spectra — none implement a descending-formation enemy-wave shooter.

**Conclusion:** Brainvaders is mechanically distinct: a grid formation (5 x 8) of aliens that marches horizontally, reverses + drops on bound contact, fires lasers, and must be cleared by a bottom-anchored player cannon. No existing game/example uses this pattern.

## File Written
- `/Users/kylemathewson/Brainimation/brainGames/games/Brainvaders.js`  (20037 bytes, 691 lines)

## EEG Mapping (as implemented)
- **beta:**       cannon fire cooldown `= lerp(900ms @ beta=0, 120ms @ beta=1)`. Gated by `millis() - lastShotMs >= cooldown`. Smoothed with `makeSmoother(20)` so the cadence doesn't jitter on noisy streams.
- **attention:**  spread-shot gate. When smoothed attention `>= 0.60`, SPACE fires a **3-shot spread** (one straight + two mildly angled, `vx = +/-1.8`). Below the threshold SPACE fires a single bolt. A HUD label (`SPREAD SHOT` / `SINGLE SHOT`) surfaces the current mode to the player. (This is the "3-shot spread" alternative from the spec — picked over the hit-radius variant because it is more visually distinct and rewards sustained focus without arcane hitbox tuning.)
- **meditation:** shield regen. While smoothed meditation `> 0.55`, `shieldCharge` accumulates at a rate scaled by how far above the threshold the player is (`~4s to full at high meditation`). The shield absorbs exactly one alien laser (flash feedback, `shieldCharge -> 0`). Rendered as a pixel arc above the player plus a bottom-left `BGShared.drawBar` meter labelled `SHIELD`.
- **alpha:**      cosmetic only — scanline overlay alpha is modulated (`34 + round(alpha * 30)`) so high-alpha states visibly pulse the CRT scanlines. Documented in the intro panel and header; no mechanical effect.

## BGShared helpers used
- `PALETTE` — drive all tier colours / HUD tints / background gradient (90s palette compliance).
- `fillVerticalGradient` — ink-to-deepPurple backdrop under the playfield.
- `drawScanlineOverlay` — final-pass CRT scanlines; alpha pulses with smoothed alpha channel.
- `drawPixelBorder` — outer frame around the canvas for the pixel-chrome aesthetic.
- `drawTopHud` — top strip showing attention/meditation meters + score (score centred).
- `drawBar` — shield charge bar (bottom-left) and fire-rate bar (bottom-right).
- `drawIntroPanel` — intro state with blurb + 4 colour-coded EEG mapping rows + countdown/start hint.
- `drawSummaryPanel` — game-over panel with 5 stat boxes (score, wave, kills, best combo, accuracy) + flavour + blinking restart hint.
- `makeSmoother(20)` — four rolling averages (beta, attention, meditation, alpha) to stabilise mechanics.
- `readEEG` — defensive read of `window.eegData`, safe against missing channels / unseen stream.

(Well over the required three helpers; well over the required two EEG channels.)

## Design acceptance checklist
- [x] Intro -> play -> over -> restart cycle (`gameState in {intro, playing, over}` with SPACE/ENTER transitions and `resetSession()`).
- [x] Uses at least THREE BGShared helpers (uses ten).
- [x] Uses at least TWO eegData channels (uses beta, attention, meditation mechanically + alpha cosmetically).
- [x] 90s palette (chromeGrey / neonPink / acidYellow / crtGreen / deepPurple / ink).
- [x] Pixel borders on frame (outer border via `drawPixelBorder`; intro/summary use `drawCrtPanel` via the shared panels).
- [x] NO emojis (verified — only ASCII and one `->` arrow).
- [x] Works with simulator only (reads `window.eegData` defensively via `BGShared.readEEG`; no fetch, no imports, no Muse calls).
- [x] `node --check` passes (see below).

Extras:
- Fixed-step march driven by `millis()` deltas (`marchInterval` scales with wave and with aliens-remaining so the swarm accelerates as it thins — classic Space Invaders feel, frame-rate independent).
- 3 tiers of chunky pixel-art aliens drawn from `rect()` composites (no sprite loading), bobbing every 18 frames.
- Combo bonus: each 3rd consecutive hit without a miss multiplies points x1.5; a bullet leaving the screen resets combo.
- Enemy fire cadence accelerates as the formation thins.
- Lives = 3; shield absorbs a single laser; screen-shake on hit; explosion particles on alien kill.
- Accuracy is reported in summary (kills / shotsFired; spread counts as 3 shots).

## node --check result

```
$ node --check /Users/kylemathewson/Brainimation/brainGames/games/Brainvaders.js
EXIT=0
```

(No stdout output; exit code 0 = syntactically valid.)

## Self-Assessment (Tripartite)

- **Craftsperson says:** The mechanics are cleanly mapped to the three required EEG channels with a clear, honest fourth (alpha = cosmetic, flagged as such). Firing cooldown is time-based (`millis()`), march is time-based (`millis()` delta with formation-thinning pace scaling), and all collision is rect-vs-rect so it will feel fair at any frame rate. Ten BGShared helpers are engaged for consistency with the rest of the brain-games suite. The file passes `node --check` and keeps strictly to top-level `function` statements for runner compatibility. Visual language is 90s-pixel-invader: pixel aliens from composite rects, chrome cannon, CRT scanline overlay modulated by alpha, acid-yellow bolts, neon-pink enemy lasers.

- **Skeptic says:** (1) I have not executed the game in the browser — `node --check` only validates parse, not runtime behaviour against the p5 + BGShared globals. A stray misspelling of a global API would manifest only at runtime. (2) Combo-reset on a projectile leaving the screen is triggered even when a spread shot lands 2 of 3 bolts — strictly speaking one missed shot in a spread breaks combo, which may feel punishing for a mechanic that is meant to *reward* high attention; might warrant "spread group" accounting. (3) Alien fire cadence is tuned by hand (`1800ms - min(1200, missing*40)`) and may be too generous or too cruel on contact; balance needs a live playtest. (4) Alpha is only cosmetic — a reviewer may argue a 4th channel should have mechanical weight; I flagged it clearly and kept the spec (3 channels) mechanical, but note this as an open design call for M3. (5) I did not implement the alternative "hitbox-shrink" attention variant; I documented the chosen "spread-shot" variant per the spec's "Pick ONE behaviour" clause. (6) Pixel-art aliens are drawn from rect() composites rather than a fully authentic 11x8 invader sprite — aesthetic is recognisable but not a pixel-perfect homage. (7) The `introTimer` decrements only inside `drawIntro`'s owning state — correct, but the countdown is pegged to `frameCount`-based rendering rather than wall-clock, so extremely slow devices will see a slower readiness bar; acceptable for the project but flagged.

- **Mover says:** These concerns are flagged, not blocking. The file is syntactically clean, matches the runner contract, keeps the BGShared surface well-used, covers three EEG channels mechanically, and is the only grid-formation invader-wave game in the project (distinctness confirmed). Shipping it now lets M3 surface any balance/runtime issues in integration, which is a faster loop than me speculating further here. If M3 wants the spread-combo-accounting or a mechanical alpha use, those are ~10-line follow-ups.

## Questions for Manager M3
- Should the alpha channel carry a *mechanical* weight (e.g. slow-time pulse when alpha is high) rather than purely cosmetic scanline intensity? Current implementation is cosmetic-only and documented as such.
- Should combo-reset be "per spread group" (3 bolts treated as one aim) rather than "per bolt that leaves the screen"? Current behaviour is per-bolt.
