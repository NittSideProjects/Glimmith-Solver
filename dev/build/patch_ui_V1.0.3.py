#!/usr/bin/env python3
"""Page V1.0.2 -> V1.0.3: embedded core v96 (wally-ends, see patch_core96.py), its step text, Wally rule info point 4, and the import
core's node-only line (newest reference core instead of the removed v23) so the page copy matches dev/reference/import-core.js again.
Usage: python3 patch_ui_V1.0.3.py glimmith_solver_V1.0.2.html glimmith_solver_V1.0.3.html"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from patch_core96 import patch as core_patch
src = open(sys.argv[1], encoding='utf8').read()
a = src.index('  // ================= SOLVER CORE (pure'); b = src.index('  // ================= IMPORT CORE (pure')
src = src[:a] + core_patch(src[a:b], '  ') + src[b:]
def rep(old, new):
    global src
    c = src.count(old)
    if c != 1: raise SystemExit(f'page anchor found {c} times: {old[:120]}')
    src = src.replace(old, new)
rep("""    'wally-line': ['Wally + Gemini: lines of the same length',""",
"""    'wally-ends': ['Wally: two ends per piece', 'With Wally every piece is a path with two ends (a tile with 3 walls round it), a ring, or a single tile. A piece can not get a third end; a piece whose two ends are known goes straight through every other tile; and the ends can not outnumber two per piece: with every rose (or Solitude symbol) a dead end, every piece starts and ends at them.', 'With Wally every piece is a path with two ends. The piece on one side already has both its ends, and joining the other side would give it a third one (or the piece is already whole from end to end), so this is a wall.', 'With Wally every piece is a path with two ends. The two ends of this piece are known, or the known ends already use up every end the pieces can have, so this tile can not be an end: it has exactly two ways on and takes both.'],
    'wally-line': ['Wally + Gemini: lines of the same length',""")
rep("""it grows by exactly one tile.</li></ol>""",
"""it grows by exactly one tile.</li><li><b>Two ends per piece.</b> Every piece is a path with two ends (a tile with 3 walls), a ring, or a single tile. A piece never gets a third end, and once both its ends are known every other tile goes through. With two rose types and every rose a dead end (or Solitude with dead-end symbols), the ends are all used up: every piece starts and ends at its roses.</li></ol>""")
old_ic = "require('./solver-core.v23.js').canonicalShapeKey;"
if src.count(old_ic) != 1: raise SystemExit('import core line')
src = src.replace(old_ic, "require(require('../corepath.js').corePath()).canonicalShapeKey;   // V1.0.3: the newest reference core (v23 was removed)")
open(sys.argv[2], 'w', encoding='utf8').write(src); print('ok', sys.argv[2])
