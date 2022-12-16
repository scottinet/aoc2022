import * as toolbox from "../lib/toolbox.mjs";
class ThrownItem {
    constructor(value, targetMonkey) {
        this.value = value;
        this.targetMonkey = targetMonkey;
    }
}
class Monkey {
    constructor(index, items, mustBeDivisibleBy, targetMonkeyIfTrue, targetMonkeyIfFalse, operation) {
        this._inspections = 0;
        this._targetMonkeyIfTrue = -1;
        this._targetMonkeyIfFalse = -1;
        this._items = [];
        this.index = index;
        this._items = items;
        this.mustBeDivisibleBy = mustBeDivisibleBy;
        this._targetMonkeyIfTrue = targetMonkeyIfTrue;
        this._targetMonkeyIfFalse = targetMonkeyIfFalse;
        this._operation = operation;
    }
    receiveItem(item) {
        toolbox.debugLog(`Monkey ${this.index} received item with value ${item}`);
        this._items.push(item);
    }
    hasItems() {
        return this._items.length > 0;
    }
    inspect(modulus = 0) {
        if (this._items.length === 0) {
            throw new Error(`Monkey ${this.index} has no items to inspect`);
        }
        let item = this._items.shift();
        toolbox.debugLog(`Monkey ${this.index} is inspecting item with value ${item}`);
        this._inspections++;
        item = this._operation(item);
        toolbox.debugLog(`\t- after operation: ${item}`);
        if (!modulus) {
            item = Math.floor(item / 3);
            toolbox.debugLog(`\t- after division: ${item}`);
        }
        else {
            item %= modulus;
        }
        if (item % this.mustBeDivisibleBy === 0) {
            toolbox.debugLog(`\t- item is divisible by ${this.mustBeDivisibleBy}`);
            return new ThrownItem(item, this._targetMonkeyIfTrue);
        }
        toolbox.debugLog(`\t- item is not divisible by ${this.mustBeDivisibleBy}`);
        return new ThrownItem(item, this._targetMonkeyIfFalse);
    }
    get inspections() {
        return this._inspections;
    }
}
function parseOperation(operation) {
    // an operation is of the following format: <value> [+|*] <value>
    // we need to extract the two values and the operator
    // a <value> can be either a number or "old"
    const values = operation.split("=")[1].trim().split(" ");
    const operator = values[1];
    const value1 = values[0];
    const value2 = values[2];
    return (value) => {
        const v1 = value1 === "old" ? value : parseInt(value1);
        const v2 = value2 === "old" ? value : parseInt(value2);
        if (operator === "+") {
            return v1 + v2;
        }
        if (operator === "*") {
            return v1 * v2;
        }
        throw new Error(`Unknown operator ${operator}`);
    };
}
function parseMonkey(input) {
    // each lines array is of the following format:
    // Monkey 0:
    //   Starting items: 79, 98
    //   Operation: new = old * 19
    //   Test: divisible by 23
    //     If true: throw to monkey 2
    //     If false: throw to monkey 3
    //
    // we need to extract the starting items, the operation, the test and the
    // target monkeys
    let index = -1;
    let divisibleBy = -1;
    let targetMonkeyIfTrue = -1;
    let targetMonkeyIfFalse = -1;
    let operation;
    let items = [];
    for (const line of input.split("\n").map((l) => l.trim())) {
        toolbox.debugLog(`Parsing: ${line}`);
        if (line.startsWith("Monkey")) {
            index = parseInt(line.trim().split(" ")[1].split(":")[0]);
        }
        if (line.startsWith("Starting items")) {
            items = line
                .split(":")[1]
                .trim()
                .split(",")
                .map((item) => parseInt(item.trim()));
        }
        if (line.startsWith("Operation")) {
            operation = parseOperation(line);
        }
        if (line.startsWith("Test")) {
            divisibleBy = parseInt(line.split("divisible by")[1].trim());
        }
        if (line.startsWith("If true")) {
            targetMonkeyIfTrue = parseInt(line.split("monkey")[1].trim());
        }
        if (line.startsWith("If false")) {
            targetMonkeyIfFalse = parseInt(line.split("monkey")[1].trim());
        }
    }
    toolbox.debugLog(`Monkey ${index}:\n\t- targets ${targetMonkeyIfTrue} if true,\n\t- targets ${targetMonkeyIfFalse} if false, \n\t- divisible by ${divisibleBy},\n\t- starting items: ${items}\n`);
    const monkey = new Monkey(index, items, divisibleBy, targetMonkeyIfTrue, targetMonkeyIfFalse, operation);
    return monkey;
}
function part1(monkeys) {
    // Compute 20 rounds of inspections
    for (let i = 0; i < 20; i++) {
        for (const monkey of monkeys) {
            while (monkey.hasItems()) {
                const thrownItem = monkey.inspect();
                monkeys[thrownItem.targetMonkey].receiveItem(thrownItem.value);
            }
        }
    }
    for (const monkey of monkeys) {
        console.log(`Monkey ${monkey.index} inspected items ${monkey.inspections} times`);
    }
    // Get the 2 most active monkeys
    const sortedMonkeys = monkeys.sort((a, b) => b.inspections - a.inspections);
    console.log(`Shenanigans: ${sortedMonkeys[0].inspections * sortedMonkeys[1].inspections}`);
}
function part2(monkeys) {
    const modulus = monkeys.reduce((acc, monkey) => {
        return acc * monkey.mustBeDivisibleBy;
    }, 1);
    for (let i = 0; i < 10000; i++) {
        for (const monkey of monkeys) {
            while (monkey.hasItems()) {
                const thrownItem = monkey.inspect(modulus);
                monkeys[thrownItem.targetMonkey].receiveItem(thrownItem.value);
            }
        }
    }
    for (const monkey of monkeys) {
        console.log(`Monkey ${monkey.index} inspected items ${monkey.inspections} times`);
    }
    // Get the 2 most active monkeys
    const sortedMonkeys = monkeys.sort((a, b) => b.inspections - a.inspections);
    console.log(`Shenanigans: ${sortedMonkeys[0].inspections * sortedMonkeys[1].inspections}`);
}
function main() {
    const input = toolbox.readInput();
    const monkeysStr = input.split("\n\n");
    const monkeysPart1 = [];
    const monkeysPart2 = [];
    for (const monkeyStr of monkeysStr) {
        monkeysPart1.push(parseMonkey(monkeyStr));
        monkeysPart2.push(parseMonkey(monkeyStr));
    }
    // Part 1
    part1(monkeysPart1);
    // part 2
    console.log("=====");
    part2(monkeysPart2);
}
main();
