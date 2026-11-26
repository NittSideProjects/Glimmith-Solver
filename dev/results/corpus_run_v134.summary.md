# Glimmith corpus run

* puzzles in this report: **1225**   (runs merged: 1; the latest record of each puzzle counts)
* solver core: `solver-core.v134.js` (sha1 fe0f358e4969), node v22.23.4, linux x64, 4 cores (Intel(R) Xeon(R) Processor @ 2.10GHz), jobs 2  (more than 1 job = timings are noisier)
* hard limit per puzzle: 60 s (worker killed 3 s after that); solver settings = the page's defaults: {"testMs":100,"restart":"continue","order":"clues","focusMode":"near","nearShare":0.4,"useWitness":true,"stopAtTwo":true,"nodeBudget":0}
* summed solver time: 11.3 min

How to read the edge columns: every edge that is not a hand-drawn wall is decided by exactly one of **instant** (first propagation, nothing assumed), **probe** (look-ahead: assume it, propagate, contradiction; still no search), **scan** ("wall per wall": a narrow exact search per edge, plus the edges that then follow by propagation; the column "proved by the search itself" counts only the edges the search settled directly) or is **left** for the final exact solver. The four shares are means over the puzzles of the row (percent of that puzzle's edges).

## Verdicts

| verdict | puzzles | meaning |
|---|---|---|
| UNIQUE | 1225 | the solver proved the stored solution is the only tiling |

## Time and edge split by zone and difficulty

| zone / difficulty | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Zone1 d1 | 55 | 25 | 61 | 92 | 136 | 3.6 | 98% | 2% | 0% | 0% | 0% |  |
| Zone1 d2 | 75 | 36 | 75 | 148 | 2597 | 9.8 | 85% | 12% | 1% | 0% | 3% |  |
| Zone1 d3 | 77 | 40 | 94 | 259 | 1923 | 13.6 | 72% | 21% | 0% | 0% | 8% |  |
| Zone1 d4 | 51 | 56 | 192 | 535 | 3216 | 16.1 | 60% | 31% | 0% | 0% | 9% |  |
| Zone1 d5 | 33 | 75 | 422 | 1732 | 14182 | 34.5 | 45% | 43% | 6% | 0% | 12% |  |
| Zone1 d6 | 15 | 98 | 551 | 6377 | 43753 | 65.4 | 46% | 26% | 12% | 0% | 27% |  |
| Zone1 d7 | 3 | 99 | 599 | 615 | 619 | 1.3 | 50% | 50% | 0% | 0% | 0% |  |
| Zone2 d1 | 48 | 21 | 58 | 84 | 104 | 2.9 | 95% | 5% | 0% | 0% | 0% |  |
| Zone2 d2 | 104 | 30 | 76 | 170 | 948 | 11.6 | 67% | 29% | 0% | 0% | 5% |  |
| Zone2 d3 | 119 | 37 | 105 | 241 | 866 | 17.3 | 52% | 38% | 0% | 0% | 9% |  |
| Zone2 d4 | 86 | 47 | 154 | 942 | 12836 | 59.9 | 45% | 43% | 0% | 0% | 12% |  |
| Zone2 d5 | 47 | 60 | 222 | 872 | 5078 | 24.1 | 49% | 40% | 0% | 0% | 11% |  |
| Zone2 d6 | 26 | 78 | 478 | 1885 | 8538 | 25.3 | 36% | 49% | 0% | 0% | 15% |  |
| Zone2 d7 | 8 | 90 | 1055 | 3752 | 5421 | 14.0 | 27% | 49% | 0% | 0% | 24% |  |
| Zone3 d1 | 45 | 17 | 47 | 61 | 289 | 2.6 | 94% | 6% | 0% | 0% | 0% |  |
| Zone3 d2 | 103 | 31 | 65 | 193 | 473 | 9.9 | 73% | 23% | 0% | 0% | 4% |  |
| Zone3 d3 | 114 | 43 | 102 | 514 | 8129 | 33.2 | 66% | 27% | 0% | 0% | 6% |  |
| Zone3 d4 | 84 | 55 | 204 | 2461 | 18866 | 86.0 | 48% | 38% | 0% | 0% | 14% |  |
| Zone3 d5 | 56 | 74 | 396 | 3596 | 15380 | 84.3 | 37% | 53% | 0% | 0% | 9% |  |
| Zone3 d6 | 46 | 91 | 580 | 3479 | 9870 | 68.2 | 32% | 57% | 1% | 0% | 10% |  |
| Zone3 d7 | 30 | 113 | 1568 | 6129 | 31101 | 96.4 | 23% | 50% | 3% | 0% | 27% |  |

## By zone

| zone | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Zone1 | 309 | 46 | 94 | 544 | 43753 | 144.4 | 73% | 20% | 1% | 0% | 7% |  |
| Zone2 | 438 | 42 | 104 | 547 | 12836 | 155.1 | 57% | 34% | 0% | 0% | 8% |  |
| Zone3 | 478 | 53 | 134 | 1453 | 31101 | 380.5 | 58% | 34% | 0% | 0% | 9% |  |

## By difficulty (all zones)

| difficulty | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| d1 | 148 | 21 | 56 | 86 | 289 | 9.1 | 96% | 4% | 0% | 0% | 0% |  |
| d2 | 282 | 32 | 70 | 174 | 2597 | 31.2 | 74% | 22% | 0% | 0% | 4% |  |
| d3 | 310 | 40 | 101 | 354 | 8129 | 64.1 | 62% | 30% | 0% | 0% | 8% |  |
| d4 | 221 | 52 | 177 | 1091 | 18866 | 162.0 | 50% | 38% | 0% | 0% | 12% |  |
| d5 | 136 | 69 | 298 | 1906 | 15380 | 143.0 | 43% | 46% | 1% | 0% | 11% |  |
| d6 | 87 | 88 | 549 | 3715 | 43753 | 158.9 | 36% | 50% | 3% | 0% | 15% |  |
| d7 | 41 | 107 | 1320 | 5475 | 31101 | 111.8 | 26% | 50% | 2% | 0% | 24% |  |

## By mechanic (the game's category)

| category | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Zone1 1-single-shape | 11 | 17 | 47 | 56 | 76 | 0.5 | 91% | 9% | 0% | 0% | 0% |  |
| Zone1 2-shape-bank | 11 | 33 | 57 | 102 | 144 | 0.7 | 100% | 0% | 0% | 0% | 0% |  |
| Zone1 3-gemini-delta | 8 | 26 | 60 | 90 | 116 | 0.5 | 100% | 0% | 0% | 0% | 0% |  |
| Zone1 4-slash-pack | 5 | 25 | 56 | 77 | 79 | 0.3 | 100% | 0% | 0% | 0% | 0% |  |
| Zone1 5-shape-bank | 31 | 63 | 85 | 177 | 309 | 3.3 | 97% | 3% | 0% | 0% | 0% |  |
| Zone1 6-gemini-delta | 33 | 40 | 115 | 545 | 2597 | 9.3 | 74% | 20% | 3% | 0% | 6% |  |
| Zone1 7-slash-pack | 36 | 48 | 114 | 290 | 43753 | 49.1 | 89% | 10% | 0% | 0% | 1% |  |
| Zone1 8-poly | 39 | 42 | 75 | 126 | 599 | 3.6 | 87% | 13% | 0% | 0% | 0% |  |
| Zone1 9-region-size-x | 44 | 44 | 86 | 766 | 7640 | 23.0 | 58% | 31% | 6% | 0% | 11% |  |
| Zone1 10-same-shape-no-touch | 41 | 45 | 148 | 795 | 4481 | 18.8 | 47% | 38% | 2% | 0% | 15% |  |
| Zone1 11-mixed-rules | 50 | 60 | 201 | 1015 | 14182 | 35.2 | 55% | 31% | 0% | 0% | 14% |  |
| Zone2 1-area-numbers | 43 | 43 | 95 | 846 | 8538 | 19.5 | 59% | 36% | 0% | 0% | 5% |  |
| Zone2 2-palisade | 60 | 41 | 78 | 167 | 589 | 6.1 | 82% | 17% | 0% | 0% | 1% |  |
| Zone2 3-all-regions-same | 28 | 41 | 171 | 925 | 1690 | 10.3 | 18% | 43% | 0% | 0% | 39% |  |
| Zone2 4-all-regions-different | 48 | 33 | 125 | 273 | 2014 | 9.6 | 72% | 23% | 0% | 0% | 5% |  |
| Zone2 5-minmax | 46 | 41 | 121 | 409 | 12836 | 22.2 | 57% | 32% | 0% | 0% | 11% |  |
| Zone2 6-same-size-no-touch | 45 | 43 | 93 | 492 | 10400 | 22.8 | 59% | 33% | 0% | 0% | 9% |  |
| Zone2 7-1SPR | 37 | 43 | 96 | 733 | 1887 | 10.3 | 47% | 45% | 0% | 0% | 8% |  |
| Zone2 8-all-rectangles | 40 | 46 | 109 | 567 | 6253 | 20.3 | 78% | 19% | 0% | 0% | 3% |  |
| Zone2 9-no-rectangles | 43 | 38 | 124 | 489 | 3036 | 12.2 | 27% | 65% | 0% | 0% | 8% |  |
| Zone2 10-zone2-mixed | 48 | 48 | 136 | 644 | 5421 | 21.8 | 50% | 40% | 0% | 0% | 9% |  |
| Zone3 1-tatami | 70 | 44 | 84 | 274 | 2670 | 15.6 | 60% | 31% | 1% | 0% | 8% |  |
| Zone3 2-loopy | 58 | 61 | 86 | 491 | 13410 | 24.8 | 61% | 34% | 0% | 0% | 5% |  |
| Zone3 3-vertex-radar | 59 | 44 | 101 | 527 | 8129 | 28.3 | 50% | 44% | 1% | 0% | 6% |  |
| Zone3 4-difference | 53 | 38 | 118 | 434 | 5607 | 17.3 | 46% | 35% | 0% | 0% | 19% |  |
| Zone3 5-inequality | 56 | 39 | 98 | 561 | 2604 | 15.3 | 52% | 41% | 1% | 0% | 6% |  |
| Zone3 6-compass | 34 | 29 | 53 | 151 | 15356 | 20.8 | 95% | 5% | 0% | 0% | 0% |  |
| Zone3 6-compass-main | 66 | 56 | 408 | 4632 | 11932 | 92.5 | 76% | 16% | 0% | 0% | 8% |  |
| Zone3 7-finalboss | 1 | 176 | 1400 | 1400 | 1400 | 1.4 | 51% | 49% | 0% | 0% | 0% |  |
| Zone3 7-zone3-mixed | 47 | 64 | 384 | 1924 | 18866 | 65.5 | 44% | 48% | 0% | 0% | 8% |  |
| Zone3 8-endgame | 34 | 113 | 956 | 7776 | 31101 | 99.0 | 33% | 49% | 3% | 0% | 18% |  |

## By feature tag (a puzzle counts once per tag it has)

| feature | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| area | 219 | 47 | 106 | 1508 | 12836 | 157.3 | 52% | 41% | 0% | 0% | 8% |  |
| bank | 235 | 49 | 93 | 534 | 3429 | 52.6 | 81% | 14% | 1% | 0% | 4% |  |
| compass | 128 | 52 | 309 | 3526 | 15380 | 159.5 | 77% | 18% | 0% | 0% | 6% |  |
| palisade | 169 | 51 | 94 | 435 | 31101 | 69.3 | 63% | 33% | 0% | 0% | 3% |  |
| rose | 179 | 56 | 194 | 1271 | 43753 | 155.2 | 60% | 28% | 0% | 0% | 12% |  |
| stamp | 171 | 53 | 115 | 1097 | 14182 | 96.0 | 59% | 33% | 0% | 0% | 9% |  |
| wall-delta | 98 | 49 | 158 | 1169 | 7640 | 52.2 | 62% | 26% | 4% | 0% | 12% |  |
| wall-diff | 69 | 46 | 134 | 542 | 5607 | 23.4 | 42% | 42% | 0% | 0% | 16% |  |
| wall-gemini | 116 | 49 | 201 | 1562 | 31101 | 109.4 | 55% | 30% | 3% | 0% | 16% |  |
| wall-gt | 67 | 46 | 124 | 877 | 18866 | 38.1 | 45% | 49% | 1% | 0% | 6% |  |
| wall-lt | 64 | 46 | 119 | 762 | 18866 | 37.2 | 50% | 44% | 1% | 0% | 6% |  |
| wall-plain | 387 | 47 | 102 | 799 | 43753 | 256.8 | 58% | 31% | 1% | 0% | 11% |  |
| watchtower | 85 | 55 | 144 | 1327 | 18866 | 72.0 | 48% | 44% | 2% | 0% | 8% |  |

## The 30 slowest puzzles

| id | category | diff | size | tiles | total s | ctx / instant / probe / scan / final (s) | instant | probe | scan | left | tests | verdict |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Zone1/1434 | 7-slash-pack | 6 | 15x15 | 172 | 43.8 | 0.02 / 0.40 / 7.55 / 0.00 / 35.8 | 17% | 35% | 0% | 48% | 0 | UNIQUE |
| Zone3/1248 | 8-endgame | 7 | 10x10 | 100 | 31.1 | 0.00 / 0.07 / 1.51 / 0.00 / 29.5 | 0% | 0% | 0% | 100% | 60 | UNIQUE |
| Zone3/1137 | 7-zone3-mixed | 4 | 11x9 | 99 | 18.9 | 0.01 / 0.07 / 2.12 / 0.00 / 16.6 | 27% | 2% | 0% | 71% | 0 | UNIQUE |
| Zone3/0631 | 7-zone3-mixed | 5 | 12x12 | 117 | 15.4 | 0.11 / 1.44 / 13.8 / 0.00 / 0.02 | 20% | 80% | 0% | 0% | 0 | UNIQUE |
| Zone3/1395b | 6-compass | 5 | 14x16 | 138 | 15.4 | 0.12 / 0.66 / 14.5 / 0.00 / 0.02 | 7% | 93% | 0% | 0% | 0 | UNIQUE |
| Zone1/1100 | 11-mixed-rules | 5 | 13x13 | 96 | 14.2 | 0.01 / 0.12 / 5.55 / 0.00 / 8.48 | 20% | 7% | 0% | 74% | 0 | UNIQUE |
| Zone3/0970 | 2-loopy | 4 | 16x13 | 115 | 13.4 | 0.00 / 0.05 / 0.62 / 0.00 / 12.7 | 19% | 2% | 0% | 79% | 61 | UNIQUE |
| Zone2/1346 | 5-minmax | 4 | 6x6 | 36 | 12.8 | 0.00 / 0.02 / 0.05 / 0.00 / 12.8 | 2% | 0% | 0% | 98% | 60 | UNIQUE |
| Zone3/1086 | 6-compass-main | 5 | 7x7 | 49 | 11.9 | 0.00 / 3.04 / 8.14 / 0.00 / 0.73 | 7% | 2% | 0% | 90% | 0 | UNIQUE |
| Zone2/1356 | 6-same-size-no-touch | 4 | 7x7 | 49 | 10.4 | 0.01 / 0.02 / 0.08 / 0.00 / 10.3 | 0% | 0% | 0% | 100% | 0 | UNIQUE |
| Zone3/1085a | 8-endgame | 6 | 12x12 | 144 | 9.87 | 0.02 / 0.07 / 8.65 / 0.00 / 1.11 | 3% | 66% | 0% | 31% | 0 | UNIQUE |
| Zone3/1322 | 8-endgame | 6 | 12x12 | 97 | 9.45 | 0.00 / 0.03 / 3.23 / 0.00 / 6.17 | 1% | 10% | 0% | 89% | 0 | UNIQUE |
| Zone3/1138 | 8-endgame | 7 | 11x11 | 121 | 8.54 | 0.00 / 0.04 / 2.20 / 0.00 / 6.28 | 2% | 0% | 98% | 98% | 0 | UNIQUE |
| Zone2/0745 | 1-area-numbers | 6 | 11x11 | 121 | 8.54 | 0.03 / 0.04 / 5.03 / 0.00 / 3.43 | 7% | 15% | 0% | 78% | 0 | UNIQUE |
| Zone3/0999 | 3-vertex-radar | 3 | 14x14 | 196 | 8.13 | 0.02 / 0.08 / 1.14 / 0.00 / 6.87 | 55% | 0% | 45% | 45% | 0 | UNIQUE |
| Zone3/0312 | 6-compass-main | 6 | 7x7 | 49 | 7.88 | 0.00 / 0.17 / 1.81 / 0.00 / 5.89 | 20% | 4% | 0% | 76% | 0 | UNIQUE |
| Zone3/1110 | 7-zone3-mixed | 4 | 9x9 | 81 | 7.67 | 0.03 / 1.63 / 4.76 / 0.00 / 1.23 | 28% | 2% | 0% | 70% | 0 | UNIQUE |
| Zone1/0116 | 9-region-size-x | 6 | 9x9 | 81 | 7.64 | 0.00 / 0.05 / 0.47 / 0.00 / 7.09 | 2% | 20% | 78% | 78% | 49 | UNIQUE |
| Zone3/1258 | 6-compass-main | 7 | 13x13 | 169 | 7.41 | 0.04 / 0.35 / 6.98 / 0.00 / 0.02 | 19% | 81% | 0% | 0% | 0 | UNIQUE |
| Zone2/1195 | 8-all-rectangles | 4 | 8x7 | 47 | 6.25 | 0.01 / 0.05 / 5.12 / 0.00 / 1.05 | 0% | 3% | 0% | 97% | 0 | UNIQUE |
| Zone3/0994 | 3-vertex-radar | 4 | 9x9 | 77 | 6.23 | 0.01 / 0.03 / 0.51 / 0.00 / 5.66 | 8% | 19% | 0% | 73% | 0 | UNIQUE |
| Zone3/0208 | 8-endgame | 7 | 13x14 | 90 | 5.99 | 0.01 / 0.20 / 3.79 / 0.00 / 1.97 | 0% | 1% | 0% | 99% | 0 | UNIQUE |
| Zone3/0928 | 4-difference | 6 | 9x7 | 63 | 5.61 | 0.00 / 1.53 / 2.77 / 0.00 / 1.28 | 20% | 2% | 0% | 78% | 0 | UNIQUE |
| Zone3/1082 | 6-compass-main | 5 | 7x8 | 56 | 5.51 | 0.01 / 1.08 / 4.39 / 0.00 / 0.01 | 9% | 91% | 0% | 0% | 0 | UNIQUE |
| Zone3/0374 | 6-compass-main | 5 | 9x7 | 57 | 5.49 | 0.01 / 1.59 / 3.86 / 0.00 / 0.01 | 40% | 60% | 0% | 0% | 0 | UNIQUE |
| Zone3/0268 | 8-endgame | 7 | 15x15 | 200 | 5.47 | 0.00 / 0.14 / 3.46 / 0.00 / 1.85 | 20% | 38% | 0% | 42% | 0 | UNIQUE |
| Zone2/1114 | 10-zone2-mixed | 7 | 10x9 | 86 | 5.42 | 0.01 / 0.09 / 5.29 / 0.00 / 0.01 | 27% | 73% | 0% | 0% | 0 | UNIQUE |
| Zone2/0832 | 8-all-rectangles | 5 | 8x7 | 56 | 5.08 | 0.01 / 0.12 / 4.93 / 0.00 / 0.01 | 13% | 87% | 0% | 0% | 0 | UNIQUE |
| Zone3/1093 | 6-compass-main | 4 | 11x10 | 110 | 4.78 | 0.02 / 0.48 / 4.25 / 0.00 / 0.01 | 27% | 73% | 0% | 0% | 0 | UNIQUE |
| Zone3/1080 | 6-compass-main | 7 | 10x10 | 100 | 4.74 | 0.01 / 0.18 / 4.52 / 0.00 / 0.01 | 11% | 89% | 0% | 0% | 0 | UNIQUE |

## Outliers: much slower per tile than their peers (same category and difficulty; at least 0.3 s, at least 4x the peer median)

| id | category | diff | tiles | total s | ms per tile | peer median ms per tile | x peers | left |
|---|---|---|---|---|---|---|---|---|
| Zone2/1356 | 6-same-size-no-touch | 4 | 49 | 10.4 | 212.3 | 2.5 | 85.5 | 100% |
| Zone1/1434 | 7-slash-pack | 6 | 172 | 43.8 | 254.4 | 3.3 | 78.1 | 48% |
| Zone2/1346 | 5-minmax | 4 | 36 | 12.8 | 356.6 | 5.2 | 68.3 | 98% |
| Zone3/0970 | 2-loopy | 4 | 115 | 13.4 | 116.6 | 2.2 | 53.5 | 79% |
| Zone3/1137 | 7-zone3-mixed | 4 | 99 | 18.9 | 190.6 | 3.6 | 52.6 | 71% |
| Zone1/0116 | 9-region-size-x | 6 | 81 | 7.64 | 94.3 | 2.4 | 38.9 | 78% |
| Zone2/1352 | 6-same-size-no-touch | 5 | 40 | 3.66 | 91.5 | 2.8 | 32.8 | 94% |
| Zone3/1395b | 6-compass | 5 | 138 | 15.4 | 111.3 | 3.8 | 29.5 | 0% |
| Zone2/0832 | 8-all-rectangles | 5 | 56 | 5.08 | 90.7 | 3.1 | 29.5 | 0% |
| Zone3/1248 | 8-endgame | 7 | 100 | 31.1 | 311 | 11.5 | 27 | 100% |
| Zone3/1110 | 7-zone3-mixed | 4 | 81 | 7.67 | 94.7 | 3.6 | 26.1 | 70% |
| Zone2/0745 | 1-area-numbers | 6 | 121 | 8.54 | 70.6 | 2.7 | 25.7 | 78% |
| Zone3/0631 | 7-zone3-mixed | 5 | 117 | 15.4 | 131.5 | 5.3 | 24.9 | 0% |
| Zone1/1100 | 11-mixed-rules | 5 | 96 | 14.2 | 147.7 | 6 | 24.5 | 74% |
| Zone1/0030 | 9-region-size-x | 6 | 60 | 3.52 | 58.6 | 2.4 | 24.2 | 96% |
| Zone3/0928 | 4-difference | 6 | 63 | 5.61 | 89 | 4 | 22.5 | 78% |
| Zone3/1086 | 6-compass-main | 5 | 49 | 11.9 | 243.5 | 10.8 | 22.5 | 90% |
| Zone2/1195 | 8-all-rectangles | 4 | 47 | 6.25 | 133 | 6.2 | 21.6 | 97% |
| Zone3/0994 | 3-vertex-radar | 4 | 77 | 6.23 | 80.9 | 3.9 | 20.6 | 73% |
| Zone2/1114 | 10-zone2-mixed | 7 | 86 | 5.42 | 63 | 3.3 | 19.1 | 0% |
| Zone2/0864b | 10-zone2-mixed | 4 | 72 | 4.67 | 64.9 | 3.4 | 18.8 | 76% |
| Zone3/0999 | 3-vertex-radar | 3 | 196 | 8.13 | 41.5 | 2.6 | 15.9 | 45% |
| Zone3/0312 | 6-compass-main | 6 | 49 | 7.88 | 160.9 | 10.6 | 15.2 | 76% |
| Zone3/1322 | 8-endgame | 6 | 97 | 9.45 | 97.4 | 6.5 | 15.1 | 89% |
| Zone3/1260 | 6-compass-main | 3 | 49 | 3.75 | 76.6 | 5.8 | 13.1 | 75% |
| Zone2/0010 | 8-all-rectangles | 4 | 36 | 2.75 | 76.5 | 6.2 | 12.4 | 0% |
| Zone2/0850 | 9-no-rectangles | 6 | 49 | 2.08 | 42.4 | 3.5 | 12.2 | 75% |
| Zone3/1003 | 3-vertex-radar | 6 | 100 | 4.01 | 40.1 | 3.3 | 12 | 0% |
| Zone1/0099 | 6-gemini-delta | 2 | 50 | 2.60 | 51.9 | 4.7 | 11.1 | 100% |
| Zone2/0739 | 1-area-numbers | 5 | 61 | 1.81 | 29.7 | 2.7 | 10.8 | 97% |

## The 20 puzzles with the largest share of edges left to the final solver

| id | category | diff | tiles | spots | left | left % | total s | final s | verdict |
|---|---|---|---|---|---|---|---|---|---|
| Zone1/0099 | 6-gemini-delta | 2 | 50 | 73 | 73 | 100% | 2.60 | 2.25 | UNIQUE |
| Zone1/0276 | 10-same-shape-no-touch | 3 | 16 | 13 | 13 | 100% | 0.10 | 0.03 | UNIQUE |
| Zone1/1065 | 10-same-shape-no-touch | 3 | 25 | 40 | 40 | 100% | 0.15 | 0.05 | UNIQUE |
| Zone1/0130 | 9-region-size-x | 4 | 36 | 46 | 46 | 100% | 0.54 | 0.28 | UNIQUE |
| Zone1/0528 | 6-gemini-delta | 4 | 54 | 72 | 72 | 100% | 1.15 | 0.67 | UNIQUE |
| Zone2/1177 | 3-all-regions-same | 2 | 18 | 27 | 27 | 100% | 0.14 | 0.03 | UNIQUE |
| Zone2/0372 | 3-all-regions-same | 3 | 18 | 22 | 22 | 100% | 0.13 | 0.07 | UNIQUE |
| Zone2/1120 | 10-zone2-mixed | 3 | 18 | 23 | 23 | 100% | 0.16 | 0.03 | UNIQUE |
| Zone2/1345 | 5-minmax | 3 | 25 | 34 | 34 | 100% | 0.36 | 0.26 | UNIQUE |
| Zone2/1348 | 5-minmax | 4 | 25 | 37 | 37 | 100% | 0.73 | 0.53 | UNIQUE |
| Zone2/1351 | 5-minmax | 4 | 35 | 54 | 54 | 100% | 1.50 | 1.40 | UNIQUE |
| Zone2/1356 | 6-same-size-no-touch | 4 | 49 | 68 | 68 | 100% | 10.4 | 10.3 | UNIQUE |
| Zone2/1365 | 3-all-regions-same | 4 | 52 | 83 | 83 | 100% | 0.90 | 0.70 | UNIQUE |
| Zone3/0893 | 4-difference | 2 | 16 | 22 | 22 | 100% | 0.12 | 0.02 | UNIQUE |
| Zone3/0493 | 7-zone3-mixed | 3 | 64 | 108 | 108 | 100% | 2.10 | 1.61 | UNIQUE |
| Zone3/1385 | 4-difference | 3 | 26 | 25 | 25 | 100% | 0.10 | 0.04 | UNIQUE |
| Zone3/1401 | 4-difference | 3 | 20 | 27 | 27 | 100% | 0.16 | 0.08 | UNIQUE |
| Zone3/1039 | 4-difference | 4 | 20 | 26 | 26 | 100% | 0.15 | 0.08 | UNIQUE |
| Zone3/1248 | 8-endgame | 7 | 100 | 179 | 179 | 100% | 31.1 | 29.5 | UNIQUE |
| Zone2/0960 | 3-all-regions-same | 7 | 92 | 158 | 157 | 99% | 1.27 | 0.11 | UNIQUE |

## Decided without any search: 1087 of 1225 puzzles (every edge by instant propagation or look-ahead; scan tests = 0, left = 0)

## Which rules decided the edges (all puzzles, edges per phase; `search` = proved by a narrow search)

| rule | instant | probe | scan |
|---|---|---|---|
| basic | 5221 | 6055 | 254 |
| bank-place | 9006 | 1178 | 200 |
| grow | 4513 | 3315 | 60 |
| size | 2688 | 2340 | 28 |
| stamp-place | 1976 | 1074 | 0 |
| min-grow | 1749 | 985 | 0 |
| boxy-place | 2165 | 506 | 0 |
| reach | 1042 | 1092 | 39 |
| rose-grow | 1523 | 570 | 0 |
| loo-outline | 1769 | 36 | 0 |
| cmp-wrap | 1260 | 370 | 0 |
| pal-link | 1212 | 400 | 0 |
| mismatch-hall | 1422 | 142 | 0 |
| size-range | 667 | 849 | 10 |
| rose-pair | 910 | 407 | 0 |
| tower-link | 952 | 297 | 68 |
| gemini-place | 577 | 485 | 119 |
| min-reach | 488 | 564 | 0 |
| pal-wall | 636 | 379 | 0 |
| stamp-size | 505 | 467 | 0 |
| tower-wall | 510 | 394 | 59 |
| compass | 710 | 216 | 0 |
| loo-color | 337 | 490 | 0 |
| loo-corner | 249 | 560 | 0 |
| rose-region | 354 | 364 | 0 |
| rose-reach | 352 | 296 | 0 |
| shape-fit | 308 | 326 | 0 |
| solitude-grow | 371 | 224 | 0 |
| cmp-box | 577 | 0 | 0 |
| bank-fit | 440 | 117 | 4 |
| bri-three | 322 | 224 | 0 |
| box-hall | 353 | 142 | 0 |
| mingle-area-merge | 274 | 208 | 0 |
| solitude-pair | 235 | 208 | 0 |
| range-region | 152 | 243 | 0 |
| boxy-corner | 243 | 142 | 0 |
| shape-range | 183 | 123 | 18 |
| solitude-region | 125 | 195 | 0 |
| pal-pair | 257 | 58 | 0 |
| rose-cut | 222 | 72 | 0 |

Files: the .jsonl has everything per puzzle (per-rule counts per phase, scan test counts, final-search progress, wrong-edge examples); the .csv is the flat version of the main numbers.
