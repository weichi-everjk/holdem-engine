import { GameEngine } from "./domain/game/GameEngine";
import { Deck } from "./domain/cards/Deck";
import { makePlayers } from "./domain/game/helper/helper";

GameEngine.startHand({
  handId: "h1",
  players: makePlayers(8),
  dealerIndex: 0,
  smallBlind: 5,
  bigBlind: 10,
  deck: new Deck().shuffle(),
});
