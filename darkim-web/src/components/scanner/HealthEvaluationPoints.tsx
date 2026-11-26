import { Icons } from '@/components/ui/Icons';

interface HealthEvaluationPointsProps {
  safePoints: string[];
  warningPoints: string[];
}

/**
 * HealthEvaluationPoints
 * Modular Neo-Brutalist presentation component for safe nutrition highlights
 * and clinical health warning points.
 */
export default function HealthEvaluationPoints({
  safePoints,
  warningPoints,
}: HealthEvaluationPointsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Left Column: Safe Points (Green Checkmarks) */}
      <div className="flex flex-col gap-2.5">
        {safePoints.map((point, idx) => (
          <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm font-bold text-black leading-snug">
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500 text-white shrink-0 mt-0.5">
              <Icons.Check className="w-2.5 h-2.5 text-white" />
            </span>
            <span>{point}</span>
          </div>
        ))}
      </div>

      {/* Right Column: Warning Points (Amber Warning Icon) */}
      <div className="flex flex-col gap-2.5 md:border-l-2 md:border-black/10 md:pl-4">
        {warningPoints.map((point, idx) => (
          <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm font-bold text-black leading-snug">
            <Icons.Alert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span>{point}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
