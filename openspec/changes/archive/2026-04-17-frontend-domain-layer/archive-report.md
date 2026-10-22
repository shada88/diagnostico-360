# Archive Report: frontend-domain-layer

**Archived**: 2026-04-17
**Status**: complete-with-user-action
**Branch**: main

## Summary

Second change in the 5-part modularization initiative. Established a pure `domain/` layer, split Module3Radar from 640 LOC monolith into 10 presentational components + hook + orchestrator, and relocated findings-engine into a typed detector pipeline.

## Delivered

### domain/maturity/
- `types.ts` — re-exports from `@/types/dashboard` + `DimensionKey`, `Score`, `Area`, `Dimension`
- `labels.ts` — `SUB_LABELS`, `DIMENSION_LABELS`, `DIMENSION_SHORT_LABELS`, `DIMENSION_AREA_MAP`, `DIMENSION_COLORS` (brand hex literals, single source of truth)
- `area-dimension.ts` — `getAreaDimensionColor`, `getDimensionForArea`
- `index.ts` — public barrel

### domain/radar/
- `types.ts` — `Brecha`, `GapResult`, `GAP_THRESHOLDS`
- `sub-scoring.ts` — `weakestSub` (`formatSubScores` dropped — dead code confirmed by grep)
- `gap-calculator.ts` — `calculateGap`, `generateGapAnalysis`, `isSameAsGap`
- `detect-brechas.ts` — `detectBrechas` with color literals migrated to CSS vars (`var(--critico-fg)` etc.)
- `index.ts` — public barrel

### domain/findings/
- `types.ts` — `Finding`, `FindingCategory`, `CategoryMeta`, `ScoredSub`, `DetectorContext`, `Detector`
- `templates.ts` — `T` templates object + `CATEGORY_META` registry
- `utils.ts` — `flattenAndSortSubs`, `findLowestAffirmation`, `getRelatedAreas`, `buildAlertSignal`
- `detectors/{critical-risk,attention-point,improvement-area,strategic-strength,index}.ts` — 4 pure detectors + `DETECTOR_PIPELINE`
- `enrichment/{ai-enricher,dedupe,index}.ts` — AI enrichment + Jaccard dedup
- `findings-engine.ts` — `generateFindings` orchestrator (≤30 LOC)
- `index.ts` — public API barrel

### Module3Radar/ folder
- 10 presentational components: `BrechaCard`, `PriorityCard`, `GapDisplay`, `CustomTooltip`, `ScoreCard`, `ViewToggle`, `RadarChart`, `DimensionSummary`, `PriorityLists`, `BrechasList`
- `hooks/useRadarData.ts` — owns view state + composes chartData/gap/brechas via `useMemo`
- `Module3Radar.tsx` — orchestrator, **67 LOC** (limit: 120)
- `index.ts` — default barrel (preserves existing dynamic import path)

### CSS / tokens
- `globals.css` — added `--shadow-tooltip`, `--tooltip-divider`
- `lib/config/tokens.ts` — extended with `shadow.tooltip`, `surface.tooltipDivider`

## Verify Result

All 12 REQs pass:

| REQ | Result | Notes |
|-----|--------|-------|
| REQ-1 domain structure | ✅ | maturity/, radar/, findings/ — no root-level .ts files |
| REQ-2 zero React in domain | ✅ | grep sweep confirmed |
| REQ-3 maturity single source | ✅ | DIMENSION_AREA_MAP only in domain/maturity + consumer useRadarData |
| REQ-4 pure radar functions | ✅ | No React context, no side effects |
| REQ-5 findings relocated | ✅ | lib/findings-engine.ts deleted, consumers updated |
| REQ-6 Module3Radar as folder | ✅ | All required components present |
| REQ-7 orchestrator ≤120 LOC | ✅ | 67 LOC |
| REQ-8 presentationals props-only | ✅ | No domain function imports (type-only imports acceptable) |
| REQ-9 CSS token migration | ✅ | color-mix, CSS vars, shadow/divider tokenized |
| REQ-10 no lib/findings-engine imports | ✅ | grep sweep: zero hits |
| REQ-11 barrel + types per subdomain | ✅ | All 3 subdomains have index.ts + types.ts |
| REQ-12 named exports | ✅ | All public functions are named exports |

## Task completion

- 54/56 tasks complete
- T55 (lint) blocked by pre-existing ESLint v9 config mismatch (`.eslintrc` → `eslint.config.js` migration needed, independent of this change)
- T56 (visual QA) requires user to run dev server and verify `/personal/resultados/[id]`

## Commits

Pending — user must commit 7 phases manually or via:
- `refactor(frontend): scaffold domain/ skeleton`
- `refactor(frontend): move maturity labels into domain/maturity`
- `refactor(frontend): extract radar math into domain/radar`
- `refactor(frontend): relocate findings engine into domain/findings`
- `refactor(frontend): split Module3Radar into folder with presentational components`
- `refactor(frontend): tokenize remaining literals inside Module3Radar scope`
- `chore(frontend): cleanup sweep after domain-layer migration`

## User follow-up

1. Run `npm run dev` and verify `/personal/resultados/[id]` renders Module3Radar identically
2. Fix ESLint config (`eslint.config.js`) — independent of this change, pre-existing issue
3. Create the 7 commits above once visual QA passes

## Next change

`api-client-split` (Change #3) — split `lib/dashboard-api.ts` into typed client modules, separate API concerns.
