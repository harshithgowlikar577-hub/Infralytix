import React from 'react';

export default function EmblemLogo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Official High-Resolution Logo */}
      <div className="w-10 h-10 rounded-xl bg-slate-900/90 border border-slate-700/60 p-1 flex items-center justify-center shadow-inner shrink-0 group-hover:border-blue-500/50 transition-colors">
        <img
          src="/logo.png"
          alt="INFRALYTIX Official Emblem"
          className="w-8 h-8 object-contain drop-shadow-md"
          loading="lazy"
        />
      </div>

      {/* Brand Name + Flag + Subtitle */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="font-extrabold tracking-tight text-base sm:text-lg leading-none text-slate-900 dark:text-white font-sans">
            INFRALYTIX
          </span>
          <span className="text-sm leading-none" title="Government of India" aria-label="Government of India">
            🇮🇳
          </span>
        </div>
        <span className="text-[11px] tracking-tight text-slate-500 dark:text-slate-400 font-medium leading-tight mt-0.5">
          Infrastructure Intelligence
        </span>
      </div>
    </div>
  );
}
