# Archive Report: api-client-split

**Archived**: 2026-04-17
**Status**: complete-with-user-action
**Branch**: main

## Summary

Third change in the 5-part modularization initiative. Split monolithic `lib/api.ts` and `lib/dashboard-api.ts` into typed, single-responsibility HTTP client modules. Established `lib/http/` as transport infrastructure and `lib/api/` as feature-domain clients.

## Delivered

### lib/http/
- `client.ts` — axios instance using `env.apiUrl` (no direct `process.env`), auth + 401-redirect interceptors
- `index.ts` — default barrel

### lib/api/
- `auth.ts` — `authApi`: login, register, verifyEmail, resendCode, forgotPassword, resetPassword, updateProfile, getProfile
- `survey.ts` — `surveyApi`: getSurveys, getSurveyById, startAttempt, submitAnswer, submitSectionAnswers, finalizeAttempt, getAttempt
- `dashboard.ts` — `dashboardApi`: getDashboard, getGlobalHealth, getAnswersByDimension, getEvolutionAnalysis
- `responses.ts` — `responsesApi`: getUserAttempts, deleteAttempt
- `index.ts` — barrel re-exporting all 4 clients + answer types

### types/answers.ts
- `DimensionGroup`, `SubdimensionGroup`, `AnswerQuestion`, `AttemptSummary` relocated from lib/

### types/index.ts
- `User` extended with: `businessName`, `countryCode`, `city`, `timezone`, `isProfileComplete`, `latestAttemptStatus`, `latestAttemptId` — fields that existed in backend responses but were untyped (masked by `any`)

## Consumers migrated

| File | Change |
|------|--------|
| `domain/findings/{types,utils,findings-engine}.ts` | `@/lib/dashboard-api` → `@/types/answers` |
| `app/personal/resultados/[id]/page.tsx` | `@/lib/dashboard-api` → `@/lib/api` |
| `components/shared/GlobalHeader.tsx` | merged imports; `surveyApi.getProfile` → `authApi.getProfile`; `dashboardApi.getUserAttempts` → `responsesApi.getUserAttempts` |
| `components/features/dashboard/EvolucionView.tsx` | `@/lib/dashboard-api` → `@/lib/api`; `deleteAttempt` → `responsesApi` |
| `components/features/dashboard/modules/AreasClaveView.tsx` | `@/lib/dashboard-api` → `@/lib/api` |
| `components/features/auth/AuthForm.tsx` | `surveyApi` → `authApi` |
| `components/features/auth/ProfileForm.tsx` | `surveyApi` → `authApi` |
| `components/features/survey/SurveyWizard.tsx` | added `authApi`; `surveyApi.getProfile` → `authApi.getProfile` |

## Verify Result

All 7 REQs pass. tsc clean (only pre-existing validator.ts error).

## Discoveries

- `lib/api.ts` (file) conflicts with `lib/api/` (directory) in TypeScript module resolution — file wins. Must delete the file BEFORE consumers switch to the new folder.
- Old `surveyApi` mixed auth + survey methods. Callers of `getProfile`/`updateProfile` needed migration to `authApi`.
- 7 `User` fields existed in backend responses but were untyped — masked by `any`. Now typed in `types/index.ts`.
- `RegisterDTO.name` made optional — AuthForm's basic register flow only passes email+password.

## Task completion

31/31 tasks complete.

## Commits

Pending — user must commit 6 phases:
- `refactor(frontend): scaffold http client and api layer skeleton`
- `refactor(frontend): populate typed feature clients in lib/api`
- `refactor(frontend): migrate domain/findings to import from @/types/answers`
- `refactor(frontend): update component consumers to new api paths`
- `refactor(frontend): delete lib/api.ts and lib/dashboard-api.ts`
- `chore(frontend): sweep and verify api-client-split`

## User follow-up

1. Commit the 6 phases above
2. Visual QA: verify survey flow + dashboard still work after migration

## Next change

`backend-use-cases` (Change #4) — extract business logic from NestJS services/controllers into dedicated use-case classes.
