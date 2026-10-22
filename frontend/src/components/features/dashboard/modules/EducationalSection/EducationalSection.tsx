'use client';

import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import CollapsibleSection from '../../shared/CollapsibleSection';
import MaturityScaleContent from './MaturityScaleContent';

/**
 * Compact educational layer rendered INSIDE Module 1, between the global
 * score and the radar. Single collapsible (maturity scale) — the intro text
 * lives directly above and the per-area detail is shown by the interactive
 * radar itself, so the old "10 áreas" grid was redundant.
 */
export default function EducationalSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 }}
    >
      <div className="rounded-2xl px-4 py-3" style={{
        background: 'rgba(201,168,76,0.04)',
        border: '1px solid rgba(201,168,76,0.10)',
      }}>
        <p
          className="text-sm md:text-[15px] leading-relaxed mb-3"
          style={{ color: 'var(--text-soft)' }}
        >
          Tu puntaje global se construye a partir de <strong style={{ color: 'var(--gold)' }}>10 áreas estratégicas</strong>.
          Cada una influye en las demás: una debilidad arrastra al conjunto, una fortaleza lo impulsa.
        </p>

        <CollapsibleSection icon={BarChart3} title="Conoce la Escala de Madurez">
          <MaturityScaleContent />
        </CollapsibleSection>
      </div>
    </motion.div>
  );
}
