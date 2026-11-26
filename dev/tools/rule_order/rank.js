// the author's ordering: ratio wins / (wins + losses), a tie ("no order") counts as one win and one loss for both;
// equal ratios: above half, more answers first (2-0 before 1-0); below half, fewer answers first (0-1 before 0-2)
function rank(answers){
  const sc = new Map(); const add = t => { if(!sc.has(t)) sc.set(t, { w: 0, l: 0, e: 0 }); };
  for(const a of answers){
    add(a.a); add(a.b);
    if(a.first === 'equal'){ for(const t of [a.a, a.b]){ sc.get(t).w++; sc.get(t).l++; sc.get(t).e++; } continue; }
    if(a.first !== a.a && a.first !== a.b) continue;
    sc.get(a.first).w++; sc.get(a.first === a.a ? a.b : a.a).l++;
  }
  const out = [...sc].map(([t, s]) => ({ t, ...s, n: s.w + s.l, r: s.w + s.l ? s.w / (s.w + s.l) : 0.5 }));
  out.sort((x, y) => y.r - x.r || (x.r > 0.5 ? y.n - x.n : x.r < 0.5 ? x.n - y.n : y.n - x.n) || (x.t < y.t ? -1 : 1));
  return out;
}
module.exports = rank;
if(require.main === module){
  const fs = require('fs'), dir = process.argv[2] || 'answers2/choices';
  const ans = fs.readdirSync(dir).map(f => JSON.parse(fs.readFileSync(dir + '/' + f)));
  rank(ans).forEach((x, i) => console.log(String(i + 1).padStart(2), x.t, `| ${x.w - x.e}-${x.l - x.e}${x.e ? ' =' + x.e : ''} | ${Math.round(100 * x.r)}%`));
  console.log('answers', ans.length, 'skips', ans.filter(a => a.first === 'skip').length, 'equal', ans.filter(a => a.first === 'equal').length, 'agree with solver', ans.filter(a => a.first === a.solverFirst).length, 'disagree', ans.filter(a => a.first !== a.solverFirst && a.first !== 'skip' && a.first !== 'equal').length);
  for(const a of ans) if(a.note) console.log('NOTE', a.pair, '->', a.first, ':', a.note);
}
