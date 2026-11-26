#!/usr/bin/env python3
"""Core v131 (release V1.0.54): reach does not walk into a group that would make the piece too big.

reachOk (the reach / forced-growth count: the tiles a group can still reach must be enough for its piece) walked into the tiles of other
groups as if they were free. But a piece that holds this group and one tile of another group holds that whole group (a group is
tiles known to be in one piece). When the group first meets another group G at BFS distance d, every piece holding both has at least
|group| + (d - 1) tiles on the way + |G| tiles; if that is more than the largest size this piece can have (cap), no piece holds both,
so the walk does not enter G at all (it stays reachable through other ways only if those are short enough, which the BFS order
gives: the first meeting is the nearest one). Sound: it only removes tiles no piece of this group can contain.
On the author's "Dungoen" (precision 17) a 12-tile group whose lower way out leads through one free tile into finished pieces had to
be proved by trying the other way; now reach sees that only the other way out is left.
Usage: python3 patch_core131.py <in.js> <out.js> [indent]"""
import sys

def rep(src, old, new, what):
    c = src.count(old)
    if c != 1: raise SystemExit(f'{what}: anchor found {c} times')
    return src.replace(old, new)

def patch(src, ind):
    I = lambda t: ''.join((ind + l if l.strip() else l) for l in t.splitlines(True))
    src = rep(src, "// ================= SOLVER CORE (pure, unit-tested separately; v130 (V1.0.53)",
        "// ================= SOLVER CORE (pure, unit-tested separately; v131 (V1.0.54) = v130 + reach does not walk into a group that would make the piece too big; v130 (V1.0.53)", 'banner')
    src = rep(src, I("""    const lack = FULL & ~mask, best = (K > 0 && lack) ? new Array(K).fill(1e9) : null;
    let found = 0;
    for(let qi = 0; qi < qn; qi++){
      const id = rcQ[qi];
      if(palPass && !palPass[id] && find(id) !== rep) continue;                // v68
      for(const { e, o: nid } of adjE[id]){
        if(rcSeen[nid] === tick) continue;
        if(rbRep === rep && ((nid % w) < rbX0 || (nid % w) > rbX1 || ((nid - nid % w) / w) < rbY0 || ((nid - nid % w) / w) > rbY1)) continue;   // v112: outside the piece's box
        if(e.state === 1 || e === closed) continue;
        if(blocked.has(find(nid))) continue;
"""), I("""    const lack = FULL & ~mask, best = (K > 0 && lack) ? new Array(K).fill(1e9) : null;
    let found = 0;
    const grpMet = (opts.reachGroupSize !== false && cap > 0) ? new Map() : null;   // v131: group -> may the piece take it in (decided at the first, nearest meeting)
    for(let qi = 0; qi < qn; qi++){
      const id = rcQ[qi];
      if(palPass && !palPass[id] && find(id) !== rep) continue;                // v68
      for(const { e, o: nid } of adjE[id]){
        if(rcSeen[nid] === tick) continue;
        if(rbRep === rep && ((nid % w) < rbX0 || (nid % w) > rbX1 || ((nid - nid % w) / w) < rbY0 || ((nid - nid % w) / w) > rbY1)) continue;   // v112: outside the piece's box
        if(e.state === 1 || e === closed) continue;
        if(blocked.has(find(nid))) continue;
        if(grpMet){ const g = find(nid);
          if(g !== rep && g !== find(id)){ let ok = grpMet.get(g);
            if(ok === undefined){ ok = mem.length + rcDist[id] + members.get(g).length <= cap; grpMet.set(g, ok); }
            if(!ok) continue; } }
"""), 'reach group size')
    # the fast count (no roses / compasses: the reach rule uses only this) gets the same check; it needs the BFS distance and the cap
    src = rep(src, I("""  const rStamp = new Int32Array(N), rQueue = new Int32Array(N); let rTick = 0;
  function reachCount(rep, mem, blocked, closed, need){
    const tick = ++rTick; let qn = 0;
    for(const id of mem){ rStamp[id] = tick; rQueue[qn++] = id; }
    if(qn >= need) return qn;
    const far = closed ? find(find(closed.a) === rep ? closed.b : closed.a) : -1;
    for(let qi = 0; qi < qn; qi++){
      if(palPass && !palPass[rQueue[qi]] && find(rQueue[qi]) !== rep) continue;   // v68
      for(const { e, o } of adjE[rQueue[qi]]){
        if(rStamp[o] === tick || e.state === 1 || e === closed) continue;
        if(rbRep === rep && ((o % w) < rbX0 || (o % w) > rbX1 || ((o - o % w) / w) < rbY0 || ((o - o % w) / w) > rbY1)) continue;   // v112: outside the piece's box
        const g = find(o);
        if(g === far || blocked.has(g)) continue;
        rStamp[o] = tick; rQueue[qn++] = o;
"""), I("""  const rStamp = new Int32Array(N), rQueue = new Int32Array(N), rDist = new Int32Array(N); let rTick = 0;
  function reachCount(rep, mem, blocked, closed, need, cap){
    const tick = ++rTick; let qn = 0;
    for(const id of mem){ rStamp[id] = tick; rDist[id] = 0; rQueue[qn++] = id; }
    if(qn >= need) return qn;
    const far = closed ? find(find(closed.a) === rep ? closed.b : closed.a) : -1;
    const grpMet = (opts.reachGroupSize !== false && cap > 0) ? new Map() : null;   // v131: see reachOk
    for(let qi = 0; qi < qn; qi++){
      const cur = rQueue[qi];
      if(palPass && !palPass[cur] && find(cur) !== rep) continue;   // v68
      for(const { e, o } of adjE[cur]){
        if(rStamp[o] === tick || e.state === 1 || e === closed) continue;
        if(rbRep === rep && ((o % w) < rbX0 || (o % w) > rbX1 || ((o - o % w) / w) < rbY0 || ((o - o % w) / w) > rbY1)) continue;   // v112: outside the piece's box
        const g = find(o);
        if(g === far || blocked.has(g)) continue;
        if(grpMet && g !== rep && g !== find(cur)){ let ok = grpMet.get(g);
          if(ok === undefined){ ok = mem.length + rDist[cur] + members.get(g).length <= cap; grpMet.set(g, ok); }
          if(!ok) continue; }
        rStamp[o] = tick; rDist[o] = rDist[cur] + 1; rQueue[qn++] = o;
"""), 'reachCount group size')
    src = rep(src, "if(fast){ reachCnt = reachCount(rep, mem, blocked, closed, nd); reachWhy = 'reach'; return reachCnt < nd; }",
                   "if(fast){ reachCnt = reachCount(rep, mem, blocked, closed, nd, cp); reachWhy = 'reach'; return reachCnt < nd; }", 'fast call cap')
    return src

if __name__ == '__main__':
    src = open(sys.argv[1], encoding='utf8').read()
    ind = sys.argv[3] if len(sys.argv) > 3 else ''
    open(sys.argv[2], 'w', encoding='utf8').write(patch(src, ind)); print('ok', sys.argv[2])
