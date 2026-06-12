export type RsaKeyGenerationStep = {
  id: string;
  label: string;
  formula: string;
  value: string;
  explanation: string;
};

export type RsaEuclidStep = {
  step: number;
  quotient: number;
  remainderBefore: number;
  divisor: number;
  remainderAfter: number;
  coefficientForE: number;
  coefficientForPhi: number;
};

export type RsaModPowStep = {
  step: number;
  bit: string;
  beforeSquare: number;
  afterSquare: number;
  afterMultiply?: number;
  result: number;
  explanation: string;
};

export type RsaTrace = {
  p: number;
  q: number;
  n: number;
  phi: number;
  e: number;
  d: number;
  message: number;
  ciphertext: number;
  decrypted: number;
  publicKey: string;
  privateKey: string;
  exponentRelation: string;
  keyGenerationSteps: RsaKeyGenerationStep[];
  inverseSteps: RsaEuclidStep[];
  encryptionSteps: RsaModPowStep[];
  decryptionSteps: RsaModPowStep[];
};

function gcd(left: number, right: number) {
  let a = Math.abs(left);
  let b = Math.abs(right);

  while (b !== 0) {
    const next = a % b;
    a = b;
    b = next;
  }

  return a;
}

function extendedEuclidSteps(e: number, phi: number) {
  let oldR = e;
  let r = phi;
  let oldS = 1;
  let s = 0;
  let oldT = 0;
  let t = 1;
  const steps: RsaEuclidStep[] = [];

  while (r !== 0) {
    const quotient = Math.floor(oldR / r);
    const nextR = oldR - quotient * r;
    const nextS = oldS - quotient * s;
    const nextT = oldT - quotient * t;

    steps.push({
      step: steps.length + 1,
      quotient,
      remainderBefore: oldR,
      divisor: r,
      remainderAfter: nextR,
      coefficientForE: nextS,
      coefficientForPhi: nextT,
    });

    oldR = r;
    r = nextR;
    oldS = s;
    s = nextS;
    oldT = t;
    t = nextT;
  }

  if (oldR !== 1) {
    throw new Error("RSA public exponent is not invertible modulo phi(n).");
  }

  const displaySteps = steps
    .filter((step) => step.quotient !== 0 && step.remainderAfter !== 0)
    .map((step, index) => ({ ...step, step: index + 1 }));

  return {
    inverse: ((oldS % phi) + phi) % phi,
    steps: displaySteps,
  };
}

function modPow(base: number, exponent: number, modulus: number) {
  let result = 1;
  const normalizedBase = base % modulus;
  const bits = exponent.toString(2);
  const steps: RsaModPowStep[] = [];

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

export function createRsaTrace(p = 61, q = 53, e = 17, message = 65): RsaTrace {
  const n = p * q;
  const phi = (p - 1) * (q - 1);

  if (gcd(e, phi) !== 1) {
    throw new Error("RSA public exponent must be coprime to phi(n).");
  }

  if (message >= n) {
    throw new Error("RSA message must be smaller than the modulus n.");
  }

  const { inverse: d, steps: inverseSteps } = extendedEuclidSteps(e, phi);
  const encryption = modPow(message, e, n);
  const ciphertext = encryption.result;
  const decryption = modPow(ciphertext, d, n);
  const decrypted = decryption.result;

  return {
    p,
    q,
    n,
    phi,
    e,
    d,
    message,
    ciphertext,
    decrypted,
    publicKey: `(${n}, ${e})`,
    privateKey: `(${n}, ${d})`,
    exponentRelation: `${e}\\cdot ${d}\\bmod ${phi}=${(e * d) % phi}`,
    keyGenerationSteps: [
      {
        id: "choose-primes",
        label: "Choose two primes",
        formula: `p=${p},\\quad q=${q}`,
        value: "p and q stay private",
        explanation:
          "Real RSA uses large random primes. These small primes are only for classroom arithmetic.",
      },
      {
        id: "compute-modulus",
        label: "Compute the public modulus",
        formula: "n=pq",
        value: `n=${p}\\cdot ${q}=${n}`,
        explanation:
          "The modulus n is public, but factoring n should be infeasible when p and q are large.",
      },
      {
        id: "compute-totient",
        label: "Compute the totient",
        formula: "\\varphi(n)=(p-1)(q-1)",
        value: `\\varphi(n)=${p - 1}\\cdot ${q - 1}=${phi}`,
        explanation:
          "Knowing p and q makes the totient easy to compute. Without them, deriving it is tied to factoring n.",
      },
      {
        id: "choose-public-exponent",
        label: "Choose public exponent",
        formula: "\\gcd(e,\\varphi(n))=1",
        value: `\\gcd(${e},${phi})=1`,
        explanation:
          "The public exponent e must have a modular inverse modulo the totient.",
      },
      {
        id: "compute-private-exponent",
        label: "Compute private exponent",
        formula: "ed\\equiv1\\pmod{\\varphi(n)}",
        value: `d=${d}`,
        explanation:
          "The private exponent d is the modular inverse of e modulo the totient.",
      },
    ],
    inverseSteps,
    encryptionSteps: encryption.steps,
    decryptionSteps: decryption.steps,
  };
}

export const rsaTrace = createRsaTrace();

export const rsaTraceChecks = {
  publicKey: rsaTrace.publicKey,
  privateKey: rsaTrace.privateKey,
  ciphertext: rsaTrace.ciphertext,
  decrypted: rsaTrace.decrypted,
  exponentRelation: rsaTrace.exponentRelation,
  encryptionStepCount: rsaTrace.encryptionSteps.length,
  decryptionStepCount: rsaTrace.decryptionSteps.length,
};
