// ============================================================
// API ROUTE: /api/reminders
// Cron job para enviar recordatorios de vacunas y chequeos.
// Se llama automáticamente (configurar en Vercel Cron Jobs).
// Vercel Cron: { "path": "/api/reminders", "schedule": "0 9 * * *" }
// = todos los días a las 9am UTC
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, where, query, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Adoption } from '@/types';
import { sendVaccineReminderEmail, sendCheckupReminderEmail } from '@/lib/resend';

// Vercel valida el header Authorization para Cron Jobs
function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const now = Timestamp.now();
  const inThreeDays = new Timestamp(now.seconds + 3 * 24 * 60 * 60, 0);

  let vaccineCount = 0;
  let checkupCount = 0;

  try {
    // Buscar adopciones con recordatorio de vacuna en los próximos 3 días
    const vaccineQuery = query(
      collection(db, 'adoptions'),
      where('nextVaccineReminder', '<=', inThreeDays),
      where('nextVaccineReminder', '>=', now)
    );
    const vaccineSnap = await getDocs(vaccineQuery);

    for (const doc of vaccineSnap.docs) {
      const adoption = { id: doc.id, ...doc.data() } as Adoption;
      await sendVaccineReminderEmail(
        adoption.adopterEmail,
        adoption.adopterName,
        adoption.catName,
        adoption.id
      );
      vaccineCount++;
    }

    // Buscar adopciones con recordatorio de chequeo en los próximos 3 días
    const checkupQuery = query(
      collection(db, 'adoptions'),
      where('nextCheckupReminder', '<=', inThreeDays),
      where('nextCheckupReminder', '>=', now)
    );
    const checkupSnap = await getDocs(checkupQuery);

    for (const doc of checkupSnap.docs) {
      const adoption = { id: doc.id, ...doc.data() } as Adoption;
      await sendCheckupReminderEmail(
        adoption.adopterEmail,
        adoption.adopterName,
        adoption.catName,
        adoption.id
      );
      checkupCount++;
    }

    return NextResponse.json({
      ok: true,
      sent: { vaccine: vaccineCount, checkup: checkupCount },
    });
  } catch (error) {
    console.error('[reminders]', error);
    return NextResponse.json({ error: 'Error procesando recordatorios' }, { status: 500 });
  }
}
