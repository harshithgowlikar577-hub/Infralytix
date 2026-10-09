import React from 'react';
import { getRiskBgColor, getRiskLabel } from '../../lib/utils';

interface BadgeProps {
  variant?: 'risk' | 'status' | 'severity' | 'mode' | 'tier';
  value?: string | number;
  riskScore?: number;
  subtitle?: string;
  className?: string;
}

export function RiskBadge({
  riskScore = 0,
  subtitle,
  className = '',
}: {
  riskScore: number;
  subtitle?: string;
  className?: string;
}) {
  const isCritical = riskScore >= 70;
  const isHigh = riskScore >= 50 && riskScore < 70;
  const isMedium = riskScore >= 30 && riskScore < 50;

  const style = isCritical
    ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/50'
    : isHigh
    ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-900/50'
    : isMedium
    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50'
    : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50';

  const dot = isCritical
    ? 'bg-rose-600 dark:bg-rose-400'
    : isHigh
    ? 'bg-orange-500 dark:bg-orange-400'
    : isMedium
    ? 'bg-amber-500 dark:bg-amber-400'
    : 'bg-emerald-600 dark:bg-emerald-400';

  return (
    <div className={`inline-flex flex-col items-start ${className}`}>
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold border ${style}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${dot} shrink-0`} />
        <span>{getRiskLabel(riskScore)} ({Math.round(riskScore)}%)</span>
      </span>
      {subtitle && (
        <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 pl-0.5">
          {subtitle}
        </span>
      )}
    </div>
  );
}

export function StatusBadge({ status, className = '' }: { status: string; className?: string }) {
  const colors: Record<string, { cls: string; dot: string }> = {
    'In Progress': { cls: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/50', dot: 'bg-blue-600 dark:bg-blue-400' },
    'Completed': { cls: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50', dot: 'bg-emerald-600 dark:bg-emerald-400' },
    'Delayed': { cls: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50', dot: 'bg-amber-600 dark:bg-amber-400' },
    'Stalled': { cls: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/50', dot: 'bg-rose-600 dark:bg-rose-400' },
    'Critical': { cls: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/50', dot: 'bg-rose-600 dark:bg-rose-400' },
    'Active': { cls: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/50', dot: 'bg-indigo-600 dark:bg-indigo-400' },
  };
  const current = colors[status] || colors['In Progress'];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border ${current.cls} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot} shrink-0`} />
      <span>{status}</span>
    </span>
  );
}

export function SeverityBadge({ level, className = '' }: { level: string; className?: string }) {
  const colors: Record<string, string> = {
    Critical: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/50 font-bold',
    High: 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-900/50 font-semibold',
    Medium: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50 font-medium',
    Watch: 'bg-yellow-50 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/50 font-medium',
    Low: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50',
    Resolved: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  };
  const current = colors[level] || colors.Watch;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase tracking-wide border ${current} ${className}`}>
      {level}
    </span>
  );
}

export function ModeBadge({ mode }: { mode: 'observed' | 'predicted' | 'scenario' }) {
  const colors = {
    observed: 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-900/50',
    predicted: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/50',
    scenario: 'bg-fuchsia-50 dark:bg-fuchsia-950/40 text-fuchsia-700 dark:text-fuchsia-400 border-fuchsia-200 dark:border-fuchsia-900/50',
  };
  const labels = { observed: 'Observed Data', predicted: 'ML Forecast', scenario: 'What-If Simulation' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${colors[mode]}`}>
      {labels[mode]}
    </span>
  );
}

export default function Badge({ variant = 'risk', value, riskScore, subtitle, className }: BadgeProps) {
  if (variant === 'risk' && riskScore !== undefined) return <RiskBadge riskScore={riskScore} subtitle={subtitle} className={className} />;
  if (variant === 'status') return <StatusBadge status={String(value)} className={className} />;
  if (variant === 'severity') return <SeverityBadge level={String(value)} className={className} />;
  return <span className={`text-xs text-slate-500 dark:text-slate-400 ${className}`}>{value}</span>;
}
