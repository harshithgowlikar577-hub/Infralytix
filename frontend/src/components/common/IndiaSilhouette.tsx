import { INDIA_STATES } from '../gis/indiaMapData';

export default function IndiaSilhouette({ className = '' }: { className?: string }) {
  return (
    <div className={`p-3 rounded-2xl bg-[#070F1E] border border-blue-900/30 flex items-center gap-3 shadow-inner ${className}`}>
      {/* India Outline SVG with glowing cyan gradient & accurate state contours */}
      <div className="w-10 h-12 relative shrink-0 flex items-center justify-center">
        <svg
          viewBox="30 20 740 850"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_0_8px_rgba(6,182,212,0.45)]"
        >
          <defs>
            <linearGradient id="indiaGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#0284C7" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#0D9488" stopOpacity="0.75" />
            </linearGradient>
          </defs>
          {/* Authentic Geographic State Boundaries */}
          <g>
            {INDIA_STATES.map((s) => (
              <path
                key={s.id}
                d={s.d}
                fill="url(#indiaGlow)"
                stroke="#38BDF8"
                strokeWidth="2.5"
                strokeLinejoin="round"
                opacity="0.9"
              />
            ))}
          </g>
          {/* Accent Tricolor points */}
          <circle cx="285" cy="275" r="14" fill="#FF9933" />
          <circle cx="340" cy="500" r="14" fill="#FFFFFF" />
          <circle cx="310" cy="740" r="14" fill="#138808" />
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-bold text-slate-200 leading-tight">
          Stronger Infrastructure
        </div>
        <div className="text-[10px] text-cyan-400 font-medium leading-tight mt-0.5">
          for a Developed India
        </div>
      </div>
    </div>
  );
}
