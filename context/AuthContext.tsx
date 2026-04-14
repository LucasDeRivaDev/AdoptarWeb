'use client';

// ============================================================
// CONTEXTO DE AUTENTICACIÓN
// Provee el usuario actual a toda la app.
// También muestra el modal de términos si el usuario no aceptó.
// ============================================================

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { onAuthChange, getUserProfile } from '@/lib/firebase/auth';
import { UserProfile } from '@/types';
import { TermsModal } from '@/components/auth/TermsModal';

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>; // para actualizar el perfil después de cambios
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(uid: string) {
    const userProfile = await getUserProfile(uid);
    setProfile(userProfile);
    return userProfile;
  }

  // Permite a otros componentes forzar un refresh del perfil
  async function refreshProfile() {
    if (user) await loadProfile(user.uid);
  }

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await loadProfile(firebaseUser.uid);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Mostrar modal de términos si el usuario está logueado pero no aceptó
  const needsTerms = !loading && user && profile && !profile.acceptedTerms;
  const isBanned = !loading && profile?.role === 'banned';

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile }}>
      {isBanned ? (
        <div className="min-h-screen flex items-center justify-center bg-cream-50 px-4">
          <div className="text-center max-w-sm">
            <div className="text-5xl mb-4">🚫</div>
            <h1 className="text-xl font-bold text-gray-800 mb-2">Cuenta suspendida</h1>
            <p className="text-gray-500 text-sm">Tu cuenta fue suspendida por el equipo de AdopcionWeb. Si creés que es un error, contactanos.</p>
          </div>
        </div>
      ) : (
        <>
          {children}
          {/* Modal de términos — bloquea la UI hasta que acepte */}
          {needsTerms && (
            <TermsModal
              userId={user!.uid}
              userName={profile!.name}
              onAccepted={refreshProfile}
            />
          )}
        </>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
