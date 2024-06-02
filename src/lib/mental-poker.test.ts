import test from 'ava';

import { createPlayer, EncodedDeck } from './mental-poker';
import { encodeStandardCard, getStandard52Deck } from './poker';
import { PublicKey } from './sra';

test(`standard mental poker`, async (t) => {
  const deck = getStandard52Deck();

  const publicKey = new PublicKey(7n, 13n);
  const alice = await createPlayer({
    cards: deck.length,
    bits: 8,
    publicKey,
  });
  const deckEncoded = new EncodedDeck(
    deck.map((card) => BigInt(encodeStandardCard(card)))
  );
  const encryptedWithKeyA = alice.encryptAndShuffle(deckEncoded);

  const bob = await createPlayer({
    cards: deck.length,
    publicKey: alice.publicKey,
    bits: 8,
  });
  const encryptedWithKeyAKeyB = bob.encryptAndShuffle(encryptedWithKeyA);

  const encryptedWithIndividualKeyAKeyB = alice.decryptAndEncryptIndividually(
    encryptedWithKeyAKeyB
  );
  const encryptedBothKeysIndividually = bob.decryptAndEncryptIndividually(
    encryptedWithIndividualKeyAKeyB
  );

  const shuffledUnencryptedCards = encryptedBothKeysIndividually.cards
    .map((card, offset) => alice.getIndividualKey(offset).decrypt(card))
    .map((card, offset) => bob.getIndividualKey(offset).decrypt(card));

  const distinctCards = new Set(shuffledUnencryptedCards);
  t.is(distinctCards.size, 52);

  for (let i = 1; i <= 52; ++i) {
    t.true(distinctCards.has(BigInt(i)));
  }
});
