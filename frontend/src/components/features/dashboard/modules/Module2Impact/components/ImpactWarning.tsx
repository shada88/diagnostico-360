'use client';

import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface ImpactWarningProps {
  warning: string;
}

/**
 * AI-generated, direct warning about how the weakest areas are already
 * (or about to be) affecting the rest of the user's business/life.
 */
export default function ImpactWarning({ warning }: ImpactWarningProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-xl border border-[var(--riesgo-fg)] bg-[var(--riesgo-bg)] relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-[var(--riesgo-fg)]" />
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-full bg-[var(--riesgo-fg)]/10 text-[var(--riesgo-fg)] mt-0.5 shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-[var(--riesgo-fg)] uppercase tracking-wider mb-2">
            Advertencia de Impacto
          </h4>
          <p className="text-[var(--text-main)] text-sm md:text-base leading-relaxed font-medium">
            {warning}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
