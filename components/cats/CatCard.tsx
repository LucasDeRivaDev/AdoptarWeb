import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Heart, Syringe, Scissors } from 'lucide-react';
import { Cat } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { formatAge, formatGender, getCatStatusLabel, getCatStatusColor } from '@/lib/utils';

interface CatCardProps {
  cat: Cat;
}

export function CatCard({ cat }: CatCardProps) {
  const photo = cat.photos?.[0] ?? '/placeholder-cat.jpg';
  const statusColor = getCatStatusColor(cat.status) as 'coral' | 'sage' | 'amber' | 'gray';

  return (
    <Link href={`/cats/${cat.id}`} className="group block">
      <article className="bg-white rounded-3xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
        {/* Foto */}
        <div className="relative h-52 overflow-hidden bg-cream-100">
          <Image
            src={photo}
            alt={cat.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Badge de estado */}
          <div className="absolute top-3 left-3">
            <Badge label={getCatStatusLabel(cat.status)} color={statusColor} />
          </div>
          {/* Género */}
          <div className="absolute top-3 right-3">
            <span className="text-lg">{cat.gender === 'female' ? '♀' : '♂'}</span>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-1.5">
            <h3 className="text-base font-bold text-gray-800 group-hover:text-coral-500 transition-colors">
              {cat.name}
            </h3>
            <span className="text-xs text-gray-400 mt-0.5">{formatAge(cat.ageMonths)}</span>
          </div>

          <p className="text-xs text-gray-500 mb-3 line-clamp-2">{cat.description}</p>

          {/* Ubicación */}
          <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
            <MapPin size={12} />
            <span className="truncate">{cat.location}</span>
          </div>

          {/* Indicadores de salud */}
          <div className="flex items-center gap-2 pt-3 border-t border-gray-50">
            <div className={`flex items-center gap-1 text-xs ${cat.health.vaccinated ? 'text-sage-500' : 'text-gray-300'}`}>
              <Syringe size={12} />
              <span>Vacunado</span>
            </div>
            <div className={`flex items-center gap-1 text-xs ${cat.health.sterilized ? 'text-sage-500' : 'text-gray-300'}`}>
              <Scissors size={12} />
              <span>Castrado</span>
            </div>
            {cat.health.specialNeeds && (
              <div className="flex items-center gap-1 text-xs text-amber-warm ml-auto">
                <Heart size={12} />
                <span>Esp. especiales</span>
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
