'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type DimensionGroup, type SubdimensionGroup, type AnswerQuestion } from '@/lib/api';
import { ChevronDown } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function getMaturity(v: number) {
  if (v <= 3) return { color: '#E05252', label: 'Crítico'    };
  if (v <= 5) return { color: '#D4853A', label: 'Riesgo'     };
  if (v <= 7) return { color: '#C9A84C', label: 'Estable'    };
  if (v <= 9) return { color: '#8CC98A', label: 'Competente' };
  return       { color: '#5BA87A', label: 'Excelente'  };
}

// ─── Dimension accent config ──────────────────────────────────────────────────

interface DimMeta {
  accent: string;
  rgb:    string;
  badge:  string;
}

const DIM_META: Record<string, DimMeta> = {
  INTERNAL: { accent: '#9B82CF',                rgb: '155,130,207', badge: 'D1' },
  BUSINESS: { accent: 'var(--gold)',             rgb: '201,168,76',  badge: 'D2' },
  GROWTH:   { accent: 'var(--excelente-fg)',     rgb: '91,168,122',  badge: 'D3' },
};

// ─────────────────────────────────────────────────────────────────────────────
// QUESTION CARD
// ─────────────────────────────────────────────────────────────────────────────

function QuestionCard({
  q, position, accent, rgb,
}: {
  q:        AnswerQuestion;
  position: number;
  accent:   string;
  rgb:      string;
}) {
  const maturity = getMaturity(q.value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: position * 0.04 }}
      className="rounded-xl p-4"
      style={{
        background: 'var(--surface-subtle)',
        border:     '1px solid var(--surface-dim)',
      }}
    >
      {/* Top row — number · text · score */}
      <div className="flex items-start gap-3">

        {/* Number badge */}
        <span
          className="shrink-0 mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-black tabular-nums"
          style={{
            background: `rgba(${rgb},0.15)`,
            color:      accent,
            border:     `1px solid rgba(${rgb},0.3)`,
          }}
        >
          {String(position).padStart(2, '0')}
        </span>

        {/* Question text */}
        <p className="flex-1 text-sm leading-relaxed text-soft">{q.text}</p>

        {/* Score */}
        <div className="shrink-0 text-right ml-2">
          <p
            className="text-base font-black leading-none tabular-nums"
            style={{ color: maturity.color }}
          >
            {q.value.toFixed(1)}
          </p>
          <p
            className="text-[9px] font-bold uppercase tracking-wide mt-0.5"
            style={{ color: maturity.color, opacity: 0.75 }}
          >
            {maturity.label}
          </p>
        </div>
      </div>

      {/* Progress bar — always in dimension accent, value drives fill */}
      <div
        className="mt-3 ml-9 h-[3px] rounded-full overflow-hidden"
        style={{ background: `rgba(${rgb},0.12)` }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: accent }}
          initial={{ width: 0 }}
          animate={{ width: `${q.value * 10}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: position * 0.04 + 0.1 }}
        />
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SUBDIMENSION SECTION  (section header inside the dimension card — not a
// nested card, just a collapsible row so we avoid the box-in-box feel)
// ─────────────────────────────────────────────────────────────────────────────

function SubdimensionSection({
  sub, accent, rgb,
}: {
  sub:    SubdimensionGroup;
  accent: string;
  rgb:    string;
}) {
  const [open, setOpen] = useState(true);
  const maturity           = getMaturity(sub.score);

  return (
    <div>
      {/* Section header */}
      <button
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between gap-3 py-3 text-left group"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Accent line */}
          <div
            className="w-0.5 h-4 rounded-full shrink-0"
            style={{ background: accent, opacity: 0.7 }}
          />
          <span
            className="text-xs font-bold uppercase tracking-wide truncate"
            style={{ color: 'var(--text-muted)' }}
          >
            {sub.label}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Score pill */}
          <span
            className="text-[10px] font-black tabular-nums px-2 py-0.5 rounded-full"
            style={{
              color:      maturity.color,
              background: `${maturity.color}18`,
              border:     `1px solid ${maturity.color}30`,
            }}
          >
            {sub.score.toFixed(1)} · {maturity.label}
          </span>

          <ChevronDown
            className="w-3.5 h-3.5 transition-transform duration-200"
            style={{
              color:     accent,
              opacity:   0.6,
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
        </div>
      </button>

      {/* Questions */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="qs"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="space-y-2 pb-3">
              {sub.questions.map(q => (
                <QuestionCard
                  key={q.index}
                  q={q}
                  position={q.index}
                  accent={accent}
                  rgb={rgb}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DIMENSION CARD
// ─────────────────────────────────────────────────────────────────────────────

function DimensionCard({ dim, order }: { dim: DimensionGroup; order: number }) {
  const [open, setOpen] = useState(true);

  const meta     = DIM_META[dim.key] ?? DIM_META.BUSINESS;
  const allScores = dim.subdimensions.flatMap(s => s.questions.map(q => q.value));
  const avg       = allScores.length
    ? Math.round((allScores.reduce((a, b) => a + b, 0) / allScores.length) * 10) / 10
    : 0;
  const maturity = getMaturity(avg);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: order * 0.1 }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: `rgba(${meta.rgb},0.04)`,
        border:     `1px solid rgba(${meta.rgb},0.22)`,
        boxShadow:  `0 0 40px rgba(${meta.rgb},0.06)`,
      }}
    >
      {/* ── Header ── */}
      <button
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left transition-all"
        style={{
          background: open
            ? `linear-gradient(90deg, rgba(${meta.rgb},0.14) 0%, rgba(${meta.rgb},0.04) 60%, transparent 100%)`
            : `rgba(${meta.rgb},0.06)`,
        }}
      >
        <div className="flex items-center gap-3">
          {/* D-badge */}
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0"
            style={{
              background: `rgba(${meta.rgb},0.18)`,
              color:      meta.accent,
              border:     `1px solid rgba(${meta.rgb},0.35)`,
            }}
          >
            {meta.badge}
          </div>

          <div>
            <h3 className="text-base font-black font-display">{dim.label}</h3>
            <p className="text-[11px] mt-0.5 text-muted">
              {dim.subdimensions.length} subdimensiones · {allScores.length} afirmaciones
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* Avg score card */}
          <div
            className="hidden sm:flex flex-col items-end px-3 py-1.5 rounded-xl"
            style={{
              background: `rgba(${meta.rgb},0.1)`,
              border:     `1px solid rgba(${meta.rgb},0.2)`,
            }}
          >
            <span className="text-sm font-black tabular-nums leading-none" style={{ color: meta.accent }}>
              {avg.toFixed(1)}
            </span>
            <span className="text-[9px] font-bold uppercase tracking-wider mt-0.5" style={{ color: maturity.color }}>
              {maturity.label}
            </span>
          </div>

          <ChevronDown
            className="w-4 h-4 transition-transform duration-200"
            style={{
              color:     meta.accent,
              opacity:   0.7,
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
        </div>
      </button>

      {/* ── Subdimensions ── */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div
              className="px-5 divide-y"
              style={{
                borderTop:   `1px solid rgba(${meta.rgb},0.12)`,
                divideColor: `rgba(${meta.rgb},0.1)`,
              } as React.CSSProperties}
            >
              {dim.subdimensions.map(sub => (
                <SubdimensionSection
                  key={sub.key}
                  sub={sub}
                  accent={meta.accent}
                  rgb={meta.rgb}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SCALE LEGEND
// ─────────────────────────────────────────────────────────────────────────────

function ScaleLegend() {
  const steps = [
    { label: 'Crítico',    color: '#E05252', range: '1–3' },
    { label: 'Riesgo',     color: '#D4853A', range: '4–5' },
    { label: 'Estable',    color: '#C9A84C', range: '6–7' },
    { label: 'Competente', color: '#8CC98A', range: '8–9' },
    { label: 'Excelente',  color: '#5BA87A', range: '10'  },
  ];
  return (
    <div
      className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5 rounded-xl"
      style={{ background: 'var(--surface-subtle)', border: '1px solid var(--surface-dim)' }}
    >
      <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
        Escala de Madurez
      </span>
      {steps.map(s => (
        <div key={s.label} className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
          <span className="text-[11px] font-semibold text-muted">{s.label}</span>
          <span className="text-[10px] text-muted" style={{ opacity: 0.45 }}>
            {s.range}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

export default function AreasClaveView({ dimensions }: { dimensions: DimensionGroup[] }) {
  if (dimensions.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-muted">
          No se encontraron respuestas para este diagnóstico.
        </p>
      </div>
    );
  }

  const totalQ = dimensions.reduce(
    (acc, d) => acc + d.subdimensions.reduce((a, s) => a + s.questions.length, 0), 0,
  );

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black font-display">Áreas Clave</h2>
          <p className="text-xs mt-0.5 text-muted">
            {totalQ} afirmaciones · {dimensions.length} dimensiones
          </p>
        </div>
        <ScaleLegend />
      </div>

      {/* Dimension cards */}
      <div className="space-y-4">
        {dimensions.map((dim, i) => (
          <DimensionCard key={dim.key} dim={dim} order={i} />
        ))}
      </div>

    </div>
  );
}
