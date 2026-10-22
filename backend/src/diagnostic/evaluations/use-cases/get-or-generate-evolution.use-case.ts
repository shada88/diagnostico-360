import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';
import { AiService } from '../../../ai/ai.service';
import { DashboardDTO } from '../dto/dashboard.dto';

export interface EvolutionAnalysisDTO {
  overallVerdict: 'PROGRESO' | 'ESTANCAMIENTO' | 'RETROCESO' | 'MIXTO';
  executiveSummary: string;
  dimensionAnalysis: {
    internal: { trend: string; insight: string; recommendation: string };
    business: { trend: string; insight: string; recommendation: string };
    growth:   { trend: string; insight: string; recommendation: string };
  };
  criticalPatterns: string[];
  topGains:    Array<{ area: string; delta: number; insight: string }>;
  topDeclines: Array<{ area: string; delta: number; insight: string }>;
  strategicRecommendation: string;
}

@Injectable()
export class GetOrGenerateEvolutionUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async execute(
    currentId: string,
    previousId: string,
    currentData: DashboardDTO,
    previousData: DashboardDTO,
  ): Promise<EvolutionAnalysisDTO> {
    const cached = await this.prisma.evolutionAnalysis.findUnique({
      where: {
        currentAttemptId_previousAttemptId: {
          currentAttemptId: currentId,
          previousAttemptId: previousId,
        },
      },
    });

    if (cached) {
      try {
        return JSON.parse(cached.content) as EvolutionAnalysisDTO;
      } catch {
        // Corrupted cache — regenerate
      }
    }

    const analysis = await this.generate(currentData, previousData);

    await this.prisma.evolutionAnalysis.upsert({
      where: {
        currentAttemptId_previousAttemptId: {
          currentAttemptId: currentId,
          previousAttemptId: previousId,
        },
      },
      create: {
        currentAttemptId: currentId,
        previousAttemptId: previousId,
        content: JSON.stringify(analysis),
      },
      update: { content: JSON.stringify(analysis) },
    });

    return analysis;
  }

  private async generate(
    current: DashboardDTO,
    previous: DashboardDTO,
  ): Promise<EvolutionAnalysisDTO> {
    const subDeltas: Record<string, { current: number; previous: number; delta: number }> = {};
    for (const dim of current.dimensions) {
      for (const sub of dim.subdimensions) {
        const prevSub = previous.dimensions
          .flatMap(d => d.subdimensions)
          .find(s => s.key === sub.key);
        subDeltas[sub.label] = {
          current: sub.score,
          previous: prevSub?.score ?? sub.score,
          delta: sub.score - (prevSub?.score ?? sub.score),
        };
      }
    }

    const dimDeltas = current.dimensions.map(dim => {
      const prevDim = previous.dimensions.find(d => d.key === dim.key);
      return {
        key:      dim.key,
        label:    dim.label,
        current:  dim.score,
        previous: prevDim?.score ?? dim.score,
        delta:    dim.score - (prevDim?.score ?? dim.score),
      };
    });

    const globalDelta = current.global.score - previous.global.score;

    const systemPrompt = `
ROL:
Eres un Analista de Evolución Empresarial de Acme Consultores.
Tu trabajo: analizar la EVOLUCIÓN de un emprendedor entre dos diagnósticos separados en el tiempo.
No repites el diagnóstico individual — analizas TENDENCIAS, PATRONES y PROGRESO.

REGLAS:
- Devuelve SOLO JSON válido. Cero markdown.
- Sé específico: nombra las subdimensiones reales con sus deltas.
- Identifica patrones: estancamiento (delta < 0.3), progreso (delta > 0.5), retroceso (delta < -0.3).
- El veredicto general debe ser honesto: PROGRESO, ESTANCAMIENTO, RETROCESO, o MIXTO.
- Lenguaje cercano, motivador y estratégico.
- En español neutro (sin voseo ni regionalismos).

FORMATO DE SALIDA ESTRICTO (JSON Puro):
{
  "overallVerdict": "PROGRESO | ESTANCAMIENTO | RETROCESO | MIXTO",
  "executiveSummary": "[MÁXIMO 3 ORACIONES — resumen del progreso global con datos concretos]",
  "dimensionAnalysis": {
    "internal": {
      "trend": "↑ Progreso | → Estable | ↓ Retroceso",
      "insight": "[qué cambió en D1 y por qué importa — con subdimensiones específicas]",
      "recommendation": "[acción concreta para D1 basada en la evolución]"
    },
    "business": {
      "trend": "↑ | → | ↓",
      "insight": "[análisis de D2]",
      "recommendation": "[acción concreta]"
    },
    "growth": {
      "trend": "↑ | → | ↓",
      "insight": "[análisis de D3]",
      "recommendation": "[acción concreta]"
    }
  },
  "criticalPatterns": ["[patrones detectados: estancamiento crónico, retroceso en área X, rebote, etc.]"],
  "topGains": [{"area": "nombre", "delta": 0.0, "insight": "por qué mejoró"}],
  "topDeclines": [{"area": "nombre", "delta": 0.0, "insight": "por qué empeoró"}],
  "strategicRecommendation": "[MÁXIMO 3 ORACIONES — qué debe hacer el emprendedor AHORA basado en su evolución]"
}
    `;

    const userContext = `
Emprendedor: ${current.user.name} | Negocio: ${current.user.businessName}

ÍNDICE GLOBAL:
- Anterior: ${previous.global.score.toFixed(1)} (${previous.global.maturity.label}) → Actual: ${current.global.score.toFixed(1)} (${current.global.maturity.label})
- Delta: ${globalDelta >= 0 ? '+' : ''}${globalDelta.toFixed(1)}

DIMENSIONES:
${dimDeltas.map(d => `- ${d.label}: ${d.previous.toFixed(1)} → ${d.current.toFixed(1)} (${d.delta >= 0 ? '+' : ''}${d.delta.toFixed(1)})`).join('\n')}

SUBDIMENSIONES:
${Object.entries(subDeltas).map(([label, v]) =>
  `- ${label}: ${v.previous.toFixed(1)} → ${v.current.toFixed(1)} (${v.delta >= 0 ? '+' : ''}${v.delta.toFixed(1)})`
).join('\n')}
    `;

    const fallback: EvolutionAnalysisDTO = {
      overallVerdict: 'MIXTO',
      executiveSummary: 'El análisis de evolución no está disponible en este momento.',
      dimensionAnalysis: {
        internal: { trend: '→', insight: 'No disponible', recommendation: 'Reintentar más tarde' },
        business: { trend: '→', insight: 'No disponible', recommendation: 'Reintentar más tarde' },
        growth:   { trend: '→', insight: 'No disponible', recommendation: 'Reintentar más tarde' },
      },
      criticalPatterns: [],
      topGains: [],
      topDeclines: [],
      strategicRecommendation: 'El sistema de análisis está temporalmente fuera de servicio.',
    };

    try {
      const finalPrompt = `${systemPrompt}\n\nCONTEXTO:\n${userContext}`;
      console.log('[GetOrGenerateEvolutionUseCase] Generating evolution analysis for:', current.user.name);

      const response = await this.aiService.generate(finalPrompt, true);

      try {
        const clean = response.replace(/^```json/i, '').replace(/```$/i, '').trim();
        return JSON.parse(clean) as EvolutionAnalysisDTO;
      } catch {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]) as EvolutionAnalysisDTO;
        }
        throw new Error('Failed to parse AI evolution response');
      }
    } catch (error) {
      console.error('[GetOrGenerateEvolutionUseCase] Analysis failed:', error);
      return fallback;
    }
  }
}
