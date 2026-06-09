export type EcPoint = {
  x: number;
  y: number;
} | null;

export type EccCurvePoint = {
  x: number;
  y: number;
};

export type EccPointOperation = {
  id: string;
  label: string;
  type: "add" | "double";
  left: EcPoint;
  right: EcPoint;
  numerator: number;
  denominator: number;
  denominatorInverse: number;
  slope: number;
  result: EcPoint;
  formula: string;
  explanation: string;
};

export type EccScalarStep = {
  step: number;
  bit: string;
  beforeDouble: EcPoint;
  afterDouble: EcPoint;
  afterAdd?: EcPoint;
  result: EcPoint;
  explanation: string;
};

export type EccKeyStep = {
  id: string;
  label: string;
  formula: string;
  value: string;
  explanation: string;
};

export type EccMultipleEntry = {
  scalar: number;
  point: EcPoint;
};

export type EccTrace = {
  p: number;
  a: number;
  b: number;
  equation: string;
  basePoint: EccCurvePoint;
  basePointOrder: number;
  curvePoints: EccCurvePoint[];
  multiples: EccMultipleEntry[];
  doubleExample: EccPointOperation;
  addExample: EccPointOperation;
  alicePrivate: number;
  alicePublic: EcPoint;
  bobPrivate: number;
  bobPublic: EcPoint;
  sharedFromAlice: EcPoint;
  sharedFromBob: EcPoint;
  sharedMask: number;
  message: number;
  ciphertext: number;
  decryptedMessage: number;
  aliceScalarSteps: EccScalarStep[];
  bobScalarSteps: EccScalarStep[];
  sharedFromAliceSteps: EccScalarStep[];
  sharedFromBobSteps: EccScalarStep[];
  keyGenerationSteps: EccKeyStep[];
  ecdhSteps: EccKeyStep[];
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
  const [gcd, x] = extendedGcd(mod(value, modulus), modulus);

  if (gcd !== 1) {
    throw new Error(`No modular inverse for ${value} mod ${modulus}`);
  }

  return mod(x, modulus);
}

function samePoint(left: EcPoint, right: EcPoint) {
  if (left === null || right === null) {
    return left === right;
  }

  return left.x === right.x && left.y === right.y;
}

export function formatPoint(point: EcPoint) {
  return point ? `(${point.x}, ${point.y})` : "O";
}

function pointAddDetailed(
  left: EcPoint,
  right: EcPoint,
  label: string,
  id: string,
  p: number,
  a: number,
): EccPointOperation {
  if (left === null || right === null) {
    return {
      id,
      label,
      type: "add",
      left,
      right,
      numerator: 0,
      denominator: 1,
      denominatorInverse: 1,
      slope: 0,
      result: left ?? right,
      formula: "O acts as the identity point",
      explanation:
        "Adding the point at infinity returns the other point, just like adding zero in ordinary arithmetic.",
    };
  }

  if (left.x === right.x && mod(left.y + right.y, p) === 0) {
    return {
      id,
      label,
      type: "add",
      left,
      right,
      numerator: 0,
      denominator: 0,
      denominatorInverse: 0,
      slope: 0,
      result: null,
      formula: "P + (-P) = O",
      explanation:
        "A point and its vertical reflection add to the point at infinity.",
    };
  }

  const doubling = samePoint(left, right);
  const numerator = doubling
    ? mod(3 * left.x * left.x + a, p)
    : mod(right.y - left.y, p);
  const denominator = doubling ? mod(2 * left.y, p) : mod(right.x - left.x, p);
  const denominatorInverse = modInverse(denominator, p);
  const slope = mod(numerator * denominatorInverse, p);
  const x = mod(slope * slope - left.x - right.x, p);
  const y = mod(slope * (left.x - x) - left.y, p);

  return {
    id,
    label,
    type: doubling ? "double" : "add",
    left,
    right,
    numerator,
    denominator,
    denominatorInverse,
    slope,
    result: { x, y },
    formula: doubling
      ? "\\lambda=(3x_1^2+a)(2y_1)^{-1}\\bmod p"
      : "\\lambda=(y_2-y_1)(x_2-x_1)^{-1}\\bmod p",
    explanation: doubling
      ? "Point doubling uses the tangent slope, reduced modulo p."
      : "Point addition uses the line slope between two different curve points, reduced modulo p.",
  };
}

function pointAdd(left: EcPoint, right: EcPoint, p: number, a: number) {
  return pointAddDetailed(left, right, "point operation", "point-operation", p, a)
    .result;
}

function scalarMultiply(scalar: number, basePoint: EcPoint, p: number, a: number) {
  let result: EcPoint = null;
  const bits = scalar.toString(2);
  const steps: EccScalarStep[] = [];

  for (const bit of bits) {
    const beforeDouble = result;
    const afterDouble = pointAdd(result, result, p, a);
    result = afterDouble;
    let afterAdd: EcPoint | undefined;

    if (bit === "1") {
      afterAdd = pointAdd(result, basePoint, p, a);
      result = afterAdd;
    }

    steps.push({
      step: steps.length + 1,
      bit,
      beforeDouble,
      afterDouble,
      afterAdd,
      result,
      explanation:
        bit === "1"
          ? "Double the running point, then add the base point because this scalar bit is 1."
          : "Double the running point and skip the base-point addition because this scalar bit is 0.",
    });
  }

  return {
    result,
    bits,
    steps,
  };
}

function enumerateCurvePoints(p: number, a: number, b: number) {
  const points: EccCurvePoint[] = [];

  for (let x = 0; x < p; x += 1) {
    for (let y = 0; y < p; y += 1) {
      if (mod(y * y, p) === mod(x * x * x + a * x + b, p)) {
        points.push({ x, y });
      }
    }
  }

  return points;
}

export function createEccTrace(): EccTrace {
  const p = 17;
  const a = 2;
  const b = 2;
  const basePoint = { x: 5, y: 1 };
  const basePointOrder = 19;
  const curvePoints = enumerateCurvePoints(p, a, b);
  const multiples = Array.from({ length: basePointOrder }, (_, index) => ({
    scalar: index + 1,
    point: scalarMultiply(index + 1, basePoint, p, a).result,
  }));
  const doubleExample = pointAddDetailed(
    basePoint,
    basePoint,
    "Double G",
    "double-g",
    p,
    a,
  );
  const addExample = pointAddDetailed(
    doubleExample.result,
    basePoint,
    "Add 2G + G",
    "add-2g-g",
    p,
    a,
  );
  const alicePrivate = 7;
  const bobPrivate = 9;
  const aliceScalar = scalarMultiply(alicePrivate, basePoint, p, a);
  const bobScalar = scalarMultiply(bobPrivate, basePoint, p, a);
  const sharedFromAlice = scalarMultiply(alicePrivate, bobScalar.result, p, a);
  const sharedFromBob = scalarMultiply(bobPrivate, aliceScalar.result, p, a);
  const sharedSecret = sharedFromAlice.result;
  const sharedMask = sharedSecret?.x ?? 0;
  const message = 12;
  const ciphertext = mod(message + sharedMask, p);
  const decryptedMessage = mod(ciphertext - sharedMask, p);

  return {
    p,
    a,
    b,
    equation: `y^2 = x^3 + ${a}x + ${b} mod ${p}`,
    basePoint,
    basePointOrder,
    curvePoints,
    multiples,
    doubleExample,
    addExample,
    alicePrivate,
    alicePublic: aliceScalar.result,
    bobPrivate,
    bobPublic: bobScalar.result,
    sharedFromAlice: sharedFromAlice.result,
    sharedFromBob: sharedFromBob.result,
    sharedMask,
    message,
    ciphertext,
    decryptedMessage,
    aliceScalarSteps: aliceScalar.steps,
    bobScalarSteps: bobScalar.steps,
    sharedFromAliceSteps: sharedFromAlice.steps,
    sharedFromBobSteps: sharedFromBob.steps,
    keyGenerationSteps: [
      {
        id: "domain-parameters",
        label: "Choose domain parameters",
        formula: `E:y^2=x^3+${a}x+${b}\\pmod{${p}},\\quad G=${formatPoint(basePoint)}`,
        value: `G has order ${basePointOrder}`,
        explanation:
          "Real ECC uses standardized curves and base points. This tiny curve is only for classroom arithmetic.",
      },
      {
        id: "private-scalar",
        label: "Choose private scalar",
        formula: `d_A=${alicePrivate}`,
        value: "Alice keeps this scalar private",
        explanation:
          "The private key is an integer scalar. It must be generated randomly and kept secret.",
      },
      {
        id: "public-point",
        label: "Derive public point",
        formula: "Q_A=d_A\\cdot G",
        value: `Q_A=${alicePrivate}G=${formatPoint(aliceScalar.result)}`,
        explanation:
          "The public key is a curve point. Reversing the public point back to the private scalar is the elliptic curve discrete logarithm problem.",
      },
    ],
    ecdhSteps: [
      {
        id: "alice-public",
        label: "Alice public key",
        formula: `Q_A=${alicePrivate}G`,
        value: `Q_A=${formatPoint(aliceScalar.result)}`,
        explanation:
          "Alice publishes her public point and keeps her private scalar secret.",
      },
      {
        id: "bob-public",
        label: "Bob public key",
        formula: `Q_B=${bobPrivate}G`,
        value: `Q_B=${formatPoint(bobScalar.result)}`,
        explanation:
          "Bob publishes his public point and keeps his private scalar secret.",
      },
      {
        id: "alice-shared",
        label: "Alice computes shared point",
        formula: "S=d_A\\cdot Q_B",
        value: `S=${formatPoint(sharedFromAlice.result)}`,
        explanation:
          "Alice combines her private scalar with Bob's public point.",
      },
      {
        id: "bob-shared",
        label: "Bob computes shared point",
        formula: "S=d_B\\cdot Q_A",
        value: `S=${formatPoint(sharedFromBob.result)}`,
        explanation:
          "Bob reaches the same point because both paths multiply the same base point by both private scalars.",
      },
    ],
  };
}

export const eccTrace = createEccTrace();

export const eccTraceChecks = {
  equation: eccTrace.equation,
  pointCountWithInfinity: eccTrace.curvePoints.length + 1,
  basePointOrder: eccTrace.basePointOrder,
  alicePublic: formatPoint(eccTrace.alicePublic),
  bobPublic: formatPoint(eccTrace.bobPublic),
  sharedFromAlice: formatPoint(eccTrace.sharedFromAlice),
  sharedFromBob: formatPoint(eccTrace.sharedFromBob),
  ciphertext: eccTrace.ciphertext,
  decryptedMessage: eccTrace.decryptedMessage,
  sharedAgreement:
    formatPoint(eccTrace.sharedFromAlice) === formatPoint(eccTrace.sharedFromBob),
};
