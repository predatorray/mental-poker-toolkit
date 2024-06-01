import test from 'ava';

import { generateShamirRivestAldeman } from './sra';

for (const bits of [8, 16]) {
  test(`encrypt and decrypt (bits = ${bits})`, async (t) => {
    const sra = await generateShamirRivestAldeman({
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

  test(`encrypt and decrypt using random e (bits = ${bits})`, async (t) => {
    const sra = await generateShamirRivestAldeman({
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

  test(`encrypt and decrypt using random p q & e (bits = ${bits})`, async (t) => {
    const sra = await generateShamirRivestAldeman({
      bits,
    });
    const message = BigInt(4);
    const cipher = sra.encrypt(message);
    const decrypted = sra.decrypt(cipher);
    t.is(decrypted, message);
  });

  test(`commutative encryption (bits = ${bits})`, async (t) => {
    const alice = await generateShamirRivestAldeman({
      bits,
    });
    const bob = await generateShamirRivestAldeman({
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
