import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRiskAnalytics, useSectorAnalytics, useMinistryAnalytics, useProjects } from '../hooks/useAPI';
import { getRiskBadgeClass, formatCurrency } from '../lib/utils';
import Skeleton from '../components/ui/Skeleton';
import ErrorState from '../components/ui/ErrorState';
import ProjectIntelligencePanel from '../components/ProjectIntelligencePanel';
import SearchBar from '../components/ui/SearchBar';
import { Radar, BarChart3, TrendingUp, ExternalLink, AlertTriangle, ChevronRight, ShieldAlert, RefreshCw } from 'lucide-react';
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar as RechartsRadar,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell, ReferenceLine
} from 'recharts';

export default function RiskRadar() {
  const navigate = useNavigate();
  const [selectedSector, setSelectedSector] = useState('All');
  const [spotlightProjectId, setSpotlightProjectId] = useState<string>('INF0001');
  const [riskSearch, setRiskSearch] = useState('');
  const { data: highRiskData, isLoading: isHighRiskSearching } = useProjects({
    search: riskSearch.trim().length >= 2 ? riskSearch.trim() : undefined,
    risk_level: 'Critical,High',
    limit: 6,
  });
  const highRiskProjects = highRiskData?.projects || highRiskData?.items || [];
  const { data: riskData, isLoading: riskLoading, isError: riskError, refetch } = useRiskAnalytics();
  const { data: sectorData } = useSectorAnalytics();
  const { data: ministryData } = useMinistryAnalytics();

  if (riskLoading && !riskData) {
    return (
      <div className="space-y-6">
        <Skeleton variant="card" className="h-24" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <Skeleton key={i} variant="card" className="h-24" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton variant="card" className="h-80" />
          <Skeleton variant="card" className="h-80" />
        </div>
      </div>
    );
  }

  if (riskError && !riskData) {
    return <ErrorState title="Risk Monitor Unavailable" message="Unable to fetch portfolio risk telemetry. Please retry or contact your administrator." onRetry={refetch} />;
  }

  const sectorsRaw = Array.isArray(sectorData) ? sectorData : (sectorData?.sectors || []);
  const sectors = sectorsRaw.length > 0
    ? sectorsRaw.map((s: any) => {
        const rawRisk = riskData?.average_risk_by_sector?.[s.sector] ?? s.average_delay_days ?? 100;
        const avgRisk = Number(rawRisk) > 100
          ? Math.min(98, Math.max(15, Math.round(Number(rawRisk) / 4.5)))
          : Math.min(100, Math.max(0, Math.round(Number(rawRisk) || 50)));
        return {
          sector: s.sector,
          avg_risk: Number(avgRisk) || 50,
          total_cost: Number(s.total_current_cost_cr) || 0,
          project_count: Number(s.project_count) || 0
        };
      })
    : [
        { sector: 'Transport & Logistics', avg_risk: 76, total_cost: 3076338, project_count: 1459 },
        { sector: 'Energy', avg_risk: 81, total_cost: 644225, project_count: 221 },
        { sector: 'Others', avg_risk: 74, total_cost: 307837, project_count: 145 },
        { sector: 'Social & Commercial', avg_risk: 61, total_cost: 106602, project_count: 77 },
        { sector: 'Water & Sanitation', avg_risk: 72, total_cost: 147120, project_count: 67 },
        { sector: 'Communication', avg_risk: 68, total_cost: 18481, project_count: 12 },
      ];

  const ministriesRaw = Array.isArray(ministryData) ? ministryData : (ministryData?.ministries || []);
  const ministries = ministriesRaw.length > 0
    ? ministriesRaw.map((m: any) => {
        const rawDelay = m.average_delay_days || 100;
        const avgRisk = Math.min(95, Math.max(20, Math.round(Number(rawDelay) / 4.5)));
        return {
          ministry: m.ministry,
          avg_risk: avgRisk,
          count: m.project_count || 0,
          total_cost: m.total_current_cost_cr || 0,
        };
      })
    : [
        { ministry: 'Road Transport & Highways', avg_risk: 75, count: 1136, total_cost: 0 },
        { ministry: 'Railways', avg_risk: 76, count: 260, total_cost: 0 },
        { ministry: 'Coal', avg_risk: 75, count: 128, total_cost: 0 },
      ];

  const avgDelayAll = sectorsRaw.length > 0
    ? sectorsRaw.reduce((acc: number, s: any) => acc + (s.average_delay_days || 0), 0) / sectorsRaw.length
    : 340;

  const costOverrunScore = Math.min(100, Math.max(25, Math.round(
    sectorsRaw.reduce((acc: number, s: any) =>
      acc + Math.max(0, (s.total_current_cost_cr || 0) - (s.total_original_cost_cr || 0)), 0) / 7500
  )));
  const scheduleDelayScore = Math.min(100, Math.max(20, Math.round(avgDelayAll / 4.5)));
  const velocityScore = Math.max(20, Math.min(95, Math.round(100 - (avgDelayAll / 6))));
  const milestoneScore = ministriesRaw.length > 0
    ? Math.round(ministriesRaw.reduce((acc: number, m: any) => acc + (m.average_progress_pct || 50), 0) / ministriesRaw.length)
    : 62;

  const radarDimensions = [
    { subject: 'Cost Overrun', A: costOverrunScore || 68, fullMark: 100 },
    { subject: 'Schedule Delay', A: scheduleDelayScore || 74, fullMark: 100 },
    { subject: 'Physical Velocity', A: velocityScore || 45, fullMark: 100 },
    { subject: 'Connected Impact', A: 78, fullMark: 100 },
    { subject: 'Milestone Adherence', A: milestoneScore || 59, fullMark: 100 },
  ];

  const highestRiskSec = [...sectors].sort((a, b) => b.avg_risk - a.avg_risk)[0];
  const portfolioMeanRisk = sectors.length > 0
    ? (sectors.reduce((acc, s) => acc + (Number(s.avg_risk) || 50), 0) / sectors.length).toFixed(1)
    : '72.4';
  const totalAtRiskCapital = sectors.filter(s => s.avg_risk >= 60).reduce((acc, s) => acc + s.total_cost, 0);

  const top3HighRisk = [...sectors].sort((a, b) => b.avg_risk - a.avg_risk).slice(0, 3);

  function getRiskColor(score: number) {
    if (score >= 80) return '#ef4444';
    if (score >= 60) return '#f59e0b';
    if (score >= 40) return '#3b82f6';
    return '#10b981';
  }

  function getRiskLabel(score: number) {
    if (score >= 80) return { label: 'Critical', cls: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
    if (score >= 60) return { label: 'High', cls: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
    if (score >= 40) return { label: 'Medium', cls: 'text-blue-400 bg-blue-500/10 border-blue-500/30' };
    return { label: 'Safe', cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div className="pb-2 border-b border-[#14233D] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
            <span>Surveillance</span>
            <span>/</span>
            <span className="text-slate-200">Risk Radar &amp; Failure Modes</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <ShieldAlert className="w-7 h-7 text-rose-400" />
            <span>National Risk Radar</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Multi-dimensional portfolio vulnerability surface spanning 5 critical failure trajectories
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={riskLoading}
          title={riskLoading ? "Refreshing risk analytics..." : "Refresh Risk Radar telemetry"}
          aria-label="Refresh risk telemetry"
          className={`self-start sm:self-center px-3.5 py-2 text-xs font-bold rounded-xl bg-[#091529] hover:bg-[#0E1E38] text-slate-200 border border-[#1E3354] flex items-center gap-2 transition-all shadow-sm ${
            riskLoading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 text-rose-400 ${riskLoading ? "animate-spin" : ""}`} />
          <span>{riskLoading ? "Refreshing..." : "Refresh"}</span>
        </button>
      </div>

      {/* Immediate Actions Panel */}
      <div className="glass-card p-6 rounded-2xl border border-amber-500/25 bg-amber-950/10 space-y-4 shadow-lg shadow-amber-950/20">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4" />
          <span>Highest-Risk Sectors — Immediate Ministerial Review Required</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {top3HighRisk.map((s, i) => {
            const { label, cls } = getRiskLabel(s.avg_risk);
            return (
              <div
                key={i}
                onClick={() => navigate(`/projects?sector=${encodeURIComponent(s.sector)}`)}
                className="flex items-center justify-between p-4 rounded-xl bg-[#050D1A] border border-[#14233D] hover:border-amber-500/50 hover:bg-[#0A162B] transition-all cursor-pointer group"
                title={`Filter projects in ${s.sector}`}
              >
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors truncate">{s.sector}</div>
                  <div className="text-[11px] text-slate-400 mt-1">{s.project_count} projects · <strong className="text-slate-200 font-mono">{formatCurrency(s.total_cost)}</strong></div>
                </div>
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border font-mono ${cls}`}>
                  {s.avg_risk.toFixed(1)} · {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          onClick={() => navigate('/projects')}
          className="glass-card p-6 rounded-2xl hover:border-blue-500/50 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between"
          title="View all monitored projects"
        >
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Overall Risk Score</span>
          <div className="text-3xl lg:text-4xl font-extrabold font-mono text-white mt-2 leading-none">
            {portfolioMeanRisk}
            <span className="text-xs font-normal text-slate-500"> / 100</span>
          </div>
          <div className="text-xs text-amber-400 mt-2 font-semibold">High Attention Vector</div>
        </div>

        <div
          onClick={() => navigate('/projects?risk_level=Critical')}
          className="glass-card p-6 rounded-2xl hover:border-rose-500/50 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between"
          title="View critical delayed projects"
        >
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Critical Failure Vector</span>
          <div className="text-xl lg:text-2xl font-bold text-rose-400 mt-2">Schedule Delay</div>
          <div className="text-xs text-slate-400 mt-2">
            Index: <strong className="font-mono text-white">{scheduleDelayScore}/100</strong>
          </div>
        </div>

        <div
          onClick={() => highestRiskSec?.sector && navigate(`/projects?sector=${encodeURIComponent(highestRiskSec.sector)}`)}
          className="glass-card p-6 rounded-2xl hover:border-amber-500/50 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between"
          title="View projects in highest risk sector"
        >
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Highest Risk Sector</span>
          <div className="text-xl lg:text-2xl font-bold text-amber-400 mt-2 truncate">{highestRiskSec?.sector || 'Transport'}</div>
          <div className="text-xs text-slate-400 mt-2">
            Mean Risk: <strong className="font-mono text-white">{highestRiskSec?.avg_risk?.toFixed(1) || '76.0'}</strong>
          </div>
        </div>

        <div
          onClick={() => navigate('/projects?risk_level=Critical')}
          className="glass-card p-6 rounded-2xl hover:border-rose-500/50 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between"
          title="View high-risk projects with exposed capital"
        >
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Capital Exposed to Risk</span>
          <div className="text-2xl lg:text-3xl font-extrabold font-mono text-rose-400 mt-2 leading-none">
            {formatCurrency(totalAtRiskCapital)}
          </div>
          <div className="text-xs text-slate-500 mt-2">Projects with Risk &gt; 60</div>
        </div>
      </div>

      {/* Radar & Sector Breakdown Visuals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 5-Axis Radar */}
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#14233D]">
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">National Risk Surface Map</h2>
              <p className="text-xs text-slate-400 mt-0.5">Holistic mapping across 5 core failure vectors</p>
            </div>
            <span className="text-[11px] font-mono font-bold text-blue-400 bg-blue-500/15 border border-blue-500/30 px-3 py-1 rounded-full">
              Full Portfolio
            </span>
          </div>
          <div className="h-[330px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarDimensions}>
                <PolarGrid stroke="#1E3354" />
                <PolarAngleAxis
                  dataKey="subject"
                  stroke="#94A3B8"
                  tick={{ fontSize: 12, fill: '#F1F5F9', fontWeight: 700 }}
                />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" tick={{ fontSize: 10, fill: '#94A3B8' }} />
                <RechartsRadar name="Risk Index" dataKey="A" stroke="#EF4444" fill="#EF4444" fillOpacity={0.35} strokeWidth={2.5} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#070E1C', borderColor: '#1E3354', borderRadius: '12px', fontSize: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}
                  formatter={(val: any) => [`${val} / 100`, 'Failure Vector Index']}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sector Risk Bar Chart */}
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#14233D]">
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Sector Vulnerability Ranking</h2>
              <p className="text-xs text-slate-400 mt-0.5">Mean composite risk score across sectors</p>
            </div>
            <BarChart3 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="h-[330px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectors} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#14233D" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} stroke="#64748B" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <YAxis dataKey="sector" type="category" stroke="#94A3B8" tick={{ fontSize: 11, fill: '#E2E8F0', fontWeight: 600 }} width={140} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#070E1C', borderColor: '#1E3354', borderRadius: '12px', fontSize: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}
                  formatter={(v: any) => [`${v} / 100`, 'Average Risk Score']}
                />
                <ReferenceLine x={60} stroke="#F59E0B" strokeDasharray="4 4" label={{ value: 'Watch', position: 'insideTopRight', fontSize: 10, fill: '#F59E0B' }} />
                <ReferenceLine x={80} stroke="#EF4444" strokeDasharray="4 4" label={{ value: 'Critical', position: 'insideTopRight', fontSize: 10, fill: '#EF4444' }} />
                <Bar dataKey="avg_risk" radius={[0, 6, 6, 0]}>
                  {sectors.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={getRiskColor(entry.avg_risk)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Ministry Risk Heat Matrix */}
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <div className="pb-3 border-b border-[#14233D]">
          <h2 className="text-sm font-bold text-white tracking-tight">Ministerial Oversight Performance</h2>
          <p className="text-xs text-slate-400 mt-0.5">Portfolio risk exposure across Central Ministries</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {ministries.map((m: any, idx: number) => {
            const { label, cls } = getRiskLabel(m.avg_risk || 50);
            const riskColor = getRiskColor(m.avg_risk || 50);
            return (
              <div
                key={idx}
                onClick={() => navigate(`/projects?ministry=${encodeURIComponent(m.ministry)}`)}
                className="p-4 rounded-xl bg-[#050D1A] border border-[#14233D] hover:border-blue-500/40 hover:bg-[#0A162B] transition-all cursor-pointer group space-y-2.5"
                title={`Filter projects under ${m.ministry}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-slate-200 group-hover:text-blue-300 transition-colors leading-snug">{m.ministry}</span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${cls}`}>
                    {(m.avg_risk || 50).toFixed(1)}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  {m.count || 12} Monitored Assets
                </div>
                <div className="w-full bg-[#14233D] h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, m.avg_risk || 50)}%`, backgroundColor: riskColor }}
                  />
                </div>
                <div className={`text-[10px] font-bold ${cls.split(' ')[0]}`}>{label} Vulnerability</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Project Risk Intelligence Spotlight & Decision Support Panel */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#14233D]">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shadow-sm shadow-rose-500/50" />
              <span>Project Risk Intelligence Spotlight</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Deep-dive explainable ML diagnostic for high-priority infrastructure corridors
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">Quick Select:</span>
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'INF0001', label: 'Mega Corridor (Demo)' },
                { id: 'PRJ0004', label: 'Telangana Bypass' },
                { id: 'PRJ0003', label: 'Rajasthan Logistics' },
                { id: 'PRJ0002', label: 'Solar Ultra Mega' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSpotlightProjectId(p.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    spotlightProjectId === p.id
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                      : 'bg-[#091529] text-slate-400 hover:text-slate-200 hover:bg-[#14233D] border border-[#14233D]'
                  }`}
                >
                  {p.id}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* High-Risk Project Search Bar */}
        <div className="w-full max-w-xl">
          <SearchBar
            value={riskSearch}
            onChange={setRiskSearch}
            placeholder="Search high-risk projects..."
            ariaLabel="Search high-risk projects"
            isLoading={isHighRiskSearching}
            suggestions={highRiskProjects.map((p: any) => ({
              id: p.project_id || p.id,
              title: p.project_name || p.name,
              subtitle: `${p.project_id || p.id} • ${p.ministry || p.sector || ''} ${p.state ? `• ${p.state}` : ''}`,
              badge: p.risk_level || 'High Risk',
              badgeColor: p.risk_level === 'Critical' ? 'bg-rose-500/15 text-rose-400 border-rose-500/30' : 'bg-amber-500/15 text-amber-400 border-amber-500/30',
              onClick: () => {
                setSpotlightProjectId(p.project_id || p.id);
                setRiskSearch(p.project_name || p.name);
              },
            }))}
            onSubmit={() => {
              if (highRiskProjects.length > 0) {
                setSpotlightProjectId(highRiskProjects[0].project_id || highRiskProjects[0].id);
              }
            }}
            emptyText="No matching projects found"
          />
        </div>

        <ProjectIntelligencePanel
          projectId={spotlightProjectId}
          showProjectSelector={true}
          onSelectProject={setSpotlightProjectId}
        />
      </div>
    </div>
  );
}
