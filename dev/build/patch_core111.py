#!/usr/bin/env python3
"""Core v111 (release V1.0.31): one forced-growth step ('growNeed', refactoring step 5 of 8).

User: the growth steps for size, Minimum, roses, Solitude and Non-boxy all mean "this group is not a finished piece yet, and this
is its only way out". Size, Minimum, area relations, roses and Solitude already shared one loop; Non-boxy had its own copy in
nonBoxStep. Now one function says what a group still lacks, and the single forced-growth loop uses it:
  growNeed(rep, mem) -> null (it may be a finished piece) or the rule that asks for more:
    roses / Solitude (a type missing), area-rel, min-grow, grow (smaller than its size), nonbox-grow (a rectangle that may grow).
  No way out = impossible; exactly one = that edge is a link (rule = what growNeed said).
The reach look-ahead was already one loop (reachOk / reachCount) for sizes, Minimum, roses and Solitude; compasses keep their own
region analysis (compassStep: it reasons on whole groups with a budget per side, not on tiles), so it is not merged.
Same decisions; a Non-boxy growth can now come a few steps earlier (the loop runs before the Boxy step).
Usage: python3 patch_core111.py <in.js> <out.js> [indent]"""
import sys

def rep(src, old, new, what):
    c = src.count(old)
    if c != 1: raise SystemExit(f'{what}: anchor found {c} times')
    return src.replace(old, new)

def patch(src, ind):
    I = lambda t: ''.join((ind + l if l.strip() else l) for l in t.splitlines(True))
    src = rep(src, "// ================= SOLVER CORE (pure, unit-tested separately; v110 (V1.0.30)",
        "// ================= SOLVER CORE (pure, unit-tested separately; v111 (V1.0.31) = v110 + one forced-growth step (growNeed); v110 (V1.0.30)", 'banner')
    src = rep(src, I("""    for(const [rep, mem] of members){
      const lacks = K > 0 && maskOf.get(rep) !== FULL;
      if(mem.length >= need.get(rep) && !lacks) continue;
      const ex = exits.get(rep) || [];
      const minOnly = !lacks && needBase !== null && mem.length >= needBase.get(rep);      // v26: it is the Minimum that asks for more tiles
      if(ex.length === 0){ failWhy = lacks ? roseTag('grow') : (minOnly ? 'min-reach' : 'no-exit'); markAt(failWhy, mem); return null; }                  // too small (or missing a rose) and nowhere to grow
      if(ex.length === 1){
        const e = ex[0]; e.state = 2; union(e.a, e.b); changes.push({ e, value: 'same', rule: lacks ? roseTag('grow') : (relRaised.has(rep) ? 'area-rel' : (minOnly ? 'min-grow' : 'grow')) });
        return changes;
      }
    }
"""), I("""    // v111: what a group still lacks before it can be a finished piece (null = nothing): one answer per rule
    const growNeed = (rep, mem) => {
      if(K > 0 && maskOf.get(rep) !== FULL) return roseTag('grow');                       // roses / Solitude: a type is missing
      if(mem.length < need.get(rep)){
        if(needBase !== null && mem.length >= needBase.get(rep)) return relRaised.has(rep) ? 'area-rel' : 'min-grow';   // v26: it is the Minimum that asks for more tiles
        return relRaised.has(rep) ? 'area-rel' : 'grow';
      }
      if(nbOn && capOf.get(rep) > mem.length){ const b = groupBox(mem); if(b.bw * b.bh === mem.length) return 'nonbox-grow'; }   // Non-boxy: a rectangle must grow
      return null;
    };
    for(const [rep, mem] of members){
      const tag = growNeed(rep, mem);
      if(tag === null) continue;
      const ex = exits.get(rep) || [];
      if(ex.length === 0){ failWhy = (tag === 'grow' || tag === 'area-rel' || tag === 'min-grow') ? ((needBase !== null && mem.length >= needBase.get(rep)) ? 'min-reach' : 'no-exit') : tag; markAt(failWhy, mem); return null; }   // nowhere to grow
      if(ex.length === 1){ const e = ex[0]; e.state = 2; union(e.a, e.b); changes.push({ e, value: 'same', rule: tag }); return changes; }
    }
"""), 'growth loop')
    src = rep(src, I("""      if(cnt === 0){ why = 'nonbox-grow'; return null; }
      if(cnt === 1){ only.state = 2; union(only.a, only.b); out.push({ e: only, value: 'same', rule: 'nonbox-grow' }); return out; }
"""), I("""      if(cnt === 0){ why = 'nonbox-grow'; return null; }                       // v111: one way out is the shared forced-growth step
"""), 'nonbox')
    return src

if __name__ == '__main__':
    ind = ' ' * int(sys.argv[3]) if len(sys.argv) > 3 else ''
    src = open(sys.argv[1], encoding='utf8').read()
    open(sys.argv[2], 'w', encoding='utf8').write(patch(src, ind))
    print('ok', sys.argv[2])
