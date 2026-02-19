import type { Rank, Suit } from "../types/types.js";

export const SUITS = ["♠", "♥", "♦", "♣"] as const satisfies readonly Suit[];
export const RANKS = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "T",
  "J",
  "Q",
  "K",
  "A",
] as const satisfies readonly Rank[];
