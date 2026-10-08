import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExecutiveAnalytics } from '../hooks/useAPI';
import { formatCurrency, formatPercent, getRiskBadgeClass, getRiskLabel } from '../lib/utils';
import Skeleton from './ui/Skeleton';
import {
  ShieldAlert, TrendingUp, TrendingDown, Clock, DollarSign,
  AlertTriangle, CheckCircle2, ChevronRight, ArrowRight,
  Sparkles, Award, BarChart3, PieChart, Activity, Target,
  Building2, MapPin, Layers, FileText, Compass
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, LineChart, Line, AreaChart, Area
} from 'recharts';

export default function ExecutiveCommandCenter() {
  const navigate = useNavigate();
  const { data: execData, isLoading, isError, refetch } = useExecutiveAnalytics();
  const [activeProjectTab, setActiveProjectTab] = useState<'CRITICAL' | 'IMPROVING'>('CRITICAL');
  const [rankingTab, setRankingTab] = useState<'MINISTRY' | 'SECTOR'>('MINISTRY');

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton variant="card" className="h-44" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton variant="card" className="h-32" />
          <Skeleton variant="card" className="h-32" />
          <Skeleton variant="card" className="h-32" />
        </div>
      </div>
    );
  }

  if (isError || !execData) {
    return (
      <div className="p-6 rounded-2xl border border-rose-500/30 bg-rose-950/20 text-center space-y-3">
        <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
        <h3 className="text-sm font-bold text-white">Executive Command Telemetry Offline</h3>
        <p className="text-xs text-slate-400">Unable to load macro national analytics. Click retry to reconnect.</p>
        <button
          onClick={() => refetch()}
          className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-500"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const {
    national_health_score,
    national_health_status,
    health_breakdown,
    live_project_statistics: liveStats,
    budget_exposure: budgetExp,
    delay_exposure: delayExp,
    top_10_critical_projects: topCritical,
    top_10_improving_projects: topImproving,
    ministry_rankings: minRankings,
    sector_rankings: secRankings,
    quarterly_forecast: forecastData,
    ai_recommendations: aiDirectives,
  } = execData;

  const displayedProjects = activeProjectTab === 'CRITICAL' ? topCritical : topImproving;

  return (
    <div className="space-y-6">
      {/* ── 1. NATIONAL HEALTH SCORE & MACRO TELEMETRY BANNER ─────────────── */}
      <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-[#061226] via-slate-900 to-[#0a1b38] p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 border border-blue-500/40 text-blue-300 flex items-center gap-1.5">
                <Compass className="w-3 h-3" />
                MoSPI • PM GatiShakti Executive Command Center
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                1,981 Monitored Central Assets
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              NATIONAL INFRASTRUCTURE HEALTH & PREDICTIVE OVERSIGHT
            </h1>

            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Real-time portfolio-level executive telemetry evaluating cumulative capital outlay of {formatCurrency(budgetExp.total_current_cost_cr)}, schedule slippages across Union Ministries, and machine learning risk trajectories.
            </p>
          </div>

          {/* National Health Score Meter */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-blue-500/30 flex items-center gap-5 shrink-0 self-start lg:self-center shadow-xl">
            <div className="text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                National Health Index
              </span>
              <div className="text-3xl font-black font-mono text-emerald-400 mt-0.5">
                {national_health_score}
                <span className="text-sm font-normal text-slate-500"> / 100</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border mt-1 inline-block ${
                national_health_status === 'Healthy'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}>
                {national_health_status.toUpperCase()} STATUS
              </span>
            </div>

            {/* Health Breakdown Mini Bars */}
            <div className="space-y-1.5 text-[10px] border-l border-slate-800 pl-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-400">Physical Velocity:</span>
                <span className="font-mono text-emerald-400 font-semibold">{health_breakdown.progress_health}%</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-400">Budget Adherence:</span>
                <span className="font-mono text-amber-400 font-semibold">{health_breakdown.budget_health}%</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-400">Schedule Timeliness:</span>
                <span className="font-mono text-blue-400 font-semibold">{health_breakdown.delay_health}%</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-400">Risk Safety Index:</span>
                <span className="font-mono text-purple-400 font-semibold">{health_breakdown.risk_safety_health}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Core KPI Exposure Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Capital at Risk</span>
            <div className="text-xl font-bold font-mono text-rose-400 mt-0.5">
              {formatCurrency(budgetExp.capital_at_risk_cr)}
            </div>
            <span className="text-[10px] text-slate-500">28% of active monitored capex</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Cost Overrun Trajectory</span>
            <div className="text-xl font-bold font-mono text-amber-400 mt-0.5">
              +{budgetExp.average_cost_overrun_pct}%
            </div>
            <span className="text-[10px] text-slate-500">+{formatCurrency(budgetExp.total_cost_escalation_cr)} escalation</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Average Portfolio Delay</span>
            <div className="text-xl font-bold font-mono text-purple-400 mt-0.5">
              {delayExp.average_delay_months} Months
            </div>
            <span className="text-[10px] text-slate-500">{delayExp.average_delay_days} days mean slippage</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">High & Critical Assets</span>
            <div className="text-xl font-bold font-mono text-rose-400 mt-0.5">
              {liveStats.critical_projects + liveStats.high_risk_projects} Assets
            </div>
            <span className="text-[10px] text-slate-500">{liveStats.critical_projects} in immediate critical status</span>
          </div>
        </div>
      </div>

      {/* ── 2. TOP 10 CRITICAL VS TOP 10 IMPROVING ASSETS ─────────────────── */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <span>National Asset Priority Watch</span>
            </h2>
            <p className="text-xs text-slate-400">Live rankings of projects demanding intervention vs projects achieving turnaround</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs">
              <button
                onClick={() => setActiveProjectTab('CRITICAL')}
                className={`px-3 py-1 rounded-md font-semibold transition-all ${
                  activeProjectTab === 'CRITICAL'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Top 10 Critical Projects
              </button>
              <button
                onClick={() => setActiveProjectTab('IMPROVING')}
                className={`px-3 py-1 rounded-md font-semibold transition-all ${
                  activeProjectTab === 'IMPROVING'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Top 10 Improving Projects
              </button>
            </div>
          </div>
        </div>

        {/* Table of Top 10 */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Project Asset</th>
                <th className="py-2.5 px-3">Ministry / Sector</th>
                <th className="py-2.5 px-3">State</th>
                <th className="py-2.5 px-3 text-right">Sanctioned Capex</th>
                <th className="py-2.5 px-3 text-right">Physical Progress</th>
                <th className="py-2.5 px-3 text-right">Schedule Slippage</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {displayedProjects.map((p: any, idx: number) => {
                const isCrit = activeProjectTab === 'CRITICAL';
                return (
                  <tr key={p.project_id} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-500">
                      #{idx + 1}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-white group-hover:text-blue-300 transition-colors line-clamp-1">
                        {p.project_name}
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">{p.project_id}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      <span className="block truncate max-w-[140px]">{p.ministry}</span>
                      <span className="text-[10px] text-slate-500">{p.sector}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                        <span>{p.state}</span>
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-200">
                      {formatCurrency(p.current_cost_cr || 0)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      <span className="text-white font-semibold">{p.progress_percentage?.toFixed(1)}%</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      <span className={isCrit ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                        {p.delay_months} Months ({p.delay_days}d)
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        isCrit
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      }`}>
                        {isCrit ? p.risk_level || 'Critical' : 'Accelerating'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => navigate(`/projects/${p.project_id}`)}
                        className="px-2 py-1 rounded bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-300 text-[10px] font-semibold transition-colors"
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

      {/* ── 3. MINISTRY & SECTOR RANKINGS (TABBED) ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ministry Performance Ranking */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-400" />
                <span>Central Ministry Performance League</span>
              </h3>
              <p className="text-[11px] text-slate-400">Ranked by execution velocity and schedule adherence</p>
            </div>
            <Award className="w-4 h-4 text-amber-400" />
          </div>

          <div className="space-y-2.5">
            {minRankings.map((m: any) => (
              <div
                key={m.rank}
                onClick={() => navigate(`/projects?ministry=${encodeURIComponent(m.ministry)}`)}
                className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-purple-500/40 transition-colors cursor-pointer flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center font-mono font-bold text-slate-400 text-[10px] shrink-0">
                    #{m.rank}
                  </span>
                  <div className="min-w-0">
                    <span className="font-semibold text-slate-200 block truncate">{m.ministry}</span>
                    <span className="text-[10px] text-slate-500">
                      {m.project_count} Projects • {formatCurrency(m.total_cost_cr)}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="flex items-center justify-end gap-2">
                    <span className="font-mono font-bold text-purple-300">{m.performance_score}/100</span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                      m.status === 'Optimal' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}>
                      {m.status}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Avg Delay: {m.average_delay_days}d
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sector Performance Ranking */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-400" />
                <span>Sector Risk & Slippage Benchmarks</span>
              </h3>
              <p className="text-[11px] text-slate-400">Risk index and delay exposures by national sector</p>
            </div>
            <BarChart3 className="w-4 h-4 text-teal-400" />
          </div>

          <div className="space-y-2.5">
            {secRankings.map((s: any) => (
              <div
                key={s.rank}
                onClick={() => navigate(`/projects?sector=${encodeURIComponent(s.sector)}`)}
                className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-teal-500/40 transition-colors cursor-pointer flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center font-mono font-bold text-slate-400 text-[10px] shrink-0">
                    #{s.rank}
                  </span>
                  <div className="min-w-0">
                    <span className="font-semibold text-slate-200 block truncate">{s.sector}</span>
                    <span className="text-[10px] text-slate-500">
                      {s.project_count} Assets • {formatCurrency(s.total_cost_cr)}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="flex items-center justify-end gap-2">
                    <span className="font-mono font-bold text-amber-400">{s.risk_index} / 100</span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                      s.risk_index >= 70 ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}>
                      {s.status}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Mean Delay: {s.average_delay_days}d
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 4. QUARTERLY OUTLOOK & AI STRATEGIC DIRECTIVES ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quarterly Predictive Forecast */}
        <div className="lg:col-span-1 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-white">Quarterly Outlook (2026)</h3>
            <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
              Predictive S-Curve
            </span>
          </div>

          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="quarter" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: 11 }}
                />
                <Area type="monotone" dataKey="capex_expenditure_cr" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} name="Capex (Cr)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs pt-2 border-t border-slate-800">
            {forecastData.map((f: any) => (
              <div key={f.quarter} className="flex items-center justify-between text-slate-300">
                <span className="font-mono text-slate-400">{f.quarter}</span>
                <span className="font-mono text-white font-semibold">{formatCurrency(f.capex_expenditure_cr)}</span>
                <span className="text-emerald-400 font-mono text-[11px]">{Math.round(f.completion_prob * 100)}% Prob</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Recommendation Center (Portfolio Directives) */}
        <div className="lg:col-span-2 rounded-2xl border border-blue-500/30 bg-gradient-to-br from-[#071329] via-slate-900 to-slate-950 p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">AI Recommendation Center (Cabinet Directives)</h3>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              High-Impact Prescriptions
            </span>
          </div>

          <div className="space-y-3">
            {aiDirectives.map((d: any) => (
              <div
                key={d.id}
                className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-blue-500/40 transition-colors space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {d.id}
                    </span>
                    <span className="text-xs font-bold text-white">{d.directive_title}</span>
                  </div>
                  <span className="text-[10px] font-bold text-rose-400 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
                    {d.priority} Priority
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {d.summary}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
                  <div className="text-[11px] text-slate-400">
                    Authority: <span className="font-semibold text-slate-200">{d.authority}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-emerald-400 font-mono font-bold">
                      -{d.potential_delay_recovery_days}d Recovery
                    </span>
                    <span className="text-emerald-400 font-mono font-bold">
                      {formatCurrency(d.potential_cost_avoidance_cr)} Avoided
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
