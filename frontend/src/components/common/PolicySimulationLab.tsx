import React, { useState } from 'react';
import { Sliders, Cpu, Zap, CheckCircle2, ArrowRight, ShieldCheck, Sparkles, RefreshCw } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

export interface PolicyScenario {
  id: string;
  name: string;
  tag: string;
  description: string;
  delayRecoveryDays: number;
  costSavedCr: number;
  riskReductionPct: number;
  feasibility: 'High' | 'Medium' | 'Very High';
  badgeColor: string;
  policyInterventions: string[];
}

interface PolicySimulationLabProps {
  projectId?: string;
  projectName?: string;
  onApplyScenario?: (scenario: PolicyScenario) => void;
}

export const PRESET_SCENARIOS: PolicyScenario[] = [
  {
    id: 'SCENARIO_A',
    name: 'Scenario A: Contractor Surge',
    tag: 'Labor & Equipment Mobilization',
    description: 'Inject secondary EPC work crews and mandate double-shift earthmoving operations.',
    delayRecoveryDays: 85,
    costSavedCr: 84,
    riskReductionPct: 18,
    feasibility: 'High',
    badgeColor: 'border-blue-500/40 text-blue-400 bg-blue-500/10',
    policyInterventions: [
      '+20% skilled construction manpower',
      'Mandate 24x7 split-shift operation on critical packages',
      'Deploy 14 secondary heavy earthmovers',
    ],
  },
  {
    id: 'SCENARIO_B',
    name: 'Scenario B: Fast-Track Clearances',
    tag: 'Statutory RoW & Forest NOCs',
    description: 'Empower State Empowered Committee to grant advance Right-of-Way possession under NH Act 3D.',
    delayRecoveryDays: 122,
    costSavedCr: 136,
    riskReductionPct: 24,
    feasibility: 'Medium',
    badgeColor: 'border-amber-500/40 text-amber-400 bg-amber-500/10',
    policyInterventions: [
      'Convene District Collector fast-track compensation hearings',
      'Release provisional Stage-II forest NOC with compensatory afforestation escrow',
      'Accelerate 11 high-tension power line relocations',
    ],
  },
  {
    id: 'SCENARIO_C',
    name: 'Scenario C: Combined Strategy',
    tag: 'PM GatiShakti Multi-Modal Alignment',
    description: 'Synchronized contractor liquidity injection, inter-modal alignment, and statutory fast-tracking.',
    delayRecoveryDays: 220,
    costSavedCr: 220,
    riskReductionPct: 35,
    feasibility: 'Very High',
    badgeColor: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
    policyInterventions: [
      'Simultaneous manpower boost (+25%) and statutory clearance green channel',
      '75% release of undisputed contractor arbitration claims to unlock liquidity',
      'Multi-modal rail-road grade separation alignment via unified GIS portal',
    ],
  },
];

export default function PolicySimulationLab({
  projectId = 'INF0001',
  projectName = 'Strategic Corridor',
  onApplyScenario,
}: PolicySimulationLabProps) {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('SCENARIO_C');
  const [customMode, setCustomMode] = useState<boolean>(false);
  const [customManpower, setCustomManpower] = useState<number>(20);
  const [customBudget, setCustomBudget] = useState<number>(15);
  const [customClearanceSpeed, setCustomClearanceSpeed] = useState<number>(30);
  const [appliedToast, setAppliedToast] = useState<string | null>(null);

  // Custom simulation computed values
  const customDelayRecovery = Math.round(customManpower * 3.5 + customClearanceSpeed * 2.8);
  const customCostSaved = Math.round(customBudget * 6.2 + customManpower * 2.1);
  const customRiskReduction = Math.min(45, Math.round((customManpower + customClearanceSpeed) * 0.45));

  const handleSelect = (scenario: PolicyScenario) => {
    setSelectedScenarioId(scenario.id);
    if (onApplyScenario) onApplyScenario(scenario);
    setAppliedToast(`Adopted ${scenario.name}: Forecasted recovery of ${scenario.delayRecoveryDays} Days!`);
    setTimeout(() => setAppliedToast(null), 4000);
  };

  return (
    <div className="glass-card p-6 rounded-2xl border border-[#162744] space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#14233D]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                POLICY SIMULATION LAB (DIGITAL TWIN)
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                Predictive Counterfactual Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Side-by-side comparative policy evaluation for Cabinet & Ministerial Secretaries
            </p>
          </div>
        </div>

        {/* Toggle Mode */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setCustomMode(false)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              !customMode
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-[#081325] text-slate-400 hover:text-slate-200 border border-[#162744]'
            }`}
          >
            Prescriptive Scenarios
          </button>
          <button
            onClick={() => setCustomMode(true)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              customMode
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-[#081325] text-slate-400 hover:text-slate-200 border border-[#162744]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Custom Policy</span>
          </button>
        </div>
      </div>

      {appliedToast && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">{appliedToast}</span>
        </div>
      )}

      {/* Side-by-Side Comparison Cards */}
      {!customMode ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PRESET_SCENARIOS.map((scen) => {
            const isSelected = scen.id === selectedScenarioId;
            return (
              <div
                key={scen.id}
                onClick={() => handleSelect(scen)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 group ${
                  isSelected
                    ? 'bg-blue-950/40 border-blue-500/60 shadow-xl shadow-blue-500/10 ring-1 ring-blue-500/40'
                    : 'bg-[#061021] border-[#14233D] hover:border-slate-600 hover:bg-[#091529]'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${scen.badgeColor}`}>
                      {scen.feasibility} Feasibility
                    </span>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-xs font-bold text-blue-400 font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Active</span>
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                      {scen.name}
                    </h4>
                    <span className="text-[10px] font-mono text-cyan-400 block mt-0.5">{scen.tag}</span>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{scen.description}</p>
                  </div>

                  {/* Impact Stats */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#14233D] font-mono">
                    <div className="p-2.5 rounded-lg bg-[#040C1A] border border-[#14233D]">
                      <div className="text-[10px] uppercase text-slate-400">Delay Recovery</div>
                      <div className="text-base font-extrabold text-emerald-400 mt-0.5">
                        {scen.delayRecoveryDays} Days
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#040C1A] border border-[#14233D]">
                      <div className="text-[10px] uppercase text-slate-400">Cost Saved</div>
                      <div className="text-base font-extrabold text-cyan-400 mt-0.5">
                        ₹{scen.costSavedCr} Cr
                      </div>
                    </div>
                  </div>

                  {/* Specific Action Points */}
                  <div className="space-y-1.5 pt-1 text-[11px] text-slate-400">
                    <div className="font-semibold text-slate-300 text-[10px] uppercase tracking-wider">
                      Policy Lever Breakdown:
                    </div>
                    {scen.policyInterventions.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <span className="text-blue-400 shrink-0">•</span>
                        <span className="leading-snug">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  className={`w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow'
                      : 'bg-[#081325] text-slate-300 hover:text-white border border-[#162744]'
                  }`}
                >
                  {isSelected ? 'Directive Selected' : 'Evaluate Scenario'}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        /* Custom Simulation Slider Mode */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-2xl bg-[#061021] border border-[#14233D]">
            {/* Slider 1 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Contractor Manpower Surge</span>
                <span className="font-mono font-bold text-blue-400">+{customManpower}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={customManpower}
                onChange={(e) => setCustomManpower(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <p className="text-[10px] text-slate-500">Mobilizes extra shifts & equipment</p>
            </div>

            {/* Slider 2 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Liquidity Mobilization Advance</span>
                <span className="font-mono font-bold text-cyan-400">+{customBudget}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="5"
                value={customBudget}
                onChange={(e) => setCustomBudget(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <p className="text-[10px] text-slate-500">Releases arbitration escrow & vendor advances</p>
            </div>

            {/* Slider 3 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Fast-Track Clearance Speed</span>
                <span className="font-mono font-bold text-emerald-400">+{customClearanceSpeed}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                step="10"
                value={customClearanceSpeed}
                onChange={(e) => setCustomClearanceSpeed(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <p className="text-[10px] text-slate-500">Accelerates RoW & Stage-II forest approvals</p>
            </div>
          </div>

          {/* Real-time Custom Prediction Outcome */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-[#071326] to-emerald-950/30 border border-blue-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-cyan-400">Simulated Digital Twin Outcome</span>
              <h4 className="text-base font-bold text-white mt-1">Bespoke Policy Package Impact</h4>
              <p className="text-xs text-slate-400 mt-0.5">Estimated timeline recovery and cost containment metrics</p>
            </div>

            <div className="flex flex-wrap items-center gap-4 font-mono">
              <div className="p-3 rounded-xl bg-[#040C1A] border border-[#14233D] text-center min-w-[110px]">
                <div className="text-[10px] text-slate-400 uppercase">Recovered</div>
                <div className="text-xl font-extrabold text-emerald-400 mt-0.5">{customDelayRecovery} Days</div>
              </div>
              <div className="p-3 rounded-xl bg-[#040C1A] border border-[#14233D] text-center min-w-[110px]">
                <div className="text-[10px] text-slate-400 uppercase">Capital Saved</div>
                <div className="text-xl font-extrabold text-cyan-400 mt-0.5">₹{customCostSaved} Cr</div>
              </div>
              <div className="p-3 rounded-xl bg-[#040C1A] border border-[#14233D] text-center min-w-[110px]">
                <div className="text-[10px] text-slate-400 uppercase">Risk Reduction</div>
                <div className="text-xl font-extrabold text-purple-400 mt-0.5">-{customRiskReduction}%</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
