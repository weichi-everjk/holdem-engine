import { Card } from "../cards/Card";
import { PlayerStatus } from "./types/types";

export class Player {
  public readonly id: string;
  public readonly name?: string;

  public stack: number;
  public status: PlayerStatus;

  public holeCards: [Card, Card] | null;

  public committedThisStreet: number;
  public committedThisHand: number;

  constructor(params: { id: string; stack: number; name?: string }) {
    const { id, stack, name } = params;

    if (!id || id.trim().length === 0) {
      throw new Error("Player.id is required");
    }
    if (!Number.isFinite(stack) || stack < 0) {
      throw new Error("Player.stack must be a non-negative finite number");
    }

    this.id = id;
    this.name = name ?? id;
    this.stack = stack;

    this.status = "ACTIVE";
    this.holeCards = null;

    this.committedThisStreet = 0;
    this.committedThisHand = 0;
  }

  get isActive(): boolean {
    return this.status === "ACTIVE";
  }

  setHoleCards(cards: [Card, Card]): void {
    if (!cards?.[0] || !cards?.[1]) {
      throw new Error("setHoleCards requires exactly 2 cards");
    }
    this.holeCards = cards;
  }

  clearForNextHand(): void {
    this.status = "ACTIVE";
    this.holeCards = null;
    this.committedThisHand = 0;
    this.committedThisStreet = 0;
  }

  debit(amount: number): void {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("debit(amount) requires amount > 0");
    }
    if (amount > this.stack) {
      throw new Error("Insufficient stack");
    }

    this.stack -= amount;

    if (this.stack === 0 && this.status === "ACTIVE") {
      this.status = "ALL_IN";
    }
  }

  credit(amount: number): void {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("credit(amount) requires amount > 0");
    }
    this.stack += amount;
  }

  commitToPot(amount: number): void {
    this.debit(amount);
    this.committedThisStreet += amount;
    this.committedThisHand += amount;
  }

  fold(): void {
    if (this.status === "OUT") return;
    if (this.status === "FOLDED") return;
    this.status = "FOLDED";
  }

  resetStreetCommitment(): void {
    this.committedThisStreet = 0;
  }
}
