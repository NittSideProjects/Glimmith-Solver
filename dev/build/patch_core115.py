#!/usr/bin/env python3
"""Core v115 (release V1.0.33): Size Separation as a relation on the walls (refactoring step 3 of 8, size half).

User: Size Separation means "sizes differ" across every wall between two pieces; treated that way it reuses the size-comparison
logic. Until v114 only the Size Separation step (mingleStep) used that fact. Now every decided wall between two groups is also a
"sizes differ" relation ('ne') in the shared size step (relStep, the lt / gt / diffN walls of v27): a group whose sizes are down to
one removes that size from the groups across its walls, and what that removes flows on through the other relations (the size count,
the walls of groups with no size in common, the tile size sets of v106). Heterogeneous (sizes differ between ALL pieces) implies it
for touching pieces, so it is on for both. A group left with no size this way fails with 'mingle-area-clash'.
The shape half (Mingle Shape as a Delta on every wall) was tried before (an earlier v110): no gain and 13% slower, so it stays out.
Usage: python3 patch_core115.py <in.js> <out.js> [indent]"""
import sys

def rep(src, old, new, what):
    c = src.count(old)
    if c != 1: raise SystemExit(f'{what}: anchor found {c} times')
    return src.replace(old, new)

def patch(src, ind):
    I = lambda t: ''.join((ind + l if l.strip() else l) for l in t.splitlines(True))
    src = rep(src, "// ================= SOLVER CORE (pure, unit-tested separately; v114 (V1.0.31)",
        "// ================= SOLVER CORE (pure, unit-tested separately; v115 (V1.0.33) = v114 + Size Separation walls as size relations; v114 (V1.0.31)", 'banner')
    src = rep(src, I("""  const relOn = relEdges.length > 0;
"""), I("""  const neOn = !!ctx.mingleAreaRule && opts.sizeSepRel !== false;           // v115: every wall between two groups = "sizes differ"
  const relOn = relEdges.length > 0 || neOn;
"""), 'relOn')
    src = rep(src, I("""        const B2 = relPrune(B, dom.get(ra), re.kind, re.value, true); if(B2 !== B){ dom.set(rb, B2); changed = true; }
      }
"""), I("""        const B2 = relPrune(B, dom.get(ra), re.kind, re.value, true); if(B2 !== B){ dom.set(rb, B2); changed = true; }
      }
      if(neOn) for(const e of spots){                                          // v115: Size Separation, sizes differ across every wall
        if(e.state !== 1) continue;
        const ra = find(e.a), rb = find(e.b);
        if(ra === rb) continue;
        const A = getDom(ra), B = getDom(rb);
        if(B !== 0n && (B & (B - 1n)) === 0n && (A & B)){ dom.set(ra, A & ~B); neHit.add(ra); changed = true; }
        const A1 = dom.get(ra);
        if(A1 !== 0n && (A1 & (A1 - 1n)) === 0n && (B & A1)){ dom.set(rb, B & ~A1); neHit.add(rb); changed = true; }
      }
"""), 'sweep')
    src = rep(src, I("""    derived = new Map(); relRaised = new Set();
"""), I("""    derived = new Map(); relRaised = new Set();
    const neHit = new Set();                                                   // v115: groups narrowed by a Size Separation wall
"""), 'neHit')
    src = rep(src, I("""      if(d === 0n){ why = 'area-rel'; markAt(why, members.get(rep)); return null; }
"""), I("""      if(d === 0n){ why = neHit.has(rep) ? 'mingle-area-clash' : 'area-rel'; markAt(why, members.get(rep)); return null; }
"""), 'fail tag')
    return src

if __name__ == '__main__':
    ind = ' ' * int(sys.argv[3]) if len(sys.argv) > 3 else ''
    src = open(sys.argv[1], encoding='utf8').read()
    open(sys.argv[2], 'w', encoding='utf8').write(patch(src, ind))
    print('ok', sys.argv[2])
