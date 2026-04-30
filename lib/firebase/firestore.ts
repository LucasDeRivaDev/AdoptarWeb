// ============================================================
// OPERACIONES DE FIRESTORE
// Todas las lecturas/escrituras de la base de datos van acá.
// Separado por entidad para mantener el orden.
// ============================================================

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  limit,
} from 'firebase/firestore';
import { db } from './config';
import {
  Cat,
  AdoptionApplication,
  Adoption,
  TrackingLog,
  UserProfile,
  CatFilters,
} from '@/types';

// ============================================================
// GATOS
// ============================================================

export async function getCats(filters?: Partial<CatFilters>): Promise<Cat[]> {
  let q = query(
    collection(db, 'cats'),
    where('status', '==', 'available'),
    orderBy('createdAt', 'desc')
  );

  // Los filtros compuestos en Firestore requieren índices.
  // Filtramos por género si está especificado.
  if (filters?.gender) {
    q = query(q, where('gender', '==', filters.gender));
  }
  if (filters?.vaccinated !== null && filters?.vaccinated !== undefined) {
    q = query(q, where('health.vaccinated', '==', filters.vaccinated));
  }

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Cat));
}

export async function getFeaturedCats(count = 3): Promise<Cat[]> {
  const q = query(
    collection(db, 'cats'),
    where('status', '==', 'available'),
    orderBy('createdAt', 'desc'),
    limit(count)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Cat));
}

export async function getCatById(catId: string): Promise<Cat | null> {
  const snap = await getDoc(doc(db, 'cats', catId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Cat;
}

export async function getCatsByOwner(ownerId: string): Promise<Cat[]> {
  const q = query(
    collection(db, 'cats'),
    where('ownerId', '==', ownerId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Cat));
}

export async function createCat(data: Omit<Cat, 'id' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(collection(db, 'cats'), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateCatStatus(catId: string, status: Cat['status']): Promise<void> {
  await updateDoc(doc(db, 'cats', catId), { status });
}

// ============================================================
// SOLICITUDES DE ADOPCIÓN
// ============================================================

export async function createApplication(
  data: Omit<AdoptionApplication, 'id' | 'createdAt' | 'status'>
): Promise<string> {
  const ref = await addDoc(collection(db, 'applications'), {
    ...data,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getApplicationsByApplicant(applicantId: string): Promise<AdoptionApplication[]> {
  const q = query(
    collection(db, 'applications'),
    where('applicantId', '==', applicantId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AdoptionApplication));
}

export async function getApplicationsByCat(catId: string): Promise<AdoptionApplication[]> {
  const q = query(
    collection(db, 'applications'),
    where('catId', '==', catId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AdoptionApplication));
}

export async function getApplicationsByOwner(ownerId: string): Promise<AdoptionApplication[]> {
  const q = query(
    collection(db, 'applications'),
    where('ownerId', '==', ownerId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AdoptionApplication));
}

// Aprobar solicitud: marca el gato como adoptado y crea el registro de adopción
export async function approveApplication(application: AdoptionApplication): Promise<string> {
  const now = Timestamp.now();
  // 3 meses en segundos = 90 días
  const threeMonths = new Timestamp(now.seconds + 90 * 24 * 60 * 60, 0);
  // 6 meses
  const sixMonths = new Timestamp(now.seconds + 180 * 24 * 60 * 60, 0);

  // 1. Marcar solicitud como aprobada
  await updateDoc(doc(db, 'applications', application.id), { status: 'approved' });

  // 2. Marcar gato como adoptado
  await updateCatStatus(application.catId, 'adopted');

  // 3. Rechazar las otras solicitudes del mismo gato
  const others = await getApplicationsByCat(application.catId);
  for (const other of others) {
    if (other.id !== application.id && other.status === 'pending') {
      await updateDoc(doc(db, 'applications', other.id), { status: 'rejected' });
    }
  }

  // 4. Crear el registro de adopción
  const adoptionData: Omit<Adoption, 'id'> = {
    catId: application.catId,
    catName: application.catName,
    catPhoto: application.catPhoto,
    adopterId: application.applicantId,
    adopterName: application.applicantName,
    adopterEmail: application.applicantEmail,
    originalOwnerId: application.ownerId,
    applicationId: application.id,
    adoptionDate: now,
    nextVaccineReminder: threeMonths,
    nextCheckupReminder: sixMonths,
    createdAt: now,
  };
  const ref = await addDoc(collection(db, 'adoptions'), adoptionData);
  return ref.id;
}

export async function rejectApplication(applicationId: string): Promise<void> {
  await updateDoc(doc(db, 'applications', applicationId), { status: 'rejected' });
}

// ============================================================
// ADOPCIONES Y TRACKING
// ============================================================

export async function getAdoptionsByOwner(ownerId: string): Promise<Adoption[]> {
  const q = query(
    collection(db, 'adoptions'),
    where('originalOwnerId', '==', ownerId),
    orderBy('adoptionDate', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Adoption));
}

export async function getAdoptionsByAdopter(adopterId: string): Promise<Adoption[]> {
  const q = query(
    collection(db, 'adoptions'),
    where('adopterId', '==', adopterId),
    orderBy('adoptionDate', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Adoption));
}

export async function getAdoptionById(adoptionId: string): Promise<Adoption | null> {
  const snap = await getDoc(doc(db, 'adoptions', adoptionId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Adoption;
}

export async function addTrackingLog(
  data: Omit<TrackingLog, 'id' | 'createdAt'>
): Promise<string> {
  const ref = await addDoc(collection(db, 'tracking_logs'), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getTrackingLogs(adoptionId: string): Promise<TrackingLog[]> {
  const q = query(
    collection(db, 'tracking_logs'),
    where('adoptionId', '==', adoptionId),
    orderBy('date', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as TrackingLog));
}

// ============================================================
// USUARIOS / FUNDACIONES
// ============================================================

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  return { id: uid, ...snap.data() } as UserProfile;
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  await updateDoc(doc(db, 'users', uid), data);
}

export async function getFoundations(): Promise<UserProfile[]> {
  const q = query(collection(db, 'users'), where('role', '==', 'foundation'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as UserProfile));
}

// ============================================================
// ESTADÍSTICAS PÚBLICAS — para la home
// ============================================================

export interface PublicStats {
  availableCats: number;
  totalAdoptions: number;
  activeRescuers: number;
  foundations: number;
  adoptionsByMonth: { month: string; adopciones: number }[];
}

export async function getPublicStats(): Promise<PublicStats> {
  const [catsSnap, adoptionsSnap, usersSnap] = await Promise.all([
    getDocs(query(collection(db, 'cats'), where('status', '==', 'available'))),
    getDocs(query(collection(db, 'adoptions'), orderBy('adoptionDate', 'desc'))),
    getDocs(collection(db, 'users')),
  ]);

  const users = usersSnap.docs.map((d) => d.data());
  const adoptions = adoptionsSnap.docs.map((d) => d.data());

  // Adopciones agrupadas por mes (últimos 6 meses)
  const now = new Date();
  const months: { month: string; adopciones: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString('es-AR', { month: 'short', year: '2-digit' });
    const count = adoptions.filter((a) => {
      const date = (a.adoptionDate as Timestamp).toDate();
      return date.getMonth() === d.getMonth() && date.getFullYear() === d.getFullYear();
    }).length;
    months.push({ month: label, adopciones: count });
  }

  return {
    availableCats: catsSnap.size,
    totalAdoptions: adoptionsSnap.size,
    activeRescuers: users.filter((u) => u.role === 'rescuer').length,
    foundations: users.filter((u) => u.role === 'foundation').length,
    adoptionsByMonth: months,
  };
}

// ============================================================
// ADMIN — queries sin filtros, acceso total
// ============================================================

export async function adminSetUserRole(uid: string, role: UserProfile['role'], banReason?: string): Promise<void> {
  const data: Record<string, unknown> = { role };
  if (role === 'banned' && banReason) {
    data.banReason = banReason;
  } else {
    data.banReason = null;
  }
  await updateDoc(doc(db, 'users', uid), data);
}

export async function adminGetAllUsers(): Promise<UserProfile[]> {
  const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as UserProfile));
}

export async function adminGetAllCats(): Promise<Cat[]> {
  const q = query(collection(db, 'cats'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Cat));
}

export async function adminGetAllApplications(): Promise<AdoptionApplication[]> {
  const q = query(collection(db, 'applications'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AdoptionApplication));
}

export async function adminGetAllAdoptions(): Promise<Adoption[]> {
  const q = query(collection(db, 'adoptions'), orderBy('adoptionDate', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Adoption));
}
