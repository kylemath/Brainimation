# Example Animations

Each file in this folder is one example animation that appears in the
"Example Animations" dropdown inside the app. Files are loaded dynamically
at runtime based on `manifest.json`, so **dropping a new `.js` file into
this folder and rebuilding the manifest is all that's needed** to add an
example.

## Folder layout

- `registry.js` — global `window.BrainimationExamples` registry. Loaded by
  `index.html` before any example file. Do not rename or delete.
- `manifest.json` — generated file that lists every example in the order
  the dropdown should display them, grouped by category. Regenerate with
  `python3 tools/build_manifest.py`.
- `categories.json` — optional hint that controls the category order in
  the dropdown. Any category not listed here is appended at the end in
  discovery order.
- `<exampleId>.js` — one file per example. A standalone p5.js sketch with
  a small doc-comment header at the top.

## Anatomy of an example file

An example is just a normal p5.js sketch with a metadata header:

```js
/**
 * @id mySketch
 * @title My Sketch
 * @category Particle Systems
 * @order 10          (optional – lower numbers come first within the category)
 */
function setup() {
  colorMode(HSB, 360, 100, 100);
}

function draw() {
  background(0, 0, 10);
  ellipse(width / 2, height / 2, 50 + eegData.alpha * 200);
}
```

No `register()` call, no template-literal escaping, no wrapping quotes.
The loader fetches this file, pulls the `@id` / `@title` / `@category`
tags out of the header, and registers the rest of the file as the code
that will be shown in the Monaco editor.

### Header tags

| Tag         | Required | Meaning                                                                 |
| ----------- | -------- | ----------------------------------------------------------------------- |
| `@id`       | yes      | Stable identifier (used as the `<option value>` and the registry key).  |
| `@title`    | yes      | Human-readable name shown in the dropdown.                              |
| `@category` | yes      | Group heading in the dropdown. New categories are OK.                   |
| `@order`    | no       | Integer used for sorting within a category (lower = earlier).           |

## Workflow

1. Add or edit a file in this folder.
2. Run `python3 tools/build_manifest.py` to regenerate `manifest.json`.
3. (Optional) If you added a new category, list it in `categories.json`
   in the order you want it to appear.
4. Reload `index.html` in the browser. The dropdown auto-populates from
   `manifest.json` — no code changes needed in `index.html`.

## One-off re-extraction from index.html

The original monolithic `const examples = {...}` was split into this
folder with `tools/extract_examples.py`. That script is retained for
reference only — all new work should happen directly in these files.
