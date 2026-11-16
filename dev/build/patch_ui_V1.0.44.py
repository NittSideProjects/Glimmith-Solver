#!/usr/bin/env python3
"""Page V1.0.43 -> V1.0.44: core v123 (see patch_core123.py): the exact final search of a Match puzzle is a SAT search (after
every deduction step, so the step-by-step is unchanged). New credits (the author's text; typos fixed: dev/build/typos_V1.0.44.json).
Usage: python3 patch_ui_V1.0.44.py glimmith_solver_V1.0.44.html glimmith_solver_V1.0.44.html [--reference dev/reference/solver-core.v123.js]"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from patch_core123 import patch as core_patch

src = open(sys.argv[1], encoding='utf8').read()
a = src.index('  // ================= SOLVER CORE (pure'); b = src.index('  // ================= IMPORT CORE (pure')
core = core_patch(src[a:b], '  ')
src = src[:a] + core + src[b:]

def rep(src, old, new, what):
    c = src.count(old)
    if c != 1: raise SystemExit(f'{what}: anchor found {c} times')
    return src.replace(old, new)

src = rep(src, "    <p>Special thanks to ham for ideas as well as making the SAT solver</p>",
    "    <p>Special thanks to ham for ideas as well as making the SAT solver, which this solver uses for match puzzles.</p>", 'credits ham')
src = rep(src, "I recommend ham's SAT solver, which you can find online.</p>",
    "I recommend ham's SAT solver, which you can find online (<a href=\"https://github.com/ham883/glimmith-solver\" target=\"_blank\" rel=\"noopener\">https://github.com/ham883/glimmith-solver</a>).</p>", 'credits link')
open(sys.argv[2], 'w', encoding='utf8').write(src); print('ok', sys.argv[2])
if '--reference' in sys.argv:
    out = sys.argv[sys.argv.index('--reference') + 1]
    open(out, 'w', encoding='utf8').write(''.join(l[2:] if l.startswith('  ') else l for l in core.splitlines(True))); print('ok', out)
