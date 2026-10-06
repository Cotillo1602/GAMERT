import { describe, expect, it } from "vitest";
import {
  advanceWinner,
  bracketSizeFor,
  canReport,
  championOf,
  finalOf,
  generateBracket,
  isBye,
  nextMatchFor,
  podiumOf,
  roundLabel,
  scheduleRounds,
  seedOrder,
  settleMatch,
  standingsOf,
  toRounds,
  tournamentFinished,
} from "./bracket";

const START = "2026-02-10T18:00:00";
const seeds = (n: number) => Array.from({ length: n }, (_, i) => `p${i + 1}`);

describe("bracketSizeFor", () => {
  it("redondea a la potencia de dos siguiente y acota en 64", () => {
    expect(bracketSizeFor(2)).toBe(2);
    expect(bracketSizeFor(3)).toBe(4);
    expect(bracketSizeFor(5)).toBe(8);
    expect(bracketSizeFor(8)).toBe(8);
    expect(bracketSizeFor(9)).toBe(16);
    expect(bracketSizeFor(65)).toBe(64);
  });
});

describe("seedOrder", () => {
  it("siembra 1 contra el último", () => {
    expect(seedOrder(2)).toEqual([1, 2]);
    expect(seedOrder(4)).toEqual([1, 4, 2, 3]);
    expect(seedOrder(8)).toEqual([1, 8, 4, 5, 2, 7, 3, 6]);
  });
});

describe("roundLabel", () => {
  it("nombra las rondas finales de un cuadro de 8", () => {
    expect(roundLabel(0, 8)).toBe("CUARTOS DE FINAL");
    expect(roundLabel(1, 8)).toBe("SEMIFINAL");
    expect(roundLabel(2, 8)).toBe("FINAL");
  });

  it("las rondas tempranas se numeran", () => {
    expect(roundLabel(0, 16)).toBe("RONDA 1");
  });
});

describe("generateBracket", () => {
  it("un cuadro lleno no tiene byes", () => {
    const m = generateBracket("t", seeds(8), START);
    expect(m).toHaveLength(7);
    expect(m.every((x) => !isBye(x))).toBe(true);
    expect(finalOf(m)?.id).toBe("t:m6");
    expect(finalOf(m)?.roundLabel).toBe("FINAL");
  });

  it("con cupos incompletos los byes de la primera ronda avanzan solos", () => {
    const m = generateBracket("t", seeds(5), START);
    expect(m).toHaveLength(7);

    const byes = m.filter((x) => x.round === 0 && isBye(x));
    expect(byes).toHaveLength(3);
    expect(byes.every((x) => x.status === "confirmed")).toBe(true);

    /* el cruce completo de la segunda ronda queda 'ready' en cuanto llegan
       los dos participantes (p2 y p3 vienen de byes) */
    const full = m.find((x) => x.id === "t:m5")!;
    expect(full).toMatchObject({ a: "p2", b: "p3", status: "ready" });

    /* la otra semifinal espera al ganador de un cruce real: NO es bye */
    const waiting = m.find((x) => x.id === "t:m4")!;
    expect(waiting).toMatchObject({ a: "p1", b: null, status: "pending" });
    expect(waiting.status).not.toBe("confirmed");
  });

  it("enlaza cada partido con su siguiente ronda", () => {
    const m = generateBracket("t", seeds(8), START);
    for (const match of m) {
      if (match.round === 2) {
        expect(match.winnerTo).toBeNull();
      } else {
        expect(match.winnerTo).toMatch(/^t:m\d+$/);
        expect(["a", "b"]).toContain(match.winnerSlot);
      }
    }
  });

  it("dos jugadores juegan una sola final", () => {
    const m = generateBracket("t", seeds(2), START);
    expect(m).toHaveLength(1);
    expect(m[0].roundLabel).toBe("FINAL");
    expect(m[0]).toMatchObject({ a: "p1", b: "p2", status: "ready" });
  });
});

describe("avance de ganadores", () => {
  it("advanceWinner lleva el ganador al cruce siguiente", () => {
    const m = generateBracket("t", seeds(4), START);
    const withScore = m.map((x) => (x.id === "t:m0" ? { ...x, scoreA: 2, scoreB: 1 } : x));
    const next = advanceWinner(withScore, "t:m0");
    const target = next.find((x) => x.id === "t:m2");
    expect(target?.a).toBe("p1");
    expect(target?.status).toBe("pending");
  });

  it("sin marcador no avanza nada", () => {
    const m = generateBracket("t", seeds(4), START);
    expect(advanceWinner(m, "t:m0")).toEqual(m);
  });
});

describe("torneo completo", () => {
  function playFull(): ReturnType<typeof generateBracket> {
    let m = generateBracket("t", seeds(4), START);
    m = m.map((x) => (x.id === "t:m0" ? { ...x, scoreA: 2, scoreB: 0 } : x));
    m = settleMatch(m, "t:m0");
    m = m.map((x) => (x.id === "t:m1" ? { ...x, scoreA: 1, scoreB: 2 } : x));
    m = settleMatch(m, "t:m1");
    const final = finalOf(m);
    expect(final?.status).toBe("ready");
    m = m.map((x) => (x.id === final!.id ? { ...x, scoreA: 3, scoreB: 1 } : x));
    return settleMatch(m, final!.id);
  }

  it("confirma la final y declara el torneo terminado", () => {
    const m = playFull();
    expect(tournamentFinished(m)).toBe(true);
    expect(championOf(m)).toBe("p1");
  });

  it("el podio sale del cuadro: campeón, finalista y semifinalista caído", () => {
    const [champ, second, third] = podiumOf(playFull());
    expect(champ).toBe("p1");
    expect(second).toBe("p3");
    expect(third).toBe("p4");
  });

  it("no termina si la final sigue pendiente", () => {
    expect(tournamentFinished(generateBracket("t", seeds(4), START))).toBe(false);
  });
});

describe("standingsOf", () => {
  it("ordena por victorias y luego por diferencia", () => {
    let m = generateBracket("t", seeds(4), START);
    m = m.map((x) =>
      x.id === "t:m0"
        ? { ...x, scoreA: 5, scoreB: 0 }
        : x.id === "t:m1"
          ? { ...x, scoreA: 1, scoreB: 2 }
          : x,
    );
    m = settleMatch(settleMatch(m, "t:m0"), "t:m1");

    const rows = standingsOf(m);
    expect(rows.map((r) => r.playerId)).toEqual(["p1", "p3", "p2", "p4"]);
    expect(rows[0]).toMatchObject({ playerId: "p1", wins: 1, played: 1, points: 5 });
  });

  it("ignora byes y partidas sin confirmar", () => {
    const m = generateBracket("t", seeds(5), START);
    expect(standingsOf(m)).toHaveLength(0);
  });
});

describe("partidas jugables", () => {
  it("nextMatchFor devuelve la próxima partida 'ready' del jugador", () => {
    const m = generateBracket("t", seeds(8), START);
    expect(nextMatchFor(m, "p1")?.id).toBe("t:m0");
    expect(nextMatchFor(m, "p9")).toBeUndefined();
  });

  it("canReport sólo para participantes de un cruce real y sin marcador", () => {
    const m = generateBracket("t", seeds(8), START);
    const match = m[0];
    expect(canReport(match, "p1")).toBe(true);
    expect(canReport(match, "p2")).toBe(false);
    expect(canReport({ ...match, scoreA: 1 }, "p1")).toBe(false);
  });

  it("los byes no se pueden reportar", () => {
    const m = generateBracket("t", seeds(5), START);
    const bye = m.find(isBye)!;
    expect(bye).toBeDefined();
    expect(canReport(bye, bye.a ?? bye.b!)).toBe(false);
  });
});

describe("scheduleRounds", () => {
  it("reparte 30 min por partido y 90 min por ronda", () => {
    const m = scheduleRounds("t", seeds(8), START);
    const first = m[0];
    const second = m[1];
    const semi = m.find((x) => x.round === 1)!;

    expect(new Date(first.startsAt).getTime()).toBe(new Date(START).getTime());
    expect(new Date(second.startsAt).getTime() - new Date(first.startsAt).getTime()).toBe(
      30 * 60_000,
    );
    expect(new Date(semi.startsAt).getTime() - new Date(first.startsAt).getTime()).toBe(
      90 * 60_000,
    );
  });
});

describe("toRounds", () => {
  it("agrupa y ordena por slot para renderizar", () => {
    const rounds = toRounds(generateBracket("t", seeds(8), START));
    expect(rounds).toHaveLength(3);
    expect(rounds.map((r) => r.label)).toEqual(["CUARTOS DE FINAL", "SEMIFINAL", "FINAL"]);
    expect(rounds[0].matches.map((m) => m.slot)).toEqual([0, 1, 2, 3]);
  });
});
