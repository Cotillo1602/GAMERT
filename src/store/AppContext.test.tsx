import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { joinTournament } from "../lib/api/registrations";
import { markAllRead } from "../lib/api/notifications";
import { AppProvider, useApp } from "./AppContext";

function Probe() {
  const app = useApp();
  return (
    <div>
      <span data-testid="unread">{app.unreadCount}</span>
      <span data-testid="joined">{String(app.isJoined("super-cup-fifa"))}</span>
      <span data-testid="enrolled">
        {app.tournaments.find((t) => t.id === "super-cup-fifa")?.enrolled}
      </span>
      <span data-testid="settings">{String(app.settings.pushNotifications)}</span>
    </div>
  );
}

describe("AppContext sincronizado con la capa API", () => {
  afterEach(cleanup);

  beforeEach(() => {
    window.localStorage.clear();
  });

  it("arranca con el snapshot por defecto", () => {
    render(
      <AppProvider>
        <Probe />
      </AppProvider>,
    );
    expect(screen.getByTestId("unread")).toHaveTextContent("2");
    expect(screen.getByTestId("joined")).toHaveTextContent("false");
    expect(screen.getByTestId("enrolled")).toHaveTextContent("10");
    expect(screen.getByTestId("settings")).toHaveTextContent("true");
  });

  it("refleja los cambios publicados por commitState", async () => {
    render(
      <AppProvider>
        <Probe />
      </AppProvider>,
    );

    await act(async () => {
      await markAllRead();
    });
    expect(screen.getByTestId("unread")).toHaveTextContent("0");

    await act(async () => {
      await joinTournament("super-cup-fifa");
    });
    expect(screen.getByTestId("joined")).toHaveTextContent("true");
    expect(screen.getByTestId("enrolled")).toHaveTextContent("11");
  });
});
