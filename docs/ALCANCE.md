# GAMERT — Alcance del producto

> Fuente de verdad sobre **qué entra** en cada versión. Cualquier feature
> que no esté aquí no se construye hasta que se agregue a este documento
> y se mueva en `docs/ROADMAP.md`.

## 1. Visión

GAMERT es una plataforma de torneos de esports: el jugador se registra,
compite en torneos por juego, reporta resultados, sube su ELO y sigue su
ranking; el organizador publica torneos con reglas y premios y la app
ejecuta el cuadro automáticamente.

- **Formato inicial:** web responsive + PWA (instalable en celular).
- **Mercado inicial:** LatAm, español.
- **Monetización inicial:** ninguna (ver `docs/LEGAL.md` §5).

## 2. Roles

| Rol           | Capacidad                                                           | Cómo se obtiene                                  |
| ------------- | ------------------------------------------------------------------- | ------------------------------------------------ |
| `jugador`     | Inscribirse, jugar, reportar/confirmar resultados, ver ranking      | Registro (rol por defecto)                       |
| `organizador` | Crear torneos, iniciar/cancelar, resolver disputas                  | Se desbloquea al cumplir reputación (ver ADR-07) |
| `editorial`   | Cuentas oficiales de publishers (Riot, EA…) con premios verificados | Asignado por el equipo GAMERT (seed)             |
| `admin`       | Soporte, resolución de disputas globales, moderación                | Asignado manualmente en Supabase                 |

Los tiers de organizador (`comunidad` / `verificado` / `editorial`) viven en
`profiles.organizer_tier` y son el mismo concepto de `src/data/players.ts`.

## 3. Versión 1 (producción, sin dinero real)

Objetivo: **usuarios reales jugando torneos gratis.**

| #   | Feature                                                         | Pantallas hoy                 | Estado actual                  | Qué falta para v1                                |
| --- | --------------------------------------------------------------- | ----------------------------- | ------------------------------ | ------------------------------------------------ |
| 1   | Registro / login real (email + Google)                          | `Login`, `Registro`           | Mock (`signIn()` local)        | Supabase Auth + sesión persistente               |
| 2   | Perfil de jugador (nombre, handle, main game, ELO)              | `Perfil`                      | Mock                           | CRUD contra `profiles`                           |
| 3   | Browse de juegos y detalle de juego                             | `Categorias`                  | Seed estático                  | Tabla `games`                                    |
| 4   | Listado de torneos + filtros                                    | `Torneos`, `Home`             | Seed estático                  | Tabla `tournaments`                              |
| 5   | Detalle de torneo (reglas, premio, estado)                      | `DetalleTorneo`               | Seed                           | + joins reales                                   |
| 6   | Inscripción con validación (cupos, ELO mín., doble inscripción) | `Inscripcion`                 | Local                          | RPC `join_tournament` con validación server-side |
| 7   | Cuadro (bracket) autogenerado con byes                          | `Cuadro`                      | Motor local `lib/bracket.ts`   | RPC `generate_bracket` + tabla `matches`         |
| 8   | Reportar / confirmar / disputar resultados                      | `Resultado`                   | Local                          | RPC `report_result` + ventanas de impugnación    |
| 9   | Clasificación y podio del torneo                                | `Clasificacion`               | Local                          | Vista SQL sobre `matches`                        |
| 10  | Ranking ELO por juego                                           | `Ranking`, `Clasificacion`    | Local                          | Tabla `elo_ratings`, recálculo server-side       |
| 11  | Mis torneos (jugador y organizador)                             | `MisTorneos`                  | Local                          | Queries sobre `registrations`                    |
| 12  | Crear torneo (organizador)                                      | `Organizar`, `CrearTorneo`    | Local                          | RPC `create_tournament` + permisos               |
| 13  | Iniciar / cancelar torneo                                       | `DetalleTorneo`               | Local                          | RPCs + roles                                     |
| 14  | Notificaciones in-app                                           | `Notificaciones`              | Seed                           | Tabla `notifications` + realtime                 |
| 15  | Ajustes de perfil (privacidad, idioma, sonido)                  | `Configuracion`               | Local                          | Columna `settings` en `profiles`                 |
| 16  | Web responsive + PWA instalable                                 | Marco `Phone` 393×852         | Solo móvil dentro del artboard | Desmontar marco, breakpoints, manifest + SW      |
| 17  | Landing pública / home sin sesión                               | `Home` exige sesión implícita | —                              | Ruta pública + CTA de registro                   |

**Criterios de éxito de v1 (KPIs):**

- 100 % de los flujos críticos funcionan sin datos locales.
- Registro → inscripción → cuadro → resultado confirmado en < 5 minutos.
- Lighthouse PWA ≥ 90; carga inicial < 2 s en 4G.
- 0 errores no capturados en Sentry durante una semana.

## 4. Versión 2 (post-lanzamiento)

| Feature                                                          | Dependencias                                           |
| ---------------------------------------------------------------- | ------------------------------------------------------ |
| Billetera real: recarga, retiro, premios (MercadoPago)           | Cuenta de comercio, KYC, `docs/LEGAL.md` §5            |
| Comisión de plataforma sobre inscripciones de pago               | Idem + pricing                                         |
| Push notifications web (Web Push)                                | Service worker + suscripciones                         |
| Formatos `grupos`, `suizo`, `doble_eliminacion`                  | Extensión del motor de cuadro (hoy solo `eliminacion`) |
| Series diarias (`DailySeries`) con materialización automática    | Cron (pg_cron)                                         |
| Feed de organizaciones y seguidores                              | Tablas sociales                                        |
| App móvil Expo (compartiendo API)                                | v1 estable                                             |
| Verificación en 2FA y verificación de identidad de organizadores | Supabase Auth MFA                                      |
| Chat / mensajería entre jugadores                                | Realtime o servicio externo                            |
| Streaming embebido (Twitch/YouTube) en detalle de torneo         | API de terceros                                        |

## 5. Descartado / fuera de producto

- **`genres` (Heist, Blockbuster…)** en `src/data/app.ts`: son etiquetas de
  diseño del archivo `.fig`, no un concepto del producto. No se implementan.
- **Marcas de publishers como cuentas reales**: en v1 son seeds ilustrativos;
  usar nombres de terceros como cuentas de usuario reales requiere
  autorización (ver `docs/LEGAL.md` §3).
- **ELO con margen de goles/marcador en juegos de round** (`marginMultiplier`
  en `lib/elo.ts`): se mantiene, pero se documenta como algoritmo interno
  sujeto a ajuste por balance.
- **Autenticación por huella/face ID**: la resuelve el navegador/OS con la
  PWA, no se programa.

## 6. Fuera de alcance permanente (por ahora)

Moderación de contenido de usuarios, alianzas con ligas, API pública para
terceros, multi-idioma (v1 es solo español), y facturación B2B.
