import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { allTournaments } from "../../data/tournaments";
import {
  useCancelTournament,
  useCreateTournament,
  useEloPerGame,
  useJoinTournament,
  useMarkAllRead,
  useOrganizedBy,
  useRanking,
  useTournament,
  useTournaments,
  useUnreadCount,
} from "./hooks";

function wrapperFor(qc: QueryClient) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

function newClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("hooks TanStack Query sobre la capa API", () => {
  it("useTournaments lee el catálogo del demo-store", async () => {
    const { result } = renderHook(() => useTournaments(), { wrapper: wrapperFor(newClient()) });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(allTournaments().length);
  });

  it("useTournament resuelve un torneo por id", async () => {
    const { result } = renderHook(() => useTournament("super-cup-fifa"), {
      wrapper: wrapperFor(newClient()),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.id).toBe("super-cup-fifa");
  });

  it("useRanking expone filas con EloRecord completo y ordenado", async () => {
    const { result } = renderHook(() => useRanking("fifa26"), {
      wrapper: wrapperFor(newClient()),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const rows = result.current.data ?? [];
    expect(rows.length).toBeGreaterThan(3);
    expect(rows[0].elo.rating).toBeGreaterThanOrEqual(rows[rows.length - 1].elo.rating);
    expect(rows[0].elo.played).toBeTypeOf("number");
  });

  it("useJoinTournament muta e invalida el torneo y la lista", async () => {
    const qc = newClient();
    const wrap = wrapperFor(qc);

    const target = renderHook(() => useTournament("super-cup-fifa"), { wrapper: wrap });
    await waitFor(() => expect(target.result.current.data?.enrolled).toBe(10));

    const join = renderHook(() => useJoinTournament(), { wrapper: wrap });
    act(() => join.result.current.mutate({ tournamentId: "super-cup-fifa" }));
    await waitFor(() => expect(join.result.current.isSuccess).toBe(true));

    await waitFor(() => expect(target.result.current.data?.enrolled).toBe(11));
  });

  it("useMarkAllRead invalida el contador de no leídas", async () => {
    const qc = newClient();
    const wrap = wrapperFor(qc);

    const count = renderHook(() => useUnreadCount(), { wrapper: wrap });
    await waitFor(() => expect(count.result.current.data).toBe(2));

    const mark = renderHook(() => useMarkAllRead(), { wrapper: wrap });
    act(() => mark.result.current.mutate());
    await waitFor(() => expect(mark.result.current.isSuccess).toBe(true));

    await waitFor(() => expect(count.result.current.data).toBe(0));
  });

  it("useEloPerGame expone un EloRecord por juego para un jugador", async () => {
    const { result } = renderHook(() => useEloPerGame("u1"), {
      wrapper: wrapperFor(newClient()),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const me = result.current.data ?? [];
    expect(me.length).toBeGreaterThan(0);
    expect(me[0].gameId).toBeTypeOf("string");
    expect(me[0].elo.rating).toBeTypeOf("number");
  });

  it("useCreateTournament publica y lo expone en la lista del organizador", async () => {
    const qc = newClient();
    const wrap = wrapperFor(qc);

    const mine = renderHook(() => useOrganizedBy("u1"), { wrapper: wrap });
    await waitFor(() => expect(mine.result.current.isSuccess).toBe(true));
    const before = mine.result.current.data?.length ?? 0;

    const create = renderHook(() => useCreateTournament(), { wrapper: wrap });
    act(() =>
      create.result.current.mutate({
        name: "TEST CUP",
        gameId: "minecraft",
        format: "eliminacion",
        modality: "Virtual",
        date: "2099-01-01",
        time: "20:00",
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
      }),
    );
    await waitFor(() => expect(create.result.current.isSuccess).toBe(true));

    await waitFor(() => expect(mine.result.current.data?.length).toBe(before + 1));
    expect(mine.result.current.data?.[0].name).toBe("TEST CUP");
  });

  it("useCancelTournament finaliza el torneo y lo quita del cuadro", async () => {
    const qc = newClient();
    const wrap = wrapperFor(qc);

    const mine = renderHook(() => useOrganizedBy("u1"), { wrapper: wrap });
    await waitFor(() => expect(mine.result.current.isSuccess).toBe(true));
    const organized = mine.result.current.data ?? [];
    const target = organized[0];
    expect(target).toBeDefined();

    const cancel = renderHook(() => useCancelTournament(), { wrapper: wrap });
    act(() => cancel.result.current.mutate(target.id));
    await waitFor(() => expect(cancel.result.current.isSuccess).toBe(true));

    await waitFor(() => {
      const after = mine.result.current.data ?? [];
      expect(after.find((t) => t.id === target.id)?.status).toBe("finished");
    });
  });
});
