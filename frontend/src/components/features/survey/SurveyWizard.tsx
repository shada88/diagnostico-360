"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Survey, Attempt } from "@/types";
import { surveyApi, authApi } from "@/lib/api";
import { QuestionCard } from "./QuestionCard";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, BrainCircuit, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { SURVEY_UI_TEXTS } from "@/lib/constants/ui-texts";

// ─────────────────────────────────────────────────────────────────────────────
// ANALYSIS LOADER — "La Expectativa" (dark + gold)
// ─────────────────────────────────────────────────────────────────────────────

const AnalysisLoader = () => {
  const [msgIdx, setMsgIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const msgT = setInterval(() =>
      setMsgIdx(p => p < SURVEY_UI_TEXTS.LOADING_MESSAGES.length - 1 ? p + 1 : p), 4500);

    const progT = setInterval(() =>
      setProgress(p => {
        if (p >= 95) return 95;
        return Math.min(p + (p > 80 ? 0.5 : p > 50 ? 1 : 2), 95);
      }), 600);

    return () => { clearInterval(msgT); clearInterval(progT); };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'var(--bg-space)' }}
    >
      <div className="max-w-md w-full px-6 text-center space-y-8">
        <div className="relative w-20 h-20 mx-auto">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full"
            style={{ border: '2px solid transparent', borderTopColor: 'var(--gold)', borderRightColor: 'var(--gold-dim)' }}
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-2 rounded-full"
            style={{ border: '1px solid transparent', borderTopColor: 'var(--gold-dim)' }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <BrainCircuit className="w-7 h-7" style={{ color: 'var(--gold)' }} />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold font-display text-pearl">
            Procesando resultados y generando tu diagnóstico...
          </h2>

          <div className="w-full h-1 rounded-full overflow-hidden"
            style={{ background: 'var(--surface-mid)' }}>
            <motion.div
              className="progress-gold h-1 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between text-xs font-bold uppercase tracking-wider"
            style={{ color: 'var(--text-muted)' }}>
            <span>Analizando</span>
            <span style={{ color: 'var(--gold)' }}>{Math.round(progress)}%</span>
          </div>

          <p className="text-xs pb-2" style={{ color: 'var(--text-muted)', borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
            El sistema está construyendo un reporte profundo exclusivamente para ti.{" "}
            <strong style={{ color: 'var(--text-soft)' }}>Esto puede tardar entre 1 y 2 minutos.</strong>{" "}
            Por favor, no cierres esta ventana.
          </p>

          <div className="min-h-[60px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={msgIdx}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.4 }}
                className="text-sm font-medium leading-relaxed px-4"
                style={{ color: 'var(--gold)' }}
              >
                {SURVEY_UI_TEXTS.LOADING_MESSAGES[msgIdx]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION COMPLETE OVERLAY
// ─────────────────────────────────────────────────────────────────────────────

const MOTIVATIONAL_PHRASES = [
  "¡Vas muy bien! Cada respuesta honesta construye tu diagnóstico.",
  "Has completado esta dimensión. Sigue avanzando.",
  "Estás cada vez más cerca de conocer tu diagnóstico integral.",
  "¡Excelente! La honestidad en cada respuesta es lo que hace poderoso este diagnóstico.",
  "Un paso más hacia una visión clara de tu realidad.",
];

interface SectionCompleteProps {
  sectionTitle: string;
  sectionIndex: number;
  totalSections: number;
}

const SectionComplete = ({ sectionTitle, sectionIndex, totalSections }: SectionCompleteProps) => {
  const phrase = MOTIVATIONAL_PHRASES[sectionIndex % MOTIVATIONAL_PHRASES.length];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="fixed inset-0 z-40 flex items-center justify-center"
      style={{ background: 'var(--bg-space)' }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 1.1, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="text-center px-8 max-w-sm"
      >
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid var(--gold)', boxShadow: '0 0 40px var(--gold-glow)' }}>
          <CheckCircle2 className="w-10 h-10" style={{ color: 'var(--gold)' }} />
        </div>
        <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
          Dimensión completada
        </p>
        <h2 className="text-2xl font-black mb-3 font-display text-pearl">
          {sectionTitle}
        </h2>
        <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--gold-dim)' }}>
          {phrase}
        </p>
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalSections }).map((_, i) => (
            <div key={i} className="rounded-full transition-all"
              style={{
                width: i < sectionIndex + 1 ? '20px' : '8px',
                height: '8px',
                background: i < sectionIndex + 1 ? 'var(--gold)' : 'var(--surface-raised)',
              }} />
          ))}
        </div>
        <p className="text-sm mt-3" style={{ color: 'var(--text-muted)' }}>
          {sectionIndex + 1} de {totalSections} dimensiones completadas
        </p>
      </motion.div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SURVEY WIZARD
// ─────────────────────────────────────────────────────────────────────────────

export default function SurveyWizard() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const forceNew     = searchParams.get('new') === 'true';

  const [loading, setLoading]               = useState(true);
  const [survey, setSurvey]                 = useState<Survey | null>(null);
  const [attempt, setAttempt]               = useState<Attempt | null>(null);
  const [currentSectionIndex, setSectionIdx] = useState(0);
  const [currentQuestionIndex, setQIdx]     = useState(0);
  const [answers, setAnswers]               = useState<Record<string, number>>({});
  const [submitting, setSubmitting]         = useState(false);
  const [isAnalyzing, setIsAnalyzing]       = useState(false);
  const [showSectionComplete, setShowSectionComplete] = useState(false);
  const [sectionCompleteData, setSectionCompleteData] = useState<{ title: string; index: number } | null>(null);
  const [showIntro, setShowIntro]           = useState(true);
  const [introIndex, setIntroIndex]         = useState(0);

  const autoAdvanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!loading && showIntro) {
      const t = setTimeout(() => {
        if (introIndex < SURVEY_UI_TEXTS.INTRO_PHRASES.length - 1) {
          setIntroIndex(p => p + 1);
        } else {
          setTimeout(() => setShowIntro(false), 3000);
        }
      }, 3500);
      return () => clearTimeout(t);
    }
  }, [loading, showIntro, introIndex]);

  useEffect(() => {
    async function init() {
      const token = localStorage.getItem("token");
      if (!token) { router.push("/login"); return; }
      try {
        const [profile, surveys] = await Promise.all([
          authApi.getProfile(),
          surveyApi.getSurveys(),
        ]);
        if (!profile.isProfileComplete) { router.replace("/auth/profile"); return; }
        // Only redirect to existing results if user didn't explicitly request a new survey
        if (!forceNew && profile.latestAttemptStatus === 'COMPLETED' && profile.latestAttemptId) {
          router.replace(`/personal/resultados/${profile.latestAttemptId}`); return;
        }
        if (surveys.length > 0) {
          setSurvey(surveys[0]);
          const a = await surveyApi.startAttempt(surveys[0].id);
          setAttempt(a);
        }
      } catch (err: any) {
        if (err?.response?.status === 401) { localStorage.removeItem("token"); router.push("/login"); }
        else console.error("Failed to load survey", err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [router]);

  // ── Submit current section & advance ──────────────────────────────────────

  const handleSubmitSection = async (sectionIdx: number, currentAnswers: Record<string, number>) => {
    if (!survey || !attempt) return;
    const section = survey.sections[sectionIdx];
    setSubmitting(true);
    try {
      await surveyApi.submitSectionAnswers(
        attempt.id,
        section.questions.map(q => ({ questionId: q.id, value: currentAnswers[q.id] }))
      );

      if (sectionIdx < survey.sections.length - 1) {
        // Freeze the overlay data before any index changes
        setSectionCompleteData({ title: section.title, index: sectionIdx });
        setShowSectionComplete(true);

        // Advance section/question while overlay is fully opaque — the user sees nothing
        setTimeout(() => {
          setSectionIdx(sectionIdx + 1);
          setQIdx(0);
          window.scrollTo(0, 0);
        }, 600);

        // Dismiss overlay — next question is already mounted and ready beneath it
        setTimeout(() => {
          setShowSectionComplete(false);
        }, 1800);
      } else {
        await handleFinalize();
      }
    } catch {
      alert("Hubo un error al guardar tus respuestas. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinalize = async () => {
    if (!attempt) return;
    setIsAnalyzing(true);
    try {
      await surveyApi.finalizeAttempt(attempt.id);
      router.push(`/personal/resultados/${attempt.id}`);
    } catch {
      setIsAnalyzing(false);
      alert("Hubo un error al generar tu diagnóstico. Intenta nuevamente.");
    }
  };

  // ── Auto-advance after answer selection ───────────────────────────────────

  const handleAnswerChange = (questionId: string, value: number) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);

    if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);

    autoAdvanceRef.current = setTimeout(() => {
      if (!survey) return;
      const section = survey.sections[currentSectionIndex];
      if (currentQuestionIndex < section.questions.length - 1) {
        // Next question in same section
        setQIdx(p => p + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Last question — submit section
        handleSubmitSection(currentSectionIndex, newAnswers);
      }
    }, 400);
  };

  // ── Back button ───────────────────────────────────────────────────────────

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
      setQIdx(p => p - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-space)' }}>
        <div className="text-sm font-bold uppercase tracking-widest animate-pulse" style={{ color: 'var(--gold)' }}>
          Preparando entorno...
        </div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="text-center py-20" style={{ color: 'var(--text-muted)' }}>
        No hay encuestas disponibles.
      </div>
    );
  }

  const currentSection  = survey.sections[currentSectionIndex];
  const totalSections   = survey.sections.length;
  const totalQuestions  = currentSection.questions.length;
  const currentQuestion = currentSection.questions[currentQuestionIndex];
  const globalProgress  = ((currentSectionIndex) / totalSections) * 100;

  return (
    <AnimatePresence mode="wait">

      {/* ── INTRO ── */}
      {showIntro ? (
        <motion.div
          key="intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -40, filter: "blur(10px)" }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="min-h-screen w-full flex items-center justify-center p-6 absolute inset-0 z-50"
          style={{ background: 'var(--bg-space)' }}
        >
          <button
            onClick={() => setShowIntro(false)}
            className="absolute top-6 right-6 text-sm font-medium px-4 py-2 rounded-full transition-colors"
            style={{ color: 'var(--text-muted)', border: '1px solid transparent' }}
          >
            Saltar intro
          </button>
          <AnimatePresence mode="wait">
            <motion.div
              key={introIndex}
              initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="text-center max-w-3xl"
            >
              <h2 className="text-3xl md:text-5xl font-black leading-tight font-display text-pearl">
                {SURVEY_UI_TEXTS.INTRO_PHRASES[introIndex]}
              </h2>
            </motion.div>
          </AnimatePresence>
        </motion.div>

      ) : (

        /* ── SURVEY ONE-BY-ONE ── */
        <motion.div
          key="survey"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
          className="min-h-screen py-12 px-4 md:px-8 relative overflow-hidden w-full"
          style={{ background: 'var(--bg-space)' }}
        >
          <AnimatePresence>
            {isAnalyzing && <AnalysisLoader />}
          </AnimatePresence>

          <AnimatePresence>
            {showSectionComplete && sectionCompleteData && (
              <SectionComplete
                sectionTitle={sectionCompleteData.title}
                sectionIndex={sectionCompleteData.index}
                totalSections={totalSections}
              />
            )}
          </AnimatePresence>

          <div className="max-w-2xl mx-auto">

            {/* Logo */}
            <div className="flex justify-between items-center mb-10">
              <div className="cursor-pointer" onClick={() => router.push('/')}>
                <Image
                  src="/logo.svg"
                  alt="Acme Consultores"
                  width={48}
                  height={37}
                  className="h-10 w-auto"
                  style={{ width: 'auto' }}
                />
              </div>
            </div>

            {/* ── Section progress (route interactiva) ── */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  {currentSection.title}
                </span>
                <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                  Sección {currentSectionIndex + 1} de {totalSections}
                </span>
              </div>

              {/* Sección dots */}
              <div className="flex items-center gap-2 mb-4">
                {survey.sections.map((s, i) => {
                  const done    = i < currentSectionIndex;
                  const current = i === currentSectionIndex;
                  return (
                    <div key={s.id} className="flex items-center gap-2">
                      <div
                        className="rounded-full transition-all duration-500 flex items-center justify-center"
                        style={{
                          width:      current ? '28px' : '10px',
                          height:     '10px',
                          background: done ? 'var(--gold)' : current ? 'var(--gold-bright)' : 'var(--surface-raised)',
                          border:     current ? '1px solid var(--gold)' : 'none',
                        }}
                      />
                      {i < totalSections - 1 && (
                        <div className="h-px flex-1 w-6 transition-all duration-500"
                          style={{ background: done ? 'var(--gold)' : 'var(--surface-mid)' }} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Question progress bar */}
              <div className="w-full h-[3px] rounded-full overflow-hidden"
                style={{ background: 'var(--surface-dim)' }}>
                <motion.div
                  className="progress-gold h-full rounded-full"
                  animate={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  Responde con honestidad · escala 1–10
                </span>
                <span className="text-[11px] font-bold" style={{ color: 'var(--gold-dim)' }}>
                  {currentQuestionIndex + 1} / {totalQuestions}
                </span>
              </div>
            </div>

            {/* ── Single Question ── */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`${currentSectionIndex}-${currentQuestionIndex}`}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <QuestionCard
                  key={currentQuestion.id}
                  id={currentQuestion.id}
                  index={currentQuestionIndex}
                  text={currentQuestion.text}
                  value={answers[currentQuestion.id]}
                  onChange={val => handleAnswerChange(currentQuestion.id, val)}
                  hasError={false}
                />
              </motion.div>
            </AnimatePresence>

            {/* ── Navigation ── */}
            <div className="mt-8 flex items-center justify-between gap-4"
              style={{ borderTop: '1px solid rgba(201,168,76,0.1)', paddingTop: '1.5rem' }}>

              {/* Back button */}
              {currentQuestionIndex > 0 ? (
                <button
                  onClick={handleBack}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all"
                  style={{
                    color: 'var(--text-muted)',
                    border: '1px solid var(--surface-mid)',
                    background: 'var(--surface-subtle)',
                  }}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </button>
              ) : (
                <div />
              )}

              {/* Status */}
              <div className="text-center">
                {submitting ? (
                  <div className="flex items-center gap-2" style={{ color: 'var(--gold)' }}>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-xs font-bold">Guardando...</span>
                  </div>
                ) : (
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {answers[currentQuestion.id]
                      ? 'Selecciona otro valor o espera para avanzar'
                      : 'Selecciona tu respuesta para avanzar'}
                  </p>
                )}
              </div>

              {/* Placeholder for alignment */}
              <div style={{ width: currentQuestionIndex > 0 ? 'auto' : '0' }} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
