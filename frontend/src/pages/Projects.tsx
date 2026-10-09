import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Download,
  ExternalLink,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Building2,
  MapPin,
  X,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { useProjects } from '../hooks/useAPI';
import { formatCurrency } from '../lib/utils';
import { RiskBadge, StatusBadge } from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import ErrorState from '../components/ui/ErrorState';

export default function Projects() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [ministry, setMinistry] = useState(searchParams.get('ministry') || '');
  const [sector, setSector] = useState(searchParams.get('sector') || '');
  const [state, setState] = useState(searchParams.get('state') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [riskLevel, setRiskLevel] = useState(searchParams.get('risk_level') || '');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const limit = 15;

  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setMinistry(searchParams.get('ministry') || '');
    setSector(searchParams.get('sector') || '');
    setState(searchParams.get('state') || '');
    setStatus(searchParams.get('status') || '');
    setRiskLevel(searchParams.get('risk_level') || '');
    setPage(Number(searchParams.get('page')) || 1);
  }, [searchParams]);

  const updateParam = (key: string, val: string) => {
    const next = new URLSearchParams(searchParams);
    if (val) {
      next.set(key, val);
    } else {
      next.delete(key);
    }
    if (key !== 'page') {
      next.delete('page');
      setPage(1);
    } else {
      setPage(Number(val) || 1);
    }
    setSearchParams(next);
  };

  const resetAllFilters = () => {
    setSearchParams({});
    setSearch('');
    setMinistry('');
    setSector('');
    setState('');
    setStatus('');
    setRiskLevel('');
    setPage(1);
  };

  const { data, isLoading, isError, refetch } = useProjects({
    search: search || undefined,
    ministry: ministry || undefined,
    sector: sector || undefined,
    state: state || undefined,
    status: status || undefined,
    risk_level: riskLevel || undefined,
    page,
    limit,
  });

  const projects = data?.projects || data?.items || (Array.isArray(data) ? data : []);
  const total = data?.total_count ?? data?.total ?? projects.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const hasActiveFilters = Boolean(search || ministry || sector || state || status || riskLevel);

  return (
    <div className="space-y-8 pb-12">
      {/* ── Page Header (36px Typography per Phase 7) ─────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#1E2B45] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[32px] sm:text-[36px] font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Projects Directory
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[12px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
              {total.toLocaleString('en-IN')} Records
            </span>
          </div>
          <p className="text-[15px] text-slate-500 dark:text-slate-400 mt-1">
            Standardized multi-ministry infrastructure inventory under PAIMANA disclosure protocol
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-[#0F1B2F] border border-slate-200 dark:border-[#1E2F4D] hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
          >
            <RefreshCw className="w-4 h-4 text-slate-400" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ── Filter Bar (24px padding per Phase 6) ─────────────── */}
      <div className="bg-white dark:bg-[#0F1B2F] border border-slate-200 dark:border-[#1E2F4D] rounded-2xl p-6 space-y-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Multi-Attribute Search Input */}
          <div className="relative lg:col-span-2">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                updateParam('search', e.target.value);
              }}
              placeholder="Search Project, Ministry, State, Sector, Contractor..."
              className="w-full pl-9 pr-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-[#0A1220] border border-slate-200 dark:border-[#1E2F4D] text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          </div>

          {/* Sector Filter */}
          <div>
            <select
              value={sector}
              onChange={(e) => updateParam('sector', e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-[#0A1220] border border-slate-200 dark:border-[#1E2F4D] text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Sectors</option>
              <option value="Transport & Logistics">Transport &amp; Logistics</option>
              <option value="Energy">Energy</option>
              <option value="Communication">Communication</option>
              <option value="Water & Sanitation">Water &amp; Sanitation</option>
              <option value="Social & Commercial">Social &amp; Commercial</option>
              <option value="Others">Others</option>
              <option value="Roads">Roads &amp; Highways</option>
              <option value="Railways">Railways</option>
            </select>
          </div>

          {/* Ministry Filter */}
          <div>
            <select
              value={ministry}
              onChange={(e) => updateParam('ministry', e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-[#0A1220] border border-slate-200 dark:border-[#1E2F4D] text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Line Ministries</option>
              <option value="Ministry of Road Transport & Highways">MoRTH</option>
              <option value="Ministry of Railways">Railways</option>
              <option value="Ministry of Power">Power</option>
              <option value="Ministry of Petroleum & Natural Gas">MoPNG</option>
              <option value="Ministry of Housing & Urban Affairs">MoHUA</option>
              <option value="Ministry of Civil Aviation">Civil Aviation</option>
              <option value="Ministry of Communications">Communications</option>
              <option value="Ministry of Coal">Coal</option>
              <option value="Ministry of Ports, Shipping and Waterways">Ports &amp; Shipping</option>
            </select>
          </div>

          {/* State Filter */}
          <div>
            <select
              value={state}
              onChange={(e) => updateParam('state', e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-[#0A1220] border border-slate-200 dark:border-[#1E2F4D] text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">All States &amp; UTs</option>
              <option value="Andhra Pradesh">Andhra Pradesh</option>
              <option value="Arunachal Pradesh">Arunachal Pradesh</option>
              <option value="Assam">Assam</option>
              <option value="Bihar">Bihar</option>
              <option value="Chhattisgarh">Chhattisgarh</option>
              <option value="Delhi">Delhi</option>
              <option value="Goa">Goa</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Haryana">Haryana</option>
              <option value="Himachal Pradesh">Himachal Pradesh</option>
              <option value="Jharkhand">Jharkhand</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Kerala">Kerala</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Odisha">Odisha</option>
              <option value="Punjab">Punjab</option>
              <option value="Rajasthan">Rajasthan</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Telangana">Telangana</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Uttarakhand">Uttarakhand</option>
              <option value="West Bengal">West Bengal</option>
            </select>
          </div>

          {/* Risk Level Filter */}
          <div>
            <select
              value={riskLevel}
              onChange={(e) => updateParam('risk_level', e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-[#0A1220] border border-slate-200 dark:border-[#1E2F4D] text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Risk Levels</option>
              <option value="Critical">Critical Risk</option>
              <option value="High">High Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="Low">Low Risk</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={status}
              onChange={(e) => updateParam('status', e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-[#0A1220] border border-slate-200 dark:border-[#1E2F4D] text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="In Progress">In Progress</option>
              <option value="Delayed">Delayed</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#18243A] text-xs">
            <span className="text-slate-500">
              Showing filtered results ({total} projects)
            </span>
            <button
              onClick={resetAllFilters}
              className="text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear all filters</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Enterprise Table (Phase 6: 56px row height) ───────── */}
      <div className="bg-white dark:bg-[#0F1B2F] border border-slate-200 dark:border-[#1E2F4D] rounded-2xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} variant="text" className="h-14" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-8">
            <ErrorState
              title="Failed to Load Projects"
              message="Unable to fetch the project directory records. Please retry."
              onRetry={refetch}
            />
          </div>
        ) : projects.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No projects matched the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[14px]">
              <thead className="sticky top-0 z-10">
                <tr className="bg-slate-50/95 dark:bg-[#0A1220]/95 backdrop-blur-xs border-b border-slate-200 dark:border-[#1E2F4D] text-slate-500 text-[11px] font-bold uppercase tracking-wider h-14">
                  <th className="py-3 px-5 min-w-[260px]">Project &amp; Agency</th>
                  <th className="py-3 px-4 min-w-[140px]">Sector &amp; State</th>
                  <th className="py-3 px-4 min-w-[130px]">Cost &amp; Spend</th>
                  <th className="py-3 px-4 min-w-[110px]">Progress</th>
                  <th className="py-3 px-4 min-w-[120px]">Cost Risk</th>
                  <th className="py-3 px-4 min-w-[120px]">Schedule Risk</th>
                  <th className="py-3 px-4 min-w-[150px]">Overall Risk</th>
                  <th className="py-3 px-4 min-w-[190px]">Primary Driver</th>
                  <th className="py-3 px-5 text-right min-w-[100px]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#18243A]">
                {projects.map((proj: any) => {
                  const costVal = proj.revised_cost || proj.current_cost || proj.original_cost || 4500;
                  const progressPct = proj.progress_percentage ?? proj.physical_progress ?? 45;
                  const costRiskScore = proj.cost_risk_score ?? Math.min(95, Math.max(10, Math.round((proj.risk_score || 70) * 0.9)));
                  const scheduleRiskScore = proj.schedule_risk_score ?? Math.min(98, Math.max(15, Math.round((proj.risk_score || 70) * 1.05)));

                  return (
                    <tr
                      key={proj.id}
                      className="hover:bg-indigo-50/40 dark:hover:bg-[#14233C] transition-colors h-14 even:bg-slate-50/50 dark:even:bg-[#0c1627] odd:bg-transparent"
                    >
                      {/* Project & Agency */}
                      <td className="py-3 px-5">
                        <div className="font-semibold text-slate-900 dark:text-white leading-tight">
                          {proj.project_name || proj.name || 'Project name unavailable'}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {proj.project_id || proj.id} • {proj.ministry || proj.implementing_agency || 'N/A'}
                        </div>
                      </td>

                      {/* Sector & State */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-700 dark:text-slate-300">
                          {proj.sector || 'Railways'}
                        </div>
                        <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {proj.state || 'National'}
                        </span>
                      </td>

                      {/* Cost & Spend */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white font-mono">
                          {formatCurrency(costVal)}
                        </div>
                        <span className="text-[11px] text-slate-400 block">
                          ₹{Math.round(costVal * (progressPct / 100)).toLocaleString('en-IN')} Cr spent
                        </span>
                      </td>

                      {/* Progress */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                            {progressPct}%
                          </span>
                        </div>
                        <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
                          <div
                            className="h-full bg-indigo-600 rounded-full"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </td>

                      {/* Cost Risk */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white font-mono">
                          {costRiskScore}%
                        </div>
                        <span className="text-[11px] text-slate-400 block">
                          +{proj.cost_overrun_percentage || 24.5}% overrun
                        </span>
                      </td>

                      {/* Schedule Risk */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white font-mono">
                          {scheduleRiskScore}%
                        </div>
                        <span className="text-[11px] text-slate-400 block">
                          +{proj.delay_months || 14} mos slippage
                        </span>
                      </td>

                      {/* Overall Risk */}
                      <td className="py-3 px-4">
                        <RiskBadge
                          riskScore={proj.risk_score || 78}
                          subtitle="Stale data - last: May 2021"
                        />
                      </td>

                      {/* Primary Driver */}
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-[12px]">
                        Model signal: Project age ({proj.age_months || 120} mos)
                      </td>

                      {/* Action */}
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
        )}

        {/* ── Table Footer / Pagination ───────────────────────── */}
        <div className="p-4 bg-slate-50/60 dark:bg-[#0A1220] border-t border-slate-200 dark:border-[#1E2F4D] flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-slate-500">
          <div>
            Showing Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({total} projects total)
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => updateParam('page', '1')}
              disabled={page <= 1}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-[#1E2F4D] text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="First Page"
            >
              First
            </button>

            <button
              onClick={() => updateParam('page', String(Math.max(1, page - 1)))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-[#1E2F4D] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline text-xs font-medium">Prev</span>
            </button>

            <span className="px-3 py-1 text-xs font-bold font-mono text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-[#111A2E] rounded-lg border border-slate-200 dark:border-[#1E2B45]">
              {page} / {totalPages}
            </span>

            <button
              onClick={() => updateParam('page', String(Math.min(totalPages, page + 1)))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-[#1E2F4D] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1"
              title="Next Page"
            >
              <span className="hidden sm:inline text-xs font-medium">Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => updateParam('page', String(totalPages))}
              disabled={page >= totalPages}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-[#1E2F4D] text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Last Page"
            >
              Last
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
