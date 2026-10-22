# Spec — Change #4: backend-use-cases

## Overview

Extract 12 use-case classes from three fat NestJS services (`EvaluationsService`, `EvolutionAnalysisService`, `AuthService`), delete the source services, wire controllers directly to use cases, and fix the last config violation in `AiService`.

---

## Use-Case Specs

### UC-01: CalculateResultsUseCase

- **Class**: `CalculateResultsUseCase`
- **File**: `backend/src/diagnostic/evaluations/use-cases/calculate-results.use-case.ts`
- **Input**: `execute(attemptId: string): Promise<DashboardDTO | null>`
- **Output**: `DashboardDTO | null` — returns `null` only when the attempt has zero answers
- **Steps**:
  1. Query all `Answer` records for `attemptId` via `PrismaService`; return `null` if empty.
  2. Call `ScoringService.computeSubdimensions(answers)` → subdimension scores map.
  3. Call `ScoringService.computeDimensions(sub)` → dimension scores + global index.
  4. Call `ScoringService.computeCrossAlerts(sub, dim)` → cross-dimension alert flags.
  5. Upsert a `DiagnosticResult` record with all subdimension, dimension, maturity, and alert fields.
  6. Update `SurveyAttempt.status = 'COMPLETED'` and set `endedAt = new Date()`.
  7. In a non-blocking try/catch: fetch the attempt with user, call `RuleBasedInsightService.getAnalyticalMode` and `buildActiveAlerts`, call `AiAnalysisService.analyze`, upsert `AiEvaluation`, call `AnalyticsLoggerService.logAnalysisEvent`.
  8. Call `GetDashboardUseCase.execute(attemptId)` and return the result.
- **Side effects**: AI evaluation written to `AiEvaluation` table (non-blocking — failure is swallowed); analytics event logged via `AnalyticsLoggerService`.
- **Dependencies**: `PrismaService`, `ScoringService`, `RuleBasedInsightService`, `AiAnalysisService`, `AnalyticsLoggerService`, `GetDashboardUseCase`

---

### UC-02: GetDashboardUseCase

- **Class**: `GetDashboardUseCase`
- **File**: `backend/src/diagnostic/evaluations/use-cases/get-dashboard.use-case.ts`
- **Input**: `execute(attemptId: string): Promise<DashboardDTO>`
- **Output**: `DashboardDTO` — full dashboard payload
- **Steps**:
  1. Query `SurveyAttempt` (including `user`, `diagnostic`, `aiEval`) for `attemptId` via `PrismaService`.
  2. Throw `Error` if `diagnostic` is null.
  3. Build `subScores` map: for each of the 10 subdimension keys, call `ScoringService.classifyMaturity(score)` then `RuleBasedInsightService.buildMaturityMeta(level)`.
  4. Build `dimScores` map from the three dimension score fields.
  5. Construct `DimensionResult[]` array using `DIMENSION_SUBS` constant (imported from `evaluations/constants.ts`).
  6. Construct `RadarPoint[]` array using `SUB_LABELS` constant.
  7. Sort all subdimensions by score; extract top-3 `strengths` and bottom-3 `bottlenecks`.
  8. Call `RuleBasedInsightService.buildActiveAlerts(crossAlertFlags)`.
  9. Call `RuleBasedInsightService.getAnalyticalMode(scoreIG)`.
  10. Parse `aiEval.content` if present; include in return value if structurally valid.
  11. Return assembled `DashboardDTO`.
- **Side effects**: none
- **Dependencies**: `PrismaService`, `ScoringService`, `RuleBasedInsightService`

---

### UC-03: GetAnswersByDimensionUseCase

- **Class**: `GetAnswersByDimensionUseCase`
- **File**: `backend/src/diagnostic/evaluations/use-cases/get-answers-by-dimension.use-case.ts`
- **Input**: `execute(attemptId: string): Promise<DimensionAnswersDTO[]>`
- **Output**: Array of dimension objects each containing subdimensions, questions, and per-subdimension scores. Returns `[]` when no answers exist.
- **Steps**:
  1. Query all `Answer` records for `attemptId` including related `Question` via `PrismaService`.
  2. Return `[]` if no answers found.
  3. Group answers into `Record<dimensionKey, Record<subdimensionKey, answer[]>>`.
  4. Build a per-dimension question-order → position map for badge indices.
  5. Map over `DIMENSION_ORDER` (`['INTERNAL', 'BUSINESS', 'GROWTH']`), filtering absent dimensions.
  6. For each subdimension, compute average score (rounded to 1 decimal) and map questions with `dimPosMap` indices.
  7. Return structured array using `DIMENSION_LABELS` and `SUB_LABELS` constants (imported from `evaluations/constants.ts`).
- **Side effects**: none
- **Dependencies**: `PrismaService`

---

### UC-04: GetOrGenerateEvolutionUseCase

- **Class**: `GetOrGenerateEvolutionUseCase`
- **File**: `backend/src/diagnostic/evaluations/use-cases/get-or-generate-evolution.use-case.ts`
- **Input**:
  ```ts
  execute(input: {
    currentId: string;
    previousId: string;
    currentData: DashboardDTO;
    previousData: DashboardDTO;
  }): Promise<EvolutionAnalysisDTO>
  ```
- **Output**: `EvolutionAnalysisDTO` — always returns a value; returns a fallback DTO on AI failure
- **Steps**:
  1. Query `EvolutionAnalysis` by composite key `{ currentAttemptId, previousAttemptId }` via `PrismaService`.
  2. If found and parseable, return cached `EvolutionAnalysisDTO`.
  3. If not found (or cache corrupted), compute subdimension and dimension deltas from the two `DashboardDTO` inputs.
  4. Build system prompt and user context string for the AI.
  5. Call `AiService.generate(prompt, true)` and parse the JSON response.
  6. On parse failure, attempt to extract JSON via regex.
  7. Upsert the result into `EvolutionAnalysis` table.
  8. On any AI error, log and return the fallback `EvolutionAnalysisDTO`.
- **Side effects**: `EvolutionAnalysis` row upserted in database.
- **Dependencies**: `PrismaService`, `AiService`

---

### UC-05: RegisterUseCase

- **Class**: `RegisterUseCase`
- **File**: `backend/src/identity/auth/use-cases/register.use-case.ts`
- **Input**:
  ```ts
  execute(dto: RegisterDto): Promise<{ message: string }>
  ```
- **Output**: `{ message: 'Verification code sent.' }`
- **Steps**:
  1. Call `UsersService.findOne(dto.email)`.
  2. If user exists and `isEmailVerified`, throw `ConflictException`.
  3. If user exists but not verified, call `UsersService.update(id, { password: dto.password, verificationCode })`.
  4. If no user, hash password with `bcrypt.hash(dto.password, 10)`, generate a 6-digit code, call `UsersService.create(...)` with `isEmailVerified: false` and role `USER`.
  5. Emit `user.registered` event with `{ email, code }` via `EventEmitter2`.
  6. Return `{ message: 'Verification code sent.' }`.
- **Side effects**: `user.registered` event emitted (triggers email delivery).
- **Dependencies**: `UsersService`, `EventEmitter2`

---

### UC-06: VerifyEmailUseCase

- **Class**: `VerifyEmailUseCase`
- **File**: `backend/src/identity/auth/use-cases/verify-email.use-case.ts`
- **Input**:
  ```ts
  execute(input: { email: string; code: string }): Promise<{ message: string }>
  ```
- **Output**: `{ message: string }`
- **Steps**:
  1. Call `UsersService.findOne(email)`. Throw `BadRequestException` if not found.
  2. If `isEmailVerified`, return `{ message: 'Already verified' }`.
  3. If `verificationCode !== code`, throw `BadRequestException`.
  4. Call `UsersService.update(id, { isEmailVerified: true, verificationCode: null })`.
  5. Return `{ message: 'Email verified successfully' }`.
- **Side effects**: none
- **Dependencies**: `UsersService`

---

### UC-07: ResendVerificationCodeUseCase

- **Class**: `ResendVerificationCodeUseCase`
- **File**: `backend/src/identity/auth/use-cases/resend-verification-code.use-case.ts`
- **Input**:
  ```ts
  execute(email: string): Promise<{ message: string }>
  ```
- **Output**: `{ message: string }`
- **Steps**:
  1. Call `UsersService.findOne(email)`. Throw `BadRequestException` if not found.
  2. If `isEmailVerified`, return `{ message: 'Already verified' }`.
  3. Generate a new 6-digit code.
  4. Call `UsersService.update(id, { verificationCode: newCode })`.
  5. Emit `user.registered` event with `{ email, code: newCode }` via `EventEmitter2`.
  6. Return `{ message: 'Verification code resent successfully' }`.
- **Side effects**: `user.registered` event emitted.
- **Dependencies**: `UsersService`, `EventEmitter2`

---

### UC-08: LoginUseCase

- **Class**: `LoginUseCase`
- **File**: `backend/src/identity/auth/use-cases/login.use-case.ts`
- **Input**:
  ```ts
  execute(user: ValidatedUser): Promise<LoginResponseDTO>
  ```
- **Output**: `{ access_token: string; user: { name, email, isProfileComplete, latestAttemptId, latestAttemptStatus } }`
- **Steps**:
  1. Build JWT payload `{ email, sub: id, roles }` from `user.userRoles` (default to `['USER']` if absent).
  2. Call `JwtService.sign(payload)`.
  3. Call `UsersService.getLatestAttempt(user.id)`.
  4. Return assembled login response DTO.
- **Side effects**: none
- **Dependencies**: `UsersService`, `JwtService`
- **Note**: `ValidatedUser` interface is defined in the auth domain. `ValidateUserUseCase` (UC-09) is the entry point for credential-based login; the controller calls `ValidateUserUseCase` first, then `LoginUseCase`.

---

### UC-09: ValidateUserUseCase

- **Class**: `ValidateUserUseCase`
- **File**: `backend/src/identity/auth/use-cases/validate-user.use-case.ts`
- **Input**:
  ```ts
  execute(email: string, password: string): Promise<ValidatedUser | null>
  ```
- **Output**: `ValidatedUser` without `password` field, or `null` if credentials are invalid
- **Steps**:
  1. Call `UsersService.findOne(email)`.
  2. If user found, call `bcrypt.compare(password, user.password)`.
  3. If valid, return user object with `password` field omitted.
  4. Otherwise return `null`.
- **Side effects**: none
- **Dependencies**: `UsersService`

---

### UC-10: ForgotPasswordUseCase

- **Class**: `ForgotPasswordUseCase`
- **File**: `backend/src/identity/auth/use-cases/forgot-password.use-case.ts`
- **Input**:
  ```ts
  execute(email: string): Promise<{ message: string }>
  ```
- **Output**: `{ message: 'Si el correo existe, el código de recuperación fue enviado.' }` — always the same message regardless of whether the user exists (security by design)
- **Steps**:
  1. Call `UsersService.findOne(email)`.
  2. If user not found, return the generic response immediately.
  3. Generate a 6-digit code.
  4. Call `UsersService.update(id, { verificationCode: code })`.
  5. Emit `password.reset` event with `{ email, code }` via `EventEmitter2`.
  6. Return the generic response.
- **Side effects**: `password.reset` event emitted when user exists (triggers password reset email).
- **Dependencies**: `UsersService`, `EventEmitter2`

---

### UC-11: ResetPasswordUseCase

- **Class**: `ResetPasswordUseCase`
- **File**: `backend/src/identity/auth/use-cases/reset-password.use-case.ts`
- **Input**:
  ```ts
  execute(input: { email: string; code: string; newPassword: string }): Promise<{ message: string }>
  ```
- **Output**: `{ message: 'Contraseña actualizada correctamente' }`
- **Steps**:
  1. Call `UsersService.findOne(email)`. Throw `BadRequestException` if not found.
  2. If `verificationCode !== code`, throw `BadRequestException`.
  3. Call `UsersService.update(id, { password: newPassword, verificationCode: null, isEmailVerified: true })`.
  4. Return `{ message: 'Contraseña actualizada correctamente' }`.
- **Side effects**: none
- **Dependencies**: `UsersService`

---

### UC-12: GoogleLoginOrRegisterUseCase

- **Class**: `GoogleLoginOrRegisterUseCase`
- **File**: `backend/src/identity/auth/use-cases/google-login-or-register.use-case.ts`
- **Input**:
  ```ts
  execute(googleUser: { email: string; name: string; picture?: string }): Promise<LoginResponseDTO>
  ```
- **Output**: Same shape as `LoginUseCase` response
- **Steps**:
  1. Call `UsersService.findOne(googleUser.email)`.
  2. If not found: hash a random UUID as password, call `UsersService.create(...)` with `isEmailVerified: true` and role `USER`, re-fetch the created user.
  3. Omit `password` from user object.
  4. Call `LoginUseCase.execute(userWithoutPassword)` and return its result.
- **Side effects**: none
- **Dependencies**: `UsersService`, `LoginUseCase`

---

## Config Fix Spec

### CFG-01: AiService — Replace flat ConfigService with typed AppConfigService

- **File**: `backend/src/ai/ai.service.ts`
- **Problem**: `AiService` calls `ConfigService.get<string>('GEMINI_API_KEY')` and `ConfigService.get<string>('GROQ_API_KEY')` using untyped flat keys, bypassing the validated `AppConfig` type established in Change #1.
- **Fix**:
  1. Add `ai` namespace to `configSchema` in `backend/src/config/config.schema.ts`:
     ```ts
     ai: z.object({
       geminiApiKey: z.string().optional(),
       groqApiKey: z.string().optional(),
     }),
     ```
  2. Add corresponding env-var mapping in `backend/src/config/configuration.ts`:
     ```ts
     ai: {
       geminiApiKey: process.env['GEMINI_API_KEY'],
       groqApiKey:   process.env['GROQ_API_KEY'],
     },
     ```
  3. In `AiService`, replace `ConfigService` injection with `ConfigService<AppConfig, true>` (or a typed `AppConfigService` wrapper if available):
     ```ts
     const geminiKey = this.configService.get('ai.geminiApiKey', { infer: true });
     const groqKey   = this.configService.get('ai.groqApiKey',   { infer: true });
     ```
  4. Remove the untyped `configService.get<string>(...)` calls.
  5. Preserve the existing "warn and disable client" behavior: if a key is `undefined`, log the warning and leave the client `null`.
- **Outcome**: `AiService` has zero `process.env` reads and zero untyped `ConfigService.get<string>(...)` calls. The `ai` keys are optional in the Zod schema, so the app boots without them (graceful degradation preserved).

---

## Requirements

### Module Registration

**REQ-01** — All use-case classes are decorated with `@Injectable()` and registered as NestJS `providers` in the module where they reside (`EvaluationsModule` for UC-01–04, `AuthModule` for UC-05–12).

**REQ-02** — `EvaluationsModule` exports only what other modules need. `EvaluationsService` is removed from exports; if `ResponsesService` currently depends on it (via `calculateAndSaveResults`), it must inject `CalculateResultsUseCase` directly. `EvaluationsModule` must export `CalculateResultsUseCase` for that cross-module dependency.

### Service Deletion

**REQ-03** — `EvaluationsService` (`evaluations.service.ts`) is deleted from the codebase once all three use cases (UC-01, UC-02, UC-03) are extracted and wired.

**REQ-04** — `EvolutionAnalysisService` (`evolution-analysis.service.ts`) is deleted once UC-04 is extracted and wired. The `EvolutionAnalysisDTO` interface is moved to the use-case file or a collocated `dto/` file.

**REQ-05** — `AuthService` (`auth.service.ts`) is deleted once all eight use cases (UC-05–UC-12) are extracted and wired.

### Controller Updates

**REQ-06** — `EvaluationsController` injects `CalculateResultsUseCase` directly; no service intermediary.

**REQ-07** — `DashboardController` injects `GetDashboardUseCase`, `GetAnswersByDimensionUseCase`, and `GetOrGenerateEvolutionUseCase` directly; no service intermediary.

**REQ-08** — `AuthController` injects `ValidateUserUseCase`, `LoginUseCase`, `RegisterUseCase`, `VerifyEmailUseCase`, `ResendVerificationCodeUseCase`, `ForgotPasswordUseCase`, `ResetPasswordUseCase`, and `GoogleLoginOrRegisterUseCase` directly.

**REQ-09** — Zero changes to HTTP routes, request DTOs, response shapes, or HTTP status codes. Frontend impact is zero.

### Config Integrity

**REQ-10** — After the change, no file in the backend reads `process.env` directly outside of `configuration.ts`, and no file calls `configService.get<string>('FLAT_KEY')` with an untyped flat key. `AiService` is the only remaining violator before this change.

**REQ-11** — The `ai` namespace is added to `configSchema` with both keys as `z.string().optional()`. App boot must succeed when neither key is present in the environment.

### Constants Extraction

**REQ-12** — `SUB_LABELS`, `DIMENSION_SUBS`, and `DIMENSION_LABELS` constants are extracted from `evaluations.service.ts` into `backend/src/diagnostic/evaluations/constants.ts`. All use cases that need them import from that file.

### TypeScript Compliance

**REQ-13** — All use-case classes are fully typed with no `any`. `groqClient` in `AiService` may remain typed as `unknown` with a narrow cast at the call site, but `any` is not permitted.

**REQ-14** — `tsc --noEmit` must pass with zero errors after the change.

### EventEmitter Preservation

**REQ-15** — All existing `EventEmitter2` calls (`user.registered`, `password.reset`, `survey.completed`) are preserved with identical event names and payload shapes. No events are added or removed.

### Test Preservation

**REQ-16** — All existing tests that reference the deleted services must be updated to inject the corresponding use cases. No existing test coverage may be removed.

**REQ-17** — At minimum, one unit test for `AiService` constructor behavior is required: (a) boots with both keys absent — clients are `null`; (b) boots with both keys present — clients are non-null. These tests validate REQ-11.

---

## File Map (final state)

```
backend/src/
  diagnostic/evaluations/
    constants.ts                                    # SUB_LABELS, DIMENSION_SUBS, DIMENSION_LABELS (new)
    use-cases/
      calculate-results.use-case.ts                 # UC-01 (new)
      get-dashboard.use-case.ts                     # UC-02 (new)
      get-answers-by-dimension.use-case.ts          # UC-03 (new)
      get-or-generate-evolution.use-case.ts         # UC-04 (new)
    evaluations.service.ts                          # DELETED
    evolution-analysis.service.ts                   # DELETED
    ai-analysis.service.ts                          # untouched
    scoring.service.ts                              # untouched
    rule-based-insight.service.ts                   # untouched
    evaluations.controller.ts                       # updated DI only
    dashboard.controller.ts                         # updated DI only
    evaluations.module.ts                           # updated providers + exports

  identity/auth/
    use-cases/
      register.use-case.ts                          # UC-05 (new)
      verify-email.use-case.ts                      # UC-06 (new)
      resend-verification-code.use-case.ts          # UC-07 (new)
      login.use-case.ts                             # UC-08 (new)
      validate-user.use-case.ts                     # UC-09 (new)
      forgot-password.use-case.ts                   # UC-10 (new)
      reset-password.use-case.ts                    # UC-11 (new)
      google-login-or-register.use-case.ts          # UC-12 (new)
    auth.service.ts                                 # DELETED
    auth.controller.ts                              # updated DI only
    auth.module.ts                                  # updated providers

  config/
    config.schema.ts                                # adds `ai` namespace (CFG-01)
    configuration.ts                                # adds `ai` env-var mapping (CFG-01)

  ai/
    ai.service.ts                                   # uses typed config (CFG-01)
```
