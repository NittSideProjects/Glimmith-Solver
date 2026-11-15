#!/usr/bin/env python3
"""Page V1.0.30 -> V1.0.31: embedded cores v111 - v114 (refactoring steps 5 to 8, see patch_core111.py ... patch_core114.py):
one forced-growth step, a box per tile, one corner-pattern checker for Bricky and Loopy, and the table of shared steps (RULE_FAMILY).
No change to what the page shows (step 8's new step names wait for the author's approval).
Usage: python3 patch_ui_V1.0.31.py glimmith_solver_V1.0.30.html glimmith_solver_V1.0.31.html"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import patch_core111, patch_core112, patch_core113, patch_core114

src = open(sys.argv[1], encoding='utf8').read()
a = src.index('  // ================= SOLVER CORE (pure'); b = src.index('  // ================= IMPORT CORE (pure')
core = src[a:b]
for p in (patch_core111, patch_core112, patch_core113, patch_core114): core = p.patch(core, '  ')
src = src[:a] + core + src[b:]
open(sys.argv[2], 'w', encoding='utf8').write(src); print('ok', sys.argv[2])
