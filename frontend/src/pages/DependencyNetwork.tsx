import { useState } from 'react';
import {
  Share2, AlertTriangle, ShieldCheck, ArrowRight, RefreshCw,
  Search, Filter, Info, Layers, Eye, Zap, ChevronRight
} from 'lucide-react';
import { formatCurrency } from '../lib/utils';

interface Node {
  id: string;
  name: string;
  sector: string;
  state: string;
  status: 'SAFE' | 'WATCH' | 'CRITICAL';
  costCr: number;
  delayMonths: number;
  x: number;
  y: number;
}

interface Edge {
  source: string;
  target: string;
  type: string;
  isCascading: boolean;
}

const INITIAL_NODES: Node[] = [
  { id: 'N-1', name: 'Western Dedicated Freight Corridor (Pkg 12)', sector: 'Railways', state: 'Gujarat', status: 'CRITICAL', costCr: 14200, delayMonths: 14, x: 160, y: 150 },
  { id: 'N-2', name: 'Mundra Ultra Mega Power Traction Substation', sector: 'Power', state: 'Gujarat', status: 'CRITICAL', costCr: 4800, delayMonths: 9, x: 380, y: 110 },
  { id: 'N-3', name: 'Delhi-Mumbai Expressway Spur Connector', sector: 'Roads', state: 'Rajasthan', status: 'WATCH', costCr: 8900, delayMonths: 6, x: 380, y: 270 },
  { id: 'N-4', name: 'Jawaharlal Nehru Port Container Terminal 5', sector: 'Ports', state: 'Maharashtra', status: 'WATCH', costCr: 6200, delayMonths: 5, x: 620, y: 140 },
  { id: 'N-5', name: 'Navi Mumbai International Airport Cargo Link', sector: 'Aviation', state: 'Maharashtra', status: 'SAFE', costCr: 16700, delayMonths: 2, x: 640, y: 310 },
  { id: 'N-6', name: 'Dholera Special Investment Region Water Pipeline', sector: 'Water', state: 'Gujarat', status: 'SAFE', costCr: 3100, delayMonths: 1, x: 190, y: 340 },
  { id: 'N-7', name: 'National Green Hydrogen Grid Linkage', sector: 'Power', state: 'Rajasthan', status: 'WATCH', costCr: 5400, delayMonths: 4, x: 840, y: 220 },
];

const INITIAL_EDGES: Edge[] = [
  { source: 'N-1', target: 'N-2', type: 'Traction Power Supply', isCascading: true },
  { source: 'N-1', target: 'N-3', type: 'Intermodal Logistics Sync', isCascading: true },
  { source: 'N-2', target: 'N-4', type: 'Port Freight Feeder Line', isCascading: true },
  { source: 'N-3', target: 'N-5', type: 'Airport Expressway Arterial', isCascading: false },
  { source: 'N-6', target: 'N-1', type: 'Industrial Cooling Supply', isCascading: false },
  { source: 'N-4', target: 'N-7', type: 'Export Corridor Renewable Feed', isCascading: false },
];

export default function DependencyNetwork() {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('N-1');
  const [sectorFilter, setSectorFilter] = useState<string>('ALL');
  const [highlightCascading, setHighlightCascading] = useState<boolean>(true);
  const [search, setSearch] = useState('');

  const selectedNode = INITIAL_NODES.find((n) => n.id === selectedNodeId) || INITIAL_NODES[0];

  // Upstream blockers and downstream dependencies
  const upstreamEdges = INITIAL_EDGES.filter((e) => e.target === selectedNode.id);
  const downstreamEdges = INITIAL_EDGES.filter((e) => e.source === selectedNode.id);

  const downstreamProjects = downstreamEdges.map((e) => ({
    edge: e,
    node: INITIAL_NODES.find((n) => n.id === e.target),
  }));

  const upstreamProjects = upstreamEdges.map((e) => ({
    edge: e,
    node: INITIAL_NODES.find((n) => n.id === e.source),
  }));

  const totalCascadingCapex = downstreamProjects.reduce((acc, curr) => acc + (curr.node?.costCr || 0), 0);

  const filteredNodes = INITIAL_NODES.filter((n) => {
    const matchesSector = sectorFilter === 'ALL' || n.sector === sectorFilter;
    const matchesSearch = !search || n.name.toLowerCase().includes(search.toLowerCase()) || n.sector.toLowerCase().includes(search.toLowerCase());
    return matchesSector && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-cyan-500/10">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium mb-3">
            <Share2 className="w-3.5 h-3.5" />
            <span>PM GatiShakti Multi-Modal Network</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <span>Project Connection & Dependency Network</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-medium">
              Live Topology
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Interactive map showing how delays in one project impact linked highways, railways, and ports across key economic corridors.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            onClick={() => setHighlightCascading(!highlightCascading)}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all flex items-center gap-2 shadow-sm ${
              highlightCascading
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-lg shadow-rose-500/10 ring-1 ring-rose-500/30'
                : 'bg-slate-800/80 text-slate-300 border-slate-700/80 hover:bg-slate-700'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Highlight Chain Delay Risks</span>
          </button>
        </div>
      </div>

      {/* 3-Question Context Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#081324]/80 p-4 rounded-2xl border border-cyan-500/15 text-xs">
        <div className="flex items-start gap-2.5">
          <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-semibold uppercase text-[10px] shrink-0">Status</span>
          <span className="text-slate-300">Tracking <strong>7 critical infrastructure hubs</strong> linked by 6 multi-modal dependency vectors.</span>
        </div>
        <div className="flex items-start gap-2.5">
          <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 font-semibold uppercase text-[10px] shrink-0">Risk</span>
          <span className="text-slate-300">Stall at <strong>Western DFC Pkg 12</strong> poses cascading disruption to <strong>₹11,000 Cr</strong> downstream port & power links.</span>
        </div>
        <div className="flex items-start gap-2.5">
          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold uppercase text-[10px] shrink-0">Action</span>
          <span className="text-slate-300">Click any network node to inspect ripple effects or dispatch an inter-departmental clearance directive.</span>
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Interactive Graph Canvas (2 Cols) */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-cyan-500/15 flex flex-col justify-between shadow-xl shadow-black/10">
          <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Corridor Node-Link Graph</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Safe</span>
              <span className="inline-flex items-center gap-1 text-[11px] text-amber-400"><span className="w-2 h-2 rounded-full bg-amber-400" /> Watch</span>
              <span className="inline-flex items-center gap-1 text-[11px] text-rose-400"><span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" /> Critical</span>
            </div>
          </div>

          {/* SVG Canvas */}
          <div className="relative w-full h-[460px] bg-[#040C1A] rounded-xl border border-slate-800/80 overflow-hidden flex items-center justify-center">
            {/* Grid Background Effect */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(56,189,248,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

            <svg className="w-full h-full cursor-crosshair">
              <defs>
                <marker id="arrow-safe" markerWidth="8" markerHeight="8" refX="22" refY="4" orient="auto">
                  <path d="M0,0 L8,4 L0,8 Z" fill="#10B981" />
                </marker>
                <marker id="arrow-watch" markerWidth="8" markerHeight="8" refX="22" refY="4" orient="auto">
                  <path d="M0,0 L8,4 L0,8 Z" fill="#F59E0B" />
                </marker>
                <marker id="arrow-critical" markerWidth="8" markerHeight="8" refX="22" refY="4" orient="auto">
                  <path d="M0,0 L8,4 L0,8 Z" fill="#F43F5E" />
                </marker>
              </defs>

              {/* Edges */}
              {INITIAL_EDGES.map((edge, idx) => {
                const sourceNode = INITIAL_NODES.find((n) => n.id === edge.source);
                const targetNode = INITIAL_NODES.find((n) => n.id === edge.target);
                if (!sourceNode || !targetNode) return null;

                const isConnectedToSelected = selectedNode.id === edge.source || selectedNode.id === edge.target;
                const isCriticalPath = edge.isCascading && highlightCascading;

                const strokeColor = isCriticalPath
                  ? '#F43F5E'
                  : isConnectedToSelected
                  ? '#38BDF8'
                  : '#334155';

                return (
                  <g key={idx}>
                    <line
                      x1={sourceNode.x}
                      y1={sourceNode.y}
                      x2={targetNode.x}
                      y2={targetNode.y}
                      stroke={strokeColor}
                      strokeWidth={isCriticalPath ? 2.5 : isConnectedToSelected ? 2 : 1}
                      strokeDasharray={isCriticalPath ? '5 3' : undefined}
                      className={isCriticalPath ? 'animate-pulse' : ''}
                      markerEnd={`url(#arrow-${isCriticalPath ? 'critical' : isConnectedToSelected ? 'watch' : 'safe'})`}
                    />
                    <text
                      x={(sourceNode.x + targetNode.x) / 2}
                      y={(sourceNode.y + targetNode.y) / 2 - 6}
                      fill="#64748B"
                      fontSize="9"
                      fontFamily="JetBrains Mono"
                      textAnchor="middle"
                    >
                      {edge.type}
                    </text>
                  </g>
                );
              })}

              {/* Nodes */}
              {filteredNodes.map((node) => {
                const isSelected = node.id === selectedNode.id;
                const color =
                  node.status === 'CRITICAL'
                    ? '#F43F5E'
                    : node.status === 'WATCH'
                    ? '#F59E0B'
                    : '#10B981';

                return (
                  <g
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    className="cursor-pointer group"
                    transform={`translate(${node.x}, ${node.y})`}
                  >
                    {isSelected && (
                      <circle r="30" fill="none" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="3 3" className="animate-spin" />
                    )}
                    <circle
                      r={isSelected ? '18' : '14'}
                      fill="#081324"
                      stroke={color}
                      strokeWidth={isSelected ? '3' : '2'}
                      className="transition-all hover:scale-110"
                    />
                    <circle r="4" fill={color} />
                    <text
                      y="28"
                      fill={isSelected ? '#F8FAFC' : '#94A3B8'}
                      fontSize="10"
                      fontWeight={isSelected ? '700' : '500'}
                      textAnchor="middle"
                      className="select-none pointer-events-none"
                    >
                      {node.name.length > 20 ? node.name.slice(0, 18) + '…' : node.name}
                    </text>
                    <text
                      y="40"
                      fill="#64748B"
                      fontSize="9"
                      fontFamily="JetBrains Mono"
                      textAnchor="middle"
                      className="select-none pointer-events-none"
                    >
                      {formatCurrency(node.costCr)} • +{node.delayMonths}m
                    </text>
                  </g>
                );
              })}
            </svg>

            <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[10px] font-mono text-slate-400">
              Interactive Mode: Click any node to isolate risk path
            </div>
          </div>
        </div>

        {/* Node Inspection Drawer (1 Col) */}
        <div className="glass-card p-6 rounded-2xl border border-cyan-500/15 space-y-5 flex flex-col justify-between shadow-xl shadow-black/10">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold font-mono tracking-wider uppercase px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30">
                  {selectedNode.sector} • {selectedNode.state}
                </span>
                <h3 className="text-base font-bold text-white mt-2 leading-snug">{selectedNode.name}</h3>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                  selectedNode.status === 'CRITICAL'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : selectedNode.status === 'WATCH'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {selectedNode.status}
              </span>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-[#040C1A] border border-slate-800">
                <span className="text-[10px] uppercase text-slate-500 block">Sanctioned Outlay</span>
                <span className="text-lg font-bold font-mono text-cyan-400">{formatCurrency(selectedNode.costCr)}</span>
              </div>
              <div className="p-3 rounded-lg bg-[#040C1A] border border-slate-800">
                <span className="text-[10px] uppercase text-slate-500 block">Schedule Slippage</span>
                <span className="text-lg font-bold font-mono text-rose-400">+{selectedNode.delayMonths} Mos</span>
              </div>
            </div>

            {/* Cascading Impact Card */}
            <div className="p-3.5 rounded-lg bg-rose-950/30 border border-rose-500/30 space-y-2">
              <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase">
                <AlertTriangle className="w-4 h-4" />
                <span>Cascading Capital at Risk</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                If this node experiences a 90-day further delay, <strong>{downstreamProjects.length} downstream packages</strong> worth{' '}
                <strong className="text-rose-400">{formatCurrency(totalCascadingCapex)}</strong> will encounter contractual stand-still.
              </p>
            </div>

            {/* Downstream Dependencies List */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                Downstream Dependent Packages ({downstreamProjects.length})
              </span>
              {downstreamProjects.length > 0 ? (
                <div className="space-y-2">
                  {downstreamProjects.map((item, i) => (
                    <div
                      key={i}
                      onClick={() => item.node && setSelectedNodeId(item.node.id)}
                      className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 cursor-pointer flex items-center justify-between text-xs transition-colors"
                    >
                      <div>
                        <div className="font-semibold text-slate-200">{item.node?.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Vector: {item.edge.type} • {formatCurrency(item.node?.costCr || 0)}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No downstream dependents identified.</p>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex gap-2">
            <button className="flex-1 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all">
              <Zap className="w-3.5 h-3.5" />
              <span>Dispatch Intervention</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
