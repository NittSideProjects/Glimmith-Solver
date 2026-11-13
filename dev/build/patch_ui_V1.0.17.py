#!/usr/bin/env python3
"""Page V1.0.16 -> V1.0.17: embedded core v100 (see patch_core100.py): the experimental "buffer guess layer" for compass puzzles
is removed, in the solver and on the page.

On the page: the "Solve with buffer guess layer (experimental)" button and its row (shown under the solver buttons when the puzzle
had a compass), the three red entries of the legend, the red layers of the board overlay, the code that ran the layer and drew the
red marks (runGuessLayer, dedAddRed, updateGuessRow, redEls) and their styles. A normal solve is unchanged.
Usage: python3 patch_ui_V1.0.17.py glimmith_solver_V1.0.16.html glimmith_solver_V1.0.17.html"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from patch_core100 import patch as core_patch
src = open(sys.argv[1], encoding='utf8').read()
a = src.index('  // ================= SOLVER CORE (pure'); b = src.index('  // ================= IMPORT CORE (pure')
src = src[:a] + core_patch(src[a:b], '  ') + src[b:]

def rep(src, old, new=''):
    c = src.count(old)
    if c != 1: raise SystemExit(f'anchor found {c} times: {old[:120]}')
    return src.replace(old, new)
def cut(src, start, end):                      # from the line that starts with `start` up to (not including) the line that starts with `end`
    if src.count(start) != 1 or src.count(end) != 1: raise SystemExit(f'cut anchors: {start[:80]} / {end[:80]}')
    i = src.index(start); j = src.index(end)
    if j < i: raise SystemExit('cut order')
    return src[:i] + src[j:]

# styles
src = rep(src, """  .swatch-dedred{ background: linear-gradient(#ff9a9a,#e03a3a); }
  .swatch-dedredlight{ background: #ffc2c2; height:8px; margin-top:3px; }
  .swatch-dedwrong{ background: transparent; border:2px dashed #e03a3a; }
""")
src = rep(src, """  #deduceLegend .guess-legend{ display:none; }
  #deduceLegend[data-guess] .guess-legend{ display:inline-flex; align-items:center; gap:6px; }
  .guess-row{ align-items:center; gap:8px; }
  .guess-row[hidden]{ display:none; }
  .guess-note{ margin-top:6px; font-size:12.5px; line-height:1.5; color: var(--ink-muted); }
""")
# markup
src = cut(src, '    <div class="controls guess-row" id="guessRow" hidden>', '        <details class="debug" id="solverTuning"')
src = rep(src, """      <span class="guess-legend"><span class="swatch swatch-dedred"></span>rough guess (may be wrong)</span>
      <span class="guess-legend"><span class="swatch swatch-dedredlight"></span>follows from the guesses</span>
      <span class="guess-legend"><span class="swatch swatch-dedwrong"></span>guess the final tiling did not use</span>
""")
# code
src = rep(src, "  function renderPuzzle(){\n    updateGuessRow();\n", "  function renderPuzzle(){\n")
src = rep(src, "    document.getElementById('guessBtn').disabled = disabled;\n")
src = rep(src, '<g class="ded-walls"></g><g class="ded-red-links"></g><g class="ded-red-walls"></g><g class="ded-probe-layer"></g>', '<g class="ded-walls"></g><g class="ded-probe-layer"></g>')
src = rep(src, "    delete document.getElementById('deduceLegend').dataset.guess;\n    redEls = new Map();\n")
src = rep(src, "  let redEls = new Map();                 // v38: key -> the red element on the grid (guess layer)\n")
src = cut(src, "  // ================= v38: BUFFER GUESS LAYER (experimental) =================", "  // ================= v47: STEP-BY-STEP REASONING VIEWER")
src = rep(src, "    document.getElementById('guessBtn').addEventListener('click', () => { runGuessLayer(); });\n    updateGuessRow();\n")
ui = src[:src.index('  // ================= SOLVER CORE (pure')] + src[src.index('  // ================= IMPORT CORE (pure'):]   # the page without the core
for w in ('guessBtn', 'guessRow', 'runGuessLayer', 'updateGuessRow', 'dedAddRed', 'redEls', 'guess-legend', 'guess-row', 'swatch-dedred', 'ded-red', 'guessLayer', "'sketch", 'guess-done', 'guess layer'):
    if w in ui: raise SystemExit('left over on the page: ' + w + ' ... ' + ui[max(0, ui.index(w) - 200):ui.index(w) + 100])
open(sys.argv[2], 'w', encoding='utf8').write(src); print('ok', sys.argv[2])
