// ============================================================
// UPLOAD DE ARCHIVOS A FIREBASE STORAGE
// Maneja fotos de gatos y documentos de seguimiento.
// ============================================================

import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './config';

// Sube una foto de gato y devuelve la URL pública
export async function uploadCatPhoto(
  file: File,
  catId: string,
  index: number
): Promise<string> {
  const ext = file.name.split('.').pop();
  const path = `cats/${catId}/photo_${index}.${ext}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

// Sube múltiples fotos y devuelve array de URLs
export async function uploadCatPhotos(files: File[], catId: string): Promise<string[]> {
  const uploads = files.map((file, i) => uploadCatPhoto(file, catId, i));
  return Promise.all(uploads);
}

// Sube un documento de seguimiento (vacuna, turno médico, etc.)
export async function uploadTrackingDocument(
  file: File,
  adoptionId: string,
  logId: string
): Promise<string> {
  const ext = file.name.split('.').pop();
  const path = `tracking/${adoptionId}/${logId}.${ext}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

// Elimina un archivo (para cuando se borra un log)
export async function deleteFile(url: string): Promise<void> {
  const fileRef = ref(storage, url);
  await deleteObject(fileRef);
}
