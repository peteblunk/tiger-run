import React, { useState, useEffect } from 'react';
import type { Direction } from '@/types/game';

interface TigerIconProps {
  isMoving: boolean;
  direction: Direction;
  size: number;
}

const TigerIcon: React.FC<TigerIconProps> = ({ isMoving, direction, size }) => {
  const [isMouthOpen, setIsMouthOpen] = useState(false);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined;
    if (isMoving) {
      intervalId = setInterval(() => {
        setIsMouthOpen(prev => !prev);
      }, 150); // Chomping speed
    } else {
      setIsMouthOpen(false);
    }
    return () => clearInterval(intervalId);
  }, [isMoving]);

  const getRotation = () => {
    switch (direction) {
      case 'UP': return -90;
      case 'DOWN': return 90;
      case 'LEFT': return 180;
      case 'RIGHT': return 0;
      default: return 0;
    }
  };

  const mouthPath = isMouthOpen
    ? "M 10 16 Q 16 22 22 16" // Open mouth
    : "M 10 16 Q 16 18 22 16"; // Closed mouth

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      style={{ transform: `rotate(${getRotation()}deg)` }}
      className="transition-transform duration-100"
      aria-label="Tiger"
    >
      {/* Head */}
      <circle cx="16" cy="16" r="14" fill="hsl(var(--primary))" stroke="hsl(var(--primary-foreground))" strokeWidth="1" />
      
      {/* Eyes */}
      <circle cx="12" cy="12" r="2" fill="hsl(var(--primary-foreground))" />
      <circle cx="20" cy="12" r="2" fill="hsl(var(--primary-foreground))" />

      {/* Nose */}
      <polygon points="15,17 17,17 16,19" fill="hsl(var(--primary-foreground))" />
      
      {/* Mouth area */}
      <path d={mouthPath} stroke="hsl(var(--primary-foreground))" strokeWidth="1.5" fill="none" />

      {/* Stripes */}
      <path d="M 6 10 Q 8 16 6 22" stroke="hsl(var(--primary-foreground))" strokeWidth="1" fill="none" />
      <path d="M 26 10 Q 24 16 26 22" stroke="hsl(var(--primary-foreground))" strokeWidth="1" fill="none" />
      <path d="M 10 5 Q 16 7 22 5" stroke="hsl(var(--primary-foreground))" strokeWidth="1" fill="none" />

      {/* Ears */}
      <path d="M 8 4 A 4 4 0 0 1 12 4" fill="hsl(var(--primary))" stroke="hsl(var(--primary-foreground))" strokeWidth="1"/>
      <path d="M 20 4 A 4 4 0 0 1 24 4" fill="hsl(var(--primary))" stroke="hsl(var(--primary-foreground))" strokeWidth="1"/>
    </svg>
  );
};

export default TigerIcon;
