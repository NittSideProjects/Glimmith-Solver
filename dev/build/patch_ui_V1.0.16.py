#!/usr/bin/env python3
"""Page V1.0.15 -> V1.0.16 (page only, core stays v99): the author's second round of remarks on the rule examples.

* "Forced growth (Minimum)" and "Reach (Minimum)" have no example of their own any more: their steps open the example of "Forced
  growth" and "Reach" (EXAMPLE_ALIAS, from curated.json). "Polyomino: shape" has no example: no board with a polyomino of 2+ tiles
  was found. So the numbers move up (92 rules).
* "Too big for the size rules": the author's puzzle. "Roses: one of each type per piece": no piece colours either (c).
* Title: "Polyominoes of the same shape, far apart" -> "Two polyominoes of the same shape, two pieces" (the solver only uses this
  rule on polyominoes whose groups touch).
Usage: python3 patch_ui_V1.0.16.py glimmith_solver_V1.0.15.html glimmith_solver_V1.0.16.html"""
import sys, os, json

def rep(src, old, new):
    c = src.count(old)
    if c != 1: raise SystemExit(f'anchor found {c} times: {old[:120]}')
    return src.replace(old, new)

here = os.path.dirname(os.path.abspath(__file__))
EX = json.load(open(os.path.join(here, 'rule_examples_V1.0.16.json'), encoding='utf8'))
ALIAS = json.load(open(os.path.join(here, '..', 'tools', 'examples', 'curated.json'), encoding='utf8'))['_alias']
src = open(sys.argv[1], encoding='utf8').read()

i = src.index("  const RULE_EXAMPLES = "); j = src.index("\n", i) + 1
data = json.dumps(EX, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
src = src[:i] + f"""  const RULE_EXAMPLES = {data};
  // V1.0.16: a rule that shows the example of another rule; in a case, c = no piece colours
  const EXAMPLE_ALIAS = {json.dumps(ALIAS)};
""" + src[j:]
src = rep(src, "exBtn = document.getElementById('stepsExampleBtn'), exKey = exampleKey(st);",
               "exBtn = document.getElementById('stepsExampleBtn'), exKey = EXAMPLE_ALIAS[exampleKey(st)] || exampleKey(st);")
src = rep(src, """      return renderStepSVG({ groupTint: st.groupTint || null, factTiles: st.kind === 'fact' ? st.facts.flatMap(f => [f.a, f.b]) : null, walls, links,
        shapes: st.closed || [], fresh: new Set(st.edges.map(e => e.spot.key)), probe: null, pieces: null, searchWalls: null, diff: null, label: 'Example' });
    } catch(e){ return null; }""",
"""      return renderStepSVG({ groupTint: ex.c ? null : st.groupTint || null, factTiles: st.kind === 'fact' ? st.facts.flatMap(f => [f.a, f.b]) : null, walls, links,
        shapes: ex.c ? [] : st.closed || [], fresh: new Set(st.edges.map(e => e.spot.key)), probe: null, pieces: null, searchWalls: null, diff: null, label: 'Example' });
    } catch(e){ return null; }""")
src = rep(src, '"stamp-pair": ["Polyominoes of the same shape, far apart"', '"stamp-pair": ["Two polyominoes of the same shape, two pieces"')
open(sys.argv[2], 'w', encoding='utf8').write(src); print('ok', sys.argv[2], len(EX), 'rules,', sum(len(v['x']) for v in EX.values()), 'boards')
