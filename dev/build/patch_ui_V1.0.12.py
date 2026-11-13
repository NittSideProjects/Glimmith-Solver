#!/usr/bin/env python3
"""Page V1.0.11 -> V1.0.12 (page only, core stays v99): rule examples.

* Step by step: a "Show example" button at the bottom right of a rule step (and of a "one piece" step) opens a pop-up with the smallest
  puzzle found where the solver uses that rule: the board at that step (the edges the rule decides outlined), the rule's title and the
  step text, the same way the step view shows it.
* Bottom of the page ("Rules with improved deduction logic"): "Show all examples" opens every example in one scrolling pop-up.
* The examples (rule_examples_V1.0.12.json) were found by dev/tools/examples/: every puzzle the fuzzers build was solved with the page's
  default settings, and for every rule the smallest one where a step uses it was kept (a unique puzzle preferred; one up to 1.5x bigger
  still wins over a puzzle with several tilings). Each example keeps the solver's events up to that step, so the page rebuilds the step
  with its own step code (buildSteps, splitBigSteps, colours) without solving anything.
* Titles and texts for rule steps that showed their internal name ("Rule: box-all", ...).
Usage: python3 patch_ui_V1.0.12.py glimmith_solver_V1.0.11.html glimmith_solver_V1.0.12.html"""
import sys, os, json

def rep(src, old, new):
    c = src.count(old)
    if c != 1: raise SystemExit(f'anchor found {c} times: {old[:120]}')
    return src.replace(old, new)

here = os.path.dirname(os.path.abspath(__file__))
EX = json.load(open(os.path.join(here, 'rule_examples_V1.0.12.json'), encoding='utf8'))
EXTRA_INFO = json.load(open(os.path.join(here, 'step_info_extra_V1.0.12.json'), encoding='utf8'))
src = open(sys.argv[1], encoding='utf8').read()

# ---- styles ----
src = rep(src, "  .steps-caption{ margin-top:12px; padding:12px 14px; background: var(--panel); border:1px solid var(--seam); border-radius:10px; min-height:112px; }\n",
"""  .steps-caption{ margin-top:12px; padding:12px 14px; background: var(--panel); border:1px solid var(--seam); border-radius:10px; min-height:112px; }
  .steps-caption{ position:relative; padding-bottom:38px; }
  .example-btn{ position:absolute; right:10px; bottom:8px; font-size:12px; padding:3px 10px; border-radius:999px; }
  .example-btn[hidden]{ display:none; }
  .example-pop{ position:fixed; inset:0; background:rgba(0,0,0,.5); display:flex; align-items:center; justify-content:center; z-index:70; padding:16px; }
  .example-pop .box{ background:var(--panel); border:1px solid var(--seam); color:var(--ink); border-radius:10px; padding:16px 18px; width:min(560px, 100%); max-height:calc(100vh - 32px); overflow:auto; box-shadow:0 10px 30px rgba(0,0,0,.35); }
  .example-pop.all .box{ width:min(760px, 100%); }
  .example-pop .ex-head{ display:flex; align-items:baseline; justify-content:space-between; gap:12px; margin:0 0 10px; }
  .example-pop h3{ margin:0; font-size:15px; }
  .example-pop .ex-card{ padding:12px 0; border-top:1px solid var(--seam); }
  .example-pop .ex-card:first-of-type{ border-top:none; padding-top:0; }
  .example-pop .ex-board{ display:flex; justify-content:center; margin:8px 0; }
  .example-pop .ex-board svg{ max-width:100%; height:auto; }
  .example-pop .ex-title{ font-weight:600; font-size:14px; margin:0; }
  .example-pop .ex-text{ margin:6px 0 0; font-size:13px; line-height:1.5; }
  .example-pop .ex-note{ margin:6px 0 0; font-size:11.5px; color:var(--ink-muted); }
""")

# ---- markup: the step button and the footer button ----
src = rep(src, """        <p class="steps-meta" id="stepsCapMeta" hidden></p>""",
"""        <p class="steps-meta" id="stepsCapMeta" hidden></p>
        <button type="button" class="subtle example-btn" id="stepsExampleBtn" hidden>Show example</button>""")
i = src.index('<p class="imp-intro">'); j = src.index('</p>', i) + len('</p>')
src = src[:j] + """
    <p><button type="button" class="subtle" id="allExamplesBtn">Show all examples</button></p>""" + src[j:]

# ---- data + code, next to the step texts ----
data = json.dumps(EX, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
extra = ''.join(f"  STEP_INFO[{json.dumps(k)}] = {json.dumps(v, ensure_ascii=False)};\n" for k, v in EXTRA_INFO.items())
src = rep(src, "  // reasons a check can fail that are not in WHY_TEXT\n", f"""  // V1.0.12: steps that showed their internal name
{extra}  // V1.0.12: the smallest puzzle found for each rule (see dev/tools/examples/): p = puzzle, r = rules on, b = shape bank, n = Omits,
  // e = the solver's events up to that step (d = decision, f = fact, s = finished piece), u = unique puzzle
  const RULE_EXAMPLES = {data};
  // reasons a check can fail that are not in WHY_TEXT
""")

src = rep(src, "  function stepsGo(i){", r"""  // ---- V1.0.12: rule examples ----
  const exampleKey = st => st && st.kind === 'rule' ? st.rule : st && st.kind === 'fact' ? 'fact:' + st.rule : null;
  function exampleEvents(ex){
    return ex.e.map(e => e.t === 'd' ? { type: 'deduce', spot: { key: e.k }, value: e.v, rule: e.r, via: e.via, cause: e.c, pass: e.p, why: e.y }
      : e.t === 'f' ? { type: 'fact', kind: e.kind, a: e.a, b: e.b, rule: e.r, cause: e.c } : { type: 'shape', cells: e.cells });
  }
  // the example's step, drawn and worded by the step view's own code (the page's puzzle and rules are lent to the example meanwhile)
  function renderExample(key){
    const ex = RULE_EXAMPLES[key]; if(!ex) return null;
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
      const svg = renderStepSVG({ groupTint: st.groupTint || null, factTiles: st.kind === 'fact' ? st.facts.flatMap(f => [f.a, f.b]) : null, walls, links,
        shapes: st.closed || [], fresh: new Set(st.edges.map(e => e.spot.key)), probe: null, pieces: null, searchWalls: null, diff: null, label: 'Example' });
      const t = stepTexts(st, idx, steps.length - 1);
      const NUM = { precision: 'Precision', min: 'Minimum', max: 'Maximum' };
      const on = Object.entries(ex.r || {}).filter(([k, v]) => v && v !== null && v !== false).map(([k, v]) => BOOLEAN_RULE_LABELS[k] || ((NUM[k] || k) + (v === true ? '' : ' ' + v)));
      return { svg, title: t.title, text: t.text, rules: on, unique: !!ex.u, tiles: p.active.flat().filter(Boolean).length };
    } catch(e){ return null; }
    finally { puzzle = savedPuzzle; sizeRules = savedRules; stepsList = savedList; }
  }
  function exampleCard(key, withTitle){
    const r = renderExample(key); if(!r) return null;
    const card = document.createElement('div'); card.className = 'ex-card';
    if(withTitle){ const h = document.createElement('p'); h.className = 'ex-title'; h.textContent = r.title; card.appendChild(h); }
    const b = document.createElement('div'); b.className = 'ex-board'; b.appendChild(r.svg); card.appendChild(b);
    const p = document.createElement('p'); p.className = 'ex-text'; p.textContent = r.text; card.appendChild(p);
    const n = document.createElement('p'); n.className = 'ex-note';
    n.textContent = `${r.tiles} tiles${r.rules.length ? ' · rules: ' + r.rules.join(', ') : ''} · ${r.unique ? 'one solution' : 'several solutions'} · the outlined edges are the ones this step decides`;
    card.appendChild(n);
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
      h.textContent = 'Example: ' + ((STEP_INFO[key] || [])[0] || (key === 'fact:split-cut' ? 'The only way to connect' : key.startsWith('fact:') ? 'Far apart, but one piece' : key));
      if(r) box.appendChild(r); else { const p = document.createElement('p'); p.textContent = 'This example could not be drawn.'; box.appendChild(p); }
    } else {
      h.textContent = 'Every rule, on the smallest puzzle found';
      const keys = Object.keys(RULE_EXAMPLES);
      let i = 0;
      const batch = () => { if(!document.body.contains(pop)) return; const end = Math.min(keys.length, i + 6);
        for(; i < end; i++){ const c = exampleCard(keys[i], true); if(c) box.appendChild(c); }
        if(i < keys.length) setTimeout(batch, 0); };
      batch();
    }
    close.focus();
  }
  function stepsGo(i){""")

# show the step button when the step has an example
src = rep(src, """    const meta = document.getElementById('stepsCapMeta'); meta.textContent = t.meta || ''; meta.hidden = !t.meta;""",
"""    const meta = document.getElementById('stepsCapMeta'); meta.textContent = t.meta || ''; meta.hidden = !t.meta;
    const exBtn = document.getElementById('stepsExampleBtn'), exKey = exampleKey(st);            // V1.0.12
    exBtn.hidden = !(exKey && RULE_EXAMPLES[exKey]); exBtn.dataset.key = exKey || '';""")
src = rep(src, "  function attachFastImport(){\n", """  function attachExamples(){                                          // V1.0.12
    document.getElementById('stepsExampleBtn').addEventListener('click', ev => openExamplePop(false, ev.currentTarget.dataset.key));
    document.getElementById('allExamplesBtn').addEventListener('click', () => openExamplePop(true));
  }
  function attachFastImport(){
""")
src = rep(src, "    document.getElementById('fastImportBtn').addEventListener('click', fastButton);\n",
               "    document.getElementById('fastImportBtn').addEventListener('click', fastButton);\n    attachExamples();\n")
open(sys.argv[2], 'w', encoding='utf8').write(src); print('ok', sys.argv[2], len(EX), 'examples')
