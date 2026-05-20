// ============================================================
// TIPOS GLOBALES DE LA APLICACIÓN
// Estos tipos reflejan exactamente la estructura de Firestore.
// ============================================================

import { Timestamp } from 'firebase/firestore';

// ---- USUARIO -----------------------------------------------

export type UserRole = 'adopter' | 'rescuer' | 'foundation' | 'admin' | 'banned';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  photoURL: string;
  role: UserRole;
  verified: boolean; // solo relevante para foundations
  acceptedTerms: boolean;  // true cuando acepta los términos al registrarse
  acceptedTermsAt?: Timestamp;
  phone?: string;
  location?: string;
  bio?: string;
  createdAt: Timestamp;
  banReason?: string;
}

// ---- MASCOTA -----------------------------------------------

export type AnimalType = 'cat' | 'dog';
export type CatStatus = 'available' | 'pending' | 'adopted';
export type CatGender = 'male' | 'female';

export interface CatHealth {
  vaccinated: boolean;
  sterilized: boolean;
  dewormed: boolean;
  microchipped: boolean;
  specialNeeds: boolean;
  notes: string;
}

export interface CatCoordinates {
  lat: number;
  lng: number;
}

export interface Cat {
  id: string;
  animalType: AnimalType;
  name: string;
  ageMonths: number; // edad en meses — más fácil de filtrar
  gender: CatGender;
  description: string;
  photos: string[]; // URLs de Firebase Storage
  health: CatHealth;
  location: string;
  coordinates?: CatCoordinates; // lat/lng para el mapa
  color?: string;
  breed?: string;
  ownerId: string;
  ownerName: string;
  status: CatStatus;
  createdAt: Timestamp;
}

// ---- SOLICITUD DE ADOPCIÓN ---------------------------------

export type ApplicationStatus = 'pending' | 'approved' | 'rejected';
export type HousingType = 'apartment' | 'house_no_yard' | 'house_with_yard';

export interface AdoptionApplication {
  id: string;
  catId: string;
  catName: string;
  catPhoto: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;   // teléfono para contacto directo
  applicantAddress: string; // dirección para visitas de seguimiento
  ownerId: string;
  status: ApplicationStatus;
  // Datos del formulario
  housingType: HousingType;
  hadPetsBefore: boolean;
  otherAnimals: string;
  dailyAvailability: string; // cuántas horas por día
  safetyMeasures: string;
  motivation: string;
  createdAt: Timestamp;
  adoptionId?: string;  // se guarda cuando el rescatista aprueba
}

// ---- ADOPCIÓN (registro cuando se aprueba) -----------------

export interface Adoption {
  id: string;
  catId: string;
  catName: string;
  catPhoto: string;
  adopterId: string;
  adopterName: string;
  adopterEmail: string;
  originalOwnerId: string;
  applicationId: string;
  adoptionDate: Timestamp;
  nextVaccineReminder: Timestamp;    // adopción + 3 meses
  nextCheckupReminder: Timestamp;    // adopción + 6 meses
  createdAt: Timestamp;
  adopterDNI?: string;               // DNI del adoptante — se completa en el contrato
}

// ---- LOG DE SEGUIMIENTO ------------------------------------

export type TrackingLogType = 'vaccine' | 'checkup' | 'sterilization' | 'note' | 'photo' | 'document';

export interface TrackingLog {
  id: string;
  adoptionId: string;
  catId: string;
  adopterId: string;
  type: TrackingLogType;
  title: string;
  description?: string;
  fileURL?: string;  // URL de Firebase Storage
  date: Timestamp;
  createdAt: Timestamp;
}

// ---- DONACIÓN ----------------------------------------------

export type DonationStatus = 'pending' | 'completed' | 'failed';

export interface Donation {
  id: string;
  donorId?: string;    // opcional — puede donar anónimamente
  donorName?: string;
  foundationId: string;
  foundationName: string;
  amount: number;
  currency: string;
  status: DonationStatus;
  createdAt: Timestamp;
}

// ---- FUNDACIONES (son usuarios con role='foundation') -------

export interface Foundation extends UserProfile {
  role: 'foundation';
  description: string;
  website?: string;
  cbuAlias?: string; // para transferencias bancarias en Argentina
  mercadoPagoLink?: string;
}

// ---- HELPERS -----------------------------------------------

// Para los filtros del grid de mascotas
export interface CatFilters {
  location: string;
  animalType: AnimalType | '';
  gender: CatGender | '';
  vaccinated: boolean | null;
  sterilized: boolean | null;
  maxAgeMonths: number | null;
}

// ---- MENSAJE DE CHAT ---------------------------------------

export interface Message {
  id: string;
  conversationId: string;   // = applicationId — une el chat a la solicitud
  senderId: string;
  senderName: string;
  senderPhoto: string;
  text: string;
  participants: string[];   // [applicantId, ownerId] — para las reglas de Firestore
  createdAt: Timestamp;
  read: boolean;
}

// ---- SPONSOR -----------------------------------------------

export type SponsorTier = 'gold' | 'silver' | 'bronze' | 'partner';

export interface Sponsor {
  id: string;
  name: string;
  logoURL: string;       // URL de la imagen del logo
  description: string;
  website: string;
  tier: SponsorTier;     // nivel de sponsor — define tamaño en la página
  active: boolean;
  createdAt: Timestamp;
}
