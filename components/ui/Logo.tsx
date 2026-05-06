import { cn } from '@/lib/utils';

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  textClassName?: string;
}

export function Logo({ size = 36, className, showText = true, textClassName }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="AdopcionWeb logo"
      >
        {/* Orejas izquierda */}
        <path d="M11 23 L5 7 L19 14 Z" fill="#E05A3A" />
        <path d="M11 21 L7 10 L17 14 Z" fill="#FFB09D" />

        {/* Orejas derecha */}
        <path d="M37 23 L43 7 L29 14 Z" fill="#E05A3A" />
        <path d="M37 21 L41 10 L31 14 Z" fill="#FFB09D" />

        {/* Corazón (cuerpo/cara) */}
        <path
          d="M24 41 C24 41 5 29 5 18.5 C5 11.5 9.8 7 16.5 7 C19.8 7 22.5 8.8 24 11.5 C25.5 8.8 28.2 7 31.5 7 C38.2 7 43 11.5 43 18.5 C43 29 24 41 24 41 Z"
          fill="#E05A3A"
        />

        {/* Ojos */}
        <ellipse cx="18.5" cy="21" rx="2.8" ry="3.2" fill="white" />
        <ellipse cx="29.5" cy="21" rx="2.8" ry="3.2" fill="white" />

        {/* Pupilas */}
        <ellipse cx="19" cy="21.2" rx="1.5" ry="2.2" fill="#1a0a00" />
        <ellipse cx="30" cy="21.2" rx="1.5" ry="2.2" fill="#1a0a00" />

        {/* Brillo en los ojos */}
        <circle cx="19.9" cy="19.5" r="0.6" fill="white" />
        <circle cx="30.9" cy="19.5" r="0.6" fill="white" />

        {/* Nariz */}
        <path d="M22.5 27 L25.5 27 L24 29 Z" fill="#FFB09D" />

        {/* Boca */}
        <path
          d="M21.5 30.5 Q24 33 26.5 30.5"
          stroke="white"
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
        />

        {/* Bigotes izquierda */}
        <line x1="6" y1="26.5" x2="18" y2="26" stroke="white" strokeWidth="0.9" strokeLinecap="round" opacity="0.75" />
        <line x1="6" y1="29.5" x2="18" y2="28.5" stroke="white" strokeWidth="0.9" strokeLinecap="round" opacity="0.75" />

        {/* Bigotes derecha */}
        <line x1="42" y1="26.5" x2="30" y2="26" stroke="white" strokeWidth="0.9" strokeLinecap="round" opacity="0.75" />
        <line x1="42" y1="29.5" x2="30" y2="28.5" stroke="white" strokeWidth="0.9" strokeLinecap="round" opacity="0.75" />
      </svg>

      {showText && (
        <span className={cn('font-bold text-coral-500', textClassName ?? 'text-xl')}>
          AdopcionWeb
        </span>
      )}
    </div>
  );
}
