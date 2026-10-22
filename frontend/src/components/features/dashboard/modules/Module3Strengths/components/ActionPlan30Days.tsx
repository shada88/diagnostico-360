'use client';

import { motion } from 'framer-motion';
import { Compass } from 'lucide-react';

interface ActionPlan30DaysProps {
  foundation:    string;
  tacticalSteps: string[];
}

/**
 * AI-generated 30-day tactical plan: guiding principle + EXACTLY 3 strategic steps.
 *
 * Big, premium type hierarchy — the user should be able to read this in under
 * 10 seconds and remember it. No fluff, no padding.
 */
export default function ActionPlan30Days({ foundation, tacticalSteps }: ActionPlan30DaysProps) {
  const steps = tacticalSteps.slice(0, 3);
  if (steps.length === 0 && !foundation) return null;

  return (
    <div
      className="rounded-2xl p-5 md:p-7"
      style={{ background: 'var(--gold-04)', border: '1px solid var(--gold-12)' }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Compass size={16} style={{ color: 'var(--gold)' }} />
        <p
          className="text-xs md:text-[13px] font-bold uppercase tracking-widest"
          style={{ color: 'var(--gold)' }}
        >
          Plan de los próximos 30 días
        </p>
      </div>

      {foundation && (
        <p
          className="text-base md:text-lg italic leading-relaxed mb-6"
          style={{ color: 'var(--text-pearl)' }}
        >
          &ldquo;{foundation}&rdquo;
        </p>
      )}

      {steps.length > 0 && (
        <ol className="space-y-4">
          {steps.map((step, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
              className="flex items-start gap-3.5"
            >
              <span
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base font-black"
                style={{
                  background: 'color-mix(in srgb, var(--gold) 14%, transparent)',
                  color: 'var(--gold)',
                  border: '1px solid color-mix(in srgb, var(--gold) 26%, transparent)',
                }}
              >
                {i + 1}
              </span>
              <p
                className="text-[15px] md:text-base leading-relaxed pt-1"
                style={{ color: 'var(--text-pearl)' }}
              >
                {step}
              </p>
            </motion.li>
          ))}
        </ol>
      )}
    </div>
  );
}
