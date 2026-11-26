#!/usr/bin/env python3
"""Core v130 (release V1.0.53): "Show cases" rings the right area for a closed-in area of a wrong size.

range-region (and bank-region) fail when an area closed in by walls can not be covered by pieces of the allowed sizes. The check
looked at the areas in board order and rang the first failing one, cut to 60 tiles (markAt). A tried wall usually cuts the board in
two areas that both fail; the first in board order is the big one starting at the top-left, so the case pop-up rang 60 tiles of the
top-left corner, far from the wall that was tried (the author's "Dungoen", precision 17). Now every area is checked first and the
smallest failing one is rung, whole (markAt keeps up to 400 tiles). Only the tiles reported for the explanation change: the check
fails in exactly the same cases as before, so no result can change.
Usage: python3 patch_core130.py <in.js> <out.js> [indent]"""
import sys

def rep(src, old, new, what):
    c = src.count(old)
    if c != 1: raise SystemExit(f'{what}: anchor found {c} times')
    return src.replace(old, new)

def patch(src, ind):
    I = lambda t: ''.join((ind + l if l.strip() else l) for l in t.splitlines(True))
    src = rep(src, "// ================= SOLVER CORE (pure, unit-tested separately; v129 (V1.0.50)",
        "// ================= SOLVER CORE (pure, unit-tested separately; v130 (V1.0.53) = v129 + Show cases rings the smallest closed-in area of a wrong size, whole; v129 (V1.0.50)", 'banner')
    src = rep(src, I("""  function markAt(tag, tiles){ failAt = tiles.length > 60 ? tiles.slice(0, 60) : tiles.slice(); failAtTag = tag; }
"""), I("""  function markAt(tag, tiles){ failAt = tiles.length > 400 ? tiles.slice(0, 400) : tiles.slice(); failAtTag = tag; }     // v130: was 60
"""), 'markAt cap')
    src = rep(src, I("""    let merged = false;
    for(let ri = 0; ri < regs.length; ri++){
      const tiles = regs[ri], s = tiles.length, reps = groups[ri];
      if(!RI.reach[s]){ why = regionTag; markAt(why, tiles); return null; }
"""), I("""    let merged = false;
    {                                                               // v130: every area first; ring the smallest one that fails
      let bad = -1;
      for(let ri = 0; ri < regs.length; ri++){
        const s = regs[ri].length, reps = groups[ri]; let fail = !RI.reach[s] || reps.length < RI.minN[s];
        if(!fail){ let zlo = 0, zhi = 0; for(const z of RI.usable){ if(z > s) break; if(RI.reach[s - z]){ if(!zlo) zlo = z; zhi = z; } }
          fail = !zlo || (reps.length === 1 && members.get(reps[0]).length > zhi); }
        if(fail && (bad < 0 || s < regs[bad].length)) bad = ri;
      }
      if(bad >= 0){ why = regionTag; markAt(why, regs[bad]); return null; }
    }
    for(let ri = 0; ri < regs.length; ri++){
      const tiles = regs[ri], s = tiles.length, reps = groups[ri];
      if(!RI.reach[s]){ why = regionTag; markAt(why, tiles); return null; }
"""), 'rangeStep smallest')
    return src

if __name__ == '__main__':
    src = open(sys.argv[1], encoding='utf8').read()
    ind = sys.argv[3] if len(sys.argv) > 3 else ''
    open(sys.argv[2], 'w', encoding='utf8').write(patch(src, ind)); print('ok', sys.argv[2])
