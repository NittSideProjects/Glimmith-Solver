// Prints the decisions the solver makes on a puzzle, in order, grouped as the rule steps the step view shows.
// node show.js <core.js> <fuzzlib.js> <puzzle file: a page export (.glimmith.json) or a record { puzzle, rules, bank, ban }>
'use strict';
const fs = require('fs');
const [, , corePath, libPath, file] = process.argv;
const S = require(corePath), L = require(libPath), X = require('./lib.js');
const load = f => { const j = JSON.parse(fs.readFileSync(f, 'utf8')); if(!j.puzzles) return j; const s = j.puzzles[0].state;
  return { puzzle: s.puzzle, rules: s.sizeRules, bank: (s.shapeBank || []).map(b => ({ id: b.id, cells: b.cells })), ban: (s.banShapes || []).map(b => ({ id: b.id, cells: b.cells })) }; };
const rec = load(file), res = X.run(S, L, rec, 5000);
if(!res){ console.log('no solution (or too slow)'); process.exit(1); }
console.log('mechanics:', X.mechanics(rec).join(' ') || '(none)', '| tiles', X.tiles(rec), '| solutions', res.sols === 1 ? 1 : '2+');
let last = '';
for(const e of res.events){
  if(e.t === 's') continue;
  const head = e.t === 'f' ? 'fact:' + e.r : `${e.r} (${e.via}, pass ${e.p})`;
  if(head !== last){ process.stdout.write('\n' + head + ': '); last = head; }
  process.stdout.write(e.t === 'f' ? `${e.a}~${e.b} ` : `${e.k}=${e.v === 'same' ? 'link' : 'wall'} `);
}
console.log();
module.exports = { load };
