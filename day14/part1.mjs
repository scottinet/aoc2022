import * as toolbox from "../lib/toolbox.mjs";
import { OrderedSet } from "../lib/containers.mjs";
class Column {
    constructor(index) {
        this.index = index;
        this.obstacles = [];
    }
    addObstacle(y) {
        if (!this.obstacles.includes(y)) {
            this.obstacles.push(y);
            this._sorted = false;
        }
    }
    sort() {
        if (!this._sorted) {
            this.obstacles.sort((a, b) => a - b);
            this._sorted = true;
        }
    }
    canThrowSandAt(fromHeight = 0) {
        this.sort();
        for (let i = 0; i < this.obstacles.length; i++) {
            if (this.obstacles[i] === fromHeight) {
                return NaN;
            }
            if (this.obstacles[i] > fromHeight) {
                return this.obstacles[i] - 1;
            }
        }
        // abyss => can throw sand in it
        return +Infinity;
    }
    throwSand(fromHeight = 0) {
        this.sort();
        if (fromHeight === +Infinity) {
            // abyss => throw sand in abyss
            return false;
        }
        const obstacle = this.obstacles.findIndex((y) => y > fromHeight);
        if (obstacle === -1) {
            // no obstacle => throw sand in abyss
            return false;
        }
        // insert sand just before the obstacle to keep the array sorted
        this.obstacles.splice(obstacle, 0, fromHeight);
        return true;
    }
}
class Coordinate {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    toString() {
        return `(${this.x}, ${this.y})`;
    }
    equals(other) {
        return this.x === other.x && this.y === other.y;
    }
}
// Parse a line of the input
// Each line is a sequence of coordinate ranges, each coordinate being
// separated by a comma, and each range being separated by a ' -> '
// Example:
//   0,1 -> 2,1 -> 2,6 -> 0,6
// Returns an array of all the coordinates in the ranges
function parseLine(line) {
    const coordinates = new OrderedSet();
    const ranges = line.trim().split(" -> ");
    let previousCoordinate = null;
    toolbox.debugLog(`===========================\nParsing line ${line}\n\n`);
    for (const range of ranges) {
        //toolbox.debugLog(`Parsing range ${range}`);
        const [x, y] = range.split(",").map((n) => parseInt(n, 10));
        const newCoordinate = new Coordinate(x, y);
        if (coordinates.push(newCoordinate)) {
            // toolbox.debugLog(
            //   `Adding coordinate ${newCoordinate} from range ${range}`
            // );
        }
        if (previousCoordinate !== null) {
            // Compute all coordinates between the previous one, and the new one
            const xDiff = newCoordinate.x - previousCoordinate.x;
            const yDiff = newCoordinate.y - previousCoordinate.y;
            const maxDiff = Math.max(Math.abs(xDiff), Math.abs(yDiff));
            const xStep = xDiff / maxDiff;
            const yStep = yDiff / maxDiff;
            for (let i = 1; i < maxDiff; i++) {
                const added = coordinates.push(new Coordinate(previousCoordinate.x + xStep * i, previousCoordinate.y + yStep * i));
                // if (added) {
                //   toolbox.debugLog(`Added intermediate coordinate ${coordinates.last}`);
                // }
            }
        }
        previousCoordinate = newCoordinate;
    }
    return coordinates;
}
function main() {
    var _a, _b, _c;
    const input = toolbox.readInput();
    // Parse the input
    const columns = new Map();
    const uniq = new Set(input.split("\n").map((line) => line.trim()));
    for (const line of uniq.values()) {
        const coordinates = parseLine(line);
        for (const coordinate of coordinates.values()) {
            if (!columns.has(coordinate.x)) {
                columns.set(coordinate.x, new Column(coordinate.x));
            }
            (_a = columns.get(coordinate.x)) === null || _a === void 0 ? void 0 : _a.addObstacle(coordinate.y);
        }
    }
    // Throw sand until it falls in the abyss
    let sandCount = 0;
    let canDoMore = true;
    let startingColumn = 500;
    while (canDoMore) {
        let sand = new Coordinate(startingColumn, 0);
        let unrested = true;
        while (unrested) {
            let column = columns.get(sand.x);
            let height = column === null || column === void 0 ? void 0 : column.canThrowSandAt(sand.y);
            toolbox.debugLog(`Sand (${sand.x}, ${height}), Column ${column === null || column === void 0 ? void 0 : column.index} obstacles: ${column === null || column === void 0 ? void 0 : column.obstacles}`);
            // undefined: outside of the map, throw sand in the abyss
            // +Infinity: no obstacle, throw sand in the abyss
            if (height === undefined || height === +Infinity) {
                toolbox.debugLog(`Throwing sand in the abyss (sand : ${sand.toString()}, height: ${height})`);
                toolbox.debugLog(`Column ${column === null || column === void 0 ? void 0 : column.index} obstacles: ${column === null || column === void 0 ? void 0 : column.obstacles}`);
                canDoMore = false;
                break;
            }
            if (isNaN(height)) {
                throw new Error(`Cannot throw sand at ${sand}`);
            }
            const canThrowLeft = (_b = columns.get(sand.x - 1)) === null || _b === void 0 ? void 0 : _b.canThrowSandAt(height + 1);
            const canThrowRight = (_c = columns.get(sand.x + 1)) === null || _c === void 0 ? void 0 : _c.canThrowSandAt(height + 1);
            if (canThrowLeft === undefined || !isNaN(canThrowLeft)) {
                sand.x--;
                sand.y = height + 1;
                toolbox.debugLog("Going left to " + sand.toString());
            }
            else if (canThrowRight === undefined || !isNaN(canThrowRight)) {
                sand.x++;
                sand.y = height + 1;
                toolbox.debugLog("Going right to " + sand.toString());
            }
            else {
                column === null || column === void 0 ? void 0 : column.throwSand(height);
                unrested = false;
                sandCount++;
                toolbox.debugLog(`===== Throwing sand at [${sand.x}, ${height}] (sand count: ${sandCount})`);
            }
        }
    }
    console.log(`Sand count: ${sandCount}`);
}
main();
