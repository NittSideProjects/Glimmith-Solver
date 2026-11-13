# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-page editor and uniqueness solver for puzzles from the game *The Artisan of Glimmith*. The whole app (editor, solver, importer, UI) is one
self-contained HTML file, `glimmith_solver_V1.0.9.html`, with no build step and no network use. `dev/` holds the Node test suite and tools.

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
npm install                      # jsdom, only needed by the ui_test_* page tests
node test.js                     # main solver test suite (269 checks); other solver tests: node test_<name>.js
node fuzz_<name>.js <N> <seed>   # fuzzer, e.g. node fuzz_clue92.js 300 1
node ui_test.js [page.html]      # page tests in jsdom; every ui_test_*.js takes the page path as argv[2]
node tools/run_corpus.js ...     # timing run over the campaign corpus (options in the file header; needs the game puzzles)
```

There is no test runner, linter or bundler: each script is standalone and prints its own pass/fail counts. Known baseline failures
inherited from V1: `ui_test_import.js` 17/27 and `ui_test_export32.js` 14/24 (and `ui_test_deduce.js` 35/38 in this cloud
environment: three timing checks on the live solving animation).

`GLIMMITH_CORE=<path>` makes the shared scripts load another solver core. Without it, `corepath.js` picks the highest
`dev/reference/solver-core.vNN.js`. Some fuzzers `require` a fixed core version directly instead.

## Architecture

- **The page is the source of truth.** Inside `glimmith_solver_V1.0.9.html` the main `<script>` contains, in order: the `SOLVER CORE`
  block (pure functions; its banner comment is the full core version history), the deduction solver (`deduceSolve`: propagation steps,
  probes, narrow per-edge searches, then an exact final search), the import core (puzzle file, zip and workshop folder parsing), then the
  UI code.
- **`dev/reference/` mirrors the page** as Node modules: `solver-core.vNN.js` is the page's `SOLVER CORE` block with the two-space indent
  removed (a few comment lines differ), and `import-core.js` is the importer. After changing the solver in the page, copy it back into the
  reference core so the tests run the same code.
- **Testing strategy:** `fuzz_*.js` compare the full solver with a brute-force oracle (`oracle.js`, plus `fuzzlib.js` for planted random
  boards) on small boards. A deduction is only accepted if it never disagrees with the oracle. `test.js` holds hand-built cases.
- **Puzzle model:** edges are keyed `v:c,r` / `h:c,r` in a `Map` of edge types (`wall`, `delta`, `gemini`, `lt`/`gt`, `diffN`, ...). The
  solver decides for each open edge whether it is a wall or joins two tiles of the same piece. Clues (roses, area numbers, compasses,
  palisades, watchtowers, polyomino bank) and the base-game and custom rules (Wally, Links, Omits, Heterogeneous) constrain the pieces.

## How a new version is made

Releases are not edited by hand. Each release is a pair of Python patch scripts in `dev/build/` that turn the previous page into the next one:

- `patch_coreNN.py <in.js> <out.js> [indent]` patches the solver core. Its docstring explains the new deduction.
- `patch_ui_V1.0.x.py <old.html> <new.html>` imports the core patch, applies it to the page's embedded core, and makes the UI changes.
  `--import-core dev/reference/import-core.js` patches the reference importer in place.

Each replacement anchors on an exact substring and aborts if it is not found exactly once. A release produces the new
`glimmith_solver_V1.0.x.html`, a new `dev/reference/solver-core.vNN.js` and a README section. Version names go V1.0.1, V1.0.2, and so on
for each change. Use V1.1 and up only when the author says a version is a big step. The core number (`vNN`) increments independently.
