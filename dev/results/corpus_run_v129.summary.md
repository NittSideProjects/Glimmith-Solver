# Glimmith corpus run

* puzzles in this report: **1225**   (runs merged: 1; the latest record of each puzzle counts)
* solver core: `solver-core.v129.js` (sha1 cc060af14751), node v22.23.4, linux x64, 4 cores (Intel(R) Xeon(R) Processor @ 2.10GHz), jobs 3  (more than 1 job = timings are noisier)
* hard limit per puzzle: 60 s (worker killed 3 s after that); solver settings = the page's defaults: {"testMs":100,"restart":"continue","order":"clues","focusMode":"near","nearShare":0.4,"useWitness":true,"stopAtTwo":true,"nodeBudget":0}
* summed solver time: 13.4 min

How to read the edge columns: every edge that is not a hand-drawn wall is decided by exactly one of **instant** (first propagation, nothing assumed), **probe** (look-ahead: assume it, propagate, contradiction; still no search), **scan** ("wall per wall": a narrow exact search per edge, plus the edges that then follow by propagation; the column "proved by the search itself" counts only the edges the search settled directly) or is **left** for the final exact solver. The four shares are means over the puzzles of the row (percent of that puzzle's edges).

## Verdicts

| verdict | puzzles | meaning |
|---|---|---|
| UNIQUE | 1225 | the solver proved the stored solution is the only tiling |

## Time and edge split by zone and difficulty

| zone / difficulty | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Zone1 d1 | 55 | 25 | 64 | 97 | 272 | 3.8 | 97% | 3% | 0% | 0% | 0% |  |
| Zone1 d2 | 75 | 36 | 77 | 171 | 3089 | 12.7 | 82% | 15% | 2% | 0% | 3% |  |
| Zone1 d3 | 77 | 40 | 99 | 309 | 1463 | 14.3 | 70% | 21% | 0% | 0% | 9% |  |
| Zone1 d4 | 51 | 56 | 202 | 663 | 2972 | 16.2 | 60% | 31% | 0% | 0% | 9% |  |
| Zone1 d5 | 33 | 75 | 427 | 2423 | 13400 | 40.6 | 45% | 40% | 5% | 0% | 15% |  |
| Zone1 d6 | 15 | 98 | 421 | 6508 | 39555 | 64.8 | 46% | 26% | 12% | 0% | 27% |  |
| Zone1 d7 | 3 | 99 | 747 | 916 | 958 | 1.8 | 50% | 50% | 0% | 0% | 0% |  |
| Zone2 d1 | 48 | 21 | 64 | 104 | 129 | 3.3 | 95% | 5% | 0% | 0% | 0% |  |
| Zone2 d2 | 104 | 30 | 83 | 227 | 1036 | 13.6 | 66% | 29% | 0% | 0% | 5% |  |
| Zone2 d3 | 119 | 37 | 142 | 353 | 1116 | 23.1 | 51% | 39% | 0% | 0% | 10% |  |
| Zone2 d4 | 86 | 47 | 185 | 861 | 30674 | 99.6 | 45% | 43% | 0% | 0% | 12% |  |
| Zone2 d5 | 47 | 60 | 263 | 1027 | 5635 | 27.3 | 48% | 41% | 0% | 0% | 10% |  |
| Zone2 d6 | 26 | 78 | 661 | 3387 | 7049 | 32.2 | 36% | 49% | 0% | 0% | 15% |  |
| Zone2 d7 | 8 | 90 | 1017 | 5161 | 8438 | 19.6 | 21% | 50% | 7% | 0% | 28% |  |
| Zone3 d1 | 45 | 17 | 59 | 72 | 153 | 2.7 | 94% | 6% | 0% | 0% | 0% |  |
| Zone3 d2 | 103 | 31 | 75 | 230 | 661 | 11.7 | 72% | 24% | 0% | 0% | 4% |  |
| Zone3 d3 | 114 | 43 | 131 | 526 | 8742 | 36.4 | 66% | 28% | 0% | 0% | 6% |  |
| Zone3 d4 | 84 | 55 | 261 | 2236 | 20331 | 87.3 | 46% | 40% | 0% | 0% | 14% |  |
| Zone3 d5 | 56 | 74 | 494 | 3264 | 15117 | 88.5 | 36% | 55% | 0% | 0% | 9% |  |
| Zone3 d6 | 46 | 91 | 975 | 3789 | 16136 | 91.9 | 32% | 57% | 1% | 0% | 11% |  |
| Zone3 d7 | 30 | 113 | 1972 | 10412 | 19595 | 115.3 | 23% | 50% | 3% | 0% | 27% |  |

## By zone

| zone | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Zone1 | 309 | 46 | 99 | 680 | 39555 | 154.1 | 72% | 21% | 2% | 0% | 7% |  |
| Zone2 | 438 | 42 | 137 | 708 | 30674 | 218.6 | 57% | 35% | 0% | 0% | 9% |  |
| Zone3 | 478 | 53 | 162 | 1892 | 20331 | 433.9 | 57% | 35% | 0% | 0% | 9% |  |

## By difficulty (all zones)

| difficulty | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| d1 | 148 | 21 | 62 | 95 | 272 | 9.8 | 95% | 5% | 0% | 0% | 0% |  |
| d2 | 282 | 32 | 79 | 216 | 3089 | 38.0 | 72% | 24% | 1% | 0% | 4% |  |
| d3 | 310 | 40 | 126 | 410 | 8742 | 73.8 | 61% | 30% | 0% | 0% | 8% |  |
| d4 | 221 | 52 | 208 | 985 | 30674 | 203.1 | 49% | 39% | 0% | 0% | 12% |  |
| d5 | 136 | 69 | 406 | 2229 | 15117 | 156.4 | 42% | 47% | 1% | 0% | 11% |  |
| d6 | 87 | 88 | 759 | 4622 | 39555 | 188.9 | 36% | 49% | 3% | 0% | 15% |  |
| d7 | 41 | 107 | 1673 | 9942 | 19595 | 136.6 | 25% | 50% | 4% | 0% | 25% |  |

## By mechanic (the game's category)

| category | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Zone1 1-single-shape | 11 | 17 | 44 | 52 | 58 | 0.5 | 91% | 9% | 0% | 0% | 0% |  |
| Zone1 2-shape-bank | 11 | 33 | 47 | 86 | 161 | 0.7 | 100% | 0% | 0% | 0% | 0% |  |
| Zone1 3-gemini-delta | 8 | 26 | 87 | 109 | 114 | 0.7 | 100% | 0% | 0% | 0% | 0% |  |
| Zone1 4-slash-pack | 5 | 25 | 48 | 76 | 82 | 0.3 | 100% | 0% | 0% | 0% | 0% |  |
| Zone1 5-shape-bank | 31 | 63 | 89 | 189 | 322 | 3.5 | 97% | 3% | 0% | 0% | 0% |  |
| Zone1 6-gemini-delta | 33 | 40 | 132 | 508 | 3020 | 11.5 | 74% | 20% | 3% | 0% | 6% |  |
| Zone1 7-slash-pack | 36 | 48 | 100 | 318 | 39555 | 49.2 | 89% | 7% | 2% | 0% | 4% |  |
| Zone1 8-poly | 39 | 42 | 76 | 124 | 747 | 3.9 | 87% | 13% | 0% | 0% | 0% |  |
| Zone1 9-region-size-x | 44 | 44 | 95 | 981 | 7529 | 24.5 | 48% | 39% | 4% | 0% | 13% |  |
| Zone1 10-same-shape-no-touch | 41 | 45 | 183 | 1100 | 4900 | 21.9 | 47% | 38% | 4% | 0% | 15% |  |
| Zone1 11-mixed-rules | 50 | 60 | 243 | 1456 | 13400 | 37.5 | 54% | 31% | 0% | 0% | 15% |  |
| Zone2 1-area-numbers | 43 | 43 | 110 | 1096 | 7049 | 23.5 | 58% | 36% | 0% | 0% | 5% |  |
| Zone2 2-palisade | 60 | 41 | 80 | 243 | 1239 | 8.1 | 81% | 18% | 0% | 0% | 1% |  |
| Zone2 3-all-regions-same | 28 | 41 | 218 | 766 | 1743 | 10.0 | 18% | 43% | 0% | 0% | 39% |  |
| Zone2 4-all-regions-different | 48 | 33 | 148 | 397 | 3756 | 13.1 | 72% | 23% | 1% | 0% | 5% |  |
| Zone2 5-minmax | 46 | 41 | 141 | 611 | 14501 | 25.6 | 56% | 33% | 0% | 0% | 11% |  |
| Zone2 6-same-size-no-touch | 45 | 43 | 99 | 560 | 17215 | 30.7 | 59% | 33% | 0% | 0% | 9% |  |
| Zone2 7-1SPR | 37 | 43 | 143 | 986 | 2556 | 13.4 | 47% | 45% | 0% | 0% | 8% |  |
| Zone2 8-all-rectangles | 40 | 46 | 141 | 627 | 7001 | 23.4 | 78% | 19% | 0% | 0% | 3% |  |
| Zone2 9-no-rectangles | 43 | 38 | 170 | 736 | 3473 | 15.6 | 27% | 65% | 0% | 0% | 8% |  |
| Zone2 10-zone2-mixed | 48 | 48 | 169 | 842 | 30674 | 55.3 | 49% | 41% | 0% | 0% | 10% |  |
| Zone3 1-tatami | 70 | 44 | 99 | 398 | 2789 | 17.9 | 58% | 33% | 1% | 0% | 8% |  |
| Zone3 2-loopy | 58 | 61 | 114 | 726 | 9111 | 23.2 | 61% | 34% | 0% | 0% | 5% |  |
| Zone3 3-vertex-radar | 59 | 44 | 132 | 759 | 8742 | 32.8 | 47% | 47% | 1% | 0% | 6% |  |
| Zone3 4-difference | 53 | 38 | 147 | 860 | 16136 | 39.9 | 45% | 35% | 0% | 0% | 19% |  |
| Zone3 5-inequality | 56 | 39 | 132 | 734 | 2784 | 18.7 | 52% | 41% | 1% | 0% | 6% |  |
| Zone3 6-compass | 34 | 29 | 64 | 118 | 15117 | 20.7 | 95% | 5% | 0% | 0% | 0% |  |
| Zone3 6-compass-main | 66 | 56 | 525 | 4297 | 11932 | 96.5 | 76% | 16% | 0% | 0% | 8% |  |
| Zone3 7-finalboss | 1 | 176 | 1892 | 1892 | 1892 | 1.9 | 51% | 49% | 0% | 0% | 0% |  |
| Zone3 7-zone3-mixed | 47 | 64 | 406 | 2263 | 20331 | 73.8 | 43% | 49% | 0% | 0% | 8% |  |
| Zone3 8-endgame | 34 | 113 | 1428 | 9500 | 19595 | 108.6 | 33% | 48% | 3% | 0% | 19% |  |

## By feature tag (a puzzle counts once per tag it has)

| feature | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| area | 219 | 47 | 142 | 1760 | 17215 | 187.2 | 50% | 42% | 0% | 0% | 8% |  |
| bank | 235 | 49 | 105 | 679 | 4725 | 69.3 | 81% | 14% | 2% | 0% | 5% |  |
| compass | 128 | 52 | 351 | 3379 | 15117 | 167.1 | 77% | 18% | 0% | 0% | 6% |  |
| palisade | 169 | 51 | 115 | 589 | 30674 | 95.6 | 62% | 34% | 0% | 0% | 3% |  |
| rose | 179 | 56 | 227 | 1608 | 39555 | 173.9 | 60% | 28% | 1% | 0% | 12% |  |
| stamp | 171 | 53 | 130 | 1215 | 13400 | 96.8 | 58% | 33% | 0% | 0% | 9% |  |
| wall-delta | 98 | 49 | 197 | 1491 | 7529 | 62.0 | 62% | 26% | 3% | 0% | 12% |  |
| wall-diff | 69 | 46 | 180 | 992 | 16136 | 48.7 | 41% | 44% | 0% | 0% | 16% |  |
| wall-gemini | 116 | 49 | 248 | 1726 | 19595 | 108.7 | 55% | 29% | 2% | 0% | 16% |  |
| wall-gt | 67 | 46 | 160 | 1195 | 20331 | 45.4 | 45% | 49% | 1% | 0% | 6% |  |
| wall-lt | 64 | 46 | 143 | 1047 | 20331 | 43.5 | 50% | 44% | 1% | 0% | 6% |  |
| wall-plain | 387 | 47 | 126 | 991 | 39555 | 295.5 | 57% | 32% | 0% | 0% | 11% |  |
| watchtower | 85 | 55 | 197 | 2130 | 20331 | 86.0 | 45% | 46% | 2% | 0% | 9% |  |

## The 30 slowest puzzles

| id | category | diff | size | tiles | total s | ctx / instant / probe / scan / final (s) | instant | probe | scan | left | tests | verdict |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Zone1/1434 | 7-slash-pack | 6 | 15x15 | 172 | 39.6 | 0.03 / 0.25 / 5.32 / 0.00 / 33.9 | 17% | 35% | 0% | 48% | 0 | UNIQUE |
| Zone2/0864b | 10-zone2-mixed | 4 | 10x10 | 72 | 30.7 | 0.00 / 2.90 / 0.48 / 0.00 / 27.3 | 13% | 11% | 0% | 76% | 60 | UNIQUE |
| Zone3/1137 | 7-zone3-mixed | 4 | 11x9 | 99 | 20.3 | 0.02 / 0.12 / 1.77 / 0.00 / 18.4 | 27% | 2% | 0% | 71% | 0 | UNIQUE |
| Zone3/1248 | 8-endgame | 7 | 10x10 | 100 | 19.6 | 0.00 / 0.10 / 1.00 / 0.00 / 18.5 | 0% | 0% | 0% | 100% | 60 | UNIQUE |
| Zone2/1356 | 6-same-size-no-touch | 4 | 7x7 | 49 | 17.2 | 0.01 / 0.02 / 0.12 / 0.00 / 17.1 | 0% | 0% | 0% | 100% | 0 | UNIQUE |
| Zone3/0928 | 4-difference | 6 | 9x7 | 63 | 16.1 | 0.00 / 3.35 / 3.04 / 0.00 / 9.72 | 20% | 2% | 0% | 78% | 60 | UNIQUE |
| Zone3/1395b | 6-compass | 5 | 14x16 | 138 | 15.1 | 0.12 / 0.89 / 14.1 / 0.00 / 0.02 | 7% | 93% | 0% | 0% | 0 | UNIQUE |
| Zone2/1346 | 5-minmax | 4 | 6x6 | 36 | 14.5 | 0.00 / 0.02 / 0.07 / 0.00 / 14.4 | 2% | 0% | 0% | 98% | 60 | UNIQUE |
| Zone3/0631 | 7-zone3-mixed | 5 | 12x12 | 117 | 14.3 | 0.07 / 1.32 / 12.9 / 0.00 / 0.01 | 20% | 80% | 0% | 0% | 0 | UNIQUE |
| Zone3/0208 | 8-endgame | 7 | 13x14 | 90 | 14.2 | 0.02 / 0.24 / 4.75 / 0.00 / 9.13 | 0% | 1% | 0% | 99% | 60 | UNIQUE |
| Zone1/1100 | 11-mixed-rules | 5 | 13x13 | 96 | 13.4 | 0.01 / 0.08 / 5.46 / 0.00 / 7.84 | 20% | 7% | 0% | 74% | 0 | UNIQUE |
| Zone3/1086 | 6-compass-main | 5 | 7x7 | 49 | 11.9 | 0.00 / 3.12 / 8.14 / 0.00 / 0.64 | 7% | 2% | 0% | 90% | 0 | UNIQUE |
| Zone3/1085a | 8-endgame | 6 | 12x12 | 144 | 11.8 | 0.02 / 0.10 / 10.4 / 0.00 / 1.35 | 3% | 65% | 0% | 31% | 0 | UNIQUE |
| Zone3/1258 | 6-compass-main | 7 | 13x13 | 169 | 10.5 | 0.05 / 0.87 / 9.57 / 0.00 / 0.02 | 19% | 81% | 0% | 0% | 0 | UNIQUE |
| Zone3/0930d-real | 4-difference | 7 | 13x13 | 91 | 10.4 | 0.03 / 0.07 / 0.45 / 0.00 / 9.84 | 10% | 0% | 0% | 90% | 60 | UNIQUE |
| Zone3/1138 | 8-endgame | 7 | 11x11 | 121 | 9.94 | 0.00 / 0.04 / 2.38 / 0.00 / 7.50 | 2% | 0% | 98% | 98% | 0 | UNIQUE |
| Zone3/0970 | 2-loopy | 4 | 16x13 | 115 | 9.11 | 0.00 / 0.06 / 0.62 / 0.00 / 8.41 | 19% | 2% | 0% | 79% | 61 | UNIQUE |
| Zone3/1110 | 7-zone3-mixed | 4 | 9x9 | 81 | 9.10 | 0.04 / 2.10 / 5.50 / 0.00 / 1.44 | 28% | 2% | 0% | 70% | 0 | UNIQUE |
| Zone3/0999 | 3-vertex-radar | 3 | 14x14 | 196 | 8.74 | 0.02 / 0.16 / 1.04 / 0.00 / 7.51 | 55% | 0% | 45% | 45% | 0 | UNIQUE |
| Zone3/0312 | 6-compass-main | 6 | 7x7 | 49 | 8.56 | 0.01 / 0.22 / 1.70 / 0.00 / 6.60 | 20% | 4% | 0% | 76% | 0 | UNIQUE |
| Zone3/1322 | 8-endgame | 6 | 12x12 | 97 | 8.47 | 0.00 / 0.03 / 3.42 / 0.00 / 5.00 | 1% | 10% | 0% | 89% | 0 | UNIQUE |
| Zone2/1114 | 10-zone2-mixed | 7 | 10x9 | 86 | 8.44 | 0.01 / 0.15 / 7.67 / 0.00 / 0.59 | 27% | 40% | 0% | 33% | 0 | UNIQUE |
| Zone1/0116 | 9-region-size-x | 6 | 9x9 | 81 | 7.53 | 0.00 / 0.06 / 0.37 / 0.00 / 7.07 | 2% | 20% | 78% | 78% | 49 | UNIQUE |
| Zone2/0745 | 1-area-numbers | 6 | 11x11 | 121 | 7.05 | 0.04 / 0.03 / 5.20 / 0.00 / 1.76 | 7% | 11% | 0% | 81% | 0 | UNIQUE |
| Zone2/1195 | 8-all-rectangles | 4 | 8x7 | 47 | 7.00 | 0.01 / 0.10 / 5.35 / 0.00 / 1.53 | 0% | 3% | 0% | 97% | 0 | UNIQUE |
| Zone3/0994 | 3-vertex-radar | 4 | 9x9 | 77 | 6.89 | 0.01 / 0.05 / 0.65 / 0.00 / 6.16 | 8% | 19% | 0% | 73% | 0 | UNIQUE |
| Zone2/0832 | 8-all-rectangles | 5 | 8x7 | 56 | 5.63 | 0.01 / 0.13 / 5.47 / 0.00 / 0.01 | 13% | 87% | 0% | 0% | 0 | UNIQUE |
| Zone3/0268 | 8-endgame | 7 | 15x15 | 200 | 5.55 | 0.00 / 0.15 / 3.96 / 0.00 / 1.42 | 20% | 37% | 0% | 43% | 0 | UNIQUE |
| Zone3/0233 | 8-endgame | 7 | 15x15 | 192 | 5.45 | 0.00 / 0.30 / 5.11 / 0.00 / 0.02 | 4% | 96% | 0% | 0% | 0 | UNIQUE |
| Zone3/1080 | 6-compass-main | 7 | 10x10 | 100 | 5.16 | 0.02 / 0.28 / 4.82 / 0.00 / 0.02 | 11% | 89% | 0% | 0% | 0 | UNIQUE |

## Outliers: much slower per tile than their peers (same category and difficulty; at least 0.3 s, at least 4x the peer median)

| id | category | diff | tiles | total s | ms per tile | peer median ms per tile | x peers | left |
|---|---|---|---|---|---|---|---|---|
| Zone2/1356 | 6-same-size-no-touch | 4 | 49 | 17.2 | 351.3 | 2.5 | 138.7 | 100% |
| Zone2/0864b | 10-zone2-mixed | 4 | 72 | 30.7 | 426 | 4.8 | 89.5 | 76% |
| Zone1/1434 | 7-slash-pack | 6 | 172 | 39.6 | 230 | 2.6 | 86.9 | 48% |
| Zone2/1346 | 5-minmax | 4 | 36 | 14.5 | 402.8 | 7.3 | 55.4 | 98% |
| Zone3/0928 | 4-difference | 6 | 63 | 16.1 | 256.1 | 4.8 | 53.9 | 78% |
| Zone3/1137 | 7-zone3-mixed | 4 | 99 | 20.3 | 205.4 | 4.9 | 41.6 | 71% |
| Zone1/0116 | 9-region-size-x | 6 | 81 | 7.53 | 93 | 2.5 | 36.7 | 78% |
| Zone1/0030 | 9-region-size-x | 6 | 60 | 4.98 | 82.9 | 2.5 | 32.7 | 96% |
| Zone3/0970 | 2-loopy | 4 | 115 | 9.11 | 79.2 | 2.7 | 29 | 79% |
| Zone2/0832 | 8-all-rectangles | 5 | 56 | 5.63 | 100.6 | 3.6 | 28 | 0% |
| Zone3/1086 | 6-compass-main | 5 | 49 | 11.9 | 243.5 | 9.1 | 26.7 | 90% |
| Zone3/1395b | 6-compass | 5 | 138 | 15.1 | 109.5 | 4.3 | 25.5 | 0% |
| Zone3/0930d-real | 4-difference | 7 | 91 | 10.4 | 114.3 | 4.8 | 24.1 | 90% |
| Zone3/1110 | 7-zone3-mixed | 4 | 81 | 9.10 | 112.3 | 4.9 | 22.8 | 70% |
| Zone2/1114 | 10-zone2-mixed | 7 | 86 | 8.44 | 98.1 | 4.6 | 21.4 | 33% |
| Zone1/1236 | 7-slash-pack | 5 | 90 | 4.72 | 52.5 | 2.6 | 19.8 | 84% |
| Zone3/0994 | 3-vertex-radar | 4 | 77 | 6.89 | 89.4 | 4.7 | 19 | 73% |
| Zone2/1352 | 6-same-size-no-touch | 5 | 40 | 2.24 | 55.9 | 3 | 18.4 | 94% |
| Zone2/1195 | 8-all-rectangles | 4 | 47 | 7.00 | 148.9 | 8.8 | 17 | 97% |
| Zone2/0745 | 1-area-numbers | 6 | 121 | 7.05 | 58.3 | 3.4 | 16.9 | 81% |
| Zone3/0312 | 6-compass-main | 6 | 49 | 8.56 | 174.8 | 10.6 | 16.6 | 76% |
| Zone3/1260 | 6-compass-main | 3 | 49 | 3.78 | 77.1 | 5.3 | 14.6 | 75% |
| Zone1/1439 | 10-same-shape-no-touch | 2 | 60 | 3.09 | 51.5 | 3.9 | 13.3 | 64% |
| Zone3/0999 | 3-vertex-radar | 3 | 196 | 8.74 | 44.6 | 3.4 | 13 | 45% |
| Zone1/1100 | 11-mixed-rules | 5 | 96 | 13.4 | 139.6 | 11.7 | 11.9 | 74% |
| Zone3/1084 | 6-compass-main | 5 | 48 | 5.14 | 107.1 | 9.1 | 11.7 | 76% |
| Zone1/0099 | 6-gemini-delta | 2 | 50 | 2.84 | 56.8 | 5 | 11.3 | 100% |
| Zone2/0349 | 4-all-regions-different | 7 | 60 | 3.76 | 62.6 | 5.6 | 11.2 | 57% |
| Zone2/0742 | 1-area-numbers | 6 | 112 | 4.32 | 38.5 | 3.4 | 11.2 | 0% |
| Zone3/1003 | 3-vertex-radar | 6 | 100 | 4.44 | 44.4 | 4 | 11.1 | 0% |

## The 20 puzzles with the largest share of edges left to the final solver

| id | category | diff | tiles | spots | left | left % | total s | final s | verdict |
|---|---|---|---|---|---|---|---|---|---|
| Zone1/0099 | 6-gemini-delta | 2 | 50 | 73 | 73 | 100% | 2.84 | 2.36 | UNIQUE |
| Zone1/0276 | 10-same-shape-no-touch | 3 | 16 | 13 | 13 | 100% | 0.10 | 0.03 | UNIQUE |
| Zone1/1065 | 10-same-shape-no-touch | 3 | 25 | 40 | 40 | 100% | 0.19 | 0.08 | UNIQUE |
| Zone1/0130 | 9-region-size-x | 4 | 36 | 46 | 46 | 100% | 0.53 | 0.36 | UNIQUE |
| Zone1/0528 | 6-gemini-delta | 4 | 54 | 72 | 72 | 100% | 0.90 | 0.49 | UNIQUE |
| Zone2/1177 | 3-all-regions-same | 2 | 18 | 27 | 27 | 100% | 0.09 | 0.02 | UNIQUE |
| Zone2/0372 | 3-all-regions-same | 3 | 18 | 22 | 22 | 100% | 0.17 | 0.10 | UNIQUE |
| Zone2/1120 | 10-zone2-mixed | 3 | 18 | 23 | 23 | 100% | 0.16 | 0.04 | UNIQUE |
| Zone2/1345 | 5-minmax | 3 | 25 | 34 | 34 | 100% | 0.41 | 0.32 | UNIQUE |
| Zone2/1348 | 5-minmax | 4 | 25 | 37 | 37 | 100% | 0.82 | 0.63 | UNIQUE |
| Zone2/1351 | 5-minmax | 4 | 35 | 54 | 54 | 100% | 1.08 | 0.98 | UNIQUE |
| Zone2/1356 | 6-same-size-no-touch | 4 | 49 | 68 | 68 | 100% | 17.2 | 17.1 | UNIQUE |
| Zone2/1365 | 3-all-regions-same | 4 | 52 | 83 | 83 | 100% | 0.58 | 0.39 | UNIQUE |
| Zone3/0893 | 4-difference | 2 | 16 | 22 | 22 | 100% | 0.15 | 0.02 | UNIQUE |
| Zone3/0493 | 7-zone3-mixed | 3 | 64 | 108 | 108 | 100% | 2.15 | 1.53 | UNIQUE |
| Zone3/1385 | 4-difference | 3 | 26 | 25 | 25 | 100% | 0.11 | 0.04 | UNIQUE |
| Zone3/1401 | 4-difference | 3 | 20 | 27 | 27 | 100% | 0.18 | 0.10 | UNIQUE |
| Zone3/1039 | 4-difference | 4 | 20 | 26 | 26 | 100% | 0.17 | 0.11 | UNIQUE |
| Zone3/1248 | 8-endgame | 7 | 100 | 179 | 179 | 100% | 19.6 | 18.5 | UNIQUE |
| Zone2/0960 | 3-all-regions-same | 7 | 92 | 158 | 157 | 99% | 0.89 | 0.13 | UNIQUE |

## Decided without any search: 1082 of 1225 puzzles (every edge by instant propagation or look-ahead; scan tests = 0, left = 0)

## Which rules decided the edges (all puzzles, edges per phase; `search` = proved by a narrow search)

| rule | instant | probe | scan |
|---|---|---|---|
| basic | 4616 | 5266 | 247 |
| bank-place | 8409 | 918 | 332 |
| stamp-place | 3521 | 1969 | 0 |
| label | 2775 | 2241 | 44 |
| size | 2136 | 2129 | 32 |
| size-cut | 2142 | 1621 | 53 |
| bridge-count | 2055 | 1358 | 9 |
| grow | 1526 | 1152 | 5 |
| boxy-place | 2141 | 501 | 0 |
| loo-outline | 1772 | 39 | 0 |
| compass | 1305 | 402 | 0 |
| pal-link | 1267 | 420 | 0 |
| euler-count | 949 | 645 | 22 |
| mismatch-hall | 1346 | 108 | 47 |
| gemini-place | 828 | 485 | 73 |
| reach | 654 | 644 | 25 |
| tower-link | 936 | 277 | 42 |
| pal-wall | 640 | 404 | 0 |
| mingle-area-place | 405 | 608 | 0 |
| size-range | 399 | 582 | 3 |
| rose-cut | 747 | 170 | 0 |
| tower-wall | 469 | 357 | 57 |
| area-rel | 277 | 441 | 0 |
| loo-color | 289 | 411 | 0 |
| range-region | 144 | 475 | 1 |
| cmp-box | 602 | 0 | 0 |
| bank-fit | 457 | 130 | 7 |
| stamp-size | 309 | 269 | 0 |
| rose-pair | 338 | 215 | 0 |
| loo-corner | 126 | 422 | 0 |
| bri-three | 309 | 218 | 0 |
| mingle-area-merge | 292 | 228 | 0 |
| area-sum | 283 | 226 | 4 |
| box-hall | 353 | 141 | 0 |
| min-reach | 285 | 180 | 0 |
| cmp-wrap | 359 | 84 | 0 |
| shape-fit | 169 | 268 | 0 |
| colour-count | 184 | 170 | 27 |
| boxy-corner | 253 | 128 | 0 |
| match-place | 241 | 133 | 0 |

Files: the .jsonl has everything per puzzle (per-rule counts per phase, scan test counts, final-search progress, wrong-edge examples); the .csv is the flat version of the main numbers.
