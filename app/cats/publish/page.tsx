'use client';

// ============================================================
// PÁGINA DE PUBLICAR UN GATO
// Solo accesible si el usuario está logueado.
// ============================================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { createCat } from '@/lib/firebase/firestore';
import { uploadCatPhotos } from '@/lib/firebase/storage';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { PhotoUpload } from '@/components/cats/PhotoUpload';
import { PawPrint } from 'lucide-react';

const schema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(50),
  ageMonths: z.number({ invalid_type_error: 'Ingresá la edad' }).min(0).max(300),
  gender: z.enum(['male', 'female'], { required_error: 'Elegí el género' }),
  description: z.string().min(30, 'Describí al gatito (mínimo 30 caracteres)').max(1000),
  location: z.string().min(2, 'La ubicación es requerida'),
  color: z.string().optional(),
  breed: z.string().optional(),
  vaccinated: z.boolean().default(false),
  sterilized: z.boolean().default(false),
  dewormed: z.boolean().default(false),
  microchipped: z.boolean().default(false),
  specialNeeds: z.boolean().default(false),
  healthNotes: z.string().max(300).optional(),
});

type FormValues = z.infer<typeof schema>;

function PublishForm() {
  const { profile } = useAuth();
  const router = useRouter();
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoError, setPhotoError] = useState('');
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      vaccinated: false,
      sterilized: false,
      dewormed: false,
      microchipped: false,
      specialNeeds: false,
    },
  });

  // Geocodea la ubicación con Nominatim (OpenStreetMap, gratis, sin API key)
  async function geocodeLocation(location: string) {
    try {
      const query = encodeURIComponent(location);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
        { headers: { 'Accept-Language': 'es' } }
      );
      const data = await res.json();
      if (data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      }
    } catch {
      // Si falla el geocoding, el gato se crea igual pero sin coordenadas
    }
    return undefined;
  }

  async function onSubmit(values: FormValues) {
    if (photos.length === 0) {
      setPhotoError('Agregá al menos una foto');
      return;
    }
    if (!profile) return;

    setUploading(true);
    try {
      // Intentar obtener coordenadas de la ubicación
      const coordinates = await geocodeLocation(values.location);

      // Crear el gato primero para obtener el ID
      const catId = await createCat({
        name: values.name,
        ageMonths: values.ageMonths,
        gender: values.gender,
        description: values.description,
        photos: [], // se actualizará después
        health: {
          vaccinated: values.vaccinated,
          sterilized: values.sterilized,
          dewormed: values.dewormed,
          microchipped: values.microchipped,
          specialNeeds: values.specialNeeds,
          notes: values.healthNotes ?? '',
        },
        location: values.location,
        coordinates,
        color: values.color,
        breed: values.breed,
        ownerId: profile.id,
        ownerName: profile.name,
        status: 'available',
      });

      // Subir fotos a Firebase Storage
      const photoURLs = await uploadCatPhotos(photos, catId);

      // Actualizar el gato con las URLs de las fotos
      const { updateDoc, doc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase/config');
      await updateDoc(doc(db, 'cats', catId), { photos: photoURLs });

      router.push(`/cats/${catId}`);
    } finally {
      setUploading(false);
    }
  }

  const isLoading = isSubmitting || uploading;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-coral-100 text-coral-600 text-sm font-medium px-4 py-1.5 rounded-full mb-4">
          <PawPrint size={14} className="fill-coral-500" />
          Nueva publicación
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Publicar un gatito</h1>
        <p className="text-gray-500 mt-1">Completá el formulario para que el gatito encuentre su hogar.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* FOTOS */}
        <section className="bg-white rounded-2xl p-6 shadow-soft space-y-4">
          <h2 className="font-semibold text-gray-800">Fotos</h2>
          <PhotoUpload
            onFilesChange={(files) => {
              setPhotos(files);
              if (files.length > 0) setPhotoError('');
            }}
          />
          {photoError && <p className="text-xs text-red-500">{photoError}</p>}
        </section>

        {/* DATOS BÁSICOS */}
        <section className="bg-white rounded-2xl p-6 shadow-soft space-y-4">
          <h2 className="font-semibold text-gray-800">Datos básicos</h2>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nombre"
              placeholder="Mochi, Simón, Luna..."
              {...register('name')}
              error={errors.name?.message}
            />
            <Input
              label="Edad (en meses)"
              type="number"
              placeholder="Ej: 8"
              {...register('ageMonths', { valueAsNumber: true })}
              error={errors.ageMonths?.message}
              hint="2 años = 24 meses"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Género"
              {...register('gender')}
              error={errors.gender?.message}
              placeholder="Elegí"
              options={[
                { value: 'male', label: 'Macho' },
                { value: 'female', label: 'Hembra' },
              ]}
            />
            <Input
              label="Ubicación"
              placeholder="Ej: Santa Fe, Argentina"
              {...register('location')}
              error={errors.location?.message}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Color" placeholder="Ej: Naranja y blanco" {...register('color')} />
            <Input label="Raza (opcional)" placeholder="Ej: Mestizo" {...register('breed')} />
          </div>

          <Textarea
            label="Descripción"
            placeholder="Contanos la personalidad del gatito, qué le gusta, si se lleva bien con niños o con otros animales..."
            rows={5}
            {...register('description')}
            error={errors.description?.message}
          />
        </section>

        {/* SALUD */}
        <section className="bg-white rounded-2xl p-6 shadow-soft space-y-4">
          <h2 className="font-semibold text-gray-800">Estado de salud</h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { field: 'vaccinated' as const, label: '💉 Vacunado/a' },
              { field: 'sterilized' as const, label: '✂️ Castrado/a' },
              { field: 'dewormed' as const, label: '🐛 Desparasitado/a' },
              { field: 'microchipped' as const, label: '📡 Microchip' },
              { field: 'specialNeeds' as const, label: '❤️ Necesidades especiales' },
            ].map(({ field, label }) => (
              <label
                key={field}
                className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 bg-cream-100 px-3 py-2 rounded-xl hover:bg-cream-200 transition-colors"
              >
                <input type="checkbox" {...register(field)} className="accent-coral-500" />
                {label}
              </label>
            ))}
          </div>

          <Textarea
            label="Notas de salud (opcional)"
            placeholder="Ej: FIV/Leucemia negativos, al día con antiparasitario..."
            rows={3}
            {...register('healthNotes')}
          />
        </section>

        <Button type="submit" size="lg" className="w-full" loading={isLoading}>
          {uploading ? 'Subiendo fotos...' : 'Publicar gatito'}
        </Button>
      </form>
    </div>
  );
}

export default function PublishPage() {
  return (
    <AuthGuard>
      <PublishForm />
    </AuthGuard>
  );
}
