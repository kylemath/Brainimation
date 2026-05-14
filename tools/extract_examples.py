#!/usr/bin/env python3
"""
One-time extractor: pulls the `const examples = {...}` literal out of index.html
and writes one self-registering .js file per example into ../examples/, along
with a manifest.json listing all files, categories, and category order.

Category/title metadata is recovered from the <optgroup>/<option> blocks in
index.html so the generated menu matches the original layout exactly.

Usage:
    python3 tools/extract_examples.py
"""

from __future__ import annotations

import json
import re
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
INDEX = REPO / "index.html"
EXAMPLES_DIR = REPO / "examples"
MANIFEST = EXAMPLES_DIR / "manifest.json"


def parse_option_metadata(html: str):
    """Return (categories_in_order, {id: {title, category, order}})."""
    # Restrict to the <select id="example-selector"> block.
    sel_open = html.index('<select id="example-selector"')
    sel_close = html.index("</select>", sel_open)
    block = html[sel_open:sel_close]

    categories_in_order: list[str] = []
    meta: dict[str, dict] = {}
    order_counter = 0

    # Walk <optgroup label="X"> ... </optgroup> sequentially so we know the
    # active category for every <option> inside it.
    group_re = re.compile(
        r'<optgroup\s+label="([^"]+)">(.*?)</optgroup>', re.DOTALL
    )
    option_re = re.compile(r'<option\s+value="([^"]+)"\s*>([^<]+)</option>')

    for gm in group_re.finditer(block):
        category = gm.group(1).strip()
        inner = gm.group(2)
        if category not in categories_in_order:
            categories_in_order.append(category)
        for om in option_re.finditer(inner):
            ex_id = om.group(1).strip()
            title = om.group(2).strip()
            if not ex_id:
                continue
            meta[ex_id] = {
                "title": title,
                "category": category,
                "order": order_counter,
            }
            order_counter += 1

    return categories_in_order, meta


def parse_examples_object(html: str) -> list[tuple[str, str]]:
    """Return [(id, code), ...] preserving source order."""
    # Locate the specific examples = { ... } object inside loadExample().
    anchor = html.index("loadExample(exampleName) {")
    start = html.index("const examples = {", anchor) + len("const examples = {")
    i = start
    examples: list[tuple[str, str]] = []

    while i < len(html):
        # Skip whitespace, commas, and single-line // comments between entries.
        while i < len(html) and html[i] in " \t\r\n,":
            i += 1
        if html[i : i + 2] == "//":
            nl = html.index("\n", i)
            i = nl + 1
            continue
        if html[i] == "}":
            break

        # Parse the key (either bare identifier or single-quoted string).
        if html[i] == "'":
            j = html.index("'", i + 1)
            key = html[i + 1 : j]
            i = j + 1
        elif html[i] == '"':
            j = html.index('"', i + 1)
            key = html[i + 1 : j]
            i = j + 1
        else:
            m = re.match(r"[A-Za-z_$][A-Za-z0-9_$]*", html[i:])
            if not m:
                raise RuntimeError(f"Could not parse key at offset {i}")
            key = m.group(0)
            i += len(key)

        # Skip to the colon, then to the opening backtick.
        while html[i] != ":":
            i += 1
        i += 1
        while html[i] in " \t":
            i += 1
        if html[i] != "`":
            raise RuntimeError(
                f"Expected backtick for key '{key}' at offset {i}, got {html[i]!r}"
            )
        i += 1
        code_start = i

        # Walk the template literal, handling \-escapes and ${ ... } interpolations.
        depth = 0
        while True:
            c = html[i]
            if c == "\\":
                i += 2
                continue
            if c == "$" and html[i + 1] == "{":
                depth += 1
                i += 2
                continue
            if depth > 0:
                if c == "}":
                    depth -= 1
                i += 1
                continue
            if c == "`":
                break
            i += 1

        code = html[code_start:i]
        i += 1  # consume closing backtick
        examples.append((key, code))

    return examples


_ESCAPE_RE = re.compile(r"\\(.)")


def unescape_template_literal(s: str) -> str:
    """Undo the escapes that are ONLY there to keep the inline template
    literal from terminating or interpolating: `\\\\`, `\\\``, `\\${`.
    Everything else (including `\\'`, `\\"`, `\\n`, `\\t`, ...) is left
    untouched so that a raw sketch file remains valid JavaScript — those
    escapes are still meaningful inside the single-/double-quoted strings
    and regexes that appear inside sketch source."""
    template_only = {"\\", "`", "$"}

    def repl(m):
        c = m.group(1)
        return c if c in template_only else m.group(0)

    return _ESCAPE_RE.sub(repl, s)


def write_example_file(
    path: Path,
    ex_id: str,
    title: str,
    category: str,
    code: str,
    order: int | None,
):
    """Write a raw p5.js sketch with a doc-comment metadata header. The file
    is a legitimate standalone sketch — the runtime loader fetches it as
    text, parses the header, and registers the remainder as example code."""
    order_line = f" * @order {order}\n" if order is not None else ""
    header = (
        f"/**\n"
        f" * @id {ex_id}\n"
        f" * @title {title}\n"
        f" * @category {category}\n"
        f"{order_line}"
        f" *\n"
        f" * Auto-split from index.html.\n"
        f" */\n"
    )
    sketch = unescape_template_literal(code)
    if not sketch.endswith("\n"):
        sketch += "\n"
    path.write_text(header + sketch, encoding="utf-8")


def safe_filename(ex_id: str) -> str:
    # JS filenames are unrestricted but keep things tidy.
    clean = re.sub(r"[^A-Za-z0-9_\-]", "_", ex_id)
    return f"{clean}.js"


def main():
    html = INDEX.read_text(encoding="utf-8")
    categories_in_order, meta = parse_option_metadata(html)
    examples = parse_examples_object(html)

    EXAMPLES_DIR.mkdir(parents=True, exist_ok=True)

    files_in_order = []
    missing_meta = []

    for ex_id, code in examples:
        info = meta.get(ex_id)
        if not info:
            missing_meta.append(ex_id)
            title = ex_id
            category = "Uncategorized"
        else:
            title = info["title"]
            category = info["category"]

        filename = safe_filename(ex_id)
        out = EXAMPLES_DIR / filename
        order = info["order"] if info else None
        write_example_file(out, ex_id, title, category, code, order)
        files_in_order.append(
            {
                "id": ex_id,
                "file": filename,
                "title": title,
                "category": category,
            }
        )

    # Stable sort: by menu order from the original <select>, unknown ids at end.
    def sort_key(entry):
        info = meta.get(entry["id"])
        return (0, info["order"]) if info else (1, entry["id"])

    files_in_order.sort(key=sort_key)

    manifest = {
        "categoryOrder": categories_in_order,
        "examples": files_in_order,
    }
    MANIFEST.write_text(
        json.dumps(manifest, indent=2) + "\n", encoding="utf-8"
    )

    print(f"Wrote {len(files_in_order)} examples to {EXAMPLES_DIR}")
    print(f"Manifest: {MANIFEST}")
    if missing_meta:
        print(
            "WARNING: no menu metadata found for: "
            + ", ".join(missing_meta)
        )


if __name__ == "__main__":
    main()
