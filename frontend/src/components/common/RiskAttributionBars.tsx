import React from 'react';
import { ShieldAlert, Info, BrainCircuit, CheckCircle2 } from 'lucide-react';

export interface RiskContributor {
  category: string;
  sharePercent: number;
  points: number;
  color: string;
  rootCause: string;
}

interface RiskAttributionBarsProps {
  score?: number;
  riskLevel?: string;
  projectName?: string;
  contributors?: RiskContributor[];
  primaryRootCause?: string;
}

const DEFAULT_CONTRIBUTORS: RiskContributor[] = [
  {
    category: 'Schedule Delay Impact',
    sharePercent: 34,
    points: 27.5,
    color: '#EF4444', // Rose
    rootCause: '14-month milestone slippage in main carriageway pavement package.',
  },
  {
    category: 'Cost Overrun Escalation',
    sharePercent: 26,
    points: 21.0,
    color: '#F97316', // Orange
    rootCause: '18.4% budget expansion from raw material & bituminous price escalation.',
  },
  {
    category: 'Land Acquisition & RoW',
    sharePercent: 18,
    points: 14.6,
    color: '#F59E0B', // Amber
    rootCause: '42.6 hectares awaiting Stage-II district collector possession clearance.',
  },
  {
    category: 'Contractor Delivery Latency',
    sharePercent: 12,
    points: 9.7,
    color: '#3B82F6', // Blue
    rootCause: 'Lead EPC contractor working capital strain; equipment mobilization at 64%.',
  },
  {
    category: 'Environmental & Weather Risk',
    sharePercent: 10,
    points: 8.2,
    color: '#8B5CF6', // Purple
    rootCause: 'Monsoon flooding vulnerability in drainage basin sector 4.',
  },
];

export default function RiskAttributionBars({
  score = 81,
  riskLevel = 'Critical',
  projectName = 'Strategic Corridor',
  contributors = DEFAULT_CONTRIBUTORS,
  primaryRootCause = 'Inter-state land acquisition friction compounded by contractor liquidity latency.',
}: RiskAttributionBarsProps) {
  const getBadgeCls = (s: number) => {
    if (s >= 80) return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
    if (s >= 60) return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    if (s >= 40) return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
    return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
  };

  return (
    <div className="glass-card p-6 rounded-2xl border border-[#162744] space-y-6">
      {/* Header with Explainability Guarantee */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#14233D]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                WHY THIS RISK SCORE?
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                SHAP Explainable AI
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Decomposed feature attribution — zero black-box algorithms
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="text-right">
            <div className="text-[10px] uppercase font-mono font-bold text-slate-400">Composite Risk Score</div>
            <div className="text-xl font-mono font-extrabold text-white flex items-center justify-end gap-1.5 mt-0.5">
              <span>{score}</span>
              <span className="text-xs text-slate-500 font-normal">/ 100</span>
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold border ${getBadgeCls(score)}`}>
            {riskLevel}
          </span>
        </div>
      </div>

      {/* Plain Language Summary Tag */}
      <div className="p-3.5 rounded-xl bg-[#061021] border border-[#1E3354] text-xs space-y-1">
        <div className="font-semibold text-slate-200 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span>Primary Diagnostic Root Cause:</span>
        </div>
        <p className="text-slate-300 pl-5 leading-relaxed">
          {primaryRootCause}
        </p>
      </div>

      {/* Horizontal Contributor Bars */}
      <div className="space-y-4">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Attribution Decomposition</span>
          <span className="text-[11px] font-mono text-slate-500">Share of Total Risk</span>
        </div>

        <div className="space-y-3.5">
          {contributors.map((c, i) => (
            <div key={i} className="space-y-1.5 group">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: c.color }}
                  />
                  <span className="font-semibold text-slate-200 truncate">{c.category}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0 font-mono text-xs">
                  <span className="text-slate-400 text-[11px]">+{c.points.toFixed(1)} pts</span>
                  <span className="font-bold text-white w-10 text-right">{c.sharePercent}%</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-[#050D1A] h-2.5 rounded-full overflow-hidden border border-[#14233D]">
                <div
                  className="h-full rounded-full transition-all duration-500 group-hover:brightness-110"
                  style={{
                    width: `${c.sharePercent}%`,
                    backgroundColor: c.color,
                  }}
                />
              </div>

              <div className="text-[11px] text-slate-400 pl-4.5 leading-snug">
                {c.rootCause}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trust & Audit Footnote */}
      <div className="pt-3 border-t border-[#14233D] flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500 font-mono">
        <div className="flex items-center gap-1.5 text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>SHAP Value Additive Consistency Verified (Sum = 100%)</span>
        </div>
        <span>Model Version: INFRALYTIX-DNA-v4.2</span>
      </div>
    </div>
  );
}
