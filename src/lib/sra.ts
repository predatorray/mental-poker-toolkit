import { gcd, modInv, modPow, prime } from 'bigint-crypto-utils';

/**
 * Public key of SRA key exchange object
 */
export class PublicKey {
  /**
   * prime number `P`
   */
  public readonly p: bigint;
  /**
   * prime number `Q`
   */
  public readonly q: bigint;
  /**
   * `N = P * Q`
   */
  public readonly n: bigint;
  /**
   * `Phi = (P - 1) * (Q - 1)`
   */
  public readonly phi: bigint;

  constructor(p: bigint, q: bigint) {
    this.p = p;
    this.q = q;
    this.n = this.p * this.q;
    this.phi = (this.p - 1n) * (this.q - 1n);
  }

  /**
   * Generates `E` such that `gcd(E, Phi)` is 1.
   * @param bits - E size in bits
   * @returns the number E (asynchrously)
   */
  async generateE(bits: number): Promise<bigint> {
    while (true) {
      const e = await prime(bits);
      if (gcd(e, this.phi) === 1n) {
        return e;
      }
    }
  }
}

/**
 * Encryption key of SRA key exchange object
 */
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

/**
 * Decryption key of SRA key exchange object
 */
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

/**
 * Shamir-Rivest-Adleman (SRA) key exchange object.
 */
export class ShamirRivestAdleman {
  /**
   * Public Key of the SRA object, which can be shared with other peers
   */
  public readonly publicKey: PublicKey;
  /**
   * Encryption Key of the SRA object, which can be used to encrypt message
   */
  public readonly encryptionKey: EncryptionKey;
  /**
   * Decryption Key of the SRA object, which can be used to decrypt message
   */
  public readonly decryptionKey: DecryptionKey;

  /**
   * Constructs a SRA object.
   *
   * The factory method {@link generateShamirRivestAdleman} is more preferred to this constructor.
   */
  constructor(props: {
    publicKey: PublicKey;
    encryptionKey: EncryptionKey;
    decryptionKey: DecryptionKey;
  }) {
    this.publicKey = props.publicKey;
    this.encryptionKey = props.encryptionKey;
    this.decryptionKey = props.decryptionKey;
  }

  /**
   * Encrypt the message using the encryption key
   * @param message - plain text message represented in bigint
   * @returns the cipher in bigint
   */
  encrypt(message: bigint): bigint {
    return this.encryptionKey.encrypt(message);
  }

  /**
   * Decrypt the cipher using the decryption key
   * @param cipher the cipher in bigint
   * @returns the decrypted message in bigint
   */
  decrypt(cipher: bigint): bigint {
    return this.decryptionKey.decrypt(cipher);
  }
}

/**
 * Generates a Shamir-Rivest-Adleman (SRA) key exchange object.
 *
 * @param props.bits - prime size in bits
 * @param props.keys - any keys generated previously (e.g. an existing {@link ShamirRivestAdleman.publicKey} of another SRA object)
 * @param props.keys.p - prime `P` (part of the public key)
 * @param props.keys.q - prime `Q` (part of the public key)
 * @param props.keys.e - encryption e such that `gcd(e, phi)` is 1 where phi is `(p - 1) * (q - 1)`
 * @returns {@link ShamirRivestAdleman} instance (asynchrously)
 */
export async function generateShamirRivestAdleman(props: {
  /**
   * prime size in bits
   */
  bits: number;
  keys?: {
    p: bigint;
    q: bigint;
    e?: bigint;
  };
}): Promise<ShamirRivestAdleman> {
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
  return new ShamirRivestAdleman({ publicKey, encryptionKey, decryptionKey });
}
