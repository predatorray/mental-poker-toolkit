import test from 'ava';

import { generateProbablePrime, modInverse, modPow } from './math';

test('generateProbablePrime', (t) => {
  const prime = generateProbablePrime(16);
  t.truthy(prime);
});

test('modInverse(7, 87) === 25', (t) => {
  t.is(modInverse(BigInt(7), BigInt(87)), BigInt(25));
});

test('modPow(117, 513, 31) === 29', (t) => {
  t.is(modPow(BigInt(117), BigInt(513), BigInt(31)), BigInt(29));
});
