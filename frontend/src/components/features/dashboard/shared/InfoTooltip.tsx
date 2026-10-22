'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info } from 'lucide-react';

interface InfoTooltipProps {
  content: React.ReactNode;
}

/**
 * Small ⓘ trigger that surfaces helper text.
 *
 * Behavior: hover on desktop, tap-toggle on touch devices, outside click closes.
 * Renders absolutely positioned above the trigger so it doesn't push layout.
 */
export default function InfoTooltip({ content }: InfoTooltipProps) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!visible) return;
    function handleOutside(e: MouseEvent | TouchEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setVisible(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, [visible]);

  return (
    <div ref={ref} className="relative inline-flex shrink-0">
      <button
        type="button"
        aria-label="Información"
        className="flex items-center justify-center w-4 h-4 rounded-full transition-opacity opacity-40 hover:opacity-100 focus:opacity-100"
        style={{ color: 'var(--gold)' }}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onClick={() => setVisible(v => !v)}
      >
        <Info size={14} />
      </button>

      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute z-30 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 rounded-xl"
            style={{
              background: 'var(--tooltip-bg)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(201,168,76,0.25)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            }}
          >
            <div className="text-xs leading-relaxed" style={{ color: '#E8E5DF' }}>
              {content}
            </div>
            <div
              className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0"
              style={{
                borderLeft: '5px solid transparent',
                borderRight: '5px solid transparent',
                borderTop: '5px solid rgba(14,14,26,0.97)',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
