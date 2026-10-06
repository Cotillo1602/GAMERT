import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { allTournaments } from "../../data/tournaments";
import {
  useJoinTournament,
  useMarkAllRead,
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
});
