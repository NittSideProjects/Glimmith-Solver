#!/usr/bin/env python3
"""Page V1.0.32 -> V1.0.33: embedded cores v115 - v117 (see patch_core115.py ... patch_core117.py): Size Separation walls as size
relations (off by default), Gemini shares the shape and size lists across its walls, the box per tile also cuts the placements.
No change to what the page shows.
Usage: python3 patch_ui_V1.0.33.py glimmith_solver_V1.0.32.html glimmith_solver_V1.0.33.html"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import patch_core115, patch_core116, patch_core117

src = open(sys.argv[1], encoding='utf8').read()
a = src.index('  // ================= SOLVER CORE (pure'); b = src.index('  // ================= IMPORT CORE (pure')
core = src[a:b]
for p in (patch_core115, patch_core116, patch_core117): core = p.patch(core, '  ')
src = src[:a] + core + src[b:]
open(sys.argv[2], 'w', encoding='utf8').write(src); print('ok', sys.argv[2])
