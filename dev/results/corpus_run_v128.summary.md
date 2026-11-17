# Glimmith corpus run

* puzzles in this report: **1225**   (runs merged: 1; the latest record of each puzzle counts)
* solver core: `solver-core.v128.js` (sha1 7f84aee56ed4), node v22.23.4, linux x64, 4 cores (Intel(R) Xeon(R) Processor @ 2.10GHz), jobs 3  (more than 1 job = timings are noisier)
* hard limit per puzzle: 60 s (worker killed 3 s after that); solver settings = the page's defaults: {"testMs":100,"restart":"continue","order":"clues","focusMode":"near","nearShare":0.4,"useWitness":true,"stopAtTwo":true,"nodeBudget":0}
* summed solver time: 13.0 min

How to read the edge columns: every edge that is not a hand-drawn wall is decided by exactly one of **instant** (first propagation, nothing assumed), **probe** (look-ahead: assume it, propagate, contradiction; still no search), **scan** ("wall per wall": a narrow exact search per edge, plus the edges that then follow by propagation; the column "proved by the search itself" counts only the edges the search settled directly) or is **left** for the final exact solver. The four shares are means over the puzzles of the row (percent of that puzzle's edges).

## Verdicts

| verdict | puzzles | meaning |
|---|---|---|
| UNIQUE | 1225 | the solver proved the stored solution is the only tiling |

## Time and edge split by zone and difficulty

| zone / difficulty | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Zone1 d1 | 55 | 25 | 91 | 141 | 374 | 5.5 | 97% | 3% | 0% | 0% | 0% |  |
| Zone1 d2 | 75 | 36 | 82 | 185 | 3098 | 13.3 | 82% | 15% | 2% | 0% | 3% |  |
| Zone1 d3 | 77 | 40 | 96 | 284 | 1561 | 14.2 | 70% | 21% | 0% | 0% | 9% |  |
| Zone1 d4 | 51 | 56 | 190 | 621 | 2748 | 16.2 | 60% | 31% | 0% | 0% | 9% |  |
| Zone1 d5 | 33 | 75 | 457 | 2319 | 13388 | 41.1 | 45% | 40% | 5% | 0% | 15% |  |
| Zone1 d6 | 15 | 98 | 445 | 6543 | 34686 | 58.9 | 46% | 26% | 12% | 0% | 27% |  |
| Zone1 d7 | 3 | 99 | 722 | 751 | 759 | 1.6 | 50% | 50% | 0% | 0% | 0% |  |
| Zone2 d1 | 48 | 21 | 57 | 86 | 115 | 2.9 | 95% | 5% | 0% | 0% | 0% |  |
| Zone2 d2 | 104 | 30 | 70 | 197 | 926 | 11.4 | 66% | 29% | 0% | 0% | 5% |  |
| Zone2 d3 | 119 | 37 | 122 | 264 | 1074 | 20.2 | 51% | 39% | 0% | 0% | 10% |  |
| Zone2 d4 | 86 | 47 | 132 | 720 | 26209 | 84.9 | 45% | 43% | 0% | 0% | 12% |  |
| Zone2 d5 | 47 | 60 | 219 | 895 | 4641 | 23.2 | 48% | 41% | 0% | 0% | 10% |  |
| Zone2 d6 | 26 | 78 | 483 | 3609 | 8710 | 33.5 | 36% | 49% | 0% | 0% | 15% |  |
| Zone2 d7 | 8 | 90 | 1097 | 5001 | 7805 | 19.2 | 21% | 50% | 7% | 0% | 28% |  |
| Zone3 d1 | 45 | 17 | 44 | 70 | 146 | 2.3 | 94% | 6% | 0% | 0% | 0% |  |
| Zone3 d2 | 103 | 31 | 67 | 172 | 625 | 10.6 | 72% | 24% | 0% | 0% | 4% |  |
| Zone3 d3 | 114 | 43 | 137 | 540 | 8567 | 37.7 | 66% | 28% | 0% | 0% | 6% |  |
| Zone3 d4 | 84 | 55 | 237 | 2044 | 18679 | 81.9 | 46% | 40% | 0% | 0% | 14% |  |
| Zone3 d5 | 56 | 74 | 528 | 3022 | 14437 | 87.5 | 36% | 55% | 0% | 0% | 9% |  |
| Zone3 d6 | 46 | 91 | 899 | 3881 | 15951 | 93.4 | 32% | 57% | 1% | 0% | 11% |  |
| Zone3 d7 | 30 | 113 | 1997 | 10880 | 19107 | 119.3 | 23% | 50% | 3% | 0% | 27% |  |

## By zone

| zone | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Zone1 | 309 | 46 | 117 | 701 | 34686 | 150.8 | 72% | 21% | 2% | 0% | 7% |  |
| Zone2 | 438 | 42 | 112 | 592 | 26209 | 195.3 | 57% | 35% | 0% | 0% | 9% |  |
| Zone3 | 478 | 53 | 153 | 1825 | 19107 | 432.6 | 57% | 35% | 0% | 0% | 9% |  |

## By difficulty (all zones)

| difficulty | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| d1 | 148 | 21 | 58 | 124 | 374 | 10.7 | 95% | 5% | 0% | 0% | 0% |  |
| d2 | 282 | 32 | 72 | 190 | 3098 | 35.4 | 72% | 24% | 1% | 0% | 4% |  |
| d3 | 310 | 40 | 121 | 401 | 8567 | 72.1 | 61% | 30% | 0% | 0% | 8% |  |
| d4 | 221 | 52 | 205 | 922 | 26209 | 183.0 | 49% | 39% | 0% | 0% | 12% |  |
| d5 | 136 | 69 | 367 | 1972 | 14437 | 151.8 | 42% | 47% | 1% | 0% | 11% |  |
| d6 | 87 | 88 | 699 | 4434 | 34686 | 185.7 | 36% | 49% | 3% | 0% | 15% |  |
| d7 | 41 | 107 | 1790 | 9579 | 19107 | 140.1 | 25% | 50% | 4% | 0% | 25% |  |

## By mechanic (the game's category)

| category | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Zone1 1-single-shape | 11 | 17 | 57 | 67 | 78 | 0.6 | 91% | 9% | 0% | 0% | 0% |  |
| Zone1 2-shape-bank | 11 | 33 | 64 | 72 | 156 | 0.7 | 100% | 0% | 0% | 0% | 0% |  |
| Zone1 3-gemini-delta | 8 | 26 | 98 | 149 | 206 | 0.9 | 100% | 0% | 0% | 0% | 0% |  |
| Zone1 4-slash-pack | 5 | 25 | 72 | 110 | 115 | 0.4 | 100% | 0% | 0% | 0% | 0% |  |
| Zone1 5-shape-bank | 31 | 63 | 86 | 202 | 325 | 3.5 | 97% | 3% | 0% | 0% | 0% |  |
| Zone1 6-gemini-delta | 33 | 40 | 152 | 636 | 3082 | 12.3 | 74% | 20% | 3% | 0% | 6% |  |
| Zone1 7-slash-pack | 36 | 48 | 116 | 317 | 34686 | 44.6 | 89% | 7% | 2% | 0% | 4% |  |
| Zone1 8-poly | 39 | 42 | 83 | 128 | 722 | 4.1 | 87% | 13% | 0% | 0% | 0% |  |
| Zone1 9-region-size-x | 44 | 44 | 120 | 893 | 7621 | 24.5 | 48% | 39% | 4% | 0% | 13% |  |
| Zone1 10-same-shape-no-touch | 41 | 45 | 210 | 1011 | 4105 | 21.5 | 47% | 38% | 4% | 0% | 15% |  |
| Zone1 11-mixed-rules | 50 | 60 | 222 | 1569 | 13388 | 37.8 | 54% | 31% | 0% | 0% | 15% |  |
| Zone2 1-area-numbers | 43 | 43 | 99 | 1058 | 6302 | 20.3 | 58% | 36% | 0% | 0% | 5% |  |
| Zone2 2-palisade | 60 | 41 | 76 | 182 | 844 | 6.5 | 81% | 18% | 0% | 0% | 1% |  |
| Zone2 3-all-regions-same | 28 | 41 | 186 | 676 | 1628 | 8.7 | 18% | 43% | 0% | 0% | 39% |  |
| Zone2 4-all-regions-different | 48 | 33 | 122 | 368 | 3800 | 11.8 | 72% | 23% | 1% | 0% | 5% |  |
| Zone2 5-minmax | 46 | 41 | 120 | 544 | 12913 | 22.2 | 56% | 33% | 0% | 0% | 11% |  |
| Zone2 6-same-size-no-touch | 45 | 43 | 95 | 611 | 14616 | 26.3 | 59% | 33% | 0% | 0% | 9% |  |
| Zone2 7-1SPR | 37 | 43 | 159 | 800 | 2151 | 11.4 | 47% | 45% | 0% | 0% | 8% |  |
| Zone2 8-all-rectangles | 40 | 46 | 130 | 544 | 6306 | 20.1 | 78% | 19% | 0% | 0% | 3% |  |
| Zone2 9-no-rectangles | 43 | 38 | 140 | 633 | 8710 | 20.3 | 27% | 65% | 0% | 0% | 8% |  |
| Zone2 10-zone2-mixed | 48 | 48 | 136 | 821 | 26209 | 47.6 | 49% | 41% | 0% | 0% | 10% |  |
| Zone3 1-tatami | 70 | 44 | 97 | 385 | 2701 | 17.0 | 58% | 33% | 1% | 0% | 8% |  |
| Zone3 2-loopy | 58 | 61 | 104 | 638 | 8880 | 22.1 | 61% | 34% | 0% | 0% | 5% |  |
| Zone3 3-vertex-radar | 59 | 44 | 133 | 750 | 8567 | 31.0 | 47% | 47% | 1% | 0% | 6% |  |
| Zone3 4-difference | 53 | 38 | 142 | 749 | 15951 | 38.7 | 45% | 35% | 0% | 0% | 19% |  |
| Zone3 5-inequality | 56 | 39 | 138 | 620 | 2728 | 18.1 | 52% | 41% | 1% | 0% | 6% |  |
| Zone3 6-compass | 34 | 29 | 56 | 137 | 14437 | 20.3 | 95% | 5% | 0% | 0% | 0% |  |
| Zone3 6-compass-main | 66 | 56 | 496 | 4571 | 14112 | 108.7 | 76% | 16% | 0% | 0% | 8% |  |
| Zone3 7-finalboss | 1 | 176 | 1655 | 1655 | 1655 | 1.7 | 51% | 49% | 0% | 0% | 0% |  |
| Zone3 7-zone3-mixed | 47 | 64 | 453 | 2024 | 18679 | 70.1 | 43% | 49% | 0% | 0% | 8% |  |
| Zone3 8-endgame | 34 | 113 | 1460 | 9010 | 19107 | 105.0 | 33% | 48% | 3% | 0% | 19% |  |

## By feature tag (a puzzle counts once per tag it has)

| feature | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| area | 219 | 47 | 118 | 1693 | 14616 | 167.6 | 50% | 42% | 0% | 0% | 8% |  |
| bank | 235 | 49 | 105 | 685 | 4703 | 69.5 | 81% | 14% | 2% | 0% | 5% |  |
| compass | 128 | 52 | 357 | 3835 | 14437 | 178.8 | 77% | 18% | 0% | 0% | 6% |  |
| palisade | 169 | 51 | 101 | 531 | 26209 | 84.5 | 62% | 34% | 0% | 0% | 3% |  |
| rose | 179 | 56 | 218 | 1640 | 34686 | 162.4 | 60% | 28% | 1% | 0% | 12% |  |
| stamp | 171 | 53 | 123 | 1145 | 13388 | 91.7 | 58% | 33% | 0% | 0% | 9% |  |
| wall-delta | 98 | 49 | 200 | 1549 | 8710 | 66.8 | 62% | 26% | 3% | 0% | 12% |  |
| wall-diff | 69 | 46 | 174 | 910 | 15951 | 47.5 | 41% | 44% | 0% | 0% | 16% |  |
| wall-gemini | 116 | 49 | 244 | 1770 | 19107 | 111.8 | 55% | 29% | 2% | 0% | 16% |  |
| wall-gt | 67 | 46 | 157 | 1250 | 18679 | 42.9 | 45% | 49% | 1% | 0% | 6% |  |
| wall-lt | 64 | 46 | 152 | 1139 | 18679 | 41.2 | 50% | 44% | 1% | 0% | 6% |  |
| wall-plain | 387 | 47 | 117 | 922 | 34686 | 284.2 | 57% | 32% | 0% | 0% | 11% |  |
| watchtower | 85 | 55 | 160 | 1875 | 18679 | 81.4 | 45% | 46% | 2% | 0% | 9% |  |

## The 30 slowest puzzles

| id | category | diff | size | tiles | total s | ctx / instant / probe / scan / final (s) | instant | probe | scan | left | tests | verdict |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Zone1/1434 | 7-slash-pack | 6 | 15x15 | 172 | 34.7 | 0.02 / 0.18 / 4.93 / 0.00 / 29.5 | 17% | 35% | 0% | 48% | 0 | UNIQUE |
| Zone2/0864b | 10-zone2-mixed | 4 | 10x10 | 72 | 26.2 | 0.00 / 2.07 / 0.40 / 0.00 / 23.7 | 13% | 11% | 0% | 76% | 60 | UNIQUE |
| Zone3/1248 | 8-endgame | 7 | 10x10 | 100 | 19.1 | 0.00 / 0.08 / 0.87 / 0.00 / 18.1 | 0% | 0% | 0% | 100% | 60 | UNIQUE |
| Zone3/1137 | 7-zone3-mixed | 4 | 11x9 | 99 | 18.7 | 0.01 / 0.08 / 1.57 / 0.00 / 17.0 | 27% | 2% | 0% | 71% | 0 | UNIQUE |
| Zone3/0928 | 4-difference | 6 | 9x7 | 63 | 16.0 | 0.00 / 3.83 / 2.88 / 0.00 / 9.23 | 20% | 2% | 0% | 78% | 60 | UNIQUE |
| Zone2/1356 | 6-same-size-no-touch | 4 | 7x7 | 49 | 14.6 | 0.01 / 0.02 / 0.10 / 0.00 / 14.5 | 0% | 0% | 0% | 100% | 0 | UNIQUE |
| Zone3/1395b | 6-compass | 5 | 14x16 | 138 | 14.4 | 0.13 / 0.76 / 13.5 / 0.00 / 0.02 | 7% | 93% | 0% | 0% | 0 | UNIQUE |
| Zone3/1258 | 6-compass-main | 7 | 13x13 | 169 | 14.1 | 0.04 / 0.96 / 13.1 / 0.00 / 0.03 | 19% | 81% | 0% | 0% | 0 | UNIQUE |
| Zone3/0631 | 7-zone3-mixed | 5 | 12x12 | 117 | 14.0 | 0.07 / 1.56 / 12.3 / 0.00 / 0.02 | 20% | 80% | 0% | 0% | 0 | UNIQUE |
| Zone3/0312 | 6-compass-main | 6 | 7x7 | 49 | 13.7 | 0.01 / 0.29 / 2.47 / 0.00 / 10.9 | 20% | 4% | 0% | 76% | 0 | UNIQUE |
| Zone1/1100 | 11-mixed-rules | 5 | 13x13 | 96 | 13.4 | 0.01 / 0.13 / 5.70 / 0.00 / 7.53 | 20% | 7% | 0% | 74% | 0 | UNIQUE |
| Zone3/1086 | 6-compass-main | 5 | 7x7 | 49 | 13.0 | 0.00 / 3.29 / 8.89 / 0.00 / 0.83 | 7% | 2% | 0% | 90% | 0 | UNIQUE |
| Zone2/1346 | 5-minmax | 4 | 6x6 | 36 | 12.9 | 0.00 / 0.02 / 0.07 / 0.00 / 12.8 | 2% | 0% | 0% | 98% | 60 | UNIQUE |
| Zone3/0208 | 8-endgame | 7 | 13x14 | 90 | 12.9 | 0.02 / 0.26 / 3.88 / 0.00 / 8.71 | 0% | 1% | 0% | 99% | 60 | UNIQUE |
| Zone3/1085a | 8-endgame | 6 | 12x12 | 144 | 11.0 | 0.02 / 0.12 / 9.77 / 0.00 / 1.10 | 3% | 66% | 0% | 31% | 0 | UNIQUE |
| Zone3/0930d-real | 4-difference | 7 | 13x13 | 91 | 10.7 | 0.02 / 0.06 / 0.41 / 0.00 / 10.2 | 10% | 0% | 0% | 90% | 60 | UNIQUE |
| Zone3/1138 | 8-endgame | 7 | 11x11 | 121 | 9.58 | 0.00 / 0.05 / 2.69 / 0.00 / 6.81 | 2% | 0% | 98% | 98% | 0 | UNIQUE |
| Zone3/0970 | 2-loopy | 4 | 16x13 | 115 | 8.88 | 0.00 / 0.06 / 0.62 / 0.00 / 8.19 | 19% | 2% | 0% | 79% | 61 | UNIQUE |
| Zone2/0850 | 9-no-rectangles | 6 | 7x7 | 49 | 8.71 | 0.01 / 0.02 / 0.49 / 0.00 / 8.15 | 0% | 25% | 0% | 75% | 60 | UNIQUE |
| Zone3/0999 | 3-vertex-radar | 3 | 14x14 | 196 | 8.57 | 0.02 / 0.12 / 0.96 / 0.00 / 7.43 | 55% | 0% | 45% | 45% | 0 | UNIQUE |
| Zone3/1110 | 7-zone3-mixed | 4 | 9x9 | 81 | 8.44 | 0.04 / 1.80 / 5.23 / 0.00 / 1.35 | 28% | 2% | 0% | 70% | 0 | UNIQUE |
| Zone2/1114 | 10-zone2-mixed | 7 | 10x9 | 86 | 7.81 | 0.01 / 0.21 / 7.02 / 0.00 / 0.55 | 27% | 40% | 0% | 33% | 0 | UNIQUE |
| Zone3/1322 | 8-endgame | 6 | 12x12 | 97 | 7.68 | 0.00 / 0.03 / 3.20 / 0.00 / 4.42 | 1% | 10% | 0% | 89% | 0 | UNIQUE |
| Zone1/0116 | 9-region-size-x | 6 | 9x9 | 81 | 7.62 | 0.00 / 0.04 / 0.47 / 0.00 / 7.10 | 2% | 20% | 78% | 78% | 49 | UNIQUE |
| Zone3/1080 | 6-compass-main | 7 | 10x10 | 100 | 6.98 | 0.02 / 0.34 / 6.58 / 0.00 / 0.01 | 11% | 89% | 0% | 0% | 0 | UNIQUE |
| Zone3/0994 | 3-vertex-radar | 4 | 9x9 | 77 | 6.35 | 0.01 / 0.02 / 0.54 / 0.00 / 5.76 | 8% | 19% | 0% | 73% | 0 | UNIQUE |
| Zone2/1195 | 8-all-rectangles | 4 | 8x7 | 47 | 6.31 | 0.01 / 0.07 / 5.72 / 0.00 / 0.49 | 0% | 4% | 0% | 96% | 0 | UNIQUE |
| Zone2/0745 | 1-area-numbers | 6 | 11x11 | 121 | 6.30 | 0.03 / 0.02 / 4.76 / 0.00 / 1.47 | 7% | 11% | 0% | 81% | 0 | UNIQUE |
| Zone3/0268 | 8-endgame | 7 | 15x15 | 200 | 5.71 | 0.00 / 0.11 / 3.95 / 0.00 / 1.63 | 20% | 37% | 0% | 43% | 0 | UNIQUE |
| Zone3/1084 | 6-compass-main | 5 | 9x8 | 48 | 5.44 | 0.02 / 0.13 / 0.73 / 0.00 / 4.54 | 8% | 16% | 0% | 76% | 0 | UNIQUE |

## Outliers: much slower per tile than their peers (same category and difficulty; at least 0.3 s, at least 4x the peer median)

| id | category | diff | tiles | total s | ms per tile | peer median ms per tile | x peers | left |
|---|---|---|---|---|---|---|---|---|
| Zone2/1356 | 6-same-size-no-touch | 4 | 49 | 14.6 | 298.3 | 2.3 | 127.9 | 100% |
| Zone2/0864b | 10-zone2-mixed | 4 | 72 | 26.2 | 364 | 3.5 | 104.2 | 76% |
| Zone2/1346 | 5-minmax | 4 | 36 | 12.9 | 358.7 | 5.8 | 61.6 | 98% |
| Zone1/1434 | 7-slash-pack | 6 | 172 | 34.7 | 201.7 | 3.3 | 61.1 | 48% |
| Zone3/0928 | 4-difference | 6 | 63 | 16.0 | 253.2 | 4.5 | 55.7 | 78% |
| Zone2/0850 | 9-no-rectangles | 6 | 49 | 8.71 | 177.8 | 3.7 | 47.7 | 75% |
| Zone3/1137 | 7-zone3-mixed | 4 | 99 | 18.7 | 188.7 | 4.9 | 38.5 | 71% |
| Zone3/0312 | 6-compass-main | 6 | 49 | 13.7 | 279.2 | 8.8 | 31.7 | 76% |
| Zone3/0970 | 2-loopy | 4 | 115 | 8.88 | 77.2 | 2.5 | 30.4 | 79% |
| Zone1/0116 | 9-region-size-x | 6 | 81 | 7.62 | 94.1 | 3.3 | 28.9 | 78% |
| Zone2/0832 | 8-all-rectangles | 5 | 56 | 4.64 | 82.9 | 3 | 27.7 | 0% |
| Zone3/1395b | 6-compass | 5 | 138 | 14.4 | 104.6 | 4 | 26.4 | 0% |
| Zone3/0930d-real | 4-difference | 7 | 91 | 10.7 | 117.1 | 4.5 | 25.8 | 90% |
| Zone2/1114 | 10-zone2-mixed | 7 | 86 | 7.81 | 90.8 | 3.6 | 25.3 | 33% |
| Zone1/0030 | 9-region-size-x | 6 | 60 | 4.93 | 82.1 | 3.3 | 25.2 | 96% |
| Zone3/1086 | 6-compass-main | 5 | 49 | 13.0 | 266 | 11.3 | 23.5 | 90% |
| Zone3/1110 | 7-zone3-mixed | 4 | 81 | 8.44 | 104.2 | 4.9 | 21.3 | 70% |
| Zone2/1195 | 8-all-rectangles | 4 | 47 | 6.31 | 134.2 | 6.4 | 20.9 | 96% |
| Zone3/0994 | 3-vertex-radar | 4 | 77 | 6.35 | 82.4 | 4.4 | 18.7 | 73% |
| Zone3/1260 | 6-compass-main | 3 | 49 | 4.90 | 100.1 | 5.4 | 18.6 | 75% |
| Zone2/1352 | 6-same-size-no-touch | 5 | 40 | 1.77 | 44.2 | 2.5 | 17.7 | 94% |
| Zone2/0745 | 1-area-numbers | 6 | 121 | 6.30 | 52.1 | 3.1 | 16.9 | 81% |
| Zone1/1236 | 7-slash-pack | 5 | 90 | 4.70 | 52.3 | 3.3 | 15.8 | 84% |
| Zone2/0349 | 4-all-regions-different | 7 | 60 | 3.80 | 63.3 | 4.5 | 14 | 57% |
| Zone3/0999 | 3-vertex-radar | 3 | 196 | 8.57 | 43.7 | 3.6 | 12 | 45% |
| Zone2/0010 | 8-all-rectangles | 4 | 36 | 2.73 | 75.9 | 6.4 | 11.8 | 0% |
| Zone2/1436 | 6-same-size-no-touch | 6 | 140 | 3.94 | 28.1 | 2.5 | 11.3 | 54% |
| Zone3/1003 | 3-vertex-radar | 6 | 100 | 3.94 | 39.4 | 3.7 | 10.5 | 0% |
| Zone3/0631 | 7-zone3-mixed | 5 | 117 | 14.0 | 119.3 | 11.4 | 10.4 | 0% |
| Zone3/1248 | 8-endgame | 7 | 100 | 19.1 | 191.1 | 18.7 | 10.2 | 100% |

## The 20 puzzles with the largest share of edges left to the final solver

| id | category | diff | tiles | spots | left | left % | total s | final s | verdict |
|---|---|---|---|---|---|---|---|---|---|
| Zone1/0099 | 6-gemini-delta | 2 | 50 | 73 | 73 | 100% | 2.91 | 2.35 | UNIQUE |
| Zone1/0276 | 10-same-shape-no-touch | 3 | 16 | 13 | 13 | 100% | 0.12 | 0.03 | UNIQUE |
| Zone1/1065 | 10-same-shape-no-touch | 3 | 25 | 40 | 40 | 100% | 0.22 | 0.12 | UNIQUE |
| Zone1/0130 | 9-region-size-x | 4 | 36 | 46 | 46 | 100% | 0.59 | 0.37 | UNIQUE |
| Zone1/0528 | 6-gemini-delta | 4 | 54 | 72 | 72 | 100% | 0.84 | 0.50 | UNIQUE |
| Zone2/1177 | 3-all-regions-same | 2 | 18 | 27 | 27 | 100% | 0.10 | 0.02 | UNIQUE |
| Zone2/0372 | 3-all-regions-same | 3 | 18 | 22 | 22 | 100% | 0.10 | 0.03 | UNIQUE |
| Zone2/1120 | 10-zone2-mixed | 3 | 18 | 23 | 23 | 100% | 0.14 | 0.03 | UNIQUE |
| Zone2/1345 | 5-minmax | 3 | 25 | 34 | 34 | 100% | 0.26 | 0.19 | UNIQUE |
| Zone2/1348 | 5-minmax | 4 | 25 | 37 | 37 | 100% | 0.67 | 0.53 | UNIQUE |
| Zone2/1351 | 5-minmax | 4 | 35 | 54 | 54 | 100% | 0.95 | 0.87 | UNIQUE |
| Zone2/1356 | 6-same-size-no-touch | 4 | 49 | 68 | 68 | 100% | 14.6 | 14.5 | UNIQUE |
| Zone2/1365 | 3-all-regions-same | 4 | 52 | 83 | 83 | 100% | 0.42 | 0.25 | UNIQUE |
| Zone3/0893 | 4-difference | 2 | 16 | 22 | 22 | 100% | 0.11 | 0.02 | UNIQUE |
| Zone3/0493 | 7-zone3-mixed | 3 | 64 | 108 | 108 | 100% | 2.18 | 1.67 | UNIQUE |
| Zone3/1385 | 4-difference | 3 | 26 | 25 | 25 | 100% | 0.14 | 0.06 | UNIQUE |
| Zone3/1401 | 4-difference | 3 | 20 | 27 | 27 | 100% | 0.18 | 0.11 | UNIQUE |
| Zone3/1039 | 4-difference | 4 | 20 | 26 | 26 | 100% | 0.14 | 0.09 | UNIQUE |
| Zone3/1248 | 8-endgame | 7 | 100 | 179 | 179 | 100% | 19.1 | 18.1 | UNIQUE |
| Zone2/0960 | 3-all-regions-same | 7 | 92 | 158 | 157 | 99% | 0.92 | 0.09 | UNIQUE |

## Decided without any search: 1082 of 1225 puzzles (every edge by instant propagation or look-ahead; scan tests = 0, left = 0)

## Which rules decided the edges (all puzzles, edges per phase; `search` = proved by a narrow search)

| rule | instant | probe | scan |
|---|---|---|---|
| basic | 4610 | 5271 | 245 |
| bank-place | 8409 | 918 | 330 |
| stamp-place | 3521 | 1969 | 0 |
| label | 2781 | 2238 | 44 |
| size | 2133 | 2129 | 32 |
| size-cut | 2142 | 1621 | 53 |
| bridge-count | 2055 | 1357 | 9 |
| grow | 1522 | 1144 | 5 |
| boxy-place | 2141 | 501 | 0 |
| loo-outline | 1772 | 39 | 0 |
| compass | 1324 | 424 | 0 |
| pal-link | 1269 | 420 | 0 |
| euler-count | 940 | 641 | 22 |
| mismatch-hall | 1346 | 108 | 47 |
| gemini-place | 828 | 485 | 75 |
| reach | 663 | 652 | 25 |
| tower-link | 936 | 277 | 42 |
| pal-wall | 640 | 404 | 0 |
| mingle-area-place | 405 | 608 | 0 |
| size-range | 399 | 581 | 3 |
| rose-cut | 747 | 170 | 0 |
| tower-wall | 469 | 357 | 57 |
| area-rel | 277 | 441 | 0 |
| loo-color | 289 | 415 | 0 |
| range-region | 144 | 473 | 1 |
| cmp-box | 602 | 0 | 0 |
| bank-fit | 457 | 130 | 7 |
| stamp-size | 309 | 269 | 0 |
| rose-pair | 338 | 216 | 0 |
| loo-corner | 126 | 417 | 0 |
| bri-three | 309 | 218 | 0 |
| mingle-area-merge | 292 | 228 | 0 |
| area-sum | 283 | 226 | 4 |
| box-hall | 353 | 141 | 0 |
| min-reach | 285 | 180 | 0 |
| shape-fit | 169 | 268 | 0 |
| cmp-wrap | 335 | 66 | 0 |
| colour-count | 185 | 170 | 27 |
| boxy-corner | 253 | 128 | 0 |
| rose-grow | 294 | 80 | 0 |

Files: the .jsonl has everything per puzzle (per-rule counts per phase, scan test counts, final-search progress, wrong-edge examples); the .csv is the flat version of the main numbers.
