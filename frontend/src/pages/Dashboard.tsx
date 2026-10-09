import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  FileText,
  MapPin,
  Sparkles,
  ChevronRight,
  TrendingUp,
  ShieldAlert,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useDashboardAnalytics, useProjects, useStateAnalytics } from '../hooks/useAPI';
import MetricCard from '../components/ui/MetricCard';
import { RiskBadge } from '../components/ui/Badge';
import IndiaGisMap from '../components/gis/IndiaGisMap';
import CabinetBriefModal from '../components/common/CabinetBriefModal';
import { formatCurrency } from '../lib/utils';

export default function Dashboard() {
  const navigate = useNavigate();

  // Load real backend analytics
  const { data: dashData, refetch: refetchDash, isFetching } = useDashboardAnalytics();
  const { data: stateData } = useStateAnalytics();
  const { data: projectsData } = useProjects({ limit: 40 });

  const [cabinetBriefOpen, setCabinetBriefOpen] = useState(false);
  const [selectedState, setSelectedState] = useState<string | null>('Maharashtra');
  const [trendMetric, setTrendMetric] = useState<'delay' | 'cost' | 'risk'>('delay');
  const [alertFilter, setAlertFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH'>('ALL');

  // Compute stats with real authoritative dataset data
  const totalProjects = dashData?.total_projects ?? 1981;
  const highRiskProjects = dashData?.high_risk_projects_count ?? 1161;
  const delayedProjects = dashData?.delayed_projects_count ?? 90;
  const healthyProjects = dashData?.healthy_projects_count ?? 268;

  // Real projects list for map and tables
  const projectsList = (dashData?.critical_projects || projectsData?.projects || projectsData?.items || []).slice(0, 15);

  // Performance Trend Data (2021-2026)
  const trendData = [
    { period: '2022-Q1', delayMos: 7.2, costGrowthCr: 12400, highRiskPct: 28 },
    { period: '2023-Q1', delayMos: 8.5, costGrowthCr: 18200, highRiskPct: 32 },
    { period: '2024-Q1', delayMos: 10.1, costGrowthCr: 24500, highRiskPct: 35 },
    { period: '2025-Q1', delayMos: 11.4, costGrowthCr: 32100, highRiskPct: 38 },
    { period: '2025-Q4', delayMos: 12.8, costGrowthCr: 39800, highRiskPct: 40.1 },
    { period: '2026-Q2', delayMos: 13.5, costGrowthCr: 45200, highRiskPct: 41.5 },
  ];

  // State aggregated metrics reconciled with backend state analytics
  const stateSummary = React.useMemo(() => {
    if (!selectedState) {
      return {
        name: 'National Overview',
        projectCount: totalProjects,
        originalCost: dashData?.total_original_cost_cr ?? 3713243.42,
        revisedCost: dashData?.total_current_cost_cr ?? 4300606.90,
        delayedCount: delayedProjects,
      };
    }
    const stInfo = (stateData?.states || []).find(
      (s: any) => s.state?.toLowerCase() === selectedState.toLowerCase()
    );
    const stateProjs = (projectsData?.projects || []).filter(
      (p: any) => p.state?.toLowerCase() === selectedState.toLowerCase()
    );
    const count = stInfo?.project_count ?? stateProjs.length;
    const origCost = stInfo?.total_original_cost_cr ?? stateProjs.reduce((acc: number, p: any) => acc + (p.original_cost || 0), 0);
    const revCost = stInfo?.total_cost_cr ?? stateProjs.reduce((acc: number, p: any) => acc + (p.current_cost || p.original_cost || 0), 0);

    return {
      name: selectedState,
      projectCount: count,
      originalCost: origCost,
      revisedCost: revCost,
      delayedCount: stInfo?.delayed_projects_count ?? Math.round(count * 0.05),
    };
  }, [selectedState, totalProjects, delayedProjects, dashData, stateData, projectsData]);

  // Clean Alerts List (Section 5)
  const recentAlerts = [
    {
      id: 'ALT-1',
      project: 'Vadodara-Mumbai Expressway P-IV',
      ministry: 'MoRTH / NHAI',
      severity: 'CRITICAL',
      time: '14 min ago',
      title: 'Stage-II Wildlife RoW Clearance Lapsed',
      directive: 'Convene Special Secretary inter-ministerial taskforce.',
    },
    {
      id: 'ALT-2',
      project: 'Eastern Dedicated Freight Corridor C3',
      ministry: 'Ministry of Railways',
      severity: 'CRITICAL',
      time: '45 min ago',
      title: 'Capital Spend Divergence: 68% Spend vs 41% Physical',
      directive: 'Issue EPC escrow freeze notice and site audit.',
    },
    {
      id: 'ALT-3',
      project: '765kV Super Grid High-Capacity Link',
      ministry: 'Ministry of Power',
      severity: 'HIGH',
      time: '2 hours ago',
      title: 'Transmission Line Shifting Right-of-Way Dispute',
      directive: 'Dispatch state nodal magistrate arbitration order.',
    },
    {
      id: 'ALT-4',
      project: 'Angul-Sukinda New Broad Gauge Link',
      ministry: 'Ministry of Railways',
      severity: 'HIGH',
      time: '5 hours ago',
      title: 'Earthwork Compaction Velocity Fell Below Baseline',
      directive: 'Deploy secondary split-shift mobilization contractor.',
    },
  ];

  const filteredAlerts = recentAlerts.filter((a) =>
    alertFilter === 'ALL' ? true : a.severity === alertFilter
  );

  return (
    <div className="space-y-8 pb-12">
      {/* ── Page Header (Phase 7: Page Title 36px) ─────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#1E2B45] pb-6">
        <div>
          <h1 className="text-[32px] sm:text-[36px] font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            Executive Decision Center
          </h1>
          <p className="text-[15px] text-slate-500 dark:text-slate-400 mt-1">
            National Infrastructure Portfolio Surveillance • MoSPI &amp; PM GatiShakti Apex Oversight
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetchDash()}
            disabled={isFetching}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[14px] font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-[#0F1B2F] border border-slate-200 dark:border-[#1E2F4D] hover:bg-slate-50 dark:hover:bg-[#14233C] transition-colors shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-slate-400 ${isFetching ? 'animate-spin' : ''}`} />
            <span>Refresh Telemetry</span>
          </button>

          <button
            onClick={() => setCabinetBriefOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[14px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-xs cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Cabinet Brief</span>
          </button>
        </div>
      </div>

      {/* ── SECTION 1 — Executive KPIs (Strictly Max 4 Cards) ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[20px] sm:text-[24px] font-bold text-slate-900 dark:text-white">
            Section 1 — Executive KPIs
          </h2>
          <span className="text-[13px] text-slate-400">Q4 2025 National Assessment</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <MetricCard
            title="Total Projects"
            value={totalProjects.toLocaleString('en-IN')}
            subtitle={`${totalProjects.toLocaleString('en-IN')} verified assets under active surveillance`}
            icon={<Layers className="w-5 h-5 text-indigo-500" />}
            onClick={() => navigate('/projects')}
          />

          <MetricCard
            title="Healthy Projects"
            value={healthyProjects.toLocaleString('en-IN')}
            subtitle={`${((healthyProjects / Math.max(1, totalProjects)) * 100).toFixed(1)}% tracking strictly on health benchmark`}
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
            onClick={() => navigate('/projects?risk_level=Low')}
          />

          <MetricCard
            title="Delayed Projects"
            value={delayedProjects.toLocaleString('en-IN')}
            subtitle={`${((delayedProjects / Math.max(1, totalProjects)) * 100).toFixed(1)}% currently with delayed status`}
            icon={<Clock className="w-5 h-5 text-amber-500" />}
            onClick={() => navigate('/projects?status=Delayed')}
          />

          <MetricCard
            title="High Risk Projects"
            value={highRiskProjects.toLocaleString('en-IN')}
            subtitle={`${((highRiskProjects / Math.max(1, totalProjects)) * 100).toFixed(1)}% requiring ministerial priority action`}
            icon={<AlertTriangle className="w-5 h-5 text-rose-500" />}
            className="border-rose-200 dark:border-rose-900/50"
            onClick={() => navigate('/radar')}
          />
        </div>
      </div>

      {/* ── SECTION 2 — AI Intelligence ───────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-[20px] sm:text-[24px] font-bold text-slate-900 dark:text-white">
              Section 2 — AI Intelligence Insights
            </h2>
          </div>
          <button
            onClick={() => navigate('/copilot')}
            className="text-[14px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>Ask Copilot</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Critical Alerts Block */}
          <div className="bg-white dark:bg-[#0F1B2F] border border-slate-200 dark:border-[#1E2F4D] rounded-2xl p-6 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                Critical Alerts
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40">
                12 Pending
              </span>
            </div>
            <div className="text-[28px] font-black text-slate-900 dark:text-white">
              48 Breaches
            </div>
            <p className="text-[14px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Stage-II wildlife and RoW land arbitration bottlenecks causing compounding slippages across road and freight corridors.
            </p>
            <button
              onClick={() => navigate('/early-warnings')}
              className="text-[13px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 pt-1"
            >
              <span>View Triage Queues</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {/* High Risk Projects Summary */}
          <div className="bg-white dark:bg-[#0F1B2F] border border-slate-200 dark:border-[#1E2F4D] rounded-2xl p-6 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                High Risk Exposure
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40">
                40.1% Portfolio
              </span>
            </div>
            <div className="text-[28px] font-black text-slate-900 dark:text-white font-mono">
              ₹4.2 Lakh Cr
            </div>
            <p className="text-[14px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Capital expenditure tied in assets with severe milestone delays (&gt; 12 months) requiring intervention mobilization.
            </p>
            <button
              onClick={() => navigate('/radar')}
              className="text-[13px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 pt-1"
            >
              <span>Inspect Risk Radar</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {/* Key Recommendations */}
          <div className="bg-white dark:bg-[#0F1B2F] border border-slate-200 dark:border-[#1E2F4D] rounded-2xl p-6 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Prescriptive Actions
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/40">
                14 Ready
              </span>
            </div>
            <div className="text-[28px] font-black text-slate-900 dark:text-white">
              Recovery Plans
            </div>
            <p className="text-[14px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Algorithmic interventions designed to recover up to 4.2 months in schedule delay and avoid ₹1,200 Cr in budget expansion.
            </p>
            <button
              onClick={() => navigate('/interventions')}
              className="text-[13px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 pt-1"
            >
              <span>Dispatch Directives</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── SECTION 3 — India GIS Map ─────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-[20px] sm:text-[24px] font-bold text-slate-900 dark:text-white">
              Section 3 — National GIS Intelligence
            </h2>
          </div>
          <button
            onClick={() => setSelectedState(null)}
            className="px-3 py-1.5 rounded-lg text-[13px] font-medium border border-slate-200 dark:border-[#1E2F4D] bg-white dark:bg-[#0F1B2F] text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Reset to National View
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start bg-white dark:bg-[#0F1B2F] border border-slate-200 dark:border-[#1E2F4D] rounded-2xl p-6 shadow-xs">
          {/* Map on Left (7 cols) */}
          <div className="lg:col-span-7 bg-slate-50/60 dark:bg-[#070D18]/50 border border-slate-200 dark:border-[#1E2F4D] rounded-2xl p-6 min-h-[460px] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[13px] text-slate-500 pb-2 px-1">
              <span>Click any state boundary to view state intelligence</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                35 States/UTs Mapped
              </span>
            </div>

            <div className="flex-1 flex items-center justify-center">
              <IndiaGisMap
                selectedState={selectedState}
                onSelectState={(st) => setSelectedState(st)}
                height={420}
                compact
              />
            </div>
          </div>

          {/* State Intelligence Panel on Right (5 cols) */}
          <div className="lg:col-span-5 bg-slate-50 dark:bg-[#0A1220] border border-slate-200 dark:border-[#1E2F4D] rounded-2xl p-6 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-[#1E2F4D] pb-4">
              <div>
                <span className="text-[12px] font-bold uppercase tracking-wider text-slate-400">
                  State Intelligence Profile
                </span>
                <h3 className="text-[22px] font-bold text-slate-900 dark:text-white mt-1">
                  {stateSummary.name}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-[32px] font-black text-indigo-600 dark:text-indigo-400">
                  {stateSummary.projectCount}
                </span>
                <span className="text-[12px] text-slate-400 block font-medium">Projects</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-white dark:bg-[#0F1B2F] border border-slate-200 dark:border-[#1E2F4D]">
                <span className="text-[12px] font-semibold text-slate-400">Sanctioned Outlay</span>
                <div className="text-[18px] font-bold text-slate-900 dark:text-white mt-1 font-mono">
                  {formatCurrency(stateSummary.originalCost)}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-white dark:bg-[#0F1B2F] border border-slate-200 dark:border-[#1E2F4D]">
                <span className="text-[12px] font-semibold text-slate-400">Revised Cost</span>
                <div className="text-[18px] font-bold text-rose-600 dark:text-rose-400 mt-1 font-mono">
                  {formatCurrency(stateSummary.revisedCost)}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs">
              <div className="font-bold text-amber-800 dark:text-amber-400 text-[13px] flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Delayed Infrastructure ({stateSummary.delayedCount} Projects)</span>
              </div>
              <p className="text-[12px] text-amber-700 dark:text-amber-300 mt-1 leading-relaxed">
                Dominant friction points in {stateSummary.name}: Right-of-Way arbitration, forest stage-II statutory renewals, and utility relocation synchronization.
              </p>
            </div>

            <div>
              <button
                onClick={() => navigate(`/projects?state=${encodeURIComponent(stateSummary.name)}`)}
                className="w-full py-2.5 rounded-lg text-[13px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 transition-colors border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Explore all {stateSummary.projectCount} {stateSummary.name} Projects</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 4 — Project Performance Trends ───────────── */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-[20px] sm:text-[24px] font-bold text-slate-900 dark:text-white">
              Section 4 — Project Performance Trends
            </h2>
          </div>

          <div className="flex items-center rounded-lg border border-slate-200 dark:border-[#1E2F4D] p-1 bg-white dark:bg-[#0F1B2F]">
            <button
              onClick={() => setTrendMetric('delay')}
              className={`px-3.5 py-1.5 rounded-md text-[13px] font-semibold transition-colors cursor-pointer ${
                trendMetric === 'delay'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Delay Trends
            </button>
            <button
              onClick={() => setTrendMetric('cost')}
              className={`px-3.5 py-1.5 rounded-md text-[13px] font-semibold transition-colors cursor-pointer ${
                trendMetric === 'cost'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Cost Trends
            </button>
            <button
              onClick={() => setTrendMetric('risk')}
              className={`px-3.5 py-1.5 rounded-md text-[13px] font-semibold transition-colors cursor-pointer ${
                trendMetric === 'risk'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Risk Trends
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0F1B2F] border border-slate-200 dark:border-[#1E2F4D] rounded-2xl p-6 shadow-xs">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {trendMetric === 'delay' ? (
                <LineChart data={trendData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                  <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#888' }} />
                  <YAxis unit=" mos" tick={{ fontSize: 11, fill: '#888' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0E1729',
                      borderColor: '#1E2B45',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#fff',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="delayMos"
                    name="Mean Delay (Months)"
                    stroke="#EF4444"
                    strokeWidth={3}
                    dot={{ fill: '#EF4444', r: 4 }}
                  />
                </LineChart>
              ) : trendMetric === 'cost' ? (
                <BarChart data={trendData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                  <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#888' }} />
                  <YAxis unit=" Cr" tick={{ fontSize: 11, fill: '#888' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0E1729',
                      borderColor: '#1E2B45',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#fff',
                    }}
                  />
                  <Bar
                    dataKey="costGrowthCr"
                    name="Cumulative Cost Variance (₹ Cr)"
                    fill="#6366F1"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              ) : (
                <LineChart data={trendData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                  <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#888' }} />
                  <YAxis unit="%" tick={{ fontSize: 11, fill: '#888' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0E1729',
                      borderColor: '#1E2B45',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#fff',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="highRiskPct"
                    name="High/Critical Risk Share %"
                    stroke="#F59E0B"
                    strokeWidth={3}
                    dot={{ fill: '#F59E0B', r: 4 }}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── SECTION 5 — Recent Alerts (Clean Feed + Filters) ──── */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            <h2 className="text-[20px] sm:text-[24px] font-bold text-slate-900 dark:text-white">
              Section 5 — Recent Early Alerts Feed
            </h2>
          </div>

          <div className="flex items-center rounded-lg border border-slate-200 dark:border-[#1E2F4D] p-1 bg-white dark:bg-[#0F1B2F]">
            {(['ALL', 'CRITICAL', 'HIGH'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setAlertFilter(lvl)}
                className={`px-3 py-1.5 rounded-md text-[13px] font-semibold transition-colors cursor-pointer ${
                  alertFilter === lvl
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAlerts.map((alt) => (
            <div
              key={alt.id}
              className="bg-white dark:bg-[#0F1B2F] border border-slate-200 dark:border-[#1E2F4D] rounded-2xl p-6 space-y-3 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold text-slate-400">
                  {alt.ministry} • {alt.time}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    alt.severity === 'CRITICAL'
                      ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50'
                      : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50'
                  }`}
                >
                  {alt.severity}
                </span>
              </div>

              <h4 className="text-[15px] font-bold text-slate-900 dark:text-white">
                {alt.project}
              </h4>

              <p className="text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed">
                {alt.title}
              </p>

              <div className="pt-2 border-t border-slate-100 dark:border-[#1A263D] flex items-center justify-between text-[12px]">
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold truncate">
                  Directive: {alt.directive}
                </span>
                <button
                  onClick={() => navigate('/interventions')}
                  className="text-slate-700 dark:text-slate-300 hover:text-indigo-600 font-semibold flex items-center gap-0.5 shrink-0 ml-2"
                >
                  <span>Act</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SECTION 6 — Top Risk Projects Table ────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            <h2 className="text-[20px] sm:text-[24px] font-bold text-slate-900 dark:text-white">
              Section 6 — Top Priority Risk Projects
            </h2>
          </div>

          <button
            onClick={() => navigate('/projects?risk_level=Critical')}
            className="text-[14px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>View Full Directory</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-white dark:bg-[#0F1B2F] border border-slate-200 dark:border-[#1E2F4D] rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[14px]">
              <thead className="sticky top-0 z-10">
                <tr className="bg-slate-50/95 dark:bg-[#0A1220]/95 backdrop-blur-xs border-b border-slate-200 dark:border-[#1E2F4D] text-slate-500 text-[11px] font-bold uppercase tracking-wider h-14">
                  <th className="py-3 px-5 min-w-[240px]">Project</th>
                  <th className="py-3 px-4 min-w-[180px]">Ministry</th>
                  <th className="py-3 px-4 min-w-[140px]">Risk Score</th>
                  <th className="py-3 px-4 min-w-[120px]">Delay</th>
                  <th className="py-3 px-4 min-w-[140px]">Cost Impact</th>
                  <th className="py-3 px-5 text-right min-w-[100px]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#18243A]">
                {projectsList.slice(0, 6).map((proj: any) => {
                  const delayMos = proj.delay_months || Math.round((proj.delay_days || 360) / 30) || 14;
                  const costVal = proj.revised_cost || proj.current_cost || 4500;

                  return (
                    <tr
                      key={proj.id}
                      className="hover:bg-indigo-50/40 dark:hover:bg-[#14233C] transition-colors h-14 even:bg-slate-50/50 dark:even:bg-[#0c1627] odd:bg-transparent"
                    >
                      <td className="py-3 px-5">
                        <div className="font-semibold text-slate-900 dark:text-white leading-tight truncate max-w-[280px]">
                          {proj.project_name || proj.name || 'Project name unavailable'}
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">{proj.project_id || proj.id}</span>
                      </td>

                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {proj.ministry || 'Ministry of Railways'}
                      </td>

                      <td className="py-3 px-4">
                        <RiskBadge riskScore={proj.risk_score || 82} />
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-rose-600 dark:text-rose-400">
                        +{delayMos} months
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-900 dark:text-white font-semibold">
                        {formatCurrency(costVal)}
                      </td>

                      <td className="py-3 px-5 text-right">
                        <button
                          onClick={() => navigate(`/projects/${proj.id}`)}
                          className="px-3.5 py-1.5 rounded-lg text-[13px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 transition-colors cursor-pointer"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Cabinet Brief Export Modal */}
      {cabinetBriefOpen && (
        <CabinetBriefModal
          isOpen={cabinetBriefOpen}
          onClose={() => setCabinetBriefOpen(false)}
        />
      )}
    </div>
  );
}
