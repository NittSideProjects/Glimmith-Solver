#!/usr/bin/env python3
"""Page V1.0.36 -> V1.0.37.
1. The step-by-step colours every group of linked tiles (author: "I really like when the step by step puts colours, let's do that by
   default when any two tiles are linked, and use a different colour for each"). Until now a group got a colour only when a fact
   joined tiles that do not touch; now it gets one as soon as two of its tiles are linked (the puzzle's own links included). The rest
   is as before: a group joined to a coloured group takes the older colour, a finished piece keeps its colour and frees it.
2. Core v121 (patch_core121.py): a far join ("Far apart, but one piece") is only reported when the two groups do not touch.
Usage: python3 patch_ui_V1.0.37.py glimmith_solver_V1.0.36.html glimmith_solver_V1.0.37.html [--reference dev/reference/solver-core.v121.js]"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from patch_core121 import patch as core_patch

def rep(src, old, new, what):
    c = src.count(old)
    if c != 1: raise SystemExit(f'{what}: anchor found {c} times')
    return src.replace(old, new)

src = open(sys.argv[1], encoding='utf8').read()
a = src.index('  // ================= SOLVER CORE (pure'); b = src.index('  // ================= IMPORT CORE (pure')
core = core_patch(src[a:b], '  ')
src = src[:a] + core + src[b:]
src = rep(src, "    for(const [k, t] of puzzle.walls) if(t === 'link'){ const [a, b] = tiles(k); join(a, b, false); }",
               "    for(const [k, t] of puzzle.walls) if(t === 'link'){ const [a, b] = tiles(k); join(a, b, true); }        // V1.0.37: every linked group has a colour", 'own links')
src = rep(src, "      for(const e of st.edges) if(e.value !== 'wall'){ const [a, b] = tiles(e.spot.key); join(a, b, false); }",
               "      for(const e of st.edges) if(e.value !== 'wall'){ const [a, b] = tiles(e.spot.key); join(a, b, true); }   // V1.0.37", 'links')
src = rep(src, "  // also when they do not touch yet. A group gets a colour when a fact joins tiles that do not touch; every tile joined to it later",
               "  // also when they do not touch yet. A group gets a colour as soon as two of its tiles are linked (V1.0.37; before: only when a fact joined tiles that do not touch); every tile joined to it later", 'comment')
open(sys.argv[2], 'w', encoding='utf8').write(src); print('ok', sys.argv[2])
if '--reference' in sys.argv:
    out = sys.argv[sys.argv.index('--reference') + 1]
    open(out, 'w', encoding='utf8').write(''.join(l[2:] if l.startswith('  ') else l for l in core.splitlines(True))); print('ok', out)
