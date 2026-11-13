// v20: compass-heavy fuzz. Every verdict is compared with the independent oracle, and every deduction (wall / same)
// the scan makes must hold in ALL oracle solutions (soundness of the new compass inference + pruning).
const L = require('../fuzzlib.js'), O = require('../oracle.js');
const N = +process.argv[2] || 300, seed0 = +process.argv[3] || 1;
let bad = 0, checked = 0, deds = 0, dedBad = 0; const tally = { none:0, unique:0, multi:0 };
for(let i = 0; i < N; i++){
  const rnd = L.rng(seed0*104729 + i);
  const pick = a => a[Math.floor(rnd()*a.length)];
  const w = 3 + Math.floor(rnd()*2), h = 3 + Math.floor(rnd()*2), active = L.makeGrid(w,h,1);
  if(rnd() < .3) active[Math.floor(rnd()*h)][Math.floor(rnd()*w)] = 0;
  const cellsA = []; for(let r=0;r<h;r++) for(let c=0;c<w;c++) if(active[r][c]) cellsA.push([c,r]);
  const walls = new Map();
  for(let r=0;r<h;r++) for(let c=0;c<w;c++){
    if(c+1<w && active[r][c] && active[r][c+1] && rnd()<.15) walls.set(`v:${c},${r}`,'wall');
    if(r+1<h && active[r][c] && active[r+1][c] && rnd()<.15) walls.set(`h:${c},${r}`,'wall');
  }
  const compasses = new Map();
  const planted = rnd() < .65;
  if(planted){
    // plant a random tiling (random region growth, size <= 5), read compass values off it, so most puzzles are satisfiable
    const owner = new Map(); let id = 0;
    for(const [c0,r0] of cellsA.slice().sort(() => rnd()-.5)){
      if(owner.has(`${c0},${r0}`)) continue; const cells = [[c0,r0]]; owner.set(`${c0},${r0}`, id);
      const target = 1 + Math.floor(rnd()*5);
      while(cells.length < target){
        const [c,r] = pick(cells); const [dc,dr] = pick([[1,0],[-1,0],[0,1],[0,-1]]); const k = `${c+dc},${r+dr}`;
        if(active[r+dr] && active[r+dr][c+dc] && !owner.has(k)){ owner.set(k, id); cells.push([c+dc,r+dr]); } else if(rnd()<.3) break;
      }
      id++;
    }
    for(const [k,v] of owner){ const [c,r]=k.split(',').map(Number); const bs=[[1,0,'v',c,r],[0,1,'h',c,r]];
      for(const [dc,dr,o] of bs){ const k2=`${c+dc},${r+dr}`; if(owner.has(k2) && owner.get(k2)!==v && rnd()<.2) walls.set(`${o}:${c},${r}`,'wall'); } }
    for(let k = 0, m = 1 + Math.floor(rnd()*4); k < m; k++){
      const [c,r] = pick(cellsA); const mine = cellsA.filter(([x,y]) => owner.get(`${x},${y}`) === owner.get(`${c},${r}`));
      const t = { n:0, e:0, s:0, w:0 }; for(const [x,y] of mine){ if(y<r) t.n++; if(y>r) t.s++; if(x>c) t.e++; if(x<c) t.w++; }
      const o = { n:null, e:null, s:null, w:null }; for(const d of ['n','e','s','w']) if(rnd() < .55) o[d] = t[d];
      compasses.set(`${c},${r}`, o);
    }
  } else for(let k = 0, m = 1 + Math.floor(rnd()*4); k < m; k++){
    const [c,r] = pick(cellsA); const o = { n:null, e:null, s:null, w:null };
    for(const d of ['n','e','s','w']) if(rnd() < .45) o[d] = Math.floor(rnd()*4);
    compasses.set(`${c},${r}`, o);
  }
  const areaNumbers = new Map();
  for(let k=0,m=Math.floor(rnd()*4);k<m;k++){ const [c,r] = pick(cellsA); if(!compasses.has(`${c},${r}`)) areaNumbers.set(`${c},${r}`, 1 + Math.floor(rnd()*5)); }
  const puzzle = { w, h, active, walls, roses:new Map(), polyominoes:new Map(), areaNumbers, palisades:new Map(), compasses, watchtowers:new Map() };
  const rules = { precision:null, min: null, max: (planted || rnd()<.5) ? pick([5,6]) : null, solitude: false, mismatch: rnd()<.35 };
  const P = { puzzle, rules, bank: [], hints: null };
  const all = O.oracle(P, 100000); const sigs = all.map(O.sigCells);
  tally[all.length===0?'none':all.length===1?'unique':'multi']++;
  const optSets = [{ testNodes: 15, restart:'first', order:'scan', useWitness:true }, { testNodes: 60, restart:'continue', order:'clues', useWitness:true, focusMode:'near' }, { testNodes: 8, restart:'continue', order:'scan', useWitness:false, focusMode:'none', keepEvents:true }];
  const runs = [['A', L.exact(P,2,400000)], ...optSets.map((o,j)=>['B'+j, L.deduce(P,Object.assign({keepEvents:true},o),2,400000)])];
  for(const [name,r] of runs){
    if(r.exceeded) continue; checked++;
    const want = Math.min(all.length,2); let ok = r.sols.length === want;
    if(ok && all.length===1) ok = L.sig(r.sols[0]) === sigs[0];
    if(ok && want===2) ok = r.sols.every(s => sigs.includes(L.sig(s)));
    if(!ok){ bad++; if(bad<=5) console.log('MISMATCH',name,'seed',seed0*104729+i,'oracle',all.length,'got',r.sols.length,JSON.stringify(rules),JSON.stringify([...compasses]),JSON.stringify([...walls.keys()]),JSON.stringify(active)); }
    if(all.length > 0 && r.events) for(const ev of r.events){
      if(ev.type !== 'deduce') continue; deds++;
      const sp = ev.spot;
      const holds = sg => { // is (c1,r1),(c2,r2) same piece in solution signature sg?
        return sg.split('|').some(p => { const cs = p.split(';'); return cs.includes(`${sp.c1},${sp.r1}`) && cs.includes(`${sp.c2},${sp.r2}`); }); };
      for(const sg of sigs){ if(holds(sg) !== (ev.value === 'same')){ dedBad++; if(dedBad<=5) console.log('UNSOUND deduction',name,ev.value,sp.key,'seed',seed0*104729+i); break; } }
    }
  }
}
console.log(`compass fuzz: ${N} puzzles ${JSON.stringify(tally)} checks ${checked} deductions checked ${deds} mismatches ${bad} unsound ${dedBad}`);
process.exit(bad||dedBad?1:0);
