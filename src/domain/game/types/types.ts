export type Street = "PREFLOP" | "FLOP" | "TURN" | "RIVER" | "SHOWDOWN";
export type ActionType = "FOLD" | "CHECK" | "CALL" | "BET" | "RAISE";

export type Action = {
  playerId: string;
  type: ActionType;
  amount?: number;
};
