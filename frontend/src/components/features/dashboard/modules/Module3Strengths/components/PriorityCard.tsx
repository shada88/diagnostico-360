'use client';

import { motion } from 'framer-motion';
import type { DiagnosticPriority } from '@/types/dashboard';

interface Props {
  item:    DiagnosticPriority;
  index:   number;
  variant: 'impulsor' | 'mejora';
}

export default function PriorityCard({ item, index, variant }: Props) {
  const color = item.maturity.color;
  const pct = (item.score / 10) * 100;
  const badgeBg = `color-mix(in srgb, ${color} 10%, transparent)`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
      className="rounded-xl p-3 flex items-center gap-3"
      style={{
        background: variant === 'impulsor' ? 'var(--alert-success-bg)' : 'var(--surface-subtle)',
        border: `1px solid ${variant === 'impulsor' ? 'var(--alert-success-border)' : 'var(--surface-dim)'}`,
      }}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: badgeBg, color }}
      >
        <span className="text-sm font-black">{item.score.toFixed(1)}</span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-pearl truncate">{item.label}</p>
        <div className="h-1.5 rounded-full mt-1.5" style={{ background: 'var(--surface-dim)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: color }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
          />
        </div>
      </div>

      <span
        className="text-micro px-2 py-1 rounded-lg shrink-0"
        style={{ background: badgeBg, color }}
      >
        {item.maturity.label}
      </span>
    </motion.div>
  );
}
