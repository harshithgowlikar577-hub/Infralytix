import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers, CheckCircle2, Clock, AlertTriangle, IndianRupee, Home,
  RefreshCw, MapPin, ChevronDown, ArrowRight, FileText,
  TrendingUp, TrendingDown, ShieldAlert, Sparkles, Filter, Zap
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, Tooltip
} from 'recharts';
import { useDashboardAnalytics, useSectorAnalytics } from '../hooks/useAPI';
import CabinetBriefModal from '../components/common/CabinetBriefModal';
import ExecutiveCommandCenter from '../components/ExecutiveCommandCenter';
import IndiaGisMap from '../components/gis/IndiaGisMap';

export default function Dashboard() {
  const navigate = useNavigate();

  // Queries for real backend data
  const { data: dashData, refetch: refetchDash, isFetching } = useDashboardAnalytics();
  const { data: sectorData } = useSectorAnalytics();

  // Executive Decision Brief Modal state
  const [cabinetBriefOpen, setCabinetBriefOpen] = useState(false);
  const [executiveFocusMode, setExecutiveFocusMode] = useState(false);

  // User-configurable dashboard preferences
  const [showRecentAlerts, setShowRecentAlerts] = useState<boolean>(
    () => localStorage.getItem('infralytix-pref-show-alerts') !== 'false'
  );
  const [showRiskSummary, setShowRiskSummary] = useState<boolean>(
    () => localStorage.getItem('infralytix-pref-show-risk-summary') !== 'false'
  );
  const [showHealthSummary, setShowHealthSummary] = useState<boolean>(
    () => localStorage.getItem('infralytix-pref-show-health-summary') !== 'false'
  );
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<string>(
    () => localStorage.getItem('infralytix-pref-auto-refresh') || '15 Minutes'
  );

  // Preference update listener
  useEffect(() => {
    const handlePrefChange = () => {
      setShowRecentAlerts(localStorage.getItem('infralytix-pref-show-alerts') !== 'false');
      setShowRiskSummary(localStorage.getItem('infralytix-pref-show-risk-summary') !== 'false');
      setShowHealthSummary(localStorage.getItem('infralytix-pref-show-health-summary') !== 'false');
      setAutoRefreshInterval(localStorage.getItem('infralytix-pref-auto-refresh') || '15 Minutes');
    };
    window.addEventListener('infralytix-pref-updated', handlePrefChange);
    return () => window.removeEventListener('infralytix-pref-updated', handlePrefChange);
  }, []);

  // Telemetry auto-refresh timer based on settings
  useEffect(() => {
    if (autoRefreshInterval === 'Off') return;
    let ms = 900000;
    if (autoRefreshInterval === '1 Minute') ms = 60000;
    else if (autoRefreshInterval === '5 Minutes') ms = 300000;
    else if (autoRefreshInterval === '15 Minutes') ms = 900000;
    else if (autoRefreshInterval === '30 Minutes') ms = 1800000;

    const timer = setInterval(() => {
      refetchDash();
    }, ms);

    return () => clearInterval(timer);
  }, [autoRefreshInterval, refetchDash]);

  // Dropdown states for charts
  const [trendRange, setTrendRange] = useState('Last 7 Years');
  const [trendDropdownOpen, setTrendDropdownOpen] = useState(false);

  // Performance Trend Line/Area Data (2019–2025) matching reference
  const performanceTrendData = [
    { year: '2019', onTrack: 340, atRisk: 190, delayed: 310 },
    { year: '2020', onTrack: 480, atRisk: 220, delayed: 380 },
    { year: '2021', onTrack: 720, atRisk: 310, delayed: 410 },
    { year: '2022', onTrack: 960, atRisk: 420, delayed: 390 },
    { year: '2023', onTrack: 1140, atRisk: 510, delayed: 430 },
    { year: '2024', onTrack: 1290, atRisk: 580, delayed: 420 },
    { year: '2025', onTrack: 1420, atRisk: 610, delayed: 410 },
  ];

  // Sector Distribution Data matching reference donut with exact counts
  const sectorDistributionData = [
    { name: 'Roads', value: 32, count: 634, color: '#2563EB' },
    { name: 'Railways', value: 24, count: 475, color: '#06B6D4' },
    { name: 'Power & Energy', value: 18, count: 356, color: '#F59E0B' },
    { name: 'Urban Development', value: 12, count: 238, color: '#10B981' },
    { name: 'Water & Irrigation', value: 8, count: 158, color: '#8B5CF6' },
    { name: 'Others', value: 6, count: 120, color: '#64748B' },
  ];

  // 4 Priority Attention Projects with generated sector images
  const priorityProjects = [
    {
      id: 'INF0001',
      name: 'Delhi–Mumbai Expressway',
      state: 'Maharashtra',
      sector: 'Roads',
      riskBadge: 'High Risk',
      badgeColor: 'bg-rose-500 text-white',
      progress: 65,
      delay: '14 months delayed',
      costAtRisk: '₹12,480 Cr at risk',
      imageUrl: '/assets/projects/expressway.jpg',
    },
    {
      id: 'PRJ0003',
      name: 'Bharatmala Package 4',
      state: 'Rajasthan',
      sector: 'Railways',
      riskBadge: 'Warning',
      badgeColor: 'bg-amber-500 text-white',
      progress: 42,
      delay: '8 months delayed',
      costAtRisk: '₹8,230 Cr at risk',
      imageUrl: '/assets/projects/railway.jpg',
    },
    {
      id: 'PRJ0002',
      name: 'Ultra Mega Power Plant',
      state: 'Tamil Nadu',
      sector: 'Power',
      riskBadge: 'High Risk',
      badgeColor: 'bg-rose-500 text-white',
      progress: 38,
      delay: '18 months delayed',
      costAtRisk: '₹21,500 Cr at risk',
      imageUrl: '/assets/projects/power.jpg',
    },
    {
      id: 'PRJ0004',
      name: 'Navi Mumbai International Airport',
      state: 'Maharashtra',
      sector: 'Airport',
      riskBadge: 'Critical',
      badgeColor: 'bg-purple-600 text-white',
      progress: 22,
      delay: '24 months delayed',
      costAtRisk: '₹38,900 Cr at risk',
      imageUrl: '/assets/projects/airport.jpg',
    },
  ];

  // 5 Recent Alerts matching reference
  const recentAlerts = [
    {
      id: 'alt-1',
      title: 'Schedule slippage increased',
      project: 'Delhi–Mumbai Expressway',
      time: '14 min ago',
      severity: 'Critical',
      color: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
      indicatorColor: 'bg-rose-500',
      projectId: 'INF0001',
    },
    {
      id: 'alt-2',
      title: 'Cost overrun risk detected',
      project: 'Bharatmala Package 3',
      time: '2 hours ago',
      severity: 'High',
      color: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
      indicatorColor: 'bg-amber-500',
      projectId: 'PRJ0003',
    },
    {
      id: 'alt-3',
      title: 'Environmental clearance pending',
      project: 'Western Dedicated Freight Corridor',
      time: '4 hours ago',
      severity: 'Medium',
      color: 'bg-purple-500/15 border-purple-500/30 text-purple-400',
      indicatorColor: 'bg-purple-500',
      projectId: 'PRJ0004',
    },
    {
      id: 'alt-4',
      title: 'Land acquisition delay',
      project: 'Amritsar–Jamnagar Expressway',
      time: '6 hours ago',
      severity: 'High',
      color: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
      indicatorColor: 'bg-amber-500',
      projectId: 'PRJ0005',
    },
    {
      id: 'alt-5',
      title: 'Contractor performance below threshold',
      project: 'Kolkata Metro Line 6',
      time: '1 day ago',
      severity: 'Critical',
      color: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
      indicatorColor: 'bg-rose-500',
      projectId: 'PRJ0006',
    },
  ];

  // Geographic project coordinate markers with rich telemetry for tooltips
  const mapDots = [
    { x: 180, y: 140, color: '#10B981', name: 'Punjab Multi-Modal Hub', state: 'Punjab', riskScore: 28, healthScore: 84 },
    { x: 210, y: 160, color: '#F59E0B', name: 'Delhi-NCR Peripheral Expressway', state: 'Delhi & Haryana', riskScore: 58, healthScore: 68 },
    { x: 240, y: 155, color: '#EF4444', name: 'Ganga Expressway Package 2', state: 'Uttar Pradesh', riskScore: 84, healthScore: 48 },
    { x: 160, y: 220, color: '#F59E0B', name: 'Dahej Petrochemical Corridor', state: 'Gujarat', riskScore: 62, healthScore: 65 },
    { x: 230, y: 210, color: '#10B981', name: 'Rewa Ultra Mega Solar Park', state: 'Madhya Pradesh', riskScore: 24, healthScore: 92 },
    { x: 290, y: 200, color: '#A855F7', name: 'Patna High-Speed Freight Terminal', state: 'Bihar', riskScore: 92, healthScore: 32 },
    { x: 330, y: 230, color: '#10B981', name: 'Brahmaputra Bridge Corridor', state: 'Assam', riskScore: 34, healthScore: 78 },
    { x: 180, y: 270, color: '#A855F7', name: 'Mumbai Metro Line 3 Underground', state: 'Maharashtra', riskScore: 88, healthScore: 44 },
    { x: 240, y: 280, color: '#EF4444', name: 'Hyderabad Regional Bypass Ring', state: 'Telangana', riskScore: 76, healthScore: 56 },
    { x: 290, y: 270, color: '#10B981', name: 'Paradip Port Container Berth', state: 'Odisha', riskScore: 22, healthScore: 88 },
    { x: 210, y: 350, color: '#10B981', name: 'Bengaluru Suburban Rail Corridor 2', state: 'Karnataka', riskScore: 38, healthScore: 82 },
    { x: 260, y: 340, color: '#EF4444', name: 'Chennai Port Container Terminal', state: 'Tamil Nadu', riskScore: 82, healthScore: 46 },
    { x: 200, y: 400, color: '#F59E0B', name: 'Kochi Integrated Water Metro', state: 'Kerala', riskScore: 54, healthScore: 72 },
  ];

  return (
    <div className="space-y-6 pb-8 select-none">
      {/* ── Breadcrumb & Command Center Header ───────────────────── */}
      <div className="space-y-2">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <Home className="w-3.5 h-3.5 text-blue-500" />
          <span>Dashboard</span>
        </div>

        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 shadow-xs">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                Command Center
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Real-time intelligence for India's infrastructure projects
              </p>
            </div>
          </div>

          {/* Right Status Indicator & Refresh & Cabinet Brief Trigger */}
          <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto text-xs font-medium">
            <button
              onClick={() => setCabinetBriefOpen(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold transition-all shadow-md shadow-blue-600/25 cursor-pointer active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
              <span>Cabinet Decision Brief</span>
            </button>

            <button
              onClick={() => setExecutiveFocusMode(!executiveFocusMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                executiveFocusMode
                  ? 'bg-purple-600/20 text-purple-300 border-purple-500/40 shadow-xs'
                  : 'bg-[#0C172C] text-slate-300 border-[#162744] hover:bg-[#122240]'
              }`}
              title="Toggle 10-Second Executive Focus Mode"
            >
              <Filter className="w-3.5 h-3.5 text-purple-400" />
              <span>{executiveFocusMode ? '10s Focus Active' : 'All Layers'}</span>
            </button>

            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0C172C] border border-[#162744] text-slate-300 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="font-semibold text-emerald-400">Live Telemetry</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400 font-mono">14 Sep 2026 IST</span>
            </div>

            <button
              onClick={() => refetchDash()}
              disabled={isFetching}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0C172C] border border-[#162744] text-slate-300 hover:bg-[#122240] transition-colors shadow-2xs cursor-pointer font-semibold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-blue-400' : 'text-slate-400'}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── NATIONAL EXECUTIVE COMMAND CENTER (MoSPI & Cabinet Secretariat) ── */}
      <ExecutiveCommandCenter />

      {/* ── LAYER 1: Executive Decision KPIs (10-Second Minister Overview) ─ */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Layer 1
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Executive Decision KPIs
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">10-Second National Overview</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Card 1: Total Projects */}
          <div
            onClick={() => navigate('/projects')}
            className="ref-card p-5 sm:p-6 min-h-[168px] flex flex-col justify-between cursor-pointer hover:-translate-y-0.5 transition-all shadow-sm"
            title="Inspect National Project Portfolio"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-300">
                Total Projects
              </span>
            </div>
            <div className="my-2 flex items-baseline">
              <span className="text-3xl font-extrabold text-white tracking-tight">
                1,981
              </span>
            </div>
            <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 font-mono">
              <span>▲ 12%</span>
              <span className="text-slate-400 font-normal">Sanctioned: ₹34.8L Cr</span>
            </div>
          </div>

          {/* Card 2: Healthy Projects */}
          <div
            onClick={() => navigate('/health')}
            className="ref-card p-5 sm:p-6 min-h-[168px] flex flex-col justify-between cursor-pointer hover:-translate-y-0.5 transition-all shadow-sm border-emerald-500/20"
            title="Inspect Healthy Projects"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-sm shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-300">
                Healthy Projects
              </span>
            </div>
            <div className="my-2 flex items-baseline">
              <span className="text-3xl font-extrabold text-emerald-400 tracking-tight">
                1,148
              </span>
            </div>
            <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 font-mono">
              <span>58.0%</span>
              <span className="text-slate-400 font-normal">On track execution</span>
            </div>
          </div>

          {/* Card 3: Delayed Projects */}
          <div
            onClick={() => navigate('/projects?status=delayed')}
            className="ref-card p-5 sm:p-6 min-h-[168px] flex flex-col justify-between cursor-pointer hover:-translate-y-0.5 transition-all shadow-sm border-amber-500/20"
            title="Inspect Delayed Projects"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-300">
                Delayed Projects
              </span>
            </div>
            <div className="my-2 flex items-baseline">
              <span className="text-3xl font-extrabold text-amber-400 tracking-tight">
                449
              </span>
            </div>
            <div className="text-xs font-semibold text-amber-400 flex items-center gap-1.5 font-mono">
              <span>22.6%</span>
              <span className="text-slate-400 font-normal">Avg delay: 8.2 mos</span>
            </div>
          </div>

          {/* Card 4: High Risk Projects */}
          <div
            onClick={() => navigate('/radar')}
            className="ref-card p-5 sm:p-6 min-h-[168px] flex flex-col justify-between cursor-pointer hover:-translate-y-0.5 transition-all shadow-sm border-rose-500/25"
            title="Inspect High Risk Corridors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-sm shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-300">
                High Risk Projects
              </span>
            </div>
            <div className="my-2 flex items-baseline">
              <span className="text-3xl font-extrabold text-rose-400 tracking-tight">
                384
              </span>
            </div>
            <div className="text-xs font-semibold text-rose-400 flex items-center gap-1.5 font-mono">
              <span>19.4%</span>
              <span className="text-slate-400 font-normal">Of active portfolio</span>
            </div>
          </div>

          {/* Card 5: At-Risk Capital */}
          <div
            onClick={() => navigate('/radar')}
            className="ref-card p-5 sm:p-6 min-h-[168px] flex flex-col justify-between cursor-pointer hover:-translate-y-0.5 transition-all shadow-sm border-amber-500/25"
            title="Review Capital Exposure & Slippage"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm shrink-0">
                <IndianRupee className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-300">
                At-Risk Capital
              </span>
            </div>
            <div className="my-2 flex items-baseline">
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 tracking-tight">
                ₹12,480 Cr
              </span>
            </div>
            <div className="text-xs font-semibold text-amber-400 flex items-center gap-1.5 font-mono">
              <span>Severe Lag</span>
              <span className="text-slate-400 font-normal">&gt;12 mos slippage</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── LAYER 2: Strategic Intelligence (Trends, Sectors, Risk Heatmap) ─ */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            Layer 2
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Strategic Intelligence &amp; Spatial Heatmap
          </span>
        </div>
        <span className="text-[11px] font-mono text-slate-500">Multi-Year Trends &amp; Macro Exposure</span>
      </div>

      {/* ── SECTION 2: Analytics Row (3 Columns) ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Col 1: Project Performance Trend */}
        <div className="ref-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-white">
              Project Performance Trend
            </h2>

            {/* Timeframe Dropdown */}
            <div className="relative">
              <button
                onClick={() => setTrendDropdownOpen(!trendDropdownOpen)}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border border-[#1A2E4E] bg-[#0D182E] text-slate-300 hover:bg-[#142544] transition-colors cursor-pointer"
              >
                <span>{trendRange}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {trendDropdownOpen && (
                <div className="absolute right-0 mt-1 w-32 rounded-xl bg-[#0D182E] border border-[#1A2E4E] shadow-xl p-1 z-30">
                  {['Last 3 Years', 'Last 5 Years', 'Last 7 Years', 'All Time'].map((r) => (
                    <button
                      key={r}
                      onClick={() => { setTrendRange(r); setTrendDropdownOpen(false); }}
                      className="w-full text-left px-2.5 py-1.5 text-xs text-slate-300 hover:bg-[#142544] rounded-lg transition-colors cursor-pointer"
                    >
                      {r}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Chart Legend */}
          <div className="flex items-center gap-4 text-xs mb-3.5 pt-0.5">
            <span className="flex items-center gap-2 font-semibold text-slate-200">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/30" />
              On Track
            </span>
            <span className="flex items-center gap-2 font-semibold text-slate-200">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs shadow-amber-500/30" />
              At Risk
            </span>
            <span className="flex items-center gap-2 font-semibold text-slate-200">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-xs shadow-rose-500/30" />
              Delayed
            </span>
          </div>

          {/* Spline Lines with Detailed Tooltip */}
          <div className="h-56 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceTrendData} margin={{ top: 12, right: 12, left: -10, bottom: 4 }}>
                <XAxis dataKey="year" stroke="#94A3B8" tick={{ fontSize: 12, fill: '#CBD5E1' }} axisLine={{ stroke: '#1E3354' }} tickLine={false} dy={4} />
                <YAxis stroke="#94A3B8" tick={{ fontSize: 12, fill: '#CBD5E1' }} axisLine={false} tickLine={false} domain={[0, 1500]} ticks={[0, 500, 1000, 1500]} dx={-2} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const total = payload.reduce((acc, p) => acc + (Number(p.value) || 0), 0);
                      return (
                        <div className="bg-[#070E1C] border border-[#1A2E4E] rounded-xl p-3 shadow-2xl text-xs space-y-1.5">
                          <div className="font-bold text-white border-b border-slate-800 pb-1 flex items-center justify-between">
                            <span>Year {label}</span>
                            <span className="text-[11px] text-blue-400 font-mono">{total} Total</span>
                          </div>
                          {payload.map((entry) => (
                            <div key={entry.name} className="flex items-center justify-between gap-4">
                              <span className="flex items-center gap-1.5 text-slate-300">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                <span>{entry.name === 'onTrack' ? 'On Track' : entry.name === 'atRisk' ? 'At Risk' : 'Delayed'}</span>
                              </span>
                              <span className="font-mono font-bold text-white">{entry.value}</span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line type="monotone" dataKey="onTrack" name="onTrack" stroke="#10B981" strokeWidth={2.5} dot={{ r: 3, fill: '#10B981' }} />
                <Line type="monotone" dataKey="atRisk" name="atRisk" stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 3, fill: '#F59E0B' }} />
                <Line type="monotone" dataKey="delayed" name="delayed" stroke="#EF4444" strokeWidth={2.5} dot={{ r: 3, fill: '#EF4444' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Col 2: Sector Distribution with Rich Tooltip */}
        <div className="ref-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-white">
              Sector Distribution
            </h2>
          </div>

          <div className="flex items-center justify-between gap-2 py-1">
            {/* Donut Chart with Center Text & Rich Tooltip */}
            <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#070E1C] border border-[#1A2E4E] rounded-xl p-2.5 shadow-2xl text-xs space-y-1">
                            <div className="flex items-center gap-1.5 font-bold text-white">
                              <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: data.color }} />
                              <span>{data.name}</span>
                            </div>
                            <div className="text-[11px] text-slate-300 font-mono">
                              <strong className="text-blue-400">{data.value}%</strong> of national portfolio
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              {data.count} Projects
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Pie
                    data={sectorDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={54}
                    outerRadius={74}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {sectorDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-black text-white leading-tight">
                  1,981
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  Projects
                </span>
              </div>
            </div>

            {/* Right Legend matching reference percentages */}
            <div className="flex-1 space-y-1 text-xs pl-2">
              {sectorDistributionData.map((s) => (
                <div
                  key={s.name}
                  onClick={() => navigate(`/projects?sector=${encodeURIComponent(s.name)}`)}
                  className="flex items-center justify-between gap-1.5 p-1 rounded-lg hover:bg-[#122240] cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: s.color }} />
                    <span className="text-slate-300 font-medium truncate">{s.name}</span>
                  </div>
                  <span className="font-semibold text-white font-mono text-[11px] shrink-0">
                    {s.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Col 3: India GIS Project Map (Accurate Geographic) */}
        <div className="ref-card overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              India Project Map
            </h2>
            <button
              onClick={() => navigate('/map')}
              className="text-xs font-semibold text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Full Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex-1 px-2 pb-2">
            <IndiaGisMap
              height={260}
              compact={true}
            />
          </div>
        </div>
      </div>

      {/* ── LAYER 3: Operational Details & Action Corridors ───────── */}
      {!executiveFocusMode ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20">
                Layer 3
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Operational Details &amp; Priority Action Corridors
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-500">Asset-Level Alerts &amp; Directives</span>
          </div>

          {/* SECTION 3 & 4: Projects Needing Immediate Attention + Recent Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left: Projects Needing Immediate Attention (2 Cols) */}
            <div className="lg:col-span-2 ref-card p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm sm:text-base font-bold text-white">
                  Projects Needing Immediate Attention
                </h2>
            <button
              onClick={() => navigate('/projects')}
              className="text-xs font-semibold text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 4 Cards Grid matching reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {priorityProjects.map((p) => (
              <div
                key={p.id}
                className="rounded-xl overflow-hidden bg-[#091326] border border-[#142542] flex flex-col justify-between hover:border-blue-500/40 transition-all shadow-xs group"
              >
                {/* Image + Risk Badge */}
                <div className="relative h-28 w-full overflow-hidden bg-slate-800">
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm ${p.badgeColor}`}>
                      {p.riskBadge}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-3 flex-1 flex flex-col justify-between space-y-2.5">
                  <div>
                    <h3 className="text-xs font-bold text-white line-clamp-1 leading-tight group-hover:text-blue-400 transition-colors">
                      {p.name}
                    </h3>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{p.state}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300 mb-1">
                      <span className="text-[10px] text-slate-400 font-normal">Progress</span>
                      <span className="font-mono">{p.progress}%</span>
                    </div>
                    <div className="w-full bg-[#152542] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full"
                        style={{ width: `${p.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Telemetry Stats */}
                  <div className="space-y-1 text-[10px] font-medium pt-1 border-t border-slate-800/60">
                    <div className="flex items-center gap-1.5 text-amber-400">
                      <Clock className="w-3 h-3 shrink-0" />
                      <span className="truncate">{p.delay}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-rose-400">
                      <IndianRupee className="w-3 h-3 shrink-0" />
                      <span className="truncate font-mono">{p.costAtRisk}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => navigate(`/projects/${p.id}`)}
                    className="w-full py-1.5 px-2 rounded-lg bg-blue-600/15 hover:bg-blue-600 text-blue-400 hover:text-white text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer mt-1"
                  >
                    <span>View Project</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Recent Alerts (1 Col) — controlled by Dashboard Preferences */}
        {showRecentAlerts && (
        <div className="ref-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm sm:text-base font-bold text-white">
              Recent Alerts
            </h2>
            <button
              onClick={() => navigate('/early-warnings')}
              className="text-xs font-semibold text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 flex-1">
            {recentAlerts.map((alert) => (
              <div
                key={alert.id}
                onClick={() => navigate(`/projects/${alert.projectId}`)}
                className="relative flex items-start justify-between gap-3 p-3 rounded-xl bg-[#091326] border border-[#142542] hover:border-blue-500/40 cursor-pointer transition-all shadow-xs group pl-3.5"
              >
                {/* Severity Color Strip Indicator */}
                <div
                  className={`absolute left-0 top-2 bottom-2 w-1 rounded-r ${alert.indicatorColor}`}
                  title={`Severity: ${alert.severity}`}
                />

                <div className="flex items-start gap-3 min-w-0">
                  <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${alert.color}`}>
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider font-mono ${
                        alert.severity === 'Critical'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : alert.severity === 'High'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      }`}>
                        {alert.severity}
                      </span>
                      <h3 className="text-xs font-bold text-slate-100 group-hover:text-blue-400 transition-colors leading-snug truncate">
                        {alert.title}
                      </h3>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">
                      {alert.project}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap shrink-0 pt-0.5">
                  {alert.time}
                </span>
              </div>
            ))}
          </div>
        </div>
        )}
      </div>

      {/* ── SECTION 5 & 6: Key Insights + My Actions Today ────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Key Insights — controlled by showRiskSummary */}
        {showRiskSummary && (
        <div className="ref-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-blue-500" />
              <h2 className="text-sm sm:text-base font-bold text-white">
                Key Insights
              </h2>
            </div>
            <button
              onClick={() => navigate('/analytics')}
              className="text-xs font-semibold text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View Detailed Insights</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Stat 1 */}
            <div
              onClick={() => navigate('/early-warnings')}
              className="p-3.5 rounded-xl bg-[#091326] border border-[#142542] hover:border-emerald-500/40 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-1.5 text-emerald-400 font-extrabold text-lg">
                <TrendingUp className="w-5 h-5 shrink-0" />
                <span>14%</span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-snug">
                Increase in delayed projects vs last quarter
              </p>
            </div>

            {/* Stat 2 */}
            <div
              onClick={() => navigate('/analytics')}
              className="p-3.5 rounded-xl bg-[#091326] border border-[#142542] hover:border-rose-500/40 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-1.5 text-rose-500 font-extrabold text-lg">
                <TrendingUp className="w-5 h-5 shrink-0" />
                <span>22%</span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-snug">
                Rise in cost overrun risk in power sector
              </p>
            </div>

            {/* Stat 3 */}
            <div
              onClick={() => navigate('/health')}
              className="p-3.5 rounded-xl bg-[#091326] border border-[#142542] hover:border-cyan-500/40 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-1.5 text-cyan-400 font-extrabold text-lg">
                <TrendingDown className="w-5 h-5 shrink-0" />
                <span>6%</span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-snug">
                Improvement in project health score
              </p>
            </div>
          </div>
        </div>
        )}

        {/* Right: My Actions Today */}
        <div className="ref-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-500" />
              <h2 className="text-sm sm:text-base font-bold text-white">
                My Actions Today
              </h2>
            </div>
            <button
              onClick={() => navigate('/interventions')}
              className="text-xs font-semibold text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Action 1: Green */}
            <div
              onClick={() => navigate('/projects')}
              className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 hover:bg-emerald-500/15 cursor-pointer transition-all text-center flex flex-col items-center justify-center"
            >
              <span className="text-2xl font-black text-emerald-400 font-mono leading-none">
                5
              </span>
              <span className="text-[11px] text-slate-300 font-medium mt-1.5 leading-tight">
                Projects require review
              </span>
            </div>

            {/* Action 2: Orange */}
            <div
              onClick={() => navigate('/interventions')}
              className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 hover:bg-amber-500/15 cursor-pointer transition-all text-center flex flex-col items-center justify-center"
            >
              <span className="text-2xl font-black text-amber-400 font-mono leading-none">
                3
              </span>
              <span className="text-[11px] text-slate-300 font-medium mt-1.5 leading-tight">
                Pending approvals
              </span>
            </div>

            {/* Action 3: Red */}
            <div
              onClick={() => navigate('/early-warnings')}
              className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 hover:bg-rose-500/15 cursor-pointer transition-all text-center flex flex-col items-center justify-center"
            >
              <span className="text-2xl font-black text-rose-400 font-mono leading-none">
                7
              </span>
              <span className="text-[11px] text-slate-300 font-medium mt-1.5 leading-tight">
                New alerts to check
              </span>
            </div>

            {/* Action 4: Blue */}
            <div
              onClick={() => navigate('/settings')}
              className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/25 hover:bg-blue-500/15 cursor-pointer transition-all text-center flex flex-col items-center justify-center"
            >
              <span className="text-2xl font-black text-blue-400 font-mono leading-none">
                2
              </span>
              <span className="text-[11px] text-slate-300 font-medium mt-1.5 leading-tight">
                Meetings scheduled
              </span>
            </div>
          </div>
        </div>
      </div>
        </div>
      ) : (
        <div className="p-5 rounded-2xl bg-[#081325] border border-purple-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2.5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span>Operational Layer 3 hidden in 10-Second Executive Focus Mode.</span>
          </div>
          <button
            onClick={() => setExecutiveFocusMode(false)}
            className="px-3.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 font-bold font-mono transition-colors cursor-pointer"
          >
            Expand Layer 3 Operational Details
          </button>
        </div>
      )}

      {/* ── Cabinet Decision Brief Modal ────────────────────────── */}
      <CabinetBriefModal
        isOpen={cabinetBriefOpen}
        onClose={() => setCabinetBriefOpen(false)}
        kpis={dashData?.kpis}
      />
    </div>
  );
}
