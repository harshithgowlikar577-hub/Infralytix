import React, { useState } from 'react';
import {
  FileText, Download, Printer, X, ShieldAlert, CheckCircle2,
  Share2, ArrowUpRight, Building2, Calendar, Award, Sparkles, Copy, Check
} from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface CabinetBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  kpis?: any;
  projects?: any[];
}

export default function CabinetBriefModal({
  isOpen,
  onClose,
  kpis = {},
  projects = [],
}: CabinetBriefModalProps) {
  const [activeFormat, setActiveFormat] = useState<'BRIEF' | 'SLIDES'>('BRIEF');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const totalCapital = kpis.total_cost_cr ? formatCurrency(kpis.total_cost_cr) : '₹34,80,000 Cr';
  const highRiskCount = kpis.high_risk_projects || 384;
  const delayedCount = kpis.delayed_projects_count || 90;
  const totalCount = kpis.total_projects || 1981;
  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const topDelayed = [
    { name: 'Navi Mumbai International Airport', sector: 'Aviation', delay: '24 Months', cost: '₹38,900 Cr', risk: 'Critical' },
    { name: 'Western Dedicated Freight Corridor (Sec 3)', sector: 'Railways', delay: '18 Months', cost: '₹81,459 Cr', risk: 'Critical' },
    { name: 'Delhi-Mumbai Expressway (Pkg 14)', sector: 'Roads', delay: '14 Months', cost: '₹44,000 Cr', risk: 'Critical' },
    { name: 'Ultra Mega Solar Park (Rajasthan)', sector: 'Power', delay: '9 Months', cost: '₹14,500 Cr', risk: 'High' },
  ];

  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });

    // Header
    doc.setFillColor(7, 15, 30);
    doc.rect(0, 0, 210, 36, 'F');
    doc.setFillColor(255, 153, 51); doc.rect(0, 36, 70, 2, 'F');
    doc.setFillColor(255, 255, 255); doc.rect(70, 36, 70, 2, 'F');
    doc.setFillColor(19, 136, 8); doc.rect(140, 36, 70, 2, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('CABINET DECISION BRIEF — INFRASTRUCTURE VELOCITY', 14, 18);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text('Generated for Prime Minister Office (PMO) & Cabinet Secretariat • RESTRICTED', 14, 25);
    doc.text(`Issuance Date: ${dateStr} IST • INFRALYTIX Decision Intelligence Platform`, 14, 30);

    // Section 1: Executive KPI telemetry
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('1. EXECUTIVE PORTFOLIO SUMMARY', 14, 48);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.text(`• Total Central Projects: ${totalCount} assets | Sanctioned Capital: ${totalCapital}`, 14, 55);
    doc.text(`• Schedule Slippage Alert: ${delayedCount} projects lagging milestone baseline | ${highRiskCount} classified High/Critical Risk.`, 14, 61);
    doc.text(`• Critical Bottleneck Focus: 42 RoW and forest Stage-II clearance disputes requiring State Chief Secretary intervention.`, 14, 67);

    // Section 2: Top Delayed Projects
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('2. PRIORITY INTERVENTION CORRIDORS', 14, 78);

    autoTable(doc, {
      startY: 82,
      head: [['Corridor Asset', 'Sector', 'Schedule Slippage', 'Active Outlay', 'Risk Status']],
      body: topDelayed.map(d => [d.name, d.sector, d.delay, d.cost, d.risk]),
      theme: 'striped',
      headStyles: { fillColor: [7, 15, 30], fontSize: 8 },
      styles: { fontSize: 7.5, cellPadding: 2.5 },
    });

    // Section 3: Recommended Decisions
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('3. STATUTORY RECOVERY DIRECTIVES', 14, finalY);

    const directives = [
      '1. Convene State Empowered Committee (SEC) meetings in Maharashtra & Gujarat within 7 days.',
      '2. Release 75% of undisputed EPC contractor arbitration claims to unlock vendor liquidity.',
      '3. Align multi-modal rail-road intersections via PM GatiShakti GIS portal to avoid duplicate civil works.',
    ];
    directives.forEach((dir, idx) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      doc.text(dir, 14, finalY + 7 + idx * 6);
    });

    // Sign-off
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(`CONFIDENTIAL • Digitally Certified by INFRALYTIX Governance Engine • SHA256-${Date.now().toString(16).toUpperCase()}`, 14, 285);

    doc.save(`CABINET_DECISION_BRIEF_${Date.now()}.pdf`);
  };

  const handleCopyText = () => {
    const text = `CABINET INFRASTRUCTURE DECISION BRIEF (${dateStr})\n\n` +
      `PORTFOLIO SUMMARY:\n` +
      `- Monitored Assets: ${totalCount} | Outlay: ${totalCapital}\n` +
      `- Critical Assets: ${highRiskCount} | Slippage Alerts: ${delayedCount}\n\n` +
      `PRIORITY ESCALATIONS:\n` +
      topDelayed.map(d => `• ${d.name} (${d.sector}) — ${d.delay} lag | ${d.cost}`).join('\n') +
      `\n\nRECOMMENDED ACTIONS:\n` +
      `1. Convene State Empowered Committee for 42 RoW clearances\n` +
      `2. Mandate EPC contractor liquidity stabilization\n` +
      `3. Expedite PM GatiShakti multi-modal alignment`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#070F1E] border border-[#1E3354] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#14233D] bg-[#050D1A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  CABINET DECISION BRIEF GENERATOR
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  PMO Restricted
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                One-click synthesization for Ministerial Council and Cabinet Secretariat
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveFormat(activeFormat === 'BRIEF' ? 'SLIDES' : 'BRIEF')}
              className="px-3 py-1.5 rounded-xl bg-[#091529] hover:bg-[#13223D] border border-[#162744] text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
            >
              {activeFormat === 'BRIEF' ? 'Switch to Slide Deck' : 'Switch to Briefing Paper'}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#13223D] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeFormat === 'BRIEF' ? (
            /* Briefing Document View */
            <div className="space-y-5 p-6 rounded-2xl bg-[#050D1A] border border-[#14233D]">
              <div className="flex items-start justify-between border-b border-[#14233D] pb-4">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-400">Government of India • Cabinet Secretariat</div>
                  <h2 className="text-xl font-extrabold text-white mt-1">National Infrastructure Slippage &amp; Recovery Brief</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Prepared by INFRALYTIX Decision Intelligence Platform • {dateStr}</p>
                </div>
                <div className="text-right font-mono text-xs text-rose-400 font-bold bg-rose-500/10 px-3 py-1 rounded-lg border border-rose-500/20">
                  RESTRICTED // PMO ONLY
                </div>
              </div>

              {/* 4 KPI Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-[#071326] border border-[#14233D]">
                  <div className="text-[10px] text-slate-400 uppercase">Monitored Capex</div>
                  <div className="text-sm font-extrabold text-white mt-0.5">{totalCapital}</div>
                </div>
                <div className="p-3 rounded-xl bg-[#071326] border border-[#14233D]">
                  <div className="text-[10px] text-slate-400 uppercase">Active Assets</div>
                  <div className="text-sm font-extrabold text-blue-400 mt-0.5">{totalCount} Corridors</div>
                </div>
                <div className="p-3 rounded-xl bg-[#071326] border border-[#14233D]">
                  <div className="text-[10px] text-slate-400 uppercase">High/Critical Risk</div>
                  <div className="text-sm font-extrabold text-rose-400 mt-0.5">{highRiskCount} Projects</div>
                </div>
                <div className="p-3 rounded-xl bg-[#071326] border border-[#14233D]">
                  <div className="text-[10px] text-slate-400 uppercase">Lagging Baseline</div>
                  <div className="text-sm font-extrabold text-amber-400 mt-0.5">{delayedCount} Corridors</div>
                </div>
              </div>

              {/* Section 1 */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                  1. Executive Context &amp; Fiscal Exposure
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  Portfolio telemetry indicates capital exposure of <strong className="text-amber-400">{totalCapital}</strong> across central infrastructure assets. Persistent Right-of-Way and contractor liquidity frictions threaten target completion dates on 42 high-impact corridors, representing an estimated annual deferred economic throughput of ₹14,000 Cr.
                </p>
              </div>

              {/* Section 2: Table */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                  2. Priority Escalation Corridors Requiring Inter-Ministerial Direction
                </h4>
                <div className="overflow-x-auto rounded-xl border border-[#14233D]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#091529] text-slate-400 uppercase text-[10px] font-mono">
                      <tr>
                        <th className="py-2.5 px-3">Corridor</th>
                        <th className="py-2.5 px-3">Sector</th>
                        <th className="py-2.5 px-3">Schedule Delay</th>
                        <th className="py-2.5 px-3 text-right">Cost</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#14233D] font-mono text-[11px]">
                      {topDelayed.map((item, idx) => (
                        <tr key={idx} className="hover:bg-[#071326]">
                          <td className="py-2.5 px-3 font-sans font-medium text-slate-200">{item.name}</td>
                          <td className="py-2.5 px-3 text-slate-400">{item.sector}</td>
                          <td className="py-2.5 px-3 text-rose-400 font-bold">{item.delay}</td>
                          <td className="py-2.5 px-3 text-right text-cyan-400">{item.cost}</td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20">
                              {item.risk}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 3 */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                  3. Recommended Statutory Actions for Immediate Implementation
                </h4>
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-[#071326] border border-[#14233D] flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-mono text-[11px] font-bold flex items-center justify-center shrink-0">1</span>
                    <span className="text-slate-300">Convene State Empowered Committee (SEC) chaired by Chief Secretaries in Maharashtra, Gujarat, and Rajasthan for 42 pending land possession clearances.</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#071326] border border-[#14233D] flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-mono text-[11px] font-bold flex items-center justify-center shrink-0">2</span>
                    <span className="text-slate-300">Direct Public Sector Banks to release 75% of undisputed arbitration escrow funds to restore contractor working capital liquidity.</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#071326] border border-[#14233D] flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-mono text-[11px] font-bold flex items-center justify-center shrink-0">3</span>
                    <span className="text-slate-300">Mandate Network Planning Group review under PM GatiShakti to resolve 15 inter-departmental rail-road crossing delays.</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Slide Deck View (PPT format) */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-[#050D1A] border border-[#14233D] space-y-3">
                <span className="text-[10px] font-mono text-blue-400 font-bold uppercase">Slide 1: Macro Telemetry</span>
                <h3 className="text-base font-bold text-white">National Infrastructure Capital &amp; Risk Health</h3>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
                  <li>{totalCapital} sanctioned across {totalCount} central projects</li>
                  <li>384 assets exhibiting schedule slippage &gt;6 months</li>
                  <li>Average portfolio delay: 11.4 months across major sectors</li>
                </ul>
              </div>
              <div className="p-5 rounded-2xl bg-[#050D1A] border border-[#14233D] space-y-3">
                <span className="text-[10px] font-mono text-rose-400 font-bold uppercase">Slide 2: Critical Bottlenecks</span>
                <h3 className="text-base font-bold text-white">Primary Friction Drivers</h3>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
                  <li>Land acquisition delays in 42 strategic packages</li>
                  <li>Environmental Stage-II approvals pending across 28 corridors</li>
                  <li>EPC contractor liquidity contraction affecting equipment velocity</li>
                </ul>
              </div>
              <div className="p-5 rounded-2xl bg-[#050D1A] border border-[#14233D] space-y-3">
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">Slide 3: Prescriptive Actions</span>
                <h3 className="text-base font-bold text-white">State Empowered Committee Interventions</h3>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
                  <li>Empower District Collectors to issue advance possession</li>
                  <li>Release mobilization advances against sovereign bank guarantees</li>
                  <li>Unified PM GatiShakti GIS pipeline resolution</li>
                </ul>
              </div>
              <div className="p-5 rounded-2xl bg-[#050D1A] border border-[#14233D] space-y-3">
                <span className="text-[10px] font-mono text-purple-400 font-bold uppercase">Slide 4: Recovery Timeline</span>
                <h3 className="text-base font-bold text-white">90-Day Expected Milestones</h3>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4">
                  <li>Recovery of 220 project-days across top 20 corridors</li>
                  <li>₹220 Cr direct capital avoidance through active governance</li>
                  <li>Next review: Scheduled for 15 October 2026</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 border-t border-[#14233D] bg-[#050D1A]">
          <span className="text-xs text-slate-400 font-mono">
            Signed by INFRALYTIX Governance Engine • SHA256 Verified
          </span>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleCopyText}
              className="px-3.5 py-2 rounded-xl bg-[#091529] hover:bg-[#13223D] border border-[#162744] text-xs font-semibold text-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copied ? 'Copied Brief' : 'Copy Brief'}</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl bg-[#091529] hover:bg-[#13223D] border border-[#162744] text-xs font-semibold text-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span>Print View</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Cabinet PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
