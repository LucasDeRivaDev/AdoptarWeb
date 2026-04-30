# AdoptarWeb 🐱

Plataforma de adopción responsable de gatos. Conecta rescatistas y fundaciones con personas que quieren darle un hogar a un gatito, con seguimiento post-adopción incluido.

**Demo en producción:** [adoptarweb.vercel.app](https://adoptarweb.vercel.app)

---

## ¿Qué hace esta app?

- **Adoptantes** exploran gatos disponibles, filtran por género, salud y ubicación, y envían solicitudes de adopción.
- **Rescatistas y fundaciones** publican gatos con fotos y datos médicos, gestionan solicitudes, aprueban o rechazan, y ven estadísticas de su actividad.
- Cuando se aprueba una adopción, el adoptante recibe acceso a un **panel de seguimiento** donde puede registrar vacunas, chequeos y fotos.
- El sistema envía **recordatorios automáticos** por email a los 3 y 6 meses de la adopción.
- Hay un **chat interno** para que adoptante y rescatista coordinen la visita sin salir de la plataforma.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 14 (App Router) |
| Lenguaje | TypeScript |
| Base de datos | Firebase Firestore |
| Autenticación | Firebase Auth (Google OAuth) |
| Almacenamiento | Firebase Storage |
| Estilos | Tailwind CSS |
| Mapas | react-leaflet v4 + Nominatim (geocoding gratuito) |
| Gráficos | Recharts |
| Emails | Resend |
| Deploy | Vercel (con Cron Jobs para recordatorios) |

---

## Páginas

| Ruta | Descripción |
|---|---|
| `/` | Landing con gatos destacados, estadísticas y cómo funciona |
| `/cats` | Catálogo con filtros y toggle grid/mapa |
| `/cats/[id]` | Ficha del gato + formulario de adopción |
| `/cats/publish` | Publicar un nuevo gato (solo rescatistas) |
| `/dashboard` | Panel del usuario: solicitudes, gatos, adopciones y estadísticas |
| `/track/[id]` | Seguimiento post-adopción con timeline |
| `/donate` | Lista de fundaciones con datos para donar |
| `/admin` | Panel de administración (solo admins) |

---

## Roles de usuario

- **adopter** — puede explorar gatos y enviar solicitudes
- **rescuer** — puede publicar gatos, gestionar solicitudes y ver estadísticas
- **foundation** — igual que rescuer, aparece en la página `/donate`
- **admin** — acceso total al panel de administración

El rol se asigna en Firestore. Para hacer admin a un usuario, ir a la colección `users` en la consola de Firebase y cambiar el campo `role` a `admin`.

---

## Variables de entorno

Crear un archivo `.env.local` en la raíz con estas variables:

```env
# Firebase (obtener desde la consola de Firebase → Configuración del proyecto)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# URL de la app (cambiar en producción)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Emails con Resend (opcional — sin esta variable los emails se deshabilitan)
RESEND_API_KEY=
RESEND_FROM_EMAIL=onboarding@resend.dev

# Cron jobs (puede ser cualquier string secreto)
CRON_SECRET=
```

---

## Instalación y desarrollo local

```bash
# 1. Clonar el repositorio
git clone https://github.com/LucasDeRivaDev/AdoptarWeb.git
cd AdoptarWeb

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
# Crear .env.local con las variables del paso anterior

# 4. Iniciar el servidor de desarrollo
npm run dev
```

La app queda disponible en `http://localhost:3000`.

### Poblar la base de datos con datos de prueba

Una vez que tengas el servidor corriendo y Firebase configurado, abrí la consola del navegador y ejecutá:

```js
fetch('/api/seed', { method: 'POST' }).then(r => r.json()).then(console.log)
```

Esto crea usuarios, gatos y solicitudes de ejemplo en Firestore.

---

## Deploy en Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deployar (la primera vez linkea el proyecto)
vercel --prod
```

Asegurarse de cargar todas las variables de entorno en el panel de Vercel antes de hacer el primer deploy.

Para deployar las reglas de seguridad de Firestore:

```bash
firebase deploy --only firestore:rules --project <tu-project-id>
```

---

## Estructura del proyecto

```
adopcionweb/
├── app/                    # Páginas y API routes (Next.js App Router)
│   ├── page.tsx            # Home
│   ├── cats/               # Catálogo y publicación de gatos
│   ├── dashboard/          # Panel del usuario
│   ├── admin/              # Panel de administración
│   ├── track/[id]/         # Seguimiento post-adopción
│   ├── donate/             # Fundaciones
│   └── api/                # Endpoints de servidor
├── components/
│   ├── auth/               # Guards de autenticación
│   ├── cats/               # Tarjetas, filtros, mapa, formularios
│   ├── dashboard/          # Tarjetas, chat, estadísticas
│   ├── home/               # Sección de stats de la home
│   ├── layout/             # Header, Footer, Providers
│   └── ui/                 # Componentes reutilizables
├── lib/
│   ├── firebase/           # Configuración, auth, Firestore, storage
│   ├── resend.ts           # Templates de email
│   └── utils.ts            # Helpers
├── types/
│   └── index.ts            # Tipos TypeScript globales
├── context/
│   └── AuthContext.tsx     # Contexto de autenticación
└── firestore.rules         # Reglas de seguridad de Firestore
```

---

## Autor

**Lucas De Rivia** — [github.com/LucasDeRivaDev](https://github.com/LucasDeRivaDev)
