'use client';

// ============================================================
// PÁGINA DE DETALLE DE UN GATO
// Muestra toda la info del gato + botón de solicitar adopción.
// ============================================================

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { MapPin, Syringe, Scissors, Heart, AlertCircle, ArrowLeft } from 'lucide-react';
import { getCatById } from '@/lib/firebase/firestore';
import { Cat } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { ApplicationForm } from '@/components/cats/ApplicationForm';
import { formatAge, formatGender, getCatStatusLabel, getCatStatusColor } from '@/lib/utils';
import Link from 'next/link';

export default function CatDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();

  const [cat, setCat] = useState<Cat | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);
  const [applyOpen, setApplyOpen] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    getCatById(id)
      .then(setCat)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageLoader />;
  if (!cat) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-lg">Esta mascota no existe o fue removida.</p>
        <Link href="/cats"><Button variant="ghost" className="mt-4">← Volver</Button></Link>
      </div>
    );
  }

  const statusColor = getCatStatusColor(cat.status) as 'coral' | 'sage' | 'amber' | 'gray';
  const canApply = user && cat.status === 'available' && cat.ownerId !== user.uid;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Back */}
      <Link href="/cats" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-coral-500 mb-6 transition-colors">
        <ArrowLeft size={16} /> Volver a mascotas
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* ---- FOTOS ---------------------------------------- */}
        <div className="space-y-3">
          {/* Foto principal */}
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-cream-100">
            {cat.photos?.[activePhoto] ? (
              <Image
                src={cat.photos[activePhoto]}
                alt={cat.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-300 text-6xl">{cat.animalType === 'dog' ? '🐶' : '🐱'}</div>
            )}
          </div>

          {/* Miniaturas */}
          {cat.photos?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {cat.photos.map((photo, i) => (
                <button
                  key={i}
                  onClick={() => setActivePhoto(i)}
                  className={`relative h-16 w-16 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-colors ${
                    i === activePhoto ? 'border-coral-400' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <Image src={photo} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ---- INFO ----------------------------------------- */}
        <div className="space-y-6">
          {/* Nombre y estado */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{cat.name}</h1>
              <p className="text-gray-500 mt-1">
                {formatGender(cat.gender)} · {formatAge(cat.ageMonths)}
                {cat.breed && ` · ${cat.breed}`}
              </p>
            </div>
            <Badge label={getCatStatusLabel(cat.status)} color={statusColor} />
          </div>

          {/* Ubicación */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MapPin size={16} className="text-coral-400" />
            {cat.location}
          </div>

          {/* Descripción */}
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-2">Sobre {cat.name}</h2>
            <p className="text-gray-600 leading-relaxed">{cat.description}</p>
          </div>

          {/* Salud */}
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Estado de salud</h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: Syringe, label: 'Vacunado/a', value: cat.health.vaccinated },
                { icon: Scissors, label: 'Castrado/a', value: cat.health.sterilized },
                { icon: Heart, label: 'Desparasitado/a', value: cat.health.dewormed },
                { icon: AlertCircle, label: 'Microchip', value: cat.health.microchipped },
              ].map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${
                    value ? 'bg-sage-50 text-sage-600' : 'bg-gray-50 text-gray-400'
                  }`}
                >
                  <Icon size={14} />
                  <span>{label}</span>
                  <span className="ml-auto font-medium">{value ? '✓' : '✗'}</span>
                </div>
              ))}
            </div>

            {cat.health.specialNeeds && (
              <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-100 text-amber-700 text-sm">
                <AlertCircle size={14} />
                <span>Necesidades especiales</span>
              </div>
            )}

            {cat.health.notes && (
              <p className="mt-3 text-sm text-gray-500 bg-cream-100 rounded-xl px-3 py-2">
                📝 {cat.health.notes}
              </p>
            )}
          </div>

          {/* Publicado por */}
          <div className="text-sm text-gray-500 border-t border-gray-100 pt-4">
            Publicado por <span className="font-medium text-gray-700">{cat.ownerName}</span>
          </div>

          {/* Botón adoptar */}
          {applied ? (
            <div className="p-4 bg-sage-50 rounded-2xl text-center text-sage-600">
              <p className="font-semibold">✓ Solicitud enviada</p>
              <p className="text-sm mt-1">El rescatador revisará tu solicitud y te contactará.</p>
            </div>
          ) : cat.status !== 'available' ? (
            <div className="p-4 bg-gray-50 rounded-2xl text-center text-gray-500">
              <p className="font-medium">Esta mascota ya fue adoptada 🎉</p>
            </div>
          ) : !user ? (
            <Link href="/login">
              <Button size="lg" className="w-full">
                <Heart size={18} /> Ingresar para adoptar
              </Button>
            </Link>
          ) : cat.ownerId === user.uid ? (
            <div className="p-4 bg-cream-100 rounded-2xl text-center text-gray-500 text-sm">
              Es tu publicación — no podés solicitarla.
            </div>
          ) : (
            <Button size="lg" className="w-full" onClick={() => setApplyOpen(true)}>
              <Heart size={18} /> Quiero adoptar a {cat.name}
            </Button>
          )}
        </div>
      </div>

      {/* Modal de solicitud */}
      <Modal
        open={applyOpen}
        onClose={() => setApplyOpen(false)}
        title={`Solicitar adopción — ${cat.name}`}
        size="lg"
      >
        <ApplicationForm
          cat={cat}
          onSuccess={() => {
            setApplyOpen(false);
            setApplied(true);
          }}
        />
      </Modal>
    </div>
  );
}
