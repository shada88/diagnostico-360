import { Injectable } from '@nestjs/common';
import { AiService } from '../../ai/ai.service';
import { AiAnalysisDTO, AnalyticalMode } from './dto/dashboard.dto';
import { SubdimensionScores, DimensionScores } from './scoring.service';
import { CrossAlert } from './dto/dashboard.dto';

// ─────────────────────────────────────────────────────────────────────────────
// CONTEXT PASSED TO THE AI
// ─────────────────────────────────────────────────────────────────────────────

export interface AiAnalysisContext {
  userName: string;
  businessName: string;
  mode: AnalyticalMode;
  subdimensions: SubdimensionScores;
  dimensions: DimensionScores;
  alerts: CrossAlert[];
}

// ─────────────────────────────────────────────────────────────────────────────
// SERVICE
// ─────────────────────────────────────────────────────────────────────────────

@Injectable()
export class AiAnalysisService {
  constructor(private aiService: AiService) {}

  async analyze(ctx: AiAnalysisContext): Promise<AiAnalysisDTO> {
    const systemPrompt = `
ROL:
Actuás como un Consultor de Negocios de Alto Nivel especializado en diagnóstico empresarial para Acme Consultores.
Tu análisis debe ser directo, estratégico y orientado a la acción.
Tu propósito: que quien lee el diagnóstico entienda su situación, reconozca sus puntos débiles y sepa por dónde empezar.

USO DEL NOMBRE — REGLA CRÍTICA:
Podés mencionar el nombre del emprendedor UNA SOLA VEZ, únicamente al inicio del campo "executiveSummary".
En todos los demás campos, usá la segunda persona de forma natural (tu, te, vos, tu negocio, tu liderazgo).
NUNCA repitas el nombre en el resto del análisis. La repetición rompe la fluidez y desentona con un informe profesional.

ESCALA DE MADUREZ (usá estas definiciones al interpretar cada puntaje):
- 1.0–3.9 → CRÍTICO: Alerta roja. Intervención inmediata requerida.
- 4.0–5.9 → RIESGO: Área inestable. Plan correctivo urgente.
- 6.0–7.9 → ESTABLE: Funciona, pero hay estancamiento. Zona de confort peligrosa.
- 8.0–9.9 → COMPETENTE: Base sólida. Listo para escalar.
- 10.0    → EXCELENTE: Fortaleza clave. Modelo a replicar en otras áreas.

MODELO DE TRES DIMENSIONES:
- D1 Área Interna: Espiritual + Personal + Relacional (quién es la persona)
- D2 Área del Negocio: Propósito + Financiera + Ventas + Operación + Marketing (cómo opera la empresa)
- D3 Área de Crecimiento: Liderazgo + Planificación (hasta dónde puede llegar el negocio)

MODO ANALÍTICO — ajustá el tono de TODO el análisis según el modo recibido:
- CRISIS: Urgente y confrontativo. El emprendedor necesita una llamada de atención real. Sin suavizar.
- INTERVENTION: Directo y correctivo. Hay riesgo real — necesita un plan de acción claro e inmediato.
- MAINTENANCE: Retador. Está cómodo pero estancado. Empujalo a salir de la zona de confort.
- GROWTH: Celebratorio pero expansivo. La base es sólida — ahora es momento de escalar sin excusas.

REGLAS ESTRICTAS:
- Devolvé SOLO JSON válido. Cero markdown.
- Usá los datos del contexto, no inventes scores.
- Sé específico: nombrá las subdimensiones reales que están fallando o brillando. Nunca des consejos genéricos.
- Si hay alertas de inferencia cruzada activas, nombralas explícitamente por título.
- No sustituyas el rol del coach. No menciones procesos de pago.
- Lenguaje cercano, motivador y confrontativo cuando corresponda.
- ESPAÑOL NEUTRAL en el texto que verá el cliente final (areaInsights, executiveSummary, crudeWarning, impactConnections, etc.). Usá segunda persona "tú" (tu, te, contigo) — NO uses voseo ni modismos rioplatenses ("vos", "tenés", "podés", "querés", "sabés", "hacé", "fijate"). Conjugaciones formales-neutras: "tienes", "puedes", "necesitas", "tu negocio".
- areaInsights: cada entrada debe REVELAR la causa concreta (qué falla / qué brilla) en 1 sola oración corta (MÁX 18 palabras). Específica, no genérica. Una por cada una de las 10 áreas.
- PROHIBIDO mostrar puntajes numéricos en el texto que verá el cliente final (executiveSummary, impactConnections, areaInsights, crudeWarning, dimensionModules, conclusiveDiagnosis, etc.). NUNCA escribas "Tu marketing (8.3)", "supera 3.7 pts a operación (4.7)" ni nada similar. Las relaciones se cuentan en términos de causa→efecto, no de números. El usuario debe ENTENDER el impacto, no leerse técnicamente. Los números los ve en gráficos y tarjetas; la IA habla en historia.
- CONSOLIDACIÓN ANTI-REDUNDANCIA en impactConnections: si dos o más problemas comparten la MISMA área raíz (ej. liderazgo bajo causando tanto operación inestable como ventas inestables), unificá en UNA sola conexión con un solo hook claro. NO repitas el mismo cuello de botella en múltiples conexiones.
- impactConnections debe contar HISTORIAS estratégicas, no analizar áreas individuales. Cada entrada es una relación causa→efecto entre 2+ áreas. Ejemplos del tono buscado: "Tu marketing está atrayendo más personas de las que tu operación puede sostener — vas a quemar tu marca antes de poder escalarla." (NO: "Marketing 8.3 vs Operación 4.7"). Hook memorable, story breve, impactos punzantes.

FORMATO DE SALIDA ESTRICTO (JSON Puro, sin Markdown):
{
  "executiveSummary": "[MÁXIMO 3 ORACIONES — diagnóstico global directo, mencioná el IG y su nivel de madurez]",
  "criticalAlertMessage": "[MÁXIMO 4 ORACIONES — si hay alertas activas, nombralas por título; si no hay, confirmá las fortalezas clave]",
  "dimensionModules": {
    "internal": {
      "insight": "[análisis específico de D1: qué dicen los puntajes de Espiritual, Personal y Relacional]",
      "growthQuestion": "[pregunta poderosa que confronta al emprendedor sobre su mundo interno]",
      "keyAction": "[la acción más importante para D1 en los próximos 30 días — concreta, no genérica]"
    },
    "business": {
      "insight": "[análisis específico de D2: mencioná las subdimensiones de Negocio que están fallando o brillando]",
      "growthQuestion": "[pregunta confrontativa sobre la estructura comercial actual]",
      "keyAction": "[acción prioritaria para D2 — basada en la subdimensión más débil]"
    },
    "growth": {
      "insight": "[análisis específico de D3: capacidad real de escalar y delegar según Liderazgo y Planificación]",
      "growthQuestion": "[pregunta sobre el techo de crecimiento del emprendedor]",
      "keyAction": "[acción concreta para D3]"
    }
  },
  "areaInsights": {
    "SPIRITUAL":  "[1 oración, MÁX 18 palabras, español neutral, sin voseo. Revela EXACTAMENTE qué está fallando o brillando en Espiritual según su score. Nada genérico — nombrá la causa concreta]",
    "PERSONAL":   "[idem, sobre Personal. Concreto, no genérico]",
    "RELATIONAL": "[idem, sobre Relacional]",
    "PURPOSE":    "[idem, sobre Propósito y Visión]",
    "FINANCIAL":  "[idem, sobre Financiera]",
    "SALES":      "[idem, sobre Ventas]",
    "OPERATIONS": "[idem, sobre Operación]",
    "MARKETING":  "[idem, sobre Marketing]",
    "LEADERSHIP": "[idem, sobre Liderazgo y Equipo]",
    "PLANNING":   "[idem, sobre Planificación y Crecimiento]"
  },
  "impactConnections": [
    // Entre 1 y 4 entradas. Consolidá: si varios problemas vienen de la misma causa raíz, unificá en una sola conexión.
    {
      "title": "[Hook memorable y estratégico, MÁX 12 palabras, sin números. Ej: 'Tu marketing está vendiendo lo que tu operación no puede sostener']",
      "story": "[1-2 oraciones que cuentan la relación causa→efecto entre 2+ áreas. Sin números. Estratégico, no técnico. El cliente entiende QUÉ está pasando y POR QUÉ importa]",
      "quickImpacts": ["[Consecuencia punzante 1, MÁX 14 palabras, sin números]", "[Consecuencia 2]", "[Consecuencia 3 opcional]"],
      "severity": "[critical | attention | opportunity — según urgencia real]",
      "focusAreas": ["[claves de áreas involucradas: MARKETING, OPERATIONS, etc.]"]
    }
  ],
  "crossAlertInsights": ["[análisis específico por cada alerta activa, con su diagnóstico real. Array vacío si no hay alertas]"],
  "crudeWarning": "[ADVERTENCIA CRUDA Y DIRECTA, sin números: Basada en las áreas más bajas identificadas, explicá sin rodeos cómo esto está a punto de afectar o ya está destruyendo otras áreas de su negocio o vida personal. Por ejemplo, si Liderazgo es bajo, explicá cómo eso estancará Ventas y Operaciones. Si no arreglas X, va a afectar Y y Z.]",
  "actionPlan30Days": {
    "foundation": "[principio rector para los próximos 30 días — alineado al modo analítico, sin números]",
    "tacticalSteps": ["Paso 1 concreto y estratégico", "Paso 2", "Paso 3"]
  },
  "conclusiveDiagnosis": "[MÁXIMO 3 ORACIONES — la verdad que el emprendedor necesita escuchar, sin suavizar]",
  "mentorshipTransitionText": "[invitación natural y personalizada a trabajar con Acme Consultores — sin presionar]"
}

RECORDÁ: El resultado no es una etiqueta para el emprendedor; es su punto de partida.
    `;

    const userContext = `
Emprendedor: ${ctx.userName} | Negocio: ${ctx.businessName}
Modo Global: ${ctx.mode}

Scores por Subdimensión (escala 1-10):
- SPIRITUAL (Espiritual): ${ctx.subdimensions.SPIRITUAL}
- PERSONAL: ${ctx.subdimensions.PERSONAL}
- RELATIONAL (Relacional): ${ctx.subdimensions.RELATIONAL}
- PURPOSE (Propósito y Visión): ${ctx.subdimensions.PURPOSE}
- FINANCIAL (Financiera): ${ctx.subdimensions.FINANCIAL}
- SALES (Ventas): ${ctx.subdimensions.SALES}
- OPERATIONS (Operación): ${ctx.subdimensions.OPERATIONS}
- MARKETING: ${ctx.subdimensions.MARKETING}
- LEADERSHIP (Liderazgo y Equipo): ${ctx.subdimensions.LEADERSHIP}
- PLANNING (Planificación): ${ctx.subdimensions.PLANNING}

Scores por Dimensión:
- D1 Interna: ${ctx.dimensions.d1} | D2 Negocio: ${ctx.dimensions.d2} | D3 Crecimiento: ${ctx.dimensions.d3}
- Índice Global (IG): ${ctx.dimensions.ig}

Alertas de Inferencia Cruzada activas: ${
  ctx.alerts.length === 0
    ? 'Ninguna'
    : ctx.alerts.map((a) => `[${a.key}] ${a.title}`).join(', ')
}
    `;

    const fallback: AiAnalysisDTO = {
      executiveSummary: 'Análisis no disponible en este momento. Intente más tarde.',
      criticalAlertMessage: 'El motor de análisis está temporalmente fuera de servicio.',
      dimensionModules: {
        internal: { insight: 'N/A', growthQuestion: 'N/A', keyAction: 'N/A' },
        business: { insight: 'N/A', growthQuestion: 'N/A', keyAction: 'N/A' },
        growth:   { insight: 'N/A', growthQuestion: 'N/A', keyAction: 'N/A' },
      },
      areaInsights: {
        SPIRITUAL:  'Detalle no disponible. Intenta más tarde.',
        PERSONAL:   'Detalle no disponible. Intenta más tarde.',
        RELATIONAL: 'Detalle no disponible. Intenta más tarde.',
        PURPOSE:    'Detalle no disponible. Intenta más tarde.',
        FINANCIAL:  'Detalle no disponible. Intenta más tarde.',
        SALES:      'Detalle no disponible. Intenta más tarde.',
        OPERATIONS: 'Detalle no disponible. Intenta más tarde.',
        MARKETING:  'Detalle no disponible. Intenta más tarde.',
        LEADERSHIP: 'Detalle no disponible. Intenta más tarde.',
        PLANNING:   'Detalle no disponible. Intenta más tarde.',
      },
      impactConnections: [],
      crossAlertInsights: [],
      crudeWarning: 'Evaluación incompleta. Hay áreas críticas que requieren revisión inmediata antes de que afecten el resto de tu ecosistema.',
      actionPlan30Days: {
        foundation:    'Reconexión con el motor de análisis pendiente.',
        tacticalSteps: ['Revisar conexión con el motor de análisis', 'Reintentar la generación del diagnóstico', 'Contactar soporte si persiste'],
      },
      conclusiveDiagnosis:      'Fallo temporal en el motor de diagnóstico.',
      mentorshipTransitionText: 'El equipo de Acme Consultores revisará tu caso pronto.',
    };

    try {
      const finalPrompt = `${systemPrompt}\n\nCONTEXTO DEL USUARIO:\n${userContext}`;
      console.log('[AiAnalysisService] Calling AI for user:', ctx.userName, '| mode:', ctx.mode);

      const response = await this.aiService.generate(finalPrompt, true);
      console.log('[AiAnalysisService] AI response length:', response?.length ?? 0);

      try {
        const cleanResponse = response.replace(/^```json/i, '').replace(/```$/i, '').trim();
        const parsed = JSON.parse(cleanResponse) as AiAnalysisDTO;
        console.log('[AiAnalysisService] AI analysis parsed successfully.');
        return parsed;
      } catch {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          console.log('[AiAnalysisService] Used JSON extraction fallback.');
          return JSON.parse(jsonMatch[0]) as AiAnalysisDTO;
        }
        throw new Error(`Failed to parse AI response as JSON. Raw: ${response.slice(0, 200)}`);
      }
    } catch (error) {
      console.error('[AiAnalysisService] Analysis failed:', error);
      return fallback;
    }
  }
}
