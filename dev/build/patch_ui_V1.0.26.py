#!/usr/bin/env python3
"""Page V1.0.25 -> V1.0.26: embedded core v106 (see patch_core106.py): every tile keeps the exact set of sizes its piece can have,
holes included (walls that compare sizes, Size Separation, Mingle Shape, Delta, shape bank). No new text on the page.
Usage: python3 patch_ui_V1.0.26.py glimmith_solver_V1.0.25.html glimmith_solver_V1.0.26.html"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from patch_core106 import patch as core_patch
src = open(sys.argv[1], encoding='utf8').read()
a = src.index('  // ================= SOLVER CORE (pure'); b = src.index('  // ================= IMPORT CORE (pure')
src = src[:a] + core_patch(src[a:b], '  ') + src[b:]
open(sys.argv[2], 'w', encoding='utf8').write(src); print('ok', sys.argv[2])
