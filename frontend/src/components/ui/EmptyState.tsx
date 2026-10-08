import React from 'react';
import { LucideIcon, Inbox, Search } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export default function EmptyState({
  title = 'No Records Found',
  description = 'No matching information is available for the selected criteria.',
  icon: Icon = Inbox,
  actionText,
  onAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`glass-card p-10 sm:p-14 text-center rounded-2xl border border-[#14233D] flex flex-col items-center justify-center space-y-3 shadow-sm ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-slate-900/80 border border-slate-700/60 flex items-center justify-center text-slate-400 mb-1">
        <Icon className="w-6 h-6 text-slate-400" />
      </div>
      <h3 className="text-base font-bold text-slate-100">{title}</h3>
      <p className="text-xs sm:text-sm text-slate-400 max-w-md leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20 cursor-pointer"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
