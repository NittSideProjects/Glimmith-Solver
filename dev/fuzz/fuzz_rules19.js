// the five v19 rules: exact solver + deduction solver vs the independent oracle on tiny random puzzles
const L = require('../fuzzlib.js'), O = require('../oracle.js');
const N = +process.argv[2] || 400, seed0 = +process.argv[3] || 1;
let bad = 0, checked = 0; const tally = { none:0, unique:0, multi:0 }; const used = {};
for(let i = 0; i < N; i++){
  const rnd = L.rng(seed0*7919 + i);
  const w = 3 + Math.floor(rnd()*2), h = 3, active = L.makeGrid(w,h,1);
  if(rnd() < .3) active[Math.floor(rnd()*h)][Math.floor(rnd()*w)] = 0;
  const pick = a => a[Math.floor(rnd()*a.length)];
  const cellsA = []; for(let r=0;r<h;r++) for(let c=0;c<w;c++) if(active[r][c]) cellsA.push([c,r]);
  const walls = new Map();
  for(let r=0;r<h;r++) for(let c=0;c<w;c++){
    if(c+1<w && active[r][c] && active[r][c+1] && rnd()<.12) walls.set(`v:${c},${r}`,'wall');
    if(r+1<h && active[r][c] && active[r+1][c] && rnd()<.12) walls.set(`h:${c},${r}`,'wall');
  }
  const puzzle = { w, h, active, walls, roses:new Map(), polyominoes:new Map(), areaNumbers:new Map(), palisades:new Map(), compasses:new Map(), watchtowers:new Map() };
  const rules = { precision:null, min: rnd()<.5?1:2, max: pick([3,4,5]), bricky: rnd()<.3, loopy: rnd()<.3, solitude: rnd()<.1 };
  const which = pick(['pal','comp','tow','none','pal','comp','tow']);
  if(which==='pal') for(let k=0;k<1+Math.floor(rnd()*2);k++){ const [c,r]=pick(cellsA); puzzle.palisades.set(`${c},${r}`, pick(['0','1','2c','2s','3','4'])); }
  if(which==='comp') for(let k=0;k<1+Math.floor(rnd()*2);k++){ const [c,r]=pick(cellsA); const o={n:null,e:null,s:null,w:null}; for(const d of ['n','e','s','w']) if(rnd()<.5) o[d]=Math.floor(rnd()*3); puzzle.compasses.set(`${c},${r}`, o); }
  if(which==='tow') for(let k=0;k<1+Math.floor(rnd()*3);k++) puzzle.watchtowers.set(`${Math.floor(rnd()*(w+1))},${Math.floor(rnd()*(h+1))}`, 1+Math.floor(rnd()*4));
  const P = { puzzle, rules, bank: [], hints: null };
  const truth = O.oracle(P, 3);
  tally[truth.length===0?'none':truth.length===1?'unique':'multi']++;
  const optSets = [{ testNodes: 15, restart:'first', order:'scan', useWitness:true }, { testNodes: 60, restart:'continue', order:'clues', useWitness:true, focusMode:'near' }, { testNodes: 8, restart:'continue', order:'scan', useWitness:false, focusMode:'none' }];
  const runs = [['A', L.exact(P,2,300000)], ...optSets.map((o,j)=>['B'+j, L.deduce(P,o,2,300000)])];
  for(const [name,r] of runs){
    if(r.exceeded) continue; checked++;
    const want = Math.min(truth.length,2); let ok = r.sols.length === want;
    if(ok && truth.length===1) ok = L.sig(r.sols[0]) === O.sigCells(truth[0]);
    if(ok && want===2){ const all = new Set(O.oracle(P,100000).map(O.sigCells)); ok = r.sols.every(s=>all.has(L.sig(s))); }
    if(!ok){ bad++; if(bad<=5) console.log('MISMATCH',name,'seed',seed0*7919+i,'oracle',truth.length,'got',r.sols.length,which,JSON.stringify(rules),JSON.stringify([...puzzle.palisades]),JSON.stringify([...puzzle.compasses]),JSON.stringify([...puzzle.watchtowers])); }
  }
}
console.log(`rules19 fuzz: ${N} puzzles ${JSON.stringify(tally)} checks ${checked} mismatches ${bad}`);
process.exit(bad?1:0);
