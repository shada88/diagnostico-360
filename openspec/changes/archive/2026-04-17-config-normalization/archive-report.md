# Archive Report: config-normalization

**Archived**: 2026-04-17
**Status**: complete-with-user-action
**Branch**: main

## Summary

First change in the 5-part modularization initiative. Eliminated three anti-patterns:
1. Hardcoded WhatsApp phone numbers scattered across components
2. Direct `process.env` reads in backend services
3. Tailwind class strings stored as config values

## Delivered

- **Backend**: `backend/src/config/` typed module (Zod v4 schema + factory + types + barrel + Jest spec). 3 services migrated to `ConfigService`. 4th (`auth.controller.ts`) migrated opportunistically.
- **Frontend**: `frontend/src/lib/config/` typed module (`contact.ts`, `env.ts`, `tokens.ts`, `index.ts` barrel). Two components migrated. `constants/config.ts` refactored to use CSS var tokens.
- **Specs synced** to `openspec/specs/frontend-config/` and `openspec/specs/backend-config/`.

## Task completion

- 26/27 tasks complete
- T21 (env.example files) blocked by harness policy — templates provided, user must rename manually

## Commits

- `9108ed6` refactor(config): add zod and create backend config module with Zod validation
- `ee7736c` refactor(config): migrate backend services to use ConfigService, remove all process.env reads
- `7e4c3bc` docs(sdd): add config-normalization change artifacts and openspec scaffold

## User follow-up

1. Copy `env-examples/backend.env.example.txt` → `backend/.env.example`
2. Copy `env-examples/frontend.env.local.example.txt` → `frontend/.env.local.example`
3. Ensure production deploys set `RESEND_API_KEY`, `FRONTEND_URL`, `DATABASE_URL`, `JWT_SECRET`

## Next change

`frontend-domain-layer` (Change #2) — split `Module3Radar.tsx`, establish domain/ layer, move findings-engine. Deferred to next session.
