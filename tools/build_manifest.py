#!/usr/bin/env python3
"""
Scan ../examples/*.js, read the `@id / @title / @category` header of each
file, and regenerate ../examples/manifest.json.

Drop a new example file in ../examples/ with a header like:

    /**
     * @id myExample
     * @title My Example
     * @category Particle Systems
     * @order 3          (optional; defaults to filename sort order)
     */
    BrainimationExamples.register({
      id: 'myExample',
      title: 'My Example',
      category: 'Particle Systems',
      code: `// your p5.js code here
    function setup() { ... }
    function draw() { ... }
    `
    });

...then run `python3 tools/build_manifest.py` to refresh the manifest so the
in-browser dropdown picks it up.

Category ordering rules:
  1. If examples/categories.json exists, it is read and any categories listed
     there come first, in order.
  2. Any remaining categories are appended in the order they are first seen
     while walking files alphabetically.

Per-category example ordering rules:
  1. Examples with an explicit `@order N` header are sorted by N (ascending).
  2. Remaining examples are appended in alphabetical filename order.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
EXAMPLES_DIR = REPO / "examples"
MANIFEST = EXAMPLES_DIR / "manifest.json"
CATEGORIES_CONFIG = EXAMPLES_DIR / "categories.json"

HEADER_RE = re.compile(r"/\*\*(.*?)\*/", re.DOTALL)
TAG_RE = re.compile(r"^\s*\*\s*@(\w+)\s+(.+?)\s*$", re.MULTILINE)
SKIP_FILES = {"registry.js"}


def parse_header(text: str) -> dict:
    m = HEADER_RE.search(text)
    if not m:
        return {}
    tags = {}
    for tm in TAG_RE.finditer(m.group(1)):
        key = tm.group(1).strip()
        value = tm.group(2).strip()
        tags[key] = value
    return tags


def load_category_order() -> list[str]:
    if not CATEGORIES_CONFIG.exists():
        return []
    try:
        data = json.loads(CATEGORIES_CONFIG.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise SystemExit(f"Invalid JSON in {CATEGORIES_CONFIG}: {exc}")
    if isinstance(data, dict):
        data = data.get("categoryOrder", [])
    if not isinstance(data, list):
        raise SystemExit(
            f"{CATEGORIES_CONFIG} must contain a JSON array of category names "
            f"(or an object with a 'categoryOrder' key)"
        )
    return [str(x) for x in data]


def collect_examples() -> tuple[list[str], list[dict]]:
    configured_order = load_category_order()
    seen_categories: list[str] = list(configured_order)
    entries: list[dict] = []

    for js_file in sorted(EXAMPLES_DIR.glob("*.js")):
        if js_file.name in SKIP_FILES:
            continue
        text = js_file.read_text(encoding="utf-8")
        header = parse_header(text)
        ex_id = header.get("id") or js_file.stem
        title = header.get("title") or ex_id
        category = header.get("category") or "Uncategorized"

        order_str = header.get("order")
        explicit_order = None
        if order_str is not None:
            try:
                explicit_order = int(order_str)
            except ValueError:
                print(
                    f"WARNING: {js_file.name} has non-integer @order '{order_str}', ignoring"
                )

        if category not in seen_categories:
            seen_categories.append(category)

        entries.append(
            {
                "id": ex_id,
                "file": js_file.name,
                "title": title,
                "category": category,
                "_order": explicit_order,
                "_filename": js_file.name,
            }
        )

    # Sort: by category (using seen_categories order), then by explicit @order
    # (None last), then alphabetical filename.
    cat_index = {c: i for i, c in enumerate(seen_categories)}

    def sort_key(entry):
        return (
            cat_index[entry["category"]],
            entry["_order"] if entry["_order"] is not None else 10**9,
            entry["_filename"].lower(),
        )

    entries.sort(key=sort_key)

    # Strip internal keys before writing.
    clean = [
        {"id": e["id"], "file": e["file"], "title": e["title"], "category": e["category"]}
        for e in entries
    ]
    return seen_categories, clean


def main():
    if not EXAMPLES_DIR.is_dir():
        raise SystemExit(f"Examples folder not found: {EXAMPLES_DIR}")

    categories, entries = collect_examples()
    manifest = {"categoryOrder": categories, "examples": entries}
    MANIFEST.write_text(
        json.dumps(manifest, indent=2) + "\n", encoding="utf-8"
    )
    print(f"Wrote {MANIFEST}")
    print(f"  {len(entries)} examples across {len(categories)} categories")


if __name__ == "__main__":
    main()
