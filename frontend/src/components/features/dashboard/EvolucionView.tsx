'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, ReferenceArea,
} from 'recharts';
import { dashboardApi, responsesApi, type AttemptSummary } from '@/lib/api';
import { DashboardDTO } from '@/types/dashboard';
import { ChevronDown, Trash2, TrendingUp, TrendingDown, Minus, Sparkles, AlertTriangle, Target } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────

function getMaturity(v: number) {
  if (v <= 3) return { color: '#E05252', label: 'Crítico'    };
  if (v <= 5) return { color: '#D4853A', label: 'Riesgo'     };
  if (v <= 7) return { color: '#C9A84C', label: 'Estable'    };
  if (v <= 9) return { color: '#8CC98A', label: 'Competente' };
  return       { color: '#5BA87A', label: 'Excelente'  };
}

// ─────────────────────────────────────────────────────────────────────────────

interface EvolucionViewProps {
  currentData: DashboardDTO;
  currentId:   string;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatShort(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('es', { day: '2-digit', month: 'short', year: '2-digit' });
}

// ─── Timeline Tooltip ────────────────────────────────────────────────────────

const TimelineTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const score = payload[0]?.value as number;
  const maturity = getMaturity(score);
  return (
    <div style={{
      background: 'var(--tooltip-bg)',
      border: `1px solid ${maturity.color}50`,
      borderRadius: '12px',
      padding: '10px 14px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
    }}>
      <p style={{ color: 'var(--tooltip-text)', opacity: 0.5, fontSize: 10, fontWeight: 700, marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        {label}
      </p>
      <p style={{ color: 'var(--gold)', fontSize: 22, fontWeight: 900, lineHeight: 1, marginBottom: 4 }}>
        {score.toFixed(1)}
      </p>
      <p style={{ color: maturity.color, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {maturity.label}
      </p>
    </div>
  );
};

// ─── History Chart ────────────────────────────────────────────────────────────

function HistoryChart({ attempts, currentId }: { attempts: AttemptSummary[]; currentId: string }) {
  const data = [...attempts]
    .filter(a => a.globalScore != null)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map(a => ({
      date:      formatShort(a.createdAt),
      score:     a.globalScore as number,
      id:        a.id,
      isCurrent: a.id === currentId,
    }));

  if (data.length < 1) return null;

  // Custom dot — highlights current attempt
  const CustomDot = (dotProps: any) => {
    const { cx, cy, payload } = dotProps;
    if (!cx || !cy) return null;
    const maturity = getMaturity(payload.score);
    return (
      <g key={`dot-${payload.id}`}>
        {payload.isCurrent && (
          <circle cx={cx} cy={cy} r={13} fill={maturity.color} fillOpacity={0.12} />
        )}
        <circle
          cx={cx} cy={cy}
          r={payload.isCurrent ? 7 : 5}
          fill={payload.isCurrent ? maturity.color : '#C9A84C'}
          style={{
            stroke: payload.isCurrent ? maturity.color : 'var(--gold-40)',
            strokeWidth: payload.isCurrent ? 2 : 1.5,
            strokeOpacity: payload.isCurrent ? 0.5 : 1,
          }}
        />
        {payload.isCurrent && (
          <circle cx={cx} cy={cy} r={4} style={{ fill: 'var(--bg-surface)' }} />
        )}
      </g>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-black mb-0.5 font-display">Histórico de Puntuaciones</h3>
          <p className="text-xs text-muted">
            Índice global de madurez por diagnóstico · {data.length} medición{data.length !== 1 ? 'es' : ''}
          </p>
        </div>

        {/* Mini maturity legend */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          {[
            { label: 'C',  color: '#E05252' },
            { label: 'R',  color: '#D4853A' },
            { label: 'E',  color: '#C9A84C' },
            { label: 'C',  color: '#8CC98A' },
            { label: 'E',  color: '#5BA87A' },
          ].map((z, i) => (
            <div key={i} className="flex flex-col items-center gap-0.5">
              <div className="w-2 h-2 rounded-full" style={{ background: z.color }} />
              <span className="text-[9px] font-black" style={{ color: z.color }}>{z.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 12, right: 8, left: -28, bottom: 0 }}>
            <defs>
              <linearGradient id="histGold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#C9A84C" stopOpacity={0.22} />
                <stop offset="100%" stopColor="#C9A84C" stopOpacity={0.01} />
              </linearGradient>
            </defs>

            {/* maturity zone bands */}
            <ReferenceArea y1={0}  y2={3}  fill="#E05252" fillOpacity={0.045} />
            <ReferenceArea y1={3}  y2={5}  fill="#D4853A" fillOpacity={0.045} />
            <ReferenceArea y1={5}  y2={7}  fill="#C9A84C" fillOpacity={0.03}  />
            <ReferenceArea y1={7}  y2={9}  fill="#8CC98A" fillOpacity={0.045} />
            <ReferenceArea y1={9}  y2={10} fill="#5BA87A" fillOpacity={0.045} />

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--surface-dim)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fill: '#666', fontSize: 10, fontWeight: 600 }}
              tickLine={false}
              axisLine={{ stroke: 'var(--surface-mid)' }}
            />
            <YAxis
              domain={[0, 10]}
              ticks={[3, 5, 7, 9]}
              tick={{ fill: '#555', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<TimelineTooltip />} cursor={{ stroke: 'var(--gold-20)', strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#C9A84C"
              strokeWidth={2}
              fill="url(#histGold)"
              dot={<CustomDot />}
              activeDot={{ r: 7, fill: '#F5D77E', stroke: 'rgba(201,168,76,0.5)', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--tooltip-bg)',
      border: '1px solid var(--gold-30)',
      borderRadius: '12px',
      padding: '10px 14px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
    }}>
      <p style={{ color: 'var(--tooltip-text)', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
        {label}
      </p>
      {payload.map((entry: any) => (
        <p key={entry.name} style={{ color: entry.color, fontSize: 13, fontWeight: 700 }}>
          {entry.name}: {entry.value?.toFixed(1)}
        </p>
      ))}
    </div>
  );
};

// ─── Delta pill ───────────────────────────────────────────────────────────────

function DeltaPill({ current, previous }: { current: number; previous: number }) {
  const delta = current - previous;
  const isPos = delta >= 0;
  return (
    <span
      className="text-[10px] font-black px-2 py-0.5 rounded-full"
      style={{
        color:      isPos ? 'var(--excelente-fg)' : 'var(--critico-fg)',
        background: isPos ? 'rgba(91,168,122,0.15)' : 'rgba(224,82,82,0.15)',
      }}
    >
      {isPos ? '+' : ''}{delta.toFixed(1)}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

export default function EvolucionView({ currentData, currentId }: EvolucionViewProps) {
  const router = useRouter();

  const [attempts, setAttempts]         = useState<AttemptSummary[]>([]);
  const [prevData, setPrevData]         = useState<DashboardDTO | null>(null);
  const [selectedId, setSelectedId]     = useState<string | null>(null);
  const [loadingPrev, setLoadingPrev]   = useState(true);
  const [loadingComp, setLoadingComp]   = useState(false);
  const [error, setError]               = useState(false);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting]         = useState(false);
  const [evolutionData, setEvolutionData] = useState<any>(null);
  const [loadingEvolution, setLoadingEvolution] = useState(false);
  const [evolutionExpanded, setEvolutionExpanded] = useState(false);

  // Load all completed attempts on mount
  useEffect(() => {
    responsesApi.getUserAttempts()
      .then(async all => {
        const completed = all.filter(a => a.status === 'COMPLETED');
        setAttempts(completed);

        // Auto-select the most recent previous attempt
        const previous = completed
          .filter(a => a.id !== currentId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        if (previous.length === 0) { setLoadingPrev(false); return; }

        const toLoad = previous[0];
        setSelectedId(toLoad.id);
        const prev = await dashboardApi.getDashboard(toLoad.id);
        setPrevData(prev);
      })
      .catch(() => setError(true))
      .finally(() => setLoadingPrev(false));
  }, [currentId]);

  // Fetch evolution analysis when comparison data is available
  useEffect(() => {
    if (!selectedId || !prevData) return;
    setLoadingEvolution(true);
    dashboardApi.getEvolutionAnalysis(currentId, selectedId)
      .then(data => setEvolutionData(data))
      .catch(() => setEvolutionData(null))
      .finally(() => setLoadingEvolution(false));
  }, [currentId, selectedId, prevData]);

  // Load comparison data when user selects a different attempt
  const handleSelectComparison = async (id: string) => {
    if (id === selectedId) return;
    setLoadingComp(true);
    setSelectorOpen(false);
    try {
      const d = await dashboardApi.getDashboard(id);
      setPrevData(d);
      setSelectedId(id);
    } catch {
      // keep previous selection
    } finally {
      setLoadingComp(false);
    }
  };

  // ── Delete attempt ─────────────────────────────────────────────────────────

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await responsesApi.deleteAttempt(id);
      const updated = attempts.filter(a => a.id !== id);
      setAttempts(updated);
      
      // Force collapse & resetting of evolution section as per requirements
      setEvolutionExpanded(false);
      setEvolutionData(null);
      
      // Notify GlobalHeader and any other subscriber to refresh their attempts list
      window.dispatchEvent(new CustomEvent('attempt-deleted', { detail: { id } }));
      // If we were comparing against the deleted attempt, reset comparison
      if (selectedId === id) {
        const next = updated
          .filter(a => a.id !== currentId && a.status === 'COMPLETED')
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
        if (next) {
          setSelectedId(next.id);
          const d = await dashboardApi.getDashboard(next.id);
          setPrevData(d);
        } else {
          setSelectedId(null);
          setPrevData(null);
        }
      }
    } catch {
      // silently keep state
    } finally {
      setDeleting(false);
      setConfirmDeleteId(null);
    }
  };

  // ── Radar data ──────────────────────────────────────────────────────────────

  const radarData = currentData.dimensions.map(dim => {
    const prevDim = prevData?.dimensions.find(d => d.key === dim.key);
    return {
      subject:  dim.label,
      Actual:   dim.score,
      Anterior: prevDim?.score ?? null,
    };
  });

  // ── Loading / Error ─────────────────────────────────────────────────────────

  if (loadingPrev) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 rounded-full border-2 animate-spin"
          style={{ borderColor: 'var(--gold-30)', borderTopColor: 'var(--gold)' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-muted">No se pudieron cargar los datos de evolución.</p>
      </div>
    );
  }

  // ── Empty state — only one attempt ─────────────────────────────────────────

  const otherAttempts = attempts.filter(a => a.id !== currentId);

  if (otherAttempts.length === 0) {
    // Calculate days since last completed diagnosis for the friendly note
    const lastCompleted = attempts
      .filter(a => a.status === 'COMPLETED')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    const daysSince = lastCompleted
      ? Math.floor((Date.now() - new Date(lastCompleted.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      : null;
    const isReady = daysSince === null || daysSince >= 30;

    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-20 glass rounded-2xl px-8"
      >
        <div className="text-4xl mb-4">📈</div>
        <h3 className="text-xl font-black mb-3 font-display">Tu primera medición</h3>
        <p className="text-sm leading-relaxed max-w-sm mx-auto mb-6 text-soft">
          Completa un segundo diagnóstico para ver tu evolución en el tiempo y comparar cómo creciste en cada dimensión.
        </p>

        {daysSince !== null && (
          <div className="max-w-sm mx-auto mb-6 rounded-xl px-4 py-3 text-left"
            style={{
              background: isReady ? 'rgba(91,168,122,0.08)' : 'rgba(201,168,76,0.06)',
              border: isReady ? '1px solid rgba(91,168,122,0.2)' : '1px solid rgba(201,168,76,0.15)',
            }}
          >
            {isReady ? (
              <p className="text-xs leading-relaxed" style={{ color: '#5BA87A' }}>
                <strong>¡Buen momento!</strong> Han pasado {daysSince} días. Medir tu evolución ahora te dará una perspectiva clara.
              </p>
            ) : (
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Tu último diagnóstico fue hace {daysSince} {daysSince === 1 ? 'día' : 'días'}.
                Puedes continuar sin problema — los cambios más visibles suelen reflejarse a partir de los 30 días.
              </p>
            )}
          </div>
        )}

        <button
          onClick={() => router.push('/personal/diagnostico?new=true')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm transition-all"
          style={{
            background: 'var(--gold-glow-soft)',
            color:      'var(--gold-bright)',
            border:     '1px solid var(--gold)',
            boxShadow:  '0 0 20px var(--gold-glow-soft)',
          }}
        >
          Hacer nueva encuesta →
        </button>
      </motion.div>
    );
  }

  const selectedAttempt = attempts.find(a => a.id === selectedId);

  return (
    <div className="space-y-8">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black mb-1 font-display">Evolución e Historial</h2>
          <p className="text-xs text-muted">
            {attempts.length} diagnóstico{attempts.length !== 1 ? 's' : ''} completado{attempts.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Comparison selector (only shown when >2 attempts) */}
        {otherAttempts.length > 1 && (
          <div className="relative">
            <button
              onClick={() => setSelectorOpen(p => !p)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
              style={{
                background: 'var(--surface-dim)',
                border:     '1px solid var(--surface-raised)',
                color:      'var(--text-soft)',
              }}
            >
              Comparando con: {selectedAttempt ? formatShort(selectedAttempt.createdAt) : '...'}
              <ChevronDown className="w-4 h-4" style={{ transform: selectorOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
            <AnimatePresence>
              {selectorOpen && (
                <motion.div
                  className="absolute right-0 top-full mt-1.5 glass rounded-xl overflow-hidden z-30"
                  style={{ minWidth: '200px', boxShadow: '0 8px 32px rgba(0,0,0,0.7)' }}
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                >
                  <p className="px-4 pt-3 pb-1 text-[9px] font-black uppercase tracking-widest"
                    style={{ color: 'var(--text-muted)' }}>
                    Selecciona para comparar
                  </p>
                  {otherAttempts
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((a, i) => (
                      <button
                        key={a.id}
                        onClick={() => handleSelectComparison(a.id)}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors hover:bg-white/5"
                        style={{
                          background: a.id === selectedId ? 'var(--gold-08)' : 'transparent',
                          borderTop:  i === 0 ? 'none' : '1px solid var(--surface-dim)',
                        }}
                      >
                        <span className="text-xs font-semibold"
                          style={{ color: a.id === selectedId ? 'var(--gold)' : 'var(--text-soft)' }}>
                          {formatDate(a.createdAt)}
                        </span>
                        {a.globalScore != null && (
                          <span className="text-xs font-black"
                            style={{ color: a.id === selectedId ? 'var(--gold)' : 'var(--text-muted)' }}>
                            {a.globalScore.toFixed(1)}/10
                          </span>
                        )}
                      </button>
                    ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── Global score comparison ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6"
      >
        <p className="text-xs font-bold uppercase tracking-widest mb-4"
          style={{ color: 'var(--text-muted)' }}>
          Índice Global de Madurez
        </p>
        <div className="flex items-center gap-6 flex-wrap">
          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider mb-1"
              style={{ color: 'var(--text-muted)' }}>
              Actual
            </p>
            <p className="text-4xl font-black font-display" style={{ color: 'var(--gold-bright)' }}>
              {currentData.global.score.toFixed(1)}
            </p>
            <p className="text-[10px] mt-0.5 font-bold uppercase"
              style={{ color: currentData.global.maturity.color }}>
              {currentData.global.maturity.label}
            </p>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              {prevData && <DeltaPill current={currentData.global.score} previous={prevData.global.score} />}
              <p className="text-[9px] mt-1 uppercase tracking-wider"
                style={{ color: 'var(--text-muted)' }}>
                variación
              </p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider mb-1"
              style={{ color: 'var(--text-muted)' }}>
              {selectedAttempt ? formatShort(selectedAttempt.createdAt) : 'Anterior'}
            </p>
            {loadingComp ? (
              <div className="w-8 h-8 rounded-full border-2 animate-spin mx-auto"
                style={{ borderColor: 'var(--gold-30)', borderTopColor: 'var(--gold)' }} />
            ) : prevData ? (
              <>
                <p className="text-4xl font-black font-display text-soft">
                  {prevData.global.score.toFixed(1)}
                </p>
                <p className="text-[10px] mt-0.5 font-bold uppercase"
                  style={{ color: prevData.global.maturity.color }}>
                  {prevData.global.maturity.label}
                </p>
              </>
            ) : null}
          </div>
        </div>
      </motion.div>

      {/* ── Radar comparison ── */}
      {prevData && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-8"
        >
          <h3 className="text-base font-black mb-6 font-display">Comparativa por Dimensión</h3>

          <div className="h-72 md:h-80 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="var(--surface-dim)" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: 'var(--text-soft)', fontSize: 12, fontWeight: 600 }}
                  tickLine={false}
                />
                <PolarRadiusAxis angle={90} domain={[0, 10]} tick={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Radar name="Actual" dataKey="Actual"
                  stroke="#C9A84C" fill="#C9A84C" fillOpacity={0.18} strokeWidth={2}
                  dot={{ r: 4, fill: '#C9A84C', strokeWidth: 0 }}
                />
                <Radar name={selectedAttempt ? formatShort(selectedAttempt.createdAt) : 'Anterior'}
                  dataKey="Anterior"
                  stroke="#5BA87A" fill="#5BA87A" fillOpacity={0.1} strokeWidth={1.5}
                  strokeDasharray="4 3"
                  dot={{ r: 3, fill: '#5BA87A', strokeWidth: 0 }}
                />
                <Legend
                  formatter={(value) => (
                    <span style={{ color: value === 'Actual' ? 'var(--gold)' : '#5BA87A', fontSize: 11, fontWeight: 700 }}>
                      {value}
                    </span>
                  )}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Dimension delta table */}
          <div className="space-y-2.5">
            {currentData.dimensions.map(dim => {
              const prevDim = prevData.dimensions.find(d => d.key === dim.key);
              return (
                <div key={dim.key} className="flex items-center gap-4 rounded-xl px-4 py-3"
                  style={{ background: 'var(--surface-subtle)', border: '1px solid var(--surface-dim)' }}>
                  <p className="flex-1 text-sm font-semibold text-soft">{dim.label}</p>
                  <div className="flex items-center gap-3 shrink-0">
                    {prevDim && (
                      <>
                        <span className="text-xs" style={{ color: 'var(--excelente-fg)' }}>
                          {prevDim.score.toFixed(1)}
                        </span>
                        <span style={{ color: 'var(--text-muted)' }}>→</span>
                      </>
                    )}
                    <span className="text-sm font-black text-gold">{dim.score.toFixed(1)}</span>
                    {prevDim && <DeltaPill current={dim.score} previous={prevDim.score} />}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ── AI Evolution Report ── */}
      {prevData && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass rounded-2xl overflow-hidden"
        >
          {/* Header */}
          <button
            onClick={() => setEvolutionExpanded(p => !p)}
            className="w-full flex items-center justify-between p-6 text-left transition-colors hover:bg-white/[0.02]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)' }}>
                <Sparkles className="w-5 h-5" style={{ color: 'var(--gold)' }} />
              </div>
              <div>
                <h3 className="text-base font-black font-display">Informe de Evolución</h3>
                <p className="text-xs text-muted">Análisis inteligente de tu progreso</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {evolutionData?.overallVerdict && !loadingEvolution && (
                <span
                  className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full"
                  style={{
                    color: evolutionData.overallVerdict === 'PROGRESO' ? '#5BA87A'
                         : evolutionData.overallVerdict === 'RETROCESO' ? '#E05252'
                         : evolutionData.overallVerdict === 'MIXTO' ? '#C9A84C'
                         : '#888',
                    background: evolutionData.overallVerdict === 'PROGRESO' ? 'rgba(91,168,122,0.12)'
                              : evolutionData.overallVerdict === 'RETROCESO' ? 'rgba(224,82,82,0.12)'
                              : evolutionData.overallVerdict === 'MIXTO' ? 'rgba(201,168,76,0.1)'
                              : 'rgba(136,136,136,0.1)',
                  }}
                >
                  {evolutionData.overallVerdict}
                </span>
              )}
              <ChevronDown
                className="w-4 h-4 transition-transform"
                style={{
                  color: 'var(--text-muted)',
                  transform: evolutionExpanded ? 'rotate(180deg)' : 'none',
                }}
              />
            </div>
          </button>

          <AnimatePresence>
            {evolutionExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                style={{ overflow: 'hidden' }}
              >
                <div className="px-6 pb-6 space-y-5" style={{ borderTop: '1px solid var(--surface-dim)' }}>

                  {loadingEvolution ? (
                    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                      <div className="relative mb-6">
                        <div className="w-12 h-12 rounded-full border-2 border-dashed animate-spin"
                          style={{ borderColor: 'var(--gold-30)', borderTopColor: 'var(--gold)' }} />
                        <Sparkles className="w-5 h-5 absolute inset-0 m-auto animate-pulse" style={{ color: 'var(--gold)' }} />
                      </div>
                      <h4 className="text-base font-black text-pearl mb-2">Estamos analizando tu crecimiento...</h4>
                      <p className="text-sm text-muted max-w-[280px] leading-relaxed">
                        Nuestra IA está comparando tus diagnósticos. Esto puede tardar unos segundos, pero te prometemos que el análisis vale la pena.
                      </p>
                    </div>
                  ) : !evolutionData ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-muted">No se pudo generar el análisis en este momento.</p>
                    </div>
                  ) : (
                    <>
                      {/* Executive Summary */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="pt-5"
                      >
                        <p className="text-sm leading-relaxed text-soft">
                          {evolutionData.executiveSummary}
                        </p>
                      </motion.div>

                      {/* Dimension Analysis */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-3"
                      >
                        <p className="section-label">Análisis por Dimensión</p>
                        {(['internal', 'business', 'growth'] as const).map(dimKey => {
                          const dim = evolutionData.dimensionAnalysis?.[dimKey];
                          if (!dim) return null;
                          const dimLabel = dimKey === 'internal' ? 'Área Interna'
                                        : dimKey === 'business' ? 'Área del Negocio'
                                        : 'Área de Crecimiento';
                          const TrendIcon = dim.trend?.includes('↑') ? TrendingUp
                                         : dim.trend?.includes('↓') ? TrendingDown
                                         : Minus;
                          const trendColor = dim.trend?.includes('↑') ? '#5BA87A'
                                           : dim.trend?.includes('↓') ? '#E05252'
                                           : '#888';
                          return (
                            <div key={dimKey}
                              className="rounded-xl p-4"
                              style={{ background: 'var(--surface-subtle)', border: '1px solid var(--surface-dim)' }}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <TrendIcon className="w-4 h-4" style={{ color: trendColor }} />
                                <span className="text-sm font-black" style={{ color: trendColor }}>{dimLabel}</span>
                                <span className="text-xs font-bold ml-auto" style={{ color: trendColor }}>
                                  {dim.trend}
                                </span>
                              </div>
                              <p className="text-sm text-soft leading-relaxed mb-3">{dim.insight}</p>
                              <div className="flex items-start gap-2 pt-3" style={{ borderTop: '1px solid var(--surface-dim)' }}>
                                <Target className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--gold)' }} />
                                <p className="text-sm font-semibold" style={{ color: 'var(--gold)' }}>{dim.recommendation}</p>
                              </div>
                            </div>
                          );
                        })}
                      </motion.div>

                      {/* Top Gains & Declines */}
                      {(evolutionData.topGains?.length > 0 || evolutionData.topDeclines?.length > 0) && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                        >
                          {evolutionData.topGains?.length > 0 && (
                            <div className="rounded-xl p-4" style={{ background: 'rgba(91,168,122,0.06)', border: '1px solid rgba(91,168,122,0.15)' }}>
                              <div className="flex items-center gap-2 mb-3">
                                <TrendingUp className="w-5 h-5" style={{ color: '#5BA87A' }} />
                                <span className="text-xs font-black uppercase tracking-wider" style={{ color: '#5BA87A' }}>Mayores avances</span>
                              </div>
                              <div className="space-y-3">
                                {evolutionData.topGains.map((g: any, i: number) => (
                                  <div key={i}>
                                    <div className="flex items-center justify-between mb-0.5">
                                      <span className="text-sm font-bold text-soft">{g.area}</span>
                                      <span className="text-xs font-black" style={{ color: '#5BA87A' }}>+{g.delta?.toFixed(1)}</span>
                                    </div>
                                    <p className="text-sm text-muted leading-relaxed">{g.insight}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {evolutionData.topDeclines?.length > 0 && (
                            <div className="rounded-xl p-4" style={{ background: 'rgba(224,82,82,0.05)', border: '1px solid rgba(224,82,82,0.12)' }}>
                              <div className="flex items-center gap-2 mb-3">
                                <TrendingDown className="w-5 h-5" style={{ color: '#E05252' }} />
                                <span className="text-xs font-black uppercase tracking-wider" style={{ color: '#E05252' }}>Puntos de atención</span>
                              </div>
                              <div className="space-y-3">
                                {evolutionData.topDeclines.map((d: any, i: number) => (
                                  <div key={i}>
                                    <div className="flex items-center justify-between mb-0.5">
                                      <span className="text-sm font-bold text-soft">{d.area}</span>
                                      <span className="text-xs font-black" style={{ color: '#E05252' }}>{d.delta?.toFixed(1)}</span>
                                    </div>
                                    <p className="text-sm text-muted leading-relaxed">{d.insight}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}

                      {/* Critical Patterns */}
                      {evolutionData.criticalPatterns?.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                          className="rounded-xl p-4"
                          style={{ background: 'rgba(212,133,58,0.06)', border: '1px solid rgba(212,133,58,0.15)' }}
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <AlertTriangle className="w-4 h-4" style={{ color: '#D4853A' }} />
                            <span className="text-xs font-black uppercase tracking-wider" style={{ color: '#D4853A' }}>Patrones detectados</span>
                          </div>
                          <ul className="space-y-2">
                            {evolutionData.criticalPatterns.map((p: string, i: number) => (
                              <li key={i} className="text-sm text-soft leading-relaxed flex items-start gap-2">
                                <span className="text-xs mt-1" style={{ color: '#D4853A' }}>●</span>
                                {p}
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      )}

                      {/* Strategic Recommendation */}
                      {evolutionData.strategicRecommendation && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                          className="rounded-xl p-4"
                          style={{ background: 'var(--gold-08)', border: '1px solid rgba(201,168,76,0.2)' }}
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                            <span className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--gold)' }}>Recomendación estratégica</span>
                          </div>
                          <p className="text-sm text-soft leading-relaxed">{evolutionData.strategicRecommendation}</p>
                        </motion.div>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ── Timeline chart ── */}
      <HistoryChart attempts={attempts} currentId={currentId} />

      {/* ── Full history list ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-2xl p-6"
      >
        <h3 className="section-label mb-4">Historial de diagnósticos</h3>
        <div className="space-y-2">
          {attempts
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map(a => {
              const isCurrent   = a.id === currentId;
              const isConfirming = confirmDeleteId === a.id;
              return (
                <div
                  key={a.id}
                  className="rounded-xl px-4 py-3 transition-all"
                  style={{
                    background: isCurrent ? 'var(--gold-08)' : 'transparent',
                    border: isCurrent
                      ? '1px solid rgba(201,168,76,0.25)'
                      : isConfirming
                        ? '1px solid rgba(224,82,82,0.4)'
                        : '1px solid var(--surface-dim)',
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-pearl">{formatDate(a.createdAt)}</p>
                      {isCurrent && (
                        <span className="text-micro text-gold">Diagnóstico actual</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {a.globalScore != null && (
                        <span className="text-base font-black"
                          style={{ color: isCurrent ? 'var(--gold)' : 'var(--text-muted)' }}>
                          {a.globalScore.toFixed(1)}
                        </span>
                      )}
                      {/* Don't allow deleting the current attempt */}
                      {!isCurrent && (
                        <button
                          onClick={() => setConfirmDeleteId(a.id)}
                          className="p-1.5 rounded-lg transition-all opacity-40 hover:opacity-100"
                          style={{ color: 'var(--critico-fg)' }}
                          title="Eliminar diagnóstico"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </motion.div>

      {/* ── New survey CTA ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-2xl p-6"
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-black mb-0.5 text-pearl">¿Listo para medir tu crecimiento?</h3>
            <p className="text-xs text-muted">
              Repite el diagnóstico y verás cómo evolucionaste en el tiempo.
            </p>
          </div>
          <button
            onClick={() => router.push('/personal/diagnostico?new=true')}
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm transition-all"
            style={{
              background: 'var(--gold-glow-soft)',
              color:      'var(--gold-bright)',
              border:     '1px solid var(--gold-40)',
            }}
          >
            Nueva encuesta →
          </button>
        </div>
        {(() => {
          const lastAttempt = attempts
            .filter(a => a.status === 'COMPLETED')
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
          const days = lastAttempt
            ? Math.floor((Date.now() - new Date(lastAttempt.createdAt).getTime()) / (1000 * 60 * 60 * 24))
            : null;
          if (days === null) return null;
          const ready = days >= 30;
          return (
            <div
              className="rounded-xl px-4 py-2.5 mt-4"
              style={{
                background: ready ? 'rgba(91,168,122,0.08)' : 'rgba(201,168,76,0.06)',
                border: ready ? '1px solid rgba(91,168,122,0.2)' : '1px solid rgba(201,168,76,0.15)',
              }}
            >
              {ready ? (
                <p className="text-xs leading-relaxed" style={{ color: '#5BA87A' }}>
                  <strong>¡Buen momento!</strong> Han pasado {days} días desde tu último diagnóstico.
                </p>
              ) : (
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  Tu último diagnóstico fue hace {days} {days === 1 ? 'día' : 'días'}.
                  Los cambios más visibles suelen reflejarse a partir de los 30 días.
                </p>
              )}
            </div>
          );
        })()}
      </motion.div>

      {/* ── Confirm Delete Modal ── */}
      <AnimatePresence>
        {confirmDeleteId !== null && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'var(--overlay-medium)', backdropFilter: 'blur(12px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-sm glass rounded-2xl p-8 text-center"
              style={{ border: '1px solid rgba(224,82,82,0.2)' }}
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ background: 'rgba(224,82,82,0.1)', border: '1px solid rgba(224,82,82,0.3)' }}>
                <Trash2 className="w-7 h-7" style={{ color: '#E05252' }} />
              </div>

              <h2 className="text-lg font-black mb-3 font-display">¿Eliminar diagnóstico?</h2>
              
              <div
                className="rounded-xl px-4 py-3 mb-6 text-left"
                style={{
                  background: 'rgba(224,82,82,0.06)',
                  border: '1px solid rgba(224,82,82,0.15)',
                }}
              >
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-soft)' }}>
                  Esta acción no se puede deshacer. Las estadísticas y el <strong style={{ color: '#E05252' }}>informe de evolución</strong> asociados a este diagnóstico serán descartados.
                </p>
              </div>

              <button
                onClick={() => handleDelete(confirmDeleteId as string)}
                disabled={deleting}
                className="w-full py-3 rounded-xl font-black text-sm mb-2.5 transition-all flex items-center justify-center gap-2"
                style={{ background: '#E05252', color: '#fff', border: 'none', opacity: deleting ? 0.7 : 1 }}
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-transparent animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  'Sí, eliminar diagnóstico'
                )}
              </button>
              <button
                onClick={() => !deleting && setConfirmDeleteId(null)}
                disabled={deleting}
                className="w-full py-2.5 rounded-xl font-bold text-sm"
                style={{ background: 'var(--surface-subtle)', color: 'var(--text-muted)', border: '1px solid var(--surface-mid)' }}
              >
                Mantener diagnóstico
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
