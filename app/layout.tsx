import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/layout/Providers';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'AdopcionWeb — Adoptá con amor',
    template: '%s | AdopcionWeb',
  },
  description: 'Plataforma de adopción responsable de gatos. Encontrá tu compañero felino y dale un hogar para siempre.',
  keywords: ['adopción gatos', 'gatos en adopción', 'adoptar gato', 'rescate felino', 'Argentina'],
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    title: 'AdopcionWeb — Adoptá con amor',
    description: 'Encontrá tu compañero felino y dale un hogar para siempre.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Providers>
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
