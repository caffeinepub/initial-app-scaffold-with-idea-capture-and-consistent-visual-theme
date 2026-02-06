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
      {/* Seal/starburst outer shape - fixed to stay within 24x24 viewBox */}
      <path
        d="M12 1L13.2 5.8L17.5 4L16 8.5L20.5 9.5L17.5 13L20.5 16.5L16 17.5L17.5 22L13.2 20.2L12 24L10.8 20.2L6.5 22L8 17.5L3.5 16.5L6.5 13L3.5 9.5L8 8.5L6.5 4L10.8 5.8L12 1Z"
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
