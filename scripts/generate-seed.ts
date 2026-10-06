/**
 * Genera supabase/seed.sql a partir de los seeds del frontend (ADR-10).
 * Uso: npm run seed:gen
 *
 * Los ids de usuario se mapean a uuids determinÃ­sticos para conservar los
 * enlaces internos; las contraseÃ±as de demo son pÃºblicas y sÃ³lo sirven para
 * el entorno local.
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

import { GAMES, type GameId } from "../src/data/games";
import { players } from "../src/data/players";
import { tournaments, dailySeries } from "../src/data/tournaments";
import { publishers } from "../src/data/app";

const DEMO_PASSWORD = "gamert1234";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(HERE, "../supabase/seed.sql");

const esc = (v: string) => `'${v.replace(/'/g, "''")}'`;
const q = (v: string) => `'${v}'`;
const json = (v: unknown) => `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;
const bool = (b: boolean) => (b ? "true" : "false");
const opt = (v: string | undefined | null) => (v == null || v === "" ? "null" : esc(v));

const userUuid = (id: string) => {
  const n = players.findIndex((p) => p.id === id) + 1;
  if (n === 0) throw new Error(`jugador desconocido: ${id}`);
  return `10000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
};

const publisherUuid = (id: string) => {
  const n = publishers.findIndex((p) => p.id === id) + 1;
  if (n === 0) throw new Error(`publisher desconocido: ${id}`);
  return `20000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
};

/** El organizador de un torneo puede ser un jugador o una cuenta editorial. */
const organizerUuid = (id: string) =>
  publishers.some((p) => p.id === id) ? publisherUuid(id) : userUuid(id);

const out: string[] = [];
const w = (line = "") => out.push(line);

w("-- ============================================================");
w("-- GAMERT â€” seed de desarrollo (generado con `npm run seed:gen`)");
w("-- NO usar en producciÃ³n: las contraseÃ±as de abajo son pÃºblicas.");
w("-- ============================================================");
w("begin;");
w("set local search_path = public, extensions, auth;");
w("");

/* ---------- catÃ¡logo ---------- */

w("-- organizations");
for (const p of publishers) {
  w(
    `insert into public.organizations (id, name, handle, tier, verified_prizes, followers, game_ids) values (${[
      esc(p.id),
      esc(p.name),
      esc(p.handle),
      esc(p.tier),
      bool(p.verifiedPrizes),
      String(p.followers),
      `array[${p.gameIds.map(esc).join(",")}]`,
    ].join(", ")});`,
  );
}
w("");

w("-- games");
for (const g of GAMES) {
  const pub = publishers.find((p) => p.gameIds.includes(g.id));
  w(
    `insert into public.games (id, name, short, icon, accent, description, popular, publisher, publisher_id) values (${[
      esc(g.id),
      esc(g.name),
      esc(g.short),
      esc(g.icon),
      esc(g.accent),
      esc(g.description),
      bool(!!g.popular),
      esc(g.publisher),
      pub ? opt(pub.id) : "null",
    ].join(", ")});`,
  );
}
w("");

/* ---------- usuarios demo ---------- */

w("-- usuarios de demo (email / contraseÃ±a: cualquier jugador @gamert.dev)");
for (const p of players) {
  const uuid = userUuid(p.id);
  const email = `${p.handle.replace(/^@/, "")}@gamert.dev`;
  w(
    [
      `insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,`,
      `  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (`,
      `  ${q(uuid)}, '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',`,
      `  ${esc(email)}, crypt(${esc(DEMO_PASSWORD)}, gen_salt('bf')), now(),`,
      `  '{"provider":"email","providers":["email"]}'::jsonb,`,
      `  ${json({ name: p.name, handle: p.handle })}, now(), now()`,
      `) on conflict (id) do nothing;`,
    ].join("\n"),
  );

  const org = p.organizer;
  w(
    `update public.profiles set main_game = ${opt(p.mainGame)}, scouted = ${bool(!!p.scouted)},` +
      ` joined = ${esc(p.joined)},` +
      ` organizer_tier = ${esc(org?.tier ?? "comunidad")},` +
      ` verified_prizes = ${bool(org?.verifiedPrizes ?? false)},` +
      ` disputes_lost = ${org?.disputesLost ?? 0},` +
      ` followers = ${org?.followers ?? 0},` +
      ` bio = ${opt(org?.bio)}` +
      ` where id = ${q(uuid)};`,
  );
}
w("");

/* ---------- cuentas editoriales ---------- */

w("-- cuentas editoriales (sin contraseÃ±a: no inician sesiÃ³n)");
for (const p of publishers) {
  const uuid = publisherUuid(p.id);
  w(
    [
      `insert into auth.users (id, instance_id, aud, role, email, email_confirmed_at,`,
      `  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (`,
      `  ${q(uuid)}, '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',`,
      `  ${esc(`${p.handle.replace(/^@/, "")}@gamert.dev`)}, now(),`,
      `  '{"provider":"email","providers":["email"]}'::jsonb,`,
      `  ${json({ name: p.name, handle: p.handle })}, now(), now()`,
      `) on conflict (id) do nothing;`,
    ].join("\n"),
  );
  w(
    `update public.profiles set is_publisher = true, organizer_tier = 'editorial',` +
      ` verified_prizes = true, followers = ${p.followers}, bio = null` +
      ` where id = ${q(uuid)};`,
  );
}
w("");

/* ---------- ELO ---------- */

w("-- ELO inicial por juego");
for (const p of players) {
  for (const [gameId, record] of Object.entries(p.elo) as [GameId, (typeof p.elo)[GameId]][]) {
    if (!record) continue;
    w(
      `insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values (${[
        q(userUuid(p.id)),
        esc(gameId),
        String(record.rating),
        String(record.played),
        String(record.wins),
        String(record.losses),
        String(record.draws),
        String(record.peak),
        String(record.streak),
      ].join(", ")}) on conflict (player_id, game_id) do nothing;`,
    );
  }
}
w("");

/* ---------- torneos ---------- */

w("-- torneos");
for (const t of tournaments) {
  w(
    `insert into public.tournaments (id, name, game_id, organizer_id, publisher_tier, modality, format, date, time, timezone, slots, prize, rules, status, phase, featured) values (${[
      esc(t.id),
      esc(t.name),
      esc(t.gameId),
      esc(organizerUuid(t.organizerId)),
      esc(t.publisherTier),
      esc(t.modality),
      esc(t.format),
      esc(t.date),
      esc(t.time),
      esc(t.timezone),
      String(t.slots),
      json(t.prize),
      json(t.rules),
      esc(t.status),
      opt(t.phase),
      bool(!!t.featured),
    ].join(", ")});`,
  );
}
w("");

w("-- series diarias");
for (const s of dailySeries) {
  w(
    `insert into public.daily_series (id, tournament_id, days, horizon_days) values (${[
      esc(s.id),
      esc(s.tournamentId),
      `array[${s.days.join(",")}]`,
      String(s.horizonDays),
    ].join(", ")});`,
  );
}
w("");

w("commit;");
w("");
writeFileSync(OUT, out.join("\n"), "utf8");
console.log(
  `seed.sql generado: ${OUT} (${players.length} jugadores, ${tournaments.length} torneos)`,
);
