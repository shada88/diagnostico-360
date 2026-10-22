# backend-config Specification

## Purpose

Provide a validated, typed configuration contract for the NestJS backend using `@nestjs/config` and Zod. Guarantees the application fails fast on boot if required env vars are missing or malformed.

## Scope

**IS in scope:**
- `configuration()` factory parsing `process.env` through a Zod schema
- Namespaces: `app` (FRONTEND_URL, NODE_ENV), `mail` (Resend API key, from address), `reminders` (cron expression, thresholds)
- Typed `ConfigService.get<T>(key)` access pattern in `MailService`, `ResponsesService`, `ReminderCronService`
- Registration in `AppModule` via `ConfigModule.forRoot`

**IS NOT in scope:**
- JWT secret or auth configuration (separate concern)
- Database connection string (already handled by Prisma's own env reads)
- Frontend environment configuration
- Email template content or rendering

## Requirements

| # | Requirement | Strength |
|---|-------------|----------|
| REQ-1 | The `configuration()` factory MUST parse all env vars through a Zod schema before returning the config object | MUST |
| REQ-2 | If any required env var is missing in production (`NODE_ENV=production`), the app MUST refuse to start and log a clear validation error | MUST |
| REQ-3 | If `FRONTEND_URL` does not start with `http://` or `https://`, Zod MUST reject it and the app MUST refuse to start | MUST |
| REQ-4 | `MailService` MUST NOT access `process.env` directly; it MUST use injected `ConfigService` | MUST |
| REQ-5 | `ResponsesService` MUST NOT access `process.env` directly; it MUST use injected `ConfigService` | MUST |
| REQ-6 | `ReminderCronService` MUST NOT access `process.env` directly; it MUST use injected `ConfigService` | MUST |
| REQ-7 | Two services reading the same env var key MUST receive identical parsed values from `ConfigService` | MUST |
| REQ-8 | The Zod schema SHOULD use `z.infer<typeof schema>` to derive TypeScript types — no manual interface duplication | SHOULD |
| REQ-9 | Optional env vars (e.g. reminder thresholds) MAY have Zod `.default()` values so they never return `undefined` | MAY |

## Scenarios

#### Scenario: Boot with valid environment

- GIVEN all required env vars are set and valid (FRONTEND_URL with protocol, RESEND_API_KEY, etc.)
- WHEN the NestJS application bootstraps
- THEN `ConfigModule` loads without error
- AND `ConfigService.get<string>('app.frontendUrl')` returns the parsed URL string

#### Scenario: Boot with missing required env var in production

- GIVEN `NODE_ENV=production` and `RESEND_API_KEY` is not set
- WHEN the application starts
- THEN the Zod schema validation fails
- AND the app throws an error with a message identifying the missing key
- AND the app does NOT start (process exits or throws before `listen()`)

#### Scenario: Boot with malformed FRONTEND_URL

- GIVEN `FRONTEND_URL` is set to `localhost:3000` (no protocol)
- WHEN the `configuration()` factory runs
- THEN Zod rejects the value with a validation error indicating an invalid URL
- AND the app refuses to start

#### Scenario: MailService reads config via ConfigService

- GIVEN `MailService` is instantiated with `ConfigService` injected
- WHEN it needs to build the callback URL
- THEN it calls `this.configService.get<string>('app.frontendUrl')`
- AND there is no `process.env` access anywhere in `MailService`

#### Scenario: Two services read the same key, get the same value

- GIVEN `MailService` and `ResponsesService` both read `'app.frontendUrl'`
- WHEN both services are active in the same NestJS application instance
- THEN both calls to `ConfigService.get` return the same string value
- AND there is no divergence from duplicate `process.env` reads with different fallbacks

## Non-Goals

- Validating JWT secrets or auth tokens (handled by the auth module)
- Prisma / database connection string management
- Hot-reloading config at runtime (static config on boot only)
- Frontend environment variable handling

## Glossary

| Term | Definition |
|------|-----------|
| `configuration()` factory | A function registered in `ConfigModule.forRoot({ load: [configuration] })` that parses and returns a typed config tree |
| Namespace | A nested key grouping in the config tree (`app`, `mail`, `reminders`) accessed via dot-notation in `ConfigService.get` |
| Fail-fast | The app refuses to start rather than running with invalid or missing configuration |
| Zod schema | A `z.object({...})` declaration used to both validate and infer TypeScript types for the config object |
| `ConfigService.get<T>(key)` | NestJS typed accessor pattern; `key` is a dot-notation path like `'app.frontendUrl'` |
