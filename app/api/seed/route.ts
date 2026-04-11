// ============================================================
// API ROUTE: /api/seed
// Popula Firestore con datos de ejemplo.
// USAR UNA SOLA VEZ en desarrollo. Eliminar en producción.
// ============================================================

import { NextResponse } from 'next/server';
import { seedDatabase } from '@/lib/seed-data';

export async function POST() {
  // Solo funciona en desarrollo
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'No disponible en producción' }, { status: 403 });
  }

  try {
    await seedDatabase();
    return NextResponse.json({ ok: true, message: 'Base de datos poblada con datos de ejemplo' });
  } catch (error) {
    console.error('[seed]', error);
    return NextResponse.json({ error: 'Error al poblar la base de datos' }, { status: 500 });
  }
}
