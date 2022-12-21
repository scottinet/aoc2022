import * as toolbox from "../lib/toolbox.mjs";
import { Equatable, OrderedSet } from "../lib/containers.mjs";

enum Sign {
  Plus = "+",
  Minus = "-",
  Multiply = "*",
  Divide = "/",
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
      default:
        throw new Error(`Unknown sign: ${this.op}`);
    }

    return computed || !isNaN(this.value);
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
    const [left, op, right] = value.split(" ");
    const opNodes = [new N(left), new N(right)];

    for (let i = 0; i < opNodes.length; i++) {
      const storedNode = nodes.get(opNodes[i]);

      if (storedNode === undefined) {
        nodes.push(opNodes[i]);
      } else {
        opNodes[i] = storedNode;
      }
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
  const input = toolbox.readInput();
  const nodes = new OrderedSet<N>();
  let rootNode: N | undefined;

  for (const line of input.split("\n")) {
    const node = parseLine(line, nodes);

    if (rootNode === undefined && node.name === "root") {
      rootNode = node;
    }

    if (!isNaN(node.value) || node.canComputeValue()) {
      computeAll(nodes);
    }

    if (rootNode !== undefined && !isNaN(rootNode.value)) {
      console.log("Root node value:", rootNode.value);
      return;
    }
  }
}

main();
