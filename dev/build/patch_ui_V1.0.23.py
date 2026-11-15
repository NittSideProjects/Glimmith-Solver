#!/usr/bin/env python3
"""Page V1.0.22 -> V1.0.23 (page only, core stays v103): the never-shown solver texts leave the page (author: [remove]).

The author asked to remove the texts that never show, and to keep the solver logic behind them (the solver may use it):
* Solver limits ("Max region amount / size"): their inputs were hidden since V1. The inputs, their labels and every message about
  limits go ("with your limits: ...", "limits: ...", "Under your limits ...", "This assumes your limits ...", the "must be a
  number" warning). The values a puzzle file may carry (solverLimits) are still read, saved and given to the solver as hints.
* The hidden "Solver tuning" panel and its "Exact solver only" switch: gone. The solver runs with the settings the panel had
  (narrow search 100 ms, grow outward, keep going round, nearest the clues first, edge search with the whole-piece fallback, test
  only the opposite side once a tiling is found). The page's own exact-only run (runSolver, "Searching... nodes explored") goes with
  the switch; the exact search itself stays in the solver.
* "Search limit reached ...": the solver has no node limit (NODE_BUDGET = 0), so that message never showed. Gone.
Usage: python3 patch_ui_V1.0.23.py glimmith_solver_V1.0.22.html glimmith_solver_V1.0.23.html"""
import sys

def rep(src, old, new):
    c = src.count(old)
    if c != 1: raise SystemExit(f'anchor found {c} times: {old[:120]}')
    return src.replace(old, new)
def cut(src, start, end, keep_end=True):
    if src.count(start) != 1: raise SystemExit('cut start: ' + start[:80])
    i = src.index(start); j = src.index(end, i)
    return src[:i] + src[j if keep_end else j + len(end):]

src = open(sys.argv[1], encoding='utf8').read()
# ---- markup ----
src = cut(src, '    <div class="controls limits-row" style="display:none" hidden>\n', '    <div class="controls">\n      <button id="solveBtn"')
src = cut(src, '        <details class="debug" id="solverTuning" hidden style="display:none">\n', '    </details>\n', keep_end=False)
# ---- limits: kept as values (from puzzle files), no inputs, no messages ----
src = rep(src, "  const limitSizeInput = document.getElementById('maxRegionSizeInput');\n  const limitCountInput = document.getElementById('maxRegionCountInput');\n",
"""  // V1.0.23: the solver limits have no inputs any more; a puzzle file may still carry them (solverLimits): they are kept here and
  // given to the solver as hints
  const limitBox = () => ({ value: '', disabled: false, setAttribute(){}, removeAttribute(){}, addEventListener(){} });
  const limitSizeInput = limitBox(), limitCountInput = limitBox();
""")
src = rep(src, """  function parseLimitInput(input, label){
    const raw = input.value.trim();
    input.removeAttribute('aria-invalid');
    if(raw === '') return { value: null };
    if(!/^\\d+$/.test(raw) || Number(raw) < 1){
      input.setAttribute('aria-invalid', 'true');
      showToast(`${label} must be a number (or empty for no limit)`);
      return { error: true };
    }
    return { value: Number(raw) };
  }""", """  function parseLimitInput(input){
    const raw = String(input.value).trim();
    return { value: /^\\d+$/.test(raw) && Number(raw) >= 1 ? Number(raw) : null };
  }""")
src = rep(src, """    const n = parseLimitInput(limitCountInput, 'Max region amount');
    const s = parseLimitInput(limitSizeInput, 'Max region size');
    if(n.error || s.error) return null;
    const parts = [];
    if(n.value !== null) parts.push(`max region amount ${n.value}`);
    if(s.value !== null) parts.push(`max region size ${s.value}`);
    return { hints: { maxRegions: n.value, maxRegionSize: s.value }, text: parts.join(', ') };""",
"""    const n = parseLimitInput(limitCountInput), s = parseLimitInput(limitSizeInput);
    return { hints: { maxRegions: n.value, maxRegionSize: s.value }, text: '' };""")
src = rep(src, "    ['testMsInput','restartSel','orderSel','focusSel','nearShareInput','witnessChk','exactOnlyChk','exactSel'].forEach(id => { document.getElementById(id).disabled = disabled; });\n", "")
src = rep(src, "    setSolverStatus('Solver: preparing…' + (limits.text ? ` (with your limits: ${limits.text})` : ''));", "    setSolverStatus('Solver: preparing…');")
src = rep(src, "      const lim = limits.text ? `limits: ${limits.text} · ` : '';\n", "      const lim = '';\n")
src = rep(src, """    const underLimits = runLimitsText ? ` Under your limits (${runLimitsText}) only: if one of them is wrong this may be false — clear the limits to be sure.` : '';
    const assuming = runLimitsText ? ` This assumes your limits (${runLimitsText}) are correct.` : '';
""", "    const underLimits = '', assuming = '';\n")
# ---- the never-reached search limit ----
src = rep(src, """    if(outcome === 'budget'){
      setSolverStatus(`Search limit reached (${lastNodes.toLocaleString()} nodes${pctNote()}) before finishing — can't confirm uniqueness. Try a smaller grid, a narrower size rule, shapes in the bank, or a max region size / amount.`);
      if(solutions.length>0) solutions.slice(0,2).forEach((p,i) => addSolutionCard(p, `Found so far ${i+1}`, 420));
      return;
    }
""", "")
# ---- the tuning panel's settings, fixed ----
i = src.index("  function readDeduceSettings(){"); j = src.index("  // resolves after the browser has painted", i)
src = src[:i] + """  function readDeduceSettings(){                                      // V1.0.23: the settings the hidden tuning panel had
    return { testMs: 100, restart: 'continue', order: 'clues', focusMode: 'near', nearShare: 0.4, useWitness: true, exact: 'edge', portfolio: undefined };
  }
""" + src[j:]
# ---- the exact-only run ----
i = src.index("  async function runSolver(){"); j = src.index("    finishSolver(outcome, solutions, findAll);\n  }\n", i) + len("    finishSolver(outcome, solutions, findAll);\n  }\n")
src = src[:i] + src[j:]
src = rep(src, "document.getElementById('solveBtn').addEventListener('click', () => { if(document.getElementById('exactOnlyChk').checked) runSolver(); else runDeduce(); });",
               "document.getElementById('solveBtn').addEventListener('click', () => runDeduce());")
for w in ('maxRegionCountInput', 'solverTuning', 'exactOnlyChk', 'testMsInput', 'runSolver', 'with your limits', 'Under your limits', 'Search limit reached', 'Max region amount', 'Searching… ${', 'narrow search time must'):
    if w in src: raise SystemExit('left over: ' + w)
open(sys.argv[2], 'w', encoding='utf8').write(src); print('ok', sys.argv[2])
