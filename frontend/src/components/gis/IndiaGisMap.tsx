import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Minus, Crosshair, MapPin, ExternalLink, ShieldAlert, CheckCircle2, Layers, RotateCcw } from 'lucide-react';
import { formatCurrency, getRiskBadgeClass } from '../../lib/utils';
import { INDIA_STATES, projectCoord, IndiaStatePath } from './indiaMapData';
import { projectsAPI } from '../../lib/api';

export interface ProjectMarker {
  id: string;
  project_id: string;
  project_name: string;
  state: string;
  ministry?: string;
  sector?: string;
  latitude: number;
  longitude: number;
  risk_level: string;
  risk_score?: number;
  progress_percentage: number;
  current_cost?: number;
  status?: string;
}

interface IndiaGisMapProps {
  projects?: ProjectMarker[];
  selectedState?: string | null;
  onSelectState?: (state: string | null) => void;
  height?: number | string;
  compact?: boolean;
  viewMode?: 'risk' | 'progress' | 'capital';
  onViewModeChange?: (mode: 'risk' | 'progress' | 'capital') => void;
}

function normalizeStateName(name: string): string {
  if (!name) return '';
  const n = name.trim().toLowerCase();
  if (n.includes('jammu') || n.includes('kashmir')) return 'Jammu & Kashmir';
  if (n.includes('odisha') || n.includes('orissa')) return 'Odisha';
  if (n.includes('uttarakhand') || n.includes('uttaranchal')) return 'Uttarakhand';
  if (n.includes('andaman')) return 'Andaman & Nicobar Islands';
  if (n.includes('dadra') || n.includes('daman')) return 'Gujarat';
  if (n.includes('delhi')) return 'Delhi';
  return name.trim();
}

// Marker Risk Color Coding:
// Green = Healthy Project
// Yellow = Warning / Medium
// Orange = High Risk
// Red = Critical
function getRiskMarkerColor(risk: string | number | undefined) {
  if (typeof risk === 'number') {
    if (risk >= 80) return '#ef4444'; // Red (Critical)
    if (risk >= 60) return '#f97316'; // Orange (High Risk)
    if (risk >= 40) return '#eab308'; // Yellow (Warning / Medium)
    return '#10b981'; // Green (Healthy Project)
  }
  const r = (risk || '').toLowerCase();
  if (r.includes('crit')) return '#ef4444';
  if (r.includes('high')) return '#f97316';
  if (r.includes('med') || r.includes('warn')) return '#eab308';
  return '#10b981';
}

function getRiskScoreValue(p: ProjectMarker): number {
  if (typeof p.risk_score === 'number') return p.risk_score;
  const r = (p.risk_level || '').toLowerCase();
  if (r.includes('crit')) return 88;
  if (r.includes('high')) return 72;
  if (r.includes('med')) return 48;
  return 22;
}

export default function IndiaGisMap({
  projects,
  selectedState: controlledState = null,
  onSelectState,
  height = 480,
  compact = false,
  viewMode: controlledViewMode,
  onViewModeChange,
}: IndiaGisMapProps) {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const [internalState, setInternalState] = useState<string | null>(null);
  const selectedState = controlledState !== undefined ? controlledState : internalState;

  const handleSelectState = (state: string | null) => {
    setInternalState(state);
    onSelectState?.(state);
  };

  const [hoveredProject, setHoveredProject] = useState<ProjectMarker | null>(null);
  const [hoveredCluster, setHoveredCluster] = useState<{ id: string; count: number; x: number; y: number; names: string[] } | null>(null);
  const [hoveredState, setHoveredState] = useState<IndiaStatePath | null>(null);
  const [stateTooltipPos, setStateTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [internalViewMode, setInternalViewMode] = useState<'risk' | 'progress' | 'capital'>('risk');

  // Dynamic project fetch from live API if projects prop is not provided or empty
  const [fetchedProjects, setFetchedProjects] = useState<ProjectMarker[]>([]);
  useEffect(() => {
    if (!projects || projects.length === 0) {
      let isMounted = true;
      projectsAPI.list({ limit: 100 })
        .then((res: any) => {
          if (!isMounted) return;
          const items = res?.data?.items || res?.data?.projects || res?.data || [];
          if (Array.isArray(items) && items.length > 0) {
            setFetchedProjects(items.map((it: any) => ({
              id: it.id || it.project_id,
              project_id: it.project_id || it.id,
              project_name: it.project_name || it.name,
              state: it.state || '',
              ministry: it.ministry || '',
              sector: it.sector || 'Infrastructure',
              latitude: Number(it.latitude) || 0,
              longitude: Number(it.longitude) || 0,
              risk_level: it.risk_level || 'Low',
              risk_score: it.risk_score,
              progress_percentage: Number(it.progress_percentage) || 50,
              current_cost: Number(it.current_cost) || 0,
              status: it.status || 'Active',
            })));
          }
        })
        .catch(() => {
          // Keep default fallback
        });
      return () => {
        isMounted = false;
      };
    }
  }, [projects]);

  const activeViewMode = controlledViewMode ?? internalViewMode;
  const setViewMode = (mode: 'risk' | 'progress' | 'capital') => {
    setInternalViewMode(mode);
    onViewModeChange?.(mode);
  };

  const handleFitIndia = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    handleSelectState(null);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'svg' || target.tagName === 'rect' || target.tagName === 'path') {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Resolve projects pool
  const allProjects: ProjectMarker[] = useMemo(() => {
    if (projects && projects.length > 0) return projects;
    if (fetchedProjects.length > 0) return fetchedProjects;
    return [
      { id: 'INF0001', project_id: 'INF0001', project_name: 'Delhi–Mumbai Expressway Corridor', state: 'Maharashtra', ministry: 'MoRTH', sector: 'Transport & Logistics', latitude: 19.0760, longitude: 72.8777, risk_level: 'Critical', risk_score: 88, progress_percentage: 42, current_cost: 98000 },
      { id: 'INF0002', project_id: 'INF0002', project_name: 'Western Dedicated Freight Corridor', state: 'Gujarat', ministry: 'Ministry of Railways', sector: 'Transport & Logistics', latitude: 23.0225, longitude: 72.5714, risk_level: 'High', risk_score: 74, progress_percentage: 68, current_cost: 51000 },
      { id: 'INF0003', project_id: 'INF0003', project_name: 'Eastern Peripheral Highway', state: 'Uttar Pradesh', ministry: 'MoRTH', sector: 'Transport & Logistics', latitude: 28.6139, longitude: 77.2090, risk_level: 'Medium', risk_score: 48, progress_percentage: 84, current_cost: 11000 },
      { id: 'INF0004', project_id: 'INF0004', project_name: 'Bengaluru Suburban Rail Phase 2', state: 'Karnataka', ministry: 'Ministry of Railways', sector: 'Transport & Logistics', latitude: 12.9716, longitude: 77.5946, risk_level: 'Critical', risk_score: 82, progress_percentage: 29, current_cost: 15767 },
      { id: 'INF0005', project_id: 'INF0005', project_name: 'Ultra Mega Solar Park Expansion', state: 'Rajasthan', ministry: 'MNRE', sector: 'Energy', latitude: 27.5000, longitude: 72.0000, risk_level: 'Low', risk_score: 22, progress_percentage: 91, current_cost: 8200 },
      { id: 'INF0006', project_id: 'INF0006', project_name: 'Chennai Port Elevated Corridor', state: 'Tamil Nadu', ministry: 'Ministry of Ports', sector: 'Transport & Logistics', latitude: 13.0827, longitude: 80.2707, risk_level: 'High', risk_score: 76, progress_percentage: 55, current_cost: 5800 },
      { id: 'INF0007', project_id: 'INF0007', project_name: 'Kolkata Metro Extension Line', state: 'West Bengal', ministry: 'Ministry of Railways', sector: 'Transport & Logistics', latitude: 22.5726, longitude: 88.3639, risk_level: 'High', risk_score: 71, progress_percentage: 62, current_cost: 8600 },
      { id: 'INF0008', project_id: 'INF0008', project_name: 'Paradip Port Smart Terminal', state: 'Odisha', ministry: 'Ministry of Ports', sector: 'Transport & Logistics', latitude: 20.3160, longitude: 86.6110, risk_level: 'Low', risk_score: 30, progress_percentage: 85, current_cost: 3200 },
      { id: 'INF0009', project_id: 'INF0009', project_name: 'Brahmaputra Bridge Feeder Road', state: 'Assam', ministry: 'MoRTH', sector: 'Transport & Logistics', latitude: 26.1445, longitude: 91.7362, risk_level: 'Medium', risk_score: 54, progress_percentage: 45, current_cost: 4100 },
      { id: 'INF0010', project_id: 'INF0010', project_name: 'Kochi Water Metro Integration', state: 'Kerala', ministry: 'MoHUA', sector: 'Water & Sanitation', latitude: 9.9312, longitude: 76.2673, risk_level: 'Low', risk_score: 18, progress_percentage: 96, current_cost: 1137 },
      { id: 'INF0011', project_id: 'INF0011', project_name: 'Hyderabad Regional Ring Corridor', state: 'Telangana', ministry: 'MoRTH', sector: 'Transport & Logistics', latitude: 17.3850, longitude: 78.4867, risk_level: 'Medium', risk_score: 44, progress_percentage: 72, current_cost: 17000 },
      { id: 'INF0012', project_id: 'INF0012', project_name: 'Indore-Bhopal Economic Highway', state: 'Madhya Pradesh', ministry: 'MoRTH', sector: 'Transport & Logistics', latitude: 23.2599, longitude: 77.4126, risk_level: 'Low', risk_score: 28, progress_percentage: 88, current_cost: 4500 },
    ];
  }, [projects, fetchedProjects]);

  // Filter projects by selected state if active
  const displayProjects = useMemo(() => {
    if (!selectedState) return allProjects;
    const norm = normalizeStateName(selectedState).toLowerCase();
    const filtered = allProjects.filter((p) => {
      const pState = normalizeStateName(p.state || '').toLowerCase();
      return pState === norm || pState.includes(norm) || norm.includes(pState);
    });
    return filtered.length > 0 ? filtered : allProjects;
  }, [allProjects, selectedState]);

  // State-level aggregation dictionary for State Hover Tooltip
  const stateStats = useMemo(() => {
    const stats: Record<string, { total: number; healthy: number; atRisk: number; critical: number }> = {};
    allProjects.forEach((p) => {
      if (!p.state) return;
      const st = normalizeStateName(p.state);
      if (!stats[st]) {
        stats[st] = { total: 0, healthy: 0, atRisk: 0, critical: 0 };
      }
      stats[st].total += 1;
      const score = getRiskScoreValue(p);
      if (score >= 80) stats[st].critical += 1;
      else if (score >= 40) stats[st].atRisk += 1;
      else stats[st].healthy += 1;
    });
    return stats;
  }, [allProjects]);

  // Project clustering when zoomed out (< 1.25)
  const { clusters, unclustered } = useMemo(() => {
    if (zoom >= 1.25) {
      return { clusters: [], unclustered: displayProjects };
    }

    const threshold = 48;
    const assigned = new Set<string>();
    const clusterResults: Array<{
      id: string;
      cx: number;
      cy: number;
      projects: ProjectMarker[];
      highestRiskColor: string;
    }> = [];

    const projected = displayProjects
      .filter((p) => p.latitude && p.longitude)
      .map((p) => {
        const [cx, cy] = projectCoord(p.latitude, p.longitude);
        return { ...p, cx, cy };
      });

    projected.forEach((p, idx) => {
      if (assigned.has(p.id)) return;
      const group = [p];
      assigned.add(p.id);

      for (let j = idx + 1; j < projected.length; j++) {
        const other = projected[j];
        if (assigned.has(other.id)) return;
        const dist = Math.hypot(p.cx - other.cx, p.cy - other.cy);
        if (dist < threshold) {
          group.push(other);
          assigned.add(other.id);
        }
      }

      if (group.length > 1) {
        const avgX = Math.round(group.reduce((s, it) => s + it.cx, 0) / group.length);
        const avgY = Math.round(group.reduce((s, it) => s + it.cy, 0) / group.length);
        const maxScore = group.reduce((max, it) => Math.max(max, getRiskScoreValue(it)), 0);
        clusterResults.push({
          id: `cluster-${idx}`,
          cx: avgX,
          cy: avgY,
          projects: group,
          highestRiskColor: getRiskMarkerColor(maxScore),
        });
      }
    });

    const unclusteredList = displayProjects.filter(
      (p) => !clusterResults.some((c) => c.projects.some((cp) => cp.id === p.id))
    );
    return { clusters: clusterResults, unclustered: unclusteredList };
  }, [displayProjects, zoom]);

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-2xl bg-[#030914] border border-[#14233D] overflow-hidden flex flex-col select-none"
      style={{ height }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Top Map Header Controls */}
      <div className="absolute top-2.5 left-2.5 right-2.5 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto bg-[#071324]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#1E3354] shadow-lg">
          <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
            <span
              onClick={handleFitIndia}
              className={selectedState ? 'cursor-pointer hover:text-blue-400 text-slate-400 transition-colors' : 'text-slate-200'}
            >
              National GIS
            </span>
            {selectedState && (
              <>
                <span className="text-slate-600">›</span>
                <span className="text-blue-400">{selectedState}</span>
                <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {displayProjects.length} Projects
                </span>
                <button
                  onClick={handleFitIndia}
                  className="text-[10px] text-slate-400 hover:text-rose-300 font-semibold ml-1 px-1.5 py-0.5 rounded hover:bg-rose-500/10 transition-colors cursor-pointer"
                  title="Return to National Overview"
                >
                  ✕ Reset
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {/* View mode toggle (hidden in compact mode) */}
          {!compact && (
            <div className="flex bg-[#071324]/90 backdrop-blur-md border border-[#1E3354] rounded-xl p-0.5 text-[11px] text-slate-300 shadow-lg">
              <button
                onClick={() => setViewMode('risk')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  activeViewMode === 'risk' ? 'bg-blue-600 text-white font-bold' : 'hover:text-white'
                }`}
              >
                Risk View
              </button>
              <button
                onClick={() => setViewMode('progress')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  activeViewMode === 'progress' ? 'bg-blue-600 text-white font-bold' : 'hover:text-white'
                }`}
              >
                Progress
              </button>
              <button
                onClick={() => setViewMode('capital')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeViewMode === 'capital' ? 'bg-cyan-600 text-white font-bold shadow-xs' : 'hover:text-white'
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>Capital Exposure</span>
              </button>
            </div>
          )}

          {/* Zoom & Fit India Controls */}
          <div className="flex items-center bg-[#071324]/90 backdrop-blur-md border border-[#1E3354] rounded-xl overflow-hidden shadow-lg">
            <button
              onClick={() => setZoom((z) => Math.min(2.8, z + 0.3))}
              title="Zoom In"
              className="p-1.5 px-2 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors border-r border-[#1E3354] cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(0.75, z - 0.3))}
              title="Zoom Out"
              className="p-1.5 px-2 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors border-r border-[#1E3354] cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleFitIndia}
              title="Fit India & Reset View"
              className="px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors border-r border-[#1E3354] flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3 text-cyan-400" />
              <span>Fit India</span>
            </button>
            <button
              onClick={handleFitIndia}
              title="Reset Coordinates"
              className="p-1.5 px-2 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Crosshair className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div
        className={`w-full h-full flex items-center justify-center p-2 overflow-hidden ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        <svg
          viewBox="20 15 760 850"
          className="w-full h-full transition-transform duration-200 ease-out"
          style={{
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
          }}
        >
          <defs>
            <filter id="gisGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id="oceanGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#040C1A" />
              <stop offset="100%" stopColor="#020710" />
            </linearGradient>
            <linearGradient id="selectedStateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E40AF" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0.6" />
            </linearGradient>
          </defs>

          {/* Background Ocean / Territorial Canvas */}
          <rect x="0" y="0" width="800" height="900" fill="url(#oceanGrad)" />

          {/* Latitude & Longitude Reference Grid Lines */}
          <g stroke="#0E1E38" strokeWidth="0.5" strokeDasharray="3 6">
            <line x1="40" y1="200" x2="760" y2="200" />
            <line x1="40" y1="400" x2="760" y2="400" />
            <line x1="40" y1="600" x2="760" y2="600" />
            <line x1="200" y1="30" x2="200" y2="850" />
            <line x1="400" y1="30" x2="400" y2="850" />
            <line x1="600" y1="30" x2="600" y2="850" />
          </g>

          {/* Accurate Indian State Geographic Polygons */}
          <g>
            {INDIA_STATES.map((s) => {
              const isSelected = selectedState && normalizeStateName(selectedState).toLowerCase() === normalizeStateName(s.name).toLowerCase();
              const isHovered = hoveredState?.id === s.id;

              return (
                <path
                  key={s.id}
                  id={`state-${s.id}`}
                  d={s.d}
                  fill={
                    isSelected
                      ? 'url(#selectedStateGrad)'
                      : isHovered
                      ? '#172554'
                      : '#0B192F'
                  }
                  stroke={isSelected ? '#60A5FA' : isHovered ? '#38BDF8' : '#1E3A5F'}
                  strokeWidth={isSelected ? 2.2 : isHovered ? 1.6 : 1.1}
                  strokeLinejoin="round"
                  className="transition-colors duration-150 cursor-pointer"
                  onMouseEnter={(e) => {
                    setHoveredState(s);
                    const rect = containerRef.current?.getBoundingClientRect();
                    if (rect) {
                      setStateTooltipPos({
                        x: e.clientX - rect.left,
                        y: e.clientY - rect.top,
                      });
                    }
                  }}
                  onMouseMove={(e) => {
                    const rect = containerRef.current?.getBoundingClientRect();
                    if (rect) {
                      setStateTooltipPos({
                        x: e.clientX - rect.left,
                        y: e.clientY - rect.top,
                      });
                    }
                  }}
                  onMouseLeave={() => {
                    setHoveredState(null);
                    setStateTooltipPos(null);
                  }}
                  onClick={() => handleSelectState(isSelected ? null : s.name)}
                />
              );
            })}
          </g>

          {/* State Names (Rendered when zoomed in or on state hover) */}
          {(zoom >= 1.25 || compact) && (
            <g className="pointer-events-none select-none transition-opacity duration-300">
              {INDIA_STATES.map((s) => {
                if (s.name.includes('Island') || s.name.includes('Dadra') || s.name.includes('Daman') || s.name === 'Goa') {
                  if (zoom < 1.6) return null;
                }
                return (
                  <text
                    key={`label-${s.id}`}
                    x={s.cx}
                    y={s.cy}
                    textAnchor="middle"
                    fill="#94A3B8"
                    fontSize={Math.max(8.5, 10.5 / zoom)}
                    fontWeight="600"
                    opacity={selectedState && normalizeStateName(selectedState) === normalizeStateName(s.name) ? 1 : 0.75}
                  >
                    {s.name}
                  </text>
                );
              })}
            </g>
          )}

          {/* Cluster Markers (Rendered when zoomed out) */}
          <g>
            {clusters.map((cluster) => {
              const isHovered = hoveredCluster?.id === cluster.id;
              return (
                <g
                  key={cluster.id}
                  transform={`translate(${cluster.cx}, ${cluster.cy})`}
                  className="cursor-pointer"
                  onClick={() => {
                    setZoom(1.8);
                    setPan({
                      x: -(cluster.cx - 380) * 0.75,
                      y: -(cluster.cy - 400) * 0.75,
                    });
                    setHoveredCluster(null);
                  }}
                  onMouseEnter={() =>
                    setHoveredCluster({
                      id: cluster.id,
                      count: cluster.projects.length,
                      x: cluster.cx,
                      y: cluster.cy,
                      names: cluster.projects.map((p) => p.project_name),
                    })
                  }
                  onMouseLeave={() => setHoveredCluster(null)}
                >
                  {/* Ping animation effect */}
                  <circle
                    r={isHovered ? 22 : 16}
                    fill={cluster.highestRiskColor}
                    opacity="0.25"
                    className="animate-ping"
                    style={{ animationDuration: '2.5s' }}
                  />
                  {/* Cluster Core Circle */}
                  <circle
                    r={isHovered ? 15 : 12}
                    fill="#0B1D3A"
                    stroke={cluster.highestRiskColor}
                    strokeWidth="2.5"
                    filter="url(#gisGlow)"
                  />
                  {/* Cluster Count Text */}
                  <text
                    textAnchor="middle"
                    dy="3.5"
                    fontSize="9.5"
                    fontWeight="bold"
                    fill="#F8FAFC"
                    className="pointer-events-none select-none font-mono"
                  >
                    {cluster.projects.length}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Real Project Markers (Unclustered or Detailed View) */}
          <g>
            {(zoom >= 1.25 ? displayProjects : unclustered).map((p) => {
              if (!p.latitude || !p.longitude) return null;
              const [cx, cy] = projectCoord(p.latitude, p.longitude);
              const isHovered = hoveredProject?.id === p.id;
              const costCr = p.current_cost || 5000;
              const capitalRadius = Math.max(6, Math.min(24, Math.round(Math.sqrt(costCr / 100) * 1.8)));

              const riskScore = getRiskScoreValue(p);
              const riskColor = getRiskMarkerColor(riskScore);
              const progressColor =
                p.progress_percentage >= 75 ? '#10b981' : p.progress_percentage >= 40 ? '#eab308' : '#ef4444';

              const markerColor =
                activeViewMode === 'risk'
                  ? riskColor
                  : activeViewMode === 'progress'
                  ? progressColor
                  : '#06b6d4';

              const baseRadius =
                activeViewMode === 'capital'
                  ? (isHovered ? capitalRadius + 3 : capitalRadius)
                  : (isHovered ? 7.5 : 5);

              const pulseRadius =
                activeViewMode === 'capital'
                  ? capitalRadius + 8
                  : (isHovered ? 14 : 8);

              return (
                <g
                  key={p.id}
                  transform={`translate(${cx}, ${cy})`}
                  className="cursor-pointer"
                  onClick={() => navigate(`/projects/${p.project_id || p.id}`)}
                  onMouseEnter={() => setHoveredProject(p)}
                  onMouseLeave={() => setHoveredProject(null)}
                >
                  {/* Glowing Radar Pulse */}
                  <circle
                    r={pulseRadius}
                    fill={activeViewMode === 'capital' ? '#06b6d4' : markerColor}
                    opacity={activeViewMode === 'capital' ? '0.22' : '0.22'}
                    className="animate-ping"
                    style={{ animationDuration: activeViewMode === 'capital' ? '3s' : '2.5s' }}
                  />
                  {/* Marker Core */}
                  <circle
                    r={baseRadius}
                    fill={activeViewMode === 'capital' ? '#082f49' : markerColor}
                    fillOpacity={activeViewMode === 'capital' ? '0.85' : '1'}
                    stroke={activeViewMode === 'capital' ? riskColor : '#030914'}
                    strokeWidth={activeViewMode === 'capital' ? (isHovered ? 3 : 2) : 1.5}
                    filter="url(#gisGlow)"
                  />
                  {activeViewMode === 'capital' && capitalRadius >= 12 && (
                    <text
                      textAnchor="middle"
                      dy="3.5"
                      fontSize="9"
                      fontWeight="bold"
                      fill="#e0f2fe"
                      className="pointer-events-none select-none font-mono"
                    >
                      {costCr >= 10000 ? `${Math.round(costCr / 1000)}k` : `${Math.round(costCr)}`}
                    </text>
                  )}
                </g>
              );
            })}
          </g>

          {/* Regional Cluster Hover Card */}
          {hoveredCluster && (
            <g className="pointer-events-none transition-all duration-200">
              <foreignObject
                x={Math.min(Math.max(hoveredCluster.x - 100, 40), 540)}
                y={hoveredCluster.y > 350 ? hoveredCluster.y - 115 : hoveredCluster.y + 15}
                width="220"
                height="110"
              >
                <div className="bg-[#071324]/95 backdrop-blur-md border border-blue-500/40 rounded-xl p-3 shadow-2xl text-xs space-y-1 text-white">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                    <span className="font-bold text-white text-xs">Regional Cluster</span>
                    <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold">
                      {hoveredCluster.count} Projects
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-300 line-clamp-2 pt-0.5">
                    {hoveredCluster.names.slice(0, 3).join(', ')}
                    {hoveredCluster.names.length > 3 && ` +${hoveredCluster.names.length - 3} more`}
                  </div>
                  <div className="text-[10px] text-cyan-400 font-semibold pt-1 flex items-center gap-1">
                    <span>Click cluster to zoom & expand →</span>
                  </div>
                </div>
              </foreignObject>
            </g>
          )}

          {/* Project Hover Summary Card */}
          {hoveredProject && (
            (() => {
              const [px, py] = projectCoord(hoveredProject.latitude, hoveredProject.longitude);
              const cardX = Math.min(Math.max(px - 110, 40), 520);
              const cardY = py > 360 ? py - 150 : py + 15;
              const riskScore = getRiskScoreValue(hoveredProject);
              const riskColor = getRiskMarkerColor(riskScore);

              return (
                <g className="pointer-events-none transition-all duration-200">
                  <foreignObject x={cardX} y={cardY} width="240" height="145">
                    <div className="bg-[#071324]/95 backdrop-blur-md border border-[#1E3354] rounded-xl p-3 shadow-2xl text-xs space-y-1.5 text-white">
                      <div className="flex items-start justify-between gap-1.5">
                        <span className="font-bold text-slate-100 line-clamp-1 leading-tight text-[11px]">
                          {hoveredProject.project_name}
                        </span>
                        <span
                          className="px-1.5 py-0.5 rounded text-[9px] font-bold text-white uppercase shrink-0"
                          style={{ backgroundColor: riskColor }}
                        >
                          {hoveredProject.risk_level}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>📍 {hoveredProject.state}</span>
                        <span className="text-cyan-400 font-mono font-semibold">
                          {hoveredProject.ministry || hoveredProject.sector}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-300 font-mono pt-0.5">
                        <span className="text-slate-400">Capital Outlay:</span>
                        <span className="text-emerald-400 font-bold">{formatCurrency(hoveredProject.current_cost || 0)}</span>
                      </div>
                      <div className="space-y-1 pt-1 border-t border-slate-800">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-slate-400">
                            Risk Score: <strong className="text-white">{riskScore}/100</strong>
                          </span>
                          <span className="text-slate-400">
                            Progress: <strong className="text-emerald-400">{hoveredProject.progress_percentage}%</strong>
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-500 h-full rounded-full transition-all"
                            style={{ width: `${hoveredProject.progress_percentage}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-[9px] text-blue-400 font-medium pt-0.5 text-right flex items-center justify-end gap-1">
                        <span>Open Project Intelligence</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </div>
                    </div>
                  </foreignObject>
                </g>
              );
            })()
          )}
        </svg>
      </div>

      {/* State Hover Tooltip: State Name, Projects Count, Healthy, At Risk, Critical */}
      {hoveredState && stateTooltipPos && !hoveredProject && !hoveredCluster && (
        (() => {
          const normName = normalizeStateName(hoveredState.name);
          const stInfo = stateStats[normName] || { total: 0, healthy: 0, atRisk: 0, critical: 0 };
          const posX = Math.min(Math.max(stateTooltipPos.x + 12, 12), (containerRef.current?.clientWidth || 500) - 210);
          const posY = Math.min(Math.max(stateTooltipPos.y - 65, 12), (containerRef.current?.clientHeight || 400) - 100);

          return (
            <div
              className="absolute pointer-events-none z-30 transition-all duration-75 ease-out"
              style={{ left: posX, top: posY }}
            >
              <div className="bg-[#071324]/95 backdrop-blur-md border border-blue-500/50 rounded-xl p-2.5 shadow-2xl text-xs space-y-1 text-white min-w-[190px]">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                  <span className="font-bold text-slate-100 text-xs">{hoveredState.name}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold">
                    {stInfo.total} Projects
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1 pt-1 text-center text-[10px]">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded p-1">
                    <span className="block text-emerald-400 font-bold">{stInfo.healthy}</span>
                    <span className="text-[9px] text-slate-400">Healthy</span>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded p-1">
                    <span className="block text-amber-400 font-bold">{stInfo.atRisk}</span>
                    <span className="text-[9px] text-slate-400">At Risk</span>
                  </div>
                  <div className="bg-rose-500/10 border border-rose-500/20 rounded p-1">
                    <span className="block text-rose-400 font-bold">{stInfo.critical}</span>
                    <span className="text-[9px] text-slate-400">Critical</span>
                  </div>
                </div>
                <div className="text-[9px] text-slate-400 text-center pt-0.5">
                  Click state to filter visible projects
                </div>
              </div>
            </div>
          );
        })()
      )}

      {/* Bottom GIS Status & Legend */}
      <div className="px-3 py-2 bg-[#050E1C]/90 border-t border-[#14233D] flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
        {activeViewMode === 'capital' ? (
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-cyan-400 font-semibold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              Capital Bubble Scale:
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400/80 border border-slate-700" />
              <span>&lt; ₹2,500 Cr</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-cyan-400/80 border border-slate-700" />
              <span>₹10,000 Cr</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-cyan-400/80 border border-slate-700" />
              <span>&ge; ₹50,000 Cr</span>
            </div>
            <span className="text-slate-500 text-[10px] hidden md:inline">(Rim color indicates Risk Level)</span>
          </div>
        ) : activeViewMode === 'progress' ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
              <span>Lagging (&lt;40%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#eab308]" />
              <span>In Flight (40–74%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#10b981]" />
              <span>Advanced (&ge;75%)</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
              <span>Healthy</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#eab308]" />
              <span>Warning</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f97316]" />
              <span>High Risk</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
              <span>Critical</span>
            </div>
          </div>
        )}
        <div className="text-slate-500 text-[10px] hidden sm:block">
          {displayProjects.length} Active GIS Markers · Real Project Coordinates
        </div>
      </div>
    </div>
  );
}
