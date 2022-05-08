// INIT
async function applySettings() {
    loading = true;
    await assignValues();
    init();
    loading = false;
}

function onDelayChange() {
    mazeGenerateDelay = Number(delayInput.value) * 200;
}

async function assignValues() {
    gridCols = Number(numberOfColumnsInput.value);
    gridRows = gridCols;
    grid = [];
    tileSide = canvas.width / gridCols;
    mazeGenerateDelay = Number(delayInput.value) * 200;
    tileHoleChance = Number(tileHoleChanceInput.value) * 20;
    mazeType = getRadioValue(mazeTypeBtn);
    createMethod = getRadioValue(createMethodBtn);

    runAllValidators()

    if (errorMessages.length > 0) {
        await assignDefault();
    }

    console.log('Error Messages : ' + (errorMessages.length > 0 ? errorMessages : 'none'));
    errorMessages = [];
}

async function assignDefault() {
    const response = await fetch('./scripts/alibraries/default.json')
    const result = await response.json()

    numberOfColumnsInput.value = result.cols;
    gridCols = result.cols;
    gridRows = gridCols;
    grid = [];
    tileSide = canvas.width / gridCols;
    mazeGenerateDelay = result.mazeGenerateDelay;
    mazeType = result.mazeType;
    createMethod =  result.createMethod;
}

function init() {
    createGrid();
    randomizeOrigin();
    drawGrid();
    mouseEventHander();
    updatePointChecksView();
    mouseModeChange('none');
}

function initMazeGeneration() {
    eventDisabler();
    mazeGenAnimation();
}

function initPathFinding() {
    eventDisabler();
    //pushing the starting point to openSet, object pushed is rated in metrics important for A*
    let TileRated = new TileRating(startTileIndex ?? 0, startTileIndex ?? 0, 0, 0);
    openSet.push(TileRated)
    destinationTileIndex = destinationTileIndex ?? grid.length - 1; //Destination of pathfinding, for now its just bottom right corner
    pathfindingAnimation();
}

//MAIN

function mazeGenAnimation() {

    if (generatePath()) {
        setTimeout(function () {
            window.requestAnimationFrame(mazeGenAnimation)
        }, mazeGenerateDelay);

    } else {
        window.cancelAnimationFrame(0);
        mouseEventHander();
        pathfindingBtn.disabled = false;

    }

    grid[current].draw();
}

function pathfindingAnimation() {

    if (!aStar()) {
        window.cancelAnimationFrame(0);
        return
    } else {
        setTimeout(function () {
            window.requestAnimationFrame(pathfindingAnimation)
        }, mazeGenerateDelay);
    }
}

applySettings()

