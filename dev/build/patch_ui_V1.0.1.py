#!/usr/bin/env python3
"""Page V1 -> V1.0.1: embedded core v94 (wally-line, see patch_core94.py), step texts, Wally entry of the rule info.
Usage: python3 patch_ui_V1.0.1.py glimmith_solver_V1.html glimmith_solver_V1.0.1.html"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from patch_core94 import patch as core_patch

src = open(sys.argv[1], encoding='utf8').read()
a = src.index('  // ================= SOLVER CORE (pure')
b = src.index('  // ================= IMPORT CORE (pure')
src = src[:a] + core_patch(src[a:b], '  ') + src[b:]

def rep(old, new):
    global src
    c = src.count(old)
    if c != 1: raise SystemExit(f'page anchor found {c} times: {old[:120]}')
    src = src.replace(old, new)

rep("""    'wally-two': ['Wally: only two pieces',""",
"""    'wally-line': ['Wally + Gemini: lines of the same length', null, 'The two pieces of a Gemini wall have the same shape, so a straight line in one piece has a twin of the same length in the other. The solver tried every place where the twin could still get a line this long: the ones it refuted are gone, and the lengths left say where this line stops. It stops here.', 'The two pieces of a Gemini wall have the same shape, so a straight line in one piece has a twin of the same length in the other. The solver tried every place where the twin could still get a line this long: the ones it refuted are gone, and the lengths left say this line has to grow through this edge.'],
    'gemini-line': ['Gemini: lines of the same length', null, 'The two pieces of a Gemini wall have the same shape, so a straight line in one piece has a twin of the same length in the other. The solver tried every place where the twin could still get a line this long: the ones it refuted are gone, and the lengths left say where this line stops. It stops here.', 'The two pieces of a Gemini wall have the same shape, so a straight line in one piece has a twin of the same length in the other. The solver tried every place where the twin could still get a line this long: the ones it refuted are gone, and the lengths left say this line has to grow through this edge.'],
    'wally-two': ['Wally: only two pieces',""")

rep("""<li><b>Placements.</b> A polyomino, bank shape or rectangle that holds a T is dropped: with Boxy every piece is a strip or a 2x2 block.</li></ol>""",
"""<li><b>Placements.</b> A polyomino, bank shape or rectangle that holds a T is dropped: with Boxy every piece is a strip or a 2x2 block.</li><li><b>Gemini lines.</b> The two pieces of a Gemini wall have the same straight lines. If one side holds 4 tiles in a line and the other side can not get a new line of 4 anywhere (every try is refuted), the 4 must be the twin of a line the other side already has: next to a closed line of 5, it grows by exactly one tile.</li></ol>""")
open(sys.argv[2], 'w', encoding='utf8').write(src)
print('ok', sys.argv[2])
