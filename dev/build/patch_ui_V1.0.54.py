#!/usr/bin/env python3
"""Page V1.0.53 -> V1.0.54: core v131 (see patch_core131.py): reach does not walk into a group that would make the piece too big.
No page text changes.
Usage: python3 patch_ui_V1.0.54.py glimmith_solver_V1.0.53.html glimmith_solver_V1.0.54.html [--reference dev/reference/solver-core.v131.js]"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from patch_core131 import patch as core_patch

src = open(sys.argv[1], encoding='utf8').read()
a = src.index('  // ================= SOLVER CORE (pure'); b = src.index('  // ================= IMPORT CORE (pure')
core = core_patch(src[a:b], '  ')
src = src[:a] + core + src[b:]
open(sys.argv[2], 'w', encoding='utf8').write(src); print('ok', sys.argv[2])
if '--reference' in sys.argv:
    out = sys.argv[sys.argv.index('--reference') + 1]
    open(out, 'w', encoding='utf8').write(''.join(l[2:] if l.startswith('  ') else l for l in core.splitlines(True))); print('ok', out)
