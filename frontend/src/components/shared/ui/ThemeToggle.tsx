'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/lib/theme';

interface ThemeToggleProps {
  /** `icon` — botón circular para navbars públicas. `menu` — ítem de texto para dropdown de perfil. */
  variant?: 'icon' | 'menu';
}

export default function ThemeToggle({ variant = 'icon' }: ThemeToggleProps) {
  const { theme, toggle } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Placeholder para evitar hydration mismatch entre SSR y cliente.
  if (!mounted) {
    return variant === 'icon' ? <div className="w-9 h-9 shrink-0" /> : null;
  }

  const isLight = theme === 'light';
  const label   = isLight ? 'Modo Oscuro' : 'Modo Claro';
  const Icon    = isLight ? Moon : Sun;

  if (variant === 'menu') {
    return (
      <button
        onClick={toggle}
        className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-colors"
        style={{ color: 'var(--text-soft)', background: 'transparent' }}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-subtle)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        <Icon className="w-4 h-4" />
        {label}
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center justify-center w-9 h-9 rounded-lg transition-all shrink-0"
      style={{ color: 'var(--text-muted)', border: '1px solid transparent', background: 'transparent' }}
      onMouseEnter={e => {
        e.currentTarget.style.color      = 'var(--gold)';
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.background  = 'var(--surface-subtle)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.color      = 'var(--text-muted)';
        e.currentTarget.style.borderColor = 'transparent';
        e.currentTarget.style.background  = 'transparent';
      }}
      title={label}
      aria-label={label}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}
