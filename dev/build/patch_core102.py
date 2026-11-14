#!/usr/bin/env python3
"""Core v102 (release V1.0.19): the cases behind a proof by contradiction can be asked for (opts.explain).

User (step by step): a step "checked by trying the other way" says only that the other value "leads to a contradiction". It often
reads as if the solver placed a wall or a link for no reason. The page now has a "Show cases" button on those steps; this is the
solver side of it.

deduceSolve(..., { preAssume, preJoin, preApart, explain }) : the three pre* options (they existed, for tests) rebuild the position
just before the step (edges decided, groups joined, groups known apart). Then explain = { edge: [key, 'wall'|'same'] } (try that
value on that edge), { apart: [x1, y1, x2, y2] } (try the two tiles in different pieces) or { join: [x1, y1, x2, y2] } (in one
piece), with optional maxCases (12), maxDepth (4), ms (1500). The run makes the assumption and lets the rules work, as a probe does:
  * a contradiction: one case, with everything the rules decided on the way (the trace) and the reason (why);
  * no contradiction: the open edge nearest to the assumption is split in two cases (wall / same piece), and so on, down to
    maxDepth splits. Every leaf that ends in a contradiction is a case.
It yields one event { type: 'cases', cases: [{ assume: [[key, value], ...], trace: [[key, value, rule], ...], why, at, open }],
complete, tried, ms } and ends. complete = every leaf is a contradiction, so the cases together prove the step. A leaf that is still
open when the limits are reached has open: true (complete is false: the solver's own proof was a longer search).

at = the tiles where the case broke ([x, y] each), for the checks that know it (a wall inside a piece, two tiles that can not share
a piece, a group that breaks a rule of its own, a group too big, a group that can not grow or reach its size); null otherwise.

For this, propagate() now keeps what it had decided when it hits a contradiction (failTrace) and where (failAt); nothing reads
them in a normal run.
A normal run is unchanged.
Usage: python3 patch_core102.py <in.js> <out.js> [indent]"""
import sys

def rep(src, old, new, what):
    c = src.count(old)
    if c != 1: raise SystemExit(f'{what}: anchor found {c} times')
    return src.replace(old, new)

def patch(src, ind):
    I = lambda t: ''.join((ind + l if l.strip() else l) for l in t.splitlines(True))
    src = rep(src, "// ================= SOLVER CORE (pure, unit-tested separately; v101 (V1.0.18) = v100 + reach cap",
        "// ================= SOLVER CORE (pure, unit-tested separately; v102 (V1.0.19) = v101 + opts.explain (the cases behind a proof by contradiction); v101 (V1.0.18) = v100 + reach cap", 'banner')
    src = rep(src, I("""        const part = propagateOnce();
        if(part === null) return null;
"""), I("""        const part = propagateOnce();
        if(part === null){ failTrace = all; return null; }               // v102: what was decided before the contradiction
"""), 'failTrace set')
    # declared next to why / failWhy: checks that run while the solver is being set up may already note a place
    i = src.index(I("  let why = '', failWhy = '';")); j = src.index("\n", i) + 1
    src = src[:j] + I("""  let failTrace = null, failAt = null, failAtTag = '';  // v102: the decisions of the last propagate() that ended in a contradiction, and the tiles where it broke (when a check noted them)
  function markAt(tag, tiles){ failAt = tiles.length > 60 ? tiles.slice(0, 60) : tiles.slice(); failAtTag = tag; }
""") + src[j:]
    # where it broke, for the checks that know it: markAt(tag, tiles). The place only counts when its tag is the reason given
    # (a check may note a place and the pass may still fail somewhere else).
    src = rep(src, I("""  function propagate(){
    const all = [], pos0 = propPos;
"""), I("""  function propagate(){
    const all = [], pos0 = propPos;
    failAt = null; failAtTag = '';
"""), 'failAt reset')
    for old, new, what in (
        ("      if(ra === rb){ failWhy = 'wall-inside'; return null; }\n", "      if(ra === rb){ failWhy = 'wall-inside'; markAt(failWhy, [e.a, e.b]); return null; }\n", 'wall-inside'),
        ("      if(ra === rb){ failWhy = ft || 'forbidden'; return null; }", "      if(ra === rb){ failWhy = ft || 'forbidden'; markAt(failWhy, [fa, fb]); return null; }", 'forbidden'),
        ("        if(need.get(rep) > capOf.get(rep)){ failWhy = 'size'; return null; }\n", "        if(need.get(rep) > capOf.get(rep)){ failWhy = 'size'; markAt(failWhy, members.get(rep)); return null; }\n", 'size'),
        ("          if(n < need.get(rep)){ failWhy = 'reach'; return null; }\n", "          if(n < need.get(rep)){ failWhy = 'reach'; markAt(failWhy, members.get(rep)); return null; }\n", 'reach cap'),
        ("      if(ex.length === 0){ failWhy = lacks ? roseTag('grow') : (minOnly ? 'min-reach' : 'no-exit'); return null; }", "      if(ex.length === 0){ failWhy = lacks ? roseTag('grow') : (minOnly ? 'min-reach' : 'no-exit'); markAt(failWhy, mem); return null; }", 'no-exit'),
        ("      if(reachFails(null)){ failWhy = reachTag(null); return null; }\n", "      if(reachFails(null)){ failWhy = reachTag(null); markAt(failWhy, mem); return null; }\n", 'reach'),
        ("        if(exits[p].length === 0){ failWhy = 'grow'; return null; }\n", "        if(exits[p].length === 0){ failWhy = 'grow'; markAt(failWhy, mem); return null; }\n", 'grow part'),
        ("      if(term[0] < np){ failWhy = 'grow'; return null; }", "      if(term[0] < np){ failWhy = 'grow'; markAt(failWhy, mem); return null; }", 'grow reach'),
        ("      const nd = pieceInfo(mem);\n      if(nd === null){ failWhy = why; return null; }\n", "      const nd = pieceInfo(mem);\n      if(nd === null){ failWhy = why; markAt(failWhy, mem); return null; }       // v102: this group breaks a rule of its own (roses, polyomino, palisade size, compass, ...)\n", 'pieceInfo'),
        ("      if(n === 0 || cnt.some(c => c !== n)){ why = roseTag('region'); return null; }\n      if(tiles.length < n * lo || tiles.length > n * hi){ why = roseTag('region'); return null; }\n",
         "      if(n === 0 || cnt.some(c => c !== n)){ why = roseTag('region'); markAt(why, tiles); return null; }\n      if(tiles.length < n * lo || tiles.length > n * hi){ why = roseTag('region'); markAt(why, tiles); return null; }\n", 'rose region'),
        ("      const d = mingleDomain('shape', mem, need.get(rep), capOf.get(rep));\n      if(domEmpty(d, false)){ why = 'mismatch-clash'; return null; }\n", "      const d = mingleDomain('shape', mem, need.get(rep), capOf.get(rep));\n      if(domEmpty(d, false)){ why = 'mismatch-clash'; markAt(why, mem); return null; }\n", 'mismatch clash'),
        ("    for(const [rep, d] of dom){\n      if(d === 0n){ why = 'area-rel'; return null; }\n      const lo = bitLo(d), hi = bitHi(d);", "    for(const [rep, d] of dom){\n      if(d === 0n){ why = 'area-rel'; markAt(why, members.get(rep)); return null; }\n      const lo = bitLo(d), hi = bitHi(d);", 'area-rel'),
    ):
        src = rep(src, I(old), I(new), 'at ' + what)
    src = rep(src, I("""  // ---- the scan ----
  let ended = null;"""), I("""  // ---- v102: the cases behind a proof by contradiction (see build/patch_core102.py) ----
  function* explainRun(x){
    const t0 = nowMs(), maxCases = x.maxCases || 12, maxDepth = x.maxDepth != null ? x.maxDepth : 4, msMax = x.ms || 1500;
    const cases = []; let complete = true, tried = 0;
    const tr = list => list.map(ch => [ch.e.key, ch.value === 'wall' ? 'wall' : 'same', tagOut(ch.rule) || 'basic']);
    const setEdge = (e, v) => { e.state = v === 'wall' ? 1 : 2; if(v !== 'wall') union(e.a, e.b); };
    const run = () => { inProbe = true; try { return propagate(); } finally { inProbe = false; } };
    const first = x.edge ? edgeByKey.get(x.edge[0]) : null, pair = x.apart || x.join;
    if(x.edge && (!first || first.state !== 0)){ yield { type: 'cases', cases: [], complete: false, tried: 0, ms: 0, stale: true }; return; }
    // how far every tile is from the assumption: the next edge to split is the open one nearest to it
    const dist = new Int32Array(N).fill(1e9), q = first ? [first.a, first.b] : [cid(pair[0], pair[1]), cid(pair[2], pair[3])];
    for(const t of q) dist[t] = 0;
    for(let i = 0; i < q.length; i++) for(const { o } of adjE[q[i]]) if(dist[o] > dist[q[i]] + 1){ dist[o] = dist[q[i]] + 1; q.push(o); }
    function rec(assumed, path, depth){                  // the assumptions are set; the rules have not run on them yet
      tried++;
      const r = run();
      if(r === null){ cases.push({ assume: assumed, trace: path.concat(tr(failTrace || [])), why: failWhy || '', at: failAt && failAtTag === failWhy ? failAt.map(factXY) : null }); return; }
      const path2 = path.concat(tr(r));
      let best = null, bd = 1e9;
      for(const e of spotOrder){ if(e.state !== 0) continue; const d = Math.min(dist[e.a], dist[e.b]); if(d < bd){ bd = d; best = e; } }
      if(!best || depth >= maxDepth || nowMs() - t0 > msMax){ complete = false; cases.push({ assume: assumed, trace: path2, why: '', open: true }); return; }
      for(const v of ['wall', 'same']){
        if(cases.length >= maxCases){ complete = false; return; }
        const sn = snapFull(); setEdge(best, v); rec(assumed.concat([[best.key, v]]), path2, depth + 1); restoreFull(sn);
      }
    }
    const sn = snapFull();
    if(first) setEdge(first, x.edge[1]);
    else if(x.apart) forbidden.push([cid(pair[0], pair[1]), cid(pair[2], pair[3]), 'explain']);
    else union(find(cid(pair[0], pair[1])), find(cid(pair[2], pair[3])));
    rec(first ? [[first.key, x.edge[1] === 'wall' ? 'wall' : 'same']] : [], [], 0);
    restoreFull(sn);
    yield { type: 'cases', cases, complete: complete && cases.length > 0 && cases.every(c => !c.open), tried, ms: nowMs() - t0 };
  }
  if(opts.explain){ yield* explainRun(opts.explain); return; }
  // ---- the scan ----
  let ended = null;"""), 'explain')
    return src

if __name__ == '__main__':
    ind = ' ' * int(sys.argv[3]) if len(sys.argv) > 3 else ''
    src = open(sys.argv[1], encoding='utf8').read()
    open(sys.argv[2], 'w', encoding='utf8').write(patch(src, ind))
    print('ok', sys.argv[2])
