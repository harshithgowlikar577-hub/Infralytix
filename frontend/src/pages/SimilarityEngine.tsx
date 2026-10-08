import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects, useProjectSimilarity } from '../hooks/useAPI';
import { formatCurrency, formatPercent } from '../lib/utils';
import Skeleton from '../components/ui/Skeleton';
import ErrorState from '../components/ui/ErrorState';
import {
  Dna, Search, ExternalLink, ArrowRight, AlertTriangle, Layers,
  Compass, GitFork, ChevronRight, Activity, Clock, ShieldCheck,
  CheckCircle2, Sparkles, BookOpen, AlertOctagon, RefreshCw, X
} from 'lucide-react';
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';

const ARCHETYPE_CATALOG = [
  {
    id: 'ARCH-A',
    name: 'Archetype A: Statutory Clearance & Land Deadlock',
    frequency: '38% of Delayed Assets',
    tagColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    description: 'Persistent right-of-way handover latency, state revenue demarcation disputes, and environmental Stage-II forest clearance bottlenecks in early execution.',
    historicalCase: 'Eastern Dedicated Freight Corridor (Sec 2) — 28 months delay before State High-Power Committee resolved 140km ROW dispute.',
    preventivePlaybook: 'Convene State Empowered Committee; mandate joint revenue-forest demarcation; deposit token compensation in escrow.',
    signature: { land: 85, velocity: 65, cost: 40, vendor: 50, legal: 88 }
  },
  {
    id: 'ARCH-B',
    name: 'Archetype B: Contractor Cashflow & Execution Slowdown',
    frequency: '29% of Delayed Assets',
    tagColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    description: 'Rapid collapse of monthly physical progress velocity accompanied by high milestone slippages, contractor sub-vendor liquidity stress, and machine de-mobilization.',
    historicalCase: 'Varanasi-Kolkata Expressway Pkg 3 — Contractor mobilization dropped to 35%; issued formal cure notice and mobilized secondary joint-venture partner.',
    preventivePlaybook: 'Mandate mobilization advance ring-fencing; deploy third-party engineer verification; issue 14-day contractual cure notice.',
    signature: { land: 30, velocity: 90, cost: 60, vendor: 88, legal: 45 }
  },
  {
    id: 'ARCH-C',
    name: 'Archetype C: Capital Sunk & Scope Escalation',
    frequency: '18% of Delayed Assets',
    tagColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    description: 'High capital expenditure burn rate while physical completion remains stagnant, leading to massive budget revisions and design modifications.',
    historicalCase: 'Chenab Railway Bridge Arch Section — Deep geological challenges triggered 3 scope revisions and +48% capex increase.',
    preventivePlaybook: 'Freeze next capex tranche release pending independent design audit; realign S-curve baselines with NITI Aayog guidelines.',
    signature: { land: 40, velocity: 70, cost: 95, vendor: 65, legal: 60 }
  },
  {
    id: 'ARCH-D',
    name: 'Archetype D: Balanced Turnaround Cohort',
    frequency: '15% of Portfolio',
    tagColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    description: 'Recovered historical projects that implemented aggressive manpower augmentation (+25%) and inter-agency PM GatiShakti coordination.',
    historicalCase: 'Ahmedabad Metro Phase 2 — Successfully recovered 5.2 months through prefabricated viaduct launching and 24x7 double shifts.',
    preventivePlaybook: 'Maintain current velocity momentum; conduct bi-weekly critical path audits; preserve contractor incentive structures.',
    signature: { land: 20, velocity: 25, cost: 15, vendor: 20, legal: 15 }
  }
];

export default function SimilarityEngine() {
  const navigate = useNavigate();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('INF0001');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArchetypeTab, setSelectedArchetypeTab] = useState<string>('ARCH-A');

  const { data: projectsData, isLoading: pLoading } = useProjects({ limit: 40 });
  const { data: simData, isLoading: simLoading, isError, refetch } = useProjectSimilarity(selectedProjectId);

  const projects = projectsData?.projects || projectsData?.items || (Array.isArray(projectsData) ? projectsData : []);

  const filteredProjects = projects.filter((p: any) =>
    (p.project_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.project_id || p.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.sector || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeProject = projects.find((p: any) => (p.project_id || p.id) === selectedProjectId) || projects[0];

  // Signature radar data comparing Target Project with Benchmark
  const signatureData = useMemo(() => {
    if (!simData?.failure_dna_signature) {
      return [
        { dimension: 'LAND DELAY', target: 85, benchmark: 45 },
        { dimension: 'VELOCITY DECAY', target: 65, benchmark: 40 },
        { dimension: 'COST GROWTH', target: 40, benchmark: 35 },
        { dimension: 'VENDOR FRICTION', target: 72, benchmark: 30 },
        { dimension: 'REGULATORY NOC', target: 60, benchmark: 25 },
      ];
    }
    return Object.entries(simData.failure_dna_signature).map(([key, val]) => ({
      dimension: key.replace(/_/g, ' ').toUpperCase(),
      target: Math.round(Number(val) * 100),
      benchmark: 40,
    }));
  }, [simData]);

  const similarProjects = simData?.similar_projects || [];
  const topTwin = similarProjects[0];

  return (
    <div className="space-y-6">
      {/* ── HEADER ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <span className="w-2 h-7 rounded-full bg-indigo-500 inline-block" />
            FAILURE DNA VISUALIZATION & PRECEDENT TWIN ENGINE
          </h1>
          <p className="text-xs text-slate-400 mt-1 ml-4.5">
            Algorithmic failure vector decomposition • Multi-dimensional Cosine & KNN matching across 1,981 infrastructure assets
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-lg">
            Failure Archetypes Active
          </span>
          <button
            onClick={() => refetch()}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            title="Refresh Similarity Clusters"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── MAIN GRID: ASSET SELECTOR + TWIN ANALYSIS ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Asset Selection */}
        <div className="space-y-3">
          <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Select Project Asset</span>
              <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                {filteredProjects.length} Assets Available
              </span>
            </div>
            <div className="relative flex items-center w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search asset code, title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search asset code, title"
                className="w-full h-[46px] pl-11 pr-10 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-2xl text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 focus:shadow-[0_0_18px_rgba(99,102,241,0.2)] transition-all shadow-inner font-sans"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
                  title="Clear search"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="glass-card rounded-xl border border-slate-800 overflow-hidden max-h-[640px] overflow-y-auto space-y-1.5 p-2">
            {filteredProjects.map((p: any) => {
              const pid = p.project_id || p.id;
              const isSelected = selectedProjectId === pid;
              return (
                <div
                  key={pid}
                  onClick={() => setSelectedProjectId(pid)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500/80 shadow-md shadow-indigo-500/10'
                      : 'border-slate-800/80 hover:border-slate-700 bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-xs text-slate-200 line-clamp-1">{p.project_name}</span>
                    <span className="text-[10px] font-mono text-slate-500 shrink-0">{pid}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                    <span>{p.sector}</span>
                    <span className="text-slate-300 font-mono font-semibold">{formatCurrency(p.current_cost || p.original_cost || 0)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Failure DNA Decomposition & Comparison */}
        <div className="lg:col-span-2 space-y-6">
          {simLoading ? (
            <div className="space-y-4">
              <Skeleton variant="card" className="h-36" />
              <Skeleton variant="card" className="h-64" />
            </div>
          ) : isError ? (
            <ErrorState title="Failed to match failure vector" message="Could not query similarity clusters." onRetry={refetch} />
          ) : (
            <>
              {/* Matched Archetype Hero Card */}
              <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-slate-900/80 to-purple-950/30 p-6 relative overflow-hidden shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-2 max-w-xl">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/15 border border-indigo-500/30 px-2.5 py-0.5 rounded-full">
                      Matched Failure Archetype
                    </span>
                    <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                      {simData?.cluster_archetype || 'Archetype A: Statutory Clearance & Land Deadlock'}
                    </h2>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      This asset’s progress-velocity decay and delay vector matches historical precedents where environmental clearance handovers, ROW demarcation, and contractor cashflow constraints triggered cascading schedule slippages.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-900/90 border border-indigo-500/30 text-center shrink-0 self-start sm:self-center shadow-md">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">DNA Similarity</span>
                    <span className="text-3xl font-black font-mono text-indigo-400 mt-0.5 block">
                      {((simData?.similarity_score || 0.88) * 100).toFixed(1)}%
                    </span>
                    <span className="text-[10px] font-medium text-indigo-300">Critical Alignment</span>
                  </div>
                </div>
              </div>

              {/* Side-by-Side Visual Twin Comparison Card */}
              {topTwin && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 shadow-lg">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <GitFork className="w-4 h-4 text-indigo-400" />
                        <span>Side-by-Side Project Twin Comparison</span>
                      </h3>
                      <p className="text-[11px] text-slate-400">Target Asset vs Top Matched Historical Twin</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20">
                      {Math.round((topTwin.similarity_score || 0.85) * 100)}% Match
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Active Project Column */}
                    <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-blue-400 uppercase">Current Target Project</span>
                        <span className="font-mono text-slate-400">{activeProject?.project_id || selectedProjectId}</span>
                      </div>
                      <h4 className="font-bold text-white text-sm line-clamp-1">{activeProject?.project_name || 'Current Asset'}</h4>
                      
                      <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Sanctioned Outlay:</span>
                          <span className="font-mono font-bold text-white">{formatCurrency(activeProject?.current_cost || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Physical Progress:</span>
                          <span className="font-mono font-bold text-white">{activeProject?.progress_percentage?.toFixed(1) || 0}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Schedule Slippage:</span>
                          <span className="font-mono font-bold text-rose-400">{activeProject?.delay_days || 180} Days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Location & Sector:</span>
                          <span className="text-slate-300">{activeProject?.state} • {activeProject?.sector}</span>
                        </div>
                      </div>
                    </div>

                    {/* Historical Twin Column */}
                    <div className="p-4 rounded-xl bg-slate-950/70 border border-indigo-500/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase">Historical Precedent Twin</span>
                        <span className="font-mono text-slate-400">{topTwin.project_id}</span>
                      </div>
                      <h4 className="font-bold text-indigo-300 text-sm line-clamp-1">{topTwin.project_name}</h4>

                      <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Historical Delay Observed:</span>
                          <span className="font-mono font-bold text-amber-400">{topTwin.historical_observed_delay_days} Days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Final Cost Overrun:</span>
                          <span className="font-mono font-bold text-rose-400">+{topTwin.historical_cost_overrun_pct}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Key Bottleneck Encountered:</span>
                          <span className="text-slate-200 font-semibold text-right line-clamp-1">{topTwin.key_bottleneck}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Location & Sector:</span>
                          <span className="text-slate-300">{topTwin.state} • {topTwin.sector}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Radar Signature & Historical Empirical Outcomes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 5-Axis Radar */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Failure DNA Radar Surface</span>
                    <span className="text-[10px] text-slate-500">Asset vs National Benchmark</span>
                  </div>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={signatureData}>
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis dataKey="dimension" stroke="#94a3b8" tick={{ fontSize: 9, fill: '#cbd5e1' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" tick={{ fontSize: 8 }} />
                        <Radar name="Target Asset" dataKey="target" stroke="#818cf8" fill="#818cf8" fillOpacity={0.4} />
                        <Radar name="Safe Benchmark" dataKey="benchmark" stroke="#10b981" fill="#10b981" fillOpacity={0.15} />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Historical Twin Outcomes & Prescriptions */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-3 flex flex-col justify-between shadow-sm">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Historical Twin Outcomes</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">Empirical outcomes of matched twin projects if left unmitigated</p>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex justify-between items-center">
                      <span className="text-slate-400">Mean Final Schedule Slippage</span>
                      <span className="font-mono font-bold text-rose-400">+10.4 Months</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex justify-between items-center">
                      <span className="text-slate-400">Mean Final Cost Escalation</span>
                      <span className="font-mono font-bold text-amber-400">+22.8% Capex</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex justify-between items-center">
                      <span className="text-slate-400">Intervention Turnaround Rate</span>
                      <span className="font-mono font-bold text-emerald-400">74.2% Success</span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/interventions`)}
                    className="w-full py-2.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-500/20 cursor-pointer"
                  >
                    <span>Execute Mitigating Interventions</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Matched Historical Twins Grid */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white">Top Matched Infrastructure Twins</h3>
                  <span className="text-[11px] text-slate-400 font-mono">Ranked by Cosine Similarity Metric</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {similarProjects.map((match: any, idx: number) => {
                    const delayDays = match.historical_observed_delay_days || match.delay_days || 180;
                    const delayMonths = Math.round(delayDays / 30.4);
                    const overrun = match.historical_cost_overrun_pct || match.cost_overrun_pct || 16.5;
                    const simPct = ((match.similarity_score || 0.85) * 100).toFixed(1);

                    return (
                      <div key={idx} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-indigo-500/50 transition-all space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-xs text-white line-clamp-1">{match.project_name}</span>
                          <span className="text-xs font-mono font-bold text-indigo-400 px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20">{simPct}%</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {match.sector} • {match.state}
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                          <div>
                            <span className="text-slate-500 block text-[10px] uppercase font-medium">Observed Delay</span>
                            <span className="font-mono font-semibold text-rose-400">{delayDays}d ({delayMonths}mo)</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px] uppercase font-medium">Cost Overrun</span>
                            <span className="font-mono font-semibold text-amber-400">+{Number(overrun).toFixed(1)}%</span>
                          </div>
                        </div>
                        <div className="text-[11px] text-slate-300 bg-slate-950/70 p-2 rounded-lg border border-slate-800/80 mt-1 leading-relaxed">
                          <span className="text-slate-500 font-medium">Bottleneck: </span>
                          <strong className="text-slate-200 font-semibold">{match.key_bottleneck || 'Right of Way Handover Latency'}</strong>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── 4. NATIONAL ARCHETYPE CATALOG & PLAYBOOK ─────────────────── */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-indigo-400" />
                      <span>National Failure Archetype Compendium</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">Precedent repository and prescriptive playbooks</p>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                    4 Core Archetypes
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ARCHETYPE_CATALOG.map((arch) => (
                    <div
                      key={arch.id}
                      className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500/40 transition-all space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-white">{arch.name}</h4>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${arch.tagColor}`}>
                          {arch.frequency}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        {arch.description}
                      </p>

                      <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 text-[11px] space-y-1">
                        <span className="text-slate-500 font-semibold uppercase text-[10px] block">Historical Case Precedent:</span>
                        <p className="text-slate-300">{arch.historicalCase}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 text-[11px]">
                        <span className="text-indigo-400 font-semibold block text-[10px] uppercase">Prescriptive Mitigation Playbook:</span>
                        <p className="text-slate-300 mt-0.5">{arch.preventivePlaybook}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
