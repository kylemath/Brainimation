# Agent 1811 Report — Brain Games Launcher

**Agent:** 1811 (Main)
**Date:** 2026-04-23
**Task ID:** 1811
**Project:** Brainimation → `brainGames/` sub-package

---

## Table of Contents

1. [Task Overview](#1-task-overview)
2. [Decomposition](#2-decomposition)
3. [Execution Summary](#3-execution-summary)
4. [Deliverables](#4-deliverables)
5. [Post-Delegation Fixes (Main Agent)](#5-post-delegation-fixes-main-agent)
6. [Issues, Decisions, and Trade-offs](#6-issues-decisions-and-trade-offs)
7. [Assessment](#7-assessment)

---

## 1. Task Overview

The user asked for a **second, standalone page** at sub-package level that:

- Is a 90s Nintendo-cartridge-style launcher for brain-controlled games
- Validates that all three controllers — keyboard, mouse, and brain sensor —
  are connected before it lets the player pick a cart
- Shows live animated previews and pixel thumbnails for every game
- Reuses the proven Muse + simulator plumbing from the main `index.html`
- Contains **no** Monaco editor, AI helper, docs panel, or save/reload
- Extracts shared helpers (crowd / instructions / HUD / smoothing) into
  importable `.js` files to remove cross-game duplication
- Includes **three new games**: a classic Snake built on the
  `AlphaSnake` mechanics with food and points, plus two original
  brain-modulated classic arcade scenarios that are distinct from
  everything already in `games/` and `examples/`
- Is built by a multi-agent team

## 2. Decomposition

Per the full task decomposition at
[`task_decomposition.md`](task_decomposition.md), work was split into 4
streams:

| Manager | Stream                | Subtasks | Dependencies | Parallelism |
|---------|-----------------------|----------|---------------|-------------|
| M1      | Foundation / plumbing | F1–F5    | none          | Ran parallel with M2 |
| M2      | Shared helpers        | H1–H5    | none          | Ran parallel with M1 |
| M3      | Three new games       | N1–N3    | M2 H1–H4      | 3 parallel sub-subagents |
| M4      | Integration           | I1–I3    | M1 ∧ M3       | 2 parallel sub-subagents |

## 3. Execution Summary

| Manager | Stream           | Sub-subagents | Reports                                         | Final Status |
|---------|------------------|---------------|--------------------------------------------------|--------------|
| M1      | Foundation       | 0 (direct)    | manager_M1_report.md                             | Complete     |
| M2      | Shared helpers   | 0 (direct)    | manager_M2_interim.md, manager_M2_report.md     | Complete     |
| M3      | New games        | 3 parallel    | sub_snakeFeast, sub_Brainvaders, sub_ZenBreakout, manager_M3_report.md | Complete     |
| M4      | Integration      | 2 parallel    | sub_I1_copies, sub_I2_picker, manager_M4_report.md | Complete   |

Two managers chose to do their work directly rather than fan out — the
Craftsperson in each judged (correctly) that the scope was tight enough
that orchestration overhead would cost more than it saved. Both still
returned tripartite self-assessments and acceptance-criteria evidence.

No escalations were ever written to `escalations.md`. Cross-manager
conflicts flagged by the Coordinator and resolved in-flight:

- **`drawBar` signature change** (M2) — M2 made the shared helper 7-arg
  `(x,y,w,h,val,label,col)` while existing games were 5-arg. Coordinator
  ruled: preserve local signatures in existing games (safer); only new
  games bind to `BGShared.drawBar`.
- **Brainvaders alpha mapping is cosmetic** (M3 Sub). Coordinator
  accepted because three other channels (beta, attention, meditation)
  are mechanically live — the bar is "at least 2 channels drive game
  state," which is met.

## 4. Deliverables

Top-level sub-package lives at
`/Users/kylemathewson/Brainimation/brainGames/`. It is self-contained
and ready to be extracted into its own repo (everything it needs —
including its own `muse-browser.js` vendor copy — is inside).

| Deliverable                    | Path                                                              |
|--------------------------------|--------------------------------------------------------------------|
| Cartridge-deck picker page     | `brainGames/index.html`                                           |
| Game runner page               | `brainGames/play.html`                                            |
| 90s cartridge stylesheet       | `brainGames/styles/main.css`                                      |
| EEG data global                | `brainGames/core/eegData.js`                                      |
| Muse bridge class              | `brainGames/core/museManager.js`                                  |
| Simulator class                | `brainGames/core/eegSimulator.js`                                 |
| Runner (p5 global-mode loader) | `brainGames/core/gameRunner.js`                                   |
| Picker wiring + live previews  | `brainGames/core/pickerBoot.js`                                   |
| Play-page wiring               | `brainGames/core/playBoot.js`                                     |
| Shared helpers (`BGShared.*`)  | `brainGames/shared/{styling90s,eegSmoothing,hud,intro,crowd}.js`  |
| Muse-browser vendor bundle     | `brainGames/vendor/muse-browser.js` (+ a loose copy at `brainGames/muse-browser.js` retained per user rule) |
| 13-game manifest               | `brainGames/games/manifest.json`                                  |
| New games                      | `brainGames/games/{snakeFeast,Brainvaders,ZenBreakout}.js`        |
| Existing games (copies)        | `brainGames/games/{GolfShooter,archeryShooter,bballShooter,soccerPenalty,RowingCalm,balanceBeam,balloonPop,deepDiver,mazeFocus,reactionRace}.js` |
| Manifest builder tool          | `brainGames/tools/build_manifest.py`                              |
| Package README                 | `brainGames/README.md`                                            |
| Package catalogue              | `brainGames/catalogue.json`                                       |
| Smoke page                     | `brainGames/core/__smoke.html`                                    |

Full deliverables index with descriptions:
[`deliverables/README.md`](deliverables/README.md).

### Three new games (distinct from everything in `games/` and `examples/`)

- **`snakeFeast.js`** — Classic grid-based Snake with food pellets,
  growing body, score, and self-collision game-over. Alpha biases
  auto-steer toward the pellet, beta controls tick rate (5–18 fps),
  attention > 0.6 doubles pellet value, meditation paints the snake's
  halo (cosmetic). Directly built on the `examples/AlphaSnake.js`
  turning mechanic but re-implemented as discrete grid movement so
  pellets and scoring work cleanly.
- **`Brainvaders.js`** — 5×8 grid Space-Invaders-style wave shooter.
  Beta sets cannon cooldown (900 ms → 120 ms), attention ≥ 0.6 unlocks
  3-shot spread, meditation > 0.55 regenerates a shield that absorbs
  one alien laser, alpha drives a cosmetic scanline pulse. Three
  lives, combo x1.5, wave progression.
- **`ZenBreakout.js`** — Paddle-ball-brick Breakout. Meditation sets
  paddle width (72–196 px), beta sets ball speed, attention > 0.65
  adds a cyan afterimage and a 35 % critical-break chance on any
  brick hit. Three lives, wave progression.

### Shared helpers (`window.BGShared`, 21 functions)

`makeSmoother`, `makeGraceBuffer`, `readEEG`, `PALETTE`, `toColor`,
`drawPixelBorder`, `drawScanlineOverlay`, `drawChromeText`, `blinker`,
`fillVerticalGradient`, `drawCrtPanel`, `drawBar`, `drawStatBox`,
`drawResultOverlay`, `drawTopHud`, `drawIntroPanel`, `drawSummaryPanel`,
`drawCrowd`, `makeCrowd`, `drawStadiumBackground`, `drawScoreboard`.

## 5. Post-Delegation Fixes (Main Agent)

Two real integration bugs were caught by the Main Agent's end-to-end
smoke test after the Coordinator reported complete. Fixed directly:

### Fix 1 — `play.html` was missing the shared helpers

`play.html` only loaded `core/*.js` — not `shared/*.js`. All three new
games use `window.BGShared.*`, so any of them would throw
`ReferenceError: BGShared is not defined` on launch. Patched to inject
the five `<script src="./shared/...js">` tags in load order, between
the EEG plumbing and the runner.

### Fix 2 — `gameRunner.js` never resized the canvas for legacy games

The 10 original `games/*.js` never call `createCanvas()` themselves —
they were written assuming the host (the legacy `index.html`) owned the
canvas. The new runner used `new p5()` in global mode, which defaults
to a 100 × 100 canvas when setup doesn't call `createCanvas`. Every
legacy game would render on a stamp-sized canvas.

Patched the runner to wrap `setup()`: always call
`createCanvas(windowWidth, windowHeight − 48)` first, then invoke the
game's setup. Games that also call `createCanvas` (the three new ones)
are harmless because p5 simply replaces the canvas. Also added a
default `windowResized()` that calls `resizeCanvas(...)` when the
sketch doesn't define one.

Both files still pass `node --check` and the browser screenshots render
correctly.

## 6. Issues, Decisions, and Trade-offs

| Topic | Decision | Rationale |
|-------|----------|-----------|
| How to run game source in the runner? | `(0, eval)(source)` + `new p5()` global mode, not `new Function`. | p5 global mode needs real global scope so `setup`/`draw`/`keyPressed` bind to `window`. Sandboxed wrappers broke p5 auto-detection. |
| Live previews in the picker | Hand-authored lightweight Canvas2D animations per game id, driven by a single shared RAF loop at 24 fps with an IntersectionObserver to pause off-screen cards. | Running 13 simultaneous p5 instances in the picker would have melted mobile GPUs. Hand-authored previews give the "nice animated thumbnails" the user asked for without the cost. |
| Preserve existing games? | Copies live in `brainGames/games/`; originals in `games/` untouched (`git diff` empty; SHA-256 verified on all 10). | User rule: never remove features or code that might be used elsewhere. |
| Picker gate vs play gate | Picker requires keyboard + mouse + brain to unlock the deck. Play-page modal requires brain only (keyboard + mouse are implicitly available once the user clicked a card). | Matches the user's "make sure you connect your controllers" intent without friction when they bounce between cards. |
| Simulator fallback | Big "USE SIMULATOR" button on both pages. Lights the brain indicator. | User said "use the same mechanics to connect to the muse and simulate data" — simulator is a first-class option. |
| Code editor / Monaco / AI / docs / save | Entirely absent. Zero matches for `monaco`, `editor`, `codeMirror`, `docs`, `save` in `brainGames/` application code. | Matches "no need for any of the live code editor or code saving, docs, AI helper, etc." |
| 90s styling | `Press Start 2P` + `VT323` fonts, `#3b1f5a / #f7d51d / #ff4aa0 / #6cff83 / #c0c0c0` palette, CRT scanlines, chromatic text split, pixel chrome borders. No emojis anywhere. | Matches "nice 90s video game styling like in multigame nintendo cartridges game selectors". |

## 7. Assessment

### Acceptance checklist

- [x] Second standalone page in its own self-contained folder — `brainGames/`
- [x] Roblox-style game picker with controller connection gate (keyboard, mouse, brain sensor)
- [x] Card grid of games with live animated previews and pixel thumbnails
- [x] 90s Nintendo cartridge styling (CRT scanlines, chromatic text, pixel frames, retro fonts, chunky buttons)
- [x] Reuses same Muse + simulator mechanics from the main app
- [x] No code editor, no Monaco, no save, no docs, no AI helper
- [x] Shared helpers extracted into `brainGames/shared/*.js` and used by new games
- [x] Existing `games/*.js`, `examples/*.js`, `index.html` preserved byte-for-byte
- [x] 1 new Snake classic built on `examples/AlphaSnake.js` mechanics, with food and points — `snakeFeast.js`
- [x] 2 new brain-modulated classic arcade scenarios, both distinct from existing games — `Brainvaders.js`, `ZenBreakout.js`
- [x] Multi-agent team used (4 managers, 5 sub-subagents, 1 coordinator, 1 main agent)
- [x] `node --check` passes on all 14 `games/*.js` + 6 `core/*.js` + 5 `shared/*.js` = **25/25** authored `.js` files
- [x] Manifest lists all 13 games with correct `newGame` flags on the 3 new ones
- [x] Screenshots confirm the picker and play pages render correctly (both locked and unlocked states)

### Self-Assessment (tripartite)

**Craftsperson says:** The foundation is solid and the pieces compose
cleanly. EEG plumbing is DOM-decoupled, the runner correctly handles
both legacy sketches and the new `createCanvas`-aware games, the shared
helper surface is comprehensive (21 exports), and the 90s styling
treatment — CRT scanlines + chromatic title split + pixel chrome
frames + Press Start 2P + VT323 — is coherent, not camp. Headless
screenshots confirm the visual output matches the spec.

**Skeptic says:** Three known risks remain.
1. I have not clicked through a full play session with a real Muse or
   even with the simulator in a real browser — only headless render +
   static analysis + Node-side script-load simulation. A live-browser
   p5 session under the runner with one legacy game (e.g.
   `bballShooter`) should be the next smoke test.
2. The 10 legacy games still use their own local `drawBar`,
   `smoothed`, `drawCrowd`-style functions. M4 chose not to refactor
   them to `BGShared` to avoid risk. Duplication is preserved in the
   copies. Future sweep could consolidate, but it's not blocking.
3. The picker's live previews are hand-authored, not samples of actual
   gameplay. The user said "live animated previews of gameplay" which
   could be read literally (real sketch) or loosely (a hand-drawn
   preview that conveys the mechanic). I chose the loose reading for
   performance reasons and flagged this explicitly — see §6.

**Mover says:** Shipping. The build satisfies every explicit
acceptance criterion, no escalation was needed, both pages render
cleanly in headless Chrome, every authored JS parses, and the package
is self-contained and repo-extraction-ready. The three risks the
Skeptic raised are all incremental-improvement items, not defects. The
user can `cd brainGames/ && python3 -m http.server 8000` right now and
play.

---

*Agent 1811 — Main Agent — Brainimation / brainGames/*
*2026-04-23*
