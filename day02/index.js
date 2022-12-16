import { readFileSync } from 'node:fs';

// Input:
// A: Rock, B: Paper, C: Scissors
// A beats C, B beats A, C beats B
// Output:
// X: Rock, Y: Paper, Z: Scissors
// Selection:
// 1: Rock, 2: Paper, 3: Scissors
// Score:
// Lost: 0, Draw: 3, Won: 6
class RoundFirstStrategy {
    constructor(rawLine) {
        [this.input, this.output] = rawLine.trim().split(' ');
    }

    get matchScore() {
        const input = this.input[0];
        const output = this.output[0];

        if ((input === 'A' && output === 'X') || (input === 'B' && output === 'Y') || (input === 'C' && output === 'Z')) {
            return 3;
        } 
     
        if ((output === 'X' && input === 'C') || (output === 'Y' && input === 'A') || (output === 'Z' && input === 'B')) {
            return 6;
        }
        
        return 0;
    }

    get selectionScore() {
        return this.output.charCodeAt(0) - 'X'.charCodeAt(0) + 1;
    }

    get score() {
        return this.matchScore + this.selectionScore;
    }
}

// Input:
// A: Rock, B: Paper, C: Scissors
// A beats C, B beats A, C beats B
// Output:
// X: Lose, Y: Draw, Z: Win
// Selection:
// 1: Rock, 2: Paper, 3: Scissors
// Score:
// Lost: 0, Draw: 3, Won: 6
class RoundSecondStrategy {
    constructor(rawLine) {
        [this.input, this.output] = rawLine.split(' ').map(s => s.trim()[0]);
    }

    get matchScore() {       
        if (this.output === 'X') {
            return 0;
        } 
     
        if (this.output === 'Y') {
            return 3;
        } 

        return 6;
    }

    get selectionScore() {
        // Win
        if (this.output === 'X') {
            return (this.input.charCodeAt(0) - 'A'.charCodeAt(0) + 2) % 3 + 1;
        } 
     
        // Draw
        if (this.output === 'Y') {
            return this.input.charCodeAt(0) - 'A'.charCodeAt(0) + 1;
        } 
        
        // Lose
        return (this.input.charCodeAt(0) - 'A'.charCodeAt(0) + 1) % 3 + 1;
    }

    get score() {
        return this.matchScore + this.selectionScore;
    }
}

function readInput(filename) {
    return readFileSync(filename, 'utf8');
}

async function main() {
    const input = readInput('./input');
    
    // part 1
    const rounds = input.split('\n').map(line => new RoundFirstStrategy(line));
    console.log(`Total Score (1st strategy): ${rounds.reduce((a, b) => a + b.score, 0)}`);

    // part 2
    const rounds2 = input.split('\n').map(line => new RoundSecondStrategy(line));
    console.log(`Total Score (2nd strategy): ${rounds2.reduce((a, b) => a + b.score, 0)}`);
}

main();