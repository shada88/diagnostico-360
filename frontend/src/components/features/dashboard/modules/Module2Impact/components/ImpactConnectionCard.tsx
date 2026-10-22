'use client';

import { motion } from 'framer-motion';
import type { ImpactConnection } from '@/types/dashboard';

const SEVERITY_META: Record<
  ImpactConnection['severity'],
  { label: string; colorVar: string }
> = {
  critical:    { label: 'Riesgo Estructural', colorVar: 'critico-fg' },
  attention:   { label: 'Punto de Atención',   colorVar: 'riesgo-fg' },
  opportunity: { label: 'Oportunidad Clave',   colorVar: 'excelente-fg' },
};

const SEVERITY_ICON_PATHS: Record<ImpactConnection['severity'], string> = {
  critical:
    'M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z',
  attention:
    'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  opportunity:
    'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
};

interface ImpactConnectionCardProps {
  connection: ImpactConnection;
  index:      number;
}

export default function ImpactConnectionCard({ connection, index }: ImpactConnectionCardProps) {
  const meta = SEVERITY_META[connection.severity];
  const accent = `var(--${meta.colorVar})`;
  const isCritical = connection.severity === 'critical';

  const impacts = connection.quickImpacts.slice(0, 3);

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.08, ease: 'easeOut' }}
      className={`relative rounded-2xl p-5 md:p-6 ${isCritical ? 'animate-urgent-glow' : ''}`}
      style={{
        background: `color-mix(in srgb, ${accent} 6%, var(--surface-subtle))`,
        border: `1px solid color-mix(in srgb, ${accent} 28%, transparent)`,
        ...(isCritical
          ? ({ '--glow-color': accent, animationDelay: `${index * 1.2}s` } as React.CSSProperties)
          : {}),
      }}
    >
      <header className="flex items-start gap-3 mb-4">
        <span
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: `color-mix(in srgb, ${accent} 16%, transparent)`,
            color: accent,
            border: `1px solid color-mix(in srgb, ${accent} 28%, transparent)`,
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d={SEVERITY_ICON_PATHS[connection.severity]}
            />
          </svg>
        </span>

        <div className="flex-1 min-w-0">
          <p
            className="text-[10px] font-bold uppercase tracking-widest mb-1"
            style={{ color: accent }}
          >
            {meta.label}
          </p>
          <h3
            className="text-base md:text-lg font-black leading-snug"
            style={{ color: 'var(--text-pearl)' }}
          >
            {connection.title}
          </h3>
        </div>
      </header>

      <p
        className="text-[15px] md:text-base leading-relaxed mb-4"
        style={{ color: 'var(--text-soft)' }}
      >
        {connection.story}
      </p>

      {impacts.length > 0 && (
        <ul className="space-y-2">
          {impacts.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span
                className="mt-2 w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: accent }}
              />
              <span
                className="text-[14px] md:text-[15px] leading-relaxed"
                style={{ color: 'var(--text-soft)' }}
              >
                {item}
              </span>
            </li>
          ))}
        </ul>
      )}

      {connection.focusAreas && connection.focusAreas.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-4 pt-4"
          style={{ borderTop: `1px solid color-mix(in srgb, ${accent} 14%, transparent)` }}
        >
          {connection.focusAreas.map(area => (
            <span
              key={area}
              className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full"
              style={{
                color: accent,
                background: `color-mix(in srgb, ${accent} 10%, transparent)`,
                border: `1px solid color-mix(in srgb, ${accent} 22%, transparent)`,
              }}
            >
              {area}
            </span>
          ))}
        </div>
      )}
    </motion.article>
  );
}
