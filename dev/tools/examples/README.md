# Rule examples (the "Show example" pop-ups)

For every rule a step can show, the page carries the smallest puzzle found where the solver uses it (`RULE_EXAMPLES` in the page,
`dev/build/rule_examples_V1.0.x.json`). The puzzles are synthetic: they come from the fuzzers, never from the game or from players.

| File | What |
|---|---|
| `hook.js` | Preloaded into a fuzzer (`node -r hook.js fuzz_x.js N seed`), it records every puzzle the fuzzer builds into `$HARVEST_OUT` (one JSON per line). Set `GLIMMITH_CORE` to the absolute path of the current reference core. |
| `evaluate.js` | Solves every recorded puzzle with the page's default settings (smallest first) and keeps, per rule, the best example: fewest tiles, a unique puzzle preferred (it may be up to 1.5x bigger). A link between tiles already known to be in one piece does not count for its rule, as in the step view. `node evaluate.js <core.js> <fuzzlib.js> <a.jsonl,b.jsonl> <examples.json> [max seconds] [max tiles]` |
| `to_page.js` | `examples.json` -> the page's compact data (puzzle, rules on, shape bank, Omits, the solver's events up to the step, unique flag). |

Refresh after a solver change (rules can fire at other moments):

```
cd dev
export GLIMMITH_CORE=$PWD/reference/solver-core.vNN.js HARVEST_OUT=/tmp/puzzles.jsonl
for f in fuzz_*.js; do timeout 100 node -r tools/examples/hook.js $f 60 7 >/dev/null 2>&1; done
node tools/examples/evaluate.js $GLIMMITH_CORE $PWD/fuzzlib.js /tmp/puzzles.jsonl /tmp/examples.json 900 64
node tools/examples/to_page.js /tmp/examples.json build/rule_examples_V1.0.x.json
```

Rules a short run misses: run their family's fuzzer longer (N 400, a few seeds). `ui_test_examples_V1.0.12.js` checks that every
example draws.
