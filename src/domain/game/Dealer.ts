import type { Card } from "../cards/Card";
import { Deck } from "../cards/Deck";
import { PlayerId } from "../players/types/types";

export class Dealer {
  private readonly deck: Deck;

  constructor(deck?: Deck) {
    this.deck = deck ?? new Deck().shuffle();
  }

  burn(): void {
    this.deck.drawOne();
  }

  dealFlop(): Card[] {
    this.burn();
    return this.deck.draw(3);
  }

  dealTurn(): Card {
    this.burn();
    return this.deck.drawOne();
  }

  dealRiver(): Card {
    this.burn();
    return this.deck.drawOne();
  }

  dealHoleCards(playerIds: PlayerId[]): Map<PlayerId, [Card, Card]> {
    if (playerIds.length < 2)
      throw new Error("Need at least 2 players to deal");

    const firstPass = new Map<PlayerId, Card>();
    for (const id of playerIds) {
      firstPass.set(id, this.deck.drawOne());
    }

    const hands = new Map<PlayerId, [Card, Card]>();
    for (const id of playerIds) {
      const c1 = firstPass.get(id);
      if (!c1)
        throw new Error(`Internal error: missing first card for player ${id}`);
      const c2 = this.deck.drawOne();
      hands.set(id, [c1, c2]);
    }

    return hands;
  }

  remaining(): number {
    return this.deck.remaining();
  }
}
