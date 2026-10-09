import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, X } from 'lucide-react';

const CONSENT_KEY = 'infralytix-storage-consent';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      // Small delay so it doesn't flash on fast page loads
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    // Dismissed without explicit accept/reject — treat as deferred, show again next session
    // Do NOT store consent so banner re-appears on next page load
    setVisible(false);
  };

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    setVisible(false);
  };

  const handleReject = () => {
    // Clear non-essential storage, keep only auth tokens
    const keysToRemove = Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i))
      .filter((k): k is string => k !== null && k.startsWith('infralytix-pref-') || (k !== null && k === 'infralytix-recent-searches'));
    keysToRemove.forEach(k => localStorage.removeItem(k));
    
    localStorage.setItem(CONSENT_KEY, 'rejected');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-[9999] p-3 sm:p-4"
      role="dialog"
      aria-label="Cookie and storage consent"
      aria-live="polite"
    >
      <div className="max-w-4xl mx-auto bg-[#0A1628]/98 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-5 sm:p-6 shadow-2xl shadow-black/60">
        <div className="flex items-start gap-4">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldCheck className="w-4 h-4 text-blue-400" aria-hidden="true" />
          </div>

          <div id="cookie-consent-desc" className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-white mb-1.5">Data Storage &amp; Privacy Notice</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              INFRALYTIX uses browser local storage for authentication tokens, user preferences, and recent searches.
              <strong className="text-slate-300"> No third-party cookies, analytics trackers, or advertising scripts are used.</strong>
              {' '}All data remains on your device and is never transmitted to external services. By clicking "Accept",
              you consent to functional local storage usage in accordance with India's{' '}
              <Link to="/privacy" className="text-blue-400 hover:text-blue-300 underline">DPDP Act 2023</Link>.
            </p>
          </div>

          <button
            onClick={handleDismiss}
            className="text-slate-500 hover:text-slate-300 p-1 rounded-lg hover:bg-slate-800 transition-colors shrink-0"
            aria-label="Dismiss notice temporarily"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex items-center justify-end gap-3 mt-4 pt-3 border-t border-slate-800/60">
          <Link
            to="/privacy"
            className="text-xs text-blue-400 hover:text-blue-300 font-medium px-3 py-2 rounded-lg hover:bg-blue-500/10 transition-colors"
          >
            Learn More
          </Link>
          <button
            onClick={handleReject}
            aria-describedby="cookie-consent-desc"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800/80 border border-slate-700 hover:bg-slate-700 transition-all"
          >
            Essential Only
          </button>
          <button
            onClick={handleAccept}
            aria-describedby="cookie-consent-desc"
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
