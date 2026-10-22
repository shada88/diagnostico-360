# Tasks: config-normalization

## Group A — Setup

- [x] T1 — Install `zod` in backend
  - Run `npm install zod` inside `backend/`
  - Acceptance: `backend/package.json` lists `zod` as a dependency
  - Fulfills: backend-config REQ-1

- [x] T2 — Verify `@nestjs/config` is present (skip install if yes)
  - Grep `backend/package.json` for `@nestjs/config`; confirm `^4.0.3` or later
  - Acceptance: no install needed; version logged in apply-progress
  - Fulfills: backend-config REQ-1

## Group B — Backend config module

- [x] T3 — Create `backend/src/config/config.schema.ts`
  - Zod schema with `app` (`nodeEnv`, `frontendUrl` z.url()), `mail` (`resendApiKey`, `fromDomain`), `reminders` (`cronExpression`, `followUpThreshold`)
  - Acceptance: file compiles, `z.url()` rejects bare `localhost:3000`
  - Fulfills: backend-config REQ-1, REQ-3, REQ-8, REQ-9
  - Depends on: T1

- [x] T4 — Create `backend/src/config/config.types.ts`
  - `export type AppConfig = z.infer<typeof configSchema>`; no manual interface duplication
  - Acceptance: `AppConfig` is resolvable via TS; no hand-written interface
  - Fulfills: backend-config REQ-8
  - Depends on: T3

- [x] T5 — Create `backend/src/config/configuration.ts`
  - `configuration()` factory: assemble from `process.env`, `safeParse`, throw on failure with Zod message
  - Acceptance: invalid URL input throws at app start; missing required key in prod throws
  - Fulfills: backend-config REQ-1, REQ-2, REQ-3
  - Depends on: T3

- [x] T6 — Create `backend/src/config/index.ts` barrel
  - Re-exports `configuration`, `configSchema`, `AppConfig`
  - Acceptance: single import path for all config artifacts
  - Depends on: T3, T4, T5

- [x] T7 — Register in `backend/src/app.module.ts`
  - Add `load: [configuration]` to existing `ConfigModule.forRoot`; verify `isGlobal: true` and no duplicate registration
  - Acceptance: app starts; no duplicate ConfigModule warnings
  - Fulfills: backend-config REQ-1
  - Depends on: T5, T6

- [x] T8 — Create `backend/src/config/configuration.spec.ts`
  - Scenarios: (a) valid env parses cleanly, (b) missing `RESEND_API_KEY` in prod throws, (c) `FRONTEND_URL` without protocol throws
  - Acceptance: `npm test -- config` passes all three cases
  - Fulfills: backend-config REQ-2, REQ-3
  - Depends on: T5

## Group C — Backend service migration

- [x] T9 — Migrate `backend/src/common/mail.service.ts`
  - Inject `ConfigService`; replace all `process.env.RESEND_API_KEY`, `process.env.MAIL_DOMAIN`, `process.env.FRONTEND_URL` reads
  - Acceptance: file contains zero `process.env` references; tests pass
  - Fulfills: backend-config REQ-4, REQ-7
  - Depends on: T7

- [x] T10 — Migrate `backend/src/diagnostic/responses/responses.service.ts`
  - Inject `ConfigService`; replace `process.env.FRONTEND_URL`
  - Acceptance: file contains zero `process.env` references
  - Fulfills: backend-config REQ-5, REQ-7
  - Depends on: T7

- [x] T11 — Migrate `backend/src/common/reminder-cron.service.ts`
  - Inject `ConfigService`; replace `process.env.FRONTEND_URL`
  - Acceptance: file contains zero `process.env` references
  - Fulfills: backend-config REQ-6, REQ-7
  - Depends on: T7

- [x] T12 — Grep check: no `process.env.FRONTEND_URL` outside `backend/src/config/`
  - Acceptance: grep returns empty — no matches
  - Depends on: T9, T10, T11

## Group D — Frontend config module

- [x] T13 — Create `frontend/src/lib/config/contact.ts`
  - `ContactChannel { number: string; display: string }`; `contact.sales` and `contact.support` with `NEXT_PUBLIC_*` env overrides and hardcoded defaults
  - Acceptance: missing env var returns default (no undefined); `as const` or typed
  - Fulfills: frontend-config REQ-1, REQ-2, REQ-3, REQ-8

- [x] T14 — Create `frontend/src/lib/config/env.ts`
  - `apiUrl` (NEXT_PUBLIC_API_URL → `localhost:3001`), `frontendUrl` (NEXT_PUBLIC_FRONTEND_URL → `localhost:3000`)
  - Acceptance: no property is ever `undefined`; `as const`
  - Fulfills: frontend-config REQ-4, REQ-8

- [x] T15 — Create `frontend/src/lib/config/tokens.ts`
  - `severity.{critical,warning,attention,good}` and `alert.{error,warn,success,info}` mapped to `var(--...)` strings per design audit
  - Acceptance: zero new CSS vars introduced; each key resolves to an existing CSS custom property
  - Fulfills: frontend-config REQ-5, REQ-8

- [x] T16 — Create `frontend/src/lib/config/index.ts` barrel
  - Composes and exports `config = { contact, env, tokens } as const`
  - Acceptance: single import `from '@/lib/config'` resolves all sub-modules
  - Depends on: T13, T14, T15

- [x] T17 — Migrate `Module6Action.tsx`
  - Replace hardcoded `15555550100` with `config.contact.sales.number` (strip `+` for wa.me URL)
  - Acceptance: no phone literal in file; renders correct wa.me link
  - Fulfills: frontend-config REQ-6
  - Depends on: T13, T16

- [x] T18 — Migrate `GlobalHeader.tsx`
  - Replace hardcoded `15555550199` with `config.contact.support.number` (strip `+` for wa.me URL)
  - Acceptance: no phone literal in file; renders correct wa.me link
  - Fulfills: frontend-config REQ-6
  - Depends on: T13, T16

- [x] T19 — Refactor `frontend/src/lib/constants/config.ts`
  - Rewrite `getStatusColor` to return `tokens.severity.*` CSS var strings; keep threshold constants; remove all Tailwind `bg-*` strings
  - Acceptance: no Tailwind class strings remain in this file; callers switch to inline `style={{ background: ... }}`
  - Fulfills: frontend-config REQ-7
  - Depends on: T15

- [x] T20 — Update callers of `DASHBOARD_CONFIG.COLORS` / `getStatusColor`
  - Switch from `className={getStatusColor(s)}` to `style={{ background: getStatusColor(s) }}`
  - Acceptance: no component applies a dynamic Tailwind class from `getStatusColor`
  - Fulfills: frontend-config REQ-7
  - Depends on: T19

## Group E — Documentation

- [~] T21 — Update `.env.example` (frontend and backend)
  - BLOCKED: global system policy denies writes to `.env*` files. Content prepared; user must create manually — see `openspec/changes/config-normalization/env-examples/` for templates.
  - Depends on: T5, T13, T14

## Group F — Verification

- [x] T22 — `cd backend && npx tsc --noEmit` must pass — clean, no errors
  - Depends on: T7, T9, T10, T11

- [x] T23 — `cd frontend && npx tsc --noEmit` must pass — only pre-existing `.next/types/validator.ts` error (empty `app/home/`, not caused by this change)
  - Depends on: T16, T17, T18, T19, T20

- [x] T24 — `cd backend && npm test -- --testPathPatterns=config` — 3/3 passed
  - Depends on: T8

- [x] T25 — Grep sweep: phone literals only in `frontend/src/lib/config/contact.ts`
  - Depends on: T17, T18

- [x] T26 — Grep sweep: `process.env.FRONTEND_URL` only inside `backend/src/config/` (allowed)
  - Depends on: T12

- [x] T27 — Grep sweep: no Tailwind `bg-*` / `text-*` strings inside `frontend/src/lib/constants/config.ts`
  - Depends on: T19
