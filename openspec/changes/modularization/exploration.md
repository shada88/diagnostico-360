# Exploration: Full-project modularization for scalable architecture

**Date**: 2026-04-17
**Status**: Complete
**Change**: modularization

---

## Current State

The project has two runtimes: a Next.js 16 (App Router) frontend and a NestJS 11 backend. Both share a domain model around the de Madurez methodology — 3 dimensions, 10 subdimensions, cross-inference alerts, and an AI enrichment layer.

### Frontend structure today
```
frontend/src/
├── app/                         — App Router pages (flat, 6 routes)
├── components/
│   ├── features/
│   │   ├── auth/                — 3 components
│   │   ├── dashboard/
│   │   │   ├── modules/         — 6 module components (Module1–Module6, AreasClaveView)
│   │   │   └── EvolucionView.tsx
│   │   └── survey/              — 2 components
│   ├── layout/                  — MainLayout (1 file)
│   └── shared/ui/               — Button, SearchableSelect, ThemeToggle (primitives)
├── lib/
│   ├── api.ts                   — Axios instance + all API calls in one file
│   ├── dashboard-api.ts         — Dashboard-specific API (partially separated)
│   ├── findings-engine.ts       — Domain engine (deterministic + AI enrichment)
│   ├── constants/               — config.ts, ui-texts.ts
│   ├── cities.ts / countries.ts — static data
│   ├── theme.tsx                — theme context
│   └── utils.ts
├── types/
│   ├── dashboard.ts             — Domain DTOs (aligned with backend)
│   └── index.ts                 — Legacy types (stale fields from a previous domain)
```

### Backend structure today
```
backend/src/
├── identity/
│   ├── auth/       — JWT + Google OAuth + email verification
│   └── users/      — profile management
├── diagnostic/
│   ├── surveys/    — survey CRUD
│   ├── responses/  — answer submission + finalize
│   └── evaluations/
│       ├── evaluations.service.ts       — orchestrates scoring + AI + DB
│       ├── scoring.service.ts           — pure math (maturity classification)
│       ├── rule-based-insight.service.ts— cross-alerts + analytical mode
│       ├── ai-analysis.service.ts       — LLM prompt + response
│       ├── evolution-analysis.service.ts— multi-attempt comparison
│       ├── dashboard.controller.ts      — GET endpoints
│       └── evaluations.controller.ts    — POST finalize
├── ai/             — AiService (Gemini/Groq wrapper)
├── analytics/      — event logging
└── common/
    ├── prisma.service.ts
    ├── mail.service.ts         — email templates (inline HTML)
    └── reminder-cron.service.ts — 30-day reminder cron
```

---

## Affected Areas

### Frontend
- `frontend/src/lib/api.ts` — monolithic API client mixes auth + survey + profile in one object
- `frontend/src/components/features/dashboard/modules/Module3Radar.tsx` — 640 lines; contains 5+ sub-components AND domain logic (detectBrechas, GAP calculator) inline
- `frontend/src/components/features/dashboard/modules/Module6Action.tsx` — hardcoded WhatsApp number (`15555550100`) and support URL (`15555550199`) directly in JSX as module-level constants
- `frontend/src/components/shared/GlobalHeader.tsx` — second hardcoded WhatsApp number (`15555550199`)
- `frontend/src/lib/constants/config.ts` — uses `bg-red-500`, `bg-orange-400` (Tailwind utility class strings as config values — breaks if class isn't present at build time)
- `frontend/src/types/index.ts` — stale fields from a previous domain not reflected in backend
- `frontend/src/app/personal/resultados/[id]/page.tsx` — results page is a Server-side page doing data fetching AND rendering; no explicit loading/error boundary components
- `frontend/src/lib/findings-engine.ts` — well-structured domain engine but lives in `lib/` instead of a `domain/` directory, blurring its status

### Backend
- `backend/src/diagnostic/evaluations/evaluations.service.ts` — orchestrator service: 356 lines, directly calls Prisma + ScoringService + AiAnalysisService + RuleBasedInsightService + Analytics. Multiple responsibilities.
- `backend/src/common/mail.service.ts` — inline HTML email templates (no template engine, no extraction to files or constants)
- `backend/src/diagnostic/responses/responses.service.ts` and `reminder-cron.service.ts` — both independently build `FRONTEND_URL` string for redirect URLs (scattered `process.env` usage)
- `backend/src/identity/auth/auth.controller.ts` — direct `process.env.FRONTEND_URL` call
- `backend/src/diagnostic/evaluations/evaluations.service.ts` — `SUB_LABELS`, `DIMENSION_SUBS`, `DIMENSION_LABELS` static maps are defined at module level but duplicated conceptually in `scoring.service.ts` and partially in the frontend's `Module3Radar.tsx` (`DIMENSION_AREA_MAP`)

### Cross-cutting
- `frontend/src/lib/api.ts` — single axios instance but no typed error handling layer
- No shared types package between frontend and backend — `types/dashboard.ts` comment says "aligned with backend" but is manually synced
- Error handling: ad-hoc (try/catch scattered, `console.error` in services, no structured error format contract)
- Logging: `console.log/error` throughout backend; no structured logging (no Winston, no Pino)
- Config management: `process.env` accessed directly in 4+ services with inline fallbacks

---

## Pain Points by Layer

### Frontend pain points
1. **Module3Radar.tsx is a monolith** (640 lines): contains chart rendering, gap calculations, brecha detection, and 5+ inline sub-components. Violates single responsibility.
2. **Hardcoded business config in JSX**: Two different WhatsApp numbers hardcoded in `Module6Action.tsx` and `GlobalHeader.tsx`. If the number changes, it's a bug hunt.
3. **api.ts mixes domains**: Auth, survey, and profile calls are in one `surveyApi` object with loose typing (`any` used in `register`, `updateProfile`, `getAttempt`).
4. **Domain logic in `lib/` without explicit domain boundary**: `findings-engine.ts` is a pure domain module but collocated with API clients and utilities. No `domain/` or `core/` layer.
5. **Stale types in `types/index.ts`**: legacy fields from a previous domain are not reflected in backend DTOs — dead weight that can mislead contributors.
6. **config.ts uses Tailwind utility strings as values**: `COLORS.CRITICAL: 'bg-red-500'` — design token system (CSS vars) was built but config.ts bypasses it entirely.

### Backend pain points
1. **EvaluationsService is an orchestrator-service anti-pattern**: It manages Prisma transactions, scoring computation, AI analysis, analytics logging, and dashboard DTO assembly. Should be split into use-cases.
2. **Inline HTML email templates in MailService**: 4 email templates are raw HTML strings inside the service methods. Zero reusability, untestable, and hard to maintain.
3. **Scattered `process.env` calls with inline fallbacks**: `FRONTEND_URL` default `'http://localhost:3000'` appears in 3 separate files. Config module is imported globally but env vars are still accessed directly in services.
4. **Domain label maps duplicated across layers**: `SUB_LABELS`/`DIMENSION_LABELS` exist in `evaluations.service.ts`; `DIMENSION_AREA_MAP` is re-declared in `Module3Radar.tsx`. Single source of truth is missing.
5. **`console.log` as logging**: No structured logger. In production, debugging requires grepping raw stdout.

### Cross-cutting pain points
1. **No shared types contract**: Frontend `types/dashboard.ts` is manually synced with `dto/dashboard.dto.ts`. Any backend DTO change requires manual frontend update — no shared package, no codegen.
2. **Error handling is ad-hoc**: Backend returns NestJS default errors; frontend catches generically. No structured error contract (error codes, typed shapes).
3. **No environment config abstraction**: Both runtimes access env vars inline. Backend has `ConfigModule` globally available but doesn't inject config values through a typed `ConfigService` consistently.

---

## Approaches

### Approach A: Big-bang monorepo restructure
Migrate to Nx/Turborepo monorepo with a shared `packages/domain` that exports types, constants, and domain logic used by both frontend and backend.

- Pros: Eliminates type duplication permanently; enforces shared domain model; scales for team
- Cons: High migration effort; requires tooling changes (build, CI); risk of breaking running app
- Effort: **High**

### Approach B: Incremental modularization (series of scoped changes)
Keep current repo structure but reorganize internally: split API client, extract domain logic to `domain/` layer, centralize config/constants, refactor EvaluationsService into use-cases, replace inline email HTML with templates.

- Pros: Low risk; each change is independently deployable; no build system changes
- Cons: Type duplication persists until a later "shared types" step; requires discipline to not regress
- Effort: **Medium**

### Approach C: Config + constants normalization only
Focus only on eliminating hardcoded values (WhatsApp numbers, Tailwind class strings, scattered env vars) without touching architecture.

- Pros: Fast; immediate reduction of "magic values" bugs
- Cons: Does nothing for structural complexity; monolith modules remain
- Effort: **Low**

---

## Recommendation

**Approach B — Incremental modularization** as a series of 4–5 scoped changes:

1. **`config-normalization`** — Centralize all hardcoded values: WhatsApp numbers → config; Tailwind class strings → CSS var references; `process.env` calls → typed ConfigService injection
2. **`frontend-domain-layer`** — Create `frontend/src/domain/` with: findings-engine, maturity constants, dimension maps; split Module3Radar into sub-components + pure calculation functions
3. **`api-client-split`** — Split `api.ts` into domain-namespaced clients (`authApi`, `surveyApi`, `dashboardApi`); add typed error handling layer
4. **`backend-use-cases`** — Extract EvaluationsService orchestration into explicit use-cases (`CalculateResultsUseCase`, `BuildDashboardUseCase`); move email templates to `templates/` directory
5. **`shared-types`** *(optional, later)* — Extract dashboard DTOs into a shared package or add codegen

This approach delivers tangible value in each step without blocking the product roadmap.

---

## Top 5 Refactor Opportunities (ranked by impact)

| # | Opportunity | Files | Impact |
|---|-------------|-------|--------|
| 1 | Split `EvaluationsService` into use-cases | `evaluations.service.ts` | Testability, single responsibility |
| 2 | Extract hardcoded WhatsApp/contact config to central constants | `Module6Action.tsx`, `GlobalHeader.tsx` | Bug prevention, maintainability |
| 3 | Split `Module3Radar.tsx` into sub-components + domain functions | `Module3Radar.tsx` | Readability, reusability |
| 4 | Replace Tailwind strings in `config.ts` with CSS var tokens | `config.ts`, consumers | Design system consistency |
| 5 | Centralize env/config access via ConfigService injection | `mail.service.ts`, `auth.controller.ts`, `reminder-cron.service.ts`, `responses.service.ts` | Consistency, 12-factor compliance |

---

## Risks

- **218 inline color values** (`rgba`, `#hex`) detected across 16 frontend files — globals.css tokens are defined but not fully adopted. Normalizing all uses risks visual regressions if tokens don't match the inline values exactly.
- **Stale types in `types/index.ts`** (legacy fields) suggest the app may have gone through a pivot. Removing them safely requires confirming no runtime code depends on them.
- **No tests on frontend** (no Vitest/Jest). Refactoring UI components carries higher risk since changes can't be validated automatically.
- **Backend tests exist (Jest)** but no existing spec files were found at init time — test coverage must be established before refactoring services.
- **Two different WhatsApp numbers** in two files — it's unclear which is canonical. Needs business confirmation before consolidating.

---

## Ready for Proposal

**Yes** — the scope is clear and the recommended approach (Approach B, incremental) can be broken into 4–5 independent proposals. The next phase should produce a formal proposal with the change scope, affected files, and a specific order of operations.

The orchestrator should present the user with the option to tackle the full series as one change (modularization) or pick the highest-priority slice first.
