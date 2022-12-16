import * as toolbox from "../lib/toolbox.mjs";

class Coordinates {
  readonly x: number;
  readonly y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  toString(): string {
    return `(x=${this.x}, y=${this.y})`;
  }
}

class Range {
  readonly min: number;
  readonly max: number;

  constructor(min: number, max: number) {
    this.min = min;
    this.max = max;
  }

  add(other: Range): Range {
    if (this.max < other.min - 1 || this.min > other.max + 1) {
      throw new Error(`Ranges do not overlap: ${this} and ${other}`);
    }

    return new Range(
      Math.min(this.min, other.min),
      Math.max(this.max, other.max)
    );
  }

  overlaps(other: Range): boolean {
    return this.max >= other.min - 1 && this.min <= other.max + 1;
  }

  get length(): number {
    return 1 + this.max - this.min;
  }

  toString(): string {
    return `${this.min} -> ${this.max}`;
  }
}

class Sensor {
  readonly coordinates: Coordinates;
  readonly distance: number;

  constructor(coordinates: Coordinates, beaconCoordinates: Coordinates) {
    this.coordinates = coordinates;

    this.distance =
      Math.abs(this.coordinates.x - beaconCoordinates.x) +
      Math.abs(this.coordinates.y - beaconCoordinates.y);
  }

  getHorizontalRange(y: number): Range | null {
    const range: Range | null = null;
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
function parseLine(line: string): Sensor {
  const sensorCoordinates = line.match(/x=(-?\d+), y=(-?\d+)/);
  const beaconCoordinates = line.match(/x=(-?\d+), y=(-?\d+)$/);

  if (sensorCoordinates === null || beaconCoordinates === null) {
    throw new Error(`Invalid input line: ${line}`);
  }

  return new Sensor(
    new Coordinates(
      parseInt(sensorCoordinates[1]),
      parseInt(sensorCoordinates[2])
    ),
    new Coordinates(
      parseInt(beaconCoordinates[1]),
      parseInt(beaconCoordinates[2])
    )
  );
}

function reduceRanges(ranges: Range[]): Range[] {
  if (ranges.length < 1) {
    return ranges;
  }

  let reduced = true;

  while (reduced) {
    ranges = ranges.sort((a, b) => a.min - b.min);
    reduced = false;

    for (let i = 1; i < ranges.length && !reduced; i++) {
      if (ranges[i].overlaps(ranges[i - 1])) {
        const reducedRange = ranges[i].add(ranges[i - 1]);
        ranges[i - 1] = reducedRange;
        ranges.splice(i, 1);
        reduced = true;
      }
    }
  }

  return ranges;
}

function main(): void {
  const input = toolbox.readInput();
  const sensors: Sensor[] = [];

  for (const line of input.split("\n").map((line) => line.trim())) {
    sensors.push(parseLine(line));
  }

  const min = 0;
  const max = 4000000;
  let found: boolean = false;

  for (let y = min; y <= max && !found; y++) {
    let ranges: Range[] = [];
    for (const sensor of sensors) {
      const sensorRange = sensor.getHorizontalRange(y);

      if (sensorRange !== null) {
        let extended = false;
        for (let i = 0; i < ranges.length && !extended; i++) {
          if (ranges[i].overlaps(sensorRange)) {
            ranges[i] = ranges[i].add(sensorRange);
            extended = true;
          }
        }
        if (!extended) {
          ranges.push(sensorRange);
        }
      }
    }

    ranges = reduceRanges(ranges);

    if (ranges.length > 1) {
      const emptyRanges: Range[] = [];

      for (let i = 1; i < ranges.length; i++) {
        emptyRanges.push(new Range(ranges[i - 1].max + 1, ranges[i].min - 1));
      }

      const x = emptyRanges[0].min;
      console.log(
        `Beacon found at (x=${x}, y=${y}). Tuning frequency: ${x * max + y}`
      );

      found = true;
    }
  }
}

main();
