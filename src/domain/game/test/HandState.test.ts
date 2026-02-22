import test from "node:test";
import assert from "node:assert/strict";
import { HandState } from "../HandState";
import { Card } from "../../cards/Card";
import { makePlayers } from "../helper/helper";

test("constructor sets initial hand state", () => {
  const players = makePlayers(4);
  const hand = new HandState({
    handId: "h1",
    players,
    dealerIndex: 0,
    smallBlind: 5,
    bigBlind: 10,
  });

  assert.equal(hand.handId, "h1");
  assert.equal(hand.street, "PREFLOP");
  assert.equal(hand.players.length, 4);
  assert.equal(hand.communityCards.length, 0);
  assert.equal(hand.pot, 0);
  assert.equal(hand.currentBet, 0);
  assert.equal(hand.minRaise, 10);
});

test("blind indices are computed correctly (4 players)", () => {
  const players = makePlayers(4);
  const hand = new HandState({
    handId: "h1",
    players,
    dealerIndex: 0,
    smallBlind: 5,
    bigBlind: 10,
  });

  assert.equal(hand.smallBlindIndex, 1);
  assert.equal(hand.bigBlindIndex, 2);
});

test("blind indices are computed correctly (heads-up)", () => {
  const players = makePlayers(2);
  const hand = new HandState({
    handId: "h1",
    players,
    dealerIndex: 0,
    smallBlind: 5,
    bigBlind: 10,
  });

  assert.equal(hand.smallBlindIndex, 0);
  assert.equal(hand.bigBlindIndex, 1);
});

test("addCommunityCards appends and enforces max 5 cards", () => {
  const players = makePlayers(2);
  const hand = new HandState({
    handId: "h1",
    players,
    dealerIndex: 0,
    smallBlind: 5,
    bigBlind: 10,
  });

  hand.addCommunityCards([
    new Card("A", "♠"),
    new Card("K", "♣"),
    new Card("Q", "♦"),
  ]);
  assert.equal(hand.communityCards.length, 3);

  hand.addCommunityCards([new Card("2", "♠"), new Card("3", "♠")]);
  assert.equal(hand.communityCards.length, 5);

  assert.throws(() => hand.addCommunityCards([new Card("4", "♠")]), /max/i);
});

test("advanceStreet follows the correct order", () => {
  const players = makePlayers(2);
  const hand = new HandState({
    handId: "h1",
    players,
    dealerIndex: 0,
    smallBlind: 5,
    bigBlind: 10,
  });

  hand.advanceStreet();
  assert.equal(hand.street, "FLOP");
  hand.advanceStreet();
  assert.equal(hand.street, "TURN");
  hand.advanceStreet();
  assert.equal(hand.street, "RIVER");
  hand.advanceStreet();
  assert.equal(hand.street, "SHOWDOWN");

  assert.throws(() => hand.advanceStreet(), /already at showdown/i);
});
