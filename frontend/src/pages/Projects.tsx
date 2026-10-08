import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useProjects } from '../hooks/useAPI';
import { formatCurrency, formatPercent, getRiskBadgeClass } from '../lib/utils';
import {
  Search, Filter, Download, ExternalLink, RefreshCw,
  ChevronLeft, ChevronRight, AlertTriangle, IndianRupee, Flag, Building2, MapPin, X,
  ArrowUpDown, ArrowUp, ArrowDown
} from 'lucide-react';
import Skeleton from '../components/ui/Skeleton';
import ErrorState from '../components/ui/ErrorState';

function StatusBadge({ status }: { status: string }) {
  const s = (status || 'ACTIVE').toUpperCase();
  const map: Record<string, { label: string; cls: string; dot: string }> = {
    'IN PROGRESS': { label: 'In Progress', cls: 'bg-blue-500/15 text-blue-400 border-blue-500/30', dot: 'bg-blue-400' },
    'ON_TRACK':    { label: 'On Track',    cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-400' },
    'COMPLETED':   { label: 'Completed',   cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-400' },
    'DELAYED':     { label: 'Delayed',     cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30', dot: 'bg-amber-400' },
    'STALLED':     { label: 'Stalled',     cls: 'bg-orange-500/15 text-orange-400 border-orange-500/30', dot: 'bg-orange-400' },
    'CRITICAL':    { label: 'Critical',    cls: 'bg-rose-500/15 text-rose-400 border-rose-500/30', dot: 'bg-rose-400' },
    'ACTIVE':      { label: 'Active',      cls: 'bg-slate-500/15 text-slate-400 border-slate-500/30', dot: 'bg-slate-400' },
  };
  const badge = map[s] || { label: status, cls: 'bg-slate-500/15 text-slate-400 border-slate-500/30', dot: 'bg-slate-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border ${badge.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
      <span>{badge.label}</span>
    </span>
  );
}

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
  const [sortField, setSortField] = useState<'name' | 'cost' | 'progress' | 'risk'>('risk');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
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
    next.delete('page');
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

  const atRiskCapital = projects.reduce((acc: number, p: any) => {
    const risk = p.risk_score ?? 0;
    const cost = p.current_cost || p.revised_cost || p.original_cost || 0;
    return risk >= 60 ? acc + cost : acc;
  }, 0);

  const toggleSort = (field: 'name' | 'cost' | 'progress' | 'risk') => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedProjects = [...projects].sort((a: any, b: any) => {
    let aVal: any = 0;
    let bVal: any = 0;
    if (sortField === 'name') {
      aVal = (a.project_name || a.name || '').toLowerCase();
      bVal = (b.project_name || b.name || '').toLowerCase();
      return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    if (sortField === 'cost') {
      aVal = a.current_cost || a.revised_cost || a.original_cost || 0;
      bVal = b.current_cost || b.revised_cost || b.original_cost || 0;
    } else if (sortField === 'progress') {
      aVal = a.progress_percentage || a.physical_progress_pct || 0;
      bVal = b.progress_percentage || b.physical_progress_pct || 0;
    } else if (sortField === 'risk') {
      aVal = a.risk_score ?? (a.risk_level === 'Critical' ? 85 : a.risk_level === 'High' ? 70 : a.risk_level === 'Medium' ? 50 : 25);
      bVal = b.risk_score ?? (b.risk_level === 'Critical' ? 85 : b.risk_level === 'High' ? 70 : b.risk_level === 'Medium' ? 50 : 25);
    }
    return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
  });

  const handleExportCSV = () => {
    if (!projects.length) return;
    const headers = ['Project Code', 'Name', 'Sector', 'Ministry', 'State', 'Cost (Cr)', 'Progress %', 'Status', 'Risk Score'];
    const rows = projects.map((p: any) => [
      `"${p.project_id || p.project_code || p.id}"`,
      `"${(p.project_name || p.name || '').replace(/"/g, '""')}"`,
      `"${p.sector || ''}"`,
      `"${p.ministry || ''}"`,
      `"${p.state || ''}"`,
      p.current_cost || p.revised_cost || p.original_cost || 0,
      p.progress_percentage || p.physical_progress_pct || 0,
      `"${p.status || ''}"`,
      p.risk_score || p.risk_level || 'N/A',
    ]);
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csv));
    link.setAttribute('download', `INFRALYTIX_Portfolio_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasFilters = !!(search || ministry || sector || state || status || riskLevel);

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-[#14233D]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
            <span>Portfolio</span>
            <span>/</span>
            <span className="text-slate-200">Surveillance Register</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>National Project Portfolio</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-blue-500/15 text-blue-400 border border-blue-500/30">
              {total.toLocaleString()} Assets
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time surveillance across all central ministries, state jurisdictions &amp; capital infrastructure sectors
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0 self-start md:self-auto">
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            title={isLoading ? "Refreshing portfolio data from server..." : "Refresh project list"}
            aria-label="Refresh project list"
            className={`px-3.5 py-2 text-xs font-bold rounded-xl bg-[#091529] hover:bg-[#0E1E38] text-slate-200 border border-[#1E3354] flex items-center gap-2 transition-all shadow-sm ${
              isLoading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isLoading ? "animate-spin" : ""}`} />
            <span>{isLoading ? "Refreshing..." : "Refresh"}</span>
          </button>
          <button
            onClick={handleExportCSV}
            disabled={!projects.length}
            title={!projects.length ? "No records available to export" : `Export current view (${projects.length} projects) as CSV`}
            aria-label="Export project list as CSV"
            className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg transition-all ${
              !projects.length
                ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50"
                : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-blue-900/30 cursor-pointer"
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-5 rounded-2xl flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">Total Monitored</div>
            <div className="text-2xl font-extrabold text-white font-mono mt-0.5">{total.toLocaleString('en-IN')}</div>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">Exposed Capital (Page)</div>
            <div className="text-2xl font-extrabold text-rose-400 font-mono mt-0.5">{formatCurrency(atRiskCapital)}</div>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Flag className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">Filter Status</div>
            <div className="text-lg font-bold text-white mt-0.5">
              {hasFilters ? <span className="text-amber-400">Filters Applied</span> : <span className="text-slate-400">All Records</span>}
            </div>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">Viewing Range</div>
            <div className="text-lg font-bold text-white font-mono mt-0.5">
              {projects.length > 0 ? `${(page - 1) * limit + 1}–${Math.min(page * limit, total)}` : '0'} <span className="text-xs text-slate-500 font-normal">of {total}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <div className="relative flex items-center w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search project name, sector, state..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  updateParam('search', e.target.value);
                }}
                aria-label="Search project name, sector, state"
                className="w-full h-[46px] pl-11 pr-10 py-2.5 text-sm bg-[#091529] border border-[#1E3354] rounded-2xl text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 focus:shadow-[0_0_18px_rgba(59,130,246,0.18)] transition-all shadow-inner font-sans"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    updateParam('search', '');
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
                  title="Clear search"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <select
            value={ministry}
            onChange={(e) => updateParam('ministry', e.target.value)}
            aria-label="Filter by Ministry"
            className="w-full px-3.5 py-2.5 text-xs bg-[#091529] border border-[#1E3354] rounded-xl text-slate-300 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
          >
            <option value="">All Ministries</option>
            <option value="Ministry of Road Transport & Highways">MoRTH (Roads & Highways)</option>
            <option value="Ministry of Railways">Ministry of Railways</option>
            <option value="Ministry of Power">Ministry of Power</option>
            <option value="Ministry of Coal">Ministry of Coal</option>
            <option value="Ministry of Petroleum & Natural Gas">Petroleum & Natural Gas</option>
            <option value="Ministry of Housing & Urban Affairs">Housing & Urban Affairs</option>
            <option value="Ministry of Civil Aviation">Civil Aviation</option>
            <option value="Ministry of Ports, Shipping and Waterways">Ports & Shipping</option>
          </select>

          <select
            value={sector}
            onChange={(e) => updateParam('sector', e.target.value)}
            aria-label="Filter by Sector"
            className="w-full px-3.5 py-2.5 text-xs bg-[#091529] border border-[#1E3354] rounded-xl text-slate-300 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
          >
            <option value="">All Sectors</option>
            <option value="Transport & Logistics">Transport & Logistics</option>
            <option value="Energy">Energy</option>
            <option value="Water & Sanitation">Water & Sanitation</option>
            <option value="Social & Commercial">Social & Commercial</option>
            <option value="Communication">Communication</option>
            <option value="Others">Others</option>
          </select>

          <select
            value={riskLevel}
            onChange={(e) => updateParam('risk_level', e.target.value)}
            aria-label="Filter by Risk Level"
            className="w-full px-3.5 py-2.5 text-xs bg-[#091529] border border-[#1E3354] rounded-xl text-slate-300 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
          >
            <option value="">All Risk Bands</option>
            <option value="Critical">Critical Risk (Score &ge; 80)</option>
            <option value="High">High Risk (Score 60–79)</option>
            <option value="Medium">Medium Risk (Score 40–59)</option>
            <option value="Low">Low Risk / Healthy (Score &lt; 40)</option>
          </select>

          <select
            value={status}
            onChange={(e) => updateParam('status', e.target.value)}
            aria-label="Filter by Project Status"
            className="w-full px-3.5 py-2.5 text-xs bg-[#091529] border border-[#1E3354] rounded-xl text-slate-300 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="In Progress">In Progress</option>
            <option value="Delayed">Delayed</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {hasFilters && (
          <div className="flex items-center justify-between pt-3 border-t border-[#14233D] text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <Filter className="w-3.5 h-3.5 text-blue-400" />
              <span>Active filters narrowed the portfolio.</span>
            </div>
            <button
              onClick={resetAllFilters}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer"
            >
              <X className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Table / States */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton variant="card" className="h-16" />
          <Skeleton variant="card" className="h-96" />
        </div>
      ) : isError ? (
        <ErrorState title="Failed to load projects" message="Could not query portfolio from backend API. Please retry or contact your administrator." onRetry={refetch} />
      ) : projects.length === 0 ? (
        <div className="glass-card p-16 text-center rounded-2xl border border-[#14233D]">
          <Search className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-200">No matching projects found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            No projects matched your specified filters. Try clearing or broadening your search criteria.
          </p>
          <button
            onClick={resetAllFilters}
            className="mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="glass-card rounded-2xl border border-[#14233D] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#050D1A]/95 sticky top-0 z-20 border-b border-[#14233D] text-slate-400 font-bold tracking-wider uppercase text-[11px]">
                  <th
                    className="py-4.5 px-6 cursor-pointer hover:text-white transition-colors select-none"
                    onClick={() => toggleSort('name')}
                    title="Sort by Project Name"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Project Asset</span>
                      {sortField === 'name' ? (
                        sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-blue-400" /> : <ArrowDown className="w-3.5 h-3.5 text-blue-400" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-500" />
                      )}
                    </div>
                  </th>
                  <th className="py-4.5 px-4">Sector &amp; Ministry</th>
                  <th className="py-4.5 px-4">Location</th>
                  <th
                    className="py-4.5 px-4 text-right cursor-pointer hover:text-white transition-colors select-none"
                    onClick={() => toggleSort('cost')}
                    title="Sort by Sanctioned Outlay"
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Cost (₹ Cr)</span>
                      {sortField === 'cost' ? (
                        sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-blue-400" /> : <ArrowDown className="w-3.5 h-3.5 text-blue-400" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-500" />
                      )}
                    </div>
                  </th>
                  <th
                    className="py-4.5 px-4 text-right cursor-pointer hover:text-white transition-colors select-none"
                    onClick={() => toggleSort('progress')}
                    title="Sort by Physical Progress"
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Physical Progress</span>
                      {sortField === 'progress' ? (
                        sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-blue-400" /> : <ArrowDown className="w-3.5 h-3.5 text-blue-400" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-500" />
                      )}
                    </div>
                  </th>
                  <th className="py-4.5 px-4 text-center">Status</th>
                  <th
                    className="py-4.5 px-4 text-center cursor-pointer hover:text-white transition-colors select-none"
                    onClick={() => toggleSort('risk')}
                    title="Sort by Risk Score"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span>Risk Index</span>
                      {sortField === 'risk' ? (
                        sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-blue-400" /> : <ArrowDown className="w-3.5 h-3.5 text-blue-400" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-500" />
                      )}
                    </div>
                  </th>
                  <th className="py-4.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#14233D]/60">
                {sortedProjects.map((p: any) => {
                  const pid = p.project_id || p.id || p.project_code;
                  const riskVal = p.risk_score ?? (p.risk_level === 'Critical' ? 85 : p.risk_level === 'High' ? 70 : p.risk_level === 'Medium' ? 50 : 25);
                  const cost = p.current_cost || p.revised_cost || p.original_cost || 0;
                  const progress = p.progress_percentage || p.physical_progress_pct || 0;

                  return (
                    <tr
                      key={pid}
                      onClick={() => navigate(`/projects/${pid}`)}
                      className="even:bg-[#081326]/45 odd:bg-[#050D1A]/30 hover:bg-blue-600/15 cursor-pointer transition-colors group"
                    >
                      {/* Project Asset */}
                      <td className="py-4.5 px-6">
                        <div className="font-bold text-white group-hover:text-blue-400 transition-colors text-xs sm:text-sm leading-snug">
                          {p.project_name || p.name || 'Unnamed Project'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-1 flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded bg-[#091529] border border-[#1E3354]">{pid}</span>
                          {p.executing_agency && <span>· {p.executing_agency}</span>}
                        </div>
                      </td>

                      {/* Sector & Ministry */}
                      <td className="py-4.5 px-4">
                        <div className="text-slate-200 font-semibold">{p.sector || 'General'}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[200px] mt-0.5">{p.ministry || 'Central Ministry'}</div>
                      </td>

                      {/* Location */}
                      <td className="py-4.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-200 font-medium">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{p.state || 'Pan-India'}</span>
                        </div>
                        {p.district && <div className="text-[10px] text-slate-400 ml-4.5">{p.district}</div>}
                      </td>

                      {/* Cost */}
                      <td className="py-4.5 px-4 text-right font-mono font-bold text-white text-xs sm:text-sm">
                        {formatCurrency(cost)}
                      </td>

                      {/* Progress */}
                      <td className="py-4.5 px-4 text-right">
                        <div className="font-mono font-bold text-slate-200">{formatPercent(progress)}</div>
                        <div className="w-20 ml-auto bg-[#091529] h-2 rounded-full mt-1.5 overflow-hidden border border-[#14233D]">
                          <div
                            className={`h-full rounded-full ${
                              progress >= 80 ? 'bg-emerald-500' :
                              progress >= 50 ? 'bg-blue-500' :
                              progress >= 30 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                          />
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4.5 px-4 text-center">
                        <StatusBadge status={p.status} />
                      </td>

                      {/* Risk Index */}
                      <td className="py-4.5 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold ${getRiskBadgeClass(riskVal)}`}>
                          {riskVal.toFixed ? riskVal.toFixed(1) : riskVal}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4.5 px-4 text-center">
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/projects/${pid}`); }}
                          aria-label={`View dossier for ${p.project_name || pid}`}
                          title="Open 360° Project Dossier"
                          className="p-2 rounded-xl bg-[#091529] hover:bg-blue-600 hover:text-white text-slate-400 border border-[#1E3354] hover:border-blue-500 transition-all cursor-pointer shadow-sm"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 bg-[#050D1A]/95 border-t border-[#14233D] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div>
              Showing{' '}
              <span className="text-white font-bold font-mono">{projects.length ? (page - 1) * limit + 1 : 0}</span>
              {' '}to{' '}
              <span className="text-white font-bold font-mono">{Math.min(page * limit, total)}</span>
              {' '}of{' '}
              <span className="text-white font-bold font-mono">{total}</span> infrastructure assets
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                title={page === 1 ? "Already at first page" : "Go to previous page"}
                aria-label="Previous page"
                className="px-3 py-1.5 rounded-xl bg-[#091529] hover:bg-[#0E1E38] disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 border border-[#1E3354] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
              <div className="px-3 py-1 rounded-xl bg-[#081325] border border-[#14233D] font-mono text-slate-200 font-bold">
                {page} / {totalPages}
              </div>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                title={page >= totalPages ? "Already at last page" : "Go to next page"}
                aria-label="Next page"
                className="px-3 py-1.5 rounded-xl bg-[#091529] hover:bg-[#0E1E38] disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 border border-[#1E3354] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
