# GAMERT — Esquema de base de datos (Supabase / Postgres)

> Migración viva en `supabase/migrations/`. Los ids se mantienen iguales a
> los seeds del frontend para no romper enlaces (`u1`, `fifa26`,
> `summer-cup-fifa26`). Decisión: ADR-10.

## 1. Entidades

```
auth.users ──1:1── profiles ──< elo_ratings >── games
                      │
                      ├──< registrations >── tournaments >── games
                      ├──< notifications                    │
                      └──< matches (como participante)      │
 tournaments ──1:1──< matches                                │
                                              organizations ┘
```

## 2. Tablas

### `profiles`

Extiende `auth.users` (1:1).

| Columna           | Tipo                                                                         | Notas                            |
| ----------------- | ---------------------------------------------------------------------------- | -------------------------------- |
| `id`              | `uuid` PK                                                                    | = `auth.users.id`                |
| `name`            | `text` not null                                                              | nombre visible                   |
| `handle`          | `text` unique not null                                                       | `@t1cotillo`                     |
| `main_game`       | `text` FK → `games.id`                                                       |                                  |
| `avatar_url`      | `text`                                                                       | Storage bucket `avatars`         |
| `joined`          | `date` default `now()`                                                       |                                  |
| `scouted`         | `boolean` default false                                                      | marca de scouting                |
| `role`            | `text` default `'player'` check in (`player`,`admin`)                        |                                  |
| `organizer_tier`  | `text` default `'comunidad'` check in (`comunidad`,`verificado`,`editorial`) |                                  |
| `verified_prizes` | `boolean` default false                                                      | puede ofrecer premio en efectivo |
| `disputes_lost`   | `int` default 0                                                              | baja la confianza (ADR-07)       |
| `followers`       | `int` default 0                                                              |                                  |
| `bio`             | `text`                                                                       |                                  |
| `settings`        | `jsonb` default `{"profile_private":false,...}`                              | vista `Configuracion`            |
| `is_publisher`    | `boolean` default false                                                      | cuenta editorial (seed)          |

Trigger: al crear un `auth.users`, insertar `profiles` con `name` y
`handle` derivados del metadata del registro.

### `games`

| Columna        | Tipo                                |
| -------------- | ----------------------------------- |
| `id`           | `text` PK (`fifa26`, `valorant`, …) |
| `name`         | `text`                              |
| `short`        | `text`                              |
| `icon`         | `text` (ícono del design system)    |
| `accent`       | `text` (color CSS)                  |
| `description`  | `text`                              |
| `popular`      | `boolean`                           |
| `publisher`    | `text`                              |
| `publisher_id` | `text` FK → `organizations`         |

### `organizations`

Cuentas editoriales (Riot, EA…) y comunidades.
`id`, `name`, `handle` unique, `tier` (`editorial`|`comunidad`),
`verified_prizes`, `followers`, `game_ids text[]`.

### `tournaments`

| Columna          | Tipo                                                                       | Notas                                                                                                      |
| ---------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `id`             | `text` PK                                                                  | ej. `summer-cup-fifa26`                                                                                    |
| `name`           | `text` not null                                                            |                                                                                                            |
| `game_id`        | `text` FK not null                                                         |                                                                                                            |
| `organizer_id`   | `uuid` FK → `profiles`                                                     |                                                                                                            |
| `publisher_tier` | `text`                                                                     | `editorial` \| `comunidad` (denormalizado para UI)                                                         |
| `modality`       | `text` check (`Virtual`,`Presencial`)                                      |                                                                                                            |
| `format`         | `text` check (`eliminacion`,`grupos`,`suizo`,`doble_eliminacion`)          | v1: sólo `eliminacion`                                                                                     |
| `date`           | `date` not null                                                            |                                                                                                            |
| `time`           | `text` not null                                                            | `18:00`                                                                                                    |
| `timezone`       | `text` default `America/Argentina/Buenos_Aires`                            |                                                                                                            |
| `slots`          | `int` not null                                                             | potencia de 2 ≤ 64                                                                                         |
| `enrolled`       | `int` default 0                                                            | se mantiene con trigger desde `registrations`                                                              |
| `prize`          | `jsonb` not null                                                           | `{amount, currency, kind, split}`                                                                          |
| `rules`          | `jsonb` not null                                                           | `{minElo, maxParticipants, requireConfirmation, disputeWindowMin, autoForfeitOnDisconnect, bestOf, notes}` |
| `status`         | `text` check (`upcoming`,`live`,`finished`,`cancelled`) default `upcoming` |
| `phase`          | `text`                                                                     | ronda visible                                                                                              |
| `featured`       | `boolean` default false                                                    |                                                                                                            |

Índices: `(game_id, status, date)`, `(organizer_id)`, `(status)` donde
`status = 'live'`.

### `daily_series` (v2, tabla creada en v1 para no migrar después)

`id`, `tournament_id` FK, `days int[]`, `horizon_days int`.
Materialización con `pg_cron` (v2).

### `registrations`

| Columna         | Tipo                                                 |
| --------------- | ---------------------------------------------------- |
| `id`            | `uuid` PK                                            |
| `tournament_id` | `text` FK, `on delete cascade`                       |
| `player_id`     | `uuid` FK → `profiles`                               |
| `status`        | `text` (`confirmed`,`cancelled`) default `confirmed` |
| `created_at`    | `timestamptz`                                        |

UNIQUE `(tournament_id, player_id)` → imposible doble inscripción.

### `matches`

Espejo exacto de `src/lib/bracket.ts` `Match`:

| Columna                     | Tipo                                                                      | Notas                           |
| --------------------------- | ------------------------------------------------------------------------- | ------------------------------- |
| `id`                        | `text` PK                                                                 | `m-<tournament>-<slot>`         |
| `tournament_id`             | `text` FK, cascade                                                        |                                 |
| `slot`                      | `int` not null                                                            | posición global monotónica      |
| `round`                     | `int` not null                                                            | 0 = primera ronda               |
| `round_label`               | `text`                                                                    | `Octavos de final`…             |
| `a`, `b`                    | `uuid` null FK → `profiles`                                               | `null` = bye/pendiente          |
| `elo_snapshot`              | `jsonb`                                                                   | ELO congelado al emparejamiento |
| `score_a`, `score_b`        | `int` null                                                                |                                 |
| `status`                    | `text` check (`pending`,`ready`,`live`,`reported`,`confirmed`,`disputed`) |
| `winner_to`                 | `text` null FK → `matches`                                                |                                 |
| `winner_slot`               | `text` null (`a`/`b`)                                                     |                                 |
| `reported_by`               | `uuid` null                                                               |                                 |
| `needs_confirmation`        | `boolean` default true                                                    |                                 |
| `disputed`                  | `boolean` default false                                                   |                                 |
| `report_reason`             | `text`                                                                    | motivo de disputa/forfeit       |
| `scheduled_at`, `starts_at` | `timestamptz`                                                             |                                 |

UNIQUE `(tournament_id, slot)`; índices por `(tournament_id, round, slot)`.

### `match_events` (auditoría)

`id`, `match_id` FK, `actor_id` FK, `kind`
(`report`,`confirm`,`dispute`,`resolve`,`forfeit`,`auto_confirm`),
`payload jsonb`, `created_at`. Nunca se borra.

### `elo_ratings`

| Columna                             | Tipo               |
| ----------------------------------- | ------------------ |
| `player_id`                         | `uuid` FK          |
| `game_id`                           | `text` FK          |
| `rating`                            | `int` default 1500 |
| `played`, `wins`, `losses`, `draws` | `int` default 0    |
| `peak`                              | `int` default 1500 |
| `streak`                            | `int` default 0    |
| `updated_at`                        | `timestamptz`      |

PK `(player_id, game_id)`. Índice `(game_id, rating desc)` para rankings.

### `notifications`

`id`, `user_id` FK, `title`, `body`, `kind`
(`torneo`,`pago`,`elo`,`sistema`), `game_id` null, `read` bool default false,
`date` timestamptz default `now()`.
Realtime: canal `notifications:user_id=<uuid>`.

## 3. Integridad de negocio (triggers)

1. **`enrolled`**: trigger en `registrations` que recalcula
   `tournaments.enrolled = count(*)` y bloquea si supera
   `rules->>'maxParticipants'`.
2. **Cupos**: `join_tournament` valida ELO mínimo contra `elo_ratings`
   antes de insertar.
3. **Avance de ganador**: al confirmarse un `match`, la RPC `report_result`
   escribe al `winner_to` en `winner_slot` (misma lógica que
   `advanceWinner()` de `src/lib/bracket.ts`).
4. **Fin de torneo**: si no quedan `matches` con status distinto de
   `confirmed`, la RPC pone `tournaments.status = 'finished'`.

## 4. Row Level Security (todas las tablas con RLS)

| Tabla                    | Lectura                                              | Escritura                                           |
| ------------------------ | ---------------------------------------------------- | --------------------------------------------------- |
| `profiles`               | autenticados                                         | propio (`id = auth.uid()`) o `admin`                |
| `games`, `organizations` | autenticados                                         | `admin`                                             |
| `tournaments`            | autenticados                                         | sólo vía RPC (o `admin`)                            |
| `registrations`          | autenticados (el roster es público dentro de la app) | sólo vía RPC `join_tournament` / `leave_tournament` |
| `matches`                | autenticados (el cuadro es público dentro de la app) | sólo vía RPC                                        |
| `match_events`           | autenticados                                         | insert sólo desde RPC                               |
| `elo_ratings`            | autenticados                                         | sólo vía RPC (ADR-04)                               |
| `notifications`          | dueño (`user_id = auth.uid()`)                       | dueño para `read`; insert desde RPC/server          |

Sin políticas de `anon`: sin sesión no hay lectura. Los grants base de lectura
(`grant select ... to authenticated`) viven en la migración §10 y tampoco se
otorgan a `anon`. Lectura pública del ranking sin login se habilita con una
`SECURITY DEFINER` `public_ranking(game_id)` en v1.1 si se decide mostrar
ranking sin registro.

## 5. Seeds (`supabase/seed.sql`)

Se generan desde `src/data` con `npm run seed:gen` (ADR-10: mismos ids que el
prototipo) y se validan con `npm run db:check`:

- `games` ← `src/data/games.ts` (7 juegos)
- `organizations` ← `publishers` de `src/data/app.ts` (5)
- `auth.users` + `profiles` ← `players.ts` (70 jugadores, password de dev
  `gamert1234`, **sólo para dev**; el trigger `handle_new_user` crea el perfil)
  y 5 perfiles de publishers (sin usuario)
- `elo_ratings` ← `Player.elo`
- `tournaments` ← `tournaments.ts` (13)
- `daily_series` ← series diarias de `tournaments.ts`

No se siembran `registrations` ni `matches`: el cuadro se genera en runtime
con `generate_bracket`.

## 6. Tipos generados

```bash
npm run types:gen      # desde la migración, sin Docker (PGlite)
# ó, con el stack local corriendo:
npx supabase gen types typescript --local > src/lib/api/database.types.ts
```

Se commitea el archivo: es el contrato que consume `src/lib/api/`. La CI lo
regenera y falla si no coincide con la migración.
