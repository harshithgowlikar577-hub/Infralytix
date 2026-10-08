import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({
  title = 'Something went wrong',
  message = 'Unable to load data. Please check your connection and try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="glass-card p-8 rounded-2xl border border-slate-800/80 shadow-sm flex flex-col items-center justify-center text-center">
      <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4 shadow-sm">
        <AlertTriangle className="w-7 h-7 text-rose-400" />
      </div>
      <h3 className="text-sm font-semibold text-slate-100 mb-1">{title}</h3>
      <p className="text-xs text-slate-400 max-w-sm mb-4 leading-relaxed">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-all shadow-sm active:scale-[0.99]"
        >
          <RefreshCw className="w-3.5 h-3.5" /> <span>Retry</span>
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  title = 'No data available',
  message = 'No records match the selected criteria. Try adjusting your filters.',
  icon,
}: {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="glass-card p-8 rounded-2xl border border-slate-800/80 shadow-sm flex flex-col items-center justify-center text-center">
      {icon || (
        <div className="w-14 h-14 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center mb-4 shadow-sm">
          <span className="text-2xl">📊</span>
        </div>
      )}
      <h3 className="text-sm font-semibold text-slate-200 mb-1">{title}</h3>
      <p className="text-xs text-slate-400 max-w-sm leading-relaxed">{message}</p>
    </div>
  );
}
