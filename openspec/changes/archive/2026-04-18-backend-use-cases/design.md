# Design: backend-use-cases

## Technical Approach

Extract 12 use-case classes from three fat NestJS services, wire controllers directly, and fix the last config violation in AiService. Services are deleted entirely — no forwarding layer. Controllers become thin HTTP adapters that inject use cases directly.

## Architecture Decisions

| Decision | Choice | Alternatives | Rationale |
|----------|--------|--------------|-----------|
| Service fate | Delete entirely | Keep as thin orchestrators | Zero-value forwarding layer adds coupling with no benefit |
| Composition | `CalculateResultsUseCase` injects `GetDashboardUseCase` | Inline dashboard assembly | Avoids duplication; no circular dep (GetDashboard does not depend back) |
| `ValidatedUser` location | `auth/dto/validated-user.type.ts` | Keep in service | service.ts is deleted; Passport strategies + use cases need the type |
| `groqClient` type | `unknown` + narrow cast at call site | `any` | Eliminates the only `any` in AiService; Groq SDK has no TS types |
| AiService config | `ConfigService<AppConfig, true>` + `ai` namespace in Zod schema | Keep flat keys | Aligns with Change #1 typed config; optional keys preserve warn-and-disable |

## Data Flow

```
HTTP: POST /responses/:id/finalize
  └─→ ResponsesService.finalize(attemptId)
        └─→ CalculateResultsUseCase.execute(attemptId)
              ├─→ PrismaService (answers, upsert DiagnosticResult, update attempt)
              ├─→ ScoringService (pure — unchanged)
              ├─→ AiAnalysisService (non-blocking fire-and-forget)
              └─→ GetDashboardUseCase.execute(attemptId) ──→ DashboardDTO

HTTP: GET /results/:id
  └─→ DashboardController → GetDashboardUseCase.execute(id)

HTTP: GET /results/:currentId/evolution/:previousId
  └─→ DashboardController
        ├─→ GetDashboardUseCase.execute(currentId)
        ├─→ GetDashboardUseCase.execute(previousId)
        └─→ GetOrGenerateEvolutionUseCase.execute(...)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `diagnostic/evaluations/constants.ts` | Create | SUB_LABELS, DIMENSION_SUBS, DIMENSION_LABELS |
| `diagnostic/evaluations/use-cases/calculate-results.use-case.ts` | Create | UC-01 |
| `diagnostic/evaluations/use-cases/get-dashboard.use-case.ts` | Create | UC-02 |
| `diagnostic/evaluations/use-cases/get-answers-by-dimension.use-case.ts` | Create | UC-03 |
| `diagnostic/evaluations/use-cases/get-or-generate-evolution.use-case.ts` | Create | UC-04 |
| `identity/auth/dto/validated-user.type.ts` | Create | `ValidatedUser` interface relocated from auth.service |
| `identity/auth/use-cases/register.use-case.ts` | Create | UC-05 |
| `identity/auth/use-cases/verify-email.use-case.ts` | Create | UC-06 |
| `identity/auth/use-cases/resend-verification-code.use-case.ts` | Create | UC-07 |
| `identity/auth/use-cases/login.use-case.ts` | Create | UC-08 |
| `identity/auth/use-cases/validate-user.use-case.ts` | Create | UC-09 |
| `identity/auth/use-cases/forgot-password.use-case.ts` | Create | UC-10 |
| `identity/auth/use-cases/reset-password.use-case.ts` | Create | UC-11 |
| `identity/auth/use-cases/google-login-or-register.use-case.ts` | Create | UC-12 (injects LoginUseCase) |
| `diagnostic/evaluations/evaluations.service.ts` | Delete | Replaced by UC-01, UC-02, UC-03 |
| `diagnostic/evaluations/evolution-analysis.service.ts` | Delete | Replaced by UC-04 |
| `identity/auth/auth.service.ts` | Delete | Replaced by UC-05–UC-12 |
| `diagnostic/evaluations/evaluations.module.ts` | Modify | Register 4 use cases; export CalculateResultsUseCase |
| `identity/auth/auth.module.ts` | Modify | Register 8 use cases |
| `diagnostic/evaluations/dashboard.controller.ts` | Modify | Inject UC-02, UC-03, UC-04 directly |
| `diagnostic/evaluations/evaluations.controller.ts` | Modify | Inject UC-01 directly |
| `identity/auth/auth.controller.ts` | Modify | Inject relevant use cases per route |
| `diagnostic/responses/responses.service.ts` | Modify | Inject CalculateResultsUseCase instead of EvaluationsService |
| `config/config.schema.ts` | Modify | Add `ai` namespace with optional keys |
| `config/configuration.ts` | Modify | Map GEMINI_API_KEY / GROQ_API_KEY to ai namespace |
| `ai/ai.service.ts` | Modify | Use typed ConfigService<AppConfig, true>; groqClient: unknown |

## Interfaces / Contracts

```ts
// auth/dto/validated-user.type.ts
export interface ValidatedUser {
  id: string;
  email: string;
  name: string;
  isProfileComplete: boolean;
  userRoles: Array<{ role: { name: string } }>;
}

// config/config.schema.ts — delta
ai: z.object({
  geminiApiKey: z.string().optional(),
  groqApiKey:   z.string().optional(),
}),

// config/configuration.ts — delta
ai: {
  geminiApiKey: process.env.GEMINI_API_KEY,
  groqApiKey:   process.env.GROQ_API_KEY,
},

// evaluations.module.ts — after
providers: [
  PrismaService, ScoringService, RuleBasedInsightService, AiAnalysisService,
  GetDashboardUseCase, GetAnswersByDimensionUseCase,
  GetOrGenerateEvolutionUseCase, CalculateResultsUseCase,
],
exports: [CalculateResultsUseCase],
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | AiService boots without keys → clients null | Jest, mock ConfigService |
| Unit | AiService boots with keys → clients non-null | Jest, mock ConfigService |
| Unit | Each use case's `execute()` logic | Jest, mock all deps |
| Integration | `ResponsesService` → `CalculateResultsUseCase` chain | Existing tests, update DI |

## Migration / Rollout

No migration required. All changes are internal refactors: same HTTP routes, same DTOs, same Prisma queries. Deploy in a single commit batch per domain (evaluations first, then auth, then config fix).

## Open Questions

- None blocking. All technical decisions resolved above.
