import { reverseObject } from './util';

export type Suit = 'Heart' | 'Diamond' | 'Club' | 'Spade';

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

export interface StandardCard {
  suit: Suit;
  rank: Rank;
}

export type StandardDeck = Array<StandardCard>;

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

export function encodeStandardCard(card: StandardCard): number {
  return (SuitEncoding[card.suit] - 1) * 13 + RankEncoding[card.rank];
}

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
