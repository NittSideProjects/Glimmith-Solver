#!/usr/bin/env python3
"""Core v105 (release V1.0.25): every tile knows the size range of its piece ('tile sizes').

User's idea (second step of making the rules share their facts): every tile should know the area, or the range of areas, of the
piece it ends up in. An area number says it for its tile, a polyomino too (its size), a compass gives a lowest and a highest size,
Precision says "every tile has the number N", Minimum / Maximum a range, and the walls that compare sizes (difference, inequality,
gemini), the reach of a group, the closed-in areas and the count of pieces narrow it further. The old logic ("forced growth", "too
big", reach, ...) then works with the narrowed ranges.

Until v104 each group's lowest / highest size (need / capOf) was worked out again at every propagation pass from the clues alone
(pieceInfo) and then narrowed by the steps of that pass (walls that compare sizes, reach cap, closed-in areas, Match, Heterogeneous,
gemini / delta, ...), and everything the steps found was forgotten at the end of the pass.

New: two arrays tLo / tHi, one entry per tile: the lowest / highest size of the piece holding that tile (0 / 32767 = nothing known).
  * after every pass that worked out need / capOf, each group's bounds are written to its representative tile (the tile stands for
    the whole group: the bounds are about the piece that holds it, so they stay true when the group later grows or merges);
  * pieceInfo (the check "can these tiles still be one piece?", for a group or for two groups about to be merged) takes the overlap of
    the ranges of all its tiles. A merge whose tiles have no size in common is a wall ('size-range', "Different sizes"); a group
    with no size left is a contradiction. All the size logic reads need / capOf, so forced growth, reach, too big, the closed-in
    areas ... now start from what earlier passes found.
  * the ranges are part of the snapshot, so probes and searches undo them with the edges.
The rule names stay those of v104 where they can: a lowest size equal to the Minimum is not written (the Minimum is applied every pass
and its steps keep their own name, 'min-grow' / 'min-reach').

Sound: a bound written for a group holds in every tiling that has the edges decided so far (that is what need / capOf are), it is
about the piece holding the group's tiles, and the edges decided so far are only ever added to within a branch (rolled back with it).
opts.tileSizes === false switches it off.
Usage: python3 patch_core105.py <in.js> <out.js> [indent]"""
import sys

def rep(src, old, new, what):
    c = src.count(old)
    if c != 1: raise SystemExit(f'{what}: anchor found {c} times')
    return src.replace(old, new)

def patch(src, ind):
    I = lambda t: ''.join((ind + l if l.strip() else l) for l in t.splitlines(True))
    src = rep(src, "// ================= SOLVER CORE (pure, unit-tested separately; v104 (V1.0.24)",
        "// ================= SOLVER CORE (pure, unit-tested separately; v105 (V1.0.25) = v104 + tile sizes (every tile keeps the size range of its piece); v104 (V1.0.24)", 'banner')
    # the arrays, next to pieceInfo
    src = rep(src, I("""  function pieceInfo(ids){
    let cap = Math.min(ctx.sizeHi, ctx.totalActive), need = 1, area = 0, stamp = 0, mask = 0;
"""), I("""  const tsOn = opts.tileSizes !== false;                 // v105: the size range of the piece holding each tile (0 / 32767 = nothing known)
  const tLo = new Int16Array(N), tHi = new Int16Array(N).fill(32767);
  function pieceInfo(ids){
    let cap = Math.min(ctx.sizeHi, ctx.totalActive), need = 1, area = 0, stamp = 0, mask = 0;
"""), 'arrays')
    src = rep(src, I("""    let nd = Math.max(need, ids.length), cp = cap;
"""), I("""    let nd = Math.max(need, ids.length), cp = cap;
    if(tsOn){                                            // v105: what earlier passes found for these tiles
      for(let i = 0; i < ids.length; i++){ const t = ids[i]; if(tLo[t] > nd) nd = tLo[t]; if(tHi[t] < cp) cp = tHi[t]; }
      if(nd > cp){ why = 'size-range'; return null; }
    }
"""), 'overlap')
    # remember the bounds of every pass
    src = rep(src, I("""    const need = new Map(), capOf = new Map(), maskOf = new Map();
"""), I("""    const need = new Map(), capOf = new Map(), maskOf = new Map();
    if(passFrames.length){ const fr = passFrames[passFrames.length - 1]; fr.n = need; fr.c = capOf; }   // v105: this pass's bounds (its own frame: a step may run a nested propagate)
"""), 'pass maps')
    src = rep(src, I("""  function propagateOnce(){
"""), I("""  const passFrames = [];                                // v105: one frame per propagate() call: need / capOf of the pass that just ran
  function keepSizes(passNeed, passCap){
    const ndMin = minOn ? rLo : 0;                      // a lowest size that is only the Minimum stays the Minimum's (applied every pass)
    for(const [rep, lo] of passNeed){
      const hi = passCap.get(rep);
      if(lo > tLo[rep] && lo > ndMin) tLo[rep] = lo;
      if(hi < tHi[rep]) tHi[rep] = hi;
    }
  }
  function propagateOnce(){
"""), 'keep')
    src = rep(src, I("""        const part = propagateOnce();
        if(part === null){ failTrace = all; return null; }               // v102: what was decided before the contradiction
"""), I("""        const fr = { n: null, c: null }; passFrames.push(fr);
        let part; try { part = propagateOnce(); } finally { passFrames.pop(); }
        if(part === null){ failTrace = all; return null; }               // v102: what was decided before the contradiction
        if(tsOn && fr.n) keepSizes(fr.n, fr.c);                          // v105
"""), 'keep call')
    # snapshots
    src = rep(src, "fl: forbidden.length, hcg: hallCacheGen, ss: sizeSet, ml: matchList, rs: rangeSet }; }",
        "fl: forbidden.length, hcg: hallCacheGen, ss: sizeSet, ml: matchList, rs: rangeSet, tl: tLo.slice(), th: tHi.slice() }; }      // v105: + the tile sizes", 'snapshot')
    src = rep(src, I("""    if('ss' in sn){ sizeSet = sn.ss; matchList = sn.ml; rangeSet = sn.rs; }                    // v83b
"""), I("""    if('ss' in sn){ sizeSet = sn.ss; matchList = sn.ml; rangeSet = sn.rs; }                    // v83b
    if(sn.tl){ tLo.set(sn.tl); tHi.set(sn.th); }                                              // v105
"""), 'restore')
    # texts
    src = rep(src, I("""const WHY_TEXT = {
"""), I("""const WHY_TEXT = {
  'size-range': 'the sizes known for the tiles of a piece leave it no size',
"""), 'why text')
    src = rep(src, "'piece-count', 'piece-region']);", "'piece-count', 'piece-region', 'size-range']);", 'rule tags')
    return src

if __name__ == '__main__':
    ind = ' ' * int(sys.argv[3]) if len(sys.argv) > 3 else ''
    src = open(sys.argv[1], encoding='utf8').read()
    open(sys.argv[2], 'w', encoding='utf8').write(patch(src, ind))
    print('ok', sys.argv[2])
