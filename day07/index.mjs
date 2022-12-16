import * as toolbox from '../lib/toolbox.mjs';

class File {
  constructor(parent, name, size) {
    this.parent = parent;
    this.name = name;
    this.size = size;
  }

  getSize() {
    return this.size;
  }

  print(level = 0) {
    console.log('  '.repeat(level) + `- ${this.name} (size=${this.size})`);
  }
}

class Directory {
  constructor(parent, name) {
    this.parent = parent;
    this.name = name;
    this.children = [];
  }

  addChild(child) {
    this.children.push(child);
  }

  getSize() {
    return this.children.reduce((acc, child) => acc + child.getSize(), 0);
  }

  cd(name) {
    if (name === this.name || name === '.') {
      return this;
    }

    if (name === '/') {
      return this.parent.cd(name);
    }

    if (name === '..') {
      return this.parent || this;
    }

    let child = this.children.find(child => child.name === name);

    if (!child) {
      child = new Directory(this, name);
      this.addChild(child);
    }

    return child;
  }

  print(level = 0) {
    console.log('  '.repeat(level) + `- ${this.name}`);
    this.children.forEach(child => child.print(level + 1));
  }
}

function parseInput(data, currentNode, index = 0) {
  if (index >= data.length) {
    return;
  }
  
  const command = data[index];

  toolbox.debugLog(`Command: ${command}, index: ${index}`);

  if (command[0] === '$') {
    if (command.startsWith('$ cd')) {
      const [, , name] = command.split(' ');
      currentNode = currentNode.cd(name);
      parseInput(data, currentNode, index + 1);
    } else if (command.startsWith('$ ls')) {
      // do nothing, simply skip
      parseInput(data, currentNode, index + 1);
    } else {
      throw new Error(`Unknown command: ${command}`);
    }
  } else {
    if (command.startsWith('dir')) {
      const [, name] = command.split(' ');
      currentNode.addChild(new Directory(currentNode, name));
      parseInput(data, currentNode, index + 1);
    } else {
      const [size, name] = command.split(' ');
      currentNode.addChild(new File(currentNode, name, parseInt(size)));
      parseInput(data, currentNode, index + 1);
    }
  }
}

function getSmallDirectories(currentNode, threshold = 100000, directories = []) {
  if (!(currentNode instanceof Directory)) {
    return;
  }

  if (currentNode.getSize() < threshold) {
    directories.push(currentNode);
  }

  currentNode.children.forEach(child => getSmallDirectories(child, threshold, directories));

  return directories;
}

function getLargeDirectories(currentNode, threshold = 100000, directories = []) {
  if (!(currentNode instanceof Directory)) {
    return;
  }

  if (currentNode.getSize() >= threshold) {
    directories.push(currentNode);
  }

  currentNode.children.forEach(child => getLargeDirectories(child, threshold, directories));

  return directories;
}

function main() {
  const input = toolbox.readInput();
  const root = new Directory(null, '/');

  parseInput(input.split('\n'), root);

  if (toolbox.isDebug) {
    root.print();
  }

  // part 1
  const smallestDirectories = getSmallDirectories(root);
  console.log(smallestDirectories.map(dir => dir.name).join(' '));
  console.log('Total size: ' + smallestDirectories.reduce((acc, dir) => acc + dir.getSize(), 0));

  // part 2
  const totalDisk = 70000000;
  const freeSpaceRequired = 30000000;
  const freeSpace = totalDisk - root.getSize();
  const largeDirectories = getLargeDirectories(root, freeSpaceRequired - freeSpace).sort((a, b) => a.getSize() - b.getSize());

  console.log(`Free space: ${freeSpace}, smallest large directory: ${largeDirectories[0].name} (size: ${largeDirectories[0].getSize()}), largest large directory: ${largeDirectories[largeDirectories.length - 1].name} (size: ${largeDirectories[largeDirectories.length - 1].getSize()})`);
}

main();