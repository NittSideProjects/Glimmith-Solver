import re,sys
src=open(sys.argv[1]).read()
s=src.index('  function propagateOnce(){')
# end of propagateOnce: first line '  }' after s
e=src.index('\n  }\n', s)+4
body=src[s:e]
anchors=[
 ("    if(dStamp && !derivePrepare()", "gemini-shape/delta-shape (pinned polyomino)"),
 ("    if(bothRules){", "match-mismatch"),
 ("    if(ruleMatch && !matchPrepare()", "match-size/match-fit (shape list)"),
 ("    const diff = new Set(), dmap", "walls -> kept apart"),
 ("    if(eulerBudget !== null)", "euler-count"),
 ("    if(isoCase){", "match-iso (isoStep)"),
 ("    if(isoK){", "match-iso (isoK)"),
 ("    if(dcPairs.length > 0)", "diff-clash"),
 ("    if(gdPairs.length > 0)", "gd-clash"),
 ("    if(gemIso){", "gemini-iso"),
 ("    { const cl = colourStep", "colour-count"),
 ("    if(lbOn &&", "label"),
 ("    if(rcvOn &&", "rose-cover"),
 ("    if(dsOn &&", "diff-small"),
 ("    if(rcOn){", "rose-cut (static)"),
 ("    if(ruleMatch && opts.matchHole", "match-hole"),
 ("    if(opts.crossCheck !== false", "cross"),
 ("    const changes = [];\n    // every group must", "group sizes (pieceInfo)"),
 ("    if(ruleMatch && !matchRefine", "match-size/match-fit (group ranges)"),
 ("    if(gdAll.length > 0 && opts.gdComplete", "gemini-shape/delta-shape (finished twin)"),
 ("    if(heteroOn && !heteroStep", "hetero-size"),
 ("    let needBase = null;", "minimum sizes"),
 ("    for(const e of spots){\n      if(e.state !== 0) continue;\n      const ra = find(e.a), rb = find(e.b);\n      const dk", "basic edges"),
 ("    if(mhOn && !inProbe", "mismatch-hall"),
 ("      const pl = palisadeStep(dmap);", "palisades / Wally"),
 ("      const br = briVertexStep(dmap);", "Bricky"),
 ("      const lp = loopyStep(dmap);", "Loopy"),
 ("      const cm = compassStep(", "compass limits"),
 ("      const tw = towerStep(", "watchtowers"),
 ("      if(bankAllBlock || bankAllBend)", "bank-block/bank-bend"),
 ("      const bp = bankPlaceStep(", "bank-place"),
 ("      const bx = boxStep(", "Boxy / Non-boxy"),
 ("      const mg = mingleStep(", "Mingle / Size Separation"),
 ("      const rl = relStep(", "size relations (area-rel ...)"),
 ("        const p2 = boxPlaceStep(", "boxy-line/boxy-place (again)"),
 ("    { const sc = sizeCutStep()", "size-cut"),
 ("    if(gpOn && !inProbe", "gemini-place"),
 ("      const rg = rangeStep(", "range-region/bank-region"),
 ("      const ar = areaStep(", "area-count/area-region"),
 ("      const mm = mismatchStep(", "mismatch-*"),
 ("      const mr = matchRegionStep(", "match-region"),
 ("      const st = stampStep(", "stamp-place"),
 ("      const ap = areaPlaceStep(", "area-place"),
 ("      const mp = matchPlaceStep(", "match-place"),
 ("      const rg = regionStep();", "rose-region"),
 ("      const rd = roseCutDynStep(", "rose-cut (again)"),
 ("      const as = areaSumStep(", "area-sum"),
 ("    { const br = bridgeStep();", "bridge-count"),
 ("    if(opts.splitGrow !== false)", "grow (split group)"),
 ("    if(opts.splitCut !== false", "split-cut"),
 ("    // forced growth:", "forced growth (grow/min-grow)"),
 ("    // reachability look-ahead", "reach/min-reach/cmp-budget"),
 ("      const cpl = compassPlaceStep(", "cmp-place"),
 ("      const crd = compassCrowdStep(", "cmp-crowd"),
 ("      const tpr = compassTileProbeStep(", "cmp-excl"),
]
for a,lab in anchors:
    c=body.count(a)
    if c<1: raise SystemExit('missing '+a)
    i=body.index(a)
    ind=len(a)-len(a.lstrip(' '))
    body=body[:i]+' '*ind+f"__mark({lab!r});\n"+body[i:]
body=body.replace('  function propagateOnce(){','  function propagateOnce(){ __mark("static checks"); try { return propagateOnce__raw(); } finally { __mark(null); } }\n  function propagateOnce__raw(){',1)
prelude='''
const __P = globalThis.__PROF = globalThis.__PROF || { t: {}, n: {}, cur: null, t0: 0, probe: { t: {}, n: {} } };
function __mark(name){ const now = performance.now(); if(__P.cur){ const d = now - __P.t0; if(d > 0.0008){ const b = __P.inProbeNow ? __P.probe : __P; b.t[__P.cur] = (b.t[__P.cur] || 0) + d; b.n[__P.cur] = (b.n[__P.cur] || 0) + 1; } } __P.cur = name; __P.t0 = now; }
'''
src=prelude+src[:s]+body+src[e:]
# record whether inside a probe
src=src.replace("  function propagateOnce(){ __mark(\"static checks\");","  function propagateOnce(){ __P.inProbeNow = inProbe; __mark(\"static checks\");")
open(sys.argv[2],'w').write(src)
print('ok')
