#!/usr/bin/env python3
"""Page V1.0.41 -> V1.0.42: the step-by-step cycles through the group colours (page only).

Author: the colour of a new group was the first free one; when pieces get finished fast, the first colour (red) is free again and
again, so most of the puzzle ended red. Now the colours are handed out in turn (the one after the last given), skipping those held by
groups that are not finished yet; only when every colour is held is the least-used one taken (as before).
Usage: python3 patch_ui_V1.0.42.py glimmith_solver_V1.0.41.html glimmith_solver_V1.0.42.html"""
import sys

def rep(src, old, new, what):
    c = src.count(old)
    if c != 1: raise SystemExit(f'{what}: anchor found {c} times')
    return src.replace(old, new)

src = open(sys.argv[1], encoding='utf8').read()
src = rep(src, "    const take = () => { let best = 0; for(let i = 0; i < held.length; i++){ if(!held[i]) return i; if(held[i] < held[best]) best = i; } return best; };",
"""    let turn = -1;                                                       // V1.0.42: colours in turn, not always the first free one
    const take = () => { let best = -1; for(let s = 1; s <= held.length; s++){ const i = (turn + s) % held.length; if(!held[i]){ turn = i; return i; } if(best < 0 || held[i] < held[best]) best = i; } turn = best; return best; };""", 'take')
open(sys.argv[2], 'w', encoding='utf8').write(src); print('ok', sys.argv[2])
