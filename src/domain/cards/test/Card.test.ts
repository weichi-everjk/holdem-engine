import test from "node:test";
import assert from "node:assert/strict";
import { Card } from "../Card";

test("Card.toString() returns rank+suit", () => {
  const card = new Card("A", "♠");
  assert.equal(card.toString(), "A♠");
});

test("Card.parse() parses a valid card string", () => {
  const card = Card.parse("T♥");
  assert.equal(card.rank, "T");
  assert.equal(card.suit, "♥");
});

test("Card.parse() trims whitespace", () => {
  const card = Card.parse("  K♦  ");
  assert.equal(card.toString(), "K♦");
});

test("Card.parse() throws on invalid rank", () => {
  assert.throws(() => Card.parse("1♠"));
});

test("Card.parse() throws on invalid suit", () => {
  assert.throws(() => Card.parse("A?"));
});

test("Card.equals() compares cards", () => {
  assert.ok(new Card("K", "♦").equals(new Card("K", "♦")));
  assert.ok(!new Card("K", "♦").equals(new Card("K", "♣")));
});
