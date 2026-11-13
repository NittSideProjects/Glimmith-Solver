#!/usr/bin/env python3
"""Page V1.0.1 -> V1.0.2: embedded core v95 (propagation steps fastest first, see patch_core95.py). Nothing else on the page changes.
Usage: python3 patch_ui_V1.0.2.py glimmith_solver_V1.0.1.html glimmith_solver_V1.0.2.html"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from patch_core95 import patch as core_patch
src = open(sys.argv[1], encoding='utf8').read()
a = src.index('  // ================= SOLVER CORE (pure'); b = src.index('  // ================= IMPORT CORE (pure')
src = src[:a] + core_patch(src[a:b], '  ') + src[b:]
open(sys.argv[2], 'w', encoding='utf8').write(src); print('ok', sys.argv[2])
