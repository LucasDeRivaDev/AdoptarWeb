import { Cat } from '@/types';
import { CatCard } from './CatCard';
import { PawPrint } from 'lucide-react';

interface CatGridProps {
  cats: Cat[];
  loading?: boolean;
}

export function CatGrid({ cats, loading }: CatGridProps) {
  if (loading) {
    // Skeleton loader — muestra tarjetas en gris mientras carga
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-card animate-pulse">
            <div className="h-52 bg-gray-100" />
            <div className="p-4 space-y-2">
              <div className="h-4 bg-gray-100 rounded w-3/4" />
              <div className="h-3 bg-gray-100 rounded w-full" />
              <div className="h-3 bg-gray-100 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (cats.length === 0) {
    return (
      <div className="text-center py-20">
        <PawPrint size={48} className="mx-auto text-gray-200 mb-4" />
        <h3 className="text-lg font-semibold text-gray-500 mb-1">No encontramos mascotas</h3>
        <p className="text-sm text-gray-400">Probá cambiando los filtros de búsqueda</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {cats.map((cat) => (
        <CatCard key={cat.id} cat={cat} />
      ))}
    </div>
  );
}
