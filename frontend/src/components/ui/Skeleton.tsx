interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'card' | 'circle' | 'chart';
  count?: number;
}

export default function Skeleton({ className = '', variant = 'text', count = 1 }: SkeletonProps) {
  const items = Array.from({ length: count });

  if (variant === 'card') {
    return (
      <div className={`glass-card p-5 rounded-2xl border border-slate-800/80 space-y-4 shadow-sm ${className}`}>
        <div className="skeleton h-3 w-24 rounded-md" />
        <div className="skeleton h-8 w-32 rounded-lg" />
        <div className="skeleton h-2 w-16 rounded-md" />
      </div>
    );
  }

  if (variant === 'chart') {
    return (
      <div className={`glass-card p-5 rounded-2xl border border-slate-800/80 space-y-4 shadow-sm ${className}`}>
        <div className="skeleton h-3 w-32 rounded-md mb-4" />
        <div className="skeleton h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (variant === 'circle') {
    return <div className={`skeleton rounded-full ${className}`} style={{ width: 80, height: 80 }} />;
  }

  return (
    <>
      {items.map((_, i) => (
        <div key={i} className={`skeleton h-3 rounded-md ${className}`} style={{ width: `${70 + Math.random() * 30}%` }} />
      ))}
    </>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="skeleton h-8 w-64 rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} variant="card" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton variant="chart" />
        <Skeleton variant="chart" />
      </div>
    </div>
  );
}

export function FullPageLoader({ message = 'Loading infrastructure telemetry...' }: { message?: string }) {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
      <div className="relative mb-5">
        <div className="w-20 h-20 rounded-2xl bg-[#0B1528] border border-[#1E3354] flex items-center justify-center p-3 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-500/10 animate-pulse rounded-2xl" />
          <img
            src="/logo.png"
            alt="INFRALYTIX Official Logo"
            className="w-full h-full object-contain relative z-10 filter drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
            loading="lazy"
          />
        </div>
        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-blue-500 animate-pulse" />
      </div>
      <h3 className="text-base font-bold text-slate-100 tracking-wide">INFRALYTIX</h3>
      <p className="text-xs text-slate-400 mt-1 max-w-sm">{message}</p>
    </div>
  );
}
