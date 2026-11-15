#!/usr/bin/env python3
"""Core v117 (release V1.0.33): the box per tile also cuts the placements (refactoring step 6 of 8, second half).

v112 kept on each tile the box its piece must fit in (tBx) and used it in the reach searches. Now the shared placement decision
(placeDecide, v109) also drops the places that leave the group's box before it keeps what they all agree on. If the box would drop
every place, the list is kept as it is (the place steps have their own failure checks; this one only sharpens what they decide).
Sound: a place outside the box can never be the group's piece.
Usage: python3 patch_core117.py <in.js> <out.js> [indent]"""
import sys

def rep(src, old, new, what):
    c = src.count(old)
    if c != 1: raise SystemExit(f'{what}: anchor found {c} times')
    return src.replace(old, new)

def patch(src, ind):
    I = lambda t: ''.join((ind + l if l.strip() else l) for l in t.splitlines(True))
    src = rep(src, "// ================= SOLVER CORE (pure, unit-tested separately; v116 (V1.0.33)",
        "// ================= SOLVER CORE (pure, unit-tested separately; v117 (V1.0.33) = v116 + the box per tile cuts the placements; v116 (V1.0.33)", 'banner')
    src = rep(src, I("""  function placeDecide(V, tag, out, rep, link){
    for(const P of V) for(const id of P) cntBuf[id]++;
"""), I("""  function placeDecide(V, tag, out, rep, link){
    if(rep >= 0 && V.length > 1){                                             // v117: not the places outside the group's box
      let x0 = 0, x1 = w - 1, y0 = 0, y1 = h - 1;
      for(const id of members.get(find(rep)) || []){ const b = 4 * id; if(tBx[b] > x0) x0 = tBx[b]; if(tBx[b + 1] < x1) x1 = tBx[b + 1]; if(tBx[b + 2] > y0) y0 = tBx[b + 2]; if(tBx[b + 3] < y1) y1 = tBx[b + 3]; }
      if(x0 > 0 || y0 > 0 || x1 < w - 1 || y1 < h - 1){
        const inB = P => { for(const id of P){ const x = id % w, y = (id - x) / w; if(x < x0 || x > x1 || y < y0 || y > y1) return false; } return true; };
        const V2 = V.filter(inB);
        if(V2.length > 0 && V2.length < V.length) V = V2;
      }
    }
    for(const P of V) for(const id of P) cntBuf[id]++;
"""), 'placeDecide')
    return src

if __name__ == '__main__':
    ind = ' ' * int(sys.argv[3]) if len(sys.argv) > 3 else ''
    src = open(sys.argv[1], encoding='utf8').read()
    open(sys.argv[2], 'w', encoding='utf8').write(patch(src, ind))
    print('ok', sys.argv[2])
