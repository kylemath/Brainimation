# Manager M2 Interim Signal — Helpers Ready for M3

**Status:** H1, H2, H3, H4 committed to disk and passing `node --check`.
H5 also complete (wrote all five together since the work was tightly
coupled on the palette contract).

**M3 is unblocked.** New games can now `<script>`-include the following
helpers from `brainGames/shared/` and use them via `window.BGShared`:

- `brainGames/shared/styling90s.js` — `BGShared.PALETTE`,
  `drawPixelBorder`, `drawScanlineOverlay`, `drawChromeText`, `blinker`,
  plus bonus `fillVerticalGradient`, `drawCrtPanel`.
- `brainGames/shared/eegSmoothing.js` — `BGShared.makeSmoother(n)`,
  `makeGraceBuffer({window, threshold})`, `readEEG(opts)`.
- `brainGames/shared/hud.js` — `BGShared.drawBar(...)`,
  `drawStatBox(x, y, label, val, col)`, `drawResultOverlay({kind, text, sub, pts})`,
  `drawTopHud({eeg, score, time, palette})`.
- `brainGames/shared/intro.js` — `BGShared.drawIntroPanel({title, blurb, mappings, introTimer, startHint})`,
  `drawSummaryPanel({title, stats, message, restartHint})`.
- `brainGames/shared/crowd.js` — `BGShared.drawStadiumBackground({mode, time, palette})`
  with modes `court | field | range | green`;
  `drawCrowd({x, y, w, h, cheer, palette, seed})`;
  `makeCrowd({seed})`;
  `drawScoreboard({x, y, home, away, time, width, height, palette})`.

## Acceptance Results (node --check)

```
styling90s.js   OK
eegSmoothing.js OK
hud.js          OK
intro.js        OK
crowd.js        OK
```

## Load-Order Contract

All helpers self-register on `window.BGShared` in IIFEs. They are safe to
load in any order after p5.js. Cross-helper references are resolved at
call time (not load time), so `intro.js` can use `styling90s.js`'s
`drawChromeText` regardless of which script tag comes first.

## Palette Contract (must match M1's main.css)

```
deepPurple #3b1f5a
acidYellow #f7d51d
neonPink   #ff4aa0
crtGreen   #6cff83
chromeGrey #c0c0c0
```

Helpers also expose neutral helpers (`ink #0a0614`, `shadow #1a0f2e`,
`dim #8a7ba8`) as convenience additions that M1 may or may not mirror
in CSS — they are internal to the canvas-drawn helpers.

Final report to follow shortly.
