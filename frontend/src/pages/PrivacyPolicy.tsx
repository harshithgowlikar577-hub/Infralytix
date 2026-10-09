import { Shield, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function PrivacyPolicy() {
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
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Privacy Policy</h1>
            <p className="text-xs text-slate-400 mt-0.5">Last updated: October 2026 • Compliant with DPDP Act 2023</p>
          </div>
        </div>

        <div className="space-y-8 text-sm leading-relaxed text-slate-300">
          <section>
            <h2 className="text-lg font-bold text-white mb-3">1. Introduction</h2>
            <p>
              INFRALYTIX ("Platform") is a government-grade Infrastructure Monitoring &amp; Decision Intelligence Platform
              developed for the PAIMANA problem statement under the Smart India Hackathon initiative. This Privacy Policy
              describes how the Platform collects, uses, stores, and protects personal data in compliance with the
              <strong className="text-white"> Digital Personal Data Protection Act, 2023 (DPDP Act)</strong> of India.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">2. Data Controller</h2>
            <p>
              The Platform is operated by Team INFRALYTIX. For privacy-related inquiries, contact:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-slate-400">
              <li>Email: <span className="text-blue-400">privacy@infralytix.gov.in</span></li>
              <li>Address: Smart India Hackathon, Government of India Initiative</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">3. Personal Data Collected</h2>
            <p>We collect the following categories of personal data, strictly for platform functionality:</p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400 uppercase tracking-wider">
                    <th className="py-2 px-3 text-left">Data Category</th>
                    <th className="py-2 px-3 text-left">Purpose</th>
                    <th className="py-2 px-3 text-left">Legal Basis (DPDP Act)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  <tr><td className="py-2 px-3">Full Name</td><td className="py-2 px-3">User identification &amp; display</td><td className="py-2 px-3">Consent (Sec. 6)</td></tr>
                  <tr><td className="py-2 px-3">Email Address</td><td className="py-2 px-3">Authentication &amp; communication</td><td className="py-2 px-3">Consent (Sec. 6)</td></tr>
                  <tr><td className="py-2 px-3">Password (Hashed)</td><td className="py-2 px-3">Secure account access</td><td className="py-2 px-3">Legitimate Use (Sec. 7)</td></tr>
                  <tr><td className="py-2 px-3">Ministry/Organization</td><td className="py-2 px-3">Role-based access control</td><td className="py-2 px-3">Legitimate Use (Sec. 7)</td></tr>
                  <tr><td className="py-2 px-3">Role Designation</td><td className="py-2 px-3">Authorization &amp; access control</td><td className="py-2 px-3">Legitimate Use (Sec. 7)</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">4. Purpose Limitation</h2>
            <p>
              Personal data is collected solely for authentication, authorization, and platform personalization.
              Data is never used for advertising, profiling, or shared with third parties. The Platform operates
              entirely offline with no external API dependencies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">5. Data Minimization</h2>
            <p>
              The Platform collects only the minimum personal data necessary for its operation. Infrastructure project
              data (cost, schedule, risk scores) is anonymized government portfolio data and does not contain
              personal information of citizens.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">6. Data Storage &amp; Security</h2>
            <ul className="list-disc list-inside space-y-1.5">
              <li>All data is stored locally in a SQLite database on the hosting server.</li>
              <li>Passwords are hashed using bcrypt before storage.</li>
              <li>Authentication uses JSON Web Tokens (JWT) with configurable expiration.</li>
              <li>No data is transmitted to external servers, cloud services, or third-party APIs.</li>
              <li>The Platform is fully air-gappable for classified government environments.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">7. Data Retention</h2>
            <p>
              User account data is retained for the duration of account activity. Infrastructure project data is
              retained as long as required for monitoring and historical analysis. Users may request deletion of
              their personal data at any time (see Section 9).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">8. Browser Storage</h2>
            <p>The Platform uses browser localStorage for the following strictly functional purposes:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li><strong className="text-white">Authentication tokens</strong> — session management (JWT access &amp; refresh tokens)</li>
              <li><strong className="text-white">User preferences</strong> — display name, dashboard layout, notification settings</li>
              <li><strong className="text-white">Recent searches</strong> — improving search experience</li>
            </ul>
            <p className="mt-2">No third-party cookies, analytics trackers, or advertising pixels are used.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">9. Your Rights Under DPDP Act 2023</h2>
            <ul className="list-disc list-inside space-y-1.5">
              <li><strong className="text-white">Right to Access</strong> — Request a copy of your personal data.</li>
              <li><strong className="text-white">Right to Correction</strong> — Update inaccurate personal data via Settings.</li>
              <li><strong className="text-white">Right to Erasure</strong> — Request complete deletion of your account and data.</li>
              <li><strong className="text-white">Right to Grievance Redressal</strong> — Contact the Data Protection Officer.</li>
              <li><strong className="text-white">Right to Withdraw Consent</strong> — Withdraw consent at any time by deleting your account.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">10. AI &amp; Machine Learning Disclosure</h2>
            <p>
              The Platform uses locally trained Machine Learning models (GradientBoosting) for risk prediction, cost
              forecasting, and delay estimation. These models run entirely on-device with no external API calls. All
              predictions are clearly labeled as forecasts and should not be interpreted as guaranteed outcomes. Users
              can review explainability metrics, feature attributions, and confidence intervals on all AI-generated insights.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">11. Changes to This Policy</h2>
            <p>
              This Privacy Policy may be updated to reflect changes in legal requirements or platform features.
              Users will be notified of significant changes through the Platform's notification system. Continued
              use of the Platform after updates constitutes acceptance of the revised policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">12. Contact</h2>
            <p>For privacy inquiries, data access requests, or grievances:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-slate-400">
              <li>Email: <span className="text-blue-400">privacy@infralytix.gov.in</span></li>
              <li>Data Protection Officer: Team INFRALYTIX</li>
              <li>Response Time: Within 30 days as mandated under DPDP Act 2023</li>
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
