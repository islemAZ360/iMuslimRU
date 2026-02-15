import type { Metadata, Viewport } from 'next';
import './globals.css';
import ClientProviders from '@/components/ClientProviders';
import { NoiseBackground } from '@/components/ui/noise-background';

export const metadata: Metadata = {
  title: 'iMuslimRU — Ваш исламский спутник',
  description:
    'Приложение для мусульман в России: время намаза, направление Киблы, проверка продуктов на халяль и бойкот, персональные рекомендации по здоровью.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'iMuslimRU',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#10b981',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" dir="ltr" data-theme="dark" suppressHydrationWarning>
      <head>

      </head>
      <body>
        <ClientProviders>
          <div className="relative min-h-screen">
            <NoiseBackground containerClassName="fixed inset-0 pointer-events-none z-0" />
            <div className="relative z-10">
              {children}
            </div>
          </div>
        </ClientProviders>
      </body>
    </html>
  );
}
