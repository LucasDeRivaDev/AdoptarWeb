// ============================================================
// SISTEMA DE EMAILS CON RESEND
// Las funciones de envío se llaman desde API Routes (servidor).
// NUNCA llamar estas funciones desde el frontend.
// ============================================================

import { Resend } from 'resend';

// Si no hay API key, las funciones de email no hacen nada (fallan silenciosamente)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
// En plan gratuito de Resend sin dominio propio: usar onboarding@resend.dev
// Con dominio verificado: setear RESEND_FROM_EMAIL=noreply@tudominio.com en Vercel
const FROM = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev';

// ---- BIENVENIDA AL ADOPTANTE ------------------------------

export async function sendWelcomeEmail(to: string, adopterName: string, catName: string) {
  if (!resend) return;
  return resend.emails.send({
    from: FROM,
    to,
    subject: `¡Bienvenido/a, ${adopterName}! Tu adopción de ${catName} fue aprobada 🐱`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #E05A3A;">¡Felicitaciones, ${adopterName}!</h1>
        <p>Tu solicitud de adopción para <strong>${catName}</strong> fue aprobada.</p>
        <p>Desde ahora podés registrar vacunas, turnos médicos y fotos en tu panel de seguimiento.</p>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard"
           style="display:inline-block;background:#E05A3A;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:16px;">
          Ver mi panel
        </a>
        <p style="margin-top:32px;color:#888;font-size:14px;">
          Con amor, el equipo de AdopcionWeb 🐾
        </p>
      </div>
    `,
  });
}

// ---- RECORDATORIO DE VACUNA --------------------------------

export async function sendVaccineReminderEmail(
  to: string,
  adopterName: string,
  catName: string,
  adoptionId: string
) {
  if (!resend) return;
  return resend.emails.send({
    from: FROM,
    to,
    subject: `Recordatorio: es hora de vacunar a ${catName} 💉`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #E05A3A;">Hola, ${adopterName}!</h1>
        <p>Ya pasaron 3 meses desde que adoptaste a <strong>${catName}</strong>.</p>
        <p>Es un buen momento para revisar el calendario de vacunas con tu veterinario.</p>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/track/${adoptionId}"
           style="display:inline-block;background:#E05A3A;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:16px;">
          Registrar vacuna
        </a>
        <p style="margin-top:32px;color:#888;font-size:14px;">
          Con amor, el equipo de AdopcionWeb 🐾
        </p>
      </div>
    `,
  });
}

// ---- RECORDATORIO DE CHEQUEO / CASTRACIÓN -----------------

export async function sendCheckupReminderEmail(
  to: string,
  adopterName: string,
  catName: string,
  adoptionId: string
) {
  if (!resend) return;
  return resend.emails.send({
    from: FROM,
    to,
    subject: `Recordatorio: chequeo de salud para ${catName} 🏥`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #3D8F73;">Hola, ${adopterName}!</h1>
        <p>Han pasado 6 meses desde la adopción de <strong>${catName}</strong>. ¡Tiempo de chequeo!</p>
        <p>Si ${catName} todavía no está castrado/a, este es el momento ideal.</p>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/track/${adoptionId}"
           style="display:inline-block;background:#3D8F73;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:16px;">
          Registrar visita
        </a>
        <p style="margin-top:32px;color:#888;font-size:14px;">
          Con amor, el equipo de AdopcionWeb 🐾
        </p>
      </div>
    `,
  });
}

// ---- NOTIFICACIÓN AL RESCATADOR cuando hay solicitud ------

export async function sendApplicationNotificationEmail(
  to: string,
  rescuerName: string,
  catName: string,
  applicantName: string
) {
  if (!resend) return;
  return resend.emails.send({
    from: FROM,
    to,
    subject: `Nueva solicitud de adopción para ${catName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #E05A3A;">Nueva solicitud</h1>
        <p>Hola, ${rescuerName}.</p>
        <p><strong>${applicantName}</strong> quiere adoptar a <strong>${catName}</strong>.</p>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard"
           style="display:inline-block;background:#E05A3A;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:16px;">
          Ver solicitudes
        </a>
      </div>
    `,
  });
}
