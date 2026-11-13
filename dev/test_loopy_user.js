// regression: user's 4x3 Loopy puzzle (outline counts as a wall), area 1 at (1,1)
const L = require('./fuzzlib.js'), O = require('./oracle.js');
const active = [[0,1,1,1],[1,1,1,1],[1,1,1,0]];
const P = { puzzle:{ w:4,h:3, active, walls:new Map(), roses:new Map(), polyominoes:new Map(), areaNumbers:new Map([['1,1',1]]),
  palisades:new Map(), compasses:new Map(), watchtowers:new Map() }, rules:{ precision:null,min:null,max:null,loopy:true }, bank:[], hints:null };
const truth = O.oracle(P, 100000);
const a = L.exact(P, 5, 2000000), b = L.deduce(P, { testNodes:30, restart:'continue', order:'clues', useWitness:true }, 5, 2000000);
console.log('oracle solutions:', truth.length); truth.forEach(t => console.log('  ', O.sigCells(t)));
console.log('exact:', a.sols.length, a.exceeded ? '(budget)' : '', ' deduce:', b.sols.length);
process.exit(truth.length === a.sols.length && Math.min(truth.length,5) === b.sols.length ? 0 : 1);
