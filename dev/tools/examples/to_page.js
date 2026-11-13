// evaluate.js output -> the page's RULE_EXAMPLES data (dev/build/rule_examples_V1.0.x.json).
// node to_page.js <examples.json> <out.json>
'use strict';
const fs = require('fs');
const [, , inPath, outPath] = process.argv;
const ex = JSON.parse(fs.readFileSync(inPath, 'utf8')), out = {};
for(const [k, v] of Object.entries(ex)){
  const p = Object.assign({}, v.rec.puzzle);
  for(const f of ['walls', 'roses', 'polyominoes', 'areaNumbers', 'palisades', 'compasses', 'watchtowers']) if(!p[f] || !p[f].length) delete p[f];
  const r = Object.fromEntries(Object.entries(v.rec.rules || {}).filter(([, x]) => x !== null && x !== false && x !== undefined));
  const e = { p, e: v.events };
  if(Object.keys(r).length) e.r = r;
  if(v.rec.bank && v.rec.bank.length) e.b = v.rec.bank;
  if(v.rec.ban && v.rec.ban.length) e.n = v.rec.ban;
  if(v.unique) e.u = 1;
  out[k] = e;
}
fs.writeFileSync(outPath, JSON.stringify(out));
console.log(Object.keys(out).length, 'examples,', (fs.statSync(outPath).size / 1024).toFixed(0), 'KB');
