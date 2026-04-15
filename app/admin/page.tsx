'use client';

// ============================================================
// PANEL DE ADMINISTRACIÓN
// Solo accesible con role='admin' en Firestore.
// Tabs: Usuarios | Gatos | Solicitudes | Adopciones
// ============================================================

import { useState, useEffect, useMemo } from 'react';
import { AdminGuard } from '@/components/auth/AdminGuard';
import {
  adminGetAllUsers,
  adminGetAllCats,
  adminGetAllApplications,
  adminGetAllAdoptions,
  adminSetUserRole,
} from '@/lib/firebase/firestore';
import { UserProfile, Cat, AdoptionApplication, Adoption } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Badge } from '@/components/ui/Badge';
import { formatRelativeDate, formatHousingType, getApplicationStatusLabel } from '@/lib/utils';
import { Users, PawPrint, FileText, Heart, Search, ShieldCheck, Ban, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type Tab = 'users' | 'cats' | 'applications' | 'adoptions';

// ---- helpers de display ----

const roleLabel: Record<string, string> = {
  adopter: 'Adoptante',
  rescuer: 'Rescatista',
  foundation: 'Fundación',
  admin: 'Admin',
  banned: 'Baneado',
};

const roleColor: Record<string, 'coral' | 'sage' | 'amber' | 'gray'> = {
  adopter: 'gray',
  rescuer: 'sage',
  foundation: 'coral',
  admin: 'amber',
  banned: 'coral',
};

const statusColor: Record<string, 'coral' | 'sage' | 'amber' | 'gray'> = {
  pending: 'amber',
  approved: 'sage',
  rejected: 'coral',
  available: 'sage',
  adopted: 'gray',
};

const catStatusLabel: Record<string, string> = {
  available: 'Disponible',
  pending: 'En proceso',
  adopted: 'Adoptado',
};

function ageLabel(months: number) {
  if (months < 12) return `${months}m`;
  return `${Math.floor(months / 12)}a`;
}

// ---- Barra de búsqueda ----

function SearchBar({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="relative mb-5">
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-coral-300 bg-white"
      />
    </div>
  );
}

// ---- Tab: Usuarios ----

function BanModal({ user, onConfirm, onCancel }: {
  user: UserProfile;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}) {
  const [reason, setReason] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-1">Banear usuario</h2>
        <p className="text-sm text-gray-500 mb-4">
          Escribí el motivo del ban para <strong>{user.name}</strong>. El usuario lo va a ver cuando intente entrar.
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Ej: Comportamiento inapropiado, múltiples denuncias de otros usuarios..."
          rows={3}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-300"
        />
        <div className="flex gap-3 mt-4 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(reason.trim())}
            disabled={!reason.trim()}
            className="px-4 py-2 text-sm rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors disabled:opacity-40"
          >
            Confirmar ban
          </button>
        </div>
      </div>
    </div>
  );
}

function UsersTab({ users: initialUsers }: { users: UserProfile[] }) {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState(initialUsers);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [banTarget, setBanTarget] = useState<UserProfile | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter((u) =>
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.location ?? '').toLowerCase().includes(q)
    );
  }, [users, search]);

  async function handleBan(u: UserProfile, reason: string) {
    setBanTarget(null);
    setLoadingId(u.id);
    try {
      await adminSetUserRole(u.id, 'banned', reason);
      setUsers((prev) => prev.map((x) => x.id === u.id ? { ...x, role: 'banned', banReason: reason } : x));
    } finally {
      setLoadingId(null);
    }
  }

  async function handleUnban(u: UserProfile) {
    setLoadingId(u.id);
    try {
      await adminSetUserRole(u.id, 'adopter');
      setUsers((prev) => prev.map((x) => x.id === u.id ? { ...x, role: 'adopter', banReason: undefined } : x));
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div>
      {banTarget && (
        <BanModal
          user={banTarget}
          onConfirm={(reason) => handleBan(banTarget, reason)}
          onCancel={() => setBanTarget(null)}
        />
      )}
      <SearchBar value={search} onChange={setSearch} placeholder="Buscar por nombre, email o ciudad..." />
      <div className="space-y-3">
        {filtered.length === 0 && <p className="text-center text-gray-400 py-10">Sin resultados</p>}
        {filtered.map((u) => (
          <div key={u.id} className={cn('bg-white rounded-2xl border shadow-soft p-4 flex items-center gap-4', u.role === 'banned' ? 'border-red-200 opacity-60' : 'border-gray-100')}>
            {u.photoURL ? (
              <img src={u.photoURL} alt={u.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-cream-200 flex items-center justify-center text-sm font-bold text-gray-500 flex-shrink-0">
                {u.name[0]?.toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium text-gray-800 text-sm">{u.name}</p>
                <Badge label={roleLabel[u.role] ?? u.role} color={roleColor[u.role] ?? 'gray'} />
              </div>
              <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400 flex-wrap">
                <a href={`mailto:${u.email}`} className="hover:text-coral-500 transition-colors">{u.email}</a>
                {u.phone && <span>📱 {u.phone}</span>}
                {u.location && <span>📍 {u.location}</span>}
                <span>{formatRelativeDate(u.createdAt)}</span>
              </div>
              {u.role === 'banned' && u.banReason && (
                <p className="mt-1 text-xs text-red-400 italic">Motivo: {u.banReason}</p>
              )}
            </div>
            {u.role !== 'admin' && (
              <button
                onClick={() => u.role === 'banned' ? handleUnban(u) : setBanTarget(u)}
                disabled={loadingId === u.id}
                title={u.role === 'banned' ? 'Desbanear usuario' : 'Banear usuario'}
                className={cn(
                  'flex-shrink-0 p-2 rounded-xl transition-colors disabled:opacity-50',
                  u.role === 'banned'
                    ? 'text-sage-600 hover:bg-sage-50'
                    : 'text-red-400 hover:bg-red-50'
                )}
              >
                {u.role === 'banned' ? <CheckCircle size={18} /> : <Ban size={18} />}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Tab: Gatos ----

function CatsTab({ cats }: { cats: Cat[] }) {
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return cats.filter((c) =>
      c.name.toLowerCase().includes(q) ||
      c.ownerName.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q)
    );
  }, [cats, search]);

  return (
    <div>
      <SearchBar value={search} onChange={setSearch} placeholder="Buscar por nombre, rescatista o ciudad..." />
      <div className="space-y-3">
        {filtered.length === 0 && <p className="text-center text-gray-400 py-10">Sin resultados</p>}
        {filtered.map((cat) => (
          <div key={cat.id} className="bg-white rounded-2xl border border-gray-100 shadow-soft p-4 flex items-center gap-4">
            {cat.photos[0] ? (
              <img src={cat.photos[0]} alt={cat.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-cream-200 flex items-center justify-center text-2xl flex-shrink-0">🐱</div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium text-gray-800">{cat.name}</p>
                <Badge label={catStatusLabel[cat.status] ?? cat.status} color={statusColor[cat.status] ?? 'gray'} />
                <span className="text-xs text-gray-400">{cat.gender === 'male' ? 'Macho' : 'Hembra'} · {ageLabel(cat.ageMonths)}</span>
              </div>
              <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400 flex-wrap">
                <span>👤 {cat.ownerName}</span>
                <span>📍 {cat.location}</span>
                <span>{formatRelativeDate(cat.createdAt)}</span>
              </div>
            </div>
            <Link href={`/cats/${cat.id}`} className="text-xs text-coral-500 hover:underline flex-shrink-0">
              Ver ficha →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Tab: Solicitudes ----

function ApplicationsTab({ applications }: { applications: AdoptionApplication[] }) {
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return applications.filter((a) =>
      a.applicantName.toLowerCase().includes(q) ||
      a.applicantEmail.toLowerCase().includes(q) ||
      a.catName.toLowerCase().includes(q)
    );
  }, [applications, search]);

  return (
    <div>
      <SearchBar value={search} onChange={setSearch} placeholder="Buscar por adoptante, email o nombre del gato..." />
      <div className="space-y-3">
        {filtered.length === 0 && <p className="text-center text-gray-400 py-10">Sin resultados</p>}
        {filtered.map((app) => (
          <div key={app.id} className="bg-white rounded-2xl border border-gray-100 shadow-soft p-4 space-y-3">
            <div className="flex items-start gap-3">
              {app.catPhoto && (
                <img src={app.catPhoto} alt={app.catName} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-gray-800 text-sm">{app.catName}</p>
                  <Badge label={getApplicationStatusLabel(app.status)} color={statusColor[app.status] ?? 'gray'} />
                  <span className="text-xs text-gray-400">{formatRelativeDate(app.createdAt)}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Solicitante: <strong>{app.applicantName}</strong>
                </p>
              </div>
            </div>

            {/* Datos de contacto completos */}
            <div className="bg-cream-50 rounded-xl p-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-gray-600">
              <a href={`mailto:${app.applicantEmail}`} className="flex items-center gap-1.5 hover:text-coral-500">
                <span>✉️</span> {app.applicantEmail}
              </a>
              {app.applicantPhone && (
                <a href={`https://wa.me/${app.applicantPhone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-coral-500">
                  <span>📱</span> {app.applicantPhone}
                </a>
              )}
              {app.applicantAddress && (
                <span className="flex items-center gap-1.5">
                  <span>📍</span> {app.applicantAddress}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <span>🏠</span> {formatHousingType(app.housingType)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Tab: Adopciones ----

function AdoptionsTab({ adoptions }: { adoptions: Adoption[] }) {
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return adoptions.filter((a) =>
      a.adopterName.toLowerCase().includes(q) ||
      a.adopterEmail.toLowerCase().includes(q) ||
      a.catName.toLowerCase().includes(q)
    );
  }, [adoptions, search]);

  return (
    <div>
      <SearchBar value={search} onChange={setSearch} placeholder="Buscar por adoptante, email o nombre del gato..." />
      <div className="space-y-3">
        {filtered.length === 0 && <p className="text-center text-gray-400 py-10">Sin resultados</p>}
        {filtered.map((adoption) => (
          <div key={adoption.id} className="bg-white rounded-2xl border border-gray-100 shadow-soft p-4 flex items-center gap-4">
            {adoption.catPhoto ? (
              <img src={adoption.catPhoto} alt={adoption.catName} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-cream-200 flex items-center justify-center text-2xl flex-shrink-0">🐱</div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-800">{adoption.catName}</p>
              <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400 flex-wrap">
                <span>👤 {adoption.adopterName}</span>
                <a href={`mailto:${adoption.adopterEmail}`} className="hover:text-coral-500">{adoption.adopterEmail}</a>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Adoptado {formatRelativeDate(adoption.adoptionDate)}
              </p>
            </div>
            <Link href={`/track/${adoption.id}`} className="text-xs text-coral-500 hover:underline flex-shrink-0">
              Ver seguimiento →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Página principal ----

function AdminContent() {
  const [activeTab, setActiveTab] = useState<Tab>('users');
  const [loading, setLoading] = useState(true);

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [cats, setCats] = useState<Cat[]>([]);
  const [applications, setApplications] = useState<AdoptionApplication[]>([]);
  const [adoptions, setAdoptions] = useState<Adoption[]>([]);

  useEffect(() => {
    Promise.all([
      adminGetAllUsers(),
      adminGetAllCats(),
      adminGetAllApplications(),
      adminGetAllAdoptions(),
    ]).then(([u, c, a, ad]) => {
      setUsers(u);
      setCats(c);
      setApplications(a);
      setAdoptions(ad);
    }).finally(() => setLoading(false));
  }, []);

  const tabs = [
    { id: 'users' as Tab,        label: 'Usuarios',     icon: Users,    count: users.length },
    { id: 'cats' as Tab,         label: 'Gatos',        icon: PawPrint, count: cats.length },
    { id: 'applications' as Tab, label: 'Solicitudes',  icon: FileText, count: applications.filter(a => a.status === 'pending').length },
    { id: 'adoptions' as Tab,    label: 'Adopciones',   icon: Heart,    count: adoptions.length },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 bg-coral-100 rounded-xl">
          <ShieldCheck size={22} className="text-coral-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Panel de administración</h1>
          <p className="text-sm text-gray-400">Vista completa de la plataforma</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-2xl p-1.5 shadow-soft mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all',
              activeTab === tab.id
                ? 'bg-coral-500 text-white shadow-sm'
                : 'text-gray-600 hover:bg-cream-100'
            )}
          >
            <tab.icon size={15} />
            {tab.label}
            {tab.count > 0 && (
              <span className={cn(
                'text-xs rounded-full px-1.5 py-0.5 font-semibold',
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
              )}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Contenido */}
      {loading ? (
        <LoadingSpinner className="py-20" />
      ) : (
        <>
          {activeTab === 'users'        && <UsersTab users={users} />}
          {activeTab === 'cats'         && <CatsTab cats={cats} />}
          {activeTab === 'applications' && <ApplicationsTab applications={applications} />}
          {activeTab === 'adoptions'    && <AdoptionsTab adoptions={adoptions} />}
        </>
      )}
    </div>
  );
}

export default function AdminPage() {
  return (
    <AdminGuard>
      <AdminContent />
    </AdminGuard>
  );
}
