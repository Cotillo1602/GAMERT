# GAMERT

Plataforma de torneos de esports. Frontend web responsive + PWA generado a
partir de los prototipos Figma (`APP GAMERT.fig`), con backend Supabase.

**Estado actual:** Fase 0/6 — documentación lista, implementación por venir
(ver [`docs/ROADMAP.md`](docs/ROADMAP.md)).

## Requisitos

- Node.js ≥ 20 y npm ≥ 10
- (Fase 2+) [Supabase CLI](https://supabase.com/docs/guides/cli) para el
  backend local

## Arranque rápido

```bash
npm install
npm run dev        # http://localhost:5173
```

Sin credenciales de Supabase la app corre en **modo demo**: datos de
`src/data` y sesión simulada (`src/lib/api/client.ts` → `isDemoMode()`).

### Variables de entorno

Copia `.env.example` a `.env`:

```bash
VITE_SUPABASE_URL=          # vacío = modo demo
VITE_SUPABASE_ANON_KEY=
```

## Scripts

| Comando             | Qué hace                                       |
| ------------------- | ---------------------------------------------- |
| `npm run dev`       | servidor de desarrollo Vite                    |
| `npm run build`     | `tsc -b` + build de producción en `dist/`      |
| `npm run preview`   | sirve `dist/` en local                         |
| `npm run typecheck` | chequeo de tipos sin emitir                    |
| `npm run lint`      | ESLint                                         |
| `npm run format`    | Prettier                                       |
| `npm test`          | Vitest                                         |
| `npm run seed:gen`  | regenera `supabase/seed.sql` desde `src/data`  |
| `npm run db:check`  | migración + seed + smoke de RPC/RLS (Postgres) |

## Documentación

| Documento                                      | Contenido                                     |
| ---------------------------------------------- | --------------------------------------------- |
| [`docs/ALCANCE.md`](docs/ALCANCE.md)           | qué entra en v1, v2 y qué está descartado     |
| [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md) | stack por capa y ADRs (decisiones)            |
| [`docs/DATABASE.md`](docs/DATABASE.md)         | esquema Postgres, RLS y seeds                 |
| [`docs/API.md`](docs/API.md)                   | contrato de RPC y módulos `src/lib/api`       |
| [`docs/ROADMAP.md`](docs/ROADMAP.md)           | fases 0–6 con criterios de salida             |
| [`docs/LEGAL.md`](docs/LEGAL.md)               | datos personales, marcas, requisitos de pagos |

## Estructura

```
src/
  components/   ui (Button, Input, List, Icon…) y layout (Phone, TabBar, Toast)
  data/         seeds del prototipo (se migran a supabase/seed.sql)
  lib/          lógica pura: bracket.ts, elo.ts, api/ (capa de datos)
  screens/      27 pantallas del flujo
  store/        AppContext (sesión + ajustes; el estado de datos migra a TanStack Query)
  styles/       tokens.css + estilos globales
supabase/       migrations/ y seed.sql (Fase 2)
docs/           documentación del producto y la arquitectura
```

## Desarrollo

- **Convenciones:** ver `docs/ARQUITECTURA.md` §5.
- **Antes de un PR:**
  `npm run typecheck && npm run lint && npm test && npm run db:check && npm run build`.
- **Feature nueva:** primero se agrega a `docs/ALCANCE.md` y al
  `docs/ROADMAP.md`, después se implementa.

## Licencia / equipo

Desarrollado por CORCADEV. Gamert v1.0.0 (Beta).
