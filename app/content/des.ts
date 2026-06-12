export type DesRoundTrace = {
  round: number;
  shift: number;
  c: string;
  d: string;
  subkey: string;
  leftBefore: string;
  rightBefore: string;
  expandedRight: string;
  mixedWithSubkey: string;
  sBoxOutput: string;
  permutationOutput: string;
  leftAfter: string;
  rightAfter: string;
};

export type DesOperationMode = "encrypt" | "decrypt";

export type DesOperationTrace = {
  mode: DesOperationMode;
  inputHex: string;
  keyHex: string;
  inputBits: string;
  keyBits: string;
  keyWithoutParity: string;
  initialPermutation: string;
  l0: string;
  r0: string;
  c0: string;
  d0: string;
  rounds: DesRoundTrace[];
  preOutput: string;
  outputBits: string;
  outputHex: string;
};

export type DesTrace = {
  plaintextHex: string;
  keyHex: string;
  expectedCiphertextHex: string | null;
  plaintextBits: string;
  keyBits: string;
  keyWithoutParity: string;
  initialPermutation: string;
  l0: string;
  r0: string;
  c0: string;
  d0: string;
  rounds: DesRoundTrace[];
  preOutput: string;
  ciphertextBits: string;
  ciphertextHex: string;
};

type DesKeyScheduleEntry = {
  shift: number;
  c: string;
  d: string;
  subkey: string;
};

const IP = [
  58, 50, 42, 34, 26, 18, 10, 2, 60, 52, 44, 36, 28, 20, 12, 4, 62, 54, 46,
  38, 30, 22, 14, 6, 64, 56, 48, 40, 32, 24, 16, 8, 57, 49, 41, 33, 25, 17,
  9, 1, 59, 51, 43, 35, 27, 19, 11, 3, 61, 53, 45, 37, 29, 21, 13, 5, 63, 55,
  47, 39, 31, 23, 15, 7,
];

const FP = [
  40, 8, 48, 16, 56, 24, 64, 32, 39, 7, 47, 15, 55, 23, 63, 31, 38, 6, 46,
  14, 54, 22, 62, 30, 37, 5, 45, 13, 53, 21, 61, 29, 36, 4, 44, 12, 52, 20,
  60, 28, 35, 3, 43, 11, 51, 19, 59, 27, 34, 2, 42, 10, 50, 18, 58, 26, 33, 1,
  41, 9, 49, 17, 57, 25,
];

const E = [
  32, 1, 2, 3, 4, 5, 4, 5, 6, 7, 8, 9, 8, 9, 10, 11, 12, 13, 12, 13, 14, 15,
  16, 17, 16, 17, 18, 19, 20, 21, 20, 21, 22, 23, 24, 25, 24, 25, 26, 27, 28,
  29, 28, 29, 30, 31, 32, 1,
];

const P = [
  16, 7, 20, 21, 29, 12, 28, 17, 1, 15, 23, 26, 5, 18, 31, 10, 2, 8, 24, 14,
  32, 27, 3, 9, 19, 13, 30, 6, 22, 11, 4, 25,
];

const PC1 = [
  57, 49, 41, 33, 25, 17, 9, 1, 58, 50, 42, 34, 26, 18, 10, 2, 59, 51, 43,
  35, 27, 19, 11, 3, 60, 52, 44, 36, 63, 55, 47, 39, 31, 23, 15, 7, 62, 54,
  46, 38, 30, 22, 14, 6, 61, 53, 45, 37, 29, 21, 13, 5, 28, 20, 12, 4,
];

const PC2 = [
  14, 17, 11, 24, 1, 5, 3, 28, 15, 6, 21, 10, 23, 19, 12, 4, 26, 8, 16, 7,
  27, 20, 13, 2, 41, 52, 31, 37, 47, 55, 30, 40, 51, 45, 33, 48, 44, 49, 39,
  56, 34, 53, 46, 42, 50, 36, 29, 32,
];

const KEY_SHIFTS = [1, 1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1];

const S_BOXES = [
  [
    [14, 4, 13, 1, 2, 15, 11, 8, 3, 10, 6, 12, 5, 9, 0, 7],
    [0, 15, 7, 4, 14, 2, 13, 1, 10, 6, 12, 11, 9, 5, 3, 8],
    [4, 1, 14, 8, 13, 6, 2, 11, 15, 12, 9, 7, 3, 10, 5, 0],
    [15, 12, 8, 2, 4, 9, 1, 7, 5, 11, 3, 14, 10, 0, 6, 13],
  ],
  [
    [15, 1, 8, 14, 6, 11, 3, 4, 9, 7, 2, 13, 12, 0, 5, 10],
    [3, 13, 4, 7, 15, 2, 8, 14, 12, 0, 1, 10, 6, 9, 11, 5],
    [0, 14, 7, 11, 10, 4, 13, 1, 5, 8, 12, 6, 9, 3, 2, 15],
    [13, 8, 10, 1, 3, 15, 4, 2, 11, 6, 7, 12, 0, 5, 14, 9],
  ],
  [
    [10, 0, 9, 14, 6, 3, 15, 5, 1, 13, 12, 7, 11, 4, 2, 8],
    [13, 7, 0, 9, 3, 4, 6, 10, 2, 8, 5, 14, 12, 11, 15, 1],
    [13, 6, 4, 9, 8, 15, 3, 0, 11, 1, 2, 12, 5, 10, 14, 7],
    [1, 10, 13, 0, 6, 9, 8, 7, 4, 15, 14, 3, 11, 5, 2, 12],
  ],
  [
    [7, 13, 14, 3, 0, 6, 9, 10, 1, 2, 8, 5, 11, 12, 4, 15],
    [13, 8, 11, 5, 6, 15, 0, 3, 4, 7, 2, 12, 1, 10, 14, 9],
    [10, 6, 9, 0, 12, 11, 7, 13, 15, 1, 3, 14, 5, 2, 8, 4],
    [3, 15, 0, 6, 10, 1, 13, 8, 9, 4, 5, 11, 12, 7, 2, 14],
  ],
  [
    [2, 12, 4, 1, 7, 10, 11, 6, 8, 5, 3, 15, 13, 0, 14, 9],
    [14, 11, 2, 12, 4, 7, 13, 1, 5, 0, 15, 10, 3, 9, 8, 6],
    [4, 2, 1, 11, 10, 13, 7, 8, 15, 9, 12, 5, 6, 3, 0, 14],
    [11, 8, 12, 7, 1, 14, 2, 13, 6, 15, 0, 9, 10, 4, 5, 3],
  ],
  [
    [12, 1, 10, 15, 9, 2, 6, 8, 0, 13, 3, 4, 14, 7, 5, 11],
    [10, 15, 4, 2, 7, 12, 9, 5, 6, 1, 13, 14, 0, 11, 3, 8],
    [9, 14, 15, 5, 2, 8, 12, 3, 7, 0, 4, 10, 1, 13, 11, 6],
    [4, 3, 2, 12, 9, 5, 15, 10, 11, 14, 1, 7, 6, 0, 8, 13],
  ],
  [
    [4, 11, 2, 14, 15, 0, 8, 13, 3, 12, 9, 7, 5, 10, 6, 1],
    [13, 0, 11, 7, 4, 9, 1, 10, 14, 3, 5, 12, 2, 15, 8, 6],
    [1, 4, 11, 13, 12, 3, 7, 14, 10, 15, 6, 8, 0, 5, 9, 2],
    [6, 11, 13, 8, 1, 4, 10, 7, 9, 5, 0, 15, 14, 2, 3, 12],
  ],
  [
    [13, 2, 8, 4, 6, 15, 11, 1, 10, 9, 3, 14, 5, 0, 12, 7],
    [1, 15, 13, 8, 10, 3, 7, 4, 12, 5, 6, 11, 0, 14, 9, 2],
    [7, 11, 4, 1, 9, 12, 14, 2, 0, 6, 10, 13, 15, 3, 5, 8],
    [2, 1, 14, 7, 4, 10, 8, 13, 15, 12, 9, 0, 3, 5, 6, 11],
  ],
];

export function groupBits(bits: string, groupSize = 4) {
  const groups: string[] = [];

  for (let index = 0; index < bits.length; index += groupSize) {
    groups.push(bits.slice(index, index + groupSize));
  }

  return groups.join(" ");
}

export function bitsToHex(bits: string) {
  const paddedBits = bits.padStart(Math.ceil(bits.length / 4) * 4, "0");
  const chunks: string[] = [];

  for (let index = 0; index < paddedBits.length; index += 4) {
    chunks.push(Number.parseInt(paddedBits.slice(index, index + 4), 2).toString(16));
  }

  return chunks.join("").toUpperCase();
}

export function hexToBits(hex: string) {
  return hex
    .replace(/^0x/i, "")
    .split("")
    .map((character) => Number.parseInt(character, 16).toString(2).padStart(4, "0"))
    .join("");
}

function permute(bits: string, table: number[]) {
  return table.map((position) => bits[position - 1]).join("");
}

function rotateLeft(bits: string, count: number) {
  return `${bits.slice(count)}${bits.slice(0, count)}`;
}

function xorBits(left: string, right: string) {
  return left
    .split("")
    .map((bit, index) => (bit === right[index] ? "0" : "1"))
    .join("");
}

function sBoxSubstitution(bits48: string) {
  const chunks: string[] = [];

  for (let boxIndex = 0; boxIndex < 8; boxIndex += 1) {
    const chunk = bits48.slice(boxIndex * 6, boxIndex * 6 + 6);
    const row = Number.parseInt(`${chunk[0]}${chunk[5]}`, 2);
    const column = Number.parseInt(chunk.slice(1, 5), 2);
    const value = S_BOXES[boxIndex][row][column];
    chunks.push(value.toString(2).padStart(4, "0"));
  }

  return chunks.join("");
}

function createDesKeySchedule(keyBits: string) {
  const keyWithoutParity = permute(keyBits, PC1);
  let c = keyWithoutParity.slice(0, 28);
  let d = keyWithoutParity.slice(28);
  const c0 = c;
  const d0 = d;
  const entries: DesKeyScheduleEntry[] = [];

  for (let roundIndex = 0; roundIndex < 16; roundIndex += 1) {
    const shift = KEY_SHIFTS[roundIndex];
    c = rotateLeft(c, shift);
    d = rotateLeft(d, shift);

    entries.push({
      shift,
      c,
      d,
      subkey: permute(`${c}${d}`, PC2),
    });
  }

  return { keyWithoutParity, c0, d0, entries };
}

export function createDesOperationTrace(
  inputHex: string,
  keyHex: string,
  mode: DesOperationMode,
): DesOperationTrace {
  const inputBits = hexToBits(inputHex);
  const keyBits = hexToBits(keyHex);
  const initialPermutation = permute(inputBits, IP);
  let left = initialPermutation.slice(0, 32);
  let right = initialPermutation.slice(32);
  const { keyWithoutParity, c0, d0, entries } = createDesKeySchedule(keyBits);
  const activeEntries = mode === "encrypt" ? entries : [...entries].reverse();
  const rounds: DesRoundTrace[] = [];

  for (let roundIndex = 0; roundIndex < 16; roundIndex += 1) {
    const keyScheduleEntry = activeEntries[roundIndex];
    const subkey = keyScheduleEntry.subkey;
    const expandedRight = permute(right, E);
    const mixedWithSubkey = xorBits(expandedRight, subkey);
    const sBoxOutput = sBoxSubstitution(mixedWithSubkey);
    const permutationOutput = permute(sBoxOutput, P);
    const leftAfter = right;
    const rightAfter = xorBits(left, permutationOutput);

    rounds.push({
      round: roundIndex + 1,
      shift: keyScheduleEntry.shift,
      c: keyScheduleEntry.c,
      d: keyScheduleEntry.d,
      subkey,
      leftBefore: left,
      rightBefore: right,
      expandedRight,
      mixedWithSubkey,
      sBoxOutput,
      permutationOutput,
      leftAfter,
      rightAfter,
    });

    left = leftAfter;
    right = rightAfter;
  }

  const preOutput = `${right}${left}`;
  const outputBits = permute(preOutput, FP);

  return {
    mode,
    inputHex,
    keyHex,
    inputBits,
    keyBits,
    keyWithoutParity,
    initialPermutation,
    l0: initialPermutation.slice(0, 32),
    r0: initialPermutation.slice(32),
    c0,
    d0,
    rounds,
    preOutput,
    outputBits,
    outputHex: bitsToHex(outputBits),
  };
}

export function createDesTrace(
  plaintextHex: string,
  keyHex: string,
  expectedCiphertextHex: string | null = null,
): DesTrace {
  const trace = createDesOperationTrace(plaintextHex, keyHex, "encrypt");

  return {
    plaintextHex,
    keyHex,
    expectedCiphertextHex,
    plaintextBits: trace.inputBits,
    keyBits: trace.keyBits,
    keyWithoutParity: trace.keyWithoutParity,
    initialPermutation: trace.initialPermutation,
    l0: trace.l0,
    r0: trace.r0,
    c0: trace.c0,
    d0: trace.d0,
    rounds: trace.rounds,
    preOutput: trace.preOutput,
    ciphertextBits: trace.outputBits,
    ciphertextHex: trace.outputHex,
  };
}

export function desEncryptBlock(plaintextHex: string, keyHex: string) {
  return createDesOperationTrace(plaintextHex, keyHex, "encrypt").outputHex;
}

export function desDecryptBlock(ciphertextHex: string, keyHex: string) {
  return createDesOperationTrace(ciphertextHex, keyHex, "decrypt").outputHex;
}

export const desTrace = createDesTrace(
  "0123456789ABCDEF",
  "133457799BBCDFF1",
  "85E813540F0AB405",
);

export const desTraceChecks = {
  firstSubkeyHex: "1B02EFFC7072",
  lastSubkeyHex: "CB3D8B0E17F5",
  expectedCiphertextHex: desTrace.expectedCiphertextHex,
};
