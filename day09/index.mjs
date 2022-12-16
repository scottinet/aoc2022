import * as toolbox from "../lib/toolbox.mjs";
import { ComparableSet } from "../lib/comparable_set.mjs";
class Position {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    equals(other) {
        return this.x === other.x && this.y === other.y;
    }
    isAdjacent(other) {
        return Math.abs(this.x - other.x) <= 1 && Math.abs(this.y - other.y) <= 1;
    }
    copy() {
        return new Position(this.x, this.y);
    }
}
var Direction;
(function (Direction) {
    Direction[Direction["Up"] = 0] = "Up";
    Direction[Direction["Down"] = 1] = "Down";
    Direction[Direction["Left"] = 2] = "Left";
    Direction[Direction["Right"] = 3] = "Right";
})(Direction || (Direction = {}));
class RopeBridge {
    constructor(knotsCount) {
        this.knots = [];
        this.visited = new ComparableSet();
        for (let i = 0; i < knotsCount; i++) {
            this.knots.push(new Position(0, 0));
        }
        this.visited.add(this.knots[this.knots.length - 1].copy());
    }
    move(direction, length) {
        for (let i = 0; i < length; i++) {
            this.moveHead(direction);
            for (let knot = 1; knot < this.knots.length; knot++) {
                this.moveKnot(knot);
            }
            this.visited.add(this.knots[this.knots.length - 1].copy());
        }
    }
    moveHead(direction) {
        const head = this.knots[0];
        switch (direction) {
            case Direction.Up:
                head.y += 1;
                break;
            case Direction.Down:
                head.y -= 1;
                break;
            case Direction.Left:
                head.x -= 1;
                break;
            case Direction.Right:
                head.x += 1;
                break;
        }
        toolbox.debugLog(`Head: ${head.x}, ${head.y}`);
    }
    moveKnot(knotIndex) {
        const knot = this.knots[knotIndex];
        const prevKnot = this.knots[knotIndex - 1];
        if (knot.isAdjacent(prevKnot)) {
            return;
        }
        if (knot.x < prevKnot.x) {
            knot.x += 1;
        }
        else if (knot.x > prevKnot.x) {
            knot.x -= 1;
        }
        if (knot.y < prevKnot.y) {
            knot.y += 1;
        }
        else if (knot.y > prevKnot.y) {
            knot.y -= 1;
        }
        toolbox.debugLog(`Knot ${knotIndex}: ${knot.x}, ${knot.y}`);
    }
    get visits() {
        return this.visited.length();
    }
}
function str2direction(str) {
    switch (str) {
        case "U":
            return Direction.Up;
        case "D":
            return Direction.Down;
        case "L":
            return Direction.Left;
        case "R":
            return Direction.Right;
        default:
            throw new Error(`Unknown direction: ${str}`);
    }
}
function main() {
    const input = toolbox.readInput();
    const lines = input.split("\n");
    const bridgeKnots2 = new RopeBridge(2);
    const bridgeKnots10 = new RopeBridge(10);
    for (const line of lines) {
        toolbox.debugLog(`===== ${line} =====`);
        const [direction, length] = line.trim().split(" ");
        const directionEnum = str2direction(direction);
        bridgeKnots2.move(directionEnum, parseInt(length));
        bridgeKnots10.move(directionEnum, parseInt(length));
    }
    // part 1
    console.log(`Visited ${bridgeKnots2.visits} locations`);
    // part 2
    console.log(`Visited ${bridgeKnots10.visits} locations`);
}
main();
