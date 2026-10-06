import { describe, expect, it } from "vitest";
import {
  BASE_ELO,
  eloTier,
  emptyElo,
  expectedScore,
  kFactor,
  marginMultiplier,
  rateMatch,
  type EloRecord,
} from "./elo";

function rec(over: Partial<EloRecord> = {}): EloRecord {
  return { ...emptyElo(), ...over };
}

describe("emptyElo", () => {
  it("arranca en el rating base sin partidas", () => {
    expect(emptyElo()).toEqual({
      rating: BASE_ELO,
      played: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      peak: BASE_ELO,
      streak: 0,
    });
  });
});

describe("kFactor", () => {
  it("es 40 durante el periodo de revelación (< 15 partidas)", () => {
    expect(kFactor(rec({ played: 0 }))).toBe(40);
    expect(kFactor(rec({ played: 14 }))).toBe(40);
  });

  it("es 32 en el tramo estable", () => {
    expect(kFactor(rec({ played: 20 }))).toBe(32);
    expect(kFactor(rec({ played: 40, rating: 1900 }))).toBe(32);
  });

  it("es 24 desde 30 partidas con rating >= 2000", () => {
    expect(kFactor(rec({ played: 30, rating: 2000 }))).toBe(24);
    expect(kFactor(rec({ played: 60, rating: 2400 }))).toBe(24);
  });
});

describe("expectedScore", () => {
  it("dos rating iguales se espera 50%", () => {
    expect(expectedScore(1500, 1500)).toBeCloseTo(0.5, 10);
  });

  it("un favorito de +400 se espera ~91%", () => {
    expect(expectedScore(1900, 1500)).toBeCloseTo(1 / 1.1, 10);
  });

  it("es simétrico", () => {
    expect(expectedScore(1700, 1550) + expectedScore(1550, 1700)).toBeCloseTo(1, 10);
  });
});

describe("marginMultiplier", () => {
  it("sin margen no escala", () => {
    expect(marginMultiplier(0)).toBe(1);
  });

  it("crece con el margen y queda acotado en 1.6", () => {
    expect(marginMultiplier(3)).toBeGreaterThan(marginMultiplier(1));
    expect(marginMultiplier(100_000)).toBeLessThanOrEqual(1.6);
  });
});

describe("rateMatch", () => {
  it("el ganador sube y el perdedor baja la misma cantidad (empates de rating)", () => {
    const { a, b, updates } = rateMatch(rec({ played: 20 }), rec({ played: 20 }), 2, 0);
    expect(updates.winner.delta).toBeGreaterThan(0);
    expect(updates.loser.delta).toBeLessThan(0);
    expect(updates.winner.delta + updates.loser.delta).toBe(0);
    expect(a.rating).toBe(1500 + updates.winner.delta);
    expect(b.rating).toBe(1500 + updates.loser.delta);
  });

  it("el rating total del sistema se conserva", () => {
    const before = 1500 + 1750;
    const { a, b } = rateMatch(rec({ played: 20 }), rec({ played: 60, rating: 1750 }), 1, 3);
    expect(a.rating + b.rating).toBe(before);
  });

  it("siempre mueve el rating aunque el favorito gane", () => {
    const { updates } = rateMatch(
      rec({ played: 40, rating: 2500 }),
      rec({ played: 40, rating: 1100 }),
      1,
      0,
    );
    expect(updates.winner.delta).toBeGreaterThanOrEqual(1);
    expect(updates.loser.delta).toBeLessThanOrEqual(-1);
  });

  it("acumula played, wins/losses, peak y racha", () => {
    const { a, b } = rateMatch(rec({ played: 3, wins: 2, streak: 2 }), rec({ played: 9 }), 2, 1);
    expect(a).toMatchObject({ played: 4, wins: 3, streak: 3, peak: a.rating });
    expect(b).toMatchObject({ played: 10, losses: 1, streak: -1 });
  });

  it("un empate suma played sin mover el rating entre pares iguales", () => {
    const { a, b } = rateMatch(rec({ played: 20 }), rec({ played: 20 }), 1, 1);
    expect(a.rating).toBe(1500);
    expect(b.rating).toBe(1500);
    expect(a.draws).toBe(1);
    expect(a.streak).toBe(0);
  });

  it("nunca baja de 100", () => {
    const { b } = rateMatch(
      rec({ played: 40, rating: 105 }),
      rec({ played: 40, rating: 2500 }),
      0,
      5,
    );
    expect(b.rating).toBeGreaterThanOrEqual(100);
  });

  it("una goleada mueve más que una victoria ajustada", () => {
    const blowout = rateMatch(rec({ played: 20 }), rec({ played: 20 }), 5, 0).updates.winner.delta;
    const tight = rateMatch(rec({ played: 20 }), rec({ played: 20 }), 1, 0).updates.winner.delta;
    expect(blowout).toBeGreaterThan(tight);
  });
});

describe("eloTier", () => {
  it("usa los umbrales del producto", () => {
    expect(eloTier(2250)).toMatchObject({ label: "GRANDE MAESTRO" });
    expect(eloTier(2050)).toMatchObject({ label: "MAESTRO" });
    expect(eloTier(1800)).toMatchObject({ label: "DIAMANTE" });
    expect(eloTier(1650)).toMatchObject({ label: "PLATA" });
    expect(eloTier(1450)).toMatchObject({ label: "BRONCE" });
    expect(eloTier(1200)).toMatchObject({ label: "NOVATO" });
  });
});
