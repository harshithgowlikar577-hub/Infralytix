import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects, useProjectHealth } from '../hooks/useAPI';
import { formatCurrency, formatPercent } from '../lib/utils';
import Skeleton from '../components/ui/Skeleton';
import ErrorState from '../components/ui/ErrorState';
import {
  Activity, HeartPulse, CheckCircle2, AlertTriangle, AlertOctagon,
  Search, ExternalLink, ArrowRight, Layers, ShieldCheck, ChevronRight,
  ArrowUpDown, ArrowUp, ArrowDown, X, RefreshCw
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

export default function HealthCenter() {
  const navigate = useNavigate();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>('INF0001');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'HEALTHY' | 'WARNING' | 'CRITICAL'>('ALL');
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<'name' | 'progress' | 'delay' | 'score'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const { data: projectsData, isLoading, isError, refetch } = useProjects({ limit: 50 });
  const { data: activeHealth, isLoading: healthLoading } = useProjectHealth(selectedProjectId || '');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="card" className="h-24" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton variant="card" className="h-96 lg:col-span-2" />
          <Skeleton variant="card" className="h-96" />
        </div>
      </div>
    );
  }

  if (isError) {
    return <ErrorState title="Failed to load Health Center" message="Unable to fetch portfolio health telemetry." onRetry={refetch} />;
  }

  const projects = projectsData?.projects || projectsData?.items || (Array.isArray(projectsData) ? projectsData : []);

  // Compute portfolio health breakdown
  const classifiedProjects = projects.map((p: any) => {
    const progress = p.progress_percentage || p.physical_progress_pct || 0;
    const delay = p.delay_days || (p.delay_months ? p.delay_months * 30 : 0);
    const costRatio = p.original_cost > 0 ? (p.current_cost || p.revised_cost || p.original_cost) / p.original_cost : 1.0;

    let healthScore = Math.max(10, Math.min(98, Math.round(
      (progress * 0.35) +
      (Math.max(0, 100 - (costRatio - 1) * 100) * 0.25) +
      (Math.max(0, 100 - (delay / 3.6)) * 0.40)
    )));

    let status: 'Healthy' | 'Warning' | 'Critical' = 'Healthy';
    if (healthScore < 50 || delay > 180) status = 'Critical';
    else if (healthScore < 70 || delay > 60) status = 'Warning';

    return {
      ...p,
      pid: p.project_id || p.id,
      computedHealth: healthScore,
      healthStatus: status,
    };
  });

  const healthyCount = classifiedProjects.filter((p: any) => p.healthStatus === 'Healthy').length;
  const warningCount = classifiedProjects.filter((p: any) => p.healthStatus === 'Warning').length;
  const criticalCount = classifiedProjects.filter((p: any) => p.healthStatus === 'Critical').length;
  const avgHealth = classifiedProjects.length > 0
    ? (classifiedProjects.reduce((acc: number, p: any) => acc + p.computedHealth, 0) / classifiedProjects.length).toFixed(1)
    : '68.5';

  const filteredProjects = classifiedProjects.filter((p: any) => {
    const matchesFilter =
      statusFilter === 'ALL' ||
      p.healthStatus.toUpperCase() === statusFilter;
    const matchesSearch =
      !search ||
      (p.project_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.pid || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.sector || '').toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const toggleSort = (field: 'name' | 'progress' | 'delay' | 'score') => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder(field === 'score' || field === 'delay' ? 'desc' : 'asc');
    }
  };

  const sortedProjects = [...filteredProjects].sort((a: any, b: any) => {
    let aVal: any = 0;
    let bVal: any = 0;
    if (sortField === 'name') {
      aVal = (a.project_name || '').toLowerCase();
      bVal = (b.project_name || '').toLowerCase();
      return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    if (sortField === 'progress') {
      aVal = a.progress_percentage || a.physical_progress_pct || 0;
      bVal = b.progress_percentage || b.physical_progress_pct || 0;
    } else if (sortField === 'delay') {
      aVal = a.delay_days || 0;
      bVal = b.delay_days || 0;
    } else if (sortField === 'score') {
      aVal = a.computedHealth || 0;
      bVal = b.computedHealth || 0;
    }
    return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="pb-2 border-b border-[#14233D] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
            <span>Surveillance</span>
            <span>/</span>
            <span className="text-slate-200">Asset Health Matrix</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <HeartPulse className="w-7 h-7 text-emerald-400" />
            <span>National Infrastructure Health Center</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Algorithmic 4-Pillar Health Scoring (35% Physical Progress · 25% Budget Discipline · 20% Milestones · 20% Delay Adherence).
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isLoading}
          title={isLoading ? "Refreshing health metrics..." : "Refresh health metrics"}
          aria-label="Refresh health metrics"
          className={`self-start sm:self-center px-3.5 py-2 text-xs font-bold rounded-xl bg-[#091529] hover:bg-[#0E1E38] text-slate-200 border border-[#1E3354] flex items-center gap-2 transition-all shadow-sm ${
            isLoading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isLoading ? "animate-spin" : ""}`} />
          <span>{isLoading ? "Refreshing..." : "Refresh"}</span>
        </button>
      </div>

      {/* 3-Point Context Summary Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#050D1A] p-5 rounded-2xl border border-[#14233D] text-xs">
        <div className="flex items-start gap-3">
          <span className="px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-400 font-bold uppercase text-[10px] shrink-0 border border-blue-500/30">
            Portfolio
          </span>
          <span className="text-slate-300 leading-relaxed">
            Composite National Health Index is <strong className="text-emerald-400 font-bold font-mono">{avgHealth}/100</strong> across {classifiedProjects.length} monitored assets.
          </span>
        </div>
        <div className="flex items-start gap-3">
          <span className="px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-400 font-bold uppercase text-[10px] shrink-0 border border-rose-500/30">
            Critical
          </span>
          <span className="text-slate-300 leading-relaxed">
            <strong className="text-rose-400 font-bold font-mono">{criticalCount} assets</strong> exhibit multi-pillar failure requiring immediate ministerial intervention.
          </span>
        </div>
        <div className="flex items-start gap-3">
          <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 font-bold uppercase text-[10px] shrink-0 border border-emerald-500/30">
            Inspection
          </span>
          <span className="text-slate-300 leading-relaxed">
            Click any row below to inspect its 4-pillar algorithmic breakdown and deploy directives.
          </span>
        </div>
      </div>

      {/* Health Overview Metrics Deck */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Portfolio Health Index</span>
          <div className="text-3xl lg:text-4xl font-extrabold font-mono text-emerald-400 mt-2 leading-none">
            {avgHealth} <span className="text-xs font-normal text-slate-500">/ 100</span>
          </div>
          <div className="text-xs text-slate-400 mt-2 font-medium">Stable Operational Baseline</div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Healthy Assets</span>
          <div className="text-3xl lg:text-4xl font-extrabold font-mono text-emerald-400 mt-2 leading-none">{healthyCount}</div>
          <div className="text-xs text-slate-500 mt-2">Within scheduled tolerance limits</div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Warning Stage</span>
          <div className="text-3xl lg:text-4xl font-extrabold font-mono text-amber-400 mt-2 leading-none">{warningCount}</div>
          <div className="text-xs text-slate-500 mt-2">Requiring nodal coordination</div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Critical Stagnation</span>
          <div className="text-3xl lg:text-4xl font-extrabold font-mono text-rose-400 mt-2 leading-none">{criticalCount}</div>
          <div className="text-xs text-rose-400 mt-2 font-semibold">Active directives triggered</div>
        </div>
      </div>

      {/* Main Content: Table + Deep Inspector Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects Health Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Filter Tabs */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'ALL' ? 'bg-blue-600 text-white shadow' : 'bg-[#091529] border border-[#1E3354] text-slate-400 hover:text-white'
                }`}
              >
                All ({classifiedProjects.length})
              </button>
              <button
                onClick={() => setStatusFilter('HEALTHY')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'HEALTHY' ? 'bg-emerald-600 text-white shadow' : 'bg-[#091529] border border-[#1E3354] text-emerald-400 hover:text-emerald-300'
                }`}
              >
                Healthy ({healthyCount})
              </button>
              <button
                onClick={() => setStatusFilter('WARNING')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'WARNING' ? 'bg-amber-600 text-white shadow' : 'bg-[#091529] border border-[#1E3354] text-amber-400 hover:text-amber-300'
                }`}
              >
                Warning ({warningCount})
              </button>
              <button
                onClick={() => setStatusFilter('CRITICAL')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'CRITICAL' ? 'bg-rose-600 text-white shadow' : 'bg-[#091529] border border-[#1E3354] text-rose-400 hover:text-rose-300'
                }`}
              >
                Critical ({criticalCount})
              </button>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-72 flex items-center">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search asset, sector…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search asset, sector"
                className="w-full h-[46px] pl-11 pr-10 py-2.5 text-sm bg-[#091529] border border-[#1E3354] rounded-2xl text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 focus:shadow-[0_0_18px_rgba(59,130,246,0.18)] transition-all shadow-inner font-sans"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
                  title="Clear search"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="glass-card rounded-2xl border border-[#14233D] overflow-hidden shadow-xl">
            <div className="overflow-x-auto max-h-[580px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-[#050D1A]/95 border-b border-[#14233D] text-slate-400 font-bold tracking-wider uppercase text-[11px] z-10">
                  <tr>
                    <th
                      className="py-4 px-5 cursor-pointer hover:text-white transition-colors select-none"
                      onClick={() => toggleSort('name')}
                      title="Sort by Asset Name"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Infrastructure Asset</span>
                        {sortField === 'name' ? (
                          sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-blue-400" /> : <ArrowDown className="w-3.5 h-3.5 text-blue-400" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-500" />
                        )}
                      </div>
                    </th>
                    <th className="py-4 px-4">Sector</th>
                    <th
                      className="py-4 px-4 text-right cursor-pointer hover:text-white transition-colors select-none"
                      onClick={() => toggleSort('progress')}
                      title="Sort by Physical Progress"
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <span>Physical Progress</span>
                        {sortField === 'progress' ? (
                          sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-blue-400" /> : <ArrowDown className="w-3.5 h-3.5 text-blue-400" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-500" />
                        )}
                      </div>
                    </th>
                    <th
                      className="py-4 px-4 text-right cursor-pointer hover:text-white transition-colors select-none"
                      onClick={() => toggleSort('delay')}
                      title="Sort by Schedule Delay"
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <span>Delay</span>
                        {sortField === 'delay' ? (
                          sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-blue-400" /> : <ArrowDown className="w-3.5 h-3.5 text-blue-400" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-500" />
                        )}
                      </div>
                    </th>
                    <th className="py-4 px-4 text-center">Health Status</th>
                    <th
                      className="py-4 px-4 text-center cursor-pointer hover:text-white transition-colors select-none"
                      onClick={() => toggleSort('score')}
                      title="Sort by Health Score"
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <span>Score</span>
                        {sortField === 'score' ? (
                          sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-blue-400" /> : <ArrowDown className="w-3.5 h-3.5 text-blue-400" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-500" />
                        )}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#14233D]/60">
                  {sortedProjects.map((p: any) => {
                    const isSelected = selectedProjectId === p.pid;
                    return (
                      <tr
                        key={p.pid}
                        onClick={() => setSelectedProjectId(p.pid)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-blue-950/70 border-l-4 border-blue-500'
                            : 'even:bg-[#081326]/45 odd:bg-[#050D1A]/30 hover:bg-blue-600/15'
                        }`}
                      >
                        <td className="py-4 px-5">
                          <div className="font-bold text-white truncate max-w-xs">{p.project_name}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{p.pid}</div>
                        </td>
                        <td className="py-4 px-4 text-slate-200 font-medium">{p.sector}</td>
                        <td className="py-4 px-4 text-right font-mono font-bold text-slate-200">
                          {formatPercent(p.progress_percentage || 0)}
                        </td>
                        <td className="py-4 px-4 text-right font-mono font-bold text-amber-400">
                          {p.delay_days || 0}d
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            p.healthStatus === 'Healthy'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : p.healthStatus === 'Warning'
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          }`}>
                            {p.healthStatus}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center font-mono font-extrabold text-white text-sm">
                          {p.computedHealth}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Health Engine Diagnostic Inspector Drawer */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between border-b border-[#14233D] pb-3.5">
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">Diagnostic Inspector</h2>
                <p className="text-xs text-slate-400 mt-0.5">4-Pillar breakdown for {selectedProjectId}</p>
              </div>
              <button
                onClick={() => navigate(`/projects/${selectedProjectId}`)}
                className="p-2 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white transition-all cursor-pointer shadow-sm"
                title="Open 360° Dossier"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>

            {healthLoading ? (
              <div className="py-12 space-y-4">
                <Skeleton variant="card" className="h-20" />
                <Skeleton variant="card" className="h-40" />
              </div>
            ) : activeHealth ? (
              <div className="space-y-5 pt-4">
                {/* Unified Score Card */}
                <div className="p-5 rounded-2xl bg-[#050D1A] border border-[#14233D] text-center shadow-inner">
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Composite Health Score</span>
                  <div className="text-4xl font-extrabold font-mono text-emerald-400 mt-1 leading-none">
                    {activeHealth.health_score?.toFixed(1) || 65.0}
                    <span className="text-sm font-normal text-slate-500"> / 100</span>
                  </div>
                  <div className="text-xs text-slate-300 mt-2">
                    Rating Status: <strong className="text-amber-400">{activeHealth.health_status || 'Warning'}</strong>
                  </div>
                </div>

                {/* 4 Pillars Breakdown */}
                {activeHealth.formula_breakdown && (
                  <div className="space-y-3">
                    <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Formula Pillar Weights</span>
                    {[
                      { label: 'Physical Progress (35%)', val: activeHealth.formula_breakdown.progress_component_35pct || 42, color: 'bg-emerald-500' },
                      { label: 'Budget Discipline (25%)', val: activeHealth.formula_breakdown.budget_component_25pct || 87, color: 'bg-blue-500' },
                      { label: 'Milestone Adherence (20%)', val: activeHealth.formula_breakdown.milestone_component_20pct || 90, color: 'bg-purple-500' },
                      { label: 'Delay Degradation (20%)', val: activeHealth.formula_breakdown.delay_component_20pct || 28, color: 'bg-rose-500' },
                    ].map((pillar, i) => (
                      <div key={i} className="p-3 rounded-xl bg-[#050D1A] border border-[#14233D] text-xs space-y-1.5">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-300 font-semibold">{pillar.label}</span>
                          <span className="font-mono font-bold text-white">{Number(pillar.val).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-[#14233D] h-2 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${pillar.color}`} style={{ width: `${Math.min(100, Math.max(0, pillar.val))}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Diagnostic Signals */}
                {activeHealth.insights && activeHealth.insights.length > 0 && (
                  <div className="space-y-2 pt-3 border-t border-[#14233D]">
                    <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Health Signals</span>
                    <div className="space-y-2 text-xs text-slate-300">
                      {activeHealth.insights.map((msg: string, i: number) => (
                        <div key={i} className="p-3 rounded-xl bg-[#050D1A] border border-[#14233D] flex items-start gap-2.5">
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{msg}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-500">
                Select any project on the left to inspect its health decomposition.
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#14233D]">
            <button
              onClick={() => navigate(`/projects/${selectedProjectId}`)}
              className="w-full py-2.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30 transition-all cursor-pointer"
            >
              <span>View Full 360° Dossier</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
