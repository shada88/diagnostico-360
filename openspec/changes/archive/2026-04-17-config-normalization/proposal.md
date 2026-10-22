# Proposal: config-normalization

## Intent

Eliminate scattered hardcoded values and bypassed config patterns identified in the modularization exploration. Three concrete problems: (1) two WhatsApp numbers hardcoded in JSX across two components with different business purposes (sales vs. support), (2) `process.env.FRONTEND_URL` accessed directly in 3 backend files with duplicated `'http://localhost:3000'` fallbacks despite `ConfigModule` being globally available, (3) Tailwind utility class strings (`'bg-red-500'`) stored as config values in `lib/constants/config.ts`, bypassing the CSS variable design token system defined in `globals.css`. Centralizing these prevents bug hunts on value changes, enforces 12-factor config on the backend, and aligns the frontend with its own design token system.

## Scope

### In Scope
- Frontend contact config module exposing semantic keys `contact.sales` (+1 555 555 0100, US) and `contact.support` (+1 555 555 0199, CO) as typed exports, read from `NEXT_PUBLIC_*` env vars with compile-time defaults
- Backend typed `ConfigService` usage via a `configuration()` factory with validated namespaces (`app`, `mail`, `reminders`); replace direct `process.env.FRONTEND_URL` in `mail.service.ts`, `responses.service.ts`, `reminder-cron.service.ts`
- Replace Tailwind class strings in `frontend/src/lib/constants/config.ts` with semantic tokens (e.g. `severity.high → var(--alert-error)`) mapped to CSS custom properties already defined in `globals.css`
- Frontend `config/` module layout: `contact.ts`, `env.ts`, `tokens.ts`, `index.ts` barrel

### Out of Scope
- Splitting `Module3Radar.tsx` monolith (deferred to `frontend-domain-layer`)
- `api.ts` / `dashboard-api.ts` refactor (deferred to `api-client-split`)
- `EvaluationsService` orchestrator split and email template extraction (deferred to `backend-use-cases`)
- Shared types / codegen between frontend and backend (deferred to `shared-types`)
- Normalizing the 218 inline `rgba()` / `#hex` values across 16 component files (deferred to `frontend-domain-layer`, tightly coupled with component refactors)
- Removing stale legacy fields from `types/index.ts`

## Capabilities

### New Capabilities
- `frontend-config`: Typed frontend configuration module exposing contact channels, public env vars, and semantic design tokens. Single source of truth for values currently hardcoded in components or stored as Tailwind class strings.
- `backend-config`: Typed backend configuration contract via `@nestjs/config` with validated namespaces (`app`, `mail`, `reminders`) and `ConfigService.get<T>()` accessors. Prohibits direct `process.env` reads in domain services.

### Modified Capabilities
None — there are no existing `openspec/specs/` entries and this change introduces new contracts rather than modifying existing spec-level behavior.

## Approach

**Frontend** — New `frontend/src/lib/config/` module with `contact.ts` (typed object `{ sales, support }` with E.164 numbers and display strings), `env.ts` (reads `NEXT_PUBLIC_*` with defaults), `tokens.ts` (semantic keys mapped to `var(--token-name)` strings), and an `index.ts` barrel. `Module6Action.tsx` imports `contact.sales`; `GlobalHeader.tsx` imports `contact.support`. `lib/constants/config.ts` is reduced to re-export semantic token keys — no Tailwind strings remain.

**Backend** — Add `backend/src/config/configuration.ts` factory returning a typed config tree and a Joi/Zod validation schema registered in `ConfigModule.forRoot({ validationSchema, load: [configuration] })`. Services inject `ConfigService` and call `configService.get<string>('app.frontendUrl')`. All direct `process.env` reads in the 3 target files are replaced.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `frontend/src/lib/config/` | New | New config module (contact, env, tokens, index) |
| `frontend/src/components/features/dashboard/modules/Module6Action.tsx` | Modified | Import `contact.sales` instead of hardcoded number |
| `frontend/src/components/shared/GlobalHeader.tsx` | Modified | Import `contact.support` instead of hardcoded number |
| `frontend/src/lib/constants/config.ts` | Modified | Tailwind class strings replaced by semantic token re-exports |
| `backend/src/config/configuration.ts` | New | Typed config factory + validation schema |
| `backend/src/app.module.ts` | Modified | `ConfigModule.forRoot` wired with factory + schema |
| `backend/src/common/mail.service.ts` | Modified | Inject `ConfigService`; remove `process.env` |
| `backend/src/diagnostic/responses/responses.service.ts` | Modified | Inject `ConfigService`; remove `process.env` |
| `backend/src/common/reminder-cron.service.ts` | Modified | Inject `ConfigService`; remove `process.env` |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| CSS var token names don't exist for every Tailwind color currently in `config.ts` | Medium | Audit `globals.css` before mapping; add missing tokens in the same change to keep change self-contained |
| Missing env var at runtime breaks backend boot | Low | Joi/Zod validation schema fails fast on startup with clear error; provide `.env.example` |
| Frontend env vars not injected at build time → undefined contact numbers in prod | Medium | Keep sensible hardcoded defaults inside `contact.ts` so the numbers work even without `NEXT_PUBLIC_*` set |
| Wrong WhatsApp number assigned to the wrong component | Low | Semantic names (`sales` vs `support`) enforce intent at call site; document in the module header |

## Rollback Plan

Each sub-area is independently revertable:
- **Frontend contact**: revert the two JSX imports; the hardcoded number literals are preserved in git history
- **Frontend tokens**: keep the old `config.ts` values committed in a single atomic commit so `git revert` restores Tailwind strings in one step
- **Backend config**: keep `ConfigModule` wiring additive; the three service edits can be reverted per-file without breaking the module registration

If the full change misbehaves, `git revert` of the merge commit restores all hardcoded values since no schema or DB changes are involved.

## Dependencies

- `@nestjs/config` (already installed)
- Joi or Zod for backend validation (pick one — prefer Zod; align with existing usage if any)
- No new frontend dependencies

## Success Criteria

- [ ] Zero occurrences of `process.env.FRONTEND_URL` in `backend/src/**/*.ts` (grep returns empty except in `configuration.ts`)
- [ ] Zero hardcoded WhatsApp number literals in `frontend/src/**/*.tsx` (grep for `15555550100` and `15555550199` returns empty except in `lib/config/contact.ts`)
- [ ] Zero Tailwind class strings (`bg-*`, `text-*`) used as values in `frontend/src/lib/constants/config.ts`
- [ ] Backend boots successfully with valid env; fails fast with schema error when required env vars are missing
- [ ] `Module6Action.tsx` uses `contact.sales`; `GlobalHeader.tsx` uses `contact.support` — verified by code inspection
- [ ] `cd backend && npm test` passes; `cd backend && npx tsc --noEmit` passes; `cd frontend && npm run lint` passes
