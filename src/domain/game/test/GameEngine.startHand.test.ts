import test from "node:test";
import assert from "node:assert/strict";
import { GameEngine } from "../GameEngine";
import { Deck } from "../../cards/Deck";
import { makePlayers } from "../helper/helper";

test("startHand posts blinds and deals hole cards (4 players)", () => {
  const players = makePlayers(4);
  const { hand } = GameEngine.startHand({
    handId: "h1",
    players,
    dealerIndex: 0,
    smallBlind: 5,
    bigBlind: 10,
    deck: new Deck().shuffle(),
  });

  assert.equal(hand.smallBlindIndex, 1);
  assert.equal(hand.bigBlindIndex, 2);

  assert.equal(hand.pot, 15);
  assert.equal(hand.currentBet, 10);
  assert.equal(hand.minRaise, 10);
  assert.equal(hand.toActIndex, 3);

  assert.equal(players[1]!.stack, 995);
  assert.equal(players[2]!.stack, 990);

  for (const p of players) {
    assert.ok(p.holeCards, `${p.id} missing hole cards`);
  }
});

test("startHand heads-up: dealer is SB, other is BB, SB acts first preflop", () => {
  const players = makePlayers(2);
  const { hand } = GameEngine.startHand({
    handId: "h1",
    players,
    dealerIndex: 0,
    smallBlind: 5,
    bigBlind: 10,
    deck: new Deck().shuffle(),
  });

  assert.equal(hand.smallBlindIndex, 0);
  assert.equal(hand.bigBlindIndex, 1);
  assert.equal(hand.pot, 15);

  assert.equal(hand.toActIndex, hand.smallBlindIndex);
});
