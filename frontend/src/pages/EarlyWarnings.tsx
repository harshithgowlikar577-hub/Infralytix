import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePredictiveEarlyWarnings } from '../hooks/useAPI';
import { formatCurrency } from '../lib/utils';
import Skeleton from '../components/ui/Skeleton';
import ErrorState from '../components/ui/ErrorState';
import {
  AlertOctagon, AlertTriangle, CheckCircle2, ExternalLink, IndianRupee,
  Clock, ChevronRight, UserCheck, ShieldAlert, ArrowUpRight, Filter,
  Calendar, Layers, Sparkles, TrendingUp, Search, SlidersHorizontal, RefreshCw, Zap, X
} from 'lucide-react';

export type AlertLifecycleStage = 'DETECTED' | 'ASSIGNED' | 'ESCALATED' | 'UNDER_REVIEW' | 'RESOLVED' | 'VERIFIED';
export type FutureHorizon = '30_DAYS' | '60_DAYS' | '90_DAYS';
export type QueueType = 'escalation' | 'critical' | 'high_risk' | 'watch_list';

const STAGE_CONFIG: Record<AlertLifecycleStage, { label: string; badgeCls: string; nextAction: string; nextStage: AlertLifecycleStage | null }> = {
  DETECTED: {
    label: 'Detected',
    badgeCls: 'bg-rose-500/15 text-rose-400 border-rose-500/30 animate-pulse',
    nextAction: 'Assign Nodal',
    nextStage: 'ASSIGNED',
  },
  ASSIGNED: {
    label: 'Assigned',
    badgeCls: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    nextAction: 'Escalate to PMO',
    nextStage: 'ESCALATED',
  },
  ESCALATED: {
    label: 'Escalated',
    badgeCls: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    nextAction: 'Convene Review',
    nextStage: 'UNDER_REVIEW',
  },
  UNDER_REVIEW: {
    label: 'Under Review',
    badgeCls: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    nextAction: 'Mark Resolved',
    nextStage: 'RESOLVED',
  },
  RESOLVED: {
    label: 'Resolved',
    badgeCls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    nextAction: 'Verify & Close',
    nextStage: 'VERIFIED',
  },
  VERIFIED: {
    label: 'Verified & Closed',
    badgeCls: 'bg-slate-700/40 text-slate-400 border-slate-600/40',
    nextAction: 'Archived',
    nextStage: null,
  },
};

export default function EarlyWarnings() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<'queues' | 'pipeline'>('queues');
  const [selectedQueue, setSelectedQueue] = useState<QueueType>('escalation');
  const [searchQuery, setSearchQuery] = useState('');
  const [sectorFilter, setSectorFilter] = useState('ALL');
  const [urgencyFilter, setUrgencyFilter] = useState('ALL');
  const [stageFilter, setStageFilter] = useState<'ALL' | AlertLifecycleStage>('ALL');
  const [activeHorizon, setActiveHorizon] = useState<FutureHorizon>('30_DAYS');

  // Track lifecycle stage for each alert id
  const [alertStages, setAlertStages] = useState<Record<string, AlertLifecycleStage>>({});

  const { data: earlyWarningData, isLoading, isError, refetch } = usePredictiveEarlyWarnings(25);

  const handleAdvanceStage = (id: string, currentStage: AlertLifecycleStage) => {
    const next = STAGE_CONFIG[currentStage].nextStage;
    if (next) {
      setAlertStages(prev => ({ ...prev, [id]: next }));
    }
  };

  const queueItems = useMemo(() => {
    if (!earlyWarningData) return [];
    if (selectedQueue === 'escalation') return earlyWarningData.escalation_queue || [];
    if (selectedQueue === 'critical') return earlyWarningData.critical_queue || [];
    if (selectedQueue === 'high_risk') return earlyWarningData.high_risk_queue || [];
    return earlyWarningData.watch_list || [];
  }, [earlyWarningData, selectedQueue]);

  // Extract unique sectors for filter
  const sectors = useMemo(() => {
    if (!earlyWarningData) return [];
    const all = [
      ...(earlyWarningData.escalation_queue || []),
      ...(earlyWarningData.critical_queue || []),
      ...(earlyWarningData.high_risk_queue || []),
      ...(earlyWarningData.watch_list || []),
    ];
    return Array.from(new Set(all.map(item => item.sector))).filter(Boolean).sort();
  }, [earlyWarningData]);

  // Filtered queue items
  const filteredItems = useMemo(() => {
    return queueItems.filter(item => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        item.project_name.toLowerCase().includes(q) ||
        item.project_id.toLowerCase().includes(q) ||
        item.sector.toLowerCase().includes(q) ||
        item.state.toLowerCase().includes(q) ||
        (item.implementing_agency && item.implementing_agency.toLowerCase().includes(q)) ||
        item.primary_cause.toLowerCase().includes(q);

      const matchSector = sectorFilter === 'ALL' || item.sector === sectorFilter;
      const matchUrgency = urgencyFilter === 'ALL' || item.urgency === urgencyFilter;
      const currentStage = alertStages[item.warning_id] || 'DETECTED';
      const matchStage = stageFilter === 'ALL' || currentStage === stageFilter;

      return matchSearch && matchSector && matchUrgency && matchStage;
    });
  }, [queueItems, searchQuery, sectorFilter, urgencyFilter, stageFilter, alertStages]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="card" className="h-24" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} variant="card" className="h-28" />)}
        </div>
        <Skeleton variant="card" className="h-96" />
      </div>
    );
  }

  if (isError || !earlyWarningData) {
    return (
      <ErrorState
        title="Predictive Early Warning Engine Offline"
        message="Unable to synthesize real-time threshold breaches across the national project portfolio. Please retry or verify backend service."
        onRetry={refetch}
      />
    );
  }

  // Future Risk Pipeline data
  const pipelineData: Record<FutureHorizon, {
    horizonTitle: string;
    description: string;
    projectCount: number;
    capitalAtRiskCr: number;
    primaryMechanism: string;
    items: {
      name: string;
      sector: string;
      currentScore: number;
      projectedScore: number;
      trigger: string;
      timeline: string;
    }[];
  }> = {
    '30_DAYS': {
      horizonTitle: '30-Day Imminent Breach Horizon',
      description: 'Projects currently within 5 points of high-risk threshold with pending statutory clearance deadlines.',
      projectCount: earlyWarningData.watch_list_count || 12,
      capitalAtRiskCr: 41200,
      primaryMechanism: 'Statutory Stage-II Forest NOC expiration & monsoon earthwork window closure.',
      items: [
        { name: 'Delhi-Amritsar-Katra Expressway Pkg II', sector: 'Highways', currentScore: 68, projectedScore: 78, trigger: 'Stage-II Environmental NOC expiry (22 days)', timeline: 'Late Sept 2026' },
        { name: 'Western DFC Dadri-Rewari Link', sector: 'Railways', currentScore: 66, projectedScore: 75, trigger: 'Overhead Electrification subcontractor cashflow freeze', timeline: 'Early Oct 2026' },
        { name: 'Bengaluru Suburban Rail Corridor 2', sector: 'Urban Transit', currentScore: 69, projectedScore: 82, trigger: 'Defence Land RoW Transfer bottleneck in Jalahalli', timeline: 'Within 28 days' },
      ],
    },
    '60_DAYS': {
      horizonTitle: '60-Day Mid-Range Escalation Horizon',
      description: 'Projects facing major milestone reviews and heavy raw-material escalation re-baselining.',
      projectCount: earlyWarningData.high_risk_count || 18,
      capitalAtRiskCr: 78500,
      primaryMechanism: 'Contractor liquidity covenant breaches and steel rebar price volatility.',
      items: [
        { name: 'Mumbai Metro Line 4 Wadala-Kasarvadavali', sector: 'Urban Transit', currentScore: 62, projectedScore: 74, trigger: 'Rolling stock supply lead time extension by 45 days', timeline: 'Nov 2026' },
        { name: 'Paradip Port Deep Draft Coal Berth', sector: 'Ports', currentScore: 59, projectedScore: 71, trigger: 'Dredging vessel redeployment delay', timeline: 'Nov 2026' },
        { name: 'Gorakhpur Nuclear Power Plant Water Intake', sector: 'Power', currentScore: 64, projectedScore: 76, trigger: 'Canal crossing regulatory review', timeline: 'Dec 2026' },
      ],
    },
    '90_DAYS': {
      horizonTitle: '90-Day Strategic Target Horizon',
      description: 'Strategic national corridors at risk of breaching FY26-27 annual Capex deployment targets.',
      projectCount: earlyWarningData.critical_count || 24,
      capitalAtRiskCr: 124000,
      primaryMechanism: 'Fiscal year-end allocation lapse risk & cross-state corridor harmonization latency.',
      items: [
        { name: 'North East Gas Grid Section IV', sector: 'Petroleum', currentScore: 56, projectedScore: 70, trigger: 'River Brahmaputra HDD crossing permit queue', timeline: 'Jan 2027' },
        { name: 'Chennai-Bengaluru Industrial Corridor Node A', sector: 'Industrial', currentScore: 58, projectedScore: 73, trigger: 'Water allocation MoU with State Irrigation board', timeline: 'Jan 2027' },
        { name: 'Zojila Tunnel Approach Road Bypass', sector: 'Highways', currentScore: 63, projectedScore: 79, trigger: 'Heavy snowfall freeze on pre-cast segmental launching', timeline: 'Dec 2026' },
      ],
    },
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div className="pb-4 border-b border-[#14233D] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
            <span>MoSPI &amp; PM GatiShakti</span>
            <span>/</span>
            <span className="text-slate-200">Early Warning Surveillance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <AlertOctagon className="w-7 h-7 text-rose-500" />
            <span>Intelligent Early Warning &amp; Triage Centre</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Predictive breach detection, 4-tier ministerial priority triage, and quantified delay/cost recovery pathways
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-center">
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            title={isLoading ? "Refreshing early warning telemetry..." : "Refresh Early Warnings"}
            aria-label="Refresh early warnings"
            className={`px-3 py-1.5 text-xs font-bold rounded-xl bg-[#091529] hover:bg-[#0E1E38] text-slate-200 border border-[#1E3354] flex items-center gap-1.5 transition-all shadow-sm ${
              isLoading ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 text-rose-400 ${isLoading ? "animate-spin" : ""}`} />
            <span>{isLoading ? "Refreshing..." : "Refresh"}</span>
          </button>

          {/* View Switcher: 4-Tier Triage vs 30/60/90-Day Pipeline */}
          <div className="flex items-center p-1 rounded-xl bg-[#081325] border border-[#182C4C]">
            <button
              onClick={() => setActiveView('queues')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeView === 'queues'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Priority Queues (4-Tier)</span>
            </button>
            <button
              onClick={() => setActiveView('pipeline')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeView === 'pipeline'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>30/60/90-Day Lookahead</span>
            </button>
          </div>
        </div>
      </div>

      {/* Alert Analytics Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Capex at Risk */}
        <div className="glass-card p-5 rounded-2xl border border-rose-500/20 bg-rose-950/10 flex items-center gap-4 shadow-lg shadow-rose-950/20">
          <div className="w-11 h-11 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Total Capex At Risk</div>
            <div className="text-xl sm:text-2xl font-black font-mono text-rose-400 mt-0.5">
              {formatCurrency(earlyWarningData.total_capex_at_risk_cr)}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Across {earlyWarningData.total_alerts} prioritized assets</div>
          </div>
        </div>

        {/* Escalation Alerts */}
        <div className="glass-card p-5 rounded-2xl border border-amber-500/20 bg-amber-950/10 flex items-center gap-4 shadow-lg shadow-amber-950/20">
          <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Cabinet Escalations</div>
            <div className="text-xl sm:text-2xl font-black font-mono text-amber-400 mt-0.5">
              {earlyWarningData.escalation_count} <span className="text-xs font-normal text-slate-400">/ 0-48h SLA</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">{earlyWarningData.critical_count} critical tier projects</div>
          </div>
        </div>

        {/* Mean Delay Probability */}
        <div className="glass-card p-5 rounded-2xl border border-blue-500/20 bg-blue-950/10 flex items-center gap-4 shadow-lg">
          <div className="w-11 h-11 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Mean Delay Probability</div>
            <div className="text-xl sm:text-2xl font-black font-mono text-blue-400 mt-0.5">
              {earlyWarningData.average_delay_probability}%
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">ML GradientBoosting forecast</div>
          </div>
        </div>

        {/* Mean Cost Escalation Probability */}
        <div className="glass-card p-5 rounded-2xl border border-purple-500/20 bg-purple-950/10 flex items-center gap-4 shadow-lg">
          <div className="w-11 h-11 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Cost Escalation Risk</div>
            <div className="text-xl sm:text-2xl font-black font-mono text-purple-400 mt-0.5">
              {earlyWarningData.average_cost_escalation_probability}%
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Predicted budget variance &gt;15%</div>
          </div>
        </div>
      </div>

      {/* Trigger Type Distribution Strip */}
      <div className="p-3.5 rounded-xl bg-[#071326] border border-[#142642] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-400 font-semibold">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="uppercase text-[10px] tracking-wider text-slate-300">Systemic Trigger Telemetry:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {Object.entries(earlyWarningData.alerts_by_trigger_type || {}).map(([trigger, count]) => (
            <span
              key={trigger}
              className="px-2.5 py-1 rounded-md bg-[#0c1e38] border border-[#1b3459] text-[11px] text-slate-300 font-medium flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span>{trigger.replace(/_/g, ' ')}:</span>
              <strong className="text-white font-mono">{String(count)}</strong>
            </span>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: 4-TIER PRIORITY QUEUES */}
      {/* ========================================================================= */}
      {activeView === 'queues' && (
        <div className="space-y-6">
          {/* Priority Queue Selector Tabs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                id: 'escalation' as QueueType,
                title: 'Escalation Queue',
                subtitle: 'PMO & Cabinet Secretariat',
                count: earlyWarningData.escalation_count,
                badgeCls: 'border-rose-500/40 text-rose-400',
                activeCls: 'border-rose-500 bg-rose-950/25 shadow-lg shadow-rose-950/30 text-white',
                pulse: true,
              },
              {
                id: 'critical' as QueueType,
                title: 'Critical Queue',
                subtitle: 'High Distress & Overruns',
                count: earlyWarningData.critical_count,
                badgeCls: 'border-amber-500/40 text-amber-400',
                activeCls: 'border-amber-500 bg-amber-950/25 shadow-lg shadow-amber-950/30 text-white',
              },
              {
                id: 'high_risk' as QueueType,
                title: 'High Risk Queue',
                subtitle: 'Significant Schedule Drag',
                count: earlyWarningData.high_risk_count,
                badgeCls: 'border-yellow-500/40 text-yellow-400',
                activeCls: 'border-yellow-500 bg-yellow-950/25 shadow-lg shadow-yellow-950/30 text-white',
              },
              {
                id: 'watch_list' as QueueType,
                title: 'Watch List',
                subtitle: 'Emerging Early Variances',
                count: earlyWarningData.watch_list_count,
                badgeCls: 'border-blue-500/40 text-blue-400',
                activeCls: 'border-blue-500 bg-blue-950/25 shadow-lg shadow-blue-950/30 text-white',
              },
            ].map(tab => {
              const isActive = selectedQueue === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedQueue(tab.id)}
                  className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
                    isActive
                      ? tab.activeCls
                      : 'bg-[#081325]/70 border-[#142642] text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                      {tab.pulse && <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />}
                      <span>{tab.title}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-[#040a14] border border-slate-700">
                      {tab.count}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">{tab.subtitle}</div>
                </button>
              );
            })}
          </div>

          {/* Search and Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3 p-3.5 rounded-2xl bg-[#081325] border border-[#142642]">
            <div className="relative flex-1 w-full flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search alerts by project name, ID, sector, state, cause..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                aria-label="Search alerts"
                className="w-full h-[46px] bg-[#050e1c] border border-[#1b3459] rounded-2xl pl-11 pr-10 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:shadow-[0_0_18px_rgba(59,130,246,0.2)] transition-all shadow-inner font-sans"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
                  title="Clear search"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {/* Sector Filter */}
              <select
                value={sectorFilter}
                onChange={e => setSectorFilter(e.target.value)}
                className="bg-[#050e1c] border border-[#1b3459] rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="ALL">All Sectors ({sectors.length})</option>
                {sectors.map(sec => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>

              {/* Urgency Filter */}
              <select
                value={urgencyFilter}
                onChange={e => setUrgencyFilter(e.target.value)}
                className="bg-[#050e1c] border border-[#1b3459] rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="ALL">All Urgencies</option>
                <option value="Immediate (0-48h)">Immediate (0-48h)</option>
                <option value="High (7d)">High (7d)</option>
                <option value="Scheduled (30d)">Scheduled (30d)</option>
              </select>

              {/* Lifecycle Stage Filter */}
              <select
                value={stageFilter}
                onChange={e => setStageFilter(e.target.value as any)}
                className="bg-[#050e1c] border border-[#1b3459] rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="ALL">All Stages</option>
                <option value="DETECTED">Detected</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="ESCALATED">Escalated</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="RESOLVED">Resolved</option>
                <option value="VERIFIED">Verified</option>
              </select>

              {/* Result Count Badge */}
              <span className="text-[11px] font-mono px-2 py-1 rounded-md bg-[#050e1c] border border-[#1b3459] text-slate-400 shrink-0">
                {filteredItems.length} alerts
              </span>

              {(searchQuery || sectorFilter !== 'ALL' || urgencyFilter !== 'ALL' || stageFilter !== 'ALL') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSectorFilter('ALL');
                    setUrgencyFilter('ALL');
                    setStageFilter('ALL');
                  }}
                  className="px-2 py-1 rounded-lg text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Active Queue Cards List */}
          {filteredItems.length === 0 ? (
            <div className="glass-card p-12 text-center rounded-2xl border border-[#142642]">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">No alerts match current criteria</h3>
              <p className="text-xs text-slate-400 mt-1">Try resetting search filters or selecting another queue.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredItems.map(item => {
                const currentStage = alertStages[item.warning_id] || 'DETECTED';
                const stageCfg = STAGE_CONFIG[currentStage];
                const isEscalation = item.queue === 'escalation';

                return (
                  <div
                    key={item.warning_id}
                    className={`glass-card p-5 rounded-2xl border transition-all ${
                      isEscalation
                        ? 'border-rose-500/30 bg-rose-950/10 hover:border-rose-500/50'
                        : item.queue === 'critical'
                        ? 'border-amber-500/30 bg-amber-950/10 hover:border-amber-500/50'
                        : 'border-[#142642] bg-[#071326]/70 hover:border-blue-500/40'
                    }`}
                  >
                    {/* Top Row: Title, Codes, Badges */}
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 pb-3 border-b border-[#142642]/60">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#040a14] border border-slate-700 text-slate-300">
                            {item.project_id}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950/50 border border-blue-500/30 text-blue-300">
                            {item.sector}
                          </span>
                          <span className="text-[11px] text-slate-400">• {item.state}</span>
                          <span className="text-[11px] text-slate-500">• {item.ministry}</span>
                        </div>
                        <h3 className="text-base font-bold text-white mt-1 hover:text-blue-400 cursor-pointer transition-colors"
                            onClick={() => navigate(`/projects/${item.project_id}`)}>
                          {item.project_name}
                        </h3>
                      </div>

                      {/* Badges Right */}
                      <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                          item.risk_level === 'Critical'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : item.risk_level === 'High'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
                        }`}>
                          Risk: {item.risk_score}/100 ({item.risk_level})
                        </span>

                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${stageCfg.badgeCls}`}>
                          {stageCfg.label}
                        </span>

                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-950/40 border border-red-500/30 text-red-300">
                          {item.urgency}
                        </span>
                      </div>
                    </div>

                    {/* Middle Row: Probabilities & Impact Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
                      {/* Probability Bars */}
                      <div className="p-3.5 rounded-xl bg-[#040d1c] border border-[#142642] space-y-2.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">ML Delay Probability:</span>
                          <span className="font-mono font-bold text-rose-400">{item.delay_probability}%</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full"
                            style={{ width: `${item.delay_probability}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1">
                          <span className="text-slate-400">Cost Escalation Risk:</span>
                          <span className="font-mono font-bold text-amber-400">{item.cost_escalation_probability}%</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-amber-500 rounded-full"
                            style={{ width: `${item.cost_escalation_probability}%` }}
                          />
                        </div>
                      </div>

                      {/* Forecast Impact & Root Cause */}
                      <div className="p-3.5 rounded-xl bg-[#040d1c] border border-[#142642] space-y-1.5">
                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Primary Systemic Bottleneck</div>
                        <div className="text-xs font-bold text-amber-300 leading-snug">{item.primary_cause}</div>
                        <div className="text-[11px] text-slate-400 pt-1">
                          Forecast Impact: <strong className="text-rose-400 font-mono">{item.forecast_impact}</strong>
                        </div>
                      </div>

                      {/* Capital Exposure & Accountability */}
                      <div className="p-3.5 rounded-xl bg-[#040d1c] border border-[#142642] space-y-1.5">
                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Capital &amp; Implementing Nodal</div>
                        <div className="text-xs font-bold text-white font-mono">
                          {formatCurrency(item.current_cost_cr)}{' '}
                          <span className="text-[10px] text-slate-400 font-normal">
                            (+{item.cost_overrun_pct}% overrun)
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-300 truncate">
                          Owner: <strong className="text-blue-300">{item.owner}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Prescriptive Recommendation Box */}
                    <div className="p-3 rounded-xl bg-[#081930] border border-blue-500/20 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-blue-400 tracking-wider mb-0.5">
                          Prescriptive Nodal Action Directive
                        </div>
                        <p className="text-slate-200 leading-relaxed font-medium">{item.recommended_action}</p>
                        <div className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Expected Recovery: {item.expected_recovery}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {stageCfg.nextStage ? (
                          <button
                            onClick={() => handleAdvanceStage(item.warning_id, currentStage)}
                            title={`Transition workflow stage from ${stageCfg.label} to ${stageCfg.nextAction}`}
                            aria-label={`Advance alert to ${stageCfg.nextAction}`}
                            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-md transition-all cursor-pointer flex items-center gap-1"
                          >
                            <span>{stageCfg.nextAction}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1" title="Alert workflow resolved and verified">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Closed
                          </span>
                        )}

                        <button
                          onClick={() => navigate(`/projects/${item.project_id}`)}
                          title={`View comprehensive 360° dossier for ${item.project_name || item.project_id}`}
                          aria-label={`View dossier for ${item.project_id}`}
                          className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-[#0d2242] hover:bg-[#122e59] text-slate-200 border border-[#1b3b6b] transition-all cursor-pointer flex items-center gap-1"
                        >
                          <span>Dossier</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: 30/60/90-DAY PREDICTIVE RISK PIPELINE */}
      {/* ========================================================================= */}
      {activeView === 'pipeline' && (
        <div className="space-y-6">
          {/* Horizon Selector Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(['30_DAYS', '60_DAYS', '90_DAYS'] as FutureHorizon[]).map(horizon => {
              const data = pipelineData[horizon];
              const isSelected = activeHorizon === horizon;
              return (
                <button
                  key={horizon}
                  onClick={() => setActiveHorizon(horizon)}
                  className={`p-5 rounded-2xl text-left border transition-all cursor-pointer ${
                    isSelected
                      ? 'glass-card border-purple-500/40 bg-purple-950/20 shadow-xl shadow-purple-950/20'
                      : 'bg-[#091529]/70 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-purple-300' : 'text-slate-500'}`}>
                      {horizon.replace('_', ' ')}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-purple-400 animate-pulse' : 'bg-slate-700'}`} />
                  </div>
                  <div className="text-xl font-bold text-white mt-1">{data.horizonTitle.split(' ')[0]} Lookahead</div>
                  <div className="text-xs text-slate-400 mt-1">{data.projectCount} projects projected to breach</div>
                  <div className="text-sm font-mono font-bold text-amber-400 mt-2">
                    {formatCurrency(data.capitalAtRiskCr)} Capital Exposure
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Horizon Deep-Dive */}
          {(() => {
            const currentHorizonData = pipelineData[activeHorizon];
            return (
              <div className="glass-card p-6 rounded-2xl border border-purple-500/30 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-400" />
                      {currentHorizonData.horizonTitle}
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">{currentHorizonData.description}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs">
                    <span className="text-purple-300 font-bold block mb-0.5">Primary Systemic Bottleneck:</span>
                    <span className="text-slate-300">{currentHorizonData.primaryMechanism}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    High-Probability Breach Candidates ({currentHorizonData.items.length} Monitored)
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {currentHorizonData.items.map((item, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-[#091529] border border-slate-800 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-bold text-slate-200 text-xs">{item.name}</div>
                            <div className="text-[10px] text-slate-500">{item.sector} • Expected: {item.timeline}</div>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 whitespace-nowrap">
                            +{item.projectedScore - item.currentScore} pts
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-slate-800/80">
                          <span className="text-slate-400">Current Risk: <strong className="text-slate-200">{item.currentScore}</strong></span>
                          <span className="text-rose-400 font-bold">Projected: {item.projectedScore}</span>
                        </div>

                        <div className="text-[11px] text-amber-300/90 bg-amber-950/20 p-2.5 rounded-lg border border-amber-500/20">
                          <strong className="text-amber-400 block text-[10px] uppercase">Anticipated Breach Trigger:</strong>
                          {item.trigger}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
