#!/usr/bin/env python3
"""Core v127 (release V1.0.48): the compass tile probes share one time budget per solve.

cmp-excl (the tile probes: join a tile to a compass group, propagate, a contradiction = the tile is not in that piece) may run up to
400 ms per propagation pass on boards of up to 36 tiles. With the rules added since, each trial propagates further, so the probes
no longer finish in one pass: on a base-game compass puzzle they ran their 400 ms on 5 passes (2 s) and found nothing, where core
v97 finished them in one pass (0.4 s). They now get 400 ms in all per solve (opts.tileProbeTotalMs; the per-pass cap is unchanged).
The facts they find are kept as before; only the time they may take is bounded, so nothing can go wrong, at worst a fact is not
found (the other rules and the final search still decide the puzzle).
Usage: python3 patch_core127.py <in.js> <out.js> [indent]"""
import sys

def rep(src, old, new, what):
    c = src.count(old)
    if c != 1: raise SystemExit(f'{what}: anchor found {c} times')
    return src.replace(old, new)

def patch(src, ind):
    I = lambda t: ''.join((ind + l if l.strip() else l) for l in t.splitlines(True))
    src = rep(src, "// ================= SOLVER CORE (pure, unit-tested separately; v126 (V1.0.47)",
        "// ================= SOLVER CORE (pure, unit-tested separately; v127 (V1.0.48) = v126 + the compass tile probes share one time budget per solve; v126 (V1.0.47)", 'banner')
    src = rep(src, I("""  const cmpProbeCursor = { i: 0 };
  function compassTileProbeStep(need, capOf, maskOf, dmap){
    const out = [];
    if(inProbe) return out;
    const t0 = Date.now(), limitMs = globalThis.__CMP_TILEPROBE_MS != null ? globalThis.__CMP_TILEPROBE_MS : (activeIds.length <= 36 ? 400 : 0);
    if(limitMs <= 0) return out;
"""), I("""  const cmpProbeCursor = { i: 0 };
  let tpLeft = opts.tileProbeTotalMs != null ? +opts.tileProbeTotalMs : 400;          // v127: the time the tile probes may still take in this solve
  function compassTileProbeStep(need, capOf, maskOf, dmap){
    const out = [];
    if(inProbe) return out;
    const t00 = Date.now();
    try {
    const t0 = t00, limitMs = Math.min(tpLeft, globalThis.__CMP_TILEPROBE_MS != null ? globalThis.__CMP_TILEPROBE_MS : (activeIds.length <= 36 ? 400 : 0));
    if(limitMs <= 0) return out;
"""), 'budget start')
    src = rep(src, I("""    for(const [a, b] of newFacts) forbidden.push([a, b, 'cmp-excl']);
    if(found > 0){ out.again = true; }
    else if(complete) cmpProbeCursor.doneSig = sig;
    return out;
  }
"""), I("""    for(const [a, b] of newFacts) forbidden.push([a, b, 'cmp-excl']);
    if(found > 0){ out.again = true; }
    else if(complete) cmpProbeCursor.doneSig = sig;
    return out;
    } finally { tpLeft -= Date.now() - t00; }                                     // v127
  }
"""), 'budget end')
    return src

if __name__ == '__main__':
    src = open(sys.argv[1], encoding='utf8').read()
    ind = sys.argv[3] if len(sys.argv) > 3 else ''
    open(sys.argv[2], 'w', encoding='utf8').write(patch(src, ind)); print('ok', sys.argv[2])
