import * as toolbox from '../lib/toolbox.mjs';

class Cargo {
  constructor() {
    this.stacks = [];
  }

  addRow(row) {
    const items = row.length / 4;
    
    while (this.stacks.length < items) {
      this.stacks.push([]);
    }

    for(let i = 0; i < row.length; i+=4) {
      const crate = row[i+1];

      if (crate !== ' ') {
        this.stacks[i/4].push(crate);
        toolbox.debugLog(`Adding crate [${crate}] to stack ${i/4 + 1}`);
      }
    }
  }
  
  // The "command" argument is a string in the following format: 
  // "move <number of crates> from <stack> to <stack>"
  // returns an array of the form [crates, from, to]
  parseMoveCommand(command) {
    const [_, cratesStr, fromStr, toStr] = command.match(/^move (\d+) from (\d+) to (\d+)/);
    const crates = parseInt(cratesStr);
    const from = parseInt(fromStr) - 1;
    const to = parseInt(toStr) - 1;

    return [crates, from, to];
  }

  // Move multiple crates, one by one, from one stack to another
  moveCrates(command) {
    const [crates, from, to] = this.parseMoveCommand(command);
    const fromStack = this.stacks[from];
    const toStack = this.stacks[to];

    for(let i = 0; i < crates; i++) {
      toolbox.debugLog(`Moving crate [${fromStack[0]}] from stack ${from + 1} to stack ${to + 1}`);
      toStack.unshift(fromStack.shift());
    }

    if (toolbox.isDebug()) {
      this.printStacks();
    }
  }

  // Move multiple crates, all at once, from one stack to another
  moveMultipleCrates(command) { 
    const [crates, from, to] = this.parseMoveCommand(command);
    const fromStack = this.stacks[from];
    const toStack = this.stacks[to];

    const cratesToMove = fromStack.splice(0, crates);
    toStack.unshift(...cratesToMove);

    if (toolbox.isDebug()) {
      this.printStacks();
    }
  }

  printStacks() {
    let maxLength = this.stacks.reduce((max, stack) => Math.max(max, stack.length), 0);

    for (let i = 0; i < maxLength; i++) {
      let row = '';
      for (let j = 0; j < this.stacks.length; j++) {
        row += this.stacks[j][i] || ' ';
        row += ' ';
      }
      console.log(row);
    }
  }
}

function main() {
  const input = toolbox.readInput();
  
  // part 1
  const cargo = new Cargo();
  for (const row of input.split('\n')) {
    if (row.match(/.*\[.\].*/)) {
      cargo.addRow(row);
    } else if (row.startsWith('move')) {
      cargo.moveCrates(row);
    } 
  }

  cargo.printStacks();

  console.log('=====================');

  // part 2
  const cargo2 = new Cargo();
  for (const row of input.split('\n')) {
    if (row.match(/.*\[.\].*/)) {
      cargo2.addRow(row);
    } else if (row.startsWith('move')) {
      cargo2.moveMultipleCrates(row);
    } 
  }

  cargo2.printStacks();
}

main();