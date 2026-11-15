#!/usr/bin/env python3
"""Page V1.0.28 -> V1.0.29: embedded core v109 (see patch_core109.py): one shared placement decision for all the placement steps.
No change to the page itself.
Usage: python3 patch_ui_V1.0.29.py glimmith_solver_V1.0.28.html glimmith_solver_V1.0.29.html"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from patch_core109 import patch as core_patch

def rep(src, old, new, what):
    c = src.count(old)
    if c != 1: raise SystemExit(f'{what}: anchor found {c} times')
    return src.replace(old, new)

src = open(sys.argv[1], encoding='utf8').read()
a = src.index('  // ================= SOLVER CORE (pure'); b = src.index('  // ================= IMPORT CORE (pure')
src = src[:a] + core_patch(src[a:b], '  ') + src[b:]
open(sys.argv[2], 'w', encoding='utf8').write(src); print('ok', sys.argv[2])
