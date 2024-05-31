import test from 'ava';

import { EncodedDeck, Player } from './mental-poker';
import { encodeStandardCard, getStandard52Deck } from './poker';

for (const bits of [8, 16, 32, 64, 128]) {
  test(`standard mental poker (bits = ${bits})`, (t) => {
    const deck = getStandard52Deck();

    const alice = new Player({
      cards: deck.length,
      bits,
    });
    const deckEncoded = new EncodedDeck(
      deck.map((card) => BigInt(encodeStandardCard(card)))
    );
    const encryptedWithKeyA = alice.encryptAndShuffle(deckEncoded);

    const bob = new Player({
      cards: deck.length,
      publicKey: alice.publicKey,
      bits,
    });
    const encryptedWithKeyAKeyB = bob.encryptAndShuffle(encryptedWithKeyA);

    const encryptedWithIndividualKeyAKeyB = alice.decryptAndEncryptIndividually(
      encryptedWithKeyAKeyB
    );
    const encryptedBothKeysIndividually = bob.decryptAndEncryptIndividually(
      encryptedWithIndividualKeyAKeyB
    );

    const shuffledUnencryptedCards = encryptedBothKeysIndividually.cards
      .map((card, offset) =>
        alice.getIndividualEncryptionKey(offset).decrypt(card)
      )
      .map((card, offset) =>
        bob.getIndividualEncryptionKey(offset).decrypt(card)
      );

    const distinctCards = new Set(shuffledUnencryptedCards);
    t.is(distinctCards.size, 52);

    for (let i = 1; i <= 52; ++i) {
      t.true(distinctCards.has(BigInt(i)));
    }
  });
}
