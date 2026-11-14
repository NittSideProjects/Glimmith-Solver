#!/usr/bin/env python3
"""Page V1.0.18 -> V1.0.19: embedded core v102 (see patch_core102.py) and "Show cases" on the proofs by contradiction.

Step by step: a step "checked by trying the other way" (and a step "checked by search", and a "far apart, but one piece" step that
was found by trying the tiles in different pieces) has a "Show cases" button, at the same place as "Show example". It opens a
pop-up that shows what the solver tried and why it fails:
  * the board as it stood before the step, with the tried value marked in red (dashed);
  * outlined, every edge the rules then decide from it, and under the board the rules that decided them, in order;
  * the reason the case fails, in the words the step view already uses, and the tiles where it fails ringed in red when the
    solver knows them.
When trying the other value does not fail at once, the case is split (wall / same piece on the nearest open edge, up to four
times): every case is shown with its own board and reason. If that still does not close every case, the pop-up says so: the
solver's own proof was a longer search.
The cases are worked out when the button is clicked: the page replays the position before the step into the solver (opts.pre*)
and asks for the cases (opts.explain). Steps remember where they start in the recorded events (st.at).
Usage: python3 patch_ui_V1.0.19.py glimmith_solver_V1.0.18.html glimmith_solver_V1.0.19.html"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from patch_core102 import patch as core_patch
src = open(sys.argv[1], encoding='utf8').read()
a = src.index('  // ================= SOLVER CORE (pure'); b = src.index('  // ================= IMPORT CORE (pure')
src = src[:a] + core_patch(src[a:b], '  ') + src[b:]

def rep(src, old, new):
    c = src.count(old)
    if c != 1: raise SystemExit(f'anchor found {c} times: {old[:120]}')
    return src.replace(old, new)

# ---- styles and markup: the two buttons side by side ----
src = rep(src, "  .example-btn{ position:absolute; right:10px; bottom:8px; font-size:12px; padding:3px 10px; border-radius:999px; }\n",
"""  .steps-btns{ position:absolute; right:10px; bottom:8px; display:flex; gap:8px; }
  .example-btn{ font-size:12px; padding:3px 10px; border-radius:999px; }
  .example-pop .case-tried{ margin:0 0 2px; font-size:13px; font-weight:600; }
  .example-pop .case-list{ margin:6px 0 0; padding:0 0 0 20px; font-size:13px; line-height:1.5; }
  .example-pop .case-fail{ margin:6px 0 0; font-size:13px; line-height:1.5; }
  .example-pop .case-fail b{ color:#e5534b; }
  .example-pop .ded-probe [stroke-dasharray]{ fill:rgba(229,83,75,.75); stroke-width:2.2; }
""")
src = rep(src, """        <button type="button" class="subtle example-btn" id="stepsExampleBtn" hidden>Show example</button>""",
"""        <div class="steps-btns">
          <button type="button" class="subtle example-btn" id="stepsCasesBtn" hidden>Show cases</button>
          <button type="button" class="subtle example-btn" id="stepsExampleBtn" hidden>Show example</button>
        </div>""")

# ---- steps remember where they start in the events ----
src = rep(src, """    for(const [k, t] of puzzle.walls) if(t === 'link'){ const [a, b] = tilesOf(k); join(a, b); }
    for(const e of events){
      if(e.type === 'shape'){ (cur || start).shapes.push(e.cells); continue; }""",
"""    for(const [k, t] of puzzle.walls) if(t === 'link'){ const [a, b] = tilesOf(k); join(a, b); }
    let evAt = -1;                                                       // V1.0.19: the place of the event in the list (st.at = where a step starts)
    for(const e of events){
      evAt++;
      if(e.type === 'shape'){ (cur || start).shapes.push(e.cells); continue; }""")
src = rep(src, "        cur = { kind: 'fact', cause: e.cause, pass: -1, rule: e.rule, value: 'same', trigger: null, why: '', edges: [], shapes: [], follows: false, facts: [e] };\n",
               "        cur = { kind: 'fact', cause: e.cause, pass: -1, rule: e.rule, value: 'same', trigger: null, why: '', edges: [], shapes: [], follows: false, facts: [e], at: evAt };\n")
src = rep(src, "      if(e.via === 'probe' || e.via === 'search'){ cur = newStep(e.via, e); steps.push(cur); continue; }",
               "      if(e.via === 'probe' || e.via === 'search'){ cur = newStep(e.via, e); cur.at = evAt; steps.push(cur); continue; }")

# ---- several tried edges on one board ----
src = rep(src, "    if(v.probe){\n      const key = v.probe.key,", "    for(const pb of v.probes || (v.probe ? [v.probe] : [])){              // V1.0.19: several tried values (the cases)\n      const key = pb.key,")
src = rep(src, "      if(v.probe.assume === 'wall'){", "      if(pb.assume === 'wall'){")

# ---- the tiles where a case breaks, ringed in red ----
src = rep(src, "    stepHasWall = k => isWallKey(k) || v.walls.has(k) || !!(v.searchWalls && v.searchWalls.has(k));\n",
"""    if(v.failTiles) for(const [c, r] of v.failTiles)                    // V1.0.19: where a case breaks
      svgEl('rect', { x: c * cs + 2, y: r * cs + 2, width: cs - 4, height: cs - 4, rx: Math.max(2, cs * 0.08), fill: 'rgba(229,83,75,.12)', stroke: '#e5534b', 'stroke-width': 2, class: 'case-at' }, svg);
    stepHasWall = k => isWallKey(k) || v.walls.has(k) || !!(v.searchWalls && v.searchWalls.has(k));
""")

# ---- the button ----
src = rep(src, "    exBtn.hidden = !(exKey && RULE_EXAMPLES[exKey]); exBtn.dataset.key = exKey || '';",
               "    exBtn.hidden = !(exKey && RULE_EXAMPLES[exKey]); exBtn.dataset.key = exKey || '';\n    document.getElementById('stepsCasesBtn').hidden = !stepHasCases(st);                          // V1.0.19")
src = rep(src, "    document.getElementById('allExamplesBtn').addEventListener('click', () => openExamplePop(true));\n",
               "    document.getElementById('allExamplesBtn').addEventListener('click', () => openExamplePop(true));\n    document.getElementById('stepsCasesBtn').addEventListener('click', () => openCasesPop(stepsIdx));   // V1.0.19\n")

# ---- the cases ----
src = rep(src, "  function stepsGo(i){", r"""  // ---- V1.0.19: the cases behind a proof by contradiction ----
  const stepHasCases = st => !!st && st.at != null && !!stepTrace && (st.kind === 'probe' || st.kind === 'search' || (st.kind === 'fact' && (st.rule === 'clue-join' || st.rule === 'pair-join')));
  // asks the solver: from the position just before this step, try the other value; what follows, and why does it fail?
  function explainStep(st, fact){
    const pre = { preAssume: [], preJoin: [], preApart: [] };
    for(let i = 0; i < st.at && i < stepTrace.length; i++){
      const e = stepTrace[i];
      if(e.type === 'deduce') pre.preAssume.push([e.spot.key, e.value]);
      else if(e.type === 'fact') (e.kind === 'join' ? pre.preJoin : pre.preApart).push([e.a[0], e.a[1], e.b[0], e.b[1]]);
    }
    const explain = st.kind === 'fact' ? { apart: [fact.a[0], fact.a[1], fact.b[0], fact.b[1]] } : { edge: [st.trigger.spot.key, st.value === 'wall' ? 'same' : 'wall'] };
    try {
      const cfg = readDeduceSettings() || {};
      const bankShapesData = bank.map(s => ({ id: s.id, cells: s.cells, color: s.color }));
      const ctx = buildSolverContext(puzzle, bankShapesData, sizeRules, (stepsCtx && stepsCtx.hints) || { maxRegions: null, maxRegionSize: null }, banShapesData());
      const opts = Object.assign({ testMs: cfg.testMs, restart: cfg.restart, order: cfg.order, focusMode: cfg.focusMode, nearShare: cfg.nearShare, useWitness: cfg.useWitness,
        stopAtTwo: true, nodeBudget: NODE_BUDGET, exact: 'edge', slices: 's18,e', fullScan: true }, pre, { explain });
      for(const ev of deduceSolve(puzzle.w, puzzle.h, ctx, collectSpecialEdges(), opts)) if(ev.type === 'cases') return ev;
    } catch(e){ /* the cases stay unknown */ }
    return null;
  }
  // one case: its board (the tried values in red, what the rules then decide outlined), the rules in order, the reason it fails
  function caseCard(st, idx, c, n, total, fact){
    const card = document.createElement('div'); card.className = 'ex-card';
    const tried = document.createElement('p'); tried.className = 'case-tried';
    const first = st.kind === 'fact' ? 'the ringed tiles in different pieces' : (c.assume[0][1] === 'wall' ? 'a wall at the edge marked in red' : 'the two tiles at the red mark in one piece');
    const more = c.assume.length - (st.kind === 'fact' ? 0 : 1);
    tried.textContent = (total > 1 ? `Case ${n} of ${total}. ` : '') + `Tried: ${first}` + (more > 0 ? `, and ${more === 1 ? 'one more choice' : more + ' more choices'} (marked the same way)` : '') + '.';
    card.appendChild(tried);
    const state = stateAfter(idx - 1), prev = stepsList[idx - 1] || {};
    const walls = new Set(state.walls), links = new Set(state.links), fresh = new Set();
    for(const [k, v] of c.trace){ (v === 'wall' ? walls : links).add(k); fresh.add(k); }
    const svg = renderStepSVG({ groupTint: prev.groupTint || null, factTiles: fact ? [fact.a, fact.b] : null, walls, links, shapes: prev.closed || [], fresh,
      probes: c.assume.map(([key, assume]) => ({ key, assume })), failTiles: c.at || null, pieces: null, searchWalls: null, diff: null, label: 'Case' });
    const b = document.createElement('div'); b.className = 'ex-board'; b.appendChild(svg); card.appendChild(b);
    // the rules that worked, in order (the same rule several times in a row is one line)
    const runs = [];
    for(const [, v, r] of c.trace){ const last = runs[runs.length - 1]; if(last && last.r === r) last[v === 'wall' ? 'w' : 'l']++; else runs.push({ r, w: v === 'wall' ? 1 : 0, l: v === 'wall' ? 0 : 1 }); }
    if(runs.length){
      const p = document.createElement('p'); p.className = 'ex-text'; p.textContent = 'From that, the rules decide the outlined edges:'; card.appendChild(p);
      const ol = document.createElement('ol'); ol.className = 'case-list';
      for(const x of runs.slice(0, 12)){ const li = document.createElement('li');
        li.textContent = `${(STEP_INFO[x.r] || [])[0] || x.r}: ${[x.w ? plural(x.w, 'wall', 'walls') : '', x.l ? plural(x.l, 'link', 'links') : ''].filter(Boolean).join(' and ')}`; ol.appendChild(li); }
      if(runs.length > 12){ const li = document.createElement('li'); li.textContent = `and ${runs.length - 12} more`; ol.appendChild(li); }
      card.appendChild(ol);
    }
    const f = document.createElement('p'); f.className = 'case-fail';
    if(c.open) f.textContent = 'No rule is broken yet after these choices: the solver needed a longer search here.';
    else {
      let why = stepWhyText(c.why).trim().replace(/\.+$/, ''); if(/^[A-Z][a-z]/.test(why)) why = why[0].toLowerCase() + why.slice(1);
      const lead = document.createElement('b'); lead.textContent = c.at ? 'This fails at the tiles ringed in red: ' : 'This fails: '; f.appendChild(lead);
      f.appendChild(document.createTextNode((why || 'the rules can not all be met') + '.'));
    }
    card.appendChild(f);
    return card;
  }
  function openCasesPop(idx){
    const st = stepsList[idx]; if(!stepHasCases(st)) return;
    const old = document.getElementById('examplePop'); if(old) old.remove();
    const pop = document.createElement('div'); pop.id = 'examplePop'; pop.className = 'example-pop';
    const box = document.createElement('div'); box.className = 'box'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true');
    const head = document.createElement('div'); head.className = 'ex-head';
    const h = document.createElement('h3'); const close = document.createElement('button'); close.type = 'button'; close.className = 'subtle'; close.id = 'examplePopClose'; close.textContent = 'Close';
    h.textContent = 'What the solver tried, and why it fails';
    head.append(h, close); box.appendChild(head);
    const shut = () => { pop.remove(); document.removeEventListener('keydown', onKey, true); };
    const onKey = ev => { if(ev.key === 'Escape'){ ev.preventDefault(); ev.stopPropagation(); shut(); } };
    close.addEventListener('click', shut); pop.addEventListener('click', ev => { if(ev.target === pop) shut(); });
    document.addEventListener('keydown', onKey, true);
    pop.appendChild(box); document.body.appendChild(pop);
    const note = text => { const p = document.createElement('p'); p.className = 'ex-note'; p.textContent = text; box.appendChild(p); };
    const facts = st.kind === 'fact' ? st.facts.slice(0, 3) : [null];
    let shown = 0;
    for(const fact of facts){
      const res = explainStep(st, fact);
      if(!res || !res.cases.length){ note('The cases could not be rebuilt for this step.'); continue; }
      if(!res.complete) note(st.kind === 'search'
        ? 'The solver proved this step with a longer search: it tried every way to go on. These are the first cases; the ones marked as still open need more choices than fit here.'
        : 'These cases do not close everything: the ones marked as still open need more choices than fit here.');
      res.cases.forEach((c, i) => { box.appendChild(caseCard(st, idx, c, i + 1, res.cases.length, fact)); shown++; });
    }
    if(st.kind === 'fact' && st.facts.length > 3) note(`This step joins ${st.facts.length} pairs of tiles: the cases of the first three are shown.`);
    close.focus();
  }
  function stepsGo(i){""")
open(sys.argv[2], 'w', encoding='utf8').write(src); print('ok', sys.argv[2])
