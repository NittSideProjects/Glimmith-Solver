#!/usr/bin/env python3
"""Core v110 (release V1.0.30): one count step for the areas closed in by walls ('areaCountStep', refactoring step 4 of 8).

User: the closed-in area steps of roses / Solitude, Match and the number of pieces all ask the same question: how many pieces does
this area hold, at least and at most? Until v109 each had its own step, and each only drew part of the conclusion (roses and Match:
"exactly one piece = one piece"). Now one step, for every area closed in by walls:
  * every rule gives its count for the area: the sizes (fewest / most pieces of the allowed sizes, at most one per group), the roses
    or Solitude symbols (exactly the number of each type: they must agree, as before), Match with one size left (tiles / size), and
    the board's number of pieces (v104: the areas add up to it; not inside probes);
  * the counts are combined (the highest "at least", the lowest "at most"); none left = impossible;
  * at most one piece: the area is one piece (all its tiles linked) - with the name of the rule that said so ('rose-region',
    'solitude-region', 'match-region', 'piece-region');
  * at least as many pieces as it has groups: every group is a piece of its own, walls between them. New for roses, Solitude and
    Match ('region-apart', "Closed-in area: one piece per group"); 'piece-region' when the board's count said it. When only the sizes
    say it, it is left to the range step (rangeStep, 'range-region'), which also narrows each group's size and is not changed.
regionStep (roses), matchRegionStep and pieceCountStep are no longer called (their code stays for reading).
Sound: each count holds in every tiling with the edges decided so far; a piece is a union of groups, so an area never holds more
pieces than groups.
Usage: python3 patch_core110.py <in.js> <out.js> [indent]"""
import sys

def rep(src, old, new, what):
    c = src.count(old)
    if c != 1: raise SystemExit(f'{what}: anchor found {c} times')
    return src.replace(old, new)

def patch(src, ind):
    I = lambda t: ''.join((ind + l if l.strip() else l) for l in t.splitlines(True))
    src = rep(src, "// ================= SOLVER CORE (pure, unit-tested separately; v109 (V1.0.29)",
        "// ================= SOLVER CORE (pure, unit-tested separately; v110 (V1.0.30) = v109 + one count step for the closed-in areas (areaCountStep); v109 (V1.0.29)", 'banner')
    # the call sites: the rose / Match steps become the shared step; the later piece-count call goes
    src = rep(src, I("""    // roses: regions closed in by walls
    if(K > 0){
      const rg = regionStep();
      if(rg === null){ failWhy = why; return null; }
      if(rg.length > 0 || rg.again) return rg;
    }
    if(ruleMatch){
      const mr = matchRegionStep();
      if(mr.length > 0 || mr.again) return mr;
    }
"""), I("""    // v110: how many pieces each area closed in by walls holds (roses / Solitude, Match, sizes, the board's count)
    if(K > 0 || ruleMatch || (pcOn && !inProbe)){
      const ac = areaCountStep();
      if(ac === null){ failWhy = why; return null; }
      if(ac.length > 0 || ac.again) return ac;
    }
"""), 'calls')
    src = rep(src, I("""    if(pcOn && !inProbe){                                                        // v104: the areas closed in add up to the number of pieces (not inside probes: it costs more than it finds there)
      const pg = pieceCountStep(need, capOf);
      if(pg === null){ failWhy = why; return null; }
      if(pg.length > 0 || pg.again) return pg;
    }
"""), "", 'old piece call')
    # the shared step
    src = rep(src, I("""  function pieceCountStep(need, capOf){
"""), I("""  // v110: one count step for the areas closed in by walls (see build/patch_core110.py)
  function areaCountStep(){
    const regs = openRegions(), R = regs.length;
    if(R === 0) return [];
    const useGlobal = pcOn && !inProbe;
    const matchS = (ruleMatch && sizeSet && sizeSet.length === 1 && sizeSet[0] >= 2) ? sizeSet[0] : 0;
    const G = new Int32Array(R), LO = new Int32Array(R), HI = new Int32Array(R), loTag = new Array(R), hiTag = new Array(R);
    for(let i = 0; i < R; i++){
      const tiles = regs[i], s = tiles.length, gs = new Set();
      for(const id of tiles) gs.add(find(id));
      const g = gs.size; G[i] = g;
      let lo = 1, hi = g, lt = 'size', ht = 'size';
      let a = RI ? RI.minN[s] : Math.ceil(s / Math.max(1, rHi)), b = RI ? RI.maxN[s] : Math.floor(s / Math.max(1, rLo));
      if(a >= 0 && b >= a && a <= s){ if(a > lo){ lo = a; lt = 'size'; } if(b < hi){ hi = b; ht = 'size'; } }
      if(K > 0){                                                              // roses / Solitude: exactly the count of each type
        const cnt = new Array(K).fill(0);
        for(const id of tiles){ const m = roseMask[id]; if(m) for(let q = 0; q < K; q++) if(m & (1 << q)) cnt[q]++; }
        const n = cnt[0];
        if(n === 0 || cnt.some(c => c !== n)){ why = roseTag('region'); markAt(why, tiles); return null; }
        if(s < n * ctx.sizeLo || s > n * ctx.sizeHi){ why = roseTag('region'); markAt(why, tiles); return null; }
        if(n > lo){ lo = n; lt = roseTag('region'); }
        if(n < hi){ hi = n; ht = roseTag('region'); }
      }
      if(matchS && s % matchS === 0){ const n = s / matchS; if(n > lo){ lo = n; lt = 'match-region'; } if(n < hi){ hi = n; ht = 'match-region'; } }
      if(lo > hi){ why = K > 0 ? roseTag('region') : matchS ? 'match-region' : 'piece-region'; markAt(why, tiles); return null; }
      LO[i] = lo; HI[i] = hi; loTag[i] = lt; hiTag[i] = ht;
    }
    if(useGlobal){                                                            // the areas add up to the board's number of pieces
      let sMin = 0, sMax = 0;
      for(let i = 0; i < R; i++){ sMin += LO[i]; sMax += HI[i]; }
      if(sMin > ctx.pieceHi || sMax < ctx.pieceLo){ why = 'piece-region'; return null; }
      for(let i = 0; i < R; i++){
        const hiI = ctx.pieceHi - (sMin - LO[i]), loI = ctx.pieceLo - (sMax - HI[i]);
        if(hiI < HI[i]){ HI[i] = hiI; hiTag[i] = 'piece-region'; }
        if(loI > LO[i]){ LO[i] = loI; loTag[i] = 'piece-region'; }
        if(LO[i] > HI[i]){ why = 'piece-region'; markAt(why, regs[i]); return null; }
      }
    }
    const out = []; let merged = false;
    for(let i = 0; i < R; i++){
      const tiles = regs[i];
      if(HI[i] === 1 && tiles.length > 1 && hiTag[i] !== 'size'){              // one piece: the whole area is linked
        const s = tiles.length;
        if(s > rHi || s < rLo || (RI && !RI.usable.includes(s))){ why = hiTag[i]; markAt(why, tiles); return null; }
        for(const id of tiles) if(find(id) !== find(tiles[0])){ union(tiles[0], id); merged = true; }
        for(const id of tiles) for(const { e, o } of adjE[id]) if(e.state === 0 && find(o) === find(id)){ e.state = 2; out.push({ e, value: 'same', rule: hiTag[i] }); }
      } else if(G[i] > 1 && LO[i] >= G[i] && loTag[i] !== 'size'){              // as many pieces as groups: every group is a piece of its own
        const tag = loTag[i] === 'piece-region' ? 'piece-region' : 'region-apart';
        for(const id of tiles) for(const { e, o } of adjE[id]) if(e.state === 0 && find(o) !== find(id)){ e.state = 1; out.push({ e, value: 'wall', rule: tag }); }
      }
    }
    if(merged) out.again = true;
    return out;
  }
  function pieceCountStep(need, capOf){
"""), 'step')
    src = rep(src, "'piece-count', 'piece-region', 'size-range', 'shape-range']);", "'piece-count', 'piece-region', 'size-range', 'shape-range', 'region-apart']);", 'rule tags')
    return src

if __name__ == '__main__':
    ind = ' ' * int(sys.argv[3]) if len(sys.argv) > 3 else ''
    src = open(sys.argv[1], encoding='utf8').read()
    open(sys.argv[2], 'w', encoding='utf8').write(patch(src, ind))
    print('ok', sys.argv[2])
