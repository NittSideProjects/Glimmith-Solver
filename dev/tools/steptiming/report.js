const files = process.argv.slice(2), rows = [].concat(...files.map(f => require(f)));
const order = []; const agg = {};
for(const r of rows) for(const part of [r.top, r.probe]) for(const k of Object.keys(part.t)){
  if(!agg[k]){ agg[k] = { t: 0, n: 0, per: [], puzzles: 0 }; order.push(k); }
}
for(const r of rows){
  const seen = {};
  for(const k of Object.keys(agg)){
    const t = (r.top.t[k] || 0) + (r.probe.t[k] || 0), n = (r.top.n[k] || 0) + (r.probe.n[k] || 0);
    if(!n) continue; agg[k].t += t; agg[k].n += n; agg[k].per.push(1000 * t / n); agg[k].puzzles++;
  }
}
const q = (a, p) => { const s = a.slice().sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; };
const tot = Object.values(agg).reduce((s, a) => s + a.t, 0);
console.log('puzzles', rows.length, 'total propagation ms', tot.toFixed(0));
console.log(['step', 'puzzles', 'runs', 'mean us/run', 'median us', 'p90 us', 'share %'].join('\t'));
// order as in the code (first appearance order is code order because marks fire in sequence)
for(const k of order){ const a = agg[k]; console.log([k, a.puzzles, a.n, (1000 * a.t / a.n).toFixed(1), q(a.per, 0.5).toFixed(1), q(a.per, 0.9).toFixed(1), (100 * a.t / tot).toFixed(1)].join('\t')); }
