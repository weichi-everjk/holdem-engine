import { isRank, isSuit } from "./helper/guards.js";
import type { Rank, Suit } from "./types/types.js";

export class Card {
  public readonly rank: Rank;
  public readonly suit: Suit;

  constructor(rank: Rank, suit: Suit) {
    if (!isRank(rank)) throw new Error(`Invalid rank: ${rank}`);
    if (!isSuit(suit)) throw new Error(`Invalid suit: ${suit}`);
    this.rank = rank;
    this.suit = suit;

    Object.freeze(this);
  }

  toString(): string {
    return `${this.rank}${this.suit}`;
  }

  static parse(input: string): Card {
    const trimmed = input.trim();
    if (trimmed.length < 2) throw new Error(`Invalid card string: "${input}"`);

    const rank = trimmed[0] ?? "";
    const suit = trimmed.slice(1);

    if (!isRank(rank)) throw new Error(`Invalid rank in "${input}"`);
    if (!isSuit(suit)) throw new Error(`Invalid suit in "${input}"`);

    return new Card(rank, suit);
  }

  equals(other: Card): boolean {
    return this.rank === other.rank && this.suit === other.suit;
  }
}
