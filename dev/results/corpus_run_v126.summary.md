# Glimmith corpus run

* puzzles in this report: **1225**   (runs merged: 1; the latest record of each puzzle counts)
* solver core: `solver-core.v126.js` (sha1 0052e258ffc2), node v22.23.4, linux x64, 4 cores (Intel(R) Xeon(R) Processor @ 2.10GHz), jobs 2  (more than 1 job = timings are noisier)
* hard limit per puzzle: 60 s (worker killed 3 s after that); solver settings = the page's defaults: {"testMs":100,"restart":"continue","order":"clues","focusMode":"near","nearShare":0.4,"useWitness":true,"stopAtTwo":true,"nodeBudget":0}
* summed solver time: 11.4 min

How to read the edge columns: every edge that is not a hand-drawn wall is decided by exactly one of **instant** (first propagation, nothing assumed), **probe** (look-ahead: assume it, propagate, contradiction; still no search), **scan** ("wall per wall": a narrow exact search per edge, plus the edges that then follow by propagation; the column "proved by the search itself" counts only the edges the search settled directly) or is **left** for the final exact solver. The four shares are means over the puzzles of the row (percent of that puzzle's edges).

## Verdicts

| verdict | puzzles | meaning |
|---|---|---|
| UNIQUE | 1225 | the solver proved the stored solution is the only tiling |

## Time and edge split by zone and difficulty

| zone / difficulty | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Zone1 d1 | 55 | 25 | 60 | 88 | 191 | 3.6 | 97% | 3% | 0% | 0% | 0% |  |
| Zone1 d2 | 75 | 36 | 64 | 131 | 2773 | 11.3 | 82% | 15% | 2% | 0% | 3% |  |
| Zone1 d3 | 77 | 40 | 85 | 253 | 1331 | 12.2 | 70% | 21% | 0% | 0% | 9% |  |
| Zone1 d4 | 51 | 56 | 154 | 495 | 2588 | 13.1 | 60% | 31% | 0% | 0% | 9% |  |
| Zone1 d5 | 33 | 75 | 384 | 1917 | 12893 | 36.4 | 45% | 40% | 5% | 0% | 15% |  |
| Zone1 d6 | 15 | 98 | 428 | 6106 | 33057 | 54.9 | 46% | 26% | 12% | 0% | 27% |  |
| Zone1 d7 | 3 | 99 | 547 | 649 | 675 | 1.3 | 50% | 50% | 0% | 0% | 0% |  |
| Zone2 d1 | 48 | 21 | 49 | 79 | 98 | 2.6 | 95% | 5% | 0% | 0% | 0% |  |
| Zone2 d2 | 104 | 30 | 70 | 184 | 772 | 10.9 | 66% | 29% | 0% | 0% | 5% |  |
| Zone2 d3 | 119 | 37 | 98 | 253 | 951 | 16.3 | 51% | 39% | 0% | 0% | 10% |  |
| Zone2 d4 | 86 | 47 | 129 | 638 | 14699 | 60.3 | 45% | 43% | 0% | 0% | 12% |  |
| Zone2 d5 | 47 | 60 | 197 | 768 | 4134 | 20.1 | 48% | 41% | 0% | 0% | 10% |  |
| Zone2 d6 | 26 | 78 | 392 | 2523 | 8838 | 27.9 | 36% | 49% | 0% | 0% | 15% |  |
| Zone2 d7 | 8 | 90 | 852 | 4700 | 7611 | 17.4 | 21% | 50% | 7% | 0% | 28% |  |
| Zone3 d1 | 45 | 17 | 46 | 66 | 136 | 2.3 | 94% | 6% | 0% | 0% | 0% |  |
| Zone3 d2 | 103 | 31 | 66 | 162 | 528 | 9.8 | 72% | 24% | 0% | 0% | 4% |  |
| Zone3 d3 | 114 | 43 | 113 | 451 | 8485 | 33.6 | 66% | 28% | 0% | 0% | 6% |  |
| Zone3 d4 | 84 | 55 | 223 | 1906 | 18284 | 79.0 | 46% | 40% | 0% | 0% | 14% |  |
| Zone3 d5 | 56 | 74 | 476 | 2702 | 14056 | 80.2 | 36% | 55% | 0% | 0% | 9% |  |
| Zone3 d6 | 46 | 91 | 721 | 3237 | 14328 | 81.0 | 32% | 57% | 1% | 0% | 11% |  |
| Zone3 d7 | 30 | 113 | 1639 | 10037 | 18746 | 109.7 | 23% | 50% | 3% | 0% | 27% |  |

## By zone

| zone | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Zone1 | 309 | 46 | 87 | 550 | 33057 | 132.8 | 72% | 21% | 2% | 0% | 7% |  |
| Zone2 | 438 | 42 | 97 | 498 | 14699 | 155.4 | 57% | 35% | 0% | 0% | 9% |  |
| Zone3 | 478 | 53 | 134 | 1553 | 18746 | 395.6 | 57% | 35% | 0% | 0% | 9% |  |

## By difficulty (all zones)

| difficulty | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| d1 | 148 | 21 | 50 | 80 | 191 | 8.5 | 95% | 5% | 0% | 0% | 0% |  |
| d2 | 282 | 32 | 67 | 156 | 2773 | 32.0 | 72% | 24% | 1% | 0% | 4% |  |
| d3 | 310 | 40 | 98 | 328 | 8485 | 62.0 | 61% | 30% | 0% | 0% | 8% |  |
| d4 | 221 | 52 | 163 | 796 | 18284 | 152.4 | 49% | 39% | 0% | 0% | 12% |  |
| d5 | 136 | 69 | 326 | 1733 | 14056 | 136.7 | 42% | 47% | 1% | 0% | 11% |  |
| d6 | 87 | 88 | 587 | 3762 | 33057 | 163.9 | 36% | 49% | 3% | 0% | 15% |  |
| d7 | 41 | 107 | 1326 | 8652 | 18746 | 128.4 | 25% | 50% | 4% | 0% | 25% |  |

## By mechanic (the game's category)

| category | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Zone1 1-single-shape | 11 | 17 | 43 | 50 | 56 | 0.5 | 91% | 9% | 0% | 0% | 0% |  |
| Zone1 2-shape-bank | 11 | 33 | 49 | 73 | 142 | 0.6 | 100% | 0% | 0% | 0% | 0% |  |
| Zone1 3-gemini-delta | 8 | 26 | 68 | 109 | 128 | 0.6 | 100% | 0% | 0% | 0% | 0% |  |
| Zone1 4-slash-pack | 5 | 25 | 52 | 61 | 63 | 0.3 | 100% | 0% | 0% | 0% | 0% |  |
| Zone1 5-shape-bank | 31 | 63 | 77 | 149 | 275 | 2.9 | 97% | 3% | 0% | 0% | 0% |  |
| Zone1 6-gemini-delta | 33 | 40 | 114 | 404 | 2671 | 9.8 | 74% | 20% | 3% | 0% | 6% |  |
| Zone1 7-slash-pack | 36 | 48 | 84 | 223 | 33057 | 41.5 | 89% | 7% | 2% | 0% | 4% |  |
| Zone1 8-poly | 39 | 42 | 69 | 100 | 547 | 3.3 | 87% | 13% | 0% | 0% | 0% |  |
| Zone1 9-region-size-x | 44 | 44 | 89 | 660 | 7549 | 21.0 | 48% | 39% | 4% | 0% | 13% |  |
| Zone1 10-same-shape-no-touch | 41 | 45 | 127 | 907 | 3943 | 18.6 | 47% | 38% | 4% | 0% | 15% |  |
| Zone1 11-mixed-rules | 50 | 60 | 209 | 1301 | 12893 | 33.8 | 54% | 31% | 0% | 0% | 15% |  |
| Zone2 1-area-numbers | 43 | 43 | 82 | 947 | 8838 | 21.4 | 58% | 36% | 0% | 0% | 5% |  |
| Zone2 2-palisade | 60 | 41 | 71 | 170 | 874 | 6.0 | 81% | 18% | 0% | 0% | 1% |  |
| Zone2 3-all-regions-same | 28 | 41 | 151 | 554 | 1434 | 7.5 | 18% | 43% | 0% | 0% | 39% |  |
| Zone2 4-all-regions-different | 48 | 33 | 113 | 295 | 3452 | 10.5 | 72% | 23% | 1% | 0% | 5% |  |
| Zone2 5-minmax | 46 | 41 | 99 | 426 | 13259 | 21.8 | 56% | 33% | 0% | 0% | 11% |  |
| Zone2 6-same-size-no-touch | 45 | 43 | 81 | 456 | 14699 | 25.5 | 59% | 33% | 0% | 0% | 9% |  |
| Zone2 7-1SPR | 37 | 43 | 103 | 678 | 1879 | 10.0 | 47% | 45% | 0% | 0% | 8% |  |
| Zone2 8-all-rectangles | 40 | 46 | 107 | 473 | 5743 | 17.6 | 78% | 19% | 0% | 0% | 3% |  |
| Zone2 9-no-rectangles | 43 | 38 | 120 | 477 | 3107 | 11.7 | 27% | 65% | 0% | 0% | 8% |  |
| Zone2 10-zone2-mixed | 48 | 48 | 113 | 662 | 7611 | 23.4 | 49% | 41% | 0% | 0% | 10% |  |
| Zone3 1-tatami | 70 | 44 | 85 | 272 | 2593 | 14.7 | 58% | 33% | 1% | 0% | 8% |  |
| Zone3 2-loopy | 58 | 61 | 88 | 539 | 8798 | 20.5 | 61% | 34% | 0% | 0% | 5% |  |
| Zone3 3-vertex-radar | 59 | 44 | 106 | 733 | 8485 | 28.5 | 47% | 47% | 1% | 0% | 6% |  |
| Zone3 4-difference | 53 | 38 | 124 | 660 | 14328 | 34.7 | 45% | 35% | 0% | 0% | 19% |  |
| Zone3 5-inequality | 56 | 39 | 117 | 588 | 2669 | 16.4 | 52% | 41% | 1% | 0% | 6% |  |
| Zone3 6-compass | 34 | 29 | 51 | 129 | 13335 | 18.6 | 95% | 5% | 0% | 0% | 0% |  |
| Zone3 6-compass-main | 66 | 56 | 406 | 4456 | 13671 | 101.2 | 76% | 16% | 0% | 0% | 8% |  |
| Zone3 7-finalboss | 1 | 176 | 1427 | 1427 | 1427 | 1.4 | 51% | 49% | 0% | 0% | 0% |  |
| Zone3 7-zone3-mixed | 47 | 64 | 346 | 1744 | 18284 | 65.1 | 43% | 49% | 0% | 0% | 8% |  |
| Zone3 8-endgame | 34 | 113 | 1250 | 8158 | 18746 | 94.4 | 33% | 48% | 3% | 0% | 19% |  |

## By feature tag (a puzzle counts once per tag it has)

| feature | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| area | 219 | 47 | 104 | 1543 | 14699 | 158.5 | 50% | 42% | 0% | 0% | 8% |  |
| bank | 235 | 49 | 87 | 501 | 4410 | 58.2 | 81% | 14% | 2% | 0% | 5% |  |
| compass | 128 | 52 | 325 | 3101 | 14056 | 165.6 | 77% | 18% | 0% | 0% | 6% |  |
| palisade | 169 | 51 | 91 | 426 | 18746 | 57.7 | 62% | 34% | 0% | 0% | 3% |  |
| rose | 179 | 56 | 183 | 1435 | 33057 | 148.0 | 60% | 28% | 1% | 0% | 12% |  |
| stamp | 171 | 53 | 109 | 907 | 12893 | 85.1 | 58% | 33% | 0% | 0% | 9% |  |
| wall-delta | 98 | 49 | 158 | 1302 | 7549 | 51.5 | 62% | 26% | 3% | 0% | 12% |  |
| wall-diff | 69 | 46 | 146 | 737 | 14328 | 41.6 | 41% | 44% | 0% | 0% | 16% |  |
| wall-gemini | 116 | 49 | 195 | 1408 | 18746 | 93.8 | 55% | 29% | 2% | 0% | 16% |  |
| wall-gt | 67 | 46 | 134 | 993 | 18284 | 39.6 | 45% | 49% | 1% | 0% | 6% |  |
| wall-lt | 64 | 46 | 131 | 865 | 18284 | 38.3 | 50% | 44% | 1% | 0% | 6% |  |
| wall-plain | 387 | 47 | 101 | 838 | 33057 | 256.0 | 57% | 32% | 0% | 0% | 11% |  |
| watchtower | 85 | 55 | 144 | 1671 | 18284 | 74.4 | 45% | 46% | 2% | 0% | 9% |  |

## The 30 slowest puzzles

| id | category | diff | size | tiles | total s | ctx / instant / probe / scan / final (s) | instant | probe | scan | left | tests | verdict |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Zone1/1434 | 7-slash-pack | 6 | 15x15 | 172 | 33.1 | 0.02 / 0.18 / 4.80 / 0.00 / 28.0 | 17% | 35% | 0% | 48% | 0 | UNIQUE |
| Zone3/1248 | 8-endgame | 7 | 10x10 | 100 | 18.7 | 0.00 / 0.06 / 0.80 / 0.00 / 17.9 | 0% | 0% | 0% | 100% | 60 | UNIQUE |
| Zone3/1137 | 7-zone3-mixed | 4 | 11x9 | 99 | 18.3 | 0.01 / 0.07 / 1.58 / 0.00 / 16.6 | 27% | 2% | 0% | 71% | 0 | UNIQUE |
| Zone2/1356 | 6-same-size-no-touch | 4 | 7x7 | 49 | 14.7 | 0.01 / 0.01 / 0.10 / 0.00 / 14.6 | 0% | 0% | 0% | 100% | 0 | UNIQUE |
| Zone3/0928 | 4-difference | 6 | 9x7 | 63 | 14.3 | 0.00 / 2.85 / 2.54 / 0.00 / 8.91 | 20% | 2% | 0% | 78% | 60 | UNIQUE |
| Zone3/0631 | 7-zone3-mixed | 5 | 12x12 | 117 | 14.1 | 0.10 / 1.37 / 12.6 / 0.00 / 0.01 | 20% | 80% | 0% | 0% | 0 | UNIQUE |
| Zone3/1258 | 6-compass-main | 7 | 13x13 | 169 | 13.7 | 0.05 / 0.84 / 12.7 / 0.00 / 0.02 | 19% | 81% | 0% | 0% | 0 | UNIQUE |
| Zone3/1395b | 6-compass | 5 | 14x16 | 138 | 13.3 | 0.12 / 0.64 / 12.5 / 0.00 / 0.02 | 7% | 93% | 0% | 0% | 0 | UNIQUE |
| Zone2/1346 | 5-minmax | 4 | 6x6 | 36 | 13.3 | 0.00 / 0.01 / 0.04 / 0.00 / 13.2 | 2% | 0% | 0% | 98% | 60 | UNIQUE |
| Zone1/1100 | 11-mixed-rules | 5 | 13x13 | 96 | 12.9 | 0.01 / 0.07 / 5.29 / 0.00 / 7.50 | 20% | 7% | 0% | 74% | 0 | UNIQUE |
| Zone3/0312 | 6-compass-main | 6 | 7x7 | 49 | 12.4 | 0.01 / 0.23 / 2.44 / 0.00 / 9.69 | 20% | 4% | 0% | 76% | 0 | UNIQUE |
| Zone3/0208 | 8-endgame | 7 | 13x14 | 90 | 12.3 | 0.01 / 0.18 / 3.48 / 0.00 / 8.58 | 0% | 1% | 0% | 99% | 60 | UNIQUE |
| Zone3/1086 | 6-compass-main | 5 | 7x7 | 49 | 11.7 | 0.00 / 2.75 / 8.22 / 0.00 / 0.66 | 7% | 2% | 0% | 90% | 0 | UNIQUE |
| Zone3/0930d-real | 4-difference | 7 | 13x13 | 91 | 9.79 | 0.02 / 0.05 / 0.35 / 0.00 / 9.35 | 10% | 0% | 0% | 90% | 60 | UNIQUE |
| Zone3/1085a | 8-endgame | 6 | 12x12 | 144 | 9.71 | 0.02 / 0.08 / 8.70 / 0.00 / 0.88 | 3% | 66% | 0% | 31% | 0 | UNIQUE |
| Zone2/0745 | 1-area-numbers | 6 | 11x11 | 121 | 8.84 | 0.03 / 0.04 / 5.00 / 0.00 / 3.76 | 7% | 15% | 0% | 78% | 0 | UNIQUE |
| Zone3/0970 | 2-loopy | 4 | 16x13 | 115 | 8.80 | 0.00 / 0.04 / 0.55 / 0.00 / 8.19 | 19% | 2% | 0% | 79% | 61 | UNIQUE |
| Zone3/1138 | 8-endgame | 7 | 11x11 | 121 | 8.65 | 0.00 / 0.04 / 2.03 / 0.00 / 6.56 | 2% | 0% | 98% | 98% | 0 | UNIQUE |
| Zone3/0999 | 3-vertex-radar | 3 | 14x14 | 196 | 8.49 | 0.02 / 0.09 / 0.91 / 0.00 / 7.45 | 55% | 0% | 45% | 45% | 0 | UNIQUE |
| Zone3/1110 | 7-zone3-mixed | 4 | 9x9 | 81 | 7.94 | 0.03 / 1.60 / 4.84 / 0.00 / 1.46 | 28% | 2% | 0% | 70% | 0 | UNIQUE |
| Zone2/1114 | 10-zone2-mixed | 7 | 10x9 | 86 | 7.61 | 0.01 / 0.13 / 6.95 / 0.00 / 0.50 | 27% | 40% | 0% | 33% | 0 | UNIQUE |
| Zone1/0116 | 9-region-size-x | 6 | 9x9 | 81 | 7.55 | 0.00 / 0.04 / 0.35 / 0.00 / 7.14 | 2% | 20% | 78% | 78% | 49 | UNIQUE |
| Zone3/1322 | 8-endgame | 6 | 12x12 | 97 | 7.01 | 0.00 / 0.03 / 2.59 / 0.00 / 4.37 | 1% | 10% | 0% | 89% | 0 | UNIQUE |
| Zone3/1080 | 6-compass-main | 7 | 10x10 | 100 | 6.94 | 0.02 / 0.31 / 6.57 / 0.00 / 0.01 | 11% | 89% | 0% | 0% | 0 | UNIQUE |
| Zone3/0373 | 6-compass-main | 4 | 6x6 | 36 | 6.15 | 0.00 / 4.02 / 0.73 / 0.00 / 1.38 | 2% | 0% | 0% | 98% | 0 | UNIQUE |
| Zone3/0994 | 3-vertex-radar | 4 | 9x9 | 77 | 5.81 | 0.01 / 0.03 / 0.43 / 0.00 / 5.32 | 8% | 19% | 0% | 73% | 0 | UNIQUE |
| Zone2/1195 | 8-all-rectangles | 4 | 8x7 | 47 | 5.74 | 0.01 / 0.06 / 5.13 / 0.00 / 0.53 | 0% | 4% | 0% | 96% | 0 | UNIQUE |
| Zone3/1084 | 6-compass-main | 5 | 9x8 | 48 | 5.01 | 0.01 / 0.11 / 0.75 / 0.00 / 4.12 | 8% | 16% | 0% | 76% | 0 | UNIQUE |
| Zone3/0268 | 8-endgame | 7 | 15x15 | 200 | 4.87 | 0.00 / 0.13 / 3.10 / 0.00 / 1.61 | 20% | 37% | 0% | 43% | 0 | UNIQUE |
| Zone3/1260 | 6-compass-main | 3 | 7x7 | 49 | 4.79 | 0.00 / 0.20 / 4.01 / 0.00 / 0.56 | 18% | 7% | 0% | 75% | 0 | UNIQUE |

## Outliers: much slower per tile than their peers (same category and difficulty; at least 0.3 s, at least 4x the peer median)

| id | category | diff | tiles | total s | ms per tile | peer median ms per tile | x peers | left |
|---|---|---|---|---|---|---|---|---|
| Zone2/1356 | 6-same-size-no-touch | 4 | 49 | 14.7 | 300 | 2 | 147.8 | 100% |
| Zone1/1434 | 7-slash-pack | 6 | 172 | 33.1 | 192.2 | 2.3 | 85 | 48% |
| Zone2/1346 | 5-minmax | 4 | 36 | 13.3 | 368.3 | 6.4 | 57.9 | 98% |
| Zone3/0928 | 4-difference | 6 | 63 | 14.3 | 227.4 | 4.1 | 55.1 | 78% |
| Zone3/1137 | 7-zone3-mixed | 4 | 99 | 18.3 | 184.7 | 4 | 46.6 | 71% |
| Zone1/0116 | 9-region-size-x | 6 | 81 | 7.55 | 93.2 | 2.4 | 38.1 | 78% |
| Zone3/0970 | 2-loopy | 4 | 115 | 8.80 | 76.5 | 2.1 | 36.5 | 79% |
| Zone3/0312 | 6-compass-main | 6 | 49 | 12.4 | 253 | 8.3 | 30.5 | 76% |
| Zone2/1114 | 10-zone2-mixed | 7 | 86 | 7.61 | 88.5 | 3.1 | 28.3 | 33% |
| Zone2/0745 | 1-area-numbers | 6 | 121 | 8.84 | 73 | 2.7 | 27.3 | 78% |
| Zone2/0832 | 8-all-rectangles | 5 | 56 | 4.13 | 73.8 | 2.7 | 27.1 | 0% |
| Zone3/1395b | 6-compass | 5 | 138 | 13.3 | 96.6 | 3.6 | 26.8 | 0% |
| Zone3/0930d-real | 4-difference | 7 | 91 | 9.79 | 107.6 | 4.1 | 26.1 | 90% |
| Zone3/1086 | 6-compass-main | 5 | 49 | 11.7 | 237.8 | 9.5 | 25 | 90% |
| Zone3/1110 | 7-zone3-mixed | 4 | 81 | 7.94 | 98 | 4 | 24.7 | 70% |
| Zone1/0030 | 9-region-size-x | 6 | 60 | 3.56 | 59.3 | 2.4 | 24.3 | 96% |
| Zone1/1236 | 7-slash-pack | 5 | 90 | 4.41 | 49 | 2.3 | 21.7 | 84% |
| Zone3/1260 | 6-compass-main | 3 | 49 | 4.79 | 97.8 | 4.9 | 19.9 | 75% |
| Zone2/1195 | 8-all-rectangles | 4 | 47 | 5.74 | 122.2 | 6.3 | 19.3 | 96% |
| Zone2/1352 | 6-same-size-no-touch | 5 | 40 | 1.72 | 42.9 | 2.4 | 18.2 | 94% |
| Zone2/0864b | 10-zone2-mixed | 4 | 72 | 4.26 | 59.1 | 3.4 | 17.2 | 76% |
| Zone3/0994 | 3-vertex-radar | 4 | 77 | 5.81 | 75.4 | 4.4 | 17 | 73% |
| Zone3/0999 | 3-vertex-radar | 3 | 196 | 8.49 | 43.3 | 2.7 | 15.8 | 45% |
| Zone3/0373 | 6-compass-main | 4 | 36 | 6.15 | 170.7 | 11.4 | 14.9 | 98% |
| Zone2/0349 | 4-all-regions-different | 7 | 60 | 3.45 | 57.5 | 4.2 | 13.6 | 57% |
| Zone1/1100 | 11-mixed-rules | 5 | 96 | 12.9 | 134.3 | 10.4 | 12.9 | 74% |
| Zone2/1436 | 6-same-size-no-touch | 6 | 140 | 4.10 | 29.3 | 2.4 | 12.4 | 54% |
| Zone1/0099 | 6-gemini-delta | 2 | 50 | 2.67 | 53.4 | 4.4 | 12.3 | 100% |
| Zone3/0631 | 7-zone3-mixed | 5 | 117 | 14.1 | 120.1 | 9.9 | 12.1 | 0% |
| Zone3/1248 | 8-endgame | 7 | 100 | 18.7 | 187.5 | 16 | 11.7 | 100% |

## The 20 puzzles with the largest share of edges left to the final solver

| id | category | diff | tiles | spots | left | left % | total s | final s | verdict |
|---|---|---|---|---|---|---|---|---|---|
| Zone1/0099 | 6-gemini-delta | 2 | 50 | 73 | 73 | 100% | 2.67 | 2.33 | UNIQUE |
| Zone1/0276 | 10-same-shape-no-touch | 3 | 16 | 13 | 13 | 100% | 0.12 | 0.03 | UNIQUE |
| Zone1/1065 | 10-same-shape-no-touch | 3 | 25 | 40 | 40 | 100% | 0.13 | 0.04 | UNIQUE |
| Zone1/0130 | 9-region-size-x | 4 | 36 | 46 | 46 | 100% | 0.43 | 0.28 | UNIQUE |
| Zone1/0528 | 6-gemini-delta | 4 | 54 | 72 | 72 | 100% | 0.72 | 0.41 | UNIQUE |
| Zone2/1177 | 3-all-regions-same | 2 | 18 | 27 | 27 | 100% | 0.10 | 0.02 | UNIQUE |
| Zone2/0372 | 3-all-regions-same | 3 | 18 | 22 | 22 | 100% | 0.08 | 0.02 | UNIQUE |
| Zone2/1120 | 10-zone2-mixed | 3 | 18 | 23 | 23 | 100% | 0.11 | 0.03 | UNIQUE |
| Zone2/1345 | 5-minmax | 3 | 25 | 34 | 34 | 100% | 0.25 | 0.19 | UNIQUE |
| Zone2/1348 | 5-minmax | 4 | 25 | 37 | 37 | 100% | 0.58 | 0.45 | UNIQUE |
| Zone2/1351 | 5-minmax | 4 | 35 | 54 | 54 | 100% | 1.02 | 0.91 | UNIQUE |
| Zone2/1356 | 6-same-size-no-touch | 4 | 49 | 68 | 68 | 100% | 14.7 | 14.6 | UNIQUE |
| Zone2/1365 | 3-all-regions-same | 4 | 52 | 83 | 83 | 100% | 0.41 | 0.26 | UNIQUE |
| Zone3/0893 | 4-difference | 2 | 16 | 22 | 22 | 100% | 0.12 | 0.02 | UNIQUE |
| Zone3/0493 | 7-zone3-mixed | 3 | 64 | 108 | 108 | 100% | 1.83 | 1.38 | UNIQUE |
| Zone3/1385 | 4-difference | 3 | 26 | 25 | 25 | 100% | 0.10 | 0.04 | UNIQUE |
| Zone3/1401 | 4-difference | 3 | 20 | 27 | 27 | 100% | 0.16 | 0.08 | UNIQUE |
| Zone3/1039 | 4-difference | 4 | 20 | 26 | 26 | 100% | 0.14 | 0.08 | UNIQUE |
| Zone3/1248 | 8-endgame | 7 | 100 | 179 | 179 | 100% | 18.7 | 17.9 | UNIQUE |
| Zone2/0960 | 3-all-regions-same | 7 | 92 | 158 | 157 | 99% | 0.79 | 0.10 | UNIQUE |

## Decided without any search: 1082 of 1225 puzzles (every edge by instant propagation or look-ahead; scan tests = 0, left = 0)

## Which rules decided the edges (all puzzles, edges per phase; `search` = proved by a narrow search)

| rule | instant | probe | scan |
|---|---|---|---|
| bank-place | 8409 | 918 | 332 |
| basic | 4338 | 4965 | 229 |
| stamp-place | 3521 | 1969 | 0 |
| label | 2784 | 2232 | 44 |
| size | 2133 | 2129 | 32 |
| size-cut | 2142 | 1621 | 52 |
| bridge-count | 2055 | 1355 | 9 |
| grow | 1758 | 1352 | 21 |
| boxy-place | 2141 | 501 | 0 |
| loo-outline | 1772 | 39 | 0 |
| compass | 1324 | 422 | 0 |
| pal-link | 1269 | 420 | 0 |
| euler-count | 959 | 641 | 23 |
| mismatch-hall | 1346 | 108 | 47 |
| gemini-place | 828 | 485 | 76 |
| reach | 661 | 653 | 25 |
| tower-link | 938 | 279 | 42 |
| pal-wall | 640 | 404 | 0 |
| mingle-area-place | 410 | 613 | 0 |
| size-range | 399 | 581 | 2 |
| rose-cut | 747 | 170 | 0 |
| tower-wall | 471 | 358 | 57 |
| area-rel | 277 | 441 | 0 |
| loo-color | 289 | 415 | 0 |
| range-region | 144 | 472 | 1 |
| cmp-box | 602 | 0 | 0 |
| bank-fit | 457 | 130 | 7 |
| stamp-size | 307 | 269 | 0 |
| rose-pair | 338 | 216 | 0 |
| mingle-area-merge | 295 | 259 | 0 |
| loo-corner | 126 | 417 | 0 |
| bri-three | 310 | 218 | 0 |
| area-sum | 283 | 226 | 4 |
| box-hall | 353 | 117 | 0 |
| min-reach | 285 | 180 | 0 |
| shape-fit | 170 | 270 | 0 |
| cmp-wrap | 335 | 66 | 0 |
| colour-count | 187 | 175 | 27 |
| boxy-corner | 253 | 128 | 0 |
| rose-grow | 294 | 80 | 0 |

Files: the .jsonl has everything per puzzle (per-rule counts per phase, scan test counts, final-search progress, wrong-edge examples); the .csv is the flat version of the main numbers.
