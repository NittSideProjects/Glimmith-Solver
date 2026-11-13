# Rule examples (the "Show example" pop-ups)

For every rule a step can show, the page carries a few tiny puzzles where the solver uses it (`RULE_EXAMPLES` in the page,
`dev/build/rule_examples_V1.0.x.json`) and a one-line explanation (`lines.json`). The puzzles are synthetic: random boards, never
from the game or from players.

What an example may hold: **only the mechanic of its rule** (one rule, one kind of clue or one kind of special wall; two only when
the rule needs two), helped by nothing but area numbers and plain walls, on a board of 2 to 12 tiles, one clue per tile as in the game.

| File | What |
|---|---|
| `tiny.js` | Builds random tiny boards from a planted tiling with one mechanic (sometimes none or two), solves each with the page's default settings and keeps, per rule and per kind of case, the simplest. `node tiny.js <core.js> <fuzzlib.js> <out.json> <seconds> <seed> [mechanic every board gets]` |
| `minimize.js` | Strips every candidate of all its rule does not need (a rule, a clue, a wall, a bank shape, a compass number, a tile), then keeps per rule the simplest cases: the fewest mechanics, at most four boards, each a different kind of case (another kind of wall, another result). `node minimize.js <core.js> <fuzzlib.js> <a.json,b.json,...> <out.json> [candidates tried per rule]` |
| `lines.json` | The one-line explanation of every rule, in the order "Show all examples" lists them. A rule without a line stops `to_page.js`. |
| `to_page.js` | `minimize.js` output + `lines.json` -> the page's data. |
| `lib.js` | Shared: solve one puzzle as the page does, list the rules its steps would show (a link between tiles already known to be in one piece does not count, as in the step view), name its mechanics. |

Refresh after a solver change (rules can fire at other moments):

```
cd dev
C=$PWD/reference/solver-core.vNN.js
for s in 11 22 33 44; do node tools/examples/tiny.js $C $PWD/fuzzlib.js /tmp/tiny_$s.json 540 $s & done; wait
for m in wally min palisade loopy compass stamp boxy solitude bricky heterogeneous gemini nonBoxy mismatch match roses bank delta diff mingleShape mingleArea; do
  node tools/examples/tiny.js $C $PWD/fuzzlib.js /tmp/tiny_$m.json 70 9 $m; done
node tools/examples/minimize.js $C $PWD/fuzzlib.js $(ls /tmp/tiny_*.json | paste -sd,) /tmp/min.json 16
node tools/examples/to_page.js /tmp/min.json build/rule_examples_V1.0.x.json
```

`ui_test_examples_V1.0.14.js` checks that every board draws and that the data keeps to the limits above. A new rule needs a line in
`lines.json` (and on the rewrite list) and a title in the page's `STEP_INFO`.
