// ============================================================
// PÁGINA DE DONACIONES
// Muestra fundaciones y rescatistas con botones de donación.
// ============================================================

import { getFoundations } from '@/lib/firebase/firestore';
import { UserProfile } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Heart, ExternalLink } from 'lucide-react';
import Link from 'next/link';

// Datos de ejemplo de fundaciones hasta que haya en Firestore
const SAMPLE_FOUNDATIONS = [
  {
    id: 'f1',
    name: 'Rescatistas del Litoral',
    photoURL: '',
    bio: 'Rescatamos gatos en situación de calle desde 2018 en Santa Fe. Somos una red de voluntarios independientes que trabajamos sin fines de lucro.',
    location: 'Santa Fe, Argentina',
    cbuAlias: 'rescatistas.litoral',
  },
  {
    id: 'f2',
    name: 'Hogar Felino Córdoba',
    photoURL: '',
    bio: 'Transitamos gatos enfermos y vulnerables hasta que encuentran una familia. Necesitamos fondos para alimentos y veterinaria.',
    location: 'Córdoba, Argentina',
    cbuAlias: 'hogarf.cba',
  },
  {
    id: 'f3',
    name: 'Gatitos Rosario',
    photoURL: '',
    bio: 'Organización sin fines de lucro dedicada a la adopción responsable y la castración de gatos callejeros en Rosario.',
    location: 'Rosario, Santa Fe',
    cbuAlias: 'gatitos.rosario',
  },
];

export default async function DonatePage() {
  let foundations: UserProfile[] = [];
  try {
    foundations = await getFoundations();
  } catch {
    foundations = [];
  }

  // Si no hay en Firestore, usamos los de ejemplo
  const list = foundations.length > 0 ? foundations : SAMPLE_FOUNDATIONS;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-coral-100 text-coral-600 text-sm font-medium px-4 py-1.5 rounded-full mb-4">
          <Heart size={14} className="fill-coral-400" />
          Apoyá la causa
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-3">Donar a rescatistas</h1>
        <p className="text-gray-500 max-w-xl mx-auto leading-relaxed">
          Los rescatistas y fundaciones gastan de su propio bolsillo en alimento, veterinaria
          y transporte. Tu donación, por pequeña que sea, hace una diferencia real.
        </p>
      </div>

      {/* Impacto */}
      <div className="grid grid-cols-3 gap-4 mb-12">
        {[
          { amount: '$500', impact: 'cubre una bolsa de alimento' },
          { amount: '$2.000', impact: 'paga una consulta veterinaria' },
          { amount: '$5.000', impact: 'financia una castración' },
        ].map((item) => (
          <div key={item.amount} className="bg-white rounded-2xl p-4 text-center shadow-soft">
            <p className="text-2xl font-bold text-coral-500">{item.amount}</p>
            <p className="text-xs text-gray-500 mt-1">{item.impact}</p>
          </div>
        ))}
      </div>

      {/* Lista de fundaciones */}
      <div className="space-y-5">
        {list.map((foundation: any) => (
          <div key={foundation.id} className="bg-white rounded-2xl shadow-card p-6">
            <div className="flex items-start gap-4">
              <Avatar
                src={foundation.photoURL}
                name={foundation.name}
                size="lg"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">{foundation.name}</h2>
                    {foundation.location && (
                      <p className="text-sm text-gray-400 mt-0.5">📍 {foundation.location}</p>
                    )}
                  </div>
                  {foundation.verified && (
                    <span className="text-xs bg-sage-100 text-sage-600 px-2.5 py-1 rounded-full font-medium">
                      ✓ Verificada
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                  {foundation.bio ?? 'Sin descripción disponible.'}
                </p>

                {/* Botones de donación */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {foundation.mercadoPagoLink ? (
                    <a href={foundation.mercadoPagoLink} target="_blank" rel="noopener noreferrer">
                      <Button size="sm">
                        <Heart size={14} className="fill-current" /> Donar con MercadoPago
                      </Button>
                    </a>
                  ) : foundation.cbuAlias ? (
                    <div className="flex items-center gap-2 bg-cream-100 rounded-xl px-4 py-2">
                      <span className="text-xs text-gray-500">Alias CBU:</span>
                      <code className="text-sm font-mono font-semibold text-coral-500">
                        {foundation.cbuAlias}
                      </code>
                    </div>
                  ) : (
                    <Button size="sm" disabled>
                      Próximamente
                    </Button>
                  )}

                  {foundation.website && (
                    <a href={foundation.website} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm">
                        <ExternalLink size={14} /> Sitio web
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA — Registrarse como fundación */}
      <div className="mt-12 bg-coral-500 rounded-3xl p-8 text-center text-white">
        <h2 className="text-xl font-bold mb-2">¿Sos una organización rescatista?</h2>
        <p className="text-coral-100 text-sm mb-5">
          Registrate para aparecer en esta página y recibir donaciones directamente.
        </p>
        <Link href="/login">
          <Button className="bg-white text-coral-500 hover:bg-coral-50" size="lg">
            Crear cuenta de fundación
          </Button>
        </Link>
      </div>
    </div>
  );
}
