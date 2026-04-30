'use client';

// ============================================================
// DASHBOARD DEL USUARIO
// Tabs: Mis solicitudes | Mis publicaciones | Mis adopciones
// ============================================================

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import {
  getApplicationsByApplicant,
  getApplicationsByOwner,
  getCatsByOwner,
  getAdoptionsByAdopter,
  getAdoptionsByOwner,
} from '@/lib/firebase/firestore';
import { AdoptionApplication, Cat, Adoption } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { ApplicationCard } from '@/components/dashboard/ApplicationCard';
import { AdoptionTrackCard } from '@/components/dashboard/AdoptionTrackCard';
import { StatsPanel } from '@/components/dashboard/StatsPanel';
import { CatCard } from '@/components/cats/CatCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Heart, PawPrint, BookOpen, FileText, BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'my-applications' | 'received-applications' | 'my-cats' | 'my-adoptions' | 'stats';

function DashboardContent() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('my-applications');
  const [loading, setLoading] = useState(false);

  const [myApplications, setMyApplications] = useState<AdoptionApplication[]>([]);
  const [receivedApplications, setReceivedApplications] = useState<AdoptionApplication[]>([]);
  const [myCats, setMyCats] = useState<Cat[]>([]);
  const [myAdoptions, setMyAdoptions] = useState<Adoption[]>([]);
  const [myAdoptionsAsOwner, setMyAdoptionsAsOwner] = useState<Adoption[]>([]);

  const isRescuer = profile?.role === 'rescuer' || profile?.role === 'foundation';

  useEffect(() => {
    if (!profile) return;
    setLoading(true);

    const queries: Promise<unknown>[] = [
      getApplicationsByApplicant(profile.id),
      getApplicationsByOwner(profile.id),
      getCatsByOwner(profile.id),
      getAdoptionsByAdopter(profile.id),
    ];

    if (isRescuer) {
      queries.push(getAdoptionsByOwner(profile.id));
    }

    Promise.all(queries)
      .then(([apps, received, cats, adoptions, ownerAdoptions]) => {
        setMyApplications(apps as AdoptionApplication[]);
        setReceivedApplications(received as AdoptionApplication[]);
        setMyCats(cats as Cat[]);
        setMyAdoptions(adoptions as Adoption[]);
        if (ownerAdoptions) setMyAdoptionsAsOwner(ownerAdoptions as Adoption[]);
      })
      .finally(() => setLoading(false));
  }, [profile, isRescuer]);

  if (!profile) return null;

  const tabs: { id: Tab; label: string; icon: typeof Heart; count?: number }[] = [
    {
      id: 'my-applications',
      label: 'Mis solicitudes',
      icon: FileText,
      count: myApplications.length,
    },
    {
      id: 'received-applications',
      label: 'Solicitudes recibidas',
      icon: BookOpen,
      count: receivedApplications.filter((a) => a.status === 'pending').length,
    },
    {
      id: 'my-cats',
      label: 'Mis publicaciones',
      icon: PawPrint,
      count: myCats.length,
    },
    {
      id: 'my-adoptions',
      label: 'Mis adopciones',
      icon: Heart,
      count: myAdoptions.length,
    },
    ...(isRescuer
      ? [{ id: 'stats' as Tab, label: 'Estadísticas', icon: BarChart2 }]
      : []),
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Profile Header */}
      <div className="flex items-center gap-4 mb-8 bg-white rounded-2xl shadow-soft p-5">
        <Avatar src={profile.photoURL} name={profile.name} size="lg" />
        <div>
          <h1 className="text-xl font-bold text-gray-800">{profile.name}</h1>
          <p className="text-sm text-gray-500">{profile.email}</p>
          <Badge
            label={profile.role === 'adopter' ? 'Adoptante' : profile.role === 'rescuer' ? 'Rescatista' : 'Fundación'}
            color={profile.role === 'foundation' ? 'coral' : profile.role === 'rescuer' ? 'sage' : 'gray'}
            className="mt-1"
          />
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
            {tab.count !== undefined && tab.count > 0 && (
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

      {/* Content */}
      {loading ? (
        <LoadingSpinner className="py-20" />
      ) : (
        <>
          {/* MIS SOLICITUDES */}
          {activeTab === 'my-applications' && (
            <div className="space-y-4">
              {myApplications.length === 0 ? (
                <EmptyState icon="📝" message="Todavía no enviaste ninguna solicitud" sub="Explorá los gatitos disponibles y aplicá para adoptar" />
              ) : (
                myApplications.map((app) => (
                  <ApplicationCard key={app.id} application={app} viewAs="applicant" />
                ))
              )}
            </div>
          )}

          {/* SOLICITUDES RECIBIDAS */}
          {activeTab === 'received-applications' && (
            <div className="space-y-4">
              {receivedApplications.length === 0 ? (
                <EmptyState icon="📬" message="No recibiste solicitudes aún" sub="Cuando alguien quiera adoptar tus gatitos, aparecerán acá" />
              ) : (
                receivedApplications.map((app) => (
                  <ApplicationCard
                    key={app.id}
                    application={app}
                    viewAs="owner"
                    onUpdate={() => {
                      getApplicationsByOwner(profile.id).then(setReceivedApplications);
                    }}
                  />
                ))
              )}
            </div>
          )}

          {/* MIS GATOS PUBLICADOS */}
          {activeTab === 'my-cats' && (
            <div>
              {myCats.length === 0 ? (
                <EmptyState icon="🐱" message="No publicaste ningún gatito todavía" sub="Ayudá a un gatito a encontrar hogar publicando su perfil" />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {myCats.map((cat) => (
                    <CatCard key={cat.id} cat={cat} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MIS ADOPCIONES */}
          {activeTab === 'my-adoptions' && (
            <div className="space-y-4">
              {myAdoptions.length === 0 ? (
                <EmptyState icon="🏠" message="Todavía no tenés adopciones registradas" sub="Cuando adoptes un gatito, podrás seguir su historia acá" />
              ) : (
                myAdoptions.map((adoption) => (
                  <AdoptionTrackCard key={adoption.id} adoption={adoption} />
                ))
              )}
            </div>
          )}

          {/* ESTADÍSTICAS — solo rescatistas y fundaciones */}
          {activeTab === 'stats' && isRescuer && (
            <StatsPanel
              myCats={myCats}
              receivedApplications={receivedApplications}
              myAdoptionsAsOwner={myAdoptionsAsOwner}
            />
          )}
        </>
      )}
    </div>
  );
}

function EmptyState({ icon, message, sub }: { icon: string; message: string; sub: string }) {
  return (
    <div className="text-center py-16">
      <span className="text-5xl block mb-4">{icon}</span>
      <p className="font-semibold text-gray-600 mb-1">{message}</p>
      <p className="text-sm text-gray-400">{sub}</p>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
