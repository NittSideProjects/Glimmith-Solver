#!/usr/bin/env python3
"""Page V1.0.14 -> V1.0.15 (page only, core stays v99): the author's first round of remarks on the rule examples (rules 1 to 16).

* Curated examples (dev/tools/examples/curated.json, applied by curate.js): the author's own puzzles for Forced growth, Reach,
  Roses: the way to a missing rose and Must still fit a bank shape; bigger hand-made boards for Too big for the size rules, Roses:
  narrow passage (a passage two tiles wide), Polyomino: size, Polyominoes of the same shape and Must still fit the shape (polyominoes
  of 2 and 3 tiles, no area number).
* An example can now show a chosen step of its puzzle (s) instead of the first step of its rule, and leave out edges that earlier
  steps decided (h) when they are true but not what the example is about.
* Wording: the step titles, step texts and example lines say "polyomino" where they said "stamp".
Usage: python3 patch_ui_V1.0.15.py glimmith_solver_V1.0.14.html glimmith_solver_V1.0.15.html"""
import sys, os, json, re

def rep(src, old, new):
    c = src.count(old)
    if c != 1: raise SystemExit(f'anchor found {c} times: {old[:120]}')
    return src.replace(old, new)

here = os.path.dirname(os.path.abspath(__file__))
EX = json.load(open(os.path.join(here, 'rule_examples_V1.0.15.json'), encoding='utf8'))
src = open(sys.argv[1], encoding='utf8').read()

# ---- "stamp" -> "polyomino" in the step titles and texts (the rule names, "stamp-place", stay) ----
i = src.index("  const STEP_INFO = {"); j = src.index("  // V1.0.13: tiny examples for each rule")
def word(t):
    for a, b in (('Stamps', 'Polyominoes'), ('stamps', 'polyominoes'), ('Stamp', 'Polyomino'), ('stamp', 'polyomino')):
        t = re.sub(r'(?<![-\w])' + a + r'(?![-\w])', b, t)
    return t
part = word(src[i:j]); n = len(re.findall('olyomino', part)) - len(re.findall('olyomino', src[i:j]))
src = src[:i] + part + src[j:]

# ---- data ----
i = src.index("  const RULE_EXAMPLES = "); j = src.index("\n", i) + 1
data = json.dumps(EX, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
src = src[:i] + f"  const RULE_EXAMPLES = {data};\n" + src[j:]
src = rep(src, "  // r = rules on, b = shape bank, n = Omits, e = the solver's events up to that step (d = decision, f = fact, s = finished piece)\n",
"""  // r = rules on, b = shape bank, n = Omits, e = the solver's events up to that step (d = decision, f = fact, s = finished piece),
  // s = the step to show (V1.0.15; else the first step of the rule), h = edges of earlier steps left out of the picture
""")

# ---- a chosen step, hidden earlier edges ----
src = rep(src, """      const idx = steps.findIndex(st => exampleKey(st) === key);
      if(idx < 0) return null;
      const st = steps[idx], walls = new Set(), links = new Set();
      for(let i = 0; i <= idx; i++) for(const e of steps[i].edges) (e.value === 'wall' ? walls : links).add(e.spot.key);
      return renderStepSVG(""",
"""      const idx = ex.s && exampleKey(steps[ex.s]) === key ? ex.s : steps.findIndex(st => exampleKey(st) === key);   // V1.0.15: a chosen step
      if(idx < 0) return null;
      const st = steps[idx], walls = new Set(), links = new Set();
      for(let i = 0; i <= idx; i++) for(const e of steps[i].edges) (e.value === 'wall' ? walls : links).add(e.spot.key);
      for(const k of ex.h || []){ walls.delete(k); links.delete(k); }                                              // V1.0.15: not what the example is about
      return renderStepSVG(""")
open(sys.argv[2], 'w', encoding='utf8').write(src); print('ok', sys.argv[2], len(EX), 'rules,', sum(len(v['x']) for v in EX.values()), 'boards;', n, 'x polyomino')
