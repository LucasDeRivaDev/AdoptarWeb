// ============================================================
// DATOS DE EJEMPLO (SEED DATA)
// Corré este script UNA SOLA VEZ para poblar Firestore con datos de prueba.
// Uso: importar en una API route y llamar a seedDatabase()
// ============================================================

import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase/config';

const sampleCats = [
  {
    name: 'Mochi',
    ageMonths: 8,
    gender: 'female',
    description: 'Mochi es una gatita juguetona y muy cariñosa. Le encanta perseguir juguetes y se lleva bien con niños. Está buscando una familia que le dé amor y atención.',
    photos: [
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&q=80',
      'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=800&q=80',
    ],
    health: {
      vaccinated: true,
      sterilized: false,
      dewormed: true,
      microchipped: false,
      specialNeeds: false,
      notes: 'Al día con vacunas obligatorias.',
    },
    location: 'Santa Fe, Argentina',
    coordinates: { lat: -31.6333, lng: -60.7 },
    color: 'Naranja y blanco',
    breed: 'Mestiza',
    ownerId: 'seed-owner-1',
    ownerName: 'Rescatistas del Litoral',
    status: 'available',
  },
  {
    name: 'Simón',
    ageMonths: 24,
    gender: 'male',
    description: 'Simón es un gato tranquilo, perfecto para departamentos. Es muy independiente pero le gusta tener compañía humana por las noches. Castrado y con todas las vacunas.',
    photos: [
      'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=800&q=80',
    ],
    health: {
      vaccinated: true,
      sterilized: true,
      dewormed: true,
      microchipped: true,
      specialNeeds: false,
      notes: 'Completamente sano. Ideal para primer gato.',
    },
    location: 'Rosario, Santa Fe',
    coordinates: { lat: -32.9442, lng: -60.6505 },
    color: 'Gris atigrado',
    breed: 'Mestizo',
    ownerId: 'seed-owner-2',
    ownerName: 'Gatitos Rosario',
    status: 'available',
  },
  {
    name: 'Luna',
    ageMonths: 4,
    gender: 'female',
    description: 'Luna es un bebé gatita que encontramos sola en la calle. Necesita una familia que la críe con mucho amor. Es muy curiosa y se adapta rápido.',
    photos: [
      'https://images.unsplash.com/photo-1518791841217-8f162f1912da?w=800&q=80',
    ],
    health: {
      vaccinated: false,
      sterilized: false,
      dewormed: true,
      microchipped: false,
      specialNeeds: false,
      notes: 'Muy joven, aún no tiene vacunas. El adoptante deberá comprometerse a vacunarla.',
    },
    location: 'Buenos Aires, CABA',
    coordinates: { lat: -34.6037, lng: -58.3816 },
    color: 'Blanca con manchas negras',
    breed: 'Mestiza',
    ownerId: 'seed-owner-1',
    ownerName: 'Rescatistas del Litoral',
    status: 'available',
  },
  {
    name: 'Dante',
    ageMonths: 36,
    gender: 'male',
    description: 'Dante es un señor gato muy digno. Prefiere ambientes tranquilos y hogares sin perros. Se lleva bien con otros gatos si la presentación es gradual. Busca un hogar para siempre.',
    photos: [
      'https://images.unsplash.com/photo-1529778873920-4da4926a72c2?w=800&q=80',
    ],
    health: {
      vaccinated: true,
      sterilized: true,
      dewormed: true,
      microchipped: true,
      specialNeeds: false,
      notes: 'Excelente salud para su edad.',
    },
    location: 'Córdoba, Argentina',
    coordinates: { lat: -31.4201, lng: -64.1888 },
    color: 'Negro',
    breed: 'Mestizo',
    ownerId: 'seed-owner-3',
    ownerName: 'Hogar Felino Córdoba',
    status: 'available',
  },
  {
    name: 'Pistacho',
    ageMonths: 6,
    gender: 'male',
    description: 'Pistacho es el gato más energético que vas a conocer. Le encanta correr, trepar y explorar. Necesita un hogar grande y una familia activa que lo acompañe en sus aventuras.',
    photos: [
      'https://images.unsplash.com/photo-1495360010541-f48722b9a9f6?w=800&q=80',
    ],
    health: {
      vaccinated: true,
      sterilized: false,
      dewormed: true,
      microchipped: false,
      specialNeeds: false,
      notes: '',
    },
    location: 'Mendoza, Argentina',
    coordinates: { lat: -32.8908, lng: -68.8272 },
    color: 'Atigrado marrón',
    breed: 'Mestizo',
    ownerId: 'seed-owner-4',
    ownerName: 'Patas Mendocinas',
    status: 'available',
  },
  {
    name: 'Nieve',
    ageMonths: 18,
    gender: 'female',
    description: 'Nieve es tímida al principio, pero cuando te gana la confianza te da el amor más puro. Perfecta para personas tranquilas que quieran una compañera fiel.',
    photos: [
      'https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?w=800&q=80',
    ],
    health: {
      vaccinated: true,
      sterilized: true,
      dewormed: true,
      microchipped: false,
      specialNeeds: false,
      notes: 'FIV/Leucemia negativos.',
    },
    location: 'Santa Fe, Argentina',
    coordinates: { lat: -31.65, lng: -60.72 },
    color: 'Blanca',
    breed: 'Mestiza',
    ownerId: 'seed-owner-1',
    ownerName: 'Rescatistas del Litoral',
    status: 'available',
  },
];

export async function seedDatabase() {
  console.log('🌱 Iniciando seed de base de datos...');

  for (const cat of sampleCats) {
    const ref = await addDoc(collection(db, 'cats'), {
      ...cat,
      createdAt: serverTimestamp(),
    });
    console.log(`✅ Gato creado: ${cat.name} (${ref.id})`);
  }

  console.log('🎉 Seed completado!');
}
