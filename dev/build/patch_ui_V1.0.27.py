#!/usr/bin/env python3
"""Page V1.0.26 -> V1.0.27: embedded core v107 (see patch_core107.py): tile size sets up to 15, Non-boxy as a Minimum of 3 written
once. No change to the page itself.
Usage: python3 patch_ui_V1.0.27.py glimmith_solver_V1.0.26.html glimmith_solver_V1.0.27.html"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from patch_core107 import patch as core_patch
src = open(sys.argv[1], encoding='utf8').read()
a = src.index('  // ================= SOLVER CORE (pure'); b = src.index('  // ================= IMPORT CORE (pure')
src = src[:a] + core_patch(src[a:b], '  ') + src[b:]
open(sys.argv[2], 'w', encoding='utf8').write(src); print('ok', sys.argv[2])
