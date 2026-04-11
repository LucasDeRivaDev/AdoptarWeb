// ============================================================
// FUNCIONES DE AUTENTICACIÓN
// Maneja login/logout con Google OAuth.
// Al primer login, crea el perfil del usuario en Firestore.
// ============================================================

import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';
import { UserProfile } from '@/types';

const googleProvider = new GoogleAuthProvider();

// ---- LOGIN CON GOOGLE ---------------------------------------

export async function signInWithGoogle(): Promise<UserProfile> {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  // Verificar si ya tiene perfil guardado en Firestore
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    // Primer login: crear perfil con rol por defecto 'adopter'
    const newProfile: Omit<UserProfile, 'id'> = {
      email: user.email ?? '',
      name: user.displayName ?? 'Usuario',
      photoURL: user.photoURL ?? '',
      role: 'adopter',
      verified: false,
      acceptedTerms: false, // se pide aceptar al primer login
      createdAt: serverTimestamp() as UserProfile['createdAt'],
    };
    await setDoc(userRef, newProfile);
    return { id: user.uid, ...newProfile };
  }

  return { id: user.uid, ...userSnap.data() } as UserProfile;
}

// ---- LOGOUT ------------------------------------------------

export async function logout(): Promise<void> {
  await signOut(auth);
}

// ---- OBSERVER (para el AuthContext) ------------------------

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// ---- OBTENER PERFIL DESDE FIRESTORE -------------------------

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return null;
  return { id: uid, ...snap.data() } as UserProfile;
}
