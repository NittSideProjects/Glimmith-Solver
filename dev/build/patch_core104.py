#!/usr/bin/env python3
"""Core v104 (release V1.0.24): the number of pieces, as one range (fewest .. most), shared by every rule ('piece count').

User's idea (first step of making the rules share their facts): the number of pieces is known, or bounded, from many places -
the roses (n of each type = n pieces), Solitude (one symbol each), Precision (the size divides the tile count), the area numbers
and polyominoes (they need whole pieces of their size), Heterogeneous (all sizes different), Mismatch (no more pieces of k tiles
than shapes of k tiles), the user's limit on pieces. Until v103 each rule worked out its own count, and only an upper bound was
kept (pieceCapMax). Keeping a lowest AND a highest count lets them meet: "every shape has to be used exactly once", "the numbers
already fill the board", and so on.

New, in buildSolverContext (pieceCountInfo): one counting pass over

  * the sizes a piece can have (Minimum / Maximum / Precision / bank / Non-boxy >= 3, as narrowed before),
  * for each size k: the FEWEST pieces of k tiles the clues force (area number v on m tiles: at least ceil(m / v) pieces of v tiles;
    a polyomino on m tiles: ceil(m / size) pieces of that shape; area numbers and polyominoes of one size share those pieces, so
    the larger of the two counts) and the MOST pieces of k tiles the rules allow (Heterogeneous: 1; Mismatch: the number of
    different shapes of k tiles, from mismatchSizeInfo),
  * the count the symbols give (roses, Solitude) and the user's limit.

It is a counting problem only (a 2-D knapsack: tiles x pieces, with a bounded number of pieces of each size). The answer, true in
EVERY valid tiling:
  ctx.pieceLo / ctx.pieceHi     fewest / most pieces (pieceCapMax becomes pieceHi)
  ctx.pieceMult.lo[k] / .hi[k]  fewest / most pieces of k tiles (hi[k] = 0: no piece of k tiles)
  ctx.sizeLo / ctx.sizeHi       narrowed to the sizes that occur in some count; rangeInfo is rebuilt for them (not under Match:
                                its own size list already knows them, and narrowing here switched on costly Minimum steps)
  ctx.countInfeasible           no count at all: impossible ('piece-count')
Match: all pieces have one size s, so the count is T / s for the sizes matchSizeCandidates keeps; matchSizeCandidates now also
drops the sizes whose count falls outside pieceLo..pieceHi.

During the propagation (pieceCountStep, after the closed-in areas): every area closed in by walls holds between minN and maxN
pieces (from its tile count and the sizes, and never more pieces than groups). Added up they must reach pieceLo and stay within
pieceHi ('piece-region' otherwise). And one area's count is then squeezed by the others: when it must hold as many pieces as it
has groups, every group is a piece of its own (walls between them); when it can hold only one piece, it is one piece (links).

The v62 size count (Mismatch, at most q[k] pieces of k tiles) now also takes the caps of the count pass (all rules, not only Mismatch).

Sound: every bound is a count that holds in every tiling, and the knapsack only drops counts no tiling can have.
The propagation step stays out of probes (like the area-number step). opts.pieceCount === false switches it off (the static part is always on).
Usage: python3 patch_core104.py <in.js> <out.js> [indent]"""
import sys

def rep(src, old, new, what):
    c = src.count(old)
    if c != 1: raise SystemExit(f'{what}: anchor found {c} times')
    return src.replace(old, new)

def patch(src, ind):
    I = lambda t: ''.join((ind + l if l.strip() else l) for l in t.splitlines(True))
    src = rep(src, "// ================= SOLVER CORE (pure, unit-tested separately; v103 (V1.0.20)",
        "// ================= SOLVER CORE (pure, unit-tested separately; v104 (V1.0.24) = v103 + piece count (fewest .. most pieces, shared by every rule); v103 (V1.0.20)", 'banner')

    # ---- the count pass, run at the end of buildSolverContext ----
    src = rep(src, I("""  if(puzzleLinks.length) linkGroupsInto(ctxOut, puzzleLinks);                       // v90
  return ctxOut;
}
"""), I("""  if(!rangeInfeasible){                                                             // v104: the number of pieces
    const pc = pieceCountInfo(ctxOut, puzzleState.w, puzzleState.h);
    if(pc && !pc.ok) ctxOut.countInfeasible = true;
    else if(pc){
      ctxOut.pieceLo = pc.lo; ctxOut.pieceHi = pc.hi; ctxOut.pieceMult = pc;
      ctxOut.pieceCapMax = ctxOut.pieceCapMax == null ? pc.hi : Math.min(ctxOut.pieceCapMax, pc.hi);
      if(pc.sizes && pc.sizes.length && !ctxOut.matchRule){                        // Match keeps its own sizes (matchS0): narrowing here only switches on the Minimum steps, slower
        const nlo = Math.max(ctxOut.sizeLo, pc.sizes[0]), nhi = Math.min(ctxOut.sizeHi, pc.sizes[pc.sizes.length - 1]);
        if(nlo !== ctxOut.sizeLo || nhi !== ctxOut.sizeHi){
          ctxOut.sizeLo = nlo; ctxOut.sizeHi = nhi;
          if(rangeInfo){ const rc = rangeCover(activeSet.size, Math.max(nlo, (rules && rules.nonBoxy) ? 3 : 1), nhi, bankSizes); if(rc.ok) ctxOut.rangeInfo = rc; }
        }
      }
    }
  }
  if(puzzleLinks.length) linkGroupsInto(ctxOut, puzzleLinks);                       // v90
  return ctxOut;
}

// v104 'piece count' (see build/patch_core104.py): the fewest / most pieces of any tiling, and of each size. null = nothing to count.
function pieceCountInfo(ctx, w, h){
  const T = ctx.totalActive;
  if(!(T > 0) || T > 2500) return null;
  const f = gatherFacts(ctx, w, h);
  const lo = Math.max(1, ctx.sizeLo, ctx.nonBoxyRule ? 3 : 1), hi = Math.min(ctx.sizeHi, T);
  if(lo > hi) return { ok: false };
  let cLo = 1, cHi = T;                                     // the count the symbols / the user's limit give
  if(ctx.maxRegions != null) cHi = Math.min(cHi, ctx.maxRegions);
  if(ctx.activeRoseTypes.size > 0){
    if(f.roseCounts.size < ctx.activeRoseTypes.size) return { ok: false };
    const n = [...f.roseCounts.values()][0];
    if([...f.roseCounts.values()].some(c => c !== n)) return { ok: false };
    cLo = Math.max(cLo, n); cHi = Math.min(cHi, n);
  } else if(ctx.solitudeRule){
    let S = 0, dbl = false;
    for(let r = 0; r < h; r++) for(let c = 0; c < w; c++){ if(!ctx.isActive(c, r)) continue; const n = symbolCountAt(c, r, ctx); S += n; if(n > 1) dbl = true; }
    if(S === 0) return { ok: false };
    if(!dbl){ cLo = Math.max(cLo, S); cHi = Math.min(cHi, S); }
  }
  if(cLo > cHi) return { ok: false };
  // the sizes a piece can have
  const allowed = new Uint8Array(hi + 1);
  let bankSz = null;
  if(ctx.useBank){
    bankSz = new Set(ctx.bankOrientations.map(o => o.cells.length));
    for(const [key, n] of f.stampKeys) if(!(ctx.banInfo && ctx.banInfo.keyBanned(key))) bankSz.add(n);
  }
  for(let k = lo; k <= hi; k++) if((!bankSz || bankSz.has(k)) && (!ctx.rangeInfo || ctx.rangeInfo.usable.includes(k))) allowed[k] = 1;
  // the fewest pieces of each size the clues force
  const mand = new Map(), areaTiles = new Map(), stampTiles = new Map();
  for(let r = 0; r < h; r++) for(let c = 0; c < w; c++){
    if(!ctx.isActive(c, r)) continue;
    const a = ctx.requiredAreaAt(c, r); if(a != null) areaTiles.set(a, (areaTiles.get(a) || 0) + 1);
    const s = ctx.requiredShapeAt(c, r); if(s != null) stampTiles.set(s, (stampTiles.get(s) || 0) + 1);
  }
  const stampBySize = new Map();
  for(const [key, m] of stampTiles){ const n = f.stampKeys.get(key); stampBySize.set(n, (stampBySize.get(n) || 0) + Math.ceil(m / n)); }
  for(const [v, m] of areaTiles) mand.set(v, Math.ceil(m / v));
  for(const [n, p] of stampBySize) mand.set(n, Math.max(mand.get(n) || 0, p));
  for(const [k] of mand) if(k > hi || k < 1 || !allowed[k]) return { ok: false };
  // the most pieces of each size the rules allow
  const cap = new Array(hi + 1).fill(Infinity);
  if(ctx.heteroRule) cap.fill(1);
  if(ctx.mismatchRule){
    const mi = mismatchSizeInfo(ctx, w, h, f);
    if(!mi.ok) return { ok: false };
    if(mi.q) for(let k = lo; k <= hi; k++) cap[k] = Math.min(cap[k], mi.q[k] || 0);
  }
  if(ctx.matchRule){                                        // one size s for every piece: T / s pieces
    let sizes = matchSizeCandidates(ctx, f).filter(s => s >= lo && s <= hi && allowed[s]);
    sizes = sizes.filter(s => { const n = T / s; if(n < cLo || n > cHi || n > cap[s]) return false; for(const [k, m] of mand) if(k !== s || m > n) return false; return true; });
    if(!sizes.length) return { ok: false };
    const mlo = new Array(hi + 1).fill(0), mhi = new Array(hi + 1).fill(0);
    let plo = Infinity, phi = 0;
    for(const s of sizes){ const n = T / s; mhi[s] = n; if(sizes.length === 1) mlo[s] = n; plo = Math.min(plo, n); phi = Math.max(phi, n); }
    return { ok: true, lo: plo, hi: phi, sizes, mlo, mhi };
  }
  // place the forced pieces first, then count the ways to cover the rest
  let M = 0, A = 0;
  for(const [k, m] of mand){ if(m > cap[k]) return { ok: false }; M += m; A += m * k; }
  const R = T - A;
  if(R < 0) return { ok: false };
  const K = [], left = new Array(hi + 1).fill(0);
  for(let k = lo; k <= Math.min(hi, Math.max(R, lo)); k++){
    if(!allowed[k]) continue;
    left[k] = Math.min(cap[k] - (mand.get(k) || 0), Math.floor(R / k));
    if(left[k] > 0) K.push(k);
  }
  const nLo = Math.max(0, cLo - M), nHi = Math.min(cHi - M, R);
  if(nHi < nLo) return { ok: false };
  const rows = nHi + 1;
  let cost = 0; for(const k of K) cost += left[k] >= Math.floor(R / k) ? 1 : Math.ceil(Math.log2(left[k] + 1));
  if(rows * cost > 1500000) return null;                    // too big to count: keep the old bounds
  const mask = (1n << BigInt(R + 1)) - 1n;
  const dp = skip => {                                     // reach[n]: bit m set = m tiles can be covered by n pieces
    const reach = new Array(rows).fill(0n); reach[0] = 1n;
    for(const k of K){
      if(k === skip) continue;
      const c = left[k], bk = BigInt(k);
      if(c >= Math.floor(R / k)){ for(let n = 1; n < rows; n++) reach[n] |= (reach[n - 1] << bk) & mask; continue; }
      for(let p = 1, rest = c; rest > 0; p *= 2){
        const q = Math.min(p, rest); rest -= q;
        const sh = BigInt(q * k);
        for(let n = rows - 1; n >= q; n--) reach[n] |= (reach[n - q] << sh) & mask;
      }
    }
    return reach;
  };
  const bit = 1n << BigInt(R);
  const full = dp(-1);
  let plo = -1, phi = -1;
  for(let n = nLo; n <= nHi; n++) if(full[n] & bit){ if(plo < 0) plo = n; phi = n; }
  if(plo < 0) return { ok: false };
  const mlo = new Array(hi + 1).fill(0), mhi = new Array(hi + 1).fill(0);
  for(const [k, m] of mand){ mlo[k] = m; mhi[k] = m; }
  let sizes = null;
  if(rows * cost * (K.length + 1) <= 4000000){              // per size: how many pieces of k tiles some count uses
    for(const k of K){
      const others = dp(k), m0 = mand.get(k) || 0;
      let jlo = -1, jhi = -1;
      for(let j = 0; j <= left[k]; j++){
        const b = 1n << BigInt(R - j * k);
        for(let n = Math.max(0, nLo - j); n <= nHi - j; n++) if(others[n] & b){ if(jlo < 0) jlo = j; jhi = j; break; }
      }
      mlo[k] = m0 + Math.max(0, jlo); mhi[k] = m0 + Math.max(0, jhi);
    }
    sizes = [];
    for(let k = lo; k <= hi; k++) if(mhi[k] > 0) sizes.push(k);
  } else {
    for(const k of K){ mhi[k] = (mand.get(k) || 0) + left[k]; }
    for(let k = lo; k <= hi; k++) if(!allowed[k]) mhi[k] = 0;
  }
  return { ok: true, lo: M + plo, hi: M + phi, sizes, mlo, mhi };
}
"""), 'count pass')

    # ---- Match: the sizes whose count is out of range go ----
    src = rep(src, I("""  if(ctx.maxRegions != null) sizes = sizes.filter(s => T / s <= ctx.maxRegions);
  return sizes;
"""), I("""  if(ctx.maxRegions != null) sizes = sizes.filter(s => T / s <= ctx.maxRegions);
  if(ctx.pieceLo != null) sizes = sizes.filter(s => T / s >= ctx.pieceLo && T / s <= ctx.pieceHi);     // v104
  return sizes;
"""), 'match sizes')

    # ---- the exact search: no count = no tiling ----
    src = rep(src, I("""  if(ctx.rangeInfeasible) return;
"""), I("""  if(ctx.rangeInfeasible) return;
  if(ctx.countInfeasible) return;                                                    // v104
"""), 'exact')

    # ---- deduction: static ----
    src = rep(src, I("""    if(heteroStatic){ failWhy = 'hetero-count'; return null; }                          // v90
"""), I("""    if(heteroStatic){ failWhy = 'hetero-count'; return null; }                          // v90
    if(ctx.countInfeasible){ failWhy = 'piece-count'; return null; }                    // v104
"""), 'static')

    # ---- v62 size count with the caps of the count pass ----
    src = rep(src, I("""  if(bothRules && !staticWhy){ const T1 = facts25.T; if(T1 < ctx.sizeLo || T1 > ctx.sizeHi) staticWhy = 'match-mismatch'; }
"""), I("""  if(bothRules && !staticWhy){ const T1 = facts25.T; if(T1 < ctx.sizeLo || T1 > ctx.sizeHi) staticWhy = 'match-mismatch'; }
  let mmWhy = 'mismatch-count';                                                    // v104: the caps of the count pass, for every rule
  if(ctx.pieceMult && opts.pieceCount !== false){
    const mh = ctx.pieceMult.mhi, T0 = activeIds.length;
    let useful = false;
    for(let k = 1; k < mh.length; k++) if(mh[k] < Math.floor(T0 / k) && !(mmQ && mmQ[k] != null && mmQ[k] <= mh[k])) useful = true;
    if(useful){
      if(!mmQ){ mmQ = new Array(mh.length).fill(undefined); mmWhy = 'piece-count'; }
      for(let k = 1; k < mh.length; k++){ const c = mh[k] < Math.floor(T0 / k) ? mh[k] : undefined; if(c !== undefined) mmQ[k] = mmQ[k] == null ? c : Math.min(mmQ[k], c); }
    }
  }
"""), 'mmQ')
    src = rep(src, I("""      if(set.length > mmQ[k]){ why = 'mismatch-count'; return null; }
"""), I("""      if(set.length > mmQ[k]){ why = mmWhy; return null; }
"""), 'mmQ why')
    src = rep(src, I("""        if(d & bit){ const nd = d & ~bit; if(nd === 0n){ why = 'mismatch-count'; return null; } dom.set(r, nd); changed = true; }
"""), I("""        if(d & bit){ const nd = d & ~bit; if(nd === 0n){ why = mmWhy; return null; } dom.set(r, nd); changed = true; }
"""), 'mmQ why 2')

    # ---- deduction: the closed-in areas must add up to the count ----
    src = rep(src, I("""  // ============================================================================================================
  // v27: facts about AREA NUMBERS - and about everything else that fixes the size of a piece."""), I("""  // v104 'piece-region': the areas closed in by walls hold minN .. maxN pieces each; together pieceLo .. pieceHi
  const pcT = activeIds.length;
  const pcOn = opts.pieceCount !== false && ctx.pieceLo != null &&
    (ctx.pieceHi < Math.floor(pcT / Math.max(1, rLo)) || ctx.pieceLo > Math.ceil(pcT / Math.max(1, rHi)));
  function pieceCountStep(need, capOf){
    const regs = openRegions();
    if(regs.length < 2 && ctx.pieceLo <= 1 && ctx.pieceHi > 1) return [];
    const reps = regs.map(() => new Set());
    for(let i = 0; i < regs.length; i++) for(const id of regs[i]) reps[i].add(find(id));
    const mn = [], mx = [];
    let sMin = 0, sMax = 0;
    for(let i = 0; i < regs.length; i++){
      const s = regs[i].length, g = reps[i].size;
      let a = RI ? RI.minN[s] : Math.ceil(s / Math.max(1, rHi)), b = RI ? RI.maxN[s] : Math.floor(s / Math.max(1, rLo));
      if(!(a <= s)) a = Math.ceil(s / Math.max(1, rHi));
      if(!(b >= 0)) b = s;
      b = Math.min(b, g);
      if(a > b){ why = 'piece-region'; markAt(why, regs[i]); return null; }
      mn.push(a); mx.push(b); sMin += a; sMax += b;
    }
    if(sMin > ctx.pieceHi || sMax < ctx.pieceLo){ why = 'piece-region'; return null; }
    const out = []; let merged = false;
    for(let i = 0; i < regs.length; i++){
      const g = reps[i].size; if(g < 2) continue;
      const hiI = Math.min(mx[i], ctx.pieceHi - (sMin - mn[i])), loI = Math.max(mn[i], ctx.pieceLo - (sMax - mx[i]));
      if(hiI < loI){ why = 'piece-region'; markAt(why, regs[i]); return null; }
      const tiles = regs[i];
      if(loI >= g){                                                  // as many pieces as groups: every group is a piece of its own
        for(const id of tiles) for(const { e, o } of adjE[id]) if(e.state === 0 && find(o) !== find(id)){ e.state = 1; out.push({ e, value: 'wall', rule: 'piece-region' }); }
      } else if(hiI === 1){                                          // one piece only: the whole area is linked
        const s = tiles.length;
        if(s > rHi || s < rLo || (RI && !RI.usable.includes(s))){ why = 'piece-region'; markAt(why, tiles); return null; }
        for(const id of tiles) if(find(id) !== find(tiles[0])){ union(tiles[0], id); merged = true; }
        for(const id of tiles) for(const { e, o } of adjE[id]) if(e.state === 0 && find(o) === find(id)){ e.state = 2; out.push({ e, value: 'same', rule: 'piece-region' }); }
      }
    }
    if(merged) out.again = true;
    return out;
  }

  // ============================================================================================================
  // v27: facts about AREA NUMBERS - and about everything else that fixes the size of a piece."""), 'count step')
    src = rep(src, I("""    // v27: area numbers (and stamps): how many pieces do the numbers need in each region closed in by walls?
    if((areaOn || relOn) && !inProbe){
"""), I("""    if(pcOn && !inProbe){                                                        // v104: the areas closed in add up to the number of pieces (not inside probes: it costs more than it finds there)
      const pg = pieceCountStep(need, capOf);
      if(pg === null){ failWhy = why; return null; }
      if(pg.length > 0 || pg.again) return pg;
    }
    // v27: area numbers (and stamps): how many pieces do the numbers need in each region closed in by walls?
    if((areaOn || relOn) && !inProbe){
"""), 'count step call')

    # ---- texts ----
    src = rep(src, I("""const WHY_TEXT = {
"""), I("""const WHY_TEXT = {
  'piece-count': 'no number of pieces fits all the rules and clues',
  'piece-region': 'the areas closed in by walls need more pieces than the puzzle allows, or fewer than it needs',
"""), 'why text')
    src = rep(src, "'colour-count', 'match-iso']);", "'colour-count', 'match-iso', 'piece-count', 'piece-region']);", 'rule tags')
    return src

if __name__ == '__main__':
    ind = ' ' * int(sys.argv[3]) if len(sys.argv) > 3 else ''
    src = open(sys.argv[1], encoding='utf8').read()
    open(sys.argv[2], 'w', encoding='utf8').write(patch(src, ind))
    print('ok', sys.argv[2])
