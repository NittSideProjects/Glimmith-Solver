// Fast import: the game's puzzle folders read as they are. (1) a browser without folder handles: <input webkitdirectory>;
// (2) Chrome / Edge: showDirectoryPicker handles (mocked here), remembered for one-click imports.
// node ui_test_fastimport.js ../glimmith_solver_V1.0.19.html   (needs fixtures/folders.zip and the unzip command)
const { JSDOM } = require('jsdom'); const fs = require('fs'), path = require('path'), cp = require('child_process'), os = require('os');
const file = process.argv[2] || '../glimmith_solver_V1.0.19.html';
const sleep = ms => new Promise(r => setTimeout(r, ms));
let pass = 0, fail = 0;
const check = (n, c, x) => { if(c) pass++; else { fail++; console.log('FAIL:', n, x !== undefined ? '-> ' + JSON.stringify(x) : ''); } };
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fastimp-'));
cp.execFileSync('unzip', ['-q', '-o', path.join(__dirname, '..', '..', 'fixtures', 'folders.zip'), '-d', tmp]);
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
  // ---- 1. no folder handles ----
  let P = await page();
  check('Fast import button next to Import puzzles', !!P.$('fastImportBtn') && !!P.$('importBtn') && P.$('fastImportBtn').previousElementSibling === P.$('importBtn'));
  const before = names(P).length;
  P.$('fastImportBtn').click(); await sleep(50);
  check('first click opens the folder box with both locations', !P.$('fastImportBox').hidden && /4160210/.test(P.$('fastImportBox').textContent) && /Geri\\Saved/.test(P.$('fastImportBox').textContent));
  check('says this browser can not remember', /can't remember/.test(P.$('fastImportIntro').textContent) && P.$('fastRunBtn').hidden);
  const mk = rel => { const f = new P.window.File([rd(rel)], path.basename(rel)); Object.defineProperty(f, 'webkitRelativePath', { value: '4160210/' + rel }); return f; };
  const inp = P.$('fastDirInput'); Object.defineProperty(inp, 'files', { value: [mk('x1/puzzle'), mk('x1/metadata'), mk('x2/puzzle'), mk('x2/metadata'), mk('x2/preview.png'), mk('readme.txt')], configurable: true });
  inp.dispatchEvent(new P.window.Event('change')); await settle(P);
  check('folder picked: 2 puzzles imported', names(P).length === before + 2 && /2 puzzles imported/.test(P.$('importLogSummary').textContent), [names(P), P.$('importLogSummary').textContent]);
  inp.dispatchEvent(new P.window.Event('change')); await settle(P);
  check('same folder again: nothing new, 2 already in the list', names(P).length === before + 2 && /0 puzzles imported, 2 already in the list/.test(P.$('importLogSummary').textContent), P.$('importLogSummary').textContent);
  check('no script errors (1)', P.errors.length === 0, P.errors);
  // ---- 2. folder handles (mock) ----
  P = await page();
  const fileH = rel => ({ kind: 'file', name: path.basename(rel), getFile: async () => new P.window.File([rd(rel)], path.basename(rel)) });
  const dirH = (name, kids) => ({ kind: 'directory', name, entries: async function*(){ for(const k of kids) yield [k.name, k]; }, queryPermission: async () => 'granted', requestPermission: async () => 'granted' });
  const steam = dirH('4160210', [dirH('x1', [fileH('x1/puzzle'), fileH('x1/metadata')]), dirH('x2', [fileH('x2/puzzle'), fileH('x2/metadata'), fileH('x2/preview.png')])]);
  const own = dirH('workshop', [dirH('mine', [fileH('x1/puzzle')])]);                // the same puzzle again: a duplicate
  let nextPick = steam, picks = 0; P.window.showDirectoryPicker = async () => { picks++; return nextPick; };
  const b2 = names(P).length;
  P.$('fastImportBtn').click(); await sleep(80);
  check('with folder handles: box opens, can remember', !P.$('fastImportBox').hidden && /one click/.test(P.$('fastImportIntro').textContent));
  P.$('fastPick_steam').click(); await sleep(80);
  check('Steam folder chosen and shown', /4160210/.test(P.$('fastStatus_steam').textContent) && !P.$('fastRunBtn').hidden, P.$('fastStatus_steam').textContent);
  nextPick = own; P.$('fastPick_own').click(); await sleep(80);
  check('own folder chosen and shown', /workshop/.test(P.$('fastStatus_own').textContent));
  P.$('fastRunBtn').click(); await settle(P);
  check('Import now: both folders read, 2 puzzles, the duplicate skipped', names(P).length === b2 + 2 && /2 puzzles imported/.test(P.$('importLogSummary').textContent), [names(P), P.$('importLogSummary').textContent]);
  P.$('fastCloseBtn').click(); await sleep(20);
  const pk = picks; P.$('fastImportBtn').click(); await settle(P);
  check('later: one click, no folder dialog, nothing new', picks === pk && P.$('fastImportBox').hidden && /0 puzzles imported, 2 already in the list/.test(P.$('importLogSummary').textContent), [picks, pk, P.$('importLogSummary').textContent]);
  P.$('fastFoldersBtn').click(); await sleep(30);
  check('Folders… opens the folder box again', !P.$('fastImportBox').hidden);
  P.$('fastForgetBtn').click(); await sleep(80);
  check('Forget folders clears both', P.$('fastStatus_steam').textContent === '' && P.$('fastStatus_own').textContent === '' && P.$('fastRunBtn').hidden);
  check('Import puzzles… still there and unchanged', P.$('importBtn').textContent === 'Import puzzles…' && !!P.$('importFile'));
  check('no script errors (2)', P.errors.length === 0, P.errors);
  console.log(`fast import UI: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
