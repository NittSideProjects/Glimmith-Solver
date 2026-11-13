#!/usr/bin/env python3
"""Page V1.0.3 -> V1.0.4 (core unchanged, v96):
  * import: a puzzle whose workshop title or description names Wally ("Special Rule: Wally - ...") gets Wally switched on. The game's
    files have no line for it, so before this a Fast import / Import of a workshop Wally puzzle was solved WITHOUT Wally (Doubt & Certainty:
    7 walls + 7 links instead of 63 + 53 before the narrow searches). Same change in dev/reference/import-core.js (--core-only).
  * no more blinking: the edge under a narrow search is no longer drawn (it changed every few ms, also during the final stage, where
    the narrow searches take turns with the exact search); the status line still counts the tests. The progress bar's 'indeterminate'
    class is only set when it is not there yet (it was set again on every paint).
Usage: python3 patch_ui_V1.0.4.py glimmith_solver_V1.0.3.html glimmith_solver_V1.0.4.html
       python3 patch_ui_V1.0.4.py --import-core dev/reference/import-core.js     (patches the reference import core in place)"""
import sys

IMP_OLD = """    items.push({ name: (meta && meta.name) || fallback, author: (meta && meta.author) || '', description: (meta && meta.description) || '',"""
IMP_NEW = """    // V1.0.4: the game's files have no line for Wally; workshop puzzles name it in their title or description ("Special Rule: Wally - ...")
    if(meta && /\\bwally\\b/i.test((meta.name || '') + ' ' + (meta.description || ''))) parsed.state.sizeRules = Object.assign({}, parsed.state.sizeRules, { wally: true });
""" + IMP_OLD

def rep(src, old, new):
    c = src.count(old)
    if c != 1: raise SystemExit(f'anchor found {c} times: {old[:120]}')
    return src.replace(old, new)

if sys.argv[1] == '--import-core':
    p = sys.argv[2]; s = open(p, encoding='utf8').read(); open(p, 'w', encoding='utf8').write(rep(s, IMP_OLD, IMP_NEW)); print('ok', p); sys.exit()

src = open(sys.argv[1], encoding='utf8').read()
ind = '  '
src = rep(src, '\n'.join(ind + l for l in IMP_OLD.split('\n')), '\n'.join(ind + l if l else l for l in IMP_NEW.split('\n')))
src = rep(src, """          case 'testing':
            st.open = value.open; st.walls = value.walls; st.links = value.links;
            dedSetProbe(value.spot, value.assume);
""", """          case 'testing':
            st.open = value.open; st.walls = value.walls; st.links = value.links;
            // V1.0.4: the edge under test is no longer drawn (it changed every few ms: blinking)
""")
src = rep(src, "        else { bar.classList.add('indeterminate'); fill.style.width = ''; }",
               "        else if(!bar.classList.contains('indeterminate')){ bar.classList.add('indeterminate'); fill.style.width = ''; }   // V1.0.4: not re-set every paint")
open(sys.argv[2], 'w', encoding='utf8').write(src); print('ok', sys.argv[2])
