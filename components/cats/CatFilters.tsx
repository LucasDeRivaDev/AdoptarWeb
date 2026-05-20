'use client';

import { CatFilters as Filters } from '@/types';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Search, X } from 'lucide-react';

interface CatFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

const DEFAULT_FILTERS: Filters = {
  location: '',
  animalType: '',
  gender: '',
  vaccinated: null,
  sterilized: null,
  maxAgeMonths: null,
};

export function CatFiltersPanel({ filters, onChange }: CatFiltersProps) {
  function update(patch: Partial<Filters>) {
    onChange({ ...filters, ...patch });
  }

  function reset() {
    onChange(DEFAULT_FILTERS);
  }

  const hasActiveFilters = Object.values(filters).some(
    (v) => v !== '' && v !== null
  );

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 lg:grid-cols-6 gap-3 items-end">
        {/* Búsqueda por ubicación */}
        <div className="relative sm:col-span-2 md:col-span-1">
          <Input
            label="Ubicación"
            placeholder="Ej: Santa Fe"
            value={filters.location}
            onChange={(e) => update({ location: e.target.value })}
          />
          <Search size={14} className="absolute right-3 top-9 text-gray-400" />
        </div>

        {/* Especie */}
        <Select
          label="Especie"
          value={filters.animalType}
          onChange={(e) => update({ animalType: e.target.value as Filters['animalType'] })}
          placeholder="Todos"
          options={[
            { value: 'cat', label: '🐱 Gatos' },
            { value: 'dog', label: '🐶 Perros' },
          ]}
        />

        {/* Género */}
        <Select
          label="Género"
          value={filters.gender}
          onChange={(e) => update({ gender: e.target.value as Filters['gender'] })}
          placeholder="Todos"
          options={[
            { value: 'male', label: 'Macho' },
            { value: 'female', label: 'Hembra' },
          ]}
        />

        {/* Vacunado */}
        <Select
          label="Vacunado"
          value={filters.vaccinated === null ? '' : String(filters.vaccinated)}
          onChange={(e) => update({ vaccinated: e.target.value === '' ? null : e.target.value === 'true' })}
          placeholder="Cualquiera"
          options={[
            { value: 'true', label: 'Sí' },
            { value: 'false', label: 'No' },
          ]}
        />

        {/* Castrado */}
        <Select
          label="Castrado/a"
          value={filters.sterilized === null ? '' : String(filters.sterilized)}
          onChange={(e) => update({ sterilized: e.target.value === '' ? null : e.target.value === 'true' })}
          placeholder="Cualquiera"
          options={[
            { value: 'true', label: 'Sí' },
            { value: 'false', label: 'No' },
          ]}
        />

        {/* Botón limpiar */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={reset} className="gap-1 self-end">
            <X size={14} /> Limpiar
          </Button>
        )}
      </div>
    </div>
  );
}
