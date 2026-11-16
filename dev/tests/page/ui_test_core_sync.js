// The page's SOLVER CORE block and the newest dev/reference/solver-core.vNN.js must be the same code (V1.0.36).
// From V1.0.25 to V1.0.35 a fix lived only in the reference core: every test passed while the page could call a valid puzzle
// impossible. This test fails on ANY difference (comments and texts included), so the reference is always the page's core.
//   node tests/page/ui_test_core_sync.js [page.html]
const fs = require('fs'), path = require('path');
const page = process.argv[2] || '../glimmith_solver_V1.0.40.html';
const html = fs.readFileSync(page, 'utf8');
const a = html.indexOf('  // ================= SOLVER CORE (pure'), b = html.indexOf('  // ================= IMPORT CORE (pure');
const core = html.slice(a, b).split(/(?<=\n)/).map(l => l.startsWith('  ') ? l.slice(2) : l).join('');
const dir = path.join(__dirname, '..', '..', 'reference');
const latest = fs.readdirSync(dir).map(f => /^solver-core\.v(\d+)\.js$/.exec(f)).filter(Boolean).sort((x, y) => +y[1] - +x[1])[0][0];
const ref = fs.readFileSync(path.join(dir, latest), 'utf8');
let pass = 0, fail = 0;
if(a > 0 && b > a) pass++; else { fail++; console.log('FAIL: no SOLVER CORE block in', page); }
if(core === ref) pass++;
else {
  fail++;
  const A = core.split('\n'), B = ref.split('\n'); let i = 0; while(i < A.length && A[i] === B[i]) i++;
  console.log(`FAIL: the page core differs from ${latest} first at line ${i + 1}:\n  page: ${(A[i] || '').slice(0, 160)}\n  ref:  ${(B[i] || '').slice(0, 160)}`);
}
console.log(`core sync (${path.basename(page)} vs ${latest}): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
