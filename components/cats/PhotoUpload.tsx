'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhotoUploadProps {
  onFilesChange: (files: File[]) => void;
  maxPhotos?: number;
}

export function PhotoUpload({ onFilesChange, maxPhotos = 5 }: PhotoUploadProps) {
  const [previews, setPreviews] = useState<{ file: File; url: string }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const remaining = maxPhotos - previews.length;
    const newFiles = Array.from(files).slice(0, remaining);

    const newPreviews = newFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    const updated = [...previews, ...newPreviews];
    setPreviews(updated);
    onFilesChange(updated.map((p) => p.file));
  }

  function removePhoto(index: number) {
    URL.revokeObjectURL(previews[index].url);
    const updated = previews.filter((_, i) => i !== index);
    setPreviews(updated);
    onFilesChange(updated.map((p) => p.file));
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-700">
        Fotos del gatito (hasta {maxPhotos})
      </label>

      {/* Grid de previews */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {previews.map((preview, i) => (
          <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group">
            <Image src={preview.url} alt={`foto ${i + 1}`} fill className="object-cover" />
            <button
              type="button"
              onClick={() => removePhoto(i)}
              className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={12} />
            </button>
          </div>
        ))}

        {/* Botón agregar */}
        {previews.length < maxPhotos && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={cn(
              'aspect-square rounded-xl border-2 border-dashed border-gray-200',
              'flex flex-col items-center justify-center gap-1',
              'text-gray-400 hover:text-coral-400 hover:border-coral-300',
              'transition-colors cursor-pointer'
            )}
          >
            <Upload size={20} />
            <span className="text-xs">Agregar</span>
          </button>
        )}
      </div>

      {/* Input oculto */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <p className="text-xs text-gray-400">
        Formatos: JPG, PNG, WebP. Máximo 5 MB por imagen. La primera foto será la principal.
      </p>
    </div>
  );
}
