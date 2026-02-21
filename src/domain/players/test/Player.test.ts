import test from "node:test";
import assert from "node:assert/strict";
import { Card } from "../../cards/Card";
import { Player } from "../Playter";

test("constructor sets defaults with no name", () => {
  const player = new Player({ id: "p1", stack: 1000 });

  assert.equal(player.id, "p1");
  assert.equal(player.stack, 1000);
  assert.equal(player.name, "p1");
  assert.equal(player.status, "ACTIVE");
  assert.equal(player.holeCards, null);
  assert.equal(player.committedThisStreet, 0);
  assert.equal(player.committedThisHand, 0);
});

test("constructor sets defaults with name", () => {
  const player = new Player({ id: "p1", stack: 1000, name: "Wei" });

  assert.equal(player.id, "p1");
  assert.equal(player.stack, 1000);
  assert.equal(player.name, "Wei");
  assert.equal(player.status, "ACTIVE");
  assert.equal(player.holeCards, null);
  assert.equal(player.committedThisStreet, 0);
  assert.equal(player.committedThisHand, 0);
});

test("constructor rejects invalid stack", () => {
  assert.throws(() => new Player({ id: "p1", stack: -1 }));
  assert.throws(() => new Player({ id: "p1", stack: Number.NaN }));
});

test("setHoleCards sets exactly two cards", () => {
  const player = new Player({ id: "p1", stack: 1000 });
  const c1 = new Card("A", "♠");
  const c2 = new Card("K", "♠");

  player.setHoleCards([c1, c2]);

  assert.ok(player.holeCards);
  assert.equal(player.holeCards[0].toString(), "A♠");
  assert.equal(player.holeCards[1].toString(), "K♠");
});

test("clearForNextHand clears hole cards and resets commitments and status", () => {
  const player = new Player({ id: "p1", stack: 1000 });
  player.setHoleCards([new Card("A", "♠"), new Card("K", "♠")]);
  player.commitToPot(10);
  player.fold();

  player.clearForNextHand();

  assert.equal(player.holeCards, null);
  assert.equal(player.status, "ACTIVE");
  assert.equal(player.committedThisStreet, 0);
  assert.equal(player.committedThisHand, 0);
});

test("debit reduces stack and throws if insufficient", () => {
  const player = new Player({ id: "p1", stack: 1000 });
  player.debit(20);

  assert.equal(player.stack, 1000 - 20);
  assert.throws(() => player.debit(1000), /insufficient/i);
});

test("credit increases stack", () => {
  const player = new Player({ id: "p1", stack: 1000 });
  player.credit(200);

  assert.equal(player.stack, 1000 + 200);
});

test("commitToPot reduces stack and increases commitments", () => {
  const player = new Player({ id: "p1", stack: 1000 });
  player.commitToPot(200);

  assert.equal(player.stack, 1000 - 200);
  assert.equal(player.committedThisHand, 200);
  assert.equal(player.committedThisStreet, 200);
});

test("fold updates status", () => {
  const player = new Player({ id: "p1", stack: 1000 });
  player.fold();

  assert.equal(player.status, "FOLDED");
});

test("resetStreetCommitment resets only committedThisStreet", () => {
  const player = new Player({ id: "p1", stack: 1000 });

  player.commitToPot(10);
  player.commitToPot(30);

  assert.equal(player.committedThisStreet, 40);
  assert.equal(player.committedThisHand, 40);

  player.resetStreetCommitment();

  assert.equal(player.committedThisStreet, 0);
  assert.equal(player.committedThisHand, 40);
  assert.equal(player.stack, 960);
});
