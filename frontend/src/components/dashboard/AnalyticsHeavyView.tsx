import { useState } from 'react';
import { 
  BarChart3, Cpu, Binary, Sparkles, 
  HelpCircle, ArrowUpRight, CheckCircle2,
  TrendingDown, FileSpreadsheet
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Area, ComposedChart, Bar,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { ModeBadge } from '../ui/Badge';
import { formatCurrency } from '../../lib/utils';

interface AnalyticsHeavyViewProps {
  data: any;
  riskData: any;
  sectorData: any;
}

export default function AnalyticsHeavyView({ data, riskData }: AnalyticsHeavyViewProps) {
  const navigate = useNavigate();
  const [selectedCohort, setSelectedCohort] = useState<string>('all');

  // Multi-horizon S-Curve Data with Capital Burn Mismatch & AI Forecast Cone
  const sCurveData = [
    { quarter: '24-Q1', plannedPhys: 12, actualPhys: 12, actualSpend: 10, aiForecast: null, lowerCI: null, upperCI: null },
    { quarter: '24-Q2', plannedPhys: 24, actualPhys: 22, actualSpend: 24, aiForecast: null, lowerCI: null, upperCI: null },
    { quarter: '24-Q3', plannedPhys: 38, actualPhys: 32, actualSpend: 40, aiForecast: null, lowerCI: null, upperCI: null },
    { quarter: '24-Q4', plannedPhys: 52, actualPhys: 38, actualSpend: 54, aiForecast: null, lowerCI: null, upperCI: null },
    { quarter: '25-Q1', plannedPhys: 66, actualPhys: 42, actualSpend: 62, aiForecast: 42, lowerCI: 42, upperCI: 42 },
    { quarter: '25-Q2', plannedPhys: 78, actualPhys: null, actualSpend: null, aiForecast: 49, lowerCI: 44, upperCI: 53 },
    { quarter: '25-Q3', plannedPhys: 88, actualPhys: null, actualSpend: null, aiForecast: 58, lowerCI: 51, upperCI: 64 },
    { quarter: '25-Q4', plannedPhys: 96, actualPhys: null, actualSpend: null, aiForecast: 68, lowerCI: 60, upperCI: 76 },
    { quarter: '26-Q1', plannedPhys: 100, actualPhys: null, actualSpend: null, aiForecast: 79, lowerCI: 69, upperCI: 88 },
    { quarter: '26-Q2', plannedPhys: 100, actualPhys: null, actualSpend: null, aiForecast: 89, lowerCI: 78, upperCI: 98 },
    { quarter: '26-Q3', plannedPhys: 100, actualPhys: null, actualSpend: null, aiForecast: 97, lowerCI: 86, upperCI: 100 },
  ];

  // SHAP Feature Attribution Driver Waterfall
  const shapDrivers = [
    { feature: 'Land Acquisition & RoW Clearances', impact: 38.2, direction: 'escalating', cohort: 'Highways & Rail', pValue: '<0.001' },
    { feature: 'Contractor Velocity & Equipment Mobilization', impact: 24.6, direction: 'escalating', cohort: 'All Sectors', pValue: '<0.001' },
    { feature: 'State Environmental & Forest Clearances', impact: 16.4, direction: 'escalating', cohort: 'Linear Corridors', pValue: '0.002' },
    { feature: 'Multi-Agency Utility Shifting Friction', impact: 11.8, direction: 'escalating', cohort: 'Urban & Transmission', pValue: '0.014' },
    { feature: 'Monsoon Soil Compaction Slippage', impact: 7.5, direction: 'escalating', cohort: 'Coastal / Flood Plains', pValue: '0.048' },
    { feature: 'Timely State Matching Fund Release', impact: -12.4, direction: 'protective', cohort: 'Centrally Sponsored', pValue: '<0.001' },
  ];

  // Failure DNA™ 5-Axis Structural Match Radar
  const radarData = [
    { axis: 'Contractor Overextension', activeProject: 88, historicalFailure: 82, benchmark: 40 },
    { axis: 'Clearance Velocity Lag', activeProject: 92, historicalFailure: 90, benchmark: 35 },
    { axis: 'Capital Burn Mismatch', activeProject: 79, historicalFailure: 75, benchmark: 30 },
    { axis: 'Milestone Volatility', activeProject: 84, historicalFailure: 86, benchmark: 45 },
    { axis: 'Inter-Agency Friction', activeProject: 76, historicalFailure: 78, benchmark: 50 },
  ];

  // Sector Delay & Cost Variance Statistical Distribution
  const sectorDistributions = [
    { sector: 'Highways (MoRTH)', medianDelay: 16.4, p75Delay: 22.0, maxDelay: 58.0, costVariance: '+24.1%', sampleSize: 842 },
    { sector: 'Railways & DFCs', medianDelay: 18.2, p75Delay: 26.5, maxDelay: 72.0, costVariance: '+28.6%', sampleSize: 498 },
    { sector: 'Power Transmission', medianDelay: 9.4, p75Delay: 14.0, maxDelay: 36.0, costVariance: '+14.2%', sampleSize: 284 },
    { sector: 'Petroleum & Gas', medianDelay: 7.8, p75Delay: 11.5, maxDelay: 24.0, costVariance: '+8.9%', sampleSize: 142 },
    { sector: 'Urban Development', medianDelay: 13.1, p75Delay: 19.4, maxDelay: 44.0, costVariance: '+19.5%', sampleSize: 128 },
  ];

  return (
    <div className="space-y-8">
      {/* Econometric & ML Telemetry Diagnostics Header */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-950/60 border border-purple-800/60 flex items-center justify-center text-purple-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-wide">
                Econometric Risk Diagnostics & Machine Learning Lab
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono-data font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                XGBoost v3.8 + Random Forest Ensemble
              </span>
              <ModeBadge mode="predicted" />
            </div>
            <p className="text-xs text-slate-400 font-mono-data mt-0.5">
              TRAINED ON: 1,981 CUF DATASETS · AUC-ROC: 0.932 · RMSE: 3.42 Mo · SHAP KERNEL: ACTIVE
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button 
            onClick={() => navigate('/model-lab')}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-950/60 hover:bg-purple-900 text-purple-200 border border-purple-800 transition-colors"
          >
            <Binary className="w-3.5 h-3.5" />
            Audit Model Weights
          </button>
          <button 
            onClick={() => navigate('/analytics')}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Export Econometric Dataset (CSV)
          </button>
        </div>
      </div>

      {/* Advanced Statistical KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 border-l-4 border-l-orange-500">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="uppercase tracking-wider font-semibold">Capital Burn Mismatch</span>
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-bold font-mono-data text-white">1.38x</p>
            <span className="text-xs font-mono-data font-semibold text-orange-400">Financial vs Physical</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Spend burn rate leads physical execution by 20.4% across 482 active contracts
          </p>
        </div>

        <div className="glass-card p-4 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="uppercase tracking-wider font-semibold">Portfolio Delay Skewness</span>
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-bold font-mono-data text-white">+1.84</p>
            <span className="text-xs font-mono-data font-semibold text-purple-400">Right-Tailed</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Severe non-normal fat-tail distribution; top 10% assets account for 54% of delay
          </p>
        </div>

        <div className="glass-card p-4 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="uppercase tracking-wider font-semibold">95% CI Capital Exposure</span>
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-bold font-mono-data text-white">₹42.7k Cr</p>
            <span className="text-[11px] font-mono-data text-slate-400">[38.2k – 47.1k]</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Monte Carlo parametric simulation (10,000 runs) over active MoSPI contracts
          </p>
        </div>

        <div className="glass-card p-4 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="uppercase tracking-wider font-semibold">Population Stability Index</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-bold font-mono-data text-white">0.042</p>
            <span className="text-xs font-mono-data font-semibold text-emerald-400">Stable (&lt;0.10)</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Zero feature drift detected between 2024 training cohort and Q3 2026 data
          </p>
        </div>
      </div>

      {/* Row 2: Physical & Financial S-Curve with Capital Burn Mismatch Gap */}
      <div className="glass-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide">
                Portfolio S-Curve: Physical vs. Financial Spend vs. AI Predictive Cone
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono-data font-semibold bg-orange-950/60 text-orange-400 border border-orange-800">
                ⚠️ Burn Mismatch Detected at 25-Q1
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Planned Physical Baseline (Gray) vs Actual Progress (Green) vs Cumulative Financial Spend (Orange) vs AI Forecast (Violet)
            </p>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono-data">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-3 h-0.5 bg-slate-500" /> Planned Physical
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="w-3 h-0.5 bg-emerald-400" /> Actual Physical (42%)
            </span>
            <span className="flex items-center gap-1.5 text-orange-400 font-semibold">
              <span className="w-3 h-0.5 bg-orange-500 border-dashed" /> Financial Spend (62%)
            </span>
            <span className="flex items-center gap-1.5 text-purple-400 font-semibold">
              <span className="w-3 h-0.5 bg-purple-500" /> AI Forecast Cone
            </span>
          </div>
        </div>

        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={sCurveData} margin={{ top: 10, right: 30, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis 
                dataKey="quarter" 
                tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'JetBrains Mono' }} 
                axisLine={{ stroke: '#334155' }} 
              />
              <YAxis 
                domain={[0, 100]} 
                unit="%" 
                tick={{ fill: '#94A3B8', fontSize: 11, fontFamily: 'JetBrains Mono' }} 
                axisLine={{ stroke: '#334155' }} 
              />
              <Tooltip
                content={({ payload, label }) => {
                  if (!payload || !payload.length) return null;
                  return (
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-700 shadow-2xl text-xs space-y-1 font-mono-data">
                      <p className="font-bold text-white text-sm font-sans">{label}</p>
                      {payload.map((entry: any, i: number) => (
                        <div key={i} className="flex items-center justify-between gap-4" style={{ color: entry.color }}>
                          <span>{entry.name}:</span>
                          <span className="font-bold">{entry.value}%</span>
                        </div>
                      ))}
                    </div>
                  );
                }}
              />
              {/* AI Forecast Uncertainty Band */}
              <Area type="monotone" dataKey="upperCI" stroke="none" fill="#8B5CF6" fillOpacity={0.12} name="95% Upper CI" />
              <Area type="monotone" dataKey="lowerCI" stroke="none" fill="#0F172A" fillOpacity={1} name="95% Lower CI" />
              {/* Planned Physical Baseline */}
              <Line type="monotone" dataKey="plannedPhys" stroke="#64748B" strokeWidth={2} dot={false} name="Planned Physical" />
              {/* Actual Physical */}
              <Line type="monotone" dataKey="actualPhys" stroke="#10B981" strokeWidth={3} dot={{ r: 4, fill: '#10B981' }} name="Actual Physical" />
              {/* Actual Financial Spend */}
              <Line type="monotone" dataKey="actualSpend" stroke="#F97316" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3, fill: '#F97316' }} name="Financial Spend" />
              {/* AI Predicted Trajectory */}
              <Line type="monotone" dataKey="aiForecast" stroke="#8B5CF6" strokeWidth={2.5} strokeDasharray="2 2" dot={{ r: 4, fill: '#8B5CF6' }} name="AI Prediction" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Burn Mismatch Interpretation Strip */}
        <div className="mt-3 p-3 rounded-lg bg-orange-950/20 border border-orange-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-400" />
            <span className="text-slate-200">
              <strong>Capital Burn Mismatch Analysis:</strong> Spend has reached <span className="font-mono-data text-orange-400 font-bold">62.0%</span> while physical execution is at <span className="font-mono-data text-emerald-400 font-bold">42.0%</span>.
            </span>
          </div>
          <span className="text-orange-300 font-mono-data text-[11px] font-semibold">
            Escalation Risk: 78% Probability of Cost Overrun ≥ ₹8,400 Cr
          </span>
        </div>
      </div>

      {/* Row 3: SHAP Feature Attribution Waterfall + Failure DNA Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: SHAP Feature Attribution (Delay Impact in Points) */}
        <div className="lg:col-span-7 glass-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Key Delay Drivers & Risk Factors (Explainable AI)
                </h3>
                <p className="text-xs text-slate-400">
                  Impact of land acquisition, clearances, contractor capacity, and cost inflation on delay points
                </p>
              </div>
              <ModeBadge mode="predicted" />
            </div>

            <div className="space-y-3 mt-4">
              {shapDrivers.map((driver) => {
                const isProtective = driver.direction === 'protective';
                const barWidth = Math.min(100, Math.abs(driver.impact) * 2.2);

                return (
                  <div key={driver.feature} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">{driver.feature}</span>
                      <div className="flex items-center gap-2 font-mono-data">
                        <span className="text-[10px] text-slate-500">p={driver.pValue}</span>
                        <span className={`font-bold ${isProtective ? 'text-emerald-400' : 'text-red-400'}`}>
                          {isProtective ? '' : '+'}{driver.impact} pts
                        </span>
                      </div>
                    </div>

                    <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex items-center p-0.5">
                      <div 
                        style={{ width: `${barWidth}%` }}
                        className={`h-full rounded-full transition-all duration-500 ${
                          isProtective 
                            ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' 
                            : 'bg-gradient-to-r from-orange-500 to-red-500'
                        }`}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono-data">
                      <span>Primary Cohort: {driver.cohort}</span>
                      <span>{isProtective ? 'Protective Factor' : 'Risk Accelerator'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 mt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Kernel Explainer Confidence:</span>
            <span className="font-mono-data text-purple-400 font-semibold">R² = 0.892 (High Explainability)</span>
          </div>
        </div>

        {/* Right: Project Failure DNA™ Structural Radar */}
        <div className="lg:col-span-5 glass-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Similar Risk Profiles & Pattern Matching
                </h3>
                <p className="text-xs text-slate-400">
                  Resemblance to historical project bottleneck archetypes
                </p>
              </div>
              <button 
                onClick={() => navigate('/similarity')}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
              >
                DNA Lab <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            <div className="h-[250px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="75%">
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="axis" tick={{ fill: '#94A3B8', fontSize: 10, fontFamily: 'Inter' }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar 
                    name="Active High-Risk Cohort" 
                    dataKey="activeProject" 
                    stroke="#EF4444" 
                    fill="#EF4444" 
                    fillOpacity={0.4} 
                  />
                  <Radar 
                    name="Historical Failed Baseline" 
                    dataKey="historicalFailure" 
                    stroke="#F59E0B" 
                    fill="#F59E0B" 
                    fillOpacity={0.2} 
                    strokeDasharray="3 3"
                  />
                  <Radar 
                    name="National Benchmark" 
                    dataKey="benchmark" 
                    stroke="#10B981" 
                    fill="#10B981" 
                    fillOpacity={0.1} 
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 space-y-1 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span>Cosine Similarity Match:</span>
              <strong className="font-mono-data text-red-400">84.2% Match</strong>
            </div>
            <p className="text-[11px] text-slate-400">
              Matched archetype: <em>"Early statutory RoW deadlock followed by secondary contractor liquidity distress"</em>
            </p>
          </div>
        </div>
      </div>

      {/* Row 4: Sector Delay & Cost Variance Statistical Dispersion Grid */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              Cross-Sector Delay Dispersion & Cost Variance Analysis
            </h3>
            <p className="text-xs text-slate-400">
              Parametric quantile estimates across Indian infrastructure ministries
            </p>
          </div>
          <span className="text-xs font-mono-data text-slate-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
            N = 1,981 Projects
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {sectorDistributions.map((s) => (
            <div key={s.sector} className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-200 truncate">{s.sector}</h4>
                <span className="text-[10px] font-mono-data text-slate-500">{s.sampleSize}</span>
              </div>

              <div className="space-y-1 text-[11px] font-mono-data">
                <div className="flex justify-between text-slate-400">
                  <span>Median Delay:</span>
                  <span className="text-amber-400 font-bold">{s.medianDelay} Mo</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>75th Percentile:</span>
                  <span className="text-orange-400">{s.p75Delay} Mo</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Max Outlier:</span>
                  <span className="text-red-400">{s.maxDelay} Mo</span>
                </div>
                <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800">
                  <span>Cost Variance:</span>
                  <span className="text-white font-bold">{s.costVariance}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
