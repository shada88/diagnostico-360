'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { authApi } from '@/lib/api';
import SearchableSelect from '../../shared/ui/SearchableSelect';
import { countries } from '@/lib/countries';
import { citiesByCountry } from '@/lib/cities';

const countryOptions = countries.map(c => ({
  label: c.name,
  value: c.iso,
  description: c.dialCode,
}));

interface FormState {
  name: string;
  businessName: string;
  countryIso: string;
  city: string;
  phoneRaw: string;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="section-label block">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.625rem 1rem',
  borderRadius: '0.75rem',
  background: 'var(--surface-subtle)',
  border: '1px solid rgba(201,168,76,0.18)',
  color: 'var(--text-pearl)',
  fontSize: '0.875rem',
  outline: 'none',
  transition: 'border-color 0.2s',
};

export default function ProfileForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState<FormState>({
    name: '',
    businessName: '',
    countryIso: '',
    city: '',
    phoneRaw: '',
  });

  // Guard: if profile is already complete, redirect away immediately.
  // This prevents re-editing data by navigating back in the browser.
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.replace('/login'); return; }

    authApi.getProfile().then(profile => {
      if (profile.isProfileComplete) {
        if (profile.latestAttemptStatus === 'COMPLETED' && profile.latestAttemptId) {
          router.replace(`/personal/resultados/${profile.latestAttemptId}`);
        } else {
          router.replace('/personal/diagnostico');
        }
      }
    }).catch(() => {
      // If we can't verify, let the user see the form (API errors are handled at submit time)
    });
  }, [router]);

  const selectedCountry = countries.find(c => c.iso === form.countryIso);

  // Rebuild city options whenever the selected country changes.
  // Reset city selection when the country changes.
  const cityOptions = useMemo(() => {
    const cities = citiesByCountry[form.countryIso] ?? [];
    return cities.map(c => ({ label: c, value: c }));
  }, [form.countryIso]);

  const handleCountryChange = (iso: string) => {
    setForm(prev => ({ ...prev, countryIso: iso, city: '' }));
  };

  const handleChange = (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);

    try {
      const phoneNumber = selectedCountry
        ? `${selectedCountry.dialCode} ${form.phoneRaw}`.trim()
        : form.phoneRaw;

      await authApi.updateProfile({
        name:         form.name,
        businessName: form.businessName,
        country:      selectedCountry?.name ?? '',
        countryCode:  form.countryIso,
        city:         form.city,
        phoneNumber,
        timezone:     Intl.DateTimeFormat().resolvedOptions().timeZone,
      });

      router.replace('/personal/diagnostico');
    } catch {
      setError('No se pudo guardar el perfil. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <motion.div
      className="w-full max-w-lg mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="glass rounded-2xl overflow-hidden">

        {/* Header */}
        <div className="px-8 py-6" style={{ borderBottom: '1px solid var(--gold-12)' }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-module-title">Completa tu Perfil</h2>
              <p className="text-xs mt-1 text-muted">
                Necesitamos algunos datos para personalizar tu diagnóstico
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="text-xs font-bold transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-7 space-y-5">

          {/* Name */}
          <Field label="Nombre Completo">
            <input
              required
              placeholder="Juan Pérez"
              value={form.name}
              onChange={handleChange('name')}
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = 'rgba(201,168,76,0.5)')}
              onBlur={e  => (e.target.style.borderColor = 'rgba(201,168,76,0.18)')}
            />
          </Field>

          {/* Business name */}
          <Field label="Nombre del Negocio">
            <input
              required
              placeholder="Mi Empresa SAS"
              value={form.businessName}
              onChange={handleChange('businessName')}
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = 'rgba(201,168,76,0.5)')}
              onBlur={e  => (e.target.style.borderColor = 'rgba(201,168,76,0.18)')}
            />
          </Field>

          {/* Country */}
          <Field label="País">
            <SearchableSelect
              options={countryOptions}
              value={form.countryIso}
              onChange={handleCountryChange}
              placeholder="Busca tu país..."
            />
          </Field>

          {/* City — only shown after a country is selected */}
          {form.countryIso && (
            <Field label="Ciudad">
              <SearchableSelect
                options={cityOptions}
                value={form.city}
                onChange={city => setForm(prev => ({ ...prev, city }))}
                placeholder="Seleccioná tu ciudad..."
              />
            </Field>
          )}

          {/* Phone */}
          <Field label="Teléfono">
            <div className="flex gap-2">
              {/* Dial code badge */}
              <div
                className="flex items-center justify-center px-3 rounded-xl text-sm font-bold shrink-0 min-w-[3.5rem]"
                style={{
                  background: 'var(--surface-subtle)',
                  border: '1px solid rgba(201,168,76,0.18)',
                  color: selectedCountry ? 'var(--gold)' : 'var(--text-muted)',
                }}
              >
                {selectedCountry ? selectedCountry.dialCode : '+?'}
              </div>
              <input
                required
                type="tel"
                placeholder="300 123 4567"
                value={form.phoneRaw}
                onChange={e => setForm(prev => ({
                  ...prev,
                  phoneRaw: e.target.value.replace(/[^\d\s]/g, ''),
                }))}
                style={{ ...inputStyle, flex: 1 }}
                onFocus={e => (e.target.style.borderColor = 'rgba(201,168,76,0.5)')}
                onBlur={e  => (e.target.style.borderColor = 'rgba(201,168,76,0.18)')}
              />
            </div>
          </Field>

          {/* Error */}
          {error && (
            <p className="text-xs px-4 py-3 rounded-xl"
              style={{
                color: 'var(--critico-fg)',
                background: 'rgba(139,26,26,0.1)',
                border: '1px solid rgba(139,26,26,0.3)',
              }}>
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-black text-sm transition-all mt-2"
            style={{
              background: loading ? 'var(--surface-subtle)' : 'var(--gold)',
              color: loading ? 'var(--text-muted)' : '#1A1814',
              border: `1px solid ${loading ? 'var(--surface-mid)' : 'var(--gold-bright)'}`,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'var(--gold-bright)'; }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = 'var(--gold)'; }}
          >
            {loading ? 'Guardando...' : 'Guardar y Continuar →'}
          </button>

        </form>
      </div>
    </motion.div>
  );
}
