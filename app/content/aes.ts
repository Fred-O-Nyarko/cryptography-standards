export type AesRoundTrace = {
  round: number;
  roundKeyHex: string;
  startStateHex: string;
  afterSubBytesHex: string;
  afterShiftRowsHex: string;
  afterMixColumnsHex?: string;
  afterAddRoundKeyHex: string;
};

export type AesTrace = {
  plaintextHex: string;
  keyHex: string;
  expectedCiphertextHex: string;
  roundKeysHex: string[];
  expandedWordsHex: string[];
  initialStateHex: string;
  initialRoundKeyHex: string;
  afterInitialAddRoundKeyHex: string;
  rounds: AesRoundTrace[];
  ciphertextHex: string;
};

const S_BOX = [
  0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b,
  0xfe, 0xd7, 0xab, 0x76, 0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0,
  0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0, 0xb7, 0xfd, 0x93, 0x26,
  0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
  0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2,
  0xeb, 0x27, 0xb2, 0x75, 0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0,
  0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84, 0x53, 0xd1, 0x00, 0xed,
  0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
  0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f,
  0x50, 0x3c, 0x9f, 0xa8, 0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5,
  0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2, 0xcd, 0x0c, 0x13, 0xec,
  0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
  0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14,
  0xde, 0x5e, 0x0b, 0xdb, 0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c,
  0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79, 0xe7, 0xc8, 0x37, 0x6d,
  0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
  0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f,
  0x4b, 0xbd, 0x8b, 0x8a, 0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e,
  0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e, 0xe1, 0xf8, 0x98, 0x11,
  0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
  0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f,
  0xb0, 0x54, 0xbb, 0x16,
];

const RCON = [
  [0x01, 0x00, 0x00, 0x00],
  [0x02, 0x00, 0x00, 0x00],
  [0x04, 0x00, 0x00, 0x00],
  [0x08, 0x00, 0x00, 0x00],
  [0x10, 0x00, 0x00, 0x00],
  [0x20, 0x00, 0x00, 0x00],
  [0x40, 0x00, 0x00, 0x00],
  [0x80, 0x00, 0x00, 0x00],
  [0x1b, 0x00, 0x00, 0x00],
  [0x36, 0x00, 0x00, 0x00],
];

export function hexToBytes(hex: string) {
  const normalized = hex.replace(/^0x/i, "").replace(/\s/g, "");
  const bytes: number[] = [];

  for (let index = 0; index < normalized.length; index += 2) {
    bytes.push(Number.parseInt(normalized.slice(index, index + 2), 16));
  }

  return bytes;
}

export function bytesToHex(bytes: number[]) {
  return bytes.map((byte) => byte.toString(16).padStart(2, "0")).join("").toUpperCase();
}

export function stateHexToRows(hex: string) {
  const bytes = hexToBytes(hex);
  return [0, 1, 2, 3].map((row) => [0, 1, 2, 3].map((column) => bytes[row + 4 * column]));
}

function xorWords(left: number[], right: number[]) {
  return left.map((byte, index) => byte ^ right[index]);
}

function rotWord(word: number[]) {
  return [word[1], word[2], word[3], word[0]];
}

function subWord(word: number[]) {
  return word.map((byte) => S_BOX[byte]);
}

function expandKey(keyBytes: number[]) {
  const words: number[][] = [];

  for (let index = 0; index < 4; index += 1) {
    words.push(keyBytes.slice(index * 4, index * 4 + 4));
  }

  for (let index = 4; index < 44; index += 1) {
    let temp = [...words[index - 1]];

    if (index % 4 === 0) {
      temp = xorWords(subWord(rotWord(temp)), RCON[index / 4 - 1]);
    }

    words.push(xorWords(words[index - 4], temp));
  }

  return words;
}

function roundKey(words: number[][], round: number) {
  return words.slice(round * 4, round * 4 + 4).flat();
}

function addRoundKey(state: number[], keyBytes: number[]) {
  return state.map((byte, index) => byte ^ keyBytes[index]);
}

function subBytes(state: number[]) {
  return state.map((byte) => S_BOX[byte]);
}

function shiftRows(state: number[]) {
  const shifted = [...state];

  for (let row = 1; row < 4; row += 1) {
    const rowBytes = [0, 1, 2, 3].map((column) => state[row + 4 * column]);

    for (let column = 0; column < 4; column += 1) {
      shifted[row + 4 * column] = rowBytes[(column + row) % 4];
    }
  }

  return shifted;
}

function xtime(byte: number) {
  return ((byte << 1) ^ ((byte & 0x80) ? 0x1b : 0)) & 0xff;
}

function multiply(byte: number, factor: number) {
  if (factor === 1) {
    return byte;
  }

  if (factor === 2) {
    return xtime(byte);
  }

  if (factor === 3) {
    return xtime(byte) ^ byte;
  }

  throw new Error(`Unsupported AES multiplication factor ${factor}`);
}

function mixColumns(state: number[]) {
  const mixed = [...state];

  for (let column = 0; column < 4; column += 1) {
    const offset = column * 4;
    const a0 = state[offset];
    const a1 = state[offset + 1];
    const a2 = state[offset + 2];
    const a3 = state[offset + 3];

    mixed[offset] = multiply(a0, 2) ^ multiply(a1, 3) ^ a2 ^ a3;
    mixed[offset + 1] = a0 ^ multiply(a1, 2) ^ multiply(a2, 3) ^ a3;
    mixed[offset + 2] = a0 ^ a1 ^ multiply(a2, 2) ^ multiply(a3, 3);
    mixed[offset + 3] = multiply(a0, 3) ^ a1 ^ a2 ^ multiply(a3, 2);
  }

  return mixed;
}

export function createAes128Trace(
  plaintextHex = "00112233445566778899AABBCCDDEEFF",
  keyHex = "000102030405060708090A0B0C0D0E0F",
): AesTrace {
  const plaintext = hexToBytes(plaintextHex);
  const key = hexToBytes(keyHex);
  const expandedWords = expandKey(key);
  const roundKeys = Array.from({ length: 11 }, (_, round) => roundKey(expandedWords, round));
  const initialRoundKey = roundKeys[0];
  let state = addRoundKey(plaintext, initialRoundKey);
  const rounds: AesRoundTrace[] = [];

  for (let round = 1; round <= 10; round += 1) {
    const startStateHex = bytesToHex(state);
    const afterSubBytes = subBytes(state);
    const afterShiftRows = shiftRows(afterSubBytes);
    const afterMixColumns = round === 10 ? undefined : mixColumns(afterShiftRows);
    const beforeRoundKey = afterMixColumns ?? afterShiftRows;
    const roundKeyBytes = roundKeys[round];
    state = addRoundKey(beforeRoundKey, roundKeyBytes);

    rounds.push({
      round,
      roundKeyHex: bytesToHex(roundKeyBytes),
      startStateHex,
      afterSubBytesHex: bytesToHex(afterSubBytes),
      afterShiftRowsHex: bytesToHex(afterShiftRows),
      afterMixColumnsHex: afterMixColumns ? bytesToHex(afterMixColumns) : undefined,
      afterAddRoundKeyHex: bytesToHex(state),
    });
  }

  return {
    plaintextHex,
    keyHex,
    expectedCiphertextHex: "69C4E0D86A7B0430D8CDB78070B4C55A",
    roundKeysHex: roundKeys.map(bytesToHex),
    expandedWordsHex: expandedWords.map(bytesToHex),
    initialStateHex: bytesToHex(plaintext),
    initialRoundKeyHex: bytesToHex(initialRoundKey),
    afterInitialAddRoundKeyHex: rounds[0].startStateHex,
    rounds,
    ciphertextHex: bytesToHex(state),
  };
}

export const aesTrace = createAes128Trace();

export const aesTraceChecks = {
  expectedCiphertextHex: aesTrace.expectedCiphertextHex,
  actualCiphertextHex: aesTrace.ciphertextHex,
  firstRoundKeyHex: aesTrace.roundKeysHex[1],
  finalRoundKeyHex: aesTrace.roundKeysHex[10],
};
