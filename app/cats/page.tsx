'use client';

// ============================================================
// PÁGINA DE EXPLORACIÓN — Grid de todos los gatos disponibles
// Client Component porque los filtros y el toggle son interactivos.
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { getCats } from '@/lib/firebase/firestore';
import { Cat, CatFilters } from '@/types';
import { CatGrid } from '@/components/cats/CatGrid';
import { CatFiltersPanel } from '@/components/cats/CatFilters';
import { LayoutGrid, Map } from 'lucide-react';

// CatMap se importa con ssr:false porque Leaflet usa window (solo en el navegador)
const CatMap = dynamic(
  () => import('@/components/cats/CatMap').then((m) => m.CatMap),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-2xl bg-cream-50 border border-gray-100 flex items-center justify-center" style={{ height: '520px' }}>
        <p className="text-gray-400 text-sm">Cargando mapa...</p>
      </div>
    ),
  }
);

const DEFAULT_FILTERS: CatFilters = {
  location: '',
  animalType: '',
  gender: '',
  vaccinated: null,
  sterilized: null,
  maxAgeMonths: null,
};

type ViewMode = 'grid' | 'map';

export default function CatsPage() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [filtered, setFiltered] = useState<Cat[]>([]);
  const [filters, setFilters] = useState<CatFilters>(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>('grid');

  // Cargar todos los gatos una sola vez
  useEffect(() => {
    getCats()
      .then((data) => {
        setCats(data);
        setFiltered(data);
      })
      .finally(() => setLoading(false));
  }, []);

  // Filtrar localmente (para filtros que no requieren índice en Firestore)
  const applyFilters = useCallback((currentFilters: CatFilters) => {
    let result = [...cats];

    if (currentFilters.location) {
      const loc = currentFilters.location.toLowerCase();
      result = result.filter((c) => c.location.toLowerCase().includes(loc));
    }
    if (currentFilters.animalType) {
      result = result.filter((c) => c.animalType === currentFilters.animalType);
    }
    if (currentFilters.gender) {
      result = result.filter((c) => c.gender === currentFilters.gender);
    }
    if (currentFilters.vaccinated !== null) {
      result = result.filter((c) => c.health.vaccinated === currentFilters.vaccinated);
    }
    if (currentFilters.sterilized !== null) {
      result = result.filter((c) => c.health.sterilized === currentFilters.sterilized);
    }
    if (currentFilters.maxAgeMonths !== null) {
      result = result.filter((c) => c.ageMonths <= (currentFilters.maxAgeMonths ?? Infinity));
    }

    setFiltered(result);
  }, [cats]);

  function handleFilterChange(newFilters: CatFilters) {
    setFilters(newFilters);
    applyFilters(newFilters);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Mascotas en adopción</h1>
          <p className="text-gray-500">
            {loading ? 'Cargando...' : `${filtered.length} ${filtered.length === 1 ? 'mascota disponible' : 'mascotas disponibles'}`}
          </p>
        </div>

        {/* Toggle Grid / Mapa */}
        <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1 self-start">
          <button
            onClick={() => setView('grid')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              view === 'grid'
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <LayoutGrid size={16} />
            Grilla
          </button>
          <button
            onClick={() => setView('map')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              view === 'map'
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Map size={16} />
            Mapa
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-8">
        <CatFiltersPanel filters={filters} onChange={handleFilterChange} />
      </div>

      {/* Vista */}
      {view === 'grid' ? (
        <CatGrid cats={filtered} loading={loading} />
      ) : (
        <CatMap cats={filtered} />
      )}
    </div>
  );
}
