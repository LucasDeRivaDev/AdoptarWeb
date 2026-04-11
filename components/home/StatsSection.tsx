'use client';

// ============================================================
// SECCIÓN DE ESTADÍSTICAS PÚBLICAS — home page
// Client Component porque recharts usa window.
// Los datos vienen del Server Component (page.tsx) via props.
// ============================================================

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { PublicStats } from '@/lib/firebase/firestore';
import { PawPrint, Heart, Users, Building2 } from 'lucide-react';

interface StatsSectionProps {
  stats: PublicStats;
}

const counters = [
  {
    icon: PawPrint,
    color: 'bg-coral-100 text-coral-500',
    getValue: (s: PublicStats) => s.availableCats,
    label: 'Gatitos en adopción',
  },
  {
    icon: Heart,
    color: 'bg-sage-100 text-sage-600',
    getValue: (s: PublicStats) => s.totalAdoptions,
    label: 'Adopciones concretadas',
  },
  {
    icon: Users,
    color: 'bg-amber-100 text-amber-600',
    getValue: (s: PublicStats) => s.activeRescuers,
    label: 'Rescatistas activos',
  },
  {
    icon: Building2,
    color: 'bg-blue-100 text-blue-500',
    getValue: (s: PublicStats) => s.foundations,
    label: 'Fundaciones registradas',
  },
];

// Tooltip personalizado del gráfico
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 shadow-soft rounded-xl px-4 py-2.5 text-sm">
      <p className="text-gray-500 mb-1">{label}</p>
      <p className="font-semibold text-coral-500">{payload[0].value} adopciones</p>
    </div>
  );
}

export function StatsSection({ stats }: StatsSectionProps) {
  const hasAdoptions = stats.adoptionsByMonth.some((m) => m.adopciones > 0);

  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Título */}
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">El impacto de la comunidad</h2>
          <p className="text-gray-500">Números reales de gatitos que encontraron su hogar gracias a vos</p>
        </div>

        {/* Contadores */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {counters.map((c) => (
            <div key={c.label} className="bg-cream-50 rounded-2xl p-5 flex flex-col items-center text-center gap-3">
              <div className={`p-3 rounded-xl ${c.color}`}>
                <c.icon size={22} />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-800">{c.getValue(stats)}</p>
                <p className="text-sm text-gray-500 mt-0.5">{c.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Gráfico de barras — adopciones por mes */}
        <div className="bg-cream-50 rounded-2xl p-6">
          <h3 className="font-semibold text-gray-700 mb-6">Adopciones por mes</h3>
          {hasAdoptions ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stats.adoptionsByMonth} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe3" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#fef3ee' }} />
                <Bar dataKey="adopciones" fill="#f87171" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400 gap-2">
              <span className="text-4xl">📊</span>
              <p className="text-sm">Las adopciones concretadas aparecerán acá</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
