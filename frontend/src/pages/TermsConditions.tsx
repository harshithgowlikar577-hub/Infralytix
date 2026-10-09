import { FileText, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function TermsConditions() {
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
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <FileText className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Terms &amp; Conditions</h1>
            <p className="text-xs text-slate-400 mt-0.5">Effective: October 2026 • Governing Law: Republic of India</p>
          </div>
        </div>

        <div className="space-y-8 text-sm leading-relaxed text-slate-300">
          <section>
            <h2 className="text-lg font-bold text-white mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using INFRALYTIX ("Platform"), you agree to be bound by these Terms &amp; Conditions.
              The Platform is a government-grade Infrastructure Monitoring &amp; Decision Intelligence system developed
              under the Smart India Hackathon initiative for the PAIMANA problem statement. If you do not agree to
              these terms, you must not use the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">2. Authorized Use</h2>
            <p>The Platform is intended for use by:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Government officials and ministry officers involved in infrastructure oversight</li>
              <li>Project managers responsible for central infrastructure projects</li>
              <li>Authorized evaluators and auditors (including SIH judges)</li>
              <li>Registered public viewers with read-only access</li>
            </ul>
            <p className="mt-2">Users must provide accurate registration information and maintain the confidentiality of their credentials.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">3. Platform Purpose</h2>
            <p>
              INFRALYTIX provides real-time infrastructure project monitoring, AI-assisted risk prediction, cost
              forecasting, early warning detection, and decision intelligence. The Platform is designed as a
              decision-support tool and does not replace official government processes, approvals, or regulatory decisions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">4. AI &amp; Predictive Analytics Disclaimer</h2>
            <p>
              The Platform employs locally trained Machine Learning models for risk prediction, cost estimation,
              and delay forecasting. These are statistical forecasts based on historical data patterns and should
              be interpreted as <strong className="text-white">decision-support aids, not guaranteed outcomes</strong>.
              The Platform does not use Large Language Models (LLMs), generative AI, GPT, or any external AI services.
              All analytics are deterministic and fully auditable.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">5. Data Accuracy</h2>
            <p>
              Infrastructure project data is sourced from government databases and processed through validation
              pipelines. While every effort is made to ensure accuracy, the Platform does not guarantee the
              completeness or real-time accuracy of all data points. Users should cross-reference critical
              decisions with official government records and MIS systems.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">6. Intellectual Property</h2>
            <p>
              All content, design, source code, machine learning models, algorithms, and documentation
              constituting the INFRALYTIX Platform are the intellectual property of Team INFRALYTIX, developed
              under the Smart India Hackathon. Icons are provided under the MIT License (Lucide Icons). Fonts
              are used under the Google Fonts open-source license.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">7. Prohibited Activities</h2>
            <ul className="list-disc list-inside space-y-1.5">
              <li>Attempting to gain unauthorized access to platform systems or data</li>
              <li>Reverse engineering, decompiling, or extracting proprietary ML models</li>
              <li>Using the Platform for purposes inconsistent with government infrastructure governance</li>
              <li>Sharing authentication credentials with unauthorized individuals</li>
              <li>Submitting false, misleading, or fraudulent information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">8. Limitation of Liability</h2>
            <p>
              INFRALYTIX is provided "as is" without warranties of any kind. Team INFRALYTIX shall not be liable
              for any direct, indirect, incidental, or consequential damages arising from the use or inability to
              use the Platform. Government decisions should not be based solely on Platform outputs without proper
              institutional review and approval processes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">9. Account Termination</h2>
            <p>
              We reserve the right to suspend or terminate user accounts that violate these terms or engage in
              activities that compromise platform integrity. Users may delete their accounts at any time via the
              Settings page or by contacting the administrator.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">10. Governing Law</h2>
            <p>
              These Terms &amp; Conditions are governed by the laws of the Republic of India, including the
              Information Technology Act 2000, the Digital Personal Data Protection Act 2023, and applicable
              government circulars regarding digital governance platforms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">11. Contact</h2>
            <p>For questions regarding these terms:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-slate-400">
              <li>Email: <span className="text-blue-400">legal@infralytix.gov.in</span></li>
              <li>Team INFRALYTIX, Smart India Hackathon</li>
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
