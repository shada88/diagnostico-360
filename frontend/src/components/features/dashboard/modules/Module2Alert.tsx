'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CrossAlert, AiAnalysisDTO, DiagnosticPriority } from '@/types/dashboard';

interface Module2AlertProps {
  alerts: CrossAlert[];
  aiAnalysis?: AiAnalysisDTO;
  bottlenecks?: DiagnosticPriority[];
}

// ─── Icons ───────────────────────────────────────────────────────────────────

function IconCritical() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
  );
}
function IconWarning() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}
function IconOpportunity() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
}
function IconChevron({ open }: { open: boolean }) {
  return (
    <motion.svg
      className="w-4 h-4 shrink-0"
      fill="none" stroke="currentColor" viewBox="0 0 24 24"
      animate={{ rotate: open ? 180 : 0 }}
      transition={{ duration: 0.2 }}
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </motion.svg>
  );
}

// ─── Alert card ───────────────────────────────────────────────────────────────

interface AlertCardProps {
  title: string;
  message: string;
  type: 'critical' | 'warning' | 'opportunity';
}

const TYPE_STYLES = {
  critical: {
    icon: <IconCritical />,
    iconColor: 'var(--critico-fg)',
    borderColor: 'rgba(139,26,26,0.45)',
    bg: 'var(--alert-critical-bg)',
    badge: 'Crítica',
    badgeColor: 'var(--critico-fg)',
    badgeBg: 'rgba(139,26,26,0.2)',
  },
  warning: {
    icon: <IconWarning />,
    iconColor: 'var(--riesgo-fg)',
    borderColor: 'rgba(198,93,0,0.35)',
    bg: 'var(--alert-warning-bg)',
    badge: 'Preventiva',
    badgeColor: 'var(--riesgo-fg)',
    badgeBg: 'rgba(198,93,0,0.18)',
  },
  opportunity: {
    icon: <IconOpportunity />,
    iconColor: 'var(--excelente-fg)',
    borderColor: 'rgba(91,168,122,0.3)',
    bg: 'var(--alert-success-bg)',
    badge: 'Oportunidad',
    badgeColor: 'var(--excelente-fg)',
    badgeBg: 'rgba(91,168,122,0.15)',
  },
};

function AlertCard({ title, message, type }: AlertCardProps) {
  const [open, setOpen] = useState(false);
  const s = TYPE_STYLES[type];

  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-300"
      style={{ border: `1px solid ${s.borderColor}`, background: s.bg }}
    >
      <button
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center gap-4 p-4 text-left"
      >
        <span style={{ color: s.iconColor }}>{s.icon}</span>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold leading-snug text-pearl">{title}</p>
        </div>

        <span
          className="text-micro px-2 py-0.5 rounded-full shrink-0"
          style={{ color: s.badgeColor, background: s.badgeBg }}
        >
          {s.badge}
        </span>

        <span style={{ color: 'var(--text-muted)' }}>
          <IconChevron open={open} />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-4 pb-4 pt-0 pl-[3.25rem]">
              <p className="section-label mb-2">Fundamento del Resultado</p>
              <p className="text-sm leading-relaxed text-soft">{message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

interface SectionProps {
  label: string;
  type: 'critical' | 'warning' | 'opportunity';
  children: React.ReactNode;
}

function Section({ label, type, children }: SectionProps) {
  const s = TYPE_STYLES[type];
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 mb-1">
        <span style={{ color: s.iconColor }}>{s.icon}</span>
        <h3 className="section-label" style={{ color: s.iconColor }}>
          {label}
        </h3>
      </div>
      {children}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Module2Alert({ alerts, aiAnalysis, bottlenecks }: Module2AlertProps) {
  const critical        = alerts.filter(a => a.severity === 'HIGH');
  const warnings        = alerts.filter(a => a.severity === 'MEDIUM');
  const insights        = aiAnalysis?.crossAlertInsights ?? [];
  const hasAlerts       = critical.length > 0 || warnings.length > 0;
  const hasBottlenecks  = (bottlenecks?.length ?? 0) > 0;
  const hasContent      = hasAlerts || insights.length > 0 || hasBottlenecks;

  return (
    <motion.div
      id="modulo-2"
      className="mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
    >
      <p className="section-label mb-4">Alertas Estratégicas</p>

      <div className="module-card">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h2 className="text-module-title mb-1">Hallazgos Clave</h2>
            <p className="text-xs text-muted">
              Resultados críticos y áreas de oportunidad detectadas en tu diagnóstico
            </p>
          </div>

          {hasAlerts && (
            <span
              className="text-micro px-3 py-1 rounded-full shrink-0"
              style={{
                color: critical.length > 0 ? 'var(--critico-fg)' : 'var(--riesgo-fg)',
                background: critical.length > 0 ? 'rgba(139,26,26,0.2)' : 'rgba(198,93,0,0.15)',
                border: `1px solid ${critical.length > 0 ? 'var(--alert-critical-border)' : 'var(--alert-warning-border)'}`,
              }}
            >
              {critical.length > 0 ? 'Atención Inmediata' : 'Revisión Sugerida'}
            </span>
          )}
        </div>

        {/* No alerts state */}
        {!hasContent && (
          <div className="info-block-success text-center py-10">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(91,168,122,0.12)', border: '1px solid rgba(91,168,122,0.3)' }}>
              <IconOpportunity />
            </div>
            <p className="text-sm font-bold mb-1" style={{ color: 'var(--excelente-fg)' }}>
              Sin alertas críticas
            </p>
            <p className="text-xs text-muted">
              El diagnóstico no detectó riesgos estructurales urgentes.
            </p>
          </div>
        )}

        {/* Atención sugerida — when no alerts but bottlenecks exist */}
        {!hasAlerts && !insights.length && hasBottlenecks && (
          <div className="rounded-xl p-5"
            style={{ background: 'rgba(212,133,58,0.06)', border: '1px solid rgba(212,133,58,0.2)' }}>
            <div className="flex items-center gap-2 mb-4">
              <span style={{ color: 'var(--riesgo-fg)' }}><IconWarning /></span>
              <p className="section-label" style={{ color: 'var(--riesgo-fg)' }}>
                Atención sugerida en
              </p>
            </div>
            <div className="space-y-2.5">
              {bottlenecks!.map(b => (
                <div key={b.key} className="flex items-center justify-between gap-4 rounded-lg px-4 py-3"
                  style={{ background: 'var(--surface-subtle)', border: '1px solid var(--surface-dim)' }}>
                  <p className="text-sm font-semibold text-pearl">{b.label}</p>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-sm font-black" style={{ color: b.maturity.color }}>{b.score.toFixed(1)}</span>
                    <span className="text-micro px-2 py-0.5 rounded-full"
                      style={{ color: b.maturity.color, background: `${b.maturity.color}20` }}>
                      {b.maturity.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs mt-4 text-muted">
              No hay alertas críticas, pero estas áreas tienen el mayor margen de mejora en tu diagnóstico.
            </p>
          </div>
        )}

        {/* Sections */}
        {hasContent && (
          <div className="space-y-8">
            {critical.length > 0 && (
              <Section label="Críticas" type="critical">
                {critical.map(a => (
                  <AlertCard key={a.key} title={a.title} message={a.message} type="critical" />
                ))}
              </Section>
            )}

            {warnings.length > 0 && (
              <Section label="Preventivas" type="warning">
                {warnings.map(a => (
                  <AlertCard key={a.key} title={a.title} message={a.message} type="warning" />
                ))}
              </Section>
            )}

            {insights.length > 0 && (
              <Section label="Oportunidades" type="opportunity">
                {insights.map((insight, i) => (
                  <AlertCard
                    key={i}
                    title={insight.length > 80 ? insight.slice(0, 80) + '…' : insight}
                    message={insight}
                    type="opportunity"
                  />
                ))}
              </Section>
            )}
          </div>
        )}

        {/* AI critical message */}
        {aiAnalysis?.criticalAlertMessage && hasAlerts && (
          <div className="mt-8 rounded-xl p-4"
            style={{ background: 'var(--gold-04)', border: '1px solid var(--gold-10)' }}>
            <p className="section-label mb-2" style={{ color: 'var(--gold-dim)' }}>Análisis IA</p>
            <p className="text-sm leading-relaxed italic text-soft">
              &ldquo;{aiAnalysis.criticalAlertMessage}&rdquo;
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
