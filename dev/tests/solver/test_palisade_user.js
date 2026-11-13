// regression: user-reported palisade puzzle (outline counts as a wall) has exactly the solution [[1,2,2],[1,1,1],[1,3,4]]
const L = require('../../fuzzlib.js');
const w=3,h=3, P = { puzzle:{ w,h, active:L.makeGrid(3,3,1), walls:new Map(), roses:new Map(), polyominoes:new Map(), areaNumbers:new Map(),
  palisades:new Map([['1,1','2s'],['1,0','3'],['2,2','4'],['0,1','1']]), compasses:new Map(), watchtowers:new Map() },
  rules:{ precision:null,min:null,max:null }, bank:[], hints:null };
const want = '0,0;0,1;0,2;1,1;2,1|1,0;2,0|1,2|2,2';
let bad = 0;
const a = L.exact(P, 5, 500000), b = L.deduce(P, { testNodes:30, restart:'continue', order:'clues', useWitness:true }, 5, 500000);
for(const [n,r] of [['exact',a],['deduce',b]]){
  const ok = r.sols.length === 1 && L.sig(r.sols[0]) === want;
  console.log(n, ok ? 'ok' : 'FAIL', r.sols.length, r.sols[0] && L.sig(r.sols[0])); if(!ok) bad++;
}
process.exit(bad ? 1 : 0);
