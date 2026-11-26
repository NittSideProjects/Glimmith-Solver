#!/usr/bin/env python3
"""Core v133 (release V1.0.56): the probes try the most promising edges first.

The probe loop (try each open edge both ways; a contradiction decides it) walked the edges in spotOrder (distance to a clue).
Each round now sorts the open edges by a score, highest first (ties keep spotOrder), and the round is sorted again after it:
  +3 a tile of the edge holds a clue, -2 when both do (they are often far from any contradiction), +3 a tile of the edge is on a
  special wall (palisade, gemini, size wall, ...), +3 a tile of the edge has a known piece size, +1 a decided link and +1 a decided
  wall touch one of its tiles, +2 a watchtower sits at one end of the edge.
The weights were tuned on 150 campaign puzzles (10 per zone and difficulty 1-5), then checked on all 1225: the same answers,
proofs by contradiction 4314 -> 4108 (-5%), time the same (839 -> 830 s). Only the order changes: every edge is still tried
in every round until a round decides nothing, exactly as before, so nothing that was found is lost and nothing new is accepted.
Usage: python3 patch_core133.py <in.js> <out.js> [indent]"""
import sys

def rep(src, old, new, what):
    c = src.count(old)
    if c != 1: raise SystemExit(f'{what}: anchor found {c} times')
    return src.replace(old, new)

OLD = """  function* probeLoop(){
    let progress = true;
    while(progress){
      progress = false;
      for(const e of spotOrder){
        if(e.state !== 0) continue;"""
NEW = """  function* probeLoop(){
    // v133: each round tries the open edges by score, highest first (ties keep spotOrder); see patch_core133.py for the weights.
    const clueT = new Uint8Array(N), specT = new Uint8Array(N);
    for(const id of activeIds){ const x = id % w; if(symbolCountAt(x, (id - x) / w, ctx) > 0) clueT[id] = 1; }
    for(const se of (specialEdges || [])){ specT[cid(se.c1, se.r1)] = 1; specT[cid(se.c2, se.r2)] = 1; }
    const probeScore = e => {
      let s = 0; const ca = clueT[e.a], cb = clueT[e.b];
      if(ca || cb) s += 3; if(ca && cb) s -= 2;
      if(specT[e.a] || specT[e.b]) s += 3;
      if(tsOn && ((tLo[e.a] === tHi[e.a]) || (tLo[e.b] === tHi[e.b]))) s += 3;
      let lk = 0, wl = 0;
      for(const t of [e.a, e.b]) for(const { e: f } of adjE[t]){ if(f === e) continue; if(f.state === 2) lk = 1; else if(f.state === 1) wl = 1; }
      s += lk + wl;
      if(ctx.watchtowers){
        const vert = e.r1 === e.r2 ? [[e.c1 + 1, e.r1], [e.c1 + 1, e.r1 + 1]] : [[e.c1, e.r1 + 1], [e.c1 + 1, e.r1 + 1]];
        if(vert.some(([x, y]) => ctx.watchtowers.has(`${x},${y}`))) s += 2;
      }
      return s;
    };
    let progress = true;
    while(progress){
      progress = false;
      const order = spotOrder.filter(e => e.state === 0).map((e, i) => ({ e, i, s: probeScore(e) })).sort((x, y) => y.s - x.s || x.i - y.i);
      for(const { e } of order){
        if(e.state !== 0) continue;"""

def patch(src, ind):
    src = rep(src, "// ================= SOLVER CORE (pure, unit-tested separately; v132 (V1.0.55)",
        "// ================= SOLVER CORE (pure, unit-tested separately; v133 (V1.0.56) = v132 + the probes try the most promising edges first; v132 (V1.0.55)", 'banner')
    ad = lambda t: ''.join(ind + l if l.strip() else l for l in t.splitlines(True))
    src = rep(src, ad(OLD), ad(NEW), 'probeLoop')
    return src

if __name__ == '__main__':
    src = open(sys.argv[1], encoding='utf8').read()
    ind = sys.argv[3] if len(sys.argv) > 3 else ''
    open(sys.argv[2], 'w', encoding='utf8').write(patch(src, ind)); print('ok', sys.argv[2])
