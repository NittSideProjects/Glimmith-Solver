// the ranking used by the page: direct answers first (a rule is never placed below one it beat), then the win rate (w+1)/(w+l+2)
function rank(answers){
  const sc = new Map(), beat = new Map();
  const add = t => { if(!sc.has(t)){ sc.set(t, { w: 0, l: 0, e: 0 }); beat.set(t, new Set()); } };
  for(const a of answers){
    add(a.a); add(a.b);
    if(a.first === 'equal'){ sc.get(a.a).e++; sc.get(a.b).e++; continue; }
    if(a.first !== a.a && a.first !== a.b) continue;
    const lo = a.first === a.a ? a.b : a.a;
    sc.get(a.first).w++; sc.get(lo).l++; beat.get(a.first).add(lo);
  }
  const rate = t => { const s = sc.get(t); return (s.w + 1) / (s.w + s.l + 2); };
  const left = new Set(sc.keys()), out = [];
  while(left.size){
    const inDeg = t => { let n = 0; for(const u of left) if(u !== t && beat.get(u).has(t)) n++; return n; };
    let best = null, bk = null;
    for(const t of left){ const k = [inDeg(t), -rate(t), t]; if(!bk || k[0] < bk[0] || (k[0] === bk[0] && (k[1] < bk[1] || (k[1] === bk[1] && k[2] < bk[2])))){ best = t; bk = k; } }
    out.push({ t: best, ...sc.get(best), rate: rate(best), forced: bk[0] > 0 }); left.delete(best);
  }
  const pos = new Map(out.map((x, i) => [x.t, i])), bad = [];
  for(const [w, ls] of beat) for(const l of ls) if(pos.get(l) < pos.get(w)) bad.push([w, l]);
  return { out, bad };
}
module.exports = rank;
if(require.main === module){
  const fs = require('fs'), dir = 'answers/choices';
  const ans = fs.readdirSync(dir).map(f => JSON.parse(fs.readFileSync(dir + '/' + f)).data || JSON.parse(fs.readFileSync(dir + '/' + f)));
  const { out, bad } = rank(ans);
  out.forEach((x, i) => console.log(String(i + 1).padStart(2), x.t, `${x.w}-${x.l}${x.e ? ' =' + x.e : ''}`, x.rate.toFixed(2), x.forced ? '(loop)' : ''));
  console.log('against the order:', bad.map(b => b.join(' > ')).join('; '));
  console.log('skips', ans.filter(a => a.first === 'skip').length, 'equal', ans.filter(a => a.first === 'equal').length, 'agree with solver', ans.filter(a => a.first === a.solverFirst).length, 'disagree', ans.filter(a => a.first !== a.solverFirst && a.first !== 'skip' && a.first !== 'equal').length);
  for(const a of ans) if(a.note) console.log('NOTE', a.pair, '->', a.first, ':', a.note);
}
