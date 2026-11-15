#!/usr/bin/env python3
"""Core v113 (release V1.0.31): one checker for the corner patterns ('corner*', refactoring step 7 of 8).

User: palisades, watchtowers, Bricky, Loopy and Wally each check the walls around a tile or a corner; they could share one checker,
with each rule as its list of allowed patterns. What was still copied: Bricky (v36) and Loopy (v37) each had their own table of the
4 corners of every tile and their own three corner checks, the same code with another test on the number of walls at a grid point.
Now one corner table (cnCorner) and three shared checks, each given the rule as "which numbers of walls are forbidden":
    cornerSingleBad(id, bad)  a piece of one tile here would leave a forbidden corner         (pieceInfo: such a tile needs >= 2)
    cornerPlaceOk(P, bad)     a complete piece P leaves no forbidden corner                    (the placements)
    cornerPalOk(t, m, bad)    a palisade side pattern m leaves no forbidden corner              (the palisade / Wally tile step)
  A corner is "forbidden" only when EVERY way to fill its unknown segments is: Bricky = 4 walls (BRI_BAD), Loopy = an odd number
  (LOO_BAD). This gives exactly the answers of the old copies (same decisions, same tags).
Not merged: the palisade and Wally tile step was already one (palTileStep, since v89); the Bricky corner step (every split of the 4
tiles) already took its rule as briBad; the Loopy two-colouring and the watchtowers (lines of sight) are not local patterns.
Usage: python3 patch_core113.py <in.js> <out.js> [indent]"""
import sys

def rep(src, old, new, what):
    c = src.count(old)
    if c != 1: raise SystemExit(f'{what}: anchor found {c} times')
    return src.replace(old, new)

def func(src, name, new, ind):
    """replace the whole function `name` (from '  function name(' to its closing '\\n  }\\n')"""
    head = ind + '  function ' + name + '('
    i = src.find(head)
    if i < 0 or src.count(head) != 1: raise SystemExit(name + ': not found once')
    end = src.find('\n' + ind + '  }\n', i)
    return src[:i] + new + src[end + len('\n' + ind + '  }\n'):]

def patch(src, ind):
    I = lambda t: ''.join((ind + l if l.strip() else l) for l in t.splitlines(True))
    src = rep(src, "// ================= SOLVER CORE (pure, unit-tested separately; v112 (V1.0.31)",
        "// ================= SOLVER CORE (pure, unit-tested separately; v113 (V1.0.31) = v112 + one corner-pattern checker (Bricky / Loopy); v112 (V1.0.31)", 'banner')
    # the two corner tables go; one shared table is built after the Loopy block
    src = rep(src, I("""    for(const id of activeIds){
      const c = id % w, r = (id - c) / w, cs = [];
      for(const [vx, vy, slot, dx, dy] of [[c + 1, r, 2, 1, -1], [c + 1, r + 1, 0, 1, 1], [c, r + 1, 1, -1, 1], [c, r, 3, -1, -1]]){      // NE (the tile is BL there), SE (TL), SW (TR), NW (BR)
        const V = briAtIdx[vy * (w + 1) + vx];
        if(!V){ cs.push(null); continue; }
        const oth = [0, 1, 2, 3].filter(k => BRI_SEG[k][0] !== slot && BRI_SEG[k][1] !== slot);
        cs.push({ V, a: oth[0], b: oth[1], hn: act(c + dx, r) ? cid(c + dx, r) : -1, vn: act(c, r + dy) ? cid(c, r + dy) : -1 });
      }
      briCorner[id] = cs;
    }
"""), "", 'bri corners')
    src = rep(src, I("""    for(const id of activeIds){
      const c = id % w, r = (id - c) / w, cs = [];
      for(const [vx, vy, slot] of [[c + 1, r, 2], [c + 1, r + 1, 0], [c, r + 1, 1], [c, r, 3]]){
        const V = looAt[vy * (w + 1) + vx];
        const oth = [0, 1, 2, 3].filter(k => BRI_SEG[k][0] !== slot && BRI_SEG[k][1] !== slot);
        cs.push({ V, a: oth[0], b: oth[1] });
      }
      looCorner[id] = cs;
    }
  }
"""), I("""  }
  // v113: one corner table for the corner rules (Bricky, Loopy): per tile its 4 corners NE SE SW NW as { V, a, b }
  // (V = the grid point: tid = its 4 tiles TL TR BL BR, -1 = void; se = its 4 segments N E S W; a, b = the 2 segments NOT touching the tile)
  const cnCorner = new Array(N).fill(null);
  if(briOn || looOn){
    const at = new Array((w + 1) * (h + 1)).fill(null);
    for(let vy = 0; vy <= h; vy++) for(let vx = 0; vx <= w; vx++){
      const tc = [[vx - 1, vy - 1], [vx, vy - 1], [vx - 1, vy], [vx, vy]];
      const tid = tc.map(([c, r]) => act(c, r) ? cid(c, r) : -1);
      if(tid.every(t => t < 0)) continue;
      at[vy * (w + 1) + vx] = { tid, se: BRI_SEG.map(([i, j]) => (tid[i] >= 0 && tid[j] >= 0) ? edgeBetween(tc[i][0], tc[i][1], tc[j][0], tc[j][1]) : null) };
    }
    for(const id of activeIds){
      const c = id % w, r = (id - c) / w, cs = [];
      for(const [vx, vy, slot] of [[c + 1, r, 2], [c + 1, r + 1, 0], [c, r + 1, 1], [c, r, 3]]){
        const oth = [0, 1, 2, 3].filter(k => BRI_SEG[k][0] !== slot && BRI_SEG[k][1] !== slot);
        cs.push({ V: at[vy * (w + 1) + vx], a: oth[0], b: oth[1] });
      }
      cnCorner[id] = cs;
    }
  }
  const BRI_BAD = nw => nw === 4, LOO_BAD = nw => (nw & 1) === 1;      // the forbidden numbers of walls at a grid point
  // a segment: 1 = certainly a wall, 0 = certainly a link (also two void tiles side by side), 2 = not known
  function cnSeg(V, k){
    const [i, j] = BRI_SEG[k], a = V.tid[i], b = V.tid[j];
    if(a < 0 && b < 0) return 0;
    if(a < 0 || b < 0) return 1;
    const s = V.se[k].state;
    return s === 1 ? 1 : s === 2 ? 0 : 2;
  }
  // every way to fill `unk` unknown segments next to `walls` certain walls gives a forbidden corner
  const cnAllBad = (bad, walls, unk) => { for(let j = 0; j <= unk; j++) if(!bad(walls + j)) return false; return true; };
  // a piece of one tile has its 2 sides at each of its corners as walls
  function cornerSingleBad(id, bad){
    const cs = cnCorner[id]; if(!cs) return false;
    for(const q of cs){
      const sa = cnSeg(q.V, q.a), sb = cnSeg(q.V, q.b);
      if(cnAllBad(bad, 2 + (sa === 1) + (sb === 1), (sa === 2) + (sb === 2))) return true;
    }
    return false;
  }
  // a complete piece P (marked in markBuf): no corner it touches may be left forbidden
  function cornerPlaceOk(P, bad){
    for(const id of P){
      const cs = cnCorner[id]; if(!cs) continue;
      for(const q of cs){
        const V = q.V; let walls = 0, unk = 0;
        for(let k = 0; k < 4; k++){
          const [i, j] = BRI_SEG[k], a = V.tid[i], b = V.tid[j];
          if(a < 0 && b < 0) continue;
          if(a < 0 || b < 0){ walls++; continue; }
          const ia = markBuf[a] === markGen, ib = markBuf[b] === markGen;
          if(ia && ib) continue;
          if(ia || ib){ walls++; continue; }
          const s = V.se[k].state; if(s === 1) walls++; else if(s === 0) unk++;
        }
        if(cnAllBad(bad, walls, unk)) return false;
      }
    }
    return true;
  }
  // a palisade side pattern m (bit i = side N E S W is a wall): corner i lies between side i and side i + 1
  function cornerPalOk(t, m, bad){
    const cs = cnCorner[t.id]; if(!cs) return true;
    for(let i = 0; i < 4; i++){
      const q = cs[i], sa = cnSeg(q.V, q.a), sb = cnSeg(q.V, q.b);
      if(cnAllBad(bad, ((m >> i) & 1) + ((m >> ((i + 1) & 3)) & 1) + (sa === 1) + (sb === 1), (sa === 2) + (sb === 2))) return false;
    }
    return true;
  }
"""), 'loo corners')
    src = rep(src, I("  const briCorner = new Array(N).fill(null);"), I("  // v113: the corners of each tile are in cnCorner (shared with Loopy)\n  const briCornerUnused = null;"), 'bri decl')
    src = rep(src, I("  const looCorner = new Array(N).fill(null);"), I("  // v113: the corners of each tile are in cnCorner (shared with Bricky)\n  const looCornerUnused = null;"), 'loo decl')
    for name in ('briSingleBad', 'briPlaceOk', 'briPalMask', 'looSingleBad', 'looPlaceOk', 'looPalMask'):
        src = func(src, name, '', ind)
    src = rep(src, "(!briOn || briPalMask(t, m)) && (!looOn || looPalMask(t, m))", "(!briOn || cornerPalOk(t, m, BRI_BAD)) && (!looOn || cornerPalOk(t, m, LOO_BAD))", 'pal call')
    src = rep(src, "if(briOn && ids.length === 1 && briSingleBad(ids[0])){", "if(briOn && ids.length === 1 && cornerSingleBad(ids[0], BRI_BAD)){", 'single bri')
    src = rep(src, "if(looOn && ids.length === 1 && looSingleBad(ids[0])){", "if(looOn && ids.length === 1 && cornerSingleBad(ids[0], LOO_BAD)){", 'single loo')
    n = src.count("if(briOn && !briPlaceOk(P)) return false;")
    if n != 3: raise SystemExit(f'place calls {n}')
    src = src.replace("if(briOn && !briPlaceOk(P)) return false;", "if(briOn && !cornerPlaceOk(P, BRI_BAD)) return false;")
    src = src.replace("if(looOn && !looPlaceOk(P)) return false;", "if(looOn && !cornerPlaceOk(P, LOO_BAD)) return false;")
    for gone in ('briSingleBad(', 'briPlaceOk(', 'briPalMask(', 'looSingleBad(', 'looPlaceOk(', 'looPalMask(', 'briCorner[', 'looCorner['):
        if gone in src: raise SystemExit('still used: ' + gone)
    return src

if __name__ == '__main__':
    ind = ' ' * int(sys.argv[3]) if len(sys.argv) > 3 else ''
    src = open(sys.argv[1], encoding='utf8').read()
    open(sys.argv[2], 'w', encoding='utf8').write(patch(src, ind))
    print('ok', sys.argv[2])
