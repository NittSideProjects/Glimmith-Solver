#!/usr/bin/env python3
"""Core v108 (release V1.0.28): every tile keeps the SHAPES its piece is known not to be ('tile shapes', refactoring step 1 of 8).

User: after the size sets (v105 - v107), the same for shapes, so that the shape rules share their facts. Without a bank the list
of possible shapes has no end, so what a tile keeps is the other side: tNot, one entry per tile (as before on the group's
representative tile), the canonical keys of the shapes the piece holding the tile can not have (null = none known). A group's
exclusions are the union of its tiles'. Part of the snapshot (probes and searches undo it).
  * readers:
      - pieceInfo: a group holding a polyomino whose shape is excluded is a contradiction; with a bank, the bank shapes that are
        excluded are left out of the shapes the group must still fit (so their sizes go too). A merge that fails this way is a wall,
        tag 'shape-range' ("Shape ruled out").
      - the shape lists of Mingle Shape and Mismatch (mingleDomain) start without the excluded shapes.
  * writers:
      - Mingle Shape and Mismatch: every shape they take away from a group (a pinned neighbour across a wall; a pinned piece
        elsewhere under Mismatch) is kept;
      - Delta (generalises 'delta-shape', which only knew finished pieces of the same size): the shape of a side that is known
        (it holds a polyomino, or it is a finished piece) is excluded on the other side;
      - Mismatch: the sizes of the shapes still possible are kept (as Mingle does since v106), so a size whose shapes are all
        excluded goes from the size set.
Sound: each exclusion holds in every tiling with the edges decided so far, and is about the piece holding the group's tiles.
opts.tileSizes === false switches it off with the size sets.
Usage: python3 patch_core108.py <in.js> <out.js> [indent]"""
import sys

def rep(src, old, new, what):
    c = src.count(old)
    if c != 1: raise SystemExit(f'{what}: anchor found {c} times')
    return src.replace(old, new)

def patch(src, ind):
    I = lambda t: ''.join((ind + l if l.strip() else l) for l in t.splitlines(True))
    src = rep(src, "// ================= SOLVER CORE (pure, unit-tested separately; v107 (V1.0.27)",
        "// ================= SOLVER CORE (pure, unit-tested separately; v108 (V1.0.28) = v107 + tile shapes (the shapes a tile's piece is known not to be); v107 (V1.0.27)", 'banner')
    # bank shapes carry their key
    src = rep(src, I("""    for(const sp of stampList) if(!byKey.has(sp.key) && !(banInfo && banInfo.keyBanned(sp.key))) byKey.set(sp.key, sp.shape);
"""), I("""    for(const sp of stampList) if(!byKey.has(sp.key) && !(banInfo && banInfo.keyBanned(sp.key))) byKey.set(sp.key, sp.shape);
    for(const [k, v] of byKey) v.key = k;                                                     // v108: shapes know their key
"""), 'bank keys')
    # the store
    src = rep(src, I("""  function keepOnly(rep, mask){                        // v106: the piece of this group has one of these sizes
"""), I("""  const tNot = new Array(N).fill(null);                // v108: shape keys the piece of the tile can not have (null = none known)
  function notOfIds(ids){
    let one = null, many = null;
    for(let i = 0; i < ids.length; i++){ const s = tNot[ids[i]]; if(s === null) continue; if(one === null) one = s; else { if(!many) many = new Set(one); for(const k of s) many.add(k); } }
    return many || one;
  }
  function excludeShape(rep, key){                     // v108: the piece of this group is not this shape (copy on write: snapshots share the sets)
    if(!tsOn || key == null) return;
    const cur = tNot[rep]; if(cur && cur.has(key)) return;
    const s = cur ? new Set(cur) : new Set(); s.add(key); tNot[rep] = s; tsDirty = true;
  }
  function keepOnly(rep, mask){                        // v106: the piece of this group has one of these sizes
"""), 'store')
    src = rep(src, "tl: tLo.slice(), th: tHi.slice(), tx: tSet.slice() }; }", "tl: tLo.slice(), th: tHi.slice(), tx: tSet.slice(), tn: tNot.slice() }; }", 'snapshot')
    src = rep(src, I("""    if(sn.tx) tSet.set(sn.tx);                                                                // v106
"""), I("""    if(sn.tx) tSet.set(sn.tx);                                                                // v106
    if(sn.tn){ for(let i = 0; i < N; i++) tNot[i] = sn.tn[i]; }                               // v108
"""), 'restore')
    # pieceInfo
    src = rep(src, I("""    const shapes = stamp ? [stampList[stamp - 1].shape] : loose;
    if(shapes){
      const sizes = (ids.length === 1 && !stamp) ? looseSizes : fitSizes(ids, shapes, stamp ? stampList[stamp - 1].cache : looseCache);
"""), I("""    let shapes = stamp ? [stampList[stamp - 1].shape] : loose, notNow = null;
    if(tsOn){                                                                        // v108: the shapes ruled out for these tiles
      const nk = notOfIds(ids);
      if(nk !== null){
        if(stamp){ if(nk.has(stampList[stamp - 1].key)){ why = 'shape-range'; return null; } }
        else if(shapes){ const keep = shapes.filter(s => !nk.has(s.key)); if(keep.length < shapes.length){ if(!keep.length){ why = 'shape-range'; return null; } shapes = keep; notNow = nk; } }
      }
    }
    if(shapes){
      const sizes = notNow ? fitSizes(ids, shapes, new Map()) : (ids.length === 1 && !stamp) ? looseSizes : fitSizes(ids, shapes, stamp ? stampList[stamp - 1].cache : looseCache);
"""), 'pieceInfo')
    src = rep(src, I("""      if(pick < 0){ why = stamp ? 'shape-fit' : 'bank-fit'; return null; }
"""), I("""      if(pick < 0){ why = notNow ? 'shape-range' : stamp ? 'shape-fit' : 'bank-fit'; return null; }
"""), 'pieceInfo tag')
    # the Mingle Shape / Mismatch lists start without the excluded shapes
    src = rep(src, I("""  function mingleDomain(mode, mem, lo, hi){
    const area = mode === 'area';
"""), I("""  function mingleDomain(mode, mem, lo, hi){
    const d = mingleDomain0(mode, mem, lo, hi);
    if(tsOn && mode !== 'area'){                                                    // v108: without the shapes ruled out for these tiles
      const nk = notOfIds(mem);
      if(nk !== null) for(const it of d.items) if(nk.has(it.k)){ if(!d.rm) d.rm = new Set(); d.rm.add(it.k); }
    }
    return d;
  }
  function mingleDomain0(mode, mem, lo, hi){
    const area = mode === 'area';
"""), 'mingle domain')
    # Mingle writes what it removed
    src = rep(src, I("""    if(tsOn) for(const [rep, d] of dom){                                       // v106: and their sizes are kept (only when a value was ruled out:
"""), I("""    if(tsOn && !area) for(const [rep, d] of dom) if(d.rm) for(const k of d.rm) excludeShape(rep, k);      // v108: the shapes it took away
    if(tsOn) for(const [rep, d] of dom){                                       // v106: and their sizes are kept (only when a value was ruled out:
"""), 'mingle keep shapes')
    # Mismatch writes what it removed, and the sizes left
    src = rep(src, I("""    for(const [rep, d] of dom){                                   // the surviving shapes bound the size (same write-back as Mingle)
"""), I("""    if(tsOn) for(const [rep, d] of dom){                          // v108: the shapes taken away, and the sizes of those left
      if(!(d.rm && d.rm.size)) continue;
      for(const k of d.rm) excludeShape(rep, k);
      let m = 0;
      for(const it of d.items) if(!d.rm.has(it.k)) m |= tsBit(it.size);
      if(d.wlo <= d.whi) m |= tsRange(Math.max(d.wlo, 0), d.whi);
      keepOnly(rep, m);
    }
    for(const [rep, d] of dom){                                   // the surviving shapes bound the size (same write-back as Mingle)
"""), 'mismatch keep')
    # Delta: a known shape is excluded across
    src = rep(src, I("""          if(k <= TS_CAP) keepOnly(y, ~(1 << k));
        }
      }
    }
"""), I("""          if(k <= TS_CAP) keepOnly(y, ~(1 << k));
        }
      }
      for(const ge of gdAll){                                                        // v108: the known shape of one side is ruled out on the other
        if(ge.gem) continue;
        const ra = find(ge.a), rb = find(ge.b); if(ra === rb) continue;
        for(const [x, y] of [[ra, rb], [rb, ra]]){
          const mx = members.get(x); let kx = null;
          for(const id of mx) if(stampAt[id]){ kx = stampList[stampAt[id] - 1].key; break; }
          if(kx === null && mx.length >= need.get(x) && groupComplete(x, mx)) kx = canonicalShapeKey(mx.map(id => [id % w, (id - id % w) / w]));
          if(kx !== null) excludeShape(y, kx);
        }
      }
    }
"""), 'delta shapes')
    # texts
    src = rep(src, I("""const WHY_TEXT = {
"""), I("""const WHY_TEXT = {
  'shape-range': 'the shapes ruled out for a piece leave it no shape',
"""), 'why text')
    src = rep(src, "'piece-count', 'piece-region', 'size-range']);", "'piece-count', 'piece-region', 'size-range', 'shape-range']);", 'rule tags')
    return src

if __name__ == '__main__':
    ind = ' ' * int(sys.argv[3]) if len(sys.argv) > 3 else ''
    src = open(sys.argv[1], encoding='utf8').read()
    open(sys.argv[2], 'w', encoding='utf8').write(patch(src, ind))
    print('ok', sys.argv[2])
