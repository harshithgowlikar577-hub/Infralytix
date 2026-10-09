import { Link } from 'react-router-dom';

export default function ComplianceFooter() {
  return (
    <footer className="mt-auto pt-6 pb-2 border-t border-slate-200 dark:border-slate-800/60" role="contentinfo">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500 tracking-wide">
        <div className="flex items-center gap-1.5">
          <span>© {new Date().getFullYear()} INFRALYTIX</span>
          <span className="text-slate-700">•</span>
          <span>Government of India Initiative</span>
          <span className="text-slate-700">•</span>
          <span>Smart India Hackathon</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
          <span className="text-slate-700">•</span>
          <Link to="/terms" className="hover:text-slate-300 transition-colors">Terms &amp; Conditions</Link>
          <span className="text-slate-700">•</span>
          <Link to="/cookies" className="hover:text-slate-300 transition-colors">Cookies Policy</Link>
          <span className="text-slate-700">•</span>
          <Link to="/about" className="hover:text-slate-300 transition-colors">About</Link>
          <span className="text-slate-700">•</span>
          <span>v1.0.0</span>
        </div>
      </div>
      <p className="text-center text-[9px] text-slate-600 mt-1.5">
        AI predictions are decision-support forecasts. Not a substitute for official government processes.
      </p>
    </footer>
  );
}
