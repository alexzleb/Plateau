import React from 'react';

interface PyramidLogoProps {
  className?: string;
  size?: number;
}

export const PyramidLogo: React.FC<PyramidLogoProps> = ({ className = 'w-5 h-5', size = 22 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Prism / Golden Desert Light Gradients */}
        <linearGradient id="przmMainFace" x1="12" y1="3" x2="6" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="60%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>

        <linearGradient id="przmShadowFace" x1="12" y1="3" x2="18" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="60%" stopColor="#b45309" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>

        <linearGradient id="przmSmallLeft" x1="6" y1="9" x2="2" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>

        <linearGradient id="przmSmallRight" x1="18" y1="11" x2="22" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#92400e" />
        </linearGradient>

        <linearGradient id="plateauBase" x1="2" y1="20" x2="22" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
          <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#d97706" stopOpacity="0.4" />
        </linearGradient>
      </defs>

      {/* Left Pyramid (Host of pyramids on plateau) */}
      <polygon points="6,9 1,20 8,20" fill="url(#przmSmallLeft)" opacity="0.85" />
      <polygon points="6,9 8,20 10,20" fill="#78350f" opacity="0.7" />

      {/* Right Pyramid */}
      <polygon points="18,11 14,20 18,20" fill="url(#przmSmallRight)" opacity="0.85" />
      <polygon points="18,11 18,20 23,20" fill="#78350f" opacity="0.9" />

      {/* Center Great Pyramid (Dominant PRZM peak) */}
      {/* Light illuminated facet */}
      <polygon points="12,3 5,20 12,20" fill="url(#przmMainFace)" />
      {/* Shade / shadow facet creating 3D depth */}
      <polygon points="12,3 12,20 19,20" fill="url(#przmShadowFace)" />
      {/* Golden apex tip highlight */}
      <polygon points="12,3 10.5,6.5 13.5,6.5" fill="#ffffff" opacity="0.8" />

      {/* Plateau Baseline */}
      <line x1="1" y1="20.5" x2="23" y2="20.5" stroke="url(#plateauBase)" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
};
