interface RiskGaugeProps {
  score: number;
  size?: number;
  label?: string;
  showLabel?: boolean;
}

export default function RiskGauge({ score, size = 120, label, showLabel = true }: RiskGaugeProps) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(100, Math.max(0, score));
  const offset = circumference - (progress / 100) * circumference;

  const getColor = (s: number) => {
    if (s <= 30) return '#10B981';
    if (s <= 50) return '#F59E0B';
    if (s <= 70) return '#F97316';
    if (s <= 85) return '#EF4444';
    return '#991B1B';
  };

  const getLabel = (s: number) => {
    if (s <= 30) return 'Safe';
    if (s <= 50) return 'Watch';
    if (s <= 70) return 'High';
    if (s <= 85) return 'Very High';
    return 'Critical';
  };

  const color = getColor(score);
  const riskLabel = label || getLabel(score);

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="#1E293B" strokeWidth="8"
        />
        {/* Progress arc */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="gauge-ring"
          style={{ filter: `drop-shadow(0 0 6px ${color}40)` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <span className="text-2xl font-bold font-mono-data text-white">{Math.round(score)}</span>
        {showLabel && (
          <span className="text-[10px] font-semibold uppercase tracking-wider mt-0.5" style={{ color }}>
            {riskLabel}
          </span>
        )}
      </div>
    </div>
  );
}
