'use client';

// ============================================================
// FORMULARIO DE SOLICITUD DE ADOPCIÓN
// Se muestra dentro de un modal en la página del gato.
// ============================================================

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Cat } from '@/types';
import { createApplication } from '@/lib/firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { serverTimestamp } from 'firebase/firestore';

const schema = z.object({
  applicantPhone: z.string().min(6, 'Ingresá tu teléfono para que puedan contactarte'),
  applicantAddress: z.string().min(5, 'Ingresá tu dirección para posibles visitas de seguimiento'),
  housingType: z.enum(['apartment', 'house_no_yard', 'house_with_yard'], {
    required_error: 'Elegí el tipo de vivienda',
  }),
  hadPetsBefore: z.boolean(),
  otherAnimals: z.string().max(200),
  dailyAvailability: z.string().min(1, 'Contanos cuánto tiempo le podés dedicar'),
  safetyMeasures: z.string().min(1, 'Describí las medidas de seguridad del hogar'),
  motivation: z.string().min(20, 'Contanos un poco más (mínimo 20 caracteres)'),
});

type FormValues = z.infer<typeof schema>;

interface ApplicationFormProps {
  cat: Cat;
  onSuccess: () => void;
}

export function ApplicationForm({ cat, onSuccess }: ApplicationFormProps) {
  const { profile } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { hadPetsBefore: false },
  });

  async function onSubmit(values: FormValues) {
    if (!profile) return;

    await createApplication({
      catId: cat.id,
      catName: cat.name,
      catPhoto: cat.photos?.[0] ?? '',
      applicantId: profile.id,
      applicantName: profile.name,
      applicantEmail: profile.email,
      ownerId: cat.ownerId,
      ...values,
    });


    // Notificar al rescatador via API (no bloqueamos el UX si falla)
    fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'application_notification',
        to: '', // el dueño — se resuelve en el backend
        catName: cat.name,
        applicantName: profile.name,
        ownerId: cat.ownerId,
      }),
    }).catch(console.error);

    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <p className="text-sm text-gray-500 bg-cream-100 rounded-xl p-3">
        Estás solicitando adoptar a <strong>{cat.name}</strong>. El rescatador revisará tu solicitud y se pondrá en contacto con vos.
      </p>

      {/* Datos de contacto — visibles solo para el rescatista */}
      <div className="bg-sage-50 border border-sage-200 rounded-xl p-4 space-y-4">
        <p className="text-xs text-sage-700 font-medium">
          📋 Estos datos solo los verá el rescatista para poder contactarte y hacer seguimiento.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Teléfono / WhatsApp"
            placeholder="Ej: +54 342 555 1234"
            {...register('applicantPhone')}
            error={errors.applicantPhone?.message}
          />
          <Input
            label="Ciudad / Barrio"
            placeholder="Ej: Santa Fe, Barrio Sur"
            {...register('applicantAddress')}
            error={errors.applicantAddress?.message}
          />
        </div>
      </div>

      <Select
        label="¿En qué tipo de vivienda vivís?"
        {...register('housingType')}
        error={errors.housingType?.message}
        placeholder="Elegí una opción"
        options={[
          { value: 'apartment', label: 'Departamento' },
          { value: 'house_no_yard', label: 'Casa sin patio' },
          { value: 'house_with_yard', label: 'Casa con patio' },
        ]}
      />

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="hadPetsBefore"
          {...register('hadPetsBefore')}
          className="h-4 w-4 rounded accent-coral-500"
        />
        <label htmlFor="hadPetsBefore" className="text-sm text-gray-700">
          ¿Tuviste mascotas antes?
        </label>
      </div>

      <Input
        label="¿Hay otros animales en el hogar?"
        placeholder="Ej: Un perro de 3 años, muy tranquilo"
        {...register('otherAnimals')}
        error={errors.otherAnimals?.message}
      />

      <Input
        label="¿Cuántas horas por día podés dedicarle?"
        placeholder="Ej: Trabajo desde casa, disponible todo el día"
        {...register('dailyAvailability')}
        error={errors.dailyAvailability?.message}
      />

      <Textarea
        label="Medidas de seguridad del hogar"
        placeholder="Ej: Tenemos redes en las ventanas, balcón cerrado..."
        {...register('safetyMeasures')}
        error={errors.safetyMeasures?.message}
      />

      <Textarea
        label="¿Por qué querés adoptar a este gatito?"
        placeholder="Contanos tu historia, qué te motivó, qué podés ofrecerle..."
        rows={5}
        {...register('motivation')}
        error={errors.motivation?.message}
      />

      <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
        Enviar solicitud
      </Button>
    </form>
  );
}
