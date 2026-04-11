'use client';

// ============================================================
// PROVIDERS GLOBALES
// Envuelve toda la app con los contextos necesarios.
// Se usa en app/layout.tsx.
// ============================================================

import { ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
