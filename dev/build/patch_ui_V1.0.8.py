#!/usr/bin/env python3
"""Page V1.0.7 -> V1.0.8 (page only, core stays v98): Delete / Backspace on a wall spot removes a wall rule.

On a tile, Delete / Backspace already removed the symbol. On a wall spot it did nothing. Now, with the mouse on a wall spot that holds a
wall rule (Delta, Gemini, Inequality, Difference, Link), Delete or Backspace removes it, the same as pressing that rule's key again.
A plain wall is left alone (it is drawn and removed with the mouse), and so is an empty spot.
Usage: python3 patch_ui_V1.0.8.py glimmith_solver_V1.0.7.html glimmith_solver_V1.0.8.html"""
import sys

def rep(src, old, new):
    c = src.count(old)
    if c != 1: raise SystemExit(f'anchor found {c} times: {old[:120]}')
    return src.replace(old, new)

src = open(sys.argv[1], encoding='utf8').read()
src = rep(src, """        if(/^[0-9]$/.test(key)){ e.preventDefault(); toggle(`diff${key}`); return; }
        return;
      }
""", """        if(/^[0-9]$/.test(key)){ e.preventDefault(); toggle(`diff${key}`); return; }
        if(key === 'backspace' || key === 'delete'){                       // V1.0.8: remove a wall rule (a plain wall stays)
          const t = puzzle.walls.get(wallKey);
          if(t && t !== 'wall'){ e.preventDefault(); puzzle.walls.delete(wallKey); renderPuzzle(); scheduleSave(); }
          return;
        }
        return;
      }
""")
open(sys.argv[2], 'w', encoding='utf8').write(src); print('ok', sys.argv[2])
