#!/usr/bin/env python3
"""Core v124 (release V1.0.45): the tile-size "changed" flag is part of the snapshot.

tsDirty (v105) says that a tile's sizes or shapes changed in this pass, so propagate() runs one more pass. It was a plain variable:
a trial inside a pass (a probe, the compass crowd / tile-probe cases: join, propagate, roll back) could set it, and the roll back
kept it set, so the outer pass looked changed although nothing outside the trial was. On a base-game compass puzzle (8 compasses,
23 tiles) every pass did this: propagate() ran its 1000-pass cap in the first propagation (7.9 s instead of 0.08 s, since v108).
Now snapshot() keeps the flag and restore() puts it back, like every other part of the state. Sound: it only removes passes in
which nothing outside a rolled-back trial changed; every deduction still comes from a pass that saw a real change.
Usage: python3 patch_core124.py <in.js> <out.js> [indent]"""
import sys

def rep(src, old, new, what):
    c = src.count(old)
    if c != 1: raise SystemExit(f'{what}: anchor found {c} times')
    return src.replace(old, new)

def patch(src, ind):
    I = lambda t: ''.join((ind + l if l.strip() else l) for l in t.splitlines(True))
    src = rep(src, "// ================= SOLVER CORE (pure, unit-tested separately; v123 (V1.0.44)",
        "// ================= SOLVER CORE (pure, unit-tested separately; v124 (V1.0.45) = v123 + the tile-size changed flag is rolled back with a trial; v123 (V1.0.44)", 'banner')
    src = rep(src, "tn: tNot.slice(), tb: tBx.slice() }; }", "tn: tNot.slice(), tb: tBx.slice(), td: tsDirty }; }", 'snapshot')
    src = rep(src, I("""    if(sn.tn){ for(let i = 0; i < N; i++) tNot[i] = sn.tn[i]; }                               // v108
  }
"""), I("""    if(sn.tn){ for(let i = 0; i < N; i++) tNot[i] = sn.tn[i]; }                               // v108
    if('td' in sn) tsDirty = sn.td;                                                           // v124: a rolled-back trial leaves the pass unchanged
  }
"""), 'restore')
    return src

if __name__ == '__main__':
    src = open(sys.argv[1], encoding='utf8').read()
    ind = sys.argv[3] if len(sys.argv) > 3 else ''
    open(sys.argv[2], 'w', encoding='utf8').write(patch(src, ind)); print('ok', sys.argv[2])
