'use client';

import { useState, type ComponentType } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

type IconComponent = ComponentType<{ size?: number; className?: string }>;

interface CollapsibleSectionProps {
  icon: IconComponent;
  title: string;
  children: React.ReactNode;
  /** Whether the section is open on first render. Defaults to false (collapsed). */
  defaultOpen?: boolean;
}

/**
 * Accessible accordion section with smooth height animation.
 *
 * Wraps long-form explanatory content (educational text, scales) so the
 * dashboard stays scannable while keeping the info one click away.
 */
export default function CollapsibleSection({
  icon: Icon,
  title,
  children,
  defaultOpen = false,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: '1px solid rgba(201,168,76,0.15)' }}
    >
      <button
        type="button"
        aria-expanded={open}
        className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
        style={{ background: open ? 'rgba(201,168,76,0.06)' : 'transparent' }}
        onClick={() => setOpen(v => !v)}
      >
        <div
          className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0"
          style={{ background: 'rgba(201,168,76,0.1)', color: 'var(--gold)' }}
        >
          <Icon size={14} />
        </div>
        <span className="flex-1 text-sm font-semibold" style={{ color: 'var(--text-soft)' }}>
          {title}
        </span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div
              className="px-4 pb-4 pt-2"
              style={{ borderTop: '1px solid rgba(201,168,76,0.08)' }}
            >
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
