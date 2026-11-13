#!/usr/bin/env python3
"""Core v98 (release V1.0.6): label-join.

The label step (every piece holds exactly one anchor: one Solitude symbol, one rose of the first type, or one of the area numbers
that fill the board) works out, for every tile, which anchors' pieces it can still belong to. A tile left with only one anchor is in
that anchor's piece, but up to v97 the step only used it for two neighbouring tiles with the same single anchor (a link). When the
tile and the anchor do not touch, the knowledge was dropped: "this rose of the second type can only go with that rose of the first
type" never reached the groups, and the page could not show it.

v98 joins every tile whose only possible anchor is l to the group of anchor l (union, nothing else), and the step returns .again so
propagation runs once more with the bigger group. A join is a sound deduction (the tile can not be in any other piece), so no
verdict can change; the other rules just see larger groups sooner.

The join is reported to the page like every other join of tiles that do not touch (factLog, v93), with the tag 'label-join'
instead of the generic 'far-join': union() takes the tag from factTag while it is set.
opts.labelJoin false = off (the v97 behaviour).
Usage: python3 patch_core98.py <in.js> <out.js> [indent]
"""
import sys

def patch(src, ind):
    # the anchors below are written as they stand in the page (two spaces deeper than the reference core)
    D = lambda t: '\n'.join(l[2:] if l.startswith('  ') else l for l in t.split('\n'))
    I = lambda t: '\n'.join((ind + l) if l else l for l in D(t).split('\n'))
    def rep(old, new, mid=False):
        nonlocal src
        o = old if mid else I(old); n = new if mid else I(new)
        c = src.count(o)
        if c != 1: raise SystemExit(f'anchor found {c} times: {old[:200]}')
        src = src.replace(o, n)
    rep("// ================= SOLVER CORE (pure, unit-tested separately; v97 (V1.0.5)",
        "// ================= SOLVER CORE (pure, unit-tested separately; v98 (V1.0.6) = v97 + label-join; v97 (V1.0.5)")
    # the tag a far join is reported with
    rep("""    let factRec = false; const factLog = [];               // v93: facts about tiles that do not touch (see patch_core93.py)""",
        """    let factRec = false; const factLog = [];               // v93: facts about tiles that do not touch (see patch_core93.py)
    let factTag = '';                                      // v98: the rule a far join is reported with ('' = 'far-join')""")
    rep("""      if(factRec && Math.abs(a % w - b % w) + Math.abs(((a - a % w) - (b - b % w)) / w) !== 1) factLog.push([a, b, 'far-join']);       // v93""",
        """      if(factRec && Math.abs(a % w - b % w) + Math.abs(((a - a % w) - (b - b % w)) / w) !== 1) factLog.push([a, b, factTag || 'far-join']);       // v93, v98 tag""")
    # the label step joins a tile to the anchor it must go with
    rep("""        const la = only(e.a); if(la >= 0 && la === only(e.b)){ e.state = 2; union(e.a, e.b); out.push({ e, value: 'same', rule: 'label' }); }
      }
      return out;
    }""",
        """        const la = only(e.a); if(la >= 0 && la === only(e.b)){ e.state = 2; union(e.a, e.b); out.push({ e, value: 'same', rule: 'label' }); }
      }
      // v98: a tile whose only possible anchor is l is in the piece of anchor l, touching or not
      if(opts.labelJoin !== false){
        factTag = 'label-join';
        try {
          for(let l = 0; l < LB; l++){
            const a = lbAnchors[l];
            for(const id of activeIds) if(only(id) === l && find(id) !== find(a)){ union(a, id); out.again = true; }
          }
        } finally { factTag = ''; }
      }
      return out;
    }""")
    rep("""const lb = labelStep(dmap); if(lb === null){ failWhy = why; return null; } if(lb.length > 0) return lb; }""",
        """const lb = labelStep(dmap); if(lb === null){ failWhy = why; return null; } if(lb.length > 0 || lb.again) return lb; }""", mid=True)
    return src

if __name__ == '__main__':
    ind = ' ' * int(sys.argv[3]) if len(sys.argv) > 3 else ''
    src = open(sys.argv[1], encoding='utf8').read()
    open(sys.argv[2], 'w', encoding='utf8').write(patch(src, ind))
    print('ok', sys.argv[2])
