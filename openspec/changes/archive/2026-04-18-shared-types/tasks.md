# Tasks: shared-types

## Phase 1: Frontend Types

- [x] 1.1 Create `frontend/src/types/evolution.ts` — EvolutionAnalysisDTO matching backend use-case
- [x] 1.2 Fix `AiAnalysisDTO` in `frontend/src/types/dashboard.ts` — remove `[key: string]: any`
- [x] 1.3 Type `dashboardApi.getEvolutionAnalysis` → `Promise<EvolutionAnalysisDTO>`
- [x] 1.4 Type `dashboardApi.getGlobalHealth` → `Promise<DashboardDTO['global']>`

## Phase 2: Backend Types

- [x] 2.1 Add explicit return type to `GetAnswersByDimensionUseCase.execute()` — new `DimensionAnswersDTO` interface

## Phase 3: Verification

- [x] 3.1 `tsc --noEmit` frontend — pre-existing .next/types error only (baseline acceptable)
- [x] 3.2 `tsc --noEmit` backend — exit 0, zero errors
