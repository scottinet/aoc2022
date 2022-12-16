import * as toolbox from '../lib/toolbox.mjs';

function areAllCharsUnique(str) {
  const chars = str.split('');
  const uniqueChars = new Set(chars);

  return chars.length === uniqueChars.size;
}

function getPacketStartIndex(data, packetLength) {
  for (let i = 0; i < data.length - packetLength; i++) {
    const packet = data.slice(i, i + packetLength);

    if (areAllCharsUnique(packet)) {
      return i + packetLength;
    }
  }

  return -1;
}

function main() {
  const input = toolbox.readInput();

  // part 1
  console.log(`Packet start: ${getPacketStartIndex(input, 4)}`);

  // part 2
  console.log(`Packet start: ${getPacketStartIndex(input, 14)}`);
}

main();