'use client';

import { motion } from 'framer-motion';

const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface ScoreCircleProps {
  score: number;
  maturityColor: string;
  /** Tailwind width class (square via aspect-square). Default tuned for hero placement. */
  sizeClass?: string;
  /** Tailwind text-size classes for the score number. Default tuned for hero placement. */
  numberSizeClass?: string;
}

/**
 * Circular gauge that renders a 0-10 score with a maturity-colored gradient.
 *
 * Responsive by design: pass Tailwind classes to scale across breakpoints.
 * Numbers use Playfair display for editorial weight.
 */
export default function ScoreCircle({
  score,
  maturityColor,
  sizeClass = 'w-40 sm:w-48 md:w-56',
  numberSizeClass = 'text-5xl sm:text-6xl md:text-7xl',
}: ScoreCircleProps) {
  const offset = CIRCUMFERENCE - (score / 10) * CIRCUMFERENCE;
  const gradId = 'score-gauge-grad';

  return (
    <div className={`relative shrink-0 aspect-square ${sizeClass}`}>
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor={maturityColor} stopOpacity={0.35} />
            <stop offset="100%" stopColor={maturityColor} stopOpacity={1} />
          </linearGradient>
        </defs>

        <circle
          cx="60" cy="60" r={RADIUS} fill="none"
          stroke="rgba(201,168,76,0.08)" strokeWidth="6"
        />

        <motion.circle
          cx="60" cy="60" r={RADIUS} fill="none"
          stroke={`url(#${gradId})`} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          initial={{ strokeDashoffset: CIRCUMFERENCE }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.6, ease: 'easeOut', delay: 0.2 }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={`font-black leading-none ${numberSizeClass}`}
          style={{
            color: maturityColor,
            fontFamily: 'var(--font-playfair), serif',
          }}
        >
          {score.toFixed(1)}
        </span>
        <span
          className="text-[10px] sm:text-xs font-bold mt-1.5 uppercase tracking-widest"
          style={{ color: 'var(--text-muted)' }}
        >
          de 10
        </span>
      </div>
    </div>
  );
}
