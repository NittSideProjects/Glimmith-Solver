# Timing of core v125 (V1.0.46) on the base game, same machine as a core v97 baseline

Both runs: `node tools/run_corpus.js --limit-s 60 --jobs 2`, cloud machine (Xeon 2.1 GHz, 4 cores). The author's last run (`corpus_run_userpass5`, core v93) was on another PC, about 1.85x faster for the same work, so it is not compared directly.

| run | unique | summed minutes | slowest |
|---|---|---|---|
| v97 baseline | 1225 | 12.5 | Zone1/1434 39.0 s |
| v125 | 1225 | 12.2 | Zone1/1434 33.6 s |

Median time ratio v125 / v97 per puzzle: 1.09. Over 10 s: v97 18, v125 14. Over 30 s: v97 1, v125 1.

Puzzles at least 2x slower than v97 (and over 2 s):

| puzzle | v97 s | v125 s | why |
|---|---|---|---|
| Zone2/0864b | 4.6 | 24.8 | run-to-run swing in the final slices (4.4 s in other v125 runs) |
| Zone2/0742 | 2.7 | 6.3 | the probes cost more per pass since v104 (piece count) and the later size / shape steps |
| Zone2/0850 | 2.0 | 9.9 | same search nodes, each about 1.6x the cost since v105 (tile sizes): the first 2 s edge slice runs out, the narrow searches then take 6 s |
| Zone2/0866 | 1.9 | 5.3 | the probes cost more per pass since v104 (piece count) and the later size / shape steps |
| Zone3/0262 | 1.1 | 2.5 | same as 0850, smaller |
| Zone3/0970 | 2.5 | 8.7 | run-to-run swing in the final slices (v97 itself gives 2.5 or 8.1 s) |
