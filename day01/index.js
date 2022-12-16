import { readFileSync } from 'node:fs';

class Elf {
    constructor(index) {
        this.index = index;
        this.calories = [];
    }

    add(calories) {
        this.calories.push(calories);
    }

    get total() {
        return this.calories.reduce((a, b) => a + b);
    }

    get max() {
        return Math.max(...this.calories);
    }
}

// Converts a file of newline-separated numbers into an array of numbers
function parseCalories(rawInput) {
    const elves = [new Elf(0)];
    let index = 0;

    for (const line of rawInput.split('\n')) {
        if (line.length === 0) {
            elves.push(new Elf(++index));
            continue;
        }

        elves[index].add(parseInt(line));
    }
    
    return elves;
}

// Returns a promise that resolves to an array of calories per elf
function readInput(filename) {
    return readFileSync(filename, 'utf8');
}

function main() {
    const input = readInput('./input');
    const elves = parseCalories(input);

    const elfByCalories = elves.sort((a, b) => b.total - a.total);
   
    // part 1
    console.log(`Elf with the most calories: ${elfByCalories[0].index + 1} (total calories: ${elfByCalories[0].total}, max: ${elfByCalories[0].max})`);

    // part 2
    console.log(`Calories for the top three elves: ${elfByCalories.slice(0, 3).reduce((a, b) => a + b.total, 0)}`);
}

main();