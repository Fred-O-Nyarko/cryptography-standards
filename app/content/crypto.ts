export type AlgorithmId = "des" | "3des" | "aes" | "rsa" | "elgamal" | "ecc";

export type AlgorithmFamily = "symmetric" | "asymmetric";

export type LessonStatus = "foundation-ready" | "interactive-ready" | "planned";

export type LessonSectionType =
  | "concept"
  | "math"
  | "key-generation"
  | "encryption-flow"
  | "decryption-flow"
  | "demo"
  | "checkpoint";

export type Reference = {
  id: string;
  title: string;
  publisher: string;
  year: string;
  url: string;
  relatedAlgorithms: AlgorithmId[];
  note: string;
};

export type GlossaryTerm = {
  term: string;
  definition: string;
};

export type LessonSection = {
  id: string;
  type: LessonSectionType;
  title: string;
  summary: string;
  body: string;
  formula?: string;
  references?: string[];
};

export type VisualizerStep = {
  id: string;
  label: string;
  description: string;
  inputLabel: string;
  outputLabel: string;
  bitPattern: string;
  activeBitIndexes: number[];
};

export type VisualizerConfig = {
  title: string;
  caption: string;
  steps: VisualizerStep[];
};

export type LessonModule = {
  id: AlgorithmId;
  title: string;
  shortTitle: string;
  family: AlgorithmFamily;
  status: LessonStatus;
  difficulty: string;
  tagline: string;
  summary: string;
  objectives: string[];
  prerequisites: string[];
  keyQuestions: string[];
  sections: LessonSection[];
  glossary: GlossaryTerm[];
  visualizer: VisualizerConfig;
  references: string[];
};

export const algorithmOrder: AlgorithmId[] = [
  "des",
  "3des",
  "aes",
  "rsa",
  "elgamal",
  "ecc",
];

export const referenceLibrary: Reference[] = [
  {
    id: "nist-fips-46-3",
    title: "FIPS 46-3: Data Encryption Standard",
    publisher: "NIST CSRC",
    year: "1999, withdrawn 2005",
    url: "https://csrc.nist.gov/pubs/fips/46-3/final",
    relatedAlgorithms: ["des", "3des"],
    note: "Primary DES/TDEA standard. The app should teach it historically and explicitly note that DES was withdrawn on May 19, 2005.",
  },
  {
    id: "nist-fips-197",
    title: "FIPS 197: Advanced Encryption Standard",
    publisher: "NIST CSRC",
    year: "2001, updated 2023",
    url: "https://csrc.nist.gov/pubs/fips/197/final",
    relatedAlgorithms: ["aes"],
    note: "Primary AES standard. The 2023 update made editorial improvements and no technical change to the AES algorithm.",
  },
  {
    id: "nist-sp-800-67-withdrawal",
    title: "NIST SP 800-67 Rev. 2 Withdrawal Notice",
    publisher: "NIST",
    year: "2023",
    url: "https://www.nist.gov/news-events/news/2023/06/nist-withdraw-special-publication-800-67-revision-2",
    relatedAlgorithms: ["3des"],
    note: "Explains that the TDEA/3DES recommendation was withdrawn January 1, 2024, disallowing new cryptographic protection use.",
  },
  {
    id: "rfc-8017",
    title: "RFC 8017: PKCS #1 v2.2",
    publisher: "RFC Editor",
    year: "2016",
    url: "https://www.rfc-editor.org/rfc/rfc8017.html",
    relatedAlgorithms: ["rsa"],
    note: "Authoritative RSA specification for key representation, encryption schemes, and signature schemes.",
  },
  {
    id: "elgamal-1985",
    title: "A Public Key Cryptosystem and a Signature Scheme Based on Discrete Logarithms",
    publisher: "IEEE Transactions on Information Theory",
    year: "1985",
    url: "https://doi.org/10.1109/TIT.1985.1057074",
    relatedAlgorithms: ["elgamal"],
    note: "Original ElGamal paper introducing the discrete logarithm public-key cryptosystem and signature scheme.",
  },
  {
    id: "nist-fips-186-5",
    title: "FIPS 186-5: Digital Signature Standard",
    publisher: "NIST CSRC",
    year: "2023",
    url: "https://csrc.nist.gov/pubs/fips/186-5/final",
    relatedAlgorithms: ["ecc"],
    note: "Modern NIST signature standard that includes ECDSA and supports the ECC module's signature context.",
  },
  {
    id: "nist-sp-800-186",
    title: "SP 800-186: Elliptic Curve Domain Parameters",
    publisher: "NIST",
    year: "2023",
    url: "https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-186.pdf",
    relatedAlgorithms: ["ecc"],
    note: "NIST guidance for elliptic curve domain parameters used in discrete logarithm-based cryptography.",
  },
  {
    id: "sec-1-v2",
    title: "SEC 1 v2.0: Elliptic Curve Cryptography",
    publisher: "Standards for Efficient Cryptography Group",
    year: "2009",
    url: "https://www.secg.org/sec1-v2.pdf",
    relatedAlgorithms: ["ecc"],
    note: "Specifies ECC public-key schemes, primitives, and key agreement/encryption/signature contexts.",
  },
];

const toyVisualizer: VisualizerConfig = {
  title: "Toy block transformation",
  caption:
    "A non-algorithm demo that proves the lesson controls. It deliberately avoids representing DES, AES, RSA, ElGamal, or ECC internals.",
  steps: [
    {
      id: "plaintext",
      label: "Plaintext block",
      description:
        "Start with a fixed-size block. Future symmetric lessons will replace this toy block with real algorithm-specific state.",
      inputLabel: "Plaintext",
      outputLabel: "Block ready",
      bitPattern: "0100110001100001",
      activeBitIndexes: [0, 1, 4, 7],
    },
    {
      id: "key-mix",
      label: "Key influence",
      description:
        "Show that a secret or private value changes the transformation. This is a visual placeholder, not a real cipher operation.",
      inputLabel: "Block + key idea",
      outputLabel: "Mixed state",
      bitPattern: "1100101001010110",
      activeBitIndexes: [0, 2, 5, 8, 13],
    },
    {
      id: "rounds",
      label: "Repeated structure",
      description:
        "Many algorithms repeat a round-like process. Later phases will teach the exact round function for each algorithm.",
      inputLabel: "Mixed state",
      outputLabel: "Round output",
      bitPattern: "1011010110010010",
      activeBitIndexes: [1, 3, 6, 9, 12, 15],
    },
    {
      id: "ciphertext",
      label: "Ciphertext block",
      description:
        "The output looks unrelated to the input. Future demos will explain the precise reversibility and security assumptions.",
      inputLabel: "Final state",
      outputLabel: "Ciphertext",
      bitPattern: "0011101011001001",
      activeBitIndexes: [2, 3, 4, 10, 11, 14],
    },
  ],
};

const commonGlossary: GlossaryTerm[] = [
  {
    term: "Plaintext",
    definition: "The original readable message before cryptographic transformation.",
  },
  {
    term: "Ciphertext",
    definition: "The transformed message that should be unreadable without the required key material.",
  },
  {
    term: "Key space",
    definition: "The set of possible keys an attacker may need to search through.",
  },
  {
    term: "Security assumption",
    definition:
      "The hard problem or design property believed to make an attack computationally infeasible.",
  },
];

function symmetricSections(referenceIds: string[]): LessonSection[] {
  return [
    {
      id: "concept",
      type: "concept",
      title: "Block cipher mental model",
      summary: "Map messages into fixed-size blocks, then transform each block under a shared secret key.",
      body:
        "This foundation section prepares the visual language for symmetric algorithms: state blocks, key material, repeated transformations, and reversible decryption. Algorithm-specific rounds are intentionally deferred.",
      references: referenceIds,
    },
    {
      id: "math",
      type: "math",
      title: "Functions, permutations, and key-indexed maps",
      summary: "A cipher can be viewed as a family of keyed transformations.",
      body:
        "For a block cipher, a key selects one transformation from a large family. Later modules will connect this idea to Feistel networks, substitution-permutation networks, and practical modes of operation.",
      formula: "E_K(P)=C \\quad\\text{and}\\quad D_K(C)=P",
      references: referenceIds,
    },
    {
      id: "key-generation",
      type: "key-generation",
      title: "Shared-key lifecycle",
      summary: "Symmetric systems depend on safe generation, distribution, storage, rotation, and retirement of one shared secret.",
      body:
        "The foundation app separates algorithm mechanics from operational key management, because a correct cipher can still fail when keys are reused, disclosed, or generated poorly.",
    },
    {
      id: "demo",
      type: "demo",
      title: "Foundation visualizer",
      summary: "Use the toy block animation to rehearse the controls before real algorithm demos are built.",
      body:
        "This demo exists only to validate the interface pattern. Later phases will replace it with DES, 3DES, and AES-specific walkthroughs.",
    },
    {
      id: "checkpoint",
      type: "checkpoint",
      title: "Checkpoint",
      summary: "Confirm the learner can separate reusable cryptographic ideas from algorithm-specific steps.",
      body:
        "A strong explanation should distinguish the data path, key path, mathematical model, and security status of the algorithm.",
    },
  ];
}

function asymmetricSections(referenceIds: string[]): LessonSection[] {
  return [
    {
      id: "concept",
      type: "concept",
      title: "Public/private key mental model",
      summary: "One key is public; the linked private key remains secret.",
      body:
        "This foundation section establishes the shared teaching language for asymmetric cryptography: key pairs, trapdoor functions, public parameters, and hard mathematical problems.",
      references: referenceIds,
    },
    {
      id: "math",
      type: "math",
      title: "One-way functions with trapdoors",
      summary: "Asymmetric systems rely on operations that are easy in one direction and hard to reverse without secret information.",
      body:
        "Later phases will make this concrete with integer factorization for RSA, discrete logarithms for ElGamal, and elliptic curve discrete logarithms for ECC.",
      formula: "y=f(x)\\text{ is easy, but }x=f^{-1}(y)\\text{ is hard without a trapdoor}",
      references: referenceIds,
    },
    {
      id: "key-generation",
      type: "key-generation",
      title: "Key pair lifecycle",
      summary: "Generate public parameters and private secrets carefully, then derive or publish only the public key.",
      body:
        "Phase 1 only shows the lifecycle shape. RSA, ElGamal, and ECC phases will later define exact parameter choices, equations, and validation checks.",
    },
    {
      id: "encryption-flow",
      type: "encryption-flow",
      title: "Encryption or agreement flow",
      summary: "Public-key systems either encrypt small values directly or help establish symmetric session keys.",
      body:
        "The app will use this section type to compare textbook learning examples with modern safe usage patterns.",
    },
    {
      id: "checkpoint",
      type: "checkpoint",
      title: "Checkpoint",
      summary: "Confirm the learner can name the hard problem and the private value for the algorithm.",
      body:
        "The class should leave each asymmetric module knowing what is public, what is private, what is computed, and what is assumed hard.",
    },
  ];
}

const desSections: LessonSection[] = [
  {
    id: "concept",
    type: "concept",
    title: "Feistel block cipher structure",
    summary:
      "DES encrypts one 64-bit block through an initial permutation, 16 Feistel rounds, a swap, and a final permutation.",
    body:
      "DES is useful pedagogically because every stage is visible: the 64-bit plaintext is permuted, split into L0 and R0, processed through 16 rounds, swapped, and permuted again to form ciphertext. Its security is historical rather than modern because the 56-bit effective key is too small.",
    references: ["nist-fips-46-3"],
  },
  {
    id: "math",
    type: "math",
    title: "The DES Feistel recurrence",
    summary:
      "Each round moves the right half left and XORs the old left half with a keyed round function.",
    body:
      "The Feistel recurrence is the core reason DES can decrypt by running the same round structure with subkeys in reverse order. The round function expands R, mixes in a 48-bit subkey, compresses through S-boxes, then permutes the result.",
    formula:
      "L_i=R_{i-1}\\quad R_i=L_{i-1}\\oplus P(S(E(R_{i-1})\\oplus K_i))",
    references: ["nist-fips-46-3"],
  },
  {
    id: "key-generation",
    type: "key-generation",
    title: "DES key schedule",
    summary:
      "A 64-bit input key carries 8 parity bits; PC-1 removes them, rotations update C and D, and PC-2 selects each 48-bit round key.",
    body:
      "DES starts with a 64-bit key representation but uses 56 effective key bits. The key schedule applies PC-1, splits the result into C0 and D0, rotates both halves according to the round shift schedule, and applies PC-2 to create K1 through K16.",
    references: ["nist-fips-46-3"],
  },
  {
    id: "encryption-flow",
    type: "encryption-flow",
    title: "DES encryption flow",
    summary:
      "Each round expands R from 32 to 48 bits, XORs a subkey, applies S-boxes, permutes, then XORs with L.",
    body:
      "The walkthrough below uses a known test vector so students can verify that the process is real. The animation exposes the round data path and the table shows all intermediate L/R values and subkeys.",
    references: ["nist-fips-46-3"],
  },
  {
    id: "decryption-flow",
    type: "decryption-flow",
    title: "DES decryption flow",
    summary:
      "DES decryption uses the same Feistel machinery with subkeys applied in reverse order.",
    body:
      "Because Feistel rounds preserve reversibility, DES does not need an inverse S-box or inverse round function for decryption. The subkeys K16 through K1 are applied through the same structure to recover the plaintext.",
    references: ["nist-fips-46-3"],
  },
  {
    id: "demo",
    type: "demo",
    title: "Full DES trace",
    summary:
      "Interactively inspect the initial permutation, key schedule, all 16 Feistel rounds, and final ciphertext.",
    body:
      "Use the controls to step round by round. This module demonstrates DES itself, unlike the Phase 1 toy visualizer used by the remaining unfinished algorithm shells.",
    references: ["nist-fips-46-3"],
  },
  {
    id: "checkpoint",
    type: "checkpoint",
    title: "Checkpoint",
    summary:
      "Confirm that students can explain the DES data path, the key schedule, and why DES is retired.",
    body:
      "A complete DES explanation should name the block size, effective key length, Feistel recurrence, 16-round schedule, S-box compression, reverse-key decryption, and historical security limitation.",
  },
];

const tdesSections: LessonSection[] = [
  {
    id: "concept",
    type: "concept",
    title: "Triple DES as repeated DES",
    summary:
      "3DES applies DES three times to one 64-bit block, usually in encrypt-decrypt-encrypt order.",
    body:
      "Triple DES, also called TDEA, was created as a compatibility bridge: keep the DES block and round machinery, but apply it with multiple keys to make brute-force attacks much harder than single DES. It is a legacy construction, not a modern recommendation.",
    references: ["nist-fips-46-3", "nist-sp-800-67-withdrawal"],
  },
  {
    id: "math",
    type: "math",
    title: "EDE composition",
    summary:
      "3-key TDEA encryption is DES encryption with K1, DES decryption with K2, then DES encryption with K3.",
    body:
      "The middle decryption step looks unusual, but it creates backward compatibility: if K1, K2, and K3 are all the same DES key, EDE collapses to single DES. With independent keys, the same shape becomes a stronger legacy construction.",
    formula: "C=E_{K_3}(D_{K_2}(E_{K_1}(P)))",
    references: ["nist-fips-46-3"],
  },
  {
    id: "key-generation",
    type: "key-generation",
    title: "3DES key bundle and keying options",
    summary:
      "A 3DES key bundle contains DES keys K1, K2, and K3; older deployments sometimes used K1 = K3.",
    body:
      "Keying option 1 uses three independent DES keys. Keying option 2 sets K1 and K3 equal. Keying option 3 sets all keys equal, which is only single DES compatibility and should not be treated as 3DES security.",
    references: ["nist-fips-46-3"],
  },
  {
    id: "encryption-flow",
    type: "encryption-flow",
    title: "3DES encryption flow",
    summary:
      "Encrypt with K1, decrypt with K2, then encrypt with K3. Each stage is a full 16-round DES operation.",
    body:
      "The interactive trace below uses a real 3-key EDE computation. Students can step through each DES stage and see the intermediate blocks that connect the three operations.",
    references: ["nist-fips-46-3"],
  },
  {
    id: "decryption-flow",
    type: "decryption-flow",
    title: "3DES decryption flow",
    summary:
      "Reverse the EDE path: decrypt with K3, encrypt with K2, then decrypt with K1.",
    body:
      "The reverse path is not simply the same labels backward; the DES operation type flips at each stage so that every transformation is undone in the correct order.",
    references: ["nist-fips-46-3"],
  },
  {
    id: "demo",
    type: "demo",
    title: "Full 3DES EDE trace",
    summary:
      "Inspect plaintext, three DES keys, the two intermediate values, the ciphertext, and the reverse decryption path.",
    body:
      "This module demonstrates the composition that made 3DES valuable historically while also explaining why standards retired it for new cryptographic protection.",
    references: ["nist-fips-46-3", "nist-sp-800-67-withdrawal"],
  },
  {
    id: "checkpoint",
    type: "checkpoint",
    title: "Checkpoint",
    summary:
      "Confirm that students can explain EDE, compatibility, keying options, and retirement status.",
    body:
      "A complete 3DES explanation should name the three-stage EDE path, the reverse decryption path, the single-DES compatibility trick, the difference between keying options, and the modern withdrawal status.",
  },
];

const aesSections: LessonSection[] = [
  {
    id: "concept",
    type: "concept",
    title: "AES as a substitution-permutation network",
    summary:
      "AES transforms a 128-bit block arranged as a 4 by 4 byte state matrix through repeated round operations.",
    body:
      "AES replaced DES-era designs with a modern substitution-permutation network. A plaintext block is arranged into a state matrix, combined with a round key, transformed by byte substitution and row shifting, mixed by column arithmetic, and combined with another round key.",
    references: ["nist-fips-197"],
  },
  {
    id: "math",
    type: "math",
    title: "AES round equation",
    summary:
      "Rounds 1 through 9 use SubBytes, ShiftRows, MixColumns, and AddRoundKey; round 10 omits MixColumns.",
    body:
      "AES uses byte-level finite-field arithmetic. SubBytes provides non-linearity, ShiftRows moves bytes across columns, MixColumns combines bytes inside each column, and AddRoundKey injects expanded key material.",
    formula:
      "S_i=\\operatorname{ARK}_{K_i}(\\operatorname{MC}(\\operatorname{SR}(\\operatorname{SB}(S_{i-1}))))",
    references: ["nist-fips-197"],
  },
  {
    id: "key-generation",
    type: "key-generation",
    title: "AES-128 key expansion",
    summary:
      "A 128-bit key expands into 11 round keys: one for the initial AddRoundKey and one for each of 10 rounds.",
    body:
      "AES-128 starts from four 32-bit key words. The key schedule repeatedly applies RotWord, SubWord, Rcon, and XOR to create 44 words, grouped into 11 round keys.",
    references: ["nist-fips-197"],
  },
  {
    id: "encryption-flow",
    type: "encryption-flow",
    title: "AES encryption flow",
    summary:
      "The interactive trace follows a known AES-128 block through all 10 rounds and verifies the standard ciphertext.",
    body:
      "Students can scrub through each round and inspect how the matrix changes after SubBytes, ShiftRows, MixColumns, and AddRoundKey.",
    references: ["nist-fips-197"],
  },
  {
    id: "decryption-flow",
    type: "decryption-flow",
    title: "AES decryption flow",
    summary:
      "AES decryption applies inverse transformations with round keys in reverse order.",
    body:
      "This phase focuses on encryption, but it names the inverse path: InvShiftRows, InvSubBytes, AddRoundKey, and InvMixColumns are applied in the corresponding reverse structure.",
    references: ["nist-fips-197"],
  },
  {
    id: "demo",
    type: "demo",
    title: "Full AES-128 trace",
    summary:
      "Inspect the initial state, 11 round keys, and every round transformation for one AES-128 test vector.",
    body:
      "The AES module uses the FIPS 197 sample plaintext and key, producing the known ciphertext 69C4E0D86A7B0430D8CDB78070B4C55A.",
    references: ["nist-fips-197"],
  },
  {
    id: "checkpoint",
    type: "checkpoint",
    title: "Checkpoint",
    summary:
      "Confirm that students can explain AES state layout, round operations, key expansion, and the final-round exception.",
    body:
      "A complete AES explanation should identify the 128-bit block, the 4 by 4 state matrix, SubBytes, ShiftRows, MixColumns, AddRoundKey, key expansion, and why the final round omits MixColumns.",
  },
];

const rsaSections: LessonSection[] = [
  {
    id: "concept",
    type: "concept",
    title: "RSA as a trapdoor modular exponentiation system",
    summary:
      "RSA publishes a modulus and public exponent while keeping the prime factors and private exponent secret.",
    body:
      "RSA is built around a one-way-looking operation: modular exponentiation modulo n. Anyone can compute with the public key, but efficient reversal depends on private information derived from the hidden prime factors of n.",
    references: ["rfc-8017"],
  },
  {
    id: "math",
    type: "math",
    title: "RSA key equation",
    summary:
      "The private exponent d is chosen so that the product of e and d is congruent to 1 modulo the totient.",
    body:
      "RSA key generation chooses primes p and q, computes the public modulus and totient, selects a public exponent e coprime to the totient, then computes d as the modular inverse of e. The classroom demo uses small numbers so each arithmetic step is visible.",
    formula:
      "n=pq,\\quad \\varphi(n)=(p-1)(q-1),\\quad ed\\equiv1\\pmod{\\varphi(n)}",
    references: ["rfc-8017"],
  },
  {
    id: "key-generation",
    type: "key-generation",
    title: "RSA key pair generation",
    summary:
      "Choose secret primes, compute the public modulus, then derive public and private exponents.",
    body:
      "The interactive module shows p=61 and q=53 as toy classroom primes, computes n=3233 and the totient 3120, chooses e=17, and derives d=2753 using the extended Euclidean algorithm.",
    references: ["rfc-8017"],
  },
  {
    id: "encryption-flow",
    type: "encryption-flow",
    title: "RSA encryption flow",
    summary:
      "A message representative is exponentiated with the public key to produce ciphertext.",
    body:
      "The RSA walkthrough uses square-and-multiply to show how modular exponentiation keeps intermediate values bounded by n while producing ciphertext.",
    references: ["rfc-8017"],
  },
  {
    id: "decryption-flow",
    type: "decryption-flow",
    title: "RSA decryption flow",
    summary:
      "The private exponent reverses the public exponent to recover the message representative.",
    body:
      "Because d is the modular inverse of e, the private exponent recovers the original encoded message representative in the classroom example.",
    references: ["rfc-8017"],
  },
  {
    id: "demo",
    type: "demo",
    title: "Full RSA keygen and round-trip trace",
    summary:
      "Inspect key generation, modular inverse derivation, encryption, decryption, and safe-usage warnings.",
    body:
      "The module deliberately separates textbook RSA arithmetic from deployment-safe RSA. Students see the math, then learn why real RSA encryption requires standards-defined padding such as OAEP.",
    references: ["rfc-8017"],
  },
  {
    id: "checkpoint",
    type: "checkpoint",
    title: "Checkpoint",
    summary:
      "Confirm that students can explain n, the totient, e, d, public/private key roles, and padding requirements.",
    body:
      "A complete RSA explanation should identify the secret primes, the public modulus, the public exponent, the private exponent, the modular inverse equation, the encryption/decryption equations, and why raw textbook RSA is not safe for deployment.",
  },
];

const elgamalSections: LessonSection[] = [
  {
    id: "concept",
    type: "concept",
    title: "ElGamal as randomized public-key encryption",
    summary:
      "ElGamal encrypts with public group parameters, a receiver public key, and fresh randomness for every message.",
    body:
      "ElGamal uses the discrete logarithm problem in a cyclic group. The receiver keeps a private exponent, publishes the corresponding public group element, and each sender chooses a fresh ephemeral exponent so the same message can encrypt to different ciphertexts.",
    references: ["elgamal-1985"],
  },
  {
    id: "math",
    type: "math",
    title: "ElGamal equations",
    summary:
      "Encryption sends an ephemeral public value and a masked message; decryption removes the shared secret.",
    body:
      "The sender computes a shared secret from the public key and fresh randomness. The receiver computes the same secret from the ephemeral ciphertext component and private exponent.",
    formula:
      "y=g^x\\pmod p,\\quad c=(g^k,\\;m y^k)\\pmod p,\\quad m=c_2(c_1^x)^{-1}\\pmod p",
    references: ["elgamal-1985"],
  },
  {
    id: "key-generation",
    type: "key-generation",
    title: "ElGamal key generation",
    summary:
      "Choose public group parameters, keep the private exponent secret, and publish the derived public key.",
    body:
      "The module uses a tiny finite-field group p=23 and generator g=5 so students can see every exponentiation. Real deployments require large, carefully selected groups.",
    references: ["elgamal-1985"],
  },
  {
    id: "encryption-flow",
    type: "encryption-flow",
    title: "ElGamal encryption flow",
    summary:
      "Choose fresh randomness, compute the ephemeral public component, compute the shared secret, then mask the message.",
    body:
      "The ciphertext is a pair. The first component carries the ephemeral public value; the second carries the message multiplied by the one-time shared secret.",
    references: ["elgamal-1985"],
  },
  {
    id: "decryption-flow",
    type: "decryption-flow",
    title: "ElGamal decryption flow",
    summary:
      "Recompute the shared secret, invert it, then recover the message representative.",
    body:
      "Only the private key holder can recompute the shared secret from the first ciphertext component. Multiplying by its inverse removes the mask applied during encryption.",
    references: ["elgamal-1985"],
  },
  {
    id: "demo",
    type: "demo",
    title: "Full ElGamal trace",
    summary:
      "Inspect public parameters, key generation, fresh randomness, encryption, decryption, and the risk of reusing k.",
    body:
      "The interactive module demonstrates the full ElGamal journey with toy numbers, then makes the operational requirement clear: the ephemeral key must be fresh for every encryption.",
    references: ["elgamal-1985"],
  },
  {
    id: "checkpoint",
    type: "checkpoint",
    title: "Checkpoint",
    summary:
      "Confirm that students can identify the private exponent, public key, ephemeral exponent, ciphertext pair, shared secret, and randomness rule.",
    body:
      "A complete ElGamal explanation should identify the public group, private exponent x, public key y, ephemeral exponent k, ciphertext pair, shared-secret equality, decryption inverse, and why reusing k is dangerous.",
  },
];

const eccSections: LessonSection[] = [
  {
    id: "concept",
    type: "concept",
    title: "ECC over finite fields",
    summary:
      "ECC uses points on a public elliptic curve, with coordinates reduced modulo a prime.",
    body:
      "The classroom module uses a tiny curve over F17 so every valid point can be plotted. Real ECC uses standardized curves with much larger fields, but the same core idea remains: public curve parameters define a group of points.",
    references: ["nist-fips-186-5", "nist-sp-800-186", "sec-1-v2"],
  },
  {
    id: "math",
    type: "math",
    title: "Elliptic-curve equations",
    summary:
      "The curve equation defines valid points; scalar multiplication turns private integers into public points.",
    body:
      "A private key is a scalar. The public key is a curve point derived from the base point. For key agreement, Alice and Bob compute the same shared point through opposite public/private paths.",
    formula:
      "E:y^2=x^3+ax+b\\pmod p,\\quad Q=dG,\\quad S=d_A\\,Q_B=d_B\\,Q_A",
    references: ["nist-fips-186-5", "nist-sp-800-186", "sec-1-v2"],
  },
  {
    id: "key-generation",
    type: "key-generation",
    title: "ECC key generation",
    summary:
      "Choose validated domain parameters, generate a secret scalar, and publish only the derived point.",
    body:
      "The public domain parameters include the curve, field, base point, and order. The private key is a random scalar d, and the public key is the point Q=dG.",
    references: ["nist-sp-800-186", "sec-1-v2"],
  },
  {
    id: "encryption-flow",
    type: "encryption-flow",
    title: "ECC agreement flow",
    summary:
      "ECC commonly supports encryption by agreeing on shared key material, then using symmetric encryption.",
    body:
      "ECC is often used through ECDH or ECIES-style constructions. The curve operation creates shared key material; a KDF and authenticated encryption handle real message protection.",
    references: ["sec-1-v2"],
  },
  {
    id: "decryption-flow",
    type: "decryption-flow",
    title: "Recovering with the shared point",
    summary:
      "Both parties recompute the same shared point, then reverse the symmetric protection layer.",
    body:
      "The toy demo uses the x-coordinate as a small modular mask only to make the classroom arithmetic visible. Real schemes derive a key from the shared secret and decrypt with an authenticated symmetric cipher.",
    references: ["sec-1-v2"],
  },
  {
    id: "demo",
    type: "demo",
    title: "Finite-field curve walkthrough",
    summary:
      "Plot curve points, inspect modular point arithmetic, derive public keys, and verify ECDH agreement.",
    body:
      "The interactive module shows the complete classroom journey: curve parameters, base point, point doubling, point addition, scalar multiplication, public-key generation, shared-point agreement, and a toy ECIES-style mask.",
    references: ["nist-sp-800-186", "sec-1-v2"],
  },
  {
    id: "checkpoint",
    type: "checkpoint",
    title: "Checkpoint",
    summary:
      "Confirm that students can identify the public curve, base point, private scalar, public point, and shared point.",
    body:
      "A complete ECC explanation should separate the classroom toy numbers from real domain parameters, explain why scalar multiplication is easy forward and hard to reverse, and state that real encryption uses KDFs plus authenticated symmetric encryption.",
  },
];

export const lessonModules: LessonModule[] = [
  {
    id: "des",
    title: "Data Encryption Standard",
    shortTitle: "DES",
    family: "symmetric",
    status: "interactive-ready",
    difficulty: "Interactive historical block cipher",
    tagline:
      "A complete Feistel walkthrough with real DES permutations, subkeys, S-boxes, and round states.",
    summary:
      "DES is implemented as the first real module: a historical 64-bit block cipher walkthrough that teaches Feistel structure while making clear that DES is not acceptable for modern protection.",
    objectives: [
      "Trace one complete DES encryption from plaintext to ciphertext.",
      "Explain IP, FP, expansion, XOR, S-box compression, P permutation, and Feistel swapping.",
      "Generate and inspect all 16 DES round subkeys from the 64-bit key representation.",
    ],
    prerequisites: [
      "Binary notation",
      "Hexadecimal",
      "XOR",
      "Permutation as reordering",
      "Shared secret keys",
    ],
    keyQuestions: [
      "What does a Feistel round preserve that makes decryption possible?",
      "Where do confusion and diffusion appear in DES?",
      "Why did key length become the practical failure point?",
    ],
    sections: desSections,
    glossary: [
      ...commonGlossary,
      {
        term: "Feistel network",
        definition:
          "A reversible round structure that can decrypt by applying round keys in reverse order.",
      },
      {
        term: "S-box",
        definition:
          "A substitution table that maps input bits to output bits and provides non-linear behavior.",
      },
    ],
    visualizer: toyVisualizer,
    references: ["nist-fips-46-3"],
  },
  {
    id: "3des",
    title: "Triple Data Encryption Algorithm",
    shortTitle: "3DES",
    family: "symmetric",
    status: "interactive-ready",
    difficulty: "Interactive legacy construction",
    tagline:
      "A real EDE walkthrough showing how three DES stages transform one 64-bit block.",
    summary:
      "3DES/TDEA is implemented as a real EDE module: useful for learning compatibility-driven cryptographic design, but clearly retired for new protection.",
    objectives: [
      "Trace one complete 3-key EDE encryption from plaintext to ciphertext.",
      "Explain why the middle DES operation is decryption, not encryption.",
      "Compare 3-key, 2-key, and all-keys-equal compatibility behavior.",
    ],
    prerequisites: [
      "DES concept",
      "Feistel decryption",
      "Block ciphers",
      "Keying options",
      "Backward compatibility",
    ],
    keyQuestions: [
      "Why not simply encrypt twice with DES?",
      "What does compatibility with single DES cost?",
      "Why did standards retire TDEA despite its historical usefulness?",
    ],
    sections: tdesSections,
    glossary: [
      ...commonGlossary,
      {
        term: "TDEA",
        definition:
          "Triple Data Encryption Algorithm, the standards name often used for 3DES.",
      },
      {
        term: "Keying option",
        definition:
          "A choice of how many independent DES keys are used inside the triple-DES construction.",
      },
      {
        term: "EDE",
        definition:
          "Encrypt-decrypt-encrypt, the 3DES composition that provides single-DES backward compatibility when all three keys are equal.",
      },
      {
        term: "Meet-in-the-middle attack",
        definition:
          "A cryptanalytic strategy that can reduce the expected work of attacking repeated encryption constructions.",
      },
    ],
    visualizer: toyVisualizer,
    references: ["nist-fips-46-3", "nist-sp-800-67-withdrawal"],
  },
  {
    id: "aes",
    title: "Advanced Encryption Standard",
    shortTitle: "AES",
    family: "symmetric",
    status: "interactive-ready",
    difficulty: "Interactive modern block cipher",
    tagline:
      "A full AES-128 state-matrix walkthrough with key expansion and all 10 rounds.",
    summary:
      "AES is implemented as the modern symmetric cipher module: a 128-bit block walkthrough that teaches the state matrix, round transformations, and key expansion.",
    objectives: [
      "Trace one complete AES-128 encryption from plaintext to ciphertext.",
      "Explain SubBytes, ShiftRows, MixColumns, and AddRoundKey using the state matrix.",
      "Inspect the AES-128 key expansion from 4 input words to 44 expanded words.",
    ],
    prerequisites: ["Hexadecimal", "Matrices", "XOR", "Finite-field intuition", "Byte arithmetic"],
    keyQuestions: [
      "Why is AES state represented as a matrix?",
      "How do substitution and permutation cooperate?",
      "What does the AES key schedule contribute to each round?",
    ],
    sections: aesSections,
    glossary: [
      ...commonGlossary,
      {
        term: "State matrix",
        definition:
          "The 4 by 4 byte arrangement AES uses to represent its 128-bit working state.",
      },
      {
        term: "Finite field",
        definition:
          "A finite set with addition and multiplication rules used by AES for byte-level operations.",
      },
    ],
    visualizer: toyVisualizer,
    references: ["nist-fips-197"],
  },
  {
    id: "rsa",
    title: "Rivest-Shamir-Adleman",
    shortTitle: "RSA",
    family: "asymmetric",
    status: "interactive-ready",
    difficulty: "Interactive number theory",
    tagline:
      "A complete classroom RSA trace covering key generation, modular inverse math, encryption, and decryption.",
    summary:
      "RSA is implemented as the first real asymmetric module: a small-number walkthrough that teaches the key pair, the modular inverse relationship, public-key encryption, private-key decryption, and safe padding context.",
    objectives: [
      "Generate an RSA key pair from two classroom-sized primes.",
      "Derive the private exponent with the extended Euclidean algorithm.",
      "Trace textbook RSA encryption and decryption while separating it from safe real-world RSA usage.",
    ],
    prerequisites: ["Prime numbers", "Modular arithmetic", "Greatest common divisors", "Euler's totient"],
    keyQuestions: [
      "Why does knowing p and q matter if n is public?",
      "What relationship must e and d satisfy?",
      "Why is padding part of safe RSA, not decoration?",
    ],
    sections: rsaSections,
    glossary: [
      ...commonGlossary,
      {
        term: "Modulus",
        definition: "The public RSA number n, computed as the product of two secret primes.",
      },
      {
        term: "Totient",
        definition:
          "A value related to the count of numbers coprime to n; used to reason about RSA exponents.",
      },
      {
        term: "Public exponent",
        definition:
          "The public value e used with n to perform the RSA public operation.",
      },
      {
        term: "Private exponent",
        definition:
          "The secret value d that reverses the public exponent operation for the holder of the private key.",
      },
      {
        term: "Padding scheme",
        definition:
          "A standards-defined encoding layer, such as OAEP for encryption, that makes RSA safe for real messages.",
      },
    ],
    visualizer: toyVisualizer,
    references: ["rfc-8017"],
  },
  {
    id: "elgamal",
    title: "ElGamal",
    shortTitle: "ElGamal",
    family: "asymmetric",
    status: "interactive-ready",
    difficulty: "Interactive discrete logarithms",
    tagline:
      "A full ElGamal finite-field walkthrough with key generation, fresh randomness, encryption, and decryption.",
    summary:
      "ElGamal is implemented as a randomized public-key encryption module: a small finite-field walkthrough that teaches public parameters, private exponents, ephemeral randomness, shared secrets, and the danger of reusing k.",
    objectives: [
      "Generate an ElGamal key pair from public group parameters and a private exponent.",
      "Trace one encryption into the two-part ciphertext pair.",
      "Decrypt by recomputing the shared secret and explain why k must be fresh.",
    ],
    prerequisites: ["Modular exponentiation", "Cyclic groups", "Generators", "Randomness"],
    keyQuestions: [
      "Why is the discrete logarithm hard in the chosen group?",
      "What breaks when the ephemeral secret is reused?",
      "How does the receiver remove the masking value?",
    ],
    sections: elgamalSections,
    glossary: [
      ...commonGlossary,
      {
        term: "Generator",
        definition:
          "An element whose repeated powers produce the group elements used by the scheme.",
      },
      {
        term: "Ephemeral key",
        definition:
          "A one-time random secret used for a single encryption or protocol run.",
      },
      {
        term: "Discrete logarithm",
        definition:
          "The problem of recovering a secret exponent from a generator and its public power in the selected group.",
      },
      {
        term: "Ciphertext pair",
        definition:
          "The two ElGamal ciphertext components carrying the ephemeral public value and masked message.",
      },
      {
        term: "Shared secret",
        definition:
          "The group value that both sender and receiver can compute through different paths.",
      },
    ],
    visualizer: toyVisualizer,
    references: ["elgamal-1985"],
  },
  {
    id: "ecc",
    title: "Elliptic Curve Cryptography",
    shortTitle: "ECC",
    family: "asymmetric",
    status: "interactive-ready",
    difficulty: "Interactive elliptic-curve groups",
    tagline:
      "A 2D finite-field curve walkthrough with scalar multiplication, key generation, and ECDH-style shared secrets.",
    summary:
      "ECC is implemented as the final asymmetric module: a small finite-field curve walkthrough that teaches point arithmetic, scalar multiplication, key generation, ECDH-style shared secrets, and how ECC supports encryption through key agreement.",
    objectives: [
      "Plot a small finite-field elliptic curve and identify valid points.",
      "Generate ECC public keys by scalar-multiplying a base point.",
      "Trace ECDH-style shared-secret derivation and a toy ECIES-style mask.",
    ],
    prerequisites: ["Coordinate geometry", "Modular arithmetic", "Groups", "Discrete logarithm intuition"],
    keyQuestions: [
      "What does scalar multiplication mean on a curve?",
      "Why is reversing scalar multiplication believed hard?",
      "Which curve parameters are public and which value is private?",
    ],
    sections: eccSections,
    glossary: [
      ...commonGlossary,
      {
        term: "Scalar multiplication",
        definition:
          "Repeated elliptic-curve point addition, written as kP, where k is an integer and P is a point.",
      },
      {
        term: "Domain parameters",
        definition:
          "The public curve, base point, order, and related values that define an ECC setting.",
      },
      {
        term: "Point at infinity",
        definition:
          "The identity element of an elliptic-curve group, written as O in the classroom module.",
      },
      {
        term: "Base point",
        definition:
          "The public generator point G used to derive public keys through scalar multiplication.",
      },
      {
        term: "ECDH",
        definition:
          "Elliptic Curve Diffie-Hellman, a key agreement pattern where both sides compute the same shared curve point.",
      },
      {
        term: "ECIES",
        definition:
          "An elliptic-curve encryption pattern that derives symmetric key material from a shared point.",
      },
    ],
    visualizer: toyVisualizer,
    references: ["nist-fips-186-5", "nist-sp-800-186", "sec-1-v2"],
  },
];

export function getLessonModule(id: string | undefined): LessonModule | undefined {
  if (!id) {
    return undefined;
  }

  return lessonModules.find((module) => module.id === id);
}

export function getReference(id: string): Reference | undefined {
  return referenceLibrary.find((reference) => reference.id === id);
}

export function getReferencesForModule(module: LessonModule): Reference[] {
  return module.references
    .map((referenceId) => getReference(referenceId))
    .filter((reference): reference is Reference => Boolean(reference));
}

export function getReferencesForSection(section: LessonSection): Reference[] {
  return (section.references ?? [])
    .map((referenceId) => getReference(referenceId))
    .filter((reference): reference is Reference => Boolean(reference));
}

export const familyLabels: Record<AlgorithmFamily, string> = {
  symmetric: "Symmetric cryptography",
  asymmetric: "Asymmetric cryptography",
};
