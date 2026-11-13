// minimize.js output + lines.json (the one-line explanations) -> the page's RULE_EXAMPLES data (dev/build/rule_examples_V1.0.x.json).
// node to_page.js <minimized.json> <out.json>
'use strict';
const fs = require('fs'), path = require('path');
const [, , inPath, outPath] = process.argv;
const ex = JSON.parse(fs.readFileSync(inPath, 'utf8')), lines = JSON.parse(fs.readFileSync(path.join(__dirname, 'lines.json'), 'utf8')), out = {};
const missing = Object.keys(ex).filter(k => !lines[k]); if(missing.length){ console.error('no line in lines.json for:', missing.join(' ')); process.exit(1); }
for(const k of Object.keys(lines)){                                    // the order of lines.json is the order of "Show all examples"
  if(!ex[k]) continue;
  out[k] = { d: lines[k], x: ex[k].map(v => {
    const p = Object.assign({}, v.rec.puzzle);
    for(const f of ['walls', 'roses', 'polyominoes', 'areaNumbers', 'palisades', 'compasses', 'watchtowers']) if(!p[f] || !p[f].length) delete p[f];
    const r = Object.fromEntries(Object.entries(v.rec.rules || {}).filter(([, x]) => x !== null && x !== false && x !== undefined));
    const e = { p, e: v.events };
    if(Object.keys(r).length) e.r = r;
    if(v.rec.bank && v.rec.bank.length) e.b = v.rec.bank;
    if(v.rec.ban && v.rec.ban.length) e.n = v.rec.ban;
    return e; }) };
}
fs.writeFileSync(outPath, JSON.stringify(out));
console.log(Object.keys(out).length, 'rules,', Object.values(out).reduce((n, v) => n + v.x.length, 0), 'boards,', (fs.statSync(outPath).size / 1024).toFixed(0), 'KB; no example:', Object.keys(lines).filter(k => !ex[k]).join(' '));
