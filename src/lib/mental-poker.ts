import {
  generateShamirRivestAdleman,
  PublicKey,
  ShamirRivestAdleman,
} from './sra';
import { generateRandomInt } from './util';

/**
 * Deck of cards that are encoded in bigint.
 *
 * @remarks
 * the deck could be unencrypted, encrypted, or even double-encrypted.
 */
export class EncodedDeck {
  /**
   * Cards represented in bigint-s
   */
  public cards: bigint[];

  constructor(cards: bigint[]) {
    this.cards = cards;
  }

  /**
   * Encrypts all the cards of the deck by SRA key
   * @returns the encrypted deck
   */
  encrypt(sra: ShamirRivestAdleman): EncodedDeck {
    return new EncodedDeck(
      this.cards.map((card) => sra.encryptionKey.encrypt(card))
    );
  }

  /**
   * Encrypts all the cards of the deck individually using its corresponding SRA key
   * @param sra - an array of SRA keys whose length must be equal to the one of {@link EncodedDeck.cards}
   * @returns the encrypted deck
   */
  encryptIndividually(sra: ShamirRivestAdleman[]): EncodedDeck {
    return new EncodedDeck(
      this.cards.map((card, i) => sra[i].encryptionKey.encrypt(card))
    );
  }

  /**
   * Decrypts all the cards of the deck by SRA key
   * @returns the decrypted deck
   */
  decrypt(sra: ShamirRivestAdleman): EncodedDeck {
    return new EncodedDeck(
      this.cards.map((card) => sra.decryptionKey.decrypt(card))
    );
  }

  /**
   * Shuffles the deck randomly (Fisher–Yates shuffle)
   */
  shuffle(seed?: number) {
    seed = seed ?? generateRandomInt();
    for (let i = 0; i < this.cards.length - 1; ++i) {
      const j = i + (seed % (this.cards.length - i));
      if (i !== j) {
        const tmp = this.cards[i];
        this.cards[i] = this.cards[j];
        this.cards[j] = tmp;
      }
    }
  }
}

export class Player {
  private mainSraKey: ShamirRivestAdleman;
  private individualSraKeys: ShamirRivestAdleman[];

  constructor(props: {
    mainSraKey: ShamirRivestAdleman;
    individualSraKeys: ShamirRivestAdleman[];
  }) {
    this.mainSraKey = props.mainSraKey;
    this.individualSraKeys = props.individualSraKeys;
  }

  /**
   * Encrypts each card using the main SRA key and then shuffles
   */
  encryptAndShuffle(deckEncoded: EncodedDeck): EncodedDeck {
    const encryptedDeck = deckEncoded.encrypt(this.mainSraKey);
    encryptedDeck.shuffle();
    return encryptedDeck;
  }

  /**
   * Decrypts each card using the main SRA key, picks one encryption key for each card (A1, A2, etc.) and encrypts them individually.
   * @param deckDoubleEncrypted - the double encrypted deck
   * @returns the deck encrypted with individual SRA keys
   */
  decryptAndEncryptIndividually(deckDoubleEncrypted: EncodedDeck): EncodedDeck {
    // decrypts each card using the main SRA key
    // picks one encryption key for each card (A1, A2, etc.) and encrypts them individually.
    const deckSingleEncrypted = deckDoubleEncrypted.decrypt(this.mainSraKey);
    return deckSingleEncrypted.encryptIndividually(this.individualSraKeys);
  }

  /**
   * Retrieves the individual SRA key for the card at offset.
   * @param offset offset of the card
   * @returns the individual SRA key
   */
  getIndividualKey(offset: number) {
    return this.individualSraKeys[offset];
  }

  /**
   * The main public key
   */
  get publicKey() {
    return this.mainSraKey.publicKey;
  }
}

/**
 * Creates a mental poker player asynchrously
 *
 * @param props.cards - how many cards the deck has.
 * @param props.publicKey - the public key of the game (if absent, a new one will be generated)
 * @param props.bits - prime size in bits
 * @returns the player (asynchrously)
 */
export async function createPlayer(props: {
  cards: number;
  publicKey?: PublicKey;
  bits?: number;
}): Promise<Player> {
  const mainSraKey = await generateShamirRivestAdleman({
    bits: props.bits ?? 8,
    keys: props.publicKey,
  });
  const individualSraKeys = [];
  for (let i = 0; i < props.cards; ++i) {
    individualSraKeys.push(
      await generateShamirRivestAdleman({
        bits: props.bits ?? 8,
        keys: mainSraKey.publicKey,
      })
    );
  }
  return new Player({ mainSraKey, individualSraKeys });
}
