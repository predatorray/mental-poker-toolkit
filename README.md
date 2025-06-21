# mental-poker-toolkit

[![NPM Version](https://img.shields.io/npm/v/mental-poker-toolkit)][2]
[![License](https://img.shields.io/github/license/predatorray/mental-poker-toolkit)][3]
[![codecov](https://codecov.io/github/predatorray/mental-poker-toolkit/branch/master/graph/badge.svg?token=xq99f5bDOZ)](https://codecov.io/github/predatorray/mental-poker-toolkit)
[![CircleCI](https://circleci.com/gh/predatorray/mental-poker-toolkit.svg?style=svg)](https://circleci.com/gh/predatorray/mental-poker-toolkit)

A JavaScript / TypeScript toolkit designed to implement mental poker, playing fair card games (like poker) over untrusted, public networks, without relying on a central server or fully trusting other players.

## TL;DR

- **What it is**: A zero-trust cryptographic engine for shuffling and dealing cards fairly.
- **What you get**: Simple client-side API to shuffle/deal encrypted decks, reveal individual cards, and build fair multi-player games.
- **Where it’s used**: Powers browser-based, serverless card games like [mental-texas-holdem].
- **Why it’s cool**: Enables trustless gameplay using only shared public channels, no central server required.
- **What it doesn't have**: Network layer or framework (e.g. WebRTC) that establish connections among different peers like [PeerJS].

## 🚀 Installation

Available on [NPM][2].

```sh
npm install mental-poker-toolkit
```

Import it in your project:

```js
// CommonJS
const MentalPokerToolkit = require('mental-poker-toolkit');

// ES Modules / TypeScript
import * as MentalPokerToolkit from 'mental-poker-toolkit';
```

## ℹ️ About Mental Poker

**Mental Poker** refers to a set of cryptographic protocols that allow players to play a fair card game over a public, untrusted network, without relying on a centralized dealer or trusted third party. The name stems from poker, but the core challenge it addresses is: How do you let players draw cards, verify shuffling, and keep others from peeking, all while ensuring no one cheats? 

### The Core Problem

It solves this by using cryptography to ensure two crucial properties:

1. **Fair Shuffling**: The deck is shuffled and encrypted by every player so that no one knows the true order.
2. **Card Confidentiality**: Only the designated player(s) can decrypt the cards dealt to them.

### Foundational Protocols

* **Shamir–Rivest–Adleman (1979)**: The first mental poker protocol, which introduced secure two-party computation beyond secure messaging.
* **Moti Yung’s multi-player model (1984)**: This extended the concept to support games with more than two participants.

### How It Works: Commutative Encryption

A popular mental poker technique is based on commutative encryption, where the order of encryption by different keys doesn’t matter. Here’s a simplified two-player (Alice & Bob) protocol:

1.	Agree on a deck representation (e.g., numbered cards).
2.	Alice encrypts (with key A) and shuffles the deck.
3.	Bob encrypts that deck (with key B), then shuffles again.
4.	Alice decrypts with A, removing her layer while Bob’s encryption remains.
5.	Alice applies individual encryptions (A₁ … Aₙ) per card and sends it to Bob.
6.	Bob decrypts with B and adds his own individual layers (B₁ … Bₙ), then returns the deck.
7.	The deck is now doubly encrypted and fully shuffled.
8.	To reveal a card, a player (e.g., Alice) asks the counterpart for the matching decryption keys. Only with both keys (e.g., Bₖ and Aₖ) can the card be decrypted—ensuring no one sees other players’ cards. 

It can be described as follows:

$$
\begin{align*}c &= &f_{k_2}(f_{k_1}(m)) &\equiv& f_{k_1}(f_{k_2}(m))\\\\m &= &f_{k_2}^{-1}(f_{k_1}^{-1}(c)) &\equiv& f_{k_1}^{-1}(f_{k_2}^{-1}(c))\end{align*}
$$

where,
- $m$ is the plaintext (the Card),
- $c$ is the double-encrypted ciphertext,
- $k_1$ and $k_2$ are the keys of the players Alice and Bob,
- $f_{k_n}$ and $f_{k_n}^{-1}$ are the encryption and decryption functions using key $k_n$,

In this toolkit, Shamir–Rivest–Adleman (SRA) is used as the commutative encryption method (for $f_{k_n}$ and $f_{k_n}^{-1}$).

(see: [Mental Poker][1] on Wikipedia for more information)

## 🧩 Quick Demo

Following the “Alice & Bob” Protocol described both above and also on [Wikipedia][1].

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

## 🌐 Real-World Use: Texas Hold’em

This toolkit powers [mental-texas-holdem], a peer-to-peer, serverless Texas Hold’em game played in-browser via WebRTC. The toolkit handles deck shuffling, encryption, fairness, and draw mechanics, while [PeerJS] is leveraged as the network layer which establishes connections for both public and private events without a central game server.

![screenshot](https://github.com/predatorray/mental-texas-holdem/blob/assets/screenshot.png?raw=true)

## 📚 Full API Reference

Detailed documentation and examples available in the [API reference doc].

## License

Open-source under the [MIT License][3].

## Support

Please feel free to [open an issue][4] if you find any bug or have any suggestion.

[1]: https://en.wikipedia.org/wiki/Mental_poker
[2]: https://www.npmjs.com/package/mental-poker-toolkit
[3]: ./LICENSE
[4]: https://github.com/predatorray/mental-poker-toolkit/issues/new
[mental-texas-holdem]: https://github.com/predatorray/mental-texas-holdem
[API reference doc]: https://predatorray.github.io/mental-poker-toolkit
[PeerJS]: https://peerjs.com
