'use client';

import { useEffect, useState, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { generateFindings, type Finding } from '@/domain/findings';
import { dashboardApi, type DimensionGroup } from '@/lib/api';
import { DashboardDTO } from '@/types/dashboard';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import Module1Header from '@/components/features/dashboard/modules/Module1Header';
import Module2Impact from '@/components/features/dashboard/modules/Module2Impact';
import Module3Strengths from '@/components/features/dashboard/modules/Module3Strengths';
import Module6Action from '@/components/features/dashboard/modules/Module6Action';
import ModuleFeedback from '@/components/features/dashboard/modules/ModuleFeedback';
import AreasClaveView from '@/components/features/dashboard/modules/AreasClaveView';
import EvolucionView from '@/components/features/dashboard/EvolucionView';

// ─── View type ────────────────────────────────────────────────────────────────

type ViewMode = 'informe' | 'areas-clave' | 'evolucion';

// ─────────────────────────────────────────────────────────────────────────────
// RESULTS PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function ResultsPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const id     = params.id;
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData]           = useState<DashboardDTO | null>(null);
  const [answers, setAnswers]     = useState<DimensionGroup[]>([]);
  const [findings, setFindings]   = useState<Finding[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  const currentView = (searchParams.get('view') ?? 'informe') as ViewMode;

  useEffect(() => {
    if (!id) return;
    window.scrollTo(0, 0);

    const loadDashboard = async () => {
      try {
        const [dashboardData, answersData] = await Promise.all([
          dashboardApi.getDashboard(id),
          dashboardApi.getAnswersByDimension(id).catch(() => [] as DimensionGroup[]),
        ]);

        setData(dashboardData);
        setAnswers(answersData);
        setFindings(generateFindings(dashboardData, answersData));
      } catch {
        setError('No se pudo cargar el diagnóstico.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [id]);

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--bg-space)' }}>
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-2 animate-spin mx-auto mb-4"
            style={{ borderColor: 'var(--gold-dim)', borderTopColor: 'var(--gold)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
            Generando Dashboard Integral...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4"
        style={{ background: 'var(--bg-space)' }}>
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold glass"
            style={{ color: '#C65D00', border: '1px solid rgba(198,93,0,0.4)' }}>
            !
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-pearl)' }}>
            Error de Carga
          </h2>
          <p className="mb-6" style={{ color: 'var(--text-soft)' }}>
            {error ?? 'No se encontraron datos.'}
          </p>
          <button
            onClick={() => router.push('/personal/diagnostico')}
            className="btn-gold px-6 py-2.5 rounded-xl font-bold text-sm"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32" style={{ background: 'var(--bg-space)' }}>

      {/* ── Main content ── */}
      <main className="max-w-5xl mx-auto px-4 md:px-8 py-8">
        <AnimatePresence mode="wait">

          {/* ── INFORME ── */}
          {currentView === 'informe' && (
            <motion.div
              key="informe"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              {/* Módulo 1 — Diagnóstico Integral (score + sección educativa + radar + estado detectado) */}
              <Module1Header
                score={data.global.score}
                maturity={data.global.maturity}
                mode={data.global.mode}
                radar={data.radar}
                areaInsights={data.aiAnalysis?.areaInsights}
                executiveSummary={data.aiAnalysis?.executiveSummary}
                userName={data.user.name}
                businessName={data.user.businessName}
              />

              {/* Módulo 2 — Conexiones Clave (narrativa estratégica de la IA + advertencia + fallback a hallazgos) */}
              <Module2Impact
                findings={findings}
                dimensions={data.dimensions}
                radar={data.radar}
                crudeWarning={data.aiAnalysis?.crudeWarning}
                impactConnections={data.aiAnalysis?.impactConnections}
              />

              {/* Módulo 3 — Fortalezas y Áreas de Mejora + plan táctico AI + cierre */}
              <Module3Strengths
                strengths={data.strengths}
                bottlenecks={data.bottlenecks}
                actionPlan30Days={data.aiAnalysis?.actionPlan30Days}
                conclusiveDiagnosis={data.aiAnalysis?.conclusiveDiagnosis}
              />

              {/* Módulo de cierre — Activación y Próximo Paso */}
              <Module6Action
                mentorshipTransitionText={data.aiAnalysis?.mentorshipTransitionText}
                attemptId={id}
              />

              {/* Módulo de Feedback */}
              <ModuleFeedback />
            </motion.div>
          )}

          {/* ── ÁREAS CLAVE ── */}
          {currentView === 'areas-clave' && (
            <motion.div
              key="areas-clave"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <AreasClaveView dimensions={answers} />
            </motion.div>
          )}

          {/* ── EVOLUCIÓN ── */}
          {currentView === 'evolucion' && (
            <motion.div
              key="evolucion"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <EvolucionView currentData={data} currentId={id} />
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
