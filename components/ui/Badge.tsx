import { cn } from '@/lib/utils';

interface BadgeProps {
  label: string;
  color?: 'coral' | 'sage' | 'amber' | 'gray' | 'blue';
  className?: string;
}

export function Badge({ label, color = 'gray', className }: BadgeProps) {
  const colors = {
    coral: 'bg-coral-100 text-coral-700',
    sage: 'bg-sage-100 text-sage-600',
    amber: 'bg-amber-100 text-amber-700',
    gray: 'bg-gray-100 text-gray-600',
    blue: 'bg-blue-100 text-blue-700',
  };

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      colors[color],
      className
    )}>
      {label}
    </span>
  );
}
