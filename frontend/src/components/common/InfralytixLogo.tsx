import React from 'react';

interface InfralytixLogoProps {
  className?: string;
  showTagline?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function InfralytixLogo({
  className = '',
  showTagline = true,
  size = 'md',
}: InfralytixLogoProps) {
  const iconSizes = {
    sm: { w: 24, h: 24 },
    md: { w: 32, h: 32 },
    lg: { w: 40, h: 40 },
  };

  const currentSize = iconSizes[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* 4-Bar Equalizer Wave Icon with Cyan-to-Emerald Gradient */}
      <svg
        width={currentSize.w}
        height={currentSize.h}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="barGrad1" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>
          <linearGradient id="barGrad2" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#0369A1" />
            <stop offset="100%" stopColor="#0EA5E9" />
          </linearGradient>
          <linearGradient id="barGrad3" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#0D9488" />
            <stop offset="100%" stopColor="#14B8A6" />
          </linearGradient>
          <linearGradient id="barGrad4" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>
        {/* Bar 1 (Left, Medium) */}
        <rect x="3" y="12" width="6" height="20" rx="3" fill="url(#barGrad1)" />
        {/* Bar 2 (Tallest) */}
        <rect x="11" y="4" width="6" height="28" rx="3" fill="url(#barGrad2)" />
        {/* Bar 3 (Medium-Short) */}
        <rect x="19" y="15" width="6" height="17" rx="3" fill="url(#barGrad3)" />
        {/* Bar 4 (Right, Medium-Tall) */}
        <rect x="27" y="9" width="6" height="23" rx="3" fill="url(#barGrad4)" />
      </svg>

      <div className="flex flex-col">
        <span className="font-extrabold tracking-wider text-base leading-tight text-slate-900 dark:text-white font-sans">
          INFRALYTIX
        </span>
        {showTagline && (
          <span className="text-[10px] tracking-tight text-slate-500 dark:text-slate-400 font-medium leading-none mt-0.5">
            Smarter Infrastructure. Safer Tomorrow.
          </span>
        )}
      </div>
    </div>
  );
}
