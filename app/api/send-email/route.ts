// ============================================================
// API ROUTE: /api/send-email
// Recibe peticiones del frontend y envía emails con Resend.
// SOLO se ejecuta en el servidor — acceso a process.env seguros.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import {
  sendWelcomeEmail,
  sendVaccineReminderEmail,
  sendCheckupReminderEmail,
  sendApplicationNotificationEmail,
} from '@/lib/resend';
import { getUserProfile } from '@/lib/firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type } = body;

    switch (type) {
      // Cuando se aprueba una adopción
      case 'welcome': {
        const { to, adopterName, catName } = body;
        await sendWelcomeEmail(to, adopterName, catName);
        return NextResponse.json({ ok: true });
      }

      // Cuando se envía una solicitud (notificar al dueño)
      case 'application_notification': {
        const { catName, applicantName, ownerId } = body;
        // Buscar el email del dueño en Firestore
        const owner = await getUserProfile(ownerId);
        if (owner) {
          await sendApplicationNotificationEmail(
            owner.email,
            owner.name,
            catName,
            applicantName
          );
        }
        return NextResponse.json({ ok: true });
      }

      // Recordatorio de vacuna (llamado por cron job)
      case 'vaccine_reminder': {
        const { to, adopterName, catName, adoptionId } = body;
        await sendVaccineReminderEmail(to, adopterName, catName, adoptionId);
        return NextResponse.json({ ok: true });
      }

      // Recordatorio de chequeo (llamado por cron job)
      case 'checkup_reminder': {
        const { to, adopterName, catName, adoptionId } = body;
        await sendCheckupReminderEmail(to, adopterName, catName, adoptionId);
        return NextResponse.json({ ok: true });
      }

      default:
        return NextResponse.json({ error: 'Tipo de email no válido' }, { status: 400 });
    }
  } catch (error) {
    console.error('[send-email]', error);
    return NextResponse.json({ error: 'Error al enviar email' }, { status: 500 });
  }
}
