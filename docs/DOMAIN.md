# Dominio y Lenguaje Ubicuo

Este documento describe **qué** resuelve el sistema y **con qué palabras** lo hace. Es la referencia obligatoria antes de tocar cualquier lógica de cálculo, prompt de IA o texto de interfaz.

Fuentes de verdad: `backend/prisma/schema.prisma`, `backend/src/diagnostic/evaluations/`.

---

## 1. Problema que resuelve

Los emprendedores suelen diagnosticar su negocio solo por métricas financieras. El modelo de Acme Consultores parte de una premisa distinta:

> **Un negocio sólido se construye sobre un emprendedor en equilibrio.**

El sistema revela **desbalances, bloqueos y oportunidades** entre la vida interna del emprendedor, la estructura de su negocio y su capacidad de crecer. Busca producir tres efectos: **Visibilidad** (ver su situación real), **Conciencia** (identificar lo que frena) y **Dirección** (saber por dónde empezar).

---

## 2. Modelo 3D: Dimensiones y Áreas

Tres dimensiones interdependientes, diez áreas (subdimensiones), tres afirmaciones por área = **30 preguntas**.

| Dimensión | Código | Enum | Rol | Áreas (enum `SubdimensionType`) |
|-----------|--------|------|-----|------|
| **Área Interna** | D1 | `INTERNAL` | Fundamento — *quién eres* | `SPIRITUAL` Espiritual · `PERSONAL` Personal · `RELATIONAL` Relacional |
| **Área del Negocio** | D2 | `BUSINESS` | Estructura — *cómo operas* | `PURPOSE` Propósito y Visión · `FINANCIAL` Financiera · `SALES` Ventas · `OPERATIONS` Operación · `MARKETING` Marketing |
| **Área de Crecimiento** | D3 | `GROWTH` | Expansión — *hasta dónde puedes llegar* | `LEADERSHIP` Liderazgo y Equipo · `PLANNING` Planificación y Crecimiento |

**Relación sistémica**: lo interno impacta el negocio → el negocio determina el crecimiento → el crecimiento expone los límites internos.

Las 30 afirmaciones de ejemplo están en `backend/prisma/seed.ts`.

---

## 3. Lenguaje ubicuo (glosario)

| Término de negocio | Término en código | Definición |
|--------------------|-------------------|------------|
| Diagnóstico / Intento | `SurveyAttempt` | Una ejecución del cuestionario por un usuario. Estados: `IN_PROGRESS`, `COMPLETED`. Soporta *soft delete* (`deletedAt`). |
| Encuesta | `Survey` → `Section` → `Question` | Plantilla del cuestionario. Una sección por dimensión. |
| Respuesta | `Answer` | Valor entero 1–10 para una pregunta dentro de un intento (único por `attemptId + questionId`). |
| Área / Subdimensión | `SubdimensionType` | Una de las 10 áreas evaluadas. |
| Dimensión | `DimensionType` | D1, D2 o D3. |
| Índice Global (IG) | `scoreIG` | Promedio de D1, D2 y D3. |
| Nivel de Madurez | `MaturityLevel` | Clasificación cualitativa de un puntaje. |
| Alerta cruzada / Inferencia | `alertGlassCeiling`, … / `CrossAlert` | Patrón detectado al combinar dos puntajes. |
| Modo analítico | `AnalyticalMode` | Tono que adopta la IA según el IG. |
| Fortalezas | `strengths` | Top 3 áreas con mayor puntaje. |
| Cuellos de botella | `bottlenecks` | Bottom 3 áreas con menor puntaje. |
| Hallazgo | `Finding` (frontend) | Tarjeta interpretativa generada por el motor de hallazgos. |
| Brecha / "Prioridad de foco" | `Brecha` (frontend) | Desbalance entre dimensiones. En UI se evita la palabra "brecha". |
| Informe IA | `AiEvaluation` / `AiAnalysisDTO` | Narrativa estratégica generada por LLM, persistida como JSON. |
| Evolución | `EvolutionAnalysis` | Comparación IA entre dos diagnósticos, cacheada por par de intentos. |

---

## 4. Motor de cálculo

Implementado en `backend/src/diagnostic/evaluations/scoring.service.ts`. Todos los promedios se redondean a **2 decimales**.

```
Área_i      = promedio(3 respuestas del área i)                    // 10 áreas
D1          = promedio(Espiritual, Personal, Relacional)
D2          = promedio(Propósito, Financiera, Ventas, Operación, Marketing)
D3          = promedio(Liderazgo, Planificación)
IG          = promedio(D1, D2, D3)
```

> **Nota de diseño**: el IG es un promedio de dimensiones, **no** de las 30 respuestas. Cada dimensión pesa 1/3 aunque D2 tenga 5 áreas y D3 solo 2. Es intencional: el modelo valora por igual persona, negocio y crecimiento.

### 4.1 Escala de Madurez

| Rango | Nivel | Enum | Significado | Color base |
|-------|-------|------|-------------|------------|
| 1.0 – 3.9 | 1 · Crítico | `CRITICO` | Alerta roja. Intervención inmediata. | `#8B1A1A` |
| 4.0 – 5.9 | 2 · Riesgo | `RIESGO` | Área inestable. Plan correctivo a corto plazo. | `#C65D00` |
| 6.0 – 7.9 | 3 · Estable | `ESTABLE` | Funciona, pero estancada. Zona de confort peligrosa. | `#8B7500` |
| 8.0 – 9.9 | 4 · Competente | `COMPETENTE` | Base sólida para escalar. | `#B8860B` |
| 10.0 | 5 · Excelente | `EXCELENTE` | Fortaleza clave. Modelo a replicar. | `#FFD700` |

Se clasifican D1, D2, D3 e IG (persistido) y cada área (calculado al armar el dashboard).

### 4.2 Motor de Inferencia Cruzada (4 reglas)

| # | Nombre | Condición | Severidad | Campo persistido |
|---|--------|-----------|-----------|------------------|
| 1 | **El Techo de Cristal** | `D1 ≤ 5.0` **y** `D2 ≥ 7.0` | HIGH | `alertGlassCeiling` |
| 2 | **El Cubo Agujereado** | `Ventas ≥ 7.0` **y** `Financiera ≤ 5.0` | HIGH | `alertLeakyBucket` |
| 3 | **Riesgo de Colapso por Éxito** | `Marketing ≥ 7.0` **y** `Operación ≤ 5.0` | HIGH | `alertSuccessCollapse` |
| 4 | **Síndrome del Autoempleado** | `Operación ≥ 7.0` **y** `Liderazgo ≤ 5.0` | MEDIUM | `alertSelfEmployed` |

Los títulos y mensajes de cada alerta viven en `rule-based-insight.service.ts`.

### 4.3 Modo analítico (tono de la IA)

| IG | Modo | Tono |
|----|------|------|
| < 4 | `CRISIS` | Urgente y confrontativo |
| 4 – 5.9 | `INTERVENTION` | Directo y correctivo |
| 6 – 7.9 | `MAINTENANCE` | Retador: sacar de la zona de confort |
| ≥ 8 | `GROWTH` | Celebratorio pero expansivo |

---

## 5. Capa de interpretación en el frontend

El frontend tiene un **dominio puro** (`frontend/src/domain/`) sin dependencias de React, que agrega interpretación determinística sobre el `DashboardDTO`.

### 5.1 Motor de hallazgos (`domain/findings/`)

Pipeline de detectores (*Chain of Responsibility*) que producen máximo un `Finding` cada uno, evitando reutilizar áreas (`usedKeys`):

| Detector | Categoría | Disparador |
|----------|-----------|------------|
| `detectCriticalRisk` | `critical-risk` | Alerta HIGH activa o área `CRITICO` |
| `detectAttentionPoint` | `attention-point` | Alerta MEDIUM activa o área `RIESGO` |
| `detectImprovementArea` | `improvement-area` | Área `ESTABLE` (compara contra la mejor) |
| `detectStrategicStrength` | `strategic-strength` | Áreas `COMPETENTE`/`EXCELENTE` o perfil balanceado |

Luego: `deduplicateFindings` → `enrichFindingWithAI` (reemplaza textos con la narrativa IA cuando existe).

### 5.2 Detector de brechas dimensionales (`domain/radar/`)

Umbrales (`GAP_THRESHOLDS`): `HIGH = 7.0`, `LOW = 6.0`, `EXCELLENT = 8.0`, `GAP = 2.5`.

| Id | Escenario | Condición |
|----|-----------|-----------|
| 1 | Interna vs. Negocio | D2 ≥ 7 y D1 ≤ 6 |
| 2 | Negocio vs. Crecimiento | D2 ≥ 7 y D3 ≤ 6 |
| 3 | Interna vs. Crecimiento | D3 ≥ 7 y D1 ≤ 6 |
| 4 | Desequilibrio Integral | Ninguna anterior y (máx − mín) ≥ 2.5 |
| 5 | Estancamiento General | D1, D2 y D3 ≤ 6 |
| 6 | Excelencia Parcial | ≥ 1 dimensión ≥ 8 y ≥ 2 dimensiones < 7 (sin escenarios 1–3) |
| 7 | Sinergia Potencial | Ningún escenario detectado (perfil equilibrado) |

`gap-calculator.ts` calcula además la brecha entre el área más alta y la más baja (crítica si ≥ 2.5).

---

## 6. Reglas de redacción del dominio

Aplican a la UI y a los prompts de IA (`ai-analysis.service.ts`):

- **Español neutro** con "tú" (sin voseo) en todo texto que ve el cliente final.
- **Sin números en la narrativa IA**: los puntajes se ven en gráficos; la IA cuenta causa → efecto.
- **No sustituir al coach** ni mencionar procesos de pago.
- **Honestidad como principio**: la herramienta comunica que la calidad del diagnóstico depende de la sinceridad del usuario.
- Mencionar el nombre del emprendedor **una sola vez** (al inicio del resumen ejecutivo).

---

## 7. Deuda de dominio conocida

- El campo `SurveyAttempt.status` es `String` libre, no un enum de Prisma.
- La especificación funcional original contemplaba un flag `internal_alert` (D1 ≤ 4.0), exportación PDF y webhook CRM que **no están implementados**.
