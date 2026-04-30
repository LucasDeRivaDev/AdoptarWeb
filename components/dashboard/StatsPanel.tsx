'use client';

// ============================================================
// PANEL DE ESTADÍSTICAS — para rescatistas y fundaciones
// Muestra KPIs y gráficos basados en sus gatos y solicitudes.
// ============================================================

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Cat, AdoptionApplication, Adoption } from '@/types';
import { Timestamp } from 'firebase/firestore';
import { PawPrint, Heart, Clock, CheckCircle, XCircle, TrendingUp } from 'lucide-react';

interface StatsPanelProps {
  myCats: Cat[];
  receivedApplications: AdoptionApplication[];
  myAdoptionsAsOwner: Adoption[];
}

interface KpiCardProps {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  sub?: string;
}

function KpiCard({ label, value, icon: Icon, color, sub }: KpiCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-soft p-5 flex items-start gap-4">
      <div className={`p-2.5 rounded-xl ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-sm font-medium text-gray-600">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export function StatsPanel({ myCats, receivedApplications, myAdoptionsAsOwner }: StatsPanelProps) {
  // ---- KPIs de gatos ----
  const totalCats = myCats.length;
  const availableCats = myCats.filter((c) => c.status === 'available').length;
  const pendingCats = myCats.filter((c) => c.status === 'pending').length;
  const adoptedCats = myCats.filter((c) => c.status === 'adopted').length;

  // ---- KPIs de solicitudes ----
  const totalApplications = receivedApplications.length;
  const approved = receivedApplications.filter((a) => a.status === 'approved').length;
  const rejected = receivedApplications.filter((a) => a.status === 'rejected').length;
  const approvalRate =
    approved + rejected > 0 ? Math.round((approved / (approved + rejected)) * 100) : 0;

  // ---- Adopciones del mes actual ----
  const now = new Date();
  const adoptionsThisMonth = myAdoptionsAsOwner.filter((a) => {
    const date = (a.adoptionDate as Timestamp).toDate();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;

  // ---- Gráfico de barras: adopciones por mes (últimos 6 meses) ----
  const adoptionsByMonth = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const label = d.toLocaleDateString('es-AR', { month: 'short' });
    const count = myAdoptionsAsOwner.filter((a) => {
      const date = (a.adoptionDate as Timestamp).toDate();
      return date.getMonth() === d.getMonth() && date.getFullYear() === d.getFullYear();
    }).length;
    return { mes: label, adopciones: count };
  });

  // ---- Gráfico de torta: estado de gatos ----
  const pieData = [
    { name: 'Disponibles', value: availableCats, color: '#84a98c' }, // sage
    { name: 'En proceso', value: pendingCats, color: '#f4a261' },    // naranja
    { name: 'Adoptados', value: adoptedCats, color: '#e76f51' },     // coral
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      {/* KPIs — fila 1: gatos */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Mis gatitos
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <KpiCard
            label="Total publicados"
            value={totalCats}
            icon={PawPrint}
            color="bg-gray-400"
          />
          <KpiCard
            label="Disponibles"
            value={availableCats}
            icon={Heart}
            color="bg-sage-500"
            sub="Esperando hogar"
          />
          <KpiCard
            label="En proceso"
            value={pendingCats}
            icon={Clock}
            color="bg-amber-400"
            sub="Solicitud en curso"
          />
          <KpiCard
            label="Adoptados"
            value={adoptedCats}
            icon={CheckCircle}
            color="bg-coral-500"
            sub="Con familia nueva"
          />
        </div>
      </div>

      {/* KPIs — fila 2: solicitudes */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Solicitudes recibidas
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <KpiCard
            label="Total solicitudes"
            value={totalApplications}
            icon={TrendingUp}
            color="bg-indigo-400"
          />
          <KpiCard
            label="Tasa de aprobación"
            value={`${approvalRate}%`}
            icon={CheckCircle}
            color="bg-emerald-400"
            sub={`${approved} aprobadas / ${rejected} rechazadas`}
          />
          <KpiCard
            label="Adopciones este mes"
            value={adoptionsThisMonth}
            icon={Heart}
            color="bg-coral-500"
            sub="Hogares nuevos"
          />
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Barras: adopciones por mes */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-soft p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            Adopciones concretadas — últimos 6 meses
          </h3>
          {myAdoptionsAsOwner.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
              Todavía no tenés adopciones registradas
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={adoptionsByMonth} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 13 }}
                  formatter={(value) => [value, 'Adopciones']}
                />
                <Bar dataKey="adopciones" fill="#e76f51" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Torta: estado de gatos */}
        <div className="bg-white rounded-2xl shadow-soft p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            Estado de mis gatitos
          </h3>
          {totalCats === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
              Todavía no publicaste ningún gatito
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="45%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => <span style={{ fontSize: 12, color: '#6b7280' }}>{value}</span>}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 13 }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Mensaje motivador si no hay datos */}
      {totalCats === 0 && totalApplications === 0 && (
        <div className="bg-cream-100 rounded-2xl p-6 text-center">
          <span className="text-4xl block mb-3">🐱</span>
          <p className="font-semibold text-gray-700">¡Empezá publicando tu primer gatito!</p>
          <p className="text-sm text-gray-500 mt-1">
            Cuando tengas gatos y solicitudes, acá vas a ver todas tus estadísticas.
          </p>
        </div>
      )}
    </div>
  );
}
