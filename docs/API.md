# Referencia de API

- **Base URL (local)**: `http://localhost:3006`
- **Formato**: JSON (`Content-Type: application/json`, límite de body 5 MB)
- **Autenticación**: `Authorization: Bearer <JWT>` (expira a los **60 minutos**, sin refresh token)
- **OpenAPI / Swagger UI**: `GET /api`
- **Validación**: `ValidationPipe` global con DTOs de `class-validator`

Leyenda de acceso: 🔓 público · 🔐 requiere JWT · 🔸 JWT opcional

> ⚠️ Varios endpoints públicos exponen o modifican datos por ID sin verificar propiedad. Ver [SECURITY.md](SECURITY.md#hallazgos).

---

## Health

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| GET | `/` | 🔓 | Health check básico (`AppController`) |

---

## Identity — `/auth`

| Método | Ruta | Acceso | Body | Respuesta |
|--------|------|--------|------|-----------|
| POST | `/auth/register` | 🔓 | `{ email, password (min 6) }` | `{ message }` — envía código de 6 dígitos por email |
| POST | `/auth/verify-email` | 🔓 | `{ email, code }` | `{ message }` |
| POST | `/auth/resend-code` | 🔓 | `{ email }` | `{ message }` |
| POST | `/auth/login` | 🔓 | `{ email, password }` | `{ access_token, user: { name, email, isProfileComplete, latestAttemptId, latestAttemptStatus } }` |
| POST | `/auth/forgot-password` | 🔓 | `{ email }` | `{ message }` (respuesta idéntica exista o no el email) |
| POST | `/auth/reset-password` | 🔓 | `{ email, code, newPassword }` | `{ message }` |
| GET | `/auth/profile` | 🔐 | — | Payload del JWT: `{ userId, email, roles }` |
| GET | `/auth/google` | 🔓 | — | Redirige al consentimiento de Google (scopes `email`, `profile`) |
| GET | `/auth/google/callback` | 🔓 | — | Redirige a `${FRONTEND_URL}/auth/google/callback?token=<JWT>&profileComplete=<bool>` |

**Payload del JWT**: `{ sub: userId, email, roles: string[] }`.

## Identity — `/users`

| Método | Ruta | Acceso | Body | Respuesta |
|--------|------|--------|------|-----------|
| GET | `/users/me` | 🔐 | — | Usuario + roles + `latestAttemptId` + `latestAttemptStatus` |
| PATCH | `/users/profile` | 🔐 | `{ name?, businessName?, country?, countryCode?, city?, phoneNumber?, timezone? }` | Usuario actualizado; marca `isProfileComplete = true` |

---

## Diagnostic — `/surveys`

| Método | Ruta | Acceso | Respuesta |
|--------|------|--------|-----------|
| GET | `/surveys` | 🔓 | Encuestas activas con `sections[]` → `questions[]` ordenadas por `order` |
| GET | `/surveys/:id` | 🔓 | Una encuesta con su estructura completa |

## Diagnostic — `/responses` (ciclo del intento)

| Método | Ruta | Acceso | Body | Descripción |
|--------|------|--------|------|-------------|
| GET | `/responses` | 🔐 | — | Historial del usuario: `[{ id, createdAt, status, globalScore? }]` (excluye borrados) |
| POST | `/responses` | 🔸 | `{ surveyId }` | Crea un `SurveyAttempt` `IN_PROGRESS` (anónimo si no hay token) |
| GET | `/responses/:id` | 🔓 | — | Intento con `answers`, `diagnostic` y `aiEval` |
| POST | `/responses/:id/answers` | 🔓 | `{ questionId, value (int 1–10) }` | Upsert idempotente de una respuesta |
| POST | `/responses/:id/finalize` | 🔓 | — | Calcula resultados, genera análisis IA, emite email. Devuelve `DashboardDTO` |
| DELETE | `/responses/:id` | 🔐 | — | *Soft delete*; solo el dueño (403 si no) |

## Diagnostic — `/evaluations`

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| POST | `/evaluations/:attemptId/calculate` | 🔐 | Recalcula el diagnóstico (mismo caso de uso que `finalize`, sin email) |

## Diagnostic — `/results` (dashboard)

| Método | Ruta | Acceso | Respuesta |
|--------|------|--------|-----------|
| GET | `/results/:id` | 🔓 | `DashboardDTO` completo |
| GET | `/results/:id/global` | 🔓 | `DashboardDTO.global` |
| GET | `/results/:id/radar` | 🔓 | `RadarPoint[]` (10 ejes) |
| GET | `/results/:id/dimensions` | 🔓 | `DimensionResult[]` |
| GET | `/results/:id/alerts` | 🔓 | `{ alerts, bottlenecks }` |
| GET | `/results/:id/answers` | 🔓 | Respuestas agrupadas por dimensión → área (`DimensionGroup[]`) |
| GET | `/results/:currentId/evolution/:previousId` | 🔓 | `EvolutionAnalysisDTO` (cacheado; genera con IA si no existe) |

---

## Contratos principales

Definidos en `backend/src/diagnostic/evaluations/dto/dashboard.dto.ts` y espejados en `frontend/src/types/`.

### `DashboardDTO`

```ts
{
  user:        { name: string; businessName: string };
  global:      { score: number; maturity: MaturityMeta; mode: 'CRISIS'|'INTERVENTION'|'MAINTENANCE'|'GROWTH' };
  dimensions:  DimensionResult[];      // D1, D2, D3 con subdimensions anidadas
  radar:       RadarPoint[];           // 10 ejes
  strengths:   DiagnosticPriority[];   // top 3 áreas
  bottlenecks: DiagnosticPriority[];   // bottom 3 áreas
  alerts:      CrossAlert[];           // alertas cruzadas activas
  aiAnalysis?: AiAnalysisDTO;
}

MaturityMeta       { level: MaturityLevel; label: string; color: string; description: string }
DimensionResult    { key; label; score; maturity; subdimensions: SubdimensionResult[] }
SubdimensionResult { key; label; score; maturity }
CrossAlert         { key: 'GLASS_CEILING'|'LEAKY_BUCKET'|'SUCCESS_COLLAPSE'|'SELF_EMPLOYED';
                     title; message; severity: 'HIGH'|'MEDIUM' }
```

### `AiAnalysisDTO`

```ts
{
  executiveSummary: string;
  criticalAlertMessage: string;
  dimensionModules: Record<'internal'|'business'|'growth',
                           { insight: string; growthQuestion: string; keyAction: string }>;
  areaInsights: Record<SubdimensionKey, string>;           // 1 oración por área
  impactConnections: { title; story; quickImpacts: string[];
                       severity: 'critical'|'attention'|'opportunity'; focusAreas?: string[] }[];
  crossAlertInsights: string[];
  crudeWarning: string;
  actionPlan30Days: { foundation: string; tacticalSteps: string[] };
  conclusiveDiagnosis: string;
  mentorshipTransitionText: string;
}
```

### `EvolutionAnalysisDTO`

```ts
{
  overallVerdict: 'PROGRESO'|'ESTANCAMIENTO'|'RETROCESO'|'MIXTO';
  executiveSummary: string;
  dimensionAnalysis: Record<'internal'|'business'|'growth',
                            { trend: string; insight: string; recommendation: string }>;
  criticalPatterns: string[];
  topGains:    { area: string; delta: number; insight: string }[];
  topDeclines: { area: string; delta: number; insight: string }[];
  strategicRecommendation: string;
}
```

---

## Errores

Se usan las excepciones estándar de NestJS:

| Código | Cuándo |
|--------|--------|
| 400 | DTO inválido, código de verificación incorrecto, usuario no encontrado en verify/reset |
| 401 | Credenciales inválidas, JWT ausente/expirado. El frontend borra el token y redirige a `/login` |
| 403 | Borrar un diagnóstico ajeno |
| 409 | Registro con email ya verificado |
| 500 | Error no controlado (el fallo de IA **no** produce 500: se devuelve el fallback) |
