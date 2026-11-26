import sys, re
src = open(sys.argv[1], encoding='utf8').read()
def rep(old, new, what, cnt=1):
    global src
    c = src.count(old)
    if c != cnt: raise SystemExit(f'{what}: {c}')
    src = src.replace(old, new)
a = src.index('  function propagateOnce(){\n    tsDirty = false;')
b = src.index('\n  }\n', a) + 4
body = src[a:b]
n0 = body
body = body.replace('  function propagateOnce(){\n', '''  let altSkip = null, altSnap = null, poDepth = 0, altDepth = 0;
  const AS = t => altSkip !== null && poDepth === 1 && altSkip.has(t || 'basic');
  const ASkip = x => { if(altSkip === null || poDepth !== 1 || !x || x.length === 0) return false; if(x.every(c => altSkip.has(c.rule || 'basic'))){ restore(altSnap); return true; } return false; };
  function propagateOnce(){ poDepth++; try { if(poDepth === 1 && altSkip !== null) altSnap = snapshot(); return propagateOnceRaw(); } finally { poDepth--; } }
  function propagateOnceRaw(){
''', 1)
k = [0]
def g1(m):
    k[0] += 1; x = m.group(1); return f'if(!ASkip({x}) && ({m.group(2)})) return {x};'
body = re.sub(r'if\(((\w+)\.length > 0(?: \|\| \2\.again)?)\) return \2;', lambda m: (k.__setitem__(0, k[0]+1), f'if(!ASkip({m.group(2)}) && ({m.group(1)})) return {m.group(2)};')[1], body)
body = re.sub(r'if\(((\w+)\.again)\) return \2;', lambda m: (k.__setitem__(0, k[0]+1), f'if(!ASkip({m.group(2)}) && ({m.group(1)})) return {m.group(2)};')[1], body)
body = re.sub(r'if\(((\w+)\.length)\) return \2;', lambda m: (k.__setitem__(0, k[0]+1), f'if(!ASkip({m.group(2)}) && ({m.group(1)})) return {m.group(2)};')[1], body)
print('generic', k[0])
def r2(old, new, what):
    global body
    c = body.count(old)
    if c != 1: raise SystemExit(f'{what}: {c}')
    body = body.replace(old, new)
r2("if(same.length){ linkGen = unionGen; return same; }", "if(same.length && !ASkip(same)){ linkGen = unionGen; return same; }", 'same')
r2("if(ra === rb){ e.state = 2; changes.push({ e, value: 'same' }); }", "if(ra === rb){ if(!AS('basic')){ e.state = 2; changes.push({ e, value: 'same' }); } }", 'l1')
r2("else if(diff.has(dk)){ e.state = 1; changes.push({ e, value: 'wall', rule: diffWhy.get(dk) }); }", "else if(diff.has(dk)){ if(!AS(diffWhy.get(dk))){ e.state = 1; changes.push({ e, value: 'wall', rule: diffWhy.get(dk) }); } }", 'l2')
r2("else if(pieceInfo(members.get(ra).concat(members.get(rb))) === null){ e.state = 1; changes.push({ e, value: 'wall', rule: why }); }", "else if(pieceInfo(members.get(ra).concat(members.get(rb))) === null){ if(!AS(why)){ e.state = 1; changes.push({ e, value: 'wall', rule: why }); } }", 'l3')
r2("if(must.length){", "if(must.length && !AS('split-cut')){", 'split')
r2("if(ex.length === 1){ const e = ex[0];", "if(ex.length === 1 && !AS(tag)){ const e = ex[0];", 'grow')
r2("if(reachFails(e)){ e.state = 2;", "if(reachFails(e) && !AS(reachTag(e))){ e.state = 2;", 'reach')
src = src[:a] + body + src[b:]
rep("""        let part; try { part = propagateOnce(); } finally { passFrames.pop(); }""",
"""        let part; const altHere = opts.altLog && !inProbe && !searchLite && altDepth === 0 && poDepth === 0; const sn0 = altHere ? snapshot() : null;
        try { part = propagateOnce(); } finally { passFrames.pop(); }
        if(altHere && part && part.length > 0) altRecord(sn0, part);""", 'propagate')
rep("""  const passFrames = [];""", """  function altRecord(sn0, part){
    const tagsOf = x => [...new Set(x.map(c => tagOut(c.rule) || 'basic'))];
    const chOf = x => x.map(c => [c.e.c1, c.e.r1, c.e.c2, c.e.r2, c.value, tagOut(c.rule) || 'basic']);
    const first = tagsOf(part);
    if(first.every(t => t === 'basic')) return;
    altDepth++;
    const sn1 = snapshot(), alts = [{ tags: first, ch: chOf(part) }];
    restore(sn0); altSkip = new Set(['basic', ...part.map(c => c.rule || 'basic')]);
    try {
      for(let k = 0; k < 200; k++){
        const fr = { n: null, c: null }; passFrames.push(fr);
        let r; try { r = propagateOnce(); } catch(err){ r = null; } finally { passFrames.pop(); }
        if(r === null) break;
        const real = r.filter(c => !altSkip.has(c.rule || 'basic'));
        if(real.length === 0){ if(r.again) continue; break; }
        alts.push({ tags: tagsOf(real), ch: chOf(real) });
        for(const c of r) altSkip.add(c.rule || 'basic');
        restore(sn0);
      }
    } finally { altSkip = null; restore(sn1); altDepth--; }
    opts.altLog.push({ st: spots.filter((e, i) => sn0.st[i] !== 0).map(e => [e.c1, e.r1, e.c2, e.r2, sn0.st[spots.indexOf(e)]]), alts });
  }
  const passFrames = [];""", 'rec')
open(sys.argv[2], 'w', encoding='utf8').write(src); print('ok')
