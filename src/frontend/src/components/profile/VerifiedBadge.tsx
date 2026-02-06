interface VerifiedBadgeProps {
  variant?: 'blue' | 'orange' | 'red';
}

export function VerifiedBadge({ variant = 'blue' }: VerifiedBadgeProps) {
  const colors = {
    blue: 'oklch(0.60 0.20 240)',
    orange: 'oklch(0.65 0.20 45)',
    red: 'oklch(0.60 0.20 25)',
  };

  const color = colors[variant];

  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="inline-block"
      aria-label="Verified badge"
    >
      {/* Seal/starburst outer shape */}
      <path
        d="M12 2L13.5 6.5L18 5L16.5 9.5L21 10L18 14L21 18L16.5 18.5L18 23L13.5 21.5L12 26L10.5 21.5L6 23L7.5 18.5L3 18L6 14L3 10L7.5 9.5L6 5L10.5 6.5L12 2Z"
        fill={color}
      />
      {/* Inner checkmark */}
      <path
        d="M9 12L11 14L15 10"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
