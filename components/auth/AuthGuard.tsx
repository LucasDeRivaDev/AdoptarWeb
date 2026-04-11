'use client';

// ============================================================
// GUARDA DE AUTENTICACIÓN
// Envuelve páginas que requieren sesión iniciada.
// Si no hay sesión, redirige al login.
// ============================================================

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { PageLoader } from '@/components/ui/LoadingSpinner';

interface AuthGuardProps {
  children: ReactNode;
  requiredRole?: 'adopter' | 'rescuer' | 'foundation';
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  if (loading) return <PageLoader />;
  if (!user || !profile) return <PageLoader />;

  // Si se requiere un rol específico y el usuario no lo tiene
  if (requiredRole && profile.role !== requiredRole) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-4xl mb-4">🔒</p>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Sin permiso</h1>
          <p className="text-gray-500">Tu cuenta no tiene acceso a esta sección.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
