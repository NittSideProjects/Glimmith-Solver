# Solver

The Solver panel: buttons, options, progress and the result after a solve.

Left here: 0 to write, 0 to check again, 26 notes, 0 to put on the page. Done: 50.

Write after `- new:`. Leave it empty = not done yet. `=` = keep the text as it is. `[..]` anywhere = a note for Claude. `{1}`, `{2}` stand for values the page fills in: keep them.

### T0082
- what: text
- now: Solver
- new: =

### T0084
- what: text
- now: i
- new: =

### T0085
- what: text · #solverInfo · Shows when you click the i next to "Solver".
- now: Checks whether the puzzle is impossible, unique, or non unique.
- new: =

### T0086
- what: text · #solverInfo · Shows when you click the i next to "Solver".
- now: The solver decides the puzzle by finding the correct state for every edge (link or wall). Either by deduction logic, by going neighbors to neighbors, or by testing links between far away symbols. The global idea being that a puzzle solvable by deduction would have a breakthrough spot. The solver is designed to find it by attacking the puzzle with those approaches.
- new: The solver decides the puzzle by finding the correct state for every edge (link or wall). Either by deduction logic, by going neighbors to neighbors, or by testing links between far away symbols. The global idea being that a puzzle solvable by deduction would have a breakthrough spot. The solver is designed to find it by attacking the puzzle with those approaches.

### T0087
- what: text · #solverInfo · Shows when you click the i next to "Solver".
- now: If it can't find a breakthrough in the current puzzle state, the solver skips to a final solve and does an exhaustive search on the half done puzzle, hopefully finding an impossibility or a solution. If the solver has trouble finding a solution after a minute of exhaustive search, the puzzle probably requires a global thinking that the solver can’t find. If that is the case, please send your puzzle to me! (nittneuk on discord) so I can try to implement a reasoning for puzzle of it's kind.
- new: If it can't find a breakthrough in the current puzzle state, the solver skips to a final solve and does an exhaustive search on the half done puzzle, hopefully finding an impossibility or a solution. If the solver has trouble finding a solution after a minute of exhaustive search, the puzzle probably requires a global thinking that the solver can’t find. If that is the case, please send your puzzle to me! (nittneuk on discord) so I can try to implement a reasoning for puzzle of it's kind.

### T0088
- what: text · #solverPctLine · Shows when you click the i next to "Solver".
- now: This solver has been tested on the base game puzzles, it took under 10 min to prove all of them were unique.
- new: =

### T0092
- what: text · #solveBtn
- now: Check Uniqueness
- new: =

### T0093
- what: text · #cancelSolveBtn · Button that only shows while the solver runs.
- now: Cancel
- new: =

### T0094
- what: text · #skipScanBtn · Button that only shows while the solver runs.
- now: Skip to final solve
- new: =

### T0095
- what: text
- now: Find all solutions (slower, stops at 200)
- new: =

### T0896
- what: tooltip · Tooltip: shows when you hover over it.
- now: Off: solve becomes slower as the solver doesn't skip when it reallze exhaustive would finish it fast. However in some case can lead to step by step being clearer
- new: =

### T0897
- what: text
- now: Ignore edge by edge if exhaustive whould be faster
- new: =

### T0098
- what: text · #guessBtn · Only shows after some solves.
- now: Solve with buffer guess layer (experimental)
- new: [remove this whole thing, the code behind as well, it isn't needed]

### T0115
- what: text · #stepsBtn · Button that shows after a solve.
- now: Show the step-by-step reasoning
- new: =

### T0501
- what: message · parseLimitInput · Built by the page while it runs, so it only shows in some situations.
- now: {1} must be a number (or empty for no limit)
- new: {1} must be a number (or empty for no limit)

### T0502
- what: message · n · Built by the page while it runs, so it only shows in some situations.
- now: Max region amount
- new: [probnotshown]

### T0503
- what: message · s · Built by the page while it runs, so it only shows in some situations.
- now: Max region size
- new: [probnotshown]

### T0504
- what: message · readSolverLimits · Built by the page while it runs, so it only shows in some situations.
- now: max region amount {1}
- new: [probnotshown]

### T0505
- what: message · readSolverLimits · Built by the page while it runs, so it only shows in some situations.
- now: max region size {1}
- new: [probnotshown]

### T0506
- what: message · fmtDuration · Built by the page while it runs, so it only shows in some situations.
- now: {1} min
- new: =

### T0507
- what: message · fmtDuration · Built by the page while it runs, so it only shows in some situations.
- now: over an hour
- new: =

### T0508
- what: message · createProgressTracker › line · Built by the page while it runs, so it only shows in some situations.
- now: no percentage: the first piece alone has too many possibilities to count
- new: no percentage: the first piece alone has too many possibilities to count

### T0509
- what: message · s › line · Built by the page while it runs, so it only shows in some situations.
- now: ~{1}% (estimate)
- new: =

### T0510
- what: message · createProgressTracker › line · Built by the page while it runs, so it only shows in some situations.
- now: · about {1} left (rough)
- new: =

### T0511
- what: message · updateSlowNote · Built by the page while it runs, so it only shows in some situations.
- now: It's been {1} s — this might take longer than expected. The search keeps going until it is finished; you may stop it early with Cancel. Please contact nittneuk on discord to tell him about this puzzle
- new: It's been {1} s — this might take longer than expected. The search keeps going until it is finished; you may stop it early with Cancel. Please contact nittneuk on discord to tell him about this puzzle

### T0512
- what: message · pctNote · Built by the page while it runs, so it only shows in some situations.
- now: at about {1}% of the estimated search
- new: =

### T0513
- what: message · runSolver · Built by the page while it runs, so it only shows in some situations.
- now: (with your limits: {1})
- new: [where]

### T0514
- what: message · runSolver · Built by the page while it runs, so it only shows in some situations.
- now: Searching…{1}
- new: [where]

### T0515
- what: message · runSolver · Built by the page while it runs, so it only shows in some situations.
- now: limits: {1} ·
- new: [where]

### T0516
- what: message · runSolver · Built by the page while it runs, so it only shows in some situations.
- now: Searching… {1}{2}{3} nodes explored · {4}s
- new: [where]

### T0517
- what: message · readDeduceSettings · Built by the page while it runs, so it only shows in some situations.
- now: The narrow search time must be a whole number of milliseconds between 5 and 5000.
- new: [where]

### T0518
- what: message · readDeduceSettings · Built by the page while it runs, so it only shows in some situations.
- now: The mix share must be a whole number between 0 and 100 (percent of each narrow search spent growing outward from the edge).
- new: [where]

### T0519
- what: message · runDeduce · Built by the page while it runs, so it only shows in some situations.
- now: Solver: preparing…{1}
- new: [where]

### T0520
- what: message · runDeduce · Built by the page while it runs, so it only shows in some situations.
- now: Solver: narrow searches ({1} ms each) · {2}{3} of {4} edges decided ({5} walls, {6} same-piece) · {7} piece{8} complete · {9} tests: {10} proofs, {11} timed out, {12} found a tiling · {13}s
- new: =

### T0521
- what: message · runDeduce · Built by the page while it runs, so it only shows in some situations.
- now: Solver: final exact solve on the half-solved puzzle ({1} edges left open) · {2}{3}{4} nodes explored · {5}s
- new: =

### T0522
- what: message · runDeduce · Built by the page while it runs, so it only shows in some situations.
- now: {1} being the final search
- new: {1} being the final search

### T0523
- what: message · runDeduce · Built by the page while it runs, so it only shows in some situations.
- now: no exhaustive search needed
- new: =

### T0524
- what: message · runDeduce · Built by the page while it runs, so it only shows in some situations.
- now: It took {1} with {2}.
- new: =

### T0525
- what: message · runDeduce · Built by the page while it runs, so it only shows in some situations.
- now: It ran {1}.
- new: =

### T0526
- what: message · underLimits · Built by the page while it runs, so it only shows in some situations.
- now: Under your limits ({1}) only: if one of them is wrong this may be false — clear the limits to be sure.
- new: [where]

### T0527
- what: message · assuming · Built by the page while it runs, so it only shows in some situations.
- now: This assumes your limits ({1}) are correct.
- new: [where]

### T0528
- what: message · finishSolver · Built by the page while it runs, so it only shows in some situations.
- now: Cancelled after {1} nodes{2}. {3} solution(s) found so far.
- new: =

### T0529
- what: message · finishSolver · Built by the page while it runs, so it only shows in some situations.
- now: Partial result {1}
- new: [where]

### T0530
- what: message · finishSolver · Built by the page while it runs, so it only shows in some situations.
- now: Search limit reached ({1} nodes{2}) before finishing — can't confirm uniqueness. Try a smaller grid, a narrower size rule, shapes in the bank, or a max region size / amount.
- new: [where]

### T0531
- what: message · finishSolver · Built by the page while it runs, so it only shows in some situations.
- now: Found so far {1}
- new: =

### T0532
- what: message · note · Built by the page while it runs, so it only shows in some situations.
- now: and the Omits
- new: [remove]

### T0533
- what: message · note · Built by the page while it runs, so it only shows in some situations.
- now: (No shape in your bank fits the grid under the current size rule(s){1}.)
- new: =

### T0534
- what: message · note · Built by the page while it runs, so it only shows in some situations.
- now: (No connected region of the required size exists in the grid, or every one of them contains a banned shape.)
- new: =

### T0535
- what: message · note · Built by the page while it runs, so it only shows in some situations.
- now: (No connected region of the required size exists in the grid.)
- new: =

### T0536
- what: message · finishSolver · Built by the page while it runs, so it only shows in some situations.
- now: Impossible — no tiling satisfies every rule.{1}{2}
- new: =

### T0537
- what: message · finishSolver · Built by the page while it runs, so it only shows in some situations.
- now: Unique — exactly one tiling satisfies every rule.{1}{2}
- new: =

### T0538
- what: message · finishSolver · Built by the page while it runs, so it only shows in some situations.
- now: Solution
- new: =

### T0539
- what: message · finishSolver · Built by the page while it runs, so it only shows in some situations.
- now: Not unique — found at least two different tilings. Differences are ringed below.{1}
- new: =

### T0540
- what: message · finishSolver · Built by the page while it runs, so it only shows in some situations.
- now: Solution A
- new: =

### T0541
- what: message · finishSolver · Built by the page while it runs, so it only shows in some situations.
- now: Solution B
- new: =

### T0542
- what: message · finishSolver · Built by the page while it runs, so it only shows in some situations.
- now: Not unique — exactly 2 different tilings, and these are all of them (the search finished). Differences are ringed below.{1}
- new: =

### T0545
- what: message · capNote · Built by the page while it runs, so it only shows in some situations.
- now: (stopped at {1}, there may be more)
- new: (stopped at {1}, there may be more)

### T0546
- what: message · capNote · Built by the page while it runs, so it only shows in some situations.
- now: , all of them (the search finished)
- new: =

### T0547
- what: message · finishSolver · Built by the page while it runs, so it only shows in some situations.
- now: Not unique — {1} distinct tilings found{2}.{3}
- new: =

### T0548
- what: message · finishSolver · Built by the page while it runs, so it only shows in some situations.
- now: Solution {1}
- new: =

### T0549
- what: message · runGuessLayer · Built by the page while it runs, so it only shows in some situations.
- now: Buffer guess layer: preparing…{1}
- new: [removethiswholething]

### T0550
- what: message · runGuessLayer · Built by the page while it runs, so it only shows in some situations.
- now: Buffer guess layer: found a valid tiling after {1}s — now checking whether any other tiling exists (stop it any time with Cancel) · node {2} · depth {3} · {4}s
- new: [removethiswholething]

### T0551
- what: message · runGuessLayer · Built by the page while it runs, so it only shows in some situations.
- now: Buffer guess layer: searching with the guesses · node {1} · depth {2} · {3} red guesses · {4}s
- new: [removethiswholething]

### T0552
- what: message · runGuessLayer · Built by the page while it runs, so it only shows in some situations.
- now: Buffer guess layer: drawing rough guesses · {1} guesses ({2} follow from them, {3} dropped) · {4}s
- new: [removethiswholething]

### T0553
- what: message · exp · Built by the page while it runs, so it only shows in some situations.
- now: (experimental guess layer; every tiling shown was re-checked by the exact solver)
- new: [removethiswholething]

### T0554
- what: message · runGuessLayer · Built by the page while it runs, so it only shows in some situations.
- now: Cancelled after {1} — the buffer guess layer found no tiling yet. The red marks are guesses only.
- new: [removethiswholething]

### T0555
- what: message · runGuessLayer · Built by the page while it runs, so it only shows in some situations.
- now: The buffer guess layer found no tiling and could not finish (it stopped without closing every case). The red marks are guesses only.
- new: [removethiswholething]

### T0556
- what: message · runGuessLayer · Built by the page while it runs, so it only shows in some situations.
- now: Found a valid tiling (checked by the exact solver) after {1}, but the search was stopped before it could check that no other tiling exists, uniqueness is NOT confirmed.
- new: Found a valid tiling (checked by the exact solver) after {1}, but the search was stopped before it could check that no other tiling exists, uniqueness is NOT confirmed.

### T0557
- what: message · runGuessLayer · Built by the page while it runs, so it only shows in some situations.
- now: Tiling found by the guess layer
- new: [removethiswholething]

### T0558
- what: message · runGuessLayer · Built by the page while it runs, so it only shows in some situations.
- now: Buffer guess layer (experimental): {1} red guesses ({2} more followed from them, {3} dropped), search {4} nodes, depth {5}, {6} in total{7}. Red marks are guesses, not proofs.
- new: [removethiswholething]

### T0559
- what: message · runGuessLayer · Built by the page while it runs, so it only shows in some situations.
- now: ; first tiling after {1}
- new: =

### T0810
- what: message · fileSolutionNote · Built by the page while it runs, so it only shows in some situations.
- now: ✓ It is the solution stored in the imported file.
- new: =

### T0811
- what: message · fileSolutionNote · Built by the page while it runs, so it only shows in some situations.
- now: ⚠ It is NOT the solution stored in the imported file: the solver and the file disagree, so one of them is wrong. Please contact nittneuk (nittneuk on discord) about this if you think the mistake is on the solver
- new: ⚠ It is NOT the solution stored in the imported file: the solver and the file disagree, so one of them is wrong. Please contact nittneuk (nittneuk on discord) about this if you think the mistake is on the solver

### T0812
- what: message · fileSolutionNote · Built by the page while it runs, so it only shows in some situations.
- now: The solution stored in the imported file is not among the tilings shown.
- new: =

### T0813
- what: message · fileSolutionNote · Built by the page while it runs, so it only shows in some situations.
- now: The solution stored in the imported file is Solution {1}.
- new: =

### T0814
- what: message · fileSolutionNote · Built by the page while it runs, so it only shows in some situations.
- now: The solution stored in the imported file is solution {1} of these.
- new: =
