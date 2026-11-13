#!/usr/bin/env python3
"""Page V1.0.4 -> V1.0.5: embedded core v97 (gemini-anchor, see patch_core97.py) + its step text and Gemini rule-info point;
custom rules read from the workshop description (Wally, Heterogeneous; NOT Links / Omits: they depend on the grid / on shapes the text
can not give) with a pop-up saying so after the import.
Usage: python3 patch_ui_V1.0.5.py glimmith_solver_V1.0.4.html glimmith_solver_V1.0.5.html
       python3 patch_ui_V1.0.5.py --import-core dev/reference/import-core.js     (patches the reference import core in place)"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from patch_core97 import patch as core_patch

IMP_OLD = """    // V1.0.4: the game's files have no line for Wally; workshop puzzles name it in their title or description ("Special Rule: Wally - ...")
    if(meta && /\\bwally\\b/i.test((meta.name || '') + ' ' + (meta.description || ''))) parsed.state.sizeRules = Object.assign({}, parsed.state.sizeRules, { wally: true });
    items.push({ name: (meta && meta.name) || fallback, author: (meta && meta.author) || '', description: (meta && meta.description) || '',"""
IMP_NEW = """    // V1.0.4 / V1.0.5: the game's files have no line for the custom rules; workshop puzzles name them in their title or description
    // ("Special Rule: Wally - ..."). Only rules that are a plain switch are read this way: Links and Omits depend on the grid / on shapes.
    const assumedRules = [];
    if(meta){
      const txt = (meta.name || '') + ' ' + (meta.description || '');
      for(const [key, label, re] of IMPORT_TEXT_RULES) if(re.test(txt) && !parsed.state.sizeRules[key]){ parsed.state.sizeRules = Object.assign({}, parsed.state.sizeRules, { [key]: true }); assumedRules.push(label); }
    }
    items.push({ name: (meta && meta.name) || fallback, author: (meta && meta.author) || '', description: (meta && meta.description) || '', assumedRules,"""
TBL_OLD = "// workshop \"metadata\": 20 header bytes"
TBL_NEW = """// V1.0.5: custom rules a workshop description can switch on: [sizeRules key, name shown, pattern]
const IMPORT_TEXT_RULES = [['wally', 'Wally', /\\bwally\\b/i], ['heterogeneous', 'Heterogeneous', /\\bheterogene(ous|ity)\\b/i]];

// workshop "metadata": 20 header bytes"""

def rep(src, old, new):
    c = src.count(old)
    if c != 1: raise SystemExit(f'anchor found {c} times: {old[:120]}')
    return src.replace(old, new)
indent = lambda t, ind: '\n'.join(ind + l if l else l for l in t.split('\n'))

if sys.argv[1] == '--import-core':
    p = sys.argv[2]; s = open(p, encoding='utf8').read(); s = rep(s, IMP_OLD, IMP_NEW); s = rep(s, TBL_OLD, TBL_NEW)
    open(p, 'w', encoding='utf8').write(s); print('ok', p); sys.exit()

src = open(sys.argv[1], encoding='utf8').read()
a = src.index('  // ================= SOLVER CORE (pure'); b = src.index('  // ================= IMPORT CORE (pure')
src = src[:a] + core_patch(src[a:b], '  ') + src[b:]
src = rep(src, indent(IMP_OLD, '  '), indent(IMP_NEW, '  '))
src = rep(src, indent(TBL_OLD, '  '), indent(TBL_NEW, '  '))
# step text + rule info
src = rep(src, """    'gemini-place': ['Gemini / Delta: the shapes on both sides',""",
"""    'gemini-anchor': ['Gemini: the one line that can match', null, 'Both pieces of the Gemini wall have a closed straight line of the same length, and one of them can not make a second one. Turning or mirroring one shape onto the other must therefore send line onto line: of those few ways, only the ones left after copying the known tiles across agree that this is a wall.', 'Both pieces of the Gemini wall have a closed straight line of the same length, and one of them can not make a second one. Turning or mirroring one shape onto the other must therefore send line onto line: of those few ways, only the ones left after copying the known tiles across agree that these tiles are one piece.'],
    'gemini-place': ['Gemini / Delta: the shapes on both sides',""")
src = rep(src, "If the shape on one side contains a 1x4, the other side needs one too.</li></ol>",
"If the shape on one side contains a 1x4, the other side needs one too.</li><li><b>Lines anchor the copy.</b> When both sides have a closed straight line of the same length and one side can not make a second one, the copy must send line onto line: only 4 ways are left (two directions, two mirrors). The solver copies the known tiles and walls across each way, and the ways that break are dropped.</li></ol>")
# the pop-up
src = rep(src, "  .toast.show{ opacity:1; transform:translateY(0); }\n",
"""  .toast.show{ opacity:1; transform:translateY(0); }
  .assumed-pop{ position:fixed; inset:0; background:rgba(0,0,0,.45); display:flex; align-items:center; justify-content:center; z-index:60; }
  .assumed-pop .box{ background:var(--panel); border:1px solid var(--amber); color:var(--ink); border-radius:10px; padding:18px 20px; max-width:460px; font-size:14px; line-height:1.45; box-shadow:0 10px 30px rgba(0,0,0,.4); }
  .assumed-pop ul{ margin:8px 0 12px 18px; padding:0; max-height:220px; overflow:auto; }
  .assumed-pop button{ margin-top:4px; }
""")
src = rep(src, "  let importing = false;\n  async function importFiles(fileList, preInputs){",
"""  // V1.0.5: puzzles whose description named a custom rule, which the import switched on
  function showAssumedRules(list){
    const old = document.getElementById('assumedPop'); if(old) old.remove();
    const pop = document.createElement('div'); pop.id = 'assumedPop'; pop.className = 'assumed-pop';
    const box = document.createElement('div'); box.className = 'box'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true');
    const p = document.createElement('p'); p.style.margin = '0';
    const join = a => a.length === 1 ? a[0] : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1];
    if(list.length === 1){
      const it = list[0], many = it.assumedRules.length > 1;
      p.textContent = `“${it.name}” says ${join(it.assumedRules)} in its description, so we assumed it uses ${many ? 'those custom rules' : 'that custom rule'} and turned ${many ? 'them' : 'it'} on.`;
      box.appendChild(p);
    } else {
      p.textContent = `${list.length} puzzles name a custom rule in their description, so we assumed they use it and turned it on:`;
      box.appendChild(p);
      const ul = document.createElement('ul');
      list.forEach(it => { const li = document.createElement('li'); li.textContent = `${it.name}: ${join(it.assumedRules)}`; ul.appendChild(li); });
      box.appendChild(ul);
    }
    const ok = document.createElement('button'); ok.type = 'button'; ok.className = 'primary'; ok.id = 'assumedPopOk'; ok.textContent = 'OK';
    const close = () => { pop.remove(); document.removeEventListener('keydown', onKey, true); };
    const onKey = ev => { if(ev.key === 'Escape' || ev.key === 'Enter'){ ev.preventDefault(); ev.stopPropagation(); close(); } };
    ok.addEventListener('click', close); pop.addEventListener('click', ev => { if(ev.target === pop) close(); });
    document.addEventListener('keydown', onKey, true);
    box.appendChild(ok); pop.appendChild(box); document.body.appendChild(pop); ok.focus();
  }
  let importing = false;
  async function importFiles(fileList, preInputs){""")
src = rep(src, "      if(!lines.length) lines.push({ text: 'No problems.', bad: false });\n      showImportReport('Import report: ' + bits.join(', '), lines);\n",
"""      const assumed = fresh.filter(it => it.assumedRules && it.assumedRules.length);
      assumed.forEach(it => lines.push({ text: `${it.name}: ${it.assumedRules.join(', ')} switched on (named in its description)`, bad: false }));
      if(!lines.length) lines.push({ text: 'No problems.', bad: false });
      showImportReport('Import report: ' + bits.join(', '), lines);
      if(assumed.length) showAssumedRules(assumed);
""")
open(sys.argv[2], 'w', encoding='utf8').write(src); print('ok', sys.argv[2])
