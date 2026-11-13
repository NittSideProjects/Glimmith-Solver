// The author's own choices on top of the generated examples: curated.json names, per rule, the boards to show instead.
//   { rec, step }   a hand-made puzzle (record: puzzle, rules, bank, ban) and the step of the step view to show (1 = first step)
//   { from, hide }  the generated board number `from` (0 = first), kept as it is
//   hide            edges decided by earlier steps that are left out of the picture (they are true, but not what the example is about)
// node curate.js <core.js> <fuzzlib.js> <examples in (to_page.js output)> <examples out>
'use strict';
const fs = require('fs'), path = require('path');
const [, , corePath, libPath, inPath, outPath] = process.argv;
const S = require(corePath), L = require(libPath), X = require('./lib.js');
const ex = JSON.parse(fs.readFileSync(inPath, 'utf8')), cur = JSON.parse(fs.readFileSync(path.join(__dirname, 'curated.json'), 'utf8'));
const lines = JSON.parse(fs.readFileSync(path.join(__dirname, 'lines.json'), 'utf8'));
for(const [key, list] of Object.entries(cur)){
  const old = ex[key] ? ex[key].x : [];
  const cases = list.map(c => {
    let out;
    if(c.rec){
      const rec = { puzzle: Object.assign({}, c.rec.puzzle), rules: c.rec.rules || {}, bank: c.rec.bank || [], ban: c.rec.ban || [] };
      const res = X.run(S, L, rec, 5000); if(!res) throw new Error(key + ': the curated puzzle has no solution');
      if(!res.firstAt.has(key)) throw new Error(key + ': the solver does not use this rule on the curated puzzle');
      out = { p: c.rec.puzzle, e: res.events };
      if(c.rec.rules) out.r = c.rec.rules; if(c.rec.bank) out.b = c.rec.bank; if(c.rec.ban) out.n = c.rec.ban;
      if(c.step) out.s = c.step;
    } else { out = old[c.from]; if(!out) throw new Error(key + ': no generated board ' + c.from); }
    if(c.hide) out.h = c.hide;
    return out;
  });
  ex[key] = { d: lines[key], x: cases };
}
const out = {}; for(const k of Object.keys(lines)) if(ex[k]) out[k] = { d: lines[k], x: ex[k].x };     // the order and the wording of lines.json
fs.writeFileSync(outPath, JSON.stringify(out));
console.log(Object.keys(cur).length, 'rules curated;', Object.keys(out).length, 'rules,', Object.values(out).reduce((n, v) => n + v.x.length, 0), 'boards');
