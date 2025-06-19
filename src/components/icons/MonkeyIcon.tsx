
import React from 'react';

interface MonkeyIconProps {
  size: number;
}

const MonkeyIcon: React.FC<MonkeyIconProps> = ({ size }) => {
  return (
    <img
      className="monkey-icon"
      src="/images/MonkeyIcon.png"
      alt="Monkey Icon"
      width={size}
      height={size}
    />
  );
};

export default MonkeyIcon;
