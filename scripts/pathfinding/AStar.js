class TileRating {
    constructor(index, pindex, h, g = 1) {
        this.index = index; // must be equal to Tiles index in grid;
        this.parentIndex = pindex;
        this.h = h;
        this.g = g;
        this.f = g + h;
        this.overWriteType = 'none';
        this.overWriteColor = null;
    }
}

TileRating.prototype.overWriteTypeChange = function (toType) {
    let overWriteColor;

    switch (toType) {
        case 'openList':
            overWriteColor = '#62bf7b';
            break;
        case 'closedList':
            overWriteColor = '#db707b';
            break;
        case 'endPath':
            overWriteColor = '#c4bc66';
            break;
        case 'none':
            overWriteColor = null;
            break;
    }

    grid[this.index].overWriteColor(overWriteColor);
}

function setPathfindingVariables() {
    let TileRated = new TileRating(startTileIndex ?? 0, startTileIndex ?? 0, 0, 0);
    openSetOperator('push', TileRated);
    destinationTileIndex = destinationTileIndex ?? grid.length - 1;
}

//OpenSet functions

function openSetOperator(action, object) {
    switch (action) {
        case 'push':
            object.overWriteTypeChange('openList');
            return openSet.push(object);
        case 'pop':
            let openSetEl = openSet.pop();
            openSetEl.overWriteTypeChange('none');
            return openSetEl;
    }

    return undefined;
}

function sortOpenSetByfValue() {
    let n = openSet.length;
    let tempObj;
    do {
        for (i = 0; i < n - 1; i++) {
            if (openSet[i].f < openSet[i + 1].f) {
                tempObj = openSet[i + 1];
                openSet[i + 1] = openSet[i];
                openSet[i] = tempObj;
            }
        }
        n--;
    } while (n > 1)
}

function isInOpenSet(index) {
    for (const openSetEl of openSet) {
        if (openSetEl.index === index) return true;
    }
    return false
}

function findOpenSetIndex(index) {
    for (let i = 0; i < openSet.length; i++) {
        if (openSet[i].index === index)
            return i;
    }
    return null;
}

//ClosedSet functions

function closedSetOperator(action, object) {
    switch (action) {
        case 'push':
            object.overWriteTypeChange('closedList');
            return closedSet.push(object);
        case 'pop':
            object.overWriteTypeChange('none');
            return closedSet.pop();
    }

    return undefined;
}

function isInClosedSet(index) {
    for (const closedSetEl of closedSet) {
        if (closedSetEl.index === index) return true;
    }
    return false
}

function findIndexOfHighestf() {
    let highestf = -1;
    let IndexOfHighestf = -1;

    for (i = 0; i < openSet.length; i++) {
        if (highestf < openSet[i].f) {
            highestf = openSet[i].f;
            IndexOfHighestf = i;
        }
    }

    return IndexOfHighestf;
}

function getObjFromClosedSet(index) {
    for (let i = 0; i < closedSet.length; i++){
        if(closedSet[i].index === index){
            return closedSet[i]
        }
    }
    return null;
}

//Other

function createRatingObject(neighbour, parentObj) {
    let g, h;

    g = 1 + parentObj.g;

    h = (Math.abs(neighbour.positionX - grid[destinationTileIndex].positionX) +
        Math.abs(neighbour.positionY - grid[destinationTileIndex].positionY)) / tileSide;

    return new TileRating(neighbour.index, parentObj.index, h, g)
}

function isObstacle(neighbour, currentIndex, wallIndex) {
    switch (mazeType) {
        case 'stroke':
            if (grid[currentIndex].walls[wallIndex] === true) {
                return true;
            }
            return false;
        case 'fill':
            if (neighbour.type === 'wall') {
                return true;
            }
            return false;
    }
}

// Astar

function aStarAlgorithm() {
    if (openSet.length === 0) {
        errorMessages.push('Nie udało się znaleść ścieżki do wybranego celu')
        return true;
    }

    sortOpenSetByfValue();
    currentPathHead = openSetOperator('pop');
    closedSetOperator('push', currentPathHead);

    let tileIndex = currentPathHead.index;

    if (tileIndex === destinationTileIndex) return true;

    let iteration = -1;
    for (const neighbour of grid[tileIndex].neighboursList) {
        iteration++;
        if (!neighbour) continue;
        if (isObstacle(neighbour, tileIndex, iteration)) continue;
        if (isInClosedSet(neighbour.index)) continue;

        let newRatingObj = createRatingObject(neighbour, currentPathHead)

        if (isInOpenSet(newRatingObj.index)) {
            let foundIndex = findOpenSetIndex(newRatingObj.index);
            if (openSet[foundIndex].g > newRatingObj.g)
                openSet[foundIndex] = newRatingObj;
            continue;
        }
        openSetOperator('push', newRatingObj);
    }

    return false;
}

function drawFinalPath(tileRatingObj) {
    tileRatingObj.overWriteTypeChange('endPath')
    if(tileRatingObj.f === 0) return;

    let parentObj = getObjFromClosedSet(tileRatingObj.parentIndex)
    drawFinalPath(parentObj);
}
