import { getRiskBgColor, getRiskLabel } from '../../lib/utils';

interface BadgeProps {
  variant?: 'risk' | 'status' | 'severity' | 'mode';
  value?: string | number;
  riskScore?: number;
  className?: string;
}

export function RiskBadge({ riskScore = 0, className = '' }: { riskScore: number; className?: string }) {
  const dotColor =
    riskScore <= 30 ? 'bg-emerald-400' :
    riskScore <= 50 ? 'bg-amber-400' :
    riskScore <= 70 ? 'bg-orange-400' : 'bg-rose-400';

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold font-mono tracking-tight border shadow-xs ${getRiskBgColor(riskScore)} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} shrink-0`} />
      <span>{getRiskLabel(riskScore)} ({Math.round(riskScore)})</span>
    </span>
  );
}

export function StatusBadge({ status, className = '' }: { status: string; className?: string }) {
  const colors: Record<string, { cls: string; dot: string }> = {
    'In Progress': { cls: 'bg-blue-500/15 text-blue-400 border-blue-500/30', dot: 'bg-blue-400' },
    'Completed': { cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-400' },
    'Delayed': { cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30', dot: 'bg-amber-400' },
    'Stalled': { cls: 'bg-orange-500/15 text-orange-400 border-orange-500/30', dot: 'bg-orange-400' },
    'Critical': { cls: 'bg-rose-500/15 text-rose-400 border-rose-500/30', dot: 'bg-rose-400' },
    'Not Started': { cls: 'bg-slate-500/15 text-slate-400 border-slate-500/30', dot: 'bg-slate-400' },
    'Active': { cls: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30', dot: 'bg-cyan-400' },
  };
  const current = colors[status] || colors['In Progress'];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${current.cls} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot} shrink-0`} />
      <span>{status}</span>
    </span>
  );
}

export function SeverityBadge({ level, className = '' }: { level: string; className?: string }) {
  const colors: Record<string, { cls: string; dot: string }> = {
    'Critical': { cls: 'bg-rose-500/15 text-rose-400 border-rose-500/30 font-bold', dot: 'bg-rose-400' },
    'High': { cls: 'bg-orange-500/15 text-orange-400 border-orange-500/30 font-semibold', dot: 'bg-orange-400' },
    'Warning': { cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30 font-medium', dot: 'bg-amber-400' },
    'Medium': { cls: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30 font-medium', dot: 'bg-yellow-400' },
    'Low': { cls: 'bg-blue-500/15 text-blue-400 border-blue-500/30', dot: 'bg-blue-400' },
    'Info': { cls: 'bg-slate-500/15 text-slate-400 border-slate-500/30', dot: 'bg-slate-400' },
  };
  const current = colors[level] || colors['Info'];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] uppercase tracking-wide border ${current.cls} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot} shrink-0`} />
      <span>{level}</span>
    </span>
  );
}

export function ModeBadge({ mode }: { mode: 'observed' | 'predicted' | 'scenario' }) {
  const colors = {
    observed: { cls: 'bg-sky-500/15 text-sky-400 border-sky-500/30', dot: 'bg-sky-400' },
    predicted: { cls: 'bg-purple-500/15 text-purple-400 border-purple-500/30', dot: 'bg-purple-400' },
    scenario: { cls: 'bg-pink-500/15 text-pink-400 border-pink-500/30', dot: 'bg-pink-400' },
  };
  const labels = { observed: 'Observed', predicted: 'ML Predicted', scenario: 'Scenario' };
  const current = colors[mode] || colors.observed;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${current.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot} shrink-0`} />
      <span>{labels[mode]}</span>
    </span>
  );
}

export default function Badge({ variant = 'risk', value, riskScore, className }: BadgeProps) {
  if (variant === 'risk' && riskScore !== undefined) return <RiskBadge riskScore={riskScore} className={className} />;
  if (variant === 'status') return <StatusBadge status={String(value)} className={className} />;
  if (variant === 'severity') return <SeverityBadge level={String(value)} className={className} />;
  return <span className={`text-xs text-slate-400 ${className}`}>{value}</span>;
}
