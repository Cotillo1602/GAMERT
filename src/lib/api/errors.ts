import { PostgrestError } from "@supabase/supabase-js";

export interface AppError {
  code: string;
  message: string;
}

const map: Record<string, string> = {
  UNAUTHENTICATED: "Inicia sesión para continuar",
  FORBIDDEN: "No tienes permisos para hacer esto",
  NOT_FOUND: "No se encontró el recurso",
  NOT_OPEN: "El torneo no está abierto",
  NOT_UPCOMING: "El torneo no está por iniciar",
  NOT_REPORTED: "El resultado aún no fue reportado",
  NOT_PARTICIPANT: "No eres participante del partido",
  ALREADY_JOINED: "Ya estás inscripto",
  SLOT_FULL: "El torneo ya está lleno",
  ELO_TOO_LOW: "Tu ELO es menor al mínimo requerido",
  ORGANIZER_CANNOT_JOIN: "El organizador no puede inscribirse",
  BRACKET_EXISTS: "Ya existe el cuadro",
  NOT_ENOUGH_PLAYERS: "No hay suficientes jugadores",
  TOO_MANY_PLAYERS: "Demasiados jugadores (máx. 64)",
  BAD_SLOTS: "Las plazas deben ser potencia de 2",
  MATCH_NOT_REPORTABLE: "No se puede reportar el resultado",
  INVALID_SCORE: "El marcador no es válido",
  AWAITING_RIVAL: "El rival debe confirmar",
  CANNOT_DISPUTE_OWN: "No puedes disputar tu propio reporte",
};

export function toAppError(
  e: PostgrestError | { code?: string; message?: string } | string,
): AppError {
  if (typeof e === "string") return { code: "UNKNOWN", message: e };
  const code = e.code ?? "UNKNOWN";
  const message = map[code] ?? e.message ?? "Error desconocido";
  return { code, message };
}
