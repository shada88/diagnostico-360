'use client';

import { motion } from 'framer-motion';
import type { DimensionResult, RadarPoint, ImpactConnection } from '@/types/dashboard';
import { type Finding } from '@/domain/findings';
import ImpactWarning from './components/ImpactWarning';
import ImpactConnectionCard from './components/ImpactConnectionCard';
import FindingCard from './components/FindingCard';

interface Module2ImpactProps {
  findings:            Finding[];
  dimensions:          DimensionResult[]; // reserved for future signals
  radar:               RadarPoint[];      // reserved for future drilldowns
  crudeWarning?:       string;
  impactConnections?:  ImpactConnection[];
}

/**
 * Unified strategic impact module — renders the AI's consolidated cause→effect
 * stories (`impactConnections`) as the primary narrative. Falls back to the
 * findings engine only when the AI did not generate any connections.
 */
export default function Module2Impact({
  findings,
  dimensions: _dimensions,
  radar: _radar,
  crudeWarning,
  impactConnections,
}: Module2ImpactProps) {
  const aiConnections = impactConnections ?? [];
  const hasAiConnections = aiConnections.length > 0;

  const hasFindings  = findings.length > 0;
  const hasCritical  = hasAiConnections
    ? aiConnections.some(c => c.severity === 'critical')
    : findings.some(f => f.category === 'critical-risk');
  const hasAttention = hasAiConnections
    ? aiConnections.some(c => c.severity === 'attention')
    : findings.some(f => f.category === 'attention-point');

  const headerBadge = hasCritical
    ? { label: 'Atención inmediata', fg: 'var(--critico-fg)',  bg: 'rgba(224,82,82,0.12)',  border: 'var(--alert-critical-border)' }
    : hasAttention
      ? { label: 'Revisión sugerida', fg: 'var(--riesgo-fg)',    bg: 'rgba(212,133,58,0.12)', border: 'var(--alert-warning-border)' }
      : { label: 'Perfil sólido',     fg: 'var(--excelente-fg)', bg: 'rgba(91,168,122,0.12)', border: 'var(--alert-success-border)' };

  const showBadge = hasAiConnections || hasFindings;

  return (
    <motion.section
      id="modulo-impacto"
      className="mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <p className="section-label mb-4">Conexiones Clave</p>

      <div className="module-card space-y-6">
        <header className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-module-title mb-1">Cómo tus áreas se sostienen o se sabotean</h2>
            <p className="text-sm text-muted">
              La lectura cruzada de tu diagnóstico: dónde una pieza está cargando el peso de las demás.
            </p>
          </div>

          {showBadge && (
            <span
              className="text-micro px-3 py-1 rounded-full shrink-0"
              style={{
                color:      headerBadge.fg,
                background: headerBadge.bg,
                border:     `1px solid ${headerBadge.border}`,
              }}
            >
              {headerBadge.label}
            </span>
          )}
        </header>

        {crudeWarning && <ImpactWarning warning={crudeWarning} />}

        {hasAiConnections ? (
          <div className="space-y-3.5">
            {aiConnections.map((connection, i) => (
              <ImpactConnectionCard key={`${connection.title}-${i}`} connection={connection} index={i} />
            ))}
          </div>
        ) : hasFindings ? (
          <div className="space-y-3">
            {findings.map((finding, i) => (
              <FindingCard key={finding.id} finding={finding} index={i} />
            ))}
          </div>
        ) : (
          <EmptyConnections />
        )}
      </div>
    </motion.section>
  );
}

function EmptyConnections() {
  return (
    <div className="info-block-success text-center py-8">
      <p className="text-sm font-bold mb-1" style={{ color: 'var(--excelente-fg)' }}>
        Sin tensiones estructurales detectadas
      </p>
      <p className="text-xs text-muted">
        El diagnóstico no encontró áreas que estén saboteando al resto de tu ecosistema.
      </p>
    </div>
  );
}
