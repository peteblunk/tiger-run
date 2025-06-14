import React, { useEffect } from 'react';

interface DollarIconProps {
  size: number;
  isAnimatingOut: boolean;
  onAnimationComplete: () => void;
}

const DollarIcon: React.FC<DollarIconProps> = ({ size, isAnimatingOut, onAnimationComplete }) => {
  useEffect(() => {
    if (isAnimatingOut) {
      const timer = setTimeout(() => {
        onAnimationComplete();
      }, 500); // Corresponds to animation duration in globals.css
      return () => clearTimeout(timer);
    }
  }, [isAnimatingOut, onAnimationComplete]);

  return (
    <div
      style={{ width: size, height: size }}
      className={`flex items-center justify-center rounded-full bg-accent ${isAnimatingOut ? 'animate-dollar-collect' : ''}`}
      aria-label="Dollar"
    >
      <span className="text-lg font-bold text-accent-foreground select-none">
        $
      </span>
    </div>
  );
};

export default DollarIcon;
