# Rule order: which rule would a person use first?

Tools behind the author's "Which rule comes first?" page (a private claude.ai artifact). Needs the game puzzles (not in the repository).

1. `python3 patch_alt.py ../../reference/solver-core.v133.js core_alt.js`: an analysis-only core. At every top-level propagation pass that
   decides something, it rolls back and runs the pass again with that rule switched off, then the next one, and so on: the list of every
   rule that could have decided something at that same position (`opts.altLog`). Never used by the page.
2. `GLIMMITH_CORE=core_alt.js node run1.js <id> <puzzle file>` per puzzle (one JSON line each) -> `alt_all.jsonl`.
3. `node select.js` (`IN=`, `LIMIT=` default 200, `titles.json` = the page's step titles): one example per pair of step titles, the pairs met
   most often first, plus one pair for every title not met yet -> `comps.json` (holds game boards: keep it out of the repository).
4. `rule_order.html` + `comps.json` + `info.json` (the page's STEP_INFO) are published together; answers go to the page's database
   (collection `choices`: pair, a, b, first = a title | "equal" | "skip", note, solverFirst).

First run (core v133, all 1225 campaign puzzles): 204,837 positions where two rules could both fire, 1,605 pairs of step titles,
81 titles; the page shows 232 pairs.
