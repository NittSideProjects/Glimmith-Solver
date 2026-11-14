#!/usr/bin/env python3
"""Page V1.0.17 -> V1.0.18: embedded core v101 (see patch_core101.py): a group on a wall that compares sizes has at most the tiles
it can still reach, so "this piece has 3 or 4 tiles" is known and the piece across a Difference wall gets its size (and grows) by
the rules instead of the final search. No change to the page itself.
Usage: python3 patch_ui_V1.0.18.py glimmith_solver_V1.0.17.html glimmith_solver_V1.0.18.html"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from patch_core101 import patch as core_patch
src = open(sys.argv[1], encoding='utf8').read()
a = src.index('  // ================= SOLVER CORE (pure'); b = src.index('  // ================= IMPORT CORE (pure')
src = src[:a] + core_patch(src[a:b], '  ') + src[b:]
open(sys.argv[2], 'w', encoding='utf8').write(src); print('ok', sys.argv[2])
