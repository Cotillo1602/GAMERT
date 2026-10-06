# GAMERT — Notas legales y de cumplimiento

> Documento de trabajo para el equipo, **no** constituye asesoría jurídica.
> Antes de cobrar dinero o lanzar campaña pública, revisar con un abogado.

## 1. Datos personales

- Datos que tratamos: email, nombre/handle, avatar, país (opcional),
  historial de partidas y ELO, ajustes. No pedimos documento de identidad
  ni datos de pago en v1.
- Base: consentimiento del usuario al registrarse (arts. 5-6 Ley 25.326
  de Protección de Datos Personales, Argentina).
- Obligaciones: registrarse en el Registro de Bases de Datos (AAIP),
  ofrecer acceso/modificación/baja gratuitos (art. 14) y publicar
  **Política de Privacidad** y **Términos y Condicidades** en el sitio.
- Proveedor de infraestructura: Supabase (EE. UU.) y Vercel (EE. UU.) →
  transferencia internacional, informada en la política de privacidad.
- Retención: bajas se realizan con exportación previa del historial si el
  usuario la pide (art. 16).

**Entregable previo a producción:** `Términos y Condicidades`,
`Política de Privacidad`, `Política de cookies` (banner simple) y correo de
soporte público.

## 2. Edad y menores

Los torneos no involucran dinero en v1, pero el registro debe declarar
mayoría de edad o contar con consentimiento parental (Código Civil y
Comercial, art. 32 y cc.). En v1: checkbox de mayoría de edad + Términos.

## 3. Marcas y contenido de terceros

- Los seeds usan nombres reales (RIOT GAMES, EA SPORTS, FIFA, VALORANT…).
  **No se puede usar en marketing ni en cuentas de usuario reales** sin
  autorización.
- Plan: en producción, reemplazar por
  - juegos genéricos («Fútbol 26») hasta obtener licencia, o
  - logos oficiales sólo si el publisher es partner (función
    `organizations` con `tier='editorial'` reservada a alianzas firmadas).
- Textos e imágenes: los prototipos de `APP GAMERT.fig` son de CORCADEV;
  verificar que todos los assets tengan licencia antes de publicar.
- DMCA: canal de contacto para reclamos de contenido infractor.

## 4. Responsabilidad sobre el juego

- Prohibición de cheats/smurfing ya está en las reglas
  (`TOURNAMENT_RULES_TEXT`): debe reflejarse en Términos para que el
  organizador pueda sancionar.
- Los resultados los reportan los propios jugadores → los Términos deben
  establecer que GAMERT no garantiza resultados y que las disputas las
  resuelve el organizador/administrador.

## 5. Pagos (requisitos para v2 — hoy fuera de alcance, ADR-09)

Cuando entre la billetera con dinero real:

1. **Entidad**: decidir si GAMERT opera como SRL/SA o como plataforma de
   terceros; define si retiene fondos.
2. **Pasarela**: MercadoPago (LatAm) exige cuenta de comercio y
   inscripción ante AFIP/DGI; Stripe requiere soporte en el país.
3. **KYC/AML**: verificar identidad de organizadores que ofrecen premios en
   efectivo (`verified_prizes`) antes de mover fondos.
4. **Impuestos**: retenciones sobre premios; facturación de comisiones.
5. **Términos de billetera**: saldo no remunerado, no convertível a otras
   monedas, plazos de retiro, comisiones publicadas.
6. **Protección al consumidor**: medio de contacto y plazos de respuesta.

Nada de esto se implementa hasta que `ALCANCE.md` mueva la billetera a v2
y este apartado quede cerrado.

## 6. Seguridad

- RLS en todas las tablas (`docs/DATABASE.md` §4); sin claves de servicio
  en el cliente; sólo `anon key` pública con políticas.
- Secretos en variables de entorno (Vercel/Supabase), nunca en el repo.
- Auditoría de eventos sensibles en `match_events`.
- Incidentes: contactar a soporte + notificar a usuarios afectados si hay
  filtración de datos personales (Ley 25.326 y buenas prácticas).

## 7. Checklist antes de producción

- [ ] Términos y Condicidades publicados y aceptados en el registro
- [ ] Política de Privacidad publicada + registro AAIP
- [ ] Banner de cookies
- [ ] Seeds con marcas de terceros reemplazados o partner firmado
- [ ] Correo de soporte operativo (soporte@gamert...)
- [ ] Borrado/exportación de datos probados end-to-end
- [ ] Revisión de accesibilidad básica (no legal, pero recomienda)
