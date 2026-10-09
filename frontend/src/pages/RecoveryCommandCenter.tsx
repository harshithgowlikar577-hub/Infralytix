import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects, useSimulation, useSimulationExplain } from '../hooks/useAPI';
import { formatCurrency } from '../lib/utils';
import {
  SlidersHorizontal,
  Play,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Zap,
  Sparkles,
  Filter,
  Search,
  Send,
  Clock,
  DollarSign,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Brain,
  RefreshCw
} from 'lucide-react';
import Skeleton from '../components/ui/Skeleton';
import ErrorState from '../components/ui/ErrorState';

export default function RecoveryCommandCenter() {
  const navigate = useNavigate();
  const { data: projectsData, isLoading, isError, refetch } = useProjects({ limit: 40 });

  const [selectedProjectId, setSelectedProjectId] = useState('INF0001');
  const [manpowerBoost, setManpowerBoost] = useState(20);
  const [budgetBoost, setBudgetBoost] = useState(15);
  const [procurementRemoved, setProcurementRemoved] = useState(true);
  const [milestonesExpedited, setMilestonesExpedited] = useState(2);

  const [simResult, setSimResult] = useState<any>(null);
  const [aiExplanation, setAiExplanation] = useState<any>(null);
  const [dispatched, setDispatched] = useState(false);

  const simMutation = useSimulation();
  const explainMutation = useSimulationExplain();

  const rawProjects = projectsData?.projects || projectsData?.items || (Array.isArray(projectsData) ? projectsData : []);

  const handleRunSimulation = () => {
    setAiExplanation(null);
    simMutation.mutate(
      {
        project_id: selectedProjectId,
        manpower_boost_pct: manpowerBoost,
        budget_increase_pct: budgetBoost,
        procurement_delay_removed: procurementRemoved,
        milestones_expedited_count: milestonesExpedited,
      },
      {
        onSuccess: (res) => {
          setSimResult(res);
        },
      }
    );
  };

  const handleExplainScenario = () => {
    explainMutation.mutate(
      {
        project_id: selectedProjectId,
        manpower_boost_pct: manpowerBoost,
        budget_increase_pct: budgetBoost,
        procurement_delay_removed: procurementRemoved,
        milestones_expedited_count: milestonesExpedited,
      },
      {
        onSuccess: (res) => {
          setAiExplanation(res);
        },
      }
    );
  };


  if (isLoading) {
    return (
      <div className="space-y-6 pb-8">
        <Skeleton variant="card" className="h-28" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} variant="card" className="h-28" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Recovery Simulator Unavailable"
        message="Could not connect to simulation engine."
        onRetry={refetch}
      />
    );
  }

  const selectedProj = rawProjects.find((p: any) => (p.id || p.project_id) === selectedProjectId) || rawProjects[0] || {
    id: 'INF0001',
    name: 'Delhi–Mumbai Industrial Expressway',
    cost: 14500,
    delay_months: 14,
    risk_score: 82,
  };

  const baselineCost = selectedProj.current_cost || selectedProj.revised_cost || 14500;
  const baselineDelay = selectedProj.delay_months || Math.round((selectedProj.delay_days || 420) / 30) || 14;

  const recoveredDelayMonths = simResult?.delay_reduction_months || Math.round((manpowerBoost * 0.15) + (procurementRemoved ? 3.5 : 0) + (milestonesExpedited * 0.8));
  const recoveredCostCr = simResult?.cost_avoidance_cr || Math.round((baselineCost * 0.04) + (recoveredDelayMonths * 28));

  return (
    <div className="space-y-6 pb-8">
      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#1E2B45] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              What-If Recovery Simulator
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
              Counterfactual Policy Lab
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Simulate accelerated intervention parameters against real ML project baselines
          </p>
        </div>
      </div>

      {/* ── Top Simulator Workspace: Controls (Left) vs Real-Time Impact (Right) ─ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Simulator Controls (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-[#1E2B45] rounded-lg p-5 space-y-4 shadow-2xs">
          <div className="border-b border-slate-200 dark:border-[#1E2B45] pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Simulation Parameters
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Select project and adjust policy levers.
            </p>
          </div>

          {/* Project Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Target Infrastructure Project:
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => {
                setSelectedProjectId(e.target.value);
                setSimResult(null);
                setDispatched(false);
              }}
              className="w-full px-3 py-2 rounded-md text-xs bg-slate-50 dark:bg-[#0E1626] border border-slate-200 dark:border-[#1E2B45] text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            >
              {rawProjects.map((p: any) => (
                <option key={p.id || p.project_id} value={p.id || p.project_id}>
                  {p.name || p.project_name} ({p.id || p.project_id})
                </option>
              ))}
            </select>
          </div>

          {/* Slider 1: Manpower Boost */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-700 dark:text-slate-300">Manpower / Shift Surge:</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">+{manpowerBoost}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              value={manpowerBoost}
              onChange={(e) => setManpowerBoost(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          {/* Slider 2: Budget Expansion */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-700 dark:text-slate-300">Supplemental Capex Liquidity:</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">+{budgetBoost}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={30}
              value={budgetBoost}
              onChange={(e) => setBudgetBoost(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          {/* Expedited Milestones Counter */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-700 dark:text-slate-300">Critical Path Milestones Expedited:</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">{milestonesExpedited} Milestones</span>
            </div>
            <input
              type="range"
              min={0}
              max={5}
              value={milestonesExpedited}
              onChange={(e) => setMilestonesExpedited(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          {/* Toggle: Procurement Bottlenecks */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-[#18243A]">
            <input
              type="checkbox"
              id="procure_toggle"
              checked={procurementRemoved}
              onChange={(e) => setProcurementRemoved(e.target.checked)}
              className="rounded text-indigo-600"
            />
            <label htmlFor="procure_toggle" className="text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
              Bypass statutory forest & utility clearance lag
            </label>
          </div>

          <button
            onClick={handleRunSimulation}
            disabled={simMutation.isPending}
            className="w-full py-2.5 rounded-md text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
            <span>{simMutation.isPending ? 'Simulating Dynamic Scenario...' : 'Run What-If Simulation'}</span>
          </button>
        </div>

        {/* Right Column: Results & Baseline vs Scenario Comparison (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#111A2E] border border-slate-200 dark:border-[#1E2B45] rounded-lg p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1E2B45] pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Scenario Impact vs. Baseline
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Target: <strong>{selectedProj.name || selectedProj.project_name}</strong>
              </p>
            </div>

            <button
              onClick={() => setDispatched(true)}
              disabled={dispatched}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                dispatched
                  ? 'bg-emerald-600 text-white cursor-default'
                  : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800/60'
              }`}
            >
              {dispatched ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Directive Saved</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch Scenario</span>
                </>
              )}
            </button>
          </div>

          {/* Comparison Cards */}
          <div className="grid grid-cols-2 gap-4">
            {/* Baseline */}
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#0E1729] border border-slate-200 dark:border-[#1E2B45] space-y-2">
              <span className="text-[10px] font-bold uppercase text-slate-400">Current Baseline</span>
              <div className="space-y-1">
                <div className="text-xs text-slate-500">Predicted Delay:</div>
                <div className="text-lg font-bold text-rose-600 dark:text-rose-400 font-mono">
                  +{baselineDelay} months
                </div>
              </div>
              <div className="space-y-1 pt-1 border-t border-slate-200 dark:border-slate-800">
                <div className="text-xs text-slate-500">Projected Final Cost:</div>
                <div className="text-lg font-bold text-slate-900 dark:text-white font-mono">
                  {formatCurrency(baselineCost * 1.12)}
                </div>
              </div>
            </div>

            {/* Scenario Optimized */}
            <div className="p-4 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 space-y-2">
              <span className="text-[10px] font-bold uppercase text-indigo-700 dark:text-indigo-400">
                Optimized Scenario
              </span>
              <div className="space-y-1">
                <div className="text-xs text-indigo-700 dark:text-indigo-300">Recovered Timeline:</div>
                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  -{recoveredDelayMonths} months slippage
                </div>
              </div>
              <div className="space-y-1 pt-1 border-t border-indigo-200 dark:border-indigo-900/50">
                <div className="text-xs text-indigo-700 dark:text-indigo-300">Net Cost Avoidance:</div>
                <div className="text-lg font-bold text-indigo-600 dark:text-indigo-300 font-mono">
                  ₹{recoveredCostCr} Cr saved
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-md bg-slate-50 dark:bg-[#0E1729] border border-slate-200 dark:border-[#1E2B45] text-xs text-slate-600 dark:text-slate-400 leading-relaxed flex items-center justify-between gap-3">
            <div>
              <strong>Algorithmic Verdict:</strong> Deploying an extra 20% shift capacity alongside resolving statutory RoW permits recovers an estimated {recoveredDelayMonths} months, pulling completion within statutory deadline thresholds.
            </div>

            <button
              onClick={handleExplainScenario}
              disabled={explainMutation.isPending}
              className="px-3 py-1.5 rounded-md text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {explainMutation.isPending ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Brain className="w-3.5 h-3.5 text-purple-200" />
                  <span>Explain with AI</span>
                </>
              )}
            </button>
          </div>

          {/* ADDITIVE GEMINI AI SCENARIO ANALYSIS AREA */}
          {aiExplanation && (
            <div className="p-4 rounded-lg bg-purple-950/20 border border-purple-800/40 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-purple-800/40 pb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300">
                    AI SCENARIO ANALYSIS & THREE-RATING REASONING
                  </h4>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-900/40 text-purple-300 border border-purple-700/50 font-semibold">
                  {aiExplanation.engine_mode || 'GEMINI_LLM'}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                {aiExplanation.summary}
              </p>

              {/* Three Ratings Explanations (+ Risk) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {aiExplanation.ratings?.map((r: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-md bg-[#0C1628] border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{r.name}</span>
                      <span className="font-mono text-xs font-semibold text-emerald-400">{r.rating_value}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-normal">{r.reason}</p>
                    <div className="text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-800/60 flex items-center justify-between">
                      <span>{r.baseline_comparison}</span>
                    </div>
                    <p className="text-[10px] text-purple-300 font-semibold pt-0.5">
                      💡 {r.recommended_action}
                    </p>
                  </div>
                ))}
              </div>

              {/* Summary Points */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
                <div className="p-2.5 rounded bg-emerald-950/30 border border-emerald-800/30 text-emerald-300">
                  <span className="font-bold block uppercase text-[10px] text-emerald-400">Main Benefit</span>
                  {aiExplanation.main_benefit}
                </div>
                <div className="p-2.5 rounded bg-amber-950/30 border border-amber-800/30 text-amber-300">
                  <span className="font-bold block uppercase text-[10px] text-amber-400">Main Trade-Off</span>
                  {aiExplanation.main_tradeoff}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

