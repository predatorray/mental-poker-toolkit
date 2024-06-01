import test from 'ava';

import { generateRandomInt, reverseObject } from './util';

test('generateRandomInt', (t) => {
  const randomInt = generateRandomInt(2);
  t.true(randomInt >= 0 && randomInt < 2);
});

test('reverseObject', (t) => {
  const obj = {
    a: 'b',
    c: 'd',
  };
  const reversed = reverseObject(obj);
  t.deepEqual(reversed, { b: 'a', d: 'c' });
});
