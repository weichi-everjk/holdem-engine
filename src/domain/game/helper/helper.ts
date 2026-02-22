import { Player } from "src/domain/players/Playter";
import { GameEngine } from "../GameEngine";
import { HandState } from "../HandState";
import { Deck } from "src/domain/cards/Deck";

export function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

export const makePlayers = (n: number) =>
  Array.from(
    { length: n },
    (_, i) => new Player({ id: `p${i + 1}`, stack: 1000 }),
  );

export function setup3PlayersHand() {
  const players = makePlayers(3);
  const { hand, dealer } = GameEngine.startHand({
    handId: "h1",
    players,
    dealerIndex: 0,
    smallBlind: 5,
    bigBlind: 10,
    deck: new Deck().shuffle(),
  });
  return { hand, players, dealer };
}
