# mental-poker-toolkit

![License](https://img.shields.io/github/license/predatorray/mental-poker-toolkit)
[![CircleCI](https://circleci.com/gh/predatorray/mental-poker-toolkit.svg?style=svg)](https://circleci.com/gh/predatorray/mental-poker-toolkit)
[![codecov](https://codecov.io/github/predatorray/mental-poker-toolkit/branch/master/graph/badge.svg?token=xq99f5bDOZ)](https://codecov.io/github/predatorray/mental-poker-toolkit)

Toolkit for implementing [mental poker](https://en.wikipedia.org/wiki/Mental_poker) games.

## Usage

Install the package.

```sh
npm install mental-poker-toolkit
```

And then, either `require` or `import` the library.

```javascript
require('mental-poker-toolkit');
```

or

```javascript
import * as MentalPokerToolkit from 'mental-poker-toolkit';
```

### Example

Here is a step-by-step example following the [algorithm](https://en.wikipedia.org/wiki/Mental_poker#The_algorithm) explained on Wikipedia.

```typescript
// 1. Alice and Bob agree on a certain "deck" of cards
const deck = getStandard52Deck();
const deckEncoded = new EncodedDeck(
  deck.map((card) => BigInt(encodeStandardCard(card)))
);

// 2. Alice picks an encryption key A.
const alice = await createPlayer({
  cards: deck.length,
  bits: 32,
});

// 3. Alice uses this to encrypt each card of the deck and shuffles the cards.
const encryptedWithKeyA = alice.encryptAndShuffle(deckEncoded);

// 4. Alice passes the encrypted and shuffled deck to Bob.
// ignored, since it varies.

// 5. Bob picks an encryption key B.
const sharedPublicKey = alice.publicKey;
const bob = await createPlayer({
  cards: deck.length,
  publicKey: sharedPublicKey,
  bits: 32,
});

// 6. Bob uses this to encrypt each card of the encrypted and shuffled deck and shuffles the deck.
const encryptedWithKeyAKeyB = bob.encryptAndShuffle(encryptedWithKeyA);

// 7. Bob passes the double encrypted and shuffled deck back to Alice.
// ignored, since it varies.

// 8 & 9. Alice decrypts each card using her key A.
//        Alice picks one encryption key for each card (A1, A2, etc.) and encrypts them individually.
const encryptedWithIndividualKeyAKeyB = alice.decryptAndEncryptIndividually(
  encryptedWithKeyAKeyB
);

// 10. Alice passes the deck to Bob.
// ignored, since it varies.

// 11 & 12. Bob decrypts each card using his key B.
//          Bob picks one encryption key for each card (B1, B2, etc.) and encrypts them individually.
const encryptedBothKeysIndividually = bob.decryptAndEncryptIndividually(
  encryptedWithIndividualKeyAKeyB
);

// 13. Bob passes the deck back to Alice.
// 14. Alice publishes the deck for everyone playing.
// ignored, since it varies.

// Finally, when any player wants to see their cards,
// they will request the corresponding keys from both Alice and Bob.
const doubleEncryptedCard = encryptedBothKeysIndividually.cards[offset];
const aliceIndividualKey = alice.getIndividualKey(offset);
const bobIndividualKey = bob.getIndividualKey(offset);

const decryptedCard = bobIndividualKey.decrypt(
  aliceIndividualKey.decrypt(doubleEncryptedCard));

console.log(`suit = ${decryptedCard.suit}, rank = ${decryptedCard.rank}`);
```

## API Reference

For more information, please see the [API reference doc](https://predatorray.github.io/mental-poker-toolkit).
