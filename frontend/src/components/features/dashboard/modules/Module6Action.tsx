'use client';

import { motion } from 'framer-motion';
import { config } from '@/lib/config';

interface Module6ActionProps {
  mentorshipTransitionText?: string;
  attemptId: string;
}

const whatsappNumber = config.contact.sales.number.replace('+', '');
const message = encodeURIComponent(
  '¡Hola! Acabo de ver mi diagnóstico y quiero agendar mi cita con un coach para empezar a accionar.',
);
const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

const FALLBACK_TRANSITION =
  'El diagnóstico es solo el primer paso. Para romper tus techos de crecimiento y estabilizar tu negocio necesitas un plan claro y acompañamiento experto.';

function IconWhatsApp() {
  return (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

/**
 * Final-CTA module — converts the diagnostic into a booked coach session.
 *
 * Receives only the AI-generated `mentorshipTransitionText` (with a static
 * fallback). Action plan + conclusive diagnosis now live in Module3Strengths.
 */
export default function Module6Action({ mentorshipTransitionText }: Module6ActionProps) {
  return (
    <motion.section
      id="modulo-cierre"
      className="mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <p className="section-label mb-4">Tu Próximo Paso</p>

      <div className="glass glass-hover rounded-2xl overflow-hidden relative border-[var(--gold)] border-2">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--gold-04)] to-transparent pointer-events-none" />

        <div className="px-6 sm:px-8 py-10 flex flex-col items-center text-center relative z-10">
          <h2
            className="text-2xl md:text-3xl font-black mb-4"
            style={{
              color: 'var(--gold-bright)',
              textShadow: '0 2px 4px rgba(0,0,0,0.5)',
              fontFamily: 'var(--font-playfair), serif',
            }}
          >
            Convierte este diagnóstico en acción
          </h2>

          <p className="text-base md:text-lg max-w-2xl mb-8 leading-relaxed" style={{ color: 'var(--text-soft)' }}>
            {mentorshipTransitionText?.trim() || FALLBACK_TRANSITION}
          </p>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="animate-breathe inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-black text-base sm:text-lg w-full sm:w-auto transition-all hover:scale-105 shadow-xl hover:shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, #25D366 0%, #1EB558 100%)',
              color: '#ffffff',
            }}
          >
            <IconWhatsApp />
            Agendar cita con un coach
          </a>

          <p className="text-sm mt-5 italic" style={{ color: 'var(--text-muted)' }}>
            Sesión inicial gratuita. Cupos limitados.
          </p>
        </div>
      </div>
    </motion.section>
  );
}
