'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import ThemeToggle from '@/components/shared/ui/ThemeToggle';

// ─── Data ─────────────────────────────────────────────────────────────────────

const PAIN_POINTS = [
  { emoji: '🕐', text: 'Trabajas más que nunca pero el negocio no crece al mismo ritmo' },
  { emoji: '⚡', text: 'Tienes buenas ideas pero nunca hay tiempo ni energía para ejecutarlas' },
  { emoji: '🔒', text: 'Eres el cuello de botella de tu propia empresa — todo pasa por ti' },
  { emoji: '💸', text: 'Vendes, pero las finanzas siempre son una fuente de estrés y confusión' },
  { emoji: '🧩', text: 'Algo no está funcionando, pero no puedes identificar exactamente qué' },
  { emoji: '⚖️', text: 'Tu familia, tu fe y tu negocio viven en tensión permanente' },
];

const DIMENSIONS = [
  {
    id: 'D1', color: '#9B82CF', rgb: '155,130,207',
    title: 'Área Interna', sub: 'Fundamento',
    desc: 'Antes de evaluar tu negocio, evaluamos quién eres. Tu fundamento espiritual, tu disciplina y carácter, y tus relaciones determinan el techo de todo lo demás.',
    areas: ['Espiritual', 'Personal', 'Relacional'],
    insight: 'El nivel de crecimiento nunca supera el nivel de alineación interna.',
  },
  {
    id: 'D2', color: '#C9A84C', rgb: '201,168,76',
    title: 'Área del Negocio', sub: 'Estructura',
    desc: 'La radiografía operativa de cómo funcionás hoy. Las cinco columnas de un negocio real: propósito, finanzas, ventas, operación y marketing.',
    areas: ['Propósito y visión', 'Financiera', 'Ventas', 'Operación', 'Marketing'],
    insight: 'Una buena idea sin estructura es solo un proyecto sin futuro.',
  },
  {
    id: 'D3', color: '#5BA87A', rgb: '91,168,122',
    title: 'Área de Crecimiento', sub: 'Expansión',
    desc: 'Tu capacidad real de escalar. Si puedes delegar, liderar un equipo y planificar crecimiento sostenible sin que todo dependa de ti.',
    areas: ['Liderazgo y equipo', 'Planificación estratégica'],
    insight: 'Escalar sin liderazgo es solo hacer más de lo mismo con más estrés.',
  },
];

// Hex literals requeridos por el truco ${color}18 / ${color}30
const MATURITY_BADGES = [
  { l: '1', label: 'Crítico',    color: '#8B1A1A', range: '1–3', desc: 'Fallas graves que frenan el avance' },
  { l: '2', label: 'Riesgo',     color: '#C65D00', range: '4–5', desc: 'Inestabilidad que puede explotar pronto' },
  { l: '3', label: 'Estable',    color: '#8B7500', range: '6–7', desc: 'Funciona, pero con margen de mejora' },
  { l: '4', label: 'Competente', color: '#B8860B', range: '8–9', desc: 'Sólido y bien desarrollado' },
  { l: '5', label: 'Excelente',  color: '#D4AF37', range: '10',  desc: 'Referente, replicable' },
];

const STEPS = [
  {
    num: '01',
    title: 'Responde 30 afirmaciones',
    desc: 'No hay respuestas correctas ni incorrectas. Solo honestidad. El valor del diagnóstico es exactamente proporcional a tu nivel de honestidad.',
    detail: '~10 min · Escala del 1 al 10',
  },
  {
    num: '02',
    title: 'Recibí tu mapa 360°',
    desc: 'Un diagnóstico visual completo de tus 10 áreas clave con tu puntuación en la Escala de Madurez y las alertas prioritarias de tu negocio.',
    detail: 'Resultado inmediato · Sin esperas',
  },
  {
    num: '03',
    title: 'Actúa con dirección',
    desc: 'Vas a saber exactamente qué área atender primero, qué estás ignorando y qué tipo de acompañamiento necesitas para el siguiente nivel.',
    detail: 'Claridad total · Sin suposiciones',
  },
];

// ─── Radar Illustration ───────────────────────────────────────────────────────

function RadarIllustration() {
  const cx = 180, cy = 180, R = 140;
  const n = 10;
  const a0 = -Math.PI / 2;
  const step = (2 * Math.PI) / n;

  // Colors per area: D1 (purple), D2 (gold), D3 (green)
  const colors = [
    '#9B82CF', '#9B82CF', '#9B82CF',
    '#C9A84C', '#C9A84C', '#C9A84C', '#C9A84C', '#C9A84C',
    '#5BA87A', '#5BA87A',
  ];
  // Demo diagnostic values (0–1 fraction of R)
  const vals = [0.72, 0.50, 0.82, 0.64, 0.42, 0.76, 0.56, 0.68, 0.52, 0.74];

  const pt = (i: number, f: number) => ({
    x: cx + R * f * Math.cos(a0 + i * step),
    y: cy + R * f * Math.sin(a0 + i * step),
  });

  const outer = Array.from({ length: n }, (_, i) => pt(i, 1));
  const fill  = Array.from({ length: n }, (_, i) => pt(i, vals[i]));

  const poly = (ps: { x: number; y: number }[]) =>
    ps.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + 'Z';

  return (
    <svg viewBox="0 0 360 360" className="w-full" style={{ maxWidth: 420 }} aria-hidden>
      <defs>
        <radialGradient id="rg" cx="50%" cy="50%">
          <stop offset="0%"   stopColor="#C9A84C" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#9B82CF" stopOpacity="0.04" />
        </radialGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Grid rings */}
      {[0.25, 0.5, 0.75, 1].map(f => (
        <polygon
          key={f}
          points={Array.from({ length: n }, (_, i) => {
            const p = pt(i, f);
            return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
          }).join(' ')}
          fill="none"
          stroke="rgba(201,168,76,0.07)"
          strokeWidth="1"
        />
      ))}

      {/* Spokes */}
      {outer.map((p, i) => (
        <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y}
          stroke={colors[i]} strokeWidth="1" strokeOpacity="0.22" />
      ))}

      {/* Outer boundary */}
      <path d={poly(outer)} fill="none" stroke="rgba(201,168,76,0.15)" strokeWidth="1.5" />

      {/* Filled area */}
      <path d={poly(fill)} fill="url(#rg)"
        stroke="#C9A84C" strokeWidth="1.5" strokeOpacity="0.6" filter="url(#glow)" />

      {/* Dots on fill boundary */}
      {fill.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={5} fill={colors[i]} opacity={0.18} />
          <circle cx={p.x} cy={p.y} r={3} fill={colors[i]} />
        </g>
      ))}

      {/* Outer ring dots */}
      {outer.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={2} fill={colors[i]} opacity={0.3} />
      ))}

      {/* Center */}
      <circle cx={cx} cy={cy} r={12} fill="#C9A84C" opacity={0.07} />
      <circle cx={cx} cy={cy} r={4}  fill="#C9A84C" opacity={0.5} />
      <circle cx={cx} cy={cy} r={2}  fill="#C9A84C" />
    </svg>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const fadeUp = {
  initial:     { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport:    { once: true } as const,
  transition:  { duration: 0.5 },
};

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="absolute inset-x-0 top-0 z-50">
        <nav className="flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
          <Image src="/logo.svg" alt="Acme Consultores" width={52} height={40} className="h-10 w-auto" style={{ width: 'auto' }} />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login" className="text-sm font-semibold nav-link-muted hidden sm:block">
              Iniciar sesión
            </Link>
            <Link href="/register" className="btn-gold px-5 py-2.5 rounded-full text-sm font-bold">
              Empezar gratis
            </Link>
          </div>
        </nav>
      </header>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-24 pb-16 px-6">

        {/* Background glows */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-10 blur-3xl"
            style={{ background: 'radial-gradient(circle, var(--gold) 0%, transparent 70%)' }} />
          <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] rounded-full blur-3xl"
            style={{ background: 'radial-gradient(circle, #9B82CF 0%, transparent 70%)', opacity: 0.05 }} />
        </div>

        <div className="relative max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Text */}
          <div className="flex flex-col items-start">

            <motion.div {...fadeUp}
              className="mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-micro text-gold border border-gold-lg bg-[var(--gold-08)]">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-[var(--gold)]" />
              Diagnóstico 360° · Modelo 3D: Vida + Negocio + Crecimiento
            </motion.div>

            <motion.h1
              {...fadeUp} transition={{ duration: 0.5, delay: 0.08 }}
              className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-pearl">
              Sabes que puedes más.{' '}
              <em className="not-italic text-gold">El diagnóstico</em>{' '}
              te muestra dónde está el bloqueo.
            </motion.h1>

            <motion.p
              {...fadeUp} transition={{ duration: 0.5, delay: 0.15 }}
              className="text-lg leading-relaxed mb-5 text-soft max-w-lg">
              El Diagnóstico 360° evalúa quién eres, cómo operas y hasta dónde puedes llegar.{' '}
              <strong className="text-pearl">30 preguntas honestas.</strong> Un mapa completo de tu vida y tu negocio.
            </motion.p>

            <motion.blockquote
              {...fadeUp} transition={{ duration: 0.5, delay: 0.2 }}
              className="text-sm leading-relaxed mb-10 text-muted italic max-w-lg"
              style={{ borderLeft: '2px solid var(--gold-20)', paddingLeft: '1rem' }}>
              "Un negocio sólido se construye…<br />sobre un emprendedor en equilibrio."
            </motion.blockquote>

            <motion.div
              {...fadeUp} transition={{ duration: 0.5, delay: 0.27 }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Link
                href="/register"
                className="animate-breathe inline-flex items-center gap-2.5 px-8 py-4 rounded-full text-base font-bold text-gold border border-[var(--gold)]"
                style={{ background: 'linear-gradient(135deg, var(--gold-glow-soft), var(--gold-05))', letterSpacing: '0.02em' }}
              >
                Hacer mi diagnóstico — gratis
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/login" className="text-sm font-semibold nav-link-muted">
                Ya tengo cuenta →
              </Link>
            </motion.div>

            {/* Stats strip */}
            <motion.div
              {...fadeUp} transition={{ duration: 0.5, delay: 0.35 }}
              className="mt-10 flex items-center gap-6 pt-8"
              style={{ borderTop: '1px solid var(--gold-10)' }}>
              {[
                { val: '30',  label: 'preguntas'     },
                { val: '10',  label: 'áreas evaluadas' },
                { val: '3',   label: 'dimensiones'   },
                { val: '~10\'', label: 'para completarlo' },
              ].map((s, i) => (
                <div key={i} className="flex flex-col items-center gap-0.5">
                  <span className="text-xl font-black font-display text-gold">{s.val}</span>
                  <span className="text-[10px] text-muted whitespace-nowrap">{s.label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Radar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="flex flex-col items-center justify-center">
            <div className="relative w-full max-w-[420px]">
              <div className="absolute inset-0 rounded-full opacity-20 blur-2xl"
                style={{ background: 'radial-gradient(circle, var(--gold) 0%, transparent 60%)' }} />
              <RadarIllustration />
            </div>

            {/* Legend */}
            <div className="mt-3 flex items-center gap-5">
              {[
                { color: '#9B82CF', label: 'Interna'      },
                { color: '#C9A84C', label: 'Negocio'      },
                { color: '#5BA87A', label: 'Crecimiento'  },
              ].map(d => (
                <div key={d.label} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                  <span className="text-xs text-muted">{d.label}</span>
                </div>
              ))}
            </div>
            <p className="mt-1.5 text-[10px] text-muted" style={{ opacity: 0.5 }}>
              Ejemplo visual — tu resultado será único
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Pain Points ───────────────────────────────────────────────────── */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <motion.div {...fadeUp} className="text-center mb-12">
          <p className="section-label mb-3">¿Esto te suena familiar?</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-pearl mb-4">
            Si te reconoces en alguno de estos,<br className="hidden md:block" />
            este diagnóstico es exactamente para ti.
          </h2>
          <p className="text-soft max-w-xl mx-auto">
            No estás solo. Estos son los patrones más comunes en emprendedores que trabajan duro pero no están viendo los resultados que merecen.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PAIN_POINTS.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="glass rounded-2xl p-6 flex items-start gap-4"
            >
              <span className="text-2xl shrink-0 mt-0.5">{p.emoji}</span>
              <p className="text-sm leading-relaxed text-soft">{p.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── The Model 3D ──────────────────────────────────────────────────── */}
      <section className="px-6 py-20" style={{ background: 'var(--surface-subtle)' }}>
        <div className="max-w-6xl mx-auto">

          <motion.div {...fadeUp} className="text-center mb-12">
            <p className="section-label mb-3">El Modelo 3D</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-pearl mb-4">
              No evaluamos solo el negocio.<br className="hidden md:block" />
              Evaluamos al emprendedor completo.
            </h2>
            <p className="text-soft max-w-2xl mx-auto">
              Tres dimensiones interdependientes. Lo que pase en una, afecta a las otras. No son áreas aisladas — es un sistema en ciclo permanente.
            </p>
          </motion.div>

          {/* Interdependence note */}
          <motion.div {...fadeUp}
            className="mb-10 max-w-3xl mx-auto rounded-2xl p-6 text-center"
            style={{ background: 'var(--gold-04)', border: '1px solid var(--gold-10)' }}>
            <p className="text-sm text-muted leading-relaxed">
              <span className="text-pearl font-semibold">Lo interno impacta el negocio.</span>{' '}
              El negocio determina el crecimiento.{' '}
              <span className="text-pearl font-semibold">El crecimiento expone los límites internos.</span>
              {' '}Es un ciclo — y la brecha empieza donde menos la buscas.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {DIMENSIONS.map((d, i) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-2xl p-6 flex flex-col gap-4"
                style={{
                  background: `rgba(${d.rgb},0.05)`,
                  border:     `1px solid rgba(${d.rgb},0.2)`,
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shrink-0"
                    style={{ background: `rgba(${d.rgb},0.15)`, color: d.color, border: `1px solid rgba(${d.rgb},0.3)` }}>
                    {d.id}
                  </div>
                  <div>
                    <p className="font-black text-base text-pearl">{d.title}</p>
                    <p className="text-xs text-muted">{d.sub}</p>
                  </div>
                </div>

                <p className="text-sm leading-relaxed text-soft">{d.desc}</p>

                <div className="space-y-1.5">
                  {d.areas.map(a => (
                    <div key={a} className="flex items-center gap-2 text-xs text-muted">
                      <div className="w-1 h-1 rounded-full shrink-0" style={{ background: d.color }} />
                      {a}
                    </div>
                  ))}
                </div>

                <p
                  className="text-xs italic pt-3"
                  style={{ borderTop: `1px solid rgba(${d.rgb},0.12)`, color: d.color, opacity: 0.75 }}>
                  "{d.insight}"
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <section className="px-6 py-20 max-w-5xl mx-auto">
        <motion.div {...fadeUp} className="text-center mb-14">
          <p className="section-label mb-3">¿Cómo funciona?</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-pearl">
            Tres pasos. Diez minutos. Claridad total.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {STEPS.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="flex flex-col gap-3"
            >
              <span className="font-display text-5xl font-black text-gold" style={{ opacity: 0.28 }}>
                {s.num}
              </span>
              <h3 className="font-display text-lg font-bold text-pearl">{s.title}</h3>
              <p className="text-sm leading-relaxed text-soft">{s.desc}</p>
              <p className="text-micro text-muted">{s.detail}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── maturity Scale ───────────────────────────────────────────────────── */}
      <section className="px-6 py-20" style={{ background: 'var(--surface-subtle)' }}>
        <div className="max-w-5xl mx-auto">

          <motion.div {...fadeUp} className="text-center mb-12">
            <p className="section-label mb-3">Escala de Medición</p>
            <h2 className="font-display text-3xl font-bold text-pearl mb-4">La Escala de Madurez</h2>
            <p className="text-soft max-w-xl mx-auto">
              Cada área se califica del 1 al 10. Pero el objetivo no es "sacar nota" — es crear conciencia clara de tu estado real para poder actuar sobre él.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {MATURITY_BADGES.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="rounded-2xl p-5 text-center flex flex-col items-center gap-2"
                style={{ background: `${b.color}10`, border: `1px solid ${b.color}30` }}
              >
                <span className="font-display text-4xl font-black" style={{ color: b.color }}>{b.l}</span>
                <p className="font-bold text-sm" style={{ color: b.color }}>{b.label}</p>
                <p className="text-[10px] font-bold text-muted">{b.range}</p>
                <p className="text-xs text-muted leading-snug">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What you get ──────────────────────────────────────────────────── */}
      <section className="px-6 py-20 max-w-5xl mx-auto">
        <motion.div {...fadeUp} className="text-center mb-14">
          <p className="section-label mb-3">¿Qué vas a obtener?</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-pearl">
            Tres efectos que cambian el juego.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              num: '01', title: 'Visibilidad',
              accent: 'var(--gold)',
              desc: 'Vas a ver exactamente en qué estás. No en qué quieres estar — en qué estás hoy. Un mapa visual de las 10 áreas de tu vida y negocio, sin filtros.',
            },
            {
              num: '02', title: 'Conciencia',
              accent: '#9B82CF',
              desc: 'Vas a identificar qué áreas te están frenando aunque no lo hayas notado. Ponerles nombre es el primer paso para cambiarlas.',
            },
            {
              num: '03', title: 'Dirección',
              accent: '#5BA87A',
              desc: 'Vas a saber por dónde empezar. El diagnóstico no solo muestra dónde estás: prioriza qué atender primero.',
            },
          ].map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass rounded-2xl p-7 flex flex-col gap-4"
            >
              <span className="font-display text-4xl font-black" style={{ color: r.accent, opacity: 0.28 }}>
                {r.num}
              </span>
              <h3 className="font-display text-xl font-bold text-pearl">{r.title}</h3>
              <p className="text-sm leading-relaxed text-soft">{r.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Honesty block ─────────────────────────────────────────────────── */}
      <section className="px-6 py-20" style={{ background: 'var(--surface-subtle)' }}>
        <motion.div {...fadeUp} className="max-w-3xl mx-auto">
          <div className="glass rounded-3xl p-8 md:p-14 space-y-6"
            style={{ border: '1px solid var(--gold-20)' }}>

            <p className="section-label text-center">Antes de empezar</p>

            <blockquote className="font-display text-2xl md:text-3xl font-bold leading-snug text-pearl text-center">
              "No hay respuestas correctas…{' '}
              <em className="not-italic text-gold">solo respuestas honestas.</em>"
            </blockquote>

            <p className="text-soft text-center max-w-xl mx-auto">
              La calidad de tu diagnóstico depende directamente de tu nivel de honestidad. Responde lo que es real, no lo que quieres que sea real.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Risk */}
              <div className="rounded-xl p-4"
                style={{ background: 'rgba(139,26,26,0.08)', border: '1px solid rgba(139,26,26,0.22)' }}>
                <p className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: 'var(--critico-fg)' }}>
                  Si respondes por imagen
                </p>
                <ul className="space-y-1.5">
                  {['Autoengaño', 'Diagnóstico distorsionado', 'Planes mal diseñados', 'Estancamiento prolongado'].map(r => (
                    <li key={r} className="text-xs text-muted flex items-center gap-2">
                      <span style={{ color: 'var(--critico-fg)' }}>×</span> {r}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Benefit */}
              <div className="rounded-xl p-4"
                style={{ background: 'rgba(91,168,122,0.06)', border: '1px solid rgba(91,168,122,0.2)' }}>
                <p className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: 'var(--excelente-fg)' }}>
                  Si respondes con honestidad
                </p>
                <ul className="space-y-1.5">
                  {['Un mapa fiel de tu situación', 'Prioridades bien elegidas', 'Un plan de acción realista', 'Avances medibles en el tiempo'].map(b => (
                    <li key={b} className="text-xs text-muted flex items-center gap-2">
                      <span style={{ color: 'var(--excelente-fg)' }}>✓</span> {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────────── */}
      <section className="relative px-6 py-28 text-center overflow-hidden">

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
          <div className="w-[700px] h-[400px] rounded-full opacity-10 blur-3xl"
            style={{ background: 'radial-gradient(ellipse, var(--gold) 0%, transparent 70%)' }} />
        </div>

        <div className="relative max-w-3xl mx-auto space-y-8">

          <motion.p {...fadeUp} className="section-label">
            ¿Listo para saberlo?
          </motion.p>

          <motion.blockquote
            {...fadeUp} transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display text-3xl md:text-5xl font-bold leading-tight text-pearl">
            "Tu resultado no es una etiqueta…{' '}
            <em className="not-italic text-gold">es tu punto de partida.</em>"
          </motion.blockquote>

          <motion.p
            {...fadeUp} transition={{ duration: 0.5, delay: 0.18 }}
            className="text-soft max-w-lg mx-auto">
            30 afirmaciones. Diez minutos. El mapa más honesto que vas a tener de ti mismo como emprendedor.
          </motion.p>

          <motion.div
            {...fadeUp} transition={{ duration: 0.5, delay: 0.25 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="animate-breathe inline-flex items-center gap-2.5 px-10 py-4 rounded-full text-base font-bold text-gold border border-[var(--gold)]"
              style={{ background: 'linear-gradient(135deg, var(--gold-glow-soft), var(--gold-05))', letterSpacing: '0.02em' }}
            >
              Comenzar mi diagnóstico — es gratis
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>

          <motion.p
            {...fadeUp} transition={{ duration: 0.5, delay: 0.32 }}
            className="text-xs text-muted">
            Sin tarjeta de crédito · Sin compromisos · Resultado inmediato
          </motion.p>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="px-6 py-8" style={{ borderTop: '1px solid var(--gold-08)' }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Image src="/logo.svg" alt="Acme Consultores" width={40} height={32}
            className="h-8 w-auto opacity-60" style={{ width: 'auto' }} />
          <p className="text-xs text-muted">© 2025 Acme Consultores · Diagnóstico 360° del Emprendedor</p>
          <div className="flex items-center gap-4">
            <Link href="/login"    className="text-xs text-muted hover:text-soft transition-colors">Iniciar sesión</Link>
            <Link href="/register" className="text-xs text-muted hover:text-soft transition-colors">Registrarse</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
