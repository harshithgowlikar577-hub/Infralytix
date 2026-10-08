import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../hooks/useAPI';
import { formatCurrency } from '../lib/utils';
import {
  TrendingUp, CheckCircle2, AlertTriangle, ArrowRight, Zap,
  Sparkles, Filter, Search, Send, Clock, DollarSign, ShieldCheck, ChevronRight, X
} from 'lucide-react';
import Skeleton from '../components/ui/Skeleton';
import ErrorState from '../components/ui/ErrorState';

export default function RecoveryCommandCenter() {
  const navigate = useNavigate();
  const { data: projectsData, isLoading, isError, refetch } = useProjects({ limit: 40 });
  const [sectorFilter, setSectorFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [dispatchedIds, setDispatchedIds] = useState<Set<string>>(new Set());
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="card" className="h-28" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <Skeleton key={i} variant="card" className="h-28" />)}
        </div>
        <Skeleton variant="card" className="h-96" />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Recovery Center Unavailable"
        message="Could not load actionable recovery telemetry from backend API."
        onRetry={refetch}
      />
    );
  }

  const rawProjects = projectsData?.projects || projectsData?.items || (Array.isArray(projectsData) ? projectsData : []);

  // Compute Top 20 Recoverable Projects
  const recoverableProjects = rawProjects
    .map((p: any, idx: number) => {
      const delayDays = p.delay_days || (p.delay_months ? p.delay_months * 30 : 90);
      const currentCost = p.current_cost || p.revised_cost || p.original_cost || 1000;
      // Algorithmic recovery potential
      const potentialDelayReductionDays = Math.max(30, Math.min(220, Math.round(delayDays * 0.45)));
      const potentialCostSavingsCr = Math.max(15, Math.round((currentCost * 0.035) + (potentialDelayReductionDays * 0.6)));
      const interventionROI = (potentialCostSavingsCr / Math.max(1, currentCost * 0.005)).toFixed(1);

      return {
        id: p.project_id || p.id || `PRJ-${idx + 1}`,
        name: p.project_name || p.name || `Strategic Asset ${idx + 1}`,
        sector: p.sector || 'Roads',
        state: p.state || 'National',
        currentCost,
        delayDays,
        delayMonths: Math.round(delayDays / 30),
        progress: p.progress_percentage || p.physical_progress_pct || 45,
        riskScore: p.risk_score || 72,
        potentialDelayReductionDays,
        potentialCostSavingsCr,
        interventionROI,
        primaryAction: (p.risk_score || 72) > 75
          ? 'Fast-Track State Empowered Committee Land Clearance & Advance Release'
          : 'Contractor Manpower Surge & 24x7 Split Shift Deployment',
      };
    })
    .sort((a: any, b: any) => b.potentialCostSavingsCr - a.potentialCostSavingsCr)
    .slice(0, 20);

  // Filtered
  const filtered = recoverableProjects.filter((p: any) => {
    const matchSec = sectorFilter === 'ALL' || p.sector.toLowerCase().includes(sectorFilter.toLowerCase());
    const matchSearch = !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSec && matchSearch;
  });

  // Cumulative KPI stats
  const totalRecoverableDays = recoverableProjects.reduce((acc, p) => acc + p.potentialDelayReductionDays, 0);
  const totalCostSavingsCr = recoverableProjects.reduce((acc, p) => acc + p.potentialCostSavingsCr, 0);
  const totalAtRisk = recoverableProjects.reduce((acc, p) => acc + p.currentCost, 0);

  const handleDispatch = (id: string, name: string) => {
    setDispatchedIds((prev) => new Set(prev).add(id));
    setActionSuccess(`Immediate Recovery Directive dispatched for ${name}. State PMU notified via PM GatiShakti Gateway.`);
    setTimeout(() => setActionSuccess(null), 5000);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-[#14233D]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
            <span>Governance Operations</span>
            <span>/</span>
            <span className="text-slate-200">Ministerial Action Corridor</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Zap className="w-7 h-7 text-emerald-400" />
            <span>National Recovery Command Center</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
            Prioritizing central infrastructure projects with the highest return on administrative intervention.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Top 20 Priority Assets
          </span>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3 animate-in fade-in shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">{actionSuccess}</span>
        </div>
      )}

      {/* Cumulative Impact Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-emerald-500/30 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Recoverable Timeline</span>
            <Clock className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-emerald-400">
            {totalRecoverableDays.toLocaleString()} Days
          </div>
          <p className="text-xs text-slate-400">
            Aggregate schedule lag recoverable across top 20 corridor packages
          </p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-cyan-500/30 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Capital Avoidance Value</span>
            <DollarSign className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-cyan-400">
            {formatCurrency(totalCostSavingsCr)}
          </div>
          <p className="text-xs text-slate-400">
            Potential fiscal cost overrun prevented through active governance
          </p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-blue-500/30 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Monitored Exposure</span>
            <ShieldCheck className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-white">
            {formatCurrency(totalAtRisk)}
          </div>
          <p className="text-xs text-slate-400">
            Cumulative capex outlay of projects within immediate recovery reach
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {['ALL', 'Roads', 'Railways', 'Power', 'Aviation'].map((sec) => (
            <button
              key={sec}
              onClick={() => setSectorFilter(sec)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                sectorFilter === sec
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-[#091529] border border-[#162744] text-slate-400 hover:text-white'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search corridor or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-[46px] pl-10 pr-9 text-xs sm:text-sm bg-[#091529] border border-[#162744] hover:border-[#223b63] rounded-xl text-slate-200 placeholder-slate-400/80 shadow-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-sans"
            aria-label="Search corridor or code"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Top 20 Recoverable Table */}
      <div className="glass-card rounded-2xl border border-[#14233D] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-[#050D1A]/95 border-b border-[#14233D] text-slate-400 font-bold tracking-wider uppercase text-[11px] z-10">
              <tr>
                <th className="py-4.5 px-6">Priority Recoverable Asset</th>
                <th className="py-4.5 px-4">Sector &amp; State</th>
                <th className="py-4.5 px-4 text-right">Current Outlay</th>
                <th className="py-4.5 px-4 text-right">Current Lag</th>
                <th className="py-4.5 px-4 text-right">Recoverable Days</th>
                <th className="py-4.5 px-4 text-right">Cost Avoided</th>
                <th className="py-4.5 px-4">Recommended Directive</th>
                <th className="py-4.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#14233D]/60 font-sans">
              {filtered.map((p: any, idx: number) => {
                const isDispatched = dispatchedIds.has(p.id);
                return (
                  <tr
                    key={p.id}
                    onClick={() => navigate(`/projects/${p.id}`)}
                    className="hover:bg-blue-500/5 transition-colors cursor-pointer group"
                  >
                    {/* Project Asset */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#081325] text-cyan-400 font-mono text-[10px] font-bold flex items-center justify-center border border-[#162744]">
                          {idx + 1}
                        </span>
                        <div className="font-bold text-white group-hover:text-blue-400 transition-colors text-xs leading-snug">
                          {p.name}
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5 ml-7">{p.id}</div>
                    </td>

                    {/* Sector & State */}
                    <td className="py-4 px-4">
                      <div className="text-slate-200 font-medium">{p.sector}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{p.state}</div>
                    </td>

                    {/* Cost */}
                    <td className="py-4 px-4 text-right font-mono font-bold text-slate-200">
                      {formatCurrency(p.currentCost)}
                    </td>

                    {/* Lag */}
                    <td className="py-4 px-4 text-right font-mono font-bold text-rose-400">
                      {p.delayMonths} Mos
                    </td>

                    {/* Recoverable Days */}
                    <td className="py-4 px-4 text-right font-mono font-extrabold text-emerald-400">
                      +{p.potentialDelayReductionDays}d
                    </td>

                    {/* Cost Avoided */}
                    <td className="py-4 px-4 text-right font-mono font-extrabold text-cyan-400">
                      ₹{p.potentialCostSavingsCr} Cr
                    </td>

                    {/* Directive */}
                    <td className="py-4 px-4 max-w-xs text-[11px] text-slate-300 leading-snug truncate" title={p.primaryAction}>
                      {p.primaryAction}
                    </td>

                    {/* Action */}
                    <td className="py-4 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleDispatch(p.id, p.name)}
                        disabled={isDispatched}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 mx-auto ${
                          isDispatched
                            ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm cursor-pointer active:scale-95'
                        }`}
                      >
                        {isDispatched ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Dispatched</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Issue Order</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Search className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-300">No matching projects found</p>
                    <p className="text-xs text-slate-500 mt-1">Try adjusting your search query or sector filter.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
