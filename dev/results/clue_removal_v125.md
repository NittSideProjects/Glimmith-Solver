# Clue-removal check, core v125 (V1.0.46)

`node tools/clue_removal.js --per 12 --seed 1 --limit-s 60 --jobs 3`: up to 12 base-game puzzles per clue kind, one clue removed, solved by the page's pipeline (A) and the exact search (B), 60 s each.
A 'problem' would be: A finds no solution although the stored tiling still passes every rule, A calls it unique with another tiling, A's tilings break a rule, or A and B disagree.
| clue kind | cases | still unique | became non-unique | no solution (stored tiling breaks a rule) | solver timed out | exact search timed out | problems |
|---|---|---|---|---|---|---|---|
| roses | 12 | 1 | 1 | 10 | 0 | 2 | 0 |
| polyominoes | 12 | 1 | 11 | 0 | 0 | 5 | 0 |
| areaNumbers | 12 | 3 | 7 | 2 | 0 | 7 | 0 |
| palisades | 12 | 3 | 7 | 2 | 0 | 6 | 0 |
| compasses | 12 | 2 | 5 | 4 | 1 | 8 | 0 |
| watchtowers | 12 | 6 | 6 | 0 | 0 | 3 | 0 |
| wall | 12 | 2 | 10 | 0 | 0 | 2 | 0 |
| delta | 12 | 4 | 8 | 0 | 0 | 2 | 0 |
| gemini | 12 | 0 | 11 | 0 | 1 | 4 | 0 |
| ltgt | 12 | 2 | 10 | 0 | 0 | 5 | 0 |
| diff | 12 | 3 | 9 | 0 | 0 | 5 | 0 |

total 132 cases, 0 with a problem

Verdict pairs A/B: NONE/NONE 11, SEVERAL/SEVERAL 54, UNIQUE/UNIQUE 18; B timed out or killed (A alone checked): SEVERAL 31, UNIQUE 9, NONE 7; both timed out: 2 (a compass and a gemini removal).
