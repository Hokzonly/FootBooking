import React from 'react';

interface SoccerPlayerIconProps {
  className?: string;
  size?: number;
}

export const SoccerPlayerIcon: React.FC<SoccerPlayerIconProps> = ({ 
  className = "", 
  size = 200 
}) => {
  return (
    <img
      src="/soccer-player.png"
      alt="Soccer player with ball"
      width={size}
      height={size}
      className={className}
    />
  );
}; 