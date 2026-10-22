'use client';

import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';
import type { MaturityMeta, MaturityLevel } from '@/types/dashboard';

interface StateDetectedCardProps {
  summary: string;
  maturity: MaturityMeta;
  maturityColor: string;
}

/** Severity levels that trigger persistent visual urgency (glow pulse). */
const CRITICAL_LEVELS: ReadonlySet<MaturityLevel> = new Set<MaturityLevel>(['CRITICO', 'RIESGO']);

/** Per-level eyebrow copy — the lead-in shown above the AI summary. */
const STATE_EYEBROW: Record<MaturityLevel, string> = {
  CRITICO:    'Atención inmediata requerida',
  RIESGO:     'Señales de alerta detectadas',
  ESTABLE:    'Base funcional con margen de mejora',
  COMPETENTE: 'Desempeño sólido',
  EXCELENTE:  'Perfil sobresaliente',
};

/**
 * Headline card that surfaces the AI executive summary as a visual statement.
 *
 * The card adapts color, border intensity, glow, and copy to the maturity level
 * so the user reads severity at a glance — before reading a single word.
 */
export default function StateDetectedCard({
  summary,
  maturity,
  maturityColor,
}: StateDetectedCardProps) {
  const isCritical = CRITICAL_LEVELS.has(maturity.level);
  const eyebrow    = STATE_EYEBROW[maturity.level];

  // Build all color-derived styles in one place so the rest of the JSX stays clean.
  const tint10 = `color-mix(in srgb, ${maturityColor} 10%, transparent)`;
  const tint18 = `color-mix(in srgb, ${maturityColor} 18%, transparent)`;
  const tint35 = `color-mix(in srgb, ${maturityColor} 35%, transparent)`;
  const tint03 = `color-mix(in srgb, ${maturityColor} 3%, transparent)`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
      className={`relative rounded-2xl p-5 md:p-7 overflow-hidden ${isCritical ? 'animate-urgent-glow' : ''}`}
      style={{
        background: `linear-gradient(135deg, ${tint10} 0%, ${tint03} 100%)`,
        border: `1px solid ${tint35}`,
        boxShadow: `0 8px 32px ${tint10}`,
        ...(isCritical ? ({ '--glow-color': maturityColor } as React.CSSProperties) : null),
      }}
    >
      {/* Decorative accent bar */}
      <div
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{ background: `linear-gradient(90deg, ${maturityColor} 0%, transparent 100%)` }}
      />

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0"
          style={{ background: tint18, color: maturityColor }}
        >
          <Activity size={17} />
        </div>

        <div className="flex-1 min-w-0">
          <p
            className="text-[10px] md:text-[11px] font-black uppercase tracking-widest leading-tight"
            style={{ color: maturityColor }}
          >
            Estado Detectado
          </p>
          <p
            className="text-[11px] md:text-xs mt-0.5 truncate"
            style={{ color: 'var(--text-muted)' }}
          >
            {eyebrow}
          </p>
        </div>

        <span
          className="shrink-0 text-[10px] md:text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full"
          style={{
            background: tint18,
            color: maturityColor,
            border: `1px solid ${tint35}`,
          }}
        >
          {maturity.label}
        </span>
      </div>

      {/* AI summary */}
      <p
        className="text-base md:text-lg leading-relaxed italic"
        style={{ color: 'var(--text-pearl)', fontWeight: 500 }}
      >
        &ldquo;{summary}&rdquo;
      </p>
    </motion.div>
  );
}
