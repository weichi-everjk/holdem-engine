import { Card } from "./Card";
import { RANKS, SUITS } from "./const/const";

export class Deck {
  private cards: Card[];
  private readonly rng: () => number;

  constructor(opts?: { rng?: () => number }) {
    this.rng = opts?.rng ?? Math.random;

    const cards: Card[] = [];
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        cards.push(new Card(rank, suit));
      }
    }
    this.cards = cards;
  }

  remaining(): number {
    return this.cards.length;
  }

  drawOne(): Card {
    if (this.cards.length === 0) throw new Error("Deck is empty");

    const card = this.cards.pop();
    if (!card) throw new Error("Deck is empty");

    return card;
  }

  draw(n: number): Card[] {
    if (!Number.isInteger(n)) throw new Error("draw(n) requires an integer");
    if (n < 0) throw new Error("draw(n) requires n >= 0");
    if (n > this.cards.length) {
      throw new Error(
        `Cannot draw ${n} cards from a deck of ${this.cards.length}`,
      );
    }

    const out: Card[] = [];
    for (let i = 0; i < n; i++) out.push(this.drawOne());
    return out;
  }

  shuffle(): this {
    // Fisher–Yates shuffle (unbiased)
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(this.rng() * (i + 1));
      const tmp = this.cards[i];
      this.cards[i] = this.cards[j]!;
      this.cards[j] = tmp!;
    }
    return this;
  }

  toArray(): readonly Card[] {
    return [...this.cards];
  }
}
