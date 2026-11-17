#!/usr/bin/env python3
"""Core v126 (release V1.0.47): the shape key of a finished group is computed once, not on every propagation pass.

Since v108 every pass looks at each Delta wall: when the group on one side is finished, its shape is ruled out on the other side.
The shape key (canonicalShapeKey: the 8 orientations of the group, normalised and sorted) was computed again on every pass, for
every such group, also inside the probes and the final search. On a base-game Delta puzzle that was a third of the search time.
The same holds for the Gemini / Delta shape check (gdCompleteStep, v52).
The key now comes from a small cache keyed by the group's tile list (same tiles = same key; cleared when it holds 20000 keys).
Nothing else changes for these two: the same keys, the same deductions.

Also: the size count (sizeCountStep: v62 for Mismatch, every puzzle since the piece count of v104) worked out each group's one possible size again for every size k (a
BigInt bit test through a string each time); it now does it once per group and again only when that group's sizes change.

Also: the reach cap (v101) no longer runs inside the final search (searchLite; opts.reachCapSearch === true runs it there too).
It still runs in the steps and the probes, where it decides edges. Inside the search it made a base-game Difference puzzle visit
1664 nodes instead of 1216, so the first 2 s slice of the search ran out and the narrow searches added 6 s (2 s -> 9 s). The same for the label-join (v98, opts.labelJoinSearch === true runs it in the search):
it decides joins in the steps and probes, but in the search it made a base-game puzzle visit 384 nodes instead of 64 (1 s -> 2.3 s).
Usage: python3 patch_core126.py <in.js> <out.js> [indent]"""
import sys

def rep(src, old, new, what):
    c = src.count(old)
    if c != 1: raise SystemExit(f'{what}: anchor found {c} times')
    return src.replace(old, new)

def patch(src, ind):
    I = lambda t: ''.join((ind + l if l.strip() else l) for l in t.splitlines(True))
    src = rep(src, "// ================= SOLVER CORE (pure, unit-tested separately; v125 (V1.0.46)",
        "// ================= SOLVER CORE (pure, unit-tested separately; v126 (V1.0.47) = v125 + the shape key of a finished group is cached, the reach cap and the label-join stay out of the final search; v125 (V1.0.46)", 'banner')
    src = rep(src, I("""          if(kx === null && mx.length >= need.get(x) && groupComplete(x, mx)) kx = canonicalShapeKey(mx.map(id => [id % w, (id - id % w) / w]));
"""), I("""          if(kx === null && mx.length >= need.get(x) && groupComplete(x, mx)) kx = groupShapeKey(mx);                 // v126: cached
"""), 'use cache')
    src = rep(src, I("""  function propagateOnce(){
"""), I("""  const gskCache = new Map();                                                    // v126: sorted tile list -> canonical shape key
  function groupShapeKey(mem){
    const ids = mem.slice().sort((a, b) => a - b), t = ids.join(',');
    let k = gskCache.get(t);
    if(k === undefined){
      k = canonicalShapeKey(ids.map(id => [id % w, (id - id % w) / w]));
      if(gskCache.size >= 20000) gskCache.clear();
      gskCache.set(t, k);
    }
    return k;
  }
  function propagateOnce(){
"""), 'cache')
    src = rep(src, I("""    const key = rep => { let k = keyOf.get(rep); if(k === undefined){ k = canonicalShapeKey(members.get(rep).map(id => [id % w, (id - id % w) / w])); keyOf.set(rep, k); } return k; };
"""), I("""    const key = rep => { let k = keyOf.get(rep); if(k === undefined){ k = groupShapeKey(members.get(rep)); keyOf.set(rep, k); } return k; };   // v126: cached
"""), 'gd key')
    src = rep(src, I("""      if(opts.reachCap !== false){                                               // v101: a piece stays inside the tiles its group can still reach
"""), I("""      if(opts.reachCap !== false && (!searchLite || opts.reachCapSearch === true)){   // v101: a piece stays inside the tiles its group can still reach (v126: not in the final search)
"""), 'reach cap')
    src = rep(src, I("""    let changed = false;
    const reps = [...members.keys()];
    for(let k = 1; k < mmQ.length; k++){
      if(!mmQ[k] && mmQ[k] !== 0) continue;
      const pinned = reps.filter(r => known(r) === k);
"""), I("""    let changed = false;
    const reps = [...members.keys()];
    const kn = new Int32Array(reps.length); for(let i = 0; i < reps.length; i++) kn[i] = known(reps[i]);   // v126: once per group (updated below)
    for(let k = 1; k < mmQ.length; k++){
      if(!mmQ[k] && mmQ[k] !== 0) continue;
      const pinned = []; for(let i = 0; i < reps.length; i++) if(kn[i] === k) pinned.push(reps[i]);
"""), 'size count known')
    src = rep(src, I("""      const inSet = new Set(set), bit = 1n << BigInt(k);
      for(const r of reps){
        if(inSet.has(r)) continue;
        let free = true; for(const s of set) if(!apart(r, s, k)){ free = false; break; }
        if(!free) continue;                                                    // could still be one of those pieces
        const d = getDom(r);
        if(d & bit){ const nd = d & ~bit; if(nd === 0n){ why = mmWhy; return null; } dom.set(r, nd); changed = true; }
      }
"""), I("""      const inSet = new Set(set), bit = 1n << BigInt(k);
      for(let ri = 0; ri < reps.length; ri++){
        const r = reps[ri];
        if(inSet.has(r)) continue;
        let free = true; for(const s of set) if(!apart(r, s, k)){ free = false; break; }
        if(!free) continue;                                                    // could still be one of those pieces
        const d = getDom(r);
        if(d & bit){ const nd = d & ~bit; if(nd === 0n){ why = mmWhy; return null; } dom.set(r, nd); kn[ri] = known(r); changed = true; }
      }
"""), 'size count update')
    src = rep(src, I("""    if(opts.labelJoin !== false){
      factTag = 'label-join';
"""), I("""    if(opts.labelJoin !== false && (!searchLite || opts.labelJoinSearch === true)){      // v126: not in the final search
      factTag = 'label-join';
"""), 'label join')
    return src

if __name__ == '__main__':
    src = open(sys.argv[1], encoding='utf8').read()
    ind = sys.argv[3] if len(sys.argv) > 3 else ''
    open(sys.argv[2], 'w', encoding='utf8').write(patch(src, ind)); print('ok', sys.argv[2])
