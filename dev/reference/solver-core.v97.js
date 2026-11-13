// ================= SOLVER CORE (pure, unit-tested separately; v97 (V1.0.5) = v96 + gemini-anchor; v96 (V1.0.3) = v95 + wally-ends; v95 (V1.0.2) = v94 + propagation steps fastest first; v94 (V1.0.1) = v93 + wally-line; v93 = v92 + fact events; v92 = v91 + clue grouping; v91 = v90 + Wally counts the outline (no T tetromino); v90 = v89 + Links / Heterogeneous (custom rules); v89 = v88 + Wally (custom rule); v88 = v87 + cross-mark / tight-space pair probes; v87 = v86 + cross / pair probes; v86 = v85 + boxy-place after area-rel; v85 = v84 + boxy-place locks / whole sets; v84 = v83 + match-hole; v83 = v82 + match-anchor (palisades, area numbers); v82 = v78 + match-compass (v79-v81 parked); v78 = v77 + two-piece DP; v77 = v76 + area-join; v76 = v75 + gemini copy; v75 = v74 + place-probe; v74 = v73 + match-cover sees plain walls; v73 = v72 + box-shapes / box-all; v72 = v71 + closed pieces for size separation; v71 = v70 + scan time-out run; v70 = v69 + match-cover; v69 = v68 + compass half-board cap; v68 = v67 + palisade dead ends in reach; v67 = v66 + compass strip count; v66 = v65 + region-merge; v65 = v64 + exact compass minimum, minimums fill the board; v64 = v63 + gemini-place; v63 = v62 + hall cache, size 7; v62 = v61 + size count; v61 = v60 + cmp-box; v60 = v59 + mismatch-hall; v59 = v58 + box-hall; v58 = v57 + region labels; v57 = v56 + rose-cover; v56 = v55 + diff-small; v55 = v54 + diff-clash / closed-size; v54 = v53 + cmp-budget; v53 = v52 + rose-cut; v52 = v50 + mingle-area-pocket / place / connect; v28 = v27 + chain / parity / budget facts for the walls that compare sizes; v27 = v26 + area number deduction; v25 = v24 + Match / Mismatch deduction rules; v24 = v23 + Mingle Area / Mingle Shape deduction rules; v23 = v22 + rose / polyomino deduction rules) =================

// ---- shape symmetry helpers ----

function normalizeCells(cells){
  const minX = Math.min(...cells.map(p => p[0]));
  const minY = Math.min(...cells.map(p => p[1]));
  return cells.map(([x,y]) => [x-minX, y-minY]);
}

function cellsKey(cells){
  return cells.map(([x,y]) => `${x},${y}`).sort().join('|');
}

const TRANSFORMS = [
  ([x,y]) => [x,y],
  ([x,y]) => [-y,x],
  ([x,y]) => [-x,-y],
  ([x,y]) => [y,-x],
  ([x,y]) => [-x,y],
  ([x,y]) => [y,x],
  ([x,y]) => [x,-y],
  ([x,y]) => [-y,-x],
];

// all distinct orientations (rotations + reflections) of a shape, normalized to (0,0)-anchored bounding box
function shapeOrientations(cells){
  const seen = new Map();
  for(const t of TRANSFORMS){
    const transformed = normalizeCells(cells.map(t));
    const key = cellsKey(transformed);
    if(!seen.has(key)) seen.set(key, transformed);
  }
  return [...seen.values()];
}

// a single canonical key identifying the shape's equivalence class under rotation/reflection
function canonicalShapeKey(cells){
  const keys = TRANSFORMS.map(t => cellsKey(normalizeCells(cells.map(t))));
  keys.sort();
  return keys[0];
}

// ---- on-demand candidate generation ----
//
// Rather than pre-enumerating every possible piece placement across the whole board
// (which can explode combinatorially for free-form shapes with a large size rule, even
// though the actual grid/walls would reject almost all of them), candidates are generated
// only for the one cell the search is currently trying to cover, scoped to the cells that
// are still free at that point in the search. Most branches die quickly once walls or
// already-placed pieces shrink the remaining region, so the search naturally avoids ever
// materializing the vast majority of "in principle possible" shapes.

// Redelmeier-style enumeration: every connected cell-set of exactly `size` that contains
// every cell in `initialCells` (which must already be mutually connected to each other),
// using only cells accepted by isValidCell and edges accepted by edgeAllowed. Binary
// include/exclude branching on the frontier (with a persisted exclusion set) means each
// connected region is generated exactly once, with no duplicates.
// mustContain (optional, 'c,r' key): only regions that include that cell are produced. Growth is pruned as soon as the
// cell can no longer be reached with the cells still to be added, so this stays cheap even when most regions miss it.
function* enumerateConnectedSubsetsFrom(initialCells, size, isValidCell, edgeAllowed, tick, mustContain, partialOk){
  for(const cell of initialCells){ if(!isValidCell(cell[0], cell[1])) return; }
  if(initialCells.length > size) return;
  if(partialOk && !partialOk(initialCells, size)) return;
  const mustKey = mustContain || null;

  function neighborsOf([c,r]){ return [[c+1,r],[c-1,r],[c,r+1],[c,r-1]]; }
  function key([c,r]){ return c+','+r; }

  function checkNoWraparoundBlock(cellsList, cellsSet){
    // The growth path only guarantees connectivity via SOME allowed edge; it says nothing
    // about other pairs of cells that end up geometrically adjacent in the finished shape
    // (e.g. a square whose growth path went around three sides can still "wrap around" a
    // wall blocking the fourth side). Reject any candidate with two adjacent cells that
    // have a blocked edge between them, regardless of which edges were used to connect it.
    for(const [c,r] of cellsList){
      const rk = key([c+1,r]);
      if(cellsSet.has(rk) && !edgeAllowed(c,r,c+1,r)) return false;
      const dk = key([c,r+1]);
      if(cellsSet.has(dk) && !edgeAllowed(c,r,c,r+1)) return false;
    }
    return true;
  }

  if(initialCells.length === size){
    const cellsSet = new Set(initialCells.map(key));
    if(mustKey && !cellsSet.has(mustKey)) return;
    if(checkNoWraparoundBlock(initialCells, cellsSet)) yield initialCells.slice();
    return;
  }

  // can the required cell still be reached by adding at most `budget` more cells (never through excluded cells)?
  function canReach(cellsSet, excludedSet, budget){
    let layer = Array.from(cellsSet);
    const seen = new Set(layer);
    for(let d = 1; d <= budget; d++){
      const next = [];
      for(const k of layer){
        const [c,r] = k.split(',').map(Number);
        for(const [nc,nr] of [[c+1,r],[c-1,r],[c,r+1],[c,r-1]]){
          const nk = nc+','+nr;
          if(seen.has(nk) || excludedSet.has(nk)) continue;
          if(!isValidCell(nc,nr) || !edgeAllowed(c,r,nc,nr)) continue;
          if(nk === mustKey) return true;
          seen.add(nk); next.push(nk);
        }
      }
      if(next.length === 0) return false;
      layer = next;
    }
    return false;
  }

  function discoverNewNeighbors(cell, cellsSet, frontierSet, excludedSet){
    const found = [];
    for(const nb of neighborsOf(cell)){
      if(!isValidCell(nb[0], nb[1])) continue;
      if(!edgeAllowed(cell[0], cell[1], nb[0], nb[1])) continue;
      const k = key(nb);
      if(cellsSet.has(k) || frontierSet.has(k) || excludedSet.has(k)) continue;
      found.push(nb);
    }
    return found;
  }

  function* recurse(cellsList, cellsSet, frontierList, frontierSet, excludedSet){
    if(tick) tick();
    if(mustKey && !cellsSet.has(mustKey) && !canReach(cellsSet, excludedSet, size - cellsList.length)) return;
    if(partialOk && !partialOk(cellsList, size, k => excludedSet.has(k))) return;
    if(cellsList.length === size){
      if(mustKey && !cellsSet.has(mustKey)) return;
      if(checkNoWraparoundBlock(cellsList, cellsSet)) yield cellsList.slice();
      return;
    }
    if(frontierList.length === 0) return;
    const c = frontierList[0];
    const ck = key(c);
    const restList = frontierList.slice(1);
    const restSet = new Set(frontierSet); restSet.delete(ck);

    const newCellsList = cellsList.concat([c]);
    const newCellsSet = new Set(cellsSet); newCellsSet.add(ck);
    const newFound = discoverNewNeighbors(c, newCellsSet, restSet, excludedSet);
    const newFrontierList = restList.concat(newFound);
    const newFrontierSet = new Set(restSet);
    for(const nf of newFound) newFrontierSet.add(key(nf));
    yield* recurse(newCellsList, newCellsSet, newFrontierList, newFrontierSet, excludedSet);

    const newExcludedSet = new Set(excludedSet); newExcludedSet.add(ck);
    yield* recurse(cellsList, cellsSet, restList, restSet, newExcludedSet);
  }

  const cellsSet = new Set(initialCells.map(key));
  const frontierSet = new Set();
  const frontierList = [];
  for(const cell of initialCells){
    for(const nb of discoverNewNeighbors(cell, cellsSet, frontierSet, new Set())){
      const k = key(nb);
      if(!frontierSet.has(k)){ frontierSet.add(k); frontierList.push(nb); }
    }
  }
  yield* recurse(initialCells.slice(), cellsSet, frontierList, frontierSet, new Set());
}

function* enumerateConnectedSubsetsContaining(seed, size, isValidCell, edgeAllowed, tick, partialOk){
  yield* enumerateConnectedSubsetsFrom([seed], size, isValidCell, edgeAllowed, tick, null, partialOk);
}

// ---- must-link support (used by the deduction solver) ----
//
// A 'link' says two adjacent cells are in the SAME piece. Links are transitive, so they form groups of cells
// that must always travel together. ctx.linkRep maps a cell key to its group's representative key and
// ctx.linkMembers maps a representative to the group's cells (cells with no link are not in either map).
// This enumerator is enumerateConnectedSubsetsFrom with whole groups as the unit of growth: a group is either
// entirely in a region or entirely out of it, so no region that splits a group is ever generated (rather than
// being generated and filtered). A group heavier than `size` can never be added, which makes the weight prune
// below exact (unlike pruning on the frontier size, see HANDOFF section 8).
function* enumerateLinkedRegions(initialCells, size, isValidCell, edgeAllowed, ctx, tick, mustContain, partialOk){
  const mustKey = mustContain || null;
  const key = (c,r) => c+','+r;
  const repOf = k => ctx.linkRep.get(k) || k;
  const cellCache = new Map();
  function membersOf(rep){
    let m = cellCache.get(rep);
    if(!m){
      m = ctx.linkMembers.get(rep);
      if(!m){ const [c,r] = rep.split(',').map(Number); m = [[c,r]]; }
      cellCache.set(rep, m);
    }
    return m;
  }
  function usable(rep){ for(const [c,r] of membersOf(rep)) if(!isValidCell(c,r)) return false; return true; }
  function neighborsOfRep(rep){
    const out = [];
    for(const [c,r] of membersOf(rep)){
      for(const [dc,dr] of [[1,0],[-1,0],[0,1],[0,-1]]){
        const nc = c+dc, nr = r+dr;
        if(!isValidCell(nc,nr)) continue;
        if(!edgeAllowed(c,r,nc,nr)) continue;
        const nrep = repOf(key(nc,nr));
        if(nrep === rep || out.indexOf(nrep) >= 0) continue;
        out.push(nrep);
      }
    }
    return out;
  }
  function cellsOf(reps){
    const cells = [];
    for(const rep of reps) for(const cell of membersOf(rep)) cells.push([cell[0], cell[1]]);
    return cells;
  }
  function noWraparound(cells){
    const set = new Set(cells.map(([c,r]) => key(c,r)));
    for(const [c,r] of cells){
      if(set.has(key(c+1,r)) && !edgeAllowed(c,r,c+1,r)) return false;
      if(set.has(key(c,r+1)) && !edgeAllowed(c,r,c,r+1)) return false;
    }
    return true;
  }

  const initReps = [];
  for(const [c,r] of initialCells){
    const rep = repOf(key(c,r));
    if(initReps.indexOf(rep) < 0) initReps.push(rep);
  }
  let weight0 = 0;
  for(const rep of initReps){ if(!usable(rep)) return; weight0 += membersOf(rep).length; }
  if(weight0 > size) return;

  // can the required cell still be reached? (lower bound: at least one new cell per hop; never through excluded groups)
  function canReach(inc, excluded, budget){
    const seen = new Set();
    let layer = [];
    for(const rep of inc) for(const [c,r] of membersOf(rep)){ const k = key(c,r); seen.add(k); layer.push(k); }
    if(seen.has(mustKey)) return true;
    for(let d = 1; d <= budget; d++){
      const next = [];
      for(const k of layer){
        const [c,r] = k.split(',').map(Number);
        for(const [dc,dr] of [[1,0],[-1,0],[0,1],[0,-1]]){
          const nc = c+dc, nr = r+dr, nk = key(nc,nr);
          if(seen.has(nk)) continue;
          if(!isValidCell(nc,nr) || !edgeAllowed(c,r,nc,nr) || excluded.has(repOf(nk))) continue;
          if(nk === mustKey) return true;
          seen.add(nk); next.push(nk);
        }
      }
      if(next.length === 0) return false;
      layer = next;
    }
    return false;
  }

  function* recurse(inc, incSet, weight, frontier, frontierSet, excluded){
    if(tick) tick();
    if(mustKey && !canReach(inc, excluded, size - weight)) return;
    if(partialOk && !partialOk(cellsOf(inc), size, k => excluded.has(repOf(k)))) return;
    if(weight === size){
      const cells = cellsOf(inc);
      if(mustKey && !cells.some(([c,r]) => key(c,r) === mustKey)) return;
      if(noWraparound(cells)) yield cells;
      return;
    }
    if(frontier.length === 0) return;
    const rep = frontier[0];
    const rest = frontier.slice(1);
    const restSet = new Set(frontierSet); restSet.delete(rep);
    const w = membersOf(rep).length;
    if(weight + w <= size && usable(rep)){
      const newInc = inc.concat([rep]);
      const newIncSet = new Set(incSet); newIncSet.add(rep);
      const newFrontier = rest.slice();
      const newFrontierSet = new Set(restSet);
      for(const nrep of neighborsOfRep(rep)){
        if(newIncSet.has(nrep) || newFrontierSet.has(nrep) || excluded.has(nrep)) continue;
        newFrontier.push(nrep); newFrontierSet.add(nrep);
      }
      yield* recurse(newInc, newIncSet, weight + w, newFrontier, newFrontierSet, excluded);
    }
    const newExcluded = new Set(excluded); newExcluded.add(rep);
    yield* recurse(inc, incSet, weight, rest, restSet, newExcluded);
  }

  const incSet = new Set(initReps);
  const frontier = [], frontierSet = new Set();
  for(const rep of initReps){
    for(const nrep of neighborsOfRep(rep)){
      if(incSet.has(nrep) || frontierSet.has(nrep)) continue;
      frontier.push(nrep); frontierSet.add(nrep);
    }
  }
  yield* recurse(initReps, incSet, weight0, frontier, frontierSet, new Set());
}

// shortest connecting path between two cells (BFS), used to seed enumeration when two
// area-numbered cells are provably forced into the same piece -- growing from a guaranteed
// connected path avoids ever exploring regions that were never going to reach the target.
function shortestPathBetween(start, end, isValidCell, edgeAllowed){
  function key([c,r]){ return c+','+r; }
  const startKey = key(start), endKey = key(end);
  if(startKey === endKey) return [start];
  const visited = new Set([startKey]);
  const prev = new Map();
  const queue = [start];
  let qi = 0;
  while(qi < queue.length){
    const cur = queue[qi++];
    for(const nb of [[cur[0]+1,cur[1]],[cur[0]-1,cur[1]],[cur[0],cur[1]+1],[cur[0],cur[1]-1]]){
      if(!isValidCell(nb[0], nb[1])) continue;
      if(!edgeAllowed(cur[0], cur[1], nb[0], nb[1])) continue;
      const nk = key(nb);
      if(visited.has(nk)) continue;
      visited.add(nk);
      prev.set(nk, cur);
      if(nk === endKey){
        const path = [end];
        let c = end;
        while(key(c) !== startKey){ c = prev.get(key(c)); path.push(c); }
        return path.reverse();
      }
      queue.push(nb);
    }
  }
  return null;
}


// puzzleState: { w, h, active: number[][] (1/0), walls: Map<string,string>,
//                roses: Map<string,number>, polyominoes: Map<string,{cells,canonicalKey}> }
// bankShapes: [{ id, cells:[[c,r]...] }]  (empty array => any connected shape is allowed)
// rules: { precision, min, max,          -- each nullable
//          mismatch, match,              -- global: every piece differs / every piece matches
//          mingleShape, mingleArea,      -- local: every orthogonally-adjacent pair of pieces
//                                           must differ in shape / in cell count
//          solitude,                     -- every piece holds exactly one symbol in total
//          boxy, nonBoxy }               -- every piece is a rectangle / no piece is a rectangle
//
// hints (optional) -- SOLVER-ONLY limits the designer deduced by hand. They are not puzzle rules and are
// never saved with the puzzle; they only narrow the search so it can finish. They can only ever REMOVE
// candidate tilings, so a 'solution' found under them is always a real solution, but 'unique' / 'impossible'
// are only as trustworthy as the limits themselves.
//   maxRegionSize  no piece may have more cells than this (tightens, never loosens, a Maximum / Precision rule)
//   maxRegions     no tiling may use more pieces than this
function buildSolverContext(puzzleState, bankShapes, rules, hints, banShapes){
  const banInfo = banInfoFor(banShapes);                 // v29: Shape ban't (null = nothing banned)
  const activeSet = new Set();
  for(let r=0; r<puzzleState.h; r++)
    for(let c=0; c<puzzleState.w; c++)
      if(puzzleState.active[r][c]) activeSet.add(`${c},${r}`);

  const blocked = new Set();                             // v90: a 'link' is not a wall
  const puzzleLinks = [];                                // v90: [[c1,r1,c2,r2]] tiles that must be one piece (custom rule Links)
  for(const [k, t] of puzzleState.walls){
    if(t !== 'link'){ blocked.add(k); continue; }
    const m = /^([vh]):(\d+),(\d+)$/.exec(k); if(!m) continue;
    const c1 = +m[2], r1 = +m[3], c2 = m[1] === 'v' ? c1 + 1 : c1, r2 = m[1] === 'v' ? r1 : r1 + 1;
    if(activeSet.has(`${c1},${r1}`) && activeSet.has(`${c2},${r2}`)) puzzleLinks.push([c1, r1, c2, r2]);
  }
  // v40: typed-array lookups (same answers as the Set / string versions, which cost a template string per call)
  const gW = puzzleState.w, gH = puzzleState.h, actArr = new Uint8Array(gW * gH), blkV = new Uint8Array(gW * gH), blkH = new Uint8Array(gW * gH);
  for(let r=0; r<gH; r++) for(let c=0; c<gW; c++) if(puzzleState.active[r][c]) actArr[r * gW + c] = 1;
  for(const k of blocked){ const m = /^([vh]):(\d+),(\d+)$/.exec(k); if(m && +m[2] < gW && +m[3] < gH) (m[1] === 'v' ? blkV : blkH)[+m[3] * gW + +m[2]] = 1; }
  function edgeAllowed(c1,r1,c2,r2){
    if(r1 === r2){ const cc = Math.min(c1,c2); return !(cc >= 0 && cc < gW && r1 >= 0 && r1 < gH && blkV[r1 * gW + cc]); }
    const rr = Math.min(r1,r2); return !(c1 >= 0 && c1 < gW && rr >= 0 && rr < gH && blkH[rr * gW + c1]);
  }
  function isActive(c,r){ return c >= 0 && r >= 0 && c < gW && r < gH && actArr[r * gW + c] === 1; }

  const useBank = bankShapes.length > 0;
  let bankOrientations = null;
  if(useBank){
    bankOrientations = [];
    // shape identity is the canonical key (rotations/reflections are the same shape), so a shape added to the bank
    // twice -- or a rotated copy of one -- is still ONE shape. Keeping both would make the same partition show up as
    // several 'different' solutions (same cells, different bank id).
    const seenBankKeys = new Set();
    bankShapes.forEach(shape => {
      const canonicalKey = canonicalShapeKey(shape.cells);
      if(seenBankKeys.has(canonicalKey)) return;
      seenBankKeys.add(canonicalKey);
      if(banInfo && banInfo.keyBanned(canonicalKey)) return;      // v29: a bank shape that contains a banned shape can never be used
      const orientations = shapeOrientations(shape.cells);
      orientations.forEach(oriCells => {
        bankOrientations.push({ shapeId: shape.id, canonicalKey, cells: oriCells });
      });
    });
  }

  let sizeLo, sizeHi;
  if(rules && rules.precision != null){ sizeLo = rules.precision; sizeHi = rules.precision; }
  else {
    sizeLo = (rules && rules.min != null) ? rules.min : 1;
    sizeHi = (rules && rules.max != null) ? rules.max : activeSet.size;
  }
  const asLimit = v => (Number.isInteger(v) && v >= 1) ? v : null;
  const maxRegionSize = hints ? asLimit(hints.maxRegionSize) : null;
  const maxRegions = hints ? asLimit(hints.maxRegions) : null;
  if(maxRegionSize !== null) sizeHi = Math.min(sizeHi, maxRegionSize);
  // v29: every shape bigger than M contains a banned shape (M = biggest size with an allowed shape; Infinity when unknown)
  const hiBeforeBan = sizeHi; let banCut = false, banWhy = false;
  if(banInfo && banInfo.maxSize < sizeHi){ sizeHi = banInfo.maxSize; banCut = true; }

  // roses: every piece in the final tiling must contain EXACTLY one rose of each type
  // that appears anywhere on the grid (a piece touching zero roses is just as invalid
  // as one touching two of the same type).
  const roses = puzzleState.roses || new Map();
  const activeRoseTypes = new Set();
  const roseCountByType = new Map();
  roses.forEach(type => {
    activeRoseTypes.add(type);
    roseCountByType.set(type, (roseCountByType.get(type)||0) + 1);
  });
  function roseTypeAt(c,r){ return roses.get(`${c},${r}`); }

  let pieceCapRose = null, pieceCapSol = null;          // v42: exact piece counts the symbols give
  // v23 'rose-size': a piece holds exactly one rose tile per type, so it has k tiles of that kind plus some tiles without a
  // rose: size >= k and size <= k + (active tiles with no rose). When all rose types appear n times the tiling has exactly n
  // pieces, which pins the sizes further (the other n-1 pieces take at least `lo` / at most `hi` cells each).
  if(activeRoseTypes.size > 0){
    const k = activeRoseTypes.size, perType = new Map();
    let roseTiles = 0;
    roses.forEach((type, key) => { if(activeSet.has(key)){ perType.set(type, (perType.get(type) || 0) + 1); roseTiles++; } });
    sizeLo = Math.max(sizeLo, k);
    sizeHi = Math.min(sizeHi, k + (activeSet.size - roseTiles));
    const counts = [...activeRoseTypes].map(t => perType.get(t) || 0), n = counts[0];
    if(n > 0 && counts.every(c => c === n)){
      pieceCapRose = n;
      const total = activeSet.size;
      for(let round = 0; round < 2; round++){
        sizeHi = Math.min(sizeHi, total - (n - 1) * sizeLo);
        sizeLo = Math.max(sizeLo, total - (n - 1) * sizeHi);
      }
    }
  }

  // v31 'solitude-size': every piece holds exactly one symbol, so with S symbols (no tile holding two) there are exactly S pieces
  if(rules && rules.solitude){
    let S = 0, dbl = false;
    const pol = puzzleState.polyominoes || new Map(), arN = puzzleState.areaNumbers || new Map(), pal = puzzleState.palisades || new Map(), cmp = puzzleState.compasses || new Map();
    activeSet.forEach(key => {
      const sc = (roses.get(key) != null ? 1 : 0) + (pol.get(key) ? 1 : 0) + (arN.get(key) != null ? 1 : 0) + (pal.has(key) ? 1 : 0) + (cmp.has(key) ? 1 : 0);
      S += sc; if(sc > 1) dbl = true;
    });
    if(S > 0 && !dbl && activeRoseTypes.size === 0){          // with roses the rose-size fact above already counts the pieces; mixing roses with other symbols is decided by the propagation
      pieceCapSol = S;
      const total = activeSet.size;
      for(let round = 0; round < 2; round++){
        sizeHi = Math.min(sizeHi, total - (S - 1) * sizeLo);
        sizeLo = Math.max(sizeLo, total - (S - 1) * sizeHi);
      }
    }
  }

  // v26 'range-count': pieces of lo..hi tiles must cover the T tiles exactly. No cover = impossible; a size that fits no cover is removed,
  // so sizeLo / sizeHi become the smallest / biggest size that occurs in some cover (e.g. 13 tiles, 4..6 -> 4..5). Over-estimates only.
  let rangeInfo = null, rangeInfeasible = false, bankWhy = false, bankMatters = false;
  // v33 'bank-count': with a shape bank a piece has the size of a bank shape (or of a stamp's shape, a stamp need not be in the bank)
  let bankSizes = null;
  if(useBank){
    bankSizes = new Set(bankOrientations.map(o => o.cells.length));
    (puzzleState.polyominoes || new Map()).forEach(p => { if(p && p.cells && !(banInfo && p.canonicalKey && banInfo.keyBanned(p.canonicalKey))) bankSizes.add(p.cells.length); });
  }
  {
    const T = activeSet.size, lo2 = Math.max(sizeLo, 1, (rules && rules.nonBoxy) ? 3 : 1), hi2 = Math.min(sizeHi, T);
    if(T > 0 && (lo2 > 1 || hi2 < T || bankSizes)){
      const rc = rangeCover(T, lo2, hi2, bankSizes);
      if(!rc.ok){ rangeInfeasible = true; if(banCut && rangeCover(T, lo2, Math.min(hiBeforeBan, T)).ok) banWhy = true; else if(bankSizes && rangeCover(T, lo2, hi2).ok) bankWhy = true; }
      else { if(bankSizes){ const pl = rangeCover(T, lo2, hi2); if(!pl.ok || pl.usable.length !== rc.usable.length) bankMatters = true; } sizeLo = rc.usable[0]; sizeHi = rc.usable[rc.usable.length - 1]; rangeInfo = rc; }
    }
  }

  // polyominoes: a marked cell requires whatever piece covers it to match that exact
  // shape, up to rotation/reflection (a rose bank shape is not required for this).
  const polyominoes = puzzleState.polyominoes || new Map();
  function requiredShapeAt(c,r){
    const entry = polyominoes.get(`${c},${r}`);
    return entry ? entry.canonicalKey : null;
  }

  // area numbers: a marked cell requires whatever piece covers it to have exactly that
  // many cells, independent of shape.
  const areaNumbers = puzzleState.areaNumbers || new Map();
  function requiredAreaAt(c,r){
    const v = areaNumbers.get(`${c},${r}`);
    return v != null ? v : null;
  }

  // if exactly two cells share the same area number V, and two separate V-sized pieces
  // couldn't both fit in the grid (2V > total active cells), they're provably forced into
  // the same piece. Detecting this up front lets candidate generation seed the region
  // search with a path connecting them directly, instead of blindly enumerating regions
  // around one of them and hoping one happens to reach the other -- which is intractable
  // once V is a large fraction of the grid, since almost none of them will.
  const forcedPairPartner = new Map();
  {
    const byValue = new Map();
    areaNumbers.forEach((value, key) => {
      if(!byValue.has(value)) byValue.set(value, []);
      byValue.get(value).push(key);
    });
    byValue.forEach((keys, value) => {
      if(keys.length === 2 && 2*value > activeSet.size){
        forcedPairPartner.set(keys[0], keys[1]);
        forcedPairPartner.set(keys[1], keys[0]);
      }
    });
  }

  // v19 symbols: palisade (tile, '0','1','2c','2s','3','4'), compass (tile, {n,e,s,w} each null|0..99),
  // watchtower (grid VERTEX 'vc,vr' = top-left corner of tile (vc,vr), value 1..4)
  const palisades = puzzleState.palisades || new Map();
  const compasses = puzzleState.compasses || new Map();
  const watchtowers = puzzleState.watchtowers || new Map();
  const brickyRule = !!(rules && rules.bricky), loopyRule = !!(rules && rules.loopy);
  const wallyRule = !!(rules && rules.wally);                                       // v89: Wally (custom)
  const heteroRule = !!(rules && rules.heterogeneous);                              // v90: Heterogeneous (custom)
  // v42: an upper bound on the number of pieces (every piece has >= sizeLo tiles; exact counts from roses / solitude; the user's hint)
  let pieceCapMax = Math.floor(activeSet.size / Math.max(1, sizeLo));
  if(maxRegions !== null) pieceCapMax = Math.min(pieceCapMax, maxRegions);
  if(pieceCapRose !== null) pieceCapMax = Math.min(pieceCapMax, pieceCapRose);
  if(pieceCapSol !== null) pieceCapMax = Math.min(pieceCapMax, pieceCapSol);
  if(heteroRule){                                         // v90: k pieces of different sizes need lo + (lo+1) + ... + (lo+k-1) tiles
    let k = 0, sum = 0; for(let s = Math.max(1, sizeLo); sum + s <= activeSet.size; s++){ sum += s; k++; }
    pieceCapMax = Math.min(pieceCapMax, Math.max(1, k));
  }
  if(!(pieceCapMax >= 1)) pieceCapMax = null;
  // v67: active tiles per row / column (compass strip count)
  const activeRows = new Array(puzzleState.h).fill(0), activeCols = new Array(puzzleState.w).fill(0);
  for(let r = 0; r < puzzleState.h; r++) for(let c = 0; c < puzzleState.w; c++) if(isActive(c, r)){ activeRows[r]++; activeCols[c]++; }
  const ctxOut = { activeRows, activeCols, banInfo, pieceCapMax, heteroRule, puzzleLinks, mingleAreaReal: !!(rules && rules.mingleArea), banWhy, bankWhy, bankMatters, rangeInfo, rangeInfeasible, palisades, compasses, watchtowers, brickyRule, loopyRule, wallyRule,
           localRules: brickyRule || loopyRule || wallyRule || palisades.size > 0 || watchtowers.size > 0,
           edgeAllowed, isActive, useBank, bankOrientations, sizeLo, sizeHi, maxRegions, maxRegionSize, totalActive: activeSet.size,
           activeRoseTypes, roseCountByType, roseTypeAt, requiredShapeAt, requiredAreaAt, forcedPairPartner,
           mismatchRule: !!(rules && rules.mismatch), matchRule: !!(rules && rules.match),
           mingleShapeRule: !!(rules && rules.mingleShape), mingleAreaRule: !!(rules && (rules.mingleArea || rules.heterogeneous)),
           solitudeRule: !!(rules && rules.solitude),
           boxyRule: !!(rules && rules.boxy), nonBoxyRule: !!(rules && rules.nonBoxy) };
  if(puzzleLinks.length) linkGroupsInto(ctxOut, puzzleLinks);                       // v90
  return ctxOut;
}

// a connected set of cells is a rectangle iff it exactly fills its own bounding box
// ============================================================================================================
// v29: SHAPE BAN'T (custom rule, not in the base game). The opposite of the shape bank: no piece may CONTAIN a banned shape,
// i.e. no placement of a banned shape (rotated / reflected, translated) may lie completely inside the cells of one piece.
// A piece that IS the banned shape contains it too; a P pentomino contains the O tetromino; and so on.
// Facts used (all hold in every valid tiling):
//   - containing is monotone: once a group of tiles that must be one piece contains a banned shape, no bigger piece can be valid
//   - the allowed pieces form a down-closed family (take a connected piece, remove a tile that does not cut it: still connected, still
//     allowed), so the allowed sizes are 1..M for some M (or all sizes). M is found by growing the allowed free polyominoes size by size.
// banInfoFor(banShapes) -> null (nothing banned) or { shapes (minimal set), minSize, maxSize (M or Infinity), cellsBanned(cells, key), keyBanned(key), countAt(k) }
// ============================================================================================================
const BAN_CACHE = new Map();
const BAN_LEVEL_MAX = 12, BAN_LEVEL_CAP = 4000;
function containsShapeSet(shapes, cells){
  const n = cells.length;
  const K = (x, y) => (x + 1024) * 4096 + (y + 1024);
  let set = null;
  for(const sh of shapes){
    if(sh.size > n) continue;
    if(set === null){ set = new Set(); for(const [c, r] of cells) set.add(K(c, r)); }
    for(const ori of sh.orients){
      const [ax, ay] = ori[0], m = ori.length;
      for(const [c, r] of cells){
        const dx = c - ax, dy = r - ay;
        let ok = true;
        for(let i = 1; i < m; i++){ if(!set.has(K(ori[i][0] + dx, ori[i][1] + dy))){ ok = false; break; } }
        if(ok) return true;
      }
    }
  }
  return false;
}
function banInfoFor(banShapes){
  if(!banShapes || banShapes.length === 0) return null;
  const byKey = new Map();
  for(const s of banShapes){
    if(!s || !s.cells || s.cells.length === 0) continue;
    const key = canonicalShapeKey(s.cells);
    if(!byKey.has(key)) byKey.set(key, normalizeCells(s.cells));
  }
  if(byKey.size === 0) return null;
  const sig = [...byKey.keys()].sort().join('#');
  const hit = BAN_CACHE.get(sig);
  if(hit) return hit;
  // minimal set: a banned shape that contains another banned shape adds nothing
  const sorted = [...byKey.entries()].sort((a, b) => a[1].length - b[1].length);
  const kept = [];
  for(const [key, cells] of sorted){
    if(containsShapeSet(kept, cells)) continue;
    kept.push({ key, size: cells.length, orients: shapeOrientations(cells) });
  }
  const memo = new Map();
  const info = { shapes: kept, minSize: kept[0].size, maxSize: Infinity, horizon: 1, counts: [0, 0], sig };
  info.cellsBanned = (cells, key) => {
    if(cells.length < info.minSize) return false;
    if(key == null) return containsShapeSet(kept, cells);
    let m = memo.get(key);
    if(m === undefined){ m = containsShapeSet(kept, cells); if(memo.size > 200000) memo.clear(); memo.set(key, m); }
    return m;
  };
  info.keyBanned = key => {
    let m = memo.get(key);
    if(m === undefined){ m = containsShapeSet(kept, key.split('|').map(s => s.split(',').map(Number))); memo.set(key, m); }
    return m;
  };
  info.countAt = k => k <= info.horizon ? info.counts[k] : Infinity;
  // allowed free polyominoes size by size (each allowed k-omino grows from an allowed (k-1)-omino)
  let level = containsShapeSet(kept, [[0, 0]]) ? [] : [[[0, 0]]];
  info.counts[1] = level.length;
  if(level.length === 0) info.maxSize = 0;
  for(let k = 2; level.length > 0 && k <= BAN_LEVEL_MAX; k++){
    const next = new Map();
    for(const cells of level){
      const have = new Set(cells.map(([x, y]) => x + ',' + y));
      for(const [x, y] of cells) for(const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]){
        const nx = x + dx, ny = y + dy;
        if(have.has(nx + ',' + ny)) continue;
        const grown = normalizeCells(cells.concat([[nx, ny]])), key = canonicalShapeKey(grown);
        if(next.has(key)) continue;
        if(!containsShapeSet(kept, grown)) next.set(key, grown);
      }
    }
    level = [...next.values()];
    info.counts[k] = level.length; info.horizon = k;
    if(level.length === 0){ info.maxSize = k - 1; break; }
    if(level.length > BAN_LEVEL_CAP) break;
  }
  if(BAN_CACHE.size > 200) BAN_CACHE.clear();
  BAN_CACHE.set(sig, info);
  return info;
}
// the partial test the piece enumerators call on a growing set of cells: compass look-ahead and / or 'no banned shape inside yet'
function partialOkFor(ctx, isFree){
  const comp = (ctx.compasses && ctx.compasses.size > 0) ? (cells, size, isExcl) => compassPartialOk(ctx, cells, size, isExcl, isFree) : null;
  const ban = ctx.banInfo ? (cells) => !ctx.banInfo.cellsBanned(cells, null) : null;
  if(comp && ban) return (cells, size, isExcl) => ban(cells) && comp(cells, size, isExcl);
  return comp || ban;
}

function isRectangular(cells){
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for(const [x,y] of cells){
    if(x < minX) minX = x; if(x > maxX) maxX = x;
    if(y < minY) minY = y; if(y > maxY) maxY = y;
  }
  return cells.length === (maxX - minX + 1) * (maxY - minY + 1);
}

// ---- compass reasoning (v20) ----
// A compass on tile (c,r) with n/e/s/w says: the piece holding it has exactly that many cells strictly above / right of /
// below / left of the tile (anywhere in the piece, not only in line). Consequences used by the solver:
//  * a 0 forbids its whole half-plane (e:0 => no cell with x > c in that piece);
//  * a non-zero count forbids nothing but needs that many cells (lower bound) -- never more (upper bound);
//  * two compasses in one piece must agree: same column => equal e and w, same row => equal n and s, and a compass
//    strictly east of another one is itself one of the cells east of it (e_A >= e_B + 1, w_B >= w_A + 1), etc.
// compassCannotShare(ctx, X, Y) is a SOUND static test: true => no piece can hold both tiles.
const DIRS = ['n','e','s','w'];
function compassSides(c, r, x, y){       // which of n/e/s/w the tile (x,y) lies in, relative to the compass tile (c,r)
  const out = [];
  if(y < r) out.push('n'); else if(y > r) out.push('s');
  if(x > c) out.push('e'); else if(x < c) out.push('w');
  return out;
}
// v67: the strip count (see build/patch_core67.py): true = A and B can not be one piece
function compassStripConflict(ctx, c1, r1, A, c2, r2, B){
  const rows = (a, b) => { let s = 0; for(let y = a; y <= b; y++) s += ctx.activeRows[y] || 0; return s; };
  const cols = (a, b) => { let s = 0; for(let x = a; x <= b; x++) s += ctx.activeCols[x] || 0; return s; };
  const test = (P, py, px, Q, qy, qx) => {           // Q above P (qy < py) / left of P (qx < px)
    if(qy < py){
      if(P.n != null && Q.n != null && P.n > Q.n + rows(qy, py - 1)) return true;
      if(Q.s != null && P.s != null && Q.s > P.s + rows(qy + 1, py)) return true;
    }
    if(qx < px){
      if(P.w != null && Q.w != null && P.w > Q.w + cols(qx, px - 1)) return true;
      if(Q.e != null && P.e != null && Q.e > P.e + cols(qx + 1, px)) return true;
    }
    return false;
  };
  return test(A, r1, c1, B, r2, c2) || test(B, r2, c2, A, r1, c1);
}
function compassPairConflict(c1, r1, A, c2, r2, B){
  // A on (c1,r1), B on (c2,r2): can one piece hold both? (false = they can coexist as far as these two symbols know)
  const sA = compassSides(c1, r1, c2, r2);          // where B lies relative to A
  const sB = compassSides(c2, r2, c1, r1);          // where A lies relative to B
  for(const d of sA) if(A[d] === 0) return true;
  for(const d of sB) if(B[d] === 0) return true;
  const opp = { n:'s', s:'n', e:'w', w:'e' };
  for(const d of sA){                               // B is on side d of A: A[d] counts B and everything B counts on side d
    if(A[d] != null && A[d] < 1 + (B[d] != null ? B[d] : 0)) return true;
    const o = opp[d];                               // A is on side o of B: B[o] counts A and everything A counts on side o
    if(B[o] != null && B[o] < 1 + (A[o] != null ? A[o] : 0)) return true;
  }
  if(c1 === c2){ if(A.e != null && B.e != null && A.e !== B.e) return true; if(A.w != null && B.w != null && A.w !== B.w) return true; }
  if(r1 === r2){ if(A.n != null && B.n != null && A.n !== B.n) return true; if(A.s != null && B.s != null && A.s !== B.s) return true; }
  return false;
}
// smallest piece a compass can sit in: n+s+1 and e+w+1 (cells in its own row / column), and k+1 for any single count k
const CMP_MIN_MEMO = new Map();
function compassMinSize(cp){                          // v65a: exact (see build/patch_core65.py), the old bound as fallback
  const key = [cp.n, cp.e, cp.s, cp.w].join(',');
  if(CMP_MIN_MEMO.has(key)) return CMP_MIN_MEMO.get(key);
  const v = compassMinExact(cp);
  CMP_MIN_MEMO.set(key, v);
  return v;
}
function compassMinExact(cp){
  const D = ['n', 'e', 's', 'w'], known = D.map(d => cp[d] != null), c = D.map(d => cp[d] != null ? cp[d] : 0);
  const old = compassMinOld(cp);
  if(!known.some(k => k)) return 1;
  const rng = D.map((d, i) => known[i] ? c[i] + 1 : 2);
  if(rng[0] * rng[1] * rng[2] * rng[3] > 200000) return old;
  const B = Math.max(...c);
  let best = Infinity;
  for(let an = 0; an < rng[0]; an++) for(let ae = 0; ae < rng[1]; ae++) for(let as = 0; as < rng[2]; as++) for(let aw = 0; aw < rng[3]; aw++){
    const A = an + ae + as + aw; if(1 + A >= best) continue;
    const Rn = c[0] - an, Re = c[1] - ae, Rs = c[2] - as, Rw = c[3] - aw;
    for(let qne = 0; qne <= B; qne++){
      if(qne > 0 && !an && !ae) break;
      for(let qsw = 0; qsw <= B; qsw++){
        if(qsw > 0 && !as && !aw) break;
        const qnw = known[0] ? Rn - qne : known[3] ? Rw - qsw : 0;
        const qse = known[1] ? Re - qne : known[2] ? Rs - qsw : 0;
        if(qnw < 0 || qse < 0) continue;
        if(known[0] && qne + qnw !== Rn) continue;
        if(known[1] && qne + qse !== Re) continue;
        if(known[2] && qse + qsw !== Rs) continue;
        if(known[3] && qsw + qnw !== Rw) continue;
        if(qnw > 0 && !an && !aw) continue;
        if(qse > 0 && !as && !ae) continue;
        const T = 1 + A + qne + qse + qsw + qnw;
        if(T < best) best = T;
      }
    }
  }
  return best === Infinity ? old : Math.max(best, old);
}
function compassMinOld(cp){
  let m = 1;
  for(const d of DIRS) if(cp[d] != null) m = Math.max(m, cp[d] + 1);
  if(cp.n != null && cp.s != null) m = Math.max(m, cp.n + cp.s + 1);
  if(cp.e != null && cp.w != null) m = Math.max(m, cp.e + cp.w + 1);
  return m;
}
function compassCannotShare(ctx, x1, y1, x2, y2){
  const comp = ctx.compasses;
  if(!comp || comp.size === 0) return false;
  const A = comp.get(`${x1},${y1}`), B = comp.get(`${x2},${y2}`);
  // v38: reaching a tile j columns east needs a tile in each of those j columns, so e >= j (same for the other sides)
  const far = (cp, ax, ay, bx, by) => (cp.e != null && bx - ax > cp.e) || (cp.w != null && ax - bx > cp.w) || (cp.s != null && by - ay > cp.s) || (cp.n != null && ay - by > cp.n);
  if((A && far(A, x1, y1, x2, y2)) || (B && far(B, x2, y2, x1, y1))) return true;
  if(A && B){
    if(compassPairConflict(x1, y1, A, x2, y2, B)) return true;
    if(ctx.activeRows && compassStripConflict(ctx, x1, y1, A, x2, y2, B)) return true;     // v67
    return false;
  }
  if(A){ for(const d of compassSides(x1, y1, x2, y2)) if(A[d] === 0) return true; }
  if(B){ for(const d of compassSides(x2, y2, x1, y1)) if(B[d] === 0) return true; }
  // a compass whose smallest piece is bigger than the area number sitting on the other tile
  const areaOf = ctx.requiredAreaAt;
  if(A){ const a = areaOf(x2, y2); if(a != null && a < compassMinSize(A)) return true; }
  if(B){ const a = areaOf(x1, y1); if(a != null && a < compassMinSize(B)) return true; }
  return false;
}
// pruning for the region enumerators: can this PARTIAL region (a connected set of cells that will be grown to exactly
// `size` cells) still become a piece that satisfies every compass it already contains? Sound: counts only grow, so a
// count above its number is final; a count that cannot reach its number with the cells still to add is final too.
function compassPartialOk(ctx, cells, size, isExcluded, isValid){
  const comp = ctx.compasses;
  let list = null;
  for(const [c,r] of cells){
    const cp = comp.get(`${c},${r}`);
    if(cp){ if(!list) list = []; list.push([c, r, cp]); }
  }
  if(!list) return true;
  const rem = size - cells.length;
  // cells that could still join: reachable from the region without crossing a wall, an excluded cell or a used cell
  let reach = null;
  if(isExcluded && isValid && rem > 0){
    const have = new Set(cells.map(([c,r]) => `${c},${r}`)), queue = cells.slice();
    reach = [];
    for(let qi = 0; qi < queue.length; qi++){
      const [c,r] = queue[qi];
      for(const [dc,dr] of [[1,0],[-1,0],[0,1],[0,-1]]){
        const nc = c + dc, nr = r + dr, k = `${nc},${nr}`;
        if(have.has(k) || !isValid(nc, nr) || isExcluded(k) || !ctx.edgeAllowed(c, r, nc, nr)) continue;
        have.add(k); queue.push([nc, nr]); reach.push([nc, nr]);
      }
    }
  }
  for(let i = 0; i < list.length; i++){
    const [c, r, cp] = list[i];
    for(let j = i + 1; j < list.length; j++) if(compassPairConflict(c, r, cp, list[j][0], list[j][1], list[j][2])) return false;
    let n = 0, e = 0, so = 0, w = 0, row = 0, col = 0;
    for(const [x,y] of cells){
      if(y < r) n++; else if(y > r) so++; else row++;
      if(x > c) e++; else if(x < c) w++; else col++;
    }
    if(cp.n != null && (n > cp.n || n + rem < cp.n)) return false;
    if(cp.s != null && (so > cp.s || so + rem < cp.s)) return false;
    if(cp.e != null && (e > cp.e || e + rem < cp.e)) return false;
    if(cp.w != null && (w > cp.w || w + rem < cp.w)) return false;
    if(reach){
      let rn = 0, re = 0, rs = 0, rw = 0;
      for(const [x,y] of reach){ if(y < r) rn++; else if(y > r) rs++; if(x > c) re++; else if(x < c) rw++; }
      if(cp.n != null && n + rn < cp.n) return false;
      if(cp.s != null && so + rs < cp.s) return false;
      if(cp.e != null && e + re < cp.e) return false;
      if(cp.w != null && w + rw < cp.w) return false;
    }
    if(cp.n != null && cp.s != null && row > size - cp.n - cp.s) return false;     // row cells = size - n - s
    if(cp.e != null && cp.w != null && col > size - cp.e - cp.w) return false;     // column cells = size - e - w
  }
  return true;
}

// counts how many distinct symbols sit on a cell -- a single source of truth for
// "solitude", extended with one more `if` whenever a new symbol type is introduced.
function symbolCountAt(c, r, ctx){
  let count = 0;
  if(ctx.roseTypeAt(c,r) != null) count++;
  if(ctx.requiredShapeAt(c,r) != null) count++;
  if(ctx.requiredAreaAt(c,r) != null) count++;
  if(ctx.palisades && ctx.palisades.has(`${c},${r}`)) count++;
  if(ctx.compasses && ctx.compasses.has(`${c},${r}`)) count++;
  return count;
}

// a candidate placement is only valid if it satisfies every rose-count, polyomino-shape,
// area-number, solitude, and boxy/non-boxy requirement of the cells it covers.
function passesMarkers(cells, canonicalKey, ctx){
  if(ctx.activeRoseTypes.size > 0){
    const counts = new Map();
    for(const t of ctx.activeRoseTypes) counts.set(t, 0);
    for(const [c,r] of cells){
      const t = ctx.roseTypeAt(c,r);
      if(t != null && counts.has(t)) counts.set(t, counts.get(t) + 1);
    }
    for(const t of ctx.activeRoseTypes){ if(counts.get(t) !== 1) return false; }
  }
  for(const [c,r] of cells){
    const req = ctx.requiredShapeAt(c,r);
    if(req != null && req !== canonicalKey) return false;
    const reqArea = ctx.requiredAreaAt(c,r);
    if(reqArea != null && reqArea !== cells.length) return false;
  }
  if(ctx.compasses && ctx.compasses.size > 0){
    // compass: the piece holding it needs exactly A cells strictly above / right of / below / left of the compass tile
    for(const [c,r] of cells){
      const cp = ctx.compasses.get(`${c},${r}`);
      if(!cp) continue;
      let n = 0, e = 0, so = 0, w = 0;
      for(const [x,y] of cells){ if(y < r) n++; else if(y > r) so++; if(x > c) e++; else if(x < c) w++; }
      if((cp.n != null && cp.n !== n) || (cp.e != null && cp.e !== e) || (cp.s != null && cp.s !== so) || (cp.w != null && cp.w !== w)) return false;
    }
  }
  if(ctx.solitudeRule){
    let total = 0;
    for(const [c,r] of cells) total += symbolCountAt(c,r,ctx);
    if(total !== 1) return false;
  }
  if(ctx.boxyRule && !isRectangular(cells)) return false;
  if(ctx.nonBoxyRule && isRectangular(cells)) return false;
  if(ctx.banInfo && ctx.banInfo.cellsBanned(cells, canonicalKey)) return false;       // v29: Shape ban't
  if(ctx.hasLinks){
    // must-link groups travel together: a piece holding one cell of a group must hold all of it
    const inPiece = new Set(cells.map(([c,r]) => `${c},${r}`));
    for(const [c,r] of cells){
      const members = ctx.linkMembers.get(ctx.linkRep.get(`${c},${r}`));
      if(!members) continue;
      for(const [mc,mr] of members) if(!inPiece.has(`${mc},${mr}`)) return false;
    }
  }
  return true;
}

// boxy fast path: every rectangle of exactly `size` cells that contains (cellC,cellR), using only
// cells accepted by isValidCell and with no wall between any two adjacent cells inside it.
// Used instead of enumerating every connected region and then filtering, which is vastly
// cheaper when the boxy rule is on (a size-N region count grows exponentially; the number of
// N-cell rectangles is at most N * d(N)).
function* enumerateRectanglesContaining(cellC, cellR, size, isValidCell, edgeAllowed){
  for(let width = 1; width <= size; width++){
    if(size % width !== 0) continue;
    const height = size / width;
    for(let offC = cellC - width + 1; offC <= cellC; offC++){
      for(let offR = cellR - height + 1; offR <= cellR; offR++){
        const cells = [];
        let ok = true;
        outer: for(let dr = 0; dr < height; dr++){
          for(let dc = 0; dc < width; dc++){
            const cc = offC + dc, rr = offR + dr;
            if(!isValidCell(cc, rr)){ ok = false; break outer; }
            cells.push([cc, rr]);
          }
        }
        if(!ok) continue;
        // internal walls: check each adjacent pair inside the rectangle
        for(let dr = 0; dr < height && ok; dr++){
          for(let dc = 0; dc < width; dc++){
            const cc = offC + dc, rr = offR + dr;
            if(dc + 1 < width && !edgeAllowed(cc, rr, cc+1, rr)){ ok = false; break; }
            if(dr + 1 < height && !edgeAllowed(cc, rr, cc, rr+1)){ ok = false; break; }
          }
        }
        if(!ok) continue;
        yield cells;
      }
    }
  }
}

// all valid placements covering (cellC,cellR) right now, given isFree(c,r) reflecting the
// current search state (active AND not yet claimed by another piece). Yielded lazily: for
// free-form mode especially, this matters -- without a size rule, sizes near half the grid
// can have an astronomical number of possible regions, but the search usually only needs
// the first handful of candidates (often much smaller pieces) to make progress. Building
// the full list eagerly before trying any of them would mean paying that cost every time,
// even when the very first candidate leads straight to a solution.
//
// forcedSize (optional): once the match rule has locked in a required shape, every
// candidate must be exactly that shape's size -- anything else is guaranteed rejection
// regardless of what it looks like. Without this, backtracking would still fully generate
// (and then throw away) every other size for every cell it revisits, which is exactly the
// kind of "enumerate everything just to reject it" cost this function exists to avoid.
// An area number on the target cell itself is an even more direct version of the same
// thing and takes priority when present, since it pins the size down regardless of match.
// allowedSize (optional): a predicate on piece size, supplied by the solver when an area-relation wall
// (lt / gt / diff) next to the target cell already has its other side placed -- sizes that cannot
// satisfy it are skipped without being enumerated at all.
function* candidatesForCell(ctx, cellC, cellR, isFree, forcedSize, allowedSize){
  const tick = ctx.tick || null;
  const cellArea = ctx.requiredAreaAt(cellC, cellR);
  const effectiveForcedSize = cellArea != null ? cellArea : forcedSize;
  if(ctx.useBank){
    for(const ori of ctx.bankOrientations){
      const size = ori.cells.length;
      if(effectiveForcedSize != null && size !== effectiveForcedSize) continue;
      if(size < ctx.sizeLo || size > ctx.sizeHi) continue;
      if(allowedSize && !allowedSize(size)) continue;
      // try aligning each cell of this orientation onto the target, in turn
      for(const [dx,dy] of ori.cells){
        if(tick) tick();
        const offC = cellC - dx, offR = cellR - dy;
        const translated = ori.cells.map(([x,y]) => [x+offC, y+offR]);
        let ok = true;
        for(const [c,r] of translated){ if(!isFree(c,r)){ ok = false; break; } }
        if(!ok) continue;
        const local = new Set(translated.map(([c,r]) => `${c},${r}`));
        for(const [c,r] of translated){
          if(local.has(`${c+1},${r}`) && !ctx.edgeAllowed(c,r,c+1,r)){ ok = false; break; }
          if(local.has(`${c},${r+1}`) && !ctx.edgeAllowed(c,r,c,r+1)){ ok = false; break; }
        }
        if(!ok) continue;
        if(!passesMarkers(translated, ori.canonicalKey, ctx)) continue;
        yield { cells: translated, shapeId: ori.shapeId, canonicalKey: ori.canonicalKey };
      }
    }
    return;
  }
  // free-form: a forced size (area number, or the Match lock) must still respect the size rules -- an area
  // number of 5 under 'max 3' (or under a max-region-size limit) can never be satisfied.
  if(effectiveForcedSize != null && (effectiveForcedSize < ctx.sizeLo || effectiveForcedSize > ctx.sizeHi)) return;
  // if this cell is provably paired with another (see forcedPairPartner above) and that
  // partner is still free, every valid candidate must include both.
  const cellKeyStr = `${cellC},${cellR}`;
  const partnerKey = ctx.forcedPairPartner.get(cellKeyStr);
  if(partnerKey != null){
    const [pc, pr] = partnerKey.split(',').map(Number);
    if(isFree(pc, pr)){
      if(effectiveForcedSize != null){
        // every valid piece contains both cells, so enumerate the pieces that contain this cell AND reach the
        // partner (growth is pruned once the partner can no longer be reached). This must not be narrowed to
        // pieces containing one particular shortest path between the two: a piece may connect them another way.
        const pairSource = ctx.hasLinks
          ? enumerateLinkedRegions([[cellC,cellR]], effectiveForcedSize, isFree, ctx.edgeAllowed, ctx, tick, partnerKey, partialOkFor(ctx, isFree))
          : enumerateConnectedSubsetsFrom([[cellC,cellR]], effectiveForcedSize, isFree, ctx.edgeAllowed, tick, partnerKey, partialOkFor(ctx, isFree));
        for(const cells of pairSource){
          if(tick) tick();
          const ck = canonicalShapeKey(cells);
          if(!passesMarkers(cells, ck, ctx)) continue;
          yield { cells, shapeId: null, canonicalKey: ck };
        }
      }
      return;
    }
  }
  const pOk = partialOkFor(ctx, isFree);
  const lo = effectiveForcedSize != null ? effectiveForcedSize : ctx.sizeLo;
  const hi = effectiveForcedSize != null ? effectiveForcedSize : Math.min(ctx.sizeHi, ctx.totalActive);
  for(let size = lo; size <= hi; size++){
    if(allowedSize && !allowedSize(size)) continue;
    const source = ctx.boxyRule
      ? enumerateRectanglesContaining(cellC, cellR, size, isFree, ctx.edgeAllowed)
      : ctx.hasLinks
        ? enumerateLinkedRegions([[cellC,cellR]], size, isFree, ctx.edgeAllowed, ctx, tick, null, pOk)
        : enumerateConnectedSubsetsContaining([cellC,cellR], size, isFree, ctx.edgeAllowed, tick, pOk);
    for(const cells of source){
      if(tick) tick();
      const ck = canonicalShapeKey(cells);
      if(!passesMarkers(cells, ck, ctx)) continue;
      yield { cells, shapeId: null, canonicalKey: ck };
    }
  }
}

// ---- exact-cover solver (generator, yields progress / solution / budget-exceeded) ----

// ---- search-time options (used by the deduction solver; plain solvePuzzle callers never need them) ----
const nowMs = (typeof performance !== 'undefined' && performance.now) ? () => performance.now() : () => Date.now();
const SEARCH_TIMEOUT = { timeout: true };

// derives a context with extra constraints layered on the base one, without touching the base:
//   opts.extraWalls  Set of 'v:c,r' / 'h:c,r' keys: extra physical walls (the two cells end up in different pieces)
//   opts.links       [[c1,r1,c2,r2], ...] adjacent cell pairs that must be in the SAME piece
//   opts.deadline    nowMs() timestamp after which the search throws SEARCH_TIMEOUT (turned into a 'timeout' event)
// v90: the must-link groups of `links` (plus a flag for a link across a wall) written into the context d
function linkGroupsInto(d, links){
  const parent = new Map();
  const find = k => { let root = k; while(parent.has(root) && parent.get(root) !== root) root = parent.get(root); return root; };
  d.linkAcrossWall = false;
  for(const [c1,r1,c2,r2] of links){
    const a = `${c1},${r1}`, b = `${c2},${r2}`;
    if(!parent.has(a)) parent.set(a, a);
    if(!parent.has(b)) parent.set(b, b);
    const ra = find(a), rb = find(b);
    if(ra !== rb) parent.set(ra, rb);
    if(!d.edgeAllowed(c1,r1,c2,r2)) d.linkAcrossWall = true;               // a link across a wall can never be satisfied
  }
  d.linkRep = new Map();
  d.linkMembers = new Map();
  for(const k of parent.keys()){
    const rep = find(k);
    d.linkRep.set(k, rep);
    if(!d.linkMembers.has(rep)) d.linkMembers.set(rep, []);
    const [c,r] = k.split(',').map(Number);
    d.linkMembers.get(rep).push([c,r]);
  }
  d.hasLinks = true;
}
function deriveContext(ctx, opts){
  if(!opts) return ctx;
  const hasWalls = !!(opts.extraWalls && opts.extraWalls.size > 0);
  const hasLinks = !!(opts.links && opts.links.length > 0) || (hasWalls && !!(ctx.puzzleLinks && ctx.puzzleLinks.length));   // v90
  if(!hasWalls && !hasLinks && opts.deadline == null) return ctx;
  const d = Object.assign({}, ctx);
  if(hasWalls){
    const base = ctx.edgeAllowed, extra = opts.extraWalls;
    d.edgeAllowed = (c1,r1,c2,r2) => {
      if(!base(c1,r1,c2,r2)) return false;
      if(r1 === r2) return !extra.has(`v:${Math.min(c1,c2)},${r1}`);
      return !extra.has(`h:${c1},${Math.min(r1,r2)}`);
    };
  }
  if(hasLinks) linkGroupsInto(d, (ctx.puzzleLinks || []).concat(opts.links || []));     // v90: + the puzzle's own links
  if(opts.deadline != null){
    let n = 0;
    const deadline = opts.deadline;
    d.tick = () => { if((++n & 63) === 0 && nowMs() > deadline) throw SEARCH_TIMEOUT; };
  }
  return d;
}

// specialEdges: one entry per hand-placed wall that carries a relation between the two pieces it
// separates: { c1, r1, c2, r2, kind, value? } where (c1,r1)/(c2,r2) are the two cells either side of
// the wall and kind is one of
//   'delta'   the pieces must be different shapes
//   'gemini'  the pieces must be the same shape
//   'lt'      area of the piece on (c1,r1) is LESS than the area of the piece on (c2,r2)
//   'gt'      area of the piece on (c1,r1) is GREATER than the area of the piece on (c2,r2)
//   'diff'    |area1 - area2| === value   (value 0..9; 0 means equal areas)
// For a 'v:c,r' wall (c1,r1) is the left cell; for an 'h:c,r' wall it is the top cell.
// Every wall kind is also a physical barrier -- that is handled by ctx.edgeAllowed, not here.
//
// Events yielded: { type:'solution', pieces } | { type:'progress', nodes, fraction, rootBranches } |
//                 { type:'budget-exceeded', nodes, fraction }
// `fraction` is a rough 0..1 estimate of how much of the search is done (null = cannot be estimated); see the
// progress-estimate comment inside. Internal option opts.rootCountOnly (used for that estimate) makes the call just
// count the viable first pieces and yield one { type:'root-count', n } event, n being null when there are too many to count.
//
// Optional search-time constraints in opts (all additive; see deriveContext): extraWalls, links, deadline, and
//   opts.focus  [[c,r], ...]  cells to search around first: the next cell to cover is the uncovered one closest to
//                             them, so contradictions that come from the neighbourhood of a decision show up early.
// An extra event { type:'timeout', nodes } is yielded (and the search stops) when opts.deadline passes.
// ============================================================================================================
// v25: counting facts for MATCH (every piece has the same shape) and MISMATCH (every piece has a different shape).
// Pure functions of the context: they hold in EVERY valid tiling, so the exact search uses them as 'return before searching'
// shortcuts and the deduction uses them to rule sizes out. All numbers are OVER-estimates (more possibilities than there
// really are), so 'impossible' is always certain.
// ============================================================================================================
// number of free polyominoes (rotations / reflections count once) with n cells, n = 0..10 (OEIS A000105; bigger n: unknown = 'any')
const v25QuickCache = new WeakMap();
let FREE_BASE_CACHE = null; const FREE_FULL_CACHE = [];
const FREE_POLY_COUNT = [0, 1, 1, 2, 5, 12, 35, 108, 369, 1285, 4655];
// rectangles with k cells (a <= b): as shapes, optionally only those that fit the w x h grid (turned or not)
function rectShapesOf(k, w, h, fitBoard){
  let n = 0;
  for(let a = 1; a * a <= k; a++) if(k % a === 0){ const b = k / a; if(!fitBoard || (a <= Math.min(w, h) && b <= Math.max(w, h))) n++; }
  return n;
}
// what the grid says about the pieces: active tiles, area numbers, stamp shapes, roses per type, symbols (for Solitude)
function gatherFacts(ctx, w, h){
  const f = { T: 0, areaVals: new Set(), stampKeys: new Map(), roseCounts: new Map(), symbols: 0 };
  for(let r = 0; r < h; r++) for(let c = 0; c < w; c++){
    if(!ctx.isActive(c, r)) continue;
    f.T++;
    const a = ctx.requiredAreaAt(c, r); if(a != null) f.areaVals.add(a);
    const k = ctx.requiredShapeAt(c, r); if(k != null && !f.stampKeys.has(k)) f.stampKeys.set(k, k.split('|').length);
    const t = ctx.roseTypeAt(c, r); if(t != null) f.roseCounts.set(t, (f.roseCounts.get(t) || 0) + 1);
    f.symbols += symbolCountAt(c, r, ctx);
  }
  return f;
}
// MATCH: all pieces have the same size s. Returns the sizes s that are still possible ([] = impossible).
function matchSizeCandidates(ctx, f){
  const T = f.T;
  let lo = Math.max(ctx.sizeLo, 1); const hi = Math.min(ctx.sizeHi, T);
  if(ctx.nonBoxyRule) lo = Math.max(lo, 3);                  // every piece of 1 or 2 cells is a rectangle
  let sizes = [];
  for(let s = lo; s <= hi; s++) if(T % s === 0) sizes.push(s);   // the pieces tile the board: s divides the tile count
  if(f.areaVals.size > 1 || f.stampKeys.size > 1) return [];     // two different area numbers / two different stamp shapes: no common piece
  if(f.areaVals.size === 1){ const a = [...f.areaVals][0]; sizes = sizes.filter(s => s === a); }
  if(f.stampKeys.size === 1){ const m = [...f.stampKeys.values()][0]; sizes = sizes.filter(s => s === m); }
  else if(ctx.useBank){ const bs = new Set(ctx.bankOrientations.map(o => o.cells.length)); sizes = sizes.filter(s => bs.has(s)); }
  if(ctx.activeRoseTypes.size > 0){                          // n roses per type = n pieces, so s = T / n
    if(f.roseCounts.size < ctx.activeRoseTypes.size) return [];
    const counts = [...f.roseCounts.values()], n = counts[0];
    if(counts.some(c => c !== n)) return [];
    sizes = sizes.filter(s => T / s === n);
  }
  if(ctx.solitudeRule) sizes = sizes.filter(s => f.symbols > 0 && T / s === f.symbols);   // one symbol per piece: pieces = symbols
  if(ctx.maxRegions != null) sizes = sizes.filter(s => T / s <= ctx.maxRegions);
  return sizes;
}
// MISMATCH: all pieces have different shapes. A piece of k cells uses up one of the (few) shapes with k cells, so the
// pieces' sizes must be a way of covering the T tiles with at most q(k) pieces of k cells. Returns { ok, sizes }:
// ok = false when no cover exists; sizes = the sizes that occur in at least one cover (null = no restriction found).
function mismatchSizeInfo(ctx, w, h, f){
  const T = f.T;
  let lo = Math.max(ctx.sizeLo, 1); const hi = Math.min(ctx.sizeHi, T);
  if(ctx.nonBoxyRule) lo = Math.max(lo, 3);
  if(lo > hi) return { ok: false, sizes: null };
  const q = new Array(hi + 1).fill(0);                       // q[k] = how many different shapes with k cells a piece could have
  if(ctx.useBank){
    const per = new Map();
    const add = (key, cells) => {
      const n = cells.length; if(n < lo || n > hi) return;
      const rect = isRectangular(cells);
      if((ctx.boxyRule && !rect) || (ctx.nonBoxyRule && rect)) return;
      if(!per.has(n)) per.set(n, new Set()); per.get(n).add(key);
    };
    for(const o of ctx.bankOrientations) add(o.canonicalKey, o.cells);
    for(const [key] of f.stampKeys) add(key, key.split('|').map(s => s.split(',').map(Number)));     // a stamp's shape need not be in the bank
    for(const [n, set] of per) q[n] = set.size;
  } else {
    for(let k = lo; k <= hi; k++){
      let n = k < FREE_POLY_COUNT.length ? FREE_POLY_COUNT[k] : Infinity;
      if(ctx.boxyRule) n = rectShapesOf(k, w, h, true);
      else if(ctx.nonBoxyRule && n !== Infinity) n -= rectShapesOf(k, w, h, false);
      if(ctx.banInfo) n = Math.min(n, ctx.banInfo.countAt(k));
      q[k] = n;
    }
  }
  const qq = k => Math.min(q[k], Math.floor(T / k));
  let total = 0; for(let k = lo; k <= hi; k++) total += qq(k);
  if(ctx.activeRoseTypes.size > 0 && f.roseCounts.size === ctx.activeRoseTypes.size){
    const counts = [...f.roseCounts.values()];
    if(counts.every(c => c === counts[0]) && counts[0] > total) return { ok: false, sizes: null };   // more pieces than different shapes
  }
  const cover = skip => {                                    // which totals can be reached (one shape fewer of size `skip`)
    let reach = new Uint8Array(T + 1); reach[0] = 1;
    for(let k = lo; k <= hi; k++){
      const m = qq(k) - (k === skip ? 1 : 0);
      if(m <= 0) continue;
      const next = reach.slice();
      for(let s = 0; s <= T; s++){ if(!reach[s]) continue; for(let c = 1, t = s + k; c <= m && t <= T; c++, t += k) next[t] = 1; }
      reach = next;
    }
    return reach;
  };
  if(!cover(-1)[T]) return { ok: false, sizes: null };
  let sizes = null;
  if(hi - lo + 1 <= 40){
    const used = [];
    for(let k = lo; k <= hi; k++){ if(qq(k) <= 0) continue; if(cover(k)[T - k]) used.push(k); }
    if(used.length < hi - lo + 1) sizes = used;
  }
  return { ok: true, sizes, q: q.map((n, k) => k >= lo ? qq(k) : 0) };       // v62: the per-size counts too
}

// ============================================================================================================
// v26: counting facts for MINIMUM / MAXIMUM / RANGE (and Precision) of the piece size.
// Pure functions of (tile count, lowest size, highest size): they hold in EVERY valid tiling.
//   rangeCover(T, lo, hi)  -> { ok, usable: sorted sizes that occur in SOME cover of T tiles by pieces of lo..hi cells,
//                               reach[m]: m tiles can be covered by pieces of usable sizes (reach[0] = 1),
//                               minN[m] / maxN[m]: fewest / most pieces such a cover of m tiles can have }
// ============================================================================================================
function rangeCover(T, lo, hi, allowed){
  lo = Math.max(lo, 1); hi = Math.min(hi, T);
  if(lo > hi) return { ok: false };
  const sizes = []; for(let k = lo; k <= hi; k++) if(!allowed || allowed.has(k)) sizes.push(k);
  const dp = (list) => {
    const reach = new Uint8Array(T + 1), minN = new Int32Array(T + 1).fill(1e9), maxN = new Int32Array(T + 1).fill(-1);
    reach[0] = 1; minN[0] = 0; maxN[0] = 0;
    for(let m = 1; m <= T; m++){
      for(const k of list){
        if(k > m) break;
        if(!reach[m - k]) continue;
        reach[m] = 1;
        if(minN[m - k] + 1 < minN[m]) minN[m] = minN[m - k] + 1;
        if(maxN[m - k] + 1 > maxN[m]) maxN[m] = maxN[m - k] + 1;
      }
    }
    return { reach, minN, maxN };
  };
  const first = dp(sizes);
  if(!first.reach[T]) return { ok: false };
  // a size k is usable when the other T - k tiles can still be covered
  const usable = sizes.filter(k => first.reach[T - k]);
  const second = usable.length === sizes.length ? first : dp(usable);
  return { ok: true, usable, reach: second.reach, minN: second.minN, maxN: second.maxN };
}

function* solvePuzzle(puzzleW, puzzleH, ctx, specialEdges, nodeBudget, opts){
  const cellKey = (c,r) => `${c},${r}`;
  const baseCtx = ctx;
  ctx = deriveContext(baseCtx, opts);
  if(ctx.linkAcrossWall) return;

  const activeCells = [];
  for(let r=0; r<puzzleH; r++)
    for(let c=0; c<puzzleW; c++)
      if(ctx.isActive(c,r)) activeCells.push(cellKey(c,r));

  const totalActive = activeCells.length;
  if(totalActive === 0){ yield { type:'solution', pieces: [] }; return; }

  // focus: distance (through active cells, ignoring walls) from the cells the search should start around
  // opts.focusMode: 'near' (default when focus is given) orders every pick by distance from the focus cells;
  // 'first' only covers the focus cells first and then uses the normal ordering (fewest free neighbours).
  const focusFirst = (opts && opts.focus && opts.focusMode === 'first') ? opts.focus.map(([c,r]) => cellKey(c,r)) : null;
  let focusDist = null;
  if(opts && opts.focus && opts.focus.length && opts.focusMode !== 'first' && opts.focusMode !== 'none'){
    focusDist = new Map();
    const queue = [];
    for(const [c,r] of opts.focus){
      const k = cellKey(c,r);
      if(ctx.isActive(c,r) && !focusDist.has(k)){ focusDist.set(k, 0); queue.push([c,r]); }
    }
    for(let qi = 0; qi < queue.length; qi++){
      const [c,r] = queue[qi];
      const d = focusDist.get(cellKey(c,r));
      for(const [dc,dr] of [[1,0],[-1,0],[0,1],[0,-1]]){
        const nc = c+dc, nr = r+dr, nk = cellKey(nc,nr);
        if(!ctx.isActive(nc,nr) || focusDist.has(nk)) continue;
        focusDist.set(nk, d+1); queue.push([nc,nr]);
      }
    }
  }

  // cheap, always-valid shortcut (v26): no way to cover the board with pieces of the allowed sizes (generalises the fixed-size test below)
  if(ctx.rangeInfeasible) return;

  // cheap, always-valid shortcut: with a fixed exact size, the total active cell count
  // must be a multiple of it, or no tiling can possibly exist -- skip the search entirely.
  if(ctx.sizeLo === ctx.sizeHi && totalActive % ctx.sizeLo !== 0){
    return;
  }

  // cheap, always-valid shortcut: every piece needs exactly one rose of each active type,
  // so every active rose type must appear the same number of times on the grid (that
  // common count is necessarily the number of pieces in any valid tiling).
  if(ctx.activeRoseTypes.size > 0){
    const counts = [...ctx.roseCountByType.values()];
    if(counts.some(c => c !== counts[0])) return;
  }

  // cheap, always-valid shortcut: solitude requires every piece to have exactly one
  // symbol, so if there are no symbols anywhere on the grid, no tiling can satisfy it.
  if(ctx.solitudeRule){
    let totalSymbols = 0;
    for(const ck of activeCells){
      const [c,r] = ck.split(',').map(Number);
      totalSymbols += symbolCountAt(c,r,ctx);
    }
    if(totalSymbols === 0) return;
  }

  // cheap, always-valid shortcut: boxy and non-boxy contradict each other (every piece is a
  // rectangle vs. no piece is), so with at least one piece neither tiling can exist.
  if(ctx.boxyRule && ctx.nonBoxyRule) return;

  // cheap, always-valid shortcut: every piece of 1 or 2 cells is a rectangle, so non-boxy needs
  // pieces of at least 3 cells.
  if(ctx.nonBoxyRule && ctx.sizeHi < 3) return;

  // cheap, always-valid shortcut: mismatch requires every piece to have a distinct shape;
  // with a fixed piece count (known from a fixed precision) and a fixed shape bank, there
  // must be at least that many distinct shapes available or no tiling can exist.
  if(ctx.mismatchRule && ctx.useBank && ctx.sizeLo === ctx.sizeHi){
    const pieceCount = totalActive / ctx.sizeLo;
    const distinctShapes = new Set(ctx.bankOrientations.map(o => o.canonicalKey)).size;
    if(pieceCount > distinctShapes) return;
  }

  // cheap, always-valid shortcuts (v25) for Match / Mismatch, from counting alone:
  //  - Match: all pieces have the same size, which must divide the tile count and agree with the size limits, the bank, area numbers,
  //    stamps and the rose piece count; Mismatch: there must be enough different shapes of the right sizes to cover the board;
  //    both together allow a single piece only.
  if(ctx.matchRule || ctx.mismatchRule){
    let q = v25QuickCache.get(ctx);
    if(q === undefined){
      const f25 = gatherFacts(ctx, puzzleW, puzzleH);
      q = { ok: true };
      if(ctx.matchRule && matchSizeCandidates(ctx, f25).length === 0) q.ok = false;
      if(ctx.mismatchRule && !mismatchSizeInfo(ctx, puzzleW, puzzleH, f25).ok) q.ok = false;
      if(ctx.matchRule && ctx.mismatchRule && (f25.T < ctx.sizeLo || f25.T > ctx.sizeHi)) q.ok = false;
      v25QuickCache.set(ctx, q);
    }
    if(!q.ok) return;
  }

  // ---- 'max regions' (solver-only limit, see buildSolverContext) ----
  // Every piece has at most maxAvailSize cells, so covering R more cells needs at least ceil(R / maxAvailSize)
  // more pieces. That lower bound prunes hopelessly fragmented branches long before they are explored, and
  // (via the size filter below) lets candidate generation skip piece sizes that can no longer fit the budget.
  const maxRegions = ctx.maxRegions != null ? ctx.maxRegions : null;
  let maxAvailSize = Math.min(ctx.sizeHi, totalActive);
  if(ctx.useBank){
    let m = 0;
    for(const o of ctx.bankOrientations){
      const n = o.cells.length;
      if(n >= ctx.sizeLo && n <= maxAvailSize && n > m) m = n;
    }
    maxAvailSize = m;
  }
  // can `remaining` cells still be covered when `placed` pieces are down and no future piece exceeds `hi` cells?
  function regionCountOk(placed, remaining, hi){
    if(remaining <= 0) return placed <= maxRegions;
    if(hi < 1) return false;
    return placed + Math.ceil(remaining / hi) <= maxRegions;
  }
  // largest size any piece placed AFTER one of `sz` cells can have: under Match every piece is the same size
  let matchShapeSize = null;             // set once the first piece is placed, when matchRule is on
  function hiAfterFor(sz){
    if(ctx.matchRule) return matchShapeSize !== null ? matchShapeSize : sz;
    return maxAvailSize;
  }
  if(maxRegions !== null && !regionCountOk(0, totalActive, maxAvailSize)) return;

  // cheap, always-valid shortcuts for the area-relation walls (lt / gt / diff). Whether a relation
  // can ever hold depends only on which piece sizes are available at all, so rule out hopeless
  // layouts up front instead of letting the search discover it one tiling at a time:
  //  - every piece has the same area when Match is on, or when the size range / bank offers only
  //    one size, so '<', '>' and a non-zero difference can never be satisfied;
  //  - 'diff N' needs two available sizes exactly N apart;
  //  - if both cells of a wall carry area numbers the relation is already decided.
  if(specialEdges && specialEdges.length){
    const hiSize = Math.min(ctx.sizeHi, totalActive);
    let bankSizes = null;
    if(ctx.useBank){
      bankSizes = new Set();
      for(const o of ctx.bankOrientations){
        const n = o.cells.length;
        if(n >= ctx.sizeLo && n <= hiSize) bankSizes.add(n);
      }
    }
    const sizesDifferingBy = n => {            // can two pieces differ in area by exactly n (n >= 1)?
      if(ctx.matchRule) return false;
      if(bankSizes){ for(const a of bankSizes) if(bankSizes.has(a + n)) return true; return false; }
      return hiSize - ctx.sizeLo >= n;
    };
    for(const e of specialEdges){
      if(e.kind === 'lt' || e.kind === 'gt'){
        // v39: an arrow needs two DIFFERENT available sizes (not two sizes exactly 1 apart: a bank {1,3} is fine)
        if(ctx.matchRule) return;
        if(bankSizes ? bankSizes.size < 2 : hiSize - ctx.sizeLo < 1) return;
      } else if(e.kind === 'diff' && e.value > 0){
        if(!sizesDifferingBy(e.value)) return;
      } else continue;
      const a1 = ctx.requiredAreaAt(e.c1, e.r1), a2 = ctx.requiredAreaAt(e.c2, e.r2);
      if(a1 != null && a2 != null){
        if(e.kind === 'lt' && !(a1 < a2)) return;
        if(e.kind === 'gt' && !(a1 > a2)) return;
        if(e.kind === 'diff' && Math.abs(a1 - a2) !== e.value) return;
      }
    }
    // diff0 with two different area numbers is also decided up front
    for(const e of specialEdges){
      if(e.kind !== 'diff' || e.value !== 0) continue;
      const a1 = ctx.requiredAreaAt(e.c1, e.r1), a2 = ctx.requiredAreaAt(e.c2, e.r2);
      if(a1 != null && a2 != null && a1 !== a2) return;
    }
  }

  const specialNeighbors = new Map();
  function addSpecial(c1,r1,c2,r2,kind,value){
    const k1 = cellKey(c1,r1), k2 = cellKey(c2,r2);
    if(!specialNeighbors.has(k1)) specialNeighbors.set(k1, []);
    if(!specialNeighbors.has(k2)) specialNeighbors.set(k2, []);
    if(kind === 'lt' || kind === 'gt'){
      // directional: the second cell sees the relation from its own side, i.e. flipped
      specialNeighbors.get(k1).push({ nk:k2, kind });
      specialNeighbors.get(k2).push({ nk:k1, kind: kind === 'lt' ? 'gt' : 'lt' });
    } else {
      // symmetric: delta, gemini, diff
      specialNeighbors.get(k1).push({ nk:k2, kind, value });
      specialNeighbors.get(k2).push({ nk:k1, kind, value });
    }
  }
  (specialEdges || []).forEach(e => addSpecial(e.c1, e.r1, e.c2, e.r2, e.kind, e.value));

  const hasAreaRelations = (specialEdges || []).some(e => e.kind === 'lt' || e.kind === 'gt' || e.kind === 'diff');
  const AREA_KINDS = { lt:1, gt:1, diff:1 };
  // the size relation `kind` imposes on THIS cell's piece, given the already-placed piece of size n next to it
  function sizePredicate(kind, n, value){
    if(kind === 'lt') return sz => sz < n;
    if(kind === 'gt') return sz => sz > n;
    return sz => Math.abs(sz - n) === value;
  }

  const coverGrid = {};
  let coveredCount = 0;
  let nodes = 0;
  let placeCounter = 0;
  let matchShapeKey = null;              // set once the first piece is placed, when matchRule is on
  // (matchShapeSize -- its size, so later cells can skip straight to it -- is declared with the region-count helpers above)
  let placedCount = 0;                   // pieces currently on the grid
  const usedSizes = new Set();           // v90: sizes already used, when heteroRule is on
  const usedShapeKeys = new Set();       // shapes already used anywhere, when mismatchRule is on

  function isFree(c,r){ return ctx.isActive(c,r) && !coverGrid[cellKey(c,r)]; }

  // cheap structural proxy for "most constrained cell": fewest reachable free neighbors.
  // (a true count of valid placements would require generating candidates for every
  // uncovered cell just to pick one, which is exactly the up-front cost we're avoiding.)
  function chooseNextCell(){
    if(focusFirst){
      for(const fk of focusFirst) if(!coverGrid[fk]) return fk;
    }
    let best = null, bestScore = Infinity, bestDist = Infinity;
    for(const ck of activeCells){
      if(coverGrid[ck]) continue;
      const [c,r] = ck.split(',').map(Number);
      let score = 0;
      for(const [dc,dr] of [[1,0],[-1,0],[0,1],[0,-1]]){
        if(isFree(c+dc,r+dr) && ctx.edgeAllowed(c,r,c+dc,r+dr)) score++;
      }
      if(focusDist){
        const d = focusDist.has(ck) ? focusDist.get(ck) : 1e9;
        if(d < bestDist || (d === bestDist && score < bestScore)){ bestDist = d; bestScore = score; best = ck; }
        continue;
      }
      if(score < bestScore){ bestScore = score; best = ck; if(bestScore === 0) break; }
    }
    return best;
  }

  // predicate on the size of the piece covering cell `ck`, from the area-relation walls whose other
  // side is already placed (null when there is nothing to restrict)
  function allowedSizeFor(ck){
    const specials = specialNeighbors.get(ck);
    if(!specials) return null;
    let preds = null;
    for(const { nk, kind, value } of specials){
      if(!AREA_KINDS[kind]) continue;
      const other = coverGrid[nk];
      if(!other) continue;
      (preds || (preds = [])).push(sizePredicate(kind, other.cellCount, value));
    }
    if(!preds) return null;
    return sz => { for(const f of preds) if(!f(sz)) return false; return true; };
  }

  // forward check: after placing p, every still-uncovered cell across an area-relation wall from p
  // must have SOME piece size left that satisfies the relation (and fits in the remaining cells).
  const bankSizeSet = ctx.useBank ? new Set(ctx.bankOrientations.map(o => o.cells.length)) : null;
  function forwardCheckOk(p){
    const remaining = totalActive - coveredCount - p.cells.length;
    const hiEff = Math.min(ctx.sizeHi, remaining);
    for(const [c,r] of p.cells){
      const specials = specialNeighbors.get(cellKey(c,r));
      if(!specials) continue;
      for(const { nk, kind, value } of specials){
        if(!AREA_KINDS[kind] || coverGrid[nk]) continue;
        // `kind` is the relation p's piece must have TO the neighbor's piece, so the neighbor's size
        // must satisfy the flipped relation against p's size
        const pred = sizePredicate(kind === 'lt' ? 'gt' : kind === 'gt' ? 'lt' : kind, p.cells.length, value);
        const [nc, nr] = nk.split(',').map(Number);
        const fixed = ctx.requiredAreaAt(nc, nr);
        if(fixed != null){ if(!pred(fixed) || fixed > remaining) return false; continue; }
        if(matchShapeSize !== null && ctx.matchRule){ if(!pred(matchShapeSize)) return false; continue; }
        let ok = false;
        for(let sz = ctx.sizeLo; sz <= hiEff; sz++){
          if(bankSizeSet && !bankSizeSet.has(sz)) continue;
          if(pred(sz)){ ok = true; break; }
        }
        if(!ok) return false;
      }
    }
    return true;
  }

  function specialOk(p){
    for(const [c,r] of p.cells){
      const specials = specialNeighbors.get(cellKey(c,r));
      if(!specials) continue;
      for(const { nk, kind, value } of specials){
        const other = coverGrid[nk];
        if(!other) continue;
        if(kind === 'delta'  && other.canonicalKey === p.canonicalKey) return false;
        if(kind === 'gemini' && other.canonicalKey !== p.canonicalKey) return false;
        if(kind === 'lt'     && !(p.cells.length < other.cellCount)) return false;
        if(kind === 'gt'     && !(p.cells.length > other.cellCount)) return false;
        if(kind === 'diff'   && Math.abs(p.cells.length - other.cellCount) !== value) return false;
      }
    }
    return true;
  }

  // mingle rules are "ambient": unlike the special wall relations (only at hand-placed walls), they apply
  // to every orthogonally-adjacent pair of DIFFERENT pieces anywhere on the grid, wall or not.
  function mingleOk(p){
    if(!ctx.mingleShapeRule && !ctx.mingleAreaRule) return true;
    const cellSet = new Set(p.cells.map(([c,r]) => cellKey(c,r)));
    for(const [c,r] of p.cells){
      for(const [dc,dr] of [[1,0],[-1,0],[0,1],[0,-1]]){
        const nk = cellKey(c+dc, r+dr);
        if(cellSet.has(nk)) continue;
        const other = coverGrid[nk];
        if(!other) continue;
        if(ctx.mingleShapeRule && other.canonicalKey === p.canonicalKey) return false;
        if(ctx.mingleAreaRule && other.cellCount === p.cells.length) return false;
      }
    }
    return true;
  }

  // ---- wall-pattern rules: bricky / loopy (grid vertices), palisade (tiles), watchtower (vertices) ----
  // An edge between two active cells is a WALL when they end up in different pieces (hand-placed walls always
  // are). While the search runs it is: 1 = certainly a wall (hand/decided wall, or exactly one side already
  // covered -- the other side then belongs to a later piece), 0 = certainly the same piece, 2 = not known yet.
  // The outline (and any empty tile) counts as a wall for palisade, bricky and loopy. Watchtowers only count pieces.
  function edgeState(c1,r1,c2,r2){
    if(!ctx.edgeAllowed(c1,r1,c2,r2)) return 1;
    const k1 = cellKey(c1,r1), k2 = cellKey(c2,r2);
    const a = coverGrid[k1], b = coverGrid[k2];
    if(a && b) return a.placementId === b.placementId ? 0 : 1;
    if(a || b) return 1;
    if(ctx.hasLinks){ const ra = ctx.linkRep.get(k1); if(ra !== undefined && ra === ctx.linkRep.get(k2)) return 0; }
    return 2;
  }
  // one of the four segments meeting at a grid point: a wall when it separates two different pieces, or a piece
  // from the outline / an empty tile; two empty tiles side by side have no wall between them
  function segState(c1,r1,c2,r2){
    const a = ctx.isActive(c1,r1), b = ctx.isActive(c2,r2);
    if(!a && !b) return 0;
    if(a !== b) return 1;
    return edgeState(c1,r1,c2,r2);
  }
  function vertexOk(vx,vy){
    const act = (c,r) => ctx.isActive(c,r);
    if(ctx.brickyRule || ctx.loopyRule){
      let W = 0, U = 0;
      for(const s of [segState(vx-1,vy-1,vx,vy-1), segState(vx,vy-1,vx,vy), segState(vx-1,vy,vx,vy), segState(vx-1,vy-1,vx-1,vy)]){
        if(s === 1) W++; else if(s === 2) U++;
      }
      if(ctx.brickyRule && W === 4) return false;              // four walls meet here
      if(ctx.loopyRule && U === 0 && W === 3) return false;    // exactly three walls meet here
    }
    const tower = ctx.watchtowers.get(`${vx},${vy}`);
    if(tower != null){
      const ids = new Set(); let uncovered = 0;
      for(const [c,r] of [[vx-1,vy-1],[vx,vy-1],[vx-1,vy],[vx,vy]]){
        if(!act(c,r)) continue;
        const g = coverGrid[cellKey(c,r)];
        if(g) ids.add(g.placementId); else uncovered++;
      }
      if(ids.size + (uncovered > 0 ? 1 : 0) > tower || ids.size + uncovered < tower) return false;
    }
    return true;
  }
  function palisadeOk(c,r){
    const type = ctx.palisades.get(`${c},${r}`);
    if(type == null || !ctx.isActive(c,r)) return true;
    const st = [[0,-1],[1,0],[0,1],[-1,0]].map(([dc,dr]) => ctx.isActive(c+dc,r+dr) ? edgeState(c,r,c+dc,r+dr) : 1);   // N E S W; a side on the outline / next to an empty tile is a wall
    const unk = []; st.forEach((v,i) => { if(v === 2) unk.push(i); });
    for(let m = 0; m < (1 << unk.length); m++){
      const sd = st.slice(); unk.forEach((i,j) => { sd[i] = (m >> j) & 1; });
      const n = sd[0] + sd[1] + sd[2] + sd[3];
      const ok = type === '0' ? n === 0 : type === '1' ? n === 1 : type === '3' ? n === 3 : type === '4' ? n === 4
               : type === '2c' ? (n === 2 && sd[0] + sd[2] === 1) : (n === 2 && (sd[0] + sd[2] === 2 || sd[1] + sd[3] === 2));
      if(ok) return true;
    }
    return false;
  }
  // v89 / v91: Wally: at most 2 neighbours in the own piece (the outline and empty tiles count as neighbours outside it) = no T tetromino
  function wallyOk(c,r){
    if(!ctx.isActive(c,r)) return true;
    let n = 0;
    for(const [dc,dr] of [[0,-1],[1,0],[0,1],[-1,0]]) if(!ctx.isActive(c+dc,r+dr) || edgeState(c,r,c+dc,r+dr) !== 0) n++;
    return n >= 2;
  }
  // after a piece goes down only the vertices touching it and the tiles in/next to it can have changed
  function localOk(cells){
    if(!ctx.localRules) return true;
    const vs = new Set(), ts = new Set();
    for(const [c,r] of cells){
      for(const dx of [0,1]) for(const dy of [0,1]) vs.add(`${c+dx},${r+dy}`);
      for(const [dc,dr] of [[0,0],[1,0],[-1,0],[0,1],[0,-1]]) ts.add(`${c+dc},${r+dr}`);
    }
    for(const k of vs){ const [x,y] = k.split(',').map(Number); if(!vertexOk(x,y)) return false; }
    if(ctx.palisades.size) for(const k of ts){ if(ctx.palisades.has(k)){ const [x,y] = k.split(',').map(Number); if(!palisadeOk(x,y)) return false; } }
    if(ctx.wallyRule) for(const k of ts){ const [x,y] = k.split(',').map(Number); if(!wallyOk(x,y)) return false; }   // v89
    return true;
  }
  function allLocalOk(){
    if(!ctx.localRules) return true;
    for(let y = 0; y <= puzzleH; y++) for(let x = 0; x <= puzzleW; x++) if(!vertexOk(x,y)) return false;
    for(const k of ctx.palisades.keys()){ const [x,y] = k.split(',').map(Number); if(!palisadeOk(x,y)) return false; }
    if(ctx.wallyRule) for(let y = 0; y < puzzleH; y++) for(let x = 0; x < puzzleW; x++) if(!wallyOk(x,y)) return false;   // v89
    return true;
  }

  function collectPieces(){
    const groups = new Map();
    for(const ck of activeCells){
      const info = coverGrid[ck];
      if(!groups.has(info.placementId)) groups.set(info.placementId, { shapeId: info.shapeId, canonicalKey: info.canonicalKey, cells: [] });
      const [c,r] = ck.split(',').map(Number);
      groups.get(info.placementId).cells.push([c,r]);
    }
    return [...groups.values()];
  }

  // ---- progress estimate ----
  // The size of the search tree is unknown in advance, so 'percent done' is an ESTIMATE. It walks the path from
  // the root to the node being explored and, at every level, counts how many of that node's viable children are
  // already finished, assuming each child is an equal share of its parent. The root's child count is measured
  // exactly (see maybeProbeRoot); deeper levels use the average child count seen so far at that depth. Real
  // subtrees are rarely equal in size, so treat it as a rough guide that can stall or jump, not a promise.
  // fraction === null means no estimate is available (yet, or because the root has too many children to count).
  // Searches that finish in a fraction of a second never pay for any of this: the root is only counted once the
  // search has already been running for PROBE_AFTER_MS.
  const ROOT_PEEK_CAP = 20000, ROOT_PEEK_MS = 100;
  const PROBE_AFTER_MS = (opts && opts.probeAfterMs != null) ? opts.probeAfterMs : 150;   // (opts.probeAfterMs: test hook)
  const searchStart = Date.now();
  let rootProbed = false;
  const pathIdx = [];                    // pathIdx[d]: viable children the node at depth d has started so far
  const pathTotal = [null];              // pathTotal[d]: exact viable-child count of the node at depth d, if known
  const statSum = [], statCnt = [];      // per depth: total / number of children counts of finished nodes
  let curDepth = 0;
  // Work is NOT spread evenly over a node's children: pieces are tried small-first, which leaves big remainders
  // and so big subtrees early on, with later children cheaper. So instead of a straight line, the search learns
  // the real skew as it goes: for every finished node of any size it records what share of that node's work each
  // child POSITION (first eighth, second eighth, ...) took, pools those shares, and uses the pooled cumulative
  // curve to turn 'k of n children done' into 'fraction of the node's work done'.
  const BINS = 8;
  const profBin = new Array(BINS).fill(0);   // pooled work (nodes) by relative child position
  let profAll = 0;
  const childWork = [];                      // childWork[d]: nodes spent in each child of the node now open at depth d
  function profileCdf(u){                    // fraction of a node's work done once relative position u (0..1) is passed
    if(profAll < 300) return u;              // not enough finished work to know the skew yet -> assume even
    const x = Math.min(Math.max(u, 0), 1) * BINS;
    const b = Math.min(BINS - 1, Math.floor(x));
    let acc = 0;
    for(let k = 0; k < b; k++) acc += profBin[k];
    acc += profBin[b] * (x - b);
    return acc / profAll;
  }
  function estimateFraction(){
    if(pathTotal[0] == null) return null;
    let frac = 0, weight = 1;
    for(let d = 0; d <= curDepth; d++){
      const i = pathIdx[d];
      if(!i) break;
      let n = pathTotal[d] != null ? Math.max(pathTotal[d], i) : null;
      if(n == null) n = statCnt[d] ? Math.max(statSum[d] / statCnt[d], i) : i + 1;
      const before = profileCdf((i - 1) / n), after = profileCdf(i / n);
      frac += weight * before;
      weight *= (after - before);
    }
    return Math.min(1, Math.max(0, frac));
  }

  // everything a candidate placement must satisfy that depends only on the grid as it is right now
  function survives(p){
    if(!specialOk(p)) return false;
    if(hasAreaRelations && !forwardCheckOk(p)) return false;
    if(ctx.matchRule && matchShapeKey !== null && p.canonicalKey !== matchShapeKey) return false;
    if(ctx.mismatchRule && usedShapeKeys.has(p.canonicalKey)) return false;
    if(ctx.heteroRule && usedSizes.has(p.cells.length)) return false;              // v90: Heterogeneous
    if(!mingleOk(p)) return false;
    if(maxRegions !== null && !regionCountOk(placedCount + 1, totalActive - coveredCount - p.cells.length, hiAfterFor(p.cells.length))) return false;
    return true;
  }

  // lazily generated candidate placements for the cell `nextKey`, given the grid as it is right now
  function makeCandidates(nextKey){
    const [c,r] = nextKey.split(',').map(Number);
    // sizes the candidate generator may skip outright: those ruled out by an area-relation wall whose other
    // side is already placed, and (with max regions) those that would leave too many cells for too few pieces
    const areaFilter = hasAreaRelations ? allowedSizeFor(nextKey) : null;
    let sizeFilter = areaFilter;
    if(maxRegions !== null){
      const placedAfter = placedCount + 1, remNow = totalActive - coveredCount;
      sizeFilter = sz => (!areaFilter || areaFilter(sz)) && regionCountOk(placedAfter, remNow - sz, hiAfterFor(sz));
    }
    return candidatesForCell(ctx, c, r, isFree, ctx.matchRule ? matchShapeSize : null, sizeFilter);
  }

  // the root's viable-child count, measured by an independent run of this same solver (fresh grid, no search),
  // only once the real search has proven to be slow
  function maybeProbeRoot(){
    rootProbed = true;
    for(const ev of solvePuzzle(puzzleW, puzzleH, baseCtx, specialEdges, nodeBudget, Object.assign({}, opts, { rootCountOnly: true, probeAfterMs: PROBE_AFTER_MS, deadline: null }))){
      if(ev.type === 'root-count') pathTotal[0] = ev.n;
    }
  }

  function* backtrack(depth){
    nodes++;
    if(ctx.tick) ctx.tick();
    pathIdx[depth] = 0;
    curDepth = depth;
    if(nodeBudget && nodes > nodeBudget){ yield { type:'budget-exceeded', nodes, fraction: estimateFraction() }; return; }
    if(!rootProbed && (nodes & 15) === 0 && Date.now() - searchStart >= PROBE_AFTER_MS){
      maybeProbeRoot();
      yield { type:'progress', nodes, fraction: estimateFraction(), rootBranches: pathTotal[0] };
    }
    if(nodes % 200 === 0) yield { type:'progress', nodes, fraction: estimateFraction(), rootBranches: pathTotal[0] };

    if(coveredCount === totalActive){
      yield { type:'solution', pieces: collectPieces() };
      return;
    }
    const nextKey = chooseNextCell();
    if(!nextKey) return;

    const candidates = makeCandidates(nextKey);

    let started = 0;
    const work = childWork[depth] || (childWork[depth] = []);
    work.length = 0;
    const nodesAtEntry = nodes;
    for(const p of candidates){
      if(!survives(p)) continue;
      started++;
      pathIdx[depth] = started;
      const nodesBefore = nodes;

      const pid = ++placeCounter;
      const prevMatchShapeKey = matchShapeKey;
      const prevMatchShapeSize = matchShapeSize;
      if(ctx.matchRule && matchShapeKey === null){ matchShapeKey = p.canonicalKey; matchShapeSize = p.cells.length; }
      if(ctx.mismatchRule) usedShapeKeys.add(p.canonicalKey);
      if(ctx.heteroRule) usedSizes.add(p.cells.length);

      for(const [cc,rr] of p.cells) coverGrid[cellKey(cc,rr)] = { shapeId: p.shapeId, canonicalKey: p.canonicalKey, placementId: pid, cellCount: p.cells.length };
      coveredCount += p.cells.length;
      placedCount++;
      if(localOk(p.cells)) yield* backtrack(depth + 1);
      placedCount--;
      for(const [cc,rr] of p.cells) delete coverGrid[cellKey(cc,rr)];
      coveredCount -= p.cells.length;

      matchShapeKey = prevMatchShapeKey;
      matchShapeSize = prevMatchShapeSize;
      if(ctx.mismatchRule) usedShapeKeys.delete(p.canonicalKey);
      if(ctx.heteroRule) usedSizes.delete(p.cells.length);
      work.push(nodes - nodesBefore);
    }
    if(started >= 2 && nodes - nodesAtEntry >= 20){
      const total = nodes - nodesAtEntry;
      for(let k = 0; k < started; k++) profBin[Math.min(BINS - 1, Math.floor(k / started * BINS))] += work[k];
      profAll += total;
    }
    if(started > 0){ statSum[depth] = (statSum[depth] || 0) + started; statCnt[depth] = (statCnt[depth] || 0) + 1; }
  }

  if(!allLocalOk()){ if(opts && opts.rootCountOnly) yield { type:'root-count', n: 0 }; return; }

  if(opts && opts.rootCountOnly){
    const nextKey = chooseNextCell();
    if(!nextKey){ yield { type:'root-count', n: 0 }; return; }
    const candidates = makeCandidates(nextKey);
    let count = 0, exhausted = false;
    const t0 = Date.now();
    while(count < ROOT_PEEK_CAP){
      const nx = candidates.next();
      if(nx.done){ exhausted = true; break; }
      if(survives(nx.value)) count++;
      if(Date.now() - t0 > ROOT_PEEK_MS) break;
    }
    yield { type:'root-count', n: exhausted ? count : null };
    return;
  }

  try {
    yield* backtrack(0);
  } catch(e){
    if(e === SEARCH_TIMEOUT){ yield { type:'timeout', nodes }; return; }
    throw e;
  }
}


// ================= DEDUCTION SOLVER ("solver B") =================
//
// Instead of searching for tilings directly, this solver decides the puzzle EDGE BY EDGE. Every edge between two
// adjacent active cells that has no hand-placed wall is a "spot", and a spot is either
//   'wall'  the two cells are in different pieces   (the solver draws a wall there), or
//   'same'  the two cells are in the same piece     (the solver links them).
// For each open spot it runs a very narrow search under each assumption in turn (a few tenths of a second at most):
//   - the search EXHAUSTS without finding a tiling  =>  that assumption is impossible, so the spot is the other
//     value. This is a proof: it is only drawn when the search really ran dry, never on a timeout.
//   - the search finds a tiling                     =>  that value is possible (and the tiling is kept as a witness).
//   - the search runs out of time                   =>  inconclusive, move on.
// A proven value is applied and the scan starts again on the improved puzzle. When a whole scan teaches nothing new
// the ordinary exact solver finishes the half-solved puzzle (decided walls are real walls, decided links are
// must-link groups). If every spot got decided, that exact solver just confirms the one remaining partition.
//
// Soundness: a deduction is only ever made from an exhausted search, and the final stage is the exact solver, so
// the verdict is always exact -- the narrow searches only decide how much work the final stage has left.
// A tiling found by any narrow search is a genuine tiling of the puzzle (extra walls and links only restrict).
//
// Events yielded (the final stage forwards solvePuzzle's own events unchanged):
//   { type:'plan',    spots, fixedWalls, order }
//   { type:'testing', spot, assume, index, open, ... }        about to run a narrow search for `assume`
//   { type:'tested',  spot, assume, outcome:'contradiction'|'solution'|'timeout', ms }
//   { type:'deduce',  spot, value:'wall'|'same', source:'search'|'inference', rule, via:'search'|'probe'|'rule', cause, pass, why, open, walls, links }   (v47: via / cause / pass / why)
//   { type:'shape',   cells }                                a piece whose every boundary is now decided
//   { type:'stage',   stage:'final', stats }                 narrow scan finished, exact solver takes over
//   { type:'impossible-early', reason }                      then the generator ends with no solution
//   { type:'solution' | 'progress' | 'budget-exceeded' }     as from solvePuzzle
// A spot is { key, c1, r1, c2, r2 } with key like 'v:c,r' / 'h:c,r' (same keys as puzzle.walls).
//
// opts: testMs (100) per narrow search | testNodes (node limit instead of time: deterministic, for tests) |
//       focusMode 'near' (default) | 'mix' | 'first' | 'none': how each narrow search orders its work |
//       nearShare (0.4): in 'mix', the share of each narrow search's time spent in the 'near' ordering |
//       restart 'continue' (default: keep going round) or 'first' (after a deduction start over from the first open spot; keep
//       going round) | order 'clues' (default: spots nearest a symbol / relation wall first) or 'scan' (row by row) (spots nearest a symbol / relation wall first) |
//       useWitness (true: once a tiling is known, only the opposite value of each spot is tested) |
//       stopAtTwo (true: two tilings found => report both and stop) | nodeBudget (for the final stage) |
//       stopScan() (return true to skip straight to the final stage)
// what each 'impossible' tag means (shown when the deduction proves there is no tiling)
const WHY_TEXT = {
  'rose-count': 'the rose types do not appear equally often',
  'rose-pair': 'two roses of the same type end up in one piece',
  'rose-grow': 'a piece cannot reach a rose it still needs',
  'rose-reach': 'a piece cannot reach a rose it still needs',
  'rose-region': 'a region closed in by walls has the wrong number of roses',
  'rose-cut': 'more rose pieces must squeeze through a narrow passage than it has tiles',
  'area-place': 'an area number has no place left for its piece',
  'gd-clash': 'a gemini wall and a delta wall end up between the same two pieces',
  'diff-clash': 'two difference walls with different numbers end up between the same two pieces',
  'diff-small': 'the few small pieces (one per shape) can not reach every difference wall',
  'rose-cover': 'the rose groups can not be split into pieces with one rose of every type',
  'label': 'some tile can not belong to the piece of any symbol / number',
  'box-hall': 'more pieces need a few rectangle shapes than there are such shapes',
  'box-all': 'every rectangle that fits is used exactly once, and one of them has no place left',
  'place-probe': 'every way to place the piece of an area number (or the copy across a gemini wall) leads to a contradiction',
  'two-piece': 'the board holds two pieces, and no way of splitting the tiles between them fits the clues',
  'mismatch-hall': 'more pieces need a few shapes than there are such shapes',
  'cmp-box': 'no rectangle fits the numbers of a compass',
  'gemini-place': 'the two pieces of a gemini wall have no shape in common (or a delta wall, the same single shape)',
  'region-merge': 'two groups must be one piece: as two pieces they would need more tiles than their closed-in region has',
  'size-cut': 'a part cut off by one tile can not be covered by pieces of the one size every piece has',
  'stamp-size': 'a polyomino stamp does not fit the size rules or another symbol',
  'stamp-shape': 'two different stamps end up in one piece',
  'shape-fit': 'a piece can no longer be the shape of its stamp',
  'bank-fit': 'a piece can no longer be any shape of the bank',
  'ban-fit': 'tiles that must share a piece already contain a banned shape',
  'solitude-count': 'with Solitude every piece holds exactly one symbol, and the symbols on the grid do not allow that',
  'solitude-pair': 'two symbols end up in one piece, but Solitude allows one symbol per piece',
  'solitude-grow': 'a piece has no symbol yet and cannot reach one',
  'solitude-reach': 'a piece has no symbol yet and cannot reach one',
  'solitude-region': 'a region closed in by walls does not hold one symbol per piece',
  'area-hall': 'pieces that must differ in size (or share one size) need more tiles than their region has',
  'boxy-fit': 'with Boxy the tiles that must share a piece need a rectangle around them, and it has a hole or a wall in it',
  'boxy-corner': 'with Boxy walls run straight: at an inner corner no wall may end in the open or turn a corner',
  'boxy-place': 'a piece that must be a rectangle has no rectangle left to be',
  'boxy-line': 'with Boxy a piece of a prime number of tiles can only be a 1 x n strip, and there is no room for one',
  'nonbox-grow': 'with Non-boxy a group that is a rectangle so far must grow, and it has no way to',
  'nonbox-fit': 'with Non-boxy a group that is a rectangle so far is already as big as a piece can be',
  'nonbox-region': 'with Non-boxy a region closed in by walls can only hold rectangles (a straight strip, or one piece that is a rectangle)',
  'box-both': 'Boxy and Non-boxy together: every piece would have to be a rectangle and not be one',
  'tower-count': 'a watchtower counts more pieces than it can touch, or the walls and links decided round it leave no way to count its number',
  'tower-wall': 'the pieces round a watchtower that must all be different were forced together',
  'tower-link': 'the tiles round a watchtower that must be one piece were separated',
  'tower-wrap': 'a watchtower can only reach its number if one piece wraps round the corner, and no piece can be that big or find the way',
  'bank-count': 'the board can not be covered by pieces with the sizes of the shapes in the bank',
  'bank-region': 'a region closed in by walls can not be covered by pieces with the sizes of the shapes in the bank',
  'bank-place': 'a piece has no placement of any bank shape left',
  'bank-block': 'every shape of the bank holds a 2 x 2 block, and a tile has none within reach',
  'bank-bend': 'every shape of the bank has a bend, and a tile has none within reach',
  'pal-count': 'a palisade can not get its number of walls from the sides it has left',
  'pal-pair': 'palisades next to each other can not all get their number of walls',
  'pal-size': 'a palisade needs a bigger piece than the size rules allow (or a 4 that is not alone)',
  'pal-two': 'with only two pieces the walls round a palisade do not add up',
  'wally-count': 'a tile would get 3 neighbours in its own piece (Wally: no T tetromino)',
  'wally-two': 'with only two pieces the walls round a tile do not add up (Wally)',
  'gemini-anchor': 'the two pieces of a gemini wall each have one straight line of that length, so the copy sends one onto the other: of the few ways that do, the others fail',
  'wally-ends': 'a piece is a path with two ends (Wally): it can not get a third end, or the ends already known use up every end the pieces can have',
  'wally-line': 'the two pieces of a gemini wall have the same straight lines: this line can only end with a length its twin can have',
  'gemini-line': 'the two pieces of a gemini wall have the same straight lines: this line can only end with a length its twin can have',
  'clue-join': 'two clues can not be in different pieces',
  'clue-apart': 'two clues can not be in the same piece',
  'hetero-count': 'the board can not be split into pieces of all different sizes (Heterogeneous)',
  'hetero-size': 'two pieces would need the same size (Heterogeneous)',
  'bri-vertex': 'four walls would meet at one corner (Bricky)',
  'loo-parity': 'an odd number of walls would meet at one corner (Loopy: the pieces must be two-colourable)',
  'cmp-reach': 'a compass piece could not reach enough tiles on one of its sides (or enough tiles at all)',
  'cmp-place': 'no way is left for a compass piece to have all its numbers',
  'cmp-crowd': 'the compasses want more tiles than the board has for them (however they are split into pieces)',
  'cmp-excl': 'a tile can not be in the piece of a compass (assuming it is breaks something)',
  'gemini-shape': 'two different stamp shapes are pinned on the two sides of a same-shape wall',
  'delta-shape': 'the same stamp shape is pinned on both sides of a different-shape wall',
  'ban-size': 'every shape of a size the rules need contains a banned shape',
  'stamp-pair': 'two stamps that cannot share a piece are forced together',
  'stamp-place': 'a polyomino stamp has nowhere left to go',
  'mingle-area-single': 'only one piece size is possible, so no two pieces may touch',
  'mingle-area-clash': 'a piece has no size left that differs from all its neighbours',
  'mingle-area-pocket': 'tiles closed in by pieces of known size are too few for a piece of their own, and joining any of those pieces breaks Mingle Area',
  'mingle-area-place': 'a piece of known size has no place left where it touches no other piece of that size',
  'mingle-area-connect': 'the tiles that share the one big piece can no longer be joined up',
  'gemini-iso': 'the two pieces of a gemini wall can no longer be the same shape',
  'mingle-area-none': 'no piece can have an allowed size',
  'mingle-area-link': 'two neighbouring tiles must have the same size, so they must be one piece',
  'mingle-area-merge': 'two groups that cannot have the same size are forced into one piece',
  'mingle-area-parity': 'with two sizes only, the neighbouring pieces cannot alternate',
  'mingle-area-corner': 'with two sizes only, three pieces cannot meet at a corner',
  'mingle-shape-single': 'only one piece shape is possible, so no two pieces may touch',
  'mingle-shape-clash': 'a piece has no shape left that differs from all its neighbours',
  'mingle-shape-none': 'no piece can have an allowed shape',
  'mingle-shape-link': 'two neighbouring tiles must have the same shape, so they must be one piece',
  'mingle-shape-merge': 'two groups that cannot have the same shape are forced into one piece',
  'mingle-shape-parity': 'with two shapes only, the neighbouring pieces cannot alternate',
  'mingle-shape-corner': 'with two shapes only, three pieces cannot meet at a corner',
  'match-size': 'every piece must have the same size, and no size works for the whole board',
  'match-fit': 'no single shape fits every group of tiles that belongs together',
  'match-region': 'a region closed in by walls holds exactly one piece',
  'match-place': 'the one shape every piece must have has no place left',
  'match-compass': 'every piece must have the same shape, and no shape can be the piece of every compass',
  'match-hole': 'a piece that closes around empty cells gives every piece that hole, and the board has too few such holes',
  'cross': 'two pieces must each join two parts, and the parts lie round the free area in the order A, B, A, B: the links would cross',
  'pair-apart': 'the tile joining that group leads to a contradiction, so they are different pieces',
  'pair-join': 'the two groups as different pieces lead to a contradiction, so they are one piece',
  'mismatch-count': 'there are not enough different shapes to cover the board',
  'mismatch-stamp': 'two stamps of the same shape must be one piece, because no two pieces may share a shape',
  'mismatch-link': 'two groups that can only be the same shape must be one piece, because no two pieces may share a shape',
  'mismatch-clash': 'a piece has no shape left that the other pieces do not already use',
  'mismatch-place': 'the one shape this piece must have has no place left',
  'mismatch-pair': 'pieces that must all differ have fewer shapes between them than there are pieces',
  'match-mismatch': 'Match and Mismatch together allow only one piece, so the whole board is one piece',
  'range-count': 'the board can not be covered by pieces of the allowed sizes',
  'range-region': 'a region closed in by walls can not be covered by pieces of the allowed sizes',
  'min-grow': 'a piece is smaller than the minimum and has only one way to grow',
  'min-reach': 'a piece can not reach as many tiles as the minimum asks for',
  'area-count': 'the numbered pieces do not fit into the tiles of a region closed in by walls',
  'area-sum': 'the area numbers leave no (or too few) tiles for a piece without a number',
  'bridge-count': 'the tiles behind a single connection cannot be covered by whole pieces any other way',
  'euler-count': 'the walls reaching the border or branching would make more pieces than the puzzle has',
  'colour-count': 'with so few pieces the walls colour the groups, and two groups of one colour have to be one piece',
  'match-iso': 'the equal pieces are mirror images / rotations of each other, which fixes which tile belongs to which piece',
  'area-region': 'the numbered pieces of a region closed in by walls leave no other way',
  'area-rel': 'the walls that compare sizes leave a piece no size it can have',
  'area-chain': 'the pieces on a chain of walls that compare sizes need more tiles than their region has',
  'area-parity': 'the walls that differ by N need an odd and an even number of tiles on the same piece',
  'size': 'a piece can not have a size the size rules allow',
  'wall-inside': 'a wall runs inside one piece'
};
for(const k of Object.keys(WHY_TEXT)) if(k.startsWith('mingle-area-')) WHY_TEXT['hetero-' + k.slice(12)] = WHY_TEXT[k].replace('Mingle Area', 'Heterogeneous') + ' (Heterogeneous: touching pieces differ in size too)';   // v90
const RULE_TAGS = new Set(['clue-join', 'clue-apart', 'hetero-count', 'hetero-size', 'hetero-single', 'hetero-clash', 'hetero-pocket', 'hetero-place', 'hetero-connect', 'hetero-none', 'hetero-link', 'hetero-merge', 'hetero-parity', 'hetero-corner', 'rose-count', 'rose-pair', 'rose-grow', 'rose-reach', 'rose-region', 'rose-cut', 'cmp-budget', 'diff-clash', 'diff-small', 'rose-cover', 'label', 'box-hall', 'box-all', 'place-probe', 'two-piece', 'mismatch-hall', 'cmp-box', 'gemini-place', 'region-merge', 'size-cut', 'area-place', 'gd-clash', 'stamp-size', 'stamp-shape', 'shape-fit', 'bank-fit', 'stamp-pair', 'stamp-place', 'mingle-area-single', 'mingle-area-clash', 'mingle-area-pocket', 'mingle-area-place', 'mingle-area-connect', 'gemini-iso', 'mingle-area-none', 'mingle-area-link', 'mingle-area-merge', 'mingle-area-parity', 'mingle-area-corner', 'mingle-shape-single', 'mingle-shape-clash', 'mingle-shape-none', 'mingle-shape-link', 'mingle-shape-merge', 'mingle-shape-parity', 'mingle-shape-corner', 'match-size', 'match-fit', 'match-region', 'match-place', 'match-compass', 'match-hole', 'cross', 'pair-apart', 'pair-join', 'mismatch-count', 'mismatch-stamp', 'mismatch-link', 'mismatch-clash', 'mismatch-place', 'mismatch-pair', 'match-mismatch', 'range-count', 'range-region', 'min-grow', 'min-reach', 'area-count', 'area-region', 'area-rel', 'area-chain', 'area-parity', 'ban-fit', 'ban-size', 'gemini-shape', 'delta-shape', 'area-hall', 'solitude-count', 'solitude-pair', 'solitude-grow', 'solitude-reach', 'solitude-region', 'boxy-fit', 'boxy-corner', 'boxy-place', 'boxy-line', 'boxy-fill', 'nonbox-grow', 'nonbox-fit', 'nonbox-region', 'box-both', 'tower-count', 'tower-wall', 'tower-link', 'tower-wrap', 'bank-count', 'bank-region', 'bank-place', 'bank-block', 'bank-bend', 'pal-count', 'pal-wall', 'pal-link', 'pal-pair', 'pal-size', 'pal-two', 'wally-wall', 'wally-link', 'wally-count', 'wally-two', 'gemini-anchor', 'wally-ends', 'wally-line', 'gemini-line', 'bri-three', 'bri-pinch', 'bri-vertex', 'loo-outline', 'loo-three', 'loo-corner', 'loo-color', 'loo-parity', 'cmp-block', 'cmp-reach', 'cmp-wrap', 'cmp-place', 'cmp-crowd', 'cmp-excl', 'area-sum', 'bridge-count', 'euler-count', 'colour-count', 'match-iso']);
function* deduceSolve(w, h, ctx, specialEdges, opts){
  opts = opts || {};
  const testMs = opts.testMs != null ? opts.testMs : 100;
  const testNodes = opts.testNodes || 0;
  const restart = opts.restart === 'first' ? 'first' : 'continue';
  const order = opts.order === 'scan' ? 'scan' : 'clues';
  const useWitness = opts.useWitness !== false;
  const stopAtTwo = opts.stopAtTwo !== false;
  const finalBudget = opts.nodeBudget || 0;
  const exactMode = opts.exact === 'old' ? 'old' : 'edge';      // v40: which exact search runs in the final stage ('edge' = new default, 'old' = solvePuzzle); the narrow-test scan only runs with 'old' (or opts.scan)
  const finalOnly = !!opts.finalOnly;                           // v40: skip probes + scan (comparison of the exact searches)
  let scanTimeoutRun = 0;                                                       // v71: narrow tests in a row that timed out
  const stopScan = () => nowMs() > scanCapAt || (!opts.fullScan && opts.scanTimeoutStop !== 0 && scanTimeoutRun >= (opts.scanTimeoutStop || 60)) || (opts.stopScan ? opts.stopScan() : false);     // v40: + the portfolio's cap on the scan  (an adaptive 'stop after 30 tests without a contradiction' was tried and is WRONG: Zone3/0956 and 0908v2 find their first contradictions later)
  const focusMode = opts.focusMode || 'near';
  const N = w * h;
  const cid = (c,r) => r * w + c;

  // ---- the edges ----
  const edges = [];                 // every active-active adjacency: { key, c1,r1,c2,r2, a,b, fixed, state }
  const edgeByKey = new Map();      // state: 0 open, 1 wall, 2 same
  function addEdge(orient, c1, r1, c2, r2){
    const fixed = !ctx.edgeAllowed(c1, r1, c2, r2);
    const e = { key: `${orient}:${c1},${r1}`, idx: edges.length, c1, r1, c2, r2, a: cid(c1,r1), b: cid(c2,r2), fixed, state: fixed ? 1 : 0 };
    edges.push(e); edgeByKey.set(e.key, e);
  }
  const activeIds = [];
  for(let r=0; r<h; r++) for(let c=0; c<w; c++){
    if(!ctx.isActive(c,r)) continue;
    activeIds.push(cid(c,r));
    if(c+1 < w && ctx.isActive(c+1,r)) addEdge('v', c, r, c+1, r);
    if(r+1 < h && ctx.isActive(c,r+1)) addEdge('h', c, r, c, r+1);
  }
  const edgeBetween = (c1,r1,c2,r2) => r1 === r2 ? edgeByKey.get(`v:${Math.min(c1,c2)},${r1}`) : edgeByKey.get(`h:${c1},${Math.min(r1,r2)}`);
  const spots = edges.filter(e => !e.fixed);
  // v42: euler-count budget  b + T + 2X <= 2(Kmax - R + C - 1)
  const eVert = new Uint8Array((w + 1) * (h + 1)), eDeg = new Int32Array((w + 1) * (h + 1));
  let eulerBudget = null, eulerRC = null;
  if(((ctx.pieceCapMax != null && ctx.pieceCapMax <= 16) || ctx.matchRule || opts.edgePick === 'end') && opts.euler !== false){
    const W1 = w + 1, lp = new Int32Array(W1 * (h + 1)); for(let i = 0; i < lp.length; i++) lp[i] = i;
    const lf = x => { while(lp[x] !== x){ lp[x] = lp[lp[x]]; x = lp[x]; } return x; };
    for(const id of activeIds){
      const x = id % w, y = (id - x) / w;
      for(const [ax, ay, bx, by, nx, ny] of [[x, y, x + 1, y, x, y - 1], [x, y + 1, x + 1, y + 1, x, y + 1], [x, y, x, y + 1, x - 1, y], [x + 1, y, x + 1, y + 1, x + 1, y]]){
        if(nx >= 0 && nx < w && ny >= 0 && ny < h && ctx.isActive(nx, ny)) continue;          // not an outline edge
        const a = ay * W1 + ax, b = by * W1 + bx; eVert[a] = 1; eVert[b] = 1; lp[lf(a)] = lf(b);
      }
    }
    let C = 0; for(let i = 0; i < lp.length; i++) if(eVert[i] && lf(i) === i) C++;            // separate outlines (outer + holes)
    const tp = new Int32Array(N); for(let i = 0; i < N; i++) tp[i] = i;
    const tf = x => { while(tp[x] !== x){ tp[x] = tp[tp[x]]; x = tp[x]; } return x; };
    for(const e of edges) tp[tf(e.a)] = tf(e.b);
    let R = 0; for(const id of activeIds) if(tf(id) === id) R++;                              // edge-connected parts of the board
    eulerRC = { R, C };
    const bud = (ctx.pieceCapMax != null && ctx.pieceCapMax <= 16) ? 2 * (ctx.pieceCapMax - R + C - 1) : -1;
    if(bud >= 0) eulerBudget = bud;
    {
      for(const e of edges){
        if(e.r1 === e.r2){ const c = Math.min(e.c1, e.c2); e.v1 = e.r1 * W1 + c + 1; e.v2 = (e.r1 + 1) * W1 + c + 1; }      // 'v' edge: the line x=c+1 from y=r to y=r+1
        else { const r = Math.min(e.r1, e.r2); e.v1 = (r + 1) * W1 + e.c1; e.v2 = (r + 1) * W1 + e.c1 + 1; }                   // 'h' edge: the line y=r+1 from x=c to x=c+1
      }
    }
  }
  const eulerBudget0 = eulerBudget;
  const spotView = e => ({ key: e.key, c1: e.c1, r1: e.r1, c2: e.c2, r2: e.r2 });

  // ---- same-piece groups (union-find) ----
  const parent = new Int32Array(N); for(let i=0; i<N; i++) parent[i] = i;
  const members = new Map(); for(const i of activeIds) members.set(i, [i]);
  function find(x){ while(parent[x] !== x){ parent[x] = parent[parent[x]]; x = parent[x]; } return x; }
  let factRec = false; const factLog = [];               // v93: facts about tiles that do not touch (see patch_core93.py)
  function union(a, b){
    let ra = find(a), rb = find(b);
    if(ra === rb) return;
    if(factRec && Math.abs(a % w - b % w) + Math.abs(((a - a % w) - (b - b % w)) / w) !== 1) factLog.push([a, b, 'far-join']);       // v93
    if(members.get(ra).length < members.get(rb).length){ const t = ra; ra = rb; rb = t; }
    parent[rb] = ra;
    for(const m of members.get(rb)) members.get(ra).push(m);
    members.delete(rb);
  }
  // v90: the puzzle's own links are decided 'same' from the start
  for(const [c1, r1, c2, r2] of (ctx.puzzleLinks || [])){
    const e = edgeBetween(c1, r1, c2, r2);
    if(!e || e.state === 1) continue;                     // a wall on a link: ctx.linkAcrossWall (the search finds nothing)
    e.state = 2; union(e.a, e.b);
  }
  // v90: Heterogeneous. The board has to be a sum of DIFFERENT allowed sizes; a finished piece takes its size from every other group.
  const heteroOn = !!ctx.heteroRule;
  const heteroAlias = heteroOn && !ctx.mingleAreaReal;    // Size Separation logic runs for Heterogeneous: name it so
  const tagOut = r => (heteroAlias && typeof r === 'string' && r.startsWith('mingle-area-')) ? 'hetero-' + r.slice(12) : r;
  let heteroStatic = false;
  if(heteroOn){
    const T = activeIds.length, lo = Math.max(1, ctx.sizeLo, ctx.nonBoxyRule ? 3 : 1), hi = Math.min(ctx.sizeHi, T);
    let sizes = []; for(let s = lo; s <= hi; s++) sizes.push(s);
    if(ctx.useBank){ const bs = new Set(ctx.bankOrientations.map(o => o.cells.length)); sizes = sizes.filter(s => bs.has(s)); }
    const can = new Uint8Array(T + 1); can[0] = 1;
    for(const s of sizes) for(let t = T; t >= s; t--) if(can[t - s]) can[t] = 1;
    if(!can[T]) heteroStatic = true;
  }
  function heteroStep(need, capOf){
    const used = new Map();                                // size -> rep of the finished piece
    for(const [rep, mem] of members){
      if(need.get(rep) !== capOf.get(rep) || mem.length !== need.get(rep) || !groupComplete(rep, mem)) continue;
      if(used.has(mem.length)){ why = 'hetero-size'; return false; }
      used.set(mem.length, rep);
    }
    if(used.size === 0) return true;
    for(const rep of members.keys()){
      if(used.get(members.get(rep).length) === rep) continue;
      let lo = need.get(rep), hi = capOf.get(rep);
      while(lo <= hi && used.has(lo)) lo++;
      while(hi >= lo && used.has(hi)) hi--;
      if(lo > hi){ why = 'hetero-size'; return false; }
      need.set(rep, lo); capOf.set(rep, hi);
    }
    return true;
  }

  // ---- compass facts (v20): pairs of tiles that can never share a piece, found without any search ----
  const forbidden = [];                       // [idA, idB]
  if(ctx.compasses && ctx.compasses.size > 0){
    for(const key of ctx.compasses.keys()){
      const [cx, cy] = key.split(',').map(Number);
      if(!ctx.isActive(cx, cy)) continue;
      for(const id of activeIds){
        const x = id % w, y = (id - x) / w;
        if(x === cx && y === cy) continue;
        if(ctx.compasses.has(`${x},${y}`) && (y < cy || (y === cy && x < cx))) continue;   // compass-compass pairs once
        if(compassCannotShare(ctx, cx, cy, x, y)) forbidden.push([cid(cx, cy), id]);
      }
    }
  }

  {
    const areaCells = [], shapeCells = [];
    for(const id of activeIds){
      const x = id % w, y = (id - x) / w;
      const a = ctx.requiredAreaAt(x, y); if(a != null) areaCells.push([id, a]);
      const sh = ctx.requiredShapeAt(x, y); if(sh != null) shapeCells.push([id, sh]);
    }
    for(let i = 0; i < areaCells.length; i++) for(let j = i + 1; j < areaCells.length; j++) if(areaCells[i][1] !== areaCells[j][1]) forbidden.push([areaCells[i][0], areaCells[j][0]]);
    for(let i = 0; i < shapeCells.length; i++) for(let j = i + 1; j < shapeCells.length; j++) if(shapeCells[i][1] !== shapeCells[j][1]) forbidden.push([shapeCells[i][0], shapeCells[j][0]]);
  }
  if(ctx.watchtowers && ctx.watchtowers.size > 0){        // v33
    for(const [key, T] of ctx.watchtowers){
      const [vx, vy] = key.split(',').map(Number), t = [];
      for(const [c, r] of [[vx - 1, vy - 1], [vx, vy - 1], [vx - 1, vy], [vx, vy]]) if(c >= 0 && r >= 0 && c < w && r < h && ctx.isActive(c, r)) t.push(cid(c, r));
      if(t.length === T) for(let i = 0; i < t.length; i++) for(let j = i + 1; j < t.length; j++) forbidden.push([t[i], t[j], 'tower-wall']);
    }
  }
  // ============================================================================================================
  // v23: facts about ROSE WINDOWS, POLYOMINO STAMPS and the SHAPE BANK
  // Everything in this block holds in EVERY valid tiling (never a guess), so it can only decide edges, never lose a
  // solution. Each rule has a short tag that is attached to the deduce events (event.rule) and counted in stats.byRule;
  // the page footer lists them (build/improved_rules.json).
  //   rose-count    every rose type must appear equally often (that count = number of pieces) or the puzzle is impossible
  //   rose-pair     two roses of one type can never share a piece  -> no merge, wall between neighbouring ones
  //   rose-grow     a group that lacks a rose type must keep growing: one way out => that edge is NOT a wall
  //   rose-reach    ... and it must still be able to reach a rose of each missing type (within the size limit)
  //   rose-region   a region closed in by walls must hold the same number of every rose type; exactly one => it is one piece
  //   rose-size     (context) a piece has exactly one tile per rose type: size >= k, <= k + tiles without a rose, ...
  //   stamp-size    a stamp fixes the size of its piece (like an area number)
  //   shape-fit     the cells known to be together must still fit inside the stamp's shape
  //   bank-fit      ... or, with no stamp in the group, inside some shape of the bank
  //   stamp-pair    two same-shape stamps that no single placement can hold are never in one piece
  //   stamp-place   where can the stamp still go? what every remaining placement agrees on is decided
  // ============================================================================================================
  let searchLite = false;                  // v40: set by the edge search (opts.edgeLite) to skip heavy pruning-only steps
  const portSeen = new Set();              // v40: tilings already reported by an earlier slice
  let scanCapAt = Infinity;                // v40: the scan stops at this nowMs() time (portfolio)
  let why = '', failWhy = '';                   // 'why' = tag of the last failed check, failWhy = what made propagate() give up
  const hasCompass = !!(ctx.compasses && ctx.compasses.size > 0);
  const adjE = Array.from({ length: N }, () => []);
  for(const e of edges){ adjE[e.a].push({ e, o: e.b }); adjE[e.b].push({ e, o: e.a }); }
  // ============================================================================================================
  // v35: PALISADES. Before v35 a palisade was only checked by the search (`palisadeOk`); the propagation did not know it at all.
  // Everything here holds in EVERY valid tiling (never a guess), so it can only decide edges, never lose a solution.
  //   A palisade on a tile says how many of its 4 sides are walls. A side on the outline / next to an empty tile is a wall.
  //   0 = no wall, 1 = one, 2s = two OPPOSITE walls (straight), 2c = two walls at a right angle (bend), 3, 4 = a single tile.
  //   Side bits: 1 = N, 2 = E, 4 = S, 8 = W (set = wall).
  //   pal-count   a tile has no combination of sides left that fits its number (e.g. a 0 on the outline, a 1 / 0 on a corner, a 2s in a corner)
  //   pal-wall    every combination left has a wall on that side (a 3 / 4 / 2s / 2c against the outline: the sides that are left)
  //   pal-link    every combination left has an open side there (a 1 on the outline: the other three sides are links)
  //   pal-pair    palisades touching each other (side by side or corner to corner, up to 6 in one window) are tried together:
  //               every wall / link pattern of the sides of the window, kept only if each tile has its number, no wall has the same piece
  //               on both ends (so a 2x2 block never has exactly one wall) and no link joins two pieces known to differ. What all patterns
  //               share is decided. This is where the corner rules come from: a 1 corner to corner with a straight 2 must put its wall on
  //               one of the two sides facing the 2 (the 2 has exactly one open side towards the block), so the two far sides are links.
  //   pal-size    (in pieceInfo) a tile with k open sides is in a piece of at least k + 1 tiles (0: 5, 1: 4, 2: 3, 3: 2); a 4 is a piece of one
  //   pal-two     only 2 pieces can exist (Precision / Minimum that leaves room for two, 2 roses of a type, at most 2 regions): every wall
  //               separates the two pieces, so the two sides of a wall are different and the two sides of a link are equal ("colours").
  //               Round any cycle the number of walls is even. A straight 2: the tiles on its two opposite sides are the same piece
  //               (even when nothing joins them), a bend 2: they are different pieces. Used as one parity union-find over all tiles.
  //   Placements (stamp / bank / Boxy / Match / Mismatch candidates) also have to give every palisade tile inside them the right number of
  //   neighbours (a piece never gives a 4 a neighbour, a rectangle gives its inner tile 4), and no palisade tile outside next to it can be
  //   a 0 (its side towards the piece is a wall).
  // ============================================================================================================
  const PAL_MASKS = { '0': [0], '1': [1, 2, 4, 8], '2s': [5, 10], '2c': [3, 6, 12, 9], '3': [7, 14, 13, 11], '4': [15] };
  const palList = [], palAt = new Int32Array(N).fill(-1);
  let palMin = null, palCap = null;               // v53c: palCap = largest piece a palisade tile can be in (0 = no bound)
  const wallyOn = !!ctx.wallyRule;                       // v89
  const pop4 = m => (m & 1) + ((m >> 1) & 1) + ((m >> 2) & 1) + ((m >> 3) & 1);
  if((ctx.palisades && ctx.palisades.size > 0) || wallyOn){
    palMin = new Int8Array(N);
    for(const [key, type0] of (ctx.palisades || new Map())){
      const type = String(type0), masks = PAL_MASKS[type];
      if(!masks) continue;
      const [pc, pr] = key.split(',').map(Number);
      if(!ctx.isActive(pc, pr)) continue;
      const sd = [[0, -1], [1, 0], [0, 1], [-1, 0]].map(([dc, dr]) => {
        const x = pc + dc, y = pr + dr;
        return (x < 0 || y < 0 || x >= w || y >= h || !ctx.isActive(x, y)) ? null : { e: edgeBetween(pc, pr, x, y), o: cid(x, y) };
      });
      let fixedM = 0; sd.forEach((s, i) => { if(!s) fixedM |= 1 << i; });
      const ok = masks.filter(m => (m & fixedM) === fixedM && (!wallyOn || pop4(m) >= 2));   // v89 / v91: + Wally (outline sides count)
      const okMask = new Uint8Array(16); for(const m of ok) okMask[m] = 1;
      const wallOk = [0, 1, 2, 3].map(i => ok.some(m => (m >> i) & 1));
      const pop = m => (m & 1) + ((m >> 1) & 1) + ((m >> 2) & 1) + ((m >> 3) & 1);
      const id = cid(pc, pr);
      palMin[id] = type === '4' ? 1 : 1 + (4 - pop(masks[0]));
      palAt[id] = palList.length;
      palList.push({ id, c: pc, r: pr, type, sd, ok, okMask, wallOk });
    }
    // v89 / v91: Wally: every other active tile gets a hidden palisade 'W' (at least 2 walls, the outline counts: no T tetromino)
    if(wallyOn) for(const id of activeIds){
      if(palAt[id] >= 0) continue;
      const pc = id % w, pr = (id - pc) / w;
      const sd = [[0, -1], [1, 0], [0, 1], [-1, 0]].map(([dc, dr]) => {
        const x = pc + dc, y = pr + dr;
        return (x < 0 || y < 0 || x >= w || y >= h || !ctx.isActive(x, y)) ? null : { e: edgeBetween(pc, pr, x, y), o: cid(x, y) };
      });
      let fixedM = 0; sd.forEach((s, i) => { if(!s) fixedM |= 1 << i; });
      const ok = []; for(let m = 15; m >= 0; m--) if((m & fixedM) === fixedM && pop4(m) >= 2) ok.push(m);     // v91: outline sides count
      const okMask = new Uint8Array(16); for(const m of ok) okMask[m] = 1;
      const wallOk = [0, 1, 2, 3].map(i => ok.some(m => (m >> i) & 1));
      palAt[id] = palList.length;
      palList.push({ id, c: pc, r: pr, type: 'W', wally: true, sd, ok, okMask, wallOk });
    }
    // v53c: a 3 joins its piece through its one open side; when every side that can be open leads to another 3, that 3's only open side points
    // back, so the piece is exactly those two tiles (a domino, direction unknown). palCap = 2 feeds the size (need / cap, Mingle Area, ...).
    if(opts.palDomino !== false) for(const P of palList){
      if(P.type !== '3') continue;
      let any = false, all3 = true;
      for(let i = 0; i < 4; i++){
        if(!P.sd[i] || !P.ok.some(m => !((m >> i) & 1))) continue;          // this side is a wall in every allowed mask
        any = true;
        const q = palAt[P.sd[i].o];
        if(q < 0 || palList[q].type !== '3'){ all3 = false; break; }
      }
      if(any && all3){ if(!palCap) palCap = new Int8Array(N); palCap[P.id] = 2; }
    }
  }
  const palOn = palList.length > 0;
  // the masks of a tile that still agree with the decided edges
  function palMasksNow(t){
    const out = [];
    for(const m of t.ok){
      let good = true;
      for(let i = 0; i < 4; i++){
        const s = t.sd[i]; if(!s) continue;
        const st = s.e.state;
        if(st === 1 ? !((m >> i) & 1) : (st === 2 && ((m >> i) & 1))){ good = false; break; }
      }
      if(good && (!briOn || briPalMask(t, m)) && (!looOn || looPalMask(t, m))) out.push(m);   // v36 / v37
    }
    return out;
  }
  // a complete piece P (marked in markBuf) has to give every palisade tile in it the right sides, and none outside may need a link towards it
  function palPlaceOk(P){
    for(const id of P){
      const pi = palAt[id];
      if(pi >= 0){
        const t = palList[pi]; let m = 0;
        for(let i = 0; i < 4; i++){ const s = t.sd[i]; if(!s || markBuf[s.o] !== markGen) m |= 1 << i; }
        if(!t.okMask[m]) return false;
      }
      for(const { o } of adjE[id]){
        if(markBuf[o] === markGen) continue;
        const pj = palAt[o]; if(pj < 0) continue;
        const t = palList[pj];
        for(let i = 0; i < 4; i++){ const s = t.sd[i]; if(s && s.o === id){ if(!t.wallOk[i]) return false; break; } }
      }
    }
    return true;
  }
  // --- 1. one tile: which of its side patterns are left? ---
  function palTileStep(){
    const out = [], link = [];
    for(const t of palList){
      const ms = palMasksNow(t);
      if(ms.length === 0){ why = t.wally ? 'wally-count' : 'pal-count'; return null; }
      for(let i = 0; i < 4; i++){
        const s = t.sd[i]; if(!s || s.e.state !== 0) continue;
        let all1 = true, all0 = true;
        for(const m of ms){ if((m >> i) & 1) all0 = false; else all1 = false; }
        if(all1){ s.e.state = 1; out.push({ e: s.e, value: 'wall', rule: t.wally ? 'wally-wall' : 'pal-wall' }); }
        else if(all0){ s.e.state = 2; link.push(s.e); out.push({ e: s.e, value: 'same', rule: t.wally ? 'wally-link' : 'pal-link' }); }
      }
    }
    for(const e of link) union(e.a, e.b);
    return out;
  }
  // --- 2. only two pieces: colours (parity union-find) ---
  let palTwoCache = null;
  function palTwoOn(){
    if(palTwoCache !== null) return palTwoCache;
    let mx = Infinity;
    if(ctx.maxRegions != null) mx = Math.min(mx, ctx.maxRegions);
    if(ctx.sizeLo >= 1) mx = Math.min(mx, Math.floor(activeIds.length / ctx.sizeLo));
    if(roseTypeList.length > 0 && roseCount[0] >= 1) mx = Math.min(mx, roseCount[0]);
    palTwoCache = mx <= 2;
    return palTwoCache;
  }
  const ppar = new Int32Array(N), prel = new Uint8Array(N);
  let pRel = 0;
  function pfind(x){
    let r = x, p = 0;
    while(ppar[r] !== r){ p ^= prel[r]; r = ppar[r]; }
    let cur = x, cp = p;
    while(cur !== r){ const nx = ppar[cur], old = prel[cur]; ppar[cur] = r; prel[cur] = cp; cur = nx; cp ^= old; }
    pRel = p;
    return r;
  }
  function padd(a, b, x){                                   // colour(a) xor colour(b) = x; false = contradiction
    const ra = pfind(a), pa = pRel, rb = pfind(b), pb = pRel;
    if(ra === rb) return (pa ^ pb) === x;
    ppar[ra] = rb; prel[ra] = pa ^ pb ^ x;
    return true;
  }
  const palTwoTag = (ctx.palisades && ctx.palisades.size > 0) ? 'pal-two' : 'wally-two';    // v89
  function palParityStep(dmap){
    for(const id of activeIds){ ppar[id] = id; prel[id] = 0; }
    for(const id of activeIds){ const r = find(id); if(r !== id && !padd(id, r, 0)){ why = palTwoTag; return null; } }
    for(const e of edges){ if(e.state === 0) continue; if(!padd(e.a, e.b, e.state === 1 ? 1 : 0)){ why = palTwoTag; return null; } }
    for(const [ra, set] of dmap) for(const rb of set) if(ra < rb && !padd(ra, rb, 1)){ why = palTwoTag; return null; }
    for(const t of palList){
      const ms = palMasksNow(t);
      if(ms.length === 0){ why = t.wally ? 'wally-count' : 'pal-count'; return null; }
      for(let i = 0; i < 4; i++) for(let j = i + 1; j < 4; j++){
        const a = t.sd[i], b = t.sd[j]; if(!a || !b) continue;
        const x = ((ms[0] >> i) ^ (ms[0] >> j)) & 1;
        let same = true; for(const m of ms) if((((m >> i) ^ (m >> j)) & 1) !== x){ same = false; break; }
        if(same && !padd(a.o, b.o, x)){ why = palTwoTag; return null; }
      }
    }
    const out = [], link = [];
    for(const e of spots){
      if(e.state !== 0) continue;
      const ra = pfind(e.a), pa = pRel, rb = pfind(e.b), pb = pRel;
      if(ra !== rb) continue;
      if(((pa ^ pb) & 1) === 0){ e.state = 2; link.push(e); out.push({ e, value: 'same', rule: palTwoTag }); }
      else { e.state = 1; out.push({ e, value: 'wall', rule: palTwoTag }); }
    }
    for(const e of link) union(e.a, e.b);
    return out;
  }
  // --- 3. palisades that touch: enumerate the sides of a small window together ---
  const PAL_WIN_MAX = 6, PAL_NODE_CAP = 20000;
  const wpar = new Int32Array(N).fill(-1);                  // scratch union-find over group reps: -1 = its own root
  const wfind = x => { while(wpar[x] !== -1) x = wpar[x]; return x; };
  const PAL_NB = [[0, -1], [1, 0], [0, 1], [-1, 0], [-1, -1], [1, -1], [1, 1], [-1, 1]];
  function palWindowStep(dmap){
    const out = [], link = [], done = new Set();
    for(const t0 of palList){
      if(t0.wally) continue;                                // v89: hidden Wally tiles stay out of the windows
      const wt = [t0];
      for(const [dx, dy] of PAL_NB){
        if(wt.length >= PAL_WIN_MAX) break;
        const x = t0.c + dx, y = t0.r + dy;
        if(x < 0 || y < 0 || x >= w || y >= h) continue;
        const pi = palAt[cid(x, y)]; if(pi >= 0 && !palList[pi].wally) wt.push(palList[pi]);
      }
      if(wt.length < 2) continue;
      const wkey = wt.map(t => t.id).sort((a, b) => a - b).join(',');
      if(done.has(wkey)) continue; done.add(wkey);
      // variables: the open sides of the tiles + the other edges of every 2x2 block that holds two of them
      const V = [], vIdx = new Map(), fixedWalls = [];
      const addE = e => { if(e.state === 0){ if(!vIdx.has(e.idx)){ vIdx.set(e.idx, V.length); V.push(e); } } else if(e.state === 1) fixedWalls.push(e); };
      const inW = new Set(wt.map(t => t.id)), bseen = new Set();
      for(const t of wt) for(const s of t.sd) if(s) addE(s.e);
      for(const t of wt) for(const [bx, by] of [[t.c - 1, t.r - 1], [t.c, t.r - 1], [t.c - 1, t.r], [t.c, t.r]]){
        if(bx < 0 || by < 0 || bx + 1 >= w || by + 1 >= h) continue;
        const bk = by * w + bx; if(bseen.has(bk)) continue; bseen.add(bk);
        let n = 0; for(const [x, y] of [[bx, by], [bx + 1, by], [bx, by + 1], [bx + 1, by + 1]]){ if(!ctx.isActive(x, y)){ n = -9; break; } if(inW.has(cid(x, y))) n++; }
        if(n < 2) continue;
        addE(edgeBetween(bx, by, bx + 1, by)); addE(edgeBetween(bx + 1, by, bx + 1, by + 1)); addE(edgeBetween(bx, by + 1, bx + 1, by + 1)); addE(edgeBetween(bx, by, bx, by + 1));
      }
      if(V.length === 0) continue;
      const nv = V.length, val = new Int8Array(nv).fill(-1);
      const ra = V.map(e => find(e.a)), rb = V.map(e => find(e.b));
      const fw = fixedWalls.map(e => [find(e.a), find(e.b)]);
      // per tile: the variable index of each side (-1 = decided / outline)
      const tv = wt.map(t => t.sd.map(s => (s && s.e.state === 0) ? vIdx.get(s.e.idx) : -1));
      const tileOf = Array.from({ length: nv }, () => []);
      wt.forEach((t, k) => tv[k].forEach(v => { if(v >= 0) tileOf[v].push(k); }));
      const tileOk = k => {
        const t = wt[k];
        for(const m of t.ok){
          let good = true;
          for(let i = 0; i < 4; i++){
            const s = t.sd[i]; if(!s) continue;
            const v = tv[k][i], st = v >= 0 ? val[v] : (s.e.state === 1 ? 1 : 0);
            if(st < 0) continue;
            if(st !== ((m >> i) & 1)){ good = false; break; }
          }
          if(good) return true;
        }
        return false;
      };
      const touched = [];
      const cleanup = () => { for(const x of touched) wpar[x] = -1; touched.length = 0; };
      const consistent = upto => {                          // links join pieces, no wall may end up inside one, no link joins pieces known to differ
        let ok = true;
        for(let i = 0; i <= upto && ok; i++) if(val[i] === 0){
          const a = wfind(ra[i]), b = wfind(rb[i]);
          if(a === b) continue;
          const d = dmap.get(ra[i]); if(d && d.has(rb[i])){ ok = false; break; }
          wpar[a] = b; touched.push(a);
        }
        for(let i = 0; i <= upto && ok; i++) if(val[i] === 1 && wfind(ra[i]) === wfind(rb[i])) ok = false;
        for(let i = 0; i < fw.length && ok; i++) if(wfind(fw[i][0]) === wfind(fw[i][1])) ok = false;
        cleanup();
        return ok;
      };
      const can = V.map(() => [false, false]);
      let nodes = 0, sols = 0, aborted = false;
      const rec = i => {
        if(aborted) return;
        if(i === nv){ sols++; for(let j = 0; j < nv; j++) can[j][val[j]] = true; return; }
        for(let x = 0; x < 2; x++){
          if(++nodes > PAL_NODE_CAP){ aborted = true; return; }
          val[i] = x;
          let ok = true;
          for(const k of tileOf[i]) if(!tileOk(k)){ ok = false; break; }
          if(ok && consistent(i)) rec(i + 1);
          val[i] = -1;
          if(aborted) return;
        }
      };
      // the sides of tiles with no variable left must already be fine
      let pre = true; for(let k = 0; k < wt.length; k++) if(!tileOk(k)){ pre = false; break; }
      if(!pre){ why = 'pal-count'; return null; }
      rec(0);
      if(aborted) continue;
      if(sols === 0){ why = 'pal-pair'; return null; }
      for(let j = 0; j < nv; j++){
        const e = V[j]; if(e.state !== 0) continue;
        if(can[j][0] && !can[j][1]){ e.state = 2; link.push(e); out.push({ e, value: 'same', rule: 'pal-pair' }); }
        else if(can[j][1] && !can[j][0]){ e.state = 1; out.push({ e, value: 'wall', rule: 'pal-pair' }); }
      }
      if(out.length > 0) break;                              // let the new facts spread, then look again
    }
    for(const e of link) union(e.a, e.b);
    return out;
  }
  // ---- v96 (V1.0.3): wally-ends (see build/patch_core96.py) ----
  const weOn = !!ctx.wallyRule && opts.wallyEnds !== false;
  const weCap = new Int8Array(N).fill(2);                 // most links a tile can have from its own clue: palisade 3 -> 1, palisade 4 -> 0
  if(weOn && ctx.palisades) for(const [k, t] of ctx.palisades){ const [x, y] = k.split(',').map(Number); if(ctx.isActive(x, y)){ if(t === '3') weCap[cid(x, y)] = 1; else if(t === '4') weCap[cid(x, y)] = 0; } }
  const weL = new Int8Array(N), weO = new Int8Array(N);
  function wallyEndsStep(){                              // null = impossible, else [{ e, value, rule }]
    for(const id of activeIds){ let l = 0, o = 0; for(const { e } of adjE[id]){ if(e.state === 2) l++; else if(e.state === 0) o++; } weL[id] = l; weO[id] = o; }
    const cap = id => Math.min(2, weCap[id], weL[id] + weO[id]);  // most links the tile can still get
    const out = [], link = [];
    const ends = new Map();
    for(const id of activeIds) if(cap(id) <= 1){ const r = find(id); ends.set(r, (ends.get(r) || 0) + 1); }
    for(const [r, n] of ends){
      if(n > 2){ why = 'wally-ends'; return null; }     // three ends in one piece
      const mem = members.get(r);
      if(n < 2 || mem.length < 2) continue;
      // a path from one known end to the other: every other tile of the piece goes through
      for(const id of mem){
        if(cap(id) <= 1 || weO[id] === 0 || weL[id] + weO[id] !== 2) continue;
        for(const { e } of adjE[id]) if(e.state === 0){ e.state = 2; link.push(e); out.push({ e, value: 'same', rule: 'wally-ends' }); }
      }
      if(out.length) break;
      // a group with an end of its own can not join it (a third end)
      for(const id of mem) for(const { e, o } of adjE[id]){ if(e.state !== 0) continue; const ro = find(o); if(ro !== r && (ends.get(ro) || 0) > 0){ e.state = 1; out.push({ e, value: 'wall', rule: 'wally-ends' }); } }
      if(out.length) break;
      // joined by links from end to end: that path is the whole piece
      markGen++; for(const id of mem) markBuf[id] = markGen;
      const seen = [mem[0]]; let k = 0; const got = new Set(seen);
      while(k < seen.length){ const x = seen[k++]; for(const { e, o } of adjE[x]) if(e.state === 2 && markBuf[o] === markGen && !got.has(o)){ got.add(o); seen.push(o); } }
      if(seen.length === mem.length){
        for(const id of mem) for(const { e, o } of adjE[id]) if(e.state === 0 && markBuf[o] !== markGen){ e.state = 1; out.push({ e, value: 'wall', rule: 'wally-ends' }); }
        if(out.length) break;
      }
    }
    for(const e of link) union(e.a, e.b);
    if(out.length) return out;
    // the budget: sum of (2 - links) = 2 x (paths of 2+ tiles) + 2 x (single tiles) <= 2 x (most pieces)
    if(ctx.pieceCapMax != null){
      let sum = 0; for(const id of activeIds) sum += 2 - cap(id);
      const slack = 2 * ctx.pieceCapMax - sum;
      if(slack < 0){ why = 'wally-ends'; return null; }
      if(slack === 0){                                    // no tile can fall short of what it can still get: a tile with exactly that many sides takes them all
        for(const id of activeIds){
          if(weO[id] === 0 || cap(id) !== weL[id] + weO[id]) continue;
          for(const { e } of adjE[id]) if(e.state === 0){ e.state = 2; link.push(e); out.push({ e, value: 'same', rule: 'wally-ends' }); }
        }
        for(const e of link) union(e.a, e.b);
      }
    }
    return out;
  }
  function palisadeStep(dmap){
    const a = palTileStep();
    if(a === null || a.length > 0) return a;
    if(palTwoOn()){ const b = palParityStep(dmap); if(b === null || b.length > 0) return b; }
    return palWindowStep(dmap);
  }
  // ============================================================================================================
  // v36: BRICKY. Before v36 the rule was only checked by the search (`vertexOk`): the propagation did not know it.
  // Bricky = no grid point where FOUR wall segments meet. Everything here holds in EVERY valid tiling (never a guess).
  //   A grid point (vertex) touches 4 tiles TL TR BL BR and 4 segments: N (TL|TR), E (TR|BR), S (BL|BR), W (TL|BL).
  //   A segment is a wall when its two tiles are different pieces, or one is an empty tile / outside the board; two void tiles side by
  //   side have no wall between them (so every vertex on the outline is safe, and so is every vertex with two void tiles side by side).
  //   bri-three   three segments are walls -> the fourth one is a link ("if 3 walls are at a corner, the 4th place has to connect")
  //   bri-pinch   two tiles that touch only at the corner are one piece (A and D, or B and C): the other two tiles can not both be different
  //               pieces, so one of them joins; as soon as one is known to be another piece (or a hole), the other one is a link. Also: with A, D in
  //               one piece, the two segments round B are both walls or both links (B is in the piece or not), and the same round C.
  //   bri-vertex  anything else the corner decides once all the ways the 4 tiles can be split into pieces are tried (every split has to agree with
  //               the decided edges, the groups known to be one piece / known to differ, and must not give 4 walls). Also the failure tag.
  //   "No piece can END at a poking-in corner": a corner where two walls already meet at a right angle (a hole, or hand walls) points INTO the board.
  //               The tile diagonal to it can not be the corner of its own piece (its two sides would be the other two walls = 4 walls):
  //               it has to join one of its two neighbours. Used in three places:
  //     - pieceInfo: such a tile can not be a piece of one (need >= 2)                                   [briSingleBad]
  //     - placements (stamp / bank / Boxy / Match / Mismatch candidates): a piece with a corner (or a pinch) where the other two segments are
  //       certainly walls is not a placement                                                             [briPlaceOk]
  //     - palisades: a side pattern with both sides at such a corner is not possible                      [briPalMask]
  // The step is written for any "bad number of walls" so Loopy (exactly 3) can reuse it later: only briBad() and the gate change.
  // ============================================================================================================
  const briOn = !!ctx.brickyRule;
  const briV = [], briAtIdx = new Array((w + 1) * (h + 1)).fill(null);   // vertices worth looking at; briAtIdx[vy * (w + 1) + vx] -> vertex
  const briCorner = new Array(N).fill(null);              // per tile: its 4 corners NE SE SW NW as { V, a, b } (a, b = the 2 segments NOT touching the tile; hn / vn = the horizontal / vertical neighbour at that corner, -1 = void)
  const BRI_SEG = [[0, 1], [1, 3], [2, 3], [0, 2]];       // N E S W as pairs of tile slots (0 = TL, 1 = TR, 2 = BL, 3 = BR)
  const briBad = nw => nw === 4;
  const act = (c, r) => c >= 0 && r >= 0 && c < w && r < h && ctx.isActive(c, r);
  if(briOn){
    for(let vy = 0; vy <= h; vy++) for(let vx = 0; vx <= w; vx++){
      const tc = [[vx - 1, vy - 1], [vx, vy - 1], [vx - 1, vy], [vx, vy]];
      const tid = tc.map(([c, r]) => act(c, r) ? cid(c, r) : -1);
      if(tid.every(t => t < 0)) continue;
      if(BRI_SEG.some(([i, j]) => tid[i] < 0 && tid[j] < 0)) continue;     // two void tiles side by side: this vertex can never have 4 walls
      const se = BRI_SEG.map(([i, j]) => (tid[i] >= 0 && tid[j] >= 0) ? edgeBetween(tc[i][0], tc[i][1], tc[j][0], tc[j][1]) : null);
      const V = { vx, vy, tid, se, nAct: tid.filter(t => t >= 0).length };
      briV.push(V); briAtIdx[vy * (w + 1) + vx] = V;
    }
    for(const id of activeIds){
      const c = id % w, r = (id - c) / w, cs = [];
      for(const [vx, vy, slot, dx, dy] of [[c + 1, r, 2, 1, -1], [c + 1, r + 1, 0, 1, 1], [c, r + 1, 1, -1, 1], [c, r, 3, -1, -1]]){      // NE (the tile is BL there), SE (TL), SW (TR), NW (BR)
        const V = briAtIdx[vy * (w + 1) + vx];
        if(!V){ cs.push(null); continue; }
        const oth = [0, 1, 2, 3].filter(k => BRI_SEG[k][0] !== slot && BRI_SEG[k][1] !== slot);
        cs.push({ V, a: oth[0], b: oth[1], hn: act(c + dx, r) ? cid(c + dx, r) : -1, vn: act(c, r + dy) ? cid(c, r + dy) : -1 });
      }
      briCorner[id] = cs;
    }
  }
  // state of a segment: 1 = certainly a wall, 0 = certainly a link, 2 = not known
  function briSeg(V, k){
    const e = V.se[k];
    if(!e) return 1;                                      // a void tile next to an active one (two void tiles never get here)
    return e.state === 1 ? 1 : e.state === 2 ? 0 : 2;
  }
  // a tile that is a piece of one has its 2 sides at every corner as walls: bad when the 2 other segments at some corner are certain walls
  function briSingleBad(id){
    const cs = briCorner[id]; if(!cs) return false;
    for(const q of cs) if(q && briSeg(q.V, q.a) === 1 && briSeg(q.V, q.b) === 1) return true;
    return false;
  }
  // --- 1. one vertex: try every split of its tiles into pieces ---
  const briBlk = [-1, -1, -1, -1], briReps = [-1, -1, -1, -1], briSlots = [0, 0, 0, 0];
  const briCan = [[false, false], [false, false], [false, false], [false, false]], briIsW = [false, false, false, false];
  function briVertexStep(dmap){
    const out = [], link = [];
    for(const V of briV){
      let nw = 0, nl = 0;
      for(let k = 0; k < 4; k++){ const s = briSeg(V, k); if(s === 1) nw++; else if(s === 0) nl++; }
      if(nl > 0) continue;                                // a link: this corner is fine whatever the rest does
      if(briBad(nw)){ why = 'bri-vertex'; return null; }
      const t = V.tid;
      const pinch = (t[0] >= 0 && t[3] >= 0 && find(t[0]) === find(t[3])) || (t[1] >= 0 && t[2] >= 0 && find(t[1]) === find(t[2]));
      if(nw < 3 && !pinch) continue;                      // two or fewer walls and no pinch: "not all four" is a plain either-or, nothing to decide
      let ns = 0; for(let i = 0; i < 4; i++){ briReps[i] = t[i] >= 0 ? find(t[i]) : -1; briBlk[i] = -1; if(t[i] >= 0) briSlots[ns++] = i; }
      const slots = briSlots, reps = briReps, blk = briBlk, can = briCan, isW = briIsW;
      for(let k = 0; k < 4; k++){ can[k][0] = false; can[k][1] = false; }       // per segment: [can be a link, can be a wall]
      let feasible = 0;
      const rec = (q, nb) => {
        if(q === ns){
          let walls = 0;
          for(let k = 0; k < 4; k++){
            const [i, j] = BRI_SEG[k];
            const wl = (V.tid[i] < 0 || V.tid[j] < 0) ? true : blk[i] !== blk[j];
            if(V.se[k]){
              const s = V.se[k].state;
              if(s === 1 && !wl) return;
              if(s === 2 && wl) return;
            }
            isW[k] = wl; if(wl) walls++;
          }
          if(briBad(walls)) return;
          feasible++;
          for(let k = 0; k < 4; k++) if(V.se[k]) can[k][isW[k] ? 1 : 0] = true;
          return;
        }
        const i = slots[q];
        for(let b = 0; b <= nb; b++){
          let ok = true;
          for(let p = 0; p < q && ok; p++){
            const j = slots[p];
            if(blk[j] === b){ if(reps[i] !== reps[j]){ const d = dmap.get(reps[i]); if(d && d.has(reps[j])) ok = false; } }
            else if(reps[i] === reps[j]) ok = false;
          }
          if(!ok) continue;
          blk[i] = b; rec(q + 1, b === nb ? nb + 1 : nb); blk[i] = -1;
        }
      };
      rec(0, 0);
      if(feasible === 0){ why = 'bri-vertex'; return null; }
      for(let k = 0; k < 4; k++){
        const e = V.se[k]; if(!e || e.state !== 0) continue;
        if(can[k][0] && !can[k][1]){
          e.state = 2; link.push(e);
          out.push({ e, value: 'same', rule: nw === 3 ? 'bri-three' : pinch ? 'bri-pinch' : 'bri-vertex' });
        } else if(can[k][1] && !can[k][0]){
          e.state = 1;
          out.push({ e, value: 'wall', rule: pinch ? 'bri-pinch' : 'bri-vertex' });
        }
      }
      if(out.length > 0) break;                           // let the new facts spread, then look again
    }
    for(const e of link) union(e.a, e.b);
    return out;
  }
  // --- 2. a complete piece P (marked in markBuf) must not leave 4 walls at any corner it touches ---
  function briPlaceOk(P){
    for(const id of P){
      const cs = briCorner[id]; if(!cs) continue;
      for(const q of cs){
        if(!q) continue;
        if(q.hn >= 0 && markBuf[q.hn] === markGen) continue;               // the piece goes on to the side here: a link at this corner
        if(q.vn >= 0 && markBuf[q.vn] === markGen) continue;
        const V = q.V; let walls = 0, link = false;
        for(let k = 0; k < 4 && !link; k++){
          const [i, j] = BRI_SEG[k], a = V.tid[i], b = V.tid[j];
          if(a < 0 || b < 0){ walls++; continue; }
          const ia = markBuf[a] === markGen, ib = markBuf[b] === markGen;
          if(ia && ib) link = true;
          else if(ia || ib) walls++;
          else { const s = V.se[k].state; if(s === 1) walls++; else if(s === 2) link = true; }
        }
        if(!link && briBad(walls)) return false;
      }
    }
    return true;
  }
  // --- 3. palisade: the side patterns that give a tile both sides at a corner whose other two segments are certain walls are out ---
  function briPalMask(t, m){
    const cs = briCorner[t.id]; if(!cs) return true;
    for(let i = 0; i < 4; i++){
      const q = cs[i]; if(!q) continue;                   // corner i lies between side i and side i + 1: NE = N + E, SE = E + S, SW = S + W, NW = W + N
      if(((m >> i) & 1) && ((m >> ((i + 1) & 3)) & 1) && briSeg(q.V, q.a) === 1 && briSeg(q.V, q.b) === 1) return false;
    }
    return true;
  }
  // ============================================================================================================
  // v37: LOOPY. Before v37 the rule was only checked by the search (`vertexOk`: "not exactly 3 walls at a grid point").
  // Loopy = no grid point where EXACTLY THREE wall segments meet. Everything here holds in EVERY valid tiling (never a guess).
  //   A wall is a segment between two different pieces, or between a piece and an empty tile / the outside; two void tiles side by
  //   side have no wall between them. A grid point with 4 active tiles can not have exactly 1 wall either (the other three segments
  //   would link its two sides together), so in a valid tiling EVERY grid point has an EVEN number of walls: 0, 2 or 4.
  //   That is the same as: the pieces can be coloured with two colours, the outside being colour 0, so that a segment is a wall exactly
  //   when its two sides have different colours (walls always change colour, links keep it). The solver keeps this colouring as a
  //   union-find with a parity bit (outside / every group of tiles known to be one piece / every empty region = one node):
  //   loo-outline  a straight stretch of the outline: two void tiles side by side + two tiles of the board; the two tiles are
  //                walls to the void on both sides, so the segment between them is a LINK ("the outside must be linked")
  //                except at a poking-in corner (one void tile): there the two segments are both walls or both links.
  //   loo-three    three walls meet at a corner -> the fourth is a wall ("if 3 walls are at a corner there must be a 4th")
  //   loo-corner   any other corner whose last segment is forced by the evenness (2 walls + 1 link -> the last is a link, ...)
  //   loo-color    the same thing over a longer way: a chain of decided segments joins two tiles; every wall flips the colour, every
  //                link keeps it; two tiles of one colour are one piece (link), two of different colours a wall. An odd loop is
  //                impossible (three pieces that all touch each other, ...).
  //   Also used: placements (a complete piece leaving an odd number of certain walls at a corner is out) [looPlaceOk], a piece of
  //   one tile whose other two segments at a corner are one wall + one link [looSingleBad -> needs >= 2], palisade side patterns
  //   that make a corner odd [looPalMask].
  // ============================================================================================================
  const looOn = !!ctx.loopyRule;
  const looV = [], looAt = new Array((w + 1) * (h + 1)).fill(null);       // every grid point that touches a tile of the board
  const looCorner = new Array(N).fill(null);               // per tile: its 4 corners NE SE SW NW as { V, a, b } (a, b = the 2 segments NOT touching the tile)
  const looBound = [];                                     // [tile id, void region] for every side of a tile that touches a void tile
  let looNVoid = 0;
  if(looOn){
    // void regions on the board padded by one ring (the ring is one region with the outside)
    const PW = w + 2, voidId = new Int32Array(PW * (h + 2)).fill(-1);
    const vAt = (c, r) => (r + 1) * PW + (c + 1);
    for(let r = -1; r <= h; r++) for(let c = -1; c <= w; c++){
      if(act(c, r) || voidId[vAt(c, r)] >= 0) continue;
      const stack = [[c, r]]; voidId[vAt(c, r)] = looNVoid;
      while(stack.length){
        const [x, y] = stack.pop();
        for(const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]){
          const nx = x + dx, ny = y + dy;
          if(nx < -1 || ny < -1 || nx > w || ny > h || act(nx, ny) || voidId[vAt(nx, ny)] >= 0) continue;
          voidId[vAt(nx, ny)] = looNVoid; stack.push([nx, ny]);
        }
      }
      looNVoid++;
    }
    for(const id of activeIds){
      const c = id % w, r = (id - c) / w;
      for(const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) if(!act(c + dx, r + dy)) looBound.push([id, voidId[vAt(c + dx, r + dy)]]);
    }
    for(let vy = 0; vy <= h; vy++) for(let vx = 0; vx <= w; vx++){
      const tc = [[vx - 1, vy - 1], [vx, vy - 1], [vx - 1, vy], [vx, vy]];
      const tid = tc.map(([c, r]) => act(c, r) ? cid(c, r) : -1);
      if(tid.every(t => t < 0)) continue;
      const se = BRI_SEG.map(([i, j]) => (tid[i] >= 0 && tid[j] >= 0) ? edgeBetween(tc[i][0], tc[i][1], tc[j][0], tc[j][1]) : null);
      const V = { vx, vy, tid, se, hasVoid: tid.some(t => t < 0) };
      looV.push(V); looAt[vy * (w + 1) + vx] = V;
    }
    for(const id of activeIds){
      const c = id % w, r = (id - c) / w, cs = [];
      for(const [vx, vy, slot] of [[c + 1, r, 2], [c + 1, r + 1, 0], [c, r + 1, 1], [c, r, 3]]){
        const V = looAt[vy * (w + 1) + vx];
        const oth = [0, 1, 2, 3].filter(k => BRI_SEG[k][0] !== slot && BRI_SEG[k][1] !== slot);
        cs.push({ V, a: oth[0], b: oth[1] });
      }
      looCorner[id] = cs;
    }
  }
  // state of a segment: 1 = certainly a wall, 0 = certainly a link, 2 = not known
  function looSeg(V, k){
    const [i, j] = BRI_SEG[k], a = V.tid[i], b = V.tid[j];
    if(a < 0 && b < 0) return 0;                          // two void tiles side by side: no wall
    if(a < 0 || b < 0) return 1;                          // a tile of the board next to a void tile
    const s = V.se[k].state;
    return s === 1 ? 1 : s === 2 ? 0 : 2;
  }
  // a piece of one tile has its 2 sides at every corner as walls: bad when the other two segments there are one wall + one link
  function looSingleBad(id){
    const cs = looCorner[id]; if(!cs) return false;
    for(const q of cs){
      const sa = looSeg(q.V, q.a), sb = looSeg(q.V, q.b);
      if(sa !== 2 && sb !== 2 && sa !== sb) return true;
    }
    return false;
  }
  // a complete piece P (marked in markBuf): no grid point it touches may be left with an odd number of walls once all its segments are known
  function looPlaceOk(P){
    for(const id of P){
      const cs = looCorner[id]; if(!cs) continue;
      for(const q of cs){
        const V = q.V; let walls = 0, unk = 0;
        for(let k = 0; k < 4; k++){
          const [i, j] = BRI_SEG[k], a = V.tid[i], b = V.tid[j];
          if(a < 0 && b < 0) continue;
          if(a < 0 || b < 0){ walls++; continue; }
          const ia = markBuf[a] === markGen, ib = markBuf[b] === markGen;
          if(ia && ib) continue;
          if(ia || ib){ walls++; continue; }
          const s = V.se[k].state; if(s === 1) walls++; else if(s === 0) unk++;
        }
        if(unk === 0 && (walls & 1)) return false;
      }
    }
    return true;
  }
  // palisade: a side pattern m (bit i = side N E S W is a wall) that leaves a corner odd for sure is out
  function looPalMask(t, m){
    const cs = looCorner[t.id]; if(!cs) return true;
    for(let i = 0; i < 4; i++){
      const q = cs[i];
      const sa = looSeg(q.V, q.a), sb = looSeg(q.V, q.b);
      if(sa === 2 || sb === 2) continue;
      if((((m >> i) & 1) + ((m >> ((i + 1) & 3)) & 1) + sa + sb) & 1) return false;
    }
    return true;
  }
  // which of the rules above names the edge e (the local ones when the other three segments of one of its two corners are decided)
  function looTag(e){
    const horiz = e.r1 === e.r2;
    const pts = horiz ? [[Math.max(e.c1, e.c2), e.r1], [Math.max(e.c1, e.c2), e.r1 + 1]] : [[e.c1, Math.max(e.r1, e.r2)], [e.c1 + 1, Math.max(e.r1, e.r2)]];
    for(const [vx, vy] of pts){
      const V = looAt[vy * (w + 1) + vx]; if(!V) continue;
      let nw = 0, nu = 0;
      for(let k = 0; k < 4; k++){ if(V.se[k] === e) continue; const s = looSeg(V, k); if(s === 1) nw++; else if(s === 2) nu++; }
      if(nu > 0) continue;
      return nw === 3 ? 'loo-three' : V.hasVoid ? 'loo-outline' : 'loo-corner';
    }
    return 'loo-color';
  }
  // --- the two-colouring: union-find with a parity bit over [group roots 0..N-1] + [void regions N..N+looNVoid-1] ---
  let looPar = null, looPx = null, looLp = 0;
  function looFind(x){
    let r = x, p = 0;
    while(looPar[r] !== r){ p ^= looPx[r]; r = looPar[r]; }
    let y = x, py = p;
    while(y !== r){ const nx = looPar[y], opx = looPx[y]; looPar[y] = r; looPx[y] = py; py ^= opx; y = nx; }
    looLp = p; return r;
  }
  function looRelate(a, b, d){         // colour(a) xor colour(b) = d; false when that contradicts what is known
    const ra = looFind(a), pa = looLp, rb = looFind(b), pb = looLp;
    if(ra === rb) return ((pa ^ pb) === d);
    looPar[ra] = rb; looPx[ra] = pa ^ pb ^ d; return true;
  }
  function loopyStep(dmap){
    const T = N + looNVoid;
    if(!looPar || looPar.length !== T){ looPar = new Int32Array(T); looPx = new Uint8Array(T); }
    for(let i = 0; i < T; i++){ looPar[i] = i; looPx[i] = 0; }
    for(const [id, vr] of looBound) if(!looRelate(find(id), N + vr, 1)){ why = 'loo-parity'; return null; }
    for(const e of edges) if(e.state === 1 && !looRelate(find(e.a), find(e.b), 1)){ why = 'loo-parity'; return null; }
    const out = [], link = [];
    for(const e of edges){
      if(e.state !== 0) continue;
      const ra = find(e.a), rb = find(e.b);
      if(ra === rb) continue;                              // the core knows this one
      const x = looFind(ra), px = looLp, y = looFind(rb), py = looLp;
      if(x !== y) continue;
      const wall = (px ^ py) === 1;
      if(!wall){ const d = dmap.get(ra); if(d && d.has(rb)){ why = 'loo-parity'; return null; } }
      out.push({ e, value: wall ? 'wall' : 'same', rule: looTag(e) });          // tag from the state at the start of this pass (not from what this pass decided first)
    }
    for(const o of out){ o.e.state = o.value === 'wall' ? 1 : 2; if(o.value === 'same') link.push(o.e); }
    for(const e of link) union(e.a, e.b);
    return out;
  }


  const areaAt = new Int16Array(N);
  for(const id of activeIds){ const x = id % w, a = ctx.requiredAreaAt(x, (id - x) / w); if(a != null) areaAt[id] = a; }

  // ---- roses ----
  const roseTypeList = [...ctx.activeRoseTypes].sort((a, b) => a - b);
  // v31: Solitude = one more rose type (bit solBit) carried by every tile with a symbol; a tile with two symbols can never be in any piece
  const solBit = ctx.solitudeRule ? roseTypeList.length : -1;
  const K = roseTypeList.length + (ctx.solitudeRule ? 1 : 0), FULL = (1 << K) - 1;
  const roseMask = new Int32Array(N), roseCount = new Array(K).fill(0);
  let solDouble = false;
  const roseTag = suffix => (ctx.activeRoseTypes.size > 0 ? 'rose-' : 'solitude-') + suffix;      // the tag names the rule the user sees
  for(const id of activeIds){
    const x = id % w, y = (id - x) / w, t = ctx.roseTypeAt(x, y);
    if(t != null){
      const i = roseTypeList.indexOf(t);
      if(i >= 0){ roseMask[id] = 1 << i; roseCount[i]++; }
    }
    if(solBit >= 0){
      const sc = symbolCountAt(x, y, ctx);
      if(sc > 0){ roseMask[id] |= 1 << solBit; roseCount[solBit]++; if(sc > 1) solDouble = true; }
    }
  }
  const roseUnbalanced = K > 0 && (roseCount[0] === 0 || roseCount.some(c => c !== roseCount[0]));

  // ---- v53: rose-cut. N tiles that cut off a part P whose roses need N different pieces to leave P (see build/patch_core53.py) ----
  const roseCuts = [];                          // { C: [ids], into: [[edges from C[i] into P]] }   (static: empty board + fixed walls)
  let roseCutWhy = '';
  const rcOn = K > 0 && !roseUnbalanced && opts.roseCut !== false && activeIds.length > 1;
  const rcDyn = rcOn && opts.roseCutDyn !== false && K >= 2;      // also again with the walls decided so far (one rose type: only the size bound, not worth it)
  let RC_NMAX = opts.roseCutMax != null ? +opts.roseCutMax : 4;
  const RC_DYN_NMAX = opts.roseCutDynMax != null ? +opts.roseCutDynMax : 3, RC_DYN_CAP = opts.roseCutDynCap != null ? +opts.roseCutDynCap : 24;
  const rcW1 = w + 1, rcBar = new Uint8Array(rcW1 * (h + 1)), rcBar0 = new Uint8Array(rcW1 * (h + 1)), rcOnBar = new Uint8Array(N);
  const rcKing = new Array(N), rcInC = new Int32Array(N), rcComp = new Float64Array(N), rcQ2 = new Int32Array(N), rcInChain = new Uint8Array(N);
  const rcMinSz = Math.max(1, ctx.sizeLo || 1, roseTypeList.length);
  let RC_CAP = opts.roseCutCap != null ? +opts.roseCutCap : 48;      // a part next to a cut bigger than this is counted as "the rest"
  const rcSeenG = new Int32Array(N), rcTotal = roseCount.slice();
  let rcGen = 0, rcBfs = 0, rcInPart = null;
  if(rcOn){
    const act = (x, y) => x >= 0 && y >= 0 && x < w && y < h && ctx.isActive(x, y);
    for(let Y = 0; Y <= h; Y++) for(let X = 0; X <= w; X++){          // corners on the outline of the board / a hole
      const a = act(X - 1, Y - 1), b = act(X, Y - 1), c = act(X - 1, Y), d = act(X, Y);
      if(!(a && b && c && d) && (a || b || c || d)) rcBar0[Y * rcW1 + X] = 1;
    }
    for(const id of activeIds){
      const x = id % w, y = (id - x) / w, k = [];
      for(let dy = -1; dy <= 1; dy++) for(let dx = -1; dx <= 1; dx++) if((dx || dy) && act(x + dx, y + dy)) k.push(id + dy * w + dx);
      rcKing[id] = k;
    }
  }
  // isWall(e): the edges that count as walls. visit(C, comp, p, cnt, size, need) is called for every part p of the board without C with need >= |C|
  // (need > |C| = impossible). Chains of up to RC_NMAX tiles, king-step by king-step, from a tile on the outline / a wall to another one.
  // newOnly: chains must start on a tile touching a wall that is not a fixed one (the chains between outline / fixed walls are the static facts)
  function rcSearch(isWall, visit, newOnly){
    rcBar.set(rcBar0);
    for(const e of edges){
      if(!isWall(e)) continue;
      const v = (newOnly && !e.fixed) ? 2 : 1;
      if(e.r1 === e.r2){ const c = Math.min(e.c1, e.c2); rcBar[e.r1 * rcW1 + c + 1] |= v; rcBar[(e.r1 + 1) * rcW1 + c + 1] |= v; }
      else { const r = Math.min(e.r1, e.r2); rcBar[(r + 1) * rcW1 + e.c1] |= v; rcBar[(r + 1) * rcW1 + e.c1 + 1] |= v; }
    }
    for(const id of activeIds){ const x = id % w, y = (id - x) / w; rcOnBar[id] = rcBar[y * rcW1 + x] | rcBar[y * rcW1 + x + 1] | rcBar[(y + 1) * rcW1 + x] | rcBar[(y + 1) * rcW1 + x + 1]; }
    const startMask = newOnly ? 2 : 3;
    const tried = new Set(), chain = [];
    let stop = false;
    rcInPart = (o, p) => rcInC[o] !== rcGen && (p < 0 ? rcComp[o] < rcGen * 64 : rcComp[o] === p);
    // the parts next to the chain, each searched only up to RC_CAP tiles; the parts that are bigger (or not next to the chain) form ONE
    // part "the rest" (the counts hold for any union of parts: a piece that leaves it still has to cross C)
    const evalCut = () => {
      const C = chain;
      const ck = C.slice().sort((a, b) => a - b).join(',');
      if(tried.has(ck)) return;
      tried.add(ck);
      rcGen++;
      for(const c of C) rcInC[c] = rcGen;
      const parts = [], restCnt = rcTotal.slice();
      let restSize = activeIds.length - C.length, nSmall = 0;
      for(const c of C){ const m = roseMask[c]; if(m) for(let b = 0; b < K; b++) if(m & (1 << b)) restCnt[b]--; }
      const bfs0 = rcBfs + 1;                    // searches of this cut get ids >= bfs0; a tile met from an earlier one of them is in a big part
      for(const c of C) for(const { e: e0, o: s } of adjE[c]){
        if(isWall(e0) || rcInC[s] === rcGen || rcSeenG[s] >= bfs0) continue;
        const me = ++rcBfs;
        let qn = 0, big = false; rcQ2[qn++] = s; rcSeenG[s] = me;
        const cnt = new Array(K).fill(0);
        for(let qi = 0; qi < qn && !big; qi++){
          const id = rcQ2[qi], m = roseMask[id];
          if(m) for(let b = 0; b < K; b++) if(m & (1 << b)) cnt[b]++;
          for(const { e, o } of adjE[id]){
            if(isWall(e) || rcInC[o] === rcGen || rcSeenG[o] === me) continue;
            if(rcSeenG[o] >= bfs0){ big = true; break; }          // reached a part already found too big
            rcSeenG[o] = me; rcQ2[qn++] = o;
          }
          if(qn > RC_CAP) big = true;
        }
        if(big){ for(let qi = 0; qi < qn; qi++) rcComp[rcQ2[qi]] = -1; continue; }     // part of the rest (its tiles stay marked: not searched again)
        for(let qi = 0; qi < qn; qi++) rcComp[rcQ2[qi]] = rcGen * 64 + parts.length;
        for(let b = 0; b < K; b++) restCnt[b] -= cnt[b];
        restSize -= qn; nSmall++;
        parts.push({ size: qn, cnt });
      }
      if(restSize > 0) parts.push({ size: restSize, cnt: restCnt, rest: true });
      if(parts.length > 1) for(let p = 0; p < parts.length && !stop; p++){
        const { size, cnt } = parts[p];
        let mx = 0, mn = Infinity;
        for(let b = 0; b < K; b++){ if(cnt[b] > mx) mx = cnt[b]; if(cnt[b] < mn) mn = cnt[b]; }
        if(mx === 0) continue;
        const need = mx - Math.min(mn, Math.floor(size / rcMinSz));
        if(need >= C.length && visit(C, parts[p].rest ? -1 : rcGen * 64 + p, need) === false) stop = true;
      }
    };
    // is tile o (not in C) in part p of the last evalCut? (p = -1: the rest)
    const dfs = () => {
      const last = chain[chain.length - 1];
      if(rcOnBar[last]){ evalCut(); if(chain.length > 1) return; }    // a chain through the outline = two shorter cuts (never a stronger fact)
      if(stop || chain.length >= RC_NMAX) return;
      for(const nb of rcKing[last]){
        if(rcInChain[nb]) continue;
        chain.push(nb); rcInChain[nb] = 1;
        dfs();
        chain.pop(); rcInChain[nb] = 0;
        if(stop) return;
      }
    };
    for(const s of activeIds){
      if(!(rcOnBar[s] & startMask) || stop) continue;
      chain.push(s); rcInChain[s] = 1;
      dfs();
      chain.pop(); rcInChain[s] = 0;
    }
  }
  if(rcOn){
    const factKeys = new Set(), pairKeys = new Set();
    rcSearch(e => e.fixed, (C, p, need) => {
      if(need > C.length){ roseCutWhy = 'rose-cut'; return false; }
      const fk = C.slice().sort((a, b) => a - b).join(',') + '|' + p;
      if(factKeys.has(fk)) return;
      factKeys.add(fk);
      const fact = { C: C.slice(), into: C.map(c => adjE[c].filter(({ e, o }) => !e.fixed && rcInPart(o, p)).map(({ e }) => e)), inP: null, full: 0 };
      if(p >= 0 && opts.roseCutReach !== false){         // a small part: the types it holds as often as possible must be reached inside it
        const cnt = new Array(K).fill(0), inP = new Uint8Array(N);
        for(const id of activeIds) if(rcInPart(id, p)){ inP[id] = 1; const m = roseMask[id]; if(m) for(let b = 0; b < K; b++) if(m & (1 << b)) cnt[b]++; }
        const mx = Math.max(...cnt);
        for(let b = 0; b < K; b++) if(cnt[b] === mx) fact.full |= 1 << b;
        fact.inP = inP;
      }
      roseCuts.push(fact);
      for(let i = 0; i < C.length; i++) for(let j = i + 1; j < C.length; j++){
        const pk = Math.min(C[i], C[j]) * N + Math.max(C[i], C[j]);
        if(!pairKeys.has(pk)){ pairKeys.add(pk); forbidden.push([C[i], C[j], 'rose-cut']); }
      }
    });
  }
  // dynamic part: the piece of each cut tile reaches P straight from that tile
  function rcIntoStep(C, into, out){                     // false = impossible
    for(let i = 0; i < C.length; i++){
      let open = null, nOpen = 0, done = false;
      for(const e of into[i]){
        if(e.state === 2 || find(e.a) === find(e.b)){ done = true; break; }
        if(e.state === 0){ open = e; nOpen++; }
      }
      if(done) continue;
      if(nOpen === 0) return false;
      if(nOpen === 1){ open.state = 2; union(open.a, open.b); out.push({ e: open, value: 'same', rule: 'rose-cut' }); }
    }
    return true;
  }
  // the piece of c reaches a rose of every FULL type of P (one P holds as often as it can) inside P: from the group of c, through tiles of P only,
  // not through a group known to be another piece or a rose of a type the group already has. `closed`: an open edge treated as a wall.
  const rcuSeen = new Int32Array(N), rcQ3 = new Int32Array(N); let rcuTick = 0;
  function rcReach(f, rep, mem, mask, lack, blocked, closed){
    const tick = ++rcuTick; let qn = 0, found = 0;
    for(const id of mem){ rcuSeen[id] = tick; rcQ3[qn++] = id; }
    for(let qi = 0; qi < qn && found !== lack; qi++){
      const id = rcQ3[qi];
      for(const { e, o } of adjE[id]){
        if(rcuSeen[o] === tick || e.state === 1 || e === closed || !f.inP[o]) continue;
        const ro = find(o);
        if(ro !== rep && blocked && blocked.has(ro)) continue;
        if(roseMask[o] & mask) continue;
        rcuSeen[o] = tick; rcQ3[qn++] = o;
        found |= roseMask[o] & lack;
      }
    }
    return found === lack;
  }
  // ---- v57: rose-cover (see build/patch_core57.py) ----
  const rcvOn = opts.roseCover !== false && K >= 2 && !ctx.solitudeRule && !roseUnbalanced;
  // ---- v58: region labels (see build/patch_core58.py) ----
  const lbAnchors = [], lbSize = [];
  let lbAllMin = 0, lbAllMax = 0;                        // v65c
  (function(){
    if(opts.label === false) return;
    if(ctx.solitudeRule){
      if(solDouble) return;
      for(const id of activeIds) if(roseMask[id] & (1 << solBit)) lbAnchors.push(id);
    } else if(K > 0 && !roseUnbalanced){
      for(const id of activeIds) if(roseMask[id] & 1) lbAnchors.push(id);
    } else {
      const as = activeIds.filter(id => areaAt[id] > 0), vals = as.map(id => areaAt[id]);
      if(as.length >= 2 && new Set(vals).size === vals.length && vals.reduce((s, v) => s + v, 0) === activeIds.length) for(const id of as) lbAnchors.push(id);
    }
    if(lbAnchors.length < 2 || lbAnchors.length > (opts.labelMax || 64)){ lbAnchors.length = 0; return; }
    for(const id of lbAnchors) lbSize.push(areaAt[id] > 0 ? areaAt[id] : (ctx.sizeLo === ctx.sizeHi ? ctx.sizeHi : 0));
    // v65b: the minimums fill the board -> every piece is exactly its minimum
    if(opts.labelMinSum !== false){
      const mins = lbAnchors.map((id, l) => {
        if(lbSize[l]) return lbSize[l];
        let m = Math.max(1, ctx.sizeLo);
        if(hasCompass){ const x = id % w, cp = ctx.compasses.get(`${x},${(id - x) / w}`); if(cp) m = Math.max(m, compassMinSize(cp)); }
        return m;
      });
      if(mins.reduce((a, b) => a + b, 0) === activeIds.length) for(let l = 0; l < lbAnchors.length; l++) lbSize[l] = mins[l];
    }
    if(opts.labelSizeAll !== false && lbSize.length && lbSize.every(z => z > 0)){ lbAllMin = Math.min(...lbSize); lbAllMax = Math.max(...lbSize); }   // v65c
  })();
  const lbOn = lbAnchors.length > 0;
  const lbSized = lbSize.some(z => z > 0);           // labels with a known size: only then worth running in probes / the final search
  const LB = lbAnchors.length;
  // walls drawn on the board that are not open edges (every kind separates two pieces), and the size-comparing ones
  const lbFixed = [];
  if(lbOn) for(const se of (specialEdges || [])){
    if(!ctx.isActive(se.c1, se.r1) || !ctx.isActive(se.c2, se.r2)) continue;
    const kind = se.kind === 'gemini' ? 'diff' : se.kind;
    lbFixed.push({ a: cid(se.c1, se.r1), b: cid(se.c2, se.r2), kind, value: se.kind === 'gemini' ? 0 : (se.value || 0) });
  }
  const lbFits = (sa, sb, kind, value) => {                          // can a piece of sa tiles sit on side a, sb on side b?
    if(!sa || !sb) return true;
    if(kind === 'lt') return sa < sb;
    if(kind === 'gt') return sa > sb;
    if(kind === 'diff') return Math.abs(sa - sb) === value;
    return true;
  };
  function labelStep(dmap){
    const D = new Uint8Array(N * LB);                                // D[t * LB + l] = 1: tile t can still have label l
    for(const id of activeIds) D.fill(1, id * LB, id * LB + LB);
    const has = (t, l) => D[t * LB + l] === 1;
    const count = t => { let c = 0; for(let l = 0; l < LB; l++) c += D[t * LB + l]; return c; };
    const only = t => { let o = -1; for(let l = 0; l < LB; l++) if(D[t * LB + l]){ if(o >= 0) return -1; o = l; } return o; };
    let changed = true;
    const drop = (t, l) => { if(D[t * LB + l]){ D[t * LB + l] = 0; changed = true; } };
    lbAnchors.forEach((a, l) => { for(let k = 0; k < LB; k++) if(k !== l) drop(a, k); });
    // two anchors in one group = impossible (they are different pieces)
    { const seen = new Map(); for(let l = 0; l < LB; l++){ const r = find(lbAnchors[l]); if(seen.has(r)){ why = 'label'; return null; } seen.set(r, l); } }
    const reps = [...members.keys()];
    for(let round = 0; round < 40 && changed; round++){
      changed = false;
      // one set per group
      for(const r of reps){
        const mem = members.get(r); if(mem.length < 2) continue;
        for(let l = 0; l < LB; l++){ let all = true; for(const t of mem) if(!has(t, l)){ all = false; break; } if(!all) for(const t of mem) drop(t, l); }
      }
      // walls: decided ones (state 1) and the drawn ones (with their size relation)
      const pairRule = (a, b, kind, value) => {
        for(let la = 0; la < LB; la++){
          if(!has(a, la)) continue;
          let ok = false;
          for(let lb = 0; lb < LB && !ok; lb++) if(lb !== la && has(b, lb) && lbFits(lbSize[la], lbSize[lb], kind, value)) ok = true;
          if(!ok) drop(a, la);
        }
      };
      for(const e of edges) if(e.state === 1){ pairRule(e.a, e.b, 'wall', 0); pairRule(e.b, e.a, 'wall', 0); }
      for(const f of lbFixed){ pairRule(f.a, f.b, f.kind, f.value); pairRule(f.b, f.a, f.kind === 'lt' ? 'gt' : f.kind === 'gt' ? 'lt' : f.kind, f.value); }
      // groups known to be different pieces
      for(const [ra, set] of dmap){
        const ta = members.get(ra); if(!ta) continue; const la = only(ta[0]); if(la < 0) continue;
        for(const rb of set){ const tb = members.get(rb); if(tb) for(const t of tb) drop(t, la); }
      }
      // reach from the anchor through tiles that can have the label, within its size; and the size counts
      for(let l = 0; l < LB; l++){
        const a = lbAnchors[l], cap = lbSize[l] || N, dist = new Int32Array(N).fill(-1), q = [a]; dist[a] = 1;
        for(let i = 0; i < q.length; i++){
          const t = q[i]; if(dist[t] >= cap) continue;
          for(const { e, o } of adjE[t]) if(e.state !== 1 && dist[o] < 0 && has(o, l)){ dist[o] = dist[t] + 1; q.push(o); }
        }
        for(const id of activeIds) if(has(id, l) && dist[id] < 0) drop(id, l);
        // tiles that must be l: a piece holding t and two of them r1, r2 has at least (d(t,r1) + d(t,r2) + d(r1,r2)) / 2 + 1 tiles
        if(lbSize[l]){
          const R = []; for(const id of activeIds) if(has(id, l) && count(id) === 1) R.push(id);
          if(R.length >= 1 && R.length <= 16){
            const dR = R.map(r => { const d = new Int32Array(N).fill(-1), qq = [r]; d[r] = 0;
              for(let i = 0; i < qq.length; i++){ const t = qq[i]; for(const { e, o } of adjE[t]) if(e.state !== 1 && d[o] < 0 && has(o, l)){ d[o] = d[t] + 1; qq.push(o); } }
              return d; });
            for(let i = 0; i < R.length; i++) for(let j = i + 1; j < R.length; j++) if(dR[i][R[j]] < 0){ why = 'label'; return null; }     // two must-l tiles cut apart
            for(const id of activeIds){
              if(!has(id, l) || count(id) === 1) continue;
              let lbnd = 0;
              for(let i = 0; i < R.length && lbnd <= lbSize[l]; i++){
                const di = dR[i][id]; if(di < 0){ lbnd = Infinity; break; }
                for(let j = i; j < R.length; j++){ const dj = dR[j][id]; if(dj < 0){ lbnd = Infinity; break; } const b = Math.ceil((di + dj + dR[i][R[j]]) / 2) + 1; if(b > lbnd) lbnd = b; }
              }
              if(lbnd > lbSize[l]) drop(id, l);
            }
          }
        }
        let can = 0, must = 0;
        for(const id of activeIds){ if(!has(id, l)) continue; can++; if(count(id) === 1) must++; }
        if(lbSize[l]){
          if(can < lbSize[l] || must > lbSize[l]){ why = 'label'; return null; }
          if(can === lbSize[l]) for(const id of activeIds) if(has(id, l)) for(let k = 0; k < LB; k++) if(k !== l) drop(id, k);
        }
      }
      for(const id of activeIds) if(count(id) === 0){ why = 'label'; return null; }
    }
    const out = [];
    for(const e of spots){
      if(e.state !== 0) continue;
      let common = false; for(let l = 0; l < LB; l++) if(has(e.a, l) && has(e.b, l)){ common = true; break; }
      if(!common){ e.state = 1; out.push({ e, value: 'wall', rule: 'label' }); continue; }
      const la = only(e.a); if(la >= 0 && la === only(e.b)){ e.state = 2; union(e.a, e.b); out.push({ e, value: 'same', rule: 'label' }); }
    }
    return out;
  }
  let rcvLast = '', rcvOverG = Infinity;
  function roseCoverStep(dmap){
    // the groups holding roses
    const gs = [], gIdx = new Map();
    for(const id of activeIds){ if(!roseMask[id]) continue; const r = find(id); if(gIdx.has(r)) continue; gIdx.set(r, gs.length); gs.push({ rep: r, mask: 0, tile: id }); }
    for(const id of activeIds) if(roseMask[id]){ const g = gs[gIdx.get(find(id))]; if(g.mask & roseMask[id]){ why = 'rose-cover'; return null; } g.mask |= roseMask[id]; }
    const G = gs.length; if(G < 2 || G > 60) return [];
    // same rose groups, same walls and same known pairs as last time: nothing new to learn
    const sig = gs.map(g => g.rep + ':' + g.mask).join(',') + '|' + forbidden.length + '|' + spots.reduce((n, e) => n + (e.state === 1 ? 1 : 0), 0);
    if(sig === rcvLast) return [];
    rcvLast = sig;
    if(G >= rcvOverG) return [];                         // the listing went over budget with this many groups: wait until groups merge
    // open regions (decided walls cut them)
    const reg = new Int32Array(N).fill(-1); let nr = 0;
    for(const s of activeIds){ if(reg[s] >= 0) continue; const q = [s]; reg[s] = nr; for(let i = 0; i < q.length; i++) for(const { e, o } of adjE[q[i]]) if(e.state !== 1 && reg[o] < 0){ reg[o] = nr; q.push(o); } nr++; }
    const can = Array.from({ length: G }, () => new Uint8Array(G));
    for(let i = 0; i < G; i++) for(let j = i + 1; j < G; j++){
      const a = gs[i], b = gs[j];
      if(a.mask & b.mask) continue;
      if(reg[a.tile] !== reg[b.tile]) continue;
      const dm = dmap.get(a.rep); if(dm && dm.has(b.rep)) continue;
      can[i][j] = can[j][i] = 1;
    }
    const together = Array.from({ length: G }, () => new Uint8Array(G));
    const used = new Uint8Array(G), set = []; let ways = 0, nodes = 0, over = false;
    const budget = opts.roseCoverNodes || 30000;
    // fill the set of the first unused group until it holds every type, then start the next set
    const rec = () => {
      if(over) return; if(++nodes > budget){ over = true; return; }
      let first = -1; for(let i = 0; i < G; i++) if(!used[i]){ first = i; break; }
      if(first < 0){ ways++; return; }
      used[first] = 1; set.length = 0; set.push(first);
      grow(gs[first].mask, first);
      used[first] = 0;
    };
    const grow = (mask, last) => {
      if(over) return;
      if(mask === FULL){
        const mine = set.slice();
        const before = ways; rec(); set.length = 0; for(const x of mine) set.push(x);
        if(ways > before) for(const x of mine) for(const y of mine) together[x][y] = 1;
        return;
      }
      if(++nodes > budget){ over = true; return; }
      // the lowest type still missing must come from the next group: no duplicate sets
      const need = FULL & ~mask, bit = need & -need;
      for(let j = 0; j < G; j++){
        if(used[j] || !(gs[j].mask & bit) || (gs[j].mask & mask)) continue;
        let ok = true; for(const x of set) if(!can[x][j]){ ok = false; break; }
        if(!ok) continue;
        used[j] = 1; set.push(j);
        grow(mask | gs[j].mask, j);
        set.pop(); used[j] = 0;
        if(over) return;
      }
    };
    rec();
    if(over){ rcvOverG = G; return []; }
    if(ways === 0){ why = 'rose-cover'; return null; }
    let added = false;
    for(let i = 0; i < G; i++) for(let j = i + 1; j < G; j++){
      if(together[i][j]) continue;
      const a = gs[i], b = gs[j];
      if(a.mask & b.mask) continue;                     // already never together (same type twice)
      const dm = dmap.get(a.rep); if(dm && dm.has(b.rep)) continue;
      forbidden.push([a.tile, b.tile, 'rose-cover']); added = true;
    }
    const out = []; if(added) out.again = true;
    return out;
  }
  function roseCutStep(dmap){
    const out = [];
    for(const f of roseCuts) if(!rcIntoStep(f.C, f.into, out)){ why = 'rose-cut'; return null; }
    if(out.length > 0) return out;
    for(const f of roseCuts){
      if(!f.inP) continue;
      for(const c of f.C){
        const rep = find(c), mem = members.get(rep);
        let mask = 0, have = 0;
        for(const id of mem){ mask |= roseMask[id]; if(f.inP[id]) have |= roseMask[id]; }
        if((mask & f.full) !== (have & f.full)){ why = 'rose-cut'; return null; }     // it holds a full type outside P: no room for the one in P
        const lack = f.full & ~mask;
        if(!lack) continue;
        const blocked = dmap.get(rep) || null;
        if(!rcReach(f, rep, mem, mask, lack, blocked, null)){ why = 'rose-cut'; return null; }
        for(const id of mem) for(const { e, o } of adjE[id]){
          if(e.state !== 0 || !f.inP[o] || find(o) === rep) continue;
          if(!rcReach(f, rep, mem, mask, lack, blocked, e)){ e.state = 2; union(e.a, e.b); out.push({ e, value: 'same', rule: 'rose-cut' }); return out; }
        }
      }
    }
    return out;
  }
  function roseCutDynStep(dmap){
    const out = [];
    let bad = false, added = false;
    const sN = RC_NMAX, sC = RC_CAP; RC_NMAX = RC_DYN_NMAX; RC_CAP = RC_DYN_CAP;
    try {
    rcSearch(e => e.state === 1, (C, p, need) => {
      if(need > C.length){ bad = true; return false; }
      for(let i = 0; i < C.length; i++) for(let j = i + 1; j < C.length; j++){
        const ra = find(C[i]), rb = find(C[j]);
        if(ra === rb){ bad = true; return false; }
        const d = dmap.get(ra);
        if(!(d && d.has(rb))){ forbidden.push([C[i], C[j], 'rose-cut']); added = true; return false; }
      }
      const into = C.map(c => adjE[c].filter(({ e, o }) => e.state !== 1 && rcInPart(o, p)).map(({ e }) => e));
      if(!rcIntoStep(C, into, out)){ bad = true; return false; }
      if(out.length > 0) return false;
    }, true);
    } finally { RC_NMAX = sN; RC_CAP = sC; }
    if(bad){ why = 'rose-cut'; return null; }
    if(added) out.again = true;
    return out;
  }

  // ---- stamps and shapes ----
  const SH = 64;                                // shape cells are keyed x*SH+y (shapes are far smaller than 64 wide)
  const orientEntry = cells => ({ cells, set: new Set(cells.map(([x, y]) => x * SH + y)) });
  const stampList = [], stampIdxByKey = new Map(), stampAt = new Int16Array(N);
  for(const id of activeIds){
    const x = id % w, y = (id - x) / w, key = ctx.requiredShapeAt(x, y);
    if(key == null) continue;
    let idx = stampIdxByKey.get(key);
    if(idx === undefined){
      const cells = key.split('|').map(s => s.split(',').map(Number));        // canonicalShapeKey is 'x,y|x,y|...'
      idx = stampList.length; stampIdxByKey.set(key, idx);
      stampList.push({ key, size: cells.length, shape: { size: cells.length, orients: shapeOrientations(cells).map(orientEntry) }, cache: new Map() });
    }
    stampAt[id] = idx + 1;
  }
  // a group with no stamp must still be inside SOME allowed shape: the bank, plus the stamp shapes (so a stamp whose shape
  // is not in the bank is never contradicted here). Without a bank any shape is allowed.
  const banInfo = ctx.banInfo || null;
  let loose = null, looseSizes = [];
  const looseCache = new Map();
  if(ctx.useBank){
    const byKey = new Map();
    for(const o of ctx.bankOrientations){
      if(!byKey.has(o.canonicalKey)) byKey.set(o.canonicalKey, { size: o.cells.length, orients: [] });
      byKey.get(o.canonicalKey).orients.push(orientEntry(o.cells));
    }
    for(const sp of stampList) if(!byKey.has(sp.key) && !(banInfo && banInfo.keyBanned(sp.key))) byKey.set(sp.key, sp.shape);
    loose = [...byKey.values()].filter(s => s.size >= ctx.sizeLo && s.size <= ctx.sizeHi);
    looseSizes = [...new Set(loose.map(s => s.size))].sort((a, b) => a - b);
  }
  // sizes of the shapes (among `shapes`) that some placement of which contains every cell of the group `ids`
  function fitSizes(ids, shapes, cache){
    let minX = Infinity, minY = Infinity;
    for(let i = 0; i < ids.length; i++){ const x = ids[i] % w, y = (ids[i] - x) / w; if(x < minX) minX = x; if(y < minY) minY = y; }
    const codes = new Array(ids.length);
    for(let i = 0; i < ids.length; i++){ const x = ids[i] % w; codes[i] = (x - minX) * 256 + ((ids[i] - x) / w - minY); }
    codes.sort((a, b) => a - b);
    const ck = codes.join(',');
    const hit = cache.get(ck);
    if(hit !== undefined) return hit;
    const rel = ids.map(id => { const x = id % w; return [x - minX, (id - x) / w - minY]; });
    const sizes = new Set(), [x0, y0] = rel[0];
    for(const sh of shapes){
      if(sh.size < rel.length || sizes.has(sh.size)) continue;
      let found = false;
      for(const ori of sh.orients){
        for(const [sx, sy] of ori.cells){
          const dx = sx - x0, dy = sy - y0;
          let ok = true;
          for(const [x, y] of rel){ const X = x + dx, Y = y + dy; if(X < 0 || Y < 0 || X >= SH || Y >= SH || !ori.set.has(X * SH + Y)){ ok = false; break; } }
          if(ok){ found = true; break; }
        }
        if(found) break;
      }
      if(found) sizes.add(sh.size);
    }
    const out = [...sizes].sort((a, b) => a - b);
    if(cache.size > 100000) cache.clear();
    cache.set(ck, out);
    return out;
  }

  // v29: does this group of tiles (one piece for sure) already contain a banned shape? Translation does not matter, so the cache key is relative.
  let dStamp = null;                                    // v29: derived stamps (see core29_gd.js), null when there is no gemini / delta wall next to a stamp
  const banGroupCache = new Map();
  function groupBanned(ids){
    let minX = Infinity, minY = Infinity;
    for(let i = 0; i < ids.length; i++){ const x = ids[i] % w, y = (ids[i] - x) / w; if(x < minX) minX = x; if(y < minY) minY = y; }
    const rel = new Array(ids.length), codes = new Array(ids.length);
    for(let i = 0; i < ids.length; i++){ const x = ids[i] % w, y = (ids[i] - x) / w; rel[i] = [x - minX, y - minY]; codes[i] = (x - minX) * 256 + (y - minY); }
    codes.sort((a, b) => a - b);
    const ck = codes.join(',');
    let hit = banGroupCache.get(ck);
    if(hit === undefined){ hit = banInfo.cellsBanned(rel, null); if(banGroupCache.size > 100000) banGroupCache.clear(); banGroupCache.set(ck, hit); }
    return hit;
  }
  // v25: sizeSet = the sizes a piece may still have (Match: the common size, Mismatch: sizes that occur in some cover of the board by
  // different shapes), matchList = the shapes (Match) that fit every group of tiles known to be together. Both are refreshed at the start of
  // every propagation pass, and are null when the rule is off.
  let sizeSet = null, matchList = null, sizeWhy = 'match-size';
  let rangeSet = null;                    // v26: the sizes that occur in some cover of the board, only when lo..hi has holes
  // Could this set of cells (one group, or two groups about to be merged) still be a whole piece? Uses only facts that hold for
  // every tiling: no rose type twice; the piece size is the area number / the stamp's size (all of them inside must agree and the
  // group may not be bigger), otherwise at most the largest allowed size; the cells must still fit in the stamp's shape (or
  // some bank shape); every compass inside must still be satisfiable (compassPartialOk).
  // Returns { need: smallest size the piece needs (>= 1), cap: largest it can have, mask: rose types it holds } or null when impossible
  // (the tag of the failed check is left in `why`).
  function pieceInfo(ids){
    let cap = Math.min(ctx.sizeHi, ctx.totalActive), need = 1, area = 0, stamp = 0, mask = 0;
    if(lbAllMax){ cap = Math.min(cap, lbAllMax); need = Math.max(need, lbAllMin); }          // v65c
    for(let i = 0; i < ids.length; i++){
      const id = ids[i];
      const a = areaAt[id];
      if(a){ if(area && area !== a){ why = 'area'; return null; } area = a; }
      const s = stampAt[id] || (dStamp ? dStamp[id] : 0);
      if(s){ if(stamp && stamp !== s){ why = 'stamp-shape'; return null; } stamp = s; }
      const rm = roseMask[id];
      if(rm){ if(mask & rm){ why = roseTag('pair'); return null; } mask |= rm; }
    }
    if(stamp){ const m = stampList[stamp - 1].size; if(area && area !== m){ why = 'stamp-size'; return null; } area = m; }
    if(area){ if(area > cap || area < ctx.sizeLo){ why = stamp ? 'stamp-size' : 'size'; return null; } cap = area; need = area; }
    if(ids.length > cap){ why = stamp ? 'stamp-size' : 'size'; return null; }
    if(banInfo){                                         // v29: Shape ban't (with a bank, every listed shape is already free of banned shapes)
      if(stamp){ if(banInfo.keyBanned(stampList[stamp - 1].key)){ why = 'ban-fit'; return null; } }
      else if(!loose && ids.length >= banInfo.minSize && groupBanned(ids)){ why = 'ban-fit'; return null; }
    }
    if(K > 0) need = Math.max(need, roseTypeList.length, 1);        // v31: K also counts the Solitude bit, which needs no extra tile
    if(palMin){                                          // v35: a palisade tile with k open sides sits in a piece of >= k + 1 tiles; a 4 is a piece of one
      for(let i = 0; i < ids.length; i++){
        const pm = palMin[ids[i]]; if(!pm) continue;
        if(pm > cap || (pm === 1 && ids.length > 1)){ why = 'pal-size'; return null; }
        if(pm === 1) cap = 1;
        if(pm > need) need = pm;
        if(palCap && palCap[ids[i]]){ const pc2 = palCap[ids[i]]; if(ids.length > pc2 || need > pc2){ why = 'pal-size'; return null; } if(pc2 < cap) cap = pc2; }
      }
    }
    if(briOn && ids.length === 1 && briSingleBad(ids[0])){      // v36: a piece of one tile would have 4 walls at that corner
      if(cap < 2){ why = 'bri-vertex'; return null; }
      if(need < 2) need = 2;
    }
    if(looOn && ids.length === 1 && looSingleBad(ids[0])){      // v37: a piece of one tile would leave an odd number of walls at that corner
      if(cap < 2){ why = 'loo-parity'; return null; }
      if(need < 2) need = 2;
    }
    const shapes = stamp ? [stampList[stamp - 1].shape] : loose;
    if(shapes){
      const sizes = (ids.length === 1 && !stamp) ? looseSizes : fitSizes(ids, shapes, stamp ? stampList[stamp - 1].cache : looseCache);
      const lo = Math.max(need, ids.length);
      let pick = -1, top = -1;
      for(const s of sizes) if(s >= lo && s <= cap){ if(pick < 0) pick = s; top = s; }
      if(pick < 0){ why = stamp ? 'shape-fit' : 'bank-fit'; return null; }
      need = pick; cap = top;
    }
    if(hasCompass){
      const xy = ids.map(id => { const x = id % w; return [x, (id - x) / w]; });
      if(!compassPartialOk(ctx, xy, cap)){ why = 'compass'; return null; }
      for(const [x, y] of xy){ const cp = ctx.compasses.get(`${x},${y}`); if(cp) need = Math.max(need, compassMinSize(cp)); }
      if(opts.compassCap !== false) for(const [x, y] of xy){ const cp = ctx.compasses.get(`${x},${y}`);          // v64b
        if(cp && cp.n != null && cp.s != null && cp.e != null && cp.w != null){ const top = 1 + cp.n + cp.s + cp.e + cp.w; if(top < cap) cap = top; }
        if(cp && ctx.activeRows){                                                                              // v69a: half-board caps
          const R = ctx.activeRows, C = ctx.activeCols; let t;
          if(cp.s != null){ t = cp.s; for(let r = 0; r <= y; r++) t += R[r]; if(t < cap) cap = t; }
          if(cp.n != null){ t = cp.n; for(let r = y; r < R.length; r++) t += R[r]; if(t < cap) cap = t; }
          if(cp.e != null){ t = cp.e; for(let c = 0; c <= x; c++) t += C[c]; if(t < cap) cap = t; }
          if(cp.w != null){ t = cp.w; for(let c = x; c < C.length; c++) t += C[c]; if(t < cap) cap = t; }
        } }
      if(ids.length > cap || need > cap){ why = 'compass'; return null; }
    }
    let nd = Math.max(need, ids.length), cp = cap;
    if(matchList){
      const fit = (ids.length === 1 && !stamp) ? matchList : mFit(ids, matchList);
      let lo = -1, hi = -1;
      for(const sh of fit) if(sh.size >= nd && sh.size <= cp){ if(lo < 0 || sh.size < lo) lo = sh.size; if(sh.size > hi) hi = sh.size; }
      if(lo < 0){ why = 'match-fit'; return null; }
      nd = lo; cp = hi;
    }
    if(sizeSet){
      let lo = -1, hi = -1;
      for(const sz of sizeSet) if(sz >= nd && sz <= cp){ if(lo < 0) lo = sz; hi = sz; }
      if(lo < 0){ why = sizeWhy; return null; }
      nd = lo; cp = hi;
    }
    if(rangeSet){
      let lo = -1, hi = -1;
      for(const sz of rangeSet) if(sz >= nd && sz <= cp){ if(lo < 0) lo = sz; hi = sz; }
      if(lo < 0){ why = 'range-count'; return null; }
      nd = lo; cp = hi;
    }
    return { need: nd, cap: cp, mask };
  }
  const pieceNeeds = ids => { const r = pieceInfo(ids); return r ? r.need : 0; };

  // ---- where can each stamp go? (static part: placements that fit the grid, the fixed walls and the symbols) ----
  const stampTiles = [];                        // { id, si, placements: [[ids]] }
  {
    const mark = new Uint8Array(N);
    for(const id of activeIds){
      const si = stampAt[id]; if(!si) continue;
      const sp = stampList[si - 1], x0 = id % w, y0 = (id - x0) / w;
      const placements = [], seen = new Set();
      const rect = isRectangular(sp.shape.orients[0].cells);
      const shapeOk = sp.size >= ctx.sizeLo && sp.size <= ctx.sizeHi && !(ctx.boxyRule && !rect) && !(ctx.nonBoxyRule && rect) && !(banInfo && banInfo.keyBanned(sp.key));
      if(shapeOk) for(const ori of sp.shape.orients) for(const [sx, sy] of ori.cells){
        const ox = x0 - sx, oy = y0 - sy, cells = [];
        let ok = true;
        for(const [cx, cy] of ori.cells){
          const X = cx + ox, Y = cy + oy;
          if(X < 0 || Y < 0 || X >= w || Y >= h || !ctx.isActive(X, Y)){ ok = false; break; }
          cells.push(cid(X, Y));
        }
        if(!ok) continue;
        const key = cells.slice().sort((a, b) => a - b).join(',');
        if(seen.has(key)) continue;
        seen.add(key);
        for(const c of cells) mark[c] = 1;
        let good = true, rmask = 0, symbols = 0;
        for(const c of cells){
          const cx = c % w, cy = (c - cx) / w;
          if((stampAt[c] && stampAt[c] !== si) || (areaAt[c] && areaAt[c] !== sp.size)){ good = false; break; }
          if(roseMask[c]){ if(rmask & roseMask[c]){ good = false; break; } rmask |= roseMask[c]; }
          if(ctx.solitudeRule) symbols += symbolCountAt(cx, cy, ctx);
          for(const { e, o } of adjE[c]) if(mark[o] && e.state === 1){ good = false; break; }       // a fixed wall inside the piece
          if(!good) break;
        }
        for(const c of cells) mark[c] = 0;
        if(good && K > 0 && rmask !== FULL) good = false;                                           // one rose of EVERY type
        if(good && ctx.solitudeRule && symbols !== 1) good = false;
        if(good) placements.push(cells);
      }
      stampTiles.push({ id, si, placements });
    }
    // two tiles that cannot share a piece
    for(let i = 0; i < stampTiles.length; i++){
      const A = stampTiles[i];
      const sa = stampList[A.si - 1].size;
      for(const id of activeIds) if(areaAt[id] && areaAt[id] !== sa) forbidden.push([A.id, id, 'stamp-size']);
      for(let j = i + 1; j < stampTiles.length; j++){
        const B = stampTiles[j];
        if(A.si !== B.si) continue;                                                                  // different shapes: already forbidden above
        if(!A.placements.some(P => P.includes(B.id))) forbidden.push([A.id, B.id, 'stamp-pair']);
      }
    }
  }

  // ---- where can each stamp go? (dynamic part: what is still possible given the groups and walls decided so far) ----
  const markBuf = new Int32Array(N), cntBuf = new Int32Array(N), edgeCnt = new Int32Array(edges.length);
  let markGen = 0;
  function placementOk(P, rep, dmap){
    markGen++;
    for(const id of P) markBuf[id] = markGen;
    const tally = new Map();
    for(const id of P){ const r = find(id); tally.set(r, (tally.get(r) || 0) + 1); }
    if(!tally.has(rep)) return false;
    const dm = dmap.get(rep);
    for(const [r, c] of tally){
      if(c !== members.get(r).length) return false;               // a group is in ONE piece: all of it inside or none of it
      if(r !== rep && dm && dm.has(r)) return false;              // ... and it may not be one this piece is known to differ from
    }
    for(const id of P) for(const { e, o } of adjE[id]){
      if(markBuf[o] === markGen){ if(e.state === 1) return false; }       // a wall inside the piece
      else if(e.state === 2) return false;                                // a 'same' link leaving the piece
    }
    if(palOn && !palPlaceOk(P)) return false;                    // v35
    if(briOn && !briPlaceOk(P)) return false;                    // v36
    if(looOn && !looPlaceOk(P)) return false;                    // v37
    return pieceInfo(P) !== null;
  }
  // ---- v53b: area-place. Every connected piece of exactly the area number's tiles that holds the group (whole groups, no wall inside, not a group
  // known to be another piece, pieceInfo ok, every rose type once when there are roses), whose leftover parts of the board each hold every
  // rose type equally often. Tiles in all of them => same piece; edges on the border of all => wall; none => impossible.
  // Budget opts.areaPlaceNodes (default 400 000 per group per call): over budget = no conclusion. Sizes up to opts.areaPlaceMax (default 24).
  // Only when the board holds few pieces (ctx.pieceCapMax <= opts.areaPlaceK, default 2; roses give the exact count): there one placement of the
  // area piece fixes most of the board, and the leftover-parts test bites. With many pieces it rarely decides anything and costs a lot.
  // And only with >= 2 real rose types: they prune the listing (one type / Solitude alone left Zone2/1321 at 5 s instead of 0.4 s).
  const apSmallK = opts.areaPlace !== false && roseTypeList.length >= 2 && ctx.pieceCapMax != null && ctx.pieceCapMax <= (opts.areaPlaceK != null ? +opts.areaPlaceK : 2);
  const apIn = new Uint8Array(N), apSeen = new Uint8Array(N), apComp = new Int32Array(N);
  let apGen = 0;
  const apOver = new Set();                     // groups (rep, size) whose listing went over budget
  function apRestOk(){                       // every part of the board outside the placement holds each rose type equally often (K > 0)
    apGen++;
    for(const s0 of activeIds){
      if(apIn[s0] || apComp[s0] === apGen) continue;
      const q = [s0]; apComp[s0] = apGen; const cnt = new Array(K).fill(0);
      for(let k = 0; k < q.length; k++){
        const id = q[k], m = roseMask[id];
        if(m) for(let b = 0; b < K; b++) if(m & (1 << b)) cnt[b]++;
        for(const { e, o } of adjE[id]) if(e.state !== 1 && !apIn[o] && apComp[o] !== apGen){ apComp[o] = apGen; q.push(o); }
      }
      if(cnt[0] === 0 || cnt.some(c => c !== cnt[0])) return false;
    }
    return true;
  }
  function areaPlaceStep(dmap){
    const budget = inProbe ? (opts.areaPlaceProbeNodes != null ? +opts.areaPlaceProbeNodes : 50000) : (opts.areaPlaceNodes != null ? +opts.areaPlaceNodes : 400000), maxS = opts.areaPlaceMax != null ? +opts.areaPlaceMax : 24;
    for(const [rep, mem] of members){
      let s = 0;
      for(const id of mem) if(areaAt[id]){ s = areaAt[id]; break; }
      if(!s || mem.length >= s || s > maxS) continue;
      const apKey = rep * 4096 + mem.length;
      if(apOver.has(apKey)) continue;                                       // went over budget before with this group: not again until it grows
      const dm = dmap.get(rep);
      const V = []; let nodes = 0, over = false;
      for(const id of mem) apIn[id] = 1;
      const untried0 = [];
      for(const id of mem) for(const { e, o } of adjE[id]) if(e.state === 0 && !apIn[o] && !apSeen[o]){ apSeen[o] = 1; untried0.push(o); }
      const rec = (untried, size, mask) => {
        if(++nodes > budget){ over = true; return; }
        if(size === s){
          if(K > 0 && mask !== FULL) return;
          const P = activeIds.filter(id => apIn[id]);
          if(!placementOk(P, rep, dmap)) return;
          if(K > 0 && !apRestOk()) return;
          V.push(P); return;
        }
        if(K > 0){ let miss = 0; for(let b = 0; b < K; b++) if(!(mask & (1 << b))) miss++; if(s - size < miss) return; }
        const u = untried.slice(), extra = [], triedG = new Set();          // extra: tiles of a tried group marked as tried here (unmarked when this level is done)
        while(u.length && !over){
          const c = u.pop();
          if(apIn[c]) continue;
          const g = find(c), gm = members.get(g);
          if(triedG.has(g)) continue;
          triedG.add(g);
          if(size + gm.length > s) continue;
          if(dm && dm.has(g)) continue;
          let gmask = 0, bad = false;
          for(const id of gm){ const m = roseMask[id]; if(m & (mask | gmask)){ bad = true; break; } gmask |= m; if(areaAt[id] && areaAt[id] !== s){ bad = true; break; } }
          if(bad) continue;
          for(const id of gm) apIn[id] = 1;
          let wallIn = false;
          for(const id of gm) for(const { e, o } of adjE[id]) if(apIn[o] && e.state === 1){ wallIn = true; break; }
          if(!wallIn){
            const add = [];
            for(const id of gm) for(const { e, o } of adjE[id]) if(e.state !== 1 && !apIn[o] && !apSeen[o]){ apSeen[o] = 1; add.push(o); }
            rec(u.concat(add), size + gm.length, mask | gmask);
            for(const o of add) apSeen[o] = 0;
          }
          for(const id of gm) apIn[id] = 0;
          for(const id of gm) if(!apSeen[id]){ apSeen[id] = 1; extra.push(id); }       // the whole group is now tried at this level
        }
        for(const id of extra) apSeen[id] = 0;
      };
      let mask0 = 0; for(const id of mem) mask0 |= roseMask[id];
      rec(untried0, mem.length, mask0);
      for(const id of mem) apIn[id] = 0;
      apSeen.fill(0);
      if(over){ apOver.add(apKey); continue; }
      if(V.length === 0){ why = 'area-place'; return null; }
      const out = [];
      for(const P of V) for(const id of P) cntBuf[id]++;
      const sure = V[0].filter(id => cntBuf[id] === V.length);
      for(const P of V) for(const id of P) cntBuf[id] = 0;
      let merged = false;
      for(const id of sure) if(find(id) !== find(rep)){ union(rep, id); merged = true; }
      for(const id of sure) for(const { e, o } of adjE[id]) if(e.state === 0 && find(o) === find(id)){ e.state = 2; out.push({ e, value: 'same', rule: 'area-place' }); }
      for(const P of V){ markGen++; for(const id of P) markBuf[id] = markGen; for(const id of P) for(const { e, o } of adjE[id]) if(markBuf[o] !== markGen) edgeCnt[e.idx]++; }
      for(const P of V) for(const id of P) for(const { e } of adjE[id]){
        const n = edgeCnt[e.idx]; if(n === 0) continue; edgeCnt[e.idx] = 0;
        if(n === V.length && e.state === 0){ e.state = 1; out.push({ e, value: 'wall', rule: 'area-place' }); }
      }
      if(merged) out.again = true;
      if(out.length > 0 || merged) return out;
    }
    return [];
  }

  // returns a list of decided edges (tagged), with .again when groups were merged, or null when a stamp has nowhere to go
  function stampStep(dmap){
    for(const st of stampTiles){
      const rep = find(st.id), V = [];
      for(const P of st.placements) if(placementOk(P, rep, dmap)) V.push(P);
      if(V.length === 0){ why = 'stamp-place'; return null; }
      const out = [];
      // cells that EVERY remaining placement covers are in this piece
      for(const P of V) for(const id of P) cntBuf[id]++;
      const sure = V[0].filter(id => cntBuf[id] === V.length);
      for(const P of V) for(const id of P) cntBuf[id] = 0;
      let merged = false;
      for(const id of sure) if(find(id) !== find(st.id)){ union(st.id, id); merged = true; }
      for(const id of sure) for(const { e, o } of adjE[id]) if(e.state === 0 && find(o) === find(id)){ e.state = 2; out.push({ e, value: 'same', rule: 'stamp-place' }); }
      // an edge that is a boundary of EVERY remaining placement is a wall
      for(const P of V){
        markGen++;
        for(const id of P) markBuf[id] = markGen;
        for(const id of P) for(const { e, o } of adjE[id]) if(markBuf[o] !== markGen) edgeCnt[e.idx]++;
      }
      for(const P of V) for(const id of P) for(const { e } of adjE[id]){
        const n = edgeCnt[e.idx];
        if(n === 0) continue;
        edgeCnt[e.idx] = 0;
        if(n === V.length && e.state === 0){ e.state = 1; out.push({ e, value: 'wall', rule: 'stamp-place' }); }
      }
      if(merged) out.again = true;
      if(out.length > 0 || merged) return out;
    }
    return [];
  }

  // ---- regions closed in by walls (roses): every piece has exactly one rose of each type, so a region cut off by walls
  // holds the same number of each type (= its number of pieces); with exactly one of each it is a single piece ----
  function regionStep(){
    const comp = new Int32Array(N).fill(-1), out = [];
    const lo = ctx.sizeLo, hi = ctx.sizeHi;
    let merged = false;
    for(const start of activeIds){
      if(comp[start] >= 0) continue;
      const tiles = [start], cnt = new Array(K).fill(0);
      comp[start] = start;
      for(let qi = 0; qi < tiles.length; qi++){
        const id = tiles[qi], m = roseMask[id];
        if(m) for(let b = 0; b < K; b++) if(m & (1 << b)) cnt[b]++;
        for(const { e, o } of adjE[id]){ if(e.state === 1 || comp[o] >= 0) continue; comp[o] = start; tiles.push(o); }
      }
      const n = cnt[0];
      if(n === 0 || cnt.some(c => c !== n)){ why = roseTag('region'); return null; }
      if(tiles.length < n * lo || tiles.length > n * hi){ why = roseTag('region'); return null; }
      if(n === 1 && tiles.length > 1){
        for(const id of tiles) if(find(id) !== find(tiles[0])){ union(tiles[0], id); merged = true; }
        for(const id of tiles) for(const { e, o } of adjE[id]) if(e.state === 0 && find(o) === find(id)){ e.state = 2; out.push({ e, value: 'same', rule: roseTag('region') }); }
      }
    }
    if(merged) out.again = true;
    return out;
  }

  // can the piece of the group `mem` still reach `need` cells, a rose of every type it lacks (within `cap` cells), and enough
  // cells on each compass side, if `closed` (an open spot or null) became a wall? The tag of a failure is left in `reachWhy`.
  let reachWhy = '';
  const rcSeen = new Int32Array(N), rcDist = new Int16Array(N), rcQ = new Int32Array(N); let rcTick = 0;
  // ---- v54: cmp-budget. Every lacking rose type must be reachable within each compass number of the group (see build/patch_core54.py) ----
  const cbDist = new Int32Array(N), cbTick = new Int32Array(N); let cbT = 0;
  function cmpBudgetOk(rep, mem, blocked, closed, mask, lack){
    const comps = [];
    for(const id of mem){ const x = id % w, y = (id - x) / w, cp = ctx.compasses.get(`${x},${y}`); if(cp) comps.push({ x, y, cp }); }
    if(!comps.length) return true;
    const sideOf = (q, c, d) => { const x = q % w, y = (q - x) / w; return d === 'n' ? y < c.y : d === 's' ? y > c.y : d === 'e' ? x > c.x : x < c.x; };
    // the tiles of every group, and which groups can never join ours (a compass of either would overflow)
    const groupTiles = new Map();
    for(const id of activeIds){ const r = find(id); let g = groupTiles.get(r); if(!g){ g = []; groupTiles.set(r, g); } g.push(id); }
    const noJoin = new Map();
    const cantJoin = g => {
      if(noJoin.has(g)) return noJoin.get(g);
      const gt = groupTiles.get(g); let bad = false;
      const all = [...comps];
      for(const id of gt){ const x = id % w, y = (id - x) / w, cp = ctx.compasses.get(`${x},${y}`); if(cp) all.push({ x, y, cp }); }
      for(const c of all){ if(bad) break;
        for(const d of DIRS){ if(c.cp[d] == null) continue;
          let n = 0; for(const q of mem) if(sideOf(q, c, d)) n++; for(const q of gt) if(sideOf(q, c, d)) n++;
          if(n > c.cp[d]){ bad = true; break; } } }
      noJoin.set(g, bad); return bad;
    };
    for(const c of comps) for(const d of DIRS){
      if(c.cp[d] == null) continue;
      let used = 0; for(const q of mem) if(sideOf(q, c, d)) used++;
      const budget = c.cp[d] - used;
      if(budget < 0) return false;
      // bucket queue (costs are small integers <= budget)
      const T = ++cbT, buckets = Array.from({ length: budget + 1 }, () => []);
      for(const id of mem){ cbTick[id] = T; cbDist[id] = 0; buckets[0].push(id); }
      const entered = new Set([rep]);
      let got = 0;
      for(let k = 0; k <= budget && got !== lack; k++){
        const B = buckets[k];
        for(let i = 0; i < B.length; i++){
          const id = B[i]; if(cbDist[id] !== k) continue;
          for(const { e, o: nid } of adjE[id]){
            if(e.state === 1 || e === closed) continue;
            const g = find(nid);
            if(entered.has(g) || blocked.has(g)) continue;
            if(roseMask[nid] & mask) continue;
            const gt = groupTiles.get(g);
            if(gt.length > 1 && cantJoin(g)) continue;
            let cost = 0, gm = 0; for(const q of gt){ if(sideOf(q, c, d)) cost++; gm |= roseMask[q]; }
            if(gm & mask) continue;                                  // the group brings a second rose of a type we hold
            const nd = k + cost; if(nd > budget) continue;
            entered.add(g); got |= gm & lack;
            for(const q of gt){ cbTick[q] = T; cbDist[q] = nd; buckets[nd].push(q); }
          }
        }
      }
      if(got !== lack) return false;
    }
    return true;
  }

  // v68: palisade tiles a piece can pass through (some allowed wall pattern leaves >= 2 open sides); null = no palisades
  const palPass = (() => {
    if(opts.reachPalisade === false || !ctx.palisades || !ctx.palisades.size) return null;
    const a = new Uint8Array(N).fill(1);
    for(const [key, t] of ctx.palisades){
      const masks = PAL_MASKS[String(t)]; if(!masks) continue;
      const [pc, pr] = key.split(',').map(Number); if(!ctx.isActive(pc, pr)) continue;
      let fixedM = 0;
      [[0, -1], [1, 0], [0, 1], [-1, 0]].forEach(([dc, dr], i) => { const x = pc + dc, y = pr + dr; if(x < 0 || y < 0 || x >= w || y >= h || !ctx.isActive(x, y)) fixedM |= 1 << i; });
      let maxOpen = 0;
      for(const m of masks){ if((m & fixedM) !== fixedM) continue; const open = 4 - ((m & 1) + ((m >> 1) & 1) + ((m >> 2) & 1) + ((m >> 3) & 1)); if(open > maxOpen) maxOpen = open; }
      if(maxOpen <= 1) a[cid(pc, pr)] = 0;
    }
    return a;
  })();
  const rpSeen = new Int32Array(N); let rpTick = 0;
  function reachPartsOk(rep, mem, blocked, closed, mask){
    // parts = tiles linked by state-2 edges
    const t0 = ++rpTick; const q = [mem[0]]; rpSeen[mem[0]] = t0;
    for(let i = 0; i < q.length; i++) for(const { e, o } of adjE[q[i]]) if(e.state === 2 && rpSeen[o] !== t0){ rpSeen[o] = t0; q.push(o); }
    if(q.length === mem.length) return true;                                   // one part
    // from the first part, through open edges and tiles the reach count may use, every tile of the group must be met
    const t1 = ++rpTick; const Q = []; for(const id of q){ rpSeen[id] = t1; Q.push(id); }
    let met = q.length;
    for(let i = 0; i < Q.length && met < mem.length; i++){
      if(palPass && !palPass[Q[i]] && find(Q[i]) !== rep) continue;          // v68: a palisade dead end does not lead on
      for(const { e, o } of adjE[Q[i]]){
        if(rpSeen[o] === t1 || e.state === 1 || e === closed) continue;
        const g = find(o);
        if(g !== rep){ if(blocked.has(g) || (roseMask[o] & mask)) continue; if(rcJoin.get(g) === false) continue; }
        rpSeen[o] = t1; Q.push(o); if(g === rep) met++;
      }
    }
    return met >= mem.length;
  }
  const rcJoin = new Map();
  function reachOk(rep, mem, blocked, closed, need, cap){
    const tick = ++rcTick; let qn = 0;
    rcJoin.clear();
    let mask = 0;
    for(const id of mem){ rcSeen[id] = tick; rcDist[id] = 0; rcQ[qn++] = id; mask |= roseMask[id]; }
    if(closed){                                   // a wall means the two tiles are in DIFFERENT pieces: the far side's whole group is out
      const far = find(closed.a) === rep ? closed.b : closed.a;
      blocked = new Set(blocked); blocked.add(find(far));
    }
    const lack = FULL & ~mask, best = (K > 0 && lack) ? new Array(K).fill(1e9) : null;
    let found = 0;
    for(let qi = 0; qi < qn; qi++){
      const id = rcQ[qi];
      if(palPass && !palPass[id] && find(id) !== rep) continue;                // v68
      for(const { e, o: nid } of adjE[id]){
        if(rcSeen[nid] === tick) continue;
        if(e.state === 1 || e === closed) continue;
        if(blocked.has(find(nid))) continue;
        if(roseMask[nid] & mask) continue;        // a second rose of a type the group already holds can never join it
        if(hasCompass && opts.reachCompass !== false){                         // v67b: a compass group that can not join this one
          const g = find(nid);
          if(g !== rep){
            let ok = rcJoin.get(g);
            if(ok === undefined){
              const gm = members.get(g); let hasC = false;
              for(const t of gm){ const tx = t % w; if(ctx.compasses.has(`${tx},${(t - tx) / w}`)){ hasC = true; break; } }
              const sv = why; ok = !hasC || pieceInfo(mem.concat(gm)) !== null; why = sv;
              rcJoin.set(g, ok);
            }
            if(!ok) continue;
          }
        }
        rcSeen[nid] = tick; rcDist[nid] = rcDist[id] + 1; rcQ[qn++] = nid;
        if(best && !(opts.reachArea !== false && areaAt[nid] && mem.length + rcDist[nid] > areaAt[nid])){      // v53e: the piece would be bigger than that tile's number
          const rm = roseMask[nid] & lack; if(rm) for(let b = 0; b < K; b++) if((rm & (1 << b)) && best[b] === 1e9){ best[b] = rcDist[nid]; found |= (1 << b); } }
      }
      if(!hasCompass && qn >= need && found === lack) break;      // nothing more to learn (the BFS is in distance order)
    }
    // v67c: the parts of a split group must meet
    if(opts.reachParts !== false && mem.length > 1 && !reachPartsOk(rep, mem, blocked, closed, mask)){ reachWhy = 'grow'; return false; }
    reachWhy = 'reach';
    if(qn < need) return false;
    if(K > 0 && lack){
      let far = 0;
      for(let b = 0; b < K; b++){
        if(!(lack & (1 << b))) continue;
        if(best[b] === 1e9){ reachWhy = roseTag('reach'); return false; }          // no rose of that type left to reach
        if(best[b] > far) far = best[b];
      }
      if(mem.length + far > cap){ reachWhy = roseTag('reach'); return false; }  // the nearest one is too far for the size limit
    }
    if(hasCompass){
      for(const id of mem){
        const cx = id % w, cy = (id - cx) / w, cp = ctx.compasses.get(`${cx},${cy}`);
        if(!cp) continue;
        const cnt = { n:0, e:0, s:0, w:0 };
        for(let qi = 0; qi < qn; qi++){ const q = rcQ[qi], x = q % w, y = (q - x) / w; if(y < cy) cnt.n++; else if(y > cy) cnt.s++; if(x > cx) cnt.e++; else if(x < cx) cnt.w++; }
        for(const d of DIRS) if(cp[d] != null && cnt[d] < cp[d]){ reachWhy = 'compass'; return false; }
      }
      if(K > 0 && lack && opts.cmpBudget !== false && !cmpBudgetOk(rep, mem, blocked, closed, mask, lack)){ reachWhy = 'cmp-budget'; return false; }
    }
    return true;
  }

  // ============================================================================================================
  // v24: facts about MINGLE AREA (neighbouring pieces differ in size) and MINGLE SHAPE (neighbouring pieces differ in shape)
  // Same contract as the v23 block: everything here holds in EVERY valid tiling, so it can only decide edges, never lose a
  // solution. Two pieces are neighbours exactly when a wall runs between them, so the rules are 'not equal' constraints along
  // every wall. Each group of tiles known to be together gets a DOMAIN: the values (sizes / shapes) its piece can still take.
  //   mingle-*-single   only one value is possible (one size, one shape, or Match is on) => no wall can exist: every edge is a link
  //   mingle-*-clash    (impossible) the values ran out: a piece's neighbours use up every value it could have
  //   mingle-*-none     (impossible) no piece can have any allowed value at all
  //   mingle-*-link     two neighbouring tiles whose pieces are both pinned to the SAME value can not be separated by a wall
  //   mingle-*-merge    two groups with no value in common can not be one piece => wall
  //   mingle-*-parity   exactly two values: neighbours alternate. Odd chain of walls => different => wall; even chain => same => link;
  //                     an odd loop of walls is impossible
  //   mingle-*-corner   exactly two values: three pieces meeting at a corner (a T of walls) would need three values
  //   (and a pinned piece removes its value from its neighbours' domains, which raises the minimum / lowers the maximum size
  //    of the neighbour: that feeds forced growth and reachability, it is not an event of its own)
  // ============================================================================================================
  const mingleModes = [];
  if(ctx.mingleAreaRule) mingleModes.push('area');
  if(ctx.mingleShapeRule) mingleModes.push('shape');
  const MINGLE_ENUM_MAX = 6;                    // without a bank, shapes are listed up to this many cells (1+1+2+5+12+35 = 56); bigger ones stay 'some shape of that size'
  const mingleRectOk = rect => !(ctx.boxyRule && !rect) && !(ctx.nonBoxyRule && rect);
  let mBank = null;                             // bank shapes (+ stamp shapes) as { key, size, orients, rect }, within the size limits and the boxy rules
  const mFreeLists = [null];                    // no bank: mFreeLists[n] = every free polyomino of n cells (built on demand), filtered like mBank
  let mFreeBase = null;                         // unfiltered by size: [ [], [monomino], [domino], ... ]
  const mFitCache = new Map();
  function mFreeList(n){
    if(!mFreeBase && FREE_BASE_CACHE) mFreeBase = FREE_BASE_CACHE;
    if(!mFreeBase){
      mFreeBase = [[], [{ key: canonicalShapeKey([[0, 0]]), cells: [[0, 0]] }]];
      for(let s = 2; s <= MINGLE_ENUM_MAX; s++){
        const seen = new Map();
        for(const sh of mFreeBase[s - 1]){
          const have = new Set(sh.cells.map(([x, y]) => x + ',' + y));
          for(const [x, y] of sh.cells) for(const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
            const nx = x + dx, ny = y + dy;
            if(have.has(nx + ',' + ny)) continue;
            const cells = normalizeCells(sh.cells.concat([[nx, ny]])), key = canonicalShapeKey(cells);
            if(!seen.has(key)) seen.set(key, { key, cells });
          }
        }
        mFreeBase[s] = [...seen.values()];
      }
      FREE_BASE_CACHE = mFreeBase;
    }
    for(let s = mFreeBase.length; s <= n && s <= 10; s++){                      // v48: more cells on demand (the Match shape split asks for up to 9)
      const seen = new Map();
      for(const sh of mFreeBase[s - 1]){
        const have = new Set(sh.cells.map(([x, y]) => x + ',' + y));
        for(const [x, y] of sh.cells) for(const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
          const nx = x + dx, ny = y + dy;
          if(have.has(nx + ',' + ny)) continue;
          const cells = normalizeCells(sh.cells.concat([[nx, ny]])), key = canonicalShapeKey(cells);
          if(!seen.has(key)) seen.set(key, { key, cells });
        }
      }
      mFreeBase[s] = [...seen.values()];
    }
    if(!mFreeLists[n]){
      if(!FREE_FULL_CACHE[n]) FREE_FULL_CACHE[n] = mFreeBase[n].map(s => ({ key: s.key, size: n, orients: shapeOrientations(s.cells).map(orientEntry), rect: isRectangular(s.cells) }));
      const list = FREE_FULL_CACHE[n].filter(s => mingleRectOk(s.rect) && !(ctx.banInfo && ctx.banInfo.keyBanned(s.key)));
      list.id = 'F' + n; mFreeLists[n] = list;
    }
    return mFreeLists[n];
  }
  if((mingleModes.length > 0 || ctx.mismatchRule || ctx.matchRule) && ctx.useBank){
    const byKey = new Map();
    for(const o of ctx.bankOrientations){
      if(!byKey.has(o.canonicalKey)) byKey.set(o.canonicalKey, { key: o.canonicalKey, size: o.cells.length, orients: [], rect: isRectangular(o.cells) });
      byKey.get(o.canonicalKey).orients.push(orientEntry(o.cells));
    }
    for(const sp of stampList) if(!byKey.has(sp.key)) byKey.set(sp.key, { key: sp.key, size: sp.size, orients: sp.shape.orients, rect: isRectangular(sp.shape.orients[0].cells) });
    mBank = [...byKey.values()].filter(s => s.size >= ctx.sizeLo && s.size <= ctx.sizeHi && s.size <= ctx.totalActive && mingleRectOk(s.rect));
    mBank.id = 'B';
  }
  // the shapes of `list` that some placement of which contains every cell of the group `ids`
  function mFit(ids, list){
    let minX = Infinity, minY = Infinity;
    for(let i = 0; i < ids.length; i++){ const x = ids[i] % w, y = (ids[i] - x) / w; if(x < minX) minX = x; if(y < minY) minY = y; }
    const codes = new Array(ids.length);
    for(let i = 0; i < ids.length; i++){ const x = ids[i] % w; codes[i] = (x - minX) * 256 + ((ids[i] - x) / w - minY); }
    codes.sort((a, b) => a - b);
    const ck = list.id + '|' + codes.join(',');
    const hit = mFitCache.get(ck);
    if(hit !== undefined) return hit;
    const rel = ids.map(id => { const x = id % w; return [x - minX, (id - x) / w - minY]; });
    const out = [], [x0, y0] = rel[0];
    for(const sh of list){
      if(sh.size < rel.length) continue;
      let found = false;
      for(const ori of sh.orients){
        for(const [sx, sy] of ori.cells){
          const dx = sx - x0, dy = sy - y0;
          let ok = true;
          for(const [x, y] of rel){ const X = x + dx, Y = y + dy; if(X < 0 || Y < 0 || X >= SH || Y >= SH || !ori.set.has(X * SH + Y)){ ok = false; break; } }
          if(ok){ found = true; break; }
        }
        if(found) break;
      }
      if(found) out.push(sh);
    }
    if(mFitCache.size > 100000) mFitCache.clear();
    mFitCache.set(ck, out);
    return out;
  }

  // ---- the static universe: how many different values can ANY piece take (an over-estimate, so 'one' / 'two' are certain) ----
  const mUniverse = {};
  for(const mode of mingleModes){
    let count;
    if(mode === 'area'){
      if(mBank) count = new Set(mBank.map(s => s.size)).size;
      else count = Math.max(0, Math.min(ctx.sizeHi, ctx.totalActive) - Math.max(ctx.sizeLo, ctx.nonBoxyRule ? 3 : 1) + 1);
    } else {
      if(mBank) count = mBank.length;
      else if(Math.min(ctx.sizeHi, ctx.totalActive) <= MINGLE_ENUM_MAX){
        count = 0;
        for(let n = Math.max(ctx.sizeLo, 1); n <= Math.min(ctx.sizeHi, ctx.totalActive); n++) count += mFreeList(n).length;
      } else count = Infinity;                  // too many shapes to list
    }
    // Match: every piece has the same shape (so the same size): that is ONE value
    mUniverse[mode] = { count, single: count <= 1 || ctx.matchRule };
  }

  // ---- domains ----
  // { items: [{k, size}] listed values; wlo..whi: a run of sizes that are not listed one by one (Mingle Area without a bank: every
  //   size; Mingle Shape without a bank: the shapes too big to list, which can never be ruled out by name); ex / rm: what was removed }
  const mkDom = (items, wlo, whi) => ({ items, wlo, whi, ex: null, rm: null });
  function domCount(d, area){                   // -> { n: 0 | 1 | 2 (= two or more), k, size }
    let n = 0, k = null, size = 0;
    for(const it of d.items){
      if(d.rm && d.rm.has(it.k)) continue;
      if(++n === 1){ k = it.k; size = it.size; } else return { n: 2, k: null, size: 0 };
    }
    if(d.wlo <= d.whi){
      if(!area) return { n: 2, k: null, size: 0 };
      for(let s = d.wlo; s <= d.whi; s++){
        if(d.ex && d.ex.has(s)) continue;
        if(++n === 1){ k = s; size = s; } else return { n: 2, k: null, size: 0 };
      }
    }
    return { n, k, size };
  }
  function domBounds(d, area){                  // smallest and largest size still possible
    let lo = Infinity, hi = -Infinity;
    for(const it of d.items){ if(d.rm && d.rm.has(it.k)) continue; if(it.size < lo) lo = it.size; if(it.size > hi) hi = it.size; }
    if(d.wlo <= d.whi){
      let a = d.wlo, b = d.whi;
      if(area && d.ex){ while(a <= b && d.ex.has(a)) a++; while(b >= a && d.ex.has(b)) b--; }
      if(a <= b){ if(a < lo) lo = a; if(b > hi) hi = b; }
    }
    return { lo, hi };
  }
  function domHas(d, k, size, area){
    for(const it of d.items) if(it.k === k && !(d.rm && d.rm.has(k))) return true;
    if(!(d.wlo <= d.whi && size >= d.wlo && size <= d.whi)) return false;
    return area ? !(d.ex && d.ex.has(size)) : !(d.rm && d.rm.has(k));              // v92d: a shape too big to list may be any shape of that size
  }
  function domRemove(d, k, size, area){
    if(!d.rm) d.rm = new Set();
    d.rm.add(k);
    if(area && size >= d.wlo && size <= d.whi){ if(!d.ex) d.ex = new Set(); d.ex.add(size); }
  }
  function domEmpty(d, area){ return domCount(d, area).n === 0; }
  function domIntersects(a, b, area){
    for(const it of a.items){ if(a.rm && a.rm.has(it.k)) continue; if(domHas(b, it.k, it.size, area)) return true; }
    for(const it of b.items){ if(b.rm && b.rm.has(it.k)) continue; if(domHas(a, it.k, it.size, area)) return true; }
    if(a.wlo <= a.whi && b.wlo <= b.whi){
      const lo = Math.max(a.wlo, b.wlo), hi = Math.min(a.whi, b.whi);
      if(!area) return lo <= hi;                // unlisted shapes might coincide: say yes
      for(let s = lo; s <= hi; s++) if(!(a.ex && a.ex.has(s)) && !(b.ex && b.ex.has(s))) return true;
    }
    return false;
  }
  // the domain of one group of tiles, given the smallest and largest size its piece can have (from pieceInfo)
  function mingleDomain(mode, mem, lo, hi){
    const area = mode === 'area';
    lo = Math.max(lo, ctx.sizeLo, 1);              // pieceInfo's minimum does not include the Minimum / Precision rule
    let stampIdx = 0;
    for(const id of mem) if(stampAt[id]){ stampIdx = stampAt[id]; break; }
    if(stampIdx){                               // a stamp: the piece is exactly that shape
      const sp = stampList[stampIdx - 1];
      return sp.size < lo || sp.size > hi ? mkDom([], 1, 0) : mkDom([{ k: area ? sp.size : sp.key, size: sp.size }], 1, 0);
    }
    if(mBank){
      const list = mem.length === 1 ? mBank : mFit(mem, mBank), items = [], seen = new Set();
      for(const s of list){
        if(s.size < lo || s.size > hi) continue;
        const k = area ? s.size : s.key;
        if(seen.has(k)) continue;
        seen.add(k); items.push({ k, size: s.size });
      }
      return mkDom(items, 1, 0);
    }
    if(area) return mkDom([], Math.max(lo, ctx.nonBoxyRule ? 3 : 1), hi);
    const items = [];
    for(let n = Math.max(lo, 1); n <= Math.min(hi, MINGLE_ENUM_MAX); n++){
      const list = mFreeList(n);
      for(const s of (mem.length === 1 ? list : mFit(mem, list))) items.push({ k: s.key, size: n });
    }
    return mkDom(items, Math.max(lo, MINGLE_ENUM_MAX + 1), hi);
  }

  // one mode (area or shape): tightens `need` / `capOf` of the groups and returns decided edges (with .again when groups merged),
  // or null when impossible (the tag is left in `why`)
  function mingleRound(mode, need, capOf){
    const T = mode === 'area' ? 'mingle-area' : 'mingle-shape', area = mode === 'area', U = mUniverse[mode];
    if(U.count === 0 && ctx.totalActive > 0){ why = T + '-none'; return null; }
    // one value only: two neighbouring pieces would always share it, so there is no wall anywhere
    if(U.single){
      for(const e of edges) if(e.state === 1){ why = T + '-single'; return null; }
      const out = [];
      for(const e of spots) if(e.state === 0){ e.state = 2; union(e.a, e.b); out.push({ e, value: 'same', rule: T + '-single' }); }
      return out;
    }
    const dom = new Map();
    for(const [rep, mem] of members){
      const d = mingleDomain(mode, mem, need.get(rep), capOf.get(rep));
      if(domEmpty(d, area)){ why = T + '-none'; return null; }
      dom.set(rep, d);
    }
    if(area && opts.minglePocket !== false && !minglePocket(dom)) return null;          // v52
    const placeDec = (area && opts.minglePlace !== false) ? minglePlace(dom) : [];       // v52
    if(placeDec === null) return null;
    if(area && opts.mingleConnect !== false && !mingleConnect(dom)) return null;          // v52
    const wallPairs = [];
    for(const e of edges){ if(e.state !== 1) continue; const ra = find(e.a), rb = find(e.b); if(ra !== rb) wallPairs.push([ra, rb]); }
    // a piece pinned to one value takes that value away from every neighbour (across a wall); repeat until nothing changes
    for(let guard = 0, changed = true; changed && guard < 60; guard++){
      changed = false;
      for(const [ra, rb] of wallPairs) for(const [x, y] of [[ra, rb], [rb, ra]]){
        const p = domCount(dom.get(x), area);
        if(p.n !== 1) continue;
        const dy = dom.get(y);
        if(!domHas(dy, p.k, p.size, area)) continue;
        domRemove(dy, p.k, p.size, area); changed = true;
        if(domEmpty(dy, area)){ why = T + '-clash'; return null; }
      }
    }
    // the surviving values bound the size of every group
    for(const [rep, d] of dom){
      const b = domBounds(d, area);
      // only what Mingle adds: the Minimum rule alone is not written back (it would make every single tile 'need' neighbours: slow, and the search already covers it)
      if(b.lo > Math.max(need.get(rep), ctx.sizeLo)) need.set(rep, b.lo);
      if(b.hi < capOf.get(rep)) capOf.set(rep, b.hi);
    }
    const decisions = [];
    // exactly two values: pieces alternate along walls
    if(U.count === 2){
      const adj = new Map(), comp = new Map(), col = new Map();
      for(const [a, b] of wallPairs){
        if(!adj.has(a)) adj.set(a, []); adj.get(a).push(b);
        if(!adj.has(b)) adj.set(b, []); adj.get(b).push(a);
      }
      let nc = 0;
      for(const start of adj.keys()){
        if(comp.has(start)) continue;
        comp.set(start, nc); col.set(start, 0);
        const queue = [start];
        for(let qi = 0; qi < queue.length; qi++){
          const cur = queue[qi];
          for(const nb of adj.get(cur)){
            if(!comp.has(nb)){ comp.set(nb, nc); col.set(nb, 1 - col.get(cur)); queue.push(nb); }
            else if(col.get(nb) === col.get(cur)){ why = T + '-parity'; return null; }        // an odd loop of neighbours
          }
        }
        nc++;
      }
      for(const e of spots){
        if(e.state !== 0) continue;
        const ra = find(e.a), rb = find(e.b);
        if(ra === rb || !comp.has(ra) || comp.get(ra) !== comp.get(rb)) continue;
        decisions.push({ e, value: col.get(ra) === col.get(rb) ? 'same' : 'wall', rule: T + '-parity' });
      }
    }
    // open spots between two groups: both pinned to the same value => link; no value in common => wall
    if(decisions.length === 0){
      for(const e of spots){
        if(e.state !== 0) continue;
        const ra = find(e.a), rb = find(e.b);
        if(ra === rb) continue;
        const da = dom.get(ra), db = dom.get(rb), pa = domCount(da, area), pb = domCount(db, area);
        if(pa.n === 1 && pb.n === 1 && pa.k === pb.k) decisions.push({ e, value: 'same', rule: T + '-link' });
        else if(!domIntersects(da, db, area)) decisions.push({ e, value: 'wall', rule: T + '-merge' });
      }
    }
    for(const d of placeDec) decisions.push(d);                                         // v52
    const out = [];
    const apply = d => { if(d.e.state !== 0) return; if(d.value === 'same'){ d.e.state = 2; union(d.e.a, d.e.b); } else d.e.state = 1; out.push(d); };
    for(const d of decisions) apply(d);
    if(out.length > 0) return out;
    // exactly two values: no corner where three walls meet (three pieces that all touch each other need three values)
    if(U.count === 2){
      for(const id of activeIds){
        const c = id % w, r = (id - c) / w;
        if(c + 1 >= w || r + 1 >= h || !ctx.isActive(c + 1, r) || !ctx.isActive(c, r + 1) || !ctx.isActive(c + 1, r + 1)) continue;
        const es = [edgeBetween(c, r, c + 1, r), edgeBetween(c, r + 1, c + 1, r + 1), edgeBetween(c, r, c, r + 1), edgeBetween(c + 1, r, c + 1, r + 1)];
        const open = [], baseWalls = es.filter(e => e.state === 1).length;
        es.forEach((e, i) => { if(e.state === 0) open.push(i); });
        const valid = [];                                          // each valid completion: bit j = open[j] is a wall
        for(let m = 0; m < (1 << open.length); m++){
          let walls = baseWalls;
          for(let j = 0; j < open.length; j++) if(m & (1 << j)) walls++;
          if(walls !== 3) valid.push(m);
        }
        if(valid.length === 0){ why = T + '-corner'; return null; }
        for(let j = 0; j < open.length; j++){
          const first = valid[0] & (1 << j);
          if(valid.every(m => (m & (1 << j)) === first)) apply({ e: es[open[j]], value: first ? 'wall' : 'same', rule: T + '-corner' });
        }
        if(out.length > 0) return out;
      }
    }
    return out;
  }
  // v52: mingle-area-pocket (see patch_core52.py). Tightens the area domains in place; false = some group has no size left
  let mpEdges = null, pkComp = null, pkQueue = null, pkSeen = null, pkStamp = 0;
  function minglePocket(dom){
    if(!mpEdges){ mpEdges = new Map(); for(const id of activeIds) mpEdges.set(id, []); for(const e of edges){ mpEdges.get(e.a).push(e); mpEdges.get(e.b).push(e); } }
    if(!pkComp){ pkComp = new Int32Array(N); pkQueue = new Int32Array(N); pkSeen = new Int32Array(N); }
    // pinned groups -> size (0 = not pinned); a tile of a pinned group is a wall for the flood
    const pinOf = new Map(); let anyPin = false;
    for(const [rep, d] of dom){ const p = domCount(d, true); if(p.n === 1){ pinOf.set(rep, p.size); anyPin = true; } }
    if(!anyPin) return true;
    pkComp.fill(-1);
    for(const s0 of activeIds){
      if(pkComp[s0] >= 0 || pinOf.has(find(s0))) continue;
      // flood the tiles of non-pinned groups through edges that are not walls
      let qh = 0, qt = 0, size = 0; const vals = [];
      pkQueue[qt++] = s0; pkComp[s0] = s0; const stamp = ++pkStamp;
      while(qh < qt){
        const u = pkQueue[qh++]; size++;
        for(const e of mpEdges.get(u)){
          if(e.state === 1) continue;
          const o = e.a === u ? e.b : e.a;
          if(pkComp[o] >= 0) continue;
          const v = pinOf.get(find(o));
          if(v !== undefined){ if(pkSeen[o] !== stamp){ pkSeen[o] = stamp; if(vals.indexOf(v) < 0) vals.push(v); } continue; }
          pkComp[o] = s0; pkQueue[qt++] = o;
        }
      }
      // the groups of this pocket: their size is <= size, or one of vals
      for(let i = 0; i < qt; i++){
        const r = find(pkQueue[i]);
        const d = dom.get(r);
        if(d.pk === stamp) continue; d.pk = stamp;                       // once per group and pocket
        const b = domBounds(d, true);
        if(size >= b.hi) continue;                                 // the pocket alone can hold every size still possible
        for(const it of d.items){ if(d.rm && d.rm.has(it.k)) continue; if(it.size > size && vals.indexOf(it.size) < 0) domRemove(d, it.k, it.size, true); }
        if(d.wlo <= d.whi){                                        // the run of sizes: cut its top down to the largest size still allowed, exclude the gaps below
          let top = size; for(const v of vals) if(v > top && v <= d.whi) top = v;
          if(top < d.whi) d.whi = top;
          for(let x = Math.max(d.wlo, size + 1); x < d.whi; x++){ if(vals.indexOf(x) < 0 && !(d.ex && d.ex.has(x))) domRemove(d, x, x, true); }
        }
        if(domEmpty(d, true)){ why = 'mingle-area-pocket'; return false; }
      }
    }
    return true;
  }
  // v52: mingle-area-place (see patch_core52.py). Tightens the area domains in place; returns edge decisions, or null = impossible
  function minglePlace(dom){
    const SMAX = opts.minglePlaceMax != null ? +opts.minglePlaceMax : 6, LIMIT = 4000;
    if(!mpEdges){ mpEdges = new Map(); for(const id of activeIds) mpEdges.set(id, []); for(const e of edges){ mpEdges.get(e.a).push(e); mpEdges.get(e.b).push(e); } }
    // flat views for this call: group of every tile, pinned size of every group, neighbouring groups (across edges that are not walls)
    const rp = new Int32Array(N), pin = new Int32Array(N), sz = new Int32Array(N);
    for(const id of activeIds) rp[id] = find(id);
    for(const [rep, mem] of members){ sz[rep] = mem.length; const p = domCount(dom.get(rep), true); if(p.n === 1) pin[rep] = p.size; }
    const nbList = new Map();
    const nbOf = rep => {
      let o = nbList.get(rep); if(o) return o;
      o = [];
      for(const id of members.get(rep)) for(const e of mpEdges.get(id)){ if(e.state === 1) continue; const q = rp[e.a === id ? e.b : e.a]; if(q !== rep && o.indexOf(q) < 0) o.push(q); }
      nbList.set(rep, o); return o;
    };
    const allowCache = new Map();
    const allows = (q, s) => { let v = allowCache.get(q); if(v === undefined){ v = domHas(dom.get(q), s, s, true); allowCache.set(q, v); } return v; };
    const inSet = new Uint8Array(N), marked = new Uint8Array(N), stampA = new Int32Array(N), cntAll = new Int32Array(N), cntAdj = new Int32Array(N), seenAny = new Uint8Array(N);
    let stampN = 0;
    const out = [];
    for(const [start, smem] of members){
      const s = pin[start];
      if(!s || s > SMAX || smem.length >= s) continue;
      allowCache.clear();
      const setList = [start]; inSet[start] = 1; marked[start] = 1;
      const touched = [start];                                     // every rep whose flags this group used (reset at the end)
      const startNb = [];
      for(const id of smem) for(const e of mpEdges.get(id)){ if(e.state !== 0) continue; const q = rp[e.a === id ? e.b : e.a]; if(q !== start && startNb.indexOf(q) < 0) startNb.push(q); }
      let valid = 0, n = 0, over = false, done = false, nAllIn = 0, nAllAdj = 0;
      const adjNow = [];
      const leaf = () => {
        stampN++; adjNow.length = 0;
        for(const rep of setList) for(const id of members.get(rep)) for(const e of mpEdges.get(id)){
          const q = rp[e.a === id ? e.b : e.a];
          if(inSet[q]){ if(e.state === 1) return; continue; }            // a wall inside the piece
          if(pin[q] === s) return;                                        // touches another piece of the same size
          if(stampA[q] !== stampN){ stampA[q] = stampN; adjNow.push(q); }
        }
        valid++;
        for(const r of setList){ if(!seenAny[r]){ seenAny[r] = 1; touched.push(r); } cntAll[r]++; }
        for(const q of adjNow){ if(cntAdj[q] === 0) touched.push(q); cntAdj[q]++; }
        // still something to learn? a group in every piece so far, a group next to every piece, or an unused open neighbour of `start`
        nAllIn = 0; for(const r of setList) if(r !== start && cntAll[r] === valid) nAllIn++;
        nAllAdj = 0; for(const q of adjNow) if(cntAdj[q] === valid) nAllAdj++;
        if(nAllIn === 0 && nAllAdj === 0){ let all = true; for(const q of startNb) if(!seenAny[q]){ all = false; break; } if(all) done = true; }
      };
      const rec = (size, untried) => {
        while(untried.length){
          if(++n > LIMIT){ over = true; return; }
          const u = untried.pop(), ns = size + sz[u];
          if(ns > s) continue;
          let forced = 0;                                                 // other size-s groups next to u must come along
          for(const q of nbOf(u)) if(!inSet[q] && pin[q] === s) forced += sz[q];
          if(ns + forced > s) continue;
          inSet[u] = 1; setList.push(u);
          if(ns === s) leaf();
          else {
            const added = [];
            for(const q of nbOf(u)) if(!marked[q] && allows(q, s)){ marked[q] = 1; added.push(q); touched.push(q); }
            rec(ns, untried.concat(added));
            for(const q of added) marked[q] = 0;
          }
          inSet[u] = 0; setList.pop();
          if(over || done) return;
        }
      };
      const first = [];
      for(const q of nbOf(start)) if(!marked[q] && allows(q, s)){ marked[q] = 1; first.push(q); touched.push(q); }
      rec(smem.length, first);
      // results (only when the list of pieces is complete or the early stop says nothing more can be learnt)
      let fail = false;
      if(!over){
        if(valid === 0) fail = true;
        else {
          for(const q of touched){
            if(cntAdj[q] !== valid || seenAny[q]) continue;                // next to every piece and in none
            const d = dom.get(q);
            if(stampA[q] === -1) continue; stampA[q] = -1;                 // once
            if(domHas(d, s, s, true)){ domRemove(d, s, s, true); if(domEmpty(d, true)) fail = true; }
          }
          if(!done) for(const id of smem) for(const e of mpEdges.get(id)){
            if(e.state !== 0) continue;
            const q = rp[e.a === id ? e.b : e.a];
            if(q === start) continue;
            if(seenAny[q] && cntAll[q] === valid) out.push({ e, value: 'same', rule: 'mingle-area-place' });
            else if(!seenAny[q]) out.push({ e, value: 'wall', rule: 'mingle-area-place' });
          }
        }
      }
      for(const q of touched){ inSet[q] = 0; marked[q] = 0; cntAll[q] = 0; cntAdj[q] = 0; seenAny[q] = 0; stampA[q] = 0; }
      stampN = 0;
      if(fail){ why = 'mingle-area-place'; return null; }
    }
    return out;
  }
  // v52: mingle-area-connect (see patch_core52.py). Pins the cut tiles of the one big piece to its size; false = impossible
  function mingleConnect(dom){
    const T = activeIds.length;
    if(!mpEdges){ mpEdges = new Map(); for(const id of activeIds) mpEdges.set(id, []); for(const e of edges){ mpEdges.get(e.a).push(e); mpEdges.get(e.b).push(e); } }
    const big = new Set();
    for(const [rep, d] of dom){ const p = domCount(d, true); if(p.n === 1 && 2 * p.size > T) big.add(p.size); }
    for(const S of big){
      const allowed = new Uint8Array(N), term = new Uint8Array(N); let nTerm = 0, root = -1;
      for(const id of activeIds){
        const d = dom.get(find(id));
        if(!domHas(d, S, S, true)) continue;
        allowed[id] = 1;
        const p = domCount(d, true);
        if(p.n === 1 && p.size === S){ term[id] = 1; nTerm++; if(root < 0) root = id; }
      }
      if(nTerm < 2) continue;
      // Tarjan from a terminal; cnt[v] = terminals in v's dfs subtree; v cuts terminals apart when a child subtree with low >= tin[v] holds some
      // terminals and some lie outside it
      const tin = new Int32Array(N).fill(-1), low = new Int32Array(N), cnt = new Int32Array(N), cut = new Uint8Array(N);
      let timer = 0, reached = 0;
      const stack = [[root, null, 0]]; tin[root] = low[root] = timer++; cnt[root] = term[root];
      while(stack.length){
        const fr = stack[stack.length - 1], [u, pe] = fr, list = mpEdges.get(u);
        if(fr[2] < list.length){
          const e = list[fr[2]++];
          if(e === pe || e.state === 1) continue;
          const o = e.a === u ? e.b : e.a;
          if(!allowed[o]) continue;
          if(tin[o] < 0){ tin[o] = low[o] = timer++; cnt[o] = term[o]; stack.push([o, e, 0]); }
          else if(tin[o] < low[u]) low[u] = tin[o];
        } else {
          stack.pop();
          if(term[u]) reached++;
          if(stack.length){
            const p = stack[stack.length - 1][0];
            if(low[u] < low[p]) low[p] = low[u];
            if(low[u] >= tin[p] && cnt[u] > 0 && (nTerm - cnt[u] > 0) && !term[p]) cut[p] = 1;
            cnt[p] += cnt[u];
          }
        }
      }
      if(reached < nTerm){ why = 'mingle-area-connect'; return false; }
      for(const id of activeIds){
        if(!cut[id]) continue;
        const d = dom.get(find(id));
        for(const it of d.items){ if(d.rm && d.rm.has(it.k)) continue; if(it.size !== S) domRemove(d, it.k, it.size, true); }
        if(d.wlo <= d.whi){ if(S >= d.wlo && S <= d.whi && !(d.ex && d.ex.has(S))){ d.wlo = S; d.whi = S; } else { d.wlo = 1; d.whi = 0; } }
        if(domEmpty(d, true)){ why = 'mingle-area-connect'; return false; }
      }
    }
    return true;
  }
  // both modes; the first one that decides something returns (the caller runs propagation again)
  function mingleStep(need, capOf){
    for(const mode of mingleModes){
      const r = mingleRound(mode, need, capOf);
      if(r === null) return null;
      if(r.length > 0) return r;
    }
    return [];
  }

  // ============================================================================================================
  // v25: facts about MATCH (every piece has the SAME shape) and MISMATCH (every piece has a DIFFERENT shape)
  // Same contract as v23 / v24: everything here holds in EVERY valid tiling, so it can only decide edges, never lose a solution.
  // Match
  //   match-size     one common size s: it divides the tile count, fits the size limits / bank / area numbers / stamp / rose piece count
  //                  (no size left = impossible). While solving: s >= the biggest group, every region closed in by walls holds a multiple
  //                  of s tiles, and EVERY group's need / cap collapse into the range of s (so one size left = every piece has exactly it)
  //   match-fit      one shape must fit EVERY group of tiles that is already together: the shape list is the intersection of what each
  //                  group fits (a stamp pins the shape for all pieces). It is fed back into pieceInfo: two groups that no common shape can
  //                  hold are separated by a wall, a group no shape fits is impossible
  //   match-region   a region closed in by walls with exactly s tiles is one piece
  //   match-place    only one shape left: every group still needs a place for it (like a stamp for each group)
  // Mismatch
  //   mismatch-count  more pieces than different shapes (bank / free polyomino counts / Boxy rectangles) = impossible; sizes that appear in no
  //                   cover of the board by distinct shapes are removed
  //   mismatch-stamp  two stamps of the same shape can only be one piece (two pieces would share the shape)
  //   mismatch-link   two groups pinned to the same shape (e.g. both the one 1- or 2-tile shape) are one piece
  //   mismatch-clash  a group pinned to a shape takes it away from every group known to be a DIFFERENT piece (wall / forbidden pair);
  //                   no shape left = impossible
  //   mismatch-place  a group pinned to one shape must still have a place for it
  // Both: match-mismatch   at most one piece, so the whole board is one piece
  // ============================================================================================================
  const ruleMatch = !!ctx.matchRule, ruleMismatch = !!ctx.mismatchRule, bothRules = ruleMatch && ruleMismatch;
  const facts25 = (ruleMatch || ruleMismatch) ? gatherFacts(ctx, w, h) : null;
  let staticWhy = '';                                   // set when the grid alone already rules the puzzle out
  let mmQ = null;                                       // v62: Mismatch, at most mmQ[k] pieces of k tiles
  // v70: can some shape of n tiles cover every active tile (each tile in one of its placements)? The shapes tried are those of the
  // pieces that can hold the most constrained tile (fewest active neighbours, a dead end first), listed outward from it (user's idea).
  function matchCoverOk(n){
    const act = (x, y) => x >= 0 && y >= 0 && x < w && y < h && ctx.isActive(x, y);
    const fixedWall = new Set();
    for(const se of (specialEdges || [])){ const a2 = cid(se.c1, se.r1), b2 = cid(se.c2, se.r2); fixedWall.add(a2 * N + b2); fixedWall.add(b2 * N + a2); }
    for(const id of activeIds){ const x = id % w, y = (id - x) / w;                                     // v74: + plain drawn walls
      if(act(x + 1, y) && !ctx.edgeAllowed(x, y, x + 1, y)){ const o = cid(x + 1, y); fixedWall.add(id * N + o); fixedWall.add(o * N + id); }
      if(act(x, y + 1) && !ctx.edgeAllowed(x, y, x, y + 1)){ const o = cid(x, y + 1); fixedWall.add(id * N + o); fixedWall.add(o * N + id); } }
    const nbr = id => { const x = id % w, y = (id - x) / w, out = []; for(const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]){ const X = x + dx, Y = y + dy; if(act(X, Y)){ const o = cid(X, Y); if(!fixedWall.has(id * N + o)) out.push(o); } } return out; };
    const deg = id => nbr(id).length;
    const order = activeIds.slice().sort((p, q) => deg(p) - deg(q));
    const codeBuf = new Int32Array(n);
    const keyOf = ids => {                                                         // the free shape: smallest sorted code array over 8 turns
      let best = null;
      for(let t = 0; t < 8; t++){
        let mx = Infinity, my = Infinity;
        for(const id of ids){ const x0 = id % w, y0 = (id - x0) / w; let a = t & 1 ? -x0 : x0, b = y0; if(t & 2) b = -b; if(t & 4){ const s2 = a; a = b; b = s2; } if(a < mx) mx = a; if(b < my) my = b; }
        for(let i = 0; i < n; i++){ const x0 = ids[i] % w, y0 = (ids[i] - x0) / w; let a = t & 1 ? -x0 : x0, b = y0; if(t & 2) b = -b; if(t & 4){ const s2 = a; a = b; b = s2; } codeBuf[i] = (b - my) * 64 + (a - mx); }
        const arr = codeBuf.slice(0, n).sort((p, q) => p - q);
        if(best === null) best = arr; else for(let i = 0; i < n; i++){ if(arr[i] !== best[i]){ if(arr[i] < best[i]) best = arr; break; } }
      }
      return best.join(',');
    };
    // every connected set of n tiles holding `anchor` (Redelmeier over tiles); null = over budget
    const piecesAt = (anchor, budget) => {
      const shapes = new Map(), cur = [anchor], seen = new Set([anchor]); let nodes = 0, over = false;
      const rec = untried => {
        if(over) return; if(++nodes > budget){ over = true; return; }
        if(cur.length === n){ const k = keyOf(cur); if(!shapes.has(k)) shapes.set(k, cur.map(id => [id % w, (id - id % w) / w])); return; }
        for(let i = 0; i < untried.length; i++){
          const u = untried[i], nu = untried.slice(i + 1), added = [];
          for(const o of nbr(u)) if(!seen.has(o)){ seen.add(o); added.push(o); nu.push(o); }
          cur.push(u); rec(nu); cur.pop();
          for(const o of added) seen.delete(o);
          if(over) return;
        }
      };
      const n0 = nbr(anchor); for(const o of n0) seen.add(o);
      rec(n0);
      return over ? null : shapes;
    };
    let shapes = null;
    for(const t of order.slice(0, 6)){ shapes = piecesAt(t, opts.matchCoverNodes || 200000); if(shapes) break; }
    if(!shapes) return true;                                                       // could not list: keep the size
    const orients = cs => { const out = [], ks = new Set(); for(let t = 0; t < 8; t++){ const m = cs.map(([x, y]) => { let a = t & 1 ? -x : x, b = y; if(t & 2) b = -b; if(t & 4){ const s2 = a; a = b; b = s2; } return [a, b]; });
      const mx = Math.min(...m.map(q => q[0])), my = Math.min(...m.map(q => q[1])); const nm = m.map(([x, y]) => [x - mx, y - my]); const k = nm.map(q => q[0] + ',' + q[1]).sort().join('|'); if(!ks.has(k)){ ks.add(k); out.push(nm); } } return out; };
    const placeOk = (o, ox, oy) => {
      for(const [x, y] of o) if(!act(x + ox, y + oy)) return false;
      if(fixedWall.size){ const ids = o.map(([x, y]) => cid(x + ox, y + oy)); for(let i = 0; i < ids.length; i++) for(let j = i + 1; j < ids.length; j++) if(fixedWall.has(ids[i] * N + ids[j])) return false; }
      return true;
    };
    for(const cs of shapes.values()){
      const ors = orients(cs); let ok = true;
      for(const t of order){
        const tx = t % w, ty = (t - tx) / w; let hit = false;
        for(const o of ors){ for(const [ax, ay] of o){ if(placeOk(o, tx - ax, ty - ay)){ hit = true; break; } } if(hit) break; }
        if(!hit){ ok = false; break; }
      }
      if(ok) return true;
    }
    return false;
  }
  // v82: match-compass (see patch_core82.py); v83: match-anchor, palisades and area numbers too (see patch_core83.py).
  // Returns Map(size -> Map(canonical key -> cells) | null = no information), or null.
  function matchCompassShapes(sizes){
    const act = (x, y) => x >= 0 && y >= 0 && x < w && y < h && ctx.isActive(x, y);
    const fixedWall = new Set();
    for(const se of (specialEdges || [])){ const a2 = cid(se.c1, se.r1), b2 = cid(se.c2, se.r2); fixedWall.add(a2 * N + b2); fixedWall.add(b2 * N + a2); }
    for(const id of activeIds){ const x = id % w, y = (id - x) / w;
      if(act(x + 1, y) && !ctx.edgeAllowed(x, y, x + 1, y)){ const o = cid(x + 1, y); fixedWall.add(id * N + o); fixedWall.add(o * N + id); }
      if(act(x, y + 1) && !ctx.edgeAllowed(x, y, x, y + 1)){ const o = cid(x, y + 1); fixedWall.add(id * N + o); fixedWall.add(o * N + id); } }
    const nbrs = [];
    for(let id = 0; id < N; id++){ const x = id % w, y = (id - x) / w, out = [];
      if(act(x, y)) for(const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]){ const X = x + dx, Y = y + dy; if(act(X, Y)){ const o = cid(X, Y); if(!fixedWall.has(id * N + o)) out.push(o); } }
      nbrs.push(out); }
    // clue tiles: kind 0 compass { cp }, 1 palisade { pt }, 2 area number { a }
    const clueAt = new Array(N).fill(null), anchors = [];
    if(ctx.compasses) for(const [key, cp] of ctx.compasses){ const [x, y] = key.split(',').map(Number); if(!act(x, y)) continue;
      const c = { kind: 0, x, y, id: cid(x, y), cp, rank: 0 }; clueAt[c.id] = [c]; anchors.push(c); }
    const useMore = opts.matchAnchors !== false;
    if(useMore && ctx.palisades) for(const [key, pt] of ctx.palisades){ const [x, y] = key.split(',').map(Number); if(!act(x, y)) continue;
      const c = { kind: 1, x, y, id: cid(x, y), pt, rank: (pt === '0' || pt === '4') ? 1 : pt === '3' ? 2 : pt === '1' ? 3 : 4 };
      (clueAt[c.id] || (clueAt[c.id] = [])).push(c); anchors.push(c); }
    if(useMore) for(const id of activeIds){ const x = id % w, y = (id - x) / w, a = ctx.requiredAreaAt(x, y); if(a == null) continue;
      const c = { kind: 2, x, y, id, a, rank: 5 }; (clueAt[id] || (clueAt[id] = [])).push(c); anchors.push(c); }
    if(!anchors.length) return null;
    anchors.sort((p, q) => p.rank - q.rank);
    const budget = opts.matchCompNodes != null ? +opts.matchCompNodes : 300000;
    const deadline = nowMs() + (opts.matchCompMs != null ? +opts.matchCompMs : 3000);
    const maxS = opts.matchCompMax != null ? +opts.matchCompMax : 16;
    const codeKey = cur => {                                                    // the free shape of a tile set: smallest code list over 8 turns
      let best = null; const n = cur.length, buf = new Array(n);
      for(let t = 0; t < 8; t++){
        let mx = Infinity, my = Infinity;
        for(let i = 0; i < n; i++){ const x0 = cur[i] % w, y0 = (cur[i] - x0) / w; let a = t & 1 ? -x0 : x0, b = y0; if(t & 2) b = -b; if(t & 4){ const s2 = a; a = b; b = s2; } if(a < mx) mx = a; if(b < my) my = b; }
        for(let i = 0; i < n; i++){ const x0 = cur[i] % w, y0 = (cur[i] - x0) / w; let a = t & 1 ? -x0 : x0, b = y0; if(t & 2) b = -b; if(t & 4){ const s2 = a; a = b; b = s2; } buf[i] = (b - my) * 64 + (a - mx); }
        const arr = buf.slice().sort((p, q) => p - q);
        if(best === null) best = arr; else for(let i = 0; i < n; i++){ if(arr[i] !== best[i]){ if(arr[i] < best[i]) best = arr; break; } }
      }
      return best.join(',');
    };
    const inSet = new Uint8Array(N);
    // is the tile set `cur` (marked in inSet) still a possible piece of s tiles? full: every count exact / every palisade checked
    const clueOk = (cur, s, full) => {
      const rem = s - cur.length;
      for(const id of cur){ const cl = clueAt[id]; if(!cl) continue;
        for(const K of cl){
          if(K.kind === 2){ if(K.a !== s) return false; continue; }
          if(K.kind === 1){ if(!full) continue;
            const x = K.x, y = K.y, sd = [[0, -1], [1, 0], [0, 1], [-1, 0]].map(([dx, dy]) => (act(x + dx, y + dy) && inSet[cid(x + dx, y + dy)]) ? 0 : 1);
            const n = sd[0] + sd[1] + sd[2] + sd[3], pt = K.pt;
            const ok = pt === '0' ? n === 0 : pt === '1' ? n === 1 : pt === '3' ? n === 3 : pt === '4' ? n === 4
                     : pt === '2c' ? (n === 2 && sd[0] + sd[2] === 1) : (n === 2 && (sd[0] + sd[2] === 2 || sd[1] + sd[3] === 2));
            if(!ok) return false; continue; }
          let n = 0, so = 0, e = 0, ww = 0;
          for(const t of cur){ const tx = t % w, ty = (t - tx) / w; if(ty < K.y) n++; else if(ty > K.y) so++; if(tx < K.x) ww++; else if(tx > K.x) e++; }
          const cp = K.cp;
          if(cp.n != null && (n > cp.n || n + rem < cp.n)) return false;
          if(cp.s != null && (so > cp.s || so + rem < cp.s)) return false;
          if(cp.e != null && (e > cp.e || e + rem < cp.e)) return false;
          if(cp.w != null && (ww > cp.w || ww + rem < cp.w)) return false;
        } }
      if(full && fixedWall.size) for(const id of cur){ const x = id % w, y = (id - x) / w;
        if(x + 1 < w && inSet[id + 1] && fixedWall.has(id * N + id + 1)) return false;
        if(y + 1 < h && inSet[id + w] && fixedWall.has(id * N + id + w)) return false; }
      return true;
    };
    const orientsOf = cells => { const out = [], ks = new Set();
      for(let t = 0; t < 8; t++){ const m = cells.map(([x, y]) => { let a = t & 1 ? -x : x, b = y; if(t & 2) b = -b; if(t & 4){ const s2 = a; a = b; b = s2; } return [a, b]; });
        const mx = Math.min(...m.map(q => q[0])), my = Math.min(...m.map(q => q[1])); const nm = m.map(([x, y]) => [x - mx, y - my]);
        const k = nm.map(q => q[0] * 64 + q[1]).sort((p, q) => p - q).join(','); if(!ks.has(k)){ ks.add(k); out.push(nm); } }
      return out; };
    const placeable = (cells, A, s) => {                                         // can this shape be a valid piece holding anchor A?
      for(const o of orientsOf(cells)) for(const [ax, ay] of o){
        const dx = A.x - ax, dy = A.y - ay, cur = []; let ok = true;
        for(const [x, y] of o){ const X = x + dx, Y = y + dy; if(!act(X, Y)){ ok = false; break; } cur.push(cid(X, Y)); }
        if(!ok) continue;
        for(const id of cur) inSet[id] = 1;
        ok = clueOk(cur, s, true);
        for(const id of cur) inSet[id] = 0;
        if(ok) return true;
      }
      return false;
    };
    const out = new Map();
    for(const s of sizes){
      if(s > maxS || nowMs() > deadline){ out.set(s, null); continue; }
      let common = null;                                                        // code key -> cells
      for(const A of anchors){
        if(common !== null){                                                    // later anchors: place the shapes left
          for(const [k, cells] of [...common]) if(!placeable(cells, A, s)) common.delete(k);
          if(common.size === 0) break;
          continue;
        }
        const shapes = new Map(), cur = [A.id], seen = new Uint8Array(N);
        let nodes = 0, over = false;
        const rec = untried => {
          if(over) return;
          if(++nodes > budget || ((nodes & 1023) === 0 && nowMs() > deadline)){ over = true; return; }
          if(cur.length === s){ if(clueOk(cur, s, true)){ const k = codeKey(cur); if(!shapes.has(k)) shapes.set(k, cur.map(id => [id % w, (id - id % w) / w])); } return; }
          for(let i = 0; i < untried.length; i++){
            const u = untried[i], nu = untried.slice(i + 1), added = [];
            for(const o of nbrs[u]) if(!seen[o]){ seen[o] = 1; added.push(o); nu.push(o); }
            cur.push(u); inSet[u] = 1;
            if(clueOk(cur, s, false)) rec(nu);
            cur.pop(); inSet[u] = 0;
            for(const o of added) seen[o] = 0;
            if(over) return;
          }
        };
        seen[A.id] = 1; inSet[A.id] = 1;
        const n0 = nbrs[A.id].slice(); for(const o of n0) seen[o] = 1;
        if(clueOk(cur, s, false)) rec(n0);
        inSet[A.id] = 0;
        if(over) continue;                                                      // no information from this anchor: list the next one
        common = shapes;
        if(common.size === 0) break;
      }
      if(common === null){ out.set(s, null); continue; }
      const m = new Map();
      for(const cells of common.values()){ const nc = normalizeCells(cells); m.set(canonicalShapeKey(nc), nc); }
      out.set(s, m);
    }
    return out;
  }
  let matchS0 = null;                                   // the sizes Match leaves
  let matchRestrict = null;                             // v43: inside a Match size case, [d]
  let matchCompShapes = null;                           // v82: size -> allowed shapes (Map key -> cells) | null
  if(ruleMatch){
    sizeWhy = 'match-size';
    matchS0 = matchSizeCandidates(ctx, facts25);
    if(opts.matchCompass !== false && ctx.compasses && ctx.compasses.size && ctx.activeRows){                     // v69b
      let lo = 1, hi = Infinity; const R = ctx.activeRows, C = ctx.activeCols;
      for(const [key, cp] of ctx.compasses){
        const [x, y] = key.split(',').map(Number); if(!ctx.isActive(x, y)) continue;
        lo = Math.max(lo, compassMinSize(cp));
        let t;
        if(cp.n != null && cp.s != null && cp.e != null && cp.w != null) hi = Math.min(hi, 1 + cp.n + cp.s + cp.e + cp.w);
        if(cp.s != null){ t = cp.s; for(let r = 0; r <= y; r++) t += R[r]; hi = Math.min(hi, t); }
        if(cp.n != null){ t = cp.n; for(let r = y; r < R.length; r++) t += R[r]; hi = Math.min(hi, t); }
        if(cp.e != null){ t = cp.e; for(let c = 0; c <= x; c++) t += C[c]; hi = Math.min(hi, t); }
        if(cp.w != null){ t = cp.w; for(let c = x; c < C.length; c++) t += C[c]; hi = Math.min(hi, t); }
        if(opts.matchCompCap !== false){                                          // v82b: two or more known sides at once
          const known = ['n', 's', 'e', 'w'].filter(d => cp[d] != null);
          for(let m = 3; m < (1 << known.length); m++){
            if(!(m & (m - 1))) continue;
            const ds = known.filter((d, i) => (m >> i) & 1); let t2 = 0;
            for(const d of ds) t2 += cp[d];
            for(const id of activeIds){ const X = id % w, Y = (id - X) / w;
              if(!ds.some(d => d === 'n' ? Y < y : d === 's' ? Y > y : d === 'w' ? X < x : X > x)) t2++; }
            hi = Math.min(hi, t2);
          }
        }
      }
      matchS0 = matchS0.filter(z => z >= lo && z <= hi);
    }
    if(opts.matchCover !== false && matchS0.length > 1) matchS0 = matchS0.filter(z => z > (opts.matchCoverMax || 10) || matchCoverOk(z));   // v70
    let compCut = false;
    if(opts.matchCompShapes !== false && matchS0.length && ((ctx.compasses && ctx.compasses.size) || (opts.matchAnchors !== false && ((ctx.palisades && ctx.palisades.size) || activeIds.some(id => ctx.requiredAreaAt(id % w, (id - id % w) / w) != null))))){                          // v82
      matchCompShapes = matchCompassShapes(matchS0);
      if(matchCompShapes){ const n0 = matchS0.length; matchS0 = matchS0.filter(z => { const m = matchCompShapes.get(z); return !m || m.size > 0; }); compCut = matchS0.length < n0; }
    }
    if(matchS0.length === 0) staticWhy = compCut ? 'match-compass' : (facts25.stampKeys.size > 1) ? 'match-fit' : 'match-size';
  } else if(ruleMismatch){
    sizeWhy = 'mismatch-count';
    const mi = mismatchSizeInfo(ctx, w, h, facts25);
    if(!mi.ok) staticWhy = 'mismatch-count'; else if(mi.sizes) sizeSet = mi.sizes;
    if(mi.ok && mi.q) mmQ = mi.q;                                                  // v62
  }
  // v73a: Boxy + Mismatch: only the rectangles that can be placed somewhere count; all of them together = the board -> each is used once
  let boxAll = null;
  if(ruleMismatch && !ruleMatch && ctx.boxyRule && !ctx.useBank && !staticWhy && opts.boxShapes !== false){
    const T = activeIds.length, lo = Math.max(ctx.sizeLo, 1), hi = Math.min(ctx.sizeHi, T), rects = [];
    const fits = (W, H) => {
      for(let y0 = 0; y0 + H <= h; y0++) for(let x0 = 0; x0 + W <= w; x0++){
        let ok = true;
        for(let y = y0; y < y0 + H && ok; y++) for(let x = x0; x < x0 + W; x++){
          if(!ctx.isActive(x, y) || (x + 1 < x0 + W && !ctx.edgeAllowed(x, y, x + 1, y)) || (y + 1 < y0 + H && !ctx.edgeAllowed(x, y, x, y + 1))){ ok = false; break; }
        }
        if(ok) return true;
      }
      return false;
    };
    for(let a = 1; a <= Math.max(w, h); a++) for(let b = a; a * b <= hi; b++){
      if(a * b < lo || (sizeSet && !sizeSet.includes(a * b))) continue;
      if(fits(a, b) || (a !== b && fits(b, a))) rects.push({ a, b, area: a * b, key: a + 'x' + b });
    }
    const qf = new Map(); let sum = 0;
    for(const R of rects){ qf.set(R.area, (qf.get(R.area) || 0) + 1); sum += R.area; }
    if(sum < T) staticWhy = 'mismatch-count';
    else {
      const sz = [...qf.keys()].sort((p, q) => p - q);
      sizeSet = sizeSet ? sizeSet.filter(s => qf.has(s)) : sz;
      if(mmQ) for(let k = 0; k < mmQ.length; k++) if(mmQ[k]) mmQ[k] = Math.min(mmQ[k], qf.get(k) || 0);
      if(sum === T && opts.boxAll !== false) boxAll = rects;
    }
  }
  if(bothRules && !staticWhy){ const T1 = facts25.T; if(T1 < ctx.sizeLo || T1 > ctx.sizeHi) staticWhy = 'match-mismatch'; }

  // open tiles grouped by the walls decided so far: [[ids]]
  function openRegions(){
    const comp = new Int32Array(N).fill(-1), out = [];
    for(const start of activeIds){
      if(comp[start] >= 0) continue;
      const tiles = [start]; comp[start] = start;
      for(let qi = 0; qi < tiles.length; qi++) for(const { e, o } of adjE[tiles[qi]]){ if(e.state === 1 || comp[o] >= 0) continue; comp[o] = start; tiles.push(o); }
      out.push(tiles);
    }
    return out;
  }
  // the group has no open edge to another group left
  // v52: gd-complete (see patch_core52.py)
  const gdAll = [];
  for(const se of (specialEdges || [])){
    if((se.kind !== 'gemini' && se.kind !== 'delta') || !ctx.isActive(se.c1, se.r1) || !ctx.isActive(se.c2, se.r2)) continue;
    gdAll.push({ a: cid(se.c1, se.r1), b: cid(se.c2, se.r2), gem: se.kind === 'gemini' });
  }
  // v53d: gd-clash. Gemini wall a|b and delta wall c|d: if a side of one is in the piece of a side of the other, the two remaining sides are
  // different pieces (else the same two pieces would need the same shape and another shape). Both pairs already together = impossible.
  // Example 0850: (0,3)|(1,3) delta above (0,4)|(1,4) gemini: (0,3) and (0,4) in one piece => (1,3) and (1,4) are not.
  const gdPairs = [];
  if(opts.gdClash !== false) for(const g of gdAll) if(g.gem) for(const d of gdAll) if(!d.gem) gdPairs.push([g, d]);
  function gdClashStep(dmap){
    let added = false;
    for(const [g, d] of gdPairs){
      for(const [x, y, u, v] of [[g.a, d.a, g.b, d.b], [g.a, d.b, g.b, d.a], [g.b, d.a, g.a, d.b], [g.b, d.b, g.a, d.a]]){
        if(find(x) !== find(y)) continue;
        const ru = find(u), rv = find(v);
        if(ru === rv){ why = 'gd-clash'; return null; }
        const dm = dmap.get(ru);
        if(dm && dm.has(rv)) continue;
        forbidden.push([u, v, 'gd-clash']); added = true;
      }
    }
    const out = []; if(added) out.again = true;
    return out;
  }
  // v55: diff-clash (see build/patch_core55.py). Exact size differences: diff N walls, and gemini walls as 0.
  const dcAll = [];
  for(const se of (specialEdges || [])){
    if(!ctx.isActive(se.c1, se.r1) || !ctx.isActive(se.c2, se.r2)) continue;
    const v = se.kind === 'gemini' ? 0 : se.kind === 'diff' ? se.value : null;
    if(v == null) continue;
    dcAll.push({ a: cid(se.c1, se.r1), b: cid(se.c2, se.r2), v });
  }
  const dcPairs = [];
  if(opts.diffClash !== false) for(let i = 0; i < dcAll.length; i++) for(let j = i + 1; j < dcAll.length; j++) if(dcAll[i].v !== dcAll[j].v) dcPairs.push([dcAll[i], dcAll[j]]);
  function diffClashStep(dmap){
    let added = false;
    for(const [g, d] of dcPairs){
      for(const [x, y, u, v] of [[g.a, d.a, g.b, d.b], [g.a, d.b, g.b, d.a], [g.b, d.a, g.a, d.b], [g.b, d.b, g.a, d.a]]){
        if(x !== y && find(x) !== find(y)) continue;
        const ru = find(u), rv = find(v);
        if(ru === rv){ why = 'diff-clash'; return null; }
        const dm = dmap.get(ru);
        if(dm && dm.has(rv)) continue;
        forbidden.push([u, v, 'diff-clash']); added = true;
      }
    }
    const out = []; if(added) out.again = true;
    return out;
  }
  // ---- v56: diff-small (see build/patch_core56.py) ----
  const dsOn = opts.diffSmall !== false && !!ctx.mismatchRule && dcAll.some(d => d.v > 0);
  let dsPlans = null;                                    // per N: { walls: [{a,b}], shapes: [{size, pl: [[ids]], byTile: Map id -> [placement index]}] }
  function dsPrepare(){
    dsPlans = [];
    const edgeOf = new Map(); for(const e of edges) edgeOf.set(e.a < e.b ? e.a * N + e.b : e.b * N + e.a, e);
    dsEdgeOf = edgeOf;
    const Ns = [...new Set(dcAll.filter(d => d.v > 0).map(d => d.v))];
    for(const n of Ns){
      const lo = Math.max(1, ctx.sizeLo), smallMax = ctx.sizeHi - n;
      if(smallMax < lo) continue;
      { let cnt = 0; for(let k = lo; k <= smallMax; k++) cnt += k < FREE_POLY_COUNT.length ? FREE_POLY_COUNT[k] : Infinity;      // too many small shapes: skip BEFORE listing them
        if(cnt > (opts.diffSmallShapes || 8)) continue; }
      // free shapes of sizes lo..smallMax, all orientations
      const byKey = new Map();
      const grow = cells => {
        if(cells.length >= lo){
          const k = canonicalShapeKey(cells);
          const mx = Math.min(...cells.map(q => q[0])), my = Math.min(...cells.map(q => q[1]));
          const norm = cells.map(([x, y]) => [x - mx, y - my]).sort((p, q) => p[1] - q[1] || p[0] - q[0]);
          if(!byKey.has(k)) byKey.set(k, new Map());
          byKey.get(k).set(JSON.stringify(norm), norm);
        }
        if(cells.length === smallMax) return;
        for(const [x, y] of cells) for(const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]){
          const q = [x + dx, y + dy]; if(cells.some(c => c[0] === q[0] && c[1] === q[1])) continue; grow(cells.concat([q]));
        }
      };
      grow([[0, 0]]);
      if(byKey.size > (opts.diffSmallShapes || 8)) continue;
      const shapes = [];
      for(const ors of byKey.values()){
        const pl = [], byTile = new Map();
        for(const o of ors.values()) for(let r = 0; r < h; r++) for(let c = 0; c < w; c++){
          const ids = []; let ok = true;
          for(const [x, y] of o){ const X = x + c, Y = y + r; if(X >= w || Y >= h || !ctx.isActive(X, Y)){ ok = false; break; } ids.push(cid(X, Y)); }
          if(!ok) continue;
          for(let i = 0; i < ids.length && ok; i++) for(let j = i + 1; j < ids.length; j++){
            const a = ids[i], b = ids[j], ax = a % w, bx = b % w;
            if(Math.abs(ax - bx) + Math.abs((a - ax) / w - (b - bx) / w) !== 1) continue;
            if(!edgeOf.has(a < b ? a * N + b : b * N + a)){ ok = false; break; }      // a fixed wall inside
          }
          if(!ok) continue;
          const k = pl.length; pl.push(ids);
          for(const id of ids){ if(!byTile.has(id)) byTile.set(id, []); byTile.get(id).push(k); }
        }
        shapes.push({ size: ors.values().next().value.length, pl, byTile });
      }
      dsPlans.push({ n, walls: dcAll.filter(d => d.v === n), shapes });
    }
  }
  let dsEdgeOf = null;
  function diffSmallStep(dmap){
    if(dsPlans === null) dsPrepare();
    const out = [];
    for(const P of dsPlans){
      const S = P.shapes, inP = new Int32Array(N).fill(-1);          // tile -> index of the placed piece holding it
      const placed = [];                                             // [{ ids, size }]
      const okCache = S.map(s => new Int8Array(s.pl.length));       // 0 unknown, 1 ok, 2 bad
      const valid = (si, k) => {
        const c = okCache[si][k]; if(c) return c === 1;
        const ids = S[si].pl[k], mine = new Set(ids); let ok = true;
        for(const id of ids){                                        // whole groups, no wall inside, no link out
          const rep = find(id);
          for(const t of members.get(rep)) if(!mine.has(t)){ ok = false; break; }
          if(!ok) break;
          for(const { e, o } of adjE[id]){ if(mine.has(o)){ if(e.state === 1){ ok = false; break; } } else if(e.state === 2){ ok = false; break; } }
          if(!ok) break;
        }
        if(ok){ const reps = [...new Set(ids.map(find))]; for(let i = 0; i < reps.length && ok; i++){ const dm = dmap.get(reps[i]); if(dm) for(let j = 0; j < reps.length; j++) if(j !== i && dm.has(reps[j])){ ok = false; break; } } }
        if(ok && pieceInfo(ids) === null) ok = false;
        okCache[si][k] = ok ? 1 : 2; return ok;
      };
      const interior = new Map(), border = new Map(); let ways = 0, nodes = 0, over = false;
      const budget = opts.diffSmallNodes || 200000;
      const record = () => {
        ways++;
        const seenI = new Set(), seenB = new Set();
        for(const p of placed) for(const id of p.ids) for(const { e, o } of adjE[id]){
          if(e.state !== 0) continue;
          if(inP[o] === inP[id]) seenI.add(e); else seenB.add(e);
        }
        for(const e of seenI) interior.set(e, (interior.get(e) || 0) + 1);
        for(const e of seenB) border.set(e, (border.get(e) || 0) + 1);
      };
      const rec = usedMask => {
        if(over) return;
        if(++nodes > budget){ over = true; return; }
        let wall = null;
        for(const d of P.walls) if(inP[d.a] < 0 && inP[d.b] < 0){ wall = d; break; }
        if(!wall){ record(); return; }
        for(let si = 0; si < S.length; si++){
          if(usedMask & (1 << si)) continue;
          const cand = new Set([...(S[si].byTile.get(wall.a) || []), ...(S[si].byTile.get(wall.b) || [])]);
          for(const k of cand){
            const ids = S[si].pl[k];
            if(ids.some(id => inP[id] >= 0) || !valid(si, k)) continue;
            const idx = placed.length;
            // two placed pieces across a difference / gemini wall must differ by its number
            let ok = true;
            for(const d of dcAll){
              const ia = ids.includes(d.a), ib = ids.includes(d.b);
              if(ia && ib){ ok = false; break; }
              const other = ia ? inP[d.b] : ib ? inP[d.a] : -1;
              if(other >= 0 && Math.abs(placed[other].size - ids.length) !== d.v){ ok = false; break; }
            }
            if(!ok) continue;
            for(const id of ids) inP[id] = idx;
            placed.push({ ids, size: ids.length });
            rec(usedMask | (1 << si));
            placed.pop(); for(const id of ids) inP[id] = -1;
            if(over) return;
          }
        }
      };
      rec(0);
      if(over) continue;
      if(ways === 0){ why = 'diff-small'; return null; }
      for(const [e, c] of interior) if(c === ways && e.state === 0){ e.state = 2; union(e.a, e.b); out.push({ e, value: 'same', rule: 'diff-small' }); }
      for(const [e, c] of border) if(c === ways && e.state === 0){ e.state = 1; out.push({ e, value: 'wall', rule: 'diff-small' }); }
      if(out.length) return out;
    }
    return out;
  }
  function gdCompleteStep(need, capOf){
    const keyOf = new Map(), doneOf = new Map();
    const key = rep => { let k = keyOf.get(rep); if(k === undefined){ k = canonicalShapeKey(members.get(rep).map(id => [id % w, (id - id % w) / w])); keyOf.set(rep, k); } return k; };
    const done = rep => { let d = doneOf.get(rep); if(d === undefined){ d = groupComplete(rep, members.get(rep)); doneOf.set(rep, d); } return d; };
    for(const ge of gdAll){
      const ra = find(ge.a), rb = find(ge.b);
      if(ra === rb) continue;
      for(const [x, y] of [[ra, rb], [rb, ra]]){
        if(!done(x)) continue;
        const nx = members.get(x).length, ny = members.get(y).length;
        if(ge.gem){
          if(ny > nx || (done(y) && (ny !== nx || key(y) !== key(x))) || (ny === nx && key(y) !== key(x))){ why = 'gemini-shape'; return false; }
          if(need.get(y) < nx) need.set(y, nx);
          if(capOf.get(y) > nx) capOf.set(y, nx);
          if(need.get(y) > capOf.get(y)){ why = 'gemini-shape'; return false; }
        } else if(ny === nx && key(y) === key(x)){
          if(done(y)){ why = 'delta-shape'; return false; }
          if(need.get(y) < nx + 1) need.set(y, nx + 1);
          if(need.get(y) > capOf.get(y)){ why = 'delta-shape'; return false; }
        }
      }
    }
    return true;
  }
  function groupComplete(rep, mem){
    for(const id of mem) for(const { e, o } of adjE[id]) if(e.state === 0 && find(o) !== rep) return false;
    return true;
  }

  // ---- Match + Mismatch: one piece only ----
  function bothStep(){
    const regs = openRegions();
    if(regs.length > 1){ why = 'match-mismatch'; return null; }         // walls (or a split board) already make two pieces
    const out = [];
    for(const e of spots) if(e.state === 0){ e.state = 2; union(e.a, e.b); out.push({ e, value: 'same', rule: 'match-mismatch' }); }
    return out;
  }

  // ---- Match: the common size and the common shape ----
  // the shape list to start from (static): a stamp pins it, else the bank, else every free shape if all possible sizes are small
  let matchBase = null;
  if(ruleMatch && !staticWhy){
    if(stampList.length > 0){
      const sp = stampList[0];
      matchBase = [{ key: sp.key, size: sp.size, orients: sp.shape.orients, rect: isRectangular(sp.shape.orients[0].cells) }]; matchBase.id = 'MS';
    } else if(mBank) matchBase = mBank;
    else if(matchS0[matchS0.length - 1] <= MINGLE_ENUM_MAX && !opts.noMatchEnum){
      matchBase = []; for(const n of matchS0) for(const s of mFreeList(n)) matchBase.push(s); matchBase.id = 'MF' + matchS0.join('_');
    }
    if(matchCompShapes){                                                         // v82: only the shapes every compass allows
      if(matchBase){
        const f = matchBase.filter(sh => { const m = matchCompShapes.get(sh.size); return !m || m.has(sh.key); });
        if(f.length !== matchBase.length){ f.id = matchBase.id + 'C'; matchBase = f; }
      } else if(matchS0.every(z => matchCompShapes.get(z)) && !opts.noMatchEnum){
        const f = [];
        for(const z of matchS0) for(const [key, nc] of matchCompShapes.get(z)){
          const rect = isRectangular(nc);
          if(mingleRectOk(rect) && !(banInfo && banInfo.keyBanned(key))) f.push({ key, size: z, orients: shapeOrientations(nc).map(orientEntry), rect });
        }
        f.id = 'MC' + matchS0.join('_'); matchBase = f;
      }
      if(matchBase && matchBase.length === 0) staticWhy = 'match-compass';
    }
  }
  const matchBase0 = matchBase;                         // v48: the static list (the shape split swaps `matchBase` for a while)
  const gidMap = new Map();
  const listId = list => { const k = list.map(s => s.key).join('#'); let g = gidMap.get(k); if(g === undefined){ g = gidMap.size; gidMap.set(k, g); } return 'G' + g; };
  // v48 match-pin: a group with exactly s tiles (s = the one size left) is a whole piece: its shape is every piece's shape
  const pinCache = new Map();
  function matchPinned(S){
    if(opts.matchPin === false || S.length !== 1 || S[0] < 2) return null;
    const s = S[0];
    for(const mem of members.values()){
      if(mem.length !== s) continue;
      const nc = normalizeCells(mem.map(id => { const x = id % w; return [x, (id - x) / w]; })), key = canonicalShapeKey(nc);
      let ent = pinCache.get(key);
      if(!ent){ ent = [{ key, size: s, orients: shapeOrientations(nc).map(orientEntry), rect: isRectangular(nc) }]; ent.id = 'P' + key; if(pinCache.size > 5000) pinCache.clear(); pinCache.set(key, ent); }
      return ent;
    }
    return null;
  }
  // called at the start of every propagation pass: sets sizeSet (sizes the common piece can still have) and matchList (shapes that fit every group)
  function matchPrepare(){
    let big = 0;
    for(const mem of members.values()) if(mem.length > big) big = mem.length;
    const regs = openRegions();
    let S = (matchRestrict || matchS0).filter(s => s >= big && regs.every(r => r.length % s === 0));
    if(S.length === 0){ why = 'match-size'; return false; }
    let list = null;
    const mBase = matchBase || matchPinned(S);
    if(mBase){
      let keys = null;                                  // shapes (by key) that fit every group with 2 or more tiles
      for(const mem of members.values()){
        if(mem.length < 2) continue;
        const fit = mFit(mem, mBase);
        if(keys === null) keys = new Set(fit.map(s => s.key));
        else { const ks = new Set(fit.map(s => s.key)); for(const k of keys) if(!ks.has(k)) keys.delete(k); }
        if(keys.size === 0) break;
      }
      list = mBase.filter(s => (keys === null || keys.has(s.key)) && S.includes(s.size));
      if(list.length === 0){ why = 'match-fit'; return false; }
      const sizes = new Set(list.map(s => s.size));
      S = S.filter(s => sizes.has(s));
      list.id = listId(list);
    }
    sizeSet = S; matchList = list;
    return true;
  }
  // after every group's need / cap are known: the common size lies between the biggest need and the smallest cap, and then
  // EVERY group has exactly that range
  function matchRefine(need, capOf){
    let smin = 0, smax = Infinity;
    for(const rep of members.keys()){ if(need.get(rep) > smin) smin = need.get(rep); if(capOf.get(rep) < smax) smax = capOf.get(rep); }
    const S2 = sizeSet.filter(s => s >= smin && s <= smax);
    if(S2.length === 0){ why = 'match-size'; return false; }
    if(S2.length !== sizeSet.length){
      sizeSet = S2;
      if(matchList){
        const l2 = matchList.filter(s => S2.includes(s.size));
        if(l2.length === 0){ why = 'match-fit'; return false; }
        if(l2.length !== matchList.length){ l2.id = listId(l2); matchList = l2; }
      }
    }
    for(const rep of members.keys()){ need.set(rep, S2[0]); capOf.set(rep, S2[S2.length - 1]); }
    return true;
  }
  // a region closed in by walls that holds exactly one piece's worth of tiles is one piece
  function matchRegionStep(){
    if(!sizeSet || sizeSet.length !== 1) return [];
    const s = sizeSet[0], out = [];
    let merged = false;
    if(s < 2) return [];
    for(const tiles of openRegions()){
      if(tiles.length !== s) continue;
      for(const id of tiles) if(find(id) !== find(tiles[0])){ union(tiles[0], id); merged = true; }
      for(const id of tiles) for(const { e, o } of adjE[id]) if(e.state === 0 && find(o) === find(id)){ e.state = 2; out.push({ e, value: 'same', rule: 'match-region' }); }
    }
    if(merged) out.again = true;
    return out;
  }

  // ---- where can a given shape still go, for the group `rep`? (what stampStep does for a stamp) ----
  const placeCache = new Map();
  function placementsAt(X, id){
    const ck = X.key + '|' + id, hit = placeCache.get(ck);
    if(hit !== undefined) return hit;
    const out = [], seen = new Set(), x0 = id % w, y0 = (id - x0) / w;
    for(const ori of X.orients) for(const [sx, sy] of ori.cells){
      const ox = x0 - sx, oy = y0 - sy, cells = [];
      let ok = true;
      for(const [cx, cy] of ori.cells){
        const gx = cx + ox, gy = cy + oy;
        if(gx < 0 || gy < 0 || gx >= w || gy >= h || !ctx.isActive(gx, gy)){ ok = false; break; }
        cells.push(cid(gx, gy));
      }
      if(!ok) continue;
      const key = cells.slice().sort((a, b) => a - b).join(',');
      if(seen.has(key)) continue;
      seen.add(key); out.push(cells);
    }
    if(placeCache.size > 200000) placeCache.clear();
    placeCache.set(ck, out);
    return out;
  }
  // returns null (no place left: tag in `why`) or the decided edges (.again when groups were merged)
  function placeStep(rep, X, dmap, tag){
    const V = [];
    for(const P of placementsAt(X, members.get(rep)[0])) if(placementOk(P, rep, dmap)) V.push(P);
    if(V.length === 0){ why = tag; return null; }
    const out = [];
    for(const P of V) for(const id of P) cntBuf[id]++;
    const sure = V[0].filter(id => cntBuf[id] === V.length);          // tiles EVERY remaining place covers are in this piece
    for(const P of V) for(const id of P) cntBuf[id] = 0;
    let merged = false;
    for(const id of sure) if(find(id) !== find(rep)){ union(rep, id); merged = true; }
    for(const id of sure) for(const { e, o } of adjE[id]) if(e.state === 0 && find(o) === find(id)){ e.state = 2; out.push({ e, value: 'same', rule: tag }); }
    for(const P of V){                                                // an edge on the boundary of EVERY remaining place is a wall
      markGen++;
      for(const id of P) markBuf[id] = markGen;
      for(const id of P) for(const { e, o } of adjE[id]) if(markBuf[o] !== markGen) edgeCnt[e.idx]++;
    }
    for(const P of V) for(const id of P) for(const { e } of adjE[id]){
      const n = edgeCnt[e.idx];
      if(n === 0) continue;
      edgeCnt[e.idx] = 0;
      if(n === V.length && e.state === 0){ e.state = 1; out.push({ e, value: 'wall', rule: tag }); }
    }
    if(merged) out.again = true;
    return out;
  }
  // Match with one shape left: every unfinished group needs a place for it
  function matchPlaceStep(dmap){
    const X = matchList[0];
    for(const [rep, mem] of members){
      if(groupComplete(rep, mem)) continue;
      const r = placeStep(rep, X, dmap, 'match-place');
      if(r === null) return null;
      if(r.length > 0 || r.again) return r;
    }
    return [];
  }

  // ---- Mismatch ----
  // every shape with the same canonical key listed once (bank, stamps, free shapes), to get a shape back from its key
  let shapeIdx = null;
  function shapeEntry(key, size){
    if(!shapeIdx){
      shapeIdx = new Map();
      if(mBank) for(const s of mBank) shapeIdx.set(s.key, s);
      for(const sp of stampList) if(!shapeIdx.has(sp.key)) shapeIdx.set(sp.key, { key: sp.key, size: sp.size, orients: sp.shape.orients });
    }
    let e = shapeIdx.get(key);
    if(!e && size <= MINGLE_ENUM_MAX) for(const s of mFreeList(size)) if(s.key === key){ e = s; break; }
    return e || null;
  }
  // stamps of one shape: two pieces can not share a shape, so all those tiles are ONE piece
  const stampClasses = [];
  if(ruleMismatch){
    const byIdx = new Map();
    for(const id of activeIds){ const si = stampAt[id]; if(!si) continue; if(!byIdx.has(si)) byIdx.set(si, []); byIdx.get(si).push(id); }
    for(const ids of byIdx.values()) if(ids.length > 1) stampClasses.push(ids);
  }
  // the listed shapes a domain still has (null when it also holds unlisted ones: then nothing can be said about it)
  function domVals(d){
    if(d.wlo <= d.whi) return null;
    const out = [];
    for(const it of d.items) if(!(d.rm && d.rm.has(it.k))) out.push(it);
    return out;
  }
  // "naked pairs / triples": k groups that are pairwise KNOWN to be different pieces and can only take k shapes between them use up exactly those
  // shapes (every piece has its own), so every group known to be different from ALL of them loses those shapes. Fewer shapes than groups = impossible.
  // (Known different matters: two groups that might be one piece would share a shape and leave the other free.)
  // returns null (impossible, why = 'mismatch-pair'), true (a shape was removed) or false
  function nakedPass(dom, dmap){
    const vals = new Map();
    for(const [rep, d] of dom){ const v = domVals(d); if(v && v.length <= 3) vals.set(rep, v); }
    let changed = false;
    const strip = (members, U, size) => {
      let common = null;
      for(const m of members){
        const s = dmap.get(m);
        if(!s) return true;
        if(common === null) common = new Set(s); else for(const x of common) if(!s.has(x)) common.delete(x);
        if(common.size === 0) return true;
      }
      for(const h of common){
        const dh = dom.get(h); if(!dh || members.includes(h)) continue;
        for(const [k, sz] of U) if(domHas(dh, k, sz, false)){
          domRemove(dh, k, sz, false); changed = true;
          if(domEmpty(dh, false)){ why = 'mismatch-pair'; return false; }
        }
      }
      return true;
    };
    for(const [ra, va] of vals){
      const na = dmap.get(ra); if(!na) continue;
      for(const rb of na){
        if(rb <= ra) continue;
        const vb = vals.get(rb), sb = dmap.get(rb);
        if(!vb || !sb) continue;
        const U2 = new Map(); for(const it of va) U2.set(it.k, it.size); for(const it of vb) U2.set(it.k, it.size);
        if(U2.size < 2){ why = 'mismatch-pair'; return null; }
        if(U2.size === 2 && !strip([ra, rb], U2)) return null;
        for(const rc of na){
          if(rc <= rb || !sb.has(rc)) continue;
          const vc = vals.get(rc); if(!vc) continue;
          const U3 = new Map(U2); for(const it of vc) U3.set(it.k, it.size);
          if(U3.size < 3){ why = 'mismatch-pair'; return null; }
          if(U3.size === 3 && !strip([ra, rb, rc], U3)) return null;
        }
      }
    }
    return changed;
  }
  function mismatchStep(need, capOf, dmap){
    const out = [];
    let merged = false;
    for(const ids of stampClasses) for(let i = 1; i < ids.length; i++) if(find(ids[i]) !== find(ids[0])){ union(ids[0], ids[i]); merged = true; }
    if(merged){
      for(const e of spots) if(e.state === 0 && find(e.a) === find(e.b)){ e.state = 2; out.push({ e, value: 'same', rule: 'mismatch-stamp' }); }
      out.again = true;
      return out;
    }
    // the shape each group can still have (the Mingle Shape machinery: bank + stamps + size limits + what the group already holds)
    const dom = new Map();
    for(const [rep, mem] of members){
      if(groupComplete(rep, mem) && mem.length >= need.get(rep) && mem.length <= capOf.get(rep)){ need.set(rep, mem.length); capOf.set(rep, mem.length); }   // v34: finished piece
      const d = mingleDomain('shape', mem, need.get(rep), capOf.get(rep));
      if(domEmpty(d, false)){ why = 'mismatch-clash'; return null; }
      dom.set(rep, d);
    }
    // v34: groups in different open regions (cut off from each other by decided walls) are different pieces too
    const regOf = new Int32Array(N).fill(-1);
    for(const start of activeIds){
      if(regOf[start] >= 0) continue;
      regOf[start] = start; const q = [start];
      for(let qi = 0; qi < q.length; qi++) for(const { e, o } of adjE[q[qi]]){ if(e.state === 1 || regOf[o] >= 0) continue; regOf[o] = start; q.push(o); }
    }
    // a group pinned to one shape takes it away from every group known to be a different piece (all pieces differ, not only neighbours)
    for(let guard = 0, changed = true; changed && guard < 60; guard++){
      changed = false;
      for(const [ra, da] of dom){
        const p = domCount(da, false);
        if(p.n !== 1) continue;
        for(const [rb, db] of dom){
          if(rb === ra || regOf[rb] === regOf[ra] || !domHas(db, p.k, p.size, false)) continue;
          domRemove(db, p.k, p.size, false); changed = true;
          if(domEmpty(db, false)){ why = 'mismatch-clash'; return null; }
        }
      }
      for(const [ra, set] of dmap){
        const da = dom.get(ra); if(!da) continue;
        const p = domCount(da, false);
        if(p.n !== 1) continue;
        for(const rb of set){
          const db = dom.get(rb);
          if(!db || !domHas(db, p.k, p.size, false)) continue;
          domRemove(db, p.k, p.size, false); changed = true;
          if(domEmpty(db, false)){ why = 'mismatch-clash'; return null; }
        }
      }
      const nk = nakedPass(dom, dmap);
      if(nk === null) return null;
      if(nk) changed = true;
    }
    for(const [rep, d] of dom){                                   // the surviving shapes bound the size (same write-back as Mingle)
      const b = domBounds(d, false);
      if(b.lo > Math.max(need.get(rep), ctx.sizeLo)) need.set(rep, b.lo);
      if(b.hi < capOf.get(rep)) capOf.set(rep, b.hi);
    }
    // two groups pinned to the same shape (and not known to be different) are one piece
    const pinned = new Map();
    for(const [rep, d] of dom){
      const p = domCount(d, false);
      if(p.n !== 1) continue;
      if(!pinned.has(p.k)) pinned.set(p.k, { size: p.size, reps: [] });
      pinned.get(p.k).reps.push(rep);
    }
    for(const { reps } of pinned.values()) for(let i = 1; i < reps.length; i++) if(find(reps[i]) !== find(reps[0])){ union(reps[0], reps[i]); merged = true; }
    if(merged){
      for(const e of spots) if(e.state === 0 && find(e.a) === find(e.b)){ e.state = 2; out.push({ e, value: 'same', rule: 'mismatch-link' }); }
      out.again = true;
      return out;
    }
    // a pinned group (not a stamp: stampStep does those) must still have a place for its shape
    for(const [key, { size, reps }] of pinned){
      if(size < 2) continue;
      const X = shapeEntry(key, size);
      if(!X) continue;
      for(const rep0 of reps){
        const rep = find(rep0), mem = members.get(rep);
        if(!mem || groupComplete(rep, mem) || mem.some(id => stampAt[id])) continue;
        const r = placeStep(rep, X, dmap, 'mismatch-place');
        if(r === null) return null;
        if(r.length > 0 || r.again) return r;
      }
    }
    return out;
  }
  // ============================================================================================================
  // v26: facts about MINIMUM / MAXIMUM / RANGE (and Precision) of the piece size.
  // Same contract as v23 - v25: everything here holds in EVERY valid tiling, so it can only decide edges, never lose a solution.
  // The counting part is done once in buildSolverContext (`ctx.rangeInfo`, from `rangeCover`): the sizes that occur in SOME way of
  // covering the board with pieces of lo..hi tiles (ctx.sizeLo / ctx.sizeHi are already narrowed to the smallest / biggest of them).
  //   range-count   (static) the board can not be covered by pieces of the allowed sizes at all; or a size that fits no cover is removed
  //                 (when that leaves a hole inside lo..hi, `rangeSet` keeps the exact list and pieceInfo snaps to it)
  //   range-region  a region closed in by walls (walls decided so far) must itself be covered by pieces of the allowed sizes:
  //                 not coverable = impossible; only ONE way (one piece) = all its edges are links; as few groups as the fewest
  //                 pieces it needs = every group is its own piece, all its open edges are walls; fewer groups than that = impossible;
  //                 the sizes a piece of that region can have bound the groups in it (merges that get bigger than the biggest = wall)
  //   min-grow      a group smaller than the Minimum with exactly one open way out has to use it
  //   min-reach     a group that can not reach as many tiles as the Minimum (walls, other pieces in the way) is impossible; an open
  //                 edge whose closing would leave the group too few tiles to reach is a link
  // (the Maximum on its own: two groups whose union is bigger than the Maximum are separated by a wall, as before; region-size caps
  //  and the fewest-pieces count of range-region now add to it)
  // ============================================================================================================
  const RI = ctx.rangeInfo || null;
  const rLo = ctx.sizeLo, rHi = ctx.sizeHi, minOn = !!RI && rLo > 1;
  if(RI && RI.usable.length < rHi - rLo + 1) rangeSet = RI.usable;
  if(ctx.rangeInfeasible && !staticWhy) staticWhy = ctx.banWhy ? 'ban-size' : ctx.bankWhy ? 'bank-count' : 'range-count';

  // how many tiles can the group reach (open edges, not through groups known to be a different piece, `closed` counts as a wall)?
  // Stops counting at `need`. Only used when there are no roses / compasses (then the count is all reachOk looks at).
  const rStamp = new Int32Array(N), rQueue = new Int32Array(N); let rTick = 0;
  function reachCount(rep, mem, blocked, closed, need){
    const tick = ++rTick; let qn = 0;
    for(const id of mem){ rStamp[id] = tick; rQueue[qn++] = id; }
    if(qn >= need) return qn;
    const far = closed ? find(find(closed.a) === rep ? closed.b : closed.a) : -1;
    for(let qi = 0; qi < qn; qi++){
      if(palPass && !palPass[rQueue[qi]] && find(rQueue[qi]) !== rep) continue;   // v68
      for(const { e, o } of adjE[rQueue[qi]]){
        if(rStamp[o] === tick || e.state === 1 || e === closed) continue;
        const g = find(o);
        if(g === far || blocked.has(g)) continue;
        rStamp[o] = tick; rQueue[qn++] = o;
        if(qn >= need) return qn;
      }
    }
    return qn;
  }

  // ---- regions closed in by walls must be coverable by pieces of the allowed sizes ----
  function rangeStep(need, capOf){
    const regionTag = ctx.bankMatters ? 'bank-region' : 'range-region';
    const out = [], regs = openRegions(), regOf = new Int32Array(N).fill(-1);
    regs.forEach((tiles, i) => { for(const id of tiles) regOf[id] = i; });
    const groups = regs.map(() => []);
    for(const rep of members.keys()) groups[regOf[rep]].push(rep);
    let merged = false;
    for(let ri = 0; ri < regs.length; ri++){
      const tiles = regs[ri], s = tiles.length, reps = groups[ri];
      if(!RI.reach[s]){ why = regionTag; return null; }
      let zlo = 0, zhi = 0;                                         // the sizes a piece inside this region can have
      for(const z of RI.usable){ if(z > s) break; if(RI.reach[s - z]){ if(!zlo) zlo = z; zhi = z; } }
      if(!zlo){ why = regionTag; return null; }
      if(reps.length < RI.minN[s]){ why = regionTag; return null; }      // fewer groups than the fewest pieces the region needs
      if(reps.length === 1) { if(members.get(reps[0]).length > zhi){ why = regionTag; return null; } }
      for(const rep of reps){
        if(need.get(rep) < zlo) need.set(rep, zlo);
        if(capOf.get(rep) > zhi) capOf.set(rep, zhi);
        if(members.get(rep).length > capOf.get(rep) || need.get(rep) > capOf.get(rep)){ why = regionTag; return null; }
      }
      if(reps.length === 1) continue;
      if(zlo === s && zhi === s){                                   // the only cover of this region is one piece
        for(const id of tiles) if(find(id) !== find(tiles[0])){ union(tiles[0], id); merged = true; }
        for(const id of tiles) for(const { e, o } of adjE[id]) if(e.state === 0 && find(o) === find(id)){ e.state = 2; out.push({ e, value: 'same', rule: regionTag }); }
      } else if(reps.length === RI.minN[s]){                        // as many groups as pieces: every group is a piece of its own
        for(const id of tiles) for(const { e, o } of adjE[id]) if(e.state === 0 && find(o) !== find(id)){ e.state = 1; out.push({ e, value: 'wall', rule: regionTag }); }
      } else {                                                      // a merge bigger than any piece of this region can be is a wall
        for(const id of tiles) for(const { e, o } of adjE[id]){
          if(e.state !== 0) continue;
          const ra = find(id), rb = find(o);
          if(ra !== rb && members.get(ra).length + members.get(rb).length > zhi){ e.state = 1; out.push({ e, value: 'wall', rule: regionTag }); }
        }
      }
    }
    if(merged) out.again = true;
    return out;
  }

  // ============================================================================================================
  // v27: facts about AREA NUMBERS - and about everything else that fixes the size of a piece. A polyomino stamp is an area number with
  // a shape, so a stamp counts here with the size of its shape (`fixedAt[tile]` = the size the piece of that tile must have, 0 = none).
  // Same contract as v23 - v26: everything here holds in EVERY valid tiling, so it can only decide edges, never lose a solution.
  //   area-count   a region closed in by walls (the whole board when there are none): the numbered pieces need whole pieces of their own size
  //                (a piece holds the tiles of its groups, so m tiles of number v need at least m/v pieces, and at most one per group); with
  //                the rest of the region still coverable by pieces of the allowed sizes. No way = impossible
  //   area-region  ... and from the number of pieces that is left: only ONE piece possible = the groups with that number are linked;
  //                as many pieces as groups = they are all separate (the edges between them are walls)
  //   area-rel     the walls that compare sizes (bigger / smaller / differ by N / same shape): every piece keeps the list of sizes it can still
  //                have, a size with no partner on the other side of the wall is dropped (a number on one side can pin the other side's size,
  //                and a pinned size then feeds area-count); two groups with no size in common are separated
  // ============================================================================================================
  const fixedAt = new Int16Array(N);
  let areaOn = false;
  for(const id of activeIds){
    let v = areaAt[id];
    if(!v && stampAt[id]) v = stampList[stampAt[id] - 1].size;
    if(v){ fixedAt[id] = v; areaOn = true; }
  }
  let inProbe = false;                                  // true while probeLoop tries an assumption: the counting / reach steps stay out of those thousands of passes (they cost more than they find there)
  let derived = new Map(), relRaised = new Set();      // per pass: group -> the one size the walls that compare sizes leave it; groups whose need they raised
  function groupFixed(rep){
    const d = derived.get(rep); if(d) return d;
    const mem = members.get(rep);
    for(let i = 0; i < mem.length; i++){ const f = fixedAt[mem[i]]; if(f) return f; }
    return 0;
  }

  // ---- area-count / area-region ----
  // For a region of s tiles and the numbers in it: for every number v the pieces holding it (p of them, lo..hi) and the other tiles
  // of the region must add up: s = sum(v * p) + rest, with the rest coverable by pieces of the allowed sizes. Returns, for every v,
  // the smallest and the biggest p that has such a completion, or null when there is none.
  const areaMemo = new Map();
  function areaFeasible(s, list){
    const k = list.length;
    const rest = new Uint8Array(s + 1);
    for(let y = 0; y <= s; y++) rest[y] = RI ? RI.reach[y] : 1;
    const F = [new Uint8Array(s + 1)]; F[0][0] = 1;                       // F[i][x]: stages 0..i-1 can add up to x
    for(let i = 0; i < k; i++){
      const nx = new Uint8Array(s + 1), cur = F[i], v = list[i].v;
      for(let x = 0; x <= s; x++){ if(!cur[x]) continue; for(let p = list[i].lo; p <= list[i].hi; p++){ const y = x + v * p; if(y > s) break; nx[y] = 1; } }
      F.push(nx);
    }
    const B = new Array(k + 1); B[k] = rest;                              // B[i][y]: stages i..k-1 and the rest can add up to y
    for(let i = k - 1; i >= 0; i--){
      const nx = new Uint8Array(s + 1), nxt = B[i + 1], v = list[i].v;
      for(let y = 0; y <= s; y++){ for(let p = list[i].lo; p <= list[i].hi; p++){ const d = y - v * p; if(d < 0) break; if(nxt[d]){ nx[y] = 1; break; } } }
      B[i] = nx;
    }
    if(!B[0][s]) return null;
    const res = [];
    for(let i = 0; i < k; i++){
      let pmin = -1, pmax = -1; const v = list[i].v;
      for(let p = list[i].lo; p <= list[i].hi; p++){
        const room = s - v * p; if(room < 0) break;
        let ok = false;
        for(let x = 0; x <= room; x++) if(F[i][x] && B[i + 1][room - x]){ ok = true; break; }
        if(ok){ if(pmin < 0) pmin = p; pmax = p; }
      }
      res.push([pmin, pmax]);
    }
    return res;
  }
  function areaStep(dmap, addDiff){
    const out = [], regs = openRegions();
    let merged = false;
    for(const tiles of regs){
      const seen = new Set(), byV = new Map();
      for(const id of tiles){
        const rep = find(id); if(seen.has(rep)) continue; seen.add(rep);
        const v = groupFixed(rep); if(!v) continue;
        let ent = byV.get(v); if(!ent){ ent = { v, reps: [], m: 0 }; byV.set(v, ent); }
        ent.reps.push(rep); ent.m += members.get(rep).length;
      }
      if(byV.size === 0) continue;
      const s = tiles.length;
      // cheap exit: no size rules and every group could be a piece of its own with room to spare = nothing to learn (groups known to be apart already have their walls)
      if(!RI){ let all = 0; for(const ent of byV.values()) all += ent.v * ent.reps.length; if(all <= s) continue; }
      const list = [...byV.values()].sort((x, y) => x.v - y.v);
      let key = '' + s;
      for(const ent of list){
        const g = ent.reps.length;
        let clique = 1;                                                    // groups that are known to be different pieces need a piece each
        if(g > 1) for(let st = 0; st < Math.min(g, 8); st++){
          const cl = [ent.reps[st]];
          for(let j = 0; j < g; j++){ if(j === st) continue; const r = ent.reps[j]; if(cl.every(c => { const dm = dmap.get(c); return dm && dm.has(r); })) cl.push(r); }
          if(cl.length > clique) clique = cl.length;
        }
        ent.lo = Math.max(1, Math.ceil(ent.m / ent.v), clique);
        ent.hi = Math.min(g, Math.floor(s / ent.v));
        if(ent.lo > ent.hi){ why = 'area-count'; return null; }
        key += '|' + ent.v + ':' + ent.lo + ':' + ent.hi;
      }
      let res = areaMemo.get(key);
      if(res === undefined){ if(areaMemo.size > 4000) areaMemo.clear(); res = areaFeasible(s, list); areaMemo.set(key, res); }
      if(res === null){ why = 'area-count'; return null; }
      for(let i = 0; i < list.length; i++){
        const ent = list[i], g = ent.reps.length; if(g < 2) continue;
        const [pmin, pmax] = res[i];
        if(pmax === 1){                                                    // one piece only: the groups with this number that touch are in it
          // (groups that do not touch are NOT merged: a merged group is treated as one connected block, which they are not yet)
          const inSet = new Set(ent.reps);
          for(const r0 of ent.reps) for(const id of members.get(find(r0))) for(const { e, o } of adjE[id]){
            if(e.state !== 0) continue;
            const ro = find(o);
            if(ro !== find(id) && inSet.has(ro)){ e.state = 2; union(e.a, e.b); merged = true; out.push({ e, value: 'same', rule: 'area-region' }); }
          }
        } else if(pmin === g){                                             // a piece for every group: they stay apart
          const inSet = new Set(ent.reps);
          for(let a = 0; a < g; a++) for(let b = a + 1; b < g; b++) addDiff(ent.reps[a], ent.reps[b], 'area-region');
          for(const r of ent.reps) for(const id of members.get(r)) for(const { e, o } of adjE[id]){
            if(e.state !== 0) continue;
            const ro = find(o);
            if(ro !== r && inSet.has(ro)){ e.state = 1; out.push({ e, value: 'wall', rule: 'area-region' }); }
          }
        }
      }
    }
    if(merged) out.again = true;
    return out;
  }

  // ============================================================================================================
  // v40: AREA-SUM. The area numbers (and stamps) of a region closed in by walls need whole pieces: for every number at least
  // ceil(tiles of that number / number) pieces, at least one per group known to be apart. What is left of the region's tiles
  // after that is the SLACK (s0). Every fact below holds in every valid tiling (a necessary condition, never a guess).
  //   * slack 0   no piece without a number can exist (10 + 15 on 25 tiles).
  //   * slack 1   the only piece without a number is ONE tile (the last shape has exactly size 1).
  //   * slack >=2 the sizes U an unnumbered piece can still have are found with a small count over the allowed sizes (size rules,
  //               bank, Non-boxy takes out the sizes 1 and 2): 14 tiles with a 4 and a 5 and Non-boxy leave 5 tiles that cannot be cut
  //               into non-rectangles, so U = {5}.
  // Tag area-sum:
  //   (1) a group without a number that is too big for U (or when U is empty) must grow into a numbered piece: it needs an open edge,
  //       and it must still be able to reach a numbered group that has room for both (sizes of both groups + the tiles between);
  //       an edge without which it could not is a link.
  //   (2) groups that cannot reach any numbered group are pieces of their own: each has a size in U, and together they need no more
  //       tiles than the slack; one of exactly the biggest size of U can not grow, so its open edges are walls.
  //   (3) a number that cannot get a second piece (the slack is smaller than the number) with all its groups: they are ONE piece, even
  //       when they do not touch yet, so each must still be able to reach every other one.
  // Runs in every propagation pass (also in probes and inside the edge search), one sweep over the open regions.
  // opts.areaSumSlack caps the slack that is used (0, 1, ...; default 1), to measure what each step buys.
  // ============================================================================================================
  const asMax = opts.areaSumSlack != null ? +opts.areaSumSlack : 1;        // default: slack 0 and 1 (measured: slack >= 2 costs about what it saves)
  const asAllowed = new Uint8Array(N + 2), asCover = new Uint8Array(N + 2);
  let asReady = false;
  function asInit(){            // lazy: nbOn / RI are set up later in this function
    asReady = true;
    const useSet = RI ? new Set(RI.usable) : null;
    for(let z = 1; z <= N; z++) asAllowed[z] = ((!useSet || useSet.has(z)) && (!nbOn || z >= 3)) ? 1 : 0;      // ONLY real rules: ctx.sizeLo/sizeHi are search bounds, not rules
    asCover[0] = 1;
    for(let y = 1; y <= N; y++) for(let z = 1; z <= y; z++) if(asAllowed[z] && asCover[y - z]){ asCover[y] = 1; break; }
  }
  const asMemo = new Map();
  // sizes an unnumbered piece can have in a region of s tiles, given the numbers' piece-count ranges: { U: sorted sizes, zero: no piece needed is possible, restMax }  | null = nothing fits
  function areaSumSizes(s, list){
    let key = '' + s; for(const x of list) key += '|' + x.v + ':' + x.lo + ':' + x.hi;
    let res = asMemo.get(key); if(res !== undefined) return res;
    let F = new Uint8Array(s + 1); F[0] = 1;
    for(const x of list){
      const G = new Uint8Array(s + 1);
      for(let t = 0; t <= s; t++){ if(!F[t]) continue; for(let p = x.lo; p <= x.hi; p++){ const y = t + x.v * p; if(y > s) break; G[y] = 1; } }
      F = G;
    }
    const U = new Set(); let zero = false, restMax = 0, any = false;
    for(let t = 0; t <= s; t++){
      if(!F[t]) continue;
      const r = s - t;
      if(r === 0){ zero = true; any = true; continue; }
      let ok = false;
      for(let z = 1; z <= r; z++) if(asAllowed[z] && asCover[r - z]){ U.add(z); ok = true; }
      if(ok){ any = true; if(r > restMax) restMax = r; }
    }
    res = any ? { U: [...U].sort((a, b) => a - b), zero, restMax } : null;
    if(asMemo.size > 4000) asMemo.clear();
    asMemo.set(key, res);
    return res;
  }
  function areaSumStep(dmap){
    if(!areaOn) return [];
    if(!asReady) asInit();
    const out = [], regs = openRegions();
    for(const tiles of regs){
      const byV = new Map(), unnum = [], seen = new Set();
      for(const id of tiles){
        const rep = find(id); if(seen.has(rep)) continue; seen.add(rep);
        const v = groupFixed(rep);
        if(!v){ unnum.push(rep); continue; }
        let ent = byV.get(v); if(!ent){ ent = { v, reps: [], m: 0 }; byV.set(v, ent); }
        ent.reps.push(rep); ent.m += members.get(rep).length;
      }
      if(byV.size === 0) continue;
      let sumLo = 0;
      for(const ent of byV.values()){
        const g = ent.reps.length;
        let clique = 1;
        if(g > 1) for(let st = 0; st < Math.min(g, 8); st++){
          const cl = [ent.reps[st]];
          for(let j = 0; j < g; j++){ if(j === st) continue; const r = ent.reps[j]; if(cl.every(c => { const dm = dmap.get(c); return dm && dm.has(r); })) cl.push(r); }
          if(cl.length > clique) clique = cl.length;
        }
        ent.lo = Math.max(1, Math.ceil(ent.m / ent.v), clique);
        ent.hi = Math.min(g, Math.floor(tiles.length / ent.v));
        sumLo += ent.v * ent.lo;
      }
      const s0 = tiles.length - sumLo;
      if(s0 < 0 || s0 > asMax) continue;                         // (a number that does not fit is the job of area-count)
      let ok = true; for(const ent of byV.values()) if(ent.lo > ent.hi) ok = false;
      if(!ok) continue;
      const sz = areaSumSizes(tiles.length, [...byV.values()].sort((x, y) => x.v - y.v));
      if(sz === null){ why = 'area-count'; return null; }
      if(s0 === 0 && opts.areaJoin === true){                                       // v77: area-colour (see patch_core77.py); v78: off by default
        let onePer = true; for(const ent of byV.values()) if(!(ent.lo === 1 && ent.v > s0)) onePer = false;
        if(onePer && byV.size >= 2){
          const regSet = new Set(); for(const id of tiles) regSet.add(find(id));
          const col = new Map();                                                    // rep -> colour: the number (absolute) or 'c<comp>:<0|1>' (relative, two pieces only)
          for(const ent of byV.values()) for(const r of ent.reps) col.set(r, ent.v);
          for(const ent of byV.values()) for(const r of ent.reps){ const dm = dmap.get(r); if(dm) for(const r2 of ent.reps) if(dm.has(r2)){ why = 'area-sum'; return null; } }
          const vals = [...byV.keys()];
          if(vals.length === 2){                                                    // two pieces: 2-colour the known-different graph
            const other = v => v === vals[0] ? vals[1] : vals[0];
            const q = [...col.keys()];
            for(let qi = 0; qi < q.length; qi++){ const cur = q[qi], dm = dmap.get(cur); if(!dm) continue; const c = other(col.get(cur));
              for(const nb of dm){ if(!regSet.has(nb)) continue; if(!col.has(nb)){ col.set(nb, c); q.push(nb); } else if(col.get(nb) !== c){ why = 'area-sum'; return null; } } }
            let cn = 0;
            for(const st of regSet){
              if(col.has(st)) continue;
              const q2 = [st]; col.set(st, 'c' + cn + ':0');
              for(let qi = 0; qi < q2.length; qi++){ const cur = q2[qi], dm = dmap.get(cur); if(!dm) continue; const cc = col.get(cur), c = cc.slice(0, -1) + (cc.endsWith('0') ? '1' : '0');
                for(const nb of dm){ if(!regSet.has(nb)) continue; if(!col.has(nb)){ col.set(nb, c); q2.push(nb); } else if(col.get(nb) !== c){ why = 'area-sum'; return null; } } }
              cn++;
            }
          } else {                                                                  // more pieces: excluded from all numbers but one = that one
            for(const r of regSet){
              if(col.has(r)) continue;
              const dm = dmap.get(r); if(!dm) continue;
              const cand = [];
              for(const ent of byV.values()) if(!ent.reps.some(x => dm.has(x))) cand.push(ent.v);
              if(cand.length === 0){ why = 'area-sum'; return null; }
              if(cand.length === 1) col.set(r, cand[0]);
            }
          }
          for(const e of spots){
            if(e.state !== 0) continue;
            const ra = find(e.a), rb = find(e.b); if(ra === rb || !col.has(ra) || !col.has(rb)) continue;
            const ca = col.get(ra), cb = col.get(rb);
            if(typeof ca === 'string' && typeof cb === 'string'){ if(ca.split(':')[0] !== cb.split(':')[0]) continue; }
            else if(typeof ca === 'string' || typeof cb === 'string') continue;
            if(ca === cb){ e.state = 2; union(e.a, e.b); out.push({ e, value: 'same', rule: 'area-sum' }); }
            else { e.state = 1; out.push({ e, value: 'wall', rule: 'area-sum' }); }
            return out;                                                             // one at a time: dmap / reps change with it
          }
          if(vals.length === 2 && opts.areaColourReach !== false){                  // (c) each colour class is ONE piece: a group of colour v reaches the
            const anchor = new Map(vals.map(v => [v, byV.get(v).reps[0]]));        //     first numbered group of v without crossing a tile of the other colour
            const absOf = id => { const c = col.get(find(id)); return typeof c === 'number' ? c : null; };
            const reachA = (rep, v, skipE) => {
              const goal = find(members.get(anchor.get(v))[0]); if(rep === goal) return true;
              const seenR = new Uint8Array(N), q = [];
              for(const id of members.get(rep)){ seenR[id] = 1; q.push(id); }
              for(let qi = 0; qi < q.length; qi++){
                for(const { e, o } of adjE[q[qi]]){
                  if(e.state === 1 || e === skipE || seenR[o]) continue;
                  const co = absOf(o); if(co !== null && co !== v) continue;
                  if(find(o) === goal) return true;
                  seenR[o] = 1; q.push(o);
                }
              }
              return false;
            };
            for(const r of regSet){
              const v = col.get(r); if(typeof v !== 'number') continue;
              if(!reachA(r, v, null)){ why = 'area-sum'; return null; }
              for(const id of members.get(r)) for(const { e, o } of adjE[id]){
                if(e.state !== 0 || find(o) === r) continue;
                const co = absOf(o); if(co !== null && co !== v) continue;
                if(!reachA(r, v, e)){ e.state = 2; union(e.a, e.b); out.push({ e, value: 'same', rule: 'area-sum' }); return out; }
              }
            }
          }
        }
      }
      const maxU = sz.U.length ? sz.U[sz.U.length - 1] : 0;
      // BFS over tiles that can still be in one piece with `rep`: true if a group accepted by `want(otherRep)` can be reached
      // with room for both groups and the tiles between them (steps - 1); want() = size of the piece the goal belongs to, 0 = not a goal
      const reach = (rep, forbid, want) => {
        const mem = members.get(rep), blocked = dmap.get(rep) || null, dist = new Map(), q = [];
        for(const id of mem){ dist.set(id, 0); q.push(id); }
        for(let qi = 0; qi < q.length; qi++){
          const id = q[qi], d = dist.get(id);
          for(const { e, o } of adjE[id]){
            if(e.state === 1 || e === forbid || dist.has(o)) continue;
            const ro = find(o);
            if(ro === rep) continue;
            if(blocked && blocked.has(ro)) continue;
            const room = want(ro);
            if(room > 0 && mem.length + members.get(ro).length + d <= room) return true;
            dist.set(o, d + 1); q.push(o);
          }
        }
        return false;
      };
      const exitsOf = rep => { const ex = []; for(const id of members.get(rep)) for(const { e, o } of adjE[id]) if(e.state === 0 && find(o) !== rep) ex.push(e); return ex; };
      const numWant = r => groupFixed(r);
      const needs = [];                                          // [rep, wants[], mustJoin] : every `want` must stay reachable
      let freeTiles = 0;
      for(const rep of unnum){
        const n = members.get(rep).length;
        if(n > maxU){ needs.push([rep, [numWant], true]); continue; }          // too big to be a piece of its own
        if(!reach(rep, null, numWant)){                                          // cannot join a numbered piece: a free piece of its own
          freeTiles += n;
          if(freeTiles > sz.restMax){ why = 'area-sum'; return null; }
          if(n === maxU) for(const e of exitsOf(rep)){ e.state = 1; out.push({ e, value: 'wall', rule: 'area-sum' }); }
          else if(!sz.U.some(z => z >= n)){ why = 'area-sum'; return null; }
        }
      }
      if(out.length > 0) return out;
      for(const ent of byV.values()) if(ent.lo === 1 && ent.reps.length > 1 && ent.v > s0) for(const rep of ent.reps){
        const wants = [];
        for(const so of ent.reps) if(so !== rep) wants.push(r => r === so ? ent.v : 0);
        needs.push([rep, wants, false]);
      }
      for(const [rep, wants, mustJoin] of needs){
        const ex = exitsOf(rep);
        if(mustJoin && ex.length === 0){ why = 'area-sum'; return null; }
        for(const wt of wants) if(!reach(rep, null, wt)){ why = 'area-sum'; return null; }
        for(const e of ex){
          if(wants.some(wt => !reach(rep, e, wt))){
            e.state = 2; union(e.a, e.b); out.push({ e, value: 'same', rule: 'area-sum' });
            return out;
          }
        }
      }
    }
    return out;
  }

  // ============================================================================================================
  // v40: BRIDGE-COUNT -- counting the tiles behind a choke point. Take the tiles joined by edges that are not walls. An OPEN edge whose
  // removal cuts the board into a side A (nA tiles) and a side B (nB tiles) is a bridge. Either
  //   * it is a wall: then A and B are each covered by whole pieces, so nA and nB must both be sums of allowed piece sizes, or
  //   * it joins ONE piece that has a tiles in A and b tiles in B (a + b an allowed size, a >= the tiles of the two end groups that lie in A,
  //     b >= those in B), and the other nA - a / nB - b tiles are covered by whole pieces.
  // A case that cannot be is excluded, so the edge is decided (both excluded = contradiction). Example: 24 tiles behind one connection
  // with all pieces of size 5: 24 is not a multiple of 5, so the connection is a link, the crossing piece has 4 tiles inside and 1 outside,
  // and the 20 others are four whole pieces. Allowed sizes = size rules, bank sizes, Non-boxy (no 1, 2); only relaxations are used, so it is
  // always sound. Only runs when some size is not allowed (otherwise every count fits). Tag bridge-count.
  // ============================================================================================================
  let bridgeOn = null;                                           // null = not decided yet
  // v48: match-isoK (see patch_core48.py)
  let isoK = null;                                      // inside a K-piece isometry case: { K, d, anc, img, inv, inD, Dlist }
  const pc32 = v => { v = v - ((v >>> 1) & 0x55555555); v = (v & 0x33333333) + ((v >>> 2) & 0x33333333); return (((v + (v >>> 4)) & 0x0F0F0F0F) * 0x01010101) >>> 24; };
  // every set {g_1 .. g_{K-1}} of isometries that can map a piece A (holding the anchor tile) onto the other K-1 pieces.  Returns null when there are
  // too many candidates / cases (the caller then searches without the split) and { cases, t0 } otherwise.
  function isoKCases(d, K){
    const T = activeIds.length, fs = [(x, y) => [x, y], (x, y) => [-x, y], (x, y) => [x, -y], (x, y) => [-x, -y], (x, y) => [y, x], (x, y) => [-y, x], (x, y) => [y, -x], (x, y) => [-y, -x]];
    const cidx = new Int32Array(N).fill(-1); activeIds.forEach((id, i) => { cidx[id] = i; });
    const W32 = (T + 31) >>> 5, LIMIT = opts.isoKLimit != null ? +opts.isoKLimit : 3000000, CASE_MAX = opts.isoKCases != null ? +opts.isoKCases : 5000;
    const mapOf = (fi, tx, ty, img) => {                       // fills img (id -> id or -1); returns how many tiles have an image on the board
      let cnt = 0;
      for(const id of activeIds){
        const x = id % w, y = (id - x) / w, f2 = fs[fi](x, y), gx = f2[0] + tx, gy = f2[1] + ty;
        if(gx >= 0 && gx < w && gy >= 0 && gy < h && ctx.isActive(gx, gy)){ img[id] = gy * w + gx; cnt++; } else img[id] = -1;
      }
      return cnt;
    };
    const tmp = new Int32Array(N);
    const candFor = (t0, keep) => {                              // maps with t0 in the domain and image(t0) a different tile
      const x0 = t0 % w, y0 = (t0 - x0) / w, list = [];
      for(let fi = 0; fi < 8; fi++){
        const p0 = fs[fi](x0, y0);
        for(const q of activeIds){
          if(q === t0) continue;
          const tx = (q % w) - p0[0], ty = Math.floor(q / w) - p0[1];
          if(mapOf(fi, tx, ty, tmp) < d) continue;
          list.push(keep ? { fi, tx, ty, q, img: Int32Array.from(tmp) } : 1);
        }
      }
      return list;
    };
    // the anchor: among the tiles with the fewest neighbours (and the first one), the one with the fewest candidate maps
    const deg = id => { let n = 0; for(const { e } of adjE[id]) n++; return n; };
    const order = activeIds.slice().sort((a, b) => deg(a) - deg(b) || a - b), tries = order.slice(0, Math.min(6, order.length));
    let t0 = tries[0], best = Infinity;
    for(const t of tries){ const n = candFor(t, false).length; if(n < best){ best = n; t0 = t; } }
    const gs = candFor(t0, true);
    if(gs.length > 700) return null;
    for(const g of gs){                                           // domain / no-fixed-point masks over the compact tile index
      g.dm = new Int32Array(W32);
      for(const id of activeIds) if(g.img[id] >= 0 && g.img[id] !== id){ const c = cidx[id]; g.dm[c >>> 5] |= (1 << (c & 31)); }
    }
    const G = gs.length, ok = new Array(G);                       // ok[i][j]: tiles where g_i and g_j do NOT collide (the same tile cannot be in two pieces)
    for(let i = 0; i < G; i++){
      ok[i] = new Array(G);
      for(let j = i + 1; j < G; j++){
        if(gs[i].q === gs[j].q){ ok[i][j] = null; continue; }
        const m = new Int32Array(W32).fill(-1);
        for(const id of activeIds){ const a = gs[i].img[id]; if(a >= 0 && a === gs[j].img[id]){ const c = cidx[id]; m[c >>> 5] &= ~(1 << (c & 31)); } }
        ok[i][j] = m;
      }
    }
    const cases = []; let checks = 0, aborted = false;
    const fullD = new Int32Array(W32); for(let c = 0; c < T; c++) fullD[c >>> 5] |= (1 << (c & 31));
    const cover = new Uint8Array(N);
    function rec(start, chosen, D){
      if(aborted) return;
      if(chosen.length === K - 1){
        cover.fill(0);
        for(let c = 0; c < T; c++){
          if(!(D[c >>> 5] & (1 << (c & 31)))) continue;
          const id = activeIds[c]; cover[id] = 1;
          for(const k of chosen) cover[gs[k].img[id]] = 1;
        }
        for(const id of activeIds) if(!cover[id]) return;
        cases.push(chosen.slice()); if(cases.length > CASE_MAX) aborted = true;
        return;
      }
      for(let i = start; i < G; i++){
        if(++checks > LIMIT){ aborted = true; return; }
        const D2 = new Int32Array(W32); let n = 0, bad = false;
        for(let k = 0; k < W32; k++) D2[k] = D[k] & gs[i].dm[k];
        for(const c of chosen){
          const m = ok[c][i];
          if(m === null){ bad = true; break; }
          for(let k = 0; k < W32; k++) D2[k] &= m[k];
        }
        if(bad) continue;
        for(let k = 0; k < W32; k++) n += pc32(D2[k]);
        if(n < d) continue;
        chosen.push(i); rec(i + 1, chosen, D2); chosen.pop();
        if(aborted) return;
      }
    }
    // ok[c][i] is only filled for c < i (chosen indices are increasing)
    rec(0, [], fullD);
    if(aborted) return null;
    const out = [];
    for(const tuple of cases){
      const imgs = tuple.map(k => gs[k].img);
      const inD = new Uint8Array(N); let D = null;
      for(const id of activeIds){ let good = true; for(const g of imgs){ const a = g[id]; if(a < 0 || a === id){ good = false; break; } } if(good) inD[id] = 1; }
      for(let a = 0; a < imgs.length && true; a++) for(let b = a + 1; b < imgs.length; b++) for(const id of activeIds) if(inD[id] && imgs[a][id] === imgs[b][id]) inD[id] = 0;
      const Dlist = activeIds.filter(id => inD[id]);
      const inv = [null], img = [null];
      for(const g of imgs){ const iv = new Int32Array(N).fill(-1); for(const id of Dlist) iv[g[id]] = id; inv.push(iv); img.push(g); }
      out.push({ K, d, anc: [t0].concat(tuple.map(k => gs[k].q)), img, inv, inD, Dlist, aBuf: new Int8Array(N) });
    }
    return { cases: out, t0, checks };
  }
  // the facts a case adds at its start: the K anchors are different pieces; a tile that cannot have label i is not in the piece of anchor i
  function isoKEnter(cs){
    const K = cs.K, anc = cs.anc;
    for(let i = 0; i < K; i++) for(let j = i + 1; j < K; j++) forbidden.push([anc[i], anc[j], 'match-iso']);
    for(const x of activeIds) for(let i = 0; i < K; i++){
      const y = i === 0 ? x : cs.inv[i][x];
      if(y < 0 || !cs.inD[y]) if(x !== anc[i]) forbidden.push([x, anc[i], 'match-iso']);
    }
  }
  function isoKStep(dmap){
    const cs = isoK, K = cs.K, anc = cs.anc, d = cs.d, a = cs.aBuf, D = cs.Dlist, inD = cs.inD, r = new Array(K);
    for(let i = 0; i < K; i++) r[i] = find(anc[i]);
    const tileOf = (y, i) => i === 0 ? y : cs.img[i][y];
    const known0 = (z, i) => {                                   // z is known NOT to be in piece i
      const rz = find(z); if(rz === r[i]) return false;
      for(let j = 0; j < K; j++) if(j !== i && rz === r[j]) return true;
      const st = dmap.get(rz); return !!(st && st.has(r[i]));
    };
    // 1. a_y from what is known about the K tiles y, g_1(y) .. g_{K-1}(y): 1 = in A, 0 = not, -1 = open
    for(const y of D){
      let one = false, zero = false;
      for(let i = 0; i < K; i++){ const z = tileOf(y, i); if(find(z) === r[i]) one = true; else if(known0(z, i)) zero = true; }
      if(one && zero){ why = 'match-iso'; return null; }
      a[y] = one ? 1 : zero ? 0 : -1;
    }
    // 2. exact cover + |A| = d, to a fixpoint
    for(let guard = 0; guard < 64; guard++){
      let changed = false;
      for(const x of activeIds){
        let cnt = 0, last = -1, ones = 0;
        for(let i = 0; i < K; i++){
          const y = i === 0 ? x : cs.inv[i][x];
          if(y < 0 || !inD[y] || a[y] === 0) continue;
          cnt++; last = y; if(a[y] === 1) ones++;
        }
        if(cnt === 0 || ones > 1){ why = 'match-iso'; return null; }
        if(ones === 1){
          for(let i = 0; i < K; i++){ const y = i === 0 ? x : cs.inv[i][x]; if(y >= 0 && inD[y] && a[y] === -1){ a[y] = 0; changed = true; } }
        } else if(cnt === 1){ a[last] = 1; changed = true; }
      }
      let ones = 0, open = 0;
      for(const y of D){ if(a[y] === 1) ones++; else if(a[y] === -1) open++; }
      if(ones > d || ones + open < d){ why = 'match-iso'; return null; }
      if(open > 0){
        if(ones === d){ for(const y of D) if(a[y] === -1) a[y] = 0; changed = true; }
        else if(ones + open === d){ for(const y of D) if(a[y] === -1) a[y] = 1; changed = true; }
      }
      if(!changed) break;
    }
    // 3. write back: first the 'not in piece' facts (they are read against the groups as they are now), then the unions
    let any = false;
    for(const y of D){
      if(a[y] !== 0) continue;
      for(let i = 0; i < K; i++){ const z = tileOf(y, i); if(z !== anc[i] && !known0(z, i)){ forbidden.push([z, anc[i], 'match-iso']); any = true; } }
    }
    for(const y of D){
      if(a[y] !== 1) continue;
      for(let i = 0; i < K; i++){ const z = tileOf(y, i); if(find(z) !== find(anc[i])){ union(z, anc[i]); any = true; } }
    }
    const out = []; if(any) out.again = true;
    return out;
  }
  // v52: gemini-iso (see patch_core52.py)
  let gemIso = null;                                    // inside a case: { a, b, img, inv }
  const GEM_FS = [(x, y) => [x, y], (x, y) => [-x, y], (x, y) => [x, -y], (x, y) => [-x, -y], (x, y) => [y, x], (x, y) => [-y, x], (x, y) => [y, -x], (x, y) => [-y, -x]];
  function gemNot(z, r, other, dmap){ const rz = find(z); if(rz === r) return false; if(rz === other) return true; const st = dmap && dmap.get(rz); return !!(st && st.has(r)); }
  function gemDmap(){
    const dm = new Map(), add = (x, y) => { if(!dm.has(x)) dm.set(x, new Set()); dm.get(x).add(y); };
    for(const e of edges){ if(e.state !== 1) continue; const ra = find(e.a), rb = find(e.b); if(ra !== rb){ add(ra, rb); add(rb, ra); } }
    for(const [fa, fb] of forbidden){ const ra = find(fa), rb = find(fb); if(ra !== rb){ add(ra, rb); add(rb, ra); } }
    return dm;
  }
  function gemIsoCases(){
    if(ruleMatch || opts.gemIso === false) return null;
    let ge = null;
    for(const g of gdAll) if(g.gem && find(g.a) !== find(g.b)){ ge = g; break; }
    if(!ge) return null;
    const dm = gemDmap(), rA = find(ge.a), rB = find(ge.b), mA = members.get(rA), mB = members.get(rB), out = [];
    const ax = ge.a % w, ay = (ge.a - ax) / w;
    for(const f of GEM_FS){
      const [fx, fy] = f(ax, ay);
      for(const t of activeIds){
        if(find(t) === rA || gemNot(t, rB, rA, dm)) continue;
        const tx = t % w - fx, ty = (t - t % w) / w - fy;
        const img = new Int32Array(N).fill(-1), inv = new Int32Array(N).fill(-1);
        for(const id of activeIds){
          const x = id % w, [gx0, gy0] = f(x, (id - x) / w), gx = gx0 + tx, gy = gy0 + ty;
          if(gx >= 0 && gx < w && gy >= 0 && gy < h && ctx.isActive(gx, gy)){ const q = gy * w + gx; img[id] = q; inv[q] = id; }
        }
        let ok = true;
        for(const x of mA){ const y = img[x]; if(y < 0 || find(y) === rA || gemNot(y, rB, rA, dm)){ ok = false; break; } }
        if(ok) for(const x of mB){ const y = inv[x]; if(y < 0 || find(y) === rB || gemNot(y, rA, rB, dm)){ ok = false; break; } }
        if(ok) out.push({ a: ge.a, b: ge.b, img, inv });
      }
    }
    return out;
  }
  function gemIsoStep(dmap){
    const cs = gemIso, rA = find(cs.a), rB = find(cs.b);
    if(rA === rB){ why = 'gemini-iso'; return null; }
    const uni = [], forb = [];
    for(const id of activeIds){
      const r = find(id), y = cs.img[id], z = cs.inv[id];
      if(r === rA){                                                 // in A: its image is in B
        if(y < 0 || find(y) === rA || gemNot(y, rB, rA, dmap)){ why = 'gemini-iso'; return null; }
        if(find(y) !== rB) uni.push([y, cs.b]);
      } else if(gemNot(id, rA, rB, dmap)){                          // not in A: its image is not in B
        if(y >= 0 && !gemNot(y, rB, rA, dmap)){ if(find(y) === rB){ why = 'gemini-iso'; return null; } forb.push([y, cs.b]); }
      } else if(y < 0 || (y >= 0 && gemNot(y, rB, rA, dmap))) forb.push([id, cs.a]);       // image off the board / known not in B: not in A
      if(r === rB){                                                 // in B: its preimage is in A
        if(z < 0 || find(z) === rB || gemNot(z, rA, rB, dmap)){ why = 'gemini-iso'; return null; }
        if(find(z) !== rA) uni.push([z, cs.a]);
      } else if(gemNot(id, rB, rA, dmap)){
        if(z >= 0 && !gemNot(z, rA, rB, dmap)){ if(find(z) === rA){ why = 'gemini-iso'; return null; } forb.push([z, cs.a]); }
      } else if(z < 0 || (z >= 0 && gemNot(z, rA, rB, dmap))) forb.push([id, cs.b]);
    }
    let any = false;
    for(const [x, y] of forb){ if(find(x) === find(y)){ why = 'gemini-iso'; return null; } forbidden.push([x, y, 'gemini-iso']); any = true; }
    {                                                                // a group or union across regions closed in by walls is impossible (other rules assume it never happens;
      const reg = new Int32Array(N).fill(-1), q = new Int32Array(N);  //  a union of two far tiles can be cut apart by walls decided later)
      for(const s0 of activeIds){
        if(reg[s0] >= 0) continue;
        let qh = 0, qt = 0; q[qt++] = s0; reg[s0] = s0;
        while(qh < qt){ const u = q[qh++]; for(const { e, o } of adjE[u]){ if(e.state === 1 || reg[o] >= 0) continue; reg[o] = s0; q[qt++] = o; } }
      }
      for(const [, mem] of members) for(let i = 1; i < mem.length; i++) if(reg[mem[i]] !== reg[mem[0]]){ why = 'gemini-iso'; return null; }
      for(const [x, y] of uni){ if(reg[x] !== reg[y]){ why = 'gemini-iso'; return null; } }
    }
    for(const [x, y] of uni){ if(find(x) !== find(y)){ union(x, y); any = true; } }
    const out = []; if(any) out.again = true;
    return out;
  }
  // v46: match-iso (see patch_core46.py)
  let isoCase = null;                                   // inside an isometry case: { lab, pairs }
  function isoCases(){
    const out = [], B = w + h;
    const fs = [(x, y) => [x, y], (x, y) => [-x, y], (x, y) => [x, -y], (x, y) => [-x, -y], (x, y) => [y, x], (x, y) => [-y, x], (x, y) => [y, -x], (x, y) => [-y, -x]];
    const nxt = new Int32Array(N), prv = new Int32Array(N), lab = new Int8Array(N), vis = new Uint8Array(N);
    for(const f of fs) for(let tx = -B; tx <= B; tx++) for(let ty = -B; ty <= B; ty++){
      nxt.fill(-1); prv.fill(-1); lab.fill(0); vis.fill(0);
      let bad = false;
      for(const id of activeIds){
        const x = id % w, y = (id - x) / w, fx = f(x, y), gx = fx[0] + tx, gy = fx[1] + ty;
        if(gx >= 0 && gx < w && gy >= 0 && gy < h && ctx.isActive(gx, gy)){ const q = gy * w + gx; if(q === id){ bad = true; break; } nxt[id] = q; prv[q] = id; }
      }
      if(bad) continue;
      for(const id of activeIds){                                   // chains: first tile has no preimage -> A, labels alternate, last must be B
        if(prv[id] !== -1) continue;
        let cnt = 0, cur = id;
        while(cur !== -1){ lab[cur] = (cnt % 2 === 0) ? 1 : 2; vis[cur] = 1; cnt++; cur = nxt[cur]; }
        if(cnt % 2 === 1){ bad = true; break; }
      }
      if(bad) continue;
      for(const id of activeIds){                                   // cycles: even length
        if(vis[id]) continue;
        let cnt = 0, cur = id;
        do { vis[cur] = 1; cnt++; cur = nxt[cur]; } while(cur !== id && cur !== -1);
        if(cur === -1 || cnt % 2 === 1){ bad = true; break; }
      }
      if(bad) continue;
      const pairs = [];
      for(const e of edges){
        const qa = nxt[e.a], qb = nxt[e.b];
        if(qa < 0 || qb < 0) continue;
        const e2 = edgeBetween(qa % w, (qa - qa % w) / w, qb % w, (qb - qb % w) / w);
        if(e2 && e2 !== e) pairs.push(e.idx, e2.idx);
      }
      out.push({ lab: Int8Array.from(lab), pairs });
    }
    return out;
  }
  function isoStep(){
    const out = [], P = isoCase.pairs;
    for(let i = 0; i < P.length; i += 2){
      const e1 = edges[P[i]], e2 = edges[P[i + 1]];
      if(e1.state === e2.state) continue;
      if(e1.state !== 0 && e2.state !== 0){ why = 'match-iso'; return null; }
      const src = e1.state !== 0 ? e1 : e2, dst = src === e1 ? e2 : e1;
      dst.state = src.state; if(dst.state === 2) union(dst.a, dst.b);
      out.push({ e: dst, value: dst.state === 1 ? 'wall' : 'same', rule: 'match-iso' });
    }
    return out;
  }
  // v42: the wall budget  b + T + 2X <= 2(Kmax-1)  (see the header of patch_core42.py: b = wall ends on the outline, T/X = inner corners with 3 / 4 walls); tag euler-count
  function eulerStep(){
    eDeg.fill(0);
    let lhs = 0;
    for(const e of edges){
      if(e.state !== 1) continue;
      if(eVert[e.v1]) lhs++; else { if(eDeg[e.v1] >= 2) lhs++; eDeg[e.v1]++; }
      if(eVert[e.v2]) lhs++; else { if(eDeg[e.v2] >= 2) lhs++; eDeg[e.v2]++; }
    }
    const budget = eulerBudget;
    if(lhs > budget){ why = 'euler-count'; return null; }
    const slack = budget - lhs, out = [];
    for(const e of spots){
      if(e.state !== 0) continue;
      const cost = (eVert[e.v1] || eDeg[e.v1] >= 2 ? 1 : 0) + (eVert[e.v2] || eDeg[e.v2] >= 2 ? 1 : 0);   // what a wall here would add to the left side
      if(cost > slack){ e.state = 2; union(e.a, e.b); out.push({ e, value: 'same', rule: 'euler-count' }); }
    }
    return out;
  }
  // v44: colour-count (see patch_core44.py)
  function colourStep(dmap){
    const K = matchRestrict ? Math.round(ctx.totalActive / matchRestrict[0]) : ctx.pieceCapMax;
    if((K !== 2 && K !== 3) || dmap.size === 0 || opts.colour === false) return [];
    const out = [];
    if(K === 2){
      const col = new Map(), comp = new Map(); let cn = 0;
      for(const s0 of dmap.keys()){
        if(col.has(s0)) continue;
        col.set(s0, 0); comp.set(s0, cn);
        const st = [s0];
        while(st.length){
          const u = st.pop();
          for(const v of dmap.get(u)){
            if(!col.has(v)){ col.set(v, 1 - col.get(u)); comp.set(v, cn); st.push(v); }
            else if(col.get(v) === col.get(u)){ why = 'colour-count'; return null; }
          }
        }
        cn++;
      }
      for(const e of spots){
        if(e.state !== 0) continue;
        const ra = find(e.a), rb = find(e.b);
        if(ra === rb || !col.has(ra) || !col.has(rb) || comp.get(ra) !== comp.get(rb)) continue;
        if(col.get(ra) === col.get(rb)){ e.state = 2; union(e.a, e.b); out.push({ e, value: 'same', rule: 'colour-count' }); }
        else { e.state = 1; out.push({ e, value: 'wall', rule: 'colour-count' }); }
      }
      return out;
    }
    const reps = [...dmap.keys()];
    for(const a of reps) for(const b of dmap.get(a)) if(b > a) for(const c of dmap.get(b)) if(c > b && dmap.get(a).has(c)){
      for(const g of reps){
        if(g === a || g === b || g === c) continue;
        const ng = dmap.get(g), na = ng.has(a), nb = ng.has(b), nc = ng.has(c), n = (na ? 1 : 0) + (nb ? 1 : 0) + (nc ? 1 : 0);
        if(n === 3){ why = 'colour-count'; return null; }
        if(n === 2){
          const m = !na ? a : !nb ? b : c;
          for(const e of spots){
            if(e.state !== 0) continue;
            const ra = find(e.a), rb = find(e.b);
            if((ra === g && rb === m) || (ra === m && rb === g)){ e.state = 2; union(e.a, e.b); out.push({ e, value: 'same', rule: 'colour-count' }); }
          }
        }
      }
    }
    return out;
  }
  function bridgeStep(){
    if(!asReady) asInit();
    if(bridgeOn === null){ bridgeOn = false; for(let z = 1; z <= N; z++) if(!asAllowed[z]) bridgeOn = true; }
    if(!bridgeOn) return [];
    const tin = new Int32Array(N).fill(-1), low = new Int32Array(N), sub = new Int32Array(N), par = new Int32Array(N).fill(-1), parE = new Array(N).fill(null), it = new Int32Array(N);
    let timer = 0;
    const order = [];                                            // dfs order of each component's root
    const compSize = new Map(), compOf = new Int32Array(N).fill(-1);
    for(const root of activeIds){
      if(tin[root] >= 0) continue;
      const stack = [root]; tin[root] = low[root] = timer++; sub[root] = 1;
      const visit = [root];
      while(stack.length){
        const u = stack[stack.length - 1], list = adjE[u];
        if(it[u] < list.length){
          const { e, o } = list[it[u]++];
          if(e.state === 1 || e === parE[u]) continue;
          if(tin[o] < 0){ tin[o] = low[o] = timer++; sub[o] = 1; par[o] = u; parE[o] = e; stack.push(o); visit.push(o); }
          else if(tin[o] < low[u]) low[u] = tin[o];
        } else {
          stack.pop();
          const p = par[u];
          if(p >= 0){ if(low[u] < low[p]) low[p] = low[u]; sub[p] += sub[u]; }
        }
      }
      compSize.set(root, sub[root]);
      for(const t of visit) compOf[t] = root;
      order.push([root, visit]);
    }
    for(const [root, visit] of order){
      const n = compSize.get(root);
      for(const c of visit){
        const p = par[c]; if(p < 0) continue;
        const e = parE[c];
        if(e.state !== 0 || low[c] <= tin[p]) continue;          // not an open bridge
        const nB = sub[c], nA = n - nB;
        // tiles of the two end groups on each side (a group may hold tiles that do not touch: count them where they are)
        const gs = find(p) === find(c) ? [find(p)] : [find(p), find(c)];
        let gA = 0, gB = 0, skip = false;
        for(const g of gs) for(const t of members.get(g)){
          if(compOf[t] !== root){ skip = true; break; }
          if(tin[t] >= tin[c] && tin[t] < tin[c] + sub[c]) gB++; else gA++;
        }
        if(skip) continue;
        // wall: both sides coverable
        const wallOk = asCover[nA] === 1 && asCover[nB] === 1;
        // same: one piece with a tiles in A and b in B
        let sameOk = false;
        const As = [], Bs = [];
        for(let a = gA; a <= nA; a++) if(asCover[nA - a]) As.push(a);
        for(let b = gB; b <= nB; b++) if(asCover[nB - b]) Bs.push(b);
        outer: for(const a of As) for(const b of Bs){ const z = a + b; if(z <= N && asAllowed[z]){ sameOk = true; break outer; } }
        if(!wallOk && !sameOk){ why = 'bridge-count'; return null; }
        if(!wallOk){ e.state = 2; union(e.a, e.b); return [{ e, value: 'same', rule: 'bridge-count' }]; }
        if(!sameOk){ e.state = 1; return [{ e, value: 'wall', rule: 'bridge-count' }]; }
      }
    }
    return [];
  }

  // ---- area-rel: walls that compare sizes ----
  // lt / gt: the piece on one side is smaller / bigger; diffN: the sizes differ by exactly N (0 = equal); gemini (same shape) means equal sizes.
  // Every group on such a wall keeps the list of sizes it can still have (starting from need..cap, which already knows the size rules, the
  // numbers, the stamps ...). A size with no partner across the wall is dropped. The walls themselves are physical barriers, so the two sides
  // are always different pieces.
  const relEdges = [];
  for(const se of (specialEdges || [])){
    const kind = se.kind === 'gemini' ? 'diff' : se.kind;
    if(kind !== 'lt' && kind !== 'gt' && kind !== 'diff') continue;
    if(!ctx.isActive(se.c1, se.r1) || !ctx.isActive(se.c2, se.r2)) continue;
    relEdges.push({ a: cid(se.c1, se.r1), b: cid(se.c2, se.r2), kind, value: se.kind === 'gemini' ? 0 : (se.value || 0) });
  }
  const relOn = relEdges.length > 0;
  // ============================================================================================================
  // v29: gemini / delta walls and polyomino stamps (the "not done" idea of v27 / v28). A gemini wall is a real wall (two different pieces) with the
  // SAME shape on both sides; a delta wall has DIFFERENT shapes. So a piece that holds a stamp pins the shape of the piece across a gemini wall
  // (derived stamp, dStamp: tile -> stamp index + 1, rebuilt at the start of every pass, never kept across a probe rollback), two different pinned
  // shapes across a gemini wall are impossible, and the same pinned shape on both sides of a delta wall is impossible.
  // Derived stamps only go into pieceInfo (size, shape fit, bank fit); the stamp placement logic and "same stamp = one piece" look at real stamps only.
  //   gemini-shape  two different shapes are pinned on the two sides of a same-shape wall
  //   delta-shape   the same shape is pinned on both sides of a different-shape wall
  // ============================================================================================================
  const gdEdges = [];
  if(stampList.length > 0) for(const se of (specialEdges || [])){
    if((se.kind !== 'gemini' && se.kind !== 'delta') || !ctx.isActive(se.c1, se.r1) || !ctx.isActive(se.c2, se.r2)) continue;
    gdEdges.push({ a: cid(se.c1, se.r1), b: cid(se.c2, se.r2), gem: se.kind === 'gemini' });
  }
  if(gdEdges.length > 0) dStamp = new Int16Array(N);
  function derivePrepare(){
    dStamp.fill(0);
    const stampOf = rep => { const mem = members.get(rep); for(let i = 0; i < mem.length; i++){ const s = stampAt[mem[i]] || dStamp[mem[i]]; if(s) return s; } return 0; };
    for(let round = 0; round < 8; round++){
      let changed = false;
      for(const ge of gdEdges){
        const ra = find(ge.a), rb = find(ge.b);
        if(ra === rb) continue;
        const sa = stampOf(ra), sb = stampOf(rb);
        if(ge.gem){
          if(sa && sb){ if(sa !== sb){ why = 'gemini-shape'; return false; } }
          else if(sa || sb){ const to = members.get(sa ? rb : ra), s = sa || sb; for(let i = 0; i < to.length; i++) dStamp[to[i]] = s; changed = true; }
        } else if(sa && sb && sa === sb){ why = 'delta-shape'; return false; }
      }
      if(!changed) break;
    }
    return true;
  }
  const extraOn = relOn;                                 // v28 facts (relExtra): all walls that compare sizes
  // sizes as bits of a BigInt: bit k = "a piece of k tiles". lt / gt / diffN then cost a few shifts per wall instead of a loop over every size
  const relUsable = RI ? RI.usable.reduce((m, z) => m | (1n << BigInt(z)), 0n) : null;
  const bitLo = m => (m & -m).toString(2).length - 1, bitHi = m => m.toString(2).length - 1;
  // keep the sizes of X that some size of Y supports (flip: X belongs to the SECOND tile of the wall); returns the new X
  function relPrune(X, Y, kind, value, flip){
    if(flip) kind = kind === 'lt' ? 'gt' : kind === 'gt' ? 'lt' : kind;
    if(Y === 0n) return 0n;
    if(kind === 'lt') return X & ((1n << BigInt(bitHi(Y))) - 1n);                                  // x < the biggest y
    if(kind === 'gt') return X & ~((1n << BigInt(bitLo(Y) + 1)) - 1n);                              // x > the smallest y
    const v = BigInt(value);
    return X & ((Y << v) | (Y >> v));                                                              // x = y +- N
  }
  // ============================================================================================================
  // v28: more facts about the walls that compare sizes (relEdges, see v27). Holds in EVERY valid tiling.
  //   Two pieces on the two sides of such a wall are always two different pieces (a piece can not hold both sides of a wall), and a piece
  //   lies inside ONE region closed in by decided walls, so the pieces of a region share its tiles:
  //   area-chain   smaller / bigger walls that chain (A < B < C ...): the pieces of one chain are pairwise different pieces with different
  //                sizes, so a chain of k pieces needs at least lo(A) + lo(B) + ... tiles (lo = the smallest size left for each piece, which
  //                already counts the chain: 1, 2, 3, 4 for a chain of four). More than the region has = impossible; and every piece of the
  //                chain gets at most (region - the smallest sizes of the others on its chain). A loop A < B < ... < A is impossible.
  //                The same budget holds for the two sides of any wall that compares sizes: the larger side of a differ-by-N wall (N = 0:
  //                same size, same shape) has at most (region + N) / 2 tiles.
  //   area-parity  differ-by-N walls: an odd N flips "even / odd number of tiles", an even N keeps it. Pieces that hang together through such
  //                walls form one parity class; a loop with an odd number of odd differences is impossible, and a piece that can only be even
  //                (or odd) pins the whole class.
  // ============================================================================================================
  const chainOn = relEdges.some(r => r.kind === 'lt' || r.kind === 'gt');
  const parityEdges = relEdges.filter(r => r.kind === 'diff');
  let bitsEven = 0n, bitsOdd = 0n;
  if(parityEdges.length > 0) for(let k = 0; k <= N + 2; k++){ if(k & 1) bitsOdd |= 1n << BigInt(k); else bitsEven |= 1n << BigInt(k); }
  const lowMask = k => (1n << BigInt(k + 1)) - 1n;                       // sizes 0..k
  function regionLabels(){                                               // region of every tile (closed in by walls), and the tiles of each
    const comp = new Int32Array(N).fill(-1), size = []; let k = 0;
    for(const start of activeIds){
      if(comp[start] >= 0) continue;
      const q = [start]; comp[start] = k;
      for(let qi = 0; qi < q.length; qi++) for(const { e, o } of adjE[q[qi]]){ if(e.state === 1 || comp[o] >= 0) continue; comp[o] = k; q.push(o); }
      size.push(q.length); k++;
    }
    return { comp, size };
  }
  // returns null = impossible (why is set), else true when some list of sizes got shorter
  function relExtra(dom, getDom, dmap){
    let changed = false;
    for(const d0 of dom.values()) if(d0 === 0n){ why = 'area-rel'; return null; }
    const setDom = (rep, d, tag) => { const old = getDom(rep); if(d === old) return true; if(d === 0n){ why = tag; return false; } dom.set(rep, d); changed = true; return true; };
    // ---- area-parity ----
    if(parityEdges.length > 0){
      const par = new Map();                                             // rep -> { root, flip } with path compression
      const findP = rep => {
        let p = par.get(rep); if(p === undefined){ p = { root: rep, flip: 0 }; par.set(rep, p); return p; }
        if(p.root === rep) return p;
        const q = findP(p.root); p.flip ^= q.flip; p.root = q.root; return p;
      };
      for(const re of parityEdges){
        const ra = find(re.a), rb = find(re.b); if(ra === rb) continue;
        const pa = findP(ra), pb = findP(rb), f = re.value & 1;
        if(pa.root === pb.root){ if((pa.flip ^ pb.flip) !== f){ why = 'area-parity'; return null; } continue; }
        // join the root of b under the root of a
        const rootA = pa.root, rootB = pb.root, g = pa.flip ^ pb.flip ^ f, eb = par.get(rootB);
        eb.root = rootA; eb.flip = g;
      }
      const classes = new Map();                                          // root -> allowed parity of the root (bit 0 = even, bit 1 = odd)
      for(const rep of [...par.keys()]){
        const p = findP(rep), d = getDom(rep);
        let allowed = 0;                                                  // parities this piece can still have
        if(d & bitsEven) allowed |= 1; if(d & bitsOdd) allowed |= 2;
        if(p.flip) allowed = ((allowed & 1) << 1) | ((allowed & 2) >> 1); // as seen from the root
        classes.set(p.root, (classes.has(p.root) ? classes.get(p.root) : 3) & allowed);
      }
      for(const v of classes.values()) if(v === 0){ why = 'area-parity'; return null; }
      for(const rep of [...par.keys()]){
        const p = findP(rep), a = classes.get(p.root); if(a === 3) continue;
        let want = p.flip ? ((a & 1) << 1) | ((a & 2) >> 1) : a;          // back to this piece
        const keep = (want & 1 ? bitsEven : 0n) | (want & 2 ? bitsOdd : 0n);
        if(!setDom(rep, getDom(rep) & keep, 'area-parity')) return null;
      }
    }
    // ---- area-chain: the tiles of the region ----
    if(!inProbe && (chainOn || parityEdges.length > 0)){
      const { comp, size } = regionLabels();
      const regOf = rep => comp[members.get(rep)[0]];
      const succ = new Map(), preds = new Map(), nodes = new Set();
      for(const re of relEdges){
        const ra = find(re.a), rb = find(re.b); if(ra === rb) continue;
        if(re.kind === 'diff'){                                           // pair budget: a different piece on the other side of the wall
          const R = size[regOf(ra)];
          if(regOf(ra) !== regOf(rb)) continue;
          const top = Math.floor((R + re.value) / 2);                     // bigger side m + N with 2m + N <= R
          for(const rep of [ra, rb]){ const d = getDom(rep); if(bitHi(d) > top && !setDom(rep, d & lowMask(top), 'area-chain')) return null; }
          continue;
        }
        const [lo, hi] = re.kind === 'lt' ? [ra, rb] : [rb, ra];          // lo < hi
        if(regOf(lo) !== regOf(hi)) continue;
        if(!succ.has(lo)) succ.set(lo, []); succ.get(lo).push(hi);
        if(!preds.has(hi)) preds.set(hi, []); preds.get(hi).push(lo);
        nodes.add(lo); nodes.add(hi);
      }
      if(nodes.size > 0){
        // topological order (a loop of < walls is impossible)
        const state = new Map(), order = [];
        const visit = v => {                                              // iterative DFS: 1 = on the stack, 2 = done
          const stack = [[v, 0]]; state.set(v, 1);
          while(stack.length){
            const top = stack[stack.length - 1], nx = succ.get(top[0]) || [];
            if(top[1] < nx.length){ const w = nx[top[1]++]; const s = state.get(w); if(s === 1) return false; if(s === undefined){ state.set(w, 1); stack.push([w, 0]); } }
            else { state.set(top[0], 2); order.push(top[0]); stack.pop(); }
          }
          return true;
        };
        for(const v of nodes) if(state.get(v) === undefined && !visit(v)){ why = 'area-chain'; return null; }
        order.reverse();                                                  // smallest first
        const lo = new Map(); for(const v of nodes) lo.set(v, bitLo(getDom(v)));
        const F = new Map(), B = new Map();
        for(const v of order){ let m = 0; for(const u of preds.get(v) || []) m = Math.max(m, F.get(u)); F.set(v, lo.get(v) + m); }
        for(let i = order.length - 1; i >= 0; i--){ const v = order[i]; let m = 0; for(const w of succ.get(v) || []) m = Math.max(m, B.get(w)); B.set(v, lo.get(v) + m); }
        for(const v of nodes){
          const R = size[regOf(v)], others = F.get(v) + B.get(v) - 2 * lo.get(v);   // the smallest sizes of the other pieces on its chain
          if(F.get(v) + B.get(v) - lo.get(v) > R){ why = 'area-chain'; return null; }
          const d = getDom(v), top = R - others;
          if(bitHi(d) > top && !setDom(v, d & lowMask(top), 'area-chain')) return null;
        }
      }
    }
    if(!inProbe && relEdges.length >= 2){ const hs = hallStep(getDom, setDom, dmap); if(hs === null) return null; if(hs) changed = true; }      // v30: pigeonhole / Hall
    return changed;
  }
  // ============================================================================================================
  // v30: PIGEONHOLE (the "not done" idea of v28 / v29). Everything here holds in EVERY valid tiling.
  // What is known about pieces inside ONE region closed in by walls (they share its tiles):
  //   - two sides of a wall that compares sizes are two different pieces; so are two groups with a decided wall / forbidden pair between them (dmap)
  //   - smaller / bigger (also through chains) and differ-by-N (N >= 1) say the SIZES differ, so those pieces are different pieces anyway
  //   - same size / same shape (differ-by-0) walls chain: A = B and B = C means A, B, C have ONE size (an "equal class")
  // From that:
  //   equal class    m of its pieces are known to be pairwise different pieces (a clique of walls): m * size <= the tiles of the region,
  //                  so the size is at most floor(region / m)
  //   all-different  a set of classes whose sizes are pairwise different (a clique of smaller / bigger / differ walls) takes pairwise different
  //                  sizes. Hall: k classes whose sizes together can only come from fewer than k values = impossible; exactly k values =
  //                  those values belong to them and are taken away from the others
  //   budget         the cheapest way to give the clique distinct sizes (class weight = its m pieces) must fit into the region: more than
  //                  the region has = impossible, and every class gets at most (region - the cheapest sizes of the others) / m
  //   conflict       a smaller / bigger / differ-by-N (N >= 1) wall between two pieces of ONE equal class
  // Tag: area-hall (RULE_TAGS / WHY_TEXT). Only top-level passes (`!inProbe`), like area-chain.
  // ============================================================================================================
  const HALL_MAX_K = 8;                                                    // classes per clique that get the exact subset table (2^8 = 256)
  const popBits = m => { let n = 0; while(m){ m &= m - 1n; n++; } return n; };
  function hallStep(getDom, setDom, dmap){
    const { comp, size } = regionLabels();
    const regOf = rep => comp[members.get(rep)[0]];
    // 1. equal classes (union-find over same-size walls inside one region)
    const par = new Map();
    const fnd = r => { let p = par.get(r); if(p === undefined || p === r) return r; p = fnd(p); par.set(r, p); return p; };
    const nodes = new Set(), edges = [];
    for(const re of relEdges){
      const ra = find(re.a), rb = find(re.b); if(ra === rb || regOf(ra) !== regOf(rb)) continue;
      nodes.add(ra); nodes.add(rb); edges.push({ ra, rb, kind: re.kind, value: re.value });
      if(re.kind === 'diff' && re.value === 0){ const x = fnd(ra), y = fnd(rb); if(x !== y) par.set(x, y); }
    }
    if(edges.length < 2) return false;
    const classes = new Map();                                              // class root -> reps
    for(const r of nodes){ const c = fnd(r); if(!classes.has(c)) classes.set(c, []); classes.get(c).push(r); }
    // 2. which classes differ in size (direct walls, and the closure of < walls); a differ wall inside one class is a conflict
    const cl = [...classes.keys()], idx = new Map(cl.map((c, i) => [c, i])), K = cl.length;
    const differ = Array.from({ length: K }, () => new Uint8Array(K)), less = Array.from({ length: K }, () => new Uint8Array(K));
    for(const { ra, rb, kind, value } of edges){
      const i = idx.get(fnd(ra)), j = idx.get(fnd(rb));
      if(kind === 'diff' && value === 0) continue;
      if(i === j){ why = 'area-hall'; return null; }
      differ[i][j] = differ[j][i] = 1;
      if(kind === 'lt') less[i][j] = 1; else if(kind === 'gt') less[j][i] = 1;
    }
    for(let k = 0; k < K; k++) for(let i = 0; i < K; i++) if(less[i][k]) for(let j = 0; j < K; j++) if(less[k][j]) less[i][j] = 1;
    for(let i = 0; i < K; i++){ if(less[i][i]){ why = 'area-hall'; return null; } for(let j = 0; j < K; j++) if(less[i][j]) differ[i][j] = differ[j][i] = 1; }
    // 3. weight of a class = the most of its pieces that are known pairwise different (greedy cliques), domain = what every piece of it can be
    const weight = new Array(K).fill(1), domOf = new Array(K);
    for(let i = 0; i < K; i++){
      const reps = classes.get(cl[i]); let d = -1n;
      for(const r of reps){ const x = getDom(r); d = d === -1n ? x : (d & x); }
      domOf[i] = d;
      const g = reps.length; if(g < 2) continue;
      let best = 1;
      for(let st = 0; st < Math.min(g, 8); st++){
        const cq = [reps[st]];
        for(let j = 0; j < g; j++){ if(j === st) continue; const r = reps[j]; if(cq.every(c => { const dm = dmap && dmap.get(c); return dm && dm.has(r); })) cq.push(r); }
        if(cq.length > best) best = cq.length;
      }
      weight[i] = best;
    }
    // 4. maximal cliques of "sizes differ" per region (Bron-Kerbosch, small graphs only)
    const byReg = new Map();
    for(let i = 0; i < K; i++){ const rg = regOf(classes.get(cl[i])[0]); if(!byReg.has(rg)) byReg.set(rg, []); byReg.get(rg).push(i); }
    let changed = false;
    const apply = (i, d, tag) => {                                          // narrow every piece of class i to d
      for(const r of classes.get(cl[i])){ const old = getDom(r), nd = old & d; if(nd !== old && !setDom(r, nd, tag)) return false; if(nd !== old) changed = true; }
      return true;
    };
    for(const [rg, list] of byReg){
      if(list.length > 40) continue;
      const R = size[rg], cliques = [];
      const bk = (Rr, P, X) => {
        if(cliques.length > 200) return;
        if(P.length === 0 && X.length === 0){ cliques.push(Rr); return; }
        for(const v of P.slice()){
          bk(Rr.concat(v), P.filter(u => differ[v][u]), X.filter(u => differ[v][u]));
          P.splice(P.indexOf(v), 1); X.push(v);
        }
      };
      bk([], list.slice(), []);
      for(const C of cliques){
        let wsum = 0; for(const i of C) wsum += weight[i];
        if(wsum <= 2 && C.length <= 2) continue;                           // pairs: the pair budget of area-chain already does this
        // equal-class cap: weight w of one class
        for(const i of C){
          const d = domOf[i], top = Math.floor(R / weight[i]);
          if(d === 0n){ why = 'area-hall'; return null; }
          if(bitHi(d) > top){ if(!apply(i, lowMask(top), 'area-hall')) return null; domOf[i] = domOf[i] & lowMask(top); if(domOf[i] === 0n){ why = 'area-hall'; return null; } }
        }
        if(C.length < 2) continue;
        if(C.length > HALL_MAX_K){                                          // too many for the subset table: the sum of the smallest sizes still bounds the region
          // (sizes of a clique are pairwise different: sort the lows and lift them to distinct values)
          const lows = C.map(i => ({ lo: bitLo(domOf[i]), w: weight[i] })).sort((a, b) => a.lo - b.lo); let prev = 0, tot = 0;
          for(const x of lows){ const v = Math.max(x.lo, prev + 1); tot += v * x.w; prev = v; }
          if(tot > R){ why = 'area-hall'; return null; }
          continue;
        }
        // Hall: subsets of the clique
        const k = C.length, D = C.map(i => domOf[i]);
        for(let T = 1; T < (1 << k); T++){
          let U = 0n, n = 0; for(let b = 0; b < k; b++) if(T & (1 << b)){ U |= D[b]; n++; }
          if(n < 2) continue;
          const pc = popBits(U);
          if(pc < n){ why = 'area-hall'; return null; }
          if(pc === n) for(let b = 0; b < k; b++) if(!(T & (1 << b)) && (D[b] & U) !== 0n){
            if(!apply(C[b], ~U, 'area-hall')) return null; D[b] &= ~U; if(D[b] === 0n){ why = 'area-hall'; return null; }
          }
        }
        for(let b = 0; b < k; b++) domOf[C[b]] = D[b];
        // budget: cheapest weighted assignment of distinct sizes (value-by-value table over subsets)
        let U = 0n; for(const d of D) U |= d;
        const top = Math.min(bitHi(U), R), FULL = (1 << k) - 1, INF = 1e9;
        let g = new Array(1 << k).fill(INF); g[0] = 0;
        for(let u = 1; u <= top; u++){
          const bu = 1n << BigInt(u); let any = false; for(let b = 0; b < k; b++) if(D[b] & bu){ any = true; break; }
          if(!any) continue;
          const ng = g.slice();
          for(let mask = 0; mask <= FULL; mask++){
            const gv = g[mask]; if(gv >= INF) continue;
            for(let b = 0; b < k; b++){
              if((mask & (1 << b)) || !(D[b] & bu)) continue;
              const c = gv + weight[C[b]] * u, nm = mask | (1 << b);
              if(c < ng[nm]) ng[nm] = c;
            }
          }
          g = ng;
        }
        if(g[FULL] > R){ why = 'area-hall'; return null; }
        for(let b = 0; b < k; b++){
          const rest = g[FULL & ~(1 << b)];
          if(rest >= INF){ why = 'area-hall'; return null; }
          const cap = Math.floor((R - rest) / weight[C[b]]);
          if(bitHi(D[b]) > cap){ if(!apply(C[b], lowMask(cap), 'area-hall')) return null; D[b] &= lowMask(cap); if(D[b] === 0n){ why = 'area-hall'; return null; } domOf[C[b]] = D[b]; }
        }
      }
    }
    return changed;
  }
  // ---- v62: sizes used up under Mismatch (see build/patch_core62.py) ----
  let scRegion = null;
  function sizeCountStep(dom, getDom, need, capOf, dmap){
    if(!scRegion){ const { comp } = regionLabels(); scRegion = comp; }
    const reg = scRegion;
    const known = rep => {                                                     // the one size the group can have, or 0
      const d = dom.get(rep);
      if(d !== undefined){ return d !== 0n && (d & (d - 1n)) === 0n ? bitLo(d) : 0; }
      const lo = need.get(rep), hi = capOf.get(rep); return lo === hi ? lo : 0;
    };
    const apart = (a, b, k) => {
      const dm = dmap.get(a); if(dm && dm.has(b)) return true;
      const ma = members.get(a), mb = members.get(b);
      if(ma.length + mb.length > k) return true;
      if(reg[ma[0]] !== reg[mb[0]]) return true;
      let gap = Infinity;                                                      // a piece holding both needs |a| + |b| + (gap - 1) tiles
      for(const p of ma){ const px = p % w, py = (p - px) / w; for(const q of mb){ const qx = q % w, d = Math.abs(px - qx) + Math.abs(py - (q - qx) / w); if(d < gap) gap = d; } }
      return ma.length + mb.length + gap - 1 > k;
    };
    let changed = false;
    const reps = [...members.keys()];
    for(let k = 1; k < mmQ.length; k++){
      if(!mmQ[k] && mmQ[k] !== 0) continue;
      const pinned = reps.filter(r => known(r) === k);
      if(pinned.length < mmQ[k]) continue;
      // the largest set of pairwise different pieces (exact for up to 24 pinned groups, else greedy)
      let set = [];
      if(pinned.length <= 24){
        const P = pinned.length, ap = Array.from({ length: P }, () => new Uint8Array(P));
        for(let i = 0; i < P; i++) for(let j = i + 1; j < P; j++) if(apart(pinned[i], pinned[j], k)) ap[i][j] = ap[j][i] = 1;
        const cur = []; let best = [];
        const rec = t => { if(cur.length > best.length) best = cur.slice(); if(best.length > mmQ[k]) return;
          for(let i = t; i < P; i++){ if(cur.length + (P - i) <= best.length) return; let ok = true; for(const c of cur) if(!ap[c][i]){ ok = false; break; } if(ok){ cur.push(i); rec(i + 1); cur.pop(); } } };
        rec(0); set = best.map(i => pinned[i]);
      } else for(const r of pinned){ let ok = true; for(const s of set) if(!apart(r, s, k)){ ok = false; break; } if(ok) set.push(r); }
      if(set.length > mmQ[k]){ why = 'mismatch-count'; return null; }
      if(set.length < mmQ[k]) continue;
      const inSet = new Set(set), bit = 1n << BigInt(k);
      for(const r of reps){
        if(inSet.has(r)) continue;
        let free = true; for(const s of set) if(!apart(r, s, k)){ free = false; break; }
        if(!free) continue;                                                    // could still be one of those pieces
        const d = getDom(r);
        if(d & bit){ const nd = d & ~bit; if(nd === 0n){ why = 'mismatch-count'; return null; } dom.set(r, nd); changed = true; }
      }
    }
    return changed;
  }
  function relStep(need, capOf, dmap){
    scRegion = null;
    const dom = new Map(), out = [];
    derived = new Map(); relRaised = new Set();
    const getDom = rep => {
      let d = dom.get(rep);
      if(d === undefined){
        d = ((1n << BigInt(capOf.get(rep) + 1)) - 1n) & ~((1n << BigInt(need.get(rep))) - 1n);
        if(relUsable !== null) d &= relUsable;
        dom.set(rep, d);
      }
      return d;
    };
    let extraDone = false;
    for(let outer = 0; outer < 8; outer++){                                    // v62: the sweeps, then the size count, again
    for(let sweep = 0; sweep < 60; sweep++){
      let changed = false;
      for(const re of relEdges){
        const ra = find(re.a), rb = find(re.b);
        if(ra === rb) continue;
        const A = getDom(ra), B = getDom(rb);
        const A2 = relPrune(A, B, re.kind, re.value, false); if(A2 !== A){ dom.set(ra, A2); changed = true; }
        const B2 = relPrune(B, dom.get(ra), re.kind, re.value, true); if(B2 !== B){ dom.set(rb, B2); changed = true; }
      }
      if(!changed){
        if(extraOn && !extraDone){ extraDone = true; const x = relExtra(dom, getDom, dmap); if(x === null) return null; if(x) changed = true; }
        if(!changed) break;
      }
    }
      if(!mmQ || opts.sizeCount === false) break;
      const sc = sizeCountStep(dom, getDom, need, capOf, dmap);
      if(sc === null) return null;
      if(!sc) break;
    }
    for(const [rep, d] of dom){
      if(d === 0n){ why = 'area-rel'; return null; }
      const lo = bitLo(d), hi = bitHi(d);
      if(lo > need.get(rep)){ need.set(rep, lo); relRaised.add(rep); }
      if(hi < capOf.get(rep)) capOf.set(rep, hi);
      if(lo === hi) derived.set(rep, lo);
    }
    // two groups that have no size in common can not be one piece
    for(const [rep, da] of dom){
      const na = members.get(rep).length;
      for(const id of members.get(rep)) for(const { e, o } of adjE[id]){
        if(e.state !== 0) continue;
        const rb = find(o); if(rb === rep) continue;
        let db = dom.get(rb);
        if(db === undefined) db = ((1n << BigInt(capOf.get(rb) + 1)) - 1n) & ~((1n << BigInt(need.get(rb))) - 1n);
        const m = na + members.get(rb).length;
        if((da & db & ~((1n << BigInt(m)) - 1n)) === 0n){ e.state = 1; out.push({ e, value: 'wall', rule: 'area-rel' }); }
      }
    }
    if(out.length === 0 && opts.regionMerge !== false && !searchLite && !inProbe){   // v66: region-merge (see build/patch_core66.py)
      const { comp, size } = regionLabels();
      const byReg = new Map();
      for(const [r, mem] of members){
        const g = comp[mem[0]]; let one = true; for(const id of mem) if(comp[id] !== g){ one = false; break; }
        if(!one || need.get(r) < 2) continue;
        if(!byReg.has(g)) byReg.set(g, []); byReg.get(g).push(r);
      }
      const isDiff = (a, b) => { const d = dmap.get(a); return !!(d && d.has(b)); };
      for(const [g, list0] of byReg){
        const C = list0.sort((x, y) => need.get(y) - need.get(x)).slice(0, 9), R = size[g], n = C.length;
        if(n < 2) continue;
        let tot = 0; for(const r of C) tot += need.get(r); if(tot <= R) continue;              // all apart fits: nothing to learn
        const idx = new Map(C.map((r, i) => [r, i]));
        const diff = Array.from({ length: n }, (_, i) => C.map((r, j) => i !== j && isDiff(C[i], r)));
        const lt = [];                                                                          // [i, j]: piece of i smaller than piece of j
        for(const re of relEdges){
          const i = idx.get(find(re.a)), j = idx.get(find(re.b)); if(i === undefined || j === undefined || i === j) continue;
          if(re.kind === 'lt') lt.push([i, j]); else if(re.kind === 'gt') lt.push([j, i]);
          diff[i][j] = diff[j][i] = true;
        }
        const apartOk = Array.from({ length: n }, () => new Uint8Array(n));
        const lab = new Int8Array(n); let feasible = 0;
        const check = k => {
          const lo = new Array(k).fill(0);
          for(let i = 0; i < n; i++) lo[lab[i]] = Math.max(lo[lab[i]], need.get(C[i]));
          for(let it = 0; it <= k; it++){
            let ch = false;
            for(const [i, j] of lt){ const u = lab[i], v = lab[j]; if(u === v) return false; if(lo[v] < lo[u] + 1){ lo[v] = lo[u] + 1; ch = true; } }
            if(!ch) break;
            if(it === k) return false;                                                          // a cycle of "smaller than"
          }
          let s = 0; for(const x of lo) s += x;
          return s <= R;
        };
        const rec = (i, k) => {
          if(i === n){
            if(!check(k)) return;
            feasible++;
            for(let x = 0; x < n; x++) for(let y = x + 1; y < n; y++) if(lab[x] !== lab[y]) apartOk[x][y] = 1;
            return;
          }
          for(let c = 0; c <= k; c++){
            let ok = true; for(let j = 0; j < i; j++) if(lab[j] === c && diff[i][j]){ ok = false; break; }
            if(!ok) continue;
            lab[i] = c; rec(i + 1, Math.max(k, c + 1));
          }
        };
        rec(0, 0);
        if(feasible === 0){ why = 'region-merge'; return null; }
        for(let x = 0; x < n; x++) for(let y = x + 1; y < n; y++){
          if(apartOk[x][y] || diff[x][y]) continue;
          union(C[x], C[y]);
          for(const e of spots) if(e.state === 0 && find(e.a) === find(e.b)){ e.state = 2; out.push({ e, value: 'same', rule: 'region-merge' }); }
          out.again = true;
          return out;
        }
      }
    }
    return out;
  }

  // ---- inference without search ----
  // an open spot inside one group is 'same'; an open spot between two groups that are already known to be
  // different (some wall runs between them) is 'wall'. Returns the list of spots it decided (each { e, value, rule? }), or null
  // when no tiling exists (a wall inside a group, a rose type twice in a piece, a stamp with nowhere to go ...).
  // ============================================================================================================
  // v32: BOXY and NON-BOXY. Everything here holds in EVERY valid tiling (never a guess), so it can only decide edges, never lose a
  // solution. Before v32 the two rules were only filters on whole pieces (size >= 3 for Non-boxy, "is it a rectangle?" in the search).
  //   Boxy (every piece is a rectangle)
  //     boxy-fill    a group of tiles known to be one piece lies in ONE rectangle, so its bounding rectangle is all one piece: every tile
  //                  and every edge inside it is linked. A hole, an inactive tile or a decided wall inside it = impossible (boxy-fit)
  //     boxy-corner  at every inner corner of the grid the walls run STRAIGHT: no wall ends in the open (1 wall), none turns a corner
  //                  (2 walls at a right angle); allowed are 0 walls, a straight line, a T (3) and a cross (4). Local arc consistency
  //                  over the 4 edges meeting there; an inactive tile counts as a wall on its two sides
  //     boxy-place   where can the rectangle of a group still go? Every rectangle that contains the group, has an allowed size and breaks
  //                  no decided fact is a candidate; what all candidates share is decided (like stamp-place). No candidate = impossible
  //     boxy-line    the same, when every size the piece may have is PRIME (or 1): a rectangle of a prime number of tiles is a 1 x n strip.
  //                  Also on the whole board: when every allowed piece size is prime / 1 no piece holds a 2 x 2 block, so the four
  //                  tiles round an inner corner are never all linked
  //   Non-boxy (no piece is a rectangle)
  //     (size >= 3 is in buildSolverContext: pieces of 1 or 2 tiles are rectangles)
  //     nonbox-grow  a group that is a rectangle so far (1 x n, or a block) is not a whole piece yet: with ONE way out left that edge can
  //                  not be a wall; with none the group is a finished rectangle = impossible. A rectangle that is already as big as the
  //                  piece may be = impossible (nonbox-fit)
  //     nonbox-region a region closed in by walls that is a straight line (every piece is a strip), or a rectangle too small to hold two
  //                  pieces (one piece = a rectangle) = impossible
  //   box-both     Boxy and Non-boxy together = impossible
  // Tags are in RULE_TAGS / WHY_TEXT; the page footer lists the two rules (build/improved_rules.json).
  // ============================================================================================================
  const boxOn = !!ctx.boxyRule, nbOn = !!ctx.nonBoxyRule;
  const primeOr1 = s => { if(s < 1) return false; if(s < 4) return true; if(s % 2 === 0) return false; for(let d = 3; d * d <= s; d += 2) if(s % d === 0) return false; return true; };
  const BOX_MAX_CAND = 240;                              // rectangles tried per group and pass (more = the group is skipped: always sound)
  const BOX_LEGAL = [];                                  // wall sets round an inner corner (bits N E S W) that a tiling by rectangles can have
  for(let m = 0; m < 16; m++){ let pc = 0; for(let i = 0; i < 4; i++) pc += (m >> i) & 1; BOX_LEGAL[m] = pc === 0 || pc >= 3 || m === 5 || m === 10; }
  const boxVerts = [];                                   // { seg: [N, E, S, W] edge or null (= a wall that is there anyway), full: all 4 tiles active }
  if(boxOn){
    const act = (c, r) => c >= 0 && r >= 0 && c < w && r < h && ctx.isActive(c, r);
    for(let y = 1; y < h; y++) for(let x = 1; x < w; x++){
      const tl = act(x - 1, y - 1), tr = act(x, y - 1), bl = act(x - 1, y), br = act(x, y);
      const seg = [tl && tr ? edgeByKey.get(`v:${x - 1},${y - 1}`) : null, tr && br ? edgeByKey.get(`h:${x},${y - 1}`) : null,
                   bl && br ? edgeByKey.get(`v:${x - 1},${y}`) : null, tl && bl ? edgeByKey.get(`h:${x - 1},${y - 1}`) : null];
      if(seg.every(e => !e)) continue;                    // four walls that are there anyway: a cross, always legal
      boxVerts.push({ seg: seg.map(e => e || null), full: tl && tr && bl && br });
    }
  }
  // every size a piece may have is prime (or 1): no piece is a 2 x 2 block
  function allSizesStrips(){
    const lo = ctx.sizeLo, hi = Math.min(ctx.sizeHi, ctx.totalActive);
    for(let s = lo; s <= hi; s++){
      if(rangeSet && !rangeSet.includes(s)) continue;
      if(sizeSet && !sizeSet.includes(s)) continue;
      if(!primeOr1(s)) return false;
    }
    return true;
  }
  function groupBox(mem){
    let x0 = w, x1 = -1, y0 = h, y1 = -1;
    for(let i = 0; i < mem.length; i++){ const x = mem[i] % w, y = (mem[i] - x) / w; if(x < x0) x0 = x; if(x > x1) x1 = x; if(y < y0) y0 = y; if(y > y1) y1 = y; }
    return { x0, x1, y0, y1, bw: x1 - x0 + 1, bh: y1 - y0 + 1 };
  }
  // boxy-corner (and boxy-line when it is the prime / strip fact that rules the all-open corner out)
  function cornerSets(v, noOpenCorner){
    const sg = v.seg;
    let anyWall = 0, anyOpen = 0, ok = false;
    for(let m = 0; m < 16; m++){
      if(!BOX_LEGAL[m] || (noOpenCorner && m === 0)) continue;
      let fit = true;
      for(let i = 0; i < 4; i++){
        const wall = (m >> i) & 1, e = sg[i];
        if(e === null){ if(!wall){ fit = false; break; } }
        else if(wall ? e.state === 2 : e.state === 1){ fit = false; break; }
      }
      if(!fit) continue;
      ok = true; anyWall |= m; anyOpen |= (~m) & 15;
    }
    return { ok, anyWall, anyOpen };
  }
  function boxCornerStep(strips){
    const out = [];
    for(const v of boxVerts){
      const sg = v.seg, st = strips && v.full;
      const A = cornerSets(v, st), B = st ? cornerSets(v, false) : A;
      if(!A.ok){ why = B.ok ? 'boxy-line' : 'boxy-corner'; return null; }
      for(let i = 0; i < 4; i++){
        const e = sg[i]; if(e === null || e.state !== 0) continue;
        const cw = (A.anyWall >> i) & 1, co = (A.anyOpen >> i) & 1;
        if(cw === co) continue;
        const sameAsBase = ((B.anyWall >> i) & 1) === cw && ((B.anyOpen >> i) & 1) === co;       // would the plain corner rule have decided it too?
        const tag = (st && !sameAsBase) ? 'boxy-line' : 'boxy-corner';
        if(cw){ e.state = 1; out.push({ e, value: 'wall', rule: tag }); }
        else { e.state = 2; union(e.a, e.b); out.push({ e, value: 'same', rule: tag }); }
      }
    }
    return out;
  }
  // boxy-fill: the bounding rectangle of every group is one piece
  function boxFillStep(){
    const out = [], link = [];
    for(const [rep, mem] of members){
      if(mem.length < 2) continue;
      const b = groupBox(mem);
      if(b.bw * b.bh === mem.length) continue;
      for(let y = b.y0; y <= b.y1; y++) for(let x = b.x0; x <= b.x1; x++) if(!ctx.isActive(x, y)){ why = 'boxy-fit'; return null; }
      for(let y = b.y0; y <= b.y1; y++) for(let x = b.x0; x <= b.x1; x++){
        for(const e of [x < b.x1 ? edgeByKey.get(`v:${x},${y}`) : null, y < b.y1 ? edgeByKey.get(`h:${x},${y}`) : null]){
          if(!e) continue;
          if(e.state === 1){ why = 'boxy-fit'; return null; }
          if(e.state === 0){ e.state = 2; link.push(e); out.push({ e, value: 'same', rule: 'boxy-fill' }); }
        }
      }
    }
    for(const e of link) union(e.a, e.b);
    return out;
  }
  // does the rectangle P (tile ids) still qualify as the whole piece of group `rep`? (like placementOk, plus the size)
  function boxPlacementOk(P, rep, dmap){
    markGen++;
    for(const id of P) markBuf[id] = markGen;
    const tally = new Map();
    for(const id of P){ const r = find(id); tally.set(r, (tally.get(r) || 0) + 1); }
    if(!tally.has(rep)) return false;
    const dm = dmap.get(rep);
    for(const [r, c] of tally){
      if(c !== members.get(r).length) return false;
      if(r !== rep && dm && dm.has(r)) return false;
    }
    for(const id of P) for(const { e, o } of adjE[id]){
      if(markBuf[o] === markGen){ if(e.state === 1) return false; }
      else if(e.state === 2) return false;
    }
    if(palOn && !palPlaceOk(P)) return false;                    // v35
    if(briOn && !briPlaceOk(P)) return false;                    // v36
    if(looOn && !looPlaceOk(P)) return false;                    // v37
    if(K > 0 && !roseUnbalanced && opts.boxFull !== false){       // v85b: a whole piece holds one of each rose type (Solitude: one symbol)
      let m = 0; for(const id of P) m |= roseMask[id];
      if(m !== FULL) return false;
    }
    const r = pieceInfo(P);
    return r !== null && r.need <= P.length && P.length <= r.cap;
  }
  // boxy-place / boxy-line: the rectangles that can still be the piece of each group
  function boxPlaceStep(need, capOf, dmap){
    const out = [], link = [];
    for(const [rep, mem] of members){
      const len = mem.length, b = groupBox(mem);
      if(b.bw * b.bh !== len) continue;                                        // (boxy-fill has just made every group a rectangle)
      const nd = Math.max(need.get(rep), len), cp = capOf.get(rep);
      if(cp < nd) continue;
      // v85a: a side of the box with a wall / empty tile / the board edge beyond some tile of it is a side of the rectangle
      let lockL = false, lockR = false, lockT = false, lockB = false;
      if(opts.boxLock !== false){
        const shut = (x, y, X, Y) => { if(X < 0 || Y < 0 || X >= w || Y >= h || !ctx.isActive(X, Y)) return true;
          const e = edgeByKey.get(x === X ? `h:${x},${Math.min(y, Y)}` : `v:${Math.min(x, X)},${y}`); return !e || e.state === 1; };
        for(let y = b.y0; y <= b.y1; y++){ if(!lockL && shut(b.x0, y, b.x0 - 1, y)) lockL = true; if(!lockR && shut(b.x1, y, b.x1 + 1, y)) lockR = true; }
        for(let x = b.x0; x <= b.x1; x++){ if(!lockT && shut(x, b.y0, x, b.y0 - 1)) lockT = true; if(!lockB && shut(x, b.y1, x, b.y1 + 1)) lockB = true; }
      }
      const dims = []; let total = 0, tooMany = false, primeAll = true;
      for(let s = nd; s <= cp && !tooMany; s++){
        if(sizeSet && !sizeSet.includes(s)) continue;
        if(rangeSet && !rangeSet.includes(s)) continue;
        if(!primeOr1(s)) primeAll = false;
        for(let W = Math.max(1, b.bw); W <= w && W <= s; W++){
          if(s % W !== 0) continue;
          const H = s / W; if(H < b.bh || H > h) continue;
          let lox = Math.max(0, b.x1 - W + 1), hix = Math.min(b.x0, w - W), loy = Math.max(0, b.y1 - H + 1), hiy = Math.min(b.y0, h - H);
          if(lockL) lox = Math.max(lox, b.x0);                                      // v85a
          if(lockR){ lox = Math.max(lox, b.x1 - W + 1); hix = Math.min(hix, b.x1 - W + 1); }
          if(lockT) loy = Math.max(loy, b.y0);
          if(lockB){ loy = Math.max(loy, b.y1 - H + 1); hiy = Math.min(hiy, b.y1 - H + 1); }
          if(hix < lox || hiy < loy) continue;
          total += (hix - lox + 1) * (hiy - loy + 1);
          if(total > BOX_MAX_CAND){ tooMany = true; break; }
          dims.push([W, H, lox, hix, loy, hiy]);
        }
      }
      if(tooMany) continue;
      const tag = primeAll ? 'boxy-line' : 'boxy-place';
      const V = [];
      for(const [W, H, lox, hix, loy, hiy] of dims) for(let ox = lox; ox <= hix; ox++) for(let oy = loy; oy <= hiy; oy++){
        const P = []; let ok = true;
        for(let yy = oy; yy < oy + H && ok; yy++) for(let xx = ox; xx < ox + W; xx++){ if(!ctx.isActive(xx, yy)){ ok = false; break; } P.push(cid(xx, yy)); }
        if(ok && boxPlacementOk(P, rep, dmap)) V.push(P);
      }
      if(V.length === 0){ why = tag; return null; }
      // tiles every candidate covers are in this piece
      for(const P of V) for(const id of P) cntBuf[id]++;
      const sure = V[0].filter(id => cntBuf[id] === V.length);
      for(const P of V) for(const id of P) cntBuf[id] = 0;
      for(const id of sure) for(const { e, o } of adjE[id]) if(e.state === 0 && sure.includes(o)){ e.state = 2; link.push(e); out.push({ e, value: 'same', rule: tag }); }
      // an edge that is a boundary of EVERY candidate is a wall
      for(const P of V){
        markGen++;
        for(const id of P) markBuf[id] = markGen;
        for(const id of P) for(const { e, o } of adjE[id]) if(markBuf[o] !== markGen) edgeCnt[e.idx]++;
      }
      for(const P of V) for(const id of P) for(const { e } of adjE[id]){
        const n = edgeCnt[e.idx];
        if(n === 0) continue;
        edgeCnt[e.idx] = 0;
        if(n === V.length && e.state === 0){ e.state = 1; out.push({ e, value: 'wall', rule: tag }); }
      }
    }
    for(const e of link) union(e.a, e.b);
    return out;
  }
  // ---- v69c: size cut (see build/patch_core69.py) ----
  const scTin = new Int32Array(N), scLow = new Int32Array(N), scSub = new Int32Array(N), scPar = new Int32Array(N);
  function sizeCutStep(){
    if(opts.sizeCut === false) return [];
    const s = ctx.sizeLo === ctx.sizeHi ? ctx.sizeLo : (matchRestrict && matchRestrict.length === 1 ? matchRestrict[0] : 0);
    if(!s || s < 2) return [];
    scTin.fill(-1); let t = 0; const out = [];
    for(const root of activeIds){
      if(scTin[root] >= 0) continue;
      // iterative DFS: tin, low, subtree size
      const stack = [[root, -1, 0]]; scTin[root] = scLow[root] = t++; scSub[root] = 1; scPar[root] = -1;
      while(stack.length){
        const top = stack[stack.length - 1], [v, pe] = top; const nb = adjE[v];
        if(top[2] < nb.length){
          const { e, o } = nb[top[2]++];
          if(e.state === 1 || e === pe) continue;
          if(scTin[o] < 0){ scTin[o] = scLow[o] = t++; scSub[o] = 1; scPar[o] = v; stack.push([o, e, 0]); }
          else if(scTin[o] < scLow[v]) scLow[v] = scTin[o];
        } else {
          stack.pop();
          const p = scPar[v];
          if(p >= 0){
            scSub[p] += scSub[v];
            if(scLow[v] < scLow[p]) scLow[p] = scLow[v];
            if(scLow[v] >= scTin[p]){                                         // v's subtree is cut off by p
              const P0 = scTin[v], P1 = scTin[v] + scSub[v], size = scSub[v], r = size % s;
              const into = []; let linked = false;
              for(const { e, o } of adjE[p]) if(scTin[o] >= P0 && scTin[o] < P1){ if(e.state === 2) linked = true; else if(e.state === 0) into.push(e); }
              if(r === 0){
                if(linked){ why = 'size-cut'; return null; }
                for(const e of into){ e.state = 1; out.push({ e, value: 'wall', rule: 'size-cut' }); }
              } else if(!linked){
                if(into.length === 0){ why = 'size-cut'; return null; }
                if(into.length === 1){ const e = into[0]; e.state = 2; union(e.a, e.b); out.push({ e, value: 'same', rule: 'size-cut' }); }
              }
              if(out.length) return out;
            }
          }
        }
      }
    }
    return out;
  }
  // ---- v64: gemini-place (see build/patch_core64.py) ----
  const gpOn = opts.gemPlace !== false && gdAll.length > 0;
  // every connected set of whole groups holding `rep`, size nd..cp (Redelmeier over groups); null = over budget
  function gpEnum(rep, mem, nd, cp, dmap){
    if(cp - mem.length > (opts.gemPlaceGrow || 8)) return null;
    const budget = opts.gemPlaceNodes || 20000; let nodes = 0, over = false;
    const dm = dmap.get(rep) || new Set();
    const nbrs = u => { const out = new Set(); for(const id of members.get(u)) for(const { e, o } of adjE[id]){ if(e.state === 1) continue; const r = find(o); if(r !== u) out.add(r); } return out; };
    const res = [];
    const report = units => {
      const P = []; for(const u of units) for(const id of members.get(u)) P.push(id);
      if(P.length < nd) return;
      if(sizeSet && !sizeSet.includes(P.length)) return;
      if(rangeSet && !rangeSet.includes(P.length)) return;
      if(!boxPlacementOk(P, rep, dmap)) return;
      res.push({ P, key: canonicalShapeKey(P.map(id => [id % w, (id - id % w) / w])) });
    };
    const rec = (units, size, untried, seen) => {
      if(over) return; if(++nodes > budget){ over = true; return; }
      report(units);
      for(let i = 0; i < untried.length; i++){
        const u = untried[i], su = members.get(u).length;
        if(size + su > cp) continue;
        const nSeen = new Set(seen), nU = untried.slice(i + 1);
        for(const v of nbrs(u)) if(!nSeen.has(v) && !dm.has(v)){ nSeen.add(v); nU.push(v); }
        units.push(u); rec(units, size + su, nU, nSeen); units.pop();
        if(over) return;
      }
    };
    const n0 = [...nbrs(rep)].filter(v => !dm.has(v));
    rec([rep], mem.length, n0, new Set([rep, ...n0]));
    return over ? null : res;
  }
  function gemPlaceStep(need, capOf, dmap){
    const lists = new Map();
    const listOf = r => {
      if(lists.has(r)) return lists.get(r);
      const mem = members.get(r), L = gpEnum(r, mem, Math.max(need.get(r), mem.length), capOf.get(r), dmap);
      lists.set(r, L); return L;
    };
    let changed = true, rounds = 0;
    const shrunk = new Set();
    while(changed && rounds++ < 6){
      changed = false;
      for(const g of gdAll){
        const ra = find(g.a), rb = find(g.b); if(ra === rb) continue;
        const LA = listOf(ra), LB = listOf(rb); if(!LA || !LB) continue;
        if(!LA.length || !LB.length){ why = 'gemini-place'; return null; }
        const SA = new Set(LA.map(v => v.key)), SB = new Set(LB.map(v => v.key));
        let NA = LA, NB = LB;
        if(g.gem){ NA = LA.filter(v => SB.has(v.key)); NB = LB.filter(v => SA.has(v.key)); }
        else { if(SA.size === 1){ const k = [...SA][0]; NB = LB.filter(v => v.key !== k); } if(SB.size === 1){ const k = [...SB][0]; NA = LA.filter(v => v.key !== k); } }
        if(!NA.length || !NB.length){ why = 'gemini-place'; return null; }
        if(NA.length !== LA.length){ lists.set(ra, NA); shrunk.add(ra); changed = true; }
        if(NB.length !== LB.length){ lists.set(rb, NB); shrunk.add(rb); changed = true; }
      }
    }
    const out = [], link = [];
    for(const r of shrunk){
      const V = lists.get(r).map(v => v.P);
      for(const P of V) for(const id of P) cntBuf[id]++;
      const sure = V[0].filter(id => cntBuf[id] === V.length);
      for(const P of V) for(const id of P) cntBuf[id] = 0;
      for(const id of sure) for(const { e, o } of adjE[id]) if(e.state === 0 && sure.includes(o)){ e.state = 2; link.push(e); out.push({ e, value: 'same', rule: 'gemini-place' }); }
      for(const P of V){ markGen++; for(const id of P) markBuf[id] = markGen; for(const id of P) for(const { e, o } of adjE[id]) if(markBuf[o] !== markGen) edgeCnt[e.idx]++; }
      for(const P of V) for(const id of P) for(const { e } of adjE[id]){
        const n = edgeCnt[e.idx]; if(n === 0) continue; edgeCnt[e.idx] = 0;
        if(n === V.length && e.state === 0){ e.state = 1; out.push({ e, value: 'wall', rule: 'gemini-place' }); }
      }
      if(out.length) break;
    }
    for(const e of link) union(e.a, e.b);
    return out;
  }
  // ---- v61: cmp-box (see build/patch_core61.py) ----
  const cbxOn = boxOn && hasCompass && opts.cmpBox !== false;
  function cmpBoxStep(dmap){
    const out = [], link = [];
    for(const [rep, mem] of members){
      const comps = [];
      for(const id of mem){ const x = id % w, y = (id - x) / w, cp = ctx.compasses.get(`${x},${y}`); if(cp) comps.push({ x, y, cp }); }
      if(!comps.length) continue;
      const c0 = comps[0], cp = c0.cp;
      if(cp.n == null && cp.s == null && cp.e == null && cp.w == null) continue;
      const b = groupBox(mem);
      const V = [];
      for(let W = Math.max(1, b.bw); W <= w; W++){
        let a = null, bb = null;
        if(cp.n != null){ if(cp.n % W) continue; a = cp.n / W; }
        if(cp.s != null){ if(cp.s % W) continue; bb = cp.s / W; }
        for(let H = Math.max(1, b.bh); H <= h; H++){
          let l = null, r = null;
          if(cp.w != null){ if(cp.w % H) continue; l = cp.w / H; }
          if(cp.e != null){ if(cp.e % H) continue; r = cp.e / H; }
          if(a !== null && bb !== null && a + bb + 1 !== H) continue;
          if(l !== null && r !== null && l + r + 1 !== W) continue;
          const aLo = a !== null ? a : (bb !== null ? H - 1 - bb : 0), aHi = a !== null ? a : (bb !== null ? H - 1 - bb : H - 1);
          const lLo = l !== null ? l : (r !== null ? W - 1 - r : 0), lHi = l !== null ? l : (r !== null ? W - 1 - r : W - 1);
          for(let aa = aLo; aa <= aHi; aa++) for(let ll = lLo; ll <= lHi; ll++){
            if(aa < 0 || ll < 0 || aa > H - 1 || ll > W - 1) continue;
            const ox = c0.x - ll, oy = c0.y - aa;
            if(ox < 0 || oy < 0 || ox + W > w || oy + H > h) continue;
            if(b.x0 < ox || b.x1 >= ox + W || b.y0 < oy || b.y1 >= oy + H) continue;
            // every other compass in the rectangle must fit too (with Solitude there is only one)
            let ok = true;
            for(const c of comps.slice(1)){
              const q = c.cp, A = c.y - oy, B = oy + H - 1 - c.y, Lq = c.x - ox, R = ox + W - 1 - c.x;
              if((q.n != null && q.n !== A * W) || (q.s != null && q.s !== B * W) || (q.w != null && q.w !== Lq * H) || (q.e != null && q.e !== R * H)){ ok = false; break; }
            }
            if(!ok) continue;
            const P = [];
            for(let yy = oy; yy < oy + H && ok; yy++) for(let xx = ox; xx < ox + W; xx++){ if(!ctx.isActive(xx, yy)){ ok = false; break; } P.push(cid(xx, yy)); }
            if(!ok) continue;
            // no other compass inside that its numbers rule out
            for(const id of P){ const x = id % w, y = (id - x) / w, q = ctx.compasses.get(`${x},${y}`); if(!q || find(id) === rep) continue;
              const A = y - oy, B = oy + H - 1 - y, Lq = x - ox, R = ox + W - 1 - x;
              if((q.n != null && q.n !== A * W) || (q.s != null && q.s !== B * W) || (q.w != null && q.w !== Lq * H) || (q.e != null && q.e !== R * H)){ ok = false; break; } }
            if(ok && boxPlacementOk(P, rep, dmap)) V.push(P);
            if(V.length > 2000) break;
          }
        }
      }
      if(V.length === 0){ why = 'cmp-box'; return null; }
      if(V.length > 2000) continue;
      for(const P of V) for(const id of P) cntBuf[id]++;
      const sure = V[0].filter(id => cntBuf[id] === V.length);
      for(const P of V) for(const id of P) cntBuf[id] = 0;
      for(const id of sure) for(const { e, o } of adjE[id]) if(e.state === 0 && sure.includes(o)){ e.state = 2; link.push(e); out.push({ e, value: 'same', rule: 'cmp-box' }); }
      for(const P of V){ markGen++; for(const id of P) markBuf[id] = markGen; for(const id of P) for(const { e, o } of adjE[id]) if(markBuf[o] !== markGen) edgeCnt[e.idx]++; }
      for(const P of V) for(const id of P) for(const { e } of adjE[id]){
        const n = edgeCnt[e.idx]; if(n === 0) continue; edgeCnt[e.idx] = 0;
        if(n === V.length && e.state === 0){ e.state = 1; out.push({ e, value: 'wall', rule: 'cmp-box' }); }
      }
      if(out.length) break;
    }
    for(const e of link) union(e.a, e.b);
    return out;
  }
  // ---- v59: box-hall (see build/patch_core59.py) ----
  function boxCands(rep, mem, need, capOf, dmap){
    const len = mem.length, b = groupBox(mem);
    if(b.bw * b.bh !== len) return null;
    const nd = Math.max(need.get(rep), len), cp = capOf.get(rep);
    if(cp < nd) return [];
    const V = []; let total = 0;
    for(let s = nd; s <= cp; s++){
      if(sizeSet && !sizeSet.includes(s)) continue;
      if(rangeSet && !rangeSet.includes(s)) continue;
      for(let W = Math.max(1, b.bw); W <= w && W <= s; W++){
        if(s % W !== 0) continue;
        const H = s / W; if(H < b.bh || H > h) continue;
        const lox = Math.max(0, b.x1 - W + 1), hix = Math.min(b.x0, w - W), loy = Math.max(0, b.y1 - H + 1), hiy = Math.min(b.y0, h - H);
        if(hix < lox || hiy < loy) continue;
        total += (hix - lox + 1) * (hiy - loy + 1);
        if(total > (opts.boxHallCand || 4000)) return null;
        for(let ox = lox; ox <= hix; ox++) for(let oy = loy; oy <= hiy; oy++){
          const P = []; let ok = true;
          for(let yy = oy; yy < oy + H && ok; yy++) for(let xx = ox; xx < ox + W; xx++){ if(!ctx.isActive(xx, yy)){ ok = false; break; } P.push(cid(xx, yy)); }
          if(ok && boxPlacementOk(P, rep, dmap)) V.push({ P, key: Math.min(W, H) * 1000 + Math.max(W, H) });
        }
      }
    }
    return V;
  }
  // ---- v60: mismatch-hall (see build/patch_core60.py): every free polyomino of the allowed sizes ----
  const mhLo = Math.max(1, ctx.sizeLo), mhHi = ctx.sizeHi;
  const mhOn = !!ctx.mismatchRule && !boxOn && opts.mismatchHall !== false && mhHi <= (opts.mismatchHallMaxSize || 7) && (() => {
    let c = 0; for(let k = mhLo; k <= mhHi; k++) c += k < FREE_POLY_COUNT.length ? FREE_POLY_COUNT[k] : Infinity;
    return c <= (opts.mismatchHallShapes || 170); })();
  let mhShapes = null;                                   // [{ key: index, size, ors: [[ [x, y] ]] }]
  function mhPrepare(){
    const fixedBy = new Map();                           // canonical (free) key -> Map(normalised fixed key -> cells)
    let level = [[[0, 0]]];
    const norm = cells => { const mx = Math.min(...cells.map(q => q[0])), my = Math.min(...cells.map(q => q[1])); return cells.map(([x, y]) => [x - mx, y - my]).sort((p, q) => p[1] - q[1] || p[0] - q[0]); };
    for(let n = 1; n <= mhHi; n++){
      const next = new Map();
      for(const cells of level){
        if(n >= mhLo){ const k = canonicalShapeKey(cells); if(!fixedBy.has(k)) fixedBy.set(k, new Map()); fixedBy.get(k).set(JSON.stringify(cells), cells); }
        if(n === mhHi) continue;
        for(const [x, y] of cells) for(const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]){
          const q = [x + dx, y + dy]; if(cells.some(c => c[0] === q[0] && c[1] === q[1])) continue;
          const nc = norm(cells.concat([q])), nk = JSON.stringify(nc); if(!next.has(nk)) next.set(nk, nc);
        }
      }
      level = [...next.values()];
    }
    mhShapes = [...fixedBy.values()].map((m, i) => { const ors = [...m.values()]; return { key: i, size: ors[0].length, ors }; });
  }
  function polyCands(rep, mem, need, capOf, dmap){
    if(mhShapes === null) mhPrepare();
    const nd = Math.max(need.get(rep), mem.length), cp = capOf.get(rep);
    const V = [], seen = new Set(), x0 = mem[0] % w, y0 = (mem[0] - x0) / w;
    let tried = 0;
    for(const S of mhShapes){
      if(S.size < nd || S.size > cp) continue;
      if(sizeSet && !sizeSet.includes(S.size)) continue;
      if(rangeSet && !rangeSet.includes(S.size)) continue;
      for(const o of S.ors) for(const [ax, ay] of o){                 // put cell (ax, ay) of the shape on the group's first tile
        if(++tried > (opts.boxHallCand || 4000)) return null;
        const P = []; let ok = true;
        for(const [x, y] of o){ const X = x - ax + x0, Y = y - ay + y0; if(X < 0 || Y < 0 || X >= w || Y >= h || !ctx.isActive(X, Y)){ ok = false; break; } P.push(cid(X, Y)); }
        if(!ok) continue;
        markGen++; for(const id of P) markBuf[id] = markGen;
        for(const id of mem) if(markBuf[id] !== markGen){ ok = false; break; }
        if(!ok) continue;
        const sk = P.slice().sort((a, b) => a - b).join(','); if(seen.has(sk)) continue; seen.add(sk);
        if(boxPlacementOk(P, rep, dmap)) V.push({ P, key: S.key });
      }
    }
    return V;
  }
  // v63: per-tile cache of placement lists (see build/patch_core63.py)
  let hallCache = new Map(), hallCacheGen = 0;                        // tag -> Map(tile id -> list)
  function hallCands(candFn, tag, rep, mem, need, capOf, dmap){
    if(opts.hallCache === false) return candFn(rep, mem, need, capOf, dmap);
    let C = hallCache.get(tag); if(!C){ C = new Map(); hallCache.set(tag, C); }
    let best = null;
    for(const id of mem){ const L = C.get(id); if(L && (best === null || L.length < best.length)) best = L; }
    let V;
    if(best){
      const nd = Math.max(need.get(rep), mem.length), cp = capOf.get(rep);
      V = [];
      for(const v of best){
        const n = v.P.length;
        if(n < nd || n > cp) continue;
        if(sizeSet && !sizeSet.includes(n)) continue;
        if(rangeSet && !rangeSet.includes(n)) continue;
        markGen++; for(const id of v.P) markBuf[id] = markGen;
        let all = true; for(const id of mem) if(markBuf[id] !== markGen){ all = false; break; }
        if(all && boxPlacementOk(v.P, rep, dmap)) V.push(v);
      }
    } else {
      V = candFn(rep, mem, need, capOf, dmap);
      if(V === null) return null;
    }
    for(const id of mem) C.set(id, V);
    hallCacheGen++;
    return V;
  }
  function hallStore(tag, g){
    const C = hallCache.get(tag); if(!C || opts.hallCache === false) return;
    for(const id of g.mem) C.set(id, g.V);
    hallCacheGen++;
  }
  function boxHallStep(need, capOf, dmap, candFn, tag){
    candFn = candFn || boxCands; tag = tag || 'box-hall';
    const G = [], gOf = new Map();
    for(const [rep, mem] of members){
      const V = hallCands(candFn, tag, rep, mem, need, capOf, dmap);
      if(V === null) continue;
      if(V.length === 0){ why = tag; return null; }
      const g = { rep, mem, V, n0: V.length }; G.push(g); gOf.set(rep, g);
    }
    const acMax = opts.boxHallAC || 300;
    for(let round = 0; round < 8; round++){
      let changed = false;
      // (1) a rectangle that leaves a neighbouring group no rectangle outside it is impossible
      for(const g of G){
        if(g.V.length > acMax) continue;
        const keep = [];
        for(const v of g.V){
          markGen++; for(const id of v.P) markBuf[id] = markGen;
          let ok = true; const seen = new Set();
          for(const id of v.P){ for(const { o } of adjE[id]){
            if(markBuf[o] === markGen) continue;
            const r = find(o); if(seen.has(r)) continue; seen.add(r);
            const hg = gOf.get(r); if(!hg || hg.V.length > acMax) continue;
            let any = false; for(const q of hg.V){ if(q.key === v.key) continue; let hit = false; for(const t of q.P) if(markBuf[t] === markGen){ hit = true; break; } if(!hit){ any = true; break; } }
            if(!any){ ok = false; break; } } if(!ok) break; }
          if(ok) keep.push(v);
        }
        if(keep.length !== g.V.length){ if(keep.length === 0){ why = tag; return null; } g.V = keep; changed = true; }
      }
      // (2) Hall: k groups that can never be one piece and only k shapes between them take those shapes
      for(const g of G) g.shapes = new Set(g.V.map(v => v.key));
      const small = G.filter(g => g.shapes.size <= 4).slice(0, 40), S = small.length;
      const canShare = (g1, g2) => {
        const dm = dmap.get(g1.rep); if(dm && dm.has(g2.rep)) return false;
        for(const v of g1.V) for(const id of v.P) if(find(id) === g2.rep) return true;
        return false;
      };
      const apart = Array.from({ length: S }, () => new Uint8Array(S));
      for(let i = 0; i < S; i++) for(let j = i + 1; j < S; j++) if(!canShare(small[i], small[j]) && !canShare(small[j], small[i])) apart[i][j] = apart[j][i] = 1;
      const unions = new Map();
      for(let i = 0; i < S; i++){ const k = [...small[i].shapes].sort((a, b) => a - b).join(','); if(!unions.has(k)) unions.set(k, small[i].shapes); }
      const us = [...unions.values()];
      for(let i = 0; i < us.length; i++) for(let j = i + 1; j < us.length; j++){
        const u = new Set([...us[i], ...us[j]]); if(u.size > 6) continue;
        const k = [...u].sort((a, b) => a - b).join(','); if(!unions.has(k)) unions.set(k, u);
      }
      for(const U of unions.values()){
        const inside = [];
        for(let i = 0; i < S; i++){ let ok = true; for(const x of small[i].shapes) if(!U.has(x)){ ok = false; break; } if(ok) inside.push(i); }
        if(inside.length < U.size) continue;
        const cand = inside.slice(0, 12); let best = [];
        const rec = (k, cur) => {
          if(cur.length > best.length) best = cur.slice();
          if(best.length > U.size) return;
          for(let t = k; t < cand.length; t++){ let ok = true; for(const c of cur) if(!apart[c][cand[t]]){ ok = false; break; } if(ok){ cur.push(cand[t]); rec(t + 1, cur); cur.pop(); } }
        };
        rec(0, []);
        if(best.length > U.size){ why = tag; return null; }
        if(best.length !== U.size) continue;
        const famReps = new Set(best.map(i => small[i].rep));
        for(const g of G){
          if(famReps.has(g.rep)) continue;
          const keep = g.V.filter(v => !U.has(v.key) || v.P.some(id => famReps.has(find(id))));
          if(keep.length === g.V.length) continue;
          if(keep.length === 0){ why = tag; return null; }
          g.V = keep; changed = true;
        }
      }
      if(!changed) break;
    }
    const out = [], link = [];
    for(const g of G) if(g.V.length !== g.n0) hallStore(tag, g);              // v63: the rounds' removals are facts of this state
    for(const g of G){
      if(g.V.length === g.n0) continue;
      const V = g.V.map(v => v.P);
      for(const P of V) for(const id of P) cntBuf[id]++;
      const sure = V[0].filter(id => cntBuf[id] === V.length);
      for(const P of V) for(const id of P) cntBuf[id] = 0;
      for(const id of sure) for(const { e, o } of adjE[id]) if(e.state === 0 && sure.includes(o)){ e.state = 2; link.push(e); out.push({ e, value: 'same', rule: tag }); }
      for(const P of V){ markGen++; for(const id of P) markBuf[id] = markGen; for(const id of P) for(const { e, o } of adjE[id]) if(markBuf[o] !== markGen) edgeCnt[e.idx]++; }
      for(const P of V) for(const id of P) for(const { e } of adjE[id]){
        const n = edgeCnt[e.idx]; if(n === 0) continue; edgeCnt[e.idx] = 0;
        if(n === V.length && e.state === 0){ e.state = 1; out.push({ e, value: 'wall', rule: tag }); }
      }
    }
    for(const e of link) union(e.a, e.b);
    return out;
  }
  // v73b: box-all. Every rectangle of boxAll is used exactly once: each needs a place (see patch_core73.py)
  function boxAnyOk(P, dmap){
    markGen++;
    for(const id of P) markBuf[id] = markGen;
    const tally = new Map();
    for(const id of P){ const r = find(id); tally.set(r, (tally.get(r) || 0) + 1); }
    for(const [r, c] of tally){
      if(c !== members.get(r).length) return false;
      const dm = dmap.get(r); if(dm) for(const r2 of tally.keys()) if(r2 !== r && dm.has(r2)) return false;
    }
    for(const id of P) for(const { e, o } of adjE[id]){
      if(markBuf[o] === markGen){ if(e.state === 1) return false; }
      else if(e.state === 2) return false;
    }
    if(palOn && !palPlaceOk(P)) return false;
    if(briOn && !briPlaceOk(P)) return false;
    if(looOn && !looPlaceOk(P)) return false;
    const r = pieceInfo(P);
    return r !== null && r.need <= P.length && P.length <= r.cap;
  }
  function boxAllStep(dmap){
    const L = [];
    for(const R of boxAll){
      const list = [];
      for(const [W, H] of R.a === R.b ? [[R.a, R.b]] : [[R.a, R.b], [R.b, R.a]]){
        if(W > w || H > h) continue;
        for(let y0 = 0; y0 + H <= h; y0++) for(let x0 = 0; x0 + W <= w; x0++){
          const P = []; let ok = true;
          for(let y = y0; y < y0 + H && ok; y++) for(let x = x0; x < x0 + W; x++){ if(!ctx.isActive(x, y)){ ok = false; break; } P.push(cid(x, y)); }
          if(ok && boxAnyOk(P, dmap)) list.push(P);
        }
      }
      if(list.length === 0){ why = 'box-all'; return null; }
      L.push(list);
    }
    const S = L.length, owner = new Int32Array(N), core = new Array(S);
    for(let round = 0; round < 30; round++){
      let changed = false;
      // tiles every placement of a shape covers (that shape's core)
      for(let s = 0; s < S; s++){
        for(const P of L[s]) for(const id of P) cntBuf[id]++;
        core[s] = L[s][0].filter(id => cntBuf[id] === L[s].length);
        for(const P of L[s]) for(const id of P) cntBuf[id] = 0;
      }
      // a placement over another shape's core goes
      owner.fill(-1);
      for(let s = 0; s < S; s++) for(const id of core[s]){ if(owner[id] >= 0 && owner[id] !== s){ why = 'box-all'; return null; } owner[id] = s; }
      for(let s = 0; s < S; s++){
        const keep = L[s].filter(P => P.every(id => owner[id] < 0 || owner[id] === s));
        if(keep.length !== L[s].length){ if(keep.length === 0){ why = 'box-all'; return null; } L[s] = keep; changed = true; }
      }
      // a tile only one shape can cover takes that shape
      const only = new Int32Array(N).fill(-1), many = new Uint8Array(N);
      for(let s = 0; s < S; s++){ markGen++; for(const P of L[s]) for(const id of P){ if(markBuf[id] === markGen) continue; markBuf[id] = markGen; if(only[id] === -1) only[id] = s; else if(only[id] !== s) many[id] = 1; } }
      for(const id of activeIds){
        if(only[id] === -1){ why = 'box-all'; return null; }
        if(many[id]) continue;
        const s = only[id], keep = L[s].filter(P => P.includes(id));
        if(keep.length !== L[s].length){ if(keep.length === 0){ why = 'box-all'; return null; } L[s] = keep; changed = true; }
      }
      if(!changed) break;
    }
    // edges: count the placements holding each tile, and both tiles of each edge
    const tileCnt = new Int32Array(N), both = new Int32Array(edges.length);
    for(let s = 0; s < S; s++) for(const P of L[s]){
      markGen++; for(const id of P) markBuf[id] = markGen;
      for(const id of P){ tileCnt[id]++; for(const { e, o } of adjE[id]) if(o > id && markBuf[o] === markGen) both[e.idx]++; }
    }
    const out = [], link = [];
    for(const e of spots){
      if(e.state !== 0) continue;
      const n = both[e.idx];
      if(n === 0){ e.state = 1; out.push({ e, value: 'wall', rule: 'box-all' }); }
      else if(n === tileCnt[e.a] || n === tileCnt[e.b]){ e.state = 2; link.push(e); out.push({ e, value: 'same', rule: 'box-all' }); }
    }
    for(const e of link) union(e.a, e.b);
    return out;
  }
  // Non-boxy: nonbox-grow (groups) and nonbox-region (regions closed in by walls)
  function nonBoxStep(need, capOf){
    const out = [];
    for(const [rep, mem] of members){
      const len = mem.length;
      if(len < need.get(rep)) continue;                                        // still smaller than the size rules ask: min-grow / reach deal with it
      const b = groupBox(mem);
      if(b.bw * b.bh !== len) continue;                                        // not a rectangle any more: nothing to say
      if(capOf.get(rep) <= len){ why = 'nonbox-fit'; return null; }
      let cnt = 0, only = null;
      for(const id of mem) for(const { e, o } of adjE[id]) if(e.state === 0 && find(o) !== rep){ cnt++; only = e; }
      if(cnt === 0){ why = 'nonbox-grow'; return null; }
      if(cnt === 1){ only.state = 2; union(only.a, only.b); out.push({ e: only, value: 'same', rule: 'nonbox-grow' }); return out; }
    }
    if(!inProbe){
      for(const tiles of openRegions()){
        const b = groupBox(tiles);
        if(b.bw === 1 || b.bh === 1 || (b.bw * b.bh === tiles.length && tiles.length < 2 * ctx.sizeLo)){ why = 'nonbox-region'; return null; }
      }
    }
    return out;
  }
  function boxStep(need, capOf, dmap){
    if(boxOn){
      const strips = allSizesStrips();
      const c1 = boxCornerStep(strips);
      if(c1 === null) return null;
      if(c1.length > 0) return c1;
      const f = boxFillStep();
      if(f === null) return null;
      if(f.length > 0) return f;
      if(cbxOn && !searchLite){ const cb = cmpBoxStep(dmap); if(cb === null) return null; if(cb.length > 0) return cb; }    // v61
      const p = searchLite ? [] : boxPlaceStep(need, capOf, dmap);
      if(p === null) return null;
      if(p.length > 0) return p;
      if(boxAll && !searchLite && (!inProbe || opts.boxAllProbe !== false)){ const ba = boxAllStep(dmap); if(ba === null) return null; if(ba.length > 0) return ba; }   // v73b
      if(ctx.mismatchRule && opts.boxHall !== false && !inProbe && !searchLite){ const bh = boxHallStep(need, capOf, dmap); if(bh === null) return null; if(bh.length > 0) return bh; }   // v59
    }
    if(nbOn) return nonBoxStep(need, capOf);
    return [];
  }

  // ============================================================================================================
  // v33: WATCHTOWERS and the SHAPE BANK. Everything here holds in EVERY valid tiling (never a guess), so it can only decide edges,
  // never lose a solution. Before v33 a watchtower was only checked by the search (vertexOk) and the bank only through `pieceInfo`
  // (a group must still fit inside some shape) -- the propagation had nothing to say about either.
  //   Watchtower N at a grid corner: exactly N different pieces among the ACTIVE tiles round it (1..4 tiles; 2 on the outline, 1 at an
  //   outer corner, 3 at a notch). The tiles are looked at as a partition: which of them share a piece. Every partition that has N
  //   classes, does not cross itself (planar: {TL,BR} and {TR,BL} can not both be pieces), agrees with every decided edge / group /
  //   known-different pair and is not a "wrap" that no piece can make, is kept. What all kept partitions agree on is decided:
  //     tower-count  no partition is left (N bigger than the number of active tiles, or the decided walls / links rule every one out)
  //     tower-link   the two tiles are in the same piece in every partition: the edge between them is a link
  //     tower-wall   they are in different pieces in every partition: the edge is a wall. (N = number of active tiles: all of them differ,
  //                  also the two that touch only at the corner: a static `forbidden` pair, tag tower-wall)
  //     tower-wrap   the decision needs the wrap rule: two tiles that touch only at the corner (or only through a missing tile) can be
  //                  one piece only if that piece goes ROUND the corner, round a whole other tile: at least 7 tiles, and only through open
  //                  edges. When no piece can be that big (size limits, area numbers, bank) or there is no way round, they are not.
  //   Shape bank (the shapes are the only shapes a piece may have; stamps add their own shape):
  //     bank-count   (static, in buildSolverContext) the sizes of the bank's shapes are the only sizes a piece may have: the board must be
  //                  covered by pieces of those sizes (like Minimum / Maximum / Precision, but with holes); a size that occurs in no cover is
  //                  removed. bank-region is the same for a region closed in by walls (tag of the range-region steps when the bank is what
  //                  narrowed the sizes)
  //     bank-place   where can the piece of a group still go? Every placement of a bank shape (every turn / flip) that holds the group,
  //                  fits the grid and breaks no decided fact is a candidate; what all share is decided (tiles linked, edge on the boundary
  //                  of every candidate = wall). None left = impossible. Skipped when there are too many candidates (BANK_MAX_CAND), and inside probes
  //     bank-block   every shape of the bank holds a 2x2 block, so every piece does: a tile with no open 2x2 block near enough (a piece is
  //                  4 + the steps to the block tiles big) is impossible
  //     bank-bend    every shape of the bank has a bend (no straight strip, no single tile): the same with 3 tiles of an L
  // Tags are in RULE_TAGS / WHY_TEXT; the page footer lists the two rules (build/improved_rules.json).
  // ============================================================================================================
  const towerList = [];
  if(ctx.watchtowers && ctx.watchtowers.size > 0){
    for(const [key, T] of ctx.watchtowers){
      const [vx, vy] = key.split(',').map(Number);
      const pos = [[vx - 1, vy - 1], [vx, vy - 1], [vx, vy], [vx - 1, vy]];            // TL TR BR BL (clockwise)
      const ids = pos.map(([c, r]) => (c >= 0 && r >= 0 && c < w && r < h && ctx.isActive(c, r)) ? cid(c, r) : -1);
      const keys = [`v:${vx - 1},${vy - 1}`, `h:${vx},${vy - 1}`, `v:${vx - 1},${vy}`, `h:${vx - 1},${vy - 1}`];   // edge i joins corner i and corner i+1
      const seg = keys.map((k, i) => (ids[i] >= 0 && ids[(i + 1) % 4] >= 0) ? (edgeByKey.get(k) || null) : null);
      const act = []; for(let i = 0; i < 4; i++) if(ids[i] >= 0) act.push(i);
      towerList.push({ T, ids, seg, act });
    }
  }
  const towerOn = towerList.length > 0;
  // all set partitions of k tiles (restricted growth strings): PARTS[k] = [{ lab, n }]
  const PARTS = [[], [], [], [], []];
  for(let k = 1; k <= 4; k++){
    const rec = (lab, mx) => {
      if(lab.length === k){ PARTS[k].push({ lab: lab.slice(), n: mx + 1 }); return; }
      for(let c = 0; c <= mx + 1; c++){ lab.push(c); rec(lab, Math.max(mx, c)); lab.pop(); }
    };
    rec([0], 0);
  }
  // tiles on the shortest way from one of `from` to one of `to` through open edges, not through `blocked` tiles / groups; Infinity = no way
  function towerWay(from, to, blockedTiles, blockedReps){
    const dist = new Map(); const q = [];
    for(const id of from){ dist.set(id, 1); q.push(id); }
    const goal = new Set(to);
    for(let qi = 0; qi < q.length; qi++){
      const id = q[qi];
      if(goal.has(id) && !from.includes(id)) return dist.get(id);
      for(const { e, o } of adjE[id]){
        if(e.state === 1 || dist.has(o) || blockedTiles.has(o)) continue;
        if(!goal.has(o) && blockedReps.has(find(o))) continue;
        dist.set(o, dist.get(id) + 1); q.push(o);
      }
    }
    return Infinity;
  }
  function towerStep(capOf, dmap){
    const out = [], link = [];
    for(const tw of towerList){
      const { T, ids, seg, act } = tw, k = act.length;
      if(T > k || T < 1){ why = 'tower-count'; return null; }
      const reps = act.map(p => find(ids[p]));
      const cycE = [];                                                                // decided / open edges between corners that are both active
      for(let i = 0; i < 4; i++) if(seg[i]) cycE.push({ e: seg[i], i: act.indexOf(i), j: act.indexOf((i + 1) % 4) });
      const A = [], B = [];                                                           // A: kept with the wrap rule, B: kept ignoring it
      for(const pt of PARTS[k]){
        if(pt.n !== T) continue;
        const lab = pt.lab;
        if(k === 4 && lab[0] === lab[2] && lab[1] === lab[3] && lab[0] !== lab[1]) continue;     // crossing: planar pieces can not do that
        let ok = true;
        for(let i = 0; i < k && ok; i++) for(let j = i + 1; j < k; j++){
          if(reps[i] === reps[j]){ if(lab[i] !== lab[j]){ ok = false; break; } }
          else if(lab[i] === lab[j]){ const d = dmap.get(reps[i]); if(d && d.has(reps[j])){ ok = false; break; } }
        }
        if(!ok) continue;
        for(const { e, i, j } of cycE){
          if(e.state === 1 ? lab[i] === lab[j] : (e.state === 2 && lab[i] !== lab[j])){ ok = false; break; }
        }
        if(!ok) continue;
        B.push(pt);
        // wrap: a class whose tiles are not all joined by the edges between neighbouring corners has to be connected the long way round
        let wrapOk = true;
        for(let c = 0; c < pt.n && wrapOk; c++){
          const mem = []; for(let i = 0; i < k; i++) if(lab[i] === c) mem.push(i);
          if(mem.length < 2) continue;
          const compOf = new Map(); const comps = [];
          for(const i of mem){
            if(compOf.has(i)) continue;
            const comp = [i]; compOf.set(i, comps.length);
            for(let qi = 0; qi < comp.length; qi++){
              for(const { i: a, j: b } of cycE){ const o = a === comp[qi] ? b : b === comp[qi] ? a : -1; if(o >= 0 && lab[o] === c && !compOf.has(o)){ compOf.set(o, comps.length); comp.push(o); } }
            }
            comps.push(comp);
          }
          if(comps.length < 2) continue;
          let cap = Infinity; for(const i of mem) cap = Math.min(cap, capOf.get(reps[i]));
          const blockedTiles = new Set(), blockedReps = new Set();
          for(let i = 0; i < k; i++) if(lab[i] !== c){ blockedTiles.add(ids[act[i]]); blockedReps.add(reps[i]); }
          for(const i of mem){ const d = dmap.get(reps[i]); if(d) for(const r of d) blockedReps.add(r); }
          for(let x = 0; x < comps.length && wrapOk; x++) for(let y = x + 1; y < comps.length; y++){
            const way = towerWay(comps[x].map(i => ids[act[i]]), comps[y].map(i => ids[act[i]]), blockedTiles, blockedReps);
            if(way > cap){ wrapOk = false; break; }
          }
        }
        if(wrapOk) A.push(pt);
      }
      if(A.length === 0){ why = B.length > 0 ? 'tower-wrap' : 'tower-count'; return null; }
      for(const { e, i, j } of cycE){
        if(e.state !== 0) continue;
        const allSame = P => P.every(pt => pt.lab[i] === pt.lab[j]), allDiff = P => P.every(pt => pt.lab[i] !== pt.lab[j]);
        if(allSame(A)){ e.state = 2; link.push(e); out.push({ e, value: 'same', rule: allSame(B) ? 'tower-link' : 'tower-wrap' }); }
        else if(allDiff(A)){ e.state = 1; out.push({ e, value: 'wall', rule: allDiff(B) ? 'tower-wall' : 'tower-wrap' }); }
      }
    }
    for(const e of link) union(e.a, e.b);
    return out;
  }

  // ============================================================================================================
  // v38: COMPASS. A compass on tile T with n / e / s / w says: its piece has EXACTLY that many tiles strictly above / right of /
  // below / left of T (anywhere in the piece). Everything here holds in every valid tiling; nothing is a guess.
  //   Key fact (extent): to hold a tile j columns east of T the piece needs a tile in each column T+1 .. T+j, so e >= j. A count is
  //   therefore also a LIMIT on how far the piece reaches. More exactly, any path of the piece from T to a tile X is made of piece
  //   tiles, so the tiles of the path on each side of T may not exceed the counts. A walk from the group of T over open edges that
  //   spends one unit of the n / e / s / w budget for every tile on that side (and one unit of the size budget per tile) is the
  //   REGION the piece can still use: groups are nodes, a group costs all its tiles at once, and every budget has to stay >= 0.
  //   A tile outside the region can never be in the piece, a route that has to go round (a wall in the way) pays for the detour.
  //   cmp-block  a tile the piece can not reach (outside every budget) is on the other side of an open edge of the group: wall
  //   cmp-reach  (impossible) the tiles the piece can still reach do not make up one of its counts, or its size
  //   cmp-wrap   a tile / edge the piece has to pass: without it the region has too few tiles on some side (or too few tiles): link
  //   cmp-place  every way the piece can still be (all connected sets of groups inside the region that give every compass inside
  //              its exact numbers, the area / size rules and every decided edge): what all of them share is decided
  // ============================================================================================================
  const cmpMask = (id, T) => {                           // bit 0 = tile is north of T, 1 = east, 2 = south, 3 = west
    const x = id % w, y = (id - x) / w, tx = T % w, ty = (T - tx) / w;
    let m = 0;
    if(y < ty) m |= 1; else if(y > ty) m |= 4;
    if(x > tx) m |= 2; else if(x < tx) m |= 8;
    return m;
  };
  // the compasses of a group: [{ T, cp, dims: [bit index of every known number], cnt: tiles of the group per side }]
  function cmpOf(mem){
    let list = null;
    for(const id of mem){
      const cp = ctx.compasses.get(`${id % w},${(id - id % w) / w}`);
      if(!cp) continue;
      const dims = [];
      for(let i = 0; i < 4; i++) if(cp[DIRS[i]] != null) dims.push(i);
      const cnt = [0, 0, 0, 0];
      for(const q of mem){ const m = cmpMask(q, id); for(let i = 0; i < 4; i++) if((m >> i) & 1) cnt[i]++; }
      if(!list) list = [];
      list.push({ T: id, cp, dims, cnt });
    }
    return list;
  }
  // nodes (groups) next to each other over OPEN edges
  function cmpNodeAdj(){
    const nadj = new Map();
    for(const e of spots){
      if(e.state !== 0) continue;
      const ra = find(e.a), rb = find(e.b);
      if(ra === rb) continue;
      if(!nadj.has(ra)) nadj.set(ra, new Map()); if(!nadj.has(rb)) nadj.set(rb, new Map());
      if(!nadj.get(ra).has(rb)) nadj.get(ra).set(rb, []); if(!nadj.get(rb).has(ra)) nadj.get(rb).set(ra, []);
      nadj.get(ra).get(rb).push(e); nadj.get(rb).get(ra).push(e);
    }
    return nadj;
  }
  // the region of one compass: Map node -> true for every group the piece of `rep` can still take in (rep included); null = already broken
  // (a count exceeded). `ban`: nodes that may not be used (for the "has to pass" tests).
  function cmpRegion(rep, C, cap, gmask, blocked, ban, nadj, nmask){
    const mem = members.get(rep);
    const D = C.dims.length + 1, bud = new Array(D);
    for(let k = 0; k < C.dims.length; k++){ bud[k] = C.cp[DIRS[C.dims[k]]] - C.cnt[C.dims[k]]; if(bud[k] < 0) return null; }
    bud[D - 1] = cap - mem.length; if(bud[D - 1] < 0) return null;
    const costs = new Map();
    const costOf = r => {
      let c = costs.get(r);
      if(!c){
        c = new Array(D).fill(0);
        for(const id of members.get(r)){ const m = cmpMask(id, C.T); for(let k = 0; k < C.dims.length; k++) if((m >> C.dims[k]) & 1) c[k]++; c[D - 1]++; }
        costs.set(r, c);
      }
      return c;
    };
    const labels = new Map(), zero = new Array(D).fill(0);
    labels.set(rep, [zero]);
    const queue = [[rep, zero]];
    for(let qi = 0; qi < queue.length; qi++){
      const [r, v] = queue[qi];
      const nb = nadj.get(r);
      if(!nb) continue;
      for(const nr of nb.keys()){
        if(globalThis.__DBG_REGION && mem.includes(69)) globalThis.__DBG_REGION({ from: members.get(r)[0], to: members.get(nr)[0], blocked: blocked.has(nr), ban: !!(ban && ban.has(nr)), mask: nmask.get(nr), gmask });
        if(nr === rep || blocked.has(nr) || (ban && ban.has(nr)) || (nmask.get(nr) & gmask)) continue;
        const c = costOf(nr), nv = new Array(D);
        let ok = true;
        for(let k = 0; k < D; k++){ nv[k] = v[k] + c[k]; if(nv[k] > bud[k]){ ok = false; break; } }
        if(!ok) continue;
        let list = labels.get(nr);
        if(!list){ list = []; labels.set(nr, list); }
        let dom = false;
        for(const u of list){ let le = true; for(let k = 0; k < D; k++) if(u[k] > nv[k]){ le = false; break; } if(le){ dom = true; break; } }
        if(dom) continue;
        for(let i = list.length - 1; i >= 0; i--){ const u = list[i]; let ge = true; for(let k = 0; k < D; k++) if(nv[k] > u[k]){ ge = false; break; } if(ge) list.splice(i, 1); }
        list.push(nv);
        queue.push([nr, nv]);
      }
    }
    return { nodes: new Set(labels.keys()), costOf };
  }
  // can the piece still reach every count / its size with these nodes available? (the nodes are an over-estimate: sound)
  function cmpEnough(rep, comps, nodes, needSz){
    const mem = members.get(rep);
    let tiles = mem.length;
    for(const r of nodes) if(r !== rep) tiles += members.get(r).length;
    if(tiles < needSz) return 'size';
    for(const C of comps){
      for(const i of C.dims){
        let have = C.cnt[i];
        for(const r of nodes){ if(r === rep) continue; for(const id of members.get(r)) if((cmpMask(id, C.T) >> i) & 1) have++; }
        if(have < C.cp[DIRS[i]]) return 'count';
      }
    }
    return null;
  }
  // nodes that can be reached from rep inside `allowed` (connected through open edges)
  function cmpComponent(rep, allowed, nadj){
    const seen = new Set([rep]), q = [rep];
    for(let qi = 0; qi < q.length; qi++){
      const nb = nadj.get(q[qi]);
      if(!nb) continue;
      for(const nr of nb.keys()) if(allowed.has(nr) && !seen.has(nr)){ seen.add(nr); q.push(nr); }
    }
    return seen;
  }
  // the region of a group (all its compasses together); null = broken. { nodes, comps }
  function cmpGroupRegion(rep, mem, comps, cap, maskOf, blocked, ban, nadj, nmask){
    const gmask = maskOf.get(rep) || 0;
    let F = null;
    for(const C of comps){
      if(C.dims.length === 0 && cap >= N) continue;           // an empty compass says nothing
      const R = cmpRegion(rep, C, cap, gmask, blocked, ban, nadj, nmask);
      if(R === null) return null;
      if(F === null) F = R.nodes;
      else { const G2 = new Set(); for(const r of F) if(R.nodes.has(r)) G2.add(r); F = G2; }
    }
    if(F === null) return { nodes: null, comps };
    return { nodes: cmpComponent(rep, F, nadj), comps };
  }
  function compassStep(need, capOf, maskOf, dmap){
    const out = [];
    const nadj = cmpNodeAdj(), nmask = new Map();
    for(const [r, mem] of members){ let m = 0; for(const id of mem) m |= roseMask[id]; nmask.set(r, m); }
    for(const [rep, mem] of members){
      const comps = cmpOf(mem);
      if(!comps) continue;
      const cap = capOf.get(rep), nd = need.get(rep), blocked = dmap.get(rep) || new Set();
      const G = cmpGroupRegion(rep, mem, comps, cap, maskOf, blocked, null, nadj, nmask);
      if(G === null){ why = 'cmp-reach'; return null; }
      if(G.nodes === null) continue;
      const F = G.nodes;
      const bad = cmpEnough(rep, comps, F, nd);
      if(bad){ why = 'cmp-reach'; return null; }
      // cmp-block: an open edge of the group that leads outside the region
      const nb = nadj.get(rep);
      if(nb) for(const [nr, es] of nb) if(!F.has(nr)) for(const e of es) if(e.state === 0){ e.state = 1; out.push({ e, value: 'wall', rule: 'cmp-block' }); }
      if(out.length > 0) return out;
      // cmp-wrap: a node the piece can not do without
      if(F.size <= 80){
        const forced = [];
        for(const X of F){
          if(X === rep) continue;
          const without = new Set(F); without.delete(X);
          const comp = cmpComponent(rep, without, nadj);
          let miss = cmpEnough(rep, comps, comp, nd) !== null;
          if(!miss && F.size <= 40){
            const G2 = cmpGroupRegion(rep, mem, comps, cap, maskOf, blocked, new Set([X]), nadj, nmask);
            miss = G2 === null || (G2.nodes !== null && cmpEnough(rep, comps, G2.nodes, nd) !== null);
          }
          if(miss) forced.push(X);
        }
        if(forced.length > 0){
          let again = false;
          for(const X of forced){
            if(find(X) === find(rep)) continue;
            const d = dmap.get(find(rep));
            if(d && d.has(find(X))){ why = 'cmp-reach'; return null; }
            union(rep, X); again = true;
          }
          if(again){
            for(const e of spots) if(e.state === 0 && find(e.a) === find(e.b)){ e.state = 2; out.push({ e, value: 'same', rule: 'cmp-wrap' }); }
            if(out.length === 0) out.again = true;
            return out;
          }
        }
      }
    }
    return out;
  }
  // cmp-place: what do ALL the pieces the compass group can still be agree on? Instead of listing the pieces (hopeless when the
  // sizes are free), ask for WITNESSES: a pruned search for one valid piece that holds tile X / that avoids tile X.
  //   no valid piece holds X          => X is excluded from the piece (walls where it touches the piece)
  //   every valid piece holds X        => X is a CHOKE POINT the piece can not do without: it joins the group (a link)
  // Every piece found is a witness for all the tiles in it / outside it, so far fewer searches than tiles are needed. A search that
  // runs out of its budget proves nothing (the tile stays undecided): always sound.
  const CMP_QUERY_MAX = 1500, CMP_STEP_MAX = 40000;
  let lastPass = null, sketchCapture = false;                                   // the sizes / masks / differences of the last propagation pass (for the sketch)
  function compassPlaceStep(need, capOf, maskOf, dmap){
    const out = [], link = [];
    if(inProbe && !globalThis.__CMP_PROBE) return out;
    const nadj = cmpNodeAdj(), nmask = new Map();
    for(const [r, mem] of members){ let m = 0; for(const id of mem) m |= roseMask[id]; nmask.set(r, m); }
    let spent = 0;
    const tPlace = nowMs();
    for(const [rep, mem] of members){
      if(nowMs() - tPlace > CMP_STEP_MS) break;
      const comps = cmpOf(mem);
      if(!comps || !comps.some(C => C.dims.length > 0)) continue;
      const cap = capOf.get(rep), nd = need.get(rep), blocked = dmap.get(rep) || new Set();
      const G = cmpGroupRegion(rep, mem, comps, cap, maskOf, blocked, null, nadj, nmask);
      if(G === null){ why = 'cmp-place'; return null; }
      if(G.nodes === null) continue;
      const nodes = [rep]; for(const r of G.nodes) if(r !== rep) nodes.push(r);
      const n = nodes.length, idx = new Map(nodes.map((r, i) => [r, i]));
      const adj = nodes.map(r => { const o = [], m = nadj.get(r); if(m) for(const q of m.keys()) if(idx.has(q)) o.push(idx.get(q)); return o; });
      const tiles = nodes.map(r => members.get(r));
      const cost = nodes.map((r, i) => i === 0 ? null : comps.map(C => { const c = new Array(C.dims.length + 1).fill(0); for(const id of tiles[i]){ const m = cmpMask(id, C.T); for(let k = 0; k < C.dims.length; k++) if((m >> C.dims[k]) & 1) c[k]++; c[C.dims.length]++; } return c; }));
      const bud = comps.map(C => { const b = C.dims.map(i => C.cp[DIRS[i]] - C.cnt[i]); b.push(cap - mem.length); return b; });
      const exactDims = comps.map(C => C.dims.length);          // the last entry (size) is only an upper bound
      const hasCmp = nodes.map((r, i) => i > 0 && tiles[i].some(id => ctx.compasses.has(`${id % w},${(id - id % w) / w}`)));
      const sums = comps.map(C => new Array(C.dims.length + 1).fill(0));
      const inS = new Uint8Array(n), ex = new Uint8Array(n); inS[0] = 1;
      const S = [];
      let sizeNow = mem.length, aborted = false, calls = 0;
      const valid = () => {
        if(sizeNow < nd || sizeNow > cap) return false;
        for(let i = 0; i < comps.length; i++) for(let k = 0; k < exactDims[i]; k++) if(sums[i][k] !== bud[i][k]) return false;
        const P = mem.slice();
        for(const j of S) for(const id of tiles[j]) P.push(id);
        if(!boxPlacementOk(P, rep, dmap)) return false;
        if(mem.length > 1){                                     // a group made of tiles that do not touch (merged by counting) has to be connected by the piece
          markGen++;
          for(const id of P) markBuf[id] = markGen;
          const q = [P[0]], got = new Set([P[0]]);
          for(let qi = 0; qi < q.length; qi++) for(const { e, o } of adjE[q[qi]]) if(e.state !== 1 && markBuf[o] === markGen && !got.has(o)){ got.add(o); q.push(o); }
          if(got.size !== P.length) return false;
        }
        const cells = P.map(id => { const x = id % w; return [x, (id - x) / w]; });
        return passesMarkers(cells, canonicalShapeKey(cells), ctx);
      };
      const fits = j => { for(let i = 0; i < comps.length; i++) for(let k = 0; k < sums[i].length; k++) if(sums[i][k] + cost[j][i][k] > bud[i][k]) return false; return true; };
      const partialOk = () => {
        const cells = mem.map(id => [id % w, (id - id % w) / w]);
        for(const j of S) for(const id of tiles[j]) cells.push([id % w, (id - id % w) / w]);
        return compassPartialOk(ctx, cells, cap, null, null);
      };
      // one search: a valid piece with `want` in it (-1 = any); `ex` holds the nodes it may not use. Returns the node list, null (none) or undefined (gave up)
      const search = want => {
        calls = 0; aborted = false;
        const rec = () => {
          if(++calls > CMP_QUERY_MAX || ++spent > CMP_STEP_MAX){ aborted = true; return undefined; }
          // everything the piece could still use
          const seen = new Uint8Array(n), q = [0]; seen[0] = 1;
          for(let qi = 0; qi < q.length; qi++) for(const o of adj[q[qi]]) if(!seen[o] && !ex[o]){ seen[o] = 1; q.push(o); }
          if(want >= 0 && !seen[want]) return null;
          for(let i = 0; i < comps.length; i++) for(let k = 0; k < exactDims[i]; k++){
            let avail = 0; for(const j of q) if(j > 0 && !inS[j]) avail += cost[j][i][k];
            if(sums[i][k] + avail < bud[i][k]) return null;
          }
          let tot = sizeNow; for(const j of q) if(j > 0 && !inS[j]) tot += tiles[j].length;
          if(tot < nd) return null;
          if((want < 0 || inS[want]) && valid()) return S.slice();
          // next node: towards `want`, else any node touching the piece
          let b = -1;
          if(want >= 0 && !inS[want]){
            const par = new Int32Array(n).fill(-1), qq = [];
            for(let j = 0; j < n; j++) if(inS[j]){ par[j] = j; qq.push(j); }
            for(let qi = 0; qi < qq.length && par[want] < 0; qi++) for(const o of adj[qq[qi]]) if(par[o] < 0 && !ex[o]){ par[o] = qq[qi]; qq.push(o); }
            if(par[want] < 0) return null;
            let x = want; while(!inS[par[x]]) x = par[x];
            b = x;
          } else {
            for(const j of q) if(!inS[j] && !ex[j] && adj[j].some(o => inS[o])){ b = j; break; }
          }
          if(b < 0) return null;
          if(fits(b)){
            inS[b] = 1; S.push(b); sizeNow += tiles[b].length;
            for(let i = 0; i < comps.length; i++) for(let k = 0; k < sums[i].length; k++) sums[i][k] += cost[b][i][k];
            let r = (hasCmp[b] && !partialOk()) ? null : rec();
            for(let i = 0; i < comps.length; i++) for(let k = 0; k < sums[i].length; k++) sums[i][k] -= cost[b][i][k];
            sizeNow -= tiles[b].length; S.pop(); inS[b] = 0;
            if(r !== null) return r;
          }
          ex[b] = 1;
          const r2 = rec();
          ex[b] = 0;
          return r2;
        };
        return rec();
      };
      const anyIn = new Uint8Array(n), anyOut = new Uint8Array(n);
      const note = W => { const inW = new Uint8Array(n); inW[0] = 1; for(const j of W) inW[j] = 1; for(let j = 0; j < n; j++){ if(inW[j]) anyIn[j] = 1; else anyOut[j] = 1; } };
      const W0 = search(-1);
      if(W0 === null){ why = 'cmp-place'; return null; }
      if(W0 === undefined) continue;
      note(W0);
      const excluded = [], forced = [];
      for(let x = 1; x < n && !aborted; x++){
        if(!anyIn[x]){ const W = search(x); if(W === null) excluded.push(x); else if(W) note(W); }
        if(!anyOut[x]){ ex[x] = 1; const W = search(-1); ex[x] = 0; if(W === null) forced.push(x); else if(W) note(W); }
      }
      // excluded tiles: a wall wherever they touch the piece (group)
      const nb = nadj.get(rep);
      for(const x of excluded) if(nb && nb.has(nodes[x])) for(const e of nb.get(nodes[x])) if(e.state === 0){ e.state = 1; out.push({ e, value: 'wall', rule: 'cmp-place' }); }
      if(out.length > 0) return out;
      let unioned = false;
      for(const x of forced){
        if(find(nodes[x]) === find(rep)) continue;
        const d = dmap.get(find(rep));
        if(d && d.has(find(nodes[x]))){ why = 'cmp-place'; return null; }
        union(rep, nodes[x]); unioned = true;
      }
      if(unioned){
        for(const e of spots) if(e.state === 0 && find(e.a) === find(e.b)){ e.state = 2; out.push({ e, value: 'same', rule: 'cmp-place' }); }
        if(out.length === 0) out.again = true;
        return out;
      }
    }
    return out;
  }
  // ============================================================================================================
  // cmp-crowd: TOO MANY COMPASSES FOR THE TILES THEY SHARE. Two compass groups are either one piece or two; for each way the compass
  // groups can be split into pieces (a "partition", pruned by every pairwise fact) the counts are checked against the tiles that exist:
  // the board is cut into ATOMS (tiles that lie on the same side of every compass line); a piece takes y tiles of an atom beyond the ones it
  // already owns, every compass count is a sum of such y (and of what the piece owns) that has to be exact, the pieces together can take no more
  // tiles of an atom than it has free tiles, and a piece has its size limits. Bounds are tightened to a fixpoint (no search): a partition whose
  // bounds cross is impossible. What all the partitions that are left agree on is decided:
  //   two groups in one piece in all of them        -> they are one group (a link that need not touch)
  //   a free tile that one piece must take in all   -> it joins that piece
  //   two touching groups in two pieces in all      -> wall
  // Example: W10 for tile (2,5) wants 10 of the 15 tiles of the two left columns, and two W2 compasses of column 1 each want their own tile
  // and 2 tiles of column 0 in there as well: 10 + 3 + 3 > 15, so they can not be three pieces.
  // ============================================================================================================
  const CMP_STEP_MS = 1500;
  const CMP_CROWD_MAX_GROUPS = 12, CMP_CROWD_SUB = (globalThis.__CMP_SUB || 4);
  const caseBudget = { left: 0 };
  function compassCrowdStep(need, capOf, maskOf, dmap){
    const out = [];
    if(inProbe && !globalThis.__CMP_PROBE) return out;
    const all = [];
    for(const [rep, mem] of members){
      const comps = cmpOf(mem);
      if(comps && comps.some(C => C.dims.length > 0)) all.push({ rep, mem: mem.slice(), comps });      // a copy: the case analysis joins and rolls back groups, which changes the live arrays
    }
    if(all.length < 2 || all.length > CMP_CROWD_MAX_GROUPS) return out;
    const tCrowd = nowMs();
    const nadj = cmpNodeAdj(), nmask = new Map();
    for(const [r, mm] of members){ let x = 0; for(const id of mm) x |= roseMask[id]; nmask.set(r, x); }
    // regions per group (tile level)
    for(const g of all){
      const R = cmpGroupRegion(g.rep, g.mem, g.comps, capOf.get(g.rep), maskOf, dmap.get(g.rep) || new Set(), null, nadj, nmask);
      if(R === null){ why = 'cmp-crowd'; return null; }
      g.F = new Set();
      if(R.nodes === null) { for(const id of activeIds) g.F.add(id); }
      else for(const r of R.nodes) for(const id of members.get(r)) g.F.add(id);
    }
    // every small set of groups: the other groups are ignored (their tiles count as free), which only loosens the test
    caseBudget.left = globalThis.__CMP_CASES == null ? 60 : globalThis.__CMP_CASES;
    const idx = all.map((g, i) => i), subs = [];
    const pick = (start, cur, size) => {
      if(cur.length === size){ subs.push(cur.slice()); return; }
      for(let i = start; i < all.length; i++){ cur.push(i); pick(i + 1, cur, size); cur.pop(); }
    };
    for(let size = 2; size <= Math.min(CMP_CROWD_SUB, all.length); size++) pick(0, [], size);
    for(const sub of subs){
      if(nowMs() - tCrowd > CMP_STEP_MS) break;                  // a time guard: what is skipped is only not deduced, never wrong
      const r = crowdCore(sub.map(i => all[i]), need, capOf, dmap, nadj);
      if(r === null) return null;
      if(r.length > 0 || r.again) return r;
    }
    return out;
  }
  function crowdCore(gs, need, capOf, dmap, nadj){
    const out = [], m = gs.length;
    // demands and atoms
    const dem = [];                                            // { gi, T, d, k }
    gs.forEach((g, gi) => { for(const C of g.comps) for(const d of C.dims) dem.push({ gi, T: C.T, d, k: C.cp[DIRS[d]] }); });
    const sigOf = new Map(), atoms = [], atomOf = new Int32Array(N).fill(-1);
    for(const id of activeIds){
      let s = '';
      for(const q of dem) s += (cmpMask(id, q.T) >> q.d) & 1;
      let a = sigOf.get(s);
      if(a === undefined){ a = atoms.length; sigOf.set(s, a); atoms.push({ tiles: [], sig: s }); }
      atoms[a].tiles.push(id); atomOf[id] = a;
    }
    const A = atoms.length;
    const ownerG = new Int32Array(N).fill(-1);
    gs.forEach((g, gi) => { for(const id of g.mem) ownerG[id] = gi; });
    const free = atoms.map(at => at.tiles.filter(id => ownerG[id] < 0).length);
    const ownedBy = gs.map(g => { const o = new Array(A).fill(0); for(const id of g.mem) o[atomOf[id]]++; return o; });
    // which pairs may be one piece
    const sameOk = Array.from({ length: m }, () => new Array(m).fill(true));
    for(let i = 0; i < m; i++) for(let j = i + 1; j < m; j++){
      let ok = true;
      const d = dmap.get(gs[i].rep);
      if(d && d.has(gs[j].rep)) ok = false;
      if(ok) for(const Ci of gs[i].comps) for(const Cj of gs[j].comps) if(compassPairConflict(Ci.T % w, (Ci.T - Ci.T % w) / w, Ci.cp, Cj.T % w, (Cj.T - Cj.T % w) / w, Cj.cp)){ ok = false; break; }
      if(ok && pieceInfo(gs[i].mem.concat(gs[j].mem)) === null) ok = false;
      if(globalThis.__CMP_SAME) globalThis.__CMP_SAME({ a: gs[i].mem.map(id => [id % w, (id - id % w) / w]), b: gs[j].mem.map(id => [id % w, (id - id % w) / w]), ok, dm: !!(dmap.get(gs[i].rep) && dmap.get(gs[i].rep).has(gs[j].rep)), pi: pieceInfo(gs[i].mem.concat(gs[j].mem)) === null });
      sameOk[i][j] = sameOk[j][i] = ok;
    }
    // feasibility of one partition (array of blocks, each an array of group indices) by bound propagation; returns the per-block forced tiles or null
    const blockCache = new Map();
    function blockInfo(b){
      const key = b.join(',');
      let bi = blockCache.get(key);
      if(bi) return bi;
      const mem = []; for(const gi of b) for(const id of gs[gi].mem) mem.push(id);
      const info = b.length === 1 ? { need: need.get(gs[b[0]].rep), cap: capOf.get(gs[b[0]].rep) } : pieceInfo(mem);
      const avail = new Array(A).fill(0), availTiles = atoms.map(() => []);
      if(info){
        for(let a = 0; a < A; a++) for(const id of atoms[a].tiles){
          if(ownerG[id] >= 0) continue;
          let ok = true; for(const gi of b) if(!gs[gi].F.has(id)){ ok = false; break; }
          if(ok){ avail[a]++; availTiles[a].push(id); }
        }
      }
      bi = { mem, info, avail, availTiles, owned: new Array(A).fill(0) };
      for(const gi of b) for(let a = 0; a < A; a++) bi.owned[a] += ownedBy[gi][a];
      blockCache.set(key, bi);
      return bi;
    }
    function feasible(blocks){
      const nb = blocks.length, bis = blocks.map(blockInfo);
      for(const bi of bis) if(!bi.info) return null;
      const lo = bis.map(() => new Array(A).fill(0)), hi = bis.map((bi) => bi.avail.slice());
      const blockOf = new Array(m); blocks.forEach((b, i) => { for(const gi of b) blockOf[gi] = i; });
      // equalities: demand (block, region) ; atoms inside the region are those whose signature bit is 1
      const eqs = [];
      dem.forEach((q, qi) => {
        const bi = blockOf[q.gi], inH = [];
        let owned = 0;
        for(let a = 0; a < A; a++) if(atoms[a].sig[qi] === '1'){ inH.push(a); owned += bis[bi].owned[a]; }
        eqs.push({ bi, atoms: inH, r: q.k - owned });
      });
      for(const e of eqs) if(e.r < 0) return null;
      const sizeLo = bis.map(bi => Math.max(0, bi.info.need - bi.mem.length)), sizeHi = bis.map(bi => bi.info.cap - bi.mem.length);
      // a piece that has to leave a region spends tiles of the region on its way out: the fewest tiles of the region on a path from one of
      // its own tiles in the region to any tile it could own outside the region (an open path, no tile of another piece)
      const exitMemo = new Map();
      const exitCost = (b, qi) => {
        const key = b + ':' + qi;
        if(exitMemo.has(key)) return exitMemo.get(key);
        const q = dem[qi], inR = id => (cmpMask(id, q.T) >> q.d) & 1;
        const mine = new Set(blocks[b]);
        const okTile = id => { const o = ownerG[id]; if(o >= 0) return mine.has(o); for(const gi of blocks[b]) if(!gs[gi].F.has(id)) return false; return true; };
        const dist = new Map(), dq = [[], []];
        let cur = 0, best = Infinity;
        for(const gi of blocks[b]) for(const id of gs[gi].mem) if(inR(id)){ dist.set(id, 1); dq[0].push(id); }
        if(dist.size === 0){ exitMemo.set(key, 0); return 0; }
        for(let d = 1; d < 80 && best === Infinity; d++){
          const layer = [];
          for(const id of dq[0]) if(dist.get(id) === d) layer.push(id);
          if(layer.length === 0 && dq[0].length === 0) break;
          const next = [];
          const stack = layer.slice();
          while(stack.length){
            const id = stack.pop();
            for(const { e, o } of adjE[id]){
              if(e.state === 1 || !okTile(o)) continue;
              if(!inR(o)){ best = Math.min(best, d); continue; }
              if(!dist.has(o)){ dist.set(o, d + 1); next.push(o); }
            }
          }
          dq[0] = dq[0].filter(id => dist.get(id) > d).concat(next);
          if(dq[0].length === 0) break;
        }
        exitMemo.set(key, best);
        return best;
      };
      for(let it = 0; it < 60; it++){
        let changed = false;
        for(let b = 0; b < nb; b++) for(let qi = 0; qi < dem.length; qi++){
          let ownedR = 0, hiR = 0, outLo = 0, outOwned = 0;
          for(let a = 0; a < A; a++){
            if(atoms[a].sig[qi] === '1'){ ownedR += bis[b].owned[a]; hiR += hi[b][a]; }
            else { outLo += lo[b][a]; outOwned += bis[b].owned[a]; }
          }
          if(ownedR === 0) continue;
          let sumLo = 0; for(let a = 0; a < A; a++) sumLo += lo[b][a];
          const mustExit = outLo + outOwned > 0 || bis[b].mem.length + sumLo > ownedR + hiR || bis[b].info.need > ownedR + hiR;
          if(!mustExit) continue;
          const c = exitCost(b, qi);
          if(globalThis.__CMP_X) globalThis.__CMP_X({ blocks: JSON.stringify(blocks), b, qi, ownedR, hiR, outLo, c });
          if(c === Infinity) return null;
          const needY = c - ownedR;
          if(needY <= 0) continue;
          let sh = 0; for(let a = 0; a < A; a++) if(atoms[a].sig[qi] === '1') sh += hi[b][a];
          if(sh < needY) return null;
          for(let a = 0; a < A; a++) if(atoms[a].sig[qi] === '1'){
            const nl = needY - (sh - hi[b][a]);
            if(nl > lo[b][a]){ lo[b][a] = nl; changed = true; if(lo[b][a] > hi[b][a]) return null; }
          }
        }
        // region capacity: in each half-plane the pieces together can not take more free tiles than it has
        for(let qi = 0; qi < dem.length; qi++){
          let freeR = 0; const inR = [];
          for(let a = 0; a < A; a++) if(atoms[a].sig[qi] === '1'){ freeR += free[a]; inR.push(a); }
          const lb = new Array(nb).fill(0);
          for(let b = 0; b < nb; b++){
            let sl = 0; for(const a of inR) sl += lo[b][a];
            lb[b] = sl;
            for(const e of eqs) if(e.bi === b && e.atoms.every(a => atoms[a].sig[qi] === '1')) lb[b] = Math.max(lb[b], e.r);
            let ownedR = 0; for(const a of inR) ownedR += bis[b].owned[a];
            if(ownedR > 0){
              let outAny = 0; for(let a = 0; a < A; a++) if(atoms[a].sig[qi] !== '1') outAny += lo[b][a] + bis[b].owned[a];
              let hiR = 0; for(const a of inR) hiR += hi[b][a];
              let sumLo = 0; for(let a = 0; a < A; a++) sumLo += lo[b][a];
              if(outAny > 0 || bis[b].mem.length + sumLo > ownedR + hiR || bis[b].info.need > ownedR + hiR){
                const c = exitCost(b, qi);
                if(c === Infinity) return null;
                lb[b] = Math.max(lb[b], c - ownedR);
              }
            }
          }
          let tot = 0; for(let b = 0; b < nb; b++) tot += lb[b];
          if(tot > freeR) return null;
          for(let b = 0; b < nb; b++){
            const room = freeR - (tot - lb[b]);
            let sl = 0, sh = 0; for(const a of inR){ sl += lo[b][a]; sh += hi[b][a]; }
            if(sh > room) for(const a of inR){
              const nh = room - (sl - lo[b][a]);
              if(nh < hi[b][a]){ hi[b][a] = nh; changed = true; if(lo[b][a] > hi[b][a]) return null; }
            }
          }
        }
        for(const e of eqs){
          let sl = 0, sh = 0;
          for(const a of e.atoms){ sl += lo[e.bi][a]; sh += hi[e.bi][a]; }
          if(sl > e.r || sh < e.r) return null;
          for(const a of e.atoms){
            const nl = e.r - (sh - hi[e.bi][a]), nh = e.r - (sl - lo[e.bi][a]);
            if(nl > lo[e.bi][a]){ lo[e.bi][a] = nl; changed = true; }
            if(nh < hi[e.bi][a]){ hi[e.bi][a] = nh; changed = true; }
            if(lo[e.bi][a] > hi[e.bi][a]) return null;
          }
        }
        for(let b = 0; b < nb; b++){
          let sl = 0, sh = 0;
          for(let a = 0; a < A; a++){ sl += lo[b][a]; sh += hi[b][a]; }
          if(sl > sizeHi[b] || sh < sizeLo[b]) return null;
          for(let a = 0; a < A; a++){
            const nl = sizeLo[b] - (sh - hi[b][a]), nh = sizeHi[b] - (sl - lo[b][a]);
            if(nl > lo[b][a]){ lo[b][a] = nl; changed = true; }
            if(nh < hi[b][a]){ hi[b][a] = nh; changed = true; }
            if(lo[b][a] > hi[b][a]) return null;
          }
        }
        for(let a = 0; a < A; a++){
          let sl = 0; for(let b = 0; b < nb; b++) sl += lo[b][a];
          if(sl > free[a]) return null;
          for(let b = 0; b < nb; b++){
            const nh = free[a] - (sl - lo[b][a]);
            if(nh < hi[b][a]){ hi[b][a] = nh; changed = true; if(lo[b][a] > hi[b][a]) return null; }
          }
        }
        if(!changed) break;
      }
      // tiles a piece must take: all of its available tiles of an atom
      return blocks.map((b, i) => { const t = []; for(let a = 0; a < A; a++) if(bis[i].avail[a] > 0 && lo[i][a] === bis[i].avail[a]) for(const id of bis[i].availTiles[a]) t.push(id); return t; });
    }
    // all partitions
    const survivors = [];
    let tried = 0, over = false;
    const assign = [], blocks = [];
    const rec = i => {
      if(over) return;
      if(i === m){
        if(++tried > 6000){ over = true; return; }
        const f = feasible(blocks.map(b => b.slice()));
        if(f) survivors.push({ blocks: blocks.map(b => b.slice()), forced: f });
        return;
      }
      for(let b = 0; b < blocks.length; b++){
        if(!blocks[b].every(j => sameOk[i][j])) continue;
        blocks[b].push(i); assign[i] = b;
        rec(i + 1);
        blocks[b].pop();
      }
      blocks.push([i]); assign[i] = blocks.length - 1;
      rec(i + 1);
      blocks.pop();
    };
    rec(0);
    // case analysis: merge the groups of each surviving split, propagate everything, drop the splits that break
    if(survivors.length > 1 && !over && caseBudget.left > 0){
      const sn = snapshot(), keep = [];
      for(const sv of survivors){
        if(caseBudget.left <= 0){ keep.push(sv); continue; }
        let ok = true, merged = false;
        for(const b of sv.blocks) for(let k = 1; k < b.length && ok; k++){
          const ra = find(gs[b[0]].rep), rb = find(gs[b[k]].rep);
          if(ra !== rb){ const d = dmap.get(ra); if(d && d.has(rb)){ ok = false; break; } union(ra, rb); merged = true; }
        }
        if(ok && merged){
          caseBudget.left--;
          const was = inProbe; inProbe = true;
          const r = propagate();
          inProbe = was;
          if(r === null){ ok = false; if(globalThis.__CMP_CASEFAIL) globalThis.__CMP_CASEFAIL({ why: failWhy, blocks: JSON.stringify(sv.blocks), groups: gs.map(g => g.mem.map(id => [id % w, (id - id % w) / w])) }); }
        }
        restore(sn);
        if(ok) keep.push(sv);
      }
      survivors.length = 0; for(const sv of keep) survivors.push(sv);
    }
    if(globalThis.__CMP_DEBUG) globalThis.__CMP_DEBUG({ crowd: true, groups: gs.map(g => g.mem.map(id => [id % w, (id - id % w) / w])), tried, over, survivors: survivors.length, atoms: A, sample: survivors.slice(0, 6).map(s => JSON.stringify(s.blocks)) });
    if(over) return out;
    if(survivors.length === 0){ why = 'cmp-crowd'; return null; }
    // what every surviving partition agrees on
    const same = (s, i, j) => s.blocks.some(b => b.includes(i) && b.includes(j));
    let unioned = false;
    for(let i = 0; i < m; i++) for(let j = i + 1; j < m; j++){
      if(find(gs[i].rep) === find(gs[j].rep)) continue;
      if(survivors.every(s => same(s, i, j))){
        const d = dmap.get(find(gs[i].rep));
        if(d && d.has(find(gs[j].rep))){ why = 'cmp-crowd'; return null; }
        union(gs[i].rep, gs[j].rep); unioned = true;
      } else if(survivors.every(s => !same(s, i, j))){
        const nb = nadj.get(find(gs[i].rep));
        const es = nb && nb.get(find(gs[j].rep));
        if(es) for(const e of es) if(e.state === 0){ e.state = 1; out.push({ e, value: 'wall', rule: 'cmp-crowd' }); }
      }
    }
    if(out.length > 0 && !unioned) return out;
    for(let i = 0; i < m; i++){
      const cand = survivors.map(s => { const b = s.blocks.findIndex(bl => bl.includes(i)); return new Set(s.forced[b]); });
      for(const id of cand[0]) if(cand.every(c => c.has(id)) && find(id) !== find(gs[i].rep)){
        const d = dmap.get(find(gs[i].rep));
        if(d && d.has(find(id))){ why = 'cmp-crowd'; return null; }
        union(gs[i].rep, id); unioned = true;
      }
    }
    if(unioned){
      for(const e of spots) if(e.state === 0 && find(e.a) === find(e.b)){ e.state = 2; out.push({ e, value: 'same', rule: 'cmp-crowd' }); }
      if(out.length === 0) out.again = true;
    }
    return out;
  }
  // ============================================================================================================
  // cmp-excl (tile probes): "if tile X were in the piece of compass T, would everything still work?" Join X to the group of T (they need not
  // touch), propagate everything, and look for a contradiction. A contradiction is a FACT, even though no edge is decided by it:
  // X and T can not share a piece. Facts are kept as forbidden pairs (rolled back with the probes), so every other rule sees them.
  // ============================================================================================================
  const cmpProbeCursor = { i: 0 };
  function compassTileProbeStep(need, capOf, maskOf, dmap){
    const out = [];
    if(inProbe) return out;
    const t0 = Date.now(), limitMs = globalThis.__CMP_TILEPROBE_MS != null ? globalThis.__CMP_TILEPROBE_MS : (activeIds.length <= 36 ? 400 : 0);
    if(limitMs <= 0) return out;
    const nadj = cmpNodeAdj(), nmask = new Map();
    for(const [r, mem] of members){ let m = 0; for(const id of mem) m |= roseMask[id]; nmask.set(r, m); }
    const list = [];
    for(const [rep, mem] of members){ const comps = cmpOf(mem); if(comps && comps.some(C => C.dims.length > 0)) list.push({ rep, mem: mem.slice(), comps }); }
    if(list.length === 0) return out;
    const sig = spots.map(e => e.state).join('') + '|' + parent.join(',') + '|' + forbidden.length;
    if(sig === cmpProbeCursor.doneSig) return out;
    const sn = snapshot();
    let found = 0, complete = true;
    const newFacts = [];
    for(let k = 0; k < list.length; k++){
      const g = list[(cmpProbeCursor.i + k) % list.length];
      const rep = g.rep;
      const R = cmpGroupRegion(rep, g.mem, g.comps, capOf.get(rep), maskOf, dmap.get(rep) || new Set(), null, nadj, nmask);
      if(R === null || R.nodes === null) continue;
      const T = g.comps[0].T;
      for(const X of R.nodes){
        if(X === rep) continue;
        if(Date.now() - t0 > limitMs){ cmpProbeCursor.i = (cmpProbeCursor.i + k) % list.length; complete = false; break; }
        const d = dmap.get(rep);
        if(d && d.has(X)) continue;
        union(rep, X);
        const was = inProbe; inProbe = true;
        const r = propagate();
        inProbe = was;
        restore(sn);
        if(r === null){
          for(const comp of g.comps) newFacts.push([comp.T, members.get(X)[0]]);
          found++;
          if(globalThis.__CMP_EXCL) globalThis.__CMP_EXCL(T, members.get(X)[0]);
        }
      }
      if(found > 0){ cmpProbeCursor.i = (cmpProbeCursor.i + k) % list.length; break; }
      if(!complete) break;
    }
    for(const [a, b] of newFacts) forbidden.push([a, b, 'cmp-excl']);
    if(found > 0){ out.again = true; }
    else if(complete) cmpProbeCursor.doneSig = sig;
    return out;
  }
  // ============================================================================================================
  // SKETCH (rough shapes). Not a proof: a TENTATIVE layer on top of the true deductions, shown in red.
  // For every compass piece the solver draws many random pieces that fit that compass alone (the same pruned search as cmp-place, with random
  // choices), and counts how often each tile next to the piece is part of it. A neighbour that joins nearly every drawing becomes a red link,
  // one that joins almost none a red wall, most sure first. Each red decision is applied on a copy of the state and the TRUE rules are run on it:
  // a contradiction means the guess was wrong (it is dropped, the correction), otherwise everything it settles is red as well.
  //   deduceSolve(..., { sketch: true, sketchTheta: [0.95, 0.85], sketchSamples: 24, sketchMs: 8000, sketchSeed: 1 })
  //   events: { type: 'sketch', spot, value, hyp: true|false, conf, round }  (hyp = the guess itself, else a consequence)   then { type: 'sketch-done', ... }
  // ============================================================================================================
  function cmpSampler(rep, need, capOf, maskOf, dmap, nadj, nmask, rnd){
    const mem = members.get(rep);
    const comps = cmpOf(mem);
    if(!comps || !comps.some(C => C.dims.length > 0)) return null;
    const cap = capOf.get(rep), nd = need.get(rep), blocked = dmap.get(rep) || new Set();
    const G = cmpGroupRegion(rep, mem, comps, cap, maskOf, blocked, null, nadj, nmask);
    if(G === null || G.nodes === null) return null;
    const nodes = [rep]; for(const r of G.nodes) if(r !== rep) nodes.push(r);
    const n = nodes.length, idx = new Map(nodes.map((r, i) => [r, i]));
    const adj = nodes.map(r => { const o = [], m = nadj.get(r); if(m) for(const q of m.keys()) if(idx.has(q)) o.push(idx.get(q)); return o; });
    const tiles = nodes.map(r => members.get(r));
    const cost = nodes.map((r, i) => i === 0 ? null : comps.map(C => { const c = new Array(C.dims.length + 1).fill(0); for(const id of tiles[i]){ const m = cmpMask(id, C.T); for(let k = 0; k < C.dims.length; k++) if((m >> C.dims[k]) & 1) c[k]++; c[C.dims.length]++; } return c; }));
    const bud = comps.map(C => { const b = C.dims.map(i => C.cp[DIRS[i]] - C.cnt[i]); b.push(cap - mem.length); return b; });
    const exactDims = comps.map(C => C.dims.length);
    const hasCmp = nodes.map((r, i) => i > 0 && tiles[i].some(id => ctx.compasses.has(`${id % w},${(id - id % w) / w}`)));
    const sums = comps.map(C => new Array(C.dims.length + 1).fill(0));
    const inS = new Uint8Array(n), ex = new Uint8Array(n); inS[0] = 1;
    const S = [];
    let sizeNow = mem.length, calls = 0;
    const valid = () => {
      if(sizeNow < nd || sizeNow > cap) return false;
      for(let i = 0; i < comps.length; i++) for(let k = 0; k < exactDims[i]; k++) if(sums[i][k] !== bud[i][k]) return false;
      const P = mem.slice();
      for(const j of S) for(const id of tiles[j]) P.push(id);
      if(!boxPlacementOk(P, rep, dmap)) return false;
      if(mem.length > 1 || S.length > 0){
        markGen++;
        for(const id of P) markBuf[id] = markGen;
        const q = [P[0]], got = new Set([P[0]]);
        for(let qi = 0; qi < q.length; qi++) for(const { e, o } of adjE[q[qi]]) if(e.state !== 1 && markBuf[o] === markGen && !got.has(o)){ got.add(o); q.push(o); }
        if(got.size !== P.length) return false;
      }
      const cells = P.map(id => { const x = id % w; return [x, (id - x) / w]; });
      return passesMarkers(cells, canonicalShapeKey(cells), ctx);
    };
    const fits = j => { for(let i = 0; i < comps.length; i++) for(let k = 0; k < sums[i].length; k++) if(sums[i][k] + cost[j][i][k] > bud[i][k]) return false; return true; };
    const partialOk = () => {
      const cells = mem.map(id => [id % w, (id - id % w) / w]);
      for(const j of S) for(const id of tiles[j]) cells.push([id % w, (id - id % w) / w]);
      return compassPartialOk(ctx, cells, cap, null, null);
    };
    // one random valid piece (list of node indices) or null: random growth, restarted on a dead end
    const ATTEMPTS = globalThis.__SKETCH_ATTEMPTS || 150;
    const draw = () => {
      for(let at = 0; at < ATTEMPTS; at++){
        S.length = 0; inS.fill(0); inS[0] = 1; sizeNow = mem.length;
        for(const s of sums) s.fill(0);
        const stopP = 0.15 + rnd() * 0.5;                          // some attempts stop early, some grow on
        for(let step = 0; step < n; step++){
          if(valid() && rnd() < stopP) return S.slice();
          // frontier: groups that touch the piece and still fit every count
          const fr = [], wt = []; let tw = 0;
          for(let j = 1; j < n; j++){
            if(inS[j]) continue;
            let touch = false; for(const o of adj[j]) if(inS[o]){ touch = true; break; }
            if(!touch || !fits(j)) continue;
            // wants: the sides whose count is still short
            let want = 1;
            for(let i = 0; i < comps.length; i++) for(let k = 0; k < exactDims[i]; k++) if(cost[j][i][k] > 0 && sums[i][k] < bud[i][k]) want += 3;
            fr.push(j); wt.push(want); tw += want;
          }
          if(fr.length === 0) break;
          let x = rnd() * tw, pick = 0;
          for(; pick < fr.length - 1; pick++){ x -= wt[pick]; if(x <= 0) break; }
          const b = fr[pick];
          inS[b] = 1; S.push(b); sizeNow += tiles[b].length;
          for(let i = 0; i < comps.length; i++) for(let k = 0; k < sums[i].length; k++) sums[i][k] += cost[b][i][k];
          if(hasCmp[b] && !partialOk()) break;
        }
        if(valid()) return S.slice();
      }
      return null;
    };
    if(globalThis.__SKETCH_REGION && n <= 6) globalThis.__SKETCH_REGION({ T: mem[0], mem: mem.slice(), nodes: nodes.map(r => members.get(r).slice()), cap, nd, bud, dims: comps.map(C => C.dims) });
    return { nodes, idx, draw, n };
  }
  function* sketchRun(opts){
    const thetas = opts.sketchTheta || [0.95, 0.85];
    const K = opts.sketchSamples || 24, limitMs = opts.sketchMs || 60000, maxRounds = opts.sketchRounds || 80;   // the rounds are the real limit (the same on every machine); the time only a safety net
    let seed = (opts.sketchSeed || 1) >>> 0;
    const rnd = () => { seed = (seed + 0x6D2B79F5) >>> 0; let t = seed; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const t0 = nowMs();
    const sn0 = snapshot(), base = spots.map(e => e.state);
    const rejected = new Set();
    const guessList = [];
    let round = 0, acceptedN = 0, rejectedN = 0;
    const tables = () => {
      const nadj = cmpNodeAdj(), nmask = new Map();
      for(const [r, mm] of members){ let x = 0; for(const id of mm) x |= roseMask[id]; nmask.set(r, x); }
      return { nadj, nmask };
    };
    for(const theta of thetas){
      let again = true;
      while(again && nowMs() - t0 < limitMs && round < maxRounds){
        again = false;
        const pr = propagate();                                  // the true facts first, then the best guess
        if(pr === null){ yield { type: 'sketch-done', conflict: true, accepted: acceptedN, rejected: rejectedN, ms: nowMs() - t0 }; return; }
        if(!lastPass) break;
        const { need, capOf, maskOf, dmap } = lastPass;
        const { nadj, nmask } = tables();
        const cands = [];
        for(const [rep] of members){
          if(nowMs() - t0 > limitMs) break;
          const sm = cmpSampler(rep, need, capOf, maskOf, dmap, nadj, nmask, rnd);
          if(!sm) continue;
          const cnt = new Array(sm.n).fill(0); let got = 0;
          for(let k = 0; k < K; k++){ const S = sm.draw(); if(!S) continue; got++; for(const j of S) cnt[j]++; }
          if(got < Math.max(6, K / 3)) continue;                 // too few drawings to say anything
          const nb = nadj.get(rep);
          if(!nb) continue;
          for(const [nr, es] of nb){
            const j = sm.idx.get(nr);
            const f = j === undefined ? 0 : cnt[j] / got;
            const conf = Math.max(f, 1 - f);
            if(conf < theta) continue;
            const e = es.find(x => x.state === 0);
            if(!e) continue;
            const value = f >= 0.5 ? 'same' : 'wall';
            if(rejected.has(e.key + value)) continue;
            cands.push({ e, value, conf });
          }
        }
        cands.sort((a, b) => b.conf - a.conf);
        for(const c of cands){
          if(nowMs() - t0 > limitMs || round >= maxRounds) break;
          if(c.e.state !== 0) continue;
          const before = spots.map(e => e.state), sn = snapshot();
          c.e.state = c.value === 'wall' ? 1 : 2;
          if(c.value === 'same') union(c.e.a, c.e.b);
          inProbe = true; sketchCapture = true;
          const r = propagate();
          inProbe = false; sketchCapture = false;
          round++;
          // the correction: after the guess every compass piece must still be drawable (a soft contradiction drops the guess)
          let soft = false;
          if(r !== null && opts.sketchCheck !== false && lastPass){
            const t2 = tables();
            for(const [rep] of members){
              const sm = cmpSampler(rep, lastPass.need, lastPass.capOf, lastPass.maskOf, lastPass.dmap, t2.nadj, t2.nmask, rnd);
              if(sm && !sm.draw()){ soft = true; break; }
            }
          }
          if(r === null || soft){ restore(sn); rejected.add(c.e.key + c.value); rejectedN++; yield { type: 'sketch-rejected', spot: spotView(c.e), value: c.value, conf: c.conf, round, soft }; continue; }
          acceptedN++;
          guessList.push({ e: c.e, value: c.value });
          if(opts._guessOut) opts._guessOut.push({ e: c.e, value: c.value });
          yield { type: 'sketch', spot: spotView(c.e), value: c.value, hyp: true, conf: c.conf, round };
          for(let i = 0; i < spots.length; i++) if(before[i] === 0 && spots[i].state !== 0 && spots[i] !== c.e)
            yield { type: 'sketch', spot: spotView(spots[i]), value: spots[i].state === 1 ? 'wall' : 'same', hyp: false, conf: c.conf, round };
          again = true;
          break;                                                  // draw again on the new state
        }
      }
    }
    const open = spots.filter(e => e.state === 0).length;
    const redState = spots.map(e => e.state);
    restore(sn0);
    yield { type: 'sketch-done', conflict: false, accepted: acceptedN, rejected: rejectedN, open, ms: nowMs() - t0, state: redState.map((s, i) => base[i] === 0 && s !== 0 ? s : 0), guesses: guessList.length };
    // VERIFY: the guesses g1..gm cut the solutions into m+1 disjoint cases that cover all of them: "g1..gm all hold" and, for each i, "g1..g(i-1) hold and gi is
    // the opposite". Each case is propagated with the true rules (a contradiction closes the case for good); what is left, with every edge it decided, is handed to
    // the exact solver by the caller. Checking all the cases is checking every solution of the puzzle.
    if(opts.sketchVerify){
      const apply = (e, v) => { e.state = v === 'wall' ? 1 : 2; if(v === 'same') union(e.a, e.b); };
      const flip = v => v === 'wall' ? 'same' : 'wall';
      const remaining = guessList.slice(), prefix = [];
      const run = (flipOne) => {
        restore(sn0);
        for(const g of prefix) apply(g.e, g.value);
        if(flipOne) apply(flipOne.e, flip(flipOne.value));
        const was = inProbe; inProbe = false;
        const r = propagate();
        inProbe = was;
        if(r === null) return { refuted: true };
        const edges = [];
        for(const e of spots) if(e.state !== 0) edges.push({ c1: e.c1, r1: e.r1, c2: e.c2, r2: e.r2, key: e.key, value: e.state === 1 ? 'wall' : 'same' });
        return { refuted: false, edges };
      };
      let idx = 0;
      while(remaining.length > 0){
        // the order of the guesses is free: first any guess whose opposite the true rules already refute, the hard ones last
        let pick = -1, res = null, hard = null;
        for(let k = 0; k < remaining.length; k++){
          const r = run(remaining[k]);
          if(r.refuted){ pick = k; res = r; break; }
          if(!hard || r.edges.length > hard.res.edges.length) hard = { k, res: r };
        }
        if(pick < 0){ pick = hard.k; res = hard.res; }
        const g = remaining[pick];
        yield { type: 'branch', i: idx++, leaf: false, refuted: res.refuted, edges: res.edges, guess: { key: g.e.key, value: g.value } };
        prefix.push(g); remaining.splice(pick, 1);
      }
      const r = run(null);                                  // every guess holds
      yield { type: 'branch', i: idx, leaf: true, refuted: r.refuted, edges: r.edges, guess: null };
      restore(sn0);
    }
  }
  // one JOINT sketch: pieces are drawn and committed one after the other (walls all round), the true rules run after every commit.
  // returns { ok, pieces: [[tile ids]] } and leaves the state as it found it
  function jointAttempt(rnd, order){
    const sn = snapshot();
    const pieces = [], done = new Set();
    let ok = true;
    const cheap = () => { inProbe = true; sketchCapture = true; const r = propagate(); inProbe = false; sketchCapture = false; return r; };
    if(cheap() === null){ restore(sn); return { ok: false, pieces }; }
    for(let guard = 0; guard < 40 && ok; guard++){
      const nadj = cmpNodeAdj(), nmask = new Map();
      for(const [r, mm] of members){ let x = 0; for(const id of mm) x |= roseMask[id]; nmask.set(r, x); }
      // the next compass piece: the one with the fewest groups it could still use (or random)
      let best = null;
      for(const [rep, mm] of members){
        if(done.has(mm[0])) continue;
        const comps = cmpOf(mm);
        if(!comps || !comps.some(C => C.dims.length > 0)) continue;
        const sm = cmpSampler(rep, lastPass.need, lastPass.capOf, lastPass.maskOf, lastPass.dmap, nadj, nmask, rnd);
        if(!sm){ ok = false; break; }
        const key = order === 'random' ? rnd() : sm.n + rnd() * 0.5;
        if(!best || key < best.key) best = { key, rep, sm, mm };
      }
      if(!ok) break;
      if(!best) break;                                         // every compass piece is drawn
      const S = best.sm.draw();
      if(!S){ ok = false; break; }
      for(const j of S) union(best.rep, best.sm.nodes[j]);
      const rep = find(best.rep), tiles = members.get(rep).slice(), inP = new Set(tiles);
      for(const id of tiles){ if(ctx.compasses.has(`${id % w},${(id - id % w) / w}`)) done.add(id); }
      for(const e of spots) if(e.state === 0 && find(e.a) === find(e.b)) e.state = 2;
      for(const id of tiles) for(const { e, o } of adjE[id]) if(e.state === 0 && !inP.has(o)) e.state = 1;
      pieces.push(tiles);
      if(cheap() === null){ ok = false; break; }
    }
    restore(sn);
    return { ok, pieces };
  }

  // GUESS-AND-CHECK SEARCH: the sketch chooses the branching edges and their preferred values, the true rules prune. Complete: every case is either closed by
  // propagation, solved, or split again (the first open edge when the sketch has no guess). Returns { solutions: [[state per spot]], complete, nodes }.
  function* guessSolve(opts, deadline, maxSolutions){
    const sols = [], stats = { nodes: 0, complete: true, depth: 0, t0: nowMs(), firstMs: null };
    const apply = (e, v) => { e.state = v === 'wall' ? 1 : 2; if(v === 'same') union(e.a, e.b); };
    const flip = v => v === 'wall' ? 'same' : 'wall';
    const rec = function*(depth){
      if(sols.length >= maxSolutions) return;
      if(nowMs() > deadline){ stats.complete = false; return; }
      stats.nodes++; stats.depth = Math.max(stats.depth, depth);
      yield { type: 'guess-progress', nodes: stats.nodes, depth, found: sols.length, ms: nowMs() - stats.t0 };
      const was = inProbe; inProbe = false;
      const r = propagate();
      inProbe = was;
      if(r === null) return;                                     // closed
      const open = spots.filter(e => e.state === 0);
      if(open.length === 0){
        const state = spots.map(e => e.state);
        sols.push(state); if(stats.firstMs == null) stats.firstMs = nowMs() - stats.t0;
        yield { type: 'guess-found', state, ms: nowMs() - stats.t0 };       // reported at once: the search may go on for a long time
        return;
      }
      const sn = snapshot();
      // the guesses for this state
      const out = [];
      const o2 = Object.assign({}, opts, { sketch: true, sketchVerify: false, _guessOut: out, sketchMs: Math.max(500, Math.min(opts.nodeSketchMs || 30000, deadline - nowMs())), sketchRounds: opts.nodeSketchRounds || 40 });
      const gen = sketchRun(o2);
      for(let it = gen.next(); !it.done; it = gen.next()){ /* events are not needed here */ }
      restore(sn);
      let list = out.filter(g => g.e.state === 0);
      if(list.length === 0) list = [{ e: open[0], value: 'wall' }];
      const remaining = list.slice(), prefix = [], cases = [];
      const setUp = (pre, flipOne) => { restore(sn); for(const g of pre) apply(g.e, g.value); if(flipOne) apply(flipOne.e, flip(flipOne.value)); };
      while(remaining.length > 0){
        // a guess whose opposite is already closed by the rules costs nothing: take those first; the others go in the order drawn
        let pick = -1;
        for(let k = 0; k < remaining.length; k++){
          setUp(prefix, remaining[k]);
          const was2 = inProbe; inProbe = false;
          const r2 = propagate();
          inProbe = was2;
          if(r2 === null){ pick = k; break; }
        }
        if(pick >= 0){ prefix.push(remaining[pick]); remaining.splice(pick, 1); continue; }
        const g = remaining.shift();
        cases.push({ pre: prefix.slice(), flipOne: g });
        prefix.push(g);
      }
      cases.push({ pre: prefix.slice(), flipOne: null });
      // the cases are disjoint, so any order covers everything: all guesses hold first, then the latest guess flipped, then the one before ...
      for(let k = cases.length - 1; k >= 0; k--){
        setUp(cases[k].pre, cases[k].flipOne);
        yield* rec(depth + 1);
        if(sols.length >= maxSolutions || nowMs() > deadline){ if(nowMs() > deadline) stats.complete = false; break; }
      }
      restore(sn);
    };
    const sn0 = snapshot();
    yield* rec(0);
    restore(sn0);
    return { solutions: sols, complete: stats.complete, nodes: stats.nodes, depth: stats.depth, firstMs: stats.firstMs };
  }

  // GUESS LAYER: draw the red sketch (events 'sketch'), then search with it (events 'guess-progress'), then report every tiling found as a normal 'solution'.
  // Every tiling is re-checked by the exact solver with all its edges fixed (the exact solver knows nothing about the guesses), so a tiling is only reported if it is valid.
  // Last event: { type: 'guess-done', complete, nodes, depth, firstMs, found, invalid }. complete = every other case was closed by the rules, so "found 1" means unique.
  function* guessLayerRun(opts){
    yield* sketchRun(Object.assign({}, opts, { sketch: true, sketchVerify: false }));
    const deadline = nowMs() + (opts.guessMs || 1e12);
    let stats = null, found = 0, invalid = 0;
    const gen = guessSolve(opts, deadline, opts.guessMax || 2);
    let it = gen.next();
    while(!it.done){
      const ev = it.value;
      if(ev.type === 'guess-found'){
        const extraWalls = new Set(), links = [];
        spots.forEach((e, i) => { if(ev.state[i] === 1) extraWalls.add(e.key); else if(ev.state[i] === 2) links.push([e.c1, e.r1, e.c2, e.r2]); });
        let pieces = null;
        for(const sv of solvePuzzle(w, h, ctx, specialEdges, 0, { extraWalls, links })){ if(sv.type === 'solution'){ pieces = sv.pieces; break; } }
        if(pieces){ found++; yield { type: 'solution', pieces, ms: ev.ms }; } else invalid++;
      } else yield ev;
      it = gen.next();
    }
    stats = it.value;
    yield { type: 'guess-done', complete: stats.complete, nodes: stats.nodes, depth: stats.depth, firstMs: stats.firstMs, found, invalid };
  }

  // ---- shape bank ----
  const BANK_MAX_CAND = 700;                              // placements tried per group and pass (more = the group is skipped: always sound)
  const bankOn = !!ctx.useBank && !!loose && loose.length > 0;
  // every shape (bank + stamps, inside the size limits) holds a 2x2 block / a bend (3 tiles of a 2x2 window)
  let bankAllBlock = false, bankAllBend = false;
  if(bankOn){
    const holds = (sh, need) => {
      const cs = sh.orients[0].cells, set = new Set(cs.map(([x, y]) => x + ',' + y));
      for(const [x, y] of cs){
        const sq = [[x, y], [x + 1, y], [x, y + 1], [x + 1, y + 1]].filter(([a, b]) => set.has(a + ',' + b)).length;
        if(sq >= need) return true;
      }
      return false;
    };
    bankAllBlock = loose.every(sh => holds(sh, 4));
    bankAllBend = loose.every(sh => holds(sh, 3));
  }
  // bank-place: the placements of the bank's shapes that can still be the piece of group `rep`
  function bankPlaceStep(need, capOf, dmap){
    const out = [], link = [];
    if(inProbe) return out;                                                         // placements are the expensive part: top level only (a probe made 6x slower solves)
    for(const [rep, mem] of members){
      const len = mem.length, nd = Math.max(need.get(rep), len), cp = capOf.get(rep);
      if(cp < nd) continue;
      const x0 = mem[0] % w, y0 = (mem[0] - x0) / w;
      let est = 0; for(const sh of loose) if(sh.size >= nd && sh.size <= cp) est += sh.orients.length * sh.size;
      if(est > BANK_MAX_CAND) continue;                                         // too many placements to be worth it (sound: nothing is decided)
      const V = [], seen = new Set(); let tries = 0, tooMany = false;
      for(const sh of loose){
        if(sh.size < nd || sh.size > cp) continue;
        for(const ori of sh.orients){
          for(const [sx, sy] of ori.cells){
            if(++tries > BANK_MAX_CAND){ tooMany = true; break; }
            const ox = x0 - sx, oy = y0 - sy, P = []; let ok = true;
            for(const [cx, cy] of ori.cells){
              const X = cx + ox, Y = cy + oy;
              if(X < 0 || Y < 0 || X >= w || Y >= h || !ctx.isActive(X, Y)){ ok = false; break; }
              P.push(cid(X, Y));
            }
            if(!ok) continue;
            const key = P.slice().sort((a, b) => a - b).join(',');
            if(seen.has(key)) continue;
            seen.add(key);
            // the group must lie inside (markBuf is reused by boxPlacementOk, so test with a set)
            const ps = new Set(P); if(!mem.every(id => ps.has(id))) continue;
            if(boxPlacementOk(P, rep, dmap)) V.push(P);
          }
          if(tooMany) break;
        }
        if(tooMany) break;
      }
      if(tooMany) continue;
      if(V.length === 0){ why = 'bank-place'; return null; }
      for(const P of V) for(const id of P) cntBuf[id]++;
      const sure = V[0].filter(id => cntBuf[id] === V.length);
      for(const P of V) for(const id of P) cntBuf[id] = 0;
      for(const id of sure) for(const { e, o } of adjE[id]) if(e.state === 0 && sure.includes(o)){ e.state = 2; link.push(e); out.push({ e, value: 'same', rule: 'bank-place' }); }
      for(const P of V){
        markGen++;
        for(const id of P) markBuf[id] = markGen;
        for(const id of P) for(const { e, o } of adjE[id]) if(markBuf[o] !== markGen) edgeCnt[e.idx]++;
      }
      for(const P of V) for(const id of P) for(const { e } of adjE[id]){
        const n = edgeCnt[e.idx];
        if(n === 0) continue;
        edgeCnt[e.idx] = 0;
        if(n === V.length && e.state === 0){ e.state = 1; out.push({ e, value: 'wall', rule: 'bank-place' }); }
      }
    }
    for(const e of link) union(e.a, e.b);
    return out;
  }
  // bank-block / bank-bend: every piece holds a 2x2 block (4 tiles) / a bend (3 tiles); a tile must be able to reach one
  function bankBlockStep(capOf, dmap){
    const need3 = bankAllBlock ? 4 : 3, tag = bankAllBlock ? 'bank-block' : 'bank-bend';
    const open = (a, b) => { const e = edgeBetween(a % w, (a - a % w) / w, b % w, (b - b % w) / w); return !!e && e.state !== 1; };
    const dist = new Int32Array(N).fill(-1), q = [];
    const mark = ids => { for(const id of ids){ if(dist[id] < 0){ dist[id] = 0; q.push(id); } } };
    const act = (x, y) => x >= 0 && y >= 0 && x < w && y < h && ctx.isActive(x, y);
    for(let y = 0; y + 1 < h; y++) for(let x = 0; x + 1 < w; x++){
      const t = [[x, y], [x + 1, y], [x + 1, y + 1], [x, y + 1]];                    // clockwise; neighbours in the list are neighbours on the grid
      const on = t.map(([a, b]) => act(a, b));
      const id = t.map(([a, b], i) => on[i] ? cid(a, b) : -1), ok = [0, 1, 2, 3].map(i => on[i] && on[(i + 1) % 4] && open(id[i], id[(i + 1) % 4]));
      if(need3 === 4){
        if(on.every(Boolean) && ok.every(Boolean) && reps4ok(id, dmap)) mark(id);
      } else {
        for(let c = 0; c < 4; c++){                                                  // corner c with both its neighbours: tiles c-1, c, c+1 (the 4th tile of the window may be missing)
          const a = (c + 3) % 4;
          if(ok[a] && ok[c]) mark([id[a], id[c], id[(c + 1) % 4]]);
        }
      }
    }
    for(let qi = 0; qi < q.length; qi++){
      for(const { e, o } of adjE[q[qi]]){ if(e.state === 1 || dist[o] >= 0) continue; dist[o] = dist[q[qi]] + 1; q.push(o); }
    }
    for(const id of activeIds){
      const cp = capOf.get(find(id));
      if(dist[id] < 0 || need3 + dist[id] > cp){ why = tag; return null; }
    }
    return [];
  }
  // the four tiles of a window are not known to be different pieces
  function reps4ok(id, dmap){
    const r = id.map(find);
    for(let i = 0; i < 4; i++) for(let j = i + 1; j < 4; j++){ if(r[i] !== r[j]){ const d = dmap.get(r[i]); if(d && d.has(r[j])) return false; } }
    return true;
  }
  // ---- v84: match-hole (see patch_core84.py) ----
  const mhW = w + 2, mhH = h + 2, mhFill = new Int32Array(mhW * mhH); let mhFillN = 0, mhHoles = null;
  function matchHoleOk(){
    if(!mhHoles){                                                                // the board's holes: empty cells cut off from the outside
      mhHoles = new Map();
      const seen = new Uint8Array(mhW * mhH), off = (X, Y) => !(X >= 1 && Y >= 1 && X <= w && Y <= h && ctx.isActive(X - 1, Y - 1));
      for(let Y = 0; Y < mhH; Y++) for(let X = 0; X < mhW; X++){
        if(seen[Y * mhW + X] || !off(X, Y)) continue;
        const q = [[X, Y]]; seen[Y * mhW + X] = 1; let edge = false;
        for(let i = 0; i < q.length; i++){ const [x, y] = q[i]; if(x === 0 || y === 0 || x === mhW - 1 || y === mhH - 1) edge = true;
          for(const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]){ const a = x + dx, b = y + dy;
            if(a < 0 || b < 0 || a >= mhW || b >= mhH || seen[b * mhW + a] || !off(a, b)) continue; seen[b * mhW + a] = 1; q.push([a, b]); } }
        if(!edge){ const k = canonicalShapeKey(normalizeCells(q)); mhHoles.set(k, (mhHoles.get(k) || 0) + 1); }
      }
    }
    const S0 = sizeSet || matchS0 || []; if(!S0.length) return true;
    let anyWall = false; for(const e of edges) if(e.state === 1 || e.fixed){ anyWall = true; break; }
    const S = S0.filter(z => !(anyWall && z >= ctx.totalActive)); if(!S.length) return true;
    for(const [, mem] of members){
      if(mem.length < 4) continue;
      let x0 = Infinity, x1 = -1, y0 = Infinity, y1 = -1;
      for(const id of mem){ const x = id % w, y = (id - x) / w; if(x < x0) x0 = x; if(x > x1) x1 = x; if(y < y0) y0 = y; if(y > y1) y1 = y; }
      if(x1 - x0 < 2 || y1 - y0 < 2) continue;                                  // too thin to close around anything
      const inG = new Set(), first = mhFillN + 1;
      for(const id of mem){ const x = id % w; inG.add(((id - x) / w + 1) * mhW + x + 1); }
      // only cells inside the group's box can be closed in; start a fill from each of them. A fill that runs into an earlier fill of this
      // group is open (an earlier fill it can touch was cut short because it reached the outside).
      for(let y = y0 + 1; y <= y1 - 1; y++) for(let x = x0 + 1; x <= x1 - 1; x++){
        const st = (y + 1) * mhW + x + 1;
        if(mhFill[st] >= first || inG.has(st)) continue;
        const me = ++mhFillN, q = [st]; mhFill[st] = me; let edge = false, act = 0;
        for(let i = 0; i < q.length && !edge; i++){
          const c = q[i], cx = c % mhW, cy = (c - cx) / mhW;
          if(cx <= x0 || cy <= y0 || cx >= x1 + 2 || cy >= y1 + 2){ edge = true; break; }        // outside the box: open to the outside
          if(ctx.isActive(cx - 1, cy - 1)) act++;
          for(const n of [c + 1, c - 1, c + mhW, c - mhW]){
            if(inG.has(n) || mhFill[n] === me) continue;
            if(mhFill[n] >= first){ edge = true; break; }
            mhFill[n] = me; q.push(n); }
        }
        if(edge) continue;
        if(act > 0) continue;                                                     // active tiles inside may still join this very group
        const nh = mhHoles.get(canonicalShapeKey(normalizeCells(q.map(c => [c % mhW, (c - c % mhW) / mhW])))) || 0;
        if(S.every(z => nh < Math.floor(ctx.totalActive / z))){ why = 'match-hole'; return false; }
      }
    }
    return true;
  }
  let rootNeed = null, rootCap = null;                   // v88b: need / cap of the last root pass (after area-rel)
  // ---- v87a: cross (see patch_core87.py) ----
  const crSeen = new Int32Array(N); let crTick = 0;
  function crossOk(dmap){
    const split = [];
    for(const [rep, mem] of members){
      if(mem.length < 2) continue;
      const part = new Map(); let np = 0;
      for(const s0 of mem){ if(part.has(s0)) continue; const q = [s0]; part.set(s0, np);
        for(let i = 0; i < q.length; i++) for(const { e, o } of adjE[q[i]]) if(e.state === 2 && !part.has(o)){ part.set(o, np); q.push(o); }
        np++; }
      if(np >= 2) split.push({ rep, part });
    }
    if(split.length < 2) return true;
    for(let i = 0; i < split.length; i++) for(let j = i + 1; j < split.length; j++){
      const A = split[i], B = split[j], dA = dmap.get(A.rep);
      if(!dA || !dA.has(B.rep)) continue;                                   // only pieces known to differ
      const dB = dmap.get(B.rep) || new Set();
      const use = id => { const g = find(id); return g === A.rep || g === B.rep || !(dA.has(g) && dB.has(g)); };
      const tk = ++crTick, q = [A.part.keys().next().value]; crSeen[q[0]] = tk;
      for(let k = 0; k < q.length; k++) for(const { e, o } of adjE[q[k]]) if(e.state !== 1 && crSeen[o] !== tk && use(o)){ crSeen[o] = tk; q.push(o); }
      const inR = id => crSeen[id] === tk;
      let allIn = true; for(const P of [A, B]) for(const t of P.part.keys()) if(!inR(t)){ allIn = false; break; }
      if(!allIn) continue;
      const W1 = w + 1, segs = new Map(), list = [];
      const open = (id, dx, dy) => { const x = id % w, y = (id - x) / w, X = x + dx, Y = y + dy;
        if(X < 0 || Y < 0 || X >= w || Y >= h || !ctx.isActive(X, Y)) return false; const o = cid(X, Y); if(!inR(o)) return false;
        for(const { e, o: o2 } of adjE[id]) if(o2 === o) return e.state !== 1; return false; };
      for(const id of q){ const x = id % w, y = (id - x) / w;
        const add = (x0, y0, x1, y1) => { const sg = { id, a: y0 * W1 + x0, b: y1 * W1 + x1, dx: x1 - x0, dy: y1 - y0, used: false }; list.push(sg); let L = segs.get(sg.a); if(!L){ L = []; segs.set(sg.a, L); } L.push(sg); };
        if(!open(id, 0, -1)) add(x + 1, y, x, y);
        if(!open(id, 0, 1)) add(x, y + 1, x + 1, y + 1);
        if(!open(id, -1, 0)) add(x, y, x, y + 1);
        if(!open(id, 1, 0)) add(x + 1, y + 1, x + 1, y);
      }
      const lab = id => { const g = find(id); if(g === A.rep) return 'a' + A.part.get(id); if(g === B.rep) return 'b' + B.part.get(id); return null; };
      for(const s0 of list){
        if(s0.used) continue;
        const seq = []; let cur = s0;
        while(cur && !cur.used){
          cur.used = true; const L = lab(cur.id); if(L !== null && seq[seq.length - 1] !== L) seq.push(L);
          const outs = segs.get(cur.b) || []; let nxt = null;
          for(const [tx, ty] of [[cur.dy, -cur.dx], [cur.dx, cur.dy], [-cur.dy, cur.dx], [-cur.dx, -cur.dy]]){        // left, straight, right, back (the tip of a wall)
            nxt = outs.find(sg => !sg.used && sg.dx === tx && sg.dy === ty) || null; if(nxt) break; }
          cur = nxt;
        }
        while(seq.length > 1 && seq[0] === seq[seq.length - 1]) seq.pop();
        const ap = [...new Set(seq.filter(l => l[0] === 'a'))], bp = [...new Set(seq.filter(l => l[0] === 'b'))];
        for(let u = 0; u < ap.length; u++) for(let v = u + 1; v < ap.length; v++) for(let r = 0; r < bp.length; r++) for(let z = r + 1; z < bp.length; z++){
          const keep = new Set([ap[u], ap[v], bp[r], bp[z]]), c = [];
          for(const l of seq) if(keep.has(l) && c[c.length - 1] !== l) c.push(l);
          while(c.length > 1 && c[0] === c[c.length - 1]) c.pop();
          if(c.length === 4 && c[0][0] !== c[1][0] && c[1][0] !== c[2][0] && c[2][0] !== c[3][0] && c[0] !== c[2] && c[1] !== c[3]){ why = 'cross'; return false; }
        }
      }
    }
    return true;
  }
  function propagate(){
    const all = [];
    for(let pass = 0; pass < 1000; pass++){
      const part = propagateOnce();
      if(part === null) return null;
      if(part.length === 0 && !part.again) break;
      for(const ch of part){ ch.pass = pass; all.push(ch); }          // v47: pass number, reported on the deduce events
    }
    return all;
  }
  function propagateOnce(){
    if(boxOn && nbOn && activeIds.length > 0){ failWhy = 'box-both'; return null; }                       // v32: Boxy and Non-boxy together
    if(solDouble){ failWhy = 'solitude-count'; return null; }
    if(roseUnbalanced){
      let realBalanced = roseTypeList.length > 0 && roseCount[0] > 0;                      // the roses alone are fine, so it is the other symbols that break Solitude
      for(let i = 1; i < roseTypeList.length; i++) if(roseCount[i] !== roseCount[0]) realBalanced = false;
      failWhy = (solBit >= 0 && realBalanced) ? 'solitude-count' : roseTag('count'); return null;
    }
    if(staticWhy){ failWhy = staticWhy; return null; }                                  // v25: the grid alone rules Match / Mismatch out
    if(heteroStatic){ failWhy = 'hetero-count'; return null; }                          // v90
    if(roseCutWhy){ failWhy = roseCutWhy; return null; }                                // v53: a cut needs more pieces than it has tiles
    if(dStamp && !derivePrepare()){ failWhy = why; return null; }                       // v29: shapes pinned across gemini / delta walls
    if(bothRules){ const bt = bothStep(); if(bt === null){ failWhy = why; return null; } if(bt.length > 0) return bt; }
    if(ruleMatch && !matchPrepare()){ failWhy = why; return null; }                     // v25: common size / shape list for this pass
    const diff = new Set(), dmap = new Map(), diffWhy = new Map();
    const addDiff = (ra, rb, tag) => {
      const k = ra < rb ? ra * N + rb : rb * N + ra;
      diff.add(k);
      if(tag && !diffWhy.has(k)) diffWhy.set(k, tag);
      if(!dmap.has(ra)) dmap.set(ra, new Set()); dmap.get(ra).add(rb);
      if(!dmap.has(rb)) dmap.set(rb, new Set()); dmap.get(rb).add(ra);
    };
    for(const e of edges){
      if(e.state !== 1) continue;
      const ra = find(e.a), rb = find(e.b);
      if(ra === rb){ failWhy = 'wall-inside'; return null; }
      addDiff(ra, rb);
    }
    for(const [fa, fb, ft] of forbidden){
      const ra = find(fa), rb = find(fb);
      if(ra === rb){ failWhy = ft || 'forbidden'; return null; }                // two tiles that cannot share a piece were forced together
      addDiff(ra, rb, ft);
    }
    if(eulerBudget !== null){ const eu = eulerStep(); if(eu === null){ failWhy = why; return null; } if(eu.length > 0) return eu; }      // v42
    { const cl = colourStep(dmap); if(cl === null){ failWhy = why; return null; } if(cl.length > 0) return cl; }      // v44
    if(isoCase){ const io = isoStep(); if(io === null){ failWhy = why; return null; } if(io.length > 0) return io; }                      // v46
    if(rcOn){ const rc = roseCutStep(dmap); if(rc === null){ failWhy = why; return null; } if(rc.length > 0) return rc; }     // v53
    if(gdPairs.length > 0){ const gc = gdClashStep(dmap); if(gc === null){ failWhy = why; return null; } if(gc.again) return gc; }       // v53d
    if(opts.crossCheck !== false && !searchLite && !crossOk(dmap)){ failWhy = 'cross'; return null; }                        // v87a
    if(ruleMatch && opts.matchHole !== false && !staticWhy && !matchHoleOk()){ failWhy = 'match-hole'; return null; }        // v84
    if(gemIso){ const gi = gemIsoStep(dmap); if(gi === null){ failWhy = why; return null; } if(gi.length > 0 || gi.again) return gi; }      // v52
    if(isoK){ const ik = isoKStep(dmap); if(ik === null){ failWhy = why; return null; } if(ik.length > 0 || ik.again) return ik; }          // v48
    if(dcPairs.length > 0){ const dc = diffClashStep(dmap); if(dc === null){ failWhy = why; return null; } if(dc.again) return dc; }       // v55
    if(rcvOn && !inProbe && !searchLite){ const cv = roseCoverStep(dmap); if(cv === null){ failWhy = why; return null; } if(cv.again) return cv; }     // v57
    if(lbOn && (lbSized || (!inProbe && !searchLite)) && (!searchLite || opts.labelSearch !== false) && (!inProbe || opts.labelProbe !== false)){ const lb = labelStep(dmap); if(lb === null){ failWhy = why; return null; } if(lb.length > 0) return lb; }     // v58
    if(dsOn && !inProbe && !searchLite){ const ds = diffSmallStep(dmap); if(ds === null){ failWhy = why; return null; } if(ds.length > 0) return ds; }     // v56
    const changes = [];
    // every group must still be able to be a piece
    const need = new Map(), capOf = new Map(), maskOf = new Map();
    for(const [rep, mem] of members){
      const nd = pieceInfo(mem);
      if(nd === null){ failWhy = why; return null; }
      need.set(rep, nd.need); capOf.set(rep, nd.cap); maskOf.set(rep, nd.mask);
      if((relOn || mingleModes.length > 0) && opts.closedSize !== false && mem.length >= nd.need && mem.length < nd.cap && groupComplete(rep, mem)){ need.set(rep, mem.length); capOf.set(rep, mem.length); }   // v55b, v72: + Size Separation / Mingle Shape
    }
    if(ruleMatch && !matchRefine(need, capOf)){ failWhy = why; return null; }          // v25: every group gets the common size range
    if(gdAll.length > 0 && opts.gdComplete !== false && !gdCompleteStep(need, capOf)){ failWhy = why; return null; }   // v52
    if(heteroOn && !heteroStep(need, capOf)){ failWhy = why; return null; }            // v90
    // v26: every piece has at least the Minimum (smallest size that occurs in a cover): forced growth and reachability use it
    let needBase = null;
    if(minOn){
      needBase = new Map(need);                                                          // what the other rules alone ask for (for the rule names)
      if(rangeSet){ const sv = rangeSet; rangeSet = null; for(const [rep, mem] of members){ const r = pieceInfo(mem); if(r) needBase.set(rep, r.need); } rangeSet = sv; }
      for(const rep of members.keys()){
        if(need.get(rep) < rLo) need.set(rep, rLo);
        if(need.get(rep) > capOf.get(rep)){ failWhy = 'size'; return null; }
      }
    }
    for(const e of spots){
      if(e.state !== 0) continue;
      const ra = find(e.a), rb = find(e.b);
      const dk = ra < rb ? ra * N + rb : rb * N + ra;
      if(ra === rb){ e.state = 2; changes.push({ e, value: 'same' }); }
      else if(diff.has(dk)){ e.state = 1; changes.push({ e, value: 'wall', rule: diffWhy.get(dk) }); }
      else if(pieceInfo(members.get(ra).concat(members.get(rb))) === null){ e.state = 1; changes.push({ e, value: 'wall', rule: why }); }
    }
    if(changes.length > 0) return changes;              // let the new walls spread before looking for forced growth
    if(!inProbe || sketchCapture) lastPass = { need, capOf, maskOf, dmap };
    // v36: bricky
    if(briOn){
      const br = briVertexStep(dmap);
      if(br === null){ failWhy = why; return null; }
      if(br.length > 0) return br;
    }
    { const sc = sizeCutStep(); if(sc === null){ failWhy = why; return null; } if(sc.length > 0) return sc; }       // v69c
    // roses: regions closed in by walls
    if(K > 0){
      const rg = regionStep();
      if(rg === null){ failWhy = why; return null; }
      if(rg.length > 0 || rg.again) return rg;
    }
    if(ruleMatch){
      const mr = matchRegionStep();
      if(mr.length > 0 || mr.again) return mr;
    }
    // v37: loopy
    if(looOn){
      const lp = loopyStep(dmap);
      if(lp === null){ failWhy = why; return null; }
      if(lp.length > 0) return lp;
    }
    // v96: wally-ends (a Wally piece is a path with two ends, a ring or a single tile)
    if(weOn){ const we = wallyEndsStep(); if(we === null){ failWhy = why; return null; } if(we.length > 0) return we; }
    { const br = bridgeStep();
      if(br === null){ failWhy = why; return null; }
      if(br.length > 0) return br; }
    // v33: watchtowers, shape bank
    if(towerOn){
      const tw = towerStep(capOf, dmap);
      if(tw === null){ failWhy = why; return null; }
      if(tw.length > 0) return tw;
    }
    // Mingle Area / Mingle Shape: neighbouring pieces differ (tightens need / capOf, may decide edges)
    if(mingleModes.length > 0){
      const mg = mingleStep(need, capOf);
      if(mg === null){ failWhy = why; return null; }
      if(mg.length > 0) return mg;
    }
    // v27: walls that compare sizes (lt / gt / diffN / gemini): the sizes each piece can still have
    if(relOn){
      const rl = relStep(need, capOf, dmap);
      if(rl === null){ failWhy = why; return null; }
      if(rl.length > 0) return rl;
    }
    if(!inProbe && !searchLite){ rootNeed = need; rootCap = capOf; }                                                  // v88b
    // v26: regions closed in by walls must be coverable by pieces of the allowed sizes
    if(RI){
      const rg = rangeStep(need, capOf);
      if(rg === null){ failWhy = why; return null; }
      if(rg.length > 0 || rg.again) return rg;
    }
    // v27: area numbers (and stamps): how many pieces do the numbers need in each region closed in by walls?
    if((areaOn || relOn) && !inProbe){
      const ar = areaStep(dmap, addDiff);
      if(ar === null){ failWhy = why; return null; }
      if(ar.length > 0 || ar.again) return ar;
    }
    // v66b: a group in several parts (joined without touching): every part must reach the rest -> no way out = impossible, one = used
    if(opts.splitGrow !== false) for(const [rep, mem] of members){
      if(mem.length < 2) continue;
      const part = new Map(); let np = 0;
      for(const s0 of mem){
        if(part.has(s0)) continue;
        const q = [s0]; part.set(s0, np);
        for(let i = 0; i < q.length; i++) for(const { e, o } of adjE[q[i]]) if(e.state === 2 && !part.has(o)){ part.set(o, np); q.push(o); }
        np++;
      }
      if(np < 2) continue;
      const exits = Array.from({ length: np }, () => []);
      for(const id of mem) for(const { e, o } of adjE[id]) if(e.state === 0 && find(o) !== rep) exits[part.get(id)].push(e);
      for(let p = 0; p < np; p++){
        if(exits[p].length === 0){ failWhy = 'grow'; return null; }
        if(exits[p].length === 1){ const e = exits[p][0]; e.state = 2; union(e.a, e.b); changes.push({ e, value: 'same', rule: 'grow' }); return changes; }
      }
    }
    // v92c: split-cut. The parts of a split group must meet through tiles that may still join it (not across walls, not through groups known
    // to be other pieces or holding a rose type it already has). A group that every such connection passes through belongs to its piece.
    if(opts.splitCut !== false && (!searchLite || opts.splitCutSearch !== false)) for(const [rep, mem] of members){
      if(mem.length < 2) continue;
      const part = new Map(); let np = 0;
      for(const s0 of mem){
        if(part.has(s0)) continue;
        const q = [s0]; part.set(s0, np);
        for(let i = 0; i < q.length; i++) for(const { e, o } of adjE[q[i]]) if(e.state === 2 && !part.has(o)){ part.set(o, np); q.push(o); }
        np++;
      }
      if(np < 2) continue;
      const blocked = dmap.get(rep), mask = K > 0 ? maskOf.get(rep) : 0;
      const nodeOf = new Map(), gOf = [];                                  // other groups -> node np + k
      const node = t => { const g = find(t); if(g === rep) return part.get(t);
        let n = nodeOf.get(g);
        if(n === undefined){ n = ((blocked && blocked.has(g)) || (mask && (maskOf.get(g) & mask))) ? -1 : np + gOf.length; if(n >= 0) gOf.push(g); nodeOf.set(g, n); }
        return n; };
      const adj = [];
      const link = (a, b) => { (adj[a] || (adj[a] = new Set())).add(b); (adj[b] || (adj[b] = new Set())).add(a); };
      for(const e of edges){ if(e.state === 1) continue; const a = node(e.a), b = node(e.b); if(a >= 0 && b >= 0 && a !== b) link(a, b); }
      const nn = np + gOf.length, disc = new Int32Array(nn).fill(-1), low = new Int32Array(nn), term = new Int32Array(nn), must = [];
      let clock = 0;
      const dfs = (v, par) => {
        disc[v] = low[v] = clock++; term[v] = v < np ? 1 : 0;
        if(adj[v]) for(const c of adj[v]){
          if(c === par) continue;
          if(disc[c] >= 0){ if(disc[c] < low[v]) low[v] = disc[c]; continue; }
          dfs(c, v);
          if(low[c] < low[v]) low[v] = low[c];
          term[v] += term[c];
          if(v >= np && low[c] >= disc[v] && term[c] > 0 && must.indexOf(v) < 0) must.push(v);
        }
      };
      dfs(0, -1);
      if(term[0] < np){ failWhy = 'grow'; return null; }                   // a part can not be reached at all
      if(must.length){
        for(const v of must){ const fr = factRec; if(fr) factLog.push([mem[0], members.get(gOf[v - np])[0], 'split-cut']); factRec = false; union(rep, gOf[v - np]); factRec = fr; }
        bump('split-cut'); changes.again = true; return changes;
      }
    }
    // v40: area numbers that exactly fill a region (no piece without a number can exist)
    if(areaOn){
      const as = areaSumStep(dmap);
      if(as === null){ failWhy = why; return null; }
      if(as.length > 0 || as.again) return as;                                     // v77: .again after area-join
    }
    // stamps: where can each one still go?
    if(stampTiles.length > 0){
      const st = stampStep(dmap);
      if(st === null){ failWhy = why; return null; }
      if(st.length > 0 || st.again) return st;
    }
    // v35: palisades
    if(palOn){
      const pl = palisadeStep(dmap);
      if(pl === null){ failWhy = why; return null; }
      if(pl.length > 0) return pl;
    }
    if(bankOn && (bankAllBlock || bankAllBend)){ if(bankBlockStep(capOf, dmap) === null){ failWhy = why; return null; } }      // v95: own step
    // Mismatch: all pieces differ (same-shape stamps / pinned shapes are one piece; pinned shapes leave the others), Match: closed regions
    if(ruleMismatch){
      const mm = mismatchStep(need, capOf, dmap);
      if(mm === null){ failWhy = why; return null; }
      if(mm.length > 0 || mm.again) return mm;
    }
    // forced growth: a group smaller than the piece it must become -- or lacking a rose type -- that has exactly one open edge out has to use it
    const exits = new Map();
    for(const e of spots){
      if(e.state !== 0) continue;
      const ra = find(e.a), rb = find(e.b);
      if(!exits.has(ra)) exits.set(ra, []); exits.get(ra).push(e);
      if(!exits.has(rb)) exits.set(rb, []); exits.get(rb).push(e);
    }
    for(const [rep, mem] of members){
      const lacks = K > 0 && maskOf.get(rep) !== FULL;
      if(mem.length >= need.get(rep) && !lacks) continue;
      const ex = exits.get(rep) || [];
      const minOnly = !lacks && needBase !== null && mem.length >= needBase.get(rep);      // v26: it is the Minimum that asks for more tiles
      if(ex.length === 0){ failWhy = lacks ? roseTag('grow') : (minOnly ? 'min-reach' : 'no-exit'); return null; }                  // too small (or missing a rose) and nowhere to grow
      if(ex.length === 1){
        const e = ex[0]; e.state = 2; union(e.a, e.b); changes.push({ e, value: 'same', rule: lacks ? roseTag('grow') : (relRaised.has(rep) ? 'area-rel' : (minOnly ? 'min-grow' : 'grow')) });
        return changes;
      }
    }
    // reachability look-ahead (groups that still have to grow, lack a rose, or carry a compass)
    for(const [rep, mem] of members){
      const compassIn = hasCompass && mem.some(id => { const x = id % w; return ctx.compasses.has(`${x},${(id - x) / w}`); });
      const lacks = K > 0 && maskOf.get(rep) !== FULL;
      if(mem.length >= need.get(rep) && !compassIn && !lacks) continue;
      const blocked = dmap.get(rep) || new Set(), nd = need.get(rep), cp = capOf.get(rep);
      const fast = K === 0 && !compassIn;                  // v26: without roses / compasses only the NUMBER of reachable tiles matters: count with early exit
      const baseNd = needBase !== null ? needBase.get(rep) : nd;
      let reachCnt = 0;
      const reachFails = closed => {
        if(fast){ reachCnt = reachCount(rep, mem, blocked, closed, nd); reachWhy = 'reach'; return reachCnt < nd; }
        return !reachOk(rep, mem, blocked, closed, nd, cp);
      };
      const reachTag = closed => {                         // the Minimum alone made it fail: the group could still reach what its other rules need
        if(reachWhy !== 'reach' || nd === baseNd) return reachWhy;
        return (fast ? reachCnt >= baseNd : reachOk(rep, mem, blocked, closed, baseNd, cp)) ? 'min-reach' : reachWhy;
      };
      if(reachFails(null)){ failWhy = reachTag(null); return null; }
      for(const e of (exits.get(rep) || [])){
        if(reachFails(e)){ e.state = 2; union(e.a, e.b); changes.push({ e, value: 'same', rule: reachTag(e) }); return changes; }
      }
    }
    // Match with one shape left: where can it still go, for every group?
    if(ruleMatch && matchList && matchList.length === 1){
      const mp = matchPlaceStep(dmap);
      if(mp === null){ failWhy = why; return null; }
      if(mp.length > 0 || mp.again) return mp;
    }
    // v32: Boxy / Non-boxy
    if(boxOn || nbOn){
      const bx = boxStep(need, capOf, dmap);
      if(bx === null){ failWhy = why; return null; }
      if(bx.length > 0 || bx.again) return bx;
    }
    if(rcDyn && (!inProbe || opts.roseCutProbe !== false) && (!searchLite || opts.roseCutSearch === true)){      // v53: rose-cut again, with the walls decided so far (not inside the final search: too slow there)
      const rd = roseCutDynStep(dmap);
      if(rd === null){ failWhy = why; return null; }
      if(rd.length > 0 || rd.again) return rd;
    }
    if(gpOn && !inProbe && !searchLite){ const gp = gemPlaceStep(need, capOf, dmap); if(gp === null){ failWhy = why; return null; } if(gp.length > 0) return gp; }     // v64 (after relStep: gemini sizes shared)
    if(mhOn && !inProbe && !searchLite){ const mh = boxHallStep(need, capOf, dmap, polyCands, 'mismatch-hall'); if(mh === null){ failWhy = why; return null; } if(mh.length > 0) return mh; }     // v60 (needs need / capOf of this pass)
    // v38: compass
    if(hasCompass){
      const cm = compassStep(need, capOf, maskOf, dmap);
      if(cm === null){ failWhy = why; return null; }
      if(cm.length > 0 || cm.again) return cm;
    }
    if(bankOn){
      const bp = bankPlaceStep(need, capOf, dmap);
      if(bp === null){ failWhy = why; return null; }
      if(bp.length > 0) return bp;
    }
    if(relOn && boxOn && !searchLite && opts.boxAfterRel !== false){        // v86a: the rectangles again, with area-rel's sizes (v95: own step, after the relations)
      const p2 = boxPlaceStep(need, capOf, dmap);
      if(p2 === null){ failWhy = why; return null; }
      if(p2.length > 0) return p2;
    }
    if(hasCompass && (!inProbe || globalThis.__CMP_PROBE)){                          // v38: where can each compass piece still go?
      const cpl = compassPlaceStep(need, capOf, maskOf, dmap);
      if(cpl === null){ failWhy = why; return null; }
      if(cpl.length > 0 || cpl.again) return cpl;
      const crd = compassCrowdStep(need, capOf, maskOf, dmap);
      if(crd === null){ failWhy = why; return null; }
      if(crd.length > 0 || crd.again) return crd;
      const tpr = compassTileProbeStep(need, capOf, maskOf, dmap);
      if(tpr.length > 0 || tpr.again) return tpr;
    }
    if(areaOn && apSmallK && !searchLite){                                 // v53b: where can each area-number piece go? (few pieces only)
      const ap = areaPlaceStep(dmap);
      if(ap === null){ failWhy = why; return null; }
      if(ap.length > 0 || ap.again) return ap;
    }
    return changes;
  }

  // ---- pieces that are finished: every boundary of the group is a decided wall ----
  const announced = new Set();
  function completeShapes(rootsToCheck){
    const out = [];
    for(const root0 of rootsToCheck){
      const root = find(root0);
      if(announced.has(root)) continue;
      const cells = members.get(root);
      let complete = true;
      scan:
      for(const id of cells){
        const c = id % w, r = (id - c) / w;
        for(const [dc,dr] of [[1,0],[-1,0],[0,1],[0,-1]]){
          const nc = c+dc, nr = r+dr;
          if(nc < 0 || nr < 0 || nc >= w || nr >= h || !ctx.isActive(nc,nr)) continue;
          if(find(cid(nc,nr)) === root) continue;
          const e = edgeBetween(c, r, nc, nr);
          if(!e || e.state !== 1){ complete = false; break scan; }
        }
      }
      if(complete){
        announced.add(root);
        out.push(cells.map(id => { const c = id % w; return [c, (id - c) / w]; }));
      }
    }
    return out;
  }

  // ---- the order spots are examined in ----
  let spotOrder = spots.slice();
  if(order === 'clues'){
    const dist = new Map(), queue = [];
    const seed = (c,r) => { const k = cid(c,r); if(ctx.isActive(c,r) && !dist.has(k)){ dist.set(k, 0); queue.push(k); } };
    for(const id of activeIds){ const c = id % w, r = (id - c) / w; if(symbolCountAt(c, r, ctx) > 0) seed(c, r); }
    for(const se of (specialEdges || [])){ seed(se.c1, se.r1); seed(se.c2, se.r2); }
    if(ctx.watchtowers) for(const k of ctx.watchtowers.keys()){ const [vx,vy] = k.split(',').map(Number); seed(vx-1,vy-1); seed(vx,vy-1); seed(vx-1,vy); seed(vx,vy); }
    for(let qi=0; qi<queue.length; qi++){
      const id = queue[qi], c = id % w, r = (id - c) / w, d = dist.get(id);
      for(const [dc,dr] of [[1,0],[-1,0],[0,1],[0,-1]]){
        const nc = c+dc, nr = r+dr;
        if(nc < 0 || nr < 0 || nc >= w || nr >= h || !ctx.isActive(nc,nr)) continue;
        const k = cid(nc,nr);
        if(!dist.has(k)){ dist.set(k, d+1); queue.push(k); }
      }
    }
    const pri = e => Math.min(dist.has(e.a) ? dist.get(e.a) : 1e9, dist.has(e.b) ? dist.get(e.b) : 1e9);
    spotOrder = spots.map((e, i) => ({ e, i, p: pri(e) })).sort((x, y) => x.p - y.p || x.i - y.i).map(x => x.e);
  }

  // ---- bookkeeping ----
  const stats = { spots: spots.length, tests: 0, contradictions: 0, timeouts: 0, solutionsSeen: 0,
                  bySearch: 0, byInference: 0, scanMs: 0, scans: 0, byRule: {} };
  const bump = rule => { const r = rule || 'basic'; stats.byRule[r] = (stats.byRule[r] || 0) + 1; };
  const openCount = () => { let n = 0; for(const e of spots) if(e.state === 0) n++; return n; };
  const counts = () => { let walls = 0, same = 0, open = 0; for(const e of spots){ if(e.state === 1) walls++; else if(e.state === 2) same++; else open++; } return { walls, links: same, open }; };

  // ---- witness: a complete tiling known to satisfy everything decided so far ----
  let witness = null;                           // { pieces, pieceOf: Int32Array }
  function setWitness(pieces){
    const pieceOf = new Int32Array(N).fill(-1);
    pieces.forEach((p, idx) => p.cells.forEach(([c,r]) => { pieceOf[cid(c,r)] = idx; }));
    witness = { pieces, pieceOf };
  }
  const witnessValue = e => witness.pieceOf[e.a] === witness.pieceOf[e.b] ? 'same' : 'wall';

  // ---- one narrow search ----
  // The time of one narrow search is split between orderings that are good at different things: 'near' grows outward
  // from the edge (finds contradictions that come from the edge's neighbourhood), 'first' covers the edge's two tiles
  // and then uses the normal ordering (finds tilings quickly). Either one running dry is a proof.
  // portfolio: list of [focusMode, share of the time]; a single mode can be forced with opts.focusMode.
  const nearShare = opts.nearShare != null ? Math.min(1, Math.max(0, opts.nearShare)) : 0.4;
  const portfolio = focusMode === 'mix'
    ? [['near', nearShare], ['first', 1 - nearShare]].filter(p => p[1] > 0)
    : [[focusMode, 1]];
  function narrow(e, assume){
    const extra = new Set(), links = [];
    for(const x of spots){
      if(x.state === 1) extra.add(x.key);
      else if(x.state === 2) links.push([x.c1, x.r1, x.c2, x.r2]);
    }
    if(assume === 'wall') extra.add(e.key); else links.push([e.c1, e.r1, e.c2, e.r2]);
    const t0 = nowMs();
    let outcome = 'timeout', pieces = null;
    for(const [mode, share] of portfolio){
      const o = { extraWalls: extra, links, focus: [[e.c1, e.r1], [e.c2, e.r2]], focusMode: mode,
                  deadline: testNodes ? null : nowMs() + testMs * share };
      let result = 'contradiction';
      for(const ev of solvePuzzle(w, h, ctx, specialEdges, testNodes ? Math.max(1, Math.round(testNodes * share)) : 0, o)){
        if(ev.type === 'solution'){ result = 'solution'; pieces = ev.pieces; break; }
        if(ev.type === 'timeout' || ev.type === 'budget-exceeded'){ result = 'timeout'; break; }
      }
      outcome = result;
      if(result !== 'timeout') break;           // proved or found a tiling: no need for the other ordering
    }
    return { outcome, pieces, ms: nowMs() - t0 };
  }

  // applies a proven value, then lets inference spread it. Yields deduce / shape events.
  // Returns false when the puzzle turned out to be contradictory.
  let causeN = 0;                                  // v47: number of the current apply() call (see the header of patch_core47.py)
  function* apply(e, value, source, rule, rawWhy){
    const cause = ++causeN;
    e.state = value === 'wall' ? 1 : 2;
    if(value === 'same') union(e.a, e.b);
    if(source === 'search'){ stats.bySearch++; bump('search'); } else { stats.byInference++; bump(rule); }
    const touched = [e.a, e.b];
    let c = counts();
    yield { type: 'deduce', spot: spotView(e), value, source, rule: source === 'search' ? 'search' : (tagOut(rule) || 'basic'), via: source === 'search' ? 'search' : 'probe', why: rawWhy || '', cause, pass: -1, open: c.open, walls: c.walls, links: c.links };
    factLog.length = 0; factRec = true;
    let changes; try { changes = propagate(); } finally { factRec = false; }
    if(changes === null) return false;
    yield* drainFacts(cause);
    for(const ch of changes){
      stats.byInference++; bump(ch.rule);
      touched.push(ch.e.a, ch.e.b);
      c = counts();
      yield { type: 'deduce', spot: spotView(ch.e), value: ch.value, source: 'inference', rule: tagOut(ch.rule) || 'basic', via: 'rule', cause, pass: ch.pass, open: c.open, walls: c.walls, links: c.links };
    }
    for(const cells of completeShapes(touched)) yield { type: 'shape', cells, cause };
    return true;
  }

  // v93: facts about tiles that do not touch, reported to the page
  const factXY = id => [id % w, (id - id % w) / w];
  function* drainFacts(cause){ while(factLog.length){ const [a, b, rule] = factLog.shift(); yield { type: 'fact', kind: 'join', a: factXY(a), b: factXY(b), rule, cause }; } }
  // ---- start ----
  yield { type: 'plan', spots: spots.length, fixedWalls: edges.length - spots.length, order };
  if(opts.preAssume) for(const [k, v] of opts.preAssume){                                  // v52: analysis only
    const e = edgeByKey.get(k);
    if(!e || e.state !== 0) continue;
    e.state = v === 'wall' ? 1 : 2; if(v !== 'wall') union(e.a, e.b);
  }
  if(opts.preJoin) for(const [x1, y1, x2, y2] of opts.preJoin) union(find(cid(x1, y1)), find(cid(x2, y2)));   // v87: tests only (fuzz_cross87)
  if(opts.preApart) for(const [x1, y1, x2, y2] of opts.preApart) forbidden.push([cid(x1, y1), cid(x2, y2), 'pre']);            // v92: tests only
  factRec = true;
  let initial; try { initial = propagate(); } finally { factRec = false; }
  if(initial === null){ failWhy = tagOut(failWhy); yield { type: 'impossible-early', reason: WHY_TEXT[failWhy] || 'contradictory walls', why: failWhy }; return; }
  yield* drainFacts(0);
  for(const ch of initial){
    stats.byInference++; bump(ch.rule);
    const c = counts();
    yield { type: 'deduce', spot: spotView(ch.e), value: ch.value, source: 'inference', rule: tagOut(ch.rule) || 'basic', via: 'rule', cause: 0, pass: ch.pass, open: c.open, walls: c.walls, links: c.links };
  }
  for(const cells of completeShapes(activeIds)) yield { type: 'shape', cells, cause: 0 };

  let twoSolutions = null;                  // set when two different tilings were seen
  const scanStart = nowMs();

  // runs both/one narrow search(es) on a spot; returns { progress, end } where end is 'impossible' | 'two' | null
  function* testSpot(e, index){
    const sides = (useWitness && witness) ? [witnessValue(e) === 'wall' ? 'same' : 'wall'] : ['wall', 'same'];
    for(const assume of sides){
      const c = counts();
      yield { type: 'testing', spot: spotView(e), assume, index, open: c.open, walls: c.walls, links: c.links };
      const r = narrow(e, assume);
      stats.tests++;
      if(r.outcome === 'contradiction'){ stats.contradictions++; scanTimeoutRun = 0; }
      else if(r.outcome === 'timeout'){ stats.timeouts++; scanTimeoutRun++; }
      else { stats.solutionsSeen++; scanTimeoutRun = 0; }
      yield { type: 'tested', spot: spotView(e), assume, outcome: r.outcome, ms: r.ms };
      if(r.outcome === 'contradiction'){
        const ok = yield* apply(e, assume === 'wall' ? 'same' : 'wall', 'search');
        if(ok){ const pr = yield* probeLoop(); if(pr === 'impossible') return { progress: true, end: 'impossible' }; }
        return { progress: true, end: ok ? null : 'impossible' };
      }
      if(r.outcome === 'solution'){
        if(witness && witnessValue(e) !== assume){
          twoSolutions = [witness.pieces, r.pieces];
          return { progress: false, end: 'two' };
        }
        if(!witness) setWitness(r.pieces);
      }
    }
    return { progress: false, end: null };
  }

  // ---- probing ----
  function snapshot(){ return { fx: factLog.length, st: spots.map(e => e.state), parent: parent.slice(), mem: Array.from(members, ([k, v]) => [k, v.slice()]), fl: forbidden.length, hcg: hallCacheGen, ss: sizeSet, ml: matchList, rs: rangeSet }; }      // v83b: + the per-pass size / shape lists
  function restore(sn){
    if(sn.hcg !== hallCacheGen){ hallCache = new Map(); hallCacheGen++; }        // v63: back past the last cache write: drop the cache
    if(sn.fl != null) forbidden.length = sn.fl;
    if(sn.fx != null && factLog.length > sn.fx) factLog.length = sn.fx;                // v93
    spots.forEach((e, i) => { e.state = sn.st[i]; });
    parent.set(sn.parent); members.clear(); for(const [k, v] of sn.mem) members.set(k, v.slice());
    if('ss' in sn){ sizeSet = sn.ss; matchList = sn.ml; rangeSet = sn.rs; }                    // v83b
  }
  function assumeOk(e, value){
    e.state = value === 'wall' ? 1 : 2;
    if(value === 'same') union(e.a, e.b);
    inProbe = true;
    const ok = propagate() !== null;
    inProbe = false;
    return ok;
  }
  stats.probes = 0; stats.probeDeductions = 0;
  function* probeLoop(){
    let progress = true;
    while(progress){
      progress = false;
      for(const e of spotOrder){
        if(e.state !== 0) continue;
        if(stopScan()) return null;
        for(const assume of ['wall', 'same']){
          const sn = snapshot();
          const ok = assumeOk(e, assume);
          restore(sn);
          stats.probes++;
          if(ok) continue;
          stats.probeDeductions++;
          const rawFail = failWhy;                                                 // v47: apply() runs propagate() and overwrites failWhy
          const fine = yield* apply(e, assume === 'wall' ? 'same' : 'wall', 'inference', RULE_TAGS.has(failWhy) ? failWhy : 'basic', rawFail);
          if(!fine) return 'impossible';
          progress = true;
          break;
        }
      }
    }
    return null;
  }

  // ============================================================================================================
  // v40: EDGE SEARCH -- the new exact solver for the final stage (opts.exact = 'edge'; 'old' keeps solvePuzzle).
  // The old final stage (solvePuzzle) places whole pieces: pick a tile, list every polyomino that could hold it, recurse.
  // It knows nothing of the propagation rules (they ran before it started) and its cost explodes with the piece size.
  // This search never lists a shape. It decides EDGES (wall / same piece) one at a time, and after every decision the whole
  // propagation engine of this function runs (the same one the probes use), so every rule (area, rose, palisade, compass,
  // bank, mingle, ...) works at every node. A contradiction rolls back (snapshot / restore, like the probes).
  //   * a leaf = every edge decided. The tiling is then checked once by solvePuzzle with ALL edges pinned (walls + links):
  //     nothing is left to enumerate, but every rule of the base solver is applied, so a gap in the propagation can never
  //     make a wrong tiling pass (it only costs a leaf).
  //   * branching: the open edge of the group with the fewest open edges (fail first; ties by clue distance = spotOrder).
  //   * options: opts.deadline (nowMs() timestamp; a {type:'timeout'} event ends the search, like solvePuzzle),
  //     opts.edgePick 'act' (default: conflict-driven) | 'mindeg' | 'focus' | 'clue', opts.edgeFirst 'same' | 'wall', opts.edgeFull (true: full passes, not probe passes).
  // Events: 'progress' {nodes, leaves}, 'solution' {pieces} (as solvePuzzle; with stopAtTwo (default) the search ends after the second), 'timeout' {nodes},
  // and, only with opts.edgeDone, a last 'edge-done' {nodes, leaves, badLeaves}.
  // ============================================================================================================
  const edgeRank = new Int32Array(edges.length); spotOrder.forEach((e, i) => { edgeRank[e.idx] = i; });
  // v41: snapshot including the contents of `forbidden` (a paused search must survive other slices appending to / truncating that list)
  function snapFull(){ const sn = snapshot(); sn.forb = forbidden.slice(); return sn; }
  function restoreFull(sn){ forbidden.length = 0; for(const f of sn.forb) forbidden.push(f); restore(sn); }
  function* edgeSearch(dl, box, clueMode){
    // box = { dl, hard }  (v41, portfolio): the search PAUSES when box.dl passes (yield {type:'pause'}; the caller sets a new box.dl and calls next() to resume)
    // and only ends with a 'timeout' event when box.hard passes.  Without a box: v40 behaviour.
    const deadline = (dl != null && Number.isFinite(dl)) ? dl : (opts.deadline != null ? opts.deadline : null);
    const pickMode = opts.edgePick || 'act', firstVal = opts.edgeFirst || 'same', full = !!opts.edgeFull;
    const stats2 = { nodes: 0, leaves: 0, badLeaves: 0, maxDepth: 0 };
    const seenSol = new Set();                                          // v46: a tiling met in two isometry cases counts once
    edgeStats = stats2;
    let focusCell = -1;
    const act = new Float64Array(edges.length); let actInc = 1; const actGrow = opts.actGrow != null ? +opts.actGrow : 1.02, actNb = !!opts.actNb;      // conflict activity per edge (opts.edgePick 'act')
    function pick(){
      if(pickMode === 'end' && eulerRC){
        eDeg.fill(0);
        for(const x of edges){ if(x.state !== 1) continue; if(!eVert[x.v1]) eDeg[x.v1]++; if(!eVert[x.v2]) eDeg[x.v2]++; }
        let bestE = null, bestV = -1;
        for(const x of spots){
          if(x.state !== 0) continue;
          if((!eVert[x.v1] && eDeg[x.v1] === 1) || (!eVert[x.v2] && eDeg[x.v2] === 1)){ if(act[x.idx] > bestV){ bestV = act[x.idx]; bestE = x; } }
        }
        if(bestE) return bestE;
      }
      if(pickMode === 'clue'){ for(const e of spotOrder) if(e.state === 0) return e; return null; }
      if(pickMode === 'act' || pickMode === 'end'){
        let bestA = null, bestV = -1;
        for(const e of spots){ if(e.state === 0 && act[e.idx] > bestV){ bestV = act[e.idx]; bestA = e; } }
        if(bestA && bestV > 0) return bestA;
      }
      const cnt = new Map();
      for(const e of spots){
        if(e.state !== 0) continue;
        const ra = find(e.a), rb = find(e.b);
        cnt.set(ra, (cnt.get(ra) || 0) + 1); cnt.set(rb, (cnt.get(rb) || 0) + 1);
      }
      let best = null, bestS = Infinity;
      const fr = (pickMode === 'focus' && focusCell >= 0) ? find(focusCell) : -1;      // keep working on the group of the last decision
      if(fr >= 0 && cnt.has(fr)){
        for(const e of spots){
          if(e.state !== 0) continue;
          const ra = find(e.a), rb = find(e.b);
          if(ra !== fr && rb !== fr) continue;
          const s = cnt.get(ra === fr ? rb : ra) * 100000 + edgeRank[e.idx];
          if(s < bestS){ bestS = s; best = e; }
        }
        if(best) return best;
      }
      for(const e of spots){
        if(e.state !== 0) continue;
        const s = Math.min(cnt.get(find(e.a)), cnt.get(find(e.b))) * 100000 + edgeRank[e.idx];
        if(s < bestS){ bestS = s; best = e; }
      }
      return best;
    }
    const clueBranch = !!clueMode && opts.clueBranch !== false && clueIds.length >= 2, clueFull = opts.clueBranchFull !== false;
    const clueRoseBits = (1 << roseTypeList.length) - 1;
    function cluePick(){
      const reps = [], gm = new Map(), ga = new Map(), tiles = new Map();
      for(const id of clueIds){ const r = find(id); if(!tiles.has(r)){ tiles.set(r, []); reps.push(r); gm.set(r, 0); ga.set(r, 0); }
        tiles.get(r).push(id); gm.set(r, gm.get(r) | (roseMask[id] & clueRoseBits)); if(areaAt[id]) ga.set(r, areaAt[id]); }
      if(reps.length < 2) return null;
      const dm = clueDiffMap();
      let best = null, bestN = Infinity;
      const open = (x, y) => { const d = dm.get(x); if(d && d.has(y)) return false; if(gm.get(x) & gm.get(y)) return false; if(ga.get(x) && ga.get(y) && ga.get(x) !== ga.get(y)) return false; return true; };
      for(const x of reps){
        let n = 0; for(const y of reps) if(y !== x && open(x, y)) n++;
        if(n > 0 && (n < bestN || (n === bestN && members.get(x).length > members.get(best).length))){ bestN = n; best = x; }
      }
      if(best === null) return null;
      let bp = null, bd = Infinity;
      for(const y of reps){ if(y === best || !open(best, y)) continue;
        let d = Infinity; for(const p of tiles.get(best)) for(const q of tiles.get(y)){ const dd = Math.abs(p % w - q % w) + Math.abs(((p - p % w) - (q - q % w)) / w); if(dd < d) d = dd; }
        if(d < bd){ bd = d; bp = y; } }
      return { a: tiles.get(best)[0], b: tiles.get(bp)[0], n: bestN };
    }
    function leafPieces(){
      const fw = new Set(), fl = [];
      for(const x of spots){ if(x.state === 1) fw.add(x.key); else if(x.state === 2) fl.push([x.c1, x.r1, x.c2, x.r2]); }
      for(const ev of solvePuzzle(w, h, ctx, specialEdges, 0, { extraWalls: fw, links: fl })) if(ev.type === 'solution') return ev.pieces;
      return null;
    }
    function assume(e, value){
      e.state = value === 'wall' ? 1 : 2;
      if(value === 'same') union(e.a, e.b);
      inProbe = !full;
      let ok;
      try { ok = propagate() !== null; } finally { inProbe = false; }
      return ok;
    }
    function* rec(depth){
      stats2.nodes++; if(depth > stats2.maxDepth) stats2.maxDepth = depth;
      if(box){
        while(nowMs() > box.dl || (box.nodeLeft != null && box.nodeLeft <= 0)){                  // box.nodeLeft: test hook (opts.edgePauseNodes) = pause every k nodes
          if(nowMs() >= box.hard){ yield { type: 'timeout', nodes: stats2.nodes }; return 'timeout'; }
          const mine = snapFull(), sMR = matchRestrict, sEB = eulerBudget, sIC = isoCase, sIK = isoK, sMB = matchBase, sGI = gemIso;      // pause: keep this search's state, hand the root state back
          matchRestrict = null; eulerBudget = eulerBudget0; isoCase = null; isoK = null; matchBase = matchBase0; gemIso = null;          // v43: the size case is this search's alone
          restoreFull(rootSnap); searchLite = false; edgeStats = null;
          yield { type: 'pause', nodes: stats2.nodes, leaves: stats2.leaves };
          rootSnap = snapFull();                                     // resume: the root state may have grown (scan deductions); the next pause restores THAT
          restoreFull(mine); searchLite = opts.edgeLite !== false; edgeStats = stats2; matchRestrict = sMR; eulerBudget = sEB; isoCase = sIC; isoK = sIK; matchBase = sMB; gemIso = sGI;
        }
        if(box.nodeLeft != null) box.nodeLeft--;
      } else if(deadline !== null && nowMs() > deadline){ yield { type: 'timeout', nodes: stats2.nodes }; return 'timeout'; }
      if((stats2.nodes & 63) === 0) yield { type: 'progress', nodes: stats2.nodes, leaves: stats2.leaves, fraction: null };
      const cp = clueBranch ? cluePick() : null;                         // v92b: which clues share a piece comes before any edge
      if(cp){
        stats2.clueNodes = (stats2.clueNodes || 0) + 1;
        const kinds = (opts.clueOracle && opts.clueOracle(cp.a, cp.b) === 'apart') ? ['apart', 'join'] : ['join', 'apart'];     // tests: value order
        for(const kind of kinds){
          const sn = snapshot();
          if(kind === 'join') union(find(cp.a), find(cp.b)); else forbidden.push([cp.a, cp.b, 'clue-branch']);
          inProbe = !(full || clueFull);
          const sl0 = searchLite; if(clueFull) searchLite = false;
          const tc0 = opts.clueTrace ? nowMs() : 0;
          let ok; try { ok = propagate() !== null; } finally { inProbe = false; searchLite = sl0; }
          if(opts.clueTrace) opts.clueTrace({ depth, kind, a: [cp.a % w, (cp.a - cp.a % w) / w], b: [cp.b % w, (cp.b - cp.b % w) / w], n: cp.n, ok, why: ok ? '' : failWhy, ms: nowMs() - tc0, open: spots.filter(x => x.state === 0).length });
          let r = null;
          if(ok) r = yield* rec(depth + 1);
          restore(sn);
          if(r === 'timeout' || r === 'stop') return r;
        }
        return null;
      }
      const e = pick();
      if(!e){
        stats2.leaves++;
        const pieces = leafPieces();
        const sk = pieces ? pieces.map(p => p.cells.map(c => c.join(',')).sort().join(';')).sort().join('|') : null;
        if(pieces && seenSol.has(sk)) return null;
        if(pieces) seenSol.add(sk);
        if(pieces){ yield { type: 'solution', pieces }; stats2.sols = (stats2.sols || 0) + 1; if(stopAtTwo && stats2.sols >= 2) return 'stop'; }
        else stats2.badLeaves++;
        return null;
      }
      const vals = firstVal === 'wall' ? ['wall', 'same'] : ['same', 'wall'];
      for(const v of vals){
        const sn = snapshot();
        const ok = assume(e, v);
        if(!ok){
          act[e.idx] += actInc;
          if(actNb) for(const g of [find(e.a), find(e.b)]) for(const id of members.get(g)) for(const { e: n } of adjE[id]) if(n.state === 0) act[n.idx] += actInc * 0.3;
          actInc *= actGrow; if(actInc > 1e100){ for(let i = 0; i < act.length; i++) act[i] *= 1e-100; actInc *= 1e-100; } }
        focusCell = e.a;
        let r = null;
        if(ok) r = yield* rec(depth + 1);
        restore(sn);
        if(r === 'timeout' || r === 'stop') return r;
      }
      return null;
    }
    // v48 match-shape: probe every candidate shape of d cells at the root of the size case, then one search per surviving shape
    function* shapeSplit(d){
      if(opts.matchShape === false) return { used: false };
      let base = null;
      if(matchBase0) base = matchBase0.filter(sh => sh.size === d);
      else if(d <= (opts.shapeMax != null ? +opts.shapeMax : 9)) base = mFreeList(d);
      if(!base || base.length < 2 || base.length > (opts.shapeCases != null ? +opts.shapeCases : 4000)) return { used: false };
      let open = false; for(const e of spots) if(e.state === 0){ open = true; break; }
      if(!open) return { used: false };                                   // propagation already decided every edge
      const keep = [];
      try {
        for(const X of base){
          const one = [X]; one.id = listId(one); matchBase = one;
          const sn = snapshot();
          inProbe = !full; let ok;
          try { ok = propagate() !== null; } finally { inProbe = false; }
          restore(sn);
          if(ok) keep.push(X);
        }
        if(globalThis.__shapeStat){ globalThis.__shapeStat.runs++; globalThis.__shapeStat.shapes += base.length; globalThis.__shapeStat.kept += keep.length; }
        if(keep.length === 0) return { used: true, r: null };
        const cap = opts.shapeSplitMax != null ? +opts.shapeSplitMax : 400;
        if(keep.length > cap){ const all = keep.slice(); all.id = listId(all); matchBase = all; return { used: true, r: yield* rec(0) }; }
        let r = null;
        for(const X of keep){
          const one = [X]; one.id = listId(one); matchBase = one;
          const sn = snapshot();
          inProbe = !full; let ok;
          try { ok = propagate() !== null; } finally { inProbe = false; }
          let r2 = null;
          const n0 = stats2.nodes, t0c = nowMs();
          if(ok) r2 = yield* rec(0);
          if(globalThis.__shapeLog) globalThis.__shapeLog.push({ key: X.key, ok, nodes: stats2.nodes - n0, ms: Math.round(nowMs() - t0c), r: r2 });
          restore(sn);
          if(r2 === 'timeout' || r2 === 'stop'){ r = r2; break; }
        }
        return { used: true, r };
      } finally { matchBase = matchBase0; }
    }
    function* splitOrRec(d){
      if(ruleMatch){ const sr = yield* shapeSplit(d); if(sr.used) return sr.r; }
      return yield* rec(0);
    }
    let rootSnap = snapFull();
    searchLite = opts.edgeLite !== false;                    // box placement is the one step skipped inside the search (see header)
    let r;
    const splitSizes = (ruleMatch && opts.matchSplit !== false && !staticWhy && matchS0 && (matchS0.length > 1 || (matchS0.length === 1 && ((opts.matchIso !== false && ctx.totalActive === 2 * matchS0[0]) || (opts.matchIsoK !== false && ctx.totalActive % matchS0[0] === 0 && ctx.totalActive / matchS0[0] >= 3 && ctx.totalActive / matchS0[0] <= (opts.isoKMax != null ? +opts.isoKMax : 4))) || (opts.matchShape !== false && ctx.totalActive % matchS0[0] === 0 && ctx.totalActive / matchS0[0] >= (opts.shapeKMin != null ? +opts.shapeKMin : 5) && (matchBase0 ? matchBase0.length > 1 : matchS0[0] <= (opts.shapeMax != null ? +opts.shapeMax : 9)))))) ? matchS0.slice() : null;
    try {
      if(!splitSizes){
        const gcs = gemIsoCases();                                          // v52: gemini-iso, one case per isometry
        if(!gcs || gcs.length > (opts.gemIsoMax != null ? +opts.gemIsoMax : 4000)) r = yield* rec(0);
        else {
          r = null;
          for(const cs of gcs){
            const snI = snapshot();
            gemIso = cs;
            inProbe = !full; let ok2;
            try { ok2 = propagate() !== null; } finally { inProbe = false; }
            let r2 = null;
            if(ok2) r2 = yield* rec(0);
            gemIso = null; restore(snI);
            if(r2 === 'timeout' || r2 === 'stop'){ r = r2; break; }
          }
        }
      }
      else {
        r = null;
        for(const d of splitSizes){                                         // v43: one case per common size
          const snD = snapshot(); const __t0 = nowMs(), __n0 = stats2.nodes;
          matchRestrict = [d];
          if(eulerRC){ const b2 = 2 * (Math.round(ctx.totalActive / d) - eulerRC.R + eulerRC.C - 1); if(b2 >= 0) eulerBudget = eulerBudget0 !== null ? Math.min(eulerBudget0, b2) : b2; }
          inProbe = !full; let ok;
          try { ok = propagate() !== null; } finally { inProbe = false; }
          let rr = null;
          if(ok && opts.matchIso !== false && ctx.totalActive % d === 0 && ctx.totalActive / d === 2){      // v46: two pieces -> one case per isometry
            for(const cs of isoCases()){
              if(globalThis.__isoStat) globalThis.__isoStat.cases++;
              const snI = snapshot();
              const A = [], Bq = [];
              for(const id of activeIds){ if(cs.lab[id] === 1) A.push(id); else if(cs.lab[id] === 2) Bq.push(id); }
              for(let i = 1; i < A.length; i++) union(A[0], A[i]);
              for(let i = 1; i < Bq.length; i++) union(Bq[0], Bq[i]);
              if(A.length && Bq.length) forbidden.push([A[0], Bq[0], 'match-iso']);
              isoCase = cs;
              inProbe = !full; let ok2;
              try { ok2 = propagate() !== null; } finally { inProbe = false; }
              let r2 = null;
              if(ok2) r2 = yield* rec(0);
              isoCase = null; restore(snI);
              if(r2 === 'timeout' || r2 === 'stop'){ rr = r2; break; }
            }
          }
          else if(ok && opts.matchIsoK !== false && ctx.totalActive % d === 0 && ctx.totalActive / d >= 3 && ctx.totalActive / d <= (opts.isoKMax != null ? +opts.isoKMax : 4)){      // v48: K pieces -> one case per isometry tuple
            const ik = isoKCases(d, ctx.totalActive / d);
            if(globalThis.__isoKStat){ globalThis.__isoKStat.runs++; if(ik) globalThis.__isoKStat.cases += ik.cases.length; else globalThis.__isoKStat.aborted++; }
            if(!ik) rr = yield* splitOrRec(d);
            else for(const cs of ik.cases){
              const snI = snapshot();
              isoKEnter(cs); isoK = cs;
              inProbe = !full; let ok2;
              try { ok2 = propagate() !== null; } finally { inProbe = false; }
              let r2 = null;
              if(ok2) r2 = yield* rec(0);
              isoK = null; restore(snI);
              if(r2 === 'timeout' || r2 === 'stop'){ rr = r2; break; }
            }
          }
          else if(ok) rr = yield* splitOrRec(d);
          if(globalThis.__sizeLog) globalThis.__sizeLog.push({ d, ok, ms: Math.round(nowMs() - __t0), nodes: stats2.nodes - __n0, rr });
          matchRestrict = null; eulerBudget = eulerBudget0; restore(snD);
          if(rr === 'timeout' || rr === 'stop'){ r = rr; break; }
        }
      }
    } finally { searchLite = false; matchRestrict = null; isoCase = null; isoK = null; gemIso = null; matchBase = matchBase0; eulerBudget = eulerBudget0; restoreFull(rootSnap); }      // finally: a search that is cut off (slice over, cancel) must leave the state as it found it
    if(r !== 'timeout' && opts.edgeDone) yield { type: 'edge-done', nodes: stats2.nodes, leaves: stats2.leaves, badLeaves: stats2.badLeaves };      // only on request: the event stream of the old solver ends with its last solution
  }
  let edgeStats = null;
  // PORTFOLIO. Both exact searches are exhaustive, but they are good at different puzzles: the edge search at puzzles the propagation
  // rules can grip (numbers, roses, compass, palisade, size rules, bank), the old whole-piece search and its narrow-test scan at clue-poor
  // mingle / difference puzzles where the rules decide little (Zone3/0610, 0919, 1039, 0206, 0269, 0956, 1213). So the work after the
  // probes runs in SLICES from the same half-solved state (opts.slices, default 'e2,s18,o5,e12,o12,e'):
  //   e<sec> edge search   s<sec> narrow-test scan (capped)   o<sec> old whole-piece search   a bare e / o has no limit
  // The first slices run BEFORE the scan so a puzzle the edge search solves fast never pays for it. A tiling found in an earlier slice is
  // not reported twice; a slice that ends without a timeout has looked at everything, so the solve ends there. opts.portfolio === false:
  // the edge search alone (no scan). Every slice leaves the state as it found it (see the finally in edgeSearch).
  function parseSlices(spec){
    const toks = String(spec || 'e2,s18,o5,e12,o12,e').split(',').map(x => x.trim()).filter(Boolean);
    const plan = { pre: [], post: [], scan: false, scanMs: 18000 };
    let seenScan = false;
    for(const t of toks){
      const m = /^([eos])(\d+(?:\.\d+)?)?$/.exec(t); if(!m) continue;
      const ms = m[2] != null ? +m[2] * 1000 : Infinity;
      if(m[1] === 's'){ if(!seenScan){ seenScan = true; plan.scan = true; plan.scanMs = Number.isFinite(ms) ? ms : 18000; } continue; }
      (seenScan ? plan.post : plan.pre).push({ kind: m[1] === 'e' ? 'edge' : 'old', ms });
    }
    const all = plan.post.length ? plan.post : plan.pre;
    if(!all.length || Number.isFinite(all[all.length - 1].ms)) all.push({ kind: 'edge', ms: Infinity });     // the last slice must be able to finish
    return plan;
  }
  function pinnedNow(){
    const fw = new Set(), fl = [];
    for(const x of spots){ if(x.state === 1) fw.add(x.key); else if(x.state === 2) fl.push([x.c1, x.r1, x.c2, x.r2]); }
    return { fw, fl };
  }
  // one slice: returns 'done' (searched everything) | 'timeout' (slice over, the overall deadline not reached) | 'hard' (overall deadline: the timeout event was yielded)
  // v41: the EDGE search is one generator for the whole solve (edgeGen): a slice resumes it where the last one paused.  (The old whole-piece search
  // still restarts from scratch each slice: its time-out is an exception thrown out of a deep recursion, it cannot be resumed.)
  let edgeGen = null, edgeBox = null, edgeFinished = false;
  const plainSearch = { gen: null, box: null }, clueSearch = { gen: null, box: null, clue: true };          // v92e: two resumable searches
  function* runEdgeSlice(ms, which){
    if(edgeFinished) return 'done';
    const SS = which || plainSearch;
    const hard = opts.deadline != null ? opts.deadline : Infinity, dl = Math.min(hard, nowMs() + ms);
    if(!SS.gen){ SS.box = { dl, hard, nodeLeft: null }; SS.gen = edgeSearch(null, SS.box, !!SS.clue); } else SS.box.dl = dl;
    edgeGen = SS.gen; edgeBox = SS.box;
    edgeBox.nodeLeft = (opts.edgePauseNodes && Number.isFinite(ms)) ? +opts.edgePauseNodes : null;
    let paused = false;
    try {
      for(;;){
        const nx = edgeGen.next();
        if(nx.done){ edgeFinished = true; return 'done'; }
        const ev = nx.value;
        if(ev.type === 'pause'){ paused = true; return 'timeout'; }
        if(ev.type === 'solution'){
          const k = ev.pieces.map(p => p.cells.map(c => c.join(',')).sort().join(';')).sort().join('|');
          if(portSeen.has(k)) continue;
          portSeen.add(k); yield ev;
          if(stopAtTwo && portSeen.size >= 2){ edgeFinished = true; return 'done'; }
          continue;
        }
        if(ev.type === 'timeout'){ edgeFinished = true; yield ev; return 'hard'; }
        yield ev;
      }
    } finally {
      if(!paused && !edgeFinished){ edgeFinished = true; }              // left early (cancel): the generator must be closed so that its finally restores the state
      if(!paused && edgeGen){ try { edgeGen.return(); } catch(e){} }
      if(!paused){ const other = SS === plainSearch ? clueSearch : plainSearch; if(other.gen){ try { other.gen.return(); } catch(e){} } }
    }
  }
  function* runSlice(kind, ms){
    if(kind === 'edge') return yield* runEdgeSlice(ms);
    if(kind === 'clue') return yield* runEdgeSlice(ms, clueSearch);                 // v92e
    const hard = opts.deadline != null ? opts.deadline : Infinity, dl = Math.min(hard, nowMs() + ms);
    const pn = pinnedNow(), gen = solvePuzzle(w, h, ctx, specialEdges, finalBudget, { extraWalls: pn.fw, links: pn.fl, deadline: dl });
    for(const ev of gen){
      if(ev.type === 'solution'){
        const k = ev.pieces.map(p => p.cells.map(c => c.join(',')).sort().join(';')).sort().join('|');
        if(portSeen.has(k)) continue;
        portSeen.add(k); yield ev;
        if(stopAtTwo && portSeen.size >= 2) return 'done';
        continue;
      }
      if(ev.type === 'timeout'){ if(nowMs() >= hard){ yield ev; return 'hard'; } return 'timeout'; }
      yield ev;
    }
    return 'done';
  }
  function* runSlices(list){
    for(const sl of list){ const r = yield* runSlice(sl.kind, sl.ms); if(r !== 'timeout') return; }
  }

  // ---- v75: place-probe (see patch_core75.py) ----
  const ppTried = new Map();                // group key -> ppSig when it last gave nothing
  function ppSig(mem, k){                    // the states of the edges within k steps of the group: a group is retried only when one changed
    const near = new Uint8Array(N); let fr = mem.slice(); for(const id of fr) near[id] = 1;
    for(let d = 0; d < k; d++){ const nx = []; for(const id of fr) for(const { o } of adjE[id]) if(!near[o]){ near[o] = 1; nx.push(o); } fr = nx; }
    let sig = ''; for(const e of spots) if(near[e.a] || near[e.b]) sig += e.state;
    return sig;
  }
  function ppList(mem, k, deadline){
    const maxNodes = opts.placeProbeNodes || 200000, maxOut = opts.placeProbeMax || 3000;
    const inS = new Uint8Array(N); for(const id of mem) inS[id] = 1;
    const cur = mem.slice(), seen = new Set(), out = []; let nodes = 0, over = false;
    const rec = () => {
      if(over) return;
      const key = cur.slice().sort((a, b) => a - b).join(',');
      if(seen.has(key)) return; seen.add(key);
      if(++nodes > maxNodes || ((nodes & 1023) === 0 && nowMs() > deadline)){ over = true; return; }
      if(cur.length === k){ out.push(cur.slice()); if(out.length > maxOut) over = true; return; }
      const nb = [];
      for(const id of cur) for(const { e, o } of adjE[id]) if(!inS[o] && e.state !== 1 && !nb.includes(o)) nb.push(o);
      for(const o of nb){ inS[o] = 1; cur.push(o); rec(); cur.pop(); inS[o] = 0; if(over) return; }
    };
    rec();
    if(over) return null;
    return out.filter(P => {
      markGen++; for(const id of P) markBuf[id] = markGen;
      const tally = new Map(); for(const id of P){ const r = find(id); tally.set(r, (tally.get(r) || 0) + 1); }
      for(const [r, c] of tally) if(c !== members.get(r).length) return false;
      for(const id of P) for(const { e, o } of adjE[id]){ if(markBuf[o] === markGen){ if(e.state === 1) return false; } else if(e.state === 2) return false; }
      const r = pieceInfo(P); return r !== null && r.need <= k && k <= r.cap;
    });
  }
  function ppAssume(e, v){ e.state = v === 'wall' ? 1 : 2; if(v === 'same') union(e.a, e.b); return propagate() !== null; }
  function ppInner(deadline, near){          // probe pass inside an assumed state (only edges with a tile in `near`); false = contradiction
    for(let progress = true, round = 0; progress && round < 30; round++){
      progress = false;
      for(const e of spotOrder){
        if(e.state !== 0) continue;
        if(near && !near[e.a] && !near[e.b]) continue;
        if(nowMs() > deadline) return true;
        let bad = 0, badVal = null;
        for(const v of ['wall', 'same']){ const sn2 = snapshot(); const ok = ppAssume(e, v); restore(sn2); if(!ok){ bad++; badVal = v; } }
        if(bad === 2) return false;
        if(bad === 1){ if(!ppAssume(e, badVal === 'wall' ? 'same' : 'wall')) return false; progress = true; }
      }
    }
    return true;
  }
  function ppTry(P, deadline){               // the spot states after assuming P whole (null = refuted)
    const sn = snapshot();
    markGen++; for(const id of P) markBuf[id] = markGen;
    for(const id of P) for(const { e, o } of adjE[id]){ if(e.state !== 0) continue; if(markBuf[o] === markGen){ e.state = 2; union(e.a, e.b); } else e.state = 1; }
    const lite = opts.placeProbeLite === true;                             // the placement itself propagated like a probe (inProbe: the heavy top-level steps stay out)
    if(lite) inProbe = true;
    let ok = propagate() !== null;
    if(lite) inProbe = false;
    let near = null;
    const R = opts.placeProbeNear != null ? +opts.placeProbeNear : 2;      // inner probes on edges within R steps of the placement (-1 = all)
    if(ok && R >= 0){
      near = new Uint8Array(N); let fr = P.slice(); for(const id of fr) near[id] = 1;
      for(let d = 0; d < R; d++){ const nx = []; for(const id of fr) for(const { o } of adjE[id]) if(!near[o]){ near[o] = 1; nx.push(o); } fr = nx; }
    }
    if(ok){ inProbe = true; ok = ppInner(deadline, near); inProbe = false; }
    const st = ok ? spots.map(e => e.state) : null;
    restore(sn);
    return st;
  }
  let ppDeadline = 0;                       // one time budget for the whole stage (all rounds)
  function placeProbe(){                      // null = impossible, [] = nothing, else [{ e, value }]
    const deadline = ppDeadline, maxK = opts.placeProbeSize || 8;
    const groups = [];
    for(const [rep, mem] of members){                                    // candidates (cheap): area group, size pinned and small
      if(!mem.some(id => ctx.requiredAreaAt(id % w, (id - id % w) / w) != null)) continue;
      const nd = pieceInfo(mem);
      if(!nd || nd.need !== nd.cap || nd.cap <= mem.length || nd.cap > maxK) continue;
      if(groupComplete(rep, mem)) continue;
      const gk = mem.slice().sort((a, b) => a - b).join(','), sig = ppSig(mem, nd.cap);
      if(ppTried.get(gk) === sig) continue;
      groups.push({ gk, sig, mem: mem.slice(), k: nd.cap });                  // a copy: assuming a placement merges groups INTO these arrays (restore makes new ones)
    }
    groups.sort((a, b) => a.k - b.k || b.mem.length - a.mem.length);     // smallest area number first (fewest placements), then the biggest group
    if(opts.gemCopy !== false) for(const gw of gdAll){                       // v76: gemini copies first (at most 8 x size spots)
      if(!gw.gem) continue;
      for(const [p, q] of [[gw.a, gw.b], [gw.b, gw.a]]){
        const rp = find(p), rq = find(q); if(rp === rq) continue;
        const mp = members.get(rp), mq = members.get(rq);
        if(!groupComplete(rp, mp) || groupComplete(rq, mq) || mq.length >= mp.length) continue;
        const gk = 'gem:' + mq.slice().sort((a, b) => a - b).join(','), sig = ppSig(mq, mp.length);
        if(ppTried.get(gk) === sig) continue;
        const base = mp.map(id => [id % w, (id - id % w) / w]), seenP = new Set(), list = [];
        for(let t = 0; t < 8; t++){
          const o = base.map(([x, y]) => { let a = t & 1 ? -x : x, b = t & 2 ? -y : y; if(t & 4){ const s2 = a; a = b; b = s2; } return [a, b]; });
          for(const [ax, ay] of o){
            const qx = q % w, qy = (q - qx) / w, P = []; let ok = true;
            for(const [a, b] of o){ const x = a - ax + qx, y = b - ay + qy; if(x < 0 || y < 0 || x >= w || y >= h || !ctx.isActive(x, y)){ ok = false; break; } const id = cid(x, y); if(find(id) === rp){ ok = false; break; } P.push(id); }
            if(!ok) continue;
            const key = P.slice().sort((a, b) => a - b).join(','); if(seenP.has(key)) continue; seenP.add(key);
            markGen++; for(const id of P) markBuf[id] = markGen;
            const tally = new Map(); for(const id of P){ const r = find(id); tally.set(r, (tally.get(r) || 0) + 1); }
            for(const [r, c] of tally) if(c !== members.get(r).length){ ok = false; break; }
            if(!ok) continue;
            for(const id of P){ for(const { e, o: nb } of adjE[id]){ if(markBuf[nb] === markGen){ if(e.state === 1){ ok = false; break; } } else if(e.state === 2){ ok = false; break; } } if(!ok) break; }
            if(!ok) continue;
            const pi = pieceInfo(P); if(pi === null || pi.need > P.length || P.length > pi.cap) continue;
            list.push(P);
          }
        }
        groups.unshift({ gk, sig, mem: mq.slice(), k: mp.length, list });
      }
    }
    for(const g of groups){
      if(nowMs() > deadline) break;
      const list = g.list || ppList(g.mem, g.k, deadline);              // listed only when its turn comes (v76: gemini copies come listed)
      if(list === null){ if(nowMs() <= deadline) ppTried.set(g.gk, g.sig); continue; }
      const surv = []; let cut = false;
      for(const P of list){
        if(nowMs() > deadline){ cut = true; break; }
        const st = ppTry(P, deadline);
        if(nowMs() > deadline){ cut = true; break; }                                 // an inner pass cut short proves nothing
        if(st) surv.push(st);
      }
      if(cut) break;
      if(surv.length === 0){ why = 'place-probe'; failWhy = 'place-probe'; return null; }
      const out = [];
      spots.forEach((e, i) => {
        if(e.state !== 0) return;
        const v = surv[0][i]; if(v === 0) return;
        for(const s of surv) if(s[i] !== v) return;
        out.push({ e, value: v === 1 ? 'wall' : 'same' });
      });
      if(out.length > 0) return out;
      ppTried.set(g.gk, g.sig);
    }
    return [];
  }

  // ---- v94 (V1.0.1): wally-line (see build/patch_core94.py) ----
  // A gemini wall: same shape on both sides, so a straight run of m tiles in one piece (a maximal one) has a twin of m tiles in the
  // other. A known run r of X that can still grow can only end with a length the twin Y can have for a run of that many tiles.
  const glGems = gdAll.filter(g => g.gem);
  const glOn = glGems.length > 0 && (opts.gemLine === true || (!!ctx.wallyRule && opts.gemLine !== false));
  const glTag = ctx.wallyRule ? 'wally-line' : 'gemini-line';
  const glTried = new Map();
  function glDmap(){                                    // groups kept apart: walls and forbidden pairs
    const dm = new Map(), add = (a, b) => { if(!dm.has(a)) dm.set(a, new Set()); dm.get(a).add(b); };
    for(const e of edges){ if(e.state !== 1) continue; const a = find(e.a), b = find(e.b); if(a !== b){ add(a, b); add(b, a); } }
    for(const [fa, fb] of forbidden){ const a = find(fa), b = find(fb); if(a !== b){ add(a, b); add(b, a); } }
    return dm;
  }
  const glTile = (x, y) => (x >= 0 && y >= 0 && x < w && y < h && ctx.isActive(x, y)) ? cid(x, y) : -1;
  const glEdge = (a, b) => { for(const { e, o } of adjE[a]) if(o === b) return e; return null; };
  // the lengths the run of X through tiles p0 .. p0+(k-1)d (all in X) can end with: [{ s, t, len }] (positions on the line, 0 = p0)
  function glIntervals(X, x0, y0, dx, dy, k, dm){
    const apart = dm.get(X) || new Set();
    const at = t => glTile(x0 + t * dx, y0 + t * dy);
    // how far the line may reach: stop at the board, a wall or a group kept apart from X (the groups met on the way must not be apart either)
    const reach = dir => {
      const ids = [], start = dir > 0 ? k - 1 : 0;
      let prev = at(start);
      for(let t = start + dir; ; t += dir){
        const id = at(t); if(id < 0) break;
        const e = glEdge(prev, id); if(!e || e.state === 1) break;
        const g = find(id); if(g !== X && apart.has(g)) break;
        ids.push(id); prev = id;
      }
      return ids;
    };
    const lo = reach(-1), hi = reach(1);
    const out = [];
    for(let a = 0; a <= lo.length; a++) for(let b = 0; b <= hi.length; b++){
      const s = -a, t = k - 1 + b;
      // every tile of the interval joins X: their groups must not be apart from each other
      const gs = new Set([X]); let ok = true;
      for(let i = 0; i < a && ok; i++){ const g = find(lo[i]); if(!gs.has(g)){ for(const q of gs) if((dm.get(g) || new Set()).has(q)){ ok = false; break; } gs.add(g); } }
      for(let i = 0; i < b && ok; i++){ const g = find(hi[i]); if(!gs.has(g)){ for(const q of gs) if((dm.get(g) || new Set()).has(q)){ ok = false; break; } gs.add(g); } }
      if(!ok) continue;
      // the tiles just outside must be able to stay out (not in X, not in a group joining it)
      const endOk = (outT, inT) => { const o = at(outT); if(o < 0) return true; const e = glEdge(at(inT), o); if(!e || e.state === 1) return true; return !gs.has(find(o)); };
      if(!endOk(s - 1, s) || !endOk(t + 1, t)) continue;
      out.push({ s, t, len: t - s + 1 });
    }
    return out;
  }
  function glRunsOf(X){                                 // known maximal runs of X: [{ x, y, dx, dy, k }]
    const mem = members.get(X), inX = new Set(mem), out = [];
    for(const id of mem){
      const x = id % w, y = (id - x) / w;
      for(const [dx, dy] of [[1, 0], [0, 1]]){
        const pv = glTile(x - dx, y - dy); if(pv >= 0 && inX.has(pv)) continue;
        let k = 1; while(true){ const nx = glTile(x + k * dx, y + k * dy); if(nx < 0 || !inX.has(nx)) break; k++; }
        out.push({ x, y, dx, dy, k });
      }
    }
    return out;
  }
  // the lengths a run of k+ tiles of Y can end with (null = over the time budget)
  function glTwinLens(Yt, k, need, deadline){
    const dm0 = glDmap(), Y = find(Yt), apartY = dm0.get(Y) || new Set();
    // tiles Y can still reach (no wall, no group kept apart)
    const seen = new Uint8Array(N), q = [];
    for(const id of members.get(Y)){ seen[id] = 1; q.push(id); }
    for(let i = 0; i < q.length; i++) for(const { e, o } of adjE[q[i]]){ if(seen[o] || e.state === 1 || apartY.has(find(o))) continue; seen[o] = 1; q.push(o); }
    const lens = new Set(); let probes = 0;
    const done = () => { for(const L of need) if(!lens.has(L)) return false; return true; };
    const segs = [];
    for(const id of q){
      const x = id % w, y = (id - x) / w;
      for(const [dx, dy] of [[1, 0], [0, 1]]){
        const P = [id]; let ok = true;
        for(let i = 1; i < k && ok; i++){ const nx = glTile(x + i * dx, y + i * dy); if(nx < 0 || !seen[nx]){ ok = false; break; } const e = glEdge(P[i - 1], nx); if(!e || e.state === 1){ ok = false; break; } P.push(nx); }
        if(!ok) continue;
        const gs = new Set([Y]);
        for(const t of P){ const g = find(t); if(gs.has(g)) continue; for(const o of gs) if((dm0.get(g) || new Set()).has(o)){ ok = false; break; } if(!ok) break; gs.add(g); }
        if(!ok) continue;
        segs.push({ x, y, dx, dy, P, known: P.every(t => find(t) === Y) });
      }
    }
    segs.sort((a, b) => (b.known - a.known));                                  // the runs Y already has first (no probe)
    for(const sg of segs){
      if(done()) break;
      if(sg.known){ for(const iv of glIntervals(Y, sg.x, sg.y, sg.dx, sg.dy, k, dm0)) lens.add(iv.len); continue; }
      if(nowMs() > deadline) return null;
      const sn = snapshot();
      for(const t of sg.P) union(t, Yt);
      inProbe = true; let ok = propagate() !== null; inProbe = false;
      probes++;
      if(ok){ const Y2 = find(Yt), dm2 = glDmap(); const ivs = glIntervals(Y2, sg.x, sg.y, sg.dx, sg.dy, k, dm2); if(!ivs.length) ok = false; for(const iv of ivs) lens.add(iv.len); }
      restore(sn);
    }
    stats.gemLineProbes = (stats.gemLineProbes || 0) + probes;
    return lens;
  }
  function gemLineStep(deadline){                       // null = impossible, [] = nothing, else [{ e, value }]
    const kMin = opts.gemLineMin != null ? +opts.gemLineMin : 3;
    for(const g of glGems){
      for(const [p, q] of [[g.a, g.b], [g.b, g.a]]){
        const X = find(p), Y = find(q); if(X === Y) continue;
        const dm = glDmap();
        for(const r of glRunsOf(X)){
          if(r.k < kMin) continue;
          const ivs = glIntervals(X, r.x, r.y, r.dx, r.dy, r.k, dm);
          if(ivs.length === 1 && ivs[0].len === r.k) continue;                 // closed at both ends already
          const need = new Set(ivs.map(iv => iv.len));
          const gk = g.a + ':' + g.b + ':' + p + ':' + r.x + ',' + r.y + ',' + r.dx + ',' + r.k;
          const sig = spots.map(e => e.state).join('');
          if(glTried.get(gk) === sig) continue;
          if(nowMs() > deadline) return [];
          const lens = glTwinLens(q, r.k, need, deadline);
          if(lens === null) return [];
          glTried.set(gk, sig);
          const keep = ivs.filter(iv => lens.has(iv.len));
          if(keep.length === ivs.length) continue;
          if(!keep.length){ why = glTag; failWhy = glTag; return null; }
          // decide the edges of the line that are the same in every interval kept
          const out = [], s0 = Math.min(...keep.map(iv => iv.s)) - 1, t0 = Math.max(...keep.map(iv => iv.t)) + 1;
          for(let t = s0; t < t0; t++){
            const a = glTile(r.x + t * r.dx, r.y + t * r.dy), b = glTile(r.x + (t + 1) * r.dx, r.y + (t + 1) * r.dy);
            if(a < 0 || b < 0) continue;
            const e = glEdge(a, b); if(!e || e.state !== 0) continue;
            const inside = iv => t >= iv.s && t + 1 <= iv.t, onEnd = iv => (t === iv.s - 1) || (t === iv.t);
            if(keep.every(inside)) out.push({ e, value: 'same' });
            else if(keep.every(onEnd)) out.push({ e, value: 'wall' });
          }
          if(out.length) return out;
        }
      }
    }
    return [];
  }
  // ---- v97 (V1.0.5): gemini-anchor (see build/patch_core97.py) ----
  const anOn = glGems.length > 0 && opts.gemAnchor !== false;
  const anTried = new Map();
  const ISO8 = [[1, 0, 0, 1], [-1, 0, 0, 1], [1, 0, 0, -1], [-1, 0, 0, -1], [0, 1, 1, 0], [0, -1, 1, 0], [0, 1, -1, 0], [0, -1, -1, 0]];   // (x, y) -> (a x + b y, c x + d y)
  // the k-in-a-line sets the piece of Yt can still hold: every one already in it, and every other one a probe can not refute (null = time out)
  function anSegs(Yt, k, deadline){
    const dm0 = glDmap(), Y = find(Yt), apartY = dm0.get(Y) || new Set();
    const seen = new Uint8Array(N), q = [];
    for(const id of members.get(Y)){ seen[id] = 1; q.push(id); }
    for(let i = 0; i < q.length; i++) for(const { e, o } of adjE[q[i]]){ if(seen[o] || e.state === 1 || apartY.has(find(o))) continue; seen[o] = 1; q.push(o); }
    const out = [];
    for(const id of q){
      const x = id % w, y = (id - x) / w;
      for(const [dx, dy] of [[1, 0], [0, 1]]){
        const P = [id]; let ok = true;
        for(let i = 1; i < k && ok; i++){ const nx = glTile(x + i * dx, y + i * dy); if(nx < 0 || !seen[nx]){ ok = false; break; } const e = glEdge(P[i - 1], nx); if(!e || e.state === 1){ ok = false; break; } P.push(nx); }
        if(!ok) continue;
        const gs = new Set([Y]);
        for(const t of P){ const g = find(t); if(gs.has(g)) continue; for(const o of gs) if((dm0.get(g) || new Set()).has(o)){ ok = false; break; } if(!ok) break; gs.add(g); }
        if(!ok) continue;
        if(P.every(t => find(t) === Y)){ out.push(P); continue; }
        if(nowMs() > deadline) return null;
        const sn = snapshot();
        for(const t of P) union(t, Yt);
        inProbe = true; const alive = propagate() !== null; inProbe = false;
        restore(sn);
        if(alive) out.push(P);
      }
    }
    return out;
  }
  function anClosedRuns(X, dm){                          // known runs with a wall / the board at both ends: [{ x, y, dx, dy, k, P }]
    const out = [];
    for(const r of glRunsOf(X)){
      if(r.k < 3) continue;
      const iv = glIntervals(X, r.x, r.y, r.dx, r.dy, r.k, dm);
      if(iv.length !== 1 || iv[0].len !== r.k) continue;
      const P = []; for(let i = 0; i < r.k; i++) P.push(glTile(r.x + i * r.dx, r.y + i * r.dy));
      out.push(Object.assign({ P }, r));
    }
    return out;
  }
  function gemAnchorStep(deadline){                      // null = impossible, [] = nothing, else [{ e, value }]
    for(const g of glGems){
      const X = find(g.a), Y = find(g.b); if(X === Y) continue;
      const dm = glDmap();
      const RX = anClosedRuns(X, dm), RY = anClosedRuns(Y, dm);
      for(const rx of RX) for(const ry of RY){
        if(rx.k !== ry.k) continue;
        const gk = g.a + ':' + g.b + ':' + rx.P[0] + ',' + rx.dx + ':' + ry.P[0] + ',' + ry.dx + ':' + rx.k, sig = spots.map(e => e.state).join('');
        if(anTried.get(gk) === sig) continue;
        if(nowMs() > deadline) return [];
        // the only run of k tiles each side can have
        const only = (t, run) => { const S = anSegs(t, run.k, deadline); if(S === null) return null; const inR = new Set(run.P); return S.every(P => P.every(id => inR.has(id))); };
        // one side is enough: an isometry sends maximal runs to maximal runs, so the other side's closed run of k tiles comes back onto
        // the only one this side can have
        const ox = only(g.a, rx); if(ox === null) return [];
        if(!ox){ const oy = only(g.b, ry); if(oy === null) return []; if(!oy){ anTried.set(gk, sig); continue; } }
        // the isometries that send rx onto ry
        const xy = id => [id % w, (id - id % w) / w];
        const [p0x, p0y] = xy(rx.P[0]), [q0x, q0y] = xy(ry.P[0]), [qkx, qky] = xy(ry.P[ry.k - 1]);
        const surv = [];
        for(const [a, b, c, d] of ISO8){
          const mx = a * rx.dx + b * rx.dy, my = c * rx.dx + d * rx.dy;
          let tx, ty;
          if(mx === ry.dx && my === ry.dy){ tx = q0x - (a * p0x + b * p0y); ty = q0y - (c * p0x + d * p0y); }
          else if(mx === -ry.dx && my === -ry.dy){ tx = qkx - (a * p0x + b * p0y); ty = qky - (c * p0x + d * p0y); }
          else continue;
          const fw = (x, y) => [a * x + b * y + tx, c * x + d * y + ty];
          const bw = (x, y) => { const u = x - tx, v = y - ty; return [a * u + c * v, b * u + d * v]; };     // the inverse of an orthogonal matrix is its transpose
          if(nowMs() > deadline) return [];
          const sn = snapshot();
          let ok = true;
          const memX = members.get(find(g.a)).slice(), memY = members.get(find(g.b)).slice();
          const copy = (mem, f, into) => {                 // tiles of one side -> tiles of the other side; walls round them -> walls round the images
            for(const id of mem){ const [x, y] = xy(id), [u, v] = f(x, y), t = glTile(u, v); if(t < 0){ ok = false; return; } union(t, into); }
            for(const id of mem){
              const [x, y] = xy(id), [u, v] = f(x, y), t = glTile(u, v);
              for(const [ddx, ddy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]){
                const n = glTile(x + ddx, y + ddy);
                const outside = n < 0 || (() => { const e = glEdge(id, n); return !e || e.state === 1; })();
                if(!outside) continue;
                const [u2, v2] = f(x + ddx, y + ddy), t2 = glTile(u2, v2); if(t2 < 0) continue;
                const e2 = glEdge(t, t2); if(!e2) continue;
                if(e2.state === 2){ ok = false; return; }
                if(e2.state === 0) e2.state = 1;
              }
            }
          };
          copy(memX, fw, g.b); if(ok) copy(memY, bw, g.a);
          if(ok){ inProbe = true; ok = propagate() !== null; inProbe = false; }
          if(ok) surv.push(spots.map(e => e.state));
          restore(sn);
        }
        anTried.set(gk, sig);
        if(surv.length === 0){ why = 'gemini-anchor'; failWhy = 'gemini-anchor'; return null; }
        const out = [];
        spots.forEach((e, i) => { if(e.state !== 0) return; const v = surv[0][i]; if(v === 0) return; for(const s of surv) if(s[i] !== v) return; out.push({ e, value: v === 1 ? 'wall' : 'same' }); });
        if(out.length) return out;
      }
    }
    return [];
  }
  function* glStage(){                                  // false = impossible
    if((!glOn && !anOn) || !spots.some(e => e.state === 0)) return true;
    const glDeadline = nowMs() + (opts.gemLineMs != null ? +opts.gemLineMs : 4000);
    for(let round = 0; round < 40 && nowMs() < glDeadline; round++){
      let gl = glOn ? gemLineStep(glDeadline) : [], tag = glTag;
      if(gl === null) return false;
      if(gl.length === 0 && anOn){ gl = gemAnchorStep(glDeadline); tag = 'gemini-anchor'; if(gl === null) return false; }
      if(gl.length === 0) break;
      for(const d of gl){
        if(d.e.state !== 0) continue;
        if(!(yield* apply(d.e, d.value, 'inference', tag, tag))) return false;
      }
      if((yield* probeLoop()) === 'impossible') return false;
    }
    return true;
  }
  // ---- the scan ----
  let ended = null;                         // 'impossible' | 'two' | null
  if(opts.gemLineEarly && !finalOnly && !(yield* glStage())) ended = 'impossible';     // v94: tests only (before any probe)
  if(opts.twoPieceEarly && !finalOnly){ const r = yield* twoPieceStage(); if(r === 'impossible') ended = 'impossible'; }     // v78: tests only (before any probe)
  if(!finalOnly && !ended){ const pr = yield* probeLoop(); if(pr === 'impossible') ended = 'impossible'; }
  if(!finalOnly && !ended && opts.placeProbe !== false && spots.some(e => e.state === 0)){            // v75
    ppDeadline = nowMs() + (opts.placeProbeMs != null ? +opts.placeProbeMs : 4000);
    for(let round = 0; round < 40 && !ended && nowMs() < ppDeadline; round++){
      const pp = placeProbe();
      if(pp === null){ ended = 'impossible'; break; }
      if(pp.length === 0) break;
      for(const d of pp){
        if(d.e.state !== 0) continue;
        const fine = yield* apply(d.e, d.value, 'inference', 'place-probe', 'place-probe');
        if(!fine){ ended = 'impossible'; break; }
      }
      if(ended) break;
      const pr = yield* probeLoop(); if(pr === 'impossible') ended = 'impossible';
    }
  }
  if(!finalOnly && !ended && !(yield* glStage())) ended = 'impossible';      // v94 (V1.0.1): wally-line
  // ---- v87b: pair probes (see patch_core87.py) ----
  function* applyFact(kind, a, b, rule){            // kind 'join': a and b one piece; 'apart': different pieces. false = impossible
    const cause = ++causeN;
    if(kind === 'join') union(find(a), find(b)); else forbidden.push([a, b, rule]);
    stats.byInference++; bump(rule);
    yield { type: 'fact', kind, a: factXY(a), b: factXY(b), rule, cause };
    factLog.length = 0; factRec = true;
    let changes; try { changes = propagate(); } finally { factRec = false; }
    if(changes === null) return false;
    yield* drainFacts(cause);
    for(const ch of changes){
      stats.byInference++; bump(ch.rule);
      const c = counts();
      yield { type: 'deduce', spot: spotView(ch.e), value: ch.value, source: 'inference', rule: tagOut(ch.rule) || 'basic', via: 'rule', cause, pass: ch.pass, open: c.open, walls: c.walls, links: c.links };
    }
    return true;
  }
  // the inner probe pass of a pair probe (as ppInner, all edges): each edge tried the cheap way (inProbe), and a value it forces is applied
  // at full strength (inProbe off: region-merge and the other root-only steps run, as for a real probe deduction). false = contradiction
  function pairInner(deadline){
    for(let progress = true, round = 0; progress && round < 30; round++){
      progress = false;
      for(const e of spotOrder){
        if(e.state !== 0) continue;
        if(nowMs() > deadline) return true;
        let bad = 0, badVal = null;
        for(const v of ['wall', 'same']){ const sn2 = snapshot(); inProbe = true; const ok = ppAssume(e, v); inProbe = false; restore(sn2); if(!ok){ bad++; badVal = v; } }
        if(bad === 2) return false;
        if(bad === 1){ if(!ppAssume(e, badVal === 'wall' ? 'same' : 'wall')) return false; progress = true; }
      }
    }
    return true;
  }
  // ---- v88a: cross-mark (see patch_core88.py): groups that would put two split groups' parts in the order A, B, A, B if they joined one
  function crossMarks(dmap){
    const out = [];                                                              // [tile of the group, tile of the split group]
    const split = [];
    for(const [rep, mem] of members){
      if(mem.length < 2) continue;
      const part = new Map(); let np = 0;
      for(const s0 of mem){ if(part.has(s0)) continue; const q = [s0]; part.set(s0, np);
        for(let i = 0; i < q.length; i++) for(const { e, o } of adjE[q[i]]) if(e.state === 2 && !part.has(o)){ part.set(o, np); q.push(o); }
        np++; }
      if(np >= 2) split.push({ rep, part });
    }
    const seenFact = new Set();
    for(let i = 0; i < split.length; i++) for(let j = 0; j < split.length; j++){
      if(i === j) continue;
      const A = split[i], B = split[j], dA = dmap.get(A.rep);                   // marks for joining B (A is the one that would be cut)
      if(!dA || !dA.has(B.rep)) continue;
      const dB = dmap.get(B.rep) || new Set();
      const use = id => { const g = find(id); return g === A.rep || g === B.rep || !(dA.has(g) && dB.has(g)); };
      const tk = ++crTick, q = [A.part.keys().next().value]; crSeen[q[0]] = tk;
      for(let k = 0; k < q.length; k++) for(const { e, o } of adjE[q[k]]) if(e.state !== 1 && crSeen[o] !== tk && use(o)){ crSeen[o] = tk; q.push(o); }
      const inR = id => crSeen[id] === tk;
      let allIn = true; for(const P of [A, B]) for(const t of P.part.keys()) if(!inR(t)){ allIn = false; break; }
      if(!allIn) continue;
      const W1 = w + 1, segs = new Map(), list = [];
      const open = (id, dx, dy) => { const x = id % w, y = (id - x) / w, X = x + dx, Y = y + dy;
        if(X < 0 || Y < 0 || X >= w || Y >= h || !ctx.isActive(X, Y)) return false; const o = cid(X, Y); if(!inR(o)) return false;
        for(const { e, o: o2 } of adjE[id]) if(o2 === o) return e.state !== 1; return false; };
      for(const id of q){ const x = id % w, y = (id - x) / w;
        const add = (x0, y0, x1, y1) => { const sg = { id, a: y0 * W1 + x0, b: y1 * W1 + x1, dx: x1 - x0, dy: y1 - y0, used: false }; list.push(sg); let L = segs.get(sg.a); if(!L){ L = []; segs.set(sg.a, L); } L.push(sg); };
        if(!open(id, 0, -1)) add(x + 1, y, x, y);
        if(!open(id, 0, 1)) add(x, y + 1, x + 1, y + 1);
        if(!open(id, -1, 0)) add(x, y, x, y + 1);
        if(!open(id, 1, 0)) add(x + 1, y + 1, x + 1, y);
      }
      for(const s0 of list){
        if(s0.used) continue;
        const cyc = []; let cur = s0;                                          // tile ids along the cycle
        while(cur && !cur.used){
          cur.used = true; cyc.push(cur.id);
          const outs = segs.get(cur.b) || []; let nxt = null;
          for(const [tx, ty] of [[cur.dy, -cur.dx], [cur.dx, cur.dy], [-cur.dy, cur.dx], [-cur.dx, -cur.dy]]){ nxt = outs.find(sg => !sg.used && sg.dx === tx && sg.dy === ty) || null; if(nxt) break; }
          cur = nxt;
        }
        const ap = new Set(), bp = new Set(), cand = new Set();
        for(const id of cyc){ const g = find(id); if(g === A.rep) ap.add('a' + A.part.get(id)); else if(g === B.rep) bp.add('b' + B.part.get(id)); else if(!dB.has(g)) cand.add(g); }
        if(ap.size < 2 || cand.size === 0) continue;
        const apL = [...ap], bpL = [...bp];
        for(const g of cand){
          const lab = id => { const r = find(id); if(r === A.rep) return 'a' + A.part.get(id); if(r === B.rep) return 'b' + B.part.get(id); if(r === g) return 'bN'; return null; };
          const seq = []; for(const id of cyc){ const L = lab(id); if(L !== null && seq[seq.length - 1] !== L) seq.push(L); }
          while(seq.length > 1 && seq[0] === seq[seq.length - 1]) seq.pop();
          let hit = false;
          const bAll = bpL.concat(['bN']);
          for(let u = 0; u < apL.length && !hit; u++) for(let v = u + 1; v < apL.length && !hit; v++) for(const r of bAll){
            if(r !== 'bN') continue;                                           // one of the two B parts is the new one (the rest is the cross rule's)
            for(const z of bpL){
              const keep = new Set([apL[u], apL[v], r, z]), c = [];
              for(const l of seq) if(keep.has(l) && c[c.length - 1] !== l) c.push(l);
              while(c.length > 1 && c[0] === c[c.length - 1]) c.pop();
              if(c.length === 4 && c[0][0] !== c[1][0] && c[1][0] !== c[2][0] && c[2][0] !== c[3][0] && c[0] !== c[2] && c[1] !== c[3]){ hit = true; break; }
            }
          }
          if(hit){ const k = g + ':' + B.rep; if(!seenFact.has(k)){ seenFact.add(k); out.push([members.get(g)[0], B.part.keys().next().value]); } }
        }
      }
    }
    return out;
  }
  function* pairProbeStage(){
    const dl = nowMs() + (opts.pairProbeMs != null ? +opts.pairProbeMs : 3000), D = opts.pairProbeDist != null ? +opts.pairProbeDist : 10;
    const inner = opts.pairProbeInner !== false;                                 // an assumption that survives propagation gets one probe pass (ppInner)
    const near = (src, Dm) => {                                                  // tiles within D steps (through open / joined edges) of a tile set
      const Dx = Dm != null ? Dm : D;
      const dist = new Map(); const q = []; for(const s of src){ dist.set(s, 0); q.push(s); }
      for(let i = 0; i < q.length; i++){ const v = q[i], d = dist.get(v); if(d >= Dx) continue;
        for(const { e, o } of adjE[v]) if(e.state !== 1 && !dist.has(o)){ dist.set(o, d + 1); q.push(o); } }
      return dist;
    };
    const differ = (x, y) => { for(const [fa, fb] of forbidden){ const ra = find(fa), rb = find(fb); if((ra === x && rb === y) || (ra === y && rb === x)) return true; }
      for(const id of members.get(x)) for(const { e, o } of adjE[id]) if(e.state === 1 && find(o) === y) return true; return false; };
    for(let round = 0; round < 20; round++){
      let found = false;
      // apart probes: two groups of 2+ tiles near each other (v88b: within the group's own room, only where space is tight)
      const reps = [...members.keys()].filter(r => members.get(r).length >= 2);
      const share = opts.pairProbeShare != null ? +opts.pairProbeShare : 0.5;
      const fewK = ctx.pieceCapMax != null && ctx.pieceCapMax <= (opts.pairProbeFewK != null ? +opts.pairProbeFewK : 8);
      const ndOf = r => Math.max(members.get(r).length, (rootNeed && rootNeed.get(r)) || 0);
      const cpOf = r => (rootCap && rootCap.get(r)) || ctx.totalActive;
      const roomOf = (ra, rb) => {                                            // tiles A or B can use: their open area without groups that differ from both
        const isD = (x, y) => differ(x, y);
        const seen = new Set(), q = []; for(const t of members.get(ra)) { seen.add(t); q.push(t); }
        for(let i = 0; i < q.length; i++) for(const { e, o } of adjE[q[i]]){ if(e.state === 1 || seen.has(o)) continue; const g = find(o);
          if(g !== ra && g !== rb && isD(g, ra) && isD(g, rb)) continue; seen.add(o); q.push(o); }
        return seen.size;
      };
      for(const r0 of reps){
        const ra0 = find(r0); if(!members.has(ra0)) continue;
        const Dg = Math.max(2, Math.min(20, cpOf(ra0) - members.get(ra0).length));
        const nb = near(members.get(ra0), Dg);
        const others = new Set(); for(const [t] of nb){ const rt = find(t); if(rt !== ra0 && members.get(rt).length >= 2) others.add(rt); }
        for(const r1 of others){
          if(nowMs() > dl || stopScan()) return null;
          const ra = find(r0), rb = find(r1); if(ra === rb || ra > rb || differ(ra, rb)) continue;    // each pair once
          if(!fewK && opts.pairProbeGate !== false && ndOf(ra) + ndOf(rb) < share * roomOf(ra, rb)) continue;   // v88b: room enough, no contradiction to find
          const sn = snapshot(); forbidden.push([members.get(ra)[0], members.get(rb)[0], 'pair-probe']); let ok = propagate() !== null; if(ok && inner) ok = pairInner(dl); restore(sn);
          stats.probes++;
          if(!ok){ stats.probeDeductions++; found = true; const fine = yield* applyFact('join', members.get(ra)[0], members.get(rb)[0], 'pair-join'); if(!fine) return 'impossible'; }
        }
      }
      // v88a: cross-mark instead of join probes (one outline walk per pair of split groups)
      if(opts.crossMark !== false){
        const dm = new Map();
        const addD = (x, y) => { if(!dm.has(x)) dm.set(x, new Set()); dm.get(x).add(y); };
        for(const e of edges) if(e.state === 1){ const a2 = find(e.a), b2 = find(e.b); if(a2 !== b2){ addD(a2, b2); addD(b2, a2); } }
        for(const [fa, fb] of forbidden){ const a2 = find(fa), b2 = find(fb); if(a2 !== b2){ addD(a2, b2); addD(b2, a2); } }
        for(const [t, b0] of crossMarks(dm)){
          if(find(t) === find(b0) || differ(find(t), find(b0))) continue;
          found = true; const fine = yield* applyFact('apart', t, b0, 'cross'); if(!fine) return 'impossible';
        }
      }
      if(!found) break;
      const pr = yield* probeLoop(); if(pr === 'impossible') return 'impossible';
    }
    return null;
  }
  // ---- v92a: clue-pair probes (see patch_core92.py) ----
  const clueIds = [];
  for(const id of activeIds){ const x = id % w, y = (id - x) / w;
    if(ctx.roseTypeAt(x, y) != null || areaAt[id] || ctx.requiredShapeAt(x, y) != null || (ctx.compasses && ctx.compasses.has(x + ',' + y))) clueIds.push(id); }
  const clueStats = { probes: 0, join: 0, apart: 0, ms: 0 };
  function clueDiffMap(){
    const dm = new Map(), addD = (x, y) => { if(!dm.has(x)) dm.set(x, new Set()); dm.get(x).add(y); };
    for(const e of edges) if(e.state === 1){ const a2 = find(e.a), b2 = find(e.b); if(a2 !== b2){ addD(a2, b2); addD(b2, a2); } }
    for(const [fa, fb] of forbidden){ const a2 = find(fa), b2 = find(fb); if(a2 !== b2){ addD(a2, b2); addD(b2, a2); } }
    return dm;
  }
  const clueDeepDone = new Set();
  const clueSig = () => { let n = 0; for(const e of spots) if(e.state !== 0) n++; return n + '/' + forbidden.length; };
  const clueSide = { n: (x, y, cx, cy) => y < cy, s: (x, y, cx, cy) => y > cy, e: (x, y, cx, cy) => x > cx, w: (x, y, cx, cy) => x < cx };
  function clueTight(ra, rb){                              // largest (number + number) / (tiles on that side of either compass), over shared directions
    let best = 0;
    for(const p of members.get(ra)){ const px = p % w, py = (p - px) / w, cp = ctx.compasses.get(px + ',' + py); if(!cp) continue;
      for(const q of members.get(rb)){ const qx = q % w, qy = (q - qx) / w, cq = ctx.compasses.get(qx + ',' + qy); if(!cq) continue;
        for(const d of ['n', 'e', 's', 'w']){ if(cp[d] == null || cq[d] == null) continue;
          let cnt = 0; for(const id of activeIds){ const x = id % w, y = (id - x) / w; if(clueSide[d](x, y, px, py) || clueSide[d](x, y, qx, qy)) cnt++; }
          const sc = cnt > 0 ? (cp[d] + cq[d]) / cnt : 9; if(sc > best) best = sc; } } }
    return best;
  }
  function* cluePairStage(){
    const t0 = nowMs(); let dl = t0 + (opts.cluePairMs != null ? +opts.cluePairMs : 4000);
    const inner = opts.cluePairInner === true;
    try {
      for(let round = 0; round < 20; round++){
        let found = false, dm = clueDiffMap();
        const reps = [...new Set(clueIds.map(find))];
        if(reps.length < 2) break;
        {
          // deep probes (v92f): compasses that count in the same direction share the tiles of that side. Where the two numbers together
          // come close to the tiles there are, the pair is tried with one probe pass inside the assumption (tightest pairs first).
          if(opts.cluePairDeep !== false && ctx.compasses && ctx.compasses.size >= 2){
          const dlDeep = t0 + (opts.cluePairDeepMs != null ? +opts.cluePairDeepMs : 15000);
          const cands = [];
          for(let i = 0; i < reps.length; i++) for(let j = i + 1; j < reps.length; j++){
            const ra = find(reps[i]), rb = find(reps[j]); if(ra === rb) continue;
            const da = dm.get(ra); if(da && da.has(rb)) continue;
            const sc = clueTight(ra, rb); if(sc >= (opts.cluePairTight != null ? +opts.cluePairTight : 0.5) && !clueDeepDone.has(ra + ':' + rb + ':' + clueSig())) cands.push([sc, ra, rb]);
          }
          cands.sort((x, y) => y[0] - x[0]);
          let hit = false;
          for(const [, ra0, rb0] of cands){
            if(nowMs() > dlDeep || stopScan()) break;
            const ra = find(ra0), rb = find(rb0); if(ra === rb) continue;
            const ta = members.get(ra)[0], tb = members.get(rb)[0];
            clueStats.deep = (clueStats.deep || 0) + 1; stats.probes++;
            let sn = snapshot(); union(ra, rb); let ok = propagate() !== null; if(ok) ok = pairInner(dlDeep); restore(sn);
            if(opts.onClueProbe) opts.onClueProbe('deep join', ta, tb, ok, failWhy);
            if(!ok){ clueStats.apart++; stats.probeDeductions++; hit = true; const fine = yield* applyFact('apart', ta, tb, 'clue-apart'); if(!fine) return 'impossible'; break; }
            sn = snapshot(); forbidden.push([ta, tb, 'clue-probe']); ok = propagate() !== null; if(ok) ok = pairInner(dlDeep); restore(sn);
            if(opts.onClueProbe) opts.onClueProbe('deep apart', ta, tb, ok, failWhy);
            if(!ok){ clueStats.join++; stats.probeDeductions++; hit = true; const fine = yield* applyFact('join', ta, tb, 'clue-join'); if(!fine) return 'impossible'; break; }
            clueDeepDone.add(ra + ':' + rb + ':' + clueSig());
          }
          if(hit){ const pr = yield* probeLoop(); if(pr === 'impossible') return 'impossible'; continue; }
          }
        }
        for(let i = 0; i < reps.length; i++) for(let j = i + 1; j < reps.length; j++){
          if(nowMs() > dl || stopScan()){ if(opts.onClueProbe) opts.onClueProbe('STOP', 0, 0, nowMs() > dl, ''); return null; }
          const ra = find(reps[i]), rb = find(reps[j]);
          if(ra === rb) continue;
          const da = dm.get(ra); if(da && da.has(rb)){ if(opts.onClueProbe && round === 0) opts.onClueProbe('known-apart', members.get(ra)[0], members.get(rb)[0], true, (forbidden.find(f => (find(f[0]) === ra && find(f[1]) === rb) || (find(f[0]) === rb && find(f[1]) === ra)) || [0, 0, 'wall'])[2] || 'forbidden'); continue; }
          const ta = members.get(ra)[0], tb = members.get(rb)[0];
          clueStats.probes++; stats.probes++;
          let sn = snapshot(); union(ra, rb); let ok = propagate() !== null; if(ok && inner) ok = pairInner(dl); restore(sn);
          if(opts.onClueProbe) opts.onClueProbe('join', ta, tb, ok, failWhy);
          if(!ok){
            clueStats.apart++; stats.probeDeductions++; found = true;
            const fine = yield* applyFact('apart', ta, tb, 'clue-apart'); if(!fine) return 'impossible';
            dm = clueDiffMap(); continue;
          }
          sn = snapshot(); forbidden.push([ta, tb, 'clue-probe']); ok = propagate() !== null; if(ok && inner) ok = pairInner(dl); restore(sn);
          if(opts.onClueProbe) opts.onClueProbe('apart', ta, tb, ok, failWhy);
          if(!ok){
            clueStats.join++; stats.probeDeductions++; found = true;
            const fine = yield* applyFact('join', ta, tb, 'clue-join'); if(!fine) return 'impossible';
            dm = clueDiffMap();
          }
        }
        if(!found) break;
        const pr = yield* probeLoop(); if(pr === 'impossible') return 'impossible';
      }
      return null;
    } finally { clueStats.ms += nowMs() - t0; if(opts.onClueStats) opts.onClueStats(clueStats); }
  }
  const clueOn = opts.cluePair !== false && clueIds.length >= 2;
  // with the portfolio it runs after the first exact slices (a puzzle they solve never pays, like the two-piece DP); without it, here
  if(!finalOnly && !ended && opts.pairProbe !== false && !(exactMode === 'edge' && opts.portfolio !== false && !opts.fullScan) && spots.some(e => e.state === 0)){
    const r = yield* pairProbeStage(); if(r === 'impossible') ended = 'impossible';
    if(!ended && clueOn && spots.some(e => e.state === 0)){ const r2 = yield* cluePairStage(); if(r2 === 'impossible') ended = 'impossible'; }   // v92a
  }
  // ---- v78: two-piece DP (see patch_core78.py) ----
  function twoPieceK2(){
    const T = activeIds.length, D = new Set();
    for(const id of activeIds){ const a = ctx.requiredAreaAt(id % w, (id - id % w) / w); if(a != null) D.add(a); }
    let sumD = 0; for(const v of D) sumD += v;
    if(D.size === 2 && sumD === T) return true;
    if(ctx.pieceCapMax != null && ctx.pieceCapMax <= 2 && edges.some(e => e.state === 1)) return true;
    return false;
  }
  function twoPieceDP(){                     // -> null (no conclusion) | { sols: 0 } | { sols: 1, col: Int8Array } | { sols: 2 }
    const T = activeIds.length, t0 = nowMs(), maxMs = opts.twoPieceMs != null ? +opts.twoPieceMs : 8000, maxStates = opts.twoPieceStates || 400000;
    const act = (x, y) => x >= 0 && y >= 0 && x < w && y < h && ctx.isActive(x, y);
    // fixed colours and sizes from the area numbers
    const fixedC = new Int8Array(N).fill(-1), byVal = new Map();
    for(const id of activeIds){ const a = ctx.requiredAreaAt(id % w, (id - id % w) / w); if(a != null){ if(!byVal.has(a)) byVal.set(a, []); byVal.get(a).push(id); } }
    let sz = null;                                                             // allowed [size of colour 0, size of colour 1] pairs (null = any)
    const vals = [...byVal.keys()];
    if(vals.length > 2) return { sols: 0 };
    if(vals.length === 2){ if(vals[0] + vals[1] !== T) return { sols: 0 }; byVal.get(vals[0]).forEach(id => fixedC[id] = 0); byVal.get(vals[1]).forEach(id => fixedC[id] = 1); sz = [[vals[0], vals[1]]]; }
    else if(vals.length === 1){
      const a = vals[0];
      if(2 * a === T){ fixedC[byVal.get(a)[0]] = 0; sz = [[a, a]]; }
      else { if(a >= T) return { sols: 0 }; byVal.get(a).forEach(id => fixedC[id] = 0); sz = [[a, T - a]]; }
    } else fixedC[activeIds[0]] = 0;                                          // nothing tells the colours apart: break the symmetry
    const lo = Math.max(1, ctx.sizeLo || 1), hi = Math.min(T, ctx.sizeHi || T);
    if(!sz){ sz = []; for(let s = lo; s <= hi; s++) if(T - s >= lo && T - s <= hi) sz.push([s, T - s]); if(!sz.length) return { sols: 0 }; if(sz.length === T - 1) sz = null; }
    else sz = sz.filter(([a, b]) => a >= lo && a <= hi && b >= lo && b <= hi);
    if(sz && !sz.length) return { sols: 0 };
    const max0 = sz ? Math.max(...sz.map(p => p[0])) : T, max1 = sz ? Math.max(...sz.map(p => p[1])) : T;
    // towers
    const tower = new Map(); if(ctx.watchtowers) for(const [k, v] of ctx.watchtowers) tower.set(k, v);
    const rel = (x1, y1, x2, y2) => { const e = edgeBetween(x1, y1, x2, y2); return e ? e.state : 0; };     // 1 = different colours, 2 = same
    // vertex test: tiles TL TR BL BR with colours (-1 = none); false = broken
    const vOk = (vx, vy, tl, tr, bl, br) => {
      if(tl >= 0 && tr >= 0 && bl >= 0 && br >= 0 && tl === br && tr === bl && tl !== tr) return false;
      const tv = tower.get(vx + ',' + vy); if(tv == null) return true;
      let c0 = 0, c1 = 0; for(const c of [tl, tr, bl, br]){ if(c === 0) c0 = 1; else if(c === 1) c1 = 1; }
      return c0 + c1 === tv;
    };
    let cur = new Map();
    cur.set('', { m: [], lab: [], c0: 0, done: 0, n: 1, par: null, row: null });
    let processed = 0;
    for(let y = 0; y < h; y++){
      const nxt = new Map();
      const cols = []; for(let x = 0; x < w; x++) if(act(x, y)) cols.push(x);
      for(const st of cur.values()){
        if(nowMs() - t0 > maxMs) return null;
        const prev = st.m;                                                    // colours of row y-1 by column (-1 = none), [] for y = 0
        const pc = x => (y > 0 && prev.length) ? prev[x] : -1;
        const row = new Int8Array(w).fill(-1);
        const rec = x => {
          if(x === w){
            if(!vOk(w, y, pc(w - 1), -1, row[w - 1], -1)) return;
            finish();
            return;
          }
          if(!act(x, y)){ row[x] = -1; if(!vOk(x, y, x > 0 ? pc(x - 1) : -1, pc(x), x > 0 ? row[x - 1] : -1, -1)) return; rec(x + 1); return; }
          for(const c of [0, 1]){
            const id = cid(x, y);
            if(fixedC[id] !== -1 && fixedC[id] !== c) continue;
            if((st.done >> c) & 1) continue;
            if(x > 0 && row[x - 1] >= 0){ const r = rel(x - 1, y, x, y); if((r === 1 && row[x - 1] === c) || (r === 2 && row[x - 1] !== c)) continue; }
            if(pc(x) >= 0){ const r = rel(x, y - 1, x, y); if((r === 1 && pc(x) === c) || (r === 2 && pc(x) !== c)) continue; }
            row[x] = c;
            if(!vOk(x, y, x > 0 ? pc(x - 1) : -1, pc(x), x > 0 ? row[x - 1] : -1, c)) continue;
            rec(x + 1);
          }
          row[x] = -1;
        };
        const finish = () => {
          let add0 = 0, addN = 0; for(const x of cols){ addN++; if(row[x] === 0) add0++; }
          const c0 = st.c0 + add0, c1 = processed + addN - c0;
          if(c0 > max0 || c1 > max1) return;
          // union-find: old labels 0..k-1, new cells k + x
          let k = 0; for(const l of st.lab) if(l >= k) k = l + 1;
          const par = new Int32Array(k + w); for(let i = 0; i < k + w; i++) par[i] = i;
          const f = a => { while(par[a] !== a){ par[a] = par[par[a]]; a = par[a]; } return a; };
          const u = (a, b) => { a = f(a); b = f(b); if(a !== b) par[a] = b; };
          for(const x of cols){ if(pc(x) >= 0 && pc(x) === row[x]) u(k + x, st.lab[x]); if(x > 0 && row[x - 1] >= 0 && row[x - 1] === row[x]) u(k + x, k + x - 1); }
          const contRoots = new Set(); for(const x of cols) contRoots.add(f(k + x));
          let done = st.done;
          // old labels that do not continue: that whole colour ends here
          const oldRootCol = new Map(); for(let x = 0; x < w; x++) if(y > 0 && prev.length && prev[x] >= 0) oldRootCol.set(st.lab[x], prev[x]);
          const closing = [];
          for(const [l, c] of oldRootCol) if(!contRoots.has(f(l))) closing.push([l, c]);
          for(const [l, c] of closing){
            if((done >> c) & 1) return;                                         // two parts of one colour end
            for(const [l2, c2] of oldRootCol) if(c2 === c && f(l2) !== f(l)) return;   // another part of that colour still exists
            for(const x of cols) if(row[x] === c) return;
            done |= 1 << c;
            if(sz){ const have = c === 0 ? c0 : c1; if(!sz.some(p => p[c] === have)) return; }
          }
          // labels of the new row, normalised
          const lab = new Array(w).fill(-1), map = new Map();
          for(let x = 0; x < w; x++){ if(row[x] < 0) continue; const r = f(k + x); if(!map.has(r)) map.set(r, map.size); lab[x] = map.get(r); }
          const m = Array.from(row);
          const key = m.join('') + '|' + lab.join(',') + '|' + (sz ? c0 : '') + '|' + done;
          const e = nxt.get(key);
          if(e){ e.n = Math.min(2, e.n + st.n); }
          else { nxt.set(key, { m, lab, c0, done, n: st.n, par: st, row: m }); if(nxt.size > maxStates) throw 'big'; }
        };
        try{ rec(0); } catch(err){ if(err === 'big') return null; throw err; }
      }
      processed += cols.length;
      cur = nxt;
      if(cur.size === 0) return { sols: 0 };
    }
    // the bottom outline vertices, and the end: each colour one part (or finished), both used, sizes
    let sols = 0, best = null;
    for(const st of cur.values()){
      let ok = true;
      for(let vx = 0; vx <= w && ok; vx++){ const tl = vx > 0 ? st.m[vx - 1] : -1, tr = vx < w ? st.m[vx] : -1; if(!vOk(vx, h, tl, tr, -1, -1)) ok = false; }
      if(!ok) continue;
      const roots = [new Set(), new Set()]; for(let x = 0; x < w; x++) if(st.m[x] >= 0) roots[st.m[x]].add(st.lab[x]);
      for(const c of [0, 1]){ const fin = (st.done >> c) & 1; if(fin ? roots[c].size !== 0 : roots[c].size !== 1) ok = false; }
      if(!ok) continue;
      const c1 = T - st.c0; if(sz && !sz.some(p => p[0] === st.c0 && p[1] === c1)) continue;
      sols = Math.min(2, sols + st.n); best = st;
      if(sols >= 2) break;
    }
    if(sols !== 1) return { sols };
    const col = new Int8Array(N).fill(-1);
    for(let s = best, y = h - 1; s && s.row; s = s.par, y--) for(let x = 0; x < w; x++) if(s.row[x] >= 0) col[cid(x, y)] = s.row[x];
    return { sols: 1, col };
  }
  function* twoPieceStage(){                  // v78: returns 'impossible' or null
    if(finalOnly || opts.twoPiece === false || !spots.some(e => e.state === 0) || !twoPieceK2()) return null;
    const tp = twoPieceDP();
    if(opts.onTwoPiece) opts.onTwoPiece(tp ? tp.sols : null);                 // tests only
    if(tp && tp.sols === 0){ failWhy = 'two-piece'; return 'impossible'; }
    if(tp && tp.sols === 1){
      for(const e of spots){
        if(e.state !== 0) continue;
        const ca = tp.col[e.a], cb = tp.col[e.b]; if(ca < 0 || cb < 0) continue;
        const fine = yield* apply(e, ca === cb ? 'same' : 'wall', 'inference', 'two-piece', 'two-piece');
        if(!fine) return 'impossible';
      }
    }
    return null;
  }
  // with the portfolio the stage runs after the first exact slices (a puzzle they solve never pays for it); without, here
  const tpLate = exactMode === 'edge' && opts.portfolio !== false && !finalOnly && !opts.fullScan;
  if(!ended && !tpLate && !opts.twoPieceEarly){ const r = yield* twoPieceStage(); if(r === 'impossible') ended = 'impossible'; }
  if(opts.sketch && !ended){ yield* sketchRun(opts); return; }
  if(opts.guessLayer && !ended){ yield* guessLayerRun(opts); return; }
  if(opts.jointTest && !ended){ yield { type: 'joint-test', run: (n, seed, order) => { let sd = seed >>> 0; const rnd = () => { sd = (sd + 0x6D2B79F5) >>> 0; let t = sd; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; const out = []; propagate(); for(let i = 0; i < n; i++) out.push(jointAttempt(rnd, order)); return out; } }; return; }
  // v40: PORTFOLIO, first slices (before the scan: a puzzle the edge search solves fast never pays for it)
  let finalAnnounced = false;
  const slicePlan = parseSlices(opts.slices), usePortfolio = exactMode === 'edge' && opts.portfolio !== false && !finalOnly;
  let preDone = false;
  if(!ended && usePortfolio && !opts.fullScan && spots.length > 0){          // v50: fullScan = every open edge gets its narrow test before any exact slice
    for(const sl of slicePlan.pre){
      if(!finalAnnounced){ finalAnnounced = true; yield { type: 'stage', stage: 'final', stats: Object.assign({}, stats), counts: counts() }; }
      const r = yield* runSlice(sl.kind, sl.ms);
      if(r !== 'timeout') return;
    }
    preDone = true;
    if(tpLate && !opts.twoPieceEarly){ const r = yield* twoPieceStage(); if(r === 'impossible') ended = 'impossible'; }        // v78
    if(tpLate && !ended && opts.pairProbe !== false && spots.some(e => e.state === 0)){ const r = yield* pairProbeStage(); if(r === 'impossible') ended = 'impossible'; }   // v87b
    if(tpLate && !ended && clueOn && spots.some(e => e.state === 0)){ const r = yield* cluePairStage(); if(r === 'impossible') ended = 'impossible'; }   // v92a
    if(tpLate && !ended && clueOn && opts.clueBranch !== false && spots.some(e => e.state === 0)){                                     // v92e: first clue search slice
      const first = opts.clueFirstMs != null ? +opts.clueFirstMs : (roseTypeList.length >= 2 ? 40000 : 10000);     // roses of several types: the grouping IS the puzzle
      if(first > 0){ const r = yield* runSlice('clue', first); if(r !== 'timeout') return; }
    }
  }
  scanLoop:
  if(!ended && !finalOnly && !opts.noScan && (opts.scan || exactMode === 'old' || (usePortfolio && slicePlan.scan)) && spots.length > 0){
    if(exactMode === 'edge' && !opts.fullScan) scanCapAt = nowMs() + slicePlan.scanMs;
    if(restart === 'first'){
      // literal version of the spec: after any deduction, redo the scan from the first open spot
      let progressed = true;
      while(progressed){
        progressed = false;
        stats.scans++;
        for(let k = 0; k < spotOrder.length; k++){
          const e = spotOrder[k];
          if(e.state !== 0) continue;
          if(stopScan()) break scanLoop;
          const res = yield* testSpot(e, k);
          if(res.end){ ended = res.end; break scanLoop; }
          if(res.progress){ progressed = true; break; }
        }
      }
    } else {
      // keep going round; stop after a full lap of open spots with nothing learned
      let k = 0, idle = 0;
      stats.scans = 1;
      while(true){
        const open = openCount();
        if(open === 0 || idle >= open) break;
        let e = null;
        for(let tries = 0; tries < spotOrder.length; tries++){
          const cand = spotOrder[k % spotOrder.length]; k++;
          if(cand.state === 0){ e = cand; break; }
        }
        if(!e) break;
        if(stopScan()) break scanLoop;
        const res = yield* testSpot(e, k - 1);
        if(res.end){ ended = res.end; break scanLoop; }
        if(res.progress) idle = 0; else idle++;
      }
    }
  }
  stats.scanMs = nowMs() - scanStart;

  if(ended === 'impossible'){ failWhy = tagOut(failWhy); yield { type: 'impossible-early', reason: 'a deduction contradicted an earlier one' + (failWhy && WHY_TEXT[failWhy] ? ' (' + WHY_TEXT[failWhy] + ')' : ''), why: failWhy }; return; }
  if(ended === 'two' && stopAtTwo){
    for(const t of twoSolutions){                       // v41: skip a tiling an earlier slice has already reported (v40 could emit the same tiling twice)
      const k = t.map(p => p.cells.map(c => c.join(',')).sort().join(';')).sort().join('|');
      if(portSeen.has(k)) continue;
      portSeen.add(k); yield { type: 'solution', pieces: t };
    }
    return;
  }

  // ---- final stage: the exact solver on the half-solved puzzle ----
  const finalWalls = new Set(), finalLinks = [];
  for(const x of spots){
    if(x.state === 1) finalWalls.add(x.key);
    else if(x.state === 2) finalLinks.push([x.c1, x.r1, x.c2, x.r2]);
  }
  if(!finalAnnounced) yield { type: 'stage', stage: 'final', stats: Object.assign({}, stats), counts: counts() };
  if(exactMode === 'edge'){
    let post = preDone ? (slicePlan.post.length ? slicePlan.post : []) : slicePlan.pre.concat(slicePlan.post);
    if(preDone && !opts.fullScan && opts.scanTimeoutStop !== 0 && scanTimeoutRun >= (opts.scanTimeoutStop || 60)) post = post.filter(x => x.kind === 'edge').concat(post.filter(x => x.kind !== 'edge'));   // v71
    if(clueOn && opts.clueBranch !== false && opts.portfolio !== false){             // v92e: clue search slices: one early, then turn about with the edge search
      const fin = post.length ? post.slice(0, -1) : [];
      post = fin.concat([{ kind: 'clue', ms: 30000 }, { kind: 'edge', ms: 30000 }, { kind: 'clue', ms: 120000 }, { kind: 'edge', ms: 120000 }, { kind: 'clue', ms: Infinity }]);
    }
    if(opts.portfolio === false) yield* edgeSearch(null, null, true); else yield* runSlices(post);
  }
  else yield* solvePuzzle(w, h, ctx, specialEdges, finalBudget, { extraWalls: finalWalls, links: finalLinks });
}

if(typeof module !== 'undefined'){
  module.exports = { normalizeCells, cellsKey, TRANSFORMS, shapeOrientations, canonicalShapeKey, enumerateConnectedSubsetsContaining, enumerateConnectedSubsetsFrom, shortestPathBetween, buildSolverContext, banInfoFor, containsShapeSet, candidatesForCell, solvePuzzle, deduceSolve, enumerateLinkedRegions, deriveContext, isRectangular, enumerateRectanglesContaining };
}


