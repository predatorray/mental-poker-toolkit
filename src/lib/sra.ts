import { gcd, modInv, modPow, prime } from 'bigint-crypto-utils';

export class PublicKey {
  public readonly p: bigint;
  public readonly q: bigint;
  public readonly n: bigint;
  public readonly phi: bigint;

  constructor(p: bigint, q: bigint) {
    this.p = p;
    this.q = q;
    this.n = this.p * this.q;
    this.phi = (this.p - 1n) * (this.q - 1n);
  }

  async generateE(bits: number): Promise<bigint> {
    while (true) {
      const e = await prime(bits);
      if (gcd(e, this.phi) === 1n) {
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
    publicKey: PublicKey;
    encryptionKey: EncryptionKey;
    decryptionKey: DecryptionKey;
  }) {
    this.publicKey = props.publicKey;
    this.encryptionKey = props.encryptionKey;
    this.decryptionKey = props.decryptionKey;
  }

  encrypt(message: bigint): bigint {
    return this.encryptionKey.encrypt(message);
  }

  decrypt(cipher: bigint): bigint {
    return this.decryptionKey.decrypt(cipher);
  }
}

export async function generateShamirRivestAldeman(props: {
  bits: number;
  keys?: {
    p: bigint;
    q: bigint;
    e?: bigint;
  };
}): Promise<ShamirRivestAldeman> {
  const p = props.keys?.p ?? (await prime(props.bits));
  const q =
    props.keys?.q ??
    (await (async () => {
      let q = p;
      while (q === p) {
        q = await prime(props.bits);
      }
      return q;
    })());
  const publicKey = new PublicKey(p, q);

  const e = props.keys?.e ?? (await publicKey.generateE(props.bits));
  const d = modInv(e, publicKey.phi);

  const encryptionKey = new EncryptionKey(e, publicKey.n);
  const decryptionKey = new DecryptionKey(d, publicKey.n);
  return new ShamirRivestAldeman({ publicKey, encryptionKey, decryptionKey });
}
