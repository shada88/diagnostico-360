'use client';

import { motion } from 'framer-motion';
import { MaturityMeta, AnalyticalMode, RadarPoint } from '@/types/dashboard';
import ScoreCircle from '../shared/ScoreCircle';
import StateDetectedCard from '../shared/StateDetectedCard';
import InfoTooltip from '../shared/InfoTooltip';
import InteractiveRadar from '../shared/InteractiveRadar/InteractiveRadar';
import EducationalSection from './EducationalSection';

interface Module1HeaderProps {
  score: number;
  maturity: MaturityMeta;
  mode: AnalyticalMode;
  radar: RadarPoint[];
  areaInsights?: Record<string, string>;
  executiveSummary?: string;
  userName: string;
  businessName?: string;
}

// ─── MATURITY LEVEL → display color (overrides backend hex for visual consistency) ──
const MATURITY_COLORS: Record<string, string> = {
  CRITICO:    '#E05252',
  RIESGO:     '#D4853A',
  ESTABLE:    '#C9A84C',
  COMPETENTE: '#8CC98A',
  EXCELENTE:  '#5BA87A',
};

// ─── ANALYTICAL MODE — display labels + colors ───────────────────────────────
const MODE_LABELS: Record<AnalyticalMode, string> = {
  CRISIS:       'Crisis',
  INTERVENTION: 'Intervención',
  MAINTENANCE:  'Mantenimiento',
  GROWTH:       'Crecimiento',
};

const MODE_COLORS: Record<AnalyticalMode, string> = {
  CRISIS:       '#E05252',
  INTERVENTION: '#D4853A',
  MAINTENANCE:  '#C9A84C',
  GROWTH:       '#5BA87A',
};

// ─────────────────────────────────────────────────────────────────────────────
// MODULE 1 — Diagnóstico Integral
// Layout (top → bottom):
//   • User identity header
//   • Interactive radar (10 áreas)
//   • Hero score (maturity-colored circular gauge) + level + mode
//   • Estado Detectado card (AI summary with dynamic severity styling)
// ─────────────────────────────────────────────────────────────────────────────
export default function Module1Header({
  score, maturity, mode, radar, areaInsights, executiveSummary, userName, businessName,
}: Module1HeaderProps) {
  const maturityColor = MATURITY_COLORS[maturity.level] ?? maturity.color;

  return (
    <motion.div
      id="modulo-1"
      className="mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <p
        className="text-xs font-bold uppercase tracking-widest mb-4"
        style={{ color: 'var(--text-muted)' }}
      >
        Tu Diagnóstico Integral
      </p>

      <div className="glass glass-hover rounded-2xl p-5 md:p-8">

        {/* ── User identity ─────────────────────────────────────────────── */}
        <header className="text-center mb-6 md:mb-8">
          <h2
            className="text-xl md:text-2xl font-black"
            style={{ color: 'var(--text-pearl)', fontFamily: 'var(--font-playfair), serif' }}
          >
            {userName}
          </h2>
          {businessName && (
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              {businessName}
            </p>
          )}
        </header>

        {/* ── Hero score ─────────────────────────────────────────────────── */}
        <section
          aria-label="Puntaje global del diagnóstico"
          className="flex flex-col items-center gap-5 mb-8 md:mb-10"
        >
          <p
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: 'var(--text-muted)' }}
          >
            Promedio General
          </p>

          <ScoreCircle score={score} maturityColor={maturityColor} />

          <div className="flex flex-col items-center gap-3">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <p
                  className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Nivel de Madurez
                </p>
                <InfoTooltip content="El nivel de madurez indica el estado de desarrollo de tu diagnóstico. Abre 'Conoce la Escala de Madurez' debajo para el detalle." />
              </div>
              <p
                className="text-lg md:text-xl font-black uppercase tracking-wider"
                style={{ color: maturityColor }}
              >
                {maturity.label}
              </p>
            </div>

            <div
              className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide"
              style={{
                background: `${MODE_COLORS[mode]}18`,
                color: MODE_COLORS[mode],
                border: `1px solid ${MODE_COLORS[mode]}30`,
              }}
            >
              Modo {MODE_LABELS[mode]}
            </div>
          </div>
        </section>

        {/* ── Educational layer — quick intro + maturity scale (collapsible) ── */}
        <section
          aria-label="Cómo entender tu diagnóstico"
          className="mb-6 md:mb-8 pt-6 md:pt-8"
          style={{ borderTop: '1px solid rgba(201,168,76,0.10)' }}
        >
          <EducationalSection />
        </section>

        {/* ── Interactive radar — 10 strategic areas ────────────────────── */}
        <section
          aria-label="Radar de las 10 áreas estratégicas"
          className="mb-6 md:mb-8 pt-6 md:pt-8"
          style={{ borderTop: '1px solid rgba(201,168,76,0.10)' }}
        >
          <InteractiveRadar radar={radar} areaInsights={areaInsights} />
        </section>

        {/* ── Estado Detectado — AI summary with dynamic severity ───────── */}
        {executiveSummary && (
          <StateDetectedCard
            summary={executiveSummary}
            maturity={maturity}
            maturityColor={maturityColor}
          />
        )}
      </div>
    </motion.div>
  );
}
