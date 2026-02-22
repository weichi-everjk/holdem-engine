import { Deck } from "../cards/Deck";
import { Dealer } from "../dealer/Dealer";
import { Player } from "../players/Playter";
import { HandState } from "./HandState";
import { mod } from "./helper/helper";

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

    return { hand, dealer };
  }
}
