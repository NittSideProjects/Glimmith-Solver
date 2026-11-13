#!/usr/bin/env python3
"""Core v96 (release V1.0.3): wally-ends.

User: "In Solitude + dead end Palisades / Rose Windows that are dead ends, every region must end/start there. If there are 2 Rose
Windows and both are dead ends every region must start and end in a rose window." General form used here: with Wally every piece is a
path (2 ends), a ring (no end) or a single tile; an END is a tile with at most 1 neighbour in its piece (3 or more walls round it, or a
palisade 3 / 4 on it).
  * a piece has at most 2 ends: a group holding 3 known ends is impossible;
  * a group holding 2 known ends is a path from one to the other: its other tiles go through (a tile with exactly 2 possible sides links
    both), no group holding an end can join it, and if its tiles are joined by links (not only by facts about tiles far apart) it is the
    whole piece: every open edge round it is a wall;
  * counting (the roses / Solitude case): the sum over tiles of (2 - links) is 2 x (paths) + 2 x (single tiles) <= 2 x (most pieces).
    When the known ends fill that budget (every piece's two ends are known, e.g. two rose types with every rose a dead end), no other
    tile can be an end: a tile with exactly 2 possible sides links both.
Tag 'wally-ends'. Step in block 3 right after Loopy (fast: one pass over the tiles; reads only the edges). opts.wallyEnds false = off.
Usage: python3 patch_core96.py <in.js> <out.js> [indent]
"""
import sys

def patch(src, ind):
    I = lambda t: '\n'.join((ind + l) if l else l for l in t.split('\n'))
    def rep(old, new, mid=False):
        nonlocal src
        o = old if mid else I(old); n = new if mid else I(new)
        c = src.count(o)
        if c != 1: raise SystemExit(f'anchor found {c} times: {old[:200]}')
        src = src.replace(o, n)
    rep("// ================= SOLVER CORE (pure, unit-tested separately; v95 (V1.0.2)",
        "// ================= SOLVER CORE (pure, unit-tested separately; v96 (V1.0.3) = v95 + wally-ends; v95 (V1.0.2)")
    rep("  'wally-line': 'the two pieces",
        "  'wally-ends': 'a piece is a path with two ends (Wally): it can not get a third end, or the ends already known use up every end the pieces can have',\n  'wally-line': 'the two pieces")
    rep("'wally-two', 'wally-line',", "'wally-two', 'wally-ends', 'wally-line',", mid=True)
    # the step, called right after Loopy
    rep("""    // v37: loopy
    if(looOn){
      const lp = loopyStep(dmap);
      if(lp === null){ failWhy = why; return null; }
      if(lp.length > 0) return lp;
    }
""", """    // v37: loopy
    if(looOn){
      const lp = loopyStep(dmap);
      if(lp === null){ failWhy = why; return null; }
      if(lp.length > 0) return lp;
    }
    // v96: wally-ends (a Wally piece is a path with two ends, a ring or a single tile)
    if(weOn){ const we = wallyEndsStep(); if(we === null){ failWhy = why; return null; } if(we.length > 0) return we; }
""")
    rep("  function palisadeStep(dmap){\n", """  // ---- v96 (V1.0.3): wally-ends (see build/patch_core96.py) ----
  const weOn = !!ctx.wallyRule && opts.wallyEnds !== false;
  const weCap = new Int8Array(N).fill(2);                 // most links a tile can have from its own clue: palisade 3 -> 1, palisade 4 -> 0
  if(weOn && ctx.palisades) for(const [k, t] of ctx.palisades){ const [x, y] = k.split(',').map(Number); if(ctx.isActive(x, y)){ if(t === '3') weCap[cid(x, y)] = 1; else if(t === '4') weCap[cid(x, y)] = 0; } }
  const weL = new Int8Array(N), weO = new Int8Array(N);
  function wallyEndsStep(){                              // null = impossible, else [{ e, value, rule }]
    for(const id of activeIds){ let l = 0, o = 0; for(const { e } of adjE[id]){ if(e.state === 2) l++; else if(e.state === 0) o++; } weL[id] = l; weO[id] = o; }
    const cap = id => Math.min(2, weCap[id], weL[id] + weO[id]);  // most links the tile can still get
    const out = [], link = [];
    const ends = new Map();
    for(const id of activeIds) if(cap(id) <= 1){ const r = find(id); ends.set(r, (ends.get(r) || 0) + 1); }
    for(const [r, n] of ends){
      if(n > 2){ why = 'wally-ends'; return null; }     // three ends in one piece
      const mem = members.get(r);
      if(n < 2 || mem.length < 2) continue;
      // a path from one known end to the other: every other tile of the piece goes through
      for(const id of mem){
        if(cap(id) <= 1 || weO[id] === 0 || weL[id] + weO[id] !== 2) continue;
        for(const { e } of adjE[id]) if(e.state === 0){ e.state = 2; link.push(e); out.push({ e, value: 'same', rule: 'wally-ends' }); }
      }
      if(out.length) break;
      // a group with an end of its own can not join it (a third end)
      for(const id of mem) for(const { e, o } of adjE[id]){ if(e.state !== 0) continue; const ro = find(o); if(ro !== r && (ends.get(ro) || 0) > 0){ e.state = 1; out.push({ e, value: 'wall', rule: 'wally-ends' }); } }
      if(out.length) break;
      // joined by links from end to end: that path is the whole piece
      markGen++; for(const id of mem) markBuf[id] = markGen;
      const seen = [mem[0]]; let k = 0; const got = new Set(seen);
      while(k < seen.length){ const x = seen[k++]; for(const { e, o } of adjE[x]) if(e.state === 2 && markBuf[o] === markGen && !got.has(o)){ got.add(o); seen.push(o); } }
      if(seen.length === mem.length){
        for(const id of mem) for(const { e, o } of adjE[id]) if(e.state === 0 && markBuf[o] !== markGen){ e.state = 1; out.push({ e, value: 'wall', rule: 'wally-ends' }); }
        if(out.length) break;
      }
    }
    for(const e of link) union(e.a, e.b);
    if(out.length) return out;
    // the budget: sum of (2 - links) = 2 x (paths of 2+ tiles) + 2 x (single tiles) <= 2 x (most pieces)
    if(ctx.pieceCapMax != null){
      let sum = 0; for(const id of activeIds) sum += 2 - cap(id);
      const slack = 2 * ctx.pieceCapMax - sum;
      if(slack < 0){ why = 'wally-ends'; return null; }
      if(slack === 0){                                    // no tile can fall short of what it can still get: a tile with exactly that many sides takes them all
        for(const id of activeIds){
          if(weO[id] === 0 || cap(id) !== weL[id] + weO[id]) continue;
          for(const { e } of adjE[id]) if(e.state === 0){ e.state = 2; link.push(e); out.push({ e, value: 'same', rule: 'wally-ends' }); }
        }
        for(const e of link) union(e.a, e.b);
      }
    }
    return out;
  }
  function palisadeStep(dmap){
""")
    return src

if __name__ == '__main__':
    ind = ' ' * int(sys.argv[3]) if len(sys.argv) > 3 else ''
    src = open(sys.argv[1], encoding='utf8').read()
    open(sys.argv[2], 'w', encoding='utf8').write(patch(src, ind))
    print('ok', sys.argv[2])
