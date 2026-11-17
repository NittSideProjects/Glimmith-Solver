#!/usr/bin/env python3
"""Core v128 (release V1.0.49): seven steps that the base game never needs are removed.

A rule ablation over the 1,225 campaign puzzles (tools/rule_ablation.js, results/rule_ablation_v127.md) switched each step off in turn.
These seven never decided an edge the other steps would not decide, and a full solve of the whole corpus with all seven off finds every
puzzle unique in the same total time (930 s all on, 944 s all off, within the run-to-run noise):
  areaColourReach  (area-sum (c): a colour class reaches its first numbered group)       v77
  boxAfterRel      (the rectangles again after the area relations)                       v86a / v95
  boxAllProbe      (boxAllStep inside the probes; it still runs outside them)             v73b
  compassCap       (a compass caps its piece at 1 + n + s + e + w and by half-boards)     v64b / v69a
  reachParts       (the parts of a split group must meet; rpSplit is still computed)     v67c
  splitGrow        (a part of a split group with one way out grows through it)            v66b
  mingleConnect    (mingle-area-connect: cut tiles of the one big piece)                  v52
basicFirst, areaPair and sameLinksEarly also never decide an edge the others miss, but they stay: they are there for the step-by-step
(the author's rule order, v122; neighbours shown in one colour are linked at once, v99).
Removing a step can only leave more to the later steps and the final search (which re-checks every tiling with the full rule checker),
so no answer can become wrong. Kept although they also never decided an edge on their own: crossMark, regionMerge, matchIso, matchIsoK,
matchShape, matchSplit (each one alone made the final search time out or much slower on some puzzles) and the Wally steps.
The text of mingle-area-connect goes with it (WHY_TEXT, RULE_TAGS).
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
        "// ================= SOLVER CORE (pure, unit-tested separately; v128 (V1.0.49) = v127 - seven steps the base game never needs (areaColourReach, boxAfterRel, boxAllProbe, compassCap, reachParts, splitGrow, mingleConnect); v127 (V1.0.48)", 'banner')
    # the text of the tag that no step gives any more
    src = rep(src, I("""  'mingle-area-connect': 'the tiles that share the one big piece can no longer be joined up',
"""), '', 'why mingle-area-connect')
    src = rep(src, "'mingle-area-connect', ", '', 'tag mingle-area-connect')
    # areaColourReach
    src = cut(src, I("""          if(vals.length === 2 && opts.areaColourReach !== false){"""),
        I("""                if(!reachA(r, v, e)){ e.state = 2; union(e.a, e.b); out.push({ e, value: 'same', rule: 'area-sum' }); return out; }
              }
            }
          }
"""), '', 'areaColourReach')
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
