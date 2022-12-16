import * as toolbox from "../lib/toolbox.mjs";
import { Equatable, OrderedSet } from "../lib/containers.mjs";

class Coordinates implements Equatable {
  readonly x: number;
  readonly y: number;
  readonly elevation: number;
  readonly counter: number;
  readonly isFinished: boolean;

  constructor(x: number, y: number, elevation: string, counter: number) {
    this.x = x;
    this.y = y;
    this.isFinished = elevation === "S" || elevation === "a"; // remove the "a" check when computing the first part

    this.elevation = (
      elevation === "S" ? "a" : elevation === "E" ? "z" : elevation
    ).charCodeAt(0);
    this.counter = counter;
  }

  equals(other: Coordinates): boolean {
    return this.x === other.x && this.y === other.y;
  }

  toString(): string {
    return `(${this.y},${this.x}, ${String.fromCharCode(this.elevation)}, ${
      this.counter
    })`;
  }
}

function getEndingCoordinates(grid: string[]): Coordinates {
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x] === "E") {
        return new Coordinates(x, y, grid[y][x], 0);
      }
    }
  }

  throw new Error("No ending coordinates found");
}

function getNeighbors(
  grid: string[],
  current: Coordinates,
  step: number
): Coordinates[] {
  const neighbors: Coordinates[] = [];

  // north
  if (current.y > 0) {
    neighbors.push(
      new Coordinates(
        current.x,
        current.y - 1,
        grid[current.y - 1][current.x],
        step
      )
    );
  }

  // south
  if (current.y < grid.length - 1) {
    neighbors.push(
      new Coordinates(
        current.x,
        current.y + 1,
        grid[current.y + 1][current.x],
        step
      )
    );
  }

  // west
  if (current.x > 0) {
    neighbors.push(
      new Coordinates(
        current.x - 1,
        current.y,
        grid[current.y][current.x - 1],
        step
      )
    );
  }

  // east
  if (current.x < grid[current.y].length - 1) {
    neighbors.push(
      new Coordinates(
        current.x + 1,
        current.y,
        grid[current.y][current.x + 1],
        step
      )
    );
  }

  return neighbors;
}

function map(grid: string[]): OrderedSet<Coordinates> {
  const visited = new OrderedSet<Coordinates>();
  const queue = new OrderedSet<Coordinates>();

  queue.push(getEndingCoordinates(grid));
  toolbox.debugLog(
    "Starting search at coordinates: ",
    queue.values()[0].toString()
  );

  while (!queue.isEmpty()) {
    const current = queue.first!;
    queue.remove(current);
    visited.push(current);

    const neighbors = getNeighbors(grid, current, current.counter + 1);
    for (const neighbor of neighbors) {
      if (
        current.elevation - neighbor.elevation <= 1 &&
        !visited.has(neighbor)
      ) {
        if (neighbor.isFinished) {
          toolbox.debugLog(
            "Found path, stopping search at coordinates: ",
            neighbor.toString()
          );
          visited.push(neighbor);
          return visited;
        }

        if (queue.push(neighbor)) {
          toolbox.debugLog("Adding neighbor to queue: ", neighbor.toString());
        }
      }
    }
  }

  throw new Error("No path found");
}

function findShortestPath(grid: string[]): OrderedSet<Coordinates> {
  const visited = map(grid);
  const shortestPath = new OrderedSet<Coordinates>();

  toolbox.debugLog("========");
  let current = visited.search((value) => value.isFinished)[0];

  toolbox.debugLog("Shortest path begins at: ", current.toString());
  shortestPath.push(current);

  while (!current.equals(getEndingCoordinates(grid))) {
    const neighbors = getNeighbors(grid, current, current.counter - 1);

    for (const neighbor of neighbors) {
      const found = visited.search((value) => value.equals(neighbor))[0];

      if (found && found.counter === current.counter - 1) {
        current = neighbor;
        toolbox.debugLog(
          "Adding neighbor to shortest path: ",
          neighbor.toString()
        );
        shortestPath.push(current);
        break;
      } else {
        toolbox.debugLog(
          "Neighbor is not part of shortest path: ",
          neighbor.toString()
        );
      }
    }
  }

  return shortestPath;
}

function main(): void {
  const input = toolbox.readInput();
  const grid = input.split("\n");

  const shortestPath = findShortestPath(grid);

  toolbox.debugLog(
    `Shortest path: ${shortestPath
      .values()
      .map((value: Coordinates) => value.toString())
      .join(" -> ")}`
  );

  console.log("Part 1:", shortestPath.length() - 1);
}

main();
