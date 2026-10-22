# Diagnóstico 360° del Emprendedor — Acme Consultores

> 📚 **Caso de estudio de calidad de software.** Proyecto real descontinuado y anonimizado. Ver [Estado del proyecto](#estado-del-proyecto) y [Aviso de anonimización](#aviso-de-anonimización).

> *"Tu resultado no es una etiqueta… es tu punto de partida."*

Plataforma web de evaluación integral para emprendedores. El usuario responde **30 afirmaciones** (escala 1–10) y recibe un **dashboard estratégico** que cruza tres dimensiones — **Vida interna, Negocio y Crecimiento** — clasificadas con la **Escala de Madurez** de 5 niveles, alertas de inferencia cruzada y un análisis narrativo generado por IA. El diagnóstico funciona como **puerta de entrada comercial** a los procesos de mentoría de Acme Consultores.

---

## Tabla de contenido

| Documento | Qué cubre |
|-----------|-----------|
| [docs/DOMAIN.md](docs/DOMAIN.md) | Dominio, lenguaje ubicuo, modelo 3D, escala de madurez, fórmulas, reglas de inferencia |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Stack, arquitectura backend/frontend, módulos, flujos, modelo de datos |
| [docs/API.md](docs/API.md) | Referencia de endpoints REST, autenticación, contratos (DTOs) |
| [docs/INTEGRATIONS.md](docs/INTEGRATIONS.md) | Conectores externos: Gemini, Groq, Resend, Google OAuth, PostgreSQL/Supabase, WhatsApp |
| [docs/UX-UI.md](docs/UX-UI.md) | Sistema de diseño, tokens, tipografía, flujo de usuario, vistas del dashboard |
| [docs/BUSINESS.md](docs/BUSINESS.md) | Modelo de negocio, embudo, propuesta de valor |
| [docs/SECURITY.md](docs/SECURITY.md) | Modelo de seguridad actual, riesgos conocidos y plan de remediación |
| [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) | Setup local, variables de entorno, scripts, testing, metodología SDD, convenciones |
| [docs/CHANGELOG.md](docs/CHANGELOG.md) | Historial de desarrollo original (14 commits) y fases del proyecto |

---

## Resumen ejecutivo

| Aspecto | Detalle |
|---------|---------|
| **Producto** | Diagnóstico 360° del Emprendedor (Modelo 3D: Vida + Negocio + Crecimiento) |
| **Usuarios** | Emprendedores y dueños de negocio (hispanohablantes, LATAM / EE. UU.) |
| **Idioma de la interfaz** | Español neutro (segunda persona "tú") |
| **Monorepo** | `frontend/` (Next.js) + `backend/` (NestJS) |
| **Lenguaje** | TypeScript end-to-end |
| **Frontend** | Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · Framer Motion · Recharts |
| **Backend** | NestJS 11 · Prisma 5 · PostgreSQL 15 · Passport (JWT + Google OAuth) · Zod |
| **IA** | Google Gemini `gemini-2.5-flash` (primario) → Groq `llama-3.3-70b-versatile` (fallback) |
| **Email** | Resend (transaccional, event-driven) |
| **Arquitectura** | Monolito modular por dominios (*Screaming Architecture*) + capa de *Use Cases* |
| **Metodología** | Spec-Driven Development (OpenSpec) · Conventional Commits |
| **Docs de API** | Swagger UI en `GET /api` |

---

## Cómo funciona (en 60 segundos)

```
┌───────────┐   ┌──────────────┐   ┌──────────────┐   ┌───────────────────┐   ┌─────────────────┐
│ Registro  │──▶│ Perfil       │──▶│ Cuestionario │──▶│ Motor de cálculo  │──▶│ Dashboard 360°  │
│ email/    │   │ (nombre,     │   │ 30 preguntas │   │ Madurez + 4 reglas   │   │ + Informe IA    │
│ Google    │   │ negocio, TZ) │   │ 1 a 1        │   │ + Análisis IA     │   │ + Evolución     │
└───────────┘   └──────────────┘   └──────────────┘   └───────────────────┘   └────────┬────────┘
                                                                                     │
                     Email de resultados (Resend) ◀──────────────────────────────────┤
                     Recordatorio a 30 días (cron, 9am hora local) ◀─────────────────┤
                     CTA WhatsApp → mentoría Acme Consultores ◀─────────────────────────┘
```

1. **Captación** — Registro con email + código de verificación de 6 dígitos, o Google OAuth.
2. **Perfilado** — Nombre, negocio, país, ciudad, teléfono y zona horaria.
3. **Evaluación** — 30 afirmaciones (10 áreas × 3), una por pantalla, con autoavance.
4. **Cálculo** — Promedios por área → dimensión → Índice Global; clasificación de madurez; 4 alertas cruzadas.
5. **Narrativa IA** — Resumen ejecutivo, conexiones de impacto, plan de 30 días, invitación a mentoría.
6. **Retención** — Histórico de diagnósticos, análisis de evolución IA y recordatorio automático a los 30 días.

---

## Quick start

```bash
# 1. Base de datos local (PostgreSQL 15 en el puerto 5436)
cd backend
docker compose up -d

# 2. Backend
npm install
#   crear backend/.env (ver docs/DEVELOPMENT.md#variables-de-entorno)
npx prisma migrate deploy
npx prisma db seed          # roles + encuesta de 30 preguntas
npm run start:dev           # http://localhost:3006  ·  Swagger: http://localhost:3006/api

# 3. Frontend
cd ../frontend
npm install
#   crear frontend/.env.local con NEXT_PUBLIC_API_URL=http://localhost:3006
npm run dev                 # http://localhost:3000
```

Detalle completo en [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md).

---

## Estructura del repositorio

```
diagnostico-360/
├── backend/                  API NestJS
│   ├── prisma/               schema, migraciones y seed (banco de 30 preguntas)
│   └── src/
│       ├── identity/         Bounded context: autenticación y usuarios
│       ├── diagnostic/       Bounded context: encuestas, respuestas, evaluación, dashboard
│       ├── ai/               Adaptador de proveedores LLM (Gemini → Groq)
│       ├── analytics/        Logging de métricas de análisis
│       ├── common/           Prisma, Mail (Resend), Cron de recordatorios
│       └── config/           Configuración tipada y validada con Zod
├── frontend/                 App Next.js
│   └── src/
│       ├── app/              Rutas (App Router)
│       ├── components/       features/ (auth, survey, dashboard) · shared/ · layout/
│       ├── domain/           Lógica de dominio pura: maturity/, findings/, radar/
│       ├── lib/              api/ (por recurso), http/, config/, constants/
│       └── types/            Contratos compartidos con el backend
├── openspec/                 Artefactos de Spec-Driven Development (specs, cambios archivados)
└── docs/                     Esta documentación técnica
```

---

## Estado del proyecto

- **Descontinuado.** El producto no llegó a producción. El código se conserva tal como quedó al cierre del desarrollo, sin correcciones posteriores, para que sirva como **caso de estudio de calidad de software**.
- **Madurez**: MVP funcional. Tiene **riesgos de seguridad abiertos y documentados** a propósito — ver [docs/SECURITY.md](docs/SECURITY.md).
- **Testing**: cobertura mínima (2 suites en backend; sin runner en frontend).

---

## Aviso de anonimización

Este repositorio fue anonimizado antes de publicarse:

- **"Acme Consultores"** es un nombre ficticio. El logo es un placeholder genérico.
- Dominios (`example.com`) y teléfonos (`+1 555 555 01xx`) son valores reservados para ejemplos.
- Las 30 afirmaciones del cuestionario y los textos de interfaz son **contenido de ejemplo**, no la metodología original.
- Se excluyó toda la documentación de producto del cliente.

La arquitectura, la lógica de cálculo, el historial de decisiones (OpenSpec) y la deuda técnica son los reales.

---

## Licencia

© 2026 — Todos los derechos reservados. Publicado únicamente con fines **académicos y de evaluación de calidad de software**. Ver [LICENSE](LICENSE).
