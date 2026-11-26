# Glimmith solver

Versions: V1.0.1, V1.0.2, ... for each change; V1.1 and up only when the author says a version is a big step.

A single-page editor and uniqueness solver for Glimmith puzzles. Open `glimmith_solver_V1.0.57.html` in a browser; nothing to install, nothing
is sent anywhere.

* **Draw or import a puzzle**, press Solve, and the solver tells you whether it is unique, not unique or impossible.
* **Step by step**: after a solve, walk through what the solver proved, one deduction at a time.
* **Import puzzles…** takes a puzzle file, a zip of puzzles, or a file saved with Export.
* **Fast import** reads all your puzzles in one click. Set it up once: the Fast import box gives a small setup file (Windows or Linux)
  that makes a folder `Glimmith puzzles` of links to the game's puzzle folders; choose that folder once.
* **Custom rules** (button at the bottom of the page): Omits, Wally, Heterogeneous and Links are not in the base game.

## V1.0.57

The solver's rules run in the author's order (core v134). When several rules could decide something at the same moment, the solver
used to take the first one in the order the code was written in (cheap rules first). The author compared 235 such moments from the
campaign on a comparison page and ranked the rules by which one a person would naturally see first (`dev/tools/rule_order/`,
`order_2026-11-26.md`). The rules are now numbered blocks run in a table order built from that ranking
(`dev/build/step_order_V1.0.57.json`): Bricky, the rose pairs, area numbers in closed-in areas, watchtowers and the size walls come
early; Forced growth and Reach in the middle; the wide searches (every place a shape fits, one connection between two sides, the
compass placements, Gemini / Delta, roses narrow passage, the walls that compare sizes, the wall budget) last. The step-by-step
view now follows that order. On the 1,225 campaign puzzles all are still unique, every step agrees with the stored solution, the
time is the same as V1.0.56 (680 s against 653 and 682 s in two V1.0.56 runs), and the probes leave 51 more edges (of 88,000) to
the final search. All fuzzers agree with the oracle. One fix during the work: the sizes that the walls comparing sizes leave each
group are now worked out before the area-number rules that read them (in the first build of this order 24 puzzles came out
impossible; the stress test in `dev/tools/rule_order/stress.js` moves every block to the front and to the back without a problem).

## V1.0.56

The proofs by contradiction try the most promising edges first (core v133). Before, every round tried the open edges by their
distance to a clue. Now each edge gets a score: a clue on one of its tiles, a special wall (palisade, gemini, size wall...), a tile
whose piece size is known, a decided wall or link beside it, or a watchtower at one of its ends all raise it, and a clue on both
tiles lowers it. The weights were tuned on 150 campaign puzzles (10 per zone and difficulty 1 to 5) and then checked on all 1,225:
the same answers, 5% fewer proofs by contradiction (4,314 to 4,108, most of the gain on difficulty 4 and 5), and about the same
time. The corpus run on core v133: all 1,225 unique, 13.9 min of solver time (13.7 min on v132). All fuzzers agree with the
oracle. Only the order changes: every edge is still tried until a round decides nothing, so the solver finds what it found before.

## V1.0.55

The V1.0.54 reach check now also tightens the size limit that walls comparing sizes (inequalities, differences, delta, gemini) give a
piece: the tiles a group can still reach no longer count groups that would make the piece too big (core v132). The fuzzers for those
walls agree with the oracle; the 1,225 campaign puzzles are all unique, in the same time.

## V1.0.54

Smarter reach (core v131). The reach rule (a group must still be able to reach enough tiles for its piece) walked through the tiles of
other groups as if they were free. A piece that holds a group and one tile of another group holds that whole group, so when the
group, the tiles on the way and that other group together are more than the piece may have, the walk now stops there. On the
author's "Dungoen" (precision 17) a group whose lower way out led through one free tile into finished pieces was proved by trying the
other way; reach now sees it directly: 21 s -> 1.3 s, 76 -> 34 edges proved by trying the other way, 9 -> 0 by search. All 46 fuzzers
agree with the oracle; the 1,225 campaign puzzles are all unique, in the same time.

## V1.0.53

Clearer "Show cases" (the pop-up of a step checked by trying the other way):
* the choice the solver tries is drawn as what it is, a red wall or a red link (it was a yellow outline of its two tiles with a dashed
  ghost on every frame);
* when the tried choice closes in an area that pieces of the allowed sizes can not cover, the red ring is now around the smallest such
  area, whole (core v130). It rang the first area in board order cut to 60 tiles, so on boards like a precision-17 "dungeon" it ringed
  the top-left corner, far from the tried wall.
Only the newest page is kept in the repository from now on (git history has the older ones); the tests find it on their own.

## V1.0.52

Solve marks. While making a puzzle you often already know some walls and links (a part you have checked, independent of the rest).
The **Solve marks** button (beside Clear all symbols) turns on a mode where a click on a wall spot puts a wall mark, L a link mark,
and a second click (or Backspace) removes it; tiles can not be changed by mistake in this mode. Marks are drawn in their own colour,
are not part of the puzzle (kept with it in the page, never exported) and **Clear solve marks** removes them all. Check Uniqueness,
the step-by-step and Show cases take them as given, so the solver only checks the rest; the result then says how many marks it took
as given (it holds only if they are right). New test: `dev/tests/page/browser_test_solvemarks_V1.0.52.js`.

## V1.0.51

The page no longer freezes while the solver works. The solver now runs in a Web Worker (its own thread), made from the page's own
solver code (still one file, nothing downloaded), and sends each thing it finds to the page at once. Before, one long solver step
(a propagation pass, the probes, a final-search node) blocked the page for seconds: no progress shown, Cancel only after the step.
Measured in Chromium with the page opened as a file: the longest freeze went from 3.1 s / 3.5 s to about 30 ms on the slow
campaign puzzles, at the same solve times; Cancel now takes under 0.1 s (was up to 5 s). Where a browser does not allow the worker,
the page solves as before. The solver itself does not change (core v129). New test: `dev/tests/page/browser_test_worker_V1.0.51.js`
(Playwright + Chromium).

## V1.0.50

Two more steps go (core v129): matchCover (a Match size is kept only if some shape of it can cover every tile) and reachCompass (the
reach count does not pass through a compass group that cannot join). Each decided a few edges on a single campaign puzzle (1 and 2
edges) and nothing elsewhere; without them both puzzles are still solved, unique and as fast. No page text changes.

## V1.0.49

Simpler solver (core v128): seven steps that the base game never needs are gone. A rule ablation (`dev/tools/rule_ablation.js`,
`dev/results/rule_ablation_v127.md`) turned each step off in turn on the 1,225 campaign puzzles. These seven never decided an edge
that the other steps miss, and none of them, alone or together, makes the final search slower: areaColourReach, boxAfterRel,
boxAllProbe, compassCap, reachParts, splitGrow, mingleConnect (its reason text goes with it). All 1,225 puzzles are still unique,
in the same time. Kept although they also decide nothing on their own: crossMark, regionMerge, matchIso, matchIsoK, matchShape,
matchSplit (without them the final search times out or is much slower on some puzzles), basicFirst, areaPair and sameLinksEarly
(they are there for the step-by-step: the author's rule order, and links shown at once), and the Wally steps (no base-game puzzle
uses Wally).

## V1.0.48

One more speed fix (core v127). The compass tile probes (join a tile to a compass's group, propagate, a contradiction = that tile
is not in the piece) may take 400 ms per propagation pass on small boards. With the rules added since, each trial goes further, so
they no longer finished in one pass: on a base-game compass puzzle they ran 400 ms on five passes and found nothing (6.5 s, core
v97 4.0 s). They now get 400 ms per solve in all. On the 54 small compass puzzles of the base game only that one changed (6.5 s ->
4.0 s, same edges decided).

## V1.0.47

More speed, from the puzzles that were still at least twice as slow as with core v97 on the same machine (core v126; the same
deductions, checked on the fuzzers and the full base-game run):
- The shape of a finished group beside a Delta or Gemini wall was worked out again on every propagation pass; it is now kept.
- The size count (which sizes are used up, run for every puzzle since the piece count of V1.0.24) worked out each group's one
  possible size again for every size; now once per group.
- The reach cap (V1.0.18) and the label-join (V1.0.6) still run in the steps and the probes, where they decide edges, but no longer
  inside the final search, where they made it visit more nodes (a base-game puzzle 9.9 s -> 2.0 s).

## V1.0.46

Speed fixes found by comparing the full base-game run with the author's last run (core v125). Checked on the fuzzers and the full
base-game run (1225 unique; on the same machine the median puzzle is 1.09x the time of core v97, `dev/results/timing_v125.md`).
- On compass puzzles, a check asks whether a piece can still reach a rose of each type it needs while adding no more tiles than
  its compass still allows on a side. It started from every tile of the piece at no cost. Since the label-join step of V1.0.6, a
  piece can be known to hold two tiles that do not touch yet, and the check let the far tile act as a free starting point, as if
  the tiles linking the two cost nothing. It now starts from one part, and every other part must be reached within the compass's
  count too (also when the far part already holds the rose that was needed). Not inside the final search, where it cost more than
  it saved. On a base-game compass puzzle the steps now decide every edge in 0.1 s instead of 15 s.
- On a puzzle with roses of one type, the clue search gets 20 s before the other searches take turns (it was 10 s). A base-game
  rose puzzle needs about 15 s of it on a slower machine and took 34 s; now 19 s.

## V1.0.45

A speed fix found by the full base-game run (core v124). Propagation runs passes until nothing changes. Since core v108, a trial
inside a pass (assume a join, propagate, undo it) could leave behind the flag that says "a tile's sizes or shapes changed", so the
pass looked changed although nothing outside the trial was, and propagation ran its cap of 1000 passes. On a base-game compass
puzzle the first propagation took 7.9 s instead of 0.08 s. The flag is now saved and restored with the rest of the state. Only
the passes that changed nothing are gone (checked on the fuzzers and the full base-game run).

## V1.0.44

A SAT final search for Match (core v123; the idea comes from ham's solver, https://github.com/ham883/glimmith-solver):
- The deduction steps run as before, so the step-by-step shows the same steps. When they stop on a Match puzzle, the exact final
  search is now a SAT search (a small solver written into the page, no library, no network) instead of the piece search, which had
  to guess a whole first piece. One case per piece size; every piece is the first piece moved by one of the 8 orientations; the
  proved walls and links, palisades and area numbers are part of the problem; every tiling found is checked by the full rule checker
  (one that breaks any rule is thrown out and the search goes on). On a Match puzzle the author sent (four pieces of 35 tiles,
  8 solutions) the final search takes about 25 s instead of more than 15 minutes.
- Boards cut into very many small pieces keep the old final search (the SAT problem would be too big).
- New credits.
Checked by `dev/tests/solver/test_matchsat123.js`, `dev/fuzz/fuzz_matchsat123.js` (every solution compared with the old final search,
the exact search and the independent oracle) and the Match fuzzers.

## V1.0.43

Two steps a person sees first (core v122; the author's rule-order notes in `TODO.md`):
- **Known to be different, first.** Two groups with a wall between two of their tiles are different pieces, so every other open edge
  between them is a wall. It is now checked at the start of every pass; before, another rule that also walled such an edge got the
  credit (a watchtower on a watchtower puzzle the author sent).
- **Two area numbers, one piece** (new step). In an area closed in by walls, two groups whose area numbers add up to more than the
  area's tiles can not be two pieces: equal numbers are one piece (shown even when they do not touch yet), different numbers are
  impossible. Before, the solver found this by trying the other way (two 8s in an area of 13 tiles).
Checked on every fuzzer that covers these rules and `dev/tests/solver/test_order122.js`.

## V1.0.42

**More colours in the step-by-step.** A new group took the first free colour; pieces finished fast free it again and again, so most of
a puzzle could end red (the starter example "Non Unique": red on 1146 of 1745 coloured tiles over its steps). The colours are now
handed out in turn (the one after the last given, skipping those still held by unfinished groups): the same example uses all 25
colours, the most used one on 162 tiles. Test: `dev/tests/page/ui_test_colorturn_V1.0.42.js`.

## V1.0.41

**"Show more" in the contradiction viewer.** Every case in the "Show cases" pop-up (what the solver tried, and why it fails) has a
"Show more" button. It opens, inside the case, a small step-by-step that leads to the impossible moment: first what was tried (marked
in red on the position before the step), then each rule that fired from there, in order, with its own title and explanation and the
edges it decides outlined, and last "Impossible here": why it fails, with the tiles ringed in red when the check knows them. Previous /
Next buttons and a counter, as in the main step-by-step; "Show less" folds it. Test: `dev/tests/page/ui_test_casewalk_V1.0.41.js`.

## V1.0.40

**The step-by-step numbers a run of the same rule as one deduction.** The solver applies a rule pass after pass, and each pass made its
own step; a step that finishes several pieces is shown in parts (V1.0.6), and each step numbered its parts on its own. So a puzzle
solved by one rule all along showed "part 1 of 6" .. "part 6 of 6", then "part 1 of 2" again, and so on. Now consecutive steps of the
same rule are one run, "part 1 of N" .. "part N of N"; only the first part explains the rule, the next ones say they continue it
("finishes this piece" only when that part does). Test: `dev/tests/page/ui_test_stepruns_V1.0.40.js`.

## V1.0.39

**Fast import has one way: the setup file.** The box gives a setup file for Windows (`glimmith-setup.bat`, junctions) and for Linux
(`glimmith-setup.sh`, symbolic links; run `sh glimmith-setup.sh`). Each makes a folder `Glimmith puzzles` next to itself with the
links `downloaded` (Steam workshop puzzles) and `made` (your own puzzles); nothing is copied or moved. Choose that folder once: Chrome
and Edge remember it (one click from then on); other browsers ask for it each time. The rows for the game's own folders, "Read once"
and the "Folder blocked?" help are gone. On Linux the game runs through Proton, so the script finds your own puzzles in the game's
Proton prefix (`steamapps/compatdata/4160210/pfx/.../AppData/Local/Geri/Saved/workshop`), in the usual Steam places (the Flatpak one
too). The Linux script was run here on test folders; whether Chrome on Linux follows the links when it reads the chosen folder is not
tested yet. Test: `dev/tests/page/ui_test_fastsetup_V1.0.39.js` (replaces `ui_test_fastimport.js`).

## V1.0.38

**Fast import in one click, also for the game's folders.** Chrome and Edge refuse to remember folders inside Program Files and AppData,
and both game folders are there, so Fast import asked for them every time. The Fast import box now has a **setup file**
(`glimmith-setup.bat`, made by the page): put it in any folder and double-click it. It makes a folder `Glimmith puzzles` next to
itself with two links (Windows junctions): `downloaded` to the Steam workshop puzzles and `made` to your own. Nothing is copied or
moved, deleting the folder deletes only the links, and no administrator rights are needed. Choose `Glimmith puzzles` once in the new
row of the box; from then on Fast import reads both in one click. Browsers that can not remember folders (Firefox, the VS Code
browser) do not see the setup and are told the folders are read each time. Test: `dev/tests/page/ui_test_fastsetup_V1.0.39.js`.

## V1.0.37

- **Colours in the step-by-step for every linked group** (the author's request). A group of tiles gets its own colour from the step
  that links two of its tiles (before, only when a fact joined tiles that do not touch); groups that meet keep the older colour, a
  finished piece keeps its colour.
- **"Far apart, but one piece" only when the groups really do not touch** (core v121). On a compass puzzle the step-by-step said two
  tiles were far apart while they touched through a compass tile already linked to one of them; such a join now shows as the plain
  link between the two groups, with the rule that found it.

## V1.0.36

**Bug fix: a valid puzzle could be called impossible** (core v120; the author's report). Since V1.0.25 each pass of the propagation
narrows the tile sizes with the bounds it found. A step that runs a nested propagation (a probe, for instance) must not hand its
own bounds to the outer pass: the fix for that (one frame of bounds per propagate call) went into the reference core of V1.0.25 but
not into the page, so from V1.0.25 to V1.0.35 the page could narrow sizes with the wrong bounds and say "impossible" (here with
compasses and Mismatch) about a puzzle whose solution is valid. The tests run the reference core, so none of them saw it.
- The page now has the fix; its solver core is the same code as `dev/reference/solver-core.v120.js`, which is now written from the
  page itself (`patch_ui_V1.0.36.py --reference ...`).
- `dev/tests/page/ui_test_core_sync.js` fails on any difference between the page's core and the newest reference core.
- Audit on core v120: every fuzzer (44) run; the only reports were fuzzer artefacts (`fuzz_oracle.js` compared with an oracle list cut at
  100000 tilings: fixed; `fuzz_area27.js` one planted board the oracle itself rejects, the same on v104). On the same planted boards the
  V1.0.35 page core failed 188 times in 1000 (false "impossible" and wrong deductions), v120 0 times in 1500.
- `dev/fuzz/fuzz_planted120.js` runs the whole solver with the page's settings on planted tilings that obey every clue and rule on
  the board, and fails on any "impossible", any rule or probe deduction that disagrees with the planted tiling, or a "unique" that
  is not the planted tiling.

## V1.0.35

Wally: the dead-end budget along the link counts (core v119; the author's idea). With Wally every piece is a path, so the board has
at most 2 dead ends per piece (a piece of one tile counts as 2). When the number of pieces is known or capped (maximum number of
pieces, Heterogeneous, roses ...) and that many dead ends are already known, the budget is spent: no new dead end is possible, so
every tile must get exactly as many links as it can still get (1 at a dead end, 2 elsewhere). Since V1.0.3 the solver only linked
a tile that needed all its open sides. Now it tries each open edge both ways on the link counts alone, following the chain of
forced links and walls: a wall that ends with a tile short of links (a dead end the budget can not pay for) is a link, and a link
that ends with a tile over its count is a wall. On the author's 12x12 Wally + Heterogeneous puzzle the deduction now decides all
173 edges (108 before, the rest by search). Checked by `dev/fuzz/fuzz_wallybudget119.js` (planted Wally boards, piece count given).

## V1.0.34

The author approved refactoring step 8: the step-by-step view now names each step of a shared step by that step and by the rule
that gave the fact ("Forced growth, from the roses"), by default. The "Name steps by logic" box starts ticked; unticking it brings
back each rule's own title and is remembered in the browser. The new names are on the rewrite list (V1.0.32).
Core v118: the author dropped step 3, so the Size Separation relation of v115 (off by default, no gain) is removed.

## V1.0.33

The rest of refactoring steps 2, 3 and 6 (cores v115 to v117); nothing the page shows changes.
- **Gemini shares the shape list** (v116, step 2). A Gemini wall means the same shape on both sides, so the shapes ruled out on one
  side are ruled out on the other, and the two sides keep only the sizes both can have. With this, the bank, polyominoes, Mismatch,
  Mingle Shape, Delta and Gemini all work on the one shape list of each tile (v108).
- **The box per tile cuts the placements** (v117, step 6). The shared placement decision drops the places that leave the group's box.
  With v116, the Gemini / Delta campaign puzzles decide 1365 -> 1428 edges before any search, in the same time.
- **Size Separation as a relation on the walls** (v115, step 3). Every wall between two groups can be fed to the size-comparison step
  as "sizes differ". It is sound but decides nothing new on 146 campaign puzzles and is 4 to 7% slower, so it is off by default
  (`opts.sizeSepRel`). The shape half (Mingle Shape as a Delta on every wall) was tried earlier, with the same result.

## V1.0.32

Refactoring step 8: step names that follow the logic, behind a switch that is off by default. The step-by-step view has a box
"Name steps by logic": ticked, a step of a shared step is titled by it and by the rule that gave the fact ("Forced growth, from the
roses", "Reach, from the compasses", "Closed-in area count, from Match", ...; from `RULE_FAMILY`, core v114). The explanation under
the title stays the rule's own. Unticked (the default), the page shows the step titles as before: the new names are on the author's
rewrite list, and he decides whether they become the default.

## V1.0.31

Refactoring steps 5 to 8 (cores v111 to v114); nothing the page shows changes.
- **One forced-growth step** (v111). Size, Minimum, roses, Solitude and now Non-boxy share one loop: one function says what a group
  still lacks (`growNeed`), and a group with one way out takes it. The reach look-ahead was already one loop; compasses keep their own
  region analysis (it works on whole groups with a budget per side).
- **A box per tile** (v112). Each tile keeps the columns and rows its piece must fit in, from the size cap, Boxy and the compasses;
  the reach searches skip the tiles outside it. Sound, but it decides almost nothing new on the campaign puzzles (compass
  categories: 5169 -> 5169 edges before any search, same time).
- **One corner-pattern checker** (v113). Bricky and Loopy had their own copies of the corner table and of three corner checks; now one
  table and one set of checks, each rule given as the numbers of walls it forbids at a grid point (4 for Bricky, odd for Loopy). Same
  steps as before on 300 random Bricky / Loopy boards. Palisades and Wally already shared their tile step.
- **Step families** (v114). `RULE_FAMILY` gives, for each step tag, its shared step (forced growth, reach, closed-in area count,
  placement, corner pattern) and the rule that supplied the fact. It is the groundwork for "one step name per shared step" ("Forced
  growth, from the roses"); the page keeps its current step names until the author approves the new ones, since they are on his
  rewrite list.

## V1.0.30

One count step for the areas closed in by walls (core v110, refactoring step 4). Roses, Solitude, Match, the allowed sizes and the
board's number of pieces each had their own closed-area step; they all ask how many pieces such an area holds, at least and at most.
Now each rule only gives its bounds, and one step combines them: none left is impossible, at most one means the area is one piece,
and as many as the area has groups means every group is a piece of its own (new for roses, Solitude and Match: "Closed-in area: one
piece per group", on the rewrite list). Same edges decided on 318 campaign puzzles (seven categories), 944 s -> 931 s.

## V1.0.29

One shared placement decision (core v109, refactoring step 2). The placement steps (polyomino, shape bank, Match, Mismatch, Boxy,
Gemini, area numbers, compass boxes) all list the places a piece can still take and keep what they all agree on: tiles every place
covers are in the piece, an edge on the border of every place is a wall. That second half had eight copies; it is now one function,
and each rule keeps only how it lists its places. The shape bank's places also skip the shapes ruled out for the group (V1.0.28).
Same steps as V1.0.28 on 600 random boards.

## V1.0.28

Every tile keeps the shapes its piece is known not to be (core v108, refactoring step 1: the shape rules share their facts). Mingle
Shape and Mismatch keep every shape they take away from a group, and start from what was taken away before; a Delta wall takes the
known shape of one side (a polyomino in it, or a finished piece) away from the other side, even before the two have the same size;
with a shape bank, the shapes ruled out leave the list a group must fit; and a size whose shapes are all ruled out leaves the size
set. Two groups that could only be one piece of a ruled-out shape are separated by a new step, "Shape ruled out". On 211 campaign
puzzles with shape rules: same verdicts, 67 more edges decided in the first pass (Mingle Shape +45, Gemini / Delta +22), 64.5 s ->
62.1 s. The new texts are on the rewrite list.

## V1.0.27

Two small changes in the solver (core v107), no new deduction. The tile size sets of V1.0.26 now keep sizes 1 to 15 one by one
(was 30); bigger sizes keep their range. And Non-boxy is written once as what it is, a Minimum of 3 (every piece of 1 or 2 tiles is
a rectangle): it raises the lowest size where Minimum, Maximum and Precision set it, so every size step reads it from there, and the
seven places that added the 3 again are gone. Same steps as V1.0.26 on 147 random Non-boxy boards.

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
| `glimmith_solver_V1.0.57.html` | The whole application (editor, solver, importer) in one file. |
| `dev/reference/solver-core.v103.js` | The solver core as a Node module, used by the tests and tools: the same code as in the page (four comment lines differ). |
| `dev/reference/import-core.js` | The puzzle-file reader, same code as in the page. |
| `dev/tests/solver/`, `dev/fuzz/` | Solver tests and fuzzers. The fuzzers compare the solver with an independent brute force (`oracle.js`) on small boards. |
| `dev/tests/page/` | Page tests (jsdom). |
| `rewrite/` | The rewrite list: every text of the page, one file per part of the page, with the author's own wording (see `rewrite/README.md`). |
| `dev/tools/run_corpus.js` | Times the solver on every puzzle of a corpus and writes a report. |
| `dev/game_puzzles*`, `dev/user_puzzles`, `dev/puzzles` | Puzzles used by the tools and tests. |
| `dev/build/` | The changes since V1 as scripts: `patch_core94.py` + `patch_ui_V1.0.1.py` (V1 -> V1.0.1), `patch_core95.py` + `patch_ui_V1.0.2.py` (V1.0.1 -> V1.0.2), `patch_core96.py` + `patch_ui_V1.0.3.py` (V1.0.2 -> V1.0.3), `patch_ui_V1.0.4.py` (V1.0.3 -> V1.0.4, page only), `patch_core97.py` + `patch_ui_V1.0.5.py` (V1.0.4 -> V1.0.5), `patch_core98.py` + `patch_ui_V1.0.6.py` (V1.0.5 -> V1.0.6), `patch_ui_V1.0.7.py` (V1.0.6 -> V1.0.7, page only), `patch_ui_V1.0.8.py` (V1.0.7 -> V1.0.8, page only), `patch_core99.py` + `patch_ui_V1.0.9.py` (V1.0.8 -> V1.0.9), `patch_ui_V1.0.10.py` + `rewrites_V1.0.10.json` (V1.0.9 -> V1.0.10, page only), `patch_ui_V1.0.11.py` (V1.0.10 -> V1.0.11, page only), `patch_ui_V1.0.12.py` + `rule_examples_V1.0.12.json` + `step_info_extra_V1.0.12.json` (V1.0.11 -> V1.0.12, page only); `patch_ui_V1.0.13.py` + `rule_examples_V1.0.13.json` (V1.0.12 -> V1.0.13, page only); `patch_ui_V1.0.14.py` (V1.0.13 -> V1.0.14, page only); `patch_ui_V1.0.15.py` + `rule_examples_V1.0.15.json` (V1.0.14 -> V1.0.15, page only); `patch_ui_V1.0.16.py` + `rule_examples_V1.0.16.json` (V1.0.15 -> V1.0.16, page only); `patch_core100.py` + `patch_ui_V1.0.17.py` (V1.0.16 -> V1.0.17); `patch_core101.py` + `patch_ui_V1.0.18.py` (V1.0.17 -> V1.0.18); `patch_core102.py` + `patch_ui_V1.0.19.py` (V1.0.18 -> V1.0.19); `patch_core103.py` + `patch_ui_V1.0.20.py` (V1.0.19 -> V1.0.20); `patch_ui_V1.0.21.py` (V1.0.20 -> V1.0.21, page only); `patch_ui_V1.0.22.py` + `rewrites_V1.0.22.json` + `typos_V1.0.22.json` (V1.0.21 -> V1.0.22, page only); `patch_ui_V1.0.23.py` (V1.0.22 -> V1.0.23, page only); `patch_core104.py` + `patch_ui_V1.0.24.py` (V1.0.23 -> V1.0.24); `patch_core105.py` + `patch_ui_V1.0.25.py` (V1.0.24 -> V1.0.25); `patch_core106.py` + `patch_ui_V1.0.26.py` (V1.0.25 -> V1.0.26); `patch_core107.py` + `patch_ui_V1.0.27.py` (V1.0.26 -> V1.0.27); `patch_core108.py` + `patch_ui_V1.0.28.py` (V1.0.27 -> V1.0.28); `patch_core109.py` + `patch_ui_V1.0.29.py` (V1.0.28 -> V1.0.29); `patch_core110.py` + `patch_ui_V1.0.30.py` (V1.0.29 -> V1.0.30); `patch_core111.py` ... `patch_core114.py` + `patch_ui_V1.0.31.py` (V1.0.30 -> V1.0.31); `patch_ui_V1.0.32.py` (V1.0.31 -> V1.0.32, page only); `patch_core115.py` ... `patch_core117.py` + `patch_ui_V1.0.33.py` (V1.0.32 -> V1.0.33); `patch_core118.py` + `patch_ui_V1.0.34.py` (V1.0.33 -> V1.0.34); `patch_core119.py` + `patch_ui_V1.0.35.py` (V1.0.34 -> V1.0.35); `patch_core120.py` + `patch_ui_V1.0.36.py` (V1.0.35 -> V1.0.36); `patch_core121.py` + `patch_ui_V1.0.37.py` (V1.0.36 -> V1.0.37); `patch_ui_V1.0.38.py` (V1.0.37 -> V1.0.38, page only). |
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
