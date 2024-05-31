import { createDiffieHellman } from 'crypto-browserify';

export const ZERO = BigInt(0);
export const ONE = BigInt(1);
export const TWO = BigInt(2);

export function generateRandomInt(max?: number) {
  return Math.floor(Math.random() * (max ?? Number.MAX_SAFE_INTEGER));
}

export function generateProbablePrime(
  bits: number,
  generator?: number
): bigint {
  const dhKey = createDiffieHellman(bits, generator);
  const primeHex = dhKey.getPrime('hex');
  return BigInt('0x' + primeHex);
}

export function abs(n: bigint) {
  return n < 0 ? -n : n;
}

export function gcd(a: bigint, b: bigint) {
  a = abs(a);
  b = abs(b);
  if (b > a) {
    const temp = a;
    a = b;
    b = temp;
  }
  while (true) {
    if (b === ZERO) {
      return a;
    }
    a %= b;
    if (a === ZERO) {
      return b;
    }
    b %= a;
  }
}

export function modInverse(a: bigint, m: bigint): bigint {
  a = ((a % m) + m) % m;
  if (!a || m < 2) {
    throw new Error('arithmetic error');
  }
  const s: Array<{ a: bigint; b: bigint }> = [];
  let b = m;
  while (b) {
    [a, b] = [b, a % b];
    s.push({ a, b });
  }
  if (a !== ONE) {
    throw new Error('arithmetic error');
  }
  let x = ONE;
  let y = ZERO;
  for (let i = s.length - 2; i >= 0; --i) {
    [x, y] = [y, x - y * (s[i].a / s[i].b)];
  }
  return ((y % m) + m) % m;
}

export function modPow(b: bigint, e: bigint, m: bigint): bigint {
  // return b ** e % m;
  let res = ONE;
  b = b % m;
  while (e > 0) {
    if (b === ZERO) {
      return ZERO;
    }
    if (e % TWO === ONE) {
      res = (res * b) % m;
    }
    e /= TWO;
    b = (b * b) % m;
  }
  return res;
}
