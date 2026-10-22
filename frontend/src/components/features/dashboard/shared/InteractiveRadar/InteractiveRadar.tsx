'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RadarChart as RechartsRadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip,
} from 'recharts';
import { MousePointer2 } from 'lucide-react';
import type { MaturityLevel, RadarPoint } from '@/types/dashboard';
import { getAreaByLabel } from '../../data/areas';
import RadarTooltip from './RadarTooltip';
import RadarAreaDetailPanel from './RadarAreaDetailPanel';

const CRITICAL_LEVELS: ReadonlySet<MaturityLevel> = new Set<MaturityLevel>(['CRITICO', 'RIESGO']);

interface InteractiveRadarProps {
  radar: RadarPoint[];
  /** Per-area AI insights keyed by area key (SPIRITUAL, PERSONAL, ...). Optional. */
  areaInsights?: Record<string, string>;
}

interface ChartPoint {
  subject:    string;
  score:      number;
  maturityLabel: string;
  maturityColor: string;
  maturityLevel: MaturityLevel;
}

/**
 * Interactive 10-area radar chart.
 *
 * Behavior:
 * - Critical / Riesgo nodes pulse persistently until the user has interacted
 *   with them at least once (per the rediseño dashboard contract: "áreas
 *   críticas resaltadas constantemente hasta que el usuario interactúe").
 * - Tapping a dot OR its surrounding label toggles an inline detail panel
 *   below the chart.
 * - Tooltip on hover shows the score + maturity level only (no dimension labels).
 */
export default function InteractiveRadar({ radar, areaInsights }: InteractiveRadarProps) {
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [touchedLabels, setTouchedLabels] = useState<ReadonlySet<string>>(new Set());

  // ── Project radar data into the shape Recharts expects ────────────────────
  const chartData = useMemo<ChartPoint[]>(
    () => radar.map(r => ({
      subject:    r.label,
      score:      r.score,
      maturityLabel: r.maturity.label,
      maturityColor: r.maturity.color,
      maturityLevel: r.maturity.level,
    })),
    [radar],
  );

  const handleSelect = useCallback((label: string) => {
    setSelectedLabel(prev => (prev === label ? null : label));
    setTouchedLabels(prev => {
      if (prev.has(label)) return prev;
      const next = new Set(prev);
      next.add(label);
      return next;
    });
  }, []);

  const selectedPoint = useMemo(
    () => radar.find(p => p.label === selectedLabel) ?? null,
    [radar, selectedLabel],
  );

  // ── Custom dot — handles selection ring, pulse, and tap target ───────────
  const renderDot = useCallback(
    // Recharts injects geometric props at render time; payload shape matches chartData
    (props: { cx?: number; cy?: number; payload?: ChartPoint }) => {
      const { cx, cy, payload } = props;
      if (cx == null || cy == null || !payload) return <g />;

      const isCritical = CRITICAL_LEVELS.has(payload.maturityLevel);
      const isTouched  = touchedLabels.has(payload.subject);
      const isSelected = selectedLabel === payload.subject;
      const shouldPulse = isCritical && !isTouched;
      const color = payload.maturityColor;

      return (
        <g
          key={`dot-${payload.subject}`}
          style={{ cursor: 'pointer' }}
          onClick={() => handleSelect(payload.subject)}
        >
          {shouldPulse && (
            <motion.circle
              cx={cx} cy={cy} fill="none" stroke={color} strokeWidth={2}
              initial={{ r: 5, opacity: 0.75 }}
              animate={{ r: [5, 13, 5], opacity: [0.75, 0, 0.75] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
          {isSelected && (
            <circle cx={cx} cy={cy} r={9} fill="none" stroke={color} strokeWidth={2} opacity={0.85} />
          )}
          {/* Invisible expanded tap target for touch devices (≥36px) */}
          <circle cx={cx} cy={cy} r={20} fill="transparent" style={{ pointerEvents: 'all' }} />
          <circle
            cx={cx} cy={cy} r={isSelected ? 9 : 7}
            fill={color}
            stroke="#fff" strokeWidth={isSelected ? 2 : 1}
            style={{ pointerEvents: 'all' }}
          />
        </g>
      );
    },
    [handleSelect, selectedLabel, touchedLabels],
  );

  // ── Custom axis tick — clickable area labels ─────────────────────────────
  const renderTick = useCallback(
    (props: { x?: number; y?: number; payload?: { value?: string }; textAnchor?: string }) => {
      const { x, y, payload, textAnchor } = props;
      const value = payload?.value;
      if (x == null || y == null || !value) return <g />;

      const point = chartData.find(p => p.subject === value);
      if (!point) return <g />;

      const isSelected = selectedLabel === value;
      const isCritical = CRITICAL_LEVELS.has(point.maturityLevel);
      const isTouched  = touchedLabels.has(value);
      const shouldPulse = isCritical && !isTouched;

      const fillColor = isSelected ? point.maturityColor : 'var(--text-soft)';

      return (
        <g
          style={{ cursor: 'pointer' }}
          onClick={() => handleSelect(value)}
        >
          {/* Expanded tap target so labels are easy to hit on mobile */}
          <rect
            x={x - 60} y={y - 14}
            width={120} height={28}
            fill="transparent"
            style={{ pointerEvents: 'all' }}
          />
          <motion.text
            x={x} y={y} dy={4}
            textAnchor={textAnchor}
            fontSize={isSelected ? 12 : 11}
            fontWeight={isSelected ? 800 : 600}
            fill={fillColor}
            initial={false}
            animate={shouldPulse ? { opacity: [0.6, 1, 0.6] } : { opacity: 1 }}
            transition={shouldPulse ? { duration: 2.2, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.2 }}
          >
            {value}
          </motion.text>
        </g>
      );
    },
    [chartData, handleSelect, selectedLabel, touchedLabels],
  );

  const hasUntouchedCritical = chartData.some(
    p => CRITICAL_LEVELS.has(p.maturityLevel) && !touchedLabels.has(p.subject),
  );

  return (
    <div className="w-full">
      {/* ── Chart ──────────────────────────────────────────────────────── */}
      {/* Polygon fill is non-interactive so it doesn't steal taps from the dots/labels */}
      <div className="h-80 sm:h-96 md:h-[28rem] [&_.recharts-polygon]:!pointer-events-none [&_.recharts-radar-polygon]:!pointer-events-none">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <RechartsRadarChart data={chartData} cx="50%" cy="50%" outerRadius="72%">
            <PolarGrid stroke="var(--radar-grid)" />
            <PolarAngleAxis
              dataKey="subject"
              tick={renderTick}
              tickLine={false}
            />
            <PolarRadiusAxis angle={90} domain={[0, 10]} tick={false} axisLine={false} />
            <Tooltip content={<RadarTooltip />} />
            <Radar
              name="Score" dataKey="score"
              stroke="var(--gold)" fill="var(--gold)" fillOpacity={0.15} strokeWidth={2}
              dot={renderDot}
              isAnimationActive={false}
            />
          </RechartsRadarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Inline detail panel ──────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {selectedPoint && (
          <RadarAreaDetailPanel
            point={selectedPoint}
            insight={(() => {
              const key = getAreaByLabel(selectedPoint.label)?.key;
              return key ? areaInsights?.[key] : undefined;
            })()}
            onClose={() => setSelectedLabel(null)}
          />
        )}
      </AnimatePresence>

      {/* ── Helper hint — always visible so the interaction stays discoverable */}
      <div
        className="flex items-center justify-center gap-2 mt-3 text-[11px] italic"
        style={{ color: hasUntouchedCritical ? 'var(--riesgo-fg)' : 'var(--text-muted)' }}
      >
        <MousePointer2 size={12} />
        <span>
          {hasUntouchedCritical
            ? 'Toca las áreas que pulsan para ver su detalle'
            : 'Toca cualquier área del radar para explorarla'}
        </span>
      </div>
    </div>
  );
}
