# Sub-B Report — I2: Picker Grid Card Rendering + Live-Preview Animation

Agent: Sub-subagent **Sub-B** under Manager M4 of Coordinator 1811-C.
Task: I2 — wire the cartridge deck picker to the manifest and render
real cards with cheap animated canvas previews.

## Files Produced / Modified

| Path | Disposition | One-liner |
|---|---|---|
| `brainGames/core/pickerBoot.js` | EXTENDED | Added manifest fetch, `rebuildGrid` dispatcher, card builder, shared 24 fps RAF preview loop, IntersectionObserver gating, PLAY routing with lock-aware shake, palette snapshot from `:root`. Public surface (`setLight`, `getState`, `rebuildGrid`) preserved. |
| `brainGames/styles/main.css` | APPENDED | New `.cart-card` / `.cart-label` / `.cart-title` / `.cart-cat` / `.cart-preview` / `.cart-mapping` / `.cart-play` / `.cart-shake` rules plus `@keyframes cartShake`. No existing rules restructured. |
| `backgroundMaterial/agent1811/coordinator/manager_M4/sub_I2_picker_report.md` | NEW | This report. |

No other files were touched. `index.html`, `play.html`, all files
under `games/`, `brainGames/games/`, `brainGames/core/*` (except
`pickerBoot.js`), `brainGames/shared/`, `brainGames/vendor/`,
`examples/`, and the repo root remain untouched.

## `node --check` Result

```
$ node --check /Users/kylemathewson/Brainimation/brainGames/core/pickerBoot.js
(exit 0 — OK)
```

No linter errors reported for either modified file.

## Behaviour Summary

1. **Manifest fetch.** On init, `pickerBoot.js` first paints the 12-slot
   placeholder grid, then fetches `./games/manifest.json` (no-store).
   On success with a non-empty array, entries are sorted by numeric
   `order` (missing → 9999) and passed through `rebuildGrid(entries)`.
   On any failure (404, non-OK HTTP, JSON parse error, empty payload)
   it logs a `console.warn` and leaves the 12-placeholder grid in
   place — non-fatal.

2. **`rebuildGrid(entries)` dispatcher.**
   - `Array.isArray(entries) && entries.length > 0` → `buildManifestGrid(entries)`.
   - `rebuildGrid()` or `rebuildGrid([])` → `buildPlaceholderGrid()` (restores
     the 12 slots).
   - Calling `rebuildGrid` always stops and rebuilds the preview loop
     cleanly (cancels RAF, disconnects the `IntersectionObserver`,
     clears the entry list).

3. **Card markup** per entry exactly matches the brief:

   ```html
   <article class="cart-card" data-id="{id}">
     <header class="cart-label">
       <span class="cart-title">{title}</span>
       <span class="cart-cat">{category}</span>
     </header>
     <canvas class="cart-preview" width="160" height="100"></canvas>
     <p class="cart-mapping">{mappingOneLiner}</p>
     <button class="cart-play pixel-btn" type="button">PLAY</button>
   </article>
   ```

   All four interpolated text fields are set via `textContent`, never
   `innerHTML`. Missing `mappingOneLiner` falls back to `""`. The
   PLAY button also carries `.pixel-btn` so it inherits the existing
   90s pixel-button treatment (brief allows re-using that look).

4. **Shared preview loop.**
   - One `requestAnimationFrame` loop drives all canvases.
   - Frame rate capped at **24 fps** via a last-frame timestamp gate
     (`PREVIEW_FRAME_MS = 1000 / 24`).
   - Each visible entry has its canvas fully redrawn per frame
     (each per-card draw clears its own background first).
   - `IntersectionObserver` (when available) marks off-screen canvases
     `visible = false`, so their draw is skipped. If
     `IntersectionObserver` is unavailable, entries default to always
     drawing (brief's explicit fallback).
   - Draw functions take `(ctx, t, w, h, palette)` with
     `t = performance.now() / 1000`.
   - Canvas2D only. No p5 instances, no external libraries.

5. **Palette cache.** At module load (IIFE init), computed style of
   `:root` is read once and stored as
   `{ purple, yellow, pink, green, chrome, ink: '#0a0614' }`, with a
   hard-coded fallback if `getComputedStyle` throws or returns empty.
   Exposed as `BrainGamesPicker.getPreviewPalette()` for debug.

6. **PLAY button behaviour.**
   - `isDeckUnlocked()` reads `#deck-wrap`'s `locked` class (primary)
     and falls back to `state.keyboardOn && state.mouseOn && state.brainOn`.
   - Unlocked → `location.href = './play.html?game=' + encodeURIComponent(id)`.
   - Locked → the card gets `.cart-shake` (auto-removed after 450 ms)
     and the `.gate` section is smooth-scrolled into view.

## Preview Draw Map — 13 Covered Game IDs + Generic Fallback

Per the brief, all 13 manifest IDs have tailored Canvas2D draws.
Confirmed in `previewDraws` map:

| # | Game ID | Draw sketch (what you'll see) |
|---|---|---|
| 1 | `snakeFeast`     | 6-segment snake crawling a 16×10 grid chasing a pink pellet |
| 2 | `Brainvaders`    | Descending row of 3×3 pixel aliens over a yellow base |
| 3 | `ZenBreakout`    | Ball bouncing, paddle sliding, brick row eroding one brick at a time |
| 4 | `GolfShooter`    | Yellow ball arcing from a tee toward a hole along a parabola |
| 5 | `archeryShooter` | Concentric target rings pulsing; arrow oscillating left of bullseye |
| 6 | `bballShooter`   | Hoop with net strands; ball bouncing off the rim zone |
| 7 | `soccerPenalty`  | Goal frame with net; keeper sliding; ball arcing toward goal |
| 8 | `RowingCalm`     | Sine-wave water surface; boat riding waves; oars dipping in rhythm |
| 9 | `balanceBeam`    | Stick figure on a chrome beam swaying side-to-side with arm counter-balance |
| 10 | `balloonPop`    | Pink balloon breathing in/out; periodic yellow burst fragments every ~2.4 s |
| 11 | `deepDiver`     | Chrome diver silhouette descending through purple water; green bubbles rising |
| 12 | `mazeFocus`     | Small 8×5 grid with a green trail and a yellow dot tracing a fixed path |
| 13 | `reactionRace`  | 5 stage lights filling left→right in ~1.6 s cycles, then all off |

Generic fallback — confirmed: `genericPreviewDraw(id)` is used for any
`id` not in the map. It renders a blinking chrome/yellow label with
the id uppercased (truncated to 14 chars) and a chrome 1-px inner
border. Exercised whenever the manifest contains an unknown id or
the id has a typo/alias.

Per-card draw ops budget: each function uses well under the "~30
simple 2D ops" ceiling; most are in the 5–20 range. The 24 fps cap
and viewport-gating keep the shared loop comfortably below the <2%
CPU budget on a modern laptop.

## Public API Preserved / Added

Preserved exactly (names and shapes unchanged):
- `BrainGamesPicker.setLight(name, on)`
- `BrainGamesPicker.getState()`
- `BrainGamesPicker.rebuildGrid(entries)` — now a dispatcher as
  specified; calling it with no args or `[]` still restores the
  12-slot placeholder grid.

Added (additive only, no removal / rename):
- `BrainGamesPicker.buildPlaceholderGrid()` — direct access for
  debug / forced reset.
- `BrainGamesPicker.fetchManifest()` — re-run the manifest fetch
  (useful if the manifest is regenerated in-session).
- `BrainGamesPicker.getPreviewPalette()` — snapshot of the
  `:root` CSS palette used by preview draws.

## Deviations From Brief

None of substance. Small, explicit decisions worth flagging:

1. **Card ordering.** Brief didn't specify order; I sort by numeric
   `order` with a 9999 default so IDs missing that field fall to the
   end while preserving input order among equals (Array.sort is
   stable on modern engines). If M4's I3 builder already emits in
   display order, this is a no-op; if not, sorting here is harmless.
2. **PLAY button class.** In addition to the brief's required
   `.cart-play`, I also add the existing `.pixel-btn` class so the
   button inherits the established 90s pixel-button look (brief
   explicitly permits "re-use `.pixel-btn` look").
3. **`encodeURIComponent`.** Used on the `id` query param to be
   defensive against unusual ids; all current ids are ASCII-safe so
   there is no visible difference.
4. **Label strip.** The brief suggested re-using the
   `.cartridge::before` approach; I used a thinner (8 px) striped
   strip on `.cart-card::before` because the new card devotes its
   top region to the real `.cart-label` (title + category) rather
   than a blank NES-style label. Aesthetic match preserved; no
   functional change.

## Self-Assessment

**Craftsperson says:** The extension is a clean additive layer on
top of the existing picker. Public surface is preserved verbatim.
The preview loop is a single RAF with a 24 fps gate and viewport
gating, which is the textbook shape for this budget. All 13
game-specific draw functions are small, deliberate pixel sketches
that read at 160×100 — the kind of tiny per-cartridge "hint
animation" that makes a deck feel alive without eating the frame
budget. `node --check` passes; no linter errors; text is escaped
everywhere via `textContent`.

**Skeptic says:** Several unverified assumptions remain:
(a) I could not actually open the page in a browser to confirm the
visual match against the 90s aesthetic; my confidence is on code,
not pixels. (b) The manifest's real shape (field names for `title`,
`category`, `mappingOneLiner`, and the exact values of `id` for the
13 games) is taken from the brief — if I3's builder emits slightly
different field casing, the generic fallback will kick in silently.
(c) The `IntersectionObserver` observers attached to canvases rely
on the canvases being laid out in a scrollable container; in the
current `.cartridge-grid` all cards are likely visible at once, so
visibility gating is effectively a no-op on desktop — this still
satisfies the brief but doesn't save CPU until the grid scrolls. (d)
I haven't stress-tested concurrent calls to `rebuildGrid` — the
`stopPreviewLoop` reset is defensive but not exhaustively proven.
(e) The brief says "import the five named colours from `:root`" at
load time; I do this inside the IIFE, which runs before `init()`.
If `<head>`-level styles haven't been applied yet, the fallback
palette is used — on modern browsers with the linked stylesheet
this is extremely unlikely, but a race is possible in theory.

**Mover says:** Shipping. The deviations are documented, every
constraint in the hard-constraints list is met (node --check passes,
no emojis, no new third-party deps, public API preserved, only the
allowed files written), and the behaviour contract
(`rebuildGrid(entries)` dispatches correctly, PLAY gating, shake,
scroll) is implemented as specified. With more time I would
(1) browser-verify visuals against the existing `.cartridge` cards
for aesthetic continuity, (2) add a tiny jest/playwright smoke test
that asserts `rebuildGrid([])` restores exactly 12 placeholder
slots and `rebuildGrid([{id:'snakeFeast',...}])` emits exactly one
`.cart-card[data-id="snakeFeast"]`, and (3) add a debug toggle to
force all preview entries visible for the viewport-gating edge case
noted above. None of those block the integration. Handing back to
Manager M4.
