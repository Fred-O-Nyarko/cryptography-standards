import {
  createDesOperationTrace,
  desDecryptBlock,
  desEncryptBlock,
  type DesOperationMode,
  type DesOperationTrace,
} from "./des";
import { hexBlockToText } from "./trace-inputs";

export type TdesStage = {
  id: string;
  label: string;
  operation: DesOperationMode;
  keyLabel: "K1" | "K2" | "K3";
  keyHex: string;
  inputHex: string;
  outputHex: string;
  trace: DesOperationTrace;
  description: string;
};

export type TdesTrace = {
  plaintextHex: string;
  plaintextLabel: string;
  keys: Array<{
    label: "K1" | "K2" | "K3";
    hex: string;
    role: string;
  }>;
  stages: TdesStage[];
  decryptionStages: TdesStage[];
  ciphertextHex: string;
  decryptedPlaintextHex: string;
  compatibilityDemo: {
    plaintextHex: string;
    keyHex: string;
    desCiphertextHex: string;
    tdesWithEqualKeysHex: string;
  };
};

function createStage({
  id,
  label,
  operation,
  keyLabel,
  keyHex,
  inputHex,
  description,
}: Omit<TdesStage, "outputHex" | "trace">): TdesStage {
  const trace = createDesOperationTrace(inputHex, keyHex, operation);

  return {
    id,
    label,
    operation,
    keyLabel,
    keyHex,
    inputHex,
    outputHex: trace.outputHex,
    trace,
    description,
  };
}

export function createTdesTrace(
  plaintextHex = "4E6F772069732074",
  key1 = "0123456789ABCDEF",
  key2 = "23456789ABCDEF01",
  key3 = "456789ABCDEF0123",
): TdesTrace {
  const plaintextText = hexBlockToText(plaintextHex);

  const stage1 = createStage({
    id: "encrypt-k1",
    label: "Stage 1: DES encrypt",
    operation: "encrypt",
    keyLabel: "K1",
    keyHex: key1,
    inputHex: plaintextHex,
    description:
      "First run the 64-bit plaintext block through the DES encryption path with K1.",
  });
  const stage2 = createStage({
    id: "decrypt-k2",
    label: "Stage 2: DES decrypt",
    operation: "decrypt",
    keyLabel: "K2",
    keyHex: key2,
    inputHex: stage1.outputHex,
    description:
      "Then run the intermediate block through DES decryption with K2. This is the middle D in EDE.",
  });
  const stage3 = createStage({
    id: "encrypt-k3",
    label: "Stage 3: DES encrypt",
    operation: "encrypt",
    keyLabel: "K3",
    keyHex: key3,
    inputHex: stage2.outputHex,
    description:
      "Finally run the second intermediate block through DES encryption with K3 to produce the 3DES ciphertext.",
  });

  const decryptionStage1 = createStage({
    id: "decrypt-k3",
    label: "Reverse stage 1: DES decrypt",
    operation: "decrypt",
    keyLabel: "K3",
    keyHex: key3,
    inputHex: stage3.outputHex,
    description:
      "Decryption starts by undoing the final encryption stage with K3.",
  });
  const decryptionStage2 = createStage({
    id: "encrypt-k2",
    label: "Reverse stage 2: DES encrypt",
    operation: "encrypt",
    keyLabel: "K2",
    keyHex: key2,
    inputHex: decryptionStage1.outputHex,
    description:
      "The middle reverse operation is DES encryption with K2, undoing the EDE middle decryption.",
  });
  const decryptionStage3 = createStage({
    id: "decrypt-k1",
    label: "Reverse stage 3: DES decrypt",
    operation: "decrypt",
    keyLabel: "K1",
    keyHex: key1,
    inputHex: decryptionStage2.outputHex,
    description:
      "The last reverse operation decrypts with K1 and recovers the original plaintext block.",
  });
  const compatibilityPlaintextHex = "0123456789ABCDEF";
  const compatibilityKeyHex = "133457799BBCDFF1";
  const desCiphertextHex = desEncryptBlock(compatibilityPlaintextHex, compatibilityKeyHex);
  const tdesWithEqualKeysHex = desEncryptBlock(
    desDecryptBlock(desEncryptBlock(compatibilityPlaintextHex, compatibilityKeyHex), compatibilityKeyHex),
    compatibilityKeyHex,
  );

  return {
    plaintextHex,
    plaintextLabel:
      plaintextText !== null
        ? `"${plaintextText}" encoded as 8 ASCII bytes`
        : "8-byte (64-bit) input block",
    keys: [
      {
        label: "K1",
        hex: key1,
        role: "First DES encryption key",
      },
      {
        label: "K2",
        hex: key2,
        role: "Middle DES decryption key",
      },
      {
        label: "K3",
        hex: key3,
        role: "Final DES encryption key",
      },
    ],
    stages: [stage1, stage2, stage3],
    decryptionStages: [decryptionStage1, decryptionStage2, decryptionStage3],
    ciphertextHex: stage3.outputHex,
    decryptedPlaintextHex: decryptionStage3.outputHex,
    compatibilityDemo: {
      plaintextHex: compatibilityPlaintextHex,
      keyHex: compatibilityKeyHex,
      desCiphertextHex,
      tdesWithEqualKeysHex,
    },
  };
}

export const tdesTrace = createTdesTrace();

export const tdesTraceChecks = {
  plaintextHex: tdesTrace.plaintextHex,
  ciphertextHex: tdesTrace.ciphertextHex,
  decryptedPlaintextHex: tdesTrace.decryptedPlaintextHex,
  edeCompatibilityHolds:
    tdesTrace.compatibilityDemo.desCiphertextHex ===
    tdesTrace.compatibilityDemo.tdesWithEqualKeysHex,
};
