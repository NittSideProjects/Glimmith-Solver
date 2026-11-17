# Glimmith corpus run

* puzzles in this report: **1225**   (runs merged: 1; the latest record of each puzzle counts)
* solver core: `solver-core.v127.js` (sha1 5cfe3657e8b5), node v22.23.4, linux x64, 4 cores (Intel(R) Xeon(R) Processor @ 2.10GHz), jobs 2  (more than 1 job = timings are noisier)
* hard limit per puzzle: 60 s (worker killed 3 s after that); solver settings = the page's defaults: {"testMs":100,"restart":"continue","order":"clues","focusMode":"near","nearShare":0.4,"useWitness":true,"stopAtTwo":true,"nodeBudget":0}
* summed solver time: 12.9 min

How to read the edge columns: every edge that is not a hand-drawn wall is decided by exactly one of **instant** (first propagation, nothing assumed), **probe** (look-ahead: assume it, propagate, contradiction; still no search), **scan** ("wall per wall": a narrow exact search per edge, plus the edges that then follow by propagation; the column "proved by the search itself" counts only the edges the search settled directly) or is **left** for the final exact solver. The four shares are means over the puzzles of the row (percent of that puzzle's edges).

## Verdicts

| verdict | puzzles | meaning |
|---|---|---|
| UNIQUE | 1225 | the solver proved the stored solution is the only tiling |

## Time and edge split by zone and difficulty

| zone / difficulty | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Zone1 d1 | 55 | 25 | 60 | 87 | 186 | 3.5 | 97% | 3% | 0% | 0% | 0% |  |
| Zone1 d2 | 75 | 36 | 69 | 139 | 2852 | 11.4 | 82% | 15% | 2% | 0% | 3% |  |
| Zone1 d3 | 77 | 40 | 104 | 279 | 1811 | 14.5 | 70% | 21% | 0% | 0% | 9% |  |
| Zone1 d4 | 51 | 56 | 180 | 573 | 3273 | 16.1 | 60% | 31% | 0% | 0% | 9% |  |
| Zone1 d5 | 33 | 75 | 415 | 2303 | 13662 | 39.7 | 45% | 40% | 5% | 0% | 15% |  |
| Zone1 d6 | 15 | 98 | 470 | 6619 | 35274 | 59.4 | 46% | 26% | 12% | 0% | 27% |  |
| Zone1 d7 | 3 | 99 | 614 | 686 | 704 | 1.4 | 50% | 50% | 0% | 0% | 0% |  |
| Zone2 d1 | 48 | 21 | 57 | 86 | 158 | 3.0 | 95% | 5% | 0% | 0% | 0% |  |
| Zone2 d2 | 104 | 30 | 74 | 176 | 824 | 11.2 | 66% | 29% | 0% | 0% | 5% |  |
| Zone2 d3 | 119 | 37 | 113 | 314 | 1218 | 18.4 | 51% | 39% | 0% | 0% | 10% |  |
| Zone2 d4 | 86 | 47 | 160 | 765 | 29322 | 93.1 | 45% | 43% | 0% | 0% | 12% |  |
| Zone2 d5 | 47 | 60 | 241 | 948 | 4631 | 23.0 | 48% | 41% | 0% | 0% | 10% |  |
| Zone2 d6 | 26 | 78 | 493 | 3009 | 6829 | 28.3 | 36% | 49% | 0% | 0% | 15% |  |
| Zone2 d7 | 8 | 90 | 983 | 4909 | 8083 | 18.8 | 21% | 50% | 7% | 0% | 28% |  |
| Zone3 d1 | 45 | 17 | 48 | 63 | 201 | 2.4 | 94% | 6% | 0% | 0% | 0% |  |
| Zone3 d2 | 103 | 31 | 81 | 206 | 664 | 11.8 | 72% | 24% | 0% | 0% | 4% |  |
| Zone3 d3 | 114 | 43 | 128 | 548 | 9120 | 38.1 | 66% | 28% | 0% | 0% | 6% |  |
| Zone3 d4 | 84 | 55 | 255 | 2224 | 20523 | 90.1 | 46% | 40% | 0% | 0% | 14% |  |
| Zone3 d5 | 56 | 74 | 489 | 2934 | 16035 | 86.5 | 36% | 55% | 0% | 0% | 9% |  |
| Zone3 d6 | 46 | 91 | 820 | 3328 | 15193 | 85.1 | 32% | 57% | 1% | 0% | 11% |  |
| Zone3 d7 | 30 | 113 | 1908 | 10796 | 19159 | 116.7 | 23% | 50% | 3% | 0% | 27% |  |

## By zone

| zone | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Zone1 | 309 | 46 | 93 | 618 | 35274 | 146.0 | 72% | 21% | 2% | 0% | 7% |  |
| Zone2 | 438 | 42 | 109 | 577 | 29322 | 195.6 | 57% | 35% | 0% | 0% | 9% |  |
| Zone3 | 478 | 53 | 160 | 1879 | 20523 | 430.7 | 57% | 35% | 0% | 0% | 9% |  |

## By difficulty (all zones)

| difficulty | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| d1 | 148 | 21 | 54 | 86 | 201 | 8.9 | 95% | 5% | 0% | 0% | 0% |  |
| d2 | 282 | 32 | 74 | 181 | 2852 | 34.4 | 72% | 24% | 1% | 0% | 4% |  |
| d3 | 310 | 40 | 115 | 360 | 9120 | 71.0 | 61% | 30% | 0% | 0% | 8% |  |
| d4 | 221 | 52 | 196 | 964 | 29322 | 199.3 | 49% | 39% | 0% | 0% | 12% |  |
| d5 | 136 | 69 | 325 | 2004 | 16035 | 149.2 | 42% | 47% | 1% | 0% | 11% |  |
| d6 | 87 | 88 | 642 | 3836 | 35274 | 172.7 | 36% | 49% | 3% | 0% | 15% |  |
| d7 | 41 | 107 | 1443 | 9220 | 19159 | 136.9 | 25% | 50% | 4% | 0% | 25% |  |

## By mechanic (the game's category)

| category | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Zone1 1-single-shape | 11 | 17 | 48 | 52 | 71 | 0.5 | 91% | 9% | 0% | 0% | 0% |  |
| Zone1 2-shape-bank | 11 | 33 | 50 | 99 | 160 | 0.7 | 100% | 0% | 0% | 0% | 0% |  |
| Zone1 3-gemini-delta | 8 | 26 | 74 | 111 | 123 | 0.6 | 100% | 0% | 0% | 0% | 0% |  |
| Zone1 4-slash-pack | 5 | 25 | 57 | 71 | 72 | 0.3 | 100% | 0% | 0% | 0% | 0% |  |
| Zone1 5-shape-bank | 31 | 63 | 83 | 206 | 257 | 3.3 | 97% | 3% | 0% | 0% | 0% |  |
| Zone1 6-gemini-delta | 33 | 40 | 120 | 474 | 2766 | 10.7 | 74% | 20% | 3% | 0% | 6% |  |
| Zone1 7-slash-pack | 36 | 48 | 92 | 245 | 35274 | 44.1 | 89% | 7% | 2% | 0% | 4% |  |
| Zone1 8-poly | 39 | 42 | 73 | 117 | 614 | 3.6 | 87% | 13% | 0% | 0% | 0% |  |
| Zone1 9-region-size-x | 44 | 44 | 90 | 878 | 7732 | 22.9 | 48% | 39% | 4% | 0% | 13% |  |
| Zone1 10-same-shape-no-touch | 41 | 45 | 172 | 1017 | 4949 | 21.5 | 47% | 38% | 4% | 0% | 15% |  |
| Zone1 11-mixed-rules | 50 | 60 | 232 | 1468 | 13662 | 37.8 | 54% | 31% | 0% | 0% | 15% |  |
| Zone2 1-area-numbers | 43 | 43 | 90 | 1189 | 6829 | 21.3 | 58% | 36% | 0% | 0% | 5% |  |
| Zone2 2-palisade | 60 | 41 | 79 | 226 | 843 | 6.8 | 81% | 18% | 0% | 0% | 1% |  |
| Zone2 3-all-regions-same | 28 | 41 | 156 | 605 | 1623 | 8.4 | 18% | 43% | 0% | 0% | 39% |  |
| Zone2 4-all-regions-different | 48 | 33 | 122 | 331 | 3549 | 11.6 | 72% | 23% | 1% | 0% | 5% |  |
| Zone2 5-minmax | 46 | 41 | 124 | 450 | 13558 | 23.0 | 56% | 33% | 0% | 0% | 11% |  |
| Zone2 6-same-size-no-touch | 45 | 43 | 95 | 594 | 17095 | 28.9 | 59% | 33% | 0% | 0% | 9% |  |
| Zone2 7-1SPR | 37 | 43 | 117 | 706 | 1970 | 10.7 | 47% | 45% | 0% | 0% | 8% |  |
| Zone2 8-all-rectangles | 40 | 46 | 125 | 545 | 6553 | 20.7 | 78% | 19% | 0% | 0% | 3% |  |
| Zone2 9-no-rectangles | 43 | 38 | 114 | 517 | 3528 | 13.2 | 27% | 65% | 0% | 0% | 8% |  |
| Zone2 10-zone2-mixed | 48 | 48 | 151 | 779 | 29322 | 51.0 | 49% | 41% | 0% | 0% | 10% |  |
| Zone3 1-tatami | 70 | 44 | 106 | 372 | 2620 | 16.7 | 58% | 33% | 1% | 0% | 8% |  |
| Zone3 2-loopy | 58 | 61 | 113 | 570 | 9174 | 22.4 | 61% | 34% | 0% | 0% | 5% |  |
| Zone3 3-vertex-radar | 59 | 44 | 116 | 658 | 9120 | 31.1 | 47% | 47% | 1% | 0% | 6% |  |
| Zone3 4-difference | 53 | 38 | 146 | 688 | 15193 | 38.0 | 45% | 35% | 0% | 0% | 19% |  |
| Zone3 5-inequality | 56 | 39 | 128 | 666 | 2719 | 18.6 | 52% | 41% | 1% | 0% | 6% |  |
| Zone3 6-compass | 34 | 29 | 60 | 156 | 13044 | 19.1 | 95% | 5% | 0% | 0% | 0% |  |
| Zone3 6-compass-main | 66 | 56 | 546 | 4701 | 13617 | 109.9 | 76% | 16% | 0% | 0% | 8% |  |
| Zone3 7-finalboss | 1 | 176 | 1510 | 1510 | 1510 | 1.5 | 51% | 49% | 0% | 0% | 0% |  |
| Zone3 7-zone3-mixed | 47 | 64 | 381 | 2074 | 20523 | 73.5 | 43% | 49% | 0% | 0% | 8% |  |
| Zone3 8-endgame | 34 | 113 | 1313 | 8613 | 19159 | 99.8 | 33% | 48% | 3% | 0% | 19% |  |

## By feature tag (a puzzle counts once per tag it has)

| feature | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| area | 219 | 47 | 117 | 1659 | 17095 | 170.4 | 50% | 42% | 0% | 0% | 8% |  |
| bank | 235 | 49 | 98 | 584 | 4600 | 63.9 | 81% | 14% | 2% | 0% | 5% |  |
| compass | 128 | 52 | 347 | 3597 | 16035 | 180.3 | 77% | 18% | 0% | 0% | 6% |  |
| palisade | 169 | 51 | 105 | 494 | 29322 | 87.3 | 62% | 34% | 0% | 0% | 3% |  |
| rose | 179 | 56 | 196 | 1539 | 35274 | 163.3 | 60% | 28% | 1% | 0% | 12% |  |
| stamp | 171 | 53 | 118 | 1034 | 13662 | 92.0 | 58% | 33% | 0% | 0% | 9% |  |
| wall-delta | 98 | 49 | 179 | 1385 | 7732 | 56.3 | 62% | 26% | 3% | 0% | 12% |  |
| wall-diff | 69 | 46 | 175 | 836 | 15193 | 45.6 | 41% | 44% | 0% | 0% | 16% |  |
| wall-gemini | 116 | 49 | 220 | 1718 | 19159 | 102.0 | 55% | 29% | 2% | 0% | 16% |  |
| wall-gt | 67 | 46 | 171 | 1116 | 20523 | 44.3 | 45% | 49% | 1% | 0% | 6% |  |
| wall-lt | 64 | 46 | 150 | 967 | 20523 | 42.9 | 50% | 44% | 1% | 0% | 6% |  |
| wall-plain | 387 | 47 | 118 | 882 | 35274 | 278.5 | 57% | 32% | 0% | 0% | 11% |  |
| watchtower | 85 | 55 | 168 | 1889 | 20523 | 81.8 | 45% | 46% | 2% | 0% | 9% |  |

## The 30 slowest puzzles

| id | category | diff | size | tiles | total s | ctx / instant / probe / scan / final (s) | instant | probe | scan | left | tests | verdict |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Zone1/1434 | 7-slash-pack | 6 | 15x15 | 172 | 35.3 | 0.03 / 0.28 / 4.94 / 0.00 / 30.0 | 17% | 35% | 0% | 48% | 0 | UNIQUE |
| Zone2/0864b | 10-zone2-mixed | 4 | 10x10 | 72 | 29.3 | 0.00 / 2.06 / 0.50 / 0.00 / 26.7 | 13% | 11% | 0% | 76% | 60 | UNIQUE |
| Zone3/1137 | 7-zone3-mixed | 4 | 11x9 | 99 | 20.5 | 0.01 / 0.09 / 1.92 / 0.00 / 18.5 | 27% | 2% | 0% | 71% | 0 | UNIQUE |
| Zone3/1248 | 8-endgame | 7 | 10x10 | 100 | 19.2 | 0.00 / 0.06 / 0.87 / 0.00 / 18.2 | 0% | 0% | 0% | 100% | 60 | UNIQUE |
| Zone2/1356 | 6-same-size-no-touch | 4 | 7x7 | 49 | 17.1 | 0.01 / 0.02 / 0.09 / 0.00 / 17.0 | 0% | 0% | 0% | 100% | 0 | UNIQUE |
| Zone3/0631 | 7-zone3-mixed | 5 | 12x12 | 117 | 16.0 | 0.08 / 1.59 / 14.3 / 0.00 / 0.02 | 20% | 80% | 0% | 0% | 0 | UNIQUE |
| Zone3/0928 | 4-difference | 6 | 9x7 | 63 | 15.2 | 0.00 / 3.37 / 2.57 / 0.00 / 9.22 | 20% | 2% | 0% | 78% | 60 | UNIQUE |
| Zone1/1100 | 11-mixed-rules | 5 | 13x13 | 96 | 13.7 | 0.01 / 0.08 / 5.39 / 0.00 / 8.15 | 20% | 7% | 0% | 74% | 0 | UNIQUE |
| Zone3/1258 | 6-compass-main | 7 | 13x13 | 169 | 13.6 | 0.06 / 1.00 / 12.5 / 0.00 / 0.04 | 19% | 81% | 0% | 0% | 0 | UNIQUE |
| Zone2/1346 | 5-minmax | 4 | 6x6 | 36 | 13.6 | 0.00 / 0.01 / 0.05 / 0.00 / 13.5 | 2% | 0% | 0% | 98% | 60 | UNIQUE |
| Zone3/0208 | 8-endgame | 7 | 13x14 | 90 | 13.3 | 0.02 / 0.18 / 3.86 / 0.00 / 9.24 | 0% | 1% | 0% | 99% | 60 | UNIQUE |
| Zone3/1395b | 6-compass | 5 | 14x16 | 138 | 13.0 | 0.12 / 0.69 / 12.2 / 0.00 / 0.02 | 7% | 93% | 0% | 0% | 0 | UNIQUE |
| Zone3/0312 | 6-compass-main | 6 | 7x7 | 49 | 13.0 | 0.00 / 0.24 / 2.30 / 0.00 / 10.5 | 20% | 4% | 0% | 76% | 0 | UNIQUE |
| Zone3/1086 | 6-compass-main | 5 | 7x7 | 49 | 12.1 | 0.00 / 2.79 / 8.48 / 0.00 / 0.77 | 7% | 2% | 0% | 90% | 0 | UNIQUE |
| Zone3/0930d-real | 4-difference | 7 | 13x13 | 91 | 10.5 | 0.03 / 0.06 / 0.36 / 0.00 / 10.0 | 10% | 0% | 0% | 90% | 60 | UNIQUE |
| Zone3/1085a | 8-endgame | 6 | 12x12 | 144 | 10.3 | 0.01 / 0.08 / 9.14 / 0.00 / 1.04 | 3% | 66% | 0% | 31% | 0 | UNIQUE |
| Zone3/1110 | 7-zone3-mixed | 4 | 9x9 | 81 | 9.27 | 0.04 / 2.17 / 5.40 / 0.00 / 1.65 | 28% | 2% | 0% | 70% | 0 | UNIQUE |
| Zone3/1138 | 8-endgame | 7 | 11x11 | 121 | 9.22 | 0.00 / 0.05 / 2.32 / 0.00 / 6.83 | 2% | 0% | 98% | 98% | 0 | UNIQUE |
| Zone3/0970 | 2-loopy | 4 | 16x13 | 115 | 9.17 | 0.00 / 0.05 / 0.71 / 0.00 / 8.39 | 19% | 2% | 0% | 79% | 61 | UNIQUE |
| Zone3/0999 | 3-vertex-radar | 3 | 14x14 | 196 | 9.12 | 0.02 / 0.09 / 1.06 / 0.00 / 7.93 | 55% | 0% | 45% | 45% | 0 | UNIQUE |
| Zone2/1114 | 10-zone2-mixed | 7 | 10x9 | 86 | 8.08 | 0.01 / 0.13 / 7.42 / 0.00 / 0.50 | 27% | 40% | 0% | 33% | 0 | UNIQUE |
| Zone1/0116 | 9-region-size-x | 6 | 9x9 | 81 | 7.73 | 0.00 / 0.06 / 0.46 / 0.00 / 7.19 | 2% | 20% | 78% | 78% | 49 | UNIQUE |
| Zone3/1080 | 6-compass-main | 7 | 10x10 | 100 | 7.70 | 0.02 / 0.33 / 7.32 / 0.00 / 0.01 | 11% | 89% | 0% | 0% | 0 | UNIQUE |
| Zone3/1322 | 8-endgame | 6 | 12x12 | 97 | 7.20 | 0.00 / 0.04 / 2.53 / 0.00 / 4.60 | 1% | 10% | 0% | 89% | 0 | UNIQUE |
| Zone2/0745 | 1-area-numbers | 6 | 11x11 | 121 | 6.83 | 0.04 / 0.03 / 4.97 / 0.00 / 1.77 | 7% | 11% | 0% | 81% | 0 | UNIQUE |
| Zone3/0994 | 3-vertex-radar | 4 | 9x9 | 77 | 6.68 | 0.01 / 0.03 / 0.56 / 0.00 / 6.07 | 8% | 19% | 0% | 73% | 0 | UNIQUE |
| Zone2/1195 | 8-all-rectangles | 4 | 8x7 | 47 | 6.55 | 0.01 / 0.05 / 5.13 / 0.00 / 1.34 | 0% | 3% | 0% | 97% | 0 | UNIQUE |
| Zone3/1260 | 6-compass-main | 3 | 7x7 | 49 | 5.43 | 0.01 / 0.26 / 4.48 / 0.00 / 0.66 | 18% | 7% | 0% | 75% | 0 | UNIQUE |
| Zone3/1084 | 6-compass-main | 5 | 9x8 | 48 | 5.29 | 0.01 / 0.08 / 0.72 / 0.00 / 4.45 | 8% | 16% | 0% | 76% | 0 | UNIQUE |
| Zone1/0331 | 10-same-shape-no-touch | 6 | 11x11 | 121 | 4.95 | 0.02 / 0.06 / 3.57 / 0.00 / 1.28 | 1% | 9% | 0% | 90% | 0 | UNIQUE |

## Outliers: much slower per tile than their peers (same category and difficulty; at least 0.3 s, at least 4x the peer median)

| id | category | diff | tiles | total s | ms per tile | peer median ms per tile | x peers | left |
|---|---|---|---|---|---|---|---|---|
| Zone2/1356 | 6-same-size-no-touch | 4 | 49 | 17.1 | 348.9 | 2.4 | 144 | 100% |
| Zone2/0864b | 10-zone2-mixed | 4 | 72 | 29.3 | 407.2 | 3.8 | 106.9 | 76% |
| Zone1/1434 | 7-slash-pack | 6 | 172 | 35.3 | 205.1 | 2.5 | 81.1 | 48% |
| Zone2/1346 | 5-minmax | 4 | 36 | 13.6 | 376.6 | 5.5 | 68.7 | 98% |
| Zone3/0928 | 4-difference | 6 | 63 | 15.2 | 241.2 | 4.8 | 49.8 | 78% |
| Zone3/1137 | 7-zone3-mixed | 4 | 99 | 20.5 | 207.3 | 4.6 | 44.7 | 71% |
| Zone1/0116 | 9-region-size-x | 6 | 81 | 7.73 | 95.5 | 2.5 | 38.1 | 78% |
| Zone3/0970 | 2-loopy | 4 | 115 | 9.17 | 79.8 | 2.7 | 29.9 | 79% |
| Zone2/1114 | 10-zone2-mixed | 7 | 86 | 8.08 | 94 | 3.3 | 28.7 | 33% |
| Zone2/0832 | 8-all-rectangles | 5 | 56 | 4.63 | 82.7 | 3 | 27.5 | 0% |
| Zone1/0030 | 9-region-size-x | 6 | 60 | 3.71 | 61.8 | 2.5 | 24.7 | 96% |
| Zone3/1110 | 7-zone3-mixed | 4 | 81 | 9.27 | 114.4 | 4.6 | 24.7 | 70% |
| Zone3/0312 | 6-compass-main | 6 | 49 | 13.0 | 266.1 | 11.1 | 24 | 76% |
| Zone3/0930d-real | 4-difference | 7 | 91 | 10.5 | 115.6 | 4.8 | 23.9 | 90% |
| Zone3/1395b | 6-compass | 5 | 138 | 13.0 | 94.5 | 4 | 23.3 | 0% |
| Zone3/1086 | 6-compass-main | 5 | 49 | 12.1 | 246.3 | 10.8 | 22.9 | 90% |
| Zone1/1236 | 7-slash-pack | 5 | 90 | 4.60 | 51.1 | 2.5 | 20.2 | 84% |
| Zone3/1260 | 6-compass-main | 3 | 49 | 5.43 | 110.8 | 5.7 | 19.6 | 75% |
| Zone2/1352 | 6-same-size-no-touch | 5 | 40 | 2.00 | 49.9 | 2.6 | 19.1 | 94% |
| Zone2/1195 | 8-all-rectangles | 4 | 47 | 6.55 | 139.4 | 7.7 | 18.1 | 97% |
| Zone2/0745 | 1-area-numbers | 6 | 121 | 6.83 | 56.4 | 3.1 | 18 | 81% |
| Zone3/0994 | 3-vertex-radar | 4 | 77 | 6.68 | 86.8 | 5.1 | 16.9 | 73% |
| Zone3/0999 | 3-vertex-radar | 3 | 196 | 9.12 | 46.5 | 3.1 | 15.2 | 45% |
| Zone2/0349 | 4-all-regions-different | 7 | 60 | 3.55 | 59.1 | 4.2 | 14 | 57% |
| Zone1/1100 | 11-mixed-rules | 5 | 96 | 13.7 | 142.3 | 11.1 | 12.8 | 74% |
| Zone1/1439 | 10-same-shape-no-touch | 2 | 60 | 2.85 | 47.5 | 3.8 | 12.5 | 64% |
| Zone2/0850 | 9-no-rectangles | 6 | 49 | 2.47 | 50.4 | 4 | 12.5 | 75% |
| Zone3/0631 | 7-zone3-mixed | 5 | 117 | 16.0 | 137 | 11.1 | 12.3 | 0% |
| Zone1/0099 | 6-gemini-delta | 2 | 50 | 2.68 | 53.6 | 4.4 | 12.1 | 100% |
| Zone2/0010 | 8-all-rectangles | 4 | 36 | 3.14 | 87.2 | 7.7 | 11.3 | 0% |

## The 20 puzzles with the largest share of edges left to the final solver

| id | category | diff | tiles | spots | left | left % | total s | final s | verdict |
|---|---|---|---|---|---|---|---|---|---|
| Zone1/0099 | 6-gemini-delta | 2 | 50 | 73 | 73 | 100% | 2.68 | 2.34 | UNIQUE |
| Zone1/0276 | 10-same-shape-no-touch | 3 | 16 | 13 | 13 | 100% | 0.12 | 0.05 | UNIQUE |
| Zone1/1065 | 10-same-shape-no-touch | 3 | 25 | 40 | 40 | 100% | 0.17 | 0.06 | UNIQUE |
| Zone1/0130 | 9-region-size-x | 4 | 36 | 46 | 46 | 100% | 0.57 | 0.36 | UNIQUE |
| Zone1/0528 | 6-gemini-delta | 4 | 54 | 72 | 72 | 100% | 0.96 | 0.55 | UNIQUE |
| Zone2/1177 | 3-all-regions-same | 2 | 18 | 27 | 27 | 100% | 0.09 | 0.02 | UNIQUE |
| Zone2/0372 | 3-all-regions-same | 3 | 18 | 22 | 22 | 100% | 0.08 | 0.02 | UNIQUE |
| Zone2/1120 | 10-zone2-mixed | 3 | 18 | 23 | 23 | 100% | 0.13 | 0.03 | UNIQUE |
| Zone2/1345 | 5-minmax | 3 | 25 | 34 | 34 | 100% | 0.35 | 0.25 | UNIQUE |
| Zone2/1348 | 5-minmax | 4 | 25 | 37 | 37 | 100% | 0.69 | 0.52 | UNIQUE |
| Zone2/1351 | 5-minmax | 4 | 35 | 54 | 54 | 100% | 1.32 | 1.19 | UNIQUE |
| Zone2/1356 | 6-same-size-no-touch | 4 | 49 | 68 | 68 | 100% | 17.1 | 17.0 | UNIQUE |
| Zone2/1365 | 3-all-regions-same | 4 | 52 | 83 | 83 | 100% | 0.63 | 0.45 | UNIQUE |
| Zone3/0893 | 4-difference | 2 | 16 | 22 | 22 | 100% | 0.15 | 0.02 | UNIQUE |
| Zone3/0493 | 7-zone3-mixed | 3 | 64 | 108 | 108 | 100% | 2.11 | 1.66 | UNIQUE |
| Zone3/1385 | 4-difference | 3 | 26 | 25 | 25 | 100% | 0.12 | 0.04 | UNIQUE |
| Zone3/1401 | 4-difference | 3 | 20 | 27 | 27 | 100% | 0.15 | 0.07 | UNIQUE |
| Zone3/1039 | 4-difference | 4 | 20 | 26 | 26 | 100% | 0.19 | 0.11 | UNIQUE |
| Zone3/1248 | 8-endgame | 7 | 100 | 179 | 179 | 100% | 19.2 | 18.2 | UNIQUE |
| Zone2/0960 | 3-all-regions-same | 7 | 92 | 158 | 157 | 99% | 0.92 | 0.16 | UNIQUE |

## Decided without any search: 1082 of 1225 puzzles (every edge by instant propagation or look-ahead; scan tests = 0, left = 0)

## Which rules decided the edges (all puzzles, edges per phase; `search` = proved by a narrow search)

| rule | instant | probe | scan |
|---|---|---|---|
| bank-place | 8409 | 918 | 330 |
| basic | 4338 | 4964 | 229 |
| stamp-place | 3521 | 1969 | 0 |
| label | 2784 | 2232 | 44 |
| size | 2133 | 2129 | 32 |
| size-cut | 2142 | 1621 | 51 |
| bridge-count | 2055 | 1355 | 9 |
| grow | 1758 | 1352 | 21 |
| boxy-place | 2141 | 501 | 0 |
| loo-outline | 1772 | 39 | 0 |
| compass | 1324 | 425 | 0 |
| pal-link | 1269 | 420 | 0 |
| euler-count | 959 | 643 | 23 |
| mismatch-hall | 1346 | 108 | 47 |
| gemini-place | 828 | 485 | 76 |
| reach | 661 | 653 | 25 |
| tower-link | 938 | 279 | 42 |
| pal-wall | 640 | 404 | 0 |
| mingle-area-place | 410 | 613 | 0 |
| size-range | 399 | 581 | 2 |
| rose-cut | 747 | 170 | 0 |
| tower-wall | 471 | 357 | 57 |
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
| shape-fit | 170 | 268 | 0 |
| cmp-wrap | 335 | 66 | 0 |
| colour-count | 187 | 170 | 27 |
| boxy-corner | 253 | 128 | 0 |
| rose-grow | 294 | 80 | 0 |

Files: the .jsonl has everything per puzzle (per-rule counts per phase, scan test counts, final-search progress, wrong-edge examples); the .csv is the flat version of the main numbers.
