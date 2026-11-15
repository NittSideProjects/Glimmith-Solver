#!/usr/bin/env python3
"""Core v112 (release V1.0.31): a box per tile ('tBx', refactoring step 6 of 8).

User: compasses cap how far a piece reaches in each direction, Boxy and the size caps cap the piece's width and height. Keeping on
each tile the box its piece must fit in cuts the reach searches early.
  tBx[4*t .. 4*t+3] = x0, x1, y0, y1: the piece holding tile t lies inside these columns / rows (part of the snapshot, like the
  tile sizes of v105). For a group of the reach look-ahead the box is narrowed from:
    * its tiles' boxes (the same piece);
    * the size cap: each column (row) beyond the group's own needs a tile more, so width <= group width + (cap - size);
    * Boxy: the piece is a rectangle of at most `cap` tiles, so width <= cap / group height (and height <= cap / group width);
    * a compass in the group: n tiles to the north means at most n rows to the north (same for the other sides).
  The reach searches (reachCount, reachOk, reachPartsOk) for that group skip the tiles outside the box: they can never be in it.
Sound: every bound holds in every tiling that extends the current position, and a piece is connected, so the paths inside it stay in
its box. Placements are not cut by the box yet (they already list only shapes that fit the group).
Usage: python3 patch_core112.py <in.js> <out.js> [indent]"""
import sys

def rep(src, old, new, what):
    c = src.count(old)
    if c != 1: raise SystemExit(f'{what}: anchor found {c} times')
    return src.replace(old, new)

SKIP = "if(rbRep === rep && (({0} % w) < rbX0 || ({0} % w) > rbX1 || (({0} - {0} % w) / w) < rbY0 || (({0} - {0} % w) / w) > rbY1)) continue;   // v112: outside the piece's box"

def patch(src, ind):
    I = lambda t: ''.join((ind + l if l.strip() else l) for l in t.splitlines(True))
    src = rep(src, "// ================= SOLVER CORE (pure, unit-tested separately; v111 (V1.0.31)",
        "// ================= SOLVER CORE (pure, unit-tested separately; v112 (V1.0.31) = v111 + a box per tile (tBx); v111 (V1.0.31)", 'banner')
    src = rep(src, I("""  const tLo = new Int16Array(N), tHi = new Int16Array(N).fill(32767);
"""), I("""  const tLo = new Int16Array(N), tHi = new Int16Array(N).fill(32767);
  // v112: the box the piece of each tile must fit in (x0, x1, y0, y1); rbRep = the group the reach searches cut with it (rbX0..rbY1)
  const tBx = new Int16Array(4 * N); for(let t = 0; t < N; t++){ tBx[4 * t + 1] = w - 1; tBx[4 * t + 3] = h - 1; }
  let rbRep = -1, rbX0 = 0, rbX1 = 0, rbY0 = 0, rbY1 = 0;
  const boxRule = !!ctx.boxyRule;
  function boxOf(rep, mem, cp){
    let gx0 = w, gx1 = -1, gy0 = h, gy1 = -1, sx0 = 0, sx1 = w - 1, sy0 = 0, sy1 = h - 1;
    for(const id of mem){
      const x = id % w, y = (id - x) / w, b = 4 * id;
      if(x < gx0) gx0 = x; if(x > gx1) gx1 = x; if(y < gy0) gy0 = y; if(y > gy1) gy1 = y;
      if(tBx[b] > sx0) sx0 = tBx[b]; if(tBx[b + 1] < sx1) sx1 = tBx[b + 1]; if(tBx[b + 2] > sy0) sy0 = tBx[b + 2]; if(tBx[b + 3] < sy1) sy1 = tBx[b + 3];
      if(ctx.compasses && ctx.compasses.size > 0){
        const c = ctx.compasses.get(`${x},${y}`);
        if(c){ if(c.n != null && y - c.n > sy0) sy0 = y - c.n; if(c.s != null && y + c.s < sy1) sy1 = y + c.s; if(c.w != null && x - c.w > sx0) sx0 = x - c.w; if(c.e != null && x + c.e < sx1) sx1 = x + c.e; }
      }
    }
    const gw = gx1 - gx0 + 1, gh = gy1 - gy0 + 1, extra = Math.max(0, Math.min(cp, N) - mem.length);
    let W = gw + extra, H = gh + extra;
    if(boxRule && cp < N){ W = Math.min(W, Math.max(gw, Math.floor(cp / gh))); H = Math.min(H, Math.max(gh, Math.floor(cp / gw))); }
    if(gx1 - W + 1 > sx0) sx0 = gx1 - W + 1; if(gx0 + W - 1 < sx1) sx1 = gx0 + W - 1;
    if(gy1 - H + 1 > sy0) sy0 = gy1 - H + 1; if(gy0 + H - 1 < sy1) sy1 = gy0 + H - 1;
    const b = 4 * rep; tBx[b] = sx0; tBx[b + 1] = sx1; tBx[b + 2] = sy0; tBx[b + 3] = sy1;
    rbRep = rep; rbX0 = sx0; rbX1 = sx1; rbY0 = sy0; rbY1 = sy1;
  }
"""), 'store')
    src = rep(src, I("""        if(rpSeen[o] === t1 || e.state === 1 || e === closed) continue;
"""), I("""        if(rpSeen[o] === t1 || e.state === 1 || e === closed) continue;
        """ + SKIP.format('o') + """
"""), 'parts')
    src = rep(src, I("""        if(rcSeen[nid] === tick) continue;
"""), I("""        if(rcSeen[nid] === tick) continue;
        """ + SKIP.format('nid') + """
"""), 'reachOk')
    src = rep(src, I("""        if(rStamp[o] === tick || e.state === 1 || e === closed) continue;
"""), I("""        if(rStamp[o] === tick || e.state === 1 || e === closed) continue;
        """ + SKIP.format('o') + """
"""), 'reachCount')
    src = rep(src, I("""      const reachFails = closed => {
"""), I("""      boxOf(rep, mem, cp);                                 // v112
      const reachFails = closed => {
"""), 'call')
    src = rep(src, "tx: tSet.slice(), tn: tNot.slice() }; }", "tx: tSet.slice(), tn: tNot.slice(), tb: tBx.slice() }; }", 'snapshot')
    src = rep(src, I("""    if(sn.tl){ tLo.set(sn.tl); tHi.set(sn.th); }"""), I("""    if(sn.tb){ tBx.set(sn.tb); } rbRep = -1;                                    // v112
    if(sn.tl){ tLo.set(sn.tl); tHi.set(sn.th); }"""), 'restore')
    return src

if __name__ == '__main__':
    ind = ' ' * int(sys.argv[3]) if len(sys.argv) > 3 else ''
    src = open(sys.argv[1], encoding='utf8').read()
    open(sys.argv[2], 'w', encoding='utf8').write(patch(src, ind))
    print('ok', sys.argv[2])
