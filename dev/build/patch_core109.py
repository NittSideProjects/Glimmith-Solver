#!/usr/bin/env python3
"""Core v109 (release V1.0.29): one shared placement decision ('placeDecide', refactoring step 2 of 8).

User: the placement steps (polyomino, shape bank, Match, Mismatch, Boxy, Gemini, area numbers, compass boxes) all do "list the
places this group's piece can still take, and decide what they all agree on". Each had its own copy of the deciding part. Now:

  placeDecide(V, tag, out, rep, link) - V = the places still possible (lists of tiles), tag = the rule name of the decisions.
    * the tiles EVERY place covers are in the piece: with `rep`, they are merged into the group at once (and the edges inside
      linked); with `link` (an array), the edges between them are linked and the caller merges them at the end of its step;
    * an edge on the border of EVERY place is a wall.
    Returns true when groups were merged.

Eight copies replaced (area-place, stamp-place, place step of Match / Mismatch, Boxy placements, gemini-place, cmp-box, the
anchored shapes step, bank-place); each rule keeps only what is its own: which places it lists and the check a place must pass.
The decisions are exactly the same as before (same order, same tags). One addition: the shape bank's placements skip the shapes
ruled out for the group (v108), as pieceInfo already does.
Usage: python3 patch_core109.py <in.js> <out.js> [indent]"""
import sys, re

def rep(src, old, new, what):
    c = src.count(old)
    if c != 1: raise SystemExit(f'{what}: anchor found {c} times')
    return src.replace(old, new)

START = "for(const P of V) for(const id of P) cntBuf[id]++;"
WALL = "if(n === V.length && e.state === 0){ e.state = 1; out.push({ e, value: 'wall', rule: "

def patch(src, ind):
    I = lambda t: ''.join((ind + l if l.strip() else l) for l in t.splitlines(True))
    src = rep(src, "// ================= SOLVER CORE (pure, unit-tested separately; v108 (V1.0.28)",
        "// ================= SOLVER CORE (pure, unit-tested separately; v109 (V1.0.29) = v108 with one shared placement decision (placeDecide); v108 (V1.0.28)", 'banner')
    # ---- replace the eight copies ----
    n = src.count(START)
    if n != 8: raise SystemExit(f'placement blocks: found {n}, expected 8')
    out, pos, done = [], 0, []
    while True:
        i = src.find(START, pos)
        if i < 0: break
        ls = src.rfind('\n', 0, i) + 1                       # start of the line
        indent = src[ls:i]
        w = src.find(WALL, i)
        tag = src[w + len(WALL):src.index(' })', w)]
        # the loop that holds the wall line ends at the next line that is `indent + '}'`
        endmark = '\n' + indent + '}\n'
        e = src.find(endmark, w)
        block = src[ls:e + len(endmark)]
        m = re.search(r"if\(find\(id\) !== find\(([\w.]+)\)\)\{ union\(\1, id\); merged = true; \}", block)
        if m:
            call = f"{indent}let merged = placeDecide(V, {tag}, out, {m.group(1)}, null);      // v109\n"
        else:
            if 'link.push(e)' not in block: raise SystemExit('block with neither merge nor link: ' + block[:200])
            call = f"{indent}placeDecide(V, {tag}, out, -1, link);      // v109\n"
        out.append(src[pos:ls]); out.append(call); pos = e + len(endmark); done.append(tag)
    out.append(src[pos:]); src = ''.join(out)
    if src.count('placeDecide(V, ') != 8: raise SystemExit('replacement count')
    sys.stderr.write('placeDecide replaced: ' + ', '.join(done) + '\n')
    # ---- the shared function ----
    src = rep(src, I("""  // ---- where can a given shape still go, for the group `rep`? (what stampStep does for a stamp) ----
"""), I("""  // v109: what every remaining place agrees on (shared by all the placement steps). V = the places (tile lists), tag = rule name.
  // rep >= 0: the tiles every place covers are merged into rep's group at once (returns true when it merged);
  // link (array): the edges between those tiles are linked and pushed to `link`, the caller merges them at the end of its step.
  // An edge on the border of every place is a wall.
  function placeDecide(V, tag, out, rep, link){
    for(const P of V) for(const id of P) cntBuf[id]++;
    const sure = V[0].filter(id => cntBuf[id] === V.length);
    for(const P of V) for(const id of P) cntBuf[id] = 0;
    let merged = false;
    if(link === null){
      for(const id of sure) if(find(id) !== find(rep)){ union(rep, id); merged = true; }
      for(const id of sure) for(const { e, o } of adjE[id]) if(e.state === 0 && find(o) === find(id)){ e.state = 2; out.push({ e, value: 'same', rule: tag }); }
    } else {
      for(const id of sure) for(const { e, o } of adjE[id]) if(e.state === 0 && sure.includes(o)){ e.state = 2; link.push(e); out.push({ e, value: 'same', rule: tag }); }
    }
    for(const P of V){
      markGen++;
      for(const id of P) markBuf[id] = markGen;
      for(const id of P) for(const { e, o } of adjE[id]) if(markBuf[o] !== markGen) edgeCnt[e.idx]++;
    }
    for(const P of V) for(const id of P) for(const { e } of adjE[id]){
      const n = edgeCnt[e.idx];
      if(n === 0) continue;
      edgeCnt[e.idx] = 0;
      if(n === V.length && e.state === 0){ e.state = 1; out.push({ e, value: 'wall', rule: tag }); }
    }
    return merged;
  }
  // ---- where can a given shape still go, for the group `rep`? (what stampStep does for a stamp) ----
"""), 'function')
    # ---- the bank's placements skip the shapes ruled out for the group ----
    src = rep(src, I("""      let est = 0; for(const sh of loose) if(sh.size >= nd && sh.size <= cp) est += sh.orients.length * sh.size;
"""), I("""      const nkB = tsOn ? notOfIds(mem) : null;                                     // v109: not the shapes ruled out for this group
      let est = 0; for(const sh of loose) if(sh.size >= nd && sh.size <= cp && !(nkB && nkB.has(sh.key))) est += sh.orients.length * sh.size;
"""), 'bank est')
    src = rep(src, I("""      for(const sh of loose){
        if(sh.size < nd || sh.size > cp) continue;
        for(const ori of sh.orients){
"""), I("""      for(const sh of loose){
        if(sh.size < nd || sh.size > cp || (nkB && nkB.has(sh.key))) continue;
        for(const ori of sh.orients){
"""), 'bank loop')
    return src

if __name__ == '__main__':
    ind = ' ' * int(sys.argv[3]) if len(sys.argv) > 3 else ''
    src = open(sys.argv[1], encoding='utf8').read()
    open(sys.argv[2], 'w', encoding='utf8').write(patch(src, ind))
    print('ok', sys.argv[2])
