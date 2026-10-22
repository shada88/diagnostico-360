# Proposal — Change #4: backend-use-cases

> Extract use cases from fat NestJS services into single-responsibility classes, fix one config violation along the way.

---

## 1. Intent

### Problem

Three backend services have grown into "god services" that mix unrelated business operations behind a single Nest provider:

- **`EvaluationsService`** (~356 LOC) holds three independent use cases stitched together: a heavy write-side flow (`calculateAndSaveResults`), a read-side DTO assembler (`getDashboard`), and a pure query (`getAnswersByDimension`). The three share nothing but a constructor and a Prisma client.
- **`AuthService`** (~158 LOC) exposes 8 self-contained flows (`register`, `verifyEmail`, `resendVerificationCode`, `login`, `validateUser`, `forgotPassword`, `resetPassword`, `googleLoginOrRegister`). Each is independently testable but today they all share state through one class.
- **`EvolutionAnalysisService`** (~218 LOC) mixes a small "read-through cache" use case with a long inline AI prompt construction.

Plus, **`AiService`** still reads `GEMINI_API_KEY` and `GROQ_API_KEY` through the **flat `ConfigService`** — that bypasses the Zod-validated typed `AppConfig` introduced in Change #1 (`config-normalization`). It is the only remaining config violation in the backend after that change.

### Why this matters

1. **Testability**: a single use case mocks 1–3 collaborators; today's services force every test to mock 5+.
2. **Cognitive load**: a contributor opening `evaluations.service.ts` sees ~356 LOC with three unrelated concerns. A `CalculateResultsUseCase.ts` says exactly what it does in its name.
3. **Composition**: future cron jobs, queue consumers and admin endpoints can reuse a use case directly — they don't need the whole "service".
4. **Architectural integrity**: Change #1 established a typed config contract. Leaving `AiService` on the flat `ConfigService.get<string>(...)` undermines that contract and lets the violation spread.
5. **Future-proofing the dashboard N+1**: extracting `GetDashboardUseCase` and `GetAnswersByDimensionUseCase` as discrete units makes the upcoming dashboard read-model split (out of scope here) trivial — we'll already have the seams.

### Non-problems (deliberately)

- We are **not** introducing CQRS, command buses, or mediators. Standards say "use cases as plain classes injected via DI". We honor that.
- We are **not** moving towards hexagonal/ports-and-adapters. Use cases will keep depending on `PrismaService` and `EventEmitter2` directly. That decision can be revisited later.
- We are **not** changing controller signatures or HTTP contracts. This is a pure internal refactor.

---

## 2. Approach

### Use-case class shape

Every use case is a `@Injectable()` class with **one public method**, by convention named `execute(...)`:

```ts
@Injectable()
export class CalculateResultsUseCase {
  constructor(
    private prisma: PrismaService,
    private scoring: ScoringService,
    private ruleInsight: RuleBasedInsightService,
    private aiAnalysis: AiAnalysisService,
    private analytics: AnalyticsLoggerService,
    private getDashboard: GetDashboardUseCase, // <-- composition
  ) {}

  async execute(attemptId: string): Promise<DashboardDTO | null> { /* ... */ }
}
```

Conventions:

- **Suffix**: `UseCase` (per project standards — no `Command`, `Handler`, `Interactor`).
- **Public surface**: a single `execute(input): Promise<output>` method. Keeps the contract explicit and discoverable.
- **DI**: registered in the same Nest module that owns the previous service (`EvaluationsModule`, `AuthModule`).
- **Composition**: a use case may inject another use case (e.g. `CalculateResultsUseCase` calls `GetDashboardUseCase` at the end).
- **No statics, no constants moved unless local**: shared constants like `SUB_LABELS`, `DIMENSION_SUBS`, `DIMENSION_LABELS` move to `evaluations/constants.ts` so both `GetDashboardUseCase` and `GetAnswersByDimensionUseCase` import from one source.

### What happens to the old services?

**Delete them.** Keeping a thin orchestrator like:

```ts
class EvaluationsService {
  constructor(private calc: CalculateResultsUseCase, private dash: GetDashboardUseCase) {}
  calculateAndSaveResults = (id) => this.calc.execute(id);
  getDashboard = (id) => this.dash.execute(id);
}
```

…adds zero value, just a forwarding layer. Controllers will inject the use cases directly. This is consistent with the project standard "use-cases as plain classes injected via DI, not commands/handlers" — wrapping them again would be ceremony.

**Exception**: `EvolutionAnalysisService` becomes a single `GetOrGenerateEvolutionUseCase` (it's already 1:1). The "service" file is renamed and the class renamed; no orchestrator survives.

### Controllers

`EvaluationsController`, `DashboardController`, `AuthController`, and any other consumer get their constructor signatures updated to inject use cases instead of services. No HTTP-level changes, no DTO changes.

### `AiService` config violation

Smallest fix possible:

1. Inject the typed `AppConfigService` (the Zod-validated config introduced in Change #1) instead of `ConfigService`.
2. Replace `this.configService.get<string>('GEMINI_API_KEY')` with `this.appConfig.ai.geminiApiKey` (exact path depends on the schema shape — verify in `backend/src/config/`).
3. If the Zod schema does not yet include `GEMINI_API_KEY` / `GROQ_API_KEY`, **add them** as optional strings in the same change. They were already environment variables; we are formalizing them.

This stays surgical: `AiService` keeps its dual-provider fallback logic, retry loop, all behavior. Only the source of the keys changes.

### Scope summary

**IN scope:**

| File | Action |
|------|--------|
| `backend/src/diagnostic/evaluations/evaluations.service.ts` | Delete; split into 3 use cases |
| `backend/src/diagnostic/evaluations/evaluations.controller.ts` | Inject use cases instead of service |
| `backend/src/diagnostic/evaluations/dashboard.controller.ts` | Inject `GetDashboardUseCase` instead of service |
| `backend/src/diagnostic/evaluations/evaluations.module.ts` | Register use cases as providers |
| `backend/src/diagnostic/evaluations/evolution-analysis.service.ts` | Rename to `get-or-generate-evolution.use-case.ts`, class to `GetOrGenerateEvolutionUseCase` |
| `backend/src/identity/auth/auth.service.ts` | Delete; split into 8 use cases |
| `backend/src/identity/auth/auth.controller.ts` | Inject use cases |
| `backend/src/identity/auth/auth.module.ts` | Register use cases |
| `backend/src/ai/ai.service.ts` | Switch to typed `AppConfigService` |
| `backend/src/config/` (Zod schema) | Add `GEMINI_API_KEY`, `GROQ_API_KEY` if missing |
| `backend/src/diagnostic/evaluations/constants.ts` | New file — extract `SUB_LABELS`, `DIMENSION_SUBS`, `DIMENSION_LABELS` |
| All callers of the deleted services | Update constructor injections |

**OUT of scope** (see §5).

---

## 3. Proposed Structure

```
backend/src/
  diagnostic/
    evaluations/
      use-cases/
        calculate-results.use-case.ts          # CalculateResultsUseCase
        get-dashboard.use-case.ts              # GetDashboardUseCase
        get-answers-by-dimension.use-case.ts   # GetAnswersByDimensionUseCase
        get-or-generate-evolution.use-case.ts  # GetOrGenerateEvolutionUseCase
      constants.ts                             # SUB_LABELS, DIMENSION_SUBS, DIMENSION_LABELS
      ai-analysis.service.ts                   # untouched
      scoring.service.ts                       # untouched (already clean)
      rule-based-insight.service.ts            # untouched (already clean)
      evaluations.controller.ts                # updated DI
      dashboard.controller.ts                  # updated DI
      evaluations.module.ts                    # registers use cases
      dto/

  identity/
    auth/
      use-cases/
        register.use-case.ts                   # RegisterUseCase
        verify-email.use-case.ts               # VerifyEmailUseCase
        resend-verification-code.use-case.ts   # ResendVerificationCodeUseCase
        login.use-case.ts                      # LoginUseCase
        validate-user.use-case.ts              # ValidateUserUseCase
        forgot-password.use-case.ts            # ForgotPasswordUseCase
        reset-password.use-case.ts             # ResetPasswordUseCase
        google-login-or-register.use-case.ts   # GoogleLoginOrRegisterUseCase
      auth.controller.ts                       # updated DI
      auth.module.ts                           # registers use cases
      jwt.strategy.ts                          # untouched
      google.strategy.ts                       # untouched
      dto/

  ai/
    ai.service.ts                              # uses typed AppConfigService
```

### Naming convention

- **Filename**: `kebab-case.use-case.ts` — matches Nest community convention and is unambiguous in directory listings.
- **Classname**: `PascalCaseUseCase` — `RegisterUseCase`, not `Register` or `RegisterCommand`.
- **Folder**: `use-cases/` (plural, kebab-case) inside the feature module.

### Why one folder per feature, not a global `use-cases/`

Use cases are **feature-scoped** behavior. Putting them next to the controllers and DTOs that consume them keeps the module cohesive (Screaming Architecture: the folder structure shouts what the system does, not how it's layered). A top-level `use-cases/` would split features across two trees and force long imports.

---

## 4. Risks

### R1 — Breaking the `calculateAndSaveResults → getDashboard` chain

**Risk**: `CalculateResultsUseCase` ends by returning `getDashboard(attemptId)`. If we wire `GetDashboardUseCase` incorrectly into `CalculateResultsUseCase`, the post-attempt response breaks silently (returns wrong data) or throws at runtime (circular DI, missing provider).

**Mitigation**:
- Inject `GetDashboardUseCase` into `CalculateResultsUseCase` via constructor — straight composition, no circular reference because `GetDashboardUseCase` does not depend back.
- Verify `EvaluationsModule` lists both as providers.
- Smoke test: complete one survey end-to-end and confirm the dashboard payload matches the previous behavior byte-for-byte (capture a JSON snapshot before/after).

### R2 — Forgetting to update a caller

**Risk**: `EvaluationsService` and `AuthService` may be injected from places we haven't audited (cron jobs, listeners, tests, other modules). Deleting them without updating callers breaks the build.

**Mitigation**:
- Before any delete, run a project-wide grep for `EvaluationsService`, `AuthService`, `EvolutionAnalysisService` and list every consumer.
- Update consumers in the same commit as the rename — one atomic change per service.
- Lean on TypeScript: `tsc --noEmit` will surface every dangling reference. Run it after each file move.

### R3 — `AiService` config refactor breaks AI calls in production

**Risk**: `AiService` is on the critical path of `CalculateResultsUseCase` (AI analysis) and `GetOrGenerateEvolutionUseCase`. If the Zod schema doesn't accept `GEMINI_API_KEY` as optional, the app fails to boot in environments without the key (dev, CI). If the field path is wrong, the client silently falls back to "AI Service not configured."

**Mitigation**:
- Add both keys to the Zod schema as `z.string().optional()` — preserves the current "warn and disable" behavior.
- Add a unit test that boots the config with no AI keys and confirms the `AiService` initializes both clients as `null`.
- Add a unit test that boots with both keys and confirms both clients are non-null.
- Verify the typed path in code review before merging.

---

## 5. Out of Scope

The following are deliberately **NOT** part of this change:

1. **Dashboard N+1 fix.** `DashboardController` has 5 endpoints each calling `getDashboard()` to return a subset of the same payload. Fixing this requires a read-model split (e.g. `GetDashboardSummaryUseCase`, `GetDashboardRadarUseCase`, etc.) and possibly response caching. Out of scope here — extracting the use case is the prerequisite that makes that future change easy. Tracked as a follow-up.
2. **Hexagonal architecture / ports & adapters.** Use cases keep depending on `PrismaService` directly. No repository interfaces, no domain entities, no application/infrastructure split. That is a much bigger architectural shift and needs its own proposal.
3. **CQRS / command bus.** Standards explicitly forbid it. Use cases stay as plain DI-injected classes.
4. **Event sourcing or domain events beyond the existing `EventEmitter2` usage.** `register` and `forgotPassword` keep emitting `user.registered` and `password.reset` exactly as today.
5. **Refactoring `ScoringService` or `RuleBasedInsightService`.** They are already pure, single-responsibility, and well-named. Touching them adds risk for zero gain.
6. **Refactoring `AiAnalysisService`.** It is already a focused service (one job: build a prompt, call AI, parse). Could become `AnalyzeAttemptUseCase` later if the team prefers naming consistency, but it's not painful enough today.
7. **Test coverage.** This change is structural. Adding new tests for every use case is valuable but doubles the scope. We will preserve any existing tests (updating injections only) and add tests only for the `AiService` config swap (R3 mitigation).
8. **Renaming Nest modules.** `EvaluationsModule`, `AuthModule`, etc. keep their names. Only their providers list changes.
9. **Frontend impact.** Zero. HTTP contracts are unchanged.

---

## Decision Summary (TL;DR)

- Split 3 fat services into **12 use cases** (3 evaluations + 1 evolution + 8 auth) following the `XxxUseCase` + single `execute()` convention.
- **Delete** the old services — no thin orchestrators.
- Move shared evaluation constants into `evaluations/constants.ts`.
- Fix `AiService` to consume typed `AppConfigService` (Change #1's contract); add `GEMINI_API_KEY` / `GROQ_API_KEY` to the Zod schema as optional.
- Keep controllers, HTTP contracts, `EventEmitter2` flows, `PrismaService` usage, and pure helper services exactly as they are.
- N+1 dashboard, hexagonal, CQRS, and broader test coverage are explicitly deferred.
