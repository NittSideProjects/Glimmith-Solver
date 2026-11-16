# Glimmith corpus run

* puzzles in this report: **1225**   (runs merged: 1; the latest record of each puzzle counts)
* solver core: `solver-core.v123.js` (sha1 67327551acdf), node v22.23.4, linux x64, 4 cores (Intel(R) Xeon(R) Processor @ 2.10GHz), jobs 3  (more than 1 job = timings are noisier)
* hard limit per puzzle: 60 s (worker killed 3 s after that); solver settings = the page's defaults: {"testMs":100,"restart":"continue","order":"clues","focusMode":"near","nearShare":0.4,"useWitness":true,"stopAtTwo":true,"nodeBudget":0}
* summed solver time: 16.2 min

How to read the edge columns: every edge that is not a hand-drawn wall is decided by exactly one of **instant** (first propagation, nothing assumed), **probe** (look-ahead: assume it, propagate, contradiction; still no search), **scan** ("wall per wall": a narrow exact search per edge, plus the edges that then follow by propagation; the column "proved by the search itself" counts only the edges the search settled directly) or is **left** for the final exact solver. The four shares are means over the puzzles of the row (percent of that puzzle's edges).

## Verdicts

| verdict | puzzles | meaning |
|---|---|---|
| UNIQUE | 1225 | the solver proved the stored solution is the only tiling |

## Time and edge split by zone and difficulty

| zone / difficulty | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Zone1 d1 | 55 | 25 | 65 | 111 | 251 | 4.2 | 97% | 3% | 0% | 0% | 0% |  |
| Zone1 d2 | 75 | 36 | 88 | 170 | 3026 | 13.1 | 82% | 15% | 2% | 0% | 3% |  |
| Zone1 d3 | 77 | 40 | 108 | 306 | 2064 | 16.3 | 70% | 21% | 0% | 0% | 9% |  |
| Zone1 d4 | 51 | 56 | 231 | 642 | 3251 | 18.4 | 60% | 31% | 0% | 0% | 9% |  |
| Zone1 d5 | 33 | 75 | 515 | 3434 | 14637 | 47.1 | 45% | 40% | 8% | 0% | 15% |  |
| Zone1 d6 | 15 | 98 | 531 | 6934 | 41000 | 68.3 | 46% | 26% | 12% | 0% | 27% |  |
| Zone1 d7 | 3 | 99 | 913 | 1000 | 1021 | 2.0 | 50% | 50% | 0% | 0% | 0% |  |
| Zone2 d1 | 48 | 21 | 57 | 87 | 115 | 3.0 | 95% | 5% | 0% | 0% | 0% |  |
| Zone2 d2 | 104 | 30 | 90 | 232 | 982 | 13.7 | 66% | 29% | 0% | 0% | 5% |  |
| Zone2 d3 | 119 | 37 | 141 | 340 | 1265 | 24.2 | 51% | 39% | 0% | 0% | 10% |  |
| Zone2 d4 | 86 | 47 | 187 | 924 | 32613 | 118.0 | 45% | 43% | 0% | 0% | 12% |  |
| Zone2 d5 | 47 | 60 | 266 | 1135 | 5590 | 27.8 | 48% | 41% | 0% | 0% | 10% |  |
| Zone2 d6 | 26 | 78 | 654 | 6472 | 11158 | 48.7 | 36% | 48% | 0% | 0% | 16% |  |
| Zone2 d7 | 8 | 90 | 1237 | 7089 | 8705 | 23.8 | 21% | 50% | 7% | 0% | 28% |  |
| Zone3 d1 | 45 | 17 | 52 | 77 | 172 | 2.7 | 94% | 6% | 0% | 0% | 0% |  |
| Zone3 d2 | 103 | 31 | 83 | 264 | 18852 | 41.0 | 71% | 24% | 0% | 0% | 5% |  |
| Zone3 d3 | 114 | 43 | 147 | 699 | 10042 | 45.0 | 66% | 28% | 0% | 0% | 6% |  |
| Zone3 d4 | 84 | 55 | 316 | 2649 | 36967 | 138.2 | 46% | 39% | 0% | 0% | 15% |  |
| Zone3 d5 | 56 | 74 | 615 | 3723 | 17089 | 99.0 | 36% | 55% | 0% | 0% | 9% |  |
| Zone3 d6 | 46 | 91 | 987 | 3952 | 15443 | 94.7 | 32% | 57% | 1% | 0% | 11% |  |
| Zone3 d7 | 30 | 113 | 2072 | 10126 | 21339 | 125.4 | 23% | 50% | 3% | 0% | 27% |  |

## By zone

| zone | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Zone1 | 309 | 46 | 111 | 767 | 41000 | 169.4 | 72% | 21% | 2% | 0% | 7% |  |
| Zone2 | 438 | 42 | 131 | 760 | 32613 | 259.2 | 57% | 35% | 0% | 0% | 9% |  |
| Zone3 | 478 | 53 | 192 | 2072 | 36967 | 546.0 | 57% | 34% | 0% | 0% | 9% |  |

## By difficulty (all zones)

| difficulty | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| d1 | 148 | 21 | 58 | 102 | 251 | 9.9 | 95% | 5% | 0% | 0% | 0% |  |
| d2 | 282 | 32 | 89 | 233 | 18852 | 67.8 | 72% | 24% | 1% | 0% | 4% |  |
| d3 | 310 | 40 | 136 | 479 | 10042 | 85.5 | 61% | 30% | 0% | 0% | 8% |  |
| d4 | 221 | 52 | 237 | 1222 | 36967 | 274.6 | 49% | 39% | 0% | 0% | 12% |  |
| d5 | 136 | 69 | 389 | 2374 | 17089 | 173.9 | 42% | 47% | 2% | 0% | 11% |  |
| d6 | 87 | 88 | 771 | 6251 | 41000 | 211.7 | 36% | 49% | 3% | 0% | 16% |  |
| d7 | 41 | 107 | 1730 | 9076 | 21339 | 151.2 | 25% | 50% | 4% | 0% | 25% |  |

## By mechanic (the game's category)

| category | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Zone1 1-single-shape | 11 | 17 | 57 | 68 | 71 | 0.6 | 91% | 9% | 0% | 0% | 0% |  |
| Zone1 2-shape-bank | 11 | 33 | 53 | 107 | 222 | 0.8 | 100% | 0% | 0% | 0% | 0% |  |
| Zone1 3-gemini-delta | 8 | 26 | 86 | 139 | 150 | 0.8 | 100% | 0% | 0% | 0% | 0% |  |
| Zone1 4-slash-pack | 5 | 25 | 53 | 83 | 91 | 0.3 | 100% | 0% | 0% | 0% | 0% |  |
| Zone1 5-shape-bank | 31 | 63 | 100 | 208 | 472 | 4.0 | 97% | 3% | 0% | 0% | 0% |  |
| Zone1 6-gemini-delta | 33 | 40 | 145 | 528 | 3167 | 12.6 | 74% | 20% | 3% | 0% | 6% |  |
| Zone1 7-slash-pack | 36 | 48 | 98 | 345 | 41000 | 51.5 | 89% | 7% | 2% | 0% | 4% |  |
| Zone1 8-poly | 39 | 42 | 76 | 144 | 913 | 4.2 | 87% | 13% | 0% | 0% | 0% |  |
| Zone1 9-region-size-x | 44 | 44 | 117 | 1062 | 8112 | 28.6 | 48% | 39% | 6% | 0% | 13% |  |
| Zone1 10-same-shape-no-touch | 41 | 45 | 174 | 1190 | 5048 | 22.9 | 47% | 38% | 4% | 0% | 15% |  |
| Zone1 11-mixed-rules | 50 | 60 | 283 | 1787 | 14637 | 43.1 | 54% | 31% | 0% | 0% | 15% |  |
| Zone2 1-area-numbers | 43 | 43 | 127 | 1327 | 9962 | 31.3 | 58% | 36% | 0% | 0% | 6% |  |
| Zone2 2-palisade | 60 | 41 | 94 | 267 | 1425 | 8.5 | 81% | 18% | 0% | 0% | 1% |  |
| Zone2 3-all-regions-same | 28 | 41 | 236 | 777 | 1899 | 10.2 | 18% | 43% | 0% | 0% | 39% |  |
| Zone2 4-all-regions-different | 48 | 33 | 156 | 455 | 4107 | 13.8 | 72% | 23% | 1% | 0% | 5% |  |
| Zone2 5-minmax | 46 | 41 | 138 | 715 | 15155 | 27.8 | 56% | 33% | 0% | 0% | 11% |  |
| Zone2 6-same-size-no-touch | 45 | 43 | 100 | 749 | 32613 | 46.9 | 59% | 33% | 0% | 0% | 9% |  |
| Zone2 7-1SPR | 37 | 43 | 154 | 941 | 2656 | 13.5 | 47% | 45% | 0% | 0% | 8% |  |
| Zone2 8-all-rectangles | 40 | 46 | 148 | 722 | 7588 | 23.9 | 78% | 19% | 0% | 0% | 3% |  |
| Zone2 9-no-rectangles | 43 | 38 | 162 | 803 | 11158 | 27.5 | 27% | 65% | 0% | 0% | 8% |  |
| Zone2 10-zone2-mixed | 48 | 48 | 161 | 887 | 31115 | 55.8 | 49% | 41% | 0% | 0% | 10% |  |
| Zone3 1-tatami | 70 | 44 | 117 | 464 | 2787 | 19.3 | 58% | 33% | 1% | 0% | 8% |  |
| Zone3 2-loopy | 58 | 61 | 118 | 695 | 9597 | 25.0 | 61% | 34% | 0% | 0% | 5% |  |
| Zone3 3-vertex-radar | 59 | 44 | 133 | 884 | 10042 | 35.1 | 47% | 47% | 1% | 0% | 6% |  |
| Zone3 4-difference | 53 | 38 | 174 | 925 | 15443 | 40.5 | 45% | 35% | 0% | 0% | 19% |  |
| Zone3 5-inequality | 56 | 39 | 163 | 804 | 4966 | 23.6 | 52% | 41% | 1% | 0% | 6% |  |
| Zone3 6-compass | 34 | 29 | 67 | 171 | 15823 | 22.2 | 95% | 5% | 0% | 0% | 0% |  |
| Zone3 6-compass-main | 66 | 56 | 731 | 7079 | 26855 | 173.1 | 75% | 16% | 0% | 0% | 9% |  |
| Zone3 7-finalboss | 1 | 176 | 1675 | 1675 | 1675 | 1.7 | 51% | 49% | 0% | 0% | 0% |  |
| Zone3 7-zone3-mixed | 47 | 64 | 401 | 2433 | 36967 | 96.3 | 43% | 47% | 0% | 0% | 10% |  |
| Zone3 8-endgame | 34 | 113 | 1661 | 8716 | 21339 | 109.2 | 33% | 48% | 3% | 0% | 19% |  |

## By feature tag (a puzzle counts once per tag it has)

| feature | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| area | 219 | 47 | 140 | 2137 | 32613 | 242.0 | 50% | 42% | 0% | 0% | 8% |  |
| bank | 235 | 49 | 115 | 760 | 4870 | 74.8 | 81% | 14% | 2% | 0% | 5% |  |
| compass | 128 | 52 | 394 | 5165 | 26855 | 251.5 | 76% | 17% | 0% | 0% | 7% |  |
| palisade | 169 | 51 | 121 | 637 | 31115 | 98.6 | 62% | 34% | 0% | 0% | 3% |  |
| rose | 179 | 56 | 267 | 1959 | 41000 | 222.1 | 59% | 27% | 1% | 0% | 13% |  |
| stamp | 171 | 53 | 152 | 1190 | 14637 | 106.5 | 58% | 33% | 0% | 0% | 9% |  |
| wall-delta | 98 | 49 | 253 | 2125 | 11158 | 94.9 | 62% | 26% | 4% | 0% | 13% |  |
| wall-diff | 69 | 46 | 219 | 1030 | 15443 | 49.8 | 41% | 44% | 0% | 0% | 16% |  |
| wall-gemini | 116 | 49 | 319 | 2204 | 21339 | 137.6 | 55% | 29% | 3% | 0% | 17% |  |
| wall-gt | 67 | 46 | 193 | 1204 | 36967 | 66.5 | 45% | 49% | 1% | 0% | 6% |  |
| wall-lt | 64 | 46 | 178 | 1132 | 36967 | 64.8 | 50% | 44% | 1% | 0% | 6% |  |
| wall-plain | 387 | 47 | 134 | 1152 | 41000 | 391.8 | 57% | 32% | 1% | 0% | 11% |  |
| watchtower | 85 | 55 | 200 | 2137 | 36967 | 105.9 | 45% | 45% | 2% | 0% | 10% |  |

## The 30 slowest puzzles

| id | category | diff | size | tiles | total s | ctx / instant / probe / scan / final (s) | instant | probe | scan | left | tests | verdict |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Zone1/1434 | 7-slash-pack | 6 | 15x15 | 172 | 41.0 | 0.02 / 0.25 / 5.86 / 0.00 / 34.9 | 17% | 35% | 0% | 48% | 0 | UNIQUE |
| Zone3/1137 | 7-zone3-mixed | 4 | 11x9 | 99 | 37.0 | 0.01 / 0.10 / 2.11 / 0.00 / 34.7 | 27% | 2% | 0% | 71% | 60 | UNIQUE |
| Zone2/1356 | 6-same-size-no-touch | 4 | 7x7 | 49 | 32.6 | 0.01 / 0.02 / 0.15 / 0.00 / 32.4 | 0% | 0% | 0% | 100% | 60 | UNIQUE |
| Zone2/0864b | 10-zone2-mixed | 4 | 10x10 | 72 | 31.1 | 0.00 / 2.49 / 0.58 / 0.00 / 28.0 | 13% | 11% | 0% | 76% | 60 | UNIQUE |
| Zone3/0373 | 6-compass-main | 4 | 6x6 | 36 | 26.9 | 0.01 / 1.56 / 1.02 / 0.00 / 24.2 | 2% | 0% | 2% | 98% | 60 | UNIQUE |
| Zone3/1248 | 8-endgame | 7 | 10x10 | 100 | 21.3 | 0.00 / 0.11 / 1.46 / 0.00 / 19.8 | 0% | 0% | 0% | 100% | 60 | UNIQUE |
| Zone3/1402 | 6-compass-main | 2 | 7x8 | 56 | 18.9 | 0.01 / 0.26 / 4.79 / 0.00 / 13.8 | 2% | 2% | 0% | 96% | 0 | UNIQUE |
| Zone3/0631 | 7-zone3-mixed | 5 | 12x12 | 117 | 17.1 | 0.07 / 1.68 / 15.3 / 0.00 / 0.02 | 20% | 80% | 0% | 0% | 0 | UNIQUE |
| Zone3/1258 | 6-compass-main | 7 | 13x13 | 169 | 16.4 | 0.04 / 1.03 / 15.3 / 0.00 / 0.02 | 19% | 81% | 0% | 0% | 0 | UNIQUE |
| Zone3/1395b | 6-compass | 5 | 14x16 | 138 | 15.8 | 0.18 / 0.90 / 14.7 / 0.00 / 0.03 | 7% | 93% | 0% | 0% | 0 | UNIQUE |
| Zone3/0928 | 4-difference | 6 | 9x7 | 63 | 15.4 | 0.00 / 3.12 / 2.88 / 0.00 / 9.42 | 20% | 2% | 0% | 78% | 60 | UNIQUE |
| Zone2/1346 | 5-minmax | 4 | 6x6 | 36 | 15.2 | 0.00 / 0.02 / 0.09 / 0.00 / 15.0 | 2% | 0% | 0% | 98% | 60 | UNIQUE |
| Zone1/1100 | 11-mixed-rules | 5 | 13x13 | 96 | 14.6 | 0.01 / 0.10 / 5.86 / 0.00 / 8.66 | 20% | 7% | 0% | 74% | 0 | UNIQUE |
| Zone3/0208 | 8-endgame | 7 | 13x14 | 90 | 13.6 | 0.02 / 0.24 / 4.19 / 0.00 / 9.18 | 0% | 1% | 0% | 99% | 60 | UNIQUE |
| Zone3/0312 | 6-compass-main | 6 | 7x7 | 49 | 13.4 | 0.01 / 0.28 / 2.50 / 0.00 / 10.6 | 20% | 4% | 0% | 76% | 0 | UNIQUE |
| Zone3/1086 | 6-compass-main | 5 | 7x7 | 49 | 12.4 | 0.00 / 3.34 / 8.10 / 0.00 / 0.98 | 7% | 1% | 0% | 92% | 0 | UNIQUE |
| Zone3/1085a | 8-endgame | 6 | 12x12 | 144 | 11.2 | 0.02 / 0.09 / 9.67 / 0.00 / 1.37 | 3% | 65% | 0% | 31% | 0 | UNIQUE |
| Zone2/0850 | 9-no-rectangles | 6 | 7x7 | 49 | 11.2 | 0.02 / 0.03 / 0.61 / 0.00 / 10.5 | 0% | 25% | 0% | 75% | 60 | UNIQUE |
| Zone3/0999 | 3-vertex-radar | 3 | 14x14 | 196 | 10.0 | 0.03 / 0.14 / 1.38 / 0.00 / 8.48 | 55% | 0% | 45% | 45% | 0 | UNIQUE |
| Zone2/0745 | 1-area-numbers | 6 | 11x11 | 121 | 9.96 | 0.06 / 0.04 / 5.28 / 0.00 / 4.55 | 7% | 11% | 0% | 81% | 0 | UNIQUE |
| Zone3/0930d-real | 4-difference | 7 | 13x13 | 91 | 9.74 | 0.04 / 0.07 / 0.44 / 0.00 / 9.17 | 10% | 0% | 0% | 90% | 60 | UNIQUE |
| Zone3/0970 | 2-loopy | 4 | 16x13 | 115 | 9.60 | 0.00 / 0.06 / 0.68 / 0.00 / 8.83 | 19% | 2% | 0% | 79% | 61 | UNIQUE |
| Zone3/1110 | 7-zone3-mixed | 4 | 9x9 | 81 | 9.51 | 0.05 / 1.94 / 5.82 / 0.00 / 1.67 | 28% | 2% | 0% | 70% | 0 | UNIQUE |
| Zone3/1232 | 6-compass-main | 2 | 5x5 | 23 | 9.29 | 0.01 / 9.26 / 0.00 / 0.00 / 0.01 | 100% | 0% | 0% | 0% | 0 | UNIQUE |
| Zone3/1138 | 8-endgame | 7 | 11x11 | 121 | 9.08 | 0.00 / 0.05 / 2.28 / 0.00 / 6.71 | 2% | 0% | 98% | 98% | 0 | UNIQUE |
| Zone2/1114 | 10-zone2-mixed | 7 | 10x9 | 86 | 8.71 | 0.01 / 0.21 / 7.85 / 0.00 / 0.62 | 27% | 40% | 0% | 33% | 0 | UNIQUE |
| Zone2/0742 | 1-area-numbers | 6 | 12x12 | 112 | 8.24 | 0.05 / 0.18 / 6.26 / 0.00 / 1.72 | 23% | 47% | 0% | 30% | 0 | UNIQUE |
| Zone1/0116 | 9-region-size-x | 6 | 9x9 | 81 | 8.11 | 0.00 / 0.06 / 0.62 / 0.00 / 7.39 | 2% | 20% | 78% | 78% | 49 | UNIQUE |
| Zone3/1322 | 8-endgame | 6 | 12x12 | 97 | 7.88 | 0.00 / 0.04 / 3.42 / 0.00 / 4.39 | 1% | 10% | 0% | 89% | 0 | UNIQUE |
| Zone3/1080 | 6-compass-main | 7 | 10x10 | 100 | 7.76 | 0.02 / 0.36 / 7.35 / 0.00 / 0.01 | 11% | 89% | 0% | 0% | 0 | UNIQUE |

## Outliers: much slower per tile than their peers (same category and difficulty; at least 0.3 s, at least 4x the peer median)

| id | category | diff | tiles | total s | ms per tile | peer median ms per tile | x peers | left |
|---|---|---|---|---|---|---|---|---|
| Zone2/1356 | 6-same-size-no-touch | 4 | 49 | 32.6 | 665.6 | 2.4 | 276.5 | 100% |
| Zone2/0864b | 10-zone2-mixed | 4 | 72 | 31.1 | 432.2 | 4.3 | 100.6 | 76% |
| Zone1/1434 | 7-slash-pack | 6 | 172 | 41.0 | 238.4 | 3.1 | 75.9 | 48% |
| Zone3/1232 | 6-compass-main | 2 | 23 | 9.29 | 403.8 | 6.6 | 60.9 | 0% |
| Zone3/1137 | 7-zone3-mixed | 4 | 99 | 37.0 | 373.4 | 6.4 | 58.1 | 71% |
| Zone2/1346 | 5-minmax | 4 | 36 | 15.2 | 421 | 8.1 | 52.2 | 98% |
| Zone3/0373 | 6-compass-main | 4 | 36 | 26.9 | 746 | 14.5 | 51.4 | 98% |
| Zone3/1402 | 6-compass-main | 2 | 56 | 18.9 | 336.6 | 6.6 | 50.7 | 96% |
| Zone2/0850 | 9-no-rectangles | 6 | 49 | 11.2 | 227.7 | 4.8 | 47 | 75% |
| Zone3/0928 | 4-difference | 6 | 63 | 15.4 | 245.1 | 5.5 | 44.2 | 78% |
| Zone1/0116 | 9-region-size-x | 6 | 81 | 8.11 | 100.1 | 3.3 | 30.1 | 78% |
| Zone3/0970 | 2-loopy | 4 | 115 | 9.60 | 83.4 | 2.8 | 29.4 | 79% |
| Zone2/0832 | 8-all-rectangles | 5 | 56 | 5.59 | 99.8 | 3.6 | 27.6 | 0% |
| Zone1/0030 | 9-region-size-x | 6 | 60 | 5.17 | 86.1 | 3.3 | 25.9 | 96% |
| Zone3/1395b | 6-compass | 5 | 138 | 15.8 | 114.7 | 4.5 | 25.6 | 0% |
| Zone2/1114 | 10-zone2-mixed | 7 | 86 | 8.71 | 101.2 | 4.2 | 23.8 | 33% |
| Zone3/0312 | 6-compass-main | 6 | 49 | 13.4 | 273.3 | 13.2 | 20.7 | 76% |
| Zone3/1086 | 6-compass-main | 5 | 49 | 12.4 | 253.9 | 12.5 | 20.3 | 92% |
| Zone2/0745 | 1-area-numbers | 6 | 121 | 9.96 | 82.3 | 4.2 | 19.5 | 81% |
| Zone3/0930d-real | 4-difference | 7 | 91 | 9.74 | 107 | 5.5 | 19.3 | 90% |
| Zone2/1352 | 6-same-size-no-touch | 5 | 40 | 2.25 | 56.3 | 2.9 | 19.2 | 94% |
| Zone3/1110 | 7-zone3-mixed | 4 | 81 | 9.51 | 117.4 | 6.4 | 18.3 | 70% |
| Zone2/0742 | 1-area-numbers | 6 | 112 | 8.24 | 73.6 | 4.2 | 17.5 | 30% |
| Zone1/1236 | 7-slash-pack | 5 | 90 | 4.87 | 54.1 | 3.1 | 17.2 | 84% |
| Zone3/1260 | 6-compass-main | 3 | 49 | 6.40 | 130.6 | 7.7 | 17 | 75% |
| Zone2/1195 | 8-all-rectangles | 4 | 47 | 7.59 | 161.4 | 10 | 16.2 | 97% |
| Zone3/0994 | 3-vertex-radar | 4 | 77 | 6.74 | 87.5 | 5.9 | 14.7 | 73% |
| Zone3/0999 | 3-vertex-radar | 3 | 196 | 10.0 | 51.2 | 3.6 | 14.4 | 45% |
| Zone2/0349 | 4-all-regions-different | 7 | 60 | 4.11 | 68.4 | 5.6 | 12.2 | 57% |
| Zone2/1436 | 6-same-size-no-touch | 6 | 140 | 4.70 | 33.6 | 2.9 | 11.4 | 54% |

## The 20 puzzles with the largest share of edges left to the final solver

| id | category | diff | tiles | spots | left | left % | total s | final s | verdict |
|---|---|---|---|---|---|---|---|---|---|
| Zone1/0099 | 6-gemini-delta | 2 | 50 | 73 | 73 | 100% | 2.87 | 2.43 | UNIQUE |
| Zone1/0276 | 10-same-shape-no-touch | 3 | 16 | 13 | 13 | 100% | 0.12 | 0.05 | UNIQUE |
| Zone1/1065 | 10-same-shape-no-touch | 3 | 25 | 40 | 40 | 100% | 0.18 | 0.06 | UNIQUE |
| Zone1/0130 | 9-region-size-x | 4 | 36 | 46 | 46 | 100% | 0.59 | 0.39 | UNIQUE |
| Zone1/0528 | 6-gemini-delta | 4 | 54 | 72 | 72 | 100% | 1.16 | 0.77 | UNIQUE |
| Zone2/1177 | 3-all-regions-same | 2 | 18 | 27 | 27 | 100% | 0.12 | 0.03 | UNIQUE |
| Zone2/0372 | 3-all-regions-same | 3 | 18 | 22 | 22 | 100% | 0.11 | 0.04 | UNIQUE |
| Zone2/1120 | 10-zone2-mixed | 3 | 18 | 23 | 23 | 100% | 0.16 | 0.03 | UNIQUE |
| Zone2/1345 | 5-minmax | 3 | 25 | 34 | 34 | 100% | 0.48 | 0.37 | UNIQUE |
| Zone2/1348 | 5-minmax | 4 | 25 | 37 | 37 | 100% | 0.96 | 0.79 | UNIQUE |
| Zone2/1351 | 5-minmax | 4 | 35 | 54 | 54 | 100% | 1.30 | 1.19 | UNIQUE |
| Zone2/1356 | 6-same-size-no-touch | 4 | 49 | 68 | 68 | 100% | 32.6 | 32.4 | UNIQUE |
| Zone2/1365 | 3-all-regions-same | 4 | 52 | 83 | 83 | 100% | 0.54 | 0.34 | UNIQUE |
| Zone3/0893 | 4-difference | 2 | 16 | 22 | 22 | 100% | 0.13 | 0.02 | UNIQUE |
| Zone3/0493 | 7-zone3-mixed | 3 | 64 | 108 | 108 | 100% | 2.48 | 1.89 | UNIQUE |
| Zone3/1385 | 4-difference | 3 | 26 | 25 | 25 | 100% | 0.14 | 0.07 | UNIQUE |
| Zone3/1401 | 4-difference | 3 | 20 | 27 | 27 | 100% | 0.20 | 0.12 | UNIQUE |
| Zone3/0776 | 7-zone3-mixed | 4 | 25 | 40 | 40 | 100% | 1.58 | 0.51 | UNIQUE |
| Zone3/1039 | 4-difference | 4 | 20 | 26 | 26 | 100% | 0.17 | 0.10 | UNIQUE |
| Zone3/1248 | 8-endgame | 7 | 100 | 179 | 179 | 100% | 21.3 | 19.8 | UNIQUE |

## Decided without any search: 1079 of 1225 puzzles (every edge by instant propagation or look-ahead; scan tests = 0, left = 0)

## Which rules decided the edges (all puzzles, edges per phase; `search` = proved by a narrow search)

| rule | instant | probe | scan |
|---|---|---|---|
| bank-place | 8409 | 918 | 332 |
| basic | 4323 | 4954 | 237 |
| stamp-place | 3521 | 1969 | 0 |
| label | 2772 | 2236 | 44 |
| size | 2133 | 2126 | 36 |
| size-cut | 2142 | 1621 | 73 |
| bridge-count | 2055 | 1355 | 9 |
| grow | 1747 | 1338 | 21 |
| boxy-place | 2141 | 501 | 0 |
| loo-outline | 1772 | 39 | 0 |
| compass | 1298 | 407 | 0 |
| pal-link | 1269 | 420 | 0 |
| euler-count | 941 | 637 | 32 |
| mismatch-hall | 1346 | 108 | 47 |
| gemini-place | 828 | 467 | 114 |
| reach | 662 | 651 | 26 |
| tower-link | 938 | 277 | 42 |
| pal-wall | 640 | 404 | 0 |
| mingle-area-place | 410 | 613 | 0 |
| size-range | 399 | 576 | 2 |
| rose-cut | 747 | 170 | 0 |
| tower-wall | 471 | 355 | 57 |
| area-rel | 277 | 440 | 0 |
| loo-color | 290 | 415 | 0 |
| range-region | 144 | 476 | 1 |
| cmp-box | 602 | 0 | 0 |
| bank-fit | 457 | 130 | 7 |
| stamp-size | 307 | 269 | 0 |
| mingle-area-merge | 295 | 259 | 0 |
| rose-pair | 337 | 216 | 0 |
| loo-corner | 125 | 417 | 0 |
| bri-three | 310 | 218 | 0 |
| area-sum | 283 | 220 | 4 |
| box-hall | 353 | 117 | 0 |
| min-reach | 285 | 180 | 0 |
| shape-fit | 170 | 268 | 0 |
| cmp-wrap | 335 | 66 | 0 |
| colour-count | 189 | 169 | 27 |
| boxy-corner | 253 | 128 | 0 |
| match-place | 241 | 133 | 0 |

Files: the .jsonl has everything per puzzle (per-rule counts per phase, scan test counts, final-search progress, wrong-edge examples); the .csv is the flat version of the main numbers.
