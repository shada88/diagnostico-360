'use client';

/**
 * Educational body that documents the maturity rating scale.
 *
 * Each entry maps a level number, label, score range, meaning, and color so the
 * reader can interpret any score they see anywhere in the dashboard.
 */

interface MaturityLevelRow {
  letter:  string;
  label:   string;
  range:   string;
  meaning: string;
  color:   string;
}

const MATURITY_LEVELS: ReadonlyArray<MaturityLevelRow> = [
  { letter: '1', label: 'Crítico',    range: '1 – 3', meaning: 'Área con fallas graves que requieren atención inmediata.', color: '#E05252' },
  { letter: '2', label: 'Riesgo',     range: '4 – 5', meaning: 'Área inestable que puede generar problemas en el corto plazo.', color: '#D4853A' },
  { letter: '3', label: 'Estable',    range: '6 – 7', meaning: 'Área funcional, con oportunidades de mejora.', color: '#C9A84C' },
  { letter: '4', label: 'Competente', range: '8 – 9', meaning: 'Área sólida y bien desarrollada.', color: '#8CC98A' },
  { letter: '5', label: 'Excelente',  range: '10',    meaning: 'Área sobresaliente y modelo de referencia.', color: '#5BA87A' },
];

const SCALE_PURPOSE: ReadonlyArray<string> = [
  'Dar una lectura rápida del estado de cada área.',
  'Señalar qué áreas necesitan atención prioritaria.',
  'Comparar resultados entre diagnósticos con un criterio estable.',
  'Facilitar la toma de decisiones estratégicas.',
];

export default function MaturityScaleContent() {
  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        La Escala de Madurez es el modelo de medición del Diagnóstico 360°. Permite interpretar los
        resultados y comprender el nivel de desarrollo en cada área evaluada.
      </p>

      <div className="space-y-2">
        {MATURITY_LEVELS.map(({ letter, label, range, meaning, color }) => (
          <div
            key={label}
            className="flex items-start gap-3 p-2.5 rounded-xl"
            style={{ background: `${color}0D`, border: `1px solid ${color}22` }}
          >
            <div
              className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0 font-black text-sm"
              style={{ background: `${color}22`, color }}
            >
              {letter}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-sm font-bold" style={{ color }}>{label}</span>
                <span
                  className="text-xs font-mono px-1.5 py-0.5 rounded"
                  style={{ background: `${color}18`, color: 'var(--text-muted)' }}
                >
                  {range}
                </span>
              </div>
              <p className="text-[13px] mt-0.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {meaning}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div
        className="p-3 rounded-xl"
        style={{ background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.08)' }}
      >
        <p
          className="text-xs font-bold uppercase tracking-widest mb-2"
          style={{ color: 'var(--gold)' }}
        >
          Propósito de la escala
        </p>
        <ul className="space-y-1.5">
          {SCALE_PURPOSE.map(item => (
            <li key={item} className="flex items-start gap-2">
              <div className="w-1 h-1 rounded-full shrink-0 mt-1.5" style={{ background: 'var(--gold)' }} />
              <span className="text-[13px]" style={{ color: 'var(--text-muted)' }}>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
