#!/usr/bin/env python3
"""Core v128 (release V1.0.49): ten steps that the base game never needs are removed.

A rule ablation over the 1,225 campaign puzzles (tools/rule_ablation.js, results/rule_ablation_v127.md) switched each step off in turn.
These ten never decided an edge the other steps would not decide, and a full solve of the whole corpus with all ten off finds every
puzzle unique in the same total time (930 s all on, 944 s all off, within the run-to-run noise):
  areaColourReach  (area-sum (c): a colour class reaches its first numbered group)       v77
  areaPair         (area-pair: two area numbers in one closed area that cannot both fit)  v122
  boxAfterRel      (the rectangles again after the area relations)                       v86a / v95
  boxAllProbe      (boxAllStep inside the probes; it still runs outside them)             v73b
  compassCap       (a compass caps its piece at 1 + n + s + e + w and by half-boards)     v64b / v69a
  reachParts       (the parts of a split group must meet; rpSplit is still computed)     v67c
  splitGrow        (a part of a split group with one way out grows through it)            v66b
  basicFirst       (walls between groups already apart, before the other steps)          v122
  mingleConnect    (mingle-area-connect: cut tiles of the one big piece)                  v52
  sameLinksEarly   (neighbours already in one group are linked at once)                   v99
Removing a step can only leave more to the later steps and the final search (which re-checks every tiling with the full rule checker),
so no answer can become wrong. Kept although they also never decided an edge on their own: crossMark, regionMerge, matchIso, matchIsoK,
matchShape, matchSplit (each one alone made the final search time out or much slower on some puzzles) and the Wally steps.
The texts of area-pair and mingle-area-connect go with them (WHY_TEXT, RULE_FAMILY, RULE_TAGS).
Usage: python3 patch_core128.py <in.js> <out.js> [indent]"""
import sys

def rep(src, old, new, what):
    c = src.count(old)
    if c != 1: raise SystemExit(f'{what}: anchor found {c} times')
    return src.replace(old, new)

def cut(src, start, end, new, what):
    """Replace from `start` (found exactly once) up to and including the first `end` after it."""
    c = src.count(start)
    if c != 1: raise SystemExit(f'{what}: start anchor found {c} times')
    a = src.index(start); b = src.find(end, a + len(start))
    if b < 0: raise SystemExit(f'{what}: end anchor not found')
    return src[:a] + new + src[b + len(end):]

def patch(src, ind):
    I = lambda t: ''.join((ind + l if l.strip() else l) for l in t.splitlines(True))
    src = rep(src, "// ================= SOLVER CORE (pure, unit-tested separately; v127 (V1.0.48)",
        "// ================= SOLVER CORE (pure, unit-tested separately; v128 (V1.0.49) = v127 - ten steps the base game never needs (areaColourReach, areaPair, boxAfterRel, boxAllProbe, compassCap, reachParts, splitGrow, basicFirst, mingleConnect, sameLinksEarly); v127 (V1.0.48)", 'banner')
    # texts of the two tags that no step gives any more
    src = rep(src, I("""  'mingle-area-connect': 'the tiles that share the one big piece can no longer be joined up',
"""), '', 'why mingle-area-connect')
    src = rep(src, I("""  'area-pair': 'two area numbers in one area closed in by walls need more tiles than the area has',
"""), '', 'why area-pair')
    src = rep(src, "'mingle-area-connect', ", '', 'tag mingle-area-connect')
    src = rep(src, ", 'area-pair']);", ']);', 'tag area-pair')
    src = rep(src, "'area-pair': ['region', ", "'@@AP@@': ['region', ", 'family area-pair (find)')
    a = src.index("'@@AP@@': ["); b = src.index('], ', a) + 3
    src = src[:a] + src[b:]
    # areaColourReach
    src = cut(src, I("""          if(vals.length === 2 && opts.areaColourReach !== false){"""),
        I("""                if(!reachA(r, v, e)){ e.state = 2; union(e.a, e.b); out.push({ e, value: 'same', rule: 'area-sum' }); return out; }
              }
            }
          }
"""), '', 'areaColourReach')
    # areaPair
    src = cut(src, I("""  // v122: two groups whose area numbers add up to more than the area closed in by walls round them are one piece (see build/patch_core122.py)
  const areaPairOn"""), I("""        out.again = true;
      }
    }
    return out;
  }
"""), '', 'areaPair step')
    src = rep(src, I("""    if(areaPairOn){ const ap = areaPairStep(dmap); if(ap === null){ failWhy = why; return null; } if(ap.again) return ap; }      // v122
"""), '', 'areaPair call')
    # boxAfterRel
    src = rep(src, I("""    if(relOn && boxOn && !searchLite && opts.boxAfterRel !== false){        // v86a: the rectangles again, with area-rel's sizes (v95: own step, after the relations)
      const p2 = boxPlaceStep(need, capOf, dmap);
      if(p2 === null){ failWhy = why; return null; }
      if(p2.length > 0) return p2;
    }
"""), '', 'boxAfterRel')
    # boxAllProbe
    src = rep(src, "if(boxAll && !searchLite && (!inProbe || opts.boxAllProbe !== false)){", "if(boxAll && !searchLite && !inProbe){", 'boxAllProbe')
    # compassCap
    src = cut(src, I("""      if(opts.compassCap !== false) for(const [x, y] of xy){ const cp = ctx.compasses.get(`${x},${y}`);          // v64b"""),
        I("""          if(cp.w != null){ t = cp.w; for(let c = x; c < C.length; c++) t += C[c]; if(t < cap) cap = t; }
        } }
"""), '', 'compassCap')
    # reachParts: the check goes; whether the group is in several parts (v125, rpSplit) is still found
    src = cut(src, I("""  const rpSeen = new Int32Array(N); let rpTick = 0;
  function reachPartsOk("""), I("""    return met >= mem.length;
  }
"""), I("""  const rpSeen = new Int32Array(N); let rpTick = 0;
  function splitParts(mem){                                                    // v128: is the group in several parts (tiles linked by state-2 edges)?
    const t0 = ++rpTick; const q = [mem[0]]; rpSeen[mem[0]] = t0;
    for(let i = 0; i < q.length; i++) for(const { e, o } of adjE[q[i]]) if(e.state === 2 && rpSeen[o] !== t0){ rpSeen[o] = t0; q.push(o); }
    return q.length !== mem.length;
  }
"""), 'reachPartsOk')
    src = rep(src, I("""    // v67c: the parts of a split group must meet
    if(opts.reachParts !== false && mem.length > 1 && !reachPartsOk(rep, mem, blocked, closed, mask)){ reachWhy = 'grow'; return false; }
"""), I("""    if(mem.length > 1) rpSplit = splitParts(mem);                              // v125
"""), 'reachParts call')
    # splitGrow
    src = cut(src, I("""    // v66b: a group in several parts (joined without touching): every part must reach the rest -> no way out = impossible, one = used
    if(opts.splitGrow !== false) for(const [rep, mem] of members){"""),
        I("""        if(exits[p].length === 1){ const e = exits[p][0]; e.state = 2; union(e.a, e.b); changes.push({ e, value: 'same', rule: 'grow' }); return changes; }
      }
    }
"""), '', 'splitGrow')
    # basicFirst
    src = cut(src, I("""    if(opts.basicFirst !== false){"""), I("""      if(bw.length) return bw;
    }
"""), '', 'basicFirst')
    # sameLinksEarly
    src = cut(src, I("""    if(opts.sameLinksEarly !== false && linkGen !== unionGen){"""), I("""      if(same.length){ linkGen = unionGen; return same; }
    }
"""), '', 'sameLinksEarly')
    # mingleConnect
    src = rep(src, I("""    if(area && opts.mingleConnect !== false && !mingleConnect(dom)) return null;          // v52
"""), '', 'mingleConnect call')
    src = cut(src, I("""  // v52: mingle-area-connect (see patch_core52.py). Pins the cut tiles of the one big piece to its size; false = impossible
  function mingleConnect(dom){"""), I("""        if(domEmpty(d, true)){ why = 'mingle-area-connect'; return false; }
      }
    }
    return true;
  }
"""), '', 'mingleConnect')
    return src

if __name__ == '__main__':
    src = open(sys.argv[1], encoding='utf8').read()
    ind = sys.argv[3] if len(sys.argv) > 3 else ''
    open(sys.argv[2], 'w', encoding='utf8').write(patch(src, ind)); print('ok', sys.argv[2])
