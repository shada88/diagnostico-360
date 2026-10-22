'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { type Finding, CATEGORY_META, type FindingCategory } from '@/domain/findings';

// ─── Markdown renderer ───────────────────────────────────────────────────────

function Md({ children, inline = false, className = '' }: { children: string; inline?: boolean; className?: string }) {
  const Tag = inline ? 'span' : 'div';
  return (
    <ReactMarkdown
      components={{
        p:      ({ children: c }) => <Tag className={`leading-relaxed ${className}`}>{c}</Tag>,
        strong: ({ children: c }) => <strong className="font-bold" style={{ color: 'var(--text-pearl)' }}>{c}</strong>,
        em:     ({ children: c }) => <em className="italic">{c}</em>,
        ul:     ({ children: c }) => <ul className="space-y-1 list-none">{c}</ul>,
        li:     ({ children: c }) => (
          <li className="flex items-start gap-2">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 bg-current opacity-40" />
            <span>{c}</span>
          </li>
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
}

// ─── Icons ───────────────────────────────────────────────────────────────────

function ChevronIcon({ open, className = '' }: { open: boolean; className?: string }) {
  return (
    <motion.svg
      className={`w-4 h-4 shrink-0 ${className}`}
      fill="none" stroke="currentColor" viewBox="0 0 24 24"
      animate={{ rotate: open ? 180 : 0 }}
      transition={{ duration: 0.22 }}
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </motion.svg>
  );
}

const CATEGORY_ICONS: Record<FindingCategory, string> = {
  'critical-risk':
    'M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z',
  'attention-point':
    'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  'improvement-area':
    'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
  'strategic-strength':
    'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
};

interface FindingCardProps {
  finding: Finding;
  index:   number;
}

/**
 * Expandable finding card with progressive disclosure.
 *
 * Pulse glow is reserved for `critical-risk` findings while collapsed —
 * the constant urgency hint stops once the user opens the card (acknowledged).
 */
export default function FindingCard({ finding, index }: FindingCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const meta = CATEGORY_META[finding.category];
  const accentColor = `var(--${meta.colorVar})`;

  const isCritical = finding.category === 'critical-risk';
  const shouldPulse = isCritical && !expanded;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.1, ease: 'easeOut' }}
      className={`relative rounded-xl overflow-hidden transition-all duration-300 ${shouldPulse ? 'animate-urgent-glow' : ''}`}
      style={{
        background: expanded ? meta.bgOpacity : 'var(--surface-subtle)',
        border: `1px solid ${expanded
          ? `color-mix(in srgb, ${accentColor} 30%, transparent)`
          : 'var(--surface-dim)'}`,
        ...(shouldPulse ? {
          '--glow-color': accentColor,
          animationDelay: `${index * 1.2}s`,
        } as React.CSSProperties : {}),
      }}
    >
      <button
        onClick={() => setExpanded(prev => !prev)}
        className="w-full flex items-center gap-3 p-4 sm:p-5 text-left group"
      >
        <span
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300"
          style={{
            background: expanded
              ? `color-mix(in srgb, ${accentColor} 18%, transparent)`
              : 'var(--surface-dim)',
            color: expanded ? accentColor : 'var(--text-muted)',
            border: `1px solid ${expanded
              ? `color-mix(in srgb, ${accentColor} 30%, transparent)`
              : 'transparent'}`,
          }}
        >
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d={CATEGORY_ICONS[finding.category]} />
          </svg>
        </span>

        <div className="flex-1 min-w-0">
          <span
            className="text-[10px] font-bold uppercase tracking-wider transition-colors duration-300"
            style={{ color: expanded ? accentColor : 'var(--text-muted)' }}
          >
            {meta.emoji} {meta.label}
          </span>
          <h3
            className="text-sm sm:text-base font-bold leading-snug mt-0.5 truncate sm:whitespace-normal"
            style={{ color: 'var(--text-pearl)' }}
          >
            {finding.title}
          </h3>
        </div>

        <span
          className="transition-colors duration-300"
          style={{ color: expanded ? accentColor : 'var(--text-muted)' }}
        >
          <ChevronIcon open={expanded} />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-4 sm:px-5 pb-5 space-y-5">
              <div className="h-px" style={{ background: `color-mix(in srgb, ${accentColor} 25%, transparent)` }} />

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: accentColor }}>
                  Qué significa
                </p>
                <div className="text-sm text-soft">
                  <Md>{finding.meaning}</Md>
                </div>
                <div
                  className="mt-3 pl-3 text-sm font-semibold italic"
                  style={{
                    borderLeft: `2px solid color-mix(in srgb, ${accentColor} 50%, transparent)`,
                    color: 'var(--text-pearl)',
                  }}
                >
                  &ldquo;<Md inline>{finding.insight}</Md>&rdquo;
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: accentColor }}>
                  Impacto en tu vida y negocio
                </p>
                <ul className="space-y-2">
                  {finding.impact.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span
                        className="mt-[7px] w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: accentColor }}
                      />
                      <span className="text-sm leading-relaxed text-soft">
                        <Md>{item}</Md>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div
                className="rounded-lg overflow-hidden"
                style={{ border: `1px solid color-mix(in srgb, ${accentColor} 18%, transparent)` }}
              >
                <button
                  onClick={e => { e.stopPropagation(); setAlertOpen(p => !p); }}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left transition-colors duration-200"
                  style={{
                    background: alertOpen
                      ? `color-mix(in srgb, ${accentColor} 8%, transparent)`
                      : 'transparent',
                  }}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: accentColor }}>
                    Señal de alerta
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>
                    <ChevronIcon open={alertOpen} />
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {alertOpen && (
                    <motion.div
                      key="alert-body"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: 'easeInOut' }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div className="px-4 pb-3 text-sm text-soft italic">
                        <Md>{finding.alertSignal}</Md>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {finding.relatedAreas.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {finding.relatedAreas.map(area => (
                    <span
                      key={area}
                      className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                      style={{
                        color: 'var(--text-soft)',
                        background: 'var(--surface-subtle)',
                        border: '1px solid var(--surface-dim)',
                      }}
                    >
                      {area}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
