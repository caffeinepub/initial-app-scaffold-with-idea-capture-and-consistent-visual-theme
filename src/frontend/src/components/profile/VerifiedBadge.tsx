import { CheckCircle } from 'lucide-react';

interface VerifiedBadgeProps {
  isOrangeTick?: boolean;
}

export function VerifiedBadge({ isOrangeTick = false }: VerifiedBadgeProps) {
  return (
    <CheckCircle 
      className={`w-5 h-5 inline-block ${
        isOrangeTick
          ? 'text-[oklch(0.65_0.20_45)] fill-[oklch(0.65_0.20_45)]' 
          : 'text-primary fill-primary'
      }`}
    />
  );
}
