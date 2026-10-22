import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import MainLayout from '../components/layout/MainLayout';
import { ThemeProvider } from '@/lib/theme';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  weight: ['400', '600', '700', '800'],
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'Diagnóstico 360° del Emprendedor | Acme Consultores',
  description: 'Herramienta de evaluación integral para identificar tu estado actual en las tres dimensiones fundamentales del éxito: tu vida interna, tu estructura de negocio y tu capacidad de crecimiento.',
  openGraph: {
    title: 'Diagnóstico 360° del Emprendedor | Acme Consultores',
    description: 'Un negocio sólido se construye sobre un emprendedor en equilibrio.',
    siteName: 'Acme Consultores',
    locale: 'es_CO',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <head>
        {/* Inline script: aplica data-theme ANTES de que React hidrate para evitar flash */}
        <script dangerouslySetInnerHTML={{ __html:
          `(function(){var t=localStorage.getItem('app-theme');if(t)document.documentElement.setAttribute('data-theme',t);})();`
        }} />
      </head>
      <body className="min-h-screen bg-[var(--bg-space)] text-[var(--text-pearl)] antialiased">
        <ThemeProvider>
          <MainLayout>
            {children}
          </MainLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
