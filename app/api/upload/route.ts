// ============================================================
// API ROUTE: SUBIDA DE IMÁGENES A CLOUDINARY
// Recibe una imagen via FormData y devuelve la URL pública.
// Las credenciales viven solo en el servidor (sin NEXT_PUBLIC_).
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'adopcionweb';

    if (!file) {
      return NextResponse.json({ error: 'No se recibió ningún archivo' }, { status: 400 });
    }

    // Convertir el File a Buffer para que cloudinary lo acepte
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Subir a Cloudinary con upload_stream
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          // Reducir un poco el tamaño para no gastar ancho de banda
          transformation: [{ width: 1200, crop: 'limit', quality: 'auto' }],
        },
        (error, result) => {
          if (error || !result) return reject(error ?? new Error('Sin resultado'));
          resolve(result as { secure_url: string });
        }
      );
      stream.end(buffer);
    });

    return NextResponse.json({ url: result.secure_url });
  } catch (err) {
    console.error('[upload] Error subiendo imagen:', err);
    return NextResponse.json({ error: 'Error al subir la imagen' }, { status: 500 });
  }
}
