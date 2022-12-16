import * as toolbox from "../lib/toolbox.mjs";
import { OrderedSet } from "../lib/containers.mjs";
class Coordinates {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    equals(other) {
        return this.x === other.x && this.y === other.y;
    }
    toString() {
        return `(x=${this.x}, y=${this.y})`;
    }
}
class Range {
    constructor(min, max) {
        this.min = min;
        this.max = max;
    }
    add(other) {
        if (this.max < other.min - 1 || this.min > other.max + 1) {
            throw new Error(`Ranges do not overlap: ${this} and ${other}`);
        }
        return new Range(Math.min(this.min, other.min), Math.max(this.max, other.max));
    }
    overlaps(other) {
        return this.max >= other.min - 1 && this.min <= other.max + 1;
    }
    get length() {
        return 1 + this.max - this.min;
    }
    toString() {
        return `${this.min} -> ${this.max}`;
    }
}
class Sensor {
    constructor(coordinates, beaconCoordinates) {
        this.coordinates = coordinates;
        this.beaconCoordinates = beaconCoordinates;
        this.distance =
            Math.abs(this.coordinates.x - this.beaconCoordinates.x) +
                Math.abs(this.coordinates.y - this.beaconCoordinates.y);
    }
    getHorizontalRange(y) {
        const range = null;
        const diff = Math.abs(this.coordinates.y - y);
        if (diff > this.distance) {
            return range;
        }
        const min = this.coordinates.x - (this.distance - diff);
        const max = this.coordinates.x + (this.distance - diff);
        toolbox.debugLog(`Range: ${min} - ${max}`);
        return new Range(min, max);
    }
}
// Parse a single input line. Each line contains a sensor coordinate and a
// beacon coordinate.
// Example:
//   Sensor at x=2, y=18: closest beacon is at x=-2, y=15
function parseLine(line) {
    const sensorCoordinates = line.match(/x=(-?\d+), y=(-?\d+)/);
    const beaconCoordinates = line.match(/x=(-?\d+), y=(-?\d+)$/);
    if (sensorCoordinates === null || beaconCoordinates === null) {
        throw new Error(`Invalid input line: ${line}`);
    }
    toolbox.debugLog(`Sensor at x=${sensorCoordinates[1]}, y=${sensorCoordinates[2]}: closest beacon is at x=${beaconCoordinates[1]}, y=${beaconCoordinates[2]}`);
    return new Sensor(new Coordinates(parseInt(sensorCoordinates[1]), parseInt(sensorCoordinates[2])), new Coordinates(parseInt(beaconCoordinates[1]), parseInt(beaconCoordinates[2])));
}
function main() {
    const input = toolbox.readInput();
    const sensors = [];
    for (const line of input.split("\n").map((line) => line.trim())) {
        sensors.push(parseLine(line));
    }
    // part 1
    const beacons = new OrderedSet();
    const examinedLine = 2000000;
    const ranges = [];
    for (const sensor of sensors) {
        const sensorRange = sensor.getHorizontalRange(examinedLine);
        if (sensorRange !== null) {
            if (sensor.beaconCoordinates.y === examinedLine) {
                toolbox.debugLog(`Adding beacon at ${sensor.beaconCoordinates}`);
                beacons.push(sensor.beaconCoordinates);
            }
            ranges.push(sensorRange);
        }
    }
    let reduced = true;
    while (reduced) {
        reduced = false;
        for (let i = 0; i < ranges.length; i++) {
            for (let j = i + 1; j < ranges.length; j++) {
                if (ranges[i].overlaps(ranges[j])) {
                    toolbox.debugLog(`Reducing ranges ${ranges[i]} and ${ranges[j]}`);
                    ranges[i] = ranges[i].add(ranges[j]);
                    ranges.splice(j, 1);
                    reduced = true;
                    break;
                }
            }
        }
    }
    toolbox.debugLog(`Total range: ${ranges.map((r) => r.toString()).join(", ")}`);
    // Remove beacons that are in range
    let positions = ranges.reduce((sum, range) => sum + range.length, 0);
    for (const beacon of beacons.values()) {
        for (const range of ranges) {
            if (beacon.x >= range.min && beacon.x <= range.max) {
                toolbox.debugLog(`Removing beacon at ${beacon}`);
                positions--;
            }
        }
    }
    console.log(`Part 1: ${positions}`);
}
main();
