# Design: config-normalization

## 1. Architecture Overview

```
frontend/src/lib/config/          backend/src/config/
  contact.ts   ──┐                  configuration.ts ──┐
  env.ts       ──┼──► index.ts      config.schema.ts   ├──► index.ts
  tokens.ts    ──┘        │         config.types.ts  ──┘        │
                          ▼                                      ▼
          Module6Action.tsx (contact.sales)      AppModule.forRoot({ load: [configuration] })
          GlobalHeader.tsx  (contact.support)              │
          lib/constants/config.ts (tokens)                 ▼
                                               MailService, ResponsesService,
                                               ReminderCronService
                                               (inject ConfigService)
```

Both sides expose a barrel (`index.ts`) as the only public entry point. Consumers import `from '@/lib/config'` (frontend) or `from 'src/config'` (backend).

## 2. Frontend config — file skeletons

### `frontend/src/lib/config/contact.ts`
```ts
// WhatsApp channels. Sales = US commercial, Support = CO technical.
// Env overrides via NEXT_PUBLIC_CONTACT_*; defaults keep prod safe.
export interface ContactChannel {
  number: string;   // E.164, no separators — used in wa.me URL
  display: string;  // Human-formatted — shown in UI
}

const SALES_DEFAULT: ContactChannel = {
  number: '+15555550100',
  display: '+1 555 555 0100',
};
const SUPPORT_DEFAULT: ContactChannel = {
  number: '+15555550199',
  display: '+1 555 555 0199',
};

export const contact = {
  sales:   { number: process.env.NEXT_PUBLIC_CONTACT_SALES   ?? SALES_DEFAULT.number,   display: SALES_DEFAULT.display },
  support: { number: process.env.NEXT_PUBLIC_CONTACT_SUPPORT ?? SUPPORT_DEFAULT.number, display: SUPPORT_DEFAULT.display },
} as const;
```

### `frontend/src/lib/config/env.ts`
```ts
export const env = {
  apiUrl:      process.env.NEXT_PUBLIC_API_URL      ?? 'http://localhost:3001',
  frontendUrl: process.env.NEXT_PUBLIC_FRONTEND_URL ?? 'http://localhost:3000',
} as const;
```

### `frontend/src/lib/config/tokens.ts`
```ts
// Semantic keys → var(--token) strings usable in inline style and CSS.
export const tokens = {
  severity: {
    critical:  'var(--critico-fg)',     // score < 40
    warning:   'var(--riesgo-fg)',      // 40..60
    attention: 'var(--estable)',        // 60..80 — NEW token (see mapping)
    good:      'var(--excelente-fg)',   // >= 80
  },
  alert: {
    error:   'var(--alert-critical-fg)',
    warn:    'var(--alert-warning-fg)',
    success: 'var(--alert-success-fg)',
    info:    'var(--alert-mejora-fg)',
  },
} as const;

export type SeverityKey = keyof typeof tokens.severity;
```

### `frontend/src/lib/config/index.ts`
```ts
export { contact } from './contact';
export { env } from './env';
export { tokens } from './tokens';

export const config = { contact, env, tokens } as const;
```

## 3. Token Mapping Audit

Current `DASHBOARD_CONFIG.COLORS` uses Tailwind utility classes for BACKGROUND usage (score pill). Mapping to semantic CSS vars:

| Current (Tailwind) | Threshold | New token key | CSS var | Exists in globals.css? |
|--------------------|-----------|---------------|---------|------------------------|
| `bg-red-500`       | < 40  CRITICAL  | `severity.critical`  | `var(--critico-fg)`    | YES |
| `bg-orange-400`    | < 60  WARNING   | `severity.warning`   | `var(--riesgo-fg)`     | YES |
| `bg-amber-400`     | < 80  ATTENTION | `severity.attention` | `var(--estable)`       | YES (muted tone — acceptable) |
| `bg-emerald-500`   | >= 80 GOOD      | `severity.good`      | `var(--excelente-fg)`  | YES |

**No new CSS vars required.** All four map to existing tokens. `getStatusColor` returns a CSS var string instead of a Tailwind class — callers switch from `className={getStatusColor(s)}` to `style={{ background: getStatusColor(s) }}`.

## 4. Backend config — file skeletons

### `backend/src/config/config.schema.ts`
```ts
import { z } from 'zod';

export const configSchema = z.object({
  app: z.object({
    nodeEnv:     z.enum(['development', 'test', 'production']).default('development'),
    frontendUrl: z.string().url(),
  }),
  mail: z.object({
    resendApiKey: z.string().min(1),
    fromDomain:   z.string().default('example.com'),
  }),
  reminders: z.object({
    cronExpression:    z.string().default('0 9 * * *'),
    followUpThreshold: z.coerce.number().int().positive().default(30),
  }),
});
```

### `backend/src/config/config.types.ts`
```ts
import { z } from 'zod';
import { configSchema } from './config.schema';

export type AppConfig = z.infer<typeof configSchema>;
```

### `backend/src/config/configuration.ts`
```ts
import { configSchema } from './config.schema';
import type { AppConfig } from './config.types';

export const configuration = (): AppConfig => {
  const parsed = configSchema.safeParse({
    app: {
      nodeEnv:     process.env.NODE_ENV,
      frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    },
    mail: {
      resendApiKey: process.env.RESEND_API_KEY ?? '',
      fromDomain:   process.env.MAIL_DOMAIN,
    },
    reminders: {
      cronExpression:    process.env.REMINDER_CRON,
      followUpThreshold: process.env.REMINDER_THRESHOLD_DAYS,
    },
  });
  if (!parsed.success) {
    throw new Error(`Config validation failed: ${parsed.error.message}`);
  }
  return parsed.data;
};
```

### `backend/src/config/index.ts`
```ts
export { configuration } from './configuration';
export { configSchema } from './config.schema';
export type { AppConfig } from './config.types';
```

**Note**: in `production`, `resendApiKey.min(1)` fails if absent — fail-fast honored. In dev/test the default keeps local boots green.

## 5. Migration Plan — File by File

| File | Change (old → new) | Risk | Verification |
|------|---|---|---|
| `frontend/src/lib/config/contact.ts` | CREATE | Low | `tsc --noEmit` |
| `frontend/src/lib/config/env.ts` | CREATE | Low | `tsc --noEmit` |
| `frontend/src/lib/config/tokens.ts` | CREATE | Low | `tsc --noEmit` |
| `frontend/src/lib/config/index.ts` | CREATE | Low | Import resolves |
| `frontend/src/lib/constants/config.ts` | KEEP file, rewrite: remove Tailwind strings, return CSS var strings via `tokens.severity.*` | Med | Grep `bg-red-500` etc returns empty; dashboard score pill renders with inline style |
| `Module6Action.tsx` | `const whatsappNumber = "15555550100"` → `import { contact } from '@/lib/config'; const whatsappNumber = contact.sales.number.replace('+','')` | Low | Grep `15555550100` in `*.tsx` returns only `contact.ts` |
| `GlobalHeader.tsx` | `wa.me/15555550199` → `wa.me/${contact.support.number.replace('+','')}` | Low | Grep `15555550199` in `*.tsx` returns only `contact.ts` |
| `backend/src/config/*` | CREATE (4 files) | Low | `tsc --noEmit`, Jest spec |
| `backend/src/app.module.ts` | `ConfigModule.forRoot({ isGlobal, envFilePath })` → add `load: [configuration]` | Med | App boots; boot fails with bad URL |
| `backend/src/common/mail.service.ts` | Constructor injects `ConfigService`; replace 4× `process.env.RESEND_API_KEY`, 4× `process.env.MAIL_DOMAIN`, 1× `process.env.FRONTEND_URL` | Med | Grep `process.env` returns empty |
| `backend/src/diagnostic/responses/responses.service.ts` | Inject `ConfigService`; replace 1× `process.env.FRONTEND_URL` | Low | Grep returns empty |
| `backend/src/common/reminder-cron.service.ts` | Inject `ConfigService`; replace 1× `process.env.FRONTEND_URL` | Low | Grep returns empty |
| `.env.example` (backend) | Document `FRONTEND_URL`, `RESEND_API_KEY`, `MAIL_DOMAIN`, `REMINDER_CRON`, `REMINDER_THRESHOLD_DAYS` | Low | File present |
| `frontend/.env.example` | Document `NEXT_PUBLIC_CONTACT_SALES`, `NEXT_PUBLIC_CONTACT_SUPPORT`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_FRONTEND_URL` | Low | File present |

**Decision**: `lib/constants/config.ts` is NOT deleted — it stays as the thresholds + a `getStatusColor` helper that returns CSS var strings. The callers keep one import point and thresholds stay colocated with the helper that consumes them.

## 6. Dependencies To Add

| Package | Where | Status |
|---------|-------|--------|
| `zod` | backend `dependencies` | ADD (`npm i zod` inside `backend/`) |
| `@nestjs/config` | backend | Already present (`^4.0.3`) |
| frontend deps | — | None |

## 7. Test Strategy

| Layer | What | How |
|-------|------|-----|
| Backend unit | `configuration()` happy path | Jest spec: set valid env, expect typed object returned |
| Backend unit | Missing `FRONTEND_URL` protocol | Set `FRONTEND_URL=localhost:3000`, expect throw |
| Backend unit | Missing `RESEND_API_KEY` in production | Set `NODE_ENV=production`, unset key, expect throw |
| Backend integration | `AppModule` boots with valid env | Existing boot path, verify no regression |
| Frontend | No test runner available | `tsc --noEmit` + ESLint + manual grep for the literals listed in Success Criteria |

## 8. Rollback Plan

Each sub-area is independently revertable. If any single file edit misbehaves, `git revert` the specific commit. If the whole change misbehaves, `git revert` the merge commit — no DB or schema changes are involved, so the rollback is pure code. The hardcoded literals remain in git history as the ground truth.

## 9. Open Questions / Assumptions

- Assumption: The `lib/constants/config.ts` consumer(s) can accept a CSS var string instead of a Tailwind class. Needs grep + switch at apply time; if any caller requires a Tailwind class for layout tokens, we keep that caller on Tailwind and only migrate the colour tokens.
- Assumption: `MAIL_DOMAIN` default `'example.com'` is correct for production (matches current hardcoded fallback).
- Assumption: `REMINDER_CRON` and `REMINDER_THRESHOLD_DAYS` are useful namespaces even if not yet read by all services — they're part of the `reminders` namespace scaffolding referenced in the spec.
- Open: Should `configService.get` calls use `{ infer: true }` generic pattern or simple `get<string>('app.frontendUrl')`? Recommendation for apply: use `{ infer: true }` since `z.infer` already gives us the type shape.
