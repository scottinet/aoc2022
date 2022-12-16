import * as toolbox from "../lib/toolbox.mjs";
import { EventEmitter } from "node:events";
class CpuState {
    constructor(cycles = 0, register = 1) {
        this.cycles = 0;
        this.register = 1;
        this.cycles = cycles;
        this.register = register;
    }
    copy() {
        return new CpuState(this.cycles, this.register);
    }
}
class Cpu extends EventEmitter {
    constructor() {
        super(...arguments);
        this.state = new CpuState();
        this.screen = [];
    }
    nextCycle() {
        this.drawCRT();
        this.state.cycles++;
        this.emit("nextCycle", this.state.copy());
    }
    noop() {
        this.nextCycle();
        toolbox.debugLog(`noop (cycles are now ${this.state.cycles})`);
    }
    add(value) {
        this.nextCycle();
        this.nextCycle();
        this.state.register += value;
        toolbox.debugLog(`add ${value} -> ${this.state.register} (cycles are now ${this.state.cycles})`);
    }
    drawCRT() {
        const x = this.state.cycles % Cpu.SCREEN_WIDTH;
        const registerToScreen = this.state.register % Cpu.SCREEN_WIDTH;
        if (x === 0) {
            this.screen.push("");
        }
        this.screen[this.screen.length - 1] +=
            registerToScreen - 1 <= x && x <= registerToScreen + 1 ? "#" : ".";
    }
    printScreen() {
        for (const line of this.screen) {
            console.log(line);
        }
    }
}
Cpu.SCREEN_WIDTH = 40;
function main() {
    const input = toolbox.readInput();
    const lookupCycles = [20, 60, 100, 140, 180, 220];
    let nextCycleIndex = 0;
    let signalStrength = 0;
    const cpu = new Cpu();
    const listener = (state) => {
        if (state.cycles === lookupCycles[nextCycleIndex]) {
            signalStrength += state.register * lookupCycles[nextCycleIndex];
            toolbox.debugLog(`===== Cycle ${lookupCycles[nextCycleIndex]}: signal strength is ${signalStrength} (added ${state.register} * ${lookupCycles[nextCycleIndex]})`);
            nextCycleIndex++;
            if (nextCycleIndex === lookupCycles.length) {
                console.log("Signal Strength: ", signalStrength);
                cpu.removeListener("nextCycle", listener);
            }
        }
    };
    cpu.on("nextCycle", listener);
    for (const line of input.split("\n")) {
        const [op, value] = line.trim().split(" ");
        if (op === "addx") {
            cpu.add(parseInt(value));
        }
        else if (op === "noop") {
            cpu.noop();
        }
        else {
            throw new Error(`Unknown operation ${op}`);
        }
    }
    cpu.printScreen();
}
main();
