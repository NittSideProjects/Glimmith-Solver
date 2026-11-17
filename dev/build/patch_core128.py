#!/usr/bin/env python3
"""Core v128 (release V1.0.49): a final search that has found its first solution gets more time before the other searches.

The final stage runs its searches in time slices (default 'e2,s18,o5,e12,o12,e': the edge search 2 s, then the narrow per-edge
searches, then the old search, ...). Many puzzles are solved by the edge search in about 2 s, and on a slower machine (or with a
few more rules per node) it ends just after its first slice: the narrow searches then run 60 tests of 100 ms that all time out, and
the old search its 5 s, before the edge search may finish. A base-game puzzle took 1.8 s on the author's PC and 17 s here with the
very same search (same nodes). Now, when a slice of the edge search ends and the search has already reported a solution (it only
has to finish proving there is no second one), the slice is extended once by up to 4 s (opts.edgeExtendMs, 0 = off). Only the
order of the slices changes: every search still runs to the end, so the answers are the same.
Usage: python3 patch_core128.py <in.js> <out.js> [indent]"""
import sys

def rep(src, old, new, what):
    c = src.count(old)
    if c != 1: raise SystemExit(f'{what}: anchor found {c} times')
    return src.replace(old, new)

def patch(src, ind):
    I = lambda t: ''.join((ind + l if l.strip() else l) for l in t.splitlines(True))
    src = rep(src, "// ================= SOLVER CORE (pure, unit-tested separately; v127 (V1.0.48)",
        "// ================= SOLVER CORE (pure, unit-tested separately; v128 (V1.0.49) = v127 + an edge search with a solution gets its slice extended once; v127 (V1.0.48)", 'banner')
    src = rep(src, I("""        if(ev.type === 'pause'){ paused = true; return 'timeout'; }
"""), I("""        if(ev.type === 'pause'){
          const ext = opts.edgeExtendMs != null ? +opts.edgeExtendMs : 4000;          // v128: a search that has a solution may finish first
          if(ext > 0 && !SS.extended && portSeen.size >= 1 && nowMs() < hard){ SS.extended = true; SS.box.dl = Math.min(hard, nowMs() + ext); continue; }
          paused = true; return 'timeout';
        }
"""), 'extend')
    return src

if __name__ == '__main__':
    src = open(sys.argv[1], encoding='utf8').read()
    ind = sys.argv[3] if len(sys.argv) > 3 else ''
    open(sys.argv[2], 'w', encoding='utf8').write(patch(src, ind)); print('ok', sys.argv[2])
