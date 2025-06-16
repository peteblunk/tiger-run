
import React from 'react';

interface TigerIconProps {
  size: number;
}

const TigerIcon: React.FC<TigerIconProps> = ({ size }) => {
  return (
    <img
      src="/images/TigerIcon.png"
      alt="Tiger Icon"
      width={size}
      height={size}
    />
  );
};

export default TigerIcon;

