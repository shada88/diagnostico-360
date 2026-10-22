import type { CategoryMeta, FindingCategory } from './types';

export const CATEGORY_META: Record<FindingCategory, CategoryMeta> = {
  'critical-risk': {
    label:     'Riesgo Crítico',
    emoji:     '🔴',
    colorVar:  'critico-fg',
    bgOpacity: 'rgba(224, 82, 82, 0.08)',
  },
  'attention-point': {
    label:     'Punto Clave de Atención',
    emoji:     '🟠',
    colorVar:  'riesgo-fg',
    bgOpacity: 'rgba(212, 133, 58, 0.08)',
  },
  'improvement-area': {
    label:     'Área de Mejora',
    emoji:     '🔵',
    colorVar:  'mejora-fg',
    bgOpacity: 'rgba(91, 155, 213, 0.08)',
  },
  'strategic-strength': {
    label:     'Fortaleza Estratégica',
    emoji:     '🟢',
    colorVar:  'excelente-fg',
    bgOpacity: 'rgba(91, 168, 122, 0.08)',
  },
};

export const T = {
  alertFromAffirmation: (text: string) =>
    `Se ha indicado que "${text.toLowerCase()}" es un aspecto que presenta debilidad en el perfil actual.`,

  alertFallback:
    'Los datos del diagnóstico indican un área que requiere atención prioritaria.',

  criticalTitle: (label: string) =>
    `${label}: en zona de alerta roja`,

  criticalMeaning: (label: string, dimLabel: string) =>
    `Con un nivel crítico en ${label}, esta área representa una vulnerabilidad estructural` +
    ` que afecta la capacidad de sostener y escalar el negocio dentro de ${dimLabel}.` +
    ` No se trata de un área débil — es un riesgo activo.`,

  criticalInsight: (label: string) =>
    `Ignorar ${label.toLowerCase()} no lo hace desaparecer; lo convierte en un punto de quiebre.`,

  criticalImpact: (dimLabel: string) => [
    `El desempeño de ${dimLabel} se ve comprometido directamente`,
    'Se genera un efecto dominó en las demás áreas conectadas',
    'Se reduce significativamente la capacidad de respuesta ante desafíos',
  ],

  attentionTitle: (label: string) =>
    `${label} necesita atención inmediata`,

  attentionMeaning: (label: string) =>
    `El nivel en ${label} se encuentra en zona de riesgo.` +
    ` Aunque el negocio puede funcionar temporalmente, esta área está operando` +
    ` por debajo de lo necesario para sostener un crecimiento saludable.`,

  attentionInsight: (label: string) =>
    `No se debe esperar a que ${label.toLowerCase()} se convierta en una emergencia para actuar.`,

  attentionImpact: (dimLabel: string, label: string) => [
    `${dimLabel} pierde cohesión sin un desempeño sólido en ${label.toLowerCase()}`,
    'Se compromete la capacidad de tomar decisiones informadas',
    'Se generan ineficiencias que se acumulan de forma silenciosa',
  ],

  improvementTitle: (label: string) =>
    `${label}: funcional pero estancada`,

  improvementMeaningWithGap: (label: string, gap: string) =>
    `${label} se encuentra en un nivel estable — funciona, pero no está creciendo.` +
    ` Existe una brecha de ${gap} puntos respecto al área más fuerte,` +
    ` lo que indica un desequilibrio que puede frenar el avance.`,

  improvementMeaningNoGap: (label: string) =>
    `${label} se encuentra en un nivel estable — funciona, pero no está creciendo.` +
    ` Aunque no es urgente, mantener esta área en zona de confort limita el potencial total.`,

  improvementInsight:
    'La zona de confort es el lugar más peligroso para un emprendedor; es donde los negocios se estancan lentamente.',

  improvementImpact: [
    'Limita la capacidad de escalar sin crear cuellos de botella',
    'Genera una falsa sensación de seguridad al "funcionar bien"',
    'Deja potencial sin desarrollar que podría generar desequilibrio a futuro',
  ],

  strengthTitle: (label: string) =>
    `${label}: ventaja competitiva`,

  strengthMeaning: (label: string) =>
    `${label} es la fortaleza más destacada, y eso no es casualidad.` +
    ` Es el resultado de dedicación y enfoque.` +
    ` Esta área puede convertirse en la palanca que eleve las demás.`,

  strengthInsight:
    'Las fortalezas no se mantienen solas — se replican, se escalan y se convierten en cultura.',

  strengthImpact: [
    'Genera confianza y credibilidad en el ecosistema del negocio',
    'Sirve como modelo replicable para fortalecer áreas débiles',
    'Acelera resultados cuando se alinea con una estrategia clara',
  ],

  strengthAlertSignal: (label: string) =>
    `El desempeño en ${label.toLowerCase()} demuestra una capacidad comprobada.` +
    ` El desafío ahora es no dar esta fortaleza por sentada y usarla como motor de crecimiento.`,

  balancedTitle: 'Diagnóstico equilibrado: base sólida para escalar',

  balancedMeaning:
    'Los resultados muestran un perfil notablemente equilibrado.' +
    ' No hay áreas en crisis ni brechas significativas entre dimensiones.' +
    ' Esto indica madurez empresarial y personal.',

  balancedInsight:
    'El equilibrio no es la meta final — es la plataforma de lanzamiento para el siguiente nivel.',

  balancedImpact: [
    'Facilita la toma de decisiones estratégicas con confianza',
    'Permite enfocarse en escalar sin "apagar incendios"',
    'Posiciona al negocio para atraer oportunidades de mayor nivel',
  ],

  balancedAlertSignal:
    'El perfil demuestra consistencia entre las áreas evaluadas.' +
    ' El siguiente paso es identificar la ventaja competitiva y maximizarla.',
};
