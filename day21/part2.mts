import * as toolbox from "../lib/toolbox.mjs";
import { Equatable, OrderedSet } from "../lib/containers.mjs";

enum Sign {
  Plus = "+",
  Minus = "-",
  Multiply = "*",
  Divide = "/",
  Equal = "=",
  NoSign = "NoSign",
}

class N implements Equatable {
  readonly name: string;
  public value: number;
  // operation values
  public op: Sign = Sign.NoSign;
  public left: N | null = null;
  public right: N | null = null;

  constructor(name: string, value: number = NaN) {
    this.name = name;
    this.value = value;
  }

  public setOp(op: Sign, left: N, right: N): void {
    this.op = op;
    this.left = left;
    this.right = right;
  }

  public canComputeValue(): boolean {
    if (!isNaN(this.value)) {
      return false;
    }

    if (this.left === null || this.right === null) {
      return false;
    }

    const computed =
      this.left.canComputeValue() || this.right.canComputeValue();

    if (!isNaN(this.left.value) && !isNaN(this.right.value)) {
      switch (this.op) {
        case Sign.Plus:
          this.value = this.left.value + this.right.value;
          break;
        case Sign.Minus:
          this.value = this.left.value - this.right.value;
          break;
        case Sign.Multiply:
          this.value = this.left.value * this.right.value;
          break;
        case Sign.Divide:
          this.value = this.left.value / this.right.value;
          break;
        case Sign.Equal:
          this.value = this.left.value === this.right.value ? 1 : 0;
          break;
        default:
          throw new Error(`Unknown sign: ${this.op}`);
      }
    }

    return computed || !isNaN(this.value);
  }

  public hasHumanValue(): boolean {
    if (this.name === "humn") {
      return true;
    }

    if (!this.left || !this.right) {
      return false;
    }

    return this.left.hasHumanValue() || this.right.hasHumanValue();
  }

  public equalize(targetValue: number): void {
    if (this.name === "humn") {
      this.value = targetValue;
      return;
    }

    if (!this.left || !this.right) {
      return;
    }

    let humanParent: N;
    let allSimian: N;
    const isLeft = this.left.hasHumanValue();

    [humanParent, allSimian] = isLeft
      ? [this.left, this.right]
      : [this.right, this.left];

    switch (this.op) {
      case Sign.Plus:
        humanParent.equalize(targetValue - allSimian.value);
        break;
      case Sign.Minus:
        humanParent.equalize(
          isLeft ? targetValue + allSimian.value : allSimian.value - targetValue
        );
        break;
      case Sign.Multiply:
        humanParent.equalize(targetValue / allSimian.value);
        break;
      case Sign.Divide:
        humanParent.equalize(
          isLeft ? targetValue * allSimian.value : allSimian.value / targetValue
        );
        break;
    }
  }

  public equals(other: N): boolean {
    return this.name === other.name;
  }

  public toString(): string {
    let content = "";

    if (isNaN(this.value)) {
      if (this.left || this.right) {
        if (this.left) {
          content += isNaN(this.left.value) ? this.left.name : this.left.value;
        } else {
          content += "?";
        }

        content += ` ${this.op} `;

        if (this.right) {
          content += isNaN(this.right.value)
            ? this.right.name
            : this.right.value;
        } else {
          content += "?";
        }
      } else {
        content = "?";
      }
    } else {
      content = String(this.value);
    }

    return `${this.name} = ${content}`;
  }
}

function parseLine(line: string, nodes: OrderedSet<N>): N {
  const [name, value] = line.trim().split(": ");
  const newNode = new N(name);
  let node = nodes.get(newNode);

  if (node === undefined) {
    node = newNode;
    nodes.push(node);
  }

  if (value.includes(" ")) {
    let [left, op, right] = value.split(" ");
    const opNodes = [new N(left), new N(right)];

    for (let i = 0; i < opNodes.length; i++) {
      const storedNode = nodes.get(opNodes[i]);

      if (storedNode === undefined) {
        nodes.push(opNodes[i]);
      } else {
        opNodes[i] = storedNode;
      }
    }

    if (node.name === "root") {
      op = Sign.Equal;
    }

    node.setOp(op as Sign, opNodes[0], opNodes[1]);
  } else {
    node.value = parseInt(value);
  }

  return node;
}

function computeAll(nodes: OrderedSet<N>): void {
  let hasNewValue = true;

  while (hasNewValue) {
    hasNewValue = false;

    for (const node of nodes.values()) {
      hasNewValue = hasNewValue || node.canComputeValue();
    }
  }
}

function main(): void {
  const input = toolbox.readInput().split("\n");
  const nodes = new OrderedSet<N>();
  let rootNode: N | undefined;

  // Parse until able to compute the root equality value
  for (let i = 0; i < input.length; i++) {
    const node = parseLine(input[i], nodes);

    if (rootNode === undefined && node.name === "root") {
      rootNode = node;
    }

    if (!isNaN(node.value) || node.canComputeValue()) {
      computeAll(nodes);
    }

    if (rootNode !== undefined && !isNaN(rootNode.value)) {
      break;
    }
  }

  // We know need to figure out the "humn" node value so that the root
  // operation is true (equal to 1)
  const [humanParent, allSimian] = rootNode!.left!.hasHumanValue()
    ? [rootNode!.left, rootNode!.right]
    : [rootNode!.right, rootNode!.left];

  console.log("Human parent:", humanParent!.toString());
  console.log("Simian parent:", allSimian!.toString());

  humanParent!.equalize(allSimian!.value);

  const humanNode = nodes.get(new N("humn"))!;
  console.log("Human node value (root equalized):", humanNode.value);
}

main();
