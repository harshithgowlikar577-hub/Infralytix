import React, { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  trendPositive?: boolean;
  delta?: string;
  deltaType?: 'positive' | 'negative' | 'neutral';
  icon?: ReactNode;
  iconBgColor?: string;
  accentColor?: string;
  badge?: string;
  badgeColor?: string;
  pulse?: boolean;
  onClick?: () => void;
  className?: string;
}

export default function MetricCard({
  title,
  value,
  subtitle,
  trend,
  trendPositive = true,
  delta,
  deltaType = 'neutral',
  icon,
  iconBgColor,
  badge,
  badgeColor,
  pulse = false,
  onClick,
  className = '',
}: MetricCardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-[#0F1B2F] border border-slate-200 dark:border-[#1E2F4D] rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md shadow-xs ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* Top Header: Title (16px) + Optional Icon/Badge */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-[15px] sm:text-[16px] font-semibold text-slate-700 dark:text-slate-300 truncate">
          {title}
        </span>
        {icon && (
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${iconBgColor || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
            {icon}
          </div>
        )}
        {badge && (
          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${badgeColor || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
            {badge}
          </span>
        )}
      </div>

      {/* Primary KPI Value (40px) */}
      <div className="my-1">
        <span className="text-[36px] sm:text-[40px] font-black tracking-tight text-slate-900 dark:text-white font-sans leading-none">
          {value}
        </span>
      </div>

      {/* Subtitle / Telemetry Context (13px caption / 15px secondary) */}
      {(subtitle || trend || delta) && (
        <div className="mt-3 flex items-center flex-wrap gap-2 text-[13px] text-slate-500 dark:text-slate-400">
          {trend && (
            <span
              className={`font-semibold flex items-center gap-1 ${
                trendPositive
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {trend}
            </span>
          )}
          {delta && (
            <span
              className={`px-1.5 py-0.2 rounded font-medium ${
                deltaType === 'positive'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                  : deltaType === 'negative'
                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400'
                  : 'text-slate-500'
              }`}
            >
              {delta}
            </span>
          )}
          {subtitle && <span className="truncate">{subtitle}</span>}
        </div>
      )}
    </div>
  );
}
