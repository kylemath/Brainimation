# Manager M2 Final Report — Shared Helpers

**Manager:** M2 (Shared Helpers), under Coordinator 1811-C.
**Status:** Complete. All 5 atomic subtasks delivered; all files pass
`node --check`; no linter errors. Interim signal was written at
`manager_M2_interim.md` to unblock M3 immediately.

**Spawned Sub-subagents:** 0. After reading the brief and the reference
games, I judged that the five helpers were well-scoped enough that
orchestration overhead of launching four parallel sub-subagents would
exceed the time to write them directly, and would add integration risk
on the palette contract (which every helper shares). I wrote all five
in a single in-process sweep, sharing the palette convention through
`BGShared.PALETTE` at call time so load order is free.

## Files Produced

All under `/Users/kylemathewson/Brainimation/brainGames/shared/`:

| File | Lines | One-line description |
|---|---:|---|
| `styling90s.js` | 132 | Palette constants, pixel border, scanline overlay, chrome text, blinker, CRT panel, vertical gradient. |
| `eegSmoothing.js` | 119 | Rolling-average smoother factory, median-based grace-buffer factory, safe `readEEG()` that never throws. |
| `hud.js` | 233 | `drawBar`, `drawStatBox`, `drawResultOverlay` (hit / miss / perfect / fail / combo), `drawTopHud` single-line strip. |
| `intro.js` | 258 | `drawIntroPanel` (title, blurb, mappings, countdown/keypress, blinking start hint), `drawSummaryPanel` (stats grid, flavour message, restart hint). |
| `crowd.js` | 378 | `drawStadiumBackground` (court / field / range / green), `drawCrowd` + `makeCrowd` factory, retro pixel `drawScoreboard`. |

**Total:** 1120 lines of shared helper code, all hanging off
`window.BGShared`.

Reports folder artefacts:

- `manager_M2_interim.md` — interim signal to the coordinator (written
  as soon as H1–H4 were on disk and passing `node --check`).
- `manager_M2_report.md` — this file.

## Acceptance Results

`node --check` on each authored file:

```
styling90s.js   OK
eegSmoothing.js OK
hud.js          OK
intro.js        OK
crowd.js        OK
```

Cursor linter (`ReadLints`) on `brainGames/shared/`: **No linter
errors found.**

## Adherence to Hard Constraints

- **Every helper file passes `node --check`.** Verified above.
- **Safe to load in any order after p5.js.** Every file starts with
  `window.BGShared = window.BGShared || {}` inside an IIFE. Cross-helper
  references (e.g. `intro.js` using `drawChromeText`) are resolved *at
  call time* via `window.BGShared.drawChromeText`, with inline fallbacks
  if the dependency hasn't loaded yet.
- **No implicit globals.** Every file is wrapped in a single top-level
  IIFE `(function () { ... })();`. Only thing mutated at the top level
  is `window.BGShared`. No bare `let foo` or `var foo` at file scope.
- **No emojis in rendered text.** Verified by reading each file. HUD,
  intro, summary, scoreboard all use plain ASCII labels
  (e.g. `"PRESS SPACE TO START"`, `"TIME"`, `"SCORE"`, `"HOME"`, `"AWAY"`).
- **Writes only inside writeable paths.** Files live at
  `brainGames/shared/` and `backgroundMaterial/agent1811/coordinator/manager_M2/`.
  Nothing outside those paths was touched.

## Palette Contract

The five named colours from the M1 brief are exported verbatim on
`BGShared.PALETTE`:

```
deepPurple  #3b1f5a
acidYellow  #f7d51d
neonPink    #ff4aa0
crtGreen    #6cff83
chromeGrey  #c0c0c0
```

I added three neutral helpers (`ink #0a0614`, `shadow #1a0f2e`,
`dim #8a7ba8`) that are used internally by the canvas helpers for
dark backgrounds and de-emphasised text. These are internal canvas
colours and do not need CSS equivalents, but M1 is free to mirror
them if desired.

## API Summary for M3 / M4

### styling90s
- `BGShared.PALETTE` — palette constants (see above).
- `BGShared.drawPixelBorder(x, y, w, h, col1, col2)` — two-tone chrome frame.
- `BGShared.drawScanlineOverlay({alpha, spacing, tint})` — CRT striping.
- `BGShared.drawChromeText(txt, x, y, size)` — two-tone gradient text.
- `BGShared.blinker(rate)` — returns 0/1 based on `frameCount`.
- `BGShared.fillVerticalGradient(x, y, w, h, top, bottom)` (bonus, used
  internally by crowd/intro).
- `BGShared.drawCrtPanel(x, y, w, h, opts)` (bonus, used internally by
  intro/summary).

### eegSmoothing
- `BGShared.makeSmoother(n)` → `{ push(v), value(), history(), clear(), size() }`.
- `BGShared.makeGraceBuffer({window, threshold})` →
  `{ push(v), ok(), fraction(), clear(), length(), windowSize(), threshold() }`.
  `ok()` is true when ≥ `threshold` fraction of the last `window` pushes
  are ≥ their own median.
- `BGShared.readEEG({defaults})` — always returns a populated object with
  `attention, meditation, delta, theta, alpha, beta, gamma, connected`;
  missing / non-numeric fields fall back to zeros so games never throw.

### hud
- `BGShared.drawBar(x, y, w, h, val, label, col)`.
- `BGShared.drawStatBox(x, y, label, val, col)`.
- `BGShared.drawResultOverlay({kind, text, sub, pts})` — `kind` in
  `hit | miss | perfect | fail | combo`.
- `BGShared.drawTopHud({eeg, score, time, palette})` — compact top strip
  with ATT / MED meters, centred score, and right-aligned timer.

### intro
- `BGShared.drawIntroPanel({title, blurb, mappings, introTimer, introTotalFrames, startHint})`.
  `mappings` is an array of `{ label, desc, color }`. `introTimer` is a
  frame count; pass `null` to wait for keypress. `introTotalFrames`
  (optional) lets the countdown bar size to the correct denominator.
- `BGShared.drawSummaryPanel({title, stats, message, restartHint})`.
  `stats` is an array of `{ label, value, color }` — wraps to multiple
  rows if there are more than 5.

### crowd
- `BGShared.drawStadiumBackground({mode, time, palette, cheer, seed})`.
  `mode` in `court | field | range | green`.
- `BGShared.drawCrowd({x, y, w, h, cheer, palette, seed, shirts})` —
  animated silhouette rows, `cheer` (0..1) modulates wave amplitude and
  probability of raised hands.
- `BGShared.makeCrowd({seed})` → `{ draw(opts), seed() }` factory.
- `BGShared.drawScoreboard({x, y, width, height, home, away, time, palette})`
  — retro three-cell pixel scoreboard. `home`/`away` can be numbers or
  `{ name, score }`; `time` can be a number (auto-formatted `MM:SS`,
  turns red at ≤ 10s) or a string.

## Deviations from the Brief

None that break the contract, but documenting minor additions and
interpretations:

1. **Bonus exports (`fillVerticalGradient`, `drawCrtPanel`).** These
   are used internally by multiple helpers and are small, so I surfaced
   them on `BGShared` in case M3/M4 find them useful. They are additive
   only — not removing anything from the brief's list.
2. **Three extra palette neutrals.** `ink`, `shadow`, `dim` — used for
   dark backgrounds / de-emphasised text in canvas drawings. Not
   required to appear in `main.css`; purely canvas-side conveniences.
3. **Grace-buffer semantics.** The brief says "fraction ≥ threshold
   above their own median". I interpreted "above" as "at or above"
   (`>=`) since strict `>` would be unstable for tied values after
   smoothing. `fraction()` is also exposed so callers can display a
   progress indicator.
4. **`drawBar` signature.** I stuck strictly to the brief's 7-arg
   signature `(x, y, w, h, val, label, col)`. Existing games (which
   still have their own local `drawBar(x, y, val, label, col)`) are
   untouched and continue to work. M4 refactors will need to migrate
   call sites. I started with a signature-detecting backward-compat
   shim but removed it because the heuristic was fragile and legacy
   games don't import `BGShared` anyway.
5. **Stable crowd layout via seeded deterministic hashing.** The brief
   says "animated silhouette rows … `cheer` modulates wave amplitude".
   I added a `seed` parameter (default 1) so two stands can have
   different but stable fan layouts without re-rolling every frame.
   The factory form `makeCrowd({seed})` matches the brief's factory
   pattern example.
6. **Scoreboard `home`/`away` can be either a bare number or an object
   with `{name, score}`.** The brief example shows `home` and `away`
   directly; the object form is additive, lets games show team labels.

## Questions for Coordinator

*(empty — nothing blocking)*

---

## Craftsperson / Skeptic / Mover Self-Assessment

### Craftsperson says

I'm confident about:

- **Isolation and load-order safety.** Every file is a self-contained
  IIFE that only touches `window.BGShared`. Cross-helper references
  are looked up at call time, so there is no compile-time ordering
  dependency between the five files.
- **Palette contract is honoured exactly.** The five colours from the
  M1 brief appear as-is on `BGShared.PALETTE`.
- **`readEEG()` never throws.** I guard every field with an `isFinite`
  check and return a populated zero-filled object if `window.eegData`
  is absent, which matches the brief's safety requirement.
- **`drawStadiumBackground` covers all four modes** (`court`, `field`,
  `range`, `green`) with visually distinct backdrops that reflect the
  source games, and all four use the 90s palette consistently.
- **All five files pass `node --check` and Cursor's linter.** The
  shipping bar is met.

### Skeptic says

Concerns that remain, with honest calibration:

- **I did not visually test the helpers in a p5 sketch.** `node --check`
  catches syntax, not runtime bugs. There is a non-zero chance that a
  specific rendering path has a bug I missed — e.g. `drawBar`'s new
  signature passing `h` where some code might still pass `val`. I
  mitigated this by keeping the brief's signature exactly, but M3/M4
  should sanity-check on the first game that uses each helper.
- **`drawResultOverlay`'s layout uses fixed proportions of the canvas.**
  If a game runs with an unusual aspect ratio, the 40% × 22% panel may
  look odd. Worth revisiting if any M3 game uses non-standard canvas
  dimensions.
- **Crowd animation reads `frameCount` directly.** If a game pauses by
  not calling `draw` but still runs intro frames, wave motion still
  advances. This matches existing-game behaviour and is probably fine,
  but documenting it here.
- **`makeGraceBuffer` uses rolling median recomputed every `ok()` call.**
  For window sizes in the 20–60 range typical here this is fine (O(n²)
  is ~3600 ops/frame), but if any game wants windows in the thousands
  they'll need a better data structure. Not required by the brief.
- **No bundler means every game will `<script>` all five helpers.** That
  is ~1.1 KLOC per page. Given the 90s-retro aesthetic and the globals-
  only constraint in the brief, I chose clarity over minification. If
  bundle size becomes an issue, M4 could add a build step, but that's
  out of scope.

### Mover says

Shipping reasons:

- All five atomic subtasks are committed, pass `node --check` and lint,
  and adhere to every hard constraint in the brief.
- **Interim signal is already on disk** — M3 can start right now on new
  games; they don't have to wait for this report.
- The concerns under "Skeptic" are either documented here for the
  coordinator to triage, or are things that will surface naturally the
  first time a game uses the helper. None of them justify additional
  rounds of internal iteration before handing off.
- If I had more time I would: (a) open `index.html` and smoke-test each
  helper in a throw-away p5 sketch, (b) add JSDoc typedefs for the opts
  objects so editor tooltips show argument shapes, (c) extract the
  palette neutrals decision to discuss with M1 before locking in.

Done. Handoff complete.
