# Glimmith solver

Versions: V1.0.1, V1.0.2, ... for each change; V1.1 and up only when the author says a version is a big step.

A single-page editor and uniqueness solver for Glimmith puzzles. Open `glimmith_solver_V1.0.26.html` in a browser; nothing to install, nothing
is sent anywhere.

* **Draw or import a puzzle**, press Solve, and the solver tells you whether it is unique, not unique or impossible.
* **Step by step**: after a solve, walk through what the solver proved, one deduction at a time.
* **Import puzzles…** takes a puzzle file, a zip of puzzles, or a file saved with Export.
* **Fast import** reads the game's own folders as they are (no zip). Point it once at
  `C:\Program Files (x86)\Steam\steamapps\workshop\content\4160210` (workshop puzzles) and `%LOCALAPPDATA%\Geri\Saved\workshop` (your own puzzles).
  Chrome and Edge remember the folders, so later imports are one click; other browsers ask for the folder each time.
* **Custom rules** (button at the bottom of the page): Omits, Wally, Heterogeneous and Links are not in the base game.

## V1.0.26

Every tile keeps the exact set of sizes its piece can have, holes included (core v106, the third step of making the rules share
their facts). V1.0.25 kept a lowest and a highest size; now a tile can also know "1 or 5, but not 2, 3 or 4". The sets come from the
walls that compare sizes (a difference 2 from a piece of 3 leaves 1 or 5), from Size Separation and Mingle Shape (a pinned
neighbour across a wall takes its size away), from the shape bank (only the sizes of the bank shapes a group still fits), and from a
new Delta check: a side pinned to a size with a single shape (1 or 2 tiles; with Boxy any prime size; with a bank, the bank decides)
takes that size away from the other side. Each step starts from the sets found so far, and "Different sizes" now also separates two
groups whose ranges overlap but whose sets have no size in common. Sizes up to 30 are kept one by one, bigger sizes as a range. On
278 campaign puzzles with these rules: same verdicts, 336 more edges decided in the first pass (Difference +198, Mingle Shape +69,
Gemini / Delta +59); the time is about the same except one Size Separation puzzle whose final search takes 15% longer. New:
`tests/solver/test_sizeset106.js`. No new text on the page.

## V1.0.25

Every tile keeps the size range of its piece (core v105, the second step of making the rules share their facts). Until now each
group's lowest and highest size was worked out again at every pass from the clues alone (area numbers, polyominoes, compasses,
palisades, Precision / Minimum / Maximum, ...), and what the other steps found on top (the walls that compare sizes, the reach of a
group, the closed-in areas, the number of pieces, Match, Heterogeneous, Gemini / Delta) was forgotten at the end of the pass. Now
those bounds are kept on the tiles and a piece's range is the overlap of the ranges of its tiles, so forced growth, reach, "too big"
and the rest start from everything found so far. Two groups whose ranges have no size in common are separated by a new step,
"Different sizes". Probes and searches undo the ranges with the edges. On 374 campaign puzzles with size relations, compasses and
area numbers: same verdicts, 201 more edges decided in the first pass (147 of them in the Inequality puzzles), 397 s -> 368 s (the
Difference puzzles 62 s -> 40 s). New: `tests/solver/test_tilesize105.js`. The new texts are on the rewrite list.

## V1.0.24

The number of pieces, as one range shared by every rule (core v104, the first step of making the rules share their facts). The
solver now works out once the fewest and the most pieces any tiling can have, and for each size the fewest and most pieces of that
size, from everything that counts pieces: the roses, Solitude, the size rules and the shape bank, the pieces the area numbers and
polyominoes need (three tiles numbered 2 need at least two pieces of 2), Heterogeneous (one piece per size), Mismatch (no more pieces
of k tiles than shapes of k tiles) and the user's limit. Match is left to its own size check, which is already stricter. Having both ends lets them meet: area numbers that add up to the
board fix the count, and a Mismatch bank whose shapes fill the board exactly is used once each. A board with no possible count is
impossible at once ('no number of pieces fits all the rules and clues'), and during the solve the areas closed in by walls must add
up to the count: a new step, "Number of pieces in closed-in areas", makes an area one piece, or every group in it a piece of its own.
The Mismatch size count of v62 now uses these per-size limits for every rule. On 369 campaign puzzles of the counting categories:
same verdicts, 57 more edges decided in the first pass, 176 s -> 164 s. New: `fuzz/fuzz_count104.js` (every true tiling against the
bounds), `tests/solver/test_count104.js`. The new texts are on the rewrite list.

## V1.0.23

The never-shown solver texts leave the page (the author's [remove]); the solver logic behind them stays. The hidden solver-limit
inputs and every message about limits are gone (limits a puzzle file carries are still given to the solver as hints), as are the
hidden "Solver tuning" panel (the solver keeps the settings it had) with its "Exact solver only" run, and the "Search limit
reached" message (there is no node limit). `ui_test_limits.js`, which tested the removed inputs, is retired. Page only, core v103.

## V1.0.22

The author's rewrites (page only, core v103). 62 finished rewrites from the rewrite page are on the page, with only his typos fixed
(`dev/build/typos_V1.0.22.json` lists each fix). His notes: the one-line definitions at the top of 22 rule boxes of the footer, the
Bricky "Placements" point, the Omits hint, the "Rule" label of the rules panel, "and the Omits" in one message and two screen-reader
names are removed; two points are split in two (Inequality, Palisade) and the Loopy definition is now a point; the range chip's
remove button says "Remove rule". Left for him: one text he was still writing, three rewrites whose meaning differs from what the
solver does, and the notes that ask a question. Tools: `clean.js` takes a pins file (IDs stay with their answers), `applied.json`
(the list counts applied texts as done), and `extract.js` no longer drops a menu whose box has no label.

## V1.0.21

"Show cases", third round (page only, core v103). When the first try leaves cases open, the page asks the solver again with deeper
limits (8 splits, 40 cases). Only the cases that fail are listed; ways that break no rule within the limits get one sentence, and a
step with no failing case says it was proved by a longer search instead of listing open cases. More than four cases are folded,
one line each. A failure that is a count over the whole board says so (there is no place to ring). The reasons a check gives say
"polyomino" where they said "stamp" (8 texts).

## V1.0.20

"Show cases" says where a case fails far more often (core v103). Twenty more checks note the group or tiles at fault (no shape or
place left for a group, a closed-in area whole pieces can not cover, a rectangle that can not grow, sizes ruled out by the walls
that compare sizes, a watchtower count, ...). On a sample of 155 puzzles, 98% of the proofs by contradiction are explained by one
case and 77% of them now ring the place (16% before); the rest fail on a count over the whole board, which has no single place. The
cases of a "far apart, but one piece" step found by trying the tiles apart are now found too (the full rules run on that
assumption, as in the solver's own check). A normal solve is unchanged. Tests: `tests/solver/test_explain102.js`.

## V1.0.19

"Show cases" on the proofs by contradiction (core v102). A step "checked by trying the other way", a step "checked by search" and a
"far apart, but one piece" step found by trying the tiles apart have a "Show cases" button beside "Show example". Its pop-up shows
what the solver tried and why it fails: the board before the step with the tried value in red, every edge the rules then decide
outlined, the rules that decided them in order, the reason of the contradiction and, when the solver knows them, the tiles where
it happens ringed in red. When one try is not enough the case is split on the nearest open edge (up to four times) and every case
gets its board; if that still leaves cases open the pop-up says the solver's own proof was a longer search. The cases are worked
out when the button is clicked (`opts.explain` on a replay of the position). A normal solve is unchanged (v101 and v102 give the
same events on 3,700 random boards). Tests: `tests/solver/test_explain102.js`, `tests/page/ui_test_cases_V1.0.19.js`.

## V1.0.18

Reach cap (core v101). A group on a wall that compares sizes now has at most the tiles it can still reach (through edges that are
not walls, never into another piece). So "this piece has 3 or 4 tiles" is known, and the piece across a Difference wall gets its
size from it and grows by the rules. On the puzzle that showed the gap (sent by the author, not in the repository) a piece in a
pocket is now linked out through its neck by three rule steps, where the solver went to the final search before. On the page with its default settings that puzzle went from 9.0 s to 1.6 s (measured in a browser): with those
links known, the short exhaustive attempt that runs before the edge-by-edge tests finishes. With "Ignore edge by edge if exhaustive
would be faster" unticked it still takes about 25 s: every edge is then tested on its own first. A link a
group needs to reach a size asked by such a wall is tagged "Walls that compare sizes" (it showed as "Reach (Minimum)"). All 41
fuzzers at 120 puzzles: no mismatch. Tests: `tests/solver/test_reachcap101.js` (synthetic boards).

## V1.0.17

The experimental "buffer guess layer" for compass puzzles is removed (core v100). It dated from v38: random pieces drawn per compass,
turned into red "rough guesses" and searched with. The compass rules and the far joins added since do its job, and only its own
button used it. Gone from the solver: the sketch block (`cmpSampler`, `sketchRun`, `jointAttempt`, `guessSolve`, `guessLayerRun`),
the options `sketch`, `guessLayer` and `jointTest`, and the pass it kept (`lastPass`): about 330 lines. Gone from the page: the
button and its row, the three red legend entries, the red layers of the overlay and the code that drew them. A normal solve does
exactly what it did: v99 and v100 give the same decisions, in the same order, on 4,100 random small boards (1,300 with a compass),
and every fuzzer and test gives the same result. Tests: `tests/page/ui_test_noguess_V1.0.17.js`.

## V1.0.16

Second round of the author's remarks on the rule examples. "Forced growth (Minimum)" and "Reach (Minimum)" open the example of
"Forced growth" and "Reach" instead of having their own; "Polyomino: shape" has no example (none readable was found), so 92 rules
are numbered. "Too big for the size rules" uses the author's puzzle; "Roses: one of each type per piece" shows no piece colours.
The step "Polyominoes of the same shape, far apart" is now titled "Two polyominoes of the same shape, two pieces". Page only, core
v99. Tests: `ui_test_examples_V1.0.16.js`.

## V1.0.15

The author's first remarks on the rule examples (rules 1 to 16). His own puzzles for Forced growth, Reach, Roses: the way to a missing
rose and Must still fit a bank shape; bigger hand-made boards for Too big for the size rules, Roses: narrow passage (a passage two
tiles wide), Polyomino: size, Polyominoes of the same shape and Must still fit the shape. An example can show a chosen step of its
puzzle and leave out edges of earlier steps that are not its point (`dev/tools/examples/curated.json`, `curate.js`, `find.js`,
`show.js`). The step titles, step texts and example lines say "polyomino" where they said "stamp" (the "why" texts inside the solver
core still say "stamp": they change with the next core). Page only, core v99. Tests: `ui_test_examples_V1.0.16.js`.

## V1.0.14

The rule examples are numbered: every rule has its number in front of its title in both pop-ups, and every board its own number above
it (12.1, 12.2, ...). Page only, core v99. Tests: `ui_test_examples_V1.0.16.js`.

## V1.0.13

Rule examples made tiny. Every example now uses only the mechanic of its rule (one rule, one kind of clue or wall; two when the rule is
about two), helped by nothing but area numbers and plain walls, on a board of 2 to 11 tiles, one clue per tile as in the game. A rule
with several kinds of cases shows up to four boards side by side ("Walls that compare sizes": a Difference wall that joins, one that
cuts, a Gemini wall, an Inequality wall). The pop-up is a one-line explanation and the boards; under a board only what it cannot show
is named (rules that are on, shape bank, Omits). 95 rules, 125 boards, found by `dev/tools/examples/tiny.js` + `minimize.js`. Titles
for two steps that showed their internal name (ban-fit, range-count). Page only, core v99.
Tests: `ui_test_examples_V1.0.16.js`.

## V1.0.12

Rule examples. A rule step (and a "one piece" step) has a "Show example" button: a pop-up with the smallest puzzle found where the
solver uses that rule, at that step (the edges it decides outlined), with what is in the puzzle (the rules that are on, the shape bank
and Omits drawn, the kinds of clues and special walls, each with its one-line meaning) and the step's text. "Show all examples" in the
rules footer shows every one (78 rules). The puzzles are synthetic (from the fuzzers, see `dev/tools/examples/`); rules no short search
reached yet have no button. Steps that showed an internal name ("Rule: box-all") now have a title and a text, and rules that decide both
walls and links have one combined text.

## V1.0.11

Step by step, rewritten: every rule step says what the rule is (when it is needed), what the solver checked, and what that gives,
without double negatives. A rule text that does not end on its result gets it added by the page ("So the outlined edge is a wall.",
"So the outlined edge is open: the two tiles are in one piece.", or the counts when a step decides both). The start step says that each
step outlines the edges it decides. A first attempt for the author to check on the rewrite list.

## V1.0.10

New wording: the author's rewrites so far (header, credits, puzzle list and import, tools, shape bank and Omits, rules, solver
messages, reasons a puzzle is impossible). Step by step: every step now says what is true first ("These two tiles are in one piece",
"There is a wall here") and then why, instead of "No wall here is impossible" / "Suppose there were a wall ... so there is no wall";
rule texts that were double negatives say the same thing positively, and the clue-grouping walls have a title ("Two clues, two pieces").
The tools that list the page text for the rewrite are in `dev/tools/rewrites/`.

## V1.0.9

Step by step: two neighbouring tiles known to be in one piece are linked on the step that shows it. The solver (core v99) now links
every open edge inside a joined group at the start of the next propagation pass, before any other rule, and reports a far join right
before the decisions that followed it (before, those links came from the basic check after every other rule had nothing left, up to
twenty decisions later, and the step view drew them on unrelated steps). The step view also treats a link between tiles it already
showed to be in one piece as part of the current step, whatever rule the solver names for it. No verdict changes (the same links were
decided before, only later).

## V1.0.8

Delete / Backspace with the mouse on a wall spot removes the wall rule there (Delta, Gemini, Inequality, Difference, Link), the same
as pressing that rule's key again. A plain wall stays (it is drawn and removed with the mouse); on a tile, Delete still removes the symbol.

## V1.0.7

Fast import when the browser blocks the folder. Chrome and Edge do not let a page keep access to folders inside Program Files or
AppData, and both game folders are there, so choosing them can end with "can't open this folder because it contains system files"
and no way to go on. When the folder picker gives no folder, the Fast import box now shows a help block (a "Folder blocked?" link opens
it too) with a "Read once" button for each folder: it uses the classic folder upload, which asks for the folder each time but is not
held to that rule (the browser may call it an upload; the files are read on your computer). The help also gives the two ways that
always work: copy the folder somewhere else and choose the copy, or zip it and open the zip with Import puzzles….

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
| `glimmith_solver_V1.0.26.html` | The whole application (editor, solver, importer) in one file. |
| `dev/reference/solver-core.v103.js` | The solver core as a Node module, used by the tests and tools: the same code as in the page (four comment lines differ). |
| `dev/reference/import-core.js` | The puzzle-file reader, same code as in the page. |
| `dev/tests/solver/`, `dev/fuzz/` | Solver tests and fuzzers. The fuzzers compare the solver with an independent brute force (`oracle.js`) on small boards. |
| `dev/tests/page/` | Page tests (jsdom). |
| `rewrite/` | The rewrite list: every text of the page, one file per part of the page, with the author's own wording (see `rewrite/README.md`). |
| `dev/tools/run_corpus.js` | Times the solver on every puzzle of a corpus and writes a report. |
| `dev/game_puzzles*`, `dev/user_puzzles`, `dev/puzzles` | Puzzles used by the tools and tests. |
| `dev/build/` | The changes since V1 as scripts: `patch_core94.py` + `patch_ui_V1.0.1.py` (V1 -> V1.0.1), `patch_core95.py` + `patch_ui_V1.0.2.py` (V1.0.1 -> V1.0.2), `patch_core96.py` + `patch_ui_V1.0.3.py` (V1.0.2 -> V1.0.3), `patch_ui_V1.0.4.py` (V1.0.3 -> V1.0.4, page only), `patch_core97.py` + `patch_ui_V1.0.5.py` (V1.0.4 -> V1.0.5), `patch_core98.py` + `patch_ui_V1.0.6.py` (V1.0.5 -> V1.0.6), `patch_ui_V1.0.7.py` (V1.0.6 -> V1.0.7, page only), `patch_ui_V1.0.8.py` (V1.0.7 -> V1.0.8, page only), `patch_core99.py` + `patch_ui_V1.0.9.py` (V1.0.8 -> V1.0.9), `patch_ui_V1.0.10.py` + `rewrites_V1.0.10.json` (V1.0.9 -> V1.0.10, page only), `patch_ui_V1.0.11.py` (V1.0.10 -> V1.0.11, page only), `patch_ui_V1.0.12.py` + `rule_examples_V1.0.12.json` + `step_info_extra_V1.0.12.json` (V1.0.11 -> V1.0.12, page only); `patch_ui_V1.0.13.py` + `rule_examples_V1.0.13.json` (V1.0.12 -> V1.0.13, page only); `patch_ui_V1.0.14.py` (V1.0.13 -> V1.0.14, page only); `patch_ui_V1.0.15.py` + `rule_examples_V1.0.15.json` (V1.0.14 -> V1.0.15, page only); `patch_ui_V1.0.16.py` + `rule_examples_V1.0.16.json` (V1.0.15 -> V1.0.16, page only); `patch_core100.py` + `patch_ui_V1.0.17.py` (V1.0.16 -> V1.0.17); `patch_core101.py` + `patch_ui_V1.0.18.py` (V1.0.17 -> V1.0.18); `patch_core102.py` + `patch_ui_V1.0.19.py` (V1.0.18 -> V1.0.19); `patch_core103.py` + `patch_ui_V1.0.20.py` (V1.0.19 -> V1.0.20); `patch_ui_V1.0.21.py` (V1.0.20 -> V1.0.21, page only); `patch_ui_V1.0.22.py` + `rewrites_V1.0.22.json` + `typos_V1.0.22.json` (V1.0.21 -> V1.0.22, page only); `patch_ui_V1.0.23.py` (V1.0.22 -> V1.0.23, page only); `patch_core104.py` + `patch_ui_V1.0.24.py` (V1.0.23 -> V1.0.24); `patch_core105.py` + `patch_ui_V1.0.25.py` (V1.0.24 -> V1.0.25); `patch_core106.py` + `patch_ui_V1.0.26.py` (V1.0.25 -> V1.0.26). |
| `dev/tools/steptiming/`, `dev/results/step_timing_v94.md` | Time of each propagation step over the campaign (what the V1.0.2 order is based on). |
| `dev/workshop_wally/` | The 21 Wally puzzles of the Steam workshop collection as one export file (Wally switched on: the game files can not say it), and their results. Run with `node tools/run_export.js workshop_wally/wally_workshop_21.glimmith.json 60 2`. |
| `docs/handoffs/` | Development notes, oldest to newest. `HANDOFF_V1.0.5.md` is the last summary. |

## Running the tests

```
cd dev
npm install                      # jsdom, for the page tests only
node tests/solver/test.js        # solver tests: node tests/solver/test_*.js
node fuzz/fuzz_clue92.js 300 1   # fuzzers: node fuzz/fuzz_*.js <puzzles> <seed>
node tests/page/ui_test.js       # page tests: node tests/page/ui_test_*.js [page.html]
node tools/run_corpus.js         # the campaign run (see the header of the file for options)
```

The page is the source of truth. If you change the solver inside it, copy the block between `SOLVER CORE` and the import core into
`dev/reference/solver-core.v103.js` (remove the two-space indent) so the tests run the same code.
