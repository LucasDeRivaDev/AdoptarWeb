'use client';

// ============================================================
// CONTRATO DE ADOPCIÓN
// Imprimible. Muestra datos del gato, adoptante y rescatista.
// El adoptante puede ingresar su DNI antes de imprimir.
// Accesible para adoptante y rescatista.
// ============================================================

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Timestamp } from 'firebase/firestore';
import {
  getAdoptionById,
  getApplicationById,
  getCatById,
  getUserProfile,
  updateAdoptionDNI,
} from '@/lib/firebase/firestore';
import { Adoption, AdoptionApplication, Cat, UserProfile } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import { Printer, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

// ---- PLAN DE CUIDADOS según edad y salud -------------------

interface CareMilestone {
  emoji: string;
  title: string;
  timeframe: string;
  priority: 'urgent' | 'soon' | 'regular';
}

function generateCarePlan(cat: Cat): CareMilestone[] {
  const plan: CareMilestone[] = [];

  if (!cat.health.dewormed) {
    plan.push({ emoji: '🐛', title: 'Desparasitación', timeframe: 'Primeros 7 días', priority: 'urgent' });
  }
  if (!cat.health.vaccinated) {
    plan.push({ emoji: '💉', title: 'Primera vacunación (triple felina)', timeframe: 'Primeros 15 días', priority: 'urgent' });
  }
  if (!cat.health.microchipped) {
    plan.push({ emoji: '📡', title: 'Colocación de microchip', timeframe: 'En la próxima consulta veterinaria', priority: 'soon' });
  }
  if (!cat.health.sterilized) {
    if (cat.ageMonths < 4) {
      plan.push({ emoji: '✂️', title: 'Castración / esterilización', timeframe: 'A partir de los 4 meses de edad', priority: 'soon' });
    } else if (cat.ageMonths < 6) {
      plan.push({ emoji: '✂️', title: 'Castración / esterilización', timeframe: 'Muy pronto (edad óptima: 4–6 meses)', priority: 'urgent' });
    } else {
      plan.push({ emoji: '✂️', title: 'Castración / esterilización', timeframe: 'Lo antes posible', priority: 'urgent' });
    }
  }
  if (cat.health.vaccinated) {
    plan.push({ emoji: '💉', title: 'Refuerzo anual de vacunas', timeframe: 'Cada 12 meses', priority: 'regular' });
  }
  plan.push({ emoji: '🏥', title: 'Primer chequeo post-adopción', timeframe: 'A los 30 días de la adopción', priority: 'soon' });
  plan.push({ emoji: '🏥', title: 'Control veterinario de rutina', timeframe: 'Cada 12 meses', priority: 'regular' });
  if (cat.health.specialNeeds) {
    plan.push({ emoji: '❤️', title: 'Seguimiento por necesidades especiales', timeframe: 'Coordinar con veterinario al momento de la entrega', priority: 'urgent' });
  }
  if (cat.ageMonths > 84) { // > 7 años
    plan.push({ emoji: '🔬', title: 'Análisis geriátrico', timeframe: 'Cada 6 meses (gato senior)', priority: 'soon' });
  }

  return plan;
}

// ---- COMPONENTE PRINCIPAL ----------------------------------

function ContratoContent() {
  const { adoptionId } = useParams<{ adoptionId: string }>();
  const { profile } = useAuth();

  const [adoption, setAdoption] = useState<Adoption | null>(null);
  const [application, setApplication] = useState<AdoptionApplication | null>(null);
  const [cat, setCat] = useState<Cat | null>(null);
  const [rescuer, setRescuer] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [dni, setDni] = useState('');
  const [dniSaved, setDniSaved] = useState(false);
  const [savingDni, setSavingDni] = useState(false);

  useEffect(() => {
    async function load() {
      const adoptionData = await getAdoptionById(adoptionId);
      if (!adoptionData) return;
      setAdoption(adoptionData);
      if (adoptionData.adopterDNI) setDni(adoptionData.adopterDNI);

      const [appData, catData, rescuerData] = await Promise.all([
        getApplicationById(adoptionData.applicationId),
        getCatById(adoptionData.catId),
        getUserProfile(adoptionData.originalOwnerId),
      ]);
      setApplication(appData);
      setCat(catData);
      setRescuer(rescuerData);
    }
    load().finally(() => setLoading(false));
  }, [adoptionId]);

  async function handleSaveDni() {
    if (!dni.trim() || !adoption) return;
    setSavingDni(true);
    try {
      await updateAdoptionDNI(adoption.id, dni.trim());
      setAdoption({ ...adoption, adopterDNI: dni.trim() });
      setDniSaved(true);
    } finally {
      setSavingDni(false);
    }
  }

  if (loading) return <PageLoader />;
  if (!adoption || !cat) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">No encontramos este contrato.</p>
        <Link href="/dashboard"><Button variant="ghost" className="mt-4">← Volver al panel</Button></Link>
      </div>
    );
  }

  const isAdopter = profile?.id === adoption.adopterId;
  const carePlan = generateCarePlan(cat);
  const today = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

      {/* Botones de acción — se ocultan al imprimir */}
      <div className="flex items-center gap-3 mb-6 print:hidden">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-coral-500 transition-colors">
          <ArrowLeft size={16} /> Volver al panel
        </Link>
        <div className="flex-1" />
        <Button onClick={() => window.print()} className="gap-2">
          <Printer size={16} /> Imprimir contrato
        </Button>
      </div>

      {/* DNI — solo el adoptante puede completarlo, se oculta al imprimir si ya está guardado */}
      {isAdopter && !adoption.adopterDNI && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 print:hidden">
          <p className="text-sm font-semibold text-amber-800 mb-2">
            ⚠️ Antes de imprimir, ingresá tu DNI
          </p>
          <p className="text-xs text-amber-700 mb-3">
            El DNI aparecerá en el contrato para que el rescatista pueda verificar tu identidad en persona al momento de la entrega.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              placeholder="Ej: 35.123.456"
              className="flex-1 border border-amber-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <Button size="sm" onClick={handleSaveDni} loading={savingDni} disabled={!dni.trim()}>
              Guardar
            </Button>
          </div>
          {dniSaved && (
            <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
              <CheckCircle size={12} /> DNI guardado. Ya podés imprimir.
            </p>
          )}
        </div>
      )}

      {/* ===== DOCUMENTO IMPRIMIBLE ===== */}
      <div className="bg-white rounded-2xl shadow-soft p-8 print:shadow-none print:p-0 print:rounded-none space-y-8">

        {/* Encabezado */}
        <div className="text-center border-b-2 border-gray-800 pb-6">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">AdoptarWeb</p>
          <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">
            Contrato de Adopción Responsable
          </h1>
          <p className="text-sm text-gray-500 mt-2">N° {adoption.id.slice(-8).toUpperCase()}</p>
        </div>

        {/* Declaración inicial */}
        <p className="text-sm text-gray-600 leading-relaxed">
          En la fecha indicada al pie, el/la cedente y el/la adoptante acuerdan libre y voluntariamente las condiciones de la presente adopción responsable, comprometiéndose a respetar el bienestar del animal descripto a continuación.
        </p>

        {/* Datos del animal */}
        <section>
          <h2 className="text-base font-bold text-gray-800 uppercase tracking-wide border-b border-gray-200 pb-2 mb-4">
            1. Datos del Animal
          </h2>
          <div className="flex gap-5">
            {cat.photos?.[0] && (
              <div className="relative w-28 h-28 rounded-xl overflow-hidden flex-shrink-0 bg-cream-100 print:w-24 print:h-24">
                <Image src={cat.photos[0]} alt={cat.name} fill className="object-cover" />
              </div>
            )}
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm flex-1">
              <Field label="Nombre" value={cat.name} />
              <Field label="Especie" value="Felino doméstico (Felis catus)" />
              <Field label="Edad aproximada" value={`${cat.ageMonths} meses`} />
              <Field label="Género" value={cat.gender === 'male' ? 'Macho' : 'Hembra'} />
              {cat.color && <Field label="Color / pelaje" value={cat.color} />}
              {cat.breed && <Field label="Raza" value={cat.breed} />}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {[
              { label: 'Vacunado/a', ok: cat.health.vaccinated },
              { label: 'Castrado/a', ok: cat.health.sterilized },
              { label: 'Desparasitado/a', ok: cat.health.dewormed },
              { label: 'Microchip', ok: cat.health.microchipped },
            ].map(({ label, ok }) => (
              <div key={label} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg ${ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                {ok ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                <span>{label}: <strong>{ok ? 'Sí' : 'No'}</strong></span>
              </div>
            ))}
          </div>
          {cat.health.specialNeeds && (
            <p className="mt-2 text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">
              ⚠️ El animal presenta necesidades especiales de cuidado. {cat.health.notes && `Detalle: ${cat.health.notes}`}
            </p>
          )}
          {cat.health.notes && !cat.health.specialNeeds && (
            <p className="mt-2 text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
              📝 Notas de salud: {cat.health.notes}
            </p>
          )}
        </section>

        {/* Datos del cedente */}
        <section>
          <h2 className="text-base font-bold text-gray-800 uppercase tracking-wide border-b border-gray-200 pb-2 mb-4">
            2. Cedente (Rescatista / Organización)
          </h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <Field label="Nombre completo" value={rescuer?.name ?? adoption.adopterName} />
            <Field label="Email" value={rescuer?.email ?? ''} />
            {rescuer?.phone && <Field label="Teléfono" value={rescuer.phone} />}
            {rescuer?.location && <Field label="Localidad" value={rescuer.location} />}
          </div>
          <SignatureLine label="Firma del cedente" />
        </section>

        {/* Datos del adoptante */}
        <section>
          <h2 className="text-base font-bold text-gray-800 uppercase tracking-wide border-b border-gray-200 pb-2 mb-4">
            3. Adoptante
          </h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <Field label="Nombre completo" value={adoption.adopterName} />
            <Field label="DNI" value={adoption.adopterDNI ?? dni ?? '____________________________'} highlight={!adoption.adopterDNI && !dni} />
            <Field label="Email" value={adoption.adopterEmail} />
            {application?.applicantPhone && <Field label="Teléfono / WhatsApp" value={application.applicantPhone} />}
            {application?.applicantAddress && <Field label="Domicilio / Localidad" value={application.applicantAddress} />}
            <Field label="Tipo de vivienda" value={
              application?.housingType === 'apartment' ? 'Departamento'
              : application?.housingType === 'house_with_yard' ? 'Casa con patio'
              : application?.housingType === 'house_no_yard' ? 'Casa sin patio'
              : '—'
            } />
          </div>
          <SignatureLine label="Firma del adoptante" />
        </section>

        {/* Plan de cuidados */}
        <section>
          <h2 className="text-base font-bold text-gray-800 uppercase tracking-wide border-b border-gray-200 pb-2 mb-4">
            4. Plan de Cuidados Recomendado
          </h2>
          <p className="text-xs text-gray-500 mb-3">
            El adoptante se compromete a seguir este plan de cuidados elaborado según las condiciones actuales del animal:
          </p>
          <div className="space-y-2">
            {carePlan.map((item, i) => (
              <div key={i} className={`flex items-start gap-3 text-xs px-3 py-2.5 rounded-xl ${
                item.priority === 'urgent' ? 'bg-red-50 text-red-700'
                : item.priority === 'soon' ? 'bg-amber-50 text-amber-700'
                : 'bg-gray-50 text-gray-600'
              }`}>
                <span className="text-base flex-shrink-0">{item.emoji}</span>
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="opacity-75">{item.timeframe}</p>
                </div>
                {item.priority === 'urgent' && (
                  <span className="ml-auto text-[10px] font-bold uppercase bg-red-100 text-red-600 px-2 py-0.5 rounded-full flex-shrink-0">Urgente</span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Compromisos */}
        <section>
          <h2 className="text-base font-bold text-gray-800 uppercase tracking-wide border-b border-gray-200 pb-2 mb-4">
            5. Compromisos del Adoptante
          </h2>
          <ul className="text-sm text-gray-700 space-y-2 list-none">
            {[
              'Proveer al animal de alimentación adecuada, agua fresca permanente y atención veterinaria oportuna.',
              'No abandonar, vender, ceder ni donar el animal sin comunicarlo previamente al cedente.',
              'Mantener el animal en condiciones higiénicas apropiadas y con acceso a espacio suficiente para su bienestar.',
              'Permitir visitas de seguimiento por parte del cedente en caso de ser solicitadas.',
              'Cumplir con el plan de cuidados recomendado (vacunas, castración, desparasitación, microchip si aplica).',
              'En caso de no poder seguir con la tenencia responsable, contactar al cedente para coordinar la devolución.',
            ].map((text, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-gray-400 mt-0.5 flex-shrink-0">•</span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Pie del contrato */}
        <section className="border-t-2 border-gray-800 pt-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <Field label="Fecha de adopción" value={formatDate(adoption.adoptionDate)} />
            <Field label="Fecha de impresión" value={today} />
            <Field label="Localidad de entrega" value={application?.applicantAddress ?? '______________________'} />
          </div>
          <p className="text-xs text-gray-400 mt-4 text-center">
            Documento generado por AdoptarWeb · adopcionweb.vercel.app · ID: {adoption.id}
          </p>
        </section>
      </div>

      {/* Botón de seguimiento — solo pantalla */}
      <div className="flex gap-3 mt-6 print:hidden">
        <Link href={`/track/${adoption.id}`} className="flex-1">
          <Button variant="outline" className="w-full">Ver historial de salud</Button>
        </Link>
        <Button onClick={() => window.print()} className="flex-1 gap-2">
          <Printer size={16} /> Imprimir
        </Button>
      </div>
    </div>
  );
}

// ---- Helpers de UI -----------------------------------------

function Field({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <span className="text-gray-400 text-xs">{label}: </span>
      <span className={`font-medium ${highlight ? 'text-red-500 italic' : 'text-gray-800'}`}>{value || '—'}</span>
    </div>
  );
}

function SignatureLine({ label }: { label: string }) {
  return (
    <div className="mt-6 flex items-end gap-4">
      <div className="flex-1 border-b-2 border-gray-400 pb-1">
        <p className="text-xs text-gray-400">{label}</p>
      </div>
      <div className="w-32 border-b-2 border-gray-400 pb-1">
        <p className="text-xs text-gray-400">Aclaración</p>
      </div>
      <div className="w-28 border-b-2 border-gray-400 pb-1">
        <p className="text-xs text-gray-400">DNI</p>
      </div>
    </div>
  );
}

export default function ContratoPage() {
  return (
    <AuthGuard>
      <ContratoContent />
    </AuthGuard>
  );
}
