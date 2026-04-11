'use client';

import Image from 'next/image';
import { AdoptionApplication } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatRelativeDate, formatHousingType, getApplicationStatusLabel } from '@/lib/utils';
import { approveApplication, rejectApplication } from '@/lib/firebase/firestore';
import { useState } from 'react';

interface ApplicationCardProps {
  application: AdoptionApplication;
  viewAs: 'owner' | 'applicant'; // owner puede aprobar/rechazar
  onUpdate?: () => void;
}

const statusColors: Record<string, 'coral' | 'sage' | 'amber' | 'gray'> = {
  pending: 'amber',
  approved: 'sage',
  rejected: 'coral',
};

export function ApplicationCard({ application, viewAs, onUpdate }: ApplicationCardProps) {
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null);

  async function handleApprove() {
    setLoading('approve');
    try {
      await approveApplication(application);
      // Enviar email de bienvenida
      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'welcome',
          to: application.applicantEmail,
          adopterName: application.applicantName,
          catName: application.catName,
        }),
      }).catch(console.error);
      onUpdate?.();
    } finally {
      setLoading(null);
    }
  }

  async function handleReject() {
    setLoading('reject');
    try {
      await rejectApplication(application.id);
      onUpdate?.();
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        {application.catPhoto && (
          <div className="relative h-14 w-14 rounded-xl overflow-hidden flex-shrink-0 bg-cream-100">
            <Image src={application.catPhoto} alt={application.catName} fill className="object-cover" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-gray-800 truncate">
              {viewAs === 'owner' ? application.applicantName : application.catName}
            </h3>
            <Badge
              label={getApplicationStatusLabel(application.status)}
              color={statusColors[application.status] ?? 'gray'}
            />
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{formatRelativeDate(application.createdAt)}</p>
        </div>
      </div>

      {/* Detalles rápidos */}
      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 bg-cream-100 rounded-xl p-3">
        <div><span className="text-gray-400">Vivienda:</span> {formatHousingType(application.housingType)}</div>
        <div><span className="text-gray-400">Mascotas previas:</span> {application.hadPetsBefore ? 'Sí' : 'No'}</div>
        {application.otherAnimals && (
          <div className="col-span-2"><span className="text-gray-400">Otros animales:</span> {application.otherAnimals}</div>
        )}
      </div>

      {/* Motivación */}
      <div>
        <p className="text-xs text-gray-400 mb-1">Motivación:</p>
        <p className="text-sm text-gray-700 line-clamp-3">{application.motivation}</p>
      </div>

      {/* Contacto directo — solo visible para el rescatista */}
      {viewAs === 'owner' && (
        <div className="bg-sage-50 border border-sage-200 rounded-xl p-3 space-y-2">
          <p className="text-xs font-semibold text-sage-700">Contacto del adoptante</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <a
              href={`mailto:${application.applicantEmail}`}
              className="flex items-center gap-2 text-sage-700 hover:text-sage-900 transition-colors"
            >
              <span>✉️</span>
              <span className="truncate">{application.applicantEmail}</span>
            </a>
            {application.applicantPhone && (
              <a
                href={`https://wa.me/${application.applicantPhone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sage-700 hover:text-sage-900 transition-colors"
              >
                <span>📱</span>
                <span>{application.applicantPhone}</span>
              </a>
            )}
            {application.applicantAddress && (
              <div className="flex items-center gap-2 text-sage-600 col-span-full">
                <span>📍</span>
                <span>{application.applicantAddress}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Botones para el dueño */}
      {viewAs === 'owner' && application.status === 'pending' && (
        <div className="flex gap-2 pt-2">
          <Button
            variant="secondary"
            size="sm"
            className="flex-1"
            onClick={handleApprove}
            loading={loading === 'approve'}
          >
            Aprobar
          </Button>
          <Button
            variant="danger"
            size="sm"
            className="flex-1"
            onClick={handleReject}
            loading={loading === 'reject'}
          >
            Rechazar
          </Button>
        </div>
      )}
    </div>
  );
}
