# Guía de Desarrollo

## 1. Requisitos

| Herramienta | Versión |
|-------------|---------|
| Node.js | 20 LTS o superior (frontend tipado con `@types/node@20`, backend con `@types/node@22`) |
| npm | 10+ (hay `package-lock.json` en cada app) |
| Docker + Docker Compose | Para PostgreSQL local |
| Cuentas externas | Resend, Google Cloud (OAuth), Google AI Studio (Gemini) y opcionalmente Groq |

---

## 2. Setup local

```bash
# Base de datos (puerto host 5436)
cd backend
docker compose up -d

# Backend
npm install
# crear backend/.env (ver sección 3)
npx prisma migrate deploy      # aplica migraciones
npx prisma db seed             # roles ADMIN/USER + encuesta "Diagnóstico 360° del Emprendedor" (30 preguntas)
npm run start:dev              # http://localhost:3006 · Swagger en /api

# Frontend (otra terminal)
cd frontend
npm install
# crear frontend/.env.local (ver sección 3)
npm run dev                    # http://localhost:3000
```

---

## 3. Variables de entorno

### Backend — `backend/.env`

| Variable | Requerida | Default | Descripción |
|----------|-----------|---------|-------------|
| `NODE_ENV` | No | `development` | `development` \| `test` \| `production` |
| `PORT` | No | `3006` | Puerto HTTP |
| `FRONTEND_URL` | Sí (validada) | `http://localhost:3000` | Base de los links en emails y redirect OAuth |
| `DATABASE_URL` | **Sí** | — | Ej. `postgresql://postgres:postgres@localhost:5436/diagnostico360` |
| `DIRECT_URL` | **Sí** (Prisma) | — | Conexión directa para migraciones (en local, igual a `DATABASE_URL`) |
| `JWT_SECRET` | **Sí** ⚠️ | `'secretKey'` (inseguro) | Firma de tokens. Ver [SECURITY.md S3](SECURITY.md) |
| `RESEND_API_KEY` | **Sí** (Zod) | — | API key de Resend |
| `MAIL_DOMAIN` | No | `example.com` | Dominio remitente; `resend.dev` activa modo sandbox |
| `GOOGLE_CLIENT_ID` | **Sí** (Zod) | — | OAuth |
| `GOOGLE_CLIENT_SECRET` | **Sí** (Zod) | — | OAuth |
| `GOOGLE_CALLBACK_URL` | **Sí** (Zod) | — | Ej. `http://localhost:3006/auth/google/callback` |
| `GEMINI_API_KEY` | Recomendada | — | Proveedor IA primario |
| `GROQ_API_KEY` | Opcional | — | Proveedor IA de respaldo |
| `REMINDER_CRON` | No | `0 9 * * *` | ⚠️ Definida en config pero **no usada**: el cron está fijo en `EVERY_HOUR` |
| `REMINDER_THRESHOLD_DAYS` | No | `30` | ⚠️ Definida en config pero **no usada**: el umbral está fijo en 30 días |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | No | — | Reservadas; sin uso actual |

> La plantilla archivada (`openspec/.../env-examples/backend.env.example.txt`) usa `FOLLOW_UP_THRESHOLD`, pero el código lee `REMINDER_THRESHOLD_DAYS`. Unificar.

### Frontend — `frontend/.env.local`

| Variable | Default | Descripción |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3006` | URL del backend (la plantilla archivada dice `3001`: usar `3006`) |
| `NEXT_PUBLIC_FRONTEND_URL` | `http://localhost:3000` | URL pública del frontend |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | `metadataBase` para Open Graph |
| `NEXT_PUBLIC_CONTACT_SALES` | `+15555550100` | WhatsApp de ventas (E.164) |
| `NEXT_PUBLIC_CONTACT_SUPPORT` | `+15555550199` | WhatsApp de soporte (E.164) |

> Todo lo que empieza con `NEXT_PUBLIC_` se incrusta en el bundle del navegador. **Nunca** poner secretos ahí.

---

## 4. Scripts

### Backend

| Script | Acción |
|--------|--------|
| `npm run start:dev` | Desarrollo con watch |
| `npm run start:debug` | Debug + watch |
| `npm run build` | Compila a `dist/` |
| `npm run start:prod` | Ejecuta `dist/main` |
| `npm run start:migrate` | `prisma migrate deploy` + arranque (para despliegue) |
| `npm test` / `test:watch` / `test:cov` | Jest |
| `npm run test:e2e` | Jest e2e (`test/jest-e2e.json` — aún no versionado) |
| `npm run lint` / `format` | ESLint / Prettier |
| `npx tsc --noEmit` | Chequeo de tipos |
| `npx prisma studio` | Explorador visual de la BD |

### Frontend

| Script | Acción |
|--------|--------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` / `start` | Build y servidor de producción |
| `npm run lint` | ESLint (`eslint-config-next`) |

---

## 5. Testing

| Capa | Estado |
|------|--------|
| Backend unit | 2 suites, 5 tests: `ai/ai.service.spec.ts`, `config/configuration.spec.ts`. **1 test falla**: `configuration.spec.ts › (a)` no define `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`, que se volvieron obligatorios en el schema después de escribir el test |
| Backend integración / e2e | Herramientas instaladas (`@nestjs/testing`, `supertest`), sin suites |
| Frontend | Sin runner configurado |

**Prioridades de cobertura recomendadas**

1. `ScoringService` — fórmulas, redondeo, límites exactos de la escala de madurez (3.99 / 4.0 / 9.99 / 10) y las 4 reglas cruzadas. Son funciones puras: tests baratos y de altísimo valor.
2. Tests e2e de autorización (ver [SECURITY.md](SECURITY.md)).
3. `frontend/src/domain/` (findings, radar) — TypeScript puro; agregar **Vitest** sin necesidad de DOM.

---

## 6. Metodología

### 6.1 Spec-Driven Development (SDD) con OpenSpec

Los cambios sustanciales siguen un flujo de especificación antes de código:

```
explore → proposal → specs ─┐
                            ├─▶ tasks → apply → verify → archive
                   design ──┘
```

- **Configuración**: `openspec/config.yaml` (contexto del stack, reglas por fase, capacidades de testing; `strict_tdd: false`).
- **Specs vigentes**: `openspec/specs/` (`backend-config`, `frontend-config`).
- **Cambios archivados** en `openspec/changes/archive/`:

| Fecha | Cambio | Resultado |
|-------|--------|-----------|
| 2026-04-17 | `config-normalization` | Config tipada con Zod, sin `process.env` disperso |
| 2026-04-17 | `api-client-split` | Cliente HTTP dividido por recurso (`lib/api/*`) |
| 2026-04-17 | `frontend-domain-layer` | Capa `domain/` pura (findings, radar, maturity) |
| 2026-04-18 | `backend-use-cases` | Extracción de use cases desde servicios gordos |
| 2026-04-18 | `shared-types` | Tipos de respuesta endurecidos, sin `any` implícito |

- **En curso**: `openspec/changes/modularization/` (exploración de modularización completa).

Reglas por fase (de `config.yaml`): specs en formato *Given/When/Then* con palabras RFC 2119; diseños con diagramas de secuencia y decisiones justificadas; tareas agrupadas por fase con numeración jerárquica; propuestas con plan de rollback.

### 6.2 Documentación de producto

Durante el desarrollo, las especificaciones de producto (modelo conceptual, banco de preguntas, lógica de cálculo, UX/UI y diseño del prompt IA) se mantuvieron en una carpeta aparte redactada con el dueño del producto. Esa carpeta **se excluyó de esta versión pública** por ser propiedad del cliente. Su contenido técnico relevante está resumido en [DOMAIN.md](DOMAIN.md) y [UX-UI.md](UX-UI.md).

### 6.3 Git

- **Conventional Commits**: `feat:`, `fix:`, `refactor(scope):`, `docs(scope):`, `chore(scope):`.
- **Ramas**: `feature/<descripcion>` desde `main`; PR hacia `main`.

---

## 7. Convenciones de código

### Backend

- Un módulo NestJS por subdominio, archivos co-ubicados (`controller`, `service`, `module`, `dto/`, `use-cases/`).
- Un caso de uso = una clase `XxxUseCase` con un método `execute()`.
- Controllers sin lógica de negocio.
- Todo acceso a datos vía Prisma; **sin SQL crudo**.
- Configuración solo vía `ConfigService<AppConfig, true>` con `{ infer: true }`.
- Efectos secundarios (email) vía eventos, no llamadas directas.
- Comentarios de sección con banners `// ─── TITLE ───`.

### Frontend

- Componentes cliente (`'use client'`) organizados por feature.
- **Lógica de dominio en `src/domain/`**, sin imports de React.
- Llamadas HTTP solo a través de `lib/api/<recurso>.ts` (nunca Axios directo en componentes).
- Colores y sombras **solo con tokens CSS** (`var(--gold)`, `var(--critico-fg)`); no hardcodear `rgba()`.
- Alias de imports `@/` → `src/`.
- Textos visibles en español neutro.

---

## 8. Despliegue

No hay configuración de hosting versionada (sin `Dockerfile`, `vercel.json` ni CI). Esquema esperado:

| Pieza | Destino típico | Notas |
|-------|----------------|-------|
| Frontend | Vercel u otro host de Next.js | Definir `NEXT_PUBLIC_*` en build |
| Backend | Contenedor Node (Render, Railway, Fly, etc.) | `npm run build` → `npm run start:migrate`; escucha en `0.0.0.0:$PORT` |
| Base de datos | Supabase Postgres | `DATABASE_URL` (pooler) + `DIRECT_URL` (directa) |

Checklist previo a producción: resolver la **Fase 1** de [SECURITY.md](SECURITY.md), configurar el dominio verificado en Resend, y registrar el callback OAuth de producción en Google Cloud.
