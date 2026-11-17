# Rule ablation, core v127 (tools/rule_ablation.js)

Each switch off in turn, 1225 campaign puzzles, deduction phase only (up to the final search), 3 jobs on 4 cores, limit 30 s.
Zone3/0776 (+40) and Zone3/1085a (+2/-2) move with machine load (time-budgeted probes): rerun alone, every switch gives the all-on result there.
Single-puzzle effects rerun 3 times alone: matchCover +1 (0953), matchHole +4 (0970), reachCompass +2 (1246), labelProbe +13 (1320) are real; mingleConnect and regionMerge were noise only.

## Batch 1

1225 puzzles, deduction phase only, limit 30 s
| switch off | puzzles with more open edges | edges lost in all | puzzles with fewer open edges | other outcome changes | time (s) | vs all on |
|---|---|---|---|---|---|---|
| (all on) | 0 | 0 | 0 | 0 | 586 |  | 
| areaColourReach | 0 | 0 | 0 | 0 | 582 | -4 | 
| areaPair | 0 | 0 | 0 | 0 | 563 | -23 | 
| areaPlace | 1 | 84 | 0 | 0 | 582 | -4 | Zone2/1329 +84
| basicFirst | 0 | 0 | 0 | 0 | 575 | -10 | 
| boxAfterRel | 0 | 0 | 0 | 0 | 575 | -11 | 
| boxAll | 1 | 99 | 0 | 0 | 560 | -26 | Zone2/1335 +99
| boxAllProbe | 0 | 0 | 0 | 0 | 561 | -24 | 
| boxFull | 10 | 859 | 0 | 0 | 637 | 51 | Zone1/0223 +107; Zone1/0232 +55; Zone3/0537 +39
| boxHall | 4 | 297 | 0 | 0 | 585 | -1 | Zone2/0304 +5; Zone3/0446 +227; Zone2/0765 +25
| boxLock | 1 | 215 | 0 | 0 | 613 | 28 | Zone3/1109 +215
| boxShapes | 2 | 132 | 0 | 0 | 586 | 0 | Zone2/1114 +33; Zone2/1335 +99
| closedSize | 38 | 759 | 0 | 0 | 596 | 10 | Zone1/0165 +14; Zone1/0182 +1; Zone3/0193 +19
| cmpBox | 2 | 516 | 0 | 0 | 642 | 56 | Zone3/0654 +194; Zone3/0684 +322
| cmpBudget | 4 | 138 | 0 | 0 | 572 | -13 | Zone3/0776 +40; Zone3/1085a +2; Zone3/1086 +1
| cmpBudgetParts | 2 | 94 | 0 | 0 | 557 | -29 | Zone3/1086 +1; Zone3/1402 +93
| compassCap | 0 | 0 | 0 | 0 | 539 | -47 | 
| crossCheck | 1 | 79 | 0 | 0 | 548 | -38 | Zone3/1149a +79
| crossMark | 0 | 0 | 0 | 0 | 597 | 11 | 
| deltaSmall | 3 | 100 | 0 | 0 | 577 | -8 | Zone1/0027 +22; Zone1/0538 +38; Zone3/0776 +40
| diffClash | 3 | 37 | 0 | 0 | 557 | -28 | Zone3/0839 +2; Zone3/0929 +33; Zone3/0928 +2
| diffSmall | 1 | 20 | 0 | 0 | 559 | -27 | Zone3/0928 +20

## Batch 2

1225 puzzles, deduction phase only, limit 30 s
| switch off | puzzles with more open edges | edges lost in all | puzzles with fewer open edges | other outcome changes | time (s) | vs all on |
|---|---|---|---|---|---|---|
| (all on) | 0 | 0 | 0 | 0 | 560 |  | 
| euler | 13 | 636 | 1 | 0 | 564 | 4 | Zone1/0184 +68; Zone1/0454 +37; Zone3/0776 +40
| gdClash | 14 | 714 | 1 | 0 | 549 | -11 | Zone1/0140 +97; Zone1/0114 +178; Zone1/0232 +69
| gdComplete | 9 | 129 | 0 | 0 | 557 | -3 | Zone1/0116 +25; Zone1/0177 +4; Zone3/0685 +2
| gemAnchor | 0 | 0 | 1 | 0 | 537 | -23 | 
| gemCopy | 3 | 260 | 1 | 0 | 529 | -31 | Zone2/0742 +117; Zone1/1442 +67; Zone1/1443 +76
| gemLine | 0 | 0 | 1 | 0 | 548 | -12 | 
| gemPlace | 22 | 751 | 1 | 0 | 569 | 9 | Zone1/0027 +46; Zone1/0093 +56; Zone1/0116 +1
| labelJoin | 7 | 330 | 2 | 0 | 556 | -4 | Zone3/0776 +37; Zone3/1017 +49; Zone2/1114 +33
| labelMinSum | 2 | 257 | 1 | 0 | 586 | 26 | Zone3/1079 +180; Zone3/1259 +77
| labelProbe | 1 | 13 | 0 | 0 | 546 | -14 | Zone2/1320 +13
| labelSizeAll | 3 | 289 | 1 | 0 | 568 | 8 | Zone3/1079 +180; Zone2/1114 +33; Zone3/1259 +76
| matchAnchors | 2 | 49 | 1 | 0 | 577 | 17 | Zone3/0776 +40; Zone2/0864b +9
| matchCompCap | 2 | 181 | 1 | 0 | 603 | 43 | Zone3/0776 +40; Zone3/1094 +141
| matchCompShapes | 3 | 151 | 1 | 0 | 562 | 3 | Zone3/0632 +1; Zone2/0864b +9; Zone3/1094 +141
| matchCompass | 2 | 142 | 0 | 0 | 589 | 29 | Zone3/0632 +1; Zone3/1094 +141
| matchCover | 1 | 1 | 1 | 0 | 582 | 23 | Zone3/0953 +1
| matchHole | 1 | 4 | 0 | 0 | 592 | 32 | Zone3/0970 +4
| matchIso | 0 | 0 | 1 | 0 | 584 | 24 | 
| matchIsoK | 0 | 0 | 1 | 0 | 530 | -30 | 
| matchShape | 0 | 0 | 1 | 0 | 543 | -17 | 
| matchSplit | 0 | 0 | 1 | 0 | 563 | 3 | 

## Batch 3

1225 puzzles, deduction phase only, limit 30 s
| switch off | puzzles with more open edges | edges lost in all | puzzles with fewer open edges | other outcome changes | time (s) | vs all on |
|---|---|---|---|---|---|---|
| (all on) | 0 | 0 | 0 | 0 | 587 |  | 
| mingleConnect | 1 | 40 | 0 | 0 | 588 | 1 | Zone3/0776 +40
| minglePlace | 4 | 504 | 0 | 0 | 587 | -0 | Zone2/0308 +190; Zone3/0926 +55; Zone3/1003 +119
| minglePocket | 4 | 72 | 0 | 0 | 581 | -6 | Zone2/0256 +28; Zone3/0776 +40; Zone3/1085a +2
| mismatchHall | 9 | 198 | 0 | 0 | 568 | -19 | Zone2/0076 +24; Zone2/0316 +12; Zone2/0318 +20
| palDomino | 2 | 95 | 0 | 0 | 571 | -17 | Zone3/0776 +40; Zone2/1370 +55
| pieceCount | 4 | 27 | 0 | 0 | 559 | -28 | Zone1/0533 +10; Zone1/1098 +4; Zone1/1099 +4
| placeProbe | 29 | 1646 | 0 | 0 | 566 | -21 | Zone2/0010 +57; Zone2/0162 +24; Zone2/0322 +19
| reachArea | 2 | 73 | 0 | 0 | 621 | 33 | Zone3/0776 +40; Zone2/1114 +33
| reachCap | 13 | 271 | 0 | 0 | 609 | 22 | Zone3/0270 +52; Zone3/0404 +20; Zone3/0480 +28
| reachCompass | 1 | 2 | 0 | 0 | 569 | -18 | Zone3/1246 +2
| reachParts | 0 | 0 | 0 | 0 | 582 | -5 | 
| regionMerge | 1 | 2 | 0 | 0 | 592 | 5 | Zone3/1085a +2
| roseCover | 1 | 55 | 0 | 0 | 582 | -5 | Zone1/0833 +55
| roseCut | 2 | 135 | 0 | 0 | 573 | -14 | Zone3/0844 +48; Zone1/1434 +87
| roseCutDyn | 1 | 31 | 0 | 0 | 566 | -22 | Zone1/1434 +31
| roseCutProbe | 2 | 33 | 0 | 0 | 599 | 12 | Zone3/1085a +2; Zone1/1434 +31
| roseCutReach | 1 | 79 | 0 | 0 | 625 | 37 | Zone1/1434 +79
| sameLinksEarly | 0 | 0 | 0 | 0 | 601 | 14 | 
| splitCut | 5 | 169 | 0 | 0 | 582 | -5 | Zone2/0187 +26; Zone3/0312 +2; Zone2/0746 +65
| splitGrow | 0 | 0 | 0 | 0 | 559 | -28 | 
| tileSizes | 29 | 813 | 1 | 0 | 549 | -38 | Zone1/0027 +22; Zone3/0152 +48; Zone1/0157 +19
| wallyBudgetChain | 0 | 0 | 0 | 0 | 575 | -12 | 
| wallyEnds | 0 | 0 | 0 | 0 | 570 | -17 | 
