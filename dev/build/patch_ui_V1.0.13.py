#!/usr/bin/env python3
"""Page V1.0.12 -> V1.0.13 (page only, core stays v99): rule examples made as small as they can be.

* Every example now uses only the mechanic of its rule (one rule, one kind of clue or one kind of wall; two only for the rules that
  are about two), helped by nothing but area numbers and plain walls, on a board of a few tiles. A rule with several kinds of cases
  shows several tiny boards side by side (up to four): "Walls that compare sizes" shows a Difference, a Gemini and an Inequality wall.
* The pop-up is one line of explanation (rule_example_lines in dev/tools/examples/lines.json) and the boards. Under a board only what
  the board itself cannot show is named: the rules that are on and the shape bank / Omits shapes. No list of the clues on the board,
  no step text, no notes.
* The examples (rule_examples_V1.0.13.json) come from dev/tools/examples/tiny.js (random tiny boards with one mechanic) and
  minimize.js (drops every rule, clue, wall, number and tile the rule does not need). One clue per tile, as in the game.
Usage: python3 patch_ui_V1.0.13.py glimmith_solver_V1.0.12.html glimmith_solver_V1.0.13.html"""
import sys, os, json

def rep(src, old, new):
    c = src.count(old)
    if c != 1: raise SystemExit(f'anchor found {c} times: {old[:120]}')
    return src.replace(old, new)

here = os.path.dirname(os.path.abspath(__file__))
EX = json.load(open(os.path.join(here, 'rule_examples_V1.0.13.json'), encoding='utf8'))
src = open(sys.argv[1], encoding='utf8').read()

# ---- styles ----
src = rep(src, "  .example-pop .ex-step{ margin-top:10px; }\n",
"""  .example-pop .ex-cases{ display:flex; flex-wrap:wrap; gap:10px 22px; justify-content:center; align-items:flex-end; margin-top:10px; }
  .example-pop .ex-case{ display:flex; flex-direction:column; align-items:center; gap:4px; }
  .example-pop .ex-case svg{ max-width:100%; height:auto; }
  .example-pop .ex-names{ display:flex; flex-wrap:wrap; gap:4px 8px; align-items:center; justify-content:center; font-size:12px; color:var(--ink-muted); }
  .example-pop .ex-names .ex-shapes{ margin:0; }
""")

# ---- a step that showed its internal name ----
src = rep(src, "  // V1.0.12: the smallest puzzle found for each rule", """  STEP_INFO["ban-fit"] = ["Omits: never one of those shapes", null, "Joined, these two groups would hold a shape of the Omits, so there is a wall between them.", null];   // V1.0.13
  STEP_INFO["range-count"] = ["Sizes that can fill the board", null, "Only some piece sizes can still cover the whole board. Joined, these two groups would have a size outside those, so there is a wall between them.", null];
  // V1.0.12: the smallest puzzle found for each rule""")

# ---- data ----
i = src.index("  // V1.0.12: the smallest puzzle found for each rule"); j = src.index("\n", src.index("  const RULE_EXAMPLES = ", i)) + 1
data = json.dumps(EX, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
src = src[:i] + f"""  // V1.0.13: tiny examples for each rule (see dev/tools/examples/): d = the one-line explanation, x = the cases, each with p = puzzle,
  // r = rules on, b = shape bank, n = Omits, e = the solver's events up to that step (d = decision, f = fact, s = finished piece)
  const RULE_EXAMPLES = {data};
""" + src[j:]

# ---- code ----
i = src.index("  // the example's step, drawn and worded by the step view's own code"); j = src.index("  function stepsGo(i){")
src = src[:i] + r"""  // one case of an example, drawn by the step view's own code (the page's puzzle and rules are lent to it meanwhile)
  function renderExampleCase(key, ex){
    const M = a => new Map(a || []), p = ex.p;
    const savedPuzzle = puzzle, savedRules = sizeRules, savedList = stepsList;
    try {
      puzzle = { w: p.w, h: p.h, active: p.active, walls: M(p.walls), roses: M(p.roses), polyominoes: M(p.polyominoes), areaNumbers: M(p.areaNumbers),
                 palisades: M(p.palisades), compasses: M(p.compasses), watchtowers: M(p.watchtowers) };
      sizeRules = Object.assign({}, savedRules, { precision: null, min: null, max: null }, Object.fromEntries(Object.keys(BOOLEAN_RULE_LABELS).map(k => [k, false])), ex.r || {});
      const steps = splitBigSteps(buildSteps(exampleEvents(ex)));
      markClosedPieces(steps); markGroupColors(steps);
      stepsList = steps;
      const idx = steps.findIndex(st => exampleKey(st) === key);
      if(idx < 0) return null;
      const st = steps[idx], walls = new Set(), links = new Set();
      for(let i = 0; i <= idx; i++) for(const e of steps[i].edges) (e.value === 'wall' ? walls : links).add(e.spot.key);
      return renderStepSVG({ groupTint: st.groupTint || null, factTiles: st.kind === 'fact' ? st.facts.flatMap(f => [f.a, f.b]) : null, walls, links,
        shapes: st.closed || [], fresh: new Set(st.edges.map(e => e.spot.key)), probe: null, pieces: null, searchWalls: null, diff: null, label: 'Example' });
    } catch(e){ return null; }
    finally { puzzle = savedPuzzle; sizeRules = savedRules; stepsList = savedList; }
  }
  function miniShapes(shapes){
    const box = document.createElement('span'); box.className = 'ex-shapes';
    shapes.forEach((shape, i) => {
      const cs = 10, w = Math.max(...shape.cells.map(c => c[0])) + 1, h = Math.max(...shape.cells.map(c => c[1])) + 1;
      const svg = document.createElementNS(SVGNS, 'svg'); svg.setAttribute('width', w * cs + 4); svg.setAttribute('height', h * cs + 4); svg.setAttribute('viewBox', `0 0 ${w * cs + 4} ${h * cs + 4}`);
      svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', `shape of ${shape.cells.length} tiles`);
      shape.cells.forEach(([c, r]) => svgEl('rect', { x: c * cs + 2, y: r * cs + 2, width: cs - 1, height: cs - 1, rx: 2, fill: shape.color || PALETTE[i % PALETTE.length] }, svg));
      box.appendChild(svg);
    });
    return box;
  }
  // what a case's board cannot show: the rules that are on, the shape bank, the Omits
  function exampleNames(ex){
    const r = ex.r || {}, box = document.createElement('div'); box.className = 'ex-names';
    const add = (text, extra) => { const s = document.createElement('span'); s.textContent = text; box.appendChild(s); if(extra) box.appendChild(extra); };
    if(r.precision) add(`Precision ${r.precision}`);
    if(r.min) add(`Minimum ${r.min}`);
    if(r.max) add(`Maximum ${r.max}`);
    for(const k of Object.keys(BOOLEAN_RULE_LABELS)) if(r[k]) add(BOOLEAN_RULE_LABELS[k]);
    if(ex.b && ex.b.length) add('Shape bank', miniShapes(ex.b));
    if(ex.n && ex.n.length) add('Omits', miniShapes(ex.n));
    return box.firstChild ? box : null;
  }
  const exampleTitle = key => (STEP_INFO[key] || [])[0] || (key === 'fact:split-cut' ? 'The only way to connect' : key === 'fact:label-join' ? 'Only one piece it can be in' : key.startsWith('fact:') ? 'Far apart, but one piece' : key);
  function exampleCard(key, withTitle){
    const ex = RULE_EXAMPLES[key]; if(!ex) return null;
    const cases = ex.x.map(c => [c, renderExampleCase(key, c)]).filter(([, svg]) => svg);
    if(!cases.length) return null;
    const card = document.createElement('div'); card.className = 'ex-card';
    if(withTitle){ const h = document.createElement('p'); h.className = 'ex-title'; h.textContent = exampleTitle(key); card.appendChild(h); }
    const p = document.createElement('p'); p.className = 'ex-text'; p.textContent = ex.d + (cases.length > 1 ? ` Here are ${cases.length} cases.` : ''); card.appendChild(p);
    const row = document.createElement('div'); row.className = 'ex-cases';
    for(const [c, svg] of cases){
      const box = document.createElement('div'); box.className = 'ex-case'; box.appendChild(svg);
      const names = exampleNames(c); if(names) box.appendChild(names);
      row.appendChild(box);
    }
    card.appendChild(row);
    return card;
  }
  function openExamplePop(all, key){
    const old = document.getElementById('examplePop'); if(old) old.remove();
    const pop = document.createElement('div'); pop.id = 'examplePop'; pop.className = 'example-pop' + (all ? ' all' : '');
    const box = document.createElement('div'); box.className = 'box'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true');
    const head = document.createElement('div'); head.className = 'ex-head';
    const h = document.createElement('h3'); const close = document.createElement('button'); close.type = 'button'; close.className = 'subtle'; close.id = 'examplePopClose'; close.textContent = 'Close';
    head.append(h, close); box.appendChild(head);
    const shut = () => { pop.remove(); document.removeEventListener('keydown', onKey, true); };
    const onKey = ev => { if(ev.key === 'Escape'){ ev.preventDefault(); ev.stopPropagation(); shut(); } };
    close.addEventListener('click', shut); pop.addEventListener('click', ev => { if(ev.target === pop) shut(); });
    document.addEventListener('keydown', onKey, true);
    pop.appendChild(box); document.body.appendChild(pop);
    if(!all){
      const r = exampleCard(key, false);
      h.textContent = exampleTitle(key);
      if(r) box.appendChild(r); else { const p = document.createElement('p'); p.textContent = 'This example could not be drawn.'; box.appendChild(p); }
    } else {
      h.textContent = 'A small example of every rule';
      const note = document.createElement('p'); note.className = 'ex-note'; note.textContent = 'The outlined edges are the ones the rule decides.'; box.appendChild(note);
      const keys = Object.keys(RULE_EXAMPLES);
      let i = 0;
      const batch = () => { if(!document.body.contains(pop)) return; const end = Math.min(keys.length, i + 8);
        for(; i < end; i++){ const c = exampleCard(keys[i], true); if(c) box.appendChild(c); }
        if(i < keys.length) setTimeout(batch, 0); };
      batch();
    }
    close.focus();
  }
""" + src[j:]
open(sys.argv[2], 'w', encoding='utf8').write(src); print('ok', sys.argv[2], len(EX), 'rules,', sum(len(v['x']) for v in EX.values()), 'boards')
