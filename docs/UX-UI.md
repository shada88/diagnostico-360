# UX/UI — Sistema de Diseño y Experiencia

Fuente: `frontend/src/app/globals.css`.

---

## 1. Concepto: "Consultoría de Élite"

La interfaz debe transmitir **autoridad, exclusividad y profundidad estratégica**. No usa colores planos: simula materiales físicos de alto nivel — **madera oscura, mármol negro y metal dorado pulido** — con luz, sombras y *glassmorphism* sutil.

Principios rectores:

1. **Mobile-first estricto** — la mayoría de los tests se hacen desde el celular.
2. **Modo enfoque** — una sola pregunta por pantalla, cero ruido visual.
3. **Valor percibido** — la pantalla de carga anticipa los resultados ("Procesando resultados…") en vez de mostrarlos de golpe.
4. **Lenguaje humano, no técnico** — "Brechas" en código, "Prioridades de foco" en pantalla; la IA no muestra números en su narrativa.
5. **Acordeones antes que tooltips** en móvil.

---

## 2. Design tokens

Definidos como CSS custom properties en `globals.css` y consumidos con Tailwind v4 (`bg-[var(--bg-space)]`) o desde `lib/config/tokens.ts`.

### 2.1 Paleta (modo oscuro, por defecto)

| Rol | Token | Valor |
|-----|-------|-------|
| Fondo (el espacio) | `--bg-space` / `--bg-surface` / `--bg-elevated` | `#070710` / `#0E0E1A` / `#13131F` |
| Acento de marca (el brillo) | `--gold` / `--gold-bright` / `--gold-dim` | `#C9A84C` / `#E8C665` / `#7A5F1A` |
| Glow | `--gold-glow` / `--gold-glow-soft` | dorado 35 % / 15 % |
| Texto | `--text-pearl` / `--text-soft` / `--text-muted` | `#F0EDE8` / `#B8B3C0` / `#6E6A7A` (nunca `#FFFFFF` puro) |
| Bordes ("metal pulido") | `--border` / `--border-hover` | dorado 18 % / 45 % |
| Vidrio | `--glass-bg` | `rgba(14,14,26,.75)` |
| Escala de opacidad dorada | `--gold-04` … `--gold-40` | reemplaza `rgba()` hardcodeados |

### 2.2 Colores semánticos de madurez

| Nivel | Fondo/badge (`--critico` …) | Texto/gráfico (`--critico-fg` …) |
|-------|-----------------------------|----------------------------------|
| Crítico | `#8B1A1A` | `#E05252` |
| Riesgo | `#C65D00` | `#D4853A` |
| Estable | `#8B7500` | `var(--gold)` |
| Competente | `#B8860B` | `#8CC98A` |
| Excelente | `#FFD700` | `#5BA87A` |
| Área de mejora (hallazgos) | — | `--mejora-fg` `#5B9BD5` |

Más tokens de alerta combinados (`--alert-critical-fg/bg/border`, `--alert-warning-*`, `--alert-success-*`, `--alert-mejora-*`).

### 2.3 Temas claro / oscuro

- **Oscuro** por defecto; **claro** (pergamino cálido `#F7F5F0`, texto `#1A1814`) vía `prefers-color-scheme` o elección manual.
- `ThemeProvider` (`lib/theme.tsx`) guarda la preferencia en `localStorage['app-theme']` y aplica `data-theme` en `<html>`.
- Un **script inline en `<head>`** aplica el tema antes de hidratar para evitar el *flash* de tema incorrecto.
- El dorado de marca no cambia entre temas.

### 2.4 Tipografía

| Uso | Fuente | Variable |
|-----|--------|----------|
| Display / títulos (`.font-display`) | **Playfair Display** (400–800, normal e itálica) | `--font-playfair` |
| Cuerpo, preguntas, botones | **Inter** | `--font-inter` |

Base de lectura móvil 14–16 px. Cargadas con `next/font/google` (`display: swap`, self-hosted).

---

## 3. Componentes clave

| Componente | Ubicación | Comportamiento |
|------------|-----------|----------------|
| `.btn-gold` | `globals.css` | CTA principal; gradiente metálico que recorre el botón en hover; animación `breathe` (respiración) |
| `.glass`, `.module-card` | `globals.css` | Tarjetas translúcidas con borde dorado de 1 px |
| `QuestionCard` | `features/survey/` | Escala 1–10 en círculos; el seleccionado se ilumina en dorado con glow |
| `SurveyWizard` | `features/survey/` | Intro animada, 1 pregunta por pantalla, autoavance, pantallas de sección completada, pantalla de análisis |
| `InteractiveRadar` | `dashboard/shared/` | Radar Recharts de 10 ejes con tooltip y panel de detalle por área |
| `ScoreCircle` | `dashboard/shared/` | Indicador circular del IG |
| `CollapsibleSection` | `dashboard/shared/` | Acordeón vertical (reemplaza tooltips en móvil) |
| `GlobalHeader` | `shared/` | Navegación entre vistas, histórico, "+ Nuevo diagnóstico", soporte, toggle de tema |
| `SearchableSelect` | `shared/ui/` | Selector de país/ciudad (`country-state-city`) |

---

## 4. Viaje del usuario

| Etapa | Ruta | Propósito emocional | Detalle |
|-------|------|---------------------|---------|
| **Gancho** | `/` | Despertar curiosidad | Hero con Playfair, las 3 dimensiones, "cómo funciona" (30 afirmaciones → mapa 360° → actuar), escala de madurez, efectos *Visibilidad · Conciencia · Dirección* |
| **Registro** | `/register`, `/login` | Baja fricción | Email + código o Google |
| **Perfil** | `/auth/profile` | Contexto | Nombre, negocio, país, ciudad, teléfono, zona horaria |
| **Enfoque** | `/personal/diagnostico` | Concentración y honestidad | Intro, 30 afirmaciones una a una, barra de progreso dorada, feedback por sección completada |
| **Expectativa** | (overlay) | Valor percibido | Animación "Procesando resultados y generando tu diagnóstico…" |
| **Revelación** | `/personal/resultados/[id]` | Visibilidad + conciencia | Dashboard en tres vistas |
| **Acción** | CTA final | Dirección | Invitación a mentoría vía WhatsApp |

### 4.1 Vistas del dashboard (`?view=`)

| Vista | Contenido |
|-------|-----------|
| `informe` (default) | `Module1Header` (IG, nivel de madurez, resumen ejecutivo) → `Module2Impact` (hallazgos, conexiones de impacto, advertencia cruda) → `Module3Strengths` (prioridades, fortalezas, **plan de 30 días**) → `Module6Action` (CTA mentoría) → `ModuleFeedback` |
| `areas-clave` | Radar interactivo + detalle de las 10 áreas con insight IA por área + sección educativa sobre la escala de madurez |
| `evolucion` | Comparación con un diagnóstico anterior (Recharts superpuesto) + análisis IA de evolución |

---

## 5. Motion design

- Curvas `ease-out` / `ease-in-out` (Framer Motion).
- Entrada de preguntas: `translateY(20px) → 0` + `opacity 0 → 1` en ~0.4 s.
- Autoavance tras seleccionar (~400 ms) con botón para retroceder.
- Animaciones con `transform`/`opacity` (aceleradas por GPU) para sostener 60 FPS.
- Keyframes propios: `breathe` (CTA), `urgent-glow` (alertas críticas).

---

## 6. Accesibilidad y brechas de UX conocidas

Implementado: contraste texto/fondo alineado al tema, `lang="es"`, fuentes legibles, tema claro.

Pendiente respecto de la especificación:

- **Persistencia local del progreso**: la spec pide retomar el cuestionario tras cerrar la pestaña. Hoy cada respuesta se guarda en el servidor, pero al recargar se **crea un intento nuevo** en lugar de retomar el existente.
- **Navegación por teclado** y atributos ARIA en la escala 1–10 (no se detectan `aria-*`/`role` en `features/survey`).
- **Vibración háptica** (`navigator.vibrate`) no implementada.
- **`prefers-reduced-motion`** no respetado.
