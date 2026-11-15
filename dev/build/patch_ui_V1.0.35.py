#!/usr/bin/env python3
"""Page V1.0.34 -> V1.0.35: embedded core v119 (see patch_core119.py): Wally, the dead-end budget tried both ways along the link
counts. No change to what the page shows (the steps keep the 'wally-ends' name).
Usage: python3 patch_ui_V1.0.35.py glimmith_solver_V1.0.34.html glimmith_solver_V1.0.35.html"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from patch_core119 import patch as core_patch
src = open(sys.argv[1], encoding='utf8').read()
a = src.index('  // ================= SOLVER CORE (pure'); b = src.index('  // ================= IMPORT CORE (pure')
src = src[:a] + core_patch(src[a:b], '  ') + src[b:]
open(sys.argv[2], 'w', encoding='utf8').write(src); print('ok', sys.argv[2])
