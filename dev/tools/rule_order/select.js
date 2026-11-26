// alt_all.jsonl -> comps.json: one example per pair of step titles that could both fire at the same position
const fs = require('fs'), M = a => new Map(a || []);
const titles = require(process.env.TITLES || './titles.json');
const idx = JSON.parse(fs.readFileSync('/home/user/Glimmith-Solver/dev/game_puzzles_converted/index.json', 'utf8')).puzzles;
const byId = new Map(idx.map(r => [r.id, r]));
const T = t => titles[t] || t;
const best = new Map(), seen = new Map();
for(const line of fs.readFileSync(process.env.IN || 'alt_all.jsonl', 'utf8').split('\n')){
  if(!line.trim()) continue;
  let j; try { j = JSON.parse(line); } catch(e){ continue; }
  const r = byId.get(j.id); if(!r) continue;
  for(const rec of j.rec){
    // each alternative = one rule title with its deductions (an alternative with two tags is split per tag)
    const opts = [];
    rec.alts.forEach((a, k) => {
      for(const tg of a.tags){
        if(tg === 'basic') continue;
        const ch = a.ch.filter(c => c[5] === tg); if(!ch.length) continue;
        const t = T(tg); if(opts.some(o => o.t === t)) continue;
        opts.push({ t, tag: tg, rank: k, ch });
      }
    });
    for(let x = 0; x < opts.length; x++) for(let y = x + 1; y < opts.length; y++){
      const A = opts[x], B = opts[y];
      const key = [A.t, B.t].sort().join(' || ');
      seen.set(key, (seen.get(key) || 0) + 1);
      const score = r.w * r.h + 8 * r.difficulty + 2 * (A.ch.length + B.ch.length) + (A.ch.length > 6 || B.ch.length > 6 ? 40 : 0);
      const cur = best.get(key);
      if(!cur || score < cur.score) best.set(key, { key, score, id: j.id, i: rec.i, st: rec.st, A, B, file: r.file, difficulty: r.difficulty, zone: r.zone });
    }
  }
}
// order: the pairs met most often first (they decide most of the step order); then, for every rule not met yet, its most frequent pair
const LIMIT = +(process.env.LIMIT || 200);
const byCount = [...best.values()].sort((a, b) => seen.get(b.key) - seen.get(a.key) || (a.key < b.key ? -1 : 1));
const chosen = byCount.slice(0, LIMIT), covered = new Set(chosen.flatMap(c => [c.A.t, c.B.t]));
for(const c of byCount.slice(LIMIT)) if(!covered.has(c.A.t) || !covered.has(c.B.t)){ chosen.push(c); covered.add(c.A.t); covered.add(c.B.t); }
console.log('all pairs', byCount.length, 'positions', [...seen.values()].reduce((a, b) => a + b, 0));
const comps = chosen.map((c, n) => {
  const p = JSON.parse(fs.readFileSync('/home/user/Glimmith-Solver/dev/game_puzzles_converted/' + c.file, 'utf8')).puzzles[0].state;
  const flip = (n * 7919) % 2 === 1;                                   // left / right shuffled, so the solver's choice is not always on one side
  const L = flip ? c.B : c.A, R = flip ? c.A : c.B;
  return { pair: c.key, count: seen.get(c.key), id: c.id, zone: c.zone, difficulty: c.difficulty, solverFirst: c.A.t,
    left: { title: L.t, tag: L.tag, ch: L.ch.map(x => x.slice(0, 5)) }, right: { title: R.t, tag: R.tag, ch: R.ch.map(x => x.slice(0, 5)) },
    st: c.st, puzzle: p.puzzle, bank: p.shapeBank || [], rules: p.sizeRules };
});
fs.writeFileSync('comps.json', JSON.stringify(comps));
const tl = new Set(); for(const c of comps){ tl.add(c.left.title); tl.add(c.right.title); }
console.log('pairs', comps.length, 'titles', tl.size, 'bytes', fs.statSync('comps.json').size);
