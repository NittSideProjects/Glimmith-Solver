#!/usr/bin/env python3
"""Page V1.0.31 -> V1.0.32: refactoring step 8, step names that follow the logic, behind a switch (off by default).
A box "Name steps by logic" in the step-by-step view: when it is ticked, a step of a shared step (forced growth, reach, closed-in
area count, placement, corner pattern: RULE_FAMILY, core v114) is titled by that step and the rule that supplied the fact
("Forced growth, from the roses"). The explanation under the title stays the rule's own. Off by default: the step titles the author
rewrote stay what the page shows until he decides; the new texts are on his rewrite list. The choice is remembered in the browser.
Usage: python3 patch_ui_V1.0.32.py glimmith_solver_V1.0.31.html glimmith_solver_V1.0.32.html"""
import sys

def rep(src, old, new, what):
    c = src.count(old)
    if c != 1: raise SystemExit(f'{what}: anchor found {c} times')
    return src.replace(old, new)

src = open(sys.argv[1], encoding='utf8').read()
src = rep(src, """        <button type="button" id="stepsLast" aria-label="Last step" title="Last step">&#x23ED;</button>
      </div>
""", """        <button type="button" id="stepsLast" aria-label="Last step" title="Last step">&#x23ED;</button>
        <label class="subtle steps-families" title="Title each step by the shared logic it uses, and the rule that gave the fact"><input type="checkbox" id="stepsFamilies"> Name steps by logic</label>
      </div>
""", 'checkbox')
src = rep(src, """    const title = info ? info[0] : 'Rule: ' + st.rule;
""", """    const title = (stepFamilies && familyTitle(st.rule)) || (info ? info[0] : 'Rule: ' + st.rule);      // V1.0.32
""", 'title')
src = rep(src, """    document.getElementById('stepsNext').addEventListener('click', () => stepsGo(stepsIdx + 1));
""", """    document.getElementById('stepsNext').addEventListener('click', () => stepsGo(stepsIdx + 1));
    { const cb = document.getElementById('stepsFamilies'); cb.checked = stepFamilies;                     // V1.0.32
      cb.addEventListener('change', () => { stepFamilies = cb.checked; try { localStorage.setItem('glimmith.stepFamilies', stepFamilies ? '1' : '0'); } catch(e){} stepsGo(stepsIdx); }); }
""", 'listener')
src = rep(src, """  const exampleTitle = key =>""", """  // V1.0.32: step names that follow the logic (refactoring step 8): the shared step + the rule that supplied the fact
  let stepFamilies = false; try { stepFamilies = localStorage.getItem('glimmith.stepFamilies') === '1'; } catch(e){}
  const FAMILY_NAMES = { grow: 'Forced growth', reach: 'Reach', region: 'Closed-in area count', place: 'Placement', corner: 'Corner pattern' };
  const SOURCE_NAMES = { 'size': 'the sizes', 'minimum': 'the Minimum', 'roses': 'the roses', 'solitude': 'Solitude', 'non-boxy': 'Non-boxy',
    'compasses': 'the compasses', 'bank': 'the shape bank', 'match': 'Match', 'piece-count': 'the number of pieces', 'region-count': 'the rules of the area',
    'area-numbers': 'the area numbers', 'polyomino': 'the polyomino', 'mismatch': 'Mismatch', 'boxy': 'Boxy', 'gemini': 'Gemini', 'mingle-area': 'Mingle Area',
    'bricky': 'Bricky', 'loopy': 'Loopy', 'palisades': 'the palisades', 'wally': 'Wally' };
  const familyTitle = tag => { const f = RULE_FAMILY[tag]; if(!f || !FAMILY_NAMES[f[0]]) return null; return `${FAMILY_NAMES[f[0]]}, from ${SOURCE_NAMES[f[1]] || f[1]}`; };
  const exampleTitle = key =>""", 'names')
open(sys.argv[2], 'w', encoding='utf8').write(src); print('ok', sys.argv[2])
