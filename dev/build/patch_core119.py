#!/usr/bin/env python3
"""Core v119 (release V1.0.35): Wally, the dead-end budget per wall.

Author: with Wally, a puzzle whose number of pieces is known (or capped: the maximum number of pieces, Heterogeneous, roses ...)
can never have more than 2 x that many dead ends (a path of 2+ tiles has 2 ends, a piece of one tile counts as 2). So once that
many dead ends are known, no wall can be placed where it would make a new dead end: that edge is a link.
The budget (v96, wallyEndsStep) already counted sum(2 - most links a tile can still get) <= 2 x (most pieces), but only used it when
it was spent exactly, and only on tiles that needed all their sides. When the budget is spent, every tile must get exactly
as many links as it can still get (cap: 1 at a dead end, 2 elsewhere): sum(2 - links) <= 2 x pieces = sum(2 - cap), and links <= cap.
v96 only linked a tile whose open sides were all needed. Now each open edge is tried both ways on these link counts alone (a tile
with all its links walls the rest, a tile that needs all its open sides links them, and so on along the chain): a wall that ends
with a tile short of links (a new dead end the budget can not pay for) means a link, and a link that ends with a tile over its
count means a wall ('wally-ends'). Sound: in every tiling each tile has exactly cap links, so a choice that breaks that is wrong.
Usage: python3 patch_core119.py <in.js> <out.js> [indent]"""
import sys

def rep(src, old, new, what):
    c = src.count(old)
    if c != 1: raise SystemExit(f'{what}: anchor found {c} times')
    return src.replace(old, new)

def patch(src, ind):
    I = lambda t: ''.join((ind + l if l.strip() else l) for l in t.splitlines(True))
    src = rep(src, "// ================= SOLVER CORE (pure, unit-tested separately; v118 (V1.0.34)",
        "// ================= SOLVER CORE (pure, unit-tested separately; v119 (V1.0.35) = v118 + Wally: the dead-end budget per wall; v118 (V1.0.34)", 'banner')
    src = rep(src, I("""      if(slack < 0){ why = 'wally-ends'; return null; }
"""), I("""      if(slack < 0){ why = 'wally-ends'; return null; }
      if(slack === 0 && opts.wallyBudgetChain !== false){    // v119: every tile gets exactly cap(t) links: try each open edge both ways on the link counts alone
        const tgt = new Int8Array(N); for(const id of activeIds) tgt[id] = cap(id);
        const ws = new Map(), dL = new Map(), dO = new Map(), q = [];
        const Lx = t => weL[t] + (dL.get(t) || 0), Ox = t => weO[t] + (dO.get(t) || 0);
        const setE = (e, v) => { ws.set(e, v); for(const t of [e.a, e.b]){ dO.set(t, (dO.get(t) || 0) - 1); if(v === 2) dL.set(t, (dL.get(t) || 0) + 1); q.push(t); } };
        const fails = (e0, v0) => {                         // true: deciding e0 = v0 leaves some tile with too few or too many links
          ws.clear(); dL.clear(); dO.clear(); q.length = 0; setE(e0, v0);
          for(let k = 0; k < q.length; k++){
            if(k > 400) return false;                        // keep it local
            const t = q[k], l = Lx(t), o = Ox(t);
            if(l > tgt[t] || l + o < tgt[t]) return true;
            if(o === 0 || (l !== tgt[t] && l + o !== tgt[t])) continue;
            const v = l === tgt[t] ? 1 : 2;
            for(const { e } of adjE[t]) if(e.state === 0 && !ws.has(e)) setE(e, v);
          }
          return false;
        };
        for(const e of spots){
          if(e.state !== 0) continue;
          if(fails(e, 1)){ e.state = 2; link.push(e); out.push({ e, value: 'same', rule: 'wally-ends' }); break; }
          if(fails(e, 2)){ e.state = 1; out.push({ e, value: 'wall', rule: 'wally-ends' }); break; }
        }
        if(out.length){ for(const e of link) union(e.a, e.b); return out; }
      }
"""), 'budget')
    return src

if __name__ == '__main__':
    ind = ' ' * int(sys.argv[3]) if len(sys.argv) > 3 else ''
    src = open(sys.argv[1], encoding='utf8').read()
    open(sys.argv[2], 'w', encoding='utf8').write(patch(src, ind))
    print('ok', sys.argv[2])
