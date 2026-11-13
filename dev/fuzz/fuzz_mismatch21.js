// Mismatch = every piece has a DIFFERENT SHAPE (not size). Plants a tiling of pairwise-different shapes, puts EQUAL area numbers on
// touching cells of different pieces, and checks that verdicts and every deduction agree with the independent oracle.
const L = require('../fuzzlib.js'), O = require('../oracle.js');
const N = +process.argv[2] || 60, seed0 = +process.argv[3] || 1;
let made = 0, bad = 0, deds = 0, dedBad = 0, tried = 0;
for(let i = 0; made < N && tried < N * 40; i++){
  tried++;
  const rnd = L.rng(seed0 * 7717 + i), pick = a => a[Math.floor(rnd()*a.length)];
  const w = 3 + Math.floor(rnd()*2), h = 3 + Math.floor(rnd()*2), active = L.makeGrid(w,h,1);
  const cells = []; for(let r=0;r<h;r++) for(let c=0;c<w;c++) cells.push([c,r]);
  const owner = new Map(), pieces = []; let ok = true;
  for(const [c0,r0] of cells.slice().sort(() => rnd()-.5)){
    if(owner.has(`${c0},${r0}`)) continue; const cs = [[c0,r0]]; owner.set(`${c0},${r0}`, pieces.length);
    const target = 1 + Math.floor(rnd()*4);
    for(let g = 0; g < 30 && cs.length < target; g++){
      const [c,r] = pick(cs), [dc,dr] = pick([[1,0],[-1,0],[0,1],[0,-1]]), k = `${c+dc},${r+dr}`;
      if(active[r+dr] && active[r+dr][c+dc] && !owner.has(k)){ owner.set(k, pieces.length); cs.push([c+dc,r+dr]); }
    }
    pieces.push(cs);
  }
  const keys = pieces.map(p => L.S.canonicalShapeKey(p));
  if(new Set(keys).size !== keys.length) continue;                       // planted tiling must satisfy Mismatch
  // equal area numbers on touching cells of two different pieces of the same size
  const areaNumbers = new Map();
  outer: for(const [c,r] of cells) for(const [dc,dr] of [[1,0],[0,1]]){
    const k1 = `${c},${r}`, k2 = `${c+dc},${r+dr}`;
    if(owner.has(k2) && owner.get(k1) !== owner.get(k2) && pieces[owner.get(k1)].length === pieces[owner.get(k2)].length && pieces[owner.get(k1)].length > 1){
      areaNumbers.set(k1, pieces[owner.get(k1)].length); areaNumbers.set(k2, pieces[owner.get(k2)].length); break outer; }
  }
  if(areaNumbers.size === 0) continue;
  pieces.forEach((pc,pi) => { if(rnd() < .6 && !pc.some(([c,r]) => areaNumbers.has(`${c},${r}`))){ const [c,r] = pick(pc); areaNumbers.set(`${c},${r}`, pc.length); } });
  made++;
  const puzzle = { w, h, active, walls:new Map(), roses:new Map(), polyominoes:new Map(), areaNumbers, palisades:new Map(), compasses:new Map(), watchtowers:new Map() };
  const P = { puzzle, rules:{ precision:null, min:null, max:5, mismatch:true }, bank:[], hints:null };
  const all = O.oracle(P, 100000), sigs = all.map(O.sigCells);
  if(all.length === 0){ console.log('planted tiling not accepted by oracle?!', seed0*7717+i); bad++; continue; }
  let dbg = 0; const runs = [['exact', L.exact(P,2,400000)], ['B', L.deduce(P,{ testNodes:30, restart:'continue', order:'clues', useWitness:true, keepEvents:true },2,400000)]];
  for(const [name,r] of runs){
    if(r.exceeded) continue;
    const want = Math.min(all.length,2); let good = r.sols.length === want && r.sols.every(s => sigs.includes(L.sig(s)));
    if(!good){ bad++; console.log('VERDICT MISMATCH', name, 'seed', seed0*7717+i, 'oracle', all.length, 'got', r.sols.length); }
    if(r.events && !dbg++) console.log('events', r.events.length, [...new Set(r.events.map(e=>e.type))].join(',')); if(r.events) for(const ev of r.events){
      if(ev.type !== 'deduce') continue; deds++; const sp = ev.spot;
      const same = sg => sg.split('|').some(p => { const cs = p.split(';'); return cs.includes(`${sp.c1},${sp.r1}`) && cs.includes(`${sp.c2},${sp.r2}`); });
      for(const sg of sigs) if(same(sg) !== (ev.value === 'same')){ dedBad++; console.log('UNSOUND', ev.value, sp.key, ev.source, 'seed', seed0*7717+i); break; }
    }
  }
}
console.log(`mismatch fuzz: ${made} puzzles, deductions checked ${deds}, verdict mismatches ${bad}, unsound ${dedBad}`);
process.exit(bad || dedBad ? 1 : 0);
