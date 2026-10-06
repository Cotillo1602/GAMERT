import type { AppError } from "./errors";
import type { Json } from "./database.types";

export type RpcResult<T = unknown> = { ok: true; data: T } | { ok: false; error: AppError };

export function jsonData<T = unknown>(j: Json | null | undefined): T {
  if (j === null || j === undefined) return j as T;
  return j as T;
}

export function notImplemented<T>(name: string): Promise<RpcResult<T>> {
  return Promise.resolve({
    ok: false,
    error: { code: "NOT_FOUND", message: `${name} no implementado en capa API` },
  });
}
