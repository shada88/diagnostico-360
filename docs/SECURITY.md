# Seguridad

Este documento describe los **controles existentes**, los **hallazgos verificados en el código** (al 2026-10-21) y un **plan de remediación** priorizado.

> **Estado**: el sistema tiene riesgos **críticos** que deben resolverse antes de exponerlo públicamente con datos reales.

---

## 1. Controles implementados

| Control | Implementación |
|---------|----------------|
| Hash de contraseñas | `bcrypt` con 10 rondas (`RegisterUseCase`, `UsersService.update` hashea siempre que llega `password`) |
| Autenticación stateless | JWT HS256, expira a los 60 min (`ignoreExpiration: false`) |
| Login social | Google OAuth 2.0 vía Passport |
| Verificación de email | Código de 6 dígitos antes de marcar `isEmailVerified` |
| Anti-enumeración en recuperación | `forgot-password` responde igual exista o no el email |
| Validación de entrada | `ValidationPipe` global + DTOs (`@IsEmail`, `@MinLength(6)`, `@Min(1) @Max(10)`) |
| Validación de configuración | Schema Zod; la app no arranca con config inválida |
| Autorización de borrado | `DELETE /responses/:id` verifica que el intento sea del usuario |
| RBAC (base) | Tablas `Role` / `UserRole`; roles en el payload del JWT |
| Soft delete | `SurveyAttempt.deletedAt` |
| Minimización de datos hacia la IA | Solo nombre, negocio y puntajes (sin email, teléfono ni respuestas) |
| Secretos fuera del repo | `.env` ignorado por git; solo plantillas de ejemplo versionadas |
| Cliente | Interceptor 401 → borra token y redirige a `/login` |

---

## 2. Hallazgos

| # | Severidad | Hallazgo | Ubicación |
|---|-----------|----------|-----------|
| S1 | 🔴 Crítica | **IDOR en resultados**: todos los endpoints `/results/*` son públicos. Cualquiera con el UUID de un intento lee el diagnóstico completo, el análisis IA y **las 30 respuestas individuales** (incluida la dimensión espiritual y relacional). | `diagnostic/evaluations/dashboard.controller.ts` |
| S2 | 🔴 Crítica | **IDOR en el ciclo del intento**: `GET /responses/:id`, `POST /responses/:id/answers` y `POST /responses/:id/finalize` no tienen guard ni chequeo de propiedad. Un tercero puede leer, **alterar respuestas** y re-finalizar el diagnóstico de otra persona. | `diagnostic/responses/responses.controller.ts` |
| S3 | 🔴 Crítica | **Secreto JWT con fallback inseguro**: si falta `JWT_SECRET` se usa `'secretKey'`, lo que permite forjar tokens. Además `JWT_SECRET` no está en el schema Zod, así que su ausencia no detiene el arranque. | `identity/auth/auth.module.ts:25`, `jwt.strategy.ts:12` |
| S4 | 🟠 Alta | **Abuso de costo de IA**: `GET /results/:a/evolution/:b` es público y genera una llamada LLM por cada par nuevo de IDs; `finalize` también dispara IA sin autenticación. | `dashboard.controller.ts`, `responses.controller.ts` |
| S5 | 🟠 Alta | **Fuerza bruta de códigos**: códigos de 6 dígitos (900 000 combinaciones) sin expiración, sin límite de intentos y sin rate limiting. El reset de contraseña reutiliza `verificationCode` y **no usa** los campos `resetCode`/`resetCodeExpires` que ya existen en el schema. | `reset-password.use-case.ts`, `verify-email.use-case.ts`, `forgot-password.use-case.ts` |
| S6 | 🟠 Alta | **Asignación masiva en perfil**: `ValidationPipe` se usa sin `whitelist`, por lo que propiedades no declaradas en `UpdateProfileDto` llegan a `{ ...dto }` y a Prisma. Un usuario autenticado podría enviar `email` o `isEmailVerified`. *Verificar con un test e2e.* | `main.ts:12`, `users.controller.ts:24` |
| S7 | 🟡 Media | **Generador no criptográfico**: los códigos se generan con `Math.random()`. | `register.use-case.ts:17`, `forgot-password.use-case.ts` |
| S8 | 🟡 Media | **Token en la URL** en el callback de Google (`?token=…`): queda en historial del navegador, logs de proxy y cabecera `Referer`. | `auth.controller.ts:95` |
| S9 | 🟡 Media | **JWT en `localStorage`**: accesible ante cualquier XSS. Sin refresh token ni revocación. | `frontend/src/lib/http/client.ts` |
| S10 | 🟡 Media | **CORS abierto** (`app.enableCors()` sin origen) y sin cabeceras de seguridad (no hay Helmet). | `main.ts:9` |
| S11 | 🟡 Media | **Sin rate limiting** en ningún endpoint (login, register, códigos, IA). | global |
| S12 | 🟡 Media | **Login sin email verificado**: `ValidateUserUseCase` no exige `isEmailVerified`. | `validate-user.use-case.ts` |
| S13 | 🟢 Baja | **Inyección HTML en emails**: `userName` se interpola sin escapar en las plantillas. | `common/mail.service.ts` |
| S14 | 🟢 Baja | **Swagger expuesto** en `/api` en todos los entornos. | `main.ts:21` |
| S15 | 🟢 Baja | **Logs con PII**: email del usuario en el cron y nombre en el servicio de IA. | `reminder-cron.service.ts:94`, `ai-analysis.service.ts:187` |
| S16 | 🟢 Baja | **Credenciales por defecto** en `docker-compose.yml` (`postgres/postgres`). Aceptable solo en local. | `backend/docker-compose.yml` |
| S17 | ⚖️ Cumplimiento | **Sin consentimiento de tratamiento de datos** en el registro, pese a procesar datos sensibles (creencias espirituales, vida familiar) y exigirlo la spec funcional. Relevante para Ley 1581 (ficticio), GDPR y normas equivalentes. | `components/features/auth/AuthForm.tsx` |

---

## 3. Plan de remediación

### Fase 1 — Bloqueantes para producción

1. **Ownership en todo recurso de diagnóstico (S1, S2, S4)**
   - Agregar `AuthGuard('jwt')` a `/results/*` y a `/responses/:id*`.
   - Crear un `AttemptOwnershipGuard` (o validación en el use case) que compare `attempt.userId === req.user.userId`; responder **404** (no 403) para no confirmar existencia.
   - Para evolución, validar que **ambos** intentos sean del usuario.
   - Si se quieren intentos anónimos, emitir un *attempt token* firmado al crear el intento.
2. **JWT_SECRET obligatorio (S3)**: agregarlo al schema Zod con `z.string().min(32)` y eliminar el fallback `'secretKey'`. Rotar el secreto actual.
3. **`ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })` (S6)**.
4. **Códigos seguros (S5, S7)**: `crypto.randomInt(100000, 1000000)`, guardar **hash** del código, usar `resetCode` + `resetCodeExpires` (15 min), máximo 5 intentos, invalidar tras uso.
5. **Rate limiting (S11)**: `@nestjs/throttler` global + límites estrictos en `/auth/*` y en endpoints que disparan IA.

### Fase 2 — Endurecimiento

6. CORS con lista blanca (`origin: FRONTEND_URL`) y `helmet()` (S10).
7. Exigir email verificado para login con contraseña (S12).
8. OAuth: entregar el token mediante un **código de un solo uso** intercambiable por POST, o cookie `HttpOnly` (S8).
9. Migrar la sesión a cookie `HttpOnly; Secure; SameSite=Lax` + refresh token rotativo (S9).
10. Escapar variables en plantillas de email (S13).
11. Deshabilitar Swagger cuando `NODE_ENV=production` (S14).

### Fase 3 — Cumplimiento y observabilidad

12. Checkbox de consentimiento + política de privacidad + registro de fecha de aceptación (S17).
13. Endpoint de exportación y borrado de datos del usuario (derecho de acceso/supresión).
14. Logger estructurado sin PII (S15) y auditoría de accesos a diagnósticos.
15. Tests e2e de autorización: "usuario A no puede leer/modificar el intento de B".

---

## 4. Manejo de secretos

- Nunca commitear `.env`, `.env.local` ni claves. El `.gitignore` ya los excluye.
- Plantillas de referencia: `openspec/changes/archive/2026-04-17-config-normalization/env-examples/`.
- En producción, usar el gestor de secretos del proveedor de hosting.
- Rotar inmediatamente cualquier clave expuesta en logs, issues o chats.

## 5. Reporte de vulnerabilidades

Reportar de forma privada al equipo técnico de Acme Consultores. No abrir issues públicos con detalles explotables.
