import { Player } from "src/domain/players/Playter";

export function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

export const makePlayers = (n: number) =>
  Array.from(
    { length: n },
    (_, i) => new Player({ id: `p${i + 1}`, stack: 1000 }),
  );
