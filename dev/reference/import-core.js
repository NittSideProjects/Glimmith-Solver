// === IMPORT CORE v22 (pure; no DOM) =========================================================================
// Reads Artisan of Glimmith puzzle files ("VERSION 1" text format, as used by the game and the Steam workshop)
// and turns them into the editor's own state (the same JSON shape as the page's "Raw state").
//   parsePuzzleFile(text)            -> { difficulty, w, h, state, solutionWalls, warnings }
//   parseMetadata(u8)                -> { name, description, author } | null
//   readZip(u8)                      -> [{ name, getData() }]            (stored + deflate, own inflate fallback)
//   collectPuzzles(inputs)           -> async { items, problems }        inputs = [{ name, bytes: Uint8Array }]
// A puzzle file, a zip holding one, or a zip holding folders of puzzles (workshop layout: <id>/puzzle + <id>/metadata)
// all go through collectPuzzles. Nothing here touches the page; the page and the tests share this exact code.

const IMPORT_RULE_FLAGS = {
  ADJACENT_SHAPES_DIFFERENT: 'mingleShape', ADJACENT_SIZES_DIFFERENT: 'mingleArea', ALL_SHAPES_DIFFERENT: 'mismatch',
  ALL_SHAPES_SAME: 'match', ONE_SYMBOL_PER_REGION: 'solitude', ONLY_RECTANGLES: 'boxy', NO_RECTANGLES: 'nonBoxy',
  NO_4_WAY_INTERSECTIONS: 'bricky', NO_3_WAY_INTERSECTIONS: 'loopy'
};
const IMPORT_PALETTE = ['#e0a458','#6fb8ac','#c97b84','#8ab6d6','#b98cc7','#9fc169','#e0956f','#7c9bd8','#d6b45c','#5fbfa0'];
// F-codes of the game: F0 F1 F3 F4 = palisade 0 1 3 4, F2 = two OPPOSITE walls, F7 = two walls at a RIGHT ANGLE
const IMPORT_PALISADE = { F0: '0', F1: '1', F2: '2s', F3: '3', F4: '4', F7: '2c' };
// 'lt' = the piece on the left / top is the SMALLER one (arrow tip points at it), 'gt' = the right / bottom one is smaller
const IMPORT_H_EDGE = { '  ': null, '--': null, '##': 'wall', '==': 'gemini', '!!': 'delta', '^^': 'lt', 'vv': 'gt' };
const IMPORT_V_EDGE = { ' ': null, '|': null, '#': 'wall', '=': 'gemini', '!': 'delta', '<': 'lt', '>': 'gt' };

// the page has these in scope (solver core); in node they come from the core file next to this one
const _importCanon = (typeof canonicalShapeKey === 'function') ? canonicalShapeKey : require(require('../corepath.js').corePath()).canonicalShapeKey;   // V1.0.3: the newest reference core (v23 was removed)

function importIsDigit(ch){ return ch >= '0' && ch <= '9'; }

function importParseShape(rows){
  const cells = [];
  rows.forEach((row, y) => { for(let x = 0; x < row.length; x++) if(row[x] === '#') cells.push([x, y]); });
  if(!cells.length) return null;
  const minX = Math.min(...cells.map(p => p[0])), minY = Math.min(...cells.map(p => p[1]));
  const norm = cells.map(([x, y]) => [x - minX, y - minY]);
  return { cells: norm, w: Math.max(...norm.map(p => p[0])) + 1, h: Math.max(...norm.map(p => p[1])) + 1 };
}

// one board row (odd rows: edges and cells) -> tokens; throws on anything it can not read
function importCellTokens(row, w, rowNo){
  const at = j => (j < row.length ? row[j] : ' ');
  const toks = [];                      // [{kind:'v', ch}, {kind:'cell', ...}, ...] 2w+1 tokens
  let j = 0;
  for(let t = 0; t < 2*w + 1; t++){
    if(t % 2 === 0){ toks.push({ kind: 'v', ch: at(j) }); j += 1; continue; }
    const ch = at(j);
    if(ch === 'U'){
      const m = /^U(\d{0,2})D(\d{0,2})L(\d{0,2})R(\d{0,2})/.exec(row.slice(j));
      if(!m) throw new Error(`row ${rowNo}: unreadable compass at column ${j}`);
      j += m[0].length;
      if(at(j) === '-') j += 1;         // the game puts '-' between a compass and a difference mark
      toks.push({ kind: 'compass', n: m[1], s: m[2], w: m[3], e: m[4] });
    } else if(ch === 'S'){
      let num = at(j + 1);
      if(!importIsDigit(num)) throw new Error(`row ${rowNo}: unreadable polyomino at column ${j}`);
      let used = 2;
      if(importIsDigit(at(j + 2))){ num += at(j + 2); used = 3; }
      if(at(j + used) === '-') used += 1;
      j += used;
      toks.push({ kind: 'poly', num });
    } else if(importIsDigit(ch)){
      const two = ch + at(j + 1);
      if(!importIsDigit(two[1])) throw new Error(`row ${rowNo}: unreadable area number "${two}"`);
      j += 2;
      toks.push({ kind: 'area', n: parseInt(two, 10) });
    } else {
      const code = ch + at(j + 1);
      j += 2;
      if(code === '  ') toks.push({ kind: 'hole' });
      else if(code === '..') toks.push({ kind: 'plain' });
      else if(/^P[1-5]$/.test(code)) toks.push({ kind: 'rose', n: Number(code[1]) });
      else if(IMPORT_PALISADE[code]) toks.push({ kind: 'palisade', v: IMPORT_PALISADE[code] });
      else throw new Error(`row ${rowNo}: unknown cell code "${code}"`);
    }
  }
  if(row.slice(j).trim() !== '') throw new Error(`row ${rowNo}: unexpected text after the last cell ("${row.slice(j).trim().slice(0, 12)}")`);
  return toks;
}

function parsePuzzleFile(text){
  const lines = text.split(/\r\n|\n|\r/);
  if(lines[0].trim() !== 'VERSION 1') throw new Error('not a puzzle file (first line is not "VERSION 1")');
  const rules = { precision: null, min: null, max: null, mismatch: false, match: false, mingleShape: false, mingleArea: false,
                  solitude: false, boxy: false, nonBoxy: false, bricky: false, loopy: false };
  const warnings = [];
  const shapes = new Map();             // id -> {cells,w,h}
  let bankIds = [], w = null, h = null, difficulty = null, i = 1, sawPuzzle = false;
  for(; i < lines.length; i++){
    const line = lines[i];
    if(line === 'PUZZLE'){ sawPuzzle = true; i++; break; }
    let m;
    if((m = /^DIFFICULTY (\d+)/.exec(line))) difficulty = Number(m[1]);
    else if((m = /^DIMENSIONS (\d+) (\d+)/.exec(line))){ w = Number(m[1]); h = Number(m[2]); }
    else if((m = /^AREA_EQUALS (\d+)/.exec(line))) rules.precision = Number(m[1]);
    else if((m = /^AREA_AT_LEAST (\d+)/.exec(line))) rules.min = Number(m[1]);
    else if((m = /^AREA_AT_MOST (\d+)/.exec(line))) rules.max = Number(m[1]);
    else if(/^SHAPE_BANK\b/.test(line)) bankIds = line.slice(10).trim().split(/\s+/).filter(Boolean);
    else if((m = /^SHAPE (\d+) (\d+)/.exec(line))){
      const n = Number(m[2]), rows = [];
      for(let k = 0; k < n; k++){ i++; rows.push((lines[i] || '').replace(/\r$/, '')); }
      const sh = importParseShape(rows);
      if(!sh) warnings.push(`shape ${m[1]} is empty`); else shapes.set(m[1], sh);
    } else if(IMPORT_RULE_FLAGS[line]) rules[IMPORT_RULE_FLAGS[line]] = true;
    else if(line.trim() !== '' && !/^PUZZLE_VERSION\b/.test(line)) warnings.push(`unknown header line "${line.slice(0, 40)}" ignored`);
  }
  if(!sawPuzzle) throw new Error('no PUZZLE section');
  if(!w || !h) throw new Error('no DIMENSIONS line');
  if(rules.precision != null && (rules.min != null || rules.max != null)) warnings.push('the file has AREA_EQUALS together with AT_LEAST / AT_MOST');

  const board = lines.slice(i, i + 2*h + 1);
  if(board.length < 2*h + 1) throw new Error(`the board has ${board.length} lines, ${2*h + 1} expected`);
  i += 2*h + 1;

  const active = Array.from({ length: h }, () => Array.from({ length: w }, () => 0));
  const walls = new Map(), roses = new Map(), polyominoes = new Map(), areaNumbers = new Map();
  const palisades = new Map(), compasses = new Map(), watchtowers = new Map();
  const edges = [];                     // [key, type, cA, rA, cB, rB], resolved after we know which cells exist
  const usedShapes = new Set();
  for(let ri = 0; ri < board.length; ri++){
    let row = board[ri];
    const rowNo = ri + 1;
    if(ri % 2 === 0){
      const vr = ri / 2;
      for(let k = 0; k <= w; k++){
        const vch = k*3 < row.length ? row[k*3] : ' ';
        if(vch === ' ' || vch === '+') continue;
        if(vch >= '1' && vch <= '4') watchtowers.set(`${k},${vr}`, Number(vch));
        else throw new Error(`row ${rowNo}: unknown corner mark "${vch}"`);
      }
      for(let k = 0; k < w; k++){
        const code = (row + '   ').slice(k*3 + 1, k*3 + 3);
        let type;
        if(code in IMPORT_H_EDGE) type = IMPORT_H_EDGE[code];
        else if(code[0] === '-' && importIsDigit(code[1])) type = 'diff' + code[1];
        else throw new Error(`row ${rowNo}: unknown horizontal edge "${code}"`);
        if(type && vr > 0 && vr < h) edges.push([`h:${k},${vr - 1}`, type, k, vr - 1, k, vr]);
      }
    } else {
      const r = (ri - 1) / 2;
      const toks = importCellTokens(row, w, rowNo);
      toks.forEach((tk, t) => {
        if(t % 2 === 0){
          const k = t / 2, ch = tk.ch;
          let type;
          if(ch in IMPORT_V_EDGE) type = IMPORT_V_EDGE[ch];
          else if(importIsDigit(ch)) type = 'diff' + ch;
          else throw new Error(`row ${rowNo}: unknown vertical edge "${ch}"`);
          if(type && k > 0 && k < w) edges.push([`v:${k - 1},${r}`, type, k - 1, r, k, r]);
          return;
        }
        const c = (t - 1) / 2, key = `${c},${r}`;
        if(tk.kind === 'hole') return;
        active[r][c] = 1;
        if(tk.kind === 'rose') roses.set(key, tk.n);
        else if(tk.kind === 'area') areaNumbers.set(key, tk.n);
        else if(tk.kind === 'palisade') palisades.set(key, tk.v);
        else if(tk.kind === 'compass'){
          const val = s => (s === '' ? null : parseInt(s, 10));
          compasses.set(key, { n: val(tk.n), e: val(tk.e), s: val(tk.s), w: val(tk.w) });
        } else if(tk.kind === 'poly'){
          const sh = shapes.get(tk.num);
          if(!sh) throw new Error(`row ${rowNo}: polyomino S${tk.num} is not defined by a SHAPE line`);
          usedShapes.add(tk.num);
          polyominoes.set(key, { cells: sh.cells.map(p => p.slice()), canonicalKey: _importCanon(sh.cells) });
        }
      });
    }
  }
  let ignored = 0;
  for(const [key, type, ca, ra, cb, rb] of edges){
    if(active[ra][ca] && active[rb][cb]) walls.set(key, type); else ignored++;
  }
  if(ignored) warnings.push(`${ignored} edge mark(s) next to an empty tile ignored`);
  for(const k of [...watchtowers.keys()]){ const [vx, vy] = k.split(',').map(Number);
    const around = [[vx - 1, vy - 1], [vx, vy - 1], [vx - 1, vy], [vx, vy]].filter(([x, y]) => x >= 0 && y >= 0 && x < w && y < h && active[y][x]);
    if(!around.length){ watchtowers.delete(k); warnings.push(`watchtower at corner ${k} touches no tile, ignored`); } }

  const shapeBank = [];
  bankIds.forEach(id => {
    const sh = shapes.get(id);
    if(!sh){ warnings.push(`SHAPE_BANK lists shape ${id}, which is not defined`); return; }
    const n = shapeBank.length + 1;
    shapeBank.push({ id: n, w: sh.w, h: sh.h, cells: sh.cells.map(p => p.slice()), color: IMPORT_PALETTE[(n - 1) % IMPORT_PALETTE.length] });
  });

  // optional author solution: a second board drawn with '#' / '##' between pieces
  let solutionWalls = null;
  while(i < lines.length && lines[i].trim() === '') i++;
  if(i < lines.length && lines[i].trim() === 'SOLUTION'){
    const sol = lines.slice(i + 1, i + 2 + 2*h);
    if(sol.length >= 2*h + 1){
      solutionWalls = [];
      for(let ri = 0; ri < 2*h + 1; ri++){
        const row = sol[ri] + '   '.repeat(w + 1);
        if(ri % 2 === 0){
          const vr = ri / 2;
          if(vr > 0 && vr < h) for(let k = 0; k < w; k++)
            if(row.slice(k*3 + 1, k*3 + 3) === '##' && active[vr - 1][k] && active[vr][k]) solutionWalls.push(`h:${k},${vr - 1}`);
        } else {
          const r = (ri - 1) / 2;
          for(let k = 1; k < w; k++)
            if(row[k*3] === '#' && active[r][k - 1] && active[r][k]) solutionWalls.push(`v:${k - 1},${r}`);
        }
      }
    } else warnings.push('SOLUTION section is cut short, ignored');
  }

  const state = {
    puzzle: { w, h, active, walls: [...walls.entries()], roses: [...roses.entries()], polyominoes: [...polyominoes.entries()],
              areaNumbers: [...areaNumbers.entries()], palisades: [...palisades.entries()], compasses: [...compasses.entries()],
              watchtowers: [...watchtowers.entries()] },
    shapeBank, sizeRules: rules, solverLimits: { maxRegions: null, maxRegionSize: null }
  };
  return { difficulty, w, h, state, solutionWalls, warnings };
}

// V1.0.5: custom rules a workshop description can switch on: [sizeRules key, name shown, pattern]
const IMPORT_TEXT_RULES = [['wally', 'Wally', /\bwally\b/i], ['heterogeneous', 'Heterogeneous', /\bheterogene(ous|ity)\b/i]];

// workshop "metadata": 20 header bytes, then name, description, author as (int32 length, bytes incl. NUL); negative length = UTF-16
function parseMetadata(u8){
  try{
    const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
    let off = 20;
    const str = () => {
      const len = dv.getInt32(off, true); off += 4;
      const n = len < 0 ? -len * 2 : len;
      if(n < 0 || off + n > u8.byteLength) throw new Error('bad metadata');
      const bytes = u8.subarray(off, off + n); off += n;
      return new TextDecoder(len < 0 ? 'utf-16le' : 'utf-8').decode(bytes).replace(/\0+$/, '');
    };
    const name = str(), description = str(), author = str();
    return { name, description, author };
  } catch(e){ return null; }
}

// ---- minimal inflate (RFC 1951), used when the browser has no DecompressionStream ----
function inflateRawJS(src, expectedSize){
  let pos = 0, bitBuf = 0, bitCnt = 0;
  let out = new Uint8Array(Math.max(expectedSize || 0, 1024)), op = 0;
  const need = n => { if(op + n > out.length){ const bigger = new Uint8Array(Math.max(out.length * 2, op + n)); bigger.set(out); out = bigger; } };
  const bits = n => {
    while(bitCnt < n){ if(pos >= src.length) throw new Error('unexpected end of compressed data'); bitBuf |= src[pos++] << bitCnt; bitCnt += 8; }
    const v = bitBuf & ((1 << n) - 1); bitBuf >>>= n; bitCnt -= n; return v;
  };
  const build = lengths => {
    const count = new Uint16Array(16), symbol = new Uint16Array(lengths.length), offs = new Uint16Array(16);
    for(const l of lengths) count[l]++;
    for(let k = 1; k < 15; k++) offs[k + 1] = offs[k] + count[k];
    for(let s = 0; s < lengths.length; s++) if(lengths[s]) symbol[offs[lengths[s]]++] = s;
    return { count, symbol };
  };
  const decode = hf => {
    let code = 0, first = 0, index = 0;
    for(let len = 1; len <= 15; len++){
      code |= bits(1);
      const c = hf.count[len];
      if(code - c < first) return hf.symbol[index + (code - first)];
      index += c; first += c; first <<= 1; code <<= 1;
    }
    throw new Error('bad Huffman code');
  };
  const LB = [3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258];
  const LE = [0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0];
  const DB = [1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577];
  const DE = [0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13];
  let fixedL = null, fixedD = null;
  let last = 0;
  while(!last){
    last = bits(1);
    const type = bits(2);
    if(type === 0){
      bitBuf = 0; bitCnt = 0;
      if(pos + 4 > src.length) throw new Error('bad stored block');
      const len = src[pos] | (src[pos + 1] << 8); pos += 4;
      if(pos + len > src.length) throw new Error('bad stored block');
      need(len); out.set(src.subarray(pos, pos + len), op); op += len; pos += len;
      continue;
    }
    let hl, hd;
    if(type === 1){
      if(!fixedL){
        const l = new Array(288).fill(8); for(let k = 144; k < 256; k++) l[k] = 9; for(let k = 256; k < 280; k++) l[k] = 7;
        fixedL = build(l); fixedD = build(new Array(30).fill(5));
      }
      hl = fixedL; hd = fixedD;
    } else if(type === 2){
      const nlen = bits(5) + 257, ndist = bits(5) + 1, ncode = bits(4) + 4;
      const order = [16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15], cl = new Array(19).fill(0);
      for(let k = 0; k < ncode; k++) cl[order[k]] = bits(3);
      const clh = build(cl), lengths = [];
      while(lengths.length < nlen + ndist){
        const sym = decode(clh);
        if(sym < 16) lengths.push(sym);
        else {
          let rep, val = 0;
          if(sym === 16){ if(!lengths.length) throw new Error('bad lengths'); val = lengths[lengths.length - 1]; rep = 3 + bits(2); }
          else if(sym === 17) rep = 3 + bits(3); else rep = 11 + bits(7);
          for(let k = 0; k < rep; k++) lengths.push(val);
        }
      }
      hl = build(lengths.slice(0, nlen)); hd = build(lengths.slice(nlen, nlen + ndist));
    } else throw new Error('bad block type');
    for(;;){
      const sym = decode(hl);
      if(sym < 256){ need(1); out[op++] = sym; }
      else if(sym === 256) break;
      else {
        const s2 = sym - 257; if(s2 >= 29) throw new Error('bad length symbol');
        const len = LB[s2] + bits(LE[s2]);
        const ds = decode(hd); if(ds >= 30) throw new Error('bad distance symbol');
        const dist = DB[ds] + bits(DE[ds]);
        if(dist > op) throw new Error('distance too far back');
        need(len);
        for(let k = 0; k < len; k++){ out[op] = out[op - dist]; op++; }
      }
    }
  }
  return out.slice(0, op);
}

async function inflateRaw(u8, expectedSize){
  if(typeof DecompressionStream === 'function'){
    try{
      const ds = new DecompressionStream('deflate-raw');
      const writer = ds.writable.getWriter();
      writer.write(u8).catch(() => {}); writer.close().catch(() => {});
      const reader = ds.readable.getReader(), chunks = []; let total = 0;
      for(;;){ const { done, value } = await reader.read(); if(done) break; chunks.push(value); total += value.length; }
      const res = new Uint8Array(total); let o = 0;
      for(const c of chunks){ res.set(c, o); o += c.length; }
      return res;
    } catch(e){ /* fall through to the built-in inflate */ }
  }
  return inflateRawJS(u8, expectedSize);
}

function isZipBytes(u8){ return u8.length >= 4 && u8[0] === 0x50 && u8[1] === 0x4b && (u8[2] === 3 || u8[2] === 5) && (u8[3] === 4 || u8[3] === 6); }

function readZip(u8){
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  let eocd = -1;
  for(let p = u8.length - 22; p >= Math.max(0, u8.length - 22 - 65535); p--){ if(dv.getUint32(p, true) === 0x06054b50){ eocd = p; break; } }
  if(eocd < 0) throw new Error('not a valid zip file (no end-of-archive record)');
  const count = dv.getUint16(eocd + 10, true);
  let p = dv.getUint32(eocd + 16, true);
  if(count === 0xffff || p === 0xffffffff) throw new Error('zip64 archives are not supported');
  const entries = [];
  for(let n = 0; n < count; n++){
    if(p + 46 > u8.length || dv.getUint32(p, true) !== 0x02014b50) throw new Error('damaged zip directory');
    const flags = dv.getUint16(p + 8, true), method = dv.getUint16(p + 10, true);
    const csize = dv.getUint32(p + 20, true), usize = dv.getUint32(p + 24, true);
    const nlen = dv.getUint16(p + 28, true), xlen = dv.getUint16(p + 30, true), clen = dv.getUint16(p + 32, true);
    const lho = dv.getUint32(p + 42, true);
    const nameBytes = u8.subarray(p + 46, p + 46 + nlen);
    const name = new TextDecoder((flags & 0x800) ? 'utf-8' : 'latin1').decode(nameBytes);
    p += 46 + nlen + xlen + clen;
    entries.push({ name, flags, method, csize, usize, lho, getData: async () => {
      if(flags & 1) throw new Error(`${name} is encrypted`);
      if(dv.getUint32(lho, true) !== 0x04034b50) throw new Error(`damaged zip entry ${name}`);
      const start = lho + 30 + dv.getUint16(lho + 26, true) + dv.getUint16(lho + 28, true);
      const raw = u8.subarray(start, start + csize);
      if(method === 0) return raw;
      if(method === 8) return inflateRaw(raw, usize);
      throw new Error(`${name}: unsupported zip compression method ${method}`);
    } });
  }
  return entries;
}

function importHash(text){
  let h = 0x811c9dc5;
  for(let k = 0; k < text.length; k++){ h ^= text.charCodeAt(k); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(16) + ':' + text.length;
}

const IMPORT_SKIP_EXT = /\.(png|jpe?g|gif|webp|bmp|ico|svg|mp4|webm|mp3|ogg|wav|pdf|exe|dll)$/i;

// flatten files and (nested) zips into [{ path, container, getBytes() }]
async function importExpand(inputs, problems, depth){
  const flat = [];
  for(const inp of inputs){
    const bytes = inp.bytes;
    if(isZipBytes(bytes)){
      if(depth >= 3){ problems.push({ source: inp.name, message: 'zip files nested too deeply, skipped' }); continue; }
      let entries;
      try{ entries = readZip(bytes); } catch(e){ problems.push({ source: inp.name, message: e.message }); continue; }
      const inner = [];
      for(const en of entries){
        if(/\/$/.test(en.name) || /(^|\/)(__MACOSX|\.DS_Store|Thumbs\.db)(\/|$)/i.test(en.name) || /(^|\/)\._/.test(en.name)) continue;
        if(en.name.toLowerCase().endsWith('.zip')){
          try{ inner.push({ name: en.name, bytes: await en.getData() }); } catch(e){ problems.push({ source: en.name, message: e.message }); }
          continue;
        }
        if(IMPORT_SKIP_EXT.test(en.name)) continue;
        const entry = en;
        flat.push({ path: en.name, container: inp.name, getBytes: () => entry.getData() });
      }
      if(inner.length){
        const sub = await importExpand(inner, problems, depth + 1);
        sub.forEach(s => flat.push({ path: s.path, container: inp.name + ' > ' + s.container, getBytes: s.getBytes }));
      }
    } else if(!IMPORT_SKIP_EXT.test(inp.name)){
      flat.push({ path: inp.name, container: '', getBytes: async () => bytes });
    }
  }
  return flat;
}

async function collectPuzzles(inputs){
  const items = [], problems = [], seen = new Set();
  const flat = await importExpand(inputs, problems, 0);
  const dirOf = p => { const k = p.lastIndexOf('/'); return k < 0 ? '' : p.slice(0, k); };
  const baseOf = p => p.slice(p.lastIndexOf('/') + 1);
  const metaByDir = new Map();
  flat.forEach(f => { if(baseOf(f.path).toLowerCase() === 'metadata') metaByDir.set(f.container + '|' + dirOf(f.path), f); });
  const candidates = flat.filter(f => baseOf(f.path).toLowerCase() !== 'metadata');
  candidates.sort((a, b) => (a.container + a.path).localeCompare(b.container + b.path, undefined, { numeric: true }));
  let textFiles = 0;
  for(const f of candidates){
    let bytes;
    try{ bytes = await f.getBytes(); } catch(e){ problems.push({ source: f.path, message: e.message }); continue; }
    if(bytes.length > 2000000) continue;
    const head = new TextDecoder('latin1').decode(bytes.subarray(0, 9));
    if(head !== 'VERSION 1' && !/^\s*VERSION\s/.test(head)) continue;     // some other file (e.g. a readme): not a puzzle
    textFiles++;
    const text = new TextDecoder('utf-8').decode(bytes);
    const label = (f.container ? f.container + ': ' : '') + f.path;
    let parsed;
    try{ parsed = parsePuzzleFile(text); } catch(e){ problems.push({ source: label, message: e.message }); continue; }
    const sig = importHash(text.replace(/\r/g, ''));
    if(seen.has(sig)){ problems.push({ source: label, message: 'identical to another puzzle in this import, skipped', duplicate: true }); continue; }
    seen.add(sig);
    const mf = metaByDir.get(f.container + '|' + dirOf(f.path));
    let meta = null;
    if(mf){ try{ meta = parseMetadata(await mf.getBytes()); } catch(e){ meta = null; } }
    const folder = dirOf(f.path).split('/').pop();
    const base = baseOf(f.path).replace(/\.[^.]*$/, '');
    const generic = /^(puzzle|metadata)?$/i.test(base);
    const fallback = !generic ? base : (folder || (f.container || 'Imported puzzle').replace(/\.zip$/i, ''));
    // V1.0.4 / V1.0.5: the game's files have no line for the custom rules; workshop puzzles name them in their title or description
    // ("Special Rule: Wally - ..."). Only rules that are a plain switch are read this way: Links and Omits depend on the grid / on shapes.
    const assumedRules = [];
    if(meta){
      const txt = (meta.name || '') + ' ' + (meta.description || '');
      for(const [key, label, re] of IMPORT_TEXT_RULES) if(re.test(txt) && !parsed.state.sizeRules[key]){ parsed.state.sizeRules = Object.assign({}, parsed.state.sizeRules, { [key]: true }); assumedRules.push(label); }
    }
    items.push({ name: (meta && meta.name) || fallback, author: (meta && meta.author) || '', description: (meta && meta.description) || '', assumedRules,
                 folder, source: label, sig, difficulty: parsed.difficulty, w: parsed.w, h: parsed.h,
                 state: parsed.state, solutionWalls: parsed.solutionWalls, warnings: parsed.warnings });
  }
  if(!items.length && !problems.length) problems.push({ source: '', message: textFiles ? 'no readable puzzle found' : 'no puzzle files found (expected text files starting with "VERSION 1")' });
  items.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base', numeric: true }) || a.source.localeCompare(b.source));
  return { items, problems };
}

if(typeof module !== 'undefined'){
  module.exports = { parsePuzzleFile, parseMetadata, readZip, inflateRawJS, inflateRaw, isZipBytes, collectPuzzles, importHash };
}
