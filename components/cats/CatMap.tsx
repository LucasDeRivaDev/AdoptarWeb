'use client';

// ============================================================
// MAPA DE GATOS — react-leaflet
// IMPORTANTE: Este componente se importa con dynamic({ ssr: false })
// porque Leaflet usa window/document que no existen en el servidor.
// ============================================================

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { divIcon } from 'leaflet';
import Link from 'next/link';
import { Cat } from '@/types';

// Fix del ícono por defecto de Leaflet (problema conocido con webpack)
import 'leaflet/dist/leaflet.css';

interface CatMapProps {
  cats: Cat[];
}

// Ícono personalizado con la paleta del proyecto
function createCatIcon(isSpecialNeeds: boolean) {
  const bg = isSpecialNeeds ? '#f97316' : '#f87171'; // naranja si necesidades especiales, coral si no
  return divIcon({
    html: `
      <div style="
        background: ${bg};
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
      ">🐱</div>
    `,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
}

function ageLabel(months: number): string {
  if (months < 12) return `${months} ${months === 1 ? 'mes' : 'meses'}`;
  const years = Math.floor(months / 12);
  return `${years} ${years === 1 ? 'año' : 'años'}`;
}

export function CatMap({ cats }: CatMapProps) {
  // Filtrar solo los gatos que tienen coordenadas
  const mappableCats = cats.filter((c) => c.coordinates);

  return (
    <div className="rounded-2xl overflow-hidden shadow-soft border border-gray-100" style={{ height: '520px' }}>
      {mappableCats.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center bg-cream-50 text-gray-400 gap-3">
          <span className="text-5xl">🗺️</span>
          <p className="text-sm">Ningún gatito tiene ubicación en el mapa todavía.</p>
        </div>
      ) : (
        <MapContainer
          center={[-34.0, -64.0]}
          zoom={5}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
        >
          {/* Tiles de OpenStreetMap — gratuito, sin API key */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {mappableCats.map((cat) => (
            <Marker
              key={cat.id}
              position={[cat.coordinates!.lat, cat.coordinates!.lng]}
              icon={createCatIcon(cat.health.specialNeeds)}
            >
              <Popup className="cat-popup">
                <div className="flex flex-col gap-2 min-w-[180px]">
                  {/* Foto */}
                  {cat.photos[0] && (
                    <img
                      src={cat.photos[0]}
                      alt={cat.name}
                      className="w-full h-28 object-cover rounded-lg"
                    />
                  )}

                  {/* Info */}
                  <div>
                    <p className="font-semibold text-gray-800 text-base">{cat.name}</p>
                    <p className="text-xs text-gray-500">
                      {cat.gender === 'male' ? 'Macho' : 'Hembra'} · {ageLabel(cat.ageMonths)}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{cat.location}</p>
                  </div>

                  {/* Badges salud */}
                  <div className="flex flex-wrap gap-1">
                    {cat.health.vaccinated && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">💉 Vacunado</span>
                    )}
                    {cat.health.sterilized && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">✂️ Castrado</span>
                    )}
                    {cat.health.specialNeeds && (
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">❤️ Esp. especiales</span>
                    )}
                  </div>

                  {/* Botón ver ficha */}
                  <Link
                    href={`/cats/${cat.id}`}
                    className="block text-center text-sm font-medium bg-coral-500 hover:bg-coral-600 text-white py-1.5 rounded-lg transition-colors"
                  >
                    Ver ficha completa →
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
    </div>
  );
}
