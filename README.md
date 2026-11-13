# Glimmith solver

Versions: V1.0.1, V1.0.2, ... for each change; V1.1 and up only when the author says a version is a big step.

A single-page editor and uniqueness solver for Glimmith puzzles. Open `glimmith_solver_V1.0.6.html` in a browser; nothing to install, nothing
is sent anywhere.

* **Draw or import a puzzle**, press Solve, and the solver tells you whether it is unique, not unique or impossible.
* **Step by step**: after a solve, walk through what the solver proved, one deduction at a time.
* **Import puzzles…** takes a puzzle file, a zip of puzzles, or a file saved with Export.
* **Fast import** reads the game's own folders as they are (no zip). Point it once at
  `C:\Program Files (x86)\Steam\steamapps\workshop\content\4160210` (workshop puzzles) and `%LOCALAPPDATA%\Geri\Saved\workshop` (your own puzzles).
  Chrome and Edge remember the folders, so later imports are one click; other browsers ask for the folder each time.
* **Custom rules** (button at the bottom of the page): Omits, Wally, Heterogeneous and Links are not in the base game.

## V1.0.6

Step by step: tiles the solver knows are in one piece share a colour from the step it knows it, also when they do not touch yet
(this replaces the letters). A group gets its colour when a step joins tiles that do not touch; every tile joined to it later takes the
same colour, two coloured groups that meet keep the older one, and a finished piece keeps its colour. The colours come from a pool of
25; a finished piece gives its colour back, so one is used twice only when 25 unfinished groups are coloured at once. Solver (core
v98, label-join): when every piece holds exactly one rose of each type (or one symbol, or one of the area numbers), a tile that can
only be in one of those pieces is joined to it even when they do not touch ("this rose can only go with that rose"); before, that was
only used for two neighbouring tiles. It is its own step ("Only one piece it can be in").

## V1.0.5

Gemini anchor: when both pieces of a Gemini wall have a closed straight line of the same length and one of them can not make a second
one, the copy must send line onto line; the solver tries those 4 ways and keeps what they agree on (Doubt & Certainty is now unique in
about 2 s). Import: custom rules named in a workshop description (Wally, Heterogeneous; not Links or Omits) are switched on, with a
pop-up saying so.

## V1.0.4

Workshop puzzles that name Wally in their title or description ("Special Rule: Wally") are imported with Wally on (the game files
have no line for it, so Fast import used to solve them without Wally). The edge under a narrow search is no longer drawn (it blinked).

## V1.0.3

Wally: two ends per piece. Every Wally piece is a path with two ends (a tile with 3 walls), a ring or a single tile: a piece never
gets a third end, a piece with both ends known goes through every other tile (and is whole once its tiles are linked end to end), and the
ends can not outnumber two per piece (two rose types with every rose a dead end: every piece starts and ends at its roses).

## V1.0.2

The propagation steps run fastest first inside each of their three blocks (Bricky and Loopy now come first among the rules that use
piece sizes). A third of the campaign at 5 s each: same verdicts except two puzzles near the limit (one gained, one lost), about 2 %
faster in total, no wrong edge.

## V1.0.1

Wally + Gemini lines: the two pieces of a Gemini wall have the same straight lines. When one side holds a line of 4 that can still grow
and the other side can not get a new line of 4 anywhere (every place is refuted), the line can only end with a length the other side
already has (next to a closed line of 5: it grows by exactly one tile). Step name: "Wally + Gemini: lines of the same length".

The solver has been run on the 1,225 base game puzzles: it took under 10 min to prove all of them were unique
(`dev/results/corpus_run_userpass5.summary.md`).

## Folder layout

| Path | What |
|---|---|
| `glimmith_solver_V1.0.6.html` | The whole application (editor, solver, importer) in one file. |
| `dev/reference/solver-core.v98.js` | The solver core as a Node module, used by the tests and tools: the same code as in the page (four comment lines differ). |
| `dev/reference/import-core.js` | The puzzle-file reader, same code as in the page. |
| `dev/test_*.js`, `dev/fuzz_*.js` | Solver tests. The fuzzers compare the solver with an independent brute force (`oracle.js`) on small boards. |
| `dev/ui_test_*.js` | Page tests (jsdom). |
| `dev/tools/run_corpus.js` | Times the solver on every puzzle of a corpus and writes a report. |
| `dev/game_puzzles*`, `dev/user_puzzles`, `dev/puzzles` | Puzzles used by the tools and tests. |
| `dev/build/` | The changes since V1 as scripts: `patch_core94.py` + `patch_ui_V1.0.1.py` (V1 -> V1.0.1), `patch_core95.py` + `patch_ui_V1.0.2.py` (V1.0.1 -> V1.0.2), `patch_core96.py` + `patch_ui_V1.0.3.py` (V1.0.2 -> V1.0.3), `patch_ui_V1.0.4.py` (V1.0.3 -> V1.0.4, page only), `patch_core97.py` + `patch_ui_V1.0.5.py` (V1.0.4 -> V1.0.5), `patch_core98.py` + `patch_ui_V1.0.6.py` (V1.0.5 -> V1.0.6). |
| `dev/tools/steptiming/`, `dev/results/step_timing_v94.md` | Time of each propagation step over the campaign (what the V1.0.2 order is based on). |
| `dev/workshop_wally/` | The 21 Wally puzzles of the Steam workshop collection as one export file (Wally switched on: the game files can not say it), and their results. Run with `node tools/run_export.js workshop_wally/wally_workshop_21.glimmith.json 60 2`. |
| `docs/handoffs/` | Development notes, oldest to newest. `HANDOFF_V1.0.5.md` is the last summary. |

## Running the tests

```
cd dev
npm install                      # jsdom, for the page tests only
node test.js                     # solver tests: node test_*.js
node fuzz_clue92.js 300 1        # fuzzers: node fuzz_*.js <puzzles> <seed>
node ui_test.js                  # page tests: node ui_test_*.js [page.html]
node tools/run_corpus.js         # the campaign run (see the header of the file for options)
```

The page is the source of truth. If you change the solver inside it, copy the block between `SOLVER CORE` and the import core into
`dev/reference/solver-core.v98.js` (remove the two-space indent) so the tests run the same code.
