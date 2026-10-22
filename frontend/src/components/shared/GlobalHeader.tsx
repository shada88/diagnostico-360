"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { User as UserIcon, LogOut, ChevronDown, History, Plus, BrainCircuit, LifeBuoy } from "lucide-react";
import ThemeToggle from "@/components/shared/ui/ThemeToggle";
import { config } from "@/lib/config";
import { authApi, dashboardApi, responsesApi, type AttemptSummary } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

// ─── View config ──────────────────────────────────────────────────────────────

type ViewMode = 'informe' | 'areas-clave' | 'evolucion';

const VIEW_LABELS: Record<ViewMode, string> = {
  'informe':     'Informe',
  'areas-clave': 'Áreas Clave',
  'evolucion':   'Evolución',
};

const ALL_VIEWS: ViewMode[] = ['informe', 'areas-clave', 'evolucion'];

// ─── History Dropdown ─────────────────────────────────────────────────────────

function formatShortDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('es', { day: '2-digit', month: 'short', year: '2-digit' });
}

function HistoryDropdown({ currentId, attempts, onSelect }: {
  currentId: string;
  attempts: AttemptSummary[];
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const completed = attempts
    .filter(a => a.status === 'COMPLETED')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (completed.length <= 1) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(p => !p)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
        style={{
          color:      'var(--text-soft)',
          background: 'var(--surface-dim)',
          border:     '1px solid var(--surface-raised)',
        }}
      >
        <History className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Historial</span>
        <ChevronDown
          className="w-3 h-3 transition-transform"
          style={{ transform: open ? 'rotate(180deg)' : 'none' }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute right-0 top-full mt-1.5 glass rounded-xl overflow-hidden z-50"
            style={{ minWidth: '200px', boxShadow: '0 8px 32px rgba(0,0,0,0.7)' }}
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
          >
            <p className="px-4 pt-3 pb-1 text-[9px] font-black uppercase tracking-widest"
              style={{ color: 'var(--text-muted)' }}>
              Diagnósticos anteriores
            </p>
            {completed.map((a, i) => (
              <button
                key={a.id}
                onClick={() => { onSelect(a.id); setOpen(false); }}
                className="w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors hover:bg-white/5"
                style={{
                  background: a.id === currentId ? 'var(--gold-08)' : 'transparent',
                  borderTop:  i === 0 ? 'none' : '1px solid var(--surface-dim)',
                }}
              >
                <span className="text-xs font-semibold"
                  style={{ color: a.id === currentId ? 'var(--gold)' : 'var(--text-soft)' }}>
                  {formatShortDate(a.createdAt)}
                </span>
                {a.globalScore != null && (
                  <span className="text-xs font-black"
                    style={{ color: a.id === currentId ? 'var(--gold)' : 'var(--text-muted)' }}>
                    {a.globalScore.toFixed(1)}/10
                  </span>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── New Diagnosis Modal ──────────────────────────────────────────────────────

function NewDiagnosisModal({
  onConfirm, onCancel, daysSinceLastDiag,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  daysSinceLastDiag: number | null;
}) {
  const isReady = daysSinceLastDiag === null || daysSinceLastDiag >= 30;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'var(--overlay-medium)', backdropFilter: 'blur(12px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-full max-w-sm glass rounded-2xl p-8 text-center"
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ background: 'var(--gold-12)', border: '1px solid var(--gold-30)' }}>
          <BrainCircuit className="w-7 h-7" style={{ color: 'var(--gold)' }} />
        </div>

        <h2 className="text-module-title mb-3">¿Comenzar un nuevo diagnóstico?</h2>
        <p className="text-sm leading-relaxed mb-4 text-soft">
          Tu diagnóstico actual quedará guardado en el historial. Podrás consultarlo en cualquier momento.
        </p>

        {/* Nota contextual según días transcurridos */}
        {daysSinceLastDiag !== null && (
          <div
            className="rounded-xl px-4 py-3 mb-5 text-left"
            style={{
              background: isReady ? 'rgba(91,168,122,0.08)' : 'rgba(201,168,76,0.06)',
              border: isReady ? '1px solid rgba(91,168,122,0.2)' : '1px solid rgba(201,168,76,0.15)',
            }}
          >
            {isReady ? (
              <p className="text-xs leading-relaxed" style={{ color: '#5BA87A' }}>
                <strong>¡Buen momento!</strong> Han pasado {daysSinceLastDiag} días desde tu último diagnóstico.
                Medir tu evolución ahora te dará una perspectiva clara de tu avance.
              </p>
            ) : (
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Tu último diagnóstico fue hace {daysSinceLastDiag} {daysSinceLastDiag === 1 ? 'día' : 'días'}.
                Puedes continuar sin problema — solo ten presente que los cambios más visibles
                suelen reflejarse a partir de los 30 días.
              </p>
            )}
          </div>
        )}

        <button
          onClick={onConfirm}
          className="w-full py-3 rounded-xl font-black text-sm mb-2.5 cursor-pointer transition-all"
          style={{ background: 'var(--gold)', color: '#1A1814', border: '1px solid var(--gold-bright)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--gold-bright)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--gold)')}
        >
          Comenzar nuevo →
        </button>
        <button
          onClick={onCancel}
          className="w-full py-2.5 rounded-xl font-bold text-sm"
          style={{ background: 'var(--surface-subtle)', color: 'var(--text-muted)', border: '1px solid var(--surface-mid)' }}
        >
          Cancelar
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL HEADER
// ─────────────────────────────────────────────────────────────────────────────

export default function GlobalHeader() {
  const pathname     = usePathname();
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [profile, setProfile]               = useState<any>(null);
  const [menuOpen, setMenuOpen]             = useState(false);
  const [userAttempts, setUserAttempts]     = useState<AttemptSummary[]>([]);
  const [showNewDiagModal, setShowNewDiagModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isAuthRoute   = pathname?.startsWith('/personal');
  const isHiddenRoute = pathname?.includes('/diagnostico');
  const isResultsPage = !!pathname?.match(/^\/personal\/resultados\/.+/);

  // Extract current attempt ID from pathname
  const attemptIdMatch = pathname?.match(/^\/personal\/resultados\/([^/]+)/);
  const currentAttemptId = attemptIdMatch?.[1] ?? '';

  const currentView = (searchParams.get('view') ?? 'informe') as ViewMode;

  useEffect(() => {
    if (!isAuthRoute) return;
    const token = localStorage.getItem("token");
    if (token) {
      authApi.getProfile()
        .then(data => setProfile(data))
        .catch(() => {});
    }
  }, [isAuthRoute]);

  useEffect(() => {
    if (!isResultsPage) return;
    responsesApi.getUserAttempts()
      .then(a => setUserAttempts(a))
      .catch(() => {});
  }, [isResultsPage]);

  // Refresh attempts list when EvolucionView deletes one
  useEffect(() => {
    if (!isResultsPage) return;
    const handler = () => {
      responsesApi.getUserAttempts()
        .then(a => setUserAttempts(a))
        .catch(() => {});
    };
    window.addEventListener('attempt-deleted', handler);
    return () => window.removeEventListener('attempt-deleted', handler);
  }, [isResultsPage]);

  if (!isAuthRoute || isHiddenRoute) return null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.replace('/login');
  };

  const handleViewChange = (view: string) => {
    router.push(`${pathname}?view=${view}`, { scroll: false });
  };

  const handleSelectAttempt = (id: string) => {
    router.push(`/personal/resultados/${id}`);
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b header-bg backdrop-blur-md"
        style={{ borderColor: 'rgba(201,168,76,0.18)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4 w-full">

            {/* Logo */}
            <div className="flex-1 flex items-center justify-start">
              <Link href="/personal/diagnostico" className="flex items-center gap-2">
                <Image
                  src="/logo.svg"
                  alt="Acme Consultores"
                  width={36}
                  height={28}
                  className="h-7 w-auto"
                  style={{ width: 'auto' }}
                />
              </Link>
            </div>

            {/* Nav — Desktop (solo en resultados) — central flow */}
            {isResultsPage && (
              <div className="hidden xl:flex flex-shrink-0 justify-center">
                <div className="flex p-1 rounded-xl gap-1"
                  style={{ background: 'var(--surface-subtle)', border: '1px solid var(--gold-glow-soft)' }}>
                  {ALL_VIEWS.map(view => (
                    <button
                      key={view}
                      onClick={() => handleViewChange(view)}
                      className="px-5 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap"
                      style={currentView === view
                        ? { background: 'var(--gold-glow-soft)', color: 'var(--gold)', border: '1px solid rgba(201,168,76,0.35)' }
                        : { color: 'var(--text-muted)' }}
                    >
                      {VIEW_LABELS[view]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Right actions — flex end */}
            <div className="flex-1 flex items-center justify-end gap-2">

              {/* Actions Toolbar (History + Nuevo) */}
              {isResultsPage && (
                <div className="flex items-center gap-1.5 px-1.5 py-1 rounded-xl"
                  style={{ background: 'var(--surface-dim)', border: '1px solid var(--surface-raised)' }}>
                  <HistoryDropdown
                    currentId={currentAttemptId}
                    attempts={userAttempts}
                    onSelect={handleSelectAttempt}
                  />
                  <div className="w-px h-4 bg-white/10 mx-0.5" />
                  <button
                    onClick={() => setShowNewDiagModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:bg-gold/10"
                    style={{
                      color: 'var(--gold)',
                    }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Nuevo</span>
                  </button>
                </div>
              )}

              {/* Profile */}
              <div ref={menuRef} className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="group flex items-center gap-2.5 p-1.5 pr-3 rounded-xl transition-all hover:bg-white/[0.03]"
                  style={{ border: '1px solid transparent' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(201,168,76,0.15)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'transparent')}
                >
                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm shadow-inner transition-transform group-hover:scale-105"
                    style={{ 
                      background: 'linear-gradient(135deg, var(--gold-glow-soft) 0%, var(--gold-12) 100%)', 
                      color: 'var(--gold)', 
                      border: '1px solid var(--gold-30)' 
                    }}>
                    {profile?.name ? profile.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                  </div>
                  <div className="hidden lg:flex flex-col items-start leading-tight">
                    <span className="text-[13px] font-bold truncate max-w-[130px]" style={{ color: 'var(--text-pearl)' }}>
                      {profile?.name || 'Cargando...'}
                    </span>
                    <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
                      Mi Cuenta
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:translate-y-0.5" style={{ color: 'var(--text-muted)' }} />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 rounded-xl shadow-2xl py-1 overflow-hidden z-50"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--gold-20)' }}>
                    <div className="px-4 py-3 lg:hidden" style={{ borderBottom: '1px solid var(--gold-10)' }}>
                      <p className="text-sm font-medium truncate text-pearl">{profile?.name}</p>
                      <p className="text-xs truncate text-muted">{profile?.email}</p>
                    </div>
                    <ThemeToggle variant="menu" />
                    <div style={{ borderTop: '1px solid var(--gold-08)' }}>
                      <a
                        href={`https://wa.me/${config.contact.support.number.replace('+', '')}?text=${encodeURIComponent("Hola Acme Consultores! Necesito soporte técnico con la plataforma (manejo de errores, más información, dudas o inquietudes).")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-colors"
                        style={{ color: 'var(--text-soft)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--gold-08)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <LifeBuoy className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                        Soporte Técnico
                      </a>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-colors"
                        style={{ color: '#EF4444' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <LogOut className="w-4 h-4" />
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile/Tablet Nav — solo en resultados */}
          {isResultsPage && (
            <div className="xl:hidden pb-3">
              <div className="flex gap-1 p-1 rounded-xl w-full"
                style={{ background: 'var(--surface-subtle)', border: '1px solid var(--gold-glow-soft)' }}>
                {ALL_VIEWS.map(view => (
                  <button
                    key={view}
                    onClick={() => handleViewChange(view)}
                    className="flex-1 py-1.5 rounded-lg text-xs font-bold transition-all"
                    style={currentView === view
                      ? { background: 'var(--gold-glow-soft)', color: 'var(--gold)' }
                      : { color: 'var(--text-muted)' }}
                  >
                    {VIEW_LABELS[view]}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* New Diagnosis Modal */}
      <AnimatePresence>
        {showNewDiagModal && (() => {
          const lastCompleted = userAttempts
            .filter(a => a.status === 'COMPLETED')
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
          const daysSince = lastCompleted
            ? Math.floor((Date.now() - new Date(lastCompleted.createdAt).getTime()) / (1000 * 60 * 60 * 24))
            : null;
          return (
            <NewDiagnosisModal
              onConfirm={() => { setShowNewDiagModal(false); router.push('/personal/diagnostico?new=true'); }}
              onCancel={() => setShowNewDiagModal(false)}
              daysSinceLastDiag={daysSince}
            />
          );
        })()}
      </AnimatePresence>
    </>
  );
}
