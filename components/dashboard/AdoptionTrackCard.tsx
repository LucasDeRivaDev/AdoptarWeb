import Image from 'next/image';
import Link from 'next/link';
import { Adoption } from '@/types';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import { Calendar, ArrowRight } from 'lucide-react';

interface AdoptionTrackCardProps {
  adoption: Adoption;
}

export function AdoptionTrackCard({ adoption }: AdoptionTrackCardProps) {
  const nextReminder = adoption.nextVaccineReminder.toDate() < adoption.nextCheckupReminder.toDate()
    ? { label: 'Vacuna', date: adoption.nextVaccineReminder }
    : { label: 'Chequeo', date: adoption.nextCheckupReminder };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-soft overflow-hidden">
      <div className="flex gap-0">
        {/* Foto */}
        {adoption.catPhoto && (
          <div className="relative w-28 flex-shrink-0 bg-cream-100">
            <Image src={adoption.catPhoto} alt={adoption.catName} fill className="object-cover" />
          </div>
        )}

        <div className="flex-1 p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-gray-800 text-base">{adoption.catName}</h3>
              <p className="text-xs text-gray-400">Adoptado el {formatDate(adoption.adoptionDate)}</p>
            </div>
          </div>

          {/* Próximo recordatorio */}
          <div className="flex items-center gap-2 text-xs text-amber-warm bg-amber-100 px-3 py-1.5 rounded-lg w-fit">
            <Calendar size={13} />
            <span>Próximo: {nextReminder.label} — {formatDate(nextReminder.date)}</span>
          </div>

          <Link href={`/track/${adoption.id}`}>
            <Button variant="outline" size="sm" className="gap-1 mt-1">
              Ver seguimiento <ArrowRight size={14} />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
