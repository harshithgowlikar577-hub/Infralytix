import { useState, useMemo } from 'react';
import { useStateAnalytics, useProjects } from '../hooks/useAPI';
import { formatCurrency, getRiskBadgeClass, getRiskLabel } from '../lib/utils';
import Skeleton from '../components/ui/Skeleton';
import ErrorState from '../components/ui/ErrorState';
import { MapPin, Building, AlertTriangle, Layers, ChevronRight, Search, Filter, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import IndiaGisMap from '../components/gis/IndiaGisMap';

// Coordinates for major Indian states
const STATE_COORDS: Record<string, { lat: number; lng: number }> = {
  'Maharashtra': { lat: 19.7515, lng: 75.7139 },
  'Uttar Pradesh': { lat: 26.8467, lng: 80.9462 },
  'Gujarat': { lat: 22.2587, lng: 71.1924 },
  'Karnataka': { lat: 15.3173, lng: 75.7139 },
  'Tamil Nadu': { lat: 11.1271, lng: 78.6569 },
  'Madhya Pradesh': { lat: 22.9734, lng: 78.6569 },
  'Rajasthan': { lat: 27.0238, lng: 74.2179 },
  'West Bengal': { lat: 22.9868, lng: 87.8550 },
  'Bihar': { lat: 25.0961, lng: 85.3131 },
  'Andhra Pradesh': { lat: 15.9129, lng: 79.7400 },
  'Telangana': { lat: 18.1124, lng: 79.0193 },
  'Odisha': { lat: 20.9517, lng: 85.0985 },
  'Assam': { lat: 26.2006, lng: 92.9376 },
  'Punjab': { lat: 31.1471, lng: 75.3412 },
  'Haryana': { lat: 29.0588, lng: 76.0856 },
  'Kerala': { lat: 10.8505, lng: 76.2711 },
  'Delhi': { lat: 28.7041, lng: 77.1025 },
};

export default function MapIntelligence() {
  const navigate = useNavigate();
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [mapViewMode, setMapViewMode] = useState<'risk' | 'progress' | 'capital'>('risk');

  // Multi-Filter State
  const [filterState, setFilterState] = useState<string>('');
  const [filterMinistry, setFilterMinistry] = useState<string>('');
  const [filterSector, setFilterSector] = useState<string>('');
  const [filterRiskBand, setFilterRiskBand] = useState<string>('');
  const [filterCostRange, setFilterCostRange] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  const hasActiveFilters = filterState || filterMinistry || filterSector || filterRiskBand || filterCostRange || filterStatus;

  const resetAllFilters = () => {
    setFilterState('');
    setFilterMinistry('');
    setFilterSector('');
    setFilterRiskBand('');
    setFilterCostRange('');
    setFilterStatus('');
    setSelectedState(null);
  };

  const { data: stateData, isLoading: stateLoading, isError: stateError, refetch } = useStateAnalytics();
  const { data: projectsData, isLoading: projLoading } = useProjects({
    state: selectedState || filterState || undefined,
    limit: 20,
  });

  if (stateLoading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="card" className="h-24" />
        <Skeleton variant="card" className="h-96" />
      </div>
    );
  }

  if (stateError) {
    return <ErrorState title="Failed to load Geographic Intelligence" message="Could not fetch state-level aggregation." onRetry={refetch} />;
  }

  const states = Array.isArray(stateData) ? stateData : (stateData?.states || []);

  const totalNationalCapitalCr = states.reduce((acc: number, s: any) => acc + (s.total_cost_cr || s.total_cost || 0), 0) || 1245000;
  const highRiskStatesCount = states.filter((s: any) => (s.avg_risk || (s.average_delay_days ? Math.min(95, Math.round(s.average_delay_days / 4.5)) : 50)) >= 65).length;

  const filteredStates = states.filter((s: any) =>
    (s.state || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeProjects = projectsData?.projects || projectsData?.items || (Array.isArray(projectsData) ? projectsData : []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-3">
            <MapPin className="w-3.5 h-3.5" />
            <span>GIS Geospatial Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <span>National Geographic Intelligence</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            State-wise geospatial concentration of infrastructure capital and execution vulnerability.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-xl self-start md:self-auto shadow-md">
          <button
            onClick={() => setMapViewMode('risk')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${mapViewMode === 'risk' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
          >
            Risk Heatmap
          </button>
          <button
            onClick={() => setMapViewMode('progress')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${mapViewMode === 'progress' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
          >
            Progress
          </button>
          <button
            onClick={() => setMapViewMode('capital')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${mapViewMode === 'capital' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-400 hover:text-cyan-400'}`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Capital Overlay</span>
          </button>
        </div>
      </div>

      {/* 3-Question Context Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80 shadow-sm text-xs backdrop-blur-md">
        <div className="flex items-start gap-2.5 p-1">
          <span className="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 font-semibold uppercase text-[10px] tracking-wide shrink-0">Coverage</span>
          <span className="text-slate-300 leading-relaxed">
            <strong className="text-blue-400 font-semibold">{states.length || 28} State/UT jurisdictions</strong> tracking <strong className="text-white font-mono">{formatCurrency(totalNationalCapitalCr)}</strong> total capital.
          </span>
        </div>
        <div className="flex items-start gap-2.5 p-1">
          <span className="px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-400 font-semibold uppercase text-[10px] tracking-wide shrink-0">Vulnerability</span>
          <span className="text-slate-300 leading-relaxed">
            <strong className="text-rose-400 font-semibold">{highRiskStatesCount} high-risk corridors</strong> flagged for inter-ministerial coordination.
          </span>
        </div>
        <div className="flex items-start gap-2.5 p-1">
          <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-semibold uppercase text-[10px] tracking-wide shrink-0">Overlay</span>
          <span className="text-slate-300 leading-relaxed">
            Toggle <strong className="text-cyan-400 font-semibold">Capital Overlay</strong> to scale project circles proportionally by ₹ Cr investment.
          </span>
        </div>
      </div>

      {/* Multi-Filter Bar */}
      <div className="bg-[#070F1E] border border-[#1A2E4E] rounded-2xl p-4 shadow-xl">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 shrink-0">
            <Filter className="w-4 h-4 text-blue-400" />
            <span className="uppercase tracking-wider">Filters</span>
          </div>

          {/* State filter */}
          <select
            value={filterState}
            onChange={(e) => { setFilterState(e.target.value); setSelectedState(e.target.value || null); }}
            className="flex-1 min-w-[120px] max-w-[180px] px-3 py-1.5 text-xs bg-[#0B1628] border border-[#1A2E4E] rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer"
          >
            <option value="">All States</option>
            {Object.keys(STATE_COORDS).map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          {/* Ministry filter */}
          <select
            value={filterMinistry}
            onChange={(e) => setFilterMinistry(e.target.value)}
            className="flex-1 min-w-[140px] max-w-[200px] px-3 py-1.5 text-xs bg-[#0B1628] border border-[#1A2E4E] rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer"
          >
            <option value="">All Ministries</option>
            <option value="MoRTH">MoRTH – Road Transport</option>
            <option value="MoR">Ministry of Railways</option>
            <option value="MoPNG">MoPNG – Petroleum</option>
            <option value="MoP">Ministry of Power</option>
            <option value="MoUD">Urban Development</option>
            <option value="MoWR">Water Resources</option>
          </select>

          {/* Sector filter */}
          <select
            value={filterSector}
            onChange={(e) => setFilterSector(e.target.value)}
            className="flex-1 min-w-[120px] max-w-[180px] px-3 py-1.5 text-xs bg-[#0B1628] border border-[#1A2E4E] rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer"
          >
            <option value="">All Sectors</option>
            <option value="Transport & Logistics">Transport & Logistics</option>
            <option value="Energy">Energy</option>
            <option value="Water & Sanitation">Water & Sanitation</option>
            <option value="Urban Development">Urban Development</option>
            <option value="Telecom">Telecom</option>
            <option value="Social Infrastructure">Social Infrastructure</option>
          </select>

          {/* Risk Band */}
          <select
            value={filterRiskBand}
            onChange={(e) => setFilterRiskBand(e.target.value)}
            className="flex-1 min-w-[110px] max-w-[160px] px-3 py-1.5 text-xs bg-[#0B1628] border border-[#1A2E4E] rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer"
          >
            <option value="">All Risk Levels</option>
            <option value="Critical">🔴 Critical (80+)</option>
            <option value="High">🟠 High (60–79)</option>
            <option value="Medium">🟡 Medium (40–59)</option>
            <option value="Low">🟢 Low (&lt;40)</option>
          </select>

          {/* Cost Range */}
          <select
            value={filterCostRange}
            onChange={(e) => setFilterCostRange(e.target.value)}
            className="flex-1 min-w-[130px] max-w-[180px] px-3 py-1.5 text-xs bg-[#0B1628] border border-[#1A2E4E] rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer"
          >
            <option value="">All Cost Ranges</option>
            <option value="mega">&gt; ₹50,000 Cr (Mega)</option>
            <option value="large">₹10,000–50,000 Cr</option>
            <option value="medium">₹1,000–10,000 Cr</option>
            <option value="small">&lt; ₹1,000 Cr</option>
          </select>

          {/* Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="flex-1 min-w-[120px] max-w-[170px] px-3 py-1.5 text-xs bg-[#0B1628] border border-[#1A2E4E] rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="On Track">✅ On Track</option>
            <option value="Delayed">⏱ Delayed</option>
            <option value="Stalled">🚫 Stalled</option>
            <option value="Completed">🏁 Completed</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={resetAllFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-400 border border-rose-500/30 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 transition-colors cursor-pointer shrink-0"
              title="Clear all active filters"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Active Filter Tags */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-[#1A2E4E]">
            {filterState && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-blue-500/15 text-blue-300 border border-blue-500/30">
                State: {filterState}
                <button onClick={() => { setFilterState(''); setSelectedState(null); }} className="hover:text-white cursor-pointer"><X className="w-3 h-3" /></button>
              </span>
            )}
            {filterMinistry && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                Ministry: {filterMinistry}
                <button onClick={() => setFilterMinistry('')} className="hover:text-white cursor-pointer"><X className="w-3 h-3" /></button>
              </span>
            )}
            {filterSector && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30">
                Sector: {filterSector}
                <button onClick={() => setFilterSector('')} className="hover:text-white cursor-pointer"><X className="w-3 h-3" /></button>
              </span>
            )}
            {filterRiskBand && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-rose-500/15 text-rose-300 border border-rose-500/30">
                Risk: {filterRiskBand}
                <button onClick={() => setFilterRiskBand('')} className="hover:text-white cursor-pointer"><X className="w-3 h-3" /></button>
              </span>
            )}
            {filterCostRange && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                Cost: {filterCostRange}
                <button onClick={() => setFilterCostRange('')} className="hover:text-white cursor-pointer"><X className="w-3 h-3" /></button>
              </span>
            )}
            {filterStatus && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-purple-500/15 text-purple-300 border border-purple-500/30">
                Status: {filterStatus}
                <button onClick={() => setFilterStatus('')} className="hover:text-white cursor-pointer"><X className="w-3 h-3" /></button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Main Interactive India GIS Map (Priority 3) */}
      <div className="w-full rounded-2xl overflow-hidden border border-slate-800/80 shadow-xl bg-slate-950/40 backdrop-blur-sm p-1">
        <IndiaGisMap
          height={520}
          selectedState={selectedState}
          onSelectState={setSelectedState}
          projects={activeProjects}
          viewMode={mapViewMode}
          onViewModeChange={setMapViewMode}
        />
      </div>

      {/* Grid view: State Cards + Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* State Aggregations */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card p-4 rounded-2xl border border-slate-800/80 flex items-center justify-between gap-4 shadow-sm">
            <div className="relative flex-1">
              <div className="relative flex items-center w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search locations or projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Search locations or projects"
                  className="w-full h-[46px] pl-11 pr-10 py-2.5 text-sm bg-slate-900/90 border border-slate-700/80 rounded-2xl text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:shadow-[0_0_18px_rgba(16,185,129,0.2)] transition-all shadow-inner font-sans"
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
            <div className="text-xs text-slate-400 font-medium whitespace-nowrap px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 font-mono">
              {filteredStates.length} Jurisdictions
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[600px] overflow-y-auto pr-1">
            {filteredStates.map((s: any, idx: number) => {
              const isSelected = selectedState === s.state;
              const avgRisk = s.avg_risk || (s.average_delay_days ? Math.min(95, Math.round(s.average_delay_days / 4.5)) : 50);
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedState(isSelected ? null : s.state)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'bg-blue-950/40 border-blue-500/80 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/30'
                      : 'glass-card border-slate-800/80 hover:border-slate-700 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-100 tracking-tight">{s.state}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${getRiskBadgeClass(avgRisk)}`}>
                      {Number(avgRisk).toFixed(1)} Risk
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-3.5 pt-3 border-t border-slate-800/80 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-medium tracking-wider">Monitored Projects</span>
                      <span className="font-mono font-bold text-slate-200 text-sm">{s.project_count || s.count || 0}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-medium tracking-wider">Capital Outlay</span>
                      <span className="font-mono font-semibold text-slate-200 text-xs">{formatCurrency(s.total_cost_cr || s.total_cost || 0)}</span>
                    </div>
                  </div>

                  {(s.average_delay_days !== undefined || s.delayed !== undefined) && (
                    <div className="mt-3 pt-2 border-t border-slate-800/50 text-[11px] text-rose-400/90 flex items-center gap-1.5 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>Avg delay: {Math.round(s.average_delay_days || s.delayed * 10)} days ({Math.round((s.average_delay_days || 100) / 30)} mo)</span>
                    </div>
                  )}
                </div>
              );
            })}
            {filteredStates.length === 0 && (
              <div className="col-span-full glass-card p-12 text-center rounded-2xl border border-slate-800">
                <Search className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-60" />
                <h4 className="text-sm font-bold text-slate-200">No matching locations or projects found</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Try checking state spelling or clear your search query.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Selected State Project Explorer / Inspector */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800/80 space-y-4 flex flex-col shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3.5">
            <div>
              <h2 className="text-base font-bold text-slate-100">
                {selectedState ? `${selectedState} Projects` : 'National Snapshot'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {selectedState ? 'Filtered portfolio in jurisdiction' : 'Select a state to inspect assets'}
              </p>
            </div>
            {selectedState && (
              <button
                onClick={() => setSelectedState(null)}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium px-2 py-1 rounded-lg hover:bg-blue-500/10 transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[500px] pr-1">
            {activeProjects.length > 0 ? (
              activeProjects.map((p: any) => {
                const pid = p.project_id || p.id;
                const pRisk = p.risk_score ?? (p.risk_level === 'Critical' ? 88 : p.risk_level === 'High' ? 72 : 50);
                return (
                  <div
                    key={pid}
                    onClick={() => navigate(`/projects/${pid}`)}
                    className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-900/90 cursor-pointer transition-all duration-150 space-y-1.5 group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-xs text-slate-200 line-clamp-1 group-hover:text-blue-400 transition-colors">
                        {p.project_name || p.name}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{p.sector}</span>
                      <span className="font-mono text-slate-300 font-medium">{formatCurrency(p.current_cost || p.revised_cost || p.original_cost || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 text-[10px]">
                      <span className="text-slate-400">Progress: <strong className="text-slate-200 font-medium">{p.progress_percentage || p.physical_progress_pct || 0}%</strong></span>
                      <span className={`px-2 py-0.5 rounded-full font-mono font-medium ${getRiskBadgeClass(pRisk)}`}>
                        {Number(pRisk).toFixed(1)}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                Click any state on the left to inspect its active infrastructure projects.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
