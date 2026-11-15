#!/usr/bin/env python3
"""Page V1.0.35 -> V1.0.36: embedded core v120 (see patch_core120.py): the nested-pass fix of v105 that the page never got.
The reference core dev/reference/solver-core.v120.js is then written from this page (--reference <out.js>), so both are the same.
Usage: python3 patch_ui_V1.0.36.py glimmith_solver_V1.0.35.html glimmith_solver_V1.0.36.html [--reference dev/reference/solver-core.v120.js]"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from patch_core120 import patch as core_patch
src = open(sys.argv[1], encoding='utf8').read()
a = src.index('  // ================= SOLVER CORE (pure'); b = src.index('  // ================= IMPORT CORE (pure')
core = core_patch(src[a:b], '  ')
src = src[:a] + core + src[b:]
open(sys.argv[2], 'w', encoding='utf8').write(src); print('ok', sys.argv[2])
if '--reference' in sys.argv:
    out = sys.argv[sys.argv.index('--reference') + 1]
    ref = ''.join(l[2:] if l.startswith('  ') else l for l in core.splitlines(True))
    open(out, 'w', encoding='utf8').write(ref); print('ok', out)
