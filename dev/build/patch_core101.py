#!/usr/bin/env python3
"""Core v101 (release V1.0.18): a piece stays inside the tiles its group can still reach ('reach cap').

User (a puzzle with Difference walls, not in the repository): a pocket holds three groups side by side, with a Difference wall
between the middle one and each of its neighbours. The two outer groups can only reach one more tile each, so their sizes are
known within one tile, so the middle piece is that much bigger and has to leave the pocket through its narrow neck. The solver did
not see it: it knew a lowest size for every group (need) but its highest size (capOf) was the global one (every tile of the
board), so the small sizes were never known and the walls that compare sizes had nothing to work with. It went to the final search.

New, in the propagation pass just before the walls that compare sizes (relStep): for every group on such a wall, count the tiles
the group can still reach: through edges that are not walls, never into a group known to be another piece (the same count the
'reach' rule uses, reachCount). A piece never holds more tiles than that, so capOf is lowered to it. Fewer than the group needs is
a contradiction ('reach'). A link the group then needs to reach its size is tagged 'area-rel' (it was 'min-reach', the Minimum's
tag, whenever a size wall had raised the size). Only reaches up to 24 tiles are counted (the search stops there): a bigger pocket rarely decides a
size, and the count stays cheap. opts.reachCap === false switches it off.

Sound: every tile of the group's piece is connected to it through tiles of that piece, so through edges that are not walls and
never through a tile of another piece.
Usage: python3 patch_core101.py <in.js> <out.js> [indent]"""
import sys

def rep(src, old, new, what):
    c = src.count(old)
    if c != 1: raise SystemExit(f'{what}: anchor found {c} times')
    return src.replace(old, new)

def patch(src, ind):
    I = lambda t: ''.join((ind + l if l.strip() else l) for l in t.splitlines(True))
    src = rep(src, "// ================= SOLVER CORE (pure, unit-tested separately; v100 (V1.0.17) = v99 without the experimental guess layer",
        "// ================= SOLVER CORE (pure, unit-tested separately; v101 (V1.0.18) = v100 + reach cap (a group on a size wall has at most the tiles it can reach); v100 (V1.0.17) = v99 without the experimental guess layer", 'banner')
    src = rep(src, I("""    if(relOn){
      const rl = relStep(need, capOf, dmap);
"""), I("""    if(relOn){
      if(opts.reachCap !== false){                                               // v101: a piece stays inside the tiles its group can still reach
        const seen = new Set(), none = new Set();
        for(const re of relEdges) for(const t of [re.a, re.b]){
          const rep = find(t); if(seen.has(rep)) continue; seen.add(rep);
          const cap = capOf.get(rep), lim = Math.min(cap, 24) + 1;
          const n = reachCount(rep, members.get(rep), dmap.get(rep) || none, null, lim);
          if(n >= lim) continue;                                               // it reaches as many tiles as it may have (or too many to matter)
          if(n < need.get(rep)){ failWhy = 'reach'; return null; }
          capOf.set(rep, n);
        }
      }
      const rl = relStep(need, capOf, dmap);
"""), 'reach cap')
    # a link forced by a size the walls that compare sizes ask for is theirs, not the Minimum's
    src = rep(src, I("""        return (fast ? reachCnt >= baseNd : reachOk(rep, mem, blocked, closed, baseNd, cp)) ? 'min-reach' : reachWhy;
"""), I("""        return (fast ? reachCnt >= baseNd : reachOk(rep, mem, blocked, closed, baseNd, cp)) ? (relRaised.has(rep) ? 'area-rel' : 'min-reach') : reachWhy;   // v101
"""), 'reach tag')
    return src

if __name__ == '__main__':
    ind = ' ' * int(sys.argv[3]) if len(sys.argv) > 3 else ''
    src = open(sys.argv[1], encoding='utf8').read()
    open(sys.argv[2], 'w', encoding='utf8').write(patch(src, ind))
    print('ok', sys.argv[2])
