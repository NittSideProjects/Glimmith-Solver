#!/usr/bin/env python3
"""Core v106 (release V1.0.26): every tile keeps the exact SET of sizes its piece can have, holes included ('tile size sets').

User: after v105 (a lowest and a highest size per tile), keep the exact set when it is known, and also the sizes a tile is known NOT
to have: Size Separation, Mingle Shape with small shapes, small Delta pieces, the shape bank.

New: tSet, one entry per tile: a 32-bit mask of the sizes the piece holding the tile can still have (bit s = size s for 1..30, bit
31 = "31 tiles or more", -1 = nothing known yet). Holes come from small sizes; bigger ones keep the range of v105. (A first version
used BigInt masks: the bit scans on them made Size Separation searches 2-3 times slower.) As in v105 a group's facts are kept on its representative tile, and the set of a group is the overlap (AND) of the sets of
its tiles. It is part of the snapshot, so probes and searches undo it with the edges.
  * pieceInfo: the sizes a group / a merge can have are the overlap of its tiles' sets, of the bank shape sizes it still fits (they
    were only used as a lowest / highest size before) and of its range; none left = 'size-range' ("Different sizes": a merge of two
    groups with no size in common, even when their ranges overlap, e.g. {1, 5} and {3}). need / cap snap to the lowest / highest size
    of the set, so a hole at an end moves them.
  * writers:
      - the walls that compare sizes (relStep, area-rel): their exact lists of sizes are kept, and they start from the kept ones;
      - Size Separation / Mingle Shape (mingleRound): their lists start from the kept sets, and the sizes still possible afterwards
        are kept (a pinned neighbour across a wall takes its size away: Size Separation always, Mingle Shape when that size has a
        single shape);
      - Delta (new, 'delta-shape'): across a Delta wall, a side pinned to k tiles takes k away from the other side when only one shape
        has k tiles (k = 1 or 2; with Boxy any prime k; with a bank, the bank's shapes and the polyominoes on the board decide);
  * a pass that only narrowed a set is not the end of propagation: the next pass reads it (narrowing only removes sizes, so it ends).

Sound: each step writes a set that holds in every tiling with the edges decided so far, about the piece holding the group's tiles.
opts.tileSizes === false switches tile sizes off (v105 and this).
Usage: python3 patch_core106.py <in.js> <out.js> [indent]"""
import sys

def rep(src, old, new, what):
    c = src.count(old)
    if c != 1: raise SystemExit(f'{what}: anchor found {c} times')
    return src.replace(old, new)

def patch(src, ind):
    I = lambda t: ''.join((ind + l if l.strip() else l) for l in t.splitlines(True))
    src = rep(src, "// ================= SOLVER CORE (pure, unit-tested separately; v105 (V1.0.25)",
        "// ================= SOLVER CORE (pure, unit-tested separately; v106 (V1.0.26) = v105 + tile size sets (the exact sizes a tile's piece can have, holes included); v105 (V1.0.25)", 'banner')
    src = rep(src, I("""  const tLo = new Int16Array(N), tHi = new Int16Array(N).fill(32767);
"""), I("""  const tLo = new Int16Array(N), tHi = new Int16Array(N).fill(32767);
  // v106: the sizes the piece of the tile can still have, as a 32-bit mask: bit s = size s for 1..30, bit 31 = "31 tiles or more"
  // (-1 = all, nothing known). Holes come from small sizes (one shape of 1 or 2 tiles, Size Separation, differences); bigger sizes
  // keep their range only (tLo / tHi). Plain integers: this runs deep in the searches.
  const tSet = new Int32Array(N).fill(-1);
  let tsDirty = false;                                 // v106: a set was narrowed in this pass (the next pass reads it)
  const TS_BIG = 1 << 31;
  const tsBit = z => z >= 31 ? TS_BIG : (1 << z);
  const tsRange = (lo, hi) => { if(hi < lo) return 0; let m = 0; const top = Math.min(hi, 30); for(let z = Math.max(lo, 0); z <= top; z++) m |= 1 << z; if(hi >= 31) m |= TS_BIG; return m; };
  const tsLoBit = m => 31 - Math.clz32(m & -m);       // 31 = only "31 or more" left
  const tsHiBit = m => 31 - Math.clz32(m);            // 31 = "31 or more" still possible
  function setOfIds(ids){ let m = -1; for(let i = 0; i < ids.length; i++) m &= tSet[ids[i]]; return m; }
  function keepOnly(rep, mask){                        // v106: the piece of this group has one of these sizes
    if(!tsOn) return;
    const cur = tSet[rep], nm = cur & mask;
    if(nm !== cur){ tSet[rep] = nm; tsDirty = true; }
  }
  const tsFromBig = d => (Number(d & 0x7fffffffn) | ((d >> 31n) !== 0n ? TS_BIG : 0)) | 0;     // a BigInt size list -> mask
  const tsToBig = m => BigInt(m & 0x7fffffff) | (m & TS_BIG ? ~0x7fffffffn : 0n);              // a mask -> BigInt (all big sizes when bit 31)
"""), 'sets')
    # pieceInfo: bank sizes as a set, the tiles' sets, final snap
    src = rep(src, I("""      need = pick; cap = top;
"""), I("""      need = pick; cap = top;
      if(tsOn){ let bm = 0; for(const s of sizes) if(s >= lo && s <= cap) bm |= tsBit(s); piHole = bm; }       // v106: the sizes it still fits, as a set
"""), 'bank set')
    src = rep(src, I("""  function pieceInfo(ids){
    let cap = Math.min(ctx.sizeHi, ctx.totalActive), need = 1, area = 0, stamp = 0, mask = 0;
"""), I("""  function pieceInfo(ids){
    let cap = Math.min(ctx.sizeHi, ctx.totalActive), need = 1, area = 0, stamp = 0, mask = 0, piHole = null;
"""), 'hole var')
    src = rep(src, I("""    return { need: nd, cap: cp, mask };
"""), I("""    if(tsOn){                                            // v106: the exact sizes: the tiles' sets, the bank sizes, the range
      let sm = setOfIds(ids);
      if(piHole !== null) sm &= piHole;
      if(sm !== -1){
        const m2 = sm & tsRange(nd, cp);
        if(m2 === 0){ why = 'size-range'; return null; }
        const a = tsLoBit(m2), b = tsHiBit(m2);
        if(a < 31) nd = Math.max(nd, a); else nd = Math.max(nd, 31);
        if(b < 31) cp = Math.min(cp, b);
        if(nd > cp){ why = 'size-range'; return null; }
      }
    }
    return { need: nd, cap: cp, mask };
"""), 'final snap')
    # snapshots
    src = rep(src, "tl: tLo.slice(), th: tHi.slice() }; }", "tl: tLo.slice(), th: tHi.slice(), tx: tSet.slice() }; }", 'snapshot')
    src = rep(src, I("""    if(sn.tl){ tLo.set(sn.tl); tHi.set(sn.th); }                                              // v105
"""), I("""    if(sn.tl){ tLo.set(sn.tl); tHi.set(sn.th); }                                              // v105
    if(sn.tx) tSet.set(sn.tx);                                                                // v106
"""), 'restore')
    # propagation goes on after a narrowed set
    src = rep(src, I("""        if(part.length === 0 && !part.again) break;
"""), I("""        if(part.length === 0 && !part.again && !tsDirty) break;
"""), 'dirty loop')
    src = rep(src, I("""  function propagateOnce(){
"""), I("""  function propagateOnce(){
    tsDirty = false;
"""), 'dirty reset')
    # relStep: start from the kept sets, keep the result
    src = rep(src, I("""        if(relUsable !== null) d &= relUsable;
"""), I("""        if(relUsable !== null) d &= relUsable;
        if(tsOn){ const sm = setOfIds(members.get(rep)); if(sm !== -1) d &= tsToBig(sm); }   // v106
"""), 'rel start')
    src = rep(src, I("""      if(lo === hi) derived.set(rep, lo);
    }
"""), I("""      if(lo === hi) derived.set(rep, lo);
      keepOnly(rep, tsFromBig(d));                                             // v106
    }
"""), 'rel keep')
    # mingle: start from the kept sets, keep the result
    src = rep(src, I("""      const d = mingleDomain(mode, mem, need.get(rep), capOf.get(rep));
      if(domEmpty(d, area)){ why = T + '-none'; return null; }
"""), I("""      const d = mingleDomain(mode, mem, need.get(rep), capOf.get(rep));
      if(tsOn){                                                                // v106: the sizes already ruled out for this group
        const sm = setOfIds(mem);
        if(sm !== -1){
          for(const it of d.items) if(it.size <= 30 && !(sm & (1 << it.size))){ if(!d.rm) d.rm = new Set(); d.rm.add(it.k); }
          if(area && d.wlo <= d.whi){ const top = Math.min(d.whi, 30); for(let z = d.wlo; z <= top; z++) if(!(sm & (1 << z))){ if(!d.ex) d.ex = new Set(); d.ex.add(z); } }
        }
      }
      if(domEmpty(d, area)){ why = T + '-none'; return null; }
"""), 'mingle start')
    src = rep(src, I("""    // the surviving values bound the size of every group
    for(const [rep, d] of dom){
      const b = domBounds(d, area);
"""), I("""    // the surviving values bound the size of every group
    if(tsOn) for(const [rep, d] of dom){                                       // v106: and their sizes are kept (only when a value was ruled out:
      if(!(d.rm && d.rm.size) && !(d.ex && d.ex.size)) continue;               //  otherwise the list says no more than the range, and this runs deep in the searches)
      let m = 0;
      for(const it of d.items) if(!(d.rm && d.rm.has(it.k))) m |= tsBit(it.size);
      if(d.wlo <= d.whi){
        let wm = tsRange(Math.max(d.wlo, 0), d.whi);
        if(area && d.ex) for(const z of d.ex) if(z <= 30) wm &= ~(1 << z);
        m |= wm;
      }
      keepOnly(rep, m);
    }
    for(const [rep, d] of dom){
      const b = domBounds(d, area);
"""), 'mingle keep')
    # Delta: a pinned side with a one-shape size takes that size away from the other side
    src = rep(src, I("""    if(gdAll.length > 0 && opts.gdComplete !== false && !gdCompleteStep(need, capOf)){ failWhy = why; return null; }   // v52
"""), I("""    if(gdAll.length > 0 && opts.gdComplete !== false && !gdCompleteStep(need, capOf)){ failWhy = why; return null; }   // v52
    if(tsOn && gdAll.length > 0 && opts.deltaSmall !== false){                          // v106: Delta and the sizes with one shape
      for(const ge of gdAll){
        if(ge.gem) continue;
        const ra = find(ge.a), rb = find(ge.b); if(ra === rb) continue;
        for(const [x, y] of [[ra, rb], [rb, ra]]){
          const k = need.get(x); if(k !== capOf.get(x) || shapesOfSize(k) !== 1) continue;
          if(need.get(y) === k && capOf.get(y) === k){ failWhy = 'delta-shape'; markAt(failWhy, members.get(y)); return null; }
          if(k <= 30) keepOnly(y, ~(1 << k));
        }
      }
    }
"""), 'delta small')
    # how many shapes have k tiles (an over-estimate is fine: only 1 is used)
    src = rep(src, I("""  function setOfIds(ids){"""), I("""  const shapeCountCache = new Map();
  function shapesOfSize(k){                            // v106: how many different shapes a piece of k tiles can have (Infinity = many)
    let n = shapeCountCache.get(k); if(n !== undefined) return n;
    if(ctx.useBank){
      const keys = new Set();
      for(const o of ctx.bankOrientations) if(o.cells.length === k) keys.add(o.canonicalKey);
      for(let i = 0; i < N; i++){ const x = i % w, y = (i - x) / w; if(!ctx.isActive(x, y)) continue; const sk = ctx.requiredShapeAt(x, y); if(sk && sk.split('|').length === k) keys.add(sk); }
      n = keys.size;
    } else {
      n = k < FREE_POLY_COUNT.length ? FREE_POLY_COUNT[k] : Infinity;
      if(ctx.boxyRule) n = rectShapesOf(k, w, h, false);
      else if(ctx.nonBoxyRule && n !== Infinity) n -= rectShapesOf(k, w, h, false);
      if(ctx.banInfo) n = Math.min(n, ctx.banInfo.countAt(k));
    }
    shapeCountCache.set(k, n); return n;
  }
  function setOfIds(ids){"""), 'shape count')
    return src

if __name__ == '__main__':
    ind = ' ' * int(sys.argv[3]) if len(sys.argv) > 3 else ''
    src = open(sys.argv[1], encoding='utf8').read()
    open(sys.argv[2], 'w', encoding='utf8').write(patch(src, ind))
    print('ok', sys.argv[2])
