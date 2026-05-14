# Sub-A (I1) Report — Refactor-copy the 10 existing games

**Agent:** Sub-A under Manager M4, Coordinator 1811-C
**Task:** I1 — prepend JSDoc metadata header to 10 existing games, write
byte-preserved copies into `brainGames/games/`, leave originals untouched.
**Status:** Complete. All 10 files produced; `node --check` OK for all 10;
byte-level integrity verified for all 10.

---

## 1. Files produced

All destinations are under `/Users/kylemathewson/Brainimation/brainGames/games/`.
Sources (read-only) are under `/Users/kylemathewson/Brainimation/games/`.

| # | Destination file                                                | Source file                                               |
|---|-----------------------------------------------------------------|-----------------------------------------------------------|
| 1 | `/Users/kylemathewson/Brainimation/brainGames/games/GolfShooter.js`    | `/Users/kylemathewson/Brainimation/games/GolfShooter.js`    |
| 2 | `/Users/kylemathewson/Brainimation/brainGames/games/archeryShooter.js` | `/Users/kylemathewson/Brainimation/games/archeryShooter.js` |
| 3 | `/Users/kylemathewson/Brainimation/brainGames/games/bballShooter.js`   | `/Users/kylemathewson/Brainimation/games/bballShooter.js`   |
| 4 | `/Users/kylemathewson/Brainimation/brainGames/games/soccerPenalty.js`  | `/Users/kylemathewson/Brainimation/games/soccerPenalty.js`  |
| 5 | `/Users/kylemathewson/Brainimation/brainGames/games/RowingCalm.js`     | `/Users/kylemathewson/Brainimation/games/RowingCalm.js`     |
| 6 | `/Users/kylemathewson/Brainimation/brainGames/games/balanceBeam.js`    | `/Users/kylemathewson/Brainimation/games/balanceBeam.js`    |
| 7 | `/Users/kylemathewson/Brainimation/brainGames/games/balloonPop.js`     | `/Users/kylemathewson/Brainimation/games/balloonPop.js`     |
| 8 | `/Users/kylemathewson/Brainimation/brainGames/games/deepDiver.js`      | `/Users/kylemathewson/Brainimation/games/deepDiver.js`      |
| 9 | `/Users/kylemathewson/Brainimation/brainGames/games/mazeFocus.js`      | `/Users/kylemathewson/Brainimation/games/mazeFocus.js`      |
| 10| `/Users/kylemathewson/Brainimation/brainGames/games/reactionRace.js`   | `/Users/kylemathewson/Brainimation/games/reactionRace.js`   |

Pre-existing files in `brainGames/games/` (`Brainvaders.js`, `ZenBreakout.js`,
`snakeFeast.js`, `__sample.js`) were NOT touched — `ls -la` confirms their
mtimes are unchanged (18:22–18:30) versus the 18:39 mtimes of the 10 files
this sub produced.

## 2. Header that was prepended

The same template was used for all 10 files, with `<ID>`, `<TITLE>`,
`<CATEGORY>`, `<ORDER>`, `<MAPPING_ONE_LINER>`, and `<FILE>` filled in per
the table provided in the brief. Example (for `GolfShooter.js`):

```
/**
 * @id GolfShooter
 * @title Golf Driving Range
 * @category Sports
 * @order 10
 * @newGame false
 *
 * EEG mappings:
 *   attention -> shot power
 *
 * Copy of /games/GolfShooter.js (the original remains the authoritative
 * reference and MUST NOT be modified). Only this metadata header was
 * prepended; all original code below is preserved byte-for-byte.
 */
```

The header is terminated by a single `\n` after the closing `*/`, followed
immediately by the original file's raw bytes (no re-indent, no whitespace
normalization, trailing newline preserved). Per-file header byte lengths
vary only because `@title`, `@order`, `@category`, and the mapping one-liner
differ in length.

## 3. `node --check` results

Command: `node --check <dst>` for each of the 10 produced files.

| File                  | Exit code | Result |
|-----------------------|-----------|--------|
| GolfShooter.js        | 0         | OK     |
| archeryShooter.js     | 0         | OK     |
| bballShooter.js       | 0         | OK     |
| soccerPenalty.js      | 0         | OK     |
| RowingCalm.js         | 0         | OK     |
| balanceBeam.js        | 0         | OK     |
| balloonPop.js         | 0         | OK     |
| deepDiver.js          | 0         | OK     |
| mazeFocus.js          | 0         | OK     |
| reactionRace.js       | 0         | OK     |

All 10 files parse cleanly with Node's syntax checker. No stderr output on
any file.

## 4. Integrity verification (original bytes preserved)

Method: for each file I read the source as raw bytes, built
`header_bytes + original_bytes`, wrote that to the destination, then
re-read the destination and confirmed that `written[len(header):] ==
original`. I also computed SHA-256 of both the original source and the
tail-after-header of the destination — they match per file.

| File                  | src bytes | dst bytes | header bytes | sha256(src) [16] | sha256(tail) [16] | Original bytes preserved? |
|-----------------------|-----------|-----------|--------------|------------------|-------------------|---------------------------|
| GolfShooter.js        | 18714     | 19082     | 368          | 14a1a45a551e4a0b | 14a1a45a551e4a0b  | YES                       |
| archeryShooter.js     | 22553     | 22927     | 374          | 0f3270fd394cc509 | 0f3270fd394cc509  | YES                       |
| bballShooter.js       | 17740     | 18105     | 365          | 9bce3150b97cb65d | 9bce3150b97cb65d  | YES                       |
| soccerPenalty.js      | 12379     | 12756     | 377          | 4b9d39ea0d94d7ab | 4b9d39ea0d94d7ab  | YES                       |
| RowingCalm.js         | 20022     | 20383     | 361          | e0da5ea56b12d114 | e0da5ea56b12d114  | YES                       |
| balanceBeam.js        | 21830     | 22195     | 365          | b0cac6b880dfd012 | b0cac6b880dfd012  | YES                       |
| balloonPop.js         | 13941     | 14305     | 364          | 7c513f8d6f676f9e | 7c513f8d6f676f9e  | YES                       |
| deepDiver.js          | 23199     | 23565     | 366          | f35f294351648fc5 | f35f294351648fc5  | YES                       |
| mazeFocus.js          | 19584     | 19955     | 371          | 0349665fc9c953ce | 0349665fc9c953ce  | YES                       |
| reactionRace.js       | 29436     | 29815     | 379          | 95fa928bdea3951c | 95fa928bdea3951c  | YES                       |

Also verified `dst_bytes == src_bytes + header_bytes` for every row (e.g.
18714 + 368 == 19082 for GolfShooter.js), a second independent consistency
check.

## 5. Source-tree preservation

`ls -la /Users/kylemathewson/Brainimation/games/` and `git status` confirm
that none of the source files under `games/` were modified. My script only
opened them for reading (`"rb"`). The source files remain untracked exactly
as they were at the start of the task (identical to the initial git status
snapshot).

The pre-existing M3 files in `brainGames/games/` (`Brainvaders.js`,
`ZenBreakout.js`, `snakeFeast.js`) and the `__sample.js` placeholder were
also not touched — their mtimes pre-date this sub's writes (18:22–18:30
versus 18:39 for all 10 produced files).

## 6. Deviations from the spec

None. All 10 files were processed with:

- the exact JSDoc header template from the brief,
- the exact metadata values from the table in the brief,
- a single `\n` separating the header and the original content,
- no logic changes, no helper swaps (per M2/M4 "preservation first" guidance),
- `@newGame false` on all 10.

The "integrity check" described in the brief was implemented as a
byte-equality test (`tail == original`) plus a SHA-256 cross-check rather
than as a shell `diff` pipeline, but it is strictly stronger: it verifies
that after skipping the header bytes (not lines) the destination equals
the source byte-for-byte, which is what the brief ultimately asks for.

## 7. Self-assessment (tripartite)

**Craftsperson says:** The byte-preservation path is clean — I read `rb`,
concatenate, write `wb`, and verify with SHA-256 + equality. The ten
`node --check` runs all return exit 0. Header formatting matches the
template verbatim, line-by-line. The 10-row consistency check
`dst == src + header` is a nice second signal and it holds everywhere.
`@newGame false` is applied uniformly per the brief.

**Skeptic says:** (a) `node --check` only validates parse-level syntax;
it does NOT guarantee the games still run under the picker/runtime shell
that M3 established — any semantic regressions would need an integration
pass that is explicitly someone else's job this round. (b) I trusted the
metadata table in the brief verbatim (IDs, categories, orders, mapping
one-liners); if those disagree with the manifest another sub is building,
they will diverge and need a one-shot reconciliation. (c) The header is
a JSDoc block comment — no existing game starts with a BOM or a JSDoc
block that could collide, but a future sub that auto-parses the first
comment block should know there are now two leading comment blocks in
some files (my JSDoc, then the original `// EEG ...` line comments that
many of these files open with). (d) Line counts shift by ~14 lines in
every file, which will shift every stack-trace line number in the copy
vs. the original — acceptable, but worth flagging for anyone diffing
error reports across the two trees.

**Mover says:** Integrity is proven byte-for-byte, `node --check` is
green across the board, originals are untouched, the M3 files and
`__sample.js` are untouched, and the deliverable report is written.
Shipping. The skeptical concerns above are documented, not blocking —
they belong to the picker/runtime integration sub and to whoever owns
the manifest, not to I1.

---

**End of Sub-A (I1) report.**
