
import React from 'react';

interface MonkeyIconProps {
  size: number;
}

const MonkeyIcon: React.FC<MonkeyIconProps> = ({ size }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-label="Monkey"
    >
      {/* Head */}
      <circle cx="16" cy="14" r="10" fill="hsl(var(--muted))" />
      
      {/* Face */}
      <ellipse cx="16" cy="15" rx="7" ry="6" fill="hsl(var(--muted-foreground))" />

      {/* Eyes */}
      <circle cx="13" cy="13" r="1.5" fill="hsl(var(--background))" />
      <circle cx="19" cy="13" r="1.5" fill="hsl(var(--background))" />
      
      {/* Mouth */}
      <path d="M 14 17 Q 16 18 18 17" stroke="hsl(var(--background))" strokeWidth="1" fill="none" />

      {/* Ears */}
      <circle cx="7" cy="14" r="3" fill="hsl(var(--muted))" />
      <circle cx="25" cy="14" r="3" fill="hsl(var(--muted))" />

      {/* Body (simple) */}
      <ellipse cx="16" cy="25" rx="6" ry="5" fill="hsl(var(--muted))" />
    </svg>
  );
};

export default MonkeyIcon;
