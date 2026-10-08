import React from 'react';
import { Users, TrendingDown, Briefcase, IndianRupee, Globe2, AlertTriangle, ShieldCheck, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

export interface PublicImpactData {
  projectName?: string;
  populationBenefitingMillions?: number;
  populationAffectedMillions?: number;
  economicOutputDelayedCr?: number;
  jobsImpacted?: number;
  gdpContributionPct?: number;
  sdgGoals?: { code: string; title: string; color: string }[];
}

interface PublicImpactEngineProps {
  data?: PublicImpactData;
  projectName?: string;
  delayMonths?: number;
  currentCostCr?: number;
}

export default function PublicImpactEngine({
  data,
  projectName = 'Delhi–Mumbai Strategic Logistics Corridor',
  delayMonths = 14,
  currentCostCr = 12480,
}: PublicImpactEngineProps) {
  // Compute realistic dynamic metrics if custom data not passed
  const popBenefiting = data?.populationBenefitingMillions ?? Math.max(2.5, Math.round((currentCostCr / 850) * 10) / 10);
  const popAffected = data?.populationAffectedMillions ?? 12.3;
  const econDelayed = data?.economicOutputDelayedCr ?? 14000;
  const jobs = data?.jobsImpacted ?? Math.round(currentCostCr * 3.4);
  const gdp = data?.gdpContributionPct ?? 0.18;

  const defaultSdgs = [
    { code: 'SDG 9', title: 'Industry, Innovation & Infrastructure', color: '#F97316' },
    { code: 'SDG 8', title: 'Decent Work & Economic Growth', color: '#A21CAF' },
    { code: 'SDG 11', title: 'Sustainable Cities & Communities', color: '#F59E0B' },
    { code: 'SDG 7', title: 'Affordable & Clean Energy', color: '#10B981' },
  ];
  const sdgs = data?.sdgGoals || defaultSdgs;

  return (
    <div className="glass-card p-6 rounded-2xl border border-[#162744] space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#14233D]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Globe2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                PUBLIC IMPACT & SOCIOECONOMIC INTELLIGENCE
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                GatiShakti Aligned
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Quantifying citizen outcomes, supply chain throughput, and economic penalties
            </p>
          </div>
        </div>

        <span className="text-xs font-mono text-slate-400 self-start sm:self-auto bg-[#071326] px-3 py-1.5 rounded-xl border border-[#162744]">
          {delayMonths} Months Delay Impact
        </span>
      </div>

      {/* Critical Ministerial Impact Callout Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-950/40 via-[#131D33] to-amber-950/30 border border-rose-500/30 text-xs shadow-lg space-y-2">
        <div className="flex items-center gap-2 text-rose-400 font-bold uppercase tracking-wider text-[11px]">
          <AlertTriangle className="w-4 h-4 shrink-0 animate-pulse" />
          <span>National Governance Decision Callout</span>
        </div>
        <p className="text-sm font-semibold text-white leading-relaxed">
          &ldquo;Delay in this corridor affects <span className="text-amber-400 font-bold underline decoration-amber-400/50 underline-offset-4">{popAffected} million citizens</span> and <span className="text-rose-400 font-bold underline decoration-rose-400/50 underline-offset-4">{formatCurrency(econDelayed)}</span> annual logistics throughput.&rdquo;
        </p>
        <p className="text-[11px] text-slate-400">
          Evaluated against PM GatiShakti multi-modal logistics velocity and regional industrial corridor connectivity.
        </p>
      </div>

      {/* 4-Stat Impact Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-4 rounded-xl bg-[#061021] border border-[#14233D] space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Beneficiary Base</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-white">
            {popBenefiting}M
          </div>
          <p className="text-[11px] text-slate-400">Citizens gaining direct access upon corridor completion</p>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-xl bg-[#061021] border border-[#14233D] space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Citizens Affected</span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-rose-400">
            {popAffected}M
          </div>
          <p className="text-[11px] text-slate-400">Commuters & freight operators bearing transit delay penalties</p>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-xl bg-[#061021] border border-[#14233D] space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Output Deferred</span>
            <IndianRupee className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-amber-400">
            {formatCurrency(econDelayed)}
          </div>
          <p className="text-[11px] text-slate-400">Annual delayed logistics value & secondary supply-chain loss</p>
        </div>

        {/* Metric 4 */}
        <div className="p-4 rounded-xl bg-[#061021] border border-[#14233D] space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Jobs Impacted</span>
            <Briefcase className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-blue-400">
            {jobs.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400">Construction, logistics, and allied industrial employment</p>
        </div>
      </div>

      {/* Macro Contribution & SDGs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
        {/* GDP Contribution */}
        <div className="p-4 rounded-xl bg-[#061021] border border-[#14233D] space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Macroeconomic GVA Uplift</span>
            <span className="text-emerald-400 font-mono font-bold">+{gdp}% Regional GVA</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Projected contribution to the state Gross State Domestic Product (GSDP) via reduced freight logistics costs from 14% to 8% of cargo value.
          </p>
        </div>

        {/* SDG Linkages */}
        <div className="p-4 rounded-xl bg-[#061021] border border-[#14233D] space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            United Nations SDG Impact Alignments
          </div>
          <div className="flex flex-wrap gap-2">
            {sdgs.map((sdg, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono border flex items-center gap-1.5 bg-[#081325]"
                style={{ borderColor: `${sdg.color}40`, color: sdg.color }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sdg.color }} />
                <span>{sdg.code}: {sdg.title}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
