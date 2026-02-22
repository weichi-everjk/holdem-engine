import { Card } from "../cards/Card";
import { Player } from "../players/Playter";
import { mod } from "./helper/helper";
import { Street } from "./types/types";

export class HandState {
  public readonly handId: string;
  public readonly players: readonly Player[];

  public readonly dealerIndex: number;
  public readonly smallBlind: number;
  public readonly bigBlind: number;

  private _street: Street = "PREFLOP";
  private _communityCards: Card[] = [];

  private _pot = 0;
  private _currentBet = 0;
  private _minRaise: number;

  private _toActIndex = 0;

  constructor(params: {
    handId: string;
    players: Player[];
    dealerIndex: number;
    smallBlind: number;
    bigBlind: number;
  }) {
    const { handId, players, dealerIndex, smallBlind, bigBlind } = params;

    if (!handId || handId.trim().length === 0)
      throw new Error("handId is required");
    if (players.length < 2) throw new Error("Need at least 2 players");
    if (
      !Number.isInteger(dealerIndex) ||
      dealerIndex < 0 ||
      dealerIndex >= players.length
    ) {
      throw new Error("Invalid dealerIndex");
    }
    if (!Number.isFinite(smallBlind) || smallBlind <= 0)
      throw new Error("Invalid smallBlind");
    if (!Number.isFinite(bigBlind) || bigBlind <= 0)
      throw new Error("Invalid bigBlind");
    if (bigBlind <= smallBlind)
      throw new Error("bigBlind must be greater than smallBlind");

    this.handId = handId;
    this.players = players;
    this.dealerIndex = dealerIndex;
    this.smallBlind = smallBlind;
    this.bigBlind = bigBlind;

    this._minRaise = bigBlind;
  }

  get street(): Street {
    return this._street;
  }

  get communityCards(): Card[] {
    return [...this._communityCards];
  }

  get pot(): number {
    return this._pot;
  }

  get currentBet(): number {
    return this._currentBet;
  }

  get minRaise(): number {
    return this._minRaise;
  }

  get toActIndex(): number {
    return this._toActIndex;
  }

  get smallBlindIndex(): number {
    const n = this.players.length;
    if (n === 2) return this.dealerIndex;
    return mod(this.dealerIndex + 1, n);
  }

  get bigBlindIndex(): number {
    const n = this.players.length;
    if (n === 2) return mod(this.dealerIndex + 1, n);
    return mod(this.dealerIndex + 2, n);
  }

  addCommunityCards(cards: Card[]): void {
    if (cards.length === 0) return;
    if (this._communityCards.length + cards.length > 5) {
      throw new Error("Community cards max is 5");
    }
    this._communityCards.push(...cards);
  }

  addToPot(amount: number): void {
    if (!Number.isFinite(amount) || amount <= 0)
      throw new Error("addToPot requires amount > 0");
    this._pot += amount;
  }

  setToActIndex(index: number): void {
    if (!Number.isInteger(index) || index < 0 || index >= this.players.length) {
      throw new Error("Invalid toActIndex");
    }
    this._toActIndex = index;
  }

  setBettingState(params: { currentBet: number; minRaise: number }): void {
    const { currentBet, minRaise } = params;
    if (!Number.isFinite(currentBet) || currentBet < 0)
      throw new Error("Invalid currentBet");
    if (!Number.isFinite(minRaise) || minRaise <= 0)
      throw new Error("Invalid minRaise");
    this._currentBet = currentBet;
    this._minRaise = minRaise;
  }

  advanceStreet(): void {
    switch (this._street) {
      case "PREFLOP":
        this._street = "FLOP";
        return;
      case "FLOP":
        this._street = "TURN";
        return;
      case "TURN":
        this._street = "RIVER";
        return;
      case "RIVER":
        this._street = "SHOWDOWN";
        return;
      case "SHOWDOWN":
        throw new Error("Already at showdown");
    }
  }
}
