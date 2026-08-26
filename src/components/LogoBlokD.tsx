import React from 'react';

interface LogoBlokDProps {
  className?: string;
  size?: number | string;
  alt?: string;
}

export const LogoBlokD: React.FC<LogoBlokDProps> = ({
  className = 'w-10 h-10',
  alt = 'Logo Blok D Panorama Regency 3'
}) => {
  return (
    <img
      src="/logo-blok-d.png"
      alt={alt}
      className={`object-contain shrink-0 select-none ${className}`}
      referrerPolicy="no-referrer"
      onError={(e) => {
        // Fallback to jpg or svg if png is unavailable
        const target = e.currentTarget;
        if (target.src.endsWith('.png')) {
          target.src = '/logo-blok-d.jpg';
        } else if (target.src.endsWith('.jpg')) {
          target.src = '/logo-blok-d.svg';
        }
      }}
    />
  );
};
