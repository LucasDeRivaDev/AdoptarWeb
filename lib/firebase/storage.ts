// ============================================================
// UPLOAD DE ARCHIVOS VÍA CLOUDINARY
// Firebase Storage requiere plan Blaze (pago), así que
// usamos Cloudinary (plan gratuito) a través de /api/upload.
// ============================================================

async function uploadToCloudinary(file: File, folder: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? 'Error al subir la imagen');
  }

  const { url } = await res.json();
  return url as string;
}

// Sube una foto de gato y devuelve la URL pública
export async function uploadCatPhoto(
  file: File,
  catId: string,
  _index: number
): Promise<string> {
  return uploadToCloudinary(file, `adopcionweb/cats/${catId}`);
}

// Sube múltiples fotos y devuelve array de URLs
export async function uploadCatPhotos(files: File[], catId: string): Promise<string[]> {
  // Subir de a una para no saturar la API route en prod
  const urls: string[] = [];
  for (let i = 0; i < files.length; i++) {
    const url = await uploadCatPhoto(files[i], catId, i);
    urls.push(url);
  }
  return urls;
}

// Sube un documento de seguimiento (vacuna, turno médico, etc.)
export async function uploadTrackingDocument(
  file: File,
  adoptionId: string,
  logId: string
): Promise<string> {
  return uploadToCloudinary(file, `adopcionweb/tracking/${adoptionId}/${logId}`);
}

// Eliminar en Cloudinary requiere el public_id (no la URL).
// Por ahora dejamos la función vacía para no romper los tipos.
export async function deleteFile(_url: string): Promise<void> {
  // TODO: si se necesita borrar imágenes, extraer el public_id de la URL
  // y llamar a cloudinary.uploader.destroy() desde una API route.
}
