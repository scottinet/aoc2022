import { readInput, debugLog } from '../lib/toolbox.mjs';

class Rucksack {
    constructor(items) {
        this.items = items.trim();
        const middle = Math.round(this.items.length / 2);
        [this.firstPocket, this.secondPocket] = [
            this.items.slice(0, middle), 
            this.items.slice(middle)
        ];
    }

    get sharedItem() {
        return this.firstPocket
            .split('')
            .find(item => this.secondPocket.includes(item));
    }
}

function getPriority(item) {
    if (item === undefined) {
        return 0;
    }

    const lowered = item.toLowerCase();
    const value = lowered.charCodeAt(0) - 'a'.charCodeAt(0) + 1;

    return lowered === item ? value : value + 26;
}

async function main() {
    const input = readInput();
    const rucksacks = input.split('\n').map(line => new Rucksack(line));
    
    // part 1
    for (const rucksack of rucksacks) {
        debugLog(`Rucksack: ${rucksack.firstPocket} | ${rucksack.secondPocket} | ${rucksack.sharedItem} | ${getPriority(rucksack.sharedItem)}`);
    }

    console.log(`Priority: ${rucksacks.reduce((a, b) => a + getPriority(b.sharedItem), 0)}`);

    // part 2
    let sum = 0;
    for(let i = 0; i < rucksacks.length; i += 3) {
        const [first, second, third] = rucksacks.slice(i, i + 3);
        const sharedItem = first.items.split('').find(item => {
            return second.items.includes(item) && third.items.includes(item);
        });

        sum += getPriority(sharedItem);

        debugLog(`Rucksack: ${first.items} | ${second.items} | ${third.items} | ${sharedItem} | ${getPriority(sharedItem)}`);
    }

    console.log(`Priority: ${sum}`);
}

main();
