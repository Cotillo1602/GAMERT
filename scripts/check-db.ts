/**
 * Valida la capa de base de datos sin Docker:
 *   npm run db:check
 *
 * 1. Crea un Postgres (PGlite) con stubs de auth/roles equivalentes a Supabase
 * 2. Aplica supabase/migrations/0001_init.sql y supabase/seed.sql
 * 3. Corre un smoke test de punta a punta: inscripción → cuadro → resultado →
 *    confirmación → ELO, más los caminos de error y las políticas RLS.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel: string) => readFileSync(path.join(ROOT, rel), "utf8");

let failures = 0;
const check = (label: string, ok: boolean, detail = "") => {
  if (ok) console.log(`  ✓ ${label}`);
  else {
    failures += 1;
    console.error(`  ✗ ${label}${detail ? ` — ${detail}` : ""}`);
  }
};

const STUBS = `
  create role anon nologin;
  create role authenticated nologin;
  create role service_role nologin;

  create schema auth;
  create table auth.users (
    id uuid primary key,
    instance_id uuid,
    aud text,
    role text,
    email text,
    encrypted_password text,
    email_confirmed_at timestamptz,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    created_at timestamptz,
    updated_at timestamptz
  );

  create function auth.uid()
  returns uuid language sql stable as $$
    select nullif(
      coalesce(
        current_setting('request.jwt.claim.sub', true),
        (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
      ), '')::uuid;
  $$;

  grant usage on schema public, auth to anon, authenticated, service_role;
  grant select on all tables in schema public to anon, authenticated, service_role;
  grant execute on all functions in schema public to anon, authenticated, service_role;
`;

async function main() {
  console.log("· arrancando Postgres (PGlite)");
  const db = new PGlite({ extensions: { pgcrypto } });

  await db.exec(STUBS);
  console.log("· stubs de auth/roles: ok");

  await db.exec(read("supabase/migrations/0001_init.sql"));
  console.log("· migración 0001_init.sql: ok");

  await db.exec(read("supabase/seed.sql"));
  console.log("· seed.sql: ok");

  const rows = async (sql: string, params?: unknown[]) =>
    (await db.query<{ [k: string]: unknown }>(sql, params)).rows;
  const one = async (sql: string, params?: unknown[]) => (await rows(sql, params))[0];

  /* ---------- integridad de los seeds ---------- */
  console.log("\n[Integridad]");
  const counts = (await one(
    `select (select count(*) from games) games,
            (select count(*) from organizations) orgs,
            (select count(*) from profiles) profiles,
            (select count(*) from elo_ratings) elo,
            (select count(*) from tournaments) torneos`,
  ))!;
  const num = (v: unknown) => Number(v);
  check(
    "7 juegos y 5 organizaciones",
    num(counts.games) === 7 && num(counts.orgs) === 5,
    `juegos=${counts.games} orgs=${counts.orgs}`,
  );
  check(
    "75 perfiles (70 jugadores + 5 publishers)",
    num(counts.profiles) === 75,
    String(counts.profiles),
  );
  check("13 torneos", num(counts.torneos) === 13, String(counts.torneos));
  check("ELO sembrado", num(counts.elo) > 100, String(counts.elo));

  const linked = (await one(
    `select count(*) n from tournaments t join profiles p on p.id = t.organizer_id`,
  ))!;
  check("todo torneo tiene organizador con perfil", num(linked.n) === 13, String(linked.n));

  const orphanElo = (await one(
    `select count(*) n from elo_ratings e left join profiles p on p.id = e.player_id where p.id is null`,
  ))!;
  check("todo ELO apunta a un perfil", num(orphanElo.n) === 0, String(orphanElo.n));

  /* ---------- sesión de prueba ---------- */
  const ranked = (await rows(
    `select p.id, e.rating from profiles p
       join elo_ratings e on e.player_id = p.id and e.game_id = 'fifa26'
      order by e.rating desc limit 2`,
  )) as { id: string; rating: number }[];
  const organizer = (await one(
    `select organizer_id from tournaments where id = 'super-cup-fifa'`,
  )) as { organizer_id: string };

  async function asUser<T>(uuid: string, fn: () => Promise<T>): Promise<T> {
    const claims = JSON.stringify({ sub: uuid, role: "authenticated" }).replace(/'/g, "''");
    await db.exec(
      `set role authenticated; select set_config('request.jwt.claims', '${claims}', false);`,
    );
    try {
      return await fn();
    } finally {
      await db.exec(`select set_config('request.jwt.claims', '', false); reset role;`);
    }
  }

  /* ---------- RLS ---------- */
  console.log("\n[RLS]");
  let anonBlocked = false;
  try {
    await db.exec(`set role anon; select count(*) from tournaments; reset role;`);
  } catch {
    anonBlocked = true;
    await db.exec(`reset role;`);
  }
  check("anon no lee tablas", anonBlocked);

  const visible = await asUser(ranked[0].id, async () => {
    const r = (await one(`select count(*) n from tournaments`))!;
    const notif = (await one(`select count(*) n from notifications`))!;
    return { torneos: Number(r.n), notifs: Number(notif.n) };
  });
  check("autenticado ve el catálogo", visible.torneos === 13);
  check("autenticado sólo ve sus notificaciones", visible.notifs === 0);

  /* ---------- ciclo de vida completo ---------- */
  console.log("\n[Ciclo de vida: inscribir → cuadro → resultado → ELO]");
  const tId = "super-cup-fifa";

  const join1 = (await asUser(ranked[0].id, () =>
    one(`select public.join_tournament($1) r`, [tId]),
  )) as { r: { ok: boolean; error?: string } };
  check("jugador A se inscribe", join1.r.ok === true, join1.r.error);

  const join2 = (await asUser(ranked[0].id, () =>
    one(`select public.join_tournament($1) r`, [tId]),
  )) as { r: { ok: boolean; error?: string } };
  check("doble inscripción rechazada", join2.r.ok === false && join2.r.error === "ALREADY_JOINED");

  const join3 = (await asUser(ranked[1].id, () =>
    one(`select public.join_tournament($1) r`, [tId]),
  )) as { r: { ok: boolean; error?: string } };
  check("jugador B se inscribe", join3.r.ok === true, join3.r.error);

  const start = (await asUser(organizer.organizer_id, () =>
    one(`select public.start_tournament($1) r`, [tId]),
  )) as { r: { ok: boolean; error?: string } };
  check("el organizador inicia y genera el cuadro", start.r.ok === true, JSON.stringify(start.r));

  const bracket = (await rows(
    `select id, round, round_label, a, b, status, winner_to, winner_slot, elo_snapshot
       from matches where tournament_id = $1 order by slot`,
    [tId],
  )) as {
    id: string;
    round: number;
    round_label: string;
    a: string | null;
    b: string | null;
    status: string;
    winner_to: string | null;
    elo_snapshot: unknown;
  }[];
  check("cuadro de 2 jugadores = una final", bracket.length === 1, `${bracket.length} partidas`);
  check("la final queda 'ready'", bracket[0]?.status === "ready");
  check("los dos participantes están sembrados", !!bracket[0]?.a && !!bracket[0]?.b);
  check("snapshot de ELO guardado", !!bracket[0]?.elo_snapshot);
  check("la final no avanza a ningún lado", bracket[0]?.winner_to === null);

  const matchId = bracket[0]!.id;
  const eloBefore = (await one(
    `select rating from elo_ratings where player_id = $1 and game_id = 'fifa26'`,
    [ranked[0].id],
  )) as { rating: number };

  const notParticipant = (await asUser(ranked[1].id, () =>
    one(`select public.report_result($1, 2, 0) r`, ["no-existe"]),
  )) as { r: { ok: boolean; error?: string } };
  check("reporte sobre partida inexistente falla", notParticipant.r.ok === false);

  const report = (await asUser(ranked[0].id, () =>
    one(`select public.report_result($1, 2, 0) r`, [matchId]),
  )) as { r: { ok: boolean; error?: string; needsConfirmation?: boolean } };
  check("A reporta 2-0", report.r.ok === true, JSON.stringify(report.r));
  check("pide confirmación del rival", report.r.needsConfirmation === true);

  const selfConfirm = (await asUser(ranked[0].id, () =>
    one(`select public.confirm_result($1) r`, [matchId]),
  )) as { r: { ok: boolean; error?: string } };
  check("A no puede confirmar su propio reporte", selfConfirm.r.ok === false);

  const confirm = (await asUser(ranked[1].id, () =>
    one(`select public.confirm_result($1) r`, [matchId]),
  )) as { r: { ok: boolean; error?: string; elo_delta_winner?: number } };
  check("B confirma el resultado", confirm.r.ok === true, JSON.stringify(confirm.r));

  const after = (await one(
    `select rating from elo_ratings where player_id = $1 and game_id = 'fifa26'`,
    [ranked[0].id],
  )) as { rating: number };
  check(
    "el ELO de A subió",
    Number(after.rating) > Number(eloBefore.rating),
    `${eloBefore.rating} → ${after.rating}`,
  );

  const finalMatch = (await one(`select status, tournament_id from matches where id = $1`, [
    matchId,
  ])) as { status: string };
  const tourney = (await one(`select status from tournaments where id = $1`, [tId])) as {
    status: string;
  };
  check("la final queda confirmada", finalMatch.status === "confirmed");
  check("el torneo termina", tourney.status === "finished");

  const events = (await one(`select count(*) n from match_events where match_id = $1`, [
    matchId,
  ])) as { n: string };
  check("auditoría de eventos registrada", Number(events.n) >= 2, String(events.n));

  const notifs = (await one(`select count(*) n from notifications where user_id = $1`, [
    ranked[0].id,
  ])) as { n: string };
  check("el ganador recibió avisos", Number(notifs.n) >= 2, String(notifs.n));

  /* ---------- creación de torneo ---------- */
  console.log("\n[Organización]");
  const canOrg = (await asUser(ranked[0].id, () =>
    one(`select public.can_organize($1) ok`, [ranked[0].id]),
  )) as { ok: boolean };
  check("el top player puede organizar", canOrg.ok === true);

  const create = (await asUser(ranked[0].id, () =>
    one(`select public.create_tournament($1) r`, [
      JSON.stringify({
        name: "Copa de prueba",
        game_id: "fifa26",
        slots: 8,
        date: "2026-12-31",
        time: "19:00",
        format: "eliminacion",
      }),
    ]),
  )) as { r: { ok: boolean; error?: string; id?: string } };
  check("crea un torneo", create.r.ok === true, JSON.stringify(create.r));

  const badSlots = (await asUser(ranked[0].id, () =>
    one(`select public.create_tournament($1) r`, [
      JSON.stringify({ name: "Malo", game_id: "fifa26", slots: 6, date: "2026-12-31" }),
    ]),
  )) as { r: { ok: boolean; error?: string } };
  check("slots que no son potencia de dos se rechazan", badSlots.r.error === "BAD_SLOTS");

  console.log(
    failures === 0
      ? "\nTODO OK — migración y smoke tests en verde"
      : `\n${failures} comprobación(es) fallida(s)`,
  );
  process.exitCode = failures === 0 ? 0 : 1;
  await db.close();
}

main().catch(async (err) => {
  console.error("\nERROR:", err instanceof Error ? err.message : err);
  process.exitCode = 1;
  process.exit(1);
});
