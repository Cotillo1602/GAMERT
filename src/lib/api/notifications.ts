import { isDemoMode } from "./utils";

export interface AppNotification {
  id: string;
  title: string;
  body?: string;
  read: boolean;
}

export async function listMine(): Promise<AppNotification[]> {
  if (isDemoMode()) return Promise.resolve([]);
  return Promise.resolve([]);
}

export async function unreadCount(): Promise<number> {
  if (isDemoMode()) return Promise.resolve(0);
  return Promise.resolve(0);
}

export async function markAllRead(): Promise<void> {
  if (isDemoMode()) return Promise.resolve();
  return Promise.resolve();
}
