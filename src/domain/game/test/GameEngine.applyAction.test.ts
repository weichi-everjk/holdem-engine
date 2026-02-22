import test from "node:test";
import assert from "node:assert/strict";
import { GameEngine } from "../GameEngine";
import { setup3PlayersHand } from "../helper/helper";
import { Action } from "../types/types";
import { Dealer } from "src/domain/dealer/Dealer";
import { Deck } from "src/domain/cards/Deck";

test("throws if action is from wrong player", () => {
  const { hand, dealer } = setup3PlayersHand();

  const action: Action = { playerId: "p2", type: "CALL" };
  assert.throws(() => GameEngine.applyAction({ hand, action, dealer }));
});

test("CALL pays the correct toCall and updates pot and player commitment", () => {
  const { hand, players, dealer } = setup3PlayersHand();

  const beforePot = hand.pot;
  const beforeStack = players[0]!.stack;

  const action: Action = { playerId: "p1", type: "CALL" };
  GameEngine.applyAction({ hand, action, dealer });

  assert.equal(players[0]!.stack, beforeStack - 10);
  assert.equal(players[0]!.committedThisStreet, 10);
  assert.equal(hand.pot, beforePot + 10);

  assert.equal(hand.toActIndex, 1);
});

test("CHECK is rejected when facing a bet", () => {
  const { hand, dealer } = setup3PlayersHand();

  assert.throws(
    () =>
      GameEngine.applyAction({
        hand,
        action: { playerId: "p1", type: "CHECK" },
        dealer,
      }),
    /check/i,
  );
});

test("CHECK is allowed when toCall is 0", () => {
  const { hand, dealer } = setup3PlayersHand();

  GameEngine.applyAction({
    hand,
    action: { playerId: "p1", type: "CALL" },
    dealer,
  });

  assert.throws(
    () =>
      GameEngine.applyAction({
        hand,
        action: { playerId: "p2", type: "CHECK" },
        dealer,
      }),
    /check/i,
  );

  GameEngine.applyAction({
    hand,
    action: { playerId: "p2", type: "CALL" },
    dealer,
  });

  const beforePot = hand.pot;

  GameEngine.applyAction({
    hand,
    action: { playerId: "p3", type: "CHECK" },
    dealer,
  });

  assert.equal(hand.pot, beforePot);
});

test("FOLD marks player folded and advances to next active player", () => {
  const { players, hand, dealer } = setup3PlayersHand();

  GameEngine.applyAction({
    hand,
    action: { playerId: "p1", type: "FOLD" },
    dealer,
  });

  assert.equal(players[0]!.status, "FOLDED");
  assert.equal(hand.toActIndex, 1);
});

test("advance skips folded players", () => {
  const { players, hand, dealer } = setup3PlayersHand();

  GameEngine.applyAction({
    hand,
    action: { playerId: "p1", type: "FOLD" },
    dealer,
  });
  assert.equal(hand.toActIndex, 1);

  GameEngine.applyAction({
    hand,
    action: { playerId: "p2", type: "FOLD" },
    dealer,
  });

  assert.equal(players[1]!.status, "FOLDED");
  assert.equal(hand.street, "SHOWDOWN");
});
