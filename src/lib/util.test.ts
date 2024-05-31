import test from 'ava';

import { reverseObject } from './util';

test('reverseObject', (t) => {
  const obj = {
    a: 'b',
    c: 'd',
  };
  const reversed = reverseObject(obj);
  t.deepEqual(reversed, { b: 'a', d: 'c' });
});
