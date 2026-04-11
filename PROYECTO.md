# AdopcionWeb — Documentación del Proyecto

> Plataforma de adopción responsable de gatos. Conecta gatitos que buscan hogar con familias llenas de amor.

---

## ¿Qué es esto?

AdopcionWeb no es solo un listado de gatos. Es una plataforma completa donde:

- Cualquiera puede **ver gatitos disponibles** sin registrarse
- Los usuarios registrados pueden **aplicar para adoptar**
- Los rescatistas pueden **publicar gatos** y **gestionar solicitudes**
- Los adoptantes tienen un **panel de seguimiento** post-adopción
- Se envían **recordatorios automáticos** de vacunas y chequeos por email
- Las fundaciones pueden **recibir donaciones**
- Las marcas pueden **aparecer como sponsors**

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Estilos | Tailwind CSS con paleta custom |
| Base de datos | Firebase Firestore |
| Autenticación | Firebase Auth — Google OAuth |
| Almacenamiento | Firebase Storage (pendiente activar) / Cloudinary (futuro) |
| Emails | Resend |
| Deploy | Vercel |
| Cron jobs | Vercel Cron (recordatorios automáticos) |

---

## Paleta de colores

| Nombre | Hex | Uso |
|---|---|---|
| cream | `#FFF8F0` | Fondo principal |
| coral-500 | `#E05A3A` | Color primario, CTAs, brand |
| sage-500 | `#3D8F73` | Color secundario, salud, aprobaciones |
| amber-soft | `#F2CC8F` | Acentos, recordatorios |

---

## Estructura de archivos

```
adopcionweb/
├── app/
│   ├── page.tsx                    → Home / Landing
│   ├── login/page.tsx              → Login con Google
│   ├── cats/page.tsx               → Grid de gatos con filtros
│   ├── cats/[id]/page.tsx          → Detalle de gato + solicitar adopción
│   ├── cats/publish/page.tsx       → Formulario publicar gato
│   ├── dashboard/page.tsx          → Panel del usuario (4 tabs)
│   ├── donate/page.tsx             → Donaciones a fundaciones
│   ├── sponsors/page.tsx           → Marcas sponsors
│   ├── track/[adoptionId]/page.tsx → Seguimiento post-adopción
│   └── api/
│       ├── send-email/route.ts     → Envío de emails con Resend
│       ├── reminders/route.ts      → Cron job de recordatorios
│       └── seed/route.ts           → Poblar DB con datos de ejemplo
│
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Badge.tsx
│   │   ├── Input.tsx
│   │   ├── Textarea.tsx
│   │   ├── Select.tsx
│   │   ├── Modal.tsx
│   │   ├── Avatar.tsx
│   │   └── LoadingSpinner.tsx
│   ├── layout/
│   │   ├── Header.tsx              → Navbar con links y menú de usuario
│   │   ├── Footer.tsx
│   │   └── Providers.tsx           → Envuelve la app con AuthProvider
│   ├── cats/
│   │   ├── CatCard.tsx             → Tarjeta de gato en el grid
│   │   ├── CatGrid.tsx             → Grid responsivo con skeleton loader
│   │   ├── CatFilters.tsx          → Filtros de búsqueda
│   │   ├── PhotoUpload.tsx         → Upload de fotos con preview
│   │   └── ApplicationForm.tsx     → Formulario de solicitud de adopción
│   ├── dashboard/
│   │   ├── ApplicationCard.tsx     → Tarjeta de solicitud con aprobar/rechazar
│   │   └── AdoptionTrackCard.tsx   → Tarjeta de adopción con próximo recordatorio
│   └── auth/
│       ├── AuthGuard.tsx           → Protege páginas que requieren sesión
│       └── TermsModal.tsx          → Modal de términos al primer login
│
├── context/
│   └── AuthContext.tsx             → user + profile disponibles en toda la app
│
├── lib/
│   ├── firebase/
│   │   ├── config.ts               → Inicialización de Firebase
│   │   ├── auth.ts                 → Login/logout con Google
│   │   ├── firestore.ts            → Todas las operaciones de DB
│   │   └── storage.ts              → Upload de archivos
│   ├── resend.ts                   → Templates de emails
│   ├── utils.ts                    → Helpers: cn(), formatAge(), formatDate()...
│   └── seed-data.ts                → 6 gatos de ejemplo para desarrollo
│
└── types/
    └── index.ts                    → Tipos TypeScript de toda la app
```

---

## Colecciones en Firestore

### `users`
```typescript
{
  id: string
  email: string
  name: string
  photoURL: string
  role: 'adopter' | 'rescuer' | 'foundation'
  verified: boolean
  acceptedTerms: boolean
  acceptedTermsAt: Timestamp
  phone?: string
  location?: string
  bio?: string
  createdAt: Timestamp
}
```

### `cats`
```typescript
{
  id: string
  name: string
  ageMonths: number
  gender: 'male' | 'female'
  description: string
  photos: string[]
  health: {
    vaccinated: boolean
    sterilized: boolean
    dewormed: boolean
    microchipped: boolean
    specialNeeds: boolean
    notes: string
  }
  location: string
  color?: string
  breed?: string
  ownerId: string
  ownerName: string
  status: 'available' | 'pending' | 'adopted'
  createdAt: Timestamp
}
```

### `applications`
```typescript
{
  id: string
  catId: string
  catName: string
  catPhoto: string
  applicantId: string
  applicantName: string
  applicantEmail: string
  ownerId: string
  status: 'pending' | 'approved' | 'rejected'
  housingType: 'apartment' | 'house_no_yard' | 'house_with_yard'
  hadPetsBefore: boolean
  otherAnimals: string
  dailyAvailability: string
  safetyMeasures: string
  motivation: string
  createdAt: Timestamp
}
```

### `adoptions`
```typescript
{
  id: string
  catId: string
  catName: string
  catPhoto: string
  adopterId: string
  adopterName: string
  adopterEmail: string
  originalOwnerId: string
  applicationId: string
  adoptionDate: Timestamp
  nextVaccineReminder: Timestamp   // adopción + 90 días
  nextCheckupReminder: Timestamp   // adopción + 180 días
  createdAt: Timestamp
}
```

### `tracking_logs`
```typescript
{
  id: string
  adoptionId: string
  catId: string
  adopterId: string
  type: 'vaccine' | 'checkup' | 'sterilization' | 'note' | 'photo' | 'document'
  title: string
  description?: string
  fileURL?: string
  date: Timestamp
  createdAt: Timestamp
}
```

### `donations`
```typescript
{
  id: string
  donorId?: string
  donorName?: string
  foundationId: string
  foundationName: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed'
  createdAt: Timestamp
}
```

---

## Flujo de adopción completo

```
1. Usuario navega /cats → ve grid de gatitos disponibles
2. Entra al perfil del gato → ve toda la info
3. Hace clic en "Quiero adoptar" → se abre modal con formulario
4. Completa el formulario → se crea un documento en `applications`
5. El rescatador recibe email de notificación
6. El rescatador entra a /dashboard → pestaña "Solicitudes recibidas"
7. Aprueba o rechaza la solicitud
8. Si aprueba:
   - El gato pasa a status "adopted"
   - Se crea un documento en `adoptions`
   - Las otras solicitudes del mismo gato se rechazan automáticamente
   - El adoptante recibe email de bienvenida
9. El adoptante entra a /track/[adoptionId]
10. Registra vacunas, chequeos y fotos
11. Cada 3 meses → email recordatorio de vacuna
12. Cada 6 meses → email recordatorio de chequeo
```

---

## Variables de entorno (.env.local)

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

RESEND_API_KEY=
RESEND_FROM_EMAIL=noreply@adopcionweb.com

NEXT_PUBLIC_SITE_URL=http://localhost:3000

CRON_SECRET=string_secreto_para_el_cron
```

---

## Cómo correr el proyecto

```bash
# 1. Instalar dependencias
npm install

# 2. Crear .env.local con las variables de Firebase y Resend

# 3. Correr en desarrollo
npm run dev

# 4. Poblar la base de datos (una sola vez)
curl -X POST http://localhost:3000/api/seed

# 5. Abrir en el navegador
http://localhost:3000
```

---

## Pendiente / Próximas features

- [ ] Cloudinary para almacenamiento de imágenes (reemplaza Firebase Storage)
- [ ] Activar Firebase Storage con plan Blaze
- [ ] Definir nombre definitivo del proyecto
- [ ] Deploy en Vercel con variables de entorno de producción
- [ ] Verificación de fundaciones (panel admin)
- [ ] Login con Instagram (estructura ya preparada)
- [ ] Sistema de notificaciones in-app
- [ ] Panel de administración
- [ ] README profesional para el repo de GitHub
- [ ] Sponsors reales con logos subidos
- [ ] Integración de pagos con MercadoPago para donaciones

---

## Precios freelance sugeridos

| Servicio | USD |
|---|---|
| Plataforma completa como esta | $800 – $1.200 |
| Mantenimiento mensual | $80 – $150 |
| Agregar features nuevas | $50 – $100 por feature |

---

*Desarrollado por Lucas Cabrera — LucasDeRivaDev — Santo Tomé, Santa Fe, Argentina*
*Stack: Next.js 14 + Firebase + Tailwind CSS + Resend + Vercel*
