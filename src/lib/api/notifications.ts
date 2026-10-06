import type { AppNotification } from "../../data/app";
import { commitState, loadState } from "./demo-store";
import { isDemoMode } from "./utils";

export type { AppNotification };

export async function listMine(): Promise<AppNotification[]> {
  return loadState().notifications;
}

export async function unreadCount(): Promise<number> {
  return loadState().notifications.filter((n) => !n.read).length;
}

export async function markAllRead(): Promise<void> {
  if (!isDemoMode()) return;
  commitState((s) => ({
    ...s,
    notifications: s.notifications.map((n) => ({ ...n, read: true })),
  }));
}
