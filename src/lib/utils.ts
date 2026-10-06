export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** Formatea un número como moneda: 500 -> "$500", 70 -> "$70" */
export function money(value: number, decimals = false): string {
  const n = decimals ? value.toFixed(2) : String(value);
  return `$${n}`;
}

/** Fecha ISO -> "10 feb 2026" */
export function formatDate(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  const months = [
    "ene",
    "feb",
    "mar",
    "abr",
    "may",
    "jun",
    "jul",
    "ago",
    "sep",
    "oct",
    "nov",
    "dic",
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

/** Iniciales para los placeholders: "TORNEO SUMMER CUP" -> "TS" */
export function initials(text: string, max = 2): string {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, max)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

/** Hash estable -> número, para elegir colores de placeholder */
export function hash(text: string): number {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) | 0;
  return Math.abs(h);
}
