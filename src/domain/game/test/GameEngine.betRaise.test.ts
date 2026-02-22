import test from "node:test";
import assert from "node:assert/strict";
import { GameEngine } from "../GameEngine";
import { setup3PlayersHand } from "../helper/helper";
import { Action } from "../types/types";
import { Dealer } from "src/domain/dealer/Dealer";
import { Deck } from "src/domain/cards/Deck";

test("RAISE (raise-to) updates pot/currentBet/minRaise and commitments", () => {
  const { players, hand, dealer } = setup3PlayersHand();

  const beforePot = hand.pot;
  const beforeStack = players[0]!.stack;

  const action: Action = { playerId: "p1", type: "RAISE", amount: 30 };
  GameEngine.applyAction({ hand, action, dealer });

  assert.equal(players[0]!.stack, beforeStack - 30);
  assert.equal(players[0]!.committedThisStreet, 30);
  assert.equal(hand.pot, beforePot + 30);
  assert.equal(hand.currentBet, 30);
  assert.equal(hand.minRaise, 20);
  assert.equal(hand.toActIndex, 1);
});

test("CALL after raise pays correct toCall for SB and BB", () => {
  const { players, hand, dealer } = setup3PlayersHand();

  GameEngine.applyAction({
    hand,
    action: { playerId: "p1", type: "RAISE", amount: 30 },
    dealer,
  });

  const p2Before = players[1]!.stack;
  GameEngine.applyAction({
    hand,
    action: { playerId: "p2", type: "CALL" },
    dealer,
  });
  assert.equal(players[1]!.stack, p2Before - 25);
  assert.equal(players[1]!.committedThisStreet, 30);

  const p3Before = players[2]!.stack;
  GameEngine.applyAction({
    hand,
    action: { playerId: "p3", type: "CALL" },
    dealer,
  });
  assert.equal(players[2]!.stack, p3Before - 20);
  assert.equal(players[2]!.committedThisStreet, 30);

  assert.equal(hand.currentBet, 30);
});

test("RAISE below minRaise throws", () => {
  const { hand, dealer } = setup3PlayersHand();

  const action: Action = { playerId: "p1", type: "RAISE", amount: 15 };
  assert.throws(
    () => GameEngine.applyAction({ hand, action, dealer }),
    /min raise/i,
  );
});

test("BET is allowed only when currentBet is 0", () => {
  const { players, hand, dealer } = setup3PlayersHand();

  assert.throws(
    () =>
      GameEngine.applyAction({
        hand,
        action: { playerId: "p1", type: "BET", amount: 20 },
        dealer,
      }),
    /bet/i,
  );

  hand.advanceStreet();
  for (const p of players) p.resetStreetCommitment();
  hand.setBettingState({ currentBet: 0, minRaise: hand.bigBlind });

  hand.setToActIndex(hand.smallBlindIndex);

  const beforePot = hand.pot;
  GameEngine.applyAction({
    hand,
    action: { playerId: players[hand.toActIndex]!.id, type: "BET", amount: 20 },
    dealer,
  });

  assert.equal(hand.currentBet, 20);
  assert.equal(hand.minRaise, 20);
  assert.equal(hand.pot, beforePot + 20);
});
