# Timing of core v127 (V1.0.48) on the base game, against core v97 on the same machine

The author's last run (`corpus_run_userpass5`, core v93) was on another PC, about 1.85x faster for the same work; core v97 is the oldest core in the repository, so it is the baseline here.

## Full runs (`node tools/run_corpus.js --limit-s 60 --jobs 2`)

| run | unique | summed minutes | over 10 s | over 30 s | slowest |
|---|---|---|---|---|---|
| v97 baseline | 1225 | 12.5 | 18 | 1 | Zone1/1434 39.0 s |
| v127 | 1225 | 12.9 | 16 | 1 | Zone1/1434 35.3 s |

The two full runs were made hours apart, and the machine's speed drifts (core v97 run again later took 1.5x to 2x its baseline time on some puzzles), so a single full run is not a fair per-puzzle comparison.

## The puzzles that looked slower, timed fairly

Each puzzle alone (`--jobs 1`), v97 and v127 in turn, five rounds. Best and median of the five runs.

| puzzle | v97 best | v127 best | ratio | v97 median | v127 median | ratio | why slower |
|---|---|---|---|---|---|---|---|
| Zone1/1439 | 2.1 | 2.8 | 1.31 | 2.7 | 2.9 | 1.10 | more rules per pass |
| Zone2/0864b | 4.6 | 4.7 | 1.03 | 4.7 | 5.1 | 1.08 | same (the earlier gap was the slices or the machine) |
| Zone2/0742 | 2.7 | 3.3 | 1.23 | 3.0 | 3.6 | 1.21 | same (the earlier gap was the slices or the machine) |
| Zone2/0850 | 2.0 | 2.2 | 1.06 | 8.5 | 2.2 | 0.26 | same (the earlier gap was the slices or the machine) |
| Zone2/0866 | 2.0 | 3.2 | 1.55 | 2.1 | 3.3 | 1.56 | each propagation pass runs more rules (piece count, tile sizes and shapes) |
| Zone3/0262 | 1.0 | 2.0 | 1.95 | 1.0 | 2.2 | 2.06 | the label-join (V1.0.6) joins groups before the final search, which then visits 192 nodes instead of 64 |
| Zone3/0373 | 3.7 | 3.9 | 1.03 | 4.0 | 4.2 | 1.06 | same (the earlier gap was the slices or the machine) |
| Zone3/0970 | 8.7 | 8.7 | 1.00 | 8.9 | 8.8 | 0.98 | same (the earlier gap was the slices or the machine) |
| Zone3/1137 | 13.4 | 19.1 | 1.42 | 14.4 | 19.8 | 1.38 | the clue search runs about 20% slower per node (more rules per pass) |
| Zone3/1084 | 4.7 | 5.0 | 1.05 | 4.9 | 5.3 | 1.08 | same (the earlier gap was the slices or the machine) |
| Zone3/0268 | 2.8 | 5.3 | 1.90 | 3.1 | 5.4 | 1.76 | the probes decide 4 more edges than v97, so the probe loop runs another round (1233 probes instead of 643) |

Several puzzles swing between two times on both cores (Zone2/0864b 4.6 or 11 s on v97, 4.7 or 26 s on v127; Zone2/0850 2 or 8.5 s on v97): the final search runs in time slices, and a search that ends just after a slice boundary waits for the other searches' slices.
