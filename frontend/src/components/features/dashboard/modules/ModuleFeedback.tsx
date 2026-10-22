'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, ThumbsDown, Send } from 'lucide-react';

export default function ModuleFeedback() {
  const [feedback, setFeedback] = useState<'util' | 'no_util' | null>(null);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    // Aquí podrías agregar lógica para enviar a tu API
    // Por ahora, solo simular envío
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-12 mt-4 p-6 rounded-xl text-center glass border border-[var(--gold-20)]"
      >
        <p className="text-[var(--gold)] font-medium">¡Gracias por tu retroalimentación!</p>
        <p className="text-sm text-[var(--text-soft)] mt-1">Nos ayuda a seguir mejorando.</p>
      </motion.div>
    );
  }

  return (
    <div className="mb-12 mt-4 flex flex-col items-center">
      <p className="text-sm font-medium text-[var(--text-soft)] mb-4">
        ¿Qué te pareció este diagnóstico?
      </p>
      
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setFeedback('util')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl border transition-all ${
            feedback === 'util'
              ? 'border-[var(--excelente-fg)] bg-[var(--excelente-bg)] text-[var(--excelente-fg)]'
              : 'border-[var(--gold-20)] hover:border-[var(--gold)] text-[var(--text-muted)] hover:text-[var(--gold)]'
          }`}
        >
          <ThumbsUp size={18} />
          <span>Útil</span>
        </button>
        
        <button
          onClick={() => setFeedback('no_util')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl border transition-all ${
            feedback === 'no_util'
              ? 'border-[var(--riesgo-fg)] bg-[var(--riesgo-bg)] text-[var(--riesgo-fg)]'
              : 'border-[var(--gold-20)] hover:border-[var(--gold)] text-[var(--text-muted)] hover:text-[var(--gold)]'
          }`}
        >
          <ThumbsDown size={18} />
          <span>No útil</span>
        </button>
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="w-full max-w-md overflow-hidden"
          >
            <div className="relative">
              <textarea
                placeholder="¿Qué podríamos mejorar? (Opcional)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full bg-[var(--bg-card)] border border-[var(--gold-20)] rounded-xl p-4 pr-12 text-sm text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--gold)] transition-colors resize-none"
                rows={3}
              />
              <button
                onClick={handleSubmit}
                className="absolute bottom-3 right-3 p-2 rounded-lg bg-[var(--gold-12)] text-[var(--gold)] hover:bg-[var(--gold)] hover:text-[var(--bg-main)] transition-colors"
                title="Enviar feedback"
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
