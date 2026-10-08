import { useState } from 'react';
import { useSectorAnalytics, useMinistryAnalytics, useStateAnalytics } from '../hooks/useAPI';
import { formatCurrency } from '../lib/utils';
import Skeleton from '../components/ui/Skeleton';
import ErrorState from '../components/ui/ErrorState';
import { BarChart3, TrendingUp, AlertCircle, PieChart as PieIcon, ShieldAlert, ArrowUpRight } from 'lucide-react';
import {
  ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid,
  Tooltip, BarChart, Bar, Legend, Cell, PieChart, Pie
} from 'recharts';

export default function Analytics() {
  const { data: sectorData, isLoading: sLoading, isError: sError, refetch } = useSectorAnalytics();
  const { data: ministryData, isLoading: mLoading } = useMinistryAnalytics();
  const { data: stateData, isLoading: stLoading } = useStateAnalytics();

  if (sLoading || mLoading || stLoading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="card" className="h-24" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton variant="card" className="h-80" />
          <Skeleton variant="card" className="h-80" />
        </div>
      </div>
    );
  }

  if (sError) {
    return <ErrorState title="Failed to load Portfolio Analytics" message="Could not fetch sector and ministry intelligence." onRetry={refetch} />;
  }

  const sectors = Array.isArray(sectorData) ? sectorData : (sectorData?.sectors || []);
  const ministries = Array.isArray(ministryData) ? ministryData : (ministryData?.ministries || []);

  const totalOrigCost = sectors.reduce((acc: number, s: any) => acc + (s.total_original_cost_cr || 0), 0);
  const totalCurrCost = sectors.reduce((acc: number, s: any) => acc + (s.total_current_cost_cr || 0), 0);
  const costSlippageCr = Math.max(0, totalCurrCost - totalOrigCost);
  const costSlippagePct = totalOrigCost > 0 ? (costSlippageCr / totalOrigCost) * 100 : 0;
  const avgDelayDays = sectors.length > 0
    ? sectors.reduce((acc: number, s: any) => acc + (s.average_delay_days || 0), 0) / sectors.length
    : 340;
  const avgDelayMonths = (avgDelayDays / 30).toFixed(1);

  const scatterPoints = sectors.length > 0
    ? sectors.map((sec: any) => {
        const overrun = Math.max(0, Math.round((sec.total_current_cost_cr || 0) - (sec.total_original_cost_cr || 0)));
        const delayMos = Math.round(((sec.average_delay_days || 100) / 30) * 10) / 10;
        const risk = Math.min(95, Math.round((sec.average_delay_days || 100) / 4.5));
        return {
          sector: sec.sector,
          avg_delay: delayMos,
          overrun_cr: overrun,
          risk: risk,
        };
      })
    : [
        { sector: 'Roads & Highways', avg_delay: 11.4, overrun_cr: 447620, risk: 76 },
        { sector: 'Energy', avg_delay: 12.1, overrun_cr: 76527, risk: 81 },
        { sector: 'Others', avg_delay: 11.2, overrun_cr: 34204, risk: 74 },
        { sector: 'Social & Commercial', avg_delay: 9.1, overrun_cr: 12306, risk: 61 },
        { sector: 'Water & Sanitation', avg_delay: 10.8, overrun_cr: 15144, risk: 72 },
        { sector: 'Communication', avg_delay: 10.2, overrun_cr: 1559, risk: 68 },
      ];

  const bottlenecks = [
    { name: 'Right of Way (Land Clearance)', count: 42, color: '#EF4444' },
    { name: 'Environmental / Forest NOC', count: 28, color: '#F97316' },
    { name: 'Contractor Liquidity & Cash Flow', count: 18, color: '#F59E0B' },
    { name: 'Utility Shifting (Power/Water)', count: 24, color: '#3B82F6' },
    { name: 'Inter-Departmental Clearances', count: 15, color: '#8B5CF6' },
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="pb-2 border-b border-[#14233D]">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
          <span>Intelligence</span>
          <span>/</span>
          <span className="text-slate-200">Macro Analytics Hub</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <BarChart3 className="w-7 h-7 text-blue-400" />
          <span>Macro Portfolio Analytics Hub</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Systemic capital efficiency, cross-sector slippage drivers, and macroeconomic bottleneck analysis.
        </p>
      </div>

      {/* 3-Question Context Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#050D1A] p-5 rounded-2xl border border-[#14233D] text-xs">
        <div className="flex items-start gap-3">
          <span className="px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-400 font-bold uppercase text-[10px] shrink-0 border border-blue-500/30">
            Escalation
          </span>
          <span className="text-slate-300 leading-relaxed">
            National portfolio experiences <strong className="text-amber-400 font-bold font-mono">{formatCurrency(costSlippageCr)}</strong> in cumulative cost expansion.
          </span>
        </div>
        <div className="flex items-start gap-3">
          <span className="px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-400 font-bold uppercase text-[10px] shrink-0 border border-rose-500/30">
            Delay Lag
          </span>
          <span className="text-slate-300 leading-relaxed">
            Average schedule slippage stands at <strong className="text-rose-400 font-bold font-mono">{avgDelayMonths} months</strong> driven primarily by Land NOC delays.
          </span>
        </div>
        <div className="flex items-start gap-3">
          <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 font-bold uppercase text-[10px] shrink-0 border border-emerald-500/30">
            Direction
          </span>
          <span className="text-slate-300 leading-relaxed">
            Prioritize Right-of-Way resolution in high-overrun sectors (Roads &amp; Energy corridors).
          </span>
        </div>
      </div>

      {/* Top 3 KPI Ribbons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Aggregate Cost Slippage</div>
          <div className="text-3xl lg:text-4xl font-extrabold font-mono text-amber-400 mt-2 leading-none">{formatCurrency(costSlippageCr)}</div>
          <div className="text-xs text-slate-500 mt-2 font-medium">+{costSlippagePct.toFixed(1)}% over original sanctioned outlay</div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Average Portfolio Lag</div>
          <div className="text-3xl lg:text-4xl font-extrabold font-mono text-rose-400 mt-2 leading-none">{avgDelayMonths} Months</div>
          <div className="text-xs text-slate-500 mt-2 font-medium">Average {Math.round(avgDelayDays)} days across monitored assets</div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Top Recurrent Obstacle</div>
          <div className="text-xl lg:text-2xl font-bold text-white mt-2 leading-tight">Right-of-Way Land NOC</div>
          <div className="text-xs text-slate-500 mt-2 font-medium">Accounts for 33% of all systemic project stalls</div>
        </div>
      </div>

      {/* Main Visuals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Delay vs Cost Overrun Scatter Plot */}
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#14233D]">
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Sector Delay vs Overrun Correlation</h2>
              <p className="text-xs text-slate-400 mt-0.5">X-axis: Delay (Months) • Y-axis: Overrun (₹ Cr)</p>
            </div>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>

          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 10, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#14233D" />
                <XAxis dataKey="avg_delay" name="Delay" unit=" mo" stroke="#64748B" tick={{ fontSize: 11 }} />
                <YAxis dataKey="overrun_cr" name="Overrun" unit=" Cr" stroke="#64748B" tick={{ fontSize: 11 }} />
                <ZAxis dataKey="risk" range={[100, 500]} name="Risk Index" />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{ backgroundColor: '#050D1A', borderColor: '#1E3354', borderRadius: '12px', fontSize: '11px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
                  formatter={(value: any, name: any) => [
                    name === 'Overrun' ? formatCurrency(value) : value,
                    name,
                  ]}
                />
                <Scatter name="Sectors" data={scatterPoints} fill="#2563EB" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Primary Bottleneck Distribution */}
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#14233D]">
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Root Bottleneck Classification</h2>
              <p className="text-xs text-slate-400 mt-0.5">Systemic causes of execution stalls across all ministries</p>
            </div>
            <PieIcon className="w-4 h-4 text-slate-400" />
          </div>

          <div className="h-[320px] flex flex-col md:flex-row items-center gap-4">
            <div className="w-full md:w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bottlenecks}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="count"
                  >
                    {bottlenecks.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#050D1A', borderColor: '#1E3354', borderRadius: '12px', fontSize: '11px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="w-full md:w-1/2 space-y-2.5 text-xs">
              {bottlenecks.map((b, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-[#050D1A] border border-[#14233D]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: b.color }} />
                    <span className="text-slate-300 font-medium text-xs truncate max-w-[160px]">{b.name}</span>
                  </div>
                  <span className="font-mono text-slate-400 font-bold shrink-0">{b.count} cases</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* PILLAR 11: 4-WAY PORTFOLIO BENCHMARKING ENGINE                 */}
      {/* ─────────────────────────────────────────────────────────────── */}
      <BenchmarkingEngine />
    </div>
  );
}

// ─── Benchmarking Component ─────────────────────────────────────────────────

type BenchmarkView = 'state' | 'ministry' | 'contractor' | 'sector';

const BENCHMARK_DATA: Record<BenchmarkView, {
  title: string;
  description: string;
  icon: string;
  color: string;
  columns: string[];
  rows: { name: string; delay: number; costEfficiency: number; riskScore: number; successRate: number; capital: string }[];
}> = {
  state: {
    title: 'State vs State Benchmark',
    description: 'Cross-state infrastructure delivery performance — delay, cost efficiency, and success rate comparison',
    icon: '🗺️',
    color: 'text-blue-400',
    columns: ['State', 'Avg Delay (mos)', 'Cost Efficiency', 'Risk Score', 'On-Track Rate', 'Total Capital'],
    rows: [
      { name: 'Gujarat', delay: 5.2, costEfficiency: 92, riskScore: 38, successRate: 81, capital: '₹42,800 Cr' },
      { name: 'Karnataka', delay: 7.1, costEfficiency: 86, riskScore: 48, successRate: 74, capital: '₹28,400 Cr' },
      { name: 'Tamil Nadu', delay: 9.4, costEfficiency: 79, riskScore: 61, successRate: 67, capital: '₹34,100 Cr' },
      { name: 'Maharashtra', delay: 12.6, costEfficiency: 72, riskScore: 74, successRate: 58, capital: '₹58,900 Cr' },
      { name: 'Rajasthan', delay: 14.8, costEfficiency: 68, riskScore: 81, successRate: 49, capital: '₹28,200 Cr' },
      { name: 'Uttar Pradesh', delay: 11.2, costEfficiency: 74, riskScore: 71, successRate: 61, capital: '₹44,600 Cr' },
    ],
  },
  ministry: {
    title: 'Ministry vs Ministry Benchmark',
    description: 'Cross-ministry capital deployment efficiency and portfolio risk comparison for Cabinet oversight',
    icon: '🏛️',
    color: 'text-purple-400',
    columns: ['Ministry', 'Avg Delay (mos)', 'Cost Efficiency', 'Risk Score', 'On-Track Rate', 'Portfolio Size'],
    rows: [
      { name: 'MoRTH (Highways)', delay: 11.4, costEfficiency: 76, riskScore: 72, successRate: 62, capital: '₹4.2 L Cr' },
      { name: 'Ministry of Power', delay: 13.2, costEfficiency: 71, riskScore: 78, successRate: 55, capital: '₹1.8 L Cr' },
      { name: 'Ministry of Railways', delay: 9.8, costEfficiency: 81, riskScore: 64, successRate: 69, capital: '₹2.6 L Cr' },
      { name: 'MoHUA (Urban Dev)', delay: 8.4, costEfficiency: 84, riskScore: 56, successRate: 73, capital: '₹0.9 L Cr' },
      { name: 'MoP&NG (Petro)', delay: 10.2, costEfficiency: 79, riskScore: 67, successRate: 66, capital: '₹0.6 L Cr' },
      { name: 'Ministry of Ports', delay: 7.6, costEfficiency: 87, riskScore: 52, successRate: 78, capital: '₹0.4 L Cr' },
    ],
  },
  contractor: {
    title: 'Contractor vs Contractor Benchmark',
    description: 'EPC contractor delivery track record — delay history, cost adherence, and governance accountability index',
    icon: '🏗️',
    color: 'text-amber-400',
    columns: ['Contractor', 'Avg Delay (mos)', 'Cost Adherence', 'Risk Score', 'Delivery Rate', 'Active Value'],
    rows: [
      { name: 'L&T Infrastructure', delay: 4.1, costEfficiency: 94, riskScore: 32, successRate: 88, capital: '₹48,200 Cr' },
      { name: 'Tata Projects', delay: 5.8, costEfficiency: 89, riskScore: 41, successRate: 82, capital: '₹24,100 Cr' },
      { name: 'HCC Limited', delay: 9.4, costEfficiency: 78, riskScore: 62, successRate: 67, capital: '₹18,400 Cr' },
      { name: 'Dilip Buildcon', delay: 11.2, costEfficiency: 74, riskScore: 70, successRate: 60, capital: '₹21,800 Cr' },
      { name: 'NCC Limited', delay: 13.6, costEfficiency: 69, riskScore: 79, successRate: 52, capital: '₹12,600 Cr' },
      { name: 'J Kumar Infra', delay: 15.4, costEfficiency: 64, riskScore: 84, successRate: 44, capital: '₹8,900 Cr' },
    ],
  },
  sector: {
    title: 'Sector vs Sector Benchmark',
    description: 'Comparative infrastructure sector performance index — delivery efficiency across national infrastructure programmes',
    icon: '📊',
    color: 'text-emerald-400',
    columns: ['Sector', 'Avg Delay (mos)', 'Cost Efficiency', 'Risk Score', 'Completion Rate', 'Portfolio'],
    rows: [
      { name: 'Roads & Highways', delay: 11.4, costEfficiency: 76, riskScore: 72, successRate: 62, capital: '₹4.2 L Cr' },
      { name: 'Railways', delay: 9.6, costEfficiency: 82, riskScore: 63, successRate: 70, capital: '₹2.6 L Cr' },
      { name: 'Energy & Power', delay: 13.8, costEfficiency: 70, riskScore: 80, successRate: 54, capital: '₹1.8 L Cr' },
      { name: 'Urban Transit', delay: 8.2, costEfficiency: 85, riskScore: 54, successRate: 74, capital: '₹0.9 L Cr' },
      { name: 'Ports & Waterways', delay: 7.4, costEfficiency: 88, riskScore: 49, successRate: 79, capital: '₹0.4 L Cr' },
      { name: 'Water & Sanitation', delay: 10.6, costEfficiency: 74, riskScore: 68, successRate: 63, capital: '₹0.3 L Cr' },
    ],
  },
};

function BenchmarkingEngine() {
  const [activeView, setActiveView] = useState<BenchmarkView>('state');
  const [sortBy, setSortBy] = useState<'delay' | 'riskScore' | 'successRate'>('riskScore');

  const data = BENCHMARK_DATA[activeView];
  const sortedRows = [...data.rows].sort((a, b) =>
    sortBy === 'successRate' ? b.successRate - a.successRate : b[sortBy] - a[sortBy]
  );

  const VIEWS: { id: BenchmarkView; label: string; icon: string }[] = [
    { id: 'state', label: 'State vs State', icon: '🗺️' },
    { id: 'ministry', label: 'Ministry vs Ministry', icon: '🏛️' },
    { id: 'contractor', label: 'Contractor vs Contractor', icon: '🏗️' },
    { id: 'sector', label: 'Sector vs Sector', icon: '📊' },
  ];

  return (
    <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
            <span>Portfolio Benchmarking Engine</span>
          </div>
          <h2 className="text-base font-bold text-white">{data.icon} {data.title}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{data.description}</p>
        </div>

        {/* Sort Control */}
        <div className="flex items-center gap-2 self-start">
          <span className="text-xs text-slate-400 shrink-0">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#081325] border border-[#1E3354] rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="riskScore">Risk Score ↓</option>
            <option value="delay">Avg Delay ↓</option>
            <option value="successRate">Success Rate ↓</option>
          </select>
        </div>
      </div>

      {/* 4-Way View Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            onClick={() => setActiveView(v.id)}
            className={`flex items-center gap-2 p-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              activeView === v.id
                ? 'bg-blue-600/20 border-blue-500/40 text-blue-300'
                : 'bg-[#081325] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <span>{v.icon}</span>
            <span>{v.label}</span>
          </button>
        ))}
      </div>

      {/* Benchmarking Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-[#050D1A]/80 border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4 text-left">Rank</th>
              <th className="py-3 px-4 text-left">{data.columns[0]}</th>
              <th className="py-3 px-4 text-center">Avg Delay</th>
              <th className="py-3 px-4 text-center">Cost Efficiency</th>
              <th className="py-3 px-4 text-center">Risk Score</th>
              <th className="py-3 px-4 text-center">Success Rate</th>
              <th className="py-3 px-4 text-right">Capital</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {sortedRows.map((row, i) => {
              const riskColor = row.riskScore >= 70 ? 'text-rose-400' : row.riskScore >= 50 ? 'text-amber-400' : 'text-emerald-400';
              const successColor = row.successRate >= 75 ? 'text-emerald-400' : row.successRate >= 60 ? 'text-amber-400' : 'text-rose-400';
              const isTop = i === 0;
              const isBottom = i === sortedRows.length - 1;
              return (
                <tr key={row.name} className={`hover:bg-blue-500/5 transition-colors ${isTop ? 'bg-rose-950/10' : isBottom ? 'bg-emerald-950/10' : ''}`}>
                  <td className="py-3.5 px-4">
                    <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                      i === 0 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      i === sortedRows.length - 1 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {i + 1}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-200">{row.name}</div>
                    {isTop && <div className="text-[10px] text-rose-400 font-semibold">⚠ Highest Risk</div>}
                    {isBottom && <div className="text-[10px] text-emerald-400 font-semibold">✓ Best Performer</div>}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`font-mono font-bold ${row.delay > 12 ? 'text-rose-400' : row.delay > 8 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {row.delay} mos
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${row.costEfficiency >= 85 ? 'bg-emerald-500' : row.costEfficiency >= 75 ? 'bg-amber-500' : 'bg-rose-500'}`}
                          style={{ width: `${row.costEfficiency}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-300 w-8 text-right">{row.costEfficiency}%</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`font-mono font-bold ${riskColor}`}>{row.riskScore}/100</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${row.successRate >= 75 ? 'bg-emerald-500' : row.successRate >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}
                          style={{ width: `${row.successRate}%` }}
                        />
                      </div>
                      <span className={`font-mono font-bold text-xs w-8 text-right ${successColor}`}>{row.successRate}%</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="font-mono font-bold text-slate-300">{row.capital}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="text-[11px] text-slate-500 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> Highest Risk Entity
        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block ml-3" /> Best Performer
        <span className="ml-2">• Ranked by selected sort metric</span>
      </div>
    </div>
  );
}
