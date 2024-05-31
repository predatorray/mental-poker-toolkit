import {
  gcd,
  generateProbablePrime,
  generateRandomInt,
  modInverse,
  modPow,
  ONE,
} from './math';

export class PublicKey {
  public readonly p: bigint;
  public readonly q: bigint;
  public readonly n: bigint;
  public readonly phi: bigint;

  constructor(p: bigint, q: bigint) {
    this.p = p;
    this.q = q;
    this.n = this.p * this.q;
    this.phi = (this.p - ONE) * (this.q - ONE);
  }

  generateE(bits: number): bigint {
    while (true) {
      const e = generateProbablePrime(bits);
      if (gcd(e, this.phi) === ONE) {
        return e;
      }
    }
  }
}

export class EncryptionKey {
  public readonly e: bigint;
  public readonly n: bigint;

  constructor(e: bigint, n: bigint) {
    this.e = e;
    this.n = n;
  }

  encrypt(message: bigint): bigint {
    return modPow(message, this.e, this.n);
  }
}

export class DecryptionKey {
  public readonly d: bigint;
  public readonly n: bigint;

  constructor(d: bigint, n: bigint) {
    this.d = d;
    this.n = n;
  }

  decrypt(cipher: bigint) {
    return modPow(cipher, this.d, this.n);
  }
}

export class ShamirRivestAldeman {
  public readonly publicKey: PublicKey;
  public readonly encryptionKey: EncryptionKey;
  public readonly decryptionKey: DecryptionKey;

  constructor(props: {
    bits: number;
    keys?: {
      p: bigint;
      q: bigint;
      e?: bigint;
    };
  }) {
    this.publicKey = props.keys
      ? new PublicKey(props.keys.p, props.keys.q)
      : (() => {
          const gen1 = 2 + generateRandomInt(10);
          const p = generateProbablePrime(props.bits, gen1);

          let q = p;
          let gen2 = gen1 + generateRandomInt(10) + 1;
          while (q === p) {
            q = generateProbablePrime(props.bits, ++gen2);
          }
          return new PublicKey(p, q);
        })();
    const e = props.keys?.e ?? this.publicKey.generateE(props.bits);
    const d = modInverse(e, this.publicKey.phi);

    this.encryptionKey = new EncryptionKey(e, this.publicKey.n);
    this.decryptionKey = new DecryptionKey(d, this.publicKey.n);
  }

  encrypt(message: bigint): bigint {
    return this.encryptionKey.encrypt(message);
  }

  decrypt(cipher: bigint): bigint {
    return this.decryptionKey.decrypt(cipher);
  }
}
