#!/usr/bin/env python3
"""Page V1.0.13 -> V1.0.14 (page only, core stays v99): the rule examples are numbered.

Every rule with an example has a number (its place in "Show all examples") in front of its title, in both pop-ups, and every board has
its own number above it: 12.1, 12.2, ... So "board 12.2" names one board. No new text.
Usage: python3 patch_ui_V1.0.14.py glimmith_solver_V1.0.13.html glimmith_solver_V1.0.14.html"""
import sys

def rep(src, old, new):
    c = src.count(old)
    if c != 1: raise SystemExit(f'anchor found {c} times: {old[:120]}')
    return src.replace(old, new)

src = open(sys.argv[1], encoding='utf8').read()
src = rep(src, "  .example-pop .ex-case svg{ max-width:100%; height:auto; }\n",
"""  .example-pop .ex-case svg{ max-width:100%; height:auto; }
  .example-pop .ex-num{ font-size:11.5px; font-weight:600; color:var(--ink-muted); font-variant-numeric:tabular-nums; }
""")
src = rep(src, "  function exampleCard(key, withTitle){\n",
"""  const exampleNumber = key => Object.keys(RULE_EXAMPLES).indexOf(key) + 1;   // V1.0.14: the same number in both pop-ups
  function exampleCard(key, withTitle){
""")
src = rep(src, "h.className = 'ex-title'; h.textContent = exampleTitle(key); card.appendChild(h); }",
               "h.className = 'ex-title'; h.textContent = exampleNumber(key) + '. ' + exampleTitle(key); card.appendChild(h); }")
src = rep(src, """    for(const [c, svg] of cases){
      const box = document.createElement('div'); box.className = 'ex-case'; box.appendChild(svg);""",
"""    for(const [c, svg] of cases){
      const box = document.createElement('div'); box.className = 'ex-case';
      const num = document.createElement('span'); num.className = 'ex-num'; num.textContent = exampleNumber(key) + '.' + (ex.x.indexOf(c) + 1); box.appendChild(num);
      box.appendChild(svg);""")
src = rep(src, "      h.textContent = exampleTitle(key);\n", "      h.textContent = (exampleNumber(key) ? exampleNumber(key) + '. ' : '') + exampleTitle(key);\n")
open(sys.argv[2], 'w', encoding='utf8').write(src); print('ok', sys.argv[2])
