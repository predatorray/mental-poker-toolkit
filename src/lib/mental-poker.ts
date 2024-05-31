import { generateRandomInt } from './math';
import { decodeStandardCard, StandardDeck } from './poker';
import { PublicKey, ShamirRivestAldeman } from './sra';

export class EncodedDeck {
  public cards: bigint[];

  constructor(cards: bigint[]) {
    this.cards = cards;
  }

  encrypt(sra: ShamirRivestAldeman): EncodedDeck {
    return new EncodedDeck(
      this.cards.map((card) => sra.encryptionKey.encrypt(card))
    );
  }

  encryptIndividually(sra: ShamirRivestAldeman[]): EncodedDeck {
    return new EncodedDeck(
      this.cards.map((card, i) => sra[i].encryptionKey.encrypt(card))
    );
  }

  decrypt(sra: ShamirRivestAldeman): EncodedDeck {
    return new EncodedDeck(
      this.cards.map((card) => sra.decryptionKey.decrypt(card))
    );
  }

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

  convertToStandardDeck(): StandardDeck {
    return this.cards.map((card) => decodeStandardCard(Number(card)));
  }
}

export class Player {
  private mainSraKey: ShamirRivestAldeman;
  private individualSraKeys: ShamirRivestAldeman[];

  constructor(props: { cards: number; publicKey?: PublicKey; bits?: number }) {
    this.mainSraKey = new ShamirRivestAldeman({
      bits: props.bits ?? 8,
      keys: props.publicKey,
    });
    this.individualSraKeys = [];
    for (let i = 0; i < props.cards; ++i) {
      this.individualSraKeys.push(
        new ShamirRivestAldeman({
          bits: props.bits ?? 8,
          keys: this.mainSraKey.publicKey,
        })
      );
    }
  }

  encryptAndShuffle(deckEncoded: EncodedDeck): EncodedDeck {
    // encrypt each card using the main SRA key
    const encryptedDeck = deckEncoded.encrypt(this.mainSraKey);
    encryptedDeck.shuffle();
    return encryptedDeck;
  }

  decryptAndEncryptIndividually(deckDoubleEncrypted: EncodedDeck): EncodedDeck {
    // decrypts each card using the main SRA key
    // picks one encryption key for each card (A1, A2, etc.) and encrypts them individually.
    const deckSingleEncrypted = deckDoubleEncrypted.decrypt(this.mainSraKey);
    return deckSingleEncrypted.encryptIndividually(this.individualSraKeys);
  }

  getIndividualEncryptionKey(offset: number) {
    return this.individualSraKeys[offset];
  }

  get publicKey() {
    return this.mainSraKey.publicKey;
  }
}
