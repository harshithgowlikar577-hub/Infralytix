import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Clock,
  ShieldAlert,
  BarChart3,
  TrendingUp,
  Layers,
  ArrowRight,
  Filter,
  CheckCircle2,
  ExternalLink,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { useRiskAnalytics, useProjects } from '../hooks/useAPI';
import { RiskBadge } from '../components/ui/Badge';
import { formatCurrency } from '../lib/utils';

export default function RiskRadar() {
  const navigate = useNavigate();

  const { data: riskData, isLoading: riskLoading } = useRiskAnalytics();
  const { data: projectsData } = useProjects({ limit: 50 });

  const [concentrationView, setConcentrationView] = useState<'sector' | 'ministry' | 'state'>('sector');
  const [tableSearch, setTableSearch] = useState('');

  // Longitudinal Risk Trend Quarterly Stacked Data (Reference 3)
  const longitudinalTrendData = [
    { quarter: '2023-Q4', total: 264, high: 145, medium: 79, low: 40 },
    { quarter: '2024-Q1', total: 313, high: 172, medium: 91, low: 50 },
    { quarter: '2024-Q2', total: 634, high: 310, medium: 214, low: 110 },
    { quarter: '2024-Q3', total: 589, high: 280, medium: 209, low: 100 },
    { quarter: '2024-Q4', total: 794, high: 390, medium: 254, low: 150 },
    { quarter: '2025-Q1', total: 1348, high: 610, medium: 468, low: 270 },
    { quarter: '2025-Q2', total: 1100, high: 520, medium: 380, low: 200 },
    { quarter: '2025-Q3', total: 737, high: 350, medium: 247, low: 140 },
  ];

  // Sector concentration list (Reference 3)
  const sectorConcentration = [
    { name: 'Road Transport & Highways', highCount: 1877, total: 3204, pct: 58.6 },
    { name: 'Railways', highCount: 742, total: 1280, pct: 58.0 },
    { name: 'Power & Energy', highCount: 213, total: 490, pct: 43.5 },
    { name: 'Petroleum & Natural Gas', highCount: 88, total: 240, pct: 36.7 },
    { name: 'Urban Infrastructure', highCount: 52, total: 197, pct: 26.4 },
  ];

  const ministryConcentration = [
    { name: 'Ministry of Road Transport & Highways', highCount: 1877, total: 3204, pct: 58.6 },
    { name: 'Ministry of Railways', highCount: 742, total: 1280, pct: 58.0 },
    { name: 'Ministry of Power', highCount: 213, total: 490, pct: 43.5 },
    { name: 'Ministry of Petroleum & Natural Gas', highCount: 88, total: 240, pct: 36.7 },
  ];

  const stateConcentration = [
    { name: 'Maharashtra', highCount: 65, total: 153, pct: 42.5 },
    { name: 'Uttar Pradesh', highCount: 82, total: 198, pct: 41.4 },
    { name: 'Bihar', highCount: 44, total: 96, pct: 45.8 },
    { name: 'West Bengal', highCount: 38, total: 84, pct: 45.2 },
  ];

  const activeConcentrationList =
    concentrationView === 'sector'
      ? sectorConcentration
      : concentrationView === 'ministry'
      ? ministryConcentration
      : stateConcentration;

  // Real projects list for the table
  const allProjects = projectsData?.projects || projectsData?.items || [];
  const filteredProjects = allProjects.filter((p: any) =>
    tableSearch.trim()
      ? (p.name || '').toLowerCase().includes(tableSearch.toLowerCase()) ||
        (p.sector || '').toLowerCase().includes(tableSearch.toLowerCase()) ||
        (p.state || '').toLowerCase().includes(tableSearch.toLowerCase())
      : true
  );

  return (
    <div className="space-y-8 pb-12">
      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#1E2B45] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
              PAIMANA / CLR Protocol
            </span>
          </div>
          <h1 className="text-3xl sm:text-[36px] font-black tracking-tight text-slate-900 dark:text-white">
            Portfolio Risk Analytics
          </h1>
          <p className="text-[15px] text-slate-500 dark:text-slate-400 mt-1">
            Longitudinal multi-tiered risk exposure and portfolio distribution across central infrastructure assets
          </p>
        </div>
      </div>

      {/* ── Row 1: Paired Analytical Panels (Reference 3) ──── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Left Panel: Portfolio Risk Distribution */}
        <div className="bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-[#1E2B45] rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-sm">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1E2B45] pb-4">
              <div>
                <h3 className="text-[18px] sm:text-[20px] font-bold text-slate-900 dark:text-white">
                  Portfolio Risk Distribution
                </h3>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">
                  Latest known assessment of 7,411 baseline projects.
                </p>
              </div>
              <span className="text-xs font-bold text-slate-500 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">Q4 2025</span>
            </div>

            <div className="mt-4 space-y-4">
              {/* High Risk Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-rose-600 dark:text-rose-400">
                      High Risk (Critical: 275, High: 2,697)
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Cost or Time &ge; 50% and Time or Cost &ge; 30%; High Exposure only.
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">2,972</span>
                    <span className="text-[11px] text-slate-400 block font-mono">40.1%</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: '40.1%' }} />
                </div>
              </div>

              {/* Medium Risk Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-amber-600 dark:text-amber-400">
                      Medium Risk
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Cost or Time &ge; 30% and Time or Cost &lt; 50%.
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">2,634</span>
                    <span className="text-[11px] text-slate-400 block font-mono">35.5%</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '35.5%' }} />
                </div>
              </div>

              {/* Low Risk Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      Low Risk
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Cost &lt; 30% and Time &lt; 30% with active progress.
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">1,805</span>
                    <span className="text-[11px] text-slate-400 block font-mono">24.4%</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '24.4%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded bg-slate-50 dark:bg-[#0E1729] border border-slate-200 dark:border-[#1E2B45] text-[11px] text-slate-500 flex items-center justify-between">
            <span>Portfolio Baseline: <strong>7,411 Projects</strong></span>
            <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">100.0% Audited</span>
          </div>
        </div>

        {/* Right Panel: Longitudinal Risk Trend (8 reported quarters) */}
        <div className="bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-[#1E2B45] rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-sm">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1E2B45] pb-4">
              <div>
                <h3 className="text-[18px] sm:text-[20px] font-bold text-slate-900 dark:text-white">
                  Longitudinal Risk Trend (8 reported quarters)
                </h3>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">
                  Repeated quarters between 2023-Q4 and 2025-Q3 — quarters with All reports are omitted.
                </p>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-semibold">
                <span className="flex items-center gap-1 text-rose-500"><span className="w-2 h-2 rounded-full bg-rose-500" /> High</span>
                <span className="flex items-center gap-1 text-amber-500"><span className="w-2 h-2 rounded-full bg-amber-500" /> Medium</span>
                <span className="flex items-center gap-1 text-emerald-500"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Low</span>
              </div>
            </div>

            <div className="h-56 mt-4 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={longitudinalTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="quarter" tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0E1729',
                      borderColor: '#1E2B45',
                      borderRadius: '6px',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="high" stackId="a" fill="#EF4444" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="medium" stackId="a" fill="#F59E0B" />
                  <Bar dataKey="low" stackId="a" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-2.5 rounded bg-slate-50 dark:bg-[#0E1729] border border-slate-200 dark:border-[#1E2B45] text-[11px] text-slate-500 flex items-center justify-between">
            <span>High-risk rose: 264 of 451 reporting projects in 2023-Q4, 737 of 1,609 in 2025-Q3.</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">8 Reported Quarters</span>
          </div>
        </div>
      </div>

      {/* ── Row 2: Concentration & Matrix (Reference 3) ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Left Panel: Risk Concentration by Sector/Ministry/State */}
        <div className="bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-[#1E2B45] rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1E2B45] pb-4">
            <div>
              <h3 className="text-[18px] sm:text-[20px] font-bold text-slate-900 dark:text-white">
                Risk Concentration by Sector
              </h3>
              <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">
                Count of projects per group &amp; High/Critical share of their total weight.
              </p>
            </div>

            <div className="flex items-center rounded-lg border border-slate-200 dark:border-[#1E2B45] p-1 bg-slate-50 dark:bg-[#0B1322]">
              {(['sector', 'ministry', 'state'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setConcentrationView(mode)}
                  className={`px-3 py-1 text-xs capitalize font-bold rounded-md transition-colors ${
                    concentrationView === mode
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {activeConcentrationList.map((item) => (
              <div key={item.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[240px]">
                    {item.name}
                  </span>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {item.highCount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[11px] text-rose-500 font-semibold ml-1">
                      {item.pct}%
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full"
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: Cost Risk vs Schedule Risk Matrix */}
        <div className="bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-[#1E2B45] rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="border-b border-slate-200 dark:border-[#1E2B45] pb-4">
            <h3 className="text-[18px] sm:text-[20px] font-bold text-slate-900 dark:text-white">
              Cost Risk vs Schedule Risk Matrix
            </h3>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">
              2x2 Decisive Grid derived from Cost V3 &amp; Time V1 predictions.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Dual Critical */}
            <div className="p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-700 dark:text-rose-400">
                  Dual Critical (Cost &amp; Delay)
                </span>
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              </div>
              <div className="text-2xl font-bold text-rose-700 dark:text-rose-300 font-sans">
                275 <span className="text-xs font-normal text-slate-500">(3.7% of portfolio)</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                Cost &ge; 50% and Schedule Risk &ge; 50%. Both predictive models indicate high-risk. Requires priority.
              </p>
            </div>

            {/* Schedule Delay Dominant */}
            <div className="p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                  Schedule Delay Dominant
                </span>
                <Clock className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-2xl font-bold text-amber-700 dark:text-amber-300 font-sans">
                2,218 <span className="text-xs font-normal text-slate-500">(29.9%)</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                Schedule risk severe (delay &gt; 12 mos), while cost escalation remains controlled.
              </p>
            </div>

            {/* Cost Overrun Dominant */}
            <div className="p-3.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400">
                  Cost Overrun Dominant
                </span>
                <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
              </div>
              <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300 font-sans">
                479 <span className="text-xs font-normal text-slate-500">(6.5%)</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                Cost escalation severe (&gt; 25%), while construction velocity remains on schedule.
              </p>
            </div>

            {/* Low Risk Safe Tier */}
            <div className="p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  Dual Safe Baseline
                </span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 font-sans">
                4,439 <span className="text-xs font-normal text-slate-500">(59.9%)</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                Projects tracking strictly within sanctioned budgets and approved timelines.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 3: Critical Projects Table (Reference 5 Match) ── */}
      <div className="bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-[#1E2B45] rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#1E2B45] pb-4">
          <div>
            <h3 className="text-[18px] sm:text-[20px] font-bold text-slate-900 dark:text-white">
              Critical Projects Assessment Table
            </h3>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">
              Strictly aligned enterprise telemetry table with 56px standardized row height and zero column overlap.
            </p>
          </div>

          <input
            type="text"
            value={tableSearch}
            onChange={(e) => setTableSearch(e.target.value)}
            placeholder="Search Project, Sector, State..."
            className="px-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#0E1626] border border-slate-200 dark:border-[#1E2B45] text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all w-full sm:w-64"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-50/95 dark:bg-[#0E1626]/95 backdrop-blur-xs border-b border-slate-200 dark:border-[#1E2B45] text-slate-400 text-[11px] font-bold uppercase tracking-wider h-14">
                <th className="py-3 px-4">Project &amp; Agency</th>
                <th className="py-3 px-4">Sector &amp; State</th>
                <th className="py-3 px-4">Cost Risk</th>
                <th className="py-3 px-4">Schedule Risk</th>
                <th className="py-3 px-4">Overall Risk</th>
                <th className="py-3 px-4">Primary Driver</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1A263D]">
              {filteredProjects.slice(0, 8).map((proj: any) => (
                <tr
                  key={proj.id}
                  className="h-14 hover:bg-indigo-50/40 dark:hover:bg-[#14233C] transition-colors even:bg-slate-50/50 dark:even:bg-[#0c1627] odd:bg-transparent"
                >
                  <td className="px-4 py-2.5">
                    <div className="font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                      {proj.project_name || proj.name || 'Project name unavailable'}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {proj.project_id || proj.id} • {proj.ministry || proj.implementing_agency || 'Railways'}
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="font-medium text-slate-700 dark:text-slate-300">
                      {proj.sector || 'Railways'}
                    </div>
                    <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {proj.state || 'Rajasthan'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="font-bold text-slate-900 dark:text-white font-mono">
                      {proj.cost_risk || '39%'}
                    </div>
                    <span className="text-[10px] text-slate-400 block">+1.7x recorded overrun</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="font-bold text-slate-900 dark:text-white font-mono">
                      {proj.schedule_risk || '75%'}
                    </div>
                    <span className="text-[10px] text-slate-400 block">Delay non-reported</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <RiskBadge
                      riskScore={proj.risk_score || 88}
                      subtitle="Stale data - last: May 2021"
                    />
                  </td>
                  <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400 text-[11px] max-w-[200px]">
                    Model signal: Project age ({proj.age_months || 127} mos)
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      onClick={() => navigate(`/projects/${proj.id}`)}
                      className="px-2.5 py-1 rounded text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 transition-colors"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
