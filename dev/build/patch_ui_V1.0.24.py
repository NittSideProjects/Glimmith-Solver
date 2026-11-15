#!/usr/bin/env python3
"""Page V1.0.23 -> V1.0.24: embedded core v104 (see patch_core104.py): the number of pieces as one range (fewest .. most),
worked out once from every rule and clue that counts pieces, and the closed-in areas must add up to it ('piece-region').
Page: the step label of 'piece-region' (new text, added to the rewrite list).
Usage: python3 patch_ui_V1.0.24.py glimmith_solver_V1.0.23.html glimmith_solver_V1.0.24.html"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from patch_core104 import patch as core_patch

def rep(src, old, new, what):
    c = src.count(old)
    if c != 1: raise SystemExit(f'{what}: anchor found {c} times')
    return src.replace(old, new)

src = open(sys.argv[1], encoding='utf8').read()
a = src.index('  // ================= SOLVER CORE (pure'); b = src.index('  // ================= IMPORT CORE (pure')
src = src[:a] + core_patch(src[a:b], '  ') + src[b:]
anchor = '  STEP_INFO["box-all"] = '
src = rep(src, anchor, '''  STEP_INFO["piece-region"] = ["Number of pieces in closed-in areas", null, "The rules and clues fix how many pieces the board has, at least and at most, and every area closed in by walls holds whole pieces. Added up, the areas leave this one as many pieces as it has groups, so every group here is a piece of its own, with walls between them.", "The rules and clues fix how many pieces the board has, at least and at most, and every area closed in by walls holds whole pieces. Added up, the areas leave this one room for only one piece, so all its tiles are one piece."];   // V1.0.24
''' + anchor, 'step info')
open(sys.argv[2], 'w', encoding='utf8').write(src); print('ok', sys.argv[2])
