# Brainimation Twitter-thread automation

This file is the procedure for the scheduled automation "Automated sharing of Brainimation project on Twitter". Follow it on every run. The coverage list is `social/twitter/COVERED.json`.

The Cursor dashboard prompt cannot be changed from a cloud run. Paste the block below over that prompt so the next run starts with the same rules even before it opens this file.

```
Draft one X (Twitter) thread about a single Brainimation example or feature. Do not post to X. This automation has no X account or posting tool. Deliver the thread in the repo and open a pull request with open_git_pr.

Before choosing a topic, read social/twitter/AGENT_INSTRUCTIONS.md and social/twitter/COVERED.json. Skip any example id, feature, or angle already listed. Append the new entry before you commit.

Produce a folder social/twitter/YYYY-MM-DD-<slug>/ with THREAD.md (4 or 5 posts, each at most 280 characters), a looping GIF under 5 MB, and one still PNG. Render the GIF from the real example with p5.js 1.7.0 and simulated eegData. Say in the thread that the clip is the built-in simulator, not a live headset. Do not include email addresses, student names, or files from student submissions.

Open the pull request only after the GIF is visually recognizable, the still is not blank, every factual claim was checked against the repo, and COVERED.json includes the new entry.
```

## What to ship

One thread per run. Work on the automation branch, commit, push, then call `open_git_pr`.

Folder: `social/twitter/YYYY-MM-DD-<exampleId>/` using the America/Edmonton date.

- `THREAD.md` — numbered posts, the exact text to paste, and a one-line note of which attachment goes on which post.
- `<slug>.gif` — the moving sketch.
- `<slug>-still.png` — one picture, usually a clean frame with a short label of the real signal mapping.
- Update `social/twitter/COVERED.json` in the same change.

Do not post, tweet, or upload anywhere else. `open_git_pr` is the delivery tool.

## Pick a topic that is not already listed

Read `COVERED.json` first. Skip an entry's `id`, and also skip its `features` if the new thread would make the same point (another "attention slider" post, another provenance recap).

Choose one example from `examples/manifest.json`, or one product ability if every strong example is already covered. Record whichever you chose.

Prefer a sketch that draws with opaque color. `colorMode(HSB, 360, 100, 100)` leaves the alpha range at 0–255, so a fourth component of `0.7` or `0.05` is nearly invisible. `examples/colorfulGrid.js` is opaque and renders. Sketches such as Neural Mandala, Brain Particles, and Bouncing Circles pass fractional alpha and can come out blank. Do not edit an example just to make the GIF visible. Pick a different sketch, or render it the way the app does and discard it if the frames are empty.

## Render the GIF from the real sketch

Match the app, which loads p5.js 1.7.0. Serve a local HTML harness; do not rewrite the sketch.

- Copy the example to the harness as `sketch.js`.
- Provide `window.eegData` and step it yourself. Use the same derived scores as `index.html`: `attention = (beta + gamma) / 2`, `meditation = (alpha + theta) / 2`, each clamped to 0–1.
- Create the canvas in the harness `setup` before the sketch's own `setup`, call `noLoop()`, and `redraw()` once per frame. The sketch's `setup` often does not call `createCanvas`.
- Headless Chrome is at `/usr/local/bin/google-chrome`. A 800×800 canvas is a good capture size. Drive it with the DevTools protocol and close the browser when the frames are written. `google-chrome --screenshot` can hang after the PNG is already on disk.
- Encode with ffmpeg. A rainbow sketch at 640px and 256 colors was about 14 MB, which is too close to X's 15 MB limit and too heavy to commit. Target: 480×480, 12 fps, about 4 seconds, 128-color palette, file under 5 MB. Look at a middle frame. If the squares turn to mud, raise the size slightly or lower the frame count until it is still under 5 MB.
- The still should be a PNG of a clean captured frame, not a frame extracted from the GIF. A labeled picture is useful when the labels match the sketch source. The artwork should take most of the image.

Say in the thread that the clip is Brainimation's built-in simulator. Do not describe it as a live Muse recording.

## Check claims against the repo

- Band labels live in the `eegReference` block in `index.html`: delta 0.5–4 Hz, theta 4–8 Hz, alpha 8–12 Hz, beta 13–30 Hz, gamma 30+ Hz. Attention is derived from beta and gamma. Meditation is derived from alpha and theta. Call them the app's scores, not clinical measurements.
- Only claim a signal mapping that is in that sketch's `draw`. Read the file. Animated Grid, for example, uses attention for wave speed, theta for hue, alpha for brightness, and meditation for cell size.
- Count sketches and categories from `examples/manifest.json` on this run. Do not reuse the paper highlights (those figures go stale).
- Provenance to use, with no email addresses: Kyle Mathewson's neuroscience and BCI course at the University of Alberta; Tamari Shalamberidze; Claire J. Scavuzzo; muse-js by Uri Shaked; p5.js. Hardware named in the README: Muse 2016, Muse 2, Muse S, Muse S Athena.
- Try-it link shape: `https://kylemath.github.io/Brainimation/?sketch=examples/<file>.js`
- Do not mention student names or quote files under `paper2_brainimation/data/student_submissions/`.
- Do not claim the project does generative-AI neural decoding, speech restoration, or implanted BCI work.

## Write the thread

Search the web for what people are saying that week about neurotech, BCI, or creative coding. Use a few of those words in the prose. Do not invent a news event, and do not pad the posts with hashtags.

Shape:

1. Hook plus the GIF. Name the sketch. Say the clip is the simulator.
2. The still, plus the mapping you verified in source.
3. What Brainimation is: zero-install, Chrome, Web Bluetooth, muse-js, Monaco editor, simulator.
4. Provenance, one post.
5. The try-it link and at most three hashtags, chosen from terms you actually used (`#Neurotech`, `#BCI`, `#CreativeCoding`, `#GenerativeArt`).

Keep each post at or under 280 characters before relying on URL shortening. Drop a post rather than repeating one. Write numbers as digits. No email addresses.

## Coverage list

`COVERED.json` is the dedup list. Append one object before committing:

```json
{
  "date": "YYYY-MM-DD",
  "id": "exampleId or feature slug",
  "title": "Human title",
  "category": "manifest category or feature",
  "angle": "the one idea this thread argued",
  "features": ["short-tags", "used-for-dedup"],
  "path": "social/twitter/YYYY-MM-DD-slug"
}
```

If a run produces nothing worth posting, do not append an entry and do not open a pull request.

## Quality bar

Open the pull request only when all of these are true:

- The GIF shows the sketch moving, and a middle frame is still recognizable.
- The still is not a blank or near-black canvas.
- Every number and name in `THREAD.md` was checked in this run.
- `COVERED.json` contains the new entry and no earlier entry was removed.
- The GIF is under 5 MB.
