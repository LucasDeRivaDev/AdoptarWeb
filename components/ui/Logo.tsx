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
        {/* Deditos superiores */}
        <ellipse cx="10"   cy="21" rx="4.5" ry="5.5" fill="#E05A3A" />
        <ellipse cx="19.5" cy="14" rx="5"   ry="6"   fill="#E05A3A" />
        <ellipse cx="28.5" cy="14" rx="5"   ry="6"   fill="#E05A3A" />
        <ellipse cx="38"   cy="21" rx="4.5" ry="5.5" fill="#E05A3A" />

        {/* Almohadilla principal */}
        <ellipse cx="24" cy="33" rx="13" ry="11" fill="#E05A3A" />
      </svg>

      {showText && (
        <span className={cn('font-bold text-coral-500', textClassName ?? 'text-xl')}>
          AdopcionWeb
        </span>
      )}
    </div>
  );
}
