// V1.0.7: Fast import when Chrome / Edge block the game folders ("can't open this folder because it contains system files"):
// the picker fails, the help shows, "Read once" falls back to <input webkitdirectory> and imports the folder.
// node ui_test_fastblocked_V1.0.7.js ../glimmith_solver_V1.0.10.html   (needs fixtures/folders.zip and the unzip command)
const { JSDOM } = require('jsdom'); const fs = require('fs'), path = require('path'), cp = require('child_process'), os = require('os');
const file = process.argv[2] || '../glimmith_solver_V1.0.10.html';
const sleep = ms => new Promise(r => setTimeout(r, ms));
let pass = 0, fail = 0;
const check = (n, c, x) => { if(c) pass++; else { fail++; console.log('FAIL:', n, x !== undefined ? '-> ' + JSON.stringify(x) : ''); } };
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fastimp-'));
cp.execFileSync('unzip', ['-q', '-o', path.join(__dirname, 'fixtures', 'folders.zip'), '-d', tmp]);
const rd = p => fs.readFileSync(path.join(tmp, p));
async function page(){
  const dom = new JSDOM(fs.readFileSync(file, 'utf8'), { runScripts: 'dangerously', pretendToBeVisual: true,
    beforeParse(win){ win.TextDecoder = TextDecoder; win.TextEncoder = TextEncoder; win.HTMLCanvasElement.prototype.getContext = () => null; } });
  const { window } = dom; const store = new Map();
  window.storage = { get: async k => store.has(k) ? { key:k, value: store.get(k) } : null, set: async (k, v) => { store.set(k, v); return { key:k, value:v }; },
    delete: async k => { store.delete(k); return { key:k, deleted:true }; }, list: async () => ({ keys: [...store.keys()] }) };
  const errors = []; window.addEventListener('error', e => errors.push(String(e.message)));
  await sleep(300);
  return { window, doc: window.document, $: id => window.document.getElementById(id), errors };
}
const names = P => [...P.$('puzzleSelect').options].map(o => o.textContent);
const settle = async P => { for(let i = 0; i < 200; i++){ await sleep(50); if(P.$('importBtn').textContent === 'Import puzzles…' && !P.$('importBtn').disabled) break; } await sleep(80); };
(async () => {
  const P = await page();
  // Chrome / Edge with the folder blocked: the picker only ever ends as a cancelled dialog
  let picks = 0; P.window.showDirectoryPicker = async () => { picks++; throw new P.window.DOMException('The user aborted a request.', 'AbortError'); };
  check('help hidden at first', P.$('fastBlocked').hidden);
  P.$('fastImportBtn').click(); await sleep(150);
  check('Fast import opens the folder box', !P.$('fastImportBox').hidden);
  check('the "Folder blocked?" link is there', !!P.$('fastBlockedLink') && /Folder blocked/.test(P.$('fastBlockedLink').textContent));
  P.$('fastPick_steam').click(); await sleep(100);
  check('the picker was tried', picks === 1, picks);
  check('no folder: the help shows', !P.$('fastBlocked').hidden);
  check('the help names the browser message and the folders', /contains system files/.test(P.$('fastBlocked').textContent) && /Program Files or AppData/.test(P.$('fastBlocked').textContent));
  check('the help gives the copy and zip ways', /copy the folder/.test(P.$('fastBlocked').textContent) && /zip it/.test(P.$('fastBlocked').textContent));
  check('nothing remembered', P.$('fastStatus_steam').textContent === '' && P.$('fastRunBtn').hidden);
  // Read once: the classic folder input
  const inp = P.$('fastDirInput'); let opened = 0; inp.click = () => { opened++; };
  P.$('fastOnce_own').click(); await sleep(20);
  check('"Read your own puzzles once" opens the classic folder picker', opened === 1, opened);
  const mk = n => { const f = new P.window.File([rd(n)], n.split('/').pop()); Object.defineProperty(f, 'webkitRelativePath', { value: 'workshop/' + n }); return f; };
  const before = names(P).length;
  Object.defineProperty(inp, 'files', { value: [mk('x1/puzzle'), mk('x1/metadata'), mk('x2/puzzle'), mk('x2/metadata'), mk('x2/preview.png'), mk('readme.txt')], configurable: true });
  inp.dispatchEvent(new P.window.Event('change')); await settle(P);
  check('the folder read once: 2 puzzles imported', names(P).length === before + 2 && /2 puzzles imported/.test(P.$('importLogSummary').textContent), [names(P).length - before, P.$('importLogSummary').textContent]);
  P.$('fastOnce_steam').click(); await sleep(20);
  check('"Read the workshop folder once" opens it too', opened === 2, opened);
  // the link opens and closes the help by itself
  P.$('fastBlockedLink').click(); check('the link closes the help', P.$('fastBlocked').hidden);
  P.$('fastBlockedLink').click(); check('and opens it', !P.$('fastBlocked').hidden);
  check('no script errors', P.errors.length === 0, P.errors);
  console.log(`fast blocked V1.0.7 UI: ${pass} passed, ${fail} failed`);
  fs.rmSync(tmp, { recursive: true, force: true });
  process.exit(fail ? 1 : 0);
})();
