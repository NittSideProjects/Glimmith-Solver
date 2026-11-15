#!/usr/bin/env python3
"""Page V1.0.29 -> V1.0.30: embedded core v110 (see patch_core110.py): one count step for the areas closed in by walls.
Page: the step label of 'region-apart' (new text, added to the rewrite list).
Usage: python3 patch_ui_V1.0.30.py glimmith_solver_V1.0.29.html glimmith_solver_V1.0.30.html"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from patch_core110 import patch as core_patch

def rep(src, old, new, what):
    c = src.count(old)
    if c != 1: raise SystemExit(f'{what}: anchor found {c} times')
    return src.replace(old, new)

src = open(sys.argv[1], encoding='utf8').read()
a = src.index('  // ================= SOLVER CORE (pure'); b = src.index('  // ================= IMPORT CORE (pure')
src = src[:a] + core_patch(src[a:b], '  ') + src[b:]
anchor = '  STEP_INFO["size-range"] = '
src = rep(src, anchor, '''  STEP_INFO["region-apart"] = ["Closed-in area: one piece per group", null, "The rules fix how many pieces this area closed in by walls holds, and it has exactly that many groups. So every group is a piece of its own, with walls between them.", null];   // V1.0.30
''' + anchor, 'step info')
open(sys.argv[2], 'w', encoding='utf8').write(src); print('ok', sys.argv[2])
