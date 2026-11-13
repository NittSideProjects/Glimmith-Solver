// independent check of the solution B found for the user's puzzle (own code, nothing from solver-core)
const { P } = require('../user_puzzle.js'); const O = require('../oracle.js');
const sol = JSON.parse(require('fs').readFileSync(__dirname + '/user_solution.json', 'utf8'));
const w = 20, h = 20; const owner = new Map(); let ok = true; const fail = m => { ok = false; console.log('FAIL:', m); };
sol.forEach((cells, i) => cells.forEach(([c, r]) => { const k = c + ',' + r; if(owner.has(k)) fail('cell in two pieces ' + k); owner.set(k, i); }));
let active = 0; for(let r = 0; r < h; r++) for(let c = 0; c < w; c++) if(P.puzzle.active[r][c]){ active++; if(!owner.has(c + ',' + r)) fail('uncovered ' + c + ',' + r); }
if(owner.size !== active) fail('covered count ' + owner.size + ' vs active ' + active);
const bankKeys = new Set(P.bank.map(s => O.canon(s.cells)));
const keyOf = sol.map(cells => O.canon(cells));
const wallBetween = (c1, r1, c2, r2) => r1 === r2 ? P.puzzle.walls.has(`v:${Math.min(c1, c2)},${r1}`) : P.puzzle.walls.has(`h:${c1},${Math.min(r1, r2)}`);
sol.forEach((cells, i) => {
  if(!bankKeys.has(keyOf[i])) fail('piece ' + i + ' not a bank shape');
  const set = new Set(cells.map(([c, r]) => c + ',' + r));
  const seen = new Set([cells[0].join(',')]); const st = [cells[0]];
  while(st.length){ const [c, r] = st.pop(); for(const [dc, dr] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nc = c + dc, nr = r + dr, nk = nc + ',' + nr; if(set.has(nk)){ if(wallBetween(c, r, nc, nr)) fail('piece crosses a wall at ' + c + ',' + r); else if(!seen.has(nk)){ seen.add(nk); st.push([nc, nr]); } } } }
  if(seen.size !== cells.length) fail('piece ' + i + ' not connected');
  for(const [c, r] of cells){ const a = P.puzzle.areaNumbers.get(c + ',' + r); if(a != null && a !== cells.length) fail(`area number ${a} at ${c},${r} but piece size ${cells.length}`); }
});
for(let r = 0; r < h; r++) for(let c = 0; c < w; c++){ const a = owner.get(c + ',' + r); if(a === undefined) continue;
  for(const [dc, dr] of [[1,0],[0,1]]){ const b = owner.get((c + dc) + ',' + (r + dr)); if(b !== undefined && a !== b && keyOf[a] === keyOf[b]) fail(`mingle-shape: touching pieces ${a} and ${b} have the same shape near ${c},${r}`); } }
const sizes = {}; sol.forEach(c => { sizes[c.length] = (sizes[c.length] || 0) + 1; });
console.log(ok ? `VALID: ${sol.length} pieces, sizes ${JSON.stringify(sizes)}, all rules satisfied` : 'INVALID');
