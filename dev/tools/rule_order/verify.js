const fs = require('fs');
const idx = JSON.parse(fs.readFileSync('/home/user/Glimmith-Solver/dev/game_puzzles_converted/index.json', 'utf8')).puzzles, byId = new Map(idx.map(r => [r.id, r]));
const key = (c1, r1, c2, r2) => r1 === r2 ? `v:${Math.min(c1, c2)},${r1}` : `h:${c1},${Math.min(r1, r2)}`;
let bad = 0, badFirst = 0, badAlt = 0, badSt = 0, n = 0; const byTag = {}, ex = [];
for(const line of fs.readFileSync(process.argv[2] || 'alt_full.jsonl', 'utf8').split('\n')){
  if(!line.trim()) continue; const j = JSON.parse(line); const r = byId.get(j.id);
  const pz = JSON.parse(fs.readFileSync('/home/user/Glimmith-Solver/dev/game_puzzles_converted/' + r.file, 'utf8')).puzzles[0];
  const sw = new Set(pz.solutionWalls);
  const ok = (c1, r1, c2, r2, wallish) => sw.has(key(c1, r1, c2, r2)) === wallish;
  for(const rec of j.rec){
    for(const [c1, r1, c2, r2, s] of rec.st) if(!ok(c1, r1, c2, r2, s === 1)){ badSt++; }
    rec.alts.forEach((a, k) => { for(const [c1, r1, c2, r2, v, t] of a.ch){ n++; if(!ok(c1, r1, c2, r2, v === 'wall')){ bad++; if(k === 0) badFirst++; else badAlt++; byTag[t] = (byTag[t] || 0) + 1; if(ex.length < 8) ex.push(`${j.id} rec ${rec.i} alt ${k} ${t} ${key(c1, r1, c2, r2)} ${v}`); } } });
  }
}
console.log({ n, bad, badFirst, badAlt, badSt, byTag }); console.log(ex.join('\n'));
