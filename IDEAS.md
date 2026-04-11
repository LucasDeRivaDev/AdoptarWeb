# Ideas para adopcionweb

## Estado actual
Stack: Next.js 14 App Router + TypeScript + Firebase + Tailwind CSS

---

## Próximo a implementar

### Mapa interactivo (en progreso)
- Toggle Grid/Mapa en `/cats`
- Librería: react-leaflet (gratis, sin API key)
- Geocoding: Nominatim (OpenStreetMap, gratis)
- Pins en el mapa con foto + nombre del gato
- Click en pin → popup con botón "Ver ficha"
- Requiere agregar `coordinates: { lat, lng }` al tipo Cat

### Panel de estadísticas para fundaciones
- Cuántas adopciones ese mes
- Tasa de aprobación de solicitudes
- Gatos en espera / adoptados / pendientes
- Gráficos con recharts o chart.js
- Página `/dashboard/stats` solo para role='foundation' o 'rescuer'

---

## Ideas para más adelante

### Búsqueda con más filtros
- Raza, edad exacta, tamaño, color de pelaje
- "Compatible con niños", "compatible con perros"
- Distancia en km desde ubicación (geolocalización del navegador)

### Chat interno
- Mensajería entre adoptante y rescatador
- Coordinar visitas sin salir de la plataforma
- Notificación por email al recibir mensaje

### Fotos múltiples / video
- Carousel de fotos en la ficha del gato (ya hay array `photos[]`)
- Soporte para video corto (15 seg)

### Perfil público del rescatador
- Página `/rescatador/[id]` con todos sus gatos
- Historial: cuántos adoptados exitosamente
- Reseñas de adoptantes (sistema de estrellas)

### Blog / noticias
- Artículos sobre cuidado, castración, vacunas
- Bueno para SEO

### QR de seguimiento
- Al completar adopción, genera QR que lleva a `/track/[id]`
- El adoptante puede pegar el QR en el carnet de vacunas

### Formulario de adopción mejorado
- Preguntas: ¿tenés patio?, ¿trabajás fuera de casa?, ¿otros animales?
- Puntaje automático de compatibilidad

---

## Por qué el mapa primero
- Impacto visual alto → impresiona en el portfolio
- Técnicamente más simple que el panel de stats
- No requiere cambios grandes en la arquitectura existente
