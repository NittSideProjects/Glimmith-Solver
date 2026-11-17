# Glimmith corpus run

* puzzles in this report: **1225**   (runs merged: 1; the latest record of each puzzle counts)
* solver core: `solver-core.v125d.js` (sha1 5d5171879fe2), node v22.23.4, linux x64, 4 cores (Intel(R) Xeon(R) Processor @ 2.10GHz), jobs 2  (more than 1 job = timings are noisier)
* hard limit per puzzle: 60 s (worker killed 3 s after that); solver settings = the page's defaults: {"testMs":100,"restart":"continue","order":"clues","focusMode":"near","nearShare":0.4,"useWitness":true,"stopAtTwo":true,"nodeBudget":0}
* summed solver time: 12.2 min

How to read the edge columns: every edge that is not a hand-drawn wall is decided by exactly one of **instant** (first propagation, nothing assumed), **probe** (look-ahead: assume it, propagate, contradiction; still no search), **scan** ("wall per wall": a narrow exact search per edge, plus the edges that then follow by propagation; the column "proved by the search itself" counts only the edges the search settled directly) or is **left** for the final exact solver. The four shares are means over the puzzles of the row (percent of that puzzle's edges).

## Verdicts

| verdict | puzzles | meaning |
|---|---|---|
| UNIQUE | 1225 | the solver proved the stored solution is the only tiling |

## Time and edge split by zone and difficulty

| zone / difficulty | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Zone1 d1 | 55 | 25 | 68 | 92 | 177 | 3.8 | 97% | 3% | 0% | 0% | 0% |  |
| Zone1 d2 | 75 | 36 | 66 | 125 | 2786 | 11.1 | 82% | 15% | 2% | 0% | 3% |  |
| Zone1 d3 | 77 | 40 | 91 | 289 | 1685 | 13.8 | 70% | 21% | 0% | 0% | 9% |  |
| Zone1 d4 | 51 | 56 | 158 | 558 | 2419 | 13.9 | 60% | 31% | 0% | 0% | 9% |  |
| Zone1 d5 | 33 | 75 | 410 | 2950 | 13242 | 39.8 | 45% | 40% | 8% | 0% | 15% |  |
| Zone1 d6 | 15 | 98 | 359 | 6017 | 33582 | 54.8 | 46% | 26% | 12% | 0% | 27% |  |
| Zone1 d7 | 3 | 99 | 591 | 642 | 654 | 1.4 | 50% | 50% | 0% | 0% | 0% |  |
| Zone2 d1 | 48 | 21 | 53 | 73 | 105 | 2.7 | 95% | 5% | 0% | 0% | 0% |  |
| Zone2 d2 | 104 | 30 | 67 | 166 | 820 | 10.8 | 66% | 29% | 0% | 0% | 5% |  |
| Zone2 d3 | 119 | 37 | 102 | 263 | 964 | 17.3 | 51% | 39% | 0% | 0% | 10% |  |
| Zone2 d4 | 86 | 47 | 145 | 702 | 24802 | 83.0 | 45% | 43% | 0% | 0% | 12% |  |
| Zone2 d5 | 47 | 60 | 210 | 887 | 4585 | 21.9 | 48% | 41% | 0% | 0% | 10% |  |
| Zone2 d6 | 26 | 78 | 453 | 4830 | 9890 | 39.0 | 36% | 48% | 0% | 0% | 16% |  |
| Zone2 d7 | 8 | 90 | 804 | 5976 | 7609 | 19.3 | 21% | 50% | 7% | 0% | 28% |  |
| Zone3 d1 | 45 | 17 | 49 | 76 | 165 | 2.5 | 94% | 6% | 0% | 0% | 0% |  |
| Zone3 d2 | 103 | 31 | 68 | 169 | 591 | 10.1 | 72% | 24% | 0% | 0% | 4% |  |
| Zone3 d3 | 114 | 43 | 117 | 486 | 8842 | 35.5 | 66% | 28% | 0% | 0% | 6% |  |
| Zone3 d4 | 84 | 55 | 221 | 2247 | 18811 | 80.5 | 46% | 40% | 0% | 0% | 14% |  |
| Zone3 d5 | 56 | 74 | 481 | 2636 | 13475 | 79.4 | 36% | 55% | 0% | 0% | 9% |  |
| Zone3 d6 | 46 | 91 | 716 | 3194 | 14222 | 80.1 | 32% | 57% | 1% | 0% | 11% |  |
| Zone3 d7 | 30 | 113 | 1715 | 9264 | 20923 | 109.2 | 23% | 50% | 3% | 0% | 27% |  |

## By zone

| zone | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Zone1 | 309 | 46 | 90 | 574 | 33582 | 138.6 | 72% | 21% | 2% | 0% | 7% |  |
| Zone2 | 438 | 42 | 100 | 521 | 24802 | 194.0 | 57% | 35% | 0% | 0% | 9% |  |
| Zone3 | 478 | 53 | 140 | 1592 | 20923 | 397.3 | 57% | 35% | 0% | 0% | 9% |  |

## By difficulty (all zones)

| difficulty | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| d1 | 148 | 21 | 57 | 86 | 177 | 9.0 | 95% | 5% | 0% | 0% | 0% |  |
| d2 | 282 | 32 | 67 | 164 | 2786 | 32.0 | 72% | 24% | 1% | 0% | 4% |  |
| d3 | 310 | 40 | 107 | 367 | 8842 | 66.6 | 61% | 30% | 0% | 0% | 8% |  |
| d4 | 221 | 52 | 172 | 871 | 24802 | 177.4 | 49% | 39% | 0% | 0% | 12% |  |
| d5 | 136 | 69 | 305 | 1813 | 13475 | 141.1 | 42% | 47% | 2% | 0% | 11% |  |
| d6 | 87 | 88 | 587 | 4682 | 33582 | 173.9 | 36% | 49% | 3% | 0% | 15% |  |
| d7 | 41 | 107 | 1235 | 8510 | 20923 | 129.9 | 25% | 50% | 4% | 0% | 25% |  |

## By mechanic (the game's category)

| category | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Zone1 1-single-shape | 11 | 17 | 47 | 58 | 63 | 0.5 | 91% | 9% | 0% | 0% | 0% |  |
| Zone1 2-shape-bank | 11 | 33 | 49 | 69 | 140 | 0.6 | 100% | 0% | 0% | 0% | 0% |  |
| Zone1 3-gemini-delta | 8 | 26 | 76 | 119 | 125 | 0.7 | 100% | 0% | 0% | 0% | 0% |  |
| Zone1 4-slash-pack | 5 | 25 | 59 | 78 | 90 | 0.3 | 100% | 0% | 0% | 0% | 0% |  |
| Zone1 5-shape-bank | 31 | 63 | 89 | 142 | 242 | 3.0 | 97% | 3% | 0% | 0% | 0% |  |
| Zone1 6-gemini-delta | 33 | 40 | 121 | 462 | 2642 | 10.2 | 74% | 20% | 3% | 0% | 6% |  |
| Zone1 7-slash-pack | 36 | 48 | 85 | 215 | 33582 | 41.8 | 89% | 7% | 2% | 0% | 4% |  |
| Zone1 8-poly | 39 | 42 | 73 | 107 | 591 | 3.5 | 87% | 13% | 0% | 0% | 0% |  |
| Zone1 9-region-size-x | 44 | 44 | 78 | 837 | 7655 | 24.4 | 48% | 39% | 6% | 0% | 13% |  |
| Zone1 10-same-shape-no-touch | 41 | 45 | 137 | 784 | 3505 | 18.2 | 47% | 38% | 4% | 0% | 15% |  |
| Zone1 11-mixed-rules | 50 | 60 | 210 | 1543 | 13242 | 35.3 | 54% | 31% | 0% | 0% | 15% |  |
| Zone2 1-area-numbers | 43 | 43 | 82 | 1016 | 8902 | 24.7 | 58% | 36% | 0% | 0% | 6% |  |
| Zone2 2-palisade | 60 | 41 | 69 | 192 | 903 | 6.3 | 81% | 18% | 0% | 0% | 1% |  |
| Zone2 3-all-regions-same | 28 | 41 | 153 | 579 | 1379 | 7.5 | 18% | 43% | 0% | 0% | 39% |  |
| Zone2 4-all-regions-different | 48 | 33 | 115 | 325 | 3336 | 10.7 | 72% | 23% | 1% | 0% | 5% |  |
| Zone2 5-minmax | 46 | 41 | 111 | 459 | 13080 | 21.8 | 56% | 33% | 0% | 0% | 11% |  |
| Zone2 6-same-size-no-touch | 45 | 43 | 85 | 495 | 15893 | 26.5 | 59% | 33% | 0% | 0% | 9% |  |
| Zone2 7-1SPR | 37 | 43 | 125 | 732 | 1960 | 10.3 | 47% | 45% | 0% | 0% | 8% |  |
| Zone2 8-all-rectangles | 40 | 46 | 114 | 513 | 5970 | 18.9 | 78% | 19% | 0% | 0% | 3% |  |
| Zone2 9-no-rectangles | 43 | 38 | 113 | 540 | 9890 | 22.3 | 27% | 65% | 0% | 0% | 8% |  |
| Zone2 10-zone2-mixed | 48 | 48 | 118 | 687 | 24802 | 45.0 | 49% | 41% | 0% | 0% | 10% |  |
| Zone3 1-tatami | 70 | 44 | 89 | 314 | 2682 | 14.9 | 58% | 33% | 1% | 0% | 8% |  |
| Zone3 2-loopy | 58 | 61 | 95 | 604 | 8688 | 21.0 | 61% | 34% | 0% | 0% | 5% |  |
| Zone3 3-vertex-radar | 59 | 44 | 114 | 664 | 8842 | 28.9 | 47% | 47% | 1% | 0% | 6% |  |
| Zone3 4-difference | 53 | 38 | 125 | 664 | 14222 | 34.5 | 45% | 35% | 0% | 0% | 19% |  |
| Zone3 5-inequality | 56 | 39 | 119 | 565 | 2698 | 16.9 | 52% | 41% | 1% | 0% | 6% |  |
| Zone3 6-compass | 34 | 29 | 52 | 124 | 12719 | 18.0 | 95% | 5% | 0% | 0% | 0% |  |
| Zone3 6-compass-main | 66 | 56 | 423 | 4356 | 12640 | 100.4 | 76% | 16% | 0% | 0% | 8% |  |
| Zone3 7-finalboss | 1 | 176 | 1307 | 1307 | 1307 | 1.3 | 51% | 49% | 0% | 0% | 0% |  |
| Zone3 7-zone3-mixed | 47 | 64 | 378 | 1880 | 18811 | 66.3 | 43% | 49% | 0% | 0% | 8% |  |
| Zone3 8-endgame | 34 | 113 | 1208 | 7932 | 20923 | 95.1 | 33% | 48% | 3% | 0% | 19% |  |

## By feature tag (a puzzle counts once per tag it has)

| feature | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| area | 219 | 47 | 105 | 1549 | 15893 | 167.0 | 50% | 42% | 0% | 0% | 8% |  |
| bank | 235 | 49 | 89 | 566 | 4285 | 59.0 | 81% | 14% | 2% | 0% | 5% |  |
| compass | 128 | 52 | 310 | 3194 | 13475 | 163.9 | 77% | 18% | 0% | 0% | 6% |  |
| palisade | 169 | 51 | 91 | 478 | 24802 | 82.0 | 62% | 34% | 0% | 0% | 3% |  |
| rose | 179 | 56 | 182 | 1503 | 33582 | 151.9 | 60% | 28% | 1% | 0% | 12% |  |
| stamp | 171 | 53 | 107 | 890 | 13242 | 85.2 | 58% | 33% | 0% | 0% | 9% |  |
| wall-delta | 98 | 49 | 178 | 1355 | 9890 | 69.8 | 62% | 26% | 4% | 0% | 13% |  |
| wall-diff | 69 | 46 | 146 | 791 | 14222 | 41.9 | 41% | 44% | 0% | 0% | 16% |  |
| wall-gemini | 116 | 49 | 212 | 1762 | 20923 | 116.1 | 55% | 29% | 3% | 0% | 17% |  |
| wall-gt | 67 | 46 | 143 | 1110 | 18811 | 41.1 | 45% | 49% | 1% | 0% | 6% |  |
| wall-lt | 64 | 46 | 142 | 1001 | 18811 | 39.7 | 50% | 44% | 1% | 0% | 6% |  |
| wall-plain | 387 | 47 | 107 | 824 | 33582 | 275.8 | 57% | 32% | 1% | 0% | 11% |  |
| watchtower | 85 | 55 | 145 | 1810 | 18811 | 75.5 | 45% | 46% | 2% | 0% | 9% |  |

## The 30 slowest puzzles

| id | category | diff | size | tiles | total s | ctx / instant / probe / scan / final (s) | instant | probe | scan | left | tests | verdict |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Zone1/1434 | 7-slash-pack | 6 | 15x15 | 172 | 33.6 | 0.02 / 0.21 / 4.85 / 0.00 / 28.5 | 17% | 35% | 0% | 48% | 0 | UNIQUE |
| Zone2/0864b | 10-zone2-mixed | 4 | 10x10 | 72 | 24.8 | 0.00 / 1.81 / 0.38 / 0.00 / 22.6 | 13% | 11% | 0% | 76% | 60 | UNIQUE |
| Zone3/1248 | 8-endgame | 7 | 10x10 | 100 | 20.9 | 0.00 / 0.08 / 1.18 / 0.00 / 19.6 | 0% | 0% | 0% | 100% | 60 | UNIQUE |
| Zone3/1137 | 7-zone3-mixed | 4 | 11x9 | 99 | 18.8 | 0.01 / 0.08 / 1.52 / 0.00 / 17.2 | 27% | 2% | 0% | 71% | 0 | UNIQUE |
| Zone2/1356 | 6-same-size-no-touch | 4 | 7x7 | 49 | 15.9 | 0.01 / 0.02 / 0.09 / 0.00 / 15.7 | 0% | 0% | 0% | 100% | 0 | UNIQUE |
| Zone3/0928 | 4-difference | 6 | 9x7 | 63 | 14.2 | 0.00 / 2.92 / 2.32 / 0.00 / 8.95 | 20% | 2% | 0% | 78% | 60 | UNIQUE |
| Zone3/0631 | 7-zone3-mixed | 5 | 12x12 | 117 | 13.5 | 0.07 / 1.38 / 12.0 / 0.00 / 0.01 | 20% | 80% | 0% | 0% | 0 | UNIQUE |
| Zone1/1100 | 11-mixed-rules | 5 | 13x13 | 96 | 13.2 | 0.01 / 0.07 / 5.49 / 0.00 / 7.66 | 20% | 7% | 0% | 74% | 0 | UNIQUE |
| Zone2/1346 | 5-minmax | 4 | 6x6 | 36 | 13.1 | 0.00 / 0.01 / 0.04 / 0.00 / 13.0 | 2% | 0% | 0% | 98% | 60 | UNIQUE |
| Zone3/1395b | 6-compass | 5 | 14x16 | 138 | 12.7 | 0.12 / 0.64 / 11.9 / 0.00 / 0.02 | 7% | 93% | 0% | 0% | 0 | UNIQUE |
| Zone3/1258 | 6-compass-main | 7 | 13x13 | 169 | 12.6 | 0.05 / 0.84 / 11.7 / 0.00 / 0.02 | 19% | 81% | 0% | 0% | 0 | UNIQUE |
| Zone3/0208 | 8-endgame | 7 | 13x14 | 90 | 12.0 | 0.01 / 0.17 / 3.24 / 0.00 / 8.54 | 0% | 1% | 0% | 99% | 60 | UNIQUE |
| Zone3/0312 | 6-compass-main | 6 | 7x7 | 49 | 11.8 | 0.00 / 0.21 / 2.27 / 0.00 / 9.34 | 20% | 4% | 0% | 76% | 0 | UNIQUE |
| Zone3/1086 | 6-compass-main | 5 | 7x7 | 49 | 11.6 | 0.00 / 2.96 / 7.93 / 0.00 / 0.70 | 7% | 2% | 0% | 90% | 0 | UNIQUE |
| Zone2/0850 | 9-no-rectangles | 6 | 7x7 | 49 | 9.89 | 0.01 / 0.03 / 0.50 / 0.00 / 9.33 | 0% | 25% | 0% | 75% | 60 | UNIQUE |
| Zone3/1085a | 8-endgame | 6 | 12x12 | 144 | 9.70 | 0.01 / 0.07 / 8.63 / 0.00 / 0.98 | 3% | 66% | 0% | 31% | 0 | UNIQUE |
| Zone3/0930d-real | 4-difference | 7 | 13x13 | 91 | 8.96 | 0.02 / 0.06 / 0.43 / 0.00 / 8.44 | 10% | 0% | 0% | 90% | 60 | UNIQUE |
| Zone2/0745 | 1-area-numbers | 6 | 11x11 | 121 | 8.90 | 0.03 / 0.04 / 5.16 / 0.00 / 3.65 | 7% | 15% | 0% | 78% | 0 | UNIQUE |
| Zone3/0999 | 3-vertex-radar | 3 | 14x14 | 196 | 8.84 | 0.02 / 0.10 / 1.20 / 0.00 / 7.51 | 55% | 0% | 45% | 45% | 0 | UNIQUE |
| Zone3/0970 | 2-loopy | 4 | 16x13 | 115 | 8.69 | 0.00 / 0.04 / 0.47 / 0.00 / 8.15 | 19% | 2% | 0% | 79% | 61 | UNIQUE |
| Zone3/1138 | 8-endgame | 7 | 11x11 | 121 | 8.51 | 0.00 / 0.04 / 2.12 / 0.00 / 6.34 | 2% | 0% | 98% | 98% | 0 | UNIQUE |
| Zone3/1110 | 7-zone3-mixed | 4 | 9x9 | 81 | 7.98 | 0.04 / 1.56 / 4.96 / 0.00 / 1.41 | 28% | 2% | 0% | 70% | 0 | UNIQUE |
| Zone1/0116 | 9-region-size-x | 6 | 9x9 | 81 | 7.66 | 0.00 / 0.04 / 0.38 / 0.00 / 7.22 | 2% | 20% | 78% | 78% | 49 | UNIQUE |
| Zone2/1114 | 10-zone2-mixed | 7 | 10x9 | 86 | 7.61 | 0.01 / 0.10 / 6.97 / 0.00 / 0.51 | 27% | 40% | 0% | 33% | 0 | UNIQUE |
| Zone3/1080 | 6-compass-main | 7 | 10x10 | 100 | 6.91 | 0.01 / 0.34 / 6.53 / 0.00 / 0.01 | 11% | 89% | 0% | 0% | 0 | UNIQUE |
| Zone3/1322 | 8-endgame | 6 | 12x12 | 97 | 6.58 | 0.00 / 0.03 / 2.43 / 0.00 / 4.10 | 1% | 10% | 0% | 89% | 0 | UNIQUE |
| Zone2/0742 | 1-area-numbers | 6 | 12x12 | 112 | 6.30 | 0.03 / 0.11 / 5.46 / 0.00 / 0.69 | 23% | 49% | 0% | 28% | 0 | UNIQUE |
| Zone2/1195 | 8-all-rectangles | 4 | 8x7 | 47 | 5.97 | 0.01 / 0.05 / 5.40 / 0.00 / 0.50 | 0% | 4% | 0% | 96% | 0 | UNIQUE |
| Zone3/0373 | 6-compass-main | 4 | 6x6 | 36 | 5.95 | 0.01 / 3.98 / 0.65 / 0.00 / 1.30 | 2% | 0% | 0% | 98% | 0 | UNIQUE |
| Zone3/0994 | 3-vertex-radar | 4 | 9x9 | 77 | 5.89 | 0.01 / 0.03 / 0.41 / 0.00 / 5.42 | 8% | 19% | 0% | 73% | 0 | UNIQUE |

## Outliers: much slower per tile than their peers (same category and difficulty; at least 0.3 s, at least 4x the peer median)

| id | category | diff | tiles | total s | ms per tile | peer median ms per tile | x peers | left |
|---|---|---|---|---|---|---|---|---|
| Zone2/1356 | 6-same-size-no-touch | 4 | 49 | 15.9 | 324.3 | 2.1 | 157.3 | 100% |
| Zone2/0864b | 10-zone2-mixed | 4 | 72 | 24.8 | 344.5 | 3.1 | 112.1 | 76% |
| Zone1/1434 | 7-slash-pack | 6 | 172 | 33.6 | 195.2 | 2.5 | 77 | 48% |
| Zone2/1346 | 5-minmax | 4 | 36 | 13.1 | 363.3 | 5.4 | 66.9 | 98% |
| Zone2/0850 | 9-no-rectangles | 6 | 49 | 9.89 | 201.8 | 3.6 | 55.6 | 75% |
| Zone3/0928 | 4-difference | 6 | 63 | 14.2 | 225.7 | 4.3 | 52.8 | 78% |
| Zone3/1137 | 7-zone3-mixed | 4 | 99 | 18.8 | 190 | 3.8 | 50.1 | 71% |
| Zone1/0116 | 9-region-size-x | 6 | 81 | 7.66 | 94.5 | 2.6 | 36.2 | 78% |
| Zone3/0970 | 2-loopy | 4 | 115 | 8.69 | 75.5 | 2.4 | 31.4 | 79% |
| Zone3/0312 | 6-compass-main | 6 | 49 | 11.8 | 241.7 | 8.6 | 28.2 | 76% |
| Zone2/0832 | 8-all-rectangles | 5 | 56 | 4.58 | 81.9 | 3 | 27.7 | 0% |
| Zone2/1114 | 10-zone2-mixed | 7 | 86 | 7.61 | 88.5 | 3.3 | 27 | 33% |
| Zone2/0745 | 1-area-numbers | 6 | 121 | 8.90 | 73.6 | 2.8 | 26.2 | 78% |
| Zone3/1110 | 7-zone3-mixed | 4 | 81 | 7.98 | 98.5 | 3.8 | 26 | 70% |
| Zone3/1395b | 6-compass | 5 | 138 | 12.7 | 92.2 | 3.7 | 24.9 | 0% |
| Zone3/1086 | 6-compass-main | 5 | 49 | 11.6 | 236.8 | 10.3 | 23 | 90% |
| Zone3/0930d-real | 4-difference | 7 | 91 | 8.96 | 98.5 | 4.3 | 23 | 90% |
| Zone1/0030 | 9-region-size-x | 6 | 60 | 3.56 | 59.3 | 2.6 | 22.8 | 96% |
| Zone2/0742 | 1-area-numbers | 6 | 112 | 6.30 | 56.2 | 2.8 | 20 | 28% |
| Zone3/1260 | 6-compass-main | 3 | 49 | 4.81 | 98.2 | 4.9 | 19.9 | 75% |
| Zone2/1195 | 8-all-rectangles | 4 | 47 | 5.97 | 127 | 6.6 | 19.2 | 96% |
| Zone3/0994 | 3-vertex-radar | 4 | 77 | 5.89 | 76.5 | 4 | 19 | 73% |
| Zone2/1352 | 6-same-size-no-touch | 5 | 40 | 1.79 | 44.7 | 2.4 | 18.9 | 94% |
| Zone1/1236 | 7-slash-pack | 5 | 90 | 4.28 | 47.6 | 2.5 | 18.8 | 84% |
| Zone3/0999 | 3-vertex-radar | 3 | 196 | 8.84 | 45.1 | 2.9 | 15.7 | 45% |
| Zone3/0373 | 6-compass-main | 4 | 36 | 5.95 | 165.3 | 11 | 15 | 98% |
| Zone2/0349 | 4-all-regions-different | 7 | 60 | 3.34 | 55.6 | 3.9 | 14.2 | 57% |
| Zone1/1100 | 11-mixed-rules | 5 | 96 | 13.2 | 137.9 | 9.8 | 14.1 | 74% |
| Zone3/1248 | 8-endgame | 7 | 100 | 20.9 | 209.2 | 16.6 | 12.6 | 100% |
| Zone1/1439 | 10-same-shape-no-touch | 2 | 60 | 2.79 | 46.4 | 3.7 | 12.4 | 64% |

## The 20 puzzles with the largest share of edges left to the final solver

| id | category | diff | tiles | spots | left | left % | total s | final s | verdict |
|---|---|---|---|---|---|---|---|---|---|
| Zone1/0099 | 6-gemini-delta | 2 | 50 | 73 | 73 | 100% | 2.64 | 2.29 | UNIQUE |
| Zone1/0276 | 10-same-shape-no-touch | 3 | 16 | 13 | 13 | 100% | 0.14 | 0.05 | UNIQUE |
| Zone1/1065 | 10-same-shape-no-touch | 3 | 25 | 40 | 40 | 100% | 0.14 | 0.06 | UNIQUE |
| Zone1/0130 | 9-region-size-x | 4 | 36 | 46 | 46 | 100% | 0.48 | 0.30 | UNIQUE |
| Zone1/0528 | 6-gemini-delta | 4 | 54 | 72 | 72 | 100% | 0.84 | 0.52 | UNIQUE |
| Zone2/1177 | 3-all-regions-same | 2 | 18 | 27 | 27 | 100% | 0.10 | 0.02 | UNIQUE |
| Zone2/0372 | 3-all-regions-same | 3 | 18 | 22 | 22 | 100% | 0.09 | 0.02 | UNIQUE |
| Zone2/1120 | 10-zone2-mixed | 3 | 18 | 23 | 23 | 100% | 0.12 | 0.03 | UNIQUE |
| Zone2/1345 | 5-minmax | 3 | 25 | 34 | 34 | 100% | 0.25 | 0.19 | UNIQUE |
| Zone2/1348 | 5-minmax | 4 | 25 | 37 | 37 | 100% | 0.71 | 0.58 | UNIQUE |
| Zone2/1351 | 5-minmax | 4 | 35 | 54 | 54 | 100% | 1.09 | 0.99 | UNIQUE |
| Zone2/1356 | 6-same-size-no-touch | 4 | 49 | 68 | 68 | 100% | 15.9 | 15.7 | UNIQUE |
| Zone2/1365 | 3-all-regions-same | 4 | 52 | 83 | 83 | 100% | 0.43 | 0.29 | UNIQUE |
| Zone3/0893 | 4-difference | 2 | 16 | 22 | 22 | 100% | 0.11 | 0.02 | UNIQUE |
| Zone3/0493 | 7-zone3-mixed | 3 | 64 | 108 | 108 | 100% | 1.94 | 1.38 | UNIQUE |
| Zone3/1385 | 4-difference | 3 | 26 | 25 | 25 | 100% | 0.11 | 0.05 | UNIQUE |
| Zone3/1401 | 4-difference | 3 | 20 | 27 | 27 | 100% | 0.13 | 0.05 | UNIQUE |
| Zone3/1039 | 4-difference | 4 | 20 | 26 | 26 | 100% | 0.12 | 0.07 | UNIQUE |
| Zone3/1248 | 8-endgame | 7 | 100 | 179 | 179 | 100% | 20.9 | 19.6 | UNIQUE |
| Zone2/0960 | 3-all-regions-same | 7 | 92 | 158 | 157 | 99% | 0.71 | 0.08 | UNIQUE |

## Decided without any search: 1081 of 1225 puzzles (every edge by instant propagation or look-ahead; scan tests = 0, left = 0)

## Which rules decided the edges (all puzzles, edges per phase; `search` = proved by a narrow search)

| rule | instant | probe | scan |
|---|---|---|---|
| bank-place | 8409 | 918 | 332 |
| basic | 4338 | 4963 | 236 |
| stamp-place | 3521 | 1969 | 0 |
| label | 2784 | 2232 | 44 |
| size | 2133 | 2126 | 36 |
| size-cut | 2142 | 1621 | 77 |
| bridge-count | 2055 | 1355 | 9 |
| grow | 1758 | 1346 | 21 |
| boxy-place | 2141 | 501 | 0 |
| loo-outline | 1772 | 39 | 0 |
| compass | 1324 | 422 | 0 |
| pal-link | 1269 | 420 | 0 |
| euler-count | 959 | 641 | 32 |
| mismatch-hall | 1346 | 108 | 47 |
| gemini-place | 828 | 467 | 110 |
| reach | 661 | 651 | 25 |
| tower-link | 938 | 279 | 42 |
| pal-wall | 640 | 404 | 0 |
| mingle-area-place | 410 | 613 | 0 |
| size-range | 399 | 576 | 2 |
| rose-cut | 747 | 170 | 0 |
| tower-wall | 471 | 358 | 57 |
| area-rel | 277 | 440 | 0 |
| loo-color | 289 | 415 | 0 |
| range-region | 144 | 472 | 1 |
| cmp-box | 602 | 0 | 0 |
| bank-fit | 457 | 130 | 7 |
| stamp-size | 307 | 269 | 0 |
| rose-pair | 338 | 216 | 0 |
| mingle-area-merge | 295 | 259 | 0 |
| loo-corner | 126 | 417 | 0 |
| bri-three | 310 | 218 | 0 |
| area-sum | 283 | 220 | 4 |
| box-hall | 353 | 117 | 0 |
| min-reach | 285 | 180 | 0 |
| shape-fit | 170 | 270 | 0 |
| cmp-wrap | 335 | 66 | 0 |
| colour-count | 187 | 175 | 27 |
| boxy-corner | 253 | 128 | 0 |
| rose-grow | 294 | 80 | 0 |

Files: the .jsonl has everything per puzzle (per-rule counts per phase, scan test counts, final-search progress, wrong-edge examples); the .csv is the flat version of the main numbers.
