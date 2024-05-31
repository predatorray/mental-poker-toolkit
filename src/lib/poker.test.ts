import test from 'ava';

import {
  decodeStandardCard,
  encodeStandardCard,
  getStandard52Deck,
  StandardCard,
} from './poker';

test('decord and encoding SQ', (t) => {
  const sq: StandardCard = {
    suit: 'Spade',
    rank: 'Q',
  };
  const encoded = encodeStandardCard(sq);
  const decorded = decodeStandardCard(encoded);
  t.deepEqual(decorded, sq);
});

test('decord and encoding 52 standard deck', (t) => {
  const deck = getStandard52Deck();
  const encodedAndDecordedDeck = deck.map((card) => {
    const encoded = encodeStandardCard(card);
    return decodeStandardCard(encoded);
  });

  t.deepEqual(deck, encodedAndDecordedDeck);
});
