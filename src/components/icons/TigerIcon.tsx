
import React from 'react';

interface TigerIconProps {
  size: number;
}

const TigerIcon: React.FC<TigerIconProps> = ({ size }) => {
  return (
    <img
      className="tiger-icon"
      src="/images/TigerIcon.png"
      alt="Tiger Icon"
      width={size}
      height={size}
    />
  );
};

export default TigerIcon;

