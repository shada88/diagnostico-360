# Arquitectura

## 1. Visión general

Sistema cliente-servidor en un **monorepo** con dos runtimes independientes que comparten el modelo de dominio de Madurez

```
                        ┌──────────────────────────────────────────────┐
                        │                 Navegador                     │
                        │  Next.js 16 (App Router, React 19, CSR)       │
                        │  ├── app/            rutas                    │
                        │  ├── components/     UI por feature           │
                        │  ├── domain/         lógica pura (findings,   │
                        │  │                   radar, maturity)            │
                        │  └── lib/api + http  Axios + JWT (localStorage)│
                        └──────────────────────┬───────────────────────┘
                                               │ HTTPS · JSON · Bearer JWT
                        ┌──────────────────────▼───────────────────────┐
                        │            NestJS 11 API (:3006)              │
                        │  identity/   ─ auth, users                    │
                        │  diagnostic/ ─ surveys, responses, evaluations│
                        │  ai/         ─ adaptador LLM                  │
                        │  common/     ─ prisma, mail, cron             │
                        │  analytics/  ─ logger de métricas             │
                        │  config/     ─ Zod schema                     │
                        └───┬──────────────┬──────────────┬────────────┘
                            │ Prisma        │ HTTPS        │ HTTPS
                  ┌─────────▼────┐  ┌───────▼───────┐ ┌────▼──────────┐
                  │ PostgreSQL 15│  │ Gemini / Groq │ │ Resend · Google│
                  │ (Supabase*)  │  │ (LLM)         │ │ OAuth          │
                  └──────────────┘  └───────────────┘ └───────────────┘
```
\* `DIRECT_URL` en el schema y las claves `SUPABASE_*` en la config indican Supabase como Postgres gestionado en producción; localmente se usa Docker.

---

## 2. Stack tecnológico

### Backend (`backend/`)

| Capa | Tecnología | Uso |
|------|------------|-----|
| Framework | **NestJS 11** (Express) | Módulos, DI, guards, pipes |
| Lenguaje | **TypeScript 5.9** | Strict parcial |
| ORM | **Prisma 5.22** | Acceso a datos, migraciones, seed |
| Base de datos | **PostgreSQL 15** | Persistencia |
| Auth | `@nestjs/passport`, `passport-jwt`, `passport-google-oauth20`, `@nestjs/jwt`, `bcrypt` | JWT Bearer + Google OAuth 2.0 |
| Validación | `class-validator` / `class-transformer` (DTOs), **Zod 4** (config) | Entrada HTTP y variables de entorno |
| Eventos | `@nestjs/event-emitter` | Desacople de emails (pub/sub en proceso) |
| Jobs | `@nestjs/schedule` | Cron de recordatorios |
| IA | `@google/genai`, `groq-sdk` | Análisis narrativo |
| Email | `resend` | Transaccional |
| Docs | `@nestjs/swagger` | OpenAPI en `/api` |
| Testing | Jest 30 + ts-jest + supertest | Unit / integración |

### Frontend (`frontend/`)

| Capa | Tecnología | Uso |
|------|------------|-----|
| Framework | **Next.js 16.1** (App Router) | Rutas, fuentes, metadata |
| UI | **React 19.2** | Componentes cliente (`'use client'`) |
| Estilos | **Tailwind CSS v4** + CSS custom properties | Design tokens, temas claro/oscuro |
| Animación | **Framer Motion 12** | Transiciones del cuestionario y dashboard |
| Gráficos | **Recharts 3** | Radar interactivo, evolución histórica |
| HTTP | **Axios** | Cliente con interceptores JWT / 401 |
| Iconos | `lucide-react` | |
| Utilidades | `clsx`, `tailwind-merge`, `react-markdown`, `country-state-city` | |

---

## 3. Estilo arquitectónico

### 3.1 Backend: Monolito modular + Use Cases

La estructura de carpetas **grita el dominio** (*Screaming Architecture*): `identity/` y `diagnostic/` son *bounded contexts*; `ai/`, `common/`, `analytics/` y `config/` son infraestructura transversal.

```
backend/src/
├── identity/                      ◀ Bounded context: Identidad
│   ├── auth/
│   │   ├── auth.controller.ts     adaptador HTTP (delgado)
│   │   ├── use-cases/             1 clase = 1 caso de uso
│   │   │   ├── register / login / validate-user / verify-email
│   │   │   ├── resend-verification-code / forgot-password / reset-password
│   │   │   └── google-login-or-register
│   │   ├── jwt.strategy.ts · google.strategy.ts
│   │   └── dto/
│   └── users/                     servicio + controller de perfil
│
├── diagnostic/                    ◀ Bounded context: Diagnóstico
│   ├── surveys/                   lectura de la plantilla
│   ├── responses/                 ciclo de vida del intento (start → answers → finalize)
│   └── evaluations/
│       ├── scoring.service.ts            cálculo puro (sin I/O)
│       ├── rule-based-insight.service.ts metadatos de madurez, alertas, modo
│       ├── ai-analysis.service.ts        prompt + parseo + fallback
│       ├── use-cases/
│       │   ├── calculate-results         orquesta cálculo + persistencia + IA
│       │   ├── get-dashboard             arma el DashboardDTO
│       │   ├── get-answers-by-dimension
│       │   └── get-or-generate-evolution cache-aside sobre EvolutionAnalysis
│       └── dashboard.controller.ts · evaluations.controller.ts
│
├── ai/          AiService: Gemini (retry exponencial ×3) → fallback Groq
├── common/      PrismaService · MailService (@OnEvent) · ReminderCronService (@Cron)
├── analytics/   AnalyticsLoggerService (métricas vía Logger)
└── config/      configSchema (Zod) → AppConfig tipado
```

**Principios aplicados**

- **Controllers delgados**: solo traducen HTTP → caso de uso.
- **Use Case por operación** (en auth y evaluations): SRP, testeables en aislamiento.
- **Servicios de dominio puros**: `ScoringService` no hace I/O; recibe respuestas y devuelve números.
- **Eventos de dominio** para efectos secundarios: `user.registered`, `password.reset`, `survey.completed`, `diagnosis.reminder` → `MailService`. El caso de uso no conoce a Resend.
- **Adaptador de proveedor IA** (`AiService.generate`): una sola interfaz; la estrategia de fallback está encapsulada.
- **Degradación elegante**: si la IA falla, el diagnóstico se guarda igual y se devuelve un `fallback` tipado.
- **Config fail-fast**: la app no arranca si las variables requeridas no validan contra el schema Zod.

> **Aún no es hexagonal puro**: los use cases dependen directamente de `PrismaService` (no hay puertos/repositorios). Es una decisión pragmática documentada en `openspec/changes/archive/2026-04-18-backend-use-cases/`.

### 3.2 Frontend: Feature-based + capa de dominio

```
frontend/src/
├── app/                              rutas (App Router)
│   ├── page.tsx                      landing
│   ├── login/ · register/
│   ├── auth/profile/                 completar perfil
│   ├── auth/google/callback/         recibe el token OAuth
│   ├── personal/diagnostico/         cuestionario
│   └── personal/resultados/[id]/     dashboard (?view=informe|areas-clave|evolucion)
├── components/
│   ├── features/auth/                AuthForm, EmailVerification, ProfileForm
│   ├── features/survey/              SurveyWizard, QuestionCard
│   ├── features/dashboard/
│   │   ├── modules/                  Module1Header, Module2Impact, Module3Strengths,
│   │   │                             Module6Action, ModuleFeedback, AreasClaveView,
│   │   │                             EducationalSection
│   │   ├── shared/                   InteractiveRadar, ScoreCircle, CollapsibleSection…
│   │   └── EvolucionView.tsx
│   ├── shared/                       GlobalHeader, ui/ (Button, SearchableSelect, ThemeToggle)
│   └── layout/MainLayout.tsx
├── domain/                           ◀ TypeScript puro, sin React
│   ├── maturity/                        tipos, labels, mapeo área→dimensión
│   ├── findings/                     detectores + enriquecimiento IA
│   └── radar/                        brechas, gap, sub-scoring
├── lib/
│   ├── api/                          un módulo por recurso (auth, survey, responses, dashboard)
│   ├── http/client.ts                instancia Axios + interceptores
│   ├── config/                       env, contact, tokens
│   └── constants/
└── types/                            DTOs alineados con el backend
```

**Patrones**: *Container/Presentational* (la página de resultados obtiene datos y los módulos presentan), *Chain of Responsibility* en los detectores de hallazgos, *Theme Provider* con script inline anti-flash.

---

## 4. Flujos principales

### 4.1 Registro y verificación

```
Cliente            AuthController       RegisterUseCase        EventEmitter      MailService → Resend
  │ POST /auth/register ─▶│                    │                     │                 │
  │                       │── execute(dto) ───▶│ bcrypt(10) + código │                 │
  │                       │                    │ 6 dígitos + rol USER│                 │
  │                       │                    │── emit user.registered ─▶│── send ───▶│
  │ ◀── 201 {message} ────│                    │                     │                 │
  │ POST /auth/verify-email {email, code} ─▶ VerifyEmailUseCase → isEmailVerified = true
  │ POST /auth/login ─▶ ValidateUser (bcrypt.compare) → LoginUseCase → JWT (60 min)
```

### 4.2 Ciclo del diagnóstico

```
SurveyWizard                      API                                   BD / Externos
  │ GET /users/me ────────────────▶ perfil + último intento
  │   (si perfil incompleto → /auth/profile; si ya completó → /resultados/:id)
  │ GET /surveys ─────────────────▶ encuesta activa con secciones y preguntas
  │ POST /responses ──────────────▶ crea SurveyAttempt (IN_PROGRESS)
  │ POST /responses/:id/answers ──▶ upsert Answer (×30, autoavance ~400 ms)
  │ POST /responses/:id/finalize ─▶ CalculateResultsUseCase
  │                                  ├─ ScoringService → áreas, dimensiones, IG, alertas
  │                                  ├─ upsert DiagnosticResult + status COMPLETED
  │                                  ├─ AiAnalysisService → Gemini|Groq → AiEvaluation (JSON)
  │                                  ├─ AnalyticsLogger
  │                                  └─ emit survey.completed → email con link
  │ redirect /personal/resultados/:id
  │ GET /results/:id + /results/:id/answers ─▶ DashboardDTO
  │ generateFindings(dashboard, answers)  (frontend, determinístico)
```

### 4.3 Evolución

`GET /results/:currentId/evolution/:previousId` → se arman ambos dashboards → se busca en `EvolutionAnalysis` por el par → si no existe, la IA genera el análisis de deltas (veredicto `PROGRESO | ESTANCAMIENTO | RETROCESO | MIXTO`) y se cachea (*cache-aside*).

### 4.4 Recordatorio a 30 días

`ReminderCronService` corre **cada hora**: busca intentos `COMPLETED` con `endedAt ≤ hoy − 30 días`, sin `reminderSentAt`, sin intento posterior del mismo usuario, y solo envía si la hora local del usuario (`User.timezone`) está entre **8 y 10 am**. Marca `reminderSentAt` para no repetir.

---

## 5. Modelo de datos

```
User 1───* UserRole *───1 Role                (RBAC: ADMIN, USER)
 │
 └──1───* SurveyAttempt *───1 Survey 1───* Section 1───* Question
              │                                            │
              ├──1───* Answer *────────────────────────────┘
              ├──1───1 DiagnosticResult   (10 áreas + D1–D3 + IG + 4 niveles de madurez + 4 alertas)
              └──1───1 AiEvaluation       (JSON del AiAnalysisDTO)

EvolutionAnalysis (currentAttemptId, previousAttemptId) único → JSON cacheado
```

| Modelo | Notas |
|--------|-------|
| `User` | `password` bcrypt; `verificationCode` compartido para verificación y reset; `timezone` (default `America/New_York`); `deletedAt` (soft delete, no usado aún). |
| `SurveyAttempt` | `userId` **opcional** (permite intentos anónimos); `reminderSentAt`; `deletedAt`. |
| `Answer` | Único por `(attemptId, questionId)` → el guardado es idempotente (upsert). |
| `DiagnosticResult` | **Desnormalizado a propósito**: puntajes como columnas para lectura rápida y analítica SQL directa. |
| `AiEvaluation` / `EvolutionAnalysis` | Contenido IA como `String` JSON (no `Json` de Prisma). |

Migraciones en `backend/prisma/migrations/`: `business_domain_pivot` (pivote de dominio), `add_city_to_user`, `add_timezone_reminder_evolution`.

---

## 6. Decisiones de arquitectura (ADR resumidos)

| Decisión | Alternativa descartada | Razón |
|----------|------------------------|-------|
| Monolito modular NestJS | Microservicios | Equipo chico, un solo dominio; los módulos permiten extraer servicios después. |
| Cálculo en backend, interpretación en frontend | Todo en backend | El cálculo es fuente de verdad persistida; la interpretación de UI itera rápido sin migraciones. |
| IA con fallback multi-proveedor | Un solo proveedor | Disponibilidad: Gemini primero (costo/calidad), Groq como respaldo de baja latencia. |
| IA persistida al finalizar | Generar en cada visita | Costo y latencia: un diagnóstico = una llamada; evolución cacheada por par. |
| Emails vía eventos | Llamada directa a Resend | Desacople y tolerancia a fallos (un email fallido no rompe el flujo). |
| Config validada con Zod | `process.env` disperso | Fail-fast y tipado (`ConfigService<AppConfig, true>`). |
| Resultados desnormalizados | Calcular on-the-fly | Lectura O(1) del dashboard e historial. |
