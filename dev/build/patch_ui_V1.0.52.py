#!/usr/bin/env python3
"""Page V1.0.51 -> V1.0.52: solve marks.

While making a puzzle, the author often already knows some walls and links (a part he has checked, independent of the rest) and
used to draw them as puzzle walls and links to save the solver that work, then had to remove them one by one before sharing.
Now a "Solve marks" mode (button beside Clear all symbols) draws them as SOLVE MARKS instead, in their own colour (--solve):
  * in solve mode a click on a wall spot puts a wall mark there (drag to mark more, click a mark to remove it), L on a wall spot a
    link mark, Backspace / Delete removes the mark; clicks on tiles do nothing, so the puzzle itself can not be changed by mistake;
  * marks are not part of the puzzle: they are kept with the puzzle in the page (autosave, puzzle list) but never exported;
  * Check Uniqueness (and the step-by-step, its replay and Show cases) takes them as given: the solver gets the puzzle with the
    marks added as walls / links (solverPuzzle()), so it only checks the rest; the result line then says how many marks it took as
    given. A mark on a spot that gets a puzzle wall, or next to a tile that is no longer active, is dropped;
  * Clear solve marks removes them all; Reset grid too.
The solver core does not change (core v129).
Page text: new texts (button, its tooltip, the hint shown in solve mode, the key entry, the result note, a toast) go on the rewrite list.
Usage: python3 patch_ui_V1.0.52.py glimmith_solver_V1.0.51.html glimmith_solver_V1.0.52.html"""
import sys

def rep(src, old, new, what, count=1):
    c = src.count(old)
    if c != count: raise SystemExit(f'{what}: anchor found {c} times (want {count})')
    return src.replace(old, new)

src = open(sys.argv[1], encoding='utf8').read()

# ---- colours and styles
src = rep(src, "--tile:#e3e8ef; --tile-line:#c3ccd8; --empty:#fafbfc; --empty-line:#e6e9ee; --wall:#4b586a;",
               "--tile:#e3e8ef; --tile-line:#c3ccd8; --empty:#fafbfc; --empty-line:#e6e9ee; --wall:#4b586a; --solve:#13866f;", 'css light')
src = rep(src, "--tile:#2b3542; --tile-line:#3d4b5d; --empty:#161b22; --empty-line:#222a34; --wall:#c9d1dc;",
               "--tile:#2b3542; --tile-line:#3d4b5d; --empty:#161b22; --empty-line:#222a34; --wall:#c9d1dc; --solve:#45cfae;", 'css dark', 2)
src = rep(src, "  .swatch-wall{ background:var(--wall); }\n",
               "  .swatch-wall{ background:var(--wall); }\n"
               "  .swatch-solve{ background:var(--solve); }                                       /* V1.0.52: solve marks */\n"
               "  #solveModeBtn[aria-pressed=\"true\"]{ border-color:var(--solve); color:var(--solve); }\n"
               "  body.solve-mode #puzzleSvg{ outline:2px solid var(--solve); outline-offset:3px; }\n"
               "  .solve-hint{ color:var(--solve); }\n", 'css solve')

# ---- markup: buttons, hint, key
src = rep(src, """        <button id="clearMarkersBtn" class="subtle">Clear all symbols</button>
      </div>
""", """        <button id="clearMarkersBtn" class="subtle">Clear all symbols</button>
        <button id="solveModeBtn" class="subtle" aria-pressed="false" title="Mark walls and links you have already checked yourself. They are not part of the puzzle: Check Uniqueness takes them as given and only checks the rest.">Solve marks</button>
        <button id="clearSolveMarksBtn" class="subtle">Clear solve marks</button>
      </div>
""", 'buttons')
src = rep(src, """      <div class="stats" id="puzzleStats"></div>
<div class="keys">""", """      <div class="stats" id="puzzleStats"></div>
      <div class="stats solve-hint" id="solveHint" hidden>Solve marks: click a wall spot to mark a wall, press L on it to mark a link, click a mark again to remove it. Check Uniqueness takes your marks as given and only checks the rest of the puzzle.</div>
<div class="keys">""", 'hint')
src = rep(src, """        <span><span class="swatch swatch-wall"></span>wall</span>
""", """        <span><span class="swatch swatch-wall"></span>wall</span>
        <span><span class="swatch swatch-solve"></span>solve mark</span>
""", 'key')

# ---- state and helpers, after the puzzle variable
src = rep(src, """  let puzzle = { w:10, h:10, active: makeGrid(10,10,1), walls: new Map(), roses: new Map(), polyominoes: new Map(), areaNumbers: new Map(), palisades: new Map(), compasses: new Map(), watchtowers: new Map() };
""", """  let puzzle = { w:10, h:10, active: makeGrid(10,10,1), walls: new Map(), roses: new Map(), polyominoes: new Map(), areaNumbers: new Map(), palisades: new Map(), compasses: new Map(), watchtowers: new Map() };
  // V1.0.52: solve marks: walls / links the author has already checked. Not part of the puzzle (never exported); the solver takes them
  // as given (solverPuzzle). key 'v:c,r' / 'h:c,r' -> 'wall' | 'link'
  let solveMarks = new Map(), solveMode = false, paintingMarks = false, markPaintValue = null;
  function markSpotOk(key){                                           // a spot between two active tiles, with no puzzle wall on it
    const m = /^([vh]):(\\d+),(\\d+)$/.exec(key); if(!m) return false;
    const c = +m[2], r = +m[3], c2 = m[1] === 'v' ? c + 1 : c, r2 = m[1] === 'v' ? r : r + 1;
    if(c2 >= puzzle.w || r2 >= puzzle.h || !puzzle.active[r] || !puzzle.active[r2]) return false;
    return !!puzzle.active[r][c] && !!puzzle.active[r2][c2] && !puzzle.walls.has(key);
  }
  function pruneSolveMarks(){ for(const k of [...solveMarks.keys()]) if(!markSpotOk(k)) solveMarks.delete(k); }
  function solveMarksFromStored(arr){ return new Map((Array.isArray(arr) ? arr : []).filter(e => Array.isArray(e) && typeof e[0] === 'string' && (e[1] === 'wall' || e[1] === 'link'))); }
  // the puzzle as the solver gets it: the solve marks added as walls / links
  function solverPuzzle(){
    if(!solveMarks.size) return puzzle;
    const walls = new Map(puzzle.walls);
    for(const [k, t] of solveMarks) if(markSpotOk(k)) walls.set(k, t);
    return Object.assign({}, puzzle, { walls });
  }
""", 'state')

# ---- drawing: after the puzzle walls in renderPuzzle; prune first
src = rep(src, """    puzzle.walls.forEach((type, key) => appendWallBar(puzzleLayer, cs, key, 'wall'));
    puzzle.walls.forEach((type, key) => { if(type !== 'wall') appendWallBadge(puzzleLayer, cs, key, type); });
    drawWatchtowers(puzzleLayer, cs);
""", """    puzzle.walls.forEach((type, key) => appendWallBar(puzzleLayer, cs, key, 'wall'));
    puzzle.walls.forEach((type, key) => { if(type !== 'wall') appendWallBadge(puzzleLayer, cs, key, type); });
    pruneSolveMarks();
    solveMarks.forEach((type, key) => appendSolveMark(puzzleLayer, cs, key, type));
    drawWatchtowers(puzzleLayer, cs);
""", 'render marks')
src = rep(src, """  function appendWallBadge(target, cs, key, type){""", """  // V1.0.52: a solve mark, in its own colour: a wall bar (joined to puzzle walls and other wall marks) or a link bar
  function appendSolveMark(target, cs, key, type){
    const [orient, rest] = key.split(':'), [c, r] = rest.split(',').map(Number);
    if(type === 'link'){
      const len = cs * 0.5, th = Math.max(3, cs * 0.14);
      const a = orient === 'v' ? { x: (c + 1) * cs - len / 2, y: r * cs + cs / 2 - th / 2, width: len, height: th } : { x: c * cs + cs / 2 - th / 2, y: (r + 1) * cs - len / 2, width: th, height: len };
      svgEl('rect', Object.assign(a, { rx: th / 2, fill: 'var(--solve)', class: 'solve-mark' }), target);
      return;
    }
    const geo = wallJoinGeometry(cs, orient, c, r, k => isWallKey(k) || solveMarks.get(k) === 'wall');
    svgEl('rect', { x: geo.x, y: geo.y, width: geo.width, height: geo.height, rx: geo.rx, fill: 'var(--solve)', class: 'solve-mark' }, target);
  }
  function appendWallBadge(target, cs, key, type){""", 'appendSolveMark')

# ---- the puzzle signature (an edited mark closes the step view, as an edited puzzle does)
src = rep(src, """                           [...puzzle.palisades], [...puzzle.compasses], [...puzzle.watchtowers]]);
  }""", """                           [...puzzle.palisades], [...puzzle.compasses], [...puzzle.watchtowers], [...solveMarks]]);
  }""", 'puzzleSig')

# ---- mouse: solve mode
src = rep(src, """      const hit = hitTestPuzzle(x,y);
      if(!hit) return;
      if(hit.type === 'wall'){
        const key = `${hit.orient}:${hit.c},${hit.r}`;
        const hadWall = puzzle.walls.has(key);""", """      const hit = hitTestPuzzle(x,y);
      if(!hit) return;
      if(solveMode){                                                     // V1.0.52: solve marks only; the puzzle itself is not edited
        if(hit.type !== 'wall') return;
        const key = `${hit.orient}:${hit.c},${hit.r}`;
        if(!markSpotOk(key)){ showToast(puzzle.walls.has(key) ? 'This spot is part of the puzzle already' : 'A solve mark goes between two active tiles'); return; }
        markPaintValue = solveMarks.has(key) ? null : 'wall';
        paintingMarks = true; wallDragOrient = hit.orient;
        if(markPaintValue === null) solveMarks.delete(key); else solveMarks.set(key, 'wall');
        renderPuzzle();
        return;
      }
      if(hit.type === 'wall'){
        const key = `${hit.orient}:${hit.c},${hit.r}`;
        const hadWall = puzzle.walls.has(key);""", 'pointerdown')
src = rep(src, """      if(paintingWalls){
        if(hit && hit.type === 'wall'){""", """      if(paintingMarks){                                                 // V1.0.52
        if(hit && hit.type === 'wall'){
          const key = `${hit.orient}:${hit.c},${hit.r}`;
          if(markPaintValue === null && solveMarks.has(key)){ solveMarks.delete(key); renderPuzzle(); }
          else if(markPaintValue === 'wall' && !solveMarks.has(key) && markSpotOk(key)){ solveMarks.set(key, 'wall'); renderPuzzle(); }
        }
        return;
      }
      if(paintingWalls){
        if(hit && hit.type === 'wall'){""", 'pointermove')
src = rep(src, """      if(paintingWalls){ paintingWalls = false; wallDragOrient = null; scheduleSave(); }
""", """      if(paintingWalls){ paintingWalls = false; wallDragOrient = null; scheduleSave(); }
      if(paintingMarks){ paintingMarks = false; wallDragOrient = null; scheduleSave(); }
""", 'pointerup')

# ---- keyboard on a wall spot: in solve mode L = link mark, Backspace / Delete = remove the mark, other keys as usual
src = rep(src, """        const toggle = kind => {
          if(puzzle.walls.get(wallKey) === kind) puzzle.walls.delete(wallKey);
          else puzzle.walls.set(wallKey, kind);
          renderPuzzle();
          scheduleSave();
        };
""", """        const toggle = kind => {
          if(puzzle.walls.get(wallKey) === kind) puzzle.walls.delete(wallKey);
          else puzzle.walls.set(wallKey, kind);
          renderPuzzle();
          scheduleSave();
        };
        if(solveMode && (key === 'l' || key === 'backspace' || key === 'delete')){      // V1.0.52
          e.preventDefault();
          if(key === 'l'){
            if(!markSpotOk(wallKey)){ showToast(puzzle.walls.has(wallKey) ? 'This spot is part of the puzzle already' : 'A solve mark goes between two active tiles'); return; }
            if(solveMarks.get(wallKey) === 'link') solveMarks.delete(wallKey); else solveMarks.set(wallKey, 'link');
          } else solveMarks.delete(wallKey);
          renderPuzzle(); scheduleSave();
          return;
        }
""", 'keys')

# ---- buttons
src = rep(src, """    document.getElementById('clearWallsBtn').addEventListener('click', () => {""", """    const setSolveMode = on => {                                         // V1.0.52
      solveMode = !!on;
      const b = document.getElementById('solveModeBtn'); b.setAttribute('aria-pressed', String(solveMode));
      document.getElementById('solveHint').hidden = !solveMode;
      document.body.classList.toggle('solve-mode', solveMode);
    };
    document.getElementById('solveModeBtn').addEventListener('click', () => setSolveMode(!solveMode));
    document.getElementById('clearSolveMarksBtn').addEventListener('click', () => { solveMarks = new Map(); renderPuzzle(); scheduleSave(); });
    document.getElementById('clearWallsBtn').addEventListener('click', () => {""", 'button handlers')
src = rep(src, """      puzzle.areaNumbers = new Map();
      puzzle.palisades = new Map(); puzzle.compasses = new Map(); puzzle.watchtowers = new Map();
      renderPuzzle(); scheduleSave();
    });
    const setSolveMode""", """      puzzle.areaNumbers = new Map();
      puzzle.palisades = new Map(); puzzle.compasses = new Map(); puzzle.watchtowers = new Map();
      solveMarks = new Map();
      renderPuzzle(); scheduleSave();
    });
    const setSolveMode""", 'reset grid')

# ---- saving: autosave and the puzzle list keep the marks; the export leaves them out
src = rep(src, """        palisades:[...puzzle.palisades.entries()], compasses:[...puzzle.compasses.entries()], watchtowers:[...puzzle.watchtowers.entries()]
      }), false);""", """        palisades:[...puzzle.palisades.entries()], compasses:[...puzzle.compasses.entries()], watchtowers:[...puzzle.watchtowers.entries()],
        solveMarks:[...solveMarks.entries()]
      }), false);""", 'doSave')
src = rep(src, """                   palisades: areaNumbersMapFromStored(o.palisades), compasses: areaNumbersMapFromStored(o.compasses), watchtowers: areaNumbersMapFromStored(o.watchtowers) };
      }""", """                   palisades: areaNumbersMapFromStored(o.palisades), compasses: areaNumbersMapFromStored(o.compasses), watchtowers: areaNumbersMapFromStored(o.watchtowers) };
        solveMarks = solveMarksFromStored(o.solveMarks);
      }""", 'loadState')
src = rep(src, """      shapeBank: bank, banShapes: banShapes, sizeRules: sizeRules,
      solverLimits: { maxRegions: limitCountInput.value || null, maxRegionSize: limitSizeInput.value || null }
    }));
  }""", """      shapeBank: bank, banShapes: banShapes, sizeRules: sizeRules,
      solverLimits: { maxRegions: limitCountInput.value || null, maxRegionSize: limitSizeInput.value || null },
      solveMarks: [...solveMarks.entries()]
    }));
  }""", 'liveSnapshot')
src = rep(src, """               watchtowers: areaNumbersMapFromStored(o.watchtowers) };
    bank = Array.isArray(st.shapeBank) ? st.shapeBank : [];""", """               watchtowers: areaNumbersMapFromStored(o.watchtowers) };
    solveMarks = solveMarksFromStored(st.solveMarks);                  // V1.0.52
    bank = Array.isArray(st.shapeBank) ? st.shapeBank : [];""", 'applyState')
src = rep(src, """      puzzles: items.map(it => { const o = { name: it.name, state: it.state };""", """      puzzles: items.map(it => { const st = Object.assign({}, it.state); delete st.solveMarks; const o = { name: it.name, state: st };  /* V1.0.52: solve marks stay in the page */""", 'export')

# ---- the solver gets the marks: Solve run, replay, Show cases
src = rep(src, """    const src = solverSource({ w: puzzle.w, h: puzzle.h, puzzle, bank: bankShapesData, rules: sizeRules, hints: limits.hints,""",
               """    const marksUsed = solveMarks.size;                                  // V1.0.52: the solve marks go in as walls / links
    const src = solverSource({ w: puzzle.w, h: puzzle.h, puzzle: solverPuzzle(), bank: bankShapesData, rules: sizeRules, hints: limits.hints,""", 'runDeduce puzzle')
src = rep(src, """    const src = solverSource({ w: puzzle.w, h: puzzle.h, puzzle, bank: bankShapesData, rules: sizeRules, hints: stepsCtx.hints""",
               """    const src = solverSource({ w: puzzle.w, h: puzzle.h, puzzle: solverPuzzle(), bank: bankShapesData, rules: sizeRules, hints: stepsCtx.hints""", 'replay puzzle')
src = rep(src, """buildSolverContext(puzzle, bankShapesData, sizeRules, (stepsCtx && stepsCtx.hints) || { maxRegions: null, maxRegionSize: null }, banShapesData());""",
               """buildSolverContext(solverPuzzle(), bankShapesData, sizeRules, (stepsCtx && stepsCtx.hints) || { maxRegions: null, maxRegionSize: null }, banShapesData());""", 'show cases', 2)
src = rep(src, """    finishSolver(outcome, solutions, findAll);
""", """    finishSolver(outcome, solutions, findAll);
    if(marksUsed && outcome !== 'cancelled')                             // V1.0.52
      setSolverStatus(document.getElementById('solverStatus').textContent + (marksUsed === 1 ? ' Your solve mark was taken as given: this holds if it is right.' : ` Your ${marksUsed} solve marks were taken as given: this holds if they are right.`));
""", 'result note')
src = rep(src, """      if(right !== undefined && right !== a && !puzzle.walls.has(`v:${c},${r}`) && !have.has(`v:${c},${r}`)){""",
               """      if(right !== undefined && right !== a && !puzzle.walls.has(`v:${c},${r}`) && !solveMarks.has(`v:${c},${r}`) && !have.has(`v:${c},${r}`)){""", 'final paint v')
src = rep(src, """      if(down !== undefined && down !== a && !puzzle.walls.has(`h:${c},${r}`) && !have.has(`h:${c},${r}`)){""",
               """      if(down !== undefined && down !== a && !puzzle.walls.has(`h:${c},${r}`) && !solveMarks.has(`h:${c},${r}`) && !have.has(`h:${c},${r}`)){""", 'final paint h')

# ---- the step view: marks are given (like puzzle walls / links) and drawn in their colour
src = rep(src, """    for(const [k, t] of puzzle.walls) if(t === 'link'){ const [a, b] = tilesOf(k); join(a, b); }""",
               """    for(const [k, t] of solverPuzzle().walls) if(t === 'link'){ const [a, b] = tilesOf(k); join(a, b); }""", 'steps links')
src = rep(src, """    for(const [k, t] of puzzle.walls) (t === 'link' ? links : walls).add(k);""",
               """    for(const [k, t] of solverPuzzle().walls) (t === 'link' ? links : walls).add(k);""", 'split steps')
src = rep(src, """    const w = puzzle.w, h = puzzle.h, walls = new Set([...puzzle.walls].filter(([k, t]) => t !== 'link').map(([k]) => k)), links = new Set([...puzzle.walls].filter(""",
               """    const givenW = solverPuzzle().walls, w = puzzle.w, h = puzzle.h, walls = new Set([...givenW].filter(([k, t]) => t !== 'link').map(([k]) => k)), links = new Set([...givenW].filter(""", 'closed pieces')
src = rep(src, """    for(const [k, t] of puzzle.walls) if(t === 'link'){ const [a, b] = tiles(k); join(a, b, true); }""",
               """    for(const [k, t] of solverPuzzle().walls) if(t === 'link'){ const [a, b] = tiles(k); join(a, b, true); }""", 'group colours')
src = rep(src, """    stepHasWall = k => isWallKey(k) || v.walls.has(k) || !!(v.searchWalls && v.searchWalls.has(k));
    puzzle.walls.forEach((type, key) => appendWallBar(svg, cs, key, 'wall', stepHasWall));""",
               """    stepHasWall = k => isWallKey(k) || solveMarks.get(k) === 'wall' || v.walls.has(k) || !!(v.searchWalls && v.searchWalls.has(k));
    puzzle.walls.forEach((type, key) => appendWallBar(svg, cs, key, 'wall', stepHasWall));
    solveMarks.forEach((type, key) => appendSolveMark(svg, cs, key, type));                  // V1.0.52""", 'step draw')
open(sys.argv[2], 'w', encoding='utf8').write(src); print('ok', sys.argv[2])
