#!/usr/bin/env python3
"""Page V1.0.9 -> V1.0.10 (page only, core stays v99): the author's text rewrites, and step-by-step text that states what is true.

1. The author's rewrites (rewrite page, everything written so far that is not a [note]): rewrites_V1.0.10.json holds, for each place
   in V1.0.9, the exact old source and the new source (made by dev/tools/rewrites/gen_rewrites.js). Each old slice is checked before it
   is replaced. Strings the code fills in keep their values ({1} marks -> the same expressions), and a string that is glued to other
   text keeps its leading / trailing space.
2. Step by step: the steps said what is impossible ("No wall here is impossible", "Suppose there were a wall ... this breaks ... so
   there is no wall"), which reads as double negatives. Now every step says what is true first ("These two tiles are in one piece",
   "There is a wall here") and then why: what the solver found when it tried the other way. Rule titles and texts that were double
   negatives say the same thing positively ("Solitude: one symbol per piece" instead of "two symbols never together", ...).
Usage: python3 patch_ui_V1.0.10.py glimmith_solver_V1.0.9.html glimmith_solver_V1.0.10.html"""
import sys, os, json

def rep(src, old, new):
    c = src.count(old)
    if c != 1: raise SystemExit(f'anchor found {c} times: {old[:120]}')
    return src.replace(old, new)

src = open(sys.argv[1], encoding='utf8').read()

# ---- 1. the author's rewrites, by position (last first, so earlier positions stay valid) ----
R = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'rewrites_V1.0.10.json'), encoding='utf8'))
for r in sorted(R, key=lambda r: -r['start']):
    if src[r['start']:r['end']] != r['old']: raise SystemExit(f"{r['id']}: the page has changed at {r['start']}: {src[r['start']:r['end']][:80]!r}")
    src = src[:r['start']] + r['new'] + src[r['end']:]

# ---- 2. step by step: say what is true ----
src = rep(src, """        return { kicker: 'Rule', title: 'Only one piece it can be in',
          text: `Every piece holds exactly ${what}. The ringed tiles can not end up in any other piece, so they are in one piece, even though they do not touch yet.${mark}`, meta };""",
"""        return { kicker: 'Rule', title: 'Only one piece it can be in',
          text: `Every piece holds exactly ${what}. The ringed tiles have only one piece left they can belong to, so they are in that piece, even though they do not touch yet.${mark}`, meta };""")
src = rep(src, """      return { kicker: 'Proof by contradiction', title: 'Far apart, but one piece',
        text: `Suppose the ringed tiles were in different pieces. Following the rules from there leads to a contradiction, so they are in one piece, even though they do not touch yet.${mark}`, meta };""",
"""      return { kicker: 'Checked by trying the other way', title: 'Far apart, but one piece',
        text: `The ringed tiles are in one piece, even though they do not touch yet: the solver tried them in different pieces, and the rules could not all be met that way.${mark}`, meta };""")
src = rep(src, """    if(st.kind === 'probe' || st.kind === 'search'){
      const assumed = st.value === 'wall' ? 'same' : 'wall';
      const lead = assumed === 'wall' ? 'Suppose there were a wall at the outlined edge.' : 'Suppose the two tiles on either side of the outlined edge were in the same piece (no wall between them).';
      const concl = st.value === 'same' ? 'So there is no wall: the two tiles are in one piece.' : 'So there must be a wall between the two tiles.';
      if(st.kind === 'probe'){
        const why = stepWhyText(st.why);
        return { kicker: 'Proof by contradiction', title: assumed === 'wall' ? 'A wall here is impossible' : 'No wall here is impossible',
          text: `${lead} ${why ? `Following the rules from there, this breaks: ${why}.` : 'Following the rules from there leads to a contradiction.'} ${concl}`, meta };
      }
      return { kicker: 'Proof by exhaustive search', title: assumed === 'wall' ? 'A wall here is impossible' : 'No wall here is impossible',
        text: `${lead} The solver searched every way to continue around this spot and none works. This is a brute-force check, so there is no short rule to quote. ${concl}`, meta };
    }""",
"""    if(st.kind === 'probe' || st.kind === 'search'){                   // V1.0.10: what is true first, then what the other way gave
      const same = st.value === 'same';
      const title = same ? 'These two tiles are in one piece' : 'There is a wall here';
      const concl = same ? 'The two tiles at the outlined edge are in one piece.' : 'There is a wall at the outlined edge.';
      const other = same ? 'a wall there' : 'the two tiles in one piece';
      if(st.kind === 'probe'){
        let why = stepWhyText(st.why).trim().replace(/\\.+$/, '');
        if(/^[A-Z][a-z]/.test(why)) why = why[0].toLowerCase() + why.slice(1);
        return { kicker: 'Checked by trying the other way', title,
          text: `${concl} The solver tried ${other} instead and found that ${why || 'the rules could not all be met'}.`, meta };
      }
      return { kicker: 'Checked by search', title,
        text: `${concl} The solver tried every way to go on with ${other} instead, and none of them works out. This is a brute-force check, so there is no short rule to quote.`, meta };
    }""")
src = rep(src, """      body = onlyLinks ? (why ? `A wall here would break a rule (${why}), so these tiles are in one piece.` : 'These tiles have to be in one piece.')
                       : (why ? `Joining these groups would break a rule (${why}), so there is a wall between them.` : 'This follows from the rules already used.');""",
"""      body = onlyLinks ? (why ? `These tiles are in one piece: a wall here would break a rule (${why}).` : 'These tiles are in one piece.')
                       : (why ? `There is a wall between these groups: joining them would break a rule (${why}).` : 'This follows from the rules already used.');""")
# rule titles and texts that were double negatives
for old, new in [
    ("'Roses: same type never together'", "'Roses: one of each type per piece'"),
    ("'Solitude: two symbols never together'", "'Solitude: one symbol per piece'"),
    ("'Two symbols can never share a piece, so there is a wall between them.'", "'Each piece holds one symbol, so these two symbols are in different pieces, with a wall between them.'"),
    ("'If this edge were a wall, the group could not reach enough tiles to become a big enough piece, so the tiles are in one piece.'", "'The group needs this edge to reach enough tiles for a big enough piece, so the two tiles are in one piece.'"),
    ("'If this edge were a wall, the group could not reach the Minimum number of tiles, so the tiles are in one piece.'", "'The group needs this edge to reach the Minimum number of tiles, so the two tiles are in one piece.'"),
    ("'A wall here would leave the group no way to reach a rose it still needs (or only one that is too far away for the size limit), so the tiles are joined.'", "'The group still needs a rose, and this edge is its only way to one within the size limit, so the tiles are joined.'"),
    ("'A wall here would cut the group off from every symbol it could still reach, so the tiles are joined.'", "'This edge is the group\\u2019s only way to a symbol it can still reach, so the tiles are joined.'"),
    ("'Two stamps of the same shape cannot be two pieces (no two pieces may share a shape), so they are one piece.'", "'Two stamps of the same shape are in one piece, because no two pieces share a shape.'"),
    ("'Two groups that can only be the same shape cannot be two pieces (no two pieces may share a shape), so they are one piece.'", "'These two groups can only be the same shape, and no two pieces share a shape, so they are one piece.'"),
    ("'Two neighbouring tiles whose pieces are pinned to the same size cannot have a wall between them, because two touching pieces would be equal.'", "'The pieces of these two neighbouring tiles are pinned to the same size, and touching pieces always differ in size, so the two tiles are in one piece.'"),
    ("'Two neighbouring tiles whose pieces are pinned to the same shape cannot have a wall between them, because two touching pieces would be equal.'", "'The pieces of these two neighbouring tiles are pinned to the same shape, and touching pieces always differ in shape, so the two tiles are in one piece.'"),
    ("'Size Separation: no size in common'", "'Size Separation: different sizes'"),
    ("'These two groups have no size in common, so they cannot be one piece and there is a wall between them.'", "'These two groups can only end up with different sizes, so they are different pieces, with a wall between them.'"),
    ("'Mingle Shape: no shape in common'", "'Mingle Shape: different shapes'"),
    ("'These two groups have no shape in common, so they cannot be one piece and there is a wall between them.'", "'These two groups can only end up with different shapes, so they are different pieces, with a wall between them.'"),
    ("If it were a wall, each side would have to be covered by whole pieces of the allowed size, and that is impossible, so one piece crosses it.", "The two sides only work out with one piece crossing it, so the tiles are joined."),
    ("No shape of the bank can hold these tiles together, so there is a wall between them.", "Every bank shape is too small or the wrong shape to hold these tiles together, so there is a wall between them."),
    ("None does, so there is a wall.", "Every placement leaves one of them out, so there is a wall."),
    ("'Without this edge the compass piece could not reach enough tiles on one of its sides, so the tiles are joined.'", "'The compass piece needs this edge to reach enough tiles on one of its sides, so the tiles are joined.'"),
    ("'Without this tile or edge the region would have too few tiles on some side (or in total) for the compass numbers, so it is part of the piece.'", "'The compass piece needs this tile (or edge) to have enough tiles on some side, or in total, so it is part of the piece.'"),
    ("None holds this tile, so it is cut off by a wall.", "Every one of them leaves this tile out, so there is a wall."),
    ("A tile the compass piece can never reach lies across this open edge, so it is a wall.", "The tile across this edge is out of the compass piece\\u2019s reach, so there is a wall."),
    ("'Compass: a tile that cannot be in the piece'", "'Compass: this tile stays out'"),
    ("'Assuming this tile is in the piece of a compass breaks something, so it is kept out.'", "'Putting this tile in the compass piece would break a rule, so it belongs to another piece.'"),
    ("In none of them are these two groups in the same piece, so they are different pieces.", "In every one of them these two groups end up in different pieces."),
    ("A finished piece already has this size, so no other piece can have it.", "A finished piece already has this size, and each size is used only once."),
]:
    src = rep(src, old, new)
# steps of the clue grouping had no title of their own ("Rule: clue-apart")
src = rep(src, """  for(const k of Object.keys(STEP_INFO)) if(k.startsWith('mingle-area-')){""",
"""  // V1.0.10: the walls that follow from two clues (or two groups) proven to be in different pieces
  STEP_INFO['clue-apart'] = ['Two clues, two pieces', null, 'These two clues are in different pieces (the solver tried them in one piece, and the rules could not all be met that way), so there is a wall between their groups.', null];
  STEP_INFO['pair-apart'] = ['Two groups, two pieces', null, 'These two groups are in different pieces (the solver tried them as one piece, and the rules could not all be met that way), so there is a wall between them.', null];
  for(const k of Object.keys(STEP_INFO)) if(k.startsWith('mingle-area-')){""")
open(sys.argv[2], 'w', encoding='utf8').write(src); print('ok', sys.argv[2])
