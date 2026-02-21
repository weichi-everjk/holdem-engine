import test from "node:test";
import assert from "node:assert/strict";
import { Deck } from "../Deck";
import { RANKS, SUITS } from "../const/const";

test("Deck constructor builds a standard 52-card deck", () => {
  const deck = new Deck();
  const cards = deck.toArray();
  assert.equal(cards.length, 52);
});

test("Deck constructor contains exactly the expected set of cards", () => {
  const deck = new Deck();
  const cards = deck.toArray();

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

test("drawOne reduces remaining by 1", () => {
  const deck = new Deck();
  const before = deck.remaining();
  const card = deck.drawOne();

  assert.equal(deck.remaining(), before - 1);
  assert.ok(card.toString().length >= 2);
});

test("drawOne draws 52 unique cards", () => {
  const deck = new Deck();
  const drawn = new Set<string>();

  for (let i = 0; i < 52; i++) drawn.add(deck.drawOne().toString());

  assert.equal(drawn.size, 52);
  assert.equal(deck.remaining(), 0);
});

test("drawOne throws when deck is empty", () => {
  const deck = new Deck();
  for (let i = 0; i < 52; i++) deck.drawOne();
  assert.throws(() => deck.drawOne(), /Deck is empty/i);
});

test("Draw 5 cards using draw method returns length 5 and remaining becomes 47", () => {
  const deck = new Deck();
  const cards = deck.draw(5);

  assert.equal(deck.remaining(), 47);
  assert.equal(cards.length, 5);
});

test("Draw 0 card using draw method returns [] and remaining unchanged", () => {
  const deck = new Deck();
  const cards = deck.draw(0);

  assert.equal(deck.remaining(), 52);
  assert.equal(cards.length, 0);
});

test("Draw 53 card using draw method throws Error", () => {
  const deck = new Deck();
  assert.throws(() => deck.draw(53));
});

test("Draw 52 card using draw method gives 52 unique cards", () => {
  const deck = new Deck();
  const cards = deck.draw(52);

  const set = new Set(cards.map((c) => c.toString()));
  assert.equal(set.size, 52);
  assert.equal(deck.remaining(), 0);
});

test("draw(n) throws when n is not an integer", () => {
  const deck = new Deck();
  assert.throws(() => deck.draw(1.2), /integer/i);
});

test("draw(n) throws when n is negative", () => {
  const deck = new Deck();
  assert.throws(() => deck.draw(-1), /n >= 0/i);
});

test("shuffle keeps 52 cards and does not change the set of cards", () => {
  const deck = new Deck();

  const beforeCards = deck.toArray();
  const beforeSet = new Set(beforeCards.map((c) => c.toString()));
  assert.equal(beforeSet.size, 52);

  deck.shuffle();

  const afterCards = deck.toArray();
  const afterSet = new Set(afterCards.map((c) => c.toString()));

  assert.equal(deck.remaining(), 52);
  assert.equal(afterSet.size, 52);

  for (const c of beforeSet) {
    assert.ok(afterSet.has(c), `Missing card after shuffle: ${c}`);
  }
});

test("shuffle after drawing keeps remaining count and card set", () => {
  const deck = new Deck();

  const drawn = deck.draw(10);
  assert.equal(deck.remaining(), 42);

  const beforeShuffleSet = new Set(deck.toArray().map((c) => c.toString()));
  assert.equal(beforeShuffleSet.size, 42);

  deck.shuffle();

  const afterShuffleSet = new Set(deck.toArray().map((c) => c.toString()));
  assert.equal(deck.remaining(), 42);
  assert.equal(afterShuffleSet.size, 42);

  for (const c of beforeShuffleSet) {
    assert.ok(
      afterShuffleSet.has(c),
      `Missing remaining card after shuffle: ${c}`,
    );
  }

  const drawnSet = new Set(drawn.map((c) => c.toString()));
  for (const c of drawnSet) {
    assert.ok(
      !afterShuffleSet.has(c),
      `Drawn card still present after shuffle: ${c}`,
    );
  }
});
