export function normalizeHex(raw: string) {
  return raw.replace(/^0x/i, "").replace(/\s/g, "").toUpperCase();
}

export function isValidHexBlock(raw: string, byteLength: number) {
  return new RegExp(`^[0-9A-F]{${byteLength * 2}}$`).test(normalizeHex(raw));
}

export function textToBlockHex(text: string, byteLength: number) {
  const safeCharacters = text
    .split("")
    .map((character) => {
      const code = character.charCodeAt(0);
      return code >= 0x20 && code <= 0x7e ? character : "?";
    })
    .slice(0, byteLength);

  while (safeCharacters.length < byteLength) {
    safeCharacters.push(" ");
  }

  return safeCharacters
    .map((character) => character.charCodeAt(0).toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

export function hexBlockToText(hex: string): string | null {
  const normalized = normalizeHex(hex);
  const characters: string[] = [];

  for (let index = 0; index < normalized.length; index += 2) {
    const code = Number.parseInt(normalized.slice(index, index + 2), 16);

    if (Number.isNaN(code) || code < 0x20 || code > 0x7e) {
      return null;
    }

    characters.push(String.fromCharCode(code));
  }

  return characters.join("");
}

export function randomHex(byteLength: number) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);

  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

export function randomInt(min: number, max: number) {
  const range = max - min + 1;
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);

  return min + (values[0] % range);
}

export function randomChoice<T>(items: T[]): T {
  return items[randomInt(0, items.length - 1)];
}

export function gcd(left: number, right: number) {
  let a = Math.abs(left);
  let b = Math.abs(right);

  while (b !== 0) {
    const next = a % b;
    a = b;
    b = next;
  }

  return a;
}

export const RSA_PRIME_CHOICES = [11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61];

export const RSA_E_CHOICES = [3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37];

export function pickRsaParams() {
  const p = randomChoice(RSA_PRIME_CHOICES);
  const q = randomChoice(RSA_PRIME_CHOICES.filter((candidate) => candidate !== p));
  const phi = (p - 1) * (q - 1);
  const validExponents = RSA_E_CHOICES.filter(
    (candidate) => candidate < phi && gcd(candidate, phi) === 1,
  );

  return { p, q, e: randomChoice(validExponents) };
}
