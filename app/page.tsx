// ============================================================
// HOME PAGE — Landing principal
// Server Component: los datos se cargan en el servidor.
// ============================================================

// Revalida la página cada 5 minutos en segundo plano.
// Las visitas intermedias reciben la versión cacheada al instante.
export const revalidate = 300;

import Link from 'next/link';
import { getFeaturedCats, getPublicStats, PublicStats } from '@/lib/firebase/firestore';
import { Cat } from '@/types';
import { CatCard } from '@/components/cats/CatCard';
import { Button } from '@/components/ui/Button';
import { StatsSection } from '@/components/home/StatsSection';
import { Heart, PawPrint, Shield, Bell } from 'lucide-react';

export default async function HomePage() {
  // Cargar gatos destacados desde Firestore (server-side)
  let featuredCats: Cat[] = [];
  let stats: PublicStats | null = null;
  try {
    [featuredCats, stats] = await Promise.all([
      getFeaturedCats(3),
      getPublicStats(),
    ]);
  } catch {
    featuredCats = [];
    stats = null;
  }

  return (
    <div>
      {/* ---- HERO ----------------------------------------- */}
      <section className="hero-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 lg:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-coral-100 text-coral-600 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
              <PawPrint size={14} className="fill-coral-500" />
              Adopción responsable
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-800 leading-tight mb-6">
              Cada gatito merece
              <span className="text-coral-500"> un hogar</span>
              <span className="text-gray-400"> para siempre</span>
            </h1>

            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Conectamos gatitos que buscan familia con personas llenas de amor.
              Adoptá con responsabilidad, seguí el crecimiento de tu compañero
              y apoyá a los rescatistas que hacen esto posible.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/cats">
                <Button size="lg">
                  <Heart size={18} /> Ver gatitos disponibles
                </Button>
              </Link>
              <Link href="/cats/publish">
                <Button variant="outline" size="lg">
                  Publicar un gatito
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-8 mt-12 pt-8 border-t border-coral-100">
              {[
                { number: '200+', label: 'Adopciones exitosas' },
                { number: '50+', label: 'Rescatistas activos' },
                { number: '15', label: 'Ciudades' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold text-coral-500">{stat.number}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---- GATOS DESTACADOS ----------------------------- */}
      {featuredCats.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Gatitos que esperan por vos</h2>
              <p className="text-gray-500 mt-1">Disponibles para adopción ahora mismo</p>
            </div>
            <Link href="/cats" className="text-sm font-medium text-coral-500 hover:text-coral-600 transition-colors">
              Ver todos →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredCats.map((cat) => (
              <CatCard key={cat.id} cat={cat} />
            ))}
          </div>
        </section>
      )}

      {/* ---- ESTADÍSTICAS -------------------------------- */}
      {stats && <StatsSection stats={stats} />}

      {/* ---- CÓMO FUNCIONA -------------------------------- */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">¿Cómo funciona?</h2>
            <p className="text-gray-500">Adoptar es simple. Sostener es lo importante.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                icon: '🔍',
                title: 'Explorá',
                desc: 'Navegá por los perfiles de gatitos disponibles cerca tuyo.',
              },
              {
                icon: '📝',
                title: 'Aplicá',
                desc: 'Completá el formulario de adopción responsable.',
              },
              {
                icon: '🤝',
                title: 'Conectate',
                desc: 'El rescatador revisa tu solicitud y aprueba la adopción.',
              },
              {
                icon: '📊',
                title: 'Seguí',
                desc: 'Registrá vacunas, chequeos y momentos especiales en tu panel.',
              },
            ].map((step, i) => (
              <div key={i} className="text-center p-6 rounded-2xl bg-cream-100 hover:bg-cream-200 transition-colors">
                <span className="text-4xl block mb-4">{step.icon}</span>
                <h3 className="font-semibold text-gray-800 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- FEATURES ------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Shield,
              color: 'coral',
              title: 'Adopción responsable',
              desc: 'Verificamos a los adoptantes con un formulario completo antes de aprobar cada adopción.',
            },
            {
              icon: Bell,
              color: 'sage',
              title: 'Recordatorios automáticos',
              desc: 'Te recordamos las vacunas y chequeos por email para que tu gato siempre esté sano.',
            },
            {
              icon: Heart,
              color: 'amber',
              title: 'Seguimiento post-adopción',
              desc: 'Un panel dedicado para registrar el historial de salud y los momentos especiales.',
            },
          ].map((feat) => (
            <div key={feat.title} className="bg-white rounded-2xl p-6 shadow-card">
              <div className={`inline-flex p-3 rounded-xl mb-4 ${
                feat.color === 'coral' ? 'bg-coral-100 text-coral-500' :
                feat.color === 'sage' ? 'bg-sage-100 text-sage-500' :
                'bg-amber-100 text-amber-700'
              }`}>
                <feat.icon size={22} />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">{feat.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---- CTA FINAL ------------------------------------ */}
      <section className="bg-coral-500 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            ¿Tenés un gatito que necesita hogar?
          </h2>
          <p className="text-coral-100 mb-8">
            Si sos rescatista o encontraste un gatito en la calle, podés publicarlo en minutos
            y conectarte con potenciales adoptantes.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/cats/publish">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-coral-500">
                Publicar un gatito
              </Button>
            </Link>
            <Link href="/donate">
              <Button size="lg" className="bg-white text-coral-500 hover:bg-coral-50">
                Donar a rescatistas
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
