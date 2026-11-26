// block order from the author's ranking: each block's place = mean rank of the rule tags it decides, weighted by how often it decides them
const fs = require('fs');
const A = '/tmp/claude-0/-home-user-Glimmith-Solver/b1f91e17-c16f-571b-b8db-d4e3efd27a78/scratchpad/alt/';
const titles = require(A + 'titles.json'), rank = require(A + 'rank2.js');
const ans = fs.readdirSync(A + 'answers2/choices').map(f => JSON.parse(fs.readFileSync(A + 'answers2/choices/' + f)));
const ranked = rank(ans), pos = new Map(ranked.map((x, i) => [x.t, i + 1]));
const stats = {};
for(const line of fs.readFileSync(process.argv[2], 'utf8').split('\n')){ if(!line.trim()) continue; const j = JSON.parse(line);
  for(const [b, o] of Object.entries(j.stats)) for(const [t, n] of Object.entries(o)){ stats[b] = stats[b] || {}; stats[b][t] = (stats[b][t] || 0) + n; } }
const names = JSON.parse(process.argv[3]);                    // the blocks in the old order
const prio = new Map(), info = {};
for(const b of names){
  const o = stats[b] || {}; let s = 0, n = 0; const seen = [];
  for(const [t, c] of Object.entries(o)){ const r = pos.get(titles[t] || t); seen.push(`${t}:${c}${r ? '@' + r : ''}`); if(!r) continue; s += r * c; n += c; }
  if(n) prio.set(b, s / n);
  info[b] = { prio: n ? +(s / n).toFixed(1) : null, tags: seen.sort((x, y) => +y.split(':')[1].split('@')[0] - +x.split(':')[1].split('@')[0]).join(' ') };
}
// by hand: the known-different walls / links inside a group ('Follows from what is known', mostly) stay first; the blocks that only
// record two groups as different pieces (their walls come from that block on the next pass) take the rank of the rule those walls show
const HAND = { diffwall: [0, 'first: follows from what is known'], diffclash: [7, 'Difference: two numbers, two pieces'], rosecover: [17, 'Roses: who goes with whom'],
  areapair: [21, 'Area numbers in a closed-in area'], relbounds: [20.6, 'decides nothing: the sizes the walls that compare sizes leave each group, read by area numbers / area sum / growth in the same pass'], gdclash: [70, 'Gemini and Delta: never the same two pieces'] };
for(const [b, [p, why]] of Object.entries(HAND)){ prio.set(b, p); info[b].prio = `${p} (by hand: ${why})`; }
// blocks with no ranked decision keep their old place: the priority of the ranked block just before them (ties keep the old order)
let last = 0;
for(const b of names){ if(prio.has(b)){ if(!HAND[b]) last = prio.get(b); } else { prio.set(b, last); info[b].prio = `(${last.toFixed(1)}: kept after the block before it)`; } }
const order = names.map((b, i) => ({ b, i, p: prio.get(b) })).sort((x, y) => x.p - y.p || x.i - y.i).map(x => x.b);
fs.writeFileSync(process.argv[4], JSON.stringify({ about: 'v134 block order: mean author rank (order_2026-11-26.md) of the rule tags each block decided on the 1225 campaign puzzles (deduction phase, outside the probes), weighted by count', order, blocks: info }, null, 1));
for(const b of order) console.log(b.padEnd(13), String(info[b].prio).padEnd(40), info[b].tags.slice(0, 150));
