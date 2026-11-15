#!/usr/bin/env python3
"""Core v118 (release V1.0.34): Size Separation as a relation on the walls (v115) is removed.
The author dropped refactoring step 3: it decided nothing new and was slower, so its code goes (it was off by default since v115).
Usage: python3 patch_core118.py <in.js> <out.js> [indent]"""
import sys, re

def rep(src, old, new, what):
    c = src.count(old)
    if c != 1: raise SystemExit(f'{what}: anchor found {c} times')
    return src.replace(old, new)

def patch(src, ind):
    I = lambda t: ''.join((ind + l if l.strip() else l) for l in t.splitlines(True))
    src = rep(src, "// ================= SOLVER CORE (pure, unit-tested separately; v117 (V1.0.33)",
        "// ================= SOLVER CORE (pure, unit-tested separately; v118 (V1.0.34) = v117 without the Size Separation relation of v115 (step 3 dropped); v117 (V1.0.33)", 'banner')
    src = rep(src, I("""  const neOn = !!ctx.mingleAreaRule && opts.sizeSepRel === true;           // v115: every wall between two groups = "sizes differ" (off by default: no gain, a few % slower)
  const relOn = relEdges.length > 0 || neOn;
"""), I("""  const relOn = relEdges.length > 0;
"""), 'relOn')
    i = src.index(ind + "      if(neOn) for(let q = 0; q < neA.length; q++){")
    j = src.index("\n" + ind + "      }\n", i) + len("\n" + ind + "      }\n")
    src = src[:i] + src[j:]
    i = src.index(ind + "    const neHit = new Set();"); j = src.index("\n", src.index(ind + "    if(neOn){ const seen", i)) + 1
    src = src[:i] + src[j:]
    src = rep(src, "why = neHit.has(rep) ? 'mingle-area-clash' : 'area-rel';", "why = 'area-rel';", 'fail tag')
    if 'neOn' in src or 'neHit' in src or 'neA' in src.replace('neAr', ''): raise SystemExit('leftover')
    return src

if __name__ == '__main__':
    ind = ' ' * int(sys.argv[3]) if len(sys.argv) > 3 else ''
    src = open(sys.argv[1], encoding='utf8').read()
    open(sys.argv[2], 'w', encoding='utf8').write(patch(src, ind))
    print('ok', sys.argv[2])
