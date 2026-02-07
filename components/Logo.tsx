
import React from 'react';

interface LogoProps {
  variant?: 'light' | 'dark';
  className?: string;
}

/**
 * A Captive Audience Logo
 * Uses the actual logo.svg asset with the key icon and branding.
 */
const Logo: React.FC<LogoProps> = ({ className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${className}`}>
      <img
        src="/logo.svg"
        alt="A Captive Audience"
        className="w-full h-full object-contain"
      />
    </div>
  );
};

export default Logo;
