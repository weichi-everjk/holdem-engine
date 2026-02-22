import test from "node:test";
import assert from "node:assert/strict";
import { Dealer } from "../Dealer";
import { Deck } from "../../cards/Deck";

test("dealHoleCards gives each player exactly 2 cards, all unique", () => {
  const dealer = new Dealer(new Deck().shuffle());
  const ids = ["p1", "p2", "p3", "p4"];

  const hands = dealer.dealHoleCards(ids);

  assert.equal(hands.size, ids.length);

  const all = new Set<string>();
  for (const id of ids) {
    const hand = hands.get(id);
    assert.ok(hand, `Missing hand for ${id}`);
    const [c1, c2] = hand;

    assert.ok(c1 && c2);
    all.add(c1.toString());
    all.add(c2.toString());
  }

  assert.equal(all.size, ids.length * 2);
  assert.equal(dealer.remaining(), 52 - ids.length * 2);
});

test("dealFlop burns 1 then deals 3", () => {
  const dealer = new Dealer(new Deck().shuffle());
  const init = dealer.remaining();
  const flop = dealer.dealFlop();

  assert.equal(dealer.remaining(), init - 4);
  assert.equal(flop.length, 3);
});

test("dealTurn burns 1 then deals 1", () => {
  const dealer = new Dealer(new Deck().shuffle());
  const init = dealer.remaining();
  const turn = dealer.dealTurn();

  assert.equal(dealer.remaining(), init - 2);
  assert.ok(turn);
});

test("dealRiver burns 1 then deals 1", () => {
  const dealer = new Dealer(new Deck().shuffle());
  const init = dealer.remaining();
  const river = dealer.dealRiver();

  assert.equal(dealer.remaining(), init - 2);
  assert.ok(river);
});

test("full board + hole cards contains no duplicates", () => {
  const dealer = new Dealer(new Deck().shuffle());
  const ids = ["p1", "p2", "p3", "p4"];

  const hands = dealer.dealHoleCards(ids);
  const flop = dealer.dealFlop();
  const turn = dealer.dealTurn();
  const river = dealer.dealRiver();

  const all = new Set<string>();

  for (const id of ids) {
    const [c1, c2] = hands.get(id)!;
    all.add(c1.toString());
    all.add(c2.toString());
  }

  for (const c of flop) all.add(c.toString());
  all.add(turn.toString());
  all.add(river.toString());

  const expectedCount = ids.length * 2 + 3 + 1 + 1;
  assert.equal(all.size, expectedCount);
});

test("dealHoleCards throws if fewer than 2 players", () => {
  const dealer = new Dealer(new Deck());
  assert.throws(() => dealer.dealHoleCards(["p1"]), /at least 2/i);
});
