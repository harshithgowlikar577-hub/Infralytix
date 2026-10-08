import { useState } from 'react';
import { 
  Building2, AlertTriangle, TrendingUp, Clock, 
  ArrowUpRight, ShieldAlert, FileText, Calendar, 
  ChevronRight, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import MetricCard from '../ui/MetricCard';
import { RiskBadge, ModeBadge } from '../ui/Badge';
import { formatCurrency, formatNumber, getTrajectoryInfo } from '../../lib/utils';

interface ExecutiveViewProps {
  data: any;
  riskData: any;
  sectorData: any;
}

export default function ExecutiveView({ data, riskData, sectorData }: ExecutiveViewProps) {
  const navigate = useNavigate();
  const [selectedBand, setSelectedBand] = useState<string | null>(null);

  // Top Deteriorating Mega Projects (Real INFRALYTIX concepts)
  const deterioratingProjects = [
    {
      id: 'INF0001',
      name: 'Vadodara-Mumbai Expressway Phase-IV (KM 120-180)',
      ministry: 'Ministry of Road Transport & Highways (MoRTH)',
      agency: 'NHAI',
      contractor: 'Larsen & Toubro Infra',
      sanctionedCost: 4850.0,
      anticipatedCost: 6030.2,
      escalationPct: 24.3,
      delayMonths: 11.4,
      initialRisk: 38,
      currentRisk: 87,
      deltaRisk: 49,
      trajectory: 'rapidly deteriorating',
      primaryBottleneck: 'Forest & Wildlife RoW clearance lapsed at KM 142.4 (Palghar Section)',
      state: 'Maharashtra',
    },
    {
      id: 'INF0042',
      name: 'Dedicated Freight Corridor Feeder Link (Son Nagar - Dankuni PPP)',
      ministry: 'Ministry of Railways',
      agency: 'DFCCIL',
      contractor: 'Tata Projects Consortium',
      sanctionedCost: 12400.0,
      anticipatedCost: 14780.0,
      escalationPct: 19.2,
      delayMonths: 16.8,
      initialRisk: 42,
      currentRisk: 78,
      deltaRisk: 36,
      trajectory: 'rapidly deteriorating',
      primaryBottleneck: 'Rail Over-Bridge land acquisition & sub-contractor remobilization',
      state: 'Bihar / West Bengal',
    },
    {
      id: 'INF0089',
      name: '765kV Super Grid High-Capacity Inter-Regional Corridor',
      ministry: 'Ministry of Power',
      agency: 'PGCIL',
      contractor: 'Sterlite Power Transmission',
      sanctionedCost: 1250.0,
      anticipatedCost: 1490.0,
      escalationPct: 19.2,
      delayMonths: 8.2,
      initialRisk: 45,
      currentRisk: 79,
      deltaRisk: 34,
      trajectory: 'deteriorating',
      primaryBottleneck: 'Tower footing compensation dispute across 42 private holdings',
      state: 'Madhya Pradesh',
    },
    {
      id: 'INF0104',
      name: '4000MW Ultra Mega Renewable Energy Solar Park',
      ministry: 'Ministry of New & Renewable Energy (MNRE)',
      agency: 'SECI / NTPC',
      contractor: 'Sterling and Wilson',
      sanctionedCost: 3100.0,
      anticipatedCost: 3620.0,
      escalationPct: 16.8,
      delayMonths: 7.5,
      initialRisk: 29,
      currentRisk: 64,
      deltaRisk: 35,
      trajectory: 'deteriorating',
      primaryBottleneck: 'Substation bay allocation & inverter shipment customs clearance hold',
      state: 'Rajasthan',
    },
    {
      id: 'INF0215',
      name: 'Deepwater Multi-Purpose Container Berth Expansion',
      ministry: 'Ministry of Ports, Shipping and Waterways',
      agency: 'VPA (Visakhapatnam Port)',
      contractor: 'Adani Ports & SEZ',
      sanctionedCost: 6400.0,
      anticipatedCost: 7280.0,
      escalationPct: 13.8,
      delayMonths: 9.0,
      initialRisk: 34,
      currentRisk: 71,
      deltaRisk: 37,
      trajectory: 'deteriorating',
      primaryBottleneck: 'Coastal Regulation Zone (CRZ) statutory clearance amendment pending',
      state: 'Andhra Pradesh',
    }
  ];

  // Sector Risk & Capital at Risk Matrix
  const sectorScatterData = [
    { name: 'Road Transport & Highways', x: 842, y: 64.2, z: 142500, cost: '₹1,42,500 Cr', avgDelay: '16.4 Mo', criticalCount: 48 },
    { name: 'Railways & DFCs', x: 498, y: 61.8, z: 118200, cost: '₹1,18,200 Cr', avgDelay: '18.2 Mo', criticalCount: 38 },
    { name: 'Power & Transmission', x: 284, y: 46.5, z: 64800, cost: '₹64,800 Cr', avgDelay: '9.4 Mo', criticalCount: 16 },
    { name: 'Petroleum & Natural Gas', x: 142, y: 42.1, z: 52400, cost: '₹52,400 Cr', avgDelay: '7.8 Mo', criticalCount: 11 },
    { name: 'Urban Development & Metro', x: 128, y: 56.4, z: 38900, cost: '₹38,900 Cr', avgDelay: '13.1 Mo', criticalCount: 9 },
    { name: 'Ports & Inland Waterways', x: 52, y: 48.0, z: 18400, cost: '₹18,400 Cr', avgDelay: '8.6 Mo', criticalCount: 3 },
    { name: 'Civil Aviation', x: 35, y: 39.4, z: 9600, cost: '₹9,600 Cr', avgDelay: '5.2 Mo', criticalCount: 1 },
  ];

  // Portfolio Risk Band Spread with Capital Values
  const riskBands = [
    { label: 'Safe', count: 832, pct: 42, capitalCr: 182400, color: '#10B981', bg: 'bg-emerald-500', text: 'text-emerald-400', desc: 'Score 0-30: On target execution' },
    { label: 'Watch', count: 554, pct: 28, capitalCr: 114600, color: '#F59E0B', bg: 'bg-amber-500', text: 'text-amber-400', desc: 'Score 31-50: Minor delay velocity' },
    { label: 'High Risk', count: 356, pct: 18, capitalCr: 79200, color: '#F97316', bg: 'bg-orange-500', text: 'text-orange-400', desc: 'Score 51-70: Budget escalation >15%' },
    { label: 'Very High', count: 158, pct: 8, capitalCr: 36800, color: '#EF4444', bg: 'bg-red-500', text: 'text-red-400', desc: 'Score 71-85: Statutory deadlock' },
    { label: 'Critical', count: 81, pct: 4, capitalCr: 14800, color: '#991B1B', bg: 'bg-red-800', text: 'text-red-300', desc: 'Score 86-100: Catastrophic standstill' },
  ];

  return (
    <div className="space-y-8">
      {/* Sovereign Executive Briefing Bar */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-950 border border-blue-900/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-wide">National Infrastructure Portfolio Briefing</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono-data font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                MoSPI PAIMANA v4.2 Certified
              </span>
              <ModeBadge mode="observed" />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Supervision Scope: 1,981 Central Mega Projects (₹150 Cr+) · Anticipated Capital: <span className="font-mono-data text-slate-200">₹42.78 Lakh Crore</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button 
            onClick={() => window.print()}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            Export Cabinet Note (PDF)
          </button>
          <button 
            onClick={() => navigate('/alerts')}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25 transition-all"
          >
            <Calendar className="w-3.5 h-3.5" />
            Review Ministerial Directives
          </button>
        </div>
      </div>

      {/* Top Metric Ribbon — 4 Executive Macro Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Monitored Mega Assets"
          value={formatNumber(data?.total_projects || 1981)}
          subtitle="1,540 Active · 441 Near-Completion"
          icon={<Building2 className="w-5 h-5" />}
          accentColor="blue"
        />
        <MetricCard
          title="Critical Capital-at-Risk"
          value={formatNumber((data?.critical_projects_count || 81) + (data?.high_risk_projects_count || 158))}
          subtitle="12.1% of national portfolio assets"
          delta="▲ +8 new this cycle"
          deltaType="negative"
          icon={<AlertTriangle className="w-5 h-5" />}
          accentColor="red"
          pulse={true}
        />
        <MetricCard
          title="Capital Escalation Exposure"
          value="₹42,780 Cr"
          subtitle="Original: ₹3,85,000 Cr (+11.5% variance)"
          delta="+₹6,120 Cr Q-o-Q"
          deltaType="negative"
          icon={<TrendingUp className="w-5 h-5" />}
          accentColor="amber"
        />
        <MetricCard
          title="Schedule Delay Exposure"
          value="14.2 Months"
          subtitle="Average national slippage vs target"
          delta="+1.4 Mo velocity / Qtr"
          deltaType="negative"
          icon={<Clock className="w-5 h-5" />}
          accentColor="cyan"
        />
      </div>

      {/* Row 2: Portfolio Risk Band Distribution + Sector Capital Exposure Bubble */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: 5-Tier Portfolio Risk Spread */}
        <div className="lg:col-span-5 glass-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">Portfolio Risk Band Distribution</h3>
                <p className="text-xs text-slate-400">Capital volume locked by 5-Tier Risk Classification</p>
              </div>
              <ModeBadge mode="predicted" />
            </div>

            {/* Segmented Risk Progress Strip */}
            <div className="w-full h-4 rounded-full overflow-hidden flex my-4 bg-slate-800 border border-slate-700/50 p-0.5">
              {riskBands.map((band) => (
                <div
                  key={band.label}
                  style={{ width: `${band.pct}%`, backgroundColor: band.color }}
                  title={`${band.label}: ${band.pct}% (${formatCurrency(band.capitalCr)})`}
                  className="h-full first:rounded-l-full last:rounded-r-full hover:opacity-80 transition-opacity cursor-pointer"
                  onClick={() => setSelectedBand(selectedBand === band.label ? null : band.label)}
                />
              ))}
            </div>

            {/* Detailed Risk Band Legend with ₹ Cr */}
            <div className="space-y-2.5 mt-2">
              {riskBands.map((band) => {
                const isSelected = selectedBand === band.label;
                return (
                  <div
                    key={band.label}
                    onClick={() => setSelectedBand(isSelected ? null : band.label)}
                    className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-slate-800/90 border-blue-500 shadow-md' 
                        : 'bg-slate-800/30 border-slate-700/30 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${band.bg}`} />
                      <div>
                        <span className="text-xs font-semibold text-slate-200">{band.label}</span>
                        <p className="text-[10px] text-slate-400">{band.desc}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <span className="text-xs font-mono-data font-bold text-white">{band.count}</span>
                        <span className="text-[10px] text-slate-400 font-mono-data">({band.pct}%)</span>
                      </div>
                      <span className={`text-[11px] font-mono-data font-semibold ${band.text}`}>
                        {formatCurrency(band.capitalCr)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-700/40 flex items-center justify-between text-xs text-slate-400">
            <span>High + Critical Exposure:</span>
            <span className="font-mono-data font-bold text-red-400">₹51,600 Cr (239 Projects)</span>
          </div>
        </div>

        {/* Right: Sector Risk & Capital at Risk Bubble Chart */}
        <div className="lg:col-span-7 glass-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">Sector Risk & Capital Exposure</h3>
                <p className="text-xs text-slate-400">
                  X: Monitored Projects · Y: Avg Risk Score (0-100) · Bubble Size: Sanctioned Capital (₹ Cr)
                </p>
              </div>
              <button 
                onClick={() => navigate('/analytics')}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
              >
                Deep Sector Analytics <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="h-[250px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 15, right: 25, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis 
                    type="number" 
                    dataKey="x" 
                    name="Projects" 
                    unit=" Proj"
                    tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'JetBrains Mono' }} 
                    axisLine={{ stroke: '#334155' }} 
                  />
                  <YAxis 
                    type="number" 
                    dataKey="y" 
                    name="Avg Risk" 
                    domain={[20, 80]}
                    tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'JetBrains Mono' }} 
                    axisLine={{ stroke: '#334155' }} 
                  />
                  <ZAxis type="number" dataKey="z" range={[80, 550]} name="Capital (₹ Cr)" />
                  <Tooltip
                    content={({ payload }) => {
                      if (!payload || !payload.length) return null;
                      const item = payload[0].payload;
                      return (
                        <div className="p-3 rounded-lg bg-slate-900 border border-slate-700 shadow-2xl text-xs space-y-1.5 font-sans">
                          <p className="font-bold text-white text-sm">{item.name}</p>
                          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-slate-300 pt-1 border-t border-slate-800">
                            <span>Projects: <strong className="text-white font-mono-data">{item.x}</strong></span>
                            <span>Avg Risk: <strong className="text-orange-400 font-mono-data">{item.y}</strong></span>
                            <span>Capital: <strong className="text-blue-400 font-mono-data">{item.cost}</strong></span>
                            <span>Avg Delay: <strong className="text-amber-400 font-mono-data">{item.avgDelay}</strong></span>
                          </div>
                          <div className="pt-1 text-[11px] text-red-400 flex items-center gap-1 font-semibold">
                            <ShieldAlert className="w-3 h-3" /> {item.criticalCount} Critical Assets Flagged
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Scatter data={sectorScatterData} fill="#3B82F6" fillOpacity={0.75} stroke="#60A5FA" strokeWidth={1.5} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-800/80 text-[11px]">
            <div className="bg-slate-800/40 p-2 rounded border border-slate-700/40">
              <span className="text-slate-400 block">Highest Exposure:</span>
              <strong className="text-slate-200">Roads (₹1.42L Cr)</strong>
            </div>
            <div className="bg-slate-800/40 p-2 rounded border border-slate-700/40">
              <span className="text-slate-400 block">Longest Avg Delay:</span>
              <strong className="text-amber-400 font-mono-data">Railways (18.2 Mo)</strong>
            </div>
            <div className="bg-slate-800/40 p-2 rounded border border-slate-700/40">
              <span className="text-slate-400 block">Fastest Execution:</span>
              <strong className="text-emerald-400">Civil Aviation</strong>
            </div>
            <div className="bg-slate-800/40 p-2 rounded border border-slate-700/40">
              <span className="text-slate-400 block">Immediate Focus:</span>
              <strong className="text-red-400 font-mono-data">86 Chokepoints</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Top Rapidly Deteriorating Mega Projects Leaderboard */}
      <div className="glass-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide">Top Rapidly Deteriorating Mega-Projects</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-950/60 text-red-400 border border-red-800">
                Δ Risk ≥ +30 pts in 60 Days
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Identified by INFRALYTIX Acceleration Vector Engine — requires inter-ministerial intervention
            </p>
          </div>

          <button 
            onClick={() => navigate('/projects')}
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold self-start sm:self-auto"
          >
            Explore All 1,981 Assets <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {deterioratingProjects.map((proj) => {
            const traj = getTrajectoryInfo(proj.trajectory);
            return (
              <div 
                key={proj.id}
                onClick={() => navigate(`/projects/${proj.id}`)}
                className="group p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/70 border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
              >
                {/* Project Identification */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs font-mono-data font-bold text-blue-400 bg-blue-950/40 px-2 py-0.5 rounded border border-blue-800/40">
                      {proj.id}
                    </span>
                    <span className="text-xs font-semibold text-slate-300">{proj.agency}</span>
                    <span className="text-xs text-slate-500">·</span>
                    <span className="text-xs text-slate-400 truncate">{proj.state}</span>
                    <span className="text-xs text-slate-500">·</span>
                    <span className="text-xs text-slate-400 truncate">Contractor: {proj.contractor}</span>
                  </div>

                  <h4 className="text-sm font-semibold text-slate-100 group-hover:text-blue-300 transition-colors">
                    {proj.name}
                  </h4>

                  {/* Root Cause Driver */}
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-rose-300/90">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                    <span className="truncate">{proj.primaryBottleneck}</span>
                  </div>
                </div>

                {/* Metrics Matrix */}
                <div className="flex flex-wrap items-center gap-4 lg:gap-6 self-end lg:self-center">
                  <div className="text-right">
                    <span className="text-[10px] uppercase text-slate-400 block">Anticipated Cost</span>
                    <span className="text-xs font-mono-data font-bold text-white">{formatCurrency(proj.anticipatedCost)}</span>
                    <span className="text-[10px] text-red-400 block font-mono-data">+{proj.escalationPct}% escalation</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase text-slate-400 block">Slippage</span>
                    <span className="text-xs font-mono-data font-bold text-amber-400">+{proj.delayMonths} Months</span>
                    <span className="text-[10px] text-slate-400 block font-mono-data">Target Lapsed</span>
                  </div>

                  {/* Acceleration Delta */}
                  <div className="text-right">
                    <span className="text-[10px] uppercase text-slate-400 block">Risk Velocity (60d)</span>
                    <div className="flex items-center gap-1.5 justify-end">
                      <span className="text-xs font-mono-data text-slate-400">{proj.initialRisk}</span>
                      <span className="text-xs text-slate-500">→</span>
                      <span className="text-xs font-mono-data font-bold text-red-400">{proj.currentRisk}</span>
                      <span className="text-xs font-semibold text-red-400 font-mono-data">(+{proj.deltaRisk})</span>
                    </div>
                    <span className={`text-[10px] font-semibold ${traj.color} flex items-center justify-end gap-0.5`}>
                      {traj.icon} {traj.label}
                    </span>
                  </div>

                  <RiskBadge riskScore={proj.currentRisk} />

                  <button className="hidden sm:flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 group-hover:bg-blue-600 text-slate-300 group-hover:text-white transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Row 4: High-Priority Cabinet Directive Action Box */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 to-blue-950/40 border border-slate-700/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Immediate Policy Countermeasures Recommended (This Week)
            </h4>
            <p className="text-xs text-slate-300 mt-1">
              • <strong>MoRTH / NHAI</strong>: Convene Special Secretary-level clearance taskforce for Maharashtra Forest RoW at KM 142.4 (Est. capital unlock: ₹1,180 Cr).
              <br />
              • <strong>Railways</strong>: Invoke Section 20E expedited land acquisition for Son Nagar–Dankuni feeder corridor to avert ₹2,380 Cr restructuring.
            </p>
          </div>
        </div>

        <button 
          onClick={() => navigate('/interventions')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-colors flex-shrink-0"
        >
          Open Prescriptive Decision Engine <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
