import { argv } from "node:process";
import { existsSync, readFileSync } from "node:fs";

const _isDebug = argv.includes("--debug");

export function isDebug(): boolean {
  return _isDebug;
}

export function debugLog(...args: string[]): void {
  if (_isDebug) {
    console.log(...args);
  }
}

export function readInput(): string {
  const index = argv.indexOf("--file");

  if (index === -1) {
    throw new Error("Missing --file argument");
  }

  const filename = argv[index + 1];

  if (!existsSync(filename)) {
    throw new Error(`File not found: ${filename}`);
  }

  return readFileSync(filename, "utf8");
}
