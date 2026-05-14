# Agent 1811 Deliverables — Brain Games Launcher

Sub-package: self-contained 90s-cartridge-style brain-games launcher,
living at `/Users/kylemathewson/Brainimation/brainGames/`. Split-ready
for extraction into its own repo. Built by Coordinator 1811-C and four
Managers (M1 Foundation, M2 Shared Helpers, M3 New Games, M4
Integration).

## Top-level deliverables

| Path | Description |
|---|---|
| `brainGames/index.html` | Cartridge-deck picker page. Google Fonts (Press Start 2P + VT323), CRT scanlines, 3-light connection gate (Keyboard / Mouse / Brain), CONNECT MUSE + USE SIMULATOR buttons, 13-card grid built from the manifest. NO editor / Monaco / AI helper / docs / save. |
| `brainGames/play.html` | Game runner page. Reads `?game=<id>`, enforces a brain-source gate modal, mounts a p5 global-mode canvas below a 48px status bar with live ATT / MED readout. |
| `brainGames/styles/main.css` | Shared stylesheet. Palette: `#3b1f5a / #f7d51d / #ff4aa0 / #6cff83 / #c0c0c0`. Pixel frames, chrome-split title, NES-cartridge card labels, CRT overlay. |
| `brainGames/catalogue.json` | Human-curated category ordering + per-category blurbs + hardware/runner hints. |
| `brainGames/README.md` | Package overview, run-local instructions, how to add a game, EEG API surface. |

## Core plumbing (`brainGames/core/`)

| Path | Description |
|---|---|
| `core/eegData.js` | `window.eegData` global. Same shape as parent `index.html` (alpha/beta/theta/delta/gamma, raw[4], rawHistory{TP9,AF7,AF8,TP10}, historyLength, sampleRate, attention, meditation, connected, helpers). |
| `core/eegSimulator.js` | `window.EEGSimulator` — 20 Hz synthetic EEG. DOM-coupling stripped; optional `onUpdate(snapshot)` callback. |
| `core/museManager.js` | `window.MuseEEGManager` — real Muse bridge. Preserves all signal-processing math from the parent app; DOM-coupling replaced by `onLog` / `onStatus` callbacks. |
| `core/gameRunner.js` | `window.BrainGamesRunner = { load(gameId), stop(), ... }`. Fetches `games/<id>.js`, tracks new globals for clean teardown, spins up `new p5()` in global mode. |
| `core/pickerBoot.js` | Picker connection-gate state machine + manifest fetch + grid builder + shared 24 fps RAF loop for per-card canvas previews + PLAY-gating. Exposes `window.BrainGamesPicker`. |
| `core/playBoot.js` | URL `?game=<id>` parser, gate modal, simulator auto-start path, live ATT/MED readout. |
| `core/__smoke.html` | Node/browser-neutral smoke page — loads the 3 EEG scripts, starts the simulator, logs `alpha`/`beta`/`attention` once per second. |

## Shared helpers (`brainGames/shared/`) — `window.BGShared`

| Path | Description |
|---|---|
| `shared/styling90s.js` | `PALETTE`, `drawPixelBorder`, `drawScanlineOverlay`, `drawChromeText`, `blinker`, `fillVerticalGradient`, `drawCrtPanel`. |
| `shared/eegSmoothing.js` | `makeSmoother(n)`, `makeGraceBuffer({window, threshold})`, `readEEG({defaults})` (never throws). |
| `shared/hud.js` | `drawBar(x,y,w,h,val,label,col)`, `drawStatBox`, `drawResultOverlay({kind,text,sub,pts})`, `drawTopHud({eeg,score,time,palette})`. |
| `shared/intro.js` | `drawIntroPanel({title,blurb,mappings,introTimer,startHint})`, `drawSummaryPanel({title,stats,message,restartHint})`. |
| `shared/crowd.js` | `drawStadiumBackground({mode, time, palette})` (modes `court / field / green / range`), `drawCrowd` + `makeCrowd({seed})`, `drawScoreboard`. |

## Games (`brainGames/games/`) — 13 in manifest + test stub

### 3 new games (M3)

| Path | Description |
|---|---|
| `games/snakeFeast.js` | Grid-based classic Snake + pellets + score + self-collision. alpha = assist auto-steer toward pellet, beta = tick rate (5..18), attention > 0.6 doubles pellet value, meditation = halo alpha (cosmetic). |
| `games/ZenBreakout.js` | Paddle-ball-brick Breakout. meditation = paddle width (72..196), beta = ball speed, attention > 0.65 = cyan afterimage + 35% crit-break. 3 lives, wave progression. |
| `games/Brainvaders.js` | 5x8 grid Space-Invaders-style wave shooter. beta = cannon cooldown (900..120 ms), attention >= 0.6 = 3-shot spread, meditation > 0.55 = shield regen (absorbs one laser), alpha = cosmetic scanline pulse. 3 lives, combo x1.5. |

### 10 original games — copied byte-for-byte with JSDoc header added (M4 / I1)

GolfShooter, archeryShooter, bballShooter, soccerPenalty (Sports),
RowingCalm, balanceBeam, balloonPop, deepDiver (Calm),
mazeFocus, reactionRace (Focus). Originals at
`/Users/kylemathewson/Brainimation/games/*.js` are **unmodified**
(SHA-256 verified; `git diff` empty). The only change in each copy is
a prepended JSDoc metadata header.

### Auto-generated

| Path | Description |
|---|---|
| `games/manifest.json` | 13 entries. id / title / category / order / file / newGame / mappingOneLiner. Produced by `tools/build_manifest.py`. |

### Test stub

| Path | Description |
|---|---|
| `games/__sample.js` | Labelled "TEST ONLY". Drives a pulsing circle from `eegData.alpha`. Excluded from the manifest. |

## Tooling (`brainGames/tools/`)

| Path | Description |
|---|---|
| `tools/build_manifest.py` | stdlib-only scanner. Walks `brainGames/games/*.js`, parses `@id / @title / @category / @order / @newGame`, extracts `EEG mappings:` one-liner, sorts by (category, order, filename), writes `manifest.json`. Re-run after dropping in a new game. |

## Vendor bridge

| Path | Description |
|---|---|
| `vendor/muse-browser.js` | Byte-for-byte copy of `/Users/kylemathewson/Brainimation/muse-browser.js`. Used by `museManager.js` via `<script>` ordering in both HTML pages. |

## Coordinator artefacts

| Path | Description |
|---|---|
| `../coordinator/coordinator_log.md` | Iteration log T0..T5 and Final Assessment. |
| `../coordinator/manager_M1/manager_M1_report.md` | F1..F5 complete. All node --check green; Node smoke test of EEG core passes. |
| `../coordinator/manager_M2/manager_M2_report.md` | H1..H5 complete. `window.BGShared` API surface documented. |
| `../coordinator/manager_M3/manager_M3_report.md` | N1..N3 complete (snakeFeast, Brainvaders, ZenBreakout). Distinctness proven vs games/* and examples/*. |
| `../coordinator/manager_M4/manager_M4_report.md` | I1..I3 complete. Full 13-entry manifest pasted inline; SHA-256 preservation proof of the 10 I1 copies. |
| `../coordinator/manager_M*/sub_*_report.md` | Sub-subagent reports with node --check results and tripartite self-assessments. |

## Run locally

```bash
cd /Users/kylemathewson/Brainimation
python3 -m http.server 8000
# open http://localhost:8000/brainGames/
```

## Add a new game

1. Drop `myGame.js` into `brainGames/games/` with a JSDoc header
   containing `@id`, `@title`, `@category`, `@order`, `@newGame true`,
   and an `EEG mappings:` line.
2. Run `python3 brainGames/tools/build_manifest.py`.
3. Refresh the picker page.

## Acceptance results

- 26 / 26 `.js` files under `brainGames/` pass `node --check` (14 under
  `games/`, 6 under `core/`, 5 under `shared/`, 1 vendor copy).
- Manifest lists 13 / 13 expected ids; `newGame: true` on the three M3
  games only.
- Byte-for-byte preservation of `games/*.js`, `examples/*.js`,
  `index.html`, `muse-browser.js` verified via `git diff` (empty) and
  per-file SHA-256 (matches original byte streams after skipping each
  copy's prepended JSDoc header).
- No editor / Monaco / AI helper / docs / save UI anywhere in the
  brainGames package — grepped `pickerBoot.js` / `playBoot.js` /
  `index.html` / `play.html` / `main.css` for `monaco`, `editor`,
  `codeMirror`, `docs`, `save` — zero application-code hits.
- No emojis in UI text.
