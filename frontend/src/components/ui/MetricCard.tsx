import { ReactNode } from 'react';

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
  iconBgColor = 'bg-blue-600 text-white',
  accentColor,
  pulse = false,
  onClick,
  className = '',
}: MetricCardProps) {
  return (
    <div
      onClick={onClick}
      className={`ref-card p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* Top row: Icon + Title */}
      <div className="flex items-center gap-3 mb-3">
        {icon && (
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-xs shrink-0 ${iconBgColor}`}>
            {icon}
          </div>
        )}
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
          {title}
        </span>
      </div>

      {/* Middle: Big Stat */}
      <div className="my-1">
        <span className="text-2xl sm:text-3xl font-bold font-sans tracking-tight text-slate-900 dark:text-white leading-tight">
          {value}
        </span>
      </div>

      {/* Bottom: Trend or Subtitle */}
      <div className="mt-2 flex items-center gap-1.5 text-xs">
        {trend && (
          <span className={`font-semibold flex items-center gap-1 ${
            trendPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          }`}>
            {trend}
          </span>
        )}
        {subtitle && (
          <span className="text-slate-400 dark:text-slate-500 text-[11px] truncate">
            {subtitle}
          </span>
        )}
        {delta && !trend && (
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
            deltaType === 'positive'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : deltaType === 'negative'
              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
              : 'bg-slate-500/10 text-slate-500'
          }`}>
            {delta}
          </span>
        )}
      </div>
    </div>
  );
}
