# Glimmith corpus run

* puzzles in this report: **1225**   (runs merged: 1; the latest record of each puzzle counts)
* solver core: `solver-core.v132.js` (sha1 aecedaddf7c1), node v22.23.4, linux x64, 4 cores (Intel(R) Xeon(R) Processor @ 2.10GHz), jobs 3  (more than 1 job = timings are noisier)
* hard limit per puzzle: 60 s (worker killed 3 s after that); solver settings = the page's defaults: {"testMs":100,"restart":"continue","order":"clues","focusMode":"near","nearShare":0.4,"useWitness":true,"stopAtTwo":true,"nodeBudget":0}
* summed solver time: 13.7 min

How to read the edge columns: every edge that is not a hand-drawn wall is decided by exactly one of **instant** (first propagation, nothing assumed), **probe** (look-ahead: assume it, propagate, contradiction; still no search), **scan** ("wall per wall": a narrow exact search per edge, plus the edges that then follow by propagation; the column "proved by the search itself" counts only the edges the search settled directly) or is **left** for the final exact solver. The four shares are means over the puzzles of the row (percent of that puzzle's edges).

## Verdicts

| verdict | puzzles | meaning |
|---|---|---|
| UNIQUE | 1225 | the solver proved the stored solution is the only tiling |

## Time and edge split by zone and difficulty

| zone / difficulty | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Zone1 d1 | 55 | 25 | 63 | 101 | 214 | 3.9 | 98% | 2% | 0% | 0% | 0% |  |
| Zone1 d2 | 75 | 36 | 81 | 162 | 2764 | 10.9 | 85% | 12% | 1% | 0% | 3% |  |
| Zone1 d3 | 77 | 40 | 107 | 273 | 1703 | 15.4 | 72% | 21% | 0% | 0% | 8% |  |
| Zone1 d4 | 51 | 56 | 219 | 716 | 3309 | 18.2 | 60% | 31% | 0% | 0% | 9% |  |
| Zone1 d5 | 33 | 75 | 469 | 2295 | 14237 | 43.7 | 45% | 43% | 6% | 0% | 12% |  |
| Zone1 d6 | 15 | 98 | 518 | 6653 | 42153 | 67.7 | 46% | 26% | 12% | 0% | 27% |  |
| Zone1 d7 | 3 | 99 | 805 | 933 | 965 | 1.9 | 50% | 50% | 0% | 0% | 0% |  |
| Zone2 d1 | 48 | 21 | 64 | 91 | 112 | 3.2 | 95% | 5% | 0% | 0% | 0% |  |
| Zone2 d2 | 104 | 30 | 75 | 211 | 1067 | 12.7 | 67% | 29% | 0% | 0% | 5% |  |
| Zone2 d3 | 119 | 37 | 120 | 307 | 898 | 19.5 | 52% | 38% | 0% | 0% | 9% |  |
| Zone2 d4 | 86 | 47 | 173 | 817 | 27935 | 94.9 | 45% | 43% | 0% | 0% | 12% |  |
| Zone2 d5 | 47 | 60 | 278 | 959 | 5460 | 26.9 | 49% | 41% | 0% | 0% | 10% |  |
| Zone2 d6 | 26 | 78 | 603 | 3020 | 9050 | 36.2 | 36% | 49% | 0% | 0% | 15% |  |
| Zone2 d7 | 8 | 90 | 1497 | 4999 | 8129 | 19.7 | 27% | 45% | 0% | 0% | 28% |  |
| Zone3 d1 | 45 | 17 | 54 | 73 | 143 | 2.6 | 94% | 6% | 0% | 0% | 0% |  |
| Zone3 d2 | 103 | 31 | 74 | 238 | 591 | 11.8 | 73% | 23% | 0% | 0% | 4% |  |
| Zone3 d3 | 114 | 43 | 154 | 622 | 9714 | 42.7 | 66% | 27% | 0% | 0% | 6% |  |
| Zone3 d4 | 84 | 55 | 276 | 2193 | 23811 | 97.5 | 48% | 38% | 0% | 0% | 14% |  |
| Zone3 d5 | 56 | 74 | 540 | 3309 | 15307 | 93.0 | 37% | 53% | 0% | 0% | 9% |  |
| Zone3 d6 | 46 | 91 | 919 | 3506 | 11308 | 80.1 | 32% | 57% | 1% | 0% | 11% |  |
| Zone3 d7 | 30 | 113 | 2200 | 9502 | 21433 | 121.2 | 23% | 50% | 3% | 0% | 27% |  |

## By zone

| zone | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Zone1 | 309 | 46 | 107 | 777 | 42153 | 161.8 | 73% | 20% | 1% | 0% | 7% |  |
| Zone2 | 438 | 42 | 120 | 703 | 27935 | 213.0 | 57% | 34% | 0% | 0% | 8% |  |
| Zone3 | 478 | 53 | 187 | 1990 | 23811 | 448.9 | 58% | 34% | 0% | 0% | 9% |  |

## By difficulty (all zones)

| difficulty | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| d1 | 148 | 21 | 63 | 91 | 214 | 9.8 | 96% | 4% | 0% | 0% | 0% |  |
| d2 | 282 | 32 | 77 | 194 | 2764 | 35.5 | 74% | 22% | 0% | 0% | 4% |  |
| d3 | 310 | 40 | 129 | 397 | 9714 | 77.6 | 62% | 30% | 0% | 0% | 8% |  |
| d4 | 221 | 52 | 226 | 1093 | 27935 | 210.6 | 50% | 38% | 0% | 0% | 12% |  |
| d5 | 136 | 69 | 429 | 2186 | 15307 | 163.5 | 43% | 47% | 1% | 0% | 10% |  |
| d6 | 87 | 88 | 737 | 4221 | 42153 | 184.0 | 36% | 50% | 3% | 0% | 15% |  |
| d7 | 41 | 107 | 1653 | 9303 | 21433 | 142.7 | 26% | 49% | 2% | 0% | 25% |  |

## By mechanic (the game's category)

| category | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Zone1 1-single-shape | 11 | 17 | 48 | 65 | 71 | 0.5 | 91% | 9% | 0% | 0% | 0% |  |
| Zone1 2-shape-bank | 11 | 33 | 61 | 71 | 209 | 0.8 | 100% | 0% | 0% | 0% | 0% |  |
| Zone1 3-gemini-delta | 8 | 26 | 82 | 126 | 158 | 0.7 | 100% | 0% | 0% | 0% | 0% |  |
| Zone1 4-slash-pack | 5 | 25 | 74 | 81 | 84 | 0.3 | 100% | 0% | 0% | 0% | 0% |  |
| Zone1 5-shape-bank | 31 | 63 | 94 | 259 | 377 | 4.0 | 97% | 3% | 0% | 0% | 0% |  |
| Zone1 6-gemini-delta | 33 | 40 | 136 | 518 | 3499 | 12.4 | 74% | 20% | 3% | 0% | 6% |  |
| Zone1 7-slash-pack | 36 | 48 | 105 | 371 | 42153 | 48.8 | 89% | 10% | 0% | 0% | 1% |  |
| Zone1 8-poly | 39 | 42 | 73 | 123 | 805 | 4.0 | 87% | 13% | 0% | 0% | 0% |  |
| Zone1 9-region-size-x | 44 | 44 | 116 | 1037 | 8036 | 27.3 | 58% | 31% | 6% | 0% | 11% |  |
| Zone1 10-same-shape-no-touch | 41 | 45 | 194 | 1230 | 4578 | 21.7 | 47% | 38% | 2% | 0% | 15% |  |
| Zone1 11-mixed-rules | 50 | 60 | 232 | 1711 | 14237 | 41.3 | 55% | 31% | 0% | 0% | 14% |  |
| Zone2 1-area-numbers | 43 | 43 | 93 | 917 | 7164 | 20.0 | 59% | 37% | 0% | 0% | 4% |  |
| Zone2 2-palisade | 60 | 41 | 77 | 219 | 1046 | 7.4 | 82% | 17% | 0% | 0% | 1% |  |
| Zone2 3-all-regions-same | 28 | 41 | 196 | 751 | 2340 | 11.2 | 18% | 43% | 0% | 0% | 39% |  |
| Zone2 4-all-regions-different | 48 | 33 | 129 | 450 | 2905 | 12.0 | 72% | 23% | 0% | 0% | 5% |  |
| Zone2 5-minmax | 46 | 41 | 139 | 543 | 14586 | 25.2 | 57% | 32% | 0% | 0% | 11% |  |
| Zone2 6-same-size-no-touch | 45 | 43 | 99 | 673 | 16379 | 28.6 | 59% | 33% | 0% | 0% | 9% |  |
| Zone2 7-1SPR | 37 | 43 | 140 | 871 | 2422 | 13.1 | 47% | 45% | 0% | 0% | 8% |  |
| Zone2 8-all-rectangles | 40 | 46 | 136 | 699 | 6930 | 22.9 | 78% | 19% | 0% | 0% | 3% |  |
| Zone2 9-no-rectangles | 43 | 38 | 145 | 654 | 9050 | 21.2 | 27% | 65% | 0% | 0% | 8% |  |
| Zone2 10-zone2-mixed | 48 | 48 | 146 | 954 | 27935 | 51.3 | 50% | 40% | 0% | 0% | 10% |  |
| Zone3 1-tatami | 70 | 44 | 125 | 371 | 2891 | 19.3 | 60% | 31% | 1% | 0% | 8% |  |
| Zone3 2-loopy | 58 | 61 | 119 | 657 | 13759 | 28.8 | 61% | 34% | 0% | 0% | 5% |  |
| Zone3 3-vertex-radar | 59 | 44 | 156 | 836 | 9714 | 33.7 | 50% | 44% | 1% | 0% | 6% |  |
| Zone3 4-difference | 53 | 38 | 172 | 878 | 9294 | 30.6 | 46% | 35% | 0% | 0% | 19% |  |
| Zone3 5-inequality | 56 | 39 | 146 | 780 | 2756 | 20.4 | 52% | 41% | 1% | 0% | 6% |  |
| Zone3 6-compass | 34 | 29 | 64 | 134 | 14812 | 20.7 | 95% | 5% | 0% | 0% | 0% |  |
| Zone3 6-compass-main | 66 | 56 | 582 | 4599 | 13367 | 100.8 | 76% | 16% | 0% | 0% | 8% |  |
| Zone3 7-finalboss | 1 | 176 | 1601 | 1601 | 1601 | 1.6 | 51% | 49% | 0% | 0% | 0% |  |
| Zone3 7-zone3-mixed | 47 | 64 | 428 | 2364 | 23811 | 79.5 | 44% | 48% | 0% | 0% | 8% |  |
| Zone3 8-endgame | 34 | 113 | 1339 | 9410 | 21433 | 113.5 | 33% | 49% | 3% | 0% | 18% |  |

## By feature tag (a puzzle counts once per tag it has)

| feature | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| area | 219 | 47 | 128 | 1759 | 16379 | 179.2 | 52% | 41% | 0% | 0% | 8% |  |
| bank | 235 | 49 | 106 | 714 | 4112 | 68.1 | 81% | 14% | 1% | 0% | 4% |  |
| compass | 128 | 52 | 385 | 3747 | 15307 | 172.4 | 77% | 18% | 0% | 0% | 6% |  |
| palisade | 169 | 51 | 110 | 568 | 27935 | 94.2 | 63% | 33% | 0% | 0% | 3% |  |
| rose | 179 | 56 | 231 | 1783 | 42153 | 188.1 | 60% | 28% | 0% | 0% | 12% |  |
| stamp | 171 | 53 | 123 | 1229 | 14237 | 98.5 | 59% | 33% | 0% | 0% | 9% |  |
| wall-delta | 98 | 49 | 223 | 1659 | 9050 | 70.2 | 62% | 26% | 4% | 0% | 12% |  |
| wall-diff | 69 | 46 | 205 | 934 | 9294 | 39.4 | 42% | 42% | 0% | 0% | 16% |  |
| wall-gemini | 116 | 49 | 274 | 1939 | 21433 | 120.1 | 55% | 30% | 3% | 0% | 16% |  |
| wall-gt | 67 | 46 | 190 | 1202 | 23811 | 50.4 | 45% | 49% | 1% | 0% | 6% |  |
| wall-lt | 64 | 46 | 191 | 1057 | 23811 | 48.7 | 50% | 44% | 1% | 0% | 6% |  |
| wall-plain | 387 | 47 | 131 | 1059 | 42153 | 312.8 | 58% | 31% | 1% | 0% | 11% |  |
| watchtower | 85 | 55 | 215 | 2198 | 23811 | 91.4 | 48% | 44% | 2% | 0% | 8% |  |

## The 30 slowest puzzles

| id | category | diff | size | tiles | total s | ctx / instant / probe / scan / final (s) | instant | probe | scan | left | tests | verdict |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Zone1/1434 | 7-slash-pack | 6 | 15x15 | 172 | 42.2 | 0.03 / 0.26 / 7.81 / 0.00 / 34.0 | 17% | 35% | 0% | 48% | 0 | UNIQUE |
| Zone2/0864b | 10-zone2-mixed | 4 | 10x10 | 72 | 27.9 | 0.00 / 2.31 / 0.64 / 0.00 / 25.0 | 13% | 11% | 0% | 76% | 60 | UNIQUE |
| Zone3/1137 | 7-zone3-mixed | 4 | 11x9 | 99 | 23.8 | 0.02 / 0.14 / 2.92 / 0.00 / 20.7 | 27% | 2% | 0% | 71% | 0 | UNIQUE |
| Zone3/1248 | 8-endgame | 7 | 10x10 | 100 | 21.4 | 0.00 / 0.14 / 1.77 / 0.00 / 19.5 | 0% | 0% | 0% | 100% | 60 | UNIQUE |
| Zone2/1356 | 6-same-size-no-touch | 4 | 7x7 | 49 | 16.4 | 0.01 / 0.01 / 0.11 / 0.00 / 16.2 | 0% | 0% | 0% | 100% | 0 | UNIQUE |
| Zone3/0631 | 7-zone3-mixed | 5 | 12x12 | 117 | 15.3 | 0.09 / 1.48 / 13.7 / 0.00 / 0.02 | 20% | 80% | 0% | 0% | 0 | UNIQUE |
| Zone3/1395b | 6-compass | 5 | 14x16 | 138 | 14.8 | 0.14 / 0.78 / 13.8 / 0.00 / 0.02 | 7% | 93% | 0% | 0% | 0 | UNIQUE |
| Zone2/1346 | 5-minmax | 4 | 6x6 | 36 | 14.6 | 0.00 / 0.02 / 0.07 / 0.00 / 14.5 | 2% | 0% | 0% | 98% | 60 | UNIQUE |
| Zone1/1100 | 11-mixed-rules | 5 | 13x13 | 96 | 14.2 | 0.01 / 0.11 / 6.16 / 0.00 / 7.93 | 20% | 7% | 0% | 74% | 0 | UNIQUE |
| Zone3/0970 | 2-loopy | 4 | 16x13 | 115 | 13.8 | 0.00 / 0.04 / 0.78 / 0.00 / 12.9 | 19% | 2% | 0% | 79% | 61 | UNIQUE |
| Zone3/0208 | 8-endgame | 7 | 13x14 | 90 | 13.5 | 0.02 / 0.27 / 4.01 / 0.00 / 9.15 | 0% | 1% | 0% | 99% | 60 | UNIQUE |
| Zone3/1086 | 6-compass-main | 5 | 7x7 | 49 | 13.4 | 0.00 / 3.24 / 9.22 / 0.00 / 0.89 | 7% | 2% | 0% | 90% | 0 | UNIQUE |
| Zone3/1085a | 8-endgame | 6 | 12x12 | 144 | 11.3 | 0.02 / 0.09 / 10.1 / 0.00 / 1.13 | 3% | 65% | 0% | 31% | 0 | UNIQUE |
| Zone3/1258 | 6-compass-main | 7 | 13x13 | 169 | 9.92 | 0.05 / 0.81 / 9.02 / 0.00 / 0.02 | 19% | 81% | 0% | 0% | 0 | UNIQUE |
| Zone3/0999 | 3-vertex-radar | 3 | 14x14 | 196 | 9.71 | 0.03 / 0.15 / 1.40 / 0.00 / 8.12 | 55% | 0% | 45% | 45% | 0 | UNIQUE |
| Zone3/0975a | 8-endgame | 7 | 11x11 | 121 | 9.46 | 0.02 / 0.26 / 1.02 / 0.00 / 8.14 | 41% | 0% | 0% | 59% | 0 | UNIQUE |
| Zone3/1138 | 8-endgame | 7 | 11x11 | 121 | 9.30 | 0.00 / 0.05 / 2.49 / 0.00 / 6.74 | 2% | 0% | 98% | 98% | 0 | UNIQUE |
| Zone3/0930d-real | 4-difference | 7 | 13x13 | 91 | 9.29 | 0.03 / 0.05 / 0.48 / 0.00 / 8.72 | 10% | 0% | 0% | 90% | 60 | UNIQUE |
| Zone2/0850 | 9-no-rectangles | 6 | 7x7 | 49 | 9.05 | 0.01 / 0.03 / 0.62 / 0.00 / 8.36 | 0% | 25% | 0% | 75% | 60 | UNIQUE |
| Zone3/1110 | 7-zone3-mixed | 4 | 9x9 | 81 | 8.97 | 0.05 / 1.88 / 5.44 / 0.00 / 1.56 | 28% | 2% | 0% | 70% | 0 | UNIQUE |
| Zone3/0312 | 6-compass-main | 6 | 7x7 | 49 | 8.87 | 0.00 / 0.27 / 1.94 / 0.00 / 6.64 | 20% | 4% | 0% | 76% | 0 | UNIQUE |
| Zone2/1114 | 10-zone2-mixed | 7 | 10x9 | 86 | 8.13 | 0.01 / 0.16 / 7.40 / 0.00 / 0.54 | 27% | 40% | 0% | 33% | 0 | UNIQUE |
| Zone1/0116 | 9-region-size-x | 6 | 9x9 | 81 | 8.04 | 0.00 / 0.06 / 0.70 / 0.00 / 7.24 | 2% | 20% | 78% | 78% | 49 | UNIQUE |
| Zone3/1322 | 8-endgame | 6 | 12x12 | 97 | 7.72 | 0.00 / 0.03 / 3.27 / 0.00 / 4.40 | 1% | 10% | 0% | 89% | 0 | UNIQUE |
| Zone3/0928 | 4-difference | 6 | 9x7 | 63 | 7.44 | 0.00 / 3.33 / 2.51 / 0.00 / 1.57 | 20% | 2% | 0% | 78% | 0 | UNIQUE |
| Zone2/0745 | 1-area-numbers | 6 | 11x11 | 121 | 7.16 | 0.03 / 0.04 / 5.09 / 0.00 / 1.99 | 7% | 11% | 0% | 81% | 0 | UNIQUE |
| Zone2/1195 | 8-all-rectangles | 4 | 8x7 | 47 | 6.93 | 0.01 / 0.06 / 5.63 / 0.00 / 1.22 | 0% | 3% | 0% | 97% | 0 | UNIQUE |
| Zone3/0994 | 3-vertex-radar | 4 | 9x9 | 77 | 6.84 | 0.02 / 0.04 / 0.52 / 0.00 / 6.24 | 8% | 19% | 0% | 73% | 0 | UNIQUE |
| Zone3/0268 | 8-endgame | 7 | 15x15 | 200 | 6.13 | 0.00 / 0.17 / 3.99 / 0.00 / 1.94 | 20% | 38% | 0% | 42% | 0 | UNIQUE |
| Zone2/0832 | 8-all-rectangles | 5 | 8x7 | 56 | 5.46 | 0.01 / 0.16 / 5.26 / 0.00 / 0.02 | 13% | 87% | 0% | 0% | 0 | UNIQUE |

## Outliers: much slower per tile than their peers (same category and difficulty; at least 0.3 s, at least 4x the peer median)

| id | category | diff | tiles | total s | ms per tile | peer median ms per tile | x peers | left |
|---|---|---|---|---|---|---|---|---|
| Zone2/1356 | 6-same-size-no-touch | 4 | 49 | 16.4 | 334.3 | 2.3 | 142.4 | 100% |
| Zone2/0864b | 10-zone2-mixed | 4 | 72 | 27.9 | 388 | 4.3 | 90.3 | 76% |
| Zone1/1434 | 7-slash-pack | 6 | 172 | 42.2 | 245.1 | 3 | 81.2 | 48% |
| Zone2/1346 | 5-minmax | 4 | 36 | 14.6 | 405.2 | 6.8 | 59.6 | 98% |
| Zone3/1137 | 7-zone3-mixed | 4 | 99 | 23.8 | 240.5 | 5.6 | 43 | 71% |
| Zone2/0850 | 9-no-rectangles | 6 | 49 | 9.05 | 184.7 | 4.7 | 39.4 | 75% |
| Zone3/0970 | 2-loopy | 4 | 115 | 13.8 | 119.6 | 3.4 | 35.6 | 79% |
| Zone1/0116 | 9-region-size-x | 6 | 81 | 8.04 | 99.2 | 3.1 | 32 | 78% |
| Zone2/0832 | 8-all-rectangles | 5 | 56 | 5.46 | 97.5 | 3.4 | 28.5 | 0% |
| Zone3/1395b | 6-compass | 5 | 138 | 14.8 | 107.3 | 4 | 26.6 | 0% |
| Zone3/1086 | 6-compass-main | 5 | 49 | 13.4 | 272.8 | 10.6 | 25.7 | 90% |
| Zone3/0928 | 4-difference | 6 | 63 | 7.44 | 118.1 | 5.1 | 23.3 | 78% |
| Zone2/1114 | 10-zone2-mixed | 7 | 86 | 8.13 | 94.5 | 4.2 | 22.5 | 33% |
| Zone1/0030 | 9-region-size-x | 6 | 60 | 3.90 | 65 | 3.1 | 21 | 96% |
| Zone2/1352 | 6-same-size-no-touch | 5 | 40 | 2.16 | 54.1 | 2.6 | 20.5 | 94% |
| Zone3/0930d-real | 4-difference | 7 | 91 | 9.29 | 102.1 | 5.1 | 20.1 | 90% |
| Zone3/1110 | 7-zone3-mixed | 4 | 81 | 8.97 | 110.7 | 5.6 | 19.8 | 70% |
| Zone2/1195 | 8-all-rectangles | 4 | 47 | 6.93 | 147.5 | 7.5 | 19.7 | 97% |
| Zone2/0745 | 1-area-numbers | 6 | 121 | 7.16 | 59.2 | 3 | 19.7 | 81% |
| Zone3/0312 | 6-compass-main | 6 | 49 | 8.87 | 180.9 | 10.4 | 17.5 | 76% |
| Zone3/0994 | 3-vertex-radar | 4 | 77 | 6.84 | 88.9 | 5.3 | 16.8 | 73% |
| Zone3/1260 | 6-compass-main | 3 | 49 | 4.65 | 94.8 | 7 | 13.5 | 75% |
| Zone2/0010 | 8-all-rectangles | 4 | 36 | 3.30 | 91.6 | 7.5 | 12.2 | 0% |
| Zone3/1248 | 8-endgame | 7 | 100 | 21.4 | 214.3 | 18.1 | 11.8 | 100% |
| Zone1/0099 | 6-gemini-delta | 2 | 50 | 2.76 | 55.3 | 5.2 | 10.7 | 100% |
| Zone1/1100 | 11-mixed-rules | 5 | 96 | 14.2 | 148.3 | 13.9 | 10.7 | 74% |
| Zone3/0999 | 3-vertex-radar | 3 | 196 | 9.71 | 49.6 | 4.7 | 10.6 | 45% |
| Zone3/1084 | 6-compass-main | 5 | 48 | 5.36 | 111.6 | 10.6 | 10.5 | 76% |
| Zone3/0631 | 7-zone3-mixed | 5 | 117 | 15.3 | 130.8 | 12.5 | 10.5 | 0% |
| Zone2/1436 | 6-same-size-no-touch | 6 | 140 | 3.70 | 26.4 | 2.6 | 10 | 54% |

## The 20 puzzles with the largest share of edges left to the final solver

| id | category | diff | tiles | spots | left | left % | total s | final s | verdict |
|---|---|---|---|---|---|---|---|---|---|
| Zone1/0099 | 6-gemini-delta | 2 | 50 | 73 | 73 | 100% | 2.76 | 2.33 | UNIQUE |
| Zone1/0276 | 10-same-shape-no-touch | 3 | 16 | 13 | 13 | 100% | 0.14 | 0.03 | UNIQUE |
| Zone1/1065 | 10-same-shape-no-touch | 3 | 25 | 40 | 40 | 100% | 0.13 | 0.05 | UNIQUE |
| Zone1/0130 | 9-region-size-x | 4 | 36 | 46 | 46 | 100% | 0.62 | 0.32 | UNIQUE |
| Zone1/0528 | 6-gemini-delta | 4 | 54 | 72 | 72 | 100% | 1.17 | 0.73 | UNIQUE |
| Zone2/1177 | 3-all-regions-same | 2 | 18 | 27 | 27 | 100% | 0.13 | 0.03 | UNIQUE |
| Zone2/0372 | 3-all-regions-same | 3 | 18 | 22 | 22 | 100% | 0.11 | 0.07 | UNIQUE |
| Zone2/1120 | 10-zone2-mixed | 3 | 18 | 23 | 23 | 100% | 0.13 | 0.04 | UNIQUE |
| Zone2/1345 | 5-minmax | 3 | 25 | 34 | 34 | 100% | 0.38 | 0.29 | UNIQUE |
| Zone2/1348 | 5-minmax | 4 | 25 | 37 | 37 | 100% | 0.73 | 0.56 | UNIQUE |
| Zone2/1351 | 5-minmax | 4 | 35 | 54 | 54 | 100% | 1.14 | 1.05 | UNIQUE |
| Zone2/1356 | 6-same-size-no-touch | 4 | 49 | 68 | 68 | 100% | 16.4 | 16.2 | UNIQUE |
| Zone2/1365 | 3-all-regions-same | 4 | 52 | 83 | 83 | 100% | 0.71 | 0.35 | UNIQUE |
| Zone3/0893 | 4-difference | 2 | 16 | 22 | 22 | 100% | 0.14 | 0.02 | UNIQUE |
| Zone3/0493 | 7-zone3-mixed | 3 | 64 | 108 | 108 | 100% | 2.56 | 1.82 | UNIQUE |
| Zone3/1385 | 4-difference | 3 | 26 | 25 | 25 | 100% | 0.13 | 0.05 | UNIQUE |
| Zone3/1401 | 4-difference | 3 | 20 | 27 | 27 | 100% | 0.22 | 0.10 | UNIQUE |
| Zone3/1039 | 4-difference | 4 | 20 | 26 | 26 | 100% | 0.20 | 0.11 | UNIQUE |
| Zone3/1248 | 8-endgame | 7 | 100 | 179 | 179 | 100% | 21.4 | 19.5 | UNIQUE |
| Zone2/0960 | 3-all-regions-same | 7 | 92 | 158 | 157 | 99% | 1.65 | 0.14 | UNIQUE |

## Decided without any search: 1086 of 1225 puzzles (every edge by instant propagation or look-ahead; scan tests = 0, left = 0)

## Which rules decided the edges (all puzzles, edges per phase; `search` = proved by a narrow search)

| rule | instant | probe | scan |
|---|---|---|---|
| basic | 4679 | 5189 | 242 |
| bank-place | 8265 | 972 | 194 |
| stamp-place | 3559 | 1952 | 0 |
| label | 2813 | 2236 | 14 |
| size | 2285 | 2050 | 25 |
| size-cut | 2243 | 1381 | 67 |
| bridge-count | 2085 | 1324 | 7 |
| grow | 1530 | 1128 | 5 |
| boxy-place | 2133 | 501 | 0 |
| loo-outline | 1772 | 39 | 0 |
| compass | 1364 | 405 | 0 |
| pal-link | 1281 | 420 | 0 |
| euler-count | 964 | 600 | 25 |
| reach | 765 | 761 | 27 |
| gemini-place | 825 | 497 | 123 |
| mismatch-hall | 1315 | 114 | 0 |
| tower-link | 937 | 278 | 42 |
| pal-wall | 647 | 400 | 0 |
| mingle-area-place | 405 | 602 | 0 |
| size-range | 415 | 579 | 3 |
| rose-cut | 747 | 161 | 0 |
| tower-wall | 471 | 360 | 57 |
| min-reach | 402 | 316 | 0 |
| area-rel | 279 | 437 | 0 |
| loo-color | 292 | 412 | 0 |
| bank-fit | 480 | 141 | 4 |
| cmp-box | 602 | 0 | 0 |
| stamp-size | 309 | 274 | 0 |
| range-region | 152 | 404 | 1 |
| rose-pair | 340 | 216 | 0 |
| loo-corner | 132 | 422 | 0 |
| area-sum | 284 | 235 | 4 |
| mingle-area-merge | 292 | 228 | 0 |
| bri-three | 316 | 197 | 0 |
| box-hall | 353 | 141 | 0 |
| shape-fit | 170 | 269 | 0 |
| cmp-wrap | 313 | 84 | 0 |
| colour-count | 184 | 170 | 27 |
| boxy-corner | 252 | 128 | 0 |
| rose-grow | 294 | 78 | 0 |

Files: the .jsonl has everything per puzzle (per-rule counts per phase, scan test counts, final-search progress, wrong-edge examples); the .csv is the flat version of the main numbers.
