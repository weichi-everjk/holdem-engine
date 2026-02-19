import { Card } from "./Card";
import { RANKS, SUITS } from "./const/const";

export class Deck {
  private cards: Card[];

  constructor() {
    const cards: Card[] = [];
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        cards.push(new Card(rank, suit));
      }
    }
    this.cards = cards;
  }

  remaining() {
    return this.cards.length;
  }
}
