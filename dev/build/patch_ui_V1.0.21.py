#!/usr/bin/env python3
"""Page V1.0.20 -> V1.0.21 (page only, core stays v103): "Show cases" explains more of the steps proved by a search.

* When the first try does not close every case (mostly the steps "checked by search"), the page asks the solver again with deeper
  limits (up to 8 splits, 40 cases, 4 s). More steps are then explained completely.
* Only the cases that fail are listed. Ways that break no rule within the limits get one sentence (the solver needed a longer
  search for those), and a step with no failing case at all says so instead of listing open cases.
* More than four cases are folded: one line per case (what was tried, why it fails), the board and the list of rules open on a
  click. The first case is open.
* The reasons a check gives say "polyomino" where they said "stamp" (8 texts), as the step titles and texts do since V1.0.15.
* A case that fails on a count over the whole board (walls, sizes, shapes, colours) says so: there is no single place to ring.
Usage: python3 patch_ui_V1.0.21.py glimmith_solver_V1.0.20.html glimmith_solver_V1.0.21.html"""
import sys

def rep(src, old, new):
    c = src.count(old)
    if c != 1: raise SystemExit(f'anchor found {c} times: {old[:120]}')
    return src.replace(old, new)

src = open(sys.argv[1], encoding='utf8').read()
src = rep(src, "  .example-pop .case-fail b{ color:#e5534b; }\n",
"""  .example-pop .case-fail b{ color:#e5534b; }
  .example-pop details.case-fold{ border-top:1px solid var(--seam); padding:8px 0; }
  .example-pop details.case-fold > summary{ cursor:pointer; font-size:13px; line-height:1.5; }
  .example-pop details.case-fold .ex-card{ border-top:none; padding:8px 0 0; }
""")
# ask again, deeper, when the first answer leaves cases open
src = rep(src, "      for(const ev of deduceSolve(puzzle.w, puzzle.h, ctx, collectSpecialEdges(), opts)) if(ev.type === 'cases') return ev;\n",
"""      let first = null;
      for(const ev of deduceSolve(puzzle.w, puzzle.h, ctx, collectSpecialEdges(), opts)) if(ev.type === 'cases') first = ev;
      if(!first || first.complete || first.stale) return first;
      // V1.0.21: cases left open: once more with deeper limits (a fresh context: the first run changed nothing, but it is cheap)
      const ctx2 = buildSolverContext(puzzle, bankShapesData, sizeRules, (stepsCtx && stepsCtx.hints) || { maxRegions: null, maxRegionSize: null }, banShapesData());
      let deep = null;
      for(const ev of deduceSolve(puzzle.w, puzzle.h, ctx2, collectSpecialEdges(), Object.assign({}, opts, { explain: Object.assign({}, explain, { maxDepth: 8, maxCases: 40, ms: 4000 }) }))) if(ev.type === 'cases') deep = ev;
      return deep && deep.complete ? deep : first;
""")
# a failure with no single place
src = rep(src, "      f.appendChild(document.createTextNode((why || 'the rules can not all be met') + '.'));\n",
"""      f.appendChild(document.createTextNode((why || 'the rules can not all be met') + '.'));
      if(!c.at && WHOLE_BOARD_WHY.has(c.why)) f.appendChild(document.createTextNode(' This is a count over the whole board, so there is no single place to mark.'));   // V1.0.21
""")
src = rep(src, "  // one case: its board (the tried values in red, what the rules then decide outlined), the rules in order, the reason it fails\n",
"""  const WHOLE_BOARD_WHY = new Set(['euler-count', 'colour-count', 'match-size', 'mismatch-count', 'area-count', 'rose-count', 'hetero-count', 'solitude-count', 'range-count', 'bridge-count']);   // V1.0.21
  // one case: its board (the tried values in red, what the rules then decide outlined), the rules in order, the reason it fails
""")
# only the cases that fail are listed; the ways still open get one sentence. Many cases are folded, one line each.
i = src.index("      if(!res.complete) note(st.kind === 'search'"); j = src.index("      res.cases.forEach((c, i) => { box.appendChild(caseCard(st, idx, c, i + 1, res.cases.length, fact)); shown++; });\n")
j2 = j + len("      res.cases.forEach((c, i) => { box.appendChild(caseCard(st, idx, c, i + 1, res.cases.length, fact)); shown++; });\n")
src = src[:i] + """      const failing = res.cases.filter(c => !c.open), still = res.cases.length - failing.length;      // V1.0.21
      if(!failing.length){ note('This step was proved by a longer search: trying the other value breaks no rule within a few choices, so there is no short list of cases to show.'); continue; }
      if(still) note(`${still === 1 ? 'One more way' : still + ' more ways'} to go on ${still === 1 ? 'breaks' : 'break'} no rule within a few choices: for ${still === 1 ? 'that one' : 'those'} the solver needed a longer search. The cases below are the ones that fail.`);
      failing.forEach((c, i) => {
        const card = caseCard(st, idx, c, i + 1, failing.length, fact); shown++;
        if(failing.length <= 4){ box.appendChild(card); return; }
        const d = document.createElement('details'); d.className = 'case-fold'; d.open = i === 0;                 // many cases are folded
        const sm = document.createElement('summary');
        sm.textContent = card.querySelector('.case-tried').textContent + ' ' + card.querySelector('.case-fail').textContent;
        d.append(sm, card); box.appendChild(d);
      });
""" + src[j2:]
# "stamp" -> "polyomino" in the reasons a check gives (WHY_TEXT of the page; the rule names, 'stamp-size', stay)
import re
i = src.index("  const WHY_TEXT = {"); j = src.index("\n  };", i)
def reason(line):
    m = re.match(r"^(\s*'[\w-]+': )(.*)$", line)
    if not m: return line
    v = m.group(2).replace('polyomino stamp', 'polyomino')
    v = re.sub(r'\bstamps\b', 'polyominoes', v); v = re.sub(r'\bstamp\b', 'polyomino', v)
    return m.group(1) + v
part = '\n'.join(reason(l) for l in src[i:j].split('\n'))
if 'stamp' in re.sub(r"'[\w-]+': ", '', part): raise SystemExit('a reason still says stamp')
src = src[:i] + part + src[j:]
open(sys.argv[2], 'w', encoding='utf8').write(src); print('ok', sys.argv[2])
