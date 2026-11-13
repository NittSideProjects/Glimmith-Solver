// regression: user's 5x5 compass puzzle. v19 made 0 deductions (31 s); v20 must wall (3,4)|(4,4) [e:0] and (2,0)|(2,1) [w:1 vs w:0] by inference
const { P } = require('../../user_compass.js'), L = require('../../fuzzlib.js');
const ctx = L.S.buildSolverContext(P.puzzle, P.bank, P.rules, null);
const ded = []; let sols = 0; const t0 = Date.now();
for(const ev of L.S.deduceSolve(5,5,ctx,[],{ nodeBudget:2000000, testMs:100, restart:'continue', order:'clues', useWitness:true })){
  if(ev.type === 'deduce') ded.push(`${ev.spot.key}:${ev.value}:${ev.source}`);
  if(ev.type === 'solution') sols++;
}
const ms = Date.now() - t0;
const need = ['v:3,4:wall:inference', 'h:2,0:wall:inference'];
let bad = 0;
for(const n of need) if(!ded.includes(n)){ console.log('FAIL missing', n); bad++; }
if(sols !== 2){ console.log('FAIL solutions', sols); bad++; }
if(ms > 15000){ console.log('FAIL slow', ms); bad++; }
console.log(bad ? 'FAIL' : 'ok', 'deductions', ded.length, 'solutions', sols, ms + ' ms');
process.exit(bad ? 1 : 0);
