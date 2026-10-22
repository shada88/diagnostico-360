# Conectores y Servicios Externos

| Servicio | Propósito | SDK / Protocolo | Requerido | Variables |
|----------|-----------|-----------------|-----------|-----------|
| **PostgreSQL** (Docker local / Supabase prod) | Persistencia | Prisma 5 | ✅ | `DATABASE_URL`, `DIRECT_URL` |
| **Google Gemini** | Análisis IA (primario) | `@google/genai` | ⚠️ recomendado | `GEMINI_API_KEY` |
| **Groq** | Análisis IA (fallback) | `groq-sdk` | Opcional | `GROQ_API_KEY` |
| **Resend** | Email transaccional | `resend` | ✅ (validado por Zod) | `RESEND_API_KEY`, `MAIL_DOMAIN` |
| **Google OAuth 2.0** | Login social | `passport-google-oauth20` | ✅ (validado por Zod) | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` |
| **WhatsApp (wa.me)** | CTA a ventas/soporte | Deep link | — | `NEXT_PUBLIC_CONTACT_SALES`, `NEXT_PUBLIC_CONTACT_SUPPORT` |
| **Google Fonts** | Tipografías | `next/font/google` (self-hosted en build) | — | — |

---

## 1. Inteligencia Artificial

**Archivo**: `backend/src/ai/ai.service.ts` — punto único de acceso a LLMs.

```
generate(prompt, expectJson)
   │
   ├─ Gemini configurado? ── sí ─▶ gemini-2.5-flash
   │                               responseMimeType: application/json
   │                               reintentos: 3 intentos, backoff 1s → 2s
   │                               └─ falla ─┐
   │                                         ▼
   ├─ Groq configurado? ──── sí ─▶ llama-3.3-70b-versatile
   │                               response_format: json_object
   │                               temperature 0.3 · max 4096 tokens
   │                               └─ falla ─▶ throw
   │
   └─ ninguno ─▶ 'AI Service not configured.'  (→ parse falla → fallback tipado)
```

**Consumidores**

| Caso de uso | Cuándo | Persistencia |
|-------------|--------|--------------|
| `AiAnalysisService.analyze` | Al finalizar un diagnóstico | `AiEvaluation.content` (JSON) |
| `GetOrGenerateEvolutionUseCase` | Primera consulta de un par (actual, anterior) | `EvolutionAnalysis.content` (JSON) |

**Robustez del parseo**: se limpian fences ```` ```json ````, se intenta `JSON.parse`, y si falla se extrae el primer bloque `{…}` con regex. Si todo falla se devuelve un **objeto fallback** con la misma forma, para que la UI nunca rompa.

**Datos enviados al proveedor**: nombre del emprendedor, nombre del negocio, 10 puntajes de área, 3 de dimensión, IG, modo analítico y títulos de alertas. **No** se envían email, teléfono ni respuestas individuales.

**Prompts**: viven inline en los servicios. Las reglas de redacción están en [DOMAIN.md](DOMAIN.md#6-reglas-de-redacción-del-dominio).

---

## 2. Email — Resend

**Archivo**: `backend/src/common/mail.service.ts`. Patrón **event-driven**: los casos de uso emiten eventos con `EventEmitter2` y el `MailService` los escucha con `@OnEvent`.

| Evento | Emisor | Email |
|--------|--------|-------|
| `user.registered` | `RegisterUseCase` | Código de verificación de 6 dígitos |
| `password.reset` | `ForgotPasswordUseCase` | Código de recuperación |
| `survey.completed` | `ResponsesService.finalize` | Link a `/personal/resultados/:id` |
| `diagnosis.reminder` | `ReminderCronService` | Recordatorio a 30 días, plantilla HTML con branding negro/dorado |

- **Remitente**: `Acme Consultores <noreply@${MAIL_DOMAIN}>`. Si `MAIL_DOMAIN=resend.dev` usa `onboarding@resend.dev` (modo sandbox de Resend: solo envía al email dueño de la cuenta).
- **Tolerancia a fallos**: errores de envío se loguean y no interrumpen el flujo.

---

## 3. Google OAuth 2.0

**Archivos**: `identity/auth/google.strategy.ts`, `use-cases/google-login-or-register.use-case.ts`.

1. `GET /auth/google` → Passport redirige a Google (scopes `email`, `profile`).
2. Google → `GET /auth/google/callback` → la estrategia arma `{ email, name, picture }`.
3. Si el email no existe se crea el usuario con contraseña aleatoria hasheada, `isEmailVerified = true` y rol `USER`.
4. Se emite JWT y se redirige a `${FRONTEND_URL}/auth/google/callback?token=…&profileComplete=…`.
5. `frontend/src/app/auth/google/callback/page.tsx` guarda el token en `localStorage` y redirige a perfil o diagnóstico.

**Configuración en Google Cloud Console**: el *Authorized redirect URI* debe coincidir exactamente con `GOOGLE_CALLBACK_URL` (ej. `http://localhost:3006/auth/google/callback`).

---

## 4. Base de datos

- **Local**: `backend/docker-compose.yml` → `postgres:15-alpine`, contenedor `diag360-db`, puerto host **5436**, BD `diagnostico360`, volumen `diag360_db_data`.
- **Producción**: Postgres gestionado (Supabase). `DATABASE_URL` = conexión con pooler; `DIRECT_URL` = conexión directa para migraciones.
- **Despliegue**: `npm run start:migrate` aplica `prisma migrate deploy` y arranca `dist/main`.
- Las variables `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` están en el schema de config como opcionales pero **no se usan** en el código actual.

---

## 5. WhatsApp

`frontend/src/lib/config/contact.ts` define dos canales:

| Canal | Uso | Default |
|-------|-----|---------|
| `sales` | CTA de mentoría en `Module6Action` (deep link `https://wa.me/<número>?text=…`) | +1 555 555 0100 |
| `support` | Soporte técnico en `GlobalHeader` | +1 555 555 0199 |

---

## 6. Integraciones especificadas pero no implementadas

Contempladas en la especificación funcional original:

- **Exportación PDF** del reporte (jsPDF o Puppeteer).
- **Webhook CRM** (HubSpot / ActiveCampaign) con nombre, email y puntaje global.
- **Adjuntar PDF** al email de resultados.
