export type ElGamalKeyStep = {
  id: string;
  label: string;
  formula: string;
  value: string;
  explanation: string;
};

export type ElGamalModPowStep = {
  step: number;
  bit: string;
  beforeSquare: number;
  afterSquare: number;
  afterMultiply?: number;
  result: number;
  explanation: string;
};

export type ElGamalPowerEntry = {
  exponent: number;
  value: number;
};

export type ElGamalTrace = {
  p: number;
  g: number;
  order: number;
  privateKey: number;
  publicKey: number;
  ephemeralKey: number;
  message: number;
  c1: number;
  sharedSecret: number;
  c2: number;
  decryptedSharedSecret: number;
  sharedSecretInverse: number;
  decryptedMessage: number;
  reusedMessage: number;
  reusedC2: number;
  recoveredSharedSecretFromKnownMessage: number;
  recoveredReusedMessage: number;
  publicParameters: string;
  publicKeyLabel: string;
  privateKeyLabel: string;
  ciphertextLabel: string;
  powerCycle: ElGamalPowerEntry[];
  keyGenerationSteps: ElGamalKeyStep[];
  encryptionSteps: ElGamalKeyStep[];
  decryptionSteps: ElGamalKeyStep[];
  privateKeyPowerSteps: ElGamalModPowStep[];
  ephemeralPowerSteps: ElGamalModPowStep[];
  sharedSecretPowerSteps: ElGamalModPowStep[];
  decryptSharedSecretPowerSteps: ElGamalModPowStep[];
};

function mod(value: number, modulus: number) {
  return ((value % modulus) + modulus) % modulus;
}

function extendedGcd(left: number, right: number): [number, number, number] {
  if (right === 0) {
    return [left, 1, 0];
  }

  const [gcd, x1, y1] = extendedGcd(right, left % right);
  return [gcd, y1, x1 - Math.floor(left / right) * y1];
}

function modInverse(value: number, modulus: number) {
  const [gcd, x] = extendedGcd(value, modulus);

  if (gcd !== 1) {
    throw new Error("Value has no modular inverse.");
  }

  return mod(x, modulus);
}

function modPow(base: number, exponent: number, modulus: number) {
  let result = 1;
  const normalizedBase = mod(base, modulus);
  const bits = exponent.toString(2);
  const steps: ElGamalModPowStep[] = [];

  for (const bit of bits) {
    const beforeSquare = result;
    const afterSquare = (result * result) % modulus;
    result = afterSquare;
    let afterMultiply: number | undefined;

    if (bit === "1") {
      afterMultiply = (result * normalizedBase) % modulus;
      result = afterMultiply;
    }

    steps.push({
      step: steps.length + 1,
      bit,
      beforeSquare,
      afterSquare,
      afterMultiply,
      result,
      explanation:
        bit === "1"
          ? "Square the running value, then multiply by the base because this exponent bit is 1."
          : "Square the running value and skip multiplication because this exponent bit is 0.",
    });
  }

  return {
    result,
    bits,
    steps,
  };
}

function powerCycle(base: number, modulus: number) {
  const entries: ElGamalPowerEntry[] = [];

  for (let exponent = 1; exponent < modulus; exponent += 1) {
    entries.push({
      exponent,
      value: modPow(base, exponent, modulus).result,
    });
  }

  return entries;
}

export function createElGamalTrace(): ElGamalTrace {
  const p = 23;
  const g = 5;
  const order = p - 1;
  const privateKey = 6;
  const ephemeralKey = 15;
  const message = 13;
  const reusedMessage = 7;
  const privateKeyPower = modPow(g, privateKey, p);
  const publicKey = privateKeyPower.result;
  const ephemeralPower = modPow(g, ephemeralKey, p);
  const c1 = ephemeralPower.result;
  const sharedSecretPower = modPow(publicKey, ephemeralKey, p);
  const sharedSecret = sharedSecretPower.result;
  const c2 = (message * sharedSecret) % p;
  const decryptSharedSecretPower = modPow(c1, privateKey, p);
  const decryptedSharedSecret = decryptSharedSecretPower.result;
  const sharedSecretInverse = modInverse(decryptedSharedSecret, p);
  const decryptedMessage = (c2 * sharedSecretInverse) % p;
  const reusedC2 = (reusedMessage * sharedSecret) % p;
  const recoveredSharedSecretFromKnownMessage = (c2 * modInverse(message, p)) % p;
  const recoveredReusedMessage =
    (reusedC2 * modInverse(recoveredSharedSecretFromKnownMessage, p)) % p;

  return {
    p,
    g,
    order,
    privateKey,
    publicKey,
    ephemeralKey,
    message,
    c1,
    sharedSecret,
    c2,
    decryptedSharedSecret,
    sharedSecretInverse,
    decryptedMessage,
    reusedMessage,
    reusedC2,
    recoveredSharedSecretFromKnownMessage,
    recoveredReusedMessage,
    publicParameters: `(p=${p}, g=${g})`,
    publicKeyLabel: `y=${publicKey}`,
    privateKeyLabel: `x=${privateKey}`,
    ciphertextLabel: `(c1=${c1}, c2=${c2})`,
    powerCycle: powerCycle(g, p),
    keyGenerationSteps: [
      {
        id: "choose-group",
        label: "Choose public group",
        formula: `p=${p},\\quad g=${g}`,
        value: `The multiplicative group has order ${order}.`,
        explanation:
          "This classroom group is intentionally tiny. Real ElGamal uses a large group where discrete logarithms are hard.",
      },
      {
        id: "choose-private",
        label: "Choose private exponent",
        formula: `x=${privateKey}`,
        value: "x remains secret",
        explanation:
          "The private key is an exponent. Security depends on attackers being unable to recover it from the public value.",
      },
      {
        id: "derive-public",
        label: "Derive public key",
        formula: "y=g^x\\bmod p",
        value: `y=${g}^{${privateKey}}\\bmod ${p}=${publicKey}`,
        explanation:
          "The public key is easy to compute from x, but reversing y back to x is the discrete logarithm problem.",
      },
    ],
    encryptionSteps: [
      {
        id: "choose-k",
        label: "Choose fresh ephemeral key",
        formula: `k=${ephemeralKey}`,
        value: "k must be new for this encryption",
        explanation:
          "ElGamal encryption is probabilistic. Reusing k repeats the same mask and can expose relationships between messages.",
      },
      {
        id: "compute-c1",
        label: "Compute first component",
        formula: "c_1=g^k\\bmod p",
        value: `c_1=${g}^{${ephemeralKey}}\\bmod ${p}=${c1}`,
        explanation:
          "The first component lets the receiver recompute the same shared secret using the private key.",
      },
      {
        id: "compute-shared",
        label: "Compute shared secret",
        formula: "s=y^k\\bmod p",
        value: `s=${publicKey}^{${ephemeralKey}}\\bmod ${p}=${sharedSecret}`,
        explanation:
          "The sender can compute this because the receiver's public key y is known.",
      },
      {
        id: "mask-message",
        label: "Mask the message",
        formula: "c_2=m\\cdot s\\bmod p",
        value: `c_2=${message}\\cdot ${sharedSecret}\\bmod ${p}=${c2}`,
        explanation:
          "The ciphertext contains both the ephemeral public value and the masked message component.",
      },
    ],
    decryptionSteps: [
      {
        id: "recompute-shared",
        label: "Recompute shared secret",
        formula: "s=c_1^x\\bmod p",
        value: `s=${c1}^{${privateKey}}\\bmod ${p}=${decryptedSharedSecret}`,
        explanation:
          "Only the private key holder can derive this shared secret from the first ciphertext component.",
      },
      {
        id: "invert-shared",
        label: "Invert the shared secret",
        formula: "s^{-1}\\bmod p",
        value: `${decryptedSharedSecret}^{-1}\\bmod ${p}=${sharedSecretInverse}`,
        explanation:
          "The inverse removes the multiplicative mask from the second ciphertext component.",
      },
      {
        id: "recover-message",
        label: "Recover message",
        formula: "m=c_2\\cdot s^{-1}\\bmod p",
        value: `m=${c2}\\cdot ${sharedSecretInverse}\\bmod ${p}=${decryptedMessage}`,
        explanation:
          "The recovered value matches the original message representative.",
      },
    ],
    privateKeyPowerSteps: privateKeyPower.steps,
    ephemeralPowerSteps: ephemeralPower.steps,
    sharedSecretPowerSteps: sharedSecretPower.steps,
    decryptSharedSecretPowerSteps: decryptSharedSecretPower.steps,
  };
}

export const elGamalTrace = createElGamalTrace();

export const elGamalTraceChecks = {
  publicParameters: elGamalTrace.publicParameters,
  publicKey: elGamalTrace.publicKey,
  ciphertext: elGamalTrace.ciphertextLabel,
  sharedSecret: elGamalTrace.sharedSecret,
  decryptedMessage: elGamalTrace.decryptedMessage,
  recoveredReusedMessage: elGamalTrace.recoveredReusedMessage,
  generatorCoversGroup:
    new Set(elGamalTrace.powerCycle.map((entry) => entry.value)).size === elGamalTrace.order,
};
