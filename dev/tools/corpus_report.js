#!/usr/bin/env node
// Turns the .jsonl of tools/run_corpus.js into a flat .csv (one row per puzzle, open it in Excel / pandas) and a readable .summary.md.
//   node tools/corpus_report.js results/corpus_run_v39.jsonl [more.jsonl ...] [--out results/merged]
// Several files are merged by puzzle id (the LATEST record of an id wins, so a re-run of the TIMEOUTs replaces them).
'use strict';
const fs = require('fs'), path = require('path');

function load(files){
  const metas = [], byId = new Map();
  for(const f of files) for(const line of fs.readFileSync(f, 'utf8').split('\n')){
    if(!line.trim()) continue;
    let o; try { o = JSON.parse(line); } catch(_){ continue; }
    if(o._meta){ metas.push(o._meta); continue; }
    if(o.id) byId.set(o.id, o);
  }
  return { metas, recs: [...byId.values()] };
}
const sum = a => a.reduce((x, y) => x + y, 0);
const pctile = (a, q) => { if(!a.length) return null; const s = a.slice().sort((x, y) => x - y), i = (s.length - 1) * q, lo = Math.floor(i), hi = Math.ceil(i); return s[lo] + (s[hi] - s[lo]) * (i - lo); };
const median = a => pctile(a, 0.5);
const f0 = x => x == null ? '-' : Math.round(x).toString();
const f1 = x => x == null ? '-' : (Math.round(x * 10) / 10).toString();
const secs = ms => ms == null ? '-' : (ms / 1000).toFixed(ms < 10000 ? 2 : 1);
const share = (n, tot) => tot ? 100 * n / tot : null;
function E(r){ return r.edges || { spots: null, instant: {}, probe: {}, scan: {}, left: null }; }
function shares(r){
  const e = E(r), sp = e.spots; if(!sp) return null;
  const n = k => (e[k] && e[k].n) || 0;
  let left = e.left; if(left == null) left = Math.max(0, sp - n('instant') - n('probe') - n('scan'));
  return { instant: 100 * n('instant') / sp, probe: 100 * n('probe') / sp, scan: 100 * n('scan') / sp, direct: 100 * ((e.scan && e.scan.direct) || 0) / sp, left: 100 * left / sp };
}
const mean = a => a.length ? sum(a) / a.length : null;
const mdTable = (head, rows) => ['| ' + head.join(' | ') + ' |', '|' + head.map(() => '---').join('|') + '|', ...rows.map(r => '| ' + r.join(' | ') + ' |')].join('\n');

const CSV_COLS = ['id', 'zone', 'category', 'difficulty', 'w', 'h', 'activeTiles', 'features', 'rules', 'verdict', 'endedIn', 'timedOutIn', 'killed',
  'totalMs', 'ctxMs', 'instantMs', 'probeMs', 'scanMs', 'finalMs', 'firstSolutionMs', 'overLimit', 'lastTest',
  'spots', 'fixedWalls', 'instant', 'probe', 'scan', 'scanDirect', 'left', 'instantPct', 'probePct', 'scanPct', 'leftPct',
  'instantWalls', 'instantLinks', 'tests', 'testContradictions', 'testTimeouts', 'testSolutions', 'probes', 'probeDeductions', 'finalNodes', 'finalFraction',
  'solutions', 'wrongEdges', 'reason', 'error'];
function csvRow(r){
  const e = E(r), s = shares(r) || {};
  const v = { id: r.id, zone: r.zone, category: r.category, difficulty: r.difficulty, w: r.w, h: r.h, activeTiles: r.activeTiles, features: (r.features || []).join('+'), rules: (r.rules || []).join('+'),
    verdict: r.verdict, endedIn: r.endedIn, timedOutIn: r.timedOutIn, killed: r.killed ? 1 : 0, totalMs: r.totalMs, ctxMs: r.ctxMs, instantMs: r.instantMs, probeMs: r.probeMs, scanMs: r.scanMs, finalMs: r.finalMs,
    firstSolutionMs: r.firstSolutionMs, overLimit: r.overLimit ? 1 : 0, lastTest: r.lastTest, spots: e.spots, fixedWalls: e.fixed, instant: (e.instant || {}).n, probe: (e.probe || {}).n, scan: (e.scan || {}).n, scanDirect: (e.scan || {}).direct, left: e.left,
    instantPct: s.instant == null ? '' : f1(s.instant), probePct: s.probe == null ? '' : f1(s.probe), scanPct: s.scan == null ? '' : f1(s.scan), leftPct: s.left == null ? '' : f1(s.left),
    instantWalls: (e.instant || {}).walls, instantLinks: (e.instant || {}).links, tests: (r.scan || {}).tests, testContradictions: (r.scan || {}).contradictions, testTimeouts: (r.scan || {}).timeouts,
    testSolutions: (r.scan || {}).solutionsSeen, probes: r.probes, probeDeductions: r.probeDeductions, finalNodes: (r.final || {}).nodes, finalFraction: (r.final || {}).fraction,
    solutions: r.solutions, wrongEdges: r.wrongEdges, reason: r.reason, error: r.error };
  return CSV_COLS.map(k => { let x = v[k]; if(x == null) return ''; x = String(x); return /[",\n]/.test(x) ? '"' + x.replace(/"/g, '""') + '"' : x; }).join(',');
}

function groupStats(rs){
  const ms = rs.map(r => r.totalMs).filter(x => x != null), sh = rs.map(shares).filter(Boolean);
  return { n: rs.length, ms, med: median(ms), p90: pctile(ms, 0.9), max: ms.length ? Math.max(...ms) : null, total: sum(ms),
    instant: mean(sh.map(s => s.instant)), probe: mean(sh.map(s => s.probe)), scan: mean(sh.map(s => s.scan)), direct: mean(sh.map(s => s.direct)), left: mean(sh.map(s => s.left)),
    tiles: mean(rs.map(r => r.activeTiles).filter(x => x != null)), bad: rs.filter(r => r.verdict !== 'UNIQUE').length };
}
function groupTable(rs, keyFn, keyName, sortFn){
  const g = new Map(); for(const r of rs){ const k = keyFn(r); if(!g.has(k)) g.set(k, []); g.get(k).push(r); }
  const keys = [...g.keys()].sort(sortFn || ((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true })));
  const rows = keys.map(k => { const s = groupStats(g.get(k));
    return [k, s.n, f0(s.tiles), f0(s.med), f0(s.p90), f0(s.max), (s.total / 1000).toFixed(1), f0(s.instant) + '%', f0(s.probe) + '%', f0(s.scan) + '%', f0(s.direct) + '%', f0(s.left) + '%', s.bad || '']; });
  return mdTable([keyName, 'puzzles', 'avg tiles', 'median ms', 'p90 ms', 'max ms', 'total s', 'instant', 'probe', 'scan', 'of which proved by the search itself', 'left', 'not UNIQUE'], rows);
}

function buildSummary(recs, metas){
  const L = [];
  const m = metas[metas.length - 1] || {};
  L.push('# Glimmith corpus run');
  L.push('');
  L.push(`* puzzles in this report: **${recs.length}**   (runs merged: ${metas.length}; the latest record of each puzzle counts)`);
  if(m.solverCore) L.push(`* solver core: \`${m.solverCore}\` (sha1 ${m.coreSha1}), node ${m.node}, ${m.platform}, ${m.cores} cores (${m.cpu}), jobs ${m.jobs}${m.jobs > 1 ? '  (more than 1 job = timings are noisier)' : ''}`);
  if(m.limitS) L.push(`* hard limit per puzzle: ${m.limitS} s (worker killed ${m.graceS} s after that); solver settings = the page's defaults: ${JSON.stringify(m.solverOpts)}`);
  const totalMs = sum(recs.map(r => r.totalMs || 0));
  L.push(`* summed solver time: ${(totalMs / 60000).toFixed(1)} min`);
  L.push('');
  L.push('How to read the edge columns: every edge that is not a hand-drawn wall is decided by exactly one of **instant** (first propagation, nothing assumed), **probe** (look-ahead: assume it, propagate, contradiction; still no search), **scan** ("wall per wall": a narrow exact search per edge, plus the edges that then follow by propagation; the column "proved by the search itself" counts only the edges the search settled directly) or is **left** for the final exact solver. The four shares are means over the puzzles of the row (percent of that puzzle\'s edges).');
  L.push('');

  // ---- verdicts
  const tally = {}; for(const r of recs) tally[r.verdict] = (tally[r.verdict] || 0) + 1;
  L.push('## Verdicts');
  L.push('');
  L.push(mdTable(['verdict', 'puzzles', 'meaning'], Object.keys(tally).sort().map(k => [k, tally[k], {
    'UNIQUE': 'the solver proved the stored solution is the only tiling', 'TIMEOUT': 'did not finish inside the limit', 'IMPOSSIBLE': '**BUG**: solver says no tiling, but the game stored one',
    'UNIQUE-BUT-DIFFERENT': '**BUG or bad stored solution**: exactly one tiling found, not the stored one', 'NOT-UNIQUE': 'two different tilings found (the game puzzles should be unique: a rule is too weak or the converter is off)',
    'ERROR': 'crash / out of memory', 'NO-SOLUTION': 'no stored solution and none found', 'UNIQUE-NO-STORED': 'one tiling, no stored solution to compare'
  }[k] || ''])));
  L.push('');
  const listOf = (title, rs, extra) => { if(!rs.length) return; L.push(`### ${title} (${rs.length})`); L.push(''); L.push(mdTable(['id', 'category', 'diff', 'size', 'tiles', 's', 'detail'], rs.slice(0, 60).map(r => [r.id, r.category, r.difficulty, `${r.w}x${r.h}`, r.activeTiles, secs(r.totalMs), extra(r)]))); if(rs.length > 60) L.push(`\n(first 60 of ${rs.length}; the rest is in the .csv)`); L.push(''); };
  const byVerdict = v => recs.filter(r => r.verdict === v).sort((a, b) => a.id.localeCompare(b.id));
  listOf('IMPOSSIBLE (bug)', byVerdict('IMPOSSIBLE'), r => r.reason || '');
  listOf('UNIQUE-BUT-DIFFERENT (bug)', byVerdict('UNIQUE-BUT-DIFFERENT'), () => '');
  listOf('Wrong edges (a deduction disagrees with the stored solution = solver bug)', recs.filter(r => r.wrongEdges > 0), r => `${r.wrongEdges}: ${(r.wrongExamples || []).join(', ')}`);
  listOf('NOT-UNIQUE', byVerdict('NOT-UNIQUE'), r => `ended in ${r.endedIn}; stored solution among the two: ${r.authorAmongTwo}`);
  listOf('ERROR', byVerdict('ERROR'), r => (r.error || '').split('\n')[0].slice(0, 120));
  listOf('Finished, but only after the time limit', recs.filter(r => r.overLimit), r => `${r.verdict}; final search ${secs(r.finalMs)} s`);
  listOf('TIMEOUT', byVerdict('TIMEOUT'), r => `in ${r.timedOutIn}${r.killed ? ' (killed)' : ''}${r.lastTest ? '; last narrow test: ' + r.lastTest : ''}; edges ${E(r).instant ? f0((shares(r) || {}).instant) : '?'}% instant / ${f0((shares(r) || {}).probe)}% probe / ${f0((shares(r) || {}).scan)}% scan / ${f0((shares(r) || {}).left)}% left${(r.final || {}).fraction != null ? '; final search ~' + f1(100 * r.final.fraction) + '% done' : ''}`);

  const done = recs.filter(r => r.totalMs != null);
  // ---- by zone x difficulty
  L.push('## Time and edge split by zone and difficulty');
  L.push('');
  L.push(groupTable(done, r => `${r.zone} d${r.difficulty}`, 'zone / difficulty', (a, b) => a.localeCompare(b)));
  L.push('');
  L.push('## By zone');
  L.push('');
  L.push(groupTable(done, r => r.zone, 'zone'));
  L.push('');
  L.push('## By difficulty (all zones)');
  L.push('');
  L.push(groupTable(done, r => 'd' + r.difficulty, 'difficulty'));
  L.push('');
  L.push('## By mechanic (the game\'s category)');
  L.push('');
  L.push(groupTable(done, r => `${r.zone} ${r.category}`, 'category', (a, b) => a.localeCompare(b, undefined, { numeric: true })));
  L.push('');
  // ---- by feature tag
  const featRows = new Map();
  for(const r of done) for(const f of (r.features || [])){ if(!featRows.has(f)) featRows.set(f, []); featRows.get(f).push(r); }
  if(featRows.size){ L.push('## By feature tag (a puzzle counts once per tag it has)'); L.push(''); L.push(groupTable([].concat(...[...featRows.entries()].map(([f, rs]) => rs.map(r => Object.assign({}, r, { _f: f })))), r => r._f, 'feature')); L.push(''); }

  // ---- slowest
  const slow = done.slice().sort((a, b) => b.totalMs - a.totalMs).slice(0, 30);
  L.push('## The 30 slowest puzzles');
  L.push('');
  L.push(mdTable(['id', 'category', 'diff', 'size', 'tiles', 'total s', 'ctx / instant / probe / scan / final (s)', 'instant', 'probe', 'scan', 'left', 'tests', 'verdict'],
    slow.map(r => { const s = shares(r) || {}; return [r.id, r.category, r.difficulty, `${r.w}x${r.h}`, r.activeTiles, secs(r.totalMs), [r.ctxMs, r.instantMs, r.probeMs, r.scanMs, r.finalMs].map(secs).join(' / '),
      f0(s.instant) + '%', f0(s.probe) + '%', f0(s.scan) + '%', f0(s.left) + '%', (r.scan || {}).tests, r.verdict]; })));
  L.push('');
  // ---- outliers vs peers
  const peer = new Map(); const peerKey = r => `${r.zone}|${r.category}|${r.difficulty}`;
  for(const r of done){ const k = peerKey(r); if(!peer.has(k)) peer.set(k, []); peer.get(k).push(r.totalMs / Math.max(1, r.activeTiles)); }
  const catPeer = new Map(); for(const r of done){ const k = `${r.zone}|${r.category}`; if(!catPeer.has(k)) catPeer.set(k, []); catPeer.get(k).push(r.totalMs / Math.max(1, r.activeTiles)); }
  const out = done.filter(r => r.totalMs >= 300).map(r => { let pe = peer.get(peerKey(r)); if(pe.length < 5) pe = catPeer.get(`${r.zone}|${r.category}`); const med = median(pe) || 1e-9; return { r, ratio: (r.totalMs / Math.max(1, r.activeTiles)) / med, med }; })
    .filter(x => x.ratio >= 4).sort((a, b) => b.ratio - a.ratio).slice(0, 30);
  L.push('## Outliers: much slower per tile than their peers (same category and difficulty; at least 0.3 s, at least 4x the peer median)');
  L.push('');
  if(out.length) L.push(mdTable(['id', 'category', 'diff', 'tiles', 'total s', 'ms per tile', 'peer median ms per tile', 'x peers', 'left'], out.map(x => [x.r.id, x.r.category, x.r.difficulty, x.r.activeTiles, secs(x.r.totalMs), f1(x.r.totalMs / x.r.activeTiles), f1(x.med), f1(x.ratio), f0((shares(x.r) || {}).left) + '%'])));
  else L.push('none');
  L.push('');
  // ---- most left to the final solver
  const left = done.filter(r => shares(r)).sort((a, b) => shares(b).left - shares(a).left).slice(0, 20);
  L.push('## The 20 puzzles with the largest share of edges left to the final solver');
  L.push('');
  L.push(mdTable(['id', 'category', 'diff', 'tiles', 'spots', 'left', 'left %', 'total s', 'final s', 'verdict'], left.map(r => [r.id, r.category, r.difficulty, r.activeTiles, E(r).spots, E(r).left, f0(shares(r).left) + '%', secs(r.totalMs), secs(r.finalMs), r.verdict])));
  L.push('');
  // ---- puzzles solved with no search at all
  const instOnly = done.filter(r => shares(r) && E(r).left === 0 && (r.scan || {}).tests === 0);
  L.push(`## Decided without any search: ${instOnly.length} of ${done.length} puzzles (every edge by instant propagation or look-ahead; scan tests = 0, left = 0)`);
  L.push('');
  // ---- rules
  const ruleTot = { instant: {}, probe: {}, scan: {} };
  for(const r of done) for(const b of ['instant', 'probe', 'scan']) for(const [k, n] of Object.entries((r.ruleCounts || {})[b] || {})) ruleTot[b][k] = (ruleTot[b][k] || 0) + n;
  const allRules = new Set([].concat(...['instant', 'probe', 'scan'].map(b => Object.keys(ruleTot[b]))));
  const rrows = [...allRules].map(k => [k, ruleTot.instant[k] || 0, ruleTot.probe[k] || 0, ruleTot.scan[k] || 0]).sort((a, b) => (b[1] + b[2] + b[3]) - (a[1] + a[2] + a[3])).slice(0, 40);
  L.push('## Which rules decided the edges (all puzzles, edges per phase; `search` = proved by a narrow search)');
  L.push('');
  L.push(mdTable(['rule', 'instant', 'probe', 'scan'], rrows.map(r => r.map(String))));
  L.push('');
  L.push('Files: the .jsonl has everything per puzzle (per-rule counts per phase, scan test counts, final-search progress, wrong-edge examples); the .csv is the flat version of the main numbers.');
  return L.join('\n') + '\n';
}

function writeReports(files, outBase){
  const { metas, recs } = load(files);
  recs.sort((a, b) => a.zone.localeCompare(b.zone) || a.difficulty - b.difficulty || a.id.localeCompare(b.id));
  fs.writeFileSync(outBase + '.csv', CSV_COLS.join(',') + '\n' + recs.map(csvRow).join('\n') + '\n');
  fs.writeFileSync(outBase + '.summary.md', buildSummary(recs, metas));
  console.log(`wrote ${path.relative(process.cwd(), outBase)}.csv and ${path.relative(process.cwd(), outBase)}.summary.md (${recs.length} puzzles)`);
}
module.exports = { writeReports, load, buildSummary };
if(require.main === module){
  const a = process.argv.slice(2), files = []; let out = null;
  for(let i = 0; i < a.length; i++){ if(a[i] === '--out') out = a[++i]; else files.push(a[i]); }
  if(!files.length){ console.log('usage: node tools/corpus_report.js file.jsonl [more.jsonl ...] [--out basepath]'); process.exit(1); }
  writeReports(files.map(f => path.resolve(f)), path.resolve(out || files[0].replace(/\.jsonl$/, '')));
}
