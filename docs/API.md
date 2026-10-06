# GAMERT — Contrato de API

> Toda lectura/escritura pasa por `src/lib/api/`. Las pantallas **nunca**
> llaman a `supabase-js` directamente ni importan `src/data/*`.

## 1. Endpoints de autenticación (Supabase Auth)

| Función                                   | Ubicación     | Comportamiento                                                   |
| ----------------------------------------- | ------------- | ---------------------------------------------------------------- |
| `signUp({email, password, name, handle})` | `api/auth.ts` | crea usuario + `profiles` (trigger), envía confirmación de email |
| `signIn({email, password})`               | `api/auth.ts` | devuelve sesión; se persiste en cookie/localStorage del SDK      |
| `signInWithGoogle()`                      | `api/auth.ts` | OAuth; redirige a `/home`                                        |
| `signOut()`                               | `api/auth.ts` | cierra sesión y limpia cache de TanStack Query                   |
| `getSession()` / `onAuthStateChange`      | `api/auth.ts` | consumido por `AuthProvider`                                     |

Modo demo (`isDemoMode()`): `signIn` acepta cualquier credencial y usa el
usuario `u1` de los seeds; `signUp` crea el usuario en `localStorage`.

## 2. RPC (Postgres, `SECURITY DEFINER`)

Todas devuelven `jsonb` con `{ok: boolean, error?: string, data?: ...}`.

### `join_tournament(p_tournament_id text)`

Valida en este orden: sesión, torneo `upcoming`, no ya inscrito, cupo libre,
ELO mínimo del `rules`, `organizer_id != auth.uid()`.
Efecto: inserta `registrations`, recalcula `enrolled`, notificación al
organizador.

### `leave_tournament(p_tournament_id text)`

Sólo antes de que el cuadro exista (`status = 'upcoming'` y 0 matches).

### `generate_bracket(p_tournament_id text)`

Autor: organizador o `admin`. Requiere `enrolled >= 2`.
Efecto (transaccional): calcula `bracketSizeFor(enrolled)` + byes, inserta
`matches` con `elo_snapshot` de cada participante, `status` inicial
(`ready` si ambos jugadores conocidos), `starts_at` desde `date`+`time`.
Idéntico a `generateBracket()`/`resolveByes()` de `src/lib/bracket.ts`.

### `report_result(p_match_id text, p_score_a int, p_score_b int, p_reason text default null)`

Autor: `a` o `b` del match. Exige `status in ('ready','live')` y
`needs_confirmation`. Efecto: `status='reported'`, `reported_by`,
notificación al rival. Si `rules.requireConfirmation = false`, encadena
automáticamente `confirm_result`.

### `confirm_result(p_match_id text)`

Autor: el rival del que reportó (o el reportante si no requiere
confirmación). Efecto en una transacción:

1. `status='confirmed'`, scores fijados.
2. Avance: escribe ganador en `winner_to`/`winner_slot`; si era la final,
   `tournaments.status='finished'`.
3. ELO: aplica la fórmula de `src/lib/elo.ts`
   (K-factor, expected score, margin multiplier) sobre `elo_ratings` de
   ambos, usando `elo_snapshot` como rating base.
4. `match_events` + notificaciones (`kind='elo'`) con el delta.

### `dispute_result(p_match_id text, p_reason text)`

Autor: el rival del reportante. `status='disputed'`, `disputed=true`, ELO
congelado, notifica a ambos y al organizador.

### `resolve_dispute(p_match_id text, p_winner uuid, p_score_a int, p_score_b int)`

Autor: organizador del torneo o `admin`. Cierra la disputa y ejecuta los
mismos pasos 1–4 de `confirm_result`; incrementa `disputes_lost` del perdedor.

### `forfeit_match(p_match_id text, p_loser uuid)`

Autor: organizador o `admin`. Otorga el partido al otro jugador (usado por
`auto_forfeit_on_disconnect` y por abandono).

### `start_tournament(p_tournament_id text)`

Autor: organizador. Cambia `status` a `live` y llama a `generate_bracket`
si no existe.

### `create_tournament(p_payload jsonb) -> text`

Autor: quien pase `can_organize(auth.uid())` (ADR-07). Valida slots
(potencia de 2 ≤ 64), `format = 'eliminacion'` en v1, fecha futura. Devuelve
el id generado.

### `cancel_tournament(p_tournament_id text)`

Autor: organizador o `admin`. Sólo sin matches confirmados; notifica a
inscritos.

### `mark_notifications_read()`

Marca todas las del usuario.

### `can_organize(p_user_id uuid) -> boolean`

Usada por `create_tournament` y por la UI para mostrar/ocultar CTA.

## 3. Lecturas (supabase-js vía `src/lib/api/`)

| Módulo                 | Consultas principales                                                                                                           |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `api/games.ts`         | `listGames()`, `getGame(id)`                                                                                                    |
| `api/tournaments.ts`   | `listTournaments({gameId, status})`, `getTournament(id)`, `listMyTournaments(userId)`, `listOrganizedBy(userId)`                |
| `api/registrations.ts` | `isJoined(tournamentId, userId)`, `participants(tournamentId)`, `joinTournament(tournamentId, userId?)`, `leaveTournament(...)` |
| `api/matches.ts`       | `bracketOf(tournamentId)` (ordenado por `slot`), `nextMatchFor(matches, playerId)`                                              |
| `api/standings.ts`     | `standingsOf(tournamentId)` → filas del podio (lógica de `standingsOf` de `bracket.ts`, calculada en cliente sobre los matches) |
| `api/elo.ts`           | `rankingFor(gameId)`, `eloOf(playerId, gameId)`                                                                                 |
| `api/players.ts`       | `getProfile(id)`, `searchPlayers(q)`                                                                                            |
| `api/notifications.ts` | `listMine()`, `unreadCount()`, `markAllRead()`                                                                                  |
| `api/settings.ts`      | `getSettings()`, `updateSetting(patch)` (claves snake_case de `profiles.settings`)                                              |

**Modo demo** (`isDemoMode()`, sin `VITE_SUPABASE_URL`): cada módulo opera sobre
`src/lib/api/demo-store.ts`, el mismo snapshot `gamert:state:v2` que usa
`AppContext`. Las escrituras pasan por `commitState()`, que guarda y publica el
evento `gamert:state-changed`; el `AppContext` se rehidrata al escucharlo y él
persiste con `saveState()` (sin evento), así que no hay bucles ni estados
divergentes entre la capa API y las pantallas.

Todas se exponen como hooks TanStack Query con `queryKey` canónica:

```
['tournaments', {gameId, status}]   ['tournament', id]
['bracket', tournamentId]           ['standings', tournamentId]
['ranking', gameId]                 ['profile', id]
['notifications']                   ['me']
```

Invalidación tras cada RPC: `queryClient.invalidateQueries({queryKey:['bracket', id]})`, etc.

## 4. Realtime

- Canal `notifications:<uid>` → nueva notificación sin refrescar.
- Canal `tournament:<id>` (matches) → el cuadro se actualiza en vivo para
  espectadores y participantes.

## 5. Errores

Las RPC devuelven `{ok:false, error:'CODE'}`. `src/lib/api/errors.ts` mapea
códigos a mensajes en español (ej. `SLOT_FULL` → "El torneo ya está lleno").
Los errores se muestran con el `Toast` existente (`components/layout/Toast`).

## 6. Versionado

- v1: contrato congelado en este archivo; cambios sólo vía PR que actualice
  este doc + `database.types.ts`.
- La generación de tipos (`npx supabase gen types`) corre en CI y falla el
  build si hay deriva.
