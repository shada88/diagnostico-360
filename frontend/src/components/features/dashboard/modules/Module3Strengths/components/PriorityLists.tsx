'use client';

import { TrendingUp, AlertTriangle } from 'lucide-react';
import type { DiagnosticPriority } from '@/types/dashboard';
import PriorityCard from './PriorityCard';

interface PriorityListsProps {
  strengths:   DiagnosticPriority[];
  bottlenecks: DiagnosticPriority[];
}

export default function PriorityLists({ strengths, bottlenecks }: PriorityListsProps) {
  const displayStrengths   = strengths.slice(0, 3);
  const displayBottlenecks = bottlenecks.slice(0, 3);

  if (displayStrengths.length === 0 && displayBottlenecks.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {displayStrengths.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={14} style={{ color: 'var(--excelente-fg)' }} />
            <p className="section-label">Tus impulsores</p>
            <span
              className="text-micro px-2 py-0.5 rounded-full"
              style={{ color: 'var(--excelente-fg)', background: 'var(--alert-success-bg)' }}
            >
              {displayStrengths.length}
            </span>
          </div>
          <div className="space-y-2.5">
            {displayStrengths.map((s, i) => (
              <PriorityCard key={s.key} item={s} index={i} variant="impulsor" />
            ))}
          </div>
        </section>
      )}

      {displayBottlenecks.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={14} style={{ color: 'var(--riesgo-fg)' }} />
            <p className="section-label">Áreas de mejora</p>
            <span
              className="text-micro px-2 py-0.5 rounded-full"
              style={{ color: 'var(--riesgo-fg)', background: 'var(--alert-warning-bg)' }}
            >
              {displayBottlenecks.length}
            </span>
          </div>
          <div className="space-y-2.5">
            {displayBottlenecks.map((b, i) => (
              <PriorityCard key={b.key} item={b} index={i} variant="mejora" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
