#!/usr/bin/env python3
"""Page V1.0.24 -> V1.0.25: embedded core v105 (see patch_core105.py): every tile keeps the size range of its piece, so what one
pass finds about sizes is kept for the next ones. Page: the step label of 'size-range' (new text, added to the rewrite list).
Usage: python3 patch_ui_V1.0.25.py glimmith_solver_V1.0.24.html glimmith_solver_V1.0.25.html"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from patch_core105 import patch as core_patch

def rep(src, old, new, what):
    c = src.count(old)
    if c != 1: raise SystemExit(f'{what}: anchor found {c} times')
    return src.replace(old, new)

src = open(sys.argv[1], encoding='utf8').read()
a = src.index('  // ================= SOLVER CORE (pure'); b = src.index('  // ================= IMPORT CORE (pure')
src = src[:a] + core_patch(src[a:b], '  ') + src[b:]
anchor = '  STEP_INFO["piece-region"] = '
src = rep(src, anchor, '''  STEP_INFO["size-range"] = ["Different sizes", null, "Earlier steps found the sizes the pieces of these two groups can have, and no size is on both lists. So they are different pieces, with a wall between them.", null];   // V1.0.25
''' + anchor, 'step info')
open(sys.argv[2], 'w', encoding='utf8').write(src); print('ok', sys.argv[2])
