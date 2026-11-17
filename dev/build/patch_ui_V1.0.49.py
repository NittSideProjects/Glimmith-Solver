#!/usr/bin/env python3
"""Page V1.0.48 -> V1.0.49: core v128 (see patch_core128.py): seven steps the base game never needs are removed.
Page text: the reason of mingle-area-connect (WHY_TEXT, in the core) goes with its step. No text is added or changed.
Usage: python3 patch_ui_V1.0.49.py glimmith_solver_V1.0.48.html glimmith_solver_V1.0.49.html [--reference dev/reference/solver-core.v128.js]"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from patch_core128 import patch as core_patch

src = open(sys.argv[1], encoding='utf8').read()
a = src.index('  // ================= SOLVER CORE (pure'); b = src.index('  // ================= IMPORT CORE (pure')
core = core_patch(src[a:b], '  ')
src = src[:a] + core + src[b:]
open(sys.argv[2], 'w', encoding='utf8').write(src); print('ok', sys.argv[2])
if '--reference' in sys.argv:
    out = sys.argv[sys.argv.index('--reference') + 1]
    open(out, 'w', encoding='utf8').write(''.join(l[2:] if l.startswith('  ') else l for l in core.splitlines(True))); print('ok', out)
