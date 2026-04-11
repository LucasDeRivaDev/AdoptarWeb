'use client';

// ============================================================
// ADMIN GUARD
// Solo deja pasar si el usuario tiene role='admin'.
// Para setear el rol: en Firestore → users → [tu uid] → role: "admin"
// ============================================================

import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ShieldAlert } from 'lucide-react';
import { ReactNode } from 'react';

export function AdminGuard({ children }: { children: ReactNode }) {
  const { profile, loading } = useAuth();

  if (loading) return <LoadingSpinner className="min-h-screen" />;

  if (!profile || profile.role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-gray-400">
        <ShieldAlert size={48} className="text-coral-300" />
        <p className="font-semibold text-gray-600">Acceso restringido</p>
        <p className="text-sm">Esta sección es solo para administradores.</p>
      </div>
    );
  }

  return <>{children}</>;
}
