import { motion } from 'framer-motion';

interface QuestionCardProps {
  id: string;
  text: string;
  value?: number;
  onChange: (value: number) => void;
  index: number;
  hasError?: boolean;
}

// Button style per rating
const getButtonStyle = (rating: number, isSelected: boolean): React.CSSProperties => {
  if (!isSelected) return {
    background: 'var(--surface-subtle)',
    color: 'var(--text-muted)',
    border: '1px solid var(--surface-mid)',
  };

  const intensity = rating / 10;
  const goldBase  = `rgba(201,168,76,${0.15 + intensity * 0.35})`;
  const glowSize  = 4 + rating * 1.5;

  return {
    background: goldBase,
    color:      rating >= 7 ? 'var(--gold-bright)' : 'var(--gold)',
    border:     '1px solid var(--gold)',
    boxShadow:  `0 0 ${glowSize}px var(--gold-glow), 0 0 ${glowSize * 2}px var(--gold-glow-soft)`,
  };
};

const ROW_1 = [1, 2, 3, 4, 5];
const ROW_2 = [6, 7, 8, 9, 10];

export function QuestionCard({ id, text, value, onChange, index, hasError }: QuestionCardProps) {
  return (
    <motion.div
      id={`question-${id}`}
      initial={{ opacity: 0, y: 15 }}
      animate={
        hasError
          ? { opacity: 1, y: 0, x: [-4, 4, -4, 4, 0] as any }
          : { opacity: 1, y: 0, x: 0 }
      }
      transition={
        hasError
          ? { duration: 0.4 }
          : { duration: 0.4, delay: index * 0.08, ease: "easeOut" }
      }
      className="glass glass-hover rounded-2xl p-6 transition-all duration-300"
      style={hasError ? {
        borderColor: '#C65D00',
        boxShadow: '0 0 20px rgba(198,93,0,0.2)',
      } : {}}
    >
      {/* Question text */}
      <div className="flex gap-4 mb-7">
        <span className="font-mono text-sm pt-0.5 shrink-0"
          style={{ color: hasError ? '#C65D00' : 'var(--text-muted)' }}>
          {index + 1}.
        </span>
        <h3 className="text-base md:text-lg font-medium leading-snug"
          style={{ color: hasError ? '#E8C665' : 'var(--text-pearl)' }}>
          {text}
        </h3>
      </div>

      {/* ── 2-row magnetic scale ── */}
      <div className="space-y-2">

        {/* Row 1: 1–5 */}
        <div className="grid grid-cols-5 gap-2">
          {ROW_1.map(rating => (
            <motion.button
              key={rating}
              onClick={() => onChange(rating)}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.93 }}
              className="flex items-center justify-center rounded-xl font-black text-base min-h-[44px] transition-all duration-200"
              style={getButtonStyle(rating, value === rating)}
            >
              {rating}
            </motion.button>
          ))}
        </div>
        <div className="flex justify-between px-1">
          <span className="text-[11px] font-bold" style={{ color: 'var(--text-muted)' }}>1 · Muy bajo</span>
          <span className="text-[11px] font-bold" style={{ color: 'var(--text-muted)' }}>5 · Medio</span>
        </div>

        {/* Row 2: 6–10 */}
        <div className="grid grid-cols-5 gap-2 mt-1">
          {ROW_2.map(rating => (
            <motion.button
              key={rating}
              onClick={() => onChange(rating)}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.93 }}
              className="flex items-center justify-center rounded-xl font-black text-base min-h-[44px] transition-all duration-200"
              style={getButtonStyle(rating, value === rating)}
            >
              {rating}
            </motion.button>
          ))}
        </div>
        <div className="flex justify-end px-1">
          <span className="text-[11px] font-bold" style={{ color: 'var(--gold-dim)' }}>10 · Excelente</span>
        </div>

      </div>
    </motion.div>
  );
}
