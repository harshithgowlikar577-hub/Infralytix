import { useState, useEffect } from 'react';
import { 
  Radio, ShieldAlert, AlertTriangle, 
  MapPin, RefreshCw, Send, CheckCircle2, 
  ExternalLink, Layers
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RiskBadge, ModeBadge } from '../ui/Badge';
import { formatCurrency } from '../../lib/utils';

interface CommandCenterViewProps {
  data: any;
  riskData: any;
  sectorData: any;
}

export default function CommandCenterView({ data }: CommandCenterViewProps) {
  const navigate = useNavigate();
  const [selectedChokepoint, setSelectedChokepoint] = useState<string>('CP-01');
  const [activeLayers, setActiveLayers] = useState({
    corridors: true,
    chokepoints: true,
    highRiskPins: true,
    satellite: false,
  });
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<Record<string, boolean>>({});
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Real-time Chokepoints across Indian National Corridors
  const chokepoints = [
    {
      id: 'CP-01',
      code: 'KM 142.4 (Palghar Section)',
      corridor: 'Delhi-Mumbai Industrial Corridor (DMIC) / NH-48',
      project: 'INF0001 — Vadodara-Mumbai Expressway P-IV',
      issueType: 'Forest & Wildlife RoW Lapsed',
      delayImpact: '+6.2 Months',
      capitalBlocked: '₹1,180 Cr',
      nodalDept: 'Maharashtra Forest Dept / MoEF&CC',
      escalationLevel: 'Cabinet Secretary / Apex Group',
      slaRemaining: '18h 42m',
      status: 'critical',
      coords: { x: 26, y: 58 },
    },
    {
      id: 'CP-02',
      code: 'Son Nagar - Dankuni Feeder',
      corridor: 'Eastern Dedicated Freight Corridor (EDFC)',
      project: 'INF0042 — High-Speed Freight Link C3',
      issueType: 'Rail Over-Bridge Alignment & Land RoW',
      delayImpact: '+9.4 Months',
      capitalBlocked: '₹2,380 Cr',
      nodalDept: 'Bihar Revenue Dept / Eastern Railway',
      escalationLevel: 'Minister of Railways',
      slaRemaining: '06h 15m',
      status: 'critical',
      coords: { x: 68, y: 44 },
    },
    {
      id: 'CP-03',
      code: 'Talcher Siding Link KM 34',
      corridor: 'Coal Evacuation Rail Corridor',
      project: 'INF0078 — Angul-Sukinda New Broad Gauge Link',
      issueType: 'Tribal Settlement Resettlement Package Dispute',
      delayImpact: '+4.8 Months',
      capitalBlocked: '₹620 Cr',
      nodalDept: 'Odisha Industrial Infrastructure (IDCO)',
      escalationLevel: 'State Chief Secretary',
      slaRemaining: '34h 10m',
      status: 'high_risk',
      coords: { x: 62, y: 54 },
    },
    {
      id: 'CP-04',
      code: 'Vadodara Hub Bypass KM 88',
      corridor: 'Western Dedicated Freight Corridor (WDFC)',
      project: 'INF0094 — Dadri-JNPT High-Capacity Rail',
      issueType: '765kV High-Tension Transmission Line Shifting',
      delayImpact: '+5.1 Months',
      capitalBlocked: '₹840 Cr',
      nodalDept: 'Gujarat GETCO / PGCIL',
      escalationLevel: 'Secretary, Ministry of Power',
      slaRemaining: '42h 00m',
      status: 'high_risk',
      coords: { x: 24, y: 48 },
    },
    {
      id: 'CP-05',
      code: 'Bengaluru Peripheral Ring Link',
      corridor: 'Chennai-Bengaluru Industrial Corridor (CBIC)',
      project: 'INF0156 — STRR Expressway Section 2',
      issueType: 'Wetland Statutory Clearance Hearing Delayed',
      delayImpact: '+3.5 Months',
      capitalBlocked: '₹490 Cr',
      nodalDept: 'Karnataka KRDCL / State Wetland Authority',
      escalationLevel: 'Principal Secretary, PWD',
      slaRemaining: '58h 30m',
      status: 'warning',
      coords: { x: 42, y: 78 },
    }
  ];

  // Live Real-Time Alert Incident Feed
  const liveAlerts = [
    {
      id: 'ALT-8901',
      projectId: 'INF0001',
      projectName: 'Vadodara-Mumbai Expressway P-IV',
      severity: 'critical',
      timestamp: '2m ago',
      title: '3 Critical Path Milestones Breached Simultaneously',
      evidence: 'Earthwork compaction velocity fell below 0.12 km/week; Environmental approval validity lapsed 10 Sep 2026.',
      actionRequired: 'Convene Special Secretary inter-ministerial taskforce.',
    },
    {
      id: 'ALT-8902',
      projectId: 'INF0042',
      projectName: 'High-Speed Freight Corridor C3',
      severity: 'critical',
      timestamp: '14m ago',
      title: 'Capital Burn Mismatch Detected: Spend 64% vs Physical 41%',
      evidence: 'Subcontractor mobilization drawdowns outpaced certified site progress by ₹340 Cr across bridge spans.',
      actionRequired: 'Issue financial escrow freeze notice to EPC consortium.',
    },
    {
      id: 'ALT-8903',
      projectId: 'INF0089',
      projectName: '765kV Super Grid High-Capacity Link',
      severity: 'high_risk',
      timestamp: '38m ago',
      title: 'Tower Foundation Stoppage in 8 Village Jurisdictions',
      evidence: 'Right-of-Way obstruction sustained for 14 consecutive days. Slippage forecast increased by +18 days.',
      actionRequired: 'Dispatch state nodal magistrate intervention order.',
    },
    {
      id: 'ALT-8904',
      projectId: 'INF0104',
      projectName: '4000MW Ultra Mega Solar Park',
      severity: 'warning',
      timestamp: '1h 12m ago',
      title: 'Transformer Import Consignment Stuck at Mundra Port',
      evidence: 'Customs clearance pending for 12 inverter skids; grid synchronization delayed by 3 weeks.',
      actionRequired: 'File priority green-channel customs clearance request.',
    },
    {
      id: 'ALT-8905',
      projectId: 'INF0215',
      projectName: 'Deepwater Multi-Purpose Container Berth',
      severity: 'high_risk',
      timestamp: '2h 05m ago',
      title: 'Breakwater Caisson Settlement Drift Beyond Tolerance',
      evidence: 'Telemetry sensor S-14 recorded 42mm differential seabed settlement during monsoon dredging.',
      actionRequired: 'Mobilize National Institute of Ocean Technology (NIOT) geotechnical inspection team.',
    }
  ];

  const activeChokepointData = chokepoints.find(c => c.id === selectedChokepoint) || chokepoints[0];

  const handleAcknowledge = (alertId: string) => {
    setAcknowledgedAlerts(prev => ({ ...prev, [alertId]: true }));
  };

  return (
    <div className="space-y-8">
      {/* Tactical NOC Header & Live Status Bar */}
      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <span className="w-3.5 h-3.5 rounded-full bg-red-500 animate-ping absolute opacity-75" />
            <span className="w-3 h-3 rounded-full bg-red-500 relative" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-mono-data font-bold tracking-widest text-slate-100 uppercase">
                NATIONAL OPERATIONS CENTER (NOC-1) — ACTIVE TELEMETRY CONSOLE
              </h2>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono-data font-bold bg-red-950/80 text-red-400 border border-red-800 animate-pulse">
                DEFCON 2 · 14 ALARMS ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono-data mt-0.5">
              STREAM: 60 FPS · LATENCY: 42ms · HEARTBEAT: {time.toLocaleTimeString()} IST · INGESTION: 100% (1,981 NODES)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button 
            onClick={() => navigate('/alerts')}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono-data font-bold bg-red-900/60 hover:bg-red-800 text-red-200 border border-red-700 shadow-lg shadow-red-950 transition-all"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            BROADCAST ESCALATION (3 PENDING)
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            title="Force Telemetry Sync"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 6 Tactical Telemetry HUD Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-mono-data">
            <span>NODES ONLINE</span>
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
          </div>
          <p className="text-xl font-bold font-mono-data text-white mt-1">1,981 / 1,981</p>
          <span className="text-[10px] text-emerald-400 font-mono-data">100% Heartbeat Valid</span>
        </div>

        <div className="p-3 rounded-lg bg-red-950/20 border border-red-900/50 flex flex-col justify-between">
          <div className="flex items-center justify-between text-red-400 text-[10px] uppercase font-mono-data">
            <span>CRITICAL ALARMS</span>
            <ShieldAlert className="w-3 h-3 text-red-400" />
          </div>
          <p className="text-xl font-bold font-mono-data text-red-300 mt-1">14 ACTIVE</p>
          <span className="text-[10px] text-red-400 font-mono-data">3 Unacknowledged</span>
        </div>

        <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-mono-data">
            <span>SLIPPAGE VELOCITY</span>
            <AlertTriangle className="w-3 h-3 text-amber-400" />
          </div>
          <p className="text-xl font-bold font-mono-data text-amber-300 mt-1">+0.32 D/D</p>
          <span className="text-[10px] text-amber-400 font-mono-data">Velocity Accelerating</span>
        </div>

        <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-mono-data">
            <span>CHOKEPOINTS</span>
            <MapPin className="w-3 h-3 text-orange-400" />
          </div>
          <p className="text-xl font-bold font-mono-data text-orange-300 mt-1">48 SEGMENTS</p>
          <span className="text-[10px] text-orange-400 font-mono-data">Across 12 Corridors</span>
        </div>

        <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-mono-data">
            <span>SLA BREACH RATE</span>
            <span className="w-2 h-2 rounded-full bg-rose-500" />
          </div>
          <p className="text-xl font-bold font-mono-data text-white mt-1">18.4%</p>
          <span className="text-[10px] text-rose-400 font-mono-data">Contractor Default Index</span>
        </div>

        <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-mono-data">
            <span>CUF GATEWAY</span>
            <CheckCircle2 className="w-3 h-3 text-cyan-400" />
          </div>
          <p className="text-xl font-bold font-mono-data text-cyan-300 mt-1">100% SYNC</p>
          <span className="text-[10px] text-cyan-400 font-mono-data">MoSPI Data Validated</span>
        </div>
      </div>

      {/* Dual-Pane Split Command Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left (60%): Interactive Geospatial Corridor Telemetry Map & Schematic */}
        <div className="lg:col-span-7 glass-card p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-mono-data font-bold text-white uppercase tracking-wider">
                    NATIONAL CORRIDOR SPATIAL TELEMETRY & HOTSPOTS
                  </h3>
                  <ModeBadge mode="observed" />
                </div>
                <p className="text-[11px] text-slate-400">Click any radar chokepoint to inspect telemetry and dispatch escalation</p>
              </div>

              {/* Layer Toggles */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[10px] font-mono-data">
                <button
                  onClick={() => setActiveLayers(p => ({ ...p, corridors: !p.corridors }))}
                  className={`px-2 py-0.5 rounded transition-colors ${activeLayers.corridors ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                >
                  Corridors
                </button>
                <button
                  onClick={() => setActiveLayers(p => ({ ...p, chokepoints: !p.chokepoints }))}
                  className={`px-2 py-0.5 rounded transition-colors ${activeLayers.chokepoints ? 'bg-red-600 text-white' : 'text-slate-400'}`}
                >
                  Chokepoints
                </button>
                <button
                  onClick={() => navigate('/map')}
                  className="px-2 py-0.5 rounded text-blue-400 hover:text-white flex items-center gap-0.5"
                >
                  Full GIS <ExternalLink className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>

            {/* Tactical Vector Map Canvas / Schematic */}
            <div className="relative w-full h-[320px] rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center">
              {/* Tactical Grid Background */}
              <div 
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: 'radial-gradient(circle at 1px 1px, #3B82F6 1px, transparent 0)',
                  backgroundSize: '24px 24px'
                }}
              />

              {/* India Simplified Corridor Schematic Vectors */}
              <svg className="absolute inset-0 w-full h-full p-4 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Golden Quadrilateral / Freight Corridors */}
                {activeLayers.corridors && (
                  <>
                    {/* Delhi (45,22) to Mumbai (26,60) */}
                    <line x1="45" y1="22" x2="26" y2="60" stroke="#3B82F6" strokeWidth="1.2" strokeDasharray="2 1" />
                    {/* Mumbai (26,60) to Chennai (48,82) */}
                    <line x1="26" y1="60" x2="48" y2="82" stroke="#3B82F6" strokeWidth="1.2" strokeDasharray="2 1" />
                    {/* Chennai (48,82) to Kolkata (74,48) */}
                    <line x1="48" y1="82" x2="74" y2="48" stroke="#3B82F6" strokeWidth="1.2" strokeDasharray="2 1" />
                    {/* Kolkata (74,48) to Delhi (45,22) */}
                    <line x1="74" y1="48" x2="45" y2="22" stroke="#3B82F6" strokeWidth="1.2" strokeDasharray="2 1" />
                    {/* East-West Corridor cross-link */}
                    <line x1="24" y1="48" x2="74" y2="48" stroke="#10B981" strokeWidth="0.8" opacity="0.6" />
                  </>
                )}
              </svg>

              {/* Major Metro Anchor Nodes */}
              <div className="absolute top-[20%] left-[45%] flex items-center gap-1 pointer-events-none">
                <span className="w-2 h-2 rounded-full bg-cyan-400 ring-4 ring-cyan-400/20" />
                <span className="text-[9px] font-mono-data font-bold text-slate-300">DELHI (NCR)</span>
              </div>
              <div className="absolute top-[58%] left-[24%] flex items-center gap-1 pointer-events-none">
                <span className="w-2 h-2 rounded-full bg-cyan-400 ring-4 ring-cyan-400/20" />
                <span className="text-[9px] font-mono-data font-bold text-slate-300">MUMBAI (JNPT)</span>
              </div>
              <div className="absolute top-[46%] left-[74%] flex items-center gap-1 pointer-events-none">
                <span className="w-2 h-2 rounded-full bg-cyan-400 ring-4 ring-cyan-400/20" />
                <span className="text-[9px] font-mono-data font-bold text-slate-300">KOLKATA</span>
              </div>
              <div className="absolute top-[80%] left-[47%] flex items-center gap-1 pointer-events-none">
                <span className="w-2 h-2 rounded-full bg-cyan-400 ring-4 ring-cyan-400/20" />
                <span className="text-[9px] font-mono-data font-bold text-slate-300">CHENNAI</span>
              </div>

              {/* Interactive Chokepoint Hotspots with Radar Pulse */}
              {activeLayers.chokepoints && chokepoints.map((cp) => {
                const isSelected = selectedChokepoint === cp.id;
                const isCritical = cp.status === 'critical';
                return (
                  <button
                    key={cp.id}
                    onClick={() => setSelectedChokepoint(cp.id)}
                    style={{ top: `${cp.coords.y}%`, left: `${cp.coords.x}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer p-2 focus:outline-none"
                    title={`${cp.code}: ${cp.issueType}`}
                  >
                    <div className="relative flex items-center justify-center">
                      <span className={`w-6 h-6 rounded-full animate-ping absolute opacity-60 ${isCritical ? 'bg-red-500' : 'bg-orange-500'}`} />
                      <span className={`w-3.5 h-3.5 rounded-full border-2 border-white shadow-lg transition-transform group-hover:scale-125 ${
                        isSelected 
                          ? 'bg-white ring-4 ring-red-500 scale-125' 
                          : isCritical 
                            ? 'bg-red-500' 
                            : 'bg-orange-500'
                      }`} />
                    </div>
                    <span className={`absolute top-full mt-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded text-[8px] font-mono-data whitespace-nowrap font-bold shadow-md transition-all ${
                      isSelected ? 'bg-red-600 text-white' : 'bg-slate-900/90 text-slate-300 border border-slate-700'
                    }`}>
                      {cp.id}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Chokepoint Telemetry Strip */}
            <div className="mt-3 p-3 rounded-lg bg-slate-900/90 border border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono-data font-bold text-red-400 bg-red-950/60 px-1.5 py-0.5 rounded border border-red-800">
                    {activeChokepointData.id}
                  </span>
                  <span className="font-semibold text-white">{activeChokepointData.code}</span>
                  <span className="text-slate-400 font-mono-data">· {activeChokepointData.corridor}</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  <strong className="text-rose-300">Issue:</strong> {activeChokepointData.issueType} · 
                  <strong className="text-amber-300 ml-1">Delay:</strong> {activeChokepointData.delayImpact} · 
                  <strong className="text-white ml-1">Blocked:</strong> {activeChokepointData.capitalBlocked}
                </p>
                <p className="text-[10px] text-slate-400">
                  Pending with: <span className="text-slate-200">{activeChokepointData.nodalDept}</span> · Escalation Level: <span className="text-amber-400">{activeChokepointData.escalationLevel}</span>
                </p>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <div className="text-right">
                  <span className="text-[9px] uppercase text-slate-400 block font-mono-data">SLA TIMER</span>
                  <span className="text-xs font-mono-data font-bold text-red-400 animate-pulse">{activeChokepointData.slaRemaining}</span>
                </div>
                <button
                  onClick={() => navigate(`/projects/${activeChokepointData.project.split(' ')[0]}`)}
                  className="px-2.5 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-mono-data text-[11px] font-bold transition-colors"
                >
                  DISPATCH ESCALATION
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right (40%): Live Chronological Alert Triage Feed */}
        <div className="lg:col-span-5 glass-card p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-mono-data font-bold text-white uppercase tracking-wider">
                    REAL-TIME INCIDENT TRIAGE STREAM
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                </div>
                <p className="text-[11px] text-slate-400">Automated multi-factor anomaly detection feed</p>
              </div>

              <span className="text-[10px] font-mono-data text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                5 Active Incidents
              </span>
            </div>

            {/* Alert Cards List */}
            <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
              {liveAlerts.map((alert) => {
                const isAck = acknowledgedAlerts[alert.id];
                const isCrit = alert.severity === 'critical';
                const isHigh = alert.severity === 'high_risk';

                return (
                  <div 
                    key={alert.id}
                    className={`p-3 rounded-lg border transition-all ${
                      isAck 
                        ? 'bg-slate-950/40 border-slate-800/60 opacity-60' 
                        : isCrit
                          ? 'bg-red-950/20 border-l-4 border-l-red-600 border-red-900/40'
                          : isHigh
                            ? 'bg-orange-950/20 border-l-4 border-l-orange-500 border-orange-900/40'
                            : 'bg-slate-900/80 border-l-4 border-l-amber-400 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono-data font-bold text-slate-300">
                          {alert.id}
                        </span>
                        <span className="text-[10px] text-slate-500">·</span>
                        <span className="text-[10px] font-mono-data text-blue-400 font-bold">
                          {alert.projectId}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono-data text-slate-400">
                        {alert.timestamp}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-100">
                      {alert.title}
                    </h4>

                    <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                      {alert.evidence}
                    </p>

                    <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-amber-300 font-mono-data truncate">
                        ⚡ {alert.actionRequired}
                      </span>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!isAck ? (
                          <button
                            onClick={() => handleAcknowledge(alert.id)}
                            className="px-2 py-0.5 rounded text-[10px] font-mono-data font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                          >
                            Acknowledge
                          </button>
                        ) : (
                          <span className="text-[10px] font-mono-data text-emerald-400 flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" /> Logged
                          </span>
                        )}
                        <button
                          onClick={() => navigate(`/projects/${alert.projectId}`)}
                          className="px-2 py-0.5 rounded text-[10px] font-mono-data font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                        >
                          Triage
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 mt-2 flex items-center justify-between text-xs text-slate-400">
            <span>SLA Response Window:</span>
            <span className="font-mono-data text-emerald-400 font-semibold">98.2% on-time audit logging</span>
          </div>
        </div>
      </div>

      {/* Row 3: High-Density Tactical Chokepoint Grid */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-mono-data font-bold text-white uppercase tracking-wider">
              ACTIVE CORRIDOR BOTTLENECK ESCALATION MATRIX
            </h3>
            <span className="px-2 py-0.2 rounded text-[9px] font-mono-data bg-slate-800 text-slate-300">
              Showing 5 of 48 Chokepoints
            </span>
          </div>
          <button 
            onClick={() => navigate('/radar')}
            className="text-xs font-mono-data text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
          >
            Open Risk Radar Matrix →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-mono-data bg-slate-900/60">
                <th className="py-2.5 px-3">Chokepoint ID</th>
                <th className="py-2.5 px-3">Segment Location</th>
                <th className="py-2.5 px-3">Corridor & Mega-Project</th>
                <th className="py-2.5 px-3">Primary Bottleneck</th>
                <th className="py-2.5 px-3">Capital Locked</th>
                <th className="py-2.5 px-3">Delay Impact</th>
                <th className="py-2.5 px-3">Owning Department</th>
                <th className="py-2.5 px-3">SLA Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {chokepoints.map((cp) => (
                <tr 
                  key={cp.id}
                  onClick={() => setSelectedChokepoint(cp.id)}
                  className={`hover:bg-slate-800/50 cursor-pointer transition-colors ${
                    selectedChokepoint === cp.id ? 'bg-slate-800/70 border-l-2 border-l-blue-500' : ''
                  }`}
                >
                  <td className="py-2 px-3 font-mono-data font-bold text-blue-400">{cp.id}</td>
                  <td className="py-2 px-3 font-semibold text-slate-200">{cp.code}</td>
                  <td className="py-2 px-3 text-slate-300 truncate max-w-[180px]">{cp.project}</td>
                  <td className="py-2 px-3 text-rose-300 truncate max-w-[200px]">{cp.issueType}</td>
                  <td className="py-2 px-3 font-mono-data font-bold text-white">{cp.capitalBlocked}</td>
                  <td className="py-2 px-3 font-mono-data text-amber-400 font-semibold">{cp.delayImpact}</td>
                  <td className="py-2 px-3 text-slate-400">{cp.nodalDept}</td>
                  <td className="py-2 px-3">
                    <span className="font-mono-data text-[10px] font-bold text-red-400 bg-red-950/40 px-1.5 py-0.5 rounded border border-red-800">
                      {cp.slaRemaining}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/projects/${cp.project.split(' ')[0]}`);
                      }}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white font-mono-data text-[10px] font-semibold transition-colors"
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
