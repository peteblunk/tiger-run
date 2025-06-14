
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
    ? "M 10 18 Q 16 24 22 18" // Open mouth, slightly lower
    : "M 10 18 Q 16 20 22 18"; // Closed mouth, slightly lower

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
      <circle cx="16" cy="16" r="13" fill="hsl(var(--primary))" stroke="hsl(var(--primary-foreground))" strokeWidth="0.5" />
      
      {/* Ears */}
      <path d="M 7 5 A 5 5 0 0 1 13 5 L 10 8 Z" fill="hsl(var(--primary))" stroke="hsl(var(--primary-foreground))" strokeWidth="0.5"/>
      <path d="M 19 5 A 5 5 0 0 1 25 5 L 22 8 Z" fill="hsl(var(--primary))" stroke="hsl(var(--primary-foreground))" strokeWidth="0.5"/>
      {/* Inner Ear */}
      <path d="M 8.5 6 A 3 3 0 0 1 11.5 6 L 10 8 Z" fill="hsl(var(--primary-foreground))" opacity="0.3"/>
      <path d="M 20.5 6 A 3 3 0 0 1 23.5 6 L 22 8 Z" fill="hsl(var(--primary-foreground))" opacity="0.3"/>


      {/* Snout area */}
      <ellipse cx="16" cy="19" rx="6" ry="4" fill="hsl(var(--foreground))" opacity="0.8" />

      {/* Eyes */}
      <circle cx="12" cy="13" r="2" fill="hsl(var(--background))" />
      <circle cx="12" cy="13" r="1" fill="hsl(var(--primary-foreground))" /> 
      <circle cx="20" cy="13" r="2" fill="hsl(var(--background))" />
      <circle cx="20" cy="13" r="1" fill="hsl(var(--primary-foreground))" />

      {/* Nose */}
      <polygon points="15,17 17,17 16,19" fill="hsl(var(--primary-foreground))" />
      
      {/* Mouth */}
      <path d={mouthPath} stroke="hsl(var(--primary-foreground))" strokeWidth="1" fill="none" />

      {/* Stripes on Face/Head */}
      <path d="M 5 12 Q 7 16 5 20" stroke="hsl(var(--primary-foreground))" strokeWidth="1" fill="none" />
      <path d="M 27 12 Q 25 16 27 20" stroke="hsl(var(--primary-foreground))" strokeWidth="1" fill="none" />
      
      <path d="M 9 7 Q 11 9 10 11" stroke="hsl(var(--primary-foreground))" strokeWidth="1" fill="none" />
      <path d="M 23 7 Q 21 9 22 11" stroke="hsl(var(--primary-foreground))" strokeWidth="1" fill="none" />

      <path d="M 14 4 Q 16 6 18 4" stroke="hsl(var(--primary-foreground))" strokeWidth="1.5" fill="none" />
    </svg>
  );
};

export default TigerIcon;

