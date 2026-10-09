import { Cookie, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CookiesPolicy() {
  return (
    <div className="min-h-screen bg-[#070E1C] text-slate-200 p-6 sm:p-10 lg:p-16">
      <div className="max-w-4xl mx-auto">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 mb-6 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Cookie className="w-5 h-5 text-amber-400" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Cookies &amp; Storage Policy</h1>
            <p className="text-xs text-slate-400 mt-0.5">Last updated: October 2026 • Compliant with DPDP Act 2023</p>
          </div>
        </div>

        <div className="space-y-8 text-sm leading-relaxed text-slate-300">
          <section>
            <h2 className="text-lg font-bold text-white mb-3">1. Overview</h2>
            <p>
              INFRALYTIX does <strong className="text-white">not</strong> use traditional HTTP cookies.
              Instead, the Platform uses browser <strong className="text-white">localStorage</strong> exclusively
              for functional purposes. No third-party cookies, analytics trackers, advertising pixels, or session
              cookies are placed on your device. This policy describes exactly what is stored, why, and how you
              can control it.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">2. What We Store</h2>
            <p>All storage is confined to your browser's <code className="bg-slate-800 px-1.5 py-0.5 rounded text-xs font-mono text-blue-300">localStorage</code>, never transmitted to external servers.</p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400 uppercase tracking-wider">
                    <th className="py-2 px-3 text-left">Key Name</th>
                    <th className="py-2 px-3 text-left">Purpose</th>
                    <th className="py-2 px-3 text-left">Category</th>
                    <th className="py-2 px-3 text-left">Retention</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  <tr>
                    <td className="py-2 px-3 font-mono text-blue-300">infralytix_token</td>
                    <td className="py-2 px-3">JWT access token for session authentication</td>
                    <td className="py-2 px-3"><span className="bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase">Strictly Necessary</span></td>
                    <td className="py-2 px-3">Until logout or token expiry (24h)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-mono text-blue-300">infralytix_refresh_token</td>
                    <td className="py-2 px-3">JWT refresh token for session renewal</td>
                    <td className="py-2 px-3"><span className="bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase">Strictly Necessary</span></td>
                    <td className="py-2 px-3">Until logout (7 days)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-mono text-blue-300">infralytix-storage-consent</td>
                    <td className="py-2 px-3">Records your consent decision (accepted / rejected)</td>
                    <td className="py-2 px-3"><span className="bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase">Strictly Necessary</span></td>
                    <td className="py-2 px-3">Persistent until cleared</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-mono text-blue-300">infralytix-display-name</td>
                    <td className="py-2 px-3">Your preferred display name in the platform UI</td>
                    <td className="py-2 px-3"><span className="bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase">Functional</span></td>
                    <td className="py-2 px-3">Until account deletion or preference reset</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-mono text-blue-300">infralytix-display-role</td>
                    <td className="py-2 px-3">Your preferred role label shown in the header</td>
                    <td className="py-2 px-3"><span className="bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase">Functional</span></td>
                    <td className="py-2 px-3">Until preference reset</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-mono text-blue-300">infralytix-avatar-url</td>
                    <td className="py-2 px-3">URL of your selected profile avatar image</td>
                    <td className="py-2 px-3"><span className="bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase">Functional</span></td>
                    <td className="py-2 px-3">Until preference reset</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-mono text-blue-300">infralytix-pref-*</td>
                    <td className="py-2 px-3">Dashboard layout, notification, auto-refresh, and display preferences</td>
                    <td className="py-2 px-3"><span className="bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase">Functional</span></td>
                    <td className="py-2 px-3">Until preference reset</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-mono text-blue-300">infralytix-recent-searches</td>
                    <td className="py-2 px-3">Last 5 project search queries for quick access</td>
                    <td className="py-2 px-3"><span className="bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase">Functional</span></td>
                    <td className="py-2 px-3">Until cleared or consent rejected</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">3. Categories Explained</h2>
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <h3 className="text-sm font-bold text-emerald-400 mb-1">Strictly Necessary</h3>
                <p className="text-xs text-slate-400">
                  These are essential for the Platform to function. They enable authentication and security.
                  You cannot opt out of these without ceasing to use the Platform. Under DPDP Act 2023 and
                  applicable guidelines, strictly necessary storage does not require explicit consent.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                <h3 className="text-sm font-bold text-blue-400 mb-1">Functional</h3>
                <p className="text-xs text-slate-400">
                  These enhance your experience by remembering your preferences. They are not strictly
                  required — rejecting them means preferences will not persist between sessions.
                  You can control these via the consent banner or Settings page.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">4. What We Do NOT Use</h2>
            <ul className="list-disc list-inside space-y-1.5 text-slate-400">
              <li>No HTTP cookies or session cookies</li>
              <li>No third-party analytics (Google Analytics, Mixpanel, Segment, etc.)</li>
              <li>No advertising or retargeting pixels (Facebook Pixel, Google Ads, etc.)</li>
              <li>No social media tracking scripts</li>
              <li>No fingerprinting or cross-site tracking technologies</li>
              <li>No data is transmitted to any external server or cloud service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">5. Managing Your Preferences</h2>
            <p>You can manage storage consent in the following ways:</p>
            <ul className="list-disc list-inside space-y-1.5 mt-2 text-slate-400">
              <li><strong className="text-white">Accept All</strong> — enables all functional storage for best experience</li>
              <li><strong className="text-white">Essential Only</strong> — clears functional preferences, retains auth tokens only</li>
              <li><strong className="text-white">Settings Page</strong> — manage specific preferences at any time</li>
              <li><strong className="text-white">Browser Settings</strong> — clear all site data via your browser's developer tools or privacy settings</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">6. Legal Basis (DPDP Act 2023)</h2>
            <p>
              Strictly necessary storage is processed under <strong className="text-white">Legitimate Use (Section 7)</strong> of the
              Digital Personal Data Protection Act 2023. Functional storage is processed under <strong className="text-white">Consent (Section 6)</strong>.
              You have the right to withdraw consent at any time via the Settings page or by clearing your browser storage.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">7. Contact</h2>
            <p>For questions about storage practices or to exercise your rights:</p>
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
