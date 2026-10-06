# GAMERT — Arquitectura

> Decisiones técnicas registradas como ADR (Architecture Decision Record).
> Cada ADR es irreversible sin actualizar este documento.

## 1. Stack por capa

| Capa                      | Elección                              | Versión / notas                                           |
| ------------------------- | ------------------------------------- | --------------------------------------------------------- |
| UI                        | React + TypeScript                    | 18 / 5.6 (existente)                                      |
| Build                     | Vite                                  | 5.x, alias `@` → `src`                                    |
| Routing                   | React Router DOM                      | 6.x, rutas en `src/routes.tsx`                            |
| Estilos                   | CSS por componentes + tokens          | `src/styles/tokens.css`; sin framework CSS                |
| Server state              | TanStack Query                        | reemplaza el estado en `localStorage`                     |
| Validación de formularios | Zod + react-hook-form                 | crear torneo, registro, inscripción                       |
| Backend                   | Supabase                              | Postgres 16, Auth, Storage, Realtime, Edge Functions, RLS |
| Cliente BaaS              | `@supabase/supabase-js`               | detrás de `src/lib/api/`                                  |
| PWA                       | `vite-plugin-pwa`                     | manifest + service worker (precache del shell)            |
| Tests                     | Vitest + React Testing Library        | unit/component; Playwright para e2e                       |
| Lint / formato            | ESLint (typescript-eslint) + Prettier | scripts `lint`, `format`                                  |
| CI                        | GitHub Actions                        | typecheck + lint + test + build en cada PR                |
| Frontend hosting          | Vercel                                | preview por PR, prod por `main`                           |
| Observabilidad            | Sentry (errores) + Supabase logs      | PostHog para analítica de producto                        |
| Dominio                   | Propio (`gamert.app` u otro)          | apuntado a Vercel                                         |

## 2. Diagrama

```
┌────────────── Web (PWA) ──────────────┐
│ React + Router + TanStack Query       │
│  src/screens (UI)                     │
│  src/lib/bracket, src/lib/elo (lógica │
│  pura, también usada en tests)        │
│  src/lib/api/* (única puerta a datos) │
└───────────────┬───────────────────────┘
                │ HTTPS (supabase-js)
┌───────────────▼───────────────────────┐
│ Supabase                              │
│  Auth ─ profiles (RLS)                │
│  Postgres: tournaments, registrations,│
│           matches, elo_ratings, ...   │
│  RPC (SQL): join_tournament,          │
│     generate_bracket, report_result,  │
│     resolve_dispute, start_tournament │
│  Realtime: notifications, matches     │
│  Storage: avatares                    │
└───────────────────────────────────────┘
```

## 3. Modo demo (desarrollo sin backend)

Si `VITE_SUPABASE_URL` no está definida, `src/lib/api/client.ts` exporta
`isDemoMode() === true` y la app corre con los seeds actuales de `src/data`
y `localStorage`, exactamente como hoy. Esto permite:

- desarrollar UI sin cuenta de Supabase;
- mantener el deploy de demo pública sin exponer datos reales.

**Regla:** ninguna pantalla importa `src/data/*` directamente; sólo habla con
`src/lib/api/*`, que decide demo vs remoto. (`src/lib/bracket.ts` y
`src/lib/elo.ts` son lógica pura y se pueden importar de cualquier lado.)

## 4. ADRs

### ADR-01 — Supabase como backend (no backend propio)

Postgres relacional encaja con el dominio (torneos → inscripciones → partidas
→ ELO, todo relacionado y con transacciones). Auth, storage y realtime vienen
integrados. Costo de operación bajo al inicio; migración a backend propio
sigue siendo posible porque la lógica de negocio vive en SQL + `src/lib`.

### ADR-02 — El server state no vive en React

Hoy `AppContext.tsx` maneja 15 acciones y persiste en `localStorage`
(`AppContext.tsx:195`). Con backend real eso genera estados divergentes entre
dispositivos. Se reemplaza por TanStack Query (cache + revalidación) y las
acciones pasan a llamadas RPC. `AppContext` queda solo para:
sesión actual, ajustes efímeros y toasts.

### ADR-03 — El cuadro lo genera el servidor

`generate_bracket` es una RPC transaccional: recibe los inscritos, calcula
byes con `bracketSizeFor`, inserta `matches` y congela
`matches.elo_snapshot`. El cliente sólo dibuja. Motivo: el cuadro es el
estado de mayor integridad del producto (un cuadro alterado = torneo inválido).

### ADR-04 — ELO y resultados se calculan en el servidor

`report_result` valida que quien reporta sea participante, que la ventana de
impugnación no haya vencido, aplica la fórmula de `src/lib/elo.ts` (portada a
SQL) y actualiza `elo_ratings` en la misma transacción. El auto-reporte está
bloqueado por `matches.needs_confirmation`.

### ADR-05 — Seguridad: RLS en todas las tablas

Ninguna tabla es legible/isible sin política. Polímatas resumidas en
`docs/DATABASE.md` §4. La única escritura fuera de RLS son las RPC, que
usan `SECURITY DEFINER` con validaciones explícitas.

### ADR-06 — Web responsive primero, PWA después del shell

El layout actual envuelve todo en el marco `Phone` de 393×852
(`src/components/layout/Layout.tsx`). Se desmonta: `phone-stage` pasa a ser
`app-shell` con breakpoints (móvil-first ≤640px, tablet, desktop con
sidebar). La PWA se activa recién cuando el shell es estable, para no
cachear un layout que cambia.

### ADR-07 — Desbloqueo de organizador por reputación

Un usuario puede crear torneos si cumple una de:
`elo_principal ≥ 1500` **y** ≥ 10 partidas confirmadas, o bien
`organizer_tier` asignado. Se implementa como `SECURITY DEFINER`
`can_organize(user_id)` usada por `create_tournament`.

### ADR-08 — Español por defecto, sin i18n framework en v1

Los strings viven en los componentes. Cuando entre otro idioma, migrar a
`react-i18next` (decisión registrada para no reescribir UI ahora).

### ADR-09 — Sin dinero real en v1

No hay tabla de pagos, webhooks ni pasarela. La billetera de
`src/data/app.ts` queda fuera de alcance (`docs/ALCANCE.md` §4). Esto
elimina en v1 obligaciones fiscales y de custodia de fondos.

### ADR-10 — Seeds: `src/data` → SQL

Los seeds actuales (jugadores, torneos, juegos, publishers) se convierten en
`supabase/seed.sql` manteniendo los mismos ids (`u1`, `summer-cup-fifa26`,
`fifa26`…) para que las pantallas y los enlaces no cambien.

## 5. Convenciones de código

- Names de archivos: `PascalCase.tsx` para componentes, `camelCase.ts` para
  lógica/datos.
- Alias `@/` para imports desde `src` (ya configurado en `vite.config.ts` y
  `tsconfig.json`).
- Tipos compartidos en `src/lib/api/types.ts` (espejo de `src/types` SQL
  generados con `supabase gen types`).
- Comentarios sólo donde hay una decisión no obvia.
- Cada PR: `npm run typecheck && npm run lint && npm test && npm run build`.
