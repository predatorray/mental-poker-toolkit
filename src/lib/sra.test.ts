import test from 'ava';

import { ShamirRivestAldeman } from './sra';

for (const bits of [8, 16, 32, 64, 128]) {
  test(`encrypt and decrypt (bits = ${bits})`, (t) => {
    const sra = new ShamirRivestAldeman({
      bits,
      keys: {
        p: BigInt(7),
        q: BigInt(13),
        e: BigInt(5),
      },
    });
    const message = BigInt(4);
    const cipher = sra.encrypt(message);
    const decrypted = sra.decrypt(cipher);
    t.is(decrypted, message);
  });

  test(`encrypt and decrypt using random e (bits = ${bits})`, (t) => {
    const sra = new ShamirRivestAldeman({
      bits,
      keys: {
        p: BigInt(7),
        q: BigInt(13),
      },
    });
    const message = BigInt(4);
    const cipher = sra.encrypt(message);
    const decrypted = sra.decrypt(cipher);
    t.is(decrypted, message);
  });

  test(`encrypt and decrypt using random p q & e (bits = ${bits})`, (t) => {
    const sra = new ShamirRivestAldeman({
      bits,
    });
    const message = BigInt(4);
    const cipher = sra.encrypt(message);
    const decrypted = sra.decrypt(cipher);
    t.is(decrypted, message);
  });

  test(`commutative encryption (bits = ${bits})`, (t) => {
    const alice = new ShamirRivestAldeman({
      bits,
    });
    const bob = new ShamirRivestAldeman({
      bits,
      keys: {
        p: alice.publicKey.p,
        q: alice.publicKey.q,
      },
    });
    const message = BigInt(4);
    const aliceCipher = alice.encrypt(message);
    const aliceBobCipher = bob.encrypt(aliceCipher);
    const bobCipher = alice.decrypt(aliceBobCipher);
    const actualDecrypted = bob.decrypt(bobCipher);
    t.is(actualDecrypted, message);
  });
}
