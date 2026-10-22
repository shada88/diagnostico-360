# Historial de desarrollo

Este repositorio público empieza con un historial nuevo, porque el original contenía material del cliente que no podía publicarse (ver el aviso de anonimización en el [README](../README.md#aviso-de-anonimización)).

Para no perder la trazabilidad del proceso, abajo están los **14 commits originales** con sus fechas y mensajes, tal como se escribieron. Cada cambio estructural marcado con 📐 tiene sus artefactos de Spec-Driven Development en [`openspec/changes/archive/`](../openspec/changes/archive/).

## Línea de tiempo

| Fecha | Commit | Tipo | Mensaje |
|-------|--------|------|---------|
| 2026-04-16 | `b1945dd` | feat | complete initial diagnostic dashboard modules and UX/UI |
| 2026-04-17 | `a1944e1` | feat | implement automated 30-day diagnosis follow-up reminders with timezone-aware scheduling and dashboard evolution tracking |
| 2026-04-17 | `9108ed6` | refactor(config) | add zod and create backend config module with Zod validation 📐 |
| 2026-04-17 | `ee7736c` | refactor(config) | migrate backend services to use ConfigService, remove all process.env reads 📐 |
| 2026-04-17 | `7e4c3bc` | docs(sdd) | add config-normalization change artifacts and openspec scaffold 📐 |
| 2026-04-17 | `dcbb77b` | chore(sdd) | archive config-normalization change and sync specs 📐 |
| 2026-04-18 | `3848a49` | refactor(frontend) | establish domain layer and split Module3Radar 📐 |
| 2026-04-18 | `5ff9c08` | refactor(frontend) | split api client into typed feature modules 📐 |
| 2026-04-18 | `306a0cb` | refactor(backend) | extract use cases from fat services and fix config 📐 |
| 2026-04-18 | `3ee995a` | refactor(types) | harden api response types and remove implicit any 📐 |
| 2026-04-18 | `5f45624` | UI | Refine GlobalHeader and allow Resend sandbox testing |
| 2026-04-18 | `55b4cf6` | Fix | Add missing zod dependency to backend |
| 2026-04-18 | `926f924` | Fix | Wrap GlobalHeader in Suspense to resolve Next.js build error |
| 2026-05-12 | `6013583` | refactor(dashboard) | simplify results dashboard with strategic narrative AI |

Los hashes corresponden al repositorio original (privado) y no existen en este.

## Fases

1. **Construcción inicial (16–17 abr)**: dashboard, cuestionario, recordatorios a 30 días y vista de evolución.
2. **Refactor guiado por SDD (17–18 abr)**: configuración tipada con Zod, capa de dominio en el frontend, cliente HTTP por recurso, casos de uso en el backend y tipos endurecidos. Cada cambio pasó por propuesta → spec → diseño → tareas → verificación → archivo.
3. **Estabilización (18 abr)**: fixes de dependencias y de build.
4. **Rediseño del dashboard (12 may)**: narrativa IA de causa → efecto (`ImpactConnection`), radar interactivo, plan de acción de 3 pasos.
5. **Cierre (oct 2026)**: proyecto descontinuado; documentación técnica y anonimización para publicarlo como caso de estudio.

## Observaciones para la evaluación

- Los commits de la fase 2 siguen Conventional Commits; los de la fase 3 no (`UI:`, `Fix:`). Es una inconsistencia real del proceso.
- El commit `a1944e1` mezcla dos funcionalidades (recordatorios y evolución) en un solo cambio.
- No hay commits de tests: la cobertura quedó mínima (ver [DEVELOPMENT.md](DEVELOPMENT.md#5-testing)).
