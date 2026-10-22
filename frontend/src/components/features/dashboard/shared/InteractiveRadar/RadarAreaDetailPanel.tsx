'use client';

import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { RadarPoint } from '@/types/dashboard';
import { getAreaByLabel } from '../../data/areas';

interface RadarAreaDetailPanelProps {
  point: RadarPoint;
  /** AI-generated, area-specific insight. Falls back to the maturity level description. */
  insight?: string;
  onClose: () => void;
}

/**
 * Inline-expanded detail panel shown below the radar when the user
 * selects an area. Renders the area's icon, label, qué evalúa, score,
 * maturity level, and the level description.
 */
export default function RadarAreaDetailPanel({ point, insight, onClose }: RadarAreaDetailPanelProps) {
  const meta  = getAreaByLabel(point.label);
  const color = point.maturity.color;
  const Icon  = meta?.Icon;
  const reveal = insight?.trim() || point.maturity.description;

  const tint06 = `color-mix(in srgb, ${color} 6%, transparent)`;
  const tint12 = `color-mix(in srgb, ${color} 12%, transparent)`;
  const tint18 = `color-mix(in srgb, ${color} 18%, transparent)`;
  const tint28 = `color-mix(in srgb, ${color} 28%, transparent)`;
  const tint35 = `color-mix(in srgb, ${color} 35%, transparent)`;

  return (
    <motion.div
      key={point.label}
      initial={{ opacity: 0, height: 0, y: -6 }}
      animate={{ opacity: 1, height: 'auto', y: 0 }}
      exit={{ opacity: 0, height: 0, y: -6 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="overflow-hidden"
    >
      <div
        className="mt-4 rounded-2xl p-4 md:p-5 relative"
        style={{ background: tint06, border: `1px solid ${tint35}` }}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-start gap-3">
          {Icon && (
            <div
              className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
              style={{ background: tint18, color }}
            >
              <Icon size={18} />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color }}
            >
              Área del Diagnóstico
            </p>
            <h3
              className="text-lg font-black leading-tight"
              style={{ color: 'var(--text-pearl)', fontFamily: 'var(--font-playfair), serif' }}
            >
              {point.label}
            </h3>
            {meta?.shortDescription && (
              <p className="text-[13px] mt-1 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {meta.shortDescription}
              </p>
            )}
          </div>

          <button
            type="button"
            aria-label="Cerrar detalle del área"
            onClick={onClose}
            className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-opacity opacity-60 hover:opacity-100"
            style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)' }}
          >
            <X size={14} />
          </button>
        </div>

        {/* ── Score + maturity level — twin stats ──────────────────────────── */}
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <div
            className="rounded-xl p-3 text-center"
            style={{
              background: 'rgba(0,0,0,0.18)',
              border: '1px solid rgba(255,255,255,0.04)',
            }}
          >
            <p
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: 'var(--text-muted)' }}
            >
              Tu puntaje
            </p>
            <p className="mt-1 leading-none">
              <span className="text-2xl font-black" style={{ color }}>
                {point.score.toFixed(1)}
              </span>
              <span className="text-xs ml-0.5" style={{ color: 'var(--text-muted)' }}>
                / 10
              </span>
            </p>
          </div>

          <div
            className="rounded-xl p-3 text-center"
            style={{ background: tint12, border: `1px solid ${tint28}` }}
          >
            <p
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: 'var(--text-muted)' }}
            >
              Nivel de Madurez
            </p>
            <p
              className="text-base font-black uppercase mt-1 leading-none tracking-wider"
              style={{ color }}
            >
              {point.maturity.label}
            </p>
          </div>
        </div>

        {/* ── Revealing insight — AI-generated per area, falls back to maturity description */}
        {reveal && (
          <p
            className="text-[13px] mt-4 leading-relaxed italic"
            style={{ color: 'var(--text-soft)' }}
          >
            &ldquo;{reveal}&rdquo;
          </p>
        )}
      </div>
    </motion.div>
  );
}
