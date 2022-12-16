import { fileURLToPath } from "url";
import * as toolbox from "../lib/toolbox.mjs";

class SignalPair {
  readonly left: any[];
  readonly right: any[];

  constructor(left: any[], right: any[]) {
    this.left = left;
    this.right = right;
  }
}

function compare(
  left: any[] = this.left,
  right: any[] = this.right,
  depth: number = 0
): number {
  for (let i = 0; i < Math.max(left.length, right.length); i++) {
    const leftValue = left[i];
    const rightValue = right[i];

    if (leftValue !== undefined && rightValue === undefined) {
      toolbox.debugLog(
        `More items available in the left part than in the right part at depth ${depth}`
      );
      return 1;
    }

    if (leftValue === undefined && rightValue !== undefined) {
      toolbox.debugLog(
        `More items available in the right part than in the left part at depth ${depth}`
      );
      return -1;
    }

    if (Array.isArray(left[i]) || Array.isArray(right[i])) {
      const leftArr = Array.isArray(left[i]) ? left[i] : [left[i]];
      const rightArr = Array.isArray(right[i]) ? right[i] : [right[i]];
      const result = compare(leftArr, rightArr, depth + 1);

      if (result !== 0) {
        return result;
      }
    } else if (left[i] !== right[i]) {
      return left[i] - right[i];
    }
  }

  toolbox.debugLog(`Left and right values are equal at depth ${depth}`);
  return 0;
}

function part1(input: string): void {
  const pairsStr = input.split("\n\n");
  const pairs: SignalPair[] = [];

  for (const pair of pairsStr) {
    const lines = pair.split("\n");
    const left = eval(lines[0].trim());
    const right = eval(lines[1].trim());
    pairs.push(new SignalPair(left, right));
  }

  let indicesSum = 0;
  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i];
    const ordered = compare(pair.left, pair.right);

    toolbox.debugLog(
      `Pair ${i + 1} is ${ordered <= 0 ? "" : "not "}ordered\n========`
    );
    indicesSum += ordered <= 0 ? i + 1 : 0;
  }

  console.log(`The sum of the indices of the ordered pairs is ${indicesSum}`);
}

function part2(input: string): void {
  const dividers = [[[2]], [[6]]];
  const signals: any[] = [...dividers];

  for (const signalStr of input.split("\n").map((s) => s.trim())) {
    if (signalStr.length === 0) {
      continue;
    }

    signals.push(eval(signalStr));
  }

  signals.sort(compare);

  toolbox.debugLog(
    "The sorted signals are:\n" +
      signals.map((s) => `${JSON.stringify(s)}\n`).join("")
  );

  let decoderKey: number = 1;
  for (const key of dividers) {
    toolbox.debugLog(
      `The index of ${JSON.stringify(key)} is ${signals.indexOf(key)}`
    );
    decoderKey *= signals.indexOf(key) + 1;
  }

  console.log(`The decoder key is ${decoderKey}`);
}

function main(): void {
  const input = toolbox.readInput();
  part1(input);
  console.log("=========");
  part2(input);
}

main();
