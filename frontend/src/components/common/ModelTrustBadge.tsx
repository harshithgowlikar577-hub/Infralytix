import React from 'react';
import { ShieldCheck, CheckCircle2, Database, Sparkles, Clock } from 'lucide-react';

interface ModelTrustBadgeProps {
  confidencePct?: number;
  sampleCount?: number;
  accuracyPct?: number;
  lastRefresh?: string;
  variant?: 'compact' | 'full' | 'inline';
}

export default function ModelTrustBadge({
  confidencePct = 89.4,
  sampleCount = 1248,
  accuracyPct = 92.1,
  lastRefresh = '3 Days Ago',
  variant = 'compact',
}: ModelTrustBadgeProps) {
  if (variant === 'inline') {
    return (
      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#081325] border border-blue-500/20 text-[11px] font-mono text-slate-300">
        <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
        <span>Confidence: <strong className="text-white">{confidencePct}%</strong></span>
        <span className="text-slate-600">|</span>
        <span>Accuracy: <strong className="text-emerald-400">{accuracyPct}%</strong></span>
        <span className="text-slate-600">|</span>
        <span className="text-slate-400">N={sampleCount}</span>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-[#061021] border border-blue-500/20 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            AI Model Confidence & Trust Telemetry
          </span>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          v4.2 Certified
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs pt-1">
        <div className="p-2.5 rounded-lg bg-[#040C1A] border border-[#14233D]">
          <div className="text-[10px] text-slate-400 uppercase">Confidence</div>
          <div className="text-sm font-extrabold text-blue-400 mt-0.5">{confidencePct}%</div>
        </div>
        <div className="p-2.5 rounded-lg bg-[#040C1A] border border-[#14233D]">
          <div className="text-[10px] text-slate-400 uppercase">Training Base</div>
          <div className="text-sm font-extrabold text-slate-200 mt-0.5">{sampleCount.toLocaleString()} Projects</div>
        </div>
        <div className="p-2.5 rounded-lg bg-[#040C1A] border border-[#14233D]">
          <div className="text-[10px] text-slate-400 uppercase">Accuracy</div>
          <div className="text-sm font-extrabold text-emerald-400 mt-0.5">{accuracyPct}%</div>
        </div>
        <div className="p-2.5 rounded-lg bg-[#040C1A] border border-[#14233D]">
          <div className="text-[10px] text-slate-400 uppercase">Model Audit</div>
          <div className="text-sm font-extrabold text-cyan-400 mt-0.5">{lastRefresh}</div>
        </div>
      </div>
    </div>
  );
}
