import { Building2, ArrowLeft, Globe, Cpu, Shield, Users, BarChart3, Target } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function About() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#070E1C] text-slate-200 p-6 sm:p-10 lg:p-16">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 mb-6 transition-colors cursor-pointer"
          aria-label="Go back"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">About INFRALYTIX</h1>
            <p className="text-xs text-slate-400 mt-0.5">National Infrastructure Intelligence Platform • v1.0.0</p>
          </div>
        </div>

        <div className="space-y-8 text-sm leading-relaxed text-slate-300">
          <section>
            <h2 className="text-lg font-bold text-white mb-3">Platform Overview</h2>
            <p>
              INFRALYTIX is a government-grade Infrastructure Monitoring &amp; Decision Intelligence Platform built
              for the <strong className="text-white">PAIMANA</strong> problem statement under the
              <strong className="text-white"> Smart India Hackathon</strong> initiative. It provides real-time
              monitoring, AI-assisted risk prediction, early warning detection, and prescriptive decision support
              for India's central infrastructure portfolio.
            </p>
          </section>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: Globe, title: 'GIS Intelligence', desc: 'Geospatial mapping of 1,981 national infrastructure projects across 35 states and UTs.' },
              { icon: Cpu, title: 'Machine Learning', desc: 'Locally trained GradientBoosting models for risk prediction, cost forecasting, and delay estimation.' },
              { icon: Shield, title: 'Offline Capable', desc: 'Zero external API dependencies. Fully air-gappable for classified government environments.' },
              { icon: BarChart3, title: 'Decision Intelligence', desc: 'Executive dashboards, what-if simulations, and prescriptive interventions.' },
              { icon: Target, title: 'Early Warning System', desc: '4-tier predictive alert queues with root cause diagnostics and recovery protocols.' },
              { icon: Users, title: 'Role-Based Access', desc: 'Ministry Officers, Project Managers, and Public Viewers with appropriate access controls.' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="glass-card p-4 rounded-xl border border-slate-800/80">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4 text-blue-400" />
                    <h3 className="text-sm font-bold text-white">{item.title}</h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">Technology Stack</h2>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="glass-card p-3 rounded-lg border border-slate-800"><strong className="text-white">Frontend:</strong> React 19, TypeScript, Vite, TailwindCSS, Recharts</div>
              <div className="glass-card p-3 rounded-lg border border-slate-800"><strong className="text-white">Backend:</strong> FastAPI, Python 3.14, SQLAlchemy, Pydantic</div>
              <div className="glass-card p-3 rounded-lg border border-slate-800"><strong className="text-white">Database:</strong> SQLite (PostgreSQL compatible)</div>
              <div className="glass-card p-3 rounded-lg border border-slate-800"><strong className="text-white">ML Models:</strong> Scikit-learn GradientBoosting (.joblib)</div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">AI Transparency Statement</h2>
            <p>
              INFRALYTIX uses locally trained Machine Learning models for predictive analytics. These include:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong className="text-white">Risk Prediction:</strong> 14-signal composite risk scoring based on cost, schedule, and physical progress metrics</li>
              <li><strong className="text-white">Cost Forecasting:</strong> GradientBoosting regression on historical cost escalation patterns</li>
              <li><strong className="text-white">Delay Estimation:</strong> Multi-factor predictive model incorporating sector, geography, and contractor signals</li>
            </ul>
            <p className="mt-3 text-slate-400">
              The Platform does <strong className="text-rose-400">not</strong> use Large Language Models (LLMs),
              Generative AI, GPT, or any external AI services. All analytics are deterministic, explainable, and
              fully auditable. The AI Copilot uses offline rule-based local RAG with 0% hallucination risk.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">Version Information</h2>
            <div className="glass-card p-4 rounded-xl border border-slate-800 text-xs space-y-1.5">
              <div className="flex justify-between"><span className="text-slate-400">Platform Version</span><span className="font-mono text-white">1.0.0</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Build</span><span className="font-mono text-white">Production</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Database Records</span><span className="font-mono text-white">1,981 Projects</span></div>
              <div className="flex justify-between"><span className="text-slate-400">ML Models</span><span className="font-mono text-white">2 GradientBoosting (.joblib)</span></div>
              <div className="flex justify-between"><span className="text-slate-400">API Endpoints</span><span className="font-mono text-white">30+ RESTful</span></div>
              <div className="flex justify-between"><span className="text-slate-400">External Dependencies</span><span className="font-mono text-emerald-400">None (Fully Offline)</span></div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">Contact</h2>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>Platform: <span className="text-blue-400">info@infralytix.gov.in</span></li>
              <li>Technical Support: <span className="text-blue-400">support@infralytix.gov.in</span></li>
              <li>Privacy &amp; Data: <span className="text-blue-400">privacy@infralytix.gov.in</span></li>
              <li>Initiative: Smart India Hackathon, Government of India</li>
            </ul>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800 text-center text-[10px] text-slate-500 tracking-wider uppercase">
          © {new Date().getFullYear()} INFRALYTIX • Government of India Initiative • Smart India Hackathon
        </div>
      </div>
    </div>
  );
}
