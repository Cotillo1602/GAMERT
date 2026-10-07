import { beforeEach, describe, expect, it, vi } from "vitest";
import { scheduleRounds } from "../../lib/bracket";
import { CURRENT_USER_ID, eloOf as baseElo, players } from "../../data/players";
import { allTournaments } from "../../data/tournaments";
import {
  STATE_CHANGED_EVENT,
  STORAGE_KEY,
  clearState,
  commitState,
  defaultState,
  eloRecord,
  loadState,
  onStateChanged,
  saveState,
} from "./demo-store";
import { getSession, signIn, signOut } from "./auth";
import { eloOf, rankingFor } from "./elo";
import type { Tournament } from "./tournaments";
import { bracketOf, confirmResult, nextMatchFor, reportResult, resolveDispute } from "./matches";
import { listMine, markAllRead, unreadCount } from "./notifications";
import { listPlayers, getProfile, searchPlayers } from "./players";
import { isJoined, joinTournament, leaveTournament, participants } from "./registrations";
import { getSettings, updateSetting } from "./settings";
import { standingsOf } from "./standings";
import { getTournament, listMyTournaments, listOrganizedBy, listTournaments } from "./tournaments";
import { autoStartDue } from "./scheduler";

beforeEach(() => {
  window.localStorage.clear();
});

describe("demo-store", () => {
  it("estado por defecto con los seeds del prototipo", () => {
    const s = loadState();
    expect(s.authenticated).toBe(false);
    expect(s.balance).toBe(250);
    expect(s.tournaments).toHaveLength(allTournaments().length);
    expect(s.registrations[CURRENT_USER_ID]).toContain("summer-cup-fifa26");
    expect(s.brackets["summer-cup-fifa26"]).toBeDefined();
    expect(s.brackets["summer-cup-fifa26"]!.length).toBeGreaterThan(0);
    expect(s.notifications).toHaveLength(4);
    expect(s.settings.pushNotifications).toBe(true);
  });

  it("guarda y rehidrata un snapshot parcial", () => {
    saveState({ ...defaultState(), balance: 999, tournaments: [] });
    const s = loadState();
    expect(s.balance).toBe(999);
    expect(s.tournaments).toHaveLength(0);
    expect(s.settings).toEqual(defaultState().settings);
    expect(s.notifications).toHaveLength(4);
  });

  it("un snapshot corrupto cae a los defaults", () => {
    window.localStorage.setItem(STORAGE_KEY, "{no-es-json");
    expect(loadState().tournaments).toHaveLength(allTournaments().length);
    expect(loadState().balance).toBe(250);
  });

  it("commitState persiste y publica el cambio", () => {
    const cb = vi.fn();
    const off = onStateChanged(cb);
    commitState((s) => ({ ...s, balance: 42 }));
    expect(cb).toHaveBeenCalledTimes(1);
    expect(loadState().balance).toBe(42);
    off();
    commitState((s) => ({ ...s, balance: 43 }));
    expect(cb).toHaveBeenCalledTimes(1);
    expect(loadState().balance).toBe(43);
    expect(STATE_CHANGED_EVENT).toBe("gamert:state-changed");
  });

  it("clearState elimina el snapshot", () => {
    saveState({ ...defaultState(), balance: 7 });
    clearState();
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(loadState().balance).toBe(250);
  });
});

describe("registrations", () => {
  it("lee inscripciones y participantes", async () => {
    expect(await isJoined("summer-cup-fifa26", CURRENT_USER_ID)).toBe(true);
    expect(await isJoined("summer-cup-fifa26", "u2")).toBe(false);
    expect(await participants("summer-cup-fifa26")).toContain(CURRENT_USER_ID);
  });

  it("inscribe, suma cupo y notifica", async () => {
    const before = (await getTournament("super-cup-fifa"))!.enrolled;
    const notificationsBefore = (await listMine()).length;

    const res = await joinTournament("super-cup-fifa");
    expect(res).toEqual({ ok: true });
    expect(await isJoined("super-cup-fifa", CURRENT_USER_ID)).toBe(true);
    expect((await getTournament("super-cup-fifa"))!.enrolled).toBe(before + 1);
    expect((await listMine()).length).toBe(notificationsBefore + 1);

    expect(await joinTournament("super-cup-fifa")).toEqual({
      ok: false,
      error: "ALREADY_JOINED",
    });
  });

  it("respeta el orden de validaciones de la RPC join_tournament", async () => {
    expect(await joinTournament("no-existe")).toEqual({ ok: false, error: "NOT_FOUND" });
    expect(await joinTournament("summer-cup-fifa26")).toEqual({ ok: false, error: "NOT_OPEN" });
    expect(await joinTournament("valorant-regional", "u3")).toEqual({
      ok: false,
      error: "ORGANIZER_CANNOT_JOIN",
    });
    expect(await joinTournament("fortnite-cup", "u99")).toEqual({
      ok: false,
      error: "ELO_TOO_LOW",
    });

    commitState((s) => ({
      ...s,
      tournaments: s.tournaments.map((t) =>
        t.id === "super-cup-fifa" ? { ...t, enrolled: t.slots } : t,
      ),
    }));
    expect(await joinTournament("super-cup-fifa")).toEqual({ ok: false, error: "SLOT_FULL" });
  });

  it("retira la inscripción y bloquea si el cuadro ya arrancó", async () => {
    expect(await leaveTournament("summer-cup-fifa26")).toEqual({
      ok: false,
      error: "BRACKET_STARTED",
    });
    await joinTournament("super-cup-fifa");
    expect(await leaveTournament("super-cup-fifa")).toEqual({ ok: true });
    expect(await isJoined("super-cup-fifa", CURRENT_USER_ID)).toBe(false);
    expect(await leaveTournament("super-cup-fifa")).toEqual({ ok: true });
  });
});

describe("matches", () => {
  it("bracketOf devuelve el cuadro ordenado por slot", async () => {
    const matches = await bracketOf("summer-cup-fifa26");
    expect(matches.length).toBeGreaterThan(0);
    const slots = matches.map((m) => m.slot);
    expect(slots).toEqual([...slots].sort((a, b) => a - b));
    expect(await bracketOf("no-existe")).toEqual([]);
  });

  it("nextMatchFor encuentra el próximo partido del jugador", async () => {
    const matches = scheduleRounds("t-demo", ["u1", "u2"], "2026-02-10T18:00:00");
    const m = await nextMatchFor(matches, "u1");
    expect(m).toBeDefined();
    expect(m?.a === "u1" || m?.b === "u1").toBe(true);
    expect(await nextMatchFor(matches, "nadie")).toBeUndefined();
  });
});

describe("match lifecycle (RPC demo)", () => {
  function seedLiveTournament(
    bestOf: Tournament["rules"]["bestOf"] = 3,
    requireConfirmation = true,
  ): string {
    const t: Tournament = {
      id: "t-test",
      name: "TEST CUP",
      gameId: "fifa26",
      organizerId: "u3",
      publisherTier: "comunidad",
      modality: "Virtual",
      format: "eliminacion",
      date: "2099-01-01",
      time: "20:00",
      timezone: "GMT-3",
      enrolled: 2,
      slots: 16,
      prize: { amount: 0, currency: "USD", kind: "ninguno", split: [0, 0, 0] },
      rules: {
        minElo: 0,
        maxParticipants: 16,
        requireConfirmation,
        disputeWindowMin: 24,
        autoForfeitOnDisconnect: true,
        bestOf,
        notes: "",
      },
      status: "live",
    };
    commitState((s) => ({
      ...s,
      tournaments: [t, ...s.tournaments],
      brackets: {
        ...s.brackets,
        "t-test": scheduleRounds("t-test", ["u1", "u2"], "2099-01-01T20:00:00"),
      },
    }));
    return "t-test";
  }

  it("reportar → confirmación del rival → ELO y cierre del torneo", async () => {
    seedLiveTournament();
    const m = (await bracketOf("t-test"))[0];
    expect(m.a).toBe("u1");
    const before = (await eloOf("u1", "fifa26")).rating;

    await reportResult({ matchId: m.id, scoreA: 2, scoreB: 0, reportedBy: "u1" });
    expect((await bracketOf("t-test"))[0].status).toBe("reported");

    await confirmResult(m.id);
    const after = (await bracketOf("t-test"))[0];
    expect(after.status).toBe("confirmed");
    expect((await eloOf("u1", "fifa26")).rating).toBeGreaterThan(before);
    expect((await getTournament("t-test"))?.status).toBe("finished");
    expect((await listMine()).length).toBeGreaterThan(0);
  });

  it("reportar sin confirmación cierra la partida y mueve el ELO", async () => {
    seedLiveTournament(3, false);
    const m = (await bracketOf("t-test"))[0];
    const before = (await eloOf("u2", "fifa26")).rating;
    await reportResult({ matchId: m.id, scoreA: 0, scoreB: 2, reportedBy: "u2" });
    expect((await bracketOf("t-test"))[0].status).toBe("confirmed");
    expect((await eloOf("u2", "fifa26")).rating).toBeGreaterThan(before);
  });

  it("impugnación congela el ELO y resolver lo libera", async () => {
    seedLiveTournament();
    const m = (await bracketOf("t-test"))[0];
    await reportResult({ matchId: m.id, scoreA: 2, scoreB: 0, reportedBy: "u1" });

    const before = (await eloOf("u1", "fifa26")).rating;
    await resolveDispute(m.id, "u1");
    const after = (await bracketOf("t-test"))[0];
    expect(after.status).toBe("confirmed");
    expect(after.reportReason).toContain("resuelto a favor de");
    expect((await eloOf("u1", "fifa26")).rating).toBeGreaterThan(before);
  });

  it("reporte de un jugador ajeno se ignora", async () => {
    seedLiveTournament();
    const m = (await bracketOf("t-test"))[0];
    await reportResult({ matchId: m.id, scoreA: 5, scoreB: 0, reportedBy: "u99" });
    expect((await bracketOf("t-test"))[0].status).toBe("ready");
  });
});

describe("elo", () => {
  it("ranking ordenado y coherente con el ELO base", async () => {
    const rows = await rankingFor("fifa26");
    expect(rows.length).toBeGreaterThan(3);
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i - 1].elo.rating).toBeGreaterThanOrEqual(rows[i].elo.rating);
    }
    const mine = rows.find((r) => r.playerId === CURRENT_USER_ID);
    expect(mine?.elo.rating).toBe(baseElo(CURRENT_USER_ID, "fifa26").rating);
    expect((await eloOf(CURRENT_USER_ID, "fifa26")).rating).toBe(mine?.elo.rating);
  });

  it("refleja los overrides del estado vivo", async () => {
    const current = eloRecord(loadState(), CURRENT_USER_ID, "fifa26");
    commitState((s) => ({
      ...s,
      eloOverrides: {
        ...s.eloOverrides,
        [`${CURRENT_USER_ID}:fifa26`]: { ...current, rating: 4000 },
      },
    }));
    expect((await eloOf(CURRENT_USER_ID, "fifa26")).rating).toBe(4000);
    const rows = await rankingFor("fifa26");
    expect(rows[0].playerId).toBe(CURRENT_USER_ID);
    expect(rows[0].elo.rating).toBe(4000);
  });
});

describe("notifications", () => {
  it("lista, cuenta no leídas y marca como leídas", async () => {
    expect(await listMine()).toHaveLength(4);
    expect(await unreadCount()).toBe(2);
    await markAllRead();
    expect(await unreadCount()).toBe(0);
    expect(loadState().notifications.every((n) => n.read)).toBe(true);
  });
});

describe("settings", () => {
  it("actualiza ajustes con las claves del backend", async () => {
    expect(await getSettings()).toEqual(defaultState().settings);
    await updateSetting({ sounds: true, push_notifications: false, language: true });
    expect(await getSettings()).toMatchObject({
      sounds: true,
      pushNotifications: false,
      language: true,
      profilePrivate: false,
    });
    expect(loadState().settings.sounds).toBe(true);
  });
});

describe("tournaments", () => {
  it("lista, filtra y resuelve torneos", async () => {
    const all = await listTournaments();
    expect(all).toHaveLength(allTournaments().length);

    const fifa = await listTournaments({ gameId: "fifa26" });
    expect(fifa.length).toBeGreaterThan(1);
    expect(fifa.every((t) => t.gameId === "fifa26")).toBe(true);

    const live = await listTournaments({ status: "live" });
    expect(live.length).toBeGreaterThan(0);
    expect(live.every((t) => t.status === "live")).toBe(true);

    expect(await getTournament("lol-open")).toBeDefined();
    expect(await getTournament("nope")).toBeUndefined();
  });

  it("mis torneos y torneos organizados", async () => {
    const mine = await listMyTournaments(CURRENT_USER_ID);
    expect(mine.map((t) => t.id)).toContain("summer-cup-fifa26");
    expect(mine).toHaveLength(1);

    const organized = await listOrganizedBy(CURRENT_USER_ID);
    expect(organized.map((t) => t.id).some((id) => id.startsWith("daily-fifa-cup"))).toBe(true);
    expect(organized.every((t) => t.organizerId === CURRENT_USER_ID)).toBe(true);
  });
});

describe("standings", () => {
  it("tabla del torneo a partir del cuadro vivo", async () => {
    const rows = await standingsOf("summer-cup-fifa26");
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((r) => typeof r.points === "number")).toBe(true);
    expect(await standingsOf("no-existe")).toEqual([]);
  });
});

describe("players", () => {
  it("búsqueda por nombre o handle", async () => {
    const all = await searchPlayers("");
    expect(all).toHaveLength(players.length);
    expect(await searchPlayers("t1cotillo")).toHaveLength(1);
    expect((await searchPlayers("t1cotillo"))[0].handle).toBe("@t1cotillo");
    expect(await searchPlayers("zzzz")).toHaveLength(0);
    expect(await getProfile(CURRENT_USER_ID)).toBeDefined();
    expect(await listPlayers()).toHaveLength(players.length);
  });
});

describe("auth", () => {
  it("la sesión demo vive en el mismo snapshot", async () => {
    expect(await getSession()).toBeNull();
    const session = await signIn("ana@gamert.dev", "x");
    expect(session.userId).toBe(CURRENT_USER_ID);
    expect(await getSession()).toMatchObject({ userId: CURRENT_USER_ID });
    expect(loadState().authenticated).toBe(true);
    await signOut();
    expect(await getSession()).toBeNull();
    expect(loadState().authenticated).toBe(false);
  });
});

describe("auto-start de torneos (scheduler)", () => {
  function seedUpcoming(id: string, date: string): void {
    commitState((s) => {
      const t: Tournament = {
        id,
        name: "START CUP",
        gameId: "fifa26",
        organizerId: "u3",
        publisherTier: "comunidad",
        modality: "Virtual",
        format: "eliminacion",
        date,
        time: "09:00",
        timezone: "GMT-3",
        enrolled: 2,
        slots: 8,
        prize: { amount: 0, currency: "USD", kind: "ninguno", split: [0, 0, 0] },
        rules: {
          minElo: 0,
          maxParticipants: 8,
          requireConfirmation: true,
          disputeWindowMin: 24,
          autoForfeitOnDisconnect: true,
          bestOf: 3,
          notes: "",
        },
        status: "upcoming",
      };
      return {
        ...s,
        authenticated: true,
        tournaments: [t, ...s.tournaments],
        registrations: { ...s.registrations, [CURRENT_USER_ID]: [id] },
      };
    });
  }

  it("siembra y publica el cuadro del torneo vencido en el que estoy", () => {
    seedUpcoming("t-start", "2020-01-01");
    autoStartDue();
    const s = loadState();
    expect(s.tournaments.find((t) => t.id === "t-start")?.status).toBe("live");
    expect(s.brackets["t-start"]).toHaveLength(7);
    expect(s.tournaments.find((t) => t.id === "t-start")?.phase).toBeDefined();
  });

  it("no arranca torneos futuros ni con sesión desautenticada", () => {
    seedUpcoming("t-futuro", "2099-01-01");
    commitState((s) => ({ ...s, authenticated: false }));

    const before = loadState().tournaments.find((t) => t.id === "t-futuro");
    expect(before?.status).toBe("upcoming");

    autoStartDue();
    const s = loadState();
    expect(s.tournaments.find((t) => t.id === "t-futuro")?.status).toBe("upcoming");
    expect(s.brackets["t-futuro"]).toBeUndefined();
  });
});
