// ============================================================
// PÁGINA DE SPONSORS
// Muestra las marcas y empresas que colaboran con la plataforma.
// ============================================================

import Link from 'next/link';
import Image from 'next/image';
import { Sponsor } from '@/types';
import { Button } from '@/components/ui/Button';
import { ExternalLink, Star, Heart } from 'lucide-react';

// Sponsors de ejemplo — reemplazá con datos de Firestore cuando tengas sponsors reales
const SAMPLE_SPONSORS: Omit<Sponsor, 'createdAt'>[] = [
  {
    id: 's1',
    name: 'VetCare Argentina',
    logoURL: '',
    description: 'Red de clínicas veterinarias que ofrece descuentos exclusivos a los adoptantes de AdopcionWeb. Presentá tu comprobante de adopción y obtené 20% de descuento en consultas.',
    website: 'https://vetcare.com.ar',
    tier: 'gold',
    active: true,
  },
  {
    id: 's2',
    name: 'NutriPet',
    logoURL: '',
    description: 'Alimentos premium para gatos. Donamos 1kg de alimento por cada adopción registrada en la plataforma. ¡Ya donamos más de 200kg este año!',
    website: 'https://nutripet.com.ar',
    tier: 'gold',
    active: true,
  },
  {
    id: 's3',
    name: 'PetShop Online',
    logoURL: '',
    description: 'Tienda online de accesorios para mascotas. Código de descuento exclusivo para adoptantes: ADOPCIONWEB15',
    website: 'https://petshop.com.ar',
    tier: 'silver',
    active: true,
  },
  {
    id: 's4',
    name: 'Seguro Mascota',
    logoURL: '',
    description: 'El primer mes de seguro de salud para tu gato adoptado es gratis. Cubrimos consultas, cirugías y emergencias.',
    website: 'https://seguromascota.com.ar',
    tier: 'silver',
    active: true,
  },
  {
    id: 's5',
    name: 'Farmacia Veterinaria Del Sur',
    logoURL: '',
    description: 'Medicamentos y antiparasitarios con envío a todo el país. 10% de descuento para la comunidad AdopcionWeb.',
    website: '#',
    tier: 'bronze',
    active: true,
  },
  {
    id: 's6',
    name: 'Gráfica Huellas',
    logoURL: '',
    description: 'Diseño e impresión de collares, chapitas y accesorios personalizados para tu gato.',
    website: '#',
    tier: 'bronze',
    active: true,
  },
];

const TIER_CONFIG = {
  gold: {
    label: '🥇 Gold',
    bg: 'bg-amber-50 border-amber-200',
    badge: 'bg-amber-100 text-amber-700',
    size: 'col-span-1 md:col-span-2',
  },
  silver: {
    label: '🥈 Silver',
    bg: 'bg-gray-50 border-gray-200',
    badge: 'bg-gray-200 text-gray-700',
    size: 'col-span-1',
  },
  bronze: {
    label: '🥉 Bronze',
    bg: 'bg-orange-50 border-orange-100',
    badge: 'bg-orange-100 text-orange-700',
    size: 'col-span-1',
  },
  partner: {
    label: '🤝 Partner',
    bg: 'bg-blue-50 border-blue-100',
    badge: 'bg-blue-100 text-blue-700',
    size: 'col-span-1',
  },
};

function SponsorCard({ sponsor }: { sponsor: Omit<Sponsor, 'createdAt'> }) {
  const config = TIER_CONFIG[sponsor.tier];

  return (
    <div className={`border rounded-2xl p-5 ${config.bg} ${config.size} flex flex-col gap-4`}>
      <div className="flex items-start justify-between gap-3">
        {/* Logo o placeholder */}
        <div className="h-14 w-14 rounded-xl bg-white border border-gray-100 flex items-center justify-center flex-shrink-0 shadow-soft">
          {sponsor.logoURL ? (
            <Image src={sponsor.logoURL} alt={sponsor.name} width={48} height={48} className="object-contain" />
          ) : (
            <span className="text-2xl">🐾</span>
          )}
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${config.badge}`}>
          {config.label}
        </span>
      </div>

      <div>
        <h3 className="font-bold text-gray-800 text-base">{sponsor.name}</h3>
        <p className="text-sm text-gray-600 mt-1 leading-relaxed">{sponsor.description}</p>
      </div>

      {sponsor.website && sponsor.website !== '#' && (
        <a
          href={sponsor.website}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-coral-500 hover:text-coral-600 font-medium mt-auto"
        >
          Visitar sitio <ExternalLink size={13} />
        </a>
      )}
    </div>
  );
}

export default function SponsorsPage() {
  const goldSponsors = SAMPLE_SPONSORS.filter((s) => s.tier === 'gold');
  const silverSponsors = SAMPLE_SPONSORS.filter((s) => s.tier === 'silver');
  const bronzeSponsors = SAMPLE_SPONSORS.filter((s) => s.tier === 'bronze' || s.tier === 'partner');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 text-sm font-medium px-4 py-1.5 rounded-full mb-4">
          <Star size={14} className="fill-amber-500" />
          Nuestros sponsors
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-3">Marcas que apoyan la causa</h1>
        <p className="text-gray-500 max-w-xl mx-auto leading-relaxed">
          Estas empresas creen en la adopción responsable y colaboran activamente con AdopcionWeb
          para que más gatitos encuentren su hogar.
        </p>
      </div>

      {/* Gold sponsors */}
      {goldSponsors.length > 0 && (
        <section className="mb-10">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Sponsors Gold</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {goldSponsors.map((s) => <SponsorCard key={s.id} sponsor={s} />)}
          </div>
        </section>
      )}

      {/* Silver sponsors */}
      {silverSponsors.length > 0 && (
        <section className="mb-10">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Sponsors Silver</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {silverSponsors.map((s) => <SponsorCard key={s.id} sponsor={s} />)}
          </div>
        </section>
      )}

      {/* Bronze / Partner sponsors */}
      {bronzeSponsors.length > 0 && (
        <section className="mb-10">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Colaboradores</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {bronzeSponsors.map((s) => <SponsorCard key={s.id} sponsor={s} />)}
          </div>
        </section>
      )}

      {/* CTA para nuevos sponsors */}
      <div className="mt-12 bg-gradient-to-br from-coral-500 to-coral-600 rounded-3xl p-8 text-white text-center">
        <Heart size={32} className="mx-auto mb-3 fill-white opacity-80" />
        <h2 className="text-xl font-bold mb-2">¿Tu marca quiere sumarse?</h2>
        <p className="text-coral-100 text-sm mb-5 max-w-md mx-auto">
          Ser sponsor de AdopcionWeb es apoyar la adopción responsable y llegar a una comunidad
          de amantes de los animales en toda Argentina.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href="mailto:sponsors@adopcionweb.com">
            <Button className="bg-white text-coral-500 hover:bg-coral-50 w-full sm:w-auto" size="lg">
              Contactar para sponsorear
            </Button>
          </a>
          <Link href="/donate">
            <Button variant="outline" className="border-white text-white hover:bg-white/10 w-full sm:w-auto" size="lg">
              Ver donaciones
            </Button>
          </Link>
        </div>

        {/* Opciones de colaboración */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          {[
            { emoji: '🏷️', title: 'Descuentos', desc: 'Ofrecé descuentos exclusivos a nuestra comunidad adoptante' },
            { emoji: '🍽️', title: 'Donación de productos', desc: 'Alimento, accesorios o servicios para rescatistas' },
            { emoji: '📣', title: 'Visibilidad', desc: 'Tu logo y descripción en nuestra plataforma y redes' },
          ].map((item) => (
            <div key={item.title} className="bg-white/10 rounded-xl p-4">
              <span className="text-2xl block mb-2">{item.emoji}</span>
              <p className="font-semibold text-sm">{item.title}</p>
              <p className="text-xs text-coral-100 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
