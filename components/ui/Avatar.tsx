import Image from 'next/image';
import { cn } from '@/lib/utils';

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-base',
  };

  const pixelSizes = { sm: 32, md: 40, lg: 56 };

  // Iniciales del nombre como fallback
  const initials = name
    ? name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  if (src) {
    return (
      <div className={cn('relative rounded-full overflow-hidden flex-shrink-0', sizes[size], className)}>
        <Image
          src={src}
          alt={name ?? 'avatar'}
          width={pixelSizes[size]}
          height={pixelSizes[size]}
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div className={cn(
      'rounded-full flex-shrink-0 flex items-center justify-center font-semibold',
      'bg-coral-100 text-coral-600',
      sizes[size],
      className
    )}>
      {initials}
    </div>
  );
}
