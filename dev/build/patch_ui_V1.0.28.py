#!/usr/bin/env python3
"""Page V1.0.27 -> V1.0.28: embedded core v108 (see patch_core108.py): every tile keeps the shapes its piece is known not to be.
Page: the step label of 'shape-range' (new text, added to the rewrite list).
Usage: python3 patch_ui_V1.0.28.py glimmith_solver_V1.0.27.html glimmith_solver_V1.0.28.html"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from patch_core108 import patch as core_patch

def rep(src, old, new, what):
    c = src.count(old)
    if c != 1: raise SystemExit(f'{what}: anchor found {c} times')
    return src.replace(old, new)

src = open(sys.argv[1], encoding='utf8').read()
a = src.index('  // ================= SOLVER CORE (pure'); b = src.index('  // ================= IMPORT CORE (pure')
src = src[:a] + core_patch(src[a:b], '  ') + src[b:]
anchor = '  STEP_INFO["size-range"] = '
src = rep(src, anchor, '''  STEP_INFO["shape-range"] = ["Shape ruled out", null, "Earlier steps ruled out some shapes for the pieces of these groups. Joined, they could only take one of those shapes, so they are different pieces, with a wall between them.", null];   // V1.0.28
''' + anchor, 'step info')
open(sys.argv[2], 'w', encoding='utf8').write(src); print('ok', sys.argv[2])
