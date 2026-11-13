#!/usr/bin/env python3
"""Core v99 (release V1.0.9): same-piece neighbours are linked at once, and joins are reported where they happen.

User (step by step): once two neighbouring tiles are known to be in one piece (their groups were joined, for example by a far join
such as split-cut), the edge between them is a link. Up to v98 that link only came from the 'basic' check near the end of a
propagation pass, after every step that returns early (colour count, iso, label, ...) had nothing left to say. On a 9x8 Compass +
Mismatch puzzle the links after a split-cut join came 20 to 40 decisions later, so the step view drew them on unrelated steps.

v99:
* sameLinks: at the start of every pass, when a join happened since the last look (unionGen), every open edge whose two tiles are
  already one group is decided 'same' and the pass ends there. This is what the basic check did later, only sooner: no new
  deduction, no verdict can change.
* Facts in order: a far join is logged with the number of decisions the current propagate() had collected when it happened
  (propPos), and the three places that report a propagation (an applied edge, the start, an applied fact) yield each fact just
  before the first decision that came after it, instead of every fact before every decision. So the links that follow a join come
  right after it and the page puts them in the join's own step.
opts.sameLinksEarly false = off.
Usage: python3 patch_core99.py <in.js> <out.js> [indent]
"""
import sys

def patch(src, ind):
    # the anchors below are written as they stand in the page (two spaces deeper than the reference core)
    D = lambda t: '\n'.join(l[2:] if l.startswith('  ') else l for l in t.split('\n'))
    I = lambda t: '\n'.join((ind + l) if l else l for l in D(t).split('\n'))
    def rep(old, new, mid=False, count=1):
        nonlocal src
        o = old if mid else I(old); n = new if mid else I(new)
        c = src.count(o)
        if c != count: raise SystemExit(f'anchor found {c} times (want {count}): {old[:200]}')
        src = src.replace(o, n)
    rep("// ================= SOLVER CORE (pure, unit-tested separately; v98 (V1.0.6)",
        "// ================= SOLVER CORE (pure, unit-tested separately; v99 (V1.0.9) = v98 + same-piece links at once, facts in order; v98 (V1.0.6)")
    # union: a counter, and the position of a far join among the decisions
    rep("""    let factTag = '';                                      // v98: the rule a far join is reported with ('' = 'far-join')""",
        """    let factTag = '';                                      // v98: the rule a far join is reported with ('' = 'far-join')
    let unionGen = 0, linkGen = -1, propPos = 0;           // v99: joins so far / at the last same-link look; decisions collected by the current propagate()""")
    rep("""    function union(a, b){
      let ra = find(a), rb = find(b);
      if(ra === rb) return;
      if(factRec && Math.abs(a % w - b % w) + Math.abs(((a - a % w) - (b - b % w)) / w) !== 1) factLog.push([a, b, factTag || 'far-join']);       // v93, v98 tag""",
        """    function union(a, b){
      let ra = find(a), rb = find(b);
      if(ra === rb) return;
      unionGen++;                                                                                                                            // v99
      if(factRec && Math.abs(a % w - b % w) + Math.abs(((a - a % w) - (b - b % w)) / w) !== 1) factLog.push([a, b, factTag || 'far-join', propPos]);       // v93, v98 tag, v99 position""")
    rep("""for(const v of must){ const fr = factRec; if(fr) factLog.push([mem[0], members.get(gOf[v - np])[0], 'split-cut']);""",
        """for(const v of must){ const fr = factRec; if(fr) factLog.push([mem[0], members.get(gOf[v - np])[0], 'split-cut', propPos]);""", mid=True)
    # propagate: the position; nested calls (probes inside a step) leave the outer one as it was
    rep("""    function propagate(){
      const all = [];
      for(let pass = 0; pass < 1000; pass++){
        const part = propagateOnce();
        if(part === null) return null;
        if(part.length === 0 && !part.again) break;
        for(const ch of part){ ch.pass = pass; all.push(ch); }          // v47: pass number, reported on the deduce events
      }
      return all;
    }""",
        """    function propagate(){
      const all = [], pos0 = propPos;
      try {
        for(let pass = 0; pass < 1000; pass++){
          propPos = all.length;                                          // v99
          const part = propagateOnce();
          if(part === null) return null;
          if(part.length === 0 && !part.again) break;
          for(const ch of part){ ch.pass = pass; all.push(ch); }          // v47: pass number, reported on the deduce events
        }
        return all;
      } finally { propPos = pos0; }
    }""")
    # the pass starts with the links inside groups, when a join happened since the last look
    rep("""      if(roseCutWhy){ failWhy = roseCutWhy; return null; }                                // v53: a cut needs more pieces than it has tiles""",
        """      if(roseCutWhy){ failWhy = roseCutWhy; return null; }                                // v53: a cut needs more pieces than it has tiles
      if(opts.sameLinksEarly !== false && linkGen !== unionGen){                          // v99: neighbours already in one group are linked at once
        linkGen = unionGen;
        const same = [];
        for(const e of spots) if(e.state === 0 && find(e.a) === find(e.b)){ e.state = 2; same.push({ e, value: 'same' }); }
        if(same.length){ linkGen = unionGen; return same; }
      }""")
    # facts reported in order
    rep("""    function* drainFacts(cause){ while(factLog.length){ const [a, b, rule] = factLog.shift(); yield { type: 'fact', kind: 'join', a: factXY(a), b: factXY(b), rule, cause }; } }""",
        """    function* drainFacts(cause, upTo){                     // v99: only the facts logged before decision upTo (all when upTo is undefined)
      while(factLog.length && (upTo === undefined || (factLog[0][3] || 0) <= upTo)){ const [a, b, rule] = factLog.shift(); yield { type: 'fact', kind: 'join', a: factXY(a), b: factXY(b), rule, cause }; }
    }""")
    rep("""      if(changes === null) return false;
      yield* drainFacts(cause);
      for(const ch of changes){
        stats.byInference++; bump(ch.rule);
        touched.push(ch.e.a, ch.e.b);""",
        """      if(changes === null) return false;
      for(let ci = 0; ci < changes.length; ci++){
        const ch = changes[ci];
        yield* drainFacts(cause, ci);                                     // v99: a fact comes just before the decisions that followed it
        stats.byInference++; bump(ch.rule);
        touched.push(ch.e.a, ch.e.b);""")
    rep("""        yield { type: 'deduce', spot: spotView(ch.e), value: ch.value, source: 'inference', rule: tagOut(ch.rule) || 'basic', via: 'rule', cause, pass: ch.pass, open: c.open, walls: c.walls, links: c.links };
      }
      for(const cells of completeShapes(touched)) yield { type: 'shape', cells, cause };""",
        """        yield { type: 'deduce', spot: spotView(ch.e), value: ch.value, source: 'inference', rule: tagOut(ch.rule) || 'basic', via: 'rule', cause, pass: ch.pass, open: c.open, walls: c.walls, links: c.links };
      }
      yield* drainFacts(cause);
      for(const cells of completeShapes(touched)) yield { type: 'shape', cells, cause };""")
    rep("""    yield* drainFacts(0);
    for(const ch of initial){
      stats.byInference++; bump(ch.rule);
      const c = counts();
      yield { type: 'deduce', spot: spotView(ch.e), value: ch.value, source: 'inference', rule: tagOut(ch.rule) || 'basic', via: 'rule', cause: 0, pass: ch.pass, open: c.open, walls: c.walls, links: c.links };
    }""",
        """    for(let ci = 0; ci < initial.length; ci++){
      const ch = initial[ci];
      yield* drainFacts(0, ci);                                           // v99: facts in order
      stats.byInference++; bump(ch.rule);
      const c = counts();
      yield { type: 'deduce', spot: spotView(ch.e), value: ch.value, source: 'inference', rule: tagOut(ch.rule) || 'basic', via: 'rule', cause: 0, pass: ch.pass, open: c.open, walls: c.walls, links: c.links };
    }
    yield* drainFacts(0);""")
    rep("""      if(changes === null) return false;
      yield* drainFacts(cause);
      for(const ch of changes){
        stats.byInference++; bump(ch.rule);
        const c = counts();""",
        """      if(changes === null) return false;
      for(let ci = 0; ci < changes.length; ci++){
        const ch = changes[ci];
        yield* drainFacts(cause, ci);                                     // v99: facts in order
        stats.byInference++; bump(ch.rule);
        const c = counts();""")
    rep("""        yield { type: 'deduce', spot: spotView(ch.e), value: ch.value, source: 'inference', rule: tagOut(ch.rule) || 'basic', via: 'rule', cause, pass: ch.pass, open: c.open, walls: c.walls, links: c.links };
      }
      return true;
    }
    // the inner probe pass of a pair probe""",
        """        yield { type: 'deduce', spot: spotView(ch.e), value: ch.value, source: 'inference', rule: tagOut(ch.rule) || 'basic', via: 'rule', cause, pass: ch.pass, open: c.open, walls: c.walls, links: c.links };
      }
      yield* drainFacts(cause);
      return true;
    }
    // the inner probe pass of a pair probe""")
    return src

if __name__ == '__main__':
    ind = ' ' * int(sys.argv[3]) if len(sys.argv) > 3 else ''
    src = open(sys.argv[1], encoding='utf8').read()
    open(sys.argv[2], 'w', encoding='utf8').write(patch(src, ind))
    print('ok', sys.argv[2])
