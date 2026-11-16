#!/usr/bin/env python3
"""Core v122 (release V1.0.43): two steps a person sees first (the author's rule-order notes, TODO.md).

1. "Known to be different" first ('basic'). Two groups with a wall between two of their tiles are different pieces (one piece can not
   hold a wall), so every other open edge between them is a wall. Until v121 no step said so on its own: another rule that also
   walled such an edge got the credit (a watchtower, on the author's "Caged"). Now it is checked at the start of every pass.
2. Two area numbers that do not fit in one closed-in area ('area-pair'). In an area closed in by walls, two groups whose area numbers
   add up to more than the area's tiles can not be two pieces (a piece never leaves the area): equal numbers -> one piece (a far join
   when they do not touch), different numbers -> impossible. Before, the solver found it by trying the other way (the author's "1-10",
   two 8s in an area of 13 tiles).
Sound: both hold in every tiling with the edges decided so far.
Usage: python3 patch_core122.py <in.js> <out.js> [indent]"""
import sys

def rep(src, old, new, what):
    c = src.count(old)
    if c != 1: raise SystemExit(f'{what}: anchor found {c} times')
    return src.replace(old, new)

def patch(src, ind):
    I = lambda t: ''.join((ind + l if l.strip() else l) for l in t.splitlines(True))
    src = rep(src, "// ================= SOLVER CORE (pure, unit-tested separately; v121 (V1.0.37)",
        "// ================= SOLVER CORE (pure, unit-tested separately; v122 (V1.0.43) = v121 + known-different walls first, two area numbers in one closed-in area; v121 (V1.0.37)", 'banner')
    src = rep(src, I("""    if(staticWhy){ failWhy = staticWhy; return null; }                                  // v25: the grid alone rules Match / Mismatch out
"""), I("""    if(staticWhy){ failWhy = staticWhy; return null; }                                  // v25: the grid alone rules Match / Mismatch out
    if(opts.basicFirst !== false){                                                       // v122: groups with a wall between two of their tiles are different pieces
      const apart = new Set();
      for(const e of edges){ if(e.state !== 1) continue; const a = find(e.a), b = find(e.b); if(a !== b) apart.add(a < b ? a * N + b : b * N + a); }
      const bw = [];
      if(apart.size) for(const e of spots){ if(e.state !== 0) continue; const a = find(e.a), b = find(e.b); if(a !== b && apart.has(a < b ? a * N + b : b * N + a)){ e.state = 1; bw.push({ e, value: 'wall', rule: 'basic' }); } }
      if(bw.length) return bw;
    }
"""), 'basic')
    src = rep(src, I("""    // v110: how many pieces each area closed in by walls holds (roses / Solitude, Match, sizes, the board's count)
"""), I("""    if(areaPairOn){ const ap = areaPairStep(dmap); if(ap === null){ failWhy = why; return null; } if(ap.again) return ap; }      // v122
    // v110: how many pieces each area closed in by walls holds (roses / Solitude, Match, sizes, the board's count)
"""), 'call')
    src = rep(src, I("""  // v110: one count step for the areas closed in by walls (see build/patch_core110.py)
"""), I("""  // v122: two groups whose area numbers add up to more than the area closed in by walls round them are one piece (see build/patch_core122.py)
  const areaPairOn = opts.areaPair !== false && activeIds.some(id => areaAt[id] > 0);
  function areaPairStep(dmap){
    const out = [];
    for(const tiles of openRegions()){
      const s = tiles.length, gr = new Map();                  // rep -> [area number, a tile with it]
      for(const id of tiles) if(areaAt[id] > 0){ const r = find(id); if(!gr.has(r)) gr.set(r, [areaAt[id], id]); }
      if(gr.size < 2) continue;
      const list = [...gr.values()];
      for(let i = 0; i < list.length; i++) for(let j = i + 1; j < list.length; j++){
        const [a, ta] = list[i], [b, tb] = list[j];
        if(find(ta) === find(tb) || a + b <= s) continue;
        if(a !== b){ why = 'area-pair'; markAt(why, [ta, tb]); return null; }
        const d = dmap.get(find(ta)); if(d && d.has(find(tb))){ why = 'area-pair'; markAt(why, [ta, tb]); return null; }
        factTag = 'area-pair'; try { union(ta, tb); } finally { factTag = ''; }
        out.again = true;
      }
    }
    return out;
  }
  // v110: one count step for the areas closed in by walls (see build/patch_core110.py)
"""), 'step')
    src = rep(src, "'region-apart']);", "'region-apart', 'area-pair']);", 'tags')
    src = rep(src, I("""  'area-region': """), I("""  'area-pair': 'two area numbers in one area closed in by walls need more tiles than the area has',
  'area-region': """), 'why')
    src = rep(src, "'area-region': ['region', 'area-numbers'],", "'area-region': ['region', 'area-numbers'], 'area-pair': ['region', 'area-numbers'],", 'family')
    return src

if __name__ == '__main__':
    ind = ' ' * int(sys.argv[3]) if len(sys.argv) > 3 else ''
    src = open(sys.argv[1], encoding='utf8').read()
    open(sys.argv[2], 'w', encoding='utf8').write(patch(src, ind))
    print('ok', sys.argv[2])
