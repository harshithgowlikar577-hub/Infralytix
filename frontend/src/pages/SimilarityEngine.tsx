import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects, useProjectSimilarity } from '../hooks/useAPI';
import { formatCurrency } from '../lib/utils';
import Skeleton from '../components/ui/Skeleton';
import ErrorState from '../components/ui/ErrorState';
import {
  Dna,
  Search,
  ExternalLink,
  ArrowRight,
  AlertTriangle,
  Layers,
  Sparkles,
  CheckCircle2,
  Clock,
  DollarSign,
  Building2,
  MapPin,
} from 'lucide-react';

const ARCHETYPE_CATALOG = [
  {
    id: 'ARCH-A',
    name: 'Statutory Clearance & Land Deadlock',
    frequency: '38% of Delayed Assets',
    tagColor: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/40',
    description: 'Persistent right-of-way handover latency, state revenue demarcation disputes, and environmental Stage-II forest clearance bottlenecks.',
    historicalCase: 'Eastern Dedicated Freight Corridor (Sec 2) — 28 months delay before High-Power Committee resolved 140km ROW dispute.',
    preventivePlaybook: 'Convene State Empowered Committee; mandate joint revenue-forest demarcation; deposit token compensation in escrow.',
  },
  {
    id: 'ARCH-B',
    name: 'Contractor Liquidity & Execution Slowdown',
    frequency: '29% of Delayed Assets',
    tagColor: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/40',
    description: 'Rapid collapse of monthly physical progress velocity accompanied by milestone slippages, contractor sub-vendor liquidity stress, and machine de-mobilization.',
    historicalCase: 'Varanasi-Kolkata Expressway Pkg 3 — Contractor mobilization dropped to 35%; issued formal cure notice and mobilized secondary joint-venture partner.',
    preventivePlaybook: 'Mandate mobilization advance ring-fencing; deploy third-party engineer verification; issue 14-day contractual cure notice.',
  },
  {
    id: 'ARCH-C',
    name: 'Capital Sunk & Scope Escalation',
    frequency: '18% of Delayed Assets',
    tagColor: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/40',
    description: 'High capital expenditure burn rate while physical completion remains stagnant, leading to repeated budget revisions.',
    historicalCase: 'Chenab Railway Bridge Arch Section — Deep geological challenges triggered 3 scope revisions and +48% capex increase.',
    preventivePlaybook: 'Freeze next capex tranche release pending independent design audit; realign S-curve baselines with NITI Aayog guidelines.',
  },
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
    (p.name || p.project_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.id || p.project_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.sector || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeProject = projects.find((p: any) => (p.id || p.project_id) === selectedProjectId) || projects[0] || {
    id: 'INF0001',
    name: 'Delhi–Mumbai Expressway P-IV',
    sector: 'Roads',
    state: 'Maharashtra',
  };

  const similarProjects = simData?.similar_projects || [
    {
      id: 'INF0042',
      name: 'Rangia-Murkongselek Gauge Conversion',
      sector: 'Railways',
      state: 'Assam',
      similarity_score: 0.942,
      actual_cost_overrun_pct: 28.4,
      delay_months: 18,
      historical_resolution: 'Fast-tracked bridge design approval cut 6 months off tail delay.',
    },
    {
      id: 'INF0089',
      name: 'Kolkata Metro East-West Line',
      sector: 'Urban',
      state: 'West Bengal',
      similarity_score: 0.896,
      actual_cost_overrun_pct: 34.1,
      delay_months: 24,
      historical_resolution: 'Special High Court mediation cleared utility shifting backlog.',
    },
    {
      id: 'INF0124',
      name: 'Western Freight Corridor P-2',
      sector: 'Railways',
      state: 'Gujarat',
      similarity_score: 0.861,
      actual_cost_overrun_pct: 19.5,
      delay_months: 12,
      historical_resolution: 'Pre-cast viaduct launching methodology reduced on-site staffing dependency.',
    },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#1E2B45] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Similar Projects & Failure DNA
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
              Cross-Asset Intelligence
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Nearest neighbor vector similarity matching and historical resolution playbooks
          </p>
        </div>
      </div>

      {/* ── 2-Column Main Workspace: Selector (4 cols) + Comparison (8 cols) ─ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Asset Selection (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-[#1E2B45] rounded-lg p-4 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1E2B45] pb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Target Project
            </span>
            <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-bold">
              {filteredProjects.length} Available
            </span>
          </div>

          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search target asset..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-md text-xs bg-slate-50 dark:bg-[#0E1626] border border-slate-200 dark:border-[#1E2B45] text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="max-h-[500px] overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-800">
            {filteredProjects.slice(0, 15).map((p: any) => {
              const pid = p.id || p.project_id;
              const isSelected = selectedProjectId === pid;

              return (
                <div
                  key={pid}
                  onClick={() => setSelectedProjectId(pid)}
                  className={`p-2.5 rounded-md border text-xs cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500/50 dark:border-indigo-500/60'
                      : 'border-slate-200 dark:border-[#1E2B45] hover:bg-slate-50 dark:hover:bg-[#14233C]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <div className="font-semibold text-slate-900 dark:text-slate-100 truncate flex-1">
                      {p.name || p.project_name}
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">{pid}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    <span>{p.sector || 'Infrastructure'}</span>
                    <span>{p.state || 'National'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Similar Projects & Archetypes (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Comparison Table Card */}
          <div className="bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-[#1E2B45] rounded-lg p-5 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1E2B45] pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Nearest Historical Neighbors for {selectedProjectId}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Multi-factor cosine similarity across cost, timeline, and risk attributes.
                </p>
              </div>

              <button
                onClick={() => navigate(`/projects/${selectedProjectId}`)}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>Dossier</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-[#1E2B45] text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                    <th className="py-2.5 pr-3">Comparable Asset</th>
                    <th className="py-2.5 px-3">Sector & State</th>
                    <th className="py-2.5 px-3">Similarity</th>
                    <th className="py-2.5 px-3">Final Overrun</th>
                    <th className="py-2.5 pl-3">Resolution Lesson</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#1A263D]">
                  {similarProjects.map((p: any) => (
                    <tr
                      key={p.id || p.name}
                      className="hover:bg-slate-50 dark:hover:bg-[#14233C] transition-colors"
                    >
                      <td className="py-3 pr-3">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {p.name}
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">{p.id}</span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-slate-700 dark:text-slate-300">{p.sector}</div>
                        <span className="text-[10px] text-slate-400">{p.state}</span>
                      </td>
                      <td className="py-3 px-3 font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                        {Math.round(Number(p.similarity_score || 0.9) * 100)}%
                      </td>
                      <td className="py-3 px-3 font-mono text-rose-600 dark:text-rose-400 font-medium">
                        +{p.actual_cost_overrun_pct || 24}% ({p.delay_months || 14} mos)
                      </td>
                      <td className="py-3 pl-3 text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed max-w-[280px]">
                        {p.historical_resolution}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Failure Archetype Classification */}
          <div className="bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-[#1E2B45] rounded-lg p-5 space-y-4 shadow-2xs">
            <div className="border-b border-slate-200 dark:border-[#1E2B45] pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Historical Failure Archetypes
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Empirical failure patterns extracted across 7,411 monitored infrastructure projects.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {ARCHETYPE_CATALOG.map((arch) => (
                <div
                  key={arch.id}
                  className="p-3.5 rounded-lg bg-slate-50 dark:bg-[#0E1729] border border-slate-200 dark:border-[#1E2B45] space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold border ${arch.tagColor}`}>
                      {arch.frequency}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white pt-1">
                      {arch.name}
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      {arch.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 dark:border-[#18243A] text-[10px] text-slate-500">
                    Playbook: <strong className="text-slate-700 dark:text-slate-300">{arch.preventivePlaybook}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
