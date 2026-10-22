# frontend-config Specification

## Purpose

Provide a single, typed configuration module for the frontend that centralizes contact channel numbers, public environment URLs, and design token keys. Eliminates hardcoded literals in components.

## Scope

**IS in scope:**
- Contact channel config (`contact.sales`, `contact.support`) with E.164 numbers and display strings
- Public env var reads (`NEXT_PUBLIC_*`) with hardcoded compile-time defaults
- Design token keys mapped to CSS custom property strings (`var(--token-name)`)
- Barrel export from `frontend/src/lib/config/index.ts`

**IS NOT in scope:**
- Tailwind utility class generation or Tailwind theme configuration
- CSS variable definitions (those live in `globals.css`)
- API URL construction or authentication config
- Shared types between frontend and backend

## Requirements

| # | Requirement | Strength |
|---|-------------|----------|
| REQ-1 | The module MUST export `contact.sales` with the US commercial number (+1 555 555 0100) and a display string | MUST |
| REQ-2 | The module MUST export `contact.support` with the CO support number (+1 555 555 0199) and a display string | MUST |
| REQ-3 | Contact values MUST be readable from `NEXT_PUBLIC_CONTACT_SALES` and `NEXT_PUBLIC_CONTACT_SUPPORT` env vars; if absent, hardcoded defaults MUST be used | MUST |
| REQ-4 | The module MUST export env-derived URLs via `env.ts`; each URL MUST have a hardcoded default so missing `NEXT_PUBLIC_*` never causes `undefined` | MUST |
| REQ-5 | Design token keys (e.g. `severity.high`) MUST resolve to a CSS custom property string usable in inline styles (`var(--alert-error)`) | MUST |
| REQ-6 | No component file MUST import a hardcoded phone number literal; all reads go through `config.contact.*` | MUST NOT |
| REQ-7 | `lib/constants/config.ts` MUST NOT contain Tailwind utility class strings (`bg-*`, `text-*`) after this change | MUST NOT |
| REQ-8 | All exports SHOULD be TypeScript `as const` or typed interfaces to preserve literal types | SHOULD |

## Scenarios

#### Scenario: Sales CTA reads commercial number

- GIVEN `Module6Action.tsx` renders
- WHEN it accesses `config.contact.sales`
- THEN it receives `{ number: '+15555550100', display: '+1 555 555 0100' }` (or env override)
- AND the component renders without any hardcoded number literal in its source

#### Scenario: Support CTA reads support number

- GIVEN `GlobalHeader.tsx` renders
- WHEN it accesses `config.contact.support`
- THEN it receives `{ number: '+15555550199', display: '+1 555 555 0199' }` (or env override)
- AND the component renders without any hardcoded number literal in its source

#### Scenario: Missing NEXT_PUBLIC_* at build time

- GIVEN `NEXT_PUBLIC_CONTACT_SALES` is not set in the build environment
- WHEN `contact.ts` is evaluated at module load
- THEN `config.contact.sales.number` returns the hardcoded default `'+15555550100'`
- AND no runtime error or `undefined` value is produced

#### Scenario: Design token key resolves to CSS var string

- GIVEN a component reads `config.tokens.severity.high`
- WHEN it passes that value to an inline style (`style={{ color: config.tokens.severity.high }}`)
- THEN the resolved value is the string `'var(--alert-error)'`
- AND the string is directly usable in a CSS `var()` expression without transformation

#### Scenario: Token key used in CSS stylesheet

- GIVEN a CSS file references `var(--alert-error)`
- WHEN the corresponding token key (`severity.high`) is used via `config.tokens`
- THEN both the inline style and the CSS var reference the same CSS custom property name
- AND the visual output is consistent between the two usage sites

## Non-Goals

- Defining or setting CSS custom property values (that belongs to `globals.css`)
- Runtime env var injection (handled by Next.js build pipeline)
- Validation of env var format (no Zod on the frontend config)
- Theming or dark-mode switching logic

## Glossary

| Term | Definition |
|------|-----------|
| `contact.sales` | Config key for the US WhatsApp number used for commercial inquiries and mentorship scheduling |
| `contact.support` | Config key for the CO WhatsApp number used for technical support |
| Design token key | A semantic string key (e.g. `severity.high`) that maps to a CSS custom property reference string |
| `NEXT_PUBLIC_*` | Next.js convention for env vars exposed to the browser at build time |
| Hardcoded default | A literal value baked into source code used when the env var is absent |
