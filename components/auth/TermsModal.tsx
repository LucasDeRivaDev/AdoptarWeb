'use client';

// ============================================================
// MODAL DE TÉRMINOS Y CONDICIONES
// Se muestra automáticamente al primer login.
// El usuario DEBE aceptar para poder usar la plataforma.
// ============================================================

import { useState } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Button } from '@/components/ui/Button';
import { PawPrint, Shield, Eye, Bell } from 'lucide-react';

interface TermsModalProps {
  userId: string;
  userName: string;
  onAccepted: () => void;
}

export function TermsModal({ userId, userName, onAccepted }: TermsModalProps) {
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleAccept() {
    if (!accepted) return;
    setLoading(true);
    try {
      // Guardar en Firestore que el usuario aceptó los términos
      await updateDoc(doc(db, 'users', userId), {
        acceptedTerms: true,
        acceptedTermsAt: serverTimestamp(),
      });
      onAccepted();
    } finally {
      setLoading(false);
    }
  }

  return (
    // Overlay que cubre toda la pantalla — no se puede cerrar sin aceptar
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="bg-coral-500 px-6 py-5 text-white text-center">
          <PawPrint size={32} className="mx-auto mb-2 fill-white" />
          <h2 className="text-xl font-bold">¡Bienvenido/a, {userName.split(' ')[0]}!</h2>
          <p className="text-coral-100 text-sm mt-1">Antes de empezar, leé y aceptá nuestros términos</p>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">

          {/* Qué hacemos con tus datos */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800 text-sm">¿Qué hacemos con tu información?</h3>

            {[
              {
                icon: Eye,
                color: 'coral',
                title: 'Tus datos son visibles para rescatistas',
                desc: 'Cuando enviás una solicitud de adopción, el rescatador puede ver tu nombre, email y las respuestas del formulario para evaluar tu perfil.',
              },
              {
                icon: Shield,
                color: 'sage',
                title: 'Uso responsable de la información',
                desc: 'Tus datos se usan exclusivamente para gestionar adopciones. No los vendemos ni los compartimos con terceros fuera de la plataforma.',
              },
              {
                icon: Bell,
                color: 'amber',
                title: 'Podemos contactarte',
                desc: 'Si adoptás un gatito, te enviaremos recordatorios de vacunas y chequeos al email de tu cuenta de Google.',
              },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="flex gap-3 p-3 bg-cream-100 rounded-xl">
                <div className={`p-2 rounded-lg flex-shrink-0 ${
                  color === 'coral' ? 'bg-coral-100 text-coral-500' :
                  color === 'sage' ? 'bg-sage-100 text-sage-500' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  <Icon size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Texto legal resumido */}
          <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500 leading-relaxed space-y-2">
            <p><strong>Adopción responsable:</strong> Al publicar un gato, te comprometés a que la información es veraz. Al solicitar adoptar, aceptás que el rescatador puede rechazar tu solicitud sin dar explicaciones.</p>
            <p><strong>Seguimiento post-adopción:</strong> Al adoptar un gato, te comprometés a registrar las vacunas y chequeos en la plataforma durante el primer año.</p>
            <p><strong>Datos del perfil:</strong> Al registrarte con Google, aceptás que tu nombre, email y foto de perfil se almacenen en nuestra base de datos y sean visibles para otros usuarios dentro del contexto de la adopción.</p>
          </div>
        </div>

        {/* Footer con checkbox y botón */}
        <div className="px-6 pb-6 pt-2 space-y-4 border-t border-gray-100">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-coral-500 cursor-pointer"
            />
            <span className="text-sm text-gray-700 leading-relaxed">
              Leí y acepto los términos de uso. Entiendo que mis datos pueden ser vistos por rescatistas y el equipo de AdopcionWeb en el contexto de los procesos de adopción.
            </span>
          </label>

          <Button
            onClick={handleAccept}
            loading={loading}
            disabled={!accepted}
            className="w-full"
            size="lg"
          >
            Aceptar y continuar
          </Button>
        </div>
      </div>
    </div>
  );
}
