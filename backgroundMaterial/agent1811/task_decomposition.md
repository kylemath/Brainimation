# Task Decomposition — Agent 1811

## Original Task (User, verbatim)

> I would like to make a second page in its own repo with only the .js
> examples in `games/` as a stand alone brain game webpage like roblox
> game picker which makes sure you connect your controllers (keyboard,
> mouse, and brain sensor). And then lets you pick between cards for
> each of the games showing live animated previews of gameplay and nice
> thumbnails. Show nice 90s video game styling like in multigame nintendo
> cartidges game selectors, use the same mechanics to connect to the muse
> and simulate data, but no need for any of the live code editor or code
> saving, docs, AI helper, etc, etc. Use a multiagent team.
>
> You will notice as you look through the examples in `games/` there are
> is some code repitition like the crowd and instruction styling, so pull
> out helper `.js` files for these resources and assets that are used
> across games. Create two of your own variations on these game themes
> that allow the player to use their brain waves to modulate game play in
> classic game scenarios rethought, different from the existing examples.
> Include a third game using the mechanics of `examples/AlphaSnake.js` but
> including the food and points for the snake, etc.

## Interpretation

Build a **self-contained** sub-package at `brainGames/` that can later be
split into its own repo. The package must:

1. Provide a **standalone launcher page** styled like a 90s Nintendo
   multi-cart menu / Roblox game picker. Each game is a "cart card" with:
   - A pixel-art style thumbnail
   - A live animated preview of gameplay (snippet of the actual game, or
     a simpler loop that hints at the mechanic)
   - Title, EEG mapping one-liner, and category
2. Before play is allowed, verify that each required controller is
   connected:
   - Keyboard (detected on first keydown)
   - Mouse (detected on first mousemove/click)
   - Brain sensor (Muse connected, or simulator running)
   A "Connection Gate" must show status of all three and only unlock the
   game grid when all three are connected (or user explicitly chooses
   "Play without brain sensor — simulator" to fall back to simulated
   data).
3. Reuse the proven Muse connect/disconnect logic and the 20Hz simulator
   from `index.html`. Both expose a global `eegData` object with
   `attention`, `meditation`, `alpha/beta/theta/delta/gamma`,
   `rawHistory`, etc. — the same API every game already expects.
4. Include **no** code editor, no Monaco, no AI helper, no docs panel,
   no code-save/reload. The launcher page is purely a picker + status.
5. **Extract shared helpers** into `brainGames/shared/*.js` — at minimum
   stadium/crowd drawing, intro/summary overlays, HUD bar meters, and
   EEG smoothing / grace buffers. New games use the helpers. Existing
   games are **preserved byte-for-byte** (per user rule: never remove
   features / code that might be used elsewhere) — however a refactored
   copy lives in `brainGames/games/` that uses the helpers.
6. Include **three new games**:
   - `snakeFeast.js` — classic snake built on `examples/AlphaSnake.js`
     mechanics, with food pellets, growing body, score, game-over on
     self-collision. Alpha waves influence turning smoothness; beta
     influences speed; attention multiplies food value.
   - **New variation #1** — a classic arcade scenario rethought with
     brain-wave control. Agent picks the theme (e.g. Brainvaders /
     Zen Breakout / Focus Tetris) as long as it is **distinct from every
     existing `games/*.js` and `examples/*.js`**.
   - **New variation #2** — a second classic arcade scenario, also
     distinct from existing games and from variation #1.
7. Provide tooling:
   - `brainGames/tools/build_manifest.py` scans `brainGames/games/` and
     regenerates `brainGames/games/manifest.json` so adding a game is a
     drop-in.
   - `brainGames/README.md` explains the package, how to run it locally,
     and how to add a game.
   - `brainGames/catalogue.json` mirroring the existing style.

## Atomic Subtasks

### Foundation (F)
- **F1**: Extract `eegData` global + `MuseEEGManager` + `EEGSimulator`
  from `index.html` into `brainGames/core/eegData.js`,
  `brainGames/core/museManager.js`, `brainGames/core/eegSimulator.js`.
  Strip all logger/UI-panel coupling so they don't need a DOM panel
  layout to run. Emit status events via a minimal event emitter instead.
- **F2**: Build `brainGames/core/gameRunner.js` — given a game id, load
  the matching `.js` file from `games/<id>.js`, instantiate a p5 sketch
  with the usual `setup()/draw()/keyPressed()` globals exposed the same
  way as `index.html` does it, and provide a centred responsive canvas.
- **F3**: Build `brainGames/index.html` — picker page. 90s cartridge
  styling. Shows three connection status lights (keyboard/mouse/brain)
  with a "Connect Muse" button and a "Use simulator" fallback.
- **F4**: Build `brainGames/play.html` — game runner page. Takes the
  game id from `?game=<id>` and runs it via gameRunner.js with the same
  connection gate. Includes a scanline / CRT overlay to reinforce the
  90s vibe.
- **F5**: Copy / reference `muse-browser.js` so it is reachable from
  `brainGames/`.

### Shared helpers (H)
- **H1**: `brainGames/shared/crowd.js` — `drawStadiumBackground(opts)`,
  `drawCrowd(opts)`, `drawScoreboard(opts)` distilled from
  `bballShooter`, `archeryShooter`, `soccerPenalty`, `GolfShooter`.
- **H2**: `brainGames/shared/intro.js` — `drawIntroPanel({title, blurb,
  mappings, introTimer, startHint})` and
  `drawSummaryPanel({title, stats, message, restartHint})`.
- **H3**: `brainGames/shared/hud.js` — `drawBar(x,y,val,label,col)`,
  `drawStatBox(x,y,label,val,col)`, `drawResultOverlay({kind, text,
  sub, pts})`.
- **H4**: `brainGames/shared/eegSmoothing.js` — `makeSmoother(n)`,
  `makeGraceBuffer({window, threshold})` — closure-based so each game
  instance has its own history (avoids the implicit globals in the
  originals).
- **H5**: `brainGames/shared/styling90s.js` — CSS + helper functions for
  pixel borders, scanlines, chrome-text title treatment, blinking
  "PRESS START" text. Exported as JS so both picker and runner share it.

### New games (N)
- **N1**: `brainGames/games/snakeFeast.js` — snake + food + score.
  Alpha waves bias turning direction toward pellet; beta sets speed;
  attention doubles pellet value when above 0.6; self-collision = game
  over; summary shows length, score, best focus streak.
- **N2**: **First original brain-modulated classic**. Propose a concrete
  game, implement it, and document EEG mapping in a header comment.
  Must be clearly distinct from anything in `games/` or `examples/`.
- **N3**: **Second original brain-modulated classic**. Same rules as N2
  and distinct from N2.

### Integration (I)
- **I1**: Copy each existing `games/*.js` into `brainGames/games/` and
  refactor to use the shared helpers where it does not change behaviour.
  If a refactor is risky, leave the file unchanged. Originals in
  `games/` are not modified.
- **I2**: Build the picker grid. Each card is generated from
  `games/manifest.json` entries. Each card runs a small p5 instance or
  canvas loop showing an animated preview. Clicking a card opens
  `play.html?game=<id>` once the connection gate is green.
- **I3**: Wire `build_manifest.py`, populate `manifest.json`,
  `catalogue.json`, `README.md`. Smoke-test via local static server.

## Dependency Graph

```
F1 (EEG core) ─┬─> F2 (gameRunner) ─┬─> F4 (play.html) ──┐
               └──────────────────> F3 (index.html picker) ─> I2 picker grid
                                                           └─> I3 manifest + docs
H1..H5 (helpers, independent) ──┬─> N1/N2/N3 (new games) ──> I1/I2
                                └──────────────────────────> I1 (refactor existing games)
```

F must finish before F4/I2 can wire up. H can run in parallel with F.
N depends on H finishing. I depends on everything else finishing.

## Stream Allocation

| Manager | Stream Type | Subtasks        | Dependencies    | Async? |
|---------|-------------|-----------------|-----------------|--------|
| M1      | serial-first | F1, F2, F3, F4, F5 | None         | Starts immediately |
| M2      | parallel    | H1, H2, H3, H4, H5 | None         | Starts immediately |
| M3      | parallel    | N1, N2, N3         | Needs M2 helpers | Starts after M2 core helpers land (H1+H2+H3+H4 minimum) |
| M4      | serial      | I1, I2, I3         | Needs M1 and M3 | After M1 + M3 |

Scaling: Medium-large task (16 atomic subtasks). Per skill table: 3–4
managers with 2–4 sub-subagents each. M2 and M3 fan out to 4–5 and 3
sub-subagents respectively.

## Key Constraints / Gotchas

1. **Do not modify existing `games/*.js`, `examples/*.js`, or
   `index.html`.** Copies live in `brainGames/games/`.
2. **Do not remove features** from the existing app. The original
   simulator/Muse manager can be read for extraction but not relocated.
3. Each game file currently relies on **implicit globals** (`gameState`,
   `attHist`, etc.) because it is evaluated inside the main sketch
   closure. When run via the new `gameRunner`, each game must still be
   evaluated in its own closure so its globals don't collide across
   reloads. The runner should wrap the game source in a
   `new Function('p5ctx', source)` or similar and pass the p5 instance.
4. Games declare global `setup()`, `draw()`, `keyPressed()`,
   `keyReleased()` etc. The existing app uses p5 in global mode. The
   runner page can likewise use global-mode p5 and load the game script
   fresh on each visit.
5. The UI must feel 90s: CRT scanlines, chunky pixel borders, blocky
   colour gradients, retro monospace fonts (VT323 / Press Start 2P from
   Google Fonts is OK), chiptune-style palette. Keep animation GPU-cheap.
6. Connection gate must be bypassable with the simulator but must still
   demand keyboard + mouse detection. This ensures the controller
   detection feels real without blocking users without a Muse.

## Complexity Estimate

**Medium-large.** ~2500–3500 new lines of JS + HTML + CSS + Python tools
across ~20 files. Main risks: (a) game-source global-scope collisions in
the runner, (b) picker card live-previews consuming too much GPU if
every preview runs a full p5 instance, (c) 90s styling feeling cheap
rather than charming. Budget: significant — this is why we orchestrate.

---

*Agent 1811 — Main Agent* *2026-04-23*
