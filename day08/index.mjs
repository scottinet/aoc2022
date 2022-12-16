import * as toolbox from "../lib/toolbox.mjs";

class Tree {
  constructor(height, x, y) {
    this.height = height;
    this.x = x;
    this.y = y;
    this.neighbours = {
      left: null,
      right: null,
      above: null,
      below: null,
    };

    this.highest = {
      left: null,
      right: null,
      above: null,
      below: null,
    };
  }

  getHighest(direction) {
    if (this.highest[direction] === null) {
      if (this.neighbours[direction] === null) {
        this.highest[direction] = this;
      } else {
        const highestNeighbour =
          this.neighbours[direction].getHighest(direction);
        this.highest[direction] =
          highestNeighbour.height >= this.height ? highestNeighbour : this;
      }
    }

    return this.highest[direction];
  }

  getViewDistance(direction, height = this.height) {
    const neighbour = this.neighbours[direction];

    if (neighbour === null) {
      return 0;
    }

    if (neighbour.height >= height) {
      return 1;
    }

    return 1 + neighbour.getViewDistance(direction, height);
  }

  get isVisible() {
    const _isVisible =
      this.getHighest("left") === this ||
      this.getHighest("right") === this ||
      this.getHighest("above") === this ||
      this.getHighest("below") === this;

    if (!_isVisible && toolbox.isDebug()) {
      console.log(
        `Tree at ${this.y},${this.x} is not visible (height: ${this.height}, highest above: ${this.highest.above}, highest below: ${this.highest.below}, highest left: ${this.highest.left}, highest right: ${this.highest.right})`
      );
    }

    return _isVisible;
  }

  get scenicScore() {
    return (
      this.getViewDistance("left") *
      this.getViewDistance("right") *
      this.getViewDistance("above") *
      this.getViewDistance("below")
    );
  }

  toString() {
    return `([${this.y}, ${this.x}]: ${this.height})`;
  }
}

function parseTrees(input) {
  const forest = [];
  const lines = input.split("\n");
  const treesAbove = [];

  for (const line of lines) {
    const trees = line.trim().split("");
    const row = [];
    let leftTree = null;

    for (let i = 0; i < trees.length; i++) {
      const height = parseInt(trees[i]);

      const tree = new Tree(height, i, forest.length);

      row.push(tree);

      if (treesAbove[i] !== undefined) {
        tree.neighbours.above = treesAbove[i];
      }

      tree.neighbours.left = leftTree;
      treesAbove[i] = tree;
      leftTree = tree;
    }

    forest.push(row);
  }

  fillRightAndBelowNeighbours(forest);

  return forest;
}

function fillRightAndBelowNeighbours(forest) {
  const treesBelow = [];

  for (let y = forest.length - 1; y >= 0; y--) {
    let rightTree = null;

    for (let x = forest[y].length - 1; x >= 0; x--) {
      const tree = forest[y][x];

      if (treesBelow[x] !== undefined) {
        tree.neighbours.below = treesBelow[x];
      }

      treesBelow[x] = tree;
      tree.neighbours.right = rightTree;
      rightTree = tree;
    }
  }
}

function countVisibleTrees(forest) {
  let count = 0;
  for (const row of forest) {
    for (const tree of row) {
      if (tree.isVisible) {
        count++;
      }
    }
  }

  return count;
}

function main() {
  const input = toolbox.readInput();
  const forest = parseTrees(input);

  // part 1
  const visibleTrees = countVisibleTrees(forest);
  console.log(`There are ${visibleTrees} visible trees`);

  // part 2
  let score = 0;
  let bestTree = null;
  for (const row of forest) {
    for (const tree of row) {
      score = Math.max(score, tree.scenicScore);
      toolbox.debugLog(
        `Tree at ${tree.y},${tree.x} has a height of ${tree.height} and a scenic score of ${tree.scenicScore}`
      );

      if (tree.scenicScore === score) {
        bestTree = tree;
      }
    }
  }

  console.log(
    `The highest scenic score is ${score} (tree at ${bestTree.toString()}, view above: ${bestTree.getViewDistance(
      "above"
    )}, view below: ${bestTree.getViewDistance(
      "below"
    )}, view left: ${bestTree.getViewDistance(
      "left"
    )}, view right: ${bestTree.getViewDistance("right")})`
  );
}

main();
