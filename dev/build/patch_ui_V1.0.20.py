#!/usr/bin/env python3
"""Page V1.0.19 -> V1.0.20: embedded core v103 (see patch_core103.py). "Show cases" rings the place where a case fails for many
more reasons, and the cases of a "far apart, but one piece" step found by trying the tiles apart are now found. No change to the
page itself.
Usage: python3 patch_ui_V1.0.20.py glimmith_solver_V1.0.19.html glimmith_solver_V1.0.20.html"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from patch_core103 import patch as core_patch
src = open(sys.argv[1], encoding='utf8').read()
a = src.index('  // ================= SOLVER CORE (pure'); b = src.index('  // ================= IMPORT CORE (pure')
src = src[:a] + core_patch(src[a:b], '  ') + src[b:]
open(sys.argv[2], 'w', encoding='utf8').write(src); print('ok', sys.argv[2])
