import * as toolbox from "../lib/toolbox.mjs";

class Range {
  // "range" is a string in the following format: "start-end"
  constructor(range) {
    const [start, end] = range.split('-').map(Number);
    this.start = start;
    this.end = end;
  }

  containedBy(range) {
    return this.start >= range.start && this.end <= range.end;
  }

  overlaps(range) {
    return this.start <= range.start && this.end >= range.start ||
      range.start <= this.start && range.end >= this.start;
  }
}

class Pair {
  // a pair is a string in the following format: "start-end,start-end"
  constructor(pair) {
    const [first, second] = pair.split(',');
    this.first = new Range(first);
    this.second = new Range(second);
  }

  isFullyOverlaping() {
    return this.first.containedBy(this.second) || this.second.containedBy(this.first);
  }

  isPartiallyOverlaping() {
    return this.first.overlaps(this.second);
  }
}

function main() {
  const input = toolbox.readInput();
  const pairs = input.split('\n').map(line => new Pair(line));

  // part 1
  const fullyOverlapingPairs = pairs.filter(pair => pair.isFullyOverlaping());
  console.log(`Overlaping pairs: ${fullyOverlapingPairs.length}`);

  // part 2
  const partiallyOverlapingPairs = pairs.filter(pair => pair.isPartiallyOverlaping());
  console.log(`Non overlaping pairs: ${partiallyOverlapingPairs.length}`);
}

main();