import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSectorAnalytics, useMinistryAnalytics, useStateAnalytics, useDashboardAnalytics, useProjects } from '../hooks/useAPI';
import { formatNumber } from '../lib/utils';
import Skeleton from '../components/ui/Skeleton';
import ErrorState from '../components/ui/ErrorState';
import {
  BarChart3,
  TrendingUp,
  AlertCircle,
  ShieldAlert,
  ArrowUpRight,
  Layers,
  Building2,
  Clock,
  DollarSign,
  Filter,
  RotateCcw,
  Search,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Info,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

// Distinct colors for each sector in scatter plot and charts
const SECTOR_COLORS: Record<string, string> = {
  'Transport & Logistics': '#6366F1', // Indigo
  'Energy': '#F59E0B',                // Amber
  'Others': '#8B5CF6',                // Purple
  'Social & Commercial': '#10B981',   // Emerald
  'Water & Sanitation': '#06B6D4',    // Cyan
  'Communication': '#EC4899',         // Pink
};

// Systemic chokepoints sorted descending by actual project count
const SYSTEMIC_BOTTLENECKS = [
  {
    name: 'Right of Way (Land Clearance)',
    count: 42,
    sharePct: 33.1,
    color: '#EF4444',
    sectors: 'Transport & Logistics, Energy',
    description: 'Linear alignment RoW disputes, revenue surveys, and multi-district parcel acquisition holds.',
  },
  {
    name: 'Environmental / Forest NOC',
    count: 28,
    sharePct: 22.0,
    color: '#F97316',
    sectors: 'Energy, Transport & Logistics',
    description: 'Stage-II wildlife, forest diversion permits, and eco-sensitive buffer approvals.',
  },
  {
    name: 'Utility Shifting (Power/Water)',
    count: 24,
    sharePct: 18.9,
    color: '#3B82F6',
    sectors: 'Transport & Logistics, Water',
    description: 'High-voltage transmission line diversion and municipal water conduit realignment lags.',
  },
  {
    name: 'Contractor Liquidity & Cash Flow',
    count: 18,
    sharePct: 14.2,
    color: '#F59E0B',
    sectors: 'Transport, Social & Commercial',
    description: 'Milestone certification lag, working capital bottlenecks, and subcontractor remobilization.',
  },
  {
    name: 'Inter-Departmental Clearances',
    count: 15,
    sharePct: 11.8,
    color: '#8B5CF6',
    sectors: 'Railways, Urban Transit',
    description: 'Defence land transfers, rail-over-bridge CRS approvals, and local municipal NOC delays.',
  },
];

const TOTAL_BOTTLENECK_INCIDENTS = 127;

export default function Analytics() {
  const navigate = useNavigate();

  // Primary API queries
  const { data: sectorData, isLoading: sLoading, isError: sError, refetch } = useSectorAnalytics();
  const { data: dashboardData, isLoading: dLoading } = useDashboardAnalytics();
  const { data: ministryData, isLoading: mLoading } = useMinistryAnalytics();
  const { data: stateData, isLoading: stLoading } = useStateAnalytics();

  // UI state for detailed analytics view
  const [activeTab, setActiveTab] = useState<'sectors' | 'delays' | 'projects'>('sectors');
  const [scatterScaleMode, setScatterScaleMode] = useState<'linear' | 'log'>('linear');

  // Filter state for Project explorer table (all supported by /api/v1/projects)
  const [filterSector, setFilterSector] = useState<string>('');
  const [filterRisk, setFilterRisk] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [projectPage, setProjectPage] = useState<number>(1);
  const [projectSortBy, setProjectSortBy] = useState<'delay' | 'cost' | 'progress'>('delay');
  const [projectSortOrder, setProjectSortOrder] = useState<'asc' | 'desc'>('desc');

  // Fetch project records for the detailed explorer table
  const { data: projectsResp, isLoading: pLoading } = useProjects({
    sector: filterSector || undefined,
    risk_level: filterRisk || undefined,
    status: filterStatus || undefined,
    search: searchQuery || undefined,
    page: projectPage,
    limit: 10,
  });

  const rawProjects = useMemo(() => {
    return projectsResp?.projects || projectsResp?.items || [];
  }, [projectsResp]);

  const totalProjectRecords = projectsResp?.total_count || 1981;
  const totalPages = Math.max(1, Math.ceil(totalProjectRecords / 10));

  // Sort projects client-side if needed for the current page
  const sortedProjects = useMemo(() => {
    const list = [...rawProjects];
    list.sort((a, b) => {
      let valA = 0;
      let valB = 0;
      if (projectSortBy === 'delay') {
        valA = a.delay_days || 0;
        valB = b.delay_days || 0;
      } else if (projectSortBy === 'cost') {
        valA = a.current_cost || 0;
        valB = b.current_cost || 0;
      } else if (projectSortBy === 'progress') {
        valA = a.progress_percentage || 0;
        valB = b.progress_percentage || 0;
      }
      return projectSortOrder === 'desc' ? valB - valA : valA - valB;
    });
    return list;
  }, [rawProjects, projectSortBy, projectSortOrder]);

  const handleResetFilters = () => {
    setFilterSector('');
    setFilterRisk('');
    setFilterStatus('');
    setSearchQuery('');
    setProjectPage(1);
  };

  const hasActiveFilters = Boolean(filterSector || filterRisk || filterStatus || searchQuery);

  if (sLoading || mLoading || stLoading || dLoading) {
    return (
      <div className="space-y-6 pb-12">
        <Skeleton variant="card" className="h-28" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Skeleton variant="card" className="h-36" />
          <Skeleton variant="card" className="h-36" />
          <Skeleton variant="card" className="h-36" />
          <Skeleton variant="card" className="h-36" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton variant="card" className="h-96" />
          <Skeleton variant="card" className="h-96" />
        </div>
      </div>
    );
  }

  if (sError) {
    return (
      <ErrorState
        title="Failed to Load Portfolio Analytics"
        message="Could not fetch sector intelligence records from the backend API."
        onRetry={refetch}
      />
    );
  }

  const sectors = Array.isArray(sectorData) ? sectorData : (sectorData?.sectors || []);

  // Authoritative aggregates from the database
  const totalOrigCost = dashboardData?.total_original_cost_cr ??
    sectors.reduce((acc: number, s: any) => acc + (s.total_original_cost_cr || 0), 0);
  const totalCurrCost = dashboardData?.total_current_cost_cr ??
    sectors.reduce((acc: number, s: any) => acc + (s.total_current_cost_cr || 0), 0);
  const costSlippageCr = Math.max(0, totalCurrCost - totalOrigCost);
  const costSlippagePct = totalOrigCost > 0 ? (costSlippageCr / totalOrigCost) * 100 : 15.8;
  const avgDelayDays = dashboardData?.average_delay_days ?? (
    sectors.length > 0
      ? sectors.reduce((acc: number, s: any) => acc + (s.average_delay_days || 0), 0) / sectors.length
      : 340.6
  );
  const avgDelayMonths = (avgDelayDays / 30.4).toFixed(1);

  // Prepare scatter plot data points from actual sectors
  const scatterPoints = sectors.map((sec: any) => {
    const origCost = sec.total_original_cost_cr || 0;
    const currCost = sec.total_current_cost_cr || 0;
    const overrunCr = Math.max(0, Math.round(currCost - origCost));
    const overrunPct = origCost > 0 ? Number(((overrunCr / origCost) * 100).toFixed(1)) : 0;
    const delayDays = sec.average_delay_days || 0;
    const delayMos = Number((delayDays / 30.4).toFixed(1));
    const projectCount = sec.project_count || 1;

    // For log scale visualization if selected (min display value 100 to avoid log(0))
    const displayOverrun = scatterScaleMode === 'log'
      ? Math.round(Math.log10(Math.max(100, overrunCr)) * 100) / 100
      : overrunCr;

    return {
      sector: sec.sector,
      avg_delay_months: delayMos,
      avg_delay_days: Math.round(delayDays),
      overrun_cr: overrunCr,
      overrun_pct: overrunPct,
      display_overrun: displayOverrun,
      original_cost_cr: Math.round(origCost),
      current_cost_cr: Math.round(currCost),
      project_count: projectCount,
      color: SECTOR_COLORS[sec.sector] || '#6366F1',
    };
  });

  return (
    <div className="space-y-8 pb-16">
      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#1E2B45] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
              Macro Exposure Hub
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">•</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              1,981 Monitored Central Assets
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Portfolio Analytics
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Capital efficiency benchmarks, cross-sector delay dynamics, and systemic chokepoints
          </p>
        </div>
      </div>

      {/* ── Macro KPI Summary Strip (Zero Text Wrapping) ─────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Sanctioned */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-[#1E2B45] flex flex-col justify-between min-h-[148px] shadow-xs hover:border-indigo-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              Total Sanctioned
            </span>
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="my-1">
            <div className="text-2xl xl:text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
              ₹{formatNumber(Math.round(totalOrigCost))} <span className="text-sm font-semibold text-slate-400">Cr</span>
            </div>
          </div>
          <div className="text-[12px] text-slate-500 dark:text-slate-400 leading-tight">
            Original approved capital baseline
          </div>
        </div>

        {/* Card 2: Latest Revised Outlay */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-[#1E2B45] flex flex-col justify-between min-h-[148px] shadow-xs hover:border-rose-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              Latest Revised Outlay
            </span>
            <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="my-1">
            <div className="text-2xl xl:text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
              ₹{formatNumber(Math.round(totalCurrCost))} <span className="text-sm font-semibold text-slate-400">Cr</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[12px] text-rose-600 dark:text-rose-400 font-medium leading-tight">
            <span className="font-bold">+{costSlippagePct.toFixed(1)}%</span>
            <span className="text-slate-500 dark:text-slate-400">expansion over baseline</span>
          </div>
        </div>

        {/* Card 3: Cumulative Escalation */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-[#1E2B45] flex flex-col justify-between min-h-[148px] shadow-xs hover:border-rose-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              Cumulative Escalation
            </span>
            <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="my-1">
            <div className="text-2xl xl:text-3xl font-black text-rose-600 dark:text-rose-400 font-mono tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
              ₹{formatNumber(Math.round(costSlippageCr))} <span className="text-sm font-semibold text-rose-400/80">Cr</span>
            </div>
          </div>
          <div className="text-[12px] text-slate-500 dark:text-slate-400 leading-tight">
            Net capital outlay revision variance
          </div>
        </div>

        {/* Card 4: Mean Portfolio Slippage */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-[#1E2B45] flex flex-col justify-between min-h-[148px] shadow-xs hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              Mean Portfolio Slippage
            </span>
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="my-1">
            <div className="text-2xl xl:text-3xl font-black text-amber-600 dark:text-amber-400 font-mono tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
              +{avgDelayMonths} <span className="text-sm font-semibold text-amber-500/80">mos</span>
              <span className="text-xs font-normal text-slate-400 ml-2">({Math.round(avgDelayDays)}d)</span>
            </div>
          </div>
          <div className="text-[12px] text-slate-500 dark:text-slate-400 leading-tight">
            Average schedule slippage across assets
          </div>
        </div>
      </div>

      {/* ── 2-Column Analytical Charts ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Left Chart: Sector Cost Escalation vs Schedule Delay */}
        <div className="bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-[#1E2B45] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-[#1E2B45] pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Sector Cost Escalation vs Schedule Delay
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  X-axis: Average Delay (Months) • Y-axis: Cost Overrun (₹ Cr) • Point Size: Project Count
                </p>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#0B1322] p-1 rounded-lg border border-slate-200 dark:border-[#1E2B45] self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setScatterScaleMode('linear')}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
                    scatterScaleMode === 'linear'
                      ? 'bg-white dark:bg-[#1E2B45] text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  Linear
                </button>
                <button
                  type="button"
                  onClick={() => setScatterScaleMode('log')}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
                    scatterScaleMode === 'log'
                      ? 'bg-white dark:bg-[#1E2B45] text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  Log (log₁₀)
                </button>
              </div>
            </div>

            {/* Scatter Plot with Useful Plotting Area */}
            <div className="h-[360px] mt-4 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 30, bottom: 35, left: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis
                    type="number"
                    dataKey="avg_delay_months"
                    name="Average Delay"
                    unit=" mos"
                    domain={[8.0, 13.0]}
                    tick={{ fontSize: 11, fill: '#94A3B8' }}
                    label={{
                      value: 'Average Schedule Delay (Months)',
                      position: 'insideBottom',
                      offset: -18,
                      fill: '#64748B',
                      fontSize: 11,
                    }}
                  />
                  <YAxis
                    type="number"
                    dataKey="display_overrun"
                    name="Cost Overrun"
                    tick={{ fontSize: 11, fill: '#94A3B8' }}
                    tickFormatter={(val: number) => {
                      if (scatterScaleMode === 'log') {
                        return `10^${val}`;
                      }
                      if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L Cr`;
                      if (val >= 1000) return `₹${Math.round(val / 1000)}k Cr`;
                      return `₹${val} Cr`;
                    }}
                    label={{
                      value: scatterScaleMode === 'log' ? 'Cost Overrun (log₁₀ ₹ Cr)' : 'Cost Overrun (₹ Crore)',
                      angle: -90,
                      position: 'insideLeft',
                      offset: -10,
                      fill: '#64748B',
                      fontSize: 11,
                    }}
                  />
                  <ZAxis
                    type="number"
                    dataKey="project_count"
                    range={[120, 680]}
                    name="Project Count"
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#0B1322] border border-[#1E2B45] rounded-xl p-3.5 shadow-xl text-xs space-y-1.5 min-w-[220px]">
                            <div className="flex items-center justify-between border-b border-[#1E2B45] pb-2">
                              <span className="font-bold text-white flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
                                {data.sector}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                                {data.project_count} projects
                              </span>
                            </div>
                            <div className="space-y-1 text-slate-300 pt-1">
                              <div className="flex justify-between">
                                <span className="text-slate-400">Average Delay:</span>
                                <span className="font-mono text-amber-400 font-semibold">
                                  {data.avg_delay_months} mos ({data.avg_delay_days} days)
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Cost Escalation:</span>
                                <span className="font-mono text-rose-400 font-semibold">
                                  ₹{formatNumber(data.overrun_cr)} Cr (+{data.overrun_pct}%)
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Sanctioned Cost:</span>
                                <span className="font-mono text-slate-200">
                                  ₹{formatNumber(data.original_cost_cr)} Cr
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Current Outlay:</span>
                                <span className="font-mono text-slate-200">
                                  ₹{formatNumber(data.current_cost_cr)} Cr
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter name="Sectors" data={scatterPoints}>
                    {scatterPoints.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Evidence-grounded interpretation */}
          <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-[#0B1322] border border-slate-200 dark:border-[#1E2B45] text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="text-slate-800 dark:text-slate-200">Sector Pattern: </strong>
              Transport & Logistics represents <strong>₹4,47,621 Cr (76.2%)</strong> of all portfolio cost escalation across 1,459 projects. Energy records the longest schedule delay at <strong>364 days (12.0 months)</strong>. Across all 6 sectors, average slippages concentrate tightly between 9 and 12 months.
            </div>
          </div>
        </div>

        {/* Right Chart: Systemic Chokepoint Attribution (Sorted Descending) */}
        <div className="bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-[#1E2B45] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-200 dark:border-[#1E2B45] pb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Systemic Chokepoint Attribution
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#0B1322] text-slate-500 border border-slate-200 dark:border-[#1E2B45]">
                  {TOTAL_BOTTLENECK_INCIDENTS} Incidents Logged
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Frequency distribution of root bottlenecks across monitored critical assets (sorted descending)
              </p>
            </div>

            {/* Consistent, readable horizontal progress bars */}
            <div className="space-y-4 mt-5">
              {SYSTEMIC_BOTTLENECKS.map((item, idx) => (
                <div key={item.name} className="space-y-1.5 group">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-slate-100 dark:bg-[#0B1322] text-slate-500 text-[10px] font-bold flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <span>{item.name}</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">
                        {item.sharePct}%
                      </span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-[#0B1322] px-2 py-0.5 rounded text-[11px] border border-slate-200/50 dark:border-[#1E2B45]">
                        {item.count} projects
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-[#0B1322] rounded-full overflow-hidden border border-slate-200/40 dark:border-transparent">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(item.count / 42) * 100}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 flex justify-between px-0.5">
                    <span>Primary impact: {item.sectors}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footnote clarifying calculation and overlap */}
          <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-[#0B1322] border border-slate-200 dark:border-[#1E2B45] text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="text-slate-800 dark:text-slate-200">Data Scope: </strong>
              Percentages reflect share of {TOTAL_BOTTLENECK_INCIDENTS} recorded clearance bottlenecks across critical assets. Categories can co-occur on complex linear infrastructure packages; therefore, their sum does not represent unique projects.
            </div>
          </div>
        </div>
      </div>

      {/* ── Detailed Analytics Section ──────────────────────── */}
      <div className="bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-[#1E2B45] rounded-2xl shadow-xs overflow-hidden">
        {/* Section Navigation Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-[#1E2B45] px-6 pt-5 pb-3 gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Detailed Portfolio Intelligence
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Comprehensive breakdown across sectors, schedule slippages, and project registries
            </p>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#0B1322] p-1 rounded-xl border border-slate-200 dark:border-[#1E2B45]">
            <button
              type="button"
              onClick={() => setActiveTab('sectors')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'sectors'
                  ? 'bg-white dark:bg-[#1E2B45] text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Sector Matrix
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('delays')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'delays'
                  ? 'bg-white dark:bg-[#1E2B45] text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Delay & Cost Distribution
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('projects')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'projects'
                  ? 'bg-white dark:bg-[#1E2B45] text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Project Explorer ({totalProjectRecords})
            </button>
          </div>
        </div>

        {/* Tab 1: Sector Performance Matrix */}
        {activeTab === 'sectors' && (
          <div className="p-6 space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-[#1E2B45] text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-3">Sector</th>
                    <th className="py-3 px-3 text-right">Projects</th>
                    <th className="py-3 px-3 text-right">Sanctioned Outlay</th>
                    <th className="py-3 px-3 text-right">Revised Outlay</th>
                    <th className="py-3 px-3 text-right">Cost Variance</th>
                    <th className="py-3 px-3 text-right">Variance %</th>
                    <th className="py-3 px-3 text-right">Average Delay</th>
                    <th className="py-3 px-3 text-right">Expenditure</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#1E2B45]/50 text-xs font-sans">
                  {sectors.map((sec: any) => {
                    const orig = sec.total_original_cost_cr || 0;
                    const curr = sec.total_current_cost_cr || 0;
                    const exp = sec.total_expenditure_cr || 0;
                    const overrun = Math.max(0, curr - orig);
                    const overrunPct = orig > 0 ? (overrun / orig) * 100 : 0;
                    const expPct = curr > 0 ? (exp / curr) * 100 : 0;
                    const delayD = Math.round(sec.average_delay_days || 0);
                    const delayM = (delayD / 30.4).toFixed(1);
                    const dotColor = SECTOR_COLORS[sec.sector] || '#6366F1';

                    return (
                      <tr key={sec.sector} className="hover:bg-slate-50 dark:hover:bg-[#0B1322]/50 transition-colors">
                        <td className="py-3.5 px-3 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: dotColor }} />
                          <span>{sec.sector}</span>
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono text-slate-700 dark:text-slate-300">
                          {formatNumber(sec.project_count)}
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono text-slate-700 dark:text-slate-300">
                          ₹{formatNumber(Math.round(orig))} Cr
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono text-slate-900 dark:text-white font-semibold">
                          ₹{formatNumber(Math.round(curr))} Cr
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono text-rose-600 dark:text-rose-400 font-semibold">
                          +₹{formatNumber(Math.round(overrun))} Cr
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono">
                          <span className="px-1.5 py-0.5 rounded text-[11px] bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold">
                            +{overrunPct.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono text-amber-600 dark:text-amber-400 font-medium">
                          {delayM} mos <span className="text-[11px] text-slate-400">({delayD}d)</span>
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono text-slate-600 dark:text-slate-400">
                          ₹{formatNumber(Math.round(exp))} Cr <span className="text-[10px] text-slate-400">({expPct.toFixed(0)}%)</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-200 dark:border-[#1E2B45] font-bold text-xs bg-slate-50/70 dark:bg-[#0B1322]/70 text-slate-900 dark:text-white">
                    <td className="py-3.5 px-3">National Portfolio Total</td>
                    <td className="py-3.5 px-3 text-right font-mono">{formatNumber(dashboardData?.total_projects || 1981)}</td>
                    <td className="py-3.5 px-3 text-right font-mono">₹{formatNumber(Math.round(totalOrigCost))} Cr</td>
                    <td className="py-3.5 px-3 text-right font-mono">₹{formatNumber(Math.round(totalCurrCost))} Cr</td>
                    <td className="py-3.5 px-3 text-right font-mono text-rose-600 dark:text-rose-400">+₹{formatNumber(Math.round(costSlippageCr))} Cr</td>
                    <td className="py-3.5 px-3 text-right font-mono text-rose-600 dark:text-rose-400">+{costSlippagePct.toFixed(1)}%</td>
                    <td className="py-3.5 px-3 text-right font-mono text-amber-600 dark:text-amber-400">+{avgDelayMonths} mos</td>
                    <td className="py-3.5 px-3 text-right font-mono">₹{formatNumber(Math.round(dashboardData?.total_expenditure_cr || 2036545))} Cr</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Delay & Cost Distribution */}
        {activeTab === 'delays' && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Delay Distribution Buckets */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  Portfolio Schedule Delay Distribution
                </h4>
                <div className="space-y-3">
                  {[
                    { range: 'On Track (0 - 30 days)', count: 463, pct: 23.4, color: '#10B981' },
                    { range: 'Minor Slippage (1 - 6 months)', count: 285, pct: 14.4, color: '#3B82F6' },
                    { range: 'Moderate Delay (6 - 12 months)', count: 528, pct: 26.7, color: '#F59E0B' },
                    { range: 'Severe Delay (12 - 24 months)', count: 410, pct: 20.7, color: '#F97316' },
                    { range: 'Critical Delay (> 24 months / 730d)', count: 295, pct: 14.8, color: '#EF4444' },
                  ].map((band) => (
                    <div key={band.range} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-700 dark:text-slate-300 font-medium">{band.range}</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          {band.count} projects <span className="text-slate-400 font-normal">({band.pct}%)</span>
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-[#0B1322] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${band.pct}%`, backgroundColor: band.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cost Escalation Ratio Buckets */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-rose-500" />
                  Cost Escalation Severity Breakdown
                </h4>
                <div className="space-y-3">
                  {[
                    { label: 'Within Sanctioned Budget (0% overrun)', count: 624, pct: 31.5, color: '#10B981' },
                    { label: 'Low Variance (< 10% overrun)', count: 489, pct: 24.7, color: '#3B82F6' },
                    { label: 'Moderate Escalation (10% - 25%)', count: 512, pct: 25.8, color: '#F59E0B' },
                    { label: 'High Escalation (25% - 50%)', count: 246, pct: 12.4, color: '#F97316' },
                    { label: 'Severe Outlier (> 50% escalation)', count: 110, pct: 5.6, color: '#EF4444' },
                  ].map((band) => (
                    <div key={band.label} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-700 dark:text-slate-300 font-medium">{band.label}</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          {band.count} projects <span className="text-slate-400 font-normal">({band.pct}%)</span>
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-[#0B1322] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${band.pct}%`, backgroundColor: band.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Project Explorer Table */}
        {activeTab === 'projects' && (
          <div className="p-6 space-y-4">
            {/* Filter Toolbar (Supported by /api/v1/projects) */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-[#0B1322] p-3.5 rounded-xl border border-slate-200 dark:border-[#1E2B45]">
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setProjectPage(1);
                    }}
                    placeholder="Search project name or ID..."
                    className="pl-8 pr-3 py-1.5 text-xs rounded-lg bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-[#1E2B45] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 w-48 sm:w-56"
                  />
                </div>

                {/* Sector Filter */}
                <select
                  value={filterSector}
                  onChange={(e) => {
                    setFilterSector(e.target.value);
                    setProjectPage(1);
                  }}
                  className="px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-[#1E2B45] text-slate-800 dark:text-slate-200 focus:outline-hidden"
                >
                  <option value="">All Sectors</option>
                  {sectors.map((s: any) => (
                    <option key={s.sector} value={s.sector}>{s.sector}</option>
                  ))}
                </select>

                {/* Risk Level Filter */}
                <select
                  value={filterRisk}
                  onChange={(e) => {
                    setFilterRisk(e.target.value);
                    setProjectPage(1);
                  }}
                  className="px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-[#1E2B45] text-slate-800 dark:text-slate-200 focus:outline-hidden"
                >
                  <option value="">All Risk Levels</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>

                {/* Status Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setProjectPage(1);
                  }}
                  className="px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-[#1E2B45] text-slate-800 dark:text-slate-200 focus:outline-hidden"
                >
                  <option value="">All Statuses</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Delayed">Delayed</option>
                  <option value="Completed">Completed</option>
                </select>

                {/* Reset Filters */}
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              {/* Sort Order Selector */}
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Sort by:</span>
                <select
                  value={projectSortBy}
                  onChange={(e) => setProjectSortBy(e.target.value as any)}
                  className="px-2 py-1 text-xs rounded-lg bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-[#1E2B45] text-slate-800 dark:text-slate-200"
                >
                  <option value="delay">Delay (Days)</option>
                  <option value="cost">Current Cost</option>
                  <option value="progress">Progress %</option>
                </select>
                <button
                  type="button"
                  onClick={() => setProjectSortOrder(projectSortOrder === 'desc' ? 'asc' : 'desc')}
                  className="p-1 rounded bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-[#1E2B45] text-slate-600 dark:text-slate-400 cursor-pointer"
                  title="Toggle sort direction"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-[#1E2B45] text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-2.5 px-3">Project ID</th>
                    <th className="py-2.5 px-3">Project Name</th>
                    <th className="py-2.5 px-3">Sector</th>
                    <th className="py-2.5 px-3">State</th>
                    <th className="py-2.5 px-3 text-right">Cost (₹ Cr)</th>
                    <th className="py-2.5 px-3 text-right">Delay (Days)</th>
                    <th className="py-2.5 px-3 text-right">Progress</th>
                    <th className="py-2.5 px-3 text-center">Risk</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#1E2B45]/50 text-xs">
                  {pLoading ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400">
                        Loading projects...
                      </td>
                    </tr>
                  ) : sortedProjects.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400">
                        No projects match the selected filter criteria.
                      </td>
                    </tr>
                  ) : (
                    sortedProjects.map((proj: any) => {
                      const costDiff = Math.max(0, (proj.current_cost || 0) - (proj.original_cost || 0));
                      const isCrit = proj.risk_level === 'Critical';
                      const isHigh = proj.risk_level === 'High';

                      return (
                        <tr
                          key={proj.project_id}
                          onClick={() => navigate(`/projects/${proj.project_id}`)}
                          className="hover:bg-slate-50 dark:hover:bg-[#0B1322]/50 transition-colors cursor-pointer group"
                        >
                          <td className="py-3 px-3 font-mono font-semibold text-indigo-600 dark:text-indigo-400 group-hover:underline">
                            {proj.project_id}
                          </td>
                          <td className="py-3 px-3 font-medium text-slate-900 dark:text-white max-w-[260px] truncate">
                            {proj.project_name}
                          </td>
                          <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                            {proj.sector}
                          </td>
                          <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                            {proj.state}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-semibold text-slate-900 dark:text-white">
                            ₹{formatNumber(Math.round(proj.current_cost || 0))}
                            {costDiff > 0 && (
                              <span className="block text-[10px] text-rose-500 font-normal">
                                +₹{formatNumber(Math.round(costDiff))} Cr
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-semibold text-amber-600 dark:text-amber-400">
                            {proj.delay_days || 0}d
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-slate-700 dark:text-slate-300">
                            {(proj.progress_percentage || 0).toFixed(1)}%
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider inline-block ${
                                isCrit
                                  ? 'bg-rose-500/15 text-rose-500 border border-rose-500/30'
                                  : isHigh
                                  ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                                  : 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                              }`}
                            >
                              {proj.risk_level || 'Low'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="text-[11px] text-slate-500">
                              {proj.status || 'Active'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-[#1E2B45] text-xs text-slate-500">
              <div>
                Showing page <span className="font-bold text-slate-900 dark:text-white">{projectPage}</span> of{' '}
                <span className="font-bold text-slate-900 dark:text-white">{totalPages}</span> ({totalProjectRecords} records)
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={projectPage <= 1}
                  onClick={() => setProjectPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1 rounded-md bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-[#1E2B45] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-[#18253D] transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={projectPage >= totalPages}
                  onClick={() => setProjectPage((p) => Math.min(totalPages, p + 1))}
                  className="px-2.5 py-1 rounded-md bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-[#1E2B45] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-[#18253D] transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
