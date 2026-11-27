#!/usr/bin/env python3
"""Core v135 (release V1.0.59): three steps the author found redundant are removed.

Each was switched off on the 1225 campaign puzzles (dev/tools/rewrites/notes_review_2026-11-27.md): none of them decides an edge
there that the other steps do not decide anyway.
  * pal-pair (palWindowStep, "Palisades side by side"): palisades that touch, enumerated together in a small window. On hand-made
    boards (two palisades corner to corner) it decides a few edges before the probes; the probes still find them.
  * stamp-pair ("Two polyominoes of the same shape, two pieces"): two same-shape polyominoes that no placement covers both of were
    recorded as different pieces. The polyomino placements (stamp-place) give the same walls.
  * the shape-fit walls ("Must still fit the shape"): a wall between two groups whose union no longer fits a polyomino's shape.
    The same check still makes a group that cannot fit its shape a contradiction (pieceInfo, tag shape-fit); only the wall step goes.
Removing a step can only leave edges open for later stages, never decide one differently.
Usage: python3 patch_core135.py <in.js> <out.js> [indent]"""
import sys

def rep(src, old, new, what):
    c = src.count(old)
    if c != 1: raise SystemExit(f'{what}: anchor found {c} times')
    return src.replace(old, new)

def patch(src, ind):
    ad = lambda t: ''.join(ind + l if l.strip() else l for l in t.splitlines(True))
    src = rep(src, "// ================= SOLVER CORE (pure, unit-tested separately; v134 (V1.0.57)",
        "// ================= SOLVER CORE (pure, unit-tested separately; v135 (V1.0.59) = v134 - pal-pair, stamp-pair and the shape-fit walls; v134 (V1.0.57)", 'banner')
    # pal-pair: the window step and its call
    a = src.index(ad("  // --- 3. palisades that touch: enumerate the sides of a small window together ---\n"))
    b = src.index(ad("  // ---- v96 (V1.0.3): wally-ends (see build/patch_core96.py) ----\n"))
    src = src[:a] + ad("  // v135: the window step for palisades that touch (pal-pair) is removed: redundant on the campaign\n\n") + src[b:]
    src = rep(src, ad("    return palWindowStep(dmap);\n"), ad("    return [];                                                  // v135: no pal-pair window step\n"), 'pal call')
    src = rep(src, ad("  'pal-pair': 'palisades next to each other can not all get their number of walls',\n"), "", 'pal-pair why')
    # stamp-pair
    src = rep(src, "if(!A.placements.some(P => P.includes(B.id))) forbidden.push([A.id, B.id, 'stamp-pair']);",
                   "// v135: no stamp-pair (two same-shape polyominoes no placement covers): the placements give the same walls", 'stamp-pair')
    src = rep(src, ad("  'stamp-pair': 'two polyominoes that cannot share a piece are forced together',\n"), "", 'stamp-pair why')
    # shape-fit walls
    src = rep(src, "if(pieceInfo(members.get(ra).concat(members.get(rb))) === null){ e.state = 1; changes.push({ e, value: 'wall', rule: why }); }",
                   "if(pieceInfo(members.get(ra).concat(members.get(rb))) === null && why !== 'shape-fit'){ e.state = 1; changes.push({ e, value: 'wall', rule: why }); }   // v135: no shape-fit walls", 'shape-fit wall')
    return src

if __name__ == '__main__':
    src = open(sys.argv[1], encoding='utf8').read()
    ind = sys.argv[3] if len(sys.argv) > 3 else ''
    open(sys.argv[2], 'w', encoding='utf8').write(patch(src, ind)); print('ok', sys.argv[2])
