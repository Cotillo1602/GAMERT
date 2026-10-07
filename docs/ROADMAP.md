# GAMERT — Roadmap

> Orden de ejecución. Cada fase termina con un entregable verificable.
> Dependencias: Fase 2 requiere Fase 1; Fase 3 requiere Fase 2, etc.

## Fase 0 — Documentación (✅)

| Entregable              | Estado |
| ----------------------- | ------ |
| `docs/ALCANCE.md`       | ✅     |
| `docs/ARQUITECTURA.md`  | ✅     |
| `docs/DATABASE.md`      | ✅     |
| `docs/API.md`           | ✅     |
| `docs/ROADMAP.md`       | ✅     |
| `docs/LEGAL.md`         | ✅     |
| `README.md` actualizado | ✅     |

**Criterio de salida:** el stack y el alcance aprobados por el equipo.

## Fase 1 — Fundamentos de ingeniería (✅)

| Tarea                                       | Notas                                                                       |
| ------------------------------------------- | --------------------------------------------------------------------------- |
| Repositorio git + `.gitignore` ampliado     | `.env`, `dist`, `*.tsbuildinfo`                                             |
| ESLint + Prettier + scripts `lint`/`format` | typescript-eslint + react-hooks                                             |
| CI en GitHub Actions                        | `typecheck && lint && format:check && test && db:check && build` en cada PR |
| Vitest + primeros tests unitarios           | `lib/elo.ts`, `lib/bracket.ts` (byes, avance, podio), 37 tests              |
| `.env.example` y modo demo documentado      | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`                               |

**Criterio de salida:** CI verde en `main`.

## Fase 2 — Backend (Supabase) (✅ completada)

| Tarea                               | Notas                                                                                                                                                                                        |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proyecto Supabase + CLI local       | `supabase init` ✅ (`config.toml`); el stack local espera Docker                                                                                                                             |
| Migración `0001_init.sql`           | tablas de `docs/DATABASE.md`                                                                                                                                                                 |
| RLS en todas las tablas             | política por tabla, sin anon escritura                                                                                                                                                       |
| Triggers de integridad              | `enrolled`, fin de torneo                                                                                                                                                                    |
| RPC del contrato `docs/API.md` §2   | `join_tournament`, `generate_bracket`, `report_result`, `confirm_result`, `dispute_result`, `resolve_dispute`, `forfeit_match`, `start_tournament`, `create_tournament`, `cancel_tournament` |
| `seed.sql` desde `src/data`         | ids idénticos (ADR-10), `npm run seed:gen`                                                                                                                                                   |
| Smoke tests de SQL                  | `npm run db:check`: migración + seed + ciclo inscripción→cuadro→ELO + RLS, sin Docker (PGlite)                                                                                               |
| Tipos generados `database.types.ts` | `npm run types:gen`, regenerados y verificados en CI                                                                                                                                         |

**Criterio de salida:** con SQL local, un torneo completo se juega vía
`psql` (inscribir → cuadro → resultados → ELO). Mientras no haya SQL local,
`npm run db:check` cubre el mismo recorrido.

## Fase 3 — Migración del frontend a datos reales (🔄 en curso)

| Tarea                                                                    | Notas                                                                                                                               |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/api/*` con fallback demo                                        | ✅ ADR-02/03: `demo-store` compartido con `AppContext` (`gamert:state-changed`), mutaciones con validaciones de la RPC, `queryKeys` |
| Hooks TanStack Query (`src/lib/api/hooks.ts`)                            | ✅ lecturas + mutaciones con `invalidateQueries`; `src/lib/api/hooks.test.tsx` (67 tests en total)                                  |
| `Ranking` migrada a queries                                              | ✅ sin imports de `src/data`; `elo` devuelve `EloRecord` y `rankingFor` → `{playerId, elo}[]`                                       |
| `Clasificacion` migrada a queries                                        | ✅ `useStandings` + `useRanking` por juego del torneo                                                                               |
| `Home`, `Torneos`, `DetalleTorneo` sobre queries                         | ✅ rutas principales; `useIsJoined` + invalidación `["isJoined"]`                                                                   |
| `MisTorneos`, `Notificaciones` sobre queries                             | ✅ `useMyTournaments`/`useNotifications`/`useUnreadCount`/`useMarkAllRead`; empty state re-exportado por API                        |
| `Configuracion`, `Menu`, `Perfil` sobre queries                          | ✅ `useSettings`/`useUpdateSetting`, `useProfile`, `useEloPerGame`, `useSignOut`                                                    |
| `Categorias`, `Organizaciones`, `Organizar`, `CrearTorneo` sobre queries | ✅ `useOrganizers`/`usePublisherFor`, `useCreateTournament`, `useCancelTournament` (con commit a `demo-store` + notificación)       |
| Pantallas sin imports de `src/data`                                      | ✅ grep sobre `src/screens` y `src/components` vacío (sólo `AppContext`/`lib/api` importan datos)                                   |
| TanStack Query + `AuthProvider`                                          | reemplaza persistencia de `AppContext`                                                                                              |
| `Login`/`Registro` con Supabase Auth (email + Google)                    |                                                                                                                                     |
| `Inscripcion` → RPC `join_tournament`                                    | 🟡 pantalla migrada (`useJoinTournament`); validaciones server-side pendientes                                                      |
| Ciclo de partida → `api/matches` (reportar/confirmar/impugnar/resolver)  | ✅ `reportResult`/`confirmResult`/`disputeResult`/`resolveDispute` con commit a `demo-store` (ELO, premios, avisos); 4 tests        |
| `Cuadro`/`Resultado` → RPC + realtime                                    | ✅ mutaciones vía `useConfirmResult`/`useResolveDispute`/`useReportResult`/`useDisputeResult`; realtime/`matches` tabla pendiente   |
| `Ranking`/`Clasificacion` → `elo_ratings`                                |                                                                                                                                     |
| `CrearTorneo` → RPC `create_tournament` + Zod                            | 🟡 pantalla migrada (`useCreateTournament`); servidor pendiente                                                                     |
| `Notificaciones` → tabla + realtime                                      | 🟡 pantalla migrada (`useNotifications`); tabla/feed pendientes                                                                     |
| `Configuracion` → `profiles.settings`                                    | 🟡 pantalla migrada (`useUpdateSetting`); persistencia server pendiente                                                             |
| Añadir el grep de CI como gate                                           | `npm run build` sin imports de `src/data` fuera de `src/lib/api` en `src/screens`                                                   |
| Limpieza: eliminar seeds no usados                                       | sólo tras el cambio de cada pantalla                                                                                                |

**Criterio de salida:** `npm run build` sin imports de `src/data` fuera de
`src/lib/api` (verificado con grep en CI) y flujo completo con backend real.

## Fase 4 — Producto y UX

| Tarea                                             | Notas                                      |
| ------------------------------------------------- | ------------------------------------------ |
| Desmontar marco `Phone` → `app-shell` responsive  | ADR-06, breakpoints 640/1024               |
| Landing pública en `/` con CTA de registro        | home accesible sin sesión                  |
| Estados vacíos y de error en todas las pantallas  | usar copy existente (`notificationsEmpty`) |
| Accesibilidad: contraste, focus, aria en cuadro   |                                            |
| Lighthouse ≥ 90 (performance/a11y/best-practices) |                                            |

## Fase 5 — PWA + Observabilidad

| Tarea                                                         | Notas |
| ------------------------------------------------------------- | ----- |
| `vite-plugin-pwa`: manifest, icons desde Figma, offline shell |       |
| Sentry (frontend + source maps)                               |       |
| PostHog: registro, inscripción, torneo creado                 |       |
| Vercel: dominio, previews por PR, variables de entorno        |       |
| Alertas: error rate, fallos de RPC                            |       |

**Criterio de salida:** instalable en Android/iOS, errores visibles en
Sentry, dominio público.

## Fase 6 — Beta pública y prepago de v2

| Tarea                                       | Notas                                                 |
| ------------------------------------------- | ----------------------------------------------------- |
| E2E Playwright del flujo crítico            | registro → inscripción → cuadro → confirmar → ranking |
| Beta cerrada con ~50 usuarios               | recoger feedback, medir KPIs de `ALCANCE.md` §3       |
| Soporte: mail + panel admin mínimo          | listar torneos, resolver disputas                     |
| Post-mortem de beta → ajustar `ALCANCE.md`  |                                                       |
| V2: pagos (MercadoPago), push, más formatos | requiere `LEGAL.md` §5                                |

## Riesgos

| Riesgo                                               | Mitigación                                                     |
| ---------------------------------------------------- | -------------------------------------------------------------- |
| El ELO server-side no replica exactamente al cliente | tests de equivalencia TS↔SQL                                   |
| Marcas de publishers sin autorizar                   | cambiar a nombres ficticios antes de marketing (`LEGAL.md` §3) |
| Sobrecarga de alcance (27 pantallas)                 | el corte de `ALCANCE.md` manda; lo no listado espera           |
| Costos de Supabase al crecer                         | alertas de uso; plan Pro sólo al pasar el umbral free          |
