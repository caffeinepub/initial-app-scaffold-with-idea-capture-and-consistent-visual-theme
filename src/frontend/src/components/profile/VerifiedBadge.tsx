import { CheckCircle } from 'lucide-react';
import { UserRole } from '../../backend';

interface VerifiedBadgeProps {
  role?: UserRole;
}

export function VerifiedBadge({ role }: VerifiedBadgeProps) {
  const isAdmin = role === UserRole.admin;
  
  return (
    <CheckCircle 
      className={`w-5 h-5 inline-block ${
        isAdmin 
          ? 'text-[oklch(0.65_0.20_45)] fill-[oklch(0.65_0.20_45)]' 
          : 'text-primary fill-primary'
      }`}
    />
  );
}
