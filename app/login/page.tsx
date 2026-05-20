'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PawPrint } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { signInWithGoogle } from '@/lib/firebase/auth';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState('');

  // Si ya está logueado, lo mandamos al dashboard
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  async function handleGoogleLogin() {
    setSigningIn(true);
    setError('');
    try {
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (err) {
      setError('Hubo un problema al iniciar sesión. Intentá de nuevo.');
      console.error(err);
    } finally {
      setSigningIn(false);
    }
  }

  if (loading) return null;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 hero-gradient">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-card-hover p-8 text-center animate-slide-up">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-coral-100 rounded-2xl">
              <PawPrint size={36} className="text-coral-500 fill-coral-500" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-2">Bienvenido/a</h1>
          <p className="text-gray-500 text-sm mb-8">
            Iniciá sesión para publicar, adoptar y hacer seguimiento de tus mascotas.
          </p>

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            disabled={signingIn}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white border-2 border-gray-200 rounded-2xl text-gray-700 font-medium text-sm hover:border-coral-300 hover:bg-coral-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-soft"
          >
            {/* Google Icon */}
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {signingIn ? 'Ingresando...' : 'Continuar con Google'}
          </button>

          {error && (
            <p className="mt-4 text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2">{error}</p>
          )}

          <p className="text-xs text-gray-400 mt-6">
            Al ingresar, aceptás nuestros términos de uso y política de privacidad.
          </p>

          {/* Future: Instagram */}
          <div className="mt-4 p-3 bg-gray-50 rounded-xl text-xs text-gray-400">
            📸 Próximamente: login con Instagram
          </div>
        </div>
      </div>
    </div>
  );
}
