import * as toolbox from "../lib/toolbox.mjs";

const FLOOR_LENGTH = 64;
const MAX_BLOCKS = 1000000000000;

class Rock {
  public segments: Uint8Array;
  public currentMinX: number = 2;
  public currentMaxX: number;

  constructor(segments: Uint8Array, maxX: number) {
    this.segments = segments;
    this.currentMaxX = maxX;
  }

  static create(type: number): Rock {
    // Rock types are, in this order:
    // 0:
    //  ####
    // 1:
    //  #
    // ###
    //  #
    // 2:
    //   #
    //   #
    // ###
    // 3:
    //  #
    //  #
    //  #
    //  #
    // 4:
    //  ##
    //  ##
    switch (type) {
      case 1:
        return new Rock(new Uint8Array([0b11110]), 5);
      case 2:
        return new Rock(new Uint8Array([0b1000, 0b11100, 0b1000]), 4);
      case 3:
        return new Rock(new Uint8Array([0b11100, 0b100, 0b100]), 4);
      case 4:
        return new Rock(
          new Uint8Array([0b10000, 0b10000, 0b10000, 0b10000]),
          2
        );
      case 5:
        return new Rock(new Uint8Array([0b11000, 0b11000]), 3);
      default:
        throw new Error(`Unknown rock type: ${type}`);
    }
  }

  moveLaterally(xDiff: number): void {
    if (xDiff < 0) {
      xDiff = Math.max(xDiff, -this.currentMinX);

      if (xDiff < 0) {
        this.currentMinX += xDiff;
        this.currentMaxX += xDiff;

        for (let i = 0; i < this.segments.length; i++) {
          this.segments[i] = this.segments[i] << Math.abs(xDiff);
        }
      }
    } else if (xDiff > 0) {
      xDiff = Math.min(6 - this.currentMaxX, xDiff);

      if (xDiff > 0) {
        this.currentMinX += xDiff;
        this.currentMaxX += xDiff;
        for (let i = 0; i < this.segments.length; i++) {
          this.segments[i] = this.segments[i] >> xDiff;
        }
      }
    }
  }

  canMoveDown(floor: Uint8Array, step: number): boolean {
    const segmentsToCheck = Math.min(step, this.segments.length);

    for (let i = 0; i < segmentsToCheck; i++) {
      if (
        (this.segments[i] ^ floor[floor.length - step + i]) !==
        (this.segments[i] | floor[floor.length - step + i])
      ) {
        return false;
      }
    }

    return true;
  }

  // Only checks if it would intersect with another rock on the floor.
  // Also, xDiff can only be -1 or 1. Expect undefined behabior otherwise.
  canMoveLaterally(floor: Uint8Array, step: number, xDiff: number): boolean {
    const segmentsToCheck = Math.min(step, this.segments.length);

    for (let i = 0; i < segmentsToCheck; i++) {
      const target = xDiff < 0 ? this.segments[i] << 1 : this.segments[i] >> 1;

      if (
        (target ^ floor[floor.length - step + i]) !==
        (target | floor[floor.length - step + i])
      ) {
        return false;
      }
    }

    return true;
  }
}

function parseInput(input: string): Int8Array {
  return new Int8Array(
    input
      .trim()
      .split("")
      .map((c) => (c === "<" ? -1 : 1))
  );
}

function printFloor(floor: Uint8Array): void {
  if (toolbox.isDebug()) {
    for (let i = floor.length - 1; i >= Math.max(floor.length - 15, 0); i--) {
      let str = "";

      for (let j = 6; j >= 0; j--) {
        str += (floor[i] & Math.pow(2, j)) > 0 ? "#" : ".";
      }

      console.log(str);
    }

    console.log("==============================");
  }
}

function addRockToFloor(floor: Uint8Array, rock: Rock, depth: number): number {
  let heightAdded = 0;

  if (depth >= rock.segments.length) {
    for (let j = 0; j < rock.segments.length; j++) {
      floor[floor.length - depth + j] |= rock.segments[j];
    }
  } else {
    const segmentsToAdd = rock.segments.length - depth;
    floor.set(floor.slice(segmentsToAdd));
    floor.set(rock.segments.slice(depth), floor.length - segmentsToAdd);

    for (let j = 0; j < depth; j++) {
      floor[floor.length - rock.segments.length + j] |= rock.segments[j];
    }

    heightAdded += segmentsToAdd;
  }

  printFloor(floor);

  return heightAdded;
}

function computeKey(
  floor: Uint8Array,
  latestRockType: number,
  gasJetIndex: number
): string {
  return `${floor.join("")}:${latestRockType}:${gasJetIndex}`;
}

function main(): void {
  const input = toolbox.readInput();
  const gasJets = parseInput(input);
  const keys = new Map<string, number[]>();
  let keyFound = false;
  let floor: Uint8Array = new Uint8Array(FLOOR_LENGTH);
  let jetIndex = 0;
  let totalHeight = 0;

  floor.fill(0b11111111);

  for (let i = 0; i < MAX_BLOCKS; i++) {
    // Create a new rock
    const rock = Rock.create((i % 5) + 1);

    // Apply 4 jets before checking the floor
    let xDiff = 0;

    for (let j = 0; j < 4; j++) {
      const jet = gasJets[jetIndex];
      jetIndex = (jetIndex + 1) % gasJets.length;

      if (jet === -1) {
        if (rock.currentMinX + xDiff > 0) {
          xDiff--;
        }
      } else {
        if (rock.currentMaxX + xDiff < 6) {
          xDiff++;
        }
      }
    }

    rock.moveLaterally(xDiff);

    let rested = false;
    let depth = 0;
    while (!rested) {
      if (rock.canMoveDown(floor, depth + 1)) {
        depth++;
        xDiff = gasJets[jetIndex];
        jetIndex = (jetIndex + 1) % gasJets.length;

        if (rock.canMoveLaterally(floor, depth, xDiff)) {
          rock.moveLaterally(xDiff);
        }
      } else {
        rested = true;
      }
    }

    totalHeight += addRockToFloor(floor, rock, depth);

    if (!keyFound) {
      const key = computeKey(floor, (i % 5) + 1, jetIndex);

      if (keys.has(key)) {
        console.log(
          `Found a loop! Total height: ${totalHeight}, key: ${key}, i: ${i}`
        );

        keyFound = true;
        const [previousKeyIteration, previousKeyHeight] = keys.get(key)!;
        const jumpLength = i - previousKeyIteration;
        const jumps = Math.floor((MAX_BLOCKS - i + 1) / jumpLength);
        totalHeight += (totalHeight - previousKeyHeight) * jumps;
        i += jumps * jumpLength;

        console.log(
          `Jumping to iteration ${i} (new total height: ${totalHeight})`
        );
      } else {
        keys.set(key, [i, totalHeight]);
      }
    }
  }

  console.log("Total height:", totalHeight);
}

main();
