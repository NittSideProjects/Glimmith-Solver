#!/usr/bin/env python3
"""Page V1.0.42 -> V1.0.43: core v122 (see patch_core122.py): walls between groups known to be different first ('basic'), and two
area numbers that do not fit in one closed-in area ('area-pair', a new step of the step-by-step).
Usage: python3 patch_ui_V1.0.43.py glimmith_solver_V1.0.42.html glimmith_solver_V1.0.43.html [--reference dev/reference/solver-core.v122.js]"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from patch_core122 import patch as core_patch

def rep(src, old, new, what):
    c = src.count(old)
    if c != 1: raise SystemExit(f'{what}: anchor found {c} times')
    return src.replace(old, new)

src = open(sys.argv[1], encoding='utf8').read()
a = src.index('  // ================= SOLVER CORE (pure'); b = src.index('  // ================= IMPORT CORE (pure')
core = core_patch(src[a:b], '  ')
src = src[:a] + core + src[b:]
src = rep(src, "      if(st.rule === 'split-cut') return { kicker: 'Rule', title: 'The only way to connect',",
"""      if(st.rule === 'area-pair') return { kicker: 'Rule', title: 'Two area numbers, one piece',          // V1.0.43: core v122
        text: `The ringed tiles carry the same area number, and the area closed in by walls round them has fewer tiles than two pieces of that size need. So they are one piece, even though they do not touch yet.${mark}`, meta };
      if(st.rule === 'split-cut') return { kicker: 'Rule', title: 'The only way to connect',""", 'fact text')
src = rep(src, "(key === 'fact:split-cut' ? 'The only way to connect' :", "(key === 'fact:split-cut' ? 'The only way to connect' : key === 'fact:area-pair' ? 'Two area numbers, one piece' :", 'example title')
open(sys.argv[2], 'w', encoding='utf8').write(src); print('ok', sys.argv[2])
if '--reference' in sys.argv:
    out = sys.argv[sys.argv.index('--reference') + 1]
    open(out, 'w', encoding='utf8').write(''.join(l[2:] if l.startswith('  ') else l for l in core.splitlines(True))); print('ok', out)
