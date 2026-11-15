#!/usr/bin/env python3
"""Page V1.0.33 -> V1.0.34: the author approved refactoring step 8, so the step names that follow the logic are now the default
(the "Name steps by logic" box starts ticked; unticking it is remembered in the browser and brings back the rule's own titles).
Core v118 (patch_core118.py): step 3 (Size Separation as a relation on the walls) is dropped.
Usage: python3 patch_ui_V1.0.34.py glimmith_solver_V1.0.33.html glimmith_solver_V1.0.34.html"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from patch_core118 import patch as core_patch

def rep(src, old, new, what):
    c = src.count(old)
    if c != 1: raise SystemExit(f'{what}: anchor found {c} times')
    return src.replace(old, new)

src = open(sys.argv[1], encoding='utf8').read()
a = src.index('  // ================= SOLVER CORE (pure'); b = src.index('  // ================= IMPORT CORE (pure')
src = src[:a] + core_patch(src[a:b], '  ') + src[b:]
src = rep(src, "let stepFamilies = false; try { stepFamilies = localStorage.getItem('glimmith.stepFamilies') === '1'; } catch(e){}",
               "let stepFamilies = true; try { stepFamilies = localStorage.getItem('glimmith.stepFamilies') !== '0'; } catch(e){}      // V1.0.34: on by default", 'default')
open(sys.argv[2], 'w', encoding='utf8').write(src); print('ok', sys.argv[2])
