import * as toolbox from "../lib/toolbox.mjs";

const DECRYPTION_KEY = 811589153;
const MIXES = 10;

class Value {
  readonly value: number;
  public index: number;
  public moves: number = 0;

  constructor(value: number, index: number) {
    this.value = value;
    this.index = index;
  }
}

function parseInput(input: string): Value[] {
  const result: Value[] = [];
  const lines = input.split("\n");

  for (let i = 0; i < lines.length; i++) {
    result.push(new Value(parseInt(lines[i].trim(), 10) * DECRYPTION_KEY, i));
  }

  return result;
}

function main(): void {
  const input = toolbox.readInput();
  const values: Value[] = parseInput(input);
  const preMixValues = Array.from(values);

  for (let move = 0; move < MIXES; move++) {
    for (let i = 0; i < preMixValues.length; i++) {
      const value = preMixValues.find((v) => v.moves === move)!;

      let nextIndex = value.index + value.value;

      if (nextIndex <= 0) {
        nextIndex = values.length + (nextIndex % (values.length - 1)) - 1;
      } else {
        nextIndex = nextIndex % (values.length - 1);
      }

      if (nextIndex !== value.index) {
        toolbox.debugLog(
          `*** Moving ${value.value} from ${value.index} to ${nextIndex}`
        );

        const diff = nextIndex > value.index ? -1 : 1;
        const minIndex = Math.min(value.index, nextIndex);
        const maxIndex = Math.max(value.index, nextIndex);

        for (let j = 0; j < values.length; j++) {
          if (nextIndex > value.index) {
            if (values[j].index > minIndex && values[j].index <= maxIndex) {
              values[j].index += diff;
            }
          } else {
            if (values[j].index >= minIndex && values[j].index < maxIndex) {
              values[j].index += diff;
            }
          }
        }

        value.index = nextIndex;
      }

      value.moves++;
    }
  }

  values.sort((a, b) => a.index - b.index);
  const zeroIndex = values.findIndex((v) => v.value === 0)!;
  const thousands = [
    values[(zeroIndex + 1000) % values.length],
    values[(zeroIndex + 2000) % values.length],
    values[(zeroIndex + 3000) % values.length],
  ];

  console.log(`1000th value: ${thousands[0].value}`);
  console.log(`2000th value: ${thousands[1].value}`);
  console.log(`3000th value: ${thousands[2].value}`);

  const sum = thousands.reduce((a, b) => a + b.value, 0);
  console.log(`Sum: ${sum}`);
}

main();
