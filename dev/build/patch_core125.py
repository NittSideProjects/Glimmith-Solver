#!/usr/bin/env python3
"""Core v125 (release V1.0.46): the compass budget check counts the tiles that join the parts of a split group.

cmpBudgetOk (v54) asks, for each compass of a group and each of its directions: can the piece still reach a rose of every type it
lacks while adding at most the tiles that direction still allows? Its search started from EVERY tile of the group at cost 0. A group
can be in parts (a far join: label-join, a probe, ...): the real piece is connected, so it also pays for the tiles that link those
parts, but the search let a far part act as a free starting point. After the label-join of v98 that made the check much weaker on a
compass puzzle (Zone3/1402: the probes stopped at 93 open edges and the final search took 11 s, instead of 1.4 s with no search).
Two changes. The search starts from the first part only (tiles linked by same-piece edges); the other parts of the group are entered at no
extra cost, like the first; and every part must be met within the budget. And the check also runs for a split group that lacks no rose (a far part
may hold the rose the group needed: that rose then still has to be joined within the budget). opts.cmpBudgetParts === false turns the
second change off. It does not run inside the final search (searchLite; opts.cmpBudgetPartsSearch === true runs it there
  too): there it cost more time than it saved (a base-game compass puzzle 1.2 s -> 5.7 s of final search). The check takes each group's tiles from the
union-find's member lists instead of a pass over the whole board on every call. Sound: the piece holds a path from its first part to each
other part and to a rose of each type it lacks, and the tiles of that path on the compass's side are at most the budget.
Also: the first clue-search slice on a puzzle with roses of one type is 20 s instead of 10 s. A base-game rose puzzle needs about
15 s of clue search on a slower machine; a 10 s slice ran out, and the narrow searches and slices that follow added 15 s more
(34 s -> 19 s; the other 65 base-game puzzles with roses of one type are unchanged).
Usage: python3 patch_core125.py <in.js> <out.js> [indent]"""
import sys

def rep(src, old, new, what):
    c = src.count(old)
    if c != 1: raise SystemExit(f'{what}: anchor found {c} times')
    return src.replace(old, new)

def patch(src, ind):
    I = lambda t: ''.join((ind + l if l.strip() else l) for l in t.splitlines(True))
    src = rep(src, "// ================= SOLVER CORE (pure, unit-tested separately; v124 (V1.0.45)",
        "// ================= SOLVER CORE (pure, unit-tested separately; v125 (V1.0.46) = v124 + the compass budget counts the tiles that join a split group; v124 (V1.0.45)", 'banner')
    src = rep(src, I("""      const T = ++cbT, buckets = Array.from({ length: budget + 1 }, () => []);
      for(const id of mem){ cbTick[id] = T; cbDist[id] = 0; buckets[0].push(id); }
      const entered = new Set([rep]);
      let got = 0;
      for(let k = 0; k <= budget && got !== lack; k++){
        const B = buckets[k];
        for(let i = 0; i < B.length; i++){
          const id = B[i]; if(cbDist[id] !== k) continue;
          for(const { e, o: nid } of adjE[id]){
            if(e.state === 1 || e === closed) continue;
            const g = find(nid);
            if(entered.has(g) || blocked.has(g)) continue;
"""), I("""      const T = ++cbT, buckets = Array.from({ length: budget + 1 }, () => []);
      cbTick[mem[0]] = T; cbDist[mem[0]] = 0; buckets[0].push(mem[0]);            // v125: from the first part only (it grows through same-piece edges below)
      const entered = new Set([rep]);
      let got = 0, met = 1;
      for(let k = 0; k <= budget && (got !== lack || met < mem.length); k++){
        const B = buckets[k];
        for(let i = 0; i < B.length; i++){
          const id = B[i]; if(cbDist[id] !== k) continue;
          for(const { e, o: nid } of adjE[id]){
            if(e.state === 1 || e === closed) continue;
            const g = find(nid);
            if(g === rep){ if(cbTick[nid] !== T){ cbTick[nid] = T; cbDist[nid] = k; B.push(nid); met++; } continue; }   // v125: a tile of the group costs nothing
            if(entered.has(g) || blocked.has(g)) continue;
"""), 'start')
    src = rep(src, I("""            for(const q of gt){ cbTick[q] = T; cbDist[q] = nd; buckets[nd].push(q); }
          }
        }
      }
      if(got !== lack) return false;
"""), I("""            for(const q of gt){ cbTick[q] = T; cbDist[q] = nd; buckets[nd].push(q); }
          }
        }
      }
      if(got !== lack || met < mem.length) return false;                           // v125: every part of the group is met too
"""), 'end')
    src = rep(src, I("""    const t0 = ++rpTick; const q = [mem[0]]; rpSeen[mem[0]] = t0;
    for(let i = 0; i < q.length; i++) for(const { e, o } of adjE[q[i]]) if(e.state === 2 && rpSeen[o] !== t0){ rpSeen[o] = t0; q.push(o); }
    if(q.length === mem.length) return true;                                   // one part
"""), I("""    const t0 = ++rpTick; const q = [mem[0]]; rpSeen[mem[0]] = t0;
    for(let i = 0; i < q.length; i++) for(const { e, o } of adjE[q[i]]) if(e.state === 2 && rpSeen[o] !== t0){ rpSeen[o] = t0; q.push(o); }
    rpSplit = q.length !== mem.length;                                         // v125
    if(q.length === mem.length) return true;                                   // one part
"""), 'parts')
    src = rep(src, I("""  const rcJoin = new Map();
  function reachOk(rep, mem, blocked, closed, need, cap){
"""), I("""  const rcJoin = new Map();
  let rpSplit = false;                                                         // v125: the group of the last reachOk is in several parts
  function reachOk(rep, mem, blocked, closed, need, cap){
    rpSplit = mem.length > 1;
"""), 'split var')
    src = rep(src, I("""      if(K > 0 && lack && opts.cmpBudget !== false && !cmpBudgetOk(rep, mem, blocked, closed, mask, lack)){ reachWhy = 'cmp-budget'; return false; }
"""), I("""      if(((K > 0 && lack) || (rpSplit && opts.cmpBudgetParts !== false && (!searchLite || opts.cmpBudgetPartsSearch === true))) && opts.cmpBudget !== false && !cmpBudgetOk(rep, mem, blocked, closed, mask, lack)){ reachWhy = 'cmp-budget'; return false; }   // v125: also a split group
"""), 'call')
    src = rep(src, I("""    const groupTiles = new Map();
    for(const id of activeIds){ const r = find(id); let g = groupTiles.get(r); if(!g){ g = []; groupTiles.set(r, g); } g.push(id); }
"""), I("""    const groupTiles = members;                                                  // v125: the union-find's own lists (no pass over the board per call)
"""), 'members')
    src = rep(src, "(roseTypeList.length >= 2 ? 40000 : 10000);     // roses of several types: the grouping IS the puzzle",
        "(roseTypeList.length >= 2 ? 40000 : 20000);     // roses of several types: the grouping IS the puzzle (v125: one type 10 s -> 20 s)", 'clue slice')
    return src

if __name__ == '__main__':
    src = open(sys.argv[1], encoding='utf8').read()
    ind = sys.argv[3] if len(sys.argv) > 3 else ''
    open(sys.argv[2], 'w', encoding='utf8').write(patch(src, ind)); print('ok', sys.argv[2])
