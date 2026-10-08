/** Format number as Indian currency (₹ Crore) */
export function formatCurrency(value: number): string {
  if (value >= 100) return `₹${(value).toLocaleString('en-IN', { maximumFractionDigits: 0 })} Cr`;
  return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 1 })} Cr`;
}

/** Format large numbers with Indian notation */
export function formatNumber(value: number): string {
  return value.toLocaleString('en-IN');
}

/** Format percentage */
export function formatPercent(value: number): string {
  return `${Number(value || 0).toFixed(1)}%`;
}

/** Get risk color class based on score (0-100) */
export function getRiskColor(score: number): string {
  if (score <= 30) return 'text-emerald-400';
  if (score <= 50) return 'text-amber-400';
  if (score <= 70) return 'text-orange-400';
  if (score <= 85) return 'text-rose-400';
  return 'text-rose-600';
}

/** Get risk background color class */
export function getRiskBgColor(score: number): string {
  if (score <= 30) return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
  if (score <= 50) return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
  if (score <= 70) return 'bg-orange-500/15 text-orange-400 border-orange-500/30';
  if (score <= 85) return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
  return 'bg-rose-950/40 text-rose-300 border-rose-700/50';
}

/** Alias for badge class */
export const getRiskBadgeClass = getRiskBgColor;

/** Get plain-English risk level label */
export function getRiskLabel(score: number): string {
  if (score <= 30) return 'Safe';
  if (score <= 50) return 'Watch';
  if (score <= 70) return 'High Risk';
  if (score <= 85) return 'Very High';
  return 'Critical';
}

/** Get health status color */
export function getHealthColor(status: string): string {
  switch (status?.toLowerCase()) {
    case 'healthy': return 'text-emerald-400';
    case 'warning': return 'text-amber-400';
    case 'critical': return 'text-rose-400';
    default: return 'text-slate-400';
  }
}

/** Format date string */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

/** Format delay days into human-readable months */
export function formatDelay(days: number): string {
  if (days <= 0) return 'On Track';
  const months = days / 30;
  if (months < 1) return `${days} days`;
  return `${months.toFixed(1)} months`;
}

/** Plain English Risk Trend / Trajectory display for non-technical officers */
export function getTrajectoryInfo(trajectory: string): { icon: string; color: string; label: string; explanation: string } {
  switch (trajectory?.toLowerCase()) {
    case 'improving':
      return {
        icon: '▼',
        color: 'text-emerald-400',
        label: 'Improving Pace',
        explanation: 'Work rate is accelerating and recovering lost days.'
      };
    case 'stable':
      return {
        icon: '—',
        color: 'text-slate-400',
        label: 'Stable Velocity',
        explanation: 'Work is progressing steadily with minor manageable variance.'
      };
    case 'deteriorating':
      return {
        icon: '▲',
        color: 'text-amber-400',
        label: 'Slipping Behind',
        explanation: 'Schedule slippage is widening; inter-departmental action advised.'
      };
    case 'rapidly deteriorating':
    case 'rapidly_deteriorating':
      return {
        icon: '▲▲',
        color: 'text-rose-400',
        label: 'Severe Schedule Collapse',
        explanation: 'Critical milestone failure; emergency cabinet-level intervention needed.'
      };
    default:
      return {
        icon: '—',
        color: 'text-slate-400',
        label: trajectory || 'Stable Velocity',
        explanation: 'Progress monitored under regular baseline telemetry.'
      };
  }
}

export function getTrajectoryLabel(trajectory: string): string {
  return getTrajectoryInfo(trajectory).label;
}

/** Plain English Officer Glossary Tooltips */
export const OFFICER_GLOSSARY = {
  totalProjects: 'All central infrastructure assets monitored under PM GatiShakti and MoSPI.',
  healthyProjects: 'Assets progressing within 5% of sanctioned schedule and sanctioned budget outlay.',
  delayedProjects: 'Projects with physical or milestone completion lagging behind sanctioned deadlines.',
  highRiskProjects: 'Assets with composite risk >70 due to land clearance, contractor stalls, or cost spikes.',
  atRiskCapital: 'Cumulative financial expenditure currently exposed to contracts in delay or dispute.',
  predictedEscalation: 'Forecasted financial cost increase over original sanctioned budget by target date.',
  connectedImpact: 'Downstream projects that will be halted if this parent project experiences further delay.',
  commonFailurePattern: 'Historical failure archetype matched through AI pattern recognition.',
  overallRiskScore: 'Calibrated 0-100 risk score combining milestone, cost, delay, and dependency factors.',
};

/** Truncate text */
export function truncate(str: string, maxLen = 40): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen) + '…';
}

/** clsx utility */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
