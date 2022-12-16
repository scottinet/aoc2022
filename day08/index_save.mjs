import * as toolbox from '../lib/toolbox.mjs';

class Tree {
  constructor(height, x, y, highestAbove, highestLeft, aboveDistance, leftDistance) {
    this.height = height;
    this.x = x;
    this.y = y;
    this.aboveDistance = aboveDistance;
    this.leftDistance = leftDistance;
    this.highestAbove = highestAbove;
    this.highestLeft = highestLeft;
    this.highestRight = -2;
    this.highestBelow = -2;
    this.belowDistance = -2;
    this.rightDistance = -2;
  }

  get isVisible() {
    if (this.highestAbove === -2 || this.highestBelow === -2 || 
        this.highestLeft === -2 || this.highestRight === -2) {
      throw new Error('Tree is not fully initialized');
    }

    const _isVisible = this.height > this.highestAbove ||
      this.height > this.highestBelow ||
      this.height > this.highestLeft ||
      this.height > this.highestRight;

    if (!_isVisible && toolbox.isDebug()) {
      console.log(`Tree at ${this.x},${this.y} is not visible (height: ${this.height}, highestAbove: ${this.highestAbove}, highestBelow: ${this.highestBelow}, highestLeft: ${this.highestLeft}, highestRight: ${this.highestRight})`);
    }

    return _isVisible;
  }

  get scenicScore() {
    if (this.aboveDistance === -2 || this.belowDistance === -2 ||
        this.leftDistance === -2 || this.rightDistance === -2) {
      throw new Error('Tree is not fully initialized');
    }

    return this.aboveDistance * this.belowDistance * this.leftDistance * this.rightDistance;
  }
}

function parseTrees(input) {
  const forest = [];
  const lines = input.split('\n');
  const maxHeightAbove = new Int8Array(lines[0].trim().split('').length);
  const previousAboveHeights = new Int8Array(lines[0].trim().split('').length);
  maxHeightAbove.fill(-1, 0, maxHeightAbove.length);
  previousAboveHeights.fill(-1, 0, aboveDistances.length);

  for (const line of lines) {
    let highestLeft = -1;
    let previousLeftHeight = -1;
    const trees = line.trim().split('');
    const row = [];

    for (let i = 0; i < trees.length; i++) {
      const height = parseInt(trees[i]);
      let leftDistance = 0;
      if (highestLeft > -1 && highestLeft < height) {
        leftDistance++;
      }
      
      if (maxHeightAbove[i] > -1 && maxHeightAbove[i] < height) {
        aboveDistances[i]++;
      }
       
      const tree = new Tree(height, i, forest.length, maxHeightAbove[i], 
        highestLeft, aboveDistances[i], leftDistance);

      row.push(tree);
      
      highestLeft = Math.max(height, highestLeft);
      maxHeightAbove[i] = Math.max(height, maxHeightAbove[i]);

      toolbox.debugLog(`Tree at ${i},${forest.length} has height ${height}, a distance above of ${aboveDistances[i]}, a distance left of ${leftDistance}`);
    }    

    forest.push(row);
  }

  fillRightAndBelowValues(forest);

  return forest;
}
  
function fillRightAndBelowValues(forest) {
  const belowDistances = new Int8Array(forest[0].length);
  const maxHeightBelow = new Int8Array(forest[0].length);
  maxHeightBelow.fill(-1, 0, maxHeightBelow.length);
  belowDistances.fill(0, 0, belowDistances.length);

  for (let y = forest.length - 1; y >= 0; y--) {
    let highestRight = -1;
    let rightDistance = 0;

    for (let x = forest[y].length - 1; x >= 0; x--) {
      const tree = forest[y][x];
      tree.highestBelow = maxHeightBelow[x];
      tree.highestRight = highestRight;
      tree.belowDistance = belowDistances[x];
      tree.rightDistance = rightDistance;

      if (highestRight > -1 && highestRight < tree.height) {
        rightDistance++;
      }
       
      highestRight = Math.max(tree.height, highestRight);

      if (maxHeightBelow[x] > -1 && maxHeightBelow[x] < tree.height) {
        belowDistances[x]++;
      }

      maxHeightBelow[x] = Math.max(tree.height, maxHeightBelow[x]);

      toolbox.debugLog(`Tree at ${x},${y} has height ${tree.height}, a distance below of ${belowDistances[x]}, a distance right of ${rightDistance}`);
    }
  }

  return forest;
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
      console.log(`Tree at ${tree.x},${tree.y} has a height of ${tree.height} and a scenic score of ${tree.scenicScore}`);
      if (tree.scenicScore === score) {
        bestTree = tree;
      }
    }
  }

  console.log(`The highest scenic score is ${score} (tree at ${bestTree.x},${bestTree.y}, height: ${bestTree.height}, aboveDistance: ${bestTree.aboveDistance}, belowDistance: ${bestTree.belowDistance}, leftDistance: ${bestTree.leftDistance}, rightDistance: ${bestTree.rightDistance})`);
}

main();