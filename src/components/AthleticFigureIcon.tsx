import React from 'react';

interface AthleticFigureIconProps {
  className?: string;
  size?: number;
}

export const AthleticFigureIcon: React.FC<AthleticFigureIconProps> = ({ 
  className = "", 
  size = 200 
}) => {
  return (
    <img
      src="/athletic-figure.png"
      alt="Athletic figure with smartphone and earbuds"
      width={size}
      height={size}
      className={className}
    />
  );
}; 