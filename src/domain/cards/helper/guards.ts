import { RANKS, SUITS } from "../const/const.js";
import type { Rank, Suit } from "../types/types.js";

const SUIT_SET = new Set(SUITS);
const RANK_SET = new Set(RANKS);
export function isSuit(suit: string): suit is Suit {
  return SUIT_SET.has(suit as Suit);
}

export function isRank(rank: string): rank is Rank {
  return RANK_SET.has(rank as Rank);
}
