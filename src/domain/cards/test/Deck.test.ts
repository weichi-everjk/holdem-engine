import test from "node:test";
import assert from "node:assert/strict";
import { Deck } from "../Deck";
import { RANKS, SUITS } from "../const/const";

test("Deck constructor builds a standard 52-card deck", () => {
  const deck = new Deck();
  const cards = (deck as any).cards as { toString(): string }[];

  assert.equal(cards.length, 52);
});

test("Deck constructor contains exactly the expected set of cards", () => {
  const deck = new Deck();
  const cards = (deck as any).cards as { toString(): string }[];

  const actual = new Set(cards.map((c) => c.toString()));

  const expected = new Set<string>();
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      expected.add(`${rank}${suit}`);
    }
  }

  assert.equal(actual.size, expected.size);

  for (const e of expected) {
    assert.ok(actual.has(e), `Missing card: ${e}`);
  }
});
