import { reverseObject } from './util';

/**
 * Suit of a poker card.
 *
 * @remarks
 * can be one of `'Heart'`, `'Diamond'`, `'Club'` or `'Spade'`
 */
export type Suit = 'Heart' | 'Diamond' | 'Club' | 'Spade';

/**
 * Rank of a poker card.
 *
 * @remarks
 * e.g. `A`, `1`, `2`, ..., `9`, `T`, `J`, `Q`, `K`
 */
export type Rank =
  | 'A'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | 'T'
  | 'J'
  | 'Q'
  | 'K';

const SuitEncoding: { [key in Suit]: number } = {
  Heart: 1,
  Diamond: 2,
  Club: 3,
  Spade: 4,
};

const SuitDecoding: { [key: number]: Suit } = reverseObject(SuitEncoding);

const RankEncoding: { [key in Rank]: number } = {
  A: 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  T: 10,
  J: 11,
  Q: 12,
  K: 13,
};

const RankDecoding: { [key: number]: Rank } = reverseObject(RankEncoding);

/**
 * Standard poker card (52 cards)
 *
 * @remarks
 * for example, a Spade Ace is `{ suit: 'Spade', rank: 'A' }`
 */
export interface StandardCard {
  suit: Suit;
  rank: Rank;
}

/**
 * Deck of Standard poker card.
 */
export type StandardDeck = Array<StandardCard>;

/**
 * Returns a deck of standard 52 cards.
 */
export function getStandard52Deck(): StandardDeck {
  const standardDeck: StandardDeck = [];
  for (const suit in SuitEncoding) {
    for (const rank in RankEncoding) {
      standardDeck.push({
        suit: <Suit>suit,
        rank: <Rank>rank,
      });
    }
  }
  return standardDeck;
}

/**
 * Encodes a `StandardCard` into a number
 * @param card a `StandardCard` instance
 * @returns encoded number of the `StandardCard` (the value is always between 1 and 52)
 */
export function encodeStandardCard(card: StandardCard): number {
  return (SuitEncoding[card.suit] - 1) * 13 + RankEncoding[card.rank];
}

/**
 * Dncodes a number into a `StandardCard`
 * @param n the encoded number which was previouly returned from {@link encodeStandardCard}. it must be a number between 1 and 52
 */
export function decodeStandardCard(n: number): StandardCard {
  let rankCode = n % 13;
  if (rankCode === 0) {
    rankCode = 13;
  }
  const rank = RankDecoding[rankCode];

  const suitCode = Math.floor((n - 1) / 13) + 1;
  const suit = SuitDecoding[suitCode];

  return { suit, rank };
}
