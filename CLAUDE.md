# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-page editor and uniqueness solver for puzzles from the game *The Artisan of Glimmith*. The whole app (editor, solver, importer, UI) is one
self-contained HTML file, `glimmith_solver_V1.0.17.html`, with no build step and no network use. `dev/` holds the Node test suite and tools.

## This repository is public: keep game and third-party data out

`.gitignore` excludes data that must never be committed: the base game puzzles (`dev/game_puzzles/`, `dev/game_puzzles_converted/`),
the tools that extract them from the game, Steam workshop and player-submitted puzzles (`dev/workshop_wally/`, `dev/user_puzzles/`,
`dev/puzzles/user_*`, `dev/user_puzzle.js`, `dev/user_compass.js`) and `docs/handoffs/`. Do not add these back, and do not paste puzzle
grids or solutions taken from them into code, tests, comments or commit messages. Test cases must use synthetic or planted boards.

Because of this, a fresh clone lacks those files: tests and tools that read them (`ui_test_game_import39.js`, `ui_test_edge40.js`,
`ui_test_wally*.js`, `test_*_user.js`, `tools/run_corpus.js`, `tools/exact_one.js`, `tools/run_export.js` on workshop files, ...) only work
on the author's machine.

## Commands (run from `dev/`)

```
npm install                                # jsdom, only needed by the page tests
node tests/solver/test.js                  # main solver test suite (269 checks); the others: node tests/solver/test_<name>.js
node fuzz/fuzz_<name>.js <N> <seed>        # fuzzer, e.g. node fuzz/fuzz_clue92.js 300 1
node tests/page/ui_test.js [page.html]     # page tests in jsdom; every tests/page/ui_test_*.js takes the page path as argv[2]
node tools/run_corpus.js ...               # timing run over the campaign corpus (options in the file header; needs the game puzzles)
```

Layout of `dev/`: `fuzz/` (the fuzzers), `tests/solver/` and `tests/page/` (the tests), `tools/`, `build/` (the patch scripts),
`reference/` (the cores), `fixtures/`, and at its root only the shared modules (`fuzzlib.js`, `oracle.js`, `corepath.js`, `loadpz.js`,
`pal_refuter.js`). Scripts are still run **from `dev/`**: their default page path (`../glimmith_solver_V1.0.x.html`) is relative to it.
A new test or fuzzer goes in its folder, never back at the root of `dev/`.

There is no test runner, linter or bundler: each script is standalone and prints its own pass/fail counts. Known baseline failures
inherited from V1: `ui_test_import.js` 17/27 and `ui_test_export32.js` 14/24 (and `ui_test_deduce.js` 35/38 in this cloud
environment: three timing checks on the live solving animation).

`GLIMMITH_CORE=<path>` makes the shared scripts load another solver core. Without it, `corepath.js` picks the highest
`dev/reference/solver-core.vNN.js`. Some fuzzers `require` a fixed core version directly instead.

## Architecture

- **The page is the source of truth.** Inside `glimmith_solver_V1.0.17.html` the main `<script>` contains, in order: the `SOLVER CORE`
  block (pure functions; its banner comment is the full core version history), the deduction solver (`deduceSolve`: propagation steps,
  probes, narrow per-edge searches, then an exact final search), the import core (puzzle file, zip and workshop folder parsing), then the
  UI code.
- **`dev/reference/` mirrors the page** as Node modules: `solver-core.vNN.js` is the page's `SOLVER CORE` block with the two-space indent
  removed (a few comment lines differ), and `import-core.js` is the importer. After changing the solver in the page, copy it back into the
  reference core so the tests run the same code.
- **Testing strategy:** `fuzz/fuzz_*.js` compare the full solver with a brute-force oracle (`oracle.js`, plus `fuzzlib.js` for planted random
  boards) on small boards. A deduction is only accepted if it never disagrees with the oracle. `tests/solver/test.js` holds hand-built cases.
- **Puzzle model:** edges are keyed `v:c,r` / `h:c,r` in a `Map` of edge types (`wall`, `delta`, `gemini`, `lt`/`gt`, `diffN`, ...). The
  solver decides for each open edge whether it is a wall or joins two tiles of the same piece. Clues (roses, area numbers, compasses,
  palisades, watchtowers, polyomino bank) and the base-game and custom rules (Wally, Links, Omits, Heterogeneous) constrain the pieces.

## Page text: always add it to the rewrite list

The author rewrites every text the page shows **on the rewrite page**, a private claude.ai page with its own database:
https://claude.ai/artifact/8zkhz8jRG1qYJM5ET2k6e2. He prefers it to editing files (it shows where each text is and is easier to
use), so that page is where his answers are. The folder `rewrite/` in the repository is a copy of them, kept by Claude.

**Habit: fetch his answers.** Before any work that touches page text, and whenever he mentions the rewrite, read the page's database
(ArtifactData tool: `list`, collection `rewrites`, limit 1000, with `out_dir`), then refresh `rewrite/` from it
(`node dev/tools/rewrites/repo.js write ... <that dump> rewrite`) and commit it. Never answer questions about what is left, and never
apply rewrites, from an old dump or from the files alone: he may have written more since.

**Every time a change adds or changes text a user can see** (labels, buttons, tooltips, messages, step titles and explanations, rule
explanations), in the same piece of work: run `extract.js` + `clean.js` (IDs stay stable through `dev/tools/rewrites/texts_ids.json`),
fetch the database, rebuild the page with `build_list.js` (only what is still to write, plus the new or changed texts) and republish
it **to the same URL**, then refresh `rewrite/`. See `dev/tools/rewrites/README.md`. Apply his finished rewrites (not `[...]` notes)
with `gen_rewrites.js` in a patch script, as in `dev/build/patch_ui_V1.0.10.py`.

### No V1.1 before the rewrite is done

**Do not make a V1.1 (or any version above V1.0.x), even when asked, while the rewrite list has anything left.** Run
`node dev/tools/rewrites/repo.js status rewrite` first, on a `rewrite/` just refreshed from the page's database: it must say that nothing is left, meaning every text is written or kept, no
text is waiting to be checked again, no `[...]` note is open, and every rewrite is on the page. If something is left, say so with
the counts, remind the author that he set this rule so that he would not forget the rewrite, and keep numbering V1.0.x. Only the
author lifting this rule in so many words changes that.

Step-by-step text states what is true first (a link, a wall, one piece), then why; avoid double negatives ("no wall here is impossible").

## Rule examples

Rule steps have a "Show example" pop-up (and the rules footer a "Show all examples"), fed by `RULE_EXAMPLES`: per rule a one-line
explanation and up to four tiny synthetic boards. The author's rules for them: an example uses **only the mechanic its rule needs**
(area numbers and plain walls are the only helpers), is as small as possible, is possible in the game (one clue per tile), and a rule
with several kinds of cases gets several tiny boards rather than one big one. The pop-up names only what the board cannot show (rules
that are on, shape bank, Omits). Rules and boards are numbered (rule 12, boards 12.1, 12.2): the author refers to them
by number, and the number is the rule's place in `dev/tools/examples/lines.json`, so it moves when a rule gains or loses its examples. 
The author reviews the examples by number and sends remarks ("12.1: too small", "use my puzzle, step 2"). Those choices live in
`dev/tools/examples/curated.json` (a hand-made or author-sent puzzle with the step to show, or edges of earlier steps to leave out of
the picture) and win over the generated boards; `find.js` searches for a board under such conditions (bigger board, polyominoes of
2+ tiles, no area number, ...). What the author asked for so far: boards of 2 tiles are too small to show the logic, 1x1 polyominoes
are too simple, earlier decisions that are not the point of the example are left out, and the page says "polyomino", never "stamp".
A variant of a rule shares the plain rule's example ("Forced growth (Minimum)" opens "Forced growth": `_alias` in `curated.json`),
and a rule whose only example nobody can read gets none (`_remove`) rather than a confusing one.
When a solver change can move when rules fire, refresh them with `dev/tools/examples/` (see its README)
and check with `tests/page/ui_test_examples_V1.0.17.js`.

## How a new version is made

Releases are not edited by hand. Each release is a pair of Python patch scripts in `dev/build/` that turn the previous page into the next one:

- `patch_coreNN.py <in.js> <out.js> [indent]` patches the solver core. Its docstring explains the new deduction.
- `patch_ui_V1.0.x.py <old.html> <new.html>` imports the core patch, applies it to the page's embedded core, and makes the UI changes.
  `--import-core dev/reference/import-core.js` patches the reference importer in place.

Each replacement anchors on an exact substring and aborts if it is not found exactly once. A release produces the new
`glimmith_solver_V1.0.x.html`, a new `dev/reference/solver-core.vNN.js` and a README section. Version names go V1.0.1, V1.0.2, and so on
for each change. Use V1.1 and up only when the author says a version is a big step, and never before the rewrite list is done (see above). The core number (`vNN`) increments independently.
