import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { render, cleanup, waitFor, act } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { ToastProvider } from "../components/layout/Toast";
import { loadState } from "../lib/api/demo-store";

import { Home } from "./Home";
import { Torneos } from "./Torneos";
import { Categorias, Categoria } from "./Categorias";
import { Perfil } from "./Perfil";
import { Ranking } from "./Ranking";
import { MisTorneos } from "./MisTorneos";
import { Organizaciones } from "./Organizaciones";
import { Organizar } from "./Organizar";
import { CrearTorneo } from "./CrearTorneo";
import { Configuracion } from "./Configuracion";
import { Billetera } from "./Billetera";
import { Menu } from "./Menu";
import { Notificaciones } from "./Notificaciones";
import { Login } from "./Login";
import { Registro } from "./Registro";
import { DetalleTorneo } from "./DetalleTorneo";
import { Inscripcion } from "./Inscripcion";
import { Cuadro } from "./Cuadro";
import { Clasificacion } from "./Clasificacion";
import { Confirmacion } from "./Confirmacion";
import { Resultado } from "./Resultado";

function newClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: 0 } } });
}

function renderScreen(path: string, screen: ReactNode, routePath = path) {
  return render(
    <QueryClientProvider client={newClient()}>
      <MemoryRouter initialEntries={[path]}>
        <ToastProvider>
          <Routes>
            <Route path={routePath} element={screen} />
          </Routes>
        </ToastProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  cleanup();
});

describe("smoke: cada pantalla monta con los providers reales", () => {
  type ScreenCase = [string, ReactNode, string?];
  const cases: ScreenCase[] = [
    ["/home", <Home />],
    ["/torneos", <Torneos />],
    ["/torneos?juego=fifa26", <Torneos />, "/torneos"],
    ["/juegos", <Categorias />],
    ["/juegos/fifa26", <Categoria />],
    ["/perfil", <Perfil />],
    ["/ranking", <Ranking />],
    ["/ranking/valorant", <Ranking />],
    ["/mis-torneos", <MisTorneos />],
    ["/organizaciones", <Organizaciones />],
    ["/organizar", <Organizar />],
    ["/organizar/crear", <CrearTorneo />],
    ["/configuracion", <Configuracion />],
    ["/billetera", <Billetera />],
    ["/menu", <Menu />],
    ["/notificaciones", <Notificaciones />],
    ["/login", <Login />],
    ["/registro", <Registro />],
    ["/torneo/super-cup-fifa", <DetalleTorneo />],
    ["/torneo/super-cup-fifa/inscripcion", <Inscripcion />],
    ["/torneo/summer-cup-fifa26/cuadro", <Cuadro />],
    ["/torneo/summer-cup-fifa26/clasificacion", <Clasificacion />],
    ["/torneo/super-cup-fifa/confirmacion", <Confirmacion />],
    ["/torneo/summer-cup-fifa26/resultado/summer-cup-fifa26:m0", <Resultado />],
  ];

  it.each(cases)("ruta %s", async (path, node, routePath) => {
    const { container } = renderScreen(path, node, routePath);
    await act(async () => {});
    await waitFor(() => expect(container.textContent ?? "").not.toHaveLength(0));
    expect(container).toBeInstanceOf(HTMLElement);
  });
});

describe("Billetera", () => {
  it("recargar acredita saldo en el store y registra el movimiento", async () => {
    const { container } = renderScreen("/billetera", <Billetera />);
    const before = loadState().balance;

    const recargar = Array.from(container.querySelectorAll("button")).find((b) =>
      /Recargar \$/.test(b.textContent ?? ""),
    );
    expect(recargar).toBeDefined();
    const total = Number(recargar!.textContent!.match(/\$(\d+)/)![1]);

    act(() => recargar!.click());

    await waitFor(() => expect(loadState().balance).toBe(before + total), { timeout: 3000 });
    expect(loadState().wallet[0]).toMatchObject({ kind: "RECARGA", amount: total, success: true });
  });
});

describe("Menu", () => {
  it("cerrar sesión desautentica el store local", async () => {
    const { container } = renderScreen("/menu", <Menu />);
    await waitFor(() => expect(container.textContent ?? "").not.toHaveLength(0));

    const out = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.toLowerCase().includes("cerrar sesión"),
    );
    expect(out).toBeDefined();
    act(() => out!.click());
    await waitFor(() => expect(loadState().authenticated).toBe(false));
  });
});
