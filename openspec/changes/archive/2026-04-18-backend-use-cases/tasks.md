# Tasks: backend-use-cases

## Phase 1: Foundation

- [x] 1.1 Create `backend/src/diagnostic/evaluations/constants.ts` — export SUB_LABELS, DIMENSION_SUBS, DIMENSION_LABELS (move from evaluations.service.ts)
- [x] 1.2 Create `backend/src/identity/auth/dto/validated-user.type.ts` — export ValidatedUser interface (move from auth.service.ts)
- [x] 1.3 Add `ai` namespace to `backend/src/config/config.schema.ts`: `geminiApiKey: z.string().optional(), groqApiKey: z.string().optional()`
- [x] 1.4 Map `GEMINI_API_KEY` / `GROQ_API_KEY` to `ai` namespace in `backend/src/config/configuration.ts`

## Phase 2: Evaluations Use Cases

- [x] 2.1 Create `use-cases/get-dashboard.use-case.ts` (UC-02) — move getDashboard logic; import constants from Phase 1
- [x] 2.2 Create `use-cases/get-answers-by-dimension.use-case.ts` (UC-03) — move getAnswersByDimension logic; import constants
- [x] 2.3 Create `use-cases/get-or-generate-evolution.use-case.ts` (UC-04) — move EvolutionAnalysisService.getOrGenerate + private generate
- [x] 2.4 Create `use-cases/calculate-results.use-case.ts` (UC-01) — move calculateAndSaveResults; inject GetDashboardUseCase

## Phase 3: Auth Use Cases

- [x] 3.1 Create `use-cases/register.use-case.ts` (UC-05) — move register logic; emit user.registered
- [x] 3.2 Create `use-cases/verify-email.use-case.ts` (UC-06) — move verifyEmail logic
- [x] 3.3 Create `use-cases/resend-verification-code.use-case.ts` (UC-07) — move resendVerificationCode logic
- [x] 3.4 Create `use-cases/login.use-case.ts` (UC-08) — move login logic; import ValidatedUser from 1.2
- [x] 3.5 Create `use-cases/validate-user.use-case.ts` (UC-09) — move validateUser logic
- [x] 3.6 Create `use-cases/forgot-password.use-case.ts` (UC-10) — move forgotPassword; emit password.reset
- [x] 3.7 Create `use-cases/reset-password.use-case.ts` (UC-11) — move resetPassword logic
- [x] 3.8 Create `use-cases/google-login-or-register.use-case.ts` (UC-12) — move logic; inject LoginUseCase

## Phase 4: Wiring + Config Fix

- [x] 4.1 Update `evaluations.module.ts`: add 4 use cases to providers; change export from EvaluationsService → CalculateResultsUseCase
- [x] 4.2 Update `auth.module.ts`: add 8 use cases to providers
- [x] 4.3 Fix `ai/ai.service.ts`: inject `ConfigService<AppConfig, true>`; read via `configService.get('ai.geminiApiKey', { infer: true })`; type groqClient as `unknown`
- [x] 4.4 Update `evaluations.controller.ts`: replace EvaluationsService → CalculateResultsUseCase; call `.execute()`
- [x] 4.5 Update `dashboard.controller.ts`: inject GetDashboardUseCase, GetAnswersByDimensionUseCase, GetOrGenerateEvolutionUseCase directly
- [x] 4.6 Update `auth.controller.ts`: inject each use case per route; use ValidatedUser from 1.2
- [x] 4.7 Update `responses.service.ts`: inject CalculateResultsUseCase; call `.execute(attemptId)` instead of evaluationsService.calculateAndSaveResults

## Phase 5: Deletions + Type Check

- [x] 5.1 Delete `backend/src/diagnostic/evaluations/evaluations.service.ts`
- [x] 5.2 Delete `backend/src/diagnostic/evaluations/evolution-analysis.service.ts`
- [x] 5.3 Delete `backend/src/identity/auth/auth.service.ts`
- [x] 5.4 Run `tsc --noEmit` in backend — fix any remaining type errors

## Phase 6: Tests

- [x] 6.1 Add unit test: AiService boots without AI keys → geminiClient and groqClient are null
- [x] 6.2 Add unit test: AiService boots with gemini key → geminiClient is non-null
- [x] 6.3 Update existing service tests — N/A (no existing spec files in project)
