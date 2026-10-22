'use client';

import { motion } from 'framer-motion';
import type { DiagnosticPriority, AiAnalysisDTO } from '@/types/dashboard';
import PriorityLists from './components/PriorityLists';
import ActionPlan30Days from './components/ActionPlan30Days';

interface Module3StrengthsProps {
  strengths:        DiagnosticPriority[];
  bottlenecks:      DiagnosticPriority[];
  actionPlan30Days?: AiAnalysisDTO['actionPlan30Days'];
  conclusiveDiagnosis?: string;
}

/**
 * Penultimate module — strategic synthesis.
 *
 * Composition:
 *   1. PriorityLists       — top 3 strengths + bottom 3 to intervene
 *   2. ActionPlan30Days    — AI-generated guiding principle + 5 tactical steps
 *   3. Hook                — short closing line that bridges into the coach CTA below
 */
export default function Module3Strengths({
  strengths,
  bottlenecks,
  actionPlan30Days,
  conclusiveDiagnosis,
}: Module3StrengthsProps) {
  return (
    <motion.section
      id="modulo-fortalezas"
      className="mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
    >
      <p className="section-label mb-4">Tu Jugada Estratégica</p>

      <div className="module-card space-y-7">
        <header>
          <h2 className="text-module-title mb-1.5">Dónde apalancarte y dónde intervenir</h2>
          <p className="text-sm text-muted">
            Tus áreas más sólidas son el trampolín. Las más débiles son la prioridad inmediata.
          </p>
        </header>

        <PriorityLists strengths={strengths} bottlenecks={bottlenecks} />

        {actionPlan30Days && (
          <ActionPlan30Days
            foundation={actionPlan30Days.foundation}
            tacticalSteps={actionPlan30Days.tacticalSteps}
          />
        )}

        {conclusiveDiagnosis && (
          <div className="pt-3">
            <p
              className="text-base md:text-lg leading-relaxed text-center italic"
              style={{ color: 'var(--text-soft)' }}
            >
              &ldquo;{conclusiveDiagnosis}&rdquo;
            </p>
          </div>
        )}
      </div>
    </motion.section>
  );
}
