# Puzzle list, import and export

The puzzle list at the top of the Puzzle Grid panel, its buttons, the Fast import box, the import report and the messages an import or export can show.

Left here: 0 to write, 0 to check again, 10 notes, 3 to put on the page. Done: 108.

A copy of the answers on the rewrite page (see README.md): `- new:` empty = not done yet, `=` = keep the text as it is, `[..]` = a note for Claude.

### T0014
- what: text · #puzzlePanel
- now: Puzzle Grid
- new: =

### T0015
- what: text · #libraryBar
- now: Name
- new: =

### T0017
- what: text · #libraryBar
- now: Puzzle
- new: =

### T0019
- what: tooltip · #newPuzzleBtn · Tooltip: shows when you hover over it.
- now: Make a new empty puzzle
- new: Make a new empty puzzle

### T0020
- what: text · #newPuzzleBtn
- now: New puzzle
- new: =

### T0021
- what: tooltip · #importBtn · Tooltip: shows when you hover over it.
- now: Import puzzle files, either just one puzzle or multiple with a zip
- new: Import puzzle files, either just one puzzle or multiple with a zip

### T0022
- what: text · #importBtn
- now: Import puzzles…
- new: =

### T0023
- what: tooltip · #fastImportBtn · Tooltip: shows when you hover over it.
- now: Import every puzzle from the steam folder or the appdata one. Should be where most puzzles are kept for most people
- new: Import every puzzle from the steam folder or the appdata one. Should be where most puzzles are kept for most people

### T0024
- what: text · #fastImportBtn
- now: Fast import
- new: =

### T0025
- what: tooltip · #fastFoldersBtn · Button that only shows once Fast import has remembered a folder. Tooltip: shows when you hover over it.
- now: Choose or forget the folder Fast import reads
- new: [where]

### T0026
- what: text · #fastFoldersBtn · Button that only shows once Fast import has remembered a folder.
- now: Folder…
- new: [where]

### T0027
- what: tooltip · #exportBtn · Tooltip: shows when you hover over it.
- now: To save or send this puzzle, works with custom rules !
- new: To save or send this puzzle, works with custom rules !

### T0028
- what: text · #exportBtn
- now: Export puzzle
- new: =

### T0029
- what: tooltip · #exportAllBtn · Tooltip: shows when you hover over it.
- now: To save every puzzle, works with custom rules !
- new: To save every puzzle, works with custom rules !

### T0030
- what: text · #exportAllBtn
- now: Export all
- new: =

### T0031
- what: tooltip · #showFileSolutionBtn · Button that only shows for an imported puzzle with a stored solution. Tooltip: shows when you hover over it.
- now: Show at the bottom what solution was stored, THIS ISNT THE SOLVER.
- new: Show at the bottom what solution was stored, THIS ISNT THE SOLVER.

### T0032
- what: text · #showFileSolutionBtn · Button that only shows for an imported puzzle with a stored solution.
- now: File's solution
- new: =

### T0033
- what: tooltip · #deletePuzzleBtn · Tooltip: shows when you hover over it.
- now: Remove this puzzle from the list
- new: =

### T0034
- what: text · #deletePuzzleBtn
- now: Delete
- new: =

### T1197
- what: text (keep the <b>/<i> tags or drop them) · #fastSetup · In the Fast import box, which opens the first time you click Fast import, or with Folders….
- now: <b>Set up once.</b> Fast import reads one folder, <code>Glimmith puzzles</code>, that a small setup file makes for you. Put the setup file in any folder you like (Documents, for example) and run it: it makes <code>Glimmith puzzles</code> next to itself, holding two links. <code>downloaded</code> leads to the puzzles you downloaded from the workshop, <code>made</code> to the puzzles you made. A link only points to the game's folder: nothing is copied or moved, the game works as before, new puzzles show up in it by themselves, and deleting <code>Glimmith puzzles</code> deletes only the links. It needs no administrator rights.
- new: [remove]

### T1198
- what: text (keep the <b>/<i> tags or drop them) · #fastSetup · In the Fast import box, which opens the first time you click Fast import, or with Folders….
- now: <b>Windows:</b> double-click <code>glimmith-setup.bat</code>. Windows may warn that the file comes from the internet: choose "More info", then "Run anyway". You can open it in Notepad first, it is a few lines.<br><b>Linux:</b> in a terminal, in the folder where you put it, run <code>sh glimmith-setup.sh</code>. It looks for Steam in the usual places (the Flatpak one too).
- new: <b>Windows:</b> Download the setup file for windows which is <code>glimmith-setup.bat</code> and run it in the folder of your choosing. It will create a folder containing links that points to the puzzles you made and the puzzles you downloaded. If you do not trust blind code you can open it in a text editor, it is 2 lines. After that you can open the folder created with the choose folder below and get all of the puzzles you have.<br><b>Linux:</b> Download the setup file for linux then run <code>sh glimmith-setup.sh</code> in a terminal where you put the file. Same as windows setup, after it will create a folder that you can open with the choose folder below to get all the puzzles you have.

### T1202
- what: text (keep the <b>/<i> tags or drop them) · #fastSetup · In the Fast import box, which opens the first time you click Fast import, or with Folders….
- now: Then choose the <code>Glimmith puzzles</code> folder below.
- new: [remove]

### T1199
- what: text · #fastSetup · In the Fast import box, which opens the first time you click Fast import, or with Folders….
- now: The folder the setup made
- new: [remove]

### T1200
- what: text · #fastSetup · In the Fast import box, which opens the first time you click Fast import, or with Folders….
- now: Glimmith puzzles
- new: [remove]

### T1201
- what: text · #fastSetupBtn · In the Fast import box, which opens the first time you click Fast import, or with Folders….
- now: Setup file for Windows
- new: =

### T1205
- what: text · #fastSetupShBtn · In the Fast import box, which opens the first time you click Fast import, or with Folders….
- now: Setup file for Linux
- new: =

### T0038
- what: text · #fastPick_both · In the Fast import box, which opens the first time you click Fast import, or with Folders….
- now: Choose folder…
- new: =

### T1206
- what: text · #fastSetup · In the Fast import box, which opens the first time you click Fast import, or with Folders….
- now: Steam installed somewhere else? Open the setup file in a text editor and change the line with the Steam folder.
- new: If steam is installed somewhere else, simply open the setup file in a text editor and change the line with the Steam folder.

### T1207
- what: text (keep the <b>/<i> tags or drop them) · #fastRefused · In the Fast import box, which opens the first time you click Fast import, or with Folders….
- now: Your browser refused that folder. Choose the <code>Glimmith puzzles</code> folder the setup file made, not the game's own folders.
- new: =

### T0043
- what: text · #fastRunBtn · In the Fast import box, which opens the first time you click Fast import, or with Folders….
- now: Import now
- new: =

### T0044
- what: text · #fastForgetBtn · In the Fast import box, which opens the first time you click Fast import, or with Folders….
- now: Forget folder
- new: [where]

### T0045
- what: text · #importLogSummary · Under the puzzle list, after an import.
- now: Import report
- new: =

### T0421
- what: error message · importCellTokens · An error message, shown when something goes wrong (often in the import report).
- now: row {1}: unreadable compass at column {2}
- new: =

### T0422
- what: error message · importCellTokens · An error message, shown when something goes wrong (often in the import report).
- now: row {1}: unreadable polyomino at column {2}
- new: =

### T0423
- what: error message · importCellTokens · An error message, shown when something goes wrong (often in the import report).
- now: row {1}: unreadable area number "{2}"
- new: =

### T0424
- what: error message · importCellTokens · An error message, shown when something goes wrong (often in the import report).
- now: row {1}: unknown cell code "{2}"
- new: =

### T0425
- what: error message · importCellTokens · An error message, shown when something goes wrong (often in the import report).
- now: row {1}: unexpected text after the last cell ("{2}")
- new: =

### T0426
- what: error message · parsePuzzleFile · An error message, shown when something goes wrong (often in the import report).
- now: not a puzzle file (first line is not "VERSION 1")
- new: =

### T0427
- what: message · parsePuzzleFile · Shown in the import report when a file can not be read as expected.
- now: shape {1} is empty
- new: =

### T0428
- what: message · parsePuzzleFile · Shown in the import report when a file can not be read as expected.
- now: unknown header line "{1}" ignored
- new: =

### T0429
- what: error message · parsePuzzleFile · An error message, shown when something goes wrong (often in the import report).
- now: no PUZZLE section
- new: =

### T0430
- what: error message · parsePuzzleFile · An error message, shown when something goes wrong (often in the import report).
- now: no DIMENSIONS line
- new: =

### T0431
- what: message · parsePuzzleFile · Shown in the import report when a file can not be read as expected.
- now: the file has AREA_EQUALS together with AT_LEAST / AT_MOST
- new: =

### T0432
- what: error message · parsePuzzleFile · An error message, shown when something goes wrong (often in the import report).
- now: the board has {1} lines, {2} expected
- new: =

### T0433
- what: error message · parsePuzzleFile · An error message, shown when something goes wrong (often in the import report).
- now: row {1}: unknown corner mark "{2}"
- new: =

### T0434
- what: error message · parsePuzzleFile · An error message, shown when something goes wrong (often in the import report).
- now: row {1}: unknown horizontal edge "{2}"
- new: =

### T0435
- what: error message · parsePuzzleFile · An error message, shown when something goes wrong (often in the import report).
- now: row {1}: unknown vertical edge "{2}"
- new: =

### T0436
- what: error message · parsePuzzleFile · An error message, shown when something goes wrong (often in the import report).
- now: row {1}: polyomino S{2} is not defined by a SHAPE line
- new: =

### T0437
- what: message · parsePuzzleFile · Shown in the import report when a file can not be read as expected.
- now: {1} edge mark(s) next to an empty tile ignored
- new: =

### T0438
- what: message · parsePuzzleFile · Shown in the import report when a file can not be read as expected.
- now: watchtower at corner {1} touches no tile, ignored
- new: =

### T0439
- what: message · parsePuzzleFile · Shown in the import report when a file can not be read as expected.
- now: SHAPE_BANK lists shape {1}, which is not defined
- new: =

### T0440
- what: message · parsePuzzleFile · Shown in the import report when a file can not be read as expected.
- now: SOLUTION section is cut short, ignored
- new: =

### T0441
- what: error message · str · An error message, shown when something goes wrong (often in the import report).
- now: bad metadata
- new: =

### T0442
- what: error message · bits · An error message, shown when something goes wrong (often in the import report).
- now: unexpected end of compressed data
- new: =

### T0443
- what: error message · decode · An error message, shown when something goes wrong (often in the import report).
- now: bad Huffman code
- new: =

### T0444
- what: error message · inflateRawJS · An error message, shown when something goes wrong (often in the import report).
- now: bad stored block
- new: =

### T0445
- what: error message · inflateRawJS · An error message, shown when something goes wrong (often in the import report).
- now: bad lengths
- new: =

### T0446
- what: error message · inflateRawJS · An error message, shown when something goes wrong (often in the import report).
- now: bad block type
- new: =

### T0447
- what: error message · inflateRawJS · An error message, shown when something goes wrong (often in the import report).
- now: bad length symbol
- new: =

### T0448
- what: error message · inflateRawJS · An error message, shown when something goes wrong (often in the import report).
- now: bad distance symbol
- new: =

### T0449
- what: error message · inflateRawJS · An error message, shown when something goes wrong (often in the import report).
- now: distance too far back
- new: =

### T0450
- what: error message · readZip · An error message, shown when something goes wrong (often in the import report).
- now: not a valid zip file (no end-of-archive record)
- new: =

### T0451
- what: error message · readZip · An error message, shown when something goes wrong (often in the import report).
- now: zip64 archives are not supported
- new: =

### T0452
- what: error message · readZip · An error message, shown when something goes wrong (often in the import report).
- now: damaged zip directory
- new: =

### T0453
- what: error message · readZip › getData · An error message, shown when something goes wrong (often in the import report).
- now: {1} is encrypted
- new: =

### T0454
- what: error message · readZip › getData · An error message, shown when something goes wrong (often in the import report).
- now: damaged zip entry {1}
- new: =

### T0455
- what: error message · readZip › getData · An error message, shown when something goes wrong (often in the import report).
- now: {1}: unsupported zip compression method {2}
- new: =

### T0456
- what: message · importExpand › message · Shown in the import report when a file can not be read as expected.
- now: zip files nested too deeply, skipped
- new: =

### T0457
- what: message · collectPuzzles › message · Shown in the import report when a file can not be read as expected.
- now: Duplicate puzzle got skipped
- new: Duplicate puzzle got skipped

### T0458
- what: message · fallback · Shown in the import report when a file can not be read as expected.
- now: Imported puzzle
- new: =

### T0459
- what: message · collectPuzzles › message · Shown in the import report when a file can not be read as expected.
- now: no readable puzzle found
- new: =

### T0460
- what: message · collectPuzzles › message · Shown in the import report when a file can not be read as expected.
- now: no puzzle files found (expected text files starting with "VERSION 1")
- new: =

### T0797
- what: message · FILE_SOLUTION_LABEL · Built by the page while it runs, so it only shows in some situations.
- now: The file's known solution
- new: The file's known solution

### T0798
- what: message · library › items.name · Built by the page while it runs, so it only shows in some situations.
- now: My puzzle
- new: =

### T0799
- what: message · STARTER_PUZZLES › name · Built by the page while it runs, so it only shows in some situations.
- now: Example Puzzle Unique
- new: Example Puzzle Unique

### T0800
- what: message · STARTER_PUZZLES › name · Built by the page while it runs, so it only shows in some situations.
- now: Example Puzzle Non Unique
- new: Example Puzzle Non Unique

### T0801
- what: message · switchPuzzle · Built by the page while it runs, so it only shows in some situations.
- now: Wait for the solver to finish (or cancel it) first
- new: =

### T0802
- what: message · item › name · Built by the page while it runs, so it only shows in some situations.
- now: Puzzle {1}
- new: =

### T0803
- what: message · newPuzzle · Built by the page while it runs, so it only shows in some situations.
- now: New empty puzzle: {1}
- new: =

### T0804
- what: message · renderLibrary · Built by the page while it runs, so it only shows in some situations.
- now: by {1}
- new: =

### T0805
- what: message · renderLibrary · Built by the page while it runs, so it only shows in some situations.
- now: id {1}
- new: =

### T0806
- what: message · renderLibrary · Built by the page while it runs, so it only shows in some situations.
- now: the file's solution is stored
- new: =

### T0807
- what: message · renderLibrary · Built by the page while it runs, so it only shows in some situations.
- now: no solution in the file
- new: =

### T0808
- what: message · renderLibrary · Built by the page while it runs, so it only shows in some situations.
- now: {1} import note{2}: {3}
- new: =

### T0809
- what: message · renderLibrary · Built by the page while it runs, so it only shows in some situations.
- now: Delete
- new: =

### T0815
- what: message · join · Built by the page while it runs, so it only shows in some situations.
- now: {1} and {2}
- new: =

### T0816
- what: message · showAssumedRules · Built by the page while it runs, so it only shows in some situations.
- now: those custom rules
- new: =

### T0817
- what: message · showAssumedRules · Built by the page while it runs, so it only shows in some situations.
- now: that custom rule
- new: =

### T0818
- what: message · showAssumedRules · Built by the page while it runs, so it only shows in some situations.
- now: “{1}” says {2} in its description, so we assumed it uses {3} and turned {4} on.
- new: =

### T0819
- what: message · showAssumedRules · Built by the page while it runs, so it only shows in some situations.
- now: {1} puzzles name a custom rule in their description, so we assumed they use it and turned it on:
- new: [duplicatedwith0818?]

### T0820
- what: message · importFiles · Built by the page while it runs, so it only shows in some situations.
- now: Reading…
- new: =

### T0821
- what: message · bits · Built by the page while it runs, so it only shows in some situations.
- now: {1} puzzle{2} imported
- new: =

### T0822
- what: message · importFiles · Built by the page while it runs, so it only shows in some situations.
- now: {1} already in the list
- new: =

### T0823
- what: message · importFiles · Built by the page while it runs, so it only shows in some situations.
- now: {1} problem{2}
- new: =

### T0824
- what: message · importFiles › text · Built by the page while it runs, so it only shows in some situations.
- now: {1}: {2} switched on (named in its description)
- new: =

### T0825
- what: message · importFiles › text · Built by the page while it runs, so it only shows in some situations.
- now: No problems.
- new: =

### T0826
- what: message · importFiles · Built by the page while it runs, so it only shows in some situations.
- now: Import report: {1}
- new: =

### T0827
- what: message · importFiles · Built by the page while it runs, so it only shows in some situations.
- now: Imported {1} puzzles
- new: Imported {1} puzzles

### T0828
- what: message · importFiles · Built by the page while it runs, so it only shows in some situations.
- now: Imported “{1}”
- new: =

### T0829
- what: message · importFiles · Built by the page while it runs, so it only shows in some situations.
- now: Nothing new to import
- new: =

### T0830
- what: message · importFiles · Built by the page while it runs, so it only shows in some situations.
- now: Import failed
- new: =

### T0831
- what: message · importFiles · Built by the page while it runs, so it only shows in some situations.
- now: Import puzzles…
- new: =

### T0833
- what: message · fastRender · Built by the page while it runs, so it only shows in some situations.
- now: Fast import reads all your puzzles in one click, once the setup below is done.
- new: This fast import option exists to get all of the puzzles you made/downloaded in your game with a small setup

### T0834
- what: message · fastRender · Built by the page while it runs, so it only shows in some situations.
- now: Your browser can't remember folders (Chrome and Edge can): after the setup below, it asks for the Glimmith puzzles folder each time.
- new: [where]

### T0835
- what: message · fastRun · Built by the page while it runs, so it only shows in some situations.
- now: {1}: reading was not allowed
- new: =

### T0836
- what: message · fastRun · Built by the page while it runs, so it only shows in some situations.
- now: Fast import: nothing read
- new: =

### T0837
- what: message · fastRun · Built by the page while it runs, so it only shows in some situations.
- now: The folders hold no puzzle files.
- new: =

### T1204
- what: message · attachFastImport · Built by the page while it runs, so it only shows in some situations.
- now: glimmith-setup.bat
- new: =

### T1209
- what: message · attachFastImport · Built by the page while it runs, so it only shows in some situations.
- now: glimmith-setup.sh
- new: =

### T0838
- what: message · attachFastImport › text · Built by the page while it runs, so it only shows in some situations.
- now: The folder holds no puzzle files.
- new: [duplicatewithT0837]

### T0839
- what: message · normalizeState › error · Built by the page while it runs, so it only shows in some situations.
- now: no puzzle in it
- new: =

### T0840
- what: message · normalizeState › error · Built by the page while it runs, so it only shows in some situations.
- now: the grid size is not valid
- new: =

### T0841
- what: message · normalizeState › error · Built by the page while it runs, so it only shows in some situations.
- now: the grid does not match its size
- new: =

### T1134
- what: message · normalizeState › error · Built by the page while it runs, so it only shows in some situations.
- now: a clue in the puzzle isn't valid
- new: a clue is the puzzle isn't valid

### T0843
- what: message · exportPuzzles · Built by the page while it runs, so it only shows in some situations.
- now: Nothing to export
- new: =

### T0844
- what: message · exportPuzzles · Built by the page while it runs, so it only shows in some situations.
- now: Exported “{1}”
- new: =

### T0845
- what: message · exportPuzzles · Built by the page while it runs, so it only shows in some situations.
- now: Exported {1} puzzles
- new: =

### T0846
- what: message · exportPuzzles · Built by the page while it runs, so it only shows in some situations.
- now: Export failed: {1}
- new: =

### T0847
- what: message · readOwnExport › message · Built by the page while it runs, so it only shows in some situations.
- now: this file was saved by a version of the editor not supported yet. Please verify the import went well
- new: this file was saved by a version of the editor not supported yet. Please verify the import went well

### T0848
- what: message · readOwnExport › message · Built by the page while it runs, so it only shows in some situations.
- now: the file holds no puzzles
- new: =

### T0849
- what: message · deleteActivePuzzle · Built by the page while it runs, so it only shows in some situations.
- now: Click again to delete
- new: =
