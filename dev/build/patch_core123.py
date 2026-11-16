#!/usr/bin/env python3
"""Core v123 (release V1.0.44): a SAT final search for Match (idea from https://github.com/ham883/glimmith-solver, MIT).

The deduction steps run as before (the step-by-step keeps every one of them). When they stop on a Match puzzle, the exact final
search is a SAT search instead of the piece search, which had to guess a whole first piece (35 tiles on the author's "A Perfect
Fit": more than 15 minutes). The SAT search (build/sat_match123.js, inserted as is):
  * satNew(): a small CDCL SAT solver written for the page (no library, no network).
  * satMatchCases(): one case per piece size d the Match sizes leave (matchSizeCandidates). Tiles get a piece number (K = T / d
    pieces, numbered by their first tile); every piece k >= 1 is a motion of piece 0 (the piece of the first tile): one selector
    per orientation and per tile the first tile lands on, tied tile by tile in both directions. Piece 0 is connected (reach layers
    from the first tile), so the others are too. Also encoded: the walls and links the deductions proved, palisades, area numbers.
  * Every tiling the SAT solver finds goes through the exact checker (solvePuzzle with every edge fixed, as leafPieces does), which
    checks every rule. A tiling that fails is blocked and the search goes on; so only real solutions are reported, and the encoding
    may leave rules out (it never adds a constraint that a real solution could break). It stops at two solutions.
  * Too big (more than 4 million motion clauses: many small pieces): the old final search runs, as before.
opts.matchSat === false turns it off.
Usage: python3 patch_core123.py <in.js> <out.js> [indent]"""
import sys, os

def rep(src, old, new, what):
    c = src.count(old)
    if c != 1: raise SystemExit(f'{what}: anchor found {c} times')
    return src.replace(old, new)

SAT = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sat_match123.js'), encoding='utf8').read()

def patch(src, ind):
    I = lambda t: ''.join((ind + l if l.strip() else l) for l in t.splitlines(True))
    src = rep(src, "// ================= SOLVER CORE (pure, unit-tested separately; v122 (V1.0.43)",
        "// ================= SOLVER CORE (pure, unit-tested separately; v123 (V1.0.44) = v122 + a SAT final search for Match; v122 (V1.0.43)", 'banner')
    src = rep(src, I("function* deduceSolve(w, h, ctx, specialEdges, opts){\n"), I(SAT + "\nfunction* deduceSolve(w, h, ctx, specialEdges, opts){\n"), 'sat block')
    src = rep(src, I("""  if(!finalAnnounced) yield { type: 'stage', stage: 'final', stats: Object.assign({}, stats), counts: counts() };
"""), I("""  if(!finalAnnounced) yield { type: 'stage', stage: 'final', stats: Object.assign({}, stats), counts: counts() };
  if(ruleMatch && opts.matchSat !== false && matchS0 && matchS0.length){                  // v123: the SAT final search for Match
    const tix = new Int32Array(N).fill(-1); activeIds.forEach((id, i) => { tix[id] = i; });
    const adj = edges.map(e => [tix[e.a], tix[e.b], e.key]);
    const sw = new Set(finalWalls); for(const e of edges) if(e.fixed) sw.add(e.key);
    const pal = new Map();
    for(const [key, type0] of (ctx.palisades || new Map())){
      const [pc, pr] = key.split(',').map(Number), m = PAL_MASKS[String(type0)];
      if(m && ctx.isActive(pc, pr)) pal.set(tix[cid(pc, pr)], m);
    }
    const area = new Map(); for(const id of activeIds) if(areaAt[id] > 0) area.set(tix[id], areaAt[id]);
    const DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]];
    const side = (i, d) => { const id = activeIds[i], c = id % w, r = (id - c) / w, x = c + DIRS[d][0], y = r + DIRS[d][1];
      return (x < 0 || y < 0 || x >= w || y >= h || !ctx.isActive(x, y)) ? -1 : tix[cid(x, y)]; };
    const check = W => {
      const links = []; for(const e of edges) if(!W.has(e.key)) links.push([e.c1, e.r1, e.c2, e.r2]);
      for(const ev of solvePuzzle(w, h, ctx, specialEdges, 0, { extraWalls: W, links })) if(ev.type === 'solution') return ev.pieces;
      return null;
    };
    const gen = satMatchCases({ tiles: activeIds.map(id => [id % w, (id - id % w) / w]), adj, walls: sw,
      links: finalLinks.map(([c1, r1, c2, r2]) => [tix[cid(c1, r1)], tix[cid(c2, r2)]]), pal, side, area, sizes: matchS0.slice(),
      check, deadline: opts.deadline != null ? opts.deadline : null, stopAtTwo, maxClauses: opts.matchSatClauses });
    let res;
    for(;;){
      const nx = gen.next();
      if(nx.done){ res = nx.value; break; }
      const ev = nx.value;
      if(ev.type === 'solution'){
        const k = ev.pieces.map(p => p.cells.map(c => c.join(',')).sort().join(';')).sort().join('|');
        if(portSeen.has(k)) continue;
        portSeen.add(k); yield ev; continue;
      }
      yield ev;
      if(ev.type === 'timeout') return;
    }
    if(res !== 'too-big') return;
  }
"""), 'final')
    src = rep(src, "module.exports = { RULE_FAMILY,", "module.exports = { satNew, satMatchCases, RULE_FAMILY,", 'exports')
    return src

if __name__ == '__main__':
    src = open(sys.argv[1], encoding='utf8').read()
    ind = sys.argv[3] if len(sys.argv) > 3 else ''
    open(sys.argv[2], 'w', encoding='utf8').write(patch(src, ind)); print('ok', sys.argv[2])
