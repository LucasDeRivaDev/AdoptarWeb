// ============================================================
// UTILIDADES GENERALES
// ============================================================

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Timestamp } from 'firebase/firestore';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

// Combina clases de Tailwind sin conflictos — usar en todos los componentes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Convierte meses a texto legible: "8 meses", "1 año", "2 años y 3 meses"
export function formatAge(months: number): string {
  if (months < 12) return `${months} ${months === 1 ? 'mes' : 'meses'}`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  const yearStr = `${years} ${years === 1 ? 'año' : 'años'}`;
  if (rem === 0) return yearStr;
  return `${yearStr} y ${rem} ${rem === 1 ? 'mes' : 'meses'}`;
}

// Formatea un Timestamp de Firestore a fecha legible
export function formatDate(timestamp: Timestamp | null | undefined): string {
  if (!timestamp) return '—';
  return format(timestamp.toDate(), "d 'de' MMMM 'de' yyyy", { locale: es });
}

// Tiempo relativo: "hace 3 días", "hace 2 meses"
export function formatRelativeDate(timestamp: Timestamp | null | undefined): string {
  if (!timestamp) return '—';
  return formatDistanceToNow(timestamp.toDate(), { locale: es, addSuffix: true });
}

// Convierte el género a texto en español
export function formatGender(gender: 'male' | 'female'): string {
  return gender === 'male' ? 'Macho' : 'Hembra';
}

// Convierte el tipo de vivienda a texto
export function formatHousingType(type: string): string {
  const map: Record<string, string> = {
    apartment: 'Departamento',
    house_no_yard: 'Casa sin patio',
    house_with_yard: 'Casa con patio',
  };
  return map[type] ?? type;
}

// Devuelve el color del badge según el estado del gato
export function getCatStatusColor(status: string): string {
  switch (status) {
    case 'available': return 'sage';
    case 'pending': return 'amber';
    case 'adopted': return 'coral';
    default: return 'gray';
  }
}

// Texto del estado del gato
export function getCatStatusLabel(status: string): string {
  switch (status) {
    case 'available': return 'Disponible';
    case 'pending': return 'En proceso';
    case 'adopted': return 'Adoptado';
    default: return status;
  }
}

// Texto del estado de la solicitud
export function getApplicationStatusLabel(status: string): string {
  switch (status) {
    case 'pending': return 'Pendiente';
    case 'approved': return 'Aprobada';
    case 'rejected': return 'Rechazada';
    default: return status;
  }
}

// Trunca texto largo con puntos suspensivos
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}
