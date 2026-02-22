import { Deck } from "../cards/Deck";
import { Dealer } from "../dealer/Dealer";
import { Player } from "../players/Playter";
import { HandState } from "./HandState";
import { mod } from "./helper/helper";
import { Action } from "./types/types";

export class GameEngine {
  static startHand(params: {
    handId: string;
    players: Player[];
    dealerIndex: number;
    smallBlind: number;
    bigBlind: number;
    deck?: Deck;
  }): { hand: HandState; dealer: Dealer } {
    const { handId, players, dealerIndex, smallBlind, bigBlind, deck } = params;

    for (const p of players) p.clearForNextHand();
    const hand = new HandState({
      handId,
      players,
      dealerIndex,
      smallBlind,
      bigBlind,
    });

    const dealer = new Dealer(deck);

    const playersIds = players.map((p) => p.id);
    const dealt = dealer.dealHoleCards(playersIds);

    for (const p of players) {
      const hole = dealt.get(p.id);
      if (!hole) throw new Error(`Missing hole cards for player ${p.id}`);
      p.setHoleCards(hole);
    }

    const sbPlayer = players[hand.smallBlindIndex]!;
    const bbPlayer = players[hand.bigBlindIndex]!;

    sbPlayer.commitToPot(smallBlind);
    hand.addToPot(smallBlind);

    bbPlayer.commitToPot(bigBlind);
    hand.addToPot(bigBlind);

    hand.setBettingState({ currentBet: bigBlind, minRaise: bigBlind });

    const n = players.length;
    const toAct =
      n === 2 ? hand.smallBlindIndex : mod(hand.bigBlindIndex + 1, n);
    hand.setToActIndex(toAct);

    hand.setLastAggressorIndex(hand.bigBlindIndex);
    hand.resetActedThisStreet();

    return { hand, dealer };
  }

  static applyAction(params: {
    hand: HandState;
    dealer: Dealer;
    action: Action;
  }): void {
    const { hand, action, dealer } = params;

    const players = hand.players as Player[];
    const actorIndex = players.findIndex((p) => p.id === action.playerId);
    if (actorIndex === -1)
      throw new Error(`Unknown playerId: ${action.playerId}`);

    if (actorIndex !== hand.toActIndex) throw new Error("Not your turn");

    const actor = players[actorIndex]!;
    if (actor.status !== "ACTIVE") throw new Error("Player is not active");

    const toCall = hand.currentBet - actor.committedThisStreet;

    switch (action.type) {
      case "FOLD": {
        actor.fold();
        hand.markActed(actor.id);
        break;
      }

      case "CHECK": {
        if (toCall !== 0) throw new Error("Cannot check when facing a bet");
        hand.markActed(actor.id);
        break;
      }

      case "CALL": {
        if (toCall < 0) throw new Error("Invalid call state");
        if (toCall > 0) {
          if (actor.stack < toCall)
            throw new Error("Insufficient stack to call");
          actor.commitToPot(toCall);
          hand.addToPot(toCall);
        }
        hand.markActed(actor.id);
        break;
      }

      case "BET": {
        if (hand.currentBet !== 0)
          throw new Error("Cannot bet when facing a bet (use RAISE)");

        const amount = action.amount;
        if (amount === undefined || amount === null)
          throw new Error("Must have an amount to BET");
        if (!Number.isInteger(amount) || amount <= 0)
          throw new Error("BET requires a positive integer amount");
        if (amount < hand.bigBlind)
          throw new Error("BET amount is below big blind");
        if (actor.stack < amount) throw new Error("Insufficient stack to bet");

        actor.commitToPot(amount);
        hand.addToPot(amount);

        hand.setBettingState({ currentBet: amount, minRaise: amount });
        hand.resetActedThisStreet();
        hand.markActed(actor.id);
        hand.setLastAggressorIndex(actorIndex);
        break;
      }

      case "RAISE": {
        if (hand.currentBet === 0)
          throw new Error("Cannot raise when there is no bet (use BET)");

        const raiseTo = action.amount;
        if (raiseTo === undefined || raiseTo === null)
          throw new Error("Must have an amount to RAISE");
        if (!Number.isInteger(raiseTo) || raiseTo <= 0)
          throw new Error("RAISE requires a positive integer raiseTo amount");
        if (raiseTo <= hand.currentBet)
          throw new Error("RAISE must be greater than current bet");

        const raiseSize = raiseTo - hand.currentBet;
        if (raiseSize < hand.minRaise)
          throw new Error("RAISE is below min raise");

        const delta = raiseTo - actor.committedThisStreet;
        if (delta <= 0) throw new Error("Invalid raise state");
        if (actor.stack < delta) throw new Error("Insufficient stack to raise");

        actor.commitToPot(delta);
        hand.addToPot(delta);

        hand.setBettingState({ currentBet: raiseTo, minRaise: raiseSize });
        hand.resetActedThisStreet();
        hand.markActed(actor.id);
        hand.setLastAggressorIndex(actorIndex);
        break;
      }

      default:
        throw new Error(`Action type not implemented yet: ${action.type}`);
    }

    if (GameEngine.isBettingRoundComplete(hand, players, actorIndex)) {
      GameEngine.advanceStreetAndDeal({ hand, dealer, players });
      return;
    }

    hand.setToActIndex(GameEngine.nextActiveIndex(players, actorIndex));
  }

  private static nextActiveIndex(players: Player[], fromIndex: number): number {
    const n = players.length;
    for (let step = 1; step <= n; step++) {
      const i = mod(fromIndex + step, n);
      if (players[i]!.status === "ACTIVE") return i;
    }
    return fromIndex;
  }

  private static isBettingRoundComplete(
    hand: HandState,
    players: Player[],
    actorIndex: number,
  ): boolean {
    const active = players.filter((p) => p.status === "ACTIVE");
    if (active.length <= 1) return true;

    if (hand.currentBet > 0) {
      const everyoneMatched = active.every(
        (p) => p.committedThisStreet === hand.currentBet,
      );
      return everyoneMatched && actorIndex === hand.lastAggressorIndex;
    }

    return active.every((p) => hand.hasActed(p.id));
  }

  private static firstToActPostflopIndex(
    hand: HandState,
    players: Player[],
  ): number {
    if (players.length === 2) return hand.bigBlindIndex;
    return hand.smallBlindIndex;
  }

  private static advanceStreetAndDeal(params: {
    hand: HandState;
    dealer: Dealer;
    players: Player[];
  }): void {
    const { hand, dealer, players } = params;

    const activeCount = players.filter((p) => p.status === "ACTIVE").length;
    if (activeCount <= 1) {
      while (hand.street !== "SHOWDOWN") hand.advanceStreet();
      return;
    }

    if (hand.street === "PREFLOP") {
      hand.advanceStreet();
      hand.addCommunityCards(dealer.dealFlop());
    } else if (hand.street === "FLOP") {
      hand.advanceStreet();
      hand.addCommunityCards([dealer.dealTurn()]);
    } else if (hand.street === "TURN") {
      hand.advanceStreet();
      hand.addCommunityCards([dealer.dealRiver()]);
    } else if (hand.street === "RIVER") {
      hand.advanceStreet();
      return;
    }

    for (const p of players) {
      if (p.status !== "OUT") p.resetStreetCommitment();
    }

    hand.resetStreetState();

    hand.setToActIndex(GameEngine.firstToActPostflopIndex(hand, players));
    hand.setLastAggressorIndex(hand.toActIndex);
  }
}
