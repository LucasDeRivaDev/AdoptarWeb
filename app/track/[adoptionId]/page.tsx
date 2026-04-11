'use client';

// ============================================================
// PÁGINA DE SEGUIMIENTO POST-ADOPCIÓN
// Muestra el historial de salud del gato adoptado.
// Permite subir nuevos registros (vacunas, fotos, notas).
// ============================================================

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Timestamp } from 'firebase/firestore';
import Image from 'next/image';
import Link from 'next/link';
import { getAdoptionById, getTrackingLogs, addTrackingLog } from '@/lib/firebase/firestore';
import { uploadTrackingDocument } from '@/lib/firebase/storage';
import { Adoption, TrackingLog, TrackingLogType } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PageLoader, LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { formatDate, formatRelativeDate } from '@/lib/utils';
import { Plus, Calendar, Syringe, Scissors, Heart, FileText, Camera, ArrowLeft } from 'lucide-react';

const LOG_ICONS: Record<TrackingLogType, string> = {
  vaccine: '💉',
  checkup: '🏥',
  sterilization: '✂️',
  note: '📝',
  photo: '📸',
  document: '📄',
};

const logSchema = z.object({
  type: z.enum(['vaccine', 'checkup', 'sterilization', 'note', 'photo', 'document']),
  title: z.string().min(1, 'El título es requerido'),
  description: z.string().optional(),
  date: z.string().min(1, 'La fecha es requerida'),
});

type LogFormValues = z.infer<typeof logSchema>;

function TrackingContent() {
  const { adoptionId } = useParams<{ adoptionId: string }>();
  const { profile } = useAuth();

  const [adoption, setAdoption] = useState<Adoption | null>(null);
  const [logs, setLogs] = useState<TrackingLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<LogFormValues>({
    resolver: zodResolver(logSchema),
    defaultValues: { type: 'checkup', date: new Date().toISOString().split('T')[0] },
  });

  async function loadData() {
    const [adoptionData, logsData] = await Promise.all([
      getAdoptionById(adoptionId),
      getTrackingLogs(adoptionId),
    ]);
    setAdoption(adoptionData);
    setLogs(logsData);
  }

  useEffect(() => {
    loadData().finally(() => setLoading(false));
  }, [adoptionId]);

  async function onSubmit(values: LogFormValues) {
    if (!profile || !adoption) return;
    setUploading(true);
    try {
      const logId = `log_${Date.now()}`;
      let fileURL: string | undefined;

      if (file) {
        fileURL = await uploadTrackingDocument(file, adoptionId, logId);
      }

      await addTrackingLog({
        adoptionId,
        catId: adoption.catId,
        adopterId: profile.id,
        type: values.type,
        title: values.title,
        description: values.description,
        fileURL,
        date: Timestamp.fromDate(new Date(values.date)),
      });

      await loadData();
      reset();
      setFile(null);
      setAddOpen(false);
    } finally {
      setUploading(false);
    }
  }

  if (loading) return <PageLoader />;
  if (!adoption) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">No encontramos este registro de adopción.</p>
        <Link href="/dashboard"><Button variant="ghost" className="mt-4">← Volver al panel</Button></Link>
      </div>
    );
  }

  const nextVaccine = adoption.nextVaccineReminder.toDate();
  const nextCheckup = adoption.nextCheckupReminder.toDate();
  const isOverdue = nextVaccine < new Date();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {/* Back */}
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-coral-500 mb-6 transition-colors">
        <ArrowLeft size={16} /> Volver al panel
      </Link>

      {/* Header del gato */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden mb-6">
        <div className="flex gap-0">
          {adoption.catPhoto && (
            <div className="relative w-32 flex-shrink-0 bg-cream-100">
              <Image src={adoption.catPhoto} alt={adoption.catName} fill className="object-cover" />
            </div>
          )}
          <div className="p-5 flex-1">
            <h1 className="text-xl font-bold text-gray-800">{adoption.catName}</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Adoptado el {formatDate(adoption.adoptionDate)}
            </p>

            {/* Próximos recordatorios */}
            <div className="mt-3 space-y-1.5">
              <div className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg w-fit ${
                isOverdue ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'
              }`}>
                <Syringe size={12} />
                <span>Vacuna: {formatDate(adoption.nextVaccineReminder)}</span>
              </div>
              <div className="flex items-center gap-2 text-xs bg-sage-50 text-sage-600 px-3 py-1.5 rounded-lg w-fit">
                <Calendar size={12} />
                <span>Chequeo: {formatDate(adoption.nextCheckupReminder)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Línea de tiempo */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-gray-800">Historial de salud</h2>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus size={15} /> Agregar registro
        </Button>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-soft">
          <span className="text-4xl block mb-3">📋</span>
          <p className="font-semibold text-gray-600 mb-1">Sin registros todavía</p>
          <p className="text-sm text-gray-400">Agregá vacunas, visitas al vet, fotos...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div key={log.id} className="bg-white rounded-2xl shadow-soft p-4 flex gap-4">
              <div className="text-2xl flex-shrink-0">{LOG_ICONS[log.type]}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-gray-800 text-sm">{log.title}</h3>
                  <span className="text-xs text-gray-400 flex-shrink-0">{formatDate(log.date)}</span>
                </div>
                {log.description && (
                  <p className="text-sm text-gray-500 mt-1">{log.description}</p>
                )}
                {log.fileURL && (
                  <a
                    href={log.fileURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-2 text-xs text-coral-500 hover:text-coral-600"
                  >
                    <FileText size={12} /> Ver adjunto
                  </a>
                )}
                <p className="text-xs text-gray-300 mt-1">{formatRelativeDate(log.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal agregar registro */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Agregar registro">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select
            label="Tipo de registro"
            {...register('type')}
            options={[
              { value: 'vaccine', label: '💉 Vacuna' },
              { value: 'checkup', label: '🏥 Consulta médica' },
              { value: 'sterilization', label: '✂️ Castración' },
              { value: 'note', label: '📝 Nota' },
              { value: 'photo', label: '📸 Foto' },
              { value: 'document', label: '📄 Documento' },
            ]}
          />
          <Input
            label="Título"
            placeholder="Ej: Vacuna antirrábica"
            {...register('title')}
            error={errors.title?.message}
          />
          <Input
            label="Fecha"
            type="date"
            {...register('date')}
            error={errors.date?.message}
          />
          <Textarea
            label="Descripción (opcional)"
            placeholder="Anotaciones adicionales..."
            {...register('description')}
          />
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              Adjunto (opcional)
            </label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-coral-100 file:text-coral-600 hover:file:bg-coral-200 cursor-pointer"
            />
          </div>
          <Button type="submit" className="w-full" loading={isSubmitting || uploading}>
            Guardar registro
          </Button>
        </form>
      </Modal>
    </div>
  );
}

export default function TrackPage() {
  return (
    <AuthGuard>
      <TrackingContent />
    </AuthGuard>
  );
}
